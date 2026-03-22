# s03 TodoWrite

如果说 [s02 工具](./s02-tools.md) 解决的是“系统靠什么去做事”，  
那么这一章解决的是另一个更容易被低估的问题：

**系统怎么知道自己现在做到哪一步了？**

这一章最重要的一句话可以概括成：

**没有计划的 Agent 容易走哪算哪；先把步骤列出来，再执行。**

也就是说，TodoWrite 不是“好看一点的待办列表”，而是把计划从模型脑内拿出来，变成外部可读写状态。

## 问题

多步任务里，模型最容易出的问题，不是不会做，而是：

- 重复做已经做过的事
- 跳过关键步骤
- 对话越长越容易跑偏
- 工具结果越多，早先的计划越容易被上下文冲掉

例如一个 8 到 10 步的任务，模型可能前 2 步还很像样，后面就开始即兴发挥。  
原因通常不是“模型突然变笨”，而是：

- 原来的计划只是隐含在上下文里
- 工具输出不断堆积
- 系统里没有一个显式、可更新、可提醒的计划状态

所以这一章要解决的不是“怎么再写一个 prompt”，而是：

**怎么让 Agent 有一个自己必须面对的计划面板。**

## 解决方案

更稳的做法是加一个专门的 `todo` 工具，再配一个 `TodoManager` 来维护状态。

可以把这一层理解成：

```text
用户任务 -> 模型判断 -> 工具 + todo -> 结果回写
                           |
                           v
                    TodoManager 状态
```

它和普通工具最大的区别在于：

- `read_file`、`bash` 之类工具是在改外部世界
- `todo` 工具是在改 Agent 自己的计划状态

也就是说，TodoWrite 其实是 Agent 的“自我协调工具”。

## 一个最小 Todo 结构

最简单的 todo 项通常至少包括：

```python
todo = [
    {"id": "1", "text": "读取需求文档", "status": "pending"},
    {"id": "2", "text": "整理关键约束", "status": "pending"},
    {"id": "3", "text": "输出方案草稿", "status": "pending"},
]
```

这里最重要的不是字段多不多，而是状态是否清楚。

最常见的一套状态是：

- `pending`
- `in_progress`
- `completed`

你会发现，这和普通任务系统很像。  
区别在于：TodoWrite 更偏“当前计划面板”，而不是完整任务生命周期系统。

## 工作原理

### 1. TodoManager 负责存储和校验计划状态

参考项目里最值得保留的一个点是：

**同一时间只允许一个 `in_progress`。**

这条约束很重要，因为它会强制系统聚焦当前步骤，而不是同时声称自己在做很多事。

一个最小版本大概会是这样：

```python
class TodoManager:
    def __init__(self):
        self.items = []

    def update(self, items: list[dict]) -> str:
        validated = []
        in_progress_count = 0

        for item in items:
            status = item.get("status", "pending")
            if status == "in_progress":
                in_progress_count += 1

            validated.append({
                "id": item["id"],
                "text": item["text"],
                "status": status,
            })

        if in_progress_count > 1:
            raise ValueError("Only one task can be in_progress")

        self.items = validated
        return self.render()
```

这里你应该重点看到两件事：

- todo 不是随便一段文本，而是结构化状态
- 系统在工具层就能强制规则，而不是全靠模型自觉

### 2. `todo` 工具和其他工具一样进入 dispatch map

TodoWrite 真正重要的地方，不是它有个列表，而是它被做成了一个正式工具。

```python
TODO = TodoManager()

TOOL_HANDLERS = {
    "bash": lambda **kw: run_bash(kw["command"]),
    "read_file": lambda **kw: run_read(kw["path"], kw.get("limit")),
    "write_file": lambda **kw: run_write(kw["path"], kw["content"]),
    "edit_file": lambda **kw: run_edit(
        kw["path"],
        kw["old_text"],
        kw["new_text"],
    ),
    "todo": lambda **kw: TODO.update(kw["items"]),
}
```

这一步很关键，因为它说明：

- Todo 不是外挂 UI
- 它是 Agent 工具系统的一部分
- 模型可以像调用 `read_file` 一样调用 `todo`

所以从系统结构上说，TodoWrite 是在 [s02 工具](./s02-tools.md) 的基础上，新增了一个“面向内部协调”的专用工具。

### 3. TodoManager 需要能渲染出当前计划

如果 todo 只存状态，不输出一个可见视图，它的价值会打折。

一个很实用的渲染方式大概像这样：

```python
def render(self) -> str:
    lines = ["The Plan", ""]
    for item in self.items:
        mark = {
            "pending": "[ ]",
            "in_progress": "[>]",
            "completed": "[x]",
        }.get(item["status"], "[?]")

        lines.append(f"{mark} {item['text']}")

    return "\n".join(lines)
```

得到的结果可能像：

```text
The Plan

[x] 读取需求文档
[>] 整理关键约束
[ ] 输出方案草稿
```

这时候计划不再只是模型“记着”，而是系统每次都能把它重新呈现出来。

### 4. nag reminder 负责提醒模型别忘了更新计划

参考页里还有一个非常关键的机制：`nag reminder`。

核心思路是：

- 如果模型连续几轮都没更新 todo
- 系统就主动插入一条提醒

例如：

```python
if rounds_since_todo >= 3 and messages:
    last = messages[-1]
    if last["role"] == "user" and isinstance(last.get("content"), list):
        last["content"].insert(0, {
            "type": "text",
            "text": "<reminder>Update your todos.</reminder>",
        })
```

这个机制看起来小，但非常重要。

因为它说明：

- 计划不是“可有可无”
- 系统会对模型施加问责压力
- 如果你不更新计划，系统会追着你提醒

这比“把 todo 当一个偶尔用一下的工具”强很多。

## TodoWrite 真正新增了什么

和 [s02 工具](./s02-tools.md) 相比，这一章新增的不只是一个工具名，而是一整层“带状态的计划机制”。

| 组件 | s02 | s03 |
| --- | --- | --- |
| Tools | 4 个左右基础工具 | 多 1 个 `todo` 工具 |
| 规划 | 没有显式规划 | 带状态的 `TodoManager` |
| 约束 | 没有计划约束 | 同时只允许 1 个 `in_progress` |
| Reminder | 没有 | 多轮不更新时注入 `<reminder>` |
| Agent loop | 简单分发 | 分发外加 `rounds_since_todo` 计数 |

所以这章相对 `s02` 的关键增量，不是“工具更多了”，而是：

**系统开始管理自己的计划状态。**

## 为什么“同一时间只允许一个 in_progress”很重要

这是参考页里最值得保留的设计之一。

如果一个 Agent 在 todo 列表里同时标记很多项为 `in_progress`，通常意味着：

- 它其实没有聚焦当前步骤
- 计划面板已经失真
- 后续更难判断该先完成哪一项

所以这条规则的价值不是形式主义，而是强制系统保持顺序推进感。

它本质上是在告诉模型：

**不要假装并行做很多步，先把当前这一步完成。**

## TodoWrite 和任务系统的关系

这两个东西很像，但不是一回事。

可以这样理解：

- `TodoWrite` 更偏“给模型看的当前计划面板”
- `任务系统` 更偏“给系统调度和恢复用的执行底座”

前者重点是：

- 列步骤
- 标状态
- 让模型看到进度
- 通过 reminder 逼它维护计划

后者重点则是：

- 生命周期
- 依赖
- 重试
- 后台调度

所以更准确的说法是：

`TodoWrite 是计划层，任务系统是执行层。`

## 为什么 TodoWrite 值得单独一章

因为它是 Agent 从“会调用工具”走向“会协调自己”的第一步。

在这之前：

- 系统会做事
- 但不一定知道自己做到哪里

加了 TodoWrite 之后：

- 系统不只会做事
- 还会维护一个可见计划
- 并且在长任务里被提醒持续更新计划

这就是为什么参考项目把它单独拿出来讲，而不是顺带提一句。

## 常见误区

- 把 todo 当成纯展示列表，不接入工具系统
- 没有状态约束，让多个任务同时 `in_progress`
- 有 todo 工具，但系统从不提醒模型更新
- 待办项写得太大，一条 todo 包了好几步
- 待办项写得太细，模型一直在维护列表而不做事

## 试一试

你可以用下面几类任务测试 TodoWrite 是否真的带来了改进：

1. “重构一个 Python 文件：补 type hints、docstring 和 main guard”
2. “创建一个包含 `__init__.py`、`utils.py` 和测试文件的小包”
3. “扫描多个 Python 文件并修复风格问题”

重点观察三件事：

- 模型会不会先列步骤
- 它会不会在推进过程中更新计划
- 它连续多轮不更新时，reminder 会不会把它拉回来

## 这节真正要理解什么

- TodoWrite 不是 UI，而是 `todo` 工具 + `TodoManager` + reminder 机制
- 它的价值不是“更好看”，而是让计划变成系统状态
- “同时只能有一个 in_progress” 是一个非常实用的聚焦约束
- 和 `s02` 相比，这章真正新增的是协调能力，不是执行能力

## 小结

- TodoWrite 让 Agent 从“会做事”变成“会维护自己的执行计划”
- `todo` 工具把计划管理纳入了正式工具系统
- `TodoManager` 让计划变成结构化状态
- `nag reminder` 则让系统在长链任务里持续对计划施压

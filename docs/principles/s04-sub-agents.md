# s04 子 Agent

如果说 [s03 TodoWrite](./s03-todowrite.md) 解决的是“系统怎么维护自己的计划”，  
那么这一章解决的是另一个很现实的问题：

**当一个任务里有很多子问题时，怎么避免主上下文被它们全部污染？**

这一章最重要的一句话可以概括成：

**大任务拆小，每个子任务都用一份干净的上下文去做。**

也就是说，子 Agent 的核心价值不是“更多智能体”，而是：

- 父 Agent 只保留主线
- 子 Agent 用独立 `messages[]` 完成局部任务
- 最后只把摘要结果带回父 Agent

## 问题

Agent 工作越久，上下文就越容易变胖。  
每次读文件、跑命令、查资料的结果，如果都永久留在主 `messages[]` 里，很快会出现几个问题：

- 主上下文越来越长
- 无关细节开始淹没主任务
- 模型更容易忘记一开始到底要交付什么
- 某个子问题产生的大量中间输出，会污染整个主流程

举个简单例子：

- 父 Agent 只是想回答“这个项目用什么测试框架？”
- 但为了得出这个答案，它可能读了 5 个文件、跑了 3 条命令
- 真正需要回到主上下文里的，可能只是一句话：`pytest`

如果这些中间过程全都留在父上下文里，主 Agent 的信息密度会越来越差。

## 解决方案

更稳的办法是给父 Agent 增加一个 `task` 工具。  
父 Agent 不亲自处理所有细节，而是在需要时派出一个子 Agent：

```text
Parent agent                     Subagent
+------------------+             +------------------+
| messages=[...]   |             | messages=[]      | <-- fresh
|                  |  dispatch   |                  |
| tool: task       | ----------> | while tool_use:  |
|   prompt="..."   |             |   call tools     |
|                  |  summary    |   append results |
|   result = "..." | <---------- | return last text |
+------------------+             +------------------+
```

关键点在于：

- 父 Agent 有历史上下文
- 子 Agent 从一份全新的 `messages=[]` 开始
- 子 Agent 可以跑很多轮工具调用
- 父 Agent 最终只收到一段摘要结果

这样主上下文就能保持干净。

## 工作原理

### 1. 父 Agent 有一个 `task` 工具

参考页里最关键的设计之一是：

**`task` 是父 Agent 专有工具。**

也就是说，父 Agent 的工具集通常会比子 Agent 多一个 `task`：

```python
CHILD_TOOLS = [
    read_file_tool,
    write_file_tool,
    edit_file_tool,
    bash_tool,
    todo_tool,
]

PARENT_TOOLS = CHILD_TOOLS + [
    {
        "name": "task",
        "description": "Spawn a subagent with fresh context.",
        "input_schema": {
            "type": "object",
            "properties": {
                "prompt": {"type": "string"}
            },
            "required": ["prompt"],
        },
    }
]
```

这里有一个很重要的工程约束：

- 子 Agent 拥有基础工具
- 子 Agent **不再拥有 `task`**

也就是说，默认禁止递归生成下一层子 Agent。

这很重要，因为如果子 Agent 还能继续无限生成子 Agent，系统会很快失控。

### 2. 子 Agent 从一份全新的 `messages[]` 启动

真正的“上下文隔离”不是靠 prompt 说一句“你不要受父上下文影响”，而是：

**物理上给子 Agent 一份新的 `messages[]`。**

一个最小版本大概会是这样：

```python
def run_subagent(prompt: str) -> str:
    sub_messages = [{"role": "user", "content": prompt}]

    for _ in range(30):
        response = model.generate(
            messages=sub_messages,
            tools=CHILD_TOOLS,
        )

        sub_messages.append({
            "role": "assistant",
            "content": response.content,
        })

        if response.type != "tool_call":
            break

        results = []
        for block in response.tool_calls:
            handler = TOOL_HANDLERS.get(block.name)
            output = handler(**block.arguments)
            results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": str(output)[:50000],
            })

        sub_messages.append({
            "role": "user",
            "content": results,
        })

    return response.content or "(no summary)"
```

这里最关键的不是 Python 语法，而是这两点：

- 子 Agent 有自己的循环
- 子 Agent 的 `messages[]` 和父 Agent 完全分开

### 3. 子 Agent 跑很多轮，父 Agent 只收摘要

这是参考页里最值得保留的核心思想：

**子 Agent 可以内部跑 30 轮工具调用，但父 Agent 不需要知道这些细节。**

父 Agent 真正收到的通常只是一段普通 `tool_result`，例如：

```python
{
    "type": "tool_result",
    "tool_use_id": "task_001",
    "content": "这个项目使用 pytest 作为测试框架。",
}
```

也就是说：

- 子 Agent 内部上下文跑得再长
- 它结束后，整段 `sub_messages[]` 可以直接丢弃
- 父上下文里只留下最后的结论摘要

这就是“Clean Context Per Subtask”的真正含义。

### 4. 父 Agent 派发的是任务，不是完整历史

一个好用的子任务派发，通常不会把父 Agent 的全部历史都传过去。  
更稳的做法是只传：

- 当前子任务目标
- 必要约束
- 输出要求

例如：

```python
task_prompt = """
Read the repository and answer only this question:
What testing framework does this project use?
Return a one-line summary.
"""

summary = run_subagent(task_prompt)
```

这说明子 Agent 的设计重点不是“继承一切”，而是“最小必要上下文”。

## 为什么子 Agent 的价值首先是“干净上下文”

很多人会把子 Agent 理解成“更高级的多 Agent”。  
这不够准确。

这篇更想强调的是：

- 子 Agent 首先是一个上下文隔离机制
- 它帮助父 Agent 不被局部细节淹没
- 它把复杂任务拆成主线和支线

换句话说：

- 父 Agent 负责主线推进
- 子 Agent 负责局部探索

这和后面 [s09 Agent 团队](./s09-agent-teams.md) 的“长期角色分工”还不是一回事。

## 相对 s03 的变更

和 [s03 TodoWrite](./s03-todowrite.md) 相比，这一章真正新增的是“隔离执行单元”。

| 组件 | s03 | s04 |
| --- | --- | --- |
| Tools | 基础工具 + `todo` | 基础工具 + `todo` + `task`(仅父端) |
| 上下文 | 单一共享 | 父 / 子隔离 |
| Subagent | 没有 | 增加 `run_subagent()` |
| 返回值 | 不适用 | 子 Agent 仅返回摘要文本 |
| 历史保留 | 全在主上下文里 | 子上下文跑完后可丢弃 |

所以这一章相对 `s03` 的关键增量，不是“计划更多了”，而是：

**系统第一次有了干净的支线执行能力。**

## 子 Agent 和 Agent 团队不是一回事

这一点需要特别拎出来。

更准确的区分是：

- `子 Agent`：父 Agent 临时派出的局部执行器
- `Agent 团队`：多个长期存在、角色稳定的协作体

所以在这一章里，你应该优先把子 Agent 理解成：

- 上下文隔离
- 子任务探索
- 摘要返回

而不是一上来就往“组织协作”上想。

## 什么时候最适合用子 Agent

下面这些场景特别适合：

- 一个子问题需要读很多文件
- 一个支线任务会产生很多中间输出
- 父 Agent 只关心最终摘要，不关心细节过程
- 需要把主线和支线的上下文彻底隔开

例如：

- “用子任务找出这个项目的测试框架”
- “委派一个子任务把所有 `.py` 文件各自做一句总结”
- “让子任务先创建一个模块，再回到父 Agent 这里做验证”

## 常见误区

- 子 Agent 继承了父 Agent 全部上下文，结果根本没有隔离
- 子 Agent 也拥有 `task`，导致递归无限嵌套
- 子 Agent 返回整段原始过程，而不是摘要
- 把所有任务都拆子 Agent，导致协调成本过高
- 没有轮数上限，让子 Agent 自己越跑越远

## 试一试

你可以拿下面几类任务验证这章理解是否到位：

1. “用一个子任务找出这个仓库使用的测试框架”
2. “委派一个子任务读取所有 `.py` 文件，并分别做一句总结”
3. “让子任务创建一个新模块，然后父 Agent 回来验证它是否真的创建成功”

重点观察三件事：

- 子 Agent 是不是从干净上下文启动
- 父 Agent 收到的是不是摘要，而不是全部过程
- 子上下文结束后，有没有被直接丢弃

## 这节真正要理解什么

- 子 Agent 的第一价值不是“更强”，而是“更干净”
- 父 Agent 应该通过 `task` 工具派发子任务
- 子 Agent 应该用独立 `messages[]` 运行
- 子 Agent 最终只返回摘要文本，不把整段支线过程带回父上下文

## 小结

- 子 Agent 让复杂任务第一次拥有了干净的支线执行能力
- `task` 工具负责派发，`run_subagent()` 负责独立运行
- 子上下文和父上下文分离，是这一章最关键的工程点
- 这也是后面走向 [s08 后台任务](./s08-background-tasks.md) 和 [s09 Agent 团队](./s09-agent-teams.md) 的基础

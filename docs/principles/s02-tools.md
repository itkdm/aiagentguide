# s02 工具

如果说 [s01 Agent 循环](./s01-agent-loop.md) 解决的是“系统为什么能自己继续跑”，  
那么这一章解决的是另一个关键问题：

**系统具体靠什么去做事？**

这一章最重要的一句话可以概括成：

**加一个工具，本质上就是加一个 handler；循环本身通常不用改。**

也就是说，Agent 的执行能力不是写死在循环里的，而是挂在一层“工具分发映射”上。

## 问题

很多人做第一个 Coding Agent 时，会先给它接一个通用的 `bash` 工具。  
这当然能跑起来，但很快会暴露几个问题：

- 所有事情都被迫走 shell，职责太粗
- `cat`、`sed`、重定向这类命令在不同场景下行为并不稳定
- 特殊字符、跨平台差异、路径转义都可能让执行结果变脏
- 每次 bash 调用都在扩大系统的安全面

例如：

- “读文件”如果靠 `cat`，截断和编码不一定稳定
- “写文件”如果靠 shell heredoc，特殊字符很容易出问题
- “编辑文件”如果靠 `sed`，替换逻辑很容易误伤

这时你会发现：  
**真正的问题不是模型不会调工具，而是工具设计太粗。**

## 解决方案

更稳的办法不是把所有事都塞进 `bash`，而是把常见动作拆成专用工具，例如：

- `read_file`
- `write_file`
- `edit_file`
- `bash`

然后用一层 **dispatch map** 统一调度它们。

可以把这层理解成：

```text
用户任务 -> 模型判断 -> 工具分发层 -> 对应 handler -> 工具结果回写
```

如果用代码表示，这一层的核心就是：

```python
TOOL_HANDLERS = {
    "bash": run_bash,
    "read_file": run_read,
    "write_file": run_write,
    "edit_file": run_edit,
}
```

也就是说：

- 模型只负责决定“想调哪个工具”
- 分发层负责找到对应 handler
- handler 负责真正执行动作

这样一来，**加工具 = 加 schema + 加 handler**，而不是去改 Agent Loop 本身。

## 一个最小工具分发映射

下面这段代码就是最小的 dispatch map：

```python
def run_bash(command: str) -> str:
    ...

def run_read(path: str, limit: int | None = None) -> str:
    ...

def run_write(path: str, content: str) -> str:
    ...

def run_edit(path: str, old_text: str, new_text: str) -> str:
    ...

TOOL_HANDLERS = {
    "bash": lambda **kw: run_bash(kw["command"]),
    "read_file": lambda **kw: run_read(kw["path"], kw.get("limit")),
    "write_file": lambda **kw: run_write(kw["path"], kw["content"]),
    "edit_file": lambda **kw: run_edit(
        kw["path"],
        kw["old_text"],
        kw["new_text"],
    ),
}
```

这个结构的关键价值在于：

- 工具名和执行逻辑解耦
- 查找逻辑统一
- 循环代码不需要知道每个工具的细节

## 工作原理

### 1. 每个工具都有自己独立的处理函数

真正稳定的工具系统，不是一个“万能执行器”，而是每个工具有自己的 handler。

例如，读文件工具就应该只做“读文件”这件事：

```python
def run_read(path: str, limit: int | None = None) -> str:
    text = safe_path(path).read_text(encoding="utf-8")
    lines = text.splitlines()

    if limit and limit < len(lines):
        lines = lines[:limit]

    return "\n".join(lines)[:50000]
```

这里有几个细节很重要：

- 先做路径校验
- 再做文件读取
- 必要时做行数截断
- 最后控制最大返回长度

这比直接 `cat file` 明显更稳。

### 2. 路径沙箱是专用文件工具的重要价值


**专用文件工具不仅更方便，还能在工具层做路径沙箱。**

例如：

```python
from pathlib import Path

WORKDIR = Path.cwd().resolve()

def safe_path(p: str) -> Path:
    path = (WORKDIR / p).resolve()
    if not path.is_relative_to(WORKDIR):
        raise ValueError(f"Path escapes workspace: {p}")
    return path
```

这段代码的作用是：

- 所有路径都先映射到工作区
- 一旦发现路径逃逸工作区，就直接拒绝

也就是说，`read_file`、`write_file`、`edit_file` 这类专用工具，天然比“任意 bash”更容易做安全边界。

### 3. dispatch map 负责把工具名映射到 handler

这一步的关键不是“字典语法”，而是系统结构：

```python
TOOL_HANDLERS = {
    "bash": lambda **kw: run_bash(kw["command"]),
    "read_file": lambda **kw: run_read(kw["path"], kw.get("limit")),
    "write_file": lambda **kw: run_write(kw["path"], kw["content"]),
    "edit_file": lambda **kw: run_edit(
        kw["path"],
        kw["old_text"],
        kw["new_text"],
    ),
}
```

有了这层之后，循环里不再需要写这种东西：

```python
if tool_name == "bash":
    ...
elif tool_name == "read_file":
    ...
elif tool_name == "write_file":
    ...
```

工具一多，这种 `if / elif` 很快会失控。  
而 dispatch map 的好处是：

- 新增工具只改注册表
- 删除工具只删一项映射
- 循环保持稳定

### 4. 循环里只按名称查 handler

真正的调用逻辑反而非常简单：

```python
for block in response.tool_calls:
    handler = TOOL_HANDLERS.get(block.name)

    output = (
        handler(**block.arguments)
        if handler
        else f"Unknown tool: {block.name}"
    )

    results.append({
        "type": "tool_result",
        "tool_use_id": block.id,
        "content": output,
    })
```

你会发现，相比 [s01 Agent 循环](./s01-agent-loop.md)，循环的骨架几乎没有变。  
真正新增的是中间这层：

- 识别工具名
- 查找 handler
- 执行 handler
- 写回 `tool_result`

所以这一章最关键的理解就是：

**循环不负责知道每个工具怎么执行，循环只负责调度。**

## 一个更接近真实系统的最小版本

如果把 `safe_path`、专用工具和 dispatch map 放到一起，最小可用版本大概会是这样：

```python
from pathlib import Path

WORKDIR = Path.cwd().resolve()

def safe_path(p: str) -> Path:
    path = (WORKDIR / p).resolve()
    if not path.is_relative_to(WORKDIR):
        raise ValueError(f"Path escapes workspace: {p}")
    return path

def run_read(path: str, limit: int | None = None) -> str:
    text = safe_path(path).read_text(encoding="utf-8")
    lines = text.splitlines()
    if limit and limit < len(lines):
        lines = lines[:limit]
    return "\n".join(lines)[:50000]

def run_write(path: str, content: str) -> str:
    safe_path(path).write_text(content, encoding="utf-8")
    return f"Wrote {path}"

TOOL_HANDLERS = {
    "read_file": lambda **kw: run_read(kw["path"], kw.get("limit")),
    "write_file": lambda **kw: run_write(kw["path"], kw["content"]),
}
```

这个版本虽然简单，但已经体现了两层核心设计：

- 结构化工具
- 受控执行边界

## 相对 s01 的变更

和 [s01 Agent 循环](./s01-agent-loop.md) 相比，这一章真正新增的是工具组织方式，而不是循环本身。

| 组件 | s01 | s02 |
| --- | --- | --- |
| Tools | 1 个最小工具也能跑 | 多个专用工具并存 |
| Dispatch | 可直接写死 | 用 `TOOL_HANDLERS` 映射分发 |
| 路径安全 | 没有特别展开 | 增加 `safe_path()` 沙箱 |
| Agent loop | 最小循环 | 循环本身保持不变 |

所以这章相对 `s01` 的关键增量，不是“更复杂的 loop”，而是“更可扩展的工具层”。

## 为什么专用工具比全走 bash 更合理

不是说 `bash` 没用，而是它不应该吞掉所有职责。

一个实用判断是：

- `bash` 适合做系统命令、脚本执行、测试运行
- `read_file` 适合做稳定读取
- `write_file` 适合做受控写入
- `edit_file` 适合做定点修改

这样做的收益有三类：

- `更稳`：专用工具更容易控制输入输出
- `更安全`：更容易做路径和权限边界
- `更容易扩展`：新增工具不需要动循环

## 常见误区

- 工具全部塞进 `bash`
- 工具输入输出不结构化
- 新增工具时直接改循环逻辑
- 没有路径沙箱，文件工具可以逃逸工作区
- 只有工具 schema，没有真正稳定的 handler

## 试一试

如果你想验证这一章的理解，可以让系统依次做这些任务：

1. 读取一个文件，例如 `requirements.txt`
2. 创建一个文件，例如 `greet.py`
3. 编辑这个文件，给函数补充注释
4. 再读回来确认修改是否生效

这几步能很好地验证：

- `read_file` 是否稳定
- `write_file` 是否可控
- `edit_file` 是否真的比 shell 替换更可靠
- dispatch map 是否真的不需要改循环

## 这节真正要理解什么

- 工具层把“模型意图”和“真实执行”隔开
- 专用工具的价值不只是方便，更是安全和稳定
- dispatch map 让“加工具”变成“加 handler + 加 schema”
- 和 `s01` 相比，真正变的是工具层，不是循环本身

## 小结

- Agent 的执行能力来自工具，不是来自模型本身
- 工具做得好不好，决定了系统是不是可控
- dispatch map 是把工具系统做得可扩展的关键结构
- 后面讲 [s03 TodoWrite](./s03-todowrite.md)、[s07 任务系统](./s07-task-system.md) 和 [s08 后台任务](./s08-background-tasks.md) 时，都会继续建立在这层工具执行能力之上

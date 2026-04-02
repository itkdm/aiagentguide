---
title: Prebuilt middleware
description: 常见 Agent 场景的预构建 middleware
---

# Prebuilt middleware

LangChain 和 [Deep Agents](https://docs.langchain.com/oss/python/deepagents/overview) 提供了许多可直接使用的 middleware，覆盖大多数常见 Agent 需求。这些 middleware 通常已经面向生产环境设计，并且支持配置。

## Provider-agnostic middleware

以下 middleware 与具体 LLM provider 无关，适用于大多数模型：

- Summarization
- Human-in-the-loop
- Model call limit
- Tool call limit
- Model fallback
- PII detection
- To-do list
- LLM tool selector
- Tool retry
- Model retry
- LLM tool emulator
- Context editing
- Shell tool
- File search
- Filesystem middleware
- Subagent

### Summarization

用于在接近 token 上限时自动总结对话历史。它会保留最近消息，同时压缩更早的内容。

适用场景：

- 长时间对话
- 多轮上下文很长的应用
- 希望保留历史信息，但又不能让上下文无限增长

### Python

```python
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware

agent = create_agent(
    model="gpt-4.1",
    tools=[your_weather_tool, your_calculator_tool],
    middleware=[
        SummarizationMiddleware(
            model="gpt-4.1-mini",
            trigger=("tokens", 4000),
            keep=("messages", 20),
        ),
    ],
)
```

### Human-in-the-loop

在工具执行前暂停 Agent，等待人工审批、修改或拒绝工具调用。

适合：

- 高风险操作
- 合规审查
- 需要人工监督的流程

### Python

```python
from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    model="gpt-4.1",
    tools=[your_read_email_tool, your_send_email_tool],
    checkpointer=InMemorySaver(),
    middleware=[
        HumanInTheLoopMiddleware(
            interrupt_on={
                "your_send_email_tool": {
                    "allowed_decisions": ["approve", "edit", "reject"],
                },
                "your_read_email_tool": False,
            }
        ),
    ],
)
```

### Model call limit

限制模型调用次数，防止无限循环或成本失控。

### Python

```python
from langchain.agents import create_agent
from langchain.agents.middleware import ModelCallLimitMiddleware
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    model="gpt-4.1",
    checkpointer=InMemorySaver(),
    tools=[],
    middleware=[
        ModelCallLimitMiddleware(
            thread_limit=10,
            run_limit=5,
            exit_behavior="end",
        ),
    ],
)
```

### Tool call limit

限制工具调用次数，可用于控制昂贵 API、数据库访问或防止 Agent 工具循环失控。

通常你可以：

- 限制全部工具总调用次数
- 限制某个特定工具的调用次数
- 配合不同 `exit_behavior` 控制超限后是优雅结束还是抛错

### Model fallback

当主模型失败时自动切换到备用模型。

适合：

- 主模型偶发失败
- 某些 provider 不稳定时需要兜底
- 生产环境下增强可用性

### PII detection

用于检测和处理个人敏感信息，例如：

- 邮箱
- 电话号码
- 身份证号
- 信用卡号

它可以帮助你在模型调用前后对敏感信息做屏蔽、替换或拦截。

### To-do list

给 Agent 增加任务规划和跟踪能力。适合复杂多步任务，尤其适合需要显式列出子任务并逐项完成的场景。

### LLM tool selector

在调用主模型之前，先用一个 LLM 从候选工具中挑出最相关的一部分工具，再交给主模型使用。

好处：

- 缩短 prompt
- 提高工具选择准确率
- 降低无关工具干扰

### Tool retry

对失败的工具调用自动重试，通常配合指数退避使用。适合外部 API 偶发失败、网络波动等情况。

### Model retry

对模型调用失败自动重试。和 tool retry 类似，但作用对象是模型调用本身。

### LLM tool emulator

用 LLM 来模拟工具执行，通常用于测试或没有真实工具实现时的替代方案。

### Context editing

当上下文接近上限时，对旧的 tool use 内容进行清理或压缩，避免工具输出过长而快速占满上下文窗口。

最典型的做法是清理较早的工具输出，同时保留最近若干条工具结果。

### Python

```python
from langchain.agents import create_agent
from langchain.agents.middleware import ContextEditingMiddleware, ClearToolUsesEdit

agent = create_agent(
    model="gpt-4.1",
    tools=[search_tool, your_calculator_tool, database_tool],
    middleware=[
        ContextEditingMiddleware(
            edits=[
                ClearToolUsesEdit(
                    trigger=2000,
                    keep=3,
                    clear_tool_inputs=False,
                    exclude_tools=[],
                    placeholder="[cleared]",
                ),
            ],
        ),
    ],
)
```

### Shell tool

给 Agent 暴露一个持久 shell 会话，用于执行命令。

适合：

- 开发与部署自动化
- 测试与验证
- 文件系统操作
- 需要执行脚本的 Agent

> [!WARNING]
> Shell tool 存在明显安全风险。应根据部署环境选择合适的执行策略，例如 `HostExecutionPolicy`、`DockerExecutionPolicy` 或 `CodexSandboxExecutionPolicy`。

### File search

提供基于文件系统的 Glob / Grep 搜索能力，适合代码探索与大型代码库分析。

### Python

```python
from langchain.agents import create_agent
from langchain.agents.middleware import FilesystemFileSearchMiddleware

agent = create_agent(
    model="gpt-4.1",
    tools=[],
    middleware=[
        FilesystemFileSearchMiddleware(
            root_path="/workspace",
            use_ripgrep=True,
        ),
    ],
)
```

常见配置：

- `root_path`
- `use_ripgrep`
- `max_file_size_mb`

### Filesystem middleware

`FilesystemMiddleware` 让 Agent 通过文件系统来管理上下文和长期记忆。

它通常会提供以下工具：

- `ls`
- `read_file`
- `write_file`
- `edit_file`

默认情况下，这些工具写入的是 graph state 中的短期“文件系统”。如果你希望某些路径跨 thread 持久化，可以用 `CompositeBackend` 把某些目录路由到 `StoreBackend`。

### Subagent

Subagent middleware 允许主 Agent 把某些任务转交给子 Agent，从而把复杂任务的上下文隔离开，避免主管理 Agent 的上下文窗口膨胀。

子 Agent 一般由以下信息定义：

- `name`
- `description`
- `system prompt`
- `tools`
- 可选 `model`
- 可选 `middleware`

你也可以把一个预构建的 LangGraph graph 作为 subagent 提供进去。

## Provider-specific middleware

这类 middleware 针对特定 provider 做了优化，常见包括：

- Anthropic
- AWS
- OpenAI

如果你使用的是这些 provider，建议再查看各自对应的 integration 页面，了解它们专属 middleware 的能力和配置方式。

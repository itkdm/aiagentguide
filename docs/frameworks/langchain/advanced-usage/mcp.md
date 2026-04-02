---
title: Model Context Protocol (MCP)
description: 在 LangChain Agent 中接入 MCP 服务器上的工具、资源和提示
---

# Model Context Protocol (MCP)

Model Context Protocol（MCP）是一个开放协议，用于标准化应用如何向 LLM 提供工具和上下文。LangChain Agent 可以通过 `langchain-mcp-adapters`（Python）使用 MCP 服务器上定义的工具。

## 快速开始

安装适配器库：

```bash
pip install langchain-mcp-adapters
```

这些适配器让 Agent 能够使用一个或多个 MCP 服务器暴露出来的工具。

> [!NOTE]
> `MultiServerMCPClient` 默认是无状态的。每次工具调用都会创建新的 MCP `ClientSession`，调用结束后再清理。若你需要持久会话，请看后文的“有状态会话”。

示例：同时接入多个 MCP 服务器。

```python
import asyncio
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent

async def main():
    client = MultiServerMCPClient(
        {
            "math": {
                "transport": "stdio",
                "command": "python",
                "args": ["/path/to/math_server.py"],
            },
            "weather": {
                "transport": "http",
                "url": "http://localhost:8000/mcp",
            }
        }
    )

    tools = await client.get_tools()
    agent = create_agent("claude-sonnet-4-6", tools)

    math_response = await agent.ainvoke(
        {"messages": [{"role": "user", "content": "（3 + 5）乘以 12 等于多少？"}]}
    )
    weather_response = await agent.ainvoke(
        {"messages": [{"role": "user", "content": "纽约现在天气怎么样？"}]}
    )
    print(math_response)
    print(weather_response)

if __name__ == "__main__":
    asyncio.run(main())
```

## 自定义服务器

如果你要自己写 MCP 服务器：

- Python 侧通常使用 `FastMCP`

例如，一个简单的数学服务器可以暴露 `add` 和 `multiply` 两个工具：

```python
from fastmcp import FastMCP

mcp = FastMCP("Math")

@mcp.tool()
def add(a: int, b: int) -> int:
    """两数相加"""
    return a + b

@mcp.tool()
def multiply(a: int, b: int) -> int:
    """两数相乘"""
    return a * b

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

## 传输方式

MCP 支持多种客户端与服务端通信方式。

### HTTP

`http`（也常称为 `streamable-http`）通过 HTTP 请求进行通信：

```python
client = MultiServerMCPClient(
    {
        "weather": {
            "transport": "http",
            "url": "http://localhost:8000/mcp",
        }
    }
)
```

你还可以在 HTTP 连接里传自定义请求头，例如认证或链路追踪信息：

```python
client = MultiServerMCPClient(
    {
        "weather": {
            "transport": "http",
            "url": "http://localhost:8000/mcp",
            "headers": {
                "Authorization": "Bearer YOUR_TOKEN",
                "X-Custom-Header": "custom-value"
            },
        }
    }
)
```

Python 侧还支持通过 `httpx.Auth` 实现自定义认证逻辑。

### stdio

`stdio` 由客户端拉起服务端子进程，并通过标准输入输出通信，适合本地工具和简单集成：

```python
client = MultiServerMCPClient(
    {
        "math": {
            "transport": "stdio",
            "command": "python",
            "args": ["/path/to/math_server.py"],
        }
    }
)
```

## 有状态会话

默认情况下，`MultiServerMCPClient` 是无状态的。如果你需要控制 MCP 会话生命周期，例如服务端需要在多次调用之间保留上下文，可以显式创建持久 `ClientSession`：

```python
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools
from langchain.agents import create_agent

client = MultiServerMCPClient({...})

async with client.session("server_name") as session:
    tools = await load_mcp_tools(session)
    agent = create_agent(
        "anthropic:claude-3-7-sonnet-latest",
        tools
    )
```

## 核心能力

### 工具

MCP 服务器可以暴露可执行工具。LangChain 会把这些 MCP 工具转换成 LangChain [tools](/frameworks/langchain/core-components/tools)，从而可直接在 Agent 或工作流中使用。

加载工具的基本方式：

```python
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent

client = MultiServerMCPClient({...})
tools = await client.get_tools()
agent = create_agent("claude-sonnet-4-6", tools)
```

### 结构化内容

MCP 工具除了返回文本结果，还可以返回 `structuredContent`。这适用于工具既要给模型展示可读文本，又要返回机器可解析结构化数据的场景。

适配器会把结构化内容包装进 `artifact` 中，你可以在 `ToolMessage` 上读取它。

### 多模态内容

MCP 工具还可以返回图片、文本等多模态内容。适配器会把这些结果转换成 LangChain 的标准内容块，便于后续 Agent 消费。

### 资源

MCP 服务器还可以提供资源（resources），用于暴露只读数据源，例如文档、配置或文件内容。

### 提示

MCP 服务器也能提供 prompts。你可以通过 `client.get_prompt()` 直接加载：

```python
from langchain_mcp_adapters.client import MultiServerMCPClient

client = MultiServerMCPClient({...})

messages = await client.get_prompt("server_name", "summarize")
messages = await client.get_prompt(
    "server_name",
    "code_review",
    arguments={"language": "python", "focus": "security"}
)
```

## 高级能力

### 工具拦截器

MCP 服务器本身运行在独立进程中，天然拿不到 LangGraph 的运行时信息，例如：

- store
- context
- agent state

**拦截器（interceptors）** 正是用来弥合这个缺口的。它们允许你在 MCP 工具执行期间访问运行时上下文，并像 middleware 一样修改请求、重试、动态加头、甚至直接短路返回。

常见用途包括：

- 从 runtime context 中注入用户 ID、API Key
- 从 store 中读取用户偏好并改写请求参数
- 根据 state 拦截敏感工具调用
- 返回 `Command` 更新状态或跳转图执行流程

示例：未认证时拦截敏感工具。

```python
from langchain_mcp_adapters.interceptors import MCPToolCallRequest
from langchain.messages import ToolMessage

async def require_authentication(request: MCPToolCallRequest, handler):
    runtime = request.runtime
    state = runtime.state
    is_authenticated = state.get("authenticated", False)

    sensitive_tools = ["delete_file", "update_settings", "export_data"]

    if request.name in sensitive_tools and not is_authenticated:
        return ToolMessage(
            content="需要先完成认证后才能执行该操作。",
            tool_call_id=runtime.tool_call_id,
        )

    return await handler(request)
```

### 状态更新与 `Command`

拦截器也可以返回 `Command`，用于更新 Agent 状态或控制图执行流：

```python
from langgraph.types import Command

async def handle_task_completion(request: MCPToolCallRequest, handler):
    result = await handler(request)

    if request.name == "submit_order":
        return Command(
            update={
                "messages": [result],
                "task_status": "completed",
            },
            goto="summary_agent",
        )

    return result
```

### 进度通知

对于长时间运行的工具，你可以订阅服务端的进度回调：

```python
from langchain_mcp_adapters.callbacks import Callbacks, CallbackContext

async def on_progress(progress, total, message, context: CallbackContext):
    percent = (progress / total * 100) if total else progress
    print(f"[{context.server_name}] 进度：{percent:.1f}% - {message}")
```

### 日志

MCP 协议支持服务端向客户端发送日志通知。你可以通过回调订阅这些日志事件。

### Elicitation

Elicitation 允许 MCP 服务器在工具执行过程中向用户追加请求输入，而不是要求在最开始就把所有参数一次性提供完整。

服务器侧可通过 `ctx.elicit()` 发起请求，客户端侧则通过回调返回三类动作：

- `accept`：用户提供了有效输入
- `decline`：用户拒绝提供
- `cancel`：用户取消整个操作

## 额外资源

- [MCP 官方文档](https://modelcontextprotocol.io/introduction)
- [MCP Transport 文档](https://modelcontextprotocol.io/docs/concepts/transports)
- [langchain-mcp-adapters](https://github.com/langchain-ai/langchain-mcp-adapters)

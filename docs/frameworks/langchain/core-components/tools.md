---
title: Tools
---

# Tools

Tools 扩展了 [Agents](/frameworks/langchain/core-components/agents) 的能力，让它们能够获取实时数据、执行代码、查询外部数据库，以及在现实世界中执行动作。

从底层看，tool 就是一个具有明确输入输出定义的可调用函数，它会被传给 [chat model](/frameworks/langchain/core-components/models)。模型会根据对话上下文决定何时调用某个工具，以及传入什么参数。

> [!TIP]
> 如果你想了解模型是如何处理工具调用的，可以查看 [Tool calling](/frameworks/langchain/core-components/models#tool-calling)。

## 创建工具

### 基础工具定义

### Python

```python
from langchain.tools import tool

@tool
def search_database(query: str, limit: int = 10) -> str:
    """在客户数据库中搜索与查询匹配的记录。

    Args:
        query: 要搜索的关键词
        limit: 返回结果的最大数量
    """
    return f"找到 {limit} 条与“{query}”相关的结果"
```

在 Python 中，最简单的方式是使用 `@tool` 装饰器。函数的 docstring 会默认成为工具描述，帮助模型理解这个工具的用途。

类型注解是**必须的**，因为它们会定义工具的输入 schema。docstring 应该尽量清晰简洁，让模型知道什么时候应该调用这个工具。

### 自定义工具属性

#### 自定义工具名称

### Python

```python
@tool("web_search")
def search(query: str) -> str:
    """搜索网络信息。"""
    return f"搜索结果：{query}"

print(search.name)
```

#### 自定义工具描述

### Python

```python
@tool("calculator", description="执行算术计算。遇到数学问题时请使用此工具。")
def calc(expression: str) -> str:
    """计算数学表达式。"""
    return str(eval(expression))
```

### 高级 schema 定义

### Python: Pydantic

```python
from pydantic import BaseModel, Field
from typing import Literal
from langchain.tools import tool

class WeatherInput(BaseModel):
    """天气查询输入。"""
    location: str = Field(description="城市名或坐标")
    units: Literal["celsius", "fahrenheit"] = Field(
        default="celsius",
        description="温度单位偏好"
    )
    include_forecast: bool = Field(
        default=False,
        description="是否包含 5 天天气预报"
    )

@tool(args_schema=WeatherInput)
def get_weather(location: str, units: str = "celsius", include_forecast: bool = False) -> str:
    """获取当前天气以及可选预报。"""
    temp = 22 if units == "celsius" else 72
    result = f"{location} 当前天气：{temp} 度"
    if include_forecast:
        result += "\n未来 5 天：晴"
    return result
```

### Python: JSON Schema

```python
weather_schema = {
    "type": "object",
    "properties": {
        "location": {"type": "string"},
        "units": {"type": "string"},
        "include_forecast": {"type": "boolean"}
    },
    "required": ["location", "units", "include_forecast"]
}

@tool(args_schema=weather_schema)
def get_weather(location: str, units: str = "celsius", include_forecast: bool = False) -> str:
    """获取当前天气以及可选预报。"""
    temp = 22 if units == "celsius" else 72
    result = f"{location} 当前天气：{temp} 度"
    if include_forecast:
        result += "\n未来 5 天：晴"
    return result
```

### 保留参数名

以下参数名是保留字段，不能直接作为工具参数使用：

| 参数名 | 作用 |
|---|---|
| `config` | LangChain 内部保留，用于传递 `RunnableConfig` |
| `runtime` | 保留给 `ToolRuntime`，用于访问 state、context、store |

如果你需要访问运行时信息，请使用 `ToolRuntime`。

## 访问上下文

当工具可以访问运行时信息，例如对话历史、用户身份和持久化记忆时，它们会变得更强大。

### 短期记忆（State）

State 表示当前对话中的短期记忆。它包括消息历史，以及你在 graph state 中定义的其他字段。

#### 读取 state

### Python

```python
from langchain.tools import tool, ToolRuntime
from langchain.messages import HumanMessage

@tool
def get_last_user_message(runtime: ToolRuntime) -> str:
    """获取最近一条用户消息。"""
    messages = runtime.state["messages"]

    for message in reversed(messages):
        if isinstance(message, HumanMessage):
            return message.content

    return "没有找到用户消息"

@tool
def get_user_preference(pref_name: str, runtime: ToolRuntime) -> str:
    """读取某个用户偏好。"""
    preferences = runtime.state.get("user_preferences", {})
    return preferences.get(pref_name, "未设置")
```

#### 更新 state

### Python

```python
from langgraph.types import Command
from langchain.tools import tool

@tool
def set_user_name(new_name: str) -> Command:
    """在对话 state 中设置用户名。"""
    return Command(update={"user_name": new_name})
```

### Context

Context 是在调用时传入的不可变配置。适合用来存放 user ID、session 信息或应用级配置。

### Python

```python
from dataclasses import dataclass
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain.tools import tool, ToolRuntime

USER_DATABASE = {
    "user123": {
        "name": "Alice Johnson",
        "account_type": "Premium",
        "balance": 5000,
        "email": "alice@example.com"
    }
}

@dataclass
class UserContext:
    user_id: str

@tool
def get_account_info(runtime: ToolRuntime[UserContext]) -> str:
    """获取当前用户的账户信息。"""
    user_id = runtime.context.user_id
    user = USER_DATABASE.get(user_id)
    if user:
        return f"账户持有人：{user['name']}\n类型：{user['account_type']}\n余额：${user['balance']}"
    return "未找到用户"

model = ChatOpenAI(model="gpt-4.1")
agent = create_agent(
    model,
    tools=[get_account_info],
    context_schema=UserContext,
    system_prompt="你是一位金融助手。"
)
```

### 长期记忆（Store）

`BaseStore` 提供跨会话持久化存储。与 state 不同，store 中的数据可以在未来会话中继续使用。

### Python

```python
from typing import Any
from langgraph.store.memory import InMemoryStore
from langchain.agents import create_agent
from langchain.tools import tool, ToolRuntime
from langchain_openai import ChatOpenAI

@tool
def get_user_info(user_id: str, runtime: ToolRuntime) -> str:
    """读取用户信息。"""
    store = runtime.store
    user_info = store.get(("users",), user_id)
    return str(user_info.value) if user_info else "未知用户"

@tool
def save_user_info(user_id: str, user_info: dict[str, Any], runtime: ToolRuntime) -> str:
    """保存用户信息。"""
    store = runtime.store
    store.put(("users",), user_id, user_info)
    return "用户信息保存成功。"

model = ChatOpenAI(model="gpt-4.1")
store = InMemoryStore()
agent = create_agent(model, tools=[get_user_info, save_user_info], store=store)
```

### Stream writer

对于耗时较长的工具，你可以在执行过程中持续发出自定义进度更新。

### Python

```python
from langchain.tools import tool, ToolRuntime

@tool
def get_weather(city: str, runtime: ToolRuntime) -> str:
    """获取指定城市天气。"""
    writer = runtime.stream_writer
    writer(f"正在查询城市：{city}")
    writer(f"已获取城市数据：{city}")
    return f"{city} 总是阳光明媚！"
```

## ToolNode

`ToolNode` 是 LangGraph 中预构建的节点，用于执行工具。它可以自动处理并行工具执行、错误处理以及 state 注入。

### 基础用法

### Python

```python
from langchain.tools import tool
from langgraph.prebuilt import ToolNode
from langgraph.graph import StateGraph, MessagesState

@tool
def search(query: str) -> str:
    """搜索信息。"""
    return f"搜索结果：{query}"

@tool
def calculator(expression: str) -> str:
    """计算数学表达式。"""
    return str(eval(expression))

tool_node = ToolNode([search, calculator])
builder = StateGraph(MessagesState)
builder.add_node("tools", tool_node)
```

### 工具返回值

工具通常有三种常见返回方式：

- 返回 `string`
- 返回 `object`
- 返回 `Command`

#### 返回字符串

适合输出本身就是给模型看的自然语言文本。

#### 返回对象

适合输出本身是结构化数据，需要模型按字段理解时使用。

#### 返回 Command

当工具不仅要返回结果，还需要更新 graph state 时，应返回 `Command`。

### 错误处理

### Python

```python
from langgraph.prebuilt import ToolNode

tool_node = ToolNode(tools)
tool_node = ToolNode(tools, handle_tool_errors=True)
tool_node = ToolNode(tools, handle_tool_errors="出错了，请重试。")

def handle_error(e: ValueError) -> str:
    return f"无效输入：{e}"

tool_node = ToolNode(tools, handle_tool_errors=handle_error)
tool_node = ToolNode(tools, handle_tool_errors=(ValueError, TypeError))
```

### 使用 tools_condition 路由

### Python

```python
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.graph import StateGraph, MessagesState, START

builder = StateGraph(MessagesState)
builder.add_node("llm", call_llm)
builder.add_node("tools", ToolNode(tools))
builder.add_edge(START, "llm")
builder.add_conditional_edges("llm", tools_condition)
builder.add_edge("tools", "llm")
graph = builder.compile()
```

### State 注入

### Python

```python
from langchain.tools import tool, ToolRuntime
from langgraph.prebuilt import ToolNode

@tool
def get_message_count(runtime: ToolRuntime) -> str:
    """获取当前对话中的消息数量。"""
    messages = runtime.state["messages"]
    return f"当前共有 {len(messages)} 条消息。"

tool_node = ToolNode([get_message_count])
```

## 预构建工具

LangChain 提供了大量预构建的工具与工具包，覆盖网络搜索、代码执行、数据库访问等常见需求。完整列表请查看官方的 tools and toolkits 集成页面。

## 服务端工具使用

某些 chat model 具有由 provider 在服务端执行的内建工具，例如 web search、code interpreter。它们不需要你自己定义或托管工具逻辑。

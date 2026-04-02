---
title: Runtime
---

# Runtime

## 概览

`create_agent` 底层运行在 LangGraph runtime 之上。

LangGraph 暴露了一个 `Runtime` 对象，其中通常包含以下信息：

1. **Context**：本次调用的静态信息，例如用户 ID、数据库连接或其他依赖
2. **Store**：一个 `BaseStore` 实例，用于 [long-term memory](/frameworks/langchain/advanced-usage/long-term-memory)
3. **Stream writer**：用于通过 `"custom"` stream mode 输出自定义流式更新

> [!TIP]
> Runtime context 本质上是一种依赖注入机制。  
> 不必把数据库连接、用户信息或配置硬编码在全局状态中，而是可以在调用 Agent 时注入进去，再在 tools 和 middleware 中访问。

你可以在：

- tools 内部访问 runtime
- middleware 内部访问 runtime

## 访问方式

在创建 Agent 时，你可以通过 `context_schema` 定义 runtime context 的结构。

调用 Agent 时，再把 `context` 一起传入。

### Python

```python
from dataclasses import dataclass
from langchain.agents import create_agent

@dataclass
class Context:
    user_name: str

agent = create_agent(
    model="gpt-5-nano",
    tools=[...],
    context_schema=Context
)

agent.invoke(
    {"messages": [{"role": "user", "content": "我叫什么名字？"}]},
    context=Context(user_name="John Smith")
)
```

## 在 tools 中访问 runtime

在工具内部，你可以通过 runtime 获取：

- context
- store
- stream writer

### Python

```python
from dataclasses import dataclass
from langchain.tools import tool, ToolRuntime

@dataclass
class Context:
    user_id: str

@tool
def fetch_user_email_preferences(runtime: ToolRuntime[Context]) -> str:
    """从 store 中读取用户邮件偏好。"""
    user_id = runtime.context.user_id

    preferences = "用户偏好简短且礼貌的邮件。"
    if runtime.store:
        if memory := runtime.store.get(("users",), user_id):
            preferences = memory.value["preferences"]

    return preferences
```

## 在 middleware 中访问 runtime

你也可以在 middleware 中基于 runtime 构建动态 prompt、改写消息或调整 Agent 行为。

### Python

```python
from dataclasses import dataclass
from langchain.agents import create_agent, AgentState
from langchain.agents.middleware import dynamic_prompt, ModelRequest, before_model, after_model
from langgraph.runtime import Runtime

@dataclass
class Context:
    user_name: str

@dynamic_prompt
def dynamic_system_prompt(request: ModelRequest) -> str:
    user_name = request.runtime.context.user_name
    return f"你是一位乐于助人的助手。请称呼用户为 {user_name}。"

@before_model
def log_before_model(state: AgentState, runtime: Runtime[Context]) -> dict | None:
    print(f"正在处理用户请求：{runtime.context.user_name}")
    return None

@after_model
def log_after_model(state: AgentState, runtime: Runtime[Context]) -> dict | None:
    print(f"已完成用户请求：{runtime.context.user_name}")
    return None

agent = create_agent(
    model="gpt-5-nano",
    tools=[...],
    middleware=[dynamic_system_prompt, log_before_model, log_after_model],
    context_schema=Context
)
```

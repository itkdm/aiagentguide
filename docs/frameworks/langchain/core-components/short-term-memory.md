---
title: Short-term memory
---

# Short-term memory

## 概览

Memory 是让系统记住过去交互信息的机制。对于 AI Agent 来说，memory 很重要，因为它让 Agent 能记住之前的对话、从反馈中学习，并适应用户偏好。

短期记忆（short-term memory）用于让应用在**同一个 thread 或同一段对话**中保留上下文。

> [!NOTE]
> thread 可以理解为一个会话内的连续交互，类似于邮箱里一封邮件线程中的多条往来消息。

对话历史是最常见的短期记忆形式。但长对话对今天的大多数 LLM 都是挑战：

- 完整历史可能塞不进上下文窗口
- 即使能塞进去，模型在长上下文中的表现通常也会下降
- 模型会被过期或无关内容干扰
- 响应时间和成本也会提高

Chat model 通过 [messages](/frameworks/langchain/core-components/messages) 接收上下文。随着人类输入与模型回复不断累积，消息列表会持续变长。因此很多应用都需要某种“遗忘”机制来删除或压缩旧信息。

> [!TIP]
> 如果你需要跨会话保留信息，而不只是同一段对话内记忆，请使用 [long-term memory](/frameworks/langchain/advanced-usage/long-term-memory)。

## 用法

要为 Agent 增加短期记忆，也就是 thread 级持久化，你需要在创建 Agent 时指定 `checkpointer`。

> [!INFO]
> LangChain 会把短期记忆作为 Agent state 的一部分来管理。  
> 这些 state 会通过 checkpointer 保存到内存或数据库中，因此同一个 thread 可以随时恢复。

### Python

```python
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    "gpt-5",
    tools=[get_user_info],
    checkpointer=InMemorySaver(),
)

agent.invoke(
    {"messages": [{"role": "user", "content": "你好！我叫 Bob。"}]},
    {"configurable": {"thread_id": "1"}},
)
```

### 生产环境

在生产环境中，应该使用基于数据库的 checkpointer。

### Python

```bash
pip install langgraph-checkpoint-postgres
```

```python
from langchain.agents import create_agent
from langgraph.checkpoint.postgres import PostgresSaver

DB_URI = "postgresql://postgres:postgres@localhost:5442/postgres?sslmode=disable"

with PostgresSaver.from_conn_string(DB_URI) as checkpointer:
    checkpointer.setup()
    agent = create_agent(
        "gpt-5",
        tools=[get_user_info],
        checkpointer=checkpointer,
    )
```

## 自定义 Agent memory

默认情况下，Agent 使用 `AgentState` 管理短期记忆，其中最重要的字段是 `messages`。你也可以扩展 state schema，增加额外字段。

### Python

```python
from langchain.agents import create_agent, AgentState
from langgraph.checkpoint.memory import InMemorySaver

class CustomAgentState(AgentState):
    user_id: str
    preferences: dict

agent = create_agent(
    "gpt-5",
    tools=[get_user_info],
    state_schema=CustomAgentState,
    checkpointer=InMemorySaver(),
)
```

## 常见模式

长对话可能会超过 LLM 的上下文窗口。常见解决方案有：

- 裁剪消息
- 删除消息
- 总结消息
- 自定义策略，例如过滤消息

### 裁剪消息

在 Agent 中，你可以通过 `before_model` middleware 在模型调用前裁剪消息。

### Python

```python
from langchain.messages import RemoveMessage
from langgraph.graph.message import REMOVE_ALL_MESSAGES
from langgraph.checkpoint.memory import InMemorySaver
from langchain.agents import create_agent, AgentState
from langchain.agents.middleware import before_model
from langgraph.runtime import Runtime
from typing import Any

@before_model
def trim_messages(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
    """只保留最近几条消息，避免超过上下文窗口。"""
    messages = state["messages"]
    if len(messages) <= 3:
        return None

    first_msg = messages[0]
    recent_messages = messages[-3:] if len(messages) % 2 == 0 else messages[-4:]
    new_messages = [first_msg] + recent_messages

    return {
        "messages": [
            RemoveMessage(id=REMOVE_ALL_MESSAGES),
            *new_messages
        ]
    }
```

### 删除消息

你也可以直接从 graph state 中删除消息。这适合在你明确知道哪些消息不再需要时使用。

### Python

```python
from langchain.messages import RemoveMessage

def delete_messages(state):
    messages = state["messages"]
    if len(messages) > 2:
        return {"messages": [RemoveMessage(id=m.id) for m in messages[:2]]}
```

如果你想删除**全部**消息：

```python
from langgraph.graph.message import REMOVE_ALL_MESSAGES
from langchain.messages import RemoveMessage

def delete_messages(state):
    return {"messages": [RemoveMessage(id=REMOVE_ALL_MESSAGES)]}
```

### 总结消息

裁剪或删除消息会直接丢失信息，因此很多应用会选择把旧消息总结成摘要，再保留摘要而不是原文。

### Python

```python
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    model="gpt-4.1",
    tools=[],
    middleware=[
        SummarizationMiddleware(
            model="gpt-4.1-mini",
            trigger=("tokens", 4000),
            keep=("messages", 20)
        )
    ],
    checkpointer=InMemorySaver(),
)
```

## 访问 memory

### 在工具中读取短期记忆

### Python

```python
from langchain.agents import create_agent, AgentState
from langchain.tools import tool, ToolRuntime

class CustomState(AgentState):
    user_id: str

@tool
def get_user_info(runtime: ToolRuntime) -> str:
    """读取用户信息。"""
    user_id = runtime.state["user_id"]
    return "用户是 John Smith" if user_id == "user_123" else "未知用户"
```

### 从工具中写入短期记忆

### Python

```python
from langchain.tools import tool, ToolRuntime
from langchain.messages import ToolMessage
from langchain.agents import AgentState
from langgraph.types import Command
from pydantic import BaseModel

class CustomState(AgentState):
    user_name: str

class CustomContext(BaseModel):
    user_id: str

@tool
def update_user_info(runtime: ToolRuntime[CustomContext, CustomState]) -> Command:
    """查询并更新用户信息。"""
    user_id = runtime.context.user_id
    name = "John Smith" if user_id == "user_123" else "未知用户"
    return Command(update={
        "user_name": name,
        "messages": [
            ToolMessage("用户信息查询成功", tool_call_id=runtime.tool_call_id)
        ]
    })
```

### 在 prompt 中访问短期记忆

### Python

```python
from typing import TypedDict
from langchain.agents.middleware import dynamic_prompt, ModelRequest

class CustomContext(TypedDict):
    user_name: str

@dynamic_prompt
def dynamic_system_prompt(request: ModelRequest) -> str:
    user_name = request.runtime.context["user_name"]
    return f"你是一位乐于助人的助手。请称呼用户为 {user_name}。"
```

### before_model / after_model

你可以在 `before_model` middleware 中处理消息，在模型调用前裁剪、重写或补充上下文；也可以在 `after_model` 中删除不合规回复或做输出清理。

### Python

```python
from langchain.messages import RemoveMessage
from langgraph.checkpoint.memory import InMemorySaver
from langchain.agents import create_agent, AgentState
from langchain.agents.middleware import after_model
from langgraph.runtime import Runtime

@after_model
def validate_response(state: AgentState, runtime: Runtime) -> dict | None:
    """移除包含敏感词的消息。"""
    STOP_WORDS = ["password", "secret"]
    last_message = state["messages"][-1]
    if any(word in last_message.content for word in STOP_WORDS):
        return {"messages": [RemoveMessage(id=last_message.id)]}
    return None

agent = create_agent(
    model="gpt-5-nano",
    tools=[],
    middleware=[validate_response],
    checkpointer=InMemorySaver(),
)
```

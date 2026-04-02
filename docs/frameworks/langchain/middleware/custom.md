---
title: Custom middleware
---

# Custom middleware

你可以通过实现 hook，在 Agent 执行流的特定节点插入自己的逻辑，从而构建自定义 middleware。

## Hooks

Middleware 提供两类 hook：

- Node-style hooks
- Wrap-style hooks

### Node-style hooks

按顺序在固定执行点运行，适合：

- 日志
- 校验
- state 更新

可用 hook：

- Python：`before_agent`、`before_model`、`after_model`、`after_agent`

### Python

```python
from langchain.agents.middleware import before_model, after_model, AgentState
from langchain.messages import AIMessage
from langgraph.runtime import Runtime
from typing import Any

@before_model(can_jump_to=["end"])
def check_message_limit(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
    if len(state["messages"]) >= 50:
        return {
            "messages": [AIMessage("对话上限已达到。")],
            "jump_to": "end"
        }
    return None

@after_model
def log_response(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
    print(f"模型返回：{state['messages'][-1].content}")
    return None
```

### Wrap-style hooks

Wrap-style hook 会把执行过程包裹起来，让你决定 handler 调用 0 次、1 次或多次。

适合：

- 重试
- fallback
- 缓存
- 动态改写请求

可用 hook：

- Python：`wrap_model_call`、`wrap_tool_call`

### Python

```python
from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
from typing import Callable

@wrap_model_call
def retry_model(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ModelResponse:
    for attempt in range(3):
        try:
            return handler(request)
        except Exception as e:
            if attempt == 2:
                raise
            print(f"重试 {attempt + 1}/3，错误：{e}")
```

## State updates

两类 hook 都可以更新 Agent state。

- Node-style hooks：直接返回 dict，LangGraph 会用 reducer 把它合并进 state
- Wrap-style hooks：通过 `Command` 或 `ExtendedModelResponse` 注入 state 更新

### Node-style hooks

### Python

```python
from langchain.agents.middleware import after_model, AgentState
from langgraph.runtime import Runtime
from typing import Any
from typing_extensions import NotRequired

class TrackingState(AgentState):
    model_call_count: NotRequired[int]

@after_model(state_schema=TrackingState)
def increment_after_model(state: TrackingState, runtime: Runtime) -> dict[str, Any] | None:
    return {"model_call_count": state.get("model_call_count", 0) + 1}
```

### Wrap-style hooks

### Python

```python
from typing import Callable
from langchain.agents.middleware import (
    wrap_model_call,
    ModelRequest,
    ModelResponse,
    AgentState,
    ExtendedModelResponse
)
from langgraph.types import Command
from typing_extensions import NotRequired

class UsageTrackingState(AgentState):
    last_model_call_tokens: NotRequired[int]

@wrap_model_call(state_schema=UsageTrackingState)
def track_usage(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ExtendedModelResponse:
    response = handler(request)
    return ExtendedModelResponse(
        model_response=response,
        command=Command(update={"last_model_call_tokens": 150}),
    )
```

## 创建 middleware

### Python

Python 中有两种常见方式：

- 基于 decorator
- 基于 class

#### Decorator-based middleware

适合：

- 只需要一个 hook
- 快速原型
- 配置简单

### Python

```python
from langchain.agents.middleware import (
    before_model,
    wrap_model_call,
    AgentState,
    ModelRequest,
    ModelResponse,
)
from langchain.agents import create_agent
from langgraph.runtime import Runtime
from typing import Any, Callable

@before_model
def log_before_model(state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
    print(f"模型调用前消息数：{len(state['messages'])}")
    return None

@wrap_model_call
def retry_model(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ModelResponse:
    for attempt in range(3):
        try:
            return handler(request)
        except Exception as e:
            if attempt == 2:
                raise
            print(f"重试 {attempt + 1}/3，错误：{e}")

agent = create_agent(
    model="gpt-4.1",
    middleware=[log_before_model, retry_model],
    tools=[...],
)
```

#### Class-based middleware

适合：

- 一个 middleware 里需要多个 hook
- 需要复杂配置
- 需要复用

### Python

```python
from langchain.agents.middleware import AgentMiddleware, AgentState
from langgraph.runtime import Runtime

class LoggingMiddleware(AgentMiddleware):
    def before_model(self, state: AgentState, runtime: Runtime):
        print(f"模型调用前消息数：{len(state['messages'])}")
        return None

    def after_model(self, state: AgentState, runtime: Runtime):
        print(f"模型返回：{state['messages'][-1].content}")
        return None
```

## 自定义 state schema

Middleware 可以扩展 Agent 的 state，适合用来：

- 跨整个执行周期追踪状态
- 在不同 hook 之间共享数据
- 实现限流、使用量统计、审计日志等横切能力

## 自定义 context

你也可以让 middleware 依赖运行时 context，例如：

- 用户身份
- 多租户信息
- 请求级元数据

## 执行顺序

如果你配置了多个 middleware，需要理解它们的执行顺序：

- `before_*`：从前到后
- `after_*`：从后到前
- `wrap_*`：按嵌套方式执行，前面的 middleware 包裹后面的 middleware

例如：

1. `middleware1.before_agent()`
2. `middleware2.before_agent()`
3. `middleware3.before_agent()`
4. `middleware1.before_model()`
5. `middleware2.before_model()`
6. `middleware3.before_model()`
7. `middleware1.wrap_model_call()` -> `middleware2.wrap_model_call()` -> `middleware3.wrap_model_call()` -> model
8. `middleware3.after_model()`
9. `middleware2.after_model()`
10. `middleware1.after_model()`

## Agent jumps

如果你想在 middleware 中提前跳转流程，可以返回带 `jump_to` 的 dict。

常见跳转目标：

- `'end'`
- `'tools'`
- `'model'`

### Python

```python
from langchain.agents.middleware import after_model, hook_config, AgentState
from langchain.messages import AIMessage
from langgraph.runtime import Runtime

@after_model
@hook_config(can_jump_to=["end"])
def check_for_blocked(state: AgentState, runtime: Runtime):
    last_message = state["messages"][-1]
    if "BLOCKED" in last_message.content:
        return {
            "messages": [AIMessage("我不能响应这个请求。")],
            "jump_to": "end"
        }
    return None
```

## 最佳实践

1. 每个 middleware 尽量只做一件事
2. 优雅处理错误，不要让 middleware 异常直接拖垮整个 Agent
3. 顺序逻辑优先用 node-style hooks，控制流逻辑优先用 wrap-style hooks
4. 明确记录任何自定义 state 字段
5. 先单独测试 middleware，再集成到 Agent 中
6. 注意 middleware 排列顺序
7. 能用内建 middleware 时优先用内建版本

## 示例

### 动态模型选择

### Python

```python
from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
from langchain.chat_models import init_chat_model
from typing import Callable

complex_model = init_chat_model("gpt-4.1")
simple_model = init_chat_model("gpt-4.1-mini")

@wrap_model_call
def dynamic_model(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ModelResponse:
    if len(request.messages) > 10:
        model = complex_model
    else:
        model = simple_model
    return handler(request.override(model=model))
```

### Tool call 监控

### Python

```python
from langchain.agents.middleware import wrap_tool_call

@wrap_tool_call
def monitor_tool(request, handler):
    print(f"执行工具：{request.tool_call['name']}")
    print(f"参数：{request.tool_call['args']}")
    try:
        result = handler(request)
        print("工具执行成功")
        return result
    except Exception as e:
        print(f"工具执行失败：{e}")
        raise
```

### 动态选择工具

### Python

```python
from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
from typing import Callable

@wrap_model_call
def select_tools(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ModelResponse:
    relevant_tools = select_relevant_tools(request.state, request.runtime)
    return handler(request.override(tools=relevant_tools))
```

### 在 middleware 中操作 system message

### Python

```python
from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
from langchain.messages import SystemMessage
from typing import Callable

@wrap_model_call
def add_context(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ModelResponse:
    new_content = list(request.system_message.content_blocks) + [
        {"type": "text", "text": "附加上下文。"}
    ]
    new_system_message = SystemMessage(content=new_content)
    return handler(request.override(system_message=new_system_message))
```

## 额外资源

- Middleware API reference
- Built-in middleware
- Testing agents

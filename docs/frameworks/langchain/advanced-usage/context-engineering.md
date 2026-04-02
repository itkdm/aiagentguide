---
title: Agent 中的上下文工程
description: 通过控制模型上下文、工具上下文和生命周期上下文，提高 Agent 的可靠性
---

# Agent 中的上下文工程

构建 Agent，或者任何 LLM 应用，最难的部分通常不是让它“跑起来”，而是让它在真实场景里足够可靠。原型阶段看起来可行的方案，到了生产环境往往会暴露出很多问题。

## Agent 为什么会失败？

当 Agent 出错时，通常意味着 Agent 内部的某次 LLM 调用采取了错误动作，或者没有按预期执行。LLM 失败一般有两个原因：

1. 底层模型能力不够。
2. 没有把“正确的上下文”传给模型。

在绝大多数情况下，真正导致 Agent 不可靠的，往往是第二点。

**上下文工程（Context engineering）**，就是以正确的格式，把正确的信息和工具在正确的时机提供给 LLM，让它能够完成任务。这是 AI 工程师最核心的工作之一。缺少“正确上下文”是高可靠 Agent 的主要障碍，而 LangChain 的 Agent 抽象正是围绕这一点设计的。

> [!TIP]
> 如果你刚接触上下文工程，建议先阅读概念总览：[context](https://docs.langchain.com/oss/python/concepts/context)。

## Agent 循环

典型的 Agent 循环包含两个主要步骤：

1. 模型调用：使用提示词和可用工具调用 LLM，返回回复或工具调用请求。
2. 工具执行：执行 LLM 请求的工具，并把结果返回给模型。

这个循环会持续进行，直到 LLM 决定结束。

## 你能控制什么

要构建可靠 Agent，你需要控制 Agent 循环每一步里发生的事情，以及步骤之间发生的事情。

| 上下文类型 | 你控制的内容 | 临时 / 持久 |
| --- | --- | --- |
| 模型上下文 | 每次模型调用时传入什么，例如指令、消息历史、工具、响应格式 | 临时 |
| 工具上下文 | 工具可以读取和写入什么，例如 state、store、runtime context | 持久 |
| 生命周期上下文 | 模型调用与工具执行之间发生什么，例如摘要、护栏、日志等 | 持久 |

简化理解：

- 临时上下文：只影响当前一次模型调用，不直接改写保存下来的状态。
- 持久上下文：会写入状态，影响后续轮次。

## 数据来源

整个过程中，Agent 会读写不同来源的数据：

| 数据源 | 也常被称为 | 作用域 | 示例 |
| --- | --- | --- | --- |
| Runtime Context | 静态配置 | 当前会话 | 用户 ID、API Key、数据库连接、权限、环境配置 |
| State | 短期记忆 | 当前会话 | 当前消息、上传文件、认证状态、工具结果 |
| Store | 长期记忆 | 跨会话 | 用户偏好、历史洞察、记忆、长期数据 |

## 它是怎么工作的

LangChain 的 [middleware](/frameworks/langchain/middleware/overview) 是实现上下文工程的核心机制。

Middleware 允许你挂接到 Agent 生命周期中的任意步骤，并做两类事情：

- 更新上下文
- 跳转到生命周期中的其他步骤

贯穿整篇指南，你都会看到 middleware 被用来实现不同的上下文工程策略。

## 模型上下文

模型上下文决定每次模型调用时传入什么内容，包括：

- 系统提示词
- 消息列表
- 工具
- 模型本身
- 输出格式

这些决策会直接影响 Agent 的可靠性和成本。

这些模型上下文都可以来自：

- `state`
- `store`
- `runtime context`

### 系统提示词

系统提示词决定 LLM 的行为方式和能力边界。不同用户、不同场景、不同对话阶段，往往都需要不同指令。可靠的 Agent 会结合记忆、偏好和配置，在当前对话状态下动态生成最合适的系统提示。

一个常见模式是根据消息数量动态调整系统提示：

```python
from langchain.agents import create_agent
from langchain.agents.middleware import dynamic_prompt, ModelRequest

@dynamic_prompt
def state_aware_prompt(request: ModelRequest) -> str:
    message_count = len(request.messages)

    base = "你是一个乐于助人的助手。"

    if message_count > 10:
        base += "\n这是一段较长的对话，请额外保持简洁。"

    return base

agent = create_agent(
    model="gpt-4.1",
    tools=[...],
    middleware=[state_aware_prompt]
)
```

### 消息

消息本身就是最终发送给 LLM 的提示内容，因此消息管理非常关键。你需要保证消息中包含的是“当前回答最需要的信息”。

例如，如果用户本轮上传了文件，就可以在模型调用前把文件上下文注入到消息中：

```python
from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
from typing import Callable

@wrap_model_call
def inject_file_context(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse]
) -> ModelResponse:
    uploaded_files = request.state.get("uploaded_files", [])

    if uploaded_files:
        file_descriptions = []
        for file in uploaded_files:
            file_descriptions.append(
                f"- {file['name']} ({file['type']}): {file['summary']}"
            )

        file_context = f"""当前对话中你可访问的文件：
{chr(10).join(file_descriptions)}

在回答相关问题时请参考这些文件。"""

        messages = [
            *request.messages,
            {"role": "user", "content": file_context},
        ]
        request = request.override(messages=messages)

    return handler(request)
```

### 工具

模型是否拥有正确的工具，以及这些工具以什么形式提供给模型，直接决定了 Agent 能否采取正确动作。

一个常见策略是根据状态、用户权限或长期偏好，动态调整可用工具集合。例如：

- 已认证用户可以使用敏感工具，未认证用户不行。
- 不同角色看到不同工具。
- 某些工具只在特定环境启用。

### 模型

你还可以根据上下文动态选择模型，而不是所有请求都固定走同一个模型。

典型用法：

- 简单任务走更便宜更快的模型。
- 高风险操作走更强的模型。
- 生产环境与测试环境用不同模型配置。

### 输出格式

响应格式也属于模型上下文的一部分。你可以根据用户偏好、角色或环境决定使用不同 schema。

例如，管理员可能需要附带 `debug_info` 的详细响应，而普通用户只需要简洁答案。

## 工具上下文

工具很特殊，因为它既会读取上下文，也会写入上下文。

### 工具读取什么

在真实系统中，工具通常不仅依赖 LLM 传来的参数，还需要读取：

- 当前状态中的认证信息
- Store 中保存的用户偏好
- Runtime Context 中的 API Key、数据库连接等

例如，工具可以从 `runtime.context` 里读出数据库连接，再去执行查询。

### 工具写入什么

工具不仅能把结果返回给模型，还可以更新 Agent 的记忆，让后续步骤可用到这些信息。

常见写入目标：

- 写入 `state`：比如标记“用户已认证”
- 写入 `store`：比如持久保存用户偏好

例如，工具可以通过 `Command` 更新状态：

```python
from langgraph.types import Command

@tool
def authenticate_user(password: str, runtime: ToolRuntime) -> Command:
    if password == "correct":
        return Command(update={"authenticated": True})
    else:
        return Command(update={"authenticated": False})
```

也可以把长期偏好写入 Store：

```python
@tool
def save_preference(
    preference_key: str,
    preference_value: str,
    runtime: ToolRuntime[Context]
) -> str:
    user_id = runtime.context.user_id
    store = runtime.store
    existing_prefs = store.get(("preferences",), user_id)

    prefs = existing_prefs.value if existing_prefs else {}
    prefs[preference_key] = preference_value
    store.put(("preferences",), user_id, prefs)

    return f"已保存偏好：{preference_key} = {preference_value}"
```

## 生命周期上下文

生命周期上下文指的是：在 Agent 核心步骤之间发生什么。

它适合处理横切逻辑，例如：

- 自动摘要
- Guardrails
- 日志记录
- 条件跳转

和前面的模型上下文、工具上下文一样，middleware 仍然是这里的核心机制。

你可以用 middleware 做两类事情：

1. 更新上下文：修改 state / store，持久保存变化。
2. 跳转生命周期：根据当前上下文，跳过某些步骤，或者重新调用模型。

### 示例：摘要

摘要是最常见的生命周期模式之一。当对话过长时，你可以自动把早期消息压缩成摘要。和简单的“临时裁剪消息”不同，摘要会**持久更新 state**，把旧消息永久替换为摘要，这样之后的所有轮次都会看到摘要而不是原始消息。

LangChain 提供了内置摘要中间件：

```python
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware

agent = create_agent(
    model="gpt-4.1",
    tools=[...],
    middleware=[
        SummarizationMiddleware(
            model="gpt-4.1-mini",
            trigger={"tokens": 4000},
            keep={"messages": 20},
        ),
    ],
)
```

当对话超过阈值时，`SummarizationMiddleware` 会自动：

1. 使用单独的模型调用对旧消息做摘要。
2. 用摘要消息替换 state 中的旧消息。
3. 保留最近消息作为局部上下文。

## 最佳实践

1. 从简单方案开始：先用静态提示和固定工具，需要时再加动态能力。
2. 逐步测试：一次只引入一个上下文工程特性。
3. 监控性能：关注模型调用次数、Token 用量和延迟。
4. 优先使用内置 middleware：例如 `SummarizationMiddleware` 等。
5. 文档化你的上下文策略：明确记录“传了哪些上下文，为什么传”。
6. 理解临时与持久差异：模型上下文通常是临时的，生命周期上下文往往会持久写入状态。

## 相关资源

- [Context 概念总览](https://docs.langchain.com/oss/python/concepts/context)
- [Middleware](/frameworks/langchain/middleware/overview)
- [Tools](/frameworks/langchain/core-components/tools)
- [Memory](https://docs.langchain.com/oss/python/concepts/memory)
- [Agents](/frameworks/langchain/core-components/agents)

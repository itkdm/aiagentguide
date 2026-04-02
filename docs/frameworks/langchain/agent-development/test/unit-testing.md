---
title: Unit testing
description: 使用假模型和内存持久化测试 Agent 逻辑，无需真实 API 调用。
---

# Unit testing

单元测试用于隔离验证 Agent 中小而确定的逻辑。核心思路是用假模型替代真实 LLM，把响应、工具调用甚至错误都预先编排好，这样测试既快又稳定，也不需要 API Key。

## 测什么

单元测试适合覆盖这些内容：

- 工具调用是否按预期发生
- 某段中间件逻辑是否正确拦截或修改消息
- 多轮对话状态是否被正确持久化
- 错误处理与重试逻辑是否生效

## Python：使用假 chat model

LangChain 提供了 `GenericFakeChatModel` 来模拟模型返回值。你可以把一组预设响应按顺序喂给模型，每次调用取下一条。

```python
from langchain_core.language_models.fake_chat_models import GenericFakeChatModel
from langchain.messages import AIMessage

model = GenericFakeChatModel(messages=iter([
    AIMessage(
        content="",
        tool_calls=[{"name": "get_weather", "args": {"city": "北京"}, "id": "call_1"}],
    ),
    AIMessage(content="北京今天晴天。"),
]))
```

这样你就可以精确控制 Agent 第一次返回工具调用，第二次返回自然语言结果。

## Python：用 InMemorySaver 测试多轮状态

如果你要测试状态相关行为，可以给 Agent 挂一个 `InMemorySaver`，让测试里的多轮对话共享同一个线程状态。

```python
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    model=model,
    tools=[],
    checkpointer=InMemorySaver(),
)

agent.invoke(
    {"messages": [{"role": "user", "content": "我住在上海"}]},
    config={"configurable": {"thread_id": "session-1"}},
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "我所在城市是哪？"}]},
    config={"configurable": {"thread_id": "session-1"}},
)
```

## 单元测试建议

- 不要在单元测试里调用真实模型 API
- 每个测试只验证一个清晰行为
- 尽量断言结构，而不是断言长篇自然语言原文
- 多轮对话测试要固定 `thread_id`

## 下一步

如果你已经验证了本地逻辑，下一步看[集成测试](/frameworks/langchain/agent-development/test/integration-testing)，确认真实模型和外部服务协作正常。

---
title: Streaming
description: 实时流式输出 Agent 运行更新
---

# Streaming

LangChain 提供了一套 streaming 系统，用于把运行过程中的实时更新暴露给应用层。

Streaming 对 LLM 应用的体验非常关键。因为即使完整结果还没生成完，应用也可以先逐步展示中间内容，从而显著提升交互响应感。

## 概览

LangChain 的 streaming 可以做到：

- Stream Agent 进度
- Stream LLM tokens
- Stream thinking / reasoning tokens
- Stream custom updates
- Stream multiple modes

## 支持的 stream modes

| 模式 | 说明 |
|---|---|
| `updates` | 在每个 Agent 步骤后输出 state 更新 |
| `messages` | 输出 `(token, metadata)`，适合流式 token 和工具调用片段 |
| `custom` | 输出自定义数据，例如工具内部发出的进度消息 |

## Agent 进度

如果你想看到 Agent 每一步执行到了哪里，可以使用 `stream_mode="updates"`。

### Python

```python
from langchain.agents import create_agent

def get_weather(city: str) -> str:
    """获取指定城市天气。"""
    return f"{city} 总是阳光明媚！"

agent = create_agent(
    model="gpt-5-nano",
    tools=[get_weather],
)

for chunk in agent.stream(
    {"messages": [{"role": "user", "content": "旧金山天气怎么样？"}]},
    stream_mode="updates",
    version="v2",
):
    if chunk["type"] == "updates":
        for step, data in chunk["data"].items():
            print(f"步骤：{step}")
            print(f"内容：{data['messages'][-1].content_blocks}")
```

## LLM tokens

如果你希望随着模型生成过程逐个看到 token，可以使用 `stream_mode="messages"`。

### Python

```python
for chunk in agent.stream(
    {"messages": [{"role": "user", "content": "旧金山天气怎么样？"}]},
    stream_mode="messages",
    version="v2",
):
    if chunk["type"] == "messages":
        token, metadata = chunk["data"]
        print(f"节点：{metadata['langgraph_node']}")
        print(f"内容：{token.content_blocks}")
```

## 自定义更新

如果你想在工具执行过程中输出自定义进度消息，可以使用 stream writer。

### Python

```python
from langgraph.config import get_stream_writer

def get_weather(city: str) -> str:
    """获取指定城市天气。"""
    writer = get_stream_writer()
    writer(f"正在查询城市：{city}")
    writer(f"已获取城市数据：{city}")
    return f"{city} 总是阳光明媚！"
```

## 同时流多种模式

你可以一次指定多种 streaming 模式。

### Python

```python
for chunk in agent.stream(
    {"messages": [{"role": "user", "content": "旧金山天气怎么样？"}]},
    stream_mode=["updates", "custom"],
    version="v2",
):
    print(f"stream_mode: {chunk['type']}")
    print(f"content: {chunk['data']}")
```

## 常见模式

### 流式输出 reasoning tokens

有些模型会在给出最终回答前进行内部推理。你可以在 `messages` 模式下过滤出 `type === "reasoning"` 的内容块。

LangChain 会把不同 provider 的 reasoning 表达方式统一归一化为标准 `reasoning` content block。

### 流式输出 tool calls

很多时候你希望同时看到：

1. 工具调用参数正在生成时的部分 JSON
2. 最终解析完成并真正执行的 tool call

这种场景通常使用 `stream_mode="messages"`，然后在流中解析 `tool_call_chunk` 与完整 `tool_calls`。

### Streaming with human-in-the-loop

如果 Agent 中启用了 human-in-the-loop interrupts，那么 streaming 还可以一边展示进度，一边收集中断事件，等待人工审批后再恢复执行。

### 从 sub-agents 流式输出

当系统中存在多个 Agent 或子 Agent 时，可以通过为每个 Agent 设置 `name` 并启用 `subgraphs=True`，从 metadata 中读取 `lc_agent_name` 来识别 token 来源。

## 禁用 streaming

在某些场景下，你可能希望关闭某个模型的 token streaming。

### Python

```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model="gpt-4.1",
    streaming=False
)
```

## v2 streaming format

在 Python 中，如果你传入 `version="v2"`，就会得到统一的流输出格式。每个 chunk 都会包含：

- `type`
- `ns`
- `data`

### Python

```python
for chunk in agent.stream(
    {"messages": [{"role": "user", "content": "旧金山天气怎么样？"}]},
    stream_mode=["updates", "custom"],
    version="v2",
):
    print(chunk["type"])
    print(chunk["data"])
```

此外，v2 的 `invoke()` 还会返回 `GraphOutput`，把状态与中断元信息分离开：

```python
result = agent.invoke(
    {"messages": [{"role": "user", "content": "你好"}]},
    version="v2",
)

print(result.value)
print(result.interrupts)
```

## 相关内容

- Frontend streaming
- Streaming with chat models
- Reasoning with chat models
- Standard content blocks
- Streaming with human-in-the-loop
- LangGraph streaming

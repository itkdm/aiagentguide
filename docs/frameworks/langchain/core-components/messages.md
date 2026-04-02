---
title: Messages
---

# Messages

Messages 是 LangChain 中模型上下文的基本单位。它们用于表示模型的输入与输出，并携带构建对话状态所需的内容与元数据。

一个 message 通常包含：

- **Role**：标识消息类型，例如 `system`、`user`
- **Content**：实际内容，例如文本、图片、音频、文件等
- **Metadata**：可选元信息，例如响应信息、消息 ID、token usage

LangChain 提供了一套跨 provider 通用的标准消息类型，因此无论底层调用哪个模型，消息行为都尽量保持一致。

## 基础用法

最简单的使用方式，是先创建消息对象，再把这些消息传给模型进行调用。

### Python

```python
from langchain.chat_models import init_chat_model
from langchain.messages import HumanMessage, AIMessage, SystemMessage

model = init_chat_model("gpt-5-nano")

system_msg = SystemMessage("你是一位乐于助人的助手。")
human_msg = HumanMessage("你好，你还好吗？")

messages = [system_msg, human_msg]
response = model.invoke(messages)
```

### 文本提示词

文本提示词就是一个字符串。它适合简单、单轮的生成任务，不需要保留对话历史。

### Python

```python
response = model.invoke("写一首关于春天的俳句")
```

### 消息提示词

你也可以传入消息对象列表，让模型理解一段完整的对话上下文。

### Python

```python
from langchain.messages import SystemMessage, HumanMessage, AIMessage

messages = [
    SystemMessage("你是一位诗歌专家"),
    HumanMessage("写一首关于春天的俳句"),
    AIMessage("樱花悄然开……")
]

response = model.invoke(messages)
```

### 字典格式

你也可以直接使用 OpenAI Chat Completions 风格的字典格式来表示消息。

### Python

```python
messages = [
    {"role": "system", "content": "你是一位诗歌专家"},
    {"role": "user", "content": "写一首关于春天的俳句"},
    {"role": "assistant", "content": "樱花悄然开……"}
]

response = model.invoke(messages)
```

## 消息类型

LangChain 中常见的消息类型包括：

- `SystemMessage`：定义模型应该如何行为，并提供系统级上下文
- `HumanMessage`：表示用户输入
- `AIMessage`：表示模型输出
- `ToolMessage`：表示工具执行结果

### System message

`SystemMessage` 用于给模型提供初始指令，设定语气、角色和输出规则。

### Python

```python
from langchain.messages import SystemMessage, HumanMessage

system_msg = SystemMessage("你是一位乐于助人的编程助手。")

messages = [
    system_msg,
    HumanMessage("我该如何创建 REST API？")
]

response = model.invoke(messages)
```

### Python

```python
from langchain.messages import SystemMessage, HumanMessage

system_msg = SystemMessage("""
你是一位资深 Python 开发者，擅长 Web 框架。
请始终给出代码示例，并解释你的推理过程。
表达要简洁，但内容要完整。
""")

messages = [
    system_msg,
    HumanMessage("我该如何创建 REST API？")
]

response = model.invoke(messages)
```

### Human message

`HumanMessage` 表示用户输入。它不仅可以包含文本，也可以包含图片、音频、文件等多模态内容。

#### 文本内容

### Python

```python
response = model.invoke([
    HumanMessage("什么是机器学习？")
])
```

```python
# 传入字符串，其实就是单条 HumanMessage 的简写形式
response = model.invoke("什么是机器学习？")
```

### Python

```python
human_msg = HumanMessage(
    content="你好！",
    name="alice",
    id="msg_123",
)
```

### AI message

`AIMessage` 表示模型输出。它可以包含文本、多模态内容、工具调用以及 provider 专属元数据。

### Python

```python
response = model.invoke("解释一下 AI")
print(type(response))
```

### Python

```python
from langchain.messages import AIMessage, SystemMessage, HumanMessage

ai_msg = AIMessage("当然可以，我很乐意帮助你！")

messages = [
    SystemMessage("你是一位乐于助人的助手"),
    HumanMessage("你能帮我吗？"),
    ai_msg,
    HumanMessage("太好了！那 2+2 等于多少？")
]

response = model.invoke(messages)
```

### Python

```python
from langchain.chat_models import init_chat_model

model = init_chat_model("gpt-5-nano")

def get_weather(location: str) -> str:
    """获取某地天气。"""
    ...

model_with_tools = model.bind_tools([get_weather])
response = model_with_tools.invoke("巴黎天气怎么样？")

for tool_call in response.tool_calls:
    print(f"工具：{tool_call['name']}")
    print(f"参数：{tool_call['args']}")
    print(f"ID：{tool_call['id']}")
```

### Python

```python
from langchain.chat_models import init_chat_model

model = init_chat_model("gpt-5-nano")

response = model.invoke("你好！")
print(response.usage_metadata)
```

### Python

```python
chunks = []
full_message = None

for chunk in model.stream("你好"):
    chunks.append(chunk)
    print(chunk.text)
    full_message = chunk if full_message is None else full_message + chunk
```

### Tool message

对于支持 tool calling 的模型，`ToolMessage` 用于把某一次工具执行结果回传给模型。

### Python

```python
from langchain.messages import AIMessage, ToolMessage, HumanMessage

ai_message = AIMessage(
    content=[],
    tool_calls=[{
        "name": "get_weather",
        "args": {"location": "San Francisco"},
        "id": "call_123"
    }]
)

weather_result = "晴，72 华氏度"
tool_message = ToolMessage(
    content=weather_result,
    tool_call_id="call_123"
)

messages = [
    HumanMessage("旧金山天气怎么样？"),
    ai_message,
    tool_message,
]

response = model.invoke(messages)
```

### Python

```python
from langchain.messages import ToolMessage

message_content = "这是检索到的正文内容。"
artifact = {"document_id": "doc_123", "page": 0}

tool_message = ToolMessage(
    content=message_content,
    tool_call_id="call_123",
    name="search_books",
    artifact=artifact,
)
```

## 消息内容

你可以把 message 的 content 理解为真正发给模型的数据载荷。LangChain 中，消息的 `content` 是一个较宽松的字段，可以是：

1. 字符串
2. provider 原生格式的内容块列表
3. LangChain 标准内容块列表

这种设计让 LangChain 能同时兼容 provider 原生结构以及统一抽象后的标准格式。

### Python

```python
from langchain.messages import HumanMessage

human_message = HumanMessage("你好，你最近怎么样？")
```

```python
from langchain.messages import HumanMessage

human_message = HumanMessage(
    content=[
        {"type": "text", "text": "请描述这张图片"},
        {
            "type": "image",
            "url": "https://example.com/cat.jpg",
        },
    ]
)
```

### 标准内容块

LangChain 还定义了标准化 content blocks，用于跨 provider 统一表示常见内容类型。

常见标准内容块包括：

- `text`：普通文本
- `reasoning`：模型推理步骤
- `image` / `audio` / `video` / `file`：多模态输入或输出
- `tool_call`：工具调用
- `tool_call_chunk`：流式工具调用片段
- `invalid_tool_call`：格式错误的工具调用
- `server_tool_call`：服务端执行的工具调用
- `server_tool_result`：服务端工具执行结果
- `non_standard`：provider 专属的非标准扩展块

### 多模态

某些模型支持使用图片、音频、视频、文件等多模态内容。

### Python

```python
from langchain.messages import HumanMessage

message = HumanMessage(
    content=[
        {"type": "text", "text": "请描述这张图片"},
        {
            "type": "image",
            "url": "https://example.com/image.png",
        },
    ]
)
```

### 内容块参考

如果你要从类型层面使用这些内容块，可以直接依赖 LangChain 中定义的标准类型。

## 与 chat models 配合使用

[Chat models](/frameworks/langchain/core-components/models) 接收消息序列作为输入，并返回 `AIMessage` 作为输出。

在很多场景中，对话本身是无状态的，因此一个最基础的对话循环，通常就是在每次调用时传入一份不断增长的消息列表。

如果你要继续深入，建议接着看以下主题：

- 如何持久化和管理对话历史
- 如何管理上下文窗口，例如裁剪消息和消息总结

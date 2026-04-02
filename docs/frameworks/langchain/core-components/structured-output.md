---
title: Structured output
---

# Structured output

结构化输出允许 Agent 以特定、可预测的格式返回数据。这样你就不需要再从自然语言中手动解析结果，而是可以直接得到 JSON 对象、Pydantic 模型、dataclass 或其他结构化结果，供应用直接使用。

> [!TIP]
> 这一页讲的是通过 `create_agent` 使用结构化输出。  
> 如果你想直接在模型上使用结构化输出，而不经过 Agent，请查看 [Models - Structured output](/frameworks/langchain/core-components/models#structured-output)。

LangChain 的 `create_agent` 会自动处理结构化输出。你只需要声明期望的 schema，当模型生成结构化数据后，LangChain 会负责捕获、校验，并把结果放到最终 state 中的：

- Python：`structured_response`

## Response format

`response_format` 用于控制 Agent 如何返回结构化数据。

常见形式包括：

- `ToolStrategy`：通过 tool calling 实现结构化输出
- `ProviderStrategy`：通过 provider 原生结构化输出实现
- 直接传 schema 类型：由 LangChain 自动选择最佳策略
- `None`：不显式请求结构化输出

当你直接传入 schema 类型时，LangChain 会自动选择：

- 如果当前模型和 provider 支持原生结构化输出，则使用 `ProviderStrategy`
- 否则使用 `ToolStrategy`

如果你使用的是 `langchain>=1.1`，LangChain 会读取模型的 profile 数据来判断它是否支持原生 structured output。如果 profile 数据缺失，也可以手动指定。

### Python

```python
from langchain.chat_models import init_chat_model

custom_profile = {
    "structured_output": True,
}

model = init_chat_model("...", profile=custom_profile)
```

## Provider strategy

有些 provider 原生支持 structured output，例如 OpenAI、xAI（Grok）、Gemini、Anthropic（Claude）等。这是通常最可靠的方式。

### Python

```python
from pydantic import BaseModel, Field
from langchain.agents import create_agent

class ContactInfo(BaseModel):
    """联系信息。"""
    name: str = Field(description="姓名")
    email: str = Field(description="邮箱地址")
    phone: str = Field(description="电话号码")

agent = create_agent(
    model="gpt-5",
    response_format=ContactInfo
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "从这段内容中提取联系人信息：张三，zhangsan@example.com，13800000000"}]
})

print(result["structured_response"])
```

你也可以显式写成 `ProviderStrategy(...)`。

### Python

```python
from langchain.agents.structured_output import ProviderStrategy

agent = create_agent(
    model="gpt-5",
    response_format=ProviderStrategy(ContactInfo)
)
```

在 Python 中，`ProviderStrategy` 支持的 schema 形式包括：

- Pydantic 模型
- dataclass
- TypedDict
- JSON Schema

## Tool calling strategy

对于不支持原生 structured output 的模型，LangChain 会使用 tool calling 来实现同样的效果。

这适用于所有支持 tool calling 的现代模型。

### Python

```python
from pydantic import BaseModel, Field
from typing import Literal
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy

class ProductReview(BaseModel):
    """商品评价分析。"""
    rating: int | None = Field(description="商品评分", ge=1, le=5)
    sentiment: Literal["positive", "negative"] = Field(description="评价情绪")
    key_points: list[str] = Field(description="评价要点，使用小写短语")

agent = create_agent(
    model="gpt-5",
    tools=[],
    response_format=ToolStrategy(ProductReview)
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "分析这条评价：'产品很好，5 星。发货很快，但价格偏高'"}]
})

print(result["structured_response"])
```

在 Python 中，`ToolStrategy` 支持：

- Pydantic 模型
- dataclass
- TypedDict
- JSON Schema
- Union 类型

`ToolStrategy` 还有几个常用参数：

- `schema`：结构化输出 schema
- `tool_message_content`：生成 structured output 后写入消息历史的自定义提示内容
- `handle_errors`：控制校验失败时的重试与错误处理策略

### 自定义 tool message 内容

当 Agent 通过 tool calling 产出 structured output 时，默认会把一条 tool message 写入消息历史，内容通常类似“Returning structured response: ...”。

你可以通过 `tool_message_content` 自定义这条消息。

## 错误处理

当模型通过 tool calling 生成 structured output 时，可能会犯两类常见错误：

- 返回了多个结构化结果
- 返回的数据不符合 schema

LangChain 提供了自动重试机制来处理这些错误。

### Multiple structured outputs error

当模型错误地同时调用了多个结构化输出工具，而系统原本只希望得到一个结果时，Agent 会返回错误反馈给模型，并要求它重试。

### Python

```python
from pydantic import BaseModel, Field
from typing import Union
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy

class ContactInfo(BaseModel):
    name: str = Field(description="姓名")
    email: str = Field(description="邮箱")

class EventDetails(BaseModel):
    event_name: str = Field(description="活动名称")
    date: str = Field(description="活动日期")

agent = create_agent(
    model="gpt-5",
    tools=[],
    response_format=ToolStrategy(Union[ContactInfo, EventDetails])
)
```

如果模型同时返回 `ContactInfo` 和 `EventDetails`，LangChain 会给它返回错误消息，要求它只保留一个最合适的结果。

### Schema validation error

如果生成结果不符合 schema，例如字段缺失、类型错误、数值超出约束范围，LangChain 也会自动给模型错误反馈，并触发重试。

### Python

```python
from pydantic import BaseModel, Field
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy

class ProductRating(BaseModel):
    rating: int | None = Field(description="1 到 5 分", ge=1, le=5)
    comment: str = Field(description="评价内容")

agent = create_agent(
    model="gpt-5",
    tools=[],
    response_format=ToolStrategy(ProductRating),
    system_prompt="你是一位负责解析商品评价的助手。不要捏造字段和值。"
)
```

如果模型错误输出了 `rating=10`，LangChain 会将校验错误反馈给模型，通常它会自动重试并改成合法值。

### 错误处理策略

你可以通过 `handle_errors` 自定义错误处理行为。

常见方式包括：

- `True`：捕获并自动重试，使用默认错误消息
- `False`：不做重试，直接抛出异常
- 自定义字符串：统一使用这条错误提示
- 指定异常类型：仅在匹配异常时重试
- 自定义函数：根据异常动态决定提示内容

### Python

```python
ToolStrategy(
    schema=ProductRating,
    handle_errors="请提供 1 到 5 之间的评分，并包含评价内容。"
)
```

```python
ToolStrategy(
    schema=ProductRating,
    handle_errors=ValueError
)
```

```python
from langchain.agents.structured_output import StructuredOutputValidationError
from langchain.agents.structured_output import MultipleStructuredOutputsError

def custom_error_handler(error: Exception) -> str:
    if isinstance(error, StructuredOutputValidationError):
        return "输出格式有问题，请重新生成。"
    elif isinstance(error, MultipleStructuredOutputsError):
        return "你返回了多个结构化结果，请只保留最相关的一个。"
    else:
        return f"错误：{str(error)}"
```

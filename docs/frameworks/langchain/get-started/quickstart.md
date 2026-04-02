---
title: 快速开始
description: 使用 Python 与 LangChain 快速构建并运行第一个 Agent。
---

# 快速开始

这份快速开始会带你用 Python 搭建一个最小可运行的 LangChain Agent。

## 前置条件

开始前请先准备：

- 已安装 LangChain
- 已获取模型提供商的 API Key
- 已在终端中设置好对应环境变量

下面示例使用 Anthropic 的 Claude 模型，你也可以换成其他受支持模型，只要同时替换模型名和对应的 API Key 配置即可。

## 构建一个基础 Agent

先创建一个最小示例，让 Agent 能回答问题并调用一个简单工具。

```python
from langchain.agents import create_agent


def get_weather(city: str) -> str:
    """获取指定城市的天气。"""
    return f"{city} 今天晴天。"


agent = create_agent(
    model="claude-sonnet-4-6",
    tools=[get_weather],
    system_prompt="You are a helpful assistant",
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "北京天气怎么样？"}]}
)

print(result)
```

这个例子展示了 LangChain Agent 的最基本组成：

- 一个模型
- 一个或多个工具
- 一个系统提示词
- 一次 `invoke()` 调用

## 构建一个更完整的 Agent

在真实应用中，Agent 通常还需要这些能力：

1. 更明确的系统提示词
2. 可与外部系统交互的工具
3. 模型参数配置
4. 结构化输出
5. 多轮对话记忆

下面按步骤看一个更完整的版本。

## 第 1 步：定义 system prompt

```python
SYSTEM_PROMPT = """You are an expert weather forecaster, who speaks in puns.

你可以使用两个工具：

- get_weather_for_location：用于获取指定地点的天气
- get_user_location：用于获取用户所在位置

如果用户询问天气，请先确认你知道具体位置。
如果用户问的是“我这里的天气”，请先调用 get_user_location。
"""
```

## 第 2 步：定义工具

```python
from dataclasses import dataclass
from langchain.tools import tool, ToolRuntime


@tool
def get_weather_for_location(city: str) -> str:
    """获取指定城市的天气。"""
    return f"{city} 今天晴天。"


@dataclass
class Context:
    user_id: str


@tool
def get_user_location(runtime: ToolRuntime[Context]) -> str:
    """根据用户 ID 获取用户位置。"""
    return "Beijing" if runtime.context.user_id == "1" else "Shanghai"
```

## 第 3 步：配置模型

```python
from langchain.chat_models import init_chat_model


model = init_chat_model(
    "claude-sonnet-4-6",
    temperature=0.5,
    timeout=10,
    max_tokens=1000,
)
```

## 第 4 步：定义结构化输出

```python
from dataclasses import dataclass


@dataclass
class ResponseFormat:
    summary: str
    weather_conditions: str | None = None
```

## 第 5 步：添加记忆

```python
from langgraph.checkpoint.memory import InMemorySaver


checkpointer = InMemorySaver()
```

## 第 6 步：创建并运行 Agent

```python
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy


agent = create_agent(
    model=model,
    system_prompt=SYSTEM_PROMPT,
    tools=[get_user_location, get_weather_for_location],
    context_schema=Context,
    response_format=ToolStrategy(ResponseFormat),
    checkpointer=checkpointer,
)

config = {"configurable": {"thread_id": "1"}}

response = agent.invoke(
    {"messages": [{"role": "user", "content": "我这里天气怎么样？"}]},
    config=config,
    context=Context(user_id="1"),
)

print(response["structured_response"])
```

## 完整示例

```python
from dataclasses import dataclass

from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy
from langchain.chat_models import init_chat_model
from langchain.tools import tool, ToolRuntime
from langgraph.checkpoint.memory import InMemorySaver


SYSTEM_PROMPT = """You are an expert weather forecaster.

你可以使用两个工具：

- get_weather_for_location：用于获取指定地点的天气
- get_user_location：用于获取用户所在位置
"""


@dataclass
class Context:
    user_id: str


@tool
def get_weather_for_location(city: str) -> str:
    """获取指定城市的天气。"""
    return f"{city} 今天晴天。"


@tool
def get_user_location(runtime: ToolRuntime[Context]) -> str:
    """根据用户 ID 获取用户位置。"""
    return "Beijing" if runtime.context.user_id == "1" else "Shanghai"


@dataclass
class ResponseFormat:
    summary: str
    weather_conditions: str | None = None


model = init_chat_model("claude-sonnet-4-6", temperature=0)
checkpointer = InMemorySaver()


agent = create_agent(
    model=model,
    system_prompt=SYSTEM_PROMPT,
    tools=[get_user_location, get_weather_for_location],
    context_schema=Context,
    response_format=ToolStrategy(ResponseFormat),
    checkpointer=checkpointer,
)


config = {"configurable": {"thread_id": "1"}}

response = agent.invoke(
    {"messages": [{"role": "user", "content": "我这里天气怎么样？"}]},
    config=config,
    context=Context(user_id="1"),
)

print(response["structured_response"])
```

## 下一步

读完这篇后，建议继续看：

- [Agents](/frameworks/langchain/core-components/agents)
- [模型](/frameworks/langchain/core-components/models)
- [工具](/frameworks/langchain/core-components/tools)

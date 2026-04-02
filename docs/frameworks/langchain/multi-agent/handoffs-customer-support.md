---
title: 用 handoffs 构建客服工作流
description: 使用状态机模式，让单个 Agent 在客服流程的不同阶段动态切换配置
---

# 用 handoffs 构建客服工作流

这个教程演示如何使用 [handoffs](/frameworks/langchain/multi-agent/handoffs) 所代表的状态机模式，来构建一个客服 Agent。它不是通过调用多个子 Agent 来完成工作，而是让**同一个 Agent**随着状态变化，在不同阶段加载不同的提示词和工具集合。

这个客服工作流会完成以下事情：

- 先收集设备保修状态
- 再将问题分类为硬件或软件
- 然后给出解决方案，或升级给人工支持
- 并且在多轮对话之间保留状态

## 目标工作流

整体流程可以理解为：

1. 用户报告问题
2. 先确认设备是否在保修期内
3. 再识别问题类型（硬件 / 软件）
4. 最后根据保修状态和问题类型进入不同处理分支

例如：

- 软件问题：给出排查步骤
- 保修内硬件问题：给出保修维修方案
- 保修外硬件问题：升级人工支持

## 1. 定义自定义状态

首先定义一个状态结构，用于追踪当前工作流所处的步骤：

```python
from langchain.agents import AgentState
from typing_extensions import NotRequired
from typing import Literal

SupportStep = Literal[
    "warranty_collector",
    "issue_classifier",
    "resolution_specialist"
]

class SupportState(AgentState):
    current_step: NotRequired[SupportStep]
    warranty_status: NotRequired[Literal["in_warranty", "out_of_warranty"]]
    issue_type: NotRequired[Literal["hardware", "software"]]
```

其中 `current_step` 是状态机的核心，它决定当前轮次应该加载哪套配置。

## 2. 创建管理工作流状态的工具

接下来创建几个工具，用于记录信息并推进流程。

关键点在于：这些工具返回的是 `Command`，不仅记录数据，还会更新 `current_step`。

```python
from langchain.tools import tool, ToolRuntime
from langchain.messages import ToolMessage
from langgraph.types import Command

@tool
def record_warranty_status(
    status: Literal["in_warranty", "out_of_warranty"],
    runtime: ToolRuntime[None, SupportState],
) -> Command:
    """记录保修状态，并进入问题分类阶段。"""
    return Command(
        update={
            "messages": [
                ToolMessage(
                    content=f"已记录保修状态：{status}",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
            "warranty_status": status,
            "current_step": "issue_classifier",
        }
    )

@tool
def record_issue_type(
    issue_type: Literal["hardware", "software"],
    runtime: ToolRuntime[None, SupportState],
) -> Command:
    """记录问题类型，并进入解决阶段。"""
    return Command(
        update={
            "messages": [
                ToolMessage(
                    content=f"已记录问题类型：{issue_type}",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
            "issue_type": issue_type,
            "current_step": "resolution_specialist",
        }
    )
```

再加上两个普通工具：

- `escalate_to_human`
- `provide_solution`

这样 Agent 就既能推进状态，也能执行实际处理动作。

## 3. 定义每个阶段的配置

接下来，为每个阶段定义不同的：

- system prompt
- tools
- 前置依赖状态

例如：

```python
STEP_CONFIG = {
    "warranty_collector": {
        "prompt": WARRANTY_COLLECTOR_PROMPT,
        "tools": [record_warranty_status],
        "requires": [],
    },
    "issue_classifier": {
        "prompt": ISSUE_CLASSIFIER_PROMPT,
        "tools": [record_issue_type],
        "requires": ["warranty_status"],
    },
    "resolution_specialist": {
        "prompt": RESOLUTION_SPECIALIST_PROMPT,
        "tools": [provide_solution, escalate_to_human],
        "requires": ["warranty_status", "issue_type"],
    },
}
```

这种字典式配置的好处是：

- 一眼就能看出整个状态机结构
- 添加新步骤很方便
- 每个步骤依赖什么状态也很清晰

## 4. 创建按步骤动态切换的 middleware

然后使用 `wrap_model_call` middleware，在每次模型调用前读取 `current_step`，并注入对应配置：

```python
from langchain.agents.middleware import wrap_model_call, ModelRequest, ModelResponse
from typing import Callable

@wrap_model_call
def apply_step_config(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ModelResponse:
    current_step = request.state.get("current_step", "warranty_collector")
    step_config = STEP_CONFIG[current_step]

    for key in step_config["requires"]:
        if request.state.get(key) is None:
            raise ValueError(f"{key} must be set before reaching {current_step}")

    system_prompt = step_config["prompt"].format(**request.state)

    request = request.override(
        system_prompt=system_prompt,
        tools=step_config["tools"],
    )

    return handler(request)
```

这个 middleware 做了 5 件事：

1. 读取当前步骤
2. 找到对应配置
3. 校验依赖状态是否已满足
4. 用当前状态值格式化提示词
5. 动态替换系统提示和工具集合

## 5. 创建 Agent

最后把所有工具、状态结构、middleware 和 checkpointer 组装起来：

```python
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

all_tools = [
    record_warranty_status,
    record_issue_type,
    provide_solution,
    escalate_to_human,
]

agent = create_agent(
    model,
    tools=all_tools,
    state_schema=SupportState,
    middleware=[apply_step_config],
    checkpointer=InMemorySaver(),
)
```

这样就得到了一个可以跨轮记住当前处理阶段的客服 Agent。

## 如何运行这个流程

例如，用户先说：

- “我的手机屏幕裂了”

Agent 会处于 `warranty_collector`，先询问保修状态。

接着用户回答：

- “还在保修期内”

此时 `record_warranty_status` 会被调用，状态切换到 `issue_classifier`。

再接着用户描述：

- “是摔坏的，屏幕物理裂开了”

Agent 会调用 `record_issue_type`，将其标记为 `hardware`，并进入 `resolution_specialist`。

最后再根据保修状态和问题类型给出维修建议。

## 进阶：允许回退

有时用户会在后面纠正前面提供的信息，例如：

- “其实我搞错了，已经过保了”

这时你可以增加回退工具，例如：

```python
@tool
def go_back_to_warranty() -> Command:
    return Command(update={"current_step": "warranty_collector"})

@tool
def go_back_to_classification() -> Command:
    return Command(update={"current_step": "issue_classifier"})
```

然后把这些工具加入 `resolution_specialist` 阶段的工具集合，并在提示词中告诉模型：如果用户纠正信息，就调用回退工具重新走流程。

## 这个模式的关键理解

这个客服示例本质上不是多个 Agent 在协作，而是：

- 一个 Agent
- 多套阶段配置
- 通过状态驱动切换

因此你可以把它理解为：

- “同一个 Agent 的多种人格 / 多种职责模式”
- 而不是“多个独立 Agent”

## 实践建议

- 状态字段要足够清晰，让每一步的前置条件明确可验证。
- 每个阶段只暴露当前步骤真正需要的工具。
- 通过提示词明确告知当前阶段目标，避免 Agent 跨步骤乱跳。
- 对多轮对话一定配置 checkpointer，否则状态机无法真正跨轮运行。

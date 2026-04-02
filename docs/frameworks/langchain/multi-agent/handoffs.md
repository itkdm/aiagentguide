---
title: Handoffs
description: 通过工具更新状态，在不同 Agent 或不同阶段之间切换控制权
---

# Handoffs

在 **handoffs** 架构中，系统行为会根据状态动态变化。核心机制是：工具调用会更新某个状态变量，例如 `current_step` 或 `active_agent`，这个变量会跨轮次持久存在，而系统会读取它来调整后续行为，例如切换系统提示词、切换工具集合，或者直接切换到另一个 Agent。

这个模式不仅适用于多个 Agent 之间的移交，也适用于单个 Agent 在不同工作阶段之间的动态配置切换。

> [!TIP]
> “handoffs” 这个说法最初由 OpenAI 在 Agent 场景中使用，核心含义是通过类似 `transfer_to_sales_agent` 这样的工具调用，把控制权转移给另一个 Agent 或另一个状态。

## 关键特征

- 状态驱动：行为由 `current_step`、`active_agent` 等状态变量决定
- 工具驱动迁移：通过工具更新状态，推动流程进入下一阶段
- 直接与用户交互：每个状态都可以直接处理用户消息
- 持久状态：状态可以跨轮次保留

## 什么时候适合用

Handoffs 特别适合这些场景：

- 你需要严格的顺序约束，只有满足前置条件后才能进入下一步
- Agent 需要在多轮对话中以不同身份或不同阶段直接和用户交互
- 你在构建多阶段对话流程，例如客服流程、审批流程、分步收集信息

例如，客服 Agent 可能必须先确认保修状态，才能继续进入问题分类和解决方案阶段。

## 基本实现

handoff 的核心通常是一个返回 `Command` 的工具，用来更新状态并触发迁移：

```python
from langchain.tools import tool
from langchain.messages import ToolMessage
from langgraph.types import Command

@tool
def transfer_to_specialist(runtime) -> Command:
    """转交给专业处理 Agent。"""
    return Command(
        update={
            "messages": [
                ToolMessage(
                    content="已转交给专业处理 Agent",
                    tool_call_id=runtime.tool_call_id
                )
            ],
            "current_step": "specialist"
        }
    )
```

> [!NOTE]
> 为什么要返回 `ToolMessage`？因为 LLM 发起工具调用后，消息历史里必须出现对应工具响应，否则对话结构会不完整，后续模型调用可能出错。

## 两种实现方式

handoffs 通常有两种实现路径：

1. 单 Agent + middleware
2. 多 Agent 子图（subgraphs）

### 单 Agent + middleware

这是更常见、也通常更简单的方式。一个 Agent 根据当前状态变量改变自己的行为，middleware 会在每次模型调用前动态调整系统提示词和可用工具。

例如：

- `triage` 阶段只开放“记录保修状态”类工具
- `specialist` 阶段改用解决问题和升级处理相关工具

典型实现思路：

1. 在状态中增加 `current_step`
2. 某些工具通过 `Command` 更新 `current_step`
3. middleware 读取 `current_step`
4. middleware 按当前阶段改写 `system_prompt` 和 `tools`

### 多 Agent 子图

另一种方式是把不同 Agent 做成图中的不同节点，再用 handoff 工具在节点之间跳转。此时工具通常会返回：

- `goto="target_agent"`
- `graph=Command.PARENT`

这样就能把执行流切换到另一个 Agent 节点。

不过这种方式对上下文工程要求更高，因为你必须自己明确决定：

- 哪些消息传给下一个 Agent
- 是传完整历史，还是只传必要片段
- 如何避免上下文膨胀

## 上下文工程注意点

在 subgraph handoff 中，你通常不能简单把所有消息都传给下一个 Agent。比较稳妥的做法是只传两条关键消息：

1. 触发 handoff 的 `AIMessage`
2. 与该工具调用配对的 `ToolMessage`

例如：

```python
@tool
def transfer_to_sales(runtime: ToolRuntime) -> Command:
    last_ai_message = runtime.state["messages"][-1]

    transfer_message = ToolMessage(
        content="已转交给销售 Agent",
        tool_call_id=runtime.tool_call_id,
    )

    return Command(
        goto="sales_agent",
        update={
            "active_agent": "sales_agent",
            "messages": [last_ai_message, transfer_message],
        },
        graph=Command.PARENT,
    )
```

这样做的好处是：

- 保持消息结构合法
- 避免把无关内部推理一股脑传给下游 Agent
- 降低 Token 成本

如果下一个 Agent 还需要更多信息，通常更好的做法是把摘要写进 `ToolMessage`，而不是直接传整段内部对话历史。

## 返回给用户时的要求

当流程结束并把控制权交回用户时，最后一条消息最好是 `AIMessage`。这能让消息历史保持清晰，也更方便前端和上层系统判断“当前 Agent 已经完成了这一轮回复”。

## 设计建议

在设计 handoffs 架构时，重点考虑：

- 上下文过滤策略：每个 Agent 接收完整历史、部分历史，还是摘要？
- 工具语义：handoff 工具只是更新路由状态，还是还会做副作用操作？
- Token 效率：上下文完整性和成本之间如何平衡？

## 实战建议

- 大多数 handoff 场景优先使用“单 Agent + middleware”，实现更简单。
- 只有在你确实需要多个高度定制的 Agent 子图时，才考虑多 Agent subgraphs。
- 所有 handoff 工具都要注意补全 `ToolMessage`。
- 如果需要跨轮持续保持当前阶段，务必使用持久化状态。

---
title: Multi-agent
description: 了解 LangChain 中的多 Agent 模式、适用场景与性能权衡
---

# Multi-agent

多 Agent 系统通过协调多个专门化组件来处理复杂工作流。但并不是所有复杂任务都一定需要它。有时候，一个拥有合适工具和提示词的单 Agent，就足以达到类似效果。

## 为什么要用多 Agent？

当开发者说自己需要“multi-agent”时，通常是在追求下面这些能力中的一种或几种：

- 上下文管理：为不同任务提供专业化知识，同时避免把所有内容一次性塞进单个上下文窗口。
- 分布式开发：让不同团队能够独立开发和维护各自能力，再组合成一个更大的系统。
- 并行化：把子任务分发给专门工作单元并发执行，以提高效率。

多 Agent 模式尤其适合这些情况：

- 单个 Agent 拥有过多工具，已经难以做出正确工具选择。
- 不同任务需要彼此独立的专业上下文和长提示。
- 工作流中存在明显的顺序约束，必须满足前置条件后才能启用下一步能力。

> [!TIP]
> 多 Agent 设计的中心问题其实仍然是 [上下文工程](/frameworks/langchain/advanced-usage/context-engineering)：你要决定每个 Agent 能看到什么信息。系统质量高度依赖于这件事。

## 主要模式

LangChain 中常见的多 Agent 模式包括：

| 模式 | 工作方式 |
| --- | --- |
| Subagents | 主 Agent 把子 Agent 当作工具调用，所有路由都经过主 Agent |
| Handoffs | 通过状态变化和工具调用在不同 Agent 或不同配置之间切换 |
| Skills | 单个 Agent 按需加载专门化提示和知识 |
| Router | 先做路由分类，再把请求分发给一个或多个专门 Agent |
| Custom workflow | 用 LangGraph 自定义执行流，把确定性逻辑和 Agent 行为混合起来 |

## 如何选择模式

可以从几个维度来判断：

- 是否希望不同团队独立维护组件？
- 是否需要并行执行？
- 是否支持多跳调用？
- 子 Agent 是否需要直接和用户对话？

大致上：

- 如果你需要主 Agent 统一调度，优先考虑 **Subagents**。
- 如果你需要在多轮对话中切换状态或角色，优先考虑 **Handoffs**。
- 如果你想保持单 Agent 架构，只在需要时加载专门上下文，优先考虑 **Skills**。
- 如果你有明显的知识域分类，并且想先分流再处理，优先考虑 **Router**。
- 如果以上模式都不够表达你的流程，就用 **Custom workflow**。

> [!TIP]
> 这些模式并不是互斥的。你完全可以混合使用，例如：
> - 一个 Subagents 架构内部调用 Router
> - 一个 Custom workflow 的节点内部再嵌入 Subagent
> - Subagents 再结合 Skills 按需加载上下文

## 性能比较

不同模式的性能特征不同，主要需要关注两个指标：

- 模型调用次数：越多，延迟和成本通常越高
- 处理的总 Token：越多，上下文成本越高，也更容易接近模型限制

### 单次请求

对于一次性的简单任务，例如“买杯咖啡”，通常：

- Handoffs、Skills、Router 更高效
- Subagents 会多一次主 Agent 汇总开销

### 重复请求

对于同一会话中反复执行相似任务：

- Handoffs、Skills 这类有状态模式优势更明显
- Router 和 Subagents 往往每次都要重新走一遍完整流程

### 多领域任务

对于需要并行查询多个知识域的任务，例如同时比较 Python、JavaScript、Rust：

- Subagents 和 Router 更适合，因为能并行执行且上下文隔离更好
- Skills 虽然调用次数可能更少，但容易把大量上下文累积进单次调用
- Handoffs 在这种场景通常不够高效，因为它更偏顺序执行

## 实际选择建议

- 你想优化单次请求：优先看 Handoffs、Skills、Router。
- 你想优化重复请求：优先看 Handoffs、Skills。
- 你想做并行执行：优先看 Subagents、Router。
- 你要处理大上下文专业领域：优先看 Subagents、Router。
- 你的任务简单且聚焦：Skills 往往已经足够。

## 下一步

如果你已经明确方向，可以继续看这些模式的具体说明：

- [Subagents](/frameworks/langchain/multi-agent/subagents)
- [Handoffs](/frameworks/langchain/multi-agent/handoffs)
- [Router](/frameworks/langchain/multi-agent/router)
- [Custom workflow](/frameworks/langchain/multi-agent/custom-workflow)
- [Skills](/frameworks/langchain/multi-agent/skills)

---
title: Router
description: 先对输入做路由分类，再把请求分发给一个或多个专门 Agent
---

# Router

在 **router** 架构中，会先有一个路由步骤对输入进行分类，然后把请求分发给专门的 [agents](/frameworks/langchain/core-components/agents)。这在你拥有多个明显不同的知识域时特别有用，例如不同团队、不同数据源、不同业务垂类各自对应不同 Agent。

## 关键特征

- Router 会先拆解或分类查询
- 然后调用零个、一个或多个专门 Agent
- 多个 Agent 的结果可以并行获取
- 最终再把结果综合成一个统一回答

## 什么时候适合用

Router 模式适合这些情况：

- 你有多个彼此独立的知识域
- 你希望按来源或能力分类，把问题送给最合适的 Agent
- 你需要并行查询多个数据源
- 你需要把多个来源的结果综合成一个答案

## 基本实现

Router 的核心工作就是“分类 + 分发”。

### 路由到单个 Agent

如果每个请求只会去一个目标 Agent，可以使用 `Command`：

```python
from langgraph.types import Command

def classify_query(query: str) -> str:
    """使用 LLM 或规则判断查询应该交给哪个 Agent。"""
    ...

def route_query(state: State) -> Command:
    active_agent = classify_query(state["query"])
    return Command(goto=active_agent)
```

### 并行路由到多个 Agent

如果同一个请求需要同时发给多个 Agent 并行处理，可以使用 `Send`：

```python
from typing import TypedDict
from langgraph.types import Send

class ClassificationResult(TypedDict):
    query: str
    agent: str

def classify_query(query: str) -> list[ClassificationResult]:
    ...

def route_query(state: State):
    classifications = classify_query(state["query"])
    return [
        Send(c["agent"], {"query": c["query"]})
        for c in classifications
    ]
```

## Stateless 与 Stateful

Router 可以分成两种实现思路：

- 无状态 Router
- 有状态 Router

### 无状态 Router

无状态 Router 会把每个请求都当成独立任务来处理，不保留跨轮对话记忆。

它适合：

- 单轮请求
- 路由逻辑清晰
- 不需要持续对话上下文

Router 和 Subagents 很像，但它们不是同一种模式：

- Router：通常是一个独立的分类步骤，本身不负责维护长期对话语境
- Subagents：由主 Agent 持续维护上下文，并在多轮中动态决定调用哪些子 Agent

如果你的输入类别明确，且更想用轻量分类逻辑做分发，那么 Router 很合适。

### 有状态 Router

如果你希望 Router 支持多轮对话，就需要自己管理状态和历史。

最简单的做法，通常不是把 Router 本身做成完整有状态系统，而是把 Router 包装成一个工具，让一个会话型 Agent 去调用它：

```python
@tool
def search_docs(query: str) -> str:
    """在多个文档源中搜索。"""
    result = workflow.invoke({"query": query})
    return result["final_answer"]

conversational_agent = create_agent(
    model,
    tools=[search_docs],
    prompt="你是一个有帮助的助手。遇到文档问题时使用 search_docs。",
)
```

这样做的好处是：

- 对话记忆由外层 Agent 维护
- Router 本身仍可保持简单、无状态
- 避免为多个并行 Agent 维护复杂的共享历史

如果你真的要让 Router 自己保持状态，那么就要依赖持久化，并在路由到各个 Agent 时自行决定如何传递历史消息。这会显著提升复杂度。

> [!WARNING]
> 有状态 Router 通常需要你自己管理历史拼接和上下文裁剪。如果不同 Agent 之间的语气、提示和职责差异很大，多轮体验可能不够自然。很多场景下，[handoffs](/frameworks/langchain/multi-agent/handoffs) 或 [subagents](/frameworks/langchain/multi-agent/subagents) 会更合适。

## 适合的系统类型

Router 特别适合：

- 多来源知识库问答
- 多垂类知识系统
- 并行检索系统
- 先分类后执行的工作流

## 与其他模式的区别

- 相比 Handoffs：Router 更偏“前置分类”，不是多轮状态流转
- 相比 Subagents：Router 更像预处理路由层，而不是持续调度的主管 Agent
- 相比 Skills：Router 强调“分发给不同执行单元”，Skills 更强调“按需加载上下文”

## 实践建议

- 如果分类规则清晰，优先让 Router 尽量轻量化。
- 如果需要并行处理多个知识域，Router 非常合适。
- 如果你更需要多轮语境和持续 orchestration，优先考虑 Subagents。
- 如果路由结果还要再综合，记得单独设计好 synthesis 步骤。

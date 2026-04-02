---
title: Custom workflow
description: 使用 LangGraph 自定义执行流，把确定性逻辑和 Agent 行为组合起来
---

# Custom workflow

在 **custom workflow** 架构中，你可以直接用 [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) 自定义自己的执行流。你对整个图结构拥有完全控制权，包括：

- 顺序步骤
- 条件分支
- 循环
- 并行执行

## 关键特征

- 对图结构拥有完全控制
- 可以把确定性逻辑和 Agent 行为混合起来
- 支持顺序、分支、循环和并行
- 可以把其他模式嵌入为工作流节点

## 什么时候适合用

当标准模式，例如 Subagents、Skills、Router 等，无法准确表达你的业务流程时，就适合使用 Custom workflow。

它特别适合这些情况：

- 你需要把规则逻辑和 Agent 推理混合起来
- 你的流程存在复杂路由或多阶段处理
- 你需要对每个节点的执行方式做非常细粒度的控制

在这种架构里，每个节点都可以是：

- 普通函数
- 单次 LLM 调用
- 一个完整 Agent
- 甚至另一个多 Agent 系统

## 基本实现

一个关键认知是：你完全可以在任意 LangGraph 节点中直接调用 LangChain Agent。

```python
from langchain.agents import create_agent
from langgraph.graph import StateGraph, START, END

agent = create_agent(model="openai:gpt-4.1", tools=[...])

def agent_node(state: State) -> dict:
    """一个在 LangGraph 节点中调用 LangChain Agent 的示例。"""
    result = agent.invoke({
        "messages": [{"role": "user", "content": state["query"]}]
    })
    return {"answer": result["messages"][-1].content}

workflow = (
    StateGraph(State)
    .add_node("agent", agent_node)
    .add_edge(START, "agent")
    .add_edge("agent", END)
    .compile()
)
```

这意味着你既可以获得自定义工作流的灵活性，又能复用 LangChain 现成的 Agent 抽象。

## 典型例子：RAG 流水线

Custom workflow 的一个常见用法，是把 [retrieval](/frameworks/langchain/advanced-usage/retrieval) 和 Agent 组合起来。

一个典型 RAG workflow 可能包含三种节点：

1. 模型节点：重写用户查询，以便更好地检索
2. 确定性节点：执行向量检索，不需要 LLM
3. Agent 节点：基于检索结果推理，并在必要时调用额外工具

例如下面这样的结构：

1. 用户问题进入系统
2. 先改写查询
3. 再去知识库检索
4. 最后由 Agent 结合上下文给出答案

## 工作流中的状态

Custom workflow 的一个重要优势，是你可以用 LangGraph 的 state 在步骤之间传递结构化数据。

例如，一个 RAG 工作流中的状态可以包含：

- `question`
- `rewritten_query`
- `documents`
- `answer`

这样每个节点都能读取自己需要的字段，并把新字段写回状态，后续节点再继续消费。

## 为什么它比固定模式更强

固定模式的优点是简单，但表达能力有限。Custom workflow 的优势在于：

- 你可以精准决定哪里用规则，哪里用模型
- 你可以把多个模式自由拼装
- 你可以对失败重试、分支回退、并发聚合等逻辑做精细控制

比如：

- 一个 Router 可以只是你的工作流里的一个节点
- 一个 Subagent 系统也可以作为单独节点被嵌入
- 一个节点可以做 deterministic validation，下一个节点再决定是否调用 Agent

## 适合的场景

Custom workflow 特别适合：

- 多阶段审批或处理流程
- 复杂 RAG 系统
- 含有并行和回退机制的业务流程
- 需要严格控制执行顺序与状态流转的系统

## 实践建议

- 如果标准模式已经够用，优先用标准模式，维护成本更低。
- 如果流程本身就是核心业务逻辑，且分支复杂，直接上 Custom workflow 更合适。
- 在工作流里尽量明确每个节点的责任边界，避免所有节点都变成“大而全 Agent”。
- 状态字段要设计清楚，保证节点之间的数据交换可预测、可调试。

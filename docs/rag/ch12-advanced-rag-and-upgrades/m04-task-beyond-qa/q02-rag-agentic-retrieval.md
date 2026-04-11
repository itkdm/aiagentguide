---
title: 12.4.2 什么时候 RAG 应该升级为“Agentic Retrieval”？
summary: 给出可操作的升级信号与迁移路径，判断何时需要 Agentic Retrieval。
---

# 12.4.2 什么时候 RAG 应该升级为“Agentic Retrieval”？

先给结论：*当检索不再是“一次性找证据”，而是“需要多轮决策、动态改写与工具协同”时，RAG 就该升级为 Agentic Retrieval。*

Agentic Retrieval 的本质不是“更复杂的检索”，而是“检索由 Agent 来控制”，它能动态决定检索路径与检索深度。

## 需要升级的典型信号

出现以下任意两项，你就应该考虑升级：

- 问题需要多跳检索或多阶段定位  
- 检索策略需要动态切换（语义、关键词、结构化）  
- 同一问题的检索路径因上下文而变化  
- 检索结果质量波动明显，需要主动纠错  
- 需要把检索与工具调用编排成流程  

## Agentic Retrieval 的最小形态

你可以从“轻量决策”开始，不需要一上来就做复杂 Agent：

1. **路由决策**：选择检索器或检索策略  
2. **查询改写**：根据结果质量改写 query  
3. **多轮检索**：进入更细范围  
4. **证据评估**：决定是否继续或停止  

最小伪代码示意：

```python
def agentic_retrieve(query):
    strategy = choose_strategy(query)
    candidates = retrieve(query, strategy=strategy)
    if not evidence_enough(candidates):
        query = rewrite(query)
        candidates = retrieve(query, strategy="hybrid")
    return candidates
```

这里的关键是“策略选择 + 纠错触发”，而不是复杂的规划。

## 从普通 RAG 到 Agentic Retrieval 的迁移路径

建议按下面的渐进式路线升级：

1. **加查询改写**：先解决检索信号不稳定  
2. **加多路召回**：提高覆盖率  
3. **加路由策略**：按问题类型切换检索  
4. **加自检与纠错**：稳定检索质量  
5. **引入 Agent**：让检索与工具调用协同  

这条路径的核心是“先补稳定性，再补决策力”。

## 常见误区

### 误区一：Agentic Retrieval 就是“更复杂的检索”

它的价值在于“检索决策被流程控制”，而不是检索器更复杂。

### 误区二：只有大型系统才需要

只要问题需要多轮检索与决策，哪怕是中小规模系统也值得引入。

### 误区三：一上来就做全量 Agent

可以先从“路由 + 查询改写 + 自检”做起，Agent 只是最后一步。

## 自检清单

- 检索策略是否经常需要人为调整？  
- 是否存在“同类问题需要不同检索路径”的情况？  
- 是否需要检索与工具调用协同完成任务？  

## 一句话总结

当检索需要“动态决策”而不是“固定流程”时，就该升级为 Agentic Retrieval。它让检索从“被动调用”变成“可控流程”。  

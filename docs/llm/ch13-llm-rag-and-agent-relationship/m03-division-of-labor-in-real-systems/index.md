---
title: 13.3 三者在实际系统中的分工
summary: 把 LLM、RAG、Tool Use、Workflow、Agent 放到真实系统里一起看，讲清楚它们各自更适合解决什么问题。
---

# 13.3 三者在实际系统中的分工

先给结论：**真实系统里最重要的不是“有没有把概念都用上”，而是每一层都做自己最擅长的事。LLM 负责理解与生成，RAG 负责补知识，工具负责拿真实数据和执行动作，Workflow 负责稳定流程，Agent 负责处理需要动态决策的多步任务。**

这部分会把这几层放到一张工程图里看。重点不是谁更高级，而是谁应该承担哪种责任。

## 这一节会回答什么问题

- [LLM、RAG、Tool Use、Workflow、Agent 之间是什么关系？](./q01-relationships-among-components)
- [一个实际 AI 应用中，哪些问题应该由 LLM 解决，哪些交给 RAG，哪些交给工具？](./q02-what-to-give-llm-rag-tools)
- [什么时候系统该从“纯 LLM”升级到“RAG”？](./q03-when-to-upgrade-to-rag)
- [什么时候系统该从“RAG”升级到“Agent”？](./q04-when-to-upgrade-to-agent)

## 读完后你应该能判断

- 一个系统的问题到底该落在哪一层解决
- 为什么很多系统根本不需要 Agent，也能做得很好
- 什么信号说明你真的该升级系统形态，而不是继续堆 prompt

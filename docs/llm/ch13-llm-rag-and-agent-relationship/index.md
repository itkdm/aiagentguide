---
title: 第 13 章 LLM 与 RAG、Agent 的关系
summary: 帮助读者把 LLM、RAG、Agent 三者放到一张图里看，理解它们在真实系统中的边界与协作关系。
---

# 第 13 章 LLM 与 RAG、Agent 的关系

先给结论：**LLM、RAG、Agent 不是并列替代关系，而是三类解决不同问题的能力：LLM 负责理解与生成，RAG 负责补外部知识，Agent 负责围绕目标做多步决策和工具协作。**

这一章的目标，就是把这三块真正串起来。很多人单看每一块都懂，一到系统设计就容易混：明明该补知识，却去堆 prompt；明明该做 workflow，却硬上 agent；明明该让模型负责表达，却把问题全交给检索。

## 建议阅读顺序

1. [13.1 LLM 与 RAG 的关系](./m01-llm-and-rag/)
2. [13.2 RAG 与 Agent 的关系](./m02-rag-and-agent/)
3. [13.3 三者在实际系统中的分工](./m03-division-of-labor-in-real-systems/)

## 主题模块

- [13.1 LLM 与 RAG 的关系](./m01-llm-and-rag/)
- [13.2 RAG 与 Agent 的关系](./m02-rag-and-agent/)
- [13.3 三者在实际系统中的分工](./m03-division-of-labor-in-real-systems/)

## 你应该建立的判断

- LLM 不是知识库，RAG 不是模型替代品，Agent 也不是所有系统都该做
- 这三者分别解决不同层的问题，组合方式要由任务类型决定
- 系统设计里真正重要的，不是概念更高级，而是谁在解决真实主因

## 关联章节

- 学完这一章后，建议继续阅读 [第 14 章 LLM 常见误区与面试高频问题](../ch14-misconceptions-and-interview-high-frequency/)。
- 如果你想回看前面的基础内容，也可以返回 [第 12 章 开源模型与模型选型](../ch12-open-source-models-and-selection/)。
- 如果你想进一步从完整检索链路理解 RAG，也可以继续阅读 [RAG 教程目录](/rag/)。

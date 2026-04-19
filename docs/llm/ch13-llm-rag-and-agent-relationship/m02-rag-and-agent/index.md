---
title: 13.2 RAG 与 Agent 的关系
summary: 讲清楚 RAG 和 Agent 的核心差别，以及为什么“有检索”不等于“有 Agent”。
---

# 13.2 RAG 与 Agent 的关系

先给结论：**RAG 解决的是“怎么给模型补知识”，Agent 解决的是“怎么围绕目标做多步决策和执行”。有检索能力，并不自动等于系统已经具备 Agent 能力。**

这一部分会把两者最容易混淆的地方拆开。很多团队把“会检索”误当成“会自主完成任务”，结果系统设计走偏。

## 这一节会回答什么问题

- [为什么有了 RAG 还不等于 Agent？](./q01-why-rag-is-not-agent)
- [RAG 和 Agent 的核心差别是什么？](./q02-rag-vs-agent-core-difference)
- [为什么 Agent 更强调任务分解、工具调用和执行闭环？](./q03-why-agent-emphasizes-closed-loop)

## 读完后你应该能判断

- 一个系统只是做了检索增强，还是已经进入 agentic 形态
- 为什么 RAG 更像知识增强层，Agent 更像任务执行层
- 什么场景只做 RAG 就够，什么场景才需要 Agent

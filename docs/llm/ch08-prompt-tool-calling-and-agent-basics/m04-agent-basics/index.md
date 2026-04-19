---
title: 8.4 Agent 基础
summary: 解释 Agent 与聊天机器人、Workflow 的边界，并说明什么情况下根本不该做 Agent。
---

# 8.4 Agent 基础

先给结论：**Agent 不是“会聊天的模型”，而是“能根据目标做多步决策、调用工具并根据结果继续行动的系统”。如果流程固定、结果可预测，很多时候应该做 Workflow，而不是 Agent。** 

这部分会从 Agent 和普通聊天机器人的区别讲起，帮助你理解 Agent、Workflow、RAG 之间的边界，以及什么情况下根本不该把系统设计成 Agent。

## 这一节会回答什么问题

- [Agent 和普通聊天机器人有什么区别？](./q01-agent-vs-chatbot)
- [Agent 为什么通常建立在 LLM + 工具 + 记忆 / RAG 之上？](./q02-agent-built-on-llm-tools-memory)
- [Workflow 和 Agent 的边界在哪里？](./q03-workflow-vs-agent)
- [什么情况下不该把系统设计成 Agent？](./q04-when-not-to-build-agent)

## 学完后你应该建立的判断

- Agent 的核心不是对话，而是多步决策与执行
- Agent 需要工具和状态管理，否则只是“会说话”
- 并不是越复杂越该用 Agent，很多问题更适合固定流程

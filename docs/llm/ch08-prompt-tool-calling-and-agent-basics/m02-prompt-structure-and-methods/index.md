---
title: 8.2 Prompt 的结构与常见方法
summary: 解释消息角色分工、zero-shot/few-shot/CoT 等常见方法，以及它们如何影响稳定性。
---

# 8.2 Prompt 的结构与常见方法

先给结论：**Prompt 不是一段随意文本，而是有结构的任务输入。不同角色分工和不同提示方法，会直接改变模型如何理解任务、如何组织输出。** 

这部分会介绍常见 Prompt 结构和方法，帮助你理解为什么不同任务类型需要不同的提示方式。

## 这一节会回答什么问题

- [System Prompt、User Prompt、Tool Prompt 分别起什么作用？](./q01-system-user-tool-prompt)
- [Zero-shot、Few-shot、Chain-of-Thought 分别是什么？](./q02-zero-shot-few-shot-cot)
- [为什么不同任务类型需要不同 Prompt 结构？](./q03-why-different-tasks-need-different-structures)
- [为什么 Prompt 设计会直接影响模型输出风格和稳定性？](./q04-why-prompt-affects-style-and-stability)

## 学完后你应该建立的判断

- 结构化 Prompt 比散乱指令更稳定
- few-shot 和 CoT 适合解决不同类型的问题
- Prompt 结构应该围绕任务目标设计，而不是套固定模板

---
title: 8.2 Prompt 的结构与常见方法
summary: 解释消息角色分工、zero-shot/few-shot/CoT 等常见方法，以及它们如何影响稳定性。
---

# 8.2 Prompt 的结构与常见方法

先给结论：**Prompt 不是一段随意文本，而是有结构的任务输入。不同角色分工和不同提示方法，会直接改变模型如何理解任务、如何组织输出。** 

这一节是在前面“Prompt 是什么”的基础上继续往下走：  
**不是只知道 Prompt 有用，而是知道一个好 Prompt 通常是怎么组织出来的。**

很多人一提 Prompt Engineering，就想到 few-shot、CoT、system prompt 这些术语，但实际问题往往不是“术语记不住”，而是：

- 不知道什么时候该上示例，什么时候不该上
- 不知道角色分工怎么影响模型行为
- 不知道为什么有些任务结构一换，稳定性差很多

所以这部分的重点不是列一堆方法名，而是把这些方法重新放回任务设计里看：  
不同任务需要不同的提示结构，不同结构又会带来不同的稳定性、可控性和成本。

## 这一节会回答什么问题

- [System Prompt、User Prompt、Tool Prompt 分别起什么作用？](./q01-system-user-tool-prompt)
- [Zero-shot、Few-shot、Chain-of-Thought 分别是什么？](./q02-zero-shot-few-shot-cot)
- [为什么不同任务类型需要不同 Prompt 结构？](./q03-why-different-tasks-need-different-structures)
- [为什么 Prompt 设计会直接影响模型输出风格和稳定性？](./q04-why-prompt-affects-style-and-stability)

## 学完后你应该建立的判断

- 结构化 Prompt 比散乱指令更稳定
- few-shot 和 CoT 适合解决不同类型的问题
- Prompt 结构应该围绕任务目标设计，而不是套固定模板

## 这一节适合怎么读

- 如果你现在还在靠“感觉”写 Prompt，这一节会帮你建立更稳定的组织方式
- 如果你经常分不清角色分工、few-shot 和 CoT 各自的作用，这一节要重点看
- 如果你关心的是输出稳定性，而不是单次演示效果，这一节比单纯背技巧更重要

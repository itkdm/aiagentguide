---
title: 8.3 工具调用
summary: 解释工具调用的本质、边界与价值，并说明为什么很多能力应该交给工具而不是让模型硬猜。
---

# 8.3 工具调用

先给结论：**工具调用的本质是让模型负责“判断该做什么”，而把搜索、计算、查询、执行这类确定性动作交给外部系统。** 

这部分会带你理解 Tool Calling / Function Calling 的本质，说明为什么很多能力应该交给工具而不是让模型硬猜。

## 这一节会回答什么问题

- [什么是 Function Calling / Tool Calling？](./q01-what-is-tool-calling)
- [LLM 为什么需要调用工具？](./q02-why-llm-needs-tools)
- [哪些能力适合交给模型，哪些能力应该交给工具？](./q03-model-vs-tool-boundaries)
- [为什么工具调用能显著降低模型“硬猜”的概率？](./q04-why-tool-calling-reduces-guessing)

## 学完后你应该建立的判断

- 模型适合解释、规划、组织语言
- 工具适合取数、计算、执行、校验
- 工具调用是降低幻觉和提升可控性的核心手段之一

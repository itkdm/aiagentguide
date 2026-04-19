---
title: 第 7 章 上下文窗口、记忆与长文本问题
summary: 解释上下文窗口的限制、模型“记忆”的本质，以及长上下文的常见问题与应对方式。
---

# 第 7 章 上下文窗口、记忆与长文本问题

先给结论：**LLM 的“记住”主要来自上下文窗口，而不是长期记忆；上下文长度是硬约束，且越长不一定越好用。** 

本章会帮助你建立三类判断：  
模型到底能“看到”多少信息、哪些记忆是参数内化、哪些是上下文临时、以及为什么长上下文仍然需要检索与组织。

## 建议阅读顺序

1. [7.1 上下文窗口是什么](./m01-what-is-context-window/)
2. [7.2 模型的“记忆”到底是什么](./m02-what-memory-means/)
3. [7.3 长上下文问题](./m03-long-context-problems/)
4. [7.4 长上下文与 RAG 的关系](./m04-long-context-vs-rag/)

## 主题模块

- [7.1 上下文窗口是什么](./m01-what-is-context-window/)
- [7.2 模型的“记忆”到底是什么](./m02-what-memory-means/)
- [7.3 长上下文问题](./m03-long-context-problems/)
- [7.4 长上下文与 RAG 的关系](./m04-long-context-vs-rag/)

## 关联章节

- 学完这一章后，建议继续阅读 [第 8 章 Prompt、工具调用与 Agent 基础](../ch08-prompt-tool-calling-and-agent-basics/)。
- 如果你想回看前面的基础内容，也可以返回 [第 6 章 推理、采样与生成控制](../ch06-inference-sampling-and-generation-control/)。

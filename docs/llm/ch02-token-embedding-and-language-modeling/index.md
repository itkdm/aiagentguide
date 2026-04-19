---
title: 第 2 章 Token、Embedding 与语言建模基础
summary: 解释 LLM 如何把文本变成可计算表示，并理解语言模型为什么能够按 token 逐步生成内容。
---

# 第 2 章 Token、Embedding 与语言建模基础

先给结论：**如果不理解 Token、Embedding 和语言建模，你就很难真正理解 LLM 为什么能工作，也很难理解它为什么会有上下文窗口、采样差异、长文本成本和生成不稳定这些现象。**

很多 LLM 现象表面上看像“模型很聪明”或“模型突然答错了”，但往下拆，往往都能回到这几个底层概念：模型看到的其实不是“词义本身”，而是 token 序列；模型内部处理的不是“句子原文”，而是向量表示；生成过程本质上是不断预测下一个 token。

这一章就是把这些最容易被跳过、但后面几乎所有内容都会依赖的基础概念讲清楚。

## 建议阅读顺序

1. [2.1 Token 是什么](./m01-what-is-token/)
2. [2.2 Embedding 与文本表示](./m02-embedding-and-representation/)
3. [2.3 语言模型与自回归生成](./m03-language-modeling-and-autoregression/)

## 主题模块

- [2.1 Token 是什么](./m01-what-is-token/)
- [2.2 Embedding 与文本表示](./m02-embedding-and-representation/)
- [2.3 语言模型与自回归生成](./m03-language-modeling-and-autoregression/)

## 你应该建立的判断

- LLM 处理的基本单位不是“单词”这个天然概念，而是 tokenizer 切出来的 token
- Embedding 的作用不是“存字典解释”，而是把离散 token 变成可学习的连续表示
- 生成式 LLM 的工作机制，本质上是基于上下文逐步预测下一个 token，而不是一次性“想完整答案”

## 关联章节

- 学完这一章后，建议继续阅读 [第 3 章 Transformer 与 Attention 机制](../ch03-transformer-and-attention/)。
- 如果你想回看前面的基础内容，也可以返回 [第 1 章 LLM 全景图与核心认知](../ch01-llm-overview-and-core-cognition/)。

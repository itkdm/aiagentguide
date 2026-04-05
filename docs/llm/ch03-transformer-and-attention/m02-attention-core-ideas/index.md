---
title: 3.2 Attention 机制的核心思想
summary: 帮助你理解 attention 的基本直觉、self-attention 如何建立全局依赖，以及 multi-head attention 为什么能提升表示能力。
---

# 3.2 Attention 机制的核心思想

这部分会聚焦 Attention 的核心直觉，帮助你理解 self-attention、多头注意力为什么能让模型更好地处理长距离依赖和复杂语义关系。

这一节最重要的，不是死记 `Q/K/V` 这几个符号，而是先抓住 attention 到底在解决什么问题：

- 当前这个位置，应该看序列里的哪些位置
- 不同位置的重要性应该怎么分配
- 为什么这种按相关性动态聚合上下文的方式，比固定窗口或链式传递更强

如果这层直觉先建立起来，后面再看公式和实现细节就不会那么抽象。

## 这一节会回答什么问题

- [Self-Attention 是什么？](./q01-what-is-self-attention)
- [Self-Attention 为什么能建模长距离依赖？](./q02-why-self-attention-long-dependency)
- [Multi-Head Attention 的作用是什么？](./q03-what-is-multi-head-attention)
- [为什么多头注意力能提升模型表达能力？](./q04-why-multi-head-helps)

## 学完这一节后，你应该建立的几个判断

- attention 的核心不是“看重点”这么简单，而是按相关性动态整合上下文
- self-attention 让序列中的每个位置都能直接利用其他位置的信息
- 多头注意力的价值，不是简单重复计算，而是让模型从不同关系子空间同时观察同一段输入

## 阅读建议

- 如果你刚接触 attention，先读 3.2.1 和 3.2.2
- 如果你总是听到 multi-head attention 但不知道多头到底多了什么，重点看 3.2.3 和 3.2.4

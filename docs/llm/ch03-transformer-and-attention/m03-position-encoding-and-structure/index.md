---
title: 3.3 位置编码与模型结构
summary: 讲清位置编码的作用、RoPE 的核心直觉，以及 Transformer 结构中 Attention、MLP、残差和 LayerNorm 如何协同工作。
---

# 3.3 位置编码与模型结构

这部分会讲清楚位置编码和 Transformer 结构本身是怎么配合工作的，帮助你把 Attention、MLP、残差连接和 LayerNorm 这些常见术语串成一个整体。

这一节的重点是把“位置”和“结构”两件事拆开再合起来看：

- 为什么需要位置编码，模型为什么不能只看 token 本身
- RoPE 这类位置编码为什么在现代 LLM 中更常见
- Transformer 的基本结构到底是什么样的层次组合
- Attention、MLP、残差、LayerNorm 各自解决什么问题

如果这几个点不清楚，很容易在阅读架构图时只记名字、不理解作用。

## 这一节会回答什么问题

- [Position Encoding 是什么？](./q01-what-is-position-encoding)
- [RoPE 是什么？为什么它在现代 LLM 中很常见？](./q02-what-is-rope)
- [Transformer 的基本结构是什么？](./q03-transformer-basic-structure)
- [Attention、MLP、残差连接、LayerNorm 分别起什么作用？](./q04-components-role)

## 学完这一节后，你应该建立的几个判断

- 位置编码的核心作用是把“顺序”注入到模型表示里，而不是给模型额外记忆
- RoPE 的核心价值是把相对位置信息自然融入 attention 计算中
- Transformer 的能力来自多个组件协同，而不是某一个模块单独决定

## 阅读建议

- 如果你对“为什么需要位置编码”没直觉，先读 3.3.1
- 如果你已经见过 RoPE 但不知道它在干什么，重点看 3.3.2
- 如果你想把架构图读懂，重点看 3.3.3 和 3.3.4

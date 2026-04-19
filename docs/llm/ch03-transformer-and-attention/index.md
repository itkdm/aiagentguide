---
title: 第 3 章 Transformer 与 Attention 机制
summary: 讲清 Transformer 为什么成为现代 LLM 的核心架构，以及 Attention、位置编码和结构范式分别解决什么问题。
---

# 第 3 章 Transformer 与 Attention 机制

先给结论：**Transformer 是现代 LLM 的结构基础，但真正重要的不是死记结构图，而是理解它为什么能替代早期 RNN/CNN 架构，以及 Attention、位置编码和不同结构范式分别在解决什么问题。**

如果你只记住“Transformer 很重要”，却不知道它为什么重要、解决了哪些旧问题、又带来了哪些新约束，后面学预训练、长上下文、推理成本和模型范式时都会感觉断层。

这一章会把 Transformer 拆成几层来看：为什么主流架构会从循环网络转向 Attention，Attention 到底在做什么，模型如何知道位置，Encoder-only、Decoder-only、Encoder-Decoder 又分别适合什么任务。

## 建议阅读顺序

1. [3.1 Transformer 为什么成为主流架构](./m01-why-transformer/)
2. [3.2 Attention 机制的核心思想](./m02-attention-core-ideas/)
3. [3.3 位置编码与模型结构](./m03-position-encoding-and-structure/)
4. [3.4 三种 Transformer 结构范式](./m04-transformer-paradigms/)

## 主题模块

- [3.1 Transformer 为什么成为主流架构](./m01-why-transformer/)
- [3.2 Attention 机制的核心思想](./m02-attention-core-ideas/)
- [3.3 位置编码与模型结构](./m03-position-encoding-and-structure/)
- [3.4 三种 Transformer 结构范式](./m04-transformer-paradigms/)

## 你应该建立的判断

- Transformer 成为主流，不只是因为“效果更好”，还因为它更适合并行训练和大规模扩展
- Attention 的关键价值在于建立 token 之间的动态关联，而不是简单“给关键词加权”
- 不同 Transformer 结构范式对应不同任务形态，不能脱离场景笼统比较谁更高级

## 关联章节

- 学完这一章后，建议继续阅读 [第 4 章 预训练机制](../ch04-pretraining/)。
- 如果你想回看前面的基础内容，也可以返回 [第 2 章 Token、Embedding 与语言建模基础](../ch02-token-embedding-and-language-modeling/)。

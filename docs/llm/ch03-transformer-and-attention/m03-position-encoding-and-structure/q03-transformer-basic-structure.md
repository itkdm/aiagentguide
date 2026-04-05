---
title: 3.3.3 Transformer 的基本结构是什么？
summary: 讲清 Transformer 的基础组成、典型层级结构，以及 encoder-only、decoder-only、encoder-decoder 的差异。
---

# 3.3.3 Transformer 的基本结构是什么？

先给结论：

**Transformer 的基本结构可以理解成“输入嵌入 + 位置编码 + 多层重复的注意力块”，每个块里包含 Attention、MLP、残差连接和 LayerNorm。**

如果用一句话概括：

**它是一个由“注意力 + 前馈”反复堆叠形成的深层序列建模架构。**

## 一个最简结构图

```text
输入文本
  -> tokenizer
  -> token embeddings + position encoding
  -> N 层 Transformer block
       - self-attention
       - MLP/FFN
       - residual + LayerNorm
  -> 输出表示
  -> 预测下一个 token / 任务头
```

这就是你在大多数 Transformer 架构图里看到的主干。

## Transformer block 里有什么

一个标准 block 通常包含两类核心子层：

- `自注意力层`：让每个位置按相关性聚合上下文
- `前馈网络（MLP/FFN）`：对每个位置做非线性变换

这两个子层之间通常都会配：

- 残差连接
- LayerNorm

这套结构反复堆叠，形成深层模型。

## 三种常见范式

Transformer 最重要的特性之一是它可以自然形成不同范式：

### 1. Encoder-only

- 输入序列双向可见
- 适合理解类任务
- 代表：BERT

### 2. Decoder-only

- 使用 causal mask，只能看见左侧历史
- 适合生成类任务
- 代表：GPT

### 3. Encoder-Decoder

- encoder 先编码输入
- decoder 在编码结果上做生成
- 适合翻译和序列到序列任务
- 代表：T5

这三类结构共享同一套核心思想，但在“信息可见范围”和“任务形式”上不同。

## 为什么 LLM 大多选择 decoder-only

这是一个很多人关心的问题。

简化理解：

- decoder-only 更自然地匹配“下一个 token 预测”的训练目标
- 架构更统一、更容易扩展
- 训练和推理链路更简化

这不意味着 encoder-only 或 encoder-decoder 不重要，而是说明：

**在通用大规模生成型模型这条主线上，decoder-only 更符合主流训练范式。**

## Transformer 结构的一个关键特点：可堆叠

Transformer 能做大模型，很重要的原因就是它的结构非常适合堆叠：

- block 结构固定
- 参数共享方式清晰
- 分布式并行训练可行

这使得“加深、加宽、扩大训练数据”成为一个非常可操作的工程路径。

## 你可以先这样记住

- Transformer = embedding + position + 多层 block 堆叠
- 每个 block 基本由 attention + MLP 构成
- 残差和 LayerNorm 是稳定训练和保持信息流的关键
- encoder-only / decoder-only / encoder-decoder 是三种常见形态

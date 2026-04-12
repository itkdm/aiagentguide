---
title: 4.2.4 什么是 Causal LM？
summary: 解释 Causal LM 的定义、它与 masked LM 的差异，以及它为何与 decoder-only LLM 对齐。
---

# 4.2.4 什么是 Causal LM？

先给结论：

**Causal LM（Causal Language Model）指的是“只使用左侧历史信息来预测下一个 token”的语言模型，它通过因果掩码保证模型看不到未来信息。**

这也是大多数 decoder-only LLM 的标准训练范式。

## 为什么叫“Causal”

这里的“causal”不是统计因果推断，而是指：

- 当前位置只能依赖过去
- 不能看到未来 token

这保证了模型训练时和生成时的条件一致。

所以 Causal LM 更准确的理解是“左到右自回归语言模型”。

## Causal LM 的基本训练方式

训练时，模型看到的是：

- token_1 ... token_{t-1}
- 目标是预测 token_t

为了保证这一点，会使用“causal mask”屏蔽未来位置，避免信息泄露。

这就是 Causal LM 的核心约束。

## 与 Masked LM 的区别

可以把 Causal LM 和 Masked LM 简单对比成：

- Causal LM：预测“下一个 token”
- Masked LM：预测“被遮住的 token”

Masked LM（例如 BERT）会随机遮住一些 token，让模型利用左右上下文去恢复。

这使得：

- Masked LM 更适合理解任务
- Causal LM 更适合生成任务

所以结构范式上：

- Masked LM 常用于 encoder-only
- Causal LM 常用于 decoder-only

## Causal LM 的工程意义

Causal LM 和 decoder-only LLM 的匹配非常直接：

- 训练目标是 next token prediction
- 推理方式是逐 token 生成

这让训练和推理高度一致，也降低了系统实现复杂度。

## 这是否意味着 Causal LM 一定最好

不是。

Causal LM 是当前通用生成模型的主流，但：

- 对理解和表征任务，Masked LM 依然有优势
- 对标准 seq2seq 任务，encoder-decoder 仍然很强

所以 Causal LM 是“主流范式”，不是“唯一最优范式”。

## 你可以先这样记住

- Causal LM = 只能看左侧历史的语言模型
- 通过 causal mask 保证不泄露未来信息
- 与 decoder-only 结构天然匹配
- 更适合生成任务，但不是唯一选择

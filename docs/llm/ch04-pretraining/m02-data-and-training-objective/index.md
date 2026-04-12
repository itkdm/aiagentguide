---
title: 4.2 预训练数据与训练目标
summary: 讲清预训练数据来源、规模与质量的影响，以及为什么 next token prediction 成为主流训练目标。
---

# 4.2 预训练数据与训练目标

这部分会带你看预训练阶段到底学什么、用什么数据学，以及为什么 next token prediction 会成为最常见的训练目标。

这一节的关键不是背数据集名称，而是建立三个判断：

- 预训练数据来自哪些常见类型来源
- 为什么“规模”和“质量”必须同时考虑
- 训练目标为什么通常选 next token prediction

## 这一节会回答什么问题

- [预训练数据通常来自哪里？](./q01-where-pretraining-data-comes-from)
- [为什么数据规模对 LLM 很重要？](./q02-why-data-scale-matters)
- [预训练目标为什么通常是 next token prediction？](./q03-why-next-token-objective)
- [什么是 Causal LM？](./q04-what-is-causal-lm)

## 学完这一节后，你应该建立的几个判断

- 预训练数据是“多来源混合”，而不是单一语料
- 数据规模重要，但质量和过滤策略同样关键
- next token prediction 之所以主流，是因为它统一、可扩展、与生成方式一致

## 阅读建议

- 如果你最关心训练数据来源和构建方式，先读 4.2.1
- 如果你在纠结“是不是越多越好”，重点看 4.2.2
- 如果你想理解训练目标和生成方式的关系，重点看 4.2.3 和 4.2.4

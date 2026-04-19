---
title: 第 4 章 预训练机制
summary: 解释 LLM 的通用能力如何通过大规模预训练形成，并理解预训练数据、目标、规模与能力边界之间的关系。
---

# 第 4 章 预训练机制

先给结论：**LLM 之所以看起来像“会很多事”，根本原因不在于它被人手工教会了每个任务，而在于它先经过了大规模预训练，学到了通用的语言模式、知识统计和表达能力。**

理解这一点非常关键。只有搞清楚预训练在做什么，你才能真正理解：

- 为什么模型会有通用能力
- 为什么规模扩大后能力会发生跃迁
- 为什么预训练后的模型仍然不等于一个好助手
- 为什么知识过时、幻觉和行为不可控会成为后续工程问题

这一章会把预训练拆成四部分：它是什么、吃什么数据、按什么目标训练、为什么规模会带来能力，以及为什么这些能力仍然有边界。

## 建议阅读顺序

1. [4.1 什么是预训练](./m01-what-is-pretraining/)
2. [4.2 预训练数据与训练目标](./m02-data-and-training-objective/)
3. [4.3 Scaling Law 与训练规模](./m03-scaling-law-and-training-scale/)
4. [4.4 预训练带来的能力与局限](./m04-abilities-and-limitations-of-pretraining/)

## 主题模块

- [4.1 什么是预训练](./m01-what-is-pretraining/)
- [4.2 预训练数据与训练目标](./m02-data-and-training-objective/)
- [4.3 Scaling Law 与训练规模](./m03-scaling-law-and-training-scale/)
- [4.4 预训练带来的能力与局限](./m04-abilities-and-limitations-of-pretraining/)

## 你应该建立的判断

- 预训练解决的是通用语言能力底座，不等于已经完成了助手化和业务适配
- 预训练效果不只取决于参数量，还取决于数据质量、训练目标和训练规模是否匹配
- 预训练带来的能力越强，后面越需要通过对齐、推理控制、RAG 和系统设计把能力放到对的位置上

## 关联章节

- 学完这一章后，建议继续阅读 [第 5 章 指令微调与对齐](../ch05-instruction-tuning-and-alignment/)。
- 如果你想回看前面的基础内容，也可以返回 [第 3 章 Transformer 与 Attention 机制](../ch03-transformer-and-attention/)。

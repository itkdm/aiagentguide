---
title: 第 11 章 LLM 优化与落地
summary: 从模型、Prompt、RAG、成本和系统设计角度，讲清楚 LLM 项目怎么优化、怎么落地。
---

# 第 11 章 LLM 优化与落地

先给结论：**LLM 落地的核心，不是把某个点做到极致，而是知道问题到底出在哪一层，然后用合适的手段去修。很多团队不是不会调模型，而是经常一开始就调错方向。**

这一章会把“怎么优化一个真实系统”拆开讲。你会看到：什么时候该换模型、什么时候该改 Prompt、什么时候该加 RAG、什么时候该做系统补偿，以及效果、延迟、成本之间怎么平衡。

## 建议阅读顺序

1. [11.1 模型、Prompt 与 RAG 的选择](./m01-model-prompt-rag-choices/)
2. [11.2 效果、延迟与成本的平衡](./m02-balance-quality-latency-cost/)
3. [11.3 常见优化手段](./m03-common-optimization-methods/)
4. [11.4 微调与系统增强](./m04-finetuning-vs-system-enhancement/)

## 主题模块

- [11.1 模型、Prompt 与 RAG 的选择](./m01-model-prompt-rag-choices/)
- [11.2 效果、延迟与成本的平衡](./m02-balance-quality-latency-cost/)
- [11.3 常见优化手段](./m03-common-optimization-methods/)
- [11.4 微调与系统增强](./m04-finetuning-vs-system-enhancement/)

## 你应该建立的判断

- 优化之前先做归因，先搞清楚是模型能力问题、知识问题、交互约束问题，还是系统链路问题
- 很多业务问题不该直接上微调，而应该先用 Prompt、RAG、工具和工作流把基础链路建对
- 真实落地不是单看效果最好，而是看效果、延迟、成本和可维护性能不能一起成立

## 关联章节

- 学完这一章后，建议继续阅读 [第 12 章 开源模型与模型选型](../ch12-open-source-models-and-selection/)。
- 如果你想回看前面的基础内容，也可以返回 [第 10 章 LLM 评测体系](../ch10-evaluation/)。

---
title: 第 10 章 LLM 评测体系
summary: 建立对 LLM 评测的基本判断，理解离线评测、线上效果和真实业务指标之间的关系。
---

# 第 10 章 LLM 评测体系

先给结论：**LLM 评测不是“找几个问题问一问，感觉还不错”这么简单。真正有用的评测，必须把任务目标、数据样本、评分方法和上线指标对应起来。**

这一章解决的是“怎么判断一个模型到底靠不靠谱”。你会看到：为什么主观印象很容易误导、为什么离线分数高不等于线上表现好、以及为什么真正的评测体系一定是多层的。

## 建议阅读顺序

1. [10.1 为什么不能只靠主观感觉评模型](./m01-why-not-judge-by-feel/)
2. [10.2 常见评测方式与 Benchmark](./m02-benchmarks-and-common-evals/)
3. [10.3 LLM-as-a-Judge 与评测实践](./m03-llm-as-a-judge-and-practice/)
4. [10.4 线上模型评估](./m04-online-evaluation/)

## 主题模块

- [10.1 为什么不能只靠主观感觉评模型](./m01-why-not-judge-by-feel/)
- [10.2 常见评测方式与 Benchmark](./m02-benchmarks-and-common-evals/)
- [10.3 LLM-as-a-Judge 与评测实践](./m03-llm-as-a-judge-and-practice/)
- [10.4 线上模型评估](./m04-online-evaluation/)

## 你应该建立的判断

- 评测不是为了“证明模型厉害”，而是为了支持选型、上线和迭代决策
- 单一 benchmark 分数不能代表真实业务可用性
- 离线能力、线上效果、用户体验和业务指标必须拆开看
- 没有持续评测的 LLM 系统，很难稳定优化

## 关联章节

- 学完这一章后，建议继续阅读 [第 11 章 LLM 优化与落地](../ch11-optimization-and-production/)。
- 如果你想回看前面的基础内容，也可以返回 [第 9 章 幻觉、稳定性与常见问题](../ch09-hallucination-stability-and-common-issues/)。

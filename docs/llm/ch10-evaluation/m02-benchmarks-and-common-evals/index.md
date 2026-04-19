---
title: 10.2 常见评测方式与 Benchmark
summary: 介绍预训练模型、指令模型的常见评测方式，以及 benchmark 的作用和局限。
---

# 10.2 常见评测方式与 Benchmark

先给结论：**评测方式一定要跟模型阶段和任务目标对应。预训练模型更常看语言建模能力和迁移能力，指令模型更常看指令遵循、事实性、任务完成和安全表现；而 benchmark 只是评测工具，不是业务结论本身。**

这部分会把“怎么评”和“评什么”拆开讲。你会看到，为什么同样叫“模型评测”，预训练模型和指令模型的关注点不一样，以及为什么行业里反复提到的 benchmark 既重要又容易被误用。

## 这一节会回答什么问题

- [预训练模型常见评测方式有哪些？](./q01-pretraining-model-evals)
- [指令模型常见评测方式有哪些？](./q02-instruction-model-evals)
- [什么是 Benchmark？](./q03-what-is-benchmark)
- [MMLU、GSM8K、HumanEval 分别在测什么？](./q04-what-do-mmlu-gsm8k-humaneval-measure)
- [为什么 benchmark 分高不一定代表真实业务效果就好？](./q05-why-benchmark-score-not-enough)

## 读完后你应该能判断

- 一个评测项更像在测语言建模、知识理解、数学推理还是代码生成
- 为什么同一个模型在不同 benchmark 上会表现差异很大
- benchmark 分数能说明什么，不能说明什么

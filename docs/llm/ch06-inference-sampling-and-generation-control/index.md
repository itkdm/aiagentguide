---
title: 第 6 章 推理、采样与生成控制
summary: 解释推理阶段的关键步骤、采样策略，以及如何用解码与控制手段稳定输出与成本。
---

# 第 6 章 推理、采样与生成控制

先给结论：**模型推理的核心是“在当前上下文下计算下一个 token 的概率分布”，采样策略决定输出风格，推理成本主要来自注意力与解码步骤。** citeturn3view0turn1search0turn1search7

本章会帮你弄清三个核心问题：  
为什么同样的提示会有不同答案、如何通过采样参数控制输出、以及推理为什么如此昂贵并该如何优化。citeturn1search0turn1search7turn3view0

## 建议阅读顺序

1. [6.1 模型推理时到底在做什么](./m01-what-happens-during-inference/)
2. [6.2 采样与解码策略](./m02-sampling-and-decoding/)
3. [6.3 输出控制与使用场景](./m03-output-control-and-use-cases/)
4. [6.4 推理效率优化](./m04-inference-efficiency/)

## 主题模块

- [6.1 模型推理时到底在做什么](./m01-what-happens-during-inference/)
- [6.2 采样与解码策略](./m02-sampling-and-decoding/)
- [6.3 输出控制与使用场景](./m03-output-control-and-use-cases/)
- [6.4 推理效率优化](./m04-inference-efficiency/)

## 关联章节

- 学完这一章后，建议继续阅读 [第 7 章 上下文窗口、记忆与长文本问题](../ch07-context-window-memory-and-long-context/)。
- 如果你想回看对齐与行为控制相关内容，可返回 [第 5 章 指令微调与对齐](../ch05-instruction-tuning-and-alignment/)。

---
title: 6.2.4 什么是 greedy decoding？
summary: 解释贪心解码的定义、优缺点与适用场景。
---

# 6.2.4 什么是 greedy decoding？

先给结论：**greedy decoding 就是每一步都选概率最大的 token，输出稳定但多样性最弱。** citeturn1search0

## greedy decoding 的特点

- **稳定**：同样输入几乎输出相同
- **可控**：容易满足格式与约束
- **缺乏多样性**：容易重复或过度保守

它适合“高确定性任务”，但不适合创意场景。citeturn1search0

## 什么时候用 greedy

你可以在这些场景优先用 greedy：

- 规则性强的任务（如分类、抽取）
- 需要稳定格式的输出
- 对随机性敏感的场景

## 常见误区

- 用 greedy 做创意生成，结果“太死板”
- 误以为 greedy 代表“更高质量”

你可以记住一句话：**greedy 解码追求稳定，不追求多样。**

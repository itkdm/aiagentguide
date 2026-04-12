---
title: 8.2.2 Zero-shot、Few-shot、Chain-of-Thought 分别是什么？
summary: 解释三类常见提示方法的定义、适用场景与边界。
---

# 8.2.2 Zero-shot、Few-shot、Chain-of-Thought 分别是什么？

先给结论：**zero-shot 是不给示例直接做任务，few-shot 是先给少量示例再做任务，Chain-of-Thought 是通过中间推理过程提升复杂推理任务表现。** citeturn0search0turn0search1turn0search2turn0search3

## Zero-shot

Zero-shot 的特点是：不给示例，只给任务说明。  
它适合定义清楚、模型本身已经有足够能力的任务。citeturn0search0turn0search2

优点是简单、便宜；缺点是对任务歧义更敏感。

## Few-shot

Few-shot 会先给几个示例，告诉模型“这个任务应该怎么做”。citeturn0search0  
它适合这些场景：

- 输出格式要求高
- 分类边界不够直观
- 想用示例统一风格

代价是会消耗更多上下文长度。

## Chain-of-Thought

Chain-of-Thought 通过显式提示模型进行分步推理，常用于数学、逻辑、多步决策等任务。citeturn0search1turn0search2turn0search3

它适合“需要推理路径”的问题，不适合所有任务都默认开启。

## 一个工程判断

你可以这样选：

- 任务简单明确：先试 zero-shot
- 任务格式敏感：优先 few-shot
- 任务推理复杂：尝试 CoT 或自一致性

## 结论收束

**三者不是“谁更高级”，而是针对不同任务难点的不同组织方式。**

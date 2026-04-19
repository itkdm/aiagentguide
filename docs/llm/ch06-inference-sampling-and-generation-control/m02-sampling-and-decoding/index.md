---
title: 6.2 采样与解码策略
summary: 解释温度、top-k、top-p 与贪心解码的差异，并说明如何影响输出风格。
---

# 6.2 采样与解码策略

先给结论：**解码策略决定“从概率分布里选哪个 token”，温度控制随机性，top-k/top-p 控制候选范围。** 

这部分会把常见采样参数讲清楚，帮助你知道为什么同一提示会有不同答案，以及怎样让输出更稳定或更有创造性。

## 这一节会回答什么问题

- [什么是 temperature？](./q01-what-is-temperature)
- [什么是 top-k / top-p？](./q02-what-are-topk-topp)
- [temperature 和 top-p 有什么区别？](./q03-temperature-vs-topp)
- [什么是 greedy decoding？](./q04-what-is-greedy-decoding)
- [为什么同样的问题回答会不同？](./q05-why-answers-differ)

## 学完后你应该建立的判断

- 采样参数影响的是“输出分布”，不是“模型能力”
- 越稳定的解码方式，越容易失去多样性
- 采样策略应该跟任务性质匹配

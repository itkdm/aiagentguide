---
title: 6.2.2 什么是 top-k / top-p？
summary: 解释 top-k 与 top-p 的含义、差异与典型使用方式。
---

# 6.2.2 什么是 top-k / top-p？

先给结论：**top-k 只从概率最高的 K 个 token 里采样，top-p（nucleus）从累计概率达到阈值的候选集合里采样。** citeturn1search0turn2view0

## top-k 是什么

top-k 会把候选空间缩小到“概率最高的 K 个 token”，再在其中采样。  
K 越小，输出越稳定；K 越大，输出越发散。citeturn1search0

## top-p 是什么

top-p（nucleus sampling）不是固定数量，而是选取“累计概率达到 p 的候选集合”，再在其中采样。citeturn2view0

这意味着：

- 高概率区域被保留
- 低概率尾部被截断

## 工程上怎么选

你可以按任务的“稳定性 vs 多样性”需求做选择：

- 需要稳定输出：更小的 top-k 或更低的 top-p
- 需要多样性：更大的 top-k 或更高的 top-p

## 常见误区

- 把 top-k 和 top-p 同时开到极端，导致输出不可控
- 误以为更大的候选集合一定更好

你可以先记住一句话：**top-k 控制“候选数量”，top-p 控制“候选概率覆盖率”。**

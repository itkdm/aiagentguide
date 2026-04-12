---
title: 6.2.3 temperature 和 top-p 有什么区别？
summary: 从“调分布 vs 切分布”角度解释差异，并给出组合使用建议。
---

# 6.2.3 temperature 和 top-p 有什么区别？

先给结论：**temperature 是“调分布”，top-p 是“切分布”。一个改变概率分布形状，一个改变候选集合范围。** citeturn1search0turn2view0

## temperature：调分布形状

temperature 会把概率分布“变平或变尖”，从而改变随机性。  
它不会裁剪候选空间，只改变每个 token 的相对概率。citeturn1search0

## top-p：裁剪候选空间

top-p 会保留累计概率达到阈值的候选集合，其余 token 被直接丢弃。citeturn2view0

## 二者如何配合使用

你可以这样理解组合策略：

- **先用 top-p 控制候选集合**：避免低概率“噪声 token”
- **再用 temperature 调整多样性**：在候选集合里控制随机性

## 常见误区

- 把 temperature 调得很高同时开大 top-p，导致输出失控
- 只调整 temperature，却不限制候选集合，导致噪声增多

你可以先记住一句话：**top-p 决定“可选范围”，temperature 决定“随机程度”。**

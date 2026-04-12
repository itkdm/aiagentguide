---
title: 5.4.1 什么是 RLHF？
summary: 解释 RLHF 的训练链路、数据形态与工程成本，并给出最小可行流程与常见坑。
---

# 5.4.1 什么是 RLHF？

先给结论：**RLHF（Reinforcement Learning from Human Feedback）是一条“人类偏好 → 奖励模型 → 强化学习优化”的对齐链路，用偏好信号把模型行为推向更有用、更安全的分布。** citeturn0search0turn0search2turn0search5

## RLHF 的典型训练链路

一条常见的 RLHF 流程是：

1. **准备指令数据并做 SFT**：让模型先具备基本的指令遵循能力。citeturn0search0
2. **收集偏好对比**：让标注者对同一指令的多个回复做“更好/更差”选择。citeturn0search2
3. **训练奖励模型（RM）**：用偏好对比训练一个“评分函数”。citeturn0search0turn0search2
4. **用 RL 优化策略模型**：常见做法是用 PPO 等算法在奖励模型上优化。citeturn0search0turn0search7

你可以把 RLHF 理解成：**用人类偏好定义“什么是好回答”，再用强化学习逼模型更常输出这种回答。** citeturn0search0turn0search2

## 偏好数据长什么样

偏好样本通常是成对的：

```json
{
  "prompt": "给出一段友好拒绝的回复",
  "chosen": "感谢你的邀请，但我暂时无法参与……",
  "rejected": "不行。"
}
```

关键不是数量，而是**偏好口径一致**。偏好口径混乱会直接导致风格漂移。citeturn0search2

## 工程成本与风险

RLHF 的常见成本主要在：

- **偏好数据昂贵**：需要高质量人工标注
- **训练链路复杂**：SFT、RM、RL 三段链路都要维护
- **稳定性敏感**：奖励模型偏差会被 RL 放大

这些问题决定了 RLHF 适合“高价值、高风险场景”，但不是每个团队的默认路线。citeturn0search0turn0search7

## 最小可行落地建议

如果你要尝试 RLHF，可按这个顺序减少风险：

1. 先用高质量 SFT 让模型“基本能用”
2. 用小规模偏好数据验证方向
3. 再扩到 RL，观察输出是否稳定改善

## 你可以先记住一句话

**RLHF 是用“人类偏好 + 强化学习”把模型行为拉向可接受范围的手段。**

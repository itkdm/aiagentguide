---
title: 5.2.2 什么是 Instruction Tuning？
summary: 解释 Instruction Tuning 的定义、数据构成与与普通 SFT 的差异。
---

# 5.2.2 什么是 Instruction Tuning？

先给结论：**Instruction Tuning 是“以指令为中心”的 SFT，核心是用多任务、跨领域的指令-回答数据，把模型推向“按指令做事”的行为分布。** citeturn2view0turn2view4

它不是新训练算法，而是训练目标与数据结构的升级：从“单任务微调”转向“指令驱动的多任务微调”。citeturn2view0turn2view4

## Instruction Tuning 的数据长什么样

典型样本结构是：

```json
{"instruction": "把这段客服记录总结为三条要点", "input": "（一段对话记录）", "output": "1) ... 2) ... 3) ..."}
```

关键在于 **instruction 的多样性**：不同任务、不同格式、不同领域，让模型形成“读指令→选策略→输出”的通用模式。citeturn2view0turn2view4

## 它和普通 SFT 的差异

- **普通 SFT**：更像“为一个任务调整行为”
- **Instruction Tuning**：更像“教模型理解指令这种输入形式”

因此它更擅长提升 **零样本/少样本泛化**。citeturn2view0turn2view4

## 工程上什么时候用它

你可以在这些场景优先考虑 Instruction Tuning：

- 你想让模型适配多个任务，而不是单一任务
- 你希望模型能通过指令而不是固定模板工作
- 你需要更好的泛化能力而不是单点最优

如果只是追求某个狭窄任务的极致效果，普通 SFT 仍然更高效。citeturn2view0turn2view4

## 常见误区

- 误把“多任务”当成“样本越杂越好”
- 指令格式不统一，导致模型无法稳定解析指令
- 忽视评测集的任务覆盖，导致“看似有效、上线失效”

你可以记住一句话：**Instruction Tuning 解决的是“理解指令”而不是“更懂知识”。**

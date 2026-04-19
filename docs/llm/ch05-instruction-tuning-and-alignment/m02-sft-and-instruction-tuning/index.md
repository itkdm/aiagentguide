---
title: 5.2 SFT 与 Instruction Tuning
summary: 解释 SFT、Instruction Tuning 与 In-Context Learning 的区别，并给出工程选型的判断路径。
---

# 5.2 SFT 与 Instruction Tuning

先给结论：**SFT 是用有监督数据微调模型，Instruction Tuning 是以“指令-任务”为核心的 SFT 形态，而 In-Context Learning 是不更新参数、靠提示完成迁移的能力。** 

这一节看起来在讲术语区别，实际上要解决的是一个很现实的工程问题：  
**当你希望模型“更像助手”时，到底应该靠参数更新，还是靠上下文示例；应该做通用指令微调，还是针对场景做定向塑形。**

SFT、Instruction Tuning 和 In-Context Learning 容易被混成一团，原因是它们看起来都在“让模型按要求做事”。但三者在成本、稳定性、适用阶段和可复用性上差别很大。

这一节会把它们拆开讲清，并把问题落到工程判断上：什么时候该先试 Prompt，什么时候该上微调，什么时候应该优先做通用指令数据，而不是一开始就做很窄的领域适配。

## 本节会回答的问题

- [什么是 SFT（Supervised Fine-Tuning）？](./q01-what-is-sft)
- [什么是 Instruction Tuning？](./q02-what-is-instruction-tuning)
- [什么是 In-Context Learning？](./q03-what-is-in-context-learning)
- [为什么指令微调能让模型更像“助手”？](./q04-why-instruction-tuning-helps)
- [In-Context Learning 和微调分别适合解决什么问题？](./q05-icl-vs-finetuning)

## 学完后你应该建立的判断

- 如果你有可控的标注数据，SFT 是最直接的能力塑形方式
- Instruction Tuning 适合把模型推向“按指令做事”的行为分布
- In-Context Learning 适合快速试验或低成本迁移，但稳定性受限

## 这一节适合怎么读

- 如果你总是把“给几个示例”和“真正做了微调”混为一谈，这一节要重点看
- 如果你在做模型选型或能力塑形，这一节的重点不是概念定义，而是适用边界和实施顺序
- 如果你未来会碰到领域微调、偏好优化或 Agent 能力塑形，这一节是后面的基础

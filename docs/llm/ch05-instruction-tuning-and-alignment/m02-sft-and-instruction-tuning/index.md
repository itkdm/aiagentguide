---
title: 5.2 SFT 与 Instruction Tuning
summary: 解释 SFT、Instruction Tuning 与 In-Context Learning 的区别，并给出工程选型的判断路径。
---

# 5.2 SFT 与 Instruction Tuning

先给结论：**SFT 是用有监督数据微调模型，Instruction Tuning 是以“指令-任务”为核心的 SFT 形态，而 In-Context Learning 是不更新参数、靠提示完成迁移的能力。** 

这一节会把三者拆开，讲清它们分别解决什么问题、什么时候更合适，以及为什么 instruction tuning 往往能显著改善零样本或少样本表现。

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

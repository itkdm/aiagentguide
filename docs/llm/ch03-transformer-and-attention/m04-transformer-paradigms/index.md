---
title: 3.4 三种 Transformer 结构范式
summary: 帮助你区分 Encoder-only、Decoder-only、Encoder-Decoder 三类结构，理解它们各自适合的任务类型，以及为什么主流 LLM 多选择 Decoder-only。
---

# 3.4 三种 Transformer 结构范式

这部分会带你区分 Encoder-only、Decoder-only、Encoder-Decoder 三类结构，理解它们分别适合哪些任务，以及为什么今天的大多数 LLM 都走向了 Decoder-only。

这一节的关键是建立一套“结构 -> 任务匹配”的判断，而不是只背模型名字：

- Encoder-only 强在理解和表示
- Decoder-only 强在生成和统一训练范式
- Encoder-Decoder 适合标准的序列到序列任务

如果这三类关系没分清，很多模型对比和选型就会陷入“谁更强”的模糊讨论。

## 这一节会回答什么问题

- [Decoder-only、Encoder-only、Encoder-Decoder 分别适合什么任务？](./q01-three-paradigms)
- [为什么今天的大多数 LLM 都是 Decoder-only？](./q02-why-decoder-only)
- [BERT、T5、GPT 这几类模型分别代表什么思路？](./q03-bert-t5-gpt-differences)

## 学完这一节后，你应该建立的几个判断

- 三种范式的核心差异，不在“名字”，而在信息可见范围和训练目标
- Decoder-only 成为主流，更多是工程和训练范式推动，而不是单纯“效果最好”
- BERT、T5、GPT 对应的是三种不同结构路线的典型代表

## 阅读建议

- 如果你想先知道三类结构各自擅长什么，先读 3.4.1
- 如果你关心“为什么 LLM 不走 encoder-only”，重点看 3.4.2
- 如果你要做模型选型对比，重点看 3.4.3

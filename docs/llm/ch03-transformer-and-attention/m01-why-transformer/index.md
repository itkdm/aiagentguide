---
title: 3.1 Transformer 为什么成为主流架构
summary: 帮助你理解 Transformer 为什么成为 LLM 时代的主流架构，以及它相较 RNN 等传统序列模型在大规模训练和长上下文建模上的关键优势。
---

# 3.1 Transformer 为什么成为主流架构

这部分会解释 Transformer 为什么成为大模型时代的主流架构，以及它相对 RNN 等传统序列模型到底强在哪里。

这一节的核心，不是只记一句“Transformer 很强”，而是要把下面三个问题连起来看：

- 为什么旧的序列模型路线很难支撑大模型时代
- 为什么 attention 机制更适合处理长序列和大规模训练
- 为什么 GPT、BERT、T5 这类模型几乎都建立在 Transformer 系列结构上

如果这层逻辑没建立起来，后面你再看 self-attention、多头注意力、位置编码时，就容易只记模块名，不知道这些设计到底在解决什么问题。

## 这一节会回答什么问题

- [Transformer 为什么会成为大模型基础架构？](./q01-why-transformer-mainstream)
- [Attention 为什么比 RNN 更适合大规模建模？](./q02-attention-vs-rnn)
- [Transformer 相比传统序列模型的核心优势是什么？](./q03-transformer-core-advantages)

## 学完这一节后，你应该建立的几个判断

- Transformer 成为主流，不是因为它“新”，而是因为它更适合大规模训练和长序列建模
- attention 的价值不只是“看重点”，更重要的是它打破了串行依赖带来的建模和训练瓶颈
- Transformer 的优势不只体现在单点精度，更体现在可扩展性、训练效率和统一架构能力上

## 阅读建议

- 如果你想先抓全局原因，先读 3.1.1
- 如果你总听到“RNN 不行，attention 才行”，但不知道具体差在哪，重点看 3.1.2
- 如果你想从工程和架构层面理解 Transformer 主流化，重点看 3.1.3

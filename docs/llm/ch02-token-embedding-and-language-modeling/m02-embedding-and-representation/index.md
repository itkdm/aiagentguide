---
title: 2.2 Embedding 与文本表示
summary: 帮助你理解 embedding 在模型中的作用，弄清 token 为什么要变成向量、向量表示为什么有意义，以及它和 RAG 中 embedding 的关系与区别。
---

# 2.2 Embedding 与文本表示

这部分会帮你理解 embedding 在模型里的角色，先看 token 为什么需要被映射成向量，再看这种表示方式和 RAG 场景中的 embedding 有什么联系与区别。

很多人第一次听到 embedding，会觉得它像一个很抽象的专业词。但如果把 LLM 真正跑起来，你会发现它是绕不过去的基础层：

- token 要先变成 embedding，模型才能算
- 语义相近为什么能在向量空间里靠近，本质和 embedding 有关
- RAG 为什么能做相似度检索，也和 embedding 有关

所以这一节最重要的任务，是先把“embedding 到底是什么”讲清楚，再把两个容易混掉的问题拆开：

- LLM 里的 embedding 是怎么参与语言建模的
- RAG 里的 embedding 又是怎么参与检索的

这两者相关，但不是一回事。

## 这一节会回答什么问题

- [什么是 Embedding？](./q01-what-is-embedding)
- [为什么模型需要把 token 映射成向量表示？](./q02-why-vector-representation)
- [Embedding 在 LLM 里主要负责什么？](./q03-embedding-role-in-llm)
- [它和 RAG 里的 embedding 有什么异同？](./q04-embedding-vs-rag-embedding)

## 学完这一节后，你应该建立的几个判断

- embedding 不是“语义解释文本”，而是把离散符号映射成可计算向量
- 向量表示的意义，不在于每一维好不好解释，而在于整体几何关系能不能承载有用模式
- LLM 内部 token embedding 和 RAG 检索 embedding 都叫 embedding，但服务目标不同，不能直接混用概念

## 阅读建议

- 如果你刚接触 embedding，先按顺序读完 2.2.1 到 2.2.3
- 如果你最容易混淆的是“LLM 的 embedding”和“RAG 的 embedding”，重点看 2.2.4
- 读完这一节后，建议继续看 [2.3 语言建模与自回归生成](../m03-language-modeling-and-autoregression/)

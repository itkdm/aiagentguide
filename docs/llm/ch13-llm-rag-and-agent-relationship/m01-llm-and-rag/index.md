---
title: 13.1 LLM 与 RAG 的关系
summary: 解释为什么有了 LLM 仍然需要 RAG，以及什么问题更适合纯 LLM 或 LLM+RAG。
---

# 13.1 LLM 与 RAG 的关系

先给结论：**LLM 负责“理解和生成”，RAG 负责“把外部知识喂给模型”。有了强 LLM 以后，RAG 依然重要，因为很多问题的瓶颈不是语言能力，而是事实来源。**

这部分会先把 LLM 和 RAG 的边界讲清楚，再解释为什么知识型问题通常不能只靠模型参数本身解决。

## 这一节会回答什么问题

- [为什么有了 LLM 还需要 RAG？](./q01-why-llm-still-needs-rag)
- [为什么很多“知识型问题”只靠 LLM 不够？](./q02-why-knowledge-problems-need-more-than-llm)
- [哪些问题更适合纯 LLM，哪些更适合 LLM + RAG？](./q03-pure-llm-vs-llm-plus-rag)

## 读完后你应该能判断

- 一个问题究竟是在考模型能力，还是在考知识供给
- 什么时候纯 LLM 就够，什么时候必须引入 RAG
- 为什么“长上下文变大了”也不等于“RAG 没用了”

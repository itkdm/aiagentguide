---
title: 设计理念
description: LangChain 的目标是成为使用大语言模型进行开发时最容易上手、同时又足够灵活并可用于生产环境的框架。
---

# 设计理念

LangChain 建立在以下几个核心信念之上：

- 大语言模型（LLM）是一项强大且重要的新技术。
- 当大语言模型与外部数据源结合使用时，它们会更加强大。
- 大语言模型将改变未来应用的形态。更具体地说，未来的应用会越来越具备 Agent 化特征。
- 这场变革目前仍处于非常早期的阶段。
- 虽然构建这类 Agent 应用的原型并不难，但要构建足够可靠、能够投入生产环境的 Agent 仍然非常困难。

在 LangChain 中，我们主要专注于两个方向。

## 1. 让开发者能够基于最好的模型进行构建

不同的 provider 会暴露不同的 API，并具有不同的模型参数和消息格式。

将这些模型输入与输出标准化，是我们的核心重点之一。这让开发者可以更方便地切换到最新、最先进的模型，同时避免被单一 provider 锁定。

## 2. 让模型更容易编排复杂流程，并与其他数据和计算结合

模型的用途不应仅限于文本生成，它们还应该能够编排更复杂的流程，并与其他数据源发生交互。

LangChain 让你可以轻松定义可由 LLM 动态调用的工具，也能帮助你解析和访问非结构化数据。

## 历史

由于这个领域变化极快，LangChain 也随着时间不断演化。下面是一条简要时间线，用来说明 LangChain 在这些年里是如何随 LLM 开发范式一起变化的。

### 2022-10-24（v0.0.1）

在 ChatGPT 发布前一个月，**LangChain 作为一个 Python 包正式发布**。当时它主要由两个部分构成：

- LLM 抽象层
- 用于常见场景的一系列“Chains”，也就是预定义好的计算步骤。例如 RAG：先执行检索步骤，再执行生成步骤

LangChain 这个名字来源于 “Language”（如 language models）和 “Chains”。

### 2022-12

LangChain 中加入了第一批通用 Agent。

这些通用 Agent 基于 [ReAct 论文](https://arxiv.org/abs/2210.03629)（ReAct 即 Reasoning and Acting）。它们使用 LLM 生成表示工具调用的 JSON，再解析这些 JSON 来决定应该调用哪些工具。

### 2023-01

OpenAI 发布了 `Chat Completion` API。

在此之前，模型接收字符串并返回字符串。而在 ChatCompletions API 中，模型开始接收消息列表并返回一条消息。其他模型 provider 也陆续采用了类似方式，LangChain 也随之更新，以支持消息列表这种交互格式。

### 2023-02

**LangChain Inc. 围绕开源 LangChain 项目成立为公司。**

其主要目标是“让智能 Agent 无处不在”。团队意识到，虽然 LangChain 是关键组成部分之一（它让开发者更容易开始使用 LLM），但同时也还需要其他组件来补齐整个生态。

### 2023-03

OpenAI 在其 API 中发布了 `function calling`。

这使得 API 可以显式生成代表工具调用的负载。其他模型 provider 也很快跟进，LangChain 也更新为优先采用这种工具调用方式，而不再主要依赖解析 JSON。

### 2023-06

**LangSmith 作为 LangChain Inc. 的闭源平台正式发布**，提供可观测性与评估能力。

构建 Agent 的核心问题之一，是如何让它们足够可靠。LangSmith 正是为解决这一需求而构建的。LangChain 也随之更新，以便与 LangSmith 无缝集成。

### 2024-01（v0.1.0）

**LangChain 发布 0.1.0**，这是它第一个不再属于 `0.0.x` 的版本。

行业开始从原型阶段走向生产阶段，因此 LangChain 也进一步强化了对稳定性的关注。

### 2024-02

**LangGraph 作为一个开源库发布。**

最初的 LangChain 主要聚焦于两个方向：LLM 抽象层，以及便于快速上手常见应用的高级接口；但它缺少一个底层编排层，无法让开发者精确控制 Agent 的执行流程。于是，LangGraph 出现了。

在构建 LangGraph 的过程中，我们吸取了构建 LangChain 时的经验，并加入了后来证明十分必要的能力，例如流式处理、持久执行、短期记忆、human-in-the-loop 等。

### 2024-06

**LangChain 已拥有超过 700 个集成。**

这些集成从核心 LangChain 包中拆分出来，核心集成进入各自独立的包，其他集成则进入 `langchain-community`。

### 2024-10

对于任何不止包含一次 LLM 调用的 AI 应用，LangGraph 成为了首选构建方式。

随着开发者努力提升应用可靠性，他们需要比高级接口更强的控制力，而 LangGraph 提供了这种底层灵活性。LangChain 中的大多数 chains 和 agents 也因此被标记为弃用，并附带迁移到 LangGraph 的指南。

不过，LangGraph 中仍保留了一个高级抽象：Agent 抽象。它构建在底层 LangGraph 之上，并且与 LangChain 中的 ReAct Agent 使用相同接口。

### 2025-04

模型 API 变得更加多模态。

模型开始支持文件、图片、视频等更多输入形式。我们也相应更新了 `langchain-core` 的消息格式，使开发者能够以标准方式描述这些多模态输入。

### 2025-10-20（v1.0.0）

**LangChain 发布 1.0**，其中包含两个重大变化：

1. `langchain` 中所有 chains 和 agents 都经过彻底重构。现在所有 chains 和 agents 都被统一为一个高级抽象：构建在 LangGraph 之上的 Agent 抽象。这个高级抽象最初诞生于 LangGraph，后来被迁移到了 LangChain 中。

   如果你仍在使用旧版 LangChain 的 chains 或 agents，并且暂时不想升级（虽然官方建议升级），你仍然可以通过安装 `langchain-classic` 包继续使用旧版 LangChain。

2. 引入标准化的消息内容格式。模型 API 已从只返回简单字符串内容的消息，演进为可以返回更复杂的输出类型，例如 reasoning blocks、引用、服务端工具调用等。LangChain 因此也演进了消息格式，用于在不同 provider 之间统一这些能力。

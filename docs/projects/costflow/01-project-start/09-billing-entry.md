---
title: "现有 AI 调用缺了什么：找到 CostFlow 的第一个计费入口"
description: "从真实 AI 调用链出发，梳理 RuoYi Vue Pro 当前遗漏的模型 Usage，并找到 CostFlow 第一阶段最值得研究的计量边界。"
summary: "确认模型响应中的 Usage 如何在现有 AI 业务中被忽略，并区分业务请求、模型调用与后续计费之间的边界。"
keywords:
  - CostFlow 计费入口
  - AI Usage
  - Token 用量
  - Spring AI
tags:
  - CostFlow
  - AI 调用
  - Usage
  - Spring AI
author: 布吉岛
lastUpdated: 2026-09-13
status: draft
assets: none
reviewed: false
sourceType: original
draft: true
noindex: true
---

# 现有 AI 调用缺了什么：找到 CostFlow 的第一个计费入口

上一篇我们已经沿着一次真实聊天，把调用链从前端一直追到了 Spring AI：

```text
AI 聊天页面
    ↓
AiChatMessageController
    ↓
AiChatMessageServiceImpl
    ↓
buildPrompt()
    ↓
ChatModel / StreamingChatModel
    ↓
Spring AI
    ↓
模型 Provider
    ↓
ChatResponse
```

而且我们还发现了一件很关键的事情。

当前项目使用的 Spring AI `1.1.8` 中，`ChatResponse` 不只有模型生成的文本，响应元数据还提供了统一承载 `Usage` 的位置：

```java
ChatResponse
    ↓
getMetadata()
    ↓
getUsage()
    ↓
getPromptTokens()
getCompletionTokens()
getTotalTokens()
```

Spring AI `1.1.8` 的 `Usage` 接口确实提供 `getPromptTokens()`、`getCompletionTokens()`、`getTotalTokens()` 和 `getNativeUsage()`；但某次响应是否携带完整 Usage，还要看具体 Provider 和调用方式。

但是当前 RuoYi Vue Pro 的 Chat 业务代码拿到 `ChatResponse` 后，主要只读取：

```java
AiUtils.getChatResponseContent(chunk);

AiUtils.getChatResponseReasoningContent(chunk);
```

然后把回答内容写回 `ai_chat_message`。

也就是说，现在真正缺少的并不是：

> “怎么调用大模型？”

而是：

> **Spring AI 的响应链路中已经有 Usage 的承载位置，但当前业务代码还没有把它稳定地转化为业务数据。**

这就是 CostFlow 第一阶段需要先解决的问题。

---

## 先把现在缺的东西说清楚

如果只看当前聊天页面，一次调用已经相当完整：

```text
用户是谁
    ↓
userId

在哪个对话里
    ↓
conversationId

用了哪个模型
    ↓
modelId / model

问了什么
    ↓
content

模型回答什么
    ↓
content / reasoningContent

是否使用知识库、搜索、附件
    ↓
segmentIds / webSearchPages / attachmentUrls
```

但如果从“计量和计费”的角度看，这条记录还少了最关键的一段：

```text
这次模型调用到底消耗了多少资源？
```

例如最基本的 Chat 模型调用，我们至少希望知道：

```text
Prompt Tokens
Completion Tokens
Total Tokens
```

而当前：

```text
ai_chat_message
```

并没有保存这些数据。

上一篇已经看过，`AiChatMessageDO` 主要保存的是消息、模型、知识库、搜索和附件等业务上下文，并不存在 `promptTokens`、`completionTokens`、`totalTokens` 这样的实际模型用量字段。

---

## Usage 和计费还不是一回事

既然已经拿到了：

```text
promptTokens
completionTokens
```

那是不是直接：

```text
Token × 单价 = 费用
```

然后扣费就结束了？

不是。

我们需要先把几个概念分开。

```text
模型实际返回
    ↓
Usage
    ↓
Metering
    ↓
Pricing
    ↓
Billing
```

其中第一层：

```text
Usage
```

只是记录：

> **这次到底用了多少。**

例如：

```text
promptTokens     = 1250
completionTokens = 380
totalTokens      = 1630
```

它还没有回答：

```text
这 1250 个输入 Token 应该按什么价格计算？
这 380 个输出 Token 单价是多少？
这是哪个价格版本？
是否赠送？
是否需要收费？
从哪个账户扣？
```

这些都属于后面的事情。

---

## 现有代码到底在哪里丢掉了 Usage

还是回到：

```text
backend/yudao-module-ai/src/main/java/
cn/iocoder/yudao/module/ai/service/chat/
AiChatMessageServiceImpl.java
```

当前流式聊天中真正调用模型的是：

```java
Prompt prompt = buildPrompt(
    conversation,
    historyMessages,
    knowledgeSegments,
    webSearchResponse,
    model,
    sendReqVO
);

Flux<ChatResponse> streamResponse =
        chatModel.stream(prompt);
```

随后：

```java
return streamResponse.map(chunk -> {

    String newContent =
            AiUtils.getChatResponseContent(chunk);

    String newReasoningContent =
            AiUtils.getChatResponseReasoningContent(chunk);

    // 拼接文本、返回前端
    // ...

});
```

这里的 `chunk` 本身就是：

```java
ChatResponse
```

而 Spring AI 的：

```java
ChatResponse#getMetadata()
```

会返回 `ChatResponseMetadata`。

在当前依赖中，继续进入：

```java
ChatResponseMetadata#getUsage()
```

就可以尝试取得：

```java
Usage
```

Spring AI 源码中已经明确：

```java
public Usage getUsage() {
    return this.usage;
}
```

因此理论上，在这一层已经可以：

```java
Usage usage =
        chunk.getMetadata().getUsage();

Integer promptTokens =
        usage.getPromptTokens();

Integer completionTokens =
        usage.getCompletionTokens();

Integer totalTokens =
        usage.getTotalTokens();
```

但当前业务代码没有继续做这件事。

它只走了：

```text
ChatResponse
    ├── Result → Content            ✓ 已使用
    ├── Result → ReasoningContent   ✓ 已使用
    │
    └── Metadata → Usage            ✗ 没有进入业务数据
```

这就是现在最明确的一处缺口。

---

## 一条 Usage 记录至少应该描述什么

现在先不设计数据库字段。

只站在业务事实的角度思考：

> 一次模型调用完成以后，我们到底希望知道什么？

最少应该能够回答下面这些问题。

| 问题           | 示例                           |
| ------------ | ---------------------------- |
| 谁使用的         | `userId = 1001`              |
| 属于哪个租户       | `tenantId = 1`               |
| 从哪个业务产生      | `CHAT`                       |
| 对应哪个业务记录     | `messageId = 1024`           |
| 使用哪个平台       | `DeepSeek`                   |
| 使用哪个模型       | `deepseek-chat`              |
| 消耗多少输入 Token | `1250`                       |
| 消耗多少输出 Token | `380`                        |
| 总共多少 Token   | `1630`                       |
| 结果如何         | success / failed / cancelled |
| 什么时候发生       | 某个时间点                        |

注意这里还没有：

```text
单价
费用
余额
账本
```

因为我们现在只是定义：

```text
Usage Fact
```

而不是：

```text
Billing Result
```

这是后面非常重要的一条边界。

---

## 为什么不直接给 ai_chat_message 加几个 Token 字段

一种最直接的办法是给：

```text
ai_chat_message
```

加上：

```text
prompt_tokens
completion_tokens
total_tokens
```

对于一个纯聊天系统，这么做可能也可以。

但 CostFlow 的目标明显不是：

> “给 RuoYi Chat 加三个字段。”

因为前面已经看到：

```text
AI Chat
AI Write
MindMap
Workflow
Image
未来 Agent
```

都可能产生资源消耗。

假设我们把 Usage 全塞进业务表：

```text
ai_chat_message
→ prompt_tokens

ai_write
→ prompt_tokens

ai_mind_map
→ prompt_tokens

ai_xxx
→ prompt_tokens
```

很快就会出现：

```text
每个业务表都复制一套字段
每个业务 Service 都复制一套采集代码
查询总用量需要扫很多业务表
定价时还要重新判断业务类型
```

更麻烦的是：

> 一条业务记录并不一定只对应一次模型调用。

以后 Agent 很可能出现：

```text
一次 Agent Run
    ↓
LLM 调用 1
    ↓
Tool
    ↓
LLM 调用 2
    ↓
Tool
    ↓
LLM 调用 3
```

如果 Usage 只挂在业务结果表上，很快就不够用了。

因此，这一篇先不确定最终表结构，只确认 Usage 不应该天然绑定在某一个具体业务表上。至于后面采用独立 Usage 表、事件记录、类似账本的结构还是其他方案，要进入方案设计后再决定。

## 交给 Coding Agent

这一篇不让 Coding Agent 实现计费。

它的任务是把我们刚刚得到的判断，在当前真实仓库中重新验证一遍，并盘点所有模型调用入口，为下一阶段方案设计准备材料。

<CodingAgentPrompt>

请基于当前 CostFlow 本地仓库，完成一次“AI 模型用量采集入口审计”。

这次不要实现 CostFlow，不要新增数据库表，不要修改现有 AI 业务代码。

目标只是确认：

**当前系统有哪些真实模型调用入口，以及 Usage 最合理的观察边界在哪里。**

请严格基于当前代码。

### 1. 重新确认 Chat Usage 缺口

重点检查：

`backend/yudao-module-ai/src/main/java/cn/iocoder/yudao/module/ai/service/chat/AiChatMessageServiceImpl.java`

确认：

* `sendMessage` 的模型调用位置；
* `sendChatMessageStream` 的模型调用位置；
* 同步调用返回什么；
* 流式调用返回什么；
* 当前代码实际读取 ChatResponse 的哪些数据；
* 是否读取 `ChatResponse.getMetadata().getUsage()`；
* 是否把 promptTokens、completionTokens、totalTokens 保存到任何数据库表。

给出真实代码位置和结论。

### 2. 检查 Spring AI 1.1.8 Usage

根据当前项目实际使用的 Spring AI `1.1.8`，确认：

* `ChatResponse`
* `ChatResponseMetadata`
* `Usage`
* `ChatModel`
* `StreamingChatModel`

之间的关系。

重点确认：

* `getPromptTokens()`
* `getCompletionTokens()`
* `getTotalTokens()`
* `getNativeUsage()`

是否真实存在。

不要根据最新版文档判断，必须以项目当前依赖版本为准。

### 3. 盘点整个 AI 模块的模型调用入口

扫描：

`backend/yudao-module-ai/`

找出当前所有真正执行模型或 AI Provider 调用的位置。

至少检查：

* Chat
* Write
* MindMap
* Knowledge / Embedding
* Image
* Music
* Workflow

对于每一个入口输出：

* 相对文件路径；
* 类名；
* 方法名；
* 使用的模型接口；
* `call` 还是 `stream`；
* 返回对象；
* 是否能够取得 Usage；
* 当前是否已有 Usage 处理。

不要只搜索字符串，要结合调用链判断是否真的发生 Provider 调用。

### 4. 特别比较同步和流式调用

分别检查：

```java
chatModel.call(prompt)
```

和：

```java
chatModel.stream(prompt)
```

告诉我：

* 同步响应中 Usage 怎么取得；
* 流式响应里哪些 Chunk 实际带 Usage；
* 当前我们实际配置的模型平台在运行时表现如何。

如果当前本地已经有可用模型，可以实际完成一次最小测试。

优先使用 Debugger 检查：

```java
chunk.getMetadata().getUsage()
```

不要为了测试提交永久代码。

如果必须临时加日志，验证完成后恢复工作区，最终不得留下调试代码。

### 5. 不要把一次业务请求等同于一次模型调用

检查当前 Tool / MCP / Workflow 相关代码。

判断未来是否可能出现：

```text
一次业务请求
→ 多次 LLM Call
```

只给代码事实和风险说明。

不要设计 Agent 计费方案。

### 6. 给出调用入口清单

最后输出一张表：

| 业务 | 文件 | 方法 | 模型接口 | 同步/流式 | Usage 是否可取得 | 当前是否记录 |
| -- | -- | -- | ---- | ----- | ----------- | ------ |

然后告诉我：

**如果下一阶段要设计一套不只服务 Chat 的 Usage 采集机制，最值得重点研究的公共边界有哪些。**

只列候选点和优缺点。

不要开始实现。

### 7. 最终保持仓库干净

本轮结束前确认：

* 没有新增业务代码；
* 没有新增 SQL；
* 没有新增 CostFlow 表；
* 没有遗留调试日志；
* 没有提交任何计费实现。

最后给我一份简洁的审计报告，供下一阶段“确定方案”使用。

</CodingAgentPrompt>

---

## 总结

到这里，我们第一章已经差不多完成了。

我们没有一上来凭空设计一个“计费系统”，而是先把真实项目跑起来，再沿着真实模型调用找到问题：

```text
Spring AI
已经能拿到 Usage
        ↓
原项目没有把它变成业务事实
        ↓
更没有 Metering
        ↓
没有 Pricing
        ↓
没有 Billing
```

现在问题已经明确，下一阶段我们会先调研成熟的 AI 计费方案，再据此确定 CostFlow V1 的产品边界和实现方向。

下一篇：

> **[先看看别人怎么做：调研 AI 计费与 Usage Billing 产品](/projects/costflow/02-solution/01-research)**

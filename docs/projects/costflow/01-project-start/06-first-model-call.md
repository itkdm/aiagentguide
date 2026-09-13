---
title: "接入第一个模型：完成一次真实 AI 对话"
description: "配置 RuoYi Vue Pro 的模型 Provider 和参数，完成 CostFlow 项目中的第一次真实 AI 对话。"
summary: "配置模型服务和参数，验证现有系统能够完成一次真实模型调用。"
keywords:
  - 模型 Provider 配置
  - AI 对话
  - RuoYi Vue Pro 模型调用
tags:
  - CostFlow
  - AI
  - 模型调用
author: 布吉岛
lastUpdated: 2026-09-13
status: draft
assets: none
reviewed: false
sourceType: original
draft: true
noindex: true
---

# 接入第一个模型：完成一次真实 AI 对话

上一篇我们已经把 `yudao-module-ai` 真正接进了 RuoYi Vue Pro，并确认 AI 管理页面和接口可以访问。

这一篇我们配置一个真实可用的聊天模型，并从现有 AI 聊天页面完成第一次真实模型调用。

这一次要打通的是：

```text
API Key
    ↓
Chat Model
    ↓
AI 聊天页面
    ↓
真实模型请求
    ↓
流式回复和聊天记录
```

模型的具体厂商不固定，系统也支持多种不同的厂商，获取对应厂商的 API Key，就可以完成验证。

## 先看懂模型是怎么配置的

### API Key 和模型为什么分开

模型调用至少需要两类信息：

```text
API Key：怎么访问模型服务
Model：具体调用哪个模型
```

当前系统把 API Key 和 Model 分成了两层配置。一个 API Key 可以关联多个模型，不需要为每一个模型重复保存一套密钥。

后端真正获取聊天模型时，会先根据模型记录找到 `keyId`，再读取 API Key、平台和自定义 URL，最后交给模型工厂创建真正的 `ChatModel`。

### 这次选择什么模型

当前固定版本已经定义了多种模型平台，包括 TongYi、DeepSeek、ZhiPu、DouBao、SiliconFlow、OpenAI、Anthropic、Gemini 和 Ollama 等。选择一个自己已经拥有 API Key、且当前代码支持的聊天模型即可。

这次只需要准备：

```text
平台
API Key
模型标识
```

模型标识以实际模型平台当前提供的名称为准，具体查看相关厂商文档。

## 添加一个 API Key

进入现有的 AI API 密钥管理页面。

列表页会展示所属平台、名称、密钥、自定义 API URL 和状态，并提供“新增”按钮。

![AI API 密钥管理页面](https://oss.aiagentguide.cn/projects/billing/costflow-figure-01-api-key.png)

点击“新增”，系统会打开已有的 API Key 表单弹窗，包含所属平台、名称、密钥、自定义 API URL 和状态。

![新增 API Key 表单](https://oss.aiagentguide.cn/projects/billing/costflow-figure-02-api-key-form.png)

在“所属平台”中选择实际使用的平台，平台值会通过 `AiPlatformEnum` 校验。名称可以填写“我的 DeepSeek”或“CostFlow Chat”，它只是便于识别的管理名称。

填写真实 API Key。使用平台默认地址时，自定义 API URL 通常不需要填写；如果使用兼容接口、中转服务或自部署服务，再按照实际情况填写 Base URL。状态保持启用，保存后确认列表中能够看到这条记录。

## 创建第一个聊天模型

API Key 只解决“怎么访问模型服务”，还需要在 AI 模型管理页面中配置具体模型。

![AI 模型管理页面](https://oss.aiagentguide.cn/projects/billing/costflow-figure-03-models.png)

点击“新增”，填写所属平台、模型类型、API 秘钥、模型名称、模型标识、排序和状态。模型类型选择 Chat 后，还需要填写温度参数、回复 Token 数和上下文数量。

![新增聊天模型表单](https://oss.aiagentguide.cn/projects/billing/costflow-figure-04-model-form.png)

“API 秘钥”选择刚才创建的记录。

模型名称是后台展示名称，例如 `CostFlow Chat`；模型标识才是真正传递给模型平台的名称，例如 `deepseek-chat`。

平台建议和 API Key 保持一致。模型类型选择 Chat，参数可以先使用：

```text
temperature = 0.7
maxTokens   = 2048
maxContexts = 10
```

这只是第一次调用的测试配置，不是 CostFlow 最终固定配置。模型排序可以设置为 `1`，状态保持启用。新建对话时，系统会从启用的 Chat 模型中按照 `sort` 升序取第一个模型作为默认模型。

这个地方是一个易错点，因为对话的时候获取的有一个默认模型，系统默认模型我们并没有配置，到对话的时候就会默认报错。所以这个地方我们把默认模型配置为我们的，或者后续对话手动选择模型也可以。

## 完成第一次真实对话

### 打开 AI 聊天

进入现有的 AI 聊天页面。

页面包含左侧对话列表、右侧当前对话、模型设置、消息列表、输入框、上下文开关、联网搜索开关和发送按钮。

![AI 聊天主页面](https://oss.aiagentguide.cn/projects/billing/costflow-figure-05-chat.png)

点击“新建对话”。当前前端不会先弹出选择模型窗口，而是直接调用后端创建 Conversation。没有指定角色模型时，后端会自动选择启用状态、Chat 类型且排序最小的模型。

### 选择刚刚配置的模型

新建对话后查看聊天区域右上角的当前模型按钮。如果没有显示刚刚创建的模型，点击模型按钮，打开已有的“设定”弹窗。

弹窗包含角色设定、模型、温度参数、回复数 Token 数和上下文数量。模型下拉框只会请求 Chat 类型模型。

![聊天对话的模型设定弹窗](https://oss.aiagentguide.cn/projects/billing/costflow-figure-06-chat-settings.png)

确认选择刚刚创建的聊天模型后，点击确定。

### 发送第一条消息

第一次测试时不要混入知识库、联网搜索或附件等额外能力，保持联网搜索关闭且不上传附件。发送一条简单的测试消息，例如：

```text
请只回复一句话：CostFlow 模型调用成功。
```
正常情况下，模型回答会逐步出现在页面上，而不是等待完整响应后一次性刷新。

![第一次真实模型对话成功](https://oss.aiagentguide.cn/projects/billing/costflow-figure-07-chat-success.png)

## 确认这次调用真的成功了

### 检查前端流式请求

打开浏览器开发者工具，在 Network 中找到：

```text
/ai/chat/message/send-stream
```

请求体包含 `conversationId`、`content`、`useContext`、`useSearch` 和 `attachmentUrls`，并携带当前登录用户的 Bearer Token。如果请求能够建立并持续收到 SSE 数据，就说明页面、AI 后端接口、真实模型调用和流式响应已经打通。

### 检查后端和数据库记录

后端控制台不应出现 API Key 无效、模型不存在、平台不支持或模型接口调用失败等异常。数据库中应该出现：

```text
ai_chat_conversation
ai_chat_message
```

发送消息时，后端会先保存用户消息，再保存 Assistant 消息；流式调用结束后，再把最终内容更新到 Assistant 消息记录中。需要确认的是：

```text
用户消息已经保存
Assistant 消息已经保存
模型编号和模型标识已经记录
模型真实响应内容已经保存
```

这个时候我们看到底层数据库保存了哪些数据，就明白当前系统具备哪些能力。比如说我们后续要有的 Token 统计与计费，数据库里面并没有。

## 交给 Coding Agent

这一篇可以让本地 Coding Agent 帮忙完成配置和验证，但 API Key 属于敏感信息，谨慎操作。

<CodingAgentPrompt title="完成第一次真实 AI 模型调用">

请基于当前 CostFlow 本地项目，帮助我完成第一次真实 AI 模型调用。

当前状态：

- RuoYi Vue Pro 原项目已经正常运行；
- `yudao-module-ai` 已经启用；
- AI 模块数据库已经初始化；
- AI 管理页面和接口已经可以访问；
- 本次目标只是配置一个真实 Chat 模型并完成一次真实对话。

请严格以当前本地代码和实际运行页面为准，不要按照其他版本的 RuoYi Vue Pro 文档猜测页面或字段。

### 1. 先检查当前模型配置机制

阅读当前代码，确认 API Key 管理页面和接口位置、Model 管理页面和接口位置、API Key 与 Model 的关联方式、Chat 模型必填参数，以及新建聊天对话如何选择默认模型。先给我简短结论，禁止修改模型调用源码。

### 2. 准备 API Key

检查当前数据库是否已经存在可用的 Chat 模型 API Key。如果没有，请告诉我需要提供模型平台、API Key、自定义 API Base URL（如果需要）和模型标识。不要自己猜测或生成 API Key。

安全要求：

- 不把真实 API Key 写进源码、Git 或 README；
- 不在最终报告中输出完整密钥；
- 不在日志中主动输出完整密钥；
- 后续展示时只显示脱敏后的值。

### 3. 创建 Chat Model

使用当前项目真实模型管理能力创建聊天模型。要求 Model 平台和 API Key 平台一致，模型类型使用 Chat，模型标识使用提供商当前真实可用的名称，配置合理的 `temperature`、`maxTokens`、`maxContexts`，并启用模型。

不要升级 Spring AI，也不要修改模型工厂实现。

### 4. 完成第一次真实调用

使用现有 AI 聊天页面创建新对话，确认当前对话使用刚刚配置的模型；如果不是，通过页面真实存在的“设定”功能切换。保持联网搜索关闭，不上传附件，发送一条简短测试消息并等待真实模型完成流式返回。必须是真实模型响应，不能 Mock 或写固定返回值。

### 5. 验证完整结果

实际检查 `/ai/chat/message/send-stream` 是否成功建立 SSE 请求，后端是否正常调用模型，页面是否收到真实流式内容，以及 `ai_chat_conversation`、`ai_chat_message` 是否正确保存用户消息、Assistant 消息和最终内容。

### 6. 完成报告

最后告诉我使用的模型平台和模型标识、Chat Model 是否创建成功、第一次真实对话是否成功、SSE 请求是否正常、聊天记录是否正常落库，以及失败时的真实原因。报告中禁止输出完整 API Key、Authorization Token 或其他密钥。

注意，如果需要操作实际浏览器页面，请使用内置浏览器或者Devtools MCP ，如果当前环境没有，就使用当前环境支持的浏览器页面访问插件。

</CodingAgentPrompt>

## 下一步

现在已经完成了：

```text
RuoYi Vue Pro
      ↓
AI 模块开启
      ↓
真实 Chat Model 配置
      ↓
真实模型请求
      ↓
流式回复
      ↓
聊天记录落库
```

接下来我们继续去整体看一下 AI 模块有哪些功能：

> **认识 RuoYi Vue Pro 的 AI 模块：功能、数据表与实现现状**

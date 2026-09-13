---
title: "一条 AI 消息是怎么跑完的：追踪完整模型调用链"
description: "从前端请求开始，追踪 RuoYi Vue Pro AI 消息经过 Controller、Service、Spring AI 和消息保存的完整调用链，理解模型调用与 Token Usage 的关系。"
summary: "沿着一次真实的 AI Chat 流式请求，从前端发送、后端处理、Spring AI 调用到 SSE 返回和消息落库，找到 CostFlow 后续采集 Usage 的切入点。"
keywords:
  - AI 调用链
  - Spring AI 调用链
  - RuoYi Vue Pro 源码
  - Token Usage
tags:
  - CostFlow
  - AI 调用链
  - Spring AI
  - 源码阅读
author: 布吉岛
lastUpdated: 2026-09-13
status: draft
assets: none
reviewed: false
sourceType: original
draft: true
noindex: true
---

# 一条 AI 消息是怎么产生的：追踪完整模型调用链

上一篇我们从整体上认识了 `yudao-module-ai`，知道了模型、聊天、知识库、Tool、MCP、Workflow 等能力分别处在什么位置，也看过了 `ai_model`、`ai_chat_conversation`、`ai_chat_message` 等核心表。

接下来，我们来看用户发送一条消息到 AI 消息响应到前端这个过程内部到底发生了什么？

```text
AI 聊天页面
frontend/src/views/ai/chat/index/index.vue
        ↓
ChatMessageApi.sendChatMessageStream(...)
frontend/src/api/ai/chat/message/index.ts
        ↓
POST /admin-api/ai/chat/message/send-stream
        ↓
AiChatMessageController
        ↓
AiChatMessageServiceImpl
        │
        ├── 查 Conversation
        ├── 查历史消息
        ├── 找 Model
        ├── 创建 ChatModel
        ├── RAG / 联网搜索
        ├── 保存 User Message
        ├── 创建 Assistant Message
        ├── 构造 Prompt
        │
        ▼
StreamingChatModel.stream(prompt)
        ↓
Spring AI
        ↓
真实模型平台
        ↓
Flux<ChatResponse>
        ↓
SSE
        ↓
Vue 页面逐段接收
        ↓
完整 Assistant 内容落库
```
---

## 从浏览器里的 send-stream 开始

### 前端最终发出了什么请求

我们先从前端开始分析，

聊天主页面位于：

```text
frontend/src/views/ai/chat/index/index.vue
```

用户输入内容以后，最终会进入：

```ts
const doSendMessage = async (content: string) => {
  if (content.length < 1) {
    message.error('发送失败，原因：内容为空！')
    return
  }

  if (activeConversationId.value == null) {
    message.error('还没创建对话，不能发送!')
    return
  }

  await doSendMessageStream({
    conversationId: activeConversationId.value,
    content,
    attachmentUrls: [...uploadFiles.value]
  } as ChatMessageVO)
}
```

真正负责发送流式请求的是：

```ts
doSendMessageStream(...)
```

在正式请求后端之前，前端还会先向当前消息列表插入两条临时消息：

```ts
activeMessageList.value.push({
  id: -1,
  type: 'user',
  content: userMessage.content
})

activeMessageList.value.push({
  id: -2,
  type: 'assistant',
  content: '思考中...'
})
```

也就是说，当我们点击“发送”以后，页面不需要等待服务器返回第一段数据，首先就可以立即展示：

```text
我的问题

思考中...
```

等真正的流式响应回来以后，这两条临时数据才会被后端返回的真实 Message 替换。

继续往下看。

真正的 HTTP 请求封装位于：

```text
frontend/src/api/ai/chat/message/index.ts
```

核心代码是：

```ts
sendChatMessageStream: async (
  conversationId,
  content,
  ctrl,
  enableContext,
  enableWebSearch,
  onMessage,
  onError,
  onClose,
  attachmentUrls
) => {
  const token = getAccessToken()

  return fetchEventSource(
    `${config.base_url}/ai/chat/message/send-stream`,
    {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        conversationId,
        content,
        useContext: enableContext,
        useSearch: enableWebSearch,
        attachmentUrls: attachmentUrls || []
      }),
      onmessage: onMessage,
      onerror: onError,
      onclose: onClose,
      signal: ctrl.signal
    }
  )
}
```

所以发送一条消息时，真正提交给后端的内容是：

```json
{
  "conversationId": 1,
  "content": "你好",
  "useContext": true,
  "useSearch": false,
  "attachmentUrls": []
}
```

对应后端的 Request VO 也完全一致：

```text
backend/yudao-module-ai/src/main/java/
cn/iocoder/yudao/module/ai/controller/admin/chat/vo/message/
AiChatMessageSendReqVO.java
```

```java
public class AiChatMessageSendReqVO {

    private Long conversationId;

    private String content;

    private Boolean useContext;

    private Boolean useSearch;

    private List<String> attachmentUrls;

}
```

因此到这里只是一次普通的HTTP 请求，请求参数包括：

```text
聊天对话 ID
+
用户输入
+
上下文开关
+
联网搜索开关
+
附件
```
---

### 为什么这里使用 SSE

和我们常见的普通后台接口不同，聊天页面没有等待模型把整段答案生成完成以后，再一次性显示。

而是：

```text
模型生成一点
    ↓
后端返回一点
    ↓
浏览器显示一点
```

所以前端没有继续使用普通 Axios 请求，而是使用：

```ts
fetchEventSource(...)
```

源码中直接写了注释：

```ts
// 为什么不用 axios 呢？因为它不支持 SSE 调用
```

SSE，也就是 Server-Sent Events，可以让服务器在一个持续建立的 HTTP 连接上不断向浏览器发送事件。

SSE 的底层原理具体可以参考我们后续原理栏目的内容。

上一节我们在浏览器 Network 中看到的：

```text
/admin-api/ai/chat/message/send-stream
```

就是这条流式请求。

---

## 请求进入后端

### 找到 AiChatMessageController

根据请求路径：

```text
/ai/chat/message/send-stream
```

可以直接找到：

```text
backend/yudao-module-ai/src/main/java/
cn/iocoder/yudao/module/ai/controller/admin/chat/
AiChatMessageController.java
```

流式接口则是：

```java
@PostMapping(
    value = "/send-stream",
    produces = MediaType.TEXT_EVENT_STREAM_VALUE
)
public Flux<CommonResult<AiChatMessageSendRespVO>>
        sendChatMessageStream(
            @Valid @RequestBody AiChatMessageSendReqVO sendReqVO) {

    return chatMessageService.sendChatMessageStream(
        sendReqVO,
        getLoginUserId()
    );
}
```

注意这两个地方。

第一个是：

```java
produces = MediaType.TEXT_EVENT_STREAM_VALUE
```

它告诉 Spring：

> 这个接口返回的不是普通 JSON，而是 SSE 流。

第二个是返回类型：

```java
Flux<CommonResult<AiChatMessageSendRespVO>>
```

`Flux` 不是一个结果，而是一串会持续产生的数据。

所以：

```text
前端 fetchEventSource
```

和：

```text
后端 Flux + TEXT_EVENT_STREAM
```

正好形成了流式通信的两端。

---

### send-stream 把请求交给了谁

Controller 本身几乎没有业务逻辑。

它只是取出当前登录用户：

```java
getLoginUserId()
```

然后调用：

```java
chatMessageService.sendChatMessageStream(
    sendReqVO,
    getLoginUserId()
);
```

所以继续往下看，真正重要的文件是：

```text
backend/yudao-module-ai/src/main/java/
cn/iocoder/yudao/module/ai/service/chat/
AiChatMessageServiceImpl.java
```

这也是整个聊天调用链里最核心的一个类。

---

## 进入聊天核心逻辑

### 校验 Conversation

进入：

```java
sendChatMessageStream(...)
```

第一件事情还不是找模型，而是先找当前聊天对话：

```java
AiChatConversationDO conversation =
        chatConversationService
            .validateChatConversationExists(
                sendReqVO.getConversationId()
            );

if (ObjUtil.notEqual(conversation.getUserId(), userId)) {
    throw exception(CHAT_CONVERSATION_NOT_EXISTS);
}
```

为什么一定要先找 Conversation？

因为我们上一篇已经看到，一次对话本身保存了：

```text
modelId
model

systemMessage
temperature
maxTokens
maxContexts
```

所以前端发送消息的时候，并没有每次都重新传：

```json
{
  "model": "deepseek-chat",
  "temperature": 0.7,
  "maxTokens": 2048
}
```

前端只传：

```text
conversationId
```

后端再根据 Conversation 找到这次聊天真正应该使用的模型和配置。

因此：

```text
Conversation
```

就是一组连续聊天的运行上下文。

---

### 找到这次使用的 Model

接着代码会读取：

```java
AiModelDO model =
        modalService.validateModel(
            conversation.getModelId()
        );
```

找到具体模型记录。

因此链路现在已经变成：

```text
conversationId
      ↓
ai_chat_conversation
      ↓
modelId
      ↓
ai_model
```

---

### 读取历史消息

紧接着还有：

```java
List<AiChatMessageDO> historyMessages =
        chatMessageMapper
            .selectListByConversationId(
                conversation.getId()
            );
```

这里拿到的是当前 Conversation 之前已经存在的消息。

但是查出来所有历史消息，不代表所有历史消息都会发给模型。

真正选择多少历史消息，是后面的 `filterContextMessages(...)`决定的。

当前实现会根据：`sendReqVO.useContext `和`conversation.maxContexts`

如果没有开启上下文：

```java
if (conversation.getMaxContexts() == null
        || ObjUtil.notEqual(
            sendReqVO.getUseContext(),
            Boolean.TRUE)) {

    return Collections.emptyList();
}
```

就完全不带历史消息。

如果开启，则会从最近的消息开始，按照：

```text
User + Assistant
```

为一组向前取。

核心判断类似：

```java
if (contextMessages.size()
        >= conversation.getMaxContexts() * 2) {
    break;
}
```

所以：

```text
maxContexts = 10
```

表示最多取最近 10 组问答，而不是无限把整张消息表都塞进 Prompt。

---

## 模型实例是怎么创建出来的

### 从 modelId 找到模型配置

刚才只是拿到了：

```java
AiModelDO model
```

但数据库里的一条记录显然还不能直接调用大模型。

真正创建模型客户端的代码在：

```text
backend/yudao-module-ai/src/main/java/
cn/iocoder/yudao/module/ai/service/model/
AiModelServiceImpl.java
```

Chat 调用时执行：

```java
StreamingChatModel chatModel =
        modalService.getChatModel(model.getId());
```

对应的实现是：

```java
@Override
public ChatModel getChatModel(Long id) {
    AiModelDO model = validateModel(id);

    AiApiKeyDO apiKey =
            apiKeyService.validateApiKey(
                model.getKeyId()
            );

    AiPlatformEnum platform =
            AiPlatformEnum.validatePlatform(
                apiKey.getPlatform()
            );

    return modelFactory.getOrCreateChatModel(
            platform,
            apiKey.getApiKey(),
            apiKey.getUrl()
    );
}
```

这里终于把上一篇讲过的两张表连起来了：

```text
ai_model
   │
   │ keyId
   ▼
ai_api_key
```

系统从 Model 中找到：

```text
keyId
```

然后再从 API Key 中获取：

```text
platform
apiKey
url
```

---

### 从 keyId 找到 API Key

这也解释了为什么前面配置模型时，要先创建 API Key，再创建 Model。

真正调用模型需要两类信息：

```text
AiApiKeyDO
→ 我怎么访问模型平台

AiModelDO
→ 我要使用哪个具体模型以及什么参数
```
---

### AiModelService 怎么拿到 ChatModel

继续看：

```text
backend/yudao-module-ai/src/main/java/
cn/iocoder/yudao/module/ai/framework/ai/core/model/
AiModelFactoryImpl.java
```

核心方法：

```java
public ChatModel getOrCreateChatModel(
        AiPlatformEnum platform,
        String rawApiKey,
        String rawUrl) {

    switch (platform) {
        case TONG_YI:
            return buildTongYiChatModel(apiKey);

        case DEEP_SEEK:
            return buildDeepSeekChatModel(apiKey);

        case OPENAI:
            return buildOpenAiChatModel(apiKey, url);

        case ANTHROPIC:
            return buildAnthropicChatModel(apiKey, url);

        case OLLAMA:
            return buildOllamaChatModel(url);

        // ...
    }
}
```

实际代码支持的平台远不止我这里简写的几个。

当前平台枚举位于：

```text
backend/yudao-module-ai/src/main/java/
cn/iocoder/yudao/module/ai/enums/model/
AiPlatformEnum.java
```

里面可以看到：

```java
TONG_YI("TongYi", "通义千问"),
DEEP_SEEK("DeepSeek", "DeepSeek"),
DOU_BAO("DouBao", "豆包"),
SILICON_FLOW("SiliconFlow", "硅基流动"),

OPENAI("OpenAI", "OpenAI"),
ANTHROPIC("Anthropic", "Anthropic"),
GEMINI("Gemini", "Gemini"),
OLLAMA("Ollama", "Ollama"),
// ...
```

---

### 不同模型平台怎么被统一起来

这一步其实是 Spring AI 在当前项目中非常重要的价值。

上层聊天代码并没有写成：

```java
if (DeepSeek) {
    调 DeepSeek SDK
} else if (OpenAI) {
    调 OpenAI SDK
} else if (Anthropic) {
    调 Anthropic SDK
}
```

而是最终统一拿到：

```java
ChatModel
```

或者流式场景中的：

```java
StreamingChatModel
```

所以 Chat Service 后面可以完全不关心：

```text
DeepSeek
OpenAI
通义
Anthropic
Ollama
```

具体是哪一家。

它只需要：

```java
chatModel.stream(prompt);
```

当前 AI 模块固定使用的 Spring AI 版本为：

```xml
<spring-ai.version>1.1.8</spring-ai.version>
```

同时使用 Spring AI Alibaba `1.1.2.2`。

这就是项目把不同模型 Provider 统一到一条 Chat 调用链上的基础。

---

## Prompt 是怎么组装出来的

现在已经有了：

```text
Conversation
Model
ChatModel
历史消息
用户本次输入
```

下一步就是真正构造发给大模型的 Prompt。

仍然在：

```text
backend/yudao-module-ai/src/main/java/
cn/iocoder/yudao/module/ai/service/chat/
AiChatMessageServiceImpl.java
```

方法是：

```java
buildPrompt(...)
```

---

### System Message

第一部分是 Conversation 自己保存的角色设定：

```java
if (StrUtil.isNotBlank(
        conversation.getSystemMessage())) {

    chatMessages.add(
        new SystemMessage(
            conversation.getSystemMessage()
        )
    );
}
```

所以如果聊天设置中写了：

```text
你是一名 Java 架构师……
```

最终就是作为：

```text
SystemMessage
```

进入 Prompt。

---

### 历史上下文

然后加入刚才筛选出来的历史消息：

```java
List<AiChatMessageDO> contextMessages =
        filterContextMessages(
            messages,
            conversation,
            sendReqVO
        );

contextMessages.forEach(message -> {
    chatMessages.add(
        AiUtils.buildMessage(
            message.getType(),
            message.getContent()
        )
    );
});
```

`AiUtils.buildMessage()` 再把数据库里的：

```text
user
assistant
system
```

转换为 Spring AI 的：

```text
UserMessage
AssistantMessage
SystemMessage
```

实现位于：

```text
backend/yudao-module-ai/src/main/java/
cn/iocoder/yudao/module/ai/util/
AiUtils.java
```

```java
public static Message buildMessage(
        String type,
        String content) {

    if (MessageType.USER.getValue().equals(type)) {
        return new UserMessage(content);
    }

    if (MessageType.ASSISTANT.getValue().equals(type)) {
        return new AssistantMessage(content);
    }

    if (MessageType.SYSTEM.getValue().equals(type)) {
        return new SystemMessage(content);
    }

    // ...
}
```

---

### 当前用户消息

历史消息之后，才加入用户本轮真正输入的内容：

```java
chatMessages.add(
    new UserMessage(
        sendReqVO.getContent()
    )
);
```

到这里，一个最普通的聊天 Prompt 已经大概是：

```text
System
你是一名 Java 架构师

User
之前的问题

Assistant
之前的回答

User
这一次的新问题
```

但是当前项目还会继续往里加其他内容。

---

### 知识库召回

在构建 Prompt 之前，Service 已经调用：

```java
List<AiKnowledgeSegmentSearchRespBO>
        knowledgeSegments =
        recallKnowledgeSegment(
            sendReqVO.getContent(),
            conversation
        );
```

不过并不是每一次聊天都会执行 RAG。

`recallKnowledgeSegment()` 首先检查当前 Conversation 有没有角色：

```java
if (conversation == null
        || conversation.getRoleId() == null) {

    return Collections.emptyList();
}
```

然后继续检查角色是否配置：

```text
knowledgeIds
```

没有知识库，同样直接返回空。

真正有知识库以后，才会遍历知识库并调用：

```java
knowledgeSegmentService.searchKnowledgeSegment(...)
```

进行召回。

召回结果在构造 Prompt 时会被包装成类似：

```text
<Reference>
知识片段内容
</Reference>
```

再作为额外的：

```java
UserMessage
```

加入 Prompt。

实际逻辑：

```java
if (CollUtil.isNotEmpty(knowledgeSegments)) {

    String reference = knowledgeSegments.stream()
        .map(segment ->
            "<Reference>"
            + segment.getContent()
            + "</Reference>")
        .collect(Collectors.joining("\n\n"));

    chatMessages.add(
        new UserMessage(
            String.format(
                KNOWLEDGE_USER_MESSAGE_TEMPLATE,
                reference
            )
        )
    );
}
```

因此当前 RAG 本质上也是：

```text
先检索
    ↓
拿到知识片段
    ↓
拼进 Prompt
    ↓
让模型基于这些内容回答
```

---

### 联网搜索与附件

如果前端开启：

```text
联网搜索
```

并且当前系统已经配置 `AiWebSearchClient`，Service 会调用：

```java
webSearchClient.search(...)
```

然后把搜索结果包装为：

```text
<WebSearch>
...
</WebSearch>
```

继续作为 UserMessage 塞进 Prompt。

附件也是类似处理。

如果：

```java
sendReqVO.getAttachmentUrls()
```

不为空，会调用：

```java
buildAttachmentUserMessage(...)
```

文本文件会读取内容，图片会下载并转成 Base64，最后包装成：

```text
<Attachment name="...">
...
</Attachment>
```

再作为新的 UserMessage。

所以当前 Prompt 已经可能非常复杂：

```text
System Message
        ↓
历史消息
        ↓
当前用户消息
        ↓
RAG Reference
        ↓
Web Search
        ↓
Attachment
```

---

### Tool 和 MCP

Prompt 的消息部分构建完以后，还没有结束。

代码继续调用：

```java
List<ToolCallback> toolCallbacks =
        getToolCallbackListByRoleId(
            conversation.getRoleId()
        );
```

如果当前 Chat Role 配置了：

```text
toolIds
```

系统会根据数据库中的 Tool 名称：

```java
toolCallbackResolver.resolve(toolName)
```

找到真正的 ToolCallback。

如果角色配置了：

```text
mcpClientNames
```

还会从已经连接的：

```java
McpSyncClient
```

中取得 MCP Tools，并转换成：

```java
ToolCallback[]
```

当前关键代码类似：

```java
ToolCallback[] mcpToolCallBacks =
        new SyncMcpToolCallbackProvider(mcpClient)
            .getToolCallbacks();

CollUtil.addAll(
    toolCallbacks,
    mcpToolCallBacks
);
```

所以到了 Spring AI 这一层以后普通 `Java Tool` 和 `MCP Tool` 都统一成了`ToolCallback`，然后再一起交给模型。

---

## 真正调用模型发生在哪里

### StreamingChatModel.stream

所有准备工作完成后，会生成：

```java
ChatOptions chatOptions =
        AiUtils.buildChatOptions(
            platform,
            model.getModel(),
            conversation.getTemperature(),
            conversation.getMaxTokens(),
            toolCallbacks,
            toolContext
        );

return new Prompt(
    chatMessages,
    chatOptions
);
```

这里就把前面一直没有传给模型工厂的：

```text
model.getModel()
```

带进来了。

真正作为模型标识进入 `ChatOptions`。

不同平台会创建不同 Options。

文件：

```text
backend/yudao-module-ai/src/main/java/
cn/iocoder/yudao/module/ai/util/
AiUtils.java
```

例如 DeepSeek：

```java
return DeepSeekChatOptions.builder()
        .model(model)
        .temperature(temperature)
        .maxTokens(maxTokens)
        .toolCallbacks(toolCallbacks)
        .toolContext(toolContext)
        .build();
```

OpenAI：

```java
return OpenAiChatOptions.builder()
        .model(model)
        .temperature(temperature)
        .maxTokens(maxTokens)
        .toolCallbacks(toolCallbacks)
        .toolContext(toolContext)
        .build();
```

最终真正发起模型调用的代码只有这一行：

```java
Flux<ChatResponse> streamResponse =
        chatModel.stream(prompt);
```

文件仍然是：

```text
backend/yudao-module-ai/src/main/java/
cn/iocoder/yudao/module/ai/service/chat/
AiChatMessageServiceImpl.java
```

前面那么长的准备工作，最终都汇聚到这里：

```text
ChatModel
+
Prompt
        ↓
chatModel.stream(prompt)
```

**这一行就是当前 Chat 场景真正跨出系统、调用大模型的核心位置。**

这个位置后面会非常重要。

---

### Spring AI 返回了什么

`stream()` 返回的不是 String。

而是：

```java
Flux<ChatResponse>
```

每一个流式片段都是：

```java
ChatResponse
```

拿到一个 Chunk 后，先调用：

```java
String newContent =
        AiUtils.getChatResponseContent(chunk);

String newReasoningContent =
        AiUtils.getChatResponseReasoningContent(chunk);
```

`AiUtils` 的正文提取非常直接：

```java
public static String getChatResponseContent(
        ChatResponse response) {

    if (response == null
            || response.getResult() == null
            || response.getResult().getOutput() == null) {
        return null;
    }

    return response
            .getResult()
            .getOutput()
            .getText();
}
```

推理模型的 reasoningContent 则针对 DeepSeek 和部分其他模型做了兼容。

---

## 模型结果怎么回到前端

### Flux 怎么变成 SSE

模型返回`Flux<ChatResponse>`以后，当前 Service 对每一个 Chunk 执行：

```java
return streamResponse.map(chunk -> {

    String newContent =
            AiUtils.getChatResponseContent(chunk);

    String newReasoningContent =
            AiUtils.getChatResponseReasoningContent(chunk);

    if (StrUtil.isNotEmpty(newContent)) {
        contentBuffer.append(newContent);
    }

    if (StrUtil.isNotEmpty(newReasoningContent)) {
        reasoningContentBuffer
            .append(newReasoningContent);
    }

    return success(
        new AiChatMessageSendRespVO()
            .setSend(...)
            .setReceive(
                ...
                .setContent(
                    StrUtil.nullToDefault(
                        newContent, ""
                    )
                )
                .setReasoningContent(
                    StrUtil.nullToDefault(
                        newReasoningContent, ""
                    )
                )
            )
    );
});
```

所以每一个模型 Chunk 都被重新包装成：

```text
CommonResult
    ↓
AiChatMessageSendRespVO
```

然后 Controller 原样把：

```java
Flux<CommonResult<...>>
```

作为 SSE 返回。

整个路径就是：

```text
Flux<ChatResponse>
        ↓
map()
        ↓
Flux<CommonResult<...>>
        ↓
Controller
        ↓
SSE
```

---

### 前端怎么逐段接收内容

再回到：

```text
frontend/src/views/ai/chat/index/index.vue
```

`fetchEventSource` 每收到一个 SSE Event，就进入：

```ts
async (res) => {
  const { code, data, msg } =
    JSON.parse(res.data)

  // ...

  if (data.receive.reasoningContent) {
    // 拼接推理内容
  }

  if (data.receive.content !== '') {
    receiveMessageFullText.value =
      receiveMessageFullText.value
      + data.receive.content
  }

  await scrollToBottom()
}
```

注意这里后端每次发送的：

```text
data.receive.content
```

只是**当前这一段**。

前端自己维护：

```ts
receiveMessageFullText
```

不断累加：

```text
第一段：“Cost”
第二段：“Flow”
第三段：“ 是”
第四段：“一个”
...
```

最后才形成完整回答。

---

### 为什么页面能看到打字机效果

页面中真正展示文字时，又做了一层：

```ts
textRoll()
```

它不会直接一次把：

```text
receiveMessageFullText
```

全部塞到页面。

而是根据当前：

```text
已经收到多少字符
已经显示多少字符
```

计算展示速度，然后逐字更新最后一条 Assistant Message。

因此页面表现实际上是两层流式：

```text
第一层
模型 → SSE → 浏览器
真实网络流式

第二层
receiveMessageFullText
        ↓
textRoll()
        ↓
逐字显示
前端视觉流式
```

所以页面看起来像 ChatGPT 一样逐字出现，并不代表后端真的每次只返回一个汉字。

---

## 一次聊天是怎么落库的

### 先保存用户消息

当前系统并不是：

```text
先调模型
    ↓
成功以后
    ↓
再保存 User 和 Assistant
```

而是在调用模型**之前**就开始写数据库。

仍然位于：

```text
backend/yudao-module-ai/src/main/java/
cn/iocoder/yudao/module/ai/service/chat/
AiChatMessageServiceImpl.java
```

首先：

```java
AiChatMessageDO userMessage =
        createChatMessage(
            conversation.getId(),
            null,
            model,
            userId,
            conversation.getRoleId(),
            MessageType.USER,
            sendReqVO.getContent(),
            sendReqVO.getUseContext(),
            null,
            sendReqVO.getAttachmentUrls(),
            null
        );
```

`createChatMessage()` 最终会：

```java
chatMessageMapper.insert(message);
```

所以用户消息在真正请求大模型之前就已经存在于：

```text
ai_chat_message
```

里。

---

### 再创建 Assistant 消息

随后系统立即创建：

```java
AiChatMessageDO assistantMessage =
        createChatMessage(
            conversation.getId(),
            userMessage.getId(),
            model,
            userId,
            conversation.getRoleId(),
            MessageType.ASSISTANT,
            "",
            sendReqVO.getUseContext(),
            knowledgeSegments,
            null,
            webSearchResponse
        );
```

注意这里 Assistant 的初始：

```text
content = ""
```

并且：

```text
replyId = userMessage.getId()
```

因此数据库关系已经建立：

```text
User Message
id = 100

Assistant Message
id = 101
replyId = 100
content = ""
```

然后才：

```java
chatModel.stream(prompt);
```

---

### 流式结束后更新完整内容

流式过程中，后端维护：

```java
StringBuffer contentBuffer =
        new StringBuffer();

StringBuffer reasoningContentBuffer =
        new StringBuffer();
```

每来一个 Chunk：

```java
contentBuffer.append(newContent);
```

等 Flux 正常结束：

```java
.doOnComplete(() -> {

    TenantUtils.executeIgnore(() ->
        chatMessageMapper.updateById(
            new AiChatMessageDO()
                .setId(assistantMessage.getId())
                .setContent(
                    contentBuffer.toString()
                )
                .setReasoningContent(
                    reasoningContentBuffer.toString()
                )
        )
    );

})
```

最终：

```text
ai_chat_message
```

中的 Assistant Message 才从：

```text
content = ""
```

变成：

```text
content = "完整模型回答……"
```

---

### 调用失败和主动取消怎么处理

这里当前还要考虑了两个情况：

```text
模型调用出错
```

和：

```text
用户点击“停止”
```

分别对应：

```java
.doOnError(...)
```

和：

```java
.doOnCancel(...)
```

两者处理思路基本一致。

如果模型已经返回了一部分内容：

```java
if (StrUtil.isNotEmpty(contentBuffer)) {

    chatMessageMapper.updateById(
        new AiChatMessageDO()
            .setId(assistantMessage.getId())
            .setContent(contentBuffer.toString())
    );
}
```

就把已经收到的部分保存下来。

如果一个字都没有返回：

```java
else {
    chatMessageMapper.deleteById(
        assistantMessage.getId()
    );
}
```

就把刚才提前创建的空 Assistant Message 删除。

因此当前的异常行为大概是：

```text
用户消息
→ 已保存

Assistant
→ 有部分返回：保存部分内容
→ 完全没返回：删除空记录
```

这一点对以后做 Usage 和计费尤其重要。

因为将来还必须回答：

> 调用失败、调用取消、只生成一半时，到底算不算一次用量？

但现在先不解决，我们后续再来处理。

---

## 这条链里已经有什么，还缺什么

现在我们已经完整走完了一次 Chat 调用。

```text
index.vue
    ↓
ChatMessageApi
    ↓
AiChatMessageController
    ↓
AiChatMessageServiceImpl
    │
    ├─ Conversation
    ├─ History
    ├─ Model
    ├─ Knowledge
    ├─ Web Search
    ├─ Tool / MCP
    │
    ↓
buildPrompt()
    ↓
AiModelServiceImpl
    ↓
AiModelFactoryImpl
    ↓
StreamingChatModel.stream()
    ↓
Spring AI
    ↓
模型 Provider
    ↓
Flux<ChatResponse>
    ↓
SSE
    ↓
Vue
```

而当前数据库已经记录：

```text
userId
conversationId

modelId
model

用户输入
模型输出
reasoningContent

知识库 Segment
联网搜索
附件

createTime
```

从“这是谁发出的哪一次聊天”角度看，上下文其实已经很丰富。

但现在就会发现了一个非常关键的断层。

Spring AI：

```java
ChatResponse
    ↓
getMetadata()
    ↓
getUsage()
```

可以提供统一的：

```text
Prompt Tokens
Completion Tokens
Total Tokens
```

抽象。

而当前 RuoYi Vue Pro 在处理每一个：

```java
ChatResponse chunk
```

时，只读取了：

```java
AiUtils.getChatResponseContent(chunk);

AiUtils.getChatResponseReasoningContent(chunk);
```

整个当前 Chat Service 并没有继续读取：

```java
chunk.getMetadata().getUsage()
```

也没有把：

```text
promptTokens
completionTokens
totalTokens
```

保存进：

```text
ai_chat_message
```

这和上一篇我们从数据库看到的现象完全对应起来了。

```text
模型响应中
可能已经有 Usage
        ↓
当前业务代码只取 Content
        ↓
Usage 没有进入业务数据
        ↓
数据库自然也没有 Token 用量
```

这个位置已经非常适合接入 CostFlow。

---

### 为什么现在还不能直接计费

看到这里可能很容易得出一个结论：

```text
那就在这里 getUsage()
然后乘模型单价不就行了？
```

但还不能这么快。

因为还有很多问题没有解决。

例如流式响应：

```text
Flux<ChatResponse>
```

会返回很多个 Chunk。

那么：

```text
Usage 出现在哪个 Chunk？
```

如果多个 Chunk 都有：

```text
它是增量还是累计？
```

不同 Provider：

```text
Usage 行为是否完全一致？
```

如果发生：

```text
模型调用失败
用户取消流式请求
Tool Calling
MCP Tool Calling
一次业务请求触发多次模型调用
```

又应该怎么处理？

另外 CostFlow 最终显然不能只绑死在：

```java
AiChatMessageServiceImpl
```

这一行代码上。

因为前面已经知道：

```text
Chat
Write
Image
MindMap
Workflow
```

未来都可能产生 AI 成本。

所以我们现在已经确定了一个非常重要的认知：

> **Chat 场景中真正的模型调用边界已经找到了，而且 Spring AI 响应中已经存在 Usage 抽象。**

至于 CostFlow 应该怎样采集它，我们下一章再讨论。

---

## 交给 Coding Agent

这篇文章其实最适合让本地 Agent 直接沿真实源码重新走一次，而且这一次最好让 Agent 输出**文件路径 + 方法名 + 调用关系**，而不是泛泛解释 Spring AI。

<CodingAgentPrompt>

请基于当前 CostFlow 本地代码，带我完整追踪一次已经真实跑通的 AI Chat 流式调用。

不要修改任何代码，也不要实现 CostFlow。

必须以当前本地固定版本源码为准。

### 1. 从前端发送按钮开始

从：

`frontend/src/views/ai/chat/index/index.vue`

找到用户发送消息的真实方法。

继续追到：

`frontend/src/api/ai/chat/message/index.ts`

告诉我：

* 最终请求地址；
* HTTP 方法；
* 请求体；
* 为什么使用 `fetchEventSource`；
* `conversationId`、`useContext`、`useSearch`、`attachmentUrls` 分别来自哪里。

画出前端调用链，并列出真实方法名。

### 2. 追到后端 Controller

找到：

`AiChatMessageController`

以及 `/ai/chat/message/send-stream` 对应的方法。

告诉我：

* Controller 的完整相对路径；
* 方法名；
* Request VO；
* 返回类型；
* 为什么返回 `Flux`；
* 请求最终交给哪个 Service 方法。

不要解释 Spring MVC 基础知识。

### 3. 进入 Chat Service

重点阅读：

`AiChatMessageServiceImpl.sendChatMessageStream`

按真实执行顺序告诉我：

* Conversation 在哪里查询；
* 用户权限怎么校验；
* 历史消息在哪里读取；
* Model 怎么找到；
* ChatModel 怎么拿到；
* 知识库什么时候召回；
* 联网搜索什么时候执行；
* User Message 什么时候落库；
* Assistant Message 什么时候创建；
* 真正调用模型发生在哪一行。

请输出一条按真实执行顺序排列的调用链。

### 4. 追 Model 创建过程

继续追：

* `AiModelServiceImpl`
* `AiModelFactoryImpl`
* `AiPlatformEnum`
* `AiUtils`

重点回答：

1. `modelId` 怎么找到 `ai_model`；
2. `keyId` 怎么找到 API Key；
3. Provider 是根据哪里的 platform 决定的；
4. `ChatModel` 客户端什么时候创建；
5. 真正的模型标识什么时候传入；
6. temperature、maxTokens 等参数在哪里进入 ChatOptions；
7. 不同模型平台最终怎么统一到 Spring AI 接口。

必须列真实相对文件路径和真实方法名。

### 5. 拆解 buildPrompt

完整检查：

`AiChatMessageServiceImpl.buildPrompt`

按照最终加入 Prompt 的顺序告诉我：

* System Message
* 历史消息
* 当前 User Message
* Knowledge
* Web Search
* Attachment
* Tool
* MCP

分别从哪里来。

同时检查：

`filterContextMessages`

告诉我上下文到底按照什么规则截取。

不要根据经验猜，必须以当前代码为准。

### 6. 追真正的模型调用

找到真实的：

`chatModel.stream(prompt)`

继续检查当前项目使用的 Spring AI 版本。

然后查看该版本 Spring AI 中：

* `ChatResponse`
* `ChatResponseMetadata`
* `Usage`

确认是否真实存在：

* `getPromptTokens()`
* `getCompletionTokens()`
* `getTotalTokens()`
* `getNativeUsage()`

并告诉我当前 RuoYi Vue Pro 是否真正读取了这些 Usage。

不要修改代码。

### 7. 追 SSE 返回和数据库写入

继续检查：

* 每个 ChatResponse Chunk 怎么返回给前端；
* 前端怎么累加流式内容；
* 前端打字效果怎么实现；
* User Message 在什么时候插入；
* Assistant Message 在什么时候插入；
* 完整 Assistant 内容什么时候更新；
* 正常完成、异常、主动取消分别怎么处理。

同时告诉我对应的真实文件和方法。

### 8. 最后输出完整调用图

最终给我一张从：

`index.vue`

一直到：

`StreamingChatModel.stream`

再回到：

`ai_chat_message`

的完整调用图。

另外单独标出：

`ChatResponse -> Metadata -> Usage`

这一条目前原项目存在、但业务代码没有消费的数据路径。

本轮只理解调用链和确认事实。

不要新增 Usage 表，不要增加 Token 字段，不要设计 Pricing，也不要实现 Billing。

</CodingAgentPrompt>

---

## 下一步

现在我们已经不是“猜” CostFlow 应该接在哪里了。

我们真正找到了一次聊天的模型调用边界：

```java
Flux<ChatResponse> streamResponse =
        chatModel.stream(prompt);
```

也确认了 Spring AI `1.1.8` 的：

```text
ChatResponse
    ↓
ChatResponseMetadata
    ↓
Usage
```

本身已经提供 Token Usage 抽象。

而现有业务代码目前主要消费的是：

```text
content
reasoningContent
```

并没有把 Usage 继续变成业务数据。

下一篇就可以正式回答一个问题：

> **CostFlow 的第一条 Usage，到底应该在哪里、以什么方式采集？**

下一篇：

> **[现有 AI 调用缺了什么：找到 CostFlow 的第一个计费入口](/projects/costflow/01-project-start/09-billing-entry)**

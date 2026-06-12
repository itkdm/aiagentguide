---
title: Spring AI Alibaba 消息
description: 介绍 Spring AI Alibaba 中消息的基本概念、常见消息类型、多模态内容以及它们在 ChatModel 和 ReactAgent 中的使用方式。
summary: 本文基于 Spring AI Alibaba 官方 Messages 文档整理，帮助你理解 Message 在模型调用中的角色，以及常见消息类型和使用方式。
keywords:
  - Spring AI Alibaba
  - 消息
  - Message
  - UserMessage
  - AssistantMessage
tags:
  - AI Agent
  - 框架
  - Java
date: 2026-05-29
lastUpdated: 2026-05-29
status: published
assets: none
reviewed: false
sourceType: curated
author: AI Agent Guide
draft: false
noindex: false
---

# 消息

`Message` 是 Spring AI Alibaba 中模型交互的基本单元。
它用来表示与大模型交互时的输入和输出，同时携带表示对话状态所需的内容和元数据。

可以先把一条消息理解成由 3 部分组成：

- `Role`：消息角色，例如 `system`、`user`、`assistant`
- `Content`：消息内容，例如文本、图像、音频、文档
- `Metadata`：可选元数据，例如消息 ID、响应信息、token 使用情况

Spring AI Alibaba 提供了一套统一的消息类型系统，让你在不同模型提供商之间切换时，仍然可以保持一致的消息组织方式。

## 基础使用

使用消息最直接的方式，是先创建消息对象，再把它们传给模型。

```java
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.model.ChatResponse;
import java.util.List;

// 使用 DashScope ChatModel
ChatModel chatModel = // ... 初始化 ChatModel

SystemMessage systemMsg = new SystemMessage("你是一个有帮助的助手。");
UserMessage userMsg = new UserMessage("你好，你好吗？");

// 与聊天模型一起使用
List<org.springframework.ai.chat.messages.Message> messages = List.of(systemMsg, userMsg);
Prompt prompt = new Prompt(messages);
ChatResponse response = chatModel.call(prompt);  // 返回 ChatResponse，包含 AssistantMessage
```

### 文本提示

文本提示本质上是字符串，适合简单的单次生成任务。

```java
// 使用字符串直接调用
String response = chatModel.call("写一首关于春天的俳句");
```

这种方式通常适合：

- 单个独立请求
- 不需要保留对话历史
- 希望保持最小代码复杂度

### 消息提示

如果你需要系统指令、历史上下文或多轮对话，通常会直接传入消息列表。

```java
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.model.ChatResponse;
import java.util.List;

List<org.springframework.ai.chat.messages.Message> messages = List.of(
  new SystemMessage("你是一个诗歌专家"),
  new UserMessage("写一首关于春天的俳句"),
  new AssistantMessage("樱花盛开时...")
);
Prompt prompt = new Prompt(messages);
ChatResponse response = chatModel.call(prompt);
```

这种方式通常更适合：

- 管理多轮对话
- 处理多模态内容（如图像、音频、文档等）
- 包含系统指令

## 消息类型

- `SystemMessage`：告诉模型如何行为，并提供初始上下文
- `UserMessage`：表示用户输入
- `AssistantMessage`：表示模型输出
- `ToolResponseMessage`：表示工具执行结果

### System Message

`SystemMessage` 用来给模型设定角色、语气和回答边界。

```java
// 基础指令
SystemMessage systemMsg = new SystemMessage("你是一个有帮助的编程助手。");

List<org.springframework.ai.chat.messages.Message> messages = List.of(
  systemMsg,
  new UserMessage("如何创建 REST API？")
);
ChatResponse response = chatModel.call(new Prompt(messages));
```

如果你希望模型行为更稳定，也可以把要求写得更具体一些：

```java
// 详细的角色设定
SystemMessage systemMsg = new SystemMessage("""
  你是一位资深的 Java 开发者，擅长 Web 框架。
  始终提供代码示例并解释你的推理。
  在解释中要简洁但透彻。
  """);

List<org.springframework.ai.chat.messages.Message> messages = List.of(
  systemMsg,
  new UserMessage("如何创建 REST API？")
);
ChatResponse response = chatModel.call(new Prompt(messages));
```

### User Message

`UserMessage` 表示用户输入。
除了普通文本，它还可以携带元数据和多模态内容。

#### 文本内容

```java
// 使用消息对象
ChatResponse response = chatModel.call(
  new Prompt(List.of(new UserMessage("什么是机器学习？")))
);

// 使用字符串快捷方式
// 使用字符串是单个 UserMessage 的快捷方式
String response = chatModel.call("什么是机器学习？");
```

#### 消息元数据

```java
import java.util.Map;

UserMessage userMsg = UserMessage.builder()
  .text("你好！")
  .metadata(Map.of(
      "user_id", "alice",
      "session_id", "sess_123"
  ))
  .build();
```

需要注意的是，元数据字段的处理方式会因模型提供商而异。有些提供商会使用这些字段做用户识别，有些则可能忽略它们。

#### 多模态内容

`UserMessage` 还可以直接携带图像等媒体内容。

```java
import org.springframework.ai.content.Media;
import org.springframework.util.MimeTypeUtils;
import java.net.URL;

// 从 URL 创建图像
UserMessage userMsg = UserMessage.builder()
  .text("描述这张图片的内容。")
  .media(Media.builder()
      .mimeType(MimeTypeUtils.IMAGE_JPEG)
      .data(new URL("https://example.com/image.jpg"))
      .build())
  .build();
```

### Assistant Message

`AssistantMessage` 表示模型输出。
它通常来自 `ChatResponse`，除了文本内容，还可能包含工具调用和元数据。

```java
ChatResponse response = chatModel.call(new Prompt("解释 AI"));
AssistantMessage aiMessage = response.getResult().getOutput();
System.out.println(aiMessage.getText());
```

有时候你也会手动构造 `AssistantMessage`，把它插回到对话历史里。

```java
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import java.util.List;

// 手动创建 AI 消息（例如，用于对话历史）
AssistantMessage aiMsg = new AssistantMessage("我很乐意帮助你回答这个问题！");

// 添加到对话历史
List<org.springframework.ai.chat.messages.Message> messages = List.of(
  new SystemMessage("你是一个有帮助的助手"),
  new UserMessage("你能帮我吗？"),
  aiMsg,
  new UserMessage("太好了！2+2 等于多少？")
);

ChatResponse response = chatModel.call(new Prompt(messages));
```

`AssistantMessage` 中常见的信息包括：

- `text`: 消息的文本内容
- `metadata`: 消息的元数据映射
- `toolCalls`: 模型进行的工具调用列表
- `media`: 媒体内容列表（如果有）

#### 工具调用

当模型触发工具调用时，这些调用信息会出现在 `AssistantMessage` 中。

```java
import org.springframework.ai.chat.messages.AssistantMessage.ToolCall;

ChatResponse response = chatModel.call(prompt);
AssistantMessage aiMessage = response.getResult().getOutput();

if (aiMessage.hasToolCalls()) {
  for (ToolCall toolCall : aiMessage.getToolCalls()) {
      System.out.println("Tool: " + toolCall.name());
      System.out.println("Args: " + toolCall.arguments());
      System.out.println("ID: " + toolCall.id());
  }
}
```

#### Token 使用

`ChatResponse` 的元数据里通常可以拿到 token 使用情况。

```java
import org.springframework.ai.chat.metadata.ChatResponseMetadata;

ChatResponse response = chatModel.call(new Prompt("你好！"));
ChatResponseMetadata metadata = response.getMetadata();

// 访问使用信息
if (metadata != null && metadata.getUsage() != null) {
  System.out.println("Input tokens: " + metadata.getUsage().getPromptTokens());
  System.out.println("Output tokens: " + metadata.getUsage().getCompletionTokens());
  System.out.println("Total tokens: " + metadata.getUsage().getTotalTokens());
}
```

#### 流式和块

流式调用时，你拿到的是可以逐步拼接成完整消息的响应块。

```java
import reactor.core.publisher.Flux;

Flux<ChatResponse> responseStream = chatModel.stream(new Prompt("你好"));

StringBuilder fullResponse = new StringBuilder();
responseStream.subscribe(
  chunk -> {
      String content = chunk.getResult().getOutput().getText();
      fullResponse.append(content);
      System.out.print(content);
  }
);
```

### Tool Response Message

`ToolResponseMessage` 用来把工具执行结果传回模型。
在支持工具调用的场景里，它通常会和 `AssistantMessage` 中的工具调用信息配合使用。

```java
import org.springframework.ai.chat.messages.ToolResponseMessage;
import org.springframework.ai.chat.messages.ToolResponseMessage.ToolResponse;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import java.util.List;

// 在模型进行工具调用后
AssistantMessage aiMessage = AssistantMessage.builder()
  .content("")
  .toolCalls(List.of(
      new AssistantMessage.ToolCall(
          "call_123",
          "tool",
          "get_weather",
          "{\"location\": \"San Francisco\"}"
      )
  ))
  .build();

// 执行工具并创建结果消息
String weatherResult = "晴朗，22°C";
ToolResponseMessage toolMessage = ToolResponseMessage.builder()
  .responses(List.of(
      new ToolResponse("call_123", "get_weather", weatherResult)
  ))
  .build();

// 继续对话
List<org.springframework.ai.chat.messages.Message> messages = List.of(
  new UserMessage("旧金山的天气怎么样？"),
  aiMessage,
  toolMessage
);
ChatResponse response = chatModel.call(new Prompt(messages));
```

`ToolResponseMessage` 属性：

- `responses`: `ToolResponse` 对象列表，每个包含：
  - `id`: 工具调用 ID（必须与 `AssistantMessage` 中的工具调用 ID 匹配）
  - `name`: 调用的工具名称
  - `responseData`: 工具调用的字符串化输出

## 多模态内容

多模态表示一条消息不只包含文本，还可以包含图像、音频、视频等内容。

### 图像输入

```java
import org.springframework.ai.content.Media;
import org.springframework.util.MimeTypeUtils;
import java.net.URL;
import org.springframework.core.io.ClassPathResource;

// 从 URL
UserMessage message = UserMessage.builder()
  .text("描述这张图片的内容。")
  .media(Media.builder()
      .mimeType(MimeTypeUtils.IMAGE_JPEG)
      .data(new URL("https://example.com/image.jpg"))
      .build())
  .build();

// 从本地文件
UserMessage localMessage = UserMessage.builder()
  .text("描述这张图片的内容。")
  .media(new Media(
      MimeTypeUtils.IMAGE_JPEG,
      new ClassPathResource("images/photo.jpg")
  ))
  .build();
```

### 音频输入

```java
import org.springframework.ai.content.Media;
import org.springframework.util.MimeTypeUtils;
import org.springframework.core.io.ClassPathResource;

UserMessage message = UserMessage.builder()
  .text("描述这段音频的内容。")
  .media(new Media(
      MimeTypeUtils.parseMimeType("audio/wav"),
      new ClassPathResource("audio/recording.wav")
  ))
  .build();
```

### 视频输入

```java
import org.springframework.ai.content.Media;
import org.springframework.util.MimeTypeUtils;
import java.net.URL;

UserMessage message = UserMessage.builder()
  .text("描述这段视频的内容。")
  .media(Media.builder()
      .mimeType(MimeTypeUtils.parseMimeType("video/mp4"))
      .data(new URL("https://example.com/path/to/video.mp4"))
      .build())
  .build();
```

并不是所有模型都支持所有多模态格式。实际使用时，最好先检查模型提供商文档里的格式和大小限制。

## 与 Chat Models 一起使用

`ChatModel` 接收消息序列作为输入，返回 `ChatResponse` 作为输出。
如果你要保留上下文，通常就需要维护一个不断增长的消息列表。

### 基础对话示例

```java
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import java.util.ArrayList;
import java.util.List;

ChatModel chatModel = // ... 初始化

List<Message> conversationHistory = new ArrayList<>();

// 第一轮对话
conversationHistory.add(new UserMessage("你好！"));
ChatResponse response1 = chatModel.call(new Prompt(conversationHistory));
conversationHistory.add(response1.getResult().getOutput());

// 第二轮对话
conversationHistory.add(new UserMessage("你能帮我学习 Java 吗？"));
ChatResponse response2 = chatModel.call(new Prompt(conversationHistory));
conversationHistory.add(response2.getResult().getOutput());

// 第三轮对话
conversationHistory.add(new UserMessage("从哪里开始？"));
ChatResponse response3 = chatModel.call(new Prompt(conversationHistory));
```

### 使用 Builder 模式

消息类通常都支持 `builder`，适合在需要元数据或媒体内容时使用。

```java
import java.util.Map;

// UserMessage with builder
UserMessage userMsg = UserMessage.builder()
  .text("你好，我想学习 Spring AI Alibaba")
  .metadata(Map.of("user_id", "user_123"))
  .build();

// SystemMessage with builder
SystemMessage systemMsg = SystemMessage.builder()
  .text("你是一个 Spring 框架专家")
  .metadata(Map.of("version", "1.0"))
  .build();

// AssistantMessage with builder
AssistantMessage assistantMsg = AssistantMessage.builder()
  .content("我很乐意帮助你学习 Spring AI Alibaba！")
  .build();
```

### 消息复制和修改

如果你需要在原消息基础上生成一个变体，可以使用 `copy()` 或 `mutate()`。

```java
import java.util.Map;

// 复制消息
UserMessage original = new UserMessage("原始消息");
UserMessage copy = original.copy();

// 使用 mutate 创建修改的副本
UserMessage modified = original.mutate()
  .text("修改后的消息")
  .metadata(Map.of("modified", true))
  .build();
```

## 在 ReactAgent 中使用

`ReactAgent` 会自动管理消息历史，但它同样支持直接传入字符串、单条消息或消息列表。

```java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import java.util.List;

ReactAgent agent = ReactAgent.builder()
  .name("my_agent")
  .model(chatModel)
  .systemPrompt("你是一个有帮助的助手")
  .build();

// 使用字符串
AssistantMessage response1 = agent.call("你好");

// 使用 UserMessage
UserMessage userMsg = new UserMessage("帮我写一首诗");
AssistantMessage response2 = agent.call(userMsg);

// 使用消息列表
List<Message> messages = List.of(
  new UserMessage("我喜欢春天"),
  new UserMessage("写一首关于春天的诗")
);
AssistantMessage response3 = agent.call(messages);
```

## 参考链接

- [Spring AI Alibaba 官方 Messages 文档](https://java2ai.com/docs/frameworks/agent-framework/tutorials/messages/)
- [Spring AI Alibaba 官方站点](https://java2ai.com/)
- [官方示例代码](https://github.com/spring-ai-alibaba/examples)

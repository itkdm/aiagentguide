---
title: Spring AI Alibaba 快速开始
description: 跟随一个最小示例，快速创建并运行你的第一个 Spring AI Alibaba Agent。
summary: 本文基于 Spring AI Alibaba 官方快速开始页，整理一条最小可运行路径，帮助你快速创建第一个 Agent。
keywords:
  - Spring AI Alibaba
  - 快速开始
  - ReactAgent
  - DashScope
tags:
  - AI Agent
  - 框架
  - Java
date: 2026-05-28
lastUpdated: 2026-05-28
status: published
assets: none
reviewed: false
sourceType: curated
author: 布吉岛
draft: false
noindex: false
---

# Spring AI Alibaba 快速开始

这篇快速开始的目标不是把 Spring AI Alibaba 的所有能力一次讲完，而是先带你跑通一个最小的 `ReactAgent` 示例。完成这一页后，你应该能理解三件事：

- 如何初始化模型
- 如何定义一个最简单的工具
- 如何创建并调用一个可运行的 Agent

如果你还没有完成环境准备，可以先阅读[前置条件](/frameworks/spring-ai-alibaba/get-started/preconditions)。

## 第一步：准备依赖和 API Key

请先确认项目中已经加入下面两个依赖：

```xml
<dependencies>
    <dependency>
        <groupId>com.alibaba.cloud.ai</groupId>
        <artifactId>spring-ai-alibaba-agent-framework</artifactId>
        <version>1.1.2.0</version>
    </dependency>

    <dependency>
        <groupId>com.alibaba.cloud.ai</groupId>
        <artifactId>spring-ai-alibaba-starter-dashscope</artifactId>
        <version>1.1.2.0</version>
    </dependency>
</dependencies>
```

同时准备好 DashScope API Key，并确保应用可以通过环境变量或配置文件读取到 `spring.ai.dashscope.api-key`。

## 第二步：初始化模型

先创建 `DashScopeApi`，再基于它初始化 `ChatModel`：

```java
DashScopeApi dashScopeApi = DashScopeApi.builder()
    .apiKey(System.getenv("AI_DASHSCOPE_API_KEY"))
    .build();

ChatModel chatModel = DashScopeChatModel.builder()
    .dashScopeApi(dashScopeApi)
    .build();
```

## 第三步：定义一个最小工具

为了让 Agent 不只是“纯聊天”，我们再加一个最简单的天气工具：

```java
public class WeatherTool implements BiFunction<String, ToolContext, String> {
    @Override
    public String apply(String city, ToolContext toolContext) {
        return "It's always sunny in " + city + "!";
    }
}
```

然后把这个工具包装成 `ToolCallback`：

```java
ToolCallback weatherTool = FunctionToolCallback.builder("get_weather", new WeatherTool())
    .description("Get weather for a given city")
    .inputType(String.class)
    .build();
```

## 第四步：创建 Agent

有了模型和工具之后，就可以创建一个最小的 `ReactAgent`：

```java
ReactAgent agent = ReactAgent.builder()
    .name("weather_agent")
    .model(chatModel)
    .tools(weatherTool)
    .systemPrompt("You are a helpful assistant")
    .saver(new MemorySaver())
    .build();
```

## 第五步：调用 Agent

创建完成后，就可以直接调用：

```java
AssistantMessage response = agent.call("what is the weather in San Francisco");
System.out.println(response.getText());
```

如果环境和依赖都没有问题，你应该能看到一个基于模型推理和工具调用返回的结果。

## 构建一个真实的 Agent

接下来，构建一个实用的天气预报 agent，演示关键的生产概念：

- 详细的 System Prompt：获得更好的 agent 行为
- 创建工具：与外部数据集成
- 模型配置：获得一致的响应
- 结构化输出：获得可预测的结果
- 对话记忆：实现类似聊天的交互
- 创建和运行 agent：创建一个功能完整的 agent

让我们逐步完成每个步骤：

### 1. 定义系统提示

系统提示定义了 agent 的角色和行为。保持具体和可操作：

```java
String SYSTEM_PROMPT = """
    You are an expert weather forecaster, who speaks in puns.

    You have access to two tools:

    - get_weather_for_location: use this to get the weather for a specific location
    - get_user_location: use this to get the user's location

    If a user asks you for the weather, make sure you know the location.
    If you can tell from the question that they mean wherever they are,
    use the get_user_location tool to find their location.
    """;
```

### 2. 创建工具

工具让模型能够通过调用你定义的函数与外部系统交互。工具可以依赖运行时上下文，也可以与 agent 的记忆交互。

注意下面的 `getUserLocation` 工具如何使用运行时上下文（通过 `ToolContext`）：

```java
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.ai.tool.function.FunctionToolCallback;

import java.util.function.BiFunction;

// 天气查询工具
public class WeatherForLocationTool implements BiFunction<String, ToolContext, String> {
    @Override
    public String apply(
        @ToolParam(description = "The city name") String city,
        ToolContext toolContext) {
        return "It's always sunny in " + city + "!";
    }
}

// 用户位置工具 - 使用上下文
public class UserLocationTool implements BiFunction<String, ToolContext, String> {
    @Override
    public String apply(
        @ToolParam(description = "User query") String query,
        ToolContext toolContext) {
        // 从上下文中获取用户信息
        String userId = "";
        if (toolContext != null && toolContext.getContext() != null) {
            RunnableConfig runnableConfig = (RunnableConfig) toolContext.getContext().get(AGENT_CONFIG_CONTEXT_KEY);
            Optional<Object> userIdObjOptional = runnableConfig.metadata("user_id");
            if (userIdObjOptional.isPresent()) {
                userId = (String) userIdObjOptional.get();
            }
        }
        if (userId == null) {
            userId = "1";
        }
        return "1".equals(userId) ? "Florida" : "San Francisco";
    }
}

// 创建工具回调
ToolCallback getWeatherTool = FunctionToolCallback
    .builder("getWeatherForLocation", new WeatherForLocationTool())
    .description("Get weather for a given city")
    .inputType(String.class)
    .build();

ToolCallback getUserLocationTool = FunctionToolCallback
    .builder("getUserLocation", new UserLocationTool())
    .description("Retrieve user location based on user ID")
    .inputType(String.class)
    .build();
```

提示：工具应该有良好的文档：它们的名称、描述和参数名称都会成为模型提示的一部分。Spring AI 的 `FunctionToolCallback` 支持通过 `@ToolParam` 注解添加元数据，并支持通过 `ToolContext` 参数进行运行时注入。

### 3. 配置模型

为你的用例配置合适的大语言模型参数：

```java
import com.alibaba.cloud.ai.dashscope.api.DashScopeApi;
import com.alibaba.cloud.ai.dashscope.chat.DashScopeChatModel;
import com.alibaba.cloud.ai.dashscope.chat.DashScopeChatOptions;
import org.springframework.ai.chat.model.ChatModel;

DashScopeApi dashScopeApi = DashScopeApi.builder()
    .apiKey(System.getenv("AI_DASHSCOPE_API_KEY"))
    .build();

ChatModel chatModel = DashScopeChatModel.builder()
    .dashScopeApi(dashScopeApi)
    .defaultOptions(DashScopeChatOptions.builder()
        // 使用 options 构建时，需要显式指定 model
        .withModel(DashScopeChatModel.DEFAULT_MODEL_NAME)
        .withTemperature(0.5)
        .withMaxToken(1000)
        .build())
    .build();
```

根据不同的模型选择，增加依赖：

```xml
<!-- DashScope-->
<dependency>
 <groupId>com.alibaba.cloud.ai</groupId>
 <artifactId>spring-ai-alibaba-starter-dashscope</artifactId>
 <version>1.1.2.1</version>
</dependency>

<!-- OpenAI-->
<dependency>
 <groupId>org.springframework.ai</groupId>
 <artifactId>spring-ai-starter-model-openai</artifactId>
 <version>1.1.2</version>
</dependency>
```

### 4. 定义响应格式

如果你需要 agent 响应匹配特定的模式，可以定义结构化响应格式。

```java
// 使用 Java 类定义响应格式
public class ResponseFormat {
    // 一个双关语响应（始终必需）
    private String punnyResponse;

    // 如果可用的话，关于天气的任何有趣信息
    private String weatherConditions;

    // Getters and Setters
    public String getPunnyResponse() {
        return punnyResponse;
    }

    public void setPunnyResponse(String punnyResponse) {
        this.punnyResponse = punnyResponse;
    }

    public String getWeatherConditions() {
        return weatherConditions;
    }

    public void setWeatherConditions(String weatherConditions) {
        this.weatherConditions = weatherConditions;
    }
}
```

### 5. 添加记忆

为你的 agent 添加记忆以维持跨交互的状态。这允许 agent 记住之前的对话和上下文，在多次调用之间，使用同一个 `threadId` 即可加载之前的对话记录。

```java
ReactAgent agent = ReactAgent.builder()
    .name("weather_agent")
    //...
    .saver(new MemorySaver())
    .build();
```

在调用的时候：

```java
RunnableConfig runnableConfig = RunnableConfig.builder().threadId(threadId).build();

// 第一次调用
AssistantMessage response = agent.call("what is the weather in San Francisco today.", runnableConfig);

// 第二次调用
AssistantMessage response = agent.call("How about the weather tomorrow", runnableConfig);
```

注意：在生产环境中，使用持久化的 CheckPointer 将数据保存到数据库。更多详情参见内存管理文档。

### 6. 创建和运行 Agent

现在用所有组件组装你的 agent 并运行它：

```java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import com.alibaba.cloud.ai.graph.RunnableConfig;
import org.springframework.ai.chat.messages.AssistantMessage;

import java.util.HashMap;
import java.util.Map;

// 创建 agent
ReactAgent agent = ReactAgent.builder()
    .name("weather_pun_agent")
    .model(chatModel)
    .systemPrompt(SYSTEM_PROMPT)
    .tools(getUserLocationTool, getWeatherTool)
    .outputType(ResponseFormat.class)
    .saver(new MemorySaver())
    .build();

// threadId 是给定对话的唯一标识符
RunnableConfig runnableConfig = RunnableConfig.builder().threadId(threadId).addMetadata("user_id", "1").build();

// 第一次调用
AssistantMessage response = agent.call("外面的天气怎么样？", runnableConfig);
System.out.println(response.getText());
// 输出类似：
// 你当前位置的天气不错，阳光充足，整体比较晴朗。
// 如果你准备出门，今天算是个挺舒服的天气。
// 要是你愿意，我还可以继续帮你看看接下来几天的变化。

// 注意我们可以使用相同的 threadId 继续对话
response = agent.call("谢谢你！", runnableConfig);
System.out.println(response.getText());
// 输出类似：
// 不客气，很高兴帮到你。
// 如果你还想看明天的天气，或者换个城市继续查，也可以直接告诉我。
```

### 查看完整示例代码

完整示例代码请查看仓库：[https://github.com/spring-ai-alibaba/examples](https://github.com/spring-ai-alibaba/examples)

## 下一步

如果你想继续深入，可以按这个顺序往下看：

1. 阅读[版本说明](/frameworks/spring-ai-alibaba/get-started/versions)，确认版本组合和升级策略
2. 对照 Spring AI Alibaba 官方快速开始页，继续扩展更完整的示例
3. 再进入更具体的 Agent、Graph 或多 Agent 主题

## 参考链接

- 官方快速开始：[https://java2ai.com/docs/quick-start/](https://java2ai.com/docs/quick-start/)
- 官方示例仓库：[https://github.com/spring-ai-alibaba/examples](https://github.com/spring-ai-alibaba/examples)

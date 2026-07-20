---
title: Spring AI Alibaba 工具
description: 介绍 Spring AI Alibaba 中 Tool 的作用、创建方式、执行机制、上下文访问能力以及在 ReactAgent 中的接入方式。
summary: 本文基于 Spring AI Alibaba 官方 Tools 文档整理，帮助你从概念、定义、执行到 Agent 集成几个层面理解工具调用。
keywords:
  - Spring AI Alibaba
  - Tool
  - ToolCallback
  - Function Calling
  - ReactAgent
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
author: 布吉岛
draft: false
noindex: false
---

# 工具

许多 AI 应用通过自然语言与用户交互，但在真实业务里，模型往往还需要和 API、数据库、文件系统或企业内部服务直接协作。

`Tool` 就是 Agent 执行这些动作的接口。  
它通过明确的输入和输出，把模型的推理能力扩展到外部世界。

你可以先把工具理解成：

- 一个可调用的函数或方法
- 一份供模型理解的输入参数说明
- 一段由应用程序真正执行的业务逻辑

工具调用通常也会被称为 `Tool Calling` 或 `Function Calling`。

它主要有两类用途：

- `信息检索`：从数据库、Web 服务、文件系统或搜索引擎中读取信息
- `执行操作`：在外部系统里真正触发某个动作

还要注意一个关键点：  
虽然我们经常说“模型调用工具”，但真正负责执行工具的是客户端应用程序，而不是模型本身。模型只能请求“调用哪个工具、传什么参数”，它并不会直接访问你暴露出去的 API。

另外，有些模型提供商本身也提供服务器端工具，例如 Web 搜索、代码解释器等。这类能力的接入方式通常取决于具体模型提供商，需要结合对应模型文档单独查看。

## 快速开始

先通过两个最小示例建立对工具调用的直觉。

### 信息检索

模型本身无法访问实时信息，例如当前时间、天气或数据库中的最新记录。  
这时可以给它提供一个工具，在需要时由模型请求调用。

下面的示例定义了一个获取当前时间的工具：

```java
import java.time.LocalDateTime;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.context.i18n.LocaleContextHolder;

class DateTimeTools {

  @Tool(description = "Get the current date and time in the user's timezone")
  String getCurrentDateTime() {
      return LocalDateTime.now().atZone(LocaleContextHolder.getTimeZone().toZoneId()).toString();
  }

}
```

接着把这个工具提供给 `ChatClient`：

```java
ChatModel chatModel = ...;

String response = ChatClient.create(chatModel)
      .prompt("What day is tomorrow?")
      .tools(new DateTimeTools())
      .call()
      .content();

System.out.println(response);
// 输出：Tomorrow is 2015-10-21.
```

这一轮交互里，模型会先决定是否需要工具；如果需要，就请求调用 `getCurrentDateTime()`，框架执行后再把结果回给模型，最后生成最终回答。

### 执行操作

工具不仅能查信息，也能真正执行操作。

下面给同一个类再加一个设置闹钟的工具：

```java
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.context.i18n.LocaleContextHolder;

class DateTimeTools {

  @Tool(description = "Get the current date and time in the user's timezone")
  String getCurrentDateTime() {
      return LocalDateTime.now().atZone(LocaleContextHolder.getTimeZone().toZoneId()).toString();
  }

  @Tool(description = "Set a user alarm for the given time, provided in ISO-8601 format")
  void setAlarm(String time) {
      LocalDateTime alarmTime = LocalDateTime.parse(time, DateTimeFormatter.ISO_DATE_TIME);
      System.out.println("Alarm set for " + alarmTime);
  }

}
```

然后把两个工具一起交给模型：

```java
ChatModel chatModel = ...;

String response = ChatClient.create(chatModel)
      .prompt("Can you set an alarm 10 minutes from now?")
      .tools(new DateTimeTools())
      .call()
      .content();

System.out.println(response);
// 在应用程序日志中，您可以检查闹钟是否已在正确时间设置。
```

这个例子里，模型通常会先调用时间工具拿到当前时间，再自行推算 10 分钟后的时间，最后调用设置闹钟的工具。

## 概述

Spring AI 通过一组统一抽象来支持工具调用。

一次典型的工具调用流程可以概括为：

1. 应用程序把工具定义加入到聊天请求里
2. 模型根据工具定义判断是否需要调用工具
3. 模型返回工具名和输入参数
4. 应用程序根据工具名找到真实工具并执行
5. 工具执行结果被回传给模型
6. 模型基于工具结果生成最终回答

在 Spring AI Alibaba 中，这套机制主要围绕下面这些对象展开：

- `ToolCallback`
- `ToolDefinition`
- `ToolCallingManager`
- `ToolCallbackResolver`

## 创建工具

Spring AI 提供了两大类内置方式来定义工具：

- 声明式，使用 `@Tool` 注解
- 编程式，使用低级 `MethodToolCallback` 实现。

### 方法作为 Tools

### 声明式规范：`@Tool`

你可以直接把一个方法通过 `@Tool` 注解暴露成工具：

```java
class DateTimeTools {

  @Tool(description = "Get the current date and time in the user's timezone")
  String getCurrentDateTime() {
      return LocalDateTime.now().atZone(LocaleContextHolder.getTimeZone().toZoneId()).toString();
  }

}
```

`@Tool` 最重要的几个属性包括：

- `name`：工具名；如果不提供，默认使用方法名。模型会用这个名字识别工具，因此同一个工具集合里的名称必须唯一
- `description`：工具描述；如果不提供，默认使用方法名。建议尽量写清楚用途和使用时机。如果描述不充分，模型可能在该用工具时不调用，或者错误地调用它
- `returnDirect`：是否直接把结果返回给调用者
- `resultConverter`：自定义结果转换器

方法可以是静态方法，也可以是实例方法；参数数量也不受限制。  
方法和包含它的类都可以使用不同可见性，只要在实际实例化或调用位置可以访问即可。

只要参数类型和返回类型能被正确序列化，通常都可以作为工具定义的一部分。常见可支持的类型包括：

- 基本类型
- POJO
- 枚举
- 列表
- 数组
- Map

如果方法有返回值，返回类型应当是可序列化的，因为结果需要被框架序列化后再发回模型。

如果你使用 AOT 或 GraalVM 原生编译，`@Tool` 方法所在类最好本身就是 Spring Bean；否则通常还需要额外补充反射配置。

如果参数需要额外说明，可以使用 `@ToolParam`：

```java
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;

class DateTimeTools {

  @Tool(description = "Set a user alarm for the given time")
  void setAlarm(@ToolParam(description = "Time in ISO-8601 format") String time) {
      LocalDateTime alarmTime = LocalDateTime.parse(time, DateTimeFormatter.ISO_DATE_TIME);
      System.out.println("Alarm set for " + alarmTime);
  }

}
```

`@ToolParam` 常用来补充：

- 参数说明
- 参数是否必填

如果参数使用了 `@Nullable`，通常会被视为可选参数，除非又通过 `@ToolParam(required = true)` 明确标记为必填。

除了 `@ToolParam`，也可以使用 Swagger 的 `@Schema`，或者 Jackson 的 `@JsonProperty` / `@JsonPropertyDescription` 等注解来补充 schema 信息。

### 编程式规范：`MethodToolCallback`

如果你不想用注解，也可以直接通过代码构造 `MethodToolCallback`：

```java
import org.springframework.util.ReflectionUtils;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.method.MethodToolCallback;
import org.springframework.ai.tool.ToolDefinitions;

class DateTimeTools {

  String getCurrentDateTime() {
      return LocalDateTime.now().atZone(LocaleContextHolder.getTimeZone().toZoneId()).toString();
  }

}

Method method = ReflectionUtils.findMethod(DateTimeTools.class, "getCurrentDateTime");
ToolCallback toolCallback = MethodToolCallback.builder()
  .toolDefinition(ToolDefinitions.builder(method)
          .description("Get the current date and time in the user's timezone")
          .build())
  .toolMethod(method)
  .toolObject(new DateTimeTools())
  .build();
```

这里最关键的几个构造项是：

- `toolDefinition`：工具定义，必填
- `toolMethod`：要执行的反射方法，必填
- `toolObject`：方法所属对象；如果方法是静态的，可以省略
- `toolMetadata`：控制 `returnDirect` 等附加行为
- `toolCallResultConverter`：自定义工具结果转换器

如果方法是静态的，可以省略 `toolObject()`：

```java
class DateTimeTools {

  static String getCurrentDateTime() {
      return LocalDateTime.now().atZone(LocaleContextHolder.getTimeZone().toZoneId()).toString();
  }

}

Method method = ReflectionUtils.findMethod(DateTimeTools.class, "getCurrentDateTime");
ToolCallback toolCallback = MethodToolCallback.builder()
  .toolDefinition(ToolDefinitions.builder(method)
          .description("Get the current date and time in the user's timezone")
          .build())
  .toolMethod(method)
  .build();
```

### 方法 Tool 限制

目前下面这些类型不适合作为方法工具的参数或返回值：

- `Optional`
- 异步类型，例如 `CompletableFuture`、`Future`
- 响应式类型，例如 `Mono`、`Flux`、`Flow`
- 函数类型，例如 `Function`、`Supplier`、`Consumer`

### 函数作为 Tools

### 基础工具定义

除了方法，你也可以直接把函数定义成工具。

先看一个函数本体：

```java
import java.util.function.Function;

public class WeatherService implements Function<WeatherRequest, WeatherResponse> {
  public WeatherResponse apply(WeatherRequest request) {
      return new WeatherResponse(30.0, Unit.C);
  }
}

public enum Unit { C, F }
public record WeatherRequest(String location, Unit unit) {}
public record WeatherResponse(double temp, Unit unit) {}
```

### 编程方式规范：`FunctionToolCallback`

然后通过 `FunctionToolCallback` 暴露出去：

```java
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.function.FunctionToolCallback;

ToolCallback toolCallback = FunctionToolCallback
  .builder("currentWeather", new WeatherService())
  .description("Get the weather in location")
  .inputType(WeatherRequest.class)
  .build();
```

`FunctionToolCallback.Builder` 允许你构建 `FunctionToolCallback`，并补充工具调用所需的关键信息。

它最关键的几个属性包括：

- `name`：工具名称。模型会用它识别工具，因此同一个上下文里的工具名必须唯一
- `toolFunction`：真正执行逻辑的函数对象，例如 `Function`、`Supplier`、`Consumer` 或 `BiFunction`
- `description`：工具描述。建议尽量写清用途和调用时机，否则模型可能不用或错用工具
- `inputType`：函数输入类型，通常是必填
- `inputSchema`：工具输入的 JSON Schema；如果不手写，通常会根据 `inputType` 自动生成
- `toolMetadata`：附加配置，例如 `returnDirect`、结果处理策略等
- `toolCallResultConverter`：工具结果转换器；如果不指定，会使用默认转换器

输入 schema 也可以配合 `@ToolParam` 一起使用，用来补充字段描述、可选性等信息。

其中也有两个点很重要：

- `name` 在同一个请求可用的所有工具里必须唯一
- `inputSchema` 如果不手写，通常会根据 `inputType` 自动生成

函数工具的输入和输出既可以是简单类型，也可以是 POJO；但它们最好都是可序列化的，因为结果最终需要被序列化后发送回模型。

另外，函数本身以及输入输出类型通常都应保持 `public` 可访问，这样更适合在运行时被框架稳定解析和调用。

把函数工具交给 `ChatClient` 时，可以这样写：

```java
import org.springframework.ai.chat.client.ChatClient;

ToolCallback toolCallback = ...;

ChatClient.create(chatModel)
  .prompt("What's the weather like in Copenhagen?")
  .toolCallbacks(toolCallback)
  .call()
  .content();
```

这种方式下，工具只会对当前这次聊天请求生效。

### 添加工具到 `ChatClient`

使用编程方式定义工具时，你可以把 `FunctionToolCallback` 实例直接传给 `ChatClient` 的 `toolCallbacks()` 方法。

```java
import org.springframework.ai.chat.client.ChatClient;

ToolCallback toolCallback = ...;

ChatClient.create(chatModel)
  .prompt("What's the weather like in Copenhagen?")
  .toolCallbacks(toolCallback)
  .call()
  .content();
```

这里的工具只会对这一次具体聊天请求生效。

### 添加默认工具到 `ChatClient`

如果某个工具会在同一个 `ChatClient` 构造出来的多次请求里反复使用，也可以把它注册成默认工具。

```java
ChatModel chatModel = ...;
ToolCallback toolCallback = ...;

ChatClient chatClient = ChatClient.builder(chatModel)
  .defaultToolCallbacks(toolCallback)
  .build();
```

这里有两个容易漏掉但很重要的点：

- 默认工具会被同一个 `ChatClient.Builder` 构建出来的所有 `ChatClient` 请求共享
- 如果同时提供了默认工具和运行时工具，运行时工具会完全覆盖默认工具，而不是和默认工具自动合并

默认工具适合放那些跨请求反复使用的能力，但如果使用不慎，也可能让某些本不该暴露的工具在不合适的请求里可用。

### 添加工具到 `ChatModel`

除了交给 `ChatClient`，你也可以把 `FunctionToolCallback` 直接交给 `ChatModel`，方式是通过 `ToolCallingChatOptions` 的 `toolCallbacks()` 方法。

```java
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.model.tool.ToolCallingChatOptions;

ChatModel chatModel = ...;
ToolCallback toolCallback = ...;

ChatOptions chatOptions = ToolCallingChatOptions.builder()
  .toolCallbacks(toolCallback)
  .build();

Prompt prompt = new Prompt("What's the weather like in Copenhagen?", chatOptions);
chatModel.call(prompt);
```

这种方式同样只会让工具对当前这个带有 `chatOptions` 的请求生效。

### 动态规范：`@Bean`

如果你希望工具由 Spring 容器托管，也可以通过 `@Bean` 暴露。

这种方式不是把 `FunctionToolCallback` 直接手工传给模型，而是把函数注册成 Spring Bean，再由 Spring AI 通过 `ToolCallbackResolver` 在运行时动态解析成工具。

它支持把下面这些 Bean 作为工具使用：

- `Function`
- `Supplier`
- `Consumer`
- `BiFunction`

在这种模式下：

- Bean 名称会作为工具名称
- Spring 的 `@Description` 注解可以作为工具描述
- 工具输入参数的 JSON Schema 会自动生成

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;
import java.util.function.Function;

@Configuration(proxyBeanMethods = false)
class WeatherTools {

  WeatherService weatherService = new WeatherService();

  @Bean
  @Description("Get the weather in location")
  Function<WeatherRequest, WeatherResponse> currentWeather() {
      return weatherService;
  }
}
```

如果输入参数需要更详细的 schema 描述，也可以继续使用 `@ToolParam`：

```java
import org.springframework.ai.tool.annotation.ToolParam;

record WeatherRequest(
  @ToolParam(description = "The name of a city or a country") String location,
  Unit unit
) {}
```

这种方式的一个缺点是：  
工具解析发生在运行时，因此不像直接传 `ToolCallback` 那样天然具备更强的类型安全感。

为了降低这个问题，官方建议可以把工具名提成常量，避免在别处硬编码：

```java
@Configuration(proxyBeanMethods = false)
class WeatherTools {

  public static final String CURRENT_WEATHER_TOOL = "currentWeather";

  @Bean(CURRENT_WEATHER_TOOL)
  @Description("Get the weather in location")
  Function<WeatherRequest, WeatherResponse> currentWeather() {
      // ...
  }
}
```

### 使用动态规范添加工具到 `ChatClient`

通过 `@Bean` 暴露的工具，通常不是通过 `toolCallbacks()` 传入，而是通过工具名称在运行时解析：

```java
ChatClient.create(chatModel)
  .prompt("What's the weather like in Copenhagen?")
  .toolNames("currentWeather")
  .call()
  .content();
```

### 使用动态规范添加默认工具到 `ChatClient`

如果这个工具需要在同一个 `ChatClient` 的多次请求里复用，也可以设置成默认工具名：

```java
ChatModel chatModel = ...;

ChatClient chatClient = ChatClient.builder(chatModel)
  .defaultToolNames("currentWeather")
  .build();
```

### 函数工具限制

以下类型目前不支持作为函数工具的输入或输出类型：

- 原始类型
- `Optional`
- 集合类型，例如 `List`、`Map`、`Array`、`Set`
- 异步类型，例如 `CompletableFuture`、`Future`
- 响应式类型，例如 `Flow`、`Mono`、`Flux`

如果你需要使用原始类型或集合类型，更适合使用基于方法的工具定义方式。

除此之外，函数工具的输入输出最好仍然保持：

- 可序列化
- 结构清晰
- 对模型来说尽量可预测

## Tool 规范

在 Spring AI 中，工具通过 `ToolCallback` 接口建模。

前面我们已经看过如何从方法和函数创建工具，这里进一步看工具本身的规范结构。

### Tool Callback

`ToolCallback` 是工具的统一运行时入口。

```java
public interface ToolCallback {

  /**
   * AI 模型用于决定何时以及如何调用工具的定义。
   */
  ToolDefinition getToolDefinition();

  /**
   * 提供有关如何处理工具的附加信息的元数据。
   */
  ToolMetadata getToolMetadata();

  /**
   * 使用给定输入执行工具，并将结果返回给 AI 模型。
   */
  String call(String toolInput);

  /**
   * 使用给定输入和上下文执行工具，并将结果返回给 AI 模型。
   */
  String call(String toolInput, ToolContext toolContext);

}
```

### Tool Definition

`ToolDefinition` 负责告诉模型“这个工具是什么、怎么调用”。

```java
public interface ToolDefinition {

  /**
   * 工具名称。在提供给模型的工具集中必须唯一。
   */
  String name();

  /**
   * 工具描述，AI 模型用它来确定工具的作用。
   */
  String description();

  /**
   * 调用工具时使用的参数的 schema。
   */
  String inputSchema();

}
```

你也可以手动构造一份定义：

```java
ToolDefinition toolDefinition = ToolDefinition.builder()
  .name("currentWeather")
  .description("Get the weather in location")
  .inputSchema("""
      {
          "type": "object",
          "properties": {
              "location": {
                  "type": "string"
              },
              "unit": {
                  "type": "string",
                  "enum": ["C", "F"]
              }
          },
          "required": ["location", "unit"]
      }
  """)
  .build();
```

### JSON Schema

模型之所以能知道“应该传什么参数”，靠的就是工具输入的 JSON Schema。

Spring AI 可以自动为方法或函数输入生成 schema，同时也允许你通过注解进一步控制描述和必填性。

### 描述

参数描述可以用来告诉模型：

- 参数的含义
- 参数的格式
- 允许值范围

常见可用于描述的注解包括：

- Spring AI 的 `@ToolParam(description = "...")`
- Jackson 的 `@JsonClassDescription(description = "...")`
- Jackson 的 `@JsonPropertyDescription(description = "...")`
- Swagger 的 `@Schema(description = "...")`

这些描述规则也可以递归应用到嵌套类型上。

### 必需/可选

默认情况下，输入参数都会被视为必填。

你可以通过下面这些方式把参数标成可选：

- Spring AI 的 `@ToolParam(required = false)`
- Jackson 的 `@JsonProperty(required = false)`
- Swagger 的 `@Schema(required = false)`
- Spring Framework 的 `@Nullable`

这些规则同样可以递归应用到嵌套对象。

示例：

```java
class CustomerTools {

  @Tool(description = "Update customer information")
  void updateCustomerInfo(Long id, String name, @ToolParam(required = false) String email) {
      System.out.println("Updated info for customer with id: " + id);
  }

}
```

这一点不要随意省略。必填和可选标记如果不准确，模型在调用工具时就更容易“脑补”参数值，从而引入幻觉。

### 结果转换

工具执行完之后，结果需要被序列化后再回给模型。  
这部分由 `ToolCallResultConverter` 负责。

```java
@FunctionalInterface
public interface ToolCallResultConverter {

  /**
   * 将工具返回的对象转换为与给定类型兼容的字符串。
   */
  String convert(@Nullable Object result, @Nullable Type returnType);

}
```

默认情况下，Spring AI 会用 Jackson 把结果序列化成 JSON。  
如果你需要更特别的返回格式，也可以提供自己的 `ToolCallResultConverter` 实现来自定义序列化过程。

### 方法 Tool Call 结果转换

```java
class CustomerTools {

  @Tool(description = "Retrieve customer information", resultConverter = CustomToolCallResultConverter.class)
  Customer getCustomerInfo(Long id) {
      return customerRepository.findById(id);
  }

}
```
如果使用编程式方法，您可以通过设置 `MethodToolCallback.Builder` 的 resultConverter() 属性来为 tool 提供自定义 `ToolCallResultConverter`。

### 函数 Tool Call 结果转换

函数工具也支持通过 `FunctionToolCallback.Builder` 设置自定义 `ToolCallResultConverter`。

### 返回直接

默认情况下，tool call 的结果会作为响应发送回模型，然后模型再基于这个结果继续对话。

但在某些场景下，你可能希望结果直接返回给调用方，而不是再交给模型做一轮后处理。  
例如：

- 你构建了一个依赖 RAG tool 的 agent，希望把检索结果直接返回给调用方
- 某些 tools 的结果本身就应该结束 agent 的推理循环

每个 `ToolCallback` 都可以定义：  
tool call 的结果是直接返回给调用方，还是继续发送回模型。

默认情况下，结果会发送回模型；但你可以按 tool 粒度修改这个行为。

负责管理工具执行生命周期的 `ToolCallingManager` 会处理和 tool 关联的 `returnDirect` 属性：

- 如果设置为 `true`，tool call 结果会直接返回给调用方
- 否则，结果会继续发送回模型

### 方法返回直接
将 `@Tool` 注解的 `returnDirect` 属性设置为 `true` 来标记 tool 将结果直接返回给调用者。
```java
class CustomerTools {

  @Tool(description = "Retrieve customer information", returnDirect = true)
  Customer getCustomerInfo(Long id) {
      return customerRepository.findById(id);
  }

}
```

或者通过 `ToolMetadata` 设置：

```java
ToolMetadata toolMetadata = ToolMetadata.builder()
  .returnDirect(true)
  .build();
```

### 函数返回直接

函数工具同样可以通过 `ToolMetadata` 设置 `returnDirect`。

如果同一轮里模型请求了多个工具，只有当这些工具的 `returnDirect` 都为 `true` 时，结果才会被直接返回给调用方；否则仍然会先回给模型。

## Tool 执行

Tool 执行是使用提供的输入参数调用 tool 并返回结果的过程。  
这一层由 `ToolCallingManager` 接口负责，它管理的是完整的 tool 执行生命周期。

```java
public interface ToolCallingManager {

  /**
   * 从模型的工具调用选项中解析工具定义。
   */
  List<ToolDefinition> resolveToolDefinitions(ToolCallingChatOptions chatOptions);

  /**
   * 执行模型请求的工具调用。
   */
  ToolExecutionResult executeToolCalls(Prompt prompt, ChatResponse chatResponse);

}
```

如果你使用任何 Spring AI Spring Boot Starter，`DefaultToolCallingManager` 会作为 `ToolCallingManager` 的自动配置实现注册。  
如果你需要自定义 tool 执行行为，也可以自己提供一个 `ToolCallingManager` Bean。

```java
@Bean
ToolCallingManager toolCallingManager() {
  return ToolCallingManager.builder().build();
}
```

### 框架控制的 Tool 执行

使用默认行为时，Spring AI 会自动拦截 model 返回的 tool call 请求，调用 tool，并把结果再送回 model。  
这整个过程由使用 `ToolCallingManager` 的 `ChatModel` 实现透明完成。

这条执行链路可以按下面 8 步来理解：

1. 当我们希望 tool 可用于 model 时，会在聊天请求 `Prompt` 中包含 tool 定义，并通过 `ChatModel` API 把请求发送给 AI model。
2. 当 model 决定调用 tool 时，它会返回一个 `ChatResponse`，其中包含 tool 名称以及根据 schema 构建的输入参数。
3. `ChatModel` 会把 tool call 请求交给 `ToolCallingManager`。
4. `ToolCallingManager` 负责识别要调用的 tool，并使用提供的输入参数执行它。
5. tool call 的执行结果会返回给 `ToolCallingManager`。
6. `ToolCallingManager` 再把 tool 执行结果交还给 `ChatModel`。
7. `ChatModel` 会把 tool 执行结果作为 `ToolResponseMessage` 发送回 AI model。
8. AI model 使用 tool call 结果作为附加上下文生成最终响应，并通过 `ChatClient` 把 `ChatResponse` 返回给调用方。

> WARNING:
> 目前，与 model 交换的关于 tool 执行的内部消息不会暴露给用户。
> 如果你需要访问这些消息，应该使用用户控制的 tool 执行方式。

tool call 是否具备执行资格，由 `ToolExecutionEligibilityPredicate` 接口负责判断。  
默认情况下，会同时检查两件事：

- `ToolCallingChatOptions` 的 `internalToolExecutionEnabled` 是否为 `true`（默认值）
- 当前 `ChatResponse` 是否包含 tool calls

如果你需要自定义这层判断逻辑，可以在创建 `ChatModel` Bean 时提供自己的 `ToolExecutionEligibilityPredicate` 实现。

### 用户控制的 Tool 执行

在某些场景下，你可能希望自己控制 tool 执行生命周期。  
这时可以把 `ToolCallingChatOptions` 的 `internalToolExecutionEnabled` 设为 `false`。

```java
ChatModel chatModel = ...;
ToolCallingManager toolCallingManager = ToolCallingManager.builder().build();

ChatOptions chatOptions = ToolCallingChatOptions.builder()
  .toolCallbacks(new CustomerTools())
  .internalToolExecutionEnabled(false)
  .build();
Prompt prompt = new Prompt("Tell me more about the customer with ID 42", chatOptions);

ChatResponse chatResponse = chatModel.call(prompt);

while (chatResponse.hasToolCalls()) {
  ToolExecutionResult toolExecutionResult = toolCallingManager.executeToolCalls(prompt, chatResponse);

  prompt = new Prompt(toolExecutionResult.conversationHistory(), chatOptions);

  chatResponse = chatModel.call(prompt);
}

System.out.println(chatResponse.getResult().getOutput().getText());
```

> NOTE:
> 选择用户控制的 tool 执行方式时，仍然推荐继续使用 `ToolCallingManager` 管理 tool calling 细节。
> 这样可以继续复用 Spring AI 内置的参数解析和结果处理能力。
> 当然，你也完全可以自己实现一套 tool 执行逻辑。

### 异常处理

当 tool call 失败时，异常会以 `ToolExecutionException` 的形式传播。  
`ToolExecutionExceptionProcessor` 用来决定是把错误转成消息发回 AI model，还是直接把异常抛给调用方。

```java
@FunctionalInterface
public interface ToolExecutionExceptionProcessor {

  /**
   * 将工具抛出的异常转换为可发送回 AI 模型的字符串，或抛出异常由调用者处理。
   */
  String process(ToolExecutionException exception);

}
```

如果你使用任何 Spring AI Spring Boot Starter，`DefaultToolExecutionExceptionProcessor` 会作为 `ToolExecutionExceptionProcessor` 的自动配置实现注册。  
默认情况下：

- `RuntimeException` 的错误消息会发回 model
- 检查型异常和错误（例如 `IOException`、`OutOfMemoryError`）总是直接抛出

`DefaultToolExecutionExceptionProcessor` 构造函数允许你通过 `alwaysThrow` 参数控制行为：  
如果设为 `true`，会抛出异常，而不是把错误消息发回 model。

```java
@Bean
ToolExecutionExceptionProcessor toolExecutionExceptionProcessor() {
  return new DefaultToolExecutionExceptionProcessor(true);
}
```

你还可以通过下面这个配置项控制默认行为：

| 属性 | 描述 | 默认值 |
| --- | --- | --- |
| `spring.ai.tools.throw-exception-on-error` | 如果为 `true`，tool calling 错误会作为异常抛出给调用方处理；如果为 `false`，错误会转换为消息发回 AI model，由 model 继续处理并响应错误。 | `false` |

> NOTE:
> 如果你实现了自己的 `ToolCallback`，要确保在 `call()` 方法内部发生 tool 执行错误时，抛出的是 `ToolExecutionException`。

`ToolExecutionExceptionProcessor` 由默认的 `ToolCallingManager`（`DefaultToolCallingManager`）在 tool 执行期间内部使用。

## Tool 解析

向 model 传递 tools 的主要方式，是在调用 `ChatClient` 或 `ChatModel` 时直接提供 `ToolCallback`。  
不过，Spring AI 也支持通过 `ToolCallbackResolver` 在运行时动态解析 tools。

```java
public interface ToolCallbackResolver {

  /**
   * Resolve the {@link ToolCallback} for the given tool name.
   */
  @Nullable
  ToolCallback resolve(String toolName);

}
```

使用这种方式时：

- 在客户端，你传给 `ChatClient` 或 `ChatModel` 的是 tool 名称，而不是 `ToolCallback`
- 在服务端，由 `ToolCallbackResolver` 的实现把 tool 名称解析成真正的 `ToolCallback` 实例

默认情况下，Spring AI 使用 `DelegatingToolCallbackResolver`，把 tool 解析委托给一个 `ToolCallbackResolver` 列表。  
其中常见的两类解析器是：

- `SpringBeanToolCallbackResolver`：从类型为 `Function`、`Supplier`、`Consumer` 或 `BiFunction` 的 Spring Bean 中解析 tools
- `StaticToolCallbackResolver`：从静态 `ToolCallback` 列表中解析 tools。使用 Spring Boot 自动配置时，应用上下文里所有 `ToolCallback` Bean 都会被它自动纳入

如果你依赖 Spring Boot 自动配置，也可以自己提供一个 `ToolCallbackResolver` Bean 来覆盖默认解析逻辑：

```java
@Bean
ToolCallbackResolver toolCallbackResolver(List<ToolCallback> toolCallbacks) {
  StaticToolCallbackResolver staticToolCallbackResolver = new StaticToolCallbackResolver(toolCallbacks);
  return new DelegatingToolCallbackResolver(List.of(staticToolCallbackResolver));
}
```

`ToolCallbackResolver` 会被 `ToolCallingManager` 在运行时内部使用，既支持框架控制的 Tool 执行，也支持用户控制的 Tool 执行。

## 可观测性

Tool calling 提供了可观测性支持，会通过 `spring.ai.tool` 观察项记录执行耗时并传播链路追踪信息。

另外，Spring AI 还支持把 tool call 的参数和结果导出为 span 属性。  
不过这类数据通常比较敏感，所以默认是关闭的。

### 日志记录

Tool calling 的主要操作都会在 `DEBUG` 级别记录。  
如果你想看到这些日志，可以把 `org.springframework.ai` 包的日志级别调整到 `DEBUG`。

### 自定义工具属性

默认情况下，工具名称来自函数名。  
如果你希望工具名更清晰，可以显式覆盖它：

```java
ToolCallback searchTool = FunctionToolCallback
  .builder("web_search", new SearchFunction())  // 自定义名称
  .description("Search the web for information")
  .inputType(String.class)
  .build();

System.out.println(searchTool.getName());  // web_search
// 推荐：使用 ToolDefinition 提取名称
System.out.println(searchTool.getToolDefinition().name());  // web_search
```

同样地，你也可以覆盖自动生成的工具描述，给 model 提供更明确的使用指引：

```java
ToolCallback calculatorTool = FunctionToolCallback
  .builder("calculator", new CalculatorFunction())
  .description("Performs arithmetic calculations. Use this for any math problems.")
  .inputType(String.class)
  .build();
```

### 高级模式定义

当输入结构比较复杂时，更推荐直接使用 Java 类或 JSON Schema 来定义输入。  
最常见的做法是使用 Java `record`：

```java
import org.springframework.ai.tool.annotation.ToolParam;

public record WeatherInput(
  @ToolParam(description = "City name or coordinates") String location,
  @ToolParam(description = "Temperature unit preference") Unit units,
  @ToolParam(description = "Include 5-day forecast") boolean includeForecast
) {}

public enum Unit { CELSIUS, FAHRENHEIT }

public class WeatherFunction implements Function<WeatherInput, String> {
  @Override
  public String apply(WeatherInput input) {
      double temp = input.units() == Unit.CELSIUS ? 22 : 72;
      String result = String.format(
          "Current weather in %s: %.0f degrees %s",
          input.location(),
          temp,
          input.units().toString().substring(0, 1).toUpperCase()
      );

      if (input.includeForecast()) {
          result += "\nNext 5 days: Sunny";
      }

      return result;
  }
}

ToolCallback weatherTool = FunctionToolCallback
  .builder("get_weather", new WeatherFunction())
  .description("Get current weather and optional forecast")
  .inputType(WeatherInput.class)
  .build();
```

## 访问上下文

为什么这部分重要？  
因为当工具可以访问 Agent 的状态、运行时上下文和长期记忆时，工具才真正具备上下文感知能力，能够做更稳定的决策、做个性化响应，并跨对话保留信息。

工具可以通过 `ToolContext` 访问运行时信息，其中通常包括：

- `State`：执行过程中流动的可变数据，例如消息、计数器或自定义字段
- `Context`：不可变上下文，例如用户 ID、会话信息或应用级配置
- `Store`：跨对话的持久长期记忆
- `Config`：当前执行使用的 `RunnableConfig`
- `Tool Call ID`：当前这次工具调用的唯一标识

### ToolContext

只要把 `ToolContext` 放进工具签名里，框架就会在运行时自动注入它，而且不会暴露给 LLM。

```java
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.function.FunctionToolCallback;
import org.springframework.ai.chat.messages.Message;
import java.util.function.BiFunction;
import java.util.List;
import java.util.Map;

public class ConversationSummaryTool implements BiFunction<String, ToolContext, String> {

  @Override
  public String apply(String input, ToolContext toolContext) {
      OverAllState state = (OverAllState) toolContext.getContext().get("state");
      RunnableConfig config = (RunnableConfig) toolContext.getContext().get("config");
      // update to extraState will be returned to the Agent loop.
      Map<String, Object> extraState = (Map<String, Object>) toolContext.getContext().get("extraState");

      List<Message> messages = (List<Message>) state.get("messages", new ArrayList<>());

      if (messages == null) {
          return "No conversation history available";
      }

      long userMsgs = messages.stream()
          .filter(m -> m.getMessageType().getValue().equals("user"))
          .count();
      long aiMsgs = messages.stream()
          .filter(m -> m.getMessageType().getValue().equals("assistant"))
          .count();
      long toolMsgs = messages.stream()
          .filter(m -> m.getMessageType().getValue().equals("tool"))
          .count();

      return String.format(
          "Conversation has %d user messages, %d AI responses, and %d tool results",
          userMsgs, aiMsgs, toolMsgs
      );
  }
}

ToolCallback summaryTool = FunctionToolCallback
  .builder("summarize_conversation", new ConversationSummaryTool())
  .description("Summarize the conversation so far")
  .inputType(String.class)
  .build();
```

> WARNING:
> `toolContext` 参数对 model 是隐藏的。
> 也就是说，model 在 tool schema 里只能看到显式输入参数，看不到运行时注入的 `ToolContext`。

工具不只能读取状态，也可以更新状态。  
在 Spring AI Alibaba 里，更新通常通过 Hook 或工具执行后返回的信息来完成。

```java
// 在 Hook 中更新状态
import com.alibaba.cloud.ai.graph.agent.hook.ModelHook;
import com.alibaba.cloud.ai.graph.agent.hook.HookPosition;
import com.alibaba.cloud.ai.graph.OverAllState;
import com.alibaba.cloud.ai.graph.RunnableConfig;
import java.util.concurrent.CompletableFuture;

public class UpdateStateHook extends ModelHook {

  @Override
  public String getName() {
      return "update_state";
  }

  @Override
  public HookPosition[] getHookPositions() {
      return new HookPosition[]{HookPosition.AFTER_MODEL};
  }

  @Override
  public CompletableFuture<Map<String, Object>> afterModel(OverAllState state, RunnableConfig config) {
      return CompletableFuture.completedFuture(Map.of(
          "user_name", "Alice",
          "last_updated", System.currentTimeMillis()
      ));
  }
}
```

### Context（上下文）

通过 `ToolContext`，你也可以访问不可变的上下文数据，例如用户 ID、会话详情或应用配置。

```java
import org.springframework.ai.chat.model.ToolContext;
import java.util.function.BiFunction;
import java.util.Map;

public class AccountInfoTool implements BiFunction<String, ToolContext, String> {

  private static final Map<String, Map<String, Object>> USER_DATABASE = Map.of(
      "user123", Map.of(
          "name", "Alice Johnson",
          "account_type", "Premium",
          "balance", 5000,
          "email", "alice@example.com"
      ),
      "user456", Map.of(
          "name", "Bob Smith",
          "account_type", "Standard",
          "balance", 1200,
          "email", "bob@example.com"
      )
  );

  @Override
  public String apply(String query, ToolContext toolContext) {
      // 在 agent 调用时设置 user_id，在工具中可以拿到参数
      // RunnableConfig config = RunnableConfig.builder().addMetadata("user_id", "1");
      // agent.call("", config);
      RunnableConfig config = (RunnableConfig) toolContext.getContext().get("config");
      String userId = (String) config.metadata("user_id").orElse(null);

      if (userId == null) {
          return "User ID not provided";
      }

      Map<String, Object> user = USER_DATABASE.get(userId);
      if (user != null) {
          return String.format(
              "Account holder: %s\nType: %s\nBalance: $%d",
              user.get("name"),
              user.get("account_type"),
              user.get("balance")
          );
      }

      return "User not found";
  }
}

ToolCallback accountTool = FunctionToolCallback
  .builder("get_account_info", new AccountInfoTool())
  .description("Get the current user's account information")
  .inputType(String.class)
  .build();

ReactAgent agent = ReactAgent.builder()
  .name("financial_assistant")
  .model(chatModel)
  .tools(accountTool)
  .systemPrompt("You are a financial assistant.")
  .build();

RunnableConfig config = RunnableConfig.builder().addMetadata("user_id", "1");
agent.call("question", config);
```

### Memory（存储）

如果你希望工具访问跨对话持久化的数据，可以通过存储来实现长期记忆。  
在 Spring AI Alibaba 中，这通常通过 checkpointer 完成。

```java
import com.alibaba.cloud.ai.graph.checkpoint.savers.RedisSaver;

// 配置持久化存储
RedisSaver redisSaver = new RedisSaver(redissonClient);

// 创建带有持久化记忆的 Agent
ReactAgent agent = ReactAgent.builder()
  .name("my_agent")
  .model(chatModel)
  .tools(saveUserInfoTool, getUserInfoTool)
  .saver(redisSaver)
  .build();

// 第一个会话：保存用户信息
RunnableConfig config1 = RunnableConfig.builder()
  .threadId("session_1")
  .build();

agent.call("Save user: userid: abc123, name: Foo, age: 25, email: foo@example.com", config1);

// 第二个会话：获取用户信息
RunnableConfig config2 = RunnableConfig.builder()
  .threadId("session_2")
  .build();

agent.call("Get user info for user with id 'abc123'", config2);
// 输出：Here is the user info for user with ID "abc123":
// - Name: Foo
// - Age: 25
// - Email: foo@example.com
```

## 内置工具

## 在 ReactAgent 中使用工具

`ReactAgent` 提供了多种方式来提供和使用工具。  
不同场景下，适合的接入方式也不同。

### 工具提供方式

最直接的方式，是通过 `tools()` 直接传入 `ToolCallback` 实例。  
它适合工具数量较少、定义明确的场景。

```java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.function.FunctionToolCallback;

ToolCallback weatherTool = FunctionToolCallback
  .builder("get_weather", new WeatherFunction())
  .description("Get weather for a given city")
  .inputType(WeatherInput.class)
  .build();

ToolCallback searchTool = FunctionToolCallback
  .builder("search", new SearchFunction())
  .description("Search for information")
  .inputType(String.class)
  .build();

ReactAgent agent = ReactAgent.builder()
  .name("my_agent")
  .model(chatModel)
  .tools(weatherTool, searchTool)
  .systemPrompt("You are a helpful assistant with access to weather and search tools.")
  .saver(new MemorySaver())
  .build();
```

适合：

- 工具数量较少（通常少于 5 个）
- 工具定义在编译期已知
- 需要类型安全的工具定义

使用 `methodTools()` 时，可以直接传入带有 `@Tool` 注解方法的对象。  
这种方式让工具定义更紧凑，也更适合把工具逻辑按类组织。

```java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;

public class CalculatorTools {
  @Tool(description = "Add two numbers together")
  public String add(
          @ToolParam(description = "First number") int a,
          @ToolParam(description = "Second number") int b) {
      return String.valueOf(a + b);
  }

  @Tool(description = "Multiply two numbers together")
  public String multiply(
          @ToolParam(description = "First number") int a,
          @ToolParam(description = "Second number") int b) {
      return String.valueOf(a * b);
  }
}

CalculatorTools calculatorTools = new CalculatorTools();

ReactAgent agent = ReactAgent.builder()
  .name("calculator_agent")
  .model(chatModel)
  .description("An agent that can perform calculations")
  .instruction("You are a helpful calculator assistant.")
  .methodTools(calculatorTools)
  .saver(new MemorySaver())
  .build();
```

适合：

- 工具逻辑按类组织
- 需要把相关工具放在同一个对象里
- 工具本身需要访问类成员

如果工具需要根据运行时条件动态提供，或者来自外部系统，可以使用 `toolCallbackProviders()`。

```java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.function.FunctionToolCallback;
import java.util.List;

public class CustomToolCallbackProvider implements ToolCallbackProvider {
  private final List<ToolCallback> toolCallbacks;

  public CustomToolCallbackProvider(List<ToolCallback> toolCallbacks) {
      this.toolCallbacks = toolCallbacks;
  }

  @Override
  public ToolCallback[] getToolCallbacks() {
      return toolCallbacks.toArray(new ToolCallback[0]);
  }
}

ToolCallback searchTool = FunctionToolCallback.builder("search", new SearchToolWithContext())
  .description("Search for information")
  .inputType(String.class)
  .build();

ToolCallbackProvider toolProvider = new CustomToolCallbackProvider(List.of(searchTool));

ReactAgent agent = ReactAgent.builder()
  .name("search_agent")
  .model(chatModel)
  .description("An agent that can search for information")
  .instruction("You are a helpful assistant with search capabilities.")
  .toolCallbackProviders(toolProvider)
  .saver(new MemorySaver())
  .build();
```

适合：

- 需要根据运行时条件动态提供工具
- 工具来自外部系统或配置中心
- 需要动态加载和卸载工具

如果你希望把工具定义和工具使用分离开，可以使用 `toolNames()` 搭配 `resolver()`。

```java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.function.FunctionToolCallback;
import org.springframework.ai.tool.resolution.StaticToolCallbackResolver;
import java.util.List;

ToolCallback searchTool = FunctionToolCallback.builder("search", new SearchFunctionWithRequest())
  .description("Search for information")
  .inputType(SearchRequest.class)
  .build();

ToolCallback calculatorTool = FunctionToolCallback.builder("calculator", new CalculatorFunctionWithRequest())
  .description("Perform arithmetic calculations")
  .inputType(CalculatorRequest.class)
  .build();

StaticToolCallbackResolver resolver = new StaticToolCallbackResolver(
  List.of(calculatorTool, searchTool));

ReactAgent agent = ReactAgent.builder()
  .name("multi_tool_agent")
  .model(chatModel)
  .description("An agent with multiple tools")
  .instruction("You are a helpful assistant with access to calculator and search tools.")
  .toolNames("calculator", "search")
  .resolver(resolver)
  .saver(new MemorySaver())
  .build();
```

> NOTE:
> `toolNames()` 不能单独使用，必须和 `resolver()` 配合。
> 否则框架无法根据工具名解析出真正的工具实现。

适合：

- 工具定义和工具使用分离
- 需要从配置或外部系统读取工具名称
- 工具可能动态变化，但名称保持稳定

你也可以直接通过 `resolver()` 提供 `ToolCallbackResolver`。  
解析器既可以配合 `toolNames()` 使用，也可以单独用于工具节点解析。

```java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.function.FunctionToolCallback;
import org.springframework.ai.tool.resolution.StaticToolCallbackResolver;
import java.util.List;

ToolCallback calculatorTool = FunctionToolCallback.builder("calculator", new CalculatorFunctionWithContext())
  .description("Perform arithmetic calculations")
  .inputType(String.class)
  .build();

StaticToolCallbackResolver resolver = new StaticToolCallbackResolver(
  List.of(calculatorTool));

ReactAgent agent = ReactAgent.builder()
  .name("resolver_agent")
  .model(chatModel)
  .description("An agent using ToolCallbackResolver")
  .instruction("You are a helpful calculator assistant.")
  .tools(calculatorTool)
  .resolver(resolver)
  .saver(new MemorySaver())
  .build();
```

适合：

- 需要自定义工具解析逻辑
- 工具来自多个来源，需要统一管理
- 需要动态查找和加载工具

最后，`ReactAgent` 允许你组合使用多种工具提供方式。

```java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.function.FunctionToolCallback;
import java.util.List;

CalculatorTools calculatorTools = new CalculatorTools();

ToolCallback searchTool = FunctionToolCallback.builder("search", new SearchToolWithContext())
  .description("Search for information")
  .inputType(String.class)
  .build();

ToolCallbackProvider toolProvider = new CustomToolCallbackProvider(List.of(searchTool));

ReactAgent agent = ReactAgent.builder()
  .name("combined_tool_agent")
  .model(chatModel)
  .description("An agent with multiple tool provision methods")
  .instruction("You are a helpful assistant with calculator and search capabilities.")
  .methodTools(calculatorTools)
  .toolCallbackProviders(toolProvider)
  .tools(searchTool)
  .saver(new MemorySaver())
  .build();
```

适合：

- 工具来自不同来源
- 需要灵活组合不同类型的工具
- 需要逐步迁移或扩展现有工具集

### 选择建议

根据需求不同，可以按下面这个表来选：

| 方式 | 适用场景 | 优点 | 缺点 |
| --- | --- | --- | --- |
| `tools()` | 工具数量少、定义明确 | 简单直接、类型安全 | 工具多时代码会变长 |
| `methodTools()` | 工具逻辑组织在类中 | 代码组织清晰、易维护 | 需要创建工具类 |
| `toolCallbackProviders()` | 动态提供工具 | 灵活，支持运行时决策 | 需要实现接口 |
| `toolNames() + resolver()` | 工具定义和使用分离 | 解耦，支持配置化 | 必须配合 resolver |
| `resolver()` | 自定义解析逻辑 | 高度灵活 | 需要自己实现解析器 |
| 组合使用 | 复杂场景 | 灵活性最高 | 复杂度也更高 |

### 基础使用示例

在 `ReactAgent` 中使用工具的基础方式如下：

```java
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.function.FunctionToolCallback;

ToolCallback weatherTool = FunctionToolCallback
  .builder("get_weather", new WeatherFunction())
  .description("Get weather for a given city")
  .inputType(String.class)
  .build();

ToolCallback searchTool = FunctionToolCallback
  .builder("search", new SearchFunction())
  .description("Search for information")
  .inputType(String.class)
  .build();

ReactAgent agent = ReactAgent.builder()
  .name("my_agent")
  .model(chatModel)
  .tools(weatherTool, searchTool)
  .systemPrompt("You are a helpful assistant with access to weather and search tools.")
  .saver(new MemorySaver())
  .build();

AssistantMessage response = agent.call("What's the weather like in San Francisco?");
System.out.println(response.getText());
```

### React Agent 远程 MCP 工具调用示例

在实际的 React Agent 项目里，很多时候接入的不是本地工具，而是第三方平台或其他应用提供的 MCP 工具。  
这类工具通常不需要你自己手写定义，而是通过 MCP Client 去接入远端 MCP Server 提供的能力。

在开始之前，需要先引入依赖：

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-starter-mcp-client</artifactId>
    </dependency>
</dependencies>
```

还需要在配置文件里补充 MCP 相关配置：

```yaml
spring:
  ai:
    mcp: # 结合 Spring AI 使用 MCP 的必须配置
      client:
        enabled: true # 启用 Spring AI MCP Client
        name: saa-mcp-client
        toolcallback:
          enabled: true
        type: async
        streamable-http: # 定义 streamableHttp 的 MCP 工具
          connections:
            amap-maps:
              url: ${MODEL_SCOPE_AMAP_BASE_URL} # 从魔搭社区获取调用 url，移除尾部 endpoint
              endpoint: mcp
        sse: # 定义基于 sse 的 MCP 工具
          connections:
            12306-mcp:
              url: ${MODEL_SCOPE_12306_BASE_URL} # 从魔搭社区获取调用 url，移除尾部 endpoint
              sse-endpoint: sse
```

完成配置后，就可以在 `ReactAgent` 中直接使用这些远端 MCP 工具。

### 1. 基于 Spring Boot 的自动发现构建 MCP Client 为 React Agent 提供工具

```java
import com.alibaba.cloud.ai.dashscope.api.DashScopeApi;
import com.alibaba.cloud.ai.dashscope.chat.DashScopeChatModel;
import com.alibaba.cloud.ai.graph.NodeOutput;
import com.alibaba.cloud.ai.graph.RunnableConfig;
import com.alibaba.cloud.ai.graph.agent.Builder;
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import com.alibaba.cloud.ai.graph.checkpoint.savers.MemorySaver;
import com.alibaba.cloud.ai.graph.exception.GraphRunnerException;
import com.alibaba.cloud.ai.graph.streaming.StreamingOutput;
import com.alibaba.fastjson2.JSON;
import org.jspecify.annotations.NonNull;
import org.springframework.ai.chat.messages.ToolResponseMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class RemoteMcpToolsExample {

  @Autowired
  private final ToolCallbackProvider toolCallbackProvider;

  public RemoteMcpToolsExample(ToolCallbackProvider toolCallbackProvider) {this.toolCallbackProvider = toolCallbackProvider;}

  /**
   * 示例 17：基于 Spring Boot 使用远端 MCP 工具 -- React Agent
   */
  public void remoteMcpToolsReactWithSpringBootExample() throws GraphRunnerException {
      DashScopeApi dashScopeApi = DashScopeApi.builder().apiKey(System.getenv("AI_DASHSCOPE_API_KEY")).build();
      DashScopeChatModel chatModel = DashScopeChatModel.builder().dashScopeApi(dashScopeApi).build();

      //Get Tools From Spring AI ToolCallbackProvider which the tools config in application.yml
      ToolCallback[] toolCallbacks = toolCallbackProvider.getToolCallbacks();
      System.out.printf("""
                      ==============================Find the tools from spring ToolCallbackProvider==============================
                      %s
                      """,
              JSON.toJSONString(toolCallbacks));
      //Run React Agent With MCP Tools
      Builder builder = ReactAgent.builder()
              .name("travel_planning_assistant")
              .model(chatModel)
              .description("Your Travel Assistant")
              .instruction("You are a helpful assistant with travel route planning and train ticket search.")
              .saver(new MemorySaver());

      //==============================Add Tools==============================
      //set the ToolCallbackProvider
      builder.toolCallbackProviders(toolCallbackProvider);
      //you can also get the ToolCallback[],do some filter or choose that which you want to use in this React Agent Session
      //builder.tools(toolCallbacks);
      //==============================Add Tools==============================

      ReactAgent agent = builder.build();

      RunnableConfig config = RunnableConfig.builder()
              .threadId("travel_planning_session")
              .build();

      //stream
      Flux<NodeOutput> stream = agent.stream("""
              I plan to travel from Shanghai to Beijing tomorrow.
              1. Please check at which stations I can alight (i.e., the available arrival/drop-off stations) for my journey.
              2. Please check the available train numbers and their departure times.
              3. Please also check Beijing’s weather forecast for tomorrow.
              """, config);
      StringBuffer answerString = new StringBuffer();
      stream.doOnNext(output -> {
                  if (output.node().equals("_AGENT_MODEL_")) {
                      answerString.append(((StreamingOutput<?>) output).message().getText());
                  }
                  else if (output.node().equals("_AGENT_TOOL_")) {
                      answerString.append("\nTool Call:").append(((ToolResponseMessage) ((StreamingOutput<?>) output).message()).getResponses().get(0)).append("\n");
                  }
              })
              .doOnComplete(() -> System.out.println(answerString))
              .doOnError(e -> System.err.println("Stream Processing Error: " + e.getMessage()))
              .blockLast();
  }
}
```

如果项目不依赖 Spring Boot，你也可以自己构建 MCP 客户端，把远端 MCP 工具转成 `ToolCallback` 后交给 `ReactAgent`。

### 2. 使用 MCP SDK 为 React Agent 提供工具

```java
import com.alibaba.cloud.ai.dashscope.api.DashScopeApi;
import com.alibaba.cloud.ai.dashscope.chat.DashScopeChatModel;
import com.alibaba.cloud.ai.graph.NodeOutput;
import com.alibaba.cloud.ai.graph.RunnableConfig;
import com.alibaba.cloud.ai.graph.agent.Builder;
import com.alibaba.cloud.ai.graph.agent.ReactAgent;
import com.alibaba.cloud.ai.graph.checkpoint.savers.MemorySaver;
import com.alibaba.cloud.ai.graph.exception.GraphRunnerException;
import com.alibaba.cloud.ai.graph.streaming.StreamingOutput;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.modelcontextprotocol.client.McpClient;
import io.modelcontextprotocol.client.McpSyncClient;
import io.modelcontextprotocol.client.transport.HttpClientSseClientTransport;
import io.modelcontextprotocol.client.transport.HttpClientStreamableHttpTransport;
import io.modelcontextprotocol.json.jackson.JacksonMcpJsonMapper;
import io.modelcontextprotocol.spec.McpClientTransport;
import io.modelcontextprotocol.spec.McpSchema;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.messages.ToolResponseMessage;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.function.FunctionToolCallback;
import reactor.core.publisher.Flux;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class RemoteMcpToolsExample {
  private static final Logger log = LoggerFactory.getLogger(RemoteMcpToolsExample.class);

  /**
   * 示例 18：解耦 Spring Boot 使用远端 MCP 工具 -- React Agent
   */
  public void remoteMcpToolsReactWithoutSpringBootExample() throws GraphRunnerException {
      DashScopeApi dashScopeApi = DashScopeApi.builder().apiKey(System.getenv("AI_DASHSCOPE_API_KEY")).build();

      DashScopeChatModel chatModel = DashScopeChatModel.builder().dashScopeApi(dashScopeApi).build();

      String modelScope12306BaseUrlSse = System.getenv("MODEL_SCOPE_12306_BASE_URL");
      String modelScopeAmapBaseUrlSse = System.getenv("MODEL_SCOPE_AMAP_BASE_URL");

      HttpClient.Builder httpBuilder = HttpClient.newBuilder()
              .version(HttpClient.Version.HTTP_1_1)
              .connectTimeout(Duration.ofSeconds(60));

      List<ToolCallback> toolCallbacks = new ArrayList<>();
      List<McpSyncClient> clientsToClose = new ArrayList<>();

      try {
          List<ToolCallback> tools12306 = fetchMcpTools(modelScope12306BaseUrlSse, "sse", httpBuilder, clientsToClose, "12306", false);
          toolCallbacks.addAll(tools12306);

          List<ToolCallback> toolsAmap = fetchMcpTools(modelScopeAmapBaseUrlSse, "mcp", httpBuilder, clientsToClose, "amap", true);
          toolCallbacks.addAll(toolsAmap);

          System.out.printf("""
                          ==============================Find the tools from MCP Servers==============================
                          Found %d Tools From MCP Servers
                          """,
                  toolCallbacks.size());

          Builder builder = ReactAgent.builder().name("travel_planning_assistant").model(chatModel).description("Your Travel Assistant").instruction("You are a helpful assistant with travel route planning, train ticket search, and map services.").saver(new MemorySaver());
          builder.tools(toolCallbacks);

          ReactAgent agent = builder.build();

          RunnableConfig config = RunnableConfig.builder()
                  .threadId("travel_planning_session_no_spring")
                  .build();

          Flux<NodeOutput> stream = agent.stream("""
                  I plan to travel from Shanghai to Beijing tomorrow.
                  1. Please check at which stations I can alight (i.e., the available arrival/drop-off stations) for my journey.
                  2. Please check the available train numbers and their departure times.
                  3. Please also check Beijing's weather forecast for tomorrow.
                  4. Please help me find the route from Beijing South Station to Tiananmen Square.
                  """, config);
          StringBuffer answerString = new StringBuffer();
          stream.doOnNext(output -> {
                      if (output.node().equals("_AGENT_MODEL_")) {
                          answerString.append(((StreamingOutput<?>) output).message().getText());
                      }
                      else if (output.node().equals("_AGENT_TOOL_")) {
                          answerString.append("\nTool Call:").append(((ToolResponseMessage) ((StreamingOutput<?>) output).message()).getResponses().get(0)).append("\n");
                      }
                  })
                  .doOnComplete(() -> System.out.println(answerString))
                  .doOnError(e -> System.err.println("Stream Processing Error: " + e.getMessage()))
                  .blockLast();
      } catch (Exception e) {
          log.error("execute MCP Agent error", e);
      } finally {
          for (McpSyncClient client : clientsToClose) {
              try {
                  if (client != null) {
                      client.close();
                      log.info("MCP Client Is Closed");
                  }
              } catch (Exception e) {
                  log.warn("Close MCP Client Error", e);
              }
          }
      }
  }

  private List<ToolCallback> fetchMcpTools(String baseUrl,String endpoint,HttpClient.Builder httpBuilder,
          List<McpSyncClient> clientsToClose,String serverName,boolean isStreamable) {

      List<ToolCallback> toolCallbacks = new ArrayList<>();
      McpSyncClient mcpClient;

      try {
          //...... build mcp client ......

          for (McpSchema.Tool mcpTool : mcpTools) {
              log.info("[{}] Register MCP Tool: name={}, description={}",
                      serverName, mcpTool.name(), mcpTool.description());
              ToolCallback toolCallback = createToolCallback(mcpTool, mcpClient, serverName);
              toolCallbacks.add(toolCallback);
          }
      } catch (Exception e) {
          log.error("[{}] Fetch MCP Tools Error", serverName, e);
      }
      return toolCallbacks;
  }

  private ToolCallback createToolCallback(McpSchema.Tool mcpTool, McpSyncClient mcpClient, String serverName) {
      return FunctionToolCallback.builder(
                      mcpTool.name(),
                      (Map<String, Object> functionInput) -> {
                          //...... the true mcp call ......
                      })
              .description(mcpTool.description())
              .inputType(Map.class)
              .build();
  }
}
```

同样的 MCP 工具也不一定只能给 `ReactAgent`，你也可以把它们交给 `ChatClient` 使用。

### 3. 为 ChatClient 提供 MCP 工具

```java
import com.alibaba.cloud.ai.dashscope.api.DashScopeApi;
import com.alibaba.cloud.ai.dashscope.chat.DashScopeChatModel;
import com.alibaba.fastjson2.JSON;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RemoteMcpToolsExample {

  private static final Logger log = LoggerFactory.getLogger(RemoteMcpToolsExample.class);
  @Autowired
  private final ToolCallbackProvider toolCallbackProvider;

  public RemoteMcpToolsExample(ToolCallbackProvider toolCallbackProvider) {this.toolCallbackProvider = toolCallbackProvider;}

  /**
   * 示例 19：基于 Spring Boot 使用远端 MCP 工具 -- Only ChatClient
   */
  public void remoteMcpToolsWithChatCliAndSpringBootExample() {
      DashScopeApi dashScopeApi = DashScopeApi.builder().apiKey(System.getenv("AI_DASHSCOPE_API_KEY")).build();
      DashScopeChatModel chatModel = DashScopeChatModel.builder().dashScopeApi(dashScopeApi).build();
      ChatClient chatClient = ChatClient.builder(chatModel).build();
      //Get Tools From Spring AI ToolCallbackProvider which the tools config in application.yml
      ToolCallback[] toolCallbacks = toolCallbackProvider.getToolCallbacks();
      System.out.printf("""
                      ==============================Find the tools from spring ToolCallbackProvider==============================
                      %s
                      """,
              JSON.toJSONString(toolCallbacks));
      ChatClient.ChatClientRequestSpec doChat =
              chatClient.prompt("You are a helpful assistant with travel route planning and train ticket search.")
                      .user("""
                              I plan to travel from Shanghai to Beijing tomorrow.
                              1. Please check at which stations I can alight (i.e., the available arrival/drop-off stations) for my journey.
                              2. Please check the available train numbers and their departure times.
                              3. Please also check Beijing’s weather forecast for tomorrow.
                              """)
                      .toolCallbacks(toolCallbackProvider);
      //check the logs from DefaultToolCallingManager
      String text = doChat.call().chatResponse().getResult().getOutput().getText();
      System.out.println(text);
  }
}
```

## 相关资源

- [Agents 文档](https://java2ai.com/docs/frameworks/agent-framework/tutorials/agents)：了解如何在 Agent 中使用工具
- [Messages 文档](https://java2ai.com/docs/frameworks/agent-framework/tutorials/messages)：了解工具消息类型
- [Models 文档](https://java2ai.com/docs/frameworks/agent-framework/tutorials/models)：了解模型如何调用工具

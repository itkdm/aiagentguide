---
title: Spring AI Alibaba 前置条件
description: 开始使用 Spring AI Alibaba 之前需要准备的基础环境、依赖和 API Key。
summary: 本文整理 Spring AI Alibaba 的前置条件，包括环境要求、最小依赖准备和 API Key 配置方式。
keywords:
  - Spring AI Alibaba
  - 前置条件
  - 环境准备
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
author: AI Agent Guide
draft: false
noindex: false
---

# Spring AI Alibaba 前置条件

在开始编写 Spring AI Alibaba 示例之前，建议先完成最基础的环境和依赖准备。

## 环境要求

开始之前，建议至少准备下面这些基础环境：

- JDK 17 或更高版本
- Maven 3.8 或更高版本
- Spring Boot `3.5.x` 项目
- 一个可用的大模型提供商 API Key

如果你想进一步了解 Spring AI Alibaba、Spring AI、Spring Boot 之间的版本对应关系，可以继续阅读[版本说明](/frameworks/spring-ai-alibaba/get-started/versions)。

## 最小依赖准备

如果你的目标是先跑通一个最小的 Spring AI Alibaba Agent 示例，通常至少需要这两个依赖：

- `spring-ai-alibaba-agent-framework`
- `spring-ai-alibaba-starter-dashscope`

示例写法如下：

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

其中：

- `spring-ai-alibaba-agent-framework` 负责 Agent Framework 本身
- `spring-ai-alibaba-starter-dashscope` 负责接入 DashScope 模型

如果你准备使用其他模型提供方，则应根据 Spring AI 或 Spring AI Alibaba 的模型接入文档替换对应 starter。

## 配置 API Key

在运行示例之前，还需要准备模型提供方的 API Key。  
如果你使用 DashScope，常见配置项是：

```yaml
spring.ai.dashscope.api-key
```

更推荐的做法是通过环境变量注入，而不是把密钥直接写在配置文件里。

例如，可以先在环境中设置：

```bash
export AI_DASHSCOPE_API_KEY=your_api_key_here
```

然后在 `application.yml` 中引用它：

```yaml
spring:
  ai:
    dashscope:
      api-key: ${AI_DASHSCOPE_API_KEY}
```

这种方式的好处是：

- 本地开发更方便切换密钥
- 不容易把敏感信息误提交到仓库
- 更符合生产环境中的配置分离习惯

如果只是临时验证功能，也可以直接在配置文件中写 `spring.ai.dashscope.api-key`，但不建议在正式项目里长期这样做。

## 开始前的自检清单

在进入“快速开始”之前，你可以先快速自查一遍：

- 本机已经安装 JDK 17+
- Maven 版本不低于 3.8
- 项目使用的是 Spring Boot `3.5.x`
- 已经选定模型提供商
- 已经拿到对应 API Key
- 已经把依赖和配置项加进工程

如果这些条件都满足，下一步就可以开始编写并运行第一个 Spring AI Alibaba 示例了。

## 参考链接

- 官方快速开始：[https://java2ai.com/docs/quick-start/](https://java2ai.com/docs/quick-start/)
- Agent Framework 版本列表：[https://mvnrepository.com/artifact/com.alibaba.cloud.ai/spring-ai-alibaba-agent-framework/versions](https://mvnrepository.com/artifact/com.alibaba.cloud.ai/spring-ai-alibaba-agent-framework/versions)
- DashScope Starter 版本列表：[https://mvnrepository.com/artifact/com.alibaba.cloud.ai/spring-ai-alibaba-starter-dashscope](https://mvnrepository.com/artifact/com.alibaba.cloud.ai/spring-ai-alibaba-starter-dashscope)

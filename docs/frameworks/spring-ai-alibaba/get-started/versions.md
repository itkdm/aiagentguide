---
title: Spring AI Alibaba 版本说明
description: 说明 Spring AI Alibaba、Spring AI、Spring Boot 之间的版本对应关系，以及版本选择时的基本建议。
summary: 本文整理 Spring AI Alibaba 的版本说明信息，帮助你理解推荐版本组合、查看最新版入口，以及遇到版本不一致时该如何判断。
keywords:
  - Spring AI Alibaba
  - 版本说明
  - Spring Boot
  - Spring AI
  - BOM
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

# Spring AI Alibaba 版本说明

当你只是想快速跑通一个示例时，通常只需要照着官方快速开始页给出的依赖组合使用即可。  
但一旦你准备把 Spring AI Alibaba 接入已有项目，或者准备升级 Spring Boot、Spring AI、模型 starter，就需要认真看版本对应关系。

## 默认参考哪里

默认情况下，版本选择优先参考 Spring AI Alibaba 官方版本说明页：

- 官方版本说明页：[https://java2ai.com/docs/versions/](https://java2ai.com/docs/versions/)

如果你只是想查看某个依赖最近发布了哪些版本，也可以再看 Maven Repository：

- Agent Framework 版本列表：[https://mvnrepository.com/artifact/com.alibaba.cloud.ai/spring-ai-alibaba-agent-framework/versions](https://mvnrepository.com/artifact/com.alibaba.cloud.ai/spring-ai-alibaba-agent-framework/versions)
- DashScope Starter 版本列表：[https://mvnrepository.com/artifact/com.alibaba.cloud.ai/spring-ai-alibaba-starter-dashscope](https://mvnrepository.com/artifact/com.alibaba.cloud.ai/spring-ai-alibaba-starter-dashscope)

如果官方版本说明页和 Maven Repository 展示的信息让你感觉“不完全同步”，优先以官方版本说明页为准。

## 当前推荐的版本组合

根据 Spring AI Alibaba 官方版本说明页，当前推荐组合包括：

- Spring AI Alibaba `1.1.2.0`
- Spring AI `1.1.2`
- Spring AI Extensions `1.1.2.1` 或 `1.1.2.0`
- Spring Boot `3.5.x`

对于新项目来说，这通常是最省心的一条路线。  
如果你不是在维护历史项目，优先按这组版本开始，通常会比自己拼版本更稳妥。

## 为什么不要只看单个依赖的最新版本

很多人第一次接触这类项目时，容易直接去 Maven Repository 看“最新版本”，然后把所有依赖都升到最新。这个做法不一定安全，因为：

- `spring-ai-alibaba-agent-framework` 和 `spring-ai-alibaba-starter-dashscope` 只是你看到的两个模块
- 它们背后还依赖 Spring AI、Spring AI Extensions、Spring Boot 等上游组件
- 单个模块有新版本，不代表整套组合已经适合你当前项目

所以这里真正要看的不是“某个依赖是不是最新”，而是“这组依赖组合是不是官方推荐、彼此是否匹配”。

## 什么时候需要特别关注版本问题

下面这些情况通常都意味着你应该先看版本说明，再动手升级：

- 你的项目已经在用旧版 Spring Boot
- 你准备从旧版 SAA 升级到新版本
- 你准备切换模型 starter
- 你发现官方文档示例中的版本和 Maven Repository 页面不一致
- 你在升级后遇到了依赖冲突或启动失败

这时最稳妥的做法不是继续猜版本，而是回到官方版本说明页，重新确认对应关系。

## BOM 为什么重要

在真实项目中，更推荐使用 BOM 统一管理版本，而不是在每个依赖上单独写版本号。  
原因很简单：BOM 的核心价值就是把一组已经验证过的版本组合固定下来，减少你手工拼装依赖时出现的错配问题。

如果你后续准备把 Spring AI Alibaba 长期接入到业务项目里，建议尽早切换到 BOM 管理方式。

## 给读者的实用建议

如果你是第一次接触 Spring AI Alibaba，可以按下面的顺序判断：

1. 先按官方快速开始页跑通一个最小示例
2. 再看官方版本说明页，理解推荐版本组合
3. 如果项目是新建的，尽量直接采用官方推荐组合
4. 如果项目是旧项目，优先保持 Spring Boot 与 SAA 的兼容关系，再谈升级

这样做的好处是，你不会一开始就陷入版本细节，也不会在真正需要升级时完全没有判断依据。

## 参考链接

- 官方快速开始：[https://java2ai.com/docs/quick-start/](https://java2ai.com/docs/quick-start/)
- 官方版本说明：[https://java2ai.com/docs/versions/](https://java2ai.com/docs/versions/)
- Spring AI Alibaba 官方站点：[https://java2ai.com/](https://java2ai.com/)
- Spring AI Alibaba GitHub 仓库：[https://github.com/alibaba/spring-ai-alibaba](https://github.com/alibaba/spring-ai-alibaba)

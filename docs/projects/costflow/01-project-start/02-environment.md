---
title: "准备本地开发环境：把 CostFlow 需要的基础依赖配齐"
description: "准备 CostFlow 本地开发所需的 JDK、Maven、Node、数据库和 Redis 等基础依赖。"
summary: "先把 CostFlow 和 RuoYi Vue Pro 运行所需的本地开发环境准备好。"
keywords:
  - CostFlow 开发环境
  - Java 开发环境
  - RuoYi Vue Pro 环境
tags:
  - CostFlow
  - 开发环境
  - Java
author: 布吉岛
lastUpdated: 2026-09-13
status: draft
assets: none
reviewed: false
sourceType: original
draft: true
noindex: true
---

# 准备本地开发环境：把 CostFlow 需要的基础依赖配齐

上一篇我们已经把 RuoYi Vue Pro 的前后端代码导入了 CostFlow。

接下来我们需要把 CostFlow 运行所需的本地开发环境准备好。

CostFlow 当前使用的后端基线是 RuoYi Vue Pro `master-jdk17`。在我们固定的 Commit 中，项目明确使用 **Java 17**，对应 Spring Boot 版本为 **3.5.15**。因此后面的教程统一按照 **JDK 17** 开发。JDK 8 无法满足 Spring Boot 3.5 的最低要求；JDK 25 则可能存在兼容性差异，不建议作为本教程的默认环境。

Maven 能够正常构建当前项目即可。这里推荐使用 **Maven 3.9.x**。

数据库使用 **MySQL 8.x** 即可。

Redis 使用 **Redis 6.x** 或者较新的 Redis 7.x 都可以，没有必要为了跟教程保持完全一致而特意降级。

前端需要稍微注意一下版本。准备环境时更推荐直接使用 **Node.js 24 LTS**；已有 Node.js 22 LTS 的环境也没有必要更换。pnpm 推荐使用 **10.x**，不需要为了教程追求某个完全相同的小版本。

简单整理一下：

| 环境 | 建议版本 |
| --- | --- |
| JDK | **17** |
| Maven | **3.9.x** |
| MySQL | **8.x** |
| Redis | **6.x / 7.x** |
| Node.js | **24 LTS**，Node.js 22 LTS 也可以 |
| pnpm | **10.x** |

这里尤其需要注意的就是 **JDK 17**。其他几项只要处于相近的正常版本范围并且能够正常使用，就没有必要重新折腾开发环境。

## 交给 Coding Agent

如果不确定当前环境是否合适，可以直接让本地 Coding Agent 检查一遍。

<CodingAgentPrompt title="检查 CostFlow 本地开发环境">

请检查当前电脑是否已经具备运行 CostFlow 的本地开发环境，不要修改项目代码，也不要安装或升级任何软件。

CostFlow 当前环境参考：

- JDK：17
- Maven：推荐 3.9.x
- MySQL：8.x
- Redis：6.x 或 7.x
- Node.js：推荐 24 LTS，22 LTS 也可以；项目最低要求 >= 20.19.0
- pnpm：推荐 10.x；项目最低要求 >= 8.6.0

请实际执行必要的版本或连接检查，并告诉我：

1. 当前检测到的各项版本；
2. 是否满足 CostFlow 开发需要；
3. 缺少或明显不合适的环境；
4. 如果存在问题，给出简短的处理建议。

只检查环境，不初始化数据库，不安装项目依赖，不修改配置文件，也不要启动前后端项目。

</CodingAgentPrompt>

## 下一步

开发环境确认没有问题以后，代码和运行环境就都准备好了。

下一篇我们开始真正运行这套工程：

> **第一次启动 RuoYi Vue Pro：跑通后端和管理端**

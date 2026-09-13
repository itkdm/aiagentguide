---
title: "开启 RuoYi Vue Pro 的 AI 模块：让现有 AI 功能真正运行起来"
description: "了解 RuoYi Vue Pro AI 模块的默认状态、依赖和配置，完成现有 AI 功能的本地启动。"
summary: "在跑通原项目之后，继续开启 AI 模块并处理相关依赖、SQL 和配置问题。"
keywords:
  - RuoYi Vue Pro AI 模块
  - AI 模块配置
  - CostFlow AI
tags:
  - CostFlow
  - AI 模块
  - RuoYi Vue Pro
author: 布吉岛
lastUpdated: 2026-09-13
status: draft
assets: none
reviewed: false
sourceType: original
draft: true
noindex: true
---

# 开启 RuoYi Vue Pro 的 AI 模块：让现有 AI 功能真正运行起来

上一篇我们已经把 RuoYi Vue Pro 的整体结构过了一遍。现在应该已经知道：

```text
yudao-server
    │
    ├── yudao-module-system
    ├── yudao-module-infra
    └── yudao-module-ai
```

这些模块并不是只要源码目录存在，就一定会跟着项目一起运行。当前 `yudao-module-ai` 的源码已经在后端仓库里，但它默认没有真正接进当前工程。

接下来我们就开始实现：

```text
AI 模块参与 Maven 构建
        ↓
yudao-server 引入 AI 模块
        ↓
AI 所需数据库结构准备完成
        ↓
后端可以正常启动
        ↓
AI 管理端页面和接口已经可以访问
```

## 把 AI 模块接入后端

### 开启根项目中的 yudao-module-ai

打开 `backend/pom.xml`，找到：

```xml
<!-- 请参考 https://doc.iocoder.cn/ai/build/ 文档，完成 AI 模块的启动！！！ -->
<!--        <module>yudao-module-ai</module>-->
```

取消注释：

```xml
<module>yudao-module-ai</module>
```

这一步解决的是 AI 模块参与整个 Maven 工程构建的问题。

### 在 yudao-server 中引入 AI 模块

继续打开 `backend/yudao-server/pom.xml`，找到已经预留的依赖：

```xml
<!-- AI 大模型相关模块。默认注释，保证编译速度 -->
<!--
<dependency>
    <groupId>cn.iocoder.boot</groupId>
    <artifactId>yudao-module-ai</artifactId>
    <version>${revision}</version>
</dependency>
-->
```

同样取消注释：

```xml
<dependency>
    <groupId>cn.iocoder.boot</groupId>
    <artifactId>yudao-module-ai</artifactId>
    <version>${revision}</version>
</dependency>
```

现在两层关系都建立起来了：

```text
根 pom.xml
    ↓
让 Maven 构建 yudao-module-ai

yudao-server/pom.xml
    ↓
让最终 Spring Boot 应用加载 yudao-module-ai
```

这两个地方作用不同，不要只改其中一个。

### 重新加载 Maven 依赖

修改两个 `pom.xml` 以后，重新刷新 Maven 项目。第一次开启 AI 模块时，通常会开始下载 Spring AI、OpenAI、DeepSeek、Anthropic、Ollama、DashScope、向量存储、Tika、MCP 等新的依赖，第一次 Maven Reload 可能明显变慢。

如果遇到依赖下载失败，优先检查 Maven 仓库、网络、镜像配置和依赖是否完整下载，不要急着修改 AI 模块源码。

## 补齐 AI 模块的数据库结构

上一篇初始化原项目时使用的是 `backend/sql/mysql/ruoyi-vue-pro.sql`。但在当前固定版本中，`backend/sql/mysql/` 只有 `quartz.sql` 和 `ruoyi-vue-pro.sql`，并没有单独提供 `ai.sql`。

AI 模块本身明显需要自己的数据库表，例如源码中的 `ai_model`、`ai_api_key`、`ai_tool`、`ai_chat_conversation`、`ai_write` 等数据对象对应的表。如果只取消 Maven 注释就启动，后续查询这些表时自然会出现数据库异常。

### 如何处理缺失的 AI SQL

如果已经从上游项目的官方渠道获得了与当前版本匹配的 AI SQL，可以按照上游项目的许可和使用说明处理，不要从不明来源下载或分发数据库脚本。

如果只是学习，也可以让 AI 根据当前代码辅助生成 SQL 初稿。但 DO、Mapper 和配置代码不一定包含完整的索引、默认值、初始化数据和数据库约束，因此生成结果必须再与当前版本的代码、官方来源或实际数据库逐项核对，不能直接当作官方 SQL 使用。

### 把新增 SQL 放进 CostFlow/sql

`backend/sql/` 继续属于 RuoYi Vue Pro 上游，不往里面追加 CostFlow 自己维护的内容。AI 模块为当前开发基线补充出来的 SQL，统一放到根目录：

```text
CostFlow/sql/
```

例如：

```text
sql/
└── 001_ai_module.sql
```

原则保持为：

```text
backend/sql/
→ 上游原始 SQL

sql/
→ CostFlow 自己补充和新增的 SQL
```

## 启动 AI 模块

### 重新启动 yudao-server

完成 Maven 模块开启、`yudao-server` 引入以及 AI 数据库结构补齐以后，重新启动 `YudaoServerApplication`。这一轮 Spring Boot 会真正开始扫描 `cn.iocoder.yudao.module.ai` 下的 Controller、Service、Mapper 和相关配置。

后端仍然应该运行在：

```text
http://localhost:48080
```

### 处理启动时的依赖问题

第一次加载 AI 模块时遇到问题并不奇怪，但不要看到 OpenAI、Qdrant、Milvus、Ollama、MCP 就误以为必须把所有服务都启动。当前配置中部分向量数据库自动配置已经排除，MCP Client / Server 也默认关闭。

这一篇不要提前搭建 Qdrant、Milvus、Ollama、MCP Server，也不要为了“看起来完整”把所有模型 API Key 都填一遍。当前只关心 AI 模块本身能否随 `yudao-server` 正常启动；如果启动日志仍然出现可选服务相关异常，再根据实际配置判断是否需要处理。

如果遇到异常，可以按照异常类型判断：

```text
表不存在
→ 检查 AI SQL

Bean / Maven 依赖异常
→ 检查模块和依赖

Redis / MySQL 异常
→ 检查基础服务

某个可选 AI 服务异常
→ 先确认这个能力是否真的必须启用
```

### 确认 AI 模块已经加载

后端启动完成以后，检查日志中是否存在 `yudao-module-ai` 相关 Bean 创建失败、Mapper 找不到或数据库表不存在异常。

只要能够看到对应 Controller 暴露的接口，就说明 AI 模块已经真正被 Spring Boot 加载。


## 确认管理端 AI 功能

### 找到现有 AI 页面

前端不需要额外处理，固定的 Vue3 管理端源码里已经存在：

```text
src/views/ai/
```

其中包括 `chat`、`image`、`knowledge`、`mindmap`、`model`、`music`、`workflow`、`write` 等页面。

AI 页面源码本来就在前端仓库里，现在真正缺的是后端模块、数据库、菜单和权限这些运行条件。如果对应菜单初始化完成，重新登录管理后台以后，就应该能够看到 AI 相关入口。

### 确认前后端接口能够访问

进入 AI 管理相关页面，例如模型管理。打开浏览器 Network，确认前端请求能够正常进入：

```text
/admin-api/ai/...
```
模型 API Key、真实模型、聊天响应和 Token Usage 还没有真正验证，我们下一篇再做。

## 交给 Coding Agent

这一篇比较适合直接让本地 Agent 完成，因为最麻烦的部分不是取消两行注释，而是准确识别当前 AI 模块缺哪些数据库结构并实际验证。

<CodingAgentPrompt title="启用并验证 RuoYi Vue Pro AI 模块">

请基于当前 CostFlow 本地仓库，启用并验证 RuoYi Vue Pro 固定版本中已有的 `yudao-module-ai`。

本次任务只处理上游已有 AI 模块，不开发 CostFlow 计费功能，不修改 AI 业务代码。

固定基线：

- 后端仓库：YunaiV/ruoyi-vue-pro
- 分支：master-jdk17
- Commit：8e43004cf68a405cd3485f98f8a539b97ca6544a
- 前端已存在 AI 页面
- 后端目录：`backend/`
- 前端目录：`frontend/`
- `backend/sql/` 属于上游，禁止修改
- 根目录 `sql/` 只保存 CostFlow 自己新增的数据模型 SQL

不要切换分支、更新上游代码、升级依赖，也不要套用 JDK25、Spring AI 2.x 等新版本方案。

## 1. 检查并启用模块

检查：

- `backend/pom.xml`
- `backend/yudao-server/pom.xml`
- `backend/yudao-module-ai/pom.xml`

确认 AI 模块当前状态、Spring AI / Spring AI Alibaba 版本及模块依赖。

然后完成最小修改：

- 在根 `pom.xml` 中启用 `yudao-module-ai`；
- 在 `yudao-server/pom.xml` 中引入该模块；
- 不升级依赖；
- 不修改 Java 业务代码；
- 不修改 `backend/sql/`。

## 2. 根据源码反推数据库结构

请以当前固定 Commit 的源码为主要依据，扫描 AI 模块中的：

- `@TableName` 和 DO 实体；
- 基类、租户、逻辑删除和审计字段；
- Mapper、Service、Controller；
- 字段注解、特殊字段类型、索引和约束；
- 菜单、权限、字典依赖；
- 前端 AI 页面、路由和 API。

给出对应的 SQL 文件，要求所有的 SQL 一定要符合规范，具体规范可参考：`backend/sql/mysql/ruoyi-vue-pro.sql`

请将生成的 SQL 文件保存到 CostFlow 根目录 `sql/001_ai_module.sql`，并导入到数据库。

如果无法确认 SQL 的来源或结构，不要假装初始化已经完成，应明确报告阻塞原因。

## 3. 检查初始化数据

检查上游 SQL 是否已有 AI 相关菜单、权限、字典和字典数据。

已有内容直接复用，不要重复插入。没有明确源码依据的内容不要自行补造。

## 4. 编译、启动和验证

执行：

```bash
mvn -pl yudao-server -am package -DskipTests
```

检查 AI 模块是否成功编译。

如果本地基础服务和配置已准备好，再启动后端，检查：

- AI Controller、Service、Mapper 是否加载；
- 是否存在 Bean、依赖、MySQL、Redis 或缺表错误；
- `/admin-api/ai/...` 接口是否能够到达后端；
- `frontend/src/views/ai/` 页面和路由是否存在；
- 至少一个 AI 管理页面是否可以打开。

不要为了本次任务安装或启动 Qdrant、Milvus、Ollama、MCP Server 等可选服务，也不要配置真实模型 API Key 或执行真实模型请求。

如果页面可以打开但聊天、绘图等模型能力不可用，应说明这是因为尚未配置真实模型，不要误判为模块启用失败。

## 5. 最终报告

请报告：

1. 修改了哪些 Maven 文件；
2. 是否修改 Java 业务代码；
3. 当前 AI 依赖版本；
4. 源码确认的表总数和每张表字段数；
5. 临时 SQL 是否生成和执行；
6. 是否修改 `backend/sql/` 或根目录 `sql/`；
7. Maven 构建和后端启动结果；
8. 已验证的页面和接口；
9. 尚未验证的模型能力；
10. 源码确认项、推断项、未知项和未完成事项。


</CodingAgentPrompt>

## 下一步

现在项目状态已经从：

```text
RuoYi Vue Pro
    ↓
普通后台系统
```

变成了：

```text
RuoYi Vue Pro
    ↓
AI 模块已经运行
    ↓
AI 页面和接口已经打通
```

但现在的 AI 模块还只是“能运行”，还没有真正配置一个模型，也没有完成一次真实请求。

我们下一篇就开始做这件事：

> **接入第一个模型：完成一次真实 AI 对话**

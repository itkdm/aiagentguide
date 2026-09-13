---
title: "认识 RuoYi Vue Pro：项目结构、运行架构与开发规范"
description: "认识 CostFlow 开发基线 RuoYi Vue Pro 的前后端结构、模块划分、运行架构和基本开发规范。"
summary: "在开启 AI 模块之前，先建立 RuoYi Vue Pro 的项目地图，知道后续应该从哪里阅读和修改代码。"
keywords:
  - RuoYi Vue Pro 项目结构
  - Java 项目结构
  - CostFlow 开发基线
tags:
  - CostFlow
  - RuoYi Vue Pro
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

# 认识 RuoYi Vue Pro：项目结构、运行架构与开发规范

RuoYi Vue Pro 本身是一个比较大的工程。第一次打开后端时，会看到 `yudao-framework`、`yudao-server`、`yudao-module-system`、`yudao-module-infra` 等很多目录；

进入具体模块以后，又会看到 `controller`、`service`、`dal`、`api` 等不同分层。

所以，这篇文章我们整体了解一下这个项目，搞清楚后面开发 CostFlow 时需要遵守的结构和规范。

## 先从整体看这套项目

### 前端、后端和基础服务怎么配合

```text
浏览器
   │
   ▼
Vue3 管理端
frontend/
   │
   │ /admin-api
   ▼
yudao-server
backend/
   │
   ├── yudao-module-system
   ├── yudao-module-infra
   ├── yudao-module-ai      ← 目前还没有开启
   └── 其他业务模块
   │
   ▼
MySQL / Redis / 其他基础设施
```

前端和后端是两个独立工程。前端负责页面展示、交互以及调用接口；后端负责权限、业务逻辑、数据库访问等服务端能力。

当前固定的前端本地配置已经把请求地址指向 `http://localhost:48080`，接口前缀为 `/admin-api`。所以前端发起的请求最终都会进入 `yudao-server`，后端再根据不同业务交给对应模块处理。

例如：

```text
用户、角色、菜单
        ↓
yudao-module-system

文件、配置、代码生成
        ↓
yudao-module-infra

模型、聊天、知识库
        ↓
yudao-module-ai
```

注意：

> `yudao-server` 并不是所有业务代码都写在里面。

真正的业务能力主要分散在各个 `yudao-module-*` 模块中，`yudao-server` 是整个后端最终的启动和组装入口，并没有太多的实际业务代码。

## 看懂后端模块

打开 `backend/`，会看到大量 Maven 模块。先不用管商城、CRM、ERP、IoT 等暂时和 CostFlow 没关系的模块。

现在我们主要看下面这几个模块：

| 模块 | 作用 |
| --- | --- |
| `yudao-dependencies` | 统一管理项目依赖版本 |
| `yudao-framework` | 提供整个项目复用的公共能力和 Spring Boot Starter |
| `yudao-server` | 最终启动后端服务 |
| `yudao-module-system` | 用户、角色、权限、菜单、部门等系统能力 |
| `yudao-module-infra` | 文件、配置、日志、代码生成等基础设施能力 |
| `yudao-module-ai` | 模型、聊天、知识库等 AI 相关能力，目前还没有开启 |

根目录的 `pom.xml` 会决定哪些模块参与整个 Maven 工程的构建。当前固定版本中，`system`、`infra` 等基础模块已经开启，而 `yudao-module-ai` 仍然处于注释状态。

### yudao-server 是怎么把项目跑起来的

上一篇运行的是 `YudaoServerApplication`，它位于 `yudao-server/`。但 `yudao-server` 自己其实没有承载多少具体业务，它的 `pom.xml` 通过引入需要的 `yudao-module-xxx` 依赖，把不同业务模块组装到最终运行的 Spring Boot 应用里。

当前默认已经引入：

```xml
<dependency>
    <groupId>cn.iocoder.boot</groupId>
    <artifactId>yudao-module-system</artifactId>
</dependency>

<dependency>
    <groupId>cn.iocoder.boot</groupId>
    <artifactId>yudao-module-infra</artifactId>
</dependency>
```

AI 依赖现在仍然是注释状态：

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

所以可以把 `yudao-server` 理解成一个容器：

```text
yudao-module-system ─┐
                     │
yudao-module-infra ──┼──▶ yudao-server ──▶ Spring Boot
                     │
yudao-module-ai ─────┘
```

哪个业务模块需要真正运行，就需要被整个项目正确地引入进来。下一篇我们就会开启 AI 模块。

### framework、system、infra 分别负责什么

`yudao-framework` 不属于某一个具体业务，而是整个项目的基础能力层。里面可以看到：

```text
yudao-common
yudao-spring-boot-starter-mybatis
yudao-spring-boot-starter-mq
yudao-spring-boot-starter-monitor
yudao-spring-boot-starter-job
yudao-spring-boot-starter-biz-tenant
yudao-spring-boot-starter-biz-data-permission
...
```

以后开发 CostFlow 时，很多原本需要在普通 Spring Boot 项目里重新配置的能力，在这里已经有现成封装。比如租户、日志、权限、Mybatis插件等等。

`yudao-module-system` 属于通用业务模块，主要包含用户、部门、权限、数据字典等系统内置能力，并约定 Controller URL 使用 `/system/` 前缀，数据库表使用 `system_` 前缀，例如：

```text
system_users
system_role
system_menu
```

`yudao-module-infra` 可以理解为业务系统运行所需要的一些基础设施能力，例如配置管理、文件管理、代码生成等。

### 业务模块是怎么接进项目的

下面这个地方比较容易混淆：

```text
模块存在于源码里
```

和：

```text
模块真正参与当前项目运行
```

并不是一回事。比如 `backend/yudao-module-ai/` 目录已经真实存在，但根 `pom.xml` 中的：

```xml
<!-- <module>yudao-module-ai</module> -->
```

仍然没有开启，同时 `yudao-server/pom.xml` 中对 `yudao-module-ai` 的依赖也处于注释状态。

所以当前状态可以表示为：

```text
源码里有 AI 模块
        │
        ✕
没有参与当前 Maven 构建和 Server 组装
        │
        ▼
运行中的系统没有真正加载 AI 模块
```

这就是为什么明明能在源码中看到一整套 AI 代码，上一节却没有直接使用它。下一篇我们会真正处理这个问题。

## 看懂一个业务模块

打开 `yudao-module-system/`，可以看到它内部不是简单地把所有 Java 类放在一起，而是已经按照职责拆开：

```text
api/
controller/
convert/
dal/
enums/
framework/
job/
mq/
service/
...
```

以后进入 `yudao-module-ai` 或创建 CostFlow 自己的模块时，会再次看到相似的组织方式。因此现在先把最常用的部分认清楚。

### Controller、Service 和 DAL

一条普通后台接口，最常见的调用关系仍然是：

```text
Controller
    │
    ▼
Service
    │
    ▼
DAL
    │
    ▼
MySQL
```

`controller` 负责对外提供 HTTP 接口，接收请求参数、调用 Service，再把处理结果返回出去。真正的业务规则不应该大量写在 Controller 里。

`service` 才是主要业务逻辑所在的位置。例如以后 CostFlow 中出现创建计费记录、统计模型用量、根据价格计算费用、查询账户余额等逻辑，更适合由 Service 负责。

`dal` 是数据访问层，主要放数据库相关对象和 Mapper。整体关系可以简单理解成：

```text
HTTP 请求
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Mapper
   │
   ▼
Database
```

这并不是一套完全不同的 Java 开发模式，只是在一个大型项目中把职责和目录划分得更明确。

### DO、VO、Mapper 和 Convert

后面还会频繁看到几个名字：`DO`、`VO`、`Mapper`、`Convert`。

`DO`（Data Object）主要对应数据库中的数据；`Mapper` 负责具体的数据访问。RuoYi Vue Pro 基于 MyBatis Plus，大量常规 CRUD 不需要自己手写传统 XML SQL。

`VO` 主要用于接口层的数据交换。通常不会直接拿数据库 DO 原样暴露给前端，而是定义对应的请求和响应对象，例如：

```text
XxxCreateReqVO
XxxUpdateReqVO
XxxPageReqVO
XxxRespVO
```

`Convert` 用于不同对象之间的转换，例如：

```text
DO
  ↓
RespVO
```

或者：

```text
CreateReqVO
  ↓
DO
```

现阶段先记住：

```text
DO        数据库
VO        接口
Mapper    数据访问
Convert   对象转换
```

### 模块之间怎么调用

除了普通的 Controller → Service 调用，项目里还有一个 `api/` 目录。这个 `api` 不是前端调用的 HTTP API 目录，主要用于模块之间暴露能力。

如果一个业务模块需要获取系统模块中的用户信息，直接跨模块随意引用另一个模块内部的 Service、Mapper，很容易让模块之间耦合越来越重。因此可以先简单理解成：

```text
模块内部
Controller → Service → DAL

模块之间
Module A → Module B API
```

后面如果 CostFlow 需要读取其他模块的数据，不要第一时间直接跨模块访问对方 Mapper，先看看项目有没有已经定义好的 API 边界。

## 看懂管理端结构

后端看完以后，再看 `frontend/src/`。当前前端项目已经包含：

```text
api/
assets/
components/
config/
hooks/
layout/
locales/
plugins/
router/
...
```

对于后面 CostFlow 的开发，最常碰到的其实只有几个位置。

### 页面和接口分别在哪里

`src/views/` 主要放真正的业务页面。以后增加用量记录、价格配置、计费记录、账户、统计页面时，对应页面基本都会从这里开始。

`src/api/` 负责封装前端调用后端的接口，所以大概关系就是：

```text
views
  │
  ▼
api
  │
  ▼
/admin-api/...
  │
  ▼
后端 Controller
```

假如现在在后台看到一个“用户管理”页面，想知道它怎么工作，可以顺着前端页面、前端 api、请求 URL、后端 Controller、Service 一路往后追，比在整个仓库中到处搜索代码效率高很多。

## 后面开发时遵守哪些规则

我们了解这些目录结构，主要是为了后面真正修改代码时不把工程越改越乱。CostFlow 后续会尽量沿用原项目已经形成的规则。

以后真正创建计费模块时，应该让用量、定价、费用、账本等代码有明确的归属。

同样，已经存在的基础能力优先复用：

```text
用户
权限
租户
Redis
MyBatis
异常处理
日志
分页
文件
```

另外，命名尽量继续遵循原项目已经形成的习惯。例如 `system` 模块自身就明确约定接口路径使用 `/system/`，数据库表使用 `system_`。以后 CostFlow 自己也应该形成类似清晰的边界，而不是出现几套前缀混在一起。

具体 CostFlow 模块叫什么、表前缀叫什么、包结构怎么设计，我们后面才继续讨论确定。

后面的开发会遵循一条简单原则：

```text
先理解现有实现
      ↓
能复用就复用
      ↓
需要扩展再扩展
      ↓
最后才考虑替换
```

我们选择 RuoYi Vue Pro 作为开发基线，本来就是为了站在已有工程能力上继续往前开发。如果最后把已有用户、权限、配置、异常、数据库封装全部绕开自己重新写一套，也就失去了选择成熟开源项目作为基础的意义。

## 交给 Coding Agent

如果希望快速熟悉当前代码，也可以把下面这段提示词交给本地 Coding Agent，让它基于当前仓库做一次代码导览。

<CodingAgentPrompt title="带我读懂 RuoYi Vue Pro 原项目">

请基于当前 CostFlow 本地仓库，带我快速读懂我们刚刚跑起来的 RuoYi Vue Pro 项目。

这一次不要修改任何代码，也不要安装依赖或启动新的服务。你的任务是阅读当前仓库，并像一名熟悉这个项目的开发者一样，带我理解它。

请严格以当前本地代码为准，不要只根据你对 RuoYi Vue Pro 的已有知识泛泛介绍。

请按照下面的顺序讲解：

### 1. 先画一张整体运行架构图

先检查当前仓库结构和实际配置，然后用 Mermaid 或清晰的文本图画出当前项目的整体运行关系，至少包括：

- `frontend/`
- Vue3 管理端
- `/admin-api`
- `yudao-server`
- 当前实际启用的业务模块
- MySQL
- Redis

同时把当前源码中已经存在、但还没有真正启用的 `yudao-module-ai` 标出来。

先让我从整体上知道：

“浏览器发出一次请求以后，大概会经过哪些部分。”

不要一开始就钻进具体 Java 类。

### 2. 再带我认识后端顶层模块

从 `backend/` 根目录开始，只讲后面开发 CostFlow 最常用的模块，不要把所有模块逐个念一遍。

重点说明：

- `yudao-dependencies`
- `yudao-framework`
- `yudao-server`
- `yudao-module-system`
- `yudao-module-infra`
- `yudao-module-ai`

对于每个模块，回答三个问题：

1. 它主要负责什么；
2. 它和其他模块是什么关系；
3. 后面开发 CostFlow 时，我们为什么可能会碰到它。

同时实际检查根 `pom.xml` 和 `yudao-server/pom.xml`，告诉我：

- 哪些模块当前参与 Maven 构建；
- 哪些模块当前被 `yudao-server` 引入；
- `yudao-module-ai` 当前为什么还没有真正运行。

### 3. 选一个真实业务模块带我往里面走

优先选择 `yudao-module-system`，不要一次分析整个后端。

从这个模块中找真实代码，带我认识：

- `controller`
- `service`
- `dal`
- `api`
- `convert`
- `enums`

重点不是解释 Java 基础知识，而是让我知道：

“以后我要找一个功能，应该先去哪个目录。”

请结合当前真实文件举例，不要只给抽象定义。

### 4. 追一条真实请求链

从当前已经能够正常运行的后台功能中，选择一个比较简单的功能，例如用户、角色、菜单或其他基础功能。

从前端开始，一路追踪：

前端页面
→ 前端 API
→ 请求地址
→ 后端 Controller
→ Service
→ Mapper / DAL
→ 数据库表

请把实际文件路径和关键类名列出来。

这一部分的目标是让我掌握以后自己读代码的方法，而不是把这个功能的所有源码逐行解释一遍。

### 5. 再看前端结构

进入 `frontend/src/`，重点说明：

- `views`
- `api`
- `components`
- `router`
- `store`
- `permission.ts`

告诉我：

- 页面通常在哪里；
- 接口通常在哪里；
- 一个后台功能的前端页面和后端接口是怎么对应起来的；
- 菜单、路由和权限大概是什么关系。

仍然只讲常用部分，不要把整个前端目录逐项解释。

### 6. 最后总结后续开发需要遵守的项目习惯

根据当前真实代码，总结一份简短的“开发导航”，例如：

- 新增后端业务通常从哪里开始；
- Controller、Service、DAL 分别放什么；
- DO、VO、Mapper、Convert 分别解决什么问题；
- 模块之间调用时应该优先看哪里；
- 新增前端页面时通常会涉及哪些目录；
- 已有基础能力应该优先复用哪些现有模块。

不要提前为 CostFlow 设计新的模块、数据库表或业务架构。我们现在只是理解原项目。

### 讲解方式

请把这次讲解当成一次“代码导览”，而不是生成一份项目说明书。

要求：

- 先整体，后局部；
- 先运行链路，再目录结构；
- 尽量引用当前仓库里的真实文件路径和类名；
- 每介绍一个目录，都说明“为什么后面会用到”；
- 不要一次输出大量无关模块；
- 遇到复杂实现先停在职责层，不要深入源码细节；
- 如果发现当前实际代码和常见 RuoYi Vue Pro 资料不一致，以当前本地代码为准。

最后请给我一张简洁的项目导航图，方便我以后快速判断：

“我要找一个功能，应该先去哪里看。”

</CodingAgentPrompt>

## 下一步

现在我们已经不只是把项目跑起来了，也知道了后面应该从哪里开始看代码。可以把目前的认识压缩成一张图：

```text
frontend
│
├── views        页面
├── api          接口
└── router       路由
        │
        ▼
   /admin-api
        │
        ▼
yudao-server     最终启动和组装
        │
        ├── yudao-module-system
        ├── yudao-module-infra
        ├── yudao-module-ai
        └── ...
                │
                ▼
        Controller
                ↓
            Service
                ↓
              DAL
                ↓
        MySQL / Redis
```

其中 `system` 和 `infra` 已经参与当前项目运行，而 `yudao-module-ai` 虽然源码已经存在，却还没有真正接入当前运行的后端。

接下来我们就开始第一次修改原项目，把 AI 模块真正组装到这套系统：

> **开启 RuoYi Vue Pro 的 AI 模块：让现有 AI 功能真正运行起来。**

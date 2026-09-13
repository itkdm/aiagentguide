---
title: "第一次启动 RuoYi Vue Pro：跑通后端和管理端"
description: "完成 RuoYi Vue Pro 数据库初始化、配置修改和前后端启动，第一次登录现有系统。"
summary: "初始化项目依赖，启动 RuoYi Vue Pro 后端和 Vue 管理端，并确认系统可以正常登录。"
keywords:
  - RuoYi Vue Pro 启动
  - Java 项目启动
  - Vue 管理端
tags:
  - CostFlow
  - RuoYi Vue Pro
  - 项目启动
author: 布吉岛
lastUpdated: 2026-09-13
status: draft
assets: none
reviewed: false
sourceType: original
draft: true
noindex: true
---

# 第一次启动 RuoYi Vue Pro：跑通后端和管理端

前两篇已经把 CostFlow 的代码基线和本地开发环境准备好了。

这一篇我们的目标很简单：**先确认作为开发基线的 RuoYi Vue Pro 本身能够正常运行。**

只有这个基础链路没有问题，后面开启 AI 模块、接入模型以及继续开发 CostFlow 时，出现问题才更容易定位。

## 初始化原项目数据库

### 创建 ruoyi-vue-pro 数据库

RuoYi Vue Pro 本身已经提供了完整的初始化 SQL。

先在本地 MySQL 中创建一个数据库：

```sql
CREATE DATABASE `ruoyi-vue-pro`
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

数据库名称建议直接保持为：

```text
ruoyi-vue-pro
```

因为我们当前版本的本地配置默认也是连接这个数据库。

### 导入 RuoYi Vue Pro 初始化 SQL

RuoYi Vue Pro 原项目的初始化 SQL：

```text
backend/sql/mysql/ruoyi-vue-pro.sql
```

不要把这份文件复制到 CostFlow 根目录的 `sql/`，后面也不会直接在这份上游 SQL 上继续追加 CostFlow 表。

这份 SQL 本身包含系统、基础设施等当前原项目启动需要的表和初始化数据。

使用 Navicat 或者其他数据库工具，把 `backend/sql/mysql/ruoyi-vue-pro.sql` 完整导入刚刚创建的 `ruoyi-vue-pro` 数据库即可。

例如使用 MySQL 命令行时，可以执行：

```bash
mysql -u root -p ruoyi-vue-pro < backend/sql/mysql/ruoyi-vue-pro.sql
```

如果平时使用 Navicat、DataGrip、DBeaver 等工具，直接执行这份 SQL 文件也可以。

导入完成以后简单看一下数据库，能够看到诸如下面这些表，就说明基础数据库已经初始化完成：

```text
system_users
system_role
system_menu
infra_config
infra_api_access_log
...
```

## 修改本地配置

后端默认已经启用了：

```yaml
spring:
  profiles:
    active: local
```

因此本地启动时主要使用：

```text
backend/yudao-server/src/main/resources/application-local.yaml
```

目前需要确认的主要就是两个外部依赖：MySQL 和 Redis。其他模块的配置暂时不要随意调整。

### 配置 MySQL 连接

打开 `backend/yudao-server/src/main/resources/application-local.yaml`，找到数据源配置。当前代码默认类似：

```yaml
spring:
  datasource:
    dynamic:
      primary: master
      datasource:
        master:
          url: jdbc:mysql://127.0.0.1:3306/ruoyi-vue-pro?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&nullCatalogMeansCurrent=true&rewriteBatchedStatements=true
          username: root
          password: 123456

        slave:
          lazy: true
          url: jdbc:mysql://127.0.0.1:3306/ruoyi-vue-pro?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&rewriteBatchedStatements=true&nullCatalogMeansCurrent=true
          username: root
          password: 123456
```

修改数据库地址、端口、数据库名称、用户名和密码为你本地 MySQL 的配置。

`slave` 当前开启了懒加载，而且默认同样指向本地这一个数据库。现阶段并不需要真正搭建主从数据库，保持它和 `master` 使用同一套本地连接即可。

### 配置 Redis 连接

继续在 `application-local.yaml` 中找到 Redis：

```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      database: 0
```

根据本地环境修改 Redis 地址、端口、数据库名称、用户名和密码。

## 启动后端项目

### 启动 yudao-server

RuoYi Vue Pro 后端是一个 Maven 多模块单体项目，Spring Boot 启动入口位于：

```text
backend/
└── yudao-server/
    └── src/main/java/
        └── cn/iocoder/yudao/server/
            └── YudaoServerApplication.java
```

对应启动类就是 `YudaoServerApplication`。使用 IDEA 打开 `backend/`，等待 Maven 依赖加载完成以后，直接运行这个启动类即可。

第一次启动需要下载 Maven 依赖，时间可能稍长一些，这是正常的。

当前 `local` 配置下后端监听 `48080` 端口，也就是：

```text
http://localhost:48080
```

如果启动失败，优先检查这些基础问题：

- JDK 是否为 17；
- MySQL 是否已经启动，数据库是否已经导入；
- MySQL 用户名和密码是否正确；
- Redis 是否已经启动；
- 48080 是否被其他程序占用。

当前阶段尽量不要直接修改代码。

### 确认后端正常运行

启动完成以后，先看控制台。只要 Spring Boot 已经正常启动，并且没有因为数据库、Redis 或端口问题退出，就说明后端已经运行起来。

也可以直接访问：

```text
http://localhost:48080/actuator/health
```

当前本地配置已经开放 Actuator 端点，正常情况下应该能够看到：

```json
{
  "status": "UP"
}
```

## 启动管理端

### 安装前端依赖

进入 `frontend/`，安装依赖：

```bash
pnpm install
```

如果第一次安装时间比较长，让 pnpm 正常完成即可，不要因为几条普通 warning 就随意修改依赖版本。

安装结束以后，会生成：

```text
frontend/node_modules/
```

### 启动 Vue3 管理端

安装完成后执行：

```bash
pnpm dev
```

本地环境配置 `.env.local` 已经默认把后端地址指向：

```text
http://localhost:48080
```

接口前缀则是：

```text
/admin-api
```

所以前后端本身已经能够按照默认配置连接起来，不需要另外修改 API 地址。请求关系实际上就是：

```text
Vue3 管理端
      ↓
http://localhost:48080/admin-api
      ↓
yudao-server
```

前端基础配置中当前 `VITE_PORT=80`，因此默认开发地址通常是：

```text
http://localhost
```

如果 80 端口已经被 Nginx 或其他程序使用，再把 `VITE_PORT=80` 调整成一个空闲端口，例如：

```env
VITE_PORT=3000
```

这只是本地开发端口，不影响后面的 CostFlow 实现。

### 登录后台

打开管理端以后，应该能够看到 RuoYi Vue Pro 原本的登录页面。固定的前端配置中已经给出了默认登录信息。

初始化数据库中同样存在 `admin` 管理员账号。

登录成功以后，可以随便打开几个基础页面，实际了解一下这个项目到底是什么样子。理解清楚业务以后，我们后续看代码才会更加容易理解。

另外，不要因为看到后台还有大量商城、工作流、CRM 等模块，就开始清理模块，报错的原因就是我们没有开启这些模块，暂时不用管，只要确保一些基础设施没有问题即可。

## 交给 Coding Agent

如果已经在使用本地 Coding Agent，请直接让它完成。

<CodingAgentPrompt title="跑通 RuoYi Vue Pro 原项目">

请帮我把当前 CostFlow 中导入的 RuoYi Vue Pro 原项目完整跑通。

当前目录约定：

- `backend/`：RuoYi Vue Pro 后端
- `frontend/`：Vue3 管理端

请完成：

1. 确认 MySQL 和 Redis 可用。
2. 创建 `ruoyi-vue-pro` 数据库，并使用 `backend/sql/mysql/ruoyi-vue-pro.sql` 初始化原项目数据库；如果数据库已经正确初始化，不要重复破坏现有数据。
3. 检查 `backend/yudao-server/src/main/resources/application-local.yaml`，根据当前本地环境配置 MySQL 和 Redis 连接。
4. 启动 `YudaoServerApplication`，确认后端 `48080` 端口正常工作。
5. 在 `frontend/` 安装 pnpm 依赖并执行 `pnpm dev`。
6. 确认管理端能够访问，并使用默认的账户完成登录。
7. 实际检查至少一个管理端页面的 `/admin-api` 请求能够正常返回。

本次只负责跑通原始 RuoYi Vue Pro，不要进行其他无关修改，如果遇到错误，应直接说明问题，同样不要直接修改代码。

如果本地数据库、Redis 的账号密码等信息无法自动确定，先检查现有项目配置和本地环境；仍然无法确定时再告诉我需要补充什么，不要自行猜测密码。

完成后给我一份简洁报告，包括：

- 数据库是否初始化成功
- 后端是否正常启动
- 前端是否正常启动
- 登录是否成功
- 前后端请求是否正常
- 为了本地启动实际修改了哪些配置
- 是否还有异常或未完成事项

</CodingAgentPrompt>

## 下一步

现在已经确认：

```text
RuoYi Vue Pro
前端 ✓
后端 ✓
MySQL ✓
Redis ✓
登录 ✓
```

接下来才轮到这个项目真正和 AI 产生关系。

下一篇先认识作为开发基线的 RuoYi Vue Pro 原项目，了解它的模块划分、启动结构和后续阅读源码的切入点。

再下一篇才会开启当前默认关闭的 `yudao-module-ai`，补齐它真正运行需要的依赖、配置和数据库结构。

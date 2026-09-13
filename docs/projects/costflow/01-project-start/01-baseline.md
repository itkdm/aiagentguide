---
title: "确定开发基线：拉取 RuoYi Vue Pro 并准备 CostFlow 分支"
description: "确定 CostFlow 基于哪个 RuoYi Vue Pro 版本开发，并准备后续项目使用的代码分支。"
summary: "固定开发基线，拉取 RuoYi Vue Pro，并为 CostFlow 准备独立开发分支。"
keywords:
  - RuoYi Vue Pro 开发基线
  - CostFlow 分支
  - Java 项目开发
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

# 搭好 CostFlow 的代码起点：导入 RuoYi Vue Pro 前后端

从这一篇开始，我们正式动手搭建 CostFlow。

不过在开始写 CostFlow 代码之前，还有一件很重要的事情：**先把我们的代码起点固定下来。**

RuoYi Vue Pro 的前端和后端分别维护在两个仓库里，而且上游还在持续更新。如果当前我们拉取最新代码并以这个为基线，那么未来上游更新时，我们再拉取最新代码，可能就会出现很多变化，甚至可能 AI 模块都没有了。

所以这一篇我们先完成三件事：

```text
固定前后端版本
      ↓
整理成一个 CostFlow 仓库
      ↓
建立属于 CostFlow 自己的 Git 历史
```

这一篇不会修改业务代码，也不会启动项目。我们先把起点搭好，下一篇再准备真正的开发环境。

## 先确定上游代码基线

### 后端使用哪个版本

这次选择：

后端使用 GitHub 上的 [RuoYi Vue Pro](https://github.com/YunaiV/ruoyi-vue-pro)，分支为 `master-jdk17`。

这一分支当前使用 Java 17、Spring Boot 3.5 系列，其中 `yudao-module-ai` 也已经包含在源码中，并使用 Spring AI 1.1.x。

这里没有选择更新的 `master-jdk25`。因为 jdk25 可能太新了，导致出现一些第三方库不兼容的问题。

最终固定到：

```text
8e43004cf68a405cd3485f98f8a539b97ca6544a
```

### 前端使用哪个版本

前端使用 GitHub 上的 [RuoYi Vue Pro Vue3 管理后台](https://github.com/yudaocode/yudao-ui-admin-vue3)，分支为 `master`。

代码固定到：

```text
aab14fb0e74720dd09e964ae066f8bbde9f9012e
```

完整上游基线如下：

| 部分 | 上游仓库 | 分支 | Commit |
| --- | --- | --- | --- |
| 后端 | `YunaiV/ruoyi-vue-pro` | `master-jdk17` | `8e43004cf68a405cd3485f98f8a539b97ca6544a` |
| 前端 | `yudaocode/yudao-ui-admin-vue3` | `master` | `aab14fb0e74720dd09e964ae066f8bbde9f9012e` |

### 为什么要记录 Commit

分支会变化。今天执行：

```bash
git clone -b master-jdk17 https://github.com/YunaiV/ruoyi-vue-pro.git backend
```

拿到的是今天的代码；一个月后执行同样的命令，`master-jdk17` 很可能已经多了几十个 Commit。

```text
分支名称相同
≠
拿到的代码永远相同
```

一个 Git Commit 对应的是确定的一份代码状态。只要记录准确的 Commit，以后无论上游怎么更新，都可以回到同一个代码起点。

### 后续上游更新怎么处理

固定 Commit 并不意味着 CostFlow 从此和 RuoYi Vue Pro 完全断开，只是不会自动跟随上游变化。后面如果上游出现重要 Bug 修复、安全修复、AI 模块的重要变化，或者我们确实需要的新能力，再评估是否同步对应修改。

> **上游更新是我们主动选择是否吸收，而不是自动跟随。**

## 创建 CostFlow 项目目录

### 规划第一版目录结构

第一版目录先保持简单：

```text
CostFlow/
├── backend/
├── frontend/
├── sql/
├── docs/
├── README.md
└── UPSTREAM.md
```

还有一些 `deploy/`、`docker/`、`scripts/`、`packages/` 等目录，后面真正需要时再增加。

### backend 和 frontend 分别放什么

`backend/` 保存 RuoYi Vue Pro 后端基线，`frontend/` 保存 Vue3 管理端。两者都先完整导入，暂时不要删除模块、修改包名、修改项目名称、开启 AI 模块或修改数据库配置。

我们当前最重要的是先保存一份**干净的上游基线**。

### SQL、文档等内容以后放在哪里

CostFlow 后面自己新增的 SQL 统一放到根目录：

```text
CostFlow/sql/
```

RuoYi Vue Pro 原有 SQL 属于上游项目，后续不再向里面添加 CostFlow 自己的数据库脚本。`docs/` 用于存放设计记录、架构说明等项目内部文档。

::: tip
Git 本身不会记录空文件夹。如果希望 `sql/` 和 `docs/` 出现在远程仓库，可以暂时放一个 `.gitkeep`，等目录真正出现文件以后再删除。
:::

## 导入 RuoYi Vue Pro 后端

### 拉取并固定后端源码

进入 `CostFlow/`，执行：

```bash
git clone -b master-jdk17 https://github.com/YunaiV/ruoyi-vue-pro.git backend
git -C backend checkout 8e43004cf68a405cd3485f98f8a539b97ca6544a
git -C backend rev-parse HEAD
git -C backend status
```

正常情况下，`rev-parse HEAD` 应该输出：

```text
8e43004cf68a405cd3485f98f8a539b97ca6544a
```

如果出现 detached HEAD，不用紧张。这里的目标是固定一个代码快照，而不是继续在上游 Git 仓库中开发。

### 移除原仓库 Git 信息

确认 Commit 无误之后，删除 `backend/.git`：

```bash
rm -rf backend/.git
```

Windows PowerShell：

```powershell
Remove-Item -Recurse -Force backend/.git
```

这里只删除 Git 元数据，不删除 `.gitignore`、`.gitattributes`、`LICENSE` 等普通文件。

## 导入 Vue 管理端

### 拉取并固定前端源码

仍然在 CostFlow 根目录执行：

```bash
git clone -b master https://github.com/yudaocode/yudao-ui-admin-vue3.git frontend
git -C frontend checkout aab14fb0e74720dd09e964ae066f8bbde9f9012e
git -C frontend rev-parse HEAD
git -C frontend status
```

确认没有额外修改后，删除 `frontend/.git`：

```bash
rm -rf frontend/.git
```

Windows PowerShell：

```powershell
Remove-Item -Recurse -Force frontend/.git
```

到这里，前端和后端都已经从两个独立的上游 Git 仓库，变成了 CostFlow 工作目录中的普通源码。

## 记录上游来源

### 创建 UPSTREAM.md

根目录增加 `UPSTREAM.md`：

```md
# Upstream

CostFlow 基于 RuoYi Vue Pro 进行二次开发。

## Backend

- Repository: https://github.com/YunaiV/ruoyi-vue-pro
- Branch: master-jdk17
- Commit: 8e43004cf68a405cd3485f98f8a539b97ca6544a

## Frontend

- Repository: https://github.com/yudaocode/yudao-ui-admin-vue3
- Branch: master
- Commit: aab14fb0e74720dd09e964ae066f8bbde9f9012e
```
## 初始化 CostFlow Git 仓库

确认 `backend/.git` 和 `frontend/.git` 都已经删除以后：

```bash
git init
git branch -M main
git status
git add .
git commit -m "chore: initialize CostFlow from RuoYi Vue Pro"
```

此时整个项目只有 `CostFlow/.git` 这一套 Git 历史。后面一次功能开发可以同时修改 Java、Vue、SQL 和文档，并放在同一个 CostFlow Commit 中。

## 关联远程仓库

在 GitHub 创建一个空的 CostFlow 仓库，然后执行：

```bash
git remote add origin https://github.com/<你的账号>/CostFlow.git
git remote -v
git push -u origin main
```

创建远程仓库时不要自动生成 README、`.gitignore` 或 LICENSE，因为这些内容本地已经开始管理。

## 交给 Coding Agent

如果正在使用 Codex、Claude Code、Cursor Agent 或其他能够直接操作本地项目的 Coding Agent，也可以把这一篇的准备工作交给它完成。

<CodingAgentPrompt title="初始化 CostFlow 项目的代码基线">

请帮我初始化 CostFlow 项目的代码基线。

要求：

1. 后端基于 `YunaiV/ruoyi-vue-pro` 的 `master-jdk17` 分支，固定到 Commit `8e43004cf68a405cd3485f98f8a539b97ca6544a`。
2. 前端基于 `yudaocode/yudao-ui-admin-vue3` 的 `master` 分支，固定到 Commit `aab14fb0e74720dd09e964ae066f8bbde9f9012e`。
3. 将后端放到根目录 `backend/`，前端放到 `frontend/`，移除两者原来的 `.git`，由 CostFlow 根目录统一进行 Git 管理。
4. 根目录保留 `sql/`，以后只用于保存 CostFlow 自己新增的 SQL，不修改 RuoYi Vue Pro 原有 SQL 目录。
5. 创建 `docs/`、`README.md` 和 `UPSTREAM.md`，其中 `UPSTREAM.md` 记录前后端的来源仓库、分支和准确 Commit。
6. 保留上游已有的 LICENSE 等普通文件，不修改业务代码，不删除上游模块。
7. 初始化 CostFlow 根 Git 仓库，并检查目录、Commit 基线和工作区状态。
8. 引导用户创建远程仓库，并推送到远程仓库。

完成后给我一份简洁的执行报告，包括：最终目录结构、前后端实际 Commit、Git 状态，以及是否存在未完成或异常事项。

</CodingAgentPrompt>

## 下一步

现在只是把代码准备好了。后端还没有编译，前端也没有安装依赖，MySQL、Redis 等基础环境同样还没有准备。

下一篇先把 CostFlow 开发需要的本地环境配齐，再尝试真正启动这套前后端项目：

> **准备本地开发环境：把 CostFlow 需要的基础依赖配齐。**

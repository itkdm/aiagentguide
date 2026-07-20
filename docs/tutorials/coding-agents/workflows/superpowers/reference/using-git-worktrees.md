---
title: Using Git Worktrees Git 工作树
description: Superpowers Git Worktree 技能：在开始功能工作前确保有隔离工作区，保护当前分支免受变更影响，支持并行开发多个功能。
summary: Superpowers 原技能翻译：using-git-worktrees。介绍如何检测现有隔离、创建 worktree、项目设置和基线验证的完整流程指南。
keywords:
  - Superpowers
  - Git Worktree
  - 工作区隔离
  - 开发环境
  - 分支管理
  - 并行开发
tags:
  - Superpowers
  - 参考
author: 布吉岛
lastUpdated: 2026-06-26
status: published
assets: none
reviewed: true
sourceType: reference
draft: false
noindex: false
---

# using-git-worktrees

> 本文为 [Superpowers](https://github.com/obra/superpowers/tree/main/skills/using-git-worktrees) 原 skill 文件夹的中文翻译，基于 MIT 协议。原文路径：`skills/using-git-worktrees/`。

---

**Skill 元数据**

| 字段 | 内容 |
|------|------|
| 名称 | using-git-worktrees |
| 描述 | 在开始需要与当前工作区隔离的功能工作时，或在执行实现计划之前使用——通过原生工具或 git worktree 回退方式确保有隔离的工作区 |

---

# 使用 Git Worktree

## 概述

确保工作在隔离的工作区中进行。优先使用你平台的 native worktree 工具。只有在没有 native 工具可用时才回退到手动 git worktree。

**核心原则：** 先检测现有隔离。然后使用 native 工具。然后回退到 git。永远不要与 harness 对抗。

**开始时声明：** "我正在使用 using-git-worktrees skill 来设置隔离工作区。"

## 步骤 0：检测现有隔离

**在创建任何东西之前，检查你是否已经在隔离工作区中。**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**子模块 guard：** `GIT_DIR != GIT_COMMON` 在 git 子模块内部也为真。在得出"已经在 worktree 中"的结论之前，验证你不是在子模块中：

```bash
# 如果返回路径，说明你在子模块中，不是 worktree — 当作普通仓库处理
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**如果 `GIT_DIR != GIT_COMMON`（且不是子模块）：** 你已经在一个链接的 worktree 中。跳到步骤 2（项目设置）。不要创建另一个 worktree。

根据分支状态报告：
- 在分支上："已经在隔离工作区 `<path>`，分支 `<name>`。"
- Detached HEAD："已经在隔离工作区 `<path>`（detached HEAD，外部管理）。在完成时需要创建分支。"

**如果 `GIT_DIR == GIT_COMMON`（或在子模块中）：** 你在普通仓库 checkout 中。

用户是否已经在指令中表明他们的 worktree 偏好？如果没有，在创建 worktree 之前征求同意：

> "你希望我设置一个隔离的 worktree 吗？它可以保护你当前分支免受变更影响。"

遵循任何已声明的偏好，不要询问。如果用户拒绝同意，原地工作并跳到步骤 2。

## 步骤 1：创建隔离工作区

**你有两种机制。按此顺序尝试。**

### 1a. Native Worktree 工具（首选）

用户已要求隔离工作区（步骤 0 同意）。你已经有创建 worktree 的方法了吗？它可能是名为 `EnterWorktree`、`WorktreeCreate` 的工具，或 `/worktree` 命令，或 `--worktree` 标志。如果有，使用它并跳到步骤 2。

Native 工具自动处理目录放置、分支创建和清理。当你有 native 工具时使用 `git worktree add` 会创建你的 harness 看不到也无法管理的幻影状态。

只有在你没有 native worktree 工具可用时才进入步骤 1b。

### 1b. Git Worktree 回退

**仅当步骤 1a 不适用时使用**——你没有可用的 native worktree 工具。使用 git 手动创建 worktree。

#### 目录选择

按此优先级顺序。用户的明确偏好始终优于观察到的文件系统状态。

1. **检查你的指令中是否有声明的 worktree 目录偏好。** 如果用户已经指定了一个，使用它不要询问。

2. **检查是否已存在项目本地的 worktree 目录：**
   ```bash
   ls -d .worktrees 2>/dev/null     # 首选（隐藏）
   ls -d worktrees 2>/dev/null      # 备选
   ```
   如果找到了，使用它。如果两者都存在，`.worktrees` 优先。

3. **如果没有其他指导可用**，默认使用项目根目录的 `.worktrees/`。

#### 安全验证（仅项目本地目录）

**在创建 worktree 之前必须验证目录已被忽略：**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**如果未被忽略：** 添加到 .gitignore，提交变更，然后继续。

**为什么关键：** 防止意外将 worktree 内容提交到仓库。

#### 创建 Worktree

```bash
# 基于选择的位置确定路径
path="$LOCATION/$BRANCH_NAME"

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**沙箱回退：** 如果 `git worktree add` 因权限错误（沙箱拒绝）失败，告诉用户沙箱阻止了 worktree 创建，你改为在当前目录工作。然后在原地运行设置和基线测试。

## 步骤 2：项目设置

自动检测并运行适当的设置：

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

## 步骤 3：验证清洁基线

运行测试以确保工作区以清洁状态启动：

```bash
# 使用项目适当的命令
npm test / cargo test / pytest / go test ./...
```

**如果测试失败：** 报告失败，询问是继续还是调查。

**如果测试通过：** 报告就绪。

### 报告

```
Worktree 就绪：<full-path>
测试通过（<N> 个测试，0 个失败）
准备好实现 <feature-name>
```

## 快速参考

| 情况 | 操作 |
|------|------|
| 已经在链接的 worktree 中 | 跳过创建（步骤 0） |
| 在子模块中 | 当作普通仓库处理（步骤 0 guard） |
| Native worktree 工具可用 | 使用它（步骤 1a） |
| 没有 native 工具 | Git worktree 回退（步骤 1b） |
| `.worktrees/` 已存在 | 使用它（验证已忽略） |
| `worktrees/` 已存在 | 使用它（验证已忽略） |
| 两者都存在 | 使用 `.worktrees/` |
| 两者都不存在 | 检查指令文件，然后默认 `.worktrees/` |
| 目录未被忽略 | 添加到 .gitignore + 提交 |
| 创建时权限错误 | 沙箱回退，原地工作 |
| 基线测试失败 | 报告失败 + 询问 |
| 无 package.json/Cargo.toml | 跳过依赖安装 |

## 常见错误

### 与 harness 对抗

- **问题：** 平台已经提供隔离时使用 `git worktree add`
- **修复：** 步骤 0 检测现有隔离。步骤 1a 优先使用 native 工具。

### 跳过检测

- **问题：** 在已有的 worktree 内创建嵌套 worktree
- **修复：** 始终在创建任何东西之前运行步骤 0

### 跳过忽略验证

- **问题：** Worktree 内容被跟踪，污染 git 状态
- **修复：** 在创建项目本地 worktree 之前始终使用 `git check-ignore`

### 假设目录位置

- **问题：** 制造不一致，违反项目约定
- **修复：** 遵循优先级：明确指令 > 现有项目本地目录 > 默认

### 在测试失败的情况下继续

- **问题：** 无法区分新 bug 和预先存在的问题
- **修复：** 报告失败，获取明确许可才能继续

## 红旗

**永远不要：**
- 当步骤 0 检测到现有隔离时创建 worktree
- 当你有 native worktree 工具时使用 `git worktree add`（例如 `EnterWorktree`）。这是 #1 错误——如果有它，就用它。
- 跳过步骤 1a 直接跳到步骤 1b 的 git 命令
- 在未验证被忽略的情况下创建 worktree（项目本地）
- 跳过基线测试验证
- 在未询问的情况下以失败测试继续

**始终：**
- 先运行步骤 0 检测
- 优先使用 native 工具而非 git 回退
- 遵循目录优先级：明确指令 > 现有项目本地目录 > 默认
- 验证项目本地目录已被忽略
- 自动检测并运行项目设置
- 验证清洁测试基线

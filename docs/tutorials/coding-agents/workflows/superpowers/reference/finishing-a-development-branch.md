---
title: Finishing a Development Branch 完成开发分支
description: Superpowers 完成开发分支技能：实现完成后验证测试、呈现选项并执行合并、创建 PR 或清理工作区，确保代码质量后完成交付。
summary: Superpowers 原技能翻译：finishing-a-development-branch。介绍如何完成开发工作并处理合并、PR 或清理的完整流程，包含测试验证、环境检测、选项呈现和执行选择。
keywords:
  - Superpowers
  - 开发分支
  - 分支合并
  - Pull Request
  - 工作区清理
  - Git 分支管理
tags:
  - Superpowers
  - 参考
author: 布吉岛
lastUpdated: 2026-06-27
status: published
assets: none
reviewed: true
sourceType: reference
draft: false
noindex: false
---

# finishing-a-development-branch

> 本文为 [Superpowers](https://github.com/obra/superpowers/tree/main/skills/finishing-a-development-branch) 原 skill 文件夹的中文翻译，基于 MIT 协议。原文路径：`skills/finishing-a-development-branch/`。

---

**Skill 元数据**

| 字段 | 内容 |
|------|------|
| 名称 | finishing-a-development-branch |
| 描述 | 在实现完成、所有测试通过、需要决定如何集成工作时使用——引导完成开发工作，提供合并、PR 或清理的结构化选项 |

---

# 完成开发分支

## 概述

通过呈现清晰的选项并处理所选工作流，引导完成开发工作。

**核心原则：** 验证测试 → 检测环境 → 呈现选项 → 执行选择 → 清理。

**开始时声明：** "我正在使用 finishing-a-development-branch skill 来完成这项工作。"

## 流程

### 步骤 1：验证测试

**在呈现选项之前，验证测试通过：**

```bash
# 运行项目的测试套件
npm test / cargo test / pytest / go test ./...
```

**如果测试失败：**
```
测试失败（<N> 个失败）。在完成之前必须修复：

[显示失败]

在测试通过之前无法继续合并/PR。
```

停止。不要进入步骤 2。

**如果测试通过：** 继续到步骤 2。

### 步骤 2：检测环境

**在呈现选项之前确定工作区状态：**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

这决定显示哪个菜单以及清理如何工作：

| 状态 | 菜单 | 清理 |
|------|------|------|
| `GIT_DIR == GIT_COMMON`（普通仓库） | 标准 4 选项 | 无 worktree 需要清理 |
| `GIT_DIR != GIT_COMMON`，命名分支 | 标准 4 选项 | 基于来源（见步骤 6） |
| `GIT_DIR != GIT_COMMON`，detached HEAD | 精简 3 选项（无合并） | 无清理（外部管理） |

### 步骤 3：确定基础分支

```bash
# 尝试常见基础分支
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

或者询问："此分支从 main 分出——正确吗？"

### 步骤 4：呈现选项

**普通仓库和命名分支的 worktree——呈现以下 4 个选项：**

```
实现完成。你想做什么？

1. 在本地合并回 <base-branch>
2. 推送并创建 Pull Request
3. 保持分支原样（我稍后处理）
4. 丢弃此工作

选择哪个选项？
```

**Detached HEAD——呈现以下 3 个选项：**

```
实现完成。你处于 detached HEAD（外部管理工作区）。

1. 作为新分支推送并创建 Pull Request
2. 保持原样（我稍后处理）
3. 丢弃此工作

选择哪个选项？
```

**不要添加解释**——保持选项简洁。

### 步骤 5：执行选择

#### 选项 1：本地合并

```bash
# 获取主仓库根目录用于 CWD 安全
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

# 先合并——在移除任何东西之前验证成功
git checkout <base-branch>
git pull
git merge <feature-branch>

# 在合并结果上验证测试
<test command>

# 只有合并成功后：清理 worktree（步骤 6），然后删除分支
```

然后：清理 worktree（步骤 6），然后删除分支：

```bash
git branch -d <feature-branch>
```

#### 选项 2：推送并创建 PR

```bash
# 推送分支
git push -u origin <feature-branch>
```

**不要清理 worktree**——用户需要它来迭代 PR 反馈。

#### 选项 3：保持原样

报告："保持分支 `<name>`。Worktree 保留在 `<path>`。"

**不要清理 worktree。**

#### 选项 4：丢弃

**先确认：**
```
这将永久删除：
- 分支 <name>
- 所有提交：<commit-list>
- Worktree <path>

输入 'discard' 确认。
```

等待精确确认。

如果确认：
```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

然后：清理 worktree（步骤 6），然后强制删除分支：
```bash
git branch -D <feature-branch>
```

### 步骤 6：清理工作区

**仅对选项 1 和 4 运行。** 选项 2 和 3 始终保留 worktree。

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

**如果 `GIT_DIR == GIT_COMMON`：** 普通仓库，没有 worktree 需要清理。完成。

**如果 worktree 路径在 `.worktrees/` 或 `worktrees/` 下：** Superpowers 创建了这个 worktree——我们负责清理。

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git worktree remove "$WORKTREE_PATH"
git worktree prune  # 自愈：清理任何陈旧的注册
```

**否则：** 宿主环境（harness）拥有此工作区。不要移除它。如果你的平台提供工作区退出工具，使用它。否则，保持工作区原样。

## 快速参考

| 选项 | 合并 | 推送 | 保留 Worktree | 清理分支 |
|------|------|------|--------------|----------|
| 1. 本地合并 | 是 | - | - | 是 |
| 2. 创建 PR | - | 是 | 是 | - |
| 3. 保持原样 | - | - | 是 | - |
| 4. 丢弃 | - | - | - | 是（强制） |

## 常见错误

**跳过测试验证**
- **问题：** 合并损坏的代码，创建失败的 PR
- **修复：** 在提供选项之前始终验证测试

**开放式问题**
- **问题：** "我接下来该做什么？"是含糊的
- **修复：** 呈现精确的 4 个结构化选项（或 detached HEAD 的 3 个）

**为选项 2 清理 worktree**
- **问题：** 移除用户迭代 PR 需要的 worktree
- **修复：** 只为选项 1 和 4 清理

**在移除 worktree 之前删除分支**
- **问题：** `git branch -d` 失败，因为 worktree 仍然引用分支
- **修复：** 先合并，移除 worktree，然后删除分支

**从 worktree 内部运行 git worktree remove**
- **问题：** CWD 在被移除的 worktree 内时命令静默失败
- **修复：** 在 `git worktree remove` 之前始终 `cd` 到主仓库根目录

**清理 harness 拥有的 worktree**
- **问题：** 移除 harness 创建的 worktree 导致幻影状态
- **修复：** 只清理 `.worktrees/` 或 `worktrees/` 下的 worktree

**丢弃时没有确认**
- **问题：** 意外删除工作
- **修复：** 要求输入 "discard" 确认

## 红旗

**永远不要：**
- 以失败的测试继续
- 在不验证结果测试的情况下合并
- 在没有确认的情况下删除工作
- 在没有明确请求的情况下 force-push
- 在确认合并成功之前移除 worktree
- 清理你没有创建的 worktree（来源检查）
- 从 worktree 内部运行 `git worktree remove`

**始终：**
- 在提供选项之前验证测试
- 在呈现菜单之前检测环境
- 呈现精确 4 个选项（或 detached HEAD 的 3 个）
- 对选项 4 获取输入确认
- 只为选项 1 和 4 清理 worktree
- 在移除 worktree 之前 `cd` 到主仓库根目录
- 移除后运行 `git worktree prune`

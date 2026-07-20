---
title: Executing Plans 计划执行
description: Superpowers 计划执行技能：在独立会话中加载、审查并执行实现计划，带审查检查点，适合需要在独立上下文中执行的场景。
summary: Superpowers 原技能翻译：executing-plans。介绍如何加载并逐步执行已有实现计划的流程，包含计划审查、任务执行、完成开发等步骤。
keywords:
  - Superpowers
  - 计划执行
  - 实现计划
  - 独立会话
  - 审查检查点
tags:
  - Superpowers
  - 参考
author: 布吉岛
lastUpdated: 2026-06-20
status: published
assets: none
reviewed: true
sourceType: reference
draft: false
noindex: false
---

# executing-plans

> 本文为 [Superpowers](https://github.com/obra/superpowers/tree/main/skills/executing-plans) 原 skill 文件夹的中文翻译，基于 MIT 协议。原文路径：`skills/executing-plans/`。

---

**Skill 元数据**

| 字段 | 内容 |
|------|------|
| 名称 | executing-plans |
| 描述 | 在独立会话中执行一份已有的书面实现计划时使用，带有审查检查点 |

---

# 执行计划

## 概述

加载计划，批判性地审查，执行所有任务，完成后汇报。

**开始时声明：** "我正在使用 executing-plans skill 来实现这个计划。"

**注意：** 告知你的伙伴，Superpowers 在能访问子代理的情况下效果更好。如果在支持子代理的平台上运行，工作质量会显著更高（Claude Code、Codex CLI、Codex App、Copilot CLI 和 Gemini CLI 均满足条件；各平台工具对照详见 `../using-superpowers/references/`）。如果子代理可用，使用 superpowers:subagent-driven-development 而不是本 skill。

## 流程

### 步骤 1：加载并审查计划

1. 读取计划文件
2. 批判性地审查——识别任何关于计划的问题或疑虑
3. 如有疑虑：在开始之前与你的伙伴沟通
4. 如无疑虑：为计划条目创建待办并继续

### 步骤 2：执行任务

对于每个任务：

1. 标记为进行中
2. 严格遵循每个步骤（计划有 bite-sized 步骤）
3. 按指定运行验证
4. 标记为已完成

### 步骤 3：完成开发

所有任务完成并验证后：

- 声明："我正在使用 finishing-a-development-branch skill 来完成这项工作。"
- **必须使用的子技能：** 使用 superpowers:finishing-a-development-branch
- 遵循该 skill 验证测试、呈现选项、执行选择

## 何时停下来寻求帮助

**遇到以下情况立即停止执行：**

- 遇到阻塞（缺少依赖、测试失败、指令不清晰）
- 计划有严重缺口导致无法开始
- 你不理解某条指令
- 验证反复失败

**寻求澄清，而不是猜测。**

## 何时回退到较早步骤

**在以下情况回退到步骤 1（审查）：**

- 伙伴根据你的反馈更新了计划
- 基本方法需要重新思考

**不要强行突破阻塞**——停下来并寻求帮助。

## 记住

- 先批判性地审查计划
- 严格遵循计划步骤
- 不要跳过验证
- 当计划说调用 skill 时调用
- 遇到阻塞时停止，不要猜测
- 没有用户明确同意，永远不要在 main/master 分支上开始实现

## 集成

**必需的工作流 skill：**

- **superpowers:using-git-worktrees** — 确保隔离工作区（创建一个或验证已存在）
- **superpowers:writing-plans** — 创建本 skill 所执行的计划
- **superpowers:finishing-a-development-branch** — 所有任务完成后完成开发

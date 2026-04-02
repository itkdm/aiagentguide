---
title: learn-claude-code 概览
description: "learn-claude-code 路线概览，聚焦 Claude Code-like / Coding Agent 的工程机制，包括工具执行、任务规划、上下文管理、并发与协作。"
keywords:
  - learn-claude-code
  - Coding Agent
  - Claude Code
  - Agent 工程原理
tags:
  - AI Agent
  - Coding Agent
  - learn-claude-code
author: AI Agent Guide
---

# learn-claude-code

这一组内容对应的是一条更偏 **Claude Code-like / Coding Agent** 的工程主线。

它关注的重点不是“什么是 Agent”的通识介绍，而是一个能持续执行任务的 Agent 系统，通常是怎样组织起来的：

- 为什么它通常围绕一个循环运行
- 工具、任务、上下文、技能、子 Agent 分别承担什么职责
- 多 Agent、后台任务、团队协作为什么会让系统变复杂
- 从“能跑起来”到“可控、可扩展”之间，还差哪些工程机制

## 这组内容的来源和定位

这条主线主要参考了开源项目 [learn-claude-code](https://github.com/shareAI-lab/learn-claude-code/blob/main/README-zh.md) 的原理路线。

但这里不是直接照抄原文，而是做了中文重写，并把重点放在：

- 面向中文开发者的理解路径
- 更贴近通用 AI Agent 的机制解释
- 结合最小示例说明核心原理

更准确地说，`s01-s12` 这组内容是在解释：

- 一个 Coding Agent 怎样围绕工具持续执行
- 长任务、多 Agent、任务系统、后台任务怎样组织
- 为什么代码任务里经常会出现 worktree、目录隔离、团队协议这类工程设计

这些内容对理解通用 Agent 当然也有帮助，但它们更接近一条“工程实现主线”，尤其适合理解 Coding Agent。

## 适合谁先看

这一组更适合下面几类读者：

- 已经看完“入门”，想继续理解 Agent 到底是怎么跑起来的
- 不想只背框架名词，而是想先理解背后的系统设计
- 有一定编程基础，想从工程角度理解 Agent

## 结构

### 工具与执行

- [s01 Agent 循环](./s01-agent-loop.md)
- [s02 工具](./s02-tools.md)

### 规划与协同

- [s03 TodoWrite](./s03-todowrite.md)
- [s04 子 Agent](./s04-sub-agents.md)
- [s05 技能](./s05-skills.md)
- [s07 任务系统](./s07-task-system.md)

### 记忆管理

- [s06 上下文压缩](./s06-context-compression.md)

### 并发

- [s08 后台任务](./s08-background-tasks.md)

### 协作

- [s09 Agent 团队](./s09-agent-teams.md)
- [s10 团队协议](./s10-team-protocol.md)
- [s11 自主 Agent](./s11-autonomous-agents.md)
- [s12 Worktree + 任务隔离](./s12-worktree-task-isolation.md)

## 推荐阅读顺序

1. 先看 `s01 Agent 循环` 和 `s02 工具`
2. 再看 `s03 TodoWrite`、`s06 上下文压缩`、`s07 任务系统`
3. 然后看 `s04 子 Agent`、`s05 技能`、`s08 后台任务`
4. 最后看 `s09` 到 `s12`，把协作和工程隔离这一层补齐

如果你想把这条 Coding Agent 工程主线和更宽泛的 Agent 原理对起来，再继续看侧边栏里的“通用原理补充”和 `OpenClaw`。

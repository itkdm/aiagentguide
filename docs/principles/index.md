---
title: AI Agent 原理
summary: 系统拆解 AI Agent 的运行原理，重点覆盖 Agent 循环、工具调用、上下文管理、多 Agent 协作和工程机制。
keywords:
  - AI Agent 原理
  - Agent 循环
  - 多 Agent
  - 工具调用
tags:
  - AI Agent
  - 原理
  - Agent 循环
  - 多 Agent
author: AI Agent Guide
description: "系统拆解 AI Agent 的运行原理，覆盖 Agent 循环、工具调用、上下文管理、多 Agent 协作与工程化机制。"
---

# 原理

通过入门栏目，相信你已经对 AI Agent 建立了基础认知。原理栏目放在 `入门` 和 `框架` 之间，重点不是再解释“什么是 Agent”，而是把 Agent 系统拆开来看：

- 为什么它通常围绕一个循环运行
- 工具、任务、上下文、技能、子 Agent 分别扮演什么角色
- 多 Agent、后台任务、团队协作为什么会让系统变复杂
- 从“能跑起来”到“可控、可扩展”之间，还差哪些工程机制

如果说 `入门` 负责建立直觉和判断，那么 `原理` 负责解释系统为什么这样设计。

## 说明

这一栏s01-s12主要参考了开源项目 [learn-claude-code](https://github.com/shareAI-lab/learn-claude-code/blob/main/README-zh.md) 的原理路线。

但这一栏并直接照抄原文，而是用中文重写并且重点放在：

- 面向中文开发者的理解路径
- 更贴近通用 AI Agent 的机制解释
- 结合最小代码示例说明核心原理

## 定位说明

这一栏前面的 `s01-s12` 主线，整体更接近 **Claude Code-like / Coding Agent** 的工程原理，重点解释的是：

- 工具调用型 Agent 怎么循环运行
- 长任务、多 Agent、任务系统、后台任务怎么组织
- 为什么代码任务里会出现 worktree、目录隔离、团队协议这类机制

这些机制当然对理解 Agent 很有帮助，但并不是所有 AI Agent 的唯一标准结构。

因此更准确的理解是：

- `s01-s12`：偏工程实现，尤其适合理解 Coding Agent
- `通用原理补充`：把这条工程线和更广义的 Agent 原理接起来
- `OpenClaw 原理`：用一个具体案例拆解 Agent 是怎样落地运作的

## 这一栏适合谁

- 已经看完入门，开始想知道 Agent 到底“怎么跑起来”
- 不想只背框架名，而是想先理解框架背后的设计
- 有一定编程基础，希望结合实际系统理解 Agent 机制

## 章节结构

### 工具与执行

- [s01 Agent 循环](./s01-agent-loop.md)
- [s02 工具](./s02-tools.md)

### 规划与协作

- [s03 TodoWrite](./s03-todowrite.md)
- [s04 子 Agent](./s04-sub-agents.md)
- [s05 技能](./s05-skills.md)
- [s07 任务系统](./s07-task-system.md)

### 内存管理

- [s06 上下文压缩](./s06-context-compression.md)

### 并发

- [s08 后台任务](./s08-background-tasks.md)

### 协作

- [s09 Agent 团队](./s09-agent-teams.md)
- [s10 团队协议](./s10-team-protocol.md)
- [s11 自主 Agent](./s11-autonomous-agents.md)
- [s12 Worktree + 任务隔离](./s12-worktree-task-isolation.md)

### 通用原理补充

- [通用 Agent 架构：感知、规划、行动、反思](./general-agent-architecture.md)
- [通用 Agent 原理：记忆](./general-memory.md)
- [通用 Agent 原理：什么是 Harness Engineering，为什么 Agent 不只是模型和 Prompt？](./general-harness-engineering.md)
- [通用多 Agent 原理：什么时候拆分，什么时候不拆](./general-multi-agent.md)
- [通用 Agent 原理：可靠性与安全](./general-reliability-safety.md)

### OpenClaw 原理

- [OpenClaw 原理拆解](./openclaw-principles.md)

## 推荐阅读顺序

1. 先看 `s01 Agent 循环` 和 `s02 工具`
2. 再看 `s03 TodoWrite`、`s06 上下文压缩`、`s07 任务系统`
3. 然后看 `s04 子 Agent`、`s05 技能`、`s08 后台任务`
4. 最后看 `s09` 到 `s12`，把协作和工程隔离这一层补齐
5. 如果你想把这条 Coding Agent 工程线和更广义的 Agent 理解对上，再看 `通用原理补充` 和 `OpenClaw 原理`

## 这一栏和前后栏目怎么衔接

- `入门`：先解决“这是不是 Agent、适不适合用”
- `原理`：再解决“它是怎么跑的、为什么这样设计”
- `框架`：最后再去看“这些原理由什么框架实现”

## 学习路径

`入门 -> 原理 -> 框架 -> 实战`

先把原理层看清，再做框架选型，通常会比直接对着框架 API 学得更稳。

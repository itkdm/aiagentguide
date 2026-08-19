---
title: AI Agent 原理
summary: 系统拆解 AI Agent 的运行原理，重点覆盖 Agent 循环、工具调用、上下文管理、多 Agent 协作和工程机制。
keywords:
  - AI Agent 和工作流有什么区别
  - ReAct Agent 是什么
  - Tool Calling 是什么
  - 多 Agent 是怎么协作的
  - Agent 记忆是怎么工作的
tags:
  - AI Agent
  - 原理
  - Agent 循环
  - 多 Agent
author: 布吉岛
description: "系统拆解 AI Agent 的运行机制，适合搜索 AI Agent 和工作流有什么区别、ReAct Agent 是什么，以及 Tool Calling 怎么工作。"
lastUpdated: 2026-05-30
status: published
---

# 原理

通过入门栏目，相信你已经对 AI Agent 建立了基础认知。原理栏目放在 `入门` 和 `框架` 之间，重点不是再解释“什么是 Agent”，而是把 Agent 系统拆开来看：

- 为什么它通常围绕一个循环运行
- 工具、任务、上下文、技能、子 Agent 分别扮演什么角色
- 多 Agent、后台任务、团队协作为什么会让系统变复杂
- 从“能跑起来”到“可控、可扩展”之间，还差哪些工程机制

如果说 `入门` 负责建立直觉和判断，那么 `原理` 负责解释系统为什么这样设计。

## 定位说明

这一栏以 `通用原理补充` 为主线，重点拆解更广义的 AI Agent 运行机制：

- 工具调用型 Agent 怎么循环运行
- 记忆、规划、上下文、技能这类通用模块怎么组织
- 多 Agent 协作为什么有效、什么时候并不适合
- 为什么从“能跑起来”到“可控、可扩展”之间，还需要 Harness、可靠性与安全这一类工程机制

## 这一栏适合谁

- 已经看完入门，开始想知道 Agent 到底“怎么跑起来”
- 不想只背框架名，而是想先理解框架背后的设计
- 有一定编程基础，希望结合实际系统理解 Agent 机制

## 章节结构

### 通用原理补充

- [通用 Agent 架构：感知、规划、行动、反思](./general-agent-architecture.md)
- [通用 Agent 原理：核心循环](./general-core-loop.md)
- [通用 Agent 原理：规划](./general-planning.md)
- [通用 Agent 原理：工具](./general-tools.md)
- [通用 Agent 原理：记忆](./general-memory.md)
- [通用 Agent 原理：Skill](./general-skills.md)
- [通用 Agent 原理：MCP](./general-mcp.md)
- [通用 Agent 原理：什么是 Harness Engineering，为什么 Agent 不只是模型和 Prompt？](./general-harness-engineering.md)
- [通用多 Agent 原理：什么时候拆分，什么时候不拆](./general-multi-agent.md)
- [通用 Agent 原理：可靠性与安全](./general-reliability-safety.md)

## 推荐阅读顺序

1. 先看 `通用 Agent 架构` 和 `核心循环`，建立整体框架
2. 再看 `规划`、`工具`、`记忆`、`Skill`，把执行链路拆开
3. 然后看 `MCP`、`Harness Engineering`、`可靠性与安全`，把工程那一层补齐
4. 最后看 `多 Agent`，理解什么时候拆分、什么时候保持单体

## 这一栏和前后栏目怎么衔接

- `入门`：先解决“这是不是 Agent、适不适合用”
- `原理`：再解决“它是怎么跑的、为什么这样设计”
- `框架`：最后再去看“这些原理由什么框架实现”

## 学习路径

`入门 -> 原理 -> 框架 -> 实战`

先把原理层看清，再做框架选型，通常会比直接对着框架 API 学得更稳。

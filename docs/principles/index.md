---
description: "系统拆解 AI Agent 的运行原理，覆盖 Agent 循环、工具调用、上下文管理、多 Agent 协作与工程化机制。"
---

# 原理

这一栏放在`入门`和`框架`之间，重点不是再解释“什么是 Agent”，而是把 Agent 系统拆开来看：

- 为什么它通常围绕一个循环运转
- 工具、任务、上下文、技能、子 Agent 分别扮演什么角色
- 多 Agent、后台任务、团队协作为什么会让系统变复杂
- 做到“能运行”和做到“可控、可扩展”之间差了哪些机制

如果说`入门`负责建立直觉和判断，那么`原理`负责解释系统为什么这样设计。

## 结构参考说明

这一栏的章节组织方式参考了开源项目 [learn-claude-code](https://github.com/shareAI-lab/learn-claude-code/blob/main/README-zh.md) 的原理路线。该仓库在 GitHub 标注为 [MIT License](https://github.com/shareAI-lab/learn-claude-code/blob/main/LICENSE)，因此可以合法参考其结构和思路。

但这一栏不会直接照抄原文，而是按你这个站点的语境，用中文重写，重点放在：

- 面向中文开发者的理解路径
- 更贴近通用 AI Agent 的机制解释
- 结合最小代码示例说明核心原理

## 定位说明

这一栏前面的 `s01-s12` 主线，整体更接近 **Claude Code-like / Coding Agent** 的工程原理。

也就是说，这一部分重点解释的是：

- 工具调用型 Agent 怎么循环运行
- 长任务、多 Agent、任务板、后台任务怎么组织
- 代码任务里为什么会出现 worktree、目录隔离、团队协议这类机制

它们当然对理解 Agent 很有帮助，但也**不是所有 AI Agent 的唯一标准结构**。  
例如：

- `Worktree + 任务隔离` 更偏代码智能体
- `JSONL 邮箱 + 团队协议` 更偏长期运行的工程化协作系统
- `任务板自主认领` 更偏多 Agent 工作系统

所以更准确的理解是：

- `s01-s12`：偏工程实现，尤其适合理解 Coding Agent
- 文末新增的“通用原理补充”：负责把这条工程线和更广义的 Agent 原理接起来

## 这一栏适合谁

- 已经看完入门，开始想知道 Agent 到底“怎么跑起来”
- 不想只背框架名，而是想先理解框架背后的设计
- 有一定编程基础，希望结合代码理解系统机制

## 章节结构

### 工具与执行

- [s01 Agent 循环](./s01-agent-loop.md)
- [s02 工具](./s02-tools.md)

### 规划与协调

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
- [通用记忆原理：上下文、记忆、RAG 与状态](./general-memory-rag-state.md)
- [通用多 Agent 原理：什么时候拆分，什么时候不要拆](./general-multi-agent.md)
- [通用可靠性原理：评测、安全与 Human-in-the-loop](./general-reliability-safety.md)

## 推荐阅读顺序

1. 先看 `s01 Agent 循环` 和 `s02 工具`
2. 再看 `s03 TodoWrite`、`s06 上下文压缩`、`s07 任务系统`
3. 然后看 `s04 子 Agent`、`s05 技能`、`s08 后台任务`
4. 最后看 `s09` 到 `s12`，把协作和工程隔离这一层补齐
5. 如果你想把这条 Coding Agent 工程线和更广义的 Agent 理解对上，再看最后 4 篇“通用原理补充”

## 这一栏和前后栏目怎么衔接

- `入门`：先解决“这是不是 Agent、适不适合用”
- `原理`：再解决“它是怎么跑的、为什么这样设计”
- `框架`：最后再去看“这些原理由什么框架实现”

## 学习路径

`入门 -> 原理 -> 框架 -> 实战`

先把原理层看清，再做框架选型，通常会比直接对着框架 API 学得更稳。

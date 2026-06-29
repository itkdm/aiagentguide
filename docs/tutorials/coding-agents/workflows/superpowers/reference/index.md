---
title: Superpowers 参考文档
description: Superpowers 14 个技能完整中文文档，涵盖设计先行、任务分解、子代理驱动开发、测试驱动开发、系统化调试、代码审查等 AI 开发最佳实践。
summary: Superpowers 原技能文件夹的中文翻译参考文档，按优先级分组。14 个技能包含从设计到部署的完整 AI 开发工作流。
keywords:
  - Superpowers
  - AI 开发工作流
  - 设计先行
  - 子代理驱动开发
  - TDD
  - 代码审查
  - Git Worktree
tags:
  - Superpowers
  - 参考
author: AI Agent Guide
lastUpdated: 2026-06-15
status: published
assets: none
reviewed: true
sourceType: reference
draft: false
noindex: false
---

# Superpowers 参考文档

> 本文档为 [Superpowers](https://github.com/obra/superpowers) 原 skill 文件夹的中文翻译，基于 MIT 协议。

## 阅读说明

- 每个 skill 对应一篇参考文档，翻译自原 `skills/<skill-name>/SKILL.md` 及附属文件
- 附属文件（prompt 模板、示例等）整合为文末附录或子章节
- 14 个 skill 不是孤立的手册，而是一条完整的"接需求 → 设计 → 执行 → 验证 → 交付"流水线

## Superpowers 使用流程总览

下图展示了从接到一个开发任务到最终交付的完整 superpowers 工作流，每个节点对应下文文档列表中的一个 skill。

```mermaid
flowchart TD
    Start([用户发起任务]) --> Route["01 using-superpowers<br/>路由：检查是否有 skill 适用"]

    Route --> BS

    subgraph P1["P1 · 核心工作流（先设计，再动手）"]
        direction TB
        BS["02 brainstorming<br/>需求澄清 → 方案 → 设计文档"]
        WP["03 writing-plans<br/>把设计拆成 bite-size 任务"]
        EX["04 / 05 执行<br/>subagent-driven-development<br/>或 executing-plans"]
        BS --> WP --> EX
    end

    EX -.->|写代码时| TDD["06 test-driven-development<br/>RED → GREEN → REFACTOR"]
    TDD -.->|测试失败 / 出 bug| DBG["07 systematic-debugging<br/>四阶段根因分析"]
    DBG -.->|修完回到执行| EX

    EX --> VER["08 verification-before-completion<br/>完成前验证：每个任务都要验"]

    subgraph P2["P2 · 质量保证"]
        direction TB
        CR_REQ["09 requesting-code-review<br/>发起代码审查"]
        CR_RCV["10 receiving-code-review<br/>处理审查反馈"]
        CR_REQ --> CR_RCV
    end

    VER -->|任务都过验| CR_REQ
    CR_RCV -.->|反馈需要返工| EX

    subgraph P3["P3 · 工具与环境（按需启用）"]
        direction TB
        WT["11 using-git-worktrees<br/>Git Worktree 隔离分支"]
        PA["13 dispatching-parallel-agents<br/>并行派发子代理"]
        FIN["12 finishing-a-development-branch<br/>分支收尾与合并"]
    end

    WT -.->|任务启动时建立隔离| BS
    PA -.->|独立任务并行| EX
    CR_RCV -->|审查通过| FIN

    subgraph P4["P4 · 元技能"]
        WS["14 writing-skills<br/>沉淀自己的 skill"]
    end

    FIN -.->|流程中发现可复用模式| WS
    FIN --> End([交付完成])

    classDef stage fill:#f4f4f5,stroke:#a1a1aa,stroke-width:1px,color:#52525b;
    classDef p1 fill:#e0f2fe,stroke:#0284c7,color:#075985;
    classDef p2 fill:#dcfce7,stroke:#16a34a,color:#166534;
    classDef p3 fill:#fef3c7,stroke:#d97706,color:#92400e;
    classDef p4 fill:#f3e8ff,stroke:#9333ea,color:#6b21a8;
    classDef key fill:#0ea5e9,stroke:#0369a1,color:#ffffff,stroke-width:2px;
    classDef endn fill:#10b981,stroke:#047857,color:#ffffff,stroke-width:2px;

    class Start,End endn;
    class Route key;
    class BS,WP,EX p1;
    class TDD,DBG,VER,CR_REQ,CR_RCV p2;
    class WT,PA,FIN p3;
    class WS p4;
```

## 文档列表

### 核心工作流（P1）

| # | Skill | 说明 |
|---|-------|------|
| 01 | [using-superpowers](./using-superpowers) | 所有 skill 的入口和路由器 |
| 02 | [brainstorming](./brainstorming) | 设计先行：需求澄清 → 方案 → 设计文档 |
| 03 | [writing-plans](./writing-plans) | 任务拆解：把设计拆成 bite-size 任务 |
| 04 | [subagent-driven-development](./subagent-driven-development) | 子代理驱动开发：逐任务 + 两层 review |
| 05 | [executing-plans](./executing-plans) | 计划执行：inline 批量执行（兼容模式） |

### 质量保证（P2）

| # | Skill | 说明 |
|---|-------|------|
| 06 | [test-driven-development](./test-driven-development) | TDD 铁律：RED → GREEN → REFACTOR |
| 07 | [systematic-debugging](./systematic-debugging) | 系统化调试：四阶段根因分析 |
| 08 | [verification-before-completion](./verification-before-completion) | 完成前验证：修完必须验证 |
| 09 | [requesting-code-review](./requesting-code-review) | 发起代码审查 |
| 10 | [receiving-code-review](./receiving-code-review) | 处理审查反馈 |

### 工具与环境（P3）

| # | Skill | 说明 |
|---|-------|------|
| 11 | [using-git-worktrees](./using-git-worktrees) | Git Worktree 隔离 |
| 12 | [finishing-a-development-branch](./finishing-a-development-branch) | 分支收尾与合并 |
| 13 | [dispatching-parallel-agents](./dispatching-parallel-agents) | 并行子代理调度 |

### 元技能（P4）

| # | Skill | 说明 |
|---|-------|------|
| 14 | [writing-skills](./writing-skills) | 如何写好一个 skill |

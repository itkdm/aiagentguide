---
title: Agent Engineering 是什么：从 Prompt 到 Graph
summary: 从 Prompt Engineering 出发，理解 Context、Harness、Loop、Graph Engineering 为什么不断出现，以及这些概念分别把 Agent 工程的关注范围扩展到了哪里。
description: "Agent Engineering 是什么？从 Prompt、Context、Harness、Loop 到 Graph，理解 Agent 工程如何从单次调用扩展到长期运行的系统。"
keywords:
  - Agent Engineering
  - Prompt Engineering
  - Context Engineering
  - Harness Engineering
  - Loop Engineering
  - Graph Engineering
  - Agent 工程
tags:
  - Agent
  - Agent Engineering
  - Context Engineering
  - Harness Engineering
  - 入门
author: 布吉岛
lastUpdated: 2026-09-11
status: published
draft: false
noindex: false
assets: none
reviewed: true
sourceType: original
---

# Agent Engineering 是什么：从 Prompt 到 Graph

刚开始使用大模型的时候，我们经常听到：

**Prompt Engineering。**

后来又出现：

```text
Context Engineering
Harness Engineering
Loop Engineering
Graph Engineering
```
隔一段时间就发明一个新的 Engineering。

其实这些概念并不是什么严格的版本升级路线，而是随着 Agent 能完成的任务越来越复杂，工程师关注的问题不断向外扩展。

最开始关注一句 Prompt 怎么写，后来关注模型这一轮到底看到了什么；

再后来发现，即使 Context 没问题，Agent 仍然需要 Tool、状态、权限、校验和运行环境。

任务继续变长以后，又要设计 Agent 怎样反复执行、检查、修正和停止。

当单个 Agent 进一步变成复杂系统，又开始讨论怎样用显式的 Graph 组织任务、Agent、状态和依赖关系。

## 为什么会不断出现新的 Engineering

假设现在要让一个 Coding Agent 完成：

> 修复 GitHub Issue #128，并确保测试通过。

如果我们只把它看成一次模型调用，可能首先想到：

```text
Prompt 应该怎么写？
```

于是给模型：

```text
请认真分析这个 Issue，
找到相关代码并完成修复。
修改后运行测试，
确保没有引入回归。
```

这属于 Prompt Engineering。

但真正运行以后，会发现模型不知道：

```text
Issue 具体内容是什么？
项目有哪些文件？
刚刚搜索到了什么？
测试结果是什么？
之前已经改过哪些代码？
```

于是问题扩大成：

> **这一轮到底应该让模型看到哪些信息？**

这就是 Context Engineering。

接下来，即使 Context 已经组织得很好，Agent 仍然可能：

```text
执行危险命令
忘记跑测试
工具失败以后继续猜
修改代码后不验证
Context 太长以后无法继续
中断以后不知道怎么恢复
```

这些问题无法靠“再补一句 Prompt”稳定解决，于是关注范围继续扩大到：

```text
Tools
State
Permissions
Environment
Validation
Recovery
Human Approval
```

这开始进入 Harness Engineering。

如果任务还要不断经历修改、测试、失败、分析和重新修改，新的重点又变成：

> **整个执行循环应该怎样设计？**

这就是 Loop Engineering 开始关注的问题。

所以这些词之所以不断出现，本质上是因为：

> **Agent 从“一次模型调用”逐渐变成了“长期运行的软件系统”。**

---

## Prompt Engineering：怎样把要求说清楚

Prompt Engineering 关注的是：

> **怎样设计和优化输入，让模型更准确地理解当前任务。**

一个比较完整的 Prompt，通常可以从这几个方面组织：

```text
身份 / 角色
↓
目标 / 任务
↓
上下文
↓
执行要求
↓
约束条件
↓
输出格式
↓
示例（按需提供）
```

这些部分并不是每次都必须全部出现。

最重要的是先把目标说清楚，再根据任务补充背景、边界和结果要求。

例如同样让模型做 Code Review：

比较模糊的 Prompt：

```text
Review 一下这段代码。
```

更结构化的 Prompt：

```text
你是一名负责后端代码质量的审查助手。

目标：
审查这次代码修改，找出可能导致功能错误或回归的问题。

上下文：
下面提供的是本次提交的 Diff，以及相关测试结果。

要求：
1. 优先检查逻辑错误、并发问题和异常处理。
2. 说明问题出现的具体文件和代码位置。
3. 如果没有发现问题，也要说明检查了哪些方面。

约束：
不要只总结代码变化。
不要提出与本次修改无关的重构建议。

输出格式：
按“问题位置 / 风险说明 / 修改建议”列出结果。
如果没有问题，明确写出“未发现阻塞性问题”。
```

这里的身份、目标、上下文、要求、约束和输出格式，并不是为了把 Prompt 写得更复杂，而是分别回答了几个不同问题：

```text
身份 / 角色
→ 模型应该以什么职责和视角工作？

目标 / 任务
→ 这一次到底要完成什么？

上下文
→ 完成任务需要参考哪些背景信息？

执行要求
→ 应该优先检查什么、按照什么方式完成？

约束条件
→ 哪些事情不能做，或者必须遵守？

输出格式
→ 最终结果应该怎样组织？
```

示例则适合复杂格式或特殊风格的任务。与其只描述“请按这个格式输出”，有时直接给出一组输入和期望输出，更容易让模型理解要求。

Prompt Engineering 因此会关心：

- 指令是否明确
- 目标和任务边界是否清楚
- 上下文是否足够完成当前任务
- 约束和输出格式是否清楚
- 是否需要提供示例

这些问题今天依然重要。Context、Harness 的出现并不代表 Prompt Engineering 过时，只是对于真正的 Agent 来说，**Prompt 已经不是全部。**

当然，上面这个举例如果我们每次正常对话都这样写的话，就会显得很繁琐。

合理的方案应该是在面向一些复杂的任务、设计系统提示词或者在下面这些Harness Engineering、Loop Engineering的时候考虑这样组织。

有时候一两句话能够说清楚的，就不需要写得太复杂。

---

## Context Engineering：模型这一刻应该看到什么

Agent 与普通一次性问答最大的区别之一，是它会不断产生新的信息。

例如 Coding Agent 工作几分钟以后，Context 里可能出现：

```text
System Prompt
用户目标
AGENTS.md
当前项目结构
5 个 Tool 描述
刚读取的 7 个文件
搜索结果
Git Diff
测试日志
Memory
Subagent 返回结果
之前几十轮消息
……
```

这时问题已经不只是 Prompt 怎么写，而是：

> **哪些信息应该在当前这一轮进入模型？**

测试失败以后，下一轮真正重要的可能是：

```text
用户目标
相关代码
刚刚修改的 Diff
失败测试
错误日志
```

而不是把之前浏览过的所有文件重新全部塞进去。

因此 Context Engineering 会关心：

```text
什么信息必须一直保留？
什么信息只在需要时读取？
历史消息什么时候压缩？
Tool Result 应该保留多少？
Memory 什么时候取出来？
Skills 什么时候加载？
Subagent 最后应该返回多少信息？
```

也就是：

```text
Prompt Engineering
→ 我要怎么告诉模型？

Context Engineering
→ 这一刻应该让模型知道什么？
```

---

## Harness Engineering：模型外面的系统怎么设计

`Harness` 原本有“挽具、控制装置”的意思。放到 Agent 里，可以把它理解成：

> **包在模型外面，让模型能够真正做事的运行外壳。**

现在也有一种说法：

> **Agent = Harness + Model**

模型本身可能只负责：

```text
读取 Context
↓
判断下一步
↓
输出 Tool Call 或答案
```

但一个真实 Coding Agent 还需要：

```text
文件读写
Shell
Git
Browser
状态保存
权限检查
Sandbox
测试
任务恢复
Subagent
上下文压缩
……
```

这些都是外面的软件系统提供的。

可以把一个 Agent 粗略画成：

```text
┌─────────────────────────────┐
│           Harness           │
│                             │
│  Context        Tools       │
│  State          Memory      │
│  Permissions    Sandbox     │
│  Validation     Recovery    │
│                             │
│        ┌───────────┐        │
│        │   Model   │        │
│        └───────────┘        │
│                             │
└─────────────────────────────┘
```

所以 Harness Engineering 关注的是：

> **怎样给模型设计一个适合工作的环境。**

仍然以修复 Issue 为例，一个好的 Harness 可能提供：

```text
read_file
search_code
edit_file
run_tests
git_diff
```

同时限制：

```text
不能直接 push main
不能读取项目外敏感文件
高风险 Shell 命令需要确认
```

并要求：

```text
修改后必须运行相关测试
完成前必须检查 Diff
```

甚至任务中断后还能恢复：

```text
已经完成：
- 找到问题
- 修改 UserService

还未完成：
- 测试
- Review
```

这些都不是通过一句“请认真一点”能够替代的。

---

## Loop Engineering：Agent 怎样自己继续工作

有了 Harness，Agent 已经具备了工作环境，但还有一个问题：

> **它到底怎样持续把一个目标推进到完成？**

最简单的 Agent Loop 是：

```text
目标
↓
模型判断
↓
执行动作
↓
观察结果
↓
继续判断
↓
……
```

Loop Engineering 关注的，就是**这个循环本身怎样被设计得更可靠**。

例如：

```text
目标：修复 Issue #128
        ↓
读取 Issue → 调查代码 → 提出修改 → 运行测试
                                      ↓
                              测试失败？
                             ↙        ↘
                         分析错误      Review Diff
                            ↓             ↓
                         重新修改     满足条件？
                                      ↓
                                     结束
```

这里真正需要工程设计的问题很多：

```text
什么算完成？
失败以后重试几次？
什么时候应该重新规划？
什么时候需要换一个策略？
什么时候调用 Subagent？
什么时候应该停止自动执行？
什么时候必须交给人？
```

其实上面那个例子我们用运行测试来 Loop，还不够好。

实际上的 Loop 可能是：

我这个Agent Loop 就负责处理我这个开源项目的 Issue，我项目很火，所以我需要处理很多 Issue。

但是处理 Issue 的流程也比较固定，那么我就创建了一个 Agent 形成一个Loop 来去处理这些 Issue。

只要有 Issue 就24小时不间断的处理，然后我就可以去睡觉了。

---

## Graph Engineering：当系统结构比单个 Loop 更复杂

再往后，就来到这组概念里最新的一个概念：

**Graph Engineering。**

首先要说明：

> **Graph Engineering 目前还不是像 MCP 那样具有正式规范的成熟标准术语。**

它是一个仍在形成中的**新兴工程视角**，不同团队对它的边界也还没有完全统一。

为什么会出现这样的想法？因为复杂 Agent 系统很快会超过一条简单 Loop。

例如一个大型开发任务可能是：

```text
需求分析
├─ 后端设计
│  ├─ API
│  └─ Database
├─ 前端设计
│  ├─ UI
│  └─ State
├─ Tests
└─ Documentation
```

它可能同时具有：

```text
依赖
并行
条件分支
人工审批
失败回退
多个 Agent
共享状态
```

于是用显式 Graph 表达会更加自然：

```text
              ┌→ Backend ─→ Backend Tests ─┐
Requirements ─┤                           ├→ Integration
              └→ Frontend ─→ UI Tests ────┘
                             ↓
                          Review
```

Graph Engineering 关注的问题开始变成：

> **复杂工作中的任务、Agent、信息、依赖和状态应该怎样组织成一个可以观察和演化的整体？**

例如一个节点可能表示：

```text
Task
Agent
State
Artifact
Decision
```

边则可以表示：

```text
depends_on
delegates_to
produces
validates
blocks
```

我们入门阶段先不继续研究 Graph Schema、动态图生成或图执行引擎。

其实只需要知道：

> **当系统从一个 Agent 的执行循环进一步发展到多个任务、多个 Agent、多个状态之间的复杂关系时，Graph 开始成为一种值得考虑的系统组织方式。**

---

## 这五种 Engineering 到底是什么关系

| 概念 | 主要关注的问题 |
| --- | --- |
| **Prompt Engineering** | 怎么把当前要求告诉模型 |
| **Context Engineering** | 当前这一轮应该让模型看到什么 |
| **Harness Engineering** | 模型应该在怎样的运行环境中工作 |
| **Loop Engineering** | Agent 怎样持续行动、观察、修正并停止 |
| **Graph Engineering** | 更复杂系统里的任务、Agent、状态和依赖怎样组织 |

也可以把关注范围理解成逐渐向外扩展：

```text
Prompt → 单次指令
  ↓
Context → 一次推理需要的完整信息
  ↓
Harness → 模型周围的运行系统
  ↓
Loop → 任务随时间不断推进
  ↓
Graph → 多个任务、Agent、状态之间的系统结构
```

但这里一定不要把它理解成严格的历史版本：

```text
Prompt 1.0
Context 2.0
Harness 3.0
Loop 4.0
Graph 5.0
```

**不存在这样的官方路线。** Prompt 今天仍然存在，Context 也不会因为 Harness 出现就消失。Harness 仍然需要设计 Prompt 和 Context，Loop 运行在 Harness 提供的 Tool、State 和环境之上，复杂 Graph 中的每一个 Agent 内部甚至仍然可能拥有自己的 Loop。

---

## 用同一个任务再看一次

还是这个任务：

> 修复 GitHub Issue #128，并确保测试通过。

**Prompt Engineering** 会问：

```text
怎样把目标、要求和输出格式说清楚？
```

**Context Engineering** 会问：

```text
模型当前需要看到哪些文件、Issue、Diff、测试结果和历史信息？
```

**Harness Engineering** 会问：

```text
给 Agent 哪些 Tool？
在哪个工作目录运行？
有什么权限？
怎么保存状态？
怎样执行测试？
```

**Loop Engineering** 会问：

```text
测试失败以后怎么办？
什么时候重新调查？
什么时候 Review？
什么时候处理下一个 Issue？
什么条件满足以后才能结束？
```

**Graph Engineering** 则可能在大型任务里继续问：

```text
Frontend、Backend、Tests 能不能并行？
哪些任务互相依赖？
哪个 Agent 负责哪个节点？
哪个结果必须经过另一个节点验证？
```

这样理解以后，这些看起来很抽象的概念，其实都对应具体的工程问题。

---

## 总结

我们把这几个 Engineering 总结一下：

```text
Prompt Engineering
→ 怎么说

Context Engineering
→ 给模型看什么

Harness Engineering
→ 给模型怎样的工作环境

Loop Engineering
→ 怎样让任务持续推进

Graph Engineering
→ 怎样组织更复杂的系统关系
```

它们共同反映了一件事情：

> **Agent Engineering 的重点正在从“优化模型的一次回答”，逐渐扩展到“设计模型能够长期工作的整个系统”。**

我们下一篇番外会给大家介绍一个越来越常见的 Agent 能力：

> **如果没有 API 和专门 Tool，Agent 能不能直接像人一样看屏幕、点鼠标、操作软件？**

下一篇：

**Computer Use。**

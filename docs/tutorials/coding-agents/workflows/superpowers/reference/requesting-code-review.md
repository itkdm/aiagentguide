---
title: Requesting Code Review 请求代码审查
description: Superpowers 请求代码审查技能：在任务完成、合并前派发代码审查子代理，确保代码质量、符合计划要求且无重大缺陷。
summary: Superpowers 原技能翻译：requesting-code-review。介绍何时请求审查、如何派发审查员，以及审查提示词模板的完整指南。
keywords:
  - Superpowers
  - 代码审查
  - 审查员
  - 子代理
  - 代码质量
  - PR 审查
tags:
  - Superpowers
  - 参考
author: AI Agent Guide
lastUpdated: 2026-06-24
status: published
assets: none
reviewed: true
sourceType: reference
draft: false
noindex: false
---

# requesting-code-review

> 本文为 [Superpowers](https://github.com/obra/superpowers/tree/main/skills/requesting-code-review) 原 skill 文件夹的中文翻译，基于 MIT 协议。原文路径：`skills/requesting-code-review/`。

---

**Skill 元数据**

| 字段 | 内容 |
|------|------|
| 名称 | requesting-code-review |
| 描述 | 在完成任务、实现主要功能或合并前验证工作时使用 |

---

# 请求代码审查

派发代码审查员子代理，在问题级联之前捕获它们。审查员获得精确构造的上下文用于评估——永远不会是你的会话历史。这让审查员专注于工作产出，而不是你的思维过程，并保留你自己的上下文用于继续工作。

**核心原则：** 尽早审查，经常审查。

## 何时请求审查

**必须：**
- 子代理驱动开发中的每个任务之后
- 完成主要功能之后
- 合并到 main 之前

**可选但有价值：**
- 卡住时（新鲜视角）
- 重构之前（基线检查）
- 修复复杂 bug 之后

## 如何请求

**1. 获取 git SHA：**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # 或 origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. 派发代码审查员子代理：**

派发一个 `general-purpose` 子代理，填充 [code-reviewer.md](code-reviewer.md) 的模板

**占位符：**
- `{DESCRIPTION}` — 你构建了什么的简短摘要
- `{PLAN_OR_REQUIREMENTS}` — 它应该做什么
- `{BASE_SHA}` — 起始提交
- `{HEAD_SHA}` — 结束提交

**3. 根据反馈行动：**
- 立即修复 Critical 问题
- 在继续之前修复 Important 问题
- 留意 Minor 问题稍后处理
- 如果审查员错了则反驳（附上理由）

## 示例

```
[刚完成任务 2：添加验证函数]

你：让我在继续之前请求代码审查。

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[派发代码审查员子代理]
  DESCRIPTION: 添加了 verifyIndex() 和 repairIndex()，包含 4 种问题类型
  PLAN_OR_REQUIREMENTS: docs/superpowers/plans/deployment-plan.md 中的任务 2
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[子代理返回]:
  优点：架构干净，真实测试
  问题：
    Important: 缺少进度指示器
    Minor: 魔法数字 (100) 用于报告间隔
  评估: 准备继续

你: [修复进度指示器]
[继续任务 3]
```

## 与工作流集成

**子代理驱动开发：**
- 每个任务之后审查
- 在问题复合之前捕获
- 在进入下一个任务之前修复

**执行计划：**
- 每个任务之后或在自然检查点审查
- 获取反馈，应用，继续

**临时开发：**
- 合并之前审查
- 卡住时审查

## 红旗

**永远不要：**
- 因为"简单"而跳过审查
- 忽略 Critical 问题
- 在 Important 问题未修复的情况下继续
- 与有效的技术反馈争论

**如果审查员错了：**
- 用技术理由反驳
- 展示证明它有效工作的代码/测试
- 请求澄清

参见模板：[code-reviewer.md](code-reviewer.md)

---

## 附录：代码审查员提示词模板

> 翻译自 `skills/requesting-code-review/code-reviewer.md`

在派发代码审查员子代理时使用此模板。

**目的：** 在已完成的工作级联为更多工作之前，对照需求和代码质量标准进行审查。

```
Subagent (general-purpose):
  description: "审查代码变更"
  prompt: |
    你是一位高级代码审查员，专精于软件架构、设计模式和最佳实践。
    你的工作是对照计划或需求审查已完成的工作，在问题级联之前识别问题。

    ## 实现了什么

    [DESCRIPTION]

    ## 需求 / 计划

    [PLAN_OR_REQUIREMENTS]

    ## 要审查的 Git 范围

    **Base:** [BASE_SHA]
    **Head:** [HEAD_SHA]

    ```bash
    git diff --stat [BASE_SHA]..[HEAD_SHA]
    git diff [BASE_SHA]..[HEAD_SHA]
    ```

    ## 只读审查

    你对此 checkout 的审查是只读的。不要以任何方式变更工作树、索引、HEAD 或分支状态。
    使用 `git show`、`git diff` 和 `git log` 等工具检查历史。
    如果你需要不同修订的工作副本，将其 checkout 到单独的临时目录中（例如 `git worktree add /tmp/review-[SHA] [SHA]`）——永远不要在此 checkout 上移动 HEAD。

    ## 检查什么

    **计划对齐：**
    - 实现是否匹配计划/需求？
    - 偏离是合理的改进，还是有问题？
    - 所有计划功能是否都存在？

    **代码质量：**
    - 关注点清晰分离？
    - 正确的错误处理？
    - 适用的地方有类型安全？
    - DRY 而没有过早抽象？
    - 边缘情况已处理？

    **架构：**
    - 设计决策合理？
    - 可接受的扩展性和性能？
    - 安全问题？
    - 与周围代码整洁集成？

    **测试：**
    - 测试验证真实行为，而不是 mock？
    - 边缘情况已覆盖？
    - 重要的地方有集成测试？
    - 所有测试通过？

    **生产就绪：**
    - 如果 schema 变了有迁移策略？
    - 考虑了向后兼容？
    - 文档完整？
    - 没有明显 bug？

    ## 校准

    按实际严重性对问题进行分类。不是所有事情都是 Critical。
    在列出问题之前承认做得好的地方——准确的赞扬有助于实现者信任其余的反馈。

    如果你发现与计划的重大偏离，特别标记它们，以便实现者可以确认偏离是否是有意的。
    如果你发现问题出在计划本身而不是实现上，就说出来。

    ## 输出格式

    ### 优点
    [什么地方做得好？要具体。]

    ### 问题

    #### Critical（必须修复）
    [Bug、安全问题、数据丢失风险、功能损坏]

    #### Important（应该修复）
    [架构问题、缺失功能、错误处理差、测试缺口]

    #### Minor（可以更好）
    [代码风格、优化机会、文档润色]

    对于每个问题：
    - 文件:行 引用
    - 什么问题
    - 为什么它重要
    - 如何修复（如果不明显）

    ### 建议
    [代码质量、架构或流程改进]

    ### 评估

    **准备好合并了吗？** [是 | 否 | 修复后可以]

    **理由：** [1-2 句技术评估]

    ## 关键规则

    **要做：**
    - 按实际严重性分类
    - 要具体（文件:行，不是含糊的）
    - 解释为什么每个问题重要
    - 承认优点
    - 给出明确的裁决

    **不要做：**
    - 没有检查就说"看起来不错"
    - 把 nitpick 标记为 Critical
    - 对你没有真正读过的代码给出反馈
    - 含糊（"改善错误处理"）
    - 避免给出明确的裁决
```

**占位符：**
- `[DESCRIPTION]` — 构建了什么的简短摘要
- `[PLAN_OR_REQUIREMENTS]` — 它应该做什么（计划文件路径、任务文本或需求）
- `[BASE_SHA]` — 起始提交
- `[HEAD_SHA]` — 结束提交

**审查员返回：** 优点、问题（Critical / Important / Minor）、建议、评估

## 示例输出

```
### 优点
- 干净的数据库 schema 配有适当的迁移（db.ts:15-42）
- 全面的测试覆盖（18 个测试，所有边缘情况）
- 良好的错误处理与回退（summarizer.ts:85-92）

### 问题

#### Important
1. **CLI 包装器缺少帮助文本**
   - 文件: index-conversations:1-31
   - 问题: 没有 --help 标志，用户不会发现 --concurrency
   - 修复: 添加 --help 情况附上用法示例

2. **缺少日期验证**
   - 文件: search.ts:25-27
   - 问题: 无效日期静默返回无结果
   - 修复: 验证 ISO 格式，抛出错误附示例

#### Minor
1. **进度指示器**
   - 文件: indexer.ts:130
   - 问题: 没有"X of Y"计数器用于长操作
   - 影响: 用户不知道要等多久

### 建议
- 添加进度报告改善用户体验
- 考虑配置文件用于排除项目（可移植性）

### 评估

**准备好合并: 修复后可以**

**理由:** 核心实现坚实，架构和测试良好。Important 问题（帮助文本、日期验证）容易修复且不影响核心功能。
```

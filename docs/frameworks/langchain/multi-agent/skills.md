---
title: Skills
description: 按需加载专门化提示和知识，让单个 Agent 具备多种可渐进披露的能力
---

# Skills

在 **skills** 架构中，专门化能力会被打包成可调用的“技能（skills）”，用于增强 [agent](/frameworks/langchain/core-components/agents) 的行为。Skill 本质上主要是一种以提示词驱动的专门化能力，Agent 可以在需要时按需加载。

如果你需要 LangChain 官方内置的 skill 支持，可以查看 [Deep Agents](https://docs.langchain.com/oss/python/deepagents/skills)。

> [!TIP]
> 这个模式在概念上和 Agent Skills、`llms.txt` 很接近，核心都是 **渐进披露（progressive disclosure）**。不同之处在于，skills 模式披露的不只是文档，还包括专门化提示和领域知识。

## 关键特征

- 以提示词驱动的专门化：Skill 的核心通常是专门提示和上下文
- 渐进披露：只有在上下文或用户需求相关时才加载
- 团队分工友好：不同团队可以独立开发和维护不同 skills
- 组合成本低：比完整子 Agent 更轻量
- 能引用外部资源：可以指向脚本、模板、资源文件等

## 什么时候适合用

当你希望保留“单 Agent”架构，但又想让它具备很多潜在专门能力时，skills 模式非常适合。

典型场景包括：

- 编码助手：不同语言、不同任务使用不同 skill
- 知识库助手：不同领域使用不同 skill
- 创意助手：不同输出格式或创作风格使用不同 skill

如果你的需求不是强约束的工作流编排，而是“按需注入正确上下文”，skills 往往是很好的选择。

## 基本实现

一个最基本的实现方式，是给 Agent 提供一个 `load_skill` 工具：

```python
from langchain.tools import tool
from langchain.agents import create_agent

@tool
def load_skill(skill_name: str) -> str:
    """加载专门化 skill 提示。

    可用 skills:
    - write_sql: SQL 查询编写专家
    - review_legal_doc: 法律文档审查专家

    返回 skill 的提示和上下文。
    """
    ...

agent = create_agent(
    model="gpt-4.1",
    tools=[load_skill],
    system_prompt=(
        "你是一个有帮助的助手。"
        "你可以使用两个 skill："
        "write_sql 和 review_legal_doc。"
        "需要时请调用 load_skill。"
    ),
)
```

这种方式的思路很简单：

1. 主 Agent 保持通用能力
2. 当任务需要专业知识时，调用 `load_skill`
3. 把 skill 对应的提示与上下文注入进来
4. 再继续完成任务

## 扩展方式

在自定义实现中，你可以把 skills 模式扩展得更强：

### 动态工具注册

你可以把渐进披露和状态管理结合起来，在 skill 加载时动态注册新工具。

例如：

- 加载 `database_admin` skill
- 同时注入数据库运维相关提示
- 再动态开放数据库备份、恢复、迁移等工具

这样，skills 就不只是“加载一段提示词”，还可以动态改变 Agent 的能力边界。

### 分层技能

Skill 还可以组织成树状结构。

例如：

- 加载 `data_science`
- 然后它再暴露 `pandas_expert`
- `visualization`
- `statistical_analysis`

这样可以让大型知识体系更容易管理，因为 Agent 并不需要一开始就看到全部内容，而是随着任务深入逐层展开。

### 引用外部资源

虽然一个 skill 通常只有一个核心提示，但这个提示里完全可以说明：

- 有哪些脚本可用
- 有哪些模板可用
- 有哪些文件应该在什么情况下读取

当这些资源真正相关时，Agent 再去读取它们，从而进一步控制上下文窗口大小。

## 与其他模式的区别

- 和 Subagents 比：Skills 更轻量，重点在“加载上下文”，而不是创建独立执行单元
- 和 Router 比：Skills 没有显式路由图，还是单 Agent 在主导
- 和 Handoffs 比：Skills 不强调状态切换，而强调按需注入专业知识

## 实践建议

- 如果只是需要很多专业提示，而不是复杂编排，优先考虑 Skills。
- Skill 名称和描述要足够清晰，便于 Agent 判断何时加载。
- 不要一次性把所有 skill 内容都塞进主提示，发挥渐进披露的优势。
- 可以把脚本、模板、文档路径放进 skill 中，让 Agent 知道“去哪里找更多细节”。

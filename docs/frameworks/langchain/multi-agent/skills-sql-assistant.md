---
title: 用按需 Skills 构建 SQL 助手
description: 使用渐进披露模式，让 Agent 在需要时加载 SQL 领域技能，而不是预先塞入全部上下文
---

# 用按需 Skills 构建 SQL 助手

这个教程展示如何用 [skills](/frameworks/langchain/multi-agent/skills) 模式构建一个 SQL 助手。核心目标是：**不要一开始就把所有数据库 schema、业务规则、示例查询全部塞进主提示词**，而是在需要时动态加载对应 skill。

这就是渐进披露（progressive disclosure）的价值。

## 工作原理

整体流程通常是：

1. 先定义多个 SQL 领域 skill
2. 让 Agent 拥有一个 `load_skill` 工具
3. 当用户问题进入某个数据库领域时，Agent 先加载对应 skill
4. 再使用 skill 中的 schema、业务规则、示例查询来生成 SQL

这种方式相比一次性灌入全部上下文的优势是：

- 更省上下文窗口
- 路由更清晰
- 更容易维护不同业务域

## Setup

和其他 LangChain 教程一样，通常需要：

- 安装 `langchain`
- 配置 LangSmith（可选但推荐）
- 选择一个可用的聊天模型

## 1. 定义 skills

教程里通常会定义两个领域 skill，例如：

- 面向客户订单分析的 skill
- 面向库存与仓储分析的 skill

每个 skill 一般会包含三类内容：

### 表结构

例如客户订单 skill 里会定义：

- `customers`
- `orders`
- `order_items`

库存 skill 里会定义：

- `products`
- `warehouses`
- `inventory`
- `stock_movements`

### 业务规则

这是 skill 的关键部分。它不仅告诉模型有哪些表，还告诉模型：

- 哪些字段是核心业务字段
- 常见联结关系是什么
- 哪些过滤条件是业务上有意义的
- 哪些口径要优先使用

### 示例查询

每个 skill 还可以带一些典型 SQL 示例，让模型更容易在该领域内生成正确查询。

## 2. 创建 skill 加载工具

下一步是为 Agent 提供 `load_skill` 工具。这个工具负责：

- 按名称加载对应 skill
- 返回该 skill 的文本上下文

例如：

```python
@tool
def load_skill(skill_name: str) -> str:
    """加载某个 SQL 领域 skill。"""
    return SKILLS[skill_name]
```

这样 Agent 不需要预先看到所有 schema，只需要知道“有这么几个可加载 skill”。

## 3. 构建 skill middleware

更完整的做法是使用 middleware，把 skill 加载后的内容注入到模型上下文中。

这个 middleware 通常会：

1. 检查当前是否已经加载过某个 skill
2. 若已加载，则把 skill 内容加入系统提示或消息
3. 若未加载，则先依赖模型调用 `load_skill`

这样后续模型调用就能自动携带相关领域知识。

## 4. 创建支持 skill 的 Agent

最后将这些部分组合成 Agent：

- 模型
- `load_skill` 工具
- skill middleware

得到的 Agent 既保留通用对话能力，又能在需要时快速切换到 SQL 专门模式。

## 5. 测试渐进披露

测试时，可以用一个只涉及某个领域的问题，例如：

- “统计最近 30 天订单金额最高的客户”

理想行为是：

1. Agent 识别这是客户 / 订单域问题
2. 先加载对应 skill
3. 再根据该 skill 中的表结构和业务规则生成 SQL

这就避免了库存相关 schema 平白占用上下文。

## 6. 进阶：通过自定义状态增加约束

教程里还会进一步演示如何通过自定义状态增强控制力。

### 定义自定义状态

例如你可以在状态中增加：

- 当前已加载 skills
- 当前允许访问的数据域
- 当前查询模式

### 更新 `load_skill`

让 `load_skill` 不只是返回文本，还会更新状态，例如记录：

- 哪个 skill 已被加载
- 当前允许使用哪些表

### 创建受约束工具

接着可以创建一个“只允许使用某些 skill 相关表”的 SQL 工具，从而进一步降低模型误用其他领域 schema 的概率。

### 更新 middleware 和 Agent

最后让 middleware 根据状态决定：

- 注入哪些 skill 内容
- 限制哪些工具或参数

这会让整个系统从“只是加载提示”升级到“加载上下文 + 动态约束能力”。

## 实现变体

这个模式还可以继续扩展，例如：

- 与 few-shot prompting 结合
- 使用更复杂的 skill 层级
- 从文件、数据库或远程注册中心加载 skill
- 让 skill 同时提供 schema、示例、模板和安全规则

## 与上下文工程的关系

这个教程本质上就是一个非常典型的上下文工程案例：

- 不是追求把更多信息塞进模型
- 而是追求在对的时机只给模型它真正需要的信息

对于 SQL 助手来说，这一点尤其重要，因为：

- schema 往往很多
- 表和字段命名复杂
- 业务规则通常比 schema 本身更重要

如果一次性全量注入，模型很容易上下文污染或注意力分散。

## 实践建议

- 按业务域拆分 skills，而不是按数据库技术细节拆分。
- 每个 skill 内除了表结构，还要包含关键业务规则和典型查询。
- 让 Agent 先学会“什么时候加载 skill”，再学会“怎么写 SQL”。
- 对生成 SQL 的场景，最好再叠加结构化约束和安全校验。

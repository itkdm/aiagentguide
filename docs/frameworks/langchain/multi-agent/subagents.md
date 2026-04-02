---
title: Subagents
description: 使用主 Agent 统一调度子 Agent，并通过工具形式隔离上下文
---

# Subagents

在 **subagents** 架构中，一个中心主 Agent（通常也叫 supervisor）通过把子 Agent 包装成 [tools](/frameworks/langchain/core-components/tools) 的方式来统一调度它们。主 Agent 决定：

- 调用哪个子 Agent
- 给它什么输入
- 如何组合多个子 Agent 的结果

子 Agent 默认是无状态的，它们不会记住之前交互，所有会话记忆都由主 Agent 维护。这带来的一个重要好处是 **上下文隔离**：每次调用子 Agent 都在一个干净的上下文窗口中执行，避免主对话无限膨胀。

## 关键特征

- 集中控制：所有路由都经过主 Agent
- 子 Agent 不直接面对用户：通常只把结果返回给主 Agent
- 子 Agent 通过工具调用
- 支持并行执行：主 Agent 可以在一轮里调用多个子 Agent

> [!NOTE]
> Supervisor 和 Router 不同。Supervisor 是一个完整 Agent，会跨多轮维护对话上下文并动态决定调度；Router 通常只是一次性的分类分发步骤。

## 什么时候适合用

Subagents 特别适合这些情况：

- 你有多个明显不同的能力域，例如日历、邮件、CRM、数据库
- 子 Agent 不需要直接和用户对话
- 你希望由一个主 Agent 统一编排整个流程

如果你的系统只有少量工具且任务不复杂，通常单 Agent 就够了。

## 基本实现

最核心的模式，就是先创建子 Agent，再把它包装成一个工具供主 Agent 调用：

```python
from langchain.tools import tool
from langchain.agents import create_agent

subagent = create_agent(
    model="anthropic:claude-sonnet-4-20250514",
    tools=[...]
)

@tool("research", description="研究某个主题并返回结论")
def call_research_agent(query: str):
    result = subagent.invoke({
        "messages": [{"role": "user", "content": query}]
    })
    return result["messages"][-1].content

main_agent = create_agent(
    model="anthropic:claude-sonnet-4-20250514",
    tools=[call_research_agent]
)
```

## 设计决策

设计 Subagents 架构时，通常要做几个关键选择：

- 同步还是异步执行
- 每个子 Agent 单独一个工具，还是统一 dispatch 工具
- 子 Agent 的说明信息怎么暴露给主 Agent
- 子 Agent 输入什么上下文
- 子 Agent 返回什么结果给主 Agent

## 同步 vs 异步

### 同步

默认情况下，子 Agent 调用是同步的，也就是主 Agent 会等待子 Agent 完成后再继续。

适合：

- 主 Agent 后续步骤依赖子 Agent 结果
- 存在强顺序依赖
- 子 Agent 失败应阻塞主流程

优点是简单，缺点是长任务会阻塞整个对话。

### 异步

如果子 Agent 执行的是独立任务，主 Agent 不需要立刻拿到结果，就可以用异步后台任务模式。

常见实现通常是“三工具模式”：

1. 启动任务
2. 查询状态
3. 获取结果

适合：

- 用户不需要一直等待
- 多个任务可以后台并发跑
- 任务持续时间较长

## 工具模式

### 每个子 Agent 一个工具

这是最直观的方式。每个子 Agent 都对应一个独立工具，主 Agent 根据工具描述来决定调用谁。

优点：

- 粒度清晰
- 每个子 Agent 可以独立定制输入输出

缺点：

- 子 Agent 变多后，工具数量会快速增长

### 单一 dispatch 工具

另一种方式是只暴露一个统一的 `task` 工具，参数中包含：

- `agent_name`
- `description`

主 Agent 通过这个统一入口去调用不同子 Agent。

这种方式适合：

- 子 Agent 数量很多
- 不同团队分别维护不同子 Agent
- 你偏好“约定优于配置”

示例：

```python
from langchain.tools import tool
from langchain.agents import create_agent

research_agent = create_agent(
    model="gpt-4.1",
    prompt="你是一个研究专家……"
)

writer_agent = create_agent(
    model="gpt-4.1",
    prompt="你是一个写作专家……"
)

SUBAGENTS = {
    "research": research_agent,
    "writer": writer_agent,
}

@tool
def task(agent_name: str, description: str) -> str:
    """为某个任务启动一个临时子 Agent。"""
    agent = SUBAGENTS[agent_name]
    result = agent.invoke({
        "messages": [{"role": "user", "content": description}]
    })
    return result["messages"][-1].content
```

## 上下文工程

Subagents 架构真正的关键在于：**主 Agent 和子 Agent 之间如何流动上下文**。

主要有三个层面：

1. 子 Agent 规格（specs）
2. 子 Agent 输入
3. 子 Agent 输出

### 子 Agent 规格

子 Agent 的名称和描述，是主 Agent 判断“什么时候该调用它”的主要依据。

要点：

- 名称应清晰、可动作化，例如 `research_agent`、`code_reviewer`
- 描述应明确说明它擅长做什么，以及什么时候该调用它

如果你采用单 dispatch 工具，还需要告诉主 Agent “当前可用子 Agent 有哪些”。这通常有三种方式：

- 写进 system prompt
- 用 enum 限制 `agent_name`
- 通过单独工具动态发现可用 Agent

### 子 Agent 输入

子 Agent 不一定只接收用户 query。你也可以从主 Agent 的 state 中提取：

- 完整消息历史
- 上一步结果
- 任务元数据
- 其他共享状态字段

例如：

```python
@tool("subagent1_name", description="subagent1_description")
def call_subagent1(query: str, runtime: ToolRuntime[None, CustomState]):
    subagent_input = some_logic(query, runtime.state["messages"])
    result = subagent1.invoke({
        "messages": subagent_input,
        "example_state_key": runtime.state["example_state_key"]
    })
    return result["messages"][-1].content
```

### 子 Agent 输出

你需要明确主 Agent 从子 Agent 那里拿回什么。

常见策略：

1. 通过提示词约束子 Agent 的最终输出形式
2. 在代码中对返回值再加工

有时你还需要返回 `Command`，一次性把更多状态字段传回主 Agent，而不只是传最终文本。

## Checkpoint 与状态可见性

默认情况下，子 Agent 通常继承上层 checkpointer，但每次调用仍从新状态开始，因此：

- 支持 interrupts
- 支持并行安全运行
- 不天然持有自己的长期对话历史

如果你希望某个子 Agent 在多次调用间保留自己的持久状态，则需要显式为它启用相应持久化模式。

## 实践建议

- 当你需要中心化控制和上下文隔离时，优先考虑 Subagents。
- 如果子 Agent 数量不多，用“每个子 Agent 一个工具”通常最清晰。
- 如果子 Agent 数量会持续增长，考虑单 dispatch 工具。
- 主 Agent 看到什么、子 Agent 看到什么、返回什么，必须单独设计，不要默认全量透传。

---
title: Middleware 概览
description: 想了解 LangChain middleware 是什么、什么时候该用中间件控制 Agent 行为、怎样插入日志重试和 guardrails，可以先看这页。
keywords:
  - LangChain middleware 是什么
  - LangChain middleware 适合哪些场景
  - LangChain middleware 怎么控制 Agent 行为
  - LangChain middleware 怎么做日志和重试
  - LangChain middleware 和 guardrails 什么关系
lastUpdated: 2026-05-30
status: published
---

# Middleware 概览

Middleware 提供了一种更细粒度控制 Agent 内部执行流程的方式。它适合用于以下场景：

- 通过日志、分析和调试追踪 Agent 行为
- 改写 prompt、工具选择和输出格式
- 增加重试、fallback 和提前终止逻辑
- 加入限流、guardrails、PII 检测等控制能力

### Python

```python
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware, HumanInTheLoopMiddleware

agent = create_agent(
    model="gpt-4.1",
    tools=[...],
    middleware=[
        SummarizationMiddleware(...),
        HumanInTheLoopMiddleware(...),
    ],
)
```

## Agent loop

Agent 的核心循环通常包括：

1. 调用模型
2. 让模型决定是否需要调用工具
3. 执行工具
4. 回到模型继续推理
5. 当不再需要工具时结束

Middleware 就是在这些关键步骤的前后暴露 hook，让你可以插入自己的逻辑。

常见可以介入的阶段包括：

- Agent 启动前
- 模型调用前
- 模型返回后
- 工具调用前后
- Agent 结束后

## 额外资源

- 内建 middleware：适合常见场景，开箱即用
- 自定义 middleware：适合需要精细控制执行流的场景
- Middleware API reference
- 使用 LangSmith 测试 Agent

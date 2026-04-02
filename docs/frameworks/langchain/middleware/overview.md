---
title: Middleware 概览
description: 在 Agent 执行的每一步控制并定制行为
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

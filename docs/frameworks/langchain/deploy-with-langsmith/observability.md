---
title: LangSmith Observability
description: 为 LangChain Agent 启用 LangSmith tracing，并观察执行过程
---

# LangSmith Observability

在构建和运行 LangChain Agent 时，你需要知道它到底做了什么：

- 调用了哪些工具
- 生成了什么 prompt
- 为什么会走某条路径

LangChain Agent 通过 `create_agent` 构建时，天然支持接入 LangSmith tracing。LangSmith 是一个用于捕获、调试、评估和监控 LLM 应用行为的平台。

## 为什么需要 Observability

LangSmith 中的 traces 会记录 Agent 执行全过程，包括：

- 用户输入
- 模型调用
- 工具调用
- 决策节点
- 最终回答

这能帮助你：

- 调试问题
- 对比不同输入下的表现
- 观察生产中的使用模式

## 前置条件

开始之前需要：

- 一个 LangSmith 账号
- 一个 LangSmith API Key

## 启用 tracing

LangChain Agent 默认已经支持 tracing，只需要设置环境变量：

```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=<your-api-key>
```

## Quickstart

启用环境变量后，正常运行你的 Agent 代码即可，所有执行步骤会自动记录到 LangSmith：

```python
from langchain.agents import create_agent

def send_email(to: str, subject: str, body: str):
    return f"邮件已发送到 {to}"

def search_web(query: str):
    return f"搜索结果：{query}"

agent = create_agent(
    model="gpt-4.1",
    tools=[send_email, search_web],
    system_prompt="你是一个可以发邮件和搜索网页的助手。"
)

response = agent.invoke({
    "messages": [
        {
            "role": "user",
            "content": "搜索最新 AI 新闻，并把摘要发给 john@example.com"
        }
    ]
})
```

默认 trace 会记录到名为 `default` 的项目中。如需自定义项目名，可以在 LangSmith 里进一步配置。

## 使用建议

- 开发阶段尽量默认开启 tracing。
- 对复杂 Agent，优先在 LangSmith 中看 prompt、工具调用和状态变化。
- 把 Observability 当成 Agent 工程的一部分，而不是可选附加项。

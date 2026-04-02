---
title: Human-in-the-loop
description: 为 Agent 工具调用增加人工审核、中断与恢复执行能力
---

# Human-in-the-loop

Human-in-the-Loop（HITL）middleware 允许你为 Agent 的工具调用加入人工监督。当模型提出的动作可能需要审核时，例如写文件、执行 SQL、删除数据等，中间件可以暂停执行并等待人工决策。

它的工作方式是：检查每个工具调用是否命中你配置的策略。如果需要人工介入，中间件会发出 @[interrupt] 中断，停止当前执行。图状态会通过 LangGraph 的持久化机制保存下来，因此可以安全暂停，并在稍后恢复。

人工随后可以做出三种决策：

- `approve`：按原样批准并执行
- `edit`：修改工具调用后再执行
- `reject`：拒绝执行，并把反馈加入对话

## 中断决策类型

| 决策类型 | 说明 | 示例 |
| --- | --- | --- |
| `approve` | 原样批准并执行该动作 | 直接发送邮件草稿 |
| `edit` | 修改参数后再执行 | 先改收件人再发邮件 |
| `reject` | 拒绝执行，并附带解释 | 拒绝危险 SQL，并说明原因 |

如果一次中断中包含多个工具调用，则每个动作都需要单独给出决策，并且决策顺序必须与中断请求中的动作顺序一致。

> [!TIP]
> 当你使用 `edit` 修改工具参数时，建议只做保守修改。对原参数做过大调整，可能会导致模型重新评估路径，甚至重复执行工具。

## 配置中断

要使用 HITL，需要在创建 Agent 时把该中间件加入 `middleware` 列表：

```python
from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    model="gpt-4.1",
    tools=[write_file_tool, execute_sql_tool, read_data_tool],
    middleware=[
        HumanInTheLoopMiddleware(
            interrupt_on={
                "write_file": True,
                "execute_sql": {"allowed_decisions": ["approve", "reject"]},
                "read_data": False,
            },
            description_prefix="工具执行等待审批",
        ),
    ],
    checkpointer=InMemorySaver(),
)
```

这里的含义是：

- `write_file`：所有决策都允许
- `execute_sql`：只允许 `approve` 和 `reject`
- `read_data`：安全操作，不需要审核

> [!INFO]
> HITL 必须配置 checkpointer，才能在中断时保存图状态。生产环境里应使用持久化 checkpointer，例如 `AsyncPostgresSaver`；原型或测试可以使用 `InMemorySaver`。

此外，调用 Agent 时应在 `config` 中传入 `thread_id`，这样执行才能和某个会话线程绑定起来，支持暂停和恢复。

## 响应中断

Agent 执行时，会一直运行到：

- 正常完成
- 或遇到命中策略的工具调用并触发中断

使用 `version="v2"` 时，返回值中会包含 `interrupts`，里面记录了待审核动作。你可以把这些动作展示给审核者，然后在收集到决策后恢复执行。

```python
from langgraph.types import Command

config = {"configurable": {"thread_id": "some_id"}}

result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "删除数据库中的旧记录",
            }
        ]
    },
    config=config,
    version="v2",
)

print(result.interrupts)

agent.invoke(
    Command(
        resume={"decisions": [{"type": "approve"}]}
    ),
    config=config,
    version="v2",
)
```

## 三种决策方式

### `approve`

直接批准工具调用，不做修改：

```python
agent.invoke(
    Command(
        resume={
            "decisions": [
                {"type": "approve"}
            ]
        }
    ),
    config=config,
    version="v2",
)
```

### `edit`

修改工具调用再执行：

```python
agent.invoke(
    Command(
        resume={
            "decisions": [
                {
                    "type": "edit",
                    "edited_action": {
                        "name": "new_tool_name",
                        "args": {"key1": "new_value", "key2": "original_value"},
                    }
                }
            ]
        }
    ),
    config=config,
    version="v2",
)
```

### `reject`

拒绝执行，并附带反馈说明：

```python
agent.invoke(
    Command(
        resume={
            "decisions": [
                {
                    "type": "reject",
                    "message": "这个操作不合适，请改为只查询最近 30 天的数据。",
                }
            ]
        }
    ),
    config=config,
    version="v2",
)
```

这个 `message` 会作为反馈加入对话，帮助 Agent 理解为什么该动作被拒绝，以及下一步应该怎么做。

## 多个决策同时处理

当一次中断里有多个动作待审核时，需要按顺序提供对应决策：

```python
{
    "decisions": [
        {"type": "approve"},
        {
            "type": "edit",
            "edited_action": {
                "name": "tool_name",
                "args": {"param": "new_value"}
            }
        },
        {
            "type": "reject",
            "message": "这个动作不被允许"
        }
    ]
}
```

## 结合流式输出

你也可以使用 `stream()` 而不是 `invoke()`，在 Agent 执行过程中实时接收更新，并在遇到中断时处理审核。

```python
from langgraph.types import Command

config = {"configurable": {"thread_id": "some_id"}}

for chunk in agent.stream(
    {"messages": [{"role": "user", "content": "删除数据库中的旧记录"}]},
    config=config,
    stream_mode=["updates", "messages"],
    version="v2",
):
    if chunk["type"] == "messages":
        token, metadata = chunk["data"]
        if token.content:
            print(token.content, end="", flush=True)
    elif chunk["type"] == "updates":
        if "__interrupt__" in chunk["data"]:
            print(f"\n\n中断：{chunk['data']['__interrupt__']}")
```

审核通过后，还可以继续以流式模式恢复执行。

## 执行生命周期

HITL middleware 的核心是在 `after_model` 钩子中工作：

1. Agent 调用模型生成响应。
2. 中间件检查响应中是否包含工具调用。
3. 如果某些工具调用需要人工审核，则构建 `HITLRequest` 并调用 @[interrupt]。
4. Agent 等待人工决策。
5. 中间件根据 `HITLResponse` 决策执行批准或编辑后的调用，或者为拒绝动作生成 @[ToolMessage]，然后继续运行。

## 自定义 HITL 逻辑

如果你需要更特殊的人工审核流程，也可以直接基于 @[interrupt] 原语和 [middleware](/frameworks/langchain/middleware/overview) 自己实现。

适合自定义的场景包括：

- 需要更复杂的审批流程
- 需要和外部审批系统集成
- 希望不同工具走不同审核链路

## 最佳实践

- 对高风险工具默认启用 HITL，例如写文件、执行 SQL、转账、删除数据。
- 一定使用持久化 checkpointer，确保中断后可恢复。
- 为审核 UI 清晰展示工具名、参数和风险说明。
- `edit` 只做保守修改，避免让模型重复规划。
- 所有恢复操作都必须使用相同的 `thread_id`。

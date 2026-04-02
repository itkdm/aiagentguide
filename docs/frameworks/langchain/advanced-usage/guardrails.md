---
title: Guardrails
description: 为 Agent 实现安全检查与内容过滤
---

# Guardrails

Guardrails 用于在 Agent 执行的关键节点验证和过滤内容，从而帮助你构建更安全、更合规的 AI 应用。

它们可以用于：

- 检测敏感信息
- 执行内容策略
- 校验输出格式和质量
- 阻止不安全行为在造成实际影响前发生

常见场景包括：

- 防止 PII 泄露
- 检测并拦截 prompt injection
- 阻止不当或有害内容
- 执行业务规则与合规要求
- 验证输出质量和准确性

你可以借助 [middleware](/frameworks/langchain/middleware/overview) 在 Agent 执行流中的关键阶段插入 guardrails，例如：

- Agent 启动前
- Agent 执行结束后
- 模型调用前后
- 工具调用前后

Guardrails 通常可以分为两类：

- **确定性 guardrails**：使用正则、关键词匹配、显式规则等方式。速度快、成本低、行为稳定，但可能漏掉更隐晦的问题。
- **基于模型的 guardrails**：使用 LLM 或分类器进行语义判断。能发现规则难以覆盖的问题，但速度更慢、成本更高。

LangChain 同时提供：

- 内建 guardrails，例如 PII detection、human-in-the-loop
- 通用 middleware 机制，用于构建自定义 guardrails

## 内建 guardrails

### PII detection

LangChain 提供了内建 middleware，用于检测和处理对话中的 Personally Identifiable Information（PII）。

它可以检测常见的 PII 类型，例如：

- 邮箱地址
- 信用卡号
- IP 地址
- MAC 地址
- URL

这类 middleware 很适合：

- 医疗和金融等有合规要求的应用
- 需要清洗日志的客服 Agent
- 任何处理敏感用户数据的系统

PII 检测支持多种处理策略：

| 策略 | 说明 | 示例 |
|---|---|---|
| `redact` | 替换为占位符 | `[REDACTED_EMAIL]` |
| `mask` | 部分打码 | `****-****-****-1234` |
| `hash` | 替换为可重复的哈希值 | `a8f5f167...` |
| `block` | 直接抛出异常并阻止继续执行 | Error |

### Python

```python
from langchain.agents import create_agent
from langchain.agents.middleware import PIIMiddleware

agent = create_agent(
    model="gpt-4.1",
    tools=[customer_service_tool, email_tool],
    middleware=[
        PIIMiddleware(
            "email",
            strategy="redact",
            apply_to_input=True,
        ),
        PIIMiddleware(
            "credit_card",
            strategy="mask",
            apply_to_input=True,
        ),
        PIIMiddleware(
            "api_key",
            detector=r"sk-[a-zA-Z0-9]{32}",
            strategy="block",
            apply_to_input=True,
        ),
    ],
)
```

### Human-in-the-loop

LangChain 还提供了 human-in-the-loop middleware，用于在敏感操作执行前要求人工审批。

它特别适合：

- 金融转账
- 删除或修改生产数据
- 对外发送邮件或消息
- 任何高风险业务动作

### Python

```python
from langchain.agents import create_agent
from langchain.agents.middleware import HumanInTheLoopMiddleware
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command

agent = create_agent(
    model="gpt-4.1",
    tools=[search_tool, send_email_tool, delete_database_tool],
    middleware=[
        HumanInTheLoopMiddleware(
            interrupt_on={
                "send_email": True,
                "delete_database": True,
                "search": False,
            }
        ),
    ],
    checkpointer=InMemorySaver(),
)

config = {"configurable": {"thread_id": "some_id"}}

result = agent.invoke(
    {"messages": [{"role": "user", "content": "给团队发一封邮件"}]},
    config=config
)

result = agent.invoke(
    Command(resume={"decisions": [{"type": "approve"}]}),
    config=config
)
```

## 自定义 guardrails

对于更复杂的安全控制，你可以通过自定义 middleware 构建 guardrails。

### Before agent guardrails

这类 guardrail 在每次调用开始时只运行一次，适合：

- 鉴权
- 请求级限流
- 在任何处理开始前拦截明显违规请求

### Python

```python
from typing import Any
from langchain.agents.middleware import AgentMiddleware, AgentState, hook_config
from langgraph.runtime import Runtime

class ContentFilterMiddleware(AgentMiddleware):
    """确定性 guardrail：拦截包含敏感关键词的请求。"""

    def __init__(self, banned_keywords: list[str]):
        super().__init__()
        self.banned_keywords = [kw.lower() for kw in banned_keywords]

    @hook_config(can_jump_to=["end"])
    def before_agent(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        if not state["messages"]:
            return None

        first_message = state["messages"][0]
        if first_message.type != "human":
            return None

        content = first_message.content.lower()

        for keyword in self.banned_keywords:
            if keyword in content:
                return {
                    "messages": [{
                        "role": "assistant",
                        "content": "我不能处理包含不当内容的请求，请换一种说法。"
                    }],
                    "jump_to": "end"
                }
        return None
```

### After agent guardrails

这类 guardrail 会在 Agent 最终输出生成后执行，适合：

- 最终内容安全审查
- 输出质量校验
- 最终合规扫描

### Python

```python
from langchain.agents.middleware import AgentMiddleware, AgentState, hook_config
from langgraph.runtime import Runtime
from langchain.messages import AIMessage
from langchain.chat_models import init_chat_model
from typing import Any

class SafetyGuardrailMiddleware(AgentMiddleware):
    """基于模型的 guardrail：用另一个模型评估输出是否安全。"""

    def __init__(self):
        super().__init__()
        self.safety_model = init_chat_model("gpt-4.1-mini")

    @hook_config(can_jump_to=["end"])
    def after_agent(self, state: AgentState, runtime: Runtime) -> dict[str, Any] | None:
        if not state["messages"]:
            return None

        last_message = state["messages"][-1]
        if not isinstance(last_message, AIMessage):
            return None

        safety_prompt = f"""判断下面这段回答是否安全且合适。
只返回 SAFE 或 UNSAFE。

回答：{last_message.content}"""

        result = self.safety_model.invoke([{"role": "user", "content": safety_prompt}])

        if "UNSAFE" in result.content:
            last_message.content = "我不能提供这个回答，请换个问题。"

        return None
```

### 组合多个 guardrails

你可以把多个 guardrails 叠加到同一个 middleware 数组中，形成分层防护。

典型顺序可以是：

1. 输入级规则拦截
2. PII 清洗
3. Human-in-the-loop 审批
4. 输出级模型安全审查

### Python

```python
from langchain.agents import create_agent
from langchain.agents.middleware import PIIMiddleware, HumanInTheLoopMiddleware

agent = create_agent(
    model="gpt-4.1",
    tools=[search_tool, send_email_tool],
    middleware=[
        ContentFilterMiddleware(banned_keywords=["hack", "exploit"]),
        PIIMiddleware("email", strategy="redact", apply_to_input=True),
        PIIMiddleware("email", strategy="redact", apply_to_output=True),
        HumanInTheLoopMiddleware(interrupt_on={"send_email": True}),
        SafetyGuardrailMiddleware(),
    ],
)
```

## Additional resources

- [Middleware documentation](/frameworks/langchain/middleware/overview)
- Middleware API reference
- [Human-in-the-loop](/frameworks/langchain/advanced-usage/human-in-the-loop)
- [Testing agents](https://docs.langchain.com/oss/python/langchain/test)

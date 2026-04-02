---
title: Integration testing
description: 使用真实 LLM API 测试 Agent，并处理凭证、波动性、耗时与成本问题。
---

# Integration testing

集成测试会调用真实模型 API 和外部服务，用于确认 Agent 在真实环境中可以正常工作。和单元测试不同，它不依赖假对象，而是验证整个链路是否真的打通。

## 集成测试关注什么

- 模型凭证是否有效
- 工具调用与参数 schema 是否匹配
- 外部服务是否可以正常联通
- 真实响应延迟是否在可接受范围内
- Agent 在非确定性输出下是否仍能满足基本结构要求

## 把单元测试和集成测试分开

集成测试更慢，也更贵，所以不要和单元测试混在一起跑。

Python 常见做法是给集成测试打 marker：

```python
import pytest

@pytest.mark.integration
def test_agent_with_real_model():
    result = agent.invoke({
        "messages": [{"role": "user", "content": "帮我查询北京天气"}]
    })
    assert len(result["messages"]) > 1
```

## 管理 API Key

集成测试一定要通过环境变量加载凭证，不要把 Key 写进仓库。

```bash
OPENAI_API_KEY=sk-...
```

在本地可以通过 `.env` 管理，在 CI 中通过密钥管理系统注入。

## 断言结构，不要过度断言文案

LLM 响应天然有波动，所以集成测试不要过度依赖“完全一致的字符串输出”。更可靠的是断言这些结构性特征：

- 是否产生了 `AIMessage`
- 是否调用了指定工具
- 工具参数是否符合预期
- 最终消息是否非空

```python
tool_calls = [
    tc
    for msg in result["messages"]
    if hasattr(msg, "tool_calls")
    for tc in (msg.tool_calls or [])
]

assert any(tc["name"] == "get_weather" for tc in tool_calls)
```

## 控制成本和耗时

集成测试会真实计费，建议：

- 使用更便宜、更快的模型做测试
- 限制输出长度，例如设置 `max_tokens`
- 一次测试只验证一个行为
- 只在 CI、发版前或关键改动时运行

## 记录与回放 HTTP 调用

如果某些集成测试需要频繁运行，可以考虑记录第一次真实调用，再在后续测试中回放响应。Python 里常见做法是 `vcrpy` 或 `pytest-recording`。

这样可以降低成本，也能减少外部 API 波动对测试结果的影响。

## 下一步

当你已经确认 Agent 能在真实环境下正常工作后，可以继续看[评估](/frameworks/langchain/agent-development/test/evals)，用更系统的方法衡量 Agent 的轨迹和质量。

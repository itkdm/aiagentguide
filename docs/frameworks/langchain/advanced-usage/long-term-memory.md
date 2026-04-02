---
title: 长期记忆
description: 为 LangChain Agent 添加跨会话、跨线程持久存在的长期记忆
---

# 长期记忆

长期记忆让 Agent 能在不同对话和不同会话之间存储与回忆信息。它和 [短期记忆](/frameworks/langchain/core-components/short-term-memory) 的区别在于：

- 短期记忆只作用于单个线程
- 长期记忆可以跨线程、跨会话持续存在

长期记忆建立在 [LangGraph stores](https://docs.langchain.com/oss/python/langgraph/persistence#memory-store) 之上，数据以 JSON 文档形式保存，并按 namespace 和 key 组织。

## 使用方式

要给 Agent 增加长期记忆，先创建一个 store，然后把它传给 `create_agent`：

```python
from langchain.agents import create_agent
from langgraph.store.memory import InMemoryStore

store = InMemoryStore()

agent = create_agent(
    model="gpt-4.1",
    tools=[...],
    store=store,
)
```

如果你想在生产环境使用持久化存储，也可以换成 PostgreSQL 等后端。

工具随后就可以通过 `runtime.store` 读取和写入长期记忆。

> [!TIP]
> 如果你想深入理解语义记忆、情节记忆、程序性记忆等概念，以及应该如何写入长期记忆，可以阅读 [Memory 概念指南](https://docs.langchain.com/oss/python/concepts/memory#long-term-memory)。

## 记忆存储结构

LangGraph 会把长期记忆保存为 JSON 文档。每条记忆通常由两部分定位：

- `namespace`：类似文件夹，用于分组
- `key`：类似文件名，用于唯一标识某条记录

常见的命名方式会把用户 ID、组织 ID 或其他业务标签放进 namespace 中，以便更好地组织和检索数据。

这种结构支持：

- 分层组织记忆
- 基于内容过滤做跨 namespace 搜索

## 在工具中读取长期记忆

工具可以直接通过 `runtime.store` 读取之前保存的长期信息。

例如，读取用户偏好：

```python
from dataclasses import dataclass
from langchain.tools import tool, ToolRuntime

@dataclass
class Context:
    user_id: str

@tool
def get_preference(preference_key: str, runtime: ToolRuntime[Context]) -> str:
    user_id = runtime.context.user_id
    store = runtime.store
    existing_prefs = store.get(("preferences",), user_id)

    if existing_prefs:
        value = existing_prefs.value.get(preference_key)
        return f"{preference_key}: {value}" if value else f"{preference_key} 尚未设置"
    else:
        return "未找到任何偏好设置"
```

这类模式很适合：

- 读取用户沟通风格
- 读取语言偏好
- 读取业务配置
- 读取历史事实信息

## 在工具中写入长期记忆

工具同样可以把新信息写回 store，供未来会话继续使用。

例如，保存用户偏好：

```python
from dataclasses import dataclass
from langchain.tools import tool, ToolRuntime

@dataclass
class Context:
    user_id: str

@tool
def save_preference(
    preference_key: str,
    preference_value: str,
    runtime: ToolRuntime[Context]
) -> str:
    user_id = runtime.context.user_id

    store = runtime.store
    existing_prefs = store.get(("preferences",), user_id)

    prefs = existing_prefs.value if existing_prefs else {}
    prefs[preference_key] = preference_value

    store.put(("preferences",), user_id, prefs)

    return f"已保存偏好：{preference_key} = {preference_value}"
```

这类写入很适合：

- 保存用户个人偏好
- 记录历史事实
- 提取长期稳定的画像信息
- 跨会话保留工作上下文

## 设计建议

在使用长期记忆时，建议先明确这些问题：

- 哪些信息值得长期保留，而不是只放在当前线程？
- 这些信息应该按什么 namespace 组织？
- 写入是每次都发生，还是在置信度足够高时才写？
- 读取时是否需要做过滤、排序或多源合并？

长期记忆并不是“把所有内容都永久存起来”，而是有选择地保留那些对未来轮次确实有帮助的信息。

## 最佳实践

- 把长期记忆和短期记忆分开设计，不要混用。
- namespace 设计要稳定且可扩展，通常包含用户或组织标识。
- 只写入对后续对话真正有价值的信息。
- 对用户偏好这类长期数据，读取时尽量放在工具层或 middleware 层统一处理。
- 生产环境优先使用持久化 store，而不是内存版。

## 相关资源

- [Short-term memory](/frameworks/langchain/core-components/short-term-memory)
- [Memory 概念指南](https://docs.langchain.com/oss/python/concepts/memory#long-term-memory)
- [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence#memory-store)

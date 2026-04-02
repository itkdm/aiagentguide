---
title: 用 Router 构建多源知识库
description: 将查询分发到 GitHub、Notion、Slack 等多个专门 Agent，并并行综合结果
---

# 用 Router 构建多源知识库

这个教程展示如何使用 [router](/frameworks/langchain/multi-agent/router) 模式，构建一个多源知识库系统。核心思想是：

1. 先分析用户问题
2. 判断应该查询哪些知识源
3. 为每个知识源生成更贴合该领域的子问题
4. 并行调用各自的 Agent
5. 最后把结果综合成一个统一答案

示例系统中有三个专门 Agent：

- GitHub Agent：搜索代码、Issue、PR
- Notion Agent：搜索内部文档和 Wiki
- Slack Agent：搜索讨论串和团队交流记录

例如用户问：

- “How do I authenticate API requests?”

系统就可以把它拆成不同来源的针对性查询，并行执行后再综合。

## 为什么用 Router

Router 模式的优势主要在于：

- 并行执行：多个来源可以同时查，减少总延迟
- 专门化 Agent：每个来源拥有自己的工具和提示词
- 选择性路由：不是所有问题都需要查询所有来源
- 有针对性的子问题：每个来源看到的问题是为它量身定制的
- 干净的综合输出：多来源结果最终汇总成单一回答

## 1. 定义状态

这个工作流通常会用三个层级的状态：

- `AgentInput`：传给每个子 Agent 的简单输入
- `AgentOutput`：每个子 Agent 返回的结果
- `RouterState`：主流程状态，保存原始问题、分类结果、并行返回结果和最终答案

例如：

```python
from typing import Annotated, Literal, TypedDict
import operator

class AgentInput(TypedDict):
    query: str

class AgentOutput(TypedDict):
    source: str
    result: str

class Classification(TypedDict):
    source: Literal["github", "notion", "slack"]
    query: str

class RouterState(TypedDict):
    query: str
    classifications: list[Classification]
    results: Annotated[list[AgentOutput], operator.add]
    final_answer: str
```

这里 `results` 使用 reducer 来合并多个并行节点返回的结果。

## 2. 为每个垂直领域定义工具

在真实系统里，这些工具会调用真实 API。教程里通常会用 stub 工具演示，例如：

- GitHub：`search_code`、`search_issues`、`search_prs`
- Notion：`search_notion`、`get_page`
- Slack：`search_slack`、`get_thread`

这些工具分别代表三个知识域的不同查询能力。

## 3. 创建专门 Agent

然后为每个知识域创建一个专门 Agent，每个 Agent 都有：

- 自己的工具集合
- 自己的 system prompt

例如：

```python
github_agent = create_agent(
    model,
    tools=[search_code, search_issues, search_prs],
    system_prompt=(
        "你是 GitHub 专家。请通过搜索仓库、Issue 和 PR，回答有关代码、API 和实现细节的问题。"
    ),
)
```

Notion Agent 和 Slack Agent 同理，只是工具和提示词各自围绕自己的来源进行优化。

## 4. 构建 Router 工作流

整个 Router workflow 一般包含四个主要步骤：

1. `classify`：分析用户问题，决定要调用哪些 Agent，以及给它们什么子问题
2. `route`：使用 `Send` 把任务并行分发出去
3. `query agents`：各个 Agent 执行查询并返回结果
4. `synthesize`：把所有结果综合成统一答案

### 分类步骤

分类步骤通常会使用一个更轻量模型，并配合结构化输出 schema：

```python
class ClassificationResult(BaseModel):
    classifications: list[Classification]

def classify_query(state: RouterState) -> dict:
    structured_llm = router_llm.with_structured_output(ClassificationResult)
    result = structured_llm.invoke([...])
    return {"classifications": result.classifications}
```

这里的关键不是简单判断“去哪个来源”，而是要为每个来源生成**最适合该来源的子问题**。

例如对于“如何做 API 认证”：

- GitHub 子问题可能偏代码与中间件实现
- Notion 子问题可能偏认证文档和内部规范
- Slack 子问题可能偏团队历史讨论和实践建议

### 并行路由

得到分类结果后，可以用 `Send` 把任务并行扇出：

```python
def route_to_agents(state: RouterState) -> list[Send]:
    return [
        Send(c["source"], {"query": c["query"]})
        for c in state["classifications"]
    ]
```

### 查询各个 Agent

每个 Agent 节点只接收简单输入，然后返回统一结构：

```python
def query_github(state: AgentInput) -> dict:
    result = github_agent.invoke({
        "messages": [{"role": "user", "content": state["query"]}]
    })
    return {"results": [{"source": "github", "result": result["messages"][-1].content}]}
```

Notion 和 Slack 节点同理。

### 综合结果

最后把所有来源返回结果交给综合步骤：

```python
def synthesize_results(state: RouterState) -> dict:
    if not state["results"]:
        return {"final_answer": "没有从任何知识源找到结果。"}
    ...
```

综合阶段通常负责：

- 去重
- 抽取最相关内容
- 识别来源间不一致
- 组织成清晰回答

## 关键设计点

这个 Router 模式最有价值的地方，不只是“并行查多个源”，而是：

- 路由前先做问题拆解
- 每个来源都拿到最适合自己的子问题
- 最后由统一逻辑重新合成

这让它比“把同一个问题直接丢给所有 Agent”更高效，也更容易得到高质量结果。

## Stateless 与 Stateful

教程里构建的 Router 通常是 **无状态** 的，也就是每次调用都独立处理。

如果你希望支持多轮对话，最简单的方式通常不是让 Router 自己变有状态，而是把它包装成一个工具，让外层会话型 Agent 去调用：

```python
@tool
def search_knowledge_base(query: str) -> str:
    result = workflow.invoke({"query": query})
    return result["final_answer"]
```

这样：

- Router 仍然保持简单
- 会话上下文由上层 Agent 维护
- 用户可以进行多轮追问

## 什么时候用这个模式

Router 模式特别适合：

- 多个独立知识源
- 需要并行查询降低延迟
- 需要清晰、可控的路由逻辑
- 需要对多个结果做统一综合

如果你需要更动态的多轮调度，可以考虑：

- [Subagents](/frameworks/langchain/multi-agent/subagents)
- [Handoffs](/frameworks/langchain/multi-agent/handoffs)

## 实践建议

- 路由模型和执行模型可以分开，前者用更轻更便宜的模型。
- 分类阶段不要只选来源，还要尽量生成高质量子问题。
- 并行结果返回后，最好有独立 synthesis 步骤，不要直接拼接。
- 对多轮对话，优先考虑“Router 作为工具”的封装方式。

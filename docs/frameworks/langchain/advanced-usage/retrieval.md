---
title: Retrieval
description: 使用检索为 LLM 提供外部知识，并构建不同形态的 RAG 系统
---

# Retrieval

大型语言模型虽然很强大，但它们有两个天然限制：

- 上下文窗口有限，无法一次吞下整个知识库。
- 知识是静态的，训练数据停留在某个时间点。

检索（Retrieval）正是为了解决这两个问题：在查询时动态获取相关外部知识。这也是 **RAG（Retrieval-Augmented Generation）** 的基础，即用与当前问题相关的外部上下文增强 LLM 的回答。

## 构建知识库

知识库是一个在检索时会被使用的文档或结构化数据仓库。

如果你需要自建知识库，可以用 LangChain 的：

- document loaders
- text splitters
- embeddings
- vector stores

把你自己的数据加工成可搜索的知识库。

> [!NOTE]
> 如果你已经有现成知识库，例如 SQL 数据库、CRM、内部文档系统，就不需要重建。你可以：
> 1. 在 Agentic RAG 中把它接成工具。
> 2. 在 2-Step RAG 中先查询它，再把结果作为上下文提供给 LLM。

相关教程：

- [Semantic search](https://docs.langchain.com/oss/python/langchain/knowledge-base)

## 从检索到 RAG

检索让 LLM 能在运行时拿到相关上下文。但真实系统往往会进一步把“检索”和“生成”结合起来，得到更有依据的回答。这就是 RAG 的核心思想。

## 检索流水线

一个典型的检索流程通常包括：

1. 从外部源加载文档
2. 把文档切分成更小的片段
3. 将片段向量化
4. 存入向量数据库
5. 对用户查询做向量化
6. 检索最相关片段
7. 把检索结果交给 LLM 生成答案

这些组件都是模块化的，因此你可以自由替换 loader、splitter、embedding 模型或 vector store，而不必重写整套应用逻辑。

## 基础组件

构建 Retrieval / RAG 时常用的基础模块包括：

- Document loaders：从 Google Drive、Slack、Notion 等外部源加载数据
- Text splitters：把大文档切成可检索的小块
- Embedding models：把文本映射成向量
- Vector stores：存储和搜索向量
- Retrievers：给定非结构化查询，返回相关文档

## RAG 架构

RAG 并不只有一种实现方式，常见可以分成三类：

| 架构 | 描述 | 控制力 | 灵活性 | 延迟 |
| --- | --- | --- | --- | --- |
| 2-Step RAG | 总是在生成前先检索，流程固定 | 高 | 低 | 快且可预测 |
| Agentic RAG | 由 Agent 在推理过程中决定何时以及如何检索 | 低 | 高 | 可变 |
| Hybrid RAG | 兼具两者特点，加入校验与迭代步骤 | 中 | 中 | 可变 |

> [!INFO]
> 2-Step RAG 的优势之一是延迟更可预测，因为 LLM 调用次数通常是固定的。但在真实系统中，API、网络、数据库查询性能也会影响整体延迟。

## 2-Step RAG

在 **2-Step RAG** 中，检索一定先于生成。这个架构简单、清晰、可预测，很适合 FAQ、文档问答机器人等场景。

基本流程：

1. 用户提问
2. 检索相关文档
3. 基于检索内容生成答案
4. 返回给用户

相关教程：

- [RAG 教程](https://docs.langchain.com/oss/python/langchain/rag#rag-chains)

## Agentic RAG

**Agentic RAG** 把 RAG 和 Agent 推理结合起来。它不是先固定做检索再回答，而是让 Agent 在推理过程中自主决定：

- 是否需要外部信息
- 什么时候检索
- 用哪个工具检索
- 是否继续追加检索

Agentic RAG 的关键并不复杂：**只要 Agent 拥有一个或多个能获取外部知识的工具，它就具备了 RAG 行为的基础。**

示例：

```python
import requests
from langchain.tools import tool
from langchain.agents import create_agent

@tool
def fetch_url(url: str) -> str:
    """获取网页文本内容"""
    response = requests.get(url, timeout=10.0)
    response.raise_for_status()
    return response.text

system_prompt = """\
当你需要从网页获取信息时，请使用 fetch_url，并引用相关片段。
"""

agent = create_agent(
    model="claude-sonnet-4-6",
    tools=[fetch_url],
    system_prompt=system_prompt,
)
```

这种方式尤其适合：

- 研究型助手
- 多工具搜索系统
- 需要动态探索信息源的任务

## Hybrid RAG

Hybrid RAG 结合了 2-Step RAG 和 Agentic RAG 的特征，并在中间加入更多校验步骤，例如：

- Query enhancement：对用户问题做改写、扩展或多版本生成，提高检索质量
- Retrieval validation：判断检索结果是否足够相关，必要时重新检索
- Answer validation：检查生成答案的准确性、完整性以及和源内容的一致性

它通常会在这些步骤之间做多轮迭代，因此比固定流水线更灵活，但也能保留一定控制力。

适用场景：

- 用户查询模糊或信息不充分
- 系统对质量控制有更高要求
- 需要融合多个知识源并反复优化结果

相关示例：

- [Agentic RAG with Self-Correction](https://docs.langchain.com/oss/python/langgraph/agentic-rag)

## 如何选择

可以按下面思路判断：

- 如果你要的是速度、稳定性和可预测性，优先用 2-Step RAG。
- 如果你要的是复杂推理、动态探索和工具编排，优先用 Agentic RAG。
- 如果你需要更高质量保证，并愿意接受更复杂流程，考虑 Hybrid RAG。

## 相关资源

- [Knowledge base](https://docs.langchain.com/oss/python/langchain/knowledge-base)
- [RAG](https://docs.langchain.com/oss/python/langchain/rag)
- [Document loaders](https://docs.langchain.com/oss/python/integrations/document_loaders)
- [Embeddings](https://docs.langchain.com/oss/python/integrations/embeddings)
- [Vector stores](https://docs.langchain.com/oss/python/integrations/vectorstores/)
- [Retrievers](https://docs.langchain.com/oss/python/integrations/retrievers/)

---
title: 安装 LangChain
description: 在 Python 环境中安装 LangChain 及常用模型集成包。
---

# 安装 LangChain

要在 Python 中使用 LangChain，先安装核心包：

```bash
pip install -U langchain
# 需要 Python 3.10+
```

如果你使用 `uv`：

```bash
uv add langchain
# 需要 Python 3.10+
```

LangChain 的大多数模型和外部能力都以独立集成包形式提供。也就是说，安装 `langchain` 之后，通常还要根据你实际使用的模型再安装对应 provider 包。

## 安装常见集成包

例如安装 OpenAI 和 Anthropic 集成：

```bash
pip install -U langchain-openai
pip install -U langchain-anthropic
```

如果你使用 `uv`：

```bash
uv add langchain-openai
uv add langchain-anthropic
```

## 安装完成后做什么

安装完成后，下一步通常是：

1. 配置模型提供商的 API Key
2. 运行一个最小示例，确认模型可以正常调用
3. 再继续阅读快速开始，构建第一个 Agent

## 下一步

继续阅读[快速开始](/frameworks/langchain/get-started/quickstart)。

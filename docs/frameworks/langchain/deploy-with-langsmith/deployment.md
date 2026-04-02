---
title: LangSmith Deployment
description: 使用 LangSmith 将 LangChain Agent 部署到生产环境
---

# LangSmith Deployment

当你准备把 LangChain Agent 部署到生产环境时，可以使用 LangSmith 提供的托管平台。

传统托管平台更偏向无状态、短生命周期 Web 应用，而 LangGraph / LangChain Agent 更适合：

- 有状态
- 长时间运行
- 需要后台执行

LangSmith 会帮你处理基础设施、扩缩容和运行层面的复杂性，让你可以直接从代码仓库部署 Agent。

## 前置条件

在开始前，请确保你有：

- GitHub 账号
- LangSmith 账号

## 部署你的 Agent

### 1. 在 GitHub 上准备仓库

你的应用代码需要放在 GitHub 仓库中。LangSmith 支持公有和私有仓库。

在正式部署前，建议先确保你的应用已经具备 LangGraph / Agent Server 兼容结构，并完成本地运行验证。

### 2. 连接 LangSmith 部署流程

完成代码仓库准备后，就可以在 LangSmith 中接入部署流程，把仓库内容发布为可运行的 Agent 服务。

## 适合部署到 LangSmith 的场景

- 需要长期运行的 Agent
- 需要状态持久化
- 需要后台任务能力
- 需要与 LangSmith 观测和调试能力打通

相关文档：

- [LangSmith Studio](/frameworks/langchain/agent-development/studio)
- [LangSmith Observability](/frameworks/langchain/deploy-with-langsmith/observability)

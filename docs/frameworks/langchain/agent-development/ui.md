---
title: Agent Chat UI
description: 使用 Agent Chat UI 连接本地或已部署的 Agent，并查看中断线程
---

# Agent Chat UI

Agent Chat UI 是一个现成的聊天界面，可用于连接本地或已部署的 Agent。

## 连接到你的 Agent

Agent Chat UI 可以连接：

- 本地 Agent
- 已部署 Agent

启动 Agent Chat UI 后，通常需要配置以下信息：

1. **Graph ID**：你的 graph 名称，可在 `langgraph.json` 的 `graphs` 中找到
2. **Deployment URL**：Agent Server 的地址，例如本地开发常见是 `http://localhost:2024`
3. **LangSmith API key（可选）**：如果连接的是本地 Agent，通常可以不填

配置完成后，Agent Chat UI 会自动拉取并展示来自 Agent 的线程和中断内容。

> [!TIP]
> Agent Chat UI 默认就支持显示工具调用和工具结果消息。如果你需要进一步控制界面里显示哪些消息，可以参考它的官方仓库说明。

相关文档：

- [部署](/frameworks/langchain/deploy-with-langsmith/deployment)
- [LangSmith Studio](/frameworks/langchain/agent-development/studio)

---
title: LangChain 概览
description: LangChain 是一个用于构建 LLM 应用与 Agent 的开源框架，提供统一模型接口、工具调用、记忆、流式输出与 LangGraph 能力集成。
---

# LangChain 概览

LangChain 是一个面向 LLM 应用和 Agent 的开源框架，用来把模型、工具、消息、记忆和运行时能力组织成可以落地的应用。

它的核心特点是：

- 提供统一的模型调用接口，便于切换不同模型提供商
- 内置 Agent 抽象，可以快速接入工具调用
- 与 LangGraph 协同工作，支持持久化、流式处理和人工介入
- 可以配合 LangSmith 做调试、观测和部署

如果你的目标是尽快搭建一个可运行的 Agent，LangChain 是合适的起点。如果你需要更底层的编排、状态控制和复杂工作流，可以继续深入 LangGraph。

## 你可以在这里学到什么

- 入门：安装、快速开始、更新日志、设计理念
- 核心组件：Agents、模型、消息、工具、短期记忆、流式输出、结构化输出
- 中间件：内置中间件与自定义中间件
- 高级用法：Guardrails、运行时、上下文工程、MCP、人工介入、多 Agent、检索、长期记忆
- Agent 开发：LangSmith Studio、测试、Agent Chat UI
- 使用 LangSmith 部署：部署与可观测性

## 推荐阅读顺序

1. 安装
2. 快速开始
3. 核心组件
4. 中间件
5. 高级用法
6. Agent 开发
7. 使用 LangSmith 部署

## 下一步

- 从[安装](/frameworks/langchain/get-started/install)开始配置环境
- 阅读[快速开始](/frameworks/langchain/get-started/quickstart)搭建第一个 Agent
- 然后进入[核心组件](/frameworks/langchain/core-components/agents)理解 LangChain 的基础抽象

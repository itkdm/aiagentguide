---
title: Frontend Integrations Overview
description: 如果你在比较 LangChain 前端该接哪种 UI 库、assistant-ui 和 OpenUI 适合什么场景，这页更适合作为选型入口。
keywords:
  - LangChain 前端集成怎么选
  - LangChain assistant-ui 适合什么场景
  - LangChain OpenUI 是什么
  - LangChain AI Elements 怎么用
  - LangChain 前端 UI 库怎么选
lastUpdated: 2026-05-30
status: published
---

# Frontend Integrations Overview

LangChain Frontend 可以和多种现成 UI 库集成，用来更快构建聊天界面、结构化渲染和生成式 UI。

## Integrations

这一组文档主要介绍如何把 `useStream` 或相关前端能力接入以下生态：

- AI Elements
- assistant-ui
- OpenUI

这些库分别擅长不同方向：

- 有的偏聊天 UI 组件
- 有的偏消息线程体验
- 有的偏生成式界面渲染

## 如何选择

选择哪一个库，主要取决于你的目标：

- 如果你想快速搭建聊天式消息界面，可以优先看 `assistant-ui` 或 `AI Elements`
- 如果你更关注生成式组件渲染和由模型驱动 UI，可以优先看 `OpenUI`
- 如果你已经有现有前端系统，也可以只借鉴这些集成方式，而不必完整采用对应库

选择时重点考虑：

- 你要的是聊天线程，还是生成式界面
- 你是否需要对消息展示做高度定制
- 你是否希望直接接入现成组件体系
- 你的前端框架与当前 UI 库是否契合

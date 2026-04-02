---
title: assistant-ui
description: 使用 assistant-ui 渲染 LangChain Agent 的聊天线程界面
---

# assistant-ui

`assistant-ui` 是一个适合聊天线程场景的 UI 库，可以很好地与 LangChain Frontend 的 `useStream` 配合，用来快速搭建完整聊天界面。

## 工作原理

核心方式是：

1. 使用 `useStream` 管理和 Agent 的交互
2. 把 LangChain 消息转换成 `assistant-ui` 所需的消息结构
3. 用 `assistant-ui` 渲染线程、消息列表和输入框

## 安装

先安装 `assistant-ui`，同时确保 LangChain Frontend 依赖已准备好。

## 接入 `useStream`

典型集成步骤：

1. 初始化 `useStream`
2. 读取 `messages`
3. 将消息转换成 `assistant-ui` 消费格式
4. 将提交逻辑绑定到输入框或 thread 组件

### 转换消息

因为 LangChain 消息结构和 `assistant-ui` 内部消息结构不完全相同，所以通常需要做一层转换。

转换时常见要处理：

- human / ai / system 消息类型
- tool call 与 tool result
- 多模态或结构化消息

如果不做统一转换层，后续维护会比较麻烦。

## 自定义线程 UI

`assistant-ui` 的优势之一是线程界面相对完整，因此你可以在此基础上继续自定义：

- 消息气泡样式
- 工具调用展示
- typing / loading 状态
- reasoning 区域
- 结构化输出卡片

## 最佳实践

- 先建立稳定的 LangChain 消息 -> UI 消息映射层。
- 对工具调用和工具结果做显式展示，不要全部混成普通文本。
- 如果你需要复杂线程体验，优先让 `assistant-ui` 负责视图层，`useStream` 负责数据层。
- 结合业务需求对线程 UI 做二次封装，而不是把所有逻辑写在页面里。

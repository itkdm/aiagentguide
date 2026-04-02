---
title: AI Elements
description: 将 LangChain Frontend 与 AI Elements 组件库结合使用
---

# AI Elements

`AI Elements` 提供了一套适合 AI 应用的 UI 组件，可以和 LangChain Frontend 的 `useStream` 结合，快速搭建聊天或结果展示界面。

## 工作原理

核心思路是：

1. 用 `useStream` 管理 Agent 流式状态
2. 把消息和状态映射到 AI Elements 提供的 UI 组件
3. 在组件层展示消息、输入框、加载态等内容

## 安装

按对应库文档安装 `AI Elements`，并确保你的项目里已经可用 LangChain Frontend 所需包。

## 接入 `useStream`

集成时通常需要做三件事：

1. 初始化 `useStream`
2. 把 `messages`、`isLoading`、`submit` 等能力传给界面组件
3. 根据 AI Elements 的消息格式要求做必要转换

常见模式如下：

```tsx
const stream = useStream<typeof myAgent>({
  apiUrl: AGENT_URL,
  assistantId: "my_assistant",
});
```

然后把：

- `stream.messages`
- `stream.submit(...)`
- `stream.isLoading`

接到 UI 组件上。

## 最佳实践

- 保持消息格式映射逻辑集中，避免散落在多个组件里。
- 让 AI Elements 负责展示，让 `useStream` 负责状态和网络交互。
- 对工具调用、结构化输出等特殊消息类型做单独样式处理。
- 如果你的业务消息类型很多，最好封装一个中间转换层。

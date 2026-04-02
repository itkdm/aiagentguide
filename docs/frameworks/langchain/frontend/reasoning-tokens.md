---
title: Reasoning tokens
description: 在前端读取和展示模型的 reasoning 内容，并与最终回答分开展示
---

# Reasoning tokens

一些模型会在输出中同时包含两类内容：

- 面向用户的最终回答
- 中间推理内容，也就是 reasoning tokens

在前端里，把这两类内容区分开来展示，可以帮助你构建“思考中”“展开推理细节”等体验。

## 什么是 reasoning tokens？

reasoning tokens 表示模型在生成最终输出前暴露出来的推理片段。它们通常和普通文本不同，前端不应直接把它们当作最终回答的一部分混在一起显示。

## 使用场景

常见场景包括：

- 显示“Thinking...”或“思考过程”
- 给开发者或高级用户提供可展开的推理视图
- 在复杂任务中区分“中间思考”和“最终结论”

## 提取 reasoning 与文本块

模型消息中可能会包含不同类型的内容块。常见处理方式是把：

- reasoning block
- text block

分别解析出来，再各自渲染。

这意味着你在前端处理消息时，不能只把整条消息当成纯文本，而需要按 `content blocks` 去拆分。

## 从 `useStream` 读取消息

通过 `useStream` 获取消息后，你可以遍历消息内容块，提取其中的 reasoning 和最终文本部分。

常见策略：

1. 遍历所有内容块
2. 把 `reasoning` 类型放到专门数组
3. 把 `text` 类型拼成最终回复

## 构建 ThinkingBubble 组件

一个常见 UI 做法是给 reasoning 单独做一个 `ThinkingBubble`：

- 默认可折叠
- 用不同样式和最终回答区分
- 在流式生成时逐步更新

这样最终界面通常会分成：

- 思考气泡
- 最终回答气泡

### ThinkingBubble 的样式建议

为了让 reasoning 和最终回答视觉上明显区分，可以：

- 使用更浅的背景色
- 使用较小字体
- 通过“Thinking”标题或图标标识
- 默认折叠，只在用户展开时展示细节

## 推理中的流式指示

当模型还在输出 reasoning 内容时，可以显示一个“思考中”状态，而不是让界面看起来像没有响应。

例如：

- `Thinking...`
- 跳动圆点
- skeleton 占位

这比直接空白等待更符合交互预期。

## 渲染完整 AI 响应

完整响应通常应分成两层：

1. reasoning：作为辅助信息展示
2. 最终文本：作为主输出展示

不要把 reasoning 自动拼进面向用户的主答案中，除非你明确就是要展示完整思考过程。

## 处理边界情况

### 没有 reasoning 的消息

有些消息只有普通文本，没有 reasoning。这时你的 UI 应该正常退化，只显示标准消息气泡。

### 空 reasoning 块

有些模型可能产生空的 reasoning block。遇到这种情况，应过滤掉空内容，避免渲染无意义容器。

### 多轮 reasoning / text 交替

有些输出可能不是“先 reasoning 再 final text”这么简单，而是 reasoning 和 text 多次交替出现。前端应当按顺序处理内容块，而不是假设固定结构。

## 最佳实践

- 将 reasoning 和最终文本分开处理、分开渲染。
- reasoning 视图默认可折叠，避免普通用户被干扰。
- 为没有 reasoning 的模型或消息做好降级处理。
- 不要假设内容块顺序固定。
- 流式过程中为 reasoning 提供明确加载反馈。

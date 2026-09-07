---
title: 一个 AI Agent 从接收任务到完成任务，到底是怎么运行的？
description: 介绍 AI Agent 从接收任务到完成任务的运行过程与 Agent Loop。
summary: 文章内容后续补充。
keywords:
  - Agent Loop
  - AI Agent 运行机制
tags:
  - AI Agent
  - 面试
status: draft
assets: none
reviewed: false
sourceType: original
author: 布吉岛
draft: true
noindex: true
---

# 一个 AI Agent 从接收任务到完成任务，到底是怎么运行的？

### 1. 面试官：Agent Loop 听说过吗？你怎么理解？

### 2. 面试官：你刚才说 Agent 会不断“思考、行动、再观察”，那这个循环到底是谁在驱动？

### 3. 面试官：模型本身一次只会完成一次推理，它为什么不会自己一直循环下去？

### 4. 面试官：那在一个真正的 Agent 系统里，是谁负责把“模型输出、工具执行、结果回传、再次调用模型”这些步骤串起来的？

### 5. 面试官：这样看，LLM 在 Agent Loop 里到底负责什么，Agent Runtime 又负责什么？

### 6. 面试官：那 Agent Loop 和普通的一次 LLM 调用，最大的区别是什么？

### 7. 面试官：Agent Loop 和 ReAct 是什么关系？是不是所有 Agent Loop 都等于 ReAct？

### 8. 面试官：一个 Agent Loop 最后通常怎么结束？模型自己说“完成了”就一定可以停吗？

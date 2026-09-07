---
title: Agent、Workflow 和 Tool 到底是什么关系？实际项目里应该怎么选？
description: 理解 Agent、Workflow 与 Tool 的关系，并判断实际项目中的选型方式。
summary: 文章内容后续补充。
keywords:
  - Agent Workflow Tool
  - Agent 选型
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

# Agent、Workflow 和 Tool 到底是什么关系？实际项目里应该怎么选？

### 1. 面试官：你这个项目为什么要用 Agent？直接用普通程序或者 Workflow 不行吗？

### 2. 面试官：你说这个任务没办法完全提前写死，那具体是哪些环节无法预先确定？

### 3. 面试官：如果只有少数环节存在这种不确定性，剩下的大部分流程其实都能确定，那你还会把整个系统都交给 Agent 吗？

### 4. 面试官：那实际设计时，你会怎么划分“代码确定执行”和“交给模型动态决策”的边界？

### 5. 面试官：如果模型只在 Workflow 中负责一个动态路由节点，或者只决定下一步调用哪个工具，这套系统你会怎么理解？

### 6. 面试官：我们前面一直在说 Tool，那 Tool 在这套系统里到底扮演什么角色？为什么它和 Agent、Workflow 不是同一种东西？

### 7. 面试官：如果这个业务对结果可预测性、审计和稳定性要求特别高，你刚才的方案会不会变？

### 8. 面试官：那你举一个具体业务，现场给我拆一下：哪些地方你会坚持用 Workflow，哪些地方值得交给 Agent，哪些能力只做成 Tool？

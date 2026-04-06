---
title: 大模型 Agent 校招面经 - 阿里淘天
summary: 一组围绕 Transformer Attention、SFT、RAG、PPO 与 DPO、多工具 Agent 调度、评估、Prompt 优化与延迟治理展开的校招面经题目。
company: 阿里淘天
direction: AI Agent
round: 校招面经
interviewDate: 2026-03-07
tags:
  - AI Agent
  - 面试
  - Attention
  - RAG
  - 强化学习
author: AI Agent Guide
description: "一组围绕 Transformer Attention、SFT、RAG、PPO 与 DPO、多工具 Agent 调度、评估、Prompt 优化与延迟治理展开的校招面经题目。"
---

# 大模型 Agent 校招面经 - 阿里淘天

这组题目从 Transformer 和 Attention 基础切入，逐步延伸到 SFT、RAG、对齐训练、多工具 Agent 设计、评估体系、Prompt 优化和系统性能治理，覆盖面比较广。

## 基本信息

- 方向：AI Agent
- 轮次：校招面经
- 面试公司：阿里淘天
- 面试时间：2026 年 3 月 7 日

## 题目清单

1. Transformer 中 Attention 的本质是什么？你能从数学角度简要解释一下吗？
2. 在 Agent 多轮对话任务中，你觉得 Attention 的局限性体现在哪些方面？
3. 简要介绍一下 SFT 的核心流程，以及数据集的构建策略。SFT 之后常见的 Post-Training 还有哪些？它们之间的目的有何区别？
4. 什么是 RAG，它是怎么提升生成质量的？与传统检索 + 模型生成的流程有何不同？如何评估一个 RAG 系统是否 work？
5. PPO 和 DPO 在大模型对齐中的主要区别是什么？DPO 训练通常有哪些注意事项？用过 GRPO 么？
6. 项目里的 Modular Agent，你能讲讲它是如何实现多步规划的吗？
7. 项目提到了多个工具调用链路，调度策略是如何设计的？是否有异常 fallback 策略？
8. Agent 评估体系包括哪些维度？如何衡量 planning 能力 vs hallucination rate？
9. 项目里微调 Qwen，选择的训练阶段和 Loss 函数是如何决定的？
10. Prompt 自动推荐模块用了哪些优化策略？有没有尝试过 Prompt 压缩或 embedding 表示的方式？
11. 场景题：假如一个 Agent 推理链路包含 3 个工具 + 高频请求，系统整体延迟较高，你会如何优化？
12. 代码：岛屿数量。

## 这组题主要考什么

- 前几题在考大模型基础是否扎实，尤其是 Attention、SFT、RAG 和对齐训练这些核心概念。
- 中段重点考 Agent 系统设计，包括多步规划、工具调度、异常回退和评估体系。
- 后段更偏工程落地，要求你能回答模型微调、Prompt 优化和高延迟链路治理，最后再补一道算法题验证编码基本功。

## 练习建议

- 第 1 到第 5 题建议按“原理、为什么、适用场景、常见问题”来准备，避免只答定义。
- 第 6 到第 11 题适合整理成系统设计回答，重点准备规划机制、调度策略、fallback、评估指标和性能优化手段。
- 第 12 题是高频基础算法题，至少要准备 DFS、BFS 和并查集三种解法的思路差异。

## 延伸阅读

- [面试](../)
- [RAG](/rag/)
- [Agent 是什么](/getting-started/what-is-ai-agent)
- [通用规划原理](/principles/general-planning)
- [通用可靠性与安全](/principles/general-reliability-safety)


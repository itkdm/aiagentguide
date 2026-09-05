---
title: AI Agent 入门
summary: 从最容易混淆的问题开始，建立 AI Agent 的基础认知，搞清楚 Agent 是什么、什么时候该用，以及后面应该怎么学。
keywords:
  - AI Agent 是什么
  - AI Agent 适合哪些业务场景
  - AI Agent 不适合哪些场景
  - AI Agent 开发需要学哪些技术
tags:
  - AI Agent
  - 入门
  - 基础概念
author: 布吉岛
pageClass: getting-started-overview
description: "布吉岛Agent入门学习的基础指南，从 Agent、Workflow、RAG 等核心概念开始，逐步建立判断标准和完整学习路线。"
lastUpdated: 2026-08-29
status: published
---

# AI Agent 入门

<div style="display: flex; flex-wrap: nowrap; align-items: flex-start; gap: 28px; margin: 18px 0 10px;">
  <!-- 图解候选：入门栏目概览图，后续需要时取消注释并恢复下方 div
  <div style="flex: 0 0 40%; min-width: 300px;">
    <div style="border-radius: 14px; overflow: hidden;">
    <SingleImagePreview
      src="https://i.postimg.cc/j55rz6wm/doubao-image-1-(12).png"
      alt="AI Agent 入门栏目概览图"
      style="width: 100%; margin-bottom: -92px;"
    />
    </div>
  </div>
  -->
  <div style="flex: 1 1 60%; min-width: 360px;">
    <p style="margin-top: 0;">
      <span class="gs-accent">AI Agent</span> 是这两年爆火的方向，整个领域还处于快速发展阶段。
    </p>
    <p>
      所以刚开始接触时，很容易被各种名词绕晕：Agent、Workflow、RAG、Tool Calling、Memory、MCP、LLM、Prompt……
    </p>
    <p>
      其实现在我们对这些概念大多已经有了一些基本了解，像 Codex、CodeBuddy 这类 Agent 工具我们也用得越来越频繁。
    </p>
    <p>
      但如果突然问你一句：<strong>Agent 到底是什么？它又为什么会突然爆火？</strong>
    </p>
    <p>
      可能一下就不知道该怎么解释。
    </p>
    <p>
      其实这是一个很正常的现象。大模型越来越强大，Agent 发展越来越快，隔几天就冒出一个新工具、一个新概念，甚至有一种说法：现在只要学得慢，很多东西就不用学了。
    </p>
    <p>
      所以我们整个教程核心，从来不是教你使用某一个具体工具，而是帮你从整体上建立认知，我们要明白 AI 只是工具，框架也是工具，代码同样是工具，但是有些思想是不变的，有些思想又是融会贯通的。
    </p>
    <p>
    我希望大家读完以后，能够真正侃侃而谈，更能把这套逻辑自如地运用到自己的工程实践中，而不是单纯停留在概念记忆上。
    </p>
  </div>
</div>

## 为什么我不建议一上来就死磕框架

现在网上很多关于 Agent 的教程，一上来就是各种框架：

LangChain、LangGraph、AutoGen、SringAI、Agentscope……

于是很多教程的学习顺序就是：

> 挑一个最火的框架，然后照着教程做 Demo。

这种方式当然也可以。

但问题是，框架解决的是**怎么实现**，在实现之前还有一个更重要的问题：

**我们到底准备实现什么？**

> 我见过很多实习生认为开发就是写代码，却忽视工作中同样重要的一个能力就是理解需求，理解业务。

有些需求本来就是固定流程，用普通 Workflow（工作流） 会更稳定。

有些需求真正缺的是知识检索，核心其实是 RAG。

还有一些系统虽然用了模型、工具调用、知识库，甚至产品名字里也带着 Agent，但执行流程依然是提前写死的。

如果这些边界都没有分清楚，直接学框架的话，很容易出现下面几个问题：

* API 会用了，但说不清系统为什么这样设计
* Demo 可以跑，但换一个框架又像重新学了一遍
* 能把功能做出来，却解释不清它究竟是 Agent还是Workflow
* 真正遇到工程选型时，只能凭“哪个框架火”做判断

所以在入门阶段，我更建议先把**判断力**建立起来。

框架可以稍微晚一点学。

底层这些问题想清楚以后，学习框架以及后续换框架，其实也没有那么麻烦。

## 理清四个关键边界

刚开始不需要背这些术语，后续还会反复出现。

我们先围绕下面几个问题建立认知，后面大部分内容都会慢慢串起来。

### AI Agent 到底是什么？

这是最基础的问题，也是最容易被讲复杂的问题。

真正需要分清的是：

**普通大模型、聊天机器人和 Agent，到底差在哪里？**

我们不需要背一句：

> Agent 是一个具有自主决策和工具调用能力的智能系统。

而是看到一个真实任务时，能大概判断：

> 这个系统到底只是在“回答问题”，还是已经开始“围绕目标持续做事”？

这个区别后面会反复出现。

Tool Calling、Planning、Memory、Agent Loop，本质上都和“怎么把任务继续推进下去”有关。

### Workflow 和 Agent 到底有什么区别？

这个问题也特别重要。

Workflow 同样可以：

* 调模型
* 调工具
* 查数据库
* 搜索网页
* 跑很多步骤

那为什么还需要 Agent？

这里真正值得关注的是：

**下一步由谁决定？**

如果每一步都是开发者提前写好的：

`搜索 → 总结 → 输出`

那更接近 Workflow。

如果系统会根据当前状态和上一步结果判断：

> 信息够不够？
>
> 还要不要继续搜？
>
> 现在应该调用哪个工具？
>
> 任务是不是已经完成了？

这时候就开始出现更明显的 Agent 特征。

这两者不是简单的“谁更高级”。

很多真实业务里，固定 Workflow 反而更稳定、更便宜，也更容易控制。

甚至说，Agent流程里面完全可以有 Workflow 的部分。

### RAG 和 Agent 又有什么区别？

这个地方其实很好理解，现在很多 Agent 系统都会接 RAG。

可以先用一句比较简单的话区分：

**RAG 主要解决“资料从哪里来”。**

**Agent 主要解决“下一步做什么”。**

比如问一个企业知识助手：

> 公司今年的年假规则是什么？

RAG 可以先去知识库里把对应制度找出来，再交给模型回答。

但如果任务变成：

> 找出过去三版年假规则的变化，判断哪些部门受影响，再整理成一份通知。

这个过程就比较复杂了。

系统可能需要：

* 找多份资料
* 比较版本
* 识别差异
* 判断信息是否完整
* 继续查询其他数据
* 最后再组织结果

这时候 RAG 仍然可以参与，但整个任务已经**不只是**“检索一次然后回答”。

### 什么任务真的适合 Agent？

Agent 不是越多越好，Agent 不是越复杂越好。

一个固定、明确、可预测的流程，很多时候根本没必要让模型每一步都参与决策。

比如：

> 查数据库 → 生成 Excel → 发邮件

如果规则非常稳定，用 Workflow 就能很好完成。

Agent 更有价值的地方，通常出现在：

* 任务步骤很难完全提前确定
* 中间结果会影响下一步动作
* 需要在多个工具之间动态选择
* 经常需要根据反馈重新调整路径
* 任务本身带有一定不确定性

所以学 Agent 时，不只要研究：

> 怎么做一个 Agent？

还需要一直问：

> **这个任务真的需要 Agent 吗？**

这个判断在真实项目里往往比学框架、调 API 更重要。

## 这一栏我们会怎么学

整个入门部分我们不会一下跳进复杂架构，因为核心目的就是给大家建立整体上面的认知。

大致可以分成下面几个阶段。

### 第一阶段：先建立直觉

先把几个最常见的概念分开：

* [什么是 AI Agent](./what-is-ai-agent.md)
* [AI Agent 能做什么：6 个典型案例](./ai-agent-cases.md)
* [什么是 Workflow（工作流）](./what-is-workflow.md)
* [什么是 RAG](./what-is-rag.md)
* [Agent、聊天机器人、工作流与 RAG](./agent-vs-chatbot-workflow-rag.md)

这个阶段我们不用追求所有定义都能说得特别专业。

但至少应该逐渐建立一个基本判断：

> Agent、Workflow、RAG 不是同一个东西，他们有不同的特点。


### 第二阶段：要学会判断

搞清楚 Agent 是什么以后，下一个问题就是：

**什么时候值得用？**

这一篇会专门讨论：

* [什么任务适合用 Agent](./when-to-use-agent.md)

这个问题非常值得认真看。

因为真正做项目时，第一步往往不是：

> Agent 怎么写？

而是：

> 这里到底该不该用 Agent？

如果任务很固定，Agent 可能只是增加成本和不稳定性。

如果任务本身就有大量动态决策，再考虑 Agent 才更合理。

### 第三阶段：明白Agent到底是怎么运转

前面的边界有了以后，再了解内部机制就会自然很多。

我们会讲：

* 模型怎么判断下一步
* Tool Calling 怎么发生
* 工具结果怎么重新进入上下文
* 状态怎么保存
* 为什么会形成循环
* 什么时候应该停止

对应：

* [Agent 是怎么运转的](./how-agent-works.md)
* [Agent 的核心组件](./core-components.md)

学到这里以后，也有助于我们后续学习 LangGraph、Agentscope 等框架。

我们不是讲：

> 这个框架 API 怎么调用？

而是：

> 这里其实是在管理状态。

> 这一层在处理 Tool Calling。

> 这里控制的是 Agent Loop。

反而框架只是把这些问题封装成了不同的实现方式，我们在用的时候调用就可以。

### 第四阶段：准备真正动手

最后再进入第一个项目之前，

我们会讲：

* [第一次动手前要知道什么](./before-your-first-agent.md)
* [新手有哪些常见误区](./common-mistakes.md)
* [入门学习路线](./learning-path.md)

## 面试时怎么准备

Agent开发很火，现在对于程序员来说，面试几乎都会问到。

但我不建议一开始就背什么：

> Agent 有五个组成部分。

> Memory 分为四种类型。

> Planning 有几种方式。

这些面试题我们后面当然会讲，但并不是最值得优先投入时间的部分。

面试里更容易真正拉开差距的，往往考的不是记忆，而是认知：

> 这个技术为什么会出现？

> 为什么用这个技术而不用另一个技术？

这些问题很多面试官都会问，Java 八股文里面也有很多类似的问题。

我不太喜欢整理一套漂亮的标准答案，这样同质化严重，每个人没有自己的思考。

而是应该学完以后，可以脱离文章，用自己的话把逻辑讲出来。

当然我们后面可能也会给大家出一些面试题合集，方便大家高效准备面试。

## 开始之前需要补很多基础吗？

不用。

如果已经有基本编程能力，就可以开始接触 Agent 应用开发。

没有必要先去了解深度学习、NLP、Transformer 等技术。

这些内容有自己的价值，但并不是进入 Agent 应用开发的前置门槛。

后面真正会反复碰到的主要是：

* LLM
* Prompt
* Tool Calling
* RAG
* API
* 上下文工程
* 状态管理
* Agent Loop
* Skill
* MCP

遇到哪里不会、不清楚，我们再补哪里就行。

很多技术真正放进场景里以后，反而更容易理解。

这也是我们后续带大家实际做项目的原因。

## 哪些东西现在可以先放一放

Agent 领域更新特别快，毕竟还属于快速发展阶段。

所以可能会出现下面这种情况：

> LangChain 和 LangGraph 到底选哪个？

> CrewAI 还有没有必要学？

> MCP 是不是必须会？

> Multi-Agent 是不是比单 Agent 更高级？

> Memory 到底用向量数据库还是关系数据库？

这些问题以后都会遇到。

但现在不用急。

如果连 Agent、Workflow、RAG 的区别都还不清楚，提前研究这些细节很容易被框架和名词带着走。

技术在变，很多底层思想反而一直没怎么变：

* 什么情况下应该调用工具，调用哪个工具
* 中间产生的状态应该怎样延续
* 一次执行失败以后，是重试、换一种方式，还是直接停止
* 系统怎样判断任务已经完成

这些问题想明白以后，再看新的 Agent 框架，会发现很多设计其实只是用了不同名字解决相似问题。

<!-- ## 建议阅读顺序

如果准备系统学下去，可以先按照下面这条路线：

<div class="gs-path-flow">
  <a class="gs-path-step" href="./">
    <span class="gs-path-name">入门</span>
    <span class="gs-path-desc">先分清 Agent、Workflow、RAG，建立基本判断</span>
  </a>
  <span class="gs-path-arrow" aria-hidden="true">→</span>
  <a class="gs-path-step" href="../principles/">
    <span class="gs-path-name">原理</span>
    <span class="gs-path-desc">理解 Agent Loop、上下文、工具调用与可靠性</span>
  </a>
  <span class="gs-path-arrow" aria-hidden="true">→</span>
  <a class="gs-path-step" href="../rag/">
    <span class="gs-path-name">RAG</span>
    <span class="gs-path-desc">理解检索、重排、上下文构建和生产化问题</span>
  </a>
  <span class="gs-path-arrow" aria-hidden="true">→</span>
  <a class="gs-path-step" href="../tools/">
    <span class="gs-path-name">工具</span>
    <span class="gs-path-desc">真正需要时再查框架、平台和工具生态</span>
  </a>
</div>

整个学习过程我推荐大家坚持一个原则：

**先理解问题，再学习解决问题的工具。**

而不是反过来。 -->

## 从哪一篇开始？

这里有两个入口。

如果更喜欢先建立概念：

👉 [什么是 AI Agent](./what-is-ai-agent.md)

如果看抽象定义比较容易乱，更喜欢先看实际场景：

👉 [AI Agent 能做什么：6 个典型案例](./ai-agent-cases.md)

我个人更推荐：

**先看案例，再回来理解定义。**

因为我们脑子里已经有了一个 Agent 真正在做事情的画面以后，后面的 Tool、Planning、Memory、Loop 都会更容易理解。

---

## 总结

这个入门栏目我希望给初学者建立的是认知，而不是知识。如果大家感觉自己已经很熟悉这些概念了，可以直接跳过，进入下一个栏目。
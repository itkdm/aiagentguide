---
title: AI Agent 入门
summary: 从最容易混淆的问题开始，建立 AI Agent 的基础认知，搞清楚 Agent 是什么、什么时候该用，以及后面应该怎么学。
keywords:
  - AI Agent 是什么
  - AI Agent 适合哪些业务场景
  - AI Agent 不适合哪些场景
  - AI Agent 学习路线怎么安排
  - AI Agent 开发需要学哪些技术
tags:
  - AI Agent
  - 入门
  - 基础概念
  - 学习路径
author: 布吉岛
pageClass: getting-started-overview
description: "面向 AI Agent 入门学习的基础指南，从 Agent、Workflow、RAG 等核心概念开始，逐步建立判断标准和完整学习路线。"
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
      刚开始接触 <span class="gs-accent">AI Agent</span> 时，很容易遇到一种情况：
    </p>
    <p>
      Agent、Workflow、RAG、Tool Calling、Memory、MCP……名词看了不少，Demo 也刷过几个，但回过头来再问一句：
    </p>
    <p>
      <strong>Agent 到底是什么？</strong>
    </p>
    <p>
      反而一下不知道该怎么解释。
    </p>
    <p>
      其实这是一个很正常的现象。现在真正的问题不是资料太少，而是资料太多，而且很多概念经常混在一起讲。
    </p>
    <p>
      所以这一栏我们先不急着追框架，也不急着堆 Demo 讲案例。先把几个后面一定会反复遇到的问题想明白。
    </p>
  </div>
</div>

## 先别急着学框架

现在网上关于 Agent 的内容很多，一上来最容易看到的就是各种框架：

LangChain、LangGraph、OpenAI Agents SDK、AutoGen、CrewAI、Agentscope……

于是学习顺序就变成了：

> 先挑一个最火的框架，然后照着教程做 Demo。

这种方式当然也能跑起来。

但问题是，框架解决的是**怎么实现**，在这之前还有一个更重要的问题：

**我们到底准备实现什么？**

有些需求本来就是固定流程，用普通 Workflow（工作流） 会更稳定。

有些需求真正缺的是知识检索，核心其实是 RAG。

还有一些系统虽然用了模型、工具调用、知识库，甚至产品名字里也带着 Agent，但执行流程依然是提前写死的。

如果这些边界还没有分清，直接学框架，很容易出现几个问题：

* API 会用了，但说不清系统为什么这样设计
* Demo 可以跑，但换一个框架又像重新学了一遍
* 能把功能做出来，却解释不清它究竟是 Agent、Workflow 还是普通 LLM 应用
* 真正遇到工程选型时，只能凭“哪个框架火”做判断

所以入门阶段，我更建议先把**判断能力**建立起来。

框架可以晚一点学。

底层这些问题想清楚以后，换框架其实没有那么麻烦。

## 学 Agent，最先应该搞清楚什么

刚开始不用背很多术语。

先围绕几个问题建立认知，后面大部分内容都会慢慢串起来。

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

### Workflow 和 Agent 到底差在哪？

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

两者不是简单的“谁更高级”。

很多真实业务里，固定 Workflow 反而更稳定、更便宜，也更容易控制。

甚至说，Agent流程里面完全可以有 Workflow 的部分。

### RAG 和 Agent 是不是一回事？

不是。

这个地方特别容易混，因为现在很多 Agent 系统都会接 RAG。

可以先用一句比较简单的话区分：

**RAG 主要解决“资料从哪里来”。**

**Agent 主要解决“下一步做什么”。**

比如问一个企业知识助手：

> 公司今年的年假规则是什么？

RAG 可以先去知识库里把对应制度找出来，再交给模型回答。

但如果任务变成：

> 找出过去三版年假规则的变化，判断哪些部门受影响，再整理成一份通知。

事情就复杂了。

系统可能需要：

* 找多份资料
* 比较版本
* 识别差异
* 判断信息是否完整
* 继续查询其他数据
* 最后再组织结果

这时候 RAG 仍然可以参与，但整个任务已经不只是“检索一次然后回答”。

### 什么任务真的适合 Agent？

Agent 不是越多越好，Agent 不是越复杂越好。

一个固定、明确、可预测的流程，很多时候根本没必要让模型每一步都参与决策。

比如：

> 查数据库 → 生成 Excel → 发邮件

如果规则非常稳定，普通程序或者 Workflow 就能很好完成。

Agent 更有价值的地方，通常出现在：

* 任务步骤很难完全提前确定
* 中间结果会影响下一步动作
* 需要在多个工具之间动态选择
* 经常需要根据反馈重新调整路径
* 任务本身带有一定不确定性

所以学 Agent 时，不只要研究：

> 怎么做一个 Agent？

还需要一直问：

> **这个地方真的需要 Agent 吗？**

这个判断在真实项目里往往比框架 API 更重要。

## 这一栏我们会怎么学

整个入门部分不会一下子跳进复杂架构，核心目的就是给大家建立整体上面的认知。

大致分成几个阶段。

### 第一阶段：先建立直觉

先把几个最常见的概念分开：

* [什么是 AI Agent](./what-is-ai-agent.md)
* [AI Agent 能做什么：6 个典型案例](./ai-agent-cases.md)
* [什么是 Workflow（工作流）](./what-is-workflow.md)
* [什么是 RAG](./what-is-rag.md)
* [Agent、聊天机器人、工作流与 RAG](./agent-vs-chatbot-workflow-rag.md)

这一阶段不用追求所有定义都能说得特别专业。

但至少应该慢慢建立一个基本判断：

> Agent、Workflow、RAG 不是同一个东西。

后面再遇到各种框架和产品时，就不会所有东西都混成“智能体”。

### 第二阶段：先学会判断，再急着实现

搞清楚 Agent 是什么以后，下一个问题就是：

**什么时候值得用？**

这一篇会专门讨论：

* [什么任务适合用 Agent](./when-to-use-agent.md)

这个问题非常值得认真看。

因为真正做项目时，困难往往不是：

> Agent 怎么写？

而是：

> 这里到底该不该用 Agent？

如果任务很固定，Agent 可能只是增加成本和不稳定性。

如果任务本身有大量动态决策，再考虑 Agent 才更合理。

### 第三阶段：看看 Agent 到底怎么跑起来

前面的边界有了以后，再进入内部机制会自然很多。

接下来会逐渐看到：

* 模型怎么判断下一步
* Tool Calling 怎么发生
* 工具结果怎么重新进入上下文
* 状态怎么保存
* 为什么会形成循环
* 什么时候应该停止

对应：

* [Agent 是怎么运转的](./how-agent-works.md)
* [Agent 的核心组件](./core-components.md)

学到这里以后，再回头看 LangGraph、OpenAI Agents SDK 等框架，会明显不一样。

看到的不只是：

> 这个 API 怎么调用？

而是：

> 这里其实是在管理状态。

> 这一层在处理 Tool Calling。

> 这里控制的是 Agent Loop。

框架只是把这些问题封装成了不同的实现方式。

### 第四阶段：准备真正动手

最后再进入第一个项目之前的准备：

* [第一次动手前要知道什么](./before-your-first-agent.md)
* [新手常见误区](./common-mistakes.md)
* [入门学习路线](./learning-path.md)

这一阶段主要解决一个很现实的问题：

**怎么避免做了很多 Demo，最后还是只会 Demo。**

真正值得带到项目里的，不只是“功能跑通”。

还包括：

* 为什么选择 Agent
* 为什么选择这些工具
* 失败怎么处理
* 边界怎么控制
* 怎么判断任务已经完成
* 怎么验证结果是不是可靠

这些东西后面都会慢慢展开。

## 如果你想要准备面试

Agent开发很火，很多公司几乎每场面试都会问到。


但这里不建议一开始就背：

> Agent 有五个组成部分。

> Memory 分为四种类型。

> Planning 有几种方式。

这些分类当然可以知道，但并不是最值得优先投入时间的部分。

面试里更容易真正拉开理解差距的，往往考的不是你的记忆，而是认知：

> Agent 和普通 LLM 应用到底差在哪里？

> Agent 和 Workflow 怎么选？

> 为什么 Agent 需要 Tool Calling？

> Agent 为什么容易死循环？

> 为什么不是所有业务都适合 Agent？

> RAG 和 Agent 在一个系统里分别解决什么问题？

这些问题看起来没有太多复杂术语。

但回答时必须讲清楚“为什么”。

所以后面的文章里，我会尽量把知识分成：

* 真正应该掌握的
* 当前理解即可的
* 适合继续深入的
* 面试时很容易被追问的

我不太喜欢整理一套漂亮的标准答案，这样同质化严重，每个人没有自己的思考。

而是更应该学完以后，可以脱离文章，用自己的话把逻辑讲出来。

## 开始之前需要补很多基础吗？

不用。

如果已经有基本编程能力，就可以开始接触 Agent 应用开发。

不需要先去做这些事情：

* 把深度学习完整学一遍
* 自己训练一个大模型
* 把 Transformer 数学推导全部搞懂
* 学习一个 Agent 框架
* 看完几篇 Agent 论文

这些内容有自己的价值，但不是进入 Agent 应用开发的前置门槛。

后面真正会反复碰到的主要是：

* LLM
* Prompt
* Tool Calling
* RAG
* API
* 上下文工程
* 状态管理
* Agent Loop
* 可靠性
* 权限和安全

遇到哪里不会、不清楚，再补哪里就行。

很多东西真正放进场景里以后，反而更容易理解。

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

如果连 Agent、Workflow、RAG 的边界还没有建立起来，提前研究这些细节很容易被框架和名词带着走。

技术在变，很多底层问题反而一直没怎么变：

* 任务是什么
* 模型负责什么
* 工具负责什么
* 状态怎么保存
* 下一步谁来决定
* 执行失败怎么办
* 系统什么时候停止
* 为什么这里需要 Agent

这些问题想明白以后，再看新的 Agent 框架，会发现很多设计其实只是用了不同名字解决相似问题。

## 建议阅读顺序

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

而不是反过来。

## 从哪一篇开始？

这里有两个入口。

如果更喜欢先建立概念：

👉 [什么是 AI Agent](./what-is-ai-agent.md)

如果看抽象定义比较容易困，更喜欢先看实际场景：

👉 [AI Agent 能做什么：6 个典型案例](./ai-agent-cases.md)

我个人更推荐：

**先看案例，再回来理解定义。**

因为脑子里已经有了一个 Agent 真正在做事情的画面以后，后面的 Tool、Planning、Memory、Loop 都会更容易接上。

当然，直接从《什么是 AI Agent》开始也没有问题。

---

## 这篇要记住什么

### 必须掌握

入门阶段最值得先搞清楚的，不是框架，而是几个基本判断：

* AI Agent 和普通聊天模型差在哪里
* Agent 和 Workflow 的核心区别是什么
* RAG 和 Agent 分别解决什么问题
* 什么任务真的值得使用 Agent

这些问题决定了后面学框架、看源码、做项目时，能不能真正理解系统为什么这样设计。

### 理解即可

现在暂时不用死磕：

* 各种 Agent 框架之间的 API 差异
* Multi-Agent 的复杂架构
* Memory 的完整分类
* MCP 等具体协议细节
* 每一个最新出现的 Agent 名词

这些东西后面真正用到时再深入。

### 能不能自己讲出来？

读完整个入门栏目以后，可以试着回答三个问题：

> **Agent 和普通聊天模型最大的区别是什么？**

> **为什么有些任务用 Workflow 比 Agent 更合适？**

> **RAG 和 Agent 为什么可以同时出现在一个系统里？**

不需要复述文章里的原句。

只要能结合一个实际例子，把背后的因果关系讲清楚，就说明这些概念已经真正开始建立起来了。

哪怕讲不清楚，也不要紧。这才是第一篇文章，随着后续内容的深入，这些问题会越来越清晰。

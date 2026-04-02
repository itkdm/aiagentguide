---
title: AI Agent 能做什么：6 个典型案例
summary: 通过 6 个典型案例建立对 AI Agent 的直觉，帮助你快速理解什么样的任务真正适合用 Agent 来完成。
description: "通过 6 个典型案例解释 AI Agent 能做什么，帮助你更直观地判断哪些任务真正适合交给 Agent。"
keywords:
  - AI Agent 案例
  - AI Agent 能做什么
  - 智能体应用案例
  - Agent 场景
tags:
  - AI Agent
  - 案例
  - 应用场景
  - 入门
author: AI Agent Guide
pageClass: getting-started-cases
---

# AI Agent 能做什么：6 个典型案例

如果一开始就直接看概念、定义，很多同学会觉得 <span class="case-accent">AI Agent</span> **“好像懂了，但脑子里没有画面”**。所以，对于我来说，学习一个新技术，我不会先去看它的概念、定义、术语等等，而是要先明白，它能做什么？案例是什么？也就是说**业务理解的优先级是高于技术理解**的。

所以这一篇我们先不讲概念，也不讲代码，而是先通过 **6 个典型案例**建立直觉：
AI Agent 到底能做什么？更重要的是，**什么样的任务，才真正值得考虑用 Agent 来做。**

这些案例主要参考了项目库 **500 AI Agents Projects** 里收录的代表性用例。这个项目本身就是一个跨行业的 Agent 用例集合，里面收录了会议助手、邮件处理、招聘流程、旅行规划、法律审阅、文档校验等很多常见方向。([GitHub][1])

不过看案例时，你要先记住一件事：

**我们不是在记“行业名称”，而是在看“任务结构”。**

因为真正决定一个场景适不适合用 Agent 的，往往不是它属于哪个行业，而是它有没有这些特征：

* 目标明确，但执行路径不完全固定
* 需要边获取信息，边做判断，边推进任务
* 不是一次回答就能完成，而是要经过多步收敛
* 可能需要调用外部工具、读取外部资料，或者把中间结果再带回系统继续处理

这也是很多 Agent 框架和官方文档反复强调的区别：
**工作流**更像预先写好的固定路径，**Agent**更像围绕目标动态决定下一步该做什么的系统。([LangChain文档][2])

## 先带着这 3 个问题往下看

读下面这 6 个案例时，建议你每次都先问自己：

1. 这个任务是不是只有一个固定步骤就能完成？
2. 它中间是不是需要持续判断，而不只是机械执行？
3. 如果信息不够，系统是不是需要主动补信息、改路径、继续推进？

如果答案大多是“是”，那它通常就更接近 Agent 场景。
如果答案大多是“不是”，那它可能更像工作流、RAG，或者普通自动化。

---

## 案例 1：会议准备助手

### 它在做什么

在会议前自动整理相关资料、生成会议议程、汇总背景信息，并输出待确认问题或行动项。

比如，你只给它一个会议主题，或者一个客户名称，它需要自己去找背景资料、整理上下文、识别哪些信息值得放进会前材料，再把这些内容收敛成一份可交付结果。

### 为什么它像 Agent

这个场景像 Agent，不是因为它“会总结”，而是因为它通常需要经历这样一条链路：

* 先理解会议目标
* 再决定应该搜什么资料
* 搜到资料后再判断哪些内容重要
* 信息不够时继续补资料
* 最后把零散信息整理成议程、摘要和待确认项

这里面最关键的不是“生成文字”，而是它在围绕目标持续推进任务。

### 它最像哪一类任务

这个案例最适合帮助你理解第一类 Agent 场景：

**信息搜集 + 整理交付**

也就是：目标已经很清楚，但为了完成交付，系统需要自己去找信息、筛选信息、组织信息。

### 哪些部分其实不一定非得用 Agent

如果你的会议模板固定、输入也固定，比如“每周例会永远按同一个模板生成议程”，那这一部分更像普通工作流。
真正更像 Agent 的地方在于：

* 会议主题经常变化
* 需要动态搜索资料
* 背景信息来源不止一个
* 系统要自己判断哪些内容值得纳入结果

### 这个案例适合你先建立什么直觉

它很适合帮助你理解 <span class="case-accent">Agent 的最小闭环</span>：

`拿到目标 -> 搜集资料 -> 整理结果 -> 输出交付`

<div class="case-flow">
  <div class="case-flow-step case-flow-step-input">
    <span class="case-flow-kicker">输入</span>
    <strong>会议目标</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">处理</span>
    <strong>搜集资料</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">处理</span>
    <strong>整理背景</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">生成</span>
    <strong>生成议程</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step case-flow-step-output">
    <span class="case-flow-kicker">输出</span>
    <strong>待确认事项</strong>
  </div>
</div>

---

## 案例 2：邮件自动回复助手

### 它在做什么

根据邮件内容、场景或预设规则，自动生成回复内容，必要时做基础分类、转发、升级处理或安排后续跟进。

这类场景非常常见。LangGraph 官方教程甚至直接拿“客服邮件处理”作为示例：读取来信、判断主题和紧急程度、搜索知识库、起草回复、复杂问题交给人工、必要时安排 follow-up。([LangChain文档][3])

### 为什么它特别值得拿来做对比

因为这个案例很适合帮助我们区分一个非常重要的问题：

**什么部分像 Agent，什么部分其实更像工作流。**

### 哪些地方像 Agent

* 需要理解邮件语义，而不是只看关键词
* 需要判断这封邮件想解决什么问题
* 需要决定是直接回复、查资料后回复，还是升级给人工
* 某些回复还要参考历史上下文、知识库或用户状态

### 哪些地方更像工作流

* 收到邮件后触发处理
* 根据分类进入固定模板
* 满足某些条件就自动转发
* 满足低风险条件就自动发送

所以这个案例真正重要的地方不在“自动回邮件”本身，而在于它会帮你建立一个很重要的判断：

**很多真实系统不是“纯 Agent”，而是“工作流 + Agent”的组合。**

### 这个案例适合你理解什么

它特别适合建立这样一层认识：

* “触发”和“流转”通常更像工作流
* “理解”“判断”“选择下一步动作”更像 Agent

换句话说，现实世界里很多 Agent 都不是从头到尾自由发挥，而是嵌在一条更大的业务流程里，负责其中那些需要动态判断的部分。
这也和 LangChain 对二者的区分一致：工作流是预先定义好的路径，Agent 是动态决定过程和工具使用。([LangChain文档][2])

<div class="case-flow">
  <div class="case-flow-step case-flow-step-input">
    <span class="case-flow-kicker">触发</span>
    <strong>收到邮件</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">理解</span>
    <strong>识别内容与场景</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">判断</span>
    <strong>选择回复方式</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">生成</span>
    <strong>回复或分类转发</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step case-flow-step-output">
    <span class="case-flow-kicker">结果</span>
    <strong>自动发送或流转</strong>
  </div>
</div>

---

## 案例 3：招聘流程助手

### 它在做什么

读取岗位需求、筛选候选人资料、做基础匹配、生成推荐或拒绝意见，并协助推进招聘流程。

比如，它可能要同时读取岗位描述、简历、候选人的项目经验、技能关键词、过往沟通记录，再产出一份“推荐 / 待观察 / 不匹配”的判断结果。

### 为什么它像 Agent

这个场景不是简单规则匹配，而是典型的 **多输入判断任务**：

* 需要比较多个来源的输入
* 需要根据岗位目标做中间判断
* 需要给出“为什么推荐 / 为什么不推荐”的解释
* 资料不足时，可能还要补充提问或请求更多信息

这里真正像 Agent 的地方，不是“自动打分”，而是它在做一连串判断、比较和收敛。

### 它最像哪一类任务

这个案例最适合帮助你理解第二类 Agent 场景：

**多输入判断 + 推荐输出**

也就是：输入不是一个，标准也不是死的，系统需要综合多个信息源给出有解释性的结论。

### 哪些部分不一定适合全自动

这个案例也很适合提醒新手：
**不是所有能做“判断”的系统都适合全自动。**

招聘本身就带有人才评估、流程公平、业务风险等问题。
所以这里更合理的定位通常是：

* Agent 负责预筛、摘要、对比、辅助推荐
* 最终决定仍然由人来做

也就是说，这类场景很像 Agent，但常常更适合“辅助决策”，而不是“完全代替决策”。

### 这个案例适合你理解什么

它很适合帮助你建立一个更成熟的认识：

**Agent 不只是“帮你执行动作”，它也经常承担“多步判断和推荐”。**

<div class="case-flow">
  <div class="case-flow-step case-flow-step-input">
    <span class="case-flow-kicker">输入</span>
    <strong>岗位需求</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">读取</span>
    <strong>候选人资料</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">匹配</span>
    <strong>做基础筛选</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">判断</span>
    <strong>生成推荐意见</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step case-flow-step-output">
    <span class="case-flow-kicker">输出</span>
    <strong>推进招聘流程</strong>
  </div>
</div>

---

## 案例 4：法律文档审阅助手

### 它在做什么

读取合同或法律文件，提取关键条款、识别潜在风险、生成摘要，并协助做初步审阅。

OpenAI 在 Agents 相关资料里也直接把法务辅助列为典型 use case：文件检索、参考案例、辅助专业人员做初步处理。([OpenAI][4])

### 为什么它像 Agent

这个场景像 Agent，不是因为它“能总结长文档”，而是因为它经常需要一条持续推进的处理过程：

* 先读取和切分文档
* 再定位重点条款
* 再围绕风险点做提取、比较和解释
* 最后生成结构化摘要或审阅意见

这个过程不是单轮问答，而是围绕一个目标逐步逼近结果。

### 它最像哪一类任务

这个案例最适合帮助你理解第三类 Agent 场景：

**复杂信息处理 + 风险提示**

也就是：系统面对的信息量很大、结构复杂，不能只靠一次“问模型”就结束，而是要不断缩小范围、提炼重点、形成判断。

### 这个案例容易让新手误解的地方

很多人会觉得：
“它不就是长文档总结吗？为什么也算 Agent？”

这是个很好的问题。

如果只是“把一篇合同概括成三段话”，那它更像普通文档处理。
但如果它要：

* 自动定位哪些条款值得重点看
* 比较不同版本之间的变化
* 根据上下文识别潜在风险
* 对风险点给出解释和后续建议

那它就已经不是单纯的摘要工具，而更接近一个围绕审阅目标持续推进的 Agent。

### 这个案例适合你理解什么

这个案例能帮助你建立一个更成熟的认识：

**Agent 并不一定总在“操作网页”或“执行命令”，它也可以围绕复杂信息处理持续推进任务。**

<div class="case-flow">
  <div class="case-flow-step case-flow-step-input">
    <span class="case-flow-kicker">输入</span>
    <strong>读取法律文档</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">定位</span>
    <strong>关键条款</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">分析</span>
    <strong>识别潜在风险</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">生成</span>
    <strong>输出摘要</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step case-flow-step-output">
    <span class="case-flow-kicker">辅助</span>
    <strong>初步审阅</strong>
  </div>
</div>

---

## 案例 5：旅行规划助手

### 它在做什么

根据预算、时间、地点偏好和出行需求，规划行程、安排路线、整理住宿交通信息，并形成可执行的旅行计划。

OpenAI 的公开案例里也提到过旅行代理类场景，例如结合知识库和政策信息来为用户提供更准确的旅行帮助。([OpenAI][4])

### 为什么它像 Agent

这是一个很经典的 Agent 场景，因为它非常符合一句常见判断标准：

**目标清楚，但路径不固定。**

用户的目标可能很明确，比如：

* 去哪几天
* 预算大概多少
* 喜欢城市、人文还是自然
* 能不能接受早班机
* 想不想带孩子
* 是否优先考虑交通便利

但系统不可能事先写死所有路线。
它需要根据这些条件动态搜索、组合、取舍、调整，最后给出一个整体可用的方案。

### 它最像哪一类任务

这个案例非常适合理解：

**多约束规划 + 迭代调整**

也就是：不是简单找一个答案，而是在多个约束之间不断平衡，最后形成一个能落地的结果。

### 为什么这个案例对新手特别重要

因为它最容易把“聊天机器人”和“Agent”区分开。

* 普通聊天机器人更像“你问一个问题，我答一个结果”
* 旅行规划 Agent 更像“你给一个目标，我帮你不断收集信息、平衡约束、形成方案”

这也是为什么旅行规划常常被用来举 Agent 的例子：它天然就是一个多步收敛任务，而不是一次回答任务。([OpenAI][5])

### 这个案例适合你理解什么

它很适合帮助新手记住一句话：

**<span class="case-accent">目标清楚，但路径不固定</span>，这正是很多 Agent 任务的典型特征。**

<div class="case-flow">
  <div class="case-flow-step case-flow-step-input">
    <span class="case-flow-kicker">输入</span>
    <strong>预算 / 时间 / 偏好</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">搜索</span>
    <strong>景点与交通住宿</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">组合</span>
    <strong>生成行程方案</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">迭代</span>
    <strong>根据约束调整</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step case-flow-step-output">
    <span class="case-flow-kicker">输出</span>
    <strong>旅行计划</strong>
  </div>
</div>

---

## 案例 6：Markdown 文档校验助手

### 它在做什么

检查 Markdown 文档的格式、结构或规范问题，指出不符合规则的地方，并给出修正建议；后续还可以继续接到自动修复动作上。

### 为什么把它放进来

这个案例看起来没有前面几个“像产品”，但它有一个很大的优点：

**它特别适合开发者建立最小 Agent 直觉。**

因为它不像旅行规划、法务审阅那样听起来很“大”，但结构很清楚，也很接近程序员日常会碰到的问题。

### 为什么它像 Agent

* 需要读取真实输入，而不是只接受一句提问
* 需要按照规则做判断，而不只是生成文字
* 需要定位问题、组织输出、给出建议
* 后续还可以根据结果决定下一步动作，比如自动修复、重新检查、生成报告

这正好体现了一个轻量但完整的任务闭环：

`读输入 -> 做判断 -> 输出结果 -> 继续动作`

### 它最像哪一类任务

这个案例更偏向一种“轻量 Agent”场景：

**规则检查 + 结果处理**

它不一定像旅行规划那样需要大量动态搜索，但它仍然具备 Agent 的一些核心特征：围绕目标处理输入、做中间判断、决定下一步输出。

### 这个案例适合你理解什么

如果你本来就有编程基础，这个案例会比抽象解释更容易建立直觉。
因为它直接体现了：

**Agent 不一定要很大、很复杂、很“像人”；它也可以只是一个围绕目标持续处理任务的小系统。**

<div class="case-flow">
  <div class="case-flow-step case-flow-step-input">
    <span class="case-flow-kicker">输入</span>
    <strong>读取 Markdown 文档</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">检查</span>
    <strong>格式与结构</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">识别</span>
    <strong>标出问题位置</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step">
    <span class="case-flow-kicker">建议</span>
    <strong>给出修改方案</strong>
  </div>
  <span class="case-flow-arrow" aria-hidden="true">→</span>
  <div class="case-flow-step case-flow-step-output">
    <span class="case-flow-kicker">扩展</span>
    <strong>接自动修复</strong>
  </div>
</div>

---

## 从这 6 个案例里，真正应该先看到什么

不需要记住每个案例属于哪个行业。
真正重要的是，它们背后其实都在重复几种相似的任务结构。

### 第一类：信息搜集 + 整理交付

典型代表：

* 会议准备助手
* 部分邮件处理助手
* 一部分旅行规划助手

这类任务的特点是：

* 目标明确
* 需要到外部找资料
* 需要筛选和组织信息
* 最后形成一个能交付的结果

这种场景通常很适合 Agent，因为“搜什么、看什么、怎么组织”并不总是固定的。
OpenAI 和 LangChain 的文档也都把这类“检索信息、调用工具、逐步收敛”的任务视为典型 agentic workflow。([OpenAI][4])

### 第二类：多输入判断 + 推荐输出

典型代表：

* 招聘流程助手
* 法律文档审阅助手
* 一部分邮件分流助手

这类任务的特点是：

* 输入来源不止一个
* 需要中间判断
* 结果不只是“答一个问题”，而是要形成推荐、风险提示或处理意见
* 常常需要解释“为什么得到这个结论”

这种任务也很适合 Agent，因为它不是单步匹配，而是持续比较、持续判断、持续收敛。

### 第三类：多约束规划 + 迭代调整

典型代表：

* 旅行规划助手
* 某些项目排期、任务分解、资源协调场景

这类任务的特点是：

* 目标明确
* 约束很多
* 路径天然不固定
* 通常需要多轮调整，直到方案足够可用

这种场景几乎就是最典型的 Agent 使用场景之一，因为“下一步该怎么做”本身就是动态决定的。

---

## 反过来，哪些场景先别急着上 Agent

看完前面的案例后，一个更重要的问题是：

**什么场景看起来也能用 AI，但其实不一定值得先上 Agent？**

### 1. 路径完全固定的任务

比如：

* 表单提交后固定发通知
* 文件上传后固定转格式
* 每天定时汇总同一个报表
* 关键词命中后走固定模板

这类任务往往更像 **工作流** 或普通自动化。
因为它的路径基本可以提前写死，不需要动态决定下一步。([LangChain文档][2])

### 2. 一次回答就能解决的问题

比如：

* 查一个概念
* 写一段文案
* 总结一小段文本
* 把一句话翻译成另一种语言

这类任务更像单轮 AI 应用，而不是 Agent。
因为它们通常不需要持续判断、持续调用工具、持续推进任务。

### 3. 高风险且不适合全自动拍板的任务

比如：

* 最终录用决定
* 最终法律意见
* 高风险财务审批
* 涉及重大责任的医疗建议

这些场景里，Agent 可以很有用，但更适合做：

* 预处理
* 摘要
* 风险提示
* 备选方案生成
* 辅助决策

而不是“自动替你做最终决定”。

这也是你在后面判断“Agent 值不值得上”时很重要的一条标准：
**适合 Agent，不等于适合全自动。**
---

## 小结

先不要急着记“AI Agent 可以做很多事”。
这一篇真正想帮你建立的，是更具体的一层判断：

### 你应该先看到的，不是行业，而是任务结构

很多看起来很不一样的案例，背后其实都在重复这几类问题：

* 需要搜集信息并整理成交付结果
* 需要综合多个输入做判断和推荐
* 需要在多个约束下持续调整方案

### 你也应该先学会排除

并不是所有 AI 场景都适合 Agent。
如果任务路径已经固定，或者一次回答就能完成，或者风险高到不适合自动拍板，那通常就不应该一上来先上 Agent。

### 读完这一篇后，你至少应该先有这个印象

**AI Agent 更适合那些需要围绕目标持续判断、持续行动、持续收敛的任务。**

带着这个印象，再去读下一篇《什么是 AI Agent》，你会更容易理解：
为什么 Agent 不是“更强的聊天机器人”，而是一类围绕目标推进任务的系统。

[1]: https://github.com/ashishpatel26/500-AI-Agents-Projects?utm_source=chatgpt.com "GitHub - ashishpatel26/500-AI-Agents-Projects: The 500 AI Agents ..."
[2]: https://docs.langchain.com/oss/python/langgraph/workflows-agents?utm_source=chatgpt.com "Workflows and agents - Docs by LangChain"
[3]: https://docs.langchain.com/oss/python/langgraph/thinking-in-langgraph?utm_source=chatgpt.com "Thinking in LangGraph - Docs by LangChain"
[4]: https://openai.com/index/new-tools-for-building-agents/?utm_source=chatgpt.com "New tools for building agents - OpenAI"
[5]: https://openai.com/solutions/use-case/agents/?utm_source=chatgpt.com "Solutions for agentic workflows | OpenAI"

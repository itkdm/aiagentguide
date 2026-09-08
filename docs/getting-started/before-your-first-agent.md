---
title: 开发第一个 AI Agent 前需要知道什么
description: "从代码和系统视角理解 Context、Instructions、Tool Calling、Structured Output、State 与 Agent Loop，搭建第一个 AI Agent 的最小执行系统。"
summary: 从软件工程视角梳理开发第一个 AI Agent 前需要理解的 Context、Instructions、Tool Calling、Structured Output、State 和 Agent Loop。
keywords:
  - AI Agent 开发
  - Agent 入门开发
  - Tool Calling
  - Agent Loop
  - Agent State
  - Agent Context
tags:
  - AI Agent
  - Agent 开发
  - Tool Calling
  - Agent Loop
  - 基础概念
author: 布吉岛
lastUpdated: 2026-09-07
status: published
assets: none
reviewed: false
sourceType: original
draft: false
noindex: false
---

# 开发第一个 AI Agent 前需要知道什么

## 开发 Agent，本质上是在搭一个执行系统

> **我们不是在“写一个更复杂的 Prompt”，而是在搭建一个围绕大模型运行的执行系统。**

最简单的大模型应用可能只有：

```text
用户输入
   ↓
LLM
   ↓
模型输出
```

程序把输入交给模型，再把回答返回给用户。

也就是我们常说的调用大模型API。

但 Agent 还需要解决更多问题：

```text
模型这一轮能看到什么？

系统应该告诉模型哪些规则？

模型怎么表达“我要调用工具”？

谁真正执行这个工具？

工具结果保存在哪里？

下一轮怎么继续？

什么时候退出？
```

所以 Agent 可以大概理解为：

```text
                宿主程序
                   │
       ┌───────────┼───────────┐
       │           │           │
    Context      State       Tools
       │           │           │
       └───────────┼───────────┘
                   ↓
                  LLM
                   ↓
             判断下一步动作
                   ↓
              宿主程序执行
                   ↓
              返回新的结果
                   ↓
                继续循环
```

这里的大模型当然非常重要。

但它并不负责整个系统。

模型主要负责：

> **根据当前提供的信息做理解、推理和决策。**

真正的工具执行、权限控制、状态保存、循环调度，仍然掌握在我们的程序代码里。

例如模型可能产生一个工具调用意图，它生成的仍然是一个文本：

```text
search_web("AI Agent")
```

但真正发起网络请求的，是宿主程序中的搜索工具。

再比如模型判断：

```text
应该读取 package.json
```

真正打开文件的，仍然是程序代码里面的文件工具。

所以开发 Agent 时，可以先这样分类：

```text
LLM
→ 决定接下来想做什么

宿主程序
→ 判断是否允许，并真正执行

Tool
→ 和外部环境交互

State
→ 保存任务进度

Context
→ 把当前需要的信息提供给模型
```

把这层关系理解以后，后面我们学习各种框架会容易理解很多。

---

## Context：模型每一轮到底能看到什么

Agent 连续执行很多轮以后，很容易产生一个误解：

> 刚才已经告诉过模型了，它应该还记得吧？

实际上，模型调用是无状态的：

> **模型当前能够依据什么做判断，取决于这一轮请求里到底给了它什么信息。**

即使一些 API 或 SDK 提供会话、线程等服务端状态能力，真正参与具体某一次模型推理的，仍然是当前被组织进模型上下文的信息。

所以 Agent 每进行一轮判断之前，系统通常都需要构建当前的 **Context**。

Context 可能包括：

```text
System Instructions
+
用户当前目标
+
必要的历史消息
+
任务当前状态
+
上一轮工具执行结果
+
当前可用工具说明
+
需要参考的文件或资料
```

例如一个 Coding Agent 正在修复登录 Bug。

第一轮可能只有：

```text
用户目标：
修复登录接口 500 错误

当前可用工具：
- 搜索代码
- 读取文件
- 修改文件
- 执行测试
```

模型判断：

> 先搜索登录相关代码。

工具执行以后返回：

```text
LoginController.java
LoginService.java
AuthService.java
```

到了下一轮，模型能够看到的上下文可能就变成：

```text
目标：
修复登录接口 500 错误

上一轮已经执行：
搜索登录代码

搜索结果：
LoginController.java
LoginService.java
AuthService.java

当前可用工具：
- 读取文件
- 搜索代码
- 修改文件
- 执行测试
```

模型是在这个新的 Context 上继续判断。

所以 Agent 并不是：

```text
模型天然记住整个世界
```

而是：

```text
系统里有很多信息
       ↓
选择当前需要的部分
       ↓
组织成 Context
       ↓
交给模型
```

这也解释了为什么 Context 会直接影响 Agent 表现。

如果关键工具结果没有放进去，模型就不知道刚才发生了什么。

如果无关内容塞得太多，真正重要的信息又可能被淹没。

所以后面学习 Agent 时，会经常遇到一个比“Prompt 怎么写”更重要的问题：

> **这一轮到底应该给模型看什么？**

这就是 Context Engineering 后续真正要解决的事情。

我们这一篇先建立这个认识就可以了。

---

## Instructions：怎么定义 Agent 的角色与边界

有了 Context，还需要告诉模型：

> **这个系统应该怎么工作。**

这部分通常通过 Instructions 完成。

大多数时候我们会直接把它叫作 System Prompt，但在 Agent 系统里，它承担的职责往往比普通 Prompt 更广。

简单的 Prompt 可能只是：

```text
帮我总结下面这篇文章。
```

而一个 Coding Agent 的 Instructions 更可能包含：

```text
你负责处理当前代码仓库中的开发任务。

允许：
- 搜索项目代码
- 读取项目文件
- 修改项目代码
- 执行测试

禁止：
- 修改项目目录之外的文件
- 修改系统配置
- 直接部署生产环境

执行要求：
- 修改前先理解现有实现
- 修改后执行相关测试
- 工具执行失败时先分析错误，不要盲目重复
- 没有足够信息时继续收集信息

完成条件：
- 用户目标已经满足
- 相关测试通过
- 最后给出修改摘要
```

这时候 Instructions 已经不只是：

> “扮演一个优秀程序员。”

它实际上在定义整个 Agent 的运行规则。

常见内容包括：

* Agent 的任务目标
* 可以做什么
* 不允许做什么
* 工具使用规则
* 权限边界
* 输出要求
* 什么时候需要人工确认
* 什么情况下认为任务完成

所以 Instructions 可以理解成：

> **Agent 执行系统中的一组高层规则。**

但是需要注意的是，Instructions 能引导模型做出更合适的决定，但它并不具备严格的安全边界。

例如 Instructions 写着：

```text
禁止删除数据库。
```

真正可靠的系统还应该在程序层面：

```text
根本不提供删除数据库的工具
```

或者：

```text
执行删除前必须通过权限检查
```

所以：

```text
Instructions
→ 告诉模型应该怎么做

程序控制
→ 决定模型实际上能不能做
```

这两层不能混在一起，大多数时候都要同时做约束。

---

## Structured Output 与 Tool Calling：模型怎么连接外部世界

到这里，我们有了：

```text
Instructions
+
Context
+
LLM
```

但模型依然主要是在生成内容。

Agent 真正开始和外部世界发生交互，需要进入 **Tool Calling**。

假设当前 Agent 有一个天气查询工具：

```text
get_weather(city)
```

用户说：

> 帮我查一下东京今天的天气。

模型本身并不会真的运行我们程序里的：

```javascript
getWeather("Tokyo")
```

它能做的是产生一个结构化的工具调用意图。

可以理解成：

```json
{
  "tool": "get_weather",
  "arguments": {
    "city": "Tokyo"
  }
}
```
本质上还是生成的一个文本，

宿主程序收到以后再判断：

```text
模型想调用 get_weather
       ↓
这个工具存在吗？
       ↓
参数合法吗？
       ↓
当前有权限执行吗？
       ↓
真正调用 get_weather()
```

然后工具得到结果：

```json
{
  "temperature": 28,
  "condition": "Rain"
}
```

宿主程序再把这个 Tool Result 放回后续上下文。

整个过程就是：

```text
LLM
 ↓
产生 Tool Call
 ↓
宿主程序解析
 ↓
执行真正的函数 / API
 ↓
得到 Tool Result
 ↓
返回模型
```

所以 Tool Calling 的关键不是：

> 模型拥有了调用 API 的能力。

而是：

> **模型和宿主程序之间建立了一套结构化的行动协议。**

模型负责表达：

```text
我想做什么
```

程序负责决定：

```text
是否允许，以及怎么真正执行
```

---

Structured Output 在这里也非常重要。

如果模型只是输出一句自然语言：

```text
我觉得接下来应该查询东京天气。
```

程序很难稳定判断：

* 它到底是不是要调用工具
* 工具叫什么
* 参数是什么
* 参数类型对不对

而结构化输出可以约束成：

```json
{
  "city": "Tokyo"
}
```

并规定 Schema 结构：

```text
city:
  type: string
  required: true
```

于是程序就能按照固定协议读取数据。

我们要重点理解的是：

> **Agent 系统需要把模型的自然语言决策，转换成程序能够可靠处理的数据结构。**

这也是为什么 Schema 在 Agent 开发里非常重要。

也是很多面试官经常问的一点，我们后续栏目会详细讲解相关技术方案。
---

## State：怎么保存和流转任务进度

Context 解决的是：

> **这一轮模型能看到什么？**

State 解决的则是：

> **整个任务现在进行到了哪里？**

这两个概念很容易混在一起。

可以先这样区分：

| Context       | State          |
| ------------- | -------------- |
| 当前这一轮提供给模型的信息 | 整个任务真实保存的执行状态  |
| 主要为模型当前决策服务   | 主要为任务生命周期服务    |
| 会受到上下文窗口限制    | 可以保存在内存、数据库等位置 |
| 不一定包含系统全部信息   | 可以保存更完整的业务数据   |

例如一个 Coding Agent 的 State 可能是：

```json
{
  "goal": "修复登录接口 500 错误",
  "step": 5,
  "filesRead": [
    "LoginController.java",
    "LoginService.java"
  ],
  "filesChanged": [
    "LoginService.java"
  ],
  "lastTestPassed": false,
  "lastError": "UserRepository mock is null"
}
```

这些信息描述的是：

> 这个任务现在到底执行到哪一步了。

但是下一轮没有必要把这整个对象原封不动地全部塞给模型。

系统可能只从 State 中提取当前真正需要的信息：

```text
目标：
修复登录接口

已经修改：
LoginService.java

最新测试结果：
失败

最新错误：
UserRepository mock is null
```

再把这些内容组织进 Context：

```text
State
  ↓
选出当前需要的信息
  ↓
Context
  ↓
LLM
```

所以：

> **State 是系统保存的事实，Context 是当前这一轮交给模型的信息。**

---

还有一个常见混的地方是：

> Message History 是不是 State？

可以把历史消息看成 State 的一种来源，但它们并不完全等价。

例如对话历史里可能记录：

```text
用户：修复登录 Bug。
助手：我先检查错误日志。
工具：返回 NullPointerException。
```

但系统真正的业务状态还可能保存：

```text
当前 Step：7
已修改文件：2 个
累计工具调用：6 次
测试状态：失败
剩余预算：……
```

这些东西并不一定适合全部塞进消息列表。

所以实际上做复杂 Agent 时，通常会逐渐把：

```text
聊天历史
```

和：

```text
任务状态
```

分开管理。

我们后续做第一个 Agent 并不需要把 State 设计得很复杂。

甚至一个普通 JavaScript / Python 对象就够了。

关键是要先理解：

> **任务状态应该由程序管理，而不是指望模型自己记住。**

---

## Agent Loop：怎么用代码把整个系统串起来

前面的几个概念单独看都不复杂：

```text
Context
Instructions
Tool Calling
Structured Output
State
```

真正让它们变成 Agent 的，是：

**Agent Loop。**

前面的《Agent 是怎么运转的》已经从执行过程理解过 Loop。

现在换到代码视角来看，它其实没有那么神秘。

一个简单版伪代码大概可以写成：

```javascript
let state = createInitialState(userInput)

for (let step = 0; step < MAX_STEPS; step++) {
  const context = buildContext(state)

  const response = await model.generate({
    instructions,
    context,
    tools
  })

  if (response.toolCall) {
    const result = await executeTool(response.toolCall)

    state = updateState(state, {
      toolCall: response.toolCall,
      toolResult: result
    })

    continue
  }

  if (response.finished) {
    return response.output
  }
}

throw new Error("Agent exceeded max steps")
```

我们先不用纠结不同 SDK 的具体语法。

先来看结构。

---

第一步：

```javascript
const context = buildContext(state)
```

对应：

**Context**

系统从当前 State 中取出这一轮模型真正需要的信息。

---

第二步：

```javascript
const response = await model.generate(...)
```

对应：

**LLM + Instructions**

模型根据当前上下文、系统规则和可用工具判断下一步。

---

第三步：

```javascript
if (response.toolCall)
```

对应：

**Structured Output / Tool Calling**

模型没有直接执行动作，而是返回结构化的 Tool Call。

---

第四步：

```javascript
const result = await executeTool(response.toolCall)
```

对应：

**Tools**

宿主程序真正执行函数、API、数据库查询或者文件操作。

---

第五步：

```javascript
state = updateState(...)
```

对应：

**State**

系统把新的工具结果和任务进度保存下来。

---

最后：

```javascript
for (...)
```

就是最简单的：

**Agent Loop**

于是前面所有概念最终会组合成：

```text
State
 ↓
buildContext()
 ↓
Context
 ↓
LLM + Instructions
 ↓
Tool Call
 ↓
executeTool()
 ↓
Tool Result
 ↓
updateState()
 ↓
下一轮
```

如果模型认为任务已经完成：

```text
返回结果
↓
结束 Loop
```

如果超过最大 Step：

```text
停止执行
```

如果需要人工确认：

```text
暂停 Loop
↓
等待用户确认
```

到这里，其实已经能看出一个最小 Agent 的基本代码结构了。

它没有什么神秘组件。

底层仍然是我们熟悉的软件工程：

```text
变量
函数
API
条件判断
循环
异常处理
状态管理
```

只不过其中一个关键决策节点交给了大模型。

这也是我们后续理解各种 Agent Framework 的基础。

框架最终还是在帮我们处理这些事情：

```text
Context 怎么构建
State 怎么保存
Tool 怎么注册
Tool Result 怎么回填
Loop 怎么运行
异常怎么处理
什么时候结束
```

---

## 架构做减法：第一个 Agent 先不要学什么

Agent 领域的概念非常多。

我们在不同文章中见到多太多名词了：

```text
LangGraph
AgentScope
CrewAI
MCP
A2A
Multi-Agent
Memory
Reflection
Planning
Vector Database
Sandbox
Agent Harness
Rerank
Graph RAG
……
```

如果第一次开发 Agent 就把这些东西全部用进来，很容易导致还没有理解 Agent，就先被架构搞懵了。

所以我们做第一个 Agent 的目标非常简单：

> **先把一个最小的 Model → Tool → Result → Model 循环真正跑起来。**

---

### 先不要急着使用重型 Agent Framework

LangGraph、AgentScope 这些框架非常有价值。

它们会帮我们处理：

* 状态管理
* 节点编排
* 持久化
* Human-in-the-loop
* Tool Calling
* 重试
* Checkpoint

但第一个 Agent 完全可以先不用。

甚至只需要：

```text
LLM API
+
几个普通函数
+
一个 State 对象
+
一个循环
```

就足够理解底层发生了什么。

等这个最小 Loop 跑通以后，再去看框架，会发现很多设计其实是在帮我们解决已经遇到过的问题。

---

### 先不要急着做 Multi-Agent

如果第一个 Agent 还没有跑通，就开始设计：

```text
Planner Agent
      ↓
Coder Agent
      ↓
Reviewer Agent
      ↓
Manager Agent
```

通常会让问题迅速变复杂。

因为每增加一个 Agent，就会增加新的：

* Context
* State
* 通信协议
* 调度逻辑
* 错误边界
* 成本
* 调试难度

很多任务一个 Agent + 几个 Tool 就能完成。

所以我们先把：

```text
Single Agent
```

做好，再考虑：

```text
Multi-Agent
```

---

### 先不要急着做复杂 Memory

Memory 也是特别容易把入门开发做复杂的一块。

第一版我们完全可以只使用：

```text
Message History
+
简单 State
```

先让当前任务能够连续执行。

千万不需要一开始就设计：

```text
短期记忆
长期记忆
语义记忆
情景记忆
用户画像
向量记忆
Memory Agent
```

真正出现“跨会话需要长期保存什么信息”以后，再解决长期 Memory 会更合理。

---

### 先不要急着上 MCP

我认为 MCP 同样是一个很重要的功能，但是完全可以先把他理解为一个工具：

> **Agent 能调用工具就行，并不需要先有 MCP。**

第一个 Agent 可以直接注册本地函数：

```javascript
getWeather()
searchWeb()
readFile()
```

模型通过 Tool Calling 使用这些函数就已经足够。

MCP 更多解决的是：

> **如何用一种标准协议把外部工具、数据和 Agent 连接起来。**

所以自然的学习顺序是：

```text
先理解 Tool Calling
      ↓
自己注册几个 Tool
      ↓
真正理解模型和工具怎么交互
      ↓
再学习 MCP
```

否则很容易让 MCP 打乱我们的学习节奏。

---

第一个 Agent 最需要的，其实只有：

```text
LLM
+
Instructions
+
Context
+
Tools
+
State
+
Loop
```

把这几个东西跑通以后，后面很多复杂概念我们都可以逐步扩展，而且到时候我们也不需要自己手写了，完全可以利用现成框架的能力。

---

## 总结

从代码视角看，我们开发 Agent 并不是在寻找一个“会自主工作的神奇模型”，至少目前不是。

准确地说，我们是在搭一个执行系统，模型只是其中很重要的一个环境：

```text
Instructions
      ↓
Context
      ↓
LLM
      ↓
Structured Tool Call
      ↓
宿主程序执行 Tool
      ↓
Tool Result
      ↓
更新 State
      ↓
重新构建 Context
      ↓
继续 Loop
```

其中：

* **Instructions** 定义系统角色、规则和边界
* **Context** 决定模型当前这一轮能够依据哪些信息做判断
* **Structured Output / Tool Calling** 让模型用结构化方式表达行动意图
* **Tool** 负责真正和外部环境交互
* **State** 保存整个任务的执行进度
* **Agent Loop** 把这些部分串成持续运行的系统

而真正的执行权始终掌握在宿主程序里。

先把最小闭环跑通：

```text
用户目标
   ↓
模型判断
   ↓
调用工具
   ↓
工具返回结果
   ↓
模型继续判断
   ↓
完成任务
```

理解了这套最小系统以后，下一步就可以不再停留在概念层面。

接下来，我们直接用代码，把第一个 AI Agent 真正跑起来。

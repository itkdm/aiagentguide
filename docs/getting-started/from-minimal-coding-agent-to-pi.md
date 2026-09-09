---
title: 从最小 Coding Agent 到 Pi：一个真实 Coding Agent 还需要什么
description: "从最小 Coding Agent 出发，了解真实 Coding Agent 在工具调用、上下文管理、可靠性和执行环境方面还需要补充哪些能力。"
summary: 本文将在最小 Coding Agent 的基础上，进一步分析 Pi 这类真实 Coding Agent 还需要解决的工程问题。
keywords:
  - Coding Agent
  - Pi Agent
  - Pi Agent是什么
  - Pi Agent教程
  - Agent 工程实践
  - Agent 上下文管理
  - Agent 工具调用
tags:
  - AI Agent
  - Coding Agent
  - Pi
  - Agent 工程
author: 布吉岛
lastUpdated: 2026-09-08
status: draft
assets: none
reviewed: false
sourceType: original
draft: true
noindex: true
---

# 从最小 Coding Agent 到 Pi：一个真实 Coding Agent 还需要什么

::: warning 阅读提示

这篇文章内容比较长，包含多个章节。一次没有读完很正常，可以按照章节分几次阅读，每一节先理解当前讨论的问题即可。

:::

## 为什么入门最后还要讲一次 Pi

到这里，「入门」栏目已经接近尾声。

前面我们从 Agent、Workflow、RAG 等基本概念开始，一直到自己实现一个最小 Agent，再进一步实现一个能够读取文件、修改代码、执行命令的最小 Coding Agent。

如果只是为了理解 Agent 最核心的运行方式，其实到这里已经足够了。

我们已经能够把一个 Agent 最基础的执行过程写出来：

```text

todo

用户任务
   ↓
模型判断
   ↓
Tool Call
   ↓
执行工具
   ↓
Tool Result
   ↓
重新进入 Context
   ↓
模型继续判断
```

甚至只需要一个很小的 `while` 循环，就能够让这套流程真正跑起来。

但上一篇做到最后，我们也留下了一串问题：

```text
工具调用一直出错怎么办？

模型反复调用同一个工具怎么办？

Context 越来越长怎么办？

对话怎么持久化？

执行一半程序退出怎么办？

不同模型 Provider 怎么统一？

工具结果太大怎么办？

文件路径和命令权限怎么控制？

命令一直不结束怎么办？

如何支持流式输出？

如何让用户中途修改指令？

怎么做人工审批？

工具越来越多以后怎么管理？
```

这些问题并不会改变最底层的 Agent Loop，却会直接决定一个 Agent 能不能从“可以运行”，继续走到“真正可以长期使用”。

所以在正式结束「入门」栏目之前，我还是想再多做一步：

> **不要只停留在我们自己写出来的最小实现，而是真正打开一个有人长期开发和使用的 Agent 项目看一遍。**

我选择的是 [Pi](https://pi.dev/docs/latest)。

Pi 当前把自己定位成一个 **minimal terminal coding harness**。它并没有试图把所有 Agent 能力全部塞进核心，而是围绕 Coding Agent 最基础的执行链，继续补上模型接入、Agent Runtime、Session、Context、工具系统、流式事件和扩展能力。[Pi 的官方仓库](https://github.com/earendil-works/pi)当前也明确拆成了三个主要层次：

```text
pi-ai
→ 统一不同模型和 Provider

pi-agent-core
→ Agent Loop、工具调用和状态管理

pi-coding-agent
→ 真正面向用户的 Coding Agent
```

它并不是把 Agent 最核心的思想全部推翻，然后换成一套完全不同的架构。

相反：

> **最下面的那层 Loop 依然存在。**

真正增加的是围绕这层 Loop 的工程能力。

例如我们前面写 Tool 时，可能只是：

```typescript
const result = await executeTool(toolCall);
messages.push(result);
```

到了真实 Agent Runtime，就必须继续考虑：

```text
参数是否合法？

一轮出现多个 Tool Call 怎么办？

这些 Tool 应该并行还是串行？

工具执行过程中能不能取消？

模型输出被截断以后，Tool 参数还能不能执行？

工具执行失败以后，下一轮 Context 应该怎么构造？
```

Pi 当前的 `agent-loop.ts` 里，已经把这些问题真正放进了 Agent Runtime：模型响应、Tool Call、Tool Result、串行/并行执行、Abort、Steering、Follow-up 等都围绕同一条执行链组织起来。

再比如我们前面一直把：

```typescript
messages.push(...)
```

往后追加。

短任务没有问题。

但真实 Coding Agent 一次任务可能持续几十轮甚至更久，`read` 和 `bash` 又会不断产生大量内容。

Pi 对这个问题并不是简单“删掉旧消息”，而是引入了压缩 Compaction：

```text
完整历史
   ↓
较老部分生成 Summary
   +
最近一部分原始 Messages
   ↓
重新构建给模型的 Context
```

完整 Session 历史仍然保留，只是下一轮不需要把所有内容重新发送给模型。

这篇文章，我们不会按照 Pi 的 README 从安装、命令、快捷键开始逐项介绍，也不是写一篇“Pi 使用教程”的文章。

接下来会一直拿前面实现的最小 Coding Agent 作为参照：

```text
我们之前怎么实现
        ↓
为什么教学阶段这样已经够用
        ↓
到了真实项目以后会出现什么问题
        ↓
Pi 是怎么处理的
        ↓
为什么这样设计
```

有些地方，我们会发现 Pi 做得远比前面的示例复杂。

但也有一些地方我们会发现：

> **Pi 并没有选择全部自己解决。**

例如 Pi 本身并不提供一个完整的文件系统、网络和进程权限 Sandbox。默认情况下，它仍然使用启动 Pi 的用户和进程所拥有的系统权限；如果需要真正的隔离，官方建议使用容器或者 Sandbox。[Pi 官方文档](https://pi.dev/docs/latest)也把这类运行环境取舍放在了框架边界之外。

这其实同样值得我们学习。

因为一个真实 Agent 框架最重要的设计问题，不只是：

> 还能加入什么功能？

还有：

> **什么应该放在核心？什么应该做成扩展？什么应该交给运行环境？**

Pi 的极简思想，很大一部分就体现在这些取舍上。

所以这一篇既是对前面几个最小 Agent 的一次补充，也是我们第一次真正从一个实际项目出发，看看：

> **一个能够运行的 Agent，距离一个真实 Coding Agent，到底还差些什么。**

## 先认识 Pi：它到底是什么

Pi 官方描述为：

> **一个极简的终端 Coding Agent Harness。**

这里有两个词比较重要：

```text
Coding Agent
+
Harness
```

前者很好理解。

Pi 和 Codex、Claude Code 一样，核心场景都是让模型进入真实代码环境：

```text
读取文件
↓
执行命令
↓
修改代码
↓
根据结果继续工作
```

真正值得注意的是后面的：

```text
Harness
```

准确地说，它提供的是一套让模型、工具、Context、Session 和用户交互能够持续运行起来的 **Agent 执行底座**。

Pi 官方也一直强调一个设计方向：

```text
不要把所有可能的 Agent 功能
都默认塞进核心
```

例如它并没有默认内置：

```text
Plan Mode
Sub-Agent
```

而是更倾向于提供一套相对小的核心，再通过 Extension、Skill、Prompt Template 等方式继续扩展。

这和我们前面实现最小 Coding Agent 时的思路其实非常接近。

---

### Pi 为什么强调 Minimal Coding Harness

前一篇里，我们最终只给 Coding Agent 四个工具：

```text
read
write
edit
bash
```

Pi 默认给模型的核心 Coding Tools，也是：

```text
read
bash
edit
write
```
也就是说，Pi 并不是依靠：

```text
几十个内置工具
+
复杂 Planner
+
一堆专用 Agent
```

才成为 Coding Agent。

它最底层仍然建立在一个非常简单的能力集合上：

```text
读取
执行
修改
写入
```

这四个能力已经足够让模型完成大量代码任务。

真正复杂的部分，并不是：

> 再增加多少个 Tool。

而是：

> **怎么让这几个 Tool 在真实项目里长期、稳定、可恢复、可扩展地运行。**

这也是 Pi 最值得我们研究的地方。

---

### Pi 的三个核心层：pi-ai、pi-agent-core、pi-coding-agent

Pi 当前最核心的结构，可以先压缩成三层：

```text
┌───────────────────────────────────────┐
│          pi-coding-agent              │
│                                       │
│  真正面向 Coding Agent 用户的产品层   │
│                                       │
│  CLI / TUI                            │
│  Coding Tools                         │
│  Session                              │
│  Compaction                           │
│  Skills                               │
│  Extensions                           │
│  Context Files                        │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│           pi-agent-core               │
│                                       │
│  通用 Agent Runtime                   │
│                                       │
│  Agent Loop                           │
│  Tool Calling                         │
│  Tool Execution                       │
│  State                                │
│  Events                               │
│  Steering / Follow-up                 │
│  Abort                                │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│                pi-ai                  │
│                                       │
│  模型与 Provider 层                   │
│                                       │
│  Model                                │
│  Provider                             │
│  Auth                                 │
│  Streaming                            │
│  Tool Calling                         │
│  Token / Cost                         │
└───────────────────────────────────────┘
```

Pi 仓库 README 当前也明确把这三部分分别描述为：

```text
pi-ai
→ Unified multi-provider LLM API

pi-agent-core
→ Agent runtime with tool calling and state management

pi-coding-agent
→ Interactive coding agent CLI
```

这三个层次建议大家记住。

因为我们之前实现的最小 Coding Agent，其实已经隐约包含了这三层，只不过全部挤在了几个文件里。

---

先看最下面的 `pi-ai`。

我们之前直接写：

```typescript
const client = new OpenAI({
  apiKey,
});

const response =
  await client.chat.completions.create({
    model,
    messages,
    tools,
  });
```

这意味着我们的 Agent 和：

```text
OpenAI SDK
```

直接绑在了一起。

Pi 则把这一层单独拆了出去。

`pi-ai` 负责统一：

```text
OpenAI
Anthropic
Google
OpenRouter
Bedrock
……
```

这些不同 Provider。

而且它处理的不只是：

```text
model.generate()
```

还包括：

```text
模型列表
认证
Streaming
Tool Calling
Thinking / Reasoning
Token Usage
Cost
不同 API 协议
```

Pi 当前的 `pi-ai` 就是一个统一多 Provider LLM API。

所以：

```text
pi-agent-core
```

并不需要关心：

> 现在调用的是 OpenAI 还是 Anthropic。

它只需要面对一个相对统一的模型接口。

---

再往上一层是：

```text
pi-agent-core
```

这部分和我们前面写的：

```typescript
while (true) {
  const response = await callModel();

  const toolCalls =
    response.tool_calls ?? [];

  for (const toolCall of toolCalls) {
    const result =
      await executeTool(toolCall);

    messages.push(result);
  }
}
```

最相关。

它负责的就是 Agent 真正的执行循环。

只不过实际项目里，还要继续处理：

```text
Streaming
Tool 参数校验
Tool 串行 / 并行
Tool Error
Abort
Steering
Follow-up
Turn 生命周期
Agent 生命周期
```

这些我们后面会专门拆解。

---

最上面才是：

```text
pi-coding-agent
```

这一层真正知道：

> 我现在做的是 Coding Agent。

因此它才会提供：

```text
read
write
edit
bash
```

这些 Coding Tools。

同时这一层也会处理：

```text
项目工作目录
Session
Compaction
AGENTS.md
Skills
Extensions
TUI
命令
```

换句话说：

```text
pi-ai
```

并不知道“写代码”是什么。

```text
pi-agent-core
```

也不应该只为 Coding Agent 服务。

真正把：

```text
模型
+
Agent Runtime
+
代码工具
+
终端交互
```

组合起来的，是：

```text
pi-coding-agent
```

---

### 从我们的 Mini Agent 到 Pi

现在重新看前一篇写出来的项目：

```text
mini-coding-agent/
├── index.ts
├── agent.ts
├── tools.ts
└── workspace/
```

当时我们大概是这样分工：

```text
index.ts
→ 接收用户输入

agent.ts
→ 模型调用
→ System Prompt
→ Messages
→ Agent Loop

tools.ts
→ read / write / edit / bash
```

把它和 Pi 对照一下，会发现：

```text
我们的实现                     Pi

OpenAI SDK
   │
   └──────────────────────→   pi-ai

agent.ts
   │
   ├─ Messages
   ├─ Agent Loop
   └─ Tool Calling
                          →   pi-agent-core

tools.ts
index.ts
workspace
                           →  pi-coding-agent
```

也就是说：

> **Pi 并没有把我们前面写出来的最小 Agent 推翻。**

它做的第一件事，其实是把不同职责拆开。

我们的版本：

```text
┌─────────────────────────────┐
│          agent.ts           │
│                             │
│ OpenAI SDK                  │
│ System Prompt               │
│ Messages                    │
│ Agent Loop                  │
│ Tool Calling                │
└──────────────┬──────────────┘
               │
               ▼
        read / write
        edit / bash
```

Pi 则变成：

```text
┌─────────────────────────────┐
│      pi-coding-agent        │
│                             │
│ Coding Tools                │
│ Session / Context           │
│ TUI / Extensions / Skills   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       pi-agent-core         │
│                             │
│ Agent Loop                  │
│ Tool Execution              │
│ State / Events              │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│           pi-ai             │
│                             │
│ Provider / Model            │
│ Auth / Streaming            │
└─────────────────────────────┘
```
我们的 Demo Agent 可以把所有东西写在一起。

但真实项目随着功能增加，必须逐渐拆开：

```text
模型层
Agent Runtime
业务 Agent
```

否则以后每增加一个 Provider、一个 Tool、一个 Session 功能，都可能直接修改 Agent Loop。

---

而且 Pi 的这种分层还有一个很实际的好处。

比如以后我们想做的不是 Coding Agent，而是：

```text
数据分析 Agent
运维 Agent
客服 Agent
研究 Agent
```

理论上：

```text
pi-ai
+
pi-agent-core
```

这两层的大量能力仍然可以复用。

真正变化的主要是最上面的：

```text
Tools
System Prompt
Context
产品交互
```

这其实也是一个比较通用的 Agent 架构思想：

```text
                业务 Agent
                   ↓
             Agent Runtime
                   ↓
               Model Layer
```
后续我们在其他框架仍然会再次见到这个思想。

---

不过看到这里还不能认为：

> Pi 只是把我们的三个文件拆成了三个 Package。

真正的区别远不止目录结构。

例如我们的 Agent Loop 只有：

```text
模型
↓
Tool
↓
Result
↓
模型
```

但真实运行时会立刻出现一堆我们之前没有处理的问题：

```text
模型一次返回多个 Tool Call 怎么办？

read 和 bash 能不能并行？

edit 和 write 还能并行吗？

Tool 参数生成到一半，模型输出被截断怎么办？

用户按下 Escape 时怎么终止模型和正在执行的命令？

Tool 执行过程中如何实时显示输出？

用户在 Agent 工作时又输入了一条新指令怎么办？
```

这些问题，才真正让：

```text
几十行 Agent Loop
```

逐渐变成：

```text
Agent Runtime
```
## Agent Loop：真实项目里的循环没有那么简单

前面我们已经看过 Pi 的整体分层。

接下来直接进入最熟悉的一部分：

```text
Agent Loop
```

因为不管 Pi 外面再增加多少 Session、TUI、Skills 和 Extensions，Agent 真正开始执行任务以后，最底层仍然要解决同一个问题：

> **模型做完这一轮以后，下一步到底发生什么？**

---

### 我们之前只有一个 while(true)

前一篇实现最小 Coding Agent 时，我们的核心代码基本可以压缩成：

```typescript
while (true) {
  const response = await callModel();

  const toolCalls =
    response.tool_calls ?? [];

  if (toolCalls.length === 0) {
    return response.content;
  }

  for (const toolCall of toolCalls) {
    const result =
      await executeTool(toolCall);

    messages.push(result);
  }
}
```

这段代码已经能够跑通：

```text
Model
  ↓
Tool Call
  ↓
执行 Tool
  ↓
Tool Result
  ↓
Messages
  ↓
Model
```

对于演示完全够用了。

但如果继续追问几个问题，那么上面那个演示 Agent 就完全处理不了了。

比如：

```text
模型请求了两个 Tool，应该一起执行吗？

Tool 参数不合法怎么办？

Tool 执行失败怎么办？

模型输出到一半被截断怎么办？

用户想中途停止怎么办？

模型正在工作时，用户又发来了一条指令怎么办？

这一轮结束以后，是否一定要继续下一轮？

什么时候才算整个 Agent Run 真正结束？
```
所以到了真实 Agent Runtime，原本的一条循环需要承担更多责任。

---

### Pi 的 Agent Loop 在处理什么

Pi 当前源码中真正的 Agent Loop 位于：

```text
[packages/agent/src/agent-loop.ts](https://github.com/earendil-works/pi/blob/main/packages/agent/src/agent-loop.ts)
```

如果只看最外层，它其实仍然没有脱离我们之前那套结构流程。

Pi 会先创建当前 Context，把新的 Prompt 加进去，然后开始整个 Agent Run。

源码中会先发出：

```text
agent_start
turn_start
```

随后进入真正的 `runLoop()`。

可以先把它简化成：

```text
Agent Run 开始
      ↓
Turn 开始
      ↓
调用模型
      ↓
处理 Tool Call
      ↓
写入 Tool Result
      ↓
Turn 结束
      ↓
判断是否继续
      ↓
……
      ↓
Agent Run 结束
```

这里出现了两个我们前面实现 Agent 时没有认真区分的概念：

```text
Agent Run
Turn
```

简单理解：

```text
Agent Run
→ 用户这一次任务从开始到结束的完整执行过程

Turn
→ Agent Run 中的一轮模型调用以及随后发生的工具执行
```

例如前面修复计算器 Bug：

```text
用户：
修复测试失败的问题

        ↓

Turn 1
模型 → bash("npm test")
       ↓
    测试失败

        ↓

Turn 2
模型 → read(...)
       ↓
    文件内容

        ↓

Turn 3
模型 → edit(...)
       ↓
    修改成功

        ↓

Turn 4
模型 → bash("npm test")
       ↓
    测试通过

        ↓

Turn 5
模型 → 最终回答

        ↓

Agent Run 结束
```

我们的最小实现其实也有这些 Turn。

只不过当时：

```typescript
while (true)
```

就全部包过去了，没有把生命周期显式表示出来。

Pi 则把这些生命周期真正变成了 Runtime 中的事件：

```text
agent_start
turn_start
message_start
message_update
message_end
tool_execution_start
tool_execution_update
tool_execution_end
turn_end
agent_end
```

这样上层 TUI、Session、Extension 等模块，就可以监听整个 Agent 执行过程中发生了什么。

这其实是从：

```text
一个函数
```

走向：

```text
一个 Runtime
```

非常重要的一步。

---

我们之前的实现只关心：

```text
最后返回了什么
```

而一个真实框架还需要让其他模块知道：

```text
模型什么时候开始回答？

现在是不是正在调用 Tool？

Tool 执行到哪里了？

这一轮结束了吗？

整个 Run 被取消了吗？
```

所以 Pi 的 Agent Loop 不只是：

> “循环调用 LLM。”

它还承担了一部分：

> **整个 Agent Run 的生命周期调度。**

---

### Tool Call 不只是执行函数

我们之前执行 Tool 非常直接：

```typescript
const args =
  JSON.parse(
    toolCall.function.arguments,
  );

const result =
  await executeTool(
    toolCall.function.name,
    args,
  );
```

可以理解成：

```text
拿到参数
↓
找到函数
↓
执行
```

但实际上 Runtime 不能默认：

> 模型既然生成了 Tool Call，就一定可以执行。

至少要先回答：

```text
这个 Tool 存不存在？

参数是否合法？

参数是否符合 Tool Schema？

这一次 Tool Call 是否已经被取消？

这个 Tool 是否允许执行？

模型生成的 Tool Call 是否完整？
```

Pi 的 Agent Loop 在工具执行阶段，会先做 Tool 查找和参数校验等准备，再真正进入执行。当前源码也直接使用 `validateToolArguments` 对模型产生的参数进行验证。

所以 Pi 源码中的流程其实是：

```text
Tool Call
   ↓
查找 Tool
   ↓
校验 Arguments
   ↓
执行前处理
   ↓
真正执行
   ↓
整理 Tool Result
   ↓
写回 Context
```

而不是简单：

```text
toolName
↓
switch
↓
function()
```

---

这里还有一个很典型的问题。

假设模型正在生成：

```json
{
  "path": "src/index.ts",
  "oldText": "..."
```

结果刚生成一半，就因为：

```text
达到模型最大输出 Token
```

响应被截断了。

某些情况下，流式 JSON 的恢复逻辑甚至可能仍然得到一个“看起来能解析”的 Tool Call。

如果只是我们之前的代码：

```typescript
JSON.parse(...)
```

能够成功，就可能直接执行。

但这里存在一个风险：

> **参数能解析，不代表参数生成完整。**

Pi 当前专门处理了这个情况。

如果 Assistant Message 的 `stopReason` 是：

```text
length
```

也就是输出因为长度限制被截断，Pi **不会执行这一批 Tool Call**。

而是给这些调用生成错误结果，大概是：

```text
这次 Tool Call 没有执行，
因为模型响应达到 Token 上限，
参数可能已经被截断，
请重新生成完整 Tool Call。
```

然后让模型下一轮重新决定。

这是一个非常现实的：

```text
在我们的 Demo 中几乎不会考虑
```

但：

```text
真实 Runtime 必须考虑
```

的问题。

---

### 一轮多个 Tool Call：串行还是并行

前一篇我们已经允许：

```typescript
for (const toolCall of toolCalls) {
  await executeTool(toolCall);
}
```

也就是一轮模型可以返回多个 Tool Call。

但我们的处理方式非常简单：

```text
全部按照顺序执行
```

例如：

```text
read("a.ts")
↓
完成

read("b.ts")
↓
完成

read("c.ts")
↓
完成
```

这样当然没有错。

但假如三个文件完全没有依赖关系：

```text
read("a.ts")
read("b.ts")
read("c.ts")
```

理论上完全可以：

```text
        ┌→ read("a.ts")
Model ──┼→ read("b.ts")
        └→ read("c.ts")
```

并行执行。

如果每个 Tool 都需要 500ms：

```text
串行：
500 + 500 + 500
≈ 1500ms

并行：
max(500, 500, 500)
≈ 500ms
```

差距很明显。

---

但问题又来了。

如果模型这一轮产生的是：

```text
edit("a.ts")
write("a.ts")
```

还能直接并行吗？

很危险。

因为两个 Tool 都在修改同一个文件。

执行顺序可能直接影响最终结果。

再比如：

```text
bash("npm install")
bash("npm test")
```

第二个命令可能依赖第一个命令完成。

所以不能简单得出：

> 多个 Tool Call 全部并行就一定好。

Pi 当前的 Agent Loop 同时支持：

```text
Sequential
Parallel
```

两种 Tool 执行方式。

源码中会先检查当前 Tool Batch：

```text
这一批里是否存在要求 sequential 的 Tool
```

如果全局配置要求顺序执行，或者其中某个 Tool 声明了：

```text
executionMode === "sequential"
```

就进入串行执行；否则可以进入并行执行。

逻辑大致可以压缩成：

```typescript
if (
  config.toolExecution === "sequential" ||
  toolCalls.some(tool => tool.executionMode === "sequential")
) {
  await executeSequentially();
} else {
  await executeInParallel();
}
```

这个设计背后有一个很重要的细节：

> **Tool 的执行策略，本身也是 Tool 能力定义的一部分。**

有些工具天然适合并行：

```text
read
grep
find
独立网络查询
```

有些工具通常更需要保证顺序：

```text
修改文件
执行有依赖的命令
改变外部状态
```

所以：

```text
Tool Calling
```

并不只是：

> “模型选择了哪个函数。”

还包括：

> **Runtime 应该如何安全、有效地执行这些函数。**

---

### Tool 出错以后为什么不能让整个 Run 崩掉

我们前面的 `bash` 已经特意做过一件事情。

命令执行失败以后，不是：

```typescript
throw error;
```

直接结束整个 Agent。

而是返回：

```json
{
  "ok": false,
  "error": "..."
}
```

然后继续写回 Messages。

这个思路其实非常重要。

因为从 Agent 的角度看：

```text
Tool 失败
```

很多时候只是：

> **环境给了模型一个新的 Observation。**

例如：

```text
bash("npm test")
↓
测试失败
```

这不是 Agent 自己崩了。

恰恰是 Agent 获取到了很重要的外部信息。

再比如：

```text
read("src/a.ts")
↓
文件不存在
```

模型下一轮完全可以判断：

```text
是不是路径写错了？

要不要先 ls？

要不要 find？

文件是不是还没创建？
```

如果 Tool 一失败整个 Runtime 就退出：

```text
Agent
↓
第一次行动失败
↓
整个任务结束
```

那就失去了 Agent 根据环境反馈继续修正的能力。

---

Pi 也是按照这个方向设计 Tool Result。

它的 Tool Result 本身就包含：

```text
isError
```

错误结果仍然是一种正式的 `ToolResultMessage`，可以进入后续 Context，而不是必须以异常结束整个 Agent Run。Pi 的 Session Message 定义中也明确区分正常和错误 Tool Result。

可以理解成：

```text
Tool 成功
↓
ToolResultMessage
isError = false

Tool 失败
↓
ToolResultMessage
isError = true
```

然后：

```text
都可以交回模型
```

这其实和我们做普通业务程序的思路稍微有一点不太一样。

普通程序代码经常是：

```text
Error
↓
异常流程
```

而 Agent Runtime 中，大量 Tool Error 实际上应该是：

```text
Error
↓
Observation
↓
模型重新判断
```

当然，不是所有错误都应该继续。

例如：

```text
模型 Provider 完全不可用

整个 Run 被用户 Abort

Runtime 自身内部状态损坏
```

这些就属于另外一层错误了。

所以真实 Agent Runtime 还必须区分：

```text
Tool Error
Model Error
Runtime Error
Abort
```

而不是全部：

```text
catch (error)
```

以后直接返回一句“执行失败”。

---

### Abort、Stop 和一次 Run 的生命周期

我们之前的最小 Coding Agent 还有一个很明显的问题：

```typescript
while (true) {
  await callModel();
  await executeTool();
}
```

一旦开始运行：

> 基本只能等它自己结束。

如果模型正在生成很长的内容怎么办？

如果 `bash` 正在运行一个很久的命令怎么办？

如果用户突然发现：

```text
任务提错了
```

想立刻停止怎么办？

真正的 Coding Agent 必须能：

```text
Abort
```

整个正在执行的 Run。

---

Pi 当前在 Agent Loop 中一直向下传递：

```typescript
AbortSignal
```

它会进入：

```text
模型 Streaming
Tool Execution
```

等真正需要取消的地方。

所以取消不是 UI 上显示“停止了”这么简单。

真正需要传播：

```text
用户按下取消
      ↓
AbortSignal
      ↓
停止模型响应
      ↓
停止 Tool
      ↓
结束当前 Turn
      ↓
结束 Agent Run
```

Pi 在模型返回：

```text
stopReason === "error"
```

或者：

```text
stopReason === "aborted"
```

时，会结束当前 Turn，然后发出 `agent_end`，终止这一次 Run。

---

但这里还有另外一个概念：

```text
Stop
```

Abort 是：

> **外部强制终止当前运行。**

而正常 Stop 则是：

> **Agent 自己已经没有更多工作需要继续。**

比如：

```text
最后一轮模型：
“问题已经修复，测试通过。”

没有新的 Tool Call
```

Agent 可以自然结束。

Pi 的 Loop 里还有：

```typescript
shouldStopAfterTurn(...)
```

这样的扩展停止点。

也就是说，一轮结束以后，Runtime 还可以根据外部策略判断：

```text
即使模型还可以继续，
这一轮之后是否应该强制停止？
```

因此一个更完整的 Run 生命周期，大概是：

```text
             Agent Start
                  ↓
              Turn Start
                  ↓
              Model Call
                  ↓
             Tool Calls?
             /         \
           有           无
           ↓             ↓
      Execute Tools    正常结束?
           ↓             ↓
      Tool Results       │
           ↓             │
        Turn End ←────────┘
           ↓
   是否还有工作需要继续？
        /         \
      是           否
      ↓             ↓
下一次 Turn      Agent End
```

与此同时，任何执行阶段又可能收到：

```text
Abort
```

直接终止当前 Run。

---

看到这里，其实我们最开始那段：

```typescript
while (true)
```

并没有错。

Pi 最下面依然存在循环。

真正的变化是，我们原来隐含在几行代码里的东西：

```text
什么时候开始
什么时候结束
工具怎么执行
失败怎么办
用户怎么取消
下一轮什么时候开始
```

到了真实 Runtime 里，都必须变成明确的状态和规则。

所以可以把两边放在一起：

```text
我们的 Mini Agent

while (true) {
  Model
  Tool
  Result
}
```

到了 Pi：

```text
Agent Lifecycle
      +
Turn Lifecycle
      +
Streaming
      +
Tool Validation
      +
Sequential / Parallel Execution
      +
Tool Result
      +
Error Handling
      +
Abort
      +
Steering / Follow-up
      +
Stop Policy
```

但最底层依然是：

```text
Model
  ↓
Action
  ↓
Environment
  ↓
Observation
  ↓
Model
```

这也是为什么前面我们一定要自己实现一次最小 Coding Agent。

如果没有前面的 `while (true)`，现在直接打开 Pi 的 `agent-loop.ts`，看到的可能只是一大堆：

```text
Event
Config
AbortSignal
ToolResultMessage
Steering
Follow-up
PrepareNextTurn
```

很容易迷失在工程细节里。

但现在再看，就可以知道：

> **这些代码没有改变 Agent 的核心，它们是在保护和完善那条最简单的 Loop 链路。**

接下来我们再往下看 Tool。

## Tools：四个工具背后其实还有很多工程问题

上一篇实现最小 Coding Agent 时，我们花了不少篇幅写四个 Tool：

```text
read
write
edit
bash
```

Pi 默认提供给模型的核心 Coding Tools，同样也是这四个。

当前源码中的：

```typescript
createCodingTools()
```

直接返回：

```typescript
return [
  createReadTool(cwd, options?.read),
  createBashTool(cwd, options?.bash),
  createEditTool(cwd, options?.edit),
  createWriteTool(cwd, options?.write),
];
```

所以从表面上看，我们之前写出来的东西似乎已经和 Pi 很接近了：

但是继续打开具体实现以后，我们就会发现：

> **Tool 的名字可以很简单，但真正麻烦的是如何让它在真实环境里稳定工作。**

我们之前重点解决的是：

```text
模型能不能调用这个工具？
```

Pi 还要继续解决：

```text
文件太大怎么办？

命令输出几十万行怎么办？

工具执行过程中被取消怎么办？

两个 Tool 同时修改一个文件怎么办？

图片能不能读？

不同操作系统怎么办？

Tool 能不能换成远程执行？

Tool 结果如何展示给 TUI？

模型传来的参数不标准怎么办？
```

这些才是 Tool 从 Demo 走向工程实现以后逐渐出现的问题。

---

### 我们和 Pi 都从 read、write、edit、bash 开始

我们先想一个问题：

> 为什么 Coding Agent 最小工具集经常就是这四个？

因为它们刚好覆盖了 Coding Agent 最基本的几个动作：

```text
read
→ 观察已有代码

bash
→ 观察和改变外部环境

edit
→ 精确修改已有代码

write
→ 创建文件或整体重写
```

组合起来就是：

```text
Observe
   ↓
Act
   ↓
Observe
   ↓
Act
```

例如：

```text
bash("npm test")
        ↓
发现测试失败
        ↓
read("src/calculator.ts")
        ↓
找到问题
        ↓
edit(...)
        ↓
bash("npm test")
```

所以真正决定 Coding Agent 能力上限的，并不只是：

```text
工具数量
```

而是：

```text
这些基础工具设计得是否足够可靠
```

Pi Agent 除了这四个默认 Coding Tools，目前还实现了：

```text
grep
find
ls
powershell
```

等工具，不过默认的 `createCodingTools()` 仍然保持 `read / bash / edit / write` 这套非常小的组合。

---

### Tool Schema 和 Tool Implementation 依然分离

前一篇里，我们专门讲过：

```text
Tool Schema
≠
Tool Implementation
```

例如：

```typescript
{
  name: "read",
  description: "读取文件",
  parameters: {
    path: ...
  }
}
```

是给模型看的。

而：

```typescript
async function readTool() {
  return await readFile(...);
}
```

才是程序真正执行的。

Pi 依然保持这层区分，只不过封装得更完整。

以 `read` 为例，首先定义参数：

```typescript
const readSchema = Type.Object({
  path: Type.String(...),
  offset: Type.Optional(Type.Number(...)),
  limit: Type.Optional(Type.Number(...)),
});
```

然后 `createReadToolDefinition()` 里同时提供：

```text
name
description
parameters
execute()
```

最后再通过：

```typescript
createReadTool()
```

包装成 Agent Runtime 真正使用的 Tool。

可以把它理解成：

```text
Tool Definition
│
├─ 模型看到什么
│   ├─ name
│   ├─ description
│   └─ parameters
│
└─ Runtime 怎么执行
    └─ execute()
```

比我们之前：

```text
一个 tools 数组
+
一个 executeTool() switch
```

更容易继续扩展。

---

Pi 的 Tool Definition 还有一个我们之前完全没有考虑的东西：

```text
promptSnippet
promptGuidelines
```

例如 `read` 会额外告诉 System Prompt：

```text
Read file contents
```

以及：

```text
Use read to examine files instead of cat or sed.
```

`write` 也会贡献：

```text
Use write only for new files or complete rewrites.
```

这意味着：

> **Tool 不只是向模型提供一个 JSON Schema，它还可以影响 Agent 的行为规则。**

这个问题我们下一节讲 System Prompt 时还会强调。

---

### read 为什么不能无限读取文件

先看我们之前的 `read`。

核心只有：

```typescript
const content =
  await readFile(
    filePath,
    "utf8",
  );

return JSON.stringify({
  ok: true,
  path: inputPath,
  content,
});
```

对于：

```text
calculator.js
```

这种十几行的小文件完全没有问题。

但如果 Agent 执行：

```text
read("package-lock.json")
```

文件有 2MB 呢？

再极端一点：

```text
read("logs/app.log")
```

里面有几十万行呢？

如果直接全部返回：

```text
文件
  ↓
Tool Result
  ↓
Messages
  ↓
下一轮 Context
```

很可能一次 Tool Call 就塞进去大量 Token。

所以真实 Coding Agent 必须考虑：

> **Tool Output 本身也是 Context 成本的一部分。**

---

Pi 当前对文本读取默认设置了两个上限：

```text
最多 2000 行
或
最多 50KB
```

谁先达到，就按照谁截断。

`read` 使用的是：

```typescript
truncateHead(...)
```

也就是优先保留文件前面的内容。

为什么？

因为读取代码时，一般更自然的过程是：

```text
先读前面
↓
如果还不够
↓
继续往后读
```

因此 Pi 的 `read` Schema 不是只有：

```typescript
path
```

还有：

```typescript
offset
limit
```

例如：

```text
read({
  path: "src/app.ts",
  offset: 1,
  limit: 500
})
```

如果文件没有读完，返回结果里还会主动告诉模型类似：

```text
Showing lines 1-500 of 3200.
Use offset=501 to continue.
```

于是模型可以继续：

```text
read({
  path: "src/app.ts",
  offset: 501
})
```

这比简单地：

```text
“输出太长，所以截断了”
```

要好很多。

因为 Tool Result 不只是告诉模型：

```text
发生了截断
```

还应该尽量告诉它：

```text
下一步怎么继续
```

---

这里其实可以总结出一个非常有用的 Tool 设计原则：

> **Tool Result 不只是返回数据，还应该帮助模型理解结果以及下一步可采取的动作。**

例如：

不好：

```text
[Output truncated]
```

更好：

```text
当前显示第 1-2000 行，共 5831 行。
继续读取请使用 offset=2001。
```

后者明显更适合 Agent 进行下一步的预测性行为。

---

Pi 的 `read` 甚至不只支持文本。

它还会检测：

```text
jpg
png
gif
webp
bmp
```

等图片文件。

如果当前模型支持图片输入，就可以把图片作为 `ImageContent` 返回给模型；如果模型不支持视觉输入，则会给出对应提示。

所以真实的：

```text
read
```

已经不是简单：

```typescript
fs.readFile()
```

而是逐渐变成：

```text
路径解析
↓
文件访问检查
↓
文件类型判断
↓
文本 / 图片处理
↓
分页
↓
截断
↓
构建适合模型消费的 Tool Result
```

---

### bash 输出太大怎么办

`bash` 的问题甚至比 `read` 更明显。

前一篇我们直接：

```typescript
const {
  stdout,
  stderr,
} = await execAsync(command);
```

然后整个返回模型。

但真实命令的输出可能非常夸张。

比如：

```bash
npm install
```

```bash
npm test
```

```bash
git diff
```

或者某个错误配置下疯狂打印日志的程序。

都可能产生大量输出。

所以 Pi 的 `bash` 也会对结果做截断。

但是这里和 `read` 有一个非常值得注意的区别。

`read`：

```text
保留头部
```

`bash`：

```text
保留尾部
```

Pi 的共享截断逻辑分别提供：

```typescript
truncateHead()
truncateTail()
```

而 `bash` 的描述明确说明，它保留最后最多：

```text
2000 行
或
50KB
```

超出部分则会被截断。

为什么 Bash 更适合看尾部？

因为很多命令真正重要的信息都在最后：

```text
前面：
Building...
Building...
Building...

最后：
ERROR
Test failed
exit code 1
```

尤其是：

```text
测试
编译
构建
```

最后几十行通常比最开始几十行更重要。

所以：

```text
同样叫“截断”
```

实际策略也应该根据 Tool 的语义不同而不同。

这也是阅读真实框架实现的价值。

---

而且 Pi 并不是把被截掉的内容直接丢掉。

当前 `bash` Tool 会使用 `OutputAccumulator` 保存输出；如果发生截断，可以把完整输出写入临时文件，并通过 `fullOutputPath` 保留下来。

于是可以形成：

```text
Bash 输出非常大
        ↓
只把最重要的一部分
送进 Context
        ↓
完整结果另外保存
        ↓
必要时再继续查看
```

这是另一个非常重要的思想：

> **运行时保存的数据，不一定都应该进入模型 Context。**

我们后面讲 Session 和 Compaction 时还会不断遇到这个区别。

---

### edit 为什么比简单字符串替换复杂

前一篇实现 `edit` 时，我们采用的是：

```text
oldText
   ↓
精确找到
   ↓
替换成 newText
```

代码大概是：

```typescript
const firstIndex =
  content.indexOf(oldText);

const updated =
  content.slice(0, firstIndex) +
  newText +
  content.slice(
    firstIndex + oldText.length,
  );
```

这个方向其实和 Pi 很接近。

Pi 当前也仍然采用：

> **Exact Text Replacement**

当前 `edit` 的 Schema 大致是：

```typescript
{
  path,
  edits: [
    {
      oldText,
      newText
    }
  ]
}
```

但和我们的版本相比，Pi 已经继续处理了很多细节。

---

首先，Pi 允许一次修改同一个文件中的多个独立位置：

```typescript
edits: [
  {
    oldText: "...",
    newText: "..."
  },
  {
    oldText: "...",
    newText: "..."
  }
]
```

而不是：

```text
edit
↓
edit
↓
edit
```

连续发三次 Tool Call。

Pi 给模型的 Prompt Guideline 也明确建议：

```text
如果同一个文件中有多个分离修改，
尽量在一次 edit 中提供多个 edits。
```

这样可以：

```text
减少 Tool Round Trip
+
减少模型调用轮数
+
一次完成同一文件的相关修改
```

---

但这里马上会产生新的问题：

```text
两个 edit 会不会互相覆盖？
```

例如：

```text
Edit A 修改第 10-20 行

Edit B 又修改第 15-25 行
```

这两个范围发生了重叠。

所以 Pi 要求：

```text
每个 oldText
都针对原始文件匹配

不同 edits 之间
不能重叠或嵌套
```

如果多个修改位置太接近，应该合并成一个较大的 Edit。

于是一次 Edit 的语义变得更加明确：

```text
原始文件
   ↓
同时确定多个独立替换
   ↓
一次性产生新文件
```

而不是：

```text
Edit 1 改完
↓
再基于修改后的文件执行 Edit 2
↓
再执行 Edit 3
```

这能够减少：

```text
前面的修改影响后面的匹配
```

这种问题。

---

Pi 的 Edit 还会处理一些我们写 Demo 时同样没有考虑的细节。

例如：

```text
BOM
```

代码文件开头可能存在不可见的 Byte Order Mark。

模型生成的：

```text
oldText
```

通常不会包含这个不可见字符。

所以 Pi 在匹配前会先：

```typescript
splitBom(...)
```

把 BOM 拆出来。

修改完成以后再恢复。

---

再比如不同操作系统的换行符：

```text
Linux / macOS
LF

Windows
CRLF
```

如果模型生成的是：

```text
\n
```

但真实文件是：

```text
\r\n
```

直接做字符串匹配就可能失败。

因此 Pi 在 Edit 过程中还会：

```text
检测原始换行符
↓
统一成 LF 做匹配和修改
↓
修改完成
↓
恢复原始换行风格
```

这就是非常典型的工程细节。

---

Pi 在修改完成以后也不只是返回：

```text
文件修改成功
```

还会生成：

```text
diff
patch
firstChangedLine
```

这些 Details。

这些信息不一定全部要交给模型。

但对于：

```text
TUI 展示
Extension
编辑器跳转
变更审查
```

却非常有用。

再次体现了：

> **Tool Result 不只是“给模型看的字符串”，还可以携带给 Runtime 和 UI 使用的结构化元数据。**

---

### 多个 Tool 同时修改一个文件怎么办

上一节我们刚刚讲过：

```text
Pi 支持并行 Tool Call
```

这时候又会出现一个很现实的问题。

假设模型一轮产生：

```text
write("src/a.ts")
edit("src/a.ts")
```

或者两个独立操作恰好同时修改：

```text
src/a.ts
```

如果真的并行：

```text
Task A                    Task B

读旧文件
  ↓                         ↓
修改 A                    修改 B
  ↓                         ↓
写文件                    写文件
```

最后谁覆盖谁？

很容易发生竞态条件。

---

Pi 当前为文件修改专门实现了：

```typescript
withFileMutationQueue()
```

`write` 和 `edit` 都会通过它执行文件写操作。

它的核心思想是：

> **针对同一个文件的修改串行执行，不同文件仍然可以并行。**

源码注释写得非常直接：

```text
Serialize file mutation operations targeting the same file.

Operations for different files still run in parallel.
```

所以：

```text
edit("a.ts") ───┐
                ├→ 串行
write("a.ts") ──┘
```

但：

```text
edit("a.ts") ───→

edit("b.ts") ───→
```

可以并行。

非常合理的一个折中方案：

```text
完全串行
→ 安全，但浪费并发

完全并行
→ 快，但容易产生竞态

按资源加锁
→ 同资源串行，不同资源并行
```
---

### write 看起来最简单，也仍然有边界问题

四个 Tool 里面，`write` 看起来最简单：

```text
path
+
content
```

然后：

```typescript
writeFile(...)
```

Pi 的核心逻辑确实也不复杂。

它会：

```text
解析目标路径
↓
创建父目录
↓
写入文件
```

如果文件不存在就创建，存在则覆盖。

但即使这个最简单的 Tool，Pi 仍然加上了：

```text
Abort 检查
File Mutation Queue
Pluggable Operations
```

特别是：

```typescript
operations?: WriteOperations
```

意味着真正的写文件实现不是完全写死的。

默认可以：

```text
写本地文件系统
```

但调用方也可以替换这些底层 Operations。

`read`、`edit`、`bash` 同样采用了类似思想。

例如 `read` 有：

```typescript
ReadOperations
```

`edit` 有：

```typescript
EditOperations
```

`bash` 有：

```typescript
BashOperations
```

这就产生了一层很重要的解耦：

```text
Agent Tool
    ↓
Tool Operations
    ↓
具体执行环境
```

于是同一个：

```text
read
```

理论上可以：

```text
读取本地机器
```

也可以把底层 Operations 换掉以后：

```text
读取远程服务器
```

而模型看到的 Tool Interface 可以保持不变。

---

### Tool 越来越多以后怎么管理

我们的 Mini Agent 只有四个 Tool，所以直接：

```typescript
switch (name) {
  case "read":
  case "write":
  case "edit":
  case "bash":
}
```

完全没有问题。

但真实项目以后可能出现：

```text
read
write
edit
bash
grep
find
ls
powershell
browser
database
deploy
issue
search
……
```

如果全部继续塞进：

```typescript
executeTool()
```

这个 `switch` 会越来越大。

---

Pi 当前内置 Tool 已经抽象成一组：

```text
ToolDefinition
```

并提供：

```typescript
createToolDefinition(...)
createTool(...)
createCodingTools(...)
createReadOnlyTools(...)
createAllTools(...)
```

等统一创建方式。

例如：

```text
Coding Tools

read
bash
edit
write
```

而：

```text
Read Only Tools

read
grep
find
ls
```

也可以组成另一套能力集合。

于是工具不再是：

```text
“程序里写死的四个函数”
```

而逐渐变成：

```text
可以组合的一组能力
```

这个变化非常重要。

因为真实 Agent 很少应该永远拥有：

```text
所有工具
```

不同场景可能只需要：

```text
只读 Agent
→ read / grep / find / ls

Coding Agent
→ read / bash / edit / write

扩展后的 Agent
→ Coding Tools + Custom Tools
```

所以 Tool System 最后要解决的不只是：

> Tool 怎么执行？

还要解决：

> **当前 Agent 到底应该拥有哪一组 Tool？**

Pi 后面的 Extension 系统还可以继续注册 Custom Tool。

不过这一部分我们后面单独讲 Extensions 时再展开。

---

现在再回头看我们最开始那四个 Tool。

当时我们可能觉得：

```text
read
write
edit
bash

已经写完了
```

但真实实现继续往下走，会逐渐变成：

```text
                    Tool

                     │
        ┌────────────┼────────────┐
        ↓            ↓            ↓

     Schema       Runtime       Prompt
        │            │            │
        │            │            └→ Guidelines
        │            │
        │            ├→ Abort
        │            ├→ Error
        │            ├→ Concurrency
        │            ├→ Streaming
        │            └→ Result Metadata
        │
        └→ 参数约束

                     │
                     ↓

               Operations Layer

                     │
          ┌──────────┴──────────┐
          ↓                     ↓

       Local FS             Remote Env
```

而且这里还有一个细节已经出现很多次了。

我们刚刚看到：

```text
read
write
edit
bash
```

每个 Tool 除了：

```text
Schema
execute()
```

还会带上：

```text
promptSnippet
promptGuidelines
```

也就是说，Pi 并没有把 System Prompt 写成一段永远固定的字符串。

当前有哪些 Tool、加载了哪些项目规则、有哪些 Skills，都会进一步影响最终 Prompt。

## System Prompt：真实 Prompt 不是一段写死的字符串

前一篇实现最小 Coding Agent 时，我们直接定义了一段：

```typescript
export const SYSTEM_PROMPT = `
你是一个运行在本地项目工作区中的 Coding Agent。

工作目录：
${WORKSPACE_DIR}

使用 read、write、edit 和 bash 工具检查、修改并验证项目。

规则：
- 修改前先读取相关文件。
- 修改已有文件中的局部内容时，优先使用 edit。
- 创建新文件或替换整个文件时，使用 write。
- 修改代码后，如果条件允许，应运行相关测试。
- 任务完成后停止调用工具，并简要总结。
`.trim();
```

对于我们的 Mini Agent，这样完全够用。

因为当时整个运行环境几乎是固定的：

```text
固定的 4 个 Tool
+
固定的 Workspace
+
固定的行为规则
```

所以：

```text
SYSTEM_PROMPT = 一段固定字符串
```

没有什么问题。

但真实 Coding Agent 继续发展以后，很快就会出现新的情况：

```text
这一次只有只读工具怎么办？

用户安装了新的 Tool 怎么办？

加载了新的 Skill 怎么办？

不同项目有自己的 AGENTS.md 怎么办？

用户希望额外追加一段 System Prompt 怎么办？
```

如果这些东西全部继续手写进一个巨大的字符串：

```text
SYSTEM_PROMPT
```

Prompt 很快就会和真实运行环境脱节。

所以 Pi 没有把最终 System Prompt 写死，而是选择：

> **在 Agent 启动时，根据当前运行环境动态构建。**

---

### 我们之前直接写了 SYSTEM_PROMPT

先回头看我们的 Mini Agent。

当时 Prompt 和 Tool 实际上是两套独立配置：

```text
SYSTEM_PROMPT

“使用 read、write、edit 和 bash”
```

另一边：

```typescript
const tools = [
  read,
  write,
  edit,
  bash,
];
```

这其实存在一个潜在问题。

假设以后删掉：

```text
bash
```

但是忘了改 Prompt：

```text
System Prompt：
“使用 read、write、edit 和 bash”
```

模型就会被告诉：

```text
你可以使用 bash
```

但 Runtime 实际上：

```text
根本没有 bash
```

反过来也一样。

如果新增加：

```text
grep
```

但 Prompt 不知道，那么这个工具虽然出现在 Tool Schema 里，却没有在系统提示词中引导模型调用它。

对于四个固定 Tool 的 Demo，这个问题不明显。

但真实系统里的能力是会变化的：

```text
不同运行模式
不同项目
不同 Extension
不同配置
        ↓
可用 Tool 不一定相同
```

所以 Prompt 最好也跟着这些能力变化。

---

### Pi 怎么动态构建 System Prompt

Pi 当前专门有：

```text
packages/coding-agent/src/core/system-prompt.ts
```

其中的：

```typescript
buildSystemPrompt()
```

负责构建最终 Prompt。

它接收的不是一段字符串，而是一组输入：

```typescript
interface BuildSystemPromptOptions {
  customPrompt?: string;

  selectedTools?: string[];

  toolSnippets?: Record<string, string>;

  promptGuidelines?: string[];

  appendSystemPrompt?: string;

  cwd: string;

  contextFiles?: Array<{
    path: string;
    content: string;
  }>;

  skills?: Skill[];
}
```

也就是说，最终 System Prompt 实际上受到很多因素影响：

```text
基础 Prompt
+
当前可用 Tools
+
Tool Guidelines
+
项目 Context Files
+
Skills
+
用户追加的 Prompt
+
当前工作目录
```

可以把它理解成：

```text
                   buildSystemPrompt()

                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓

   当前 Tools          项目 Context        Skills

        │                  │                  │
        └──────────────────┼──────────────────┘
                           ↓

                     Final Prompt
```

所以真实 Agent 里的 System Prompt 更像：

> **当前运行环境的一次快照。**

而不是一段永远不变的角色设定。

---

Pi 默认 Prompt 的主体其实也没有想象中那么神秘。

核心仍然是在告诉模型：

```text
你是 Coding Assistant

你有哪些 Tool

应该遵守哪些基本工作规则

当前工作目录是什么
```

但关键区别在于：

> **这些内容不是全部手工拼死，而是根据 Runtime 当前真正拥有的能力生成。**

---

### Tool 会反过来影响 Prompt

上一节我们已经看到一个细节。

Pi 的 Tool 除了：

```text
name
description
parameters
execute
```

还可以提供：

```text
promptSnippet
promptGuidelines
```

例如 `read` 会贡献类似：

```text
Read file contents
```

以及：

```text
Use read to examine files instead of cat or sed.
```

`write` 则会告诉模型：

```text
Use write only for new files or complete rewrites.
```

`edit` 的指导更加具体，例如：

```text
精确修改使用 edit

oldText 应尽量小，但必须能够唯一匹配

同一个文件多个独立修改，
尽量放在一次 edit 调用里

不要产生互相重叠的 edits
```

也就是说：

```text
Tool
```

不只是：

> 给模型一个 Function Schema。

它还可以同时告诉模型：

> **这个能力应该怎么使用。**

于是 Tool 和 Prompt 之间形成了对应关系：

```text
Tool 存在
   ↓
Prompt 中出现相应能力和 Guidelines

Tool 不存在
   ↓
相关 Guideline 也不应该继续出现
```

这比我们之前：

```text
代码里维护 tools
+
另一个地方手写 Prompt
```

更不容易失配。

---

Pi 甚至会根据当前 Tool 组合动态改变一些规则。

例如当前没有：

```text
grep
find
ls
```

这些专用文件探索工具，但存在：

```text
bash
```

Pi 会增加类似这样的 Guideline：

```text
Use bash for file operations like ls, rg, find
```

如果对应的专用工具已经存在，就没必要再给出同样的指导。

所以：

```text
System Prompt
```

不是独立于 Tool System 的。

更准确地说：

> **Agent 有什么能力，会直接影响应该怎样指导模型。**

---

### AGENTS.md 等项目上下文怎么进入 Context

还有一类信息，我们的 Mini Agent 完全没有处理：

```text
项目自己的开发规范
```

例如某个真实项目可能要求：

```text
修改前必须运行 npm test

不要修改 generated 目录

数据库迁移必须放在 migrations/

前端统一使用 pnpm

提交前必须执行 npm run check
```

这些规则当然不能全部写进 Pi 自己的默认 Prompt。

因为：

```text
Pi 的规则
≠
具体项目的规则
```

所以 Coding Agent 还需要加载：

```text
Project Context
```

---

Pi 当前的 Resource Loader 会查找项目上下文文件，包括：

```text
AGENTS.override.md
AGENTS.md
AGENTS.MD
CLAUDE.md
CLAUDE.MD
```

并且不只是查看当前目录。

它会从当前工作目录向父目录继续查找相关 Context File，同时还可以加载 Agent 全局目录中的上下文。

所以一个项目可能形成：

```text
全局规则
   ↓
仓库级 AGENTS.md
   ↓
子目录级 AGENTS.md
   ↓
当前任务
```

这些内容最终会被作为：

```text
contextFiles
```

交给 `buildSystemPrompt()`。

Pi 会把它们组织到类似：

```xml
<project_context>

Project-specific instructions and guidelines:

<project_instructions path=".../AGENTS.md">
...
</project_instructions>

</project_context>
```

这样的区域里。

这样模型看到的不只是：

```text
“你是一个 Coding Agent”
```

还会知道：

```text
“在当前这个项目里，应该怎么工作。”
```

---

这其实解决了一个非常关键的问题。

Coding Agent 一般同时存在两类规则：

```text
Agent 通用规则

例如：
使用 read 检查文件
修改后进行验证
保持回答简洁
```

以及：

```text
Project Rules

例如：
必须用 pnpm
禁止修改某目录
遵守当前项目架构
```

两者不应该混成一个永远写死的 Prompt。

合理的方案是：

```text
Agent Base Prompt
        +
Project Context
        ↓
当前 Agent 的实际 Prompt
```

这样同一个 Coding Agent 换一个仓库以后：

```text
Agent Runtime 不变
Tools 不变
```

但：

```text
Project Context 改变
```

模型的工作方式也可以跟着改变。

---

### Skills 又是怎么加入 Prompt 的

还有最后一块：

```text
Skills
```

假设我们有：

```text
frontend-design
database-migration
release
security-review
```

这样的 Skill。

最直接的做法似乎是：

```text
把所有 SKILL.md
全部拼进 System Prompt
```

但这样很快就会出现问题。

假设：

```text
20 个 Skill
每个几千 Token
```

即使当前任务只是：

```text
修改一个 Button 样式
```

也要把所有 Skill 全部发给模型。

明显浪费 Context。

---

Pi 当前并不是直接把所有 Skill 正文全部塞进 Prompt。

`formatSkillsForPrompt()` 主要放进去的是：

```text
name
description
location
```

例如可以理解成：

```xml
<available_skills>

  <skill>
    <name>frontend-design</name>
    <description>
      用于前端 UI 设计相关任务
    </description>
    <location>
      .../frontend-design/SKILL.md
    </location>
  </skill>

</available_skills>
```

同时告诉模型：

```text
如果当前任务与某个 Skill 的描述匹配，
再使用 read 去读取那个 Skill 文件。
```

于是过程变成：

```text
System Prompt

先告诉模型：
“现在有哪些 Skill”
        ↓
模型判断任务需要 frontend-design
        ↓
read(frontend-design/SKILL.md)
        ↓
真正加载详细说明
```

而不是：

```text
启动 Agent
↓
把所有 Skill 全文全部塞进去
```

这实际上是一种：

> **按需加载 Context。**

---

而且 Pi 还允许 Skill 设置：

```text
disable-model-invocation: true
```

这种 Skill 不会出现在模型可自主选择的 Skill 列表里，只能通过显式方式调用。

所以 Skills 也不是简单：

```text
很多 Prompt 文件
```

而是：

```text
可以按需发现和加载的专项知识 / 指令模块
```

---

现在再回头看我们的 Mini Agent。

当时：

```typescript
const SYSTEM_PROMPT = `...`;
```

没有任何问题。

因为我们只是为了看清：

```text
Agent Loop
```

没有必要一开始就实现动态 Prompt 系统。

但 Pi 让我们看到，当 Agent 真正走向可扩展以后：

```text
System Prompt
```

逐渐会从：

```text
一段字符串
```

变成：

```text
                Final System Prompt

                        ↑

        ┌───────────────┼───────────────┐
        │               │               │

    Base Prompt       Tools        Project Context

        │               │               │
        │               │               │
        └───────────────┼───────────────┘
                        │
                      Skills
                        │
                 Append Prompt
                        │
                       cwd
```

所以这一节真正值得记住的并不是：

> Pi 的 Prompt 到底写了哪几句话。

因为这些文字以后完全可能继续变化，另一个框架可能也完全不同。

真正值得借鉴的是：

> **System Prompt 应该和 Agent 当前真实拥有的能力、运行环境以及项目上下文保持同步。**

不过到这里，我们仍然有一个问题没有解决。

无论 Prompt 构建得多完善，我们前面的 Mini Agent 运行时仍然只有：

```typescript
const messages = [];
```

程序一退出：

```text
整个任务历史就没有了。
```

而真实 Coding Agent 显然不能每次启动都从零开始。

所以接下来就要从：

```text
Messages
```

继续往上一层，看看为什么真实 Agent 还需要：

```text
Session
```

## Messages 不够了：为什么还需要 Session

前面的 Mini Agent 运行时，我们一直维护这样一个数组：

```typescript
const messages: ChatCompletionMessageParam[] = [
  {
    role: "developer",
    content: SYSTEM_PROMPT,
  },
  {
    role: "user",
    content: task,
  },
];
```

后面每发生一次模型调用或者 Tool Call，就继续：

```typescript
messages.push(...)
```

所以整个 Agent 的运行过程，其实都暂时保存在：

```text
messages[]
```

里面。

这种方式非常适合理解 Agent Loop。

但只要程序退出：

```text
进程结束
   ↓
内存释放
   ↓
Messages 消失
```

下一次重新启动以后，Agent 根本不知道之前发生过什么。

真正的 Coding Agent 显然不能一直这样工作。

---

### 我们之前的 Messages 只存在内存里

假设我们正在完成一个稍微复杂一点的任务：

```text
重构用户认证模块，并保证测试通过
```

Agent 已经工作了 20 分钟：

```text
User
→ 重构认证模块

Assistant
→ bash("npm test")

Tool
→ 3 个测试失败

Assistant
→ read("src/auth/service.ts")

Tool
→ 文件内容

Assistant
→ edit(...)

Tool
→ 修改成功

Assistant
→ bash("npm test")

Tool
→ 还剩 1 个测试失败

……
```

结果这时候：

```text
终端被关闭
```

如果只有内存里的：

```typescript
messages
```

那么下一次启动 Agent：

```text
之前做了什么？
修改了哪些文件？
测试失败在哪里？
模型已经尝试过什么？
```

全部不知道。

最简单的补救办法当然是：

```typescript
await writeFile(
  "messages.json",
  JSON.stringify(messages),
);
```

重新启动的时候：

```typescript
messages =
  JSON.parse(
    await readFile("messages.json"),
  );
```

这至少已经能够做到：

```text
持久化对话历史
```

但继续往下走会发现：

> **真实 Session 保存的东西，并不只是 Messages。**

---

### Pi 为什么把 Session 保存成 JSONL

Pi 当前会把 Session 持久化为：

```text
JSONL
```

也就是：

```text
JSON Lines
```

默认 Session 文件大致保存在：

```text
~/.pi/agent/sessions/--项目路径--/
└── 时间戳_session-id.jsonl
```

其中每一行都是一个独立 JSON 对象。

例如可以把它想象成：

```json
{"type":"session","version":3,"id":"...","cwd":"/project"}
{"type":"message","id":"a1","parentId":null,"message":{...}}
{"type":"message","id":"a2","parentId":"a1","message":{...}}
{"type":"model_change","id":"a3","parentId":"a2","provider":"openai","modelId":"..."}
{"type":"message","id":"a4","parentId":"a3","message":{...}}
```

为什么不用一个巨大的：

```json
{
  "messages": [...]
}
```

然后每次整体覆盖？

JSONL 有一个很直接的好处：

```text
新事件发生
↓
在文件末尾追加一条 Entry
```

而不是：

```text
读取整个 Session
↓
修改大 JSON
↓
重新写完整文件
```

对于长期运行、不断产生新记录的 Agent 来说，这种结构比较自然。

更重要的是，Pi 保存的单位已经不只是：

```text
Message
```

而是：

```text
Session Entry
```

---

### Message、Tool Result 和其他状态怎么保存

我们的 Mini Agent 基本只有：

```text
User Message
Assistant Message
Tool Result
```

Pi 的 Session 当然也会保存这些内容。

例如当前 Session Format 中，基础消息大致包括：

```text
UserMessage
AssistantMessage
ToolResultMessage
```

其中 Assistant Message 还会记录：

```text
provider
model
usage
stopReason
timestamp
```

Tool Result 则不仅有：

```text
content
```

还会记录：

```text
toolCallId
toolName
isError
details
usage
```

等信息。

这就比我们之前简单的：

```typescript
messages.push({
  role: "tool",
  content: result,
});
```

丰富很多。

---

但 Session 里还不止 Message。

比如用户执行过程中切换了模型：

```text
Claude
↓
OpenAI
```

Pi 可以记录：

```text
model_change
```

用户调整 Thinking Level，也可以记录：

```text
thinking_level_change
```

后面我们会讲到的 Context 压缩，会产生：

```text
compaction
```

用户切换分支时可能产生：

```text
branch_summary
```

Extension 还可以保存自己的：

```text
custom
custom_message
```

等 Entry。

所以真实 Session 接近：

```text
              Session

                 │
    ┌────────────┼─────────────┐
    ↓            ↓             ↓

 Messages    Runtime State   Metadata

    │            │             │
 User         Model Change   Session Name
 Assistant    Thinking       Labels
 Tool Result  Compaction     Custom State
              Branch
```

这就是：

```text
Messages
```

和：

```text
Session
```

之间最大的区别之一。

可以先简单理解成：

> **Messages 是模型对话的一部分，而 Session 是整个 Agent 工作过程的持久化记录。**

---

这个区别后面会非常重要。

因为：

```text
Session 里保存了
```

不代表：

```text
下一轮都要发送给模型
```

例如 Pi 的：

```text
CustomEntry
```

可以保存在 Session 里，但是明确：

```text
不进入 LLM Context
```

而：

```text
CustomMessageEntry
```

则可以进入 Context。

所以真正的 Agent 里至少要区分三件事情：

```text
程序曾经发生过什么
        ↓
      Session

模型下一轮需要看到什么
        ↓
      Context

模型之间实际交换的对话数据
        ↓
      Messages
```

这三者有关联，但并不完全相等。

---

### 为什么 Session 是一棵树而不是一个数组

我们最容易想到的对话历史是：

```text
Message 1
   ↓
Message 2
   ↓
Message 3
   ↓
Message 4
```

也就是：

```typescript
messages[0]
messages[1]
messages[2]
messages[3]
```

一条线。

但 Pi 当前 Session Entry 会带：

```typescript
id
parentId
```

例如：

```text
A
↓
B
↓
C
```

其实表示：

```text
B.parentId = A

C.parentId = B
```

于是如果从：

```text
B
```

重新开始一条路线：

```text
        ┌→ C → D
A → B ──┤
        └→ E → F
```

完全不需要把旧历史删除。

---

为什么 Coding Agent 特别适合这种结构？

因为写代码本身就经常存在：

```text
尝试
↓
失败
↓
回退
↓
换一种方案
```

例如 Agent 一开始决定：

```text
方案 A：
直接修改 AuthenticationService
```

跑了一段以后发现：

```text
架构方向不对
```

我们可能希望回到之前：

```text
读取完代码
但还没有开始修改
```

那个位置，然后告诉 Agent：

```text
不要继续方案 A，
换成增加 Adapter 的方式。
```

如果历史只有一条线：

```text
A → B → C → D
```

通常只能：

```text
删除 C、D
```

或者：

```text
复制一份历史
```

Pi 的树结构则可以保留：

```text
               ┌→ 方案 A
原始上下文 ────┤
               └→ 方案 B
```

两条路线都存在。

---

这背后其实还有一个很重要的思想：

> **Agent History 不一定是一条不可修改的时间线。**

尤其对于 Coding Agent：

```text
探索
试错
回退
重新规划
```

本身就是正常工作方式。

所以 Session Tree 比简单的：

```text
Message[]
```

能够表达更多东西。

---

### /tree、/fork 和 /clone 解决了什么

Pi 在这个 Session Tree 上进一步提供了几个很有代表性的能力：

```text
/tree
/fork
/clone
```

虽然它们表面上是 CLI 功能，但背后其实都建立在：

```text
Session History
```

不是简单数组，而是带有父子关系的历史树。

---

先看：

```text
/tree
```

它允许在当前 Session 历史树中跳回之前某个节点，然后从那里继续。

例如原来：

```text
A → B → C → D
```

现在回到：

```text
B
```

重新继续：

```text
        ┌→ C → D
A → B ──┤
        └→ E → F
```

这里需要注意：

```text
C → D
```

不会消失，也不会被删除。

Pi 只是把当前的：

```text
leaf
```

移动到了新的分支上。

之后仍然可以再次使用 `/tree`，从 E、D 或其他历史节点继续。

所以 `/tree` 做的是：

```text
切换当前对话上下文
```

而不是：

```text
删除后续历史
```

它也不会自动恢复代码文件。C、D 执行过的代码修改，仍然可能保留在当前工作区中。

---

`/fork` 则更进一步。

它会从当前活动分支中的某个历史用户消息创建新的 Session 文件。

可以理解成：

```text
原 Session

A → B → C → D
        ↓
      /fork
        ↓
新 Session

A → B
```

然后从这里修改 Prompt，继续新的任务方向。

原 Session 和新 Session 会分别保存自己的后续历史。

Pi 当前也会在新 Session Header 中记录：

```text
parentSession
```

用于表示它来源于哪个 Session。

---

`/clone` 则更像：

> **把当前正在使用的完整活动分支复制成一个新的 Session。**

例如：

```text
A → B → C → D
```

当前就在：

```text
D
```

执行 Clone 后：

```text
Session 1

A → B → C → D


Session 2

A → B → C → D
```

两边接下来可以各自继续。

---

三者可以简单区分成：

| 操作 | 核心目的 |
| --- | --- |
| `/tree` | 在同一个 Session 中切换历史分支 |
| `/fork` | 从历史用户消息创建新的 Session |
| `/clone` | 把当前活动分支整体复制成新的 Session |

真正需要理解的不是三个命令怎么用。

而是：

> **Pi 把“试错、回退、分支探索”当成 Coding Agent 正常工作过程的一部分。**

---

现在再回头看我们之前的：

```typescript
const messages = [];
```

可以发现从 Mini Agent 走到真实 Coding Agent 以后，状态逐渐变成：

```text
Mini Agent

Messages
   ↓
只负责当前进程里的对话状态
```

到了 Pi：

```text
Session

├── Messages
├── Tool Results
├── Model Changes
├── Thinking Changes
├── Compaction
├── Branch Information
├── Extension State
└── Metadata
```

而且这些内容：

```text
持久化到 JSONL
+
通过 id / parentId 组成树
```

这样 Agent 才真正拥有：

```text
恢复
继续
回退
分支
```

这些长期运行所需要的能力。

不过这里马上会出现下一个问题。

即使 Session 可以无限保存：

```text
100 条
1000 条
10000 条
```

模型的 Context Window 也不是无限的。

所以：

```text
Session 可以保存完整历史
```

并不意味着：

```text
每一轮都可以把完整历史发给模型
```

## Context 越来越长怎么办：Compaction

上一节我们刚刚把：

```typescript
const messages = [];
```

升级成了可以长期保存的：

```text
Session
```

这样程序退出以后，历史不会丢失。

但紧接着就会出现另一个问题：

> **Session 可以一直增长，模型的 Context Window 却不可以。**

也就是我们常说的模型上下文是有限制的。

---

### 我们之前把所有 Messages 一直往后追加

前面的 Mini Agent 每完成一轮，基本都在做：

```typescript
messages.push(assistantMessage);
messages.push(toolResult);
```

于是整个执行过程就是：

```text
User
↓
Assistant
↓
Tool Result
↓
Assistant
↓
Tool Result
↓
Assistant
↓
Tool Result
↓
……
```

下一次调用模型时，再把：

```typescript
messages
```

整个交回去。

对于十几轮的小任务，这样非常自然。

因为模型下一轮能够直接看到：

```text
用户最开始要求什么

之前读过哪些文件

执行过哪些命令

哪些方案失败了

刚刚修改了什么
```

这也是 Agent 能够连续工作的基础。

---

但 Coding Agent 的 Message 往往增长得非常快。

一次：

```text
read
```

可能返回几千行代码。

一次：

```text
bash
```

可能返回大量测试日志。

再加上：

```text
Assistant Response
Tool Call
Tool Result
Thinking
用户继续补充要求
```

几十轮以后，Context 很容易变成：

```text
User Message
Assistant
Tool Result 20KB
Assistant
Tool Result 35KB
Assistant
Tool Result 10KB
……
```

前面我们已经通过 Tool 截断减少了一部分问题。

但即使每个 Tool Result 都有限制：

> **只要 Session 足够长，Context 还是会不断增长。**

---

### Context Window 为什么迟早会耗尽

这里我们需要再次区分两个概念：

```text
Session
```

和：

```text
Context
```

Session 可以保存在磁盘里，理论上可以很长：

```text
几百条 Entry
几千条 Entry
甚至更长
```

但每次调用模型时，真正能够送进去的内容受到：

```text
Context Window
```

限制。

可以简单理解成：

```text
模型 Context Window

┌─────────────────────────────┐
│ System Prompt               │
│ Project Context             │
│ User Messages               │
│ Assistant Messages          │
│ Tool Calls                  │
│ Tool Results                │
│ Compaction Summary          │
│ ……                          │
│                             │
│ 还要给模型输出留空间        │
└─────────────────────────────┘
```

所以不能真的等到：

```text
输入 Token
=
Context Window
```

才处理。

因为模型还需要继续输出。

真实 Runtime 通常必须提前预留一部分空间。

---

Pi 当前自动 Compaction 的核心判断可以概括成：

```text
contextTokens > contextWindow - reserveTokens
```

其中默认：

```text
reserveTokens = 16384
```

也就是在真正把 Context Window 用满之前，就提前为下一次模型输出预留空间。

例如假设模型 Context Window 是：

```text
128K
```

并且预留：

```text
16K
```

那么接近：

```text
112K
```

时，就应该开始考虑压缩，而不是继续无脑追加。

---

### Pi 什么情况下触发 Compaction

Pi 同时支持：

```text
自动 Compaction
+
手动 Compaction
```

手动可以直接：

```text
/compact
```

也可以：

```text
/compact <额外要求>
```

告诉模型这次总结应该重点保留什么。

自动 Compaction 则主要发生在：

```text
Context 接近上限
```

或者已经出现：

```text
Context Overflow
```

时。

Pi 当前还会在一个 Agent Run 的多轮执行过程中检查 Context。

例如：

```text
Model
↓
Tool Calls
↓
Tool Results 写回 Context
↓
发现 Context 已经太大
↓
Compaction
↓
再开始下一轮 Model
```

也就是说，它不是一定要等：

```text
整个 Agent Run 结束
```

以后才压缩。

长任务可以在执行过程中完成 Compaction，然后继续当前任务。

这点非常重要。

否则一个一次运行几十轮的 Agent：

```text
还没结束
↓
Context 已经满了
↓
只能失败
```

就无法真正处理长任务。

---

### Summary + Recent Messages 怎么重新构建 Context

如果让我们自己设计最简单的压缩方案，可能会直接想到：

```text
Context 太长
↓
删除最早的 Messages
```

例如原来是：

```text
M1 M2 M3 M4 M5 M6 M7 M8 M9 M10
```

直接删除前面的内容，变成：

```text
M6 M7 M8 M9 M10
```

这样确实可以缩短 Context。

但模型也可能突然不知道：

```text
用户最初的目标是什么？

之前已经做过什么？

为什么选择当前方案？

哪些方案已经失败？

哪些文件曾经被修改？
```

所以 Pi 并不是简单地删除旧消息，而是：

```text
总结较老的历史
+
保留最近的原始消息
```

大致过程可以这样理解：

```text
Compaction 之前

Context 中的历史消息：
M1 M2 M3 M4 M5 M6 M7 M8 M9 M10

从最新消息开始反向估算 token 数
                         ↑
                 尽量保留约 20K tokens

                         ↓

较老的消息：
M1 M2 M3 M4 M5 M6
        ↓
      Summary

最近的消息：
M7 M8 M9 M10
        ↓
    保留原始内容
```

这里的 `M1、M2...` 表示 Context 中的一条条消息。

它们可能包括：

```text
用户消息
Assistant 消息
Tool Call
Tool Result
```

因此，这里的“最近消息”不等同于“最近几条用户消息”，也不严格等同于“最近几个完整 Agent turn”。

下一轮模型实际看到：

```text
System Prompt
      +
Compaction Summary
      +
M7
M8
M9
M10
```

而不是重新发送完整：

```text
M1 ~ M10
```

Pi 当前默认使用：

```text
keepRecentTokens = 20000
```

它会从最新的 Session Entry 开始向前估算消息大小，直到接近这个范围。

这个估算并不是调用一个精确的 tokenizer，而是根据消息内容的字符数量进行近似计算。因此，`20K tokens` 更准确地说是“尽量保留约 20K tokens 的最近消息”，并不是一个绝对精确的硬边界。

至于工具调用之间的边界，以及一个 Agent turn 本身过大的情况，Pi 还有专门的处理方式，后面会单独说明。

下一轮 Context 的构建可以概括成：

```text
Session
   ↓
找到最新的 Compaction 边界
   ↓
旧消息 → Summary
最近消息 → 保留原始内容
   ↓
重新组合 Context
   ↓
发送给 Model
```

---

这里特别值得注意：

> **Summary 不是对 Session 的替代，而是下一轮 Context 中对旧历史的压缩表示。**

完整历史仍然保存在 Session 中。

所以这三个概念需要分开理解：

```text
Session
│
│ 保存完整历史
│
├───────────────────────────────┐
│                               │
↓                               │
Compaction                      │
│                               │
├─ Older History → Summary      │
│                               │
└─ Recent History → 原始保留    │
                                │
              ↓                 │
            Context             │
              ↓                 │
             Model              │
```

```text
Session
→ 保存完整历史

Compaction
→ 压缩较老的历史

Context
→ 根据当前分支和 Compaction 结果，重新组织下一轮发送给模型的内容
```

也就是说：

```text
Session History
→ 我们真正发生过什么

Context View
→ 下一轮模型需要看到什么
```

Pi 并没有破坏原来的 Session History，只是为模型构建了一个更短的 Context View。

---

### Summary 里到底应该保留什么

这里还有一个很重要的问题。

假如只是让模型：

```text
“总结一下上面的聊天”
```

很容易得到这种 Summary：

```text
用户正在修改一个项目，
期间读取了多个文件并进行了若干修改，
目前还需要继续解决问题。
```

这对 Coding Agent 基本没什么用。

因为真正需要保留下来的往往是：

```text
当前 Goal

用户提出的 Constraints

已经完成什么

当前做到哪里

遇到了什么 Blocker

为什么做出某个设计决定

下一步应该做什么

哪些文件已经读过

哪些文件已经修改
```

Pi 当前使用的 Summary 本身就是结构化的，大致包括：

```markdown
## Goal

## Constraints & Preferences

## Progress

### Done

### In Progress

### Blocked

## Key Decisions

## Next Steps

## Critical Context

<read-files>
...
</read-files>

<modified-files>
...
</modified-files>
```

这其实非常值得借鉴。

对于 Agent 来说，一个好的 Compaction Summary 不应该追求：

> 把对话总结得尽可能详细。

它真正应该解决的是：

> **即使忘掉旧的原始 Messages，Agent 是否还能继续工作？**

---

例如原始历史可能非常长：

```text
用户要求修复认证模块
↓
读了 8 个文件
↓
尝试方案 A
↓
测试失败
↓
放弃方案 A
↓
改成方案 B
↓
修改 service.ts
↓
修改 adapter.ts
↓
目前还剩一个 refresh token 测试失败
```

一个有价值的 Summary 应该类似这种：

```text
Goal:
修复并重构认证模块，保证测试通过。

Progress:
- 已确认问题不在 Controller。
- 已放弃直接修改 AuthenticationService 的方案。
- 当前采用 Adapter 方案。
- service.ts 和 adapter.ts 已修改。
- 目前只剩 refresh token 相关测试失败。

Key Decision:
认证 Provider 通过 Adapter 隔离，不继续向 Service 增加 Provider 分支。

Next Step:
检查 refresh-token.test.ts 与 TokenAdapter 的过期时间处理。

Modified Files:
- src/auth/service.ts
- src/auth/adapter.ts
```

这样即使旧的几十条 Tool Result 不再进入 Context，模型依然能够继续工作。

---

Pi 还会累计跟踪：

```text
readFiles
modifiedFiles
```

即使发生多次 Compaction，也会尽量把这些文件操作信息继续带入后续 Summary。

这也是 Coding Agent 相比业务场景比较特殊的一点：

> **它的历史不仅是“聊过什么”，还有“对真实环境做过什么”。**

---

### 为什么完整历史不能直接删除

既然：

```text
旧 Messages
```

已经被 Summary 替代了，那为什么还要继续在 Session 中保存？

直接删除不是更省空间吗？

其实不应该。

因为：

```text
Compaction
```

本质上是一种：

> **有损压缩。**

Pi 官方文档也明确指出：

```text
Compaction is lossy.
```

Summary 不可能百分之百保留旧历史的所有细节。

例如：

```text
某一次完整测试错误日志

某段曾经读取过的代码

模型具体尝试过的一条命令

一个后来才发现重要的用户要求
```

都有可能在 Summary 中被弱化甚至遗漏。

所以 Pi 的设计是：

```text
完整历史
→ 继续留在 Session JSONL

模型 Context
→ 使用 Summary + Recent Messages
```

而不是：

```text
Compaction
↓
永久删除历史
```

---

这也是为什么上一节介绍的：

```text
/tree
```

依然有意义。

即使某段内容已经不在当前 Context 中：

```text
Session 里仍然存在
```

用户依旧可以回到之前的历史位置。Pi 的 Session 构建 Context 时，会根据当前分支和最新的 Compaction Entry，决定哪些 Entry 转换成下一轮模型真正看到的 Messages。

所以：

```text
存储历史
```

和：

```text
给模型提供历史
```

必须分开设计。

我们已经强调了很多遍。

---

### Compaction 以后，Session 发生了什么

Pi 并不会把旧 Entry 重写掉。

它会在 Session 中继续追加一个：

```text
CompactionEntry
```

里面记录类似：

```typescript
{
  type: "compaction",
  summary: "...",
  firstKeptEntryId: "...",
  tokensBefore: 50000
}
```

其中最重要的是：

```text
summary
```

以及：

```text
firstKeptEntryId
```

后者告诉系统：

> **哪些旧消息已经被 Summary 覆盖，从哪里开始继续保留原始消息。**

于是 Session 可以是：

```text
M1
↓
M2
↓
M3
↓
M4
↓
M5
↓
M6
↓
M7
↓
Compaction
```

但下一次构建 Context 时变成：

```text
Compaction Summary
↓
M5
↓
M6
↓
M7
```

具体保留边界由：

```text
firstKeptEntryId
```

确定。

这比直接修改：

```text
messages[]
```

要清晰很多。

因为：

```text
Session History
```

没有被破坏。

只是：

```text
Context View
```

发生了变化。

---

### 如果单独一轮就特别长怎么办

这里还有一个比较真实的边界情况。

通常我们希望 Compaction：

```text
按完整 Turn 切
```

因为 Tool Call 和 Tool Result 最好不要被硬生生拆开。

例如：

```text
User
↓
Assistant Tool Call
↓
Tool Result
↓
Assistant
```

最好作为一个完整工作过程理解。

但如果：

```text
单独一个 Turn
```

本身就已经非常大呢？

例如 Agent 一次读了大量文件、运行了超长测试，又进行了多次 Tool Call。

这时候甚至：

```text
一个 Turn
>
keepRecentTokens
```

Pi 也处理了这种：

```text
Split Turn
```

场景。

它会对这一轮较早的部分单独做 Summary，同时保留更靠后的内容，而不是因为“不能在 Turn 中间切”就彻底无法 Compaction。

这个细节我们不需要继续深入源码。

但它说明了一件事情：

> **Context 管理不能假设每一轮都很小。**

对于 Coding Agent，单轮 Tool Output 本身就可能非常大。

---

### Branch Summary 又解决了什么

Pi 还有一个和 Compaction 很像，但目的不同的机制：

```text
Branch Summarization
```

前面我们讲 `/tree` 时有这样一个场景：

```text
        ┌→ B → C → D
A ──────┤
        └→ E → F
```

假设之前一直工作在：

```text
B → C → D
```

现在决定回到：

```text
A
```

然后换一条路线：

```text
E → F
```

问题来了。

旧分支：

```text
B → C → D
```

里面可能已经获得很多有价值的信息。

例如：

```text
哪些方案不可行

测试暴露了什么问题

读取过哪些文件

发现了哪些架构约束
```

如果切到新分支以后全部丢掉：

```text
又有点可惜。
```

---

所以 Pi 在 `/tree` 分支导航时，还可以对正在离开的那条 Branch 生成：

```text
Branch Summary
```

然后把它带到新的路线中。

可以理解成：

```text
旧分支

A → B → C → D
    ↑
    └─ 这些探索结果
       ↓
   Branch Summary


新分支

A → E → F
        +
“刚才另一条路线已经发现了什么”
```

这样新的 Agent 不需要重新经历全部旧分支，也不会完全失去刚才探索得到的信息。

---

虽然：

```text
Compaction
```

和：

```text
Branch Summary
```

都会调用模型生成 Summary，但它们解决的是两个不同问题：

| 机制             | 主要解决什么            |
| -------------- | ----------------- |
| Compaction     | 当前 Context 太长     |
| Branch Summary | 切换分支时保留旧路线中的有价值信息 |

这两个机制最终都说明：

> **真实 Agent 的 Context 并不是简单等于“完整聊天历史”。**

---

现在我们可以把最开始的 Mini Agent 再升级一层。

最开始是：

```text
Messages
↓
全部发送给模型
```

后来有了 Session：

```text
Session
↓
保存完整工作历史
```

再到 Pi 的 Context 管理：

```text
                 Session
                    │
        ┌───────────┴───────────┐
        │                       │
   完整历史保留             当前 Active Branch
                                │
                         Compaction 判断
                                │
                   ┌────────────┴────────────┐
                   ↓                         ↓

            Older History              Recent History
                   ↓                         ↓
               Summary                 原始 Messages
                   └────────────┬────────────┘
                                ↓
                             Context
                                ↓
                              Model
```

不过即使 Context 问题解决了，我们的 Mini Agent 还有一个非常明显的限制。

前面代码一直直接依赖：

```typescript
new OpenAI()
```

如果以后想切换：

```text
Anthropic
Google
OpenRouter
Bedrock
甚至本地模型
```

难道每换一个 Provider，都要重新修改 Agent Loop？

Pi 显然没有这么做。

## 只支持一个 OpenAI 模型肯定不够

前面的 Mini Agent 从一开始就直接依赖：

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response =
  await client.chat.completions.create({
    model: process.env.OPENAI_MODEL!,
    messages,
    tools,
  });
```

为了学习 Agent Loop，这样简化写还是挺合理的。

我们当时真正关心的是：

```text
Model
↓
Tool Call
↓
Tool Result
↓
Model
```

至于底层到底是谁提供模型，并不是重点。

但真实 Coding Agent 显然不能永远假设：

```text
模型 = OpenAI
```

Pi 当前支持 OpenAI、Anthropic、Google、OpenRouter、Amazon Bedrock、Groq、Mistral、DeepSeek 等多种 Provider，也支持 Ollama、vLLM、LM Studio 这类 OpenAI-compatible API。`pi-ai` 的定位就是把这些差异尽量挡在 Agent Runtime 下面。

---

### 我们之前把 OpenAI SDK 写死了

先看看当前 Mini Agent 的依赖关系：

```text
Agent Loop
    ↓
OpenAI SDK
    ↓
OpenAI API
```

这意味着：

```typescript
client.chat.completions.create(...)
```

实际上已经进入了我们的 Agent Runtime。

如果以后改成 Anthropic，可能会变成另一套调用：

```text
Agent Loop
    ↓
Anthropic SDK
    ↓
Anthropic Messages API
```

再接 Google，又可能出现第三种实现。

很容易就写成了：

```typescript
if (provider === "openai") {
  // OpenAI
}

if (provider === "anthropic") {
  // Anthropic
}

if (provider === "google") {
  // Google
}
```

然后这些 Provider 差异继续蔓延到：

```text
Messages 转换
Tool Calling
Streaming
Thinking
Token Usage
错误处理
认证
```

其实麻烦的并不是代码多。

而是

> **模型 Provider 的变化开始污染 Agent Loop。**

但从 Agent Runtime 的角度看，它其实只想做：

```text
给模型 Context
↓
得到模型响应
↓
发现 Tool Call
↓
执行 Tool
↓
继续下一轮
```

至于下面到底调用：

```text
OpenAI
Anthropic
Google
```

理论上不应该改变这条 Loop。

---

### pi-ai 如何把 Provider 和 Agent 解耦

这也是 Pi 为什么单独拆出：

```text
@earendil-works/pi-ai
```

这一层。

整体关系从我们的：

```text
Agent Runtime
     ↓
OpenAI SDK
```

变成：

```text
Agent Runtime
     ↓
   pi-ai
     ↓
 Provider
     ↓
真实模型 API
```

`pi-ai` 当前提供的是一套统一的 LLM API，负责 Provider Collection、模型查询、认证解析、Streaming、Tool Calling、Token 与 Cost 等能力。

例如它可以先建立一组 Models：

```typescript
const models = builtinModels();
```

然后：

```typescript
const model =
  models.getModel(
    "openai",
    "gpt-4o-mini",
  );
```

调用时则统一：

```typescript
const response =
  await models.complete(
    model,
    context,
  );
```

如果换成 Anthropic，核心调用方式并不需要跟着完全重写：

```typescript
const model =
  models.getModel(
    "anthropic",
    "claude-sonnet-4-5",
  );

const response =
  await models.complete(
    model,
    context,
  );
```

Pi 当前的 `Models` Collection 会根据这个 Model 属于哪个 Provider，把请求路由到对应 Provider。

于是上面的 Agent Runtime 看到的仍然可以是：

```text
Context
↓
Model
↓
Response
```

而不是：

```text
OpenAI Context
Anthropic Context
Google Context
……
```

---

### Model、Provider 和 API Protocol 不是一回事

这里有一个比较容易混淆的问题。

平时我们经常把：

```text
Model
Provider
API
```

混在一起说。

但 Pi 在这里把它们拆得比较清楚。

可以先看三个概念。

#### Model

Model 是具体要调用的模型。

例如：

```text
某个 GPT 模型
某个 Claude 模型
某个 Gemini 模型
```

它会包含：

```text
model id
context window
是否支持 image
是否支持 reasoning
价格信息
```

等模型级信息。

---

#### Provider

Provider 是真正的运行单元。

Pi 当前对 Provider 的定义很明确：

> Provider 拥有自己的模型目录、认证方式以及 Stream 行为。

例如可以理解成：

```text
Anthropic Provider

├─ 有哪些 Model
├─ API Key / OAuth 怎么获取
├─ 请求如何发送
└─ Stream 怎么处理
```

`Models` Collection 再负责：

```text
Model
↓
找到拥有它的 Provider
↓
Provider 执行
```

---

#### API Protocol

这又是另外一层。

不同 Provider 并不意味着：

```text
每个 Provider
=
一种完全不同的协议
```

例如 Pi 当前文档明确区分了：

```text
anthropic-messages
openai-responses
openai-completions
```

这样的 API Implementation。

Anthropic Provider 可以走：

```text
anthropic-messages
```

OpenAI 可以走：

```text
openai-responses
```

而 xAI、Groq、Cerebras、OpenRouter 等多个 Provider，则可以共享：

```text
openai-completions
```

这一类协议实现。

所以实际结构更像：

```text
Model
  ↓
Provider
  ↓
API Implementation
  ↓
Remote API
```

例如：

```text
某个 OpenRouter Model
        ↓
OpenRouter Provider
        ↓
openai-completions
        ↓
OpenRouter API
```

---

这个区分非常重要。

如果新加一个 Provider，本身就兼容现有协议：

```text
Provider 配置
+
复用现有 API Implementation
```

往往就已经能解决大量工作。

这也是为什么 Pi 可以同时支持：

```text
很多 Provider
```

但不意味着底层存在同样数量完全独立的 LLM 调用实现。

---

### 为什么切换模型时 Agent Loop 不应该重写

现在回到最重要的问题。

假设当前 Agent 正在执行：

```text
修复登录测试失败的问题
```

它的 Loop 是：

```text
Model
↓
bash("npm test")
↓
Tool Result
↓
Model
↓
read(...)
↓
Tool Result
↓
Model
```

现在把模型从：

```text
GPT
```

换成：

```text
Claude
```

这条执行链理论上有什么变化？

其实没有。

仍然是：

```text
Model
↓
Tool Call
↓
Tool Result
↓
Model
```

再换 Gemini：

```text
Model
↓
Tool Call
↓
Tool Result
↓
Model
```

也还是一样。

所以真正合理的边界应该是：

```text
                  Agent Runtime

                Agent Loop
                    │
                    │
                    ▼
             Unified Model API
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓

    OpenAI       Anthropic     Google
```

而不是：

```text
OpenAI Agent Loop

Anthropic Agent Loop

Google Agent Loop
```

这其实和前面的 Tool 分层是同一个思想：

> **稳定的核心逻辑，不应该因为底层实现变化而不断重写。**

---

Pi 的 Context 也专门设计成可以在模型之间传递。

它统一维护：

```text
systemPrompt
messages
tools
```

而不同 Provider 负责把这套通用 Context 转换成自己真正需要的请求格式。`pi-ai` README 也把 Context 描述为可以序列化并在模型之间转移的结构。

所以理论上可以出现：

```text
前 10 轮
Claude
   ↓
同一个 Session / Context
   ↓
第 11 轮
GPT
```

Agent 不需要因为模型变化就把任务从头开始。

Pi 的 Session 里甚至会专门保存：

```text
model_change
```

来记录中途切换过哪个 Provider 和 Model。

---

### 不同模型的能力其实也不完全一样

当然，统一接口并不意味着：

```text
所有模型都完全一样
```

这也是抽象模型层最容易走向另一个极端的地方。

不同模型可能有不同：

```text
Context Window

是否支持图片

是否支持 Reasoning

Reasoning 参数

Tool Calling 行为

Streaming 行为
```

所以 Pi 的 Model 本身会保存这些能力信息。

例如可以查询：

```typescript
model.contextWindow
model.input
model.reasoning
model.api
```

这意味着正确的统一不是：

> 假设所有模型都完全一样。

而是：

> **把共同部分统一，把真正不同的能力明确暴露出来。**

这一点很重要。

Pi 在统一 `stream()`、`complete()` 等入口的同时，仍然允许对特定 API 使用对应的 Provider-specific Options。

所以结构其实是：

```text
统一接口
+
必要时暴露 Provider 特有能力
```

而不是：

```text
强行把所有 Provider 做成完全一样
```

---

### Token、Cost 和 Auth 为什么也属于模型层

我们前面的 Mini Agent 对 Token 基本没有处理。

最多只是：

```text
调用模型
↓
拿到 Response
```

但真实 Coding Agent 长期运行以后，尤其是进入商业化阶段，我们就会关心：

```text
这一轮用了多少 Token？

整个 Session 花了多少钱？

这个模型 Context Window 多大？

缓存命中了多少？

当前 Provider 怎么认证？
```

这些信息其实都和：

```text
Model / Provider
```

紧密相关。

---

Pi 当前的 Assistant Message 会记录 Usage：

```typescript
usage: {
  input,
  output,
  cacheRead,
  cacheWrite,
  reasoning,
  totalTokens,

  cost: {
    input,
    output,
    cacheRead,
    cacheWrite,
    total
  }
}
```

Session 因此可以把模型使用情况继续保存下来。

`pi-ai` 也直接负责 Token 和 Cost Tracking，而不是把价格计算塞进 Agent Loop。

这才是合理的。

因为：

```text
Agent Loop
```

根本不应该知道：

```text
某个 Provider
输入 Token 单价是多少
```

这种事情。

---

Auth 也是一样。

我们的 Mini Agent 直接：

```typescript
process.env.OPENAI_API_KEY
```

但多 Provider 以后可能出现：

```text
API Key
OAuth
AWS Credential
Google ADC
Stored Credential
环境变量
```

Pi 当前把认证解析交给 Provider。

当执行：

```typescript
models.complete(model, context)
```

时，Models Collection 会通过拥有该 Model 的 Provider 解析认证信息。

也就是说：

```text
Agent Runtime
```

只需要说：

```text
“我要调用这个 Model。”
```

不用自己负责：

```text
“Anthropic 的 Key 在哪？”
“OpenAI 怎么认证？”
“Bedrock 用什么 Credential？”
“OAuth Token 过期了吗？”
```

这些属于：

```text
Provider Layer
```

的职责。

---

所以现在回头看 Pi 最开始那三层：

```text
pi-coding-agent
        ↓
pi-agent-core
        ↓
pi-ai
```

其中最下面这个：

```text
pi-ai
```

已经不只是：

> “帮我们换几个模型。”

它真正隔离的是一整组模型基础设施：

```text
Model Catalog
Provider
API Protocol
Auth
Streaming
Tool Calling
Reasoning
Token
Cost
```

这样上面的：

```text
Agent Loop
```

才可以尽量保持稳定。

---

不过前面还有一个细节我们一直没有展开。

我们的 Mini Agent 每次调用模型都是：

```typescript
const response =
  await client.chat.completions.create(...);
```

然后一直：

```text
等
↓
等
↓
等
↓
完整 Response 返回
```

真实 Coding Agent 如果也这样做，模型思考几十秒、输出大量内容、开始生成 Tool Call 时，用户界面几乎什么都不知道。

所以 Pi 的模型层和 Agent Runtime 都大量建立在：

```text
Streaming Event
```

之上。

下一节继续看：

## 从一次性 Response 到 Streaming Event

前面的 Mini Agent 每次调用模型时，采用的都是：

```typescript
const response =
  await client.chat.completions.create({
    model,
    messages,
    tools,
  });
```

程序执行到这里以后，就开始等待。

等模型把这一轮 Response 全部生成完成，我们才能知道：

```text
模型说了什么

有没有 Tool Call

Tool 参数是什么

这一轮为什么停止
```

对于最小 Agent，这样最简单。

但放到真实 Coding Agent 里，用户体验就会变成：

```text
用户提交任务
↓
界面没有变化
↓
等待 5 秒
↓
等待 10 秒
↓
突然出现完整回答
```

如果模型这一轮还包含 Thinking、Tool Call，甚至需要更长时间。

所以 Pi 并没有把一次模型调用设计成：

```text
Request
↓
等待
↓
Response
```

而是：

```text
Request
↓
Event
↓
Event
↓
Event
↓
……
↓
完成
```

这就是：

```text
Streaming
```

---

### 我们之前 await 一次模型响应

先看 Mini Agent 的处理方式。

大概是：

```typescript
const response = await callModel();

const message =
  response.choices[0].message;

messages.push(message);

if (message.tool_calls) {
  // 执行 Tool
}
```

整个过程只有两个明显状态：

```text
调用前

调用后
```

但模型真正生成 Response 时，中间其实经历了很多阶段：

```text
开始响应

开始输出文本

文本持续增加

开始 Thinking

Thinking 持续增加

开始生成 Tool Call

Tool 参数持续生成

Tool Call 完成

整个 Response 结束
```

这些信息如果全部等到最后才拿到：

```text
Runtime
UI
用户
```

都无法知道中间发生了什么。

Pi 的 `pi-ai` 则把这些变化统一成 Streaming Event。

当前事件大致包括：

```text
start

text_start
text_delta
text_end

thinking_start
thinking_delta
thinking_end

toolcall_start
toolcall_delta
toolcall_end

done
error
```

所以一次模型调用可能变成：

```text
start
  ↓
thinking_start
  ↓
thinking_delta
  ↓
thinking_delta
  ↓
thinking_end
  ↓
text_start
  ↓
text_delta
  ↓
text_delta
  ↓
text_end
  ↓
toolcall_start
  ↓
toolcall_delta
  ↓
toolcall_delta
  ↓
toolcall_end
  ↓
done
```

注意，这并不意味着每次响应一定会出现所有事件。

如果模型直接输出文本：

```text
text
```

就可能没有 Thinking。

如果没有调用 Tool：

```text
toolcall_*
```

也不会出现。

Runtime 只是拥有了观察这些过程的统一方式。

---

### Pi 为什么把响应拆成 Event Stream

Streaming 最直观的好处当然是：

```text
模型生成一点
↓
用户看到一点
```

不需要等整个 Response 完成。

但对于 Agent 来说，它的意义不只是：

> **“打字机效果更流畅。”**

更重要的是：

> **Runtime 能够观察一次模型调用内部正在发生什么。**

Pi 的 Agent Loop 中，`streamAssistantResponse()` 会真正遍历模型返回的 Stream：

```typescript
for await (const event of response) {
  switch (event.type) {
    // ...
  }
}
```

当模型刚开始响应：

```text
start
```

Pi 会建立当前的：

```text
partialMessage
```

并发出：

```text
message_start
```

后面如果收到：

```text
text_delta

thinking_delta

toolcall_delta
```

就不断更新这条 Partial Message，并向上层发出：

```text
message_update
```

最后：

```text
done
```

或者：

```text
error
```

出现以后，再把 Partial Message 替换成真正完整的：

```text
finalMessage
```

并发出：

```text
message_end
```

所以内部关系大概是：

```text
pi-ai

start
text_delta
thinking_delta
toolcall_delta
done

        ↓

pi-agent-core

message_start
message_update
message_update
message_update
message_end
```

这又体现了 Pi 前面讲过的分层。

`pi-ai` 关心的是：

```text
模型到底流出了什么
```

而 `pi-agent-core` 更关心：

```text
当前 Agent Message
发生了什么变化
```

---

### text、thinking、toolCall 是怎么流出来的

我们先看最容易理解的文本。

模型最终想输出：

```text
我先运行测试，确认当前失败原因。
```

Streaming 时不会一定一次性得到整句话。

而是类似：

```text
text_start

text_delta:
"我先"

text_delta:
"运行测试"

text_delta:
"，确认当前"

text_delta:
"失败原因。"

text_end
```

上层只需要不断把：

```text
delta
```

追加到当前内容。

用户就能看到模型边生成边显示。

Thinking 也是类似的：

```text
thinking_start
↓
thinking_delta
↓
thinking_delta
↓
thinking_end
```

至于是否真正存在 Thinking、具体能够得到什么，则取决于当前模型和 Provider。

Pi 的模型层负责尽量把不同 Provider 的响应统一成同类 Event，而不是让上层 TUI 分别理解每家 Provider 的 Streaming 格式。

真正和 Agent 更相关的是：

```text
toolcall
```

假设模型准备调用：

```json
{
  "name": "read",
  "arguments": {
    "path": "src/auth/service.ts"
  }
}
```

这些 Arguments 同样不是一定一次性出现。

可能经历：

```text
toolcall_start
        ↓
toolcall_delta
        ↓
toolcall_delta
        ↓
toolcall_end
```

在 `toolcall_delta` 阶段：

```text
Arguments 可能还只是 Partial JSON
```

Pi 的 `pi-ai` README 甚至专门把：

```text
Streaming Tool Calls with Partial JSON
```

作为 Tool Calling 的一部分。

这也解释了我们前面 Agent Loop 里讲过的那个细节：

> **“JSON 能解析”不代表这个 Tool Call 一定已经完整。**

真正是否可以执行，必须等待模型这一轮结束，并结合：

```text
stopReason
```

等状态确认。

如果 Response 因：

```text
length
```

被截断，即使 Tool 参数看起来能够解析，Pi 仍然不会执行。

Streaming 和 Tool Safety 在这里其实是连在一起的。

---

### Streaming 不等于直接把 Delta 塞进 Session

这里还有一个容易产生误解的地方。

既然模型每次：

```text
text_delta
```

都会产生新内容，是不是应该：

```text
来一个 Delta
↓
Session 保存一次
```

并不是。

Pi 在 Streaming 过程中维护的是：

```text
Partial Assistant Message
```

例如：

```text
刚开始：

"我"

后来：

"我先运行"

后来：

"我先运行测试"

最后：

"我先运行测试，确认失败原因。"
```

Agent Loop 会不断用最新 Partial Message 更新当前 Context 中的那条 Assistant Message。等最终：

```text
done / error
```

出现以后，再得到正式的：

```text
finalMessage
```

所以：

```text
Streaming Event
```

和：

```text
Session Message
```

仍然不是一回事。

我们可以理解成：

```text
Event Stream
→ 描述“现在正在发生什么”

Final Message
→ 描述“这一轮最终产生了什么”
```

这和前面区分：

```text
Session
Context
Messages
```

其实是同一种工程思想：

> **不要因为几个概念都和“模型输出”有关，就把它们设计成同一个东西。**

---

### 为什么 Tool 也需要流式更新

这也是一个很有意思的问题。

模型自己的 Response 可以 Streaming。

那 Tool 呢？

假设模型执行：

```bash
npm test
```

测试可能需要 30 秒。

如果 Runtime 只是：

```typescript
const result =
  await bash.execute(...);
```

那么用户体验又回到了：

```text
开始执行 npm test
↓
等 30 秒
↓
突然出现全部结果
```

所以真实 Coding Agent 里的 Streaming 还不应该只停留在：

```text
Model Streaming
```

Tool 本身也可能需要：

```text
Progress Update
```

Pi 的 Tool 执行接口就预留了：

```text
onUpdate
```

这样的能力。

`bash` 会在命令运行过程中持续收集 stdout / stderr，并能够向上层发送当前输出，而不是一定等进程结束才返回最终 Tool Result。

于是一次命令可以变成：

```text
tool_execution_start

$ npm test

PASS auth.test.ts

PASS user.test.ts

FAIL token.test.ts

tool_execution_end
```

用户可以实时知道：

```text
命令还在执行

目前执行到哪

已经输出了什么
```

这在：

```text
安装依赖

执行测试

项目构建

运行脚本

长时间命令
```

这些场景中非常重要。

---

所以完整一点看，一个 Coding Agent 实际上可能同时存在两类 Stream：

```text
                    Agent Run

                        │
          ┌─────────────┴─────────────┐
          ↓                           ↓

     Model Stream                 Tool Stream

 text_delta                   stdout / stderr
 thinking_delta               progress update
 toolcall_delta
```

最终再统一交给：

```text
Agent Runtime
```

上层 UI 不需要自己去监听：

```text
OpenAI Stream

Anthropic Stream

Node Child Process stdout

Tool-specific callbacks
```

这些完全不同的数据源。

它更适合面对：

```text
Agent Events
```

这样一套统一生命周期。

---

### TUI 为什么建立在事件系统之上

现在我们就能理解，为什么前面 Agent Loop 中会出现这么多：

```text
agent_start

turn_start

message_start

message_update

message_end

tool_execution_start

tool_execution_end

turn_end

agent_end
```

这些 Event。

它们不是为了让 Agent Loop 显得复杂。

而是在给上层提供一个稳定的接口。

例如 TUI 可以监听：

```text
message_start
```

然后创建一个新的 Assistant 区域。

收到：

```text
message_update
```

就更新正在生成的文字。

收到：

```text
tool_execution_start
```

就显示：

```text
Running npm test...
```

收到 Tool Update，就实时刷新命令输出。

收到：

```text
tool_execution_end
```

再显示执行完成。

最终：

```text
agent_end
```

整个 Run 才真正结束。

于是 UI 可以只依赖：

```text
Agent Events
```

而不需要知道 Agent Loop 内部到底：

```text
调用了哪个 Provider

模型用了什么 Streaming Protocol

Tool 内部用了 child_process 还是远程 SSH
```

---

可以把这个结构画成：

```text
                Provider Stream
                       │
                       ↓
                    pi-ai
                       │
                 Model Events
                       │
                       ↓
                pi-agent-core
                       │
                 Agent Events
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓

       TUI          Session       Extension
```

也就是说：

> **Event System 实际上也是模块之间的解耦层。**

如果以后不用终端，而是做：

```text
Web UI

IDE Plugin

Desktop App

Remote Client
```

底层 Agent Runtime 仍然可以继续发相同类型的生命周期 Event。

上层只需要换自己的表现方式。

---

不过，Streaming 解决的是：

```text
用户能不能看到 Agent 正在做什么
```

但它还没有解决另一个问题：

```text
Agent 执行过程中，
用户能不能修改任务要求？
```

## Agent 执行过程中，用户还能发消息吗

前面的 Mini Agent 还有一个很明显的限制。

一旦执行：

```typescript
await runAgent(task);
```

后面基本就是：

```text
Model
↓
Tool
↓
Model
↓
Tool
↓
……
↓
任务结束
```

用户只能等。

但真实 Coding Agent 的任务可能持续几分钟甚至几十分钟。

这个过程中，用户很可能突然发现：

```text
“先不要改数据库。”

“刚才那个方案不对，改接口层就行。”

“这个问题修完以后，再把测试补上。”
```

这些话看起来都是“新消息”，但实际上有两种完全不同的意图：

```text
现在就影响正在执行的任务
```

和：

```text
当前任务做完以后再处理
```

Pi 分别把它们设计成：

```text
Steering Message
Follow-up Message
```

---

### 我们的 Mini Agent 运行以后只能等它结束

在我们之前的实现里：

```typescript
while (true) {
  const response = await callModel();

  if (response.toolCalls) {
    await executeTools();
    continue;
  }

  return response.content;
}
```

整个 Agent Loop 内部没有：

```text
用户消息队列
```

所以用户提交任务以后：

```text
User
↓
Agent Run 开始
↓
……
↓
Agent Run 结束
↓
User 才能再次输入
```

如果发现 Agent 正在做错事，最直接的办法只能是：

```text
Abort
↓
重新发任务
```

但很多时候没有必要彻底终止。

例如 Agent 已经：

```text
读完代码
定位问题
开始修改
```

这时只想补一句：

```text
“不要修改 public API。”
```

更合理的方式应该是：

```text
让当前正在执行的工作停在一个合适的边界
↓
把这句话加入 Context
↓
让模型重新判断下一步
```

这就是 Steering。

---

### Steering Message

Pi 的交互模式允许 Agent 正在工作时继续输入消息。

默认情况下：

```text
Enter
```

会把这条消息加入：

```text
Steering Queue
```

官方文档给出的语义是：

> Steering Message 会在当前 Assistant Turn 及其 Tool Calls 执行完成以后送入 Agent。

这里的“Steering”可以理解成：

```text
给正在进行的任务纠偏
```

例如原本：

```text
User：
重构用户模块并修复测试

       ↓

Agent：
read(...)
       ↓
edit(...)
       ↓
bash("npm test")
```

运行过程中用户又输入：

```text
不要修改数据库 Schema，
尽量保持现有表结构。
```

这条消息不会粗暴地插进：

```text
正在执行到一半的 Tool
```

而是等待当前 Turn 进入合适的结束位置。

然后：

```text
当前 Tool Calls 完成
        ↓
Steering Message
进入 Context
        ↓
下一次 Model Call
        ↓
模型根据新要求重新判断
```

Pi 的 Agent Loop 确实会在下一轮模型调用之前获取：

```typescript
getSteeringMessages()
```

如果存在 Pending Message，就先把它们加入当前 Context，再继续 Assistant Response。

这里为什么不直接打断正在执行的 Tool？

因为如果一个：

```text
edit
write
bash
```

已经执行到一半，随意插入新的模型决策会让状态更加混乱。

例如：

```text
write 正在写文件
↓
用户发 Steering
↓
立刻启动下一轮 Model
↓
模型又开始 read 同一个文件
```

这会引入不必要的并发和状态一致性问题。

所以 Steering 的含义不是：

```text
任何毫秒级时刻立即抢占
```

而是：

> **在当前执行单元结束后，尽快让新指令影响下一步。**

---

### Follow-up Message

但有些消息并不是想纠正当前任务。

例如 Agent 正在：

```text
修复登录接口
```

用户想到：

```text
“这个修完以后，顺便把 README 里的示例更新一下。”
```

如果把它作为 Steering：

```text
当前任务执行到一半
↓
模型突然看到 README 要求
```

模型可能提前改变当前计划。

这并不是用户想要的。

所以 Pi 还有第二个队列：

```text
Follow-up
```

在交互模式中，默认使用：

```text
Alt + Enter
```

提交 Follow-up Message。

它不会在当前 Agent 工作过程中插入，而是：

> **等 Agent 当前工作自然结束以后，再把这条消息交给它。**

例如：

```text
当前任务：

修复登录 Bug
    ↓
read
    ↓
edit
    ↓
test
    ↓
测试通过
    ↓
本来应该 Agent End
```

此时 Runtime 发现还有：

```text
Follow-up Queue
```

于是继续：

```text
“再把 README 示例更新一下。”
        ↓
新的 Turn
        ↓
Agent 继续工作
```

Pi 的 Agent Loop 正好有一个外层循环。

当内部 Tool Loop 本来准备结束时，会调用：

```typescript
getFollowUpMessages()
```

如果拿到了 Follow-up，就不会真正 `agent_end`，而是把这些消息作为新的 Pending Messages，继续下一轮。

所以可以把两者放在一起理解：

| 类型 | 什么时候生效 | 适合什么场景 |
| --- | --- | --- |
| Steering | 当前 Turn 的 Tool Calls 完成后 | 纠偏、补充约束、改变当前方向 |
| Follow-up | 当前工作全部完成后 | 追加下一项任务 |

例如：

```text
Steering：

“别改数据库。”
“只修这个 Bug，不要重构。”
“刚才说错了，目标文件是 service.ts。”
```

而：

```text
Follow-up：

“修完以后补测试。”
“做完以后更新 README。”
“最后再跑一下 lint。”
```

虽然它们最后都会变成：

```text
User Message
```

但：

> **消息什么时候进入 Agent Loop，会直接改变 Agent 的行为。**

---

### Abort 以后发生什么

当然，有时候不是纠偏，而是：

```text
现在就不要做了。
```

这时候才需要：

```text
Abort
```

前面 Agent Loop 一节已经讲过，Pi 会把 `AbortSignal` 向模型调用和 Tool Execution 继续传递。

这里再补一个和交互相关的细节。

Pi 当前交互模式中：

```text
Escape
```

不仅会 Abort 当前运行，还会把已经排队的 Steering / Follow-up Messages 恢复到编辑器中。

为什么要恢复？

假设用户已经输入：

```text
Steering：
不要修改数据库

Follow-up：
最后补充测试
```

然后突然发现：

```text
整个任务方向都错了
```

按下 Escape。

如果 Runtime 只是：

```text
Abort
↓
把 Queue 全部清空
```

用户刚才输入的内容也跟着丢了。

Pi 则选择：

```text
Abort 当前 Run
↓
取回 Queued Messages
↓
放回 Editor
↓
用户可以继续修改后重新提交
```

另外还要区分：

```text
Steering
```

和：

```text
Abort
```

Steering 是：

```text
当前工作可以继续到合理边界
↓
下一轮换方向
```

Abort 是：

```text
当前正在发生的事情也应该停止
```

所以如果 Agent 正在：

```text
npm test
```

而用户只是说：

```text
下一步不要修改数据库
```

没有必要杀掉 Test Process。

但如果用户发现：

```text
执行的是错误脚本
```

那就应该 Abort。

这两个操作解决的是不同问题。

---

### 为什么这其实也是 Agent Runtime 的一部分

Steering 和 Follow-up 看起来很像：

```text
TUI 的两个快捷键功能
```

但真正值得我们关注的是，它们为什么必须进入 Agent Runtime。

因为用户并不是永远只存在于：

```text
Agent Run 开始之前
```

实际上的人机协作更像：

```text
User
 ↓
Agent 开始工作
 ↓
观察环境
 ↓
执行 Tool
 ↓
User 补充要求
 ↓
Agent 调整
 ↓
继续执行
 ↓
User 再追加任务
 ↓
继续
```

也就是说：

> **Agent Run 本身可能是一个持续接受外部输入的过程。**

这会直接影响 Agent Loop 的设计。

我们的 Mini Agent 是：

```text
一个输入
   ↓
while(true)
   ↓
一个最终输出
```

而 Pi 是这样的：

```text
                Agent Run

                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓

    Model         Tools        User

       │            │            │
       │            │       Steering
       │            │       Follow-up
       │            │          Abort
       └────────────┼────────────┘
                    ↓
                 Runtime
```

所以 Agent Runtime 不只是在调度：

```text
Model ↔ Tool
```

它实际上还要协调：

```text
Model
Tool
User
```

三者之间的状态变化。

---

这也解释了 Pi `agent-loop.ts` 为什么不是简单：

```typescript
while (hasToolCall) {
  // ...
}
```

而是同时存在：

```text
Inner Loop
→ Tool Calls + Steering

Outer Loop
→ Follow-up
```

原本看起来只是：

```text
多套了一层 while
```

但现在我们就能理解它背后的语义：

```text
Inner Loop
=
当前任务还在推进

Outer Loop
=
当前任务看似结束后，
检查用户是否还追加了工作
```

---

从我们的 Mini Agent 到这里，Agent Loop 又多了一层能力：

```text
最初：

Model
↓
Tool
↓
Result
↓
Model
```

后来加入：

```text
Model
↓
Tool
↓
Result
↓
Steering?
↓
Model
```

整个任务准备结束时又要检查：

```text
Follow-up?
```

同时任何阶段还可能：

```text
Abort
```

最终就变成：

```text
                         User
                  ┌────────┼────────┐
                  ↓        ↓        ↓
              Steering  Follow-up  Abort
                  │        │        │
                  └────────┼────────┘
                           ↓

                        Runtime
                           │
                    Model ↔ Tool
```
> **一个真正面向用户的 Agent，不能假设用户只在任务开始前说一次话，然后一直消失到任务结束。**

下一节我们继续回到一个前面已经出现很多次、但还没有真正展开的 Tool：

```text
bash
```

我们的 Mini Agent 里它只是：

```typescript
exec(command)
```

但到了真实 Coding Agent 中，Shell Command 还涉及进程生命周期、超时、流式 stdout、取消以及整个进程树的清理。

## Bash：真实命令执行比 exec() 麻烦得多

前面的 Mini Agent 里，`bash` 几乎是四个 Tool 中最好理解的一个。

核心代码可以压缩成：

```typescript
const { stdout, stderr } =
  await execAsync(command, {
    cwd: WORKSPACE_DIR,
  });
```

然后把结果返回给模型：

```text
Command
↓
exec()
↓
stdout / stderr
↓
Tool Result
```

作为教学实现，这已经足够了。

但到了真实 Coding Agent 中，Shell Tool 有一个特殊之处：

> **它启动的不是一个普通函数，而是一个真实操作系统进程。**

一旦涉及进程，就会立刻出现：

```text
进程什么时候结束？

运行几十分钟怎么办？

用户 Abort 怎么办？

子进程又启动了子进程怎么办？

stdout / stderr 怎么实时返回？

进程输出几十 MB 怎么办？
```

所以 Pi 的 `bash` 已经不只是：

```text
exec(command)
```

而是一套小型的进程生命周期管理。

---

### 我们之前直接 exec(command)

Node.js 中：

```typescript
exec(command)
```

非常适合快速执行一条命令。

它帮我们隐藏了很多细节：

```text
启动 Shell

收集 stdout

收集 stderr

等待进程退出

返回最终结果
```

所以前面的 Mini Agent 只需要：

```typescript
const {
  stdout,
  stderr,
} = await execAsync(command);
```

就能完成：

```text
npm test
git status
node app.js
```

之类的任务。

但它带来的思维模型也非常简单：

```text
执行命令
↓
等待
↓
拿结果
```

而 Pi 当前实现 Bash Tool 时使用的核心能力是：

```typescript
spawn(...)
```

并且直接管理：

```text
Child Process
stdout
stderr
AbortSignal
Timeout
Exit Code
Process Tree
```

于是执行模型变成：

```text
Command
↓
Spawn Process
↓
持续读取 stdout / stderr
↓
等待进程生命周期变化
↓
Exit / Abort / Timeout
↓
整理 Tool Result
```

这才是 Coding Agent 真正需要的 Bash Tool。

---

### Pi 怎么启动和终止进程

Pi 当前会先解析实际使用的 Shell，然后通过：

```typescript
spawn(...)
```

启动子进程。

执行时还会指定：

```text
cwd
env
stdin
stdout
stderr
```

等运行环境。

其中：

```text
cwd
```

尤其重要。

Coding Agent 执行：

```bash
npm test
```

和在另一个目录执行完全可能是两个不同的项目。

所以 Pi 在真正执行命令之前还会检查：

```text
当前 Working Directory 是否存在
```

如果目录已经不存在，就直接返回错误，而不是启动一个行为不确定的 Shell。

---

另外 Pi 并没有把 Bash Tool 的底层实现完全锁死在本地 `spawn()` 上。

它抽象了一层：

```typescript
BashOperations
```

核心接口大致是：

```typescript
exec(
  command,
  cwd,
  {
    onData,
    signal,
    timeout,
    env,
  }
)
```

默认实现当然是在本机启动 Shell。

但这层抽象意味着以后也可以把执行后端替换掉，例如交给远程环境，而上面的 Agent 仍然使用：

```text
bash
```

这个 Tool。

又一次体现了前面的原则：

```text
Tool Interface
≠
底层执行环境
```

---

### 命令一直不结束怎么办

这里是 Bash Tool 一个非常现实的问题。

假设模型调用：

```bash
npm run dev
```

这个命令本来就是：

```text
启动开发服务器
↓
一直运行
```

或者程序本身出现死循环：

```bash
node broken-script.js
```

如果 Runtime 什么都不做：

```text
await command
```

Agent 就可能永远卡在这一轮 Tool Execution。

所以 Pi 的 Bash Schema 除了：

```typescript
command
```

还提供：

```typescript
timeout?: number
```

单位是秒。

例如可以执行：

```json
{
  "command": "npm test",
  "timeout": 120
}
```

Runtime 会把它转换成定时器。

如果时间到了：

```text
Timeout
↓
终止进程
↓
结束 Tool Call
```

而不是永远等下去。

Pi 还会校验 Timeout 必须：

```text
是有限数字

大于 0

不超过底层 Timer 能处理的最大值
```

这些虽然只是实现细节，但说明真实 Tool 参数不能只考虑：

```text
模型会不会正常传值
```

还要考虑：

```text
模型传了异常值怎么办
```

---

### 为什么 Pi 没有默认给所有命令强制超时

这里有一个值得注意的地方。

Pi 当前的 `timeout` 是：

```text
Optional
```

而且 Schema 明确写着：

```text
no default timeout
```

也就是说，如果模型没有指定：

```typescript
timeout
```

Pi 不会默认规定：

```text
所有命令 30 秒后必须杀掉
```

为什么这种设计合理呢？

因为 Coding Agent 执行的命令差异太大了：

```text
git status
→ 可能不到 1 秒

npm test
→ 可能几十秒

npm install
→ 可能几分钟

大型项目 build
→ 可能更久
```

如果统一设置一个很短的默认 Timeout：

```text
可能安全了一点
```

但也很容易把：

```text
正常的长时间任务
```

误判成：

```text
卡死
```

所以 Pi 选择：

```text
默认不强制 Timeout
+
需要时显式提供 Timeout
+
用户仍然可以 Abort
```

这里其实没有一个对所有 Agent 都正确的答案。

如果是受控的企业任务执行系统，也完全可以在 Pi 外层增加：

```text
最大执行时长策略
```

Pi Core 只是没有替所有使用场景做这个决定。

这也符合它一直强调的：

```text
Minimal Harness
```

思路。

---

### stdout 太大以后怎么保存

这一部分前面 Tools 章节已经讲过，所以这里只补充它和进程执行的关系。

Bash 命令执行过程中：

```text
stdout
stderr
```

会不断产生数据。

Pi 当前不是等命令结束以后一次性读取，而是在：

```typescript
child.stdout.on("data", ...)
child.stderr.on("data", ...)
```

这一类数据到达时持续交给：

```text
OutputAccumulator
```

处理。

同时可以通过：

```text
onUpdate
```

把当前输出不断更新给上层。

所以：

```bash
npm test
```

执行一分钟时，TUI 不需要等一分钟以后才看到结果。

最后真正送进模型 Context 的结果，仍然遵循前面讲过的限制：

```text
最多保留尾部 2000 行
或 50KB
```

如果发生截断：

```text
完整输出
```

会另存到临时文件，并通过：

```text
fullOutputPath
```

保留下来。

所以这里实际上同时维护了两种需求：

```text
Runtime：
我要完整处理进程输出

Model：
我只需要足够做下一步判断的信息
```

再次印证前面的结论：

> **Tool Result 不应该机械等于底层程序产生的全部原始数据。**

---

### Abort 为什么要杀掉整个进程树

最后一个问题更容易踩坑。

假设 Agent 执行：

```bash
npm test
```

看起来 Runtime 只启动了一个：

```text
npm
```

进程。

但 `npm` 后面可能继续启动：

```text
node
↓
test runner
↓
worker
↓
其他子进程
```

最后实际结构比如：

```text
Shell
  ↓
npm
  ↓
node
  ├─ Worker A
  ├─ Worker B
  └─ Worker C
```

如果用户 Abort 时只结束最上面的进程：

```text
npm 被杀掉
```

下面某些子进程可能仍然存在。

结果就是：

```text
Agent 显示已经停止
```

但后台：

```text
服务器还在跑

Worker 还在跑

端口仍然被占用

CPU 还在消耗
```

这显然不是一个完整的 Abort。

---

Pi 当前本地 Shell 执行会跟踪启动的 Child Process。

在非 Windows 平台上启动进程时还会设置：

```typescript
detached: true
```

并在：

```text
Abort
```

或者：

```text
Timeout
```

发生时调用：

```typescript
killProcessTree(child.pid)
```

而不是简单只结束当前 Child Process。

整个思路是：

```text
Agent Abort
    ↓
AbortSignal
    ↓
Bash Tool
    ↓
Process Tree
    ↓
全部结束
```

这就是为什么上一节提到：

```text
Abort 是 Agent Runtime 能力
```

还不够。

它必须真正传播到底层资源。

如果：

```text
Model Stream 停了
```

但：

```text
Shell Process 还在后台运行
```

那么这个 Abort 其实没有完成。

---

我们前面的 Mini Agent 还尝试通过：

```text
Workspace Path
```

做一些范围限制。

但 Pi 默认到底有没有类似的安全边界？

`Project Trust` 又是不是 Tool Permission？

## 权限和安全：Pi 也没有替我们解决所有问题

到这里，我们已经让 Coding Agent 拥有了非常强的能力：

```text
read
write
edit
bash
```

这意味着模型不只是“回答问题”，而是真的可以：

```text
读取本地文件
修改代码
创建文件
执行 Shell Command
启动其他程序
```

能力越强，安全问题就越不能绕开：

> **Agent 到底被允许做什么？**

实际上，Pi 很明确地区分了：

```text
Project Trust
Tool Permission
Sandbox
```

但是它们并不是一回事。

---

### 我们之前尝试限制 workspace 路径

前面的 Mini Agent 里，我们专门定义了：

```typescript
const WORKSPACE_DIR = path.resolve("workspace");
```

然后文件工具基本都会围绕这个目录解析路径：

```typescript
function resolveWorkspacePath(inputPath: string) {
  return path.resolve(
    WORKSPACE_DIR,
    inputPath,
  );
}
```

这至少建立了一个概念：

```text
Agent 工作的项目
=
workspace/
```

但是：

> **工作目录不等于安全边界。**

我们前面的教学实现并没有真正构建一个 Sandbox。

例如仅仅：

```typescript
path.resolve(WORKSPACE_DIR, inputPath)
```

并不能自动保证结果一定仍然位于 `WORKSPACE_DIR` 中。

像：

```text
../../outside.txt
```

这样的路径仍然可能解析到 Workspace 外部。

即使我们再补充严格的路径检查：

```text
resolvedPath
必须位于
WORKSPACE_DIR
```

问题也没有彻底解决。

因为还有：

```text
Symbolic Link
bash
子进程
网络访问
环境变量
本机凭据
```

这些能力。

尤其是 `bash`。

即使：

```text
read / write / edit
```

全部限制在 Workspace 内，模型仍然可能执行：

```bash
cat ~/.ssh/config
```

或者：

```bash
cd .. && ls
```

所以：

```text
限制文件 Tool 的 Path
```

最多解决：

```text
文件 Tool 的访问范围
```

不能自动变成：

```text
整个 Agent 的安全边界
```

---

### Pi 默认到底拥有什么权限

Pi 在当前的文档中直接说明：

> Pi 以启动它的用户账户权限运行。

也就是说，如果当前用户本来能够：

```text
读取某个文件
修改某个目录
运行某条命令
访问某个凭据
```

那么 Pi 的本地 Tool 通常也处在同一个权限边界中。

Pi 当前并没有内置 Sandbox。

它的：

```text
read
write
edit
bash
```

会以 Pi 进程本身拥有的系统权限工作。

Extension 作为 TypeScript Module，同样运行在这个权限环境中。

所以默认结构大概是这样：

```text
              当前用户账户权限

                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓

        Pi        Built-in    Extension
                   Tools

          │
          ↓

      本地操作系统
```

而不是：

```text
Pi
↓
自动进入一个受限 Sandbox
↓
只能访问当前项目
```

---

官方文档明确说明这是有意的设计选择。

Pi 本身就是一个：

```text
Local Coding Agent
```

它需要：

```text
访问源码
运行项目工具链
执行测试
调用包管理器
和本机开发环境集成
```

如果在进程内部实现一个“不完整的 Sandbox”，很容易误以为：

```text
“这个工作区已经安全隔离了。”
```

但实际上底层仍然依赖：

```text
Host Shell
Filesystem
Package Manager
Credentials
Extension Code
```

这样的环境。

所以 Pi 的选择是：

> **核心 Harness 不伪装成安全边界，真正的隔离交给操作系统或虚拟化环境。**

---

### Project Trust 不等于 Tool Permission

这里最容易混淆的就是：

```text
Project Trust
```

Pi 启动某个项目时，如果里面包含项目级资源，例如：

```text
.pi/settings.json

.pi/extensions/

.pi/skills/

.pi/prompts/

.pi/SYSTEM.md
```

等内容，可能会要求用户先决定：

```text
是否信任这个 Project
```

这个机制解决的是：

> **一个刚打开的仓库，能不能自动改变 Pi 自己的配置和加载可执行扩展。**

例如下载了一个陌生项目：

```text
some-project/
└── .pi/
    └── extensions/
        └── dangerous.ts
```

如果 Pi 什么都不问就直接执行：

```text
project-local extension
```

显然风险很大。

所以 Project Trust 会控制这些项目级资源能不能被加载。

---

但它并不意味着：

```text
“不信任 Project”
=
“read/write/bash 被沙箱限制住了”
```

Pi 的安全文档对此说得非常清楚：

> **Project Trust 是输入加载保护，不是 Sandbox。**

也就是说：

```text
Project Trust
```

主要控制：

```text
要不要加载项目自己的 Settings
要不要加载项目 Extensions
要不要加载项目 Packages
要不要加载项目资源
```

而：

```text
Tool Permission
```

回答的是另一个问题：

```text
模型调用 bash 时能不能执行这条命令？

read 能不能访问这个文件？

write 能不能修改这个路径？
```

两者完全不是一个层级。

甚至像：

```text
AGENTS.md
CLAUDE.md
```

这样的 Context File，在当前 Pi 中也不属于 Project Trust 所保护的可执行资源；只要没有关闭 Context Loading，它们仍然可以被加载。

所以 Project Trust 也不能解决：

```text
Prompt Injection
```

之类的问题。

仓库中的：

```text
README
注释
文档
Context File
Build Output
```

都可能包含模型会读取的内容。

Pi 官方安全文档也明确把这类本地内容导致的 Prompt Injection 视为 Local Agent 本身需要面对的风险，而不是 Project Trust 可以彻底消除的问题。

---

### 如何通过 Extension 加 Permission Gate

不过 Pi 并不是说：

```text
“权限完全没法管。”
```

它只是没有在 Core 里强制提供一套固定权限模型。

如果希望实现：

```text
危险命令执行前询问用户
```

可以通过 Extension 拦截：

```text
tool_call
```

Pi 仓库本身就提供了一个：

```text
permission-gate.ts
```

示例。

它的核心思路非常简单。

先监听 Tool Call：

```typescript
pi.on("tool_call", async (event, ctx) => {
  // ...
});
```

如果发现：

```text
bash
```

正在准备执行危险命令，比如：

```text
rm -rf
sudo
chmod 777
chown 777
```

就先暂停真正执行。

然后询问用户：

```text
Allow?

Yes
No
```

如果拒绝：

```typescript
return {
  block: true,
  reason: "Blocked by user",
};
```

于是流程从：

```text
Model
↓
Tool Call
↓
Execute
```

变成：

```text
Model
↓
Tool Call
↓
Permission Gate
↓
允许？
├─ Yes → Execute
└─ No  → Block
```

---

这种 Extension 还能继续扩展。

例如可以实现：

```text
禁止读取 .env

禁止修改 node_modules

删除文件必须确认

git push 必须确认

访问 Workspace 外路径必须确认

某些命令只允许在特定目录运行
```

所以：

```text
Permission Policy
```

完全可以建立在 Pi 的 Extension Hook 上。

但这里仍然要注意：

> **Permission Gate 也不是 Sandbox。**

Permission Gate 依赖的是：

```text
Runtime 正确识别 Tool Call
+
Policy 正确覆盖危险行为
```

如果规则只写了：

```text
禁止 rm -rf
```

并不代表所有具有删除效果的命令都被禁止。

更重要的是，Extension 自己也是在 Pi 进程中运行的，它拥有和 Pi 相同的系统权限。

---

### 真正的隔离为什么还是需要 Sandbox

如果场景只是：

```text
自己的代码
自己的电脑
自己一直看着 Agent 工作
```

这种本地开发方式可能已经符合使用需求。

但如果变成：

```text
不可信代码仓库

自动执行生成代码

无人值守 Agent

服务器上的自动任务

允许 Agent 长时间自主运行
```

风险模型就完全不同了。

这时候真正需要的是：

```text
Sandbox
```

而不是再写几十条 Prompt：

```text
不要删除文件
不要读取敏感信息
不要运行危险命令
```

因为 Prompt 是：

```text
模型行为指导
```

不是：

```text
权限控制机制
```

Pi 官方推荐真正需要隔离时使用：

```text
Container
VM
Micro-VM
Remote Sandbox
Policy-controlled Sandbox
```

并且只把任务真正需要的资源暴露进去。

例如：

```text
              Host

                │
                ↓

        ┌─────────────────┐
        │     Sandbox     │
        │                 │
        │       Pi        │
        │        ↓        │
        │      Tools      │
        │                 │
        │  /workspace     │
        │  limited env    │
        │  limited net    │
        └─────────────────┘
```

这样即使模型真的执行：

```bash
cat ~/.ssh/id_rsa
```

Sandbox 里面根本没有这个文件。

即使运行：

```bash
rm -rf /
```

能够破坏的也只是隔离环境允许它访问的范围。

这才是真正意义上的：

```text
Capability Boundary
```

实际部署时，还可以继续收紧：

```text
只挂载需要的 Workspace

不挂载 Host 的 ~/.pi/agent

只提供任务需要的 API Key

优先使用短期 Credential

没有联网需求就限制 Network

只读任务使用 Read-only Mount
```

Pi 的安全文档也特别提醒：

如果把 Host Workspace 以：

```text
read/write bind mount
```

挂进 Container，那么 Sandbox 里的写操作仍然可以修改 Host 文件。

所以：

```text
用了 Container
```

也不自动等于：

```text
宿主文件绝对不会被修改
```

真正的权限取决于你给这个 Sandbox 暴露了什么。

---

现在可以把这几个安全机制放到一张图里：

```text
                 Agent Security

                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓

  Project Trust   Permission Gate    Sandbox

        │              │              │
        ↓              ↓              ↓

是否加载项目资源   是否允许 Tool Call   系统实际允许
和可执行 Extension    执行             访问什么
```

三者解决的是完全不同的问题。

其中：

```text
Project Trust
```

保护的是 Pi 启动时加载什么；

```text
Permission Gate
```

控制的是应用层允许 Agent 做什么；

而：

```text
Sandbox
```

才负责最终的：

> **即使 Agent 想做某件事，它到底有没有能力做到。**

---

> **安全边界不能只存在于 Prompt 或 Agent 代码里，真正需要隔离时，边界必须下沉到运行环境。**

Pi 没有试图把所有安全策略塞进 Core。

而这其实正好引出了它整个架构中另一个很明显的特点。

我们已经见过：

```text
Permission Gate → Extension
Skills → 外部资源
Project Context → Context Files
```

Pi 还有很多常见 Coding Agent 功能，也没有默认塞进核心。

这并不是因为它做不到，而是它刻意选择：

```text
保持 Core 小
+
把工作流差异留给扩展层
```

## 当功能越来越多：为什么 Pi 没有把所有东西塞进核心

看到这里，其实已经能发现 Pi 一个非常稳定的设计倾向：

```text
核心只保留通用能力
+
具体工作流尽量往外扩展
```

前面已经出现过很多例子。

比如：

```text
权限确认
→ Extension

专项工作流程
→ Skill

项目规则
→ AGENTS.md

可复用任务指令
→ Prompt Template
```

Pi 当前文档甚至直接写明了：

> Pi 会保持 Core 尽量小，把工作流相关行为放到 Extensions、Skills、Prompt Templates 和 Packages 中。

我们后续做自己的 Agent 的时候，也要考虑：

> **当用户不断提出新需求时，哪些应该进入 Core，哪些不应该？**

---

### Extensions

Extensions 是 Pi 最强的一层扩展机制。

当前 Pi 的 Extension 本质上是：

```text
TypeScript Module
```

它可以：

```text
监听 Agent 生命周期事件

拦截或修改 Tool Call

注册新的 Tool

添加命令

注入 Context

修改 Compaction 行为

增加 UI 交互
```

前面讲 Permission Gate 时已经见过：

```typescript
pi.on("tool_call", ...)
```

这个 Hook。

同样的机制还可以实现很多并不适合所有用户的功能。

例如：

```text
危险命令确认

Git Checkpoint

自动保护某些路径

自定义 Tool

自定义状态

特殊工作流
```

所以 Extension 是：

> **给 Runtime 增加新的行为。**

它改的不只是 Prompt，而是真的可以改变 Agent 怎么运行。

---

这和直接不断修改 Pi Core 有很大区别。

假设有用户需要：

```text
每次 edit 之前自动 git commit
```

这显然不是每个 Coding Agent 用户都需要。

如果直接写进 Core：

```text
所有人都要承担
这套功能的代码
配置
状态
测试
边界情况
```

但做成 Extension：

```text
需要的人加载
不需要的人完全不用管
```

核心 Agent Loop 仍然可以保持稳定。

---

### Skills

Skills 解决的又不是 Runtime 行为，而是：

```text
模型如何完成某一类专项任务
```

Pi 当前把 Skill 描述为：

> 可以按需加载的、自包含的能力包，其中可以包含专项工作流、配置说明、辅助脚本和参考文档。

例如：

```text
database-migration

frontend-design

release

security-review
```

这些能力不一定需要增加新的 Runtime 机制。

很多时候只是：

```text
遇到这一类任务时

应该按照什么步骤做

应该读取哪些资料

应该调用哪些已有 Tool
```

所以更适合放进：

```text
SKILL.md
```

而不是写进 Pi Core。

---

前面的 System Prompt 一节也讲过：

Pi 不会默认把所有 Skill 正文全部塞进 Context。

它主要先把：

```text
name
description
location
```

告诉模型，真正任务匹配时再读取完整 Skill。

所以 Skill 的核心价值可以概括成：

```text
不修改 Agent Runtime
↓
给 Agent 增加专项做事方法
```

---

### Prompt Templates

Prompt Template 更轻。

Pi 当前的 Prompt Template 就是：

> **可以展开成完整 Prompt 的 Markdown 片段。**

例如有一个：

```text
review.md
```

里面写：

```markdown
Review this code for bugs, security issues,
and performance problems.
```

之后可以通过：

```text
/review
```

直接展开。

它解决的是：

```text
经常重复输入同一类任务
```

而不是：

```text
增加新的 Agent 能力
```

---

这几个概念可以简单区分：

| 机制 | 主要改变什么 |
| --- | --- |
| Extension | Agent Runtime 的行为 |
| Skill | Agent 完成专项任务的方法 |
| Prompt Template | 用户重复输入的任务 Prompt |
| AGENTS.md | 当前项目长期规则 |

比如：

```text
“每次危险 Bash 都必须确认”
```

更适合：

```text
Extension
```

而：

```text
“做数据库迁移时按照这套流程检查”
```

更适合：

```text
Skill
```

如果只是：

```text
“每次 Code Review 都使用相同的要求”
```

则更适合：

```text
Prompt Template
```

它们解决的问题本来就不是同一种。

---

### Pi Packages

当 Extension、Skill、Prompt Template 越来越多以后，又会出现一个新问题：

```text
怎么分享？
怎么安装？
怎么复用？
```

所以 Pi 又提供了：

```text
Pi Packages
```

Package 本身不是一种新的 Agent 能力。

而是：

> **把前面的扩展资源打包起来。**

Pi 当前 Package 可以组合：

```text
Extensions
Skills
Prompt Templates
Themes
```

然后通过：

```text
npm
或
git
```

进行分发。

例如某个团队可以做一个：

```text
company-agent-package
```

里面同时包含：

```text
company-security-extension

database-migration-skill

release-skill

review-prompt

内部 Theme
```

其他成员安装这个 Package，就能得到同一套 Agent 工作环境。

---

所以可以把这个关系理解成：

```text
Pi Core

   │
   ├─ Extension
   │    └─ 改 Runtime
   │
   ├─ Skill
   │    └─ 加专项工作流
   │
   ├─ Prompt Template
   │    └─ 加复用 Prompt
   │
   └─ Pi Package
        └─ 把这些资源打包分发
```

这种结构更容易长期维护和分发。

---

### 为什么 Pi 默认没有 Plan Mode 和 Sub-Agent

这里最能体现 Pi 的取舍。

现在很多 Coding Agent 都会强调：

```text
Plan Mode
Sub-Agent
Todo
Background Bash
MCP
Permission Popup
```

但 Pi 当前明确表示：

```text
这些并不是默认 Core 功能
```

官方设计原则中甚至直接列出：

```text
MCP
Sub-Agents
Permission Popups
Plan Mode
To-dos
Background Bash
```

都不会默认塞进 Pi Core，需要时可以通过 Extension、Package，或者外部工具实现。

---

这并不代表这些能力：

```text
没有价值
```

恰恰相反，它们很多都非常有用。

问题在于：

> **它们是不是所有 Agent 都必须拥有的基础能力？**

例如 Plan Mode。

一种 Coding Agent 可能希望：

```text
先完整规划
↓
用户批准
↓
再执行
```

另一种可能更适合：

```text
读一点
做一点
验证一点
不断调整
```

如果 Pi Core 强制规定：

```text
所有任务必须先 Plan
```

那其实已经替所有用户选择了一种工作流。

---

Sub-Agent 也是一样。

一种系统可能设计成：

```text
Main Agent
├─ Research Agent
├─ Coding Agent
└─ Review Agent
```

另一种系统则可能坚持：

```text
一个 Agent
+
更好的 Tools
+
更好的 Context
```

到底哪一种更适合，并不存在统一答案。

所以 Pi 更倾向：

```text
Agent Core 不替你决定
```

如果确实需要 Plan Mode，Pi 仓库甚至已经有 Extension 示例来实现这一类工作流，而不是必须修改 Core。

---

这背后其实是一条很重要的工程原则：

```text
通用机制
放 Core

个性化选择
放 Extension
```

例如：

```text
Agent Loop
Tool Execution
Session
Compaction
Streaming
Abort
```

这些能力几乎所有真实 Agent 都会需要，所以适合成为基础设施。

而：

```text
是否必须 Plan

是否使用多个 Agent

什么命令需要确认

是否自动 Git Checkpoint
```

这些就没有必要全部写死在 Core。

---

现在再看 Pi 整体，可以把它的设计压缩成：

```text
            Stable Core

        Agent Loop
        Tool Runtime
        Session
        Context
        Model Layer
        Events

               │
               ↓

         Extension Points

      ┌────────┼────────┐
      ↓        ↓        ↓

 Extension   Skills   Templates

               │
               ↓
            Packages
```

所以：

> **真实 Agent 工程，并不是功能越多越完整。**

更重要的是：

> **核心应该提供稳定机制，同时给变化频繁的工作流留下扩展空间。**

这也是 Pi 的 Minimal Philosophy 真正值得学习的地方。

## 总结

从最小 Coding Agent 一直看到 Pi，我们会发现发生变化的，并不是那条核心的 Agent Loop。

最开始我们写的是：

```text
Model
↓
Tool Call
↓
Tool Result
↓
Model
```

到了 Pi，这条主线依然存在。

真正增加的，是围绕这条 Loop 建立起来的一整套工程基础设施：

```text
                    Coding Agent

                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓

        Model          Runtime         Tools
          │              │              │
      Provider       Agent Loop      read/edit
      Streaming      Events          write/bash
      Auth / Cost    Abort
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓

       Session        Context       Extension
                         │
                    Compaction
```

模型层需要处理不同 Provider、认证、Streaming、Token 和 Cost。

Runtime 不只是一个 `while(true)`，还要处理 Tool 生命周期、错误、Abort、用户 Steering 和 Follow-up。

Tool 也不只是几段函数，还要面对输出截断、并发修改、进程管理和执行环境。

任务变长以后，还需要 Session 保存完整历史，再通过 Compaction 控制真正进入模型的 Context。

而当需求继续增加时，Pi 又没有选择把所有功能都塞进 Core，而是把更多变化留给 Extensions、Skills、Prompt Templates 和 Packages。

所以从我们做的最小 Coding Agent 到 Pi，真正增加的不是：

> **一个越来越复杂的 Agent Loop。**

而是：

> **一整套让这条 Loop 能够长期、稳定、可扩展地运行下去的工程能力。**

这也是 Pi 的 Minimal 思路最值得我们学习的地方。

Minimal 并不意味着功能少，也不意味着代码越少越好。

而是核心功能流程应该足够稳定，同时给用户留出扩展空间。

我们后续再去看新的 Agent Framework，会发现其实很多看起来完全不同的实现，底层依然绕不开这些问题：

```text
模型怎么调用
工具怎么执行
状态怎么保存
Context 怎么控制
执行过程怎么观察
用户怎么介入
权限边界在哪里
功能应该放进核心还是扩展
```

前面我们从零写最小 Agent，是为了看清 Agent 最核心的 Loop。

这一篇再看 Pi，则是为了理解：

> **一条简单的 Loop，真正走向一个完整 Coding Agent 时，还需要补上哪些工程能力。**

到这里，「入门」栏目也就完成了它最重要的任务。

后面再进入具体框架、Context Engineering、Memory、MCP、Skills、Multi-Agent、Evaluation 等内容时，我们讨论的也不再是一堆孤立的名词，而是在不断完善同一个 Agent 系统。

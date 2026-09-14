---
title: 深入 MCP：MCP 的架构是怎样的？
description: "从 Host、Client 和 Server 的职责边界出发，理解 MCP 的整体架构与调用关系。"
summary: 拆解 MCP Host、Client、Server 三个角色，以及它们如何共同组成一个 MCP 系统。
keywords:
  - 深入 MCP
  - MCP 原理
  - Model Context Protocol
tags:
  - AI Agent
  - 原理
  - MCP
author: 布吉岛
lastUpdated: 2026-09-14
status: draft
draft: true
assets: none
reviewed: false
sourceType: original
noindex: true
---

# 深入 MCP：MCP 的架构是怎样的？

如果你还不清楚 MCP 是什么、为什么会出现 MCP，或者 MCP 和 Tool Calling 到底是什么关系，可以先看前面的《[MCP 是什么](/getting-started/mcp)》和《[Tool Calling 是什么](/getting-started/tool-calling)》。

这一章不再重复这些基础概念，我们直接往下拆 MCP 的架构。


先想一个问题：当我们说“一个 Agent 接入了 MCP”，到底是谁在和 MCP Server 通信？

是大模型吗？

不是。

是 Agent 吗？

也不够准确。

按照 MCP 当前的架构，一个完整系统至少要区分 **Host、Client 和 Server** 三个角色。当前 `2026-07-28` 规范仍然明确采用 Client-Host-Server 架构：

Host 内部可以运行多个 MCP Client，每个 Client 面向一个特定的 MCP Server，而 Server 负责暴露 Tools、Resources、Prompts 等能力。

与此同时，新版 MCP 已经变成无状态协议，每一次请求都携带自己的协议版本和 Client Capabilities，因此这里说的 Client 与 Server 关系，也不能再简单理解成早期版本那种“依赖长期 Session 的连接”。

理解 MCP 后面所有协议设计之前，我们必须先把这三个角色分清楚。

## 为什么 MCP 要分成 Host、Client 和 Server？

我们平时已经很熟悉 C/S、B/S 这类架构了，Client 和 Server 各司其职并不难理解。

那么到了 MCP，为什么只有 Client 和 Server 还不够，还要再单独引入一个 Host？

既然 MCP Server 已经提供了工具，Agent Runtime 直接请求 Server 不就可以了吗？

如果单纯从“能不能实现”的角度来说，当然可以。一个应用完全可以自己写 HTTP 请求、自己管理 Tool Schema、自己把工具结果交给模型。

但 MCP 要解决的并不是“怎样以最少代码调用一次接口”，它关心的是：当一个 AI 应用同时连接多个外部能力时，**谁负责模型，谁负责协议，谁负责能力本身，以及这些责任之间怎样保持边界**。

Host 是整个系统真正的控制中心。

Host 的职责包括创建和管理 MCP Client、控制连接权限和生命周期、执行安全策略和用户授权、协调 AI/LLM 集成，以及聚合来自不同 Client 的上下文。

换句话说，Host（宿主）并不是一个单纯的网络容器，它才是“这个 AI 应用本身”。Claude Desktop、IDE、Agent Runtime 或者我们自己开发的 Agent 应用，都可以处在 Host 这一层。

MCP Client 则是 Host 内部的一块**协议适配器**。

它不应该决定“用户到底想做什么”，也不应该承担整个 Agent 的规划逻辑。它负责的是和某一个 Server 说 MCP：构造请求、携带协议版本和能力信息、接收响应、处理通知和订阅，把 Host 想完成的 MCP 操作转换成真正的协议消息。

Server 更不需要理解整个 Agent 如何规划任务，也不需要知道用户完整聊了什么。它只需要专注于自己能够提供的能力，例如 GitHub Server 提供仓库、Issue、Pull Request 等能力，Google Drive Server 提供文件搜索、读取和管理能力，Cloudflare Server 提供域名、DNS、Workers、日志等云服务能力。

**Host 负责“我要完成什么”；Client 负责“怎么用 MCP 表达”；Server 负责“这个具体能力怎么执行”。**

举个简单的例子。

假设我们在 Codex 里接入 GitHub MCP Server，并发送消息“我想要查看我当前 GitHub 有哪些仓库”。此时，**Codex 是 Host**；Codex 内部会有一块负责 MCP 通信的代码或组件，这就是 **MCP Client**。它通常由应用开发者集成到自己的软件里，负责按照 MCP 协议向对应的 Server 发送请求、接收结果。

而 **MCP Server** 是能力提供方。比如 GitHub Server 负责提供仓库、Issue、Pull Request 等能力。

可以简单理解为：

**Host 是整个应用，Client 是 Host 内部负责 MCP 通信的组件，Server 是真正提供具体能力的一端。**

**复杂的编排应该尽可能留在 Host，Server 则应该保持职责单一、彼此独立。**

这也是 MCP 架构里很重要的一项设计：Server 不需要掌握整个任务，也不应该默认知道其他 Server 的存在。它只需要处理 Host 通过对应 Client 发给自己的请求。

还是以前面的例子来说。假设 Codex 同时接入了 GitHub、Google Drive 和 Cloudflare 三个 MCP Server，用户告诉 Codex：

> 查看项目最近的 Issue，找到 Google Drive 里的需求文档，再检查对应域名的 Cloudflare 配置。

真正知道“整个任务要完成什么、下一步该调用哪个能力”的，是作为 Host 的 Codex。

GitHub Server 只需要处理 GitHub 相关操作，Google Drive Server 只负责文件相关能力，Cloudflare Server 只处理自己的云服务能力。它们没有必要知道另外两个 Server 做了什么，也不需要知道整个任务最终想达到什么目的。

所以多个 MCP Server 组合起来，并不是：

**Server A 调用 Server B，再由 Server B 调用 Server C。**

而是：

**Host 根据任务需要，分别调度不同的 MCP Client，再由这些 Client 与各自对应的 Server 通信。**

这也是为什么 Host 会成为 MCP 系统的全局控制中心。任务编排、上下文管理、权限判断、用户确认以及不同 Server 返回结果之间的衔接，最终都应该由 Host 来统一处理。

换句话说，**Server 负责把自己的能力做好，Host 负责把这些能力组合起来。**

## 一个 Host 为什么可以有多个 Client？

当我们理解 Client 是 Host 内部的 MCP 协议组件以后，一个 Host 为什么会有多个 Client 就很好理解了：**因为一个 Host 通常不只连接一个 MCP Server。**

假设一个 Agent 同时拥有 GitHub、Google Drive、Cloudflare 三种外部能力。从架构上看，它不会创建一个“超级 MCP Client”，然后让这个 Client 自己管理三个完全不同的 Server，而通常会形成三个相互独立的 Client 实例。

可以把它想象成：

**Host → GitHub Client → GitHub Server**

**Host → Google Drive Client → Google Drive Server**

**Host → Cloudflare Client → Cloudflare Server**

当前 MCP 官方架构规范也是这样定义的：

> **Host 创建并管理多个 Client，而每个 Client 与一个特定 Server 建立对应关系。**

为什么不把所有 Server 都放到同一个 Client？

首先是**能力空间不同**。

GitHub Server 可能声明 Tools 能力，Google Drive Server 可能同时提供 Resources，另一个 Server 又可能支持其他扩展。每个 Server 拥有自己的 Capability、Tool Catalog、Resource Namespace、通知和订阅状态。

如果把这些东西全部放进一个共享 Client 后，Client 内部还得重新建立一套“这个 Tool 属于哪个 Server”的路由系统。

而让 Client 天然绑定一个 Server，这个问题在架构层就被解决了。

当 GitHub Client 收到 `tools/list`，返回的一定是 GitHub Server 的 Tool；当这个 Client 发出 `tools/call`，目标也自然是这个 Server。Client 自己不需要重新做多 Server 路由。

其次是**生命周期隔离**。

Google Drive Server 崩溃，不应该导致 Cloudflare Client 一起失效；GitHub Server 被用户禁用，也不应该影响另一个 Server 的订阅。

在 stdio 场景里，这种隔离尤其直观。一个 Client 可能启动一个本地 Server 子进程，进程退出意味着这一条 Client–Server 路径失效，但 Host 中其他 Client 仍然可以继续工作。这种进程模型天然就对应一个独立的 Server 边界。

> 这里的 `stdio` 可以先简单理解为一种本地进程间通信方式：Client 启动 Server 子进程，并通过标准输入（stdin）和标准输出（stdout）交换 MCP 消息。它的具体传输格式和生命周期，我们后面再详细展开。

第三是**安全边界**。

假设 GitHub Server 拥有仓库写入权限，而 Cloudflare Server 拥有修改 DNS、Workers 等云资源的权限。如果它们共享同一套内部连接状态、Credential 或上下文，就很容易造成权限边界模糊。

一个 Client 对应一个 Server，使 Host 可以围绕 Server 做更精细的控制：

* 这个 Server 能不能连接？
* 它可以暴露哪些 Tool？
* 哪些请求必须向用户确认？
* Authorization Token 属于谁？
* 结果能不能进入模型上下文？

最终决定这些问题的仍然是 Host，但“一 Client 对一 Server”给 Host 提供了非常清晰的控制单位。

## 为什么一个 Client 只连接一个 Server？

MCP 规范所说的 1:1，指的是：

**一个 MCP Client 实例面向一个特定的 MCP Server。**

它并不意味着：

**一个 MCP Server 进程只能服务一个 Client。**

这两个说法完全不同。

当前官方明确说明，一个 Client 与一个特定 Server 是 1:1 关系；与此同时，Streamable HTTP 规范又明确指出，远程 Server 可以作为独立进程运行，并处理多个 Client 连接。

> 这里的 `Streamable HTTP` 可以先理解为一种基于 HTTP 的远程 Transport：Client 通过 HTTP 与远程 MCP Server 交换协议消息。它的请求、响应流和 Session 机制会在后文详细展开。

也就是说，1:1 是从 **Client 实例的职责边界**来说的，并不是要求远程服务器按每个用户启动一个独占 Server 进程。

为什么 Client 要坚持“一 Client 面向一个 Server”？

最直接的原因仍然是：**它可以让协议上下文保持单一。**

想一下，如果一个 Client 同时连接 GitHub Server 和 Google Drive Server，会发生什么。

Client 调用 `tools/list` 后得到：

`create_issue`、`list_pull_requests`、`search_files`、`read_file`。

接下来调用：

`tools/call`

Client 就必须自己再解决：

* `create_issue` 属于哪台 Server？
* 两个 Server 都定义了 `search` 怎么办？
* 哪个 Server 支持 Resource Subscription？
* 哪个 Server 声明了某个 Extension？
* 一条 Notification 到底属于哪台 Server？
* 某台 Server 出错之后，要关闭整个 Client 还是只关闭一部分？

最终你会发现，我们只是把原本 Host 应该处理的多 Server 管理逻辑，塞进了 Client。

而 MCP 选择了一种更简单的模型：

**Client 内部不解决“多个 Server 之间怎么组织”的问题。**

它只理解一个 Server。

跨 Server 的 Tool Catalog 聚合、命名冲突、上下文编排和能力组合，都交给 Host。

## LLM、Agent Runtime 和 MCP 到底是怎么串起来的？

前面把 Host、Client、Server 都拆开以后，我们现在就可以回答下面这个问题：

> 模型到底是怎么调用 MCP Tool 的？

MCP Server 根本不会直接和 LLM 通信。官方文档甚至直接强调：Server 暴露能力给 Client，但 **Server 不直接和模型交互**。

假设用户对一个 Agent 说：

> 帮我看一下这个项目最近有没有新的 Bug Issue。

Host 中的 Agent Runtime 首先需要让模型知道它有哪些 Tool。

MCP Client 可以从 GitHub MCP Server 获取工具定义，例如 Server 暴露：

`search_issues`

它可能拥有名称、描述和输入 Schema。

但这份 MCP Tool Definition 不一定会原封不动地交给模型。

真正调用 OpenAI、Anthropic、Gemini 或其他 Model API 的是 Host。

Host 需要根据自己使用的模型供应商，把 MCP Tool 转换成这个模型 API 能理解的 Tool Schema，再连同 Conversation、System Prompt 和其他 Context 一起构造一次模型请求。

也就是说，在模型第一次“看到 MCP Tool”之前，MCP 已经结束了一段工作：

**Server → MCP Client → Host → Model Tool Schema**

模型得到的并不是一个“MCP Connection”。

模型得到的是：

> “你现在有一个叫 `search_issues` 的工具，它接受这些参数。”

模型根据用户请求产生一个 Tool Call，例如：

`search_issues(repo="xxx", query="is:issue is:open label:bug")`

到这一步为止，模型仍然没有发送任何 MCP 请求。

模型只是生成了一段**调用意图**，本质上就是一段文本代码。

接下来是 Agent Runtime 接管。

Runtime 解析 Tool Call，判断这个工具来自 GitHub MCP Server，然后找到对应的 MCP Client。

这时候才真正进入 MCP 内部。

MCP Client 构造 `tools/call` 请求，通过 stdio 或 Streamable HTTP 发送给 GitHub MCP Server。Server 找到对应 Tool Handler，执行真正的 GitHub API 请求，然后把 Tool Result 通过 MCP Response 返回。

接下来链路反过来：

**MCP Server → MCP Client → Host → Agent Runtime → Model Context**

Host 把 MCP Tool Result 转换成模型 API 可以接受的 Tool Result Message，再发起下一次模型推理。

模型最终才会根据：

用户原始问题 + 前面的 Tool Call + Tool Result

生成：

> 最近有 3 个 Bug Issue……

所以一轮完整的 Tool 调用实际上跨越了两个不同的“协议世界”。

第一层是：

**Host ↔ LLM**

这里可能使用 OpenAI、Anthropic、Gemini 等模型供应商自己的 API 和 Tool Calling 机制。

第二层是：

**MCP Client ↔ MCP Server**

这里使用 MCP。

而 Agent Runtime 就站在这两个世界中间。

它负责把：

> 模型产生的 Tool Call

映射成：

> MCP `tools/call`

再把：

> MCP Tool Result

映射回：

> 模型能够继续推理的 Tool Result。

另外，这里还有一个细节。

MCP 并没有规定 Host 必须使用 LLM，也没有规定 Tool 一定要由模型自主选择。

规范本身只定义 Client 与 Server 如何交换 MCP 消息。

Host 完全可以自己写：

> 用户点击按钮 → 调 MCP Tool

也可以：

> Workflow 到达某一步 → 调 MCP Tool

甚至：

> 后端定时任务 → 调 MCP Tool

因此，从协议角度看：

**MCP 并不依赖 Tool Calling 才能存在。**

反过来 Tool Calling 也完全不依赖 MCP。

真正把二者连接起来的是 **Host / Agent Runtime 的实现**。

这也是为什么架构中要强调 Host 的存在。

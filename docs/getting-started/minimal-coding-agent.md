---
title: 从零实现一个最小 Coding Agent
description: "使用 TypeScript 从零实现一个最小 Coding Agent，完整跑通 System Prompt、Tool Schema、Tool Calling、Messages 和 Agent Loop。"
summary: 不依赖 Agent Framework，从零实现一个能够读取文件、修改代码、执行命令，并根据工具结果持续推进任务的最小 Coding Agent。
keywords:
  - Coding Agent
  - AI Agent 开发
  - Agent Loop
  - Tool Calling
  - System Prompt
  - TypeScript Agent
tags:
  - AI Agent
  - Coding Agent
  - Agent 开发
  - Tool Calling
  - TypeScript
author: 布吉岛
lastUpdated: 2026-09-08
status: published
assets: none
reviewed: false
sourceType: original
draft: false
noindex: false
---

# 从零实现一个最小 Coding Agent

## 这次我们要做什么

上篇文章我们实现了一个简单旅游助手 Agent，相信大家已经对实际的Agent代码结构有了一定的了解。

虽然比较简单，但目前大多数 Agent 的核心都是这套思想。

为了加深一下大家的理解，这篇文章，我们再来实现一个最小 Coding Agent。

像我们平常用的Codex、Claude Code等都属于Coding Agent。这也是当前Agent最火的一个方向。

我们希望这个Coding Agent能够接收类似这样的任务：

```text
运行当前项目的测试，找到失败原因并修复。

修复完成后重新运行测试进行验证。
```

然后自主完成类似下面的过程：

```text
运行测试
   ↓
看到测试失败
   ↓
读取相关代码
   ↓
定位问题
   ↓
修改代码
   ↓
再次运行测试
   ↓
测试通过
   ↓
结束任务
```

和前一篇文章一样，为了把最核心的结构看清楚，这一篇仍然不会使用 LangGraph、AgentScope 等 Agent Framework。

我们只使用：

```text
TypeScript
+
模型 API
+
4 个 Coding Tools
+
Messages
+
一个 Agent Loop
```

通过这四个工具，Agent 可以读取项目、修改代码、运行测试，并根据结果继续推进任务。

---

## 先看最终的 Agent 长什么样

先不看代码。

整个 Agent 最终只有这样一条主链：

```text
用户任务
   ↓
System Prompt
   ↓
Messages
   ↓
LLM
   ↓
是否产生 Tool Call？
   │
   ├─ 否 → 返回最终结果 → 结束
   │
   └─ 是
       ↓
   执行 Tool
       ↓
   Tool Result
       ↓
   写回 Messages
       ↓
   再次调用 LLM
       ↓
      ……
```

我们只给它四个工具：

```text
read
write
edit
bash
```

分别负责：

| Tool    | 作用         |
| ------- | ---------- |
| `read`  | 读取项目文件     |
| `write` | 创建或覆盖文件    |
| `edit`  | 精确修改已有文件   |
| `bash`  | 执行测试、构建等命令 |

这四个工具组合起来，已经能够形成一个非常基础的 Coding Agent。

---

## 初始化项目

### 创建 TypeScript 项目

先创建一个项目：

```bash
mkdir mini-coding-agent
cd mini-coding-agent

npm init -y
```

安装依赖：

```bash
npm install openai dotenv
npm install -D tsx
```
在已有的 `package.json` 中合并加入以下字段：

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts"
  }
}
```

项目结构大概如下：

```text
mini-coding-agent/
├── src/
│   ├── index.ts
│   ├── agent.ts
│   └── tools.ts
├── workspace/
├── .env
└── package.json
```

其中：

```text
index.ts
→ 接收用户任务，启动 Agent

agent.ts
→ System Prompt、模型调用、Messages、Agent Loop

tools.ts
→ read / write / edit / bash
```

`workspace/` 则是我们用来演示 Agent 可以操作的项目目录。

---

### 配置模型 API

创建 `.env`：

```env
OPENAI_API_KEY=你的 API Key
OPENAI_MODEL=你当前可用且支持 Tool Calling 的模型
```
---

## 设计最小 System Prompt

Coding Agent 不是只有：

```text
模型
+
工具
```

还需要告诉模型：

> 当前是什么系统、应该怎么工作、什么时候算完成。

因此先定义一个最小 System Prompt。

在 `agent.ts` 中加入：

```typescript
import path from "node:path";

const WORKSPACE_DIR = path.resolve(process.cwd(), "workspace");

export const SYSTEM_PROMPT = `
你是一个运行在本地项目工作区中的 Coding Agent。

工作目录：
${WORKSPACE_DIR}

使用 read、write、edit 和 bash 工具检查、修改并验证项目。

规则：
- 修改前先读取相关文件。
- 修改已有文件中的局部内容时，优先使用 edit。
- 创建新文件或替换整个文件时，使用 write。
- 修改范围应集中在用户当前要求的任务上。
- 修改代码后，如果条件允许，应运行相关测试或检查。
- 除非确实运行过命令并看到了结果，否则不要声称命令或测试已经通过。
- 将工作目录视为任务边界，不要主动访问它之外的文件。
- 任务完成后停止调用工具，并简要总结修改内容以及验证方式。
`.trim();
```

这个 Prompt 并不长。

简单描述了Agent的身份、工作目录、工具、规则，其实真实Prompt远比这个长，后续我们在其他栏目再给大家实际展示一些真实项目中的Prompt。

---

## 先让模型正常完成一次调用

在写 Tool Calling 之前，先确认最基础的模型调用没有问题。

暂时创建一个简单的 `src/index.ts`：

```typescript
import "dotenv/config";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./agent.js";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL;

if (!apiKey) {
  throw new Error(
    "请先在 .env 文件中配置 OPENAI_API_KEY",
  );
}

if (!model) {
  throw new Error(
    "请先在 .env 文件中配置 OPENAI_MODEL",
  );
}

const client = new OpenAI({
  apiKey,
});

const response = await client.chat.completions.create({
  model,
  messages: [
    {
      role: "developer",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: "只回复：模型连接成功",
    },
  ],
});

console.log(response.choices[0]?.message.content);
```

运行：

```bash
npm run dev
```

如果能够看到：

```text
模型连接成功
```
就说明这条最基础的模型调用链路已经正常了。

接下来开始加入真正的 Coding Tools。

---

## 给 Agent 准备四个 Coding Tools

先创建：

```text
src/tools.ts
```

这里仍然采用两层结构：

```text
Tool Schema
→ 告诉模型“这个工具怎么调用”

Tool Implementation
→ 真正执行这个工具
```

两者需要一一对应，但不是同一个东西。

下面先定义四个工具的 Schema，
再实现它们真正执行的函数。

---

### 定义 Tool Schema

先导入需要的模块：

```typescript
import { exec } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

const execAsync = promisify(exec);

export const WORKSPACE_DIR = path.resolve(
  process.cwd(),
  "workspace",
);
```

接着定义四个 Tool：

```typescript
export const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "read",
      description:
        "读取当前工作区中的 UTF-8 文本文件。",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "相对于当前工作区的文件路径，例如 src/index.ts",
          },
        },
        required: ["path"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "write",
      description:
        "在当前工作区创建文本文件，或替换整个文件。",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "相对于当前工作区的文件路径",
          },
          content: {
            type: "string",
            description:
              "需要写入文件的完整内容",
          },
        },
        required: ["path", "content"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "edit",
      description:
        "通过替换完全匹配的文本，精确修改已有文本文件。",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "相对于当前工作区的文件路径",
          },
          oldText: {
            type: "string",
            description:
              "需要替换的原始文本",
          },
          newText: {
            type: "string",
            description:
              "用于替换 oldText 的新文本",
          },
        },
        required: ["path", "oldText", "newText"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "bash",
      description:
        "在当前工作区中执行 Shell 命令，用于测试、构建和检查项目。",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description:
              "需要从工作区目录执行的 Shell 命令",
          },
        },
        required: ["command"],
        additionalProperties: false,
      },
    },
  },
];
```

这里真正交给模型的是：

```text
name
description
parameters
```

例如模型看到：

```text
read(path)
```

以后就知道：

> 如果需要读取文件，可以生成一个 `read` Tool Call，并提供 `path`。

而不是把所有工具说明都塞进 System Prompt，再让我们自己从自然语言里解析。

---

### 实现 read、write、edit 和 bash

Schema 只是告诉模型工具长什么样。

下面才是真正执行工具的代码。

先把输入路径拼接到工作区目录下：

```typescript
function resolveWorkspacePath(inputPath: string): string {
  return path.resolve(WORKSPACE_DIR, inputPath);
}
```

然后实现 `read`：

```typescript
async function readTool(
  args: Record<string, unknown>,
): Promise<string> {
  const inputPath = String(args.path ?? "");
  const filePath = resolveWorkspacePath(inputPath);

  const content = await readFile(filePath, "utf8");

  return JSON.stringify({
    ok: true,
    path: inputPath,
    content,
  });
}
```

`write`：

```typescript
async function writeTool(
  args: Record<string, unknown>,
): Promise<string> {
  const inputPath = String(args.path ?? "");
  const content = String(args.content ?? "");

  const filePath = resolveWorkspacePath(inputPath);

  await mkdir(path.dirname(filePath), {
    recursive: true,
  });

  await writeFile(filePath, content, "utf8");

  return JSON.stringify({
    ok: true,
    path: inputPath,
    message: "文件写入成功",
  });
}
```

`edit` 稍微特殊一点。

我们不让模型给出任意 Patch，而是要求：

```text
oldText
↓
精确找到
↓
替换为 newText
```

程序会先在文件中找到 `oldText`，再把它替换为 `newText`：

```typescript
async function editTool(
  args: Record<string, unknown>,
): Promise<string> {
  const inputPath = String(args.path ?? "");
  const oldText = String(args.oldText ?? "");
  const newText = String(args.newText ?? "");

  const filePath = resolveWorkspacePath(inputPath);
  const content = await readFile(filePath, "utf8");

  const firstIndex = content.indexOf(oldText);

  if (firstIndex === -1) {
    throw new Error(
      "文件中没有找到 oldText",
    );
  }

  const updated =
    content.slice(0, firstIndex) +
    newText +
    content.slice(firstIndex + oldText.length);

  await writeFile(filePath, updated, "utf8");

  return JSON.stringify({
    ok: true,
    path: inputPath,
    message: "文件修改成功",
  });
}
```

这种精确替换有一个明显好处：

> Agent 不能只说“修改第 18 行”。

它必须先读取真实文件，再提供能够和当前文件对应上的原始文本。

最后实现 `bash`：

```typescript
async function bashTool(
  args: Record<string, unknown>,
): Promise<string> {
  const command = String(args.command ?? "");

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: WORKSPACE_DIR,
    });

    return JSON.stringify({
      ok: true,
      command,
      stdout,
      stderr,
    });
  } catch (error) {
    const result = error as {
      message?: string;
      stdout?: string;
      stderr?: string;
      code?: string | number;
    };

    return JSON.stringify({
      ok: false,
      command,
      code: result.code,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
      error: result.message ?? "命令执行失败",
    });
  }
}
```

注意这里有一个细节：

```text
命令执行失败
```

并没有直接让整个 Agent 崩掉。

而是被转换成：

```json
{
  "ok": false,
  "error": "..."
}
```

然后重新返回模型。

这样模型下一轮才能看到：

> 刚才的命令失败了。

然后决定：

```text
重试
换命令
读取其他文件
修改代码
或者停止
```

这才符合 Agent 的执行方式。

最后统一提供一个工具分发函数：

```typescript
export async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  try {
    switch (name) {
      case "read":
        return await readTool(args);

      case "write":
        return await writeTool(args);

      case "edit":
        return await editTool(args);

      case "bash":
        return await bashTool(args);

      default:
        throw new Error(`未知工具：${name}`);
    }
  } catch (error) {
    return JSON.stringify({
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}

export async function ensureWorkspace(): Promise<void> {
  await mkdir(WORKSPACE_DIR, {
    recursive: true,
  });
}
```

四个 Coding Tool 的说明和实现已经准备好了，
下面开始把它们接入 Agent Loop。

---

## 让模型真正调用工具

前面的工具已经准备好，现在只需要把模型返回的 Tool Call 交给 executeTool()，再把执行结果写回 Messages。

这个过程会在 Agent Loop 中反复发生：

模型返回 Tool Call
→ executeTool() 执行
→ Tool Result 写回 Messages
→ 再次调用模型

---

### 读取模型返回的 Tool Call

调用模型：

```typescript
const response =
  await client.chat.completions.create({
    model,
    messages,
    tools,
    tool_choice: "auto",
  });

const assistantMessage =
  response.choices[0]?.message;
```

模型可能直接返回最终文本。

也可能返回：

```text
tool_calls
```

例如：

```json
{
  "name": "read",
  "arguments": "{\"path\":\"package.json\"}"
}
```

所以：

```typescript
const toolCalls =
  assistantMessage.tool_calls ?? [];
```

就能知道这一轮有没有动作需要执行。

---

### 在宿主程序里执行工具

模型并不会真的执行：

```text
read
```

宿主程序才负责执行：

```typescript
for (const toolCall of toolCalls) {
  if (toolCall.type !== "function") {
    continue;
  }

  let args: Record<string, unknown>;

  try {
    args = JSON.parse(
      toolCall.function.arguments,
    );
  } catch {
    args = {};
  }

  const result = await executeTool(
    toolCall.function.name,
    args,
  );
}
```

到这里，我们终于真正建立了：

```text
LLM
 ↓
Tool Call
 ↓
宿主程序
 ↓
Tool
```

---

### 把 Tool Result 返回给模型

工具执行完还不能结束。

例如 `read` 返回：

```json
{
  "ok": true,
  "path": "src/index.ts",
  "content": "..."
}
```

下一轮模型必须能够看到这个结果。

所以需要把它写回 Messages：

```typescript
messages.push({
  role: "tool",
  tool_call_id: toolCall.id,
  content: result,
});
```

于是上下文变成：

```text
User
 ↓
Assistant Tool Call
 ↓
Tool Result
 ↓
Assistant
```

模型下一轮才能基于真实结果继续行动。

现在已经只差最后一步：

> 把这些步骤放进一个循环。

---

## 写出 Agent Loop

### 保存 Messages 和当前 Step

先初始化 Messages：

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

这里的 Messages 就是这个最小 Agent 最主要的运行状态。

例如几轮以后可能变成：

```text
Developer
→ System Prompt

User
→ 修复测试失败的问题

Assistant
→ bash("npm test")

Tool
→ 1 test failed

Assistant
→ read("calculator.js")

Tool
→ 文件内容

Assistant
→ edit(...)

Tool
→ 修改成功
```

模型下一轮看到的，不再只是最开始那个用户问题。

而是：

> 到目前为止整个任务已经发生了什么。

当前 Step 则直接由循环计数器记录。

---

### 持续执行 Model → Tool → Result

这里的 Agent Loop 结构没有变化：

```text
模型决定下一步
→ 执行工具
→ 把工具结果写回 Messages
→ 模型继续判断
```

上一篇调用的是天气和景点工具，
这一篇调用的则是 `read`、`write`、`edit` 和 `bash`。

现在把这几个部分真正串起来。

`agent.ts` 最终代码为：

```typescript
import "dotenv/config";
import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";

import {
  executeTool,
  tools,
  WORKSPACE_DIR,
} from "./tools.js";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL;

if (!apiKey) {
  throw new Error(
    "请先在 .env 文件中配置 OPENAI_API_KEY",
  );
}

if (!model) {
  throw new Error(
    "请先在 .env 文件中配置 OPENAI_MODEL",
  );
}

const client = new OpenAI({
  apiKey,
});

export const SYSTEM_PROMPT = `
你是一个运行在本地项目工作区中的 Coding Agent。

工作目录：
${WORKSPACE_DIR}

使用 read、write、edit 和 bash 工具检查、
修改并验证项目。

规则：
- 修改前先读取相关文件。
- 修改已有文件中的局部内容时，优先使用 edit。
- 创建新文件或替换整个文件时，使用 write。
- 修改范围应集中在用户当前要求的任务上。
- 修改代码后，如果条件允许，应运行相关测试或检查。
- 除非确实运行过命令并看到了结果，否则不要声称命令或测试已经通过。
- 将工作目录视为任务边界，不要主动访问它之外的文件。
- 任务完成后停止调用工具，并简要总结修改内容以及验证方式。
`.trim();

export async function runAgent(
  task: string,
): Promise<string> {
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

  let step = 1;
  while (true) {
    console.log(
      `\n========== Step ${step} ==========`,
    );

    const response =
      await client.chat.completions.create({
        model,
        messages,
        tools,
        tool_choice: "auto",
      });

    const assistantMessage =
      response.choices[0]?.message;

    if (!assistantMessage) {
      throw new Error(
        "模型没有返回有效的 assistant 消息",
      );
    }

    messages.push({
      role: "assistant",
      content: assistantMessage.content,
      tool_calls:
        assistantMessage.tool_calls,
    });

    const toolCalls =
      assistantMessage.tool_calls ?? [];

    if (toolCalls.length === 0) {
      return (
        assistantMessage.content ??
        "任务结束，但模型没有返回最终消息。"
      );
    }

    for (const toolCall of toolCalls) {
      if (toolCall.type !== "function") {
        continue;
      }

      let args: Record<string, unknown>;

      try {
        args = JSON.parse(
          toolCall.function.arguments,
        ) as Record<string, unknown>;
      } catch {
        const result = JSON.stringify({
          ok: false,
          error:
            "Tool 参数不是有效的 JSON",
        });

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });

        continue;
      }

      console.log(
        `→ ${toolCall.function.name}`,
        args,
      );

      const result = await executeTool(
        toolCall.function.name,
        args,
      );

      console.log(
        `← ${result.slice(0, 500)}`,
      );

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });
    }

    step++;
  }
}
```

如果我们把里面真正和 Agent 有关的部分拿出来，会发现核心代码其实就是：

```typescript
while (...) {
  const response = await callModel();

  if (没有 Tool Call) {
    return 最终结果;
  }

  for (const toolCall of toolCalls) {
    const result =
      await executeTool(toolCall);

    messages.push(result);
  }
}
```
这就是我们真正需要的 Agent Loop。

---

## 让 Agent 完成一个真实 Coding 任务

现在准备一个故意带 Bug 的小项目。

在 `workspace/` 中创建：

```text
workspace/
├── package.json
├── calculator.js
└── calculator.test.js
```

`package.json`：

```json
{
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

`calculator.js`：

```javascript
export function add(a, b) {
  return a - b;
}
```

这里故意把：

```text
+
```

写成：

```text
-
```

然后创建测试：

```javascript
import test from "node:test";
import assert from "node:assert/strict";

import { add } from "./calculator.js";

test("add should return the sum", () => {
  assert.equal(add(2, 3), 5);
});
```

如果现在进入 `workspace` 运行：

```bash
npm test
```

测试应该失败。

---

接下来把 `index.ts` 改成最终版本：

```typescript
import "dotenv/config";
import {
  createInterface,
} from "node:readline/promises";
import {
  stdin as input,
  stdout as output,
} from "node:process";

import { runAgent } from "./agent.js";
import {
  ensureWorkspace,
} from "./tools.js";

await ensureWorkspace();

const readline = createInterface({
  input,
  output,
});

const task = await readline.question(
  "What do you want the agent to do?\n> ",
);

readline.close();

if (!task.trim()) {
  throw new Error("任务内容不能为空");
}

const result = await runAgent(task);

console.log("\n========== Result ==========");
console.log(result);
```

启动：

```bash
npm run dev
```

输入：

```text
运行当前项目的测试，找到测试失败的原因并修复。

修复前先阅读相关文件，修复完成后重新运行测试进行验证。
不要修改与任务无关的文件。
```

具体 Tool Call 顺序取决于模型。

一次可能的运行过程是：

```text
========== Step 1 ==========

→ bash
{ command: "npm test" }

←
{
  "ok": false,
  ...
}
```

模型拿到测试失败的信息以后继续。

```text
========== Step 2 ==========

→ read
{ path: "calculator.test.js" }

→ read
{ path: "calculator.js" }
```

读取代码以后发现：

```javascript
return a - b;
```

于是：

```text
========== Step 3 ==========

→ edit
{
  path: "calculator.js",
  oldText: "return a - b;",
  newText: "return a + b;"
}
```

程序执行真实文件修改。

接着模型继续：

```text
========== Step 4 ==========

→ bash
{ command: "npm test" }
```

这一次返回：

```text
tests 1
pass 1
fail 0
```

模型现在获得了真实环境反馈：

```text
修改完成
+
测试通过
```

所以不再产生 Tool Call，而是返回最终回答，例如：

```text
已修复 calculator.js 中 add() 的实现：

- 将 a - b 修改为 a + b
- 已重新运行 npm test
- 1 个测试全部通过
```

Agent Loop 到这里结束。

---

这里真正让它成为 Agent 的地方，并不是：

```text
模型会写 calculator.js
```

而是：

> **模型能够根据每一次真实 Tool Result，重新决定下一步应该做什么。**

如果第一次测试没有失败，它可能不会修改。

如果读取以后发现 Bug 在测试代码里，它可能修改另一个文件。

如果修改以后测试仍然失败，它还会继续下一轮。

执行路径并没有提前写死。

---

## 回头看：我们到底实现了什么

这些抽象概念在这里都对应到了具体代码。
下面只看它们在 Coding Agent 中分别如何落地：

| 概念             | 这一篇中的实现                       |
| -------------- | ----------------------------- |
| 指令             | `SYSTEM_PROMPT`               |
| 上下文           | 当前的 `messages + tools`        |
| 工具说明         | `tools` 中的 JSON Schema        |
| 工具调用         | `assistantMessage.tool_calls` |
| 工具执行         | `executeTool()`               |
| 工具结果         | `role: "tool"` Message        |
| 状态             | `messages + step`             |
| Agent 循环       | `while` 循环                    |
| 结束条件         | 没有 Tool Call                  |

如果把这些代码继续压缩，整个最小 Coding Agent 其实就是：

```text
Model
 ↓
Action
 ↓
Observation
 ↓
Model
```

我们没有：

```text
Planner Agent
Reviewer Agent
Memory Agent
复杂 Workflow
向量数据库
MCP
Agent Framework
```

但它已经能够真实完成一个简单 Coding Task。

这也说明：

> **一个 Agent 最核心的骨架，本身并没有想象中那么复杂。**

## 总结

到这里，核心执行链路已经跑通了，你可能会担心我们学的这个只是玩具。

的确，它就是一个玩具，根本达不到生产环境，但是我仍然推荐大家实现一遍。

因为它能够揭开你对Agent底层核心思想的那层面纱。

我希望大家能够在这个最小Coding Agent基础上面产生很多思考，然后再去学习后面的知识，带着问题学习，比如下面这些问题你在实现的时候是否考虑过呢？

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

这些问题不会改变底层的 Agent Loop，
但会决定它能不能稳定地完成更复杂的任务。

后面的文章和栏目会继续围绕这些问题展开，

下一篇我们不再自己增加功能，而是直接去看一个真实的 Coding Agent：

> **Pi 到底在这个最小 Loop 之上，又做了什么？**

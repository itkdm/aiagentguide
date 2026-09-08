---
title: 从零实现一个最小 AI Agent
description: "使用 TypeScript 从零实现一个可以独立运行的最小 AI Agent，通过旅游助手案例理解 Tool Calling、Messages 和 Agent Loop 的实际运行过程。"
summary: 不使用任何 Agent Framework，只用一个 TypeScript 文件实现一个旅游助手 Agent，让模型自主查询模拟天气和景点信息，并根据工具结果完成旅行规划。
keywords:
  - AI Agent 开发
  - 最小 AI Agent
  - Agent Loop
  - Tool Calling
  - TypeScript Agent
  - AI Agent 入门
tags:
  - AI Agent
  - Agent 开发
  - Tool Calling
  - TypeScript
  - 入门
author: 布吉岛
lastUpdated: 2026-09-08
status: published
assets: none
reviewed: false
sourceType: original
draft: false
noindex: false
---

# 从零实现一个最小 AI Agent

## 这次我们要做什么

我们前面已经了解了开发 Agent 时会遇到的一些基本概念。

这一篇不再继续解释概念，直接动手。

我们会用 TypeScript 从零实现一个非常小的**旅游助手 Agent**。

（不会TypeScript也无所谓，我们会在代码中尽可能添加合理的注释）

它可以接收类似这样的需求：

```text
我准备去杭州玩一天。

比较喜欢自然风景和人文景点，不太喜欢纯商业街。
如果下雨，希望多安排一些室内或者受天气影响比较小的地方。

帮我安排一个简单的一日行程。
```

为了完成这个任务，我们会给 Agent 三个工具：

```text
get_weather
→ 查询天气

search_attractions
→ 搜索景点

get_attraction_detail
→ 查询景点详情
```

这里并不会调用真正的天气 API，也不会连接旅游平台，所以你并不用担心数据获取的问题。

所有数据都直接写在代码里模拟，这是完全没有问题的。

因为我们现在真正想实现的是：

```text
用户提出目标
      ↓
模型决定需要什么信息
      ↓
调用工具
      ↓
程序返回真实结果
      ↓
模型根据结果继续判断
      ↓
……
      ↓
完成旅行规划
```

至于工具背后到底调用本地函数、数据库还是第三方 API，并不影响 Agent Loop 本身。

最终整个项目只有：

```text
mini-agent/
├── mini-agent.ts
├── .env
└── package.json
```

核心 Agent 全部放在一个 `mini-agent.ts` 里。

---

## 创建一个最小项目

先创建目录：

```bash
mkdir mini-agent
cd mini-agent

npm init -y
```

安装依赖：

```bash
npm install openai dotenv
npm install -D tsx
```

然后在 `package.json` 中合并加入以下字段：

```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx mini-agent.ts"
  }
}
```

创建 `.env`：

```env
OPENAI_API_KEY=你的 API Key
OPENAI_MODEL=支持 Tool Calling 的模型
```

接下来只需要创建一个：

```text
mini-agent.ts
```

我们从第一行开始写。

---

## 开始写我们的旅游助手 Agent

### 先初始化模型

第一部分很简单。

我们先读取环境变量，然后创建模型客户端：

```typescript
import "dotenv/config";
import OpenAI from "openai";

import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions";

// ========================================
// 1. 初始化模型
// ========================================
//
// OpenAI SDK 这里只负责一件事：调用模型。
//

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL;

// 从环境变量读取 API Key 和模型名称。
// API Key 用来证明身份，模型名称决定本次请求使用哪个模型。
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
```

到这里还没有任何 Agent。

只是完成了：

```text
TypeScript
   ↓
OpenAI SDK
   ↓
模型 API
```

也就是通过这个`client`我们可以调用模型API了，而不需要每调用一次自己手写`http`请求。

接下来开始给模型准备可用的能力。

---

### 先准备三个模拟工具

为了让旅游助手能够制定行程，我们先模拟一些天气和景点数据。

直接继续写：

```typescript
// ========================================
// 2. 准备一小份模拟旅游数据
// ========================================
//
// 为了把注意力放在 Agent 本身，这里不请求真实 API。
//
// 这些数据全部只是教学用模拟数据，
// 不代表景点当前真实开放时间、天气或者旅行建议。

const weatherData = {
  杭州: {
    city: "杭州",
    weather: "小雨",
    temperature: "18~23℃",
    suggestion: "建议携带雨具，可以搭配一些室内行程",
  },
};

const attractions = [
  {
    name: "西湖",
    city: "杭州",
    type: "自然",
    indoor: false,
    duration: "2-3 小时",
    tags: ["自然", "湖景", "户外"],
    description: "适合散步和欣赏自然风景。",
  },
  {
    name: "浙江省博物馆",
    city: "杭州",
    type: "人文",
    indoor: true,
    duration: "2 小时",
    tags: ["人文", "历史", "室内", "博物馆"],
    description: "适合了解当地历史文化。",
  },
  {
    name: "中国丝绸博物馆",
    city: "杭州",
    type: "人文",
    indoor: true,
    duration: "1.5-2 小时",
    tags: ["人文", "丝绸", "室内", "博物馆"],
    description: "以丝绸文化为主题的室内景点。",
  },
  {
    name: "灵隐寺",
    city: "杭州",
    type: "人文",
    indoor: false,
    duration: "2 小时",
    tags: ["人文", "历史", "寺庙"],
    description: "人文氛围比较浓厚的景点。",
  },
];
```

有数据以后，再写真正的三个工具函数：

```typescript
// ========================================
// 3. 实现三个真正会被程序执行的 Tool
// ========================================
//
// 注意：
// 这三个函数现在都只是普通 TypeScript 函数。
// 模型还不知道它们存在。

// 传入城市名称，返回这个城市的模拟天气状态。
function getWeather(city: string) {
  // 用城市名称作为 key，从模拟数据中找到对应天气。
  const weather =
    weatherData[city as keyof typeof weatherData];

  if (!weather) {
    return {
      ok: false,
      message: `暂时没有 ${city} 的模拟天气数据`,
    };
  }

  return {
    ok: true,
    ...weather,
  };
}


// 传入城市名称，返回这个城市的模拟景点列表。
function searchAttractions(city: string) {
  // 工具只负责提供景点信息，具体选择哪些景点交给模型判断。
  const result = attractions.filter(
    (item) => item.city === city,
  );

  return {
    ok: true,
    count: result.length,
    attractions: result.map((item) => ({
      name: item.name,
      type: item.type,
      indoor: item.indoor,
      duration: item.duration,
    })),
  };
}

// 传入景点名称，返回这个景点的详细模拟信息。
function getAttractionDetail(name: string) {
  const attraction = attractions.find(
    (item) => item.name === name,
  );

  if (!attraction) {
    return {
      ok: false,
      message: `没有找到景点：${name}`,
    };
  }

  return {
    ok: true,
    attraction,
  };
}
```

现在我们已经有了：

```text
getWeather()
searchAttractions()
getAttractionDetail()
```

但模型依然不知道这些函数存在。

模型看不到我们的 TypeScript 源代码。

所以还需要做下一件事：

> **把这些工具描述给模型。**

---

### 把工具描述给模型

继续往下写：

```typescript
// ========================================
// 4. 定义 Tool Schema
// ========================================
//
// 上面的三个函数是真正被程序执行的 Tool。
//
// 但模型需要另外一份能够读懂的“工具说明书”：
//
// - 工具叫什么
// - 能解决什么问题
// - 调用时应该提供哪些参数
//
// 这就是 Tool Schema。

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      // name 是模型调用时使用的工具名称。
      name: "get_weather",
      // description 帮助模型判断什么时候应该调用这个工具。
      description:
        "查询指定城市的模拟天气信息。规划旅行时，如果天气可能影响行程，可以使用这个工具。",
      strict: true,
      parameters: {
        // parameters 描述模型调用工具时必须传入什么参数。
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "需要查询天气的城市",
          },
        },
        required: ["city"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function",
    function: {
      name: "search_attractions",
      description:
        "查询指定城市的模拟景点列表。",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "旅游城市",
          },
        },
        required: ["city"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function",
    function: {
      name: "get_attraction_detail",
      description:
        "查询某个景点的模拟详细信息，例如类型、是否室内、建议游玩时长等。",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "景点名称",
          },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
];
```

这里就出现了一个很重要的对应关系：

```text
程序代码真正执行
getWeather()

        ↕

模型看到
get_weather Tool Schema
```

也就是：

```text
Tool Implementation
→ 给程序使用

Tool Schema
→ 给模型使用
```

Tool Schema 并不会执行天气查询。

它只是让模型知道：

> “如果需要天气信息，可以用这个格式请求调用 `get_weather`。”

---

### 写一个最小 System Prompt

现在模型知道有哪些工具了。

接下来告诉它：

> 自己到底在做什么。

```typescript
// ========================================
// 5. 写一个最小 System Prompt
// ========================================
//
// 这里没有规定：
// “第一步必须查天气，第二步必须查景点。”
//
// 我们只定义目标、规则和边界。
// 真正的执行顺序由模型自己判断。

const SYSTEM_PROMPT = `
你是一个旅游规划 Agent。

你的任务是根据用户的目的地、时间和旅行偏好，
帮助用户制定一个简单、合理的旅行计划。

你可以使用工具查询天气、搜索景点和查看景点详情。

要求：
- 需要天气或景点信息时，优先使用工具获取，不要自己编造。
- 根据已经获得的信息判断下一步，不需要机械调用所有工具。
- 如果工具返回的信息还不够，可以继续调用其他工具。
- 当信息已经足够时，停止调用工具并给出最终旅行计划。
- 回答保持简洁、实用。
`.trim();
```

这里尤其值得注意的是：

```text
第一步查天气
第二步搜索景点
第三步查询详情
```

这些都**没有写进 Prompt**。

否则我们的程序只是换了一种方式把流程提前规定好了。

现在我们只提供：

```text
目标
+
工具
+
基本规则
```

下一步怎么做，留给模型自己决定。

---

### 把 Tool Call 和真正的函数连接起来

现在有：

```text
Tool Schema
```

也有：

```text
Tool Implementation
```

还需要在中间加一个很简单的分发函数。

```typescript
// ========================================
// 6. 根据模型返回的 Tool Call，执行真正的函数
// ========================================
//
// 模型可能返回：
//
// get_weather({ city: "杭州" })
//
// 但模型不会真的执行 getWeather()。
//
// 这里才是宿主程序真正调用 TypeScript 函数的地方。

async function executeTool(
  name: string,
  args: Record<string, unknown>,
) {
  switch (name) {
    case "get_weather":
      return getWeather(
        String(args.city ?? ""),
      );

    case "search_attractions":
      return searchAttractions(
        String(args.city ?? ""),
      );

    case "get_attraction_detail":
      return getAttractionDetail(
        String(args.name ?? ""),
      );

    default:
      return {
        ok: false,
        message: `Unknown tool: ${name}`,
      };
  }
}
```

到这里，大部分零件其实我们已经准备好了：

```text
Model
Tools
System Prompt
executeTool()
```

现在只剩下最关键的一部分：

> **把它们循环起来。**

---

## 写出最小 Agent Loop

继续在同一个文件里写：

```typescript
// ========================================
// 7. 写出真正的 Agent Loop
// ========================================
//
// 前面的代码都只是 Agent 的零件。
// 从这里开始，它们才真正组合成一个 Agent。
//
// 每一轮主要做四件事：
//
// 1. 把当前 Messages 和 Tools 交给模型
// 2. 模型决定下一步
// 3. 如果模型调用 Tool，就执行 Tool
// 4. 把 Tool Result 放回 Messages，再进入下一轮

// 传入用户的旅行需求，运行 Agent，最后返回模型生成的旅行计划。
async function runAgent(task: string) {
  // messages ：每轮模型回复和工具结果都会追加到这里。
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

  // 只要模型还在调用工具，就继续推进；模型直接回答时，循环结束。
  let step = 1;
  while (true) {
    console.log(
      `\n========== Step ${step} ==========`,
    );

    // 把当前对话和工具说明交给模型，由模型决定下一步怎么做。

    const response =
      await client.chat.completions.create({
        model,
        messages,
        tools,
        tool_choice: "auto",
      });

    const assistant =
      response.choices[0]?.message;

    if (!assistant) {
      throw new Error(
        "Model returned no assistant message",
      );
    }

    // 模型可能会输出一些当前进度说明。
    if (assistant.content) {
      console.log(
        `\nAgent:\n${assistant.content}`,
      );
    }

    // ------------------------------------
    // 保存模型这一轮的回复，下一轮模型才能知道之前发生了什么。
    // ------------------------------------
    //
    // 后面再次调用模型时，
    // 模型需要知道自己之前做过什么。

    messages.push({
      role: "assistant",
      content: assistant.content,
      tool_calls: assistant.tool_calls,
    });

    const toolCalls =
      assistant.tool_calls ?? [];

    // ------------------------------------
    // 没有新的 Tool Call，说明模型选择直接回答，任务在这里结束。
    // ------------------------------------
    //
    // 在这个最小 Agent 中，
    // 说明当前已经没有新的外部动作需要执行，
    // 这次 Agent Run 到这里结束。

    if (toolCalls.length === 0) {
      return (
        assistant.content ??
        "Agent 已完成任务。"
      );
    }

    // ------------------------------------
    // 执行模型请求的 Tool
    // ------------------------------------

    for (const toolCall of toolCalls) {
      if (
        toolCall.type !== "function"
      ) {
        continue;
      }

      // args 是模型为当前工具生成的参数，例如 { city: "杭州" }。
      let args:
        Record<string, unknown>;

      try {
        args = JSON.parse(
          toolCall.function.arguments,
        );
      } catch {
        args = {};
      }

      console.log(
        `\nTool: ${toolCall.function.name}`,
      );
      console.log(args);

      // 根据工具名称执行真正的 TypeScript 函数。
      const result =
        await executeTool(
          toolCall.function.name,
          args,
        );

      console.log(
        "\nTool Result:",
      );
      console.log(
        JSON.stringify(
          result,
          null,
          2,
        ),
      );

      // ----------------------------------
      // 把工具结果写回 messages，下一轮模型才能根据真实结果继续判断。
      // ----------------------------------
      //
      // 这一句非常关键。
      //
      // 模型下一轮必须看到真实工具结果，
      // 才能根据新信息继续判断下一步。

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    step++;
  }
}
```

到这里，其实我们已经把 Agent 写完了。

最核心的部分其实只有：

```typescript
for (...) {
  const response = await model(...);

  if (没有 Tool Call) {
    return response;
  }

  for (const toolCall of toolCalls) {
    const result =
      await executeTool(toolCall);

    messages.push(result);
  }
}
```

也就是：

```text
Model
  ↓
Tool Call
  ↓
Tool
  ↓
Tool Result
  ↓
Messages
  ↓
Model
```

前面文章里看到的 Agent Loop，到这里已经真正变成代码了。

---

## 接收用户输入并启动 Agent

最后再补一点启动代码：

```typescript
// ========================================
// 8. 接收用户输入并启动 Agent
// ========================================

import {
  createInterface,
} from "node:readline/promises";

import {
  stdin as input,
  stdout as output,
} from "node:process";

const readline = createInterface({
  input,
  output,
});

const task = await readline.question(
  `
请输入旅游需求：

> `,
);

readline.close();

if (!task.trim()) {
  throw new Error(
    "旅行需求不能为空",
  );
}

const result =
  await runAgent(task);

console.log(
  "\n========== 最终结果 ==========\n",
);

console.log(result);
```

现在整个 `mini-agent.ts` 就写完了。

---

## 完整代码

如果不想跟着前面一步一步写，也可以直接复制下面的完整版本。

```typescript
import "dotenv/config";
import OpenAI from "openai";

import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions";

import {
  createInterface,
} from "node:readline/promises";

import {
  stdin as input,
  stdout as output,
} from "node:process";

// ========================================
// 1. 初始化模型
// ========================================

// 从环境变量读取访问模型所需的配置。
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

// ========================================
// 2. 准备模拟旅游数据
// ========================================
//
// 这里只用于演示 Agent。
// 数据不代表真实天气、开放时间或旅行建议。
//
// 这些对象就是工具要查询的“假数据”，
// 这样可以专注观察 Agent Loop，而不用先接入真实旅游 API。

const weatherData = {
  杭州: {
    city: "杭州",
    weather: "小雨",
    temperature: "18~23℃",
    suggestion:
      "建议携带雨具，可以搭配一些室内行程",
  },
};

const attractions = [
  {
    name: "西湖",
    city: "杭州",
    type: "自然",
    indoor: false,
    duration: "2-3 小时",
    tags: ["自然", "湖景", "户外"],
    description:
      "适合散步和欣赏自然风景。",
  },
  {
    name: "浙江省博物馆",
    city: "杭州",
    type: "人文",
    indoor: true,
    duration: "2 小时",
    tags: [
      "人文",
      "历史",
      "室内",
      "博物馆",
    ],
    description:
      "适合了解当地历史文化。",
  },
  {
    name: "中国丝绸博物馆",
    city: "杭州",
    type: "人文",
    indoor: true,
    duration: "1.5-2 小时",
    tags: [
      "人文",
      "丝绸",
      "室内",
      "博物馆",
    ],
    description:
      "以丝绸文化为主题的室内景点。",
  },
  {
    name: "灵隐寺",
    city: "杭州",
    type: "人文",
    indoor: false,
    duration: "2 小时",
    tags: ["人文", "历史", "寺庙"],
    description:
      "人文氛围比较浓厚的景点。",
  },
];

// ========================================
// 3. 实现真正的 Tool
// ========================================

// 传入城市名称，返回对应的模拟天气。
function getWeather(city: string) {
  const weather =
    weatherData[
      city as keyof typeof weatherData
    ];

  if (!weather) {
    return {
      ok: false,
      message:
        `暂时没有 ${city} 的模拟天气数据`,
    };
  }

  return {
    ok: true,
    ...weather,
  };
}

// 传入城市名称，返回这个城市的模拟景点列表。
function searchAttractions(city: string) {
  // 工具只负责提供景点信息，具体选择哪些景点交给模型判断。
  const result = attractions.filter(
    (item) => item.city === city,
  );

  return {
    ok: true,
    count: result.length,
    attractions: result.map(
      (item) => ({
        name: item.name,
        type: item.type,
        indoor: item.indoor,
        duration: item.duration,
      }),
    ),
  };
}

// 传入景点名称，返回这个景点的详细模拟信息。
function getAttractionDetail(
  name: string,
) {
  const attraction =
    attractions.find(
      (item) =>
        item.name === name,
    );

  if (!attraction) {
    return {
      ok: false,
      message:
        `没有找到景点：${name}`,
    };
  }

  return {
    ok: true,
    attraction,
  };
}

// ========================================
// 4. 把 Tool 描述给模型
// ========================================

// 这里不是实现工具，而是告诉模型：
// 工具叫什么、什么时候用、需要哪些参数。
const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description:
        "查询指定城市的模拟天气信息。规划旅行时，如果天气可能影响行程，可以使用这个工具。",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description:
              "需要查询天气的城市",
          },
        },
        required: ["city"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function",
    function: {
      name: "search_attractions",
      description:
        "查询指定城市的模拟景点列表。",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description:
              "旅游城市",
          },
        },
        required: [
          "city",
        ],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function",
    function: {
      name:
        "get_attraction_detail",
      description:
        "查询某个景点的模拟详细信息。",
      strict: true,
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description:
              "景点名称",
          },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
];

// ========================================
// 5. System Prompt
// ========================================
//
// 不规定固定执行步骤。
// 只告诉 Agent：目标、能力和基本规则。

const SYSTEM_PROMPT = `
你是一个旅游规划 Agent。

你的任务是根据用户的目的地、时间和旅行偏好，
帮助用户制定一个简单、合理的旅行计划。

你可以使用工具查询天气、搜索景点和查看景点详情。

要求：
- 需要天气或景点信息时，优先使用工具获取，不要自己编造。
- 根据已经获得的信息判断下一步，不需要机械调用所有工具。
- 如果工具返回的信息还不够，可以继续调用其他工具。
- 当信息已经足够时，停止调用工具并给出最终旅行计划。
- 回答保持简洁、实用。
`.trim();

// ========================================
// 6. 执行模型选择的 Tool
// ========================================

// 模型只会返回工具名称和参数，
// 这个函数负责把它们转成真正的函数调用。
async function executeTool(
  name: string,
  args: Record<
    string,
    unknown
  >,
) {
  // name 来自模型返回的 Tool Call。
  // 这里根据名称找到真正要执行的 TypeScript 函数。
  switch (name) {
    case "get_weather":
      return getWeather(
        String(
          args.city ?? "",
        ),
      );

    case "search_attractions":
      return searchAttractions(
        String(
          args.city ?? "",
        ),
      );

    case "get_attraction_detail":
      return getAttractionDetail(
        String(
          args.name ?? "",
        ),
      );

    default:
      return {
        ok: false,
        message:
          `Unknown tool: ${name}`,
      };
  }
}

// ========================================
// 7. Agent Loop
// ========================================

async function runAgent(
  task: string,
) {
  // messages 保存到目前为止发生的所有对话：
  // 用户任务、模型的 Tool Call，以及工具返回的结果都会放进来。
  const messages:
    ChatCompletionMessageParam[] =
    [
      {
        role: "developer",
        content:
          SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: task,
      },
    ];

  // 只要模型还在调用工具，就继续推进；模型直接回答时，循环结束。
  let step = 1;
  while (true) {
    console.log(
      `\n========== Step ${step} ==========`,
    );

    // 每一轮都把当前对话和工具说明交给模型，
    // 让模型根据最新信息决定下一步。
    const response =
      await client.chat.completions.create({
        model,
        messages,
        tools,
        tool_choice:
          "auto",
      });

    const assistant =
      response.choices[0]
        ?.message;

    if (!assistant) {
      throw new Error(
        "Model returned no assistant message",
      );
    }

    if (
      assistant.content
    ) {
      console.log(
        `\nAgent:\n${assistant.content}`,
      );
    }

    // 保存模型本轮的回复，下一轮模型才能知道自己刚才做了什么。
    messages.push({
      role: "assistant",
      content:
        assistant.content,
      tool_calls:
        assistant.tool_calls,
    });

    const toolCalls =
      assistant.tool_calls ??
      [];

    // 没有 Tool Call，说明模型选择直接回答，任务在这里结束。
    if (
      toolCalls.length === 0
    ) {
      return (
        assistant.content ??
        "Agent 已完成任务。"
      );
    }

    // 执行模型选择的 Tool。
    for (
      const toolCall
      of toolCalls
    ) {
      if (
        toolCall.type !==
        "function"
      ) {
        continue;
      }

      // args 是模型为这个工具生成的参数，例如 { city: "杭州" }。
      let args:
        Record<
          string,
          unknown
        >;

      try {
        args =
          JSON.parse(
            toolCall
              .function
              .arguments,
          );
      } catch {
        args = {};
      }

      console.log(
        `\nTool: ${toolCall.function.name}`,
      );
      console.log(args);

      // executeTool 调用真正的函数，得到工具执行结果。
      const result =
        await executeTool(
          toolCall
            .function
            .name,
          args,
        );

      console.log(
        "\nTool Result:",
      );

      console.log(
        JSON.stringify(
          result,
          null,
          2,
        ),
      );

      // 把真实结果返回给模型。
      //
      // 下一轮模型会看到这个结果，
      // 再决定下一步做什么。
      // 把工具结果放回 messages，下一轮模型才能看到真实反馈。
      messages.push({
        role: "tool",
        tool_call_id:
          toolCall.id,
        content:
          JSON.stringify(
            result,
          ),
      });
    }

    step++;
  }
}

// ========================================
// 8. 启动 Agent
// ========================================

const readline =
  createInterface({
    input,
    output,
  });

const task =
  await readline.question(
    `
请输入旅游需求：

> `,
  );

readline.close();

if (!task.trim()) {
  throw new Error(
    "旅行需求不能为空",
  );
}

const result =
  await runAgent(task);

console.log(
  "\n========== 最终结果 ==========\n",
);

console.log(result);
```

---

## 跑一次看看

运行：

```bash
npm run dev
```

然后输入：

```text
我准备去杭州玩一天。

比较喜欢自然风景和人文景点，不太喜欢纯商业街。
如果下雨，希望多安排一些室内或者受天气影响比较小的地方。

帮我安排一个简单的一日行程。
```
执行过程比如：

```text
========== Step 1 ==========

Agent:
我先确认一下杭州的天气情况。

Tool: get_weather
{
  city: "杭州"
}

Tool Result:
{
  "ok": true,
  "city": "杭州",
  "weather": "小雨",
  "temperature": "18~23℃",
  "suggestion": "建议携带雨具，可以搭配一些室内行程"
}
```

模型现在知道：

```text
杭州
+
小雨
+
用户喜欢自然和人文
+
下雨时希望增加室内行程
```

下一轮可能继续：

```text
========== Step 2 ==========

Agent:
当天有小雨，我先查询杭州有哪些景点，
再结合天气和你的偏好进行选择。

Tool: search_attractions
{
  city: "杭州",
}
```

返回：

```text
浙江省博物馆
中国丝绸博物馆
……
```

工具只负责返回杭州的景点信息。

模型会结合用户的偏好和刚才查到的天气，
从这些结果中判断哪些景点更适合当天的行程。

模型也可能继续查询某个景点：

```text
========== Step 3 ==========

Tool: get_attraction_detail
{
  name: "浙江省博物馆"
}
```

然后根据已经获得的信息生成最终行程：

```text
========== Step 4 ==========

Agent:

可以这样安排一天：

上午：
浙江省博物馆，以室内人文行程为主。

中午：
在附近用餐并休息。

下午：
根据降雨情况前往西湖短途游览。
如果雨势较大，可以改为中国丝绸博物馆。

整体安排以人文和自然景观为主，
同时给下雨天气留出了调整空间。
```

到这里，这次 Agent Run 就完成了。

---

## 回头看：这个 Agent 到底做了什么

现在再回头看整个程序。

我们真正写死的东西只有：

```text
用户目标

System Prompt

3 个 Tool

Messages

Agent Loop
```

但是代码里并没有：

```typescript
先调用 get_weather();

如果下雨：
    搜索室内景点;

然后：
    查询景点详情;

最后：
    生成旅行计划;
```

也没有规定：

```text
Step 1 必须查询天气

Step 2 必须搜索景点

Step 3 必须查询详情
```

程序真正做的是：

```text
把当前信息交给模型
        ↓
模型决定下一步
        ↓
执行模型选择的 Tool
        ↓
得到真实 Tool Result
        ↓
把 Result 交回模型
        ↓
模型重新决定
```

如果把我们的 `runAgent()` 再压缩一下：

```typescript
while (任务继续) {
  const response =
    await model(
      messages,
      tools,
    );

  if (
    response 有 Tool Call
  ) {
    const result =
      await executeTool(
        response.toolCall,
      );

    messages.push(result);

    continue;
  }

  return response;
}
```
---

## 总结

这一篇最终只用了一个 TypeScript 文件，就实现了一个最小旅游助手 Agent。

我们给它提供了：

```text
System Prompt
+
get_weather
+
search_attractions
+
get_attraction_detail
+
Messages
+
Agent Loop
```

然后把具体执行路径交给模型自己判断。

虽然三个 Tool 背后使用的只是本地模拟数据，但如果以后把：

```typescript
getWeather()
```

替换成真实天气 API，把：

```typescript
searchAttractions()
```

替换成搜索服务或者数据库查询：

```text
Agent Loop 本身几乎不需要改变。
```

到这里，我们已经第一次真正把一个 Agent 从概念变成了可以运行的代码。

下一步再去做 Coding Agent，就会简单很多。

因为核心结构并不会发生变化。

我们只是把：

```text
get_weather
search_attractions
get_attraction_detail
```

换成 Coding Agent 真正需要的：

```text
read
write
edit
bash
```

然后继续沿用同一个 Agent Loop。

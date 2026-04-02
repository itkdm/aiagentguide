---
title: Tool calling
description: 用丰富且类型安全的 UI 卡片展示 Agent 的工具调用
---

# Tool calling

Agent 可以调用外部工具，例如天气 API、计算器、网络搜索和数据库查询。默认情况下，这些结果通常是原始 JSON。这个模式展示了如何把它们渲染成结构化、类型安全的 UI 卡片，并处理 loading 与 error 状态。

## Tool calling 的工作方式

当 LangGraph Agent 认为它需要外部信息时，会在 `AIMessage` 中发出一个或多个 tool call。

每个 tool call 通常包含：

- `name`：工具名，例如 `get_weather`
- `args`：结构化参数
- `id`：唯一标识，用于把调用和返回结果对应起来

Agent runtime 执行工具后，会生成对应的 `ToolMessage`。而 `useStream` 会把这一整套过程统一整理成一个可直接渲染的 `toolCalls` 数组。

## 配置 useStream

前端第一步仍然是把 `useStream` 指向 Agent 后端。

### React

```tsx
import { useStream } from "@langchain/react";

const AGENT_URL = "http://localhost:2024";

export function Chat() {
  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "tool_calling",
  });

  return (
    <div>
      {stream.messages.map((msg) => (
        <Message key={msg.id} message={msg} toolCalls={stream.toolCalls} />
      ))}
    </div>
  );
}
```

## ToolCallWithResult 类型

`toolCalls` 数组中的每一项通常可以理解为：

```ts
interface ToolCallWithResult {
  call: {
    id: string;
    name: string;
    args: Record<string, unknown>;
  };
  result: ToolMessage | undefined;
  state: "pending" | "completed" | "error";
}
```

字段含义：

- `call.id`：唯一 ID
- `call.name`：工具名
- `call.args`：工具参数
- `result`：工具结果
- `state`：执行状态

## 按 message 过滤工具调用

一个 `AIMessage` 可能触发多个工具调用，而整段对话中也可能包含多个 `AIMessage`。要把工具卡片渲染到正确消息下面，可以通过 `call.id` 与 message 的 `tool_calls` 对应。

```tsx
function Message({
  message,
  toolCalls,
}: {
  message: AIMessage;
  toolCalls: ToolCallWithResult[];
}) {
  const messageToolCalls = toolCalls.filter((tc) =>
    message.tool_calls?.find((t) => t.id === tc.call.id)
  );

  return (
    <div>
      <p>{message.content}</p>
      {messageToolCalls.map((tc) => (
        <ToolCard key={tc.call.id} toolCall={tc} />
      ))}
    </div>
  );
}
```

## 构建专用工具卡片

不要直接把 JSON 原样输出。更好的方式是按工具类型构建专门的 UI 组件。

```tsx
function ToolCard({ toolCall }: { toolCall: ToolCallWithResult }) {
  if (toolCall.state === "pending") {
    return <LoadingCard name={toolCall.call.name} />;
  }

  if (toolCall.state === "error") {
    return <ErrorCard name={toolCall.call.name} error={toolCall.result} />;
  }

  switch (toolCall.call.name) {
    case "get_weather":
      return <WeatherCard args={toolCall.call.args} result={toolCall.result} />;
    case "calculator":
      return <CalculatorCard args={toolCall.call.args} result={toolCall.result} />;
    case "web_search":
      return <SearchCard args={toolCall.call.args} result={toolCall.result} />;
    default:
      return <GenericToolCard toolCall={toolCall} />;
  }
}
```

### 天气卡片示例

```tsx
function WeatherCard({
  args,
  result,
}: {
  args: { location: string };
  result: ToolMessage;
}) {
  const data = JSON.parse(result.content as string);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <CloudIcon />
        <h3 className="font-semibold">{args.location}</h3>
      </div>
      <div className="mt-2 text-3xl font-bold">{data.temperature}°F</div>
      <p className="text-muted-foreground">{data.condition}</p>
    </div>
  );
}
```

### Loading 与 error 状态

务必显式处理 `pending` 和 `error`。

```tsx
function LoadingCard({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border p-4 animate-pulse">
      <Spinner />
      <span>正在执行 {name}...</span>
    </div>
  );
}

function ErrorCard({ name, error }: { name: string; error?: ToolMessage }) {
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 p-4">
      <h3 className="font-semibold text-red-700">{name} 执行失败</h3>
      <p className="text-sm text-red-600">
        {error?.content ?? "工具执行失败"}
      </p>
    </div>
  );
}
```

## 类型安全的工具参数

如果你的工具本身用结构化 schema 定义，可以利用 `ToolCallFromTool` 获取类型安全的 `args`。

```ts
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const getWeather = tool(async ({ location }) => { /* ... */ }, {
  name: "get_weather",
  description: "获取某地当前天气",
  schema: z.object({
    location: z.string().describe("城市名"),
  }),
});

type WeatherToolCall = ToolCallFromTool<typeof getWeather>;
```

这样如果工具 schema 改了，前端组件也会立刻暴露类型错误。

## 与流式文本一起渲染

工具调用常常会和流式文本交织出现。`useStream` 会保持 `toolCalls` 与消息流同步，因此：

1. Agent 一发出 tool call，就能先出现 loading 卡片
2. 工具完成后，卡片再更新为正式结果

用户可以清楚看到 Agent 正在做什么。

## 并发工具调用

Agent 可能同时调用多个工具。你的 UI 应该允许多个 `pending` 卡片同时存在，并分别在完成后独立更新。

```tsx
function ToolCallList({ toolCalls }: { toolCalls: ToolCallWithResult[] }) {
  const pending = toolCalls.filter((tc) => tc.state === "pending");
  const completed = toolCalls.filter((tc) => tc.state === "completed");

  return (
    <div className="space-y-2">
      {completed.map((tc) => (
        <ToolCard key={tc.call.id} toolCall={tc} />
      ))}
      {pending.map((tc) => (
        <LoadingCard key={tc.call.id} name={tc.call.name} />
      ))}
    </div>
  );
}
```

## 最佳实践

- 始终处理 `pending`、`completed`、`error`
- 安全解析结果，必要时用 `try/catch`
- 给未知工具准备通用 fallback 卡片
- loading 状态下展示工具名和参数
- 卡片尽量紧凑，避免压过聊天主内容

---
title: Markdown messages
description: 将 LLM 响应渲染为支持流式更新的富格式 Markdown
---

# Markdown messages

LLM 天然会输出 markdown 格式文本，例如：

- 标题
- 列表
- 代码块
- 表格
- 行内格式

如果把这些内容当纯文本渲染，就浪费了模型已经提供的结构。这一模式展示了如何在响应从 Agent 流式到达时，实时解析并渲染 markdown。

## Markdown 渲染的工作方式

整个渲染流程通常分 3 步：

1. **接收**：`useStream` 会把流式文本持续累积到 `msg.text`
2. **解析**：使用 markdown 解析器把原始文本转成 HTML 或组件树
3. **渲染**：把解析结果显示到 DOM 中

对于聊天长度的内容，这个过程通常足够快。

## 配置 useStream

Markdown 消息模式本身不需要特别的 Agent 配置，只需要把 `useStream` 指向你的 Agent 后端即可。

### Python 后端对应的类型定义

```ts
import type { BaseMessage } from "@langchain/core/messages";

interface AgentState {
  messages: BaseMessage[];
}
```

### JavaScript / TypeScript

```ts
import type { myAgent } from "./agent";
```

### React

```tsx
import { useStream } from "@langchain/react";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

const AGENT_URL = "http://localhost:2024";

export function Chat() {
  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "simple_agent",
  });

  return (
    <div>
      {stream.messages.map((msg) => {
        if (AIMessage.isInstance(msg)) {
          return <Markdown key={msg.id}>{msg.text}</Markdown>;
        }
        if (HumanMessage.isInstance(msg)) {
          return <p key={msg.id}>{msg.text}</p>;
        }
      })}
    </div>
  );
}
```

## 选择 markdown 库

常见推荐如下：

| 框架 | 推荐库 | 输出形式 | 原因 |
|---|---|---|---|
| React | `react-markdown` + `remark-gfm` | React elements | 不需要 `dangerouslySetInnerHTML` |
| Vue | `marked` + `dompurify` | `v-html` | 简洁、轻量 |
| Svelte | `marked` + `dompurify` | `{@html}` | 与 Vue 类似 |
| Angular | `marked` + `dompurify` | `[innerHTML]` | 常见组合 |

> [!TIP]
> React 的 `react-markdown` 会直接生成 React elements，因此通常不需要额外 HTML sanitize。  
> Vue、Svelte、Angular 在注入 HTML 时，建议始终用 `dompurify` 做清洗。

## 构建 Markdown 组件

### React

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
```

### Vue

```vue
<script setup lang="ts">
import { computed, useSlots } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({ gfm: true, breaks: true });

const slots = useSlots();

const html = computed(() => {
  const slot = slots.default?.();
  const text = slot
    ?.map((vnode) =>
      typeof vnode.children === "string" ? vnode.children : ""
    )
    .join("") ?? "";
  if (!text) return "";
  return DOMPurify.sanitize(marked.parse(text) as string);
});
</script>

<template>
  <div class="markdown-content" v-html="html" />
</template>
```

### Svelte

```svelte
<script lang="ts">
  import { marked } from "marked";
  import DOMPurify from "dompurify";

  let { content }: { content: string } = $props();

  marked.setOptions({ gfm: true, breaks: true });

  let html = $derived.by(() => {
    if (!content) return "";
    return DOMPurify.sanitize(marked.parse(content) as string);
  });
</script>

<div class="markdown-content">
  {@html html}
</div>
```

## HTML 安全清洗

如果你使用的是原始 HTML 注入方式，例如：

- `v-html`
- `{@html}`
- `[innerHTML]`

那么一定要先做 HTML sanitize，避免 XSS。

```ts
import DOMPurify from "dompurify";

const safeHtml = DOMPurify.sanitize(rawHtml);
```

DOMPurify 会移除：

- `<script>`
- `onclick`
- `javascript:` URL
- 其他常见 XSS 向量

## 流式渲染注意事项

`useStream` 会随着 token 到来持续更新 `msg.text`。Markdown 组件也会在每次更新后重新解析。

对于典型聊天消息，这通常性能足够好。只有在特别长的消息里，才需要考虑：

- 节流渲染
- 增量解析

大多数聊天应用不需要过早优化。

## Markdown 样式

可以给 `.markdown-content` 定义紧凑样式，例如：

```css
.markdown-content p {
  margin: 0.4em 0;
}

.markdown-content ul,
.markdown-content ol {
  margin: 0.4em 0;
  padding-left: 1.4em;
}

.markdown-content pre {
  overflow-x: auto;
  border-radius: 0.375rem;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  font-size: 0.75rem;
}

.markdown-content code {
  border-radius: 0.25rem;
  background: rgba(0, 0, 0, 0.08);
  padding: 0.125rem 0.25rem;
  font-size: 0.75rem;
}
```

> [!TIP]
> 聊天气泡里的 markdown 样式应尽量紧凑，不要照搬博客正文那种大段留白布局。

## 最佳实践

- 使用 HTML 注入时始终 sanitize
- 开启 GFM
- 对空字符串做好处理
- 对单换行启用 `breaks: true`
- 为聊天场景设计紧凑样式
- 用标题、嵌套列表、长代码块和表格做实际测试

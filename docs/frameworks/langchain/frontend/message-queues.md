---
title: 消息队列
description: 在 Agent 按顺序处理时排队多条消息，并管理等待中的消息
---

# 消息队列

消息队列允许用户在 Agent 还没处理完当前消息时，连续快速发送多条消息，而不必等待上一轮结束。每条消息都会在服务端进入队列，并按顺序依次处理，你可以完整地看到并管理等待中的消息队列。

## 为什么需要消息队列？

在典型的聊天界面里，用户通常必须等待 Agent 回复完成之后，才能继续发送下一条消息。这会在很多场景下造成摩擦：

- 批量提问：用户想一次性提出多个相关问题，而不是一个答完再问下一个。
- 连续追问：在 Agent 还在处理时就补充说明或增加上下文。
- 自动化测试序列：以编程方式连续发送一组提示，验证 Agent 行为。
- 数据录入工作流：把结构化输入逐条提交给 Agent 处理。

## 工作原理

LangGraph 在底层使用 `multitaskStrategy: "enqueue"` 来管理并发提交。当 Agent 已经在处理某条消息时，后续提交的消息会被加入服务端队列。当前运行结束后，队列里的下一条消息会自动开始处理。

`useStream` 暴露了一个 `queue` 属性，可以实时查看等待中的消息：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `queue.entries` | `QueueEntry[]` | 当前队列中所有等待项的数组 |
| `queue.size` | `number` | 当前队列中的条目数量 |
| `queue.cancel(id)` | `(id: string) => Promise<void>` | 按 ID 取消某个队列项 |
| `queue.clear()` | `() => Promise<void>` | 清空所有等待中的队列项 |

## 配置 `useStream`

```ts
import type { BaseMessage } from "@langchain/core/messages";

interface AgentState {
  messages: BaseMessage[];
}
```

```tsx
import { useStream } from "@langchain/react";

function Chat() {
  const stream = useStream<typeof myAgent>({
    apiUrl: "http://localhost:2024",
    assistantId: "message_queue",
  });

  const handleSubmit = (text: string) => {
    stream.submit({
      messages: [{ type: "human", content: text }],
    });
  };

  const pendingCount = stream.queue.size;
  const entries = stream.queue.entries;

  return (
    <div>
      <MessageList messages={stream.messages} />
      {pendingCount > 0 && <QueueList entries={entries} queue={stream.queue} />}
      <ChatInput onSubmit={handleSubmit} />
    </div>
  );
}
```

## 显示队列

```tsx
function QueueList({ entries, queue }) {
  return (
    <div className="queue-panel">
      <div className="queue-header">
        <span>等待中的消息（{entries.length}）</span>
        <button onClick={() => queue.clear()}>全部清空</button>
      </div>
      <ul className="queue-entries">
        {entries.map((entry) => {
          const text = entry.values?.messages?.[0]?.content ?? "未知内容";
          return (
            <li key={entry.id} className="queue-entry">
              <span className="queue-text">{text}</span>
              <span className="queue-time">
                {new Date(entry.createdAt).toLocaleTimeString()}
              </span>
              <button
                className="queue-cancel"
                onClick={() => queue.cancel(entry.id)}
              >
                取消
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

> [!TIP]
> 给每条排队消息显示一个简短预览，这样用户不必通读完整内容，就能快速识别并取消目标消息。

## 取消排队中的消息

取消单个条目：

```ts
await queue.cancel(entryId);
```

清空整个队列：

```ts
await queue.clear();
```

> [!NOTE]
> 取消队列项只会影响那些还没有开始处理的消息。如果 Agent 已经开始处理某条消息，那么从队列里取消它不会生效。要中断当前正在运行的任务，应使用 `stream.stop()`。

## 使用 `onCreated` 串联后续提交

```ts
stream.submit(
  { messages: [{ type: "human", content: "什么是量子计算？" }] },
  {
    onCreated(run) {
      console.log("运行已创建：", run.run_id);
      stream.submit({
        messages: [{ type: "human", content: "请给我一个通俗类比。" }],
      });
    },
  }
);
```

## 开启新线程

```tsx
function NewThreadButton() {
  const stream = useStream<typeof myAgent>({ /* ... */ });

  return (
    <button onClick={() => stream.switchThread(null)}>
      新对话
    </button>
  );
}
```

## 完整示例

```tsx
function QueueChat() {
  const stream = useStream<typeof myAgent>({
    apiUrl: "http://localhost:2024",
    assistantId: "message_queue",
  });

  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim()) return;
    stream.submit({
      messages: [{ type: "human", content: input.trim() }],
    });
    setInput("");
  };

  return (
    <div className="chat-container">
      <header>
        <h2>队列聊天</h2>
        <button onClick={() => stream.switchThread(null)}>新线程</button>
      </header>

      <div className="messages">
        {stream.messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {stream.isLoading && <TypingIndicator />}
      </div>

      {stream.queue.size > 0 && (
        <div className="queue-panel">
          <strong>排队中（{stream.queue.size}）</strong>
          <button onClick={() => stream.queue.clear()}>全部清空</button>
          {stream.queue.entries.map((entry) => (
            <div key={entry.id} className="queue-item">
              <span>{entry.values?.messages?.[0]?.content}</span>
              <button onClick={() => stream.queue.cancel(entry.id)}>移除</button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息（可以连续发送多条）"
        />
        <button type="submit">发送</button>
      </form>
    </div>
  );
}
```

## 最佳实践

- 限制队列大小，避免用户体验下降。
- 显示队列位置，让用户知道处理顺序。
- 提交后保持输入框焦点。
- 给队列进入和退出添加平滑过渡。
- 对失败消息做错误展示，但不要阻塞后续队列项。
- 对自动化高频提交增加一点节流。

---
title: 加入与重新加入流
description: 从正在运行的 Agent 流中断开，并在之后重新连接
---

# 加入与重新加入流

加入与重新加入（join & rejoin）允许你在不中止 Agent 的情况下，从一个正在运行的流中断开客户端连接，并在稍后重新连回去。即使客户端离开，Agent 仍会在服务端继续执行；当你重新连接时，可以从离开的位置继续接收流式输出。

## 为什么需要 join & rejoin？

传统的流式 API 往往把客户端和服务端强绑定在一起：一旦客户端断开，流就丢失了。join & rejoin 打破了这种耦合，因此能支持很多重要场景：

- 网络中断时无缝恢复。
- 页面跳转后返回仍能继续。
- 移动端从后台恢复时重新接入。
- 长时间任务期间无需一直停留在页面上。
- 多设备接力查看同一轮运行。

## 核心概念

| 方法 / 选项 | 用途 |
| --- | --- |
| `stream.stop()` | 让客户端从流中断开，但不停止 Agent |
| `stream.joinStream(runId)` | 通过运行 ID 重新连接到已有流 |
| `onDisconnect: "continue"` | 客户端断开后，服务端继续运行 |
| `streamResumable: true` | 允许之后重新加入该流 |

> [!NOTE]
> `stream.stop()` 只会断开客户端，Agent 仍然会在服务端继续执行。真正要取消 Agent 的执行，需要使用中断或取消机制。

## 配置 `useStream`

关键点是通过 `onCreated` 保存 `run_id`，这样后面才能重新加入这个流。

```tsx
import { useStream } from "@langchain/react";
import { useState } from "react";

function Chat() {
  const [savedRunId, setSavedRunId] = useState<string | null>(null);

  const stream = useStream<typeof myAgent>({
    apiUrl: "http://localhost:2024",
    assistantId: "join_rejoin",
    onCreated(run) {
      setSavedRunId(run.run_id);
    },
  });

  const isConnected = stream.isLoading;

  return (
    <div>
      <ConnectionStatus connected={isConnected} />
      <MessageList messages={stream.messages} />
      <ChatControls
        stream={stream}
        savedRunId={savedRunId}
        isConnected={isConnected}
      />
    </div>
  );
}
```

## 以可恢复选项提交

```ts
stream.submit(
  { messages: [{ type: "human", content: text }] },
  {
    onDisconnect: "continue",
    streamResumable: true,
  }
);
```

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `onDisconnect` | `"cancel"` | 客户端断开时，是否继续让 Agent 执行 |
| `streamResumable` | `false` | 是否保留流状态，便于稍后重新加入 |

> [!TIP]
> 这两个选项应一起使用。只设置 `onDisconnect: "continue"` 而不开启 `streamResumable: true`，会导致 Agent 虽然继续运行，但客户端无法重新接入流查看输出。

## 从流中断开

```ts
stream.stop();
```

调用后：

- `stream.isLoading` 变成 `false`。
- 已收到的消息仍保留在列表中。
- Agent 在服务端继续运行。
- 在重新加入前，不会收到新的流式消息。

## 重新加入流

```ts
stream.joinStream(savedRunId);
```

重新加入后：

- `stream.isLoading` 会重新变为 `true`。
- 断线期间生成的消息会补发回来。
- 新消息继续实时流入。
- 如果运行已经结束，会立即返回最终状态。

## 构建连接状态指示器

```tsx
function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <div className="connection-status">
      <span
        className={`status-dot ${connected ? "connected" : "disconnected"}`}
      />
      <span className="status-text">
        {connected ? "已连接" : "已断开"}
      </span>
    </div>
  );
}
```

```css
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
}

.status-dot.connected {
  background-color: #22c55e;
  box-shadow: 0 0 4px #22c55e;
}

.status-dot.disconnected {
  background-color: #ef4444;
  box-shadow: 0 0 4px #ef4444;
}
```

## 提供断开与重新加入控制

```tsx
function ChatControls({ stream, savedRunId, isConnected }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    stream.submit(
      { messages: [{ type: "human", content: input.trim() }] },
      { onDisconnect: "continue", streamResumable: true }
    );
    setInput("");
  };

  return (
    <div className="controls">
      <div className="input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息……"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>发送</button>
      </div>

      <div className="stream-controls">
        {isConnected ? (
          <button onClick={() => stream.stop()} className="disconnect-btn">
            断开连接
          </button>
        ) : (
          savedRunId && (
            <button
              onClick={() => stream.joinStream(savedRunId)}
              className="rejoin-btn"
            >
              重新加入流
            </button>
          )
        )}
      </div>
    </div>
  );
}
```

## 持久化运行 ID

```ts
const stream = useStream<typeof myAgent>({
  apiUrl: "http://localhost:2024",
  assistantId: "join_rejoin",
  onCreated(run) {
    localStorage.setItem("activeRunId", run.run_id);
  },
});

const existingRunId = localStorage.getItem("activeRunId");
if (existingRunId) {
  stream.joinStream(existingRunId);
}
```

> [!INFO]
> 当运行结束后，应清理已保存的运行 ID，避免之后错误地尝试重新加入一个已经完成的流。

## 错误处理

```ts
try {
  stream.joinStream(savedRunId);
} catch (error) {
  console.error("重新加入流失败：", error);
  setSavedRunId(null);
  localStorage.removeItem("activeRunId");
}
```

## 完整示例

```tsx
function JoinRejoinChat() {
  const [savedRunId, setSavedRunId] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const stream = useStream<typeof myAgent>({
    apiUrl: "http://localhost:2024",
    assistantId: "join_rejoin",
    onCreated(run) {
      setSavedRunId(run.run_id);
    },
  });

  const isConnected = stream.isLoading;

  const handleSend = () => {
    if (!input.trim()) return;
    stream.submit(
      { messages: [{ type: "human", content: input.trim() }] },
      { onDisconnect: "continue", streamResumable: true }
    );
    setInput("");
  };

  return (
    <div className="chat-container">
      <header>
        <h2>Join & Rejoin 演示</h2>
        <ConnectionStatus connected={isConnected} />
      </header>

      <div className="messages">
        {stream.messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
      </div>

      <div className="controls">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息……"
          />
          <button type="submit">发送</button>
        </form>

        <div className="stream-actions">
          {isConnected ? (
            <button onClick={() => stream.stop()}>
              断开连接
            </button>
          ) : (
            savedRunId && (
              <button onClick={() => stream.joinStream(savedRunId)}>
                重新加入流
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
```

## 最佳实践

- 始终保存运行 ID。
- 清晰展示连接状态。
- 页面恢复可见时自动尝试重连。
- 为重新加入设置合理超时。
- 运行完成后及时清理已保存的 ID。

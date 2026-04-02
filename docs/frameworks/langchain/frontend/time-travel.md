---
title: 时间旅行
description: 检查、导航并从对话历史中的任意 checkpoint 恢复执行
---

# 时间旅行

LangGraph Agent 的每一次状态变化都会生成一个 **checkpoint**，也就是该时刻 Agent 状态的完整快照。时间旅行能力允许你检查任意 checkpoint、查看 Agent 当时持有的精确状态，并且从那个时间点恢复执行，以探索其他路径。它同时具备调试器、撤销按钮和审计日志的作用。

## checkpoint 如何工作

LangGraph 会在每个节点执行后持久化 Agent 状态。每份持久化状态都是一个 `ThreadState` 对象，记录了：

- `checkpoint`：该快照的元数据，例如 ID 和命名空间。
- `values`：此时完整的 Agent 状态，包括 `messages` 和自定义状态字段。
- `tasks`：该时刻对应的图节点任务。
- `next`：接下来将执行的节点名称。

## 配置 `useStream`

通过给 `useStream` 传入 `fetchStateHistory: true` 来启用 checkpoint 历史。

```tsx
import { useStream } from "@langchain/react";

const AGENT_URL = "http://localhost:2024";

export function TimeTravelChat() {
  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "time_travel",
    fetchStateHistory: true,
  });

  const history = stream.history ?? [];

  return (
    <div className="flex h-screen">
      <ChatPanel messages={stream.messages} />
      <TimelineSidebar
        history={history}
        onSelect={(cp) => stream.submit(null, { checkpoint: cp.checkpoint })}
      />
    </div>
  );
}
```

## `ThreadState` 对象

```ts
interface ThreadState {
  checkpoint: {
    checkpoint_id: string;
    checkpoint_ns: string;
  };
  values: Record<string, unknown>;
  tasks: Array<{
    id: string;
    name: string;
    interrupts?: unknown[];
  }>;
  next: string[];
}
```

| 属性 | 说明 |
| --- | --- |
| `checkpoint` | 当前快照标识，恢复执行时需要传给 `submit` |
| `values` | 此时完整的 Agent 状态 |
| `tasks` | 当前 checkpoint 对应的节点任务 |
| `next` | 后续即将执行的节点名称 |

## 构建 checkpoint 时间线

```tsx
function TimelineSidebar({
  history,
  onSelect,
}: {
  history: ThreadState[];
  onSelect: (cp: ThreadState) => void;
}) {
  return (
    <aside className="w-80 overflow-y-auto border-l bg-gray-50 p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase text-gray-500">
        Checkpoint 时间线
      </h2>
      <div className="space-y-2">
        {history.map((cp, i) => {
          const taskName = cp.tasks?.[0]?.name ?? "unknown";
          const msgCount = (cp.values?.messages as unknown[])?.length ?? 0;

          return (
            <button
              key={cp.checkpoint.checkpoint_id}
              onClick={() => onSelect(cp)}
              className="w-full rounded-lg border bg-white p-3 text-left
                         hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">#{i + 1}</span>
                <NodeBadge name={taskName} />
              </div>
              <p className="mt-1 text-sm font-medium">{taskName}</p>
              <p className="text-xs text-gray-500">
                {msgCount} 条消息
              </p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
```

## 检查 checkpoint 状态

```tsx
function CheckpointInspector({ checkpoint }: { checkpoint: ThreadState }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Checkpoint {checkpoint.checkpoint.checkpoint_id.slice(0, 8)}...
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:underline"
        >
          {expanded ? "收起" : "展开"}状态
        </button>
      </div>

      <div className="mt-2 space-y-1 text-sm">
        <p>
          <strong>节点：</strong>{" "}
          {checkpoint.tasks?.[0]?.name ?? "未知"}
        </p>
        <p>
          <strong>后续节点：</strong>{" "}
          {checkpoint.next?.join(", ") || "无"}
        </p>
        <p>
          <strong>消息数：</strong>{" "}
          {(checkpoint.values?.messages as unknown[])?.length ?? 0}
        </p>
      </div>

      {expanded && (
        <div className="mt-3 max-h-96 overflow-auto rounded bg-gray-900 p-3">
          <pre className="text-xs text-gray-200">
            {JSON.stringify(checkpoint.values, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

> [!TIP]
> 在生产环境中，建议使用真正的 JSON 查看组件，而不是直接输出 `JSON.stringify`。

## 从 checkpoint 恢复执行

```ts
stream.submit(null, { checkpoint: selectedCheckpoint.checkpoint });
```

这会让 LangGraph：

1. 回滚到所选 checkpoint 对应的状态。
2. 从该点重新执行图。
3. 把新的执行结果以流式方式返回给客户端。

恢复之后，所选 checkpoint 后面的当前路径会被新的执行路径替换，从而形成新的分支。

> [!NOTE]
> 从 checkpoint 恢复不会删除原来的时间线。旧的 checkpoint 仍然会保留，因此用户可以反复尝试不同路径。

## SplitView 布局

```tsx
function TimeTravelLayout() {
  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "time_travel",
    fetchStateHistory: true,
  });

  const [selectedCheckpoint, setSelectedCheckpoint] =
    useState<ThreadState | null>(null);

  const history = stream.history ?? [];

  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {stream.messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}
        </div>
        <ChatInput
          onSubmit={(text) =>
            stream.submit({ messages: [{ type: "human", content: text }] })
          }
          isLoading={stream.isLoading}
        />
      </main>

      <aside className="w-96 overflow-y-auto border-l bg-gray-50">
        <TimelineSidebar
          history={history}
          selected={selectedCheckpoint}
          onSelect={setSelectedCheckpoint}
          onResume={(cp) =>
            stream.submit(null, { checkpoint: cp.checkpoint })
          }
        />
        {selectedCheckpoint && (
          <CheckpointInspector checkpoint={selectedCheckpoint} />
        )}
      </aside>
    </div>
  );
}
```

## 提取 checkpoint 元数据

```ts
function formatCheckpoints(history: ThreadState[]) {
  return history.map((cp, index) => ({
    index,
    id: cp.checkpoint?.checkpoint_id,
    taskName: cp.tasks?.[0]?.name ?? "unknown",
    messageCount: (cp.values?.messages as unknown[])?.length ?? 0,
    hasInterrupts: cp.tasks?.some((t) => t.interrupts?.length) ?? false,
    nextNodes: cp.next ?? [],
  }));
}
```

## 使用场景

- 调试 Agent 行为。
- 撤销错误路径。
- 从中间状态探索不同结果。
- 审计 Agent 的完整操作历史。
- 用于教学和问题复盘。

> [!INFO]
> 时间旅行和 [human-in-the-loop](/frameworks/langchain/frontend/human-in-the-loop) 结合时尤其有价值，人工审核者可以从某个 interrupt 之前的 checkpoint 恢复，再提供修正输入。

## 在时间线中处理 interrupt

```tsx
function TimelineEntry({
  checkpoint,
  index,
}: {
  checkpoint: ThreadState;
  index: number;
}) {
  const hasInterrupt = checkpoint.tasks?.some(
    (t) => t.interrupts && t.interrupts.length > 0
  );

  return (
    <div
      className={`rounded-lg border p-3 ${
        hasInterrupt
          ? "border-amber-300 bg-amber-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">#{index + 1}</span>
        {hasInterrupt && (
          <span className="rounded bg-amber-200 px-1.5 py-0.5 text-xs font-medium text-amber-800">
            Interrupt
          </span>
        )}
      </div>
      <p className="mt-1 text-sm font-medium">
        {checkpoint.tasks?.[0]?.name ?? "未知"}
      </p>
    </div>
  );
}
```

## 最佳实践

- 历史记录较长时做懒加载或分页。
- 展示节点名和消息数，而不是直接展示原始 ID。
- 恢复前做确认，避免误操作。
- 高亮当前 checkpoint。
- 支持键盘导航。
- 对相邻 checkpoint 做状态差异比较，便于高级调试。

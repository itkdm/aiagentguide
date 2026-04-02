---
title: 分支聊天
description: 编辑消息、重新生成回复，并在对话分支之间切换
---

# 分支聊天

与 AI Agent 的对话很少是完全线性的。你可能想改写一个问题、重新生成一条不满意的回复，或者探索另一条完全不同的对话路径，同时又不想丢掉之前的内容。分支聊天把类似版本控制的语义带进了聊天界面。每次编辑都会创建一个新的分支，你可以在不同分支之间自由切换。

## 什么是分支聊天？

分支聊天把一段对话视为一棵树，而不是一个简单的消息列表。每条消息都是一个节点，编辑消息或重新生成回复时，都会从该位置创建一个分叉。原始路径会作为同级分支被保留下来，因此用户可以在不同对话轨迹之间来回切换。

核心能力：

- 编辑任意用户消息：重写之前的提示，并从该位置重新运行 Agent。
- 重新生成任意 AI 回复：让 Agent 针对同样的输入给出不同答案。
- 在分支之间导航：使用每条消息上的分支控制，在不同版本之间切换。

## 为 `useStream` 启用历史记录

要启用分支能力，请传入 `fetchStateHistory: true`，这样 `useStream` 才会拉取进行分支操作所需的 checkpoint 元数据。

如果你使用 TypeScript，请先定义一个与 Agent 状态结构匹配的接口，然后把它作为 `useStream` 的类型参数传入。下面示例中的 `typeof myAgent` 可以替换成你自己的接口名：

```ts
import type { BaseMessage } from "@langchain/core/messages";

interface AgentState {
  messages: BaseMessage[];
}
```

或者直接导入你的 Agent 类型：

```ts
import type { myAgent } from "./agent";
```

```tsx
import { useStream } from "@langchain/react";

const AGENT_URL = "http://localhost:2024";

export function Chat() {
  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "branching_chat",
    fetchStateHistory: true,
  });

  return (
    <div>
      {stream.messages.map((msg) => {
        const metadata = stream.getMessagesMetadata(msg);
        return (
          <Message
            key={msg.id}
            message={msg}
            metadata={metadata}
            onEdit={(text) => handleEdit(stream, msg, metadata, text)}
            onRegenerate={() => handleRegenerate(stream, metadata)}
            onBranchSwitch={(id) => stream.setBranch(id)}
          />
        );
      })}
    </div>
  );
}
```

## 理解消息元数据

`getMessagesMetadata(msg)` 会返回每条消息对应的分支信息：

```ts
interface MessageMetadata {
  branch: string;
  branchOptions: string[];
  firstSeenState: {
    parent_checkpoint: Checkpoint | null;
  };
}
```

| 属性 | 说明 |
| --- | --- |
| `branch` | 当前这条消息版本所属的分支 ID |
| `branchOptions` | 该消息位置可用的全部分支 ID 列表 |
| `firstSeenState.parent_checkpoint` | 这条消息之前的 checkpoint，可作为编辑和重新生成时的分叉点 |

## 编辑消息

要编辑一条用户消息并创建新分支：

1. 从消息元数据中取出 `parent_checkpoint`。
2. 带上这个 checkpoint 提交编辑后的消息。
3. Agent 会从这个位置重新运行，并创建一个新分支。

```ts
function handleEdit(
  stream: ReturnType<typeof useStream>,
  originalMsg: HumanMessage,
  metadata: MessageMetadata,
  newText: string
) {
  const checkpoint = metadata.firstSeenState?.parent_checkpoint;
  if (!checkpoint) return;

  stream.submit(
    {
      messages: [{ ...originalMsg, content: newText }],
    },
    { checkpoint }
  );
}
```

编辑之后会发生这些事：

- 这条消息的 `branchOptions` 会新增一个分支。
- 视图会自动切换到新的分支。
- Agent 会以更新后的消息为起点重新运行。
- 原始版本会保留下来，并可通过分支切换器访问。

## 重新生成回复

如果你想在不改动输入的情况下重新生成一条 AI 回复：

1. 从 AI 消息的元数据里取出 `parent_checkpoint`。
2. 以 `undefined` 作为输入，并带上这个父 checkpoint 提交。
3. Agent 会生成一条新的回复，并建立一个新分支。

```ts
function handleRegenerate(
  stream: ReturnType<typeof useStream>,
  metadata: MessageMetadata
) {
  const checkpoint = metadata.firstSeenState?.parent_checkpoint;
  if (!checkpoint) return;

  stream.submit(undefined, { checkpoint });
}
```

> [!TIP]
> 对于非确定性的 Agent，重新生成非常有用。由于 LLM 在温度等参数影响下会产生不同输出，同一提示多次生成通常会得到有意义的差异结果。

## 构建分支切换器

当一条消息存在多个分支时，可以显示一个紧凑的内联控件，展示当前版本序号以及前后切换箭头：

```tsx
function BranchSwitcher({
  metadata,
  onSwitch,
}: {
  metadata: MessageMetadata;
  onSwitch: (branchId: string) => void;
}) {
  const { branch, branchOptions } = metadata;

  if (branchOptions.length <= 1) return null;

  const currentIndex = branchOptions.indexOf(branch);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < branchOptions.length - 1;

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
      <button
        disabled={!hasPrev}
        onClick={() => onSwitch(branchOptions[currentIndex - 1])}
        className="hover:text-gray-900 disabled:opacity-30"
        aria-label="上一个版本"
      >
        ←
      </button>
      <span className="min-w-[3ch] text-center">
        {currentIndex + 1}/{branchOptions.length}
      </span>
      <button
        disabled={!hasNext}
        onClick={() => onSwitch(branchOptions[currentIndex + 1])}
        className="hover:text-gray-900 disabled:opacity-30"
        aria-label="下一个版本"
      >
        →
      </button>
    </div>
  );
}
```

用户点击分支箭头时，调用 `stream.setBranch(branchId)`，即可把对话视图切换到对应分支。

> [!NOTE]
> 切换分支影响的不只是目标消息本身，还包括它之后的所有消息。如果你切换到了第 3 条消息的另一个版本，那么第 4、5、6 条等后续消息也会随之更新。

## 分支机制的底层原理

LangGraph 会把每次状态变更都保存为一个 checkpoint。当你在提交时传入 `checkpoint` 参数，后端就会从该点分叉，而不是直接追加到当前对话末尾。结果就形成了一棵树：

```text
用户："什么是 React？"
  ├─ AI："React 是一个 JavaScript 库……"（分支 A）
  ├─ AI："React 是一个 UI 框架……"（分支 B，重新生成）

用户："给我讲讲 hooks"（分支 A）
  ├─ AI："Hooks 是一组函数……"

用户："给我讲讲 JSX"（由分支 A 编辑而来）
  ├─ AI："JSX 是一种语法扩展……"
```

## 完整的消息组件示例

```tsx
function MessageWithBranching({
  message,
  metadata,
  stream,
}: {
  message: BaseMessage;
  metadata: MessageMetadata;
  stream: ReturnType<typeof useStream>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content as string);

  const isHuman = message._getType() === "human";
  const isAI = message._getType() === "ai";
  const hasBranches = metadata.branchOptions.length > 1;

  return (
    <div className="group relative py-2">
      {isEditing ? (
        <EditForm
          text={editText}
          onChange={setEditText}
          onSave={() => {
            handleEdit(stream, message as HumanMessage, metadata, editText);
            setIsEditing(false);
          }}
          onCancel={() => {
            setEditText(message.content as string);
            setIsEditing(false);
          }}
        />
      ) : (
        <>
          <div className={isHuman ? "text-right" : "text-left"}>
            <div
              className={
                isHuman
                  ? "inline-block rounded-lg bg-blue-600 px-4 py-2 text-white"
                  : "inline-block rounded-lg bg-gray-100 px-4 py-2"
              }
            >
              {message.content as string}
            </div>
          </div>

          <div className="mt-1 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            {isHuman && (
              <button
                className="text-xs text-gray-400 hover:text-gray-700"
                onClick={() => setIsEditing(true)}
              >
                编辑
              </button>
            )}

            {isAI && (
              <button
                className="text-xs text-gray-400 hover:text-gray-700"
                onClick={() =>
                  handleRegenerate(stream, metadata)
                }
              >
                重新生成
              </button>
            )}

            {hasBranches && (
              <BranchSwitcher
                metadata={metadata}
                onSwitch={(id) => stream.setBranch(id)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

## 结合乐观更新

```ts
function handleEditOptimistic(
  stream: ReturnType<typeof useStream>,
  originalMsg: HumanMessage,
  metadata: MessageMetadata,
  newText: string
) {
  const checkpoint = metadata.firstSeenState?.parent_checkpoint;
  if (!checkpoint) return;

  const updatedMsg = { ...originalMsg, content: newText };

  stream.submit(
    { messages: [updatedMsg] },
    {
      checkpoint,
      optimisticValues: (prev) => {
        if (!prev?.messages) return { messages: [updatedMsg] };

        const idx = prev.messages.findIndex((m) => m.id === originalMsg.id);
        if (idx === -1) return prev;

        return {
          ...prev,
          messages: [...prev.messages.slice(0, idx), updatedMsg],
        };
      },
    }
  );
}
```

## 添加键盘导航

```tsx
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (!focusedMessageMetadata) return;

    const { branch, branchOptions } = focusedMessageMetadata;
    const idx = branchOptions.indexOf(branch);

    if (e.altKey && e.key === "ArrowLeft" && idx > 0) {
      stream.setBranch(branchOptions[idx - 1]);
    }
    if (e.altKey && e.key === "ArrowRight" && idx < branchOptions.length - 1) {
      stream.setBranch(branchOptions[idx + 1]);
    }
  }

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [focusedMessageMetadata, stream]);
```

## 最佳实践

- 始终启用 `fetchStateHistory`。
- 只有在存在多个分支时才显示切换器。
- 将分支控制显示在 hover 状态。
- 保持滚动位置稳定。
- 在流式输出期间禁用编辑和重新生成。
- 使用深层分支树进行测试，确认性能和交互都正常。

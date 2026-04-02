---
title: Human-in-the-Loop
description: 通过中断与人工审批工作流控制 Agent 的高风险动作
---

# Human-in-the-Loop

并不是所有 Agent 动作都应该无人监管地直接执行。  
当 Agent 即将：

- 发送邮件
- 删除记录
- 发起金融交易
- 执行不可逆操作

时，通常需要人工先审核并批准。Human-in-the-Loop（HITL）模式允许 Agent 暂停执行，把待执行动作展示给用户，只有在明确批准之后才继续。

## Interrupt 的工作方式

LangGraph Agent 支持 **interrupts**，也就是显式暂停点。

当 Agent 命中 interrupt 时：

1. Agent 停止执行并发出 interrupt payload
2. `useStream` 通过 `stream.interrupt` 暴露这个中断
3. 前端渲染审批卡片，展示 approve / reject / edit 选项
4. 用户做出决定
5. 前端调用 `stream.submit()` 发送 resume command
6. Agent 从中断点继续执行

## 为 HITL 配置 useStream

### React

```tsx
import { useStream } from "@langchain/react";

const AGENT_URL = "http://localhost:2024";

export function Chat() {
  const stream = useStream<typeof myAgent>({
    apiUrl: AGENT_URL,
    assistantId: "human_in_the_loop",
  });

  const interrupt = stream.interrupt;

  return (
    <div>
      {stream.messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}
      {interrupt && (
        <ApprovalCard
          interrupt={interrupt}
          onRespond={(response) =>
            stream.submit(null, { command: { resume: response } })
          }
        />
      )}
    </div>
  );
}
```

## Interrupt payload

当 Agent 暂停时，`stream.interrupt` 中通常会包含一个 `HITLRequest`，结构大致如下：

```ts
interface HITLRequest {
  actionRequests: ActionRequest[];
  reviewConfigs: ReviewConfig[];
}

interface ActionRequest {
  action: string;
  args: Record<string, unknown>;
  description?: string;
}

interface ReviewConfig {
  allowedDecisions: ("approve" | "reject" | "edit")[];
}
```

含义：

- `actionRequests`：待审批动作列表
- `actionRequests[].action`：动作名称
- `actionRequests[].args`：动作参数
- `description`：更适合展示给用户的可读说明
- `reviewConfigs`：每个动作允许的审批操作

## 决策类型

HITL 常见支持 3 类决策：

### Approve

用户确认动作可以按原样执行：

```ts
const response: HITLResponse = {
  decision: "approve",
};

stream.submit(null, { command: { resume: response } });
```

### Reject

用户拒绝动作，并可附带原因：

```ts
const response: HITLResponse = {
  decision: "reject",
  reason: "邮件语气太强硬了，请重新措辞。",
};

stream.submit(null, { command: { resume: response } });
```

当动作被拒绝后，Agent 可以读取拒绝原因，并决定是重新生成、继续追问，还是终止该动作。

### Edit

用户先修改动作参数，再允许执行：

```ts
const response: HITLResponse = {
  decision: "edit",
  args: {
    ...originalArgs,
    subject: "更新后的邮件标题",
    body: "语气更温和的新邮件正文。",
  },
};

stream.submit(null, { command: { resume: response } });
```

## 构建 ApprovalCard

下面是一个支持三种决策方式的审批卡片示例：

```tsx
function ApprovalCard({
  interrupt,
  onRespond,
}: {
  interrupt: { value: HITLRequest };
  onRespond: (response: HITLResponse) => void;
}) {
  const request = interrupt.value;
  const [editedArgs, setEditedArgs] = useState(
    request.actionRequests[0]?.args ?? {}
  );
  const [rejectReason, setRejectReason] = useState("");
  const [mode, setMode] = useState<"review" | "edit" | "reject">("review");

  const action = request.actionRequests[0];
  const config = request.reviewConfigs[0];

  if (!action || !config) return null;

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
      <h3 className="font-semibold text-amber-800">需要人工审核</h3>
      <p className="mt-1 text-sm text-amber-700">
        {action.description ?? `Agent 想执行动作：${action.action}`}
      </p>

      <div className="mt-3 rounded bg-white p-3 font-mono text-sm">
        <pre>{JSON.stringify(action.args, null, 2)}</pre>
      </div>

      {mode === "review" && (
        <div className="mt-4 flex gap-2">
          {config.allowedDecisions.includes("approve") && (
            <button onClick={() => onRespond({ decision: "approve" })}>
              Approve
            </button>
          )}
          {config.allowedDecisions.includes("reject") && (
            <button onClick={() => setMode("reject")}>
              Reject
            </button>
          )}
          {config.allowedDecisions.includes("edit") && (
            <button onClick={() => setMode("edit")}>
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

## Resume 流程

当用户完成审批后，完整流程如下：

1. 调用 `stream.submit(null, { command: { resume: hitlResponse } })`
2. `useStream` 把 resume command 发回 LangGraph 后端
3. Agent 收到 `HITLResponse` 并继续执行
4. 如果是 approve，则按原参数执行
5. 如果是 edit，则按修改后的参数执行
6. 如果是 reject，则带着拒绝原因进入下一步决策

随着 Agent 恢复执行，`interrupt` 会回到 `null`。

## 常见使用场景

| 场景 | 动作 | 审批配置 |
|---|---|---|
| 发送邮件 | `send_email` | `["approve", "reject", "edit"]` |
| 数据库写入 | `update_record` | `["approve", "reject"]` |
| 金融交易 | `transfer_funds` | `["approve", "reject"]` |
| 文件删除 | `delete_files` | `["approve", "reject"]` |
| 外部 API 调用 | `call_api` | `["approve", "reject", "edit"]` |

## 处理多个待审批动作

一个 interrupt 可能同时包含多个动作。此时可以为每个动作渲染独立卡片，并在用户对所有动作都作出决策后再统一恢复。

```tsx
function MultiActionReview({
  interrupt,
  onRespond,
}: {
  interrupt: { value: HITLRequest };
  onRespond: (responses: HITLResponse[]) => void;
}) {
  const [decisions, setDecisions] = useState<Record<number, HITLResponse>>({});
  const request = interrupt.value;

  const allDecided =
    Object.keys(decisions).length === request.actionRequests.length;

  return (
    <div className="space-y-4">
      {request.actionRequests.map((action, i) => (
        <SingleActionCard
          key={i}
          action={action}
          config={request.reviewConfigs[i]}
          onDecide={(response) =>
            setDecisions((prev) => ({ ...prev, [i]: response }))
          }
        />
      ))}
      {allDecided && (
        <button
          onClick={() =>
            onRespond(
              request.actionRequests.map((_, i) => decisions[i])
            )
          }
        >
          提交全部决策
        </button>
      )}
    </div>
  );
}
```

## 最佳实践

- 给用户展示清晰上下文：动作是什么、为什么要做、参数是什么
- approve 应该是最快路径
- edit 模式下对 JSON 参数做校验
- 保证页面刷新后 interrupt 仍可恢复展示
- 记录所有 approve / reject / edit 作为审计日志
- 对等待人工审批的时长设计合理超时策略

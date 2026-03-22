# s10 团队协议

如果说 [s09 Agent 团队](./s09-agent-teams.md) 解决的是“怎么让队友长期存在并通过邮箱通信”，  
那么这一章解决的是另一个更关键的问题：

**队友之间发的消息，怎样才能从“随便说一句话”变成“系统能跟踪、能审批、能关闭”的正式协议？**

这一章最重要的一句话是：

**团队协议的核心，不只是字段统一，而是把协作变成可跟踪的 request-response 模式。**

## 问题

到 `s09` 为止，团队里的成员已经可以互相发消息，也有自己的身份和收件箱。  
但如果没有进一步的协议约束，很快就会遇到两个非常实际的问题：

### 1. 关机不能靠“直接停掉”

如果主协调者想让某个队友退出，最粗暴的做法是直接杀线程。  
但这样会留下很多风险：

- 文件可能只写到一半
- 队友状态可能还停留在 `working`
- `config.json` 里的团队状态会过期

所以“关机”其实不是一个命令，而应该是一个**握手过程**。

### 2. 高风险任务不能一句话就开干

例如主协调者对队友说：

- “去重构认证模块”
- “把这个核心流程改成并行执行”

如果队友收到后立刻开工，风险很高。  
更稳的做法是：

- 队友先提交计划
- 主协调者审批
- 审批通过后再执行

你会发现，这两个问题虽然看起来不同，但结构其实很像：

- 一方发起请求
- 另一方基于同一个请求作出响应
- 系统需要持续追踪这个请求的状态

这就是这一章真正要解决的事情：

**让团队里的协作，从自然语言聊天升级成带唯一 ID 的请求-响应协议。**

## 解决方案

更稳的做法，是把团队里的关键协商都统一成一套模式：

- 每次发起请求时生成一个 `request_id`
- 对方响应时必须引用同一个 `request_id`
- 系统内部用有限状态机跟踪这个请求

参考页里重点讲了两种协议：

- `Shutdown Protocol`：优雅关机握手
- `Plan Approval Protocol`：计划审批握手

把它画成最小结构，大概是这样：

```text
Shutdown Protocol            Plan Approval Protocol
==================           ======================

Lead             Teammate    Teammate           Lead
  |                 |           |                 |
  |--shutdown_req-->|           |--plan_req------>|
  | {req_id:"abc"}  |           | {req_id:"xyz"}  |
  |                 |           |                 |
  |<--shutdown_resp-|           |<--plan_resp-----|
  | {req_id:"abc",  |           | {req_id:"xyz",  |
  |  approve:true}  |           |  approve:true}  |

共享状态机：
  [pending] --approve--> [approved]
  [pending] --reject---> [rejected]

跟踪器：
  shutdown_requests = {req_id: {target, status}}
  plan_requests     = {req_id: {from, plan, status}}
```

这张图最重要的不是两个具体例子，而是下面这件事：

**同一个请求-响应骨架，可以复用到所有团队协商场景里。**

## 工作原理

### 1. 发起方先生成 `request_id`

无论是请求关机，还是提交计划审批，请求方的第一步通常都是生成一个唯一 ID。

例如关机协议里，主协调者会这样做：

```python
shutdown_requests = {}

def handle_shutdown_request(teammate: str) -> str:
    req_id = str(uuid.uuid4())[:8]
    shutdown_requests[req_id] = {
        "target": teammate,
        "status": "pending",
    }

    BUS.send(
        "lead",
        teammate,
        "Please shut down gracefully.",
        "shutdown_request",
        {"request_id": req_id},
    )

    return f"Shutdown request {req_id} sent (status: pending)"
```

这里真正重要的不是 UUID 本身，而是：

- 每个请求都有唯一可追踪标识
- 这个标识会被同时写进消息和内部状态表

这样系统后面才能知道：

- 这是谁发起的请求
- 现在处理到哪一步了
- 之后收到的响应应该对应哪一次请求

### 2. 响应方必须引用同一个 `request_id`

请求发出去之后，对方的响应不能只是说“好”或者“不行”，而必须显式带回同一个 `request_id`。

例如关机响应可能长这样：

```python
if tool_name == "shutdown_response":
    req_id = args["request_id"]
    approve = args["approve"]

    shutdown_requests[req_id]["status"] = (
        "approved" if approve else "rejected"
    )

    BUS.send(
        sender,
        "lead",
        args.get("reason", ""),
        "shutdown_response",
        {
            "request_id": req_id,
            "approve": approve,
        },
    )
```

这一步的意义非常大，因为它把“响应”从模糊的自然语言，变成了可关联的正式结果：

- 主协调者知道这是对哪一个请求的回复
- 系统知道应该更新哪条状态
- 审批/拒绝不再是悬空事件，而是请求生命周期的一部分

### 3. 计划审批其实复用的是同一套模式

参考页里很强调一点：  
计划审批和关机握手，虽然业务含义不同，但协议模式是一样的。

例如计划审批可以这样写：

```python
plan_requests = {}

def handle_plan_review(request_id, approve, feedback=""):
    req = plan_requests[request_id]
    req["status"] = "approved" if approve else "rejected"

    BUS.send(
        "lead",
        req["from"],
        feedback,
        "plan_approval_response",
        {
            "request_id": request_id,
            "approve": approve,
        },
    )
```

也就是说：

- 一个是 “请你优雅关机”
- 一个是 “请你提交计划，我来审批”

但它们共享的结构其实完全一致：

1. 发起请求
2. 写入跟踪表
3. 对方基于 `request_id` 响应
4. 状态从 `pending` 进入 `approved` 或 `rejected`

所以这一章真正的重点不是记住两个例子，而是理解：

**一个抽象得当的团队协议，可以复用到很多协作场景。**

### 4. 协议背后其实是一个有限状态机

如果把它抽象出来，会发现这类协议通常都围绕一个非常简单的状态机：

```python
PENDING = "pending"
APPROVED = "approved"
REJECTED = "rejected"
```

对应流转是：

- `pending -> approved`
- `pending -> rejected`

这看起来很简单，但它带来的系统价值非常大：

- 系统可以明确知道请求是不是还在等待中
- 调度器可以决定接下来要不要继续推进
- 队友状态可以和协议状态联动

例如：

- 如果关机请求被 `approved`，成员状态可以转为 `shutdown`
- 如果计划被 `rejected`，队友应该回去重写计划，而不是直接执行

所以协议不是“消息格式约定”这么简单，它实际上已经在定义系统状态机。

### 5. 跟踪器让协作从“消息流”变成“可查询状态”

如果系统只是发送和接收消息，而没有内部跟踪表，那么很快会出问题：

- 这条回复对应哪次请求？
- 现在还有哪些请求挂起？
- 某个审批是不是已经被拒绝过？

这就是为什么参考页里除了邮箱之外，还要维护两个跟踪器：

```python
shutdown_requests = {
    "abc123": {"target": "alice", "status": "pending"}
}

plan_requests = {
    "xyz789": {"from": "bob", "plan": "...", "status": "approved"}
}
```

这些跟踪器的意义是：

- 把一次请求的全生命周期留在系统内部
- 让主协调者可以随时查询状态
- 让协议不只是“收发消息”，而是“可回溯的流程对象”

## 为什么说协议比自然语言默契更重要

很多多 Agent 系统一开始看起来也能工作，因为每个角色都“差不多懂意思”。  
但只靠自然语言默契，规模一大就会失控。

常见问题包括：

- 响应里没带关联 ID，系统不知道该更新谁
- 队友写了计划，但主协调者不知道这是请求还是结果
- 某个请求被处理两次，系统却无法去重
- 人工查看日志时，也分不清哪个消息对哪个流程生效

所以协议真正解决的是：

- 协作可追踪
- 流程可恢复
- 结果可消费
- 系统可调试

这也是从“几个 Agent 能聊天”走向“Agent 系统能稳定运行”的关键一步。

## 相对 s09 的变化

和 [s09 Agent 团队](./s09-agent-teams.md) 相比，这一章真正新增的是“带状态机的请求-响应协议”。

| 组件 | s09 | s10 |
| --- | --- | --- |
| 主问题 | 队友怎么存在并通信 | 队友怎么正式协商 |
| 通信方式 | 邮箱消息收发 | 邮箱 + request-response |
| 关联方式 | 普通消息流 | `request_id` 关联 |
| 状态表达 | 成员状态为主 | 请求状态 `pending / approved / rejected` |
| 新增能力 | 持久化队友 | 关机握手、计划审批、协议跟踪 |

所以这章相对 `s09` 的关键增量不是“消息更多了”，而是：

**团队通信第一次从自由消息流升级成了可跟踪的协作协议。**

## 什么场景最适合用这种协议

下面这些场景，通常都不应该只靠一句自然语言消息解决：

- 高风险动作前需要审批
- 队友退出前需要收尾确认
- 结果需要明确“同意 / 拒绝 / 等待”状态
- 多个请求可能并行存在，必须能准确关联
- 后续流程依赖当前协商结果

例如：

- “是否允许执行这次重构？”
- “这个高风险改动计划是否通过？”
- “这个成员现在能不能退出？”

## 常见误区

- 只发请求，不做响应关联
- 消息里没有 `request_id`
- 有请求和响应，但没有内部 tracker
- 状态只写在文本里，没有明确状态机
- 只设计成功路径，不设计拒绝和回退路径

## 试一试

你可以用下面几个问题检查自己是否真的理解了这一章：

1. 为什么“关机”和“计划审批”可以复用同一种协议模式？
2. 为什么响应里必须带回同一个 `request_id`？
3. 为什么协议除了邮箱消息外，还需要内部 tracker？
4. `pending -> approved / rejected` 这种状态机为什么重要？

如果这些问题你都能说清楚，就说明你已经抓住这一章的核心了。

## 这节真正要理解什么

- 团队协议的核心不是字段罗列，而是请求-响应模式
- `request_id` 让协作从模糊消息变成可关联流程
- tracker 和状态机让系统能够稳定查询、推进和回退
- 这是后面更复杂协商、自主决策和隔离执行的基础

## 小结

- `s09` 让队友能通信，`s10` 让通信变成正式协议
- 关机握手和计划审批只是两个例子，背后共享同一个 request-response 骨架
- 到了这一章，团队协作才真正开始具备“可审批、可拒绝、可追踪”的系统属性

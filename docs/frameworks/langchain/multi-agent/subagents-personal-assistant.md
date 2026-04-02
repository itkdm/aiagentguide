---
title: 用 Subagents 构建个人助理
description: 通过 supervisor 调度日历 Agent 和邮件 Agent，构建多领域个人助理
---

# 用 Subagents 构建个人助理

这个教程展示如何使用 [subagents](/frameworks/langchain/multi-agent/subagents) 或 supervisor 模式，构建一个个人助理系统。核心思想是：

- 一个中心 supervisor Agent 负责统一理解用户请求
- 不同领域由不同子 Agent 处理
- supervisor 再把结果组织成最终回复

示例中有两个专门子 Agent：

- Calendar Agent：处理日程安排、可用时间查询、事件创建
- Email Agent：处理邮件撰写、提醒和发送

此外，还会结合 [human-in-the-loop](/frameworks/langchain/advanced-usage/human-in-the-loop) 来审核敏感动作，例如发邮件。

## 为什么用 Supervisor 模式

如果把所有日历和邮件工具都直接暴露给一个 Agent，它需要同时处理：

- 多套 API 语义
- 很多格式要求
- 跨领域的工具选择

随着工具增多，模型更容易做错选择。把它们拆成多个领域 Agent 后，每个子 Agent 只负责一小块问题，就更容易稳定。

## 1. 定义底层工具

首先定义那些真正执行动作的工具。在真实系统里，它们会调用 Google Calendar、Outlook、SendGrid 等 API。教程中一般用 stub 工具演示：

- `create_calendar_event`
- `get_available_time_slots`
- `send_email`

这些底层工具通常要求结构化输入，例如：

- ISO 时间格式
- 收件人邮箱列表
- 事件标题、时长、参与人

这正是子 Agent 能发挥作用的地方：它们把自然语言翻译成这些结构化输入。

## 2. 创建专门子 Agent

### Calendar Agent

Calendar Agent 负责理解自然语言排期请求，并将其转换为精确 API 调用。

它通常会：

- 解析诸如“下周二下午两点”这样的自然语言时间
- 查询可用时间
- 创建日历事件
- 用自然语言确认最终结果

例如：

```python
CALENDAR_AGENT_PROMPT = (
    "你是一个日历安排助手。"
    "请把自然语言排期请求解析成正确的 ISO 时间格式。"
    "必要时使用 get_available_time_slots 检查空闲时间。"
    "使用 create_calendar_event 创建事件。"
    "最终请明确确认安排结果。"
)
```

### Email Agent

Email Agent 负责处理邮件相关任务。

它通常会：

- 从自然语言中提取收件人
- 生成合适的邮件主题
- 撰写正文
- 调用 `send_email`
- 最后返回发送确认

例如：

```python
EMAIL_AGENT_PROMPT = (
    "你是一个邮件助手。"
    "请根据自然语言请求撰写专业邮件。"
    "提取收件人，生成合适主题和正文。"
    "使用 send_email 发送。"
    "最终请明确说明发了什么。"
)
```

## 3. 把子 Agent 包装成工具

这是这个架构最关键的一步：supervisor 不直接看到底层 API 工具，而是只看到更高层的“能力工具”。

例如，把 Calendar Agent 包装成：

- `schedule_event`

把 Email Agent 包装成：

- `manage_email`

示例：

```python
@tool
def schedule_event(request: str) -> str:
    """使用自然语言安排日历事件。"""
    result = calendar_agent.invoke({
        "messages": [{"role": "user", "content": request}]
    })
    return result["messages"][-1].text

@tool
def manage_email(request: str) -> str:
    """使用自然语言处理邮件。"""
    result = email_agent.invoke({
        "messages": [{"role": "user", "content": request}]
    })
    return result["messages"][-1].text
```

这样 supervisor 只需要决定：

- 该不该安排日历
- 该不该发邮件

而无需关心具体 API 参数。

## 4. 创建 Supervisor Agent

然后用这些高层工具创建 supervisor：

```python
SUPERVISOR_PROMPT = (
    "你是一个有帮助的个人助理。"
    "你可以安排日历和发送邮件。"
    "请把用户请求拆解成合适的工具调用，并协调结果。"
    "如果请求包含多个动作，请按顺序调用多个工具。"
)

supervisor_agent = create_agent(
    model,
    tools=[schedule_event, manage_email],
    system_prompt=SUPERVISOR_PROMPT,
)
```

此时 supervisor 的职责非常清晰：

- 理解用户意图
- 选择高层工具
- 编排多个子步骤
- 汇总结果

## 5. 运行完整系统

例如，当用户说：

- “帮我安排下周二下午两点和设计团队开会，时长一小时，并给他们发一封提醒邮件，让他们提前查看新 mockups。”

supervisor 可能会：

1. 调用 `schedule_event`
2. 再调用 `manage_email`
3. 最后返回统一总结

这就是 supervisor 模式的强项：把复杂多领域任务拆成多个专门子任务。

## 6. 加入 Human-in-the-loop 审核

对于发邮件、创建会议等敏感动作，可以加入人工审核。

在这个模式下，通常会把 HITL middleware 加在子 Agent 上，而把 checkpointer 放在最顶层 supervisor 上。

例如：

```python
calendar_agent = create_agent(
    model,
    tools=[create_calendar_event, get_available_time_slots],
    system_prompt=CALENDAR_AGENT_PROMPT,
    middleware=[
        HumanInTheLoopMiddleware(
            interrupt_on={"create_calendar_event": True},
            description_prefix="日历事件等待审批",
        ),
    ],
)

email_agent = create_agent(
    model,
    tools=[send_email],
    system_prompt=EMAIL_AGENT_PROMPT,
    middleware=[
        HumanInTheLoopMiddleware(
            interrupt_on={"send_email": True},
            description_prefix="外发邮件等待审批",
        ),
    ],
)

supervisor_agent = create_agent(
    model,
    tools=[schedule_event, manage_email],
    system_prompt=SUPERVISOR_PROMPT,
    checkpointer=InMemorySaver(),
)
```

这样做的效果是：

- 子 Agent 内部的敏感动作会触发中断
- 最上层 supervisor 负责整轮流程的暂停与恢复

你可以对不同 interrupt 分别：

- `approve`
- `edit`
- `reject`

例如：

- 批准创建日历事件
- 但修改外发邮件主题后再发送

## 7. 控制信息流

默认情况下，子 Agent 只接收 supervisor 传入的一段请求字符串。

但有时你可能想让子 Agent 获得更多上下文，比如：

- 当前线程消息历史
- 用户偏好
- 原始用户问题

例如：

```python
@tool
def schedule_event(request: str, runtime: ToolRuntime) -> str:
    original_user_message = next(
        message for message in runtime.state["messages"]
        if message.type == "human"
    )
    prompt = (
        "你正在协助处理如下用户请求：\n\n"
        f"{original_user_message.text}\n\n"
        "你当前负责的子任务是：\n\n"
        f"{request}"
    )
    result = calendar_agent.invoke({
        "messages": [{"role": "user", "content": prompt}],
    })
    return result["messages"][-1].text
```

同样，你也可以控制 supervisor 从子 Agent 那里拿回什么：

- 只拿自然语言确认
- 或返回结构化结果

## 这个架构的本质

这个系统有三层：

1. 底层 API 工具层：严格、结构化、面向外部系统
2. 子 Agent 层：把自然语言翻译成结构化工具调用
3. Supervisor 层：负责任务拆解、路由与综合

这种分层的好处是：

- 每层职责清晰
- 可以独立测试和迭代
- 新增领域时只需要增加新子 Agent 和新高层工具

## 什么时候适合用

Supervisor / Subagents 模式特别适合：

- 多个领域并存，例如日历、邮件、CRM、数据库
- 每个领域内部又有多个工具或复杂逻辑
- 你希望由中心 Agent 统一编排
- 子 Agent 不需要直接和用户连续对话

如果只是少量工具，单 Agent 往往就够了。  
如果不同 Agent 需要直接和用户轮流对话，通常更适合 [handoffs](/frameworks/langchain/multi-agent/handoffs)。

## 实践建议

- 先把底层工具做好，再构建子 Agent，再加 supervisor。
- 子 Agent 的 prompt 要明确强调：最终消息必须包含关键信息，否则 supervisor 看不到中间过程。
- supervisor 工具描述要写清楚，方便模型做高层路由。
- 敏感动作尽量加 HITL，中断点放在最接近真实副作用的工具上。

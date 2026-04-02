# s01 Agent 循环

Agent 最核心的不是“能回答问题”，而是能**围绕目标持续推进任务**。  
如果只用一次普通的大模型调用，系统最多是“会回答”。一旦它开始自己调用工具、读取反馈、继续决策，才真正跨进 Agent。

这一章最重要的一句话可以概括成：

**最小 Agent 内核 = 一个循环 + 一个可执行工具。**

也就是说，哪怕你只给模型一个很简单的工具，只要系统能在“调用工具 -> 读取结果 -> 再决定下一步”这条链上自动循环，它就已经不再只是聊天。

## 纯LLM模型存在的问题

语言模型本身可以推理、生成、总结，但它碰不到真实环境。

例如，它本身不能直接：

- 读取你的本地文件
- 运行测试命令
- 查看命令报错
- 搜索网页并基于结果继续推进

如果没有循环，每次工具调用都要靠人手动介入：

1. 先问模型“下一步做什么”
2. 人工执行这个动作
3. 再把结果贴回去
4. 再问模型“接下来怎么办”

这时真正充当“循环控制器”的不是系统，而是我们自己。

## 解决方案

最小可用的 Agent，不需要一开始就有复杂框架。  
它只需要把下面这条链闭起来：

<div class="agent-mini-flow" aria-label="Agent 最小闭环">
  <span class="agent-mini-flow-step">用户任务</span>
  <span class="agent-mini-flow-arrow" aria-hidden="true">→</span>
  <span class="agent-mini-flow-step">模型判断</span>
  <span class="agent-mini-flow-arrow" aria-hidden="true">→</span>
  <span class="agent-mini-flow-step">工具执行</span>
  <span class="agent-mini-flow-arrow" aria-hidden="true">→</span>
  <span class="agent-mini-flow-step">结果回写</span>
  <span class="agent-mini-flow-arrow" aria-hidden="true">→</span>
  <span class="agent-mini-flow-step">模型再判断</span>
</div>

直到模型不再发起工具调用，系统才停止。

如果把它画成一个最小结构，可以写成：

```text
+--------+      +--------+      +--------+
|  用户  | ---> |  模型  | ---> |  工具  |
|  任务  |      |  决策  |      |  执行  |
+--------+      +---+----+      +----+---+
                    ^                |
                    |   工具结果反馈  |
                    +----------------+
                    （直到模型停止调用）
```

如果想把它画成更接近流程图的形式，可以看下面这个版本。


<div class="agent-loop-diagram">
  <div class="agent-loop-diagram-code"><code>while (stop_reason == "tool_use")</code></div>
  <div class="agent-loop-diagram-frame">
    <svg class="agent-loop-diagram-svg" viewBox="0 0 560 450" role="img" aria-label="Agent while loop in Chinese" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="agent-loop-fill-zh" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#dfe9f7" />
          <stop offset="100%" stop-color="#d4e1f1" />
        </linearGradient>
        <marker id="agent-loop-arrowhead-zh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#afc0d7" />
        </marker>
      </defs>
      <g fill="none" stroke="#afc0d7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#agent-loop-arrowhead-zh)">
        <line x1="162" y1="66" x2="162" y2="95" />
        <line x1="162" y1="145" x2="162" y2="170" />
        <line x1="237" y1="210" x2="356" y2="210" />
        <line x1="162" y1="251" x2="162" y2="272" />
        <line x1="162" y1="322" x2="162" y2="352" />
        <path d="M 88 376 H 34 V 120 H 88" />
      </g>
      <rect x="88" y="18" width="148" height="48" rx="12" fill="url(#agent-loop-fill-zh)" stroke="#c5d3e5" />
      <rect x="88" y="97" width="148" height="48" rx="12" fill="url(#agent-loop-fill-zh)" stroke="#c5d3e5" />
      <polygon points="162,170 237,210 162,250 87,210" fill="url(#agent-loop-fill-zh)" stroke="#c5d3e5" />
      <rect x="356" y="186" width="146" height="48" rx="12" fill="url(#agent-loop-fill-zh)" stroke="#c5d3e5" />
      <rect x="88" y="274" width="148" height="48" rx="12" fill="url(#agent-loop-fill-zh)" stroke="#c5d3e5" />
      <rect x="88" y="353" width="148" height="48" rx="12" fill="url(#agent-loop-fill-zh)" stroke="#c5d3e5" />
      <g fill="#2c466b" font-family="'JetBrains Mono', 'PingFang SC', 'Microsoft YaHei', monospace" font-size="14" font-weight="600" text-anchor="middle">
        <text x="162" y="47">开始</text>
        <text x="162" y="126">模型调用</text>
        <text x="162" y="206">
          <tspan x="162" dy="0">是否继续</tspan>
          <tspan x="162" dy="18">调工具？</tspan>
        </text>
        <text x="429" y="215">结束 / 返回结果</text>
        <text x="162" y="303">执行工具</text>
        <text x="162" y="382">写回结果</text>
      </g>
      <g fill="#95a9c4" font-family="'JetBrains Mono', 'PingFang SC', 'Microsoft YaHei', monospace" font-size="13">
        <text x="286" y="197">end_turn</text>
        <text x="251" y="261">tool_use</text>
      </g>
    </svg>
  </div>
</div>

这就是 Agent 的第一个质变点：  

从“一次回答”变成“自动收反馈并继续推进”。

## 一个最小 Agent 循环

下面这段代码是通用写法，不绑定某一个具体框架：

```python
messages = [{"role": "user", "content": task}]

while True:
    response = model.generate(messages=messages, tools=tools)

    if response.type == "final":
        return response.content

    if response.type == "tool_call":
        result = execute_tool(response.tool_name, response.arguments)
        messages.append({"role": "tool", "content": result})
```

这段代码已经包含了 Agent 最核心的四件事：

- 模型根据当前上下文决定下一步
- 如果需要行动，就发起工具调用
- 工具执行后返回真实反馈
- 反馈再进入下一轮决策

## Agent While 循环动画演示

<AgentLoopVisualizer />

## 工作原理

把这个循环拆开看，通常就是下面 4 步。

### 1. 用户任务进入消息列表

```python
messages = [{"role": "user", "content": task}]
```

系统先把目标放进上下文里，作为整个循环的起点。

### 2. 把消息和工具定义一起交给模型

```python
response = model.generate(messages=messages, tools=tools)
```

这一步不是单纯“问模型一个问题”，而是告诉模型：

- 当前任务是什么
- 你现在知道什么
- 你可以用哪些工具

### 3. 判断模型是要结束，还是要调用工具

```python
if response.type == "final":
    return response.content
```

如果模型已经能直接给出最终结果，循环结束。

```python
if response.type == "tool_call":
    ...
```

如果模型判断自己还需要外部信息或执行动作，就进入工具调用分支。

### 4. 执行工具，把结果写回上下文，再进入下一轮

```python
result = execute_tool(response.tool_name, response.arguments)
messages.append({"role": "tool", "content": result})
```

这一步很关键。  
真正把系统从“聊天”变成“行动”的，不是模型本身，而是：

- 工具真的被执行了
- 执行结果真的回到了下一轮上下文里

只要这一步成立，系统就具备了闭环能力。

## 一个更接近参考项目写法的完整函数

如果把上面的逻辑收成一个完整函数，大概会是这样：

```python
def agent_loop(task):
    messages = [{"role": "user", "content": task}]

    while True:
        response = model.generate(messages=messages, tools=tools)

        messages.append({
            "role": "assistant",
            "content": response.content,
        })

        if response.type != "tool_call":
            return response.content

        tool_results = []
        for call in response.tool_calls:
            output = execute_tool(call.name, call.arguments)
            tool_results.append({
                "tool_call_id": call.id,
                "content": output,
            })

        messages.append({
            "role": "tool",
            "content": tool_results,
        })
```

这个函数虽然简单，但已经具备最小 Agent 内核。

很多后续章节看起来很复杂，但其实都是在这个最小循环上不断叠加能力：

- [s02 工具](./s02-tools.md)：补“手”
- [s03 TodoWrite](./s03-todowrite.md)：补显式计划
- [s04 子 Agent](./s04-sub-agents.md)：补分治
- [s06 上下文压缩](./s06-context-compression.md)：补长链稳定性

## 为什么后面 11 章都绕不开这一层

因为后面所有机制，本质上都不是在替代循环，而是在增强循环。

例如：

- 工具：让循环能真正行动
- TodoWrite：让循环有可见计划
- 任务系统：让循环能管理多任务
- 后台任务：让循环能跨时间运行
- 团队协议：让多个循环能协作

所以可以把这一章理解成整个原理栏的地基。

## 一个更完整的循环通常还会补什么

真实工程里，最小循环通常还会继续补这些控制点：

- 最大步数
- 错误处理
- 状态更新
- 权限检查
- 人工确认点

```python
for step in range(max_steps):
    response = planner.run(messages, state)

    if response.requires_approval:
        approval = ask_human(response)
        if not approval:
            return "stopped by human"

    if response.tool_call:
        result = execute_tool(response.tool_call.name, response.tool_call.args)
        state = update_state(state, result)
        messages.extend(result_to_messages(result))
        continue

    if response.final_answer:
        return response.final_answer
```

这时你会更清楚地看到：  
框架本质上是在帮你把这个循环组织得更稳，而不是发明了一个完全不同的东西。

## 验证最小任务

如果你自己实现一个最小 Agent loop，可以拿下面几类任务验证它是否真的形成了闭环：

1. “列出当前目录下的 Python 文件”
2. “创建一个 `hello.py`，内容是打印 `Hello, World!`”
3. “读取一个文件后，总结它的结构”
4. “运行测试命令，并根据报错继续修复”

这几类任务的共同点是：

- 不是一次纯文本回答
- 必须依赖外部执行结果
- 下一步决策会受到上一步结果影响

只要系统能自己完成这条链，它就已经具备最小 Agent 能力。

## 常见误区

- 把一次大模型调用当成 Agent
- 没有退出条件，导致系统乱跑
- 工具执行了，但结果没有写回下一轮上下文
- 消息只保留最后一轮，导致循环像“失忆”
- 一上来就堆很多复杂机制，反而看不清最小闭环

## 这节真正要理解什么

- Agent 的核心不是“会不会想”，而是“能不能在反馈里持续推进”
- 最小 Agent 内核就是“循环 + 工具”
- 不同模型平台接口不同，但循环本身是同一件事
- 后面所有章节，本质上都建立在这个循环之上

## 小结

- Agent 循环是整个系统的执行核心
- 真正重要的是“反馈驱动的持续收敛”
- 你先看懂这一章，后面的工具、计划、子 Agent、团队协作才不会碎成一堆概念

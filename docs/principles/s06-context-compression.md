# s06 上下文压缩

如果说 [s05 技能](./s05-skills.md) 解决的是“知识不要一次性全塞进来”，  
那么这一章解决的是另一个迟早会遇到的问题：

**上下文总会被执行过程塞满，系统应该怎么有策略地腾地方？**

这一章最重要的一句话是：

**压缩不是临时补丁，而是让 Agent 可以持续工作下去的基础设施。**

## 问题

上下文窗口永远是有限的。  
真正把上下文撑爆的，通常不是用户最初那一句任务，而是执行过程本身：

- 连续多轮对话
- 工具调用结果
- 读进来的长文件和网页
- 子 Agent 返回的大段内容
- 计划更新和中间推理

也就是说，Agent 越“会做事”，上下文越容易失控。

如果系统没有压缩机制，最后通常会出现三类问题：

- token 成本越来越高
- 模型开始抓不住重点
- 长任务根本跑不到结束

所以这一章真正要解决的不是“怎么写一个摘要函数”，而是：

**系统怎么把旧信息逐层移出活跃上下文，但又不至于彻底丢失。**

## 解决方案

更完整的做法，不是只在快爆掉时做一次总结，而是采用**三层压缩**：

- 第一层：每轮静默清理旧的工具结果
- 第二层：当上下文接近阈值时自动压缩整段对话
- 第三层：允许模型显式调用 `compact` 工具，主动触发压缩

把它画成最小结构，大概是这样：

```text
每一轮：

+------------------+
| 工具调用结果     |
+------------------+
        |
        v
[第一层：micro_compact]        （每轮静默执行）
  把过旧的 tool_result 替换成占位符
        |
        v
[检查：tokens 是否超阈值]
   |               |
   否              是
   |               |
   v               v
继续执行      [第二层：auto_compact]
              保存完整对话到 .transcripts/
              让模型生成连续性摘要
              用摘要替换大段旧上下文
                    |
                    v
            [第三层：compact 工具]
              模型需要时主动触发同样的压缩
```

这套机制的核心思想不是“删除历史”，而是：

**把历史从高成本的活跃上下文，逐步搬到更便宜的表达形式里。**

## 工作原理

### 1. 第一层：micro_compact 每轮都静默执行

第一层压缩最轻，也最频繁。  
它的目标不是总结整段历史，而是把那些已经用过、但暂时不需要再反复看的旧工具结果变短。

典型逻辑会是这样：

```python
def micro_compact(messages: list) -> list:
    tool_results = []
    for msg_idx, msg in enumerate(messages):
        if msg["role"] == "user" and isinstance(msg.get("content"), list):
            for part_idx, part in enumerate(msg["content"]):
                if isinstance(part, dict) and part.get("type") == "tool_result":
                    tool_results.append((msg_idx, part_idx, part))

    if len(tool_results) <= KEEP_RECENT:
        return messages

    for _, _, result in tool_results[:-KEEP_RECENT]:
        if len(result.get("content", "")) > 100:
            result["content"] = "[Previous: used tool]"

    return messages
```

它做的事情很克制：

- 最近几次工具结果保留原文
- 更早的长结果替换成占位符
- 不打断主流程，也不需要额外模型调用

所以第一层的价值是：

**用最便宜的方式，先把最明显的上下文垃圾清掉。**

### 2. 第二层：auto_compact 在接近阈值时自动压缩

第一层还不够，因为真正的大问题是整段对话累计过长。  
所以系统通常还需要在 token 接近阈值时自动做一次整体压缩。

典型流程会是这样：

1. 先把完整对话保存到磁盘
2. 再让模型生成一份连续性摘要
3. 用这份摘要替换掉大段旧历史

对应骨架大概是这样：

```python
def auto_compact(messages: list) -> list:
    transcript_path = TRANSCRIPT_DIR / f"transcript_{int(time.time())}.jsonl"

    with open(transcript_path, "w") as f:
        for msg in messages:
            f.write(json.dumps(msg, default=str) + "\n")

    response = client.messages.create(
        model=MODEL,
        messages=[{
            "role": "user",
            "content": (
                "Summarize this conversation for continuity. "
                "Include accomplishments, current state, and key decisions.\n\n"
                + json.dumps(messages, default=str)[:80000]
            ),
        }],
        max_tokens=2000,
    )

    summary = response.content[0].text

    return [
        {
            "role": "user",
            "content": f"[Conversation compressed. Transcript: {transcript_path}]\n\n{summary}",
        },
        {
            "role": "assistant",
            "content": "Understood. Continuing.",
        },
    ]
```

这段逻辑有两个非常关键的工程点：

- 完整历史先写入 `.transcripts/`，不是直接丢掉
- 活跃上下文只保留“足够继续做事”的摘要

所以第二层的本质是：

**对话不是消失了，而是被降级成更便宜的连续性表示。**

### 3. 第三层：让模型显式调用 `compact`

除了自动触发之外，一个更成熟的系统通常还会暴露一个 `compact` 工具，让模型在自己判断“现在该收缩上下文”时主动触发压缩。

工具定义通常会很简单：

```python
TOOLS = [
    {
        "name": "compact",
        "description": "Trigger manual conversation compression.",
        "input_schema": {
            "type": "object",
            "properties": {
                "focus": {
                    "type": "string",
                    "description": "What to preserve in the summary"
                }
            }
        },
    }
]
```

在循环里，它通常不会自己做复杂工作，而是作为一个显式开关：

```python
if block.name == "compact":
    manual_compact = True

if manual_compact:
    messages[:] = auto_compact(messages)
```

这一层很重要，因为自动压缩只能靠阈值判断，  
但模型自己有时更知道：

- 某个阶段已经结束
- 一大段工具结果后面不需要再保留原文
- 现在应该保留结论，开始进入新阶段

所以第三层的价值是：

**把压缩从被动防爆，升级成可主动调度的系统能力。**

### 4. 三层压缩最终会整合进主循环

完整循环通常会像这样把三层串起来：

```python
def agent_loop(messages: list):
    while True:
        micro_compact(messages)  # 第一层

        if estimate_tokens(messages) > THRESHOLD:
            messages[:] = auto_compact(messages)  # 第二层

        response = client.messages.create(
            model=MODEL,
            system=SYSTEM,
            messages=messages,
            tools=TOOLS,
            max_tokens=8000,
        )

        # ... 处理工具调用 ...

        if manual_compact:
            messages[:] = auto_compact(messages)  # 第三层
```

从这里你可以看出一件很重要的事：

- 压缩不是单独存在的“辅助函数”
- 它已经变成主循环的一部分

也就是说，到了这一章，上下文管理第一次成为 Agent 的正式运行机制。

## 为什么 transcript 落盘很关键

如果压缩只是“总结一下然后覆盖原文”，风险很大。  
因为一旦摘要质量不够好，细节就真的丢了。

所以更稳的系统会在压缩前先把完整对话存到 `.transcripts/`：

```text
.transcripts/
  transcript_1710000000.jsonl
  transcript_1710000325.jsonl
```

这样做的价值很直接：

- 出问题时可以回溯完整过程
- 压缩后仍然保留原始证据
- 后续如果需要，还能做更深层的恢复或审计

所以 transcript 的角色并不是“备份文件”这么简单，它是：

**把高成本上下文移出会话，但不让信息彻底消失。**

## 相对 s05 的变化

和 [s05 技能](./s05-skills.md) 相比，这一章真正新增的是“多层上下文治理”。

| 组件 | s05 | s06 |
| --- | --- | --- |
| 主问题 | 知识怎么按需注入 | 历史怎么按需压缩 |
| 新增工具 | `load_skill` | `compact` |
| 新增函数 | 技能装载 | `micro_compact`、`auto_compact` |
| 历史管理 | 基本没有专门机制 | 三层压缩 |
| 外部落盘 | 技能文件目录 | `.transcripts/` 对话归档 |

所以这章相对 `s05` 的关键增量不是“再加一个工具”，而是：

**系统第一次开始主动管理自己的上下文寿命。**

## 压缩、记忆、RAG 的区别

这三个概念特别容易混。

### 压缩 vs 记忆

- `压缩`解决的是“当前会话装不下了怎么办”
- `记忆`解决的是“跨会话、跨任务还要不要记住”

压缩更偏会话内治理，记忆更偏长期保留。

### 压缩 vs RAG

- `压缩`是在整理已经发生过的执行历史
- `RAG`是在按需补外部知识

一个在“收旧信息”，一个在“补新信息”。

复杂 Agent 往往两者都需要。

## 常见误区

- 只在最后快爆掉时才想起来压缩
- 压缩前不落盘，结果摘要一旦有问题就无法回溯
- 只做机械截断，不做语义摘要
- 最近几轮也一起压掉，导致模型失去短期工作记忆
- 把压缩当成一次性操作，而不是主循环里的持续机制

## 试一试

你可以用下面几个问题检查自己是否真的理解了这一章：

1. 为什么第一层要优先替换旧的 `tool_result`，而不是立刻总结整段历史？
2. 为什么自动压缩前最好先把 transcript 写到磁盘？
3. 为什么还需要 `compact` 这种手动触发工具？
4. 压缩和记忆、RAG 分别在解决什么问题？

如果这些问题你都能说清楚，就说明这章已经真正理解了。

## 这节真正要理解什么

- 上下文总会满，真正稳定的 Agent 必须有压缩机制
- 最实用的做法不是单层压缩，而是分层治理
- 压缩不是“删除历史”，而是把历史转成更便宜的表示形式
- transcript 落盘让系统具备了“能收缩，也能回溯”的能力

## 小结

- 技能解决“知识按需加载”，压缩解决“历史按需保留”
- 三层压缩让系统可以在长任务里持续工作
- 到了这一章，Agent 才真正开始具备“无限会话”的雏形

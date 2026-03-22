# s09 Agent 团队

如果说 [s08 后台任务](./s08-background-tasks.md) 解决的是“长任务怎么放到后台继续跑”，  
那么这一章解决的是另一个更进一步的问题：

**当一个 Agent 一个人干不完时，系统怎么把任务稳定地分给一组长期存在的队友，而不是每次都临时生成一次性子 Agent？**

这一章最重要的一句话是：

**Agent 团队不是“多开几个 Agent”这么简单，而是“持久化队友 + 通信通道 + 生命周期管理”。**

## 问题

到 [s04 子 Agent](./s04-sub-agents.md) 为止，系统已经能把局部任务委派给一个临时执行单元。  
但子 Agent 有一个很明显的特点：

- 创建
- 干活
- 返回摘要
- 结束

它没有长期身份，也没有跨多轮协作的存在感。

而 [s08 后台任务](./s08-background-tasks.md) 虽然已经让任务可以异步跑起来，但它更像“后台 worker 执行一段任务”，还不是“多个长期角色之间的协作系统”。

真正的团队协作，通常需要这三样东西：

- 能跨多轮存在的持久化队友
- 可管理的身份和状态
- 队友之间的通信通道

所以这一章真正要解决的是：

**系统怎么把一次性的委派，升级成可持续协作的团队。**

## 解决方案

更稳的做法，是引入两层结构：

- `TeammateManager`：管理队友名册、身份和生命周期
- `MessageBus`：给每个队友一个可读可写的收件箱

把它画成最小结构，大概是这样：

```text
队友生命周期：
  spawn -> WORKING -> IDLE -> WORKING -> ... -> SHUTDOWN

通信结构：

.team/
  config.json        <- 团队名册 + 状态
  inbox/
    alice.jsonl      <- 追加写入，读取后清空
    bob.jsonl
    lead.jsonl

         +--------+   send("alice","bob","...")   +--------+
         | alice  | ----------------------------> |  bob   |
         | loop   |   bob.jsonl << {json_line}    |  loop  |
         +--------+                               +--------+
              ^                                        |
              |      BUS.read_inbox("alice")          |
              +---- alice.jsonl -> read + drain ------+
```

这说明团队机制真正新增的，不只是“有多个角色”，而是：

- 队友有名字
- 队友有状态
- 队友之间能发消息
- 队友可以在多轮之间持续存在

## 工作原理

### 1. `TeammateManager` 管理团队名册

团队系统通常会先有一个名册管理器，把每个队友记录下来。

最小骨架可能长这样：

```python
class TeammateManager:
    def __init__(self, team_dir: Path):
        self.dir = team_dir
        self.dir.mkdir(exist_ok=True)
        self.config_path = self.dir / "config.json"
        self.config = self._load_config()
        self.threads = {}
```

这里最关键的不是 Python 语法，而是：

- 团队信息不只存在内存里
- 它会被写到 `.team/config.json`

这意味着系统终于有了“谁在团队里、每个人现在是什么状态”的持久化记录。

例如：

```json
{
  "team_name": "default",
  "members": [
    {"name": "alice", "role": "researcher", "status": "working"},
    {"name": "bob", "role": "coder", "status": "idle"}
  ]
}
```

### 2. `spawn()` 创建的是持久化队友，不是一次性子 Agent

在团队系统里，创建队友通常不是简单 `run_subagent(prompt)`，而是显式注册一个成员并启动它的运行线程。

```python
def spawn(self, name: str, role: str, prompt: str) -> str:
    member = {"name": name, "role": role, "status": "working"}
    self.config["members"].append(member)
    self._save_config()

    thread = threading.Thread(
        target=self._teammate_loop,
        args=(name, role, prompt),
        daemon=True,
    )
    thread.start()
    return f"Spawned '{name}' (role: {role})"
```

这和 `s04` 最大的区别在于：

- 子 Agent 更像一次委派
- 队友更像一个有身份的长期成员

所以团队里的成员不是“跑完就忘”的执行单元，而是：

**一个后续还可以继续通信、继续派活、继续复用的角色。**

### 3. `MessageBus` 提供队友之间的异步收件箱

如果团队里只有多个成员，但没有稳定通信方式，那本质上还是“多个孤立 Agent”。

所以参考实现里最关键的新增之一，就是文件化邮箱。

最小骨架大概是这样：

```python
class MessageBus:
    def send(self, sender, to, content, msg_type="message", extra=None):
        msg = {
            "type": msg_type,
            "from": sender,
            "content": content,
            "timestamp": time.time(),
        }
        if extra:
            msg.update(extra)

        with open(self.dir / f"{to}.jsonl", "a") as f:
            f.write(json.dumps(msg) + "\n")

    def read_inbox(self, name):
        path = self.dir / f"{name}.jsonl"
        if not path.exists():
            return []
        msgs = [json.loads(l) for l in path.read_text().splitlines() if l]
        path.write_text("")
        return msgs
```

这套设计有几个非常关键的工程点：

- 每个成员有自己的 inbox 文件
- `send()` 采用 append-only 追加写入
- `read_inbox()` 读取后清空，相当于“drain-on-read”

所以它更像一个简化版异步消息系统，而不是普通函数调用。

### 4. 每个队友会在自己的循环里检查邮箱

团队成员不是等着主 Agent 一次次显式调用，而是自己在独立循环里工作。

典型逻辑会是这样：

```python
def _teammate_loop(self, name, role, prompt):
    messages = [{"role": "user", "content": prompt}]

    for _ in range(50):
        inbox = BUS.read_inbox(name)
        if inbox:
            messages.append({
                "role": "user",
                "content": f"<inbox>{json.dumps(inbox, indent=2)}</inbox>",
            })
            messages.append({
                "role": "assistant",
                "content": "Noted inbox messages.",
            })

        response = client.messages.create(...)

        if response.stop_reason != "tool_use":
            break

    self._find_member(name)["status"] = "idle"
```

这段代码说明了一件很重要的事：

- 队友不是被动对象
- 每个队友自己就有独立的推理循环
- 收件箱消息会在进入下一轮推理前先注入上下文

所以团队协作的本质不是“主 Agent 直接替别人做决定”，而是：

**主 Agent 和队友之间通过消息来协调，各自保留局部自主性。**

### 5. 主协调者也有自己的收件箱

团队不是单向派发。  
除了主协调者给队友发消息，队友也需要把结果或请求发回来。

所以 `lead` 自己通常也有收件箱，例如：

```python
def agent_loop(messages: list):
    while True:
        inbox = BUS.read_inbox("lead")
        if inbox:
            messages.append({
                "role": "user",
                "content": f"<inbox>{json.dumps(inbox, indent=2)}</inbox>",
            })
            messages.append({
                "role": "assistant",
                "content": "Noted inbox messages.",
            })

        response = client.messages.create(...)
```

这一点非常关键，因为它说明团队系统不是简单的“主管理者广播命令”，而是：

- 主协调者有自己的推理循环
- 队友也会把消息回传给主协调者
- 团队整体是一个双向通信系统

### 6. 团队和子 Agent 的真正区别，是“持久身份”

很多人会把团队理解成“更高级的子 Agent”。  
这不够准确。

更准确的区分是：

- `子 Agent`：一次性局部执行单元
- `队友 Agent`：有身份、有状态、有收件箱的长期成员

所以从 `s04` 到 `s09` 的关键变化，不是“Agent 数量增加了”，而是：

**系统第一次引入了长期存在的协作个体。**

## 为什么邮箱机制比直接函数调用更重要

从表面看，完全可以写成：

```python
result = alice.run(task)
```

但一旦进入真实协作，这种同步调用很快就不够了，因为你需要：

- 异步发送消息
- 一次发给多个成员
- 允许队友稍后回复
- 把通信过程显式保留为系统状态

这也是为什么参考实现里用了 JSONL inbox，而不是直接在函数里传参。

邮箱机制的真正价值是：

- 通信可持久化
- 通信可追踪
- 通信和执行时序解耦

所以它不是“只是个实现细节”，而是团队系统的骨架之一。

## 相对 s08 的变化

和 [s08 后台任务](./s08-background-tasks.md) 相比，这一章真正新增的是“持久化协作成员 + 异步邮箱通信”。

| 组件 | s08 | s09 |
| --- | --- | --- |
| 主问题 | 长任务如何异步跑 | 多个长期成员如何协作 |
| 执行单元 | 后台 worker / 子任务 | 持久化队友 |
| 身份 | 多半围绕 task_id | 明确的 teammate name / role |
| 通信 | 通常是状态回写或通知 | inbox 消息收发 |
| 持久化 | 任务文件 | `.team/config.json` + `inbox/*.jsonl` |

所以这章相对 `s08` 的关键增量不是“后台任务更多了”，而是：

**系统第一次把异步执行升级成了有身份的团队协作。**

## 什么场景最适合用 Agent 团队

下面这些情况，通常已经开始适合引入团队机制：

- 某些角色会在很多任务里反复出现
- 不同角色天然需要不同职责边界
- 协作不是一次性的，而是会持续多轮
- 你希望不同成员之间能相互发消息，而不只是统一回到主 Agent
- 你需要“研究员 / 编码者 / 审查者 / 协调者”这类稳定分工

例如：

- `lead` 负责总控，`researcher` 负责资料搜集，`coder` 负责修改代码，`reviewer` 负责验收
- 一个成员专门盯日志，一个成员专门执行修复，最后由协调者整合结果

## 常见误区

- 把“多个 Agent 同时存在”直接等同于“有团队”
- 队友没有持久化身份，下一轮就认不出谁是谁
- 只有角色名，没有收件箱和通信机制
- 队友执行完后不更新状态，系统不知道谁空闲谁忙
- 所有成员直接共享全部上下文，结果反而更混乱

## 试一试

你可以用下面几个问题检查自己是否真的理解了这一章：

1. 为什么子 Agent 不能直接替代 Agent 团队？
2. `config.json` 和 `inbox/*.jsonl` 分别解决什么问题？
3. 为什么 `send()` / `read_inbox()` 比普通函数调用更适合团队协作？
4. 为什么主协调者自己也需要收件箱？

如果这些问题你都能说清楚，就说明这章已经理解到位了。

## 这节真正要理解什么

- 团队的关键不是人数，而是长期身份、状态和通信
- 持久化队友让协作从“一次性委派”升级为“长期分工”
- JSONL 邮箱把 Agent 之间的通信显式落盘了
- 这也是后面 [s10 团队协议](./s10-team-protocol.md) 必须存在的前提

## 小结

- 子 Agent 是一次性执行单元，Agent 团队是长期协作系统
- `TeammateManager` 管身份和生命周期，`MessageBus` 管通信
- 到了这一章，系统才真正开始具备“有队友、有分工、有消息往来”的协作能力

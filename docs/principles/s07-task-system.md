# s07 任务系统

如果说 [s06 上下文压缩](./s06-context-compression.md) 解决的是“上下文太长怎么办”，  
那么这一章解决的是另一个更工程化的问题：

**大目标拆成很多小任务之后，系统怎么把这些任务排好序、持久化、追踪状态，并在依赖满足时继续推进？**

这一章最值得记住的一句话是：

**任务系统不是让 Agent 更会想，而是让系统更会管理一串事。**

## 问题

到 [s03 TodoWrite](./s03-todowrite.md) 为止，系统已经有了“计划清单”。  
但 Todo 更像是内存里的可视化计划，它仍然有几个明显限制：

- 它是扁平的，不表达前后依赖
- 它通常只活在当前会话内，不适合长期追踪
- 它不能稳定回答“现在什么能做，什么还被卡住”
- 它也不方便支撑并发执行、失败恢复和任务恢复

真实任务往往不是一条线，而是一个有结构的图。例如：

- 先搜集资料
- 再整理约束
- 然后生成方案
- 最后做校验

再复杂一点时，还会出现：

- 任务 B 依赖任务 A
- 任务 C 和 D 可以并行
- 任务 E 要等 C 和 D 都完成

如果系统没有显式表达这种关系，它就只能把顺序写死在 prompt 里。这样一来：

- 模型自己要记住顺序
- 上下文一压缩，顺序关系就容易丢
- 子 Agent、后台任务、团队协作都很难接上来

## 解决方案

更稳的做法，是把扁平 Todo 升级为**任务图（task graph）**，并把它持久化到磁盘。

也就是说，每个任务不再只是脑子里的“待办项”，而是一个真正存在的任务对象，例如：

```python
task = {
    "id": 4,
    "subject": "生成技术方案",
    "status": "pending",
    "blockedBy": [2, 3],
    "blocks": [],
    "owner": "",
}
```

这些任务通常会被保存成独立的 JSON 文件：

```text
.tasks/
  task_1.json  {"id":1, "status":"completed"}
  task_2.json  {"id":2, "blockedBy":[1], "status":"pending"}
  task_3.json  {"id":3, "blockedBy":[1], "status":"pending"}
  task_4.json  {"id":4, "blockedBy":[2,3], "status":"pending"}
```

一旦任务关系被显式写出来，系统就能稳定回答三个问题：

- 什么任务现在可以做
- 什么任务仍然被别的任务阻塞
- 什么任务已经完成，并且解锁了后续工作

把它画成最小结构，大概是这样：

```text
任务图（DAG）:

                 +----------+
            +--> | task 2   | --+
            |    | pending  |   |
+----------+     +----------+    +--> +----------+
| task 1   |                          | task 4   |
| completed| --> +----------+    +--> | blocked  |
+----------+     | task 3   | --+     +----------+
                 | pending  |
                 +----------+

顺序: task 1 必须先完成，才能开始 2 和 3
并行: task 2 和 3 可以同时执行
依赖: task 4 要等 2 和 3 都完成
状态: pending -> in_progress -> completed
```

这就是任务系统真正带来的变化：  
系统第一次有了**独立于对话上下文之外的执行骨架**。

## 工作原理

### 1. TaskManager 负责把任务落到磁盘

这一层通常会有一个 `TaskManager`，专门负责任务的创建、读取、更新和保存。

```python
class TaskManager:
    def __init__(self, tasks_dir: Path):
        self.dir = tasks_dir
        self.dir.mkdir(exist_ok=True)
        self._next_id = self._max_id() + 1

    def create(self, subject, description=""):
        task = {
            "id": self._next_id,
            "subject": subject,
            "description": description,
            "status": "pending",
            "blockedBy": [],
            "blocks": [],
            "owner": "",
        }
        self._save(task)
        self._next_id += 1
        return json.dumps(task, indent=2)
```

这里最关键的不是 Python 语法，而是两个工程点：

- 每个任务都有稳定 ID
- 任务状态不只存在内存里，而是直接存到 `.tasks/` 目录

这意味着即使对话被压缩、Agent 重启，任务结构仍然还在。

### 2. 依赖关系写在任务对象里，而不是写在 prompt 里

任务系统和普通 Todo 最大的不同，就是它显式记录依赖边：

- `blockedBy`：这个任务被谁卡住
- `blocks`：这个任务完成后会解锁谁

例如：

```python
task = {
    "id": 4,
    "subject": "生成技术方案",
    "status": "pending",
    "blockedBy": [2, 3],
    "blocks": [],
}
```

这表示 `task 4` 不能立即执行，必须等 `2` 和 `3` 都完成。

这样做的好处是：

- 调度器不需要重新推理顺序
- 后台 worker 也能直接读任务状态
- 多个 Agent 协作时，不需要靠聊天历史记住依赖

### 3. 完成任务时，系统自动解除依赖

任务系统真正变得“活起来”，不是因为它会保存 JSON，而是因为它会在状态变化时更新图关系。

典型逻辑会是这样：

```python
def _clear_dependency(self, completed_id):
    for f in self.dir.glob("task_*.json"):
        task = json.loads(f.read_text())
        if completed_id in task.get("blockedBy", []):
            task["blockedBy"].remove(completed_id)
            self._save(task)
```

这段逻辑的含义是：

- 某个任务一旦 `completed`
- 它会自动从其他任务的 `blockedBy` 里被移除
- 原本被卡住的任务就可能变成可执行状态

所以任务系统不只是“记账”，它还在维护整个任务图的推进关系。

### 4. 任务更新不只是改状态，还会更新依赖边

一个更完整的 `update()` 往往既处理状态，也处理依赖关系：

```python
def update(self, task_id, status=None, add_blocked_by=None, add_blocks=None):
    task = self._load(task_id)

    if status:
        task["status"] = status
        if status == "completed":
            self._clear_dependency(task_id)

    if add_blocked_by:
        task["blockedBy"] = list(set(task["blockedBy"] + add_blocked_by))

    if add_blocks:
        task["blocks"] = list(set(task["blocks"] + add_blocks))

    self._save(task)
    return json.dumps(task, indent=2)
```

也就是说，任务对象不是静态记录，而是可以被系统持续演化的状态单元。

### 5. 任务系统最终会暴露成一组任务工具

到了 Agent 层，这套能力通常会暴露成几类专用工具：

- `task_create`
- `task_update`
- `task_list`
- `task_get`

接入方式通常和前几章一样，都是走 dispatch map：

```python
TOOL_HANDLERS = {
    "task_create": lambda **kw: TASKS.create(
        kw["subject"], kw.get("description", "")
    ),
    "task_update": lambda **kw: TASKS.update(
        kw["task_id"],
        kw.get("status"),
        kw.get("addBlockedBy"),
        kw.get("addBlocks"),
    ),
    "task_list": lambda **kw: TASKS.list_all(),
    "task_get": lambda **kw: TASKS.get(kw["task_id"]),
}
```

这说明任务系统不是一个“旁边的数据库功能”，而是正式进入了 Agent 的工具调用链路。

## 为什么说它是协调骨架

这一章真正的价值，不只是“多了四个任务工具”，而是：

- [s03 TodoWrite](./s03-todowrite.md) 有了更强的执行底座
- [s04 子 Agent](./s04-sub-agents.md) 可以把子任务写入统一任务结构
- [s08 后台任务](./s08-background-tasks.md) 可以异步执行任务并回写状态
- [s09 Agent 团队](./s09-agent-teams.md) 可以围绕同一套任务图协作

换句话说：

- Todo 更像“计划视图”
- 任务系统更像“执行和协调底座”

## 相对 s06 的变化

和 [s06 上下文压缩](./s06-context-compression.md) 相比，这一章真正新增的是“任务图 + 持久化状态”。

| 组件 | s06 | s07 |
| --- | --- | --- |
| 规划载体 | 对话上下文 + 压缩摘要 | 磁盘上的任务图 |
| 任务形态 | 隐含在上下文里 | 显式任务对象 |
| 依赖关系 | 没有稳定表达 | `blockedBy` + `blocks` |
| 状态追踪 | 会话内临时理解 | `pending / in_progress / completed` |
| 持久化 | 压缩后容易丢上下文细节 | 任务文件独立存在 |
| 后续能力 | 便于保留重点 | 便于调度、恢复、并发和协作 |

所以这章相对 `s06` 的关键增量不是“又多了一种状态”，而是：

**系统第一次把任务关系从对话里拿出来，做成了可持久化的外部结构。**

## 什么场景最适合上任务系统

下面这些情况，通常已经不适合只靠 Todo 或 prompt 记忆：

- 任务之间有明确前后依赖
- 一部分子任务可以并行执行
- 任务需要跨多轮、跨压缩甚至跨进程保留
- 你希望后台 worker 或多个 Agent 共用同一套进度结构
- 你需要失败重试、取消、恢复这类能力

例如：

- “先扫描代码仓库，再生成改动计划，最后执行修改”
- “先创建数据清洗任务，再创建训练任务，最后创建评估任务”
- “主 Agent 负责总控，子 Agent 各自处理不同模块，但共用同一个任务图”

## 常见误区

- 只有任务标题，没有唯一 ID，结果无法稳定追踪
- 依赖关系写在 prompt 里，而不是任务对象里
- 任务状态过于随意，导致调度器无法可靠判断
- 只会新增任务，不会在完成时清除依赖
- 任务放在内存里，压缩或重启后整个图就没了

## 试一试

你可以用下面几个问题检查自己是否真的理解了这一章：

1. 如果 `task 4` 依赖 `task 2` 和 `task 3`，系统应该把这个关系写在哪里？
2. 为什么 `TodoWrite` 不能直接替代任务系统？
3. 为什么任务文件写到磁盘后，更适合承接后台任务和多 Agent 协作？
4. 当一个任务被标记为 `completed` 时，系统除了改状态，还应该做什么？

如果这些问题你都能说清楚，就说明你已经抓住这一章的核心了。

## 这节真正要理解什么

- 任务系统解决的是“系统如何管理一串任务”，不是“模型如何思考”
- 它把任务关系从 prompt 和对话历史里拿了出来
- 它第一次给 Agent 系统提供了真正可持久化的协调骨架
- 后面的并发、后台任务、团队协作，都会依赖这一层

## 小结

- Todo 是计划外显，任务系统是执行底座
- 任务图的核心不是列表，而是依赖、状态和持久化
- 到了这一章，Agent 才开始真正具备“管理复杂工作流”的工程基础

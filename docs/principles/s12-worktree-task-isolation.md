# s12 Worktree + 任务隔离

如果说 [s11 自主 Agent](./s11-autonomous-agents.md) 解决的是“队友能不能自己看任务板、自己认领任务”，  
那么这一章解决的是最后一个非常硬的工程问题：

**任务板已经能决定“做什么”，但系统还需要决定“在哪做”，否则多个任务一并发，文件修改就会互相污染。**

这一章最重要的一句话是：

**任务管目标，worktree 管目录，两者必须按 ID 显式绑定。**

## 问题

到 `s11` 为止，团队已经能：

- 自主认领任务
- 长期协作
- 通过任务板跟踪 `pending / in_progress / completed`

但如果所有任务都还共享同一个工作目录，问题很快就会出现。

例如两个 Agent 同时处理不同任务：

- A 在改 `config.py`
- B 也在改 `config.py`

这时哪怕任务板本身没问题，执行层仍然会互相污染：

- 未提交改动互相覆盖
- 回滚时不知道该还原谁的修改
- 测试结果可能串到另一条任务链上
- 一次失败会影响其他任务的工作区

所以这一章真正要解决的是：

**任务板只负责“目标和状态”，还必须再补一层“目录和执行环境”的隔离。**

## 解决方案

更稳的做法，是把系统拆成两个平面：

- `Control Plane`：任务板，负责目标、状态、owner、依赖
- `Execution Plane`：worktree，负责独立目录、分支、命令执行

两者通过 `task_id` 和 `worktree` 名称显式绑定。

把它画成最小结构，大概是这样：

```text
控制平面（.tasks/）                执行平面（.worktrees/）
+------------------+              +------------------------+
| task_1.json      |              | auth-refactor/         |
|   status: in_progress <------>  |   branch: wt/auth-refactor
|   worktree: "auth-refactor" |   |   task_id: 1           |
+------------------+              +------------------------+
| task_2.json      |              | ui-login/              |
|   status: pending    <------>   |   branch: wt/ui-login  |
|   worktree: "ui-login"       |  |   task_id: 2           |
+------------------+              +------------------------+
                                  |
                        index.json   （worktree 注册表）
                        events.jsonl （生命周期事件流）

状态机：
  Task:     pending -> in_progress -> completed
  Worktree: absent  -> active      -> removed | kept
```

这说明 worktree 不只是“多建一个 Git 目录”，而是：

- 每个任务有独立工作空间
- 每个工作空间有自己的生命周期
- 任务状态和 worktree 状态会相互联动

## 工作原理

### 1. 先创建任务，持久化“目标”

第一步仍然是先把任务写进任务板。

例如：

```python
TASKS.create("Implement auth refactor")
# -> .tasks/task_1.json
# -> status = pending
# -> worktree = ""
```

这一步和前几章一致，表示系统先知道“要做什么”。  
但这时任务还没有自己的执行目录。

### 2. 创建 worktree，并把它绑定到任务

真正的新东西，是第二步：

- 为任务创建独立 worktree
- 同时把这个 worktree 名称回写到任务对象里

例如：

```python
WORKTREES.create("auth-refactor", task_id=1)

# 对应操作：
# git worktree add -b wt/auth-refactor .worktrees/auth-refactor HEAD
```

这一步完成后，会同时写入两边状态：

- `.worktrees/index.json` 增加一条目录记录
- `.tasks/task_1.json` 写入 `worktree = "auth-refactor"`

绑定逻辑通常长这样：

```python
def bind_worktree(self, task_id, worktree):
    task = self._load(task_id)
    task["worktree"] = worktree
    if task["status"] == "pending":
        task["status"] = "in_progress"
    self._save(task)
```

这里最关键的点是：

- 绑定不仅仅是“记一个名字”
- 它还会驱动任务状态从 `pending` 进入 `in_progress`

所以 worktree 的创建，不只是环境准备动作，而是任务正式开始执行的信号。

### 3. 真正执行命令时，`cwd` 切到 worktree 目录

worktree 的核心价值，不在于 Git 命令本身，而在于：

**后续所有执行都在这个隔离目录里进行。**

例如：

```python
subprocess.run(
    command,
    shell=True,
    cwd=worktree_path,
    capture_output=True,
    text=True,
    timeout=300,
)
```

这意味着：

- A 任务在 `auth-refactor/` 目录改文件
- B 任务在 `ui-login/` 目录改文件

即便它们都对应同一个仓库，也不再直接共享同一个物理工作区。

这一步就是“任务隔离”真正落地的地方：

- 不是逻辑上说“你们别互相影响”
- 而是物理上把工作目录分开

### 4. `index.json` 让系统知道有哪些 worktree 仍然存在

如果只靠 Git worktree 命令本身，系统很难完整掌握自己的执行平面。  
所以参考页里还单独维护了一份 `.worktrees/index.json`。

它会记录每个 worktree 的信息，例如：

```json
{
  "worktrees": [
    {
      "name": "auth-refactor",
      "path": ".worktrees/auth-refactor",
      "branch": "wt/auth-refactor",
      "task_id": 1,
      "status": "active"
    }
  ]
}
```

这份索引的价值很直接：

- 系统知道哪些目录是当前活跃 worktree
- 任务恢复时，可以从索引反推目录状态
- 主协调者或后台组件可以查看执行环境分布

所以这不是“重复存一份信息”，而是：

**让执行平面本身也有可查询的系统状态。**

### 5. `events.jsonl` 记录生命周期事件

除了状态表，参考实现里还很强调事件流。

例如在 `.worktrees/events.jsonl` 里记录：

```json
{
  "event": "worktree.remove.after",
  "task": {"id": 1, "status": "completed"},
  "worktree": {"name": "auth-refactor", "status": "removed"},
  "ts": 1730000000
}
```

常见事件包括：

- `worktree.create.before / after / failed`
- `worktree.remove.before / after / failed`
- `worktree.keep`
- `task.completed`

这层事件流特别重要，因为它解决了两个问题：

- 生命周期不再只存在最终状态里
- 系统可以回看“这个目录是什么时候创建、什么时候销毁、为什么失败”

所以 `events.jsonl` 的意义不是普通日志，而是：

**把执行平面的关键动作变成可追踪的事件流。**

### 6. 收尾时，不只是删目录，而是同步推进任务状态

任务做完后，worktree 的处理通常有两种：

- `worktree_keep(name)`：保留目录供后续人工检查或继续工作
- `worktree_remove(name, complete_task=True)`：删除目录，并把绑定任务推进到完成

更完整的收尾逻辑通常会是这样：

```python
def remove(self, name, force=False, complete_task=False):
    self._run_git(["worktree", "remove", wt["path"]])

    if complete_task and wt.get("task_id") is not None:
        self.tasks.update(wt["task_id"], status="completed")
        self.tasks.unbind_worktree(wt["task_id"])
        self.events.emit("task.completed", ...)
```

这里最重要的是：

- worktree 生命周期和任务生命周期不是孤立的
- 删除目录时，可以顺手推进任务完成
- 解绑 worktree，避免任务对象继续挂着过期目录名

所以这一步不只是清理磁盘，而是：

**把执行层的收尾动作同步回控制平面。**

### 7. 崩溃恢复依赖 `.tasks/ + index.json`

长期运行系统最怕的不是一次执行失败，而是崩溃之后现场丢失。

如果系统重启后还能从下面两份状态恢复：

- `.tasks/`：知道任务目标和当前状态
- `.worktrees/index.json`：知道目录、分支和绑定关系

那么会话上下文即使丢了，系统仍然能恢复大部分现场。

这也是这一章特别重要的一个观点：

- 会话记忆是易失的
- 磁盘状态才是持久的

所以 worktree 隔离的价值，不只是防污染，还包括：

**为系统提供更强的崩溃恢复能力。**

## 为什么这章才真正把“协作”落到工程层

前几章已经解决了很多高层能力：

- `s09` 有队友
- `s10` 有协议
- `s11` 有自组织认领

但如果这些队友最后还是都在同一个目录里改文件，那么协作仍然很脆弱。

真正到了工程落地层，系统必须同时满足：

- 谁做什么：任务板
- 谁和谁怎么协商：协议
- 谁在哪做：worktree / 目录隔离

这就是为什么这一章不是“附加优化”，而是整个系列收尾的一层基础设施。

## 相对 s11 的变化

和 [s11 自主 Agent](./s11-autonomous-agents.md) 相比，这一章真正新增的是“显式的执行目录平面”。

| 组件 | s11 | s12 |
| --- | --- | --- |
| 主问题 | 队友如何自己找活和认领 | 多个任务如何在物理环境上彻底隔离 |
| 执行范围 | 仍可能共享一个目录 | 每个任务独立 worktree |
| 状态对象 | 任务板为主 | 任务板 + worktree 索引 |
| 生命周期 | 任务认领和完成 | 任务生命周期 + worktree 生命周期 |
| 追踪方式 | 任务状态 | 任务状态 + 事件流 |

所以这章相对 `s11` 的关键增量不是“又多了几个工具”，而是：

**系统第一次把‘做什么’和‘在哪做’彻底拆开了。**

## 什么场景最适合上 worktree + 隔离

下面这些情况，通常已经非常适合引入这一层：

- 多个任务会并行修改同一个仓库
- 不同队友需要各自产出独立 patch
- 任务之间需要清晰回滚边界
- 你需要保留某个任务的实验现场，同时不影响其他任务继续工作
- 崩溃后希望能恢复任务与目录的绑定关系

例如：

- 一个队友改认证模块，一个队友改 UI 登录流程
- 一个任务做探索性实验，另一个任务做保守修复
- 同一个仓库里并行做多个问题修复，但不希望未提交改动互相踩踏

## 常见误区

- 只有 Git 分支，没有独立目录，结果未提交改动仍然互相污染
- 建了 worktree，但任务对象里没有绑定字段，导致控制平面和执行平面脱节
- 任务完成后不解绑 worktree，留下过期目录引用
- 没有 `index.json`，系统重启后不知道当前有哪些 worktree
- 没有事件流，只能看最终状态，无法理解生命周期过程

## 试一试

你可以用下面几个问题检查自己是否真的理解了这一章：

1. 为什么任务板只能解决“做什么”，不能解决“在哪做”？
2. 为什么 worktree 必须和 `task_id` 显式绑定？
3. `index.json` 和 `events.jsonl` 分别解决什么问题？
4. 为什么 `worktree_remove(..., complete_task=True)` 这种联动收尾很重要？

如果这些问题你都能说清楚，就说明你已经抓住这一章的核心了。

## 这节真正要理解什么

- 真正的任务隔离，不只是状态隔离，还包括目录和执行环境隔离
- 任务板和 worktree 是两个平面，必须显式绑定
- `index.json` 和 `events.jsonl` 让执行平面也有状态和生命周期记录
- 到这一章，Agent 系统才真正具备较完整的并发修改和工程恢复能力

## 小结

- `s11` 让队友自己找活，`s12` 让每个任务有自己的工作目录
- 任务管目标，worktree 管目录，事件流管生命周期
- 这也是把 Agent 从“会协作”推进到“工程上真正可控”的最后一层关键基础设施

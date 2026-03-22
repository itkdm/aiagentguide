# s05 技能

如果说 [s04 子 Agent](./s04-sub-agents.md) 解决的是“复杂任务如何拆成干净的子上下文”，  
那么这一章解决的是另一个非常实际的问题：

**模型需要某类专业知识时，应该把它一直塞在 system prompt 里，还是按需加载？**

这一章最重要的一句话可以概括成：

**技能不是一段永久贴在 system prompt 里的长提示词，而是一种按需注入的知识单元。**

## 问题

很多 Agent 一开始都会把“需要遵守的知识和规范”全部写进 system prompt。

例如：

- Git 工作流约定
- 代码审查清单
- 测试规范
- 某个领域的知识说明

这种做法看起来简单，但很快就会出问题：

- system prompt 变得很长
- 大多数知识与当前任务无关，却每轮都在消耗上下文
- 同样的知识难以独立维护和复用
- 任务一复杂，主上下文会被大量说明性文本污染

换句话说，问题不在于“这些知识要不要有”，而在于：

**它们应该一直挂在主上下文里，还是只在真正需要的时候加载？**

## 解决方案

更稳的做法，是把技能做成**可按需加载的知识包**，分成两层注入：

- 第一层：在 system prompt 里只放技能名称和简短描述
- 第二层：当模型判断需要某个技能时，再通过工具把完整内容注入回来

把它画成最小结构，大概是这样：

```text
第一层：常驻 system prompt（便宜）

+--------------------------------------+
| You are a coding agent.              |
| Skills available:                    |
|   - git: Git workflow helpers        |
|   - test: Testing best practices     |
+--------------------------------------+

第二层：按需 tool_result 注入（贵，但只在需要时发生）

+--------------------------------------+
| <skill name="git">                   |
|   完整的 Git 工作流说明              |
|   检查步骤、注意事项、输出要求       |
| </skill>                             |
+--------------------------------------+
```

也就是说，模型平时只知道“有哪些技能”，真正需要时再调用 `load_skill("git")` 之类的工具，把完整知识拿回来。

## 工作原理

### 1. 每个技能通常是一个独立目录

参考实现里，技能不是散落在代码里的几段字符串，而是单独落盘的目录结构：

```text
skills/
  pdf/
    SKILL.md
  code-review/
    SKILL.md
```

每个 `SKILL.md` 往往会带上 frontmatter 和正文，例如：

```md
---
name: code-review
description: Review code for correctness and risk
---

适用场景：
- 后端接口审查
- 前端回归检查

执行要求：
- 先列严重问题
- 再列行为回归风险
```

这种设计的好处是：

- 技能可以独立维护
- 技能可以被多个 Agent 复用
- 技能本身可以继续拆成不同目录

### 2. SkillLoader 负责扫描和解析技能

系统里通常会有一个 `SkillLoader`，负责扫描 `skills/*/SKILL.md`，把元信息和正文拆出来。

```python
class SkillLoader:
    def __init__(self, skills_dir: Path):
        self.skills = {}
        for f in sorted(skills_dir.rglob("SKILL.md")):
            text = f.read_text()
            meta, body = self._parse_frontmatter(text)
            name = meta.get("name", f.parent.name)
            self.skills[name] = {
                "meta": meta,
                "body": body,
            }

    def get_descriptions(self) -> str:
        lines = []
        for name, skill in self.skills.items():
            desc = skill["meta"].get("description", "")
            lines.append(f"  - {name}: {desc}")
        return "\n".join(lines)

    def get_content(self, name: str) -> str:
        skill = self.skills.get(name)
        if not skill:
            return f"Error: Unknown skill '{name}'."
        return f"<skill name=\"{name}\">\n{skill['body']}\n</skill>"
```

这里真正关键的不是“会读文件”，而是它把技能拆成了两类信息：

- `description`：给模型做低成本提示
- `body`：真正执行任务时才需要的完整知识

### 3. 第一层写进 system prompt

系统提示里不再塞完整技能内容，而只放“技能目录”：

```python
SYSTEM = f"""You are a coding agent at {WORKDIR}.

Skills available:
{SKILL_LOADER.get_descriptions()}
"""
```

这样做的好处很明确：

- 模型知道自己可以调用哪些技能
- system prompt 不会被大量无关细节撑爆
- 技能数量增加时，主提示词不会线性膨胀

所以第一层的本质是：

**让模型知道“可以去哪里找知识”，而不是一上来就把所有知识全部背在身上。**

### 4. 第二层通过工具按需加载

真正完整的技能内容，通常是通过一个专用工具返回：

```python
TOOL_HANDLERS = {
    "load_skill": lambda **kw: SKILL_LOADER.get_content(kw["name"]),
}
```

模型调用之后，拿到的不是一句话，而是一整个 `<skill>...</skill>` 包裹的正文：

```python
<skill name="code-review">
先找高风险问题。
再检查行为回归。
最后输出最小修复建议。
</skill>
```

这就是“第二层注入”的核心：

- 知识不是常驻在 system prompt
- 而是在当前任务真正需要时，作为 `tool_result` 回到上下文

所以技能在工程上并不是“另一个 prompt 文件”，而是一个**可以被 Agent 显式请求的知识工具**。

### 5. 技能的价值不只是复用，更是上下文管理

很多人会把技能理解成“复用模板”。  
这只说对了一半。

它更大的价值其实是：

- 让主上下文保持干净
- 避免把所有知识预先塞进主循环
- 让模型只在相关任务里看到相关知识

也就是说，技能和 [s06 上下文压缩](./s06-context-compression.md) 是一条线上的能力：

- 技能负责按需加载
- 压缩负责按需保留

一个在减少“提前塞进去的内容”，一个在减少“已经用过但不必长期保留的内容”。

## 技能和工具、Prompt、记忆的区别

这几个概念很容易混在一起，但职责并不一样。

### 技能 vs 工具

- `工具`回答“能做什么动作”
- `技能`回答“应该怎么做判断”

例如：

- `read_file` 是工具
- “怎么审查前端回归风险”是技能

### 技能 vs Prompt 模板

- `Prompt 模板`更像“这一次要怎么说”
- `技能`更像“这一类任务长期应该怎么做”

Prompt 偏即时指令，技能偏长期沉淀。

### 技能 vs 记忆

- `技能`更偏通用方法论和领域知识
- `记忆`更偏用户、项目或历史任务的具体信息

例如：

- “代码审查先找高风险问题”更像技能
- “这个项目统一用 pnpm”更像记忆

## 相对 s04 的变化

和 [s04 子 Agent](./s04-sub-agents.md) 相比，这一章真正新增的是“按需知识注入”。

| 组件 | s04 | s05 |
| --- | --- | --- |
| 主问题 | 怎么拆子任务 | 怎么按需加载知识 |
| 新增工具 | `task` | `load_skill` |
| 知识来源 | 靠主 prompt 或任务提示 | `skills/*/SKILL.md` |
| system prompt | 静态提示 | 技能描述列表 |
| 完整知识注入 | 没有单独机制 | 通过 `tool_result` 按需回注 |

所以这章相对 `s04` 的关键增量不是“又多了一个工具”，而是：

**系统第一次把知识也做成了可按需请求的外部资源。**

## 什么样的内容最适合做成技能

适合放进技能的，通常是这几类东西：

- 某个领域的固定方法论
- 某种任务的执行规范
- 某类工具的最佳实践
- 稳定复用的输出格式和检查清单

不太适合放进技能的，通常包括：

- 强依赖当前用户或项目的临时偏好
- 一次性任务说明
- 需要频繁变化的执行状态

这些更应该放进记忆、任务对象或当前 prompt，而不是放进技能。

## 常见误区

- 把所有技能正文都直接塞到 system prompt 里
- 技能没有元信息，模型根本不知道有哪些技能可用
- 一个技能里混了太多任务类型，导致边界失控
- 把用户项目配置、历史偏好写进技能，职责变得混乱
- 把技能当成普通提示词文件，没有通过工具实现按需装载

## 试一试

你可以用下面几个问题检查自己是否真的理解了这一章：

1. 为什么技能不应该完整写在 system prompt 里？
2. `SkillLoader` 为什么要同时返回描述和正文两层内容？
3. 为什么 `load_skill` 更像一个知识工具，而不只是“读文件”？
4. 什么信息更适合放进技能，什么信息更适合放进记忆？

如果这些问题你都能说清楚，就说明这章已经理解到位了。

## 这节真正要理解什么

- 技能的核心不是“有一个知识文件”，而是“按需加载”
- 双层注入让系统提示保持便宜，而把完整知识延迟到真正需要时
- 技能是知识组织机制，不只是长 prompt 的拆分方式
- 这也是复杂 Agent 系统保持上下文干净的重要手段

## 小结

- 工具是动作能力，技能是方法和经验
- 技能最重要的工程价值，是按需注入而不是永久常驻
- 到了这一章，Agent 才开始真正具备“把知识外置并按需调用”的能力

# Superpowers 教程系列 —— 完整规划

> 本文档为内部规划文件，不上线发布。记录栏目结构、文件清单与发布批次。

---

## 一、位置与形式

**根目录**：`docs/tutorials/coding-agents/workflows/superpowers/`

**形式**：
- 教程（8 篇）：提取核心方法论 + 适配中文开发者场景 + 多平台工具示例
- 参考文档（14 篇）：完整翻译原 skill 文件，忠实原文，供深度用户查阅

**许可声明**：
- 基于 Jesse Vincent 的 Superpowers 项目（MIT 协议）
- 教程部分为原创内容，参考文档为翻译作品
- 保留版权声明，注明来源

---

## 二、文件目录结构

### 教程部分（8 篇）

```
docs/tutorials/coding-agents/workflows/superpowers/
│
├── _plan.md                           ← 本规划文件（不上线）
│
├── 01-overview.md                     ← 教程 01：概览与核心理念
├── 02-design-first.md                 ← 教程 02：设计先行
├── 03-task-breakdown.md               ← 教程 03：任务拆解
├── 04-subagent-development.md         ← 教程 04：子代理驱动开发
├── 05-tdd.md                          ← 教程 05：TDD 铁律
├── 06-debugging.md                    ← 教程 06：调试与验证
├── 07-code-review.md                  ← 教程 07：代码审查循环
├── 08-finishing.md                    ← 教程 08：收尾与合并
```

### 参考文档部分（14 个 skill 文件夹 → 主文档 + 附属文件）

> **重要**：原 skill 每个都是文件夹，内含 SKILL.md + 附属文件（prompt 模板、示例、脚本等）。
> 参考文档保持与原结构对应，每个 skill 一篇主文档（翻译 SKILL.md），附属文件整合为子章节或独立子页面。

```
└── reference/
    ├── index.md                       ← 参考文档导航页
    │
    ├── using-superpowers.md           ← SKILL.md + references/codex-tools.md + copilot-tools.md + gemini-tools.md（整合为附录）
    │
    ├── brainstorming.md               ← SKILL.md + visual-companion.md（整合）
    │   └── 附属：spec-document-reviewer-prompt.md（作为文末附录）
    │   └── 备注：scripts/ 为 Brainstorm Server 代码，文末简要说明即可，不翻译代码
    │
    ├── writing-plans.md               ← SKILL.md + plan-document-reviewer-prompt.md（整合为附录）
    │
    ├── subagent-driven-development.md ← SKILL.md + 3 个 prompt（整合为附录）
    │   └── 附属：implementer-prompt.md, spec-reviewer-prompt.md, code-quality-reviewer-prompt.md
    │
    ├── executing-plans.md             ← 仅 SKILL.md（原文件夹只有 1 个文件）
    │
    ├── test-driven-development.md     ← SKILL.md + testing-anti-patterns.md（整合为子章节）
    │
    ├── systematic-debugging.md        ← SKILL.md（主文档）
    │   └── 附属（作为子章节或文末附录）：
    │       - condition-based-waiting.md
    │       - defense-in-depth.md
    │       - root-cause-tracing.md
    │   └── 测试示例（可选，作为折叠附录）：test-academic.md, test-pressure-1/2/3.md
    │
    ├── verification-before-completion.md ← 仅 SKILL.md（原文件夹只有 1 个文件）
    │
    ├── requesting-code-review.md      ← SKILL.md + code-reviewer.md（整合为附录）
    │
    ├── receiving-code-review.md       ← 仅 SKILL.md（原文件夹只有 1 个文件）
    │
    ├── using-git-worktrees.md         ← 仅 SKILL.md（原文件夹只有 1 个文件）
    │
    ├── finishing-a-development-branch.md ← 仅 SKILL.md（原文件夹只有 1 个文件）
    │
    ├── dispatching-parallel-agents.md ← 仅 SKILL.md（原文件夹只有 1 个文件）
    │
    └── writing-skills.md              ← SKILL.md（主文档）
        └── 附属（作为子章节或文末附录）：
            - anthropic-best-practices.md
            - persuasion-principles.md
            - testing-skills-with-subagents.md
        └── 备注：examples/CLAUDE_MD_TESTING.md 为示例文件，简要引用即可
```

---

## 三、教程与参考文档的区别

| 维度 | 教程（8 篇） | 参考文档（14 篇） |
|------|------------|-----------------|
| **目标读者** | 想快速掌握方法论的开发者 | 想深入理解原文、或对照执行的用户 |
| **内容组织** | 按学习路径重构，先易后难 | 按原 skill 文件结构，忠实翻译 |
| **工具示例** | 多平台通用（Cursor、WorkBuddy、Claude Code） | 以原文工具为准（Claude Code/Codex 为主） |
| **篇幅** | 每篇 2000-4000 字，精简 | 每篇 3000-8000 字，完整 |
| **用途** | 系统学习 | 查阅对照、验证理解 |

---

## 四、发布批次

### 第一批（核心流程，优先发布）

| # | 教程 | 对应 skill | 内容定位 |
|---|------|-----------|---------|
| 01 | 概览与核心理念 | using-superpowers | 什么是 Superpowers、为什么有用、核心理念（skill 即代码、设计先行） |
| 02 | 设计先行 | brainstorming | HARD-GATE 机制、9 步头脑风暴流程、为什么"简单项目也需要设计" |
| 03 | 任务拆解 | writing-plans | 2-5 分钟 bite-size 任务、计划文档结构、依赖排序 |
| 04 | 子代理驱动开发 | subagent-driven-development | 为什么用子代理、两层 review 机制、Spec Review + Code Quality Review |
| 08 | 收尾与合并 | finishing + worktrees | 开发分支收尾、worktree 隔离、合并/PR/丢弃决策 |

### 第二批（质量与进阶）

| # | 教程 | 对应 skill | 内容定位 |
|---|------|-----------|---------|
| 05 | TDD 铁律 | test-driven-development | RED → GREEN → REFACTOR、为什么必须先写测试、常见借口拆解 |
| 06 | 调试与验证 | systematic-debugging + verification | 四阶段根因分析、修完必须验证、避免"修完就完" |
| 07 | 代码审查循环 | requesting + receiving code review | 如何发起审查、如何处理审查反馈、两层 review 的具体操作 |

### 第三批（可选进阶）

| 教程 | 对应 skill | 内容定位 |
|------|-----------|---------|
| 编写自己的 Skill | writing-skills | Skill 即代码的理念、如何写好一个 skill、checklist 和流程图技巧 |
| 多平台适配指南 | using-superpowers/references | Claude Code / Codex / Gemini / Cursor / WorkBuddy 工具映射 |
| 常见陷阱与规避 | 全部 | "代理知道但跳过 skill"、长任务中断、上下文爆炸等 |

### 参考文档（按需翻译）

14 篇参考文档不追求一次性全部完成，按以下优先级分批翻译：

**优先级 P1（核心 workflow）**：brainstorming、writing-plans、subagent-driven-development、test-driven-development
**优先级 P2（质量保证）**：systematic-debugging、verification-before-completion、requesting-code-review、receiving-code-review
**优先级 P3（工具与环境）**：using-git-worktrees、finishing-a-development-branch、executing-plans、dispatching-parallel-agents
**优先级 P4（元技能）**：using-superpowers、writing-skills

---

## 五、写作原则

### 教程写作原则

1. **不做翻译腔**：用中文表达习惯重新组织，保留英文术语首次出现时加括号
2. **工具中立**：不绑定 Claude Code 或 Codex，示例覆盖 Cursor、WorkBuddy、Claude Code 等国内常用工具
3. **结论优先**：每篇开头用一段话说明"读完这篇你能得到什么"
4. **可操作**：每篇至少包含 1 个可直接套用的模板或 checklist
5. **诚实标注局限**：哪些地方在当前工具上跑不通、需要降级

### 参考文档翻译原则

1. **忠实原文**：不删减、不改写结构，保留所有流程图和 checklist
2. **术语保留**：HARD-GATE、RED-GREEN-REFACTOR 等术语保留英文，首次出现时加中文注释
3. **格式一致**：保持原文的 Markdown 格式、代码块、表格结构
4. **附属文件处理**：
   - **Prompt 模板**（如 implementer-prompt.md、spec-reviewer-prompt.md）：完整翻译，作为文末附录
   - **方法论补充**（如 defense-in-depth.md、root-cause-tracing.md）：完整翻译，作为相关章节的子内容
   - **示例文件**（如 test-pressure-*.md）：翻译核心内容，冗长示例可适当精简
   - **代码/脚本**（如 brainstorming/scripts/）：保留代码注释原文，在文末简要说明功能即可，不翻译代码本身
5. **文首声明**："本文为 Superpowers 原 skill 文件夹的中文翻译，基于 MIT 协议。原文路径：`skills/<skill-name>/`"

---

## 六、Sidebar 配置

```ts
{
  text: '开发工作流',
  collapsed: false,
  items: [
    { text: '概览', link: '/tutorials/coding-agents/workflows/' },
    {
      text: 'Superpowers 工作流',
      collapsed: true,
      items: [
        { text: '01 概览与核心理念', link: '/tutorials/coding-agents/workflows/superpowers/01-overview' },
        { text: '02 设计先行', link: '/tutorials/coding-agents/workflows/superpowers/02-design-first' },
        { text: '03 任务拆解', link: '/tutorials/coding-agents/workflows/superpowers/03-task-breakdown' },
        { text: '04 子代理驱动开发', link: '/tutorials/coding-agents/workflows/superpowers/04-subagent-development' },
        { text: '05 TDD 铁律', link: '/tutorials/coding-agents/workflows/superpowers/05-tdd' },
        { text: '06 调试与验证', link: '/tutorials/coding-agents/workflows/superpowers/06-debugging' },
        { text: '07 代码审查循环', link: '/tutorials/coding-agents/workflows/superpowers/07-code-review' },
        { text: '08 收尾与合并', link: '/tutorials/coding-agents/workflows/superpowers/08-finishing' },
        {
          text: '参考文档',
          collapsed: true,
          items: [
            { text: '导航', link: '/tutorials/coding-agents/workflows/superpowers/reference/' },
            { text: 'using-superpowers', link: '/tutorials/coding-agents/workflows/superpowers/reference/using-superpowers' },
            { text: 'brainstorming', link: '/tutorials/coding-agents/workflows/superpowers/reference/brainstorming' },
            { text: 'writing-plans', link: '/tutorials/coding-agents/workflows/superpowers/reference/writing-plans' },
            { text: 'subagent-driven-development', link: '/tutorials/coding-agents/workflows/superpowers/reference/subagent-driven-development' },
            { text: 'executing-plans', link: '/tutorials/coding-agents/workflows/superpowers/reference/executing-plans' },
            { text: 'test-driven-development', link: '/tutorials/coding-agents/workflows/superpowers/reference/test-driven-development' },
            { text: 'systematic-debugging', link: '/tutorials/coding-agents/workflows/superpowers/reference/systematic-debugging' },
            { text: 'verification-before-completion', link: '/tutorials/coding-agents/workflows/superpowers/reference/verification-before-completion' },
            { text: 'requesting-code-review', link: '/tutorials/coding-agents/workflows/superpowers/reference/requesting-code-review' },
            { text: 'receiving-code-review', link: '/tutorials/coding-agents/workflows/superpowers/reference/receiving-code-review' },
            { text: 'using-git-worktrees', link: '/tutorials/coding-agents/workflows/superpowers/reference/using-git-worktrees' },
            { text: 'finishing-a-development-branch', link: '/tutorials/coding-agents/workflows/superpowers/reference/finishing-a-development-branch' },
            { text: 'dispatching-parallel-agents', link: '/tutorials/coding-agents/workflows/superpowers/reference/dispatching-parallel-agents' },
            { text: 'writing-skills', link: '/tutorials/coding-agents/workflows/superpowers/reference/writing-skills' },
          ]
        }
      ]
    }
  ]
}
```

---

## 七、交叉引用关系

| 教程/参考 | 可交叉引用到 |
|-----------|------------|
| 05 TDD 铁律 | quality/ 栏目首页 |
| 06 调试与验证 | quality/ 栏目首页 |
| 07 代码审查循环 | quality/ 栏目首页 |
| 08 收尾与合并 | team-practices/ 栏目首页 |
| 04 子代理驱动开发 | cases/ 栏目（作为实战案例拆解） |
| 参考文档全部 | 各教程中"如需查看原文，请参阅"链接 |

---

## 八、工作量预估

| 批次 | 内容 | 预估工作量 |
|------|------|-----------|
| 第一批 | 教程 01-04 + 08（5 篇） | 每篇 3-4 小时，共 15-20 小时 |
| 第一批 | 参考文档 P1（4 篇） | 每篇 2-3 小时，共 8-12 小时 |
| 第二批 | 教程 05-07（3 篇） | 每篇 3-4 小时，共 9-12 小时 |
| 第二批 | 参考文档 P2（4 篇） | 每篇 2-3 小时，共 8-12 小时 |
| 第三批 | 教程进阶 + 参考文档 P3-P4 | 视需求而定 |

**总计**：第一批（含参考文档 P1）约 23-32 小时，即 3-4 天全职工时。

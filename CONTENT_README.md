# Content README

这个文件用于约定站点内容的维护方式，面向仓库维护者使用，不会出现在站点导航中。

它的目标不是追求“写得多”，而是保证内容结构一致、栏目边界清晰、搜索摘要可控、页面长期可维护。

## 这个文档解决什么问题

- 统一 frontmatter 写法，减少页面元信息缺失
- 统一栏目写法，避免不同页面风格漂移太大
- 统一 SEO 相关字段，保证标题、摘要、关键词和索引策略可控
- 统一新内容判断标准，避免写出“能发但不值得保留”的页面

## Frontmatter 规范

推荐每篇正式内容至少使用下面这组字段：

```yaml
---
title: 页面标题
description: 用于搜索结果和分享摘要的简短描述
summary: 站内摘要，可作为 description 的后备
keywords:
  - 关键词 1
  - 关键词 2
tags:
  - 标签 1
  - 标签 2
date: 2026-03-24
lastUpdated: 2026-03-24
author: AI Agent Guide
ogImage: /social/example.png
status: draft
assets: missing
reviewed: false
sourceType: original
draft: false
noindex: false
---
```

字段优先级：

- `title`：优先使用 frontmatter；未填写时回退到页面一级标题 `# H1`
- `description`：优先使用 frontmatter；未填写时回退到 `summary`，再回退到正文首个合适段落
- `keywords`：优先使用 `keywords`；未填写时回退到 `tags`
- `lastUpdated`：优先使用 frontmatter；未填写时回退到文件修改时间
- `ogImage`：优先使用 frontmatter；未填写时回退到全站默认分享图
- `status`：用于区分页面当前所处状态，方便批量审计和排期
- `assets`：用于标记图片、图表等静态资源是否齐备
- `reviewed`：用于标记页面是否经过人工审校
- `sourceType`：用于区分原创、重写、翻译、整理等来源类型
- `draft` 或 `noindex`：任一为 `true` 时输出 `noindex, nofollow`

使用建议：

- `title` 控制浏览器标题、Open Graph 标题和 Twitter 标题
- `description` 控制搜索摘要，不要直接复制正文首段
- `summary` 更适合栏目列表摘要、卡片摘要和人工维护说明
- `tags` 更偏站内聚合，`keywords` 更偏搜索补充
- `date` 适合教程、解读、项目分析等明确有发布时间语义的页面
- `lastUpdated` 适合长期维护的知识页
- `ogImage` 建议用于首页、栏目页、重点专题页或高传播页面
- `status` 建议使用固定枚举：`idea | outline | draft | review | published`
- `assets` 建议使用固定枚举：`none | missing | ready`
- `reviewed` 只在页面经过完整复读和结构检查后设为 `true`
- `sourceType` 建议使用固定枚举：`original | rewrite | translation | curated`

最小正式内容模板建议：

```yaml
---
title: 页面标题
description: 搜索结果描述
summary: 站内摘要
keywords:
  - 关键词 1
tags:
  - 标签 1
status: draft
assets: missing
reviewed: false
sourceType: original
author: AI Agent Guide
draft: false
noindex: false
---
```

## 内容状态约定

建议把页面状态控制在下面这套固定语义里：

- `idea`：只有选题，还不适合生成正式页面
- `outline`：已经有结构或问题列表，但正文未完成
- `draft`：已有正文初稿，可以继续补图补例子
- `review`：内容基本写完，等待统一审校
- `published`：已达到对外长期保留标准

`assets` 建议这样理解：

- `none`：这页不依赖图片、图表或额外静态资源
- `missing`：计划有图，但现在还没配齐
- `ready`：图片、图表、封面等资源已齐备

建议配合审计脚本定期检查：

```bash
pnpm content:audit
```

这样能快速看到：

- 哪些页面还没有 `description` / `summary`
- 哪些页面还没补 `status` / `assets`
- 哪些栏目仍有大量骨架页或待配图页面

## 图片与静态资源规范

默认策略：**图片优先进入仓库，统一放在 `docs/public/` 下；只有体积大、复用高、替换频繁的资源再考虑迁到 OSS。**

目录约定：

```text
docs/public/
  getting-started/
  principles/
  frameworks/
  tutorials/
  llm/
  rag/
  tools/
  interviews/
  shared/
  social/
```

放置规则：

- 单篇文章的图片尽量跟页面 slug 对齐
- 共享图片、公共图标、通用示意图统一放到 `docs/public/shared/`
- 分享卡片和社交传播图统一放到 `docs/public/social/`
- 图源文件如果需要长期维护，例如 `.drawio`，也尽量和导出的 `.svg` 放在同一路径

推荐路径示例：

```text
docs/public/rag/ch01-rag-overview/m01-definition-and-positioning/q01-rag.svg
docs/public/rag/ch01-rag-overview/m01-definition-and-positioning/q01-rag.drawio
```

命名规则：

- 不使用 `image1.png`、`截图(1).png` 这类无语义名称
- 文件名尽量与页面 slug 对齐，例如 `rag-overview.svg`
- 同页多图可使用 `q01-rag-step-1.svg`、`q01-rag-step-2.svg`

格式建议：

- 优先使用 `svg` 表达结构图、流程图、逻辑图
- 截图类资源优先压缩后使用 `webp`
- 只有在透明背景或兼容性明确需要时再使用 `png`
- 单图体积超过 `300KB` 时，先压缩；如果后续还会高频替换，再考虑外置 OSS

Markdown 引用规则：

```md
![RAG 流程图](/rag/ch01-rag-overview/m01-definition-and-positioning/q01-rag.svg)
```

约束：

- 页面内统一使用站内绝对路径
- 不混用一部分相对路径、一部分绝对路径
- 不把图片直接散落在 Markdown 同级目录
- 不把“未来可能会换”的大图资源直接塞进多个不同目录的副本里

## 页面层级建议

当前仓库内容大体可以分成三类：

- 栏目页：例如 `index.md`，负责概览、分流、建立阅读路径
- 主题页：例如某个章节、模块或专题说明页，负责搭建知识结构
- 具体内容页：例如单篇问题解答、工具介绍、项目解读，负责讲清一个具体问题

写作时要避免层级错位：

- 栏目页不要写成细节堆砌的长文
- 具体内容页不要承担栏目导航职责
- 主题页要讲结构，不要只放一串链接

## 栏目维护原则

### 入门

适合回答这些问题：

- AI Agent 是什么
- 什么时候该用 Agent
- Agent、Workflow、RAG 分别解决什么问题
- 新手最容易混淆什么

写法要求：

- 优先讲判断标准，而不是先堆名词
- 优先讲边界、适用场景、常见误区
- 尽量让没有工程背景的读者也能先读懂

### 原理

适合回答这些问题：

- Agent 系统内部是怎么运转的
- 工具调用、记忆、规划、多 Agent、上下文管理分别在解决什么问题
- 为什么真实系统不是单靠 Prompt 就能做好

写法要求：

- 强调“组件职责”和“系统分工”
- 不要把原理页写成纯概念百科
- 尽量给出工程语境，而不是停留在术语解释

### 框架

适合覆盖这些内容：

- 框架定位
- 适用场景
- 核心能力
- 选型差异
- 官方文档中最值得读的部分

写法要求：

- 不要把框架页写成产品广告
- 不要只列 API，要解释为什么这样设计
- 选型类页面要突出取舍，不要写成“都很好”

### 实战

适合覆盖这些内容：

- 从最小案例开始的搭建过程
- 某个能力如何落地
- Demo 到更完整系统之间的差距

写法要求：

- 重点写问题拆解、实现顺序、常见坑和边界条件
- 不要只给结果，不解释过程
- 不要把实战页写成单纯代码贴图

### 项目

适合覆盖这些内容：

- 值得研究的 AI Agent 开源项目
- 某个项目的架构特点、学习价值和阅读入口

写法要求：

- 不强行按语言分类
- 不追求“收录越多越好”
- 优先保留真正有代表性、可学习、可复用的项目

建议固定结构：

- 项目是做什么的
- 为什么值得看
- 核心设计点是什么
- 适合什么阶段的读者阅读
- 仓库或文档入口

### 工具

适合覆盖这些内容：

- 工具或平台的定位
- 典型使用方式
- 适合谁
- 与同类工具相比最关键的差异

写法要求：

- 优先回答“这个工具值不值得了解”
- 不要只写功能列表
- 不要把工具页写成新闻快讯

建议固定结构：

- 工具名
- 定位
- 核心能力
- 适用人群
- 适用场景
- 官网或文档入口
- 是否开源

### LLM / RAG / 面试 / 资源

这些栏目更偏知识体系和专题化内容，维护时要注意：

- LLM：讲核心认知、能力边界、训练与推理机制，不写成零散问答堆砌
- RAG：讲完整链路、误差来源、设计原则和工程化，不只讲检索概念
- 面试：优先保留真实问题、连续追问和回答结构，不做空泛题库
- 资源：优先保留长期有效、官方和高质量入口，不做低质量链接收藏夹

## 写作风格约束

- 面向中文开发者，优先讲清问题，不故作“学院化”
- 语言尽量直接，不堆营销话术
- 不写“万能结论”，尽量说明前提和边界
- 不为了 SEO 强行重复关键词
- 不为了显得专业而堆概念，优先解释概念之间的关系

## 标题与摘要建议

标题建议：

- 直接表达页面要解决的问题
- 尽量让读者只看标题就知道这页讲什么
- 避免“全面解析”“终极指南”这类空泛措辞

摘要建议：

- 优先说明“这篇内容解决什么问题”
- 控制在 1 到 2 句话内
- 不要写成目录，不要写成大段口号

## 什么内容不建议写

- 纯新闻搬运，没有长期阅读价值
- 只有概念定义，没有判断标准和使用边界
- 只有链接汇总，没有筛选和说明
- 只有 API 罗列，没有设计思路和适用场景
- 主题太窄、复用价值太低、与站点主线关系太弱的内容

## 发布前自查

发布前至少检查这些问题：

- 标题是否明确
- `description` 和 `summary` 是否完整
- `keywords` / `tags` 是否合理
- 页面属于哪个栏目，栏目边界是否清晰
- 是否回答了“为什么值得读”
- 是否存在明显的空话、套话、重复段落
- 是否需要 `date`、`lastUpdated`、`draft`、`noindex`

如果一篇内容无法回答“它要帮读者解决什么问题”，通常说明这篇内容还不该发布。

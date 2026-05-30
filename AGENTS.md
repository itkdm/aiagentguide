# AI Agent Guide 协作协议

这个文件是 `aiagentguide` 仓库的 Agent 执行入口，用来约束 AI Agent、自动化脚本和协作者在本仓库里的默认行为。

它不是完整的内容手册，也不是组件文档。详细内容规范以 [CONTENT_README.md](/D:/develop/aiagentguide/CONTENT_README.md) 为准；本文只保留高优先级的执行规则、边界和检查清单。

## 项目定位

- 这是面向中文技术读者的 AI Agent 文档站，不是通用博客仓库。
- 内容围绕学习路径、技术判断和工程选型组织，不围绕热点新闻堆砌。
- 核心栏目包括：`getting-started`、`principles`、`frameworks`、`tutorials`、`projects`、`tools`、`llm`、`rag`、`interviews`、`resources`。
- 页面应帮助读者理解结构、建立判断标准、完成技术选型或解决具体问题。

## 优先级

工作时按下面顺序理解项目规则：

1. 用户当前明确要求。
2. 本文件中的 Agent 协作规则。
3. [CONTENT_README.md](/D:/develop/aiagentguide/CONTENT_README.md) 中的内容规范。
4. 当前栏目已有页面、侧边栏配置和站点实现。

如果规则冲突，先遵守用户当前要求；如果仍不确定，优先做最小、可回退、贴合现有结构的改动。

## 默认工作方式

- 修改前先阅读当前任务相关页面、站点配置和本文件。
- 不要默认扩写成长篇解释，优先贴合仓库现有页面密度。
- 用户没有明确要求时，不主动跑完整构建；优先做文件级检查、脚本检查或最小必要验证。
- 新增内容时延续当前栏目已有结构和命名方式。
- 不要为了“更完整”擅自新增用户没有要求的章节、页面、导航层级或组件。
- 修改文档时保留读者导向表达，不把写给 Agent 的草稿、备忘或内部说明原样发布。
- 对已存在页面做补充时，先检查侧边栏是否需要同步挂载。

## 新增页面硬性要求

每次新增 `docs/` 下的页面，必须同步处理 SEO 和索引相关信息。不要只写正文，把 SEO 留到以后再补。

新增页面前先判断：

- 页面属于哪个栏目、哪个层级。
- 页面解决的是一个具体问题、一个概念、一个工具，还是一个学习阶段。
- 页面是否已经成熟到适合被搜索引擎收录。
- 是否需要同步侧边栏、栏目页或相关入口。

新增页面至少补齐这些 frontmatter 字段：

- `title`
- `description`
- `summary`
- `tags`
- `keywords`
- `status`
- `assets`
- `reviewed`
- `sourceType`
- `author`
- `draft`
- `noindex`

如果页面准备收录，默认使用：

```yaml
status: published
draft: false
noindex: false
```

如果页面只是草稿、占位页、内部整理页或还没有形成稳定读者价值，默认使用：

```yaml
status: draft
draft: true
noindex: true
```

SEO 写作细节以 [CONTENT_README.md](/D:/develop/aiagentguide/CONTENT_README.md) 和真实生效逻辑为准。尤其要确认：

- `description` 是自然句，能说明页面适合承接什么搜索问题。
- `summary` 面向读者导读，不是内部备注。
- `keywords` 围绕同一个搜索意图，不堆无关词。
- `title` 直接表达页面主题，不写“全面解析”“终极指南”“保姆级教程”这类营销词。
- 正文先解决真实读者问题，再考虑 SEO，不为关键词新增低质量段落。

## 写作红线

- 正式页面必须面向中文技术读者，不能写成给站长、维护者、项目开发者或 Agent 的内部说明。
- 不要在正文里出现“站点维护时”“作为站长”“给 Agent 的提示”“仓库维护者可以”这类内部口吻。
- 不堆营销话术，不写空泛的“全面解析”“终极指南”。
- 栏目页负责概览和分流，具体内容页负责讲清单个问题，不要层级错位。
- 如果原始材料来自内部规划、Agent 草稿或执行记录，发布前必须改写成面向读者的正式表达。
- 不要为了 SEO 新增没有长期读者价值的低质量页面。

## 资源与组件原则

- 图片资源优先放在 `docs/public/` 下，并与文章路径或主题对齐。
- 单张配图优先使用 `SingleImagePreview`，多张同主题步骤图优先使用 `ImageCarousel`。
- 流程关系、结构关系、层级关系优先使用 `mermaid` 或 `mindmap`。
- 不要让图片承载大段文字，图片负责建立关系，细节留给正文。
- 不要在能复用现有全局组件时临时造一套新写法。
- 组件是否已注册，以 [docs/.vitepress/theme/index.ts](/D:/develop/aiagentguide/docs/.vitepress/theme/index.ts) 为准。

## 关键路径

- 文档根目录：`docs/`
- VitePress 配置：`docs/.vitepress/`
- 侧边栏配置：`docs/.vitepress/config/sidebar/`
- 主题组件：`docs/.vitepress/theme/components/`
- 公共静态资源：`docs/public/`
- 内容规范：`CONTENT_README.md`
- 自动化脚本：`scripts/`

做 SEO 或索引相关判断时，优先查看真实生效路径：

- `docs/.vitepress/seo.ts`
- `docs/.vitepress/seo.test.mjs`
- `scripts/content-audit.mjs`

不要凭印象判断页面是否可索引。

## 本地文件与提交规则

- `.codex/` 是本地 Agent 配置目录，不提交、不推送。
- `content-plans/` 用于本地站长规划、SEO 台账、Search Console 分析和执行记录，不提交、不推送。
- `scripts/` 中的项目级可复用脚本可以提交；一次性临时脚本不要放进长期跟踪范围。
- `tmp-*`、临时 JSON、实验输出和本地中间文件不要提交。
- 提交前确认没有把本地规划、Agent 配置、临时文件或内部草稿带入远程。

本地 Agent 可以使用私有 skill 或个人工具，但不要假设远端协作者一定拥有这些文件。

## 默认执行顺序

涉及文档新增或改写时，默认按这个顺序工作：

1. 阅读本文件、[CONTENT_README.md](/D:/develop/aiagentguide/CONTENT_README.md) 和相关栏目已有页面。
2. 确认页面角色、读者问题、栏目位置和是否可索引。
3. 复用现有结构、命名方式和组件。
4. 只做用户要求范围内的新增或修改。
5. 新增页面时补齐 frontmatter、SEO 字段和索引状态。
6. 检查是否需要同步侧边栏、栏目入口或相关链接。
7. 做最小必要验证，不默认跑完整构建。

## 完成前检查

交付前至少确认：

- 是否改了正确文件，且没有误改无关内容。
- 新增页面是否补齐 SEO frontmatter。
- `status`、`draft`、`noindex` 是否符合页面成熟度。
- 正文是否面向读者，而不是面向维护者或 Agent。
- 是否需要同步侧边栏。
- 是否有本地私有文件、规划文档或临时文件被误加入提交。
- 用户没有要求构建时，是否避免了不必要的完整构建。

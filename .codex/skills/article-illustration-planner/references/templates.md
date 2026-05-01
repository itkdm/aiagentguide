# Image Types And Prompt Scaffolds

These templates exist to keep prompts stable across repeated requests.

## Shared prompt tail

Append a version of this guidance to every final prompt:

```text
使用适合中文 AI 教程站点的精致技术编辑插画风格。
浅色背景，层级清晰，留白稳定，细节克制。
图片中的文字应尽可能少，只保留少量短标签，不要把图片做成文字海报。
图片应主要表达关系、层级、对比、流程或隐喻，而不是重复正文内容。
图片中的可见文字默认使用中文，只有框架名、产品名、专有名词和必要缩写保留英文。
不要水印，不要品牌 logo，不要素材图库感，不要深色背景，除非文章明确需要。
```

## header-image

Best for:
- title area
- section opener
- concept-establishing image

Prompt scaffold:

```text
为一篇 AI 教程文章生成横向总览头图。
画面应展示文章的核心概念版图，而不是截图或文字海报。
使用清晰的中心构图和适度留白，让页面阅读感更轻松。
通过结构、隐喻或概念分组来表达主题。
如果必须出现文字，只保留少量短标签。
```

## comparison-image

Best for:
- framework comparisons
- approach tradeoffs
- tool category differentiation
- side-by-side mental models

Prompt scaffold:

```text
为一篇 AI 教程文章生成对比型插图，让几个主要选项之间的差异一眼可见。
使用分栏、分区、支柱、卡片或对照区域，而不是文字密集的图表。
重点表达抽象层级、工作流风格、工程角色或使用边界的差异。
如果需要文字，只保留短名称或少量紧凑标签。
```

## workflow-image

Best for:
- process explanations
- lifecycle descriptions
- build steps
- retrieval or agent execution flow

Prompt scaffold:

```text
为一篇 AI 教程文章生成流程型插图，突出阶段推进、方向感和步骤切换。
通过流向、连接、模块分组或连续结构来体现过程。
避免在图中写密集解释，标签应短而稀疏。
读者应当一眼看出这个过程的大致形状。
```

## layered-concept-image

Best for:
- architecture hierarchy
- abstraction layers
- stack relationships
- systems decomposition

Prompt scaffold:

```text
为一篇 AI 教程文章生成分层概念插图，突出结构层级和部件关系。
使用分层区域、嵌套结构、模块块面或空间层叠来展示组成关系。
整体应偏分析型、干净克制，而不是装饰导向。
如果需要标签，只保留少量短的结构标签。
```

## metaphor-image

Best for:
- abstract concepts
- cognitive models
- introductory pages
- difficult ideas that need a memorable visual hook

Prompt scaffold:

```text
为一篇技术文章生成解释型隐喻插图。
把抽象概念转译成直观、容易记住、但仍然克制严谨的视觉场景。
隐喻应清晰、可解释，不要幼稚或过度卡通化。
尽量少字或不出现文字。
```

## Placement heuristics

### Title area

Use:
- header-image

Question to ask:
- does the article benefit from a single visual map before the reader enters the detailed text?

### Before a comparison-heavy `##` section

Use:
- comparison-image

Question to ask:
- are there 2 or more options whose differences are easier to see than to read?

### Before a workflow-heavy `##` section

Use:
- workflow-image

Question to ask:
- is the reader about to parse a multi-step process or pipeline?

### Before a hierarchy-heavy `##` section

Use:
- layered-concept-image

Question to ask:
- is the reader about to learn layers, roles, or nested relationships?

### Before an abstract dense `##` section

Use:
- metaphor-image or layered-concept-image

Question to ask:
- does the section introduce a concept that is easier to remember through shape or metaphor than through prose alone?

## Prompt assembly order

Build final prompts in this order:

1. article intent
2. chosen image type scaffold
3. current section visual system
4. article-specific entities or concepts
5. low-text rule
6. shared prompt tail

## Prompt output style

When the skill outputs prompts for the user, the prompts should:

- be complete, ready to paste into an image model
- default to Chinese wording
- preserve stable section-level wording across repeated requests
- vary only in article-specific subject matter
- explicitly keep text minimal

Do not output vague prompts like "make a nice image for this section." Always output a production-ready prompt.



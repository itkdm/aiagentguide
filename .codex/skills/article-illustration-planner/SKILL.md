---
name: article-illustration-planner
description: Plan and standardize article illustrations for the aiagentguide repository. Use when working on markdown articles in this repo and you need to decide whether an article should have images, where images should be inserted, what type of image fits each section, or how to produce stable image prompts that stay visually consistent within the same content section. Especially use for docs under `docs/frameworks/`, `docs/rag/`, `docs/llm/`, `docs/principles/`, `docs/getting-started/`, `docs/tools/`, `docs/tutorials/`, and `docs/interviews/`.
---

# Article Illustration Planner

## Overview

Use this skill to plan article images for `aiagentguide` before generating them. The skill decides whether an article needs images, recommends the best insertion points, chooses a fitting image type, and outputs section-consistent prompts that minimize on-image text.

Read `references/sections.md` for section-specific visual systems and `references/templates.md` for reusable image types and prompt scaffolds.

## Workflow

### 1. Identify the article and section

Determine:

- the article file path
- the top-level section such as `frameworks`, `rag`, `llm`, `principles`, `getting-started`, `tools`, `tutorials`, or `interviews`
- whether the article is a section overview page, a concept article, a comparison article, a workflow article, or a case/tutorial article

Then read:

- `references/sections.md`
- `references/templates.md`

Use only the rules for the current section unless the article clearly spans two sections.

### 2. Decide whether the article should have images at all

Do not assume every article needs images.

Recommend images only when they materially improve comprehension, scanning, or conceptual retention.

Good reasons to add images:

- the article introduces a new conceptual landscape
- the article compares multiple frameworks, approaches, or layers
- the article explains a workflow, lifecycle, or information flow
- the article contains dense abstract explanation that benefits from a visual metaphor or layered diagram
- the article opens a new section and needs a consistent visual identity

Do not recommend images when:

- the content is already best expressed as a table
- the content is mostly a short FAQ or glossary entry
- an image would repeat the same information without clarifying it
- the only way to make the image useful would be to place large blocks of text on it

### 3. Choose insertion points

Prefer a small number of strong image placements.

Default high-value insertion points:

- directly below the article title: use for a header image or concept-establishing overview image
- immediately before a major `##` section with a clear shift in topic
- before a comparison-heavy section
- before a workflow-heavy section
- before a section that introduces a complex abstraction hierarchy

Avoid sprinkling images everywhere. Most articles should usually have:

- `0` images for short pages
- `1` image for focused concept pages
- `2` images for long comparison or workflow pages
- `3` images only when the page truly has three distinct conceptual blocks

### 4. Choose image type

Pick from the reusable image types in `references/templates.md`.

Default mapping:

- section opener or article opener -> `header-image`
- side-by-side conceptual choices -> `comparison-image`
- multi-step explanation -> `workflow-image`
- layered abstraction or architecture -> `layered-concept-image`
- abstract dense concept -> `metaphor-image`

If an article already has a strong table, avoid generating a bitmap that tries to become another table.

### 5. Enforce the repository image philosophy

For this repo, images are explanatory and atmospheric, not text carriers.

Always enforce these rules:

- keep on-image text as low as possible
- prefer `0-6` short labels, not sentences
- never turn the image into a poster full of bullet points
- use the image to show relationships, hierarchy, contrast, flow, or metaphor
- let the article body carry the details

Language rules for this repo:

- output prompts in Chinese by default
- any visible text inside the image should be Chinese by default
- keep only proper nouns, framework names, product names, and technical abbreviations in English when needed
- do not produce English explanatory labels unless the user explicitly asks for English

When text is necessary, keep it to:

- one short title phrase, or
- a few anchor labels, or
- a few framework names in comparison scenes

Do not use the image as a replacement for a readable markdown table or a proper SVG flowchart.

### 6. Use the repository storage path and image component

For this repo, generated article images should be stored in a path that mirrors the article route as closely as possible.

Default path rule:

- if the article is `docs/frameworks/how-to-choose-agent-framework.md`, store generated images under `docs/public/frameworks/how-to-choose-agent-framework/`
- if the article is `docs/rag/ch01-rag-overview/m01-definition-and-positioning/q04-rag.md`, store generated images under `docs/public/rag/ch01-rag-overview/m01-definition-and-positioning/q04-rag/`
- do not dump unrelated article images into one flat shared folder unless the repo already does that intentionally

Path naming rules:

- keep filenames short, kebab-case, and descriptive
- include the article scope in the directory, not repeatedly in every filename
- prefer stable names such as `selection-map.png`, `java-landscape.png`, `workflow-overview.png`

Component rules:

- for a single generated image, default to `SingleImagePreview`
- for multiple generated variants or a deliberate image set, use `ImageCarousel`
- do not default to bare markdown image syntax when this repo already has a dedicated image component

Default single-image wrapper:

```md
<div style="display: flex; justify-content: center; margin: 18px 0 22px;">
  <SingleImagePreview
    src="/section/article-slug/image-name.png"
    alt="中文替代文本"
    style="width: min(980px, 100%);"
  />
</div>
```

If the user asks where to place the image in the article, provide:

- the recommended insertion point
- the recommended storage path under `docs/public/`
- the final component snippet ready to paste into markdown

### 7. Output format

When the user asks for planning only, respond with one block per recommended image:

- placement
- purpose
- image type
- why it belongs there
- storage path
- component snippet
- prompt summary
- final imagegen prompt

Use this exact structure:

```md
## 建议配图 1

- 位置：标题下方
- 用途：建立整篇文章的视觉主题
- 图型：总览头图
- 原因：文章开头信息密度较高，先帮助读者建立整体理解框架
- 存放位置：`docs/public/frameworks/how-to-choose-agent-framework/selection-map.png`
- 图片组件：
  ```md
  <div style="display: flex; justify-content: center; margin: 18px 0 22px;">
    <SingleImagePreview
      src="/frameworks/how-to-choose-agent-framework/selection-map.png"
      alt="框架选型地图"
      style="width: min(980px, 100%);"
    />
  </div>
  ```
- 提示词概述：
  [short planning summary]
- 最终提示词（适合 imagegen 直接使用）：
  ```text
  [final prompt]
  ```
```

When the user asks only for prompts, still include placement and type so the prompts stay reusable.
The final prompt must be complete, production-ready, and directly usable in `imagegen` without extra rewriting.

### 8. Prompt construction

Build prompts from three layers:

1. section visual system from `references/sections.md`
2. image type scaffold from `references/templates.md`
3. article-specific subject matter from the current page

Every final prompt should preserve the section's:

- palette direction
- composition density
- illustration style
- abstraction level
- mood
- text restraint

Every final prompt should include an explicit low-text rule such as:

`图片中的文字应尽可能少，只保留少量短标签，不要把图片做成文字海报。`

Every final prompt should also be written as one clean final deliverable, not as notes or fragments. It should already contain:

- image purpose
- subject
- composition
- section style
- text constraints
- language constraints
- avoid list when useful

### 9. Stable style across repeated requests

To keep prompts stable across multiple requests:

- reuse the same section-level style phrases
- reuse the same image-type phrases for the same kind of placement
- vary only the article-specific subject and relationships
- avoid inventing a brand-new visual language for each page in the same section

Within one section, consistency is more important than novelty.

### 10. If the user wants actual image generation

This skill plans and standardizes the prompts. If the user also wants the images generated, use the repo's image generation workflow after producing the prompts.

Do not skip the planning step when consistency matters.

### 11. imagegen-ready output rule

Whenever prompts are requested, end each recommendation with a final `imagegen`-ready prompt block.

That final block should:

- be in Chinese by default
- be a single coherent prompt, not an outline
- preserve framework names and required abbreviations in English where appropriate
- be ready to paste directly into the image generation tool

Prefer this pattern:

```md
- 最终提示词（适合 imagegen 直接使用）：
  ```text
  [one complete prompt]
  ```
```


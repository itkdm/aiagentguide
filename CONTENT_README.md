# Content README

这个文件用于约定站点内容维护规则，不会出现在网站导航里。

## Frontmatter 规范

推荐每篇内容使用下面这组字段：

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
- `draft` 或 `noindex`：任一为 `true` 时输出 `noindex, nofollow`

使用建议：

- `title` 控制浏览器标题、Open Graph 标题和 Twitter 标题
- `description` 控制搜索摘要，不要写得像正文首段
- `summary` 更适合列表卡片、栏目页摘要和人工维护
- `tags` 更偏站内聚合，`keywords` 更偏 SEO 补充
- `date` 适合资讯、教程、项目解读等时间敏感内容
- `ogImage` 建议用于首页、栏目页、重点文章、专题页

## 项目栏目维护说明

### 分类方式

- 按语言：Python / JavaScript / TypeScript
- 按方向：单 Agent / 多 Agent / Browser Agent / Code Agent / RAG Agent

### 固定字段

- 简介
- 适用场景
- 技术栈
- 难度
- 仓库链接

## 工具栏目维护说明

### 分类方式

- 框架
- 工作流编排
- 评测
- 观测
- 部署
- 知识库 / RAG
- 浏览器自动化

### 固定字段

- 工具名
- 定位
- 适合谁
- 官网
- 是否开源

## 资讯栏目维护说明

### 原则

- 优先写精选解读，不做简单新闻搬运
- 优先收录会影响学习、选型和实践方式的更新
- 更新频率可以低，但内容必须长期可读

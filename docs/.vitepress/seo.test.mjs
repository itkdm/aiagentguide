import test from 'node:test'
import assert from 'node:assert/strict'

import { buildSitemapXml, createSeoHead, resolvePageDescription } from './seo.ts'

test('expands short homepage descriptions into search-ready meta descriptions', () => {
  const description = resolvePageDescription(
    {
      relativePath: 'index.md',
      frontmatter: {
        description:
          'AI Agent 中文教程与开发实战指南，系统讲解 AI Agent 入门、智能体开发、Agent 框架选型、LLM 应用与 RAG 实战。'
      }
    },
    '',
    'AI Agent 中文教程与实战指南'
  )

  assert.ok(description.length >= 150, `expected description length >= 150, got ${description.length}`)
  assert.ok(description.length <= 158, `expected description length <= 158, got ${description.length}`)
  assert.match(description, /AI Agent/)
  assert.match(description, /智能体开发/)
  assert.match(description, /Agent 框架/)
  assert.match(description, /LLM 应用/)
  assert.match(description, /RAG/)
})

test('marks unpublished detail pages as noindex', () => {
  const head = createSeoHead({
    pageData: {
      relativePath: 'llm/ch01/example.md',
      frontmatter: {}
    },
    description: 'Test description',
    documentTitle: 'Example',
    siteTitle: 'AI Agent Guide',
    siteDescription: 'AI Agent 中文教程与实战指南',
    locale: 'zh-CN',
    siteUrl: 'https://aiagentguide.cn/'
  })

  assert.deepEqual(head[0], ['meta', { name: 'robots', content: 'noindex, nofollow' }])
  assert.equal(
    head.some(([tag, attrs]) => tag === 'link' && attrs?.rel === 'canonical'),
    false
  )
})

test('keeps section index pages indexable without explicit status', () => {
  const head = createSeoHead({
    pageData: {
      relativePath: 'rag/index.md',
      frontmatter: {}
    },
    description: 'Test description',
    documentTitle: 'RAG',
    siteTitle: 'AI Agent Guide',
    siteDescription: 'AI Agent 中文教程与实战指南',
    locale: 'zh-CN',
    siteUrl: 'https://aiagentguide.cn/'
  })

  assert.deepEqual(head[0], ['meta', { name: 'robots', content: 'index, follow, max-image-preview:large' }])
  assert.equal(
    head.some(([tag, attrs]) => tag === 'link' && attrs?.rel === 'canonical'),
    true
  )
})

test('includes only indexable pages in sitemap output', () => {
  const sitemap = buildSitemapXml(
    [
      'index.md',
      'rag/index.md',
      'llm/ch01/example.md',
      'frameworks/example.md',
      '404.md'
    ],
    'https://aiagentguide.cn/',
    false,
    {
      'index.md': {},
      'rag/index.md': {},
      'llm/ch01/example.md': {},
      'frameworks/example.md': { status: 'published' },
      '404.md': {}
    }
  )

  assert.match(sitemap, /https:\/\/aiagentguide\.cn\/<\/loc>/)
  assert.match(sitemap, /https:\/\/aiagentguide\.cn\/rag\/index\.html<\/loc>/)
  assert.match(sitemap, /https:\/\/aiagentguide\.cn\/frameworks\/example\.html<\/loc>/)
  assert.doesNotMatch(sitemap, /llm\/ch01\/example\.html/)
  assert.doesNotMatch(sitemap, /404\.html/)
})

test('adds section-specific context for short rag descriptions', () => {
  const description = resolvePageDescription(
    {
      relativePath: 'rag/index.md',
      frontmatter: {
        description: 'RAG 架构与检索增强生成文档。'
      }
    },
    '',
    'AI Agent 中文教程与实战指南'
  )

  assert.ok(description.length >= 150, `expected description length >= 150, got ${description.length}`)
  assert.ok(description.length <= 158, `expected description length <= 158, got ${description.length}`)
  assert.match(description, /RAG/)
  assert.match(description, /检索增强生成/)
  assert.match(description, /向量检索|重排|知识库/)
})

test('normalizes quoted frontmatter descriptions before expanding them', () => {
  const description = resolvePageDescription(
    {
      relativePath: 'principles/index.md',
      frontmatter: {
        description: '"系统拆解 AI Agent 的运行原理，覆盖 Agent 循环、工具调用与上下文管理。"' 
      }
    },
    '',
    'AI Agent 中文教程与实战指南'
  )

  assert.ok(description.length >= 150, `expected description length >= 150, got ${description.length}`)
  assert.ok(description.length <= 158, `expected description length <= 158, got ${description.length}`)
  assert.doesNotMatch(description, /^["'“”]/)
  assert.doesNotMatch(description, /["'“”][。．.]?/)
})

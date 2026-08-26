import test from 'node:test'
import assert from 'node:assert/strict'

import { buildRobotsTxt, buildSitemapXml, createSeoHead, resolvePageDescription } from './seo.ts'
import { siteSidebar } from './config/sidebar/index.ts'

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

  assert.ok(description.length >= 90, `expected description length >= 90, got ${description.length}`)
  assert.ok(description.length <= 160, `expected description length <= 160, got ${description.length}`)
  assert.match(description, /AI Agent/)
  assert.match(description, /智能体开发/)
  assert.match(description, /Agent 框架/)
  assert.match(description, /LLM 应用/)
  assert.match(description, /RAG/)
})

test('marks unpublished detail pages as noindex', () => {
  const head = createSeoHead({
    pageData: {
      relativePath: 'projects/example.md',
      frontmatter: {}
    },
    description: 'Test description',
    documentTitle: 'Example',
    siteTitle: '布吉岛 Agent',
    siteDescription: '布吉岛 Agent 是面向中文开发者的 AI Agent 教程与开发实战指南',
    locale: 'zh-CN',
    siteUrl: 'https://aiagentguide.cn/'
  })

  assert.deepEqual(head[0], ['meta', { name: 'robots', content: 'noindex, follow' }])
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
    siteTitle: '布吉岛 Agent',
    siteDescription: '布吉岛 Agent 是面向中文开发者的 AI Agent 教程与开发实战指南',
    locale: 'zh-CN',
    siteUrl: 'https://aiagentguide.cn/',
    sidebar: siteSidebar
  })

  assert.deepEqual(head[0], ['meta', { name: 'robots', content: 'index, follow, max-image-preview:large' }])
  assert.equal(
    head.some(([tag, attrs]) => tag === 'link' && attrs?.rel === 'canonical'),
    true
  )
})

test('marks deep section index pages as noindex unless published', () => {
  const head = createSeoHead({
    pageData: {
      relativePath: 'rag/ch01-rag-overview/index.md',
      frontmatter: {}
    },
    description: 'Test description',
    documentTitle: 'LLM 总览',
    siteTitle: '布吉岛 Agent',
    siteDescription: '布吉岛 Agent 是面向中文开发者的 AI Agent 教程与开发实战指南',
    locale: 'zh-CN',
    siteUrl: 'https://aiagentguide.cn/'
  })

  assert.deepEqual(head[0], ['meta', { name: 'robots', content: 'noindex, follow' }])
  assert.equal(
    head.some(([tag, attrs]) => tag === 'link' && attrs?.rel === 'canonical'),
    false
  )
})

test('includes only indexable pages in sitemap output', () => {
  const sitemap = buildSitemapXml(
    [
      'index.md',
      'rag/index.md',
      'rag/example.md',
      'projects/example.md',
      '404.md'
    ],
    'https://aiagentguide.cn/',
    false,
    {
      'index.md': {},
      'rag/index.md': {},
      'rag/example.md': {},
      'projects/example.md': { status: 'published' },
      '404.md': {}
    }
  )

  assert.match(sitemap, /https:\/\/aiagentguide\.cn\/<\/loc>/)
  assert.match(sitemap, /https:\/\/aiagentguide\.cn\/rag\/index\.html<\/loc>/)
  assert.match(sitemap, /https:\/\/aiagentguide\.cn\/projects\/example\.html<\/loc>/)
  assert.doesNotMatch(sitemap, /llm\/ch01\/example\.html/)
  assert.doesNotMatch(sitemap, /404\.html/)
})

test('adds lastmod to sitemap entries using page metadata', () => {
  const sitemap = buildSitemapXml(
    ['projects/example.md'],
    'https://aiagentguide.cn/',
    false,
    {
      'projects/example.md': { status: 'published', lastUpdated: '2026-05-30' }
    },
    {
      'projects/example.md': '2026-05-28T12:30:00.000Z'
    }
  )

  assert.match(
    sitemap,
    /<url><loc>https:\/\/aiagentguide\.cn\/projects\/example\.html<\/loc><lastmod>2026-05-30T00:00:00.000Z<\/lastmod><\/url>/
  )
})

test('uses clean urls for canonical and breadcrumb data when enabled', () => {
  const head = createSeoHead({
    pageData: {
      title: '问题页',
      relativePath: 'rag/ch01-rag-overview/m01-definition-and-positioning/q01-rag.md',
      frontmatter: { status: 'published' }
    },
    description: 'Test description',
    documentTitle: '问题页 | 布吉岛 Agent',
    siteTitle: '布吉岛 Agent',
    siteDescription: '布吉岛 Agent 是面向中文开发者的 AI Agent 教程与开发实战指南',
    locale: 'zh-CN',
    cleanUrls: true,
    siteUrl: 'https://aiagentguide.cn/',
    sidebar: siteSidebar
  })

  const canonical = head.find(([tag, attrs]) => tag === 'link' && attrs?.rel === 'canonical')
  assert.deepEqual(canonical, [
    'link',
    {
      rel: 'canonical',
      href: 'https://aiagentguide.cn/rag/ch01-rag-overview/m01-definition-and-positioning/q01-rag'
    }
  ])

  const structuredData = head.find(([tag, attrs]) => tag === 'script' && attrs?.type === 'application/ld+json')
  assert.ok(structuredData)
  assert.match(structuredData[2], /https:\/\/aiagentguide\.cn\/rag\/ch01-rag-overview\/m01-definition-and-positioning\/q01-rag/)
  assert.doesNotMatch(structuredData[2], /index\.html/)
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

  assert.ok(description.length >= 90, `expected description length >= 90, got ${description.length}`)
  assert.ok(description.length <= 160, `expected description length <= 160, got ${description.length}`)
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

  assert.ok(description.length >= 90, `expected description length >= 90, got ${description.length}`)
  assert.ok(description.length <= 160, `expected description length <= 160, got ${description.length}`)
  assert.doesNotMatch(description, /^["'“”]/)
  assert.doesNotMatch(description, /["'“”][。．.]?/)
})

test('blocks Cloudflare internal paths in robots.txt', () => {
  const robots = buildRobotsTxt('https://aiagentguide.cn/', '/')

  assert.match(robots, /Disallow: \/cdn-cgi\//)
  assert.match(robots, /Sitemap: https:\/\/aiagentguide\.cn\/sitemap\.xml/)
})

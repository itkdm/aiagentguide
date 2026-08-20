import test from 'node:test'
import assert from 'node:assert/strict'

import { buildBreadcrumbChain, normalizePath } from './breadcrumb.ts'
import { siteSidebar } from './config/sidebar/index.ts'

function texts(chain) {
  return chain.map((node) => node.text)
}

function links(chain) {
  return chain.map((node) => node.link)
}

// ---------- Case 0: normalizePath 基本行为 ----------
test('normalizePath strips base, slashes, html/md and query', () => {
  assert.equal(normalizePath('/'), '')
  assert.equal(normalizePath(''), '')
  assert.equal(normalizePath('/rag/'), 'rag')
  assert.equal(normalizePath('/rag/ch01/index.html'), 'rag/ch01')
  assert.equal(normalizePath('/rag/ch01/q.md'), 'rag/ch01/q')
  assert.equal(normalizePath('/repo/rag/'), 'repo/rag')
  assert.equal(normalizePath('/rag/?x=1#hash'), 'rag')
})

// ---------- Case 1: 浅层入门文章，当前页不被错误 pop ----------
test('shallow getting-started article keeps current page as last node', () => {
  const chain = buildBreadcrumbChain(
    '/getting-started/what-is-ai-agent',
    siteSidebar,
    'Agent 是什么'
  )

  assert.deepEqual(texts(chain), ['入门', 'Agent 是什么'])
  // 当前页是最后一项且未被删除
  assert.equal(chain[chain.length - 1].text, 'Agent 是什么')
  assert.equal(links(chain)[chain.length - 1], '/getting-started/what-is-ai-agent')
})

// ---------- Case 2: 深层 RAG Question，完整层级 ----------
test('deep RAG question yields full sidebar chain', () => {
  const chain = buildBreadcrumbChain(
    '/rag/ch01-rag-overview/m01-definition-and-positioning/q01-rag',
    siteSidebar,
    '1.1.1 RAG 是什么？'
  )

  // 首页 / RAG / 第1章 / 1.1 / 1.1.1...
  assert.equal(chain.length, 4)
  assert.equal(chain[0].text, 'RAG')
  assert.equal(chain[0].link, '/rag/')
  assert.equal(chain[chain.length - 1].text, '1.1.1 RAG 是什么？')
  assert.equal(
    chain[chain.length - 1].link,
    '/rag/ch01-rag-overview/m01-definition-and-positioning/q01-rag'
  )
})

// ---------- Case 3: 栏目首页，不出现“概览”重复 ----------
test('section homepage shows 首页 / RAG without 概览', () => {
  const chain = buildBreadcrumbChain('/rag/', siteSidebar, 'RAG')

  assert.deepEqual(texts(chain), ['RAG'])
  assert.ok(!texts(chain).includes('概览'))
  assert.equal(chain[0].link, '/rag/')
})

// ---------- Case 4: Chapter 概览页，不出现“概览”重复 ----------
test('chapter overview page shows 首页 / RAG / 第3章 without 概览', () => {
  const chain = buildBreadcrumbChain(
    '/rag/ch03-chunk-metadata-and-pre-index-design/',
    siteSidebar,
    '第 3 章 Chunk、Metadata 与索引前设计'
  )

  assert.equal(chain.length, 2)
  assert.equal(chain[0].text, 'RAG')
  assert.equal(chain[1].text, '第 3 章 Chunk、Metadata 与索引前设计')
  assert.ok(!texts(chain).includes('概览'))
  assert.equal(
    chain[1].link,
    '/rag/ch03-chunk-metadata-and-pre-index-design/'
  )
})

// ---------- Case 5: 首页不渲染面包屑 ----------
test('homepage returns empty chain', () => {
  assert.deepEqual(buildBreadcrumbChain('/', siteSidebar, '布吉岛 Agent'), [])
  assert.deepEqual(buildBreadcrumbChain('', siteSidebar, '布吉岛 Agent'), [])
})

// ---------- Case 6: 不在 sidebar 中的页面合理 fallback ----------
test('page not in sidebar falls back to title only', () => {
  const chain = buildBreadcrumbChain(
    '/some/unknown/page',
    siteSidebar,
    '未知页面标题'
  )

  assert.deepEqual(texts(chain), ['未知页面标题'])
  assert.equal(chain[0].link, '/some/unknown/page')
})

test('page not in sidebar without title returns empty', () => {
  assert.deepEqual(buildBreadcrumbChain('/some/unknown/page', siteSidebar), [])
})

// ---------- Case 7: 与 SEO JSON-LD 同源（position 连续、含首页） ----------
test('breadcrumb chain aligns with BreadcrumbList JSON-LD structure', async () => {
  const { createSeoHead } = await import('./seo.ts')

  const head = createSeoHead({
    pageData: {
      title: '1.1.1 RAG 是什么？',
      relativePath: 'rag/ch01-rag-overview/m01-definition-and-positioning/q01-rag.md',
      frontmatter: { status: 'published' }
    },
    description: 'desc',
    documentTitle: '1.1.1 RAG 是什么？ | 布吉岛 Agent',
    siteTitle: '布吉岛 Agent',
    siteDescription: '布吉岛 Agent 是面向中文开发者的 AI Agent 教程与开发实战指南',
    locale: 'zh-CN',
    cleanUrls: true,
    siteUrl: 'https://aiagentguide.cn/',
    sidebar: siteSidebar
  })

  const jsonLd = head.find(
    ([tag, attrs]) => tag === 'script' && attrs?.type === 'application/ld+json'
  )
  assert.ok(jsonLd, 'should contain application/ld+json script')

  const data = JSON.parse(jsonLd[2])
  const breadcrumb = data.find((entry) => entry['@type'] === 'BreadcrumbList')
  assert.ok(breadcrumb, 'should contain BreadcrumbList')

  const items = breadcrumb.itemListElement
  // position 必须从 1 连续递增
  items.forEach((item, i) => assert.equal(item.position, i + 1))
  // 第一项是首页
  assert.equal(items[0].name, '首页')
  assert.equal(items[0].item, 'https://aiagentguide.cn/')
  // 最后一项是当前页且链接为规范 URL
  const last = items[items.length - 1]
  assert.equal(last.name, '1.1.1 RAG 是什么？')
  assert.equal(last.item, 'https://aiagentguide.cn/rag/ch01-rag-overview/m01-definition-and-positioning/q01-rag')
  // 层级名与可见面包屑一致（去掉首页后）
  const visibleTexts = texts(
    buildBreadcrumbChain(
      '/rag/ch01-rag-overview/m01-definition-and-positioning/q01-rag',
      siteSidebar,
      '1.1.1 RAG 是什么？'
    )
  )
  const jsonLdTexts = items.slice(1).map((it) => it.name)
  assert.deepEqual(jsonLdTexts, visibleTexts)
})

import test from 'node:test'
import assert from 'node:assert/strict'

import { resolvePageDescription } from './seo.ts'

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

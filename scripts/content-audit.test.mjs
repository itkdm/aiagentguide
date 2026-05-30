import test from 'node:test'
import assert from 'node:assert/strict'

import {
  auditMarkdownEntries,
  classifyDocumentPath,
  parseFrontmatter,
  formatAuditReport
} from './content-audit.mjs'

test('classifyDocumentPath separates overview and detail pages', () => {
  assert.equal(classifyDocumentPath('index.md'), 'overview')
  assert.equal(classifyDocumentPath('frameworks/index.md'), 'overview')
  assert.equal(classifyDocumentPath('frameworks/langchain/frontend/overview.md'), 'overview')
  assert.equal(classifyDocumentPath('frameworks/how-to-choose-agent-framework.md'), 'detail')
})

test('parseFrontmatter accepts utf-8 bom prefixed files', () => {
  const frontmatter = parseFrontmatter(`\uFEFF---
title: BOM title
summary: BOM summary
status: published
---`)

  assert.equal(frontmatter.title, 'BOM title')
  assert.equal(frontmatter.summary, 'BOM summary')
  assert.equal(frontmatter.status, 'published')
})

test('auditMarkdownEntries flags detail pages missing indexability decision and minimum threshold', () => {
  const audit = auditMarkdownEntries([
    {
      relativePath: 'frameworks/index.md',
      source: `---
title: Frameworks
description: Framework overview
summary: Framework summary
status: published
draft: false
noindex: false
assets: none
---
`
    },
    {
      relativePath: 'frameworks/langchain/agents.md',
      source: `---
title: Agents
summary: Learn agent basics
assets: none
---
`
    }
  ])

  assert.deepEqual(audit.pageTypeCounts, {
    overview: 1,
    detail: 1
  })
  assert.equal(audit.coverage.detail.indexabilityDecision, 0)
  assert.equal(audit.coverage.detail.minimumThreshold, 0)
  assert.deepEqual(audit.detailMissingIndexabilityDecision, [
    'frameworks/langchain/agents.md'
  ])
  assert.deepEqual(audit.detailBelowMinimumThreshold, [
    {
      relativePath: 'frameworks/langchain/agents.md',
      missing: ['indexabilityDecision']
    }
  ])
})

test('auditMarkdownEntries accepts status or draft/noindex as indexability decision and tracks draft/noindex coverage', () => {
  const audit = auditMarkdownEntries([
    {
      relativePath: 'frameworks/index.md',
      source: `---
title: Frameworks
summary: Framework overview
status: published
draft: false
noindex: false
assets: none
---
`
    },
    {
      relativePath: 'frameworks/langchain/index.md',
      source: `---
title: LangChain
description: LangChain overview
draft: true
noindex: true
assets: none
---
`
    },
    {
      relativePath: 'frameworks/langchain/quickstart.md',
      source: `---
title: Quickstart
summary: Start here
status: review
assets: none
---
`
    },
    {
      relativePath: 'frameworks/langchain/runtime.md',
      source: `---
title: Runtime
description: Runtime docs
draft: false
assets: none
---
`
    }
  ])

  assert.equal(audit.coverage.overview.indexabilityDecision, 2)
  assert.equal(audit.coverage.detail.indexabilityDecision, 2)
  assert.equal(audit.coverage.detail.minimumThreshold, 2)
  assert.deepEqual(audit.draftNoindexCoverage, {
    bothPresent: 2,
    draftPresentOnly: 1,
    noindexPresentOnly: 0,
    missingBoth: 1,
    blockedFromIndexing: 1,
    explicitIndexable: 1
  })
})

test('auditMarkdownEntries tracks keyword coverage for indexable and published pages', () => {
  const audit = auditMarkdownEntries([
    {
      relativePath: 'index.md',
      source: `---
title: Home
description: Site home
summary: Site summary
keywords:
  - AI Agent 教程
status: published
lastUpdated: 2026-05-30
assets: none
---
`
    },
    {
      relativePath: 'llm/index.md',
      source: `---
title: LLM
description: LLM overview
summary: LLM summary
status: published
lastUpdated: 2026-05-30
assets: none
---
`
    },
    {
      relativePath: 'frameworks/how-to-choose.md',
      source: `---
title: Framework choice
description: Compare frameworks
summary: Compare frameworks
status: published
assets: none
---
`
    }
  ])

  assert.deepEqual(audit.keywordCoverage, {
    totalWithKeywords: 1,
    indexablePages: 3,
    indexableWithKeywords: 1,
    indexableOverviewPages: 2,
    indexableOverviewWithKeywords: 1,
    publishedDetailPages: 1,
    publishedDetailWithKeywords: 0
  })
  assert.deepEqual(audit.indexableMissingKeywords, [
    'llm/index.md',
    'frameworks/how-to-choose.md'
  ])
  assert.deepEqual(audit.publishedDetailMissingKeywords, ['frameworks/how-to-choose.md'])
  assert.deepEqual(audit.indexableOverviewBelowSeoThreshold, [
    {
      relativePath: 'llm/index.md',
      missing: ['keywords']
    }
  ])
})

test('formatAuditReport includes Search Console oriented sections for detail gaps and page-type coverage', () => {
  const audit = auditMarkdownEntries([
    {
      relativePath: 'frameworks/index.md',
      source: `---
title: Frameworks
summary: Framework overview
status: published
draft: false
noindex: false
assets: none
---
`
    },
    {
      relativePath: 'frameworks/langchain/agents.md',
      source: `---
title: Agents
summary: Learn agent basics
assets: none
---
`
    }
  ])

  const report = formatAuditReport(audit)

  assert.match(report, /Page Type Counts/)
  assert.match(report, /Detail Pages Missing Indexability Decision/)
  assert.match(report, /Draft\/Noindex Coverage/)
  assert.match(report, /Keyword Coverage/)
  assert.match(report, /Indexable Pages Missing Keywords/)
  assert.match(report, /Indexable Overview Pages Below SEO Threshold/)
  assert.match(report, /Detail Minimum Frontmatter Threshold/)
  assert.match(report, /frameworks\/langchain\/agents\.md/)
})

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildSummary,
  classifyRequestPath,
  getPreviousCompleteSixHourWindow,
  rowsToCsv
} from './bing-crawl-collect.mjs'

test('uses the previous complete UTC six-hour window', () => {
  assert.deepEqual(
    getPreviousCompleteSixHourWindow(new Date('2026-09-15T06:42:00Z')),
    {
      start: '2026-09-15T00:00:00.000Z',
      end: '2026-09-15T06:00:00.000Z'
    }
  )
})

test('classifies control, sitemap and other paths', () => {
  const sitemapPaths = new Set(['/getting-started/example'])

  assert.equal(classifyRequestPath('/', sitemapPaths), 'CONTROL')
  assert.equal(classifyRequestPath('/sitemap.xml', sitemapPaths), 'CONTROL')
  assert.equal(classifyRequestPath('/getting-started/example', sitemapPaths), 'INDEXABLE_CONTENT')
  assert.equal(classifyRequestPath('/graphql', sitemapPaths), 'OTHER')
})

test('builds crawl summary and sitemap coverage', () => {
  const rows = [
    { path: '/', status: 200, request_count: 2, response_bytes: 10, sample_interval: 1, category: 'CONTROL' },
    { path: '/getting-started/example', status: 200, request_count: 3, response_bytes: 20, sample_interval: 1, category: 'INDEXABLE_CONTENT' },
    { path: '/graphql', status: 404, request_count: 4, response_bytes: 30, sample_interval: 1, category: 'OTHER' }
  ]
  const summary = buildSummary({
    rows,
    sitemapUrl: 'https://aiagentguide.cn/sitemap.xml',
    sitemapPaths: new Set(['/getting-started/example', '/another-page']),
    window: { start: '2026-09-15T00:00:00.000Z', end: '2026-09-15T06:00:00.000Z' }
  })

  assert.equal(summary.total_requests, 9)
  assert.equal(summary.unique_indexable_pages_crawled, 1)
  assert.equal(summary.sitemap_coverage, 0.5)
  assert.equal(summary.not_found_requests, 4)
})

test('exports request rows as CSV with escaped user agents', () => {
  const csv = rowsToCsv([{
    time: '2026-09-15T00:00:00Z',
    path: '/',
    hostname: 'aiagentguide.cn',
    status: 200,
    user_agent: 'bingbot, test',
    request_count: 1,
    response_bytes: 10,
    sample_interval: 1,
    category: 'CONTROL'
  }])

  assert.match(csv, /"bingbot, test"/)
})

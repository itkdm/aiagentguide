import test from 'node:test'
import assert from 'node:assert/strict'

import { filesToIndexNowUrls, pathToIndexNowUrl } from './indexnow-submit.mjs'

const siteUrl = 'https://aiagentguide.cn/'

test('maps root markdown page to homepage url', () => {
  assert.equal(pathToIndexNowUrl('docs/index.md', siteUrl), 'https://aiagentguide.cn/')
})

test('maps section index markdown page to canonical index.html url', () => {
  assert.equal(
    pathToIndexNowUrl('docs/getting-started/index.md', siteUrl),
    'https://aiagentguide.cn/getting-started/index.html'
  )
})

test('maps detail markdown page to canonical html url', () => {
  assert.equal(
    pathToIndexNowUrl('docs/getting-started/how-agent-works.md', siteUrl),
    'https://aiagentguide.cn/getting-started/how-agent-works.html'
  )
})

test('maps docs public assets to root-relative urls', () => {
  assert.equal(
    pathToIndexNowUrl('docs/public/social-card.svg', siteUrl),
    'https://aiagentguide.cn/social-card.svg'
  )
})

test('deduplicates urls and ignores unsupported files', () => {
  const urls = filesToIndexNowUrls(
    [
      'README.md',
      'docs/index.md',
      'docs/index.md',
      'docs/public/social-card.svg',
      'scripts/build-pages.mjs'
    ],
    siteUrl
  )

  assert.deepEqual(urls, [
    'https://aiagentguide.cn/',
    'https://aiagentguide.cn/social-card.svg'
  ])
})

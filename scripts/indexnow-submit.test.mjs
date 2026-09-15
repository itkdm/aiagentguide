import test from 'node:test'
import assert from 'node:assert/strict'

import {
  filesToIndexNowUrls,
  isIndexableMarkdown,
  pathToIndexNowUrl,
  shouldSubmitIndexNowFile,
  shouldSubmitIndexNowVersions
} from './indexnow-submit.mjs'

const siteUrl = 'https://aiagentguide.cn/'

test('maps root markdown page to homepage url', () => {
  assert.equal(pathToIndexNowUrl('docs/index.md', siteUrl), 'https://aiagentguide.cn/')
})

test('maps section index markdown page to clean url', () => {
  assert.equal(
    pathToIndexNowUrl('docs/getting-started/index.md', siteUrl),
    'https://aiagentguide.cn/getting-started/'
  )
})

test('maps detail markdown page to clean url', () => {
  assert.equal(
    pathToIndexNowUrl('docs/getting-started/how-agent-works.md', siteUrl),
    'https://aiagentguide.cn/getting-started/how-agent-works'
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

test('recognizes the same indexability rules as the site', () => {
  assert.equal(isIndexableMarkdown('docs/tools/example.md', '---\nnoindex: true\n---\n'), false)
  assert.equal(isIndexableMarkdown('docs/tools/example.md', '---\nstatus: published\n---\n'), true)
  assert.equal(isIndexableMarkdown('docs/tools/index.md', '# Tools\n'), true)
  assert.equal(isIndexableMarkdown('docs/tools/nested/index.md', '# Nested\n'), false)
})

test('submits when either the previous or current version is indexable', () => {
  const blocked = '---\nnoindex: true\n---\n'
  const published = '---\nstatus: published\n---\n'

  assert.equal(shouldSubmitIndexNowVersions('docs/tools/example.md', blocked, blocked), false)
  assert.equal(shouldSubmitIndexNowVersions('docs/tools/example.md', published, blocked), true)
  assert.equal(shouldSubmitIndexNowVersions('docs/tools/example.md', blocked, published), true)
  assert.equal(shouldSubmitIndexNowVersions('docs/tools/example.md', published, published), true)
})

test('fails when the IndexNow base commit cannot be resolved', () => {
  assert.throws(
    () => shouldSubmitIndexNowFile('docs/tools/astronclaw.md', { beforeSha: 'missing-commit' }),
    /Unable to resolve IndexNow base commit: missing-commit/
  )
})

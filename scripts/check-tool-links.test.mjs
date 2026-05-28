import test from 'node:test'
import assert from 'node:assert/strict'

import { extractToolUrls } from './check-tool-links.mjs'

test('extractToolUrls returns unique external hrefs from html anchors', () => {
  const markdown = `
<a class="tool-detail-button" href="https://example.com" target="_blank">官网</a>
<a href="https://example.com/docs" target="_blank">文档</a>
<a href="https://example.com" target="_blank">重复</a>
- [This markdown link should be ignored](https://ignored.example.com)
`

  assert.deepEqual(extractToolUrls(markdown), [
    'https://example.com',
    'https://example.com/docs'
  ])
})

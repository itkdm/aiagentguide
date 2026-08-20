import test from 'node:test'
import assert from 'node:assert/strict'

import { needsHtmlRedirect, toHtmlPath } from './html-url.ts'

test('keeps clean section-style doc paths unchanged', () => {
  assert.equal(needsHtmlRedirect('/getting-started/'), false)
  assert.equal(toHtmlPath('/getting-started/'), '/getting-started/')
})

test('keeps clean doc detail paths unchanged', () => {
  assert.equal(needsHtmlRedirect('/tools/mastra'), false)
  assert.equal(toHtmlPath('/tools/mastra'), '/tools/mastra')
})

test('does not redirect root path', () => {
  assert.equal(needsHtmlRedirect('/'), false)
  assert.equal(toHtmlPath('/'), '/')
})

test('redirects html detail paths to clean urls', () => {
  assert.equal(needsHtmlRedirect('/tools/mastra.html'), true)
  assert.equal(toHtmlPath('/tools/mastra.html'), '/tools/mastra')
})

test('redirects section index.html paths to clean urls', () => {
  assert.equal(needsHtmlRedirect('/getting-started/index.html'), true)
  assert.equal(toHtmlPath('/getting-started/index.html'), '/getting-started/')
})

test('does not redirect static assets with file extensions', () => {
  assert.equal(needsHtmlRedirect('/91444b8270a94408a74c1a2538765240.txt'), false)
  assert.equal(toHtmlPath('/91444b8270a94408a74c1a2538765240.txt'), '/91444b8270a94408a74c1a2538765240.txt')
  assert.equal(needsHtmlRedirect('/sitemap.xml'), false)
  assert.equal(needsHtmlRedirect('/social-card.svg'), false)
})

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8')
}

function collectMarkdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return collectMarkdownFiles(entryPath)
    }

    return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : []
  })
}

test('uses the 布吉岛 Agent brand in site metadata', () => {
  const siteConfig = read('docs/.vitepress/config/site.ts')

  assert.match(siteConfig, /siteTitle = '布吉岛 Agent'/)
  assert.match(siteConfig, /siteDescription = '布吉岛 Agent 是面向中文开发者的 AI Agent 教程与开发实战指南'/)
  assert.match(siteConfig, /alt: '布吉岛 Agent'/)
  assert.match(siteConfig, /布吉岛 Agent · 从不知道，到做得到/)
  assert.match(siteConfig, /Copyright © 2026 布吉岛/)
})

test('presents the brand and slogan on the homepage', () => {
  const homepage = read('docs/index.md')
  const homeStyles = read('docs/.vitepress/theme/styles/home.css')

  assert.match(homepage, /^title: AI Agent 中文教程与开发实战$/m)
  assert.match(homepage, /^author: 布吉岛$/m)
  assert.match(homepage, /^  name: "布吉岛 Agent"$/m)
  assert.match(homepage, /^  text: "从不知道，到做得到"$/m)
  assert.match(homepage, /^lastUpdated: 2026-07-20$/m)
  assert.match(
    homeStyles,
    /\.VPHomeHero \.text \{\r?\n  max-width: none;\r?\n  letter-spacing: -0\.04em;/
  )
  assert.match(
    homeStyles,
    /@media \(max-width: 640px\)[\s\S]*?\.VPHomeHero \.text \{\r?\n    max-width: 5\.5em;\r?\n    font-size: clamp\(2\.35rem, 10\.25vw, 2\.75rem\);\r?\n    line-height: 1\.02;/
  )
})

test('uses 布吉岛 as the author across published markdown sources', () => {
  const markdownFiles = collectMarkdownFiles(path.join(projectRoot, 'docs'))
  const legacyAuthorFiles = markdownFiles.filter((file) =>
    /^author: AI Agent Guide\s*$/m.test(fs.readFileSync(file, 'utf8'))
  )

  assert.deepEqual(legacyAuthorFiles, [])
})

test('uses the new brand in repository and social previews', () => {
  const readme = read('README.md')
  const socialCard = read('docs/public/social-card.svg')

  assert.match(readme, /布吉岛 Agent/)
  assert.match(readme, /从不知道，到做得到/)
  assert.doesNotMatch(readme, /AI Agent Guide/)
  assert.match(socialCard, /布吉岛 Agent/)
  assert.match(socialCard, /从不知道，到做得到/)
  assert.doesNotMatch(socialCard, /AI AGENT GUIDE/)
})

import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

test('vitepress output directory stays outside the docs source tree', () => {
  const projectRoot = process.cwd()
  const configPath = path.join(projectRoot, 'docs', '.vitepress', 'config.mts')
  const configSource = fs.readFileSync(configPath, 'utf8')
  const outDirMatch = configSource.match(/outDir:\s*['"`]([^'"`]+)['"`]/)

  assert.ok(outDirMatch, 'Expected VitePress config to define outDir.')

  const [, configuredOutDir] = outDirMatch
  const docsRoot = path.resolve(projectRoot, 'docs')
  const outDir = path.resolve(docsRoot, configuredOutDir)
  const relativeToDocs = path.relative(docsRoot, outDir)

  assert.notStrictEqual(relativeToDocs, '', 'Expected outDir to be different from docs root.')
  assert.ok(
    relativeToDocs.startsWith('..'),
    `Expected outDir "${outDir}" to be outside docs root "${docsRoot}".`
  )
})

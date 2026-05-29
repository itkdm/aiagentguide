import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

function readConfiguredOutDir() {
  const projectRoot = process.cwd()
  const configPath = path.join(projectRoot, 'docs', '.vitepress', 'config.mts')
  const configSource = fs.readFileSync(configPath, 'utf8')
  const outDirMatch = configSource.match(/outDir:\s*['"`]([^'"`]+)['"`]/)

  assert.ok(outDirMatch, 'Expected VitePress config to define outDir.')

  const [, configuredOutDir] = outDirMatch
  const docsRoot = path.resolve(projectRoot, 'docs')
  const outDir = path.resolve(docsRoot, configuredOutDir)

  return {
    docsRoot,
    outDir,
    relativeToRoot: path.relative(projectRoot, outDir).replace(/\\/g, '/')
  }
}

test('vitepress output directory stays outside the docs source tree', () => {
  const { docsRoot, outDir } = readConfiguredOutDir()
  const relativeToDocs = path.relative(docsRoot, outDir)

  assert.notStrictEqual(relativeToDocs, '', 'Expected outDir to be different from docs root.')
  assert.ok(
    relativeToDocs.startsWith('..'),
    `Expected outDir "${outDir}" to be outside docs root "${docsRoot}".`
  )
})

test('deploy workflow verifies and uploads the configured VitePress output directory', () => {
  const projectRoot = process.cwd()
  const { relativeToRoot } = readConfiguredOutDir()
  const workflowPath = path.join(projectRoot, '.github', 'workflows', 'deploy-pages.yml')
  const workflowSource = fs.readFileSync(workflowPath, 'utf8')

  assert.match(
    workflowSource,
    new RegExp(`test -f ${relativeToRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/index\\.html`),
    'Expected workflow build verification to check the configured outDir.'
  )
  assert.match(
    workflowSource,
    new RegExp(`path: ${relativeToRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
    'Expected Pages artifact upload to use the configured outDir.'
  )
})

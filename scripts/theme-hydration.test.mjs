import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const projectRoot = process.cwd()

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8')
}

test('keeps the legacy html redirect side effect out of the layout render tree', () => {
  const layout = read('docs/.vitepress/theme/Layout.vue')
  const redirectComposable = read(
    'docs/.vitepress/theme/composables/useHtmlUrlRedirect.ts'
  )
  const legacyComponentPath = path.join(
    projectRoot,
    'docs/.vitepress/theme/components/HtmlUrlRedirector.vue'
  )

  assert.match(layout, /import \{ useHtmlUrlRedirect \} from/)
  assert.match(layout, /useHtmlUrlRedirect\(\)/)
  assert.doesNotMatch(layout, /<HtmlUrlRedirector\s*\/>/)
  assert.equal(fs.existsSync(legacyComponentPath), false)

  assert.match(redirectComposable, /onMounted\(\(\) =>/)
  assert.match(redirectComposable, /needsHtmlRedirect\(window\.location\.pathname\)/)
  assert.match(redirectComposable, /window\.location\.replace\(/)
})

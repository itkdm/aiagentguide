import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve('docs')
const IGNORED_DIRS = new Set(['.vitepress', 'public'])
const REQUIRED_FIELDS = ['title', 'description', 'summary']
const STATUS_FIELD = 'status'
const ASSETS_FIELD = 'assets'

function walkMarkdownFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue
      }

      files.push(...walkMarkdownFiles(path.join(dir, entry.name)))
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(path.join(dir, entry.name))
    }
  }

  return files
}

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) {
    return {}
  }

  const data = {}
  let currentKey = null

  for (const rawLine of match[1].split(/\r?\n/)) {
    if (!rawLine.trim()) {
      continue
    }

    const listItem = rawLine.match(/^\s*-\s+(.*)$/)
    if (listItem && currentKey) {
      if (!Array.isArray(data[currentKey])) {
        data[currentKey] = []
      }
      data[currentKey].push(listItem[1].trim())
      continue
    }

    const pair = rawLine.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/)
    if (!pair) {
      currentKey = null
      continue
    }

    const [, key, value] = pair
    currentKey = key

    if (!value) {
      data[key] = []
      continue
    }

    if (value === 'true' || value === 'false') {
      data[key] = value === 'true'
      continue
    }

    data[key] = value.trim()
  }

  return data
}

function normalizeSection(relativePath) {
  const parts = relativePath.split(path.sep)
  return parts[0] || 'root'
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1)
}

function printMap(title, map) {
  console.log(`\n${title}`)
  for (const [key, value] of [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`- ${key}: ${value}`)
  }
}

const markdownFiles = walkMarkdownFiles(ROOT)
const sectionCounts = new Map()
const statusCounts = new Map()
const assetsCounts = new Map()
const missingRequired = []
const missingStateFields = []

for (const absolutePath of markdownFiles) {
  const relativePath = path.relative(ROOT, absolutePath)
  const source = fs.readFileSync(absolutePath, 'utf8')
  const frontmatter = parseFrontmatter(source)
  const section = normalizeSection(relativePath)

  increment(sectionCounts, section)
  increment(statusCounts, frontmatter[STATUS_FIELD] || 'unspecified')
  increment(assetsCounts, frontmatter[ASSETS_FIELD] || 'unspecified')

  const missingFields = REQUIRED_FIELDS.filter((field) => {
    const value = frontmatter[field]
    return value === undefined || value === '' || (Array.isArray(value) && value.length === 0)
  })

  if (missingFields.length) {
    missingRequired.push({ relativePath, missingFields })
  }

  const missingState = [STATUS_FIELD, ASSETS_FIELD].filter((field) => frontmatter[field] === undefined)
  if (missingState.length) {
    missingStateFields.push({ relativePath, missingState })
  }
}

console.log(`Scanned ${markdownFiles.length} markdown files under docs/`)
printMap('Section Counts', sectionCounts)
printMap('Status Counts', statusCounts)
printMap('Assets Counts', assetsCounts)

console.log('\nMissing Required Metadata')
if (!missingRequired.length) {
  console.log('- none')
} else {
  for (const item of missingRequired.slice(0, 30)) {
    console.log(`- ${item.relativePath}: ${item.missingFields.join(', ')}`)
  }
  if (missingRequired.length > 30) {
    console.log(`- ... and ${missingRequired.length - 30} more`)
  }
}

console.log('\nMissing State Fields')
if (!missingStateFields.length) {
  console.log('- none')
} else {
  for (const item of missingStateFields.slice(0, 30)) {
    console.log(`- ${item.relativePath}: ${item.missingState.join(', ')}`)
  }
  if (missingStateFields.length > 30) {
    console.log(`- ... and ${missingStateFields.length - 30} more`)
  }
}

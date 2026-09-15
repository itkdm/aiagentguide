const DEFAULT_ENDPOINT = 'https://api.indexnow.org/indexnow'

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { isIndexablePage } from './indexability.mjs'

function normalizeSiteUrl(siteUrl) {
  const normalized = /^https?:\/\//i.test(siteUrl) ? siteUrl : `https://${siteUrl}`
  return normalized.endsWith('/') ? normalized : `${normalized}/`
}

function normalizeFilePath(filePath) {
  return String(filePath || '').trim().replace(/\\/g, '/').replace(/^\.\/+/, '')
}

function parseFrontmatter(source) {
  const match = String(source || '').match(/^---\r?\n([\s\S]*?)\r?\n---/)

  if (!match) {
    return {}
  }

  const frontmatter = {}

  for (const rawLine of match[1].split(/\r?\n/)) {
    const pair = rawLine.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/)

    if (!pair) {
      continue
    }

    const [, key, rawValue] = pair

    if (rawValue === 'true' || rawValue === 'false') {
      frontmatter[key] = rawValue === 'true'
    } else {
      frontmatter[key] = rawValue.trim().replace(/^['"]|['"]$/g, '')
    }
  }

  return frontmatter
}

export function isIndexableMarkdown(filePath, source) {
  const normalizedPath = normalizeFilePath(filePath)

  if (!normalizedPath.startsWith('docs/') || !normalizedPath.endsWith('.md')) {
    return false
  }

  const frontmatter = parseFrontmatter(source)

  return isIndexablePage({
    relativePath: normalizedPath.slice('docs/'.length),
    frontmatter
  })
}

function readCurrentFile(filePath, cwd) {
  const absolutePath = path.resolve(cwd, normalizeFilePath(filePath))

  try {
    return fs.readFileSync(absolutePath, 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return undefined
    }

    throw error
  }
}

function commitContainsFile(filePath, commit, cwd) {
  try {
    execFileSync('git', ['cat-file', '-e', `${commit}:${normalizeFilePath(filePath)}`], {
      cwd,
      stdio: 'ignore'
    })
    return true
  } catch {
    try {
      execFileSync('git', ['rev-parse', '--verify', `${commit}^{commit}`], {
        cwd,
        stdio: 'ignore'
      })
    } catch {
      throw new Error(`Unable to resolve IndexNow base commit: ${commit}`)
    }

    return undefined
  }
}

function readFileAtCommit(filePath, commit, cwd) {
  if (!commit) {
    return undefined
  }

  if (!commitContainsFile(filePath, commit, cwd)) {
    return undefined
  }

  try {
    return execFileSync('git', ['show', `${commit}:${normalizeFilePath(filePath)}`], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    })
  } catch (error) {
    throw new Error(`Unable to read IndexNow base file ${normalizeFilePath(filePath)} at ${commit}: ${error.message}`)
  }
}

export function shouldSubmitIndexNowVersions(filePath, currentSource, previousSource) {
  const normalizedPath = normalizeFilePath(filePath)

  if (!normalizedPath.startsWith('docs/') || !normalizedPath.endsWith('.md')) {
    return normalizedPath.startsWith('docs/public/')
  }

  const currentIndexable = currentSource !== undefined && isIndexableMarkdown(normalizedPath, currentSource)
  const previousIndexable = previousSource !== undefined && isIndexableMarkdown(normalizedPath, previousSource)

  return currentIndexable || previousIndexable
}

export function shouldSubmitIndexNowFile(filePath, { beforeSha, cwd = process.cwd() } = {}) {
  const normalizedPath = normalizeFilePath(filePath)
  const currentSource = readCurrentFile(normalizedPath, cwd)
  const previousSource = readFileAtCommit(normalizedPath, beforeSha, cwd)

  return shouldSubmitIndexNowVersions(normalizedPath, currentSource, previousSource)
}

export function getIndexNowSubmissionPaths(fileChanges, { beforeSha, cwd = process.cwd() } = {}) {
  const submissionPaths = new Set()

  for (const change of fileChanges) {
    const currentPath = normalizeFilePath(change.path ?? change)
    const previousPath = normalizeFilePath(change.previousPath ?? currentPath)

    if (!currentPath.startsWith('docs/') || !currentPath.endsWith('.md')) {
      if (currentPath.startsWith('docs/public/')) {
        submissionPaths.add(currentPath)
      }
      continue
    }

    const currentSource = readCurrentFile(currentPath, cwd)
    const previousSource = readFileAtCommit(previousPath, beforeSha, cwd)
    const currentIndexable = currentSource !== undefined && isIndexableMarkdown(currentPath, currentSource)
    const previousIndexable = previousSource !== undefined && isIndexableMarkdown(previousPath, previousSource)
    const isRename = previousPath !== currentPath

    if (isRename) {
      if (currentIndexable) {
        submissionPaths.add(currentPath)
      }

      if (previousIndexable) {
        submissionPaths.add(previousPath)
      }

      continue
    }

    if (currentIndexable || previousIndexable) {
      submissionPaths.add(currentPath)
    }
  }

  return [...submissionPaths]
}

function markdownPathToRoute(filePath) {
  const normalizedPath = normalizeFilePath(filePath)

  if (!normalizedPath.startsWith('docs/') || !normalizedPath.endsWith('.md')) {
    return undefined
  }

  const relativePath = normalizedPath.slice('docs/'.length)

  if (!relativePath || relativePath === 'index.md') {
    return ''
  }

  if (relativePath.endsWith('/index.md')) {
    return relativePath.slice(0, -'index.md'.length)
  }

  return relativePath.replace(/\.md$/, '')
}

function publicAssetToRoute(filePath) {
  const normalizedPath = normalizeFilePath(filePath)

  if (!normalizedPath.startsWith('docs/public/')) {
    return undefined
  }

  return normalizedPath.slice('docs/public/'.length)
}

export function pathToIndexNowUrl(filePath, siteUrl) {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl)
  const route = markdownPathToRoute(filePath) ?? publicAssetToRoute(filePath)

  if (route === undefined) {
    return undefined
  }

  return new URL(route, normalizedSiteUrl).toString()
}

export function filesToIndexNowUrls(filePaths, siteUrl) {
  return [...new Set(filePaths.map((filePath) => pathToIndexNowUrl(filePath, siteUrl)).filter(Boolean))]
}

async function submitIndexNowUrls({
  siteUrl,
  key,
  keyLocation,
  endpoint = DEFAULT_ENDPOINT,
  fileChanges,
  beforeSha,
  cwd = process.cwd()
}) {
  const eligibleFilePaths = getIndexNowSubmissionPaths(fileChanges, { beforeSha, cwd })
  const urls = filesToIndexNowUrls(eligibleFilePaths, siteUrl)

  if (!urls.length) {
    console.log('No eligible URLs found for IndexNow submission.')
    return
  }

  const payload = {
    host: new URL(normalizeSiteUrl(siteUrl)).hostname,
    key,
    keyLocation,
    urlList: urls
  }

  console.log(`Submitting ${urls.length} URL(s) to IndexNow...`)

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`IndexNow submission failed with ${response.status}: ${body}`)
  }

  console.log('IndexNow submission succeeded.')
}

function readFileChangesFromEnv() {
  const rawChanges = process.env.INDEXNOW_FILE_CHANGES ?? '[]'

  try {
    const changes = JSON.parse(rawChanges)

    if (!Array.isArray(changes)) {
      throw new Error('INDEXNOW_FILE_CHANGES must be a JSON array')
    }

    return changes
  } catch (error) {
    throw new Error(`Invalid INDEXNOW_FILE_CHANGES: ${error.message}`)
  }
}

if (import.meta.url === new URL(process.argv[1], 'file://').toString()) {
  const siteUrl = process.env.INDEXNOW_SITE_URL
  const key = process.env.INDEXNOW_KEY
  const keyLocation = process.env.INDEXNOW_KEY_LOCATION
  const fileChanges = readFileChangesFromEnv()
  const beforeSha = process.env.INDEXNOW_BEFORE_SHA

  if (!siteUrl || !key || !keyLocation) {
    console.error('Missing required IndexNow environment variables.')
    process.exit(1)
  }

  try {
    await submitIndexNowUrls({
      siteUrl,
      key,
      keyLocation,
      endpoint: process.env.INDEXNOW_ENDPOINT || DEFAULT_ENDPOINT,
      fileChanges,
      beforeSha
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

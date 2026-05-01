const DEFAULT_ENDPOINT = 'https://api.indexnow.org/indexnow'

function normalizeSiteUrl(siteUrl) {
  const normalized = /^https?:\/\//i.test(siteUrl) ? siteUrl : `https://${siteUrl}`
  return normalized.endsWith('/') ? normalized : `${normalized}/`
}

function normalizeFilePath(filePath) {
  return String(filePath || '').trim().replace(/\\/g, '/').replace(/^\.\/+/, '')
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
    return relativePath.slice(0, -'index.md'.length) + 'index.html'
  }

  return relativePath.replace(/\.md$/, '.html')
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

async function submitIndexNowUrls({ siteUrl, key, keyLocation, endpoint = DEFAULT_ENDPOINT, filePaths }) {
  const urls = filesToIndexNowUrls(filePaths, siteUrl)

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

function readFilePathsFromEnv() {
  const rawFiles = process.env.INDEXNOW_FILE_PATHS ?? ''

  return rawFiles
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

if (import.meta.url === new URL(process.argv[1], 'file://').toString()) {
  const siteUrl = process.env.INDEXNOW_SITE_URL
  const key = process.env.INDEXNOW_KEY
  const keyLocation = process.env.INDEXNOW_KEY_LOCATION
  const filePaths = readFilePathsFromEnv()

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
      filePaths
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

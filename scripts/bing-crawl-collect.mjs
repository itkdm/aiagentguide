import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const GRAPHQL_ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql'
const DEFAULT_SITE_URL = 'https://aiagentguide.cn/'
const DEFAULT_HOST = 'aiagentguide.cn'
const DEFAULT_SITEMAP_URL = `${DEFAULT_SITE_URL}sitemap.xml`
const CONTROL_PATHS = new Set(['/', '/robots.txt', '/sitemap.xml'])
const GROUP_LIMIT = 5000

export const BING_CRAWL_QUERY = `
query BingCrawl($zoneTag: string, $filter: filter) {
  viewer {
    zones(filter: { zoneTag: $zoneTag }) {
      httpRequestsAdaptiveGroups(
        limit: ${GROUP_LIMIT}
        filter: $filter
        orderBy: [count_DESC]
      ) {
        count
        avg {
          sampleInterval
        }
        sum {
          edgeResponseBytes
        }
        dimensions {
          clientRequestPath
          clientRequestHTTPHost
          edgeResponseStatus
          userAgent
          datetimeHour
        }
      }
    }
  }
}`

function parseArgs(argv) {
  const options = {}

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (!argument.startsWith('--')) {
      continue
    }

    const [rawKey, inlineValue] = argument.slice(2).split('=', 2)
    const key = rawKey.replace(/-([a-z])/g, (_, character) => character.toUpperCase())
    options[key] = inlineValue ?? argv[++index]
  }

  return options
}

function toUtcIso(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`)
  }

  return date.toISOString()
}

export function getPreviousCompleteSixHourWindow(now = new Date()) {
  const current = new Date(now)
  const currentHour = current.getUTCHours()
  const end = new Date(current)
  end.setUTCMinutes(0, 0, 0)
  end.setUTCHours(currentHour - (currentHour % 6))

  const start = new Date(end)
  start.setUTCHours(start.getUTCHours() - 6)

  return {
    start: start.toISOString(),
    end: end.toISOString()
  }
}

function resolveWindow(options) {
  if (options.start || options.end) {
    if (!options.start || !options.end) {
      throw new Error('Both --start and --end are required when overriding the time window.')
    }

    const start = toUtcIso(options.start)
    const end = toUtcIso(options.end)

    if (new Date(start) >= new Date(end)) {
      throw new Error('The crawl window start must be before its end.')
    }

    return { start, end }
  }

  return getPreviousCompleteSixHourWindow()
}

function parseSitemapPaths(xml, siteUrl) {
  const paths = new Set()
  const locMatches = xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)

  for (const [, rawUrl] of locMatches) {
    const url = new URL(rawUrl, siteUrl)
    paths.add(`${url.pathname}${url.search}`)
  }

  return paths
}

export function classifyRequestPath(requestPath, sitemapPaths) {
  if (CONTROL_PATHS.has(requestPath)) {
    return 'CONTROL'
  }

  if (sitemapPaths.has(requestPath)) {
    return 'INDEXABLE_CONTENT'
  }

  return 'OTHER'
}

async function fetchSitemap(sitemapUrl) {
  const response = await fetch(sitemapUrl)

  if (!response.ok) {
    throw new Error(`Sitemap request failed with ${response.status}: ${sitemapUrl}`)
  }

  const xml = await response.text()
  return {
    url: sitemapUrl,
    paths: parseSitemapPaths(xml, sitemapUrl),
    xml
  }
}

async function queryCloudflare({ token, zoneId, filter }) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      query: BING_CRAWL_QUERY,
      variables: { zoneTag: zoneId, filter }
    })
  })

  const payload = await response.json()

  if (!response.ok || payload.errors?.length) {
    const details = payload.errors?.map((error) => error.message).join('; ') || response.statusText
    throw new Error(`Cloudflare GraphQL request failed: ${details}`)
  }

  const groups = payload.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups

  if (!Array.isArray(groups)) {
    throw new Error('Cloudflare GraphQL response did not contain request groups.')
  }

  return { payload, groups }
}

function numberOrZero(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0
}

function normalizeGroup(group, sitemapPaths) {
  const dimensions = group.dimensions ?? {}
  const pathValue = dimensions.clientRequestPath || '/'
  const requestCount = numberOrZero(group.count)
  const responseBytes = numberOrZero(group.sum?.edgeResponseBytes)
  const status = numberOrZero(dimensions.edgeResponseStatus)

  return {
    time: dimensions.datetimeHour || null,
    path: pathValue,
    hostname: dimensions.clientRequestHTTPHost || null,
    status,
    user_agent: dimensions.userAgent || null,
    request_count: requestCount,
    response_bytes: responseBytes,
    sample_interval: numberOrZero(group.avg?.sampleInterval),
    category: classifyRequestPath(pathValue, sitemapPaths)
  }
}

function sumBy(rows, selector) {
  return rows.reduce((total, row) => total + selector(row), 0)
}

function countByStatus(rows, predicate) {
  return sumBy(rows.filter(predicate), (row) => row.request_count)
}

function topPaths(rows, category, limit = 20) {
  const grouped = new Map()

  for (const row of rows.filter((item) => !category || item.category === category)) {
    const existing = grouped.get(row.path) ?? {
      path: row.path,
      request_count: 0,
      response_bytes: 0,
      statuses: {}
    }

    existing.request_count += row.request_count
    existing.response_bytes += row.response_bytes
    existing.statuses[row.status] = (existing.statuses[row.status] || 0) + row.request_count
    grouped.set(row.path, existing)
  }

  return [...grouped.values()]
    .sort((left, right) => right.request_count - left.request_count || left.path.localeCompare(right.path))
    .slice(0, limit)
}

export function buildSummary({ rows, sitemapUrl, sitemapPaths, window }) {
  const totalRequests = sumBy(rows, (row) => row.request_count)
  const indexableRows = rows.filter((row) => row.category === 'INDEXABLE_CONTENT')
  const uniqueIndexablePages = new Set(indexableRows.map((row) => row.path))

  return {
    window,
    sitemap_url: sitemapUrl,
    sitemap_url_count: sitemapPaths.size,
    total_requests: totalRequests,
    success_2xx: countByStatus(rows, (row) => row.status >= 200 && row.status < 300),
    redirects_3xx: countByStatus(rows, (row) => row.status >= 300 && row.status < 400),
    client_errors_4xx: countByStatus(rows, (row) => row.status >= 400 && row.status < 500),
    server_errors_5xx: countByStatus(rows, (row) => row.status >= 500 && row.status < 600),
    unique_paths: new Set(rows.map((row) => row.path)).size,
    control_requests: sumBy(rows.filter((row) => row.category === 'CONTROL'), (row) => row.request_count),
    indexable_content_requests: sumBy(indexableRows, (row) => row.request_count),
    unique_indexable_pages_crawled: uniqueIndexablePages.size,
    other_requests: sumBy(rows.filter((row) => row.category === 'OTHER'), (row) => row.request_count),
    not_found_requests: countByStatus(rows, (row) => row.status === 404),
    sitemap_coverage: sitemapPaths.size ? uniqueIndexablePages.size / sitemapPaths.size : 0,
    sitemap_coverage_percent: sitemapPaths.size ? (uniqueIndexablePages.size / sitemapPaths.size) * 100 : 0,
    top_20_paths: topPaths(rows),
    top_20_indexable_paths: topPaths(rows, 'INDEXABLE_CONTENT'),
    top_20_other_paths: topPaths(rows, 'OTHER')
  }
}

function csvEscape(value) {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function rowsToCsv(rows) {
  const columns = [
    'time',
    'path',
    'hostname',
    'status',
    'user_agent',
    'request_count',
    'response_bytes',
    'sample_interval',
    'category'
  ]

  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(','))
  ].join('\n') + '\n'
}

function slotName(window) {
  const start = new Date(window.start)
  const end = new Date(window.end)
  const endHour = end.getUTCHours() === 0 ? 24 : end.getUTCHours()

  return `${String(start.getUTCHours()).padStart(2, '0')}-${String(endHour).padStart(2, '0')}`
}

async function writeOutput({ outputDir, window, raw, rows, summary }) {
  const start = new Date(window.start)
  const dateDirectory = start.toISOString().slice(0, 10)
  const slotDirectory = path.join(outputDir, dateDirectory, slotName(window))
  await fs.mkdir(slotDirectory, { recursive: true })
  await fs.writeFile(path.join(slotDirectory, 'raw.json'), JSON.stringify(raw, null, 2) + '\n')
  await fs.writeFile(path.join(slotDirectory, 'requests.csv'), rowsToCsv(rows))
  await fs.writeFile(path.join(slotDirectory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n')

  return slotDirectory
}

export async function collectBingCrawl({
  token,
  zoneId,
  host = DEFAULT_HOST,
  sitemapUrl = DEFAULT_SITEMAP_URL,
  window,
  outputDir
}) {
  if (!token || !zoneId) {
    throw new Error('CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID are required.')
  }

  const sitemap = await fetchSitemap(sitemapUrl)
  const filter = {
    datetime_geq: window.start,
    datetime_lt: window.end,
    requestSource: 'eyeball',
    clientRequestHTTPHost: host,
    userAgent_like: '%bingbot%'
  }
  const { payload, groups } = await queryCloudflare({ token, zoneId, filter })
  const rows = groups.map((group) => normalizeGroup(group, sitemap.paths))
  const summary = buildSummary({
    rows,
    sitemapUrl,
    sitemapPaths: sitemap.paths,
    window
  })
  const slotDirectory = await writeOutput({
    outputDir,
    window,
    raw: {
      collected_at: new Date().toISOString(),
      dataset: 'httpRequestsAdaptiveGroups',
      identification: 'UA-identified BingBot',
      filter,
      sitemap_path_count: sitemap.paths.size,
      graphql_query: BING_CRAWL_QUERY,
      graphql_response: payload
    },
    rows,
    summary
  })

  return { slotDirectory, summary, rows }
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const options = parseArgs(process.argv.slice(2))
    const window = resolveWindow(options)
    const outputDir = path.resolve(options.output || 'bing-crawl-output')
    const result = await collectBingCrawl({
      token: process.env.CLOUDFLARE_API_TOKEN,
      zoneId: process.env.CLOUDFLARE_ZONE_ID,
      host: process.env.BING_CRAWL_HOST || DEFAULT_HOST,
      sitemapUrl: process.env.BING_CRAWL_SITEMAP_URL || DEFAULT_SITEMAP_URL,
      window,
      outputDir
    })

    console.log(JSON.stringify({ slot_directory: result.slotDirectory, summary: result.summary }, null, 2))
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

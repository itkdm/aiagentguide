import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

function parseArgs(argv) {
  const options = { days: 7, dataDir: 'data' }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (!argument.startsWith('--')) {
      continue
    }

    const [rawKey, inlineValue] = argument.slice(2).split('=', 2)
    const key = rawKey.replace(/-([a-z])/g, (_, character) => character.toUpperCase())
    options[key] = inlineValue ?? argv[++index]
  }

  options.days = Number(options.days)
  return options
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => [])
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...await walk(entryPath))
    } else if (entry.name === 'summary.json') {
      files.push(entryPath)
    }
  }

  return files
}

function parseCsvLine(line) {
  const values = []
  let value = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      values.push(value)
      value = ''
    } else {
      value += character
    }
  }

  values.push(value)
  return values
}

async function readRequests(summaryPath) {
  const csvPath = path.join(path.dirname(summaryPath), 'requests.csv')
  const content = await fs.readFile(csvPath, 'utf8')
  const [header, ...lines] = content.trim().split(/\r?\n/)
  const columns = parseCsvLine(header)

  return lines.filter(Boolean).map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(columns.map((column, index) => [column, values[index]]))
  })
}

function addTopPath(map, row) {
  const existing = map.get(row.path) ?? { path: row.path, request_count: 0, statuses: {} }
  const count = Number(row.request_count || 0)
  existing.request_count += count
  existing.statuses[row.status] = (existing.statuses[row.status] || 0) + count
  map.set(row.path, existing)
}

function sortTopPaths(map) {
  return [...map.values()]
    .sort((left, right) => right.request_count - left.request_count || left.path.localeCompare(right.path))
    .slice(0, 20)
}

function percent(value, total) {
  return total ? Number(((value / total) * 100).toFixed(2)) : 0
}

export async function buildReport({ dataDir = 'data', days = 7, now = new Date() } = {}) {
  const cutoff = new Date(now)
  cutoff.setUTCDate(cutoff.getUTCDate() - days)
  const summaryPaths = await walk(dataDir)
  const selected = []

  for (const summaryPath of summaryPaths) {
    const summary = JSON.parse(await fs.readFile(summaryPath, 'utf8'))

    if (new Date(summary.window?.end) >= cutoff) {
      selected.push({ summaryPath, summary, rows: await readRequests(summaryPath) })
    }
  }

  selected.sort((left, right) => left.summary.window.start.localeCompare(right.summary.window.start))

  const rows = selected.flatMap((item) => item.rows)
  const totalRequests = rows.reduce((total, row) => total + Number(row.request_count || 0), 0)
  const indexableRows = rows.filter((row) => row.category === 'INDEXABLE_CONTENT')
  const controlRows = rows.filter((row) => row.category === 'CONTROL')
  const otherRows = rows.filter((row) => row.category === 'OTHER')
  const indexablePaths = new Set(indexableRows.map((row) => row.path))
  const sitemapUrlCount = Math.max(...selected.map((item) => item.summary.sitemap_url_count || 0), 0)
  const topIndexable = new Map()
  const topOther = new Map()

  indexableRows.forEach((row) => addTopPath(topIndexable, row))
  otherRows.forEach((row) => addTopPath(topOther, row))

  const byDay = new Map()

  for (const item of selected) {
    const day = item.summary.window.start.slice(0, 10)
    const daily = byDay.get(day) ?? { date: day, bing_requests: 0, indexable_content_requests: 0, unique_indexable_pages: new Set() }
    daily.bing_requests += item.summary.total_requests
    daily.indexable_content_requests += item.summary.indexable_content_requests
    item.rows.filter((row) => row.category === 'INDEXABLE_CONTENT').forEach((row) => daily.unique_indexable_pages.add(row.path))
    byDay.set(day, daily)
  }

  return {
    days,
    windows: selected.length,
    window_start: selected[0]?.summary.window.start || null,
    window_end: selected.at(-1)?.summary.window.end || null,
    crawl_overview: {
      bingbot_total_requests: totalRequests,
      success_2xx: rows.filter((row) => Number(row.status) >= 200 && Number(row.status) < 300).reduce((total, row) => total + Number(row.request_count || 0), 0),
      redirects_3xx: rows.filter((row) => Number(row.status) >= 300 && Number(row.status) < 400).reduce((total, row) => total + Number(row.request_count || 0), 0),
      client_errors_4xx: rows.filter((row) => Number(row.status) >= 400 && Number(row.status) < 500).reduce((total, row) => total + Number(row.request_count || 0), 0),
      server_errors_5xx: rows.filter((row) => Number(row.status) >= 500).reduce((total, row) => total + Number(row.request_count || 0), 0)
    },
    content_crawl: {
      sitemap_url_count: sitemapUrlCount,
      unique_indexable_pages_crawled: indexablePaths.size,
      sitemap_coverage: sitemapUrlCount ? indexablePaths.size / sitemapUrlCount : 0,
      sitemap_coverage_percent: percent(indexablePaths.size, sitemapUrlCount)
    },
    request_distribution: {
      control_requests: controlRows.reduce((total, row) => total + Number(row.request_count || 0), 0),
      indexable_content_requests: indexableRows.reduce((total, row) => total + Number(row.request_count || 0), 0),
      other_requests: otherRows.reduce((total, row) => total + Number(row.request_count || 0), 0)
    },
    top_indexable_pages: sortTopPaths(topIndexable),
    top_abnormal_paths: sortTopPaths(topOther),
    daily_trend: [...byDay.values()].map((day) => ({
      ...day,
      unique_indexable_pages: day.unique_indexable_pages.size
    }))
  }
}

function renderMarkdown(report) {
  const overview = report.crawl_overview
  const content = report.content_crawl
  const distribution = report.request_distribution

  return [
    `# Bing crawl report (${report.days} days)`,
    '',
    `Window: ${report.window_start || 'n/a'} → ${report.window_end || 'n/a'}`,
    '',
    '## Crawl Overview',
    '',
    `- BingBot total requests: ${overview.bingbot_total_requests}`,
    `- 2xx: ${overview.success_2xx}`,
    `- 3xx: ${overview.redirects_3xx}`,
    `- 4xx: ${overview.client_errors_4xx}`,
    `- 5xx: ${overview.server_errors_5xx}`,
    '',
    '## Content Crawl',
    '',
    `- Sitemap URLs: ${content.sitemap_url_count}`,
    `- Unique sitemap pages crawled: ${content.unique_indexable_pages_crawled}`,
    `- Coverage: ${content.sitemap_coverage_percent}%`,
    '',
    '## Request Distribution',
    '',
    `- CONTROL: ${distribution.control_requests}`,
    `- INDEXABLE_CONTENT: ${distribution.indexable_content_requests}`,
    `- OTHER: ${distribution.other_requests}`,
    '',
    '## Top indexable pages',
    '',
    ...report.top_indexable_pages.map((item) => `- ${item.path}: ${item.request_count}`),
    '',
    '## Top abnormal paths',
    '',
    ...report.top_abnormal_paths.map((item) => `- ${item.path}: ${item.request_count}`),
    '',
    '## Daily trend',
    '',
    '| Date | Requests | Content requests | Unique content pages |',
    '| --- | ---: | ---: | ---: |',
    ...report.daily_trend.map((day) => `| ${day.date} | ${day.bing_requests} | ${day.indexable_content_requests} | ${day.unique_indexable_pages} |`),
    ''
  ].join('\n')
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const options = parseArgs(process.argv.slice(2))
    const report = await buildReport({ days: options.days, dataDir: options.dataDir })
    const output = options.output || `bing-crawl-report-${options.days}d`
    await fs.mkdir(output, { recursive: true })
    await fs.writeFile(path.join(output, 'summary.json'), JSON.stringify(report, null, 2) + '\n')
    await fs.writeFile(path.join(output, 'summary.md'), renderMarkdown(report))
    console.log(renderMarkdown(report))
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

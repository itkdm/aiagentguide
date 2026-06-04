import { access, readFile } from 'node:fs/promises'
import { execFile as execFileCallback } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const DEFAULT_TARGET_FILES = ['docs/tools/aggregators.md']
const REQUEST_TIMEOUT_MS = 30000
const CONCURRENCY = 5
const RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 1000
const ACCEPTABLE_STATUSES = new Set([200, 201, 202, 204, 301, 302, 303, 307, 308, 401, 403, 405])
const execFile = promisify(execFileCallback)
const CURL_OUTPUT_SINK = process.platform === 'win32' ? 'NUL' : '/dev/null'

export function extractToolUrls(markdown) {
  const matches = markdown.matchAll(/<a[^>]+href="(https:\/\/[^"]+)"[^>]*>/g)
  return [...new Set(Array.from(matches, ([, url]) => url))]
}

function resolveTargetFiles() {
  const configured = process.env.TOOL_LINK_FILES
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  return (configured?.length ? configured : DEFAULT_TARGET_FILES).map((filePath) => path.resolve(filePath))
}

export async function collectToolUrls() {
  const markdownFiles = resolveTargetFiles()

  const urls = new Map()

  for (const filePath of markdownFiles) {
    await access(filePath)
    const markdown = await readFile(filePath, 'utf8')
    for (const url of extractToolUrls(markdown)) {
      if (!urls.has(url)) {
        urls.set(url, [])
      }

      urls.get(url).push(path.relative(process.cwd(), filePath))
    }
  }

  return urls
}

function isReachableStatus(status) {
  return ACCEPTABLE_STATUSES.has(status)
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': 'AIAgentGuideLinkChecker/1.0 (+https://aiagentguide.cn/)'
      },
      ...options
    })
  } finally {
    clearTimeout(timer)
  }
}

export async function checkUrl(url) {
  try {
    let response = await fetchWithTimeout(url, { method: 'HEAD' })

    if (!isReachableStatus(response.status)) {
      response = await fetchWithTimeout(url, { method: 'GET' })
    }

    return {
      ok: isReachableStatus(response.status),
      status: response.status,
      finalUrl: response.url
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function retryUrlCheck(check, attempts = RETRY_ATTEMPTS, delayMs = RETRY_DELAY_MS) {
  let lastResult

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    lastResult = await check()

    if (lastResult.ok || attempt === attempts) {
      return lastResult
    }

    await sleep(delayMs)
  }

  return lastResult
}

async function checkUrlWithCurl(url) {
  try {
    const { stdout } = await execFile(
      'curl',
      [
        '-L',
        '-sS',
        '-A',
        'AIAgentGuideLinkChecker/1.0 (+https://aiagentguide.cn/)',
        '-o',
        CURL_OUTPUT_SINK,
        '-w',
        '%{http_code} %{url_effective}',
        url
      ],
      {
        timeout: REQUEST_TIMEOUT_MS
      }
    )

    const [statusText, ...finalUrlParts] = stdout.trim().split(' ')
    const status = Number(statusText)
    const finalUrl = finalUrlParts.join(' ')

    return {
      ok: isReachableStatus(status),
      status,
      finalUrl
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

async function runPool(items, worker, concurrency = CONCURRENCY) {
  const queue = [...items]
  const results = []

  const runners = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()
      results.push(await worker(item))
    }
  })

  await Promise.all(runners)
  return results
}

async function main() {
  const urls = await collectToolUrls()
  const urlList = [...urls.keys()]

  if (urlList.length === 0) {
    console.log('No external tool URLs found.')
    return
  }

  console.log(`Checking ${urlList.length} external tool URL(s)...`)

  const results = await runPool(urlList, async (url) => {
    const result = await retryUrlCheck(async () => {
      let checkResult = await checkUrl(url)

      if (!checkResult.ok) {
        checkResult = await checkUrlWithCurl(url)
      }

      return checkResult
    })

    return { url, ...result, files: urls.get(url) ?? [] }
  })

  const failures = results.filter((result) => !result.ok)

  for (const result of results) {
    if (result.ok) {
      console.log(`OK   ${result.status} ${result.url}`)
    } else {
      console.error(`FAIL ${result.url} ${result.error ? `(${result.error})` : `(status ${result.status})`}`)
      console.error(`     Referenced by: ${result.files.join(', ')}`)
    }
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} external tool URL(s) failed the accessibility check.`)
    process.exit(1)
  }

  console.log('\nAll external tool URLs passed the accessibility check.')
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  await main()
}

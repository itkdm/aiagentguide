import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve('docs')
const IGNORED_DIRS = new Set(['.vitepress', 'public'])
const REQUIRED_FIELDS = ['title', 'description', 'summary']
const STATUS_FIELD = 'status'
const ASSETS_FIELD = 'assets'
const KEYWORDS_FIELD = 'keywords'
const OVERVIEW_MINIMUM_SEO_FIELDS = ['description', 'keywords', 'status', 'lastUpdated']
const MAX_REPORT_ITEMS = 30
const DESCRIPTION_WIDTH_MIN = 70
const DESCRIPTION_WIDTH_MAX = 160

function countDisplayWidth(value) {
  const text = typeof value === 'string' ? value : ''
  let width = 0
  for (const char of text) {
    width += char.charCodeAt(0) <= 0x7f ? 1 : 2
  }
  return width
}

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

export function parseFrontmatter(source) {
  const normalizedSource = source.replace(/^\uFEFF/, '')
  const match = normalizedSource.match(/^---\r?\n([\s\S]*?)\r?\n---/)
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
  const parts = relativePath.replaceAll('\\', '/').split('/')
  return parts.length === 1 ? 'root' : parts[0]
}

export function classifyDocumentPath(relativePath) {
  const normalizedPath = relativePath.replaceAll('\\', '/')
  const baseName = path.posix.basename(normalizedPath)
  return baseName === 'index.md' || baseName === 'overview.md' ? 'overview' : 'detail'
}

function incrementMap(map, key) {
  map.set(key, (map.get(key) || 0) + 1)
}

function incrementObjectCounter(counters, key) {
  counters[key] += 1
}

function isPresent(value) {
  return !(
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

function hasSummaryOrDescription(frontmatter) {
  return isPresent(frontmatter.summary) || isPresent(frontmatter.description)
}

function hasKeywords(frontmatter) {
  return isPresent(frontmatter[KEYWORDS_FIELD])
}

function hasIndexabilityDecision(frontmatter) {
  return (
    isPresent(frontmatter.status) ||
    frontmatter.draft !== undefined ||
    frontmatter.noindex !== undefined
  )
}

function isIndexable(frontmatter, pageType) {
  if (frontmatter.draft === true || frontmatter.noindex === true) {
    return false
  }

  if (isPresent(frontmatter.status)) {
    return frontmatter.status === 'published'
  }

  return pageType === 'overview'
}

function createCoverageCounters() {
  return {
    title: 0,
    description: 0,
    keywords: 0,
    summary: 0,
    descriptionOrSummary: 0,
    status: 0,
    draft: 0,
    noindex: 0,
    indexabilityDecision: 0,
    minimumThreshold: 0
  }
}

function createAuditState() {
  return {
    totalFiles: 0,
    sectionCounts: new Map(),
    pageTypeCounts: {
      overview: 0,
      detail: 0
    },
    statusCounts: new Map(),
    assetsCounts: new Map(),
    statusCountsByPageType: {
      overview: new Map(),
      detail: new Map()
    },
    assetsCountsByPageType: {
      overview: new Map(),
      detail: new Map()
    },
    coverage: {
      overview: createCoverageCounters(),
      detail: createCoverageCounters()
    },
    draftNoindexCoverage: {
      bothPresent: 0,
      draftPresentOnly: 0,
      noindexPresentOnly: 0,
      missingBoth: 0,
      blockedFromIndexing: 0,
      explicitIndexable: 0
    },
    keywordCoverage: {
      totalWithKeywords: 0,
      indexablePages: 0,
      indexableWithKeywords: 0,
      indexableOverviewPages: 0,
      indexableOverviewWithKeywords: 0,
      publishedDetailPages: 0,
      publishedDetailWithKeywords: 0
    },
    missingRequired: [],
    missingStateFields: [],
    detailMissingIndexabilityDecision: [],
    detailBelowMinimumThreshold: [],
    indexableMissingKeywords: [],
    indexableOverviewBelowSeoThreshold: [],
    publishedDetailMissingKeywords: [],
    publishedInvalidDescriptionWidth: []
  }
}

function updateCoverageCounters(counters, frontmatter, hasDecision) {
  if (isPresent(frontmatter.title)) {
    incrementObjectCounter(counters, 'title')
  }

  if (isPresent(frontmatter.description)) {
    incrementObjectCounter(counters, 'description')
  }

  if (hasKeywords(frontmatter)) {
    incrementObjectCounter(counters, 'keywords')
  }

  if (isPresent(frontmatter.summary)) {
    incrementObjectCounter(counters, 'summary')
  }

  if (hasSummaryOrDescription(frontmatter)) {
    incrementObjectCounter(counters, 'descriptionOrSummary')
  }

  if (isPresent(frontmatter.status)) {
    incrementObjectCounter(counters, 'status')
  }

  if (frontmatter.draft !== undefined) {
    incrementObjectCounter(counters, 'draft')
  }

  if (frontmatter.noindex !== undefined) {
    incrementObjectCounter(counters, 'noindex')
  }

  if (hasDecision) {
    incrementObjectCounter(counters, 'indexabilityDecision')
  }

  if (isPresent(frontmatter.title) && hasSummaryOrDescription(frontmatter) && hasDecision) {
    incrementObjectCounter(counters, 'minimumThreshold')
  }
}

function updateDraftNoindexCoverage(audit, frontmatter) {
  const hasDraft = frontmatter.draft !== undefined
  const hasNoindex = frontmatter.noindex !== undefined

  if (hasDraft && hasNoindex) {
    incrementObjectCounter(audit.draftNoindexCoverage, 'bothPresent')
  } else if (hasDraft) {
    incrementObjectCounter(audit.draftNoindexCoverage, 'draftPresentOnly')
  } else if (hasNoindex) {
    incrementObjectCounter(audit.draftNoindexCoverage, 'noindexPresentOnly')
  } else {
    incrementObjectCounter(audit.draftNoindexCoverage, 'missingBoth')
  }

  if (frontmatter.draft === true || frontmatter.noindex === true) {
    incrementObjectCounter(audit.draftNoindexCoverage, 'blockedFromIndexing')
  }

  if (frontmatter.draft === false && frontmatter.noindex === false) {
    incrementObjectCounter(audit.draftNoindexCoverage, 'explicitIndexable')
  }
}

function updateKeywordCoverage(audit, frontmatter, pageType, indexable) {
  const pageHasKeywords = hasKeywords(frontmatter)

  if (pageHasKeywords) {
    incrementObjectCounter(audit.keywordCoverage, 'totalWithKeywords')
  }

  if (indexable) {
    incrementObjectCounter(audit.keywordCoverage, 'indexablePages')

    if (pageHasKeywords) {
      incrementObjectCounter(audit.keywordCoverage, 'indexableWithKeywords')
    }
  }

  if (pageType === 'overview' && indexable) {
    incrementObjectCounter(audit.keywordCoverage, 'indexableOverviewPages')

    if (pageHasKeywords) {
      incrementObjectCounter(audit.keywordCoverage, 'indexableOverviewWithKeywords')
    }
  }

  if (pageType === 'detail' && frontmatter.status === 'published') {
    incrementObjectCounter(audit.keywordCoverage, 'publishedDetailPages')

    if (pageHasKeywords) {
      incrementObjectCounter(audit.keywordCoverage, 'publishedDetailWithKeywords')
    }
  }
}

export function auditMarkdownEntries(entries) {
  const audit = createAuditState()

  for (const entry of entries) {
    const relativePath = entry.relativePath.replaceAll('\\', '/')
    const frontmatter = entry.frontmatter || parseFrontmatter(entry.source || '')
    const section = normalizeSection(relativePath)
    const pageType = classifyDocumentPath(relativePath)
    const hasDecision = hasIndexabilityDecision(frontmatter)
    const indexable = isIndexable(frontmatter, pageType)

    audit.totalFiles += 1
    incrementMap(audit.sectionCounts, section)
    incrementMap(audit.statusCounts, frontmatter[STATUS_FIELD] || 'unspecified')
    incrementMap(audit.assetsCounts, frontmatter[ASSETS_FIELD] || 'unspecified')
    incrementMap(
      audit.statusCountsByPageType[pageType],
      frontmatter[STATUS_FIELD] || 'unspecified'
    )
    incrementMap(
      audit.assetsCountsByPageType[pageType],
      frontmatter[ASSETS_FIELD] || 'unspecified'
    )
    incrementObjectCounter(audit.pageTypeCounts, pageType)

    updateCoverageCounters(audit.coverage[pageType], frontmatter, hasDecision)
    updateDraftNoindexCoverage(audit, frontmatter)
    updateKeywordCoverage(audit, frontmatter, pageType, indexable)

    const missingFields = REQUIRED_FIELDS.filter((field) => !isPresent(frontmatter[field]))
    if (missingFields.length) {
      audit.missingRequired.push({ relativePath, missingFields })
    }

    const missingState = [STATUS_FIELD, ASSETS_FIELD].filter(
      (field) => frontmatter[field] === undefined
    )
    if (missingState.length) {
      audit.missingStateFields.push({ relativePath, missingState })
    }

    if (pageType === 'detail' && !hasDecision) {
      audit.detailMissingIndexabilityDecision.push(relativePath)
    }

    if (indexable && !hasKeywords(frontmatter)) {
      audit.indexableMissingKeywords.push(relativePath)
    }

    if (frontmatter.status === 'published' && isPresent(frontmatter.description)) {
      const descriptionWidth = countDisplayWidth(frontmatter.description)
      if (descriptionWidth < DESCRIPTION_WIDTH_MIN || descriptionWidth > DESCRIPTION_WIDTH_MAX) {
        audit.publishedInvalidDescriptionWidth.push({ relativePath, width: descriptionWidth })
      }
    }

    if (pageType === 'overview' && indexable) {
      const missingOverviewSeoFields = OVERVIEW_MINIMUM_SEO_FIELDS.filter(
        (field) => !isPresent(frontmatter[field])
      )

      if (missingOverviewSeoFields.length) {
        audit.indexableOverviewBelowSeoThreshold.push({
          relativePath,
          missing: missingOverviewSeoFields
        })
      }
    }

    if (pageType === 'detail') {
      const missingMinimum = []

      if (!isPresent(frontmatter.title)) {
        missingMinimum.push('title')
      }

      if (!hasSummaryOrDescription(frontmatter)) {
        missingMinimum.push('descriptionOrSummary')
      }

      if (!hasDecision) {
        missingMinimum.push('indexabilityDecision')
      }

      if (missingMinimum.length) {
        audit.detailBelowMinimumThreshold.push({
          relativePath,
          missing: missingMinimum
        })
      }

      if (frontmatter.status === 'published' && !hasKeywords(frontmatter)) {
        audit.publishedDetailMissingKeywords.push(relativePath)
      }
    }
  }

  return audit
}

function sortEntries(map) {
  return [...map.entries()].sort((left, right) => left[0].localeCompare(right[0]))
}

function formatCountMap(title, map) {
  const lines = [`\n${title}`]

  for (const [key, value] of sortEntries(map)) {
    lines.push(`- ${key}: ${value}`)
  }

  return lines.join('\n')
}

function formatCoverageSection(title, counters, total) {
  const orderedKeys = [
    'title',
    'description',
    'keywords',
    'summary',
    'descriptionOrSummary',
    'status',
    'draft',
    'noindex',
    'indexabilityDecision',
    'minimumThreshold'
  ]

  const lines = [`\n${title} (${total})`]
  for (const key of orderedKeys) {
    lines.push(`- ${key}: ${counters[key]}`)
  }

  return lines.join('\n')
}

function formatStringList(title, items) {
  const lines = [`\n${title}`]

  if (!items.length) {
    lines.push('- none')
    return lines.join('\n')
  }

  for (const item of items.slice(0, MAX_REPORT_ITEMS)) {
    lines.push(`- ${item}`)
  }

  if (items.length > MAX_REPORT_ITEMS) {
    lines.push(`- ... and ${items.length - MAX_REPORT_ITEMS} more`)
  }

  return lines.join('\n')
}

function formatObjectList(title, items, renderItem) {
  const lines = [`\n${title}`]

  if (!items.length) {
    lines.push('- none')
    return lines.join('\n')
  }

  for (const item of items.slice(0, MAX_REPORT_ITEMS)) {
    lines.push(`- ${renderItem(item)}`)
  }

  if (items.length > MAX_REPORT_ITEMS) {
    lines.push(`- ... and ${items.length - MAX_REPORT_ITEMS} more`)
  }

  return lines.join('\n')
}

export function formatAuditReport(audit) {
  const lines = [`Scanned ${audit.totalFiles} markdown files under docs/`]

  lines.push('\nPage Type Counts')
  lines.push(`- overview: ${audit.pageTypeCounts.overview}`)
  lines.push(`- detail: ${audit.pageTypeCounts.detail}`)

  lines.push(formatCountMap('Section Counts', audit.sectionCounts))
  lines.push(formatCountMap('Status Counts', audit.statusCounts))
  lines.push(formatCountMap('Assets Counts', audit.assetsCounts))
  lines.push(formatCountMap('Overview Status Counts', audit.statusCountsByPageType.overview))
  lines.push(formatCountMap('Detail Status Counts', audit.statusCountsByPageType.detail))
  lines.push(formatCountMap('Overview Assets Counts', audit.assetsCountsByPageType.overview))
  lines.push(formatCountMap('Detail Assets Counts', audit.assetsCountsByPageType.detail))

  lines.push(
    formatCoverageSection(
      'Overview Frontmatter Coverage',
      audit.coverage.overview,
      audit.pageTypeCounts.overview
    )
  )
  lines.push(
    formatCoverageSection(
      'Detail Frontmatter Coverage',
      audit.coverage.detail,
      audit.pageTypeCounts.detail
    )
  )

  lines.push('\nDraft/Noindex Coverage')
  lines.push(`- bothPresent: ${audit.draftNoindexCoverage.bothPresent}`)
  lines.push(`- draftPresentOnly: ${audit.draftNoindexCoverage.draftPresentOnly}`)
  lines.push(`- noindexPresentOnly: ${audit.draftNoindexCoverage.noindexPresentOnly}`)
  lines.push(`- missingBoth: ${audit.draftNoindexCoverage.missingBoth}`)
  lines.push(`- blockedFromIndexing: ${audit.draftNoindexCoverage.blockedFromIndexing}`)
  lines.push(`- explicitIndexable: ${audit.draftNoindexCoverage.explicitIndexable}`)

  lines.push('\nKeyword Coverage')
  lines.push(`- totalWithKeywords: ${audit.keywordCoverage.totalWithKeywords}`)
  lines.push(`- indexablePages: ${audit.keywordCoverage.indexablePages}`)
  lines.push(`- indexableWithKeywords: ${audit.keywordCoverage.indexableWithKeywords}`)
  lines.push(`- indexableOverviewPages: ${audit.keywordCoverage.indexableOverviewPages}`)
  lines.push(`- indexableOverviewWithKeywords: ${audit.keywordCoverage.indexableOverviewWithKeywords}`)
  lines.push(`- publishedDetailPages: ${audit.keywordCoverage.publishedDetailPages}`)
  lines.push(`- publishedDetailWithKeywords: ${audit.keywordCoverage.publishedDetailWithKeywords}`)

  lines.push(
    formatStringList(
      'Detail Pages Missing Indexability Decision',
      audit.detailMissingIndexabilityDecision
    )
  )
  lines.push(
    formatObjectList('Detail Minimum Frontmatter Threshold', audit.detailBelowMinimumThreshold, (
      item
    ) => `${item.relativePath}: ${item.missing.join(', ')}`)
  )
  lines.push(formatStringList('Indexable Pages Missing Keywords', audit.indexableMissingKeywords))
  lines.push(
    formatObjectList(
      'Indexable Overview Pages Below SEO Threshold',
      audit.indexableOverviewBelowSeoThreshold,
      (item) => `${item.relativePath}: ${item.missing.join(', ')}`
    )
  )
  lines.push(
    formatStringList('Published Detail Pages Missing Keywords', audit.publishedDetailMissingKeywords)
  )
  lines.push(
    formatObjectList(
      'Published Pages With Invalid Description Width',
      audit.publishedInvalidDescriptionWidth,
      (item) =>
        `${item.relativePath}: width ${item.width} (require ${DESCRIPTION_WIDTH_MIN}-${DESCRIPTION_WIDTH_MAX})`
    )
  )
  lines.push(
    formatObjectList('Missing Required Metadata', audit.missingRequired, (item) => {
      return `${item.relativePath}: ${item.missingFields.join(', ')}`
    })
  )
  lines.push(
    formatObjectList('Missing State Fields', audit.missingStateFields, (item) => {
      return `${item.relativePath}: ${item.missingState.join(', ')}`
    })
  )

  return lines.join('\n')
}

function readDocsEntries(rootDir = ROOT) {
  return walkMarkdownFiles(rootDir).map((absolutePath) => {
    const relativePath = path.relative(rootDir, absolutePath)
    const source = fs.readFileSync(absolutePath, 'utf8')
    return { relativePath, source }
  })
}

function main() {
  const report = formatAuditReport(auditMarkdownEntries(readDocsEntries()))
  console.log(report)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}

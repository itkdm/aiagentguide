import fs from 'node:fs'
import path from 'node:path'

import type { HeadConfig, PageData } from 'vitepress'

const DESCRIPTION_MAX_LENGTH = 140
const DEFAULT_SOCIAL_IMAGE = 'social-card.svg'
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const SECTION_TITLES: Record<string, string> = {
  'getting-started': '\u5165\u95e8',
  principles: '\u539f\u7406',
  frameworks: '\u6846\u67b6',
  tutorials: '\u5b9e\u6218\u6559\u7a0b',
  projects: '\u9879\u76ee',
  tools: '\u5de5\u5177',
  resources: '\u8d44\u6e90'
}

type FrontmatterLike = Record<string, unknown>

function normalizeSiteUrl(rawSiteUrl?: string) {
  if (!rawSiteUrl) {
    return undefined
  }

  const trimmedSiteUrl = rawSiteUrl.trim()

  if (!trimmedSiteUrl) {
    return undefined
  }

  const withProtocol = /^https?:\/\//i.test(trimmedSiteUrl)
    ? trimmedSiteUrl
    : `https://${trimmedSiteUrl}`

  return withProtocol.endsWith('/') ? withProtocol : `${withProtocol}/`
}

function applyBaseToSiteUrl(siteUrl: string, base: string) {
  if (base === '/') {
    return siteUrl
  }

  const normalizedUrl = new URL(siteUrl)

  if (normalizedUrl.pathname === '/') {
    normalizedUrl.pathname = base
  }

  return normalizedUrl.toString()
}

function stripFrontmatter(source: string) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
}

function sanitizeMarkdown(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*\|/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\r/g, '')
}

function cleanText(source: string) {
  return source
    .replace(/\s+/g, ' ')
    .replace(/^[\s:;,.-]+/, '')
    .trim()
}

function getFrontmatterRecord(pageData: Pick<PageData, 'frontmatter'>) {
  return (pageData.frontmatter ?? {}) as FrontmatterLike
}

function normalizeTextValue(value: unknown) {
  return cleanText(String(value ?? ''))
}

function normalizeStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeTextValue(item))
      .filter(Boolean)
  }

  const normalized = normalizeTextValue(value)

  if (!normalized) {
    return []
  }

  return normalized
    .split(/[,\n]/)
    .map((item) => cleanText(item))
    .filter(Boolean)
}

function normalizeDateValue(value: unknown) {
  if (!value) {
    return undefined
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString()
  }

  const normalized = normalizeTextValue(value)

  if (!normalized) {
    return undefined
  }

  if (ISO_DATE_PATTERN.test(normalized)) {
    return new Date(`${normalized}T00:00:00.000Z`).toISOString()
  }

  const parsed = new Date(normalized)

  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

function truncateDescription(source: string, maxLength = DESCRIPTION_MAX_LENGTH) {
  if (source.length <= maxLength) {
    return source
  }

  return `${source.slice(0, maxLength - 1).trimEnd()}…`
}

function getCandidateBlocks(source: string) {
  return source
    .split(/\n\s*\n/)
    .map((block) => cleanText(block))
    .filter((block) => block.length >= 24)
}

function extractHtmlParagraph(source: string, classPattern?: RegExp) {
  const paragraphMatches = Array.from(source.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/gi))

  for (const [, attributes, content] of paragraphMatches) {
    if (classPattern && !classPattern.test(attributes)) {
      continue
    }

    const paragraphText = cleanText(content.replace(/<[^>]+>/g, ' '))

    if (paragraphText.length >= 24) {
      return paragraphText
    }
  }

  return undefined
}

function resolveSummary(pageData: Pick<PageData, 'frontmatter'>, source: string) {
  const frontmatter = getFrontmatterRecord(pageData)
  const frontmatterSummary = normalizeTextValue(frontmatter.summary)

  if (frontmatterSummary) {
    return frontmatterSummary
  }

  return extractHtmlParagraph(source, /summary/i) ?? extractHtmlParagraph(source)
}

function resolvePlainTitle(pageData: PageData, siteTitle: string) {
  return pageData.relativePath === 'index.md' ? siteTitle : pageData.title || siteTitle
}

function resolveDisplayTitle(pageTitle: string, siteTitle: string) {
  return pageTitle === siteTitle ? siteTitle : `${pageTitle} | ${siteTitle}`
}

function getPageRoute(relativePath: string, cleanUrls = false) {
  const normalizedPath = relativePath.replace(/\\/g, '/')

  if (!normalizedPath || normalizedPath === 'index.md') {
    return ''
  }

  if (normalizedPath.endsWith('/index.md')) {
    return normalizedPath.slice(0, -'index.md'.length)
  }

  if (cleanUrls) {
    return normalizedPath.replace(/\.md$/, '')
  }

  return normalizedPath.replace(/\.md$/, '.html')
}

function toAbsoluteUrl(siteUrl: string, route: string) {
  return new URL(route, siteUrl).toString()
}

function getOgLocale(locale: string) {
  return locale.replace('-', '_')
}

function getBreadcrumbSegments(pageData: PageData) {
  const normalizedPath = pageData.relativePath.replace(/\\/g, '/')

  if (!normalizedPath || normalizedPath === 'index.md') {
    return []
  }

  const segments = normalizedPath.split('/')

  if (segments[segments.length - 1] === 'index.md') {
    return segments.slice(0, -1)
  }

  segments[segments.length - 1] = segments[segments.length - 1].replace(/\.md$/, '')

  return segments
}

function getCrumbName(segment: string) {
  return SECTION_TITLES[segment] ?? segment.replace(/[-_]/g, ' ')
}

function buildBreadcrumbs(pageData: PageData, siteUrl: string, currentTitle: string, cleanUrls = false) {
  const segments = getBreadcrumbSegments(pageData)
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: '\u9996\u9875',
      item: siteUrl
    }
  ]

  if (!segments.length) {
    return breadcrumbs
  }

  let currentRoute = ''

  segments.forEach((segment, index) => {
    const isLastSegment = index === segments.length - 1
    const isIndexPage = pageData.relativePath.endsWith('/index.md')
    const segmentRoute = isLastSegment && !isIndexPage
      ? getPageRoute(pageData.relativePath, cleanUrls)
      : `${currentRoute}${segment}/`

    currentRoute = `${currentRoute}${segment}/`

    breadcrumbs.push({
      '@type': 'ListItem',
      position: index + 2,
      name: isLastSegment ? currentTitle : getCrumbName(segment),
      item: toAbsoluteUrl(siteUrl, segmentRoute)
    })
  })

  return breadcrumbs
}

function resolvePageKind(pageData: PageData) {
  if (pageData.relativePath === 'index.md') {
    return 'home'
  }

  if (pageData.relativePath.endsWith('/index.md')) {
    return 'section'
  }

  return 'detail'
}

function resolveKeywords(pageData: Pick<PageData, 'frontmatter'>) {
  const frontmatter = getFrontmatterRecord(pageData)
  const keywords = normalizeStringList(frontmatter.keywords)

  if (keywords.length) {
    return keywords
  }

  return normalizeStringList(frontmatter.tags)
}

function resolveSocialImagePath(
  pageData: Pick<PageData, 'frontmatter'>,
  fallbackSocialImagePath = DEFAULT_SOCIAL_IMAGE
) {
  const frontmatter = getFrontmatterRecord(pageData)
  const candidate = normalizeTextValue(
    frontmatter.ogImage ?? frontmatter.socialImage ?? frontmatter.image
  )

  if (!candidate) {
    return fallbackSocialImagePath
  }

  return candidate.startsWith('/') ? candidate.slice(1) : candidate
}

function resolvePublishedTime(pageData: Pick<PageData, 'frontmatter'>) {
  const frontmatter = getFrontmatterRecord(pageData)
  return normalizeDateValue(frontmatter.date)
}

function resolveUpdatedTime(
  pageData: Pick<PageData, 'frontmatter'>,
  lastModified?: string
) {
  const frontmatter = getFrontmatterRecord(pageData)
  return normalizeDateValue(frontmatter.lastUpdated) ?? lastModified
}

function resolveAuthor(pageData: Pick<PageData, 'frontmatter'>) {
  const frontmatter = getFrontmatterRecord(pageData)
  return normalizeTextValue(frontmatter.author)
}

function isNoIndexPage(pageData: Pick<PageData, 'frontmatter' | 'isNotFound'>) {
  const frontmatter = getFrontmatterRecord(pageData)
  return pageData.isNotFound || Boolean(frontmatter.draft || frontmatter.noindex)
}

export function resolveSiteUrl(base: string, explicitSiteUrl?: string, githubRepository?: string) {
  const siteUrl = normalizeSiteUrl(explicitSiteUrl)

  if (siteUrl) {
    return applyBaseToSiteUrl(siteUrl, base)
  }

  if (!githubRepository) {
    return undefined
  }

  const [owner, repo] = githubRepository.split('/')

  if (!owner || !repo) {
    return undefined
  }

  if (repo.toLowerCase() === `${owner}.github.io`.toLowerCase()) {
    return applyBaseToSiteUrl(`https://${owner}.github.io/`, base)
  }

  if (base !== '/') {
    return `https://${owner}.github.io${base}`
  }

  return undefined
}

export function readPageSource(srcDir: string, pageData: Pick<PageData, 'filePath' | 'relativePath'>) {
  const sourcePath = pageData.filePath || pageData.relativePath

  if (!sourcePath) {
    return ''
  }

  const absolutePath = path.join(srcDir, sourcePath)

  if (!fs.existsSync(absolutePath)) {
    return ''
  }

  return fs.readFileSync(absolutePath, 'utf8')
}

export function resolvePageDescription(
  pageData: Pick<PageData, 'description' | 'frontmatter'>,
  source: string,
  siteDescription: string
) {
  const frontmatter = getFrontmatterRecord(pageData)
  const frontmatterDescription = normalizeTextValue(frontmatter.description)

  if (frontmatterDescription) {
    return truncateDescription(frontmatterDescription)
  }

  const summary = resolveSummary(pageData, source)

  if (summary) {
    return truncateDescription(summary)
  }

  const existingDescription = cleanText(pageData.description ?? '')

  if (existingDescription && existingDescription !== siteDescription) {
    return truncateDescription(existingDescription)
  }

  const sanitizedSource = sanitizeMarkdown(stripFrontmatter(source))
  const candidate = getCandidateBlocks(sanitizedSource)[0] ?? cleanText(sanitizedSource)

  return candidate ? truncateDescription(candidate) : siteDescription
}

export function getPageLastModified(srcDir: string, pageData: Pick<PageData, 'filePath' | 'relativePath'>) {
  const sourcePath = pageData.filePath || pageData.relativePath

  if (!sourcePath) {
    return undefined
  }

  const absolutePath = path.join(srcDir, sourcePath)

  if (!fs.existsSync(absolutePath)) {
    return undefined
  }

  return fs.statSync(absolutePath).mtime.toISOString()
}

export function createSeoHead(options: {
  pageData: PageData
  description: string
  documentTitle: string
  siteTitle: string
  siteDescription: string
  locale: string
  cleanUrls?: boolean
  siteUrl?: string
  lastModified?: string
  socialImagePath?: string
}): HeadConfig[] {
  const {
    pageData,
    description,
    documentTitle,
    siteTitle,
    siteDescription,
    locale,
    cleanUrls = false,
    siteUrl,
    lastModified,
    socialImagePath = DEFAULT_SOCIAL_IMAGE
  } = options

  const pageTitle = resolvePlainTitle(pageData, siteTitle)
  const seoTitle = cleanText(documentTitle || resolveDisplayTitle(pageTitle, siteTitle))
  const pageKind = resolvePageKind(pageData)
  const isNoIndex = isNoIndexPage(pageData)
  const robotsContent = isNoIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'
  const keywords = resolveKeywords(pageData)
  const author = resolveAuthor(pageData)
  const publishedTime = resolvePublishedTime(pageData)
  const updatedTime = resolveUpdatedTime(pageData, lastModified)
  const resolvedSocialImagePath = resolveSocialImagePath(pageData, socialImagePath)
  const head: HeadConfig[] = [['meta', { name: 'robots', content: robotsContent }]]

  if (keywords.length) {
    head.push(['meta', { name: 'keywords', content: keywords.join(', ') }])
  }

  if (author) {
    head.push(['meta', { name: 'author', content: author }])
  }

  if (isNoIndex) {
    return head
  }

  const canonicalPath = getPageRoute(pageData.relativePath, cleanUrls)
  const canonicalUrl = siteUrl ? toAbsoluteUrl(siteUrl, canonicalPath) : undefined
  const socialImageUrl = siteUrl ? toAbsoluteUrl(siteUrl, resolvedSocialImagePath) : undefined

  if (canonicalUrl) {
    head.push(['link', { rel: 'canonical', href: canonicalUrl }])
    head.push(['meta', { property: 'og:url', content: canonicalUrl }])
  }

  head.push(['meta', { property: 'og:site_name', content: siteTitle }])
  head.push(['meta', { property: 'og:locale', content: getOgLocale(locale) }])
  head.push(['meta', { property: 'og:type', content: pageKind === 'detail' ? 'article' : 'website' }])
  head.push(['meta', { property: 'og:title', content: seoTitle }])
  head.push(['meta', { property: 'og:description', content: description || siteDescription }])
  head.push(['meta', { name: 'twitter:card', content: 'summary_large_image' }])
  head.push(['meta', { name: 'twitter:title', content: seoTitle }])
  head.push(['meta', { name: 'twitter:description', content: description || siteDescription }])

  if (socialImageUrl) {
    head.push(['meta', { property: 'og:image', content: socialImageUrl }])
    head.push(['meta', { property: 'og:image:width', content: '1200' }])
    head.push(['meta', { property: 'og:image:height', content: '630' }])
    head.push(['meta', { property: 'og:image:alt', content: seoTitle }])
    head.push(['meta', { name: 'twitter:image', content: socialImageUrl }])
    head.push(['meta', { name: 'twitter:image:alt', content: seoTitle }])
  }

  if (publishedTime) {
    head.push(['meta', { property: 'article:published_time', content: publishedTime }])
  }

  if (updatedTime) {
    head.push(['meta', { property: 'article:modified_time', content: updatedTime }])
  }

  for (const keyword of keywords) {
    head.push(['meta', { property: 'article:tag', content: keyword }])
  }

  if (!siteUrl) {
    return head
  }

  const structuredData: Record<string, unknown>[] = []

  if (pageKind === 'home') {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteUrl}#website`,
      name: siteTitle,
      url: siteUrl,
      description: siteDescription,
      inLanguage: locale,
      image: socialImageUrl
    })
  } else if (canonicalUrl) {
    const webPageData: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': pageKind === 'section' ? 'CollectionPage' : 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      name: pageTitle,
      url: canonicalUrl,
      description,
      inLanguage: locale,
      isPartOf: {
        '@id': `${siteUrl}#website`
      },
      image: socialImageUrl,
      dateModified: updatedTime
    }

    if (publishedTime) {
      webPageData.datePublished = publishedTime
    }

    if (author) {
      webPageData.author = {
        '@type': 'Person',
        name: author
      }
    }

    if (keywords.length) {
      webPageData.keywords = keywords.join(', ')
    }

    structuredData.push(webPageData)

    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: buildBreadcrumbs(pageData, siteUrl, pageTitle, cleanUrls)
    })
  }

  if (structuredData.length) {
    head.push([
      'script',
      { type: 'application/ld+json' },
      JSON.stringify(structuredData)
    ])
  }

  return head
}

export function buildRobotsTxt(siteUrl?: string) {
  const lines = ['User-agent: *', 'Allow: /']

  if (siteUrl) {
    lines.push('', `Sitemap: ${new URL('sitemap.xml', siteUrl).toString()}`)
  }

  lines.push('')

  return lines.join('\n')
}

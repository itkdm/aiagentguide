import fs from 'node:fs'
import path from 'node:path'

import type { HeadConfig, PageData } from 'vitepress'

const DESCRIPTION_MAX_LENGTH = 140
const DEFAULT_SOCIAL_IMAGE = 'social-card.svg'

const SECTION_TITLES: Record<string, string> = {
  'getting-started': '入门',
  principles: '原理',
  frameworks: '框架',
  tutorials: '实战教程',
  projects: '项目',
  tools: '工具',
  news: '精选资讯',
  resources: '资源'
}

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
    .replace(/^[\s:：,，;；/]+/, '')
    .trim()
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
      name: '首页',
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
  const frontmatterDescription = cleanText(String(pageData.frontmatter?.description ?? ''))

  if (frontmatterDescription) {
    return truncateDescription(frontmatterDescription)
  }

  const explicitHtmlSummary =
    extractHtmlParagraph(source, /summary/i) ?? extractHtmlParagraph(source)

  if (explicitHtmlSummary) {
    return truncateDescription(explicitHtmlSummary)
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
  const isNoIndex = pageData.isNotFound || Boolean(pageData.frontmatter?.draft)
  const robotsContent = isNoIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'
  const head: HeadConfig[] = [['meta', { name: 'robots', content: robotsContent }]]

  if (isNoIndex) {
    return head
  }

  const canonicalPath = getPageRoute(pageData.relativePath, cleanUrls)
  const canonicalUrl = siteUrl ? toAbsoluteUrl(siteUrl, canonicalPath) : undefined
  const socialImageUrl = siteUrl ? toAbsoluteUrl(siteUrl, socialImagePath) : undefined

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

  if (lastModified) {
    head.push(['meta', { property: 'article:modified_time', content: lastModified }])
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
    structuredData.push({
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
      dateModified: lastModified
    })

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

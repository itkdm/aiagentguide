import fs from 'node:fs'
import path from 'node:path'

import type { HeadConfig, PageData } from 'vitepress'

const DESCRIPTION_MIN_LENGTH = 150
const DESCRIPTION_MAX_LENGTH = 158
const DEFAULT_SOCIAL_IMAGE = 'social-card.svg'
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const SECTION_DESCRIPTION_TERMS: Record<string, string> = {
  home: '覆盖 AI Agent、智能体开发、Agent 框架、LLM 应用、RAG 系统、工作流编排、提示工程、多 Agent 协作与企业级落地等高频主题',
  'getting-started':
    '覆盖 AI Agent 定义、智能体适用场景、工作流边界、RAG 区别、任务拆解、工具调用与技术选型等核心问题',
  principles:
    '聚焦智能体架构、规划决策、工具调用、记忆机制、执行循环、可靠性治理、观测评估与工程实现等关键主题',
  frameworks:
    '覆盖 Agent 框架选型、LangChain、LangGraph、多 Agent 协作、工作流编排、模型集成、工程实践与落地方式比较',
  tutorials:
    '聚焦 AI Agent 项目拆解、工作流设计、工具调用、原型验证、系统实现、部署路径与业务场景落地等实践问题',
  projects:
    '聚焦 AI Agent 项目分析、系统架构、方案设计、功能拆解、工程实现、能力边界与真实业务落地经验',
  tools:
    '覆盖 AI Agent 工具、智能体平台、工作流产品、模型集成、评测观测、自动化协作、部署能力与生态配套比较',
  resources:
    '聚合 AI Agent、LLM、RAG、智能体系统设计、工程实践、研究资料、框架文档与行业参考等高价值内容',
  llm: '覆盖大模型原理、推理机制、提示工程、上下文管理、工具调用、评测优化、应用架构与智能体协同等关键能力',
  rag: '覆盖 RAG 架构、检索增强生成、向量检索、混合检索、重排、知识库构建、上下文拼装、评测优化与生产部署等关键主题',
  interviews:
    '覆盖 AI Agent、LLM、RAG 面试题、案例解析、岗位准备、技术表达、方案复盘与知识体系梳理等高频内容'
}

const SECTION_DESCRIPTION_INTENTS: Record<string, string> = {
  home: '适合关注智能体产品、系统架构、技术选型、工程实现、企业知识库、搜索增强与业务落地的读者',
  'getting-started': '帮助建立智能体认知框架，理解什么是 AI Agent、何时使用 Agent，以及如何判断系统设计边界',
  principles: '适合理解 AI Agent 系统设计、执行逻辑、可靠性控制、评测方法与生产环境下的工程治理重点',
  frameworks:
    '适合比较不同 Agent 框架的适用场景、技术路线、扩展能力、开发体验与团队落地成本',
  tutorials: '适合参考从需求分析、方案设计到原型实现、验证优化与部署交付的完整实践路径',
  projects: '适合研究真实项目中的能力设计、系统边界、架构权衡、实施路径与可复制经验',
  tools: '适合比较智能体开发平台、自动化工具链、观测评测能力与企业级集成方向',
  resources: '便于系统跟踪技术框架、工程方法、行业趋势、研究进展与长期学习路线',
  llm: '适合关注大模型能力边界、上下文窗口、推理稳定性、应用设计与智能体系统协同方式的读者',
  rag: '适合关注企业知识库、智能问答、搜索增强、检索增强生成系统设计、质量优化与生产化落地的读者',
  interviews: '适合岗位准备、知识复盘、案例表达与面试场景下的高频技术问题梳理'
}

const GENERIC_DESCRIPTION_CLOSER =
  '帮助系统理解主题概念、能力边界、架构设计、工程实践、性能优化与生产环境中的落地重点。'

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
    .replace(/^["'“”‘’]+/, '')
    .replace(/["'“”‘’]+$/, '')
    .replace(/^[\s:;,.-]+/, '')
    .replace(/[。．.]["'“”‘’]+$/, '。')
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

  return source.slice(0, maxLength - 3).trimEnd() + '...'
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

function getPrimarySection(relativePath?: string) {
  const normalizedPath = cleanText((relativePath ?? '').replace(/\\/g, '/'))

  if (!normalizedPath || normalizedPath === 'index.md') {
    return 'home'
  }

  return normalizedPath.split('/')[0] || 'home'
}

function appendDescriptionFragment(base: string, fragment?: string) {
  const normalizedBase = cleanText(base)
  const normalizedFragment = cleanText(fragment ?? '')

  if (!normalizedFragment || normalizedBase.includes(normalizedFragment)) {
    return normalizedBase
  }

  if (!normalizedBase) {
    return normalizedFragment
  }

  const separator = /[。！？]$/.test(normalizedBase) ? '' : '。'

  return cleanText(`${normalizedBase}${separator}${normalizedFragment}`)
}

function expandDescription(
  baseDescription: string,
  pageData: Pick<PageData, 'frontmatter' | 'relativePath'>,
  siteDescription: string
) {
  let description = cleanText(baseDescription)

  if (!description) {
    return description
  }

  if (description.length >= DESCRIPTION_MIN_LENGTH) {
    return truncateDescription(description)
  }

  const section = getPrimarySection(pageData.relativePath)
  const sectionTerms = SECTION_DESCRIPTION_TERMS[section]
  const sectionIntents = SECTION_DESCRIPTION_INTENTS[section]
  const fragments = [sectionTerms, sectionIntents, siteDescription, GENERIC_DESCRIPTION_CLOSER]

  for (const fragment of fragments) {
    description = appendDescriptionFragment(description, fragment)

    if (description.length >= DESCRIPTION_MIN_LENGTH) {
      break
    }
  }

  return truncateDescription(description)
}

function resolvePlainTitle(pageData: PageData, siteTitle: string) {
  return pageData.relativePath === 'index.md' ? siteTitle : pageData.title || siteTitle
}

function resolveDisplayTitle(pageTitle: string, siteTitle: string) {
  return pageTitle === siteTitle ? siteTitle : pageTitle + ' | ' + siteTitle
}

function getPageRoute(relativePath: string, cleanUrls = false) {
  const normalizedPath = relativePath.replace(/\\/g, '/')

  if (!normalizedPath || normalizedPath === 'index.md') {
    return ''
  }

  if (normalizedPath.endsWith('/index.md')) {
    const folderPath = normalizedPath.slice(0, -'index.md'.length)
    return cleanUrls ? folderPath : folderPath + 'index.html'
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
    const segmentRoute = isLastSegment
      ? getPageRoute(pageData.relativePath, cleanUrls)
      : currentRoute + segment + '/index.html'

    currentRoute = currentRoute + segment + '/'

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
  pageData: Pick<PageData, 'description' | 'frontmatter' | 'relativePath'>,
  source: string,
  siteDescription: string
) {
  const frontmatter = getFrontmatterRecord(pageData)
  const frontmatterDescription = normalizeTextValue(frontmatter.description)

  if (frontmatterDescription) {
    return expandDescription(frontmatterDescription, pageData, siteDescription)
  }

  const summary = resolveSummary(pageData, source)

  if (summary) {
    return expandDescription(summary, pageData, siteDescription)
  }

  const existingDescription = cleanText(pageData.description ?? '')

  if (existingDescription && existingDescription !== siteDescription) {
    return expandDescription(existingDescription, pageData, siteDescription)
  }

  const sanitizedSource = sanitizeMarkdown(stripFrontmatter(source))
  const candidate = getCandidateBlocks(sanitizedSource)[0] ?? cleanText(sanitizedSource)

  return candidate
    ? expandDescription(candidate, pageData, siteDescription)
    : expandDescription(siteDescription, pageData, siteDescription)
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

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function buildSitemapXml(pages: string[], siteUrl: string, cleanUrls = false) {
  const urls = pages
    .filter((page) => page !== '404.md')
    .map((page) => {
      const route = getPageRoute(page, cleanUrls)
      return `<url><loc>${escapeXml(toAbsoluteUrl(siteUrl, route))}</loc></url>`
    })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>'
  ].join('')
}





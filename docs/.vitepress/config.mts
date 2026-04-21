import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vitepress'

import { siteNav } from './config/nav'
import {
  defaultSiteUrl,
  siteDescription,
  siteFooter,
  siteHead,
  siteLogo,
  siteTitle
} from './config/site'
import { siteSidebar } from './config/sidebar'
import { useInteractiveDiagramMarkdown } from './markdown/interactive-diagrams'
import {
  buildRobotsTxt,
  buildSitemapXml,
  createSeoHead,
  getPageLastModified,
  readPageSource,
  resolvePageDescription,
  resolveSiteUrl
} from './seo'

function normalizeBase(rawBase?: string) {
  if (!rawBase || rawBase === '/') {
    return '/'
  }

  const trimmedBase = rawBase.trim()
  const withLeadingSlash = trimmedBase.startsWith('/') ? trimmedBase : `/${trimmedBase}`

  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

const githubRepo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = normalizeBase(
  process.env.DOCS_BASE ||
    (process.env.GITHUB_ACTIONS === 'true' && githubRepo ? `/${githubRepo}/` : '/')
)
const siteUrl = resolveSiteUrl(
  base,
  process.env.DOCS_SITE_URL || process.env.SITE_URL || defaultSiteUrl,
  process.env.GITHUB_REPOSITORY
)

export default defineConfig({
  lang: 'zh-CN',
  base,
  title: siteTitle,
  description: siteDescription,
  head: siteHead,
  transformPageData(pageData, { siteConfig }) {
    const source = readPageSource(siteConfig.srcDir, pageData)
    const description = resolvePageDescription(pageData, source, siteDescription)

    return description ? { description } : undefined
  },
  transformHead({ pageData, siteData, title, description, siteConfig }) {
    return createSeoHead({
      pageData,
      description,
      documentTitle: title,
      siteTitle: siteData.title,
      siteDescription: siteData.description,
      locale: siteData.lang,
      cleanUrls: siteData.cleanUrls,
      siteUrl,
      lastModified: getPageLastModified(siteConfig.srcDir, pageData)
    })
  },
  buildEnd(siteConfig) {
    fs.writeFileSync(path.join(siteConfig.outDir, 'robots.txt'), buildRobotsTxt(siteUrl), 'utf8')

    if (siteUrl) {
      fs.writeFileSync(
        path.join(siteConfig.outDir, 'sitemap.xml'),
        buildSitemapXml(siteConfig.pages, siteUrl, siteConfig.cleanUrls),
        'utf8'
      )
    }

    if (siteUrl) {
      fs.writeFileSync(path.join(siteConfig.outDir, 'CNAME'), new URL(siteUrl).hostname, 'utf8')
    }
  },
  markdown: {
    config(md) {
      useInteractiveDiagramMarkdown(md)
    }
  },
  themeConfig: {
    logo: siteLogo,
    nav: siteNav,
    footer: siteFooter,
    sidebar: siteSidebar
  }
})

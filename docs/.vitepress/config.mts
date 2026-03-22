import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vitepress'

import {
  buildRobotsTxt,
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
const siteTitle = 'AI Agent Guide'
const siteDescription = 'AI Agent 中文教程与实战指南'
const defaultSiteUrl = 'https://aiagentguide.cn/'
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
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo-agent-loop.svg' }],
    ['meta', { name: 'theme-color', content: '#0f172a' }]
  ],
  sitemap: siteUrl
    ? {
        hostname: siteUrl,
        transformItems(items) {
          return items.filter((item) => !item.url.endsWith('/404.html'))
        }
      }
    : undefined,
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
      fs.writeFileSync(path.join(siteConfig.outDir, 'CNAME'), new URL(siteUrl).hostname, 'utf8')
    }
  },
  themeConfig: {
    logo: {
      light: '/logo-agent-loop.svg',
      dark: '/logo-agent-loop-dark.svg',
      alt: 'AI Agent Guide'
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '入门', link: '/getting-started/' },
      { text: '原理', link: '/principles/' },
      { text: '框架', link: '/frameworks/' },
      { text: '实战', link: '/tutorials/' },
      { text: '项目', link: '/projects/' },
      { text: '工具', link: '/tools/' },
      { text: '资讯', link: '/news/' }
    ],
    footer: {
      message: 'AI Agent 实战指南',
      copyright: 'Copyright © 2026 AI Agent Guide'
    },
    sidebar: {
      '/getting-started/': [
        {
          text: '入门',
          items: [
            { text: '概览', link: '/getting-started/' },
            { text: '典型案例', link: '/getting-started/ai-agent-cases' },
            { text: 'Agent 是什么', link: '/getting-started/what-is-ai-agent' },
            {
              text: 'Agent、工作流与 RAG',
              link: '/getting-started/agent-vs-chatbot-workflow-rag'
            },
            { text: 'Agent 使用场景', link: '/getting-started/when-to-use-agent' },
            { text: 'Agent 运行原理', link: '/getting-started/how-agent-works' },
            { text: 'Agent 核心组件', link: '/getting-started/core-components' },
            { text: '第一次动手前要知道什么', link: '/getting-started/before-your-first-agent' },
            { text: '新手常见误区', link: '/getting-started/common-mistakes' },
            { text: '入门学习路线', link: '/getting-started/learning-path' },
            { text: '术语表', link: '/getting-started/glossary' },
            { text: 'FAQ', link: '/getting-started/faq' }
          ]
        }
      ],
      '/principles/': [
        {
          text: '原理',
          items: [
            { text: '概览', link: '/principles/' }
          ]
        },
        {
          text: '工具与执行',
          items: [
            { text: 's01 Agent 循环', link: '/principles/s01-agent-loop' },
            { text: 's02 工具', link: '/principles/s02-tools' }
          ]
        },
        {
          text: '规划与协调',
          items: [
            { text: 's03 TodoWrite', link: '/principles/s03-todowrite' },
            { text: 's04 子 Agent', link: '/principles/s04-sub-agents' },
            { text: 's05 技能', link: '/principles/s05-skills' },
            { text: 's07 任务系统', link: '/principles/s07-task-system' }
          ]
        },
        {
          text: '内存管理',
          items: [{ text: 's06 上下文压缩', link: '/principles/s06-context-compression' }]
        },
        {
          text: '并发',
          items: [{ text: 's08 后台任务', link: '/principles/s08-background-tasks' }]
        },
        {
          text: '协作',
          items: [
            { text: 's09 Agent 团队', link: '/principles/s09-agent-teams' },
            { text: 's10 团队协议', link: '/principles/s10-team-protocol' },
            { text: 's11 自主 Agent', link: '/principles/s11-autonomous-agents' },
            {
              text: 's12 Worktree + 任务隔离',
              link: '/principles/s12-worktree-task-isolation'
            }
          ]
        },
        {
          text: '通用原理补充',
          items: [
            {
              text: '通用 Agent 架构',
              link: '/principles/general-agent-architecture'
            },
            {
              text: '通用记忆原理',
              link: '/principles/general-memory-rag-state'
            },
            {
              text: '通用多 Agent 原理',
              link: '/principles/general-multi-agent'
            },
            {
              text: '通用可靠性原理',
              link: '/principles/general-reliability-safety'
            }
          ]
        }
      ],
      '/frameworks/': [
        {
          text: '框架',
          items: [{ text: '概览', link: '/frameworks/' }]
        }
      ],
      '/tutorials/': [
        {
          text: '实战',
          items: [{ text: '概览', link: '/tutorials/' }]
        }
      ],
      '/projects/': [
        {
          text: '项目',
          items: [{ text: '概览', link: '/projects/' }]
        }
      ],
      '/tools/': [
        {
          text: '工具导航',
          link: '/tools/'
        },
        {
          text: '热门智能体',
          items: [
            { text: 'Manus', link: '/tools/manus' },
            { text: 'Genspark', link: '/tools/genspark' },
            { text: 'Flowith', link: '/tools/flowith' },
            { text: '扣子', link: '/tools/coze' },
            { text: 'AstronClaw', link: '/tools/astronclaw' },
            { text: 'QoderWork', link: '/tools/qoderwork' },
            { text: 'ChatGPT 智能体', link: '/tools/operator' },
            { text: 'Skywork', link: '/tools/skywork' }
          ]
        }
      ],
      '/news/': [
        {
          text: '资讯',
          items: [{ text: '概览', link: '/news/' }]
        }
      ]
    }
  }
})

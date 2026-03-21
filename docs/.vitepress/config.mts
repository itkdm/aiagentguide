import { defineConfig } from 'vitepress'

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

export default defineConfig({
  lang: 'zh-CN',
  base,
  title: 'AI Agent Guide',
  description: 'AI Agent 中文教程与实战指南',
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo-agent-loop.svg' }]],
  themeConfig: {
    logo: {
      light: '/logo-agent-loop.svg',
      dark: '/logo-agent-loop-dark.svg',
      alt: 'AI Agent Guide'
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '入门', link: '/getting-started/' },
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
          items: [{ text: '概览', link: '/getting-started/' }]
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

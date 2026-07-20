import type { HeadConfig } from 'vitepress'

export const siteTitle = '布吉岛 Agent'
export const siteDescription = '布吉岛 Agent 是面向中文开发者的 AI Agent 教程与开发实战指南'
export const defaultSiteUrl = 'https://aiagentguide.cn/'

export const siteHead: HeadConfig[] = [
  ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo-agent-loop.svg' }],
  ['meta', { name: 'theme-color', content: '#0f172a' }],
  [
    'script',
    {
      async: '',
      src: 'https://www.googletagmanager.com/gtag/js?id=G-XVLTZZW9QV'
    }
  ],
  [
    'script',
    {},
    `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-XVLTZZW9QV');`
  ],
  [
    'meta',
    {
      name: 'google-site-verification',
      content: 'CMdmzlOG4rakUeMM0QHuyf3h3ai9pTQgXiJJLJ2DLEY'
    }
  ],
  [
    'meta',
    {
      name: 'baidu-site-verification',
      content: 'codeva-UQBDbSCAOW'
    }
  ],
  [
    'meta',
    {
      name: 'msvalidate.01',
      content: '8E7564BB20200ACA8F17F056DFFD9183'
    }
  ]
]

export const siteLogo = {
  light: '/logo-agent-loop.svg',
  dark: '/logo-agent-loop-dark.svg',
  alt: '布吉岛 Agent'
}

export const siteFooter = {
  message:
    '<span class="footer-brand">布吉岛 Agent · 从不知道，到做得到</span><span class="footer-sep">·</span><a class="footer-link" href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">豫ICP备2025137611号-5</a><span class="footer-sep">·</span><a class="footer-link" href="https://aiagentguide.cn/sitemap.xml" target="_blank" rel="noreferrer">sitemap.xml</a><span class="footer-sep">·</span><span class="footer-contact">有问题或合作欢迎联系</span><a class="footer-link" href="mailto:hello@aiagentguide.cn">hello@aiagentguide.cn</a>',
  copyright: 'Copyright © 2026 布吉岛'
}

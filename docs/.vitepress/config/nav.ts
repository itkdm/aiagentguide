import type { DefaultTheme } from 'vitepress'
export const siteNav: DefaultTheme.NavItem[] = [
  { text: '首页', link: '/' },
  { text: '入门', link: '/getting-started/' },
  { text: '原理', link: '/principles/' },
  { text: '项目实践', link: '/projects/', activeMatch: '/projects/' },
  { text: 'RAG', link: '/rag/' }
]

import type { DefaultTheme } from 'vitepress'

export const billingSidebar: DefaultTheme.Sidebar = {
  '/projects/billing/': [
    {
      text: 'CostFlow - AI 应用计费系统',
      collapsed: false,
      items: [{ text: '概览', link: '/projects/billing/' }]
    }
  ]
}

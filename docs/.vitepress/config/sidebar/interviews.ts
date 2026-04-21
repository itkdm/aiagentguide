import type { DefaultTheme } from 'vitepress'

export const interviewsSidebar: DefaultTheme.Sidebar = {
'/interviews/': [
  {
    text: '面试',
    items: [
      { text: '概览', link: '/interviews/' }
    ]
  },
  {
    text: '面试案例',
    items: [
      { text: '概览', link: '/interviews/experiences/' },
      { text: 'AI Agent 二面题目', link: '/interviews/experiences/niuke-agent-second-round-sample' },
      { text: '某小厂 Agent 面经分享', link: '/interviews/experiences/niuke-small-company-agent-experience' },
      { text: '阿里淘天 AI Agent 二面面经分享', link: '/interviews/experiences/niuke-taotian-agent-second-round-experience' },
      { text: '大模型 Agent 校招面经 - 阿里淘天', link: '/interviews/experiences/niuke-taotian-campus-agent-experience' },
      { text: 'A厂 Agent 开发一面面经题目整理', link: '/interviews/experiences/a-factory-agent-first-round-experience' }
    ]
  }
],
}

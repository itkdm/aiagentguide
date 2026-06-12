import type { DefaultTheme } from 'vitepress'

export const tutorialsSidebar: DefaultTheme.Sidebar = {
'/tutorials/': [
  {
    text: '实战',
    items: [
      { text: '概览', link: '/tutorials/' },
      { text: '第一个 Agent：资料搜集清单', link: '/tutorials/first-agent-materials-brief' }
    ]
  },
  {
    text: 'Coding Agent 实战方法',
    collapsed: true,
    items: [
      { text: '概览', link: '/tutorials/coding-agents/' },
      {
        text: '基础用法',
        collapsed: false,
        items: [
          { text: '概览', link: '/tutorials/coding-agents/basics/' }
        ]
      },
      {
        text: '开发工作流',
        collapsed: false,
        items: [
          { text: '概览', link: '/tutorials/coding-agents/workflows/' }
        ]
      },
      {
        text: '质量控制',
        collapsed: false,
        items: [
          { text: '概览', link: '/tutorials/coding-agents/quality/' }
        ]
      },
      {
        text: '团队实践',
        collapsed: false,
        items: [
          { text: '概览', link: '/tutorials/coding-agents/team-practices/' }
        ]
      },
      {
        text: '实战案例',
        collapsed: false,
        items: [
          { text: '概览', link: '/tutorials/coding-agents/cases/' }
        ]
      }
    ]
  }
],
}

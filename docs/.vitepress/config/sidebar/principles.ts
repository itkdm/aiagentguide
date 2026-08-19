import type { DefaultTheme } from 'vitepress'

export const principlesSidebar: DefaultTheme.Sidebar = {
'/principles/': [
  {
    text: '概览',
    link: '/principles/'
  },
  {
    text: '通用原理补充',
    items: [
      { text: '01-Agent 架构', link: '/principles/general-agent-architecture' },
      { text: '02-核心循环', link: '/principles/general-core-loop' },
      { text: '03-规划', link: '/principles/general-planning' },
      { text: '04-工具', link: '/principles/general-tools' },
          { text: '05-记忆', link: '/principles/general-memory' },
          { text: '06-Skill', link: '/principles/general-skills' },
          { text: '07-MCP', link: '/principles/general-mcp' },
          { text: '08-Harness Engineering', link: '/principles/general-harness-engineering' },
          { text: '09-多 Agent', link: '/principles/general-multi-agent' },
          { text: '10-可靠性与安全', link: '/principles/general-reliability-safety' }
    ]
  }
],
}

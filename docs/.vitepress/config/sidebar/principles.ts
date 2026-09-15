import type { DefaultTheme } from 'vitepress'

export const principlesSidebar: DefaultTheme.Sidebar = {
'/principles/': [
  {
    text: '概览',
    link: '/principles/'
  },
  {
    text: '深入 MCP',
    collapsed: true,
    items: [
      { text: 'MCP 架构', link: '/principles/deep-mcp-architecture' },
      { text: 'MCP 消息模型', link: '/principles/deep-mcp-message-model' },
      { text: 'MCP 传输方式', link: '/principles/deep-mcp-transport' }
    ]
  }
],
}

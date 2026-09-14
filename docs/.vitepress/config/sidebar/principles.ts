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
      { text: 'MCP 的架构是怎样的？', link: '/principles/deep-mcp-architecture' },
      { text: 'MCP 的消息模型是怎么设计的？', link: '/principles/deep-mcp-message-model' },
      { text: 'MCP 的消息是怎么传输的？', link: '/principles/deep-mcp-transport' }
    ]
  }
],
}

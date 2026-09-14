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
      { text: 'MCP 的消息是怎么传输的？', link: '/principles/deep-mcp-transport' },
      { text: 'MCP 是怎么协商协议版本和能力的？', link: '/principles/deep-mcp-negotiation' },
      { text: 'MCP Server 是怎么描述自己能力的？', link: '/principles/deep-mcp-capabilities' },
      { text: 'MCP Tool 是怎么接入模型调用链的？', link: '/principles/deep-mcp-tool-model' },
      { text: '深入 MCP：一次请求需要多轮交互时怎么办？', link: '/principles/deep-mcp-mrtr' }
    ]
  }
],
}

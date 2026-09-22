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
      { text: 'MCP 传输方式', link: '/principles/deep-mcp-transport' },
      { text: 'MCP 版本与能力协商', link: '/principles/deep-mcp-negotiation' },
      { text: 'MCP 三类核心能力', link: '/principles/deep-mcp-capabilities' },
      { text: 'MCP Tool 调用链', link: '/principles/deep-mcp-tool-model' },
      { text: 'MCP 多轮交互', link: '/principles/deep-mcp-mrtr' },
      { text: 'MCP 长请求与持续通知', link: '/principles/deep-mcp-long-running' },
      { text: 'Remote MCP 的 Authorization 到底是怎么工作的？', link: '/principles/deep-mcp-authorization' },
      { text: 'MCP 的安全边界到底在哪里？', link: '/principles/deep-mcp-security' },
      { text: '为什么 MCP 要把能力拆成 Core 和 Extension？', link: '/principles/deep-mcp-core-extension' },
      { text: '一个 MCP 系统到了生产环境还要解决什么？', link: '/principles/deep-mcp-production' }
    ]
  },
  {
    text: '深入压缩机制',
    collapsed: true,
    items: [
      { text: 'DeepSeek Harness 压缩机制', link: '/principles/deepseek-harness-context-compaction' }
    ]
  }
],
}

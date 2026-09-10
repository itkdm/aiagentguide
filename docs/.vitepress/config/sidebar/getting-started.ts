import type { DefaultTheme } from 'vitepress'

export const gettingStartedSidebar: DefaultTheme.Sidebar = {
'/getting-started/': [
  {
    text: '入门',
    items: [
      { text: '概览', link: '/getting-started/' },
      { text: '典型案例', link: '/getting-started/ai-agent-cases' },
      { text: 'Agent 是什么', link: '/getting-started/what-is-ai-agent' },
      { text: 'Workflow 是什么', link: '/getting-started/what-is-workflow' },
      { text: 'RAG 是什么', link: '/getting-started/what-is-rag' },
      { text: 'Agent、Workflow与 RAG', link: '/getting-started/agent-vs-chatbot-workflow-rag' },
      { text: 'Agent 使用场景', link: '/getting-started/when-to-use-agent' },
      { text: 'Agent 运行原理', link: '/getting-started/how-agent-works' },
      { text: '第一步动手前要知道什么', link: '/getting-started/before-your-first-agent' },
      { text: '从零实现一个最小 AI Agent', link: '/getting-started/minimal-ai-agent' },
      { text: '从零实现一个最小 Coding Agent', link: '/getting-started/minimal-coding-agent' },
      { text: '从最小 Coding Agent 到 Pi', link: '/getting-started/from-minimal-coding-agent-to-pi' },
      { text: 'Agent 开发常见误区', link: '/getting-started/common-mistakes' },
      { text: 'Agent 开发学习路线', link: '/getting-started/learning-path' },
      { text: 'Agent 开发 FAQ', link: '/getting-started/faq' }
    ]
  }
],
}

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
      { text: 'Agent 核心组件', link: '/getting-started/core-components' },
      { text: '第一步动手前要知道什么', link: '/getting-started/before-your-first-agent' },
      { text: '新手常见误区', link: '/getting-started/common-mistakes' },
      { text: '入门学习路线', link: '/getting-started/learning-path' },
      { text: '术语表', link: '/getting-started/glossary' },
      { text: 'FAQ', link: '/getting-started/faq' }
    ]
  }
],
}

import type { DefaultTheme } from 'vitepress'

export const frameworksSidebar: DefaultTheme.Sidebar = {
'/frameworks/': [
  {
    text: '框架',
    items: [
      { text: '概览', link: '/frameworks/' },
      { text: '如何选择合适的框架', link: '/frameworks/how-to-choose-agent-framework' }
    ]
  },
  {
    text: 'LangChain',
    collapsed: true,
    items: [
      { text: '概览', link: '/frameworks/langchain/' },
      {
        text: '入门',
        collapsed: false,
        items: [
          { text: '安装', link: '/frameworks/langchain/get-started/install' },
          { text: '快速开始', link: '/frameworks/langchain/get-started/quickstart' },
          { text: '更新日志', link: '/frameworks/langchain/get-started/changelog' },
          { text: '设计理念', link: '/frameworks/langchain/get-started/philosophy' }
        ]
      },
      {
        text: '核心组件',
        collapsed: false,
        items: [
          { text: 'Agents', link: '/frameworks/langchain/core-components/agents' },
          { text: '模型', link: '/frameworks/langchain/core-components/models' },
          { text: '消息', link: '/frameworks/langchain/core-components/messages' },
          { text: '工具', link: '/frameworks/langchain/core-components/tools' },
          { text: '短期记忆', link: '/frameworks/langchain/core-components/short-term-memory' },
          { text: '流式输出', link: '/frameworks/langchain/core-components/streaming' },
          { text: '结构化输出', link: '/frameworks/langchain/core-components/structured-output' }
        ]
      },
      {
        text: '中间件',
        collapsed: false,
        items: [
          { text: '概览', link: '/frameworks/langchain/middleware/overview' },
          { text: '内置中间件', link: '/frameworks/langchain/middleware/built-in' },
          { text: '自定义中间件', link: '/frameworks/langchain/middleware/custom' }
        ]
      },
      {
        text: '前端',
        collapsed: false,
        items: [
          { text: '概览', link: '/frameworks/langchain/frontend/overview' },
          {
            text: '模式',
            collapsed: false,
            items: [
              { text: 'Markdown 消息', link: '/frameworks/langchain/frontend/markdown-messages' },
              { text: '工具调用', link: '/frameworks/langchain/frontend/tool-calling' },
              { text: '人工介入', link: '/frameworks/langchain/frontend/human-in-the-loop' },
              { text: '分支对话', link: '/frameworks/langchain/frontend/branching-chat' },
              { text: '推理 tokens', link: '/frameworks/langchain/frontend/reasoning-tokens' },
              { text: '结构化输出', link: '/frameworks/langchain/frontend/structured-output' },
              { text: '消息队列', link: '/frameworks/langchain/frontend/message-queues' },
              { text: '加入与重新加入', link: '/frameworks/langchain/frontend/join-rejoin' },
              { text: '时间回溯', link: '/frameworks/langchain/frontend/time-travel' },
              { text: 'Generative UI', link: '/frameworks/langchain/frontend/generative-ui' }
            ]
          },
          {
            text: '集成',
            collapsed: false,
            items: [
              { text: '概览', link: '/frameworks/langchain/frontend/integrations/overview' },
              { text: 'AI 元素', link: '/frameworks/langchain/frontend/integrations/ai-elements' },
              { text: 'assistant-ui', link: '/frameworks/langchain/frontend/integrations/assistant-ui' },
              { text: 'OpenUI', link: '/frameworks/langchain/frontend/integrations/openui' }
            ]
          }
        ]
      },
      {
        text: '高级用法',
        collapsed: false,
        items: [
          { text: 'Guardrails', link: '/frameworks/langchain/advanced-usage/guardrails' },
          { text: '运行时', link: '/frameworks/langchain/advanced-usage/runtime' },
          { text: '上下文工程', link: '/frameworks/langchain/advanced-usage/context-engineering' },
          { text: 'MCP', link: '/frameworks/langchain/advanced-usage/mcp' },
          { text: '人工介入', link: '/frameworks/langchain/advanced-usage/human-in-the-loop' },
          {
            text: '多 Agent',
            collapsed: false,
            items: [
              { text: '概览', link: '/frameworks/langchain/multi-agent/overview' },
              { text: '子 Agent', link: '/frameworks/langchain/multi-agent/subagents' },
              { text: '交接', link: '/frameworks/langchain/multi-agent/handoffs' },
              { text: '技能', link: '/frameworks/langchain/multi-agent/skills' },
              { text: '路由', link: '/frameworks/langchain/multi-agent/router' },
              { text: '自定义工作流', link: '/frameworks/langchain/multi-agent/custom-workflow' },
              { text: '交接：客服场景', link: '/frameworks/langchain/multi-agent/handoffs-customer-support' },
              { text: '路由：知识库场景', link: '/frameworks/langchain/multi-agent/router-knowledge-base' },
              { text: '子 Agent：个人助理场景', link: '/frameworks/langchain/multi-agent/subagents-personal-assistant' },
              { text: '技能：SQL 助手', link: '/frameworks/langchain/multi-agent/skills-sql-assistant' }
            ]
          },
          { text: '检索', link: '/frameworks/langchain/advanced-usage/retrieval' },
          { text: '长期记忆', link: '/frameworks/langchain/advanced-usage/long-term-memory' }
        ]
      },
      {
        text: 'Agent 开发',
        collapsed: false,
        items: [
          { text: 'LangSmith Studio', link: '/frameworks/langchain/agent-development/studio' },
          {
            text: '测试',
            collapsed: false,
            items: [
              { text: '概览', link: '/frameworks/langchain/agent-development/test/' },
              { text: '单元测试', link: '/frameworks/langchain/agent-development/test/unit-testing' },
              { text: '集成测试', link: '/frameworks/langchain/agent-development/test/integration-testing' },
              { text: '评估', link: '/frameworks/langchain/agent-development/test/evals' }
            ]
          },
          { text: 'Agent 聊天 UI', link: '/frameworks/langchain/agent-development/ui' }
        ]
      },
      {
        text: '使用 LangSmith 部署',
        collapsed: false,
        items: [
          { text: '部署', link: '/frameworks/langchain/deploy-with-langsmith/deployment' },
          { text: '可观测性', link: '/frameworks/langchain/deploy-with-langsmith/observability' }
        ]
      }
    ]
  }
],
}

import type { DefaultTheme } from 'vitepress'

export const interviewsSidebar: DefaultTheme.Sidebar = {
  '/interviews/': [
    {
      text: 'Agent 面试题',
      collapsed: false,
      items: [
        {
          text: '01 Agent 基础',
          collapsed: false,
          items: [
            { text: '什么是 Agent', link: '/interviews/agent/01-basics/what-is-agent' },
            { text: 'Agent Loop', link: '/interviews/agent/01-basics/agent-loop' },
            {
              text: 'Agent、Workflow 与 Tool',
              link: '/interviews/agent/01-basics/agent-workflow-and-tool'
            }
          ]
        },
        { text: '02 工具调用', link: '/interviews/agent/02-tool-use/' },
        { text: '03 规划与决策', link: '/interviews/agent/03-planning-and-decision/' },
        { text: '04 Context Engineering', link: '/interviews/agent/04-context-engineering/' },
        { text: '05 Memory', link: '/interviews/agent/05-memory/' },
        { text: '06 MCP', link: '/interviews/agent/06-mcp/' },
        { text: '07 Agent Skills', link: '/interviews/agent/07-agent-skills/' },
        { text: '08 Agent 编排', link: '/interviews/agent/08-agent-orchestration/' },
        { text: '09 Multi-Agent', link: '/interviews/agent/09-multi-agent/' },
        { text: '10 Agent 可靠性', link: '/interviews/agent/10-agent-reliability/' },
        { text: '11 Agent Security', link: '/interviews/agent/11-agent-security/' },
        { text: '12 Agent 可观测性', link: '/interviews/agent/12-agent-observability/' },
        { text: '13 Agent Evaluation', link: '/interviews/agent/13-agent-evaluation/' },
        { text: '14 Agent 系统设计', link: '/interviews/agent/14-agent-system-design-and-project-interview/' }
      ]
    }
  ]
}

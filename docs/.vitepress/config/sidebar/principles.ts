import type { DefaultTheme } from 'vitepress'

export const principlesSidebar: DefaultTheme.Sidebar = {
'/principles/': [
  {
    text: '概览',
    link: '/principles/'
  },
  {
    text: 'learn-claude-code',
    collapsed: true,
    items: [
      { text: '概览', link: '/principles/learn-claude-code' },
      {
        text: '工具与执行',
        collapsed: false,
        items: [
          { text: 's01 Agent 循环', link: '/principles/s01-agent-loop' },
          { text: 's02 工具', link: '/principles/s02-tools' }
        ]
      },
      {
        text: '规划与协同',
        collapsed: false,
        items: [
          { text: 's03 TodoWrite', link: '/principles/s03-todowrite' },
          { text: 's04 子 Agent', link: '/principles/s04-sub-agents' },
          { text: 's05 技能', link: '/principles/s05-skills' },
          { text: 's07 任务系统', link: '/principles/s07-task-system' }
        ]
      },
      {
        text: '记忆管理',
        collapsed: false,
        items: [
          { text: 's06 上下文压缩', link: '/principles/s06-context-compression' }
        ]
      },
      {
        text: '并发',
        collapsed: false,
        items: [
          { text: 's08 后台任务', link: '/principles/s08-background-tasks' }
        ]
      },
      {
        text: '协作',
        collapsed: false,
        items: [
          { text: 's09 Agent 团队', link: '/principles/s09-agent-teams' },
          { text: 's10 团队协议', link: '/principles/s10-team-protocol' },
          { text: 's11 自主 Agent', link: '/principles/s11-autonomous-agents' },
          { text: 's12 Worktree + 任务隔离', link: '/principles/s12-worktree-task-isolation' }
        ]
      }
    ]
  },
  {
    text: 'OpenClaw',
    collapsed: true,
    items: [
      { text: '李弘毅老师原理拆解', link: '/principles/openclaw-principles' },
      { text: '01-OpenClaw 架构', link: '/principles/openclaw-architecture' }
    ]
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

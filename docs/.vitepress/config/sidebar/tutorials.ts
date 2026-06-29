import type { DefaultTheme } from 'vitepress'

export const tutorialsSidebar: DefaultTheme.Sidebar = {
'/tutorials/': [
  {
    text: '实战',
    items: [
      { text: '概览', link: '/tutorials/' },
      { text: '第一个 Agent：资料搜集清单', link: '/tutorials/first-agent-materials-brief' }
    ]
  },
  {
    text: 'Coding Agent 实战方法',
    collapsed: true,
    items: [
      { text: '概览', link: '/tutorials/coding-agents/' },
      {
        text: '基础用法',
        collapsed: false,
        items: [
          { text: '概览', link: '/tutorials/coding-agents/basics/' }
        ]
      },
      {
        text: '开发工作流',
        collapsed: false,
        items: [
          { text: '概览', link: '/tutorials/coding-agents/workflows/' },
          {
            text: 'Superpowers 工作流',
            collapsed: true,
            items: [
              { text: '导航', link: '/tutorials/coding-agents/workflows/superpowers/reference/' },
              { text: '01 - using-superpowers', link: '/tutorials/coding-agents/workflows/superpowers/reference/using-superpowers' },
              { text: '02 - brainstorming', link: '/tutorials/coding-agents/workflows/superpowers/reference/brainstorming' },
              { text: '03 - writing-plans', link: '/tutorials/coding-agents/workflows/superpowers/reference/writing-plans' },
              { text: '04 - subagent-driven-development', link: '/tutorials/coding-agents/workflows/superpowers/reference/subagent-driven-development' },
              { text: '05 - executing-plans', link: '/tutorials/coding-agents/workflows/superpowers/reference/executing-plans' },
              { text: '06 - test-driven-development', link: '/tutorials/coding-agents/workflows/superpowers/reference/test-driven-development' },
              { text: '07 - systematic-debugging', link: '/tutorials/coding-agents/workflows/superpowers/reference/systematic-debugging' },
              { text: '08 - verification-before-completion', link: '/tutorials/coding-agents/workflows/superpowers/reference/verification-before-completion' },
              { text: '09 - requesting-code-review', link: '/tutorials/coding-agents/workflows/superpowers/reference/requesting-code-review' },
              { text: '10 - receiving-code-review', link: '/tutorials/coding-agents/workflows/superpowers/reference/receiving-code-review' },
              { text: '11 - using-git-worktrees', link: '/tutorials/coding-agents/workflows/superpowers/reference/using-git-worktrees' },
              { text: '12 - finishing-a-development-branch', link: '/tutorials/coding-agents/workflows/superpowers/reference/finishing-a-development-branch' },
              { text: '13 - dispatching-parallel-agents', link: '/tutorials/coding-agents/workflows/superpowers/reference/dispatching-parallel-agents' },
              { text: '14 - writing-skills', link: '/tutorials/coding-agents/workflows/superpowers/reference/writing-skills' },
            ]
          }
        ]
      },
      {
        text: '质量控制',
        collapsed: false,
        items: [
          { text: '概览', link: '/tutorials/coding-agents/quality/' }
        ]
      },
      {
        text: '团队实践',
        collapsed: false,
        items: [
          { text: '概览', link: '/tutorials/coding-agents/team-practices/' }
        ]
      },
      {
        text: '实战案例',
        collapsed: false,
        items: [
          { text: '概览', link: '/tutorials/coding-agents/cases/' }
        ]
      }
    ]
  }
],
}

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
              { text: '01 概览与核心理念', link: '/tutorials/coding-agents/workflows/superpowers/01-overview' },
              { text: '02 设计先行', link: '/tutorials/coding-agents/workflows/superpowers/02-design-first' },
              { text: '03 任务拆解', link: '/tutorials/coding-agents/workflows/superpowers/03-task-breakdown' },
              { text: '04 子代理驱动开发', link: '/tutorials/coding-agents/workflows/superpowers/04-subagent-development' },
              { text: '05 TDD 铁律', link: '/tutorials/coding-agents/workflows/superpowers/05-tdd' },
              { text: '06 调试与验证', link: '/tutorials/coding-agents/workflows/superpowers/06-debugging' },
              { text: '07 代码审查循环', link: '/tutorials/coding-agents/workflows/superpowers/07-code-review' },
              { text: '08 收尾与合并', link: '/tutorials/coding-agents/workflows/superpowers/08-finishing' },
              {
                text: '参考文档',
                collapsed: true,
                items: [
                  { text: '导航', link: '/tutorials/coding-agents/workflows/superpowers/reference/' },
                  { text: 'using-superpowers', link: '/tutorials/coding-agents/workflows/superpowers/reference/using-superpowers' },
                  { text: 'brainstorming', link: '/tutorials/coding-agents/workflows/superpowers/reference/brainstorming' },
                  { text: 'writing-plans', link: '/tutorials/coding-agents/workflows/superpowers/reference/writing-plans' },
                  { text: 'subagent-driven-development', link: '/tutorials/coding-agents/workflows/superpowers/reference/subagent-driven-development' },
                  { text: 'executing-plans', link: '/tutorials/coding-agents/workflows/superpowers/reference/executing-plans' },
                  { text: 'test-driven-development', link: '/tutorials/coding-agents/workflows/superpowers/reference/test-driven-development' },
                  { text: 'systematic-debugging', link: '/tutorials/coding-agents/workflows/superpowers/reference/systematic-debugging' },
                  { text: 'verification-before-completion', link: '/tutorials/coding-agents/workflows/superpowers/reference/verification-before-completion' },
                  { text: 'requesting-code-review', link: '/tutorials/coding-agents/workflows/superpowers/reference/requesting-code-review' },
                  { text: 'receiving-code-review', link: '/tutorials/coding-agents/workflows/superpowers/reference/receiving-code-review' },
                  { text: 'using-git-worktrees', link: '/tutorials/coding-agents/workflows/superpowers/reference/using-git-worktrees' },
                  { text: 'finishing-a-development-branch', link: '/tutorials/coding-agents/workflows/superpowers/reference/finishing-a-development-branch' },
                  { text: 'dispatching-parallel-agents', link: '/tutorials/coding-agents/workflows/superpowers/reference/dispatching-parallel-agents' },
                  { text: 'writing-skills', link: '/tutorials/coding-agents/workflows/superpowers/reference/writing-skills' },
                ]
              }
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

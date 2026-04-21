import type { DefaultTheme } from 'vitepress'

export const tutorialsSidebar: DefaultTheme.Sidebar = {
'/tutorials/': [
  {
    text: '实战',
    items: [{ text: '概览', link: '/tutorials/' }]
  },
  {
    text: 'DataAgent',
    collapsed: false,
    items: [
      { text: '项目总览', link: '/tutorials/dataagent/' },
      { text: '01 先跑通项目，再建立整体感', link: '/tutorials/dataagent/m01-start-and-orientation' },
      { text: '02 先看系统结构，再找主链路', link: '/tutorials/dataagent/m02-architecture-and-boundaries' },
      { text: '03 一个问题是怎么走完整条分析链路的', link: '/tutorials/dataagent/m03-main-workflow' },
      { text: '04 为什么数据 Agent 不能只靠表结构', link: '/tutorials/dataagent/m04-knowledge-and-rag' },
      { text: '05 为什么只查到数据还不够', link: '/tutorials/dataagent/m05-execution-and-output' },
      { text: '06 一个能落地的 Agent 系统还要补哪些工程能力', link: '/tutorials/dataagent/m06-engineering-and-extension' }
    ]
  }
],
}

import type { DefaultTheme } from 'vitepress'

export const tutorialsSidebar: DefaultTheme.Sidebar = {
'/tutorials/': [
  {
    text: '实战',
    items: [
      { text: '概览', link: '/tutorials/' },
      { text: '第一个 Agent：资料搜集清单', link: '/tutorials/first-agent-materials-brief' }
    ]
  }
],
}

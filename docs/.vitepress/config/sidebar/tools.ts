import type { DefaultTheme } from 'vitepress'

export const toolsSidebar: DefaultTheme.Sidebar = {
'/tools/': [
  {
    text: '工具导航',
    link: '/tools/'
  },
  {
    text: '热门智能体',
    items: [
      { text: 'Manus', link: '/tools/manus' },
      { text: 'Genspark', link: '/tools/genspark' },
      { text: 'Flowith', link: '/tools/flowith' },
      { text: '扣子', link: '/tools/coze' },
      { text: 'AstronClaw', link: '/tools/astronclaw' },
      { text: 'QoderWork', link: '/tools/qoderwork' },
      { text: 'ChatGPT 智能体', link: '/tools/operator' },
      { text: 'Skywork', link: '/tools/skywork' }
    ]
  }
]
}

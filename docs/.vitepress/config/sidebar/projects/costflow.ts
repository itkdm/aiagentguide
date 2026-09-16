import type { DefaultTheme } from 'vitepress'

export const costflowSidebar: DefaultTheme.Sidebar = {
  '/projects/costflow/': [
    { text: '概览', link: '/projects/costflow/' },
    {
      text: '01｜项目启动',
      collapsed: true,
      items: [
        { text: '01-开发基线', link: '/projects/costflow/01-project-start/01-baseline' },
        { text: '02-准备开发环境', link: '/projects/costflow/01-project-start/02-environment' },
        { text: '03-跑起原项目', link: '/projects/costflow/01-project-start/03-run-project' },
        { text: '04-认识原项目', link: '/projects/costflow/01-project-start/04-original-project' },
        { text: '05-开启 AI 模块', link: '/projects/costflow/01-project-start/05-enable-ai' },
        { text: '06-第一次模型调用', link: '/projects/costflow/01-project-start/06-first-model-call' },
        { text: '07-认识 AI 模块', link: '/projects/costflow/01-project-start/07-ai-module' },
        { text: '08-读懂调用链', link: '/projects/costflow/01-project-start/08-call-chain' },
        { text: '09-找到计费入口', link: '/projects/costflow/01-project-start/09-billing-entry' }
      ]
    },
    {
      text: '02｜确定方案',
      collapsed: true,
      items: [
        {
          text: '01-调研成熟计费系统',
          link: '/projects/costflow/02-solution/01-research-billing-systems'
        }
      ]
    }
  ]
}

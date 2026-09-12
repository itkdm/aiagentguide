import type { DefaultTheme } from 'vitepress'
import { billingSidebar } from './projects/billing.ts'
import { projectCatalog } from '../../../project-catalog.ts'

export const projectsSidebar: DefaultTheme.Sidebar = {
  '/projects/': [
    { text: '概览', link: '/projects/' },
    {
      text: '全部项目',
      items: projectCatalog.map((project) => ({
        text: project.name,
        link: project.href
      }))
    }
  ],
  ...billingSidebar
}

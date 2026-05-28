import type { DefaultTheme } from 'vitepress'
import { toolCatalog, toolCategoryOrder } from '../../../tool-catalog'

export const toolsSidebar: DefaultTheme.Sidebar = {
  '/tools/': [
    {
      text: '工具导航',
      link: '/tools/'
    },
    ...toolCategoryOrder
      .map((category) => {
        const items = toolCatalog
          .filter((tool) => tool.category === category)
          .map((tool) => ({
            text: tool.name,
            link: tool.href
          }))

        if (items.length === 0) {
          return null
        }

        return {
          text: category,
          items
        }
      })
      .filter(Boolean)
  ]
}

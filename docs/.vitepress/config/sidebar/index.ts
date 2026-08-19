import type { DefaultTheme } from 'vitepress'
import { gettingStartedSidebar } from './getting-started'

import { principlesSidebar } from './principles'
import { projectsSidebar } from './projects'
import { ragSidebar } from './rag'

export const siteSidebar: DefaultTheme.Sidebar = {
  ...gettingStartedSidebar,
  ...principlesSidebar,
  ...ragSidebar,
  ...projectsSidebar
}

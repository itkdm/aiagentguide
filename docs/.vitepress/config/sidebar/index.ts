import type { DefaultTheme } from 'vitepress'
import { gettingStartedSidebar } from './getting-started.ts'

import { principlesSidebar } from './principles.ts'
import { projectsSidebar } from './projects.ts'
import { ragSidebar } from './rag.ts'
import { interviewsSidebar } from './interviews.ts'

export const siteSidebar: DefaultTheme.Sidebar = {
  ...gettingStartedSidebar,
  ...principlesSidebar,
  ...ragSidebar,
  ...projectsSidebar,
  ...interviewsSidebar
}

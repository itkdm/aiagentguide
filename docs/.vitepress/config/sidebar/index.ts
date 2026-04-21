import type { DefaultTheme } from 'vitepress'
import { frameworksSidebar } from './frameworks'
import { gettingStartedSidebar } from './getting-started'
import { interviewsSidebar } from './interviews'
import { llmSidebar } from './llm'
import { principlesSidebar } from './principles'
import { projectsSidebar } from './projects'
import { ragSidebar } from './rag'
import { toolsSidebar } from './tools'
import { tutorialsSidebar } from './tutorials'
export const siteSidebar: DefaultTheme.Sidebar = {
  ...gettingStartedSidebar,
  ...principlesSidebar,
  ...frameworksSidebar,
  ...llmSidebar,
  ...ragSidebar,
  ...interviewsSidebar,
  ...tutorialsSidebar,
  ...projectsSidebar,
  ...toolsSidebar
}

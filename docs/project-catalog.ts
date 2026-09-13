export type ProjectStatus = 'planning' | 'in-progress' | 'completed'

export interface ProjectCatalogItem {
  slug: string
  name: string
  href: string
  contentHref: string
  summary: string
  language?: string
  status?: ProjectStatus
}

export const projectCatalog: ProjectCatalogItem[] = [
  {
    slug: 'costflow',
    name: 'CostFlow - AI 应用计费系统',
    href: '/projects/intro/costflow/',
    contentHref: '/projects/costflow/',
    summary: '面向 AI 应用的用量、成本与计费系统',
    language: undefined
  }
]

export function getProjectBySlug(slug: string) {
  return projectCatalog.find((project) => project.slug === slug)
}

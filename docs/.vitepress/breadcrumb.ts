import type { DefaultTheme } from 'vitepress'

export interface BreadcrumbNode {
  text: string
  link: string
}

/**
 * 将任意路径统一为 clean-url 形式：
 * 去掉首尾斜杠、去掉 .html / .md 后缀、合并多余斜杠。
 * 例：'/rag/ch01/index.html' -> 'rag/ch01'
 *     '/' / '' -> ''
 */
export function normalizePath(rawPath?: string): string {
  if (!rawPath || rawPath === '/') {
    return ''
  }

  let path = rawPath.trim()

  // 去掉 base 前缀（如 /repo/）
  if (path.startsWith('/')) {
    path = path.slice(1)
  }

  // 去掉可能残留的查询与 hash
  path = path.split('?')[0].split('#')[0]

  // 先处理 index 页面：/ch01/index.html -> /ch01/
  path = path.replace(/(^|\/)index\.html?$/i, '/')
  path = path.replace(/(^|\/)index\.md$/i, '/')

  // 再去掉剩余的 .html / .md 后缀（非 index 情况）
  path = path.replace(/\.html?$/i, '').replace(/\.md$/i, '')

  // 统一去掉首尾斜杠并压缩多余斜杠
  return path.replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '')
}

type SidebarItem = DefaultTheme.SidebarItem

/**
 * 在 sidebar 子树中递归查找包含 currentPath 的节点链（原始节点）。
 * 返回从顶层 group 到匹配叶子节点的 SidebarItem 数组；找不到返回 null。
 */
function findChain(
  items: SidebarItem[],
  currentPath: string
): SidebarItem[] | null {
  for (const item of items) {
    const itemPath = item.link ? normalizePath(item.link) : ''

    // 精确匹配当前页
    if (itemPath && itemPath === currentPath) {
      return [item]
    }

    if (item.items && item.items.length) {
      const childChain = findChain(item.items, currentPath)
      if (childChain) {
        return [item, ...childChain]
      }
    }
  }

  return null
}

/**
 * 解析某个 group 节点作为面包屑项时的链接。
 * Group 自身通常没有独立 link，应回退到其“概览”子页面或第一个有 link 的子项。
 */
function resolveGroupLink(item: SidebarItem): string {
  const overview = item.items?.find(
    (child) => child.text === '概览' && child.link
  )
  if (overview?.link) {
    return overview.link as string
  }
  const firstLinked = item.items?.find((child) => child.link)
  return (firstLinked?.link as string) || ''
}

/**
 * 构建面包屑层级链（不含“首页”）。
 *
 * 数据来源严格基于 VitePress Sidebar 的实际内容层级，
 * 而不是 URL 字符串拆分，从而展示用户真正理解的知识层级。
 *
 * 处理规则：
 * - 首页 '/' 返回空数组（不渲染面包屑、不生成 JSON-LD）。
 * - 列栏目首页（如 /rag/）：sidebar 中“概览”节点的 link 就是 /rag/，
 *   构造后会多一个“概览”尾节点，这里统一移除，得到 首页 / RAG。
 * - Chapter / Module 概览页同理移除“概览”尾节点，避免重复。
 * - 普通文章（非“概览”文本）即使 link === 当前页也保留为最后一级，
 *   不会被错误删除。
 * - 页面不在 sidebar 时，若有 pageTitle 则回退为 首页 / 当前标题，
 *   否则返回空数组。
 *
 * 该函数为纯函数：不操作 DOM、不访问 window/document、不创建 script。
 * 因此 SSR、客户端 UI、单元测试均可安全调用。
 */
export function buildBreadcrumbChain(
  routePath: string,
  sidebar: DefaultTheme.Sidebar | DefaultTheme.MultiSidebar,
  pageTitle?: string
): BreadcrumbNode[] {
  const currentPath = normalizePath(routePath)

  // 首页不展示面包屑
  if (!currentPath) {
    return []
  }

  // sidebar 缺失（如未配置）时合理 fallback，不抛错
  if (!sidebar) {
    return pageTitle ? [{ text: pageTitle, link: `/${currentPath}` }] : []
  }

  const groups = Array.isArray(sidebar)
    ? sidebar
    : Object.values(sidebar).flatMap((entry) =>
        Array.isArray(entry) ? entry : entry.items ?? []
      )

  const rawChain = findChain(groups as SidebarItem[], currentPath)

  if (!rawChain) {
    // 页面不在任何 sidebar 中：合理 fallback
    if (pageTitle) {
      return [{ text: pageTitle, link: `/${currentPath}` }]
    }
    return []
  }

  // 将原始 sidebar 节点映射为面包屑节点：
  // - 叶子（最后一项）使用自身 link
  // - 中间 group 使用其“概览”子页面或首个有 link 的子项作为跳转目标
  const chain: BreadcrumbNode[] = rawChain.map((node, index) => {
    const isLeaf = index === rawChain.length - 1
    const link = isLeaf
      ? (node.link as string) || ''
      : resolveGroupLink(node)
    return { text: node.text ?? '', link }
  })

  // 移除“概览”尾节点（其 link 等于当前页，语义已被父节点表达）
  if (chain.length > 1) {
    const tail = chain[chain.length - 1]
    if (tail.text === '概览' && normalizePath(tail.link) === currentPath) {
      chain.pop()
    }
  }

  return chain
}

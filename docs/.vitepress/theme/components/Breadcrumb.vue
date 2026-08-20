<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

type SidebarItem = {
  text?: string
  link?: string
  items?: SidebarItem[]
}

const { theme, frontmatter } = useData()
const route = useRoute()

// 首页、栏目聚合页等不需要面包屑的场景
const shouldRender = computed(() => {
  if (frontmatter.value.layout === 'home') {
    return false
  }

  const path = route.path
  if (!path || path === '/' || path === '/index.html') {
    return false
  }

  // 工具类独立页面不一定在侧边栏体系内，且已有自己的导航结构
  const pageClass = frontmatter.value.pageClass
  if (typeof pageClass === 'string') {
    const pageClasses = pageClass.split(/\s+/)
    if (pageClasses.includes('tools-directory') || pageClasses.includes('tool-detail-page')) {
      return false
    }
  }

  return true
})

// 根据当前路径，从某条 sidebar 树中找到一条到达当前 link 的最深路径链
function findPathChain(items: SidebarItem[] | undefined, target: string, trail: SidebarItem[]): SidebarItem[] | null {
  if (!items) {
    return null
  }

  for (const item of items) {
    const nextTrail = [...trail, item]
    const itemLink = normalizeLink(item.link)

    if (itemLink && itemLink === target) {
      return nextTrail
    }

    if (item.items && item.items.length > 0) {
      const childResult = findPathChain(item.items, target, nextTrail)
      if (childResult) {
        return childResult
      }
    }
  }

  return null
}

function normalizeLink(link?: string): string | null {
  if (!link) {
    return null
  }

  let value = link
  if (value.endsWith('/index.html')) {
    value = value.replace(/\/index\.html$/, '/')
  } else if (value.endsWith('.html')) {
    value = value.replace(/\.html$/, '')
  }

  if (!value.startsWith('/')) {
    value = `/${value}`
  }

  return value.replace(/\/+$/, '') || '/'
}

function normalizePath(path: string): string {
  let value = path
  if (value.endsWith('/index.html')) {
    value = value.replace(/\/index\.html$/, '/')
  } else if (value.endsWith('.html')) {
    value = value.replace(/\.html$/, '')
  }

  return (value.replace(/\/+$/, '') || '/').replace(/\/{2,}/g, '/')
}

const breadcrumbItems = computed<SidebarItem[]>(() => {
  if (!shouldRender.value) {
    return []
  }

  const sidebar = theme.value.sidebar as
    | Record<string, SidebarItem[]>
    | SidebarItem[]
    | undefined

  if (!sidebar) {
    return []
  }

  const target = normalizePath(route.path)

  // 侧边栏可能是对象（按路径前缀分组）或数组
  if (Array.isArray(sidebar)) {
    const chain = findPathChain(sidebar, target, [])
    return chain ?? []
  }

  // 对象形式：找到与当前路径最匹配的 key 分组
  const matchingKeys = Object.keys(sidebar)
    .filter((key) => target === key || target.startsWith(key))
    .sort((a, b) => b.length - a.length)

  for (const key of matchingKeys) {
    const chain = findPathChain(sidebar[key], target, [])
    if (chain && chain.length > 0) {
      return chain
    }
  }

  return []
})

// 为没有直接 link 的节点推断一个概览页 link（如果子节点中有“概览”）
function inferLink(item: SidebarItem): string | undefined {
  if (item.link) {
    return normalizeLink(item.link) ?? undefined
  }

  if (!item.items || item.items.length === 0) {
    return undefined
  }

  const overview = item.items.find(
    (child) => child.text === '概览' && child.link
  )
  return overview ? normalizeLink(overview.link) ?? undefined : undefined
}

// 面包屑显示层级：根栏目（如“RAG”）+ 命中的中间节点 + 当前页
const displayItems = computed(() => {
  if (!breadcrumbItems.value.length) {
    return []
  }

  const items = breadcrumbItems.value.map((item) => ({
    text: item.text ?? '',
    link: inferLink(item)
  }))

  // 去掉与当前页完全同名的重复尾节点（如“概览”页）
  const last = items[items.length - 1]
  const current = normalizePath(route.path)
  if (last.link === current && items.length > 1) {
    items.pop()
  }

  return items
})

// 面包屑结构化数据（BreadcrumbList），用于 SEO。
const jsonLd = computed(() => {
  if (!displayItems.value.length) {
    return null
  }

  const siteBase = typeof window !== 'undefined' ? window.location.origin : ''
  const currentPath = normalizePath(route.path)
  const itemListElement = displayItems.value.map((item, index) => {
    const url = item.link ? `${siteBase}${item.link}` : `${siteBase}${currentPath}`
    return {
      '@type': 'ListItem',
      position: index + 1,
      name: item.text,
      item: url
    }
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement
  }
})

// 将结构化数据注入页面 head，便于搜索引擎抓取。
// 因为模板里不能放 <script> 标签，这里在客户端动态插入。
function injectJsonLd() {
  if (typeof document === 'undefined') {
    return
  }

  const existing = document.getElementById('breadcrumb-jsonld')
  if (existing) {
    existing.remove()
  }

  if (!jsonLd.value) {
    return
  }

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'breadcrumb-jsonld'
  script.textContent = JSON.stringify(jsonLd.value)
  document.head.appendChild(script)
}

onMounted(injectJsonLd)

watch(
  () => route.path,
  () => injectJsonLd(),
  { immediate: true }
)

</script>

<template>
  <nav
    v-if="shouldRender && displayItems.length"
    class="doc-breadcrumb"
    aria-label="面包屑导航"
  >
    <a class="doc-breadcrumb-item doc-breadcrumb-home" href="/">
      首页
    </a>

    <template v-for="(item, index) in displayItems" :key="item.link || index">
      <span class="doc-breadcrumb-sep" aria-hidden="true">/</span>
      <a
        v-if="item.link && index < displayItems.length - 1"
        class="doc-breadcrumb-item"
        :href="item.link"
      >
        {{ item.text }}
      </a>
      <span v-else class="doc-breadcrumb-item doc-breadcrumb-current" aria-current="page">
        {{ item.text }}
      </span>
    </template>
  </nav>
</template>

<style scoped>
.doc-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 6px;
  margin: -28px 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider, rgba(60, 60, 60, 0.12));
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2, #57606a);
}

.doc-breadcrumb-item {
  color: var(--vp-c-text-2, #57606a);
  text-decoration: none;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.doc-breadcrumb-home:hover,
.doc-breadcrumb-item:hover {
  color: var(--vp-c-brand-1, #3451b2);
}

.doc-breadcrumb-current {
  color: var(--vp-c-text-1, #213547);
  font-weight: 500;
}

.doc-breadcrumb-sep {
  color: var(--vp-c-divider, rgba(60, 60, 60, 0.3));
  user-select: none;
}

@media (max-width: 640px) {
  .doc-breadcrumb {
    font-size: 12px;
    margin-bottom: 16px;
    padding-bottom: 10px;
  }
}
</style>

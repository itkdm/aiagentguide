<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import type { DefaultTheme } from 'vitepress'
import { buildBreadcrumbChain } from '../../breadcrumb'

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

// 面包屑层级链（不含“首页”），与 seo.ts 共用同一套 Sidebar 派生逻辑。
// 这样可见 Breadcrumb 与 BreadcrumbList JSON-LD 始终保持一致。
const breadcrumbItems = computed(() => {
  if (!shouldRender.value) {
    return []
  }

  const sidebar = theme.value.sidebar as
    | DefaultTheme.Sidebar
    | DefaultTheme.MultiSidebar
    | undefined

  if (!sidebar) {
    return []
  }

  return buildBreadcrumbChain(
    route.path,
    sidebar,
    (frontmatter.value.title as string) || undefined
  )
})

// displayItems 即层级链；最后一项为当前页（不可点击）。
const displayItems = breadcrumbItems

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

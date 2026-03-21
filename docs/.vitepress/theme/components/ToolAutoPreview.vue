<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'

const route = useRoute()
const { frontmatter, title } = useData()

const previewSrc = ref('')
let loadVersion = 0

const isToolDetailPage = computed(() => {
  const pageClass = frontmatter.value.pageClass
  return typeof pageClass === 'string' && pageClass.split(/\s+/).includes('tool-detail-page')
})

const slug = computed(() => {
  if (!isToolDetailPage.value) return ''

  const segments = route.path.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]

  if (!lastSegment || lastSegment === 'tools') {
    return ''
  }

  return lastSegment.replace(/\.html$/, '')
})

const altText = computed(() => `${title.value || slug.value} 页面预览`)

function refreshPreview() {
  previewSrc.value = ''

  if (typeof window === 'undefined' || !slug.value) {
    return
  }

  const currentLoad = ++loadVersion
  const candidates = ['png', 'webp', 'jpg', 'jpeg'].map(
    (extension) => withBase(`/tool/${slug.value}/${slug.value}.${extension}`)
  )

  const tryCandidate = (index: number) => {
    if (index >= candidates.length || currentLoad !== loadVersion) {
      return
    }

    const candidate = candidates[index]
    const image = new Image()

    image.onload = () => {
      if (currentLoad === loadVersion) {
        previewSrc.value = candidate
      }
    }

    image.onerror = () => {
      if (currentLoad === loadVersion) {
        tryCandidate(index + 1)
      }
    }

    image.src = candidate
  }

  tryCandidate(0)
}

onMounted(refreshPreview)

watch(
  [() => route.path, () => frontmatter.value.pageClass],
  () => {
    refreshPreview()
  }
)

onBeforeUnmount(() => {
  loadVersion += 1
})
</script>

<template>
  <div v-if="previewSrc" class="tool-preview">
    <img :src="previewSrc" :alt="altText" loading="lazy" decoding="async" />
  </div>
</template>

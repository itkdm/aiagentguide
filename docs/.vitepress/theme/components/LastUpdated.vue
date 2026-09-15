<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

const lastUpdated = computed(() => {
  const value = frontmatter.value.lastUpdated

  if (!value) {
    return ''
  }

  const rawValue = value instanceof Date ? value.toISOString() : String(value)
  return rawValue.slice(0, 10)
})
</script>

<template>
  <div v-if="lastUpdated" class="last-updated">
    上次更新：<time :datetime="lastUpdated">{{ lastUpdated }}</time>
  </div>
</template>

<style scoped>
.last-updated {
  display: flex;
  justify-content: flex-end;
  margin: 28px 0 12px;
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
}

.last-updated time {
  margin-left: 4px;
  color: var(--vp-c-text-2);
}
</style>

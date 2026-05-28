<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { toolCatalog, toolCategoryOrder } from '../../../tool-catalog'

const groupedTools = computed(() =>
  toolCategoryOrder
    .map((category) => ({
      category,
      tools: toolCatalog.filter((tool) => tool.category === category)
    }))
    .filter((group) => group.tools.length > 0)
)
</script>

<template>
  <div class="tools-directory-sections">
    <section v-for="group in groupedTools" :key="group.category" class="tool-section">
      <h2>{{ group.category }}</h2>
      <div class="tool-grid">
        <a v-for="tool in group.tools" :key="tool.href" class="tool-tile" :href="withBase(tool.href)">
          <span class="tool-tile-logo" :class="tool.logoClass">{{ tool.initials }}</span>
          <div class="tool-tile-body">
            <h3>{{ tool.name }}</h3>
            <p>{{ tool.summary }}</p>
          </div>
        </a>
      </div>
    </section>
  </div>
</template>

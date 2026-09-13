<script setup lang="ts">
import { withBase } from 'vitepress'
import { projectCatalog } from '../../../project-catalog'
</script>

<template>
  <div class="project-list" aria-label="项目列表">
    <a
      v-for="project in projectCatalog"
      :key="project.slug"
      class="project-list-item"
      :href="withBase(project.href)"
    >
      <span class="project-list-copy">
        <strong>{{ project.name }}</strong>
        <span>{{ project.summary }}</span>
        <small v-if="project.language">{{ project.language }}</small>
      </span>
      <span class="project-list-link">查看项目 <span aria-hidden="true">→</span></span>
    </a>
  </div>
</template>

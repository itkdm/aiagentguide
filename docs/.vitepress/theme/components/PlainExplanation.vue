<script setup lang="ts">
import { ref } from 'vue'

const expanded = ref(false)

withDefaults(
  defineProps<{
    title?: string
    label?: string
  }>(),
  {
    title: undefined,
    label: '通俗小解释'
  }
)
</script>

<template>
  <aside class="plain-explanation" role="note" :aria-label="title || label">
    <button
      type="button"
      class="plain-explanation-toggle"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <div class="plain-explanation-mark" aria-hidden="true">
        <span class="plain-explanation-spark">✦</span>
      </div>

      <span class="plain-explanation-label">{{ label }}</span>
      <span v-if="title" class="plain-explanation-title">{{ title }}</span>

      <span class="plain-explanation-chevron" :class="{ expanded }" aria-hidden="true">⌄</span>
    </button>

    <div v-if="expanded" class="plain-explanation-content">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.plain-explanation {
  position: relative;
  display: block;
  margin: 28px 0;
  padding: 16px 18px 17px 16px;
  overflow: hidden;
  border: 1px solid var(--plain-explanation-border);
  border-radius: 16px;
  background: var(--plain-explanation-bg);
  color: var(--vp-c-text-1);
}

.plain-explanation::after {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  background: #f59e0b;
  content: '';
}

.plain-explanation-toggle {
  display: grid;
  grid-template-columns: 36px auto minmax(0, 1fr) 20px;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.plain-explanation-toggle:focus-visible {
  outline: 2px solid var(--plain-explanation-label);
  outline-offset: 5px;
  border-radius: 6px;
}

.plain-explanation-mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  margin-top: 0;
  border: 1px solid var(--plain-explanation-icon-border);
  border-radius: 10px;
  background: var(--plain-explanation-icon-bg);
  color: #d97706;
}

.plain-explanation-spark {
  font-size: 19px;
  line-height: 1;
}

.plain-explanation-chevron {
  align-self: center;
  color: var(--plain-explanation-label);
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  transition: transform 0.2s ease;
}

.plain-explanation-chevron.expanded {
  transform: rotate(180deg);
}

.plain-explanation-content {
  margin: 14px 36px 0 56px;
  padding-top: 13px;
  border-top: 1px solid var(--plain-explanation-border);
}

.plain-explanation-label {
  display: inline-flex;
  align-items: center;
  color: var(--plain-explanation-label);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  line-height: 1.3;
}

.plain-explanation-title {
  display: inline-flex;
  align-items: center;
  color: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
}

.plain-explanation-content :deep(p:first-child) {
  margin-top: 0;
}

.plain-explanation-content :deep(p:last-child) {
  margin-bottom: 0;
}

.plain-explanation-content :deep(p),
.plain-explanation-content :deep(ul),
.plain-explanation-content :deep(ol) {
  color: var(--plain-explanation-text);
  font-size: 14px;
  line-height: 1.8;
}

.plain-explanation-content :deep(code) {
  border-color: var(--plain-explanation-code-border);
  background: var(--plain-explanation-code-bg);
  color: var(--plain-explanation-code);
}

.plain-explanation-content :deep(strong) {
  color: var(--vp-c-text-1);
}

:global(:root) {
  --plain-explanation-bg: #fffaf0;
  --plain-explanation-border: #f5d9a6;
  --plain-explanation-icon-bg: #fff2cf;
  --plain-explanation-icon-border: #f8d78e;
  --plain-explanation-label: #b45309;
  --plain-explanation-text: #57534e;
  --plain-explanation-code-bg: rgb(251 191 36 / 16%);
  --plain-explanation-code-border: rgb(217 119 6 / 18%);
  --plain-explanation-code: #9a3412;
}

:global(.dark) {
  --plain-explanation-bg: #211b12;
  --plain-explanation-border: rgb(245 158 11 / 28%);
  --plain-explanation-icon-bg: rgb(245 158 11 / 13%);
  --plain-explanation-icon-border: rgb(245 158 11 / 28%);
  --plain-explanation-label: #fbbf24;
  --plain-explanation-text: #d6d3d1;
  --plain-explanation-code-bg: rgb(245 158 11 / 15%);
  --plain-explanation-code-border: rgb(251 191 36 / 22%);
  --plain-explanation-code: #fbbf24;
}

@media (max-width: 640px) {
  .plain-explanation {
    margin: 22px 0;
    padding: 15px 15px 16px 14px;
    border-radius: 14px;
  }

  .plain-explanation-toggle {
    grid-template-columns: 32px auto minmax(0, 1fr) 18px;
    gap: 10px;
  }

  .plain-explanation-mark {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }

  .plain-explanation-spark {
    font-size: 18px;
  }

  .plain-explanation-content {
    margin: 12px 0 0 45px;
    padding-top: 11px;
  }
}
</style>

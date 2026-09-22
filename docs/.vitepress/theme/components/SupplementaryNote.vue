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
    label: '补充说明'
  }
)
</script>

<template>
  <aside class="supplementary-note" role="note" :aria-label="title || label">
    <button
      type="button"
      class="supplementary-note-toggle"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <div class="supplementary-note-mark" aria-hidden="true">
        <span class="supplementary-note-symbol">i</span>
      </div>

      <span class="supplementary-note-label">{{ label }}</span>
      <span v-if="title" class="supplementary-note-title">{{ title }}</span>

      <span class="supplementary-note-chevron" :class="{ expanded }" aria-hidden="true">⌄</span>
    </button>

    <div v-if="expanded" class="supplementary-note-content">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.supplementary-note {
  position: relative;
  display: block;
  margin: 28px 0;
  padding: 16px 18px 17px 16px;
  overflow: hidden;
  border: 1px solid var(--supplementary-note-border);
  border-radius: 16px;
  background: var(--supplementary-note-bg);
  color: var(--vp-c-text-1);
}

.supplementary-note::after {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  background: #2563eb;
  content: '';
}

.supplementary-note-toggle {
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

.supplementary-note-toggle:focus-visible {
  outline: 2px solid var(--supplementary-note-label);
  outline-offset: 5px;
  border-radius: 6px;
}

.supplementary-note-mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--supplementary-note-icon-border);
  border-radius: 10px;
  background: var(--supplementary-note-icon-bg);
  color: #1d4ed8;
}

.supplementary-note-symbol {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border: 1.5px solid currentColor;
  border-radius: 50%;
  font-family: Georgia, serif;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.supplementary-note-chevron {
  align-self: center;
  color: var(--supplementary-note-label);
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  transition: transform 0.2s ease;
}

.supplementary-note-chevron.expanded {
  transform: rotate(180deg);
}

.supplementary-note-content {
  margin: 14px 36px 0 56px;
  padding-top: 13px;
  border-top: 1px solid var(--supplementary-note-border);
}

.supplementary-note-label {
  display: inline-flex;
  align-items: center;
  color: var(--supplementary-note-label);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  line-height: 1.3;
}

.supplementary-note-title {
  display: inline-flex;
  align-items: center;
  color: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
}

.supplementary-note-content :deep(p:first-child) {
  margin-top: 0;
}

.supplementary-note-content :deep(p:last-child) {
  margin-bottom: 0;
}

.supplementary-note-content :deep(p),
.supplementary-note-content :deep(ul),
.supplementary-note-content :deep(ol) {
  color: var(--supplementary-note-text);
  font-size: 14px;
  line-height: 1.8;
}

.supplementary-note-content :deep(code) {
  border-color: var(--supplementary-note-code-border);
  background: var(--supplementary-note-code-bg);
  color: var(--supplementary-note-code);
}

:global(:root) {
  --supplementary-note-bg: #f4f8ff;
  --supplementary-note-border: #c9dcff;
  --supplementary-note-icon-bg: #e8f0ff;
  --supplementary-note-icon-border: #b8d0ff;
  --supplementary-note-label: #1d4ed8;
  --supplementary-note-text: #334155;
  --supplementary-note-code-bg: rgb(37 99 235 / 10%);
  --supplementary-note-code-border: rgb(37 99 235 / 18%);
  --supplementary-note-code: #1e40af;
}

:global(.dark) {
  --supplementary-note-bg: #111c33;
  --supplementary-note-border: rgb(96 165 250 / 28%);
  --supplementary-note-icon-bg: rgb(59 130 246 / 15%);
  --supplementary-note-icon-border: rgb(96 165 250 / 30%);
  --supplementary-note-label: #93c5fd;
  --supplementary-note-text: #cbd5e1;
  --supplementary-note-code-bg: rgb(96 165 250 / 15%);
  --supplementary-note-code-border: rgb(147 197 253 / 24%);
  --supplementary-note-code: #bfdbfe;
}

@media (max-width: 640px) {
  .supplementary-note {
    margin: 22px 0;
    padding: 15px 15px 16px 14px;
    border-radius: 14px;
  }

  .supplementary-note-toggle {
    grid-template-columns: 32px auto minmax(0, 1fr) 18px;
    gap: 10px;
  }

  .supplementary-note-mark {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }

  .supplementary-note-content {
    margin: 12px 0 0 45px;
    padding-top: 11px;
  }
}
</style>

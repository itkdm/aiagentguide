<script setup lang="ts">
import { ref, useId } from 'vue'

const expanded = ref(false)
const contentId = useId()

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
  <aside class="plain-explanation" :class="{ 'is-expanded': expanded }" role="note" :aria-label="title || label">
    <button
      type="button"
      class="plain-explanation-toggle"
      :aria-expanded="expanded"
      :aria-controls="contentId"
      @click="expanded = !expanded"
    >
      <span class="plain-explanation-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M14.6 14.4c.25-1.1.85-1.9 1.6-2.7a5.2 5.2 0 1 0-8.4 0c.75.8 1.35 1.6 1.6 2.7"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path d="M9.4 17.6h5.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          <path d="M10.4 20.4h3.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </span>

      <span class="plain-explanation-label" :class="{ 'has-divider': title }">{{ label }}</span>
      <span v-if="title" class="plain-explanation-title">{{ title }}</span>

      <span class="plain-explanation-chevron" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none">
          <path
            d="m4.5 6.5 3.5 3.5 3.5-3.5"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>

    <Transition name="plain-explanation-reveal">
      <div v-if="expanded" :id="contentId" class="plain-explanation-content">
        <slot />
      </div>
    </Transition>
  </aside>
</template>

<style scoped>
.plain-explanation {
  position: relative;
  display: block;
  margin: 28px 0;
  overflow: hidden;
  border: 1px solid var(--plain-explanation-border);
  border-radius: 14px;
  background: var(--plain-explanation-bg);
  color: var(--vp-c-text-1);
  transition: border-color 0.2s ease;
}

@media (hover: hover) {
  .plain-explanation:hover {
    border-color: var(--plain-explanation-border-hover);
  }
}

.plain-explanation-toggle {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 13px 14px 13px 17px;
  border: 0;
  border-radius: 13px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  appearance: none;
}

.plain-explanation-toggle:focus-visible {
  outline: 2px solid var(--plain-explanation-focus);
  outline-offset: -3px;
}

.plain-explanation-mark {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 19px;
  height: 19px;
  color: var(--plain-explanation-icon);
  transition: color 0.2s ease;
}

.plain-explanation-mark svg {
  width: 19px;
  height: 19px;
}

@media (hover: hover) {
  .plain-explanation-toggle:hover .plain-explanation-mark {
    color: var(--plain-explanation-icon-hover);
  }
}

.plain-explanation-label {
  flex: 0 0 auto;
  color: var(--plain-explanation-label);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.4;
  white-space: nowrap;
}

.plain-explanation-label.has-divider {
  padding-right: 12px;
  border-right: 1px solid var(--plain-explanation-divider);
}

.plain-explanation-title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(--vp-c-text-1);
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plain-explanation-chevron {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 24px;
  height: 24px;
  margin-left: 2px;
  border-radius: 7px;
  color: var(--plain-explanation-chevron);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.24s cubic-bezier(0.4, 0, 0.2, 1);
}

.plain-explanation-chevron svg {
  width: 15px;
  height: 15px;
}

.plain-explanation.is-expanded .plain-explanation-chevron {
  transform: rotate(180deg);
}

@media (hover: hover) {
  .plain-explanation-toggle:hover .plain-explanation-chevron {
    background-color: var(--plain-explanation-chevron-hover-bg);
    color: var(--plain-explanation-icon-hover);
  }
}

/* Body aligns with the label column (17px padding + 19px icon + 12px gap). */
.plain-explanation-content {
  margin: 0 16px 16px 48px;
  padding-top: 13px;
  border-top: 1px solid var(--plain-explanation-divider);
  color: var(--plain-explanation-text);
  font-size: 14px;
  line-height: 1.85;
}

.plain-explanation-reveal-enter-active,
.plain-explanation-reveal-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.plain-explanation-reveal-enter-from,
.plain-explanation-reveal-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.plain-explanation-content :deep(p) {
  margin: 10px 0;
  color: var(--plain-explanation-text);
  font-size: 14px;
  line-height: 1.85;
}

.plain-explanation-content :deep(p:first-child) {
  margin-top: 0;
}

.plain-explanation-content :deep(p:last-child) {
  margin-bottom: 0;
}

.plain-explanation-content :deep(strong) {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.plain-explanation-content :deep(ul) {
  margin: 10px 0;
  padding-left: 18px;
}

.plain-explanation-content :deep(ul > li) {
  margin: 5px 0;
  padding-left: 2px;
}

.plain-explanation-content :deep(ul > li)::marker {
  color: var(--plain-explanation-marker);
}

/* Native markers keep the author's numbering (incl. lists split by code blocks);
   they hang in the gutter so step text lines up with the paragraphs above. */
.plain-explanation-content :deep(ol) {
  margin: 12px 0;
  padding-left: 0;
  list-style: decimal outside;
}

.plain-explanation-content :deep(ol > li) {
  margin: 9px 0;
  padding-left: 0;
}

.plain-explanation-content :deep(ol > li)::marker {
  color: var(--plain-explanation-marker);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* Neutralise VitePress's own block chrome: no lang badge, no double background. */
.plain-explanation-content :deep(div[class*='language-']) {
  margin: 12px 0;
  overflow: hidden;
  border: 1px solid var(--plain-explanation-code-border);
  border-radius: 10px;
  background: var(--plain-explanation-code-bg);
  box-shadow: none;
}

.plain-explanation-content :deep(div[class*='language-'] > span.lang) {
  display: none;
}

.plain-explanation-content :deep(div[class*='language-'] pre) {
  margin: 0;
  padding: 12px 14px;
  background-color: transparent !important;
}

.plain-explanation-content :deep(div[class*='language-'] code) {
  color: var(--plain-explanation-code-text);
  font-size: 12.5px;
  line-height: 1.75;
}

.plain-explanation-content :deep(div[class*='language-'] > button.copy) {
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.plain-explanation-content :deep(div[class*='language-']:hover > button.copy) {
  opacity: 1;
}

.plain-explanation-content :deep(:not(pre) > code) {
  padding: 2px 5px;
  border: 1px solid var(--plain-explanation-inline-border);
  border-radius: 5px;
  background: var(--plain-explanation-inline-bg);
  color: var(--plain-explanation-inline-text);
  font-size: 12.8px;
}

.plain-explanation-content :deep(blockquote) {
  margin: 12px 0;
  padding: 2px 0 2px 14px;
  border-left: 2px solid var(--plain-explanation-divider);
}

.plain-explanation-content :deep(blockquote p) {
  color: var(--plain-explanation-text);
}

@media (prefers-reduced-motion: reduce) {
  .plain-explanation,
  .plain-explanation-mark,
  .plain-explanation-chevron,
  .plain-explanation-reveal-enter-active,
  .plain-explanation-reveal-leave-active {
    transition: none;
  }
}

:global(:root) {
  --plain-explanation-bg: #fbfbfc;
  --plain-explanation-border: rgb(15 23 42 / 8%);
  --plain-explanation-border-hover: rgb(15 23 42 / 16%);
  --plain-explanation-icon: #475569;
  --plain-explanation-icon-hover: #334155;
  --plain-explanation-label: #475569;
  --plain-explanation-chevron: #94a3b8;
  --plain-explanation-chevron-hover-bg: rgb(15 23 42 / 5%);
  --plain-explanation-divider: rgb(15 23 42 / 9%);
  --plain-explanation-text: #475569;
  --plain-explanation-marker: #7c8798;
  --plain-explanation-code-bg: rgb(15 23 42 / 3.5%);
  --plain-explanation-code-border: rgb(15 23 42 / 7%);
  --plain-explanation-code-text: #334155;
  --plain-explanation-inline-bg: rgb(15 23 42 / 5%);
  --plain-explanation-inline-border: rgb(15 23 42 / 6%);
  --plain-explanation-inline-text: #334155;
  --plain-explanation-focus: rgb(37 99 235 / 45%);
}

:global(.dark) {
  --plain-explanation-bg: #1f2024;
  --plain-explanation-border: rgb(255 255 255 / 9%);
  --plain-explanation-border-hover: rgb(255 255 255 / 17%);
  --plain-explanation-icon: #9aa3b2;
  --plain-explanation-icon-hover: #cbd5e1;
  --plain-explanation-label: #9aa3b2;
  --plain-explanation-chevron: #78828f;
  --plain-explanation-chevron-hover-bg: rgb(255 255 255 / 7%);
  --plain-explanation-divider: rgb(255 255 255 / 8%);
  --plain-explanation-text: #c2c8d2;
  --plain-explanation-marker: #7c8698;
  --plain-explanation-code-bg: rgb(255 255 255 / 4%);
  --plain-explanation-code-border: rgb(255 255 255 / 8%);
  --plain-explanation-code-text: #ccd2dc;
  --plain-explanation-inline-bg: rgb(255 255 255 / 7%);
  --plain-explanation-inline-border: rgb(255 255 255 / 8%);
  --plain-explanation-inline-text: #e2e8f0;
  --plain-explanation-focus: rgb(96 165 250 / 55%);
}

@media (max-width: 640px) {
  .plain-explanation {
    margin: 22px 0;
    border-radius: 12px;
  }

  .plain-explanation-toggle {
    gap: 9px;
    padding: 11px 12px 11px 15px;
    border-radius: 11px;
  }

  .plain-explanation-mark,
  .plain-explanation-mark svg {
    width: 16px;
    height: 16px;
  }

  .plain-explanation-label {
    font-size: 11px;
  }

  .plain-explanation-title {
    font-size: 13.5px;
  }

  .plain-explanation-chevron {
    width: 22px;
    height: 22px;
  }

  .plain-explanation-content {
    margin: 0 12px 14px;
    padding-top: 11px;
  }

  /* No gutter on small screens, so numbers go back inside the text column. */
  .plain-explanation-content :deep(ol) {
    padding-left: 1.5em;
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    title?: string
  }>(),
  {
    title: '提示词'
  }
)

const isOpen = ref(false)
const copied = ref(false)
const promptContent = ref<HTMLElement | null>(null)

async function copyPrompt() {
  const text = promptContent.value?.innerText.trim()

  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1800)
  } catch (error) {
    console.error('Copy prompt failed', error)
  }
}
</script>

<template>
  <section class="prompt-block" :class="{ 'is-open': isOpen }">
    <div class="prompt-block-header">
      <button
        type="button"
        class="prompt-block-toggle"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        <span class="prompt-block-title">
          <span class="prompt-block-label">{{ title }}</span>
          <span class="prompt-block-state">{{ isOpen ? '收起' : '展开查看' }}</span>
        </span>
      </button>

      <button v-if="isOpen" type="button" class="prompt-block-copy prompt-block-copy-top" @click="copyPrompt">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="5.5" y="5.5" width="7" height="7" rx="1.25" />
          <path d="M10.5 5.5V4.25A1.25 1.25 0 0 0 9.25 3h-5A1.25 1.25 0 0 0 3 4.25v5A1.25 1.25 0 0 0 4.25 10.5H5.5" />
        </svg>
        {{ copied ? '已复制' : '复制提示词' }}
      </button>

      <svg class="prompt-block-chevron" viewBox="0 0 16 16" aria-hidden="true">
        <path d="m4 6 4 4 4-4" />
      </svg>
    </div>

    <div v-show="isOpen" ref="promptContent" class="prompt-block-content">
      <slot />
    </div>

  </section>
</template>

<style scoped>
.prompt-block {
  margin: 28px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}

.prompt-block-header {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 54px;
  padding-right: 12px;
}

.prompt-block-toggle {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding: 0 18px;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  text-align: left;
  cursor: pointer;
}

.prompt-block-toggle:hover {
  background: var(--vp-c-bg-mute);
}

.prompt-block-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.prompt-block-label {
  font-size: 15px;
  font-weight: 650;
}

.prompt-block-state {
  color: var(--vp-c-text-3);
  font-size: 13px;
  font-weight: 400;
}

.prompt-block-chevron {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  margin-right: 18px;
  fill: none;
  stroke: var(--vp-c-text-3);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
  transition: transform 0.2s ease;
}

.prompt-block.is-open .prompt-block-chevron {
  transform: rotate(180deg);
}

.prompt-block-content {
  padding: 0 18px 18px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.prompt-block-content :deep(p:first-child) {
  margin-top: 18px;
}

.prompt-block-content :deep(p:last-child) {
  margin-bottom: 0;
}

.prompt-block-content :deep(ol),
.prompt-block-content :deep(ul) {
  margin-top: 10px;
  margin-bottom: 16px;
}

.prompt-block-content :deep(pre) {
  margin: 16px 0;
}

.prompt-block-copy {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 13px;
  cursor: pointer;
}

.prompt-block-copy-top {
  flex: 0 0 auto;
}

.prompt-block-copy:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.prompt-block-copy svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.25;
}

@media (max-width: 640px) {
  .prompt-block-header {
    align-items: stretch;
    flex-wrap: wrap;
    padding-right: 0;
  }

  .prompt-block-chevron {
    margin: 19px 18px 0 0;
  }

  .prompt-block-copy-top {
    margin: 0 12px 10px auto;
  }

  .prompt-block-title {
    gap: 7px;
  }

  .prompt-block-state {
    font-size: 12px;
  }
}
</style>

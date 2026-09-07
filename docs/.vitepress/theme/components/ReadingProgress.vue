<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const { frontmatter } = useData()
const route = useRoute()

const progress = ref(0)
const isVisible = ref(false)
const isFocused = ref(false)
let frameId: number | null = null
let resizeObserver: ResizeObserver | null = null

const shouldRender = computed(() => frontmatter.value.layout !== 'home')
const progressLabel = computed(() => `当前阅读进度 ${Math.round(progress.value * 100)}%，回到顶部`)

function updateProgress() {
  frameId = null

  const documentElement = document.documentElement
  const scrollableHeight = documentElement.scrollHeight - window.innerHeight
  const nextProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0

  progress.value = Math.min(1, Math.max(0, nextProgress))
  isVisible.value = window.scrollY > 160
}

function scheduleProgressUpdate() {
  if (frameId !== null) {
    return
  }

  frameId = window.requestAnimationFrame(updateProgress)
}

function scrollToTop() {
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  window.scrollTo({ top: 0, behavior })
}

onMounted(() => {
  window.addEventListener('scroll', scheduleProgressUpdate, { passive: true })
  window.addEventListener('resize', scheduleProgressUpdate, { passive: true })
  resizeObserver = new ResizeObserver(scheduleProgressUpdate)
  resizeObserver.observe(document.body)
  updateProgress()
})

watch(
  () => route.path,
  () => {
    nextTick(updateProgress)
  }
)

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleProgressUpdate)
  window.removeEventListener('resize', scheduleProgressUpdate)
  resizeObserver?.disconnect()

  if (frameId !== null) {
    window.cancelAnimationFrame(frameId)
  }
})
</script>

<template>
  <button
    v-if="shouldRender"
    class="reading-progress"
    :class="{ 'is-hidden': !isVisible && !isFocused }"
    type="button"
    :aria-label="progressLabel"
    :aria-hidden="!isVisible && !isFocused"
    :tabindex="isVisible || isFocused ? 0 : -1"
    title="回到顶部"
    @focus="isFocused = true"
    @blur="isFocused = false"
    @click="scrollToTop"
  >
    <svg class="reading-progress-ring" viewBox="0 0 40 40" aria-hidden="true">
      <circle class="reading-progress-track" cx="20" cy="20" r="18" pathLength="100" />
      <circle
        class="reading-progress-value"
        cx="20"
        cy="20"
        r="18"
        pathLength="100"
        :style="{ strokeDashoffset: `${100 - progress * 100}` }"
      />
    </svg>
    <svg class="reading-progress-arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 18V6M6.5 11.5 12 6l5.5 5.5M6 18h12" />
    </svg>
  </button>
</template>

<style scoped>
.reading-progress {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 11;
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: var(--vp-c-brand-1);
  background: transparent;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
  cursor: pointer;
  opacity: 1;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.reading-progress.is-hidden {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.92);
}

.reading-progress:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
}

.reading-progress:focus-visible {
  outline: 3px solid var(--vp-c-brand-soft);
  outline-offset: 3px;
}

.reading-progress-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.reading-progress-track,
.reading-progress-value {
  fill: none;
  stroke-width: 3;
}

.reading-progress-track {
  stroke: var(--vp-c-divider, rgba(148, 163, 184, 0.28));
}

.reading-progress-value {
  stroke: var(--vp-c-brand-1);
  stroke-linecap: round;
  stroke-dasharray: 100;
  transition: stroke-dashoffset 0.12s linear;
}

.reading-progress-arrow {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

@media (max-width: 640px) {
  .reading-progress {
    right: 16px;
    bottom: max(16px, env(safe-area-inset-bottom));
    width: 48px;
    height: 48px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reading-progress,
  .reading-progress-value {
    transition: none;
  }
}
</style>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import announcement from '../../data/announcement.json'

type AnnouncementItem =
  | { type: 'text'; value: string }
  | { type: 'link'; label: string; href: string; target?: 'self' | 'blank' }

const dismissedStorageKey = 'aiagentguide:dismissed-announcement'
const isReady = ref(false)
const isDismissed = ref(false)
const hasScrolled = ref(false)
const announcementElement = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null

const announcementId = computed(() => announcement.id.trim())
const isVisible = computed(
  () =>
    isReady.value &&
    announcement.enabled &&
    Boolean(announcementId.value) &&
    !isDismissed.value &&
    !hasScrolled.value
)
const content = computed(() => announcement.content as AnnouncementItem[])

function isExternalLink(href: string) {
  return /^(https?:|mailto:|tel:|\/\/)/i.test(href)
}

function isSupportedHref(href: string) {
  return isExternalLink(href) || /^(\/|\.\.?\/|#)/.test(href)
}

function resolveHref(href: string) {
  if (!isSupportedHref(href)) {
    return '#'
  }

  return isExternalLink(href) ? href : withBase(href)
}

function resolveTarget(item: Extract<AnnouncementItem, { type: 'link' }>) {
  if (item.target === 'blank' || (!item.target && isExternalLink(item.href))) {
    return '_blank'
  }

  return undefined
}

function resolveRel(item: Extract<AnnouncementItem, { type: 'link' }>) {
  return resolveTarget(item) === '_blank' ? 'noopener noreferrer' : undefined
}

function dismiss() {
  isDismissed.value = true

  try {
    window.localStorage.setItem(dismissedStorageKey, announcementId.value)
  } catch {
    // 隐私模式或浏览器策略禁止 localStorage 时，本次会话仍然可以关闭公告。
  }
}

function updateLayoutTopHeight() {
  const height = announcementElement.value?.getBoundingClientRect().height ?? 0
  document.documentElement.style.setProperty('--vp-layout-top-height', `${height}px`)
}

function clearLayoutTopHeight() {
  document.documentElement.style.removeProperty('--vp-layout-top-height')
}

function handleScroll() {
  hasScrolled.value = window.scrollY > 8
}

onMounted(() => {
  hasScrolled.value = window.scrollY > 8

  try {
    isDismissed.value = window.localStorage.getItem(dismissedStorageKey) === announcementId.value
  } catch {
    isDismissed.value = false
  }

  isReady.value = true
  window.addEventListener('scroll', handleScroll, { passive: true })
})

watch(isVisible, async (visible) => {
  await nextTick()

  if (visible) {
    updateLayoutTopHeight()
    resizeObserver?.disconnect()
    resizeObserver = new ResizeObserver(updateLayoutTopHeight)
    if (announcementElement.value) {
      resizeObserver.observe(announcementElement.value)
    }
  } else {
    resizeObserver?.disconnect()
    resizeObserver = null
    clearLayoutTopHeight()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  resizeObserver?.disconnect()
  clearLayoutTopHeight()
})
</script>

<template>
  <div
    v-if="isVisible"
    ref="announcementElement"
    class="announcement-bar"
    role="region"
    aria-label="网站公告"
    aria-live="polite"
  >
    <div class="announcement-inner">
      <p class="announcement-content">
        <template v-for="(item, index) in content" :key="`${item.type}-${index}`">
          <span v-if="item.type === 'text'">{{ item.value }}</span>
          <a
            v-else
            class="announcement-link"
            :href="resolveHref(item.href)"
            :target="resolveTarget(item)"
            :rel="resolveRel(item)"
            @click="dismiss"
          >{{ item.label }}</a>
        </template>
      </p>
      <button class="announcement-close" type="button" aria-label="关闭网站公告" title="关闭公告" @click="dismiss">
        <span aria-hidden="true">×</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.announcement-bar {
  position: relative;
  z-index: 30;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(248, 250, 252, 0.96);
  color: #1e293b;
  backdrop-filter: blur(12px);
}

.announcement-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 6px 56px 6px 16px;
}

.announcement-content {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  text-align: center;
}

.announcement-link {
  color: var(--vp-c-brand-1);
  font-weight: 600;
  text-underline-offset: 3px;
}

.announcement-link:hover {
  color: var(--vp-c-brand-2);
}

.announcement-close {
  position: absolute;
  top: 50%;
  right: 16px;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  font-size: 1.8rem;
  line-height: 1;
  transform: translateY(-50%);
  cursor: pointer;
  transition: color 0.2s ease;
}

.announcement-close:hover {
  background: transparent;
  color: #60a5fa;
}

.announcement-close:focus-visible {
  outline: 3px solid var(--vp-c-brand-soft);
  outline-offset: 2px;
}

.dark .announcement-bar {
  border-bottom-color: rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.94);
  color: #dbeafe;
}

.dark .announcement-close {
  color: #94a3b8;
}

.dark .announcement-close:hover {
  background: transparent;
  color: #93c5fd;
}

@media (max-width: 640px) {
  .announcement-inner {
    min-height: 42px;
    padding-right: 48px;
  }

  .announcement-content {
    font-size: 0.82rem;
  }

  .announcement-close {
    right: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .announcement-close {
    transition: none;
  }
}
</style>

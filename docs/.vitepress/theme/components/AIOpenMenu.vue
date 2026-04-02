<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type ProviderAction = 'direct' | 'copy_then_open'

type Provider = {
  id: string
  name: string
  description: string
  badge: string
  action: ProviderAction
  buildHref: (prompt: string) => string
}

const SITE_ORIGIN = 'https://aiagentguide.cn'

const providers: Provider[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: '在 ChatGPT 中打开',
    badge: 'CG',
    action: 'direct',
    buildHref: (prompt) => `https://chatgpt.com/?prompt=${encodeURIComponent(prompt)}`
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: '在 Gemini 中打开',
    badge: 'GM',
    action: 'direct',
    buildHref: (prompt) => `https://ai.studio/prompts/new_chat?prompt=${encodeURIComponent(prompt)}`
  },
  {
    id: 'doubao',
    name: '豆包',
    description: '复制提问内容后打开官网',
    badge: '豆',
    action: 'copy_then_open',
    buildHref: () => 'https://www.doubao.com/chat/'
  },
  {
    id: 'qwen',
    name: '千问',
    description: '复制提问内容后打开官网',
    badge: 'QW',
    action: 'copy_then_open',
    buildHref: () => 'https://www.qianwen.com/?ch=tongyi_redirect'
  }
]

const isOpen = ref(false)
const currentPath = ref('/')
const rootRef = ref<HTMLElement | null>(null)
const copiedProviderId = ref<string | null>(null)
let copiedTimer: number | undefined

const canonicalPageUrl = computed(() => `${SITE_ORIGIN}${currentPath.value}`)

const currentPagePrompt = computed(() => {
  return `请阅读这个页面：${canonicalPageUrl.value}，我想基于这个页面内容继续提问。`
})

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function markCopied(providerId: string) {
  copiedProviderId.value = providerId

  if (copiedTimer) {
    window.clearTimeout(copiedTimer)
  }

  copiedTimer = window.setTimeout(() => {
    copiedProviderId.value = null
  }, 1800)
}

async function copyPrompt() {
  await navigator.clipboard.writeText(currentPagePrompt.value)
}

async function handleProviderClick(provider: Provider) {
  const href = provider.buildHref(currentPagePrompt.value)

  if (provider.action === 'copy_then_open') {
    try {
      await copyPrompt()
      markCopied(provider.id)
    } catch {
      return
    }
  }

  window.open(href, '_blank', 'noopener,noreferrer')
  closeMenu()
}

function onDocumentClick(event: MouseEvent) {
  if (!rootRef.value) {
    return
  }

  const target = event.target
  if (target instanceof Node && !rootRef.value.contains(target)) {
    closeMenu()
  }
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

onMounted(() => {
  currentPath.value = `${window.location.pathname}${window.location.search}${window.location.hash}`
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  if (copiedTimer) {
    window.clearTimeout(copiedTimer)
  }

  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<template>
  <div ref="rootRef" class="ai-open-menu">
    <button
      class="ai-open-menu-trigger"
      type="button"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-haspopup="menu"
      @click="toggleMenu"
    >
      <span class="ai-open-menu-trigger-icon">AI</span>
      <span class="ai-open-menu-trigger-caret" :class="{ 'is-open': isOpen }">▾</span>
    </button>

    <div v-if="isOpen" class="ai-open-menu-panel" role="menu" aria-label="在 AI 中打开">
      <button
        v-for="provider in providers"
        :key="provider.id"
        class="ai-open-menu-item"
        type="button"
        role="menuitem"
        @click="handleProviderClick(provider)"
      >
        <span class="ai-open-menu-item-badge">{{ provider.badge }}</span>
        <span class="ai-open-menu-item-body">
          <span class="ai-open-menu-item-title-row">
            <span class="ai-open-menu-item-title">{{ provider.name }}</span>
            <span v-if="copiedProviderId === provider.id" class="ai-open-menu-item-copied">已复制</span>
          </span>
          <span class="ai-open-menu-item-desc">{{ provider.description }}</span>
        </span>
      </button>
    </div>
  </div>
</template>



<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vitepress'
import { watch } from 'vue'
import { contentAccessConfig, readContentAccess, saveContentAccess, verifyContentAccessCode } from '../contentAccess'

const root = ref<HTMLElement | null>(null)
const code = ref('')
const isVerified = ref(false)
const isVerifying = ref(false)
const feedback = ref('')
const feedbackType = ref<'error' | 'success' | ''>('')
const hasLock = ref(false)
let hiddenBlocks: HTMLElement[] = []
const route = useRoute()

function clearHiddenBlocks() {
  hiddenBlocks.forEach((block) => block.classList.remove('content-lock-hidden'))
  hiddenBlocks = []
}

function applyLock() {
  const content = document.querySelector<HTMLElement>('.vp-doc')
  if (!content || !root.value) {
    return
  }

  const contentRoot = (content.firstElementChild as HTMLElement | null) ?? content
  const blocks = Array.from(contentRoot.children) as HTMLElement[]
  if (blocks.length < 5) {
    return
  }

  const visibleCount = Math.min(blocks.length - 1, Math.max(3, Math.ceil(blocks.length * 0.4)))
  hiddenBlocks = blocks.slice(visibleCount)
  hiddenBlocks.forEach((block) => block.classList.add('content-lock-hidden'))
  contentRoot.insertBefore(root.value, hiddenBlocks[0])
  hasLock.value = true
}

function unlock() {
  clearHiddenBlocks()
  feedbackType.value = 'success'
  feedback.value = '验证成功，完整内容已解锁。'
  saveContentAccess()
  window.setTimeout(() => {
    isVerified.value = true
  }, 1200)
}

async function submit() {
  if (isVerifying.value || !code.value.trim()) {
    return
  }

  isVerifying.value = true
  feedback.value = ''
  feedbackType.value = ''

  try {
    if (await verifyContentAccessCode(code.value)) {
      unlock()
    } else {
      feedbackType.value = 'error'
      feedback.value = '验证码不正确，请检查后重新输入。'
    }
  } finally {
    isVerifying.value = false
  }
}

onMounted(async () => {
  isVerified.value = readContentAccess()
  if (!isVerified.value && contentAccessConfig.enabled) {
    await nextTick()
    applyLock()
  }
})

watch(
  () => route.path,
  async () => {
    clearHiddenBlocks()
    hasLock.value = false
    if (!isVerified.value && contentAccessConfig.enabled) {
      await nextTick()
      applyLock()
    }
  }
)
</script>

<template>
  <div v-if="contentAccessConfig.enabled && !isVerified" ref="root" class="content-lock-card" :class="{ 'content-lock-pending': !hasLock }" role="region" aria-labelledby="content-lock-title">
    <div class="content-lock-body">
      <h2 id="content-lock-title">解锁完整内容</h2>
      <p class="content-lock-instruction">
        扫码关注「{{ contentAccessConfig.wechatName }}」公众号<br />
        回复「{{ contentAccessConfig.keyword }}」获取验证码
      </p>
      <img v-if="contentAccessConfig.qrCodeSrc" class="content-lock-qr" :src="contentAccessConfig.qrCodeSrc" alt="微信公众号二维码" />
      <form class="content-lock-form" @submit.prevent="submit">
        <label class="visually-hidden" for="content-access-code">验证码</label>
        <input
          id="content-access-code"
          v-model="code"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="输入验证码"
          :disabled="isVerifying"
        />
        <button type="submit" :disabled="isVerifying || !code.trim()">
          {{ isVerifying ? '验证中…' : '解锁完整内容' }}
        </button>
      </form>
      <p v-if="feedback" class="content-lock-feedback" :class="`is-${feedbackType}`" role="status">{{ feedback }}</p>
    </div>
  </div>
</template>

<style scoped>
.content-lock-card {
  display: block;
  width: min(100%, 560px);
  margin: 32px auto;
  padding: 24px 28px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 28%, var(--vp-c-divider));
  border-radius: 18px;
  background: color-mix(in srgb, var(--vp-c-brand-soft) 42%, var(--vp-c-bg));
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  text-align: center;
}

.content-lock-pending {
  display: none;
}

.content-lock-body {
  min-width: 0;
}

.content-lock-card h2 {
  margin: 0;
  padding-top: 0;
  border-top: 0;
  color: var(--vp-c-text-1);
  font-size: 1.2rem;
}

.content-lock-instruction,
.content-lock-feedback {
  margin: 10px 0 0;
  line-height: 1.7;
}

.content-lock-instruction {
  color: var(--vp-c-text-2);
  font-size: 0.96rem;
}

.content-lock-form {
  display: flex;
  gap: 10px;
  max-width: 360px;
  margin: 18px auto 0;
}

.content-lock-form input,
.content-lock-form button {
  min-height: 42px;
  border-radius: 9px;
  font: inherit;
}

.content-lock-form input {
  min-width: 0;
  flex: 0 1 210px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.content-lock-form input:focus-visible,
.content-lock-form button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.content-lock-form button {
  flex: 0 0 auto;
  padding: 0 16px;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

.content-lock-form button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.content-lock-feedback.is-error {
  color: var(--vp-c-danger-1, #dc2626);
}

.content-lock-feedback.is-success {
  color: var(--vp-c-brand-1);
}

.content-lock-qr {
  display: block;
  width: 144px;
  height: 144px;
  margin: 16px auto 18px;
}

@media (max-width: 640px) {
  .content-lock-card {
    width: 100%;
    margin: 28px 0;
    padding: 20px 16px;
  }

  .content-lock-form {
    flex-direction: column;
  }

  .content-lock-form button {
    width: 100%;
  }
}
</style>

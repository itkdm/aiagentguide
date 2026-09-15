<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  compact?: boolean
}>()

const isOpen = ref(false)
const isSideTabVisible = ref(true)
const isSideTabReady = ref(false)
const sideTabDismissedStorageKey = 'bujidao-community-side-tab-dismissed'

function openQrCode() {
  isOpen.value = true
}

function closeQrCode() {
  isOpen.value = false
}

function closeSideTab() {
  isSideTabVisible.value = false
  try {
    window.localStorage.setItem(sideTabDismissedStorageKey, 'true')
  } catch {
    // Some privacy modes block localStorage; the current-session close still works.
  }
}

onMounted(() => {
  try {
    isSideTabVisible.value = window.localStorage.getItem(sideTabDismissedStorageKey) !== 'true'
  } catch {
    isSideTabVisible.value = true
  }
  isSideTabReady.value = true
})
</script>

<template>
  <section v-if="!compact" id="community" class="home-section community-group">
    <div class="community-card">
      <div class="community-copy">
        <span class="community-eyebrow">一起学习，一起实践</span>
        <h2>加入布吉岛 Agent 交流群</h2>
        <p>
          和其他 Agent 学习者交流学习路线、项目实践、工具使用与面试准备，也欢迎分享你的问题和想法。
        </p>
        <button class="community-button" type="button" @click="openQrCode">
          查看群聊二维码
        </button>
      </div>
      <button class="community-qr-trigger" type="button" aria-label="放大查看微信群聊二维码" @click="openQrCode">
        <img src="/assets/community/wechat-group.jpg" alt="布吉岛 Agent 交流群二维码" />
      </button>
    </div>
  </section>

  <div v-else-if="isSideTabReady && isSideTabVisible" class="community-side-tab" role="group" aria-label="交流群入口">
    <button class="community-side-trigger" type="button" @click="openQrCode">
      <span class="community-side-icon" aria-hidden="true">💬</span>
      <span class="community-side-label">交流群</span>
    </button>
    <button class="community-side-close" type="button" aria-label="关闭交流群侧边栏" title="关闭" @click="closeSideTab">×</button>
  </div>

  <Teleport to="body">
    <div v-if="isOpen" class="community-modal" role="dialog" aria-modal="true" aria-label="布吉岛 Agent 交流群二维码" @click.self="closeQrCode">
      <div class="community-modal-panel">
        <button class="community-modal-close" type="button" aria-label="关闭二维码" @click="closeQrCode">×</button>
        <h2>加入布吉岛 Agent 交流群</h2>
        <img src="/assets/community/wechat-group.jpg" alt="布吉岛 Agent 交流群二维码" />
        <p>请使用微信扫码加入，二维码 7 天内有效。</p>
        <p class="community-modal-tip">手机端可长按二维码保存或识别。</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.community-group {
  padding: 72px 24px;
}

.community-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 72px;
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 48px;
  border: 1px solid var(--home-panel-border);
  border-radius: 28px;
  background: var(--home-panel-bg);
  box-shadow: var(--home-panel-shadow);
}

.community-copy {
  max-width: 500px;
}

.community-eyebrow {
  color: var(--home-accent);
  font-size: 0.9rem;
  font-weight: 700;
}

.community-copy h2 {
  margin: 12px 0 16px;
  color: var(--home-title);
  font-size: 28px;
}

.community-copy p {
  margin: 0;
  color: var(--home-body);
  line-height: 1.8;
}

.community-button {
  margin-top: 24px;
  padding: 10px 18px;
  border: 0;
  border-radius: 999px;
  color: #fff;
  background: var(--vp-c-brand-1);
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.community-button:hover {
  background: var(--vp-c-brand-2);
}

.community-qr-trigger {
  flex: 0 0 220px;
  padding: 10px;
  border: 1px solid var(--home-panel-border);
  border-radius: 18px;
  background: #fff;
  cursor: zoom-in;
}

.community-qr-trigger img {
  display: block;
  width: 200px;
  height: 200px;
  object-fit: contain;
}

.community-side-tab {
  position: fixed;
  top: 42%;
  right: 0;
  z-index: 20;
  width: 56px;
  padding: 0;
  border: 0;
  border-radius: 14px 0 0 14px;
}

.community-side-trigger {
  display: flex;
  width: 100%;
  min-height: 108px;
  padding: 16px 8px 12px;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--vp-c-divider);
  border-right: 0;
  border-radius: 14px 0 0 14px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-brand-1);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.community-side-trigger:hover {
  transform: translateX(-4px);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.22);
}

.community-side-close {
  position: absolute;
  top: -8px;
  right: 4px;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.18);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.community-side-close:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

.community-side-close:focus-visible,
.community-side-trigger:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}

.community-side-icon {
  font-size: 20px;
  line-height: 1;
}

.community-side-label {
  color: #fff;
  font-size: 0.85rem;
  line-height: 1.2;
  writing-mode: vertical-rl;
}

.community-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.68);
}

.community-modal-panel {
  position: relative;
  width: min(420px, 100%);
  padding: 28px;
  border-radius: 24px;
  background: var(--vp-c-bg);
  text-align: center;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.28);
}

.community-modal-panel h2 {
  margin: 0 0 18px;
  color: var(--vp-c-text-1);
  font-size: 1.3rem;
}

.community-modal-panel img {
  display: block;
  width: min(340px, 100%);
  margin: 0 auto;
  border-radius: 12px;
}

.community-modal-panel p {
  margin: 14px 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.community-modal-tip {
  margin-top: 6px !important;
  color: var(--vp-c-text-3) !important;
}

.community-modal-close {
  position: absolute;
  top: 10px;
  right: 14px;
  border: 0;
  color: var(--vp-c-text-2);
  background: transparent;
  cursor: pointer;
  font-size: 28px;
  line-height: 1;
}

@media (max-width: 768px) {
  .community-group {
    padding: 52px 16px;
  }

  .community-card {
    flex-direction: column;
    gap: 28px;
    padding: 32px 24px;
    text-align: center;
  }

  .community-copy h2 {
    font-size: 24px;
  }

  .community-side-tab {
    top: 40%;
    width: 48px;
  }

  .community-side-trigger {
    min-height: 96px;
    padding: 12px 6px 10px;
  }
}
</style>

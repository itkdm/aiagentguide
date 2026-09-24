<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const isCouponOpen = ref(false)

function closeCoupon() {
  isCouponOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeCoupon()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <section id="planet" class="home-section planet-membership" aria-labelledby="planet-title">
    <div class="planet-card">
      <div class="planet-copy">
        <span class="planet-eyebrow">解锁更多资源</span>
        <h2 id="planet-title">加入布吉岛 Agent 知识星球</h2>
        <p>
          知识星球是 <strong>aiagentguide.cn 的配套学习资料库</strong>。
        </p>
        <p>
          网站上的教程和部分项目仍然会持续免费开放，星球则主要提供更加完整、详细的
          <strong>架构图、流程图、时序图和可编辑源文件（当前重点）</strong>。这些内容并不是网站图片的简单搬运，而是围绕教程进一步整理和拆解，帮助你在学完之后快速梳理知识结构、辅助记忆，并能够根据图把核心原理完整讲出来。
        </p>
        <p>
          后续还会逐步加入 <strong>星球专属项目、深度文章、面试题以及更多学习资料</strong>。
        </p>
        <p>
          目前网站和星球都还处于起步阶段，因此价格设置得比较低；随着内容不断丰富，后续价格也会逐步调整。
        </p>
        <p>
          <strong>当然，不加入星球也完全可以学习，星球只是为希望学得更系统、更省时间的同学提供额外内容。</strong>
        </p>
      </div>

      <button
        class="planet-coupon-link"
        type="button"
        aria-label="放大查看布吉岛 Agent 知识星球优惠券"
        aria-haspopup="dialog"
        @click="isCouponOpen = true"
      >
        <img
          src="/assets/community/planet-coupon.png"
          alt="布吉岛 Agent 知识星球优惠券：立减 50 元，扫码领取，优惠券有效至 2026 年 11 月 30 日 12:00"
          width="640"
          height="778"
          loading="lazy"
        />
        <span>点击查看优惠券大图</span>
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="isCouponOpen"
        class="planet-coupon-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="planet-coupon-modal-title"
        @click.self="closeCoupon"
      >
        <div class="planet-coupon-modal-panel">
          <button
            class="planet-coupon-modal-close"
            type="button"
            aria-label="关闭优惠券预览"
            @click="closeCoupon"
          >
            ×
          </button>
          <h2 id="planet-coupon-modal-title">布吉岛 Agent 知识星球优惠券</h2>
          <img
            src="/assets/community/planet-coupon.png"
            alt="布吉岛 Agent 知识星球优惠券：立减 50 元，扫码领取，优惠券有效至 2026 年 11 月 30 日 12:00"
            width="640"
            height="778"
          />
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.planet-membership {
  padding: 24px 24px 72px;
}

.planet-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  align-items: center;
  gap: 56px;
  max-width: 960px;
  margin: 0 auto;
  padding: 36px 48px;
  border: 1px solid var(--home-panel-border);
  border-radius: 28px;
  background: var(--home-panel-bg);
  box-shadow: var(--home-panel-shadow);
}

.planet-copy {
  max-width: 560px;
}

.planet-eyebrow {
  color: var(--home-accent);
  font-size: 0.9rem;
  font-weight: 700;
}

.planet-copy h2 {
  margin: 12px 0 16px;
  color: var(--home-title);
  font-size: 28px;
}

.planet-copy p {
  margin: 0;
  color: var(--home-body);
  line-height: 1.8;
}

.planet-copy p + p {
  margin-top: 12px;
}

.planet-offer {
  margin-top: 20px !important;
}

.planet-offer strong {
  color: var(--home-accent);
  font-size: 1.15em;
}

.planet-scan-tip {
  margin-top: 12px !important;
  color: var(--vp-c-text-3) !important;
  font-size: 0.9rem;
}

.planet-coupon-link {
  display: block;
  width: 100%;
  padding: 8px;
  border: 1px solid var(--home-panel-border);
  border-radius: 16px;
  background: #fff;
  color: var(--vp-c-text-2);
  text-align: center;
  font: inherit;
  cursor: zoom-in;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.planet-coupon-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.14);
}

.planet-coupon-link:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}

.planet-coupon-link img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 10px;
}

.planet-coupon-link span {
  display: block;
  padding: 9px 4px 3px;
  font-size: 0.82rem;
}

.planet-coupon-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(6px);
}

.planet-coupon-modal-panel {
  position: relative;
  display: flex;
  max-width: min(640px, 100%);
  max-height: 100%;
  padding: 24px;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: var(--vp-c-bg);
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.3);
}

.planet-coupon-modal-panel h2 {
  margin: 0 32px 16px;
  color: var(--vp-c-text-1);
  font-size: 1.15rem;
  text-align: center;
}

.planet-coupon-modal-panel img {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 140px);
  width: auto;
  height: auto;
  border-radius: 10px;
  object-fit: contain;
}

.planet-coupon-modal-close {
  position: absolute;
  top: 8px;
  right: 12px;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
}

.planet-coupon-modal-close:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-mute);
}

@media (max-width: 768px) {
  .planet-membership {
    padding: 0 16px 52px;
  }

  .planet-card {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 32px 24px;
    text-align: center;
  }

  .planet-copy h2 {
    font-size: 24px;
  }

  .planet-coupon-link {
    width: min(240px, 100%);
    margin: 0 auto;
  }

  .planet-coupon-modal-panel {
    padding: 16px;
  }

  .planet-coupon-modal-panel img {
    max-height: calc(100vh - 112px);
  }
}
</style>

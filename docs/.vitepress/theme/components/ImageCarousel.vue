<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type CarouselItem =
  | string
  | {
      src: string
      alt?: string
      title?: string
      description?: string
      href?: string
    }

const props = withDefaults(
  defineProps<{
    images: CarouselItem[]
    autoplay?: boolean
    interval?: number
    aspectRatio?: string
    fit?: 'contain' | 'cover'
  }>(),
  {
    autoplay: false,
    interval: 4000,
    aspectRatio: undefined,
    fit: 'contain'
  }
)

const currentIndex = ref(0)
const isPaused = ref(false)
const isLightboxOpen = ref(false)
const touchStartX = ref(0)
const lightboxTouchStartX = ref(0)
const stageMinHeight = ref('360px')
const failedImages = ref<Record<string, boolean>>({})

let timer: ReturnType<typeof setInterval> | null = null

const normalizedImages = computed(() =>
  props.images.map((item) =>
    typeof item === 'string'
      ? { src: item, alt: '', title: '', description: '', href: '' }
      : {
          src: item.src,
          alt: item.alt ?? '',
          title: item.title ?? '',
          description: item.description ?? '',
          href: item.href ?? ''
        }
  )
)

const activeImage = computed(() => normalizedImages.value[currentIndex.value])
const stageStyle = computed(() =>
  props.aspectRatio
    ? {
        minHeight: stageMinHeight.value,
        aspectRatio: props.aspectRatio
      }
    : {
        minHeight: stageMinHeight.value
      }
)
const useCoverLayout = computed(() => props.fit === 'cover' && Boolean(props.aspectRatio))

function getImageKey(src?: string) {
  return src || ''
}

function hasImageFailed(src?: string) {
  return Boolean(failedImages.value[getImageKey(src)])
}

function markImageFailed(src?: string) {
  const key = getImageKey(src)

  if (!key) {
    return
  }

  failedImages.value = {
    ...failedImages.value,
    [key]: true
  }
}

function updateStageMinHeight() {
  if (typeof window === 'undefined') {
    return
  }

  if (window.innerWidth <= 640) {
    stageMinHeight.value = '220px'
    return
  }

  if (window.innerWidth <= 960) {
    stageMinHeight.value = '300px'
    return
  }

  stageMinHeight.value = '360px'
}

function stopAutoplay() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startAutoplay() {
  stopAutoplay()

  if (!props.autoplay || normalizedImages.value.length <= 1) {
    return
  }

  timer = setInterval(() => {
    if (!isPaused.value) {
      next()
    }
  }, props.interval)
}

function goTo(index: number) {
  const total = normalizedImages.value.length

  if (!total) {
    currentIndex.value = 0
    return
  }

  currentIndex.value = (index + total) % total
}

function next() {
  goTo(currentIndex.value + 1)
}

function prev() {
  goTo(currentIndex.value - 1)
}

function openLightbox() {
  if (!activeImage.value?.src) {
    return
  }

  isLightboxOpen.value = true
}

function closeLightbox() {
  isLightboxOpen.value = false
}

function onTouchStart(event: TouchEvent) {
  touchStartX.value = event.touches[0]?.clientX ?? 0
}

function onTouchEnd(event: TouchEvent) {
  const endX = event.changedTouches[0]?.clientX ?? 0
  const deltaX = endX - touchStartX.value

  if (Math.abs(deltaX) < 40) {
    return
  }

  if (deltaX < 0) {
    next()
  } else {
    prev()
  }
}

function onLightboxTouchStart(event: TouchEvent) {
  lightboxTouchStartX.value = event.touches[0]?.clientX ?? 0
}

function onLightboxTouchEnd(event: TouchEvent) {
  const endX = event.changedTouches[0]?.clientX ?? 0
  const deltaX = endX - lightboxTouchStartX.value

  if (Math.abs(deltaX) < 40) {
    return
  }

  if (deltaX < 0) {
    next()
  } else {
    prev()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isLightboxOpen.value) {
    closeLightbox()
  }

  if (event.key === 'ArrowLeft') {
    prev()
  }

  if (event.key === 'ArrowRight') {
    next()
  }
}

watch(
  () => [props.autoplay, props.interval, normalizedImages.value.length],
  () => {
    if (currentIndex.value >= normalizedImages.value.length) {
      currentIndex.value = 0
    }

    startAutoplay()
  }
)

onMounted(() => {
  updateStageMinHeight()
  startAutoplay()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', updateStageMinHeight)
})

onBeforeUnmount(() => {
  stopAutoplay()
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', updateStageMinHeight)
})
</script>

<template>
  <section
    class="image-carousel"
    @mouseenter="isPaused = true"
    @mouseleave="isPaused = false"
  >
    <div
      class="image-carousel-stage"
      :style="stageStyle"
      :class="{ 'is-cover': useCoverLayout }"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <button
        v-if="normalizedImages.length > 1"
        type="button"
        class="image-carousel-arrow is-prev"
        aria-label="Previous slide"
        @click="prev"
      >
        &lsaquo;
      </button>

      <button
        v-if="normalizedImages.length > 1"
        type="button"
        class="image-carousel-arrow is-next"
        aria-label="Next slide"
        @click="next"
      >
        &rsaquo;
      </button>

      <Transition name="image-carousel-fade" mode="out-in">
        <figure :key="`${currentIndex}-${activeImage?.src}`" class="image-carousel-slide">
          <a
            v-if="activeImage?.href"
            :href="activeImage.href"
            class="image-carousel-media-link"
            target="_blank"
            rel="noreferrer"
            @click.prevent="openLightbox"
          >
            <img
              v-if="!hasImageFailed(activeImage.src)"
              class="image-carousel-image"
              :class="{ 'is-cover': useCoverLayout }"
              :src="activeImage.src"
              :alt="activeImage.alt || activeImage.title || 'carousel image'"
              @error="markImageFailed(activeImage.src)"
            />
            <div v-else class="image-carousel-image-fallback">
              <strong>Image unavailable</strong>
              <p>Check the image path or file accessibility.</p>
            </div>
          </a>
          <img
            v-else-if="!hasImageFailed(activeImage?.src)"
            class="image-carousel-image"
            :class="{ 'is-cover': useCoverLayout }"
            :src="activeImage?.src"
            :alt="activeImage?.alt || activeImage?.title || 'carousel image'"
            @click="openLightbox"
            @error="markImageFailed(activeImage?.src)"
          />
          <div v-else class="image-carousel-image-fallback">
            <strong>Image unavailable</strong>
            <p>Check the image path or file accessibility.</p>
          </div>

          <figcaption
            v-if="activeImage?.title || activeImage?.description"
            class="image-carousel-caption"
          >
            <strong v-if="activeImage.title">{{ activeImage.title }}</strong>
            <p v-if="activeImage.description">{{ activeImage.description }}</p>
          </figcaption>
        </figure>
      </Transition>
    </div>

    <div v-if="normalizedImages.length > 1" class="image-carousel-footer">
      <div class="image-carousel-dots" role="tablist" aria-label="Carousel pagination">
        <button
          v-for="(item, index) in normalizedImages"
          :key="`${item.src}-${index}`"
          type="button"
          class="image-carousel-dot"
          :class="{ active: index === currentIndex }"
          :aria-label="`Go to slide ${index + 1}`"
          :aria-selected="index === currentIndex"
          @click="goTo(index)"
        />
      </div>
      <div class="image-carousel-count">{{ currentIndex + 1 }} / {{ normalizedImages.length }}</div>
    </div>

    <Teleport to="body">
      <Transition name="image-carousel-lightbox">
        <div
          v-if="isLightboxOpen && activeImage"
          class="image-carousel-lightbox"
          role="dialog"
          aria-modal="true"
          :aria-label="activeImage.title || 'Image preview'"
          @click.self="closeLightbox"
          @touchstart.passive="onLightboxTouchStart"
          @touchend.passive="onLightboxTouchEnd"
        >
          <button
            type="button"
            class="image-carousel-lightbox-close"
            aria-label="Close preview"
            @click="closeLightbox"
          >
            &times;
          </button>

          <a
            v-if="activeImage.href || activeImage.src"
            class="image-carousel-lightbox-open"
            :href="activeImage.href || activeImage.src"
            target="_blank"
            rel="noreferrer"
            @click.stop
          >
            Open
          </a>

          <button
            v-if="normalizedImages.length > 1"
            type="button"
            class="image-carousel-lightbox-arrow is-prev"
            aria-label="Previous preview image"
            @click.stop="prev"
          >
            &lsaquo;
          </button>

          <figure class="image-carousel-lightbox-figure" @click.stop>
            <img
              v-if="!hasImageFailed(activeImage.src)"
              class="image-carousel-lightbox-image"
              :src="activeImage.src"
              :alt="activeImage.alt || activeImage.title || 'preview image'"
              @error="markImageFailed(activeImage.src)"
            />
            <div v-else class="image-carousel-lightbox-fallback">
              <strong>Image unavailable</strong>
              <p>This preview could not be loaded.</p>
            </div>
            <figcaption
              v-if="activeImage.title || activeImage.description"
              class="image-carousel-lightbox-caption"
            >
              <strong v-if="activeImage.title">{{ activeImage.title }}</strong>
              <p v-if="activeImage.description">{{ activeImage.description }}</p>
            </figcaption>
          </figure>

          <div
            v-if="normalizedImages.length > 1"
            class="image-carousel-lightbox-thumbs"
            @click.stop
          >
            <button
              v-for="(item, index) in normalizedImages"
              :key="`${item.src}-thumb-${index}`"
              type="button"
              class="image-carousel-lightbox-thumb"
              :class="{ active: index === currentIndex }"
              :aria-label="`Preview slide ${index + 1}`"
              @click="goTo(index)"
            >
              <img
                :src="item.src"
                :alt="item.alt || item.title || `thumbnail ${index + 1}`"
              />
            </button>
          </div>

          <button
            v-if="normalizedImages.length > 1"
            type="button"
            class="image-carousel-lightbox-arrow is-next"
            aria-label="Next preview image"
            @click.stop="next"
          >
            &rsaquo;
          </button>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.image-carousel {
  margin: 1rem 0;
}

.image-carousel-stage {
  position: relative;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  line-height: 0;
  overflow: clip;
}

.image-carousel-stage.is-cover {
  display: flex;
  align-items: stretch;
}

.image-carousel-slide {
  position: relative;
  width: 100%;
  margin: 0;
  display: block;
}

.image-carousel-stage.is-cover .image-carousel-slide {
  height: 100%;
}

.image-carousel-media-link,
.image-carousel-image {
  display: block;
  width: 100%;
  height: auto;
}

.image-carousel-stage.is-cover .image-carousel-media-link {
  height: 100%;
}

.image-carousel-image {
  margin: 0 auto;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px 8px 0 0;
  cursor: zoom-in;
}

.image-carousel-image.is-cover {
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.image-carousel-image-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  padding: 24px;
  background:
    linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(15, 118, 110, 0.06)),
    var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  line-height: 1.6;
  text-align: center;
}

.image-carousel-stage.is-cover .image-carousel-image-fallback {
  min-height: 100%;
  height: 100%;
}

.image-carousel-image-fallback strong {
  display: block;
  margin-bottom: 6px;
  font-size: 0.98rem;
  color: var(--vp-c-text-1);
}

.image-carousel-image-fallback p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.image-carousel-caption {
  position: static;
  padding: 12px 16px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  line-height: 1.5;
}

.image-carousel-stage.is-cover .image-carousel-caption {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  border-top: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0), rgba(15, 23, 42, 0.78));
  color: #f8fafc;
}

.image-carousel-stage.is-cover .image-carousel-caption strong {
  color: #ffffff;
}

.image-carousel-stage.is-cover .image-carousel-caption p {
  color: rgba(241, 245, 249, 0.88);
}

.image-carousel-caption strong {
  display: block;
  margin: 0 0 4px;
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.image-carousel-caption p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  line-height: 1.4;
}

.image-carousel-arrow {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transform: translateY(-50%);
  border: 0;
  border-radius: 50%;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  font-size: 1.8rem;
  font-family: Georgia, "Times New Roman", serif;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, background-color 0.2s;
}

.image-carousel-arrow:focus,
.image-carousel:hover .image-carousel-arrow {
  opacity: 1;
}

.image-carousel-arrow:hover {
  background-color: var(--vp-c-bg-mute);
}

.image-carousel-arrow.is-prev {
  left: 8px;
}

.image-carousel-arrow.is-next {
  right: 8px;
}

.image-carousel-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}

.image-carousel-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.image-carousel-dot {
  width: 6px;
  height: 6px;
  border: 0;
  border-radius: 50%;
  background: var(--vp-c-text-3);
  cursor: pointer;
  transition: all 0.2s;
}

.image-carousel-dot.active {
  width: 16px;
  border-radius: 3px;
  background: var(--vp-c-brand);
}

.image-carousel-count {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.image-carousel-fade-enter-active,
.image-carousel-fade-leave-active {
  transition: opacity 0.25s ease;
}

.image-carousel-fade-enter-from,
.image-carousel-fade-leave-to {
  opacity: 0;
}

.image-carousel-lightbox-enter-active,
.image-carousel-lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.image-carousel-lightbox-enter-from,
.image-carousel-lightbox-leave-to {
  opacity: 0;
}

.image-carousel-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: rgba(2, 6, 23, 0.82);
  backdrop-filter: blur(8px);
}

.image-carousel-lightbox-figure {
  margin: 0;
  max-width: min(1280px, 100%);
  max-height: 100%;
}

.image-carousel-lightbox-image {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 140px);
  width: auto;
  height: auto;
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
}

.image-carousel-lightbox-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: min(720px, 82vw);
  min-height: min(420px, 58vh);
  padding: 28px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.78);
  color: #e2e8f0;
  text-align: center;
  line-height: 1.6;
}

.image-carousel-lightbox-fallback strong {
  display: block;
  margin-bottom: 6px;
  font-size: 1rem;
  color: #ffffff;
}

.image-carousel-lightbox-fallback p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.92rem;
}

.image-carousel-lightbox-caption {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.72);
  color: #e2e8f0;
  line-height: 1.55;
}

.image-carousel-lightbox-caption strong {
  display: block;
  margin-bottom: 4px;
  color: #ffffff;
  font-size: 0.96rem;
}

.image-carousel-lightbox-caption p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.88rem;
}

.image-carousel-lightbox-thumbs {
  position: absolute;
  right: 24px;
  bottom: 24px;
  left: 24px;
  display: flex;
  justify-content: center;
  gap: 10px;
  overflow-x: auto;
  padding: 6px 4px 2px;
}

.image-carousel-lightbox-thumb {
  flex: 0 0 auto;
  width: 68px;
  height: 48px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.52);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.image-carousel-lightbox-thumb:hover {
  transform: translateY(-1px);
}

.image-carousel-lightbox-thumb.active {
  border-color: #7dd3fc;
}

.image-carousel-lightbox-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-carousel-lightbox-close,
.image-carousel-lightbox-arrow {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.74);
  color: #f8fafc;
  cursor: pointer;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.18);
}

.image-carousel-lightbox-open {
  position: absolute;
  top: 20px;
  right: 72px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 74px;
  height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.74);
  color: #f8fafc !important;
  text-decoration: none !important;
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.18);
}

.image-carousel-lightbox-close {
  top: 20px;
  right: 20px;
  width: 42px;
  height: 42px;
  font-size: 1.6rem;
  line-height: 1;
}

.image-carousel-lightbox-arrow {
  top: 50%;
  width: 46px;
  height: 46px;
  transform: translateY(-50%);
  font-size: 2rem;
  font-family: Georgia, "Times New Roman", serif;
  line-height: 1;
}

.image-carousel-lightbox-arrow.is-prev {
  left: 20px;
}

.image-carousel-lightbox-arrow.is-next {
  right: 20px;
}

.dark .image-carousel-caption {
  background: rgba(30, 41, 59, 0.82);
  border-top-color: rgba(148, 163, 184, 0.14);
}

.dark .image-carousel-stage.is-cover .image-carousel-caption {
  background: linear-gradient(180deg, rgba(2, 6, 23, 0), rgba(2, 6, 23, 0.82));
  border-top-color: transparent;
}

.dark .image-carousel-caption strong {
  color: #e2e8f0;
}

.dark .image-carousel-caption p {
  color: #94a3b8;
}

@media (max-width: 640px) {
  .image-carousel-stage {
    border-radius: 6px;
  }

  .image-carousel-image {
    border-radius: 6px 6px 0 0;
  }

  .image-carousel-caption {
    padding: 10px 12px;
  }

  .image-carousel-caption strong {
    font-size: 0.86rem;
  }

  .image-carousel-caption p {
    font-size: 0.8rem;
  }

  .image-carousel-arrow {
    width: 30px;
    height: 30px;
    font-size: 1.55rem;
    opacity: 1;
  }

  .image-carousel-arrow.is-prev {
    left: 6px;
  }

  .image-carousel-arrow.is-next {
    right: 6px;
  }

  .image-carousel-footer {
    gap: 10px;
    margin-top: 10px;
  }

  .image-carousel-lightbox {
    padding: 18px;
  }

  .image-carousel-lightbox-image {
    max-height: calc(100vh - 230px);
    border-radius: 12px;
  }

  .image-carousel-lightbox-close {
    top: 14px;
    right: 14px;
    width: 38px;
    height: 38px;
  }

  .image-carousel-lightbox-open {
    top: 14px;
    right: 60px;
    min-width: 64px;
    height: 38px;
    padding: 0 12px;
    font-size: 0.84rem;
  }

  .image-carousel-lightbox-arrow {
    width: 38px;
    height: 38px;
    font-size: 1.7rem;
  }

  .image-carousel-lightbox-arrow.is-prev {
    left: 10px;
  }

  .image-carousel-lightbox-arrow.is-next {
    right: 10px;
  }

  .image-carousel-lightbox-thumbs {
    right: 12px;
    bottom: 14px;
    left: 12px;
    justify-content: flex-start;
    gap: 8px;
  }

  .image-carousel-lightbox-thumb {
    width: 58px;
    height: 42px;
    border-radius: 8px;
  }
}
</style>

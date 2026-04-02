<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    src: string
    alt?: string
    title?: string
    description?: string
    href?: string
    aspectRatio?: string
    fit?: 'contain' | 'cover'
  }>(),
  {
    alt: '',
    title: '',
    description: '',
    href: '',
    aspectRatio: undefined,
    fit: 'contain'
  }
)

const isLightboxOpen = ref(false)
const hasFailed = ref(false)
const stageMinHeight = ref('360px')

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
const resolvedAlt = computed(() => props.alt || props.title || 'preview image')
const openHref = computed(() => props.href || props.src)

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

function openLightbox() {
  if (!props.src || hasFailed.value) {
    return
  }

  isLightboxOpen.value = true
}

function closeLightbox() {
  isLightboxOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isLightboxOpen.value) {
    closeLightbox()
  }
}

onMounted(() => {
  updateStageMinHeight()
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', updateStageMinHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', updateStageMinHeight)
})
</script>

<template>
  <section class="single-image-preview">
    <figure
      class="single-image-stage"
      :style="stageStyle"
      :class="{ 'is-cover': useCoverLayout }"
    >
      <img
        v-if="!hasFailed"
        class="single-image"
        :class="{ 'is-cover': useCoverLayout }"
        :src="src"
        :alt="resolvedAlt"
        @click="openLightbox"
        @error="hasFailed = true"
      />
      <div v-else class="single-image-fallback">
        <strong>Image unavailable</strong>
        <p>Check the image path or file accessibility.</p>
      </div>

      <figcaption
        v-if="title || description"
        class="single-image-caption"
      >
        <strong v-if="title">{{ title }}</strong>
        <p v-if="description">{{ description }}</p>
      </figcaption>
    </figure>

    <Teleport to="body">
      <Transition name="single-image-lightbox">
        <div
          v-if="isLightboxOpen && !hasFailed"
          class="single-image-lightbox"
          role="dialog"
          aria-modal="true"
          :aria-label="title || 'Image preview'"
          @click.self="closeLightbox"
        >
          <button
            type="button"
            class="single-image-lightbox-close"
            aria-label="Close preview"
            @click="closeLightbox"
          >
            &times;
          </button>

          <a
            v-if="openHref"
            class="single-image-lightbox-open"
            :href="openHref"
            target="_blank"
            rel="noreferrer"
            @click.stop
          >
            Open
          </a>

          <figure class="single-image-lightbox-figure" @click.stop>
            <img
              class="single-image-lightbox-image"
              :src="src"
              :alt="resolvedAlt"
            />
            <figcaption
              v-if="title || description"
              class="single-image-lightbox-caption"
            >
              <strong v-if="title">{{ title }}</strong>
              <p v-if="description">{{ description }}</p>
            </figcaption>
          </figure>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.single-image-preview {
  margin: 1rem 0;
}

.single-image-stage {
  position: relative;
  margin: 0;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  line-height: 0;
  overflow: clip;
}

.single-image-stage.is-cover {
  display: flex;
  align-items: stretch;
}

.single-image {
  display: block;
  width: 100%;
  height: auto;
  margin: 0 auto;
  background-color: var(--vp-c-bg-soft);
  cursor: zoom-in;
}

.single-image.is-cover {
  height: 100%;
  object-fit: cover;
}

.single-image-fallback {
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

.single-image-stage.is-cover .single-image-fallback {
  min-height: 100%;
  height: 100%;
}

.single-image-fallback strong {
  display: block;
  margin-bottom: 6px;
  font-size: 0.98rem;
  color: var(--vp-c-text-1);
}

.single-image-fallback p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.single-image-caption {
  padding: 12px 16px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  line-height: 1.5;
}

.single-image-stage.is-cover .single-image-caption {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  border-top: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0), rgba(15, 23, 42, 0.78));
  color: #f8fafc;
}

.single-image-stage.is-cover .single-image-caption strong {
  color: #ffffff;
}

.single-image-stage.is-cover .single-image-caption p {
  color: rgba(241, 245, 249, 0.88);
}

.single-image-caption strong {
  display: block;
  margin: 0 0 4px;
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
}

.single-image-caption p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  line-height: 1.4;
}

.single-image-lightbox-enter-active,
.single-image-lightbox-leave-active {
  transition: opacity 0.2s ease;
}

.single-image-lightbox-enter-from,
.single-image-lightbox-leave-to {
  opacity: 0;
}

.single-image-lightbox {
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

.single-image-lightbox-figure {
  margin: 0;
  max-width: min(1280px, 100%);
  max-height: 100%;
}

.single-image-lightbox-image {
  display: block;
  max-width: 100%;
  max-height: calc(100vh - 140px);
  width: auto;
  height: auto;
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.32);
}

.single-image-lightbox-caption {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.72);
  color: #e2e8f0;
  line-height: 1.55;
}

.single-image-lightbox-caption strong {
  display: block;
  margin-bottom: 4px;
  color: #ffffff;
  font-size: 0.96rem;
}

.single-image-lightbox-caption p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.88rem;
}

.single-image-lightbox-close {
  position: absolute;
  top: 20px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.74);
  color: #f8fafc;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.18);
}

.single-image-lightbox-open {
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

.dark .single-image-caption {
  background: rgba(30, 41, 59, 0.82);
  border-top-color: rgba(148, 163, 184, 0.14);
}

.dark .single-image-stage.is-cover .single-image-caption {
  background: linear-gradient(180deg, rgba(2, 6, 23, 0), rgba(2, 6, 23, 0.82));
  border-top-color: transparent;
}

.dark .single-image-caption strong {
  color: #e2e8f0;
}

.dark .single-image-caption p {
  color: #94a3b8;
}

@media (max-width: 640px) {
  .single-image-stage {
    border-radius: 6px;
  }

  .single-image-caption {
    padding: 10px 12px;
  }

  .single-image-caption strong {
    font-size: 0.86rem;
  }

  .single-image-caption p {
    font-size: 0.8rem;
  }

  .single-image-lightbox {
    padding: 18px;
  }

  .single-image-lightbox-image {
    max-height: calc(100vh - 230px);
    border-radius: 12px;
  }

  .single-image-lightbox-close {
    top: 14px;
    right: 14px;
    width: 38px;
    height: 38px;
  }

  .single-image-lightbox-open {
    top: 14px;
    right: 60px;
    min-width: 64px;
    height: 38px;
    padding: 0 12px;
    font-size: 0.84rem;
  }
}
</style>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type SwitcherItem = {
  key: string
  label: string
  content?: string
  type?: 'text' | 'code'
  lang?: string
}

const props = withDefaults(
  defineProps<{
    items: SwitcherItem[]
    defaultKey?: string
  }>(),
  {
    defaultKey: undefined
  }
)

const activeKey = ref(props.defaultKey || props.items[0]?.key || '')

const normalizedItems = computed(() =>
  props.items.map((item) => ({
    ...item,
    type: item.type ?? 'text'
  }))
)

const activeItem = computed(
  () => normalizedItems.value.find((item) => item.key === activeKey.value) || normalizedItems.value[0]
)

watch(
  () => [props.defaultKey, props.items],
  () => {
    const nextKey = props.defaultKey || props.items[0]?.key || ''
    const keyStillExists = props.items.some((item) => item.key === activeKey.value)

    if (!keyStillExists || (props.defaultKey && props.defaultKey !== activeKey.value)) {
      activeKey.value = nextKey
    }
  },
  { deep: true }
)

function setActive(key: string) {
  activeKey.value = key
}
</script>

<template>
  <section v-if="normalizedItems.length" class="content-switcher">
    <div class="content-switcher-tabs" role="tablist" aria-label="Content switcher">
      <button
        v-for="item in normalizedItems"
        :key="item.key"
        type="button"
        class="content-switcher-tab"
        :class="{ active: item.key === activeItem?.key }"
        role="tab"
        :aria-selected="item.key === activeItem?.key"
        @click="setActive(item.key)"
      >
        {{ item.label }}
      </button>
    </div>

    <div class="content-switcher-panel" role="tabpanel">
      <slot :name="activeItem?.key" :item="activeItem">
        <pre
          v-if="activeItem?.type === 'code'"
          class="content-switcher-code"
        ><code :class="activeItem?.lang ? `language-${activeItem.lang}` : ''">{{ activeItem?.content || '' }}</code></pre>
        <div v-else class="content-switcher-text">
          {{ activeItem?.content || '' }}
        </div>
      </slot>
    </div>
  </section>
</template>

<style scoped>
.content-switcher {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg);
  overflow: hidden;
}

.content-switcher-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 0 12px;
  background-color: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.content-switcher-tab {
  position: relative;
  height: 48px;
  padding: 0 16px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.25s;
}

.content-switcher-tab::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: transparent;
  transition: background-color 0.25s;
}

.content-switcher-tab:hover {
  color: var(--vp-c-text-1);
}

.content-switcher-tab.active {
  color: var(--vp-c-brand-1);
}

.content-switcher-tab.active::after {
  background-color: var(--vp-c-brand-1);
}

.content-switcher-panel {
  padding: 16px;
}

.content-switcher-text {
  white-space: pre-wrap;
  line-height: 28px;
  color: var(--vp-c-text-1);
}

.content-switcher-code {
  margin: 0;
  padding: 16px;
  border-radius: 8px;
  background-color: var(--vp-code-block-bg);
  color: var(--vp-code-block-color);
  overflow-x: auto;
}

.content-switcher-code code {
  display: block;
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  line-height: var(--vp-code-line-height);
}
</style>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { usePreviewOverlay, useSvgViewport } from '../utils/diagram'

type MindmapNode = {
  id: string
  text: string
  depth: number
  children: MindmapNode[]
  x?: number
  y?: number
  width?: number
}

type Edge = {
  fromX: number
  fromY: number
  toX: number
  toY: number
}

const props = defineProps<{
  code: string
}>()

const { isDark } = useData()

const stageRef = ref<HTMLDivElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const previewStageRef = ref<HTMLDivElement | null>(null)
const previewSvgRef = ref<SVGSVGElement | null>(null)
const loading = ref(true)
const error = ref('')
const nodes = ref<MindmapNode[]>([])
const edges = ref<Edge[]>([])
const viewBox = ref('0 0 1200 720')

const viewport = useSvgViewport(stageRef, svgRef)
const previewViewport = useSvgViewport(previewStageRef, previewSvgRef)
const preview = usePreviewOverlay()

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

const palette = ['#2563eb', '#0f766e', '#ea580c', '#7c3aed', '#0891b2']

function normalizeLine(line: string) {
  return line.replace(/\t/g, '  ').trimEnd()
}

function parseMindmap(input: string) {
  const lines = input
    .split(/\r?\n/u)
    .map(normalizeLine)
    .filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    throw new Error('Mindmap source is empty.')
  }

  const rootLine = lines[0]
  const rootText = rootLine.replace(/^#\s+/u, '').trim()

  if (!rootText) {
    throw new Error('The first line must be a level-1 heading like "# Topic".')
  }

  const root: MindmapNode = {
    id: 'node-root',
    text: rootText,
    depth: 0,
    children: []
  }

  const stack: MindmapNode[] = [root]
  let autoId = 0

  for (const line of lines.slice(1)) {
    const headingMatch = line.match(/^(#{2,6})\s+(.*)$/u)
    const bulletMatch = line.match(/^(\s*)[-*+]\s+(.*)$/u)

    let depth = 1
    let text = ''

    if (headingMatch) {
      depth = headingMatch[1].length - 1
      text = headingMatch[2].trim()
    } else if (bulletMatch) {
      depth = Math.floor(bulletMatch[1].length / 2) + 2
      text = bulletMatch[2].trim()
    } else {
      depth = stack[stack.length - 1]?.depth ?? 0
      text = line.trim()
    }

    if (!text) {
      continue
    }

    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
      stack.pop()
    }

    const parent = stack[stack.length - 1] ?? root
    const node: MindmapNode = {
      id: `node-${autoId++}`,
      text,
      depth,
      children: []
    }

    parent.children.push(node)
    stack.push(node)
  }

  return root
}

function measureNodeWidth(text: string, depth: number) {
  const base = 120
  const estimated = text.length * (depth === 0 ? 15 : 12) + 40
  return Math.max(base, Math.min(estimated, 260))
}

function assignLayout(root: MindmapNode) {
  const horizontalGap = 210
  const verticalGap = 22
  const nodesList: MindmapNode[] = []
  const edgesList: Edge[] = []
  let leafIndex = 0

  function walk(node: MindmapNode, depth: number) {
    node.width = measureNodeWidth(node.text, depth)
    node.x = depth * horizontalGap

    if (node.children.length === 0) {
      node.y = leafIndex * (64 + verticalGap)
      leafIndex += 1
    } else {
      node.children.forEach((child) => walk(child, depth + 1))
      const first = node.children[0]
      const last = node.children[node.children.length - 1]
      node.y = ((first.y ?? 0) + (last.y ?? 0)) / 2
    }

    nodesList.push(node)

    for (const child of node.children) {
      edgesList.push({
        fromX: (node.x ?? 0) + (node.width ?? 0),
        fromY: (node.y ?? 0) + 28,
        toX: child.x ?? 0,
        toY: (child.y ?? 0) + 24
      })
    }
  }

  walk(root, 0)

  const maxX = Math.max(...nodesList.map((node) => (node.x ?? 0) + (node.width ?? 0))) + 80
  const maxY = Math.max(...nodesList.map((node) => (node.y ?? 0) + 64)) + 80

  return {
    nodes: nodesList,
    edges: edgesList,
    viewBox: `0 0 ${Math.max(maxX, 920)} ${Math.max(maxY, 520)}`
  }
}

function edgePath(edge: Edge) {
  const midX = edge.fromX + (edge.toX - edge.fromX) * 0.45
  return `M ${edge.fromX} ${edge.fromY} C ${midX} ${edge.fromY}, ${midX} ${edge.toY}, ${edge.toX} ${edge.toY}`
}

function nodeColor(depth: number) {
  return palette[Math.min(depth, palette.length - 1)]
}

async function renderMindmap() {
  loading.value = true
  error.value = ''

  try {
    const root = parseMindmap(props.code)
    const layout = assignLayout(root)
    nodes.value = layout.nodes
    edges.value = layout.edges
    viewBox.value = layout.viewBox
    await nextTick()
    viewport.reset()

    if (preview.isOpen.value) {
      await waitForPaint()
      previewViewport.reset()
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Mindmap render failed.'
    nodes.value = []
    edges.value = []
  } finally {
    loading.value = false
  }
}

const renderedNodes = computed(() =>
  nodes.value.map((node) => ({
    ...node,
    color: nodeColor(node.depth),
    textX: (node.x ?? 0) + (node.depth === 0 ? (node.width ?? 0) / 2 : 18),
    textAnchor: node.depth === 0 ? 'middle' : 'start'
  }))
)

onMounted(() => {
  nextTick(() => {
    void renderMindmap()
  })
})

onBeforeUnmount(() => {
  viewport.dispose()
  previewViewport.dispose()
})

watch(() => props.code, () => {
  void renderMindmap()
})

watch(
  () => preview.isOpen.value,
  async (open) => {
    if (!open) {
      return
    }

    await nextTick()
    await waitForPaint()
    previewViewport.reset()
  }
)
</script>

<template>
  <div class="interactive-diagram-card mindmap-diagram-card">
    <div ref="stageRef" class="interactive-diagram-stage mindmap-diagram-stage"
      :class="{ dragging: viewport.dragging.value }">
      <div class="interactive-diagram-canvas mindmap-diagram-canvas">
        <svg ref="svgRef" class="mindmap-svg" :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg">
          <path v-for="(edge, index) in edges" :key="`edge-${index}`" :d="edgePath(edge)" class="mindmap-edge" />
          <g v-for="node in renderedNodes" :key="node.id">
            <rect :x="node.x" :y="node.y" :width="node.width" :height="node.depth === 0 ? 56 : 48" rx="8"
              :fill="node.depth === 0 ? node.color : (isDark ? '#1e293b' : 'rgba(255,255,255,0.95)')"
              :stroke="node.color" :stroke-width="node.depth === 0 ? 0 : 1.5" class="mindmap-node-rect" />
            <text :x="node.textX" :y="(node.y ?? 0) + (node.depth === 0 ? 33 : 29)" :text-anchor="node.textAnchor"
              :fill="node.depth === 0 ? '#ffffff' : (isDark ? '#e2e8f0' : '#0f172a')" class="mindmap-node-text">
              {{ node.text }}
            </text>
          </g>
        </svg>
      </div>

      <div class="interactive-diagram-toolbar mindmap-diagram-toolbar" @pointerdown.stop>
        <button type="button" class="tool-btn" @click="preview.open" title="Fullscreen Preview"
          aria-label="Fullscreen Preview">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
        <button type="button" class="tool-btn" @click="viewport.zoomOut" title="Zoom Out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button type="button" class="tool-btn" @click="viewport.reset" title="Reset View">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <button type="button" class="tool-btn" @click="viewport.zoomIn" title="Zoom In">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div v-if="loading" class="interactive-diagram-state interactive-diagram-overlay">
        <div class="loading-spinner"></div>
      </div>
      <div v-else-if="error" class="interactive-diagram-state interactive-diagram-overlay is-error">
        {{ error }}
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="preview.isOpen.value" class="interactive-diagram-lightbox" role="dialog" aria-modal="true"
      aria-label="Diagram preview" @click.self="preview.close">
      <div class="interactive-diagram-lightbox-shell mindmap-diagram-lightbox-shell">
        <button type="button" class="interactive-diagram-lightbox-close" aria-label="Close preview"
          @click="preview.close">
          &times;
        </button>

        <div ref="previewStageRef"
          class="interactive-diagram-stage interactive-diagram-stage-preview mindmap-diagram-stage mindmap-diagram-stage-preview"
          :class="{ dragging: previewViewport.dragging.value }">
          <div
            class="interactive-diagram-canvas interactive-diagram-canvas-preview mindmap-diagram-canvas mindmap-diagram-canvas-preview">
            <svg ref="previewSvgRef" class="mindmap-svg" :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg">
              <path v-for="(edge, index) in edges" :key="`preview-edge-${index}`" :d="edgePath(edge)"
                class="mindmap-edge" />
              <g v-for="node in renderedNodes" :key="`preview-${node.id}`">
                <rect :x="node.x" :y="node.y" :width="node.width" :height="node.depth === 0 ? 56 : 48" rx="8"
                  :fill="node.depth === 0 ? node.color : (isDark ? '#1e293b' : 'rgba(255,255,255,0.95)')"
                  :stroke="node.color" :stroke-width="node.depth === 0 ? 0 : 1.5" class="mindmap-node-rect" />
                <text :x="node.textX" :y="(node.y ?? 0) + (node.depth === 0 ? 33 : 29)" :text-anchor="node.textAnchor"
                  :fill="node.depth === 0 ? '#ffffff' : (isDark ? '#e2e8f0' : '#0f172a')" class="mindmap-node-text">
                  {{ node.text }}
                </text>
              </g>
            </svg>
          </div>

          <div
            class="interactive-diagram-toolbar interactive-diagram-toolbar-preview mindmap-diagram-toolbar mindmap-diagram-toolbar-preview"
            @pointerdown.stop>
            <button type="button" class="tool-btn" @click="preview.close" title="Exit Fullscreen"
              aria-label="Exit Fullscreen">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="4 14 10 14 10 20"></polyline>
                <polyline points="20 10 14 10 14 4"></polyline>
                <line x1="14" y1="10" x2="21" y2="3"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            </button>
            <button type="button" class="tool-btn" @click="previewViewport.zoomOut" title="Zoom Out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button type="button" class="tool-btn" @click="previewViewport.fit" title="Reset View">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <button type="button" class="tool-btn" @click="previewViewport.zoomIn" title="Zoom In">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>

          <div v-if="loading" class="interactive-diagram-state interactive-diagram-overlay">
            <div class="loading-spinner"></div>
          </div>
          <div v-else-if="error" class="interactive-diagram-state interactive-diagram-overlay is-error">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

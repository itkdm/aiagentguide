<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { usePreviewOverlay, useSvgViewport } from '../utils/diagram'

const props = defineProps<{
    code: string
}>()

const { isDark } = useData()

const stageRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLDivElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const previewStageRef = ref<HTMLDivElement | null>(null)
const previewCanvasRef = ref<HTMLDivElement | null>(null)
const previewSvgRef = ref<SVGSVGElement | null>(null)
const loading = ref(true)
const error = ref('')

let mermaidModulePromise: Promise<any> | null = null

function getMermaidModule() {
    mermaidModulePromise ||= import(
    /* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs'
    )
    return mermaidModulePromise
}

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

function syncPreviewFromMainSvg() {
    if (!previewCanvasRef.value) {
        return
    }

    previewCanvasRef.value.innerHTML = ''
    previewSvgRef.value = null

    if (!svgRef.value) {
        return
    }

    const clonedSvg = svgRef.value.cloneNode(true) as SVGSVGElement
    clonedSvg.style.transform = ''
    clonedSvg.style.transformOrigin = 'center center'
    clonedSvg.classList.add('interactive-diagram-svg')

    previewCanvasRef.value.appendChild(clonedSvg)
    previewSvgRef.value = clonedSvg
}

async function renderDiagram() {
    if (!canvasRef.value) {
        return
    }

    loading.value = true
    error.value = ''
    canvasRef.value.innerHTML = ''

    try {
        const mermaidImport = await getMermaidModule()
        const mermaid = mermaidImport.default ?? mermaidImport.mermaid ?? mermaidImport

        mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'loose',
            theme: isDark.value ? 'dark' : 'default',
            fontFamily:
                '"Avenir Next", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif'
        })

        const id = `mermaid-${Math.random().toString(36).slice(2, 10)}`
        const { svg } = await mermaid.render(id, props.code)

        canvasRef.value.innerHTML = svg
        svgRef.value = canvasRef.value.querySelector('svg')

        if (!svgRef.value) {
            throw new Error('Mermaid did not produce an SVG.')
        }

        svgRef.value.classList.add('interactive-diagram-svg')
        await nextTick()
        viewport.reset()

        if (preview.isOpen.value && previewCanvasRef.value) {
            syncPreviewFromMainSvg()
            await waitForPaint()
            previewViewport.fit()
        }
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Mermaid render failed.'
        svgRef.value = null
        previewSvgRef.value = null
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    nextTick(() => {
        void renderDiagram()
    })
})

onBeforeUnmount(() => {
    viewport.dispose()
    previewViewport.dispose()
})

watch([() => props.code, isDark], () => {
    void renderDiagram()
})

watch(
    [() => preview.isOpen.value, previewCanvasRef],
    async ([open, previewCanvas]) => {
        if (!open || !previewCanvas) {
            return
        }

        await nextTick()
        syncPreviewFromMainSvg()
        await waitForPaint()
        previewViewport.fit()
    },
    { flush: 'post' }
)
</script>

<template>
    <div class="interactive-diagram-card mermaid-diagram-card">
        <div ref="stageRef" class="interactive-diagram-stage mermaid-diagram-stage"
            :class="{ dragging: viewport.dragging.value }">
            <div ref="canvasRef" class="interactive-diagram-canvas mermaid-diagram-canvas" />

            <div class="interactive-diagram-toolbar mermaid-diagram-toolbar" @pointerdown.stop>
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
            <div class="interactive-diagram-lightbox-shell mermaid-diagram-lightbox-shell">
                <button type="button" class="interactive-diagram-lightbox-close" aria-label="Close preview"
                    @click="preview.close">
                    &times;
                </button>

                <div ref="previewStageRef"
                    class="interactive-diagram-stage interactive-diagram-stage-preview mermaid-diagram-stage mermaid-diagram-stage-preview"
                    :class="{ dragging: previewViewport.dragging.value }">
                    <div ref="previewCanvasRef"
                        class="interactive-diagram-canvas interactive-diagram-canvas-preview mermaid-diagram-canvas mermaid-diagram-canvas-preview" />

                    <div class="interactive-diagram-toolbar interactive-diagram-toolbar-preview mermaid-diagram-toolbar mermaid-diagram-toolbar-preview"
                        @pointerdown.stop>
                        <button type="button" class="tool-btn" @click="preview.close" title="Exit Fullscreen"
                            aria-label="Exit Fullscreen">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <polyline points="4 14 10 14 10 20"></polyline>
                                <polyline points="20 10 14 10 14 4"></polyline>
                                <line x1="14" y1="10" x2="21" y2="3"></line>
                                <line x1="3" y1="21" x2="10" y2="14"></line>
                            </svg>
                        </button>
                        <button type="button" class="tool-btn" @click="previewViewport.zoomOut" title="Zoom Out">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <button type="button" class="tool-btn" @click="previewViewport.fit" title="Reset View">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>
                        <button type="button" class="tool-btn" @click="previewViewport.zoomIn" title="Zoom In">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2">
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

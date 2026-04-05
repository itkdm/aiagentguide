import { nextTick, onBeforeUnmount, ref, type Ref, watch } from 'vue'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getSvgSize(svg: SVGSVGElement) {
  try {
    const bbox = svg.getBBox()
    if (bbox.width > 0 && bbox.height > 0) {
      return { width: bbox.width, height: bbox.height }
    }
  } catch {
    // Ignore and fall back to viewBox or client rect.
  }

  const viewBox = svg.viewBox.baseVal

  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    return { width: viewBox.width, height: viewBox.height }
  }

  const rect = svg.getBoundingClientRect()
  return {
    width: rect.width || 1200,
    height: rect.height || 800
  }
}

export async function downloadSvgAsPng(svg: SVGSVGElement, fileName: string) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  const { width, height } = getSvgSize(clone)

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', `${width}`)
  clone.setAttribute('height', `${height}`)
  clone.style.transform = ''

  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  background.setAttribute('width', '100%')
  background.setAttribute('height', '100%')
  background.setAttribute('fill', '#ffffff')
  clone.insertBefore(background, clone.firstChild)

  const serialized = new XMLSerializer().serializeToString(clone)
  const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  try {
    const img = new Image()
    const loaded = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Image export failed.'))
    })

    img.src = url
    await loaded

    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(width)
    canvas.height = Math.ceil(height)

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Canvas export is not available.')
    }

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = fileName
    link.click()
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function useSvgViewport(
  stageRef: Ref<HTMLElement | null>,
  svgRef: Ref<SVGSVGElement | null>,
  options?: {
    minPanRatio?: number
    viewportRef?: Ref<HTMLElement | null>
  }
) {
  const scale = ref(1)
  const offsetX = ref(0)
  const offsetY = ref(0)
  const dragging = ref(false)
  const minPanRatio = options?.minPanRatio ?? 0
  const viewportRef = options?.viewportRef ?? stageRef

  let cleanup: (() => void) | null = null
  let resizeObserver: ResizeObserver | null = null
  let observedSvg: SVGSVGElement | null = null
  let viewportWidth = 0
  let viewportHeight = 0
  let anchorX = 0
  let anchorY = 0
  let svgWidth = 1200
  let svgHeight = 800
  let rafId = 0

  function refreshMetrics(forceSvgMeasure = false) {
    const viewport = viewportRef.value
    const svg = svgRef.value

    if (viewport) {
      const styles = window.getComputedStyle(viewport)
      const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0
      const paddingRight = Number.parseFloat(styles.paddingRight) || 0
      const paddingTop = Number.parseFloat(styles.paddingTop) || 0
      const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0

      viewportWidth = Math.max(viewport.clientWidth - paddingLeft - paddingRight, 0)
      viewportHeight = Math.max(viewport.clientHeight - paddingTop - paddingBottom, 0)
      anchorX = paddingLeft + viewportWidth / 2
      anchorY = paddingTop + viewportHeight / 2
    }

    if (!svg) {
      return
    }

    if (forceSvgMeasure || svg !== observedSvg) {
      const clientWidth = svg.clientWidth
      const clientHeight = svg.clientHeight

      if (clientWidth > 0 && clientHeight > 0) {
        svgWidth = clientWidth
        svgHeight = clientHeight
        observedSvg = svg
        return
      }

      const size = getSvgSize(svg)
      svgWidth = size.width
      svgHeight = size.height
      observedSvg = svg
    }
  }

  function clampOffsetToStage() {
    if (!viewportRef.value || !svgRef.value) {
      return
    }

    if (viewportWidth <= 0 || viewportHeight <= 0 || svgWidth <= 0 || svgHeight <= 0) {
      return
    }

    const scaledWidth = svgWidth * scale.value
    const scaledHeight = svgHeight * scale.value
    
    // Allow dragging freely within the bounds, even if the SVG is smaller or larger than the viewport.
    // Calculate the scrollable area based on both dimensions so it can be moved freely inside the container.
    const maxOffsetX = (scaledWidth + viewportWidth) / 2
    const maxOffsetY = (scaledHeight + viewportHeight) / 2

    offsetX.value = clamp(offsetX.value, -maxOffsetX, maxOffsetX)
    offsetY.value = clamp(offsetY.value, -maxOffsetY, maxOffsetY)
  }

  function applyTransform() {
    if (!svgRef.value) {
      return
    }

    clampOffsetToStage()

    svgRef.value.style.position = 'absolute'
    svgRef.value.style.left = `${anchorX}px`
    svgRef.value.style.top = `${anchorY}px`
    svgRef.value.style.transformOrigin = 'center center'
    svgRef.value.style.transform = `translate(-50%, -50%) translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`
  }

  function scheduleTransform() {
    if (rafId) {
      return
    }

    rafId = window.requestAnimationFrame(() => {
      rafId = 0
      applyTransform()
    })
  }

  function zoomIn() {
    scale.value = clamp(scale.value * 1.2, 0.1, 5)
    applyTransform()
  }

  function zoomOut() {
    scale.value = clamp(scale.value / 1.2, 0.1, 5)
    applyTransform()
  }

  function reset() {
    scale.value = 1
    offsetX.value = 0
    offsetY.value = 0
    nextTick(() => {
      refreshMetrics(true)
      applyTransform()
    })
  }

  function fit() {
    const viewport = viewportRef.value
    const svg = svgRef.value

    if (!viewport || !svg) {
      return
    }

    refreshMetrics(true)

    if (viewportWidth <= 0 || viewportHeight <= 0 || svgWidth <= 0 || svgHeight <= 0) {
      reset()
      return
    }

    const padding = 36
    const availableWidth = Math.max(viewportWidth - padding, 1)
    const availableHeight = Math.max(viewportHeight - padding, 1)

    scale.value = clamp(Math.min(availableWidth / svgWidth, availableHeight / svgHeight), 0.1, 5)
    offsetX.value = 0
    offsetY.value = 0
    nextTick(() => applyTransform())
  }

  function bind() {
    cleanup?.()
    resizeObserver?.disconnect()
    resizeObserver = null

    const stage = stageRef.value
    const viewport = viewportRef.value
    const svg = svgRef.value

    if (!stage || !viewport || !svg) {
      return
    }

    let pointerId = -1
    let startX = 0
    let startY = 0
    let baseX = 0
    let baseY = 0
    const dragThreshold = 4

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const delta = event.deltaY < 0 ? 1.1 : 0.9
      scale.value = clamp(scale.value * delta, 0.1, 5)
      scheduleTransform()
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) {
        return
      }

      pointerId = event.pointerId
      dragging.value = false
      startX = event.clientX
      startY = event.clientY
      baseX = offsetX.value
      baseY = offsetY.value
      stage.setPointerCapture(pointerId)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) {
        return
      }

      const deltaX = event.clientX - startX
      const deltaY = event.clientY - startY

      if (!dragging.value && Math.hypot(deltaX, deltaY) < dragThreshold) {
        return
      }

      dragging.value = true
      offsetX.value = baseX + deltaX
      offsetY.value = baseY + deltaY
      scheduleTransform()
    }

    const finishDrag = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) {
        return
      }

      dragging.value = false
      stage.releasePointerCapture(pointerId)
      pointerId = -1
    }

    const handleLostPointerCapture = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) {
        return
      }

      dragging.value = false
      pointerId = -1
    }

    refreshMetrics(true)

    resizeObserver = new ResizeObserver(() => {
      refreshMetrics(true)
      applyTransform()
    })
    resizeObserver.observe(viewport)
    resizeObserver.observe(svg)

    stage.addEventListener('wheel', handleWheel, { passive: false })
    stage.addEventListener('pointerdown', handlePointerDown)
    stage.addEventListener('pointermove', handlePointerMove)
    stage.addEventListener('pointerup', finishDrag)
    stage.addEventListener('pointercancel', finishDrag)
    stage.addEventListener('lostpointercapture', handleLostPointerCapture)

    cleanup = () => {
      stage.removeEventListener('wheel', handleWheel)
      stage.removeEventListener('pointerdown', handlePointerDown)
      stage.removeEventListener('pointermove', handlePointerMove)
      stage.removeEventListener('pointerup', finishDrag)
      stage.removeEventListener('pointercancel', finishDrag)
      stage.removeEventListener('lostpointercapture', handleLostPointerCapture)
      resizeObserver?.disconnect()
      resizeObserver = null
      observedSvg = null
      if (rafId) {
        window.cancelAnimationFrame(rafId)
        rafId = 0
      }
    }
  }

  watch([stageRef, viewportRef, svgRef], () => {
    refreshMetrics(true)
    bind()
    applyTransform()
  })

  return {
    dragging,
    fit,
    zoomIn,
    zoomOut,
    reset,
    refresh() {
      refreshMetrics(true)
      applyTransform()
    },
    dispose() {
      cleanup?.()
      cleanup = null
      resizeObserver?.disconnect()
      resizeObserver = null
      observedSvg = null
      if (rafId) {
        window.cancelAnimationFrame(rafId)
        rafId = 0
      }
    }
  }
}

export function usePreviewOverlay() {
  const isOpen = ref(false)
  let previousOverflow = ''

  function syncBodyScrollLock(open: boolean) {
    if (typeof document === 'undefined') {
      return
    }

    if (open) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return
    }

    document.body.style.overflow = previousOverflow
  }

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen.value) {
      close()
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
  }

  watch(isOpen, (open) => {
    syncBodyScrollLock(open)
  })

  onBeforeUnmount(() => {
    syncBodyScrollLock(false)
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown)
    }
  })

  return {
    isOpen,
    open,
    close,
    toggle
  }
}

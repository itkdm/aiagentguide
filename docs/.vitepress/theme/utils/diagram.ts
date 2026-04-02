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
  svgRef: Ref<SVGSVGElement | null>
) {
  const scale = ref(1)
  const offsetX = ref(0)
  const offsetY = ref(0)
  const dragging = ref(false)

  let cleanup: (() => void) | null = null

  function applyTransform() {
    if (!svgRef.value) {
      return
    }

    svgRef.value.style.transformOrigin = 'center center'
    svgRef.value.style.transform = `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`
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
    nextTick(() => applyTransform())
  }

  function fit() {
    const stage = stageRef.value
    const svg = svgRef.value

    if (!stage || !svg) {
      return
    }

    const stageRect = stage.getBoundingClientRect()
    const { width, height } = getSvgSize(svg)

    if (stageRect.width <= 0 || stageRect.height <= 0 || width <= 0 || height <= 0) {
      reset()
      return
    }

    const padding = 36
    const availableWidth = Math.max(stageRect.width - padding, 1)
    const availableHeight = Math.max(stageRect.height - padding, 1)

    scale.value = clamp(Math.min(availableWidth / width, availableHeight / height), 0.1, 4)
    offsetX.value = 0
    offsetY.value = 0
    nextTick(() => applyTransform())
  }

  function bind() {
    cleanup?.()

    const stage = stageRef.value

    if (!stage) {
      return
    }

    let pointerId = -1
    let startX = 0
    let startY = 0
    let baseX = 0
    let baseY = 0

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      // Use metabolic scaling (multiplicative) rather than additive for smoother feel
      const delta = event.deltaY < 0 ? 1.1 : 0.9
      scale.value = clamp(scale.value * delta, 0.1, 5)
      applyTransform()
    }

    const handlePointerDown = (event: PointerEvent) => {
      pointerId = event.pointerId
      dragging.value = true
      startX = event.clientX
      startY = event.clientY
      baseX = offsetX.value
      baseY = offsetY.value
      stage.setPointerCapture(pointerId)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging.value || event.pointerId !== pointerId) {
        return
      }

      offsetX.value = baseX + event.clientX - startX
      offsetY.value = baseY + event.clientY - startY
      applyTransform()
    }

    const finishDrag = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) {
        return
      }

      dragging.value = false
      stage.releasePointerCapture(pointerId)
      pointerId = -1
    }

    stage.addEventListener('wheel', handleWheel, { passive: false })
    stage.addEventListener('pointerdown', handlePointerDown)
    stage.addEventListener('pointermove', handlePointerMove)
    stage.addEventListener('pointerup', finishDrag)
    stage.addEventListener('pointercancel', finishDrag)
    stage.addEventListener('pointerleave', finishDrag)

    cleanup = () => {
      stage.removeEventListener('wheel', handleWheel)
      stage.removeEventListener('pointerdown', handlePointerDown)
      stage.removeEventListener('pointermove', handlePointerMove)
      stage.removeEventListener('pointerup', finishDrag)
      stage.removeEventListener('pointercancel', finishDrag)
      stage.removeEventListener('pointerleave', finishDrag)
    }
  }

  watch([stageRef, svgRef], () => {
    bind()
    applyTransform()
  })

  return {
    dragging,
    fit,
    zoomIn,
    zoomOut,
    reset,
    dispose() {
      cleanup?.()
      cleanup = null
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

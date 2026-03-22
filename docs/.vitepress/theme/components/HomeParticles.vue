<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
    if (!canvas.value) return

    const ctx = canvas.value.getContext('2d')
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    canvas.value.width = width
    canvas.value.height = height

    const particles: Particle[] = []
    const maxParticles = 60
    const connectionDistance = 150

    class Particle {
        x: number
        y: number
        vx: number
        vy: number
        size: number

        constructor() {
            this.x = Math.random() * width
            this.y = Math.random() * height
            this.vx = (Math.random() - 0.5) * 0.5
            this.vy = (Math.random() - 0.5) * 0.5
            this.size = Math.random() * 2 + 1
        }

        update() {
            this.x += this.vx
            this.y += this.vy

            if (this.x < 0 || this.x > width) this.vx *= -1
            if (this.y < 0 || this.y > height) this.vy *= -1
        }

        draw() {
            if (!ctx) return
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(37, 99, 235, 0.4)' // Brand color
            ctx.fill()
        }
    }

    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle())
    }

    let mouseX = -1
    let mouseY = -1

    const animate = () => {
        ctx.clearRect(0, 0, width, height)

        // Update and draw particles
        particles.forEach((p, index) => {
            p.update()
            p.draw()

            // Connect to other particles
            for (let j = index + 1; j < particles.length; j++) {
                const p2 = particles[j]
                const dx = p.x - p2.x
                const dy = p.y - p2.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < connectionDistance) {
                    ctx.beginPath()
                    ctx.strokeStyle = `rgba(37, 99, 235, ${0.15 * (1 - distance / connectionDistance)})`
                    ctx.lineWidth = 1
                    ctx.moveTo(p.x, p.y)
                    ctx.lineTo(p2.x, p2.y)
                    ctx.stroke()
                }
            }

            // Connect to mouse
            if (mouseX > 0 && mouseY > 0) {
                const dx = p.x - mouseX
                const dy = p.y - mouseY
                const distance = Math.sqrt(dx * dx + dy * dy)
                if (distance < 200) {
                    ctx.beginPath()
                    ctx.strokeStyle = `rgba(37, 99, 235, ${0.2 * (1 - distance / 200)})`
                    ctx.lineWidth = 1
                    ctx.moveTo(p.x, p.y)
                    ctx.lineTo(mouseX, mouseY)
                    ctx.stroke()
                }
            }
        })

        requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
        width = window.innerWidth
        height = window.innerHeight
        if (canvas.value) {
            canvas.value.width = width
            canvas.value.height = height
        }
    }

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.value?.getBoundingClientRect()
        if (rect) {
            mouseX = e.clientX - rect.left
            mouseY = e.clientY - rect.top
        }
    }

    const handleMouseLeave = () => {
        mouseX = -1
        mouseY = -1
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    onUnmounted(() => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseleave', handleMouseLeave)
    })
})
</script>

<template>
    <canvas ref="canvas" class="home-hero-particles"></canvas>
</template>

<style scoped>
.home-hero-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    /* Let clicks pass through */
    z-index: 0;
}
</style>
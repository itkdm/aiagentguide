<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const targets = ['自主', '可靠', '高效']

onMounted(() => {
    const tagline = document.querySelector('.VPHomeHero .tagline')
    if (!tagline) return

    let index = 0
    let intervalId: any = null

    // Initialize structure
    // Using a span to wrap the changing word for animation control
    const updateTagline = () => {
        tagline.innerHTML = `构建 <span class="tagline-rotator">${targets[index]}</span> 的智能体`
    }

    updateTagline()

    const rotate = () => {
        const el = tagline.querySelector('.tagline-rotator') as HTMLElement
        if (!el) return

        // Start exit animation
        el.classList.add('fade-out')

        setTimeout(() => {
            // Change text and prepare enter animation
            index = (index + 1) % targets.length
            el.textContent = targets[index]

            el.classList.remove('fade-out')
            el.classList.add('fade-in')

            // Cleanup classes after animation
            setTimeout(() => {
                el.classList.remove('fade-in')
            }, 500)
        }, 400) // Wait for fade-out duration
    }

    intervalId = setInterval(rotate, 3000)

    onUnmounted(() => {
        if (intervalId) clearInterval(intervalId)
    })
})
</script>

<template>
    <div class="home-hero-rotator-control"></div>
</template>

<style>
/* Global styles for the injected tagline elements */
.VPHomeHero .tagline .tagline-rotator {
    display: inline-block;
    color: var(--vp-c-brand-1);
    font-weight: 700;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    /* Ensure minimum width to prevent layout jumping */
    min-width: 2.5em;
    text-align: center;
}

.VPHomeHero .tagline .tagline-rotator.fade-out {
    opacity: 0;
    transform: translateY(-10px);
}

.VPHomeHero .tagline .tagline-rotator.fade-in {
    opacity: 0;
    transform: translateY(10px);
    /* Start from bottom */
    animation: slide-in 0.4s forwards;
}

@keyframes slide-in {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
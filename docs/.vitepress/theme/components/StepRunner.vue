<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
    totalSteps: { type: Number, required: true },
    autoPlay: { type: Boolean, default: false },
    interval: { type: Number, default: 2000 } // Slower interval for better visibility
})

const emit = defineEmits(['change'])

const currentStep = ref(0)
const isPlaying = ref(props.autoPlay)
let timer = null

const next = () => {
    currentStep.value = (currentStep.value + 1) % props.totalSteps
    emit('change', currentStep.value)
}

const prev = () => {
    currentStep.value = (currentStep.value - 1 + props.totalSteps) % props.totalSteps
    emit('change', currentStep.value)
}

const reset = () => {
    currentStep.value = 0
    isPlaying.value = false
    stopTimer()
    emit('change', currentStep.value)
}

const togglePlay = () => {
    isPlaying.value = !isPlaying.value
    if (isPlaying.value) {
        startTimer()
        // If we are at the end, restart
        if (currentStep.value === props.totalSteps - 1) {
            currentStep.value = 0
            emit('change', currentStep.value)
        }
    } else {
        stopTimer()
    }
}

const startTimer = () => {
    stopTimer()
    timer = setInterval(() => {
        if (currentStep.value < props.totalSteps - 1) {
            next()
        } else {
            // Loop or stop? Let's loop.
            next()
        }
    }, props.interval)
}

const stopTimer = () => {
    if (timer) clearInterval(timer)
    timer = null
}

watch(() => props.autoPlay, (val) => {
    if (val) startTimer()
    else stopTimer()
}, { immediate: true })

onUnmounted(stopTimer)
</script>

<template>
    <div class="step-runner">
        <div class="content-area">
            <slot :currentStep="currentStep" />
        </div>

        <div class="controls">
            <div class="control-group">
                <button class="control-btn" @click="reset" title="Reset">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
                        <path d="M3 3v9h9" />
                    </svg>
                </button>
                <button class="control-btn" @click="prev" title="Previous">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>
                <button class="control-btn play-btn" @click="togglePlay" :title="isPlaying ? 'Pause' : 'Play'">
                    <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                    </svg>
                </button>
                <button class="control-btn" @click="next" title="Next">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>
            </div>
            <div class="step-indicator">Step {{ currentStep + 1 }} / {{ totalSteps }}</div>
        </div>
    </div>
</template>

<style scoped>
.step-runner {
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    background-color: var(--vp-c-bg-soft);
    overflow: hidden;
    margin: 1em 0;
}

.content-area {
    padding: 20px;
    min-height: 200px;
    /* Ensure some height */
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--vp-c-bg);
}

.controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background-color: var(--vp-c-bg-soft);
    border-top: 1px solid var(--vp-c-divider);
}

.control-group {
    display: flex;
    gap: 8px;
}

.control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid var(--vp-c-divider);
    background-color: var(--vp-c-bg);
    color: var(--vp-c-text-1);
    cursor: pointer;
    transition: all 0.2s;
}

.control-btn:hover {
    background-color: var(--vp-c-brand);
    color: white;
    border-color: var(--vp-c-brand);
}

.play-btn {
    width: 48px;
    /* Slightly wider */
}

.step-indicator {
    font-size: 0.9em;
    color: var(--vp-c-text-2);
    font-family: var(--vp-font-family-mono);
}
</style>

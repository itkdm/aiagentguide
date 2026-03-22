<script setup lang="ts">
const techs = [
    'AstronClaw',
    'AutoGen',
    'BrowserUse',
    'Coze',
    'CrewAI',
    'DeepEval',
    'Dify',
    'Flowise',
    'Flowith',
    'Genspark',
    'LangFuse',
    'LangGraph',
    'LlamaIndex',
    'Manus',
    'Mastra',
    'n8n',
    'OpenHands',
    'Operator',
    'Playwright',
    'PromptFoo',
    'QoderWork',
    'Skywork'
]
</script>

<template>
    <div class="tech-stack-section">
        <div class="tech-wrapper">
            <div class="scroller">
                <div class="tech-list">
                    <div v-for="tech in techs" :key="tech" class="tech-item glass-card">
                        {{ tech }}
                    </div>
                    <!-- Duplicate for seamless scrolling -->
                    <div v-for="tech in techs" :key="tech + '-dup'" class="tech-item glass-card">
                        {{ tech }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tech-stack-section {
    padding: 40px 0;
    overflow: hidden;
    position: relative;
    width: 100%;
}

.tech-wrapper {
    max-width: 1152px;
    margin: 0 auto;
    padding: 0 24px;
    mask-image: linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent);
}

.scroller {
    width: max-content;
}

.tech-list {
    display: flex;
    gap: 24px;
    animation: scroll 40s linear infinite;
    padding: 10px 24px;
}

.tech-item {
    padding: 12px 28px;
    border-radius: 9999px;
    /* full rounded */
    font-weight: 600;
    color: var(--vp-c-text-1);
    white-space: nowrap;
    font-size: 15px;
    /* Override basic glass card for pill shape */
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.4);
    /* border: 1px solid rgba(255,255,255,0.3); */
}

.dark .tech-item {
    background: rgba(255, 255, 255, 0.05);
}

.tech-item:hover {
    border-color: var(--vp-c-brand-1);
    background: var(--vp-c-brand-soft);
    color: var(--vp-c-brand-1);
    transform: scale(1.05);
}

@keyframes scroll {
    to {
        transform: translateX(calc(-50% - 12px));
        /* half width + half gap */
    }
}

.scroller:hover .tech-list {
    animation-play-state: paused;
}
</style>
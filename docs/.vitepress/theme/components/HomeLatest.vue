<script setup lang="ts">
import { withBase } from 'vitepress'

const latestUpdates = [
    {
        type: 'Update',
        date: '2024-03-20',
        title: '新增 CrewAI 多智能体协作实战教程',
        link: '/tutorials/crewai'
    },
    {
        type: 'New',
        date: '2024-03-15',
        title: '深度解析：GPT-4o 带来的 Agent 能力跃迁',
        link: '/news/gpt-4o-agent'
    },
    {
        type: 'Guide',
        date: '2024-03-10',
        title: '从零开始构建你的第一个 RAG 应用',
        link: '/getting-started/rag-app'
    }
]
</script>

<template>
    <div class="home-latest">
        <div class="wrapper">
            <h2 class="section-title">最新动态</h2>
            <div class="updates-list">
                <a v-for="update in latestUpdates" :key="update.title" :href="withBase(update.link)"
                    class="update-item glass-card">
                    <div class="update-meta">
                        <span class="update-type" :class="update.type.toLowerCase()">{{ update.type }}</span>
                        <span class="update-date">{{ update.date }}</span>
                    </div>
                    <h3 class="update-title">{{ update.title }}</h3>
                    <span class="update-arrow">→</span>
                </a>
            </div>
        </div>
    </div>
</template>

<style scoped>
.home-latest {
    padding: 64px 24px;
}

.wrapper {
    max-width: 800px;
    margin: 0 auto;
}

.section-title {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 48px;
    text-align: center;
    background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
}

.updates-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.update-item {
    display: flex;
    align-items: center;
    padding: 24px 32px;
    border-radius: 20px;
    text-decoration: none;
    color: var(--vp-c-text-1);
}

.update-meta {
    display: flex;
    flex-direction: column;
    margin-right: 32px;
    min-width: 120px;
}

.update-type {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
}

.update-type.new {
    color: #10b981;
}

.update-type.update {
    color: #3b82f6;
}

.update-type.guide {
    color: #f59e0b;
}

.update-date {
    font-size: 13px;
    color: var(--vp-c-text-3);
    font-family: var(--vp-font-family-mono);
}

.update-title {
    font-size: 18px;
    font-weight: 600;
    flex-grow: 1;
    margin: 0;
    line-height: 1.4;
}

.update-arrow {
    font-size: 20px;
    color: var(--vp-c-brand-1);
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s;
}

.update-item:hover .update-arrow {
    opacity: 1;
    transform: translateX(0);
}
</style>
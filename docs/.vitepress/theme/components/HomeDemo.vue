<script setup lang="ts">
import { ref, onMounted } from 'vue'

const codeLines = [
    { text: 'from agent_core import Agent, Tool', class: 'import' },
    { text: '', class: '' },
    { text: '# 初始化智能体配置', class: 'comment' },
    { text: 'bot = Agent(role="金融分析师", model="gpt-4")', class: 'code' },
    { text: '', class: '' },
    { text: '@bot.tool', class: 'decorator' },
    { text: 'def get_market_data(symbol: str):', class: 'def' },
    { text: '    return stock_api.get(symbol)', class: 'return' },
    { text: '', class: '' },
    { text: '# 执行中文指令任务', class: 'comment' },
    { text: 'bot.run("分析一下英伟达(NVDA)的股价趋势")', class: 'code' },
]

const terminalLines = ref<string[]>([])
const isPlaying = ref(false)
const isTyping = ref(false)
const copied = ref(false)

const copyCode = async () => {
    const code = codeLines.map(l => l.text).join('\n')
    try {
        await navigator.clipboard.writeText(code)
        copied.value = true
        setTimeout(() => copied.value = false, 2000)
    } catch (e) {
        console.error('Copy failed', e)
    }
}

const playAnimation = async () => {
    if (isPlaying.value) return
    isPlaying.value = true
    terminalLines.value = []

    // Phase 1: Typing command
    isTyping.value = true
    await typeLine('$ python main.py', 50)
    isTyping.value = false

    await delay(500)

    // Phase 2: Agent execution logs
    await addLog('[System] 智能体 "金融分析师" 已初始化就绪', 'info')
    await delay(600)
    await addLog('[Thought] 用户需要分析 NVDA 的股价。我需要先获取实时行情数据，再结合技术指标进行判断。', 'thought')
    await delay(1200)
    await addLog('[Action] 调用工具: get_market_data("NVDA")', 'action')
    await delay(1200)
    await addLog('[Observation] 价格: $895.20 | 涨跌幅: +3.5% | 交易量: 异常放大', 'observation')
    await delay(800)
    await addLog('[Final] 基于当前数据，英伟达目前处于强劲上升通道，建议持有...', 'success')

    isPlaying.value = false

    // Auto replay
    setTimeout(playAnimation, 5000)
}

const typeLine = async (text: string, speed: number) => {
    let current = ''
    terminalLines.value.push(current)
    const index = terminalLines.value.length - 1

    for (const char of text) {
        current += char
        terminalLines.value[index] = current
        await delay(Math.random() * speed + 30) // Human-like typing variance
    }
}

const addLog = async (text: string, type: string) => {
    terminalLines.value.push(`<span class="log-${type}">${text}</span>`)
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

onMounted(() => {
    playAnimation()
})
</script>

<template>
    <div class="home-section home-demo">
        <div class="wrapper">
            <div class="demo-window glass-card">
                <div class="window-header">
                    <div class="window-controls">
                        <span class="dot red"></span>
                        <span class="dot yellow"></span>
                        <span class="dot green"></span>
                    </div>
                    <div class="window-title">main.py — Agent Workflow</div>
                </div>
                <div class="window-body">
                    <div class="editor-pane">
                        <!-- Copy Button -->
                        <button class="copy-btn" @click="copyCode" :class="{ copied }" title="Copy Code">
                            <span v-if="copied" class="copied-text">已复制</span>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>

                        <div class="line-numbers">
                            <span v-for="n in 12" :key="n">{{ n }}</span>
                        </div>
                        <div class="code-content">
                            <div v-for="(line, i) in codeLines" :key="i" :class="['code-line', line.class]">
                                {{ line.text }}
                            </div>
                        </div>
                    </div>
                    <div class="terminal-pane">
                        <div class="terminal-header">Terminal</div>
                        <div class="terminal-content">
                            <div v-for="(line, i) in terminalLines" :key="i" class="term-line" v-html="line"></div>
                            <div class="cursor" v-if="isPlaying" :class="{ 'is-typing': isTyping }"></div>
                        </div>
                    </div>
                </div>
                <!-- Status Bar -->
                <div class="status-bar">
                    <div class="status-section left">
                        <div class="status-item git-branch">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <line x1="6" y1="3" x2="6" y2="15"></line>
                                <circle cx="18" cy="6" r="3"></circle>
                                <circle cx="6" cy="18" r="3"></circle>
                                <path d="M18 9a9 9 0 0 1-9 9"></path>
                            </svg>
                            main*
                        </div>
                        <div class="status-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            0 errors
                        </div>
                    </div>
                    <div class="status-section right">
                        <div class="status-item">Ln 10, Col 42</div>
                        <div class="status-item">UTF-8</div>
                        <div class="status-item lang-item">
                            <span class="lang-dot"></span>
                            Python 3.10
                        </div>
                        <div class="status-item notification">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.wrapper {
    max-width: 1152px;
    margin: 0 auto;
    padding: 0 24px;
    width: 100%;
}

.demo-window {
    border-radius: 12px;
    overflow: hidden;
    background: #0f172a;
    border: 1px solid rgba(56, 189, 248, 0.2);
    box-shadow:
        0 25px 50px -12px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(56, 189, 248, 0.1),
        0 0 20px rgba(56, 189, 248, 0.05);
    transform: rotateX(1.5deg) translateY(10px);
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
}

.demo-window:hover {
    transform: rotateX(0deg) translateY(0);
    box-shadow:
        0 30px 60px -15px rgba(0, 0, 0, 0.6),
        0 0 0 1px rgba(56, 189, 248, 0.3),
        0 0 30px rgba(56, 189, 248, 0.15);
    border-color: rgba(56, 189, 248, 0.4);
}

.demo-window::before,
.demo-window::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid transparent;
    pointer-events: none;
    transition: all 0.3s ease;
}

.demo-window::before {
    top: -1px;
    left: -1px;
    border-top-color: rgba(56, 189, 248, 0.5);
    border-left-color: rgba(56, 189, 248, 0.5);
    border-top-left-radius: 12px;
}

.demo-window::after {
    bottom: -1px;
    right: -1px;
    border-bottom-color: rgba(56, 189, 248, 0.5);
    border-right-color: rgba(56, 189, 248, 0.5);
    border-bottom-right-radius: 12px;
}

.window-header {
    background: rgba(30, 41, 59, 0.8);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgba(56, 189, 248, 0.1);
}

.window-controls {
    display: flex;
    gap: 8px;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.red {
    background: #ef4444;
}

.yellow {
    background: #eab308;
}

.green {
    background: #22c55e;
}

.window-title {
    flex: 1;
    text-align: center;
    color: #94a3b8;
    font-size: 0.9rem;
    font-family: var(--vp-font-family-mono);
    text-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
}

.window-body {
    display: flex;
    flex-direction: column;
}

@media(min-width: 768px) {
    .window-body {
        flex-direction: row;
        height: 420px;
    }
}

/* Editor Pane */
.editor-pane {
    flex: 1;
    padding: 20px;
    background: #0f172a;
    display: flex;
    gap: 16px;
    border-right: 1px solid rgba(56, 189, 248, 0.1);
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    overflow-x: auto;
    overflow-y: hidden;
}

@media (max-width: 768px) {
    .editor-pane {
        padding: 16px;
        font-size: 12px;
        border-right: none;
        border-bottom: 1px solid rgba(56, 189, 248, 0.1);
    }
}

.line-numbers {
    display: flex;
    flex-direction: column;
    color: #334155;
    text-align: right;
    user-select: none;
    min-width: 2em;
}

.code-content {
    flex: 1;
}

.code-line {
    height: 1.5em;
    color: #e2e8f0;
    white-space: pre;
}

.import {
    color: #c084fc;
}

.comment {
    color: #64748b;
    font-style: italic;
}

.decorator {
    color: #fbbf24;
}

.def {
    color: #38bdf8;
}

.return {
    color: #f472b6;
}

/* Copy Button */
.copy-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: all 0.2s;
}

.copy-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #e2e8f0;
}

.copy-btn.copied {
    width: auto;
    padding: 0 8px;
    color: #4ade80;
    border-color: rgba(74, 222, 128, 0.3);
    background: rgba(74, 222, 128, 0.1);
}

.copied-text {
    font-size: 11px;
    font-weight: 600;
}

/* Status Bar */
.status-bar {
    height: 22px;
    background: #1e293b;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    font-size: 11px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #ffffff;
    user-select: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.status-section {
    display: flex;
    align-items: center;
    gap: 12px;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0.9;
    cursor: default;
}

.status-item svg {
    opacity: 0.8;
}

.lang-item {
    display: flex;
    align-items: center;
    gap: 6px;
}

.lang-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #fbbf24;
}

/* Terminal Pane */
.terminal-pane {
    flex: 1;
    background: #020617;
    display: flex;
    flex-direction: column;
    font-family: 'Fira Code', monospace;
    overflow-x: auto;
}

@media (max-width: 768px) {
    .terminal-pane {
        font-size: 12px;
    }
}

.terminal-header {
    padding: 8px 16px;
    font-size: 11px;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1px solid rgba(56, 189, 248, 0.1);
    background: rgba(15, 23, 42, 0.5);
}

.terminal-content {
    padding: 20px;
    font-size: 13px;
    color: #e2e8f0;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    background-image: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
    background-size: 100% 2px, 3px 100%;
}

@media (max-width: 768px) {
    .terminal-content {
        padding: 16px;
        font-size: 11px;
    }
}

.term-line {
    margin-bottom: 8px;
    min-height: 1.4em;
    line-height: 1.5;
    text-shadow: 0 0 5px rgba(56, 189, 248, 0.3);
}

:deep(.log-info) {
    color: #94a3b8;
}

:deep(.log-thought) {
    color: #fcd34d;
}

:deep(.log-action) {
    color: #38bdf8;
    font-weight: bold;
}

:deep(.log-observation) {
    color: #67e8f9;
}

:deep(.log-success) {
    color: #4ade80;
}

.cursor {
    display: inline-block;
    width: 8px;
    height: 14px;
    background: #38bdf8;
    box-shadow: 0 0 8px #38bdf8;
    animation: blink 1s step-end infinite;
    vertical-align: middle;
}

.cursor.is-typing {
    animation: none;
    opacity: 1;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }
}

/* Hide or shrink on mobile to improve UX */
@media (max-width: 768px) {
    .home-section.home-demo {
        display: none;
    }
}
</style>
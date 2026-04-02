<script setup>
import StepRunner from './StepRunner.vue'

// Animation steps with Chinese Titles and Descriptions
const steps = [
    {
        title: '1. 用户输入 (Start)',
        description: '当用户发送第一条消息时，While 循环启动。',
        activeNode: 'start',
        messages: [
            { role: 'user', content: '请帮我修复登录 Bug' }
        ]
    },
    {
        title: '2. 调用模型 (Call Model)',
        description: '系统将所有历史消息发送给 LLM。模型根据上下文进行推理。',
        activeNode: 'api',
        messages: [
            { role: 'user', content: '请帮我修复登录 Bug' }
        ]
    },
    {
        title: '3. 判断停止原因 (Check Stop Reason)',
        description: '模型返回 stop_reason="tool_use"，表示它想调用工具。循环继续。',
        activeNode: 'stop_check',
        highlightPath: 'tool_use',
        messages: [
            { role: 'user', content: '请帮我修复登录 Bug' },
            { role: 'assistant', type: 'tool_use', content: '使用工具: read_file("auth.ts")' }
        ]
    },
    {
        title: '4. 执行工具 (Execute Tool)',
        description: '系统拦截到工具调用请求，并在本地环境执行对应的代码。',
        activeNode: 'execute',
        messages: [
            { role: 'user', content: '请帮我修复登录 Bug' },
            { role: 'assistant', type: 'tool_use', content: '使用工具: read_file("auth.ts")' },
            { role: 'tool', content: 'tool_result: auth.ts 第 42 行存在空值判断缺失。' }
        ]
    },
    {
        title: '5. 追加结果 (Append Result)',
        description: '工具执行完毕，将输出结果追加到消息列表，准备反馈给模型。',
        activeNode: 'append',
        messages: [
            { role: 'user', content: '请帮我修复登录 Bug' },
            { role: 'assistant', type: 'tool_use', content: '使用工具: read_file("auth.ts")' },
            { role: 'tool', content: 'tool_result: auth.ts 第 42 行存在空值判断缺失。' }
        ]
    },
    {
        title: '6. 再次循环 (Loop Again)',
        description: '带着最新的工具结果，再次回到 API Call。模型决定下一步操作。',
        activeNode: 'api',
        isLoop: true,
        messages: [
            { role: 'user', content: '请帮我修复登录 Bug' },
            { role: 'assistant', type: 'tool_use', content: '使用工具: read_file("auth.ts")' },
            { role: 'tool', content: 'tool_result: auth.ts 第 42 行存在空值判断缺失。' },
            { role: 'assistant', type: 'tool_use', content: '使用工具: edit_file("auth.ts")' },
            { role: 'tool', content: 'tool_result: 已补上空值判断并保存修改。' }
        ]
    },
    {
        title: '7. 任务完成 (Break / Done)',
        description: '模型返回 stop_reason="end_turn"，表示不再调用工具，循环结束。',
        activeNode: 'break',
        highlightPath: 'end_turn',
        messages: [
            { role: 'user', content: '请帮我修复登录 Bug' },
            { role: 'assistant', type: 'tool_use', content: '使用工具: read_file("auth.ts")' },
            { role: 'tool', content: 'tool_result: auth.ts 第 42 行存在空值判断缺失。' },
            { role: 'assistant', type: 'tool_use', content: '使用工具: edit_file("auth.ts")' },
            { role: 'tool', content: 'tool_result: 已补上空值判断并保存修改。' },
            { role: 'assistant', type: 'final', content: '结束: 搞定！' }
        ]
    }
]
</script>

<template>
    <div class="agent-viz-wrapper">
        <!-- Using generic runner -->
        <StepRunner :totalSteps="steps.length" :autoPlay="true" :interval="3000">
            <template #default="{ currentStep }">
                <!-- CRITICAL: Single root wrapper to prevent StepRunner flex layout from breaking us -->
                <div class="viz-inner-container">

                    <!-- TOP ROW: FLOWCHART + MESSAGES -->
                    <div class="viz-main-row">

                        <!-- LEFT: FLOWCHART -->
                        <div class="viz-flowchart-col">
                            <div class="code-label">while (stop_reason === "tool_use")</div>

                            <div class="canvas-container">
                                <!-- SVG Connections -->
                                <svg class="flow-svg" viewBox="0 0 320 380">
                                    <defs>
                                        <marker id="arrow-gray" markerWidth="6" markerHeight="4" refX="5" refY="2"
                                            orient="auto">
                                            <path d="M0,0 L6,2 L0,4" fill="#cbd5e1" />
                                        </marker>
                                        <marker id="arrow-blue" markerWidth="6" markerHeight="4" refX="5" refY="2"
                                            orient="auto">
                                            <path d="M0,0 L6,2 L0,4" fill="#3b82f6" />
                                        </marker>
                                        <marker id="arrow-purple" markerWidth="6" markerHeight="4" refX="5" refY="2"
                                            orient="auto">
                                            <path d="M0,0 L6,2 L0,4" fill="#a855f7" />
                                        </marker>
                                    </defs>

                                    <!-- 1. Start -> API (45 -> 70) -->
                                    <line x1="160" y1="45" x2="160" y2="70" class="conn"
                                        :class="{ active: currentStep >= 1 }" marker-end="url(#arrow-gray)" />

                                    <!-- 2. API -> Stop (110 -> 145) -->
                                    <line x1="160" y1="110" x2="160" y2="145" class="conn"
                                        :class="{ active: currentStep >= 2 }" marker-end="url(#arrow-gray)" />

                                    <!-- 3a. Stop -> Execute (Down) (195 -> 225) -->
                                    <line x1="160" y1="195" x2="160" y2="225" class="conn"
                                        :class="{ active: currentStep >= 3 && steps[currentStep].activeNode !== 'break' }"
                                        marker-end="url(#arrow-gray)" />
                                    <text x="165" y="215" class="path-label">tool_use</text>

                                    <!-- 3b. Stop -> Break (Right) (Diamond Edge 200 -> 230) -->
                                    <line x1="200" y1="170" x2="230" y2="170" class="conn"
                                        :class="{ active: steps[currentStep].highlightPath === 'end_turn' }"
                                        marker-end="url(#arrow-purple)" />
                                    <text x="205" y="165" class="path-label">end_turn</text>

                                    <!-- 4. Execute -> Append (265 -> 295) -->
                                    <line x1="160" y1="265" x2="160" y2="295" class="conn"
                                        :class="{ active: currentStep >= 4 && steps[currentStep].activeNode !== 'break' }"
                                        marker-end="url(#arrow-gray)" />

                                    <!-- 5. Append -> API (Loop Left) (335 -> Left -> Up -> 90 -> 105) -->
                                    <path d="M 160 335 L 160 350 L 40 350 L 40 90 L 105 90" fill="none"
                                        class="conn loop-path" :class="{ active: steps[currentStep].isLoop }"
                                        marker-end="url(#arrow-gray)" />
                                    <text x="50" y="200" class="path-label loop-text"
                                        v-if="steps[currentStep].isLoop">iter #2</text>
                                </svg>

                                <!-- HTML Nodes (Centered X=160) -->

                                <!-- Start (Top 10, H=35) -->
                                <div class="node node-start"
                                    :class="{ active: steps[currentStep].activeNode === 'start' }">
                                    开始
                                </div>

                                <!-- API Call (Top 70, H=40) -->
                                <div class="node node-api" :class="{ active: steps[currentStep].activeNode === 'api' }">
                                    调用模型
                                </div>

                                <!-- Stop Check (Diamond) (Top 145, H=50) -->
                                <div class="diamond-wrapper"
                                    :class="{ active: steps[currentStep].activeNode === 'stop_check' }">
                                    <div class="diamond"></div>
                                    <div class="diamond-content">停止原因?</div>
                                </div>

                                <!-- Break (Top 152, aligned with Diamond Center 170) -->
                                <div class="node node-break"
                                    :class="{ active: steps[currentStep].activeNode === 'break' }">
                                    任务完成
                                </div>

                                <!-- Execute (Top 225, H=40) -->
                                <div class="node node-exec"
                                    :class="{ active: steps[currentStep].activeNode === 'execute' }">
                                    执行工具
                                </div>

                                <!-- Append (Top 295, H=40) -->
                                <div class="node node-append"
                                    :class="{ active: steps[currentStep].activeNode === 'append' }">
                                    追加结果
                                </div>

                            </div>
                        </div>

                        <!-- RIGHT: MESSAGES -->
                        <div class="viz-msg-col">
                            <div class="msg-header">messages[]</div>
                            <div class="msg-list-wrap">
                                <transition-group name="msg-slide">
                                    <div v-for="(msg, i) in steps[currentStep].messages" :key="i" class="msg-card"
                                        :class="[msg.role, msg.type]">
                                        <div class="msg-role">{{ msg.role === 'tool' ? 'tool_result' : msg.role }}</div>
                                        <div class="msg-body">{{ msg.content }}</div>
                                    </div>
                                </transition-group>
                            </div>
                            <div class="msg-footer">length: {{ steps[currentStep].messages.length }}</div>
                        </div>
                    </div>

                    <!-- BOTTOM: DESCRIPTION -->
                    <div class="viz-desc-row" :class="{ done: steps[currentStep].activeNode === 'break' }">
                        <div class="desc-title">{{ steps[currentStep].title }}</div>
                        <div class="desc-text">{{ steps[currentStep].description }}</div>
                    </div>

                </div>
            </template>
        </StepRunner>
    </div>
</template>

<style scoped>
/* RESET & LAYOUT */
.agent-viz-wrapper {
    margin: 20px 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--vp-c-divider);
    font-family: var(--vp-font-family-mono);
    /* Ensure wrapper itself doesn't impose flex */
    display: block;
}

.viz-inner-container {
    width: 100%;
    /* Force full width inside StepRunner's flex center */
    display: flex;
    flex-direction: column;
}

.viz-main-row {
    display: flex;
    flex-direction: column;
    /* Mobile first */
    background-color: var(--vp-c-bg);
    min-height: 400px;
}

@media (min-width: 640px) {
    .viz-main-row {
        flex-direction: row;
    }
}

/* LEFT COLUMN */
.viz-flowchart-col {
    flex: 1;
    position: relative;
    background-color: var(--vp-c-bg);
    /* White/Dark */
    display: flex;
    flex-direction: column;
    align-items: center;
    border-right: 1px solid var(--vp-c-divider);
    overflow: hidden;
}

.code-label {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 11px;
    font-family: monospace;
    color: var(--vp-c-text-3);
    z-index: 5;
}

.canvas-container {
    position: relative;
    width: 320px;
    height: 380px;
    margin-top: 20px;
    /* Ensure it doesn't overflow if container is small */
    max-width: 100%;
}

/* SVG */
.flow-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
}

.conn {
    stroke: var(--vp-c-divider);
    stroke-width: 2;
    transition: all 0.4s ease;
}

.conn.active {
    stroke: #3b82f6;
    marker-end: url(#arrow-blue);
}

.conn.active[marker-end*="arrow-purple"] {
    stroke: #a855f7;
}

.path-label {
    font-size: 10px;
    fill: var(--vp-c-text-2);
}

.loop-text {
    fill: #3b82f6;
    font-weight: bold;
}

/* NODES */
.node {
    position: absolute;
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    color: var(--vp-c-text-1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    z-index: 2;
}

.node.active {
    background: #3b82f6;
    border-color: #2563eb;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Positions (X=160 Center for 320px SVG) */
.node-start {
    top: 10px;
    left: 120px;
    /* 160(Center) - 40(Half Width) */
    width: 80px;
    height: 35px;
}

.node-api {
    top: 70px;
    left: 105px;
    /* 160 - 55 */
    width: 110px;
    height: 40px;
}

.node-exec {
    top: 225px;
    left: 105px;
    /* 160 - 55 */
    width: 110px;
    height: 40px;
}

.node-append {
    top: 295px;
    left: 105px;
    /* 160 - 55 */
    width: 110px;
    height: 40px;
}

/* Diamond */
.diamond-wrapper {
    position: absolute;
    top: 145px;
    left: 120px;
    /* 160 - 40 */
    width: 80px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
}

.diamond {
    position: absolute;
    width: 36px;
    height: 36px;
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    transform: rotate(45deg);
    transition: all 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.diamond-content {
    position: relative;
    z-index: 3;
    font-size: 11px;
    font-weight: 600;
    color: var(--vp-c-text-1);
}

.diamond-wrapper.active .diamond {
    background: #3b82f6;
    border-color: #2563eb;
}

.diamond-wrapper.active .diamond-content {
    color: white;
}

/* Break */
.node-break {
    top: 152px;
    left: 230px;
    width: 80px;
    height: 36px;
    background: transparent;
    color: #a855f7;
    border-color: #a855f7;
}

.node-break.active {
    background: #a855f7;
    border-color: #7e22ce;
    color: white;
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
}

/* RIGHT COLUMN */
.viz-msg-col {
    flex: 1;
    background-color: var(--vp-c-bg-alt);
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--vp-c-divider);
    min-width: 0;
}

@media (min-width: 640px) {
    .viz-msg-col {
        border-top: none;
    }
}

.msg-header {
    padding: 10px 15px;
    font-size: 11px;
    color: var(--vp-c-text-3);
    font-family: monospace;
    border-bottom: 1px solid var(--vp-c-divider);
}

.msg-list-wrap {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* Scrollbar */
.msg-list-wrap::-webkit-scrollbar {
    width: 4px;
}

.msg-list-wrap::-webkit-scrollbar-thumb {
    background: var(--vp-c-divider);
    border-radius: 2px;
}

.msg-card {
    padding: 8px 10px;
    border-radius: 6px;
    color: white;
    font-size: 11px;
    line-height: 1.4;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    word-break: break-all;
    /* Prevent overflow if text is long */
}

.msg-role {
    font-size: 9px;
    font-weight: 700;
    opacity: 0.8;
    margin-bottom: 2px;
    text-transform: uppercase;
}

.msg-card.user {
    background: #3b82f6;
}

.msg-card.assistant {
    background: #475569;
}

.msg-card.tool_use {
    background: #475569;
    border: 1px dashed rgba(255, 255, 255, 0.4);
}

.msg-card.tool {
    background: #10b981;
}

.msg-card.final {
    background: #a855f7;
}

.msg-footer {
    padding: 8px 15px;
    font-size: 10px;
    text-align: right;
    color: var(--vp-c-text-3);
    border-top: 1px solid var(--vp-c-divider);
}

/* BOTTOM DESCRIPTION ROW */
.viz-desc-row {
    padding: 15px 20px;
    border-top: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg-soft);
    transition: background 0.3s;
}

.viz-desc-row.done {
    background: rgba(168, 85, 247, 0.05);
}

.desc-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
    color: var(--vp-c-text-1);
}

.done .desc-title {
    color: #a855f7;
}

.desc-text {
    font-size: 13px;
    color: var(--vp-c-text-2);
}

.done .desc-text {
    color: #9333ea;
}

/* Transitions */
.msg-slide-enter-active,
.msg-slide-leave-active {
    transition: all 0.3s ease;
}

.msg-slide-enter-from {
    opacity: 0;
    transform: translateX(10px);
}
</style>

<script setup lang="ts">
import { withBase } from 'vitepress'

const tools = [
  {
    name: 'Manus',
    summary: '定位通用型 AI Agent，强调从理解任务到执行交付的一体化体验。',
    href: '/tools/manus',
    logoClass: 'tool-tile-logo-manus',
    initials: 'MA'
  },
  {
    name: 'Genspark',
    summary: '偏向消费场景的智能体产品，强调搜索、整理和任务辅助能力。',
    href: '/tools/genspark',
    logoClass: 'tool-tile-logo-genspark',
    initials: 'GS'
  },
  {
    name: 'Flowith',
    summary: '强调可视化工作空间和多线程思考流程，适合内容创作与任务拆解。',
    href: '/tools/flowith',
    logoClass: 'tool-tile-logo-flowith',
    initials: 'FW'
  },
  {
    name: '扣子',
    summary: '适合快速搭建 Bot 与轻量 Agent 应用，偏向中文场景和可视化配置。',
    href: '/tools/coze',
    logoClass: 'tool-tile-logo-coze',
    initials: 'CZ'
  },
  {
    name: 'AstronClaw',
    summary: '科大讯飞推出的云端 AI 助手服务，支持一键部署、技能扩展与协作接入。',
    href: '/tools/astronclaw',
    logoClass: 'tool-tile-logo-astronclaw',
    initials: 'AC'
  },
  {
    name: 'QoderWork',
    summary: '桌面级通用智能助理，支持自然语言发起任务，并生成文档、表格与演示材料。',
    href: '/tools/qoderwork',
    logoClass: 'tool-tile-logo-qoderwork',
    initials: 'QW'
  },
  {
    name: 'ChatGPT 智能体',
    summary: 'OpenAI 的在线任务执行能力，当前主要通过 ChatGPT 智能体模式提供。',
    href: '/tools/operator',
    logoClass: 'tool-tile-logo-operator',
    initials: 'OP'
  },
  {
    name: 'Skywork',
    summary: '以 Deep Research 为核心的一站式 AI 工作空间，可生成多种交付内容。',
    href: '/tools/skywork',
    logoClass: 'tool-tile-logo-skywork',
    initials: 'SW'
  }
] as const
</script>

<template>
  <div class="tool-grid">
    <a v-for="tool in tools" :key="tool.href" class="tool-tile" :href="withBase(tool.href)">
      <span class="tool-tile-logo" :class="tool.logoClass">{{ tool.initials }}</span>
      <div class="tool-tile-body">
        <h3>{{ tool.name }}</h3>
        <p>{{ tool.summary }}</p>
      </div>
    </a>
  </div>
</template>

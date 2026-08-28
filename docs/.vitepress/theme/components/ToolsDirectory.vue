<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { toolCatalog, toolCategoryOrder } from '../../../tool-catalog'

const groupedTools = computed(() =>
  toolCategoryOrder
    .map((category) => ({
      category,
      tools: toolCatalog.filter((tool) => tool.category === category)
    }))
    .filter((group) => group.tools.length > 0)
)

const toolTags: Record<string, string[]> = {
  Manus: ['通用 Agent', '自主执行'],
  Genspark: ['工作空间', '搜索增强'],
  Flowith: ['画布协作', '生产力'],
  扣子: ['低代码', '智能体平台'],
  AstronClaw: ['多模态', '云助手'],
  QoderWork: ['研发提效', '代码助手'],
  'ChatGPT 智能体': ['Operator', '智能体执行'],
  Skywork: ['研究助手', '工作空间'],
  Jules: ['异步编程', 'GitHub'],
  'Claude Cowork': ['协作', '桌面集成'],
  'MiniMax Agent': ['多模态', '长任务'],
  豆包手机助手: ['手机端', '个人助手'],
  'Perplexity Comet': ['浏览器', '信息检索'],
  'Replit Agent': ['应用构建', '部署'],
  Devin: ['软件工程', '自主执行'],
  LangGraph: ['状态编排', 'Checkpoint'],
  AutoGen: ['多 Agent', '消息驱动'],
  CrewAI: ['角色协作', '任务编排'],
  Mastra: ['TypeScript', 'Agent 框架'],
  Dify: ['Workflow', '知识库'],
  n8n: ['自动化', '工作流'],
  Flowise: ['可视化', 'RAG 原型'],
  LlamaIndex: ['数据接入', '检索增强'],
  Langfuse: ['Trace', '观测'],
  Promptfoo: ['评测', '红队测试'],
  DeepEval: ['自动测试', '基准'],
  'browser-use': ['浏览器控制', '网页任务'],
  Playwright: ['浏览器执行', '自动化'],
  OpenHands: ['代码任务', '命令执行']
}

const getToolTags = (name: string) => toolTags[name] ?? []
</script>

<template>
  <div class="tools-directory-sections">
    <section
      v-for="group in groupedTools"
      :key="group.category"
      class="tool-section"
      :class="{ 'tool-section-featured': group.category === '中转站汇总' }"
    >
      <h2>{{ group.category }}</h2>
      <div class="tool-grid" :class="{ 'tool-grid-featured': group.category === '中转站汇总' }">
        <a v-for="tool in group.tools" :key="tool.href" class="tool-tile" :href="withBase(tool.href)">
          <span v-if="group.category !== '中转站汇总'" class="tool-tile-logo" :class="tool.logoClass">{{ tool.initials }}</span>
          <span v-else class="tool-featured-visual" aria-hidden="true">
            <img :src="withBase('/tools/aggregators-hub-icon.webp')" alt="" width="56" height="56" loading="lazy" />
          </span>
          <div class="tool-tile-body">
            <h3>{{ tool.name }}</h3>
            <p>{{ tool.summary }}</p>
            <span v-if="group.category !== '中转站汇总' && getToolTags(tool.name).length" class="tool-card-tags">
              <span v-for="tag in getToolTags(tool.name)" :key="tag">{{ tag }}</span>
            </span>
            <span v-if="group.category === '中转站汇总'" class="tool-featured-tags">
              <span>API 中转</span>
              <span>聚合网关</span>
              <span>统一入口</span>
            </span>
          </div>
          <span v-if="group.category === '中转站汇总'" class="tool-featured-arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  </div>
</template>

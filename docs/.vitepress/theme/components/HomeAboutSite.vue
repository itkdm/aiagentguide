<script setup lang="ts">
import { withBase } from 'vitepress'

const steps = [
  {
    number: '01',
    label: '这是什么地方',
    title: '面向初学者的 Agent 学习指南',
    description: '布吉岛 Agent 是一个系统化的中文 AI Agent 学习站点。我们想把“从零开始”这件事讲清楚，让你不必先追完论文也能理解智能体开发。',
    cta: '看看定位',
    href: '/getting-started/',
    icon: '📍'
  },
  {
    number: '02',
    label: '能学到什么',
    title: '概念、原理、框架到项目',
    description: '从 Agent 是什么、它和聊天机器人有什么不同，到 Agent Loop、RAG、工作流编排、多 Agent 协作与工程落地，覆盖一条完整的学习链路。',
    cta: '浏览栏目',
    href: '/principles/',
    icon: '📚'
  },
  {
    number: '03',
    label: '该怎么用',
    title: '跟着路径从不知道到做得到',
    description: '不需要一上来就选框架。先建立判断标准，再学原理与选型，最后动手做项目。整个站点按这条由浅入深的节奏组织。',
    cta: '开始学习',
    href: '/getting-started/learning-path.html',
    icon: '🚀'
  }
] as const
</script>

<template>
  <div class="home-section home-section-journey">
    <div class="wrapper">
      <h2 class="section-title">布吉岛 Agent 是什么？</h2>
      <div class="home-flow" aria-label="关于布吉岛 Agent">
        <template v-for="(step, index) in steps" :key="step.href">
          <a class="home-flow-step" :href="withBase(step.href)">
            <span class="home-flow-step-no">{{ step.number }}</span>
            <div class="card-header">
              <div class="home-flow-icon">{{ step.icon }}</div>
              <span class="home-flow-step-label">{{ step.label }}</span>
            </div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
            <span class="home-flow-cta">{{ step.cta }}</span>
          </a>
          <div v-if="index < steps.length - 1" class="home-flow-connector" aria-hidden="true"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 56px;
  text-align: center;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 24px;
    margin-bottom: 40px;
  }
  .wrapper {
    padding: 0 16px;
  }
}
</style>

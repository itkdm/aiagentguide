<script setup lang="ts">
import { withBase } from 'vitepress'

const steps = [
  {
    number: '01',
    label: '先打基础',
    title: '入门学习路径',
    description: '理解什么是 Agent、它和聊天机器人的区别，以及从哪里开始系统学习。',
    cta: '从入门开始',
    href: '/getting-started/',
    icon: '🎯'
  },
  {
    number: '02',
    label: '理解系统',
    title: '原理拆解',
    description: '深入看清 Agent Loop、上下文、工具调用、权限边界和多 Agent 协作为什么这样设计。',
    cta: '查看原理',
    href: '/principles/',
    icon: '⚙️'
  },
  {
    number: '03',
    label: '再做判断',
    title: 'RAG 系统构建',
    description: '掌握检索增强生成的架构、检索与重排、知识库构建与生产化落地的关键方法。',
    cta: '查看 RAG',
    href: '/rag/',
    icon: '📚'
  },
  {
    number: '04',
    label: '最后动手',
    title: '项目实战参考',
    description: '从真实项目中研究能力设计、系统边界、架构权衡与可复制的实施经验。',
    cta: '查看项目',
    href: '/projects/',
    icon: '💻'
  }
] as const
</script>

<template>
  <div class="home-section home-section-journey">
    <div class="wrapper">
      <h2 class="section-title">系统化学习路径</h2>
      <div class="home-flow" aria-label="AI Agent 学习路线">
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

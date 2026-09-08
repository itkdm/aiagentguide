<script setup lang="ts">
import { withBase } from 'vitepress'

const steps = [
  {
    number: '01',
    label: '先打基础',
    title: '入门学习',
    description: '先理解 Agent 是什么、适合解决什么问题，以及学习 Agent 开发前需要建立哪些基础认知。',
    cta: '从入门开始',
    href: '/getting-started/',
    icon: '🎯'
  },
  {
    number: '02',
    label: '理解框架',
    title: '框架学习',
    description: '再去学习 LangGraph、AgentScope 等框架，借助成熟工具更快地完成 Agent 项目开发。',
    cta: '敬请期待',
    href: '',
    icon: '🧩'
  },
  {
    number: '03',
    label: '最后动手',
    title: '项目实战',
    description: '最后通过真实企业级项目开发，把前面的概念和框架真正串起来。',
    cta: '敬请期待',
    href: '',
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
          <component
            :is="step.href ? 'a' : 'div'"
            class="home-flow-step"
            :class="{ 'is-disabled': !step.href }"
            :href="step.href ? withBase(step.href) : undefined"
            :aria-disabled="!step.href || undefined"
          >
            <span class="home-flow-step-no">{{ step.number }}</span>
            <div class="card-header">
              <div class="home-flow-icon">{{ step.icon }}</div>
              <span class="home-flow-step-label">{{ step.label }}</span>
            </div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
            <span class="home-flow-cta">{{ step.cta }}</span>
          </component>
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

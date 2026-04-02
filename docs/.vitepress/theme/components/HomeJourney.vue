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
    title: '框架选型对比',
    description: '聚焦主流 AI Agent 框架，先看差异、适用场景和开发方式，再决定后续投入方向。',
    cta: '查看框架',
    href: '/frameworks/',
    icon: '⚖️'
  },
  {
    number: '04',
    label: '最后动手',
    title: '实战案例教程',
    description: '从最小可运行 Agent 起步，把概念和框架选择真正落到项目实践里。',
    cta: '进入实战',
    href: '/tutorials/',
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

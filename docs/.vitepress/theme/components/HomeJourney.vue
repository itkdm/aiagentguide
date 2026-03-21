<script setup lang="ts">
import { withBase } from 'vitepress'

const steps = [
  {
    number: '01',
    label: '先打基础',
    title: '入门学习路径',
    description: '理解什么是 Agent、它和聊天机器人的区别，以及从哪里开始系统学习。',
    cta: '从入门开始',
    href: '/getting-started/'
  },
  {
    number: '02',
    label: '再做判断',
    title: '框架选型对比',
    description: '聚焦主流 AI Agent 框架，先看差异、适用场景和开发方式，再决定后续投入方向。',
    cta: '查看框架',
    href: '/frameworks/'
  },
  {
    number: '03',
    label: '最后动手',
    title: '实战案例教程',
    description: '从最小可运行 Agent 起步，把概念和框架选择真正落到项目实践里。',
    cta: '进入实战',
    href: '/tutorials/'
  }
] as const
</script>

<template>
  <div class="home-section home-section-journey">
    <div class="home-flow" aria-label="AI Agent 学习路线">
      <template v-for="(step, index) in steps" :key="step.href">
        <a class="home-flow-step" :href="withBase(step.href)">
          <div class="home-flow-meta">
            <span class="home-flow-step-no">{{ step.number }}</span>
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
</template>

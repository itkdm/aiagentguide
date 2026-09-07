<script setup lang="ts">
import { withBase } from 'vitepress'

const faqs = [
  {
    q: 'Agent 是什么？',
    a: [
      '我们可以把 Agent 理解成一种能够围绕目标持续完成任务的系统。它不只是回答一次问题，还会根据当前结果决定下一步，调用工具、读取信息、执行操作，直到任务完成。',
      '如果刚接触 Agent，建议先从这个问题开始，把 Agent、Workflow、RAG 这些最容易混淆的概念先分清楚。'
    ],
    cta: '继续了解：Agent 入门',
    href: '/getting-started/what-is-ai-agent.html'
  },
  {
    q: 'Agent 开发应该从哪里开始？',
    a: [
      '我们不建议一上来就选框架、背 API。合适的顺序是先理解 Agent 的基本结构和运行方式，再逐步学习工具调用、上下文、Memory、RAG 等核心能力，最后通过项目把这些知识串起来。',
      '这样后面无论使用什么框架，都更容易知道它到底帮我们解决了什么问题。'
    ],
    cta: '继续学习：Agent 开发入门',
    href: '/getting-started/'
  },
  {
    q: 'Agent 教程应该怎么学？',
    a: [
      '我们更推荐按照“<strong>入门认知 → 核心原理 → 框架使用 → 项目实践</strong>”这条路径来学，而不是看到一个新框架就跟着写 Demo。',
      '教程真正重要的不是把代码跑通，而是理解为什么要这样设计。理解之后，再面对新的框架和项目，很多东西其实都能迁移。'
    ],
    cta: '查看：Agent 学习路线',
    href: '/getting-started/learning-path.html'
  },
  {
    q: 'Agent 框架应该怎么选？',
    a: [
      '我们不会简单告诉大家哪个框架“最好”。LangGraph、AgentScope 等框架各自解决的问题和适用场景不同，真正选型时要结合项目复杂度、状态管理、工具调用、工作流编排以及团队技术栈一起判断。',
      '我们会先把这些框架拆开讲清楚，再通过对比和项目实践，逐步建立自己的选型标准。'
    ],
    cta: '查看：Agent 框架',
    href: ''
  },
  {
    q: 'Agent 面试一般会问什么？',
    a: [
      'Agent 面试通常不会只问“某个概念是什么”，更常见的是继续追问：为什么这样设计、还有没有其他方案、项目里是怎么做的。',
      '所以我们整理面试题的目标不是让大家背标准答案，而是把每个问题背后的原理和设计思路真正弄懂。这样面对连续追问时，我们才能把自己的判断过程讲清楚。'
    ],
    cta: '查看：Agent 面试题',
    href: ''
  }
] as const
</script>

<template>
  <div class="home-section home-section-journey home-faq">
    <div class="wrapper">
      <h2 class="section-title">常见问题</h2>
      <p class="section-sub">关于Agent 开发，初学者最常问的几件事。</p>
      <div class="faq-list">
        <div v-for="(item, index) in faqs" :key="item.q" class="faq-item">
          <div class="faq-q">
            <span class="faq-no">{{ index + 1 }}</span>
            <h3>{{ item.q }}</h3>
          </div>
          <div class="faq-a">
            <p v-for="paragraph in item.a" :key="paragraph" v-html="paragraph"></p>
          </div>
          <a v-if="item.href" class="faq-cta" :href="withBase(item.href)">{{ item.cta }} →</a>
          <span v-else class="faq-cta faq-cta-disabled">{{ item.cta }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  max-width: 880px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 12px;
  text-align: center;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.section-sub {
  margin: 0 0 40px;
  text-align: center;
  color: var(--home-body);
  font-size: 1rem;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.faq-item {
  padding: 22px 24px;
  border: 1px solid var(--home-panel-border);
  border-radius: 20px;
  background: var(--home-panel-bg);
  box-shadow: var(--home-panel-shadow);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
    border-color 0.3s ease, box-shadow 0.3s ease;
}

.faq-item:hover {
  transform: translateY(-4px);
  border-color: var(--home-panel-hover-border);
  box-shadow: var(--home-panel-hover-shadow);
}

.faq-q {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.faq-no {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--home-accent);
  background: var(--home-accent-soft);
}

.faq-q h3 {
  margin: 0;
  font-size: 1.08rem;
  line-height: 1.5;
  color: var(--home-title);
}

.faq-a {
  margin: 0 0 14px;
  padding-left: 40px;
  line-height: 1.8;
  color: var(--home-body);
}

.faq-a p {
  margin: 0;
}

.faq-a p + p {
  margin-top: 12px;
}

.faq-cta {
  display: inline-block;
  margin-left: 40px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--home-accent);
  text-decoration: none;
}

.faq-cta:hover {
  text-decoration: underline;
}

.faq-cta-disabled {
  color: var(--home-muted);
  cursor: default;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 24px;
  }
  .wrapper {
    padding: 0 16px;
  }
  .faq-a,
  .faq-cta {
    padding-left: 0;
    margin-left: 0;
  }
}
</style>

<script setup lang="ts">
import { withBase } from 'vitepress'

const faqs = [
  {
    q: 'AI Agent 是什么？和普通 AI 聊天有什么区别？',
    a: 'AI Agent，也叫 AI 智能体，是一种能够围绕目标进行判断、调用工具并持续执行任务的 AI 系统。普通聊天模型通常以"一问一答"为主，而 Agent 可以根据执行结果决定下一步，例如搜索资料、调用 API、读取文件或运行代码，直到完成目标。',
    cta: '详细了解 AI Agent',
    href: '/getting-started/what-is-ai-agent.html'
  },
  {
    q: '零基础应该怎么学习 AI Agent？',
    a: '初学 AI Agent 不需要一开始就学习复杂框架。可以先理解 LLM、Prompt、工具调用、Workflow 和 RAG 等基础概念，再理解 Agent 如何根据目标进行决策和执行，最后通过一个可以实际运行的小项目建立完整认知。',
    cta: '从 Agent 入门开始',
    href: '/getting-started/'
  },
  {
    q: '学习 AI Agent 需要先掌握哪些基础？',
    a: '如果目标是理解和开发 AI Agent，通常需要具备基本编程能力，并了解 API、JSON 和大语言模型的基本使用方式。Prompt、工具调用、RAG、Workflow 等知识可以在学习 Agent 的过程中逐步补齐，不需要全部学完以后才能开始。',
    cta: '动手前先看看',
    href: '/getting-started/before-your-first-agent.html'
  },
  {
    q: 'AI Agent 和 Workflow 有什么区别？什么时候该用 Agent？',
    a: 'Workflow 的主要执行路径通常由程序提前定义，而 Agent 会根据目标、中间结果和环境动态决定下一步。如果任务步骤清晰、结果可预测，Workflow 通常更稳定；如果任务开放、执行步骤难以提前确定，并且需要根据结果不断调整，则更适合考虑 Agent。',
    cta: '对比 Agent、工作流与 RAG',
    href: '/getting-started/agent-vs-chatbot-workflow-rag.html'
  },
  {
    q: 'RAG 和 AI Agent 有什么区别？两者是什么关系？',
    a: 'RAG 和 Agent 解决的问题不同。RAG 主要帮助大模型从外部知识中找到与当前问题相关的信息；Agent 更关注如何围绕目标进行决策、调用工具并完成任务。在实际系统中，RAG 可以成为 Agent 获取知识的一种工具，因此两者并不是互相替代的关系。',
    cta: '系统学习 RAG',
    href: '/rag/'
  },
  {
    q: '什么情况下其实不需要使用 AI Agent？',
    a: '如果任务步骤固定、输入输出明确，或者一次模型调用和普通程序就能解决，通常没有必要引入 Agent。Agent 的自主决策会带来额外的成本、延迟和不确定性。更合理的原则是先使用最简单可靠的方案，只在任务确实需要动态决策时增加 Agent。',
    cta: '什么任务适合用 Agent',
    href: '/getting-started/when-to-use-agent.html'
  }
] as const
</script>

<template>
  <div class="home-section home-section-journey home-faq">
    <div class="wrapper">
      <h2 class="section-title">常见问题</h2>
      <p class="section-sub">关于 AI Agent，初学者最常问的几件事。</p>
      <div class="faq-list">
        <div v-for="(item, index) in faqs" :key="item.q" class="faq-item">
          <div class="faq-q">
            <span class="faq-no">{{ index + 1 }}</span>
            <h3>{{ item.q }}</h3>
          </div>
          <p class="faq-a">{{ item.a }}</p>
          <a class="faq-cta" :href="withBase(item.href)">{{ item.cta }} →</a>
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

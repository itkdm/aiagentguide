<script setup lang="ts">
</script>

<template>
  <div class="home-section home-about-site">
    <div class="wrapper">
      <h2 class="section-title">布吉岛 Agent 是什么？</h2>
      <div class="about-copy">
        <p>
          布吉岛 Agent 是一个围绕 <strong>Agent 学习、开发与实践</strong> 持续整理的技术站点，适合正在学习 Agent、准备做项目，或者单纯对 Agent 开发感兴趣的人。
        </p>
        <p>
          我们会从基础入门开始，逐步讲清 Agent 的核心原理，再继续到 LangGraph、AgentScope 等框架的理解与选型。除了概念和教程，也会一起做 Vibe Coding 项目，并结合企业级项目开发，看看一个 Agent 应该怎么真正落地。
        </p>
        <p>
          同时，我们也会持续整理 Agent 面试题。重点不是背答案，而是理解问题背后的设计思路，希望到了真实面试、项目讨论或者技术选型时，我们都能知道为什么这样做，也能把自己的思路讲清楚。
        </p>
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

.home-about-site {
  background: radial-gradient(closest-side at 50% 40%, var(--vp-c-brand-soft) 0%, transparent 100%);
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

.about-copy {
  max-width: 800px;
  margin: 0 auto;
  color: var(--home-body);
  font-size: 1.08rem;
  line-height: 1.9;
  text-align: center;
}

.about-copy p {
  margin: 0;
}

.about-copy p + p {
  margin-top: 18px;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 24px;
    margin-bottom: 24px;
  }
  .wrapper {
    padding: 0 16px;
  }
  .home-about-site {
    padding-top: 52px;
    padding-bottom: 52px;
  }
  .about-copy {
    font-size: 1rem;
    line-height: 1.8;
    text-align: left;
  }
}
</style>

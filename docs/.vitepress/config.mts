import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vitepress'
import { useInteractiveDiagramMarkdown } from './markdown/interactive-diagrams'

import {
  buildRobotsTxt,
  createSeoHead,
  getPageLastModified,
  readPageSource,
  resolvePageDescription,
  resolveSiteUrl
} from './seo'

function normalizeBase(rawBase?: string) {
  if (!rawBase || rawBase === '/') {
    return '/'
  }

  const trimmedBase = rawBase.trim()
  const withLeadingSlash = trimmedBase.startsWith('/') ? trimmedBase : `/${trimmedBase}`

  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

const githubRepo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = normalizeBase(
  process.env.DOCS_BASE ||
    (process.env.GITHUB_ACTIONS === 'true' && githubRepo ? `/${githubRepo}/` : '/')
)
const siteTitle = 'AI Agent Guide'
const siteDescription = 'AI Agent 中文教程与实战指南'
const defaultSiteUrl = 'https://aiagentguide.cn/'
const siteUrl = resolveSiteUrl(
  base,
  process.env.DOCS_SITE_URL || process.env.SITE_URL || defaultSiteUrl,
  process.env.GITHUB_REPOSITORY
)

export default defineConfig({
  lang: 'zh-CN',
  base,
  title: siteTitle,
  description: siteDescription,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo-agent-loop.svg' }],
    ['meta', { name: 'theme-color', content: '#0f172a' }]
  ],
  sitemap: siteUrl
    ? {
        hostname: siteUrl,
        transformItems(items) {
          return items.filter((item) => !item.url.endsWith('/404.html'))
        }
      }
    : undefined,
  transformPageData(pageData, { siteConfig }) {
    const source = readPageSource(siteConfig.srcDir, pageData)
    const description = resolvePageDescription(pageData, source, siteDescription)

    return description ? { description } : undefined
  },
  transformHead({ pageData, siteData, title, description, siteConfig }) {
    return createSeoHead({
      pageData,
      description,
      documentTitle: title,
      siteTitle: siteData.title,
      siteDescription: siteData.description,
      locale: siteData.lang,
      cleanUrls: siteData.cleanUrls,
      siteUrl,
      lastModified: getPageLastModified(siteConfig.srcDir, pageData)
    })
  },
  buildEnd(siteConfig) {
    fs.writeFileSync(path.join(siteConfig.outDir, 'robots.txt'), buildRobotsTxt(siteUrl), 'utf8')

    if (siteUrl) {
      fs.writeFileSync(path.join(siteConfig.outDir, 'CNAME'), new URL(siteUrl).hostname, 'utf8')
    }
  },
  markdown: {
    config(md) {
      useInteractiveDiagramMarkdown(md)
    }
  },
  themeConfig: {
    logo: {
      light: '/logo-agent-loop.svg',
      dark: '/logo-agent-loop-dark.svg',
      alt: 'AI Agent Guide'
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '入门', link: '/getting-started/' },
      { text: '原理', link: '/principles/' },
      { text: '框架', link: '/frameworks/' },
      { text: '实战', link: '/tutorials/' },
      { text: '项目', link: '/projects/' },
      { text: 'LLM', link: '/llm/' },
      { text: 'RAG', link: '/rag/' },
      { text: '面试', link: '/interviews/' },
      { text: '工具', link: '/tools/' }
    ],
    footer: {
      message:
        'AI Agent 实战指南 · <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">豫ICP备2025137611号-5</a>',
      copyright: 'Copyright © 2026 AI Agent Guide'
    },
    sidebar: {
      '/getting-started/': [
        {
          text: '入门',
          items: [
            { text: '概览', link: '/getting-started/' },
            { text: '典型案例', link: '/getting-started/ai-agent-cases' },
            { text: 'Agent 是什么', link: '/getting-started/what-is-ai-agent' },
            { text: 'Workflow 是什么', link: '/getting-started/what-is-workflow' },
            { text: 'RAG 是什么', link: '/getting-started/what-is-rag' },
            { text: 'Agent、Workflow与 RAG', link: '/getting-started/agent-vs-chatbot-workflow-rag' },
            { text: 'Agent 使用场景', link: '/getting-started/when-to-use-agent' },
            { text: 'Agent 运行原理', link: '/getting-started/how-agent-works' },
            { text: 'Agent 核心组件', link: '/getting-started/core-components' },
            { text: '第一步动手前要知道什么', link: '/getting-started/before-your-first-agent' },
            { text: '新手常见误区', link: '/getting-started/common-mistakes' },
            { text: '入门学习路线', link: '/getting-started/learning-path' },
            { text: '术语表', link: '/getting-started/glossary' },
            { text: 'FAQ', link: '/getting-started/faq' }
          ]
        }
      ],
      '/principles/': [
        {
          text: '概览',
          link: '/principles/'
        },
        {
          text: 'learn-claude-code',
          collapsed: true,
          items: [
            { text: '概览', link: '/principles/learn-claude-code' },
            {
              text: '工具与执行',
              collapsed: false,
              items: [
                { text: 's01 Agent 循环', link: '/principles/s01-agent-loop' },
                { text: 's02 工具', link: '/principles/s02-tools' }
              ]
            },
            {
              text: '规划与协同',
              collapsed: false,
              items: [
                { text: 's03 TodoWrite', link: '/principles/s03-todowrite' },
                { text: 's04 子 Agent', link: '/principles/s04-sub-agents' },
                { text: 's05 技能', link: '/principles/s05-skills' },
                { text: 's07 任务系统', link: '/principles/s07-task-system' }
              ]
            },
            {
              text: '记忆管理',
              collapsed: false,
              items: [
                { text: 's06 上下文压缩', link: '/principles/s06-context-compression' }
              ]
            },
            {
              text: '并发',
              collapsed: false,
              items: [
                { text: 's08 后台任务', link: '/principles/s08-background-tasks' }
              ]
            },
            {
              text: '协作',
              collapsed: false,
              items: [
                { text: 's09 Agent 团队', link: '/principles/s09-agent-teams' },
                { text: 's10 团队协议', link: '/principles/s10-team-protocol' },
                { text: 's11 自主 Agent', link: '/principles/s11-autonomous-agents' },
                { text: 's12 Worktree + 任务隔离', link: '/principles/s12-worktree-task-isolation' }
              ]
            }
          ]
        },
        {
          text: 'OpenClaw',
          collapsed: true,
          items: [
            { text: '李弘毅老师原理拆解', link: '/principles/openclaw-principles' },
            { text: '01-OpenClaw 架构', link: '/principles/openclaw-architecture' }
          ]
        },
        {
          text: '通用原理补充',
          items: [
            { text: '01-Agent 架构', link: '/principles/general-agent-architecture' },
            { text: '02-核心循环', link: '/principles/general-core-loop' },
            { text: '03-规划', link: '/principles/general-planning' },
            { text: '04-工具', link: '/principles/general-tools' },
            { text: '05-记忆', link: '/principles/general-memory' },
            { text: '06-Skill', link: '/principles/general-skills' },
            { text: '07-MCP', link: '/principles/general-mcp' },
            { text: '08-多 Agent', link: '/principles/general-multi-agent' },
            { text: '09-可靠性与安全', link: '/principles/general-reliability-safety' }
          ]
        }
      ],
      '/frameworks/': [
        {
          text: '框架',
          items: [
            { text: '概览', link: '/frameworks/' },
            { text: '如何选择合适的框架', link: '/frameworks/how-to-choose-agent-framework' }
          ]
        },
        {
          text: 'LangChain',
          collapsed: false,
          items: [
            { text: '概览', link: '/frameworks/langchain/' },
            {
              text: '入门',
              collapsed: false,
              items: [
                { text: '安装', link: '/frameworks/langchain/get-started/install' },
                { text: '快速开始', link: '/frameworks/langchain/get-started/quickstart' },
                { text: '更新日志', link: '/frameworks/langchain/get-started/changelog' },
                { text: '设计理念', link: '/frameworks/langchain/get-started/philosophy' }
              ]
            },
            {
              text: '核心组件',
              collapsed: false,
              items: [
                { text: 'Agents', link: '/frameworks/langchain/core-components/agents' },
                { text: '模型', link: '/frameworks/langchain/core-components/models' },
                { text: '消息', link: '/frameworks/langchain/core-components/messages' },
                { text: '工具', link: '/frameworks/langchain/core-components/tools' },
                { text: '短期记忆', link: '/frameworks/langchain/core-components/short-term-memory' },
                { text: '流式输出', link: '/frameworks/langchain/core-components/streaming' },
                { text: '结构化输出', link: '/frameworks/langchain/core-components/structured-output' }
              ]
            },
            {
              text: '中间件',
              collapsed: false,
              items: [
                { text: '概览', link: '/frameworks/langchain/middleware/overview' },
                { text: '内置中间件', link: '/frameworks/langchain/middleware/built-in' },
                { text: '自定义中间件', link: '/frameworks/langchain/middleware/custom' }
              ]
            },
            {
              text: '前端',
              collapsed: false,
              items: [
                { text: '概览', link: '/frameworks/langchain/frontend/overview' },
                {
                  text: '模式',
                  collapsed: false,
                  items: [
                    { text: 'Markdown 消息', link: '/frameworks/langchain/frontend/markdown-messages' },
                    { text: '工具调用', link: '/frameworks/langchain/frontend/tool-calling' },
                    { text: '人工介入', link: '/frameworks/langchain/frontend/human-in-the-loop' },
                    { text: '分支对话', link: '/frameworks/langchain/frontend/branching-chat' },
                    { text: '推理 tokens', link: '/frameworks/langchain/frontend/reasoning-tokens' },
                    { text: '结构化输出', link: '/frameworks/langchain/frontend/structured-output' },
                    { text: '消息队列', link: '/frameworks/langchain/frontend/message-queues' },
                    { text: '加入与重新加入', link: '/frameworks/langchain/frontend/join-rejoin' },
                    { text: '时间回溯', link: '/frameworks/langchain/frontend/time-travel' },
                    { text: 'Generative UI', link: '/frameworks/langchain/frontend/generative-ui' }
                  ]
                },
                {
                  text: '集成',
                  collapsed: false,
                  items: [
                    { text: '概览', link: '/frameworks/langchain/frontend/integrations/overview' },
                    { text: 'AI 元素', link: '/frameworks/langchain/frontend/integrations/ai-elements' },
                    { text: 'assistant-ui', link: '/frameworks/langchain/frontend/integrations/assistant-ui' },
                    { text: 'OpenUI', link: '/frameworks/langchain/frontend/integrations/openui' }
                  ]
                }
              ]
            },
            {
              text: '高级用法',
              collapsed: false,
              items: [
                { text: 'Guardrails', link: '/frameworks/langchain/advanced-usage/guardrails' },
                { text: '运行时', link: '/frameworks/langchain/advanced-usage/runtime' },
                { text: '上下文工程', link: '/frameworks/langchain/advanced-usage/context-engineering' },
                { text: 'MCP', link: '/frameworks/langchain/advanced-usage/mcp' },
                { text: '人工介入', link: '/frameworks/langchain/advanced-usage/human-in-the-loop' },
                {
                  text: '多 Agent',
                  collapsed: false,
                  items: [
                    { text: '概览', link: '/frameworks/langchain/multi-agent/overview' },
                    { text: '子 Agent', link: '/frameworks/langchain/multi-agent/subagents' },
                    { text: '交接', link: '/frameworks/langchain/multi-agent/handoffs' },
                    { text: '技能', link: '/frameworks/langchain/multi-agent/skills' },
                    { text: '路由', link: '/frameworks/langchain/multi-agent/router' },
                    { text: '自定义工作流', link: '/frameworks/langchain/multi-agent/custom-workflow' },
                    { text: '交接：客服场景', link: '/frameworks/langchain/multi-agent/handoffs-customer-support' },
                    { text: '路由：知识库场景', link: '/frameworks/langchain/multi-agent/router-knowledge-base' },
                    { text: '子 Agent：个人助理场景', link: '/frameworks/langchain/multi-agent/subagents-personal-assistant' },
                    { text: '技能：SQL 助手', link: '/frameworks/langchain/multi-agent/skills-sql-assistant' }
                  ]
                },
                { text: '检索', link: '/frameworks/langchain/advanced-usage/retrieval' },
                { text: '长期记忆', link: '/frameworks/langchain/advanced-usage/long-term-memory' }
              ]
            },
            {
              text: 'Agent 开发',
              collapsed: false,
              items: [
                { text: 'LangSmith Studio', link: '/frameworks/langchain/agent-development/studio' },
                {
                  text: '测试',
                  collapsed: false,
                  items: [
                    { text: '概览', link: '/frameworks/langchain/agent-development/test/' },
                    { text: '单元测试', link: '/frameworks/langchain/agent-development/test/unit-testing' },
                    { text: '集成测试', link: '/frameworks/langchain/agent-development/test/integration-testing' },
                    { text: '评估', link: '/frameworks/langchain/agent-development/test/evals' }
                  ]
                },
                { text: 'Agent 聊天 UI', link: '/frameworks/langchain/agent-development/ui' }
              ]
            },
            {
              text: '使用 LangSmith 部署',
              collapsed: false,
              items: [
                { text: '部署', link: '/frameworks/langchain/deploy-with-langsmith/deployment' },
                { text: '可观测性', link: '/frameworks/langchain/deploy-with-langsmith/observability' }
              ]
            }
          ]
        }
      ],
      '/llm/': [
        {
          text: 'LLM',
          collapsed: false,
          items: [
            { text: '概览', link: '/llm/' },
            {
              text: '第 1 章 LLM 全景图与核心认知',
              collapsed: true,
              items: [
                { text: '概览', link: '/llm/ch01-llm-overview-and-core-cognition/' },
                {
                  text: '1.1 LLM 的定义与定位',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch01-llm-overview-and-core-cognition/m01-definition-and-positioning/' },
                    { text: '1.1.1 什么是 LLM？', link: '/llm/ch01-llm-overview-and-core-cognition/m01-definition-and-positioning/q01-what-is-llm' },
                    { text: '1.1.2 大语言模型和传统 NLP 模型有什么本质区别？', link: '/llm/ch01-llm-overview-and-core-cognition/m01-definition-and-positioning/q02-llm-vs-traditional-nlp' },
                    { text: '1.1.3 为什么大模型会表现出通用能力？', link: '/llm/ch01-llm-overview-and-core-cognition/m01-definition-and-positioning/q03-why-general-capability' },
                    { text: '1.1.4 LLM、生成式 AI、AIGC、基础模型（Foundation Model）是什么关系？', link: '/llm/ch01-llm-overview-and-core-cognition/m01-definition-and-positioning/q04-llm-aigc-foundation-model' },
                  ]
                },
                {
                  text: '1.2 LLM 的工作本质',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch01-llm-overview-and-core-cognition/m02-how-llm-works/' },
                    { text: '1.2.1 为什么说 LLM 本质上是在做“下一个 token 预测”？', link: '/llm/ch01-llm-overview-and-core-cognition/m02-how-llm-works/q01-next-token-prediction' },
                    { text: '1.2.2 为什么 LLM 的能力又不止于“下一个 token 预测”？', link: '/llm/ch01-llm-overview-and-core-cognition/m02-how-llm-works/q02-more-than-next-token' },
                    { text: '1.2.3 为什么简单的预测任务会涌现出问答、总结、推理、代码生成等能力？', link: '/llm/ch01-llm-overview-and-core-cognition/m02-how-llm-works/q03-emergent-abilities' },
                  ]
                },
                {
                  text: '1.3 LLM 的能力边界与适用场景',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch01-llm-overview-and-core-cognition/m03-boundaries-and-use-cases/' },
                    { text: '1.3.1 LLM 的能力边界在哪里？', link: '/llm/ch01-llm-overview-and-core-cognition/m03-boundaries-and-use-cases/q01-capability-boundaries' },
                    { text: '1.3.2 什么场景适合用 LLM，什么场景不适合？', link: '/llm/ch01-llm-overview-and-core-cognition/m03-boundaries-and-use-cases/q02-when-to-use-llm' },
                    { text: '1.3.3 为什么 LLM 很强，但并不适合解决所有问题？', link: '/llm/ch01-llm-overview-and-core-cognition/m03-boundaries-and-use-cases/q03-not-for-everything' },
                    { text: '1.3.4 如何判断一个问题该不该交给 LLM 处理？', link: '/llm/ch01-llm-overview-and-core-cognition/m03-boundaries-and-use-cases/q04-should-this-go-to-llm' },
                  ]
                },
              ]
            },
            {
              text: '第 2 章 Token、Embedding 与语言建模基础',
              collapsed: true,
              items: [
                { text: '概览', link: '/llm/ch02-token-embedding-and-language-modeling/' },
                {
                  text: '2.1 Token 是什么',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch02-token-embedding-and-language-modeling/m01-what-is-token/' },
                    { text: '2.1.1 什么是 Token？', link: '/llm/ch02-token-embedding-and-language-modeling/m01-what-is-token/q01-what-is-token' },
                    { text: '2.1.2 Token 和字、词、子词有什么关系？', link: '/llm/ch02-token-embedding-and-language-modeling/m01-what-is-token/q02-token-word-subword' },
                    { text: '2.1.3 为什么 LLM 不直接处理“句子含义”，而是处理 token 序列？', link: '/llm/ch02-token-embedding-and-language-modeling/m01-what-is-token/q03-why-token-sequence' },
                    { text: '2.1.4 为什么 token 数量会直接影响上下文长度、成本和输出质量？', link: '/llm/ch02-token-embedding-and-language-modeling/m01-what-is-token/q04-token-count-impact' },
                  ]
                },
                {
                  text: '2.2 Embedding 与文本表示',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch02-token-embedding-and-language-modeling/m02-embedding-and-representation/' },
                    { text: '2.2.1 什么是 Embedding？', link: '/llm/ch02-token-embedding-and-language-modeling/m02-embedding-and-representation/q01-what-is-embedding' },
                    { text: '2.2.2 为什么模型需要把 token 映射成向量表示？', link: '/llm/ch02-token-embedding-and-language-modeling/m02-embedding-and-representation/q02-why-vector-representation' },
                    { text: '2.2.3 Embedding 在 LLM 里主要负责什么？', link: '/llm/ch02-token-embedding-and-language-modeling/m02-embedding-and-representation/q03-embedding-role-in-llm' },
                    { text: '2.2.4 它和 RAG 里的 embedding 有什么异同？', link: '/llm/ch02-token-embedding-and-language-modeling/m02-embedding-and-representation/q04-embedding-vs-rag-embedding' },
                  ]
                },
                {
                  text: '2.3 语言模型与自回归生成',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch02-token-embedding-and-language-modeling/m03-language-modeling-and-autoregression/' },
                    { text: '2.3.1 什么是语言模型（Language Model）？', link: '/llm/ch02-token-embedding-and-language-modeling/m03-language-modeling-and-autoregression/q01-what-is-language-model' },
                    { text: '2.3.2 什么是自回归生成（Autoregressive Generation）？', link: '/llm/ch02-token-embedding-and-language-modeling/m03-language-modeling-and-autoregression/q02-what-is-autoregressive-generation' },
                    { text: '2.3.3 为什么 LLM 生成文本是一个逐 token 预测过程？', link: '/llm/ch02-token-embedding-and-language-modeling/m03-language-modeling-and-autoregression/q03-why-generate-token-by-token' },
                    { text: '2.3.4 为什么模型是“一个 token 一个 token 地生成”，却能看起来像在“思考”？', link: '/llm/ch02-token-embedding-and-language-modeling/m03-language-modeling-and-autoregression/q04-why-it-looks-like-thinking' },
                  ]
                },
              ]
            },
            {
              text: '第 3 章 Transformer 与 Attention 机制',
              collapsed: true,
              items: [
                { text: '概览', link: '/llm/ch03-transformer-and-attention/' },
                {
                  text: '3.1 Transformer 为什么成为主流架构',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch03-transformer-and-attention/m01-why-transformer/' },
                    { text: '3.1.1 Transformer 为什么会成为大模型基础架构？', link: '/llm/ch03-transformer-and-attention/m01-why-transformer/q01-why-transformer-mainstream' },
                    { text: '3.1.2 Attention 为什么比 RNN 更适合大规模建模？', link: '/llm/ch03-transformer-and-attention/m01-why-transformer/q02-attention-vs-rnn' },
                    { text: '3.1.3 Transformer 相比传统序列模型的核心优势是什么？', link: '/llm/ch03-transformer-and-attention/m01-why-transformer/q03-transformer-core-advantages' },
                  ]
                },
                {
                  text: '3.2 Attention 机制的核心思想',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch03-transformer-and-attention/m02-attention-core-ideas/' },
                    { text: '3.2.1 Self-Attention 是什么？', link: '/llm/ch03-transformer-and-attention/m02-attention-core-ideas/q01-what-is-self-attention' },
                    { text: '3.2.2 Self-Attention 为什么能建模长距离依赖？', link: '/llm/ch03-transformer-and-attention/m02-attention-core-ideas/q02-why-self-attention-long-dependency' },
                    { text: '3.2.3 Multi-Head Attention 的作用是什么？', link: '/llm/ch03-transformer-and-attention/m02-attention-core-ideas/q03-what-is-multi-head-attention' },
                    { text: '3.2.4 为什么多头注意力能提升模型表达能力？', link: '/llm/ch03-transformer-and-attention/m02-attention-core-ideas/q04-why-multi-head-helps' },
                  ]
                },
                {
                  text: '3.3 位置编码与模型结构',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch03-transformer-and-attention/m03-position-encoding-and-structure/' },
                    { text: '3.3.1 Position Encoding 是什么？', link: '/llm/ch03-transformer-and-attention/m03-position-encoding-and-structure/q01-what-is-position-encoding' },
                    { text: '3.3.2 RoPE 是什么？为什么它在现代 LLM 中很常见？', link: '/llm/ch03-transformer-and-attention/m03-position-encoding-and-structure/q02-what-is-rope' },
                    { text: '3.3.3 Transformer 的基本结构是什么？', link: '/llm/ch03-transformer-and-attention/m03-position-encoding-and-structure/q03-transformer-basic-structure' },
                    { text: '3.3.4 Attention、MLP、残差连接、LayerNorm 分别起什么作用？', link: '/llm/ch03-transformer-and-attention/m03-position-encoding-and-structure/q04-components-role' },
                  ]
                },
                {
                  text: '3.4 三种 Transformer 结构范式',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch03-transformer-and-attention/m04-transformer-paradigms/' },
                    { text: '3.4.1 Decoder-only、Encoder-only、Encoder-Decoder 分别适合什么任务？', link: '/llm/ch03-transformer-and-attention/m04-transformer-paradigms/q01-three-paradigms' },
                    { text: '3.4.2 为什么今天的大多数 LLM 都是 Decoder-only？', link: '/llm/ch03-transformer-and-attention/m04-transformer-paradigms/q02-why-decoder-only' },
                    { text: '3.4.3 BERT、T5、GPT 这几类模型分别代表什么思路？', link: '/llm/ch03-transformer-and-attention/m04-transformer-paradigms/q03-bert-t5-gpt-differences' },
                  ]
                },
              ]
            },
            {
              text: '第 4 章 预训练机制',
              collapsed: true,
              items: [
                { text: '概览', link: '/llm/ch04-pretraining/' },
                {
                  text: '4.1 什么是预训练',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch04-pretraining/m01-what-is-pretraining/' },
                    { text: '4.1.1 什么是预训练（Pretraining）？', link: '/llm/ch04-pretraining/m01-what-is-pretraining/q01-what-is-pretraining' },
                    { text: '4.1.2 为什么预训练是 LLM 能力形成的基础？', link: '/llm/ch04-pretraining/m01-what-is-pretraining/q02-why-pretraining-is-foundation' },
                    { text: '4.1.3 预训练和传统监督学习有什么区别？', link: '/llm/ch04-pretraining/m01-what-is-pretraining/q03-pretraining-vs-supervised-learning' },
                  ]
                },
                {
                  text: '4.2 预训练数据与训练目标',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch04-pretraining/m02-data-and-training-objective/' },
                    { text: '4.2.1 预训练数据通常来自哪里？', link: '/llm/ch04-pretraining/m02-data-and-training-objective/q01-where-pretraining-data-comes-from' },
                    { text: '4.2.2 为什么数据规模对 LLM 很重要？', link: '/llm/ch04-pretraining/m02-data-and-training-objective/q02-why-data-scale-matters' },
                    { text: '4.2.3 预训练目标为什么通常是 next token prediction？', link: '/llm/ch04-pretraining/m02-data-and-training-objective/q03-why-next-token-objective' },
                    { text: '4.2.4 什么是 Causal LM？', link: '/llm/ch04-pretraining/m02-data-and-training-objective/q04-what-is-causal-lm' },
                  ]
                },
                {
                  text: '4.3 Scaling Law 与训练规模',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch04-pretraining/m03-scaling-law-and-training-scale/' },
                    { text: '4.3.1 什么是 Scaling Law？', link: '/llm/ch04-pretraining/m03-scaling-law-and-training-scale/q01-what-is-scaling-law' },
                    { text: '4.3.2 模型参数、数据量、训练算力之间是什么关系？', link: '/llm/ch04-pretraining/m03-scaling-law-and-training-scale/q02-params-data-compute-relationship' },
                    { text: '4.3.3 为什么不是参数越大效果就一定越好？', link: '/llm/ch04-pretraining/m03-scaling-law-and-training-scale/q03-why-bigger-not-always-better' },
                    { text: '4.3.4 为什么高质量数据有时比盲目扩参更重要？', link: '/llm/ch04-pretraining/m03-scaling-law-and-training-scale/q04-why-data-quality-matters' },
                  ]
                },
                {
                  text: '4.4 预训练带来的能力与局限',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch04-pretraining/m04-abilities-and-limitations-of-pretraining/' },
                    { text: '4.4.1 预训练为什么能带来语言理解与生成能力？', link: '/llm/ch04-pretraining/m04-abilities-and-limitations-of-pretraining/q01-why-pretraining-brings-language-ability' },
                    { text: '4.4.2 为什么预训练模型“会续写”，但不一定“会做助手”？', link: '/llm/ch04-pretraining/m04-abilities-and-limitations-of-pretraining/q02-can-complete-but-not-assistant' },
                    { text: '4.4.3 为什么预训练阶段学到的知识会过时？', link: '/llm/ch04-pretraining/m04-abilities-and-limitations-of-pretraining/q03-why-pretraining-knowledge-gets-stale' },
                  ]
                },
              ]
            },
            {
              text: '第 5 章 指令微调与对齐',
              collapsed: true,
              items: [
                { text: '概览', link: '/llm/ch05-instruction-tuning-and-alignment/' },
                {
                  text: '5.1 为什么预训练后还不够',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch05-instruction-tuning-and-alignment/m01-why-pretraining-is-not-enough/' },
                    { text: '5.1.1 为什么预训练好的模型还不能直接拿来做助手？', link: '/llm/ch05-instruction-tuning-and-alignment/m01-why-pretraining-is-not-enough/q01-why-pretrained-model-not-ready' },
                    { text: '5.1.2 为什么“会补全文本”和“会遵循用户意图”是两件事？', link: '/llm/ch05-instruction-tuning-and-alignment/m01-why-pretraining-is-not-enough/q02-completion-vs-following-intent' },
                    { text: '5.1.3 为什么指令跟随能力需要单独训练？', link: '/llm/ch05-instruction-tuning-and-alignment/m01-why-pretraining-is-not-enough/q03-why-instruction-following-needs-training' },
                  ]
                },
                {
                  text: '5.2 SFT 与 Instruction Tuning',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch05-instruction-tuning-and-alignment/m02-sft-and-instruction-tuning/' },
                    { text: '5.2.1 什么是 SFT（Supervised Fine-Tuning）？', link: '/llm/ch05-instruction-tuning-and-alignment/m02-sft-and-instruction-tuning/q01-what-is-sft' },
                    { text: '5.2.2 什么是 Instruction Tuning？', link: '/llm/ch05-instruction-tuning-and-alignment/m02-sft-and-instruction-tuning/q02-what-is-instruction-tuning' },
                    { text: '5.2.3 什么是 In-Context Learning？', link: '/llm/ch05-instruction-tuning-and-alignment/m02-sft-and-instruction-tuning/q03-what-is-in-context-learning' },
                    { text: '5.2.4 为什么指令微调能让模型更像“助手”？', link: '/llm/ch05-instruction-tuning-and-alignment/m02-sft-and-instruction-tuning/q04-why-instruction-tuning-helps' },
                    { text: '5.2.5 In-Context Learning 和微调分别适合解决什么问题？', link: '/llm/ch05-instruction-tuning-and-alignment/m02-sft-and-instruction-tuning/q05-icl-vs-finetuning' },
                  ]
                },
                {
                  text: '5.3 对齐（Alignment）',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch05-instruction-tuning-and-alignment/m03-alignment/' },
                    { text: '5.3.1 什么是对齐（Alignment）？', link: '/llm/ch05-instruction-tuning-and-alignment/m03-alignment/q01-what-is-alignment' },
                    { text: '5.3.2 为什么大模型不仅要“能力强”，还要“行为可控”？', link: '/llm/ch05-instruction-tuning-and-alignment/m03-alignment/q02-why-behavior-control-matters' },
                    { text: '5.3.3 对齐为什么会影响模型风格、安全性和可用性？', link: '/llm/ch05-instruction-tuning-and-alignment/m03-alignment/q03-alignment-affects-ux' },
                  ]
                },
                {
                  text: '5.4 RLHF 与 DPO',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch05-instruction-tuning-and-alignment/m04-rlhf-and-dpo/' },
                    { text: '5.4.1 什么是 RLHF？', link: '/llm/ch05-instruction-tuning-and-alignment/m04-rlhf-and-dpo/q01-what-is-rlhf' },
                    { text: '5.4.2 什么是 DPO？', link: '/llm/ch05-instruction-tuning-and-alignment/m04-rlhf-and-dpo/q02-what-is-dpo' },
                    { text: '5.4.3 RLHF 和 DPO 分别适合解决什么问题？', link: '/llm/ch05-instruction-tuning-and-alignment/m04-rlhf-and-dpo/q03-rlhf-vs-dpo' },
                    { text: '5.4.4 为什么对齐方法会直接影响模型的用户体验？', link: '/llm/ch05-instruction-tuning-and-alignment/m04-rlhf-and-dpo/q04-alignment-methods-impact-ux' },
                  ]
                },
              ]
            },
            {
              text: '第 6 章 推理、采样与生成控制',
              collapsed: true,
              items: [
                { text: '概览', link: '/llm/ch06-inference-sampling-and-generation-control/' },
                {
                  text: '6.1 模型推理时到底在做什么',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch06-inference-sampling-and-generation-control/m01-what-happens-during-inference/' },
                    { text: '6.1.1 LLM 推理时到底在做什么？', link: '/llm/ch06-inference-sampling-and-generation-control/m01-what-happens-during-inference/q01-what-happens-during-inference' },
                    { text: '6.1.2 从输入到输出，中间发生了哪些关键步骤？', link: '/llm/ch06-inference-sampling-and-generation-control/m01-what-happens-during-inference/q02-key-steps-input-to-output' },
                    { text: '6.1.3 为什么推理阶段虽然不训练参数，但仍然很耗资源？', link: '/llm/ch06-inference-sampling-and-generation-control/m01-what-happens-during-inference/q03-why-inference-is-expensive' },
                  ]
                },
                {
                  text: '6.2 采样与解码策略',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch06-inference-sampling-and-generation-control/m02-sampling-and-decoding/' },
                    { text: '6.2.1 什么是 Temperature？', link: '/llm/ch06-inference-sampling-and-generation-control/m02-sampling-and-decoding/q01-what-is-temperature' },
                    { text: '6.2.2 什么是 Top-k、Top-p？', link: '/llm/ch06-inference-sampling-and-generation-control/m02-sampling-and-decoding/q02-what-are-topk-topp' },
                    { text: '6.2.3 Temperature 和 Top-p 有什么区别？', link: '/llm/ch06-inference-sampling-and-generation-control/m02-sampling-and-decoding/q03-temperature-vs-topp' },
                    { text: '6.2.4 什么是 Greedy Decoding？', link: '/llm/ch06-inference-sampling-and-generation-control/m02-sampling-and-decoding/q04-what-is-greedy-decoding' },
                    { text: '6.2.5 为什么同一个问题模型每次回答可能不同？', link: '/llm/ch06-inference-sampling-and-generation-control/m02-sampling-and-decoding/q05-why-answers-differ' },
                  ]
                },
                {
                  text: '6.3 输出控制与使用场景',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch06-inference-sampling-and-generation-control/m03-output-control-and-use-cases/' },
                    { text: '6.3.1 什么场景适合确定性输出，什么场景适合发散性输出？', link: '/llm/ch06-inference-sampling-and-generation-control/m03-output-control-and-use-cases/q01-deterministic-vs-diverse-output' },
                    { text: '6.3.2 为什么创意生成和事实问答适合不同的采样参数？', link: '/llm/ch06-inference-sampling-and-generation-control/m03-output-control-and-use-cases/q02-creative-vs-factual-sampling' },
                    { text: '6.3.3 如何根据任务类型调整生成策略？', link: '/llm/ch06-inference-sampling-and-generation-control/m03-output-control-and-use-cases/q03-adjust-generation-strategy-by-task' },
                  ]
                },
                {
                  text: '6.4 推理效率优化',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch06-inference-sampling-and-generation-control/m04-inference-efficiency/' },
                    { text: '6.4.1 什么是 KV Cache？', link: '/llm/ch06-inference-sampling-and-generation-control/m04-inference-efficiency/q01-what-is-kv-cache' },
                    { text: '6.4.2 KV Cache 为什么能提升推理效率？', link: '/llm/ch06-inference-sampling-and-generation-control/m04-inference-efficiency/q02-why-kv-cache-helps' },
                    { text: '6.4.3 为什么长上下文会导致推理成本变高？', link: '/llm/ch06-inference-sampling-and-generation-control/m04-inference-efficiency/q03-why-long-context-costs-more' },
                    { text: '6.4.4 为什么输出越长，延迟和成本通常越高？', link: '/llm/ch06-inference-sampling-and-generation-control/m04-inference-efficiency/q04-why-longer-output-costs-more' },
                  ]
                },
              ]
            },
            {
              text: '第 7 章 上下文窗口、记忆与长文本问题',
              collapsed: true,
              items: [
                { text: '概览', link: '/llm/ch07-context-window-memory-and-long-context/' },
                {
                  text: '7.1 上下文窗口是什么',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch07-context-window-memory-and-long-context/m01-what-is-context-window/' },
                    { text: '7.1.1 什么是上下文窗口（Context Window）？', link: '/llm/ch07-context-window-memory-and-long-context/m01-what-is-context-window/q01-what-is-context-window' },
                    { text: '7.1.2 上下文窗口为什么会限制模型一次能处理的信息量？', link: '/llm/ch07-context-window-memory-and-long-context/m01-what-is-context-window/q02-why-context-window-limits-information' },
                    { text: '7.1.3 为什么上下文长度是 LLM 产品设计中的关键约束？', link: '/llm/ch07-context-window-memory-and-long-context/m01-what-is-context-window/q03-why-context-window-is-key-constraint' },
                  ]
                },
                {
                  text: '7.2 模型的“记忆”到底是什么',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch07-context-window-memory-and-long-context/m02-what-memory-means/' },
                    { text: '7.2.1 模型的“记忆”到底指什么？', link: '/llm/ch07-context-window-memory-and-long-context/m02-what-memory-means/q01-what-does-memory-mean' },
                    { text: '7.2.2 参数记忆和上下文记忆有什么区别？', link: '/llm/ch07-context-window-memory-and-long-context/m02-what-memory-means/q02-param-memory-vs-context-memory' },
                    { text: '7.2.3 为什么模型“记得某些知识”不等于它能稳定调用这些知识？', link: '/llm/ch07-context-window-memory-and-long-context/m02-what-memory-means/q03-knowing-vs-using-knowledge' },
                  ]
                },
                {
                  text: '7.3 长上下文问题',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch07-context-window-memory-and-long-context/m03-long-context-problems/' },
                    { text: '7.3.1 为什么上下文越长不一定效果越好？', link: '/llm/ch07-context-window-memory-and-long-context/m03-long-context-problems/q01-longer-context-not-always-better' },
                    { text: '7.3.2 什么是 lost in the middle？', link: '/llm/ch07-context-window-memory-and-long-context/m03-long-context-problems/q02-what-is-lost-in-the-middle' },
                    { text: '7.3.3 长上下文能力为什么很难真正做好？', link: '/llm/ch07-context-window-memory-and-long-context/m03-long-context-problems/q03-why-long-context-is-hard' },
                    { text: '7.3.4 长文本输入会带来哪些典型问题？', link: '/llm/ch07-context-window-memory-and-long-context/m03-long-context-problems/q04-typical-long-text-problems' },
                  ]
                },
                {
                  text: '7.4 长上下文与 RAG 的关系',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch07-context-window-memory-and-long-context/m04-long-context-vs-rag/' },
                    { text: '7.4.1 为什么很多长上下文问题最终还是需要 RAG？', link: '/llm/ch07-context-window-memory-and-long-context/m04-long-context-vs-rag/q01-why-long-context-still-needs-rag' },
                    { text: '7.4.2 长上下文和 RAG 分别适合什么场景？', link: '/llm/ch07-context-window-memory-and-long-context/m04-long-context-vs-rag/q02-long-context-vs-rag-use-cases' },
                    { text: '7.4.3 为什么“上下文窗口很大”不等于“就不需要检索”？', link: '/llm/ch07-context-window-memory-and-long-context/m04-long-context-vs-rag/q03-big-context-not-equal-no-retrieval' },
                  ]
                },
              ]
            },
            {
              text: '第 8 章 Prompt、工具调用与 Agent 基础',
              collapsed: true,
              items: [
                { text: '概览', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/' },
                {
                  text: '8.1 Prompt 的基本作用',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m01-prompt-basics/' },
                    { text: '8.1.1 什么是 Prompt？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m01-prompt-basics/q01-what-is-prompt' },
                    { text: '8.1.2 Prompt Engineering 的本质是什么？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m01-prompt-basics/q02-what-is-prompt-engineering' },
                    { text: '8.1.3 为什么 Prompt 很重要，但又不能神化 Prompt？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m01-prompt-basics/q03-why-prompt-matters-but-not-magical' },
                  ]
                },
                {
                  text: '8.2 Prompt 的结构与常见方法',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m02-prompt-structure-and-methods/' },
                    { text: '8.2.1 System Prompt、User Prompt、Tool Prompt 分别起什么作用？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m02-prompt-structure-and-methods/q01-system-user-tool-prompt' },
                    { text: '8.2.2 Zero-shot、Few-shot、Chain-of-Thought 分别是什么？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m02-prompt-structure-and-methods/q02-zero-shot-few-shot-cot' },
                    { text: '8.2.3 为什么不同任务类型需要不同 Prompt 结构？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m02-prompt-structure-and-methods/q03-why-different-tasks-need-different-structures' },
                    { text: '8.2.4 为什么 Prompt 设计会直接影响模型输出风格和稳定性？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m02-prompt-structure-and-methods/q04-why-prompt-affects-style-and-stability' },
                  ]
                },
                {
                  text: '8.3 工具调用',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m03-tool-calling/' },
                    { text: '8.3.1 什么是 Function Calling / Tool Calling？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m03-tool-calling/q01-what-is-tool-calling' },
                    { text: '8.3.2 LLM 为什么需要调用工具？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m03-tool-calling/q02-why-llm-needs-tools' },
                    { text: '8.3.3 哪些能力适合交给模型，哪些能力应该交给工具？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m03-tool-calling/q03-model-vs-tool-boundaries' },
                    { text: '8.3.4 为什么工具调用能显著降低模型“硬猜”的概率？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m03-tool-calling/q04-why-tool-calling-reduces-guessing' },
                  ]
                },
                {
                  text: '8.4 Agent 基础',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m04-agent-basics/' },
                    { text: '8.4.1 Agent 和普通聊天机器人有什么区别？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m04-agent-basics/q01-agent-vs-chatbot' },
                    { text: '8.4.2 Agent 为什么通常建立在 LLM + 工具 + 记忆 / RAG 之上？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m04-agent-basics/q02-agent-built-on-llm-tools-memory' },
                    { text: '8.4.3 Workflow 和 Agent 的边界在哪里？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m04-agent-basics/q03-workflow-vs-agent' },
                    { text: '8.4.4 什么情况下不该把系统设计成 Agent？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m04-agent-basics/q04-when-not-to-build-agent' },
                  ]
                },
              ]
            },
            {
              text: '第 9 章 幻觉、稳定性与常见问题',
              collapsed: true,
              items: [
                { text: '概览', link: '/llm/ch09-hallucination-stability-and-common-issues/' },
                {
                  text: '9.1 什么是幻觉',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch09-hallucination-stability-and-common-issues/m01-what-is-hallucination/' },
                    { text: '9.1.1 什么是幻觉（Hallucination）？', link: '/llm/ch09-hallucination-stability-and-common-issues/m01-what-is-hallucination/q01-what-is-hallucination' },
                    { text: '9.1.2 为什么 LLM 会幻觉？', link: '/llm/ch09-hallucination-stability-and-common-issues/m01-what-is-hallucination/q02-why-llm-hallucinates' },
                    { text: '9.1.3 幻觉和“知识过时”有什么区别？', link: '/llm/ch09-hallucination-stability-and-common-issues/m01-what-is-hallucination/q03-hallucination-vs-stale-knowledge' },
                    { text: '9.1.4 为什么模型有时会一本正经地胡说八道？', link: '/llm/ch09-hallucination-stability-and-common-issues/m01-what-is-hallucination/q04-why-confidently-wrong' },
                  ]
                },
                {
                  text: '9.2 稳定性问题',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch09-hallucination-stability-and-common-issues/m02-stability-problems/' },
                    { text: '9.2.1 为什么同一个问题有时答得很好，有时答得很差？', link: '/llm/ch09-hallucination-stability-and-common-issues/m02-stability-problems/q01-why-same-question-different-quality' },
                    { text: '9.2.2 什么是随机性，什么是系统性错误？', link: '/llm/ch09-hallucination-stability-and-common-issues/m02-stability-problems/q02-random-vs-systematic-errors' },
                    { text: '9.2.3 为什么模型输出会受 Prompt、采样参数、上下文组织影响？', link: '/llm/ch09-hallucination-stability-and-common-issues/m02-stability-problems/q03-why-output-depends-on-prompt-and-context' },
                    { text: '9.2.4 为什么模型在边界问题上更容易不稳定？', link: '/llm/ch09-hallucination-stability-and-common-issues/m02-stability-problems/q04-why-boundary-cases-are-unstable' },
                  ]
                },
                {
                  text: '9.3 如何降低错误',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch09-hallucination-stability-and-common-issues/m03-how-to-reduce-errors/' },
                    { text: '9.3.1 如何降低幻觉？', link: '/llm/ch09-hallucination-stability-and-common-issues/m03-how-to-reduce-errors/q01-how-to-reduce-hallucination' },
                    { text: '9.3.2 为什么“加 Prompt”不能解决所有问题？', link: '/llm/ch09-hallucination-stability-and-common-issues/m03-how-to-reduce-errors/q02-why-prompt-not-enough' },
                    { text: '9.3.3 哪些问题应该靠模型解决，哪些问题应该靠 RAG / 工具解决？', link: '/llm/ch09-hallucination-stability-and-common-issues/m03-how-to-reduce-errors/q03-model-vs-rag-vs-tools' },
                    { text: '9.3.4 为什么真实系统里要把“模型能力”和“系统补偿能力”结合起来看？', link: '/llm/ch09-hallucination-stability-and-common-issues/m03-how-to-reduce-errors/q04-model-and-system-compensation' },
                  ]
                },
              ]
            },
            {
              text: '第 10 章 LLM 评测体系',
              collapsed: true,
              items: [
                { text: '概览', link: '/llm/ch10-evaluation/' },
                {
                  text: '10.1 为什么不能只靠主观感觉评模型',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch10-evaluation/m01-why-not-judge-by-feel/' },
                    { text: '10.1.1 为什么 LLM 不能只看感觉好不好用？', link: '/llm/ch10-evaluation/m01-why-not-judge-by-feel/q01-why-not-judge-by-feel' },
                    { text: '10.1.2 为什么“看起来聪明”不等于“真实可用”？', link: '/llm/ch10-evaluation/m01-why-not-judge-by-feel/q02-smart-looking-not-equal-usable' },
                    { text: '10.1.3 为什么模型评测必须区分离线能力和线上效果？', link: '/llm/ch10-evaluation/m01-why-not-judge-by-feel/q03-offline-vs-online-evaluation' },
                  ]
                },
                {
                  text: '10.2 常见评测方式与 Benchmark',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch10-evaluation/m02-benchmarks-and-common-evals/' },
                    { text: '10.2.1 预训练模型常见评测方式有哪些？', link: '/llm/ch10-evaluation/m02-benchmarks-and-common-evals/q01-pretraining-model-evals' },
                    { text: '10.2.2 指令模型常见评测方式有哪些？', link: '/llm/ch10-evaluation/m02-benchmarks-and-common-evals/q02-instruction-model-evals' },
                    { text: '10.2.3 什么是 Benchmark？', link: '/llm/ch10-evaluation/m02-benchmarks-and-common-evals/q03-what-is-benchmark' },
                    { text: '10.2.4 MMLU、GSM8K、HumanEval 分别在测什么？', link: '/llm/ch10-evaluation/m02-benchmarks-and-common-evals/q04-what-do-mmlu-gsm8k-humaneval-measure' },
                    { text: '10.2.5 为什么 benchmark 分高不一定代表真实业务效果就好？', link: '/llm/ch10-evaluation/m02-benchmarks-and-common-evals/q05-why-benchmark-score-not-enough' },
                  ]
                },
                {
                  text: '10.3 LLM-as-a-Judge 与评测实践',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch10-evaluation/m03-llm-as-a-judge-and-practice/' },
                    { text: '10.3.1 什么是 LLM-as-a-Judge？', link: '/llm/ch10-evaluation/m03-llm-as-a-judge-and-practice/q01-what-is-llm-as-a-judge' },
                    { text: '10.3.2 主观评测和客观评测分别适合什么场景？', link: '/llm/ch10-evaluation/m03-llm-as-a-judge-and-practice/q02-subjective-vs-objective-eval' },
                    { text: '10.3.3 为什么真实产品里通常需要多种评测方式结合？', link: '/llm/ch10-evaluation/m03-llm-as-a-judge-and-practice/q03-why-combine-evals' },
                    { text: '10.3.4 如何避免只追 benchmark 而忽略业务目标？', link: '/llm/ch10-evaluation/m03-llm-as-a-judge-and-practice/q04-avoid-benchmark-only-optimization' },
                  ]
                },
                {
                  text: '10.4 线上模型评估',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch10-evaluation/m04-online-evaluation/' },
                    { text: '10.4.1 线上模型应该监控哪些指标？', link: '/llm/ch10-evaluation/m04-online-evaluation/q01-online-metrics' },
                    { text: '10.4.2 如何判断模型质量下降是模型问题、Prompt 问题还是数据问题？', link: '/llm/ch10-evaluation/m04-online-evaluation/q02-how-to-locate-quality-drop' },
                    { text: '10.4.3 为什么线上监控对 LLM 产品至关重要？', link: '/llm/ch10-evaluation/m04-online-evaluation/q03-why-online-monitoring-matters' },
                  ]
                },
              ]
            },
            {
              text: '第 11 章 LLM 优化与落地',
              collapsed: true,
              items: [
                { text: '概览', link: '/llm/ch11-optimization-and-production/' },
                {
                  text: '11.1 模型、Prompt 与 RAG 的选择',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch11-optimization-and-production/m01-model-prompt-rag-choices/' },
                    { text: '11.1.1 什么时候该换模型，什么时候该改 Prompt，什么时候该加 RAG？', link: '/llm/ch11-optimization-and-production/m01-model-prompt-rag-choices/q01-when-to-switch-model-prompt-rag' },
                    { text: '11.1.2 为什么不是所有问题都值得微调？', link: '/llm/ch11-optimization-and-production/m01-model-prompt-rag-choices/q02-why-not-everything-needs-finetuning' },
                    { text: '11.1.3 为什么很多业务问题最后是系统设计问题，而不只是模型问题？', link: '/llm/ch11-optimization-and-production/m01-model-prompt-rag-choices/q03-why-business-issues-are-system-design' },
                  ]
                },
                {
                  text: '11.2 效果、延迟与成本的平衡',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch11-optimization-and-production/m02-balance-quality-latency-cost/' },
                    { text: '11.2.1 如何平衡效果、延迟和成本？', link: '/llm/ch11-optimization-and-production/m02-balance-quality-latency-cost/q01-balance-quality-latency-cost' },
                    { text: '11.2.2 为什么模型越强，往往成本也越高？', link: '/llm/ch11-optimization-and-production/m02-balance-quality-latency-cost/q02-why-stronger-models-cost-more' },
                    { text: '11.2.3 如何根据业务目标设计“够用”的模型方案？', link: '/llm/ch11-optimization-and-production/m02-balance-quality-latency-cost/q03-design-good-enough-solution' },
                  ]
                },
                {
                  text: '11.3 常见优化手段',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch11-optimization-and-production/m03-common-optimization-methods/' },
                    { text: '11.3.1 什么是量化（Quantization）？', link: '/llm/ch11-optimization-and-production/m03-common-optimization-methods/q01-what-is-quantization' },
                    { text: '11.3.2 什么是蒸馏（Distillation）？', link: '/llm/ch11-optimization-and-production/m03-common-optimization-methods/q02-what-is-distillation' },
                    { text: '11.3.3 什么是 LoRA / PEFT？', link: '/llm/ch11-optimization-and-production/m03-common-optimization-methods/q03-what-is-lora-peft' },
                    { text: '11.3.4 它们分别更适合优化什么问题？', link: '/llm/ch11-optimization-and-production/m03-common-optimization-methods/q04-what-problems-they-optimize' },
                  ]
                },
                {
                  text: '11.4 微调与系统增强',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch11-optimization-and-production/m04-finetuning-vs-system-enhancement/' },
                    { text: '11.4.1 微调和 RAG 应该怎么选？', link: '/llm/ch11-optimization-and-production/m04-finetuning-vs-system-enhancement/q01-finetuning-vs-rag' },
                    { text: '11.4.2 小模型、大模型、开源模型、闭源模型分别适合什么场景？', link: '/llm/ch11-optimization-and-production/m04-finetuning-vs-system-enhancement/q02-small-big-open-closed-models' },
                    { text: '11.4.3 企业落地 LLM 时最常见的风险是什么？', link: '/llm/ch11-optimization-and-production/m04-finetuning-vs-system-enhancement/q03-common-enterprise-risks' },
                    { text: '11.4.4 如何做安全、权限、审计和观测？', link: '/llm/ch11-optimization-and-production/m04-finetuning-vs-system-enhancement/q04-security-permission-audit-observability' },
                  ]
                },
              ]
            },
            {
              text: '第 12 章 开源模型与模型选型',
              collapsed: true,
              items: [
                { text: '概览', link: '/llm/ch12-open-source-models-and-selection/' },
                {
                  text: '12.1 开源与闭源模型的选择',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch12-open-source-models-and-selection/m01-open-vs-closed-models/' },
                    { text: '12.1.1 闭源模型和开源模型怎么选？', link: '/llm/ch12-open-source-models-and-selection/m01-open-vs-closed-models/q01-how-to-choose-open-vs-closed' },
                    { text: '12.1.2 为什么“效果最好”不一定等于“业务最合适”？', link: '/llm/ch12-open-source-models-and-selection/m01-open-vs-closed-models/q02-best-not-always-best-fit' },
                    { text: '12.1.3 开源和闭源在成本、控制权、稳定性上分别有什么取舍？', link: '/llm/ch12-open-source-models-and-selection/m01-open-vs-closed-models/q03-open-vs-closed-tradeoffs' },
                  ]
                },
                {
                  text: '12.2 模型类型的区分',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch12-open-source-models-and-selection/m02-model-type-differences/' },
                    { text: '12.2.1 Base Model 和 Instruct Model 有什么区别？', link: '/llm/ch12-open-source-models-and-selection/m02-model-type-differences/q01-base-vs-instruct' },
                    { text: '12.2.2 通用模型和垂类模型怎么选？', link: '/llm/ch12-open-source-models-and-selection/m02-model-type-differences/q02-general-vs-domain-model' },
                    { text: '12.2.3 为什么不同模型的“默认行为风格”差异很大？', link: '/llm/ch12-open-source-models-and-selection/m02-model-type-differences/q03-why-default-behavior-differs' },
                  ]
                },
                {
                  text: '12.3 模型选型维度',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch12-open-source-models-and-selection/m03-model-selection-dimensions/' },
                    { text: '12.3.1 选择模型时应该看哪些维度？', link: '/llm/ch12-open-source-models-and-selection/m03-model-selection-dimensions/q01-selection-dimensions' },
                    { text: '12.3.2 参数量是否仍然是核心指标？', link: '/llm/ch12-open-source-models-and-selection/m03-model-selection-dimensions/q02-are-params-still-core-metric' },
                    { text: '12.3.3 上下文长度、推理速度、价格、稳定性该怎么平衡？', link: '/llm/ch12-open-source-models-and-selection/m03-model-selection-dimensions/q03-how-to-balance-context-speed-price-stability' },
                    { text: '12.3.4 什么场景适合部署小模型？', link: '/llm/ch12-open-source-models-and-selection/m03-model-selection-dimensions/q04-when-small-models-fit' },
                    { text: '12.3.5 什么场景必须用强模型？', link: '/llm/ch12-open-source-models-and-selection/m03-model-selection-dimensions/q05-when-strong-models-are-required' },
                  ]
                },
              ]
            },
            {
              text: '第 13 章 LLM 与 RAG、Agent 的关系',
              collapsed: true,
              items: [
                { text: '概览', link: '/llm/ch13-llm-rag-and-agent-relationship/' },
                {
                  text: '13.1 LLM 与 RAG 的关系',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch13-llm-rag-and-agent-relationship/m01-llm-and-rag/' },
                    { text: '13.1.1 为什么有了 LLM 还需要 RAG？', link: '/llm/ch13-llm-rag-and-agent-relationship/m01-llm-and-rag/q01-why-llm-still-needs-rag' },
                    { text: '13.1.2 为什么很多“知识型问题”只靠 LLM 不够？', link: '/llm/ch13-llm-rag-and-agent-relationship/m01-llm-and-rag/q02-why-knowledge-problems-need-more-than-llm' },
                    { text: '13.1.3 哪些问题更适合纯 LLM，哪些更适合 LLM + RAG？', link: '/llm/ch13-llm-rag-and-agent-relationship/m01-llm-and-rag/q03-pure-llm-vs-llm-plus-rag' },
                  ]
                },
                {
                  text: '13.2 RAG 与 Agent 的关系',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch13-llm-rag-and-agent-relationship/m02-rag-and-agent/' },
                    { text: '13.2.1 为什么有了 RAG 还不等于 Agent？', link: '/llm/ch13-llm-rag-and-agent-relationship/m02-rag-and-agent/q01-why-rag-is-not-agent' },
                    { text: '13.2.2 RAG 和 Agent 的核心差别是什么？', link: '/llm/ch13-llm-rag-and-agent-relationship/m02-rag-and-agent/q02-rag-vs-agent-core-difference' },
                    { text: '13.2.3 为什么 Agent 更强调任务分解、工具调用和执行闭环？', link: '/llm/ch13-llm-rag-and-agent-relationship/m02-rag-and-agent/q03-why-agent-emphasizes-closed-loop' },
                  ]
                },
                {
                  text: '13.3 三者在实际系统中的分工',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch13-llm-rag-and-agent-relationship/m03-division-of-labor-in-real-systems/' },
                    { text: '13.3.1 LLM、RAG、Tool Use、Workflow、Agent 之间是什么关系？', link: '/llm/ch13-llm-rag-and-agent-relationship/m03-division-of-labor-in-real-systems/q01-relationships-among-components' },
                    { text: '13.3.2 一个实际 AI 应用中，哪些问题应该由 LLM 解决，哪些交给 RAG，哪些交给工具？', link: '/llm/ch13-llm-rag-and-agent-relationship/m03-division-of-labor-in-real-systems/q02-what-to-give-llm-rag-tools' },
                    { text: '13.3.3 什么时候系统该从“纯 LLM”升级到“RAG”？', link: '/llm/ch13-llm-rag-and-agent-relationship/m03-division-of-labor-in-real-systems/q03-when-to-upgrade-to-rag' },
                    { text: '13.3.4 什么时候系统该从“RAG”升级到“Agent”？', link: '/llm/ch13-llm-rag-and-agent-relationship/m03-division-of-labor-in-real-systems/q04-when-to-upgrade-to-agent' },
                  ]
                },
              ]
            },
            {
              text: '第 14 章 LLM 常见误区与面试高频问题',
              collapsed: true,
              items: [
                { text: '概览', link: '/llm/ch14-misconceptions-and-interview-high-frequency/' },
                {
                  text: '14.1 常见误区',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m01-common-misconceptions/' },
                    { text: '14.1.1 LLM 只是“更大的 NLP 模型”吗？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m01-common-misconceptions/q01-llm-just-bigger-nlp' },
                    { text: '14.1.2 参数越大就一定越强吗？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m01-common-misconceptions/q02-bigger-params-always-better' },
                    { text: '14.1.3 Prompt 写得好是不是就能解决大部分问题？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m01-common-misconceptions/q03-prompt-solves-most-problems' },
                    { text: '14.1.4 为什么“知道概念”不等于“理解系统”？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m01-common-misconceptions/q04-knowing-concepts-not-equal-system-thinking' },
                    { text: '14.1.5 为什么很多 LLM 问题最后都要回到数据、对齐、推理和系统设计？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m01-common-misconceptions/q05-back-to-data-alignment-inference-system' },
                  ]
                },
                {
                  text: '14.2 面试表达与方法论',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m02-interview-expression-and-methodology/' },
                    { text: '14.2.1 面试中讲 LLM，为什么不能只背 Transformer？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m02-interview-expression-and-methodology/q01-why-not-just-reciting-transformer' },
                    { text: '14.2.2 怎么把 LLM 问题讲出层次感和工程感？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m02-interview-expression-and-methodology/q02-how-to-answer-with-depth-and-engineering' },
                    { text: '14.2.3 回答 LLM 面试题时，如何兼顾原理、工程和业务视角？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m02-interview-expression-and-methodology/q03-how-to-balance-principles-engineering-business' },
                    { text: '14.2.4 如何建立一套稳定的 LLM 面试作答框架？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m02-interview-expression-and-methodology/q04-how-to-build-stable-answer-framework' },
                  ]
                },
              ]
            },
          ]
        }
      ],
      '/rag/': [
            {
              text: 'RAG',
              collapsed: false,
              items: [
                { text: '概览', link: '/rag/' },
                {
                  text: '第 1 章 RAG 全景图与核心认知',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/rag/ch01-rag-overview/' },
                    {
                      text: '1.1 RAG 的定义与定位',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch01-rag-overview/m01-definition-and-positioning/' },
                        { text: '1.1.1 RAG 是什么？', link: '/rag/ch01-rag-overview/m01-definition-and-positioning/q01-rag' },
                        { text: '1.1.2 RAG 和传统搜索、微调分别是什么关系？', link: '/rag/ch01-rag-overview/m01-definition-and-positioning/q02-rag' },
                        { text: '1.1.3 为什么大模型应用里经常需要 RAG？', link: '/rag/ch01-rag-overview/m01-definition-and-positioning/q03-rag' },
                        { text: '1.1.4 哪些场景适合用 RAG，哪些场景不适合？', link: '/rag/ch01-rag-overview/m01-definition-and-positioning/q04-rag' },
                        { text: '1.1.5 RAG、知识库问答、搜索、Agent 的边界分别是什么？', link: '/rag/ch01-rag-overview/m01-definition-and-positioning/q05-rag-agent' }
                      ]
                    },
                    {
                      text: '1.2 RAG 系统的基本组成',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch01-rag-overview/m02-system-components/' },
                        { text: '1.2.1 一个最小可用的 RAG 系统由哪些部分组成？', link: '/rag/ch01-rag-overview/m02-system-components/q01-rag' },
                        { text: '1.2.2 一个生产级 RAG 系统相比 Demo 多了哪些能力？', link: '/rag/ch01-rag-overview/m02-system-components/q02-rag-demo' },
                        { text: '1.2.3 RAG 的完整工作流程是什么？', link: '/rag/ch01-rag-overview/m02-system-components/q03-rag' },
                        { text: '1.2.4 从用户提问到模型回答，中间数据流是怎么走的？', link: '/rag/ch01-rag-overview/m02-system-components/q04-item' }
                      ]
                    },
                    {
                      text: '1.3 对 RAG 的常见误解',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch01-rag-overview/m03-common-misconceptions/' },
                        { text: '1.3.1 为什么不能把 RAG 简单理解成“检索 + Prompt”？', link: '/rag/ch01-rag-overview/m03-common-misconceptions/q01-rag-prompt' },
                        { text: '1.3.2 为什么“检索到了”不等于“回答就会好”？', link: '/rag/ch01-rag-overview/m03-common-misconceptions/q02-item' },
                        { text: '1.3.3 为什么很多 RAG Demo 能跑，但很难稳定上线？', link: '/rag/ch01-rag-overview/m03-common-misconceptions/q03-rag-demo' },
                        { text: '1.3.4 为什么 RAG 的问题往往不只出在模型本身？', link: '/rag/ch01-rag-overview/m03-common-misconceptions/q04-rag' }
                      ]
                    }
                  ]
                },
                {
                  text: '第 2 章 数据接入与知识库准备',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/rag/ch02-data-and-knowledge-base/' },
                    {
                      text: '2.1 为什么 RAG 首先是数据问题',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch02-data-and-knowledge-base/m01-data-first/' },
                        { text: '2.1.1 做 RAG 之前，为什么要先处理数据而不是直接喂给模型？', link: '/rag/ch02-data-and-knowledge-base/m01-data-first/q01-rag' },
                        { text: '2.1.2 为什么知识质量往往比模型参数更影响 RAG 效果？', link: '/rag/ch02-data-and-knowledge-base/m01-data-first/q02-rag' },
                        { text: '2.1.3 为什么“有资料”不等于“资料可被有效检索和使用”？', link: '/rag/ch02-data-and-knowledge-base/m01-data-first/q03-item' }
                      ]
                    },
                    {
                      text: '2.2 数据源类型与接入方式',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch02-data-and-knowledge-base/m02-data-sources/' },
                        { text: '2.2.1 RAG 可以接哪些数据源？', link: '/rag/ch02-data-and-knowledge-base/m02-data-sources/q01-rag' },
                        { text: '2.2.2 文档、网页、数据库、代码库有什么区别？', link: '/rag/ch02-data-and-knowledge-base/m02-data-sources/q02-item' },
                        { text: '2.2.3 结构化数据和非结构化数据在 RAG 里分别怎么处理？', link: '/rag/ch02-data-and-knowledge-base/m02-data-sources/q03-rag' },
                        { text: '2.2.4 图片、表格、图表、PDF 等复杂格式为什么更难处理？', link: '/rag/ch02-data-and-knowledge-base/m02-data-sources/q04-pdf' }
                      ]
                    },
                    {
                      text: '2.3 知识库数据清洗与标准化',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch02-data-and-knowledge-base/m03-cleaning-and-standardization/' },
                        { text: '2.3.1 知识库数据清洗通常要做什么？', link: '/rag/ch02-data-and-knowledge-base/m03-cleaning-and-standardization/q01-item' },
                        { text: '2.3.2 为什么页眉页脚、导航栏、模板噪声会影响 RAG 效果？', link: '/rag/ch02-data-and-knowledge-base/m03-cleaning-and-standardization/q02-rag' },
                        { text: '2.3.3 为什么去重、去噪、字段标准化很重要？', link: '/rag/ch02-data-and-knowledge-base/m03-cleaning-and-standardization/q03-item' },
                        { text: '2.3.4 什么样的数据不应该直接进入知识库？', link: '/rag/ch02-data-and-knowledge-base/m03-cleaning-and-standardization/q04-item' }
                      ]
                    },
                    {
                      text: '2.4 权限、时效性与知识治理',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch02-data-and-knowledge-base/m04-governance/' },
                        { text: '2.4.1 为什么知识库不只是“存内容”，还要管理权限和时效性？', link: '/rag/ch02-data-and-knowledge-base/m04-governance/q01-item' },
                        { text: '2.4.2 企业场景里，为什么权限控制不能只靠前端限制？', link: '/rag/ch02-data-and-knowledge-base/m04-governance/q02-item' },
                        { text: '2.4.3 知识库有时效性时，如何做更新与失效管理？', link: '/rag/ch02-data-and-knowledge-base/m04-governance/q03-item' },
                        { text: '2.4.4 多租户 RAG 一般怎么做隔离？', link: '/rag/ch02-data-and-knowledge-base/m04-governance/q04-rag' }
                      ]
                    }
                  ]
                },
                {
                  text: '第 3 章 Chunk、Metadata 与索引前设计',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/rag/ch03-chunk-metadata-and-pre-index-design/' },
                    {
                      text: '3.1 为什么文档必须切块',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m01-why-chunking/' },
                        { text: '3.1.1 什么是 Chunk？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m01-why-chunking/q01-chunk' },
                        { text: '3.1.2 为什么文档必须切块？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m01-why-chunking/q02-item' },
                        { text: '3.1.3 为什么不能直接按整篇文档做检索和生成？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m01-why-chunking/q03-item' }
                      ]
                    },
                    {
                      text: '3.2 Chunk 的切分策略',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m02-chunking-strategies/' },
                        { text: '3.2.1 Chunk 应该切多大？为什么没有统一答案？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m02-chunking-strategies/q01-chunk' },
                        { text: '3.2.2 Chunk overlap 有什么作用？是不是越大越好？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m02-chunking-strategies/q02-chunk-overlap' },
                        { text: '3.2.3 按固定长度切块、按语义切块、按结构切块分别适合什么场景？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m02-chunking-strategies/q03-item' },
                        { text: '3.2.4 长文档、FAQ、表格、代码文档的切块策略有什么不同？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m02-chunking-strategies/q04-faq' }
                      ]
                    },
                    {
                      text: '3.3 Metadata 设计',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m03-metadata-design/' },
                        { text: '3.3.1 什么是元数据（Metadata）？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m03-metadata-design/q01-metadata' },
                        { text: '3.3.2 为什么 Metadata 对 RAG 很重要？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m03-metadata-design/q02-metadata-rag' },
                        { text: '3.3.3 常见的 Metadata 有哪些？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m03-metadata-design/q03-metadata' },
                        { text: '3.3.4 Metadata Filter 在检索阶段怎么用？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m03-metadata-design/q04-metadata-filter' },
                        { text: '3.3.5 为什么很多企业 RAG 效果差，本质上是 Metadata 设计不完整？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m03-metadata-design/q05-rag-metadata' }
                      ]
                    },
                    {
                      text: '3.4 检索用块与生成用块',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m04-retrieval-vs-generation-chunks/' },
                        { text: '3.4.1 为什么生产 RAG 经常要把“检索用块”和“生成用块”分开？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m04-retrieval-vs-generation-chunks/q01-rag' },
                        { text: '3.4.2 为什么有时小块更适合召回，但大块更适合生成？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m04-retrieval-vs-generation-chunks/q02-item' },
                        { text: '3.4.3 什么时候应该按文档级检索，什么时候按 Chunk 级检索？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m04-retrieval-vs-generation-chunks/q03-chunk' }
                      ]
                    }
                  ]
                },
                {
                  text: '第 4 章 索引构建与知识库更新',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/rag/ch04-indexing-and-updates/' },
                    {
                      text: '4.1 索引是什么，索引在做什么',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch04-indexing-and-updates/m01-what-indexing-does/' },
                        { text: '4.1.1 向量数据库到底存了什么？', link: '/rag/ch04-indexing-and-updates/m01-what-indexing-does/q01-item' },
                        { text: '4.1.2 索引为什么不是“把文本存进去”这么简单？', link: '/rag/ch04-indexing-and-updates/m01-what-indexing-does/q02-item' },
                        { text: '4.1.3 文本、向量、关键词索引、元数据之间是什么关系？', link: '/rag/ch04-indexing-and-updates/m01-what-indexing-does/q03-item' }
                      ]
                    },
                    {
                      text: '4.2 索引构建的基本思路',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch04-indexing-and-updates/m02-indexing-basics/' },
                        { text: '4.2.1 为什么做完清洗和切块后，才能进入索引阶段？', link: '/rag/ch04-indexing-and-updates/m02-indexing-basics/q01-item' },
                        { text: '4.2.2 为什么索引质量会直接决定后续召回质量？', link: '/rag/ch04-indexing-and-updates/m02-indexing-basics/q02-item' },
                        { text: '4.2.3 为什么索引阶段的设计失误很难在 Prompt 层补回来？', link: '/rag/ch04-indexing-and-updates/m02-indexing-basics/q03-prompt' }
                      ]
                    },
                    {
                      text: '4.3 知识库更新与索引维护',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch04-indexing-and-updates/m03-index-maintenance/' },
                        { text: '4.3.1 知识库更新后，索引为什么不能只靠全量重建？', link: '/rag/ch04-indexing-and-updates/m03-index-maintenance/q01-item' },
                        { text: '4.3.2 全量重建在生产环境里会带来什么问题？', link: '/rag/ch04-indexing-and-updates/m03-index-maintenance/q02-item' },
                        { text: '4.3.3 增量更新索引通常怎么做？', link: '/rag/ch04-indexing-and-updates/m03-index-maintenance/q03-item' },
                        { text: '4.3.4 新增、修改、删除数据分别怎么同步到索引？', link: '/rag/ch04-indexing-and-updates/m03-index-maintenance/q04-item' },
                        { text: '4.3.5 如何避免旧 Chunk 残留、重复索引和脏数据？', link: '/rag/ch04-indexing-and-updates/m03-index-maintenance/q05-chunk' },
                        { text: '4.3.6 如何做版本管理、回滚和失效控制？', link: '/rag/ch04-indexing-and-updates/m03-index-maintenance/q06-item' }
                      ]
                    }
                  ]
                },
                {
                  text: '第 5 章 Embedding、BM25 与混合检索',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/' },
                    {
                      text: '5.1 Embedding 的作用与原理',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m01-embedding/' },
                        { text: '5.1.1 什么是 Embedding？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m01-embedding/q01-embedding' },
                        { text: '5.1.2 Embedding 在 RAG 里到底负责什么？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m01-embedding/q02-embedding-rag' },
                        { text: '5.1.3 为什么 Embedding 能支持语义检索？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m01-embedding/q03-embedding' },
                        { text: '5.1.4 Embedding 模型应该怎么选？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m01-embedding/q04-embedding' }
                      ]
                    },
                    {
                      text: '5.2 向量检索的工作方式',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m02-vector-retrieval/' },
                        { text: '5.2.1 向量检索是怎么找到相似内容的？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m02-vector-retrieval/q01-item' },
                        { text: '5.2.2 Top K 应该怎么设？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m02-vector-retrieval/q02-top-k' },
                        { text: '5.2.3 相似度分数能不能直接当“正确率”看？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m02-vector-retrieval/q03-item' },
                        { text: '5.2.4 为什么只做向量检索通常不够？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m02-vector-retrieval/q04-item' }
                      ]
                    },
                    {
                      text: '5.3 稀疏检索与 BM25',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m03-bm25/' },
                        { text: '5.3.1 BM25 是什么？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m03-bm25/q01-bm25' },
                        { text: '5.3.2 BM25 和向量检索分别擅长解决什么问题？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m03-bm25/q02-bm25' },
                        { text: '5.3.3 为什么关键词匹配在很多场景下仍然很重要？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m03-bm25/q03-item' },
                        { text: '5.3.4 什么类型的问题更适合用 BM25？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m03-bm25/q04-bm25' }
                      ]
                    },
                    {
                      text: '5.4 混合检索与多路召回',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m04-hybrid-and-multi-retrieval/' },
                        { text: '5.4.1 什么是混合检索？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m04-hybrid-and-multi-retrieval/q01-item' },
                        { text: '5.4.2 为什么很多生产系统都用混合检索？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m04-hybrid-and-multi-retrieval/q02-item' },
                        { text: '5.4.3 为什么混合检索通常比单路检索更稳？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m04-hybrid-and-multi-retrieval/q03-item' },
                        { text: '5.4.4 什么是多路召回（Multi-Retrieval）？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m04-hybrid-and-multi-retrieval/q04-multi-retrieval' },
                        { text: '5.4.5 为什么单一路径召回经常不稳定？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m04-hybrid-and-multi-retrieval/q05-item' }
                      ]
                    }
                  ]
                },
                {
                  text: '第 6 章 查询理解与检索链路设计',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/' },
                    {
                      text: '6.1 为什么用户问题不能直接拿去检索',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m01-query-understanding/' },
                        { text: '6.1.1 用户问题进入 RAG 后，第一步为什么往往不是直接检索？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m01-query-understanding/q01-rag' },
                        { text: '6.1.2 为什么原始提问经常不适合作为最终检索词？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m01-query-understanding/q02-item' },
                        { text: '6.1.3 查询理解在 RAG 里的作用是什么？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m01-query-understanding/q03-rag' }
                      ]
                    },
                    {
                      text: '6.2 Query Rewrite 与 Query Expansion',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m02-rewrite-and-expansion/' },
                        { text: '6.2.1 什么是 Query Rewrite？什么时候要改写用户问题？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m02-rewrite-and-expansion/q01-query-rewrite' },
                        { text: '6.2.2 什么是 Query Expansion？什么时候要扩写查询？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m02-rewrite-and-expansion/q02-query-expansion' },
                        { text: '6.2.3 多轮对话场景下，RAG 为什么要先做问题重写？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m02-rewrite-and-expansion/q03-rag' },
                        { text: '6.2.4 为什么对话历史如果处理不好，会直接污染检索？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m02-rewrite-and-expansion/q04-item' }
                      ]
                    },
                    {
                      text: '6.3 检索阶段的筛选与路由',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m03-filtering-and-routing/' },
                        { text: '6.3.1 Metadata Filter 在检索阶段怎么用？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m03-filtering-and-routing/q01-metadata-filter' },
                        { text: '6.3.2 什么时候应该按文档级检索，什么时候按 Chunk 级检索？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m03-filtering-and-routing/q02-chunk' },
                        { text: '6.3.3 什么是路由检索（Router Retrieval）？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m03-filtering-and-routing/q03-router-retrieval' },
                        { text: '6.3.4 为什么不同问题类型应该走不同检索策略？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m03-filtering-and-routing/q04-item' }
                      ]
                    },
                    {
                      text: '6.4 大文档与复杂知识场景',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m04-large-and-complex-documents/' },
                        { text: '6.4.1 为什么大文档场景下，分层检索通常比直接 top-k chunk 更稳？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m04-large-and-complex-documents/q01-top-k-chunk' },
                        { text: '6.4.2 什么是分层检索（Hierarchical Retrieval）？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m04-large-and-complex-documents/q02-hierarchical-retrieval' },
                        { text: '6.4.3 什么是递归检索（Recursive Retrieval）？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m04-large-and-complex-documents/q03-recursive-retrieval' },
                        { text: '6.4.4 长文档、多文档、跨文档问题分别有什么不同？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m04-large-and-complex-documents/q04-item' }
                      ]
                    }
                  ]
                },
                {
                  text: '第 7 章 重排、排序与结果精选',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/rag/ch07-reranking-and-result-selection/' },
                    {
                      text: '7.1 为什么召回到了内容，模型还是答不好',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch07-reranking-and-result-selection/m01-why-retrieval-is-not-enough/' },
                        { text: '7.1.1 为什么召回到了内容，模型还是答不好？', link: '/rag/ch07-reranking-and-result-selection/m01-why-retrieval-is-not-enough/q01-item' },
                        { text: '7.1.2 为什么“能找到”和“排在前面”是两回事？', link: '/rag/ch07-reranking-and-result-selection/m01-why-retrieval-is-not-enough/q02-item' },
                        { text: '7.1.3 为什么“召回”与“排序”要拆开看？', link: '/rag/ch07-reranking-and-result-selection/m01-why-retrieval-is-not-enough/q03-item' }
                      ]
                    },
                    {
                      text: '7.2 Rerank 的作用与价值',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch07-reranking-and-result-selection/m02-rerank/' },
                        { text: '7.2.1 什么是重排（Rerank）？', link: '/rag/ch07-reranking-and-result-selection/m02-rerank/q01-rerank' },
                        { text: '7.2.2 它和初次召回有什么区别？', link: '/rag/ch07-reranking-and-result-selection/m02-rerank/q02-item' },
                        { text: '7.2.3 什么时候值得加 Reranker？', link: '/rag/ch07-reranking-and-result-selection/m02-rerank/q03-reranker' },
                        { text: '7.2.4 Reranker 更偏向优化召回率还是准确率？', link: '/rag/ch07-reranking-and-result-selection/m02-rerank/q04-reranker' }
                      ]
                    },
                    {
                      text: '7.3 检索结果的组织与精选',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch07-reranking-and-result-selection/m03-result-selection/' },
                        { text: '7.3.1 Top K 召回后，最终应该送几个结果给模型？', link: '/rag/ch07-reranking-and-result-selection/m03-result-selection/q01-top-k' },
                        { text: '7.3.2 为什么高分结果之间也要去重和聚合？', link: '/rag/ch07-reranking-and-result-selection/m03-result-selection/q02-item' },
                        { text: '7.3.3 文档级合并、Chunk 级合并、相邻块扩展分别适合什么情况？', link: '/rag/ch07-reranking-and-result-selection/m03-result-selection/q03-chunk' },
                        { text: '7.3.4 为什么排序策略会直接影响生成质量？', link: '/rag/ch07-reranking-and-result-selection/m03-result-selection/q04-item' }
                      ]
                    }
                  ]
                },
                {
                  text: '第 8 章 上下文构造与答案生成',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/rag/ch08-context-construction-and-generation/' },
                    {
                      text: '8.1 为什么检索结果不能原样全塞给模型',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch08-context-construction-and-generation/m01-context-construction/' },
                        { text: '8.1.1 检索结果为什么不能原样全塞给模型？', link: '/rag/ch08-context-construction-and-generation/m01-context-construction/q01-item' },
                        { text: '8.1.2 RAG 的上下文构造到底在做什么？', link: '/rag/ch08-context-construction-and-generation/m01-context-construction/q02-rag' },
                        { text: '8.1.3 为什么上下文里要去重、排序和压缩？', link: '/rag/ch08-context-construction-and-generation/m01-context-construction/q03-item' },
                        { text: '8.1.4 什么时候应该“少给”，而不是“多给”？', link: '/rag/ch08-context-construction-and-generation/m01-context-construction/q04-item' }
                      ]
                    },
                    {
                      text: '8.2 不同任务的上下文组织方式',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch08-context-construction-and-generation/m02-task-specific-context/' },
                        { text: '8.2.1 检索式问答、总结式问答、对比式问答的上下文组织为什么不能一样？', link: '/rag/ch08-context-construction-and-generation/m02-task-specific-context/q01-item' },
                        { text: '8.2.2 长文档、多文档、跨文档问题的上下文应该怎么拼？', link: '/rag/ch08-context-construction-and-generation/m02-task-specific-context/q02-item' },
                        { text: '8.2.3 为什么上下文顺序会显著影响回答质量？', link: '/rag/ch08-context-construction-and-generation/m02-task-specific-context/q03-item' }
                      ]
                    },
                    {
                      text: '8.3 长上下文问题',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch08-context-construction-and-generation/m03-long-context/' },
                        { text: '8.3.1 什么是“lost in the middle”？', link: '/rag/ch08-context-construction-and-generation/m03-long-context/q01-lost-in-the-middle' },
                        { text: '8.3.2 它为什么会影响 RAG 效果？', link: '/rag/ch08-context-construction-and-generation/m03-long-context/q02-rag' },
                        { text: '8.3.3 怎样通过排序、摘要、压缩、结构化拼接减轻这个问题？', link: '/rag/ch08-context-construction-and-generation/m03-long-context/q03-item' }
                      ]
                    },
                    {
                      text: '8.4 RAG Prompt 设计',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch08-context-construction-and-generation/m04-rag-prompting/' },
                        { text: '8.4.1 RAG Prompt 应该怎么写，才能减少模型乱答？', link: '/rag/ch08-context-construction-and-generation/m04-rag-prompting/q01-rag-prompt' },
                        { text: '8.4.2 为什么很多 RAG 系统要求模型“只基于提供材料作答”？', link: '/rag/ch08-context-construction-and-generation/m04-rag-prompting/q02-rag' },
                        { text: '8.4.3 什么时候应该要求模型引用来源？', link: '/rag/ch08-context-construction-and-generation/m04-rag-prompting/q03-item' },
                        { text: '8.4.4 RAG 回答里如何处理“资料不足”的情况？', link: '/rag/ch08-context-construction-and-generation/m04-rag-prompting/q04-rag' }
                      ]
                    },
                    {
                      text: '8.5 生成阶段常见错误',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch08-context-construction-and-generation/m05-generation-errors/' },
                        { text: '8.5.1 RAG 生成阶段最常见的错误有哪些？', link: '/rag/ch08-context-construction-and-generation/m05-generation-errors/q01-rag' },
                        { text: '8.5.2 为什么有材料，模型仍可能答非所问？', link: '/rag/ch08-context-construction-and-generation/m05-generation-errors/q02-item' },
                        { text: '8.5.3 为什么“引用了来源”也不一定代表回答忠实？', link: '/rag/ch08-context-construction-and-generation/m05-generation-errors/q03-item' }
                      ]
                    }
                  ]
                },
                {
                  text: '第 9 章 RAG 评测体系与错误归因',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/rag/ch09-evaluation-and-error-analysis/' },
                    {
                      text: '9.1 为什么不能只看最终回答',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch09-evaluation-and-error-analysis/m01-end-to-end-is-not-enough/' },
                        { text: '9.1.1 为什么不能只看最终回答，必须拆开评测 RAG？', link: '/rag/ch09-evaluation-and-error-analysis/m01-end-to-end-is-not-enough/q01-rag' },
                        { text: '9.1.2 RAG 评测为什么通常分检索层、生成层、端到端层？', link: '/rag/ch09-evaluation-and-error-analysis/m01-end-to-end-is-not-enough/q02-rag' },
                        { text: '9.1.3 为什么一个端到端分数无法告诉你系统真正的问题在哪？', link: '/rag/ch09-evaluation-and-error-analysis/m01-end-to-end-is-not-enough/q03-item' }
                      ]
                    },
                    {
                      text: '9.2 检索层评测',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch09-evaluation-and-error-analysis/m02-retrieval-evaluation/' },
                        { text: '9.2.1 Recall@K、Precision@K、MRR、nDCG 分别在看什么？', link: '/rag/ch09-evaluation-and-error-analysis/m02-retrieval-evaluation/q01-recall-k-precision-k-mrr-ndcg' },
                        { text: '9.2.2 怎么评估检索结果到底好不好？', link: '/rag/ch09-evaluation-and-error-analysis/m02-retrieval-evaluation/q02-item' },
                        { text: '9.2.3 召回率高为什么不代表用户体验一定好？', link: '/rag/ch09-evaluation-and-error-analysis/m02-retrieval-evaluation/q03-item' },
                        { text: '9.2.4 准确率高为什么有时又意味着覆盖不足？', link: '/rag/ch09-evaluation-and-error-analysis/m02-retrieval-evaluation/q04-item' }
                      ]
                    },
                    {
                      text: '9.3 生成层与忠实性评测',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch09-evaluation-and-error-analysis/m03-generation-evaluation/' },
                        { text: '9.3.1 怎么评估回答是否忠于检索内容？', link: '/rag/ch09-evaluation-and-error-analysis/m03-generation-evaluation/q01-item' },
                        { text: '9.3.2 什么是 Groundedness / Faithfulness？', link: '/rag/ch09-evaluation-and-error-analysis/m03-generation-evaluation/q02-groundedness-faithfulness' },
                        { text: '9.3.3 怎么判断 RAG 有没有幻觉？', link: '/rag/ch09-evaluation-and-error-analysis/m03-generation-evaluation/q03-rag' },
                        { text: '9.3.4 什么是 LLM-as-a-Judge？什么时候适合用？', link: '/rag/ch09-evaluation-and-error-analysis/m03-generation-evaluation/q04-llm-as-a-judge' }
                      ]
                    },
                    {
                      text: '9.4 评测集构建',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch09-evaluation-and-error-analysis/m04-eval-dataset/' },
                        { text: '9.4.1 RAG 评测集应该怎么构建？', link: '/rag/ch09-evaluation-and-error-analysis/m04-eval-dataset/q01-rag' },
                        { text: '9.4.2 为什么评测问题必须覆盖不同任务类型？', link: '/rag/ch09-evaluation-and-error-analysis/m04-eval-dataset/q02-item' },
                        { text: '9.4.3 为什么线上真实问题和离线样本经常差很多？', link: '/rag/ch09-evaluation-and-error-analysis/m04-eval-dataset/q03-item' }
                      ]
                    },
                    {
                      text: '9.5 错误分型与归因',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch09-evaluation-and-error-analysis/m05-error-taxonomy/' },
                        { text: '9.5.1 一个 RAG 错误，怎么判断到底是“没召回到”还是“召回到了没用好”？', link: '/rag/ch09-evaluation-and-error-analysis/m05-error-taxonomy/q01-rag' },
                        { text: '9.5.2 RAG 常见错误类型有哪些？', link: '/rag/ch09-evaluation-and-error-analysis/m05-error-taxonomy/q02-rag' },
                        { text: '9.5.3 如何建立问题分类和误差归因机制？', link: '/rag/ch09-evaluation-and-error-analysis/m05-error-taxonomy/q03-item' },
                        { text: '9.5.4 为什么 RAG 调优必须建立错误分桶，而不能靠随机试参？', link: '/rag/ch09-evaluation-and-error-analysis/m05-error-taxonomy/q04-rag' }
                      ]
                    }
                  ]
                },
                {
                  text: '第 10 章 RAG 调优方法论',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/rag/ch10-optimization-methodology/' },
                    {
                      text: '10.1 效果不好时先查哪里',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch10-optimization-methodology/m01-where-to-debug-first/' },
                        { text: '10.1.1 RAG 效果不好时，应该先查检索还是先查 Prompt？', link: '/rag/ch10-optimization-methodology/m01-where-to-debug-first/q01-rag-prompt' },
                        { text: '10.1.2 为什么很多问题表面看是模型问题，本质上却是数据或检索问题？', link: '/rag/ch10-optimization-methodology/m01-where-to-debug-first/q02-item' },
                        { text: '10.1.3 什么情况下应该先动 Chunk，什么情况下应该先动 Rerank，什么情况下该动 Prompt？', link: '/rag/ch10-optimization-methodology/m01-where-to-debug-first/q03-chunk-rerank-prompt' }
                      ]
                    },
                    {
                      text: '10.2 召回率、准确率与成本的平衡',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch10-optimization-methodology/m02-balance-quality-cost/' },
                        { text: '10.2.1 如何优化召回率，如何优化准确率，它们为什么经常冲突？', link: '/rag/ch10-optimization-methodology/m02-balance-quality-cost/q01-item' },
                        { text: '10.2.2 TopK、Rerank、上下文长度之间如何平衡？', link: '/rag/ch10-optimization-methodology/m02-balance-quality-cost/q02-top-k-rerank' },
                        { text: '10.2.3 如何平衡效果、延迟和成本？', link: '/rag/ch10-optimization-methodology/m02-balance-quality-cost/q03-item' }
                      ]
                    },
                    {
                      text: '10.3 常见优化抓手',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch10-optimization-methodology/m03-common-optimization-levers/' },
                        { text: '10.3.1 Chunk 策略不合理会带来哪些典型问题？', link: '/rag/ch10-optimization-methodology/m03-common-optimization-levers/q01-chunk' },
                        { text: '10.3.2 为什么混合检索通常比单路检索更稳？', link: '/rag/ch10-optimization-methodology/m03-common-optimization-levers/q02-item' },
                        { text: '10.3.3 什么时候值得加 Reranker？', link: '/rag/ch10-optimization-methodology/m03-common-optimization-levers/q03-reranker' },
                        { text: '10.3.4 上下文太长时，有哪些常见压缩方法？', link: '/rag/ch10-optimization-methodology/m03-common-optimization-levers/q04-item' },
                        { text: '10.3.5 长文档、多文档、跨文档问题分别怎么优化？', link: '/rag/ch10-optimization-methodology/m03-common-optimization-levers/q05-item' }
                      ]
                    },
                    {
                      text: '10.4 建立系统化调优闭环',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch10-optimization-methodology/m04-optimization-loop/' },
                        { text: '10.4.1 为什么 RAG 调优必须建立问题分类和误差归因机制？', link: '/rag/ch10-optimization-methodology/m04-optimization-loop/q01-rag' },
                        { text: '10.4.2 为什么没有评测闭环的优化很容易“局部提升、整体退化”？', link: '/rag/ch10-optimization-methodology/m04-optimization-loop/q02-item' },
                        { text: '10.4.3 如何通过实验设计验证某个优化是否真的有效？', link: '/rag/ch10-optimization-methodology/m04-optimization-loop/q03-item' }
                      ]
                    }
                  ]
                },
                {
                  text: '第 11 章 生产级 RAG 工程实践',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/rag/ch11-production-engineering/' },
                    {
                      text: '11.1 一个能上线的 RAG 系统还需要什么',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch11-production-engineering/m01-production-capabilities/' },
                        { text: '11.1.1 一个能上线的 RAG 系统除了主链路，还需要哪些工程能力？', link: '/rag/ch11-production-engineering/m01-production-capabilities/q01-rag' },
                        { text: '11.1.2 为什么很多企业场景仍然会保留传统搜索入口？', link: '/rag/ch11-production-engineering/m01-production-capabilities/q02-item' },
                        { text: '11.1.3 什么时候应该只返回检索结果，不做生成？', link: '/rag/ch11-production-engineering/m01-production-capabilities/q03-item' }
                      ]
                    },
                    {
                      text: '11.2 性能、缓存与高并发',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch11-production-engineering/m02-performance-and-caching/' },
                        { text: '11.2.1 RAG 为什么需要缓存？', link: '/rag/ch11-production-engineering/m02-performance-and-caching/q01-rag' },
                        { text: '11.2.2 哪些环节适合做缓存？', link: '/rag/ch11-production-engineering/m02-performance-and-caching/q02-item' },
                        { text: '11.2.3 如何处理高并发下的检索和生成延迟问题？', link: '/rag/ch11-production-engineering/m02-performance-and-caching/q03-item' },
                        { text: '11.2.4 如何设计检索、重排、生成链路的降级策略？', link: '/rag/ch11-production-engineering/m02-performance-and-caching/q04-item' }
                      ]
                    },
                    {
                      text: '11.3 日志、观测与故障排查',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch11-production-engineering/m03-observability/' },
                        { text: '11.3.1 如何做 RAG 的日志、观测和故障排查？', link: '/rag/ch11-production-engineering/m03-observability/q01-rag' },
                        { text: '11.3.2 线上 RAG 系统应该监控哪些指标？', link: '/rag/ch11-production-engineering/m03-observability/q02-rag' },
                        { text: '11.3.3 一次失败回答上线后，应该如何快速定位问题出在哪一层？', link: '/rag/ch11-production-engineering/m03-observability/q03-item' }
                      ]
                    },
                    {
                      text: '11.4 发布、灰度与风险控制',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch11-production-engineering/m04-release-and-risk-control/' },
                        { text: '11.4.1 RAG 检索策略升级时如何做灰度发布？', link: '/rag/ch11-production-engineering/m04-release-and-risk-control/q01-rag' },
                        { text: '11.4.2 模型、Prompt、索引升级时如何做回滚？', link: '/rag/ch11-production-engineering/m04-release-and-risk-control/q02-prompt' },
                        { text: '11.4.3 企业落地 RAG 时最常见的风险是什么？', link: '/rag/ch11-production-engineering/m04-release-and-risk-control/q03-rag' },
                        { text: '11.4.4 冷启动阶段没有日志、没有评测集时，系统该如何起步？', link: '/rag/ch11-production-engineering/m04-release-and-risk-control/q04-item' }
                      ]
                    }
                  ]
                },
                {
                  text: '第 12 章 高级 RAG 形态与升级路径',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/rag/ch12-advanced-rag-and-upgrades/' },
                    {
                      text: '12.1 为了解决“检索不稳”',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch12-advanced-rag-and-upgrades/m01-unstable-retrieval/' },
                        { text: '12.1.1 什么是多路召回（Multi-Retrieval）？', link: '/rag/ch12-advanced-rag-and-upgrades/m01-unstable-retrieval/q01-multi-retrieval' },
                        { text: '12.1.2 什么是路由检索（Router Retrieval）？', link: '/rag/ch12-advanced-rag-and-upgrades/m01-unstable-retrieval/q02-router-retrieval' },
                        { text: '12.1.3 为什么复杂问题常常不适合只走一条召回链路？', link: '/rag/ch12-advanced-rag-and-upgrades/m01-unstable-retrieval/q03-item' }
                      ]
                    },
                    {
                      text: '12.2 为了解决“大文档与复杂结构”',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch12-advanced-rag-and-upgrades/m02-large-docs-and-structure/' },
                        { text: '12.2.1 什么是分层检索（Hierarchical Retrieval）？', link: '/rag/ch12-advanced-rag-and-upgrades/m02-large-docs-and-structure/q01-hierarchical-retrieval' },
                        { text: '12.2.2 什么是递归检索（Recursive Retrieval）？', link: '/rag/ch12-advanced-rag-and-upgrades/m02-large-docs-and-structure/q02-recursive-retrieval' },
                        { text: '12.2.3 为什么复杂文档结构下，简单 top-k chunk 容易失效？', link: '/rag/ch12-advanced-rag-and-upgrades/m02-large-docs-and-structure/q03-top-k-chunk' }
                      ]
                    },
                    {
                      text: '12.3 为了解决“检索质量不稳定”',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch12-advanced-rag-and-upgrades/m03-retrieval-quality/' },
                        { text: '12.3.1 什么是纠错型 RAG（Corrective RAG / CRAG）？', link: '/rag/ch12-advanced-rag-and-upgrades/m03-retrieval-quality/q01-rag-corrective-rag-crag' },
                        { text: '12.3.2 什么是 Self-RAG？', link: '/rag/ch12-advanced-rag-and-upgrades/m03-retrieval-quality/q02-self-rag' },
                        { text: '12.3.3 Self-RAG 和普通 RAG 有什么区别？', link: '/rag/ch12-advanced-rag-and-upgrades/m03-retrieval-quality/q03-self-rag-rag' },
                        { text: '12.3.4 什么情况下值得引入“检索结果自检”机制？', link: '/rag/ch12-advanced-rag-and-upgrades/m03-retrieval-quality/q04-item' }
                      ]
                    },
                    {
                      text: '12.4 为了解决“任务不只是问答”',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch12-advanced-rag-and-upgrades/m04-task-beyond-qa/' },
                        { text: '12.4.1 Agent 和 RAG 应该怎么结合？', link: '/rag/ch12-advanced-rag-and-upgrades/m04-task-beyond-qa/q01-agent-rag' },
                        { text: '12.4.2 什么时候 RAG 应该升级为“Agentic Retrieval”？', link: '/rag/ch12-advanced-rag-and-upgrades/m04-task-beyond-qa/q02-rag-agentic-retrieval' },
                        { text: '12.4.3 什么时候问题已经不是“检索增强生成”，而是“任务规划 + 工具调用 + 检索”？', link: '/rag/ch12-advanced-rag-and-upgrades/m04-task-beyond-qa/q03-item' }
                      ]
                    },
                    {
                      text: '12.5 为了解决“数据形态更复杂”',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch12-advanced-rag-and-upgrades/m05-more-complex-data/' },
                        { text: '12.5.1 结构化数据和非结构化数据怎么一起做 RAG？', link: '/rag/ch12-advanced-rag-and-upgrades/m05-more-complex-data/q01-rag' },
                        { text: '12.5.2 多模态 RAG 和文本 RAG 的核心差别是什么？', link: '/rag/ch12-advanced-rag-and-upgrades/m05-more-complex-data/q02-rag-rag' },
                        { text: '12.5.3 图片、表格、图表、代码等内容进入 RAG 时，核心难点分别是什么？', link: '/rag/ch12-advanced-rag-and-upgrades/m05-more-complex-data/q03-rag' }
                      ]
                    }
                  ]
                },
                {
                  text: '第 13 章 从 0 到 1 搭一个最小可用 RAG',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/rag/ch13-build-a-minimum-viable-rag/' },
                    {
                      text: '13.1 最小 Demo 版 RAG',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch13-build-a-minimum-viable-rag/m01-minimum-demo/' },
                        { text: '13.1.1 从 0 搭一个最小 RAG 系统需要哪些步骤？', link: '/rag/ch13-build-a-minimum-viable-rag/m01-minimum-demo/q01-0-rag' },
                        { text: '13.1.2 文档清洗、切块、Embedding、入库、检索、生成分别怎么串起来？', link: '/rag/ch13-build-a-minimum-viable-rag/m01-minimum-demo/q02-embedding' },
                        { text: '13.1.3 一个最小 Demo 最应该先保证什么，而不是先优化什么？', link: '/rag/ch13-build-a-minimum-viable-rag/m01-minimum-demo/q03-demo' }
                      ]
                    },
                    {
                      text: '13.2 从 Demo 到生产的关键升级',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch13-build-a-minimum-viable-rag/m02-demo-to-production/' },
                        { text: '13.2.1 一个 Demo 版和生产版最大的差别是什么？', link: '/rag/ch13-build-a-minimum-viable-rag/m02-demo-to-production/q01-demo' },
                        { text: '13.2.2 第一次上线时，最值得优先补齐的 3~5 个能力是什么？', link: '/rag/ch13-build-a-minimum-viable-rag/m02-demo-to-production/q02-3-5' },
                        { text: '13.2.3 为什么很多团队卡在“Demo 很顺，落地很难”这一步？', link: '/rag/ch13-build-a-minimum-viable-rag/m02-demo-to-production/q03-demo' }
                      ]
                    },
                    {
                      text: '13.3 一个务实的落地顺序',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch13-build-a-minimum-viable-rag/m03-pragmatic-roadmap/' },
                        { text: '13.3.1 如果资源有限，RAG 应该优先做哪些能力？', link: '/rag/ch13-build-a-minimum-viable-rag/m03-pragmatic-roadmap/q01-rag' },
                        { text: '13.3.2 哪些优化适合早做，哪些优化适合后做？', link: '/rag/ch13-build-a-minimum-viable-rag/m03-pragmatic-roadmap/q02-item' },
                        { text: '13.3.3 一个务实的 RAG 演进路线应该是什么样？', link: '/rag/ch13-build-a-minimum-viable-rag/m03-pragmatic-roadmap/q03-rag' }
                      ]
                    }
                  ]
                },
                {
                  text: '第 14 章 常见误区与设计原则总结',
                  collapsed: true,
                  items: [
                    { text: '概览', link: '/rag/ch14-misconceptions-and-principles/' },
                    {
                      text: '14.1 常见误区',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/' },
                        { text: '14.1.1 RAG 不是把资料塞给模型就行，为什么？', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/q01-rag' },
                        { text: '14.1.2 Chunk 不是越小越好，也不是越大越好，为什么？', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/q02-chunk' },
                        { text: '14.1.3 TopK 不是越大越好，为什么？', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/q03-top-k' },
                        { text: '14.1.4 相似度高不等于答案就一定对，为什么？', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/q04-item' },
                        { text: '14.1.5 召回到了不等于模型就能答好，为什么？', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/q05-item' },
                        { text: '14.1.6 RAG 效果差时，为什么不能第一反应就怪模型？', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/q06-rag' },
                        { text: '14.1.7 为什么“有知识库”不等于“知识真的可用”？', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/q07-item' }
                      ]
                    },
                    {
                      text: '14.2 一套实用设计原则',
                      collapsed: true,
                      items: [
                        { text: '概览', link: '/rag/ch14-misconceptions-and-principles/m02-practical-principles/' },
                        { text: '14.2.1 做 RAG 时，为什么应该优先保证“可用、可控、可评测”，再追求“高级”？', link: '/rag/ch14-misconceptions-and-principles/m02-practical-principles/q01-rag' },
                        { text: '14.2.2 为什么 RAG 的核心不是某个单点技术，而是整条链路协同？', link: '/rag/ch14-misconceptions-and-principles/m02-practical-principles/q02-rag' },
                        { text: '14.2.3 一个成熟 RAG 系统最重要的设计原则有哪些？', link: '/rag/ch14-misconceptions-and-principles/m02-practical-principles/q03-rag' }
                      ]
                    }
                  ]
                }
              ]
            },
      ],
      '/interviews/': [
        {
          text: '面试',
          items: [
            { text: '概览', link: '/interviews/' }
          ]
        },
        {
          text: '面试案例',
          items: [
            { text: '概览', link: '/interviews/experiences/' },
            { text: 'AI Agent 二面题目', link: '/interviews/experiences/niuke-agent-second-round-sample' }
          ]
        }
      ],
      '/tutorials/': [
         {
           text: '实战',
           items: [
             { text: '概览', link: '/tutorials/' }
           ]
         }
       ],
      '/projects/': [
        {
          text: '项目',
          items: [{ text: '概览', link: '/projects/' }]
        }
      ],
      '/tools/': [
        {
          text: '工具导航',
          link: '/tools/'
        },
        {
          text: '热门智能体',
          items: [
            { text: 'Manus', link: '/tools/manus' },
            { text: 'Genspark', link: '/tools/genspark' },
            { text: 'Flowith', link: '/tools/flowith' },
            { text: '扣子', link: '/tools/coze' },
            { text: 'AstronClaw', link: '/tools/astronclaw' },
            { text: 'QoderWork', link: '/tools/qoderwork' },
            { text: 'ChatGPT 智能体', link: '/tools/operator' },
            { text: 'Skywork', link: '/tools/skywork' }
          ]
        }
      ]
    }
  }
})



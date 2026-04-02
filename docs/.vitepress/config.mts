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
      '/interviews/': [
        {
          text: '面试',
          items: [
            { text: '概览', link: '/interviews/' }
          ]
        },
        {
          text: '主题题库',
          items: [
            { text: 'LLM', link: '/interviews/llm/' },
            {
              text: 'RAG',
              collapsed: false,
              items: [
                { text: '概览', link: '/interviews/rag/' },
                { text: '基础概念', link: '/interviews/rag/basics' },
                { text: '核心原理', link: '/interviews/rag/core-principles' },
                { text: '实战设计', link: '/interviews/rag/practical-design' },
                { text: '性能优化', link: '/interviews/rag/performance-optimization' },
                { text: '项目难点', link: '/interviews/rag/project-challenges' },
                { text: '高频追问', link: '/interviews/rag/follow-up-questions' }
              ]
            },
            { text: 'Agent', link: '/interviews/agent/' },
            { text: 'Prompt', link: '/interviews/prompt/' },
            { text: '工程化', link: '/interviews/engineering/' }
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

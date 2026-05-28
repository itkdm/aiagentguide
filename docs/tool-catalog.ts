export type ToolCategory =
  | '中转站汇总'
  | '热门智能体'
  | 'Agent 框架'
  | '平台与工作流'
  | '评测与观测'
  | '浏览器与执行'

export type ToolCatalogEntry = {
  name: string
  href: string
  summary: string
  logoClass: string
  initials: string
  category: ToolCategory
}

export const toolCatalog: ToolCatalogEntry[] = [
  {
    name: '中转站汇总',
    href: '/tools/aggregators',
    summary: '汇总公开可访问的 AI API 中转、聚合和统一网关入口，便于集中比对与收藏。',
    logoClass: 'tool-tile-logo-aggregators',
    initials: 'ZH',
    category: '中转站汇总'
  },
  {
    name: 'Manus',
    href: '/tools/manus',
    summary: '自主通用 AI Agent，重点不是只回答问题，而是围绕任务目标自行规划、执行并交付结果。',
    logoClass: 'tool-tile-logo-manus',
    initials: 'MA',
    category: '热门智能体'
  },
  {
    name: 'Genspark',
    href: '/tools/genspark',
    summary: '一站式 AI 工作空间，把文档、演示、表格、图片、视频、代码和设计等能力集成在同一平台中。',
    logoClass: 'tool-tile-logo-genspark',
    initials: 'GS',
    category: '热门智能体'
  },
  {
    name: 'Flowith',
    href: '/tools/flowith',
    summary: '以二维画布为核心交互方式的 AI 生产力平台，支持多模型协作、智能体执行、知识库管理与内容创作。',
    logoClass: 'tool-tile-logo-flowith',
    initials: 'FW',
    category: '热门智能体'
  },
  {
    name: '扣子',
    href: '/tools/coze',
    summary: '字节跳动旗下的 AI Agent 智能办公与应用开发平台，覆盖写作、PPT、工作流、网页开发与一键部署。',
    logoClass: 'tool-tile-logo-coze',
    initials: 'CZ',
    category: '热门智能体'
  },
  {
    name: 'AstronClaw',
    href: '/tools/astronclaw',
    summary: '科大讯飞推出的云端 AI 助手服务，主打云端一键部署、7×24 在线运行、技能扩展与企业协作渠道接入。',
    logoClass: 'tool-tile-logo-astronclaw',
    initials: 'AC',
    category: '热门智能体'
  },
  {
    name: 'QoderWork',
    href: '/tools/qoderwork',
    summary: 'Qoder 推出的桌面级通用智能体助手，面向日常工作场景，支持自然语言发起任务并由 AI 自主规划、执行和交付结果。',
    logoClass: 'tool-tile-logo-qoderwork',
    initials: 'QW',
    category: '热门智能体'
  },
  {
    name: 'ChatGPT 智能体',
    href: '/tools/operator',
    summary: 'OpenAI 的智能体执行能力；原先以 Operator 形式推出，如今主要通过 ChatGPT 智能体模式继续提供。',
    logoClass: 'tool-tile-logo-operator',
    initials: 'OP',
    category: '热门智能体'
  },
  {
    name: 'Skywork',
    href: '/tools/skywork',
    summary: '以 Deep Research 为核心的一站式 AI 工作空间，可将简单输入转化为文档、幻灯片、表格、网页、播客等多种内容产出。',
    logoClass: 'tool-tile-logo-skywork',
    initials: 'SW',
    category: '热门智能体'
  },
  {
    name: 'Jules',
    href: '/tools/jules',
    summary: 'Google 推出的异步 AI 编程智能体，可直接连接 GitHub 仓库，自主规划、修改代码并提交可审查结果。',
    logoClass: 'tool-tile-logo-jules',
    initials: 'JL',
    category: '热门智能体'
  },
  {
    name: 'Claude Cowork',
    href: '/tools/claude-cowork',
    summary: 'Anthropic 在 Claude Desktop 中提供的电脑操作能力，可让 Claude 直接点击、输入、打开应用并协助完成桌面任务。',
    logoClass: 'tool-tile-logo-claudecowork',
    initials: 'CC',
    category: '热门智能体'
  },
  {
    name: 'MiniMax Agent',
    href: '/tools/minimax-agent',
    summary: 'MiniMax 推出的通用智能体产品，强调多步规划、长任务执行、深度研究、网页与办公内容生成。',
    logoClass: 'tool-tile-logo-minimaxagent',
    initials: 'MM',
    category: '热门智能体'
  },
  {
    name: '豆包手机助手',
    href: '/tools/doubao-mobile-assistant',
    summary: '字节跳动豆包团队推出的手机端 AI 助手，强调系统级操作手机、跨应用执行任务和更接近 GUI Agent 的交互方式。',
    logoClass: 'tool-tile-logo-doubaomobile',
    initials: 'DB',
    category: '热门智能体'
  },
  {
    name: 'Perplexity Comet',
    href: '/tools/perplexity-comet',
    summary: 'Perplexity 推出的 AI 浏览器，把搜索、摘要、网页理解、个人记忆和任务执行放进浏览器工作流里。',
    logoClass: 'tool-tile-logo-perplexitycomet',
    initials: 'PC',
    category: '热门智能体'
  },
  {
    name: 'Replit Agent',
    href: '/tools/replit-agent',
    summary: 'Replit 的应用构建智能体，可从自然语言出发自动规划、写代码、搭建基础设施并持续迭代。',
    logoClass: 'tool-tile-logo-replitagent',
    initials: 'RA',
    category: '热门智能体'
  },
  {
    name: 'Devin',
    href: '/tools/devin',
    summary: 'Cognition 推出的 AI 软件工程师，主打自主完成开发任务、并行处理 backlog、集成开发流程和团队协作。',
    logoClass: 'tool-tile-logo-devin',
    initials: 'DV',
    category: '热门智能体'
  },
  {
    name: 'LangGraph',
    href: '/tools/langgraph',
    summary: '状态化 Agent 编排框架，适合复杂流程、checkpoint 与人工介入场景。',
    logoClass: 'tool-tile-logo-langgraph',
    initials: 'LG',
    category: 'Agent 框架'
  },
  {
    name: 'AutoGen',
    href: '/tools/autogen',
    summary: '适合多 Agent 协作和消息驱动场景，强调角色分工与代理通信能力。',
    logoClass: 'tool-tile-logo-autogen',
    initials: 'AG',
    category: 'Agent 框架'
  },
  {
    name: 'CrewAI',
    href: '/tools/crewai',
    summary: '强调角色、任务和流程，适合快速理解协作型 Agent 的组织方式。',
    logoClass: 'tool-tile-logo-crewai',
    initials: 'CA',
    category: 'Agent 框架'
  },
  {
    name: 'Mastra',
    href: '/tools/mastra',
    summary: '偏 TypeScript 生态的 Agent 框架，适合现代 Web 工程里的集成场景。',
    logoClass: 'tool-tile-logo-mastra',
    initials: 'MS',
    category: 'Agent 框架'
  },
  {
    name: 'Dify',
    href: '/tools/dify',
    summary: '适合快速搭建带 Workflow、知识库和模型管理能力的 AI 应用平台。',
    logoClass: 'tool-tile-logo-dify',
    initials: 'DF',
    category: '平台与工作流'
  },
  {
    name: 'n8n',
    href: '/tools/n8n',
    summary: '可视化工作流平台，适合把 AI 节点和外部系统连接成完整业务流程。',
    logoClass: 'tool-tile-logo-n8n',
    initials: 'N8',
    category: '平台与工作流'
  },
  {
    name: 'Flowise',
    href: '/tools/flowise',
    summary: '更偏可视化搭建和原型验证，适合快速整理 Agent / RAG 工作流。',
    logoClass: 'tool-tile-logo-flowise',
    initials: 'FS',
    category: '平台与工作流'
  },
  {
    name: 'LlamaIndex',
    href: '/tools/llamaindex',
    summary: '数据接入与检索增强能力强，适合知识库和文档理解型 Agent。',
    logoClass: 'tool-tile-logo-llamaindex',
    initials: 'LI',
    category: '平台与工作流'
  },
  {
    name: 'Langfuse',
    href: '/tools/langfuse',
    summary: '聚焦 trace、prompt、scores 和调用链路，适合长期追踪 Agent 表现。',
    logoClass: 'tool-tile-logo-langfuse',
    initials: 'LF',
    category: '评测与观测'
  },
  {
    name: 'Promptfoo',
    href: '/tools/promptfoo',
    summary: '用于 LLM、RAG 与 Agent 的评测和红队测试，适合纳入 CI 流程。',
    logoClass: 'tool-tile-logo-promptfoo',
    initials: 'PF',
    category: '评测与观测'
  },
  {
    name: 'DeepEval',
    href: '/tools/deepeval',
    summary: '适合为生成质量、Agent 行为和检索结果建立自动化测试与基准。',
    logoClass: 'tool-tile-logo-deepeval',
    initials: 'DE',
    category: '评测与观测'
  },
  {
    name: 'browser-use',
    href: '/tools/browser-use',
    summary: '把网站转成 Agent 可操作环境，适合采集、表单填写和网页登录场景。',
    logoClass: 'tool-tile-logo-browseruse',
    initials: 'BU',
    category: '浏览器与执行'
  },
  {
    name: 'Playwright',
    href: '/tools/playwright',
    summary: '适合作为浏览器 Agent 的底层执行层，负责稳定控制页面和操作流程。',
    logoClass: 'tool-tile-logo-playwright',
    initials: 'PW',
    category: '浏览器与执行'
  },
  {
    name: 'OpenHands',
    href: '/tools/openhands',
    summary: '面向代码任务的 Agent 平台，适合修改代码、执行命令和形成任务闭环。',
    logoClass: 'tool-tile-logo-openhands',
    initials: 'OH',
    category: '浏览器与执行'
  }
]

export const toolCategoryOrder: ToolCategory[] = [
  '中转站汇总',
  '热门智能体',
  'Agent 框架',
  '平台与工作流',
  '评测与观测',
  '浏览器与执行'
]

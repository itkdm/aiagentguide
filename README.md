<p align="center">
  <h1 align="center">🤖 AI Agent Guide (AI 智能体开发指南)</h1>
  <p align="center">
    面向中文开发者的 AI Agent (智能体) 教程、入门指南与实战文档站点。
  </p>
  <p align="center">
    <a href="https://aiagentguide.cn/">🌐 在线阅读 (aiagentguide.cn)</a>
  </p>
  <p align="center">
    <a href="https://aiagentguide.cn/"><img src="https://img.shields.io/badge/website-aiagentguide.cn-0f172a?style=flat-square" alt="Website"></a>
    <a href="https://vitepress.dev/"><img src="https://img.shields.io/badge/built%20with-VitePress-646cff?style=flat-square" alt="Built with VitePress"></a>
    <a href="https://github.com/your-org/aiagentguide/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome"></a>
  </p>
</p>

## 🌟 项目简介

这个仓库不是单纯的“工具清单”，而是一个**按照学习路径**组织的结构化文档站点。我们系统性地覆盖了从底层 LLM 原理到上层 AI Agent 应用的完整生命周期，包括：**AI Agent、LLM、RAG、Workflow、多 Agent 协作、工具调用、上下文工程、框架选型与项目落地**等内容。

我们的目标是帮助中文开发者更系统、更透彻地理解并构建 AI Agent 应用。

如果你正在搜索寻找以下主题，这个仓库将为你提供极大帮助（这些也是我们的核心内容矩阵）：

- **基础与概念**：`AI Agent 教程`、`AI 智能体入门`、`什么是 AI Agent`、`大语言模型 (LLM) 应用开发`、`RAG 教程与实践`
- **原理与机制**：`Workflow 工作流与 Agent 的区别`、`Agentic Workflow 开发`、`Function Calling (工具调用)`、`Agent Memory (上下文记忆)`、`Prompt Engineering 提示词工程`
- **框架与架构**：`LangChain 教程`、`LangGraph 实践`、`AutoGen 多 Agent 系统`、`CrewAI 框架解析`、`Dify / Coze 智能体搭建`
- **进阶与落地**：`AI Agent 实战项目`、`Agent 框架对比与技术选型`、`多智能体 (Multi-Agent) 协作系统`、`AI 智能体开发与最佳实践`

---

## 🤔 为什么做这个项目？

AI Agent 领域发展迅猛，但也带来了明显的痛点：
1. **概念混淆**：容易在 Agent、聊天机器人（Chatbot）、工作流（Workflow）、RAG 之间迷失。
2. **知识碎片化**：听过无数高大上的名词，却难以在脑海中拼凑出完整的技术大图。
3. **本末倒置**：习惯于直接上手框架和工具（只停留在调用 API 的层面），而不理解底层的 Agent Core Loop 设计逻辑。

因此，本项目希望提供一条**扎实、系统、面向实战**的学习路径：**建立评判标准 -> 理解系统原理 -> 掌握框架选型 -> 落地项目实战**。

---

## 🎯 适合哪些读者？

- 👶 **初学者**：想系统、平滑地入门 AI Agent 的中文开发者。
- 🔍 **进阶者**：看过不少资料与开源项目，但仍缺少全局视野和完整认知框架的人。
- 🛠️ **实战与布道者**：准备在企业中进行 Agent 选型、落地开发，或热衷于研究开源生态的人。

---

## 🗺️ 全景内容大纲

| 模块 | 核心内容说明 |
| :--- | :--- |
| **💡 入门模块** | 认识 Agent 的本质、典型案例、适用边界以及常见的认知误区。 |
| **⚙️ 原理模块** | 深入剖析 Agent 循环、工具调用（Function Calling）、上下文管理、多 Agent 架构及可靠性工程。 |
| **🛠️ 框架模块** | 主流 Agent 框架（如 LangChain、LangGraph、AutoGen、CrewAI 等）的定位差异、适用场景与选型。 |
| **🚀 实战模块** | 手把手教你从最小的 PoC（可运行案例）演进到完整的生产级工作流搭建。 |
| **📂 项目推荐** | 深度拆解值得研究的 AI Agent 精品开源项目，提供源码学习入口。 |
| **🧰 工具导航** | 盘点当前热门平台产品与底层开发工具。 |
| **📰 行业资讯** | 过滤噪音，只做对学习路线、开发实践真正有指导价值的更新解读。 |
| **📚 资源聚合** | 优质的官方文档与硬核外部阅读资料索引。 |
| **🧠 LLM/RAG** | 完整涵盖大模型与 RAG 体系，帮你在真实的 LLM 应用级语境下理解 Agent。 |

> **💡 建议阅读顺序：**
> `入门 -> 原理 -> 框架 -> 实战 -> 工具 / 项目 / 资讯（按需查阅）`
> *如果刚开始接触，建议先建立核心认知与判断标准，再做技术选型，这比无脑追热点框架更稳健。*

---

## 💻 快速开始

本项目站点使用 [VitePress](https://vitepress.dev/) 强力驱动，可轻松在本地运行进行预览及开发。

### 环境要求

- **Node.js**: `20+`
- **包管理工具**: `pnpm 10+`

### 开发指令

```bash
# 1. 安装项目依赖
pnpm install

# 2. 启动本地开发服务器（支持热更新）
pnpm docs:dev

# 3. 生产环境静态站点构建
pnpm docs:build

# 4. 本地预览构建后的结果
pnpm docs:preview
```

---

## 📂 项目结构

```text
aiagentguide/
├─ docs/                  # 📚 VitePress 核心站点内容
│  ├─ .vitepress/         # VitePress 站点配置、主题与 SEO
│  ├─ public/             # 静态资源 (图片、默认配置等)
│  ├─ getting-started/    # 【入】入门指南
│  ├─ principles/         # 【原】系统原理
│  ├─ frameworks/         # 【框】框架选型
│  ├─ tutorials/          # 【实】实战教程
│  ├─ projects/           # 【项】开源项目解读
│  ├─ tools/              # 【工】工具导航
│  ├─ llm/                # 【底】LLM 相关知识体系
│  ├─ rag/                # 【底】RAG 相关知识体系
│  ├─ interviews/         # 常见面试与问答
│  └─ resources/          # 经典资源汇总
├─ content-plans/         # 内部规划文档（并不直接通过路由对外展示）
├─ scripts/               # 自动化构建与辅助脚本
├─ .github/workflows/     # CI/CD (GitHub Actions 部署配置)
└─ package.json           # 本地依赖及运行脚本
```

---

## 🤝 参与贡献

每一个开源项目都离不开社区的共同维护，我们非常欢迎你通过 `Issue` 或 `Pull Request` 的方式参与进来！

你可以做什么：
- 🐛 修复错别字、文案语病或已失效的外部链接。
- 📝 补充最新的 Agent 原理、优质框架、优秀开源项目。
- 🏗️ 优化教程结构、学习路径和专业术语解释。
- 🎨 改进 VitePress 主题、增强站点交互体验或完善 SEO。

*注：站点内容编写及参数说明可参考项目根目录的 [CONTENT_README.md](./CONTENT_README.md)。*

---

<p align="center">
  如果这个项目对你有帮助，请考虑给它一个 ⭐️ Star！
</p>


# AI Agent Guide

[![Website](https://img.shields.io/badge/website-aiagentguide.cn-0f172a?style=flat-square)](https://aiagentguide.cn/)
[![Built with VitePress](https://img.shields.io/badge/built%20with-VitePress-646cff?style=flat-square)](https://vitepress.dev/)

面向中文开发者的 AI Agent 教程与实战指南。

这个仓库不是单纯的“工具清单”，而是一个按照学习路径组织的文档站点，覆盖从概念建立、原理拆解、框架选型到实战落地的完整过程，目标是帮助开发者更系统地理解和构建 AI Agent。

在线阅读：[https://aiagentguide.cn/](https://aiagentguide.cn/)

## 为什么做这个项目

AI Agent 相关内容增长很快，但常见问题也很明显：

- 概念混在一起，容易分不清 Agent、聊天机器人、工作流和 RAG
- 资料高度碎片化，知道很多名词，却难以形成完整认知
- 直接追框架和工具，最后会用 API，却不理解背后的设计逻辑

这个项目希望提供一条更适合中文开发者的学习与实践路径：先建立判断标准，再理解系统原理，最后做框架选型和项目落地。

## 适合谁

- 想系统入门 AI Agent 的中文开发者
- 已经看过不少资料，但还缺少完整知识框架的人
- 准备做 Agent 选型、实战或开源研究的人

## 内容地图

| 栏目 | 内容说明 |
| --- | --- |
| 入门 | 认识 Agent、典型案例、适用场景、常见误区 |
| 原理 | Agent 循环、工具调用、上下文管理、多 Agent 与工程机制 |
| 框架 | 主流 Agent 框架的定位差异、适用场景与选型思路 |
| 实战 | 从最小可运行案例到更完整工作流的搭建过程 |
| 项目 | 值得研究的 AI Agent 开源项目与学习入口 |
| 工具 | 热门平台、产品与开发工具导航 |
| 资讯 | 对学习路线和实践方式真正有影响的更新解读 |
| 资源 | 官方文档与外部资料入口 |

## 推荐阅读顺序

`入门 -> 原理 -> 框架 -> 实战 -> 工具 / 项目 / 资讯（按需查阅）`

如果你刚开始接触 AI Agent，建议先建立判断标准，再做技术选型。这样通常会比直接追热门框架更稳，也更容易形成自己的方法论。

## 快速开始

### 环境要求

- Node.js 20+
- pnpm 10+

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
pnpm docs:dev
```

### 构建静态站点

```bash
pnpm docs:build
```

### 本地预览构建结果

```bash
pnpm docs:preview
```

## 项目结构

```text
.
├─ docs/                  # VitePress 站点内容
│  ├─ .vitepress/         # 站点配置、主题与 SEO
│  ├─ public/             # 静态资源
│  ├─ getting-started/    # 入门
│  ├─ principles/         # 原理
│  ├─ frameworks/         # 框架
│  ├─ tutorials/          # 实战
│  ├─ projects/           # 项目
│  ├─ tools/              # 工具
│  ├─ news/               # 资讯
│  └─ resources/          # 资源导航
├─ content-plans/         # 内容规划，不直接展示到站点
├─ .github/workflows/     # GitHub Actions 部署配置
└─ package.json           # 本地开发脚本
```

## 贡献方式

欢迎通过 Issue 或 PR 参与这个项目，例如：

- 修正文案错误、失效链接和页面结构问题
- 补充新的 Agent 原理、框架、项目或工具内容
- 优化教程顺序、学习路径和术语解释
- 改进 VitePress 主题、SEO 和站点体验

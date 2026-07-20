---
title: Jules
description: "Jules 是 Google 推出的异步 AI 编程智能体，可直接连接 GitHub 仓库，自主规划、修改代码并提交可审查结果。"
summary: 介绍 Jules 的产品定位、核心能力、使用方式、计划与审查流程、套餐限制和适用人群，帮助你快速判断它是否适合放进自己的开发工作流。
keywords:
  - Jules
  - Google Jules
  - AI 编程智能体
  - Google Labs
  - 异步 coding agent
tags:
  - AI Agent
  - 工具
  - Jules
  - 编程智能体
author: 布吉岛
aside: false
outline: false
pageClass: tool-detail-page
---

# Jules

<div class="tool-detail-hero">
  <div class="tool-detail-main">
    <span class="tool-detail-logo tool-tile-logo-jules">JL</span>
    <div>
      <p class="tool-detail-kicker">热门智能体</p>
      <p class="tool-detail-summary">Google 推出的异步 AI 编程智能体，能直接连接 GitHub 仓库，在云端自主规划、修改代码并把结果交回给开发者审查。</p>
    </div>
  </div>
  <div class="tool-detail-hero-action">
    <a class="tool-detail-button" href="https://jules.google/" target="_blank" rel="noreferrer">访问官网</a>
  </div>
</div>

<ToolAutoPreview />

<div class="tool-facts">
  <span>产品形态：异步 AI 编程智能体</span>
  <span>核心模式：GitHub 仓库接入 + 云端 VM 执行 + 人工审查合并</span>
  <span>关键时间点：2025-05-20 公测，2025-08-06 宣布全面开放</span>
  <span>价格信息：提供免费计划，Google AI Pro / Ultra 有更高额度</span>
</div>

## Jules 是什么？

<div class="tool-prose-card">
  <p>Jules 是 Google 推出的 <code>asynchronous coding agent</code>，也就是“异步编程智能体”。它不是传统 IDE 里的补全助手，也不是只在聊天框里给建议的代码问答工具，而是可以直接连接你的 GitHub 仓库，在独立云端环境里理解任务、规划步骤、修改代码并返回结果。</p>
  <p>Google 在 <strong>2025 年 5 月 20 日</strong> 宣布 Jules 进入公开测试，强调它能在后台自主处理修 Bug、写测试、补文档和实现新功能等任务；又在 <strong>2025 年 8 月 6 日</strong> 宣布其“正式走出 Beta 并面向所有人开放”。如果你把它和 GitHub Copilot、Cursor 这类以“人实时写、AI 辅助补”为主的工具相比，Jules 更像一个可异步派单的开发 agent。</p>
</div>

## 主要功能

<div class="tool-feature-grid">
  <article class="tool-feature-card">
    <h3>异步执行代码任务</h3>
    <p>你提交任务后，可以离开界面去做别的事。Jules 会在后台执行、重试并在计划准备好或任务完成后通知你，而不是要求你全程盯着对话窗口。</p>
  </article>
  <article class="tool-feature-card">
    <h3>直接连接 GitHub 仓库</h3>
    <p>官方说明它会克隆仓库、安装依赖、理解代码上下文并在隔离环境中完成修改，适合对真实项目做增量开发，而不只是处理零散代码片段。</p>
  </article>
  <article class="tool-feature-card">
    <h3>先给计划，再执行代码</h3>
    <p>Jules 会先生成执行计划，开发者可以审查计划、给反馈、再批准执行。这一点很适合需要可控性和代码审阅流程的团队或个人工作流。</p>
  </article>
  <article class="tool-feature-card">
    <h3>云端虚拟机运行与测试</h3>
    <p>每个任务在新的云端虚拟机里运行。官方 FAQ 明确提到它会在 secure cloud-based VM 中执行代码，并支持安装依赖、运行测试和按仓库环境脚本进行准备。</p>
  </article>
</div>

## 如何使用？

<div class="tool-step-list">
  <article class="tool-step-card">
    <span class="tool-step-no">01</span>
    <h3>登录并连接 GitHub</h3>
    <p>访问 Jules 官网，用 Google 账号进入产品后连接自己的 GitHub 仓库，授予它所需的代码访问权限。</p>
  </article>
  <article class="tool-step-card">
    <span class="tool-step-no">02</span>
    <h3>描述具体开发任务</h3>
    <p>把需求写清楚，例如修复 bug、补单测、重构某个模块或实现一个小功能。任务描述越明确，Jules 产出的计划通常越可控。</p>
  </article>
  <article class="tool-step-card">
    <span class="tool-step-no">03</span>
    <h3>审查计划并批准执行</h3>
    <p>Jules 会先给出执行计划。你可以修改要求、补充反馈，确认后再让它继续改代码和运行检查，而不是一上来直接动仓库。</p>
  </article>
  <article class="tool-step-card">
    <span class="tool-step-no">04</span>
    <h3>查看结果并决定是否合并</h3>
    <p>任务完成后，检查它生成的修改、总结和测试结果，再决定是否继续迭代、导出 patch，或走后续代码审查与合并流程。</p>
  </article>
</div>

## 价格与套餐

<div class="tool-prose-card">
  <p>截至 <strong>2026 年 5 月 28 日</strong>，Jules 官方 FAQ 和产品更新页可以明确确认：它提供 <code>免费计划</code>，同时对 <code>Google AI Pro</code> 和 <code>Google AI Ultra</code> 用户提供更高使用额度。Google 在 <strong>2025 年 8 月 6 日</strong> 的官方更新中明确写到，Jules 将面向 Google AI Pro 和 Ultra 推出分层更高限制。</p>
  <p>不过，如果你要问“Jules 是否有一张独立、固定、全球统一的价格表”，当前更准确的说法仍然是没有完全独立出来。因为它的高阶额度依附于 Google AI Pro / Ultra 订阅体系，而这些订阅价格和权益展示可能会随地区与时间调整，所以具体数字更适合以官网实时页面为准。</p>
</div>

<div class="tool-pricing-grid">
  <article class="tool-price-card">
    <p class="tool-price-tier">Free</p>
    <p class="tool-price-value">免费<span>/可用</span></p>
    <ul>
      <li>官方 FAQ 明确存在免费计划</li>
      <li>适合先体验异步编程 agent 形态</li>
      <li>具体任务与配额限制看实时页</li>
    </ul>
  </article>
  <article class="tool-price-card">
    <p class="tool-price-tier">Google AI Pro</p>
    <p class="tool-price-value">更高额度<span>/订阅内</span></p>
    <ul>
      <li>官方更新说明为 Pro 提供更高 limits</li>
      <li>更适合日常高频编码任务</li>
      <li>价格按 Google AI 套餐页实时显示</li>
    </ul>
  </article>
  <article class="tool-price-card">
    <p class="tool-price-tier">Google AI Ultra</p>
    <p class="tool-price-value">最高额度<span>/订阅内</span></p>
    <ul>
      <li>官方更新说明 Ultra 可获得更高倍率限制</li>
      <li>更适合重度、多任务工作流</li>
      <li>不建议在站内写死具体价格数字</li>
    </ul>
  </article>
</div>

<div class="tool-note-box">
  Jules 的关键差异点不是“会不会写代码”，而是它把 <strong>派任务、看计划、异步等待、审查结果</strong> 这一整套 agent 流程带进了真实 GitHub 项目开发里。
</div>

## 适用人群

<div class="tool-tag-grid">
  <span>希望把修 bug、补测试、补文档等任务异步交给 AI 的开发者</span>
  <span>已经以 GitHub 仓库为核心协作载体的个人开发者与小团队</span>
  <span>重视“先看计划再执行”而不是黑盒自动改代码的人</span>
  <span>想体验云端 coding agent，而不只用本地补全助手的人</span>
  <span>需要在真实项目中做小步快跑迭代的工程团队</span>
  <span>关注 Google 在编程智能体方向产品演进的人</span>
</div>

## 补充说明

<div class="tool-note-list">
  <article class="tool-note-card">
    <h3>时间线要分清</h3>
    <p>Jules 在 2025 年 5 月 20 日进入 public beta，在 2025 年 8 月 6 日官方宣布“out of beta and launching publicly”。如果后面你要写产品状态，最好把这两个日期分开写，避免混成“最近刚上线”。</p>
  </article>
  <article class="tool-note-card">
    <h3>和实时补全工具不是一类</h3>
    <p>Jules 更像一个异步派单型 agent，不是 IDE 里的即时补全插件。它适合“交给它做一件事，等它回来”，而不是“你敲一行它补一行”。</p>
  </article>
  <article class="tool-note-card">
    <h3>安全边界要讲清楚</h3>
    <p>官方 FAQ 明确提醒：任务在带互联网访问能力的云端虚拟机中运行，不要把密钥等敏感信息提交进仓库，也要谨慎对待第三方依赖和命令。这一点在介绍编程 agent 时很重要。</p>
  </article>
</div>

## 参考来源

- [Jules 官网](https://jules.google/)
- [Google 官方：Build with Jules, your asynchronous coding agent（2025-05-20）](https://blog.google/innovation-and-ai/models-and-research/google-labs/jules/)
- [Google 官方：Jules is now available for everyone（2025-08-06）](https://blog.google/innovation-and-ai/models-and-research/google-labs/jules-now-available/)
- [Jules 官方 FAQ](https://jules.google/docs/faq/)
- [Jules 官方文档首页](https://jules.google/docs/)
- [Jules Changelog](https://jules.google/docs/changelog/)

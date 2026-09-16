---
title: "参考成熟项目：AI 用量与计费系统是怎么设计的"
description: "通过 New API 与 Sub2API 的架构和计费流程，理解 AI 模型请求中的用量统计、价格计算与额度结算，为 CostFlow 设计提供参考。"
summary: "对比 New API 与 Sub2API 的网关、用量、定价和额度结算方式，为 AI 应用计费系统设计建立整体认识。"
keywords:
  - New API 计费
  - Sub2API 计费
  - AI API 网关计费
  - Usage Billing
  - CostFlow
tags:
  - CostFlow
  - 项目实践
  - 计费系统
author: 布吉岛
lastUpdated: 2026-09-16
status: draft
assets: none
reviewed: false
sourceType: original
draft: true
noindex: true
---

# 参考成熟项目：AI 用量与计费系统是怎么设计的

在真正开始设计我们的方案之前，我们先来了解一下其他项目的实践方案。

这次我们重点参考借鉴 `New API` 和 `Sub2API`。

它们解决的问题并不完全相同：

```text
New API
→ AI API 网关，重点看一次请求怎么完成扣费

Sub2API
→ AI API 网关，重点看 Usage、Cost、余额等数据怎么落下来
```

我们不会照搬其中任何一个项目，重点参考他们的逻辑设计，比如一次模型调用怎么进入计费链路？，参考他们的数据模型，比如真实 Usage 和 Cost 怎么保存？。

## New API 是什么

**New API** 是一个开源的 AI 模型网关与 API 管理平台。项目源码可以查看 [New API GitHub 仓库](https://github.com/QuantumNous/new-api)。它可以把 OpenAI、Claude、Gemini、DeepSeek 等不同模型服务商统一接入到一个系统中，并向上层应用提供统一的 API。这样业务系统不需要分别适配不同厂商，只需要对接 New API，就可以统一调用和切换不同模型。

除了统一模型接口之外，New API 还提供渠道管理、模型管理、Token 与权限控制、调用额度与费用统计、负载均衡、故障转移、调用日志等能力。因此它比较适合企业内部模型统一管理、多应用共享模型资源，以及需要对 AI 调用进行计费、权限控制和成本统计的业务场景，我们最常见的也就是中转站了。

### New API 的整体架构

从整体上看，New API 可以理解为一条从客户端请求到上游 AI 服务的统一调用链。它一边负责接收和转发模型请求，另一边负责用户、渠道、额度、计费以及运行日志等平台能力。

<MermaidDiagram
  :code="decodeURIComponent('flowchart%20TB%0A%20%20%20%20%25%25%201.%20Client%20Layer%0A%20%20%20%20subgraph%20L1%5B%22%E5%AE%A2%E6%88%B7%E7%AB%AF%E5%B1%82%22%5D%0A%20%20%20%20%20%20%20%20A1%5B%22Web%20%E7%AE%A1%E7%90%86%E5%90%8E%E5%8F%B0%22%5D%0A%20%20%20%20%20%20%20%20A2%5B%22OpenAI%20%2F%20Claude%20%2F%20Gemini%20SDK%22%5D%0A%20%20%20%20%20%20%20%20A3%5B%22AI%20%E5%BA%94%E7%94%A8%20%2F%20Agent%20%2F%20%E4%B8%9A%E5%8A%A1%E7%B3%BB%E7%BB%9F%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20%25%25%202.%20Access%20Layer%0A%20%20%20%20subgraph%20L2%5B%22%E7%BB%9F%E4%B8%80%E6%8E%A5%E5%85%A5%E5%B1%82%22%5D%0A%20%20%20%20%20%20%20%20B1%5B%22%E7%AE%A1%E7%90%86%20API%22%5D%0A%20%20%20%20%20%20%20%20B2%5B%22%E7%BB%9F%E4%B8%80%E6%A8%A1%E5%9E%8B%20API%22%5D%0A%20%20%20%20%20%20%20%20B3%5B%22%E5%BC%82%E6%AD%A5%E4%BB%BB%E5%8A%A1%20API%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20%25%25%203.%20Gateway%20Core%0A%20%20%20%20subgraph%20L3%5B%22%E7%BD%91%E5%85%B3%E6%A0%B8%E5%BF%83%E5%B1%82%22%5D%0A%20%20%20%20%20%20%20%20C1%5B%22%E8%BA%AB%E4%BB%BD%E8%AE%A4%E8%AF%81%E4%B8%8E%E6%9D%83%E9%99%90%E6%8E%A7%E5%88%B6%22%5D%0A%20%20%20%20%20%20%20%20C2%5B%22%E9%99%90%E6%B5%81%E4%B8%8E%E8%AF%B7%E6%B1%82%E6%A0%A1%E9%AA%8C%22%5D%0A%20%20%20%20%20%20%20%20C3%5B%22%E6%A8%A1%E5%9E%8B%E4%B8%8E%E5%88%86%E7%BB%84%E8%A7%A3%E6%9E%90%22%5D%0A%20%20%20%20%20%20%20%20C4%5B%22%E6%B8%A0%E9%81%93%E9%80%89%E6%8B%A9%E4%B8%8E%E8%B4%9F%E8%BD%BD%E8%B0%83%E5%BA%A6%22%5D%0A%20%20%20%20%20%20%20%20C5%5B%22%E5%A4%B1%E8%B4%A5%E9%87%8D%E8%AF%95%E4%B8%8E%E6%95%85%E9%9A%9C%E8%BD%AC%E7%A7%BB%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20%25%25%204.%20Relay%20%26%20Protocol%0A%20%20%20%20subgraph%20L4%5B%22%E6%A8%A1%E5%9E%8B%E8%BD%AC%E5%8F%91%E4%B8%8E%E5%8D%8F%E8%AE%AE%E9%80%82%E9%85%8D%E5%B1%82%22%5D%0A%20%20%20%20%20%20%20%20D1%5B%22%E8%AF%B7%E6%B1%82%E6%A0%87%E5%87%86%E5%8C%96%22%5D%0A%20%20%20%20%20%20%20%20D2%5B%22%E6%A8%A1%E5%9E%8B%E6%98%A0%E5%B0%84%22%5D%0A%20%20%20%20%20%20%20%20D3%5B%22%E5%8D%8F%E8%AE%AE%E8%BD%AC%E6%8D%A2%22%5D%0A%20%20%20%20%20%20%20%20D4%5B%22Provider%20%E9%80%82%E9%85%8D%22%5D%0A%20%20%20%20%20%20%20%20D5%5B%22%E6%B5%81%E5%BC%8F%E5%93%8D%E5%BA%94%E5%A4%84%E7%90%86%22%5D%0A%20%20%20%20%20%20%20%20D6%5B%22%E9%94%99%E8%AF%AF%E7%BB%9F%E4%B8%80%E5%A4%84%E7%90%86%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20%25%25%205.%20Platform%20Services%0A%20%20%20%20subgraph%20L5%5B%22%E5%B9%B3%E5%8F%B0%E4%B8%9A%E5%8A%A1%E4%B8%8E%E6%B2%BB%E7%90%86%E5%B1%82%22%5D%0A%20%20%20%20%20%20%20%20E1%5B%22%E7%94%A8%E6%88%B7%E4%B8%8E%20Token%20%E7%AE%A1%E7%90%86%22%5D%0A%20%20%20%20%20%20%20%20E2%5B%22%E6%B8%A0%E9%81%93%E4%B8%8E%E6%A8%A1%E5%9E%8B%E7%AE%A1%E7%90%86%22%5D%0A%20%20%20%20%20%20%20%20E3%5B%22%E8%AE%A1%E8%B4%B9%E4%B8%8E%E9%A2%9D%E5%BA%A6%E7%BB%93%E7%AE%97%22%5D%0A%20%20%20%20%20%20%20%20E4%5B%22%E8%AE%A2%E9%98%85%E4%B8%8E%E6%94%AF%E4%BB%98%22%5D%0A%20%20%20%20%20%20%20%20E5%5B%22%E6%97%A5%E5%BF%97%20%2F%20%E5%AE%A1%E8%AE%A1%20%2F%20%E7%9B%91%E6%8E%A7%22%5D%0A%20%20%20%20%20%20%20%20E6%5B%22%E7%B3%BB%E7%BB%9F%E9%85%8D%E7%BD%AE%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20%25%25%206.%20Infrastructure%0A%20%20%20%20subgraph%20L6%5B%22%E5%9F%BA%E7%A1%80%E8%AE%BE%E6%96%BD%E5%B1%82%22%5D%0A%20%20%20%20%20%20%20%20F1%5B%22%E4%B8%BB%E6%95%B0%E6%8D%AE%E5%BA%93%22%5D%0A%20%20%20%20%20%20%20%20F2%5B%22%E6%97%A5%E5%BF%97%E6%95%B0%E6%8D%AE%E5%BA%93%22%5D%0A%20%20%20%20%20%20%20%20F3%5B%22Redis%20%2F%20%E5%86%85%E5%AD%98%E7%BC%93%E5%AD%98%22%5D%0A%20%20%20%20%20%20%20%20F4%5B%22%E5%90%8E%E5%8F%B0%E4%BB%BB%E5%8A%A1%E4%B8%8E%E4%BB%BB%E5%8A%A1%E9%98%9F%E5%88%97%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20%25%25%20Providers%0A%20%20%20%20subgraph%20P%5B%22%E4%B8%8A%E6%B8%B8%20AI%20%E6%9C%8D%E5%8A%A1%22%5D%0A%20%20%20%20%20%20%20%20P1%5B%22OpenAI%22%5D%0A%20%20%20%20%20%20%20%20P2%5B%22Anthropic%22%5D%0A%20%20%20%20%20%20%20%20P3%5B%22Gemini%22%5D%0A%20%20%20%20%20%20%20%20P4%5B%22Azure%20%2F%20Bedrock%22%5D%0A%20%20%20%20%20%20%20%20P5%5B%22DeepSeek%20%2F%20%E5%85%B6%E4%BB%96%E5%85%BC%E5%AE%B9%E6%9C%8D%E5%8A%A1%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20%25%25%20Main%20Flows%0A%20%20%20%20A1%20--%3E%20B1%0A%20%20%20%20A2%20--%3E%20B2%0A%20%20%20%20A3%20--%3E%20B2%0A%20%20%20%20A3%20--%3E%20B3%0A%0A%20%20%20%20B1%20--%3E%20C1%0A%20%20%20%20B2%20--%3E%20C1%0A%20%20%20%20B3%20--%3E%20C1%0A%0A%20%20%20%20C1%20--%3E%20C2%0A%20%20%20%20C2%20--%3E%20C3%0A%20%20%20%20C3%20--%3E%20C4%0A%20%20%20%20C4%20--%3E%20C5%0A%0A%20%20%20%20C5%20--%3E%20D1%0A%20%20%20%20D1%20--%3E%20D2%0A%20%20%20%20D2%20--%3E%20D3%0A%20%20%20%20D3%20--%3E%20D4%0A%20%20%20%20D4%20--%3E%20D5%0A%20%20%20%20D5%20--%3E%20D6%0A%0A%20%20%20%20D4%20--%3E%20P1%0A%20%20%20%20D4%20--%3E%20P2%0A%20%20%20%20D4%20--%3E%20P3%0A%20%20%20%20D4%20--%3E%20P4%0A%20%20%20%20D4%20--%3E%20P5%0A%0A%20%20%20%20P1%20--%3E%20D5%0A%20%20%20%20P2%20--%3E%20D5%0A%20%20%20%20P3%20--%3E%20D5%0A%20%20%20%20P4%20--%3E%20D5%0A%20%20%20%20P5%20--%3E%20D5%0A%0A%20%20%20%20%25%25%20Platform%20Services%0A%20%20%20%20B1%20--%3E%20E1%0A%20%20%20%20B1%20--%3E%20E2%0A%20%20%20%20B1%20--%3E%20E4%0A%20%20%20%20B1%20--%3E%20E6%0A%0A%20%20%20%20C4%20--%3E%20E2%0A%20%20%20%20C5%20--%3E%20E5%0A%20%20%20%20D1%20--%3E%20E3%0A%20%20%20%20D5%20--%3E%20E3%0A%20%20%20%20D6%20--%3E%20E5%0A%0A%20%20%20%20%25%25%20Infrastructure%0A%20%20%20%20E1%20--%3E%20F1%0A%20%20%20%20E2%20--%3E%20F1%0A%20%20%20%20E3%20--%3E%20F1%0A%20%20%20%20E4%20--%3E%20F1%0A%20%20%20%20E5%20--%3E%20F2%0A%20%20%20%20E6%20--%3E%20F1%0A%0A%20%20%20%20C4%20--%3E%20F3%0A%20%20%20%20E2%20--%3E%20F3%0A%20%20%20%20B3%20--%3E%20F4')"
/>


### 数据模型

下面这张图把 New API 中与模型、渠道、价格、额度和消费记录相关的主要数据对象放在一起，重点展示它们之间的业务关系，不对应具体代码类或数据库表结构。

<MermaidDiagram
  :code="decodeURIComponent('flowchart%20LR%0A%20%20%20%20Model%5B%22Model%3Cbr%2F%3E%E6%A8%A1%E5%9E%8B%E7%9B%AE%E5%BD%95%22%5D%0A%20%20%20%20Channel%5B%22Channel%3Cbr%2F%3E%E4%B8%8A%E6%B8%B8%E6%B8%A0%E9%81%93%22%5D%0A%20%20%20%20Ability%5B%22Ability%3Cbr%2F%3E%E6%A8%A1%E5%9E%8B%20%C3%97%20%E5%88%86%E7%BB%84%20%C3%97%20%E6%B8%A0%E9%81%93%22%5D%0A%0A%20%20%20%20Pricing%5B%22Pricing%20Config%3Cbr%2F%3E%E6%A8%A1%E5%9E%8B%E4%BB%B7%E6%A0%BC%E8%A7%84%E5%88%99%22%5D%0A%0A%20%20%20%20Wallet%5B%22Wallet%20Quota%3Cbr%2F%3E%E7%94%A8%E6%88%B7%E5%8F%AF%E7%94%A8%E9%A2%9D%E5%BA%A6%22%5D%0A%20%20%20%20Token%5B%22Token%3Cbr%2F%3E%E8%B0%83%E7%94%A8%E5%87%AD%E8%AF%81%E9%A2%9D%E5%BA%A6%22%5D%0A%0A%20%20%20%20Plan%5B%22SubscriptionPlan%3Cbr%2F%3E%E8%AE%A2%E9%98%85%E8%AE%A1%E5%88%92%22%5D%0A%20%20%20%20Sub%5B%22UserSubscription%3Cbr%2F%3E%E7%94%A8%E6%88%B7%E8%AE%A2%E9%98%85%22%5D%0A%20%20%20%20Reserve%5B%22PreConsumeRecord%3Cbr%2F%3E%E8%AE%A2%E9%98%85%E9%A2%84%E6%89%A3%E8%AE%B0%E5%BD%95%22%5D%0A%0A%20%20%20%20Log%5B%22Log%3Cbr%2F%3E%E6%B6%88%E8%B4%B9%E6%98%8E%E7%BB%86%22%5D%0A%20%20%20%20Stats%5B%22QuotaData%3Cbr%2F%3E%E8%81%9A%E5%90%88%E7%BB%9F%E8%AE%A1%22%5D%0A%20%20%20%20Task%5B%22Task%3Cbr%2F%3E%E5%BC%82%E6%AD%A5%E4%BB%BB%E5%8A%A1%22%5D%0A%0A%20%20%20%20Model%20--%3E%20Ability%0A%20%20%20%20Channel%20--%3E%20Ability%0A%0A%20%20%20%20Model%20--%3E%20Pricing%0A%0A%20%20%20%20Plan%20--%3E%20Sub%0A%20%20%20%20Sub%20--%3E%20Reserve%0A%0A%20%20%20%20Wallet%20--%3E%20Log%0A%20%20%20%20Token%20--%3E%20Log%0A%20%20%20%20Pricing%20--%3E%20Log%0A%20%20%20%20Ability%20--%3E%20Log%0A%0A%20%20%20%20Log%20--%3E%20Stats%0A%0A%20%20%20%20Channel%20--%3E%20Task%0A%20%20%20%20Pricing%20--%3E%20Task%0A%20%20%20%20Wallet%20--%3E%20Task%0A%20%20%20%20Sub%20--%3E%20Task')"
/>

### 如何计算模型费用？

新版 New API 使用**计费表达式**描述模型价格，不再主要依赖输入、输出等倍率进行间接换算。表达式中的价格可以直接使用真实的 **`$ / 1M Tokens`** 单价。

模型响应返回后，New API 会先将不同厂商返回的 Usage 统一成若干计费维度，例如：

```text
p      普通输入 Token
c      输出 Token
cr     缓存命中 Token
cc     缓存创建 Token
cc1h   1 小时缓存创建 Token
```

还可以进一步包含图片、音频等用量。

例如某模型价格为：

```text
输入：      $3 / 1M
输出：      $15 / 1M
缓存命中：  $0.3 / 1M
缓存创建：  $3.75 / 1M
```

对应表达式可以写成：

```text
p * 3 + c * 15 + cr * 0.3 + cc * 3.75
```

假设一次请求产生：

```text
普通输入 1000
缓存命中 5000
输出 500
```

那么实际费用就是：

```text
(1000 × 3 + 5000 × 0.3 + 500 × 15) / 1,000,000
= $0.012
```

对于已经包含在输入 Token 中的缓存、图片等用量，New API 会在这些类别被单独计价时自动从普通输入中扣除，避免重复收费。

最终流程可以理解为：

```text
Provider Usage
→ 统一用量
→ 执行计费表达式
→ 得到实际费用
→ 转换为 Quota
→ 最终结算
```

### 一次模型请求的计费流程

用户携带调用凭证发起请求后，系统先确认调用者身份，再根据请求确定使用的渠道和模型。计费部分会根据请求信息预估可能产生的额度，并按当前策略选择一种可用的额度来源；如果当前请求不需要预扣，则可以直接调用上游模型。

上游模型返回模型响应后，系统从响应中解析实际用量，再结合对应的价格规则计算本次消费。最后，系统按照结算结果调整用户额度、订阅额度或调用凭证额度，并记录这次请求的用量和消费结果。

<MermaidDiagram
  :code='`flowchart LR
    client["用户请求"] --> access["请求接入"]
    access --> identity["身份校验"]
    identity --> route["请求路由"]
    route --> model["确定渠道与模型"]
    model --> control["计费控制"]
    control --> estimate["预估本次额度"]
    estimate --> precheck{"是否需要预扣？"}
    precheck -->|"是"| choose["选择额度来源"]
    choose -->|"选择其一"| userQuota["用户可用额度"]
    choose -->|"选择其一"| subscriptionQuota["订阅可用额度"]
    userQuota --> reserve["预扣额度"]
    subscriptionQuota --> reserve
    reserve --> provider["调用上游模型并接收响应"]
    precheck -->|"否"| provider
    model --> pricing["读取对应价格规则"]
    provider --> response["模型响应"]
    response --> usage["解析响应中的实际用量"]
    usage --> calculate["计算实际消费"]
    pricing --> calculate
    calculate --> settle["结算并调整额度"]
    usage --> record["记录用量与消费结果"]
    settle --> record`'
/>

### 预扣、结算与退款

模型请求开始时，系统通常还不知道最终会消耗多少额度。如果等请求完成后再扣，可能出现额度不足或重复消费的问题。因此，系统可以先按照预估用量暂时占用一部分额度，等拿到模型返回的真实用量以后，再把这次消费调整准确。

<MermaidDiagram
  :code='`flowchart TD
    reserve["暂时占用预估额度"] --> request{"模型请求结果"}
    request -->|"成功，得到真实用量"| calculate["根据真实用量计算消费"]
    calculate --> compare{"比较预估额度与实际消费"}
    compare -->|"实际消费更多"| add["补扣差额"]
    compare -->|"实际消费更少"| refundPart["退回差额"]
    compare -->|"两者相同"| keep["保持不变"]
    request -->|"请求失败"| pending{"是否仍占用了额度？"}
    pending -->|"是"| refund["释放已占用额度"]
    pending -->|"否"| finish["结束"]
    add --> finish
    refundPart --> finish
    keep --> finish
    refund --> finish`'
/>

假设系统先按照预估用量占用 100 个额度：

- 实际消费为 135 时，再补扣 35，最终消费 135。
- 实际消费为 72 时，退回 28，最终消费 72。
- 实际消费仍为 100 时，不需要补扣或退回。

这里需要区分两种情况：请求成功后，因为预估额度偏大而退回差额，属于正常结算；请求失败后，释放此前暂时占用的额度，属于失败补偿。两者都可能让可用额度增加，但触发原因不同。

## Sub2API 是什么

**Sub2API** 是一个开源的 AI API 网关与**订阅额度分发平台**。项目源码可以查看 [Sub2API GitHub 仓库](https://github.com/Wei-Shaw/sub2api)。它可以接入 Claude、OpenAI、Gemini、Grok 等 AI 产品的订阅账号或 API Key，并把这些上游账号统一管理起来，再通过平台生成的 API Key 向下游用户提供调用能力。用户不需要直接持有上游账号，由 Sub2API 负责请求转发、账号选择和额度管理。

除了基本的 API 转发之外，Sub2API 还提供多账号管理、Token 级用量与费用统计、智能账号调度、粘性会话、用户与账号并发限制、速率限制、余额充值与支付等能力。它最典型的场景就是将多个 AI 产品订阅账号组成一个账号池，把订阅额度统一分发给多个用户使用，也就是我们常说的**订阅共享、拼车或中转服务**。

### Sub2API 的整体架构

下面这张图从整体上展示 Sub2API 如何接收客户端请求、完成协议适配和账号调度，再连接上游 AI 账号池；同时也展示了管理服务、用量计费和基础设施之间的关系。

<MermaidDiagram
  :code="decodeURIComponent('flowchart%20TB%0A%20%20%20%20subgraph%20Client%5B%22%E5%AE%A2%E6%88%B7%E7%AB%AF%22%5D%0A%20%20%20%20%20%20%20%20APIClient%5B%22API%20Client%20%2F%20SDK%22%5D%0A%20%20%20%20%20%20%20%20AdminWeb%5B%22Web%20%E7%AE%A1%E7%90%86%E7%AB%AF%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20Sub2API%5B%22Sub2API%22%5D%0A%20%20%20%20%20%20%20%20subgraph%20Access%5B%22%E6%8E%A5%E5%85%A5%E5%B1%82%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20Router%5B%22HTTP%20Router%20%2F%20Handler%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20AdminAPI%5B%22%E7%AE%A1%E7%90%86%20API%22%5D%0A%20%20%20%20%20%20%20%20end%0A%0A%20%20%20%20%20%20%20%20subgraph%20Gateway%5B%22%E5%8D%8F%E8%AE%AE%E7%BD%91%E5%85%B3%E5%B1%82%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20ClaudeGW%5B%22Claude%20%2F%20Anthropic%20Gateway%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20OpenAIGW%5B%22OpenAI%20%2F%20Codex%20Gateway%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20GeminiGW%5B%22Gemini%20%2F%20Antigravity%20Gateway%22%5D%0A%20%20%20%20%20%20%20%20end%0A%0A%20%20%20%20%20%20%20%20subgraph%20Core%5B%22%E8%B4%A6%E5%8F%B7%E8%B0%83%E5%BA%A6%E4%B8%8E%E8%BF%90%E8%A1%8C%E6%8E%A7%E5%88%B6%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20Group%5B%22Group%20%2F%20%E6%A8%A1%E5%9E%8B%E4%B8%8E%E8%B4%A6%E5%8F%B7%E8%8C%83%E5%9B%B4%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20Control%5B%22%E7%94%A8%E6%88%B7%E5%B9%B6%E5%8F%91%20%2F%20%E8%B4%A6%E5%8F%B7%E5%B9%B6%E5%8F%91%20%2F%20Rate%20Limit%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20Scheduler%5B%22Account%20Scheduler%3Cbr%2F%3E%E8%B4%A6%E5%8F%B7%E6%B1%A0%E8%B0%83%E5%BA%A6%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20Sticky%5B%22Sticky%20Session%3Cbr%2F%3E%E7%B2%98%E6%80%A7%E4%BC%9A%E8%AF%9D%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20Failover%5B%22Retry%20%2F%20Failover%3Cbr%2F%3E%E9%87%8D%E8%AF%95%E4%B8%8E%E8%B4%A6%E5%8F%B7%E5%88%87%E6%8D%A2%22%5D%0A%20%20%20%20%20%20%20%20end%0A%0A%20%20%20%20%20%20%20%20subgraph%20Accounting%5B%22%E7%94%A8%E9%87%8F%E4%B8%8E%E8%AE%A1%E8%B4%B9%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20Usage%5B%22Usage%20%E8%A7%A3%E6%9E%90%E4%B8%8E%E8%AE%B0%E5%BD%95%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20Billing%5B%22Billing%3Cbr%2F%3E%E8%B4%B9%E7%94%A8%E8%AE%A1%E7%AE%97%22%5D%0A%20%20%20%20%20%20%20%20end%0A%0A%20%20%20%20%20%20%20%20subgraph%20Management%5B%22%E7%AE%A1%E7%90%86%E6%9C%8D%E5%8A%A1%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20AccountMgmt%5B%22Account%20%E7%AE%A1%E7%90%86%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20UserMgmt%5B%22User%20%2F%20API%20Key%22%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20GroupMgmt%5B%22Group%20%E7%AE%A1%E7%90%86%22%5D%0A%20%20%20%20%20%20%20%20end%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20Infra%5B%22%E5%9F%BA%E7%A1%80%E8%AE%BE%E6%96%BD%22%5D%0A%20%20%20%20%20%20%20%20PostgreSQL%5B%22PostgreSQL%3Cbr%2F%3E%E4%B8%9A%E5%8A%A1%E6%95%B0%E6%8D%AE%20%2F%20Usage%20%2F%20%E8%B4%A6%E5%8F%B7%E9%85%8D%E7%BD%AE%22%5D%0A%20%20%20%20%20%20%20%20Redis%5B%22Redis%3Cbr%2F%3E%E7%BC%93%E5%AD%98%20%2F%20%E4%BC%9A%E8%AF%9D%20%2F%20%E5%B9%B6%E5%8F%91%E4%B8%8E%E8%BF%90%E8%A1%8C%E7%8A%B6%E6%80%81%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20subgraph%20Accounts%5B%22%E4%B8%8A%E6%B8%B8%20AI%20%E8%B4%A6%E5%8F%B7%E6%B1%A0%22%5D%0A%20%20%20%20%20%20%20%20ClaudeAccounts%5B%22Claude%20Accounts%22%5D%0A%20%20%20%20%20%20%20%20OpenAIAccounts%5B%22OpenAI%20%2F%20Codex%20Accounts%22%5D%0A%20%20%20%20%20%20%20%20GeminiAccounts%5B%22Gemini%20%2F%20Antigravity%20Accounts%22%5D%0A%20%20%20%20end%0A%0A%20%20%20%20APIClient%20--%3E%20Router%0A%20%20%20%20AdminWeb%20--%3E%20AdminAPI%0A%0A%20%20%20%20Router%20--%3E%20ClaudeGW%0A%20%20%20%20Router%20--%3E%20OpenAIGW%0A%20%20%20%20Router%20--%3E%20GeminiGW%0A%0A%20%20%20%20ClaudeGW%20--%3E%20Group%0A%20%20%20%20OpenAIGW%20--%3E%20Group%0A%20%20%20%20GeminiGW%20--%3E%20Group%0A%0A%20%20%20%20Group%20--%3E%20Control%0A%20%20%20%20Control%20--%3E%20Scheduler%0A%0A%20%20%20%20Scheduler%20%3C--%3E%20Sticky%0A%20%20%20%20Scheduler%20--%3E%20Failover%0A%0A%20%20%20%20Failover%20--%3E%20ClaudeAccounts%0A%20%20%20%20Failover%20--%3E%20OpenAIAccounts%0A%20%20%20%20Failover%20--%3E%20GeminiAccounts%0A%0A%20%20%20%20ClaudeGW%20--%3E%20Usage%0A%20%20%20%20OpenAIGW%20--%3E%20Usage%0A%20%20%20%20GeminiGW%20--%3E%20Usage%0A%0A%20%20%20%20Usage%20--%3E%20Billing%0A%0A%20%20%20%20AdminAPI%20--%3E%20AccountMgmt%0A%20%20%20%20AdminAPI%20--%3E%20UserMgmt%0A%20%20%20%20AdminAPI%20--%3E%20GroupMgmt%0A%0A%20%20%20%20AccountMgmt%20--%3E%20PostgreSQL%0A%20%20%20%20UserMgmt%20--%3E%20PostgreSQL%0A%20%20%20%20GroupMgmt%20--%3E%20PostgreSQL%0A%20%20%20%20Usage%20--%3E%20PostgreSQL%0A%20%20%20%20Billing%20--%3E%20PostgreSQL%0A%0A%20%20%20%20Scheduler%20%3C--%3E%20Redis%0A%20%20%20%20Sticky%20%3C--%3E%20Redis%0A%20%20%20%20Control%20%3C--%3E%20Redis%0A%0A%20%20%20%20AccountMgmt%20--%3E%20Scheduler')"
/>

### Sub2API 数据模型

下面这张图从用户、调用凭证、订阅、资源分组和上游账号几个角度，展示 Sub2API 中与额度分发和消费记录相关的主要数据关系。

<MermaidDiagram
  :code="decodeURIComponent('flowchart%20LR%0A%20%20%20%20User%5B%22User%3Cbr%2F%3E%E7%94%A8%E6%88%B7%E4%BD%99%E9%A2%9D%22%5D%0A%20%20%20%20APIKey%5B%22API%20Key%3Cbr%2F%3E%E8%B0%83%E7%94%A8%E5%87%AD%E8%AF%81%E4%B8%8E%E9%A2%9D%E5%BA%A6%22%5D%0A%20%20%20%20Subscription%5B%22UserSubscription%3Cbr%2F%3E%E7%94%A8%E6%88%B7%E8%AE%A2%E9%98%85%22%5D%0A%20%20%20%20Group%5B%22Group%3Cbr%2F%3E%E8%B5%84%E6%BA%90%E5%88%86%E7%BB%84%22%5D%0A%20%20%20%20Account%5B%22Account%3Cbr%2F%3E%E4%B8%8A%E6%B8%B8%E8%B4%A6%E5%8F%B7%22%5D%0A%20%20%20%20AccountGroup%5B%22AccountGroup%3Cbr%2F%3E%E8%B4%A6%E5%8F%B7%20%C3%97%20%E5%88%86%E7%BB%84%22%5D%0A%20%20%20%20Channel%5B%22Channel%3Cbr%2F%3E%E5%AE%9A%E4%BB%B7%E6%B8%A0%E9%81%93%22%5D%0A%20%20%20%20Pricing%5B%22Model%20Pricing%3Cbr%2F%3E%E6%A8%A1%E5%9E%8B%E4%BB%B7%E6%A0%BC%E8%A7%84%E5%88%99%22%5D%0A%20%20%20%20Usage%5B%22UsageLog%3Cbr%2F%3E%E8%B0%83%E7%94%A8%E4%B8%8E%E6%B6%88%E8%B4%B9%E6%98%8E%E7%BB%86%22%5D%0A%20%20%20%20PlatformQuota%5B%22PlatformQuota%3Cbr%2F%3E%E5%B9%B3%E5%8F%B0%E9%A2%9D%E5%BA%A6%E9%99%90%E5%88%B6%22%5D%0A%0A%20%20%20%20User%20--%3E%20APIKey%0A%20%20%20%20User%20--%3E%20Subscription%0A%20%20%20%20User%20--%3E%20PlatformQuota%0A%0A%20%20%20%20APIKey%20--%3E%20Group%0A%20%20%20%20Subscription%20--%3E%20Group%0A%0A%20%20%20%20Group%20--%3E%20AccountGroup%0A%20%20%20%20AccountGroup%20--%3E%20Account%0A%0A%20%20%20%20Group%20--%3E%20Channel%0A%20%20%20%20Channel%20--%3E%20Pricing%0A%0A%20%20%20%20APIKey%20--%3E%20Usage%0A%20%20%20%20Group%20--%3E%20Usage%0A%20%20%20%20Account%20--%3E%20Usage%0A%20%20%20%20Pricing%20--%3E%20Usage%0A%20%20%20%20Subscription%20--%3E%20Usage')"
/>


### Sub2API 如何计算模型费用？

Sub2API 的计费思路和 New API 类似，都会先把模型返回的 Usage 拆成不同用量，再分别计算费用。但 Sub2API 不使用 Billing Expression，而是采用更结构化的 **Price Card + Pricing Resolver + Billing Mode** 方式。

一次请求完成后，Sub2API 会将 Usage 拆分为：

```text
Input Tokens
Output Tokens
Cache Read Tokens
Cache Creation Tokens
Cache Creation 5m / 1h
Image Input / Output Tokens
```

这些用量会分别按照对应价格计算，避免缓存 Token、图片 Token 等重复计入普通输入费用。

随后 `ModelPricingResolver` 会确定本次请求使用哪套价格，其优先级为：

```text
Group Pricing
    ↓
Channel Pricing
    ↓
LiteLLM 模型价格
    ↓
Fallback
```

也就是说，分组可以配置自己的模型价格；没有配置时再使用 Channel 定价，最后才回退到系统内置的模型价格。

对于最常见的 Token 计费，可以简化理解为：

```text
TotalCost =
InputTokens × InputPrice
+ OutputTokens × OutputPrice
+ CacheReadTokens × CacheReadPrice
+ CacheCreationTokens × CacheCreationPrice
```

图片输入、图片输出等特殊用量也会作为独立费用项加入 `TotalCost`。源码中的 `CostBreakdown` 就分别保存了输入、输出、缓存创建、缓存读取以及图片等费用。

Sub2API 还支持**阶梯定价**。例如模型在 200K Context 以内使用一套价格，超过 200K 后使用另一套价格。系统会根据本次请求的上下文 Token 数匹配相应的 `PricingInterval`。

除了按 Token 计费外，目前还支持：

```text
token        按 Token
per_request  按请求次数
image        图片计费
video        视频计费
```

统一计费入口会根据不同 `BillingMode` 选择对应的计算方式。

最后，Sub2API 还区分了**标准成本**和**用户实际费用**：

```text
TotalCost
= 按模型价格计算出的标准费用

ActualCost
= TotalCost × RateMultiplier
```

`RateMultiplier` 可以来自用户所属 Group，因此平台可以在模型标准成本之上设置自己的销售倍率。

所以整个过程可以概括为：

```text
Provider Usage
    ↓
统一用量
    ↓
解析模型价格
    ↓
选择 Billing Mode / Pricing Interval
    ↓
计算 TotalCost
    ↓
应用用户计费倍率
    ↓
得到 ActualCost
```

相比 New API 的表达式计费，Sub2API 更倾向于把输入价、输出价、缓存价、阶梯价格和计费模式都建模成明确的结构化数据。


### Sub2API 一次模型请求


Sub2API 在普通模型请求开始前，并不会先预估本次请求需要多少钱并暂时占用这笔额度，而是先检查用户当前是否还有使用资格。

例如余额用户会检查账户是否还有可用余额，订阅用户会检查订阅是否有效、日/周/月额度是否已经耗尽，同时还会检查 API Key 等相关使用限制。只有检查通过，请求才会继续调用上游模型。

下面这张图展示了普通模型请求从资格检查、调用上游模型，到按照真实用量计算并结算费用的主要流程。

<MermaidDiagram
  :code="decodeURIComponent('flowchart%20TD%0A%20%20%20%20request%5B%22%E7%94%A8%E6%88%B7%E5%8F%91%E8%B5%B7%E6%A8%A1%E5%9E%8B%E8%AF%B7%E6%B1%82%22%5D%20--%3E%20check%5B%22%E6%A3%80%E6%9F%A5%E5%BD%93%E5%89%8D%E6%98%AF%E5%90%A6%E5%8F%AF%E4%BB%A5%E7%BB%A7%E7%BB%AD%E4%BD%BF%E7%94%A8%22%5D%0A%20%20%20%20check%20--%3E%20available%7B%22%E9%A2%9D%E5%BA%A6%E6%98%AF%E5%90%A6%E5%8F%AF%E7%94%A8%EF%BC%9F%22%7D%0A%0A%20%20%20%20available%20--%3E%7C%22%E5%90%A6%22%7C%20reject%5B%22%E6%8B%92%E7%BB%9D%E8%AF%B7%E6%B1%82%22%5D%0A%20%20%20%20available%20--%3E%7C%22%E6%98%AF%22%7C%20model%5B%22%E8%B0%83%E7%94%A8%E4%B8%8A%E6%B8%B8%E6%A8%A1%E5%9E%8B%22%5D%0A%0A%20%20%20%20model%20--%3E%20result%7B%22%E6%A8%A1%E5%9E%8B%E8%AF%B7%E6%B1%82%E7%BB%93%E6%9E%9C%22%7D%0A%20%20%20%20result%20--%3E%7C%22%E5%A4%B1%E8%B4%A5%22%7C%20finishFail%5B%22%E7%BB%93%E6%9D%9F%EF%BC%8C%E4%B8%8D%E4%BA%A7%E7%94%9F%E6%AD%A3%E5%B8%B8%E6%B6%88%E8%B4%B9%22%5D%0A%20%20%20%20result%20--%3E%7C%22%E6%88%90%E5%8A%9F%22%7C%20usage%5B%22%E8%8E%B7%E5%BE%97%E5%AE%9E%E9%99%85%E7%94%A8%E9%87%8F%22%5D%0A%0A%20%20%20%20usage%20--%3E%20calculate%5B%22%E6%A0%B9%E6%8D%AE%E7%9C%9F%E5%AE%9E%E7%94%A8%E9%87%8F%E8%AE%A1%E7%AE%97%E8%B4%B9%E7%94%A8%22%5D%0A%20%20%20%20calculate%20--%3E%20source%7B%22%E4%BD%BF%E7%94%A8%E5%93%AA%E7%A7%8D%E9%A2%9D%E5%BA%A6%EF%BC%9F%22%7D%0A%0A%20%20%20%20source%20--%3E%7C%22%E4%BD%99%E9%A2%9D%22%7C%20balance%5B%22%E7%9B%B4%E6%8E%A5%E6%89%A3%E5%87%8F%E5%AE%9E%E9%99%85%E8%B4%B9%E7%94%A8%22%5D%0A%20%20%20%20source%20--%3E%7C%22%E8%AE%A2%E9%98%85%22%7C%20subscription%5B%22%E5%A2%9E%E5%8A%A0%E8%AE%A2%E9%98%85%E5%B7%B2%E4%BD%BF%E7%94%A8%E9%A2%9D%E5%BA%A6%22%5D%0A%0A%20%20%20%20balance%20--%3E%20record%5B%22%E8%AE%B0%E5%BD%95%E6%9C%AC%E6%AC%A1%E6%B6%88%E8%B4%B9%22%5D%0A%20%20%20%20subscription%20--%3E%20record%0A%20%20%20%20record%20--%3E%20finish%5B%22%E7%BB%93%E6%9D%9F%22%5D')"
/>

### 资格检查、并发控制与后扣结算

与 New API 普通请求的“预扣 → 实际结算 → 补扣或退款”不同，Sub2API 的普通模型请求主要采用**先检查使用资格、请求完成后再按真实用量扣费**的方式。请求开始前不会为每次调用单独冻结一笔预估费用，而是判断用户当前是否仍然满足调用条件。


在请求真正进入上游之前，Sub2API 会综合检查余额、订阅额度、API Key 使用限制以及用户的平台额度等条件。余额模式下还可以设置**最低余额门槛**，余额低于该值时不再接受新的请求。

同时，Sub2API 会限制一个用户可以同时执行多少个请求。请求如果因为并发已满而等待，在真正获得执行名额以后还会**再次检查余额和订阅状态**，避免排队期间额度已经耗尽却仍然继续请求。

因此可以把它理解为两道控制：

```
并发限制
→ 控制最多有多少个尚未结算的请求同时执行

最低余额 / 额度检查
→ 控制账户剩余资金过低时不再产生新的请求
```

例如普通用户可以限制为：

```
最大并发：5
最低余额：$1
```

即使短时间发送大量请求，也只有少量请求可以同时执行；当先完成的请求扣费后，后续等待中的请求会重新检查余额。

对于需要高并发的用户，也可以相应提高最低余额要求，例如允许数百甚至上千并发时，要求账户提前保有更多余额。**Sub2API 当前的并发限制和最低余额门槛是两个独立机制，并不会自动根据并发数量计算最低余额，但可以在运营配置上配合使用。**

需要注意的是，这种方案属于**风险控制，而不是严格的资金预留**。已经同时通过检查并进入上游的请求，不会因为其中某个请求先完成并扣光余额而自动停止。因此极端高并发下仍然可能出现实际消费超过现有余额的情况；Sub2API 当前普通余额结算路径甚至允许最终余额出现透支。

所以它与 New API 的核心区别可以概括为：

```
New API

预估消费
→ 暂时占用额度
→ 调用模型
→ 按真实用量结算
→ 补扣或退回差额


Sub2API

并发限制 + 使用资格检查
→ 调用模型
→ 获得真实用量
→ 直接扣除实际消费
→ 更新余额和额度状态
```

Sub2API 选择的是一种相对简单的**后扣费方案**：通过并发限制、最低余额门槛以及结算后的快速状态更新控制风险，而不是为每个普通模型请求都维护一套预扣、补扣和退款流程。对于批量图片等成本更容易提前确定的特殊任务，Sub2API 才另外采用余额冻结和最终结算机制。

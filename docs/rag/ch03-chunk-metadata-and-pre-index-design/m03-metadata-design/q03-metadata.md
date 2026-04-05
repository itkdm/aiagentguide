---
title: 3.3.3 常见的 Metadata 有哪些？
summary: 梳理 RAG 中最常见的 metadata 类型，并说明不同字段分别服务于哪些检索和治理需求。
---

# 3.3.3 常见的 Metadata 有哪些？

先给结论：**常见 metadata 并不是越多越好，而是要和检索、过滤、排序、引用、更新、权限这些真实需求对应起来。**

所以这篇最重要的，不是背字段清单，而是理解每类字段到底服务什么。

## 可以先把 metadata 粗分成 5 类

### 1. 来源类

这类字段回答的是：

这段内容从哪里来？

常见包括：

- `doc_id`
- `source`
- `url`
- `source_type`
- `system_name`

这类字段主要服务于：

- 来源展示
- 文档聚合
- 更新定位
- 引用追溯

### 2. 结构类

这类字段回答的是：

这段内容在原始文档里的什么位置？

常见包括：

- `title`
- `section`
- `heading_path`
- `page_number`
- `chunk_index`

这类字段主要服务于：

- 上下文组织
- 引用展示
- 相邻块聚合
- 结构化排序

### 3. 时间和版本类

这类字段回答的是：

它什么时候生效、现在是不是当前版本？

常见包括：

- `version`
- `status`
- `updated_at`
- `effective_from`
- `effective_to`

这类字段主要服务于：

- 版本优先级
- 更新时间排序
- 失效管理
- 当前有效内容筛选

### 4. 访问边界类

这类字段回答的是：

谁可以用它？

常见包括：

- `tenant_id`
- `org_id`
- `department_id`
- `visibility_roles`
- `allowed_users`

这类字段主要服务于：

- 权限过滤
- 多租户隔离
- 企业内部边界控制

### 5. 业务语义类

这类字段回答的是：

这段内容属于哪类业务语义？

常见包括：

- `product_line`
- `doc_type`
- `topic`
- `region`
- `language`

这类字段主要服务于：

- 条件过滤
- 检索缩小范围
- 后续业务聚合和排序

## 一个更直观的示意

```python
chunk = {
    "text": "企业采购订单需走专门审批流程。",
    "metadata": {
        "doc_id": "refund-policy-v3",
        "title": "退款规则",
        "section": "特殊情况说明",
        "source": "/help/refund",
        "source_type": "help_center",
        "version": "v3",
        "status": "active",
        "updated_at": "2026-04-01",
        "tenant_id": "tenant-a",
        "visibility_roles": ["support-manager"],
        "doc_type": "policy",
        "product_line": "enterprise"
    }
}
```

这类对象的重点不是“字段很全”，而是你能看出每一类字段都在服务不同需求。

## 最基础的一组 metadata 通常是什么

如果系统还在早期，不需要一开始就把字段做得特别重，但至少通常应该有：

- `doc_id`
- `title`
- `source`
- `updated_at`
- `chunk_index`

如果系统已经进入真实业务场景，往往还要继续补：

- `version`
- `status`
- `tenant_id`
- `visibility_roles`
- `doc_type`

这通常是从“能用”走向“可治理”的分水岭。

## 为什么字段不是越多越好

因为 metadata 不是越全越高级。

字段太多但没人用，常见后果是：

- 字段名越来越乱
- 同义字段越来越多
- 很多字段有值但没人维护
- 检索和过滤逻辑越来越不可预测

所以 metadata 设计真正要追求的，不是“收集一切”，而是：

- 每个字段都有明确用途
- 字段语义稳定
- 后面的检索和治理链路真的会用到它

## 一个更实用的判断方式

如果你在犹豫某个字段要不要加，可以先问：

1. 这个字段后面会不会进入过滤、排序、聚合或引用？
2. 它是不是当前业务里真实存在的边界？
3. 它能不能被稳定填充，而不是靠人工随缘维护？

如果这三个问题都答不稳，这个字段即使加进去，价值通常也不大。

## 一句话总结

常见 metadata 包括来源类、结构类、时间和版本类、访问边界类、业务语义类。真正重要的不是字段数量，而是这些字段有没有和后面的检索、过滤、引用、更新和治理需求真正对应起来。

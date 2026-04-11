---
title: 11.3.3 一次失败回答上线后，应该如何快速定位问题出在哪一层？
summary: 讲清一次失败案例的快速定位流程，并给出最小可用的排查顺序。
---

# 11.3.3 一次失败回答上线后，应该如何快速定位问题出在哪一层？

先给结论：**定位失败案例的最快路径，是沿链路顺序排查：先看证据有没有进候选，再看证据有没有进入最终上下文，最后看生成是否忠实使用证据。**

很多排查低效，是因为一上来就去改 Prompt 或怀疑模型，而不是先确认：

- 证据到底有没有回来

## 一、最小排查顺序

你可以用下面这四步快速定位：

1. 正确证据是否存在于库中  
2. 证据是否进入召回候选  
3. 证据是否进入最终上下文  
4. 生成是否忠实使用证据  

这四步基本能把大部分问题定位到链路层级。

## 二、如果证据根本没召回

问题更像在检索前段：

- query 理解或 rewrite 出错
- metadata filter 配错
- 检索策略或索引问题
- chunk 切法破坏语义

这时去改 Prompt 基本无效。

## 三、如果证据召回了但没进最终上下文

问题更像在选择和构造层：

- `Rerank` 排序不稳
- `TopK` 太小或截断过早
- 去重或聚合把关键证据挤掉
- 长上下文排序不利于关键证据

这时需要优先检查：

- 重排与上下文构造逻辑

## 四、如果证据进了上下文但回答仍然错误

问题更像在生成层：

- Prompt 约束不够
- 证据组织方式不利于使用
- 模型出现外推或误合并

这时再考虑：

- 加强忠实性约束
- 调整输出结构

## 五、一个更实用的定位记录

更稳的做法是让每个失败案例都留下几项结构化记录：

- `gold_evidence_in_recall`
- `gold_evidence_in_final_context`
- `answer_grounded`
- `primary_failure_stage`

这样你们在排查时不会每次都从头争论。

## 一个最小定位示意

```python
def locate_failure(case):
    if not case["gold_evidence_in_recall"]:
        return "retrieval_or_filter"
    if not case["gold_evidence_in_final_context"]:
        return "rerank_or_context"
    if not case["answer_grounded"]:
        return "prompt_or_generation"
    return "needs_deeper_analysis"
```

## 一句话总结

失败回答的快速定位，核心是“先证据、后生成”。先确认证据是否进入候选和上下文，再判断生成是否忠实使用证据，这样才不会在错误层级上浪费时间。

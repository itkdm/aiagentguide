---
title: 5.4.3 RLHF 和 DPO 分别适合解决什么问题？
summary: 比较两者的训练链路、成本与稳定性，并给出选型判断。
---

# 5.4.3 RLHF 和 DPO 分别适合解决什么问题？

先给结论：**RLHF 更灵活但更复杂，DPO 更直接但更依赖偏好数据质量。** citeturn0search0turn0search1

## 关键差异对比

- **训练链路**  
  RLHF 需要奖励模型与强化学习优化；DPO 直接在偏好对比上训练。citeturn0search0turn0search1

- **稳定性**  
  DPO 训练链路短、稳定性更好；RLHF 可能受奖励模型偏差影响。citeturn0search1turn0search7

- **可塑性**  
  RLHF 能通过奖励函数设计细化偏好；DPO 更依赖数据分布本身。citeturn0search0turn0search1

## 一个工程化选型思路

你可以用这个顺序来判断：

1. **你是否有高质量偏好数据？**  
   如果偏好数据稀缺或质量不稳定，先补数据再谈算法。citeturn0search2

2. **你能否维护复杂链路？**  
   如果团队资源有限，DPO 通常更容易落地。citeturn0search1

3. **你是否需要精细化控制？**  
   如果要细调安全边界或行为策略，RLHF 更灵活。citeturn0search0turn0search7

## 结论收束

**RLHF 像“可定制但重型”的对齐路线，DPO 像“简化但依赖数据”的对齐路线。**

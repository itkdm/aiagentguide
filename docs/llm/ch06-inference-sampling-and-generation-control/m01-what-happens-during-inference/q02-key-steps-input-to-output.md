---
title: 6.1.2 从输入到输出，中间发生了哪些关键步骤？
summary: 逐步拆解推理链路，指出每一步的作用与可控点。
---

# 6.1.2 从输入到输出，中间发生了哪些关键步骤？

先给结论：**推理链路可以拆成“分词 → 嵌入 → Transformer 前向 → logits → 解码 → 输出”，关键控制点在解码与采样。** citeturn3view0turn1search0turn1search7

## 1. 分词与输入编码

输入文本会被分词为 token，然后映射成向量嵌入，作为模型输入。citeturn3view0

## 2. Transformer 前向计算

模型通过多层注意力与前馈网络计算上下文表示，并输出每个 token 的 logits。citeturn3view0turn1search0

自注意力的计算复杂度与序列长度平方相关，这也是长上下文推理昂贵的原因之一。citeturn3view0

## 3. 从 logits 到概率分布

logits 经过 softmax 转成概率分布，然后进入解码阶段。citeturn1search0

## 4. 解码与采样

解码决定“从概率分布里选哪个 token”，常见方法包括：

- greedy decoding：取概率最大 token
- top-k / top-p：在候选子集里采样
- temperature：调整分布平滑度

解码是推理阶段最重要的“可控点”。citeturn1search0turn1search7

## 5. 循环生成

选出的 token 会被追加到上下文里，然后进入下一轮前向计算，直到满足停止条件。citeturn1search0turn1search7

## 小结

你可以把推理理解成“前向 + 解码”的循环。  
模型能力来自前向计算，输出风格主要由解码策略决定。citeturn3view0turn1search0turn1search7

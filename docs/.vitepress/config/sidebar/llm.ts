import type { DefaultTheme } from 'vitepress'

export const llmSidebar: DefaultTheme.Sidebar = {
'/llm/': [
  {
    text: 'LLM',
    collapsed: false,
    items: [
      { text: '概览', link: '/llm/' },
      {
        text: '第 1 章 LLM 全景图与核心认知',
        collapsed: true,
        items: [
          { text: '概览', link: '/llm/ch01-llm-overview-and-core-cognition/' },
          {
            text: '1.1 LLM 的定义与定位',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch01-llm-overview-and-core-cognition/m01-definition-and-positioning/' },
              { text: '1.1.1 什么是 LLM？', link: '/llm/ch01-llm-overview-and-core-cognition/m01-definition-and-positioning/q01-what-is-llm' },
              { text: '1.1.2 大语言模型和传统 NLP 模型有什么本质区别？', link: '/llm/ch01-llm-overview-and-core-cognition/m01-definition-and-positioning/q02-llm-vs-traditional-nlp' },
              { text: '1.1.3 为什么大模型会表现出通用能力？', link: '/llm/ch01-llm-overview-and-core-cognition/m01-definition-and-positioning/q03-why-general-capability' },
              { text: '1.1.4 LLM、生成式 AI、AIGC、基础模型（Foundation Model）是什么关系？', link: '/llm/ch01-llm-overview-and-core-cognition/m01-definition-and-positioning/q04-llm-aigc-foundation-model' },
            ]
          },
          {
            text: '1.2 LLM 的工作本质',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch01-llm-overview-and-core-cognition/m02-how-llm-works/' },
              { text: '1.2.1 为什么说 LLM 本质上是在做“下一个 token 预测”？', link: '/llm/ch01-llm-overview-and-core-cognition/m02-how-llm-works/q01-next-token-prediction' },
              { text: '1.2.2 为什么 LLM 的能力又不止于“下一个 token 预测”？', link: '/llm/ch01-llm-overview-and-core-cognition/m02-how-llm-works/q02-more-than-next-token' },
              { text: '1.2.3 为什么简单的预测任务会涌现出问答、总结、推理、代码生成等能力？', link: '/llm/ch01-llm-overview-and-core-cognition/m02-how-llm-works/q03-emergent-abilities' },
            ]
          },
          {
            text: '1.3 LLM 的能力边界与适用场景',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch01-llm-overview-and-core-cognition/m03-boundaries-and-use-cases/' },
              { text: '1.3.1 LLM 的能力边界在哪里？', link: '/llm/ch01-llm-overview-and-core-cognition/m03-boundaries-and-use-cases/q01-capability-boundaries' },
              { text: '1.3.2 什么场景适合用 LLM，什么场景不适合？', link: '/llm/ch01-llm-overview-and-core-cognition/m03-boundaries-and-use-cases/q02-when-to-use-llm' },
              { text: '1.3.3 为什么 LLM 很强，但并不适合解决所有问题？', link: '/llm/ch01-llm-overview-and-core-cognition/m03-boundaries-and-use-cases/q03-not-for-everything' },
              { text: '1.3.4 如何判断一个问题该不该交给 LLM 处理？', link: '/llm/ch01-llm-overview-and-core-cognition/m03-boundaries-and-use-cases/q04-should-this-go-to-llm' },
            ]
          },
        ]
      },
      {
        text: '第 2 章 Token、Embedding 与语言建模基础',
        collapsed: true,
        items: [
          { text: '概览', link: '/llm/ch02-token-embedding-and-language-modeling/' },
          {
            text: '2.1 Token 是什么',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch02-token-embedding-and-language-modeling/m01-what-is-token/' },
              { text: '2.1.1 什么是 Token？', link: '/llm/ch02-token-embedding-and-language-modeling/m01-what-is-token/q01-what-is-token' },
              { text: '2.1.2 Token 和字、词、子词有什么关系？', link: '/llm/ch02-token-embedding-and-language-modeling/m01-what-is-token/q02-token-word-subword' },
              { text: '2.1.3 为什么 LLM 不直接处理“句子含义”，而是处理 token 序列？', link: '/llm/ch02-token-embedding-and-language-modeling/m01-what-is-token/q03-why-token-sequence' },
              { text: '2.1.4 为什么 token 数量会直接影响上下文长度、成本和输出质量？', link: '/llm/ch02-token-embedding-and-language-modeling/m01-what-is-token/q04-token-count-impact' },
            ]
          },
          {
            text: '2.2 Embedding 与文本表示',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch02-token-embedding-and-language-modeling/m02-embedding-and-representation/' },
              { text: '2.2.1 什么是 Embedding？', link: '/llm/ch02-token-embedding-and-language-modeling/m02-embedding-and-representation/q01-what-is-embedding' },
              { text: '2.2.2 为什么模型需要把 token 映射成向量表示？', link: '/llm/ch02-token-embedding-and-language-modeling/m02-embedding-and-representation/q02-why-vector-representation' },
              { text: '2.2.3 Embedding 在 LLM 里主要负责什么？', link: '/llm/ch02-token-embedding-and-language-modeling/m02-embedding-and-representation/q03-embedding-role-in-llm' },
              { text: '2.2.4 它和 RAG 里的 embedding 有什么异同？', link: '/llm/ch02-token-embedding-and-language-modeling/m02-embedding-and-representation/q04-embedding-vs-rag-embedding' },
            ]
          },
          {
            text: '2.3 语言模型与自回归生成',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch02-token-embedding-and-language-modeling/m03-language-modeling-and-autoregression/' },
              { text: '2.3.1 什么是语言模型（Language Model）？', link: '/llm/ch02-token-embedding-and-language-modeling/m03-language-modeling-and-autoregression/q01-what-is-language-model' },
              { text: '2.3.2 什么是自回归生成（Autoregressive Generation）？', link: '/llm/ch02-token-embedding-and-language-modeling/m03-language-modeling-and-autoregression/q02-what-is-autoregressive-generation' },
              { text: '2.3.3 为什么 LLM 生成文本是一个逐 token 预测过程？', link: '/llm/ch02-token-embedding-and-language-modeling/m03-language-modeling-and-autoregression/q03-why-generate-token-by-token' },
              { text: '2.3.4 为什么模型是“一个 token 一个 token 地生成”，却能看起来像在“思考”？', link: '/llm/ch02-token-embedding-and-language-modeling/m03-language-modeling-and-autoregression/q04-why-it-looks-like-thinking' },
            ]
          },
        ]
      },
      {
        text: '第 3 章 Transformer 与 Attention 机制',
        collapsed: true,
        items: [
          { text: '概览', link: '/llm/ch03-transformer-and-attention/' },
          {
            text: '3.1 Transformer 为什么成为主流架构',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch03-transformer-and-attention/m01-why-transformer/' },
              { text: '3.1.1 Transformer 为什么会成为大模型基础架构？', link: '/llm/ch03-transformer-and-attention/m01-why-transformer/q01-why-transformer-mainstream' },
              { text: '3.1.2 Attention 为什么比 RNN 更适合大规模建模？', link: '/llm/ch03-transformer-and-attention/m01-why-transformer/q02-attention-vs-rnn' },
              { text: '3.1.3 Transformer 相比传统序列模型的核心优势是什么？', link: '/llm/ch03-transformer-and-attention/m01-why-transformer/q03-transformer-core-advantages' },
            ]
          },
          {
            text: '3.2 Attention 机制的核心思想',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch03-transformer-and-attention/m02-attention-core-ideas/' },
              { text: '3.2.1 Self-Attention 是什么？', link: '/llm/ch03-transformer-and-attention/m02-attention-core-ideas/q01-what-is-self-attention' },
              { text: '3.2.2 Self-Attention 为什么能建模长距离依赖？', link: '/llm/ch03-transformer-and-attention/m02-attention-core-ideas/q02-why-self-attention-long-dependency' },
              { text: '3.2.3 Multi-Head Attention 的作用是什么？', link: '/llm/ch03-transformer-and-attention/m02-attention-core-ideas/q03-what-is-multi-head-attention' },
              { text: '3.2.4 为什么多头注意力能提升模型表达能力？', link: '/llm/ch03-transformer-and-attention/m02-attention-core-ideas/q04-why-multi-head-helps' },
            ]
          },
          {
            text: '3.3 位置编码与模型结构',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch03-transformer-and-attention/m03-position-encoding-and-structure/' },
              { text: '3.3.1 Position Encoding 是什么？', link: '/llm/ch03-transformer-and-attention/m03-position-encoding-and-structure/q01-what-is-position-encoding' },
              { text: '3.3.2 RoPE 是什么？为什么它在现代 LLM 中很常见？', link: '/llm/ch03-transformer-and-attention/m03-position-encoding-and-structure/q02-what-is-rope' },
              { text: '3.3.3 Transformer 的基本结构是什么？', link: '/llm/ch03-transformer-and-attention/m03-position-encoding-and-structure/q03-transformer-basic-structure' },
              { text: '3.3.4 Attention、MLP、残差连接、LayerNorm 分别起什么作用？', link: '/llm/ch03-transformer-and-attention/m03-position-encoding-and-structure/q04-components-role' },
            ]
          },
          {
            text: '3.4 三种 Transformer 结构范式',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch03-transformer-and-attention/m04-transformer-paradigms/' },
              { text: '3.4.1 Decoder-only、Encoder-only、Encoder-Decoder 分别适合什么任务？', link: '/llm/ch03-transformer-and-attention/m04-transformer-paradigms/q01-three-paradigms' },
              { text: '3.4.2 为什么今天的大多数 LLM 都是 Decoder-only？', link: '/llm/ch03-transformer-and-attention/m04-transformer-paradigms/q02-why-decoder-only' },
              { text: '3.4.3 BERT、T5、GPT 这几类模型分别代表什么思路？', link: '/llm/ch03-transformer-and-attention/m04-transformer-paradigms/q03-bert-t5-gpt-differences' },
            ]
          },
        ]
      },
      {
        text: '第 4 章 预训练机制',
        collapsed: true,
        items: [
          { text: '概览', link: '/llm/ch04-pretraining/' },
          {
            text: '4.1 什么是预训练',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch04-pretraining/m01-what-is-pretraining/' },
              { text: '4.1.1 什么是预训练（Pretraining）？', link: '/llm/ch04-pretraining/m01-what-is-pretraining/q01-what-is-pretraining' },
              { text: '4.1.2 为什么预训练是 LLM 能力形成的基础？', link: '/llm/ch04-pretraining/m01-what-is-pretraining/q02-why-pretraining-is-foundation' },
              { text: '4.1.3 预训练和传统监督学习有什么区别？', link: '/llm/ch04-pretraining/m01-what-is-pretraining/q03-pretraining-vs-supervised-learning' },
            ]
          },
          {
            text: '4.2 预训练数据与训练目标',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch04-pretraining/m02-data-and-training-objective/' },
              { text: '4.2.1 预训练数据通常来自哪里？', link: '/llm/ch04-pretraining/m02-data-and-training-objective/q01-where-pretraining-data-comes-from' },
              { text: '4.2.2 为什么数据规模对 LLM 很重要？', link: '/llm/ch04-pretraining/m02-data-and-training-objective/q02-why-data-scale-matters' },
              { text: '4.2.3 预训练目标为什么通常是 next token prediction？', link: '/llm/ch04-pretraining/m02-data-and-training-objective/q03-why-next-token-objective' },
              { text: '4.2.4 什么是 Causal LM？', link: '/llm/ch04-pretraining/m02-data-and-training-objective/q04-what-is-causal-lm' },
            ]
          },
          {
            text: '4.3 Scaling Law 与训练规模',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch04-pretraining/m03-scaling-law-and-training-scale/' },
              { text: '4.3.1 什么是 Scaling Law？', link: '/llm/ch04-pretraining/m03-scaling-law-and-training-scale/q01-what-is-scaling-law' },
              { text: '4.3.2 模型参数、数据量、训练算力之间是什么关系？', link: '/llm/ch04-pretraining/m03-scaling-law-and-training-scale/q02-params-data-compute-relationship' },
              { text: '4.3.3 为什么不是参数越大效果就一定越好？', link: '/llm/ch04-pretraining/m03-scaling-law-and-training-scale/q03-why-bigger-not-always-better' },
              { text: '4.3.4 为什么高质量数据有时比盲目扩参更重要？', link: '/llm/ch04-pretraining/m03-scaling-law-and-training-scale/q04-why-data-quality-matters' },
            ]
          },
          {
            text: '4.4 预训练带来的能力与局限',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch04-pretraining/m04-abilities-and-limitations-of-pretraining/' },
              { text: '4.4.1 预训练为什么能带来语言理解与生成能力？', link: '/llm/ch04-pretraining/m04-abilities-and-limitations-of-pretraining/q01-why-pretraining-brings-language-ability' },
              { text: '4.4.2 为什么预训练模型“会续写”，但不一定“会做助手”？', link: '/llm/ch04-pretraining/m04-abilities-and-limitations-of-pretraining/q02-can-complete-but-not-assistant' },
              { text: '4.4.3 为什么预训练阶段学到的知识会过时？', link: '/llm/ch04-pretraining/m04-abilities-and-limitations-of-pretraining/q03-why-pretraining-knowledge-gets-stale' },
            ]
          },
        ]
      },
      {
        text: '第 5 章 指令微调与对齐',
        collapsed: true,
        items: [
          { text: '概览', link: '/llm/ch05-instruction-tuning-and-alignment/' },
          {
            text: '5.1 为什么预训练后还不够',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch05-instruction-tuning-and-alignment/m01-why-pretraining-is-not-enough/' },
              { text: '5.1.1 为什么预训练好的模型还不能直接拿来做助手？', link: '/llm/ch05-instruction-tuning-and-alignment/m01-why-pretraining-is-not-enough/q01-why-pretrained-model-not-ready' },
              { text: '5.1.2 为什么“会补全文本”和“会遵循用户意图”是两件事？', link: '/llm/ch05-instruction-tuning-and-alignment/m01-why-pretraining-is-not-enough/q02-completion-vs-following-intent' },
              { text: '5.1.3 为什么指令跟随能力需要单独训练？', link: '/llm/ch05-instruction-tuning-and-alignment/m01-why-pretraining-is-not-enough/q03-why-instruction-following-needs-training' },
            ]
          },
          {
            text: '5.2 SFT 与 Instruction Tuning',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch05-instruction-tuning-and-alignment/m02-sft-and-instruction-tuning/' },
              { text: '5.2.1 什么是 SFT（Supervised Fine-Tuning）？', link: '/llm/ch05-instruction-tuning-and-alignment/m02-sft-and-instruction-tuning/q01-what-is-sft' },
              { text: '5.2.2 什么是 Instruction Tuning？', link: '/llm/ch05-instruction-tuning-and-alignment/m02-sft-and-instruction-tuning/q02-what-is-instruction-tuning' },
              { text: '5.2.3 什么是 In-Context Learning？', link: '/llm/ch05-instruction-tuning-and-alignment/m02-sft-and-instruction-tuning/q03-what-is-in-context-learning' },
              { text: '5.2.4 为什么指令微调能让模型更像“助手”？', link: '/llm/ch05-instruction-tuning-and-alignment/m02-sft-and-instruction-tuning/q04-why-instruction-tuning-helps' },
              { text: '5.2.5 In-Context Learning 和微调分别适合解决什么问题？', link: '/llm/ch05-instruction-tuning-and-alignment/m02-sft-and-instruction-tuning/q05-icl-vs-finetuning' },
            ]
          },
          {
            text: '5.3 对齐（Alignment）',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch05-instruction-tuning-and-alignment/m03-alignment/' },
              { text: '5.3.1 什么是对齐（Alignment）？', link: '/llm/ch05-instruction-tuning-and-alignment/m03-alignment/q01-what-is-alignment' },
              { text: '5.3.2 为什么大模型不仅要“能力强”，还要“行为可控”？', link: '/llm/ch05-instruction-tuning-and-alignment/m03-alignment/q02-why-behavior-control-matters' },
              { text: '5.3.3 对齐为什么会影响模型风格、安全性和可用性？', link: '/llm/ch05-instruction-tuning-and-alignment/m03-alignment/q03-alignment-affects-ux' },
            ]
          },
          {
            text: '5.4 RLHF 与 DPO',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch05-instruction-tuning-and-alignment/m04-rlhf-and-dpo/' },
              { text: '5.4.1 什么是 RLHF？', link: '/llm/ch05-instruction-tuning-and-alignment/m04-rlhf-and-dpo/q01-what-is-rlhf' },
              { text: '5.4.2 什么是 DPO？', link: '/llm/ch05-instruction-tuning-and-alignment/m04-rlhf-and-dpo/q02-what-is-dpo' },
              { text: '5.4.3 RLHF 和 DPO 分别适合解决什么问题？', link: '/llm/ch05-instruction-tuning-and-alignment/m04-rlhf-and-dpo/q03-rlhf-vs-dpo' },
              { text: '5.4.4 为什么对齐方法会直接影响模型的用户体验？', link: '/llm/ch05-instruction-tuning-and-alignment/m04-rlhf-and-dpo/q04-alignment-methods-impact-ux' },
            ]
          },
        ]
      },
      {
        text: '第 6 章 推理、采样与生成控制',
        collapsed: true,
        items: [
          { text: '概览', link: '/llm/ch06-inference-sampling-and-generation-control/' },
          {
            text: '6.1 模型推理时到底在做什么',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch06-inference-sampling-and-generation-control/m01-what-happens-during-inference/' },
              { text: '6.1.1 LLM 推理时到底在做什么？', link: '/llm/ch06-inference-sampling-and-generation-control/m01-what-happens-during-inference/q01-what-happens-during-inference' },
              { text: '6.1.2 从输入到输出，中间发生了哪些关键步骤？', link: '/llm/ch06-inference-sampling-and-generation-control/m01-what-happens-during-inference/q02-key-steps-input-to-output' },
              { text: '6.1.3 为什么推理阶段虽然不训练参数，但仍然很耗资源？', link: '/llm/ch06-inference-sampling-and-generation-control/m01-what-happens-during-inference/q03-why-inference-is-expensive' },
            ]
          },
          {
            text: '6.2 采样与解码策略',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch06-inference-sampling-and-generation-control/m02-sampling-and-decoding/' },
              { text: '6.2.1 什么是 Temperature？', link: '/llm/ch06-inference-sampling-and-generation-control/m02-sampling-and-decoding/q01-what-is-temperature' },
              { text: '6.2.2 什么是 Top-k、Top-p？', link: '/llm/ch06-inference-sampling-and-generation-control/m02-sampling-and-decoding/q02-what-are-topk-topp' },
              { text: '6.2.3 Temperature 和 Top-p 有什么区别？', link: '/llm/ch06-inference-sampling-and-generation-control/m02-sampling-and-decoding/q03-temperature-vs-topp' },
              { text: '6.2.4 什么是 Greedy Decoding？', link: '/llm/ch06-inference-sampling-and-generation-control/m02-sampling-and-decoding/q04-what-is-greedy-decoding' },
              { text: '6.2.5 为什么同一个问题模型每次回答可能不同？', link: '/llm/ch06-inference-sampling-and-generation-control/m02-sampling-and-decoding/q05-why-answers-differ' },
            ]
          },
          {
            text: '6.3 输出控制与使用场景',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch06-inference-sampling-and-generation-control/m03-output-control-and-use-cases/' },
              { text: '6.3.1 什么场景适合确定性输出，什么场景适合发散性输出？', link: '/llm/ch06-inference-sampling-and-generation-control/m03-output-control-and-use-cases/q01-deterministic-vs-diverse-output' },
              { text: '6.3.2 为什么创意生成和事实问答适合不同的采样参数？', link: '/llm/ch06-inference-sampling-and-generation-control/m03-output-control-and-use-cases/q02-creative-vs-factual-sampling' },
              { text: '6.3.3 如何根据任务类型调整生成策略？', link: '/llm/ch06-inference-sampling-and-generation-control/m03-output-control-and-use-cases/q03-adjust-generation-strategy-by-task' },
            ]
          },
          {
            text: '6.4 推理效率优化',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch06-inference-sampling-and-generation-control/m04-inference-efficiency/' },
              { text: '6.4.1 什么是 KV Cache？', link: '/llm/ch06-inference-sampling-and-generation-control/m04-inference-efficiency/q01-what-is-kv-cache' },
              { text: '6.4.2 KV Cache 为什么能提升推理效率？', link: '/llm/ch06-inference-sampling-and-generation-control/m04-inference-efficiency/q02-why-kv-cache-helps' },
              { text: '6.4.3 为什么长上下文会导致推理成本变高？', link: '/llm/ch06-inference-sampling-and-generation-control/m04-inference-efficiency/q03-why-long-context-costs-more' },
              { text: '6.4.4 为什么输出越长，延迟和成本通常越高？', link: '/llm/ch06-inference-sampling-and-generation-control/m04-inference-efficiency/q04-why-longer-output-costs-more' },
            ]
          },
        ]
      },
      {
        text: '第 7 章 上下文窗口、记忆与长文本问题',
        collapsed: true,
        items: [
          { text: '概览', link: '/llm/ch07-context-window-memory-and-long-context/' },
          {
            text: '7.1 上下文窗口是什么',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch07-context-window-memory-and-long-context/m01-what-is-context-window/' },
              { text: '7.1.1 什么是上下文窗口（Context Window）？', link: '/llm/ch07-context-window-memory-and-long-context/m01-what-is-context-window/q01-what-is-context-window' },
              { text: '7.1.2 上下文窗口为什么会限制模型一次能处理的信息量？', link: '/llm/ch07-context-window-memory-and-long-context/m01-what-is-context-window/q02-why-context-window-limits-information' },
              { text: '7.1.3 为什么上下文长度是 LLM 产品设计中的关键约束？', link: '/llm/ch07-context-window-memory-and-long-context/m01-what-is-context-window/q03-why-context-window-is-key-constraint' },
            ]
          },
          {
            text: '7.2 模型的“记忆”到底是什么',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch07-context-window-memory-and-long-context/m02-what-memory-means/' },
              { text: '7.2.1 模型的“记忆”到底指什么？', link: '/llm/ch07-context-window-memory-and-long-context/m02-what-memory-means/q01-what-does-memory-mean' },
              { text: '7.2.2 参数记忆和上下文记忆有什么区别？', link: '/llm/ch07-context-window-memory-and-long-context/m02-what-memory-means/q02-param-memory-vs-context-memory' },
              { text: '7.2.3 为什么模型“记得某些知识”不等于它能稳定调用这些知识？', link: '/llm/ch07-context-window-memory-and-long-context/m02-what-memory-means/q03-knowing-vs-using-knowledge' },
            ]
          },
          {
            text: '7.3 长上下文问题',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch07-context-window-memory-and-long-context/m03-long-context-problems/' },
              { text: '7.3.1 为什么上下文越长不一定效果越好？', link: '/llm/ch07-context-window-memory-and-long-context/m03-long-context-problems/q01-longer-context-not-always-better' },
              { text: '7.3.2 什么是 lost in the middle？', link: '/llm/ch07-context-window-memory-and-long-context/m03-long-context-problems/q02-what-is-lost-in-the-middle' },
              { text: '7.3.3 长上下文能力为什么很难真正做好？', link: '/llm/ch07-context-window-memory-and-long-context/m03-long-context-problems/q03-why-long-context-is-hard' },
              { text: '7.3.4 长文本输入会带来哪些典型问题？', link: '/llm/ch07-context-window-memory-and-long-context/m03-long-context-problems/q04-typical-long-text-problems' },
            ]
          },
          {
            text: '7.4 长上下文与 RAG 的关系',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch07-context-window-memory-and-long-context/m04-long-context-vs-rag/' },
              { text: '7.4.1 为什么很多长上下文问题最终还是需要 RAG？', link: '/llm/ch07-context-window-memory-and-long-context/m04-long-context-vs-rag/q01-why-long-context-still-needs-rag' },
              { text: '7.4.2 长上下文和 RAG 分别适合什么场景？', link: '/llm/ch07-context-window-memory-and-long-context/m04-long-context-vs-rag/q02-long-context-vs-rag-use-cases' },
              { text: '7.4.3 为什么“上下文窗口很大”不等于“就不需要检索”？', link: '/llm/ch07-context-window-memory-and-long-context/m04-long-context-vs-rag/q03-big-context-not-equal-no-retrieval' },
            ]
          },
        ]
      },
      {
        text: '第 8 章 Prompt、工具调用与 Agent 基础',
        collapsed: true,
        items: [
          { text: '概览', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/' },
          {
            text: '8.1 Prompt 的基本作用',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m01-prompt-basics/' },
              { text: '8.1.1 什么是 Prompt？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m01-prompt-basics/q01-what-is-prompt' },
              { text: '8.1.2 Prompt Engineering 的本质是什么？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m01-prompt-basics/q02-what-is-prompt-engineering' },
              { text: '8.1.3 为什么 Prompt 很重要，但又不能神化 Prompt？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m01-prompt-basics/q03-why-prompt-matters-but-not-magical' },
            ]
          },
          {
            text: '8.2 Prompt 的结构与常见方法',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m02-prompt-structure-and-methods/' },
              { text: '8.2.1 System Prompt、User Prompt、Tool Prompt 分别起什么作用？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m02-prompt-structure-and-methods/q01-system-user-tool-prompt' },
              { text: '8.2.2 Zero-shot、Few-shot、Chain-of-Thought 分别是什么？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m02-prompt-structure-and-methods/q02-zero-shot-few-shot-cot' },
              { text: '8.2.3 为什么不同任务类型需要不同 Prompt 结构？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m02-prompt-structure-and-methods/q03-why-different-tasks-need-different-structures' },
              { text: '8.2.4 为什么 Prompt 设计会直接影响模型输出风格和稳定性？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m02-prompt-structure-and-methods/q04-why-prompt-affects-style-and-stability' },
            ]
          },
          {
            text: '8.3 工具调用',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m03-tool-calling/' },
              { text: '8.3.1 什么是 Function Calling / Tool Calling？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m03-tool-calling/q01-what-is-tool-calling' },
              { text: '8.3.2 LLM 为什么需要调用工具？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m03-tool-calling/q02-why-llm-needs-tools' },
              { text: '8.3.3 哪些能力适合交给模型，哪些能力应该交给工具？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m03-tool-calling/q03-model-vs-tool-boundaries' },
              { text: '8.3.4 为什么工具调用能显著降低模型“硬猜”的概率？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m03-tool-calling/q04-why-tool-calling-reduces-guessing' },
            ]
          },
          {
            text: '8.4 Agent 基础',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m04-agent-basics/' },
              { text: '8.4.1 Agent 和普通聊天机器人有什么区别？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m04-agent-basics/q01-agent-vs-chatbot' },
              { text: '8.4.2 Agent 为什么通常建立在 LLM + 工具 + 记忆 / RAG 之上？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m04-agent-basics/q02-agent-built-on-llm-tools-memory' },
              { text: '8.4.3 Workflow 和 Agent 的边界在哪里？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m04-agent-basics/q03-workflow-vs-agent' },
              { text: '8.4.4 什么情况下不该把系统设计成 Agent？', link: '/llm/ch08-prompt-tool-calling-and-agent-basics/m04-agent-basics/q04-when-not-to-build-agent' },
            ]
          },
        ]
      },
      {
        text: '第 9 章 幻觉、稳定性与常见问题',
        collapsed: true,
        items: [
          { text: '概览', link: '/llm/ch09-hallucination-stability-and-common-issues/' },
          {
            text: '9.1 什么是幻觉',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch09-hallucination-stability-and-common-issues/m01-what-is-hallucination/' },
              { text: '9.1.1 什么是幻觉（Hallucination）？', link: '/llm/ch09-hallucination-stability-and-common-issues/m01-what-is-hallucination/q01-what-is-hallucination' },
              { text: '9.1.2 为什么 LLM 会幻觉？', link: '/llm/ch09-hallucination-stability-and-common-issues/m01-what-is-hallucination/q02-why-llm-hallucinates' },
              { text: '9.1.3 幻觉和“知识过时”有什么区别？', link: '/llm/ch09-hallucination-stability-and-common-issues/m01-what-is-hallucination/q03-hallucination-vs-stale-knowledge' },
              { text: '9.1.4 为什么模型有时会一本正经地胡说八道？', link: '/llm/ch09-hallucination-stability-and-common-issues/m01-what-is-hallucination/q04-why-confidently-wrong' },
            ]
          },
          {
            text: '9.2 稳定性问题',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch09-hallucination-stability-and-common-issues/m02-stability-problems/' },
              { text: '9.2.1 为什么同一个问题有时答得很好，有时答得很差？', link: '/llm/ch09-hallucination-stability-and-common-issues/m02-stability-problems/q01-why-same-question-different-quality' },
              { text: '9.2.2 什么是随机性，什么是系统性错误？', link: '/llm/ch09-hallucination-stability-and-common-issues/m02-stability-problems/q02-random-vs-systematic-errors' },
              { text: '9.2.3 为什么模型输出会受 Prompt、采样参数、上下文组织影响？', link: '/llm/ch09-hallucination-stability-and-common-issues/m02-stability-problems/q03-why-output-depends-on-prompt-and-context' },
              { text: '9.2.4 为什么模型在边界问题上更容易不稳定？', link: '/llm/ch09-hallucination-stability-and-common-issues/m02-stability-problems/q04-why-boundary-cases-are-unstable' },
            ]
          },
          {
            text: '9.3 如何降低错误',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch09-hallucination-stability-and-common-issues/m03-how-to-reduce-errors/' },
              { text: '9.3.1 如何降低幻觉？', link: '/llm/ch09-hallucination-stability-and-common-issues/m03-how-to-reduce-errors/q01-how-to-reduce-hallucination' },
              { text: '9.3.2 为什么“加 Prompt”不能解决所有问题？', link: '/llm/ch09-hallucination-stability-and-common-issues/m03-how-to-reduce-errors/q02-why-prompt-not-enough' },
              { text: '9.3.3 哪些问题应该靠模型解决，哪些问题应该靠 RAG / 工具解决？', link: '/llm/ch09-hallucination-stability-and-common-issues/m03-how-to-reduce-errors/q03-model-vs-rag-vs-tools' },
              { text: '9.3.4 为什么真实系统里要把“模型能力”和“系统补偿能力”结合起来看？', link: '/llm/ch09-hallucination-stability-and-common-issues/m03-how-to-reduce-errors/q04-model-and-system-compensation' },
            ]
          },
        ]
      },
      {
        text: '第 10 章 LLM 评测体系',
        collapsed: true,
        items: [
          { text: '概览', link: '/llm/ch10-evaluation/' },
          {
            text: '10.1 为什么不能只靠主观感觉评模型',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch10-evaluation/m01-why-not-judge-by-feel/' },
              { text: '10.1.1 为什么 LLM 不能只看感觉好不好用？', link: '/llm/ch10-evaluation/m01-why-not-judge-by-feel/q01-why-not-judge-by-feel' },
              { text: '10.1.2 为什么“看起来聪明”不等于“真实可用”？', link: '/llm/ch10-evaluation/m01-why-not-judge-by-feel/q02-smart-looking-not-equal-usable' },
              { text: '10.1.3 为什么模型评测必须区分离线能力和线上效果？', link: '/llm/ch10-evaluation/m01-why-not-judge-by-feel/q03-offline-vs-online-evaluation' },
            ]
          },
          {
            text: '10.2 常见评测方式与 Benchmark',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch10-evaluation/m02-benchmarks-and-common-evals/' },
              { text: '10.2.1 预训练模型常见评测方式有哪些？', link: '/llm/ch10-evaluation/m02-benchmarks-and-common-evals/q01-pretraining-model-evals' },
              { text: '10.2.2 指令模型常见评测方式有哪些？', link: '/llm/ch10-evaluation/m02-benchmarks-and-common-evals/q02-instruction-model-evals' },
              { text: '10.2.3 什么是 Benchmark？', link: '/llm/ch10-evaluation/m02-benchmarks-and-common-evals/q03-what-is-benchmark' },
              { text: '10.2.4 MMLU、GSM8K、HumanEval 分别在测什么？', link: '/llm/ch10-evaluation/m02-benchmarks-and-common-evals/q04-what-do-mmlu-gsm8k-humaneval-measure' },
              { text: '10.2.5 为什么 benchmark 分高不一定代表真实业务效果就好？', link: '/llm/ch10-evaluation/m02-benchmarks-and-common-evals/q05-why-benchmark-score-not-enough' },
            ]
          },
          {
            text: '10.3 LLM-as-a-Judge 与评测实践',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch10-evaluation/m03-llm-as-a-judge-and-practice/' },
              { text: '10.3.1 什么是 LLM-as-a-Judge？', link: '/llm/ch10-evaluation/m03-llm-as-a-judge-and-practice/q01-what-is-llm-as-a-judge' },
              { text: '10.3.2 主观评测和客观评测分别适合什么场景？', link: '/llm/ch10-evaluation/m03-llm-as-a-judge-and-practice/q02-subjective-vs-objective-eval' },
              { text: '10.3.3 为什么真实产品里通常需要多种评测方式结合？', link: '/llm/ch10-evaluation/m03-llm-as-a-judge-and-practice/q03-why-combine-evals' },
              { text: '10.3.4 如何避免只追 benchmark 而忽略业务目标？', link: '/llm/ch10-evaluation/m03-llm-as-a-judge-and-practice/q04-avoid-benchmark-only-optimization' },
            ]
          },
          {
            text: '10.4 线上模型评估',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch10-evaluation/m04-online-evaluation/' },
              { text: '10.4.1 线上模型应该监控哪些指标？', link: '/llm/ch10-evaluation/m04-online-evaluation/q01-online-metrics' },
              { text: '10.4.2 如何判断模型质量下降是模型问题、Prompt 问题还是数据问题？', link: '/llm/ch10-evaluation/m04-online-evaluation/q02-how-to-locate-quality-drop' },
              { text: '10.4.3 为什么线上监控对 LLM 产品至关重要？', link: '/llm/ch10-evaluation/m04-online-evaluation/q03-why-online-monitoring-matters' },
            ]
          },
        ]
      },
      {
        text: '第 11 章 LLM 优化与落地',
        collapsed: true,
        items: [
          { text: '概览', link: '/llm/ch11-optimization-and-production/' },
          {
            text: '11.1 模型、Prompt 与 RAG 的选择',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch11-optimization-and-production/m01-model-prompt-rag-choices/' },
              { text: '11.1.1 什么时候该换模型，什么时候该改 Prompt，什么时候该加 RAG？', link: '/llm/ch11-optimization-and-production/m01-model-prompt-rag-choices/q01-when-to-switch-model-prompt-rag' },
              { text: '11.1.2 为什么不是所有问题都值得微调？', link: '/llm/ch11-optimization-and-production/m01-model-prompt-rag-choices/q02-why-not-everything-needs-finetuning' },
              { text: '11.1.3 为什么很多业务问题最后是系统设计问题，而不只是模型问题？', link: '/llm/ch11-optimization-and-production/m01-model-prompt-rag-choices/q03-why-business-issues-are-system-design' },
            ]
          },
          {
            text: '11.2 效果、延迟与成本的平衡',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch11-optimization-and-production/m02-balance-quality-latency-cost/' },
              { text: '11.2.1 如何平衡效果、延迟和成本？', link: '/llm/ch11-optimization-and-production/m02-balance-quality-latency-cost/q01-balance-quality-latency-cost' },
              { text: '11.2.2 为什么模型越强，往往成本也越高？', link: '/llm/ch11-optimization-and-production/m02-balance-quality-latency-cost/q02-why-stronger-models-cost-more' },
              { text: '11.2.3 如何根据业务目标设计“够用”的模型方案？', link: '/llm/ch11-optimization-and-production/m02-balance-quality-latency-cost/q03-design-good-enough-solution' },
            ]
          },
          {
            text: '11.3 常见优化手段',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch11-optimization-and-production/m03-common-optimization-methods/' },
              { text: '11.3.1 什么是量化（Quantization）？', link: '/llm/ch11-optimization-and-production/m03-common-optimization-methods/q01-what-is-quantization' },
              { text: '11.3.2 什么是蒸馏（Distillation）？', link: '/llm/ch11-optimization-and-production/m03-common-optimization-methods/q02-what-is-distillation' },
              { text: '11.3.3 什么是 LoRA / PEFT？', link: '/llm/ch11-optimization-and-production/m03-common-optimization-methods/q03-what-is-lora-peft' },
              { text: '11.3.4 它们分别更适合优化什么问题？', link: '/llm/ch11-optimization-and-production/m03-common-optimization-methods/q04-what-problems-they-optimize' },
            ]
          },
          {
            text: '11.4 微调与系统增强',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch11-optimization-and-production/m04-finetuning-vs-system-enhancement/' },
              { text: '11.4.1 微调和 RAG 应该怎么选？', link: '/llm/ch11-optimization-and-production/m04-finetuning-vs-system-enhancement/q01-finetuning-vs-rag' },
              { text: '11.4.2 小模型、大模型、开源模型、闭源模型分别适合什么场景？', link: '/llm/ch11-optimization-and-production/m04-finetuning-vs-system-enhancement/q02-small-big-open-closed-models' },
              { text: '11.4.3 企业落地 LLM 时最常见的风险是什么？', link: '/llm/ch11-optimization-and-production/m04-finetuning-vs-system-enhancement/q03-common-enterprise-risks' },
              { text: '11.4.4 如何做安全、权限、审计和观测？', link: '/llm/ch11-optimization-and-production/m04-finetuning-vs-system-enhancement/q04-security-permission-audit-observability' },
            ]
          },
        ]
      },
      {
        text: '第 12 章 开源模型与模型选型',
        collapsed: true,
        items: [
          { text: '概览', link: '/llm/ch12-open-source-models-and-selection/' },
          {
            text: '12.1 开源与闭源模型的选择',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch12-open-source-models-and-selection/m01-open-vs-closed-models/' },
              { text: '12.1.1 闭源模型和开源模型怎么选？', link: '/llm/ch12-open-source-models-and-selection/m01-open-vs-closed-models/q01-how-to-choose-open-vs-closed' },
              { text: '12.1.2 为什么“效果最好”不一定等于“业务最合适”？', link: '/llm/ch12-open-source-models-and-selection/m01-open-vs-closed-models/q02-best-not-always-best-fit' },
              { text: '12.1.3 开源和闭源在成本、控制权、稳定性上分别有什么取舍？', link: '/llm/ch12-open-source-models-and-selection/m01-open-vs-closed-models/q03-open-vs-closed-tradeoffs' },
            ]
          },
          {
            text: '12.2 模型类型的区分',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch12-open-source-models-and-selection/m02-model-type-differences/' },
              { text: '12.2.1 Base Model 和 Instruct Model 有什么区别？', link: '/llm/ch12-open-source-models-and-selection/m02-model-type-differences/q01-base-vs-instruct' },
              { text: '12.2.2 通用模型和垂类模型怎么选？', link: '/llm/ch12-open-source-models-and-selection/m02-model-type-differences/q02-general-vs-domain-model' },
              { text: '12.2.3 为什么不同模型的“默认行为风格”差异很大？', link: '/llm/ch12-open-source-models-and-selection/m02-model-type-differences/q03-why-default-behavior-differs' },
            ]
          },
          {
            text: '12.3 模型选型维度',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch12-open-source-models-and-selection/m03-model-selection-dimensions/' },
              { text: '12.3.1 选择模型时应该看哪些维度？', link: '/llm/ch12-open-source-models-and-selection/m03-model-selection-dimensions/q01-selection-dimensions' },
              { text: '12.3.2 参数量是否仍然是核心指标？', link: '/llm/ch12-open-source-models-and-selection/m03-model-selection-dimensions/q02-are-params-still-core-metric' },
              { text: '12.3.3 上下文长度、推理速度、价格、稳定性该怎么平衡？', link: '/llm/ch12-open-source-models-and-selection/m03-model-selection-dimensions/q03-how-to-balance-context-speed-price-stability' },
              { text: '12.3.4 什么场景适合部署小模型？', link: '/llm/ch12-open-source-models-and-selection/m03-model-selection-dimensions/q04-when-small-models-fit' },
              { text: '12.3.5 什么场景必须用强模型？', link: '/llm/ch12-open-source-models-and-selection/m03-model-selection-dimensions/q05-when-strong-models-are-required' },
            ]
          },
        ]
      },
      {
        text: '第 13 章 LLM 与 RAG、Agent 的关系',
        collapsed: true,
        items: [
          { text: '概览', link: '/llm/ch13-llm-rag-and-agent-relationship/' },
          {
            text: '13.1 LLM 与 RAG 的关系',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch13-llm-rag-and-agent-relationship/m01-llm-and-rag/' },
              { text: '13.1.1 为什么有了 LLM 还需要 RAG？', link: '/llm/ch13-llm-rag-and-agent-relationship/m01-llm-and-rag/q01-why-llm-still-needs-rag' },
              { text: '13.1.2 为什么很多“知识型问题”只靠 LLM 不够？', link: '/llm/ch13-llm-rag-and-agent-relationship/m01-llm-and-rag/q02-why-knowledge-problems-need-more-than-llm' },
              { text: '13.1.3 哪些问题更适合纯 LLM，哪些更适合 LLM + RAG？', link: '/llm/ch13-llm-rag-and-agent-relationship/m01-llm-and-rag/q03-pure-llm-vs-llm-plus-rag' },
            ]
          },
          {
            text: '13.2 RAG 与 Agent 的关系',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch13-llm-rag-and-agent-relationship/m02-rag-and-agent/' },
              { text: '13.2.1 为什么有了 RAG 还不等于 Agent？', link: '/llm/ch13-llm-rag-and-agent-relationship/m02-rag-and-agent/q01-why-rag-is-not-agent' },
              { text: '13.2.2 RAG 和 Agent 的核心差别是什么？', link: '/llm/ch13-llm-rag-and-agent-relationship/m02-rag-and-agent/q02-rag-vs-agent-core-difference' },
              { text: '13.2.3 为什么 Agent 更强调任务分解、工具调用和执行闭环？', link: '/llm/ch13-llm-rag-and-agent-relationship/m02-rag-and-agent/q03-why-agent-emphasizes-closed-loop' },
            ]
          },
          {
            text: '13.3 三者在实际系统中的分工',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch13-llm-rag-and-agent-relationship/m03-division-of-labor-in-real-systems/' },
              { text: '13.3.1 LLM、RAG、Tool Use、Workflow、Agent 之间是什么关系？', link: '/llm/ch13-llm-rag-and-agent-relationship/m03-division-of-labor-in-real-systems/q01-relationships-among-components' },
              { text: '13.3.2 一个实际 AI 应用中，哪些问题应该由 LLM 解决，哪些交给 RAG，哪些交给工具？', link: '/llm/ch13-llm-rag-and-agent-relationship/m03-division-of-labor-in-real-systems/q02-what-to-give-llm-rag-tools' },
              { text: '13.3.3 什么时候系统该从“纯 LLM”升级到“RAG”？', link: '/llm/ch13-llm-rag-and-agent-relationship/m03-division-of-labor-in-real-systems/q03-when-to-upgrade-to-rag' },
              { text: '13.3.4 什么时候系统该从“RAG”升级到“Agent”？', link: '/llm/ch13-llm-rag-and-agent-relationship/m03-division-of-labor-in-real-systems/q04-when-to-upgrade-to-agent' },
            ]
          },
        ]
      },
      {
        text: '第 14 章 LLM 常见误区与面试高频问题',
        collapsed: true,
        items: [
          { text: '概览', link: '/llm/ch14-misconceptions-and-interview-high-frequency/' },
          {
            text: '14.1 常见误区',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m01-common-misconceptions/' },
              { text: '14.1.1 LLM 只是“更大的 NLP 模型”吗？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m01-common-misconceptions/q01-llm-just-bigger-nlp' },
              { text: '14.1.2 参数越大就一定越强吗？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m01-common-misconceptions/q02-bigger-params-always-better' },
              { text: '14.1.3 Prompt 写得好是不是就能解决大部分问题？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m01-common-misconceptions/q03-prompt-solves-most-problems' },
              { text: '14.1.4 为什么“知道概念”不等于“理解系统”？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m01-common-misconceptions/q04-knowing-concepts-not-equal-system-thinking' },
              { text: '14.1.5 为什么很多 LLM 问题最后都要回到数据、对齐、推理和系统设计？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m01-common-misconceptions/q05-back-to-data-alignment-inference-system' },
            ]
          },
          {
            text: '14.2 面试表达与方法论',
            collapsed: true,
            items: [
              { text: '概览', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m02-interview-expression-and-methodology/' },
              { text: '14.2.1 面试中讲 LLM，为什么不能只背 Transformer？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m02-interview-expression-and-methodology/q01-why-not-just-reciting-transformer' },
              { text: '14.2.2 怎么把 LLM 问题讲出层次感和工程感？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m02-interview-expression-and-methodology/q02-how-to-answer-with-depth-and-engineering' },
              { text: '14.2.3 回答 LLM 面试题时，如何兼顾原理、工程和业务视角？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m02-interview-expression-and-methodology/q03-how-to-balance-principles-engineering-business' },
              { text: '14.2.4 如何建立一套稳定的 LLM 面试作答框架？', link: '/llm/ch14-misconceptions-and-interview-high-frequency/m02-interview-expression-and-methodology/q04-how-to-build-stable-answer-framework' },
            ]
          },
        ]
      },
    ]
  }
],
}

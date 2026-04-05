from pathlib import Path

ROOT = Path("docs/llm")
CONFIG_PATH = Path("docs/.vitepress/config.mts")
CHAPTERS = [
    {
        "slug": "ch01-llm-overview-and-core-cognition",
        "title": "第 1 章 LLM 全景图与核心认知",
        "goal": "建立对大语言模型的整体理解，知道它是什么，不是什么。",
        "modules": [
            {
                "slug": "m01-definition-and-positioning",
                "title": "1.1 LLM 的定义与定位",
                "intro": "这部分会先帮你建立对大语言模型的基本认识，回答它是什么、和传统 NLP 模型有什么不同，以及它和生成式 AI、AIGC、基础模型之间到底是什么关系。",
                "questions": [
                    ("q01-what-is-llm", "1.1.1 什么是 LLM？"),
                    ("q02-llm-vs-traditional-nlp", "1.1.2 大语言模型和传统 NLP 模型有什么本质区别？"),
                    ("q03-why-general-capability", "1.1.3 为什么大模型会表现出通用能力？"),
                    ("q04-llm-aigc-foundation-model", "1.1.4 LLM、生成式 AI、AIGC、基础模型（Foundation Model）是什么关系？"),
                ],
            },
            {
                "slug": "m02-how-llm-works",
                "title": "1.2 LLM 的工作本质",
                "intro": "这部分会带你理解 LLM 最核心的工作方式，先看它为什么常被概括成“下一个 token 预测”，再看这种训练目标为什么会进一步涌现出更复杂的能力。",
                "questions": [
                    ("q01-next-token-prediction", "1.2.1 为什么说 LLM 本质上是在做“下一个 token 预测”？"),
                    ("q02-more-than-next-token", "1.2.2 为什么 LLM 的能力又不止于“下一个 token 预测”？"),
                    ("q03-emergent-abilities", "1.2.3 为什么简单的预测任务会涌现出问答、总结、推理、代码生成等能力？"),
                ],
            },
            {
                "slug": "m03-boundaries-and-use-cases",
                "title": "1.3 LLM 的能力边界与适用场景",
                "intro": "这部分会帮你判断 LLM 到底擅长什么、不擅长什么，以及面对一个真实问题时，为什么不能只因为模型很强就默认应该交给它来处理。",
                "questions": [
                    ("q01-capability-boundaries", "1.3.1 LLM 的能力边界在哪里？"),
                    ("q02-when-to-use-llm", "1.3.2 什么场景适合用 LLM，什么场景不适合？"),
                    ("q03-not-for-everything", "1.3.3 为什么 LLM 很强，但并不适合解决所有问题？"),
                    ("q04-should-this-go-to-llm", "1.3.4 如何判断一个问题该不该交给 LLM 处理？"),
                ],
            },
        ],
    },
    {
        "slug": "ch02-token-embedding-and-language-modeling",
        "title": "第 2 章 Token、Embedding 与语言建模基础",
        "goal": "理解 LLM 处理文本的最基本单位和建模方式。",
        "modules": [
            {
                "slug": "m01-what-is-token",
                "title": "2.1 Token 是什么",
                "intro": "这部分会先讲清楚 token 是什么、它和字词子词的关系，以及为什么 token 数量会直接影响上下文长度、成本和输出质量。",
                "questions": [
                    ("q01-what-is-token", "2.1.1 什么是 Token？"),
                    ("q02-token-word-subword", "2.1.2 Token 和字、词、子词有什么关系？"),
                    ("q03-why-token-sequence", "2.1.3 为什么 LLM 不直接处理“句子含义”，而是处理 token 序列？"),
                    ("q04-token-count-impact", "2.1.4 为什么 token 数量会直接影响上下文长度、成本和输出质量？"),
                ],
            },
            {
                "slug": "m02-embedding-and-representation",
                "title": "2.2 Embedding 与文本表示",
                "intro": "这部分会帮你理解 embedding 在模型里的角色，先看 token 为什么需要被映射成向量，再看这种表示方式和 RAG 场景中的 embedding 有什么联系与区别。",
                "questions": [
                    ("q01-what-is-embedding", "2.2.1 什么是 Embedding？"),
                    ("q02-why-vector-representation", "2.2.2 为什么模型需要把 token 映射成向量表示？"),
                    ("q03-embedding-role-in-llm", "2.2.3 Embedding 在 LLM 里主要负责什么？"),
                    ("q04-embedding-vs-rag-embedding", "2.2.4 它和 RAG 里的 embedding 有什么异同？"),
                ],
            },
            {
                "slug": "m03-language-modeling-and-autoregression",
                "title": "2.3 语言模型与自回归生成",
                "intro": "这部分会从语言模型和自回归生成出发，帮助你理解 LLM 为什么总是按顺序逐 token 地生成文本，以及这种过程为什么会让模型看起来像在“思考”。",
                "questions": [
                    ("q01-what-is-language-model", "2.3.1 什么是语言模型（Language Model）？"),
                    ("q02-what-is-autoregressive-generation", "2.3.2 什么是自回归生成（Autoregressive Generation）？"),
                    ("q03-why-generate-token-by-token", "2.3.3 为什么 LLM 生成文本是一个逐 token 预测过程？"),
                    ("q04-why-it-looks-like-thinking", "2.3.4 为什么模型是“一个 token 一个 token 地生成”，却能看起来像在“思考”？"),
                ],
            },
        ],
    },
    {
        "slug": "ch03-transformer-and-attention",
        "title": "第 3 章 Transformer 与 Attention 机制",
        "goal": "理解 LLM 最核心的模型结构。",
        "modules": [
            {
                "slug": "m01-why-transformer",
                "title": "3.1 Transformer 为什么成为主流架构",
                "intro": "这部分会解释 Transformer 为什么成为大模型时代的主流架构，以及它相对 RNN 等传统序列模型到底强在哪里。",
                "questions": [
                    ("q01-why-transformer-mainstream", "3.1.1 Transformer 为什么会成为大模型基础架构？"),
                    ("q02-attention-vs-rnn", "3.1.2 Attention 为什么比 RNN 更适合大规模建模？"),
                    ("q03-transformer-core-advantages", "3.1.3 Transformer 相比传统序列模型的核心优势是什么？"),
                ],
            },
            {
                "slug": "m02-attention-core-ideas",
                "title": "3.2 Attention 机制的核心思想",
                "intro": "这部分会聚焦 Attention 的核心直觉，帮助你理解 self-attention、多头注意力为什么能让模型更好地处理长距离依赖和复杂语义关系。",
                "questions": [
                    ("q01-what-is-self-attention", "3.2.1 Self-Attention 是什么？"),
                    ("q02-why-self-attention-long-dependency", "3.2.2 Self-Attention 为什么能建模长距离依赖？"),
                    ("q03-what-is-multi-head-attention", "3.2.3 Multi-Head Attention 的作用是什么？"),
                    ("q04-why-multi-head-helps", "3.2.4 为什么多头注意力能提升模型表达能力？"),
                ],
            },
            {
                "slug": "m03-position-encoding-and-structure",
                "title": "3.3 位置编码与模型结构",
                "intro": "这部分会讲清楚位置编码和 Transformer 结构本身是怎么配合工作的，帮助你把 Attention、MLP、残差连接和 LayerNorm 这些常见术语串成一个整体。",
                "questions": [
                    ("q01-what-is-position-encoding", "3.3.1 Position Encoding 是什么？"),
                    ("q02-what-is-rope", "3.3.2 RoPE 是什么？为什么它在现代 LLM 中很常见？"),
                    ("q03-transformer-basic-structure", "3.3.3 Transformer 的基本结构是什么？"),
                    ("q04-components-role", "3.3.4 Attention、MLP、残差连接、LayerNorm 分别起什么作用？"),
                ],
            },
            {
                "slug": "m04-transformer-paradigms",
                "title": "3.4 三种 Transformer 结构范式",
                "intro": "这部分会带你区分 Encoder-only、Decoder-only、Encoder-Decoder 三类结构，理解它们分别适合哪些任务，以及为什么今天的大多数 LLM 都走向了 Decoder-only。",
                "questions": [
                    ("q01-three-paradigms", "3.4.1 Decoder-only、Encoder-only、Encoder-Decoder 分别适合什么任务？"),
                    ("q02-why-decoder-only", "3.4.2 为什么今天的大多数 LLM 都是 Decoder-only？"),
                    ("q03-bert-t5-gpt-differences", "3.4.3 BERT、T5、GPT 这几类模型分别代表什么思路？"),
                ],
            },
        ],
    },
    {
        "slug": "ch04-pretraining",
        "title": "第 4 章 预训练机制",
        "goal": "理解 LLM 能力是怎么“学出来”的。",
        "modules": [
            {
                "slug": "m01-what-is-pretraining",
                "title": "4.1 什么是预训练",
                "intro": "这部分会先解释预训练到底是什么，以及为什么它是大语言模型能力形成的基础。",
                "questions": [
                    ("q01-what-is-pretraining", "4.1.1 什么是预训练（Pretraining）？"),
                    ("q02-why-pretraining-is-foundation", "4.1.2 为什么预训练是 LLM 能力形成的基础？"),
                    ("q03-pretraining-vs-supervised-learning", "4.1.3 预训练和传统监督学习有什么区别？"),
                ],
            },
            {
                "slug": "m02-data-and-training-objective",
                "title": "4.2 预训练数据与训练目标",
                "intro": "这部分会带你看预训练阶段到底学什么、用什么数据学，以及为什么 next token prediction 会成为最常见的训练目标。",
                "questions": [
                    ("q01-where-pretraining-data-comes-from", "4.2.1 预训练数据通常来自哪里？"),
                    ("q02-why-data-scale-matters", "4.2.2 为什么数据规模对 LLM 很重要？"),
                    ("q03-why-next-token-objective", "4.2.3 预训练目标为什么通常是 next token prediction？"),
                    ("q04-what-is-causal-lm", "4.2.4 什么是 Causal LM？"),
                ],
            },
            {
                "slug": "m03-scaling-law-and-training-scale",
                "title": "4.3 Scaling Law 与训练规模",
                "intro": "这部分会帮助你理解模型参数、数据量和算力之间的关系，以及为什么大模型训练不能只靠盲目扩参。",
                "questions": [
                    ("q01-what-is-scaling-law", "4.3.1 什么是 Scaling Law？"),
                    ("q02-params-data-compute-relationship", "4.3.2 模型参数、数据量、训练算力之间是什么关系？"),
                    ("q03-why-bigger-not-always-better", "4.3.3 为什么不是参数越大效果就一定越好？"),
                    ("q04-why-data-quality-matters", "4.3.4 为什么高质量数据有时比盲目扩参更重要？"),
                ],
            },
            {
                "slug": "m04-abilities-and-limitations-of-pretraining",
                "title": "4.4 预训练带来的能力与局限",
                "intro": "这部分会回到结果层面，解释预训练为什么能让模型具备语言能力，同时也说明它为什么仍然有“只会续写、不一定会当助手”的局限。",
                "questions": [
                    ("q01-why-pretraining-brings-language-ability", "4.4.1 预训练为什么能带来语言理解与生成能力？"),
                    ("q02-can-complete-but-not-assistant", "4.4.2 为什么预训练模型“会续写”，但不一定“会做助手”？"),
                    ("q03-why-pretraining-knowledge-gets-stale", "4.4.3 为什么预训练阶段学到的知识会过时？"),
                ],
            },
        ],
    },
    {
        "slug": "ch05-instruction-tuning-and-alignment",
        "title": "第 5 章 指令微调与对齐",
        "goal": "理解为什么“会续写”不等于“会聊天、会听指令”。",
        "modules": [
            {
                "slug": "m01-why-pretraining-is-not-enough",
                "title": "5.1 为什么预训练后还不够",
                "intro": "这部分会解释为什么一个只经过预训练的模型还不能直接成为好用的助手，以及“会补全文本”和“会理解并执行用户意图”之间的差别。",
                "questions": [
                    ("q01-why-pretrained-model-not-ready", "5.1.1 为什么预训练好的模型还不能直接拿来做助手？"),
                    ("q02-completion-vs-following-intent", "5.1.2 为什么“会补全文本”和“会遵循用户意图”是两件事？"),
                    ("q03-why-instruction-following-needs-training", "5.1.3 为什么指令跟随能力需要单独训练？"),
                ],
            },
            {
                "slug": "m02-sft-and-instruction-tuning",
                "title": "5.2 SFT 与 Instruction Tuning",
                "intro": "这部分会帮你区分 SFT、Instruction Tuning 和 In-Context Learning，理解这些方法分别在解决什么问题。",
                "questions": [
                    ("q01-what-is-sft", "5.2.1 什么是 SFT（Supervised Fine-Tuning）？"),
                    ("q02-what-is-instruction-tuning", "5.2.2 什么是 Instruction Tuning？"),
                    ("q03-what-is-in-context-learning", "5.2.3 什么是 In-Context Learning？"),
                    ("q04-why-instruction-tuning-helps", "5.2.4 为什么指令微调能让模型更像“助手”？"),
                    ("q05-icl-vs-finetuning", "5.2.5 In-Context Learning 和微调分别适合解决什么问题？"),
                ],
            },
            {
                "slug": "m03-alignment",
                "title": "5.3 对齐（Alignment）",
                "intro": "这部分会带你理解“对齐”这个概念，说明为什么一个能力强的模型还必须具备可控、稳定和安全的行为。",
                "questions": [
                    ("q01-what-is-alignment", "5.3.1 什么是对齐（Alignment）？"),
                    ("q02-why-behavior-control-matters", "5.3.2 为什么大模型不仅要“能力强”，还要“行为可控”？"),
                    ("q03-alignment-affects-ux", "5.3.3 对齐为什么会影响模型风格、安全性和可用性？"),
                ],
            },
            {
                "slug": "m04-rlhf-and-dpo",
                "title": "5.4 RLHF 与 DPO",
                "intro": "这部分会帮助你理解 RLHF 和 DPO 这两类常见对齐方法，以及它们为什么会直接影响模型的用户体验。",
                "questions": [
                    ("q01-what-is-rlhf", "5.4.1 什么是 RLHF？"),
                    ("q02-what-is-dpo", "5.4.2 什么是 DPO？"),
                    ("q03-rlhf-vs-dpo", "5.4.3 RLHF 和 DPO 分别适合解决什么问题？"),
                    ("q04-alignment-methods-impact-ux", "5.4.4 为什么对齐方法会直接影响模型的用户体验？"),
                ],
            },
        ],
    },
    {
        "slug": "ch06-inference-sampling-and-generation-control",
        "title": "第 6 章 推理、采样与生成控制",
        "goal": "理解模型回答为什么会不一样，以及如何控制输出。",
        "modules": [
            {
                "slug": "m01-what-happens-during-inference",
                "title": "6.1 模型推理时到底在做什么",
                "intro": "这部分会先把推理阶段拆开讲清楚，帮助你理解从输入到输出的关键步骤，以及为什么推理虽然不训练参数却依然非常耗资源。",
                "questions": [
                    ("q01-what-happens-during-inference", "6.1.1 LLM 推理时到底在做什么？"),
                    ("q02-key-steps-input-to-output", "6.1.2 从输入到输出，中间发生了哪些关键步骤？"),
                    ("q03-why-inference-is-expensive", "6.1.3 为什么推理阶段虽然不训练参数，但仍然很耗资源？"),
                ],
            },
            {
                "slug": "m02-sampling-and-decoding",
                "title": "6.2 采样与解码策略",
                "intro": "这部分会集中讲 Temperature、Top-k、Top-p、Greedy Decoding 等常见概念，帮助你理解为什么同一个问题模型每次回答可能不同。",
                "questions": [
                    ("q01-what-is-temperature", "6.2.1 什么是 Temperature？"),
                    ("q02-what-are-topk-topp", "6.2.2 什么是 Top-k、Top-p？"),
                    ("q03-temperature-vs-topp", "6.2.3 Temperature 和 Top-p 有什么区别？"),
                    ("q04-what-is-greedy-decoding", "6.2.4 什么是 Greedy Decoding？"),
                    ("q05-why-answers-differ", "6.2.5 为什么同一个问题模型每次回答可能不同？"),
                ],
            },
            {
                "slug": "m03-output-control-and-use-cases",
                "title": "6.3 输出控制与使用场景",
                "intro": "这部分会把采样参数和真实任务场景联系起来，帮助你理解什么时候应该要稳定、什么时候应该要发散，以及如何根据任务类型调整生成策略。",
                "questions": [
                    ("q01-deterministic-vs-diverse-output", "6.3.1 什么场景适合确定性输出，什么场景适合发散性输出？"),
                    ("q02-creative-vs-factual-sampling", "6.3.2 为什么创意生成和事实问答适合不同的采样参数？"),
                    ("q03-adjust-generation-strategy-by-task", "6.3.3 如何根据任务类型调整生成策略？"),
                ],
            },
            {
                "slug": "m04-inference-efficiency",
                "title": "6.4 推理效率优化",
                "intro": "这部分会回到推理效率和成本，解释 KV Cache、长上下文、长输出这些因素为什么会直接推高延迟与资源消耗。",
                "questions": [
                    ("q01-what-is-kv-cache", "6.4.1 什么是 KV Cache？"),
                    ("q02-why-kv-cache-helps", "6.4.2 KV Cache 为什么能提升推理效率？"),
                    ("q03-why-long-context-costs-more", "6.4.3 为什么长上下文会导致推理成本变高？"),
                    ("q04-why-longer-output-costs-more", "6.4.4 为什么输出越长，延迟和成本通常越高？"),
                ],
            },
        ],
    },
    {
        "slug": "ch07-context-window-memory-and-long-context",
        "title": "第 7 章 上下文窗口、记忆与长文本问题",
        "goal": "理解 LLM 为什么“看起来记得住”，但其实受上下文限制。",
        "modules": [
            {
                "slug": "m01-what-is-context-window",
                "title": "7.1 上下文窗口是什么",
                "intro": "这部分会先把上下文窗口讲清楚，帮助你理解它为什么会限制模型一次能处理的信息量，以及为什么这会成为产品设计中的关键约束。",
                "questions": [
                    ("q01-what-is-context-window", "7.1.1 什么是上下文窗口（Context Window）？"),
                    ("q02-why-context-window-limits-information", "7.1.2 上下文窗口为什么会限制模型一次能处理的信息量？"),
                    ("q03-why-context-window-is-key-constraint", "7.1.3 为什么上下文长度是 LLM 产品设计中的关键约束？"),
                ],
            },
            {
                "slug": "m02-what-memory-means",
                "title": "7.2 模型的“记忆”到底是什么",
                "intro": "这部分会帮你区分参数记忆和上下文记忆，理解模型“记住知识”和“稳定调用知识”其实不是一回事。",
                "questions": [
                    ("q01-what-does-memory-mean", "7.2.1 模型的“记忆”到底指什么？"),
                    ("q02-param-memory-vs-context-memory", "7.2.2 参数记忆和上下文记忆有什么区别？"),
                    ("q03-knowing-vs-using-knowledge", "7.2.3 为什么模型“记得某些知识”不等于它能稳定调用这些知识？"),
                ],
            },
            {
                "slug": "m03-long-context-problems",
                "title": "7.3 长上下文问题",
                "intro": "这部分会解释长上下文为什么不是越长越好，以及 lost in the middle 这类问题为什么会让长文本场景变得更难。",
                "questions": [
                    ("q01-longer-context-not-always-better", "7.3.1 为什么上下文越长不一定效果越好？"),
                    ("q02-what-is-lost-in-the-middle", "7.3.2 什么是 lost in the middle？"),
                    ("q03-why-long-context-is-hard", "7.3.3 长上下文能力为什么很难真正做好？"),
                    ("q04-typical-long-text-problems", "7.3.4 长文本输入会带来哪些典型问题？"),
                ],
            },
            {
                "slug": "m04-long-context-vs-rag",
                "title": "7.4 长上下文与 RAG 的关系",
                "intro": "这部分会把长上下文和 RAG 放在一起看，帮助你理解它们分别适合什么场景，以及为什么“上下文窗口很大”仍然不等于“就不需要检索”。",
                "questions": [
                    ("q01-why-long-context-still-needs-rag", "7.4.1 为什么很多长上下文问题最终还是需要 RAG？"),
                    ("q02-long-context-vs-rag-use-cases", "7.4.2 长上下文和 RAG 分别适合什么场景？"),
                    ("q03-big-context-not-equal-no-retrieval", "7.4.3 为什么“上下文窗口很大”不等于“就不需要检索”？"),
                ],
            },
        ],
    },
    {
        "slug": "ch08-prompt-tool-calling-and-agent-basics",
        "title": "第 8 章 Prompt、工具调用与 Agent 基础",
        "goal": "理解 LLM 如何从“纯文本生成器”变成“可用系统组件”。",
        "modules": [
            {
                "slug": "m01-prompt-basics",
                "title": "8.1 Prompt 的基本作用",
                "intro": "这部分会先讲清楚 Prompt 是什么、Prompt Engineering 到底在做什么，以及为什么 Prompt 很重要但又不能被神化。",
                "questions": [
                    ("q01-what-is-prompt", "8.1.1 什么是 Prompt？"),
                    ("q02-what-is-prompt-engineering", "8.1.2 Prompt Engineering 的本质是什么？"),
                    ("q03-why-prompt-matters-but-not-magical", "8.1.3 为什么 Prompt 很重要，但又不能神化 Prompt？"),
                ],
            },
            {
                "slug": "m02-prompt-structure-and-methods",
                "title": "8.2 Prompt 的结构与常见方法",
                "intro": "这部分会介绍常见 Prompt 结构和方法，帮助你理解为什么不同任务类型需要不同的提示方式。",
                "questions": [
                    ("q01-system-user-tool-prompt", "8.2.1 System Prompt、User Prompt、Tool Prompt 分别起什么作用？"),
                    ("q02-zero-shot-few-shot-cot", "8.2.2 Zero-shot、Few-shot、Chain-of-Thought 分别是什么？"),
                    ("q03-why-different-tasks-need-different-structures", "8.2.3 为什么不同任务类型需要不同 Prompt 结构？"),
                    ("q04-why-prompt-affects-style-and-stability", "8.2.4 为什么 Prompt 设计会直接影响模型输出风格和稳定性？"),
                ],
            },
            {
                "slug": "m03-tool-calling",
                "title": "8.3 工具调用",
                "intro": "这部分会带你理解 Tool Calling / Function Calling 的本质，说明为什么很多能力应该交给工具而不是让模型硬猜。",
                "questions": [
                    ("q01-what-is-tool-calling", "8.3.1 什么是 Function Calling / Tool Calling？"),
                    ("q02-why-llm-needs-tools", "8.3.2 LLM 为什么需要调用工具？"),
                    ("q03-model-vs-tool-boundaries", "8.3.3 哪些能力适合交给模型，哪些能力应该交给工具？"),
                    ("q04-why-tool-calling-reduces-guessing", "8.3.4 为什么工具调用能显著降低模型“硬猜”的概率？"),
                ],
            },
            {
                "slug": "m04-agent-basics",
                "title": "8.4 Agent 基础",
                "intro": "这部分会从 Agent 和普通聊天机器人的区别讲起，帮助你理解 Agent、Workflow、RAG 之间的边界，以及什么情况下根本不该把系统设计成 Agent。",
                "questions": [
                    ("q01-agent-vs-chatbot", "8.4.1 Agent 和普通聊天机器人有什么区别？"),
                    ("q02-agent-built-on-llm-tools-memory", "8.4.2 Agent 为什么通常建立在 LLM + 工具 + 记忆 / RAG 之上？"),
                    ("q03-workflow-vs-agent", "8.4.3 Workflow 和 Agent 的边界在哪里？"),
                    ("q04-when-not-to-build-agent", "8.4.4 什么情况下不该把系统设计成 Agent？"),
                ],
            },
        ],
    },
    {
        "slug": "ch09-hallucination-stability-and-common-issues",
        "title": "第 9 章 幻觉、稳定性与常见问题",
        "goal": "理解 LLM 为什么会出错，以及错误来自哪里。",
        "modules": [
            {
                "slug": "m01-what-is-hallucination",
                "title": "9.1 什么是幻觉",
                "intro": "这部分会先定义什么是幻觉，再解释它和知识过时、事实错误之间的关系，以及为什么模型有时会一本正经地胡说八道。",
                "questions": [
                    ("q01-what-is-hallucination", "9.1.1 什么是幻觉（Hallucination）？"),
                    ("q02-why-llm-hallucinates", "9.1.2 为什么 LLM 会幻觉？"),
                    ("q03-hallucination-vs-stale-knowledge", "9.1.3 幻觉和“知识过时”有什么区别？"),
                    ("q04-why-confidently-wrong", "9.1.4 为什么模型有时会一本正经地胡说八道？"),
                ],
            },
            {
                "slug": "m02-stability-problems",
                "title": "9.2 稳定性问题",
                "intro": "这部分会帮助你理解模型为什么会时好时坏，以及随机性、系统性错误、Prompt、采样参数和上下文组织之间的关系。",
                "questions": [
                    ("q01-why-same-question-different-quality", "9.2.1 为什么同一个问题有时答得很好，有时答得很差？"),
                    ("q02-random-vs-systematic-errors", "9.2.2 什么是随机性，什么是系统性错误？"),
                    ("q03-why-output-depends-on-prompt-and-context", "9.2.3 为什么模型输出会受 Prompt、采样参数、上下文组织影响？"),
                    ("q04-why-boundary-cases-are-unstable", "9.2.4 为什么模型在边界问题上更容易不稳定？"),
                ],
            },
            {
                "slug": "m03-how-to-reduce-errors",
                "title": "9.3 如何降低错误",
                "intro": "这部分会把模型能力和系统补偿能力放在一起看，帮助你区分哪些问题适合靠模型本身改善，哪些更应该交给 RAG 或工具来解决。",
                "questions": [
                    ("q01-how-to-reduce-hallucination", "9.3.1 如何降低幻觉？"),
                    ("q02-why-prompt-not-enough", "9.3.2 为什么“加 Prompt”不能解决所有问题？"),
                    ("q03-model-vs-rag-vs-tools", "9.3.3 哪些问题应该靠模型解决，哪些问题应该靠 RAG / 工具解决？"),
                    ("q04-model-and-system-compensation", "9.3.4 为什么真实系统里要把“模型能力”和“系统补偿能力”结合起来看？"),
                ],
            },
        ],
    },
    {
        "slug": "ch10-evaluation",
        "title": "第 10 章 LLM 评测体系",
        "goal": "建立对模型能力评估的正确认知。",
        "modules": [
            {
                "slug": "m01-why-not-judge-by-feel",
                "title": "10.1 为什么不能只靠主观感觉评模型",
                "intro": "这部分会先讲清楚为什么评模型不能只看“感觉聪明不聪明”，以及为什么离线能力和线上效果必须拆开看。",
                "questions": [
                    ("q01-why-not-judge-by-feel", "10.1.1 为什么 LLM 不能只看感觉好不好用？"),
                    ("q02-smart-looking-not-equal-usable", "10.1.2 为什么“看起来聪明”不等于“真实可用”？"),
                    ("q03-offline-vs-online-evaluation", "10.1.3 为什么模型评测必须区分离线能力和线上效果？"),
                ],
            },
            {
                "slug": "m02-benchmarks-and-common-evals",
                "title": "10.2 常见评测方式与 Benchmark",
                "intro": "这部分会介绍预训练模型、指令模型常见的评测方式，以及 MMLU、GSM8K、HumanEval 这类 benchmark 到底在测什么。",
                "questions": [
                    ("q01-pretraining-model-evals", "10.2.1 预训练模型常见评测方式有哪些？"),
                    ("q02-instruction-model-evals", "10.2.2 指令模型常见评测方式有哪些？"),
                    ("q03-what-is-benchmark", "10.2.3 什么是 Benchmark？"),
                    ("q04-what-do-mmlu-gsm8k-humaneval-measure", "10.2.4 MMLU、GSM8K、HumanEval 分别在测什么？"),
                    ("q05-why-benchmark-score-not-enough", "10.2.5 为什么 benchmark 分高不一定代表真实业务效果就好？"),
                ],
            },
            {
                "slug": "m03-llm-as-a-judge-and-practice",
                "title": "10.3 LLM-as-a-Judge 与评测实践",
                "intro": "这部分会带你理解 LLM-as-a-Judge、主观评测和客观评测分别适合什么场景，以及为什么真实产品里通常需要多种评测方式结合。",
                "questions": [
                    ("q01-what-is-llm-as-a-judge", "10.3.1 什么是 LLM-as-a-Judge？"),
                    ("q02-subjective-vs-objective-eval", "10.3.2 主观评测和客观评测分别适合什么场景？"),
                    ("q03-why-combine-evals", "10.3.3 为什么真实产品里通常需要多种评测方式结合？"),
                    ("q04-avoid-benchmark-only-optimization", "10.3.4 如何避免只追 benchmark 而忽略业务目标？"),
                ],
            },
            {
                "slug": "m04-online-evaluation",
                "title": "10.4 线上模型评估",
                "intro": "这部分会回到线上视角，帮助你理解线上应该监控哪些指标，以及如何定位质量波动到底是模型、Prompt 还是数据问题。",
                "questions": [
                    ("q01-online-metrics", "10.4.1 线上模型应该监控哪些指标？"),
                    ("q02-how-to-locate-quality-drop", "10.4.2 如何判断模型质量下降是模型问题、Prompt 问题还是数据问题？"),
                    ("q03-why-online-monitoring-matters", "10.4.3 为什么线上监控对 LLM 产品至关重要？"),
                ],
            },
        ],
    },
    {
        "slug": "ch11-optimization-and-production",
        "title": "第 11 章 LLM 优化与落地",
        "goal": "从“知道原理”走向“知道怎么用”。",
        "modules": [
            {
                "slug": "m01-model-prompt-rag-choices",
                "title": "11.1 模型、Prompt 与 RAG 的选择",
                "intro": "这部分会从问题定位出发，帮助你判断什么时候该换模型、什么时候该改 Prompt、什么时候该加 RAG，以及为什么很多业务问题最终是系统设计问题。",
                "questions": [
                    ("q01-when-to-switch-model-prompt-rag", "11.1.1 什么时候该换模型，什么时候该改 Prompt，什么时候该加 RAG？"),
                    ("q02-why-not-everything-needs-finetuning", "11.1.2 为什么不是所有问题都值得微调？"),
                    ("q03-why-business-issues-are-system-design", "11.1.3 为什么很多业务问题最后是系统设计问题，而不只是模型问题？"),
                ],
            },
            {
                "slug": "m02-balance-quality-latency-cost",
                "title": "11.2 效果、延迟与成本的平衡",
                "intro": "这部分会帮助你从工程落地视角平衡效果、延迟和成本，而不是一味追求最强模型。",
                "questions": [
                    ("q01-balance-quality-latency-cost", "11.2.1 如何平衡效果、延迟和成本？"),
                    ("q02-why-stronger-models-cost-more", "11.2.2 为什么模型越强，往往成本也越高？"),
                    ("q03-design-good-enough-solution", "11.2.3 如何根据业务目标设计“够用”的模型方案？"),
                ],
            },
            {
                "slug": "m03-common-optimization-methods",
                "title": "11.3 常见优化手段",
                "intro": "这部分会介绍量化、蒸馏、LoRA / PEFT 等常见优化手段，帮助你理解它们分别更适合解决什么问题。",
                "questions": [
                    ("q01-what-is-quantization", "11.3.1 什么是量化（Quantization）？"),
                    ("q02-what-is-distillation", "11.3.2 什么是蒸馏（Distillation）？"),
                    ("q03-what-is-lora-peft", "11.3.3 什么是 LoRA / PEFT？"),
                    ("q04-what-problems-they-optimize", "11.3.4 它们分别更适合优化什么问题？"),
                ],
            },
            {
                "slug": "m04-finetuning-vs-system-enhancement",
                "title": "11.4 微调与系统增强",
                "intro": "这部分会把微调、RAG、模型选型以及企业落地中的安全、权限、审计和观测放到同一张图里看，帮助你形成更完整的落地视角。",
                "questions": [
                    ("q01-finetuning-vs-rag", "11.4.1 微调和 RAG 应该怎么选？"),
                    ("q02-small-big-open-closed-models", "11.4.2 小模型、大模型、开源模型、闭源模型分别适合什么场景？"),
                    ("q03-common-enterprise-risks", "11.4.3 企业落地 LLM 时最常见的风险是什么？"),
                    ("q04-security-permission-audit-observability", "11.4.4 如何做安全、权限、审计和观测？"),
                ],
            },
        ],
    },
    {
        "slug": "ch12-open-source-models-and-selection",
        "title": "第 12 章 开源模型与模型选型",
        "goal": "帮助用户形成模型选型能力。",
        "modules": [
            {
                "slug": "m01-open-vs-closed-models",
                "title": "12.1 开源与闭源模型的选择",
                "intro": "这部分会聚焦开源模型和闭源模型的核心取舍，帮助你从效果、成本、控制权和稳定性几个维度判断什么更适合业务。",
                "questions": [
                    ("q01-how-to-choose-open-vs-closed", "12.1.1 闭源模型和开源模型怎么选？"),
                    ("q02-best-not-always-best-fit", "12.1.2 为什么“效果最好”不一定等于“业务最合适”？"),
                    ("q03-open-vs-closed-tradeoffs", "12.1.3 开源和闭源在成本、控制权、稳定性上分别有什么取舍？"),
                ],
            },
            {
                "slug": "m02-model-type-differences",
                "title": "12.2 模型类型的区分",
                "intro": "这部分会帮助你区分 Base Model、Instruct Model、通用模型和垂类模型，理解为什么不同模型的默认行为风格可能差异很大。",
                "questions": [
                    ("q01-base-vs-instruct", "12.2.1 Base Model 和 Instruct Model 有什么区别？"),
                    ("q02-general-vs-domain-model", "12.2.2 通用模型和垂类模型怎么选？"),
                    ("q03-why-default-behavior-differs", "12.2.3 为什么不同模型的“默认行为风格”差异很大？"),
                ],
            },
            {
                "slug": "m03-model-selection-dimensions",
                "title": "12.3 模型选型维度",
                "intro": "这部分会把模型选型时真正需要看的维度拆开说明，帮助你综合考虑参数量、上下文长度、速度、价格和稳定性。",
                "questions": [
                    ("q01-selection-dimensions", "12.3.1 选择模型时应该看哪些维度？"),
                    ("q02-are-params-still-core-metric", "12.3.2 参数量是否仍然是核心指标？"),
                    ("q03-how-to-balance-context-speed-price-stability", "12.3.3 上下文长度、推理速度、价格、稳定性该怎么平衡？"),
                    ("q04-when-small-models-fit", "12.3.4 什么场景适合部署小模型？"),
                    ("q05-when-strong-models-are-required", "12.3.5 什么场景必须用强模型？"),
                ],
            },
        ],
    },
    {
        "slug": "ch13-llm-rag-and-agent-relationship",
        "title": "第 13 章 LLM 与 RAG、Agent 的关系",
        "goal": "帮助用户把三块知识真正串起来。",
        "modules": [
            {
                "slug": "m01-llm-and-rag",
                "title": "13.1 LLM 与 RAG 的关系",
                "intro": "这部分会先回答为什么有了 LLM 之后仍然需要 RAG，以及哪些问题更适合纯 LLM、哪些更适合 LLM + RAG。",
                "questions": [
                    ("q01-why-llm-still-needs-rag", "13.1.1 为什么有了 LLM 还需要 RAG？"),
                    ("q02-why-knowledge-problems-need-more-than-llm", "13.1.2 为什么很多“知识型问题”只靠 LLM 不够？"),
                    ("q03-pure-llm-vs-llm-plus-rag", "13.1.3 哪些问题更适合纯 LLM，哪些更适合 LLM + RAG？"),
                ],
            },
            {
                "slug": "m02-rag-and-agent",
                "title": "13.2 RAG 与 Agent 的关系",
                "intro": "这部分会帮助你区分 RAG 和 Agent 的核心差别，理解为什么“有检索”并不等于“有 Agent”。",
                "questions": [
                    ("q01-why-rag-is-not-agent", "13.2.1 为什么有了 RAG 还不等于 Agent？"),
                    ("q02-rag-vs-agent-core-difference", "13.2.2 RAG 和 Agent 的核心差别是什么？"),
                    ("q03-why-agent-emphasizes-closed-loop", "13.2.3 为什么 Agent 更强调任务分解、工具调用和执行闭环？"),
                ],
            },
            {
                "slug": "m03-division-of-labor-in-real-systems",
                "title": "13.3 三者在实际系统中的分工",
                "intro": "这部分会把 LLM、RAG、Tool Use、Workflow、Agent 放到真实系统里一起看，帮助你理解不同能力应该如何分层协作。",
                "questions": [
                    ("q01-relationships-among-components", "13.3.1 LLM、RAG、Tool Use、Workflow、Agent 之间是什么关系？"),
                    ("q02-what-to-give-llm-rag-tools", "13.3.2 一个实际 AI 应用中，哪些问题应该由 LLM 解决，哪些交给 RAG，哪些交给工具？"),
                    ("q03-when-to-upgrade-to-rag", "13.3.3 什么时候系统该从“纯 LLM”升级到“RAG”？"),
                    ("q04-when-to-upgrade-to-agent", "13.3.4 什么时候系统该从“RAG”升级到“Agent”？"),
                ],
            },
        ],
    },
    {
        "slug": "ch14-misconceptions-and-interview-high-frequency",
        "title": "第 14 章 LLM 常见误区与面试高频问题",
        "goal": "帮助读者建立稳定的方法论与面试表达框架。",
        "modules": [
            {
                "slug": "m01-common-misconceptions",
                "title": "14.1 常见误区",
                "intro": "这部分会集中拆解学习和使用 LLM 时最常见的误区，帮助你避免只记概念、不理解系统的情况。",
                "questions": [
                    ("q01-llm-just-bigger-nlp", "14.1.1 LLM 只是“更大的 NLP 模型”吗？"),
                    ("q02-bigger-params-always-better", "14.1.2 参数越大就一定越强吗？"),
                    ("q03-prompt-solves-most-problems", "14.1.3 Prompt 写得好是不是就能解决大部分问题？"),
                    ("q04-knowing-concepts-not-equal-system-thinking", "14.1.4 为什么“知道概念”不等于“理解系统”？"),
                    ("q05-back-to-data-alignment-inference-system", "14.1.5 为什么很多 LLM 问题最后都要回到数据、对齐、推理和系统设计？"),
                ],
            },
            {
                "slug": "m02-interview-expression-and-methodology",
                "title": "14.2 面试表达与方法论",
                "intro": "这部分会帮助你把 LLM 相关问题讲出层次感和工程感，形成一套更稳定的面试作答框架。",
                "questions": [
                    ("q01-why-not-just-reciting-transformer", "14.2.1 面试中讲 LLM，为什么不能只背 Transformer？"),
                    ("q02-how-to-answer-with-depth-and-engineering", "14.2.2 怎么把 LLM 问题讲出层次感和工程感？"),
                    ("q03-how-to-balance-principles-engineering-business", "14.2.3 回答 LLM 面试题时，如何兼顾原理、工程和业务视角？"),
                    ("q04-how-to-build-stable-answer-framework", "14.2.4 如何建立一套稳定的 LLM 面试作答框架？"),
                ],
            },
        ],
    },
]


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.rstrip() + "\n", encoding="utf-8")


def build_root_index() -> None:
    chapter_links = "\n".join(f"- [{chapter['title']}](./{chapter['slug']}/)" for chapter in CHAPTERS)
    content = f"""---
title: LLM 教程目录
summary: 按章节、主题模块和具体问题组织的 LLM 教程结构。
---

# LLM 教程目录

这部分会从整体认知、语言建模基础、Transformer 结构、预训练与对齐、推理控制、评测优化到模型选型，系统讲清楚大语言模型的关键概念与实践方法。

## 章节目录

{chapter_links}
"""
    write(ROOT / "index.md", content)


def build_chapter_pages() -> None:
    for index, chapter in enumerate(CHAPTERS):
        reading_order = "\n".join(
            f"{i + 1}. [{module['title']}](./{module['slug']}/)"
            for i, module in enumerate(chapter["modules"])
        )
        module_links = "\n".join(
            f"- [{module['title']}](./{module['slug']}/)" for module in chapter["modules"]
        )

        related_lines = []
        if index < len(CHAPTERS) - 1:
            next_chapter = CHAPTERS[index + 1]
            related_lines.append(
                f"- 学完这一章后，建议继续阅读 [{next_chapter['title']}](../{next_chapter['slug']}/)。"
            )
        if index > 0:
            prev_chapter = CHAPTERS[index - 1]
            related_lines.append(
                f"- 如果你想回看前面的基础内容，也可以返回 [{prev_chapter['title']}](../{prev_chapter['slug']}/)。"
            )
        if chapter["slug"] == "ch13-llm-rag-and-agent-relationship":
            related_lines.append("- 如果你想进一步从完整检索链路理解 RAG，也可以继续阅读 [RAG 教程目录](/rag/)。")
        if chapter["slug"] == "ch14-misconceptions-and-interview-high-frequency":
            related_lines.append("- 如果你想把模型、RAG 和 Agent 的关系再串一次，也可以回到 [第 13 章 LLM 与 RAG、Agent 的关系](../ch13-llm-rag-and-agent-relationship/)。")

        content = f"""---
title: {chapter['title']}
summary: 待补充。
---

# {chapter['title']}

本章目标：{chapter['goal']}

## 建议阅读顺序

{reading_order}

## 主题模块

{module_links}

## 关联章节

{chr(10).join(related_lines)}
"""
        write(ROOT / chapter["slug"] / "index.md", content)


def build_module_and_question_pages() -> None:
    for chapter in CHAPTERS:
        for module in chapter["modules"]:
            question_links = "\n".join(
                f"- [{question_title.split(' ', 1)[1]}](./{question_slug})"
                for question_slug, question_title in module["questions"]
            )
            module_content = f"""---
title: {module['title']}
summary: 待补充。
---

# {module['title']}

{module['intro']}

## 这一节会回答什么问题

{question_links}
"""
            write(ROOT / chapter["slug"] / module["slug"] / "index.md", module_content)

            for question_slug, question_title in module["questions"]:
                readable_title = question_title.split(" ", 1)[1].rstrip("？")
                question_content = f"""---
title: {question_title}
summary: 围绕“{readable_title}”建立基础理解。
---

# {question_title}

这篇内容会围绕“{readable_title}”展开，帮助你先建立清晰的基础认识，再逐步理解它在 LLM 体系中的作用、边界和常见实践方式。
"""
                write(ROOT / chapter["slug"] / module["slug"] / f"{question_slug}.md", question_content)


def build_sidebar() -> None:
    lines = [
        "      '/llm/': [",
        "        {",
        "          text: 'LLM',",
        "          collapsed: false,",
        "          items: [",
        "            { text: '概览', link: '/llm/' },",
    ]
    for chapter in CHAPTERS:
        lines.extend(
            [
                "            {",
                f"              text: '{chapter['title']}',",
                "              collapsed: true,",
                "              items: [",
                f"                {{ text: '概览', link: '/llm/{chapter['slug']}/' }},",
            ]
        )
        for module in chapter["modules"]:
            lines.extend(
                [
                    "                {",
                    f"                  text: '{module['title']}',",
                    "                  collapsed: true,",
                    "                  items: [",
                    f"                    {{ text: '概览', link: '/llm/{chapter['slug']}/{module['slug']}/' }},",
                ]
            )
            for question_slug, question_title in module["questions"]:
                lines.append(
                    f"                    {{ text: '{question_title}', link: '/llm/{chapter['slug']}/{module['slug']}/{question_slug}' }},"
                )
            lines.extend(["                  ]", "                },"])
        lines.extend(["              ]", "            },"])
    lines.extend(["          ]", "        }", "      ],"])
    sidebar_block = "\n".join(lines)

    config = CONFIG_PATH.read_text(encoding="utf-8")
    start = config.index("      '/llm/': [")
    end = config.index("      '/rag/': [")
    config = config[:start] + sidebar_block + "\n" + config[end:]
    CONFIG_PATH.write_text(config, encoding="utf-8")


def main() -> None:
    build_root_index()
    build_chapter_pages()
    build_module_and_question_pages()
    build_sidebar()


if __name__ == "__main__":
    main()

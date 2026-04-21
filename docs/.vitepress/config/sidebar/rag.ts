import type { DefaultTheme } from 'vitepress'

export const ragSidebar: DefaultTheme.Sidebar = {
'/rag/': [
      {
        text: 'RAG',
        collapsed: false,
        items: [
          { text: '概览', link: '/rag/' },
          {
            text: '第 1 章 RAG 全景图与核心认知',
            collapsed: true,
            items: [
              { text: '概览', link: '/rag/ch01-rag-overview/' },
              {
                text: '1.1 RAG 的定义与定位',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch01-rag-overview/m01-definition-and-positioning/' },
                  { text: '1.1.1 RAG 是什么？', link: '/rag/ch01-rag-overview/m01-definition-and-positioning/q01-rag' },
                  { text: '1.1.2 RAG 和传统搜索、微调分别是什么关系？', link: '/rag/ch01-rag-overview/m01-definition-and-positioning/q02-rag' },
                  { text: '1.1.3 为什么大模型应用里经常需要 RAG？', link: '/rag/ch01-rag-overview/m01-definition-and-positioning/q03-rag' },
                  { text: '1.1.4 哪些场景适合用 RAG，哪些场景不适合？', link: '/rag/ch01-rag-overview/m01-definition-and-positioning/q04-rag' },
                  { text: '1.1.5 RAG、知识库问答、搜索、Agent 的边界分别是什么？', link: '/rag/ch01-rag-overview/m01-definition-and-positioning/q05-rag-agent' }
                ]
              },
              {
                text: '1.2 RAG 系统的基本组成',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch01-rag-overview/m02-system-components/' },
                  { text: '1.2.1 一个最小可用的 RAG 系统由哪些部分组成？', link: '/rag/ch01-rag-overview/m02-system-components/q01-rag' },
                  { text: '1.2.2 一个生产级 RAG 系统相比 Demo 多了哪些能力？', link: '/rag/ch01-rag-overview/m02-system-components/q02-rag-demo' },
                  { text: '1.2.3 RAG 的完整工作流程是什么？', link: '/rag/ch01-rag-overview/m02-system-components/q03-rag' },
                  { text: '1.2.4 从用户提问到模型回答，中间数据流是怎么走的？', link: '/rag/ch01-rag-overview/m02-system-components/q04-item' }
                ]
              },
              {
                text: '1.3 对 RAG 的常见误解',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch01-rag-overview/m03-common-misconceptions/' },
                  { text: '1.3.1 为什么不能把 RAG 简单理解成“检索 + Prompt”？', link: '/rag/ch01-rag-overview/m03-common-misconceptions/q01-rag-prompt' },
                  { text: '1.3.2 为什么“检索到了”不等于“回答就会好”？', link: '/rag/ch01-rag-overview/m03-common-misconceptions/q02-item' },
                  { text: '1.3.3 为什么很多 RAG Demo 能跑，但很难稳定上线？', link: '/rag/ch01-rag-overview/m03-common-misconceptions/q03-rag-demo' },
                  { text: '1.3.4 为什么 RAG 的问题往往不只出在模型本身？', link: '/rag/ch01-rag-overview/m03-common-misconceptions/q04-rag' }
                ]
              }
            ]
          },
          {
            text: '第 2 章 数据接入与知识库准备',
            collapsed: true,
            items: [
              { text: '概览', link: '/rag/ch02-data-and-knowledge-base/' },
              {
                text: '2.1 为什么 RAG 首先是数据问题',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch02-data-and-knowledge-base/m01-data-first/' },
                  { text: '2.1.1 做 RAG 之前，为什么要先处理数据而不是直接喂给模型？', link: '/rag/ch02-data-and-knowledge-base/m01-data-first/q01-rag' },
                  { text: '2.1.2 为什么知识质量往往比模型参数更影响 RAG 效果？', link: '/rag/ch02-data-and-knowledge-base/m01-data-first/q02-rag' },
                  { text: '2.1.3 为什么“有资料”不等于“资料可被有效检索和使用”？', link: '/rag/ch02-data-and-knowledge-base/m01-data-first/q03-item' }
                ]
              },
              {
                text: '2.2 数据源类型与接入方式',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch02-data-and-knowledge-base/m02-data-sources/' },
                  { text: '2.2.1 RAG 可以接哪些数据源？', link: '/rag/ch02-data-and-knowledge-base/m02-data-sources/q01-rag' },
                  { text: '2.2.2 文档、网页、数据库、代码库有什么区别？', link: '/rag/ch02-data-and-knowledge-base/m02-data-sources/q02-item' },
                  { text: '2.2.3 结构化数据和非结构化数据在 RAG 里分别怎么处理？', link: '/rag/ch02-data-and-knowledge-base/m02-data-sources/q03-rag' },
                  { text: '2.2.4 图片、表格、图表、PDF 等复杂格式为什么更难处理？', link: '/rag/ch02-data-and-knowledge-base/m02-data-sources/q04-pdf' }
                ]
              },
              {
                text: '2.3 知识库数据清洗与标准化',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch02-data-and-knowledge-base/m03-cleaning-and-standardization/' },
                  { text: '2.3.1 知识库数据清洗通常要做什么？', link: '/rag/ch02-data-and-knowledge-base/m03-cleaning-and-standardization/q01-item' },
                  { text: '2.3.2 为什么页眉页脚、导航栏、模板噪声会影响 RAG 效果？', link: '/rag/ch02-data-and-knowledge-base/m03-cleaning-and-standardization/q02-rag' },
                  { text: '2.3.3 为什么去重、去噪、字段标准化很重要？', link: '/rag/ch02-data-and-knowledge-base/m03-cleaning-and-standardization/q03-item' },
                  { text: '2.3.4 什么样的数据不应该直接进入知识库？', link: '/rag/ch02-data-and-knowledge-base/m03-cleaning-and-standardization/q04-item' }
                ]
              },
              {
                text: '2.4 权限、时效性与知识治理',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch02-data-and-knowledge-base/m04-governance/' },
                  { text: '2.4.1 为什么知识库不只是“存内容”，还要管理权限和时效性？', link: '/rag/ch02-data-and-knowledge-base/m04-governance/q01-item' },
                  { text: '2.4.2 企业场景里，为什么权限控制不能只靠前端限制？', link: '/rag/ch02-data-and-knowledge-base/m04-governance/q02-item' },
                  { text: '2.4.3 知识库有时效性时，如何做更新与失效管理？', link: '/rag/ch02-data-and-knowledge-base/m04-governance/q03-item' },
                  { text: '2.4.4 多租户 RAG 一般怎么做隔离？', link: '/rag/ch02-data-and-knowledge-base/m04-governance/q04-rag' }
                ]
              }
            ]
          },
          {
            text: '第 3 章 Chunk、Metadata 与索引前设计',
            collapsed: true,
            items: [
              { text: '概览', link: '/rag/ch03-chunk-metadata-and-pre-index-design/' },
              {
                text: '3.1 为什么文档必须切块',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m01-why-chunking/' },
                  { text: '3.1.1 什么是 Chunk？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m01-why-chunking/q01-chunk' },
                  { text: '3.1.2 为什么文档必须切块？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m01-why-chunking/q02-item' },
                  { text: '3.1.3 为什么不能直接按整篇文档做检索和生成？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m01-why-chunking/q03-item' }
                ]
              },
              {
                text: '3.2 Chunk 的切分策略',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m02-chunking-strategies/' },
                  { text: '3.2.1 Chunk 应该切多大？为什么没有统一答案？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m02-chunking-strategies/q01-chunk' },
                  { text: '3.2.2 Chunk overlap 有什么作用？是不是越大越好？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m02-chunking-strategies/q02-chunk-overlap' },
                  { text: '3.2.3 按固定长度切块、按语义切块、按结构切块分别适合什么场景？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m02-chunking-strategies/q03-item' },
                  { text: '3.2.4 长文档、FAQ、表格、代码文档的切块策略有什么不同？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m02-chunking-strategies/q04-faq' }
                ]
              },
              {
                text: '3.3 Metadata 设计',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m03-metadata-design/' },
                  { text: '3.3.1 什么是元数据（Metadata）？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m03-metadata-design/q01-metadata' },
                  { text: '3.3.2 为什么 Metadata 对 RAG 很重要？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m03-metadata-design/q02-metadata-rag' },
                  { text: '3.3.3 常见的 Metadata 有哪些？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m03-metadata-design/q03-metadata' },
                  { text: '3.3.4 Metadata Filter 在检索阶段怎么用？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m03-metadata-design/q04-metadata-filter' },
                  { text: '3.3.5 为什么很多企业 RAG 效果差，本质上是 Metadata 设计不完整？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m03-metadata-design/q05-rag-metadata' }
                ]
              },
              {
                text: '3.4 检索用块与生成用块',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m04-retrieval-vs-generation-chunks/' },
                  { text: '3.4.1 为什么生产 RAG 经常要把“检索用块”和“生成用块”分开？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m04-retrieval-vs-generation-chunks/q01-rag' },
                  { text: '3.4.2 为什么有时小块更适合召回，但大块更适合生成？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m04-retrieval-vs-generation-chunks/q02-item' },
                  { text: '3.4.3 什么时候应该按文档级检索，什么时候按 Chunk 级检索？', link: '/rag/ch03-chunk-metadata-and-pre-index-design/m04-retrieval-vs-generation-chunks/q03-chunk' }
                ]
              }
            ]
          },
          {
            text: '第 4 章 索引构建与知识库更新',
            collapsed: true,
            items: [
              { text: '概览', link: '/rag/ch04-indexing-and-updates/' },
              {
                text: '4.1 索引是什么，索引在做什么',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch04-indexing-and-updates/m01-what-indexing-does/' },
                  { text: '4.1.1 向量数据库到底存了什么？', link: '/rag/ch04-indexing-and-updates/m01-what-indexing-does/q01-item' },
                  { text: '4.1.2 索引为什么不是“把文本存进去”这么简单？', link: '/rag/ch04-indexing-and-updates/m01-what-indexing-does/q02-item' },
                  { text: '4.1.3 文本、向量、关键词索引、元数据之间是什么关系？', link: '/rag/ch04-indexing-and-updates/m01-what-indexing-does/q03-item' }
                ]
              },
              {
                text: '4.2 索引构建的基本思路',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch04-indexing-and-updates/m02-indexing-basics/' },
                  { text: '4.2.1 为什么做完清洗和切块后，才能进入索引阶段？', link: '/rag/ch04-indexing-and-updates/m02-indexing-basics/q01-item' },
                  { text: '4.2.2 为什么索引质量会直接决定后续召回质量？', link: '/rag/ch04-indexing-and-updates/m02-indexing-basics/q02-item' },
                  { text: '4.2.3 为什么索引阶段的设计失误很难在 Prompt 层补回来？', link: '/rag/ch04-indexing-and-updates/m02-indexing-basics/q03-prompt' }
                ]
              },
              {
                text: '4.3 知识库更新与索引维护',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch04-indexing-and-updates/m03-index-maintenance/' },
                  { text: '4.3.1 知识库更新后，索引为什么不能只靠全量重建？', link: '/rag/ch04-indexing-and-updates/m03-index-maintenance/q01-item' },
                  { text: '4.3.2 全量重建在生产环境里会带来什么问题？', link: '/rag/ch04-indexing-and-updates/m03-index-maintenance/q02-item' },
                  { text: '4.3.3 增量更新索引通常怎么做？', link: '/rag/ch04-indexing-and-updates/m03-index-maintenance/q03-item' },
                  { text: '4.3.4 新增、修改、删除数据分别怎么同步到索引？', link: '/rag/ch04-indexing-and-updates/m03-index-maintenance/q04-item' },
                  { text: '4.3.5 如何避免旧 Chunk 残留、重复索引和脏数据？', link: '/rag/ch04-indexing-and-updates/m03-index-maintenance/q05-chunk' },
                  { text: '4.3.6 如何做版本管理、回滚和失效控制？', link: '/rag/ch04-indexing-and-updates/m03-index-maintenance/q06-item' }
                ]
              }
            ]
          },
          {
            text: '第 5 章 Embedding、BM25 与混合检索',
            collapsed: true,
            items: [
              { text: '概览', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/' },
              {
                text: '5.1 Embedding 的作用与原理',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m01-embedding/' },
                  { text: '5.1.1 什么是 Embedding？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m01-embedding/q01-embedding' },
                  { text: '5.1.2 Embedding 在 RAG 里到底负责什么？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m01-embedding/q02-embedding-rag' },
                  { text: '5.1.3 为什么 Embedding 能支持语义检索？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m01-embedding/q03-embedding' },
                  { text: '5.1.4 Embedding 模型应该怎么选？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m01-embedding/q04-embedding' }
                ]
              },
              {
                text: '5.2 向量检索的工作方式',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m02-vector-retrieval/' },
                  { text: '5.2.1 向量检索是怎么找到相似内容的？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m02-vector-retrieval/q01-item' },
                  { text: '5.2.2 Top K 应该怎么设？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m02-vector-retrieval/q02-top-k' },
                  { text: '5.2.3 相似度分数能不能直接当“正确率”看？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m02-vector-retrieval/q03-item' },
                  { text: '5.2.4 为什么只做向量检索通常不够？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m02-vector-retrieval/q04-item' }
                ]
              },
              {
                text: '5.3 稀疏检索与 BM25',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m03-bm25/' },
                  { text: '5.3.1 BM25 是什么？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m03-bm25/q01-bm25' },
                  { text: '5.3.2 BM25 和向量检索分别擅长解决什么问题？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m03-bm25/q02-bm25' },
                  { text: '5.3.3 为什么关键词匹配在很多场景下仍然很重要？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m03-bm25/q03-item' },
                  { text: '5.3.4 什么类型的问题更适合用 BM25？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m03-bm25/q04-bm25' }
                ]
              },
              {
                text: '5.4 混合检索与多路召回',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m04-hybrid-and-multi-retrieval/' },
                  { text: '5.4.1 什么是混合检索？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m04-hybrid-and-multi-retrieval/q01-item' },
                  { text: '5.4.2 为什么很多生产系统都用混合检索？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m04-hybrid-and-multi-retrieval/q02-item' },
                  { text: '5.4.3 为什么混合检索通常比单路检索更稳？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m04-hybrid-and-multi-retrieval/q03-item' },
                  { text: '5.4.4 什么是多路召回（Multi-Retrieval）？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m04-hybrid-and-multi-retrieval/q04-multi-retrieval' },
                  { text: '5.4.5 为什么单一路径召回经常不稳定？', link: '/rag/ch05-embedding-bm25-and-hybrid-retrieval/m04-hybrid-and-multi-retrieval/q05-item' }
                ]
              }
            ]
          },
          {
            text: '第 6 章 查询理解与检索链路设计',
            collapsed: true,
            items: [
              { text: '概览', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/' },
              {
                text: '6.1 为什么用户问题不能直接拿去检索',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m01-query-understanding/' },
                  { text: '6.1.1 用户问题进入 RAG 后，第一步为什么往往不是直接检索？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m01-query-understanding/q01-rag' },
                  { text: '6.1.2 为什么原始提问经常不适合作为最终检索词？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m01-query-understanding/q02-item' },
                  { text: '6.1.3 查询理解在 RAG 里的作用是什么？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m01-query-understanding/q03-rag' }
                ]
              },
              {
                text: '6.2 Query Rewrite 与 Query Expansion',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m02-rewrite-and-expansion/' },
                  { text: '6.2.1 什么是 Query Rewrite？什么时候要改写用户问题？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m02-rewrite-and-expansion/q01-query-rewrite' },
                  { text: '6.2.2 什么是 Query Expansion？什么时候要扩写查询？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m02-rewrite-and-expansion/q02-query-expansion' },
                  { text: '6.2.3 多轮对话场景下，RAG 为什么要先做问题重写？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m02-rewrite-and-expansion/q03-rag' },
                  { text: '6.2.4 为什么对话历史如果处理不好，会直接污染检索？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m02-rewrite-and-expansion/q04-item' }
                ]
              },
              {
                text: '6.3 检索阶段的筛选与路由',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m03-filtering-and-routing/' },
                  { text: '6.3.1 Metadata Filter 在检索阶段怎么用？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m03-filtering-and-routing/q01-metadata-filter' },
                  { text: '6.3.2 什么时候应该按文档级检索，什么时候按 Chunk 级检索？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m03-filtering-and-routing/q02-chunk' },
                  { text: '6.3.3 什么是路由检索（Router Retrieval）？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m03-filtering-and-routing/q03-router-retrieval' },
                  { text: '6.3.4 为什么不同问题类型应该走不同检索策略？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m03-filtering-and-routing/q04-item' }
                ]
              },
              {
                text: '6.4 大文档与复杂知识场景',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m04-large-and-complex-documents/' },
                  { text: '6.4.1 为什么大文档场景下，分层检索通常比直接 top-k chunk 更稳？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m04-large-and-complex-documents/q01-top-k-chunk' },
                  { text: '6.4.2 什么是分层检索（Hierarchical Retrieval）？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m04-large-and-complex-documents/q02-hierarchical-retrieval' },
                  { text: '6.4.3 什么是递归检索（Recursive Retrieval）？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m04-large-and-complex-documents/q03-recursive-retrieval' },
                  { text: '6.4.4 长文档、多文档、跨文档问题分别有什么不同？', link: '/rag/ch06-query-understanding-and-retrieval-pipeline/m04-large-and-complex-documents/q04-item' }
                ]
              }
            ]
          },
          {
            text: '第 7 章 重排、排序与结果精选',
            collapsed: true,
            items: [
              { text: '概览', link: '/rag/ch07-reranking-and-result-selection/' },
              {
                text: '7.1 为什么召回到了内容，模型还是答不好',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch07-reranking-and-result-selection/m01-why-retrieval-is-not-enough/' },
                  { text: '7.1.1 为什么召回到了内容，模型还是答不好？', link: '/rag/ch07-reranking-and-result-selection/m01-why-retrieval-is-not-enough/q01-item' },
                  { text: '7.1.2 为什么“能找到”和“排在前面”是两回事？', link: '/rag/ch07-reranking-and-result-selection/m01-why-retrieval-is-not-enough/q02-item' },
                  { text: '7.1.3 为什么“召回”与“排序”要拆开看？', link: '/rag/ch07-reranking-and-result-selection/m01-why-retrieval-is-not-enough/q03-item' }
                ]
              },
              {
                text: '7.2 Rerank 的作用与价值',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch07-reranking-and-result-selection/m02-rerank/' },
                  { text: '7.2.1 什么是重排（Rerank）？', link: '/rag/ch07-reranking-and-result-selection/m02-rerank/q01-rerank' },
                  { text: '7.2.2 它和初次召回有什么区别？', link: '/rag/ch07-reranking-and-result-selection/m02-rerank/q02-item' },
                  { text: '7.2.3 什么时候值得加 Reranker？', link: '/rag/ch07-reranking-and-result-selection/m02-rerank/q03-reranker' },
                  { text: '7.2.4 Reranker 更偏向优化召回率还是准确率？', link: '/rag/ch07-reranking-and-result-selection/m02-rerank/q04-reranker' }
                ]
              },
              {
                text: '7.3 检索结果的组织与精选',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch07-reranking-and-result-selection/m03-result-selection/' },
                  { text: '7.3.1 Top K 召回后，最终应该送几个结果给模型？', link: '/rag/ch07-reranking-and-result-selection/m03-result-selection/q01-top-k' },
                  { text: '7.3.2 为什么高分结果之间也要去重和聚合？', link: '/rag/ch07-reranking-and-result-selection/m03-result-selection/q02-item' },
                  { text: '7.3.3 文档级合并、Chunk 级合并、相邻块扩展分别适合什么情况？', link: '/rag/ch07-reranking-and-result-selection/m03-result-selection/q03-chunk' },
                  { text: '7.3.4 为什么排序策略会直接影响生成质量？', link: '/rag/ch07-reranking-and-result-selection/m03-result-selection/q04-item' }
                ]
              }
            ]
          },
          {
            text: '第 8 章 上下文构造与答案生成',
            collapsed: true,
            items: [
              { text: '概览', link: '/rag/ch08-context-construction-and-generation/' },
              {
                text: '8.1 为什么检索结果不能原样全塞给模型',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch08-context-construction-and-generation/m01-context-construction/' },
                  { text: '8.1.1 检索结果为什么不能原样全塞给模型？', link: '/rag/ch08-context-construction-and-generation/m01-context-construction/q01-item' },
                  { text: '8.1.2 RAG 的上下文构造到底在做什么？', link: '/rag/ch08-context-construction-and-generation/m01-context-construction/q02-rag' },
                  { text: '8.1.3 为什么上下文里要去重、排序和压缩？', link: '/rag/ch08-context-construction-and-generation/m01-context-construction/q03-item' },
                  { text: '8.1.4 什么时候应该“少给”，而不是“多给”？', link: '/rag/ch08-context-construction-and-generation/m01-context-construction/q04-item' }
                ]
              },
              {
                text: '8.2 不同任务的上下文组织方式',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch08-context-construction-and-generation/m02-task-specific-context/' },
                  { text: '8.2.1 检索式问答、总结式问答、对比式问答的上下文组织为什么不能一样？', link: '/rag/ch08-context-construction-and-generation/m02-task-specific-context/q01-item' },
                  { text: '8.2.2 长文档、多文档、跨文档问题的上下文应该怎么拼？', link: '/rag/ch08-context-construction-and-generation/m02-task-specific-context/q02-item' },
                  { text: '8.2.3 为什么上下文顺序会显著影响回答质量？', link: '/rag/ch08-context-construction-and-generation/m02-task-specific-context/q03-item' }
                ]
              },
              {
                text: '8.3 长上下文问题',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch08-context-construction-and-generation/m03-long-context/' },
                  { text: '8.3.1 什么是“lost in the middle”？', link: '/rag/ch08-context-construction-and-generation/m03-long-context/q01-lost-in-the-middle' },
                  { text: '8.3.2 它为什么会影响 RAG 效果？', link: '/rag/ch08-context-construction-and-generation/m03-long-context/q02-rag' },
                  { text: '8.3.3 怎样通过排序、摘要、压缩、结构化拼接减轻这个问题？', link: '/rag/ch08-context-construction-and-generation/m03-long-context/q03-item' }
                ]
              },
              {
                text: '8.4 RAG Prompt 设计',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch08-context-construction-and-generation/m04-rag-prompting/' },
                  { text: '8.4.1 RAG Prompt 应该怎么写，才能减少模型乱答？', link: '/rag/ch08-context-construction-and-generation/m04-rag-prompting/q01-rag-prompt' },
                  { text: '8.4.2 为什么很多 RAG 系统要求模型“只基于提供材料作答”？', link: '/rag/ch08-context-construction-and-generation/m04-rag-prompting/q02-rag' },
                  { text: '8.4.3 什么时候应该要求模型引用来源？', link: '/rag/ch08-context-construction-and-generation/m04-rag-prompting/q03-item' },
                  { text: '8.4.4 RAG 回答里如何处理“资料不足”的情况？', link: '/rag/ch08-context-construction-and-generation/m04-rag-prompting/q04-rag' }
                ]
              },
              {
                text: '8.5 生成阶段常见错误',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch08-context-construction-and-generation/m05-generation-errors/' },
                  { text: '8.5.1 RAG 生成阶段最常见的错误有哪些？', link: '/rag/ch08-context-construction-and-generation/m05-generation-errors/q01-rag' },
                  { text: '8.5.2 为什么有材料，模型仍可能答非所问？', link: '/rag/ch08-context-construction-and-generation/m05-generation-errors/q02-item' },
                  { text: '8.5.3 为什么“引用了来源”也不一定代表回答忠实？', link: '/rag/ch08-context-construction-and-generation/m05-generation-errors/q03-item' }
                ]
              }
            ]
          },
          {
            text: '第 9 章 RAG 评测体系与错误归因',
            collapsed: true,
            items: [
              { text: '概览', link: '/rag/ch09-evaluation-and-error-analysis/' },
              {
                text: '9.1 为什么不能只看最终回答',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch09-evaluation-and-error-analysis/m01-end-to-end-is-not-enough/' },
                  { text: '9.1.1 为什么不能只看最终回答，必须拆开评测 RAG？', link: '/rag/ch09-evaluation-and-error-analysis/m01-end-to-end-is-not-enough/q01-rag' },
                  { text: '9.1.2 RAG 评测为什么通常分检索层、生成层、端到端层？', link: '/rag/ch09-evaluation-and-error-analysis/m01-end-to-end-is-not-enough/q02-rag' },
                  { text: '9.1.3 为什么一个端到端分数无法告诉你系统真正的问题在哪？', link: '/rag/ch09-evaluation-and-error-analysis/m01-end-to-end-is-not-enough/q03-item' }
                ]
              },
              {
                text: '9.2 检索层评测',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch09-evaluation-and-error-analysis/m02-retrieval-evaluation/' },
                  { text: '9.2.1 Recall@K、Precision@K、MRR、nDCG 分别在看什么？', link: '/rag/ch09-evaluation-and-error-analysis/m02-retrieval-evaluation/q01-recall-k-precision-k-mrr-ndcg' },
                  { text: '9.2.2 怎么评估检索结果到底好不好？', link: '/rag/ch09-evaluation-and-error-analysis/m02-retrieval-evaluation/q02-item' },
                  { text: '9.2.3 召回率高为什么不代表用户体验一定好？', link: '/rag/ch09-evaluation-and-error-analysis/m02-retrieval-evaluation/q03-item' },
                  { text: '9.2.4 准确率高为什么有时又意味着覆盖不足？', link: '/rag/ch09-evaluation-and-error-analysis/m02-retrieval-evaluation/q04-item' }
                ]
              },
              {
                text: '9.3 生成层与忠实性评测',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch09-evaluation-and-error-analysis/m03-generation-evaluation/' },
                  { text: '9.3.1 怎么评估回答是否忠于检索内容？', link: '/rag/ch09-evaluation-and-error-analysis/m03-generation-evaluation/q01-item' },
                  { text: '9.3.2 什么是 Groundedness / Faithfulness？', link: '/rag/ch09-evaluation-and-error-analysis/m03-generation-evaluation/q02-groundedness-faithfulness' },
                  { text: '9.3.3 怎么判断 RAG 有没有幻觉？', link: '/rag/ch09-evaluation-and-error-analysis/m03-generation-evaluation/q03-rag' },
                  { text: '9.3.4 什么是 LLM-as-a-Judge？什么时候适合用？', link: '/rag/ch09-evaluation-and-error-analysis/m03-generation-evaluation/q04-llm-as-a-judge' }
                ]
              },
              {
                text: '9.4 评测集构建',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch09-evaluation-and-error-analysis/m04-eval-dataset/' },
                  { text: '9.4.1 RAG 评测集应该怎么构建？', link: '/rag/ch09-evaluation-and-error-analysis/m04-eval-dataset/q01-rag' },
                  { text: '9.4.2 为什么评测问题必须覆盖不同任务类型？', link: '/rag/ch09-evaluation-and-error-analysis/m04-eval-dataset/q02-item' },
                  { text: '9.4.3 为什么线上真实问题和离线样本经常差很多？', link: '/rag/ch09-evaluation-and-error-analysis/m04-eval-dataset/q03-item' }
                ]
              },
              {
                text: '9.5 错误分型与归因',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch09-evaluation-and-error-analysis/m05-error-taxonomy/' },
                  { text: '9.5.1 一个 RAG 错误，怎么判断到底是“没召回到”还是“召回到了没用好”？', link: '/rag/ch09-evaluation-and-error-analysis/m05-error-taxonomy/q01-rag' },
                  { text: '9.5.2 RAG 常见错误类型有哪些？', link: '/rag/ch09-evaluation-and-error-analysis/m05-error-taxonomy/q02-rag' },
                  { text: '9.5.3 如何建立问题分类和误差归因机制？', link: '/rag/ch09-evaluation-and-error-analysis/m05-error-taxonomy/q03-item' },
                  { text: '9.5.4 为什么 RAG 调优必须建立错误分桶，而不能靠随机试参？', link: '/rag/ch09-evaluation-and-error-analysis/m05-error-taxonomy/q04-rag' }
                ]
              }
            ]
          },
          {
            text: '第 10 章 RAG 调优方法论',
            collapsed: true,
            items: [
              { text: '概览', link: '/rag/ch10-optimization-methodology/' },
              {
                text: '10.1 效果不好时先查哪里',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch10-optimization-methodology/m01-where-to-debug-first/' },
                  { text: '10.1.1 RAG 效果不好时，应该先查检索还是先查 Prompt？', link: '/rag/ch10-optimization-methodology/m01-where-to-debug-first/q01-rag-prompt' },
                  { text: '10.1.2 为什么很多问题表面看是模型问题，本质上却是数据或检索问题？', link: '/rag/ch10-optimization-methodology/m01-where-to-debug-first/q02-item' },
                  { text: '10.1.3 什么情况下应该先动 Chunk，什么情况下应该先动 Rerank，什么情况下该动 Prompt？', link: '/rag/ch10-optimization-methodology/m01-where-to-debug-first/q03-chunk-rerank-prompt' }
                ]
              },
              {
                text: '10.2 召回率、准确率与成本的平衡',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch10-optimization-methodology/m02-balance-quality-cost/' },
                  { text: '10.2.1 如何优化召回率，如何优化准确率，它们为什么经常冲突？', link: '/rag/ch10-optimization-methodology/m02-balance-quality-cost/q01-item' },
                  { text: '10.2.2 TopK、Rerank、上下文长度之间如何平衡？', link: '/rag/ch10-optimization-methodology/m02-balance-quality-cost/q02-top-k-rerank' },
                  { text: '10.2.3 如何平衡效果、延迟和成本？', link: '/rag/ch10-optimization-methodology/m02-balance-quality-cost/q03-item' }
                ]
              },
              {
                text: '10.3 常见优化抓手',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch10-optimization-methodology/m03-common-optimization-levers/' },
                  { text: '10.3.1 Chunk 策略不合理会带来哪些典型问题？', link: '/rag/ch10-optimization-methodology/m03-common-optimization-levers/q01-chunk' },
                  { text: '10.3.2 为什么混合检索通常比单路检索更稳？', link: '/rag/ch10-optimization-methodology/m03-common-optimization-levers/q02-item' },
                  { text: '10.3.3 什么时候值得加 Reranker？', link: '/rag/ch10-optimization-methodology/m03-common-optimization-levers/q03-reranker' },
                  { text: '10.3.4 上下文太长时，有哪些常见压缩方法？', link: '/rag/ch10-optimization-methodology/m03-common-optimization-levers/q04-item' },
                  { text: '10.3.5 长文档、多文档、跨文档问题分别怎么优化？', link: '/rag/ch10-optimization-methodology/m03-common-optimization-levers/q05-item' }
                ]
              },
              {
                text: '10.4 建立系统化调优闭环',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch10-optimization-methodology/m04-optimization-loop/' },
                  { text: '10.4.1 为什么 RAG 调优必须建立问题分类和误差归因机制？', link: '/rag/ch10-optimization-methodology/m04-optimization-loop/q01-rag' },
                  { text: '10.4.2 为什么没有评测闭环的优化很容易“局部提升、整体退化”？', link: '/rag/ch10-optimization-methodology/m04-optimization-loop/q02-item' },
                  { text: '10.4.3 如何通过实验设计验证某个优化是否真的有效？', link: '/rag/ch10-optimization-methodology/m04-optimization-loop/q03-item' }
                ]
              }
            ]
          },
          {
            text: '第 11 章 生产级 RAG 工程实践',
            collapsed: true,
            items: [
              { text: '概览', link: '/rag/ch11-production-engineering/' },
              {
                text: '11.1 一个能上线的 RAG 系统还需要什么',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch11-production-engineering/m01-production-capabilities/' },
                  { text: '11.1.1 一个能上线的 RAG 系统除了主链路，还需要哪些工程能力？', link: '/rag/ch11-production-engineering/m01-production-capabilities/q01-rag' },
                  { text: '11.1.2 为什么很多企业场景仍然会保留传统搜索入口？', link: '/rag/ch11-production-engineering/m01-production-capabilities/q02-item' },
                  { text: '11.1.3 什么时候应该只返回检索结果，不做生成？', link: '/rag/ch11-production-engineering/m01-production-capabilities/q03-item' }
                ]
              },
              {
                text: '11.2 性能、缓存与高并发',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch11-production-engineering/m02-performance-and-caching/' },
                  { text: '11.2.1 RAG 为什么需要缓存？', link: '/rag/ch11-production-engineering/m02-performance-and-caching/q01-rag' },
                  { text: '11.2.2 哪些环节适合做缓存？', link: '/rag/ch11-production-engineering/m02-performance-and-caching/q02-item' },
                  { text: '11.2.3 如何处理高并发下的检索和生成延迟问题？', link: '/rag/ch11-production-engineering/m02-performance-and-caching/q03-item' },
                  { text: '11.2.4 如何设计检索、重排、生成链路的降级策略？', link: '/rag/ch11-production-engineering/m02-performance-and-caching/q04-item' }
                ]
              },
              {
                text: '11.3 日志、观测与故障排查',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch11-production-engineering/m03-observability/' },
                  { text: '11.3.1 如何做 RAG 的日志、观测和故障排查？', link: '/rag/ch11-production-engineering/m03-observability/q01-rag' },
                  { text: '11.3.2 线上 RAG 系统应该监控哪些指标？', link: '/rag/ch11-production-engineering/m03-observability/q02-rag' },
                  { text: '11.3.3 一次失败回答上线后，应该如何快速定位问题出在哪一层？', link: '/rag/ch11-production-engineering/m03-observability/q03-item' }
                ]
              },
              {
                text: '11.4 发布、灰度与风险控制',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch11-production-engineering/m04-release-and-risk-control/' },
                  { text: '11.4.1 RAG 检索策略升级时如何做灰度发布？', link: '/rag/ch11-production-engineering/m04-release-and-risk-control/q01-rag' },
                  { text: '11.4.2 模型、Prompt、索引升级时如何做回滚？', link: '/rag/ch11-production-engineering/m04-release-and-risk-control/q02-prompt' },
                  { text: '11.4.3 企业落地 RAG 时最常见的风险是什么？', link: '/rag/ch11-production-engineering/m04-release-and-risk-control/q03-rag' },
                  { text: '11.4.4 冷启动阶段没有日志、没有评测集时，系统该如何起步？', link: '/rag/ch11-production-engineering/m04-release-and-risk-control/q04-item' }
                ]
              }
            ]
          },
          {
            text: '第 12 章 高级 RAG 形态与升级路径',
            collapsed: true,
            items: [
              { text: '概览', link: '/rag/ch12-advanced-rag-and-upgrades/' },
              {
                text: '12.1 为了解决“检索不稳”',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch12-advanced-rag-and-upgrades/m01-unstable-retrieval/' },
                  { text: '12.1.1 什么是多路召回（Multi-Retrieval）？', link: '/rag/ch12-advanced-rag-and-upgrades/m01-unstable-retrieval/q01-multi-retrieval' },
                  { text: '12.1.2 什么是路由检索（Router Retrieval）？', link: '/rag/ch12-advanced-rag-and-upgrades/m01-unstable-retrieval/q02-router-retrieval' },
                  { text: '12.1.3 为什么复杂问题常常不适合只走一条召回链路？', link: '/rag/ch12-advanced-rag-and-upgrades/m01-unstable-retrieval/q03-item' }
                ]
              },
              {
                text: '12.2 为了解决“大文档与复杂结构”',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch12-advanced-rag-and-upgrades/m02-large-docs-and-structure/' },
                  { text: '12.2.1 什么是分层检索（Hierarchical Retrieval）？', link: '/rag/ch12-advanced-rag-and-upgrades/m02-large-docs-and-structure/q01-hierarchical-retrieval' },
                  { text: '12.2.2 什么是递归检索（Recursive Retrieval）？', link: '/rag/ch12-advanced-rag-and-upgrades/m02-large-docs-and-structure/q02-recursive-retrieval' },
                  { text: '12.2.3 为什么复杂文档结构下，简单 top-k chunk 容易失效？', link: '/rag/ch12-advanced-rag-and-upgrades/m02-large-docs-and-structure/q03-top-k-chunk' }
                ]
              },
              {
                text: '12.3 为了解决“检索质量不稳定”',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch12-advanced-rag-and-upgrades/m03-retrieval-quality/' },
                  { text: '12.3.1 什么是纠错型 RAG（Corrective RAG / CRAG）？', link: '/rag/ch12-advanced-rag-and-upgrades/m03-retrieval-quality/q01-rag-corrective-rag-crag' },
                  { text: '12.3.2 什么是 Self-RAG？', link: '/rag/ch12-advanced-rag-and-upgrades/m03-retrieval-quality/q02-self-rag' },
                  { text: '12.3.3 Self-RAG 和普通 RAG 有什么区别？', link: '/rag/ch12-advanced-rag-and-upgrades/m03-retrieval-quality/q03-self-rag-rag' },
                  { text: '12.3.4 什么情况下值得引入“检索结果自检”机制？', link: '/rag/ch12-advanced-rag-and-upgrades/m03-retrieval-quality/q04-item' }
                ]
              },
              {
                text: '12.4 为了解决“任务不只是问答”',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch12-advanced-rag-and-upgrades/m04-task-beyond-qa/' },
                  { text: '12.4.1 Agent 和 RAG 应该怎么结合？', link: '/rag/ch12-advanced-rag-and-upgrades/m04-task-beyond-qa/q01-agent-rag' },
                  { text: '12.4.2 什么时候 RAG 应该升级为“Agentic Retrieval”？', link: '/rag/ch12-advanced-rag-and-upgrades/m04-task-beyond-qa/q02-rag-agentic-retrieval' },
                  { text: '12.4.3 什么时候问题已经不是“检索增强生成”，而是“任务规划 + 工具调用 + 检索”？', link: '/rag/ch12-advanced-rag-and-upgrades/m04-task-beyond-qa/q03-item' }
                ]
              },
              {
                text: '12.5 为了解决“数据形态更复杂”',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch12-advanced-rag-and-upgrades/m05-more-complex-data/' },
                  { text: '12.5.1 结构化数据和非结构化数据怎么一起做 RAG？', link: '/rag/ch12-advanced-rag-and-upgrades/m05-more-complex-data/q01-rag' },
                  { text: '12.5.2 多模态 RAG 和文本 RAG 的核心差别是什么？', link: '/rag/ch12-advanced-rag-and-upgrades/m05-more-complex-data/q02-rag-rag' },
                  { text: '12.5.3 图片、表格、图表、代码等内容进入 RAG 时，核心难点分别是什么？', link: '/rag/ch12-advanced-rag-and-upgrades/m05-more-complex-data/q03-rag' }
                ]
              }
            ]
          },
          {
            text: '第 13 章 从 0 到 1 搭一个最小可用 RAG',
            collapsed: true,
            items: [
              { text: '概览', link: '/rag/ch13-build-a-minimum-viable-rag/' },
              {
                text: '13.1 最小 Demo 版 RAG',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch13-build-a-minimum-viable-rag/m01-minimum-demo/' },
                  { text: '13.1.1 从 0 搭一个最小 RAG 系统需要哪些步骤？', link: '/rag/ch13-build-a-minimum-viable-rag/m01-minimum-demo/q01-0-rag' },
                  { text: '13.1.2 文档清洗、切块、Embedding、入库、检索、生成分别怎么串起来？', link: '/rag/ch13-build-a-minimum-viable-rag/m01-minimum-demo/q02-embedding' },
                  { text: '13.1.3 一个最小 Demo 最应该先保证什么，而不是先优化什么？', link: '/rag/ch13-build-a-minimum-viable-rag/m01-minimum-demo/q03-demo' }
                ]
              },
              {
                text: '13.2 从 Demo 到生产的关键升级',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch13-build-a-minimum-viable-rag/m02-demo-to-production/' },
                  { text: '13.2.1 一个 Demo 版和生产版最大的差别是什么？', link: '/rag/ch13-build-a-minimum-viable-rag/m02-demo-to-production/q01-demo' },
                  { text: '13.2.2 第一次上线时，最值得优先补齐的 3~5 个能力是什么？', link: '/rag/ch13-build-a-minimum-viable-rag/m02-demo-to-production/q02-3-5' },
                  { text: '13.2.3 为什么很多团队卡在“Demo 很顺，落地很难”这一步？', link: '/rag/ch13-build-a-minimum-viable-rag/m02-demo-to-production/q03-demo' }
                ]
              },
              {
                text: '13.3 一个务实的落地顺序',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch13-build-a-minimum-viable-rag/m03-pragmatic-roadmap/' },
                  { text: '13.3.1 如果资源有限，RAG 应该优先做哪些能力？', link: '/rag/ch13-build-a-minimum-viable-rag/m03-pragmatic-roadmap/q01-rag' },
                  { text: '13.3.2 哪些优化适合早做，哪些优化适合后做？', link: '/rag/ch13-build-a-minimum-viable-rag/m03-pragmatic-roadmap/q02-item' },
                  { text: '13.3.3 一个务实的 RAG 演进路线应该是什么样？', link: '/rag/ch13-build-a-minimum-viable-rag/m03-pragmatic-roadmap/q03-rag' }
                ]
              }
            ]
          },
          {
            text: '第 14 章 常见误区与设计原则总结',
            collapsed: true,
            items: [
              { text: '概览', link: '/rag/ch14-misconceptions-and-principles/' },
              {
                text: '14.1 常见误区',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/' },
                  { text: '14.1.1 RAG 不是把资料塞给模型就行，为什么？', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/q01-rag' },
                  { text: '14.1.2 Chunk 不是越小越好，也不是越大越好，为什么？', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/q02-chunk' },
                  { text: '14.1.3 TopK 不是越大越好，为什么？', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/q03-top-k' },
                  { text: '14.1.4 相似度高不等于答案就一定对，为什么？', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/q04-item' },
                  { text: '14.1.5 召回到了不等于模型就能答好，为什么？', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/q05-item' },
                  { text: '14.1.6 RAG 效果差时，为什么不能第一反应就怪模型？', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/q06-rag' },
                  { text: '14.1.7 为什么“有知识库”不等于“知识真的可用”？', link: '/rag/ch14-misconceptions-and-principles/m01-common-misconceptions/q07-item' }
                ]
              },
              {
                text: '14.2 一套实用设计原则',
                collapsed: true,
                items: [
                  { text: '概览', link: '/rag/ch14-misconceptions-and-principles/m02-practical-principles/' },
                  { text: '14.2.1 做 RAG 时，为什么应该优先保证“可用、可控、可评测”，再追求“高级”？', link: '/rag/ch14-misconceptions-and-principles/m02-practical-principles/q01-rag' },
                  { text: '14.2.2 为什么 RAG 的核心不是某个单点技术，而是整条链路协同？', link: '/rag/ch14-misconceptions-and-principles/m02-practical-principles/q02-rag' },
                  { text: '14.2.3 一个成熟 RAG 系统最重要的设计原则有哪些？', link: '/rag/ch14-misconceptions-and-principles/m02-practical-principles/q03-rag' }
                ]
              }
            ]
          }
        ]
      },
],
}

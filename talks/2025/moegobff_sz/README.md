# 现代化 BFF 架构：类型安全的端到端实践

这是一个关于现代化 BFF (Backend for Frontend) 架构的技术分享，重点介绍了端到端类型安全、Codec 机制、自动化工具链和 RESTful 风格的错误处理。

## 演讲内容概要

### 核心主题

1. **端到端类型安全**
   - Single Source of Truth 理念
   - Proto → Zod → OpenAPI 自动生成流程
   - ast-grep 在代码生成中的应用
   - 循环引用处理的演进历程（从 z.lazy 到 getter）
   - 运行时校验机制

2. **Codec 机制**
   - 双向数据转换能力（encode/decode）
   - 内置 Codec：zId（BigInt ↔ string）
   - 内置 Codec：zDate（ISO string ↔ GoogleDate）
   - Codec vs Transform 的对比

3. **开发效率**
   - 自动化工作流（2 分钟完成 API 更新）
   - 交互式路由创建（pnpm cr）
   - CI/CD 自动发包流程
   - 效率提升 10 倍的实际对比

4. **错误处理机制**
   - 与后端大仓的错误码协作规范
   - gRPC 错误码到 HTTP 状态码的映射
   - 全局错误处理中间件
   - RESTful 风格 vs RPC 风格的对比
   - 链路追踪与可观测性提升

## 技术栈

- **Web 框架**: Hono
- **Schema 验证**: Zod + @hono/zod-openapi
- **后端通信**: Connect RPC (gRPC)
- **代码生成**: ast-grep
- **链路追踪**: dd-trace (Datadog APM)
- **演示框架**: Slidev

## 本地运行

### 前置要求

- Node.js >= 18
- pnpm

### 安装依赖

```bash
# 在项目根目录
pnpm install
```

### 启动开发服务器

```bash
cd talks/2025/moegobff_sz/src
pnpm dev
```

访问 http://localhost:3030 查看演示文稿。

### 构建静态文件

```bash
cd talks/2025/moegobff_sz/src
pnpm build
```

构建产物会输出到 `talks/dist/moegobff_sz` 目录。

### 导出 PDF

```bash
cd talks/2025/moegobff_sz/src
pnpm export
```

会在 `talks/2025/moegobff_sz` 目录下生成 `moegobff_sz.pdf` 文件。

## 目录结构

```
talks/2025/moegobff_sz/
├── src/
│   ├── slides.md              # 演示文稿主文件
│   ├── public/
│   │   └── tldraw/            # tldraw 图形文件
│   │       ├── doc-bff-architecture-overview.json
│   │       ├── doc-traditional-bff-pain-points.json
│   │       ├── doc-schema-isomorphism-flow.json
│   │       ├── doc-proto-to-zod-pipeline.json
│   │       ├── doc-ast-grep-concepts.json
│   │       ├── doc-circular-reference-evolution.json
│   │       ├── doc-codec-bidirectional-flow.json
│   │       ├── doc-error-handling-architecture.json
│   │       └── ... (更多图形文件)
│   ├── components/            # Vue 组件
│   ├── style.css              # 自定义样式
│   ├── package.json
│   ├── vite.config.ts
│   └── unocss.config.ts
├── moego-bff/                 # BFF 源代码仓库
└── README.md                  # 本文件
```

## 图形文件说明

所有 tldraw 图形文件都位于 `src/public/tldraw/` 目录下，包括：

### 基础架构
- `doc-bff-architecture-overview.json` - BFF 整体架构位置图
- `doc-traditional-bff-pain-points.json` - 传统方案痛点对比
- `doc-traditional-workflow-complexity.json` - 传统开发流程复杂度

### Schema 同构
- `doc-schema-isomorphism-flow.json` - Schema 同构流程
- `doc-proto-to-zod-pipeline.json` - Proto → Zod 生成管道
- `doc-ast-grep-concepts.json` - ast-grep 核心概念
- `doc-ast-grep-transformation.json` - AST 转换流程

### 循环引用
- `doc-circular-reference-evolution.json` - 循环引用处理演进历程
- `doc-zlazy-type-problems.json` - z.lazy 类型困境
- `doc-getter-two-phase-transform.json` - getter 两阶段转换流程

### Codec 机制
- `doc-codec-bidirectional-flow.json` - Codec 双向转换边界
- `doc-codec-vs-transform.json` - Codec vs Transform 对比

### 错误处理
- `doc-error-handling-architecture.json` - 错误处理架构
- `doc-rpc-vs-restful-error.json` - RPC vs RESTful 错误处理对比
- `doc-error-tracing-flow.json` - 错误码映射与链路追踪流程

### 开发效率
- `doc-automation-workflow.json` - 自动化工作流
- `doc-cicd-pipeline.json` - CI/CD 发包流程
- `doc-development-efficiency-comparison.json` - 开发效率对比
- `doc-openapi-client-generation.json` - OpenAPI Client 生成流程

### 技术架构
- `doc-tech-stack-overview.json` - 技术栈总览
- `doc-cluster-architecture.json` - 多进程架构

## 演讲备注

每一页演示文稿都包含了详细的演讲备注（在 HTML 注释中），可以在演讲者模式下查看。

在开发模式下，按 `?` 键可以查看所有快捷键，按 `o` 键可以查看演讲者备注。

## 相关资源

- [Slidev 文档](https://sli.dev/)
- [ast-grep 文档](https://ast-grep.github.io/)
- [Zod 文档](https://zod.dev/)
- [Hono 文档](https://hono.dev/)
- [tldraw 文档](https://tldraw.dev/)

## 作者

Doctor Wu

- GitHub: [@Doctor-wu](https://github.com/Doctor-wu)
- Twitter: [@Doctorwu666](https://twitter.com/Doctorwu666)
- 个人网站: [doctorwu.me](https://doctorwu.me)

## License

MIT

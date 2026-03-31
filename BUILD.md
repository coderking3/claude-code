# Claude Code 源码构建与运行指南

> 版本: 2.1.88  
> 源码来源: 从 `@anthropic-ai/claude-code` npm 包的 `cli.js.map` 中提取

## 项目概况

Claude Code 是 Anthropic 的 AI 编码助手 CLI 工具。源码使用 **TypeScript** 编写，使用 **Bun** 作为打包工具，
最终产出一个单文件 `cli.js`（~29MB），通过 **Node.js >= 18** 运行。

### 架构总览

```
src/
├── entrypoints/
│   ├── cli.tsx          # CLI 引导入口（argv 快速路径分发）
│   ├── init.ts          # 共享初始化逻辑（配置、遥测、策略等）
│   ├── mcp.ts           # MCP stdio 服务端入口
│   ├── agentSdkTypes.ts # Agent SDK 类型聚合导出
│   ├── sandboxTypes.ts  # 沙箱配置 Zod schema
│   └── sdk/             # SDK 协议定义（coreSchemas, controlSchemas 等）
├── main.tsx             # 完整 CLI 主入口（4684 行，由 cli.tsx 动态加载）
├── tools/               # 所有工具实现（Bash, FileEdit, Agent, MCP, WebSearch 等）
├── commands/            # 斜杠命令（/compact, /model, /plan, /resume 等）
├── services/            # 核心服务（API, MCP, LSP, OAuth, Analytics 等）
├── components/          # Ink/React 终端 UI 组件
├── utils/               # 工具函数（git, bash, permissions, sandbox 等）
├── state/               # 全局状态管理
├── hooks/               # React hooks
├── types/               # TypeScript 类型定义
│   ├── bun-bundle.d.ts  # bun:bundle 模块类型存根
│   ├── bun-ffi.d.ts     # bun:ffi 模块类型存根
│   └── macros.d.ts      # MACRO.* 构建时宏类型定义
└── ...
```

### 运行链路

```
cli.js (Node.js 执行)
  └── src/entrypoints/cli.tsx     # 引导入口
        ├── --version → 直接输出 MACRO.VERSION（零依赖快速路径）
        ├── --mcp → src/entrypoints/mcp.ts
        ├── --bridge → bridge 模式
        └── 默认 → dynamic import('../main.js')
              └── src/main.tsx    # 完整 CLI（Commander.js 解析参数 → 启动 REPL）
```

## 构建工具链

### Bun（打包器）

项目使用 [Bun](https://bun.sh/) 作为打包器，有两个 Bun 特有的依赖：

1. **`bun:bundle`** — 提供 `feature()` 函数，用于构建时 feature flag 和 dead code elimination (DCE)
2. **`bun:ffi`** — 用于 upstream proxy 模块的 FFI 调用（Linux 条件分支）

### 构建时宏 (`MACRO.*`)

通过 Bun 的 `--define` 注入，在构建时替换为字面量值：

| 宏 | 说明 |
|---|---|
| `MACRO.VERSION` | 版本号 (如 `"2.1.88"`) |
| `MACRO.PACKAGE_URL` | npm 包名 |
| `MACRO.NATIVE_PACKAGE_URL` | 原生安装器包名 |
| `MACRO.BUILD_TIME` | 构建时间 (ISO 8601) |
| `MACRO.VERSION_CHANGELOG` | 发布说明 |
| `MACRO.ISSUES_EXPLAINER` | 问题反馈指引 |
| `MACRO.FEEDBACK_CHANNEL` | 反馈渠道 |

### Feature Flags

通过 `feature('FLAG_NAME')` 控制，编译时确定值，用于 DCE：

- `ABLATION_BASELINE` — 科学实验基线
- `DUMP_SYSTEM_PROMPT` — 导出系统提示词
- `COORDINATOR_MODE` — 协调器模式
- `KAIROS` — Kairos 功能
- `BRIDGE_MODE` — Bridge 连接模式
- `DAEMON` — 守护进程模式
- `BG_SESSIONS` — 后台会话
- `VOICE_MODE` — 语音模式
- `WEB_BROWSER_TOOL` — 浏览器工具
- `DIRECT_CONNECT` — 直连模式
- `SSH_REMOTE` — SSH 远程
- 以及更多 30+ feature flags...

## 如何构建

### 前置要求

- [Bun](https://bun.sh/) >= 1.1（打包器）
- [Node.js](https://nodejs.org/) >= 18（运行时）

### 安装依赖

```bash
bun install
```

### 打包构建

**方式一：带 source map（输出到目录）**

```bash
bun build src/entrypoints/cli.tsx \
  --outdir=dist \
  --entry-naming=cli.js \
  --target=node \
  --format=esm \
  --sourcemap=external \
  --define 'MACRO.VERSION="2.1.88"' \
  --define 'MACRO.PACKAGE_URL="@anthropic-ai/claude-code"' \
  --define 'MACRO.NATIVE_PACKAGE_URL="claude-code-native"' \
  --define 'MACRO.BUILD_TIME="'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
  --define 'MACRO.VERSION_CHANGELOG=""' \
  --define 'MACRO.ISSUES_EXPLAINER="Report issues at https://github.com/anthropics/claude-code/issues"' \
  --define 'MACRO.FEEDBACK_CHANNEL="https://github.com/anthropics/claude-code/issues"'
```

产出在 `dist/` 目录：
- `dist/cli.js` — 可执行的单文件 Node.js ESM bundle（~29MB）
- `dist/cli.js.map` — Source map

**方式二：不带 source map（直接输出单文件）**

```bash
bun build src/entrypoints/cli.tsx \
  --outfile=cli.js \
  --target=node \
  --format=esm \
  --define 'MACRO.VERSION="2.1.88"' \
  --define 'MACRO.PACKAGE_URL="@anthropic-ai/claude-code"' \
  --define 'MACRO.NATIVE_PACKAGE_URL="claude-code-native"' \
  --define 'MACRO.BUILD_TIME="'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
  --define 'MACRO.VERSION_CHANGELOG=""' \
  --define 'MACRO.ISSUES_EXPLAINER="Report issues at https://github.com/anthropics/claude-code/issues"' \
  --define 'MACRO.FEEDBACK_CHANNEL="https://github.com/anthropics/claude-code/issues"'
```

产出物：
- `cli.js` — 可执行的单文件 Node.js ESM bundle（~29MB）

### 开发模式运行（Bun 直接跑源码）

通过 dev 入口可以用 Bun 直接运行源码，无需打包：

```bash
bun run src/entrypoints/dev.ts
```

`dev.ts` 会在 `globalThis` 上注入 `MACRO.*` 变量（构建时由 `--define` 注入），然后动态 import `cli.tsx`。

> ⚠️ 注意：Node.js 不能直接运行 `.tsx` 源码，必须先 `bun build` 打包。

### 运行已构建的产物

```bash
# 通过 Node.js 运行
node cli.js

# 或直接执行（已有 shebang）
chmod +x cli.js
./cli.js
```

### 通过 npm 全局安装运行（官方方式）

```bash
npm install -g @anthropic-ai/claude-code
claude
```

## 全局 Bun API 使用

源码中大量使用 `typeof Bun !== 'undefined'` 分支判断：

- **`Bun.gc`** — 定时垃圾回收
- **`Bun.listen`** — TCP 监听（upstream proxy）
- **`Bun.hash`** — 快速哈希
- **`Bun.YAML`** — YAML 解析
- **`Bun.semver`** — 版本比较
- **`Bun.which`** — 查找可执行文件
- **`Bun.spawn`** — 子进程
- **`Bun.JSONL`** — JSONL 解析
- **`Bun.stringWidth`** — 字符串宽度计算
- **`Bun.wrapAnsi`** — ANSI 文本换行
- **`Bun.generateHeapSnapshot`** — 堆快照
- **`Bun.embeddedFiles`** — 嵌入式资源检测

这些 API 在 Node.js 环境下都有对应的 fallback 实现。

## 关键依赖说明

| 依赖 | 用途 |
|---|---|
| `@anthropic-ai/sdk` | Anthropic API 客户端 |
| `@modelcontextprotocol/sdk` | MCP 协议实现 |
| `react` + `react-reconciler` | Ink 终端 UI 渲染引擎 |
| `@commander-js/extra-typings` | CLI 参数解析（类型安全） |
| `chalk` | 终端颜色 |
| `zod` | 运行时类型校验 |
| `lodash-es` | 工具函数库 |
| `@opentelemetry/*` | 可观测性/遥测 |
| `@growthbook/growthbook` | Feature flag 管理（运行时） |
| `ws` | WebSocket（MCP、远程连接） |
| `chokidar` | 文件监听 |
| `diff` | 文本差异计算 |
| `sharp` | 图片处理 |
| `highlight.js` | 语法高亮 |
| `marked` + `turndown` | Markdown 处理 |
| `yaml` | YAML 解析 |
| `ajv` | JSON Schema 校验 |
| `google-auth-library` | GCP 认证（Vertex AI） |
| `@aws-sdk/*` | AWS 认证（Bedrock） |
| `@azure/identity` | Azure 认证 |

## 项目文件统计

- 总源文件数: 4756
- src/ 下 TypeScript 文件: 1902
- node_modules/ 下第三方源码: 2850
- vendor/ 下原生模块源码: 4 个子目录

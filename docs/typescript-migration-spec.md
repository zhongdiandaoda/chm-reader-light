# TypeScript Migration Specification

## Objective

将 CHM Reader 的应用源码和测试从 JavaScript/CommonJS 迁移到 TypeScript，保留现有 Electron 桌面行为、CHM 解析能力、搜索索引、worker、测试命令和 macOS 打包流程。

迁移完成后：

- `src/` 中的应用逻辑使用 `.ts` 文件。
- `test/` 中的测试使用 TypeScript。
- Electron 运行编译后的 JavaScript，不直接运行 TypeScript。
- CommonJS 模块边界保持不变，避免引入 ESM 与 Electron preload 的额外风险。
- 现有功能和性能优化行为不回退。

## Assumptions

1. 继续支持 Node.js 22 及以上版本。
2. 继续使用 Electron 43 和 CommonJS。
3. 暂不引入新的前端框架或打包器。
4. `tsc` 负责 TypeScript 编译，静态资源由构建脚本复制到编译目录。
5. 迁移期间允许保留少量构建脚本和静态资源为 JavaScript/HTML/CSS，但不保留可执行的业务源码 JavaScript。

## Commands

```bash
npm run typecheck
npm test
npm run check
npm run build
npm run run
npm run package:mac
```

`npm run build` 生成可运行的编译目录；`npm run run` 和 macOS 打包都必须基于该目录运行。

## Target Structure

```text
src/
  chm.ts
  library.ts
  main.ts
  navigation.ts
  preload.ts
  renderer.ts
  search-index-worker.ts
  index.html
  styles.css

test/
  *.test.ts

build/
  *.js
  index.html
  styles.css
  package.json
```

`build/` 为生成目录，不提交到 Git。

## TypeScript Configuration

- `module`: `CommonJS`
- `target`: `ES2022`
- `moduleResolution`: `Node`
- `strict`: 开启
- `noEmitOnError`: 开启
- `sourceMap`: 开启
- `rootDir`: `src`
- `outDir`: `build`

测试编译到单独的临时输出目录，避免测试文件进入应用产物。

## Code Style

使用显式类型、窄化输入和现有项目的命名风格。跨进程数据使用共享接口定义，避免在 IPC 两端重复声明。

```ts
export interface BookContentsItem {
  title: string;
  path: string | null;
  children: BookContentsItem[];
}

export function normalizeTopicPath(topicPath: string | null | undefined): string | null {
  if (!topicPath) return null;
  return topicPath.replaceAll("\\", "/");
}
```

- 类型和接口使用 PascalCase。
- 函数和变量使用 camelCase。
- IPC channel 名称保持现有字符串。
- 不使用 `any` 绕过类型错误；无法避免时使用局部、带注释的类型断言。

## Testing Strategy

- 纯函数和 CHM 解析逻辑继续使用 Node.js test runner。
- 测试源码迁移到 TypeScript，并在测试前编译。
- 保留现有目录解析、编码、搜索、资源边界、library、navigation 和 UI 静态检查。
- 增加编译产物启动检查，确认 `build/main.js`、worker 和静态资源存在。
- 每个迁移切片都运行 `npm test`、`npm run typecheck` 和 `npm run check`。

## Boundaries

- Always: 保持 CommonJS、保留 IPC channel、迁移后运行完整测试。
- Ask first: 删除旧 JavaScript 源码、替换 Electron 版本、引入新的运行时框架。
- Never: 直接修改 `node_modules`、提交 `build/` 产物、删除失败测试来绕过类型错误。

## Success Criteria

1. `src/` 的应用逻辑文件全部为 TypeScript。
2. `test/` 的测试文件全部为 TypeScript。
3. `npm run build` 成功生成可运行的 `build/` 目录。
4. `npm run run` 能启动 Electron，且 `npm run package:mac` 能完成打包。
5. `npm test`、`npm run typecheck`、`npm run check` 全部通过。
6. CHM 解包、目录解析、正文搜索、搜索索引 worker、编码切换、资源协议和书库功能行为不回退。

## Open Questions

当前按上述保守方案继续，不阻塞迁移。若后续需要 ESM、Vite 或单文件分发，再单独评估。

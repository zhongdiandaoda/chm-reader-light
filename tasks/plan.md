# TypeScript Migration Plan

## Phase 1: Build foundation (complete)

1. Add TypeScript compiler configuration and typecheck/build scripts.
2. Add generated build directory handling and static resource copying.
3. Keep current JavaScript entrypoints working until each module has a TypeScript replacement.

## Phase 2: Pure modules (complete)

1. Migrate `library.js` to `library.ts`.
2. Migrate `navigation.js` to `navigation.ts`.
3. Migrate `chm.js` to `chm.ts`, including shared CHM data types and worker-facing APIs.
4. Migrate pure-module tests.

## Phase 3: Electron boundaries (complete)

1. Migrate `search-index-worker.js` to `search-index-worker.ts`.
2. Migrate `preload.js` and define the exposed renderer API.
3. Migrate `main.js` and IPC payload types.
4. Migrate `renderer.js` with DOM and `window` declarations.

## Phase 4: Build and packaging (complete)

1. Make development startup compile before launching Electron.
2. Make tests run against compiled TypeScript output.
3. Make macOS packaging package the generated application directory.
4. Update clean/install scripts and README commands.

## Risks and Mitigations

- Electron static paths: copy HTML/CSS/assets into the same generated directory as compiled JavaScript.
- CommonJS interop: keep `module: CommonJS` and preserve `require`-compatible output.
- Renderer globals: add explicit `Window` declarations for preload and helper APIs.
- Worker startup: use the compiled worker path relative to compiled `main.js`.
- Partial migration: migrate one module boundary at a time and keep tests green after each slice.

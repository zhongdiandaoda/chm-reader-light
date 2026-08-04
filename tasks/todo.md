- [ ] Add `tsconfig.json`, TypeScript dependencies, and build/typecheck scripts.
  - Acceptance: `npm run typecheck` and `npm run build` are defined.
  - Verify: run both commands.
  - Files: `package.json`, `package-lock.json`, `tsconfig.json`, build script.

- [ ] Migrate `library` and `navigation` modules.
  - Acceptance: their public APIs are typed and existing tests pass.
  - Verify: `npm test`, `npm run typecheck`.
  - Files: `src/library.ts`, `src/navigation.ts`, tests.

- [ ] Migrate `chm` and search-index worker.
  - Acceptance: CHM parsing, encoding, search, and concurrency behavior remain covered.
  - Verify: CHM unit tests and worker smoke test.
  - Files: `src/chm.ts`, `src/search-index-worker.ts`, `test/chm.test.ts`.

- [ ] Migrate Electron main process and preload.
  - Acceptance: IPC channels and worker lifecycle compile with explicit types.
  - Verify: `npm run typecheck`, Electron startup.
  - Files: `src/main.ts`, `src/preload.ts`.

- [ ] Migrate renderer and update static resource references.
  - Acceptance: library and reader UI compile and load from build output.
  - Verify: UI tests and manual Electron launch.
  - Files: `src/renderer.ts`, `src/index.html`.

- [ ] Switch scripts and packaging to generated output.
  - Acceptance: development run and macOS packaging use compiled files.
  - Verify: `npm run run`, `npm run package:mac`.
  - Files: `scripts/*.sh`, `package.json`, `README.md`.

- [ ] Remove obsolete JavaScript application sources and complete audit.
  - Acceptance: no executable application `.js` source remains outside generated output.
  - Verify: `rg --files src test | rg '\\.js$'` returns no application/test source.

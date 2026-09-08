# CHMReaderLight 中文发版检查清单

[English Release Checklist](./release.md)

发布公开 macOS 版本时使用这份清单。当前项目通过 GitHub Actions 发布经过 ad-hoc 签名、尚未 notarize 的 `.app` zip artifacts，分别覆盖 Apple Silicon 和 Intel Mac。

## 打标签前

- 确认 `CHANGELOG.md` 已包含面向用户的 release 条目。
- 运行本地质量检查：

```bash
npm test
npm run check:audit
npm run check
```

- 在已安装 Xcode Command Line Tools 的 Mac 上，至少构建一次本地包：

```bash
npm run check:package:mac:arm64
npm run check:package:mac:x64
npm run package:mac
```

  每个架构预检会在测试或打包开始前检查所需的 macOS 构建工具。打包会下载固定 commit 的 CHMLib、校验 archive SHA-256、应用仓库内 CVE-2025-48172 和解包预算补丁、构建匹配的 Mach-O 架构并验证 staging provenance。单架构开发 Mac 只构建当前架构是正常情况；release workflow 会分别使用匹配的 Apple Silicon 和 Intel runner。
- 需要生成与 release workflow 完全相同的 app、zip 和 checksum 时，运行 `npm run package:release:mac:arm64` 或 `npm run package:release:mac:x64`。
  每条命令会拒绝覆盖输出目录中已有的同名 zip 或 checksum。它先用临时名称生成 archive 与 checksum，再通过 `npm run check:release-bundle:mac -- <release.zip> <arch>` 重新解压临时 zip，拒绝意外的 archive 根目录载荷，并检查 bundle 签名、预期的 Electron fuse 状态、主程序和 CHMLib 架构、内置动态库链接、bundle id、与项目生成结果逐字节一致的品牌图标、受限的运行时 ASAR 内容及 20 MiB 体积上限、`CHMLIB-PROVENANCE.txt`、patched 对应源码、补丁一致性和最终 native 二进制哈希；全部通过后才发布最终文件名。验证失败或中断会清理临时及部分发布的输出。

- 从 `dist/` 打开打包后的应用，导入一个 `.chm`，检查目录、正文页面、搜索、Finder 定位和缺失源文件提示。
- 确认打包流程仍然把 `extract_chmLib` 放进 `Contents/Resources/native/`，用户不需要额外安装 CHMLib。
- 确认同一 native 目录包含 `CHMLIB-PROVENANCE.txt`、`source/CVE-2025-48172.patch`、`source/extraction-limits.patch`、经过 SHA-256 校验的上游源码 archive 和 `source/COPYING.CHMLib`。archive 与补丁共同构成打包修改的完整对应源码。
- 确认打包最后执行 `codesign --verify --deep --strict`，让 ad-hoc 签名覆盖最终 app bundle 和内置 native 文件。Release gate 还会检查 app 中每个 Mach-O 文件，拒绝非 ad-hoc 签名、意外的 TeamIdentifier 或 hardened-runtime 标志，因为没有共同 Developer ID team 时，ad-hoc 组件无法通过 macOS library validation。
- 确认打包会在最终签名前翻转生产 Electron fuses，release bundle 验收会从产物中核验预期的 Electron fuse 状态。生产包必须禁用 `ELECTRON_RUN_AS_NODE`、`NODE_OPTIONS`、命令行调试和从 ASAR 外加载应用入口；必须启用 embedded ASAR integrity validation，并要求 `Info.plist` 中的哈希与打包后的 `app.asar` header 一致。
- 确认 `app.asar` 只包含 `build/`、生产 `node_modules/`、`package.json`、`LICENSE` 和 `THIRD_PARTY_NOTICES.md`；仓库里的 zip、测试、源码、文档和构建工具都不能进入运行时载荷。
- 如果准备新的发行渠道，先看 [中文 Homebrew Cask 指南](./homebrew-cask.zh-CN.md) 和 [Homebrew Cask Guide](./homebrew-cask.md)，不要宣布 Homebrew 安装命令，直到 cask 已发布并验证。

## 发布

- 使用 `vMAJOR.MINOR.PATCH` 格式创建版本标签，例如 `v0.1.0`。
- 推送标签到 GitHub。release workflow 会构建：
  - `CHMReaderLight-mac-arm64.zip`
  - `CHMReaderLight-mac-arm64.zip.sha256`
  - `CHMReaderLight-mac-x64.zip`
  - `CHMReaderLight-mac-x64.zip.sha256`
- 架构矩阵只上传 GitHub Actions artifacts。独立的只读准备 job 会等待两个架构和 attestation job 都成功，下载并验证四个文件，然后只把两个发布脚本、`package.json`、Release 模板和这四个文件封装成白名单 publication input。具有写权限的 publish job 按精确的不可变 artifact ID 下载该输入，并且只调用一次 publisher。任一架构失败、attestation 失败或文件缺失时，都不会创建 Release。
- 发布 helper 会渲染 [Release Page Template](./release-template.md)，替换版本占位符，把两个 zip 与两个 checksum 文件名转成当前 tag 的下载直链，并把文档链接固定到当前 tag。在查找或修改 Release 之前，它会把已有的 lightweight 或 annotated Git tag 解析到最终 commit，并拒绝与构建所用完整 SHA 不一致的 tag；若 tag 不存在，则先在该 SHA 上创建 lightweight tag，再创建私有 draft。随后它流式上传四个文件，逐一校验 GitHub 上传响应中的名称、大小和 SHA-256 digest，并在公开前再次确认 tag 仍指向该 SHA、重新读取完整服务端 draft。只有 draft 仍未公开，且其中恰好包含四个状态、大小和 digest 均匹配的预期 asset 时才会公开；上传中断、并发修改 draft、服务端 asset 不匹配或 tag 不匹配都会阻止公开。
- GitHub 会把根据已合并 pull requests 和 commits 自动生成的 release notes 追加在下载与信任区块之后；`.github/release.yml` 会把变更分到用户可读的类别。
- 也可以从 GitHub Actions 页面手动运行 Release workflow。不勾选 `publish_release` 时，手动运行只构建并验证 artifacts，不会发布 Release。
- 手动发布时，把 `release_tag` 填为 `vMAJOR.MINOR.PATCH`，并明确勾选 `publish_release`。workflow 会在启动任一 macOS runner 前严格校验 tag 格式、要求它与 `package.json` 版本一致，并拒绝指向其他 commit 的同名已有 tag；随后等待两个架构都构建成功，并把新 tag 绑定到手动运行时选中的 commit。GitHub 只有在 workflow 文件已存在于仓库默认分支时才会提供手动运行入口。
- 指向同一 release tag 的运行会串行执行，且不会取消正在进行的发布，避免 tag push 与手动运行并发覆盖同一组 assets。
- macOS 构建 job 在安装依赖和运行项目构建代码时仅保留仓库只读权限。独立的 attestation job 会下载已完成的 workflow artifacts，并单独获得 OIDC 与 attestation 写权限；只有 attestation 成功后，发布准备才能启动。所有 checkout 都使用 `persist-credentials: false`，因此 checkout 不会把 GitHub token 持久化到 git 配置。GitHub Actions 权限仍然按 job 生效，而不是按 step 隔离：最终只有三个步骤的 `contents: write` job 中，固定 SHA 的 Node 配置与 artifact 下载 action 和 publisher 都处于该 token 权限上下文。为缩小信任面，该 job 仅保留这两个固定 action 与一次直接 Node publisher 调用，不 checkout、不安装依赖、不运行 npm lifecycle，也不执行 artifact 预检或发布后验证。它按只读 job 导出的精确不可变 artifact ID 选择输入；发布后的远端验证由另一个独立只读 job 执行。
- 公开完成后，独立的只读 verifier job 会通过 GitHub 的 tag-specific Release 与 Git ref API 运行 `npm run check:remote-release -- --tag <tag> --target-commitish <40位构建commit-sha> --release-dir <release-dir>`；tag 不一致或不再指向构建 commit、Release 仍是 draft/prerelease，或任一下载文件/checksum 缺失、为空、尚未完成上传，或服务端记录的大小/SHA-256 digest 与本地已验证文件不一致，都会使验收失败。精确 provenance 模式遇到 API 限流时会 fail closed，因为公开 HTML fallback 无法证明 Git ref 指向或 asset digest。
- 如果从本地命令确认发布，必须传入产出 assets 的完整 40 位 commit SHA：`GITHUB_TOKEN=repo_contents_token npm run publish:release -- --release-dir <release-dir> --target-commitish <40位构建commit-sha> --confirm`。helper 会拒绝分支名、缩写 SHA、省略目标或最终指向不同 commit 的已有远端 tag；若 tag 不存在，则先按所传 SHA 创建。上传过程中也会重新计算实际传输字节的 SHA-256。
- 同一 tag 重跑时会安全续传私有 draft：如果 Release 已公开或 draft 含有非预期 asset，helper 会拒绝覆盖；否则只删除四个预期旧文件，刷新正文与目标 commit，重新上传完整校验集合后再公开。
- 等待两个架构构建、attestation、只读发布准备、publish 和只读 verifier job 全部完成后，再开始公开推广。

## 发布后

- 从 GitHub Release 下载每个 zip，解压并确认 `.app` 能在对应架构打开。
- 下载每个 `.zip.sha256` 文件，并验证对应 artifact：

```bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
shasum -a 256 -c CHMReaderLight-mac-x64.zip.sha256
npm run check:release-artifacts -- <release-dir>
npm run check:release-bundle:mac -- CHMReaderLight-mac-arm64.zip arm64
npm run check:release-bundle:mac -- CHMReaderLight-mac-x64.zip x64
```

- 如果 `npm run check:release-artifacts -- <release-dir>` 输出 `Unexpected release artifact` 或 `Unexpected checksum file`，先清理过期 macOS zip/checksum 文件，再发布或推广。
- 运行 `npm run check:remote-release`，确认最新公开 GitHub Release 已提供 Apple Silicon、Intel 两个 macOS zip 以及对应 checksum 文件。正式发布门禁应追加 `-- --tag <tag> --target-commitish <40位构建commit-sha> --release-dir <release-dir>`，证明 tag 仍指向构建所用源码 commit，且每个远端 asset 的大小和 SHA-256 digest 都与本地已验证文件一致。
- 运行 `npm run check:remote-listing`，确认线上 GitHub description、website、topics 和 Discussions 设置仍然匹配 Repository Listing。
- 确认 GitHub artifact attestations 已为两个 macOS zip 和 checksum 文件生成。
- 公告前复查生成的 release notes，补充缺失的用户可见亮点或 caveats。
- 确认 release 正文仍然从 [Release Page Template](./release-template.md) 的下载区块开始，且四个 artifact 链接都指向已发布 tag，让访客先下载正确文件。
- 为当前版本创建或刷新 release-feedback Discussion，收集影响用户 trust、star、watch 或 share 的下载、checksum、notarization、截图、demo 或支持问题。
- 大范围推广前 pin 当前 release-feedback Discussion，减少重复 issue。
- 如果 release trust、下载或首次打开问题反复出现，在 release notes 里链接对应的 pinned release-feedback thread。
- 确认 GitHub repository About panel 仍然匹配 Repository Listing。
- 保持 Homebrew 说明与中文 Homebrew Cask 指南一致；不要宣布 Homebrew 安装命令，直到 cask 已发布并验证。
- 修改 Gatekeeper、签名或 notarization 文案前，复查 Signing and Notarization。
- 确认 release body 链接 Project Status，让下载访客能看到平台支持、信任 caveats 和当前范围。
- 如果 release 公告需要短视频或截图，使用 Demo Guide 和中文演示指南。
- 发布文案和社交内容使用 Share Kit 或中文分享素材包。
- 推广前确认应用内 `Help > Star on GitHub`、`Help > Watch Releases` 和 `Help > Copy Share Text` 仍然指向正确的公开路径。
- 确认 Finder 能识别 `.chm` 文件，并能用 CHMReaderLight 打开。
- 把已知限制写进 release notes，尤其是 signing、notarization 或 CHM compatibility caveats。
- tag 发布后，保持 `Unreleased` changelog section 可以继续记录下一批变化。

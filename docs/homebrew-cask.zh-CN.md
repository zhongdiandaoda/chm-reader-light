# CHMReaderLight 中文 Homebrew Cask 指南

[English Homebrew Cask Guide](./homebrew-cask.md)

准备未来 Homebrew 分发路径时使用这份指南。CHMReaderLight 目前还没有发布 Homebrew cask，因此 GitHub Releases 仍是当前受支持的下载方式。

## 何时添加 Cask

只有在以下 release 基础条件满足后，才添加或提交 Homebrew cask：

- 已经有同时包含 `CHMReaderLight-mac-arm64.zip` 和 `CHMReaderLight-mac-x64.zip` 的公开 GitHub Release。
- 每个 release artifact 都有对应的 `.zip.sha256` 文件。
- release 页面说明当前 notarization caveat，并链接到 [Signing and Notarization](./signing-notarization.md)。
- 已经在对应 Mac 架构上从下载 zip 打开过应用。
- [中文 macOS 安装指南](./install-macos.zh-CN.md) 和 [macOS Install Guide](./install-macos.md) 中的安装、更新和移除预期保持最新。

## 候选 Cask Metadata

起草 cask 时可以从下面的 metadata 开始。URL、version 和 hash 必须与实际 release artifact 保持一致。
在整理并验证 release artifact 后，运行 `npm run prepare:homebrew-cask -- --release-dir <release-dir>`，可以从 `.zip.sha256` 文件生成可复制的 cask 草稿。

```ruby
cask "chmreaderlight" do
  version "<version>"
  sha256 "<sha256>"

  url "https://github.com/zhongdiandaoda/chm-reader-light/releases/download/v#{version}/CHMReaderLight-mac-arm64.zip"
  name "CHMReaderLight"
  desc "Lightweight offline CHM reader and library for macOS"
  homepage "https://github.com/zhongdiandaoda/chm-reader-light"

  depends_on macos: ">= :monterey"

  app "CHMReaderLight.app"
end
```

如果 cask 需要区分 Apple Silicon 和 Intel 下载 URL，请从 release 的 `.zip.sha256` 文件获取两个 hash，并在 pull request 中说明架构差异。

## 验证

- 针对起草的 cask 运行 `brew audit --cask chmreaderlight`。
- 在干净 macOS 机器或一次性测试账号中运行 `brew install --cask chmreaderlight`。
- 确认安装后的应用可以启动、导入 `.chm`、打开章节，并能使用 **Help > Copy Diagnostic Info**。
- 确认卸载行为只移除 app bundle，不会删除源 CHM 文件。
- 安装后再次检查 notarization caveat，尤其是在 release 仍未 Apple-notarized 时。

## 公开说明

- 在 cask 发布并验证前，不要告诉用户通过 Homebrew 安装。
- 在那之前，继续把 GitHub Releases 作为标准安装路径。
- cask 上线后，同时链接 Homebrew 命令和 GitHub Release 页面，让用户可以在包管理器安装和直接下载之间选择。
- 只有在说明离线 CHM 工作流价值，并链接到隐私、兼容性和安装说明之后，再请求 GitHub star。

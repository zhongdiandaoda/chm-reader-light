# CHMReaderLight 中文 macOS 安装指南

[English macOS Install Guide](./install-macos.md)

本指南适用于从 GitHub Releases 安装 CHMReaderLight。源码运行和本地开发方式见主 [README](../README.md)。

## 选择正确下载项

从 [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) 下载最新版本：

- Apple Silicon Mac 使用 [CHMReaderLight-mac-arm64.zip](https://github.com/zhongdiandaoda/chm-reader-light/releases/latest/download/CHMReaderLight-mac-arm64.zip)。
- Intel Mac 使用 [CHMReaderLight-mac-x64.zip](https://github.com/zhongdiandaoda/chm-reader-light/releases/latest/download/CHMReaderLight-mac-x64.zip)。

如果 GitHub Releases 暂无公开构件，请使用[中文入门指南](./getting-started.zh-CN.md)中的源码运行路径。

如果不确定自己的 Mac 架构，请打开 **Apple menu > About This Mac**，查看 chip 或 processor 信息。

Homebrew 目前还不是受支持的安装方式。维护者准备未来 cask 时可参考 [中文 Homebrew Cask 指南](./homebrew-cask.zh-CN.md) 或 [Homebrew Cask Guide](./homebrew-cask.md)。

## 校验下载文件

每个 release zip 都会同时发布对应的 checksum。把当前架构的两个文件下载到同一目录：

- Apple Silicon checksum：[CHMReaderLight-mac-arm64.zip.sha256](https://github.com/zhongdiandaoda/chm-reader-light/releases/latest/download/CHMReaderLight-mac-arm64.zip.sha256)
- Intel checksum：[CHMReaderLight-mac-x64.zip.sha256](https://github.com/zhongdiandaoda/chm-reader-light/releases/latest/download/CHMReaderLight-mac-x64.zip.sha256)

然后运行对应命令：

```bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
shasum -a 256 -c CHMReaderLight-mac-x64.zip.sha256
```

输出 `OK` 表示 zip 与 release 页面发布的 checksum 一致。

如果已经安装 GitHub CLI，也可以额外验证 GitHub artifact attestation：

```bash
gh attestation verify CHMReaderLight-mac-arm64.zip --repo zhongdiandaoda/chm-reader-light
gh attestation verify CHMReaderLight-mac-x64.zip --repo zhongdiandaoda/chm-reader-light
```

这可以确认 zip 由本仓库的 GitHub Actions release workflow 生成。

## 首次启动

解压下载文件，并把 `CHMReaderLight.app` 移到 `/Applications` 或你自己管理的其他目录。

当前 release build 尚未完成 Apple notarization。如果 macOS 阻止首次启动，请打开 **System Settings > Privacy & Security**，查看被拦截的应用提示，并允许 CHMReaderLight 打开。当前 macOS 信任状态见 [Signing and Notarization](./signing-notarization.md)。

应用只会在你添加或打开 `.chm` 文件后读取本地文档。它不会上传文档、不会把源 CHM 文件复制进书库，也不需要账号。

## 更新或移除

更新时下载较新的 release，并替换已有的 `CHMReaderLight.app`。

移除应用时删除 `CHMReaderLight.app` 即可。书库 metadata 和已提取内容缓存保存在应用数据目录；如果想先查看或删除本地状态，请在移除前选择 **Help > Reveal App Data Folder**。

启动、缓存、编码或源文件丢失问题请先看 [中文故障排查](./troubleshooting.zh-CN.md) 或 [Troubleshooting](./troubleshooting.md)。本地数据边界见 [中文隐私与本地数据](./privacy.zh-CN.md) 或 [Privacy and Local Data](./privacy.md)。

## 安装成功后

- 如果 CHMReaderLight 解决了你的离线 CHM 工作流，可以 [Star the repository](https://github.com/zhongdiandaoda/chm-reader-light)，或在应用里使用 **Help > Star on GitHub**。
- 如果你想知道新版打包构件何时可用，可以 [watch releases](https://github.com/zhongdiandaoda/chm-reader-light/releases)。
- 推荐给其他 macOS CHM 用户时，可以用 **Help > Copy Share Text** 复制包含 release、star、反馈和 showcase 链接的现成摘要。
- 如果下载、checksum、notarization、截图、demo 或支持信息会影响你是否信任、star、watch 或分享某个版本，请使用 [release-feedback Discussion](https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback)。

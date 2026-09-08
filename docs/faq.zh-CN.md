# 常见问题

[English FAQ](./faq.md)

想快速确认平台支持、发行方式、信任说明和当前项目范围时，请先看 [中文项目状态](./project-status.zh-CN.md) 或 [Project Status](./project-status.md)。第一次安装请看 [中文 macOS 安装指南](./install-macos.zh-CN.md)。

## 支持哪些 macOS 版本？

CHMReaderLight 面向 Apple Silicon 和 Intel Mac，目标系统是 macOS 12 或更高版本。

## 支持 Windows 或 Linux 吗？

暂不支持。CHMReaderLight 当前专注 macOS 12 或更高版本；Windows、Linux、iOS 和 iPadOS 还不是受支持的发行目标。当前范围见 [中文项目状态](./project-status.zh-CN.md) 或 [Project Status](./project-status.md)。

## 可以在工作或公司环境中使用吗？

CHMReaderLight 使用 MIT License 分发，允许在许可条款下使用、复制、修改、发布、分发、再许可和销售。如果需要在公司设备、内部手册或再分发构建中使用，请与你的组织一起审阅 [LICENSE](../LICENSE)。

## 应该下载哪个文件？

Apple Silicon Mac 使用 `CHMReaderLight-mac-arm64.zip`，Intel Mac 使用 `CHMReaderLight-mac-x64.zip`。Homebrew 目前还不是受支持的安装方式；未来维护 cask 时可参考 [中文 Homebrew Cask 指南](./homebrew-cask.zh-CN.md) 或 [Homebrew Cask Guide](./homebrew-cask.md)。

## 如何校验下载文件？

从同一个 GitHub Release 下载 zip 和对应的 `.zip.sha256` 文件，然后根据架构运行：

```bash
shasum -a 256 -c CHMReaderLight-mac-arm64.zip.sha256
shasum -a 256 -c CHMReaderLight-mac-x64.zip.sha256
```

如果已经安装 GitHub CLI，也可以验证 GitHub artifact attestation：

```bash
gh attestation verify CHMReaderLight-mac-arm64.zip --repo zhongdiandaoda/chm-reader-light
gh attestation verify CHMReaderLight-mac-x64.zip --repo zhongdiandaoda/chm-reader-light
```

## 为什么 macOS 首次打开会提示拦截？

当前 release build 面向开源分发流程，尚未完成 Apple notarization。如果 macOS 阻止首次启动，请打开 **System Settings > Privacy & Security**，查看被拦截的应用提示，并允许 CHMReaderLight 打开。当前信任状态见 [Signing and Notarization](./signing-notarization.md)。

## 如何更新 CHMReaderLight？

下载较新的 release，解压后替换已有的 `CHMReaderLight.app`。书库 metadata、阅读偏好和已提取内容缓存保存在应用数据目录，替换 app bundle 不会删除这些状态。

## 会自动检查更新吗？

不会。CHMReaderLight 不包含自动更新器、后台更新检查、遥测或 release 轮询。需要新版本时，请查看 GitHub Releases 或 watch 仓库。

## CHMReaderLight 会上传或复制我的 CHM 文件吗？

不会。书库只保存源文件路径和 metadata。CHM 源文件保留在你选择的位置，应用不包含遥测、账号、云同步或托管文档存储。

## 会修改原始 CHM 文件吗？

不会。CHMReaderLight 读取源 CHM 文件，并把自己的书库 metadata、阅读偏好和提取缓存写入应用数据目录。它不会把书签、搜索索引、缓存文件或修复内容写回原始 `.chm` 文件。

## 应用数据保存在哪里？

书库 metadata 保存在 Electron app data 目录下的 `library/library.json`。提取出的 CHM 内容缓存在 `extracted-books/`，正文缩放、文本编码、侧栏状态、搜索范围和上次阅读章节等偏好使用浏览器 `localStorage`。成功打开过的 CHM 路径也可能出现在 macOS 最近打开文档菜单中；完整边界见 [中文隐私与本地数据](./privacy.zh-CN.md) 或 [Privacy and Local Data](./privacy.md)。

## 可以离线使用吗？

可以。下载安装后，打开本地 CHM、浏览书库、搜索已索引内容和恢复阅读偏好都可以离线完成。GitHub Releases、文档、Issues 和 Discussions 链接需要浏览器联网，因为它们会打开公开项目页面。

## 删除 CHMReaderLight 会删除我的 CHM 文件吗？

不会。删除 `CHMReaderLight.app` 只会移除应用包，源 CHM 文件仍留在原目录。如果还想查看或删除保存的书库 metadata、阅读偏好或提取缓存，请先使用 **Help > Reveal App Data Folder**。

## 如何支持 CHMReaderLight？

如果 CHMReaderLight 改善了你的离线 CHM 工作流，可以在 GitHub 上 Star the repository，或使用 **Help > Star on GitHub**，帮助更多 macOS CHM 用户发现它。需要转发项目时，可以使用 **Help > Copy Share Text** 复制包含 release、star、反馈和 showcase 链接的中英双语摘要。也欢迎通过 showcase issue template 分享不包含私有内容的使用场景，或在 GitHub Discussions 里反馈开放式使用经验；如果 release 说明会影响你是否信任、star、watch 或分享应用，请使用 [release-feedback Discussion](https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback)。

已安装应用的用户可以使用 **Help > Report or Request** 选择 issue template、release feedback 和 showcase 路径。

## 可以把 CHM 文件放在外接硬盘或云同步目录吗？

可以，只要 macOS 打开书库条目时仍能访问相同源文件路径。如果硬盘断开、云文件处于仅在线状态，或路径发生变化，保存的条目会显示缺失，直到你重新连接位置或重新定位 CHM。

## 大 CHM 文件或大书库会很慢吗？

大 CHM 文件首次提取和建立搜索索引可能更慢。已经提取过的书再次打开通常会更快，因为提取内容会被缓存。需要可重复测量时，请看 [Benchmarking Guide](./benchmarking.md) 或运行 `npm run benchmark:chm`。

## 可以从 Finder 或命令行打开 CHM 吗？

可以。打包后的 macOS 应用声明了 `.chm` 文档类型，安装后可以使用 Finder 的 Open With。通过 Finder 打开或从命令行传入 `.chm` 文件时，应用会把它加入书库并打开阅读器；如果应用已经运行，会聚焦现有窗口并打开请求的 CHM。

## 为什么打开后没有目录？

有些 CHM 文件没有 `.hhc` 目录文件，或目录 markup 比较特殊。正文页面可能仍能打开，但侧栏目录不完整。当前预期见 [中文兼容性说明](./compatibility.zh-CN.md) 或 [Compatibility Notes](./compatibility.md)。

## 可以打开加密或损坏的 CHM 吗？

不可靠。密码保护、加密、损坏或只能部分提取的 CHM 可能在 CHMReaderLight 解析 metadata 或渲染页面前失败。请使用标准可提取 CHM，或在兼容性报告中提供安全的复现信息。

## 文本乱码怎么办？

旧 CHM 文件可能使用 legacy encoding。请尝试正文文本编码菜单中的 `GBK`、`GB18030`、`BIG5`、`Shift-JIS`、`EUC-JP` 或 `EUC-KR`。

## 支持中文、日文或韩文 CHM 吗？

支持，前提是 CHM 可以被提取，并且正文能用受支持的文本编码渲染。如果乱码，请尝试 `GBK`、`GB18030`、`BIG5`、`Shift-JIS`、`EUC-JP` 或 `EUC-KR`。如果仍有编码问题，请在兼容性报告中提供 CHM 语言、所选编码、最小复现步骤和 **Help > Copy Diagnostic Info**。

## 为什么禁用脚本和表单？

CHMReaderLight 把 CHM 文件视为来自未知来源的本地文档。CHM 内脚本、inline event handlers、表单提交、弹窗、嵌套 frame、plugin object 和网络连接会被阻止，以降低打开未知内容的风险。应用仍会注入少量带 nonce 的导航桥脚本，用于阅读历史和侧栏同步。

## 如何清理已提取缓存？

选择 **Help > Clear Extracted Cache**。这只会删除已提取的 CHM 内容缓存，不会删除源 CHM 文件或书库条目。

## 当前有哪些无障碍支持？

CHMReaderLight 支持键盘驱动的书库和阅读器工作流，包含已记录的快捷键、可见焦点状态、带标签的控件，以及用于搜索和书库变化的 polite status announcements。当前预期见 [中文无障碍指南](./accessibility.zh-CN.md) 或 [Accessibility Guide](./accessibility.md)。VoiceOver 或其他辅助技术反馈欢迎作为聚焦的 bug report 提交。

## 支持深色模式或高对比主题吗？

当前 CHMReaderLight 使用浅色外观，还没有单独的深色模式或高对比主题开关。如果颜色、对比度或系统外观问题影响真实阅读，请提交聚焦的 accessibility 或 usability report，并附上 macOS 外观设置和可公开的截图。

## Copy Diagnostic Info 包含什么？

它会复制 CHMReaderLight app version、Electron version、Node.js version、platform、CPU architecture 和 macOS release。它不会复制 CHM 文档正文、书库条目、源文件路径、截图或已提取缓存内容。

## 报告问题时需要上传 CHM 文件或截图吗？

不需要。不要在公开 issue 中上传私有 CHM 文件、专有截图、敏感路径或保密文档文本。可以提供安全信息，例如 CHM 语言、近似大小、受影响区域、复现步骤，以及样本是否可以公开或私下分享。发布前请先脱敏截图、日志、复制的错误文本和诊断信息。

## 哪里可以找到快捷键？

见 [中文快捷键指南](./shortcuts.zh-CN.md) 或 [Keyboard Shortcuts](./shortcuts.md)。应用内也可以从 **Help > Keyboard Shortcuts** 打开。

## 应该如何提问或报告问题？

先看 [中文故障排查](./troubleshooting.zh-CN.md) 或 [Troubleshooting](./troubleshooting.md)，再根据问题类型选择 [中文支持指南](../SUPPORT.zh-CN.md) 中的 issue template 或 Discussion 路径。提交 bug 时，请包含最小复现步骤、macOS 版本、Mac 架构、CHM 语言和近似大小，以及 **Help > Copy Diagnostic Info** 输出。

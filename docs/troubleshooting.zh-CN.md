# CHMReaderLight 中文故障排查

[English Troubleshooting](./troubleshooting.md)

本指南覆盖 macOS 上最常见的 CHMReaderLight 安装、打开和文档使用问题。下载、隐私、缓存和兼容性常见问答见 [中文 FAQ](./faq.zh-CN.md)，CHM 支持范围和已知限制见 [中文兼容性说明](./compatibility.zh-CN.md) 或 [Compatibility Notes](./compatibility.md)。

## 应用无法打开

如果 macOS 因为应用来自互联网而阻止打开，请进入 **System Settings > Privacy & Security**，查看被拦截的 CHMReaderLight 提示，并允许应用运行。

如果你是从源码本地打包，先运行：

```bash
npm run package:mac
```

然后从生成的 `dist/` 目录打开 `.app`，或运行：

```bash
npm run install:mac
```

当前 release build 尚未完成 Apple notarization。更多信任说明见 [Signing and Notarization](./signing-notarization.md)。

## CHM 文件打不开

CHMReaderLight 通过 `extract_chmLib` 读取 `.chm` 文件。打包 build 会把固定且已应用 CVE 补丁的 native extractor 和 `libchm` 放进 `CHMReaderLight.app`。本地开发运行仍需要系统 CHMLib，自行打包则会自动构建并 vendor 已审计源码。

检查本地环境：

```bash
npm run doctor
```

如果你自己打包应用，可先运行 `npm run check:package:mac:arm64` 或 `npm run check:package:mac:x64` 检查所需 Xcode 工具。打包命令随后会为当前 runner 架构构建并验证固定的 CHMLib 源码；本机没有对应硬件架构时，请使用匹配的 GitHub Actions release job。

如果某个 CHM 仍无法打开，请记录安装来源、macOS 版本、Mac 架构、CHM 语言和近似大小，再按 [中文支持指南](../SUPPORT.zh-CN.md) 选择 bug report 或 CHM compatibility report。

## 文本乱码

旧 CHM 文件常使用 legacy encoding。请在阅读器工具栏中打开文本编码菜单，依次尝试：

- 简体中文：`GBK` 或 `GB18030`
- 繁体中文：`BIG5`
- 日文：`Shift-JIS` 或 `EUC-JP`
- 韩文：`EUC-KR`

如果 CHM 已经声明了正确 charset，请切回默认编码。提交编码问题时，请说明 CHM 语言、尝试过的编码，以及是否只有目录或正文受影响。

## 目录缺失

有些 CHM 文件没有 `.hhc` table of contents，或目录 markup 比较特殊。即使侧栏为空，默认正文页仍可能正常打开。

报告目录问题时，请说明正文页是否能加载、内部链接是否可点击、搜索是否可用，以及受影响 CHM 是否可以公开或私下分享给维护者复现。

## 搜索结果少于预期

全文搜索来自提取后的 HTML 页面。大 CHM 文件首次打开时，搜索索引可能需要一点时间才准备好；刚打开文档时请等待索引完成后再试。书库搜索、正文搜索、目录过滤、匹配跳转和索引限制见 [中文搜索指南](./search.zh-CN.md) 或 [Search Guide](./search.md)。

搜索最适合可见正文文本。由脚本生成的文字、嵌入图片里的文字或不受支持的二进制内容可能无法被搜索。

如果替换过 CHM 文件后搜索或页面渲染仍像旧内容，请选择 **Help > Clear Extracted Cache**。这只会删除已提取内容缓存，不会删除源 CHM 文件或书库条目。

## 书库条目找不到源文件

书库保存的是源 CHM 文件路径，而不是复制 CHM 文件。如果文件在 CHMReaderLight 外部被移动、重命名或删除，已有书库条目可能无法打开，也不能在 Finder 中定位。

如果 CHM 仍在新的位置，请在缺失的书库卡片上使用重新定位操作并选择移动后的文件。这样会更新保存路径，同时保留书库条目、所属分组、添加时间和阅读 metadata。如果源文件已经确定删除，可以从书库移除这个失效条目。

需要进一步排查本地状态时，请选择 **Help > Reveal App Data Folder**，查看保存的书库 metadata 和提取缓存。

## 提交 issue 前

请先搜索已有 [Issues](https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue) 和 [Discussions](https://github.com/zhongdiandaoda/chm-reader-light/discussions)，避免重复报告分散在多个地方。

在应用中选择 **Help > Copy Diagnostic Info**，把复制出的诊断信息粘贴到 issue。它包含 app、Electron、Node、platform、architecture 和 macOS Darwin version，不包含文档路径或 CHM 内容。

请尽量包含：

- macOS 版本和 Mac 架构
- 安装来源，例如 GitHub release zip、本地打包或源码运行
- CHM 语言和近似文件大小
- 问题影响打开、目录、正文渲染、内部链接、搜索、图片还是文本编码
- 最小复现步骤
- 已脱敏的截图、日志或错误文本

不要上传私有 CHM 文件、专有截图、敏感路径或保密文档文本。安全问题请按 [中文安全政策](../SECURITY.zh-CN.md) 私下报告。

# CHMReaderLight 中文兼容性说明

[English Compatibility Notes](./compatibility.md)

CHMReaderLight 专注在 macOS 上阅读本地 Microsoft Compiled HTML Help 文件。不同 CHM 文件会受制作工具、语言、年代和内嵌浏览器假设影响，本页用于说明当前预期、已知限制，以及报告兼容性缺口时需要提供的信息。

阅读器限制背后的安全原因见 [中文安全模型](./security-model.zh-CN.md) 或 [Security Model](./security-model.md)。

## 预期可用

- 可以被 `extract_chmLib` 提取的标准 `.chm` 文件。
- 包含 `.hhc table of contents` 的书籍，包括常见的嵌套 `<ul>` 目录结构。
- HTML 章节页面使用相对链接引用同一 CHM 内的其他页面、图片、样式、字体或媒体文件。
- 搜索内容以文本形式存在于提取后的 HTML 页面中。
- CHM 声明了 charset，或可以通过阅读器文本编码菜单手动选择的 common legacy encodings。
- 原始 CHM 源文件仍保留在书库记录路径上的本地阅读工作流。

## 已知限制

- CHM 自带脚本、inline event handlers、表单提交、plugin objects、网络连接、弹窗和嵌套 frame 会被阻止，这是阅读器 sandbox 和 Content Security Policy 的一部分。应用仍会注入一小段 nonce-protected navigation bridge，让侧栏可以跟随章节变化。
- CHM 页面中的外部网页链接会在默认浏览器中打开，而不是替换本地阅读器页面。
- 搜索不会索引只存在于图片、脚本生成内容、嵌入式二进制对象或不受支持 plugin content 中的文字。
- 有些 CHM 文件没有 `.hhc` 文件，或 table-of-contents markup 比较特殊；正文页可能仍能打开，但侧栏目录不完整。
- 外部网页链接不会被当作书籍资源处理。阅读器面向离线本地文档。
- 密码保护、加密、损坏或只能部分提取的 CHM 可能在应用解析 metadata 前失败。
- 解包后的书籍最多包含 50,000 个普通文件和 60,000 个文件系统入口，总量不得超过 1 GiB，单文件不得超过 256 MiB。超过这些安全限制，或产生符号链接及特殊文件的书籍，会在 metadata 解析和搜索索引前被拒绝。
- 单个 HTML 或 HHC 文件超过 16 MiB 时不会进入内存转换。超大 HTML 页面会从全文搜索中省略，并在打开时显示大小限制错误；超大 HHC 会因无法安全解析导航 metadata 而阻止书籍打开。搜索索引会在有序 HTML 输入将超过 128 MiB 源数据预算前停止，因此特别大的书籍中，后续页面可能不会出现在正文搜索结果中。
- HHC 导航最多包含 50,000 个目录项和 256 层嵌套。超过任一结构限制的书籍会被拒绝，而不会构建无界侧栏树。
- 打包 release build 会包含 native extractor。本地开发构建仍需要当前 Mac 架构可用的 CHMLib。

## 编码建议

较旧的 CHM 常早于 UTF-8 默认环境，可能使用 legacy encodings。如果目录或正文乱码，可以尝试阅读器文本编码菜单：

- 简体中文：`GBK` 或 `GB18030`
- 繁体中文：`BIG5`
- 日文：`Shift-JIS` 或 `EUC-JP`
- 韩文：`EUC-KR`

当 CHM 已经声明正确 charset 时，请切回默认编码。

## 报告兼容性缺口

提交 issue 前，请先查看 [中文故障排查](./troubleshooting.zh-CN.md)。如果问题仍像是兼容性缺口，请使用 CHM compatibility issue template。[中文 CHM 样本指南](./sample-chm-guide.zh-CN.md) 或 [Sample CHM Guide](./sample-chm-guide.md) 说明了如何选择公开或合成样本，避免暴露私有文档。请包含：

- 最小复现步骤。
- macOS 版本、Mac 架构、app 版本，以及安装或运行 CHMReaderLight 的方式。可优先使用 **Help > Copy Diagnostic Info**。
- CHM 语言、近似文件大小，以及文件是否可以公开或私下分享。
- 问题影响打开、目录、正文渲染、内部链接、搜索、图片还是文本编码。
- 已移除私有路径和文档内容的截图或错误文本。

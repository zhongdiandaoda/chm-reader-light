# CHMReaderLight 中文对比指南

[English Comparison](./comparison.md)

当你需要判断 CHMReaderLight 是否适合自己的文档工作流时，可以用本页快速对比。CHMReaderLight 是一个 local-only macOS CHM reader，定位比 Windows HTML Help、browser-based extracted HTML folders 和 general document managers 更窄。

它专注于在 macOS 上阅读已有 CHM 文件：提供书库优先的管理体验、可搜索目录、正文搜索、阅读历史、本地 metadata，以及更保守的安全默认值。它不会上传、同步或托管 CHM 内容。

## 适合选择 CHMReaderLight 的情况

- 你想要一个 local-only macOS CHM reader，用来打开下载或归档的 `.chm` 手册，同时不把源文件复制进托管数据库。
- 你把 legacy SDK manuals、vendor help files 或 offline API reference 保存在本地磁盘上，需要分组、书库搜索、最近打开排序和 Finder 定位。
- 你希望阅读器默认阻止 CHM 自带脚本、表单、弹窗、plugin object、嵌套 frame 和网络连接。
- 你需要从 GitHub Releases 快速下载 Apple Silicon 或 Intel Mac 构件，并希望 release artifact 带 checksum 文件和可选 attestation 验证路径。

## 更适合选择其他工具的情况

- 你需要和 Windows 上的 Windows HTML Help 行为完全一致。
- 你想编辑、创作、反编译或重新构建 CHM 文件；CHMReaderLight is not a CHM authoring tool。
- 你已经有可信的提取流程，并且更喜欢用 browser-based extracted HTML 阅读每一本手册。
- 你需要跨设备同步、托管文档、OCR、PDF 书库、批注系统或 general document managers。

## 相关指南

- 用 [中文适用场景](./use-cases.zh-CN.md) 判断它是否匹配具体的旧版文档工作流。
- 测试较旧、多语言、带脚本或结构特殊的 CHM 前，先看 [中文兼容性说明](./compatibility.zh-CN.md) 或 [Compatibility Notes](./compatibility.md)。
- 用 [中文隐私与本地数据](./privacy.zh-CN.md) 确认 CHMReaderLight 不会上传、同步或托管 CHM 内容。

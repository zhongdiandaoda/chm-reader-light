# CHMReaderLight 中文路线图

[English Roadmap](./roadmap.md)

CHMReaderLight 保持聚焦：让 macOS 用户更轻松地保存、查找和阅读本地 CHM 手册。这份路线图说明近期重点，帮助用户评估项目，也帮助贡献者选择有价值的 issue。

当前平台、发行方式、信任状态和项目范围快照，请先看 [中文项目状态](./project-status.zh-CN.md) 或 [Project Status](./project-status.md)。

## 当前重点

- 更好的 CHM 兼容性报告：收集可复现示例，覆盖目录解析、字符编码、损坏的内部链接和搜索索引。当前预期见 [中文兼容性说明](./compatibility.zh-CN.md) 或 [Compatibility Notes](./compatibility.md)。
- 更快的书库工作流：改进批量导入反馈、失效路径恢复、重复处理，以及大型本地文档目录中的源文件定位体验。
- 更完善的 macOS 分发：保持 Apple Silicon 和 Intel release artifacts 可靠，改进安装说明，并用 [Signing and Notarization](./signing-notarization.md) 跟踪 macOS 信任预期。
- 更安全的阅读默认值：保留当前禁用脚本的阅读器姿态，同时让资源加载失败更容易诊断。

## 适合首次贡献的方向

- 为真实世界 `.hhc` table-of-contents 结构添加聚焦测试。
- 根据用户报告中的具体症状和修复方式改进故障排查说明。
- 打磨书库和阅读器视图中的键盘导航与焦点行为。
- 扩展打包检查，让 release artifacts 在发布前更容易验证。

## 暂不计划

- cloud sync 或托管文档存储。
- 编辑或创作 CHM 文件。
- 在 macOS 应用稳定且容易安装前，进行跨平台打包。

## 提议变更

请在 issue 中说明用户问题、你期望的 CHM 行为、实际看到的行为，以及测试使用的 macOS 版本和芯片架构。兼容性问题请先查看 [中文故障排查](./troubleshooting.zh-CN.md) 和 [中文兼容性说明](./compatibility.zh-CN.md)，让报告聚焦在文档尚未覆盖的缺口上。

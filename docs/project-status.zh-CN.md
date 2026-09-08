# CHMReaderLight 中文项目状态

[English Project Status](./project-status.md)

在下载、star、watch release 或贡献 CHMReaderLight 前，可以用本页快速确认当前平台、发行方式、信任状态和项目范围。

## 当前快照

- CHMReaderLight 当前专注 macOS 12 或更高版本。
- Release artifacts 面向 Apple Silicon 和 Intel Mac 构建。
- 公开下载通过 GitHub Releases 分发。
- Release zip 应配套 SHA-256 checksum files。
- Release artifacts 应包含 GitHub artifact attestations，方便做可选 provenance verification。
- 当前 release build 尚未完成 Apple notarization，所以 macOS 首次启动时可能需要从 **System Settings > Privacy & Security** 允许打开。
- Homebrew 还不是受支持的安装方式。
- 不包含 telemetry、账号、cloud sync 或托管文档存储。

## 适合现在使用

- 在 macOS 上用本地 CHM 手册试用应用。
- 管理离线 SDK、API、vendor 或归档产品文档。
- 测试目录导航、正文搜索、阅读偏好和本地书库工作流。
- 使用安全样本信息提交聚焦的 CHM 兼容性报告。
- 参与小范围文档、打包、parser、搜索、无障碍或 macOS 工作流贡献。

## 暂不适合

- Apple-notarized public distribution。
- 面向最终用户的 Homebrew 安装说明。
- Cloud sync、托管文档存储、账号工作流或 telemetry。
- 编辑、创作、反编译或重新构建 CHM 文件。
- 在 macOS 应用稳定且易安装之前，做大范围跨平台打包承诺。

## Star 或 Watch 前

1. 从 [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) 下载正确构件。
   如果 GitHub Releases 暂无公开构件，请改为按照[中文入门指南](./getting-started.zh-CN.md)从源码运行 `npm run run`。
2. 校验对应的 `.zip.sha256` checksum 和可选 GitHub artifact attestation。
3. 打开一本有代表性的 CHM 文件，试用目录搜索和正文搜索。
4. 如果文档的信任边界或键盘访问很重要，请查看 [中文隐私与本地数据](./privacy.zh-CN.md)、[中文安全模型](./security-model.zh-CN.md)、[中文兼容性说明](./compatibility.zh-CN.md) 和 [中文无障碍指南](./accessibility.zh-CN.md)。
5. 决定是否 star、watch release、提交 issue 或参与贡献时，可以使用 [中文采用检查清单](./adoption-checklist.zh-CN.md)。

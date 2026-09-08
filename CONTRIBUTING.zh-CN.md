# CHMReaderLight 中文贡献指南

[English Contributing Guide](./CONTRIBUTING.md)

感谢你帮助改进 CHMReaderLight。项目保持小而聚焦：为 macOS 提供轻量、离线、本地优先的 CHM 阅读器和书库。

在 issue、pull request 和 Discussions 中参与前，请先阅读 [中文行为准则](./CODE_OF_CONDUCT.zh-CN.md) 和 [Code of Conduct](./CODE_OF_CONDUCT.md)。

## 适合从哪里开始

- 复现并缩小 CHM 兼容性问题。
- 改进书库管理、搜索或阅读器导航流程。
- 为解析、导航、安全边界或 UI 结构补测试。
- 改进 macOS 打包、安装或发行说明；发版前检查可参考 [中文发版检查清单](./docs/release.zh-CN.md)。

第一次贡献可以先看 [中文首次贡献指南](./docs/good-first-contributions.zh-CN.md) 或 [Good First Contributions](./docs/good-first-contributions.md)，再从开放的 [good first issue](https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) 或 [help wanted](https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) 中选择一个范围清楚的任务。

如果想先提新想法，请使用 feature request issue template，并先描述要改善的用户工作流，再讨论实现方案。项目决策、讨论入口和评审预期见 [中文治理指南](./docs/governance.zh-CN.md)。日常维护、可见度推广和发版前检查见 [中文维护者手册](./docs/maintainer-playbook.zh-CN.md)。近期方向和适合贡献的工作见 [中文路线图](./docs/roadmap.zh-CN.md) 或 [Roadmap](./docs/roadmap.md)。

## 本地开发

要求：

- macOS 12 或更高版本
- Node.js 22 或更高版本

如果使用 nvm，请在仓库根目录运行：

```bash
nvm use
```

安装依赖并启动开发版应用：

```bash
npm install
npm run run
```

检查本地环境：

```bash
npm run doctor
```

修改不熟悉的区域前，建议先看 [Architecture Overview](./docs/architecture.md)，了解主进程、preload bridge、renderer、CHM 解析、书库和打包边界。

## 提交前检查

打开 pull request 前请运行：

```bash
npm test
npm run typecheck
npm run check
```

`npm run check` 会覆盖类型检查、构建、文档链接、安全审计、README 脚本清单、文档索引、仓库 metadata、GitHub labels、社区健康文件、视觉资产、release 模板、Node.js 版本、license、README badges、AI 项目摘要、workflow 信任设置和 GitHub 模板质量。

可以参考 [Testing Guide](./docs/testing.md) 选择更窄的检查命令。改动 CHM 解析、搜索索引、缓存或大书库性能时，请参考 [Benchmarking Guide](./docs/benchmarking.md)。

## Pull Request 建议

- 填写 pull request template，说明变更摘要、用户影响、关联 issue/discussion、验证方式和截图。
- 保持每次改动聚焦在一个用户可见改进、bug 修复或维护任务上。
- 修改解析、导航、书库行为、IPC、安全边界或 renderer 交互时，请补测试。
- 用户可见命令、工作流、打包行为或支持范围变化时，请同步更新 README 和相关 docs。
- 平台支持、发行方式、信任说明或项目范围变化时，请同步更新 [Project Status](./docs/project-status.md)。
- 影响 Electron 应用或打包时，请说明手动验证使用的 macOS 版本和 Mac 架构。
- 不要提交私有 CHM 文件、`build/`、`dist/`、`node_modules/` 或个人环境文件。

## 报告 CHM 兼容性问题

提交 issue 前，请先查看 [中文故障排查](./docs/troubleshooting.zh-CN.md)、[Troubleshooting](./docs/troubleshooting.md)、[中文兼容性说明](./docs/compatibility.zh-CN.md) 和 [Compatibility Notes](./docs/compatibility.md)。如果需要准备可公开分享的复现文件、截图或 fixture，请参考 [中文 CHM 样本指南](./docs/sample-chm-guide.zh-CN.md) 或 [Sample CHM Guide](./docs/sample-chm-guide.md)。

兼容性报告最有帮助的信息包括：

- macOS 版本和 Mac 架构
- CHM 语言、近似大小和生成来源
- 受影响区域，例如打开、目录、页面渲染、内部链接、搜索或编码
- 最小复现步骤
- 应用中 `Help > Copy Diagnostic Info` 复制出的诊断信息
- 已移除私有路径和文档内容的截图或日志

如果 CHM 文件不能公开分享，请只提供安全的结构化信息，不要上传私有文档内容。

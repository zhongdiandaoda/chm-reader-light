# CHMReaderLight 中文适用场景

[English Use Cases](./use-cases.md)

本指南帮助你在下载 release build 前判断 CHMReaderLight 是否适合自己的离线文档工作流。想快速浏览界面和功能，可以先看 [中文功能导览](./feature-tour.zh-CN.md)；想和相邻工具做取舍，可以看 [中文对比指南](./comparison.zh-CN.md) 或 [Comparison](./comparison.md)；想从试用走到 star、watch release 或贡献，可以看 [中文采用检查清单](./adoption-checklist.zh-CN.md)。

CHMReaderLight 最适合在 macOS 上保存本地 `.chm` 手册的用户，例如 legacy SDK manuals、vendor help files、Microsoft HTML Help archives、offline API reference，或需要本地处理的 privacy-sensitive documentation collections。

## 最适合的工作流

- 原网站、安装包或旧帮助查看器不再方便时，继续搜索和阅读 legacy SDK manuals、API reference 和产品文档。
- 按项目整理 vendor help files 和 Microsoft HTML Help archives，同时保留原始 CHM 文件所在位置。
- 本地阅读 privacy-sensitive documentation collections，不依赖 telemetry、账号、cloud sync 或托管文档存储。
- 重新打开最近使用过的手册，通过目录查找相邻章节，或在只记得错误字符串、symbol、命令、配置项时搜索正文。

## 不适合的场景

- 编辑、创作或重新构建 CHM 文件。
- 跨设备同步手册，或发布托管文档站点。
- 运行 CHM 自带脚本、表单、plugin object、弹窗、嵌套 frame 或联网页面。
- 期待每个历史 CHM 都和 Internet Explorer 或 Windows HTML Help 中的渲染完全一致。

## 评估路径

1. 从 [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) 下载最新 macOS 构件。
   如果 GitHub Releases 暂无公开构件，请按照[中文入门指南](./getting-started.zh-CN.md)从源码运行。
2. 按 [中文入门指南](./getting-started.zh-CN.md) 用一本有代表性的 CHM 完成首次试用。
3. 如果你的手册较旧、多语言、内部使用或有合规要求，请查看 [中文兼容性说明](./compatibility.zh-CN.md)、[Compatibility Notes](./compatibility.md) 和 [中文隐私与本地数据](./privacy.zh-CN.md)。
4. 如果 CHMReaderLight 解决了你的工作流，可以使用 **Help > Star on GitHub**，让相似用户更容易找到它。

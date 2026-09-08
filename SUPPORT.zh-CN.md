# CHMReaderLight 中文支持指南

[English Support Guide](./SUPPORT.md)

CHMReaderLight 是一个用于阅读本地 CHM 文件的小型开源 macOS 应用。本页帮助你在提问、报告问题或分享使用场景前选择合适渠道。

参与公开 issue、pull request 或 Discussions 前，请先阅读 [中文行为准则](./CODE_OF_CONDUCT.zh-CN.md) 和 [Code of Conduct](./CODE_OF_CONDUCT.md)。

维护者和贡献者可以参考 [Issue Triage Guide](./docs/issue-triage.md) 统一处理公开报告、labels、复现信息和暂缓事项；日常维护和可见度检查见 [中文维护者手册](./docs/maintainer-playbook.zh-CN.md) 或 [Maintainer Playbook](./docs/maintainer-playbook.md)。

## 提问前先看

- 第一次安装、导入或阅读 CHM 文件时，先看 [中文入门指南](./docs/getting-started.zh-CN.md) 或 [Getting Started](./docs/getting-started.md)。
- 下载 release、校验 checksum、首次打开、更新或移除应用时，先看 [中文 macOS 安装指南](./docs/install-macos.zh-CN.md) 或 [macOS Install Guide](./docs/install-macos.md)。
- 下载、隐私、缓存和兼容性常见问题见 [中文 FAQ](./docs/faq.zh-CN.md) 或 [FAQ](./docs/faq.md)。
- 安装、打开、乱码、搜索或源文件移动问题见 [中文故障排查](./docs/troubleshooting.zh-CN.md) 或 [Troubleshooting](./docs/troubleshooting.md)。
- 某个 CHM 文件表现和预期不一致时，先看 [中文兼容性说明](./docs/compatibility.zh-CN.md) 或 [Compatibility Notes](./docs/compatibility.md)。
- 需要选择可公开分享的复现样本、截图或演示文件时，先看 [中文 CHM 样本指南](./docs/sample-chm-guide.zh-CN.md) 或 [Sample CHM Guide](./docs/sample-chm-guide.md)。
- 键盘、VoiceOver、焦点、颜色对比或外观问题见 [中文无障碍指南](./docs/accessibility.zh-CN.md) 或 [Accessibility Guide](./docs/accessibility.md)。
- 当前平台支持、发行信任说明和项目范围见 [中文项目状态](./docs/project-status.zh-CN.md) 或 [Project Status](./docs/project-status.md)。
- 新开报告前，请先搜索已有 [Issues](https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue) 和 [Discussions](https://github.com/zhongdiandaoda/chm-reader-light/discussions)，方便把重复问题集中到同一个调查线索。

## 使用问题

已安装应用的用户可以从 **Help > Report or Request** 开始，直接进入 question、install help、bug、CHM compatibility、feature request、performance、accessibility、documentation、release feedback、showcase 和 security-policy 路径。如果只想反馈 release 信任、下载、checksum、notarization、截图、demo 或支持信息，可以直接使用 **Help > Release Feedback**。

一般使用、设置或工作流问题可以使用 question issue template。请说明你想完成的任务、macOS 版本、Mac 架构，以及你是下载 release build 还是从源码运行。

下载、checksum、provenance verification、首次启动、更新或移除问题，请使用 install help issue template。请包含 release artifact 名称、相关 checksum 输出、attestation 输出、macOS 首次启动提示、macOS 版本和 Mac 架构。

开放式问题或使用经验可以发到 [GitHub Discussions](https://github.com/zhongdiandaoda/chm-reader-light/discussions)，不一定需要创建跟踪 issue。如果 release 信任、下载、checksum、notarization、截图、demo 或支持信息会影响你是否 star、watch 或分享 CHMReaderLight，请使用 [release-feedback Discussion](https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback)。

## Bug 与兼容性报告

应用无法打开、浏览、搜索或打包 CHM 文件时，请使用 bug report template。请说明安装来源，并在应用中选择 **Help > Copy Diagnostic Info**，把复制出的诊断信息粘贴到 issue。

CHM 专属兼容性问题请使用 CHM compatibility issue template，并尽量提供：

- CHM 语言和近似文件大小
- 文件是否可以公开分享或私下分享给维护者
- 受影响区域，例如打开、目录、页面渲染、内部链接、搜索、图片或文本编码
- 最小复现步骤

## 功能、性能与无障碍反馈

功能建议请使用 feature request issue template，先描述具体工作流问题，再说明希望看到的行为。

打开、提取、搜索索引、CHM 搜索、启动或大书库变慢时，请使用 performance issue template。请包含安全的文件规模信息、测量时间、安装来源，以及 **Help > Copy Diagnostic Info** 输出。

键盘、VoiceOver、焦点、颜色对比或外观问题请使用 accessibility issue template。请说明受影响工作流、输入方式或辅助技术、macOS 外观设置、最小复现步骤、期望的可访问行为，以及 **Help > Copy Diagnostic Info** 输出。

文档不清楚、缺失、过期或容易误解时，请使用 documentation issue template，并说明页面、困惑点和建议措辞。

## Showcase 与成功案例

如果 CHMReaderLight 改善了你的离线 CHM 工作流，可以使用 showcase issue template 分享使用场景，帮助后续用户判断是否值得下载、star 或关注 release。

请说明它解决了什么问题、最有帮助的功能，以及可以公开的环境信息。不要包含私有文档内容、专有截图、敏感路径或保密 CHM 文本。

更多提示见 [中文 Showcase 指南](./docs/showcase.zh-CN.md) 或 [Showcase Guide](./docs/showcase.md)。

## 安全问题

不要在公开 issue 中发布漏洞细节、敏感路径、私有文档内容或 proof-of-concept payload。请按照 [中文安全政策](./SECURITY.zh-CN.md) 或 [Security Policy](./SECURITY.md) 中的私密报告方式处理。

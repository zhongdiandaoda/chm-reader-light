# CHMReaderLight 中文采用检查清单

[English Adoption Checklist](./adoption-checklist.md)

当你在评估 CHMReaderLight 是否适合自己的离线文档工作流，或准备把项目推荐给需要 macOS CHM 阅读器的人时，可以按这份清单快速确认下载、试用、信任和 GitHub 后续动作。

## 5 分钟评估

- 从 [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) 为当前 Mac 架构下载最新 release build。
- 如果 GitHub Releases 暂无公开构件，请改为按照[中文入门指南](./getting-started.zh-CN.md)从源码运行 `npm run run`。
- 打开应用前，先校验同一 release 中对应的 `.zip.sha256` 校验文件。
- 从真实文档目录中导入一本有代表性的 `.chm` 文件。
- 确认书库会把原始源文件留在原位置，并展示你需要的文件夹、添加时间和上次打开 metadata。
- 打开 CHM 后检查可搜索目录、正文渲染、上一章/下一章导航、搜索、缩放和文本编码控制。
- 移动或重命名一份可丢弃的 CHM 副本，确认源文件缺失提示和重新定位流程是否清楚。

## 信任检查

- 阅读 [中文隐私与本地数据](./privacy.zh-CN.md)，确认 local-only 数据模型符合你的预期。
- 打开陌生 CHM 前阅读 [中文安全模型](./security-model.zh-CN.md) 或 [Security Model](./security-model.md)，了解阅读器边界、脚本限制和外部链接处理方式。
- 可选：用 GitHub artifact attestations 校验下载的 zip：

```bash
gh attestation verify CHMReaderLight-mac-arm64.zip --repo zhongdiandaoda/chm-reader-light
gh attestation verify CHMReaderLight-mac-x64.zip --repo zhongdiandaoda/chm-reader-light
```

- 如果你的 CHM 使用 legacy encoding、特殊目录 markup、frames、scripts 或 embedded plugin content，请先看 [中文兼容性说明](./compatibility.zh-CN.md) 或 [Compatibility Notes](./compatibility.md)。
- 安装、首次启动、缓存、乱码、搜索或失效路径问题，可以保留 [中文故障排查](./troubleshooting.zh-CN.md) 作为排查入口。

## GitHub 后续动作

- 如果 CHMReaderLight 解决了你的本地阅读工作流，可以通过 GitHub 或应用内 **Help > Star on GitHub** 使用 [Star the repository](https://github.com/zhongdiandaoda/chm-reader-light)，让其他 macOS CHM 用户更容易找到它。
- 如果你希望收到新版打包构件通知，可以 [Watch releases](https://github.com/zhongdiandaoda/chm-reader-light/releases)。
- 如果 release 页面、checksum、notarization、截图、demo 或支持信息会影响你是否信任、star、watch 或分享应用，请 [分享 release feedback](https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback)。
- 如果你想尝试阅读器、书库、搜索、打包或文档改进，可以 [Fork the project](https://github.com/zhongdiandaoda/chm-reader-light/fork)。
- 如果真实 CHM 暴露了文档尚未覆盖的兼容性问题，请 [提交聚焦 issue](https://github.com/zhongdiandaoda/chm-reader-light/issues/new/choose)，并只提供可公开分享或已脱敏的复现信息。
- 已安装应用的用户如果只是想反馈 release 信任信息，可以直接使用 **Help > Release Feedback**。
- 已安装应用的用户可以使用 **Help > Report or Request** 选择合适的 issue template、release feedback、安全政策或 showcase 路径。
- 想提交一个小而容易 review 的首个 pull request 时，可以从 [中文首次贡献指南](./good-first-contributions.zh-CN.md) 或 [Good First Contributions](./good-first-contributions.md) 开始。

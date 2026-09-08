# CHMReaderLight 中文分享素材包

[English Share Kit](./share-kit.md)

发布 release、写简短项目更新，或向需要离线 CHM 阅读器的 macOS 用户介绍 CHMReaderLight 时，可以使用这份素材包。文案应保持事实准确，并链接回 GitHub Releases、README 或当前 release 页面。

## 短介绍

一个面向 macOS 的轻量离线 CHM 阅读器和书库。

## 较长项目介绍

CHMReaderLight 是一个 macOS CHM 阅读器，采用书库优先的工作流来管理本地手册、SDK 文档和归档参考资料。添加一个或多个 `.chm` 文件后，可以在书库中分组和搜索，再打开本地优先阅读器，使用可搜索目录、正文搜索、阅读历史、缩放、文本编码控制，以及面向未知文档的更安全默认设置。

应用会把源 CHM 文件保留在你选择的位置。它不会上传、同步或托管文档内容，因此适合私有手册和离线文档集合。

## Release 公告模板

```text
CHMReaderLight <version> 已发布。

亮点：
- <面向用户的功能或修复>
- <兼容性、搜索、书库、安全或打包改进>
- <已知限制或升级提醒，如果相关>

下载：
- Apple Silicon: CHMReaderLight-mac-arm64.zip
- Intel: CHMReaderLight-mac-x64.zip

从 GitHub Releases 获取：
https://github.com/zhongdiandaoda/chm-reader-light/releases
```

## 社交帖模板

```text
CHMReaderLight 帮助 macOS 用户整理并搜索离线 CHM 手册。

它提供书库优先工作流、可搜索目录、正文搜索、阅读偏好和本地优先的文档处理方式。

GitHub 仓库：
https://github.com/zhongdiandaoda/chm-reader-light

可从 GitHub Releases 试用：
https://github.com/zhongdiandaoda/chm-reader-light/releases

如果它解决了你的离线 CHM 工作流，一个 GitHub star 可以帮助更多用户发现它。
```

用户也可以在应用内通过 **Help > Copy Share Text** 直接复制中英双语分享文案，内容包含最新下载链接、release watch 链接、release feedback 入口、GitHub star 链接和 showcase issue 链接、中文入门指南和中文分享素材包链接，方便面向本地受众发布。

也可以从这份素材包生成面向具体渠道的草稿：

```bash
npm run prepare:share-post -- --channel "MacAdmins Slack" --audience "macOS developers with archived SDK docs" --baseline-file <snapshot-file>
```

先运行 `npm run snapshot:growth`，再通过 `-- --baseline-file <snapshot-file>` 传入保存的输出，草稿就会包含当前 stars、downloads、watchers、release version 和日期。需要 release 公告草稿时使用 `-- --variant release`。

## 分享渠道

选择少量真正相关的渠道，优先面向已经讨论 macOS 工具、离线文档、SDK 参考工作流或开发者工具的人群：

- GitHub Release 页面：先发布清晰 release notes，再在分享下载构件时直接链接到对应 release。
- README 或中文分享素材包链接：当读者需要先查看截图、隐私说明、安装步骤或源代码时使用。
- macOS 开发者或文档工具社区：只有当离线 CHM 手册、旧版 SDK 文档或本地文档库是相关话题时再分享。
- 精选应用目录或开发者工具列表：release 构件可用后，用 [中文目录提交指南](./directory-submissions.zh-CN.md) 或 [Directory Submissions](./directory-submissions.md) 准备准确 listing 文案，并在 [中文目录提交跟踪表](./directory-submission-tracker.zh-CN.md) 或 [Directory Submission Tracker](./directory-submission-tracker.md) 记录每次提交。
- 现有用户对话：当有人分享成功工作流时，可以回复 showcase issue template，并附上 [中文 Showcase 指南](./showcase.zh-CN.md) 或 [Showcase Guide](./showcase.md)，帮助未来用户看到真实案例。

不要反复跨渠道发布同一段内容。优先为每个渠道写一段有上下文的说明，回答后续问题，并在真实用户故事或兼容性报告带来新信息时更新文案。

## 分享后的跟进

- 如果用户对 release 页面、下载、checksum、notarization、截图、demo 或支持信息仍有疑虑，请引导到 [release-feedback Discussion](https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback)，方便维护者先改进下一次发版说明，再请求更多 star。
- 只有在用户确认故事可以安全引用之后，再邀请他们使用 showcase issue template 分享公开案例。
- 在 [中文目录提交跟踪表](./directory-submission-tracker.zh-CN.md) 或 [Directory Submission Tracker](./directory-submission-tracker.md) 中更新线上 listing URL、baseline stars 或 downloads，以及后续复查指标，让之后的推广决策基于真实证据。
- 到复查窗口后，运行 `npm run prepare:promotion-follow-up -- --baseline-file <baseline-file> --current-file <current-file> --channel <channel>`，把保存的 baseline 和当前增长快照转成可粘贴的 tracker 证据备注。

## 推广检查清单

- 发布 GitHub Release 后再分享下载链接，确保所有 URL 都指向可用构件。
- 从 [Release Page Template](./release-template.md) 开始写 GitHub Release 正文，让下载选择、checksum 校验、首次启动预期和信任链接在推广前可见。
- 附上中文演示指南录制内容或 README 预览图，如果渠道支持视觉素材。
- 解释离线 CHM 工作流价值之后再请求 GitHub star。
- 更新仓库 social preview 和 About panel，再进行更大范围的发布。
- 分享后的前几天关注新 issue 和兼容性报告。

## 素材和演示

- 使用 [中文演示指南](./demo-guide.zh-CN.md) 或 [Demo Guide](./demo-guide.md) 录制短的书库到阅读器 walkthrough。
- 使用 [social preview artwork](./assets/social-preview.svg) 作为 GitHub 仓库分享图源文件。
- 更新 GitHub 仓库设置时使用 [upload-ready social preview PNG](./assets/social-preview.png)。
- 需要在 GitHub Markdown 中展示真实应用工作流时，使用 README 预览图。

## 语气

- 先讲实际问题：macOS 上的离线 CHM 手册。
- 面向重视隐私的用户分享时，说明本地优先的文档处理方式。
- 没有真实 CHM 样本或 issue 报告时，不要宣称广泛兼容。
- 需要更多细节时，把读者带到 [中文兼容性说明](./compatibility.zh-CN.md)、[中文隐私与本地数据](./privacy.zh-CN.md) 和 [中文故障排查](./troubleshooting.zh-CN.md)。

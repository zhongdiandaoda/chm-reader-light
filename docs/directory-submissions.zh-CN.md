# CHMReaderLight 中文目录提交指南

[English Directory Submissions](./directory-submissions.md)

把 CHMReaderLight 提交到精选应用列表、开源 macOS 应用列表、开发者工具目录或文档工具合集时，可以使用这份检查清单。目标是触达已经需要离线 CHM 阅读器的用户，而不是向无关社区重复发布。

## 提交前确认

- 已经有同时支持 Apple Silicon 和 Intel Mac 的公开 GitHub Release。
- repository About panel、topics、website field、social preview 和 badges 已与 [Repository Listing](./repository-listing.md) 保持一致。
- README、[中文适用场景](./use-cases.zh-CN.md)、[中文对比指南](./comparison.zh-CN.md)、[中文隐私与本地数据](./privacy.zh-CN.md) 和 [中文兼容性说明](./compatibility.zh-CN.md) 已回答常见的安装前问题。
- release 页面包含清晰的 artifact 名称、checksum 文件和当前 notarization caveat。
- 如果某个目录要求 Homebrew metadata，请参考 [中文 Homebrew Cask 指南](./homebrew-cask.zh-CN.md) 或 [Homebrew Cask Guide](./homebrew-cask.md)，并且只在 cask 已发布并验证后再提交。

## 候选目录类型

- 欢迎实用工具和本地优先工具的开源 macOS 应用列表。
- 覆盖离线文档、SDK reference 或文件查看器工具的开发者工具目录。
- 关注本地技术参考资料阅读、搜索或整理的文档工具合集。
- 明确接受维护中 GitHub 项目并能链接 release artifacts 的社区资源列表。

跳过通用 launch 站点、无关效率工具列表，或 CHM、离线文档、macOS 工具、开发者参考工作流都不是话题的社区。

## Outreach Backlog

按照受众匹配度、提交成本，以及是否能链接 GitHub Releases 来排序：

- 高优先级：接受维护中实用工具的开源 macOS 应用列表。
- 高优先级：开发者文档或 API reference 工具索引。
- 中优先级：Electron app gallery 或 local-first 工具合集。
- 低优先级：没有明显 CHM、macOS 或 offline documentation search 类目的宽泛软件目录。

提交前先在 tracker 里记录来源和优先级，方便后续维护者理解为什么选择这个目录。

## 发现查询

使用这些可直接复制的搜索语句寻找候选目录，避免把项目绑定到某个很快过期的固定列表：

```text
"开源 macOS 应用" CHM 阅读器
"离线文档" "macOS" "GitHub Releases"
"Electron apps" "developer tools" directory
topic:chm topic:macos
```

把实际 query、结果 URL 和拒绝原因记录到 tracker，后续 visibility push 就能复用有效搜索，并跳过不合适的渠道。

## 提交文案

短介绍：
```text
一个面向 macOS 的轻量离线 CHM 阅读器和书库。
```

较长介绍：
```text
CHMReaderLight 帮助 macOS 用户整理并搜索本地 CHM 手册、旧版 SDK 文档、厂商帮助文件和离线 API reference。它保留源 CHM 文件位置，提供书库优先工作流，并用本地优先阅读器和面向未知文件的更安全默认设置打开文档。
```

使用 GitHub 仓库 URL 作为 canonical project link。只有当目录有单独下载字段时，才使用最新 GitHub Release URL。

## Listing Packet

当目录表单要求 canonical links 和 tags 时，可以直接复制这组字段：

```text
Project URL: https://github.com/zhongdiandaoda/chm-reader-light
Download URL: https://github.com/zhongdiandaoda/chm-reader-light/releases
Support URL: https://github.com/zhongdiandaoda/chm-reader-light/blob/main/SUPPORT.zh-CN.md
Suggested tags: chm, offline-documentation, macos, electron, reader
```

如果目录需要版本号、changelog 或验证信息，请从 release 页面复制最新版本号和 checksum 链接。

不要提交私有 CHM 截图、私有文档内容、敏感本地路径，或没有真实文件验证过的兼容性声明。

解释离线 CHM 工作流价值之后再请求 GitHub star，并链接到 [中文适用场景](./use-cases.zh-CN.md)、[中文对比指南](./comparison.zh-CN.md) 或 [中文采用检查清单](./adoption-checklist.zh-CN.md) 这样的评估路径。

## 跟踪

记录每次提交的目录名称、URL、提交文案、日期、release 版本和后续状态。使用 [中文目录提交跟踪表](./directory-submission-tracker.zh-CN.md) 或 [Directory Submission Tracker](./directory-submission-tracker.md) 集中维护线上 listing URL、过期文案检查和后续日期。

listing 上线后，检查描述、标签、截图和下载链接是否仍与当前仓库 metadata 一致。

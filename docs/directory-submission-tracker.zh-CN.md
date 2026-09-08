# CHMReaderLight 中文目录提交跟踪表

[English Directory Submission Tracker](./directory-submission-tracker.md)

当 CHMReaderLight 已提交到应用目录、开源 macOS 应用列表、开发者工具索引或文档工具合集后，用此模板记录后续状态。把公开 listing 跟进集中到一处，可以在 release 后保持描述、tags、截图和下载链接准确。

## 提交记录

| 优先级 | 来源 | 目录 | URL | 提交文案 | Release 版本 | 提交日期 | 提交时 Stars/Downloads/Watchers | 复查 Stars/Downloads/Watchers | 状态 | 后续动作 | 证据 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| High | GitHub search: macOS apps list | 示例目录 | https://example.com/listing | 来自中文分享素材包的短介绍或较长介绍 | v0.1.0 | YYYY-MM-DD | 12 stars / 45 downloads / 3 watchers | 7 天后复查 | Submitted | 审核通过后复查 | 2026-09-11：listing 已上线，15 stars，60 downloads，4 watchers |

状态可以使用 `Planned`、`Submitted`、`Live`、`Needs update`、`Rejected` 或 `Retired`。后续动作列用于记录审核意见、要求修改的内容、下次检查日期或过期 listing 清理。

使用 `High`、`Medium` 或 `Low` 优先级，让下一批 outreach 更聚焦。来源列记录发现候选目录的 saved search、community list 或推荐线索。

提交时记录 GitHub stars、release downloads 和 watchers 基线，复查时对比这些数字，方便维护者判断哪些外部 listing 值得继续更新或重复投放。每次复查都补一条带日期的证据记录，包括线上 listing 状态、release-feedback 主题、支持问题或 showcase 故事，说明指标变化来自哪里。

## Listing 质量检查

- description 与当前 repository About panel 和 package metadata 一致。
- tags 覆盖 CHM、offline documentation、macOS、Electron 和 reader 搜索词。
- canonical project link 指向 GitHub 仓库 README。
- 当目录有单独下载字段时，download link 指向最新 GitHub Release。
- release 版本与用户实际可以下载的 artifacts 一致。
- 截图或预览图不包含私有 CHM 内容、敏感文件路径、客户名称或保密文档文本。
- listing 不要在相关功能发布并记录前宣称 Windows、Linux、cloud sync、广泛 CHM 兼容性、notarization、Homebrew 可用或自动更新。

## 跟进节奏

每次公开 release 后重新检查线上 listing；当仓库描述或 social preview 改动后也要复查；更大范围推广前再做一次快速检查。文案、tags、截图、下载 URL 或信任说明不再匹配仓库时，把状态标记为 `Needs update`。

如果某个目录不再接受当前项目范围，或指向过期 artifacts，请更新该 listing，或标记为 `Retired`，避免后续推广继续复用。

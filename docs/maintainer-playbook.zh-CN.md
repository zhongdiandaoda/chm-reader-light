# CHMReaderLight 中文维护者手册

[English Maintainer Playbook](./maintainer-playbook.md)

这份手册用于保持 CHMReaderLight 可信、易发现、易贡献。它连接已有的支持、发版和发现渠道文档，不替代这些文档。

## 每周维护

- 通过 Issue Triage Guide 审查新的 Issues 和 Discussions，先判断报告属于支持、文档、兼容性、功能还是暂缓事项。
- 在支持路径、issue templates、Discussions、安全报告、贡献入口或仓库自动化变化后，复查 Community Standards Checklist。
- 确认 `Help > Report or Request` 仍然指向当前可用的 issue templates、release feedback Discussion、showcase route 和 security policy。
- 需要清晰决策路径、维护者职责、discussion-first 边界或评审预期时，使用中文治理指南或 Governance Guide。
- 保持至少一个范围清楚的 good first issue 可见，让新贡献者能看到工作流价值、可能相关文件和验证命令。
- 检查 release feedback 和 showcase stories，找出重复摩擦、安全可引用故事和后续文档机会。
- 确认公开支持线程没有包含私有 CHM 内容、敏感本地路径、专有截图或机密文档文本。
- 将过大的想法拆成更小的 feature request、roadmap note 或后续 discussion，避免模糊工作堆积。

## 可见度推广前

- 复查 Repository Listing，确认 GitHub description、topics、website field、social preview、pinned items、labels 和 Discussions setup 与当前项目一致。
- 运行 `npm run check:remote-listing`，确保线上 GitHub description、website、topics 和 Discussions 设置已经匹配 Repository Listing。
- 使用 Growth Readiness 指南把远端 audit 失败项转成下一步推广任务，包括 baseline stars、downloads、watchers 和后续复盘证据。
- 使用中文分享素材包或 Share Kit 编写事实准确的 release/social copy，并把 star 请求绑定到真实的离线 CHM 工作流价值。
- 提交到新目录前，先查看中文目录提交跟踪表或 Directory Submission Tracker，避免重复投放过期 listing。
- 确认最新 release 页面仍然展示 checksum、artifact attestations、首次打开预期、Project Status 和支持路径。
- 运行 `npm run check:remote-release`，确认最新公开 GitHub Release 已提供 Apple Silicon、Intel 两个 macOS zip 以及对应 checksum 文件。
- 推广文案提到信任、安全、兼容性或键盘访问时，复查中文隐私与本地数据、安全模型、兼容性说明和无障碍指南。

## 决策规则

- 暂缓或拒绝与 Project Status 或 Roadmap 冲突的请求，尤其是 cloud sync、hosted document storage、telemetry、CHM authoring、广泛跨平台打包或尚未支持的发行渠道声明。
- 不要在用户有清晰评估路径之前请求 star；评估路径可以是 release 下载、适用场景、对比指南、采用检查清单或一次成功的支持结果。
- 如果应用行为符合设计但用户无法预期结果，优先改进支持或文档。
- 当报告包含安全的 CHM 细节、诊断信息和最小复现步骤时，优先处理可复现的兼容性工作。
- 公开线程中只请求脱敏日志、近似文件信息和打码截图，不要求用户上传私有 CHM 文件。

## 维护证据

- 趁上下文仍清楚时，把面向用户的维护、支持、发版、发现和文档变化写入 `CHANGELOG.md`。
- 支持路由变化时，同步 README、Support Guide、Documentation Index、Repository Listing guide、中文维护者手册和应用内 Help menu 文案。
- 文档、metadata、workflow 或 release-process 变化准备 review 前，运行 `npm run check`。
- 修改测试、应用行为、issue templates、release checks 或静态文档契约后，运行 `npm test`。
- 发布 artifacts 前使用 Release Checklist；平台支持、发行方式、信任 caveats 或项目范围变化时，同步 Project Status。

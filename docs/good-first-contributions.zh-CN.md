# CHMReaderLight 中文首次贡献指南

[English Good First Contributions](./good-first-contributions.md)

当你想提交一个小而容易 review 的第一个 pull request 时，可以从这份指南开始。好的首次贡献应该容易说明、容易验证，并且连接到真实的 CHMReaderLight 用户工作流。

## 选择小范围任务

- CHM 兼容性 fixture：为目录嵌套、文本编码、内部链接、图片路径或搜索索引行为添加聚焦示例。使用 [中文 CHM 样本指南](./sample-chm-guide.zh-CN.md) 保持 fixture 和截图可公开分享。
- 书库工作流打磨：改进源路径标签、重复导入处理、重新定位、空状态或过滤行为，不改变源 CHM 文件的保存方式。
- 文档修复：根据真实用户问题澄清安装、故障排查、隐私、测试、release 或兼容性说明。
- 打包检查：收紧 macOS 打包文档、CHMLib vendoring 检查、release artifact 命名或 checksum 预期。

避免从大范围 UI 重写、新平台、cloud sync 或 CHM 创作功能开始。这些要么超出当前范围，要么需要先做设计讨论。

## 找到新手任务

打开 pull request 前，先找带有 `good first issue` 或 `help wanted` 标签的 issue。好的新手任务应该说明受影响工作流、可能相关的文件，以及最小可用的验证命令。

可以先看开放的 [good first issue](https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) 列表，选择范围最小的任务；如果希望维护者提供更多 review 和指导，也可以看开放的 [help wanted](https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) 列表。

如果 issue 需要私有 CHM 样本、大范围 UI 决策、新平台支持、签名或公证工作，或 release 流程变更，请在开始前先请求缩小范围。

维护者创建新手任务时，可以使用 good first task issue template，让每个任务都包含工作流价值、可能相关文件、最小可接受变更、验证命令和指导说明。

## 有用的文件指针

- `src/library.ts` 和 `test/library.test.ts` 覆盖纯书库数据行为、重复安全导入、过滤、排序和缺失源文件重新定位。
- `src/chm.ts` 和 `test/chm.test.ts` 覆盖 CHM metadata 解析、文本解码、资源解析、搜索索引和内容高亮。
- `src/navigation.ts` 和 `test/navigation.test.ts` 覆盖 topic 匹配和上一章/下一章阅读顺序。
- `src/renderer.ts`、`src/index.html` 和 `src/styles.css` 覆盖书库和阅读器界面。
- `src/main.ts` 和 `src/preload.ts` 覆盖 Electron 菜单、IPC、本地文件访问、最近文档和受限 preload bridge。
- `scripts/package-macos.sh` 和 `docs/release.md` 覆盖 macOS app 打包和 release artifacts。

## 打开 Pull Request 前

- 保持 pull request 聚焦在一个用户可见改进、bug 修复、文档更新或维护任务上。
- 行为变化需要添加或更新测试。
- 面向用户、贡献者、release 或工作流的变化需要更新 `CHANGELOG.md`。
- review 前运行 `npm run check`。
- 需要选择更窄的迭代检查时，参考 [Testing Guide](./testing.md)。
- 按 pull request template 填写用户影响、验证方式、相关截图、macOS 版本和 Mac 架构。

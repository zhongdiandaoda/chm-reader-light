# CHMReaderLight 中文功能导览

[English Feature Tour](./feature-tour.md)

这份导览帮助评估者和新用户在安装或提交 issue 前快速了解 CHMReaderLight 的核心工作流。想判断是否适合自己的文档场景，可以先看 [中文适用场景](./use-cases.zh-CN.md) 或 [Use Cases](./use-cases.md)；想从试用走到 star、watch release 或贡献，可以看 [中文采用检查清单](./adoption-checklist.zh-CN.md)；需要录制可分享 walkthrough 时，可以使用 [中文演示指南](./demo-guide.zh-CN.md)。

## 书库优先

CHMReaderLight 打开后先进入本地书库，而不是空白阅读器。你可以通过 **File > Add CHM to Library** 添加文件，也可以拖拽导入一个或多个 `.chm` 文件。拖拽导入会把书加入当前选中的书库分组。

书库会保存源文件路径、文件夹标签、布局偏好、当前选中的书库分组、添加时间、上次打开 metadata 和源文件缺失提示，方便管理较大的离线文档目录，同时不复制源 CHM 文件。列表会优先显示最近打开的书，再按添加时间和标题排序。

## 阅读器工作流

打开书库条目后会进入阅读器。左侧展示可搜索目录和章节数量，工具栏展示阅读位置，并提供历史前进/后退、上一章/下一章、正文缩放和文本编码等控制。

阅读器会在本地保留缩放、文本编码、侧栏宽度、侧栏显示状态和每本 CHM 的上次阅读章节。`Command+F` 会聚焦当前视图的搜索框；正文搜索、目录过滤、匹配跳转和索引限制见 [中文搜索指南](./search.zh-CN.md) 或 [Search Guide](./search.md)。

## 信任和本地数据

CHMReaderLight 不会包含 telemetry、账号、cloud sync 或托管文档存储。它把书库 metadata 和阅读偏好保存在你的 Mac 上，通过受限的 `chm://` 协议加载已提取内容，并阻止 CHM 自带脚本、表单、弹窗、嵌套 frame、plugin object 和网络连接。

更多细节见 [中文隐私与本地数据](./privacy.zh-CN.md)、[Privacy and Local Data](./privacy.md)、[中文兼容性说明](./compatibility.zh-CN.md)、[Compatibility Notes](./compatibility.md) 和 [中文安全政策](../SECURITY.zh-CN.md)。

## 出现异常时

安装、打开、乱码、目录缺失、搜索、缓存或源文件路径失效问题，请先看 [中文故障排查](./troubleshooting.zh-CN.md) 或 [Troubleshooting](./troubleshooting.md)。如果需要报告问题，请在应用中选择 **Help > Copy Diagnostic Info**，并附上可以公开分享的最小复现步骤。

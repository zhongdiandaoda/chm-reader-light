# CHMReaderLight 中文入门指南

[English Getting Started](./getting-started.md)

这条短路径帮助第一次使用的用户安装 CHMReaderLight、添加本地 CHM 文件，并找到最常用的阅读控制。

## 1. 安装应用

从 [GitHub Releases](https://github.com/zhongdiandaoda/chm-reader-light/releases) 下载最新 macOS 构件。Apple Silicon Mac 选择 `CHMReaderLight-mac-arm64.zip`，Intel Mac 选择 `CHMReaderLight-mac-x64.zip`。

如果 GitHub Releases 暂无公开构件，请先安装 Node.js 22 或更高版本与 CHMLib，克隆仓库后从源码运行：

```bash
npm install
npm run run
```

下载校验、首次启动、更新和移除步骤见 [中文 macOS 安装指南](./install-macos.zh-CN.md)。

## 2. 添加第一本 CHM

打开 CHMReaderLight，选择 **File > Add CHM to Library**，可以一次选择一个或多个本地 `.chm` 文件。

也可以拖拽一个或多个 `.chm` 文件到书库窗口。文件会加入当前选中的书库分组。

## 3. 阅读和导航

点击书库条目即可进入阅读器。使用可搜索目录在章节之间跳转，或按 `Command+F` 聚焦当前视图的搜索框。书库搜索、正文搜索、目录过滤、匹配跳转和索引限制见 [中文搜索指南](./search.zh-CN.md) 或 [Search Guide](./search.md)。

阅读器会在两次启动之间保留缩放、文本编码、当前书库、书库布局、侧栏宽度、侧栏显示状态、搜索范围和每本 CHM 的上次阅读章节。书库也会在本地保存上次打开 metadata，用来优先显示最近打开的书。完整菜单和键盘参考见 [中文快捷键指南](./shortcuts.zh-CN.md) 或 [Keyboard Shortcuts](./shortcuts.md)，键盘、辅助技术和外观预期见 [中文无障碍指南](./accessibility.zh-CN.md) 或 [Accessibility Guide](./accessibility.md)。

想快速了解书库和阅读器工作流，可以看 [中文功能导览](./feature-tour.zh-CN.md) 或 [Feature Tour](./feature-tour.md)。

## 4. 保持书库整洁

CHMReaderLight 保存的是源 CHM 文件引用，而不是复制文件。如果源文件移动，请在缺失的书库卡片上使用重新定位操作。

使用 **Help > Privacy and Local Data** 查看哪些数据保留在 Mac 上；本地数据边界也可看 [中文隐私与本地数据](./privacy.zh-CN.md)。使用 **Help > Compatibility Notes** 查看 CHM 行为预期；中文说明见 [中文兼容性说明](./compatibility.zh-CN.md)。需要帮助时，可用 **Help > Report or Request** 选择合适的 issue template、release feedback、安全政策或 showcase 路径；提交问题前，请先看 [中文故障排查](./troubleshooting.zh-CN.md)，并使用 **Help > Copy Diagnostic Info** 复制安全的环境信息。

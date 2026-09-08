# CHMReaderLight 中文隐私与本地数据

[English Privacy and Local Data](./privacy.md)

CHMReaderLight 是一个本地 macOS 阅读器。它不会包含 telemetry、analytics、账号、cloud sync 或托管文档存储。

实现层面的 CHM 信任边界见 [中文安全模型](./security-model.zh-CN.md) 或 [Security Model](./security-model.md)。下载、安装和首次启动说明见 [中文 macOS 安装指南](./install-macos.zh-CN.md)。

## 保留在本地的数据

- CHM 源文件留在你选择的位置。书库保存文件引用和 metadata，不会复制或上传源 CHM 文件。
- 书库 metadata 保存在 Electron app data 目录下的 `library/library.json`。它包含 CHM 显示名、源文件路径、所属书库、添加时间和上次打开时间。
- 已提取的 CHM 内容会缓存在 app data 目录下的 `extracted-books/`，这样再次打开同一本书通常会更快。
- 打开文档时，系统临时目录中可能会短暂创建提取 staging folder。
- 书库 grid/list 展示偏好保存在浏览器 `localStorage`。
- 阅读器偏好，例如正文缩放、文本编码、侧栏宽度、侧栏显示状态、搜索范围和上次阅读章节，也保存在浏览器 `localStorage`。
- 成功打开过的 CHM 路径可能会加入 macOS 最近打开文档菜单。

## 阅读器边界

- CHM 页面通过应用受限的 `chm://` 协议提供，并在读取前检查路径边界。
- 渲染后的 CHM 页面使用严格的 Content Security Policy，阻止 CHM 自带脚本、inline event handlers、表单提交、嵌套 frame、plugin object 和网络连接。
- 阅读器 iframe 只允许 CHMReaderLight 注入的一小段 nonce-protected navigation bridge 脚本运行，用来把当前章节 URL 变化同步给应用。
- CHM 正文中的外部 `http` 和 `https` 链接会在默认浏览器中打开，而不是在嵌入阅读器中导航。

## 移除本地数据

- 从书库移除一本书或一个分组，只会删除 CHMReaderLight 保存的引用，不会删除源 CHM 文件。
- 如果在应用外移动、重命名或删除 CHM，书库条目可能变成失效引用。可以使用重新定位操作更新路径，或删除失效条目后重新添加文件。
- 只想清理已提取文档缓存时，选择 **Help > Clear Extracted Cache**。这会保留源 CHM 文件和书库 metadata。
- 想检查或完整清理应用数据时，选择 **Help > Reveal App Data Folder**，退出应用，然后在 Finder 中删除需要清理的 metadata 或 cache 文件。

## 报告隐私或安全问题

如果你发现 CHMReaderLight 读取了所选文档外的路径、执行了不受信任的 CHM 代码、意外暴露私有路径，或把本地数据发送到意料之外的位置，请按 [中文安全政策](../SECURITY.zh-CN.md) 或 [Security Policy](../SECURITY.md) 私下报告。

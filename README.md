# CHMReaderLight

一个面向 macOS 的轻量 CHM 阅读器。进入应用后先看到书库（已添加的 CHM 文件列表），点击某本文档才进入阅读页面：左侧展示可搜索、可折叠的目录树，右侧展示文档正文，随时可返回书库。

## 功能

- 书库视图集中管理已添加的 CHM 文档，仅记录源文件路径（不复制文件），条目在重启后依然保留
- 左侧边栏支持创建多个书库分组，并保留「全部」汇总入口，添加时归入当前选中的书库
- 内容区支持平铺与列表两种展示方式切换
- 使用 macOS 原生文件选择器添加 CHM（支持多选）；从书库或分组中移除时只删除引用，不删除源文件
- 点击书库条目进入阅读页面，顶部「书库」按钮可随时返回
- 解析 `.hhc` 目录并展示多级层级导航
- 支持目录搜索、折叠和侧栏宽度调整
- 支持按目录顺序浏览上一页、下一页，以及历史前进、后退和正文缩放
- 支持 `Command+O` 添加、`Command+L` 返回书库，以及 Finder 文件打开事件
- 默认禁用 CHM 内脚本并限制资源访问范围
- 支持 Apple Silicon 与 Intel Mac 打包

## 环境要求

- macOS 12 或更高版本
- Node.js 22 或更高版本

检查环境：

```bash
npm run doctor
```

## 本地运行

```bash
npm install
npm run run
```

也可以在应用菜单中选择 `File > Add CHM to Library...`（或按 `Command+O`）添加文档，`File > Show Library`（或按 `Command+L`）返回书库。

## 测试与检查

```bash
npm test
npm run check
```

## macOS 打包

自动使用当前机器架构：

```bash
npm run package:mac
```

Apple Silicon：

```bash
npm run package:mac:arm64
```

Intel：

```bash
npm run package:mac:x64
```

应用会生成在 `dist/` 目录。打包阶段会把 `extract_chmLib` 和 `libchm` 内置到 `.app` 中，因此目标 Mac 不需要额外安装 CHMLib。打包机需要安装对应架构的 CHMLib 作为 vendoring 来源：Apple Silicon 默认路径为 `/opt/homebrew/bin/extract_chmLib`，Intel 默认路径为 `/usr/local/bin/extract_chmLib`。

## macOS 安装

安装当前机器架构的包到 `/Applications/CHMReaderLight.app`。如果应用已存在，脚本会自动升级到最新打包版本：

```bash
npm run install:mac
```

指定架构安装：

```bash
npm run install:mac:arm64
npm run install:mac:x64
```

如果 `/Applications` 没有写入权限，可以先打包，再手动复制 `dist/CHMReaderLight-darwin-*/CHMReaderLight.app` 到应用程序目录。

## 脚本清单

- `npm run doctor`：检查 macOS、Node.js 和 npm。
- `npm run run`：检查环境，安装缺失的 npm 依赖，并启动开发版应用。
- `npm run package:mac`：按当前机器架构打包 macOS 应用。
- `npm run package:mac:arm64`：打包 Apple Silicon 应用。
- `npm run package:mac:x64`：打包 Intel 应用。
- `npm run install:mac`：打包并安装到 `/Applications/CHMReaderLight.app`，若已存在则升级覆盖。
- `npm run clean`：清理 `dist/` 打包产物。

## 实现说明

- 书库条目仅在 `library.json` 中记录源文件的原始路径、显示名、所属书库和添加时间（不复制源文件）；进入应用先渲染书库，点击条目才提取并进入阅读视图。移除书库或文档只删除该记录，不影响源文件。
- Electron 主进程优先调用应用内置的 `extract_chmLib`，将文档释放到应用专用临时目录；开发环境可回退到系统安装的 `extract_chmLib`。
- `.hhc` 文件在主进程解析为纯数据目录树，兼容子级 `<ul>` 嵌套在 `<li>` 内或作为相邻兄弟节点的两种常见格式，再通过隔离的 preload API 传给界面。
- 正文通过受限的 `chm://` 自定义协议加载，所有路径在读取前都进行解码和目录边界检查。
- 正文 iframe 不允许脚本、表单或弹窗；协议响应额外携带严格 CSP。
- 切换文档和退出应用时会清理已提取的临时文件。

## 参考

- [Electron IPC](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Electron protocol API](https://www.electronjs.org/docs/latest/api/protocol)
- [Electron dialog API](https://www.electronjs.org/docs/latest/api/dialog)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)

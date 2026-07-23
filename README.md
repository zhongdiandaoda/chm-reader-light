# CHM Reader

一个面向 macOS 的轻量 CHM 阅读器。打开本地 `.chm` 文件后，左侧展示可搜索、可折叠的目录树，右侧展示文档正文。

## 功能

- 使用 macOS 原生文件选择器打开 CHM
- 解析 `.hhc` 目录并展示多级层级导航
- 支持目录搜索、折叠和侧栏宽度调整
- 支持按目录顺序浏览上一页、下一页，以及历史前进、后退和正文缩放
- 支持 `Command+O` 快捷键及 Finder 文件打开事件
- 默认禁用 CHM 内脚本并限制资源访问范围
- 支持 Apple Silicon 与 Intel Mac 打包

## 环境要求

- macOS 12 或更高版本
- Node.js 22 或更高版本
- Homebrew
- CHMLib 0.40

安装 CHM 解析工具：

```bash
brew install chmlib
```

检查环境：

```bash
npm run doctor
```

## 本地运行

```bash
npm install
npm run run
```

也可以在应用菜单中选择 `File > Open CHM...`，或按 `Command+O`。

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

应用会生成在 `dist/` 目录。CHMLib 当前作为运行时依赖，目标 Mac 也需要执行一次 `brew install chmlib`。

## macOS 安装

安装当前机器架构的包到 `/Applications/CHMReader.app`。如果应用已存在，脚本会自动升级到最新打包版本：

```bash
npm run install:mac
```

指定架构安装：

```bash
npm run install:mac:arm64
npm run install:mac:x64
```

如果 `/Applications` 没有写入权限，可以先打包，再手动复制 `dist/CHMReader-darwin-*/CHMReader.app` 到应用程序目录。

## 脚本清单

- `npm run doctor`：检查 macOS、Node.js、Homebrew 和 `extract_chmLib`。
- `npm run run`：检查环境，安装缺失的 npm 依赖，并启动开发版应用。
- `npm run package:mac`：按当前机器架构打包 macOS 应用。
- `npm run package:mac:arm64`：打包 Apple Silicon 应用。
- `npm run package:mac:x64`：打包 Intel 应用。
- `npm run install:mac`：打包并安装到 `/Applications/CHMReader.app`，若已存在则升级覆盖。
- `npm run clean`：清理 `dist/` 打包产物。

## 实现说明

- Electron 主进程调用 `extract_chmLib`，将文档释放到应用专用临时目录。
- `.hhc` 文件在主进程解析为纯数据目录树，兼容子级 `<ul>` 嵌套在 `<li>` 内或作为相邻兄弟节点的两种常见格式，再通过隔离的 preload API 传给界面。
- 正文通过受限的 `chm://` 自定义协议加载，所有路径在读取前都进行解码和目录边界检查。
- 正文 iframe 不允许脚本、表单或弹窗；协议响应额外携带严格 CSP。
- 切换文档和退出应用时会清理已提取的临时文件。

## 参考

- [Electron IPC](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Electron protocol API](https://www.electronjs.org/docs/latest/api/protocol)
- [Electron dialog API](https://www.electronjs.org/docs/latest/api/dialog)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)

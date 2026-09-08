# CHMReaderLight 中文安全模型

[English Security Model](./security-model.md)

CHMReaderLight 用于在 macOS 上阅读本地 CHM 文档。本页说明打开未知来源或内部来源 CHM 文件时需要关注的 trust boundaries。

## 信任边界

- CHM 文件是不受信任输入，即使它来自你信任的团队或供应商。
- 源 CHM 文件保留在原始位置；应用保存文件路径和 metadata，而不是原始文档副本。
- 已提取的书籍内容保存在应用数据目录中，并通过受限的 `chm://` 协议提供。
- Native CHM 解包使用有上限的输出缓冲和两分钟超时。打包版 helper 会在写入越界条目前拒绝超过 60,000 个入口或 50,000 个文件、声明输出总量超过 1 GiB、单文件超过 256 MiB 的 CHM；在解析 metadata 或建立搜索索引前，应用还会按相同预算独立核验实际解包目录，并拒绝符号链接及其他非普通文件。Metadata 解析会复用有界异步目录遍历生成的文件清单，不再同步重复枚举目录；后台搜索索引线程也会在建索引前再次执行有界核验。验证失败时打开流程保持 fail-closed，失败或超时的 staging directory 会在错误返回阅读器前被清理。使用系统 `extract_chmLib` 的本地源码运行仍有解包后门禁，但不能假定拥有打包版 helper 的写入前限制。
- macOS package 从固定 commit 和经过 SHA-256 校验的 archive 构建 CHMLib，再应用 CVE-2025-48172 边界检查 backport 与 native 解包预算补丁。打包和最终 zip 验证会拒绝源码、补丁、provenance、二进制哈希、架构或相对动态链接不匹配的产物。
- Extracted cache key 包含源文件的解析后路径、文件系统设备号与 inode、字节大小，以及纳秒精度的修改时间和状态变更时间。新解包会在最终缓存目标旁创建 staging directory，使发布始终是同一文件系统内的原子 rename。应用会在发布前复核源身份，并在读取已有缓存或发布 staging directory 后、激活已打开书籍状态前再次复核。因此源文件在任一路径中被替换都会 fail closed；最终复核失败时会删除本次刚发布的缓存，即使同大小 CHM 在一毫秒内被替换，也会选择新缓存而不是复用旧内容。主进程内的打开、文本编码重载与缓存清理事务会串行执行，避免来自界面、Finder、第二实例或维护操作的重叠请求竞争缓存发布和当前阅读状态；文本编码重载仅在 metadata 解析成功后提交新的活动编码。空的 extracted cache 会被视为无效，使打开流程能够重建过期或不完整的缓存状态。
- 内存中的 markup 转换限制为单个 HTML 或 HHC 文件 16 MiB。有界文件读取会在解码前核验已打开文件的 inode、预期大小、最终大小和完整读取字节数。每本书搜索索引的 HTML 源数据 128 MiB 是另一层上限，索引会在下一页突破预算前停止收录；超大页面不会进入搜索，超大的目录文件和阅读器页面则 fail closed。后台搜索 worker 启动失败时会降级为空的正文搜索索引，不会让原本已成功的书籍打开或编码重载变成半提交失败。非 HTML 资源继续使用流式响应路径。
- HHC 导航解析最多接受 50,000 个目录项和 256 层嵌套，避免体积较小但结构恶意的 markup 生成无界侧栏树或耗尽解析栈。
- 每个 `chm://` 资源请求都会在读取文件前基于已提取书籍根目录解析，因此解码后的路径不能逃逸到无关本地目录。
- external `http` 和 `https` links 会交给默认浏览器打开，而不是替换本地阅读器页面。

## 阅读器隔离

- CHM 页面渲染在 sandboxed iframe 中。
- Content Security Policy 会阻止 CHM 自带脚本、inline event handlers、表单提交、嵌套 frame、plugin objects、网络连接和任意 base URL。
- iframe 允许脚本只是为了让 CHMReaderLight 注入一小段 nonce-protected navigation bridge，用于侧栏同步和阅读历史。
- preload bridge 暴露的是受限的 `window.chmReader` API，不会给 renderer code 直接的 Node.js 或 Electron 访问能力。
- 顶层应用窗口会拒绝 renderer 发起的页面跳转和弹窗创建，避免不受信任网页替换本地 UI 或继承其 preload bridge。
- 阅读器 subframe 只允许在当前 `chm://book` origin 内跳转，另保留应用使用的精确 `about:blank` 加载过渡；远程或格式错误的 frame 目标会在导航前被阻止。
- 应用的 browser session 会拒绝网页权限检查和请求，因为 CHM 阅读不需要摄像头、麦克风、定位、通知等能力。
- 主进程 IPC handlers 只接受当前应用窗口 main frame 的请求；CHM iframe 和其他 web contents 的调用会被拒绝。
- macOS 打包会在最终代码签名前翻转生产 Electron fuses：禁用 `ELECTRON_RUN_AS_NODE`、`NODE_OPTIONS` 和命令行调试入口，启用 cookie encryption 与 `OnlyLoadAppFromAsar`。embedded ASAR integrity validation 已启用；最终 release bundle 验收会从打包后的 Electron Framework 读回这些状态，并核验 `Info.plist` 中的 `ElectronAsarIntegrity` metadata 与实际 `app.asar` header 一致。由于可信顶层 UI 当前通过 `file://` 加载，file-protocol privileges 仍保持开启。这些 fuses 用于收紧未使用的 runtime 入口，不能替代 renderer sandbox、CSP、导航限制、IPC sender 检查或代码签名。

## 本地数据边界

- 书库 metadata 的读写上限为 16 MiB、10,000 本书和 1,000 个分组。持久化字段及字符串长度会在读取后和每次写入前校验；超限或结构错误的状态会在解析或替换现有文件前被拒绝，临时可用性字段不会持久化，进程内的读改写操作会串行执行，避免并发界面操作相互覆盖。读取时不会跟随符号链接，源文件可用性探测也使用有界并发。

CHMReaderLight 不会上传、同步或托管 CHM 内容。本地状态仅限于书库 metadata、已提取缓存文件、浏览器偏好和 macOS 最近打开文档。通俗版存储地图见 [中文隐私与本地数据](./privacy.zh-CN.md) 或 [Privacy and Local Data](./privacy.md)。

## 安全审查清单

修改 CHM 加载、阅读器导航、IPC、文件路径或打包流程时，请检查：

- decoded 和 nested resource paths 的 path traversal 仍被阻止。
- CHM-authored JavaScript 仍被阻止，除非它是应用注入的 nonce-protected navigation bridge。
- CHM 内容中的 forms、plugin objects、nested frames 和 network requests 仍被禁用。
- external `http` 和 `https` links 继续在阅读器外的默认浏览器中打开。
- 新 IPC handlers 会使用 trusted-sender wrapper、校验参数类型，并避免暴露任意文件系统访问。
- 搜索词长度限制、解包超时、解包目录预算和 markup 转换预算应在不受信任 renderer 之外持续生效，不能只依赖 renderer controls。
- 日志、诊断信息、截图和 issue templates 不要求私有文档内容或敏感本地路径。
- 打包的 native dependency 会保留对应源码、license、本地补丁和可验证 provenance；详情见 [Third-Party Notices](../THIRD_PARTY_NOTICES.md)。
- 生产 Electron fuse 配置保持显式，在最终签名前应用，并从每个 release bundle 中读回核验。

[OpenSSF Scorecard](https://scorecard.dev/view/github.com/zhongdiandaoda/chm-reader-light) workflow 会和 CI、CodeQL、dependency audit、Dependency Review、release artifact verification 一起跟踪仓库供应链状态。Scorecard 发现项应作为维护信号审阅，不能替代 CHM trust-boundary tests。

疑似漏洞请通过 [中文安全政策](../SECURITY.zh-CN.md) 或 [Security Policy](../SECURITY.md) 私下报告，不要在公开 issue 中发布利用细节。

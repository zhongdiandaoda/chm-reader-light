# Spec: 内置示例文档

## 状态

- 阶段：SPECIFY，等待人工评审
- 目标版本：首次公开 Release 之前
- 关联目标：降低首次试用门槛，让没有现成 `.chm` 文件的访客也能体验真实阅读链路
- 后续门禁：规格获批后才能编写技术计划和任务清单；计划、任务各自评审通过后才能实现

## 已采用的假设

1. 示例内容全部由本项目编写并随 MIT 项目分发，不引入第三方帮助文件、商标素材或不明许可证内容。
2. 示例以已解包的 HTML Help 目录随应用打包，不生成或伪装成一个 `.chm` 文件。
3. 示例只出现在整个书库为空且没有筛选条件的空状态；一旦用户已有书籍，常规书库界面不增加永久示例卡片。
4. 示例复用现有目录、正文、内部链接、正文搜索、历史前进后退和主题切换能力。
5. 打开示例不会新增书库记录、修改书库 JSON、加入 macOS“最近使用的项目”，也不会创建 CHM 解包缓存。
6. 第一版不增加运行时或开发依赖，不加入 CHM 编译工具，不改变普通 `.chm` 的导入和打开行为。
7. 示例使用稳定的逻辑来源标识（建议为 `builtin:sample`）供阅读器区分，不把应用包内路径暴露为用户文件路径。

若评审修改上述任一假设，应先更新本规格，再进入技术计划阶段。

## Objective

### 用户问题

当前访客可能同时遇到两个门槛：仓库尚无可下载的公开 Release，并且手边没有可用于试读的 `.chm` 文件。即使应用可以从源码运行，用户也无法立即判断目录导航、正文呈现、搜索和内部链接是否满足需要。

### 要构建的体验

为空书库增加一个无需网络、无需文件选择器的“打开示例文档”入口。点击后，应用通过主进程加载随包分发的项目自有示例资源，并把标准 `OpenedBook` 数据交给现有阅读器。用户看到的不是静态演示页，而是真实产品阅读链路。

### 目标用户

- 第一次从源码或安装包启动应用、尚无 CHM 文件的访客
- 在决定下载、收藏或推荐项目前，希望快速验证核心能力的评估者
- 需要确认应用安装和渲染链路正常的支持或测试人员

### 产品假设

一个可在单次点击后进入真实阅读器的离线示例，会减少“找不到试用文件”的退出点，并提高完成首次有效阅读的概率。该功能只消除试用障碍；Star 数增长仍取决于公开 Release、仓库元数据、传播和用户价值，不能仅凭本功能宣称达成。

## User Flow

1. 用户打开空书库。
2. 空状态同时显示“添加 CHM 文件”和“打开示例文档”，两者无需滚动即可看到。
3. 用户点击“打开示例文档”。
4. 按钮在请求期间禁用，并提供可感知的加载状态，防止重复打开。
5. 主进程验证并读取应用包内固定示例目录，不接受渲染进程传入的任意路径。
6. 应用切换到现有阅读器视图，默认打开示例首页。
7. 用户可展开多级目录、打开内部链接、前后切换主题并搜索示例正文。
8. 用户返回书库时，书库仍为空；示例不显示为普通书籍。
9. 用户之后仍可通过既有按钮、拖放或 `⌘O` 添加自己的 CHM。

## 示例内容要求

示例目录建议位于 `src/assets/sample-book/`，构建后由现有资源复制流程落到 `build/assets/sample-book/`。所有文本使用 UTF-8。

最小内容集：

- 一个 `.hhc` 目录文件，至少包含 2 层层级和 4 个可打开主题
- 一个首页，说明这是离线、项目自有的内置示例
- 一个“快速开始”主题，演示目录切换和上一篇/下一篇
- 一个“搜索示例”主题，包含唯一、稳定的测试关键词 `星光索引`
- 一个“隐私与安全”主题，说明打开用户 CHM 时的本地处理原则
- 至少一个主题间相对链接，用于验证内容页内部导航
- 至少一个项目自有的轻量本地图片或 SVG，用于验证 `chm://book/` 资源加载
- 页面内不得包含外部脚本、远程字体、追踪像素或网络请求

内容不应承诺尚未交付的功能，也不应把示例描述为真实 `.chm` 文件。

## Tech Stack

- Electron `43.2.0`
- TypeScript `^6.0.3`，CommonJS 主进程/预加载输出与浏览器端渲染输出
- Node.js `>=22`，内置 `node:test` 测试运行器
- 现有 CHM 元数据读取器 `readExtractedBook`
- 现有自定义只读协议 `chm://book/`
- 现有构建脚本 `scripts/build.js`，递归复制 `src/assets`

本功能不得新增依赖。

## Commands

在仓库根目录 `/Users/bytedance/projects/chm_reader` 执行：

```bash
# 环境诊断
npm run doctor

# 类型检查
npm run typecheck

# 构建（同时验证示例资源被复制）
npm run build

# 全量自动化测试
npm test

# 文档、元数据、资源、审计和构建完整检查
npm run check

# 本地启动并进行空书库手工验收
npm run run

# macOS 打包后验证资源仍可读取
npm run package:mac:arm64
```

针对性测试在实现阶段使用 Node 的测试名过滤，最终必须再运行未过滤的全量命令：

```bash
npm test -- --test-name-pattern="built-in sample|内置示例"
```

## Project Structure

现有与预期职责如下；最终文件拆分由获批后的技术计划确定。

```text
src/main.ts                       主进程：可信示例路径、阅读状态切换、IPC
src/preload.ts                    最小化暴露 openBuiltInSample() API
src/renderer.ts                   空状态交互、加载/错误状态、复用 applyBook()
src/index.html                    可访问的“打开示例文档”入口
src/styles.css                    与现有空状态一致的按钮和状态样式
src/assets/sample-book/           项目自有的已解包示例内容
test/chm.test.ts                  已解包目录解析和内容能力测试
test/ui.test.ts                   IPC、静态资源、UI 和副作用契约测试
docs/                             面向用户的双语试用路径和功能说明
CHANGELOG.md                      对用户可见的新增能力记录
tasks/built-in-sample-spec.md     本规格（需求事实来源）
tasks/built-in-sample-plan.md     规格获批后创建的独立技术计划
tasks/built-in-sample-todo.md     计划获批后创建的独立任务清单
```

不得覆盖现有 `tasks/plan.md` 和 `tasks/todo.md`；它们记录已完成的 TypeScript 迁移。

## Interface Contract

渲染进程只表达“打开内置示例”的意图，不传入文件系统路径：

```ts
interface ChmReaderApi {
  openBuiltInSample: () => Promise<OpenedBook | null>;
}

const openedBook = await window.chmReader.openBuiltInSample();
if (openedBook) applyBook(openedBook);
```

具体 IPC 通道名和是否由返回值或现有 `book:opened` 事件驱动，只在技术计划中确定；必须避免同一次点击导致 `applyBook` 执行两次。

`OpenedBook.filePath` 对示例使用稳定逻辑标识，而不是绝对文件路径：

```ts
const builtInSampleId = 'builtin:sample';

const openedBook: OpenedBook = {
  name: 'CHMReaderLight 示例指南',
  filePath: builtInSampleId,
  contents: metadata.contents,
  defaultPage: createBookUrl(metadata.defaultPage),
  searchablePageCount: metadata.searchIndex.length,
  textEncoding: null,
};
```

主进程应使用一个集中式状态切换函数设置 `bookRoot`、搜索索引、编码和当前来源，避免普通 CHM 与示例走两套易漂移的阅读状态逻辑。示例根目录是应用资源，不得在切换文档或退出应用时删除。

## Code Style

- 遵循现有 TypeScript：两个空格缩进、单引号、分号、显式 Promise 返回类型。
- IPC 名称使用 `domain:action` 格式；内置示例建议使用 `sample:open`。
- DOM id 使用 kebab-case；建议使用 `empty-open-sample`。
- 只在主进程解析受信任的固定资源目录；不向渲染进程暴露 `fs`、`path` 或资源绝对路径。
- 提取小而可测试的状态函数，不复制 `openBook` 的大段赋值逻辑。
- 用户可见错误使用中文并给出恢复动作；开发诊断保留原始错误上下文。

示例：

```ts
async function openBuiltInSample(): Promise<OpenedBook | null> {
  try {
    const root = getBuiltInSampleRoot();
    const metadata = await readExtractedBook(root, {
      textEncoding: null,
      buildSearchIndex: false,
    });
    return activateBookSource({
      id: 'builtin:sample',
      name: 'CHMReaderLight 示例指南',
      root,
      metadata,
      cleanupRoot: false,
    });
  } catch (error) {
    await showBuiltInSampleError(error);
    return null;
  }
}
```

函数名仅表达预期风格，不预先锁定最终实现。

## Testing Strategy

采用 RED → GREEN → REFACTOR 的纵向切片，每个行为先有失败测试，再做最小实现。

### 1. 内容和解析测试

- 直接用 `readExtractedBook` 读取仓库内示例目录。
- 断言目录至少两层、至少四个主题、默认页可用。
- 断言 `星光索引` 能进入正文搜索索引。
- 断言所有 `.hhc` 本地目标、HTML 相对链接和本地图片都存在。
- 断言示例文件不包含 `http://`、`https://`、远程脚本或追踪资源。

### 2. 主进程和 IPC 契约测试

- 断言只注册一个专用打开通道，且预加载层不接受路径参数。
- 断言示例使用固定逻辑标识和应用包内受信任根目录。
- 断言打开示例不调用 `app.addRecentDocument`、不调用书库导入/写入函数、不创建解包缓存。
- 断言切换到示例后 `chm://book/`、搜索索引构建和编码重载仍针对当前根目录。
- 断言从缓存 CHM 切换到示例、再切回用户 CHM 时，根目录清理规则不会删除应用资源或泄漏临时目录。
- 断言资源缺失或损坏时返回 `null`、显示可恢复错误，并保持书库可操作。

### 3. 渲染器和可访问性契约测试

- 断言入口只属于未筛选的空书库状态，并有明确按钮文本。
- 断言入口是原生 `button`，可通过 Tab 聚焦并用 Enter/Space 激活。
- 断言请求期间按钮禁用并暴露加载文案或 `aria-busy`，完成或失败后恢复。
- 断言成功后复用 `applyBook` 和现有阅读器视图，不创建独立演示渲染器。
- 断言失败不会留下空白阅读器或重复事件监听器。

### 4. 构建、打包和手工验收

- 构建后检查 `build/assets/sample-book/` 与源资源一致。
- 在开发启动和打包后的 `.app` 中各打开一次示例。
- 手工验证目录层级、默认页、相对链接、本地图片、正文搜索、前后历史、上一篇/下一篇和返回书库。
- 在干净用户数据目录中验证返回书库后仍为零本书，macOS 最近文档中没有示例。
- 用键盘完成入口聚焦、打开、目录浏览、搜索和返回书库。

不以静态正则测试代替所有行为测试；可提取的纯状态逻辑应由单元测试覆盖，Electron 集成边界由契约测试加手工验收覆盖。

## Boundaries

### Always do

- 示例内容使用项目自有文本和素材，并在版本库中可审计。
- 先写失败测试，再实现对应行为；每个切片后运行针对性测试。
- 合入前运行 `npm test`、`npm run check`、`npm run doctor` 和 `git diff --check`。
- 保持上下文隔离：渲染进程只能调用固定意图 API，主进程拥有资源路径和读取权限。
- 保持现有 CSP、路径穿越防护和 `chm://book/` 资源解析规则。
- 同时更新用户可见文档和 `CHANGELOG.md`，明确示例不是用户书库项目。
- 保留普通 CHM 导入、拖放、文件关联、最近打开排序、编码选择和缓存行为。

### Ask first

- 改变“添加 CHM”和“打开示例文档”的主次视觉层级。
- 决定是否在本地存储示例最后阅读位置。
- 在非空书库、菜单栏、欢迎弹窗或工具栏增加永久示例入口。
- 新增依赖、遥测、网络请求、外部内容或 CHM 编译工具。
- 改变 `OpenedBook` 公共形状，或把来源类型扩展为影响多个模块的联合类型。
- 修改 CI、签名、公证、发布流程或 GitHub 远端设置。

### Never do

- 捆绑来源或许可证不清晰的 `.chm`、HTML、字体、图片或商标素材。
- 将应用包内绝对路径显示给用户、写入书库或加入 macOS 最近文档。
- 允许渲染进程指定任意示例目录或读取任意文件。
- 为示例放宽 CSP、路径校验或外部链接限制。
- 静默联网、采集试用行为或把“打开示例”当作 Star 增长证明。
- 覆盖 `tasks/plan.md`、`tasks/todo.md`，删除失败测试，或改写与本功能无关的用户工作区变更。
- 未经明确授权执行提交、推送、发版或远端仓库配置变更。

## Success Criteria

功能只有同时满足以下条件才算完成：

1. 在没有公开 Release、没有用户 `.chm` 且书库为空的情况下，用户从源码启动应用后可在一次按钮点击内进入真实阅读器。
2. 示例入口在默认空状态首屏可见、文案明确、键盘可达，并在打开期间防止重复提交。
3. 示例至少包含 4 个主题、2 层目录、1 个相对内部链接和 1 个本地图片；这些资源全部离线加载。
4. 用户能通过目录和上一篇/下一篇浏览示例，通过正文搜索找到 `星光索引`，并使用阅读历史前进/后退。
5. 返回书库后仍为零本书；书库持久化数据、macOS 最近文档和 CHM 解包缓存均未加入示例。
6. 普通 CHM 的添加、打开、搜索、编码、缓存、最近文档和文件关联行为没有回归。
7. 缺失或损坏的示例资源产生可理解、可恢复的错误，不崩溃、不切换到空白阅读器。
8. `npm run typecheck`、`npm run build`、`npm test`、`npm run check`、`npm run doctor` 和 `git diff --check` 全部通过。
9. 开发构建和至少一个 macOS 打包产物均通过手工验收，确认示例资源确实随包分发。
10. README 中“60 秒试用”在功能交付后提供内置示例路径，同时保留无 Release 时的源码运行回退。

## Non-goals

- 生成、下载或分发真实 `.chm` 示例文件
- 在线内容市场、示例库或网络更新机制
- 在书库中把示例伪装成可删除、可移动的普通书籍
- 为示例增加编辑、注释、导出或打印能力
- 添加遥测、转化漏斗或 Star 自动化
- 在本功能中创建 GitHub Release 或修改仓库公开设置

## Open Questions for Review

1. **入口层级**：推荐保留“添加 CHM 文件”为主按钮，在旁边增加同等首屏可见的次按钮“打开示例文档”。是否应反过来让示例成为主按钮？
2. **阅读位置**：推荐允许使用逻辑键 `builtin:sample` 在现有 `localStorage` 中记忆最后主题，以展示真实阅读体验；这不会写书库、最近文档或解包缓存。是否要求每次都从首页开始？
3. **示例语言**：推荐第一版跟随当前中文界面，仅提供中文示例；未来界面国际化时再增加英文版本。是否需要第一版即内置中英双语主题？

## Review Checklist

- [ ] 目标、用户与产品假设正确
- [ ] 七项已采用假设可以接受
- [ ] 示例内容范围足以展示核心价值但不过度膨胀
- [ ] 测试策略覆盖资源、IPC、状态、副作用、可访问性和打包
- [ ] Always / Ask first / Never 边界正确
- [ ] 十项成功标准具体且可验证
- [ ] 三个开放问题已有明确选择
- [ ] 批准进入 PLAN 阶段

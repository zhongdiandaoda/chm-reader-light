# CHMReaderLight 中文安全政策

[English Security Policy](./SECURITY.md)

CHMReaderLight 会打开本地文档文件、提取 CHM archive，并通过受限制的 Electron 协议渲染解包后的页面。欢迎报告安全问题，尤其是文件边界检查、archive 提取、renderer 隔离或不安全内容执行相关问题。普通语言版的本地数据说明见 [Privacy and Local Data](./docs/privacy.md)，中文本地数据说明见 [中文隐私与本地数据](./docs/privacy.zh-CN.md)；实现层面的信任边界见 [中文安全模型](./docs/security-model.zh-CN.md) 或 [Security Model](./docs/security-model.md)。

## 支持版本

项目仍处于 1.0 之前。安全修复会在 `main` 分支处理，并进入下一个可用 release。

| Version | Supported |
| --- | --- |
| `main` | Yes |
| Earlier snapshots | No |

## 自动化检查

CodeQL 会在 pull request、推送到 `main` 和每周计划任务中运行。这些检查可以帮助提前发现 JavaScript 和 TypeScript 安全问题，但不能替代敏感问题的私密报告流程。

## 报告漏洞

请不要在公开 issue 中发布漏洞细节。

推荐方式：

- 优先使用本仓库的 GitHub private vulnerability reporting 或 draft security advisory 流程，如果该功能已启用。
- 如果私密报告不可用，可以打开一个最小公开 issue，只说明你有安全报告，不要包含 exploit 细节、私有 CHM 内容、敏感路径或可复现攻击载荷。

公开 issue 不要包含私有 CHM 内容、敏感路径或可复现攻击载荷。

有帮助的报告信息包括：

- macOS 版本和 Mac 架构
- CHM 语言、近似大小，以及是否可以分享脱敏样例
- 复现步骤
- 影响范围，例如 path traversal、script execution、unexpected external access、crash 或 data exposure
- 已移除私有内容的日志或截图

## 响应预期

- 新报告会在 7 天内确认，即使初次回复只是确认收到。
- 已确认的问题在调查或修复期间，每 14 天至少更新一次状态。
- 修复可用后，或已为用户记录缓解方式后，再协调公开披露。
- 已确认修复会在适当时记录到 `CHANGELOG.md` 和对应 GitHub Release notes。

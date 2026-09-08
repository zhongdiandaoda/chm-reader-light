# CHMReaderLight 中文治理指南

[English Governance Guide](./governance.md)

CHMReaderLight 使用轻量级项目治理，让贡献者可以预期 issue、pull request、路线图变更和发版决策会如何处理。目标是让应用保持聚焦、可信，并且易于持续改进，同时不引入沉重流程。

## 维护者职责

- @zhongdiandaoda 负责最终项目决策、仓库设置、release 发布和评审路由。
- 维护者在项目范围或公开协作流程变化时，应同步 [中文路线图](./roadmap.zh-CN.md)、Roadmap、Project Status、Support Guide、Community Standards Checklist 和 Maintainer Playbook。
- 对暂缓或拒绝的提案，维护者应尽量链接 [中文路线图](./roadmap.zh-CN.md)、Roadmap、Project Status、Security Model 或兼容性限制说明原因。
- 维护者应通过请求脱敏诊断信息、近似 CHM 细节和打码截图来保持公开讨论安全，而不是要求私有内容。

## 决策路径

- 使用 GitHub Issues 跟踪 bug、兼容性报告、功能请求、文档改进和范围清楚的新手任务。
- 使用 GitHub Discussions 处理开放式问题、工作流记录、发版反馈和展示后续，这些内容通常还不需要进入可跟踪的实现工作。
- 使用 pull request 提交已经符合 [中文路线图](./roadmap.zh-CN.md)、Roadmap、Project Status 和贡献指南的聚焦改动。
- 在可见度推广、release 跟进或周期性维护前，使用 Maintainer Playbook。
- 报告需要 labels、复现检查、重复问题路由或暂缓决策时，使用 Issue Triage Guide。

## 需要先讨论的变更

如果改动会改变产品承诺、release 信任说明或维护者评审负担，请先开 issue 或 discussion。此类变更包括云同步、托管文档存储、遥测、CHM 创作、广泛的跨平台打包、签名、公证或发行渠道变化。

当改动需要私有 CHM 样本、不可用硬件、大范围 UI 重新设计、安全敏感路径的新依赖，或可能影响现有用户的兼容性行为时，也请先讨论。

## 隐私和安全边界

不要要求贡献者或用户在公开 issue、Discussions 或 pull request 中附加私有 CHM 文件、专有截图、敏感本地路径或保密文档文本。

优先使用安全复现材料：

- 可以公开分享的公开样例 CHM 文件。
- 只用于演示导航、编码、搜索或渲染行为的小型合成 CHM 文件。
- 通过 **Help > Copy Diagnostic Info** 获取并脱敏后的诊断输出。
- 近似文件大小、语言、受影响区域和最小复现步骤。

漏洞问题请使用 Security Policy 或中文安全政策，不要公开发布利用细节。

## 评审预期

Pull request 应保持小范围、有测试支撑，并与 Roadmap 和 Project Status 保持一致。评审者会重点看：

- 是否改善了明确的用户或维护者工作流。
- 范围是否聚焦，并把无关清理留给独立改动。
- 测试或手动验证是否匹配本次改动。
- 当用户可见行为或仓库信任信号变化时，是否同步更新 README、docs、changelog、project status 或 release notes。
- 是否尊重本地优先的 CHM 处理方式、无遥测原则和安全公开报告边界。

如果提案有价值但范围过大，维护者应帮助拆成更小的 issue、roadmap note 或后续 discussion。

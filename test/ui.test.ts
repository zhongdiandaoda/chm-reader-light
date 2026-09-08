const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = process.cwd();
export { };

test('README presents a GitHub-friendly first screen', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const previewPath = path.join(projectRoot, 'docs', 'assets', 'app-preview.svg');
  const preview = fs.readFileSync(previewPath, 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[English\]\(\.\/README\.en\.md\)/);
  assert.match(readme, /^# CHMReaderLight — macOS CHM Reader$/m);
  assert.match(readme, /A lightweight offline CHM reader and library for macOS\. This open-source CHM file viewer supports Apple Silicon and Intel Macs\./);
  assert.match(readme, /\[!\[CI\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/actions\/workflows\/ci\.yml\/badge\.svg\)\]/);
  assert.match(readme, /\[!\[CodeQL\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/actions\/workflows\/codeql\.yml\/badge\.svg\)\]/);
  assert.match(readme, /\[!\[GitHub stars\]\(https:\/\/img\.shields\.io\/github\/stars\/zhongdiandaoda\/chm-reader-light\?style=social\)\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/stargazers\)/);
  assert.match(readme, /\[!\[GitHub downloads\]\(https:\/\/img\.shields\.io\/github\/downloads\/zhongdiandaoda\/chm-reader-light\/total\?label=downloads\)\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\)/);
  assert.match(readme, /\[!\[License: MIT\]\(https:\/\/img\.shields\.io\/badge\/license-MIT-green\.svg\)\]\(\.\/LICENSE\)/);
  assert.match(readme, /\[!\[Platform: macOS\]\(https:\/\/img\.shields\.io\/badge\/platform-macOS-111111\.svg\)\]\(#macos-打包\)/);
  assert.match(readme, /\[!\[Node\.js 22\+\]\(https:\/\/img\.shields\.io\/badge\/node-%3E%3D22-339933\.svg\)\]\(\.\/\.nvmrc\)/);
  assert.match(readme, /\[!\[GitHub release\]\(https:\/\/img\.shields\.io\/github\/v\/release\/zhongdiandaoda\/chm-reader-light\?display_name=tag&sort=semver\)\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\)/);
  assert.match(readme, /!\[CHMReaderLight macOS app preview\]\(\.\/docs\/assets\/app-preview\.svg\)/);
  const primaryCta = '**立即体验：** [查看 macOS 下载](https://github.com/zhongdiandaoda/chm-reader-light/releases) · [本地运行](#本地运行) · [60 秒试用](#60-秒试用路径) · [Star 项目](https://github.com/zhongdiandaoda/chm-reader-light)';
  assert.ok(readme.includes(primaryCta));
  assert.ok(readme.indexOf(primaryCta) < readme.indexOf('![CHMReaderLight macOS app preview]'));
  assert.ok(readme.indexOf(primaryCta) < readme.indexOf('## 快速导航'));
  assert.match(readme, /## 快速导航/);
  assert.match(readme, /\[下载与体验\]\(#下载与体验\)/);
  assert.match(readme, /\[60 秒试用路径\]\(#60-秒试用路径\)/);
  assert.match(readme, /<summary>更多文档与项目链接<\/summary>/);
  assert.ok(
    readme.indexOf('<summary>更多文档与项目链接</summary>') < readme.indexOf('[中文功能导览](./docs/feature-tour.zh-CN.md)'),
  );
  assert.match(readme, /\[Getting Started\]\(\.\/docs\/getting-started\.md\)/);
  assert.match(readme, /\[为什么选择 CHMReaderLight\]\(#为什么选择-chmreaderlight\)/);
  assert.match(readme, /\[功能\]\(#功能\)/);
  assert.match(readme, /\[本地运行\]\(#本地运行\)/);
  assert.match(readme, /\[macOS 打包\]\(#macos-打包\)/);
  assert.match(readme, /\[参与贡献\]\(#参与贡献\)/);
  assert.match(readme, /\[支持\]\(#支持\)/);
  assert.match(readme, /\[Roadmap\]\(\.\/docs\/roadmap\.md\)/);
  assert.match(readme, /## 适合场景/);
  assert.match(readme, /在 macOS 上集中管理离线 CHM 技术手册/);
  assert.match(readme, /需要离线查阅旧版 SDK、API 或产品文档/);
  assert.match(readme, /希望在打开未知 CHM 时默认禁用脚本和网络访问/);
  assert.match(readme, /## 为什么选择 CHMReaderLight/);
  assert.match(readme, /macOS 原生菜单、最近打开文档和 Finder 工作流/);
  assert.match(readme, /只保存本地路径和阅读偏好，不上传、不同步 CHM 内容/);
  assert.match(readme, /把兼容性、安装、隐私和发版流程都写进仓库文档/);
  assert.match(readme, /## 亮点/);
  assert.match(readme, /支持拖拽导入、多书库分组、书库搜索、目录搜索、阅读历史、正文缩放、Finder 定位和缺失源文件提示/);
  assert.match(readme, /## 60 秒试用路径/);
  assert.match(readme, /从 \[GitHub Releases\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\) 下载/);
  assert.match(readme, /如果 Releases 暂无可下载构件，请按\[本地运行\]\(#本地运行\)中的两条命令从源码启动/);
  assert.match(readme, /把一个或多个 `.chm` 文件拖进书库窗口/);
  assert.match(readme, /打开一本书，尝试目录搜索和正文搜索/);
  assert.match(readme, /\[中文隐私与本地数据\]\(\.\/docs\/privacy\.zh-CN\.md\)、\[Privacy and Local Data\]\(\.\/docs\/privacy\.md\)、\[中文安全模型\]\(\.\/docs\/security-model\.zh-CN\.md\) 和 \[Security Model\]\(\.\/docs\/security-model\.md\)/);
  assert.match(readme, /Help > Star on GitHub/);
  assert.match(readme, /Help > Watch Releases/);
  assert.match(readme, /Help > Copy Share Text/);
  assert.match(readme, /关注后续版本，或用 `Help > Copy Share Text` 复制可直接转发的中英双语项目摘要/);
  assert.match(readme, /\[MIT License\]\(\.\/LICENSE\)/);
  assert.match(readme, /\[CONTRIBUTING\.md\]\(\.\/CONTRIBUTING\.md\)/);
  assert.match(readme, /\[Code of Conduct\]\(\.\/CODE_OF_CONDUCT\.md\)/);
  assert.match(readme, /\[SECURITY\.md\]\(\.\/SECURITY\.md\)/);
  assert.match(readme, /\[CHANGELOG\.md\]\(\.\/CHANGELOG\.md\)/);
  assert.match(readme, /## 支持/);
  assert.match(readme, /已安装应用的用户可以从 `Help > Report or Request`/);
  assert.match(readme, /安装帮助、bug、兼容性、功能请求、性能、无障碍、文档、release feedback、安全政策和 showcase 反馈入口/);
  assert.match(readme, /如果只是 release 信任信息影响你是否继续试用、star、watch 或分享，可以直接使用 `Help > Release Feedback`/);
  assert.match(readme, /如果 CHMReaderLight 改善了你的离线 CHM 工作流/);
  assert.match(readme, /showcase issue template/);
  assert.match(readme, /\[GitHub Discussions\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\)/);
  assert.match(readme, /\[release feedback Discussion\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\/new\?category=release-feedback\)/);
  assert.match(readme, /开放式使用问题和经验分享/);
  assert.match(readme, /如果下载、checksum、notarization、截图、demo 或支持信息会影响你是否信任、star、watch 或分享某个版本/);
  assert.match(changelog, /README support section/);
  assert.match(changelog, /README support sections now mention the in-app Help > Report or Request routing/);
  assert.match(changelog, /README support sections now mention direct Help > Release Feedback routing/);
  assert.match(changelog, /README support sections to point happy users toward the showcase issue template/);
  assert.match(changelog, /README support sections to point open-ended community posts to GitHub Discussions/);
  assert.match(changelog, /README badges for CI, license, macOS support, Node.js, and releases/);
  assert.match(changelog, /README CodeQL badge/);
  assert.match(changelog, /README GitHub stars badge/);
  assert.match(changelog, /README GitHub downloads badge/);
  assert.match(changelog, /README quick navigation section/);
  assert.match(changelog, /README 60-second trial paths for quicker GitHub evaluation/);
  assert.match(changelog, /README trial paths now mention Help > Watch Releases/);
  assert.match(changelog, /README use-case section/);
  assert.match(changelog, /README why-choose section/);
  assert.match(changelog, /getting started guide/);
  assert.match(preview, /<title id="title">CHMReaderLight macOS app preview<\/title>/);
  assert.match(preview, /<svg[^>]+viewBox="0 0 1280 760"/);
});

test('quality gate keeps README badges discoverable', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-readme-badges.js'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.equal(packageJson.scripts['check:badges'], 'node scripts/check-readme-badges.js');
  assert.match(packageJson.scripts.check, /npm run check:badges/);
  assert.match(readme, /`npm run check:badges`/);
  assert.match(englishReadme, /README badge coverage/);
  assert.match(contributing, /`npm run check:badges` keeps README badges for CI, CodeQL, OpenSSF Scorecard, stars, downloads, license, platform, Node.js, and latest release visible/);
  assert.match(testingGuide, /validates README badge coverage for CI, CodeQL, OpenSSF Scorecard, stars, downloads, license, platform, Node.js, and latest release/);
  assert.match(testingGuide, /`npm run check:badges` after changing README badges, workflow names, repository URLs, license text, platform support, Node.js versions, or release links/);
  assert.match(communityStandards, /`npm run check:badges`/);
  assert.match(checker, /Checks README badge coverage/);
  assert.match(checker, /GitHub stars/);
  assert.match(checker, /OpenSSF Scorecard/);
  assert.match(checker, /README badge check passed/);
  assert.match(changelog, /README badge coverage checker for repository trust signals/);
  assert.match(changelog, /README first screens now expose direct download and star actions before long-form navigation/);
  assert.match(changelog, /README titles and opening summaries now state the macOS CHM reader positioning in searchable English/);
  assert.match(changelog, /README quick links now keep the primary evaluation path visible while collapsing the full documentation directory/);
});

test('English README gives international visitors a quick evaluation path', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[English\]\(\.\/README\.en\.md\)/);
  assert.match(englishReadme, /\[中文\]\(\.\/README\.md\)/);
  assert.match(englishReadme, /\[!\[CodeQL\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/actions\/workflows\/codeql\.yml\/badge\.svg\)\]/);
  assert.match(englishReadme, /\[!\[GitHub stars\]\(https:\/\/img\.shields\.io\/github\/stars\/zhongdiandaoda\/chm-reader-light\?style=social\)\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/stargazers\)/);
  assert.match(englishReadme, /\[!\[GitHub downloads\]\(https:\/\/img\.shields\.io\/github\/downloads\/zhongdiandaoda\/chm-reader-light\/total\?label=downloads\)\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\)/);
  assert.match(englishReadme, /^# CHMReaderLight — macOS CHM Reader$/m);
  assert.match(englishReadme, /A lightweight offline CHM reader and library for macOS\. This open-source CHM file viewer supports Apple Silicon and Intel Macs\./);
  assert.match(englishReadme, /A lightweight offline CHM reader and library for macOS/);
  assert.match(englishReadme, /!\[CHMReaderLight macOS app preview\]\(\.\/docs\/assets\/app-preview\.svg\)/);
  const primaryCta = '**Try it now:** [View macOS downloads](https://github.com/zhongdiandaoda/chm-reader-light/releases) · [Run locally](#development) · [60-second trial](#try-it-in-60-seconds) · [Star the project](https://github.com/zhongdiandaoda/chm-reader-light)';
  assert.ok(englishReadme.includes(primaryCta));
  assert.ok(englishReadme.indexOf(primaryCta) < englishReadme.indexOf('![CHMReaderLight macOS app preview]'));
  assert.ok(englishReadme.indexOf(primaryCta) < englishReadme.indexOf('## Quick Links'));
  assert.match(englishReadme, /## Quick Links/);
  assert.match(englishReadme, /\[Download\]\(#download\)/);
  assert.match(englishReadme, /\[Try It in 60 Seconds\]\(#try-it-in-60-seconds\)/);
  assert.match(englishReadme, /<summary>More documentation and project links<\/summary>/);
  assert.ok(
    englishReadme.indexOf('<summary>More documentation and project links</summary>') < englishReadme.indexOf('[Feature Tour](./docs/feature-tour.md)'),
  );
  assert.match(englishReadme, /\[Use Cases\]\(#use-cases\)/);
  assert.match(englishReadme, /\[Getting Started\]\(\.\/docs\/getting-started\.md\)/);
  assert.match(englishReadme, /\[Feature Tour\]\(\.\/docs\/feature-tour\.md\)/);
  assert.match(englishReadme, /\[macOS Install Guide\]\(\.\/docs\/install-macos\.md\)/);
  assert.match(englishReadme, /\[Roadmap\]\(\.\/docs\/roadmap\.md\)/);
  assert.match(englishReadme, /## Why CHMReaderLight/);
  assert.match(englishReadme, /macOS-native library workflow/);
  assert.match(englishReadme, /local-only reading/);
  assert.match(englishReadme, /## Download/);
  assert.match(englishReadme, /\[GitHub Releases\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\)/);
  assert.match(englishReadme, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(englishReadme, /CHMReaderLight-mac-x64\.zip/);
  assert.match(englishReadme, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-arm64\.zip/);
  assert.match(englishReadme, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-x64\.zip/);
  assert.match(englishReadme, /shasum -a 256 -c CHMReaderLight-mac-arm64\.zip\.sha256/);
  assert.match(englishReadme, /shasum -a 256 -c CHMReaderLight-mac-x64\.zip\.sha256/);
  assert.match(englishReadme, /gh attestation verify CHMReaderLight-mac-arm64\.zip --repo zhongdiandaoda\/chm-reader-light/);
  assert.match(englishReadme, /gh attestation verify CHMReaderLight-mac-x64\.zip --repo zhongdiandaoda\/chm-reader-light/);
  assert.match(englishReadme, /not Apple-notarized yet/);
  assert.match(englishReadme, /## Try It in 60 Seconds/);
  assert.match(englishReadme, /If Releases has no downloadable build yet, use the two commands in \[Development\]\(#development\) to run from source/);
  assert.match(englishReadme, /Download the latest build from \[GitHub Releases\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\)/);
  assert.match(englishReadme, /Drag one or more `.chm` files into the library window/);
  assert.match(englishReadme, /Open a book, then try table-of-contents search and body search/);
  assert.match(englishReadme, /Check \[Privacy and Local Data\]\(\.\/docs\/privacy\.md\), \[Chinese Privacy and Local Data\]\(\.\/docs\/privacy\.zh-CN\.md\), \[Security Model\]\(\.\/docs\/security-model\.md\), and \[Chinese Security Model\]\(\.\/docs\/security-model\.zh-CN\.md\)/);
  assert.match(englishReadme, /Help > Star on GitHub/);
  assert.match(englishReadme, /Help > Watch Releases/);
  assert.match(englishReadme, /Help > Copy Share Text/);
  assert.match(englishReadme, /use `Help > Watch Releases` to follow future updates, or use `Help > Copy Share Text` to copy a ready-made bilingual project summary/);
  assert.match(englishReadme, /## Use Cases/);
  assert.match(englishReadme, /Managing local CHM technical manuals on macOS/);
  assert.match(englishReadme, /Reading legacy SDK, API, or product documentation offline/);
  assert.match(englishReadme, /Opening unknown CHM files with CHM-authored scripts and network access disabled/);
  assert.match(englishReadme, /## Features/);
  assert.match(englishReadme, /drag-and-drop import/);
  assert.match(englishReadme, /searchable table of contents/);
  assert.match(englishReadme, /## Development/);
  assert.match(englishReadme, /npm install/);
  assert.match(englishReadme, /npm run run/);
  assert.match(englishReadme, /npm test/);
  assert.match(englishReadme, /npm run check/);
  assert.match(englishReadme, /## Support and Contributing/);
  assert.match(englishReadme, /\[SUPPORT\.md\]\(\.\/SUPPORT\.md\)/);
  assert.match(englishReadme, /Installed app users can start from `Help > Report or Request`/);
  assert.match(englishReadme, /install help, bug, compatibility, feature request, performance, accessibility, documentation, release feedback, security-policy, and showcase routes/);
  assert.match(englishReadme, /If release trust details are the only thing blocking a trial, star, watch, or share, use `Help > Release Feedback` directly/);
  assert.match(englishReadme, /If CHMReaderLight improves your offline CHM workflow/);
  assert.match(englishReadme, /showcase issue template/);
  assert.match(englishReadme, /\[GitHub Discussions\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\)/);
  assert.match(englishReadme, /\[release-feedback Discussion\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\/new\?category=release-feedback\)/);
  assert.match(englishReadme, /open-ended questions and workflow notes/);
  assert.match(englishReadme, /when download, checksum, notarization, screenshot, demo, or support details would make a release easier to trust, star, watch, or share/);
  assert.match(englishReadme, /\[CONTRIBUTING\.md\]\(\.\/CONTRIBUTING\.md\)/);
  assert.match(englishReadme, /\[Good First Contributions\]\(\.\/docs\/good-first-contributions\.md\)/);
  assert.match(englishReadme, /\[good first issue\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\?q=is%3Aissue\+is%3Aopen\+label%3A%22good\+first\+issue%22\)/);
  assert.match(englishReadme, /\[help wanted\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\?q=is%3Aissue\+is%3Aopen\+label%3A%22help\+wanted%22\)/);
  assert.match(englishReadme, /\[MIT License\]\(\.\/LICENSE\)/);
  assert.match(changelog, /English README overview for international GitHub visitors/);
  assert.match(changelog, /English README link to the good first contributions guide/);
  assert.match(changelog, /direct starter issue search links to the English README contribution section/);
  assert.match(changelog, /README support sections to point happy users toward the showcase issue template/);
  assert.match(changelog, /README support sections to point open-ended community posts to GitHub Discussions/);
  assert.match(changelog, /README GitHub downloads badge/);
  assert.match(changelog, /English README download verification commands/);
  assert.match(changelog, /README 60-second trial paths for quicker GitHub evaluation/);
  assert.match(changelog, /English README use cases for faster international visitor self-qualification/);
});

test('getting started guide gives first-time users a short path to success', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const chineseSupport = fs.readFileSync(path.join(projectRoot, 'SUPPORT.zh-CN.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const guide = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.md'), 'utf-8');
  const chineseGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.zh-CN.md'), 'utf-8');

  assert.match(readme, /\[Getting Started\]\(\.\/docs\/getting-started\.md\)/);
  assert.match(readme, /\[中文入门指南\]\(\.\/docs\/getting-started\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Chinese Getting Started\]\(\.\/docs\/getting-started\.zh-CN\.md\)/);
  assert.match(support, /\[Getting Started\]\(\.\/docs\/getting-started\.md\)/);
  assert.match(chineseSupport, /\[中文入门指南\]\(\.\/docs\/getting-started\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Chinese Getting Started\]\(\.\/getting-started\.zh-CN\.md\)/);
  assert.match(changelog, /getting started guide/);
  assert.match(changelog, /Chinese getting started guide for localized first-run onboarding/);
  assert.match(guide, /# Getting Started/);
  assert.match(guide, /## 1\. Install the App/);
  assert.match(guide, /## 2\. Add Your First CHM/);
  assert.match(guide, /File > Add CHM to Library/);
  assert.match(guide, /drag one or more `.chm` files into the library window/);
  assert.match(guide, /## 3\. Read and Navigate/);
  assert.match(guide, /Command\+F/);
  assert.match(guide, /## 4\. Keep Your Library Tidy/);
  assert.match(guide, /Help > Privacy and Local Data/);
  assert.match(guide, /Help > Compatibility Notes/);
  assert.match(guide, /Help > Report or Request/);
  assert.match(guide, /choose the right issue-template, release-feedback, security-policy, or showcase route/);
  assert.match(guide, /Help > Copy Diagnostic Info/);
  assert.match(chineseGuide, /# CHMReaderLight 中文入门指南/);
  assert.match(chineseGuide, /\[English Getting Started\]\(\.\/getting-started\.md\)/);
  assert.match(chineseGuide, /## 1\. 安装应用/);
  assert.match(chineseGuide, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(chineseGuide, /CHMReaderLight-mac-x64\.zip/);
  assert.match(chineseGuide, /\[中文 macOS 安装指南\]\(\.\/install-macos\.zh-CN\.md\)/);
  assert.match(chineseGuide, /## 2\. 添加第一本 CHM/);
  assert.match(chineseGuide, /File > Add CHM to Library/);
  assert.match(chineseGuide, /拖拽一个或多个 `.chm` 文件到书库窗口/);
  assert.match(chineseGuide, /## 3\. 阅读和导航/);
  assert.match(chineseGuide, /Command\+F/);
  assert.match(chineseGuide, /\[中文搜索指南\]\(\.\/search\.zh-CN\.md\)/);
  assert.match(chineseGuide, /缩放、文本编码、当前书库、书库布局、侧栏宽度、侧栏显示状态、搜索范围和每本 CHM 的上次阅读章节/);
  assert.match(chineseGuide, /## 4\. 保持书库整洁/);
  assert.match(chineseGuide, /重新定位/);
  assert.match(chineseGuide, /\[中文隐私与本地数据\]\(\.\/privacy\.zh-CN\.md\)/);
  assert.match(chineseGuide, /\[中文故障排查\]\(\.\/troubleshooting\.zh-CN\.md\)/);
  assert.match(chineseGuide, /Help > Report or Request/);
  assert.match(chineseGuide, /选择合适的 issue template、release feedback、安全政策或 showcase 路径/);
  assert.match(chineseGuide, /Help > Copy Diagnostic Info/);
  assert.match(changelog, /getting started guides now point first-run users to Help > Report or Request/);
});

test('use cases guide helps GitHub visitors self-qualify before installing', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const featureTour = fs.readFileSync(path.join(projectRoot, 'docs', 'feature-tour.md'), 'utf-8');
  const chineseFeatureTour = fs.readFileSync(path.join(projectRoot, 'docs', 'feature-tour.zh-CN.md'), 'utf-8');
  const useCases = fs.readFileSync(path.join(projectRoot, 'docs', 'use-cases.md'), 'utf-8');
  const chineseUseCases = fs.readFileSync(path.join(projectRoot, 'docs', 'use-cases.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[Use Cases\]\(\.\/docs\/use-cases\.md\)/);
  assert.match(readme, /\[中文适用场景\]\(\.\/docs\/use-cases\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Use Cases\]\(\.\/docs\/use-cases\.md\)/);
  assert.match(englishReadme, /\[Chinese Use Cases\]\(\.\/docs\/use-cases\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Use Cases\]\(\.\/use-cases\.md\)/);
  assert.match(docsIndex, /\[Chinese Use Cases\]\(\.\/use-cases\.zh-CN\.md\)/);
  assert.match(featureTour, /\[Use Cases\]\(\.\/use-cases\.md\)/);
  assert.match(chineseFeatureTour, /\[中文适用场景\]\(\.\/use-cases\.zh-CN\.md\)/);
  assert.match(useCases, /# Use Cases/);
  assert.match(useCases, /legacy SDK manuals/);
  assert.match(useCases, /vendor help files/);
  assert.match(useCases, /Microsoft HTML Help archives/);
  assert.match(useCases, /offline API reference/);
  assert.match(useCases, /privacy-sensitive documentation collections/);
  assert.match(useCases, /## Best-Fit Workflows/);
  assert.match(useCases, /## Not a Fit/);
  assert.match(useCases, /## Evaluation Path/);
  assert.match(useCases, /\[Adoption Checklist\]\(\.\/adoption-checklist\.md\)/);
  assert.match(useCases, /\[GitHub Releases\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\)/);
  assert.match(useCases, /Help > Star on GitHub/);
  assert.match(changelog, /use cases guide for faster GitHub visitor self-qualification/);
  assert.match(changelog, /Chinese use cases guide for localized workflow self-qualification/);
  assert.match(chineseUseCases, /# CHMReaderLight 中文适用场景/);
  assert.match(chineseUseCases, /\[English Use Cases\]\(\.\/use-cases\.md\)/);
  assert.match(chineseUseCases, /legacy SDK manuals/);
  assert.match(chineseUseCases, /vendor help files/);
  assert.match(chineseUseCases, /Microsoft HTML Help archives/);
  assert.match(chineseUseCases, /offline API reference/);
  assert.match(chineseUseCases, /privacy-sensitive documentation collections/);
  assert.match(chineseUseCases, /## 最适合的工作流/);
  assert.match(chineseUseCases, /## 不适合的场景/);
  assert.match(chineseUseCases, /## 评估路径/);
  assert.match(chineseUseCases, /\[中文入门指南\]\(\.\/getting-started\.zh-CN\.md\)/);
  assert.match(chineseUseCases, /\[中文采用检查清单\]\(\.\/adoption-checklist\.zh-CN\.md\)/);
  assert.match(chineseUseCases, /\[中文隐私与本地数据\]\(\.\/privacy\.zh-CN\.md\)/);
  assert.match(chineseUseCases, /\[GitHub Releases\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\)/);
  assert.match(chineseUseCases, /Help > Star on GitHub/);
});

test('comparison guide helps visitors understand CHMReaderLight tradeoffs', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const useCases = fs.readFileSync(path.join(projectRoot, 'docs', 'use-cases.md'), 'utf-8');
  const chineseUseCases = fs.readFileSync(path.join(projectRoot, 'docs', 'use-cases.zh-CN.md'), 'utf-8');
  const comparison = fs.readFileSync(path.join(projectRoot, 'docs', 'comparison.md'), 'utf-8');
  const chineseComparison = fs.readFileSync(path.join(projectRoot, 'docs', 'comparison.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[Comparison\]\(\.\/docs\/comparison\.md\)/);
  assert.match(readme, /\[中文对比指南\]\(\.\/docs\/comparison\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Comparison\]\(\.\/docs\/comparison\.md\)/);
  assert.match(englishReadme, /\[Chinese Comparison\]\(\.\/docs\/comparison\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Comparison\]\(\.\/comparison\.md\)/);
  assert.match(docsIndex, /\[Chinese Comparison\]\(\.\/comparison\.zh-CN\.md\)/);
  assert.match(useCases, /\[Comparison\]\(\.\/comparison\.md\)/);
  assert.match(chineseUseCases, /\[中文对比指南\]\(\.\/comparison\.zh-CN\.md\)/);
  assert.match(comparison, /# Comparison/);
  assert.match(comparison, /Windows HTML Help/);
  assert.match(comparison, /browser-based extracted HTML/);
  assert.match(comparison, /general document managers/);
  assert.match(comparison, /## Choose CHMReaderLight When/);
  assert.match(comparison, /## Choose Another Tool When/);
  assert.match(comparison, /local-only macOS CHM reader/);
  assert.match(comparison, /searchable table of contents/);
  assert.match(comparison, /does not upload, sync, or host CHM content/);
  assert.match(comparison, /not a CHM authoring tool/);
  assert.match(comparison, /\[Use Cases\]\(\.\/use-cases\.md\)/);
  assert.match(changelog, /comparison guide for visitors evaluating CHMReaderLight tradeoffs/);
  assert.match(changelog, /Chinese comparison guide for localized CHM reader tradeoff evaluation/);
  assert.match(chineseComparison, /# CHMReaderLight 中文对比指南/);
  assert.match(chineseComparison, /\[English Comparison\]\(\.\/comparison\.md\)/);
  assert.match(chineseComparison, /Windows HTML Help/);
  assert.match(chineseComparison, /browser-based extracted HTML/);
  assert.match(chineseComparison, /general document managers/);
  assert.match(chineseComparison, /## 适合选择 CHMReaderLight 的情况/);
  assert.match(chineseComparison, /local-only macOS CHM reader/);
  assert.match(chineseComparison, /可搜索目录/);
  assert.match(chineseComparison, /不会上传、同步或托管 CHM 内容/);
  assert.match(chineseComparison, /## 更适合选择其他工具的情况/);
  assert.match(chineseComparison, /not a CHM authoring tool/);
  assert.match(chineseComparison, /## 相关指南/);
  assert.match(chineseComparison, /\[中文适用场景\]\(\.\/use-cases\.zh-CN\.md\)/);
  assert.match(chineseComparison, /\[中文隐私与本地数据\]\(\.\/privacy\.zh-CN\.md\)/);
});

test('feature tour helps evaluators scan the app workflow', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const gettingStarted = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.md'), 'utf-8');
  const chineseGettingStarted = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.zh-CN.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const featureTour = fs.readFileSync(path.join(projectRoot, 'docs', 'feature-tour.md'), 'utf-8');
  const chineseFeatureTour = fs.readFileSync(path.join(projectRoot, 'docs', 'feature-tour.zh-CN.md'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[Feature Tour\]\(\.\/docs\/feature-tour\.md\)/);
  assert.match(readme, /\[中文功能导览\]\(\.\/docs\/feature-tour\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Chinese Feature Tour\]\(\.\/docs\/feature-tour\.zh-CN\.md\)/);
  assert.match(gettingStarted, /\[Feature Tour\]\(\.\/feature-tour\.md\)/);
  assert.match(chineseGettingStarted, /\[中文功能导览\]\(\.\/feature-tour\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Chinese Feature Tour\]\(\.\/feature-tour\.zh-CN\.md\)/);
  assert.match(featureTour, /# Feature Tour/);
  assert.match(featureTour, /## Library First/);
  assert.match(featureTour, /drag-and-drop import/);
  assert.match(featureTour, /## Reader Workflow/);
  assert.match(featureTour, /searchable table of contents/);
  assert.match(featureTour, /## Trust and Local Data/);
  assert.match(featureTour, /No telemetry, accounts, cloud sync, or hosted document storage/);
  assert.match(featureTour, /## When Something Looks Wrong/);
  assert.match(featureTour, /Help > Copy Diagnostic Info/);
  assert.match(main, /featureTour: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/feature-tour\.md'/);
  assert.match(main, /label: 'Feature Tour'/);
  assert.match(main, /shell\.openExternal\(projectLinks\.featureTour\)/);
  assert.match(changelog, /feature tour for evaluating the library, reader, local-data, and support workflows/);
  assert.match(changelog, /Chinese feature tour for localized library and reader workflow evaluation/);
  assert.match(chineseFeatureTour, /# CHMReaderLight 中文功能导览/);
  assert.match(chineseFeatureTour, /\[English Feature Tour\]\(\.\/feature-tour\.md\)/);
  assert.match(chineseFeatureTour, /## 书库优先/);
  assert.match(chineseFeatureTour, /拖拽导入/);
  assert.match(chineseFeatureTour, /当前选中的书库分组/);
  assert.match(chineseFeatureTour, /## 阅读器工作流/);
  assert.match(chineseFeatureTour, /可搜索目录/);
  assert.match(chineseFeatureTour, /Command\+F/);
  assert.match(chineseFeatureTour, /## 信任和本地数据/);
  assert.match(chineseFeatureTour, /不会包含 telemetry、账号、cloud sync 或托管文档存储/);
  assert.match(chineseFeatureTour, /\[中文隐私与本地数据\]\(\.\/privacy\.zh-CN\.md\)/);
  assert.match(chineseFeatureTour, /## 出现异常时/);
  assert.match(chineseFeatureTour, /\[中文故障排查\]\(\.\/troubleshooting\.zh-CN\.md\)/);
  assert.match(chineseFeatureTour, /Help > Copy Diagnostic Info/);
});

test('demo guide gives maintainers a shareable product story', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const featureTour = fs.readFileSync(path.join(projectRoot, 'docs', 'feature-tour.md'), 'utf-8');
  const chineseFeatureTour = fs.readFileSync(path.join(projectRoot, 'docs', 'feature-tour.zh-CN.md'), 'utf-8');
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');
  const demoGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'demo-guide.md'), 'utf-8');
  const chineseDemoGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'demo-guide.zh-CN.md'), 'utf-8');
  const chineseSampleGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'sample-chm-guide.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[Demo Guide\]\(\.\/docs\/demo-guide\.md\)/);
  assert.match(readme, /\[中文演示指南\]\(\.\/docs\/demo-guide\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Demo Guide\]\(\.\/docs\/demo-guide\.md\)/);
  assert.match(englishReadme, /\[Chinese Demo Guide\]\(\.\/docs\/demo-guide\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Demo Guide\]\(\.\/demo-guide\.md\)/);
  assert.match(docsIndex, /\[Chinese Demo Guide\]\(\.\/demo-guide\.zh-CN\.md\)/);
  assert.match(featureTour, /\[Demo Guide\]\(\.\/demo-guide\.md\)/);
  assert.match(chineseFeatureTour, /\[中文演示指南\]\(\.\/demo-guide\.zh-CN\.md\)/);
  assert.match(releaseDoc, /\[Demo Guide\]\(\.\/demo-guide\.md\)/);
  assert.match(demoGuide, /# Demo Guide/);
  assert.match(demoGuide, /\[Share Kit\]\(\.\/share-kit\.md\)/);
  assert.match(demoGuide, /## 60-Second Flow/);
  assert.match(demoGuide, /Start in the library view/);
  assert.match(demoGuide, /Drag one or more `.chm` files/);
  assert.match(demoGuide, /Open a book and filter the searchable table of contents/);
  assert.match(demoGuide, /Run a body search/);
  assert.match(demoGuide, /Use \*\*Help > Star on GitHub\*\*/);
  assert.match(demoGuide, /## Capture Checklist/);
  assert.match(demoGuide, /Do not show private document content/);
  assert.match(chineseDemoGuide, /# CHMReaderLight 中文演示指南/);
  assert.match(chineseDemoGuide, /\[English Demo Guide\]\(\.\/demo-guide\.md\)/);
  assert.match(chineseDemoGuide, /## 60 秒流程/);
  assert.match(chineseDemoGuide, /从书库视图开始/);
  assert.match(chineseDemoGuide, /拖拽一个或多个 `.chm` 文件/);
  assert.match(chineseDemoGuide, /过滤可搜索目录/);
  assert.match(chineseDemoGuide, /执行正文搜索/);
  assert.match(chineseDemoGuide, /使用 \*\*Help > Star on GitHub\*\*/);
  assert.match(chineseDemoGuide, /## 录制检查清单/);
  assert.match(chineseDemoGuide, /不要展示私有文档内容/);
  assert.match(chineseSampleGuide, /\[中文演示指南\]\(\.\/demo-guide\.zh-CN\.md\)/);
  assert.match(changelog, /demo guide for recording a short library-to-reader product walkthrough/);
  assert.match(changelog, /demo guide now points maintainers to the Share Kit before publishing walkthrough copy/);
  assert.match(changelog, /Chinese demo guide for localized shareable product walkthroughs/);
});

test('sample CHM guide helps evaluators and contributors use safe demo material', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const demoGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'demo-guide.md'), 'utf-8');
  const compatibility = fs.readFileSync(path.join(projectRoot, 'docs', 'compatibility.md'), 'utf-8');
  const chineseCompatibility = fs.readFileSync(path.join(projectRoot, 'docs', 'compatibility.zh-CN.md'), 'utf-8');
  const goodFirst = fs.readFileSync(path.join(projectRoot, 'docs', 'good-first-contributions.md'), 'utf-8');
  const sampleGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'sample-chm-guide.md'), 'utf-8');
  const chineseSampleGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'sample-chm-guide.zh-CN.md'), 'utf-8');
  const chineseSupport = fs.readFileSync(path.join(projectRoot, 'SUPPORT.zh-CN.md'), 'utf-8');
  const chineseContributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[Sample CHM Guide\]\(\.\/docs\/sample-chm-guide\.md\)/);
  assert.match(readme, /\[中文 CHM 样本指南\]\(\.\/docs\/sample-chm-guide\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Sample CHM Guide\]\(\.\/docs\/sample-chm-guide\.md\)/);
  assert.match(englishReadme, /\[Chinese Sample CHM Guide\]\(\.\/docs\/sample-chm-guide\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Sample CHM Guide\]\(\.\/sample-chm-guide\.md\)/);
  assert.match(docsIndex, /\[Chinese Sample CHM Guide\]\(\.\/sample-chm-guide\.zh-CN\.md\)/);
  assert.match(demoGuide, /\[Sample CHM Guide\]\(\.\/sample-chm-guide\.md\)/);
  assert.match(compatibility, /\[Sample CHM Guide\]\(\.\/sample-chm-guide\.md\)/);
  assert.match(chineseCompatibility, /\[中文 CHM 样本指南\]\(\.\/sample-chm-guide\.zh-CN\.md\)/);
  assert.match(goodFirst, /\[Sample CHM Guide\]\(\.\/sample-chm-guide\.md\)/);
  assert.match(chineseSupport, /\[中文 CHM 样本指南\]\(\.\/docs\/sample-chm-guide\.zh-CN\.md\)/);
  assert.match(chineseContributing, /\[中文 CHM 样本指南\]\(\.\/docs\/sample-chm-guide\.zh-CN\.md\)/);
  assert.match(sampleGuide, /# Sample CHM Guide/);
  assert.match(sampleGuide, /## Use Public or Synthetic Samples/);
  assert.match(sampleGuide, /public sample CHM/);
  assert.match(sampleGuide, /synthetic CHM/);
  assert.match(sampleGuide, /Do not commit private CHM files/);
  assert.match(sampleGuide, /## Good Demo Material/);
  assert.match(sampleGuide, /table of contents/);
  assert.match(sampleGuide, /body search/);
  assert.match(sampleGuide, /images or internal links/);
  assert.match(sampleGuide, /## Sharing Safely/);
  assert.match(sampleGuide, /redact local paths/);
  assert.match(sampleGuide, /avoid screenshots with proprietary content/);
  assert.match(sampleGuide, /## Useful For/);
  assert.match(sampleGuide, /Demo Guide/);
  assert.match(sampleGuide, /compatibility report/);
  assert.match(chineseSampleGuide, /# CHMReaderLight 中文 CHM 样本指南/);
  assert.match(chineseSampleGuide, /\[English Sample CHM Guide\]\(\.\/sample-chm-guide\.md\)/);
  assert.match(chineseSampleGuide, /## 使用公开或合成样本/);
  assert.match(chineseSampleGuide, /公开样本 CHM/);
  assert.match(chineseSampleGuide, /合成 CHM/);
  assert.match(chineseSampleGuide, /不要提交私有 CHM 文件/);
  assert.match(chineseSampleGuide, /## 好的演示材料/);
  assert.match(chineseSampleGuide, /嵌套目录/);
  assert.match(chineseSampleGuide, /正文搜索/);
  assert.match(chineseSampleGuide, /图片或内部链接/);
  assert.match(chineseSampleGuide, /## 安全分享/);
  assert.match(chineseSampleGuide, /移除本地路径/);
  assert.match(chineseSampleGuide, /避免包含专有内容的截图/);
  assert.match(chineseSampleGuide, /## 适用场景/);
  assert.match(chineseSampleGuide, /中文兼容性说明/);
  assert.match(changelog, /sample CHM guide for safe demos and compatibility reports/);
  assert.match(changelog, /Chinese sample CHM guide for localized safe demo and compatibility sample sharing/);
});

test('share kit gives maintainers reusable launch copy', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');
  const chineseDemoGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'demo-guide.zh-CN.md'), 'utf-8');
  const shareKit = fs.readFileSync(path.join(projectRoot, 'docs', 'share-kit.md'), 'utf-8');
  const chineseShareKit = fs.readFileSync(path.join(projectRoot, 'docs', 'share-kit.zh-CN.md'), 'utf-8');
  const sharePostScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'prepare-share-post.js'), 'utf-8');
  const promotionFollowUpScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'prepare-promotion-follow-up.js'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[Share Kit\]\(\.\/docs\/share-kit\.md\)/);
  assert.match(readme, /\[中文分享素材包\]\(\.\/docs\/share-kit\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Share Kit\]\(\.\/docs\/share-kit\.md\)/);
  assert.match(englishReadme, /\[Chinese Share Kit\]\(\.\/docs\/share-kit\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Share Kit\]\(\.\/share-kit\.md\)/);
  assert.match(docsIndex, /\[Chinese Share Kit\]\(\.\/share-kit\.zh-CN\.md\)/);
  assert.match(docsIndex, /release announcement text, responsible sharing channels, promotion checklist, and social post language/);
  assert.match(docsIndex, /localized release announcement text, responsible sharing channels, promotion checklist, and social post language/);
  assert.match(releaseDoc, /\[Share Kit\]\(\.\/share-kit\.md\)/);
  assert.match(releaseDoc, /Work through the \[Share Kit\]\(\.\/share-kit\.md\) sharing channels and promotion checklist/);
  assert.match(releaseDoc, /\[Chinese Share Kit\]\(\.\/share-kit\.zh-CN\.md\)/);
  assert.match(chineseDemoGuide, /\[中文分享素材包\]\(\.\/share-kit\.zh-CN\.md\)/);
  assert.match(shareKit, /# Share Kit/);
  assert.match(shareKit, /## Short Description/);
  assert.match(shareKit, /A lightweight offline CHM reader and library for macOS/);
  assert.match(shareKit, /## Longer Project Copy/);
  assert.match(shareKit, /library-first workflow/);
  assert.match(shareKit, /local-only reader/);
  assert.match(shareKit, /## Release Announcement Template/);
  assert.match(shareKit, /GitHub Releases/);
  assert.match(shareKit, /CHMReaderLight-mac-arm64.zip/);
  assert.match(shareKit, /CHMReaderLight-mac-x64.zip/);
  assert.match(shareKit, /## Social Post Template/);
  assert.match(shareKit, /npm run prepare:share-post -- --channel "MacAdmins Slack"/);
  assert.match(shareKit, /-- --variant release/);
  assert.match(shareKit, /offline CHM manuals/);
  assert.match(shareKit, /## Where to Share/);
  assert.match(shareKit, /GitHub Release page/);
  assert.match(shareKit, /macOS developer or documentation communities/);
  assert.match(shareKit, /Do not cross-post the same message repeatedly/);
  assert.match(shareKit, /Reply with the showcase issue template/);
  assert.match(shareKit, /## After Sharing/);
  assert.match(shareKit, /Route trust, download, checksum, notarization, screenshot, demo, or support hesitation to the \[release-feedback Discussion\]/);
  assert.match(shareKit, /Invite successful users to the showcase issue template only after they confirm the story is safe to quote/);
  assert.match(shareKit, /Update the \[Directory Submission Tracker\]\(\.\/directory-submission-tracker\.md\) with live listing URLs, baseline stars or downloads, and follow-up metrics/);
  assert.match(shareKit, /npm run prepare:promotion-follow-up -- --baseline-file <baseline-file> --current-file <current-file> --channel <channel>/);
  assert.match(shareKit, /## Promotion Checklist/);
  assert.match(shareKit, /Publish the GitHub Release before posting download links/);
  assert.match(shareKit, /Attach the Demo Guide recording or README preview image/);
  assert.match(shareKit, /Ask for a GitHub star only after explaining the offline CHM workflow value/);
  assert.match(shareKit, /Update the repository social preview and About panel/);
  assert.match(shareKit, /\[Demo Guide\]\(\.\/demo-guide\.md\)/);
  assert.match(shareKit, /\[social preview artwork\]\(\.\/assets\/social-preview\.svg\)/);
  assert.match(shareKit, /\[upload-ready social preview PNG\]\(\.\/assets\/social-preview\.png\)/);
  assert.match(shareKit, /release feedback routing/);
  assert.match(chineseShareKit, /# CHMReaderLight 中文分享素材包/);
  assert.match(chineseShareKit, /\[English Share Kit\]\(\.\/share-kit\.md\)/);
  assert.match(chineseShareKit, /## 短介绍/);
  assert.match(chineseShareKit, /一个面向 macOS 的轻量离线 CHM 阅读器和书库/);
  assert.match(chineseShareKit, /## 较长项目介绍/);
  assert.match(chineseShareKit, /书库优先/);
  assert.match(chineseShareKit, /本地优先阅读器/);
  assert.match(chineseShareKit, /## Release 公告模板/);
  assert.match(chineseShareKit, /GitHub Releases/);
  assert.match(chineseShareKit, /CHMReaderLight-mac-arm64.zip/);
  assert.match(chineseShareKit, /CHMReaderLight-mac-x64.zip/);
  assert.match(chineseShareKit, /## 社交帖模板/);
  assert.match(chineseShareKit, /npm run prepare:share-post -- --channel "MacAdmins Slack"/);
  assert.match(chineseShareKit, /-- --variant release/);
  assert.match(chineseShareKit, /离线 CHM 手册/);
  assert.match(chineseShareKit, /应用内通过 \*\*Help > Copy Share Text\*\* 直接复制中英双语分享文案/);
  assert.match(chineseShareKit, /包含最新下载链接、release watch 链接、release feedback 入口、GitHub star 链接和 showcase issue 链接/);
  assert.match(chineseShareKit, /## 分享渠道/);
  assert.match(chineseShareKit, /GitHub Release 页面/);
  assert.match(chineseShareKit, /macOS 开发者或文档工具社区/);
  assert.match(chineseShareKit, /不要反复跨渠道发布同一段内容/);
  assert.match(chineseShareKit, /showcase issue template/);
  assert.match(chineseShareKit, /## 分享后的跟进/);
  assert.match(chineseShareKit, /release 页面、下载、checksum、notarization、截图、demo 或支持信息/);
  assert.match(chineseShareKit, /release-feedback Discussion/);
  assert.match(chineseShareKit, /确认故事可以安全引用之后/);
  assert.match(chineseShareKit, /Directory Submission Tracker/);
  assert.match(chineseShareKit, /baseline stars 或 downloads/);
  assert.match(chineseShareKit, /npm run prepare:promotion-follow-up -- --baseline-file <baseline-file> --current-file <current-file> --channel <channel>/);
  assert.match(chineseShareKit, /## 推广检查清单/);
  assert.match(chineseShareKit, /发布 GitHub Release 后再分享下载链接/);
  assert.match(chineseShareKit, /附上中文演示指南录制内容或 README 预览图/);
  assert.match(chineseShareKit, /解释离线 CHM 工作流价值之后再请求 GitHub star/);
  assert.match(chineseShareKit, /更新仓库 social preview 和 About panel/);
  assert.match(chineseShareKit, /\[中文演示指南\]\(\.\/demo-guide\.zh-CN\.md\)/);
  assert.match(chineseShareKit, /\[social preview artwork\]\(\.\/assets\/social-preview\.svg\)/);
  assert.match(chineseShareKit, /\[upload-ready social preview PNG\]\(\.\/assets\/social-preview\.png\)/);
  assert.match(changelog, /share kit with reusable release and social announcement copy/);
  assert.match(changelog, /Chinese share kit with localized release and social announcement copy/);
  assert.match(changelog, /Chinese share kit now explains that Help > Copy Share Text provides bilingual copy and local-audience links/);
  assert.match(changelog, /Help menu share text now includes release feedback routing/);
  assert.match(changelog, /share kit promotion checklist for post-release project visibility/);
  assert.match(changelog, /responsible sharing channels for release promotion/);
  assert.match(changelog, /share kit follow-up loop for release feedback, showcase stories, and listing metrics/);
  assert.match(changelog, /share post preparation helper for channel-specific release and social copy/);
  assert.match(changelog, /promotion follow-up helper for tracker-ready growth deltas and evidence notes/);
  assert.match(sharePostScript, /Share post draft/);
  assert.match(sharePostScript, /function buildSharePostDraft/);
  assert.match(sharePostScript, /Do not post until npm run snapshot:visibility reports ready/);
  assert.match(promotionFollowUpScript, /Promotion follow-up/);
  assert.match(promotionFollowUpScript, /function buildPromotionFollowUp/);
  assert.match(promotionFollowUpScript, /Update docs\/directory-submission-tracker.md/);
});

test('directory submissions guide helps maintainers place the project responsibly', () => {
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const shareKit = fs.readFileSync(path.join(projectRoot, 'docs', 'share-kit.md'), 'utf-8');
  const chineseShareKit = fs.readFileSync(path.join(projectRoot, 'docs', 'share-kit.zh-CN.md'), 'utf-8');
  const listingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'repository-listing.md'), 'utf-8');
  const directoryGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'directory-submissions.md'), 'utf-8');
  const chineseDirectoryGuide = fs.readFileSync(
    path.join(projectRoot, 'docs', 'directory-submissions.zh-CN.md'),
    'utf-8',
  );
  const submissionTracker = fs.readFileSync(path.join(projectRoot, 'docs', 'directory-submission-tracker.md'), 'utf-8');
  const chineseSubmissionTracker = fs.readFileSync(
    path.join(projectRoot, 'docs', 'directory-submission-tracker.zh-CN.md'),
    'utf-8',
  );
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(docsIndex, /\[Directory Submissions\]\(\.\/directory-submissions\.md\)/);
  assert.match(docsIndex, /\[Chinese Directory Submissions\]\(\.\/directory-submissions\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Directory Submission Tracker\]\(\.\/directory-submission-tracker\.md\)/);
  assert.match(docsIndex, /\[Chinese Directory Submission Tracker\]\(\.\/directory-submission-tracker\.zh-CN\.md\)/);
  assert.match(shareKit, /\[Directory Submissions\]\(\.\/directory-submissions\.md\)/);
  assert.match(shareKit, /\[Directory Submission Tracker\]\(\.\/directory-submission-tracker\.md\)/);
  assert.match(chineseShareKit, /\[中文目录提交指南\]\(\.\/directory-submissions\.zh-CN\.md\)/);
  assert.match(chineseShareKit, /\[中文目录提交跟踪表\]\(\.\/directory-submission-tracker\.zh-CN\.md\)/);
  assert.match(listingGuide, /\[Directory Submissions\]\(\.\/directory-submissions\.md\)/);
  assert.match(directoryGuide, /# Directory Submissions/);
  assert.match(directoryGuide, /## Submit After These Are Ready/);
  assert.match(directoryGuide, /public GitHub Release/);
  assert.match(directoryGuide, /repository About panel/);
  assert.match(directoryGuide, /## Candidate Directory Types/);
  assert.match(directoryGuide, /open-source macOS app lists/);
  assert.match(directoryGuide, /developer-tool directories/);
  assert.match(directoryGuide, /documentation-tool collections/);
  assert.match(directoryGuide, /## Outreach Backlog/);
  assert.match(directoryGuide, /Prioritize directories by audience fit, submission effort, and whether the listing can point to GitHub Releases/);
  assert.match(directoryGuide, /High priority: open-source macOS app lists that accept maintained utility apps/);
  assert.match(directoryGuide, /High priority: developer documentation or API-reference tool indexes/);
  assert.match(directoryGuide, /Medium priority: Electron app galleries or local-first tool collections/);
  assert.match(directoryGuide, /Record the backlog source and priority in the tracker before submitting/);
  assert.match(directoryGuide, /## Discovery Queries/);
  assert.match(directoryGuide, /\"open source macOS apps\" CHM reader/);
  assert.match(directoryGuide, /\"offline documentation\" \"macOS\" \"GitHub Releases\"/);
  assert.match(directoryGuide, /\"Electron apps\" \"developer tools\" directory/);
  assert.match(directoryGuide, /topic:chm topic:macos/);
  assert.match(directoryGuide, /Save the exact query, result URL, and rejection reason in the tracker/);
  assert.match(directoryGuide, /## Submission Copy/);
  assert.match(directoryGuide, /A lightweight offline CHM reader and library for macOS/);
  assert.match(directoryGuide, /## Listing Packet/);
  assert.match(directoryGuide, /Project URL: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light/);
  assert.match(directoryGuide, /Download URL: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases/);
  assert.match(directoryGuide, /Support URL: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/SUPPORT\.md/);
  assert.match(directoryGuide, /Suggested tags: chm, offline-documentation, macos, electron, reader/);
  assert.match(directoryGuide, /npm run prepare:directory-submission/);
  assert.match(directoryGuide, /-- --baseline-file <snapshot-file>/);
  assert.match(directoryGuide, /Use the latest release version and checksum links from the release page/);
  assert.match(directoryGuide, /Do not submit private CHM screenshots/);
  assert.match(directoryGuide, /Ask for a GitHub star only after explaining the offline CHM workflow value/);
  assert.match(directoryGuide, /## Tracking/);
  assert.match(directoryGuide, /\[Directory Submission Tracker\]\(\.\/directory-submission-tracker\.md\)/);
  assert.match(chineseDirectoryGuide, /# CHMReaderLight 中文目录提交指南/);
  assert.match(chineseDirectoryGuide, /\[English Directory Submissions\]\(\.\/directory-submissions\.md\)/);
  assert.match(chineseDirectoryGuide, /## 提交前确认/);
  assert.match(chineseDirectoryGuide, /公开 GitHub Release/);
  assert.match(chineseDirectoryGuide, /repository About panel/);
  assert.match(chineseDirectoryGuide, /## 候选目录类型/);
  assert.match(chineseDirectoryGuide, /开源 macOS 应用列表/);
  assert.match(chineseDirectoryGuide, /开发者工具目录/);
  assert.match(chineseDirectoryGuide, /文档工具合集/);
  assert.match(chineseDirectoryGuide, /## Outreach Backlog/);
  assert.match(chineseDirectoryGuide, /按照受众匹配度、提交成本，以及是否能链接 GitHub Releases 来排序/);
  assert.match(chineseDirectoryGuide, /高优先级：接受维护中实用工具的开源 macOS 应用列表/);
  assert.match(chineseDirectoryGuide, /高优先级：开发者文档或 API reference 工具索引/);
  assert.match(chineseDirectoryGuide, /中优先级：Electron app gallery 或 local-first 工具合集/);
  assert.match(chineseDirectoryGuide, /提交前先在 tracker 里记录来源和优先级/);
  assert.match(chineseDirectoryGuide, /## 发现查询/);
  assert.match(chineseDirectoryGuide, /\"开源 macOS 应用\" CHM 阅读器/);
  assert.match(chineseDirectoryGuide, /\"离线文档\" \"macOS\" \"GitHub Releases\"/);
  assert.match(chineseDirectoryGuide, /\"Electron apps\" \"developer tools\" directory/);
  assert.match(chineseDirectoryGuide, /topic:chm topic:macos/);
  assert.match(chineseDirectoryGuide, /把实际 query、结果 URL 和拒绝原因记录到 tracker/);
  assert.match(chineseDirectoryGuide, /## 提交文案/);
  assert.match(chineseDirectoryGuide, /一个面向 macOS 的轻量离线 CHM 阅读器和书库/);
  assert.match(chineseDirectoryGuide, /## Listing Packet/);
  assert.match(chineseDirectoryGuide, /Project URL: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light/);
  assert.match(chineseDirectoryGuide, /Download URL: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases/);
  assert.match(chineseDirectoryGuide, /Support URL: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/SUPPORT\.zh-CN\.md/);
  assert.match(chineseDirectoryGuide, /Suggested tags: chm, offline-documentation, macos, electron, reader/);
  assert.match(chineseDirectoryGuide, /从 release 页面复制最新版本号和 checksum 链接/);
  assert.match(chineseDirectoryGuide, /不要提交私有 CHM 截图/);
  assert.match(chineseDirectoryGuide, /解释离线 CHM 工作流价值之后再请求 GitHub star，并链接到/);
  assert.match(chineseDirectoryGuide, /\[中文适用场景\]\(\.\/use-cases\.zh-CN\.md\)/);
  assert.match(chineseDirectoryGuide, /\[中文对比指南\]\(\.\/comparison\.zh-CN\.md\)/);
  assert.match(chineseDirectoryGuide, /\[中文采用检查清单\]\(\.\/adoption-checklist\.zh-CN\.md\)/);
  assert.match(chineseDirectoryGuide, /## 跟踪/);
  assert.match(chineseDirectoryGuide, /\[中文目录提交跟踪表\]\(\.\/directory-submission-tracker\.zh-CN\.md\)/);
  assert.match(submissionTracker, /# Directory Submission Tracker/);
  assert.match(submissionTracker, /## Submission Log/);
  assert.match(submissionTracker, /\| Priority \| Source \| Directory \| URL \| Submitted Copy \| Release Version \| Submitted On \| Baseline Stars\/Downloads\/Watchers \| Follow-Up Stars\/Downloads\/Watchers \| Status \| Follow-Up \| Evidence \|/);
  assert.match(submissionTracker, /Use `High`, `Medium`, or `Low` priority to keep the next outreach batch focused/);
  assert.match(submissionTracker, /Use Source for the saved search, community list, or referral that produced the candidate/);
  assert.match(submissionTracker, /Record baseline GitHub stars, release downloads, and watchers when you submit/);
  assert.match(submissionTracker, /compare them during follow-up checks/);
  assert.match(submissionTracker, /Capture a dated evidence note for every follow-up check/);
  assert.match(submissionTracker, /## Listing Quality Check/);
  assert.match(submissionTracker, /description matches the current repository About panel/);
  assert.match(submissionTracker, /tags match CHM, offline documentation, macOS, Electron, and reader search terms/);
  assert.match(submissionTracker, /download link points to the latest GitHub Release/);
  assert.match(submissionTracker, /screenshots or preview images do not include private CHM content/);
  assert.match(submissionTracker, /## Follow-Up Cadence/);
  assert.match(submissionTracker, /Recheck live listings after each public release/);
  assert.match(chineseSubmissionTracker, /# CHMReaderLight 中文目录提交跟踪表/);
  assert.match(chineseSubmissionTracker, /\[English Directory Submission Tracker\]\(\.\/directory-submission-tracker\.md\)/);
  assert.match(chineseSubmissionTracker, /## 提交记录/);
  assert.match(chineseSubmissionTracker, /\| 优先级 \| 来源 \| 目录 \| URL \| 提交文案 \| Release 版本 \| 提交日期 \| 提交时 Stars\/Downloads\/Watchers \| 复查 Stars\/Downloads\/Watchers \| 状态 \| 后续动作 \| 证据 \|/);
  assert.match(chineseSubmissionTracker, /使用 `High`、`Medium` 或 `Low` 优先级，让下一批 outreach 更聚焦/);
  assert.match(chineseSubmissionTracker, /来源列记录发现候选目录的 saved search、community list 或推荐线索/);
  assert.match(chineseSubmissionTracker, /提交时记录 GitHub stars、release downloads 和 watchers 基线/);
  assert.match(chineseSubmissionTracker, /复查时对比这些数字/);
  assert.match(chineseSubmissionTracker, /每次复查都补一条带日期的证据记录/);
  assert.match(chineseSubmissionTracker, /## Listing 质量检查/);
  assert.match(chineseSubmissionTracker, /description 与当前 repository About panel/);
  assert.match(chineseSubmissionTracker, /tags 覆盖 CHM、offline documentation、macOS、Electron 和 reader 搜索词/);
  assert.match(chineseSubmissionTracker, /download link 指向最新 GitHub Release/);
  assert.match(chineseSubmissionTracker, /截图或预览图不包含私有 CHM 内容/);
  assert.match(chineseSubmissionTracker, /## 跟进节奏/);
  assert.match(chineseSubmissionTracker, /每次公开 release 后重新检查线上 listing/);
  assert.match(changelog, /directory submission guide for responsible external discovery/);
  assert.match(changelog, /Chinese directory submission guide for localized external discovery/);
  assert.match(changelog, /directory submission guides now include copy-ready listing packets/);
  assert.match(changelog, /Chinese directory submission guide now links star requests to localized evaluation paths/);
  assert.match(changelog, /directory submission tracker template for external listing follow-up/);
  assert.match(changelog, /Chinese directory submission tracker for localized listing follow-up/);
  assert.match(changelog, /directory submission trackers now record baseline and follow-up star and download metrics/);
  assert.match(changelog, /directory submission trackers now record watcher baselines and dated follow-up evidence/);
  assert.match(changelog, /directory submission guides now include a prioritized outreach backlog/);
  assert.match(changelog, /directory submission guides now include reusable discovery queries for outreach research/);
});

test('documentation index helps visitors find project guides', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[Documentation Index\]\(\.\/docs\/index\.md\)/);
  assert.match(englishReadme, /\[Documentation Index\]\(\.\/docs\/index\.md\)/);
  assert.match(docsIndex, /# Documentation Index/);
  assert.match(docsIndex, /\[Getting Started\]\(\.\/getting-started\.md\)/);
  assert.match(docsIndex, /\[Feature Tour\]\(\.\/feature-tour\.md\)/);
  assert.match(docsIndex, /\[macOS Install Guide\]\(\.\/install-macos\.md\)/);
  assert.match(docsIndex, /\[Troubleshooting\]\(\.\/troubleshooting\.md\)/);
  assert.match(docsIndex, /\[Compatibility Notes\]\(\.\/compatibility\.md\)/);
  assert.match(docsIndex, /\[Privacy and Local Data\]\(\.\/privacy\.md\)/);
  assert.match(docsIndex, /\[Support Guide\]\(\.\.\/SUPPORT\.md\)/);
  assert.match(docsIndex, /\[Security Policy\]\(\.\.\/SECURITY\.md\)/);
  assert.match(docsIndex, /\[Code of Conduct\]\(\.\.\/CODE_OF_CONDUCT\.md\)/);
  assert.match(docsIndex, /\[Contributing Guide\]\(\.\.\/CONTRIBUTING\.md\)/);
  assert.match(docsIndex, /\[Architecture Overview\]\(\.\/architecture\.md\)/);
  assert.match(docsIndex, /\[Benchmarking Guide\]\(\.\/benchmarking\.md\)/);
  assert.match(docsIndex, /\[TypeScript Migration Specification\]\(\.\/typescript-migration-spec\.md\)/);
  assert.match(docsIndex, /\[Release Checklist\]\(\.\/release\.md\)/);
  assert.match(docsIndex, /\[Roadmap\]\(\.\/roadmap\.md\)/);
  assert.match(docsIndex, /\[Keyboard Shortcuts\]\(\.\/shortcuts\.md\)/);
  assert.match(docsIndex, /\[Chinese Keyboard Shortcuts\]\(\.\/shortcuts\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Accessibility Guide\]\(\.\/accessibility\.md\)/);
  assert.match(docsIndex, /\[FAQ\]\(\.\/faq\.md\)/);
  assert.match(docsIndex, /Help > Report or Request/);
  assert.match(changelog, /Documentation Index/);
  assert.match(changelog, /community health links from the Documentation Index/);
  assert.match(changelog, /documentation index and maintainer guidance for the in-app Help > Report or Request routing/);
});

test('accessibility guide documents current keyboard and appearance expectations', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const chineseSupport = fs.readFileSync(path.join(projectRoot, 'SUPPORT.zh-CN.md'), 'utf-8');
  const statusGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'project-status.md'), 'utf-8');
  const gettingStarted = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.md'), 'utf-8');
  const chineseGettingStarted = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.zh-CN.md'), 'utf-8');
  const chineseFaq = fs.readFileSync(path.join(projectRoot, 'docs', 'faq.zh-CN.md'), 'utf-8');
  const shortcuts = fs.readFileSync(path.join(projectRoot, 'docs', 'shortcuts.md'), 'utf-8');
  const chineseShortcuts = fs.readFileSync(path.join(projectRoot, 'docs', 'shortcuts.zh-CN.md'), 'utf-8');
  const accessibilityGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'accessibility.md'), 'utf-8');
  const chineseAccessibilityGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'accessibility.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[中文无障碍指南\]\(\.\/docs\/accessibility\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Chinese Accessibility Guide\]\(\.\/docs\/accessibility\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Accessibility Guide\]\(\.\/accessibility\.md\)/);
  assert.match(docsIndex, /\[Chinese Accessibility Guide\]\(\.\/accessibility\.zh-CN\.md\)/);
  assert.match(support, /\[Accessibility Guide\]\(\.\/docs\/accessibility\.md\)/);
  assert.match(chineseSupport, /\[中文无障碍指南\]\(\.\/docs\/accessibility\.zh-CN\.md\)/);
  assert.match(statusGuide, /\[Accessibility Guide\]\(\.\/accessibility\.md\)/);
  assert.match(gettingStarted, /\[Accessibility Guide\]\(\.\/accessibility\.md\)/);
  assert.match(chineseGettingStarted, /\[中文无障碍指南\]\(\.\/accessibility\.zh-CN\.md\)/);
  assert.match(chineseFaq, /\[中文无障碍指南\]\(\.\/accessibility\.zh-CN\.md\)/);
  assert.match(shortcuts, /\[Accessibility Guide\]\(\.\/accessibility\.md\)/);
  assert.match(chineseShortcuts, /\[中文无障碍指南\]\(\.\/accessibility\.zh-CN\.md\)/);
  assert.match(accessibilityGuide, /# Accessibility Guide/);
  assert.match(accessibilityGuide, /## Current Support/);
  assert.match(accessibilityGuide, /Keyboard-first library and reader workflows are supported through native macOS menus and documented shortcuts/);
  assert.match(accessibilityGuide, /Visible focus states help track keyboard movement through library cards, toolbar controls, dialogs, and menus/);
  assert.match(accessibilityGuide, /Status changes such as library counts, empty-search results, and topic progress use polite announcements/);
  assert.match(accessibilityGuide, /## Known Limits/);
  assert.match(accessibilityGuide, /CHMReaderLight currently uses a light appearance/);
  assert.match(accessibilityGuide, /Dark mode and high-contrast theme switches are not available yet/);
  assert.match(accessibilityGuide, /VoiceOver coverage is expected to improve through real reports rather than broad claims/);
  assert.match(accessibilityGuide, /## Report an Accessibility Gap/);
  assert.match(accessibilityGuide, /accessibility issue template/);
  assert.match(accessibilityGuide, /input method or assistive technology/);
  assert.match(accessibilityGuide, /macOS appearance setting/);
  assert.match(accessibilityGuide, /Help > Copy Diagnostic Info/);
  assert.match(accessibilityGuide, /Do not include private CHM content, sensitive file paths, or confidential screenshots/);
  assert.match(changelog, /accessibility guide for keyboard, assistive technology, and appearance expectations/);
  assert.match(changelog, /Chinese accessibility guide for localized keyboard, assistive technology, and appearance expectations/);
  assert.match(chineseAccessibilityGuide, /# CHMReaderLight 中文无障碍指南/);
  assert.match(chineseAccessibilityGuide, /\[English Accessibility Guide\]\(\.\/accessibility\.md\)/);
  assert.match(chineseAccessibilityGuide, /## 当前支持/);
  assert.match(chineseAccessibilityGuide, /通过原生 macOS 菜单和已记录的快捷键支持键盘优先的书库和阅读器工作流/);
  assert.match(chineseAccessibilityGuide, /可见焦点状态/);
  assert.match(chineseAccessibilityGuide, /polite announcements/);
  assert.match(chineseAccessibilityGuide, /## 已知限制/);
  assert.match(chineseAccessibilityGuide, /当前使用浅色外观/);
  assert.match(chineseAccessibilityGuide, /还没有深色模式或高对比主题开关/);
  assert.match(chineseAccessibilityGuide, /VoiceOver 覆盖会通过真实报告继续改进/);
  assert.match(chineseAccessibilityGuide, /## 报告无障碍缺口/);
  assert.match(chineseAccessibilityGuide, /accessibility issue template/);
  assert.match(chineseAccessibilityGuide, /输入方式或辅助技术/);
  assert.match(chineseAccessibilityGuide, /macOS 外观设置/);
  assert.match(chineseAccessibilityGuide, /Help > Copy Diagnostic Info/);
  assert.match(chineseAccessibilityGuide, /不要在公开报告中包含私有 CHM 内容、敏感文件路径或保密截图/);
});

test('project status guide summarizes readiness and scope for evaluators', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const chineseSupport = fs.readFileSync(path.join(projectRoot, 'SUPPORT.zh-CN.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const faq = fs.readFileSync(path.join(projectRoot, 'docs', 'faq.md'), 'utf-8');
  const chineseFaq = fs.readFileSync(path.join(projectRoot, 'docs', 'faq.zh-CN.md'), 'utf-8');
  const roadmap = fs.readFileSync(path.join(projectRoot, 'docs', 'roadmap.md'), 'utf-8');
  const statusGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'project-status.md'), 'utf-8');
  const chineseStatusGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'project-status.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[Project Status\]\(\.\/docs\/project-status\.md\)/);
  assert.match(readme, /\[中文项目状态\]\(\.\/docs\/project-status\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Project Status\]\(\.\/docs\/project-status\.md\)/);
  assert.match(englishReadme, /\[Chinese Project Status\]\(\.\/docs\/project-status\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Project Status\]\(\.\/project-status\.md\)/);
  assert.match(docsIndex, /\[Chinese Project Status\]\(\.\/project-status\.zh-CN\.md\)/);
  assert.match(faq, /\[Project Status\]\(\.\/project-status\.md\)/);
  assert.match(chineseFaq, /\[中文项目状态\]\(\.\/project-status\.zh-CN\.md\)/);
  assert.match(chineseSupport, /\[中文项目状态\]\(\.\/docs\/project-status\.zh-CN\.md\)/);
  assert.match(roadmap, /\[Project Status\]\(\.\/project-status\.md\)/);
  assert.match(statusGuide, /# Project Status/);
  assert.match(statusGuide, /## Current Snapshot/);
  assert.match(statusGuide, /macOS 12 or later/);
  assert.match(statusGuide, /Apple Silicon and Intel Macs/);
  assert.match(statusGuide, /GitHub Releases/);
  assert.match(statusGuide, /SHA-256 checksum files/);
  assert.match(statusGuide, /GitHub artifact attestations/);
  assert.match(statusGuide, /not Apple-notarized yet/);
  assert.match(statusGuide, /Homebrew is not a supported install path yet/);
  assert.match(statusGuide, /No telemetry, accounts, cloud sync, or hosted document storage/);
  assert.match(statusGuide, /## Ready For/);
  assert.match(statusGuide, /## Not Ready For/);
  assert.match(statusGuide, /## Before You Star or Watch/);
  assert.match(statusGuide, /Verify the matching `.zip.sha256` checksum and optional GitHub artifact attestation/);
  assert.match(changelog, /project status guide for GitHub evaluators/);
  assert.match(changelog, /project status artifact attestation trust note/);
  assert.match(changelog, /Chinese project status guide for localized platform, distribution, trust, and scope review/);
  assert.match(chineseStatusGuide, /# CHMReaderLight 中文项目状态/);
  assert.match(chineseStatusGuide, /\[English Project Status\]\(\.\/project-status\.md\)/);
  assert.match(chineseStatusGuide, /## 当前快照/);
  assert.match(chineseStatusGuide, /macOS 12 或更高版本/);
  assert.match(chineseStatusGuide, /Apple Silicon 和 Intel Mac/);
  assert.match(chineseStatusGuide, /GitHub Releases/);
  assert.match(chineseStatusGuide, /SHA-256 checksum files/);
  assert.match(chineseStatusGuide, /GitHub artifact attestations/);
  assert.match(chineseStatusGuide, /尚未完成 Apple notarization/);
  assert.match(chineseStatusGuide, /Homebrew 还不是受支持的安装方式/);
  assert.match(chineseStatusGuide, /不包含 telemetry、账号、cloud sync 或托管文档存储/);
  assert.match(chineseStatusGuide, /## 适合现在使用/);
  assert.match(chineseStatusGuide, /## 暂不适合/);
  assert.match(chineseStatusGuide, /## Star 或 Watch 前/);
  assert.match(chineseStatusGuide, /校验对应的 `.zip.sha256` checksum 和可选 GitHub artifact attestation/);
  assert.match(chineseStatusGuide, /\[中文采用检查清单\]\(\.\/adoption-checklist\.zh-CN\.md\)/);
});

test('evaluation guides keep a source-run path available before the first public release', () => {
  const statusGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'project-status.md'), 'utf-8');
  const chineseStatusGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'project-status.zh-CN.md'), 'utf-8');
  const adoptionGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'adoption-checklist.md'), 'utf-8');
  const chineseAdoptionGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'adoption-checklist.zh-CN.md'), 'utf-8');
  const gettingStarted = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.md'), 'utf-8');
  const chineseGettingStarted = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.zh-CN.md'), 'utf-8');
  const installGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'install-macos.md'), 'utf-8');
  const chineseInstallGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'install-macos.zh-CN.md'), 'utf-8');
  const useCases = fs.readFileSync(path.join(projectRoot, 'docs', 'use-cases.md'), 'utf-8');
  const chineseUseCases = fs.readFileSync(path.join(projectRoot, 'docs', 'use-cases.zh-CN.md'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  for (const guide of [statusGuide, adoptionGuide]) {
    assert.match(guide, /If GitHub Releases does not have a public build yet/);
    assert.match(guide, /`npm run run`/);
    assert.match(guide, /\[Getting Started\]\(\.\/getting-started\.md\)/);
  }

  for (const guide of [chineseStatusGuide, chineseAdoptionGuide]) {
    assert.match(guide, /如果 GitHub Releases 暂无公开构件/);
    assert.match(guide, /`npm run run`/);
    assert.match(guide, /\[中文入门指南\]\(\.\/getting-started\.zh-CN\.md\)/);
  }

  assert.match(gettingStarted, /If GitHub Releases does not have a public build yet/);
  assert.match(gettingStarted, /npm install\s+npm run run/);
  assert.match(chineseGettingStarted, /如果 GitHub Releases 暂无公开构件/);
  assert.match(chineseGettingStarted, /npm install\s+npm run run/);
  assert.match(installGuide, /If GitHub Releases does not have a public build yet, use the source-run path in \[Getting Started\]\(\.\/getting-started\.md\)/);
  assert.match(chineseInstallGuide, /如果 GitHub Releases 暂无公开构件，请使用\[中文入门指南\]\(\.\/getting-started\.zh-CN\.md\)中的源码运行路径/);
  assert.match(useCases, /If GitHub Releases does not have a public build yet, run from source through \[Getting Started\]\(\.\/getting-started\.md\)/);
  assert.match(chineseUseCases, /如果 GitHub Releases 暂无公开构件，请按照\[中文入门指南\]\(\.\/getting-started\.zh-CN\.md\)从源码运行/);

  const readmeDownloadSection = readme.slice(
    readme.indexOf('## 下载与体验'),
    readme.indexOf('## 60 秒试用路径'),
  );
  const englishReadmeDownloadSection = englishReadme.slice(
    englishReadme.indexOf('## Download'),
    englishReadme.indexOf('## Try It in 60 Seconds'),
  );
  assert.match(readmeDownloadSection, /如果 Releases 暂无可下载构件，请按\[本地运行\]\(#本地运行\)从源码启动/);
  assert.match(englishReadmeDownloadSection, /If Releases has no downloadable build yet, use \[Development\]\(#development\) to run from source/);

  assert.match(changelog, /source-run fallback across the bilingual visitor evaluation and install paths/);
});

test('README gives macOS users a clear download path', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /## 下载与体验/);
  assert.match(readme, /\[GitHub Releases\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\)/);
  assert.match(readme, /\[macOS Install Guide\]\(\.\/docs\/install-macos\.md\)/);
  assert.match(readme, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(readme, /CHMReaderLight-mac-x64\.zip/);
  assert.match(readme, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-arm64\.zip/);
  assert.match(readme, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-x64\.zip/);
  for (const content of [readme, englishReadme]) {
    assert.match(content, /\[CHMReaderLight-mac-arm64\.zip\.sha256\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-arm64\.zip\.sha256\)/);
    assert.match(content, /\[CHMReaderLight-mac-x64\.zip\.sha256\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-x64\.zip\.sha256\)/);
  }
  assert.match(readme, /gh attestation verify CHMReaderLight-mac-arm64\.zip --repo zhongdiandaoda\/chm-reader-light/);
  assert.match(readme, /gh attestation verify CHMReaderLight-mac-x64\.zip --repo zhongdiandaoda\/chm-reader-light/);
  assert.match(readme, /尚未做 Apple notarization/);
  assert.match(readme, /System Settings > Privacy & Security/);
  assert.match(changelog, /README download section/);
  assert.match(changelog, /README download artifact attestation commands/);
  assert.match(changelog, /README and install guides now include direct latest release download links/);
  assert.match(changelog, /README and install guide download choices now link each zip to its matching SHA-256 checksum/);
});

test('macOS install guide sets clear release expectations', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const chineseSupport = fs.readFileSync(path.join(projectRoot, 'SUPPORT.zh-CN.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const installGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'install-macos.md'), 'utf-8');
  const chineseInstallGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'install-macos.zh-CN.md'), 'utf-8');

  assert.match(readme, /\[macOS Install Guide\]\(\.\/docs\/install-macos\.md\)/);
  assert.match(readme, /\[中文 macOS 安装指南\]\(\.\/docs\/install-macos\.zh-CN\.md\)/);
  assert.match(support, /\[macOS Install Guide\]\(\.\/docs\/install-macos\.md\)/);
  assert.match(chineseSupport, /\[中文 macOS 安装指南\]\(\.\/docs\/install-macos\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Chinese macOS Install Guide\]\(\.\/install-macos\.zh-CN\.md\)/);
  assert.match(changelog, /macOS install guide/);
  assert.match(changelog, /Chinese macOS install guide for local download and first-launch help/);
  assert.match(installGuide, /# macOS Install Guide/);
  assert.match(installGuide, /## Choose the Right Download/);
  assert.match(installGuide, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(installGuide, /CHMReaderLight-mac-x64\.zip/);
  assert.match(installGuide, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-arm64\.zip/);
  assert.match(installGuide, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-x64\.zip/);
  assert.match(installGuide, /\[CHMReaderLight-mac-arm64\.zip\.sha256\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-arm64\.zip\.sha256\)/);
  assert.match(installGuide, /\[CHMReaderLight-mac-x64\.zip\.sha256\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-x64\.zip\.sha256\)/);
  assert.match(installGuide, /## Verify the Download/);
  assert.match(installGuide, /shasum -a 256 -c CHMReaderLight-mac-arm64\.zip\.sha256/);
  assert.match(installGuide, /shasum -a 256 -c CHMReaderLight-mac-x64\.zip\.sha256/);
  assert.match(installGuide, /GitHub artifact attestation/);
  assert.match(installGuide, /gh attestation verify CHMReaderLight-mac-arm64\.zip --repo zhongdiandaoda\/chm-reader-light/);
  assert.match(installGuide, /## First Launch/);
  assert.match(installGuide, /not Apple-notarized yet/);
  assert.match(installGuide, /System Settings > Privacy & Security/);
  assert.match(installGuide, /## Update or Remove/);
  assert.match(installGuide, /Replace the existing `CHMReaderLight.app`/);
  assert.match(installGuide, /Help > Reveal App Data Folder/);
  assert.match(installGuide, /\[Troubleshooting\]\(\.\/troubleshooting\.md\)/);
  assert.match(installGuide, /\[Privacy and Local Data\]\(\.\/privacy\.md\)/);
  assert.match(installGuide, /## After a Successful Install/);
  assert.match(installGuide, /\[Star the repository\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\)/);
  assert.match(installGuide, /\[watch releases\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\)/);
  assert.match(installGuide, /\*\*Help > Copy Share Text\*\*/);
  assert.match(installGuide, /send a ready-made summary with release, star, feedback, and showcase links/);
  assert.match(installGuide, /\[release-feedback Discussion\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\/new\?category=release-feedback\)/);
  assert.match(chineseInstallGuide, /# CHMReaderLight 中文 macOS 安装指南/);
  assert.match(chineseInstallGuide, /\[English macOS Install Guide\]\(\.\/install-macos\.md\)/);
  assert.match(chineseInstallGuide, /## 选择正确下载项/);
  assert.match(chineseInstallGuide, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(chineseInstallGuide, /CHMReaderLight-mac-x64\.zip/);
  assert.match(chineseInstallGuide, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-arm64\.zip/);
  assert.match(chineseInstallGuide, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-x64\.zip/);
  assert.match(chineseInstallGuide, /\[CHMReaderLight-mac-arm64\.zip\.sha256\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-arm64\.zip\.sha256\)/);
  assert.match(chineseInstallGuide, /\[CHMReaderLight-mac-x64\.zip\.sha256\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-x64\.zip\.sha256\)/);
  assert.match(chineseInstallGuide, /## 校验下载文件/);
  assert.match(chineseInstallGuide, /shasum -a 256 -c CHMReaderLight-mac-arm64\.zip\.sha256/);
  assert.match(chineseInstallGuide, /gh attestation verify CHMReaderLight-mac-arm64\.zip --repo zhongdiandaoda\/chm-reader-light/);
  assert.match(chineseInstallGuide, /## 首次启动/);
  assert.match(chineseInstallGuide, /尚未完成 Apple notarization/);
  assert.match(chineseInstallGuide, /System Settings > Privacy & Security/);
  assert.match(chineseInstallGuide, /## 更新或移除/);
  assert.match(chineseInstallGuide, /替换已有的 `CHMReaderLight.app`/);
  assert.match(chineseInstallGuide, /Help > Reveal App Data Folder/);
  assert.match(chineseInstallGuide, /\[Troubleshooting\]\(\.\/troubleshooting\.md\)/);
  assert.match(chineseInstallGuide, /\[Privacy and Local Data\]\(\.\/privacy\.md\)/);
  assert.match(chineseInstallGuide, /## 安装成功后/);
  assert.match(chineseInstallGuide, /\[Star the repository\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\)/);
  assert.match(chineseInstallGuide, /\[watch releases\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\)/);
  assert.match(chineseInstallGuide, /\*\*Help > Copy Share Text\*\*/);
  assert.match(chineseInstallGuide, /复制包含 release、star、反馈和 showcase 链接的现成摘要/);
  assert.match(chineseInstallGuide, /\[release-feedback Discussion\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\/new\?category=release-feedback\)/);
  assert.match(changelog, /macOS install guides now give successful installers direct star, watch, and release feedback follow-ups/);
  assert.match(changelog, /macOS install guides now point successful users to Help > Copy Share Text/);
});

test('signing and notarization guide explains macOS trust status', () => {
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const installGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'install-macos.md'), 'utf-8');
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');
  const faq = fs.readFileSync(path.join(projectRoot, 'docs', 'faq.md'), 'utf-8');
  const roadmap = fs.readFileSync(path.join(projectRoot, 'docs', 'roadmap.md'), 'utf-8');
  const signingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'signing-notarization.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(docsIndex, /\[Signing and Notarization\]\(\.\/signing-notarization\.md\)/);
  assert.match(installGuide, /\[Signing and Notarization\]\(\.\/signing-notarization\.md\)/);
  assert.match(releaseDoc, /\[Signing and Notarization\]\(\.\/signing-notarization\.md\)/);
  assert.match(faq, /\[Signing and Notarization\]\(\.\/signing-notarization\.md\)/);
  assert.match(roadmap, /\[Signing and Notarization\]\(\.\/signing-notarization\.md\)/);
  assert.match(signingGuide, /# Signing and Notarization/);
  assert.match(signingGuide, /## Current Status/);
  assert.match(signingGuide, /release builds are not Apple-notarized yet/);
  assert.match(signingGuide, /ad-hoc signed/);
  assert.match(signingGuide, /System Settings > Privacy & Security/);
  assert.match(signingGuide, /## What Would Change/);
  assert.match(signingGuide, /Developer ID Application certificate/);
  assert.match(signingGuide, /Apple notarization/);
  assert.match(signingGuide, /stapled notarization ticket/);
  assert.match(signingGuide, /## Maintainer Checklist/);
  assert.match(signingGuide, /Do not remove the notarization caveat/);
  assert.match(signingGuide, /codesign --verify/);
  assert.match(signingGuide, /spctl --assess/);
  assert.match(signingGuide, /notarytool/);
  assert.match(signingGuide, /## User-Safe Messaging/);
  assert.match(signingGuide, /does not upload CHM content/);
  assert.match(changelog, /signing and notarization guide for macOS release trust expectations/);
});

test('Homebrew cask guide prepares a future macOS install channel', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const installGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'install-macos.md'), 'utf-8');
  const chineseInstallGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'install-macos.zh-CN.md'), 'utf-8');
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');
  const directoryGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'directory-submissions.md'), 'utf-8');
  const chineseDirectoryGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'directory-submissions.zh-CN.md'), 'utf-8');
  const faq = fs.readFileSync(path.join(projectRoot, 'docs', 'faq.md'), 'utf-8');
  const chineseFaq = fs.readFileSync(path.join(projectRoot, 'docs', 'faq.zh-CN.md'), 'utf-8');
  const homebrewGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'homebrew-cask.md'), 'utf-8');
  const chineseHomebrewGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'homebrew-cask.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[Homebrew Cask Guide\]\(\.\/docs\/homebrew-cask\.md\)/);
  assert.match(readme, /\[中文 Homebrew Cask 指南\]\(\.\/docs\/homebrew-cask\.zh-CN\.md\)/);
  assert.match(readme, /Homebrew 目前还不是受支持的安装方式/);
  assert.match(englishReadme, /\[Homebrew Cask Guide\]\(\.\/docs\/homebrew-cask\.md\)/);
  assert.match(englishReadme, /\[Chinese Homebrew Cask Guide\]\(\.\/docs\/homebrew-cask\.zh-CN\.md\)/);
  assert.match(englishReadme, /Homebrew is not a supported install path yet/);
  assert.match(docsIndex, /\[Homebrew Cask Guide\]\(\.\/homebrew-cask\.md\)/);
  assert.match(docsIndex, /\[Chinese Homebrew Cask Guide\]\(\.\/homebrew-cask\.zh-CN\.md\)/);
  assert.match(installGuide, /\[Homebrew Cask Guide\]\(\.\/homebrew-cask\.md\)/);
  assert.match(installGuide, /\[Chinese Homebrew Cask Guide\]\(\.\/homebrew-cask\.zh-CN\.md\)/);
  assert.match(chineseInstallGuide, /\[中文 Homebrew Cask 指南\]\(\.\/homebrew-cask\.zh-CN\.md\)/);
  assert.match(chineseInstallGuide, /\[Homebrew Cask Guide\]\(\.\/homebrew-cask\.md\)/);
  assert.match(releaseDoc, /\[Homebrew Cask Guide\]\(\.\/homebrew-cask\.md\)/);
  assert.match(directoryGuide, /\[Homebrew Cask Guide\]\(\.\/homebrew-cask\.md\)/);
  assert.match(chineseDirectoryGuide, /\[中文 Homebrew Cask 指南\]\(\.\/homebrew-cask\.zh-CN\.md\)/);
  assert.match(faq, /\[Homebrew Cask Guide\]\(\.\/homebrew-cask\.md\)/);
  assert.match(chineseFaq, /\[中文 Homebrew Cask 指南\]\(\.\/homebrew-cask\.zh-CN\.md\)/);
  assert.match(homebrewGuide, /# Homebrew Cask Guide/);
  assert.match(homebrewGuide, /\[中文 Homebrew Cask 指南\]\(\.\/homebrew-cask\.zh-CN\.md\)/);
  assert.match(homebrewGuide, /CHMReaderLight does not have a published Homebrew cask yet/);
  assert.match(homebrewGuide, /## When to Add a Cask/);
  assert.match(homebrewGuide, /public GitHub Release/);
  assert.match(homebrewGuide, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(homebrewGuide, /CHMReaderLight-mac-x64\.zip/);
  assert.match(homebrewGuide, /sha256/);
  assert.match(homebrewGuide, /notarization caveat/);
  assert.match(homebrewGuide, /## Candidate Cask Metadata/);
  assert.match(homebrewGuide, /npm run prepare:homebrew-cask -- --release-dir <release-dir>/);
  assert.match(homebrewGuide, /name \"CHMReaderLight\"/);
  assert.match(homebrewGuide, /desc \"Lightweight offline CHM reader and library for macOS\"/);
  assert.match(homebrewGuide, /homepage \"https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\"/);
  assert.match(homebrewGuide, /depends_on macos:/);
  assert.match(homebrewGuide, /app \"CHMReaderLight\.app\"/);
  assert.match(homebrewGuide, /## Verification/);
  assert.match(homebrewGuide, /brew audit --cask/);
  assert.match(homebrewGuide, /brew install --cask/);
  assert.match(homebrewGuide, /Help > Copy Diagnostic Info/);
  assert.match(homebrewGuide, /## Public Messaging/);
  assert.match(homebrewGuide, /Do not tell users to install with Homebrew until the cask is published/);
  assert.match(chineseHomebrewGuide, /# CHMReaderLight 中文 Homebrew Cask 指南/);
  assert.match(chineseHomebrewGuide, /\[English Homebrew Cask Guide\]\(\.\/homebrew-cask\.md\)/);
  assert.match(chineseHomebrewGuide, /CHMReaderLight 目前还没有发布 Homebrew cask/);
  assert.match(chineseHomebrewGuide, /## 何时添加 Cask/);
  assert.match(chineseHomebrewGuide, /公开 GitHub Release/);
  assert.match(chineseHomebrewGuide, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(chineseHomebrewGuide, /CHMReaderLight-mac-x64\.zip/);
  assert.match(chineseHomebrewGuide, /sha256/);
  assert.match(chineseHomebrewGuide, /notarization caveat/);
  assert.match(chineseHomebrewGuide, /## 候选 Cask Metadata/);
  assert.match(chineseHomebrewGuide, /npm run prepare:homebrew-cask -- --release-dir <release-dir>/);
  assert.match(chineseHomebrewGuide, /desc "Lightweight offline CHM reader and library for macOS"/);
  assert.match(chineseHomebrewGuide, /## 验证/);
  assert.match(chineseHomebrewGuide, /brew audit --cask/);
  assert.match(chineseHomebrewGuide, /brew install --cask/);
  assert.match(chineseHomebrewGuide, /Help > Copy Diagnostic Info/);
  assert.match(chineseHomebrewGuide, /## 公开说明/);
  assert.match(chineseHomebrewGuide, /在 cask 发布并验证前，不要告诉用户通过 Homebrew 安装/);
  assert.match(changelog, /Homebrew cask guide for future macOS install distribution/);
  assert.match(changelog, /Chinese Homebrew cask guide for localized package-manager contributor preparation/);
  assert.match(changelog, /README download sections now surface the Homebrew cask guide without claiming Homebrew support/);
  assert.match(changelog, /Homebrew cask draft helper for verified staged release artifacts/);
});

test('quality gate validates local Markdown links', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-doc-links.js'), 'utf-8');

  assert.equal(packageJson.scripts['check:docs'], 'node scripts/check-doc-links.js');
  assert.match(packageJson.scripts.check, /npm run check:docs/);
  assert.match(readme, /`npm test`：运行单元测试与文档、打包静态检查。/);
  assert.match(readme, /`npm run check`：执行类型检查、构建、编译产物语法检查、文档链接检查、moderate severity npm 安全公告检查、changelog 重复条目检查、README 脚本清单检查、文档索引覆盖检查、仓库发现元数据检查、GitHub label 一致性检查、社区健康文件检查、视觉资产检查、release 页面模板一致性检查、Node\.js 版本一致性检查、license 元数据一致性检查、README badge 覆盖检查、AI 项目摘要覆盖检查、增长准备清单检查、GitHub Actions workflow 信任检查和 GitHub 模板质量检查。/);
  assert.match(readme, /`npm run check:docs`：检查 README、支持文档、docs 下的本地 Markdown 链接与标题锚点，以及 GitHub 模板里的仓库内链接。/);
  assert.match(contributing, /`npm run check:docs` verifies local Markdown links, heading anchors, and repository-local links in GitHub templates/);
  assert.match(checker, /Checks local Markdown links, anchors, and repository-local links in GitHub templates/);
  assert.match(checker, /function collectMarkdownFiles/);
  assert.match(checker, /function collectGitHubTemplateFiles/);
  assert.match(checker, /function slugifyHeading/);
  assert.match(checker, /function validateMarkdownFile/);
  assert.match(checker, /function localPathFromRepositoryUrl/);
  assert.match(checker, /function validateGitHubTemplateFile/);
  assert.match(checker, /Documentation link check passed/);
  assert.match(checker, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\//);
  assert.match(checker, /\.github\/ISSUE_TEMPLATE/);
  assert.match(checker, /\.github\/DISCUSSION_TEMPLATE/);
  assert.match(checker, /\.github\/PULL_REQUEST_TEMPLATE\.md/);
  assert.match(changelog, /Markdown link checker/);
  assert.match(changelog, /GitHub template repository-local link checking/);
});

test('quality gate keeps changelog entries unique', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-changelog.js'), 'utf-8');

  assert.equal(packageJson.scripts['check:changelog'], 'node scripts/check-changelog.js');
  assert.match(packageJson.scripts.check, /npm run check:changelog/);
  assert.match(readme, /`npm run check`：执行类型检查、构建、编译产物语法检查、文档链接检查、moderate severity npm 安全公告检查、changelog 重复条目检查、README 脚本清单检查、文档索引覆盖检查、仓库发现元数据检查、GitHub label 一致性检查、社区健康文件检查、视觉资产检查、release 页面模板一致性检查、Node\.js 版本一致性检查、license 元数据一致性检查、README badge 覆盖检查、AI 项目摘要覆盖检查、增长准备清单检查、GitHub Actions workflow 信任检查和 GitHub 模板质量检查。/);
  assert.match(readme, /`npm run check:changelog`：检查 `CHANGELOG\.md` 中同一章节下是否存在重复条目。/);
  assert.match(englishReadme, /`npm run check` also validates Markdown links, moderate severity npm audit advisories, duplicate changelog entries, the README script inventory, documentation index coverage, repository metadata consistency, GitHub label consistency, community health file coverage, visual repository assets, release page template alignment, Node\.js version alignment, license metadata alignment, README badge coverage, AI project summary coverage, growth readiness coverage, GitHub Actions workflow trust checks, and GitHub template quality checks/);
  assert.match(contributing, /`npm run check:labels` keeps GitHub issue, Dependabot, and release-note labels aligned/);
  assert.match(checker, /Checks changelog sections for duplicate bullet entries/);
  assert.match(checker, /function findDuplicateBullets/);
  assert.match(checker, /Duplicate changelog entries found:/);
  assert.match(changelog, /changelog duplicate-entry checker/);

  const bullets = changelog
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.startsWith('- '));
  const duplicateBullets = bullets.filter((line: string, index: number) => bullets.indexOf(line) !== index);
  assert.deepEqual(duplicateBullets, []);
});

test('README script inventory covers contributor commands', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-readme-scripts.js'), 'utf-8');

  assert.equal(packageJson.scripts['check:readme-scripts'], 'node scripts/check-readme-scripts.js');
  assert.match(packageJson.scripts.check, /npm run check:readme-scripts/);
  assert.match(checker, /Checks README script inventory against package\.json/);
  assert.match(checker, /function findMissingScripts/);
  assert.match(checker, /README script inventory is missing package scripts:/);
  assert.match(readme, /`npm start`：直接启动已编译的 Electron 应用。/);
  assert.match(readme, /`npm run benchmark:chm`：运行 CHM 解析与搜索索引性能基准。/);
  assert.match(readme, /`npm run install:mac:arm64`：安装 Apple Silicon 架构的 macOS 应用包。/);
  assert.match(readme, /`npm run install:mac:x64`：安装 Intel 架构的 macOS 应用包。/);
  assert.match(changelog, /README script inventory checker/);
});

test('quality gate keeps GitHub labels aligned with templates and release notes', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-labels.js'), 'utf-8');

  assert.equal(packageJson.scripts['check:labels'], 'node scripts/check-labels.js');
  assert.match(packageJson.scripts.check, /npm run check:labels/);
  assert.match(readme, /`npm run check:labels`/);
  assert.match(englishReadme, /label consistency/);
  assert.match(contributing, /`npm run check:labels` keeps GitHub issue, Dependabot, and release-note labels aligned/);
  assert.match(testingGuide, /validates GitHub label definitions against issue templates, Dependabot, and release notes/);
  assert.match(testingGuide, /`npm run check:labels` after changing GitHub issue templates, Dependabot labels, release-note categories, or repository label documentation/);
  assert.match(checker, /Checks GitHub label definitions against issue templates, Dependabot, release notes, and documentation/);
  assert.match(checker, /function parseLabelNames/);
  assert.match(checker, /function collectReferencedLabels/);
  assert.match(checker, /GitHub label check passed/);
  assert.match(changelog, /GitHub label consistency checker/);
});

test('quality gate keeps repository metadata aligned with the listing guide', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const listingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'repository-listing.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-repository-metadata.js'), 'utf-8');

  assert.equal(packageJson.scripts['check:metadata'], 'node scripts/check-repository-metadata.js');
  assert.match(packageJson.scripts.check, /npm run check:metadata/);
  assert.match(readme, /`npm run check:metadata`/);
  assert.match(englishReadme, /repository metadata consistency/);
  assert.match(contributing, /`npm run check:metadata` keeps `package\.json` description, homepage, and keywords aligned with `docs\/repository-listing\.md`/);
  assert.match(testingGuide, /validates repository discovery metadata against the repository listing guide/);
  assert.match(testingGuide, /`npm run check:metadata` after changing package description, homepage, keywords, GitHub topics, or repository listing copy/);
  assert.match(listingGuide, /`ebook`/);
  assert.match(communityStandards, /repository discovery metadata/);
  assert.match(checker, /Checks package discovery metadata against the repository listing guide/);
  assert.match(checker, /function parseSuggestedTopics/);
  assert.match(checker, /function parseCitationKeywords/);
  assert.match(checker, /function findMissingTopics/);
  assert.match(checker, /Citation keywords are missing package keywords/);
  assert.match(checker, /Repository metadata check passed/);
  assert.match(changelog, /repository metadata consistency checker/);
  assert.match(changelog, /repository metadata checker now keeps citation keywords aligned with package discovery terms/);
});

test('optional live repository listing audit verifies remote GitHub settings', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const listingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'repository-listing.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-live-repository-listing.js'), 'utf-8');
  const applyScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'apply-repository-listing.js'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.equal(packageJson.scripts['check:remote-listing'], 'node scripts/check-live-repository-listing.js');
  assert.equal(packageJson.scripts['apply:repository-listing'], 'node scripts/apply-repository-listing.js');
  assert.doesNotMatch(packageJson.scripts.check, /npm run check:remote-listing/);
  assert.match(readme, /`npm run check:remote-listing`：联网检查 GitHub 远端 description、website、topics 和 Discussions 是否与 repository listing 指南一致。/);
  assert.match(readme, /`npm run apply:repository-listing`：联网预览 GitHub 远端 description、website、topics 和 Discussions 更新/);
  assert.match(englishReadme, /Run `npm run check:remote-listing` after changing live GitHub About settings, topics, website, or Discussions; it uses the network and is separate from the default local gate/);
  assert.match(englishReadme, /Run `npm run apply:repository-listing` to preview the GitHub description, website, topics, and Discussions updates/);
  assert.match(contributing, /`npm run check:remote-listing` audits the live GitHub About description, website, topics, and Discussions settings after maintainers apply repository listing changes/);
  assert.match(contributing, /`npm run apply:repository-listing` previews those GitHub repository setting updates/);
  assert.match(contributing, /the live repository listing and release audits are network-backed and remain separate/);
  assert.match(testingGuide, /`npm run check:remote-listing` after applying GitHub repository About settings, topics, website, or Discussions changes; it is network-backed and intentionally not part of `npm run check`/);
  assert.match(testingGuide, /`npm run apply:repository-listing` to dry-run GitHub repository About, website, topics, and Discussions updates/);
  assert.match(listingGuide, /Run `npm run check:remote-listing` after applying settings in GitHub to compare the live repository API response with this guide/);
  assert.match(listingGuide, /npm run apply:repository-listing/);
  assert.match(listingGuide, /GITHUB_TOKEN=repo_administration_token npm run apply:repository-listing -- --confirm/);
  assert.match(communityStandards, /Run `npm run check:remote-listing` after applying GitHub About, topics, website, or Discussions settings so local guidance and the live repository stay aligned/);
  assert.match(checker, /Audits live GitHub repository listing settings against docs\/repository-listing\.md/);
  assert.match(applyScript, /Applies docs\/repository-listing\.md to GitHub repository settings when explicitly confirmed/);
  assert.match(applyScript, /function buildRepositoryListingUpdate/);
  assert.match(applyScript, /function fetchRepositoryForPlan/);
  assert.match(applyScript, /GitHub HTML fallback/);
  assert.match(applyScript, /GITHUB_TOKEN is required when using --confirm/);
  assert.match(applyScript, /Dry run only/);
  assert.match(checker, /function fetchRepository/);
  assert.match(checker, /function fetchRepositoryHtml/);
  assert.match(checker, /function parseRepositorySlug/);
  assert.match(checker, /function parseLiveRepositoryHtml/);
  assert.match(checker, /has_discussions/);
  assert.match(checker, /Live repository listing check passed/);
  assert.match(checker, /Live repository listing check failed:/);
  assert.match(checker, /Live repository HTML fallback check passed after GitHub API rate limit/);
  assert.match(checker, /HTML fallback check also found repository listing blockers/);
  assert.match(checker, /function isGitHubRateLimitError/);
  assert.match(checker, /Suggested remediation:/);
  assert.match(checker, /Set GITHUB_TOKEN before rerunning this live audit/);
  assert.match(checker, /npm run check:remote-listing/);
  assert.match(checker, /verify https:\/\/github\.com\/\$\{repositorySlug\} in a browser/);
  assert.match(checker, /gh repo edit \$\{repositorySlug\} --description "\$\{expected\.description\}"/);
  assert.match(checker, /gh repo edit \$\{repositorySlug\} --homepage "\$\{expected\.homepage\}"/);
  assert.match(checker, /gh repo edit \$\{repositorySlug\} --add-topic "\$\{topic\}"/);
  assert.match(checker, /Enable Discussions in https:\/\/github\.com\/\$\{repositorySlug\}\/settings/);
  assert.match(changelog, /live repository listing audit command for GitHub About, topics, website, and Discussions settings/);
  assert.match(changelog, /live repository listing audit now prints copy-paste remediation guidance/);
  assert.match(changelog, /live repository listing audit now explains how to recover from GitHub API rate limits/);
  assert.match(changelog, /live repository listing audit now falls back to public GitHub HTML when the API is rate-limited/);
  assert.match(changelog, /repository listing apply helper for token-based GitHub metadata updates/);
});

test('quality gate keeps the documentation index complete', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-doc-index.js'), 'utf-8');

  assert.equal(packageJson.scripts['check:docs-index'], 'node scripts/check-doc-index.js');
  assert.match(packageJson.scripts.check, /npm run check:docs-index/);
  assert.match(readme, /`npm run check:docs-index`/);
  assert.match(englishReadme, /documentation index coverage/);
  assert.match(contributing, /`npm run check:docs-index` keeps `docs\/index\.md` linked to every published guide in `docs\/`/);
  assert.match(testingGuide, /validates that the Documentation Index links every published guide in `docs\/`/);
  assert.match(testingGuide, /`npm run check:docs-index` after adding, removing, renaming, or moving docs guides/);
  assert.match(communityStandards, /Documentation Index should link every published guide in `docs\/`/);
  assert.match(checker, /Checks docs index coverage against published docs guides/);
  assert.match(checker, /function collectDocGuides/);
  assert.match(checker, /function collectIndexLinks/);
  assert.match(checker, /Documentation index check passed/);
  assert.match(changelog, /documentation index coverage checker/);
});

test('quality gate keeps community health files present', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-community-health.js'), 'utf-8');

  assert.equal(packageJson.scripts['check:community'], 'node scripts/check-community-health.js');
  assert.match(packageJson.scripts.check, /npm run check:community/);
  assert.match(readme, /`npm run check:community`/);
  assert.match(englishReadme, /community health file coverage/);
  assert.match(contributing, /`npm run check:community` confirms required GitHub community, support, security, contribution, and automation files are present/);
  assert.match(testingGuide, /confirms required GitHub community health files, issue templates, discussion templates, and trust workflows are present/);
  assert.match(testingGuide, /`npm run check:community` after changing community health files, issue templates, discussion templates, CODEOWNERS, or trust workflows/);
  assert.match(communityStandards, /`npm run check:community` should pass before releases or visibility pushes/);
  assert.match(checker, /Checks required community health files, templates, and trust workflows/);
  assert.match(checker, /function collectRequiredPaths/);
  assert.match(checker, /function findMissingPaths/);
  assert.match(checker, /Community health check passed/);
  assert.match(changelog, /community health file coverage checker/);
});

test('Chinese contributing guide lowers onboarding friction for local contributors', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const codeowners = fs.readFileSync(path.join(projectRoot, '.github', 'CODEOWNERS'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-community-health.js'), 'utf-8');
  const issueConfig = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'config.yml'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const chineseContributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.zh-CN.md'), 'utf-8');

  assert.match(readme, /\[中文贡献指南\]\(\.\/CONTRIBUTING\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Chinese Contributing Guide\]\(\.\/CONTRIBUTING\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Chinese Contributing Guide\]\(\.\.\/CONTRIBUTING\.zh-CN\.md\)/);
  assert.match(communityStandards, /\[CONTRIBUTING\.zh-CN\.md\]\(\.\.\/CONTRIBUTING\.zh-CN\.md\)/);
  assert.match(issueConfig, /Chinese Contributing Guide/);
  assert.match(issueConfig, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/CONTRIBUTING\.zh-CN\.md/);
  assert.match(codeowners, /\/CONTRIBUTING\.zh-CN\.md @zhongdiandaoda/);
  assert.match(checker, /'CONTRIBUTING\.zh-CN\.md'/);
  assert.match(changelog, /Chinese contributing guide for local contributor onboarding/);
  assert.match(chineseContributing, /# CHMReaderLight 中文贡献指南/);
  assert.match(chineseContributing, /\[English Contributing Guide\]\(\.\/CONTRIBUTING\.md\)/);
  assert.match(chineseContributing, /## 适合从哪里开始/);
  assert.match(chineseContributing, /Good First Contributions/);
  assert.match(chineseContributing, /## 本地开发/);
  assert.match(chineseContributing, /npm install/);
  assert.match(chineseContributing, /npm run run/);
  assert.match(chineseContributing, /## 提交前检查/);
  assert.match(chineseContributing, /npm test/);
  assert.match(chineseContributing, /npm run check/);
  assert.match(chineseContributing, /Help > Copy Diagnostic Info/);
  assert.match(chineseContributing, /不要提交私有 CHM 文件/);
});

test('Chinese Code of Conduct sets local participation expectations', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const codeowners = fs.readFileSync(path.join(projectRoot, '.github', 'CODEOWNERS'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-community-health.js'), 'utf-8');
  const contributingZh = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.zh-CN.md'), 'utf-8');
  const supportZh = fs.readFileSync(path.join(projectRoot, 'SUPPORT.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const chineseCodeOfConduct = fs.readFileSync(path.join(projectRoot, 'CODE_OF_CONDUCT.zh-CN.md'), 'utf-8');

  assert.match(readme, /\[中文行为准则\]\(\.\/CODE_OF_CONDUCT\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Chinese Code of Conduct\]\(\.\/CODE_OF_CONDUCT\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Chinese Code of Conduct\]\(\.\.\/CODE_OF_CONDUCT\.zh-CN\.md\)/);
  assert.match(communityStandards, /\[CODE_OF_CONDUCT\.zh-CN\.md\]\(\.\.\/CODE_OF_CONDUCT\.zh-CN\.md\)/);
  assert.match(codeowners, /\/CODE_OF_CONDUCT\.zh-CN\.md @zhongdiandaoda/);
  assert.match(checker, /'CODE_OF_CONDUCT\.zh-CN\.md'/);
  assert.match(contributingZh, /\[中文行为准则\]\(\.\/CODE_OF_CONDUCT\.zh-CN\.md\)/);
  assert.match(supportZh, /\[中文行为准则\]\(\.\/CODE_OF_CONDUCT\.zh-CN\.md\)/);
  assert.match(changelog, /Chinese Code of Conduct for local participation expectations/);
  assert.match(chineseCodeOfConduct, /# CHMReaderLight 中文行为准则/);
  assert.match(chineseCodeOfConduct, /\[English Code of Conduct\]\(\.\/CODE_OF_CONDUCT\.md\)/);
  assert.match(chineseCodeOfConduct, /## 我们的标准/);
  assert.match(chineseCodeOfConduct, /尊重不同经验水平、语言背景和运行环境/);
  assert.match(chineseCodeOfConduct, /不要公开他人的私人信息/);
  assert.match(chineseCodeOfConduct, /## 报告问题/);
  assert.match(chineseCodeOfConduct, /\[中文安全政策\]\(\.\/SECURITY\.zh-CN\.md\)/);
  assert.match(chineseCodeOfConduct, /## 执行方式/);
});

test('Chinese support guide routes local users to the right public and private channels', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const chineseInstallGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'install-macos.zh-CN.md'), 'utf-8');
  const chineseFaq = fs.readFileSync(path.join(projectRoot, 'docs', 'faq.zh-CN.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const codeowners = fs.readFileSync(path.join(projectRoot, '.github', 'CODEOWNERS'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-community-health.js'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const chineseSupport = fs.readFileSync(path.join(projectRoot, 'SUPPORT.zh-CN.md'), 'utf-8');
  const chineseTroubleshooting = fs.readFileSync(path.join(projectRoot, 'docs', 'troubleshooting.zh-CN.md'), 'utf-8');

  assert.match(readme, /\[中文支持指南\]\(\.\/SUPPORT\.zh-CN\.md\)/);
  assert.match(readme, /\[中文故障排查\]\(\.\/docs\/troubleshooting\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Chinese Support Guide\]\(\.\/SUPPORT\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Chinese Troubleshooting\]\(\.\/docs\/troubleshooting\.zh-CN\.md\)/);
  assert.match(support, /\[中文支持指南\]\(\.\/SUPPORT\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Chinese Support Guide\]\(\.\.\/SUPPORT\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Chinese Troubleshooting\]\(\.\/troubleshooting\.zh-CN\.md\)/);
  assert.match(communityStandards, /\[SUPPORT\.zh-CN\.md\]\(\.\.\/SUPPORT\.zh-CN\.md\)/);
  assert.match(codeowners, /\/SUPPORT\.zh-CN\.md @zhongdiandaoda/);
  assert.match(checker, /'SUPPORT\.zh-CN\.md'/);
  assert.match(changelog, /Chinese support guide for local user routing/);
  assert.match(changelog, /Chinese troubleshooting guide for setup, encoding, search, and missing-file help/);
  assert.match(chineseSupport, /# CHMReaderLight 中文支持指南/);
  assert.match(chineseSupport, /\[English Support Guide\]\(\.\/SUPPORT\.md\)/);
  assert.match(chineseSupport, /## 提问前先看/);
  assert.match(chineseSupport, /Getting Started/);
  assert.match(chineseSupport, /\[中文故障排查\]\(\.\/docs\/troubleshooting\.zh-CN\.md\)/);
  assert.match(chineseSupport, /GitHub Discussions/);
  assert.match(chineseSupport, /已安装应用的用户可以从 \*\*Help > Report or Request\*\* 开始/);
  assert.match(chineseSupport, /如果只想反馈 release 信任、下载、checksum、notarization、截图、demo 或支持信息，可以直接使用 \*\*Help > Release Feedback\*\*/);
  assert.match(chineseSupport, /question、install help、bug、CHM compatibility、feature request、performance、accessibility、documentation、release feedback、showcase 和 security-policy 路径/);
  assert.match(chineseSupport, /## Bug 与兼容性报告/);
  assert.match(chineseSupport, /Help > Copy Diagnostic Info/);
  assert.match(chineseSupport, /## 安全问题/);
  assert.match(chineseSupport, /中文安全政策/);
  assert.match(chineseSupport, /不要在公开 issue 中发布漏洞细节/);
  assert.match(chineseInstallGuide, /\[中文故障排查\]\(\.\/troubleshooting\.zh-CN\.md\)/);
  assert.match(chineseFaq, /\[中文故障排查\]\(\.\/troubleshooting\.zh-CN\.md\)/);
  assert.match(chineseTroubleshooting, /# CHMReaderLight 中文故障排查/);
  assert.match(chineseTroubleshooting, /\[English Troubleshooting\]\(\.\/troubleshooting\.md\)/);
  assert.match(chineseTroubleshooting, /## 应用无法打开/);
  assert.match(chineseTroubleshooting, /System Settings > Privacy & Security/);
  assert.match(chineseTroubleshooting, /## CHM 文件打不开/);
  assert.match(chineseTroubleshooting, /npm run doctor/);
  assert.match(chineseTroubleshooting, /extract_chmLib/);
  assert.match(chineseTroubleshooting, /## 文本乱码/);
  assert.match(chineseTroubleshooting, /GBK/);
  assert.match(chineseTroubleshooting, /GB18030/);
  assert.match(chineseTroubleshooting, /BIG5/);
  assert.match(chineseTroubleshooting, /## 目录缺失/);
  assert.match(chineseTroubleshooting, /\.hhc/);
  assert.match(chineseTroubleshooting, /## 搜索结果少于预期/);
  assert.match(chineseTroubleshooting, /Help > Clear Extracted Cache/);
  assert.match(chineseTroubleshooting, /## 书库条目找不到源文件/);
  assert.match(chineseTroubleshooting, /重新定位/);
  assert.match(chineseTroubleshooting, /Help > Reveal App Data Folder/);
  assert.match(chineseTroubleshooting, /## 提交 issue 前/);
  assert.match(chineseTroubleshooting, /Help > Copy Diagnostic Info/);
  assert.match(chineseTroubleshooting, /不要上传私有 CHM 文件、专有截图、敏感路径或保密文档文本/);
});

test('repository ignore rules protect local contributor files', () => {
  const gitignore = fs.readFileSync(path.join(projectRoot, '.gitignore'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(gitignore, /^node_modules\/$/m);
  assert.match(gitignore, /^dist\/$/m);
  assert.match(gitignore, /^build\/$/m);
  assert.match(gitignore, /^\.test-build\/$/m);
  assert.match(gitignore, /^\.env$/m);
  assert.match(gitignore, /^\.env\.\*$/m);
  assert.match(gitignore, /^\*\.chm$/m);
  assert.match(contributing, /local CHM files, or personal environment files/);
  assert.match(changelog, /gitignore coverage for local CHM and environment files/);
});

test('benchmark guide helps contributors measure CHM parsing performance', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const benchmarkGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'benchmarking.md'), 'utf-8');

  assert.match(readme, /\[Benchmarking Guide\]\(\.\/docs\/benchmarking\.md\)/);
  assert.match(contributing, /\[Benchmarking Guide\]\(\.\/docs\/benchmarking\.md\)/);
  assert.match(changelog, /benchmarking guide/);
  assert.match(benchmarkGuide, /# Benchmarking Guide/);
  assert.match(benchmarkGuide, /npm run benchmark:chm/);
  assert.match(benchmarkGuide, /--pages 1200 --paragraphs 12 --iterations 3/);
  assert.match(benchmarkGuide, /--extracted-root/);
  assert.match(benchmarkGuide, /--chm/);
  assert.match(benchmarkGuide, /--skip-search-index/);
  assert.match(benchmarkGuide, /Do not commit private CHM files/);
  assert.match(benchmarkGuide, /totalMs/);
  assert.match(benchmarkGuide, /medianMs/);
});

test('testing guide helps contributors choose the right verification path', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');

  assert.match(readme, /\[Testing Guide\]\(\.\/docs\/testing\.md\)/);
  assert.match(englishReadme, /\[Testing Guide\]\(\.\/docs\/testing\.md\)/);
  assert.match(contributing, /\[Testing Guide\]\(\.\/docs\/testing\.md\)/);
  assert.match(docsIndex, /\[Testing Guide\]\(\.\/testing\.md\)/);
  assert.match(changelog, /testing guide for contributor verification choices/);
  assert.match(testingGuide, /# Testing Guide/);
  assert.match(testingGuide, /## Default Pre-PR Gate/);
  assert.match(testingGuide, /npm run check/);
  assert.match(testingGuide, /## Choosing Focused Checks/);
  assert.match(testingGuide, /npm test -- --test-name-pattern/);
  assert.match(testingGuide, /npm run check:docs/);
  assert.match(testingGuide, /npm run check:changelog/);
  assert.match(testingGuide, /npm run check:readme-scripts/);
  assert.match(testingGuide, /## Manual App Checks/);
  assert.match(testingGuide, /Help > Copy Diagnostic Info/);
  assert.match(testingGuide, /## What CI Covers/);
  assert.match(testingGuide, /GitHub Actions CI/);
});

test('test script forwards Node test runner arguments', () => {
  const testScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'test.js'), 'utf-8');

  assert.match(testScript, /const testArgs = process\.argv\.slice\(2\)/);
  assert.match(testScript, /'--test', \.\.\.testArgs, \.\.\.sourceTests, \.\.\.compiledTests/);
});

test('search guide explains library and reader search workflows', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const gettingStarted = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.md'), 'utf-8');
  const chineseGettingStarted = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.zh-CN.md'), 'utf-8');
  const featureTour = fs.readFileSync(path.join(projectRoot, 'docs', 'feature-tour.md'), 'utf-8');
  const chineseFeatureTour = fs.readFileSync(path.join(projectRoot, 'docs', 'feature-tour.zh-CN.md'), 'utf-8');
  const chineseTroubleshooting = fs.readFileSync(path.join(projectRoot, 'docs', 'troubleshooting.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const searchGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'search.md'), 'utf-8');
  const chineseSearchGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'search.zh-CN.md'), 'utf-8');

  assert.match(readme, /\[Search Guide\]\(\.\/docs\/search\.md\)/);
  assert.match(readme, /\[中文搜索指南\]\(\.\/docs\/search\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Search Guide\]\(\.\/docs\/search\.md\)/);
  assert.match(englishReadme, /\[Chinese Search Guide\]\(\.\/docs\/search\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Search Guide\]\(\.\/search\.md\)/);
  assert.match(docsIndex, /\[Chinese Search Guide\]\(\.\/search\.zh-CN\.md\)/);
  assert.match(gettingStarted, /\[Search Guide\]\(\.\/search\.md\)/);
  assert.match(chineseGettingStarted, /\[中文搜索指南\]\(\.\/search\.zh-CN\.md\)/);
  assert.match(featureTour, /\[Search Guide\]\(\.\/search\.md\)/);
  assert.match(chineseFeatureTour, /\[中文搜索指南\]\(\.\/search\.zh-CN\.md\)/);
  assert.match(chineseTroubleshooting, /\[中文搜索指南\]\(\.\/search\.zh-CN\.md\)/);
  assert.match(changelog, /search guide for library search, reader search, match navigation, and indexing limits/);
  assert.match(changelog, /Chinese search guide for localized library search, reader search, match navigation, and indexing limits/);
  assert.match(searchGuide, /# Search Guide/);
  assert.match(searchGuide, /## Library Search/);
  assert.match(searchGuide, /book name or source file path/);
  assert.match(searchGuide, /clear the query/);
  assert.match(searchGuide, /## Reader Search/);
  assert.match(searchGuide, /Body/);
  assert.match(searchGuide, /Directory/);
  assert.match(searchGuide, /Command\+F/);
  assert.match(searchGuide, /## Match Navigation/);
  assert.match(searchGuide, /current page/);
  assert.match(searchGuide, /## Indexing Limits/);
  assert.match(searchGuide, /visible body text/);
  assert.match(searchGuide, /images, generated script output, embedded binary objects, or unsupported plugin content/);
  assert.match(chineseSearchGuide, /# CHMReaderLight 中文搜索指南/);
  assert.match(chineseSearchGuide, /\[English Search Guide\]\(\.\/search\.md\)/);
  assert.match(chineseSearchGuide, /## 书库搜索/);
  assert.match(chineseSearchGuide, /书名或源文件路径/);
  assert.match(chineseSearchGuide, /清空关键词/);
  assert.match(chineseSearchGuide, /## 阅读器搜索/);
  assert.match(chineseSearchGuide, /Body/);
  assert.match(chineseSearchGuide, /Directory/);
  assert.match(chineseSearchGuide, /Command\+F/);
  assert.match(chineseSearchGuide, /## 匹配项导航/);
  assert.match(chineseSearchGuide, /当前页面/);
  assert.match(chineseSearchGuide, /## 索引限制/);
  assert.match(chineseSearchGuide, /可见正文文本/);
  assert.match(chineseSearchGuide, /图片、脚本生成内容、嵌入式二进制对象或不受支持 plugin content/);
});

test('package metadata helps users discover the project', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.equal(packageJson.description, 'A lightweight offline CHM reader and library for macOS');
  assert.equal(packageJson.homepage, 'https://github.com/zhongdiandaoda/chm-reader-light#readme');
  assert.equal(packageJson.repository.url, 'git+https://github.com/zhongdiandaoda/chm-reader-light.git');
  assert.equal(packageJson.bugs.url, 'https://github.com/zhongdiandaoda/chm-reader-light/issues');
  assert.ok(packageJson.keywords.includes('chm-viewer'));
  assert.ok(packageJson.keywords.includes('macos-chm-reader'));
  assert.ok(packageJson.keywords.includes('chm-reader-macos'));
  assert.ok(packageJson.keywords.includes('offline-docs'));
  assert.ok(packageJson.keywords.includes('offline-documentation'));
  assert.ok(packageJson.keywords.includes('html-help'));
  assert.ok(packageJson.keywords.includes('microsoft-html-help'));
  assert.ok(packageJson.keywords.includes('offline-reader'));
  assert.ok(packageJson.keywords.includes('help-viewer'));
  assert.ok(packageJson.keywords.includes('api-reference'));
  assert.ok(packageJson.keywords.includes('technical-documentation'));
  assert.ok(packageJson.keywords.includes('macos-app'));
  assert.ok(packageJson.keywords.includes('documentation'));
  assert.match(changelog, /broader package metadata keywords/);
  assert.match(changelog, /Microsoft HTML Help and offline reader discovery keywords/);
  assert.match(changelog, /help viewer and technical documentation discovery keywords/);
  assert.match(changelog, /platform-specific CHM reader discovery keywords/);
});

test('llms text gives AI and search tools a compact project map', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const listingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'repository-listing.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const llmsText = fs.readFileSync(path.join(projectRoot, 'llms.txt'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-llms.js'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.equal(packageJson.scripts['check:llms'], 'node scripts/check-llms.js');
  assert.match(packageJson.scripts.check, /npm run check:llms/);
  assert.match(readme, /\[AI Project Summary\]\(\.\/llms\.txt\)/);
  assert.match(readme, /`npm run check:llms`/);
  assert.match(englishReadme, /\[AI Project Summary\]\(\.\/llms\.txt\)/);
  assert.match(englishReadme, /AI project summary coverage/);
  assert.match(contributing, /`npm run check:llms` keeps `llms\.txt` aligned with README, repository links, and trust notes/);
  assert.match(docsIndex, /\[AI Project Summary\]\(\.\.\/llms\.txt\)/);
  assert.match(listingGuide, /Confirm `llms\.txt` still summarizes the project positioning/);
  assert.match(testingGuide, /validates AI project summary coverage for positioning, trust notes, and key repository links/);
  assert.match(testingGuide, /`npm run check:llms` after changing `llms\.txt`, README positioning, trust wording, repository URLs, or AI-facing summary links/);
  assert.match(communityStandards, /`npm run check:llms`/);
  assert.match(llmsText, /# CHMReaderLight/);
  assert.match(llmsText, /A lightweight offline CHM reader and library for macOS/);
  assert.match(llmsText, /## What It Does/);
  assert.match(llmsText, /library-first workflow/);
  assert.match(llmsText, /searchable table of contents/);
  assert.match(llmsText, /body search/);
  assert.match(llmsText, /local-only/);
  assert.match(llmsText, /## Best For/);
  assert.match(llmsText, /legacy SDK manuals/);
  assert.match(llmsText, /offline API reference/);
  assert.match(llmsText, /## Trust Notes/);
  assert.match(llmsText, /No telemetry, accounts, cloud sync, or hosted document storage/);
  assert.match(llmsText, /scripts are disabled/);
  assert.match(llmsText, /GitHub artifact attestations/);
  assert.match(llmsText, /Direct latest downloads are available for Apple Silicon and Intel Mac builds/);
  assert.match(llmsText, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(llmsText, /CHMReaderLight-mac-x64\.zip/);
  assert.match(llmsText, /Homebrew is not a supported install path yet/);
  assert.match(llmsText, /Installed app users can start from Help > Report or Request/);
  assert.match(llmsText, /question, install help, bug, compatibility, feature request, performance, accessibility, documentation, release feedback, showcase, and security-policy routes/);
  assert.match(llmsText, /Installed app users can use Help > Star on GitHub after a successful local workflow trial/);
  assert.match(llmsText, /Help > Copy Share Text creates bilingual sharing copy with release, star, feedback, and showcase links/);
  assert.match(llmsText, /Help > Release Feedback opens the release-feedback Discussion when release trust details are the blocker/);
  assert.match(llmsText, /## Key Links/);
  assert.match(llmsText, /- README: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light#readme/);
  assert.match(llmsText, /- Releases: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases/);
  assert.match(llmsText, /- Apple Silicon download: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-arm64\.zip/);
  assert.match(llmsText, /- Intel download: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-x64\.zip/);
  assert.match(llmsText, /- Homebrew Cask Guide: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/homebrew-cask\.md/);
  assert.match(llmsText, /- Issues: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\/choose/);
  assert.match(llmsText, /- Discussions: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions/);
  assert.match(llmsText, /- Release feedback: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\/new\?category=release-feedback/);
  assert.match(llmsText, /- Support: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/SUPPORT\.md/);
  assert.match(llmsText, /- Contributing: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/CONTRIBUTING\.md/);
  assert.match(llmsText, /- Documentation feedback: https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\?template=documentation\.yml/);
  assert.match(checker, /Checks llms\.txt coverage/);
  assert.match(checker, /function verifyLlmsSummary/);
  assert.match(checker, /Installed app users can start from Help > Report or Request/);
  assert.match(checker, /Direct latest downloads are available for Apple Silicon and Intel Mac builds/);
  assert.match(checker, /Homebrew is not a supported install path yet/);
  assert.match(checker, /release feedback, showcase, and security-policy routes/);
  assert.match(checker, /Help > Copy Share Text creates bilingual sharing copy/);
  assert.match(checker, /Help > Release Feedback opens the release-feedback Discussion/);
  assert.match(checker, /\['Support', `\$\{repositoryBaseUrl\}\/blob\/main\/SUPPORT\.md`\]/);
  assert.match(checker, /AI project summary check passed/);
  assert.match(changelog, /AI-friendly llms\.txt project summary/);
  assert.match(changelog, /AI project summary coverage checker for search and assistant discoverability/);
  assert.match(changelog, /README and documentation links to the AI-friendly project summary/);
  assert.match(changelog, /AI-friendly project summary links for contributors and documentation feedback/);
  assert.match(changelog, /AI-friendly project summary artifact attestation trust note/);
  assert.match(changelog, /AI-friendly project summary now includes support routing and the in-app Help > Report or Request path/);
  assert.match(changelog, /AI-friendly project summary now surfaces in-app star, share, and release-feedback actions/);
  assert.match(changelog, /AI-friendly project summary now includes direct latest downloads and Homebrew cask caveat/);
});

test('repository listing guide helps maintainers configure GitHub discovery', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');
  const listingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'repository-listing.md'), 'utf-8');
  const socialPreview = fs.readFileSync(path.join(projectRoot, 'docs', 'assets', 'social-preview.svg'), 'utf-8');
  const socialPreviewPng = fs.readFileSync(path.join(projectRoot, 'docs', 'assets', 'social-preview.png'));
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const discussionTemplateDir = path.join(projectRoot, '.github', 'DISCUSSION_TEMPLATE');
  const qAndAForm = fs.readFileSync(path.join(discussionTemplateDir, 'q-a.yml'), 'utf-8');
  const showAndTellForm = fs.readFileSync(path.join(discussionTemplateDir, 'show-and-tell.yml'), 'utf-8');
  const releaseFeedbackForm = fs.readFileSync(path.join(discussionTemplateDir, 'release-feedback.yml'), 'utf-8');

  assert.match(readme, /\[Repository Listing\]\(\.\/docs\/repository-listing\.md\)/);
  assert.match(englishReadme, /\[Repository Listing\]\(\.\/docs\/repository-listing\.md\)/);
  assert.match(docsIndex, /\[Repository Listing\]\(\.\/repository-listing\.md\)/);
  assert.match(docsIndex, /GitHub Discussions/);
  assert.match(releaseDoc, /Confirm the GitHub repository About panel still matches \[Repository Listing\]\(\.\/repository-listing\.md\)/);
  assert.match(listingGuide, /# Repository Listing/);
  assert.match(listingGuide, /A lightweight offline CHM reader and library for macOS/);
  assert.match(listingGuide, /## Suggested Topics/);
  assert.match(listingGuide, /`chm-viewer`/);
  assert.match(listingGuide, /`macos-chm-reader`/);
  assert.match(listingGuide, /`chm-reader-macos`/);
  assert.match(listingGuide, /`html-help`/);
  assert.match(listingGuide, /`microsoft-html-help`/);
  assert.match(listingGuide, /`offline-docs`/);
  assert.match(listingGuide, /`offline-documentation`/);
  assert.match(listingGuide, /`offline-reader`/);
  assert.match(listingGuide, /`help-viewer`/);
  assert.match(listingGuide, /`api-reference`/);
  assert.match(listingGuide, /`technical-documentation`/);
  assert.match(listingGuide, /`macos`/);
  assert.match(listingGuide, /`macos-app`/);
  assert.match(listingGuide, /`ebook`/);
  assert.match(listingGuide, /## Website/);
  assert.match(listingGuide, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light#readme/);
  assert.match(listingGuide, /## Social Preview/);
  assert.match(listingGuide, /docs\/assets\/social-preview\.svg/);
  assert.match(listingGuide, /docs\/assets\/social-preview\.png/);
  assert.match(listingGuide, /1280 x 640/);
  assert.match(listingGuide, /upload `docs\/assets\/social-preview\.png` to GitHub repository settings/);
  assert.match(listingGuide, /## Discussions/);
  assert.match(listingGuide, /Enable GitHub Discussions for community questions, showcase follow-ups, and release feedback/);
  assert.match(listingGuide, /Keep installed-app support routing aligned with `Help > Report or Request`/);
  assert.match(listingGuide, /question, install help, bug, compatibility, feature, performance, accessibility, documentation, release feedback, showcase, and security-policy paths/);
  assert.match(listingGuide, /Suggested categories/);
  assert.match(listingGuide, /Q&A/);
  assert.match(listingGuide, /Show and tell/);
  assert.match(listingGuide, /Release feedback/);
  assert.match(listingGuide, /Ask contributors to search existing Discussions before opening a new community thread/);
  assert.match(listingGuide, /\.github\/DISCUSSION_TEMPLATE\/q-a\.yml/);
  assert.match(listingGuide, /\.github\/DISCUSSION_TEMPLATE\/show-and-tell\.yml/);
  assert.match(listingGuide, /\.github\/DISCUSSION_TEMPLATE\/release-feedback\.yml/);
  assert.match(listingGuide, /## Pinned Community Items/);
  assert.match(listingGuide, /Pin one current release feedback Discussion/);
  assert.match(listingGuide, /Pin one good first issue that uses `.github\/ISSUE_TEMPLATE\/good_first_task\.yml`/);
  assert.match(listingGuide, /Unpin stale release feedback, resolved support threads, or starter issues that no longer have clear file pointers/);
  assert.match(listingGuide, /## Issue Labels/);
  assert.match(listingGuide, /Create or confirm the issue labels used by the templates/);
  assert.match(listingGuide, /`performance`/);
  assert.match(listingGuide, /slow opening, extraction, search indexing, search queries, startup, or large-library workflows/);
  assert.match(listingGuide, /`accessibility`/);
  assert.match(listingGuide, /keyboard, VoiceOver, focus, color contrast, or appearance reports/);
  assert.match(listingGuide, /`showcase`/);
  assert.match(listingGuide, /positive offline CHM workflow stories/);
  assert.match(listingGuide, /`good first issue`/);
  assert.match(listingGuide, /`help wanted`/);
  assert.match(listingGuide, /new contributors can find scoped starter work/);
  assert.match(listingGuide, /## Verification/);
  assert.match(listingGuide, /GitHub About panel/);
  assert.match(listingGuide, /## Apply Repository Settings/);
  assert.match(listingGuide, /Use the GitHub repository Settings > General page to set the website field/);
  assert.match(listingGuide, /Use the repository About gear to set the description and topics/);
  assert.match(listingGuide, /Enable Discussions before linking users to Q&A, Show and tell, or Release feedback/);
  assert.match(listingGuide, /After updating remote settings, verify via GitHub API that `description`, `homepage`, `topics`, and `has_discussions` match this guide/);
  assert.match(listingGuide, /Do not treat local README or package metadata as proof that remote repository settings are live/);
  assert.match(listingGuide, /Confirm issue labels include `bug`, `compatibility`, `enhancement`, `documentation`, `performance`, `accessibility`, `question`, `showcase`, `good first issue`, and `help wanted`/);
  assert.match(listingGuide, /Confirm installed-app support routes still match `Help > Report or Request`/);
  assert.match(listingGuide, /Confirm GitHub Discussions is enabled with Q&A, Show and tell, and Release feedback categories/);
  assert.match(listingGuide, /Confirm pinned community items point visitors to a current release feedback thread, a scoped good first issue, and a safe showcase story/);
  assert.match(listingGuide, /CI, CodeQL, stars, downloads, license, platform, Node.js, and release badges/);
  assert.equal(socialPreviewPng.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(socialPreviewPng.readUInt32BE(16), 1280);
  assert.equal(socialPreviewPng.readUInt32BE(20), 640);
  assert.match(socialPreview, /<title id="title">CHMReaderLight GitHub social preview<\/title>/);
  assert.match(socialPreview, /<svg[^>]+width="1280" height="640" viewBox="0 0 1280 640"/);
  assert.match(socialPreview, /Offline CHM reader for macOS/);
  assert.match(socialPreview, /Library/);
  assert.match(socialPreview, /Search/);
  assert.match(socialPreview, /Local-only/);
  assert.match(qAndAForm, /title: "\[Q&A\] "/);
  assert.match(qAndAForm, /body:/);
  assert.match(qAndAForm, /id: question/);
  assert.match(qAndAForm, /What are you trying to do\?/);
  assert.match(qAndAForm, /required: true/);
  assert.match(qAndAForm, /Search existing Discussions before posting/);
  assert.match(qAndAForm, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions/);
  assert.match(showAndTellForm, /title: "\[Show and tell\] "/);
  assert.match(showAndTellForm, /body:/);
  assert.match(showAndTellForm, /id: workflow/);
  assert.match(showAndTellForm, /What offline CHM workflow improved\?/);
  assert.match(showAndTellForm, /Do not include private document content/);
  assert.match(showAndTellForm, /May maintainers quote this in project docs, release notes, or share materials\?/);
  assert.match(showAndTellForm, /Yes, with my GitHub username/);
  assert.match(showAndTellForm, /Search existing Discussions before posting/);
  assert.match(showAndTellForm, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions/);
  assert.match(releaseFeedbackForm, /title: "\[Release feedback\] "/);
  assert.match(releaseFeedbackForm, /body:/);
  assert.match(releaseFeedbackForm, /id: release-version/);
  assert.match(releaseFeedbackForm, /Which release did you try\?/);
  assert.match(releaseFeedbackForm, /CHMReaderLight-mac-arm64.zip/);
  assert.match(releaseFeedbackForm, /What would make this release easier to trust, star, watch, or share\?/);
  assert.match(releaseFeedbackForm, /download, checksum, notarization, screenshot, demo, release-note, or support details/);
  assert.match(releaseFeedbackForm, /Search existing Discussions before posting/);
  assert.match(releaseFeedbackForm, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions/);
  assert.match(changelog, /repository listing guide for GitHub description, topics, website, and social preview setup/);
  assert.match(changelog, /repository listing label checklist for showcase stories/);
  assert.match(changelog, /repository listing label checklist for newcomer-friendly contribution issues/);
  assert.match(changelog, /repository listing checklist for GitHub Discussions setup/);
  assert.match(changelog, /GitHub discussion category forms for Q&A, show-and-tell, and release feedback/);
  assert.match(changelog, /discussion templates ask contributors to search existing Discussions before posting/);
  assert.match(changelog, /show-and-tell discussion template now asks for quote permission/);
  assert.match(changelog, /release feedback discussion template now asks what would make releases easier to trust, star, watch, or share/);
  assert.match(changelog, /repository listing pinned community item checklist for release feedback, starter issues, and showcase stories/);
  assert.match(changelog, /dedicated GitHub social preview source artwork/);
  assert.match(changelog, /upload-ready GitHub social preview PNG/);
});

test('quality gate keeps visual repository assets usable', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const listingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'repository-listing.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-visual-assets.js'), 'utf-8');
  const generator = fs.readFileSync(path.join(projectRoot, 'scripts', 'generate-social-preview.sh'), 'utf-8');
  const socialPreviewSvg = fs.readFileSync(path.join(projectRoot, 'docs', 'assets', 'social-preview.svg'));
  const socialPreviewPng = fs.readFileSync(path.join(projectRoot, 'docs', 'assets', 'social-preview.png'));
  const socialPreviewManifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'docs', 'assets', 'social-preview.manifest.json'), 'utf-8'));

  assert.equal(packageJson.scripts['check:assets'], 'node scripts/check-visual-assets.js');
  assert.equal(packageJson.scripts['generate:social-preview'], 'bash scripts/generate-social-preview.sh');
  assert.match(packageJson.scripts.check, /npm run check:assets/);
  assert.match(readme, /`npm run check:assets`/);
  assert.match(englishReadme, /visual repository assets/);
  assert.match(contributing, /`npm run check:assets` keeps README preview and GitHub social preview assets present and correctly sized/);
  assert.match(testingGuide, /validates README preview and GitHub social preview assets/);
  assert.match(testingGuide, /`npm run check:assets` after changing README images, repository listing imagery, or social preview files/);
  assert.match(listingGuide, /`npm run check:assets`/);
  assert.match(listingGuide, /`npm run generate:social-preview`/);
  assert.match(checker, /Checks README preview and GitHub social preview assets/);
  assert.match(checker, /function readPngDimensions/);
  assert.match(checker, /function requireSvgViewBox/);
  assert.match(checker, /requirePngDimensions\('docs\/assets\/social-preview\.png', 1280, 640, errors\)/);
  assert.match(checker, /requireSocialPreviewSafeLayout\('docs\/assets\/social-preview\.svg', errors\)/);
  assert.match(checker, /requireGeneratedAssetManifest\(/);
  assert.match(generator, /write-visual-asset-manifest[.]js/);
  assert.equal(socialPreviewManifest.version, 1);
  assert.equal(socialPreviewManifest.source.path, 'docs/assets/social-preview.svg');
  assert.equal(socialPreviewManifest.output.path, 'docs/assets/social-preview.png');
  assert.equal(socialPreviewManifest.source.sha256, crypto.createHash('sha256').update(socialPreviewSvg).digest('hex'));
  assert.equal(socialPreviewManifest.output.sha256, crypto.createHash('sha256').update(socialPreviewPng).digest('hex'));
  assert.match(checker, /Visual asset check passed/);
  assert.match(changelog, /visual repository asset checker/);
});

test('GitHub label definitions keep issue and release routing reproducible', () => {
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const issueTriage = fs.readFileSync(path.join(projectRoot, 'docs', 'issue-triage.md'), 'utf-8');
  const listingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'repository-listing.md'), 'utf-8');
  const labelsConfig = fs.readFileSync(path.join(projectRoot, '.github', 'labels.yml'), 'utf-8');

  assert.match(listingGuide, /\.github\/labels\.yml/);
  assert.match(issueTriage, /\.github\/labels\.yml/);
  assert.match(communityStandards, /\.github\/labels\.yml/);
  assert.match(changelog, /GitHub label definitions for issue templates and release-note grouping/);

  for (const label of [
    'bug',
    'compatibility',
    'enhancement',
    'documentation',
    'performance',
    'accessibility',
    'question',
    'showcase',
    'good first issue',
    'help wanted',
    'dependencies',
    'github-actions',
    'maintenance',
  ]) {
    assert.match(labelsConfig, new RegExp(`name: ${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  }

  assert.match(labelsConfig, /description: Keyboard, VoiceOver, focus, contrast, or appearance issues/);
  assert.match(labelsConfig, /description: Small, well-scoped tasks with clear file pointers and verification steps/);
  assert.match(labelsConfig, /description: Dependency update pull requests/);
});

test('adoption checklist gives evaluators a clear path from trial to GitHub engagement', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const featureTour = fs.readFileSync(path.join(projectRoot, 'docs', 'feature-tour.md'), 'utf-8');
  const chineseFeatureTour = fs.readFileSync(path.join(projectRoot, 'docs', 'feature-tour.zh-CN.md'), 'utf-8');
  const adoptionGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'adoption-checklist.md'), 'utf-8');
  const chineseAdoptionGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'adoption-checklist.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[Adoption Checklist\]\(\.\/docs\/adoption-checklist\.md\)/);
  assert.match(readme, /\[中文采用检查清单\]\(\.\/docs\/adoption-checklist\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Adoption Checklist\]\(\.\/docs\/adoption-checklist\.md\)/);
  assert.match(englishReadme, /\[Chinese Adoption Checklist\]\(\.\/docs\/adoption-checklist\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Adoption Checklist\]\(\.\/adoption-checklist\.md\)/);
  assert.match(docsIndex, /\[Chinese Adoption Checklist\]\(\.\/adoption-checklist\.zh-CN\.md\)/);
  assert.match(featureTour, /\[Adoption Checklist\]\(\.\/adoption-checklist\.md\)/);
  assert.match(chineseFeatureTour, /\[中文采用检查清单\]\(\.\/adoption-checklist\.zh-CN\.md\)/);
  assert.match(adoptionGuide, /# Adoption Checklist/);
  assert.match(adoptionGuide, /## 5-Minute Evaluation/);
  assert.match(adoptionGuide, /Download/);
  assert.match(adoptionGuide, /Import one representative `.chm` file/);
  assert.match(adoptionGuide, /searchable table of contents/);
  assert.match(adoptionGuide, /## Trust Checks/);
  assert.match(adoptionGuide, /Privacy and Local Data/);
  assert.match(adoptionGuide, /Security Model/);
  assert.match(adoptionGuide, /GitHub artifact attestations/);
  assert.match(adoptionGuide, /gh attestation verify CHMReaderLight-mac-arm64\.zip --repo zhongdiandaoda\/chm-reader-light/);
  assert.match(adoptionGuide, /## GitHub Actions/);
  assert.match(adoptionGuide, /Star the repository/);
  assert.match(adoptionGuide, /\[Star the repository\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\)/);
  assert.match(adoptionGuide, /Watch releases/);
  assert.match(adoptionGuide, /\[Watch releases\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\)/);
  assert.match(adoptionGuide, /Share release feedback/);
  assert.match(adoptionGuide, /\[Share release feedback\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\/new\?category=release-feedback\)/);
  assert.match(adoptionGuide, /release page, checksum, notarization, screenshot, demo, or support details would make it easier to trust, star, watch, or share/);
  assert.match(adoptionGuide, /Installed users can use \*\*Help > Release Feedback\*\* when release details are the only blocker/);
  assert.match(adoptionGuide, /Fork the project/);
  assert.match(adoptionGuide, /\[Fork the project\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/fork\)/);
  assert.match(adoptionGuide, /\[Open a focused issue\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\/choose\)/);
  assert.match(adoptionGuide, /Installed users can use \*\*Help > Report or Request\*\* to choose the right issue-template, release-feedback, security-policy, or showcase route/);
  assert.match(adoptionGuide, /Good First Contributions/);
  assert.match(adoptionGuide, /\[Good First Contributions\]\(\.\/good-first-contributions\.md\)/);
  assert.match(chineseAdoptionGuide, /# CHMReaderLight 中文采用检查清单/);
  assert.match(chineseAdoptionGuide, /\[English Adoption Checklist\]\(\.\/adoption-checklist\.md\)/);
  assert.match(chineseAdoptionGuide, /## 5 分钟评估/);
  assert.match(chineseAdoptionGuide, /下载最新 release build/);
  assert.match(chineseAdoptionGuide, /导入一本有代表性的 `.chm` 文件/);
  assert.match(chineseAdoptionGuide, /可搜索目录/);
  assert.match(chineseAdoptionGuide, /## 信任检查/);
  assert.match(chineseAdoptionGuide, /中文隐私与本地数据/);
  assert.match(chineseAdoptionGuide, /Security Model/);
  assert.match(chineseAdoptionGuide, /GitHub artifact attestations/);
  assert.match(chineseAdoptionGuide, /gh attestation verify CHMReaderLight-mac-arm64\.zip --repo zhongdiandaoda\/chm-reader-light/);
  assert.match(chineseAdoptionGuide, /## GitHub 后续动作/);
  assert.match(chineseAdoptionGuide, /Star the repository/);
  assert.match(chineseAdoptionGuide, /\[Star the repository\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\)/);
  assert.match(chineseAdoptionGuide, /Watch releases/);
  assert.match(chineseAdoptionGuide, /\[Watch releases\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\)/);
  assert.match(chineseAdoptionGuide, /分享 release feedback/);
  assert.match(chineseAdoptionGuide, /\[分享 release feedback\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\/new\?category=release-feedback\)/);
  assert.match(chineseAdoptionGuide, /release 页面、checksum、notarization、截图、demo 或支持信息/);
  assert.match(chineseAdoptionGuide, /已安装应用的用户如果只是想反馈 release 信任信息，可以直接使用 \*\*Help > Release Feedback\*\*/);
  assert.match(chineseAdoptionGuide, /Fork the project/);
  assert.match(chineseAdoptionGuide, /\[Fork the project\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/fork\)/);
  assert.match(chineseAdoptionGuide, /\[提交聚焦 issue\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\/choose\)/);
  assert.match(chineseAdoptionGuide, /已安装应用的用户可以使用 \*\*Help > Report or Request\*\* 选择合适的 issue template、release feedback、安全政策或 showcase 路径/);
  assert.match(chineseAdoptionGuide, /Good First Contributions/);
  assert.match(chineseAdoptionGuide, /\[Good First Contributions\]\(\.\/good-first-contributions\.md\)/);
  assert.match(changelog, /adoption checklist artifact attestation trust check/);
  assert.match(changelog, /direct GitHub follow-up links to the adoption checklist/);
  assert.match(changelog, /adoption checklist to guide evaluators from trial use to starring, watching releases, or contributing/);
  assert.match(changelog, /Chinese adoption checklist for localized trial-to-GitHub follow-up decisions/);
  assert.match(changelog, /adoption checklists now point installed evaluators to Help > Report or Request/);
  assert.match(changelog, /adoption checklists now mention direct Help > Release Feedback routing/);
  assert.match(changelog, /adoption checklists now route release trust or sharing blockers to release feedback Discussions/);
});

test('project documents the expected Node.js version for contributors', () => {
  const nvmrc = fs.readFileSync(path.join(projectRoot, '.nvmrc'), 'utf-8');
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-node-version.js'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.equal(packageJson.scripts['check:node-version'], 'node scripts/check-node-version.js');
  assert.match(packageJson.scripts.check, /npm run check:node-version/);
  assert.equal(nvmrc.trim(), '22');
  assert.equal(packageJson.engines.node, '>=22');
  assert.match(readme, /nvm use/);
  assert.match(readme, /`npm run check:node-version`/);
  assert.match(englishReadme, /Node.js version alignment/);
  assert.match(contributing, /nvm use/);
  assert.match(contributing, /`npm run check:node-version` keeps `.nvmrc`, `package.json`, GitHub Actions, and contributor docs on the same Node.js major version/);
  assert.match(testingGuide, /validates Node.js version alignment across `.nvmrc`, `package.json`, GitHub Actions, and contributor docs/);
  assert.match(testingGuide, /`npm run check:node-version` after changing Node.js versions, GitHub Actions setup, package engines, or setup docs/);
  assert.match(checker, /Checks Node.js version alignment/);
  assert.match(checker, /function parseNvmrcMajor/);
  assert.match(checker, /node-version: '22'/);
  assert.match(checker, /Node version check passed/);
  assert.match(changelog, /Node.js version hint for local contributors/);
  assert.match(changelog, /Node.js version alignment checker for contributor setup and GitHub Actions/);
});

test('project documents shared editor formatting defaults', () => {
  const editorconfig = fs.readFileSync(path.join(projectRoot, '.editorconfig'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(editorconfig, /^root = true$/m);
  assert.match(editorconfig, /^\[\*\]$/m);
  assert.match(editorconfig, /^charset = utf-8$/m);
  assert.match(editorconfig, /^end_of_line = lf$/m);
  assert.match(editorconfig, /^insert_final_newline = true$/m);
  assert.match(editorconfig, /^indent_style = space$/m);
  assert.match(editorconfig, /^indent_size = 2$/m);
  assert.match(editorconfig, /^\[\*\.sh\]$/m);
  assert.match(editorconfig, /^indent_size = 4$/m);
  assert.match(contributing, /\.editorconfig/);
  assert.match(changelog, /shared editor formatting defaults/);
});

test('project documents shared git file attributes', () => {
  const gitattributes = fs.readFileSync(path.join(projectRoot, '.gitattributes'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(gitattributes, /^\* text=auto eol=lf$/m);
  assert.match(gitattributes, /^package-lock\.json text eol=lf$/m);
  assert.match(gitattributes, /^README\*\.md text eol=lf$/m);
  assert.match(gitattributes, /^docs\/\*\* text eol=lf$/m);
  assert.match(gitattributes, /^\*\.chm binary$/m);
  assert.match(gitattributes, /^\*\.zip binary$/m);
  assert.match(gitattributes, /^\*\.png binary$/m);
  assert.match(contributing, /\.gitattributes/);
  assert.match(changelog, /shared git file attributes/);
});

test('support docs route users to troubleshooting before filing CHM issues', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const codeOfConduct = fs.readFileSync(path.join(projectRoot, 'CODE_OF_CONDUCT.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const bugTemplate = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'bug_report.yml'), 'utf-8');
  const issueConfig = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'config.yml'), 'utf-8');
  const troubleshooting = fs.readFileSync(path.join(projectRoot, 'docs', 'troubleshooting.md'), 'utf-8');

  assert.match(readme, /\[SUPPORT\.md\]\(\.\/SUPPORT\.md\)/);
  assert.match(readme, /\[Troubleshooting\]\(\.\/docs\/troubleshooting\.md\)/);
  assert.match(contributing, /\[Troubleshooting\]\(\.\/docs\/troubleshooting\.md\)/);
  assert.match(support, /\[FAQ\]\(\.\/docs\/faq\.md\)/);
  assert.match(support, /\[Troubleshooting\]\(\.\/docs\/troubleshooting\.md\)/);
  assert.match(support, /\[Compatibility Notes\]\(\.\/docs\/compatibility\.md\)/);
  assert.match(support, /\[Project Status\]\(\.\/docs\/project-status\.md\)/);
  assert.match(support, /current platform support, release trust notes, and project scope/);
  assert.match(support, /\[Security Policy\]\(\.\/SECURITY\.md\)/);
  assert.match(support, /\[Code of Conduct\]\(\.\/CODE_OF_CONDUCT\.md\)/);
  assert.match(support, /Installed app users can start from \*\*Help > Report or Request\*\*/);
  assert.match(support, /Use \*\*Help > Release Feedback\*\* directly when release trust, download, checksum, notarization, screenshot, demo, or support details are the only blocker/);
  assert.match(support, /one-click routes to the question, install help, bug, CHM compatibility, feature request, performance, accessibility, documentation, release feedback, showcase, and security-policy paths/);
  assert.match(support, /Help > Copy Diagnostic Info/);
  assert.match(contributing, /\[Code of Conduct\]\(\.\/CODE_OF_CONDUCT\.md\)/);
  assert.match(codeOfConduct, /## Our Standards/);
  assert.match(codeOfConduct, /## Reporting Problems/);
  assert.match(codeOfConduct, /## Enforcement/);
  assert.match(codeOfConduct, /\[Security Policy\]\(\.\/SECURITY\.md\)/);
  assert.match(bugTemplate, /docs\/troubleshooting\.md/);
  assert.match(bugTemplate, /id: install-source/);
  assert.match(bugTemplate, /How did you install or run CHMReaderLight\?/);
  assert.match(bugTemplate, /GitHub release zip/);
  assert.match(bugTemplate, /Built locally with npm run package:mac/);
  assert.match(bugTemplate, /Running from source with npm run run/);
  assert.match(bugTemplate, /Do not attach private CHM files, proprietary screenshots, sensitive local paths, or confidential document text/);
  assert.match(issueConfig, /blank_issues_enabled: false/);
  assert.match(issueConfig, /SUPPORT\.md/);
  assert.match(issueConfig, /Installed app users can use Help > Report or Request to choose the right issue template, release feedback, security policy, or showcase route/);
  assert.match(issueConfig, /Chinese Support Guide/);
  assert.match(issueConfig, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/SUPPORT\.zh-CN\.md/);
  assert.match(issueConfig, /已安装应用的用户可以使用 Help > Report or Request 选择合适的 issue template、release feedback、安全政策或 showcase 路径/);
  assert.match(issueConfig, /GitHub Discussions/);
  assert.match(issueConfig, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions/);
  assert.match(issueConfig, /Ask usage questions, share safe workflow stories, or discuss release feedback/);
  assert.match(issueConfig, /Release Feedback Discussion/);
  assert.match(issueConfig, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\/new\?category=release-feedback/);
  assert.match(issueConfig, /Tell maintainers what would make a release easier to trust, star, watch, or share/);
  assert.match(issueConfig, /GitHub Releases/);
  assert.match(issueConfig, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases/);
  assert.match(issueConfig, /Project Status/);
  assert.match(issueConfig, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/project-status\.md/);
  assert.match(issueConfig, /Review current platform support, release trust notes, and scope before filing an issue/);
  assert.match(issueConfig, /Good First Contributions/);
  assert.match(issueConfig, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/good-first-contributions\.md/);
  assert.match(issueConfig, /Find scoped starter tasks, file pointers, and verification guidance before opening a pull request/);
  assert.match(issueConfig, /Governance Guide/);
  assert.match(issueConfig, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/governance\.md/);
  assert.match(issueConfig, /Review decision paths, discussion-first changes, maintainer responsibilities, and privacy boundaries/);
  assert.match(issueConfig, /Adoption Checklist/);
  assert.match(issueConfig, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/adoption-checklist\.md/);
  assert.match(issueConfig, /Evaluate CHMReaderLight before deciding whether to star, watch releases, open an issue, or contribute/);
  assert.match(issueConfig, /Security Policy/);
  assert.match(issueConfig, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/security\/policy/);
  assert.match(issueConfig, /Chinese Security Policy/);
  assert.match(issueConfig, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/SECURITY\.zh-CN\.md/);
  assert.match(support, /how you installed or ran CHMReaderLight/);
  assert.match(support, /Use GitHub Discussions for open-ended usage questions and safe workflow notes/);
  assert.match(support, /\[release-feedback Discussion\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\/new\?category=release-feedback\)/);
  assert.match(changelog, /Disabled blank GitHub issues/);
  assert.match(changelog, /issue chooser links to releases and private security reporting/);
  assert.match(changelog, /issue chooser link to the project status guide/);
  assert.match(changelog, /support guide link to the project status guide/);
  assert.match(changelog, /issue chooser link to the adoption checklist/);
  assert.match(changelog, /issue chooser link to the good first contributions guide/);
  assert.match(changelog, /issue chooser link to the governance guide/);
  assert.match(changelog, /issue chooser now mirrors the in-app Help > Report or Request support routing/);
  assert.match(changelog, /issue chooser now includes localized in-app Help > Report or Request routing/);
  assert.match(changelog, /issue chooser now links directly to release feedback Discussions/);
  assert.match(changelog, /support and issue chooser guidance for GitHub Discussions/);
  assert.match(changelog, /installation source field in the bug report template/);
  assert.match(troubleshooting, /## CHM File Does Not Open/);
  assert.match(troubleshooting, /## Text Looks Garbled/);
  assert.match(troubleshooting, /## Library Entry Cannot Be Found/);
  assert.match(troubleshooting, /use the relink action on the missing library card/);
  assert.match(troubleshooting, /npm run doctor/);
});

test('issue forms ask reporters to search for related issues and discussions before filing', () => {
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const triageGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'issue-triage.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const templatePaths = [
    'accessibility.yml',
    'bug_report.yml',
    'chm_compatibility.yml',
    'documentation.yml',
    'feature_request.yml',
    'install_help.yml',
    'performance.yml',
    'question.yml',
  ];
  const existingIssuesSearch = 'https://github.com/zhongdiandaoda/chm-reader-light/issues?q=is%3Aissue';
  const discussionsUrl = 'https://github.com/zhongdiandaoda/chm-reader-light/discussions';

  assert.match(
    support,
    /Search existing \[Issues\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\?q=is%3Aissue\) and \[Discussions\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\) before opening a new report/,
  );
  assert.match(triageGuide, /Search existing Issues and Discussions for the same symptom or request/);
  assert.match(changelog, /issue templates now ask reporters to search existing Issues and Discussions before filing/);

  for (const templatePath of templatePaths) {
    const template = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', templatePath), 'utf-8');

    assert.match(template, /Search existing Issues and Discussions before filing/);
    assert.ok(template.includes(existingIssuesSearch), `${templatePath} should link to existing issue search`);
    assert.ok(template.includes(discussionsUrl), `${templatePath} should link to GitHub Discussions`);
  }
});

test('visibility push issue template turns promotion work into trackable tasks', () => {
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const issueConfig = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'config.yml'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-github-templates.js'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const template = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'visibility_push.yml'), 'utf-8');

  assert.match(template, /name: Visibility push/);
  assert.match(template, /description: Plan a release announcement, directory submission, or community sharing pass/);
  assert.match(template, /title: "\[Visibility\]: "/);
  assert.match(template, /labels: \["maintenance"\]/);
  assert.match(template, /Use this for maintainer-owned promotion work after the repository listing and release are ready/);
  assert.match(template, /docs\/growth-readiness\.md/);
  assert.match(template, /docs\/share-kit\.md/);
  assert.match(template, /docs\/directory-submission-tracker\.md/);
  assert.match(template, /Which visibility channel or audience is this for\?/);
  assert.match(template, /What live readiness checks passed\?/);
  assert.match(template, /npm run snapshot:visibility/);
  assert.match(template, /npm run check:remote-listing/);
  assert.match(template, /npm run check:remote-release/);
  assert.match(template, /What baseline metrics are recorded\?/);
  assert.match(template, /npm run snapshot:growth/);
  assert.match(template, /stargazers_count/);
  assert.match(template, /downloads/);
  assert.match(template, /watchers/);
  assert.match(template, /What copy, demo, or listing asset will be used\?/);
  assert.match(template, /What is the follow-up date and evidence plan\?/);
  assert.match(template, /Do not ask for stars until the user has a clear evaluation path/);
  assert.match(template, /Do not include private CHM content/);
  assert.match(issueConfig, /Visibility Push Guide/);
  assert.match(issueConfig, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/growth-readiness\.md/);
  assert.match(issueConfig, /Plan maintainer-owned release announcements, directory submissions, and follow-up metrics/);
  assert.match(communityStandards, /\.github\/ISSUE_TEMPLATE\/visibility_push\.yml/);
  assert.match(checker, /visibility_push\.yml/);
  assert.match(checker, /visibility push live readiness prompt/);
  assert.match(checker, /visibility push readiness snapshot command/);
  assert.match(checker, /visibility push baseline metrics prompt/);
  assert.match(checker, /visibility push follow-up evidence prompt/);
  assert.match(changelog, /visibility push issue template for maintainer-owned promotion tasks/);
});

test('quality gate keeps GitHub templates useful and safe', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-github-templates.js'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.equal(packageJson.scripts['check:templates'], 'node scripts/check-github-templates.js');
  assert.match(packageJson.scripts.check, /npm run check:templates/);
  assert.match(readme, /`npm run check:templates`/);
  assert.match(englishReadme, /GitHub template quality checks/);
  assert.match(contributing, /`npm run check:templates` keeps issue, discussion, and pull request templates aligned with support routing, privacy reminders, labels, and required fields/);
  assert.match(testingGuide, /validates GitHub template quality for support routing, privacy reminders, duplicate-search prompts, labels, and required fields/);
  assert.match(testingGuide, /`npm run check:templates` after changing issue templates, discussion templates, the pull request template, support routing, privacy reminders, or required report fields/);
  assert.match(communityStandards, /`npm run check:templates`/);
  assert.match(checker, /Checks GitHub issue, discussion, and pull request template quality/);
  assert.match(checker, /function verifyGitHubTemplates/);
  assert.match(checker, /Chinese Contributing Guide/);
  assert.match(checker, /Chinese Support Guide/);
  assert.match(checker, /Chinese Security Policy/);
  assert.match(checker, /Release Feedback Discussion/);
  assert.match(checker, /discussions\/new\?category=release-feedback/);
  assert.match(checker, /CONTRIBUTING\.zh-CN\.md/);
  assert.match(checker, /Search existing Issues and Discussions before filing/);
  assert.match(checker, /Do not include private CHM content/);
  assert.match(checker, /Help > Copy Diagnostic Info/);
  assert.match(checker, /release feedback trust, star, watch, or share prompt/);
  assert.match(checker, /Template quality check passed/);
  assert.match(changelog, /GitHub template quality checker for safer support and contributor routing/);
  assert.match(changelog, /release feedback discussion template now asks what would make releases easier to trust, star, watch, or share/);
  assert.match(changelog, /issue chooser now links directly to release feedback Discussions/);
});

test('accessibility issue template gathers focused usability feedback', () => {
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const triageGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'issue-triage.md'), 'utf-8');
  const listingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'repository-listing.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const template = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'accessibility.yml'), 'utf-8');

  assert.match(support, /accessibility issue template/);
  assert.match(support, /keyboard, VoiceOver, focus, color contrast, or appearance issues/);
  assert.match(triageGuide, /accessibility or usability/);
  assert.match(triageGuide, /`accessibility`/);
  assert.match(listingGuide, /`accessibility`/);
  assert.match(changelog, /accessibility issue template for keyboard, assistive technology, and contrast reports/);
  assert.match(template, /name: Accessibility report/);
  assert.match(template, /description: Report keyboard, VoiceOver, focus, color contrast, or appearance issues/);
  assert.match(template, /labels: \["accessibility"\]/);
  assert.match(template, /Search existing Issues and Discussions before filing/);
  assert.match(template, /What accessibility or usability issue did you hit\?/);
  assert.match(template, /Which workflow is affected\?/);
  assert.match(template, /Library management/);
  assert.match(template, /Reader navigation/);
  assert.match(template, /Search or filtering/);
  assert.match(template, /Keyboard shortcuts or focus order/);
  assert.match(template, /VoiceOver or assistive technology/);
  assert.match(template, /Color contrast or appearance/);
  assert.match(template, /What input method or assistive technology were you using\?/);
  assert.match(template, /Keyboard only/);
  assert.match(template, /VoiceOver/);
  assert.match(template, /Mouse or trackpad/);
  assert.match(template, /What is your macOS appearance setting\?/);
  assert.match(template, /Light/);
  assert.match(template, /Dark/);
  assert.match(template, /High contrast or increased contrast/);
  assert.match(template, /Steps to reproduce/);
  assert.match(template, /Expected accessible behavior/);
  assert.match(template, /Help > Copy Diagnostic Info/);
  assert.match(template, /Safe screenshot or recording/);
  assert.match(template, /Do not include private CHM content, sensitive file paths, or confidential screenshots/);
});

test('question issue template routes usage support clearly', () => {
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const questionTemplate = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'question.yml'), 'utf-8');

  assert.match(support, /question issue template/);
  assert.match(changelog, /question issue template/);
  assert.match(questionTemplate, /name: Question/);
  assert.match(questionTemplate, /usage, setup, or workflow question/);
  assert.match(questionTemplate, /docs\/faq\.md/);
  assert.match(questionTemplate, /docs\/troubleshooting\.md/);
  assert.match(questionTemplate, /What would you like help with\?/);
  assert.match(questionTemplate, /What have you tried\?/);
  assert.match(questionTemplate, /Help > Copy Diagnostic Info/);
});

test('install help template gathers release download and first-launch details', () => {
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const triageGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'issue-triage.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const template = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'install_help.yml'), 'utf-8');

  assert.match(support, /install help issue template/);
  assert.match(support, /download, checksum, provenance verification, first-launch, update, or removal/);
  assert.match(support, /attestation output if relevant/);
  assert.match(triageGuide, /install help/);
  assert.match(triageGuide, /release artifact, checksum result, attestation result, first-launch message/);
  assert.match(triageGuide, /attestation result/);
  assert.match(changelog, /install help issue template for release download and first-launch problems/);
  assert.match(changelog, /install help template provenance verification fields/);
  assert.match(template, /name: Install help/);
  assert.match(template, /description: Get help with release downloads, checksums, provenance verification, first launch, updates, or removal\./);
  assert.match(template, /title: "\[Install\]: "/);
  assert.match(template, /labels: \["question"\]/);
  assert.match(template, /docs\/install-macos\.md/);
  assert.match(template, /docs\/troubleshooting\.md/);
  assert.match(template, /Which step needs help\?/);
  assert.match(template, /Choosing the right download/);
  assert.match(template, /Verifying the `.zip.sha256` checksum/);
  assert.match(template, /Verifying GitHub artifact attestation/);
  assert.match(template, /First launch blocked by macOS/);
  assert.match(template, /Updating or removing the app/);
  assert.match(template, /Which release artifact did you use\?/);
  assert.match(template, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(template, /CHMReaderLight-mac-x64\.zip/);
  assert.match(template, /What did the checksum command print\?/);
  assert.match(template, /shasum -a 256 -c/);
  assert.match(template, /What did the attestation command print\?/);
  assert.match(template, /gh attestation verify/);
  assert.match(template, /What did macOS show on first launch\?/);
  assert.match(template, /System Settings > Privacy & Security/);
  assert.match(template, /macOS version and Mac architecture/);
  assert.match(template, /Help > Copy Diagnostic Info/);
});

test('showcase issue template gathers positive user stories', () => {
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const triageGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'issue-triage.md'), 'utf-8');
  const showcaseTemplate = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'showcase.yml'), 'utf-8');

  assert.match(support, /Showcase and Success Stories/);
  assert.match(support, /showcase issue template/);
  assert.match(support, /Do not include private document content/);
  assert.match(changelog, /showcase issue template/);
  assert.match(docsIndex, /success stories/);
  assert.match(triageGuide, /showcase/);
  assert.match(triageGuide, /quote permission/);
  assert.match(showcaseTemplate, /name: Showcase/);
  assert.match(showcaseTemplate, /labels: \["showcase"\]/);
  assert.match(showcaseTemplate, /offline CHM workflow/);
  assert.match(showcaseTemplate, /What changed for your workflow\?/);
  assert.match(showcaseTemplate, /May maintainers quote this in project docs or release notes\?/);
  assert.match(showcaseTemplate, /Do not include private document content/);
});

test('showcase guide helps turn real user stories into trustworthy social proof', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const chineseSupport = fs.readFileSync(path.join(projectRoot, 'SUPPORT.zh-CN.md'), 'utf-8');
  const triageGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'issue-triage.md'), 'utf-8');
  const shareKit = fs.readFileSync(path.join(projectRoot, 'docs', 'share-kit.md'), 'utf-8');
  const chineseShareKit = fs.readFileSync(path.join(projectRoot, 'docs', 'share-kit.zh-CN.md'), 'utf-8');
  const showcaseGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'showcase.md'), 'utf-8');
  const chineseShowcaseGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'showcase.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[Showcase Guide\]\(\.\/docs\/showcase\.md\)/);
  assert.match(readme, /\[中文 Showcase 指南\]\(\.\/docs\/showcase\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Showcase Guide\]\(\.\/docs\/showcase\.md\)/);
  assert.match(englishReadme, /\[Chinese Showcase Guide\]\(\.\/docs\/showcase\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Showcase Guide\]\(\.\/showcase\.md\)/);
  assert.match(docsIndex, /\[Chinese Showcase Guide\]\(\.\/showcase\.zh-CN\.md\)/);
  assert.match(support, /\[Showcase Guide\]\(\.\/docs\/showcase\.md\)/);
  assert.match(chineseSupport, /\[中文 Showcase 指南\]\(\.\/docs\/showcase\.zh-CN\.md\)/);
  assert.match(triageGuide, /\[Showcase Guide\]\(\.\/showcase\.md\)/);
  assert.match(shareKit, /\[Showcase Guide\]\(\.\/showcase\.md\)/);
  assert.match(chineseShareKit, /\[中文 Showcase 指南\]\(\.\/showcase\.zh-CN\.md\)/);
  assert.match(showcaseGuide, /# Showcase Guide/);
  assert.match(showcaseGuide, /## What to Share/);
  assert.match(showcaseGuide, /offline CHM workflow/);
  assert.match(showcaseGuide, /what changed after using CHMReaderLight/);
  assert.match(showcaseGuide, /## Privacy Rules/);
  assert.match(showcaseGuide, /Do not include private document content/);
  assert.match(showcaseGuide, /quote permission/);
  assert.match(showcaseGuide, /## How Maintainers Can Reuse Stories/);
  assert.match(showcaseGuide, /README/);
  assert.match(showcaseGuide, /release notes/);
  assert.match(showcaseGuide, /Share Kit/);
  assert.match(showcaseGuide, /## Submit a Story/);
  assert.match(showcaseGuide, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\/choose/);
  assert.match(chineseShowcaseGuide, /# CHMReaderLight 中文 Showcase 指南/);
  assert.match(chineseShowcaseGuide, /\[English Showcase Guide\]\(\.\/showcase\.md\)/);
  assert.match(chineseShowcaseGuide, /## 可以分享什么/);
  assert.match(chineseShowcaseGuide, /离线 CHM 工作流/);
  assert.match(chineseShowcaseGuide, /使用 CHMReaderLight 后发生了什么变化/);
  assert.match(chineseShowcaseGuide, /## 隐私规则/);
  assert.match(chineseShowcaseGuide, /不要包含私有文档内容/);
  assert.match(chineseShowcaseGuide, /引用许可/);
  assert.match(chineseShowcaseGuide, /## 维护者如何复用故事/);
  assert.match(chineseShowcaseGuide, /README/);
  assert.match(chineseShowcaseGuide, /release notes/);
  assert.match(chineseShowcaseGuide, /中文分享素材包/);
  assert.match(chineseShowcaseGuide, /## 提交故事/);
  assert.match(chineseShowcaseGuide, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\/choose/);
  assert.match(changelog, /showcase guide for collecting real user stories as social proof/);
  assert.match(changelog, /Chinese showcase guide for localized permissioned user stories/);
});

test('issue triage guide helps maintainers route public reports', () => {
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const triageGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'issue-triage.md'), 'utf-8');

  assert.match(support, /\[Issue Triage Guide\]\(\.\/docs\/issue-triage\.md\)/);
  assert.match(contributing, /\[Issue Triage Guide\]\(\.\/docs\/issue-triage\.md\)/);
  assert.match(docsIndex, /\[Issue Triage Guide\]\(\.\/issue-triage\.md\)/);
  assert.match(changelog, /issue triage guide/);
  assert.match(triageGuide, /# Issue Triage Guide/);
  assert.match(triageGuide, /## First Response/);
  assert.match(triageGuide, /Acknowledge the report and thank the reporter/);
  assert.match(
    triageGuide,
    /bug report, CHM compatibility report, accessibility or usability report, performance report, feature request, documentation improvement, question, or showcase/,
  );
  assert.match(triageGuide, /## Labels and Routing/);
  assert.match(triageGuide, /`bug`/);
  assert.match(triageGuide, /`compatibility`/);
  assert.match(triageGuide, /`enhancement`/);
  assert.match(triageGuide, /Route release trust, download confidence, screenshot, demo, or announcement feedback to the release-feedback Discussion/);
  assert.match(triageGuide, /## Reproduction Quality/);
  assert.match(triageGuide, /Help > Copy Diagnostic Info/);
  assert.match(triageGuide, /## Closing or Deferring/);
  assert.match(triageGuide, /Security Policy/);
});

test('maintainer playbook keeps routine project stewardship visible', () => {
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const chineseSupport = fs.readFileSync(path.join(projectRoot, 'SUPPORT.zh-CN.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const chineseContributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.zh-CN.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const playbook = fs.readFileSync(path.join(projectRoot, 'docs', 'maintainer-playbook.md'), 'utf-8');
  const chinesePlaybook = fs.readFileSync(path.join(projectRoot, 'docs', 'maintainer-playbook.zh-CN.md'), 'utf-8');

  assert.match(support, /\[Maintainer Playbook\]\(\.\/docs\/maintainer-playbook\.md\)/);
  assert.match(chineseSupport, /\[中文维护者手册\]\(\.\/docs\/maintainer-playbook\.zh-CN\.md\)/);
  assert.match(contributing, /\[Maintainer Playbook\]\(\.\/docs\/maintainer-playbook\.md\)/);
  assert.match(chineseContributing, /\[中文维护者手册\]\(\.\/docs\/maintainer-playbook\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Maintainer Playbook\]\(\.\/maintainer-playbook\.md\)/);
  assert.match(docsIndex, /\[Chinese Maintainer Playbook\]\(\.\/maintainer-playbook\.zh-CN\.md\)/);
  assert.match(playbook, /# Maintainer Playbook/);
  assert.match(playbook, /## Weekly Stewardship/);
  assert.match(playbook, /Review new Issues and Discussions through the Issue Triage Guide/);
  assert.match(playbook, /Confirm `Help > Report or Request` still points installed users to the active issue templates, release feedback Discussion, showcase route, and security policy/);
  assert.match(playbook, /Keep one scoped good first issue visible/);
  assert.match(playbook, /Check release feedback and showcase stories/);
  assert.match(playbook, /## Before a Visibility Push/);
  assert.match(playbook, /Repository Listing/);
  assert.match(playbook, /Directory Submission Tracker/);
  assert.match(playbook, /Share Kit/);
  assert.match(playbook, /Run `npm run check:remote-listing` before a visibility push/);
  assert.match(playbook, /Run `npm run check:remote-release` before sharing direct download links/);
  assert.match(playbook, /## Decision Rules/);
  assert.match(playbook, /Decline or defer requests that conflict with Project Status or Roadmap/);
  assert.match(playbook, /Do not ask for stars until the user has a clear evaluation path/);
  assert.match(playbook, /## Maintenance Evidence/);
  assert.match(playbook, /CHANGELOG\.md/);
  assert.match(playbook, /README, Support Guide, Documentation Index, Repository Listing guide, and in-app Help menu/);
  assert.match(playbook, /npm run check/);
  assert.match(chinesePlaybook, /# CHMReaderLight 中文维护者手册/);
  assert.match(chinesePlaybook, /\[English Maintainer Playbook\]\(\.\/maintainer-playbook\.md\)/);
  assert.match(chinesePlaybook, /## 每周维护/);
  assert.match(chinesePlaybook, /通过 Issue Triage Guide 审查新的 Issues 和 Discussions/);
  assert.match(chinesePlaybook, /确认 `Help > Report or Request` 仍然指向当前可用的 issue templates、release feedback Discussion、showcase route 和 security policy/);
  assert.match(chinesePlaybook, /## 可见度推广前/);
  assert.match(chinesePlaybook, /运行 `npm run check:remote-listing`/);
  assert.match(chinesePlaybook, /运行 `npm run check:remote-release`/);
  assert.match(chinesePlaybook, /不要在用户有清晰评估路径之前请求 star/);
  assert.match(chinesePlaybook, /运行 `npm run check`/);
  assert.match(changelog, /maintainer playbook for routine stewardship, visibility pushes, and decision rules/);
  assert.match(changelog, /maintainer playbook live-audit reminders for repository listing and release download readiness/);
  assert.match(changelog, /Chinese maintainer playbook for localized stewardship and visibility-push readiness/);
});

test('growth readiness guide keeps promotion blockers actionable', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const maintainerPlaybook = fs.readFileSync(path.join(projectRoot, 'docs', 'maintainer-playbook.md'), 'utf-8');
  const chineseMaintainerPlaybook = fs.readFileSync(path.join(projectRoot, 'docs', 'maintainer-playbook.zh-CN.md'), 'utf-8');
  const growthGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'growth-readiness.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-growth-readiness.js'), 'utf-8');
  const snapshotScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'snapshot-growth-metrics.js'), 'utf-8');
  const visibilitySnapshotScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'snapshot-visibility-readiness.js'), 'utf-8');
  const visibilityIssueScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'prepare-visibility-issue.js'), 'utf-8');
  const directorySubmissionScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'prepare-directory-submission.js'), 'utf-8');
  const homebrewCaskScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'prepare-homebrew-cask.js'), 'utf-8');
  const sharePostScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'prepare-share-post.js'), 'utf-8');
  const promotionFollowUpScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'prepare-promotion-follow-up.js'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.equal(packageJson.scripts['check:growth'], 'node scripts/check-growth-readiness.js');
  assert.equal(packageJson.scripts['snapshot:growth'], 'node scripts/snapshot-growth-metrics.js');
  assert.equal(packageJson.scripts['snapshot:visibility'], 'node scripts/snapshot-visibility-readiness.js');
  assert.equal(packageJson.scripts['prepare:visibility-issue'], 'node scripts/prepare-visibility-issue.js');
  assert.equal(packageJson.scripts['prepare:directory-submission'], 'node scripts/prepare-directory-submission.js');
  assert.equal(packageJson.scripts['prepare:homebrew-cask'], 'node scripts/prepare-homebrew-cask.js');
  assert.equal(packageJson.scripts['prepare:share-post'], 'node scripts/prepare-share-post.js');
  assert.equal(packageJson.scripts['prepare:promotion-follow-up'], 'node scripts/prepare-promotion-follow-up.js');
  assert.equal(packageJson.scripts['apply:repository-listing'], 'node scripts/apply-repository-listing.js');
  assert.equal(packageJson.scripts['stage:release-artifacts'], 'node scripts/stage-release-artifacts.js');
  assert.equal(packageJson.scripts['prepare:release-body'], 'node scripts/prepare-release-body.js');
  assert.equal(packageJson.scripts['publish:release'], 'node scripts/publish-release.js');
  assert.match(packageJson.scripts.check, /npm run check:growth/);
  assert.match(readme, /`npm run check:growth`：检查增长准备清单是否覆盖远端 listing、release、baseline metrics 和推广复盘。/);
  assert.match(readme, /`npm run snapshot:growth`：联网输出可粘贴到目录提交跟踪表的 stars、downloads、watchers 和 release 基线/);
  assert.match(readme, /`npm run snapshot:visibility`：联网输出可粘贴到 visibility push issue 的 listing、release、growth baseline 和下一步行动快照。/);
  assert.match(readme, /`npm run prepare:visibility-issue`：联网生成 visibility push issue 草稿、预填 GitHub 新 issue 链接和可复制正文/);
  assert.match(readme, /`npm run prepare:directory-submission`：从目录提交指南生成可复制的外部目录 listing 字段和 tracker 行/);
  assert.match(readme, /`npm run prepare:homebrew-cask`：从已验证的平铺 release 目录生成可复制的 Homebrew cask 草稿/);
  assert.match(readme, /`npm run prepare:share-post`：从分享素材包生成面向具体渠道的可复制发布或社交帖草稿/);
  assert.match(readme, /`npm run prepare:promotion-follow-up`：对比保存的 baseline 和当前 `npm run snapshot:growth` 输出/);
  assert.match(readme, /`npm run apply:repository-listing`：联网预览 GitHub 远端 description、website、topics 和 Discussions 更新/);
  assert.match(readme, /`npm run stage:release-artifacts`：预览从 GitHub Actions 下载目录整理到平铺 release 目录的复制计划/);
  assert.match(readme, /`npm run publish:release`：联网预览 GitHub Release 发布计划/);
  assert.match(englishReadme, /growth readiness coverage/);
  assert.match(englishReadme, /Run `npm run snapshot:growth` before a visibility push/);
  assert.match(englishReadme, /Run `npm run snapshot:visibility` before opening a visibility-push issue/);
  assert.match(englishReadme, /Run `npm run prepare:visibility-issue` to generate a visibility-push issue draft/);
  assert.match(englishReadme, /Run `npm run prepare:directory-submission` to generate copy-ready external directory listing fields/);
  assert.match(englishReadme, /Run `npm run prepare:homebrew-cask -- --release-dir <release-dir>` to generate a copy-ready Homebrew cask draft/);
  assert.match(englishReadme, /Run `npm run prepare:share-post` to generate a channel-specific release or social post draft/);
  assert.match(englishReadme, /Run `npm run prepare:promotion-follow-up` after a channel follow-up/);
  assert.match(englishReadme, /Run `npm run apply:repository-listing` to preview the GitHub description/);
  assert.match(englishReadme, /Run `npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` to flatten downloaded workflow artifacts/);
  assert.match(englishReadme, /Run `npm run publish:release -- --release-dir <release-dir>` to preview the GitHub Release payload/);
  assert.match(contributing, /`npm run check:growth` keeps the Growth Readiness guide aligned with live listing audits, latest-release audits, baseline metrics, and promotion follow-up evidence/);
  assert.match(contributing, /`npm run snapshot:growth` prints a tracker-ready baseline/);
  assert.match(contributing, /`npm run snapshot:visibility` prints a paste-ready visibility-push report/);
  assert.match(contributing, /`npm run prepare:visibility-issue` generates a visibility-push issue draft/);
  assert.match(contributing, /`npm run prepare:directory-submission` generates copy-ready external directory listing fields/);
  assert.match(contributing, /`npm run prepare:homebrew-cask -- --release-dir <release-dir>` generates a copy-ready Homebrew cask draft/);
  assert.match(contributing, /`npm run prepare:share-post` generates a channel-specific release or social post draft/);
  assert.match(contributing, /`npm run prepare:promotion-follow-up` compares saved baseline and current `npm run snapshot:growth` outputs/);
  assert.match(contributing, /`npm run apply:repository-listing` previews those GitHub repository setting updates/);
  assert.match(contributing, /`npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` flattens downloaded workflow artifacts/);
  assert.match(contributing, /`npm run publish:release -- --release-dir <release-dir>` previews the GitHub Release payload/);
  assert.match(testingGuide, /validates static growth readiness coverage for live listing audits, latest-release audits, baseline metrics, and promotion follow-up evidence/);
  assert.match(testingGuide, /`npm run check:growth` after changing promotion, release announcement, directory submission, maintainer, or growth-measurement guidance/);
  assert.match(testingGuide, /`npm run snapshot:growth` before a visibility push or directory submission/);
  assert.match(testingGuide, /`npm run snapshot:visibility` before opening a visibility-push issue/);
  assert.match(testingGuide, /`npm run prepare:visibility-issue` before filing a promotion task/);
  assert.match(testingGuide, /`npm run prepare:directory-submission` before filling an external app directory form/);
  assert.match(testingGuide, /`npm run prepare:share-post` before posting a release or social update/);
  assert.match(testingGuide, /`npm run prepare:promotion-follow-up` after refreshing `npm run snapshot:growth`/);
  assert.match(testingGuide, /`npm run prepare:homebrew-cask -- --release-dir <release-dir>` after staging and verifying release artifacts/);
  assert.match(testingGuide, /`npm run apply:repository-listing` to dry-run GitHub repository About/);
  assert.match(testingGuide, /`npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` to flatten downloaded GitHub Actions artifacts/);
  assert.match(testingGuide, /`npm run publish:release -- --release-dir <release-dir>` to dry-run the GitHub Release payload/);
  assert.match(docsIndex, /\[Growth Readiness\]\(\.\/growth-readiness\.md\)/);
  assert.match(maintainerPlaybook, /Use the Growth Readiness guide to turn remote audit failures into the next promotion task/);
  assert.match(chineseMaintainerPlaybook, /使用 Growth Readiness 指南把远端 audit 失败项转成下一步推广任务/);
  assert.match(growthGuide, /# Growth Readiness/);
  assert.match(growthGuide, /## Current Remote Blockers/);
  assert.match(growthGuide, /0 stars/);
  assert.match(growthGuide, /no public latest GitHub Release/);
  assert.match(growthGuide, /description, website, topics, and Discussions/);
  assert.match(growthGuide, /## Promotion Sequence/);
  assert.match(growthGuide, /npm run apply:repository-listing/);
  assert.match(growthGuide, /GITHUB_TOKEN=repo_administration_token npm run apply:repository-listing -- --confirm/);
  assert.match(growthGuide, /npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>/);
  assert.match(growthGuide, /npm run publish:release -- --release-dir <release-dir>/);
  assert.match(growthGuide, /GITHUB_TOKEN=repo_contents_token npm run publish:release -- --release-dir <release-dir> --target-commitish <40-character-build-commit-sha> --confirm/);
  assert.match(growthGuide, /npm run check:remote-listing/);
  assert.match(growthGuide, /npm run check:remote-release/);
  assert.match(growthGuide, /npm run snapshot:growth/);
  assert.match(growthGuide, /npm run snapshot:visibility/);
  assert.match(growthGuide, /npm run prepare:visibility-issue/);
  assert.match(growthGuide, /npm run prepare:directory-submission/);
  assert.match(growthGuide, /npm run prepare:share-post -- --channel <channel> --audience <audience> --baseline-file <snapshot-file>/);
  assert.match(growthGuide, /npm run prepare:promotion-follow-up -- --baseline-file <baseline-file> --current-file <current-file> --channel <channel>/);
  assert.match(growthGuide, /npm run prepare:homebrew-cask -- --release-dir <release-dir>/);
  assert.match(growthGuide, /prefilled GitHub new-issue URL/);
  assert.match(growthGuide, /-- --snapshot-file <snapshot-file>/);
  assert.match(growthGuide, /-- --baseline-file <snapshot-file>/);
  assert.match(growthGuide, /paste-ready report/);
  assert.match(growthGuide, /tracker-ready metric deltas/);
  assert.match(growthGuide, /stargazers_count/);
  assert.match(growthGuide, /Directory Submission Tracker/);
  assert.match(growthGuide, /## Evidence to Record/);
  assert.match(growthGuide, /baseline stars, downloads, watchers, and live listing URLs/);
  assert.match(snapshotScript, /Growth metrics snapshot/);
  assert.match(snapshotScript, /Tracker baseline:/);
  assert.match(snapshotScript, /GitHub HTML fallback/);
  assert.match(visibilitySnapshotScript, /Visibility readiness snapshot/);
  assert.match(visibilitySnapshotScript, /Listing blockers/);
  assert.match(visibilitySnapshotScript, /Release blockers/);
  assert.match(visibilitySnapshotScript, /Next actions/);
  assert.match(visibilityIssueScript, /Visibility issue draft/);
  assert.match(visibilityIssueScript, /function buildVisibilityIssuePlan/);
  assert.match(visibilityIssueScript, /visibility_push\.yml/);
  assert.match(visibilityIssueScript, /GitHub issue forms may not prefill custom fields/);
  assert.match(directorySubmissionScript, /Directory submission packet/);
  assert.match(directorySubmissionScript, /function buildDirectorySubmissionPacket/);
  assert.match(homebrewCaskScript, /Homebrew cask preparation/);
  assert.match(homebrewCaskScript, /function buildHomebrewCaskDraft/);
  assert.match(homebrewCaskScript, /verifyReleaseArtifacts/);
  assert.match(homebrewCaskScript, /copy-ready Homebrew cask/);
  assert.match(sharePostScript, /Share post draft/);
  assert.match(sharePostScript, /function buildSharePostDraft/);
  assert.match(sharePostScript, /Do not post until npm run snapshot:visibility reports ready/);
  assert.match(promotionFollowUpScript, /Promotion follow-up/);
  assert.match(promotionFollowUpScript, /function buildPromotionFollowUp/);
  assert.match(promotionFollowUpScript, /Update docs\/directory-submission-tracker.md/);
  assert.match(changelog, /Homebrew cask draft helper for verified staged release artifacts/);
  assert.match(changelog, /share post preparation helper for channel-specific release and social copy/);
  assert.match(changelog, /promotion follow-up helper for tracker-ready growth deltas and evidence notes/);
  assert.match(directorySubmissionScript, /extractDirectorySubmissionCopy/);
  assert.match(directorySubmissionScript, /Do not submit private CHM screenshots/);
  assert.match(checker, /Checks static growth readiness documentation/);
  assert.match(checker, /function verifyGrowthReadiness/);
  assert.match(checker, /Growth readiness check passed/);
  assert.match(checker, /docs\/growth-readiness\.md/);
  assert.match(changelog, /growth readiness guide for turning live repository and release audit failures into promotion tasks/);
  assert.match(changelog, /growth readiness checker for static promotion blockers and evidence coverage/);
  assert.match(changelog, /growth metrics snapshot command for recording promotion baselines/);
  assert.match(changelog, /visibility readiness snapshot command for paste-ready promotion handoffs/);
  assert.match(changelog, /visibility issue preparation helper for ready-to-file promotion tasks/);
  assert.match(changelog, /directory submission preparation helper for copy-ready external listing packets/);
  assert.match(changelog, /repository listing apply helper for token-based GitHub metadata updates/);
  assert.match(changelog, /release artifact staging helper for flattening downloaded GitHub Actions artifacts/);
  assert.match(changelog, /release publish helper for dry-run GitHub Release plans/);
});

test('governance guide makes project decisions predictable for contributors', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const chineseContributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.zh-CN.md'), 'utf-8');
  const issueConfig = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'config.yml'), 'utf-8');
  const codeowners = fs.readFileSync(path.join(projectRoot, '.github', 'CODEOWNERS'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-community-health.js'), 'utf-8');
  const templateChecker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-github-templates.js'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const playbook = fs.readFileSync(path.join(projectRoot, 'docs', 'maintainer-playbook.md'), 'utf-8');
  const checklist = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const governance = fs.readFileSync(path.join(projectRoot, 'docs', 'governance.md'), 'utf-8');
  const chineseGovernance = fs.readFileSync(path.join(projectRoot, 'docs', 'governance.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[Governance Guide\]\(\.\/docs\/governance\.md\)/);
  assert.match(readme, /\[中文治理指南\]\(\.\/docs\/governance\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Governance Guide\]\(\.\/docs\/governance\.md\)/);
  assert.match(englishReadme, /\[Chinese Governance Guide\]\(\.\/docs\/governance\.zh-CN\.md\)/);
  assert.match(contributing, /\[Governance Guide\]\(\.\/docs\/governance\.md\)/);
  assert.match(chineseContributing, /\[中文治理指南\]\(\.\/docs\/governance\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Governance Guide\]\(\.\/governance\.md\)/);
  assert.match(docsIndex, /\[Chinese Governance Guide\]\(\.\/governance\.zh-CN\.md\)/);
  assert.match(playbook, /\[Governance Guide\]\(\.\/governance\.md\)/);
  assert.match(checklist, /\[Governance Guide\]\(\.\/governance\.md\)/);
  assert.match(checklist, /\[Chinese Governance Guide\]\(\.\/governance\.zh-CN\.md\)/);
  assert.match(issueConfig, /Chinese Governance Guide/);
  assert.match(issueConfig, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/governance\.zh-CN\.md/);
  assert.match(codeowners, /\/docs\/governance\.zh-CN\.md @zhongdiandaoda/);
  assert.match(checker, /'docs\/governance\.zh-CN\.md'/);
  assert.match(templateChecker, /Chinese Governance Guide/);
  assert.match(governance, /# Governance/);
  assert.match(governance, /## Maintainer Responsibilities/);
  assert.match(governance, /@zhongdiandaoda owns final project decisions/);
  assert.match(governance, /## Decision Paths/);
  assert.match(governance, /Use GitHub Issues for tracked bugs, compatibility reports, feature requests, documentation improvements, and scoped starter tasks/);
  assert.match(governance, /Use GitHub Discussions for open-ended questions, workflow notes, release feedback, and showcase follow-ups/);
  assert.match(governance, /## Changes That Need Discussion First/);
  assert.match(governance, /cloud sync, hosted document storage, telemetry, CHM authoring, broad cross-platform packaging, signing, notarization, or release distribution changes/);
  assert.match(governance, /## Privacy and Safety Boundaries/);
  assert.match(governance, /Do not ask contributors or users to attach private CHM files, proprietary screenshots, sensitive local paths, or confidential document text/);
  assert.match(governance, /## Review Expectations/);
  assert.match(governance, /small, test-backed, and aligned with the Roadmap and Project Status/);
  assert.match(chineseGovernance, /# CHMReaderLight 中文治理指南/);
  assert.match(chineseGovernance, /\[English Governance Guide\]\(\.\/governance\.md\)/);
  assert.match(chineseGovernance, /## 维护者职责/);
  assert.match(chineseGovernance, /@zhongdiandaoda 负责最终项目决策/);
  assert.match(chineseGovernance, /## 决策路径/);
  assert.match(chineseGovernance, /使用 GitHub Issues 跟踪 bug、兼容性报告、功能请求、文档改进和范围清楚的新手任务/);
  assert.match(chineseGovernance, /使用 GitHub Discussions 处理开放式问题、工作流记录、发版反馈和展示后续/);
  assert.match(chineseGovernance, /## 需要先讨论的变更/);
  assert.match(chineseGovernance, /云同步、托管文档存储、遥测、CHM 创作、广泛的跨平台打包、签名、公证或发行渠道变化/);
  assert.match(chineseGovernance, /## 隐私和安全边界/);
  assert.match(chineseGovernance, /不要要求贡献者或用户在公开 issue、Discussions 或 pull request 中附加私有 CHM 文件/);
  assert.match(chineseGovernance, /## 评审预期/);
  assert.match(chineseGovernance, /小范围、有测试支撑，并与 Roadmap 和 Project Status 保持一致/);
  assert.match(changelog, /governance guide for predictable contributor decisions/);
  assert.match(changelog, /Chinese governance guide for local contributor decision paths/);
});

test('community standards checklist keeps GitHub trust signals aligned', () => {
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const playbook = fs.readFileSync(path.join(projectRoot, 'docs', 'maintainer-playbook.md'), 'utf-8');
  const checklist = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(docsIndex, /\[Community Standards Checklist\]\(\.\/community-standards\.md\)/);
  assert.match(playbook, /\[Community Standards Checklist\]\(\.\/community-standards\.md\)/);
  assert.match(checklist, /# Community Standards Checklist/);
  assert.match(checklist, /## Required Repository Files/);
  assert.match(checklist, /\[README\.md\]\(\.\.\/README\.md\)/);
  assert.match(checklist, /\[LICENSE\]\(\.\.\/LICENSE\)/);
  assert.match(checklist, /\[CODE_OF_CONDUCT\.md\]\(\.\.\/CODE_OF_CONDUCT\.md\)/);
  assert.match(checklist, /\[CONTRIBUTING\.md\]\(\.\.\/CONTRIBUTING\.md\)/);
  assert.match(checklist, /\[SECURITY\.md\]\(\.\.\/SECURITY\.md\)/);
  assert.match(checklist, /\[SUPPORT\.md\]\(\.\.\/SUPPORT\.md\)/);
  assert.match(checklist, /## Interaction Paths/);
  assert.match(checklist, /\.github\/ISSUE_TEMPLATE\/config\.yml/);
  assert.match(checklist, /\.github\/ISSUE_TEMPLATE\/good_first_task\.yml/);
  assert.match(checklist, /\.github\/DISCUSSION_TEMPLATE\/q-a\.yml/);
  assert.match(checklist, /GitHub Discussions/);
  assert.match(checklist, /## Automation and Trust Signals/);
  assert.match(checklist, /\.github\/workflows\/ci\.yml/);
  assert.match(checklist, /\.github\/workflows\/codeql\.yml/);
  assert.match(checklist, /\.github\/workflows\/scorecard\.yml/);
  assert.match(checklist, /\.github\/dependabot\.yml/);
  assert.match(checklist, /OpenSSF Scorecard/);
  assert.match(checklist, /## Review Cadence/);
  assert.match(checklist, /before a visibility push/);
  assert.match(checklist, /CHANGELOG\.md/);
  assert.match(changelog, /community standards checklist for GitHub trust signals/);
});

test('citation metadata helps external references point to the project', () => {
  const citation = fs.readFileSync(path.join(projectRoot, 'CITATION.cff'), 'utf-8');
  const checklist = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(citation, /^cff-version: 1\.2\.0$/m);
  assert.match(citation, /^title: CHMReaderLight$/m);
  assert.match(citation, /^message: If CHMReaderLight helps your offline CHM workflow, please cite the project metadata from this file\.$/m);
  assert.match(citation, /^type: software$/m);
  assert.match(citation, /^repository-code: "https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light"$/m);
  assert.match(citation, /^url: "https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light#readme"$/m);
  assert.match(citation, /^license: MIT$/m);
  assert.match(citation, /^version: "0\.1\.0"$/m);
  assert.match(citation, /family-names: Liu/);
  assert.match(citation, /given-names: Qi/);
  assert.match(citation, /keywords:/);
  assert.match(citation, /- chm-reader/);
  assert.match(citation, /- chm-viewer/);
  assert.match(citation, /- macos-chm-reader/);
  assert.match(citation, /- chm-reader-macos/);
  assert.match(citation, /- html-help/);
  assert.match(citation, /- microsoft-html-help/);
  assert.match(citation, /- offline-docs/);
  assert.match(citation, /- offline-documentation/);
  assert.match(citation, /- offline-reader/);
  assert.match(citation, /- help-viewer/);
  assert.match(citation, /- api-reference/);
  assert.match(citation, /- technical-documentation/);
  assert.match(citation, /- documentation/);
  assert.match(citation, /- macos/);
  assert.match(citation, /- macos-app/);
  assert.match(citation, /- ebook/);
  assert.match(citation, /- reader/);
  assert.match(citation, /abstract: >-/);
  assert.match(citation, /A lightweight offline CHM reader and library for macOS/);
  assert.match(checklist, /\[CITATION\.cff\]\(\.\.\/CITATION\.cff\)/);
  assert.match(checklist, /GitHub can expose citation metadata for external references/);
  assert.match(changelog, /citation metadata for external references/);
  assert.match(changelog, /citation metadata keywords for CHM viewer and offline documentation discovery/);
  assert.match(changelog, /platform-specific CHM reader discovery keywords/);
});

test('quality gate keeps license metadata aligned', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const thirdPartyNotices = fs.readFileSync(path.join(projectRoot, 'THIRD_PARTY_NOTICES.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-license.js'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.equal(packageJson.scripts['check:license'], 'node scripts/check-license.js');
  assert.match(packageJson.scripts.check, /npm run check:license/);
  assert.equal(packageJson.license, 'MIT');
  assert.match(readme, /\[MIT License\]\(\.\/LICENSE\)/);
  assert.match(readme, /`npm run check:license`/);
  assert.match(englishReadme, /\[MIT License\]\(\.\/LICENSE\)/);
  assert.match(englishReadme, /license metadata alignment/);
  assert.match(contributing, /`npm run check:license` keeps LICENSE, package metadata, citation metadata, README license links, community standards, and third-party CHMLib notices aligned/);
  assert.match(testingGuide, /validates license metadata alignment across LICENSE, package metadata, citation metadata, README links, community standards, and third-party CHMLib notices/);
  assert.match(testingGuide, /`npm run check:license` after changing license text, package metadata, citation metadata, README license links, community standards, or third-party dependency notices/);
  assert.match(communityStandards, /\[LICENSE\]\(\.\.\/LICENSE\) keeps the MIT license visible/);
  assert.match(checker, /Checks license metadata alignment/);
  assert.match(checker, /THIRD_PARTY_NOTICES[.]md/);
  assert.match(checker, /LGPL-2[.]1-or-later/);
  assert.match(thirdPartyNotices, /CVE-2025-48172/);
  assert.match(checker, /MIT License/);
  assert.match(checker, /license: MIT/);
  assert.match(checker, /License metadata check passed/);
  assert.match(changelog, /license metadata alignment checker for GitHub trust signals/);
});

test('Copilot instructions guide AI-assisted contributors toward project conventions', () => {
  const instructions = fs.readFileSync(path.join(projectRoot, '.github', 'copilot-instructions.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const checklist = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(instructions, /# Copilot Instructions/);
  assert.match(instructions, /CHMReaderLight is a focused macOS CHM reader/);
  assert.match(instructions, /Prefer small, test-backed changes/);
  assert.match(instructions, /Do not add cloud sync, telemetry, CHM authoring, or broad cross-platform support/);
  assert.match(instructions, /Keep source CHM files local/);
  assert.match(instructions, /Do not request private CHM files, proprietary screenshots, sensitive paths, or confidential document text/);
  assert.match(instructions, /Run `npm test -- --test-name-pattern/);
  assert.match(instructions, /Run `npm run check`/);
  assert.match(instructions, /Update `CHANGELOG\.md`/);
  assert.match(instructions, /\[Architecture Overview\]\(\.\.\/docs\/architecture\.md\)/);
  assert.match(instructions, /\[Testing Guide\]\(\.\.\/docs\/testing\.md\)/);
  assert.match(instructions, /\[Security Model\]\(\.\.\/docs\/security-model\.md\)/);
  assert.match(instructions, /\[Support Guide\]\(\.\.\/SUPPORT\.md\)/);
  assert.match(contributing, /\.github\/copilot-instructions\.md/);
  assert.match(checklist, /\.github\/copilot-instructions\.md/);
  assert.match(changelog, /Copilot instructions for AI-assisted contributors/);
});

test('feature request template gathers focused product feedback', () => {
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const featureTemplate = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'feature_request.yml'), 'utf-8');

  assert.match(support, /feature request issue template/);
  assert.match(contributing, /feature request issue template/);
  assert.match(changelog, /feature request issue template/);
  assert.match(featureTemplate, /name: Feature request/);
  assert.match(featureTemplate, /reader, library, search, packaging, or documentation improvement/);
  assert.match(featureTemplate, /What workflow would this improve\?/);
  assert.match(featureTemplate, /What would you like to happen\?/);
  assert.match(featureTemplate, /Which area is affected\?/);
  assert.match(featureTemplate, /Reader/);
  assert.match(featureTemplate, /Library/);
  assert.match(featureTemplate, /Search/);
  assert.match(featureTemplate, /Packaging/);
  assert.match(featureTemplate, /Documentation/);
  assert.match(featureTemplate, /How would you verify it works\?/);
  assert.match(featureTemplate, /docs\/roadmap\.md/);
  assert.match(featureTemplate, /docs\/project-status\.md/);
  assert.match(featureTemplate, /Check the project status guide for current platform support, release trust notes, and out-of-scope work/);
  assert.match(changelog, /feature request template link to the project status guide/);
});

test('documentation issue template gathers focused docs feedback', () => {
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const triageGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'issue-triage.md'), 'utf-8');
  const listingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'repository-listing.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const docsTemplate = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'documentation.yml'), 'utf-8');

  assert.match(support, /documentation issue template/);
  assert.match(triageGuide, /`documentation`/);
  assert.match(listingGuide, /`documentation`/);
  assert.match(changelog, /documentation issue template/);
  assert.match(docsTemplate, /name: Documentation improvement/);
  assert.match(docsTemplate, /description: Report unclear, missing, outdated, or confusing CHMReaderLight docs/);
  assert.match(docsTemplate, /labels: \["documentation"\]/);
  assert.match(docsTemplate, /Which documentation page needs attention\?/);
  assert.match(docsTemplate, /What should be clearer or updated\?/);
  assert.match(docsTemplate, /Suggested wording or source/);
  assert.match(docsTemplate, /Can you open a pull request for this docs fix\?/);
  assert.match(docsTemplate, /Good First Contributions/);
});

test('performance issue template gathers comparable slow CHM reports', () => {
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const triageGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'issue-triage.md'), 'utf-8');
  const listingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'repository-listing.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const performanceTemplate = fs.readFileSync(
    path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'performance.yml'),
    'utf-8',
  );

  assert.match(support, /performance issue template/);
  assert.match(triageGuide, /`performance`/);
  assert.match(listingGuide, /`performance`/);
  assert.match(changelog, /performance issue template/);
  assert.match(performanceTemplate, /name: Performance report/);
  assert.match(performanceTemplate, /description: Report slow CHM opening, indexing, searching, or library workflows/);
  assert.match(performanceTemplate, /labels: \["performance"\]/);
  assert.match(performanceTemplate, /docs\/benchmarking\.md/);
  assert.match(performanceTemplate, /Which workflow feels slow\?/);
  assert.match(performanceTemplate, /Opening or extracting a CHM/);
  assert.match(performanceTemplate, /Building the search index/);
  assert.match(performanceTemplate, /Searching inside a CHM/);
  assert.match(performanceTemplate, /Filtering or managing a large library/);
  assert.match(performanceTemplate, /Approximate CHM or library size/);
  assert.match(performanceTemplate, /Timing details/);
  assert.match(performanceTemplate, /npm run benchmark:chm/);
  assert.match(performanceTemplate, /Help > Copy Diagnostic Info/);
});

test('CHM compatibility issue template gathers reproducible reports', () => {
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const compatibility = fs.readFileSync(path.join(projectRoot, 'docs', 'compatibility.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const template = fs.readFileSync(
    path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'chm_compatibility.yml'),
    'utf-8',
  );

  assert.match(support, /CHM compatibility issue template/);
  assert.match(contributing, /CHM compatibility issue template/);
  assert.match(compatibility, /CHM compatibility issue template/);
  assert.match(changelog, /CHM compatibility issue template/);
  assert.match(template, /name: CHM compatibility report/);
  assert.match(template, /description: Report a CHM file that opens, renders, navigates, searches, or encodes differently than expected\./);
  assert.match(template, /labels: \["compatibility"\]/);
  assert.match(template, /docs\/compatibility\.md/);
  assert.match(template, /Help > Copy Diagnostic Info/);
  assert.match(template, /id: install-source/);
  assert.match(template, /How did you install or run CHMReaderLight\?/);
  assert.match(template, /GitHub release zip/);
  assert.match(template, /Built locally with npm run package:mac/);
  assert.match(template, /Running from source with npm run run/);
  assert.match(template, /Can this CHM be shared\?/);
  assert.match(template, /Affected area/);
  assert.match(template, /Opening/);
  assert.match(template, /Table of contents/);
  assert.match(template, /Text encoding/);
  assert.match(template, /Search indexing/);
  assert.match(template, /Screenshots or sanitized logs/);
  assert.match(compatibility, /how CHMReaderLight was installed or run/);
  assert.match(changelog, /installation source field in the CHM compatibility template/);
});

test('pull request template guides focused reviews', () => {
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const pullRequestTemplate = fs.readFileSync(path.join(projectRoot, '.github', 'PULL_REQUEST_TEMPLATE.md'), 'utf-8');

  assert.match(contributing, /pull request template/);
  assert.match(contributing, /\[Project Status\]\(\.\/docs\/project-status\.md\)/);
  assert.match(contributing, /Update Project Status when changing platform support, release distribution, trust caveats, or project scope/);
  assert.match(changelog, /pull request template review checklist/);
  assert.match(changelog, /pull request template check for project status changes/);
  assert.match(changelog, /pull request template linked issue guidance/);
  assert.match(changelog, /pull request template benchmark evidence reminder/);
  assert.match(changelog, /pull request template governance reminder/);
  assert.match(changelog, /pull request template accessibility verification reminder/);
  assert.match(pullRequestTemplate, /## Change Type/);
  assert.match(pullRequestTemplate, /- \[ \] User-facing feature/);
  assert.match(pullRequestTemplate, /- \[ \] Bug fix/);
  assert.match(pullRequestTemplate, /- \[ \] Documentation or contributor workflow/);
  assert.match(pullRequestTemplate, /## User Impact/);
  assert.match(pullRequestTemplate, /What workflow gets better, safer, or easier/);
  assert.match(pullRequestTemplate, /## Linked Issue or Discussion/);
  assert.match(pullRequestTemplate, /Link the issue, discussion, or `good first issue` this closes or follows up/);
  assert.match(pullRequestTemplate, /Closes #/);
  assert.match(pullRequestTemplate, /## Screenshots or Recording/);
  assert.match(pullRequestTemplate, /For UI changes, add a screenshot or short recording/);
  assert.match(pullRequestTemplate, /## Review Checklist/);
  assert.match(pullRequestTemplate, /- \[ \] The change stays focused on one user-visible improvement, bug fix, or maintenance task/);
  assert.match(pullRequestTemplate, /- \[ \] User-facing behavior is covered by tests or documented manual verification/);
  assert.match(pullRequestTemplate, /- \[ \] README, docs, or changelog are updated when behavior changes/);
  assert.match(pullRequestTemplate, /- \[ \] Project Status is updated if platform support, release distribution, trust caveats, or project scope changed/);
  assert.match(pullRequestTemplate, /- \[ \] Governance Guide is checked before discussion-first changes such as cloud sync, telemetry, CHM authoring, broad platform support, signing, notarization, or release distribution changes/);
  assert.match(pullRequestTemplate, /- \[ \] Performance-sensitive changes include `npm run benchmark:chm` output or explain why it is not applicable/);
  assert.match(pullRequestTemplate, /- \[ \] Accessibility-sensitive changes include keyboard-only or VoiceOver verification, or explain why it is not applicable/);
  assert.match(pullRequestTemplate, /Manual app check on macOS/);
});

test('CODEOWNERS routes reviews for code docs automation and packaging', () => {
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const codeowners = fs.readFileSync(path.join(projectRoot, '.github', 'CODEOWNERS'), 'utf-8');

  assert.match(codeowners, /# CHMReaderLight review ownership/);
  assert.match(codeowners, /\* @zhongdiandaoda/);
  assert.match(codeowners, /\/src\/ @zhongdiandaoda/);
  assert.match(codeowners, /\/test\/ @zhongdiandaoda/);
  assert.match(codeowners, /\/docs\/ @zhongdiandaoda/);
  assert.match(codeowners, /\/\.github\/workflows\/ @zhongdiandaoda/);
  assert.match(codeowners, /\/\.github\/ISSUE_TEMPLATE\/ @zhongdiandaoda/);
  assert.match(codeowners, /\/\.github\/DISCUSSION_TEMPLATE\/ @zhongdiandaoda/);
  assert.match(codeowners, /\/\.github\/PULL_REQUEST_TEMPLATE\.md @zhongdiandaoda/);
  assert.match(codeowners, /\/\.github\/copilot-instructions\.md @zhongdiandaoda/);
  assert.match(codeowners, /\/\.github\/dependabot\.yml @zhongdiandaoda/);
  assert.match(codeowners, /\/CITATION\.cff @zhongdiandaoda/);
  assert.match(codeowners, /\/CODE_OF_CONDUCT\.md @zhongdiandaoda/);
  assert.match(codeowners, /\/CONTRIBUTING\.md @zhongdiandaoda/);
  assert.match(codeowners, /\/SECURITY\.md @zhongdiandaoda/);
  assert.match(codeowners, /\/SUPPORT\.md @zhongdiandaoda/);
  assert.match(codeowners, /\/scripts\/package-macos\.sh @zhongdiandaoda/);
  assert.match(codeowners, /\/scripts\/install-macos\.sh @zhongdiandaoda/);
  assert.match(changelog, /CODEOWNERS review routing/);
  assert.match(changelog, /CODEOWNERS review routing for community trust files/);
});

test('CI workflow cancels superseded branch runs', () => {
  const ciWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'ci.yml'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(ciWorkflow, /^name: CI$/m);
  assert.match(ciWorkflow, /^  pull_request:$/m);
  assert.match(ciWorkflow, /^  push:$/m);
  assert.match(ciWorkflow, /^concurrency:$/m);
  assert.match(ciWorkflow, /^  group: ci-\$\{\{ github\.workflow \}\}-\$\{\{ github\.ref \}\}$/m);
  assert.match(ciWorkflow, /^  cancel-in-progress: true$/m);
  assert.match(ciWorkflow, /run: npm test/);
  assert.match(ciWorkflow, /run: npm run check/);
  assert.match(changelog, /CI concurrency cancellation for superseded branch runs/);
});

test('GitHub Actions jobs have explicit timeouts', () => {
  const ciWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'ci.yml'), 'utf-8');
  const codeqlWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'codeql.yml'), 'utf-8');
  const dependencyReviewWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'dependency-review.yml'), 'utf-8');
  const releaseWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'release.yml'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(ciWorkflow, /^    timeout-minutes: 15$/m);
  assert.match(codeqlWorkflow, /^    timeout-minutes: 20$/m);
  assert.match(dependencyReviewWorkflow, /^    timeout-minutes: 10$/m);
  assert.match(releaseWorkflow, /^    timeout-minutes: 45$/m);
  assert.match(changelog, /explicit GitHub Actions job timeouts/);
});

test('quality gate keeps GitHub Actions workflows trustworthy', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-workflows.js'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.equal(packageJson.scripts['check:workflows'], 'node scripts/check-workflows.js');
  assert.match(packageJson.scripts.check, /npm run check:workflows/);
  assert.match(readme, /`npm run check:workflows`/);
  assert.match(englishReadme, /GitHub Actions workflow trust checks/);
  assert.match(contributing, /`npm run check:workflows` keeps CI, release, CodeQL, Dependency Review, and Scorecard workflows pinned to the expected trust settings/);
  assert.match(testingGuide, /validates GitHub Actions workflow trust settings for permissions, timeouts, dependency caching, release attestations, and generated release notes/);
  assert.match(testingGuide, /`npm run check:workflows` after changing CI, release, CodeQL, Dependency Review, Scorecard, workflow permissions, timeouts, or setup-node caching/);
  assert.match(communityStandards, /`npm run check:workflows`/);
  assert.match(checker, /Checks GitHub Actions workflow trust settings/);
  assert.match(checker, /function verifyWorkflowTrustSettings/);
  assert.match(checker, /Unpinned action/);
  assert.match(checker, /cache: npm/);
  assert.match(checker, /Unpinned action in/);
  assert.match(checker, /Release attestation job must not receive artifact-metadata: write/);
  assert.match(checker, /existing remote tag commit provenance/);
  assert.match(checker, /Workflow trust check passed/);
  assert.match(changelog, /GitHub Actions workflow trust checker for CI and release reliability/);
});

test('GitHub Actions dependencies are pinned to immutable commit SHAs', () => {
  const workflowsDir = path.join(projectRoot, '.github', 'workflows');
  const unpinnedUses: string[] = [];

  for (const workflowName of fs.readdirSync(workflowsDir).sort()) {
    const workflow = fs.readFileSync(path.join(workflowsDir, workflowName), 'utf-8');
    for (const match of workflow.matchAll(/^\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gm)) {
      if (!/@[a-f0-9]{40}$/.test(match[1])) {
        unpinnedUses.push(`${workflowName}: ${match[1]}`);
      }
    }
  }

  assert.deepEqual(unpinnedUses, []);
});

test('OpenSSF Scorecard workflow surfaces supply-chain posture', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const securityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.md'), 'utf-8');
  const scorecardWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'scorecard.yml'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(readme, /\[!\[OpenSSF Scorecard\]\(https:\/\/api\.scorecard\.dev\/projects\/github\.com\/zhongdiandaoda\/chm-reader-light\/badge\)\]\(https:\/\/scorecard\.dev\/view\/github\.com\/zhongdiandaoda\/chm-reader-light\)/);
  assert.match(englishReadme, /\[!\[OpenSSF Scorecard\]\(https:\/\/api\.scorecard\.dev\/projects\/github\.com\/zhongdiandaoda\/chm-reader-light\/badge\)\]\(https:\/\/scorecard\.dev\/view\/github\.com\/zhongdiandaoda\/chm-reader-light\)/);
  assert.match(scorecardWorkflow, /^name: OpenSSF Scorecard$/m);
  assert.match(scorecardWorkflow, /^  schedule:$/m);
  assert.match(scorecardWorkflow, /cron: '0 3 \* \* 2'/);
  assert.match(scorecardWorkflow, /^  pull_request:$/m);
  assert.match(scorecardWorkflow, /^  push:$/m);
  assert.match(scorecardWorkflow, /^permissions:$/m);
  assert.match(scorecardWorkflow, /^  security-events: write$/m);
  assert.match(scorecardWorkflow, /^  contents: read$/m);
  assert.match(scorecardWorkflow, /^  id-token: write$/m);
  assert.match(scorecardWorkflow, /uses: ossf\/scorecard-action@[a-f0-9]{40} # v2\.4\.2/);
  assert.match(scorecardWorkflow, /results_file: scorecard-results\.sarif/);
  assert.match(scorecardWorkflow, /publish_results: true/);
  assert.match(scorecardWorkflow, /github\/codeql-action\/upload-sarif@[a-f0-9]{40} # v4/);
  assert.match(scorecardWorkflow, /^    timeout-minutes: 20$/m);
  assert.match(securityModel, /\[OpenSSF Scorecard\]\(https:\/\/scorecard\.dev\/view\/github\.com\/zhongdiandaoda\/chm-reader-light\)/);
  assert.match(securityModel, /supply-chain posture/);
  assert.match(changelog, /OpenSSF Scorecard workflow and README badge for supply-chain posture visibility/);
});

test('Dependency Review workflow blocks risky pull request dependency changes', () => {
  const securityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const dependencyReviewWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'dependency-review.yml'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-community-health.js'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(dependencyReviewWorkflow, /^name: Dependency Review$/m);
  assert.match(dependencyReviewWorkflow, /^  pull_request:$/m);
  assert.match(dependencyReviewWorkflow, /^permissions:$/m);
  assert.match(dependencyReviewWorkflow, /^  contents: read$/m);
  assert.match(dependencyReviewWorkflow, /^  pull-requests: write$/m);
  assert.match(dependencyReviewWorkflow, /^    timeout-minutes: 10$/m);
  assert.match(dependencyReviewWorkflow, /uses: actions\/dependency-review-action@[a-f0-9]{40} # v4\.9\.0/);
  assert.match(dependencyReviewWorkflow, /fail-on-severity: moderate/);
  assert.match(dependencyReviewWorkflow, /comment-summary-in-pr: always/);
  assert.match(securityModel, /Dependency Review/);
  assert.match(securityModel, /pull request dependency changes/);
  assert.match(communityStandards, /\.github\/workflows\/dependency-review\.yml/);
  assert.match(communityStandards, /Dependency Review/);
  assert.match(checker, /\.github\/workflows\/dependency-review\.yml/);
  assert.match(checker, /actions\\\/dependency-review-action/);
  assert.match(changelog, /Dependency Review workflow for pull request supply-chain checks/);
});

test('release template stays aligned with release workflow artifacts', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const releaseTemplate = fs.readFileSync(path.join(projectRoot, 'docs', 'release-template.md'), 'utf-8');
  const releaseGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');
  const growthGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'growth-readiness.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-release-template.js'), 'utf-8');
  const stager = fs.readFileSync(path.join(projectRoot, 'scripts', 'stage-release-artifacts.js'), 'utf-8');
  const publisher = fs.readFileSync(path.join(projectRoot, 'scripts', 'publish-release.js'), 'utf-8');
  const releaseBodyPreparer = fs.readFileSync(path.join(projectRoot, 'scripts', 'prepare-release-body.js'), 'utf-8');
  const homebrewCaskScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'prepare-homebrew-cask.js'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.equal(packageJson.scripts['check:release-template'], 'node scripts/check-release-template.js');
  assert.equal(packageJson.scripts['stage:release-artifacts'], 'node scripts/stage-release-artifacts.js');
  assert.equal(packageJson.scripts['prepare:release-body'], 'node scripts/prepare-release-body.js');
  assert.equal(packageJson.scripts['publish:release'], 'node scripts/publish-release.js');
  assert.equal(packageJson.scripts['prepare:homebrew-cask'], 'node scripts/prepare-homebrew-cask.js');
  assert.match(packageJson.scripts.check, /npm run check:release-template/);
  assert.match(readme, /`npm run check:release-template`/);
  assert.match(readme, /`npm run publish:release`：联网预览 GitHub Release 发布计划/);
  assert.match(readme, /`npm run prepare:release-body`：从 Release Page Template 生成指定 tag 的完整 Release 正文/);
  assert.match(readme, /`npm run prepare:homebrew-cask`：从已验证的平铺 release 目录生成可复制的 Homebrew cask 草稿/);
  assert.match(englishReadme, /release page template/);
  assert.match(englishReadme, /Run `npm run publish:release -- --release-dir <release-dir>` to preview the GitHub Release payload/);
  assert.ok(
    englishReadme.includes('Run `npm run prepare:release-body -- --tag v0.1.0 --output dist/release/release-body.md`'),
  );
  assert.match(englishReadme, /Run `npm run prepare:homebrew-cask -- --release-dir <release-dir>` to generate a copy-ready Homebrew cask draft/);
  assert.match(testingGuide, /validates that the GitHub Release page template matches release workflow artifact names, checksum guidance, provenance commands, and first-launch trust notes/);
  assert.match(testingGuide, /`npm run check:release-template` after changing release workflow artifact names, release download guidance, checksum text, attestation commands, or notarization caveats/);
  assert.match(testingGuide, /`npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` to flatten downloaded GitHub Actions artifacts/);
  assert.match(testingGuide, /`npm run publish:release -- --release-dir <release-dir>` to dry-run the GitHub Release payload/);
  assert.match(testingGuide, /`npm run prepare:release-body -- --tag <tag> --output <file>`/);
  assert.match(testingGuide, /`npm run prepare:homebrew-cask -- --release-dir <release-dir>` after staging and verifying release artifacts/);
  assert.match(releaseTemplate, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(releaseTemplate, /CHMReaderLight-mac-x64\.zip/);
  assert.match(releaseTemplate, /CHMReaderLight-mac-arm64\.zip\.sha256/);
  assert.match(releaseTemplate, /CHMReaderLight-mac-x64\.zip\.sha256/);
  assert.match(releaseTemplate, /gh attestation verify CHMReaderLight-mac-arm64\.zip --repo zhongdiandaoda\/chm-reader-light/);
  assert.match(releaseTemplate, /gh attestation verify CHMReaderLight-mac-x64\.zip --repo zhongdiandaoda\/chm-reader-light/);
  assert.match(releaseTemplate, /not Apple-notarized yet/);
  assert.match(releaseTemplate, /npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>/);
  assert.match(releaseGuide, /npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>/);
  assert.match(releaseTemplate, /npm run publish:release -- --release-dir <release-dir>/);
  assert.match(releaseGuide, /npm run publish:release -- --release-dir <release-dir>/);
  assert.match(growthGuide, /npm run prepare:homebrew-cask -- --release-dir <release-dir>/);
  assert.match(growthGuide, /GITHUB_TOKEN=repo_contents_token npm run publish:release -- --release-dir <release-dir> --target-commitish <40-character-build-commit-sha> --confirm/);
  assert.match(releaseTemplate, /release-feedback Discussion/);
  assert.match(releaseTemplate, /what would make this release easier to trust, star, watch, or share/);
  assert.match(checker, /extractReleaseArtifactNames/);
  assert.match(checker, /check-release-artifacts/);
  assert.match(checker, /node scripts\/publish-release[.]js --release-dir dist\/release/);
  assert.doesNotMatch(checker, /release workflow draft-first publish command/);
  assert.match(checker, /stage:release-artifacts/);
  assert.match(checker, /stage-release-artifacts verification wiring/);
  assert.match(checker, /publish:release/);
  assert.match(checker, /publish-release artifact verification wiring/);
  assert.match(checker, /release feedback Discussion CTA/);
  assert.match(checker, /Release template check passed/);
  assert.match(stager, /Stages downloaded GitHub Actions artifacts into the flat directory expected by release checks/);
  assert.match(stager, /function buildReleaseArtifactStagePlan/);
  assert.match(stager, /verifyReleaseArtifacts/);
  assert.match(stager, /Dry run only/);
  assert.match(publisher, /Publishes a GitHub Release only when explicitly confirmed/);
  assert.match(publisher, /function buildReleasePublishPlan/);
  assert.match(releaseBodyPreparer, /function writeReleaseBody/);
  assert.match(releaseBodyPreparer, /extractReleaseBodyTemplate/);
  assert.match(releaseBodyPreparer, /buildReleaseBody/);
  assert.match(homebrewCaskScript, /Prepares copy-ready Homebrew cask text from a verified staged release directory/);
  assert.match(homebrewCaskScript, /function buildHomebrewCaskDraft/);
  assert.match(homebrewCaskScript, /brew audit --cask chmreaderlight/);
  assert.match(publisher, /verifyReleaseArtifacts/);
  assert.match(publisher, /GITHUB_TOKEN is required when using --confirm/);
  assert.match(publisher, /Dry run only/);
  assert.match(changelog, /release template consistency checker for workflow artifact names and trust guidance/);
  assert.match(changelog, /release page template now asks trial users for release feedback before promotion/);
  assert.match(changelog, /release artifact staging helper for flattening downloaded GitHub Actions artifacts/);
  assert.match(changelog, /release publish helper for dry-run GitHub Release plans/);
});

test('compatibility notes set expectations for supported CHM files', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const chineseSupport = fs.readFileSync(path.join(projectRoot, 'SUPPORT.zh-CN.md'), 'utf-8');
  const troubleshooting = fs.readFileSync(path.join(projectRoot, 'docs', 'troubleshooting.md'), 'utf-8');
  const chineseTroubleshooting = fs.readFileSync(path.join(projectRoot, 'docs', 'troubleshooting.zh-CN.md'), 'utf-8');
  const chineseFaq = fs.readFileSync(path.join(projectRoot, 'docs', 'faq.zh-CN.md'), 'utf-8');
  const chineseGettingStarted = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.zh-CN.md'), 'utf-8');
  const chineseFeatureTour = fs.readFileSync(path.join(projectRoot, 'docs', 'feature-tour.zh-CN.md'), 'utf-8');
  const chineseUseCases = fs.readFileSync(path.join(projectRoot, 'docs', 'use-cases.zh-CN.md'), 'utf-8');
  const chineseComparison = fs.readFileSync(path.join(projectRoot, 'docs', 'comparison.zh-CN.md'), 'utf-8');
  const chineseAdoptionGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'adoption-checklist.zh-CN.md'), 'utf-8');
  const roadmap = fs.readFileSync(path.join(projectRoot, 'docs', 'roadmap.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const compatibility = fs.readFileSync(path.join(projectRoot, 'docs', 'compatibility.md'), 'utf-8');
  const chineseCompatibility = fs.readFileSync(path.join(projectRoot, 'docs', 'compatibility.zh-CN.md'), 'utf-8');

  assert.match(readme, /\[Compatibility Notes\]\(\.\/docs\/compatibility\.md\)/);
  assert.match(readme, /\[中文兼容性说明\]\(\.\/docs\/compatibility\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Compatibility Notes\]\(\.\/docs\/compatibility\.md\)/);
  assert.match(englishReadme, /\[Chinese Compatibility Notes\]\(\.\/docs\/compatibility\.zh-CN\.md\)/);
  assert.match(troubleshooting, /\[Compatibility Notes\]\(\.\/compatibility\.md\)/);
  assert.match(chineseSupport, /\[中文兼容性说明\]\(\.\/docs\/compatibility\.zh-CN\.md\)/);
  assert.match(chineseTroubleshooting, /\[中文兼容性说明\]\(\.\/compatibility\.zh-CN\.md\)/);
  assert.match(chineseFaq, /\[中文兼容性说明\]\(\.\/compatibility\.zh-CN\.md\)/);
  assert.match(chineseGettingStarted, /\[中文兼容性说明\]\(\.\/compatibility\.zh-CN\.md\)/);
  assert.match(chineseFeatureTour, /\[中文兼容性说明\]\(\.\/compatibility\.zh-CN\.md\)/);
  assert.match(chineseUseCases, /\[中文兼容性说明\]\(\.\/compatibility\.zh-CN\.md\)/);
  assert.match(chineseComparison, /\[中文兼容性说明\]\(\.\/compatibility\.zh-CN\.md\)/);
  assert.match(chineseAdoptionGuide, /\[中文兼容性说明\]\(\.\/compatibility\.zh-CN\.md\)/);
  assert.match(roadmap, /\[Compatibility Notes\]\(\.\/compatibility\.md\)/);
  assert.match(docsIndex, /\[Chinese Compatibility Notes\]\(\.\/compatibility\.zh-CN\.md\)/);
  assert.match(changelog, /compatibility notes/);
  assert.match(changelog, /Chinese compatibility notes for localized CHM support expectations/);
  assert.match(compatibility, /## Expected to Work/);
  assert.match(compatibility, /## Known Limits/);
  assert.match(compatibility, /## Encoding Guidance/);
  assert.match(compatibility, /## Reporting Gaps/);
  assert.match(compatibility, /\.hhc table of contents/);
  assert.match(compatibility, /legacy encodings/);
  assert.match(compatibility, /CHM-authored scripts, inline event handlers, form submissions, plugin objects, network connections, popups, and nested frames are blocked/);
  assert.match(compatibility, /nonce-protected navigation bridge/);
  assert.match(compatibility, /Help > Copy Diagnostic Info/);
  assert.match(chineseCompatibility, /# CHMReaderLight 中文兼容性说明/);
  assert.match(chineseCompatibility, /\[English Compatibility Notes\]\(\.\/compatibility\.md\)/);
  assert.match(chineseCompatibility, /## 预期可用/);
  assert.match(chineseCompatibility, /## 已知限制/);
  assert.match(chineseCompatibility, /## 编码建议/);
  assert.match(chineseCompatibility, /## 报告兼容性缺口/);
  assert.match(chineseCompatibility, /\.hhc table of contents/);
  assert.match(chineseCompatibility, /legacy encodings/);
  assert.match(chineseCompatibility, /CHM 自带脚本、inline event handlers、表单提交、plugin objects、网络连接、弹窗和嵌套 frame 会被阻止/);
  assert.match(chineseCompatibility, /nonce-protected navigation bridge/);
  assert.match(chineseCompatibility, /Help > Copy Diagnostic Info/);
});

test('FAQ answers common evaluation and support questions', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const chineseSupport = fs.readFileSync(path.join(projectRoot, 'SUPPORT.zh-CN.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const troubleshooting = fs.readFileSync(path.join(projectRoot, 'docs', 'troubleshooting.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const faq = fs.readFileSync(path.join(projectRoot, 'docs', 'faq.md'), 'utf-8');
  const chineseFaq = fs.readFileSync(path.join(projectRoot, 'docs', 'faq.zh-CN.md'), 'utf-8');

  assert.match(readme, /\[FAQ\]\(\.\/docs\/faq\.md\)/);
  assert.match(readme, /\[中文 FAQ\]\(\.\/docs\/faq\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Chinese FAQ\]\(\.\/docs\/faq\.zh-CN\.md\)/);
  assert.match(chineseSupport, /\[中文 FAQ\]\(\.\/docs\/faq\.zh-CN\.md\)/);
  assert.match(contributing, /\[FAQ\]\(\.\/docs\/faq\.md\)/);
  assert.match(troubleshooting, /\[FAQ\]\(\.\/faq\.md\)/);
  assert.match(docsIndex, /\[Chinese FAQ\]\(\.\/faq\.zh-CN\.md\)/);
  assert.match(changelog, /FAQ for download, notarization, privacy, compatibility, cache, and bug-report questions/);
  assert.match(changelog, /Chinese FAQ for localized download, privacy, compatibility, and support answers/);
  assert.match(faq, /## Which macOS versions are supported\?/);
  assert.match(faq, /## Does CHMReaderLight support Windows or Linux\?/);
  assert.match(faq, /No\. CHMReaderLight currently focuses on macOS 12 or later/);
  assert.match(faq, /Windows, Linux, iOS, and iPadOS packages are not supported release targets yet/);
  assert.match(faq, /\[Project Status\]\(\.\/project-status\.md\)/);
  assert.match(faq, /## Can I use CHMReaderLight at work or in a company environment\?/);
  assert.match(faq, /CHMReaderLight is distributed under the MIT License, which permits use, copying, modification, publishing, distribution, sublicensing, and selling under the license terms/);
  assert.match(faq, /Review \[LICENSE\]\(\.\.\/LICENSE\) with your organization if you need legal approval for work-owned devices, internal manuals, or redistributed builds/);
  assert.match(faq, /## Which download should I choose\?/);
  assert.match(faq, /## How do I verify a release download\?/);
  assert.match(faq, /## How do I update CHMReaderLight\?/);
  assert.match(faq, /Download the newer release for your Mac architecture, unzip it, and replace the existing `CHMReaderLight\.app`/);
  assert.match(faq, /Library metadata, reader preferences, and extracted cache live in the app data folder, so replacing the app bundle does not remove your saved library state/);
  assert.match(faq, /## Does CHMReaderLight check for updates automatically\?/);
  assert.match(faq, /No\. CHMReaderLight does not include an automatic updater, background update checks, telemetry, or release polling/);
  assert.match(faq, /Use GitHub Releases or watch the repository when you want to check for newer packaged builds/);
  assert.match(faq, /## Does CHMReaderLight have a fixed release cadence\?/);
  assert.match(faq, /No fixed cadence is promised yet\. Releases are cut when there is a tested user-facing improvement, packaging fix, security or dependency update, or documentation and support improvement worth publishing/);
  assert.match(faq, /Watch GitHub Releases for packaged builds, and review the changelog before updating if you depend on CHMReaderLight for work documentation/);
  assert.match(faq, /## Does CHMReaderLight include analytics or crash reporting\?/);
  assert.match(faq, /No\. CHMReaderLight does not include analytics, telemetry, crash reporting, accounts, cloud sync, or hosted document storage/);
  assert.match(faq, /Project links such as GitHub Releases, Issues, Discussions, and documentation open in your browser only when you choose them/);
  assert.match(faq, /If you find unexpected data access or network behavior, follow the private reporting guidance in \[Security Policy\]\(\.\.\/SECURITY\.md\)/);
  assert.match(faq, /## Can I build or run CHMReaderLight from source\?/);
  assert.match(faq, /Yes\. Use Node\.js 22 or later, run `npm install`, then `npm run doctor` and `npm run run` for a local development launch/);
  assert.match(faq, /Run `npm run check` and `npm test` before opening a pull request/);
  assert.match(faq, /Local source runs need a system CHMLib; macOS packaging builds the pinned patched source itself/);
  assert.match(faq, /## Do I need to install CHMLib separately\?/);
  assert.match(faq, /No for packaged builds\. The macOS release zip includes the native `extract_chmLib` helper, dynamic `libchm` dependency, corresponding source, license, security patch, and provenance inside `CHMReaderLight\.app`/);
  assert.match(faq, /Local development runs still need CHMLib installed, but self-packaging builds the pinned patched source automatically/);
  assert.match(faq, /## Does the app copy or upload my CHM files\?/);
  assert.match(faq, /## Does CHMReaderLight modify my original CHM files\?/);
  assert.match(faq, /No\. CHMReaderLight reads source CHM files and writes its own library metadata, reader preferences, and extracted cache under the app data folder/);
  assert.match(faq, /It does not write bookmarks, search indexes, cache files, or repaired content back into the original `.chm` file/);
  assert.match(faq, /## Where does CHMReaderLight store app data\?/);
  assert.match(faq, /Library metadata is stored in Electron's app data directory as `library\/library\.json`/);
  assert.match(faq, /Extracted CHM contents are cached under `extracted-books\/`, and reader preferences such as zoom, text encoding, sidebar state, search scope, and last-read topic use browser `localStorage`/);
  assert.match(faq, /Successfully opened CHM paths may also appear in the macOS recent documents menu/);
  assert.match(faq, /\[Privacy and Local Data\]\(\.\/privacy\.md\)/);
  assert.match(faq, /## Can I back up or move my library to another Mac\?/);
  assert.match(faq, /Use \*\*Help > Reveal App Data Folder\*\* to inspect `library\/library\.json` and the extracted cache before making a backup/);
  assert.match(faq, /The library stores source CHM file paths, so copied metadata only works when the same CHM files are reachable at the saved paths on the other Mac/);
  assert.match(faq, /If paths change, reconnect the files with the relink action or add the CHM files again/);
  assert.match(faq, /## Can I use CHMReaderLight without an internet connection\?/);
  assert.match(faq, /## Will removing CHMReaderLight delete my CHM files\?/);
  assert.match(faq, /No\. Deleting `CHMReaderLight\.app` removes the application bundle only; source CHM files stay in their original folders/);
  assert.match(faq, /Use \*\*Help > Reveal App Data Folder\*\* before removing the app if you also want to inspect or delete saved library metadata, reader preferences, or extracted cache files/);
  assert.match(faq, /## How can I support CHMReaderLight if it helps me\?/);
  assert.match(faq, /Star the repository from GitHub or use \*\*Help > Star on GitHub\*\* so other macOS CHM users can find it/);
  assert.match(faq, /Use \*\*Help > Copy Share Text\*\* when you want a ready-made bilingual summary with release, star, feedback, and showcase links/);
  assert.match(faq, /Share a safe workflow story with the showcase issue template when CHMReaderLight improves your offline CHM reading setup/);
  assert.match(faq, /\[release-feedback Discussion\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\/new\?category=release-feedback\)/);
  assert.match(faq, /Use GitHub Discussions for open-ended workflow notes/);
  assert.match(faq, /when release details would make the app easier to trust, star, watch, or share/);
  assert.match(faq, /Installed users can choose \*\*Help > Report or Request\*\* for issue-template, release-feedback, and showcase routes/);
  assert.match(faq, /## Can I keep CHM files on an external drive or cloud-synced folder\?/);
  assert.match(faq, /Yes, as long as macOS can still reach the same source file path when you open the library entry/);
  assert.match(faq, /If the drive is disconnected, the cloud file is online-only, or the path changes, the saved entry appears missing until you reconnect the location or relink the CHM/);
  assert.match(faq, /## Will large CHM files or big libraries be slow\?/);
  assert.match(faq, /Large CHM files can take longer to extract and build the first search index/);
  assert.match(faq, /Reopening a previously extracted book should usually be faster because extracted contents are cached/);
  assert.match(faq, /For repeatable measurements, use the \[Benchmarking Guide\]\(\.\/benchmarking\.md\) or run `npm run benchmark:chm`/);
  assert.match(faq, /When filing a performance report, include safe CHM or library size details, measured timing, install source, and \*\*Help > Copy Diagnostic Info\*\*/);
  assert.match(faq, /## Can I open CHM files from Finder or the command line\?/);
  assert.match(faq, /Yes\. Packaged macOS builds declare the `.chm` document type, so you can use Finder's Open With menu after installing CHMReaderLight/);
  assert.match(faq, /Opening a `.chm` from Finder or passing one on the command line adds it to the library and opens the reader/);
  assert.match(faq, /If the app is already running, the existing window is focused and the requested CHM opens there/);
  assert.match(faq, /## Why does a CHM open without a table of contents\?/);
  assert.match(faq, /## Can CHMReaderLight open password-protected or encrypted CHM files\?/);
  assert.match(faq, /Not reliably\. Password-protected, encrypted, corrupt, or partially extracted CHM files may fail before CHMReaderLight can parse metadata or render pages/);
  assert.match(faq, /Use a standard extractable CHM file, or include safe reproduction details in a CHM compatibility report/);
  assert.match(faq, /## Does CHMReaderLight support Chinese, Japanese, or Korean CHM files\?/);
  assert.match(faq, /Yes, when the CHM can be extracted and rendered with a supported text encoding/);
  assert.match(faq, /Try `GBK`, `GB18030`, `BIG5`, `Shift-JIS`, `EUC-JP`, or `EUC-KR` from the reader text encoding menu if text looks garbled/);
  assert.match(faq, /For unresolved encoding gaps, include the CHM language, selected encoding, smallest reproduction steps, and \*\*Help > Copy Diagnostic Info\*\* in a compatibility report/);
  assert.match(faq, /## Why are scripts and forms disabled\?/);
  assert.match(faq, /## How do I reset cached extracted content\?/);
  assert.match(faq, /## What accessibility support is available today\?/);
  assert.match(faq, /CHMReaderLight supports keyboard-driven library and reader workflows through the documented shortcuts, visible focus states, labeled controls, and polite status announcements for search and library changes/);
  assert.match(faq, /VoiceOver and other assistive technology feedback is welcome as focused bug reports, especially when a specific CHM, control, or navigation path is hard to use/);
  assert.match(faq, /## Does CHMReaderLight support dark mode or high-contrast themes\?/);
  assert.match(faq, /CHMReaderLight currently uses a light appearance and does not include separate dark-mode or high-contrast theme switches/);
  assert.match(faq, /If a color, contrast, or system-appearance issue makes real CHM reading harder, open a focused accessibility or usability report with your macOS appearance setting and a safe screenshot if possible/);
  assert.match(faq, /## Where can I find keyboard shortcuts\?/);
  assert.match(faq, /## What does Copy Diagnostic Info include\?/);
  assert.match(faq, /It copies the CHMReaderLight app version, Electron version, Node.js version, platform, CPU architecture, and macOS release/);
  assert.match(faq, /It does not copy CHM document text, library entries, source file paths, screenshots, or extracted cache contents/);
  assert.match(faq, /## Do I need to attach my CHM file or screenshots when reporting a problem\?/);
  assert.match(faq, /No\. Public issues should not include private CHM files, proprietary screenshots, sensitive local paths, or confidential document text/);
  assert.match(faq, /Share safe details such as CHM language, approximate size, affected area, reproduction steps, and whether a sample can be shared publicly or privately/);
  assert.match(faq, /Redact screenshots, logs, copied error text, and diagnostic output before posting/);
  assert.match(faq, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(faq, /CHMReaderLight-mac-x64\.zip/);
  assert.match(faq, /shasum -a 256 -c CHMReaderLight-mac-arm64\.zip\.sha256/);
  assert.match(faq, /gh attestation verify CHMReaderLight-mac-arm64\.zip --repo zhongdiandaoda\/chm-reader-light/);
  assert.match(faq, /\[Keyboard Shortcuts\]\(\.\/shortcuts\.md\)/);
  assert.match(faq, /Help > Copy Diagnostic Info/);
  assert.match(chineseFaq, /# 常见问题/);
  assert.match(chineseFaq, /\[English FAQ\]\(\.\/faq\.md\)/);
  assert.match(chineseFaq, /## 支持哪些 macOS 版本？/);
  assert.match(chineseFaq, /macOS 12 或更高版本/);
  assert.match(chineseFaq, /## 应该下载哪个文件？/);
  assert.match(chineseFaq, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(chineseFaq, /CHMReaderLight-mac-x64\.zip/);
  assert.match(chineseFaq, /## 如何校验下载文件？/);
  assert.match(chineseFaq, /shasum -a 256 -c CHMReaderLight-mac-arm64\.zip\.sha256/);
  assert.match(chineseFaq, /gh attestation verify CHMReaderLight-mac-arm64\.zip --repo zhongdiandaoda\/chm-reader-light/);
  assert.match(chineseFaq, /## CHMReaderLight 会上传或复制我的 CHM 文件吗？/);
  assert.match(chineseFaq, /不会。书库只保存源文件路径和 metadata/);
  assert.match(chineseFaq, /## 可以离线使用吗？/);
  assert.match(chineseFaq, /打开本地 CHM、浏览书库、搜索已索引内容和恢复阅读偏好都可以离线完成/);
  assert.match(chineseFaq, /## 如何支持 CHMReaderLight？/);
  assert.match(chineseFaq, /Star the repository/);
  assert.match(chineseFaq, /Help > Star on GitHub/);
  assert.match(chineseFaq, /需要转发项目时，可以使用 \*\*Help > Copy Share Text\*\* 复制包含 release、star、反馈和 showcase 链接的中英双语摘要/);
  assert.match(chineseFaq, /\[release-feedback Discussion\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\/new\?category=release-feedback\)/);
  assert.match(chineseFaq, /已安装应用的用户可以使用 \*\*Help > Report or Request\*\* 选择 issue template、release feedback 和 showcase 路径/);
  assert.match(chineseFaq, /## 报告问题时需要上传 CHM 文件或截图吗？/);
  assert.match(chineseFaq, /不要在公开 issue 中上传私有 CHM 文件、专有截图、敏感路径或保密文档文本/);
  assert.match(chineseFaq, /\[中文 macOS 安装指南\]\(\.\/install-macos\.zh-CN\.md\)/);
  assert.match(chineseFaq, /\[中文支持指南\]\(\.\.\/SUPPORT\.zh-CN\.md\)/);
  assert.match(chineseFaq, /Help > Copy Diagnostic Info/);
  assert.match(changelog, /FAQ download verification answer with checksum and attestation commands/);
  assert.match(changelog, /FAQ offline-use answer for privacy-sensitive readers/);
  assert.match(changelog, /FAQ app-removal answer clarifying that deleting the app does not delete source CHM files/);
  assert.match(changelog, /FAQ platform-scope answer for Windows and Linux visitors/);
  assert.match(changelog, /FAQ packaged-release dependency answer for CHMLib installation expectations/);
  assert.match(changelog, /FAQ diagnostic-info privacy answer for issue reporters/);
  assert.match(changelog, /FAQ external-drive and cloud-folder answer for portable CHM collections/);
  assert.match(changelog, /FAQ source-file write-back answer for cautious CHM owners/);
  assert.match(changelog, /FAQ app-data storage answer for privacy reviewers/);
  assert.match(changelog, /FAQ library backup and move answer for multi-Mac evaluators/);
  assert.match(changelog, /FAQ work-use license answer for company evaluators/);
  assert.match(changelog, /FAQ update-path answer for existing macOS users/);
  assert.match(changelog, /FAQ automatic-update privacy answer for release watchers/);
  assert.match(changelog, /FAQ release-cadence answer for repository watchers and work users/);
  assert.match(changelog, /FAQ analytics and crash-reporting privacy answer for trust review/);
  assert.match(changelog, /FAQ source-build answer for technical evaluators/);
  assert.match(changelog, /FAQ Finder and command-line opening answer for macOS evaluators/);
  assert.match(changelog, /FAQ safe public reporting answer for private CHM owners/);
  assert.match(changelog, /FAQ protected and corrupt CHM answer for compatibility triage/);
  assert.match(changelog, /FAQ legacy-language encoding answer for CJK CHM evaluators/);
  assert.match(changelog, /FAQ performance expectation answer for large CHM and library reports/);
  assert.match(changelog, /FAQ support-path answer for stars, showcase stories, and Discussions/);
  assert.match(changelog, /FAQ support answers now mention Help > Copy Share Text for project sharing/);
  assert.match(changelog, /FAQ support-path answers now mention the in-app Help > Report or Request routing/);
  assert.match(changelog, /FAQ accessibility expectations answer for keyboard and assistive technology evaluators/);
  assert.match(changelog, /FAQ appearance support answer for dark-mode and contrast expectations/);
});

test('keyboard shortcuts are documented and wired to reader commands', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const chineseGettingStarted = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.zh-CN.md'), 'utf-8');
  const chineseFaq = fs.readFileSync(path.join(projectRoot, 'docs', 'faq.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const shortcuts = fs.readFileSync(path.join(projectRoot, 'docs', 'shortcuts.md'), 'utf-8');
  const chineseShortcuts = fs.readFileSync(path.join(projectRoot, 'docs', 'shortcuts.zh-CN.md'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(readme, /\[Keyboard Shortcuts\]\(\.\/docs\/shortcuts\.md\)/);
  assert.match(readme, /\[中文快捷键指南\]\(\.\/docs\/shortcuts\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Chinese Keyboard Shortcuts\]\(\.\/docs\/shortcuts\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Chinese Keyboard Shortcuts\]\(\.\/shortcuts\.zh-CN\.md\)/);
  assert.match(chineseGettingStarted, /\[中文快捷键指南\]\(\.\/shortcuts\.zh-CN\.md\)/);
  assert.match(chineseFaq, /\[中文快捷键指南\]\(\.\/shortcuts\.zh-CN\.md\)/);
  assert.match(changelog, /keyboard shortcuts guide/);
  assert.match(changelog, /Chinese keyboard shortcuts guide for localized menu and reader navigation reference/);
  assert.match(shortcuts, /## Global/);
  assert.match(shortcuts, /## Reader/);
  assert.match(shortcuts, /`Command\+O`/);
  assert.match(shortcuts, /`Shift\+Command\+C`/);
  assert.match(shortcuts, /Copy reusable project share text with release, star, feedback, and showcase links/);
  assert.match(shortcuts, /`Command\+\[`/);
  assert.match(shortcuts, /`Command\+Down`/);
  assert.match(shortcuts, /`Command\+B`/);
  assert.match(shortcuts, /`Command\+0`/);
  assert.match(shortcuts, /`Command\+G`/);
  assert.match(shortcuts, /`Shift\+Command\+G`/);
  assert.match(shortcuts, /Help > Keyboard Shortcuts/);
  assert.match(chineseShortcuts, /# CHMReaderLight 中文快捷键指南/);
  assert.match(chineseShortcuts, /\[English Keyboard Shortcuts\]\(\.\/shortcuts\.md\)/);
  assert.match(chineseShortcuts, /## 全局/);
  assert.match(chineseShortcuts, /`Command\+O`/);
  assert.match(chineseShortcuts, /添加一个或多个 CHM 文件/);
  assert.match(chineseShortcuts, /`Command\+F`/);
  assert.match(chineseShortcuts, /聚焦当前视图的搜索框/);
  assert.match(chineseShortcuts, /`Shift\+Command\+C`/);
  assert.match(chineseShortcuts, /复制包含 release、star、反馈和 showcase 链接的项目分享文案/);
  assert.match(chineseShortcuts, /## 阅读器/);
  assert.match(chineseShortcuts, /`Command\+\[`/);
  assert.match(chineseShortcuts, /`Command\+Down`/);
  assert.match(chineseShortcuts, /`Command\+B`/);
  assert.match(chineseShortcuts, /`Command\+0`/);
  assert.match(chineseShortcuts, /`Command\+G`/);
  assert.match(chineseShortcuts, /`Shift\+Command\+G`/);
  assert.match(chineseShortcuts, /## 菜单和对话框/);
  assert.match(chineseShortcuts, /Search scope menu/);
  assert.match(chineseShortcuts, /Help > Keyboard Shortcuts/);
  assert.match(main, /shortcuts: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/shortcuts\.md'/);
  assert.match(main, /label: 'Keyboard Shortcuts'/);
  assert.match(main, /shell\.openExternal\(projectLinks\.shortcuts\)/);
  assert.match(main, /label: 'Copy Share Text',\n      accelerator: 'Shift\+CmdOrCtrl\+C'/);
  assert.match(main, /label: 'Find Next'/);
  assert.match(main, /accelerator: 'CmdOrCtrl\+G'/);
  assert.match(main, /sendToMainWindow\('reader:shortcut', 'find-next'\)/);
  assert.match(main, /label: 'Find Previous'/);
  assert.match(main, /accelerator: 'Shift\+CmdOrCtrl\+G'/);
  assert.match(main, /sendToMainWindow\('reader:shortcut', 'find-previous'\)/);
  assert.match(main, /accelerator: 'CmdOrCtrl\+\['/);
  assert.match(main, /sendToMainWindow\('reader:shortcut', 'history-back'\)/);
  assert.match(main, /accelerator: 'CmdOrCtrl\+Down'/);
  assert.match(main, /sendToMainWindow\('reader:shortcut', 'next-topic'\)/);
  assert.match(main, /label: 'Toggle Sidebar'/);
  assert.match(main, /accelerator: 'CmdOrCtrl\+B'/);
  assert.match(main, /sendToMainWindow\('reader:shortcut', 'toggle-sidebar'\)/);
  assert.match(main, /accelerator: 'CmdOrCtrl\+Plus'/);
  assert.match(main, /sendToMainWindow\('reader:shortcut', 'zoom-in'\)/);
  assert.match(preload, /onReaderShortcut: \(callback: \(command: ReaderShortcutCommand\) => void\) => Unsubscribe/);
  assert.match(preload, /ipcRenderer\.on\('reader:shortcut', listener\)/);
  assert.match(renderer, /type ReaderShortcutCommand =/);
  assert.match(renderer, /function runReaderShortcut\(command: ReaderShortcutCommand\): void/);
  assert.match(renderer, /case 'history-back':\n      moveHistory\(-1\);/);
  assert.match(renderer, /case 'next-topic':\n      movePage\(1\);/);
  assert.match(renderer, /case 'find-next':\n      moveSearchMatch\(1\);/);
  assert.match(renderer, /case 'find-previous':\n      moveSearchMatch\(-1\);/);
  assert.match(renderer, /case 'toggle-sidebar':\n      toggleReaderSidebar\(\);/);
  assert.match(renderer, /function toggleReaderSidebar\(\): void/);
  assert.match(renderer, /case 'zoom-reset':\n      setZoom\(1, true\);/);
  assert.match(renderer, /function isEditableShortcutTarget\(target: EventTarget \| null\): boolean/);
  assert.match(renderer, /window\.chmReader\.onReaderShortcut\(runReaderShortcut\)/);
  assert.match(preload, /\| 'find-next'/);
  assert.match(preload, /\| 'find-previous'/);
  assert.match(preload, /\| 'toggle-sidebar'/);
  assert.match(changelog, /Toggle Sidebar shortcut for the reader table of contents/);
  assert.match(changelog, /Find Next and Find Previous shortcuts for reader search matches/);
  assert.match(changelog, /keyboard shortcut for copying reusable project share text/);
});

test('reader toolbar shows the current topic position', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(html, /<output class="toolbar-meta reader-progress" id="reader-progress" aria-live="polite" hidden><\/output>/);
  assert.match(renderer, /readerProgress: query\('#reader-progress'\)/);
  assert.match(renderer, /function updateReaderProgress\(currentIndex: number\): void/);
  assert.match(renderer, /elements\.readerProgress\.textContent = currentIndex >= 0\s*\?\s*`第 \$\{currentIndex \+ 1\} \/ \$\{readingOrder\.length\} 节`\s*:\s*''/);
  assert.match(renderer, /elements\.readerProgress\.hidden = currentIndex < 0 \|\| readingOrder\.length === 0/);
  assert.match(renderer, /updateReaderProgress\(currentIndex\)/);
  assert.match(css, /\.reader-progress\s*{/);
  assert.match(readme, /阅读位置提示/);
  assert.match(changelog, /reader toolbar topic position indicator/);
});

test('reader toolbar shows the current topic title', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(html, /<output class="toolbar-meta reader-topic-title" id="reader-topic-title" aria-live="polite" hidden><\/output>/);
  assert.match(renderer, /readerTopicTitle: query\('#reader-topic-title'\)/);
  assert.match(renderer, /function updateReaderTopicTitle\(\): void/);
  assert.match(renderer, /const topicTitle = getCurrentTopicTitle\(\)/);
  assert.match(renderer, /elements\.readerTopicTitle\.hidden = !topicTitle/);
  assert.match(renderer, /elements\.readerTopicTitle\.textContent = topicTitle \|\| ''/);
  assert.match(renderer, /elements\.readerTopicTitle\.title = topicTitle \|\| ''/);
  assert.match(renderer, /updateReaderTopicTitle\(\)/);
  assert.match(css, /\.reader-topic-title\s*{/);
  assert.match(readme, /当前章节标题/);
  assert.match(englishReadme, /current topic title/);
  assert.match(changelog, /reader toolbar current topic title/);
});

test('reader window title includes current book and topic', () => {
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(renderer, /function getCurrentTopicTitle\(\): string \| null/);
  assert.match(renderer, /return currentBook && currentTopicPath\s*\?\s*findTopicTitleByPath\(currentBook\.contents, currentTopicPath\) \|\| currentTopicPath\s*:\s*null/);
  assert.match(renderer, /function updateDocumentTitle\(\): void/);
  assert.match(renderer, /document\.title = currentBook\s*\?\s*`\$\{currentBook\.name\}\$\{topicTitle \? ` - \$\{topicTitle\}` : ''\} - CHMReaderLight`\s*:\s*'CHMReaderLight'/);
  assert.match(renderer, /updateDocumentTitle\(\)/);
  assert.match(renderer, /currentTopicPath = topicPath;\s+if \(currentBook\) saveReaderLastTopicPreference\(currentBook, topicPath\);\s+updateDocumentTitle\(\);/);
  assert.match(renderer, /currentTopicPath = topicPath \|\| currentTopicPath;\n  updateDocumentTitle\(\);/);
  assert.match(renderer, /elements\.bookTitle\.textContent = '正在打开\.\.\.';\n  document\.title = 'Opening - CHMReaderLight';/);
  assert.match(renderer, /function showView\(view: 'library' \| 'reader'\): void[\s\S]*if \(!isReader\) document\.title = 'CHMReaderLight'/);
  assert.match(readme, /窗口标题显示当前书名和章节/);
  assert.match(englishReadme, /window title with the current book and topic/);
  assert.match(changelog, /reader window title now shows the current book and topic/);
});

test('reader recovers when a library book open request rejects', () => {
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const start = renderer.indexOf('async function openLibraryBook(id: string): Promise<void>');
  const end = renderer.indexOf('function hideCollectionContextMenu()', start);
  const implementation = renderer.slice(start, end);
  const tryStart = implementation.indexOf('try {');
  const requestStart = implementation.indexOf('await window.chmReader.openLibraryBook(id)');
  const catchStart = implementation.indexOf('} catch (error: unknown) {', requestStart);
  const stopLoading = implementation.indexOf('setLoading(false)', catchStart);
  const restoreLibrary = implementation.indexOf("showView('library')", stopLoading);

  assert.ok(start >= 0 && end > start);
  assert.ok(tryStart >= 0 && tryStart < requestStart);
  assert.ok(catchStart > requestStart);
  assert.ok(stopLoading > catchStart);
  assert.ok(restoreLibrary > stopLoading);
  assert.match(implementation, /if \(book\) return;/);
});

test('library startup failure shows an accessible retry state without an unhandled rejection', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const start = renderer.indexOf('async function loadLibrary(): Promise<void>');
  const end = renderer.indexOf('function setLoading(', start);
  const implementation = renderer.slice(start, end);
  const tryStart = implementation.indexOf('try {');
  const requestStart = implementation.indexOf('await window.chmReader.listLibrary()');
  const catchStart = implementation.indexOf('} catch (error: unknown) {', requestStart);

  assert.match(
    html,
    /<div class="library-empty library-load-error" id="library-load-error" role="alert" hidden>/,
  );
  assert.match(html, /<h1>无法加载书库<\/h1>/);
  assert.match(html, /<p id="library-load-error-message">/);
  assert.match(html, /<button class="primary-button" id="retry-library-load" type="button">重新加载<\/button>/);
  assert.match(renderer, /libraryLoadError: query\('#library-load-error'\)/);
  assert.match(renderer, /libraryLoadErrorMessage: query\('#library-load-error-message'\)/);
  assert.match(renderer, /retryLibraryLoad: query\('#retry-library-load'\)/);
  assert.ok(start >= 0 && end > start);
  assert.ok(tryStart >= 0 && tryStart < requestStart);
  assert.ok(catchStart > requestStart);
  assert.match(implementation, /elements\.libraryLoadError\.hidden = true/);
  assert.match(implementation, /elements\.retryLibraryLoad\.disabled = true/);
  assert.match(implementation, /elements\.libraryGrid\.hidden = false/);
  assert.match(implementation, /elements\.libraryGrid\.replaceChildren\(\)/);
  assert.match(implementation, /elements\.libraryGrid\.hidden = true/);
  assert.match(implementation, /elements\.libraryEmpty\.hidden = true/);
  assert.match(implementation, /elements\.libraryEmptyFiltered\.hidden = true/);
  assert.match(implementation, /elements\.libraryLoadErrorMessage\.textContent = `书库数据无法加载：\$\{error instanceof Error \? error\.message : String\(error\)\}`/);
  assert.match(implementation, /elements\.libraryLoadError\.hidden = false/);
  assert.match(implementation, /elements\.retryLibraryLoad\.disabled = false/);
  assert.match(renderer, /elements\.retryLibraryLoad\.addEventListener\('click', \(\) => void loadLibrary\(\)\)/);
  assert.match(renderer, /void loadLibrary\(\);\s*$/);
});

test('collection dialog recovers when create or rename requests reject', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const start = renderer.indexOf('async function submitCreateCollection(event: SubmitEvent): Promise<void>');
  const end = renderer.indexOf('async function loadLibrary()', start);
  const implementation = renderer.slice(start, end);
  const tryStart = implementation.indexOf('try {');
  const createRequest = implementation.indexOf('await window.chmReader.createCollection(trimmed)');
  const catchStart = implementation.indexOf('} catch (error: unknown) {', createRequest);
  const finallyStart = implementation.indexOf('} finally {', catchStart);

  assert.match(html, /<input id="collection-name"[^>]+aria-errormessage="collection-error"/);
  assert.match(html, /<p class="modal-error" id="collection-error" role="alert" hidden><\/p>/);
  assert.match(renderer, /collectionError: query\('#collection-error'\)/);
  assert.ok(start >= 0 && end > start);
  assert.ok(tryStart >= 0 && tryStart < createRequest);
  assert.ok(catchStart > createRequest);
  assert.ok(finallyStart > catchStart);
  assert.match(implementation, /elements\.collectionError\.textContent = `无法\$\{isRename \? '重命名' : '创建'\}书库：\$\{error instanceof Error \? error\.message : String\(error\)\}`/);
  assert.match(implementation, /elements\.collectionError\.hidden = false/);
  assert.match(implementation, /elements\.collectionName\.setAttribute\('aria-invalid', 'true'\)/);
  assert.match(implementation, /elements\.collectionName\.focus\(\)/);
  assert.match(implementation, /elements\.collectionCreate\.disabled = false/);
  assert.match(renderer, /function clearCollectionDialogError\(\): void/);
  assert.match(renderer, /elements\.collectionError\.hidden = true/);
  assert.match(renderer, /elements\.collectionName\.removeAttribute\('aria-invalid'\)/);
  assert.match(renderer, /elements\.collectionName\.addEventListener\('input', clearCollectionDialogError\)/);
});

test('library mutation requests report IPC failures without unhandled event promises', () => {
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const slices = [
    ['async function requestImportBooks(): Promise<void>', 'function getDroppedFiles('],
    ['async function importDroppedBooks(files: readonly File[]): Promise<void>', 'function initializeLibraryDropImport('],
    ['async function relinkLibraryBook(entry: LibraryBook, trigger: HTMLButtonElement): Promise<void>', 'async function confirmAndRemoveLibraryBook('],
    ['async function revealLibraryBook(entry: LibraryBook): Promise<void>', 'async function relinkLibraryBook('],
    ['async function confirmAndRemoveLibraryBook(entry: LibraryBook): Promise<void>', 'async function openLibraryBook('],
    ['async function confirmAndRemoveCollection(collection: LibraryCollection, count: number): Promise<void>', 'function openCollectionDialog('],
  ].map(([startMarker, endMarker]) => {
    const start = renderer.indexOf(startMarker);
    const end = renderer.indexOf(endMarker, start);
    assert.ok(start >= 0 && end > start, `missing renderer operation: ${startMarker}`);
    return renderer.slice(start, end);
  });

  slices.forEach((implementation) => {
    assert.match(implementation, /try \{/);
    assert.match(implementation, /} catch \(error: unknown\) \{/);
    assert.match(implementation, /showLibraryActionError\(/);
  });
  assert.match(renderer, /function showLibraryActionError\(action: string, error: unknown\): void/);
  assert.match(renderer, /window\.alert\(`\$\{action\}：\$\{error instanceof Error \? error\.message : String\(error\)\}`\)/);
  assert.match(renderer, /elements\.addBook\.disabled = true/);
  assert.match(renderer, /elements\.emptyAddBook\.disabled = true/);
  assert.match(renderer, /elements\.addBook\.disabled = false/);
  assert.match(renderer, /elements\.emptyAddBook\.disabled = false/);
  assert.match(renderer, /trigger\.disabled = true/);
  assert.match(renderer, /trigger\.disabled = false/);
  assert.match(renderer, /remove\.addEventListener\('click', async \(event\) => \{[\s\S]*await confirmAndRemoveLibraryBook\(entry\)/);
  assert.match(renderer, /relink\.addEventListener\('click', \(event\) => \{[\s\S]*void relinkLibraryBook\(entry, relink\)/);
  assert.match(renderer, /reveal\.addEventListener\('click', \(event\) => \{[\s\S]*void revealLibraryBook\(entry\)/);
  assert.match(renderer, /elements\.collectionDelete\.addEventListener\('click', \(\) => \{[\s\S]*void confirmAndRemoveCollection\(collection, count\)/);
});

test('reader search and topic navigation recover when IPC requests reject', () => {
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const navigationStart = renderer.indexOf('async function navigateTo(');
  const navigationEnd = renderer.indexOf('function findNavigationRow(', navigationStart);
  const navigation = renderer.slice(navigationStart, navigationEnd);
  const navigationTry = navigation.indexOf('try {');
  const urlRequest = navigation.indexOf('await window.chmReader.createBookUrl(topicPath)');
  const historyMutation = navigation.indexOf('history.push(', urlRequest);
  const navigationCatch = navigation.indexOf('} catch (error: unknown) {', urlRequest);
  const searchStart = renderer.indexOf('async function searchNavigation(query: string): Promise<void>');
  const searchEnd = renderer.indexOf('function clampReaderZoom(', searchStart);
  const search = renderer.slice(searchStart, searchEnd);
  const searchTry = search.indexOf('try {');
  const searchRequest = search.indexOf('await window.chmReader.searchBook(normalizedQuery)');
  const searchCatch = search.indexOf('} catch (error: unknown) {', searchRequest);

  assert.ok(navigationStart >= 0 && navigationEnd > navigationStart);
  assert.ok(navigationTry >= 0 && navigationTry < urlRequest);
  assert.ok(navigationCatch > urlRequest);
  assert.ok(historyMutation > urlRequest && historyMutation < navigationCatch);
  assert.match(navigation, /showReaderActionError\('无法打开章节', error\)/);
  assert.match(renderer, /function showReaderActionError\(action: string, error: unknown\): void/);
  assert.match(renderer, /window\.alert\(`\$\{action\}：\$\{error instanceof Error \? error\.message : String\(error\)\}`\)/);
  assert.ok(searchStart >= 0 && searchEnd > searchStart);
  assert.ok(searchTry >= 0 && searchTry < searchRequest);
  assert.ok(searchCatch > searchRequest);
  assert.match(search, /if \(requestId !== searchRequestId\) return/);
  assert.match(search, /searchState\.resultsByPath = new Map\(\)/);
  assert.match(search, /renderNavigation\(currentBook\?\.contents \|\| \[\]\)/);
  assert.match(search, /elements\.searchStatus\.textContent = `正文搜索失败：\$\{error instanceof Error \? error\.message : String\(error\)\}`/);
  assert.match(search, /updateSearchMatchNavigation\(\)/);
});

test('fire-and-forget renderer IPC calls always consume rejected promises', () => {
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /function syncMainProcessView\(view: 'library' \| 'reader'\): void/);
  assert.match(renderer, /void window\.chmReader\.setView\(view\)\.catch\(\(error: unknown\) => \{/);
  assert.match(renderer, /showReaderActionError\('无法同步窗口状态', error\)/);
  assert.match(renderer, /function openExternalLink\(url: string\): void/);
  assert.match(renderer, /void window\.chmReader\.openExternal\(url\)\.catch\(\(error: unknown\) => \{/);
  assert.match(renderer, /showReaderActionError\('无法打开外部链接', error\)/);
  assert.equal((renderer.match(/void window\.chmReader\.setView\(/g) || []).length, 1);
  assert.equal((renderer.match(/void window\.chmReader\.openExternal\(/g) || []).length, 1);
  assert.match(renderer, /syncMainProcessView\(view\)/);
  assert.match(renderer, /openExternalLink\(onboardingLinks\.gettingStarted\)/);
  assert.match(renderer, /openExternalLink\(event\.data\.href\)/);
});

test('reader sidebar shows the available topic count', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(html, /<output class="sidebar-topic-count" id="sidebar-topic-count" aria-live="polite" hidden><\/output>/);
  assert.match(renderer, /sidebarTopicCount: query\('#sidebar-topic-count'\)/);
  assert.match(renderer, /function updateSidebarTopicCount\(\): void/);
  assert.match(renderer, /elements\.sidebarTopicCount\.hidden = readingOrder\.length === 0/);
  assert.match(renderer, /elements\.sidebarTopicCount\.textContent = readingOrder\.length > 0\s*\?\s*`共 \$\{readingOrder\.length\} 节`\s*:\s*''/);
  assert.match(renderer, /updateSidebarTopicCount\(\)/);
  assert.match(css, /\.sidebar-topic-count\s*{/);
  assert.match(readme, /目录章节数量/);
  assert.match(changelog, /reader sidebar topic count/);
});

test('reader toolbar omits the copy-current-topic action', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');

  assert.doesNotMatch(html, /id="copy-topic-reference"/);
  assert.doesNotMatch(renderer, /copyTopicReference/);
  assert.doesNotMatch(renderer, /copyCurrentTopicReference/);
  assert.doesNotMatch(renderer, /已复制当前章节引用|复制当前章节引用失败/);
  assert.doesNotMatch(readme, /复制当前章节引用/);
});

test('roadmap makes project direction discoverable to contributors', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const chineseContributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.zh-CN.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const chineseGovernance = fs.readFileSync(path.join(projectRoot, 'docs', 'governance.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const roadmap = fs.readFileSync(path.join(projectRoot, 'docs', 'roadmap.md'), 'utf-8');
  const chineseRoadmap = fs.readFileSync(path.join(projectRoot, 'docs', 'roadmap.zh-CN.md'), 'utf-8');

  assert.match(readme, /\[Roadmap\]\(\.\/docs\/roadmap\.md\)/);
  assert.match(readme, /\[中文路线图\]\(\.\/docs\/roadmap\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Chinese Roadmap\]\(\.\/docs\/roadmap\.zh-CN\.md\)/);
  assert.match(contributing, /\[Roadmap\]\(\.\/docs\/roadmap\.md\)/);
  assert.match(chineseContributing, /\[中文路线图\]\(\.\/docs\/roadmap\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Roadmap\]\(\.\/roadmap\.md\)/);
  assert.match(docsIndex, /\[Chinese Roadmap\]\(\.\/roadmap\.zh-CN\.md\)/);
  assert.match(chineseGovernance, /\[中文路线图\]\(\.\/roadmap\.zh-CN\.md\)/);
  assert.match(changelog, /public roadmap/);
  assert.match(changelog, /Chinese roadmap for localized project direction and contributor focus/);
  assert.match(roadmap, /## Current Focus/);
  assert.match(roadmap, /## Good First Areas/);
  assert.match(roadmap, /## Not Planned/);
  assert.match(roadmap, /CHM compatibility reports/);
  assert.match(roadmap, /macOS distribution/);
  assert.match(roadmap, /\[Troubleshooting\]\(\.\/troubleshooting\.md\)/);
  assert.match(chineseRoadmap, /# CHMReaderLight 中文路线图/);
  assert.match(chineseRoadmap, /\[English Roadmap\]\(\.\/roadmap\.md\)/);
  assert.match(chineseRoadmap, /\[中文项目状态\]\(\.\/project-status\.zh-CN\.md\)/);
  assert.match(chineseRoadmap, /## 当前重点/);
  assert.match(chineseRoadmap, /CHM 兼容性报告/);
  assert.match(chineseRoadmap, /macOS 分发/);
  assert.match(chineseRoadmap, /## 适合首次贡献的方向/);
  assert.match(chineseRoadmap, /## 暂不计划/);
  assert.match(chineseRoadmap, /cloud sync 或托管文档存储/);
  assert.match(chineseRoadmap, /## 提议变更/);
  assert.match(chineseRoadmap, /\[中文故障排查\]\(\.\/troubleshooting\.zh-CN\.md\)/);
});

test('good first contribution guide helps newcomers choose scoped work', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const chineseContributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.zh-CN.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const chineseAdoptionGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'adoption-checklist.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const guide = fs.readFileSync(path.join(projectRoot, 'docs', 'good-first-contributions.md'), 'utf-8');
  const chineseGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'good-first-contributions.zh-CN.md'), 'utf-8');
  const starterTemplate = fs.readFileSync(
    path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'good_first_task.yml'),
    'utf-8',
  );

  assert.match(readme, /\[Good First Contributions\]\(\.\/docs\/good-first-contributions\.md\)/);
  assert.match(readme, /\[中文首次贡献指南\]\(\.\/docs\/good-first-contributions\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Chinese Good First Contributions\]\(\.\/docs\/good-first-contributions\.zh-CN\.md\)/);
  assert.match(contributing, /\[Good First Contributions\]\(\.\/docs\/good-first-contributions\.md\)/);
  assert.match(chineseContributing, /\[中文首次贡献指南\]\(\.\/docs\/good-first-contributions\.zh-CN\.md\)/);
  assert.match(contributing, /\[good first issue\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\?q=is%3Aissue\+is%3Aopen\+label%3A%22good\+first\+issue%22\)/);
  assert.match(contributing, /\[help wanted\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\?q=is%3Aissue\+is%3Aopen\+label%3A%22help\+wanted%22\)/);
  assert.match(docsIndex, /\[Good First Contributions\]\(\.\/good-first-contributions\.md\)/);
  assert.match(docsIndex, /\[Chinese Good First Contributions\]\(\.\/good-first-contributions\.zh-CN\.md\)/);
  assert.match(chineseAdoptionGuide, /\[中文首次贡献指南\]\(\.\/good-first-contributions\.zh-CN\.md\)/);
  assert.match(changelog, /good first contributions guide/);
  assert.match(changelog, /good first contribution guide to point newcomers at labeled starter issues/);
  assert.match(changelog, /direct starter issue search links to the contributing guide/);
  assert.match(guide, /# Good First Contributions/);
  assert.match(readme, /\[Good First Contributions\]\(\.\/docs\/good-first-contributions\.md\)/);
  assert.match(readme, /\[good first issue\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\?q=is%3Aissue\+is%3Aopen\+label%3A%22good\+first\+issue%22\)/);
  assert.match(readme, /\[help wanted\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\?q=is%3Aissue\+is%3Aopen\+label%3A%22help\+wanted%22\)/);
  assert.match(changelog, /direct starter issue search links to the README contribution section/);
  assert.match(guide, /## Choose a Small Area/);
  assert.match(guide, /CHM compatibility fixtures/);
  assert.match(guide, /Library workflow polish/);
  assert.match(guide, /Documentation fixes/);
  assert.match(guide, /Packaging checks/);
  assert.match(guide, /## Useful File Pointers/);
  assert.match(guide, /src\/library\.ts/);
  assert.match(guide, /test\/library\.test\.ts/);
  assert.match(guide, /src\/chm\.ts/);
  assert.match(guide, /test\/chm\.test\.ts/);
  assert.match(guide, /## Before Opening a Pull Request/);
  assert.match(guide, /Look for issues labeled `good first issue` or `help wanted`/);
  assert.match(guide, /\[good first issue\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\?q=is%3Aissue\+is%3Aopen\+label%3A%22good\+first\+issue%22\)/);
  assert.match(guide, /\[help wanted\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\?q=is%3Aissue\+is%3Aopen\+label%3A%22help\+wanted%22\)/);
  assert.match(guide, /Ask for a smaller scope before starting/);
  assert.match(guide, /Maintainers can use the good first task issue template/);
  assert.match(contributing, /good first task issue template/);
  assert.match(chineseGuide, /# CHMReaderLight 中文首次贡献指南/);
  assert.match(chineseGuide, /\[English Good First Contributions\]\(\.\/good-first-contributions\.md\)/);
  assert.match(chineseGuide, /## 选择小范围任务/);
  assert.match(chineseGuide, /CHM 兼容性 fixture/);
  assert.match(chineseGuide, /书库工作流打磨/);
  assert.match(chineseGuide, /文档修复/);
  assert.match(chineseGuide, /打包检查/);
  assert.match(chineseGuide, /## 找到新手任务/);
  assert.match(chineseGuide, /`good first issue` 或 `help wanted`/);
  assert.match(chineseGuide, /\[good first issue\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\?q=is%3Aissue\+is%3Aopen\+label%3A%22good\+first\+issue%22\)/);
  assert.match(chineseGuide, /\[help wanted\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\?q=is%3Aissue\+is%3Aopen\+label%3A%22help\+wanted%22\)/);
  assert.match(chineseGuide, /开始前先请求缩小范围/);
  assert.match(chineseGuide, /## 有用的文件指针/);
  assert.match(chineseGuide, /src\/library\.ts/);
  assert.match(chineseGuide, /test\/library\.test\.ts/);
  assert.match(chineseGuide, /src\/chm\.ts/);
  assert.match(chineseGuide, /test\/chm\.test\.ts/);
  assert.match(chineseGuide, /## 打开 Pull Request 前/);
  assert.match(chineseGuide, /npm run check/);
  assert.match(chineseGuide, /Testing Guide/);
  assert.match(starterTemplate, /name: Good first task/);
  assert.match(starterTemplate, /description: Create a scoped starter issue for new contributors/);
  assert.match(starterTemplate, /labels: \["good first issue", "help wanted"\]/);
  assert.match(starterTemplate, /What user or contributor workflow improves\?/);
  assert.match(starterTemplate, /Likely files or docs/);
  assert.match(starterTemplate, /Smallest acceptable change/);
  assert.match(starterTemplate, /Verification command/);
  assert.match(starterTemplate, /Mentoring notes/);
  assert.match(
    starterTemplate,
    /Avoid broad rewrites, private CHM samples, new platform support, signing changes, or release-process changes/,
  );
  assert.match(changelog, /good first task issue template for maintainer-created starter issues/);
  assert.match(changelog, /Chinese good first contributions guide for localized starter issue onboarding/);
  assert.match(guide, /npm run check/);
  assert.match(guide, /Testing Guide/);
});

test('architecture overview helps contributors find the right code areas', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const architecture = fs.readFileSync(path.join(projectRoot, 'docs', 'architecture.md'), 'utf-8');

  assert.match(readme, /\[Architecture Overview\]\(\.\/docs\/architecture\.md\)/);
  assert.match(contributing, /\[Architecture Overview\]\(\.\/docs\/architecture\.md\)/);
  assert.match(changelog, /architecture overview/);
  assert.match(architecture, /## Runtime Flow/);
  assert.match(architecture, /## Code Map/);
  assert.match(architecture, /## Data and Cache Boundaries/);
  assert.match(architecture, /## Safe Contribution Areas/);
  assert.match(architecture, /src\/main\.ts/);
  assert.match(architecture, /src\/preload\.ts/);
  assert.match(architecture, /src\/renderer\.ts/);
  assert.match(architecture, /src\/chm\.ts/);
  assert.match(architecture, /src\/navigation\.ts/);
  assert.match(architecture, /src\/library\.ts/);
  assert.match(architecture, /scripts\/package-macos\.sh/);
});

test('release checklist documents macOS artifact publishing steps', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const chineseContributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.zh-CN.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');
  const chineseReleaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.zh-CN.md'), 'utf-8');

  assert.match(readme, /\[Release Checklist\]\(\.\/docs\/release\.md\)/);
  assert.match(contributing, /\[Release Checklist\]\(\.\/docs\/release\.md\)/);
  assert.match(chineseContributing, /\[中文发版检查清单\]\(\.\/docs\/release\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Chinese Release Checklist\]\(\.\/release\.zh-CN\.md\)/);
  assert.match(changelog, /release checklist/);
  assert.match(changelog, /Chinese release checklist for localized macOS artifact publishing and promotion checks/);
  assert.match(releaseDoc, /## Before Tagging/);
  assert.match(releaseDoc, /## Publishing/);
  assert.match(releaseDoc, /## After Publishing/);
  assert.match(releaseDoc, /npm test/);
  assert.match(releaseDoc, /npm run check/);
  assert.match(releaseDoc, /npm run package:mac/);
  assert.match(releaseDoc, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(releaseDoc, /CHMReaderLight-mac-x64\.zip/);
  assert.match(releaseDoc, /Contents\/Resources\/native\//);
  assert.match(chineseReleaseDoc, /# CHMReaderLight 中文发版检查清单/);
  assert.match(chineseReleaseDoc, /\[English Release Checklist\]\(\.\/release\.md\)/);
  assert.match(chineseReleaseDoc, /## 打标签前/);
  assert.match(chineseReleaseDoc, /npm test/);
  assert.match(chineseReleaseDoc, /npm run check/);
  assert.match(chineseReleaseDoc, /npm run package:mac/);
  assert.match(chineseReleaseDoc, /## 发布/);
  assert.match(chineseReleaseDoc, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(chineseReleaseDoc, /CHMReaderLight-mac-x64\.zip/);
  assert.match(chineseReleaseDoc, /## 发布后/);
  assert.match(chineseReleaseDoc, /npm run check:release-artifacts -- <release-dir>/);
  assert.match(chineseReleaseDoc, /npm run check:remote-release/);
  assert.match(chineseReleaseDoc, /npm run check:remote-listing/);
  assert.match(chineseReleaseDoc, /Release Page Template/);
  assert.match(chineseReleaseDoc, /release-feedback Discussion/);
  assert.match(chineseReleaseDoc, /Help > Star on GitHub/);
  assert.match(chineseReleaseDoc, /Help > Copy Share Text/);
  assert.match(chineseReleaseDoc, /不要宣布 Homebrew 安装命令/);
});

test('release workflow publishes checksums for downloadable macOS artifacts', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const releaseWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'release.yml'), 'utf-8');
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');
  const chineseReleaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.zh-CN.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const verifier = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-release-artifacts.js'), 'utf-8');
  const packager = fs.readFileSync(path.join(projectRoot, 'scripts', 'package-macos-release.sh'), 'utf-8');
  const bundleVerifier = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-macos-release-bundle.sh'), 'utf-8');
  const asarVerifier = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-packaged-app-asar.js'), 'utf-8');
  const liveVerifier = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-live-release.js'), 'utf-8');
  const publisher = fs.readFileSync(path.join(projectRoot, 'scripts', 'publish-release.js'), 'utf-8');
  const macosJob = releaseWorkflow.slice(
    releaseWorkflow.indexOf('  macos:'),
    releaseWorkflow.indexOf('  attest:'),
  );
  const attestJob = releaseWorkflow.slice(
    releaseWorkflow.indexOf('  attest:'),
    releaseWorkflow.indexOf('  prepare_publish:'),
  );
  const preparePublishJob = releaseWorkflow.slice(
    releaseWorkflow.indexOf('  prepare_publish:'),
    releaseWorkflow.indexOf('  publish:'),
  );
  const publishJob = releaseWorkflow.slice(
    releaseWorkflow.indexOf('  publish:'),
    releaseWorkflow.indexOf('  verify_published:'),
  );
  const verifyPublishedJob = releaseWorkflow.slice(releaseWorkflow.indexOf('  verify_published:'));
  const releaseCheckoutSteps = releaseWorkflow
    .split(/^      - name: /m)
    .filter((step: string) => step.includes('uses: actions/checkout@'));

  assert.equal(packageJson.scripts['check:release-artifacts'], 'node scripts/check-release-artifacts.js');
  assert.equal(packageJson.scripts['check:release-bundle:mac'], 'bash scripts/check-macos-release-bundle.sh');
  assert.equal(packageJson.devDependencies['@electron/asar'], '4.2.1');
  assert.equal(packageJson.scripts['package:release:mac:arm64'], 'bash scripts/package-macos-release.sh arm64');
  assert.equal(packageJson.scripts['package:release:mac:x64'], 'bash scripts/package-macos-release.sh x64');
  assert.equal(packageJson.scripts['check:remote-release'], 'node scripts/check-live-release.js');
  assert.equal(packageJson.scripts['stage:release-artifacts'], 'node scripts/stage-release-artifacts.js');
  assert.doesNotMatch(packageJson.scripts.check, /npm run check:remote-release/);
  assert.match(macosJob, /permissions:\n\s+contents: read/);
  assert.doesNotMatch(macosJob, /attestations: write/);
  assert.doesNotMatch(macosJob, /artifact-metadata: write/);
  assert.doesNotMatch(macosJob, /id-token: write/);
  assert.match(attestJob, /permissions:\n\s+contents: read\n\s+attestations: write\n\s+id-token: write/);
  assert.doesNotMatch(attestJob, /artifact-metadata: write/);
  assert.doesNotMatch(attestJob, /^\s*run:/m);
  assert.doesNotMatch(attestJob, /actions\/checkout/);
  assert.doesNotMatch(attestJob, /actions\/setup-node/);
  assert.match(
    preparePublishJob,
    /prepare_publish:\n\s+name: Prepare GitHub Release publication\n\s+needs: \[validate_release, macos, attest\](?:.|\n)*?permissions:\n\s+contents: read/,
  );
  assert.match(preparePublishJob, /outputs:\n\s+artifact_id: \$\{\{ steps\.publish_input\.outputs\.artifact-id \}\}/);
  assert.match(preparePublishJob, /node scripts\/check-release-artifacts\.js dist\/release/);
  assert.match(preparePublishJob, /id: publish_input/);
  assert.doesNotMatch(preparePublishJob, /cache: npm/);
  assert.match(preparePublishJob, /name: release-publish-input/);
  assert.match(preparePublishJob, /retention-days: 1/);
  assert.match(preparePublishJob, /compression-level: 0/);
  assert.equal(releaseCheckoutSteps.length, 4);
  for (const checkoutStep of releaseCheckoutSteps) {
    assert.match(checkoutStep, /persist-credentials: false/);
  }
  assert.match(releaseWorkflow, /npm run package:release:mac:/);
  assert.doesNotMatch(releaseWorkflow, /run: ditto /);
  assert.doesNotMatch(releaseWorkflow, /run: shasum /);
  assert.match(packager, /package-macos[.]sh/);
  assert.match(packager, /if \[\[ -e "\$artifact_path" \|\| -e "\$checksum_path" \]\]/);
  assert.match(packager, /Refusing to overwrite an existing release artifact or checksum/);
  assert.ok(
    packager.indexOf('Refusing to overwrite an existing release artifact or checksum')
      < packager.indexOf('package-macos.sh'),
    'the release packager must reject existing output before starting the expensive package build',
  );
  assert.match(packager, /temporary_artifact_path=/);
  assert.match(packager, /temporary_checksum_path=/);
  assert.match(packager, /trap cleanup_temporary_outputs EXIT/);
  assert.match(packager, /check-macos-release-bundle[.]sh" "\$temporary_artifact_path"/);
  assert.ok(
    packager.indexOf('check-macos-release-bundle.sh" "$temporary_artifact_path"')
      < packager.indexOf('mv "$temporary_artifact_path" "$artifact_path"'),
    'the release packager must verify temporary output before publishing the final artifact name',
  );
  assert.match(packager, /mv "\$temporary_checksum_path" "\$checksum_path"/);
  assert.match(packager, /ditto -c -k --sequesterRsrc --keepParent/);
  assert.match(packager, /shasum -a 256/);
  assert.match(packager, /check-macos-release-bundle[.]sh/);
  assert.match(bundleVerifier, /check-packaged-app-asar[.]js/);
  assert.match(asarVerifier, /MAX_APP_ASAR_BYTES = 20 \* 1024 \* 1024/);
  assert.match(asarVerifier, /Unexpected app[.]asar root entry/);
  assert.match(bundleVerifier, /codesign --verify --deep --strict/);
  assert.match(bundleVerifier, /Contents\/MacOS\/CHMReaderLight/);
  assert.match(bundleVerifier, /native_dir="\$app_path\/Contents\/Resources\/native\/darwin-\$arch"/);
  assert.match(bundleVerifier, /extractor="\$native_dir\/bin\/extract_chmLib"/);
  assert.match(bundleVerifier, /@loader_path\/\.\.\/lib/);
  assert.match(bundleVerifier, /CFBundleIdentifier/);
  assert.match(bundleVerifier, /CFBundleShortVersionString/);
  assert.match(bundleVerifier, /LSMinimumSystemVersion/);
  assert.match(bundleVerifier, /package_version/);
  assert.match(bundleVerifier, /plutil -extract CFBundleIconFile raw -o - \"\$info_plist\"/);
  assert.match(bundleVerifier, /Unexpected CFBundleIconFile in packaged app/);
  assert.match(bundleVerifier, /electron[.]icns/);
  assert.match(bundleVerifier, /generate-macos-icon[.]sh/);
  assert.match(bundleVerifier, /cmp -s \"\$expected_icon\" \"\$icon\"/);
  assert.match(bundleVerifier, /Packaged app icon does not match the project icon/);
  assert.match(releaseWorkflow, /name: Attest release artifacts/);
  assert.match(releaseDoc, /exact generated project icon/);
  assert.match(releaseDoc, /20 MiB size budget/);
  assert.match(chineseReleaseDoc, /逐字节一致的品牌图标/);
  assert.match(chineseReleaseDoc, /20 MiB 体积上限/);
  assert.match(releaseWorkflow, /uses: actions\/attest@[a-f0-9]{40} # v4/);
  assert.doesNotMatch(releaseWorkflow, /actions\/attest-build-provenance/);
  assert.match(
    attestJob,
    /subject-path: \|\n\s+dist\/attest\/CHMReaderLight-mac-arm64\.zip\n\s+dist\/attest\/CHMReaderLight-mac-arm64\.zip\.sha256\n\s+dist\/attest\/CHMReaderLight-mac-x64\.zip\n\s+dist\/attest\/CHMReaderLight-mac-x64\.zip\.sha256/,
  );
  assert.match(releaseWorkflow, /path: \|\n\s+\$\{\{ matrix\.artifact-name \}\}\.zip\n\s+\$\{\{ matrix\.artifact-name \}\}\.zip\.sha256/);
  assert.doesNotMatch(releaseWorkflow, /softprops\/action-gh-release/);
  assert.equal(
    (releaseWorkflow.match(/node scripts\/publish-release\.js/g) || []).length,
    1,
    'a tagged build should publish through one aggregate draft-first helper invocation',
  );
  assert.doesNotMatch(publishJob, /npm run/);
  assert.match(releaseWorkflow, /attest:\n\s+name: Attest release artifacts\n\s+needs: macos/);
  assert.match(releaseWorkflow, /publish:\n\s+name: Publish GitHub Release\n\s+needs: \[validate_release, prepare_publish\]/);
  assert.doesNotMatch(publishJob, /actions\/checkout/);
  assert.match(publishJob, /uses: actions\/setup-node@[a-f0-9]{40} # v4/);
  assert.doesNotMatch(publishJob, /cache: npm/);
  assert.doesNotMatch(publishJob, /node scripts\/check-release-artifacts/);
  assert.match(
    publishJob,
    /uses: actions\/download-artifact@[a-f0-9]{40} # v4\n\s+with:\n\s+artifact-ids: \$\{\{ needs\.prepare_publish\.outputs\.artifact_id \}\}/,
  );
  assert.match(publishJob, /working-directory: dist\/publish/);
  assert.equal(
    (publishJob.match(/^      - /gm) || []).length,
    3,
    'the contents-write job should only download the prepared immutable input, provision Node, and invoke the publisher',
  );
  assert.equal((publishJob.match(/^        run:/gm) || []).length, 1);
  assert.equal((publishJob.match(/GITHUB_TOKEN:/g) || []).length, 1);
  assert.ok(
    publishJob.indexOf('actions/setup-node@') < publishJob.indexOf('artifact-ids:')
      && publishJob.indexOf('artifact-ids:') < publishJob.indexOf('node scripts/publish-release.js'),
    'the write-capable job should provision Node before exposing the prepared publisher input',
  );
  assert.doesNotMatch(publishJob, /npm run check:remote-release/);
  assert.match(
    verifyPublishedJob,
    /verify_published:\n\s+name: Verify published GitHub Release\n\s+needs: \[validate_release, publish\](?:.|\n)*?permissions:\n\s+contents: read/,
  );
  assert.match(releaseWorkflow, /publish_release:\n\s+description: .+\n\s+required: true\n\s+type: boolean\n\s+default: false/);
  assert.match(releaseWorkflow, /release_tag:\n\s+description: .+vMAJOR\.MINOR\.PATCH.+\n\s+required: false\n\s+type: string/);
  assert.match(
    releaseWorkflow,
    /concurrency:\n\s+group: release-\$\{\{ inputs\.release_tag \|\| github\.ref_name \}\}\n\s+cancel-in-progress: false/,
  );
  assert.match(releaseWorkflow, /validate_release:\n\s+name: Validate release request/);
  assert.match(releaseWorkflow, /validate_release:(?:.|\n)*?uses: actions\/checkout@[a-f0-9]{40} # v4(?:.|\n)*?fetch-depth: 0/);
  assert.match(releaseWorkflow, /macos:\n\s+name: macOS \$\{\{ matrix\.arch \}\}\n\s+needs: validate_release/);
  assert.match(
    releaseWorkflow,
    /if: startsWith\(github\.ref, 'refs\/tags\/v'\) \|\| \(github\.event_name == 'workflow_dispatch' && inputs\.publish_release == true\)/,
  );
  assert.match(releaseWorkflow, /uses: actions\/download-artifact@[a-f0-9]{40} # v4/);
  assert.match(releaseWorkflow, /pattern: CHMReaderLight-mac-\*/);
  assert.match(releaseWorkflow, /merge-multiple: true/);
  assert.ok(
    releaseWorkflow.indexOf('node scripts/check-release-artifacts.js dist/release')
      < releaseWorkflow.indexOf('node scripts/publish-release.js'),
    'all four downloaded files should be verified before the release is created',
  );
  assert.match(releaseWorkflow, /name: Resolve and validate release tag\n\s+id: release_tag/);
  assert.match(releaseWorkflow, /MANUAL_RELEASE_TAG: \$\{\{ inputs\.release_tag \}\}/);
  assert.match(releaseWorkflow, /GITHUB_EVENT_NAME.+workflow_dispatch/);
  assert.match(releaseWorkflow, /\^v\[0-9\]\+\\\.\[0-9\]\+\\\.\[0-9\]\+\$/);
  assert.match(releaseWorkflow, /git rev-parse --verify --quiet "refs\/tags\/\$release_tag"/);
  assert.match(releaseWorkflow, /git rev-list -n 1 "\$release_tag"/);
  assert.match(releaseWorkflow, /Existing tag .+ does not point to selected commit/);
  assert.match(releaseWorkflow, /package_version=\$\(node -p "require\('.\/package\.json'\)\.version"\)/);
  assert.match(releaseWorkflow, /if \[\[ "\$release_tag" != "v\$package_version" \]\]/);
  assert.match(releaseWorkflow, /does not match package version/);
  assert.match(releaseWorkflow, /echo "tag=\$release_tag" >> "\$GITHUB_OUTPUT"/);
  assert.ok(
    releaseWorkflow.indexOf('name: Resolve and validate release tag') < releaseWorkflow.indexOf('name: macOS ${{ matrix.arch }}'),
    'release requests should be validated before starting either macOS runner',
  );
  assert.match(releaseWorkflow, /RELEASE_TAG: \$\{\{ needs\.validate_release\.outputs\.release_tag \}\}/);
  assert.match(releaseWorkflow, /GITHUB_TOKEN: \$\{\{ github\.token \}\}/);
  assert.match(
    releaseWorkflow,
    /node scripts\/publish-release\.js --release-dir dist\/release --tag "\$RELEASE_TAG" --target-commitish "\$GITHUB_SHA" --confirm/,
  );
  assert.match(releaseWorkflow, /publish:(?:.|\n)*?timeout-minutes: (?:1[1-9]|[2-9][0-9])/);
  assert.match(verifyPublishedJob, /name: Verify published GitHub Release/);
  assert.match(
    verifyPublishedJob,
    /node scripts\/check-live-release\.js --tag "\$RELEASE_TAG" --target-commitish "\$GITHUB_SHA" --release-dir dist\/release/,
  );
  assert.ok(
    releaseWorkflow.indexOf('node scripts/publish-release.js')
      < releaseWorkflow.indexOf('name: Verify published GitHub Release'),
    'the tag-specific remote check should run after the helper publishes the complete draft',
  );
  assert.match(readme, /\.zip\.sha256/);
  assert.match(readme, /`npm run check:release-artifacts`/);
  assert.match(readme, /`npm run check:release-artifacts -- <release-dir>`/);
  assert.match(readme, /`npm run check:remote-release`：联网检查最新 GitHub Release 是否公开 Apple Silicon 和 Intel zip 及对应 checksum 文件。/);
  assert.match(readme, /`npm run stage:release-artifacts`：预览从 GitHub Actions 下载目录整理到平铺 release 目录的复制计划/);
  assert.match(englishReadme, /Run `npm run check:remote-release` after publishing a GitHub Release to confirm the latest public release exposes both macOS zips and checksum files/);
  assert.match(englishReadme, /Run `npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` to flatten downloaded workflow artifacts/);
  assert.match(contributing, /`npm run check:remote-release` audits the latest public GitHub Release after maintainers publish macOS artifacts/);
  assert.match(contributing, /`npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` flattens downloaded workflow artifacts/);
  assert.match(releaseDoc, /shasum -a 256 -c CHMReaderLight-mac-arm64\.zip\.sha256/);
  assert.match(releaseDoc, /shasum -a 256 -c CHMReaderLight-mac-x64\.zip\.sha256/);
  assert.match(releaseDoc, /npm run check:release-artifacts -- <release-dir>/);
  assert.match(releaseDoc, /npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>/);
  assert.match(releaseDoc, /If either architecture fails, attestation fails, or any file is missing, no Release is created/);
  assert.match(releaseDoc, /A read-only preparation job waits for both builds and the successful attestation job/);
  assert.match(releaseDoc, /creates a lightweight tag directly at that SHA before creating the draft/);
  assert.match(releaseDoc, /resolves any existing lightweight or annotated Git tag to its commit/);
  assert.match(releaseDoc, /rechecks that the tag still resolves to that SHA/);
  assert.match(releaseDoc, /publishes only after every upload succeeds/);
  assert.match(releaseDoc, /Leave `publish_release` unchecked to build and verify artifacts without publishing/);
  assert.match(releaseDoc, /To publish manually, set `release_tag` to `vMAJOR\.MINOR\.PATCH` and explicitly check `publish_release`/);
  assert.match(chineseReleaseDoc, /任一架构失败、attestation 失败或文件缺失时，都不会创建 Release/);
  assert.match(chineseReleaseDoc, /独立的只读准备 job 会等待两个架构和 attestation job 都成功/);
  assert.match(chineseReleaseDoc, /独立的 attestation job/);
  assert.match(chineseReleaseDoc, /checkout 不会把 GitHub token 持久化到 git 配置/);
  assert.match(chineseReleaseDoc, /发布后的远端验证由另一个独立只读 job 执行/);
  assert.match(chineseReleaseDoc, /macOS 构建 job.*仅保留仓库只读权限/);
  assert.match(chineseReleaseDoc, /先在该 SHA 上创建 lightweight tag，再创建私有 draft/);
  assert.match(chineseReleaseDoc, /把已有的 lightweight 或 annotated Git tag 解析到最终 commit/);
  assert.match(chineseReleaseDoc, /在公开前再次确认 tag 仍指向该 SHA/);
  assert.match(chineseReleaseDoc, /上传中断、并发修改 draft、服务端 asset 不匹配或 tag 不匹配都会阻止公开/);
  assert.match(chineseReleaseDoc, /公开完成后，独立的只读 verifier job/);
  assert.match(chineseReleaseDoc, /等待两个架构构建、attestation、只读发布准备、publish 和只读 verifier job 全部完成后，再开始公开推广/);
  assert.match(chineseReleaseDoc, /不勾选 `publish_release` 时，手动运行只构建并验证 artifacts，不会发布 Release/);
  assert.match(chineseReleaseDoc, /手动发布时，把 `release_tag` 填为 `vMAJOR\.MINOR\.PATCH`，并明确勾选 `publish_release`/);
  assert.match(releaseDoc, /After publication, the read-only verifier job runs `npm run check:remote-release -- --tag/);
  assert.match(releaseDoc, /Confirm GitHub artifact attestations were generated for both macOS zips and checksum files/);
  assert.match(releaseDoc, /isolated attestation job/);
  assert.match(releaseDoc, /Wait for both architecture jobs, attestation, read-only publication preparation, publication, and the read-only verifier job to finish before announcing the release/);
  assert.match(releaseDoc, /macOS build jobs retain read-only repository permissions/);
  assert.match(releaseDoc, /checkout never persists the GitHub token in git configuration/);
  assert.match(releaseDoc, /GitHub Actions permissions remain job-scoped/);
  assert.match(releaseDoc, /exact immutable artifact ID/);
  assert.match(releaseDoc, /three-step `contents: write` job/);
  assert.match(chineseReleaseDoc, /GitHub Actions 权限仍然按 job 生效/);
  assert.match(chineseReleaseDoc, /精确的不可变 artifact ID/);
  assert.match(chineseReleaseDoc, /只有三个步骤的 `contents: write` job/);
  assert.match(releaseDoc, /separate read-only job performs post-publish remote verification/);
  assert.match(releaseDoc, /Unexpected release artifact/);
  assert.match(releaseDoc, /stale-file warning/);
  assert.match(testingGuide, /npm run check:release-artifacts -- <release-dir>/);
  assert.match(testingGuide, /stale macOS zip\/checksum files/);
  assert.match(testingGuide, /`npm run check:remote-release` after publishing or editing a GitHub Release/);
  assert.match(testingGuide, /--target-commitish <40-character-build-commit-sha> --release-dir <release-dir>.*verifies Git tag provenance and exact remote asset digests/);
  assert.match(testingGuide, /`npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>` to flatten downloaded GitHub Actions artifacts/);
  assert.match(verifier, /EXPECTED_RELEASE_ARTIFACTS/);
  assert.match(verifier, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(verifier, /CHMReaderLight-mac-x64\.zip/);
  assert.match(verifier, /Checksum mismatch/);
  assert.match(verifier, /findUnexpectedReleaseFiles/);
  assert.match(verifier, /Unexpected \$\{label\}: \$\{fileName\}/);
  assert.match(liveVerifier, /Audits the latest public GitHub Release for required macOS artifacts/);
  assert.match(liveVerifier, /function fetchLatestRelease/);
  assert.match(liveVerifier, /function fetchLatestReleaseHtml/);
  assert.match(liveVerifier, /function verifyLiveReleaseAssets/);
  assert.match(liveVerifier, /function snapshotExpectedLiveReleaseAssets/);
  assert.match(liveVerifier, /Release asset digest mismatch/);
  assert.match(liveVerifier, /function verifyLiveReleaseTagCommit/);
  assert.match(liveVerifier, /function verifyLiveReleaseHtml/);
  assert.match(liveVerifier, /function parseLiveReleaseHtml/);
  assert.match(liveVerifier, /EXPECTED_LIVE_RELEASE_ASSETS/);
  assert.match(liveVerifier, /Live release asset check passed/);
  assert.match(liveVerifier, /Live release asset check failed:/);
  assert.match(liveVerifier, /Live release HTML fallback check passed after GitHub API rate limit/);
  assert.match(liveVerifier, /HTML fallback check also found release blockers/);
  assert.match(liveVerifier, /function isGitHubRateLimitError/);
  assert.match(liveVerifier, /Exact Git tag provenance and release asset digests cannot be verified from the public HTML fallback/);
  assert.match(liveVerifier, /No latest public GitHub Release was found/);
  assert.match(liveVerifier, /Publish a non-draft, non-prerelease GitHub Release with both macOS zips and checksum files/);
  assert.match(liveVerifier, /Suggested remediation:/);
  assert.match(liveVerifier, /Set GITHUB_TOKEN before rerunning this live audit/);
  assert.match(liveVerifier, /npm run check:remote-release/);
  assert.match(liveVerifier, /verify https:\/\/github\.com\/\$\{REPOSITORY_SLUG\}\/releases\/latest in a browser/);
  assert.match(liveVerifier, /npm run package:mac:arm64/);
  assert.match(liveVerifier, /npm run package:mac:x64/);
  assert.match(liveVerifier, /npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>/);
  assert.match(liveVerifier, /npm run check:release-artifacts -- <release-dir>/);
  assert.match(liveVerifier, /npm run publish:release -- --release-dir <release-dir>/);
  assert.match(liveVerifier, /GITHUB_TOKEN=repo_contents_token npm run publish:release -- --release-dir <release-dir> --target-commitish <40-character-build-commit-sha> --confirm/);
  assert.match(liveVerifier, /Create or update a non-draft GitHub Release with:/);
  assert.match(liveVerifier, /for \(const assetName of EXPECTED_LIVE_RELEASE_ASSETS\)/);
  assert.match(liveVerifier, /Run npm run check:remote-release again before sharing download links/);
  assert.ok(publisher.includes('/git/ref/tags/${encodeURIComponent(tag)}'));
  assert.ok(publisher.includes('/git/tags/${object.sha}'));
  assert.ok(publisher.includes('body: { ref: `refs/tags/${tag}`, sha: expectedCommit }'));
  assert.ok(publisher.includes(
    'Existing tag ${plan.tag} resolves to ${remoteTagCommit}, not ${plan.targetCommitish}.',
  ));
  assert.match(publisher, /GitHub asset digest mismatch/);
  assert.ok(publisher.includes(
    'verifyRemoteReleaseAssetSnapshots(remoteDraft, plan.assets, plan.assetSnapshots)',
  ));
  assert.match(releaseDoc, /re-reads the complete server-side draft immediately before publishing/);
  assert.match(chineseReleaseDoc, /重新读取完整服务端 draft/);
  assert.match(changelog, /server-reported asset name, size, and SHA-256 digest, then re-read the complete draft/);
  assert.match(changelog, /SHA-256 checksum files for macOS release artifacts/);
  assert.match(changelog, /GitHub artifact attestations for macOS release artifacts/);
  assert.match(changelog, /isolated the Release workflow's OIDC and attestation write permissions/);
  assert.match(changelog, /disabled checkout credential persistence across Release jobs/);
  assert.match(changelog, /exact immutable artifact ID/);
  assert.match(changelog, /GitHub Actions permissions remain job-scoped/);
  assert.match(changelog, /moved artifact preflight and post-publish verification into read-only jobs/);
  assert.match(changelog, /release artifact verification script for macOS zips and checksum files/);
  assert.match(changelog, /release artifact staging helper for flattening downloaded GitHub Actions artifacts/);
  assert.match(changelog, /stale macOS release artifact detection/);
  assert.match(changelog, /live latest-release audit command for public macOS zip and checksum assets/);
  assert.match(changelog, /live latest-release audit now prints release preparation remediation guidance/);
  assert.match(changelog, /live latest-release audit now points release blockers to the dry-run publish helper/);
  assert.match(changelog, /live latest-release audit now explains how to recover from GitHub API rate limits/);
  assert.match(changelog, /live latest-release audit now falls back to public GitHub HTML when the API is rate-limited/);
});

test('release workflow generates GitHub release notes for tagged builds', () => {
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const releaseConfig = fs.readFileSync(path.join(projectRoot, '.github', 'release.yml'), 'utf-8');
  const releaseWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'release.yml'), 'utf-8');
  const releasePublisher = fs.readFileSync(path.join(projectRoot, 'scripts', 'publish-release.js'), 'utf-8');
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');

  assert.match(releaseConfig, /changelog:/);
  assert.match(releaseConfig, /title: New Features/);
  assert.match(releaseConfig, /title: Bug Fixes/);
  assert.match(releaseConfig, /title: CHM Compatibility/);
  assert.match(releaseConfig, /title: Performance/);
  assert.match(releaseConfig, /title: Accessibility/);
  assert.match(releaseConfig, /title: Community/);
  assert.match(releaseConfig, /title: Documentation/);
  assert.match(releaseConfig, /title: Maintenance/);
  assert.match(releaseConfig, /title: Other Changes/);
  assert.match(releaseConfig, /labels:\n\s+- enhancement/);
  assert.match(releaseConfig, /labels:\n\s+- bug/);
  assert.match(releaseConfig, /labels:\n\s+- compatibility/);
  assert.match(releaseConfig, /labels:\n\s+- performance/);
  assert.match(releaseConfig, /labels:\n\s+- accessibility/);
  assert.match(releaseConfig, /labels:\n\s+- question\n\s+- showcase/);
  assert.match(releaseWorkflow, /node scripts\/publish-release\.js/);
  assert.match(releasePublisher, /generate_release_notes: true/);
  assert.match(releaseDoc, /GitHub appends automatically generated release notes from merged pull requests and commits after that curated download and trust block/);
  assert.match(releaseDoc, /`\.github\/release\.yml` groups generated notes into user-facing sections/);
  assert.match(releaseDoc, /Confirm performance fixes and benchmark-driven improvements appear under the Performance release notes section/);
  assert.match(releaseDoc, /Confirm accessibility fixes for keyboard, VoiceOver, focus, contrast, or appearance appear under the Accessibility release notes section/);
  assert.match(releaseDoc, /Confirm community questions, showcase stories, and Discussion follow-ups appear under the Community release notes section/);
  assert.match(releaseDoc, /Create or refresh a release-feedback Discussion for this version/);
  assert.match(releaseDoc, /Pin the current release-feedback Discussion before wider announcements/);
  assert.match(releaseDoc, /Link the pinned release-feedback thread from the release notes if trust, download, or first-launch questions repeat/);
  assert.match(releaseDoc, /Review the generated release notes before announcing the release/);
  assert.match(changelog, /GitHub-generated release notes for tagged builds/);
  assert.match(changelog, /release notes category configuration/);
  assert.match(changelog, /Performance release notes grouping for slow CHM and large-library fixes/);
  assert.match(changelog, /Accessibility release notes grouping for keyboard and assistive technology fixes/);
  assert.match(changelog, /Community release notes grouping for questions and showcase stories/);
  assert.match(changelog, /release checklist now creates and pins the current release-feedback Discussion before promotion/);
});

test('release page template makes download artifacts easier to trust', () => {
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');
  const shareKit = fs.readFileSync(path.join(projectRoot, 'docs', 'share-kit.md'), 'utf-8');
  const releaseTemplate = fs.readFileSync(path.join(projectRoot, 'docs', 'release-template.md'), 'utf-8');

  assert.match(docsIndex, /\[Release Page Template\]\(\.\/release-template\.md\)/);
  assert.match(releaseDoc, /\[Release Page Template\]\(\.\/release-template\.md\)/);
  assert.match(shareKit, /\[Release Page Template\]\(\.\/release-template\.md\)/);
  assert.match(releaseTemplate, /# Release Page Template/);
  assert.match(releaseTemplate, /CHMReaderLight v<version>/);
  assert.match(releaseTemplate, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(releaseTemplate, /CHMReaderLight-mac-x64\.zip/);
  assert.match(releaseTemplate, /\.zip\.sha256/);
  assert.match(releaseTemplate, /shasum -a 256 -c CHMReaderLight-mac-arm64\.zip\.sha256/);
  assert.match(releaseTemplate, /Optional provenance check with GitHub artifact attestation/);
  assert.match(releaseTemplate, /gh attestation verify CHMReaderLight-mac-arm64\.zip --repo zhongdiandaoda\/chm-reader-light/);
  assert.match(releaseTemplate, /not Apple-notarized yet/);
  assert.match(releaseTemplate, /System Settings > Privacy & Security/);
  assert.match(releaseTemplate, /\[Project Status\]\(\.\/project-status\.md\)/);
  assert.match(releaseTemplate, /\[macOS Install Guide\]\(\.\/install-macos\.md\)/);
  assert.match(releaseTemplate, /\[Compatibility Notes\]\(\.\/compatibility\.md\)/);
  assert.match(releaseTemplate, /\[Privacy and Local Data\]\(\.\/privacy\.md\)/);
  assert.match(releaseTemplate, /\[Troubleshooting\]\(\.\/troubleshooting\.md\)/);
  assert.match(releaseTemplate, /\[Showcase Guide\]\(\.\/showcase\.md\)/);
  assert.match(releaseTemplate, /\[release-feedback Discussion\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\/new\?category=release-feedback\)/);
  assert.match(releaseTemplate, /Help > Copy Share Text/);
  assert.match(releaseTemplate, /share a ready-made summary with release, star, feedback, and showcase links/);
  assert.match(releaseTemplate, /## Performance Notes/);
  assert.match(releaseTemplate, /List benchmark-backed opening, extraction, search indexing, search, startup, or large-library improvements here/);
  assert.match(releaseTemplate, /## Accessibility Notes/);
  assert.match(releaseTemplate, /List keyboard, VoiceOver, focus, contrast, or appearance fixes here/);
  assert.match(releaseDoc, /Confirm the release body links to \[Project Status\]\(\.\/project-status\.md\)/);
  assert.match(releaseTemplate, /Help > Star on GitHub/);
  assert.match(changelog, /release page template for clearer download artifacts and first-launch expectations/);
  assert.match(changelog, /macOS install guide and release template provenance verification notes/);
  assert.match(changelog, /release page template links to the project status guide/);
  assert.match(changelog, /release page template Performance Notes placeholder/);
  assert.match(changelog, /release page template Accessibility Notes placeholder/);
  assert.match(changelog, /release page template now asks trial users for release feedback before promotion/);
  assert.match(changelog, /release page template now points successful users to Help > Copy Share Text/);
});

test('Dependabot pull requests use release-note friendly metadata', () => {
  const dependabot = fs.readFileSync(path.join(projectRoot, '.github', 'dependabot.yml'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(dependabot, /labels:\n\s+- dependencies/);
  assert.match(dependabot, /commit-message:\n\s+prefix: chore/);
  assert.match(dependabot, /labels:\n\s+- github-actions/);
  assert.match(changelog, /Dependabot PR labels and chore commit prefixes/);
});

test('privacy docs explain local data handling and reader boundaries', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const security = fs.readFileSync(path.join(projectRoot, 'SECURITY.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const privacy = fs.readFileSync(path.join(projectRoot, 'docs', 'privacy.md'), 'utf-8');

  assert.match(readme, /\[Privacy and Local Data\]\(\.\/docs\/privacy\.md\)/);
  assert.match(security, /\[Privacy and Local Data\]\(\.\/docs\/privacy\.md\)/);
  assert.match(changelog, /privacy and local data documentation/);
  assert.match(privacy, /does not include telemetry, analytics, accounts, cloud sync, or hosted document storage/);
  assert.match(privacy, /library\/library\.json/);
  assert.match(privacy, /extracted-books\//);
  assert.match(privacy, /system temp directory/);
  assert.match(privacy, /browser `localStorage`/);
  assert.match(privacy, /macOS recent documents menu/);
  assert.match(privacy, /restricted `chm:\/\/` protocol/);
  assert.match(privacy, /Content Security Policy/);
  assert.match(privacy, /blocks CHM-authored scripts, inline event handlers, form submissions, nested frames, plugin objects, and network connections/);
  assert.match(privacy, /nonce-protected navigation bridge/);
});

test('security policy sets response expectations for vulnerability reports', () => {
  const security = fs.readFileSync(path.join(projectRoot, 'SECURITY.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(security, /CodeQL code scanning runs on pull requests, pushes to `main`, and a weekly schedule/);
  assert.match(security, /## Response Expectations/);
  assert.match(security, /Acknowledge new reports within 7 days/);
  assert.match(security, /Share a status update at least every 14 days/);
  assert.match(security, /Coordinate public disclosure after a fix is available/);
  assert.match(security, /Document confirmed fixes in `CHANGELOG.md` and the relevant GitHub Release notes/);
  assert.match(changelog, /security response expectations/);
  assert.match(changelog, /CodeQL security scanning workflow/);
});

test('Chinese security policy makes private vulnerability reporting discoverable', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const security = fs.readFileSync(path.join(projectRoot, 'SECURITY.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const communityStandards = fs.readFileSync(path.join(projectRoot, 'docs', 'community-standards.md'), 'utf-8');
  const codeowners = fs.readFileSync(path.join(projectRoot, '.github', 'CODEOWNERS'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-community-health.js'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const chineseSecurity = fs.readFileSync(path.join(projectRoot, 'SECURITY.zh-CN.md'), 'utf-8');

  assert.match(readme, /\[中文安全政策\]\(\.\/SECURITY\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Chinese Security Policy\]\(\.\/SECURITY\.zh-CN\.md\)/);
  assert.match(support, /\[Chinese Security Policy\]\(\.\/SECURITY\.zh-CN\.md\)/);
  assert.match(security, /\[中文安全政策\]\(\.\/SECURITY\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Chinese Security Policy\]\(\.\.\/SECURITY\.zh-CN\.md\)/);
  assert.match(communityStandards, /\[SECURITY\.zh-CN\.md\]\(\.\.\/SECURITY\.zh-CN\.md\)/);
  assert.match(codeowners, /\/SECURITY\.zh-CN\.md @zhongdiandaoda/);
  assert.match(checker, /'SECURITY\.zh-CN\.md'/);
  assert.match(changelog, /Chinese security policy for private vulnerability reporting/);
  assert.match(chineseSecurity, /# CHMReaderLight 中文安全政策/);
  assert.match(chineseSecurity, /\[English Security Policy\]\(\.\/SECURITY\.md\)/);
  assert.match(chineseSecurity, /## 支持版本/);
  assert.match(chineseSecurity, /`main`/);
  assert.match(chineseSecurity, /## 自动化检查/);
  assert.match(chineseSecurity, /CodeQL/);
  assert.match(chineseSecurity, /## 报告漏洞/);
  assert.match(chineseSecurity, /不要在公开 issue 中发布漏洞细节/);
  assert.match(chineseSecurity, /private vulnerability reporting/);
  assert.match(chineseSecurity, /不要包含私有 CHM 内容、敏感路径或可复现攻击载荷/);
  assert.match(chineseSecurity, /## 响应预期/);
  assert.match(chineseSecurity, /7 天内确认/);
  assert.match(chineseSecurity, /每 14 天至少更新一次状态/);
});

test('CodeQL workflow scans TypeScript and JavaScript sources', () => {
  const codeqlWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'codeql.yml'), 'utf-8');

  assert.match(codeqlWorkflow, /^name: CodeQL$/m);
  assert.match(codeqlWorkflow, /^  pull_request:$/m);
  assert.match(codeqlWorkflow, /^  push:$/m);
  assert.match(codeqlWorkflow, /^  schedule:$/m);
  assert.match(codeqlWorkflow, /cron: '0 2 \* \* 1'/);
  assert.match(codeqlWorkflow, /^permissions:$/m);
  assert.match(codeqlWorkflow, /^  security-events: write$/m);
  assert.match(codeqlWorkflow, /^  contents: read$/m);
  assert.match(codeqlWorkflow, /uses: github\/codeql-action\/init@[a-f0-9]{40} # v4/);
  assert.match(codeqlWorkflow, /languages: javascript-typescript/);
  assert.match(codeqlWorkflow, /uses: github\/codeql-action\/analyze@[a-f0-9]{40} # v4/);
});

test('dependency audit gate blocks moderate and high severity advisories', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const packageLock = fs.readFileSync(path.join(projectRoot, 'package-lock.json'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');
  const ciWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'ci.yml'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.equal(packageJson.scripts['check:audit'], 'npm audit --audit-level=moderate --cache /tmp/chm-reader-npm-cache');
  assert.match(packageJson.scripts.check, /npm run check:audit/);
  assert.match(packageLock, /"node_modules\/brace-expansion": \{\n\s+"version": "5\.0\.9"/);
  assert.match(packageLock, /"node_modules\/minimatch": \{\n\s+"version": "10\.2\.6"/);
  assert.match(packageLock, /"node_modules\/undici": \{\n\s+"version": "7\.29\.0"/);
  assert.match(packageLock, /"node_modules\/@xmldom\/xmldom": \{\n\s+"version": "0\.9\.12"/);
  assert.match(ciWorkflow, /run: npm run check:audit/);
  assert.match(readme, /`npm run check:audit`：检查 moderate severity 及以上的 npm 安全公告。/);
  assert.match(englishReadme, /`npm run check` also validates Markdown links, moderate severity npm audit advisories, duplicate changelog entries, the README script inventory, documentation index coverage, repository metadata consistency, GitHub label consistency, community health file coverage, visual repository assets, release page template alignment, Node\.js version alignment, license metadata alignment, README badge coverage, AI project summary coverage, growth readiness coverage, GitHub Actions workflow trust checks, and GitHub template quality checks/);
  assert.match(contributing, /`npm run check:audit` fails on moderate severity npm advisories/);
  assert.match(testingGuide, /npm run check:audit/);
  assert.match(testingGuide, /moderate severity npm advisories/);
  assert.match(releaseDoc, /npm run check:audit/);
  assert.match(changelog, /moderate-severity npm audit gate/);
  assert.match(changelog, /Updated transitive dependency locks for `undici`, `minimatch`, `brace-expansion`, and `@xmldom\/xmldom`/);
});

test('security model documents the CHM reader trust boundaries', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const security = fs.readFileSync(path.join(projectRoot, 'SECURITY.md'), 'utf-8');
  const chineseSecurity = fs.readFileSync(path.join(projectRoot, 'SECURITY.zh-CN.md'), 'utf-8');
  const privacy = fs.readFileSync(path.join(projectRoot, 'docs', 'privacy.md'), 'utf-8');
  const chinesePrivacy = fs.readFileSync(path.join(projectRoot, 'docs', 'privacy.zh-CN.md'), 'utf-8');
  const compatibility = fs.readFileSync(path.join(projectRoot, 'docs', 'compatibility.md'), 'utf-8');
  const chineseCompatibility = fs.readFileSync(path.join(projectRoot, 'docs', 'compatibility.zh-CN.md'), 'utf-8');
  const chineseAdoptionGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'adoption-checklist.zh-CN.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const securityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.md'), 'utf-8');
  const chineseSecurityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.zh-CN.md'), 'utf-8');

  assert.match(readme, /\[Security Model\]\(\.\/docs\/security-model\.md\)/);
  assert.match(readme, /\[中文安全模型\]\(\.\/docs\/security-model\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Chinese Security Model\]\(\.\/docs\/security-model\.zh-CN\.md\)/);
  assert.match(security, /\[Security Model\]\(\.\/docs\/security-model\.md\)/);
  assert.match(chineseSecurity, /\[中文安全模型\]\(\.\/docs\/security-model\.zh-CN\.md\)/);
  assert.match(privacy, /\[Security Model\]\(\.\/security-model\.md\)/);
  assert.match(chinesePrivacy, /\[中文安全模型\]\(\.\/security-model\.zh-CN\.md\)/);
  assert.match(compatibility, /\[Security Model\]\(\.\/security-model\.md\)/);
  assert.match(chineseCompatibility, /\[中文安全模型\]\(\.\/security-model\.zh-CN\.md\)/);
  assert.match(chineseAdoptionGuide, /\[中文安全模型\]\(\.\/security-model\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Security Model\]\(\.\/security-model\.md\)/);
  assert.match(docsIndex, /\[Chinese Security Model\]\(\.\/security-model\.zh-CN\.md\)/);
  assert.match(changelog, /security model for CHM trust boundaries/);
  assert.match(changelog, /Chinese security model for localized CHM trust boundaries and reader isolation/);
  assert.match(securityModel, /# Security Model/);
  assert.match(securityModel, /## Trust Boundaries/);
  assert.match(securityModel, /CHM files are untrusted input/);
  assert.match(securityModel, /restricted `chm:\/\/` protocol/);
  assert.match(securityModel, /## Reader Isolation/);
  assert.match(securityModel, /Content Security Policy/);
  assert.match(securityModel, /nonce-protected navigation bridge/);
  assert.match(securityModel, /## Local Data Boundaries/);
  assert.match(securityModel, /does not upload, sync, or host CHM content/);
  assert.match(securityModel, /## Security Review Checklist/);
  assert.match(securityModel, /path traversal/);
  assert.match(securityModel, /external `http` and `https` links/);
  assert.match(chineseSecurityModel, /# CHMReaderLight 中文安全模型/);
  assert.match(chineseSecurityModel, /\[English Security Model\]\(\.\/security-model\.md\)/);
  assert.match(chineseSecurityModel, /## 信任边界/);
  assert.match(chineseSecurityModel, /CHM 文件是不受信任输入/);
  assert.match(chineseSecurityModel, /受限的 `chm:\/\/` 协议/);
  assert.match(chineseSecurityModel, /## 阅读器隔离/);
  assert.match(chineseSecurityModel, /Content Security Policy/);
  assert.match(chineseSecurityModel, /nonce-protected navigation bridge/);
  assert.match(chineseSecurityModel, /## 本地数据边界/);
  assert.match(chineseSecurityModel, /不会上传、同步或托管 CHM 内容/);
  assert.match(chineseSecurityModel, /## 安全审查清单/);
  assert.match(chineseSecurityModel, /path traversal/);
  assert.match(chineseSecurityModel, /external `http` 和 `https` links/);
}
);

test('content iframe blocks CHM-authored active content while allowing the navigation bridge', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const iframe = html.match(/<iframe\s+[^>]*id="content-frame"[^>]*>/s)?.[0] || '';
  const sandbox = iframe.match(/sandbox="([^"]+)"/)?.[1] || '';

  assert.match(sandbox, /\ballow-same-origin\b/);
  assert.match(sandbox, /\ballow-scripts\b/);
  assert.match(main, /default-src 'none'; base-uri 'none'; object-src 'none'; connect-src 'none'; form-action 'none'; frame-src 'none'; child-src 'none'; img-src chm: data:; style-src chm: 'unsafe-inline'; script-src 'nonce-\$\{scriptNonce\}'; script-src-attr 'none'; font-src chm: data:; media-src chm:/);
  assert.match(main, /default-src 'none'; base-uri 'none'; object-src 'none'; connect-src 'none'; form-action 'none'; frame-src 'none'; child-src 'none'; img-src chm: data:; style-src chm: 'unsafe-inline'; script-src 'none'; script-src-attr 'none'; font-src chm: data:; media-src chm:/);
  assert.doesNotMatch(main, /script-src[^;\n]*'unsafe-inline'/);
  assert.doesNotMatch(main, /script-src[^;\n]*chm:/);
  assert.match(changelog, /Tightened the CHM content security policy/);
});

test('untrusted HTML transforms enforce bounded page and search-index source budgets', () => {
  const chm = fs.readFileSync(path.join(projectRoot, 'src', 'chm.ts'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const worker = fs.readFileSync(path.join(projectRoot, 'src', 'search-index-worker.ts'), 'utf-8');
  const securityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.md'), 'utf-8');
  const chineseSecurityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.zh-CN.md'), 'utf-8');
  const compatibility = fs.readFileSync(path.join(projectRoot, 'docs', 'compatibility.md'), 'utf-8');
  const chineseCompatibility = fs.readFileSync(path.join(projectRoot, 'docs', 'compatibility.zh-CN.md'), 'utf-8');
  const searchGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'search.md'), 'utf-8');
  const chineseSearchGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'search.zh-CN.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.ok(chm.includes('maxMarkupBytes: 16 * 1024 * 1024'));
  assert.ok(chm.includes('maxSearchIndexSourceBytes: 128 * 1024 * 1024'));
  assert.ok(chm.includes('MAX_SEARCH_MATCHES_PER_PAGE = 10_000'));
  assert.ok(chm.includes('maxItems: 50_000'));
  assert.ok(chm.includes('maxDepth: 256'));
  assert.ok(chm.includes('await readMarkupFile(metadata.contentsFile'));
  assert.ok(!main.includes('decodeMarkup(await fs.promises.readFile(filePath)'));
  assert.ok(main.includes('await readMarkupFile(filePath, bookTextEncoding)'));
  assert.match(main, /error instanceof MarkupTooLargeError/);
  assert.match(main, /status: 413/);
  assert.match(worker, /maxMarkupBytes: workerData.maxMarkupBytes/);
  assert.match(worker, /maxSearchIndexSourceBytes: workerData.maxSearchIndexSourceBytes/);
  assert.ok(worker.includes('await validateExtractedBookTree(workerData.root)'));
  assert.doesNotMatch(worker, /listFiles/);
  assert.match(securityModel, /reuses the bounded asynchronous tree walk's file list/);
  assert.match(chineseSecurityModel, /复用有界异步目录遍历生成的文件清单/);
  assert.match(securityModel, /16 MiB per HTML or HHC file/);
  assert.match(securityModel, /128 MiB of HTML source per search index/);
  assert.match(securityModel, /50,000 table-of-contents items and 256 nesting levels/);
  assert.match(chineseSecurityModel, /单个 HTML 或 HHC 文件 16 MiB/);
  assert.match(chineseSecurityModel, /每本书搜索索引的 HTML 源数据 128 MiB/);
  assert.match(chineseSecurityModel, /50,000 个目录项和 256 层嵌套/);
  assert.match(compatibility, /HTML or HHC file above 16 MiB/);
  assert.match(compatibility, /128 MiB source budget/);
  assert.match(chineseCompatibility, /HTML 或 HHC 文件超过 16 MiB/);
  assert.match(chineseCompatibility, /128 MiB 源数据预算/);
  assert.match(searchGuide, /16 MiB/);
  assert.match(searchGuide, /128 MiB/);
  assert.match(searchGuide, /10,000 matches per page/);
  assert.match(chineseSearchGuide, /16 MiB/);
  assert.match(chineseSearchGuide, /128 MiB/);
  assert.match(chineseSearchGuide, /每页 10,000 个匹配项/);
  assert.match(testingGuide, /readMarkupFile|createSearchIndex/);
  assert.match(changelog, /Bounded in-memory HTML and HHC transforms/);
  assert.match(changelog, /Capped per-page search match counting and highlighting at 10,000/);
  assert.match(changelog, /Bounded HHC table-of-contents parsing at 50,000 items and 256 nesting levels/);
  assert.match(changelog, /Reused bounded asynchronous extracted-tree scans/);
});

test('library metadata persistence has a bounded file size', () => {
  const store = fs.readFileSync(path.join(projectRoot, 'src', 'library-store.ts'), 'utf-8');
  const library = fs.readFileSync(path.join(projectRoot, 'src', 'library.ts'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const securityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.md'), 'utf-8');
  const chineseSecurityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.ok(store.includes('DEFAULT_LIBRARY_FILE_LIMIT_BYTES = 16 * 1024 * 1024'));
  assert.ok(store.includes('Buffer.byteLength(serialized)'));
  assert.ok(store.includes('O_NOFOLLOW'));
  assert.ok(library.includes('maxCollections: 1_000'));
  assert.ok(library.includes('maxBooks: 10_000'));
  assert.ok(library.includes('maxNameChars: 512'));
  assert.ok(main.includes('normalizeLibraryData(parsed)'));
  assert.ok(main.includes('normalizeLibraryDataForWrite(library)'));
  assert.ok(main.includes('createSerializedStateUpdater(readLibrary, writeLibrary, withBookAvailability)'));
  assert.match(securityModel, /Library metadata reads and writes are limited to 16 MiB/);
  assert.match(securityModel, /10,000 books and 1,000 collections/);
  assert.match(securityModel, /immediately before every write/);
  assert.match(securityModel, /read-modify-write updates are serialized/);
  assert.match(chineseSecurityModel, /书库 metadata 的读写上限为 16 MiB/);
  assert.match(chineseSecurityModel, /10,000 本书和 1,000 个分组/);
  assert.match(chineseSecurityModel, /每次写入前校验/);
  assert.match(chineseSecurityModel, /读改写操作会串行执行/);
  assert.match(changelog, /Bounded library metadata reads and writes at 16 MiB/);
  assert.match(changelog, /validated persisted library fields/);
  assert.match(changelog, /Serialized library read-modify-write operations/);
});

test('reader opens external CHM links in the default browser', () => {
  const chm = fs.readFileSync(path.join(projectRoot, 'src', 'chm.ts'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(chm, /type: 'chm-reader:open-external'/);
  assert.match(chm, /event\.preventDefault\(\)/);
  assert.match(main, /handleTrustedIpc\('external:open'/);
  assert.match(main, /const externalUrl = normalizeExternalWebUrl\(url\)/);
  assert.match(main, /if \(externalUrl\) return shell\.openExternal\(externalUrl\)/);
  assert.match(preload, /openExternal: \(url\) => ipcRenderer\.invoke\('external:open', url\)/);
  assert.match(renderer, /if \(event\.data\?\.type === 'chm-reader:open-external'\)/);
  assert.match(renderer, /if \(event\.source !== elements\.contentFrame\.contentWindow\) return/);
  assert.match(renderer, /openExternalLink\(event\.data\.href\)/);
  assert.match(readme, /外部网页链接会在默认浏览器中打开/);
  assert.match(changelog, /External web links inside CHM pages now open in the default browser/);
});

test('application menu actions consume rejected promises', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const start = main.indexOf('function guardMenuActionFailures(');
  const end = main.indexOf('function createMenu()', start);
  const implementation = main.slice(start, end);

  assert.ok(start >= 0 && end > start);
  assert.match(implementation, /void Promise\.resolve\(\)[\s\S]*?\.then\(\(\) => click\(menuItem, browserWindow, event\)\)[\s\S]*?\.catch\(\(error: unknown\) => \{/);
  assert.match(implementation, /reportMainProcessError\('Unable to Complete Menu Action', error\)/);
  assert.doesNotMatch(implementation, /dialog\.showMessageBox/);
  assert.match(main, /Menu\.buildFromTemplate\(guardMenuActionFailures\(template\)\)/);
});

test('main-process lifecycle promises always consume rejections', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

  assert.match(main, /function reportMainProcessError\(title: string, error: unknown, showDialog = true\): void/);
  assert.match(main, /const targetWindow = getLiveMainWindow\(\)/);
  assert.match(main, /void Promise\.resolve\(\)[\s\S]*?targetWindow[\s\S]*?dialog\.showMessageBox\(targetWindow, options\)[\s\S]*?dialog\.showMessageBox\(options\)[\s\S]*?\.catch\(\(\) => \{ \}\)/);
  assert.match(main, /void browserWindow\.loadFile\([\s\S]*?\.catch\(\(error: unknown\) => \{/);
  assert.match(main, /reportMainProcessError\('Unable to Load Application Window', error\)/);
  assert.match(main, /void searchIndexWorker\.terminate\(\)\.catch\(\(error: unknown\) => \{/);
  assert.match(main, /reportMainProcessError\('Unable to Stop Search Index Worker', error, false\)/);
  assert.match(main, /void app\.whenReady\(\)\.then\(async \(\) => \{/);
  assert.match(main, /\.catch\(\(error: unknown\) => \{[\s\S]*?reportMainProcessError\('Unable to Start CHMReaderLight', error\)[\s\S]*?app\.quit\(\)/);
});

test('Finder and command-line CHM opens report failures instead of silently swallowing them', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

  assert.match(main, /function importAndOpenFromSystem\(filePath: string\): void/);
  assert.match(main, /void importAndOpen\(filePath\)\.catch\(\(error: unknown\) => \{/);
  assert.match(main, /reportMainProcessError\('Unable to Open CHM', error\)/);
  assert.equal((main.match(/importAndOpenFromSystem\(/g) || []).length, 4);
  assert.doesNotMatch(main, /importAndOpen\([^\n]+\)\.catch\(\(\) => \{ \}\)/);
});

test('main window rejects renderer-initiated navigation and popup creation', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

  assert.match(main, /browserWindow\.webContents\.setWindowOpenHandler\(\(\) => \(\{ action: 'deny' \}\)\)/);
  assert.match(main, /'will-frame-navigate',[\s\S]*\(event: Electron\.Event<Electron\.WebContentsWillFrameNavigateEventParams>\) => \{/);
  assert.match(main, /isAllowedBookFrameNavigation\(event\.url, event\.isMainFrame\)/);
  assert.match(main, /browserWindow\.webContents\.on\('will-navigate', \(event: Electron\.Event\) => \{/);
  assert.match(main, /event\.preventDefault\(\)/);
});

test('browser session denies unneeded web permissions by default', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

  assert.match(main, /browserWindow\.webContents\.session\.setPermissionCheckHandler\(\(\) => false\)/);
  assert.match(main, /browserWindow\.webContents\.session\.setPermissionRequestHandler\(/);
  assert.match(main, /callback\(false\)/);
});

test('all renderer invoke endpoints enforce the trusted IPC sender boundary', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const directRegistrations = main.match(/ipcMain\.handle\(/g) || [];
  const trustedChannels = [...main.matchAll(/handleTrustedIpc\('([^']+)'/g)]
    .map((match) => match[1]);

  assert.equal(directRegistrations.length, 1, 'only the trusted wrapper may call ipcMain.handle');
  assert.deepEqual(trustedChannels, [
    'library:list',
    'library:import',
    'library:import-paths',
    'library:open',
    'library:remove',
    'library:reveal',
    'library:relink',
    'collection:create',
    'collection:rename',
    'collection:remove',
    'book:url',
    'book:search',
    'book:encoding',
    'view:set',
    'external:open',
  ]);
  assert.match(main, /isTrustedIpcSender\(event, targetWindow\?\.webContents \|\| null\)/);
  assert.match(main, /throw new Error\('Unauthorized IPC sender'\)/);
});

test('compiled renderer is loaded as an ES module', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  assert.match(html, /<script type="module" src="\.\/renderer\.js"><\/script>/);
});

test('reader toolbar places text encoding picker after zoom controls', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const readerToolbar = html.match(/<header class="app-header" id="reader-toolbar"[\s\S]*?<\/header>/)?.[0] || '';
  const toolbarRight = readerToolbar.match(/<div class="toolbar-right">[\s\S]*?<\/div>\s*<\/div>\s*<\/header>/)?.[0] || '';

  const zoomInIndex = toolbarRight.indexOf('id="zoom-in"');
  const encodingIndex = toolbarRight.indexOf('id="text-encoding"');

  assert.ok(zoomInIndex >= 0, 'reader toolbar should include zoom-in control');
  assert.ok(encodingIndex > zoomInIndex, 'text encoding picker should sit to the right of zoom controls');
  assert.match(toolbarRight, /<button class="encoding-trigger" id="text-encoding"[^>]*aria-haspopup="listbox"/);
  assert.match(toolbarRight, /<div class="encoding-menu" id="text-encoding-menu" role="listbox"[^>]*hidden>/);
  assert.doesNotMatch(toolbarRight, /<select id="text-encoding"/);
  assert.match(toolbarRight, /data-encoding="auto"[^>]*>默认编码<\/button>/);
  assert.match(toolbarRight, /data-encoding="gbk"[^>]*>简体中文 \(GBK\)<\/button>/);
  assert.match(toolbarRight, /data-encoding="gb18030"[^>]*>简体中文 \(GB18030\)<\/button>/);
});

test('encoding picker menu is anchored below the trigger instead of using native select popup', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');

  assert.match(css, /\.encoding-picker\s*{[^}]*position: relative;/s);
  assert.match(css, /\.encoding-menu\s*{[^}]*position: absolute;[^}]*top: calc\(100% \+ 6px\);/s);
  assert.match(css, /\.encoding-menu\s*{[^}]*right: 0;/s);
});

test('reader text encoding preference persists between launches', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /const textEncodingStorageKey = 'chm-reader-text-encoding'/);
  assert.match(renderer, /function isSupportedTextEncoding\(encoding: string \| null \| undefined\): boolean/);
  assert.match(renderer, /function loadTextEncodingPreference\(\): string/);
  assert.match(renderer, /window\.localStorage\.getItem\(textEncodingStorageKey\)/);
  assert.match(renderer, /isSupportedTextEncoding\(saved\) \? saved \|\| 'auto' : 'auto'/);
  assert.match(renderer, /function saveTextEncodingPreference\(encoding: string\): void/);
  assert.match(renderer, /window\.localStorage\.setItem\(textEncodingStorageKey, encoding\)/);
  assert.match(renderer, /window\.localStorage\.removeItem\(textEncodingStorageKey\)/);
  assert.match(renderer, /await window\.chmReader\.setTextEncoding\(nextEncoding\)/);
  assert.match(renderer, /saveTextEncodingPreference\(nextEncoding\)/);
  assert.match(renderer, /const preferredTextEncoding = loadTextEncodingPreference\(\)/);
  assert.match(renderer, /setTextEncodingControlValue\(preferredTextEncoding\)/);
  assert.match(renderer, /window\.chmReader\.setTextEncoding\(preferredTextEncoding\)\.catch/);
  assert.doesNotMatch(
    renderer,
    /window\.chmReader\.setTextEncoding\(preferredTextEncoding\)\.catch\(\(\) => \{[\s\S]*?saveTextEncodingPreference\('auto'\)/,
  );
  assert.match(readme, /文本编码偏好保留/);
  assert.match(changelog, /selected text encoding between app launches/);
});

test('reader search scope preference persists between launches', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const searchGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'search.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /const readerSearchScopeStorageKey = 'chm-reader-search-scope'/);
  assert.match(renderer, /function loadReaderSearchScopePreference\(\): SearchScope/);
  assert.match(renderer, /window\.localStorage\.getItem\(readerSearchScopeStorageKey\)/);
  assert.match(renderer, /saved === 'directory' \|\| saved === 'body'/);
  assert.match(renderer, /function saveReaderSearchScopePreference\(scope: SearchScope\): void/);
  assert.match(renderer, /window\.localStorage\.setItem\(readerSearchScopeStorageKey, scope\)/);
  assert.match(renderer, /const preferredSearchScope = loadReaderSearchScopePreference\(\)/);
  assert.match(renderer, /scope: preferredSearchScope/);
  assert.match(renderer, /setSearchScope\(preferredSearchScope, false\)/);
  assert.match(renderer, /function setSearchScope\(scope: SearchScope, persist = true\): void/);
  assert.match(renderer, /if \(persist\) saveReaderSearchScopePreference\(scope\)/);
  assert.match(readme, /搜索范围偏好保留/);
  assert.match(englishReadme, /search scope preference/);
  assert.match(searchGuide, /The selected search scope is saved locally/);
  assert.match(changelog, /reader search scope between app launches/);
});

test('reader search scope menu supports keyboard navigation', () => {
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const shortcuts = fs.readFileSync(path.join(projectRoot, 'docs', 'shortcuts.md'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /function getSearchScopeOptions\(\): UiElement\[\]/);
  assert.match(renderer, /return \[elements\.searchBody, elements\.searchDirectory\]/);
  assert.match(renderer, /function setSearchScopeMenuOpen\(isOpen: boolean\): void/);
  assert.match(renderer, /function focusSearchScopeOption\(offset: number\): void/);
  assert.match(renderer, /function focusFirstSearchScopeOption\(\): void/);
  assert.match(renderer, /function focusLastSearchScopeOption\(\): void/);
  assert.match(renderer, /elements\.searchScopeTrigger\.addEventListener\('keydown'/);
  assert.match(renderer, /if \(!\['ArrowDown', 'ArrowUp', 'Enter', ' '\]\.includes\(event\.key\)\) return/);
  assert.match(renderer, /if \(event\.key === 'ArrowUp'\) focusLastSearchScopeOption\(\)/);
  assert.match(renderer, /elements\.searchScopeMenu\.addEventListener\('keydown'/);
  assert.match(renderer, /if \(event\.key === 'Home'\)/);
  assert.match(renderer, /if \(event\.key === 'End'\)/);
  assert.match(renderer, /if \(event\.key === 'Escape'\)/);
  assert.match(renderer, /setSearchScopeMenuOpen\(false\)/);
  assert.match(renderer, /elements\.searchScopeTrigger\.focus\(\)/);
  assert.match(renderer, /if \(scope\) setSearchScope\(scope\)/);
  assert.match(shortcuts, /Search scope menu/);
  assert.match(shortcuts, /`ArrowUp` \/ `ArrowDown`/);
  assert.match(shortcuts, /`Enter` or `Space`/);
  assert.match(changelog, /reader search scope menu keyboard navigation/);
});

test('runtime prefers the bundled CHM extractor', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

  assert.match(main, /resourcesPath, 'native', nativeName, 'bin', 'extract_chmLib'/);
  assert.match(main, /resources', 'native', nativeName, 'bin', 'extract_chmLib'/);
});

test('library view supports dragging CHM files into the current collection', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(html, /id="library-drop-target"/);
  assert.match(html, /松手添加 CHM 文件/);
  assert.match(html, /拖入 \.chm 文件/);
  assert.match(css, /\.library-content\[data-drag-state="ready"\] \.library-drop-target/s);
  assert.match(css, /\.library-content\[data-drag-state="invalid"\] \.library-drop-target/s);
  assert.match(preload, /webUtils\.getPathForFile\(file\)/);
  assert.match(preload, /ipcRenderer\.invoke\('library:import-paths', filePaths, collectionId\)/);
  assert.match(main, /handleTrustedIpc\('library:import-paths'/);
  assert.match(main, /const chmPaths = filePaths\.filter/);
  assert.match(main, /path\.extname\(filePath\)\.toLowerCase\(\) === '\.chm'/);
  assert.match(main, /importBooks\(chmPaths, collectionId\)/);
  assert.match(renderer, /initializeLibraryDropImport\(\)/);
  assert.match(renderer, /addEventListener\('drop', \(event: DragEvent\) =>/);
  assert.match(renderer, /window\.chmReader\.importDroppedFiles\(files, selectedCollectionId\)/);
});

test('empty library state links first-run users to onboarding docs', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(html, /<div class="empty-actions" aria-label="首次使用帮助">/);
  assert.match(html, /id="empty-getting-started"/);
  assert.match(html, /入门指南/);
  assert.match(html, /id="empty-feature-tour"/);
  assert.match(html, /功能导览/);
  assert.match(html, /id="empty-privacy"/);
  assert.match(html, /本地数据/);
  assert.match(html, /id="empty-troubleshooting"/);
  assert.match(html, /故障排查/);
  assert.match(preload, /openExternal: \(url: string\) => Promise<unknown>/);
  assert.match(renderer, /openExternal: \(url: string\) => Promise<unknown>/);
  assert.match(renderer, /const onboardingLinks = {/);
  assert.match(renderer, /gettingStarted: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/getting-started\.zh-CN\.md'/);
  assert.match(renderer, /featureTour: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/feature-tour\.zh-CN\.md'/);
  assert.match(renderer, /privacy: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/privacy\.zh-CN\.md'/);
  assert.match(renderer, /troubleshooting: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/troubleshooting\.zh-CN\.md'/);
  assert.match(renderer, /emptyGettingStarted: query\('#empty-getting-started'\)/);
  assert.match(renderer, /emptyFeatureTour: query\('#empty-feature-tour'\)/);
  assert.match(renderer, /elements\.emptyGettingStarted\.addEventListener\('click', \(\) =>/);
  assert.match(renderer, /openExternalLink\(onboardingLinks\.gettingStarted\)/);
  assert.match(renderer, /elements\.emptyFeatureTour\.addEventListener\('click', \(\) =>/);
  assert.match(renderer, /openExternalLink\(onboardingLinks\.featureTour\)/);
  assert.match(renderer, /elements\.emptyPrivacy\.addEventListener\('click', \(\) =>/);
  assert.match(renderer, /openExternalLink\(onboardingLinks\.privacy\)/);
  assert.match(renderer, /elements\.emptyTroubleshooting\.addEventListener\('click', \(\) =>/);
  assert.match(renderer, /openExternalLink\(onboardingLinks\.troubleshooting\)/);
  assert.match(css, /\.empty-actions\s*{/);
  assert.match(css, /\.empty-link-button\s*{/);
  assert.match(readme, /空书库页面会直接提供中文入门、中文功能导览、中文隐私说明和中文故障排查入口/);
  assert.match(changelog, /first-run empty library links now point to localized Chinese onboarding and support documentation/);
  assert.match(changelog, /first-run empty library links to privacy and troubleshooting documentation/);
  assert.match(changelog, /first-run empty library links to Getting Started and Feature Tour/);
});

test('library cards show a compact source folder label', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /getBookLocationLabel/);
  assert.match(renderer, /open\.title = entry\.filePath \|\| entry\.name/);
  assert.match(renderer, /<span class="library-location"><\/span>/);
  assert.match(renderer, /locationElement\.hidden = !location/);
  assert.match(css, /\.library-card-text\s*{/);
  assert.match(css, /\.library-location\s*{[^}]*text-overflow: ellipsis;/s);
  assert.match(css, /\.library-content\[data-layout="list"\] \.library-location\s*{/);
});

test('library cards show a compact added date label', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(renderer, /formatLibraryAddedDate/);
  assert.match(renderer, /<span class="library-added-date"><\/span>/);
  assert.match(renderer, /const addedDate = formatLibraryAddedDate\(entry\.addedAt\)/);
  assert.match(renderer, /addedDateElement\.textContent = addedDate \? `添加于 \$\{addedDate\}` : ''/);
  assert.match(renderer, /addedDateElement\.hidden = !addedDate/);
  assert.match(css, /\.library-added-date\s*{/);
  assert.match(css, /\.library-content\[data-layout="list"\] \.library-added-date\s*{/);
  assert.match(readme, /添加日期/);
  assert.match(englishReadme, /added date/);
  assert.match(changelog, /library card added date labels/);
});

test('library cards show last-opened metadata after successful opens', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(main, /lastOpenedAt\?: number/);
  assert.match(preload, /lastOpenedAt\?: number/);
  assert.match(renderer, /lastOpenedAt\?: number/);
  assert.match(main, /markBookOpenedInLibrary/);
  assert.match(main, /openedBook = await openBookTransaction\(chmPath, entry\.name\)/);
  assert.match(main, /runBookStateTask\(\(\) => openLibraryBookTransaction\(id\)\)/);
  assert.match(main, /const openedLibrary = await updateLibrary\(\(current\) => \(\s*markBookOpenedInLibrary\(current, id, Date\.now\(\)\) as LibraryState/s);
  assert.match(main, /const updateLibrary = createSerializedStateUpdater\(readLibrary, writeLibrary, withBookAvailability\)/);
  assert.match(main, /sendToMainWindow\('library:updated', openedLibrary\)/);
  assert.match(renderer, /<span class="library-last-opened"><\/span>/);
  assert.match(renderer, /const lastOpenedDate = formatLibraryAddedDate\(entry\.lastOpenedAt\)/);
  assert.match(renderer, /lastOpenedElement\.textContent = lastOpenedDate \? `上次打开 \$\{lastOpenedDate\}` : ''/);
  assert.match(renderer, /lastOpenedElement\.hidden = !lastOpenedDate/);
  assert.match(css, /\.library-last-opened\s*{/);
  assert.match(css, /\.library-content\[data-layout="list"\] \.library-last-opened\s*{/);
  assert.match(readme, /上次打开日期/);
  assert.match(englishReadme, /last-opened date/);
  assert.match(changelog, /library card last-opened date labels/);
});

test('library card open buttons expose metadata to assistive tech', () => {
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(renderer, /const cardDescriptionIdPrefix = `library-book-\$\{entry\.id\.replace\(\//);
  assert.match(renderer, /const describedBy: string\[\] = \[\]/);
  assert.match(renderer, /locationElement\.id = `\$\{cardDescriptionIdPrefix\}-location`/);
  assert.match(renderer, /lastOpenedElement\.id = `\$\{cardDescriptionIdPrefix\}-last-opened`/);
  assert.match(renderer, /addedDateElement\.id = `\$\{cardDescriptionIdPrefix\}-added`/);
  assert.match(renderer, /sourceStatus\.id = `\$\{cardDescriptionIdPrefix\}-source-status`/);
  assert.match(renderer, /continueReading\.id = `\$\{cardDescriptionIdPrefix\}-continue-reading`/);
  assert.match(renderer, /open\.setAttribute\('aria-describedby', describedBy\.join\(' '\)\)/);
  assert.match(changelog, /library card metadata available to assistive technologies/);
});

test('library ordering prioritizes recently opened books', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const librarySource = fs.readFileSync(path.join(projectRoot, 'src', 'library.ts'), 'utf-8');

  assert.match(librarySource, /const lastOpenedAtValue = \(book: LibraryBook\) =>/);
  assert.match(librarySource, /if \(leftLastOpenedAt !== rightLastOpenedAt\) return rightLastOpenedAt - leftLastOpenedAt/);
  assert.match(librarySource, /if \(leftAddedAt !== rightAddedAt\) return rightAddedAt - leftAddedAt/);
  assert.match(readme, /最近打开优先排序/);
  assert.match(englishReadme, /recently opened books first/);
  assert.match(changelog, /recently opened books before newly added fallbacks/);
});

test('local data docs cover last-opened library metadata', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const privacy = fs.readFileSync(path.join(projectRoot, 'docs', 'privacy.md'), 'utf-8');
  const chinesePrivacy = fs.readFileSync(path.join(projectRoot, 'docs', 'privacy.zh-CN.md'), 'utf-8');
  const chineseInstallGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'install-macos.zh-CN.md'), 'utf-8');
  const chineseFaq = fs.readFileSync(path.join(projectRoot, 'docs', 'faq.zh-CN.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const architecture = fs.readFileSync(path.join(projectRoot, 'docs', 'architecture.md'), 'utf-8');
  const gettingStarted = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.md'), 'utf-8');
  const featureTour = fs.readFileSync(path.join(projectRoot, 'docs', 'feature-tour.md'), 'utf-8');

  assert.match(readme, /显示名、所属书库、添加时间和上次打开时间/);
  assert.match(readme, /\[中文隐私与本地数据\]\(\.\/docs\/privacy\.zh-CN\.md\)/);
  assert.match(englishReadme, /\[Chinese Privacy and Local Data\]\(\.\/docs\/privacy\.zh-CN\.md\)/);
  assert.match(privacy, /added time and last-opened time/);
  assert.match(chinesePrivacy, /# CHMReaderLight 中文隐私与本地数据/);
  assert.match(chinesePrivacy, /\[English Privacy and Local Data\]\(\.\/privacy\.md\)/);
  assert.match(chinesePrivacy, /不会包含 telemetry、analytics、账号、cloud sync 或托管文档存储/);
  assert.match(chinesePrivacy, /## 保留在本地的数据/);
  assert.match(chinesePrivacy, /CHM 源文件留在你选择的位置/);
  assert.match(chinesePrivacy, /library\/library\.json/);
  assert.match(chinesePrivacy, /显示名、源文件路径、所属书库、添加时间和上次打开时间/);
  assert.match(chinesePrivacy, /extracted-books\//);
  assert.match(chinesePrivacy, /localStorage/);
  assert.match(chinesePrivacy, /macOS 最近打开文档菜单/);
  assert.match(chinesePrivacy, /## 阅读器边界/);
  assert.match(chinesePrivacy, /chm:\/\//);
  assert.match(chinesePrivacy, /Content Security Policy/);
  assert.match(chinesePrivacy, /nonce-protected navigation bridge/);
  assert.match(chinesePrivacy, /## 移除本地数据/);
  assert.match(chinesePrivacy, /Help > Clear Extracted Cache/);
  assert.match(chinesePrivacy, /Help > Reveal App Data Folder/);
  assert.match(chinesePrivacy, /## 报告隐私或安全问题/);
  assert.match(chinesePrivacy, /\[中文安全政策\]\(\.\.\/SECURITY\.zh-CN\.md\)/);
  assert.match(chineseInstallGuide, /\[中文隐私与本地数据\]\(\.\/privacy\.zh-CN\.md\)/);
  assert.match(chineseFaq, /\[中文隐私与本地数据\]\(\.\/privacy\.zh-CN\.md\)/);
  assert.match(docsIndex, /\[Chinese Privacy and Local Data\]\(\.\/privacy\.zh-CN\.md\)/);
  assert.match(changelog, /Chinese privacy and local data guide for localized trust review/);
  assert.match(architecture, /added and last-opened timestamps/);
  assert.match(gettingStarted, /last-opened metadata locally/);
  assert.match(gettingStarted, /recently opened books first/);
  assert.match(featureTour, /added and last-opened metadata/);
  assert.match(featureTour, /recently opened books first/);
});

test('library cards surface continue-reading state', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /const lastTopicsByBook = loadReaderLastTopicMap\(\)/);
  assert.match(renderer, /createLibraryCard\(entry, lastTopicsByBook\)/);
  assert.match(renderer, /function createLibraryCard\(entry: LibraryBook, lastTopicsByBook: Record<string, string>\): HTMLDivElement/);
  assert.match(renderer, /const hasLastTopic = Boolean\(entry\.filePath && lastTopicsByBook\[entry\.filePath\] && !entry\.sourceMissing\)/);
  assert.match(renderer, /card\.classList\.toggle\('has-last-topic', hasLastTopic\)/);
  assert.match(renderer, /<span class="library-continue-reading" hidden>继续阅读<\/span>/);
  assert.match(renderer, /continueReading\.hidden = !hasLastTopic/);
  assert.match(renderer, /hasLastTopic \? `继续阅读 \$\{entry\.name\}` : `打开 \$\{entry\.name\}`/);
  assert.match(css, /\.library-continue-reading\s*{/);
  assert.match(css, /\.library-card\.has-last-topic \.library-cover\s*{/);
  assert.match(css, /\.library-content\[data-layout="list"\] \.library-continue-reading\s*{/);
  assert.match(readme, /继续阅读提示/);
  assert.match(englishReadme, /continue-reading badges/);
  assert.match(changelog, /continue-reading badges on library cards/);
});

test('library cards reveal source CHM files without a copy-path action', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');

  assert.match(main, /handleTrustedIpc\('library:reveal'/);
  assert.match(main, /shell\.showItemInFolder\(bookPath\)/);
  assert.match(preload, /revealLibraryBook: \(id\) => ipcRenderer\.invoke\('library:reveal', id\)/);
  assert.doesNotMatch(preload, /copyText:|clipboard:write-text/);
  assert.match(renderer, /revealLibraryBook: \(id: string\) => Promise<unknown>/);
  assert.match(renderer, /className = 'library-card-reveal'/);
  assert.match(renderer, /reveal\.setAttribute\('aria-label', `在 Finder 中显示 \$\{entry\.name\}`\)/);
  assert.match(renderer, /window\.chmReader\.revealLibraryBook\(entry\.id\)/);
  assert.doesNotMatch(renderer, /copyPath|copyLibraryBookPath|library-card-copy|copyText:/);
  assert.doesNotMatch(main, /handleTrustedIpc\('clipboard:write-text'/);
  assert.match(css, /\.library-card-actions\s*{/);
  assert.doesNotMatch(css, /library-card-copy/);
  assert.match(css, /padding: 8px 70px 8px 10px;/);
  assert.match(css, /\.library-card:focus-within \.library-card-actions/s);
  assert.doesNotMatch(readme, /复制源文件路径/);
});

test('library cards warn when the saved CHM source file is missing', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(main, /sourceMissing\?: boolean/);
  assert.match(main, /function getLibraryBookPath\(entry: LibraryBook\): string/);
  assert.match(main, /async function withBookAvailability\(library: LibraryState\): Promise<LibraryState>/);
  assert.ok(main.includes('LIBRARY_AVAILABILITY_CONCURRENCY = 16'));
  assert.ok(main.includes('mapWithConcurrency(\n      library.books,\n      LIBRARY_AVAILABILITY_CONCURRENCY,'));
  assert.doesNotMatch(main, /Promise\.all\(library\.books\.map/);
  assert.match(main, /fs\.promises\.access\(bookPath, fs\.constants\.F_OK\)/);
  assert.match(main, /return \{ \.\.\.book, sourceMissing: true \}/);
  assert.match(main, /handleTrustedIpc\('library:list', async \(_event: IpcMainInvokeEvent\) => withBookAvailability\(await readLibrary\(\)\)\)/);
  assert.match(preload, /sourceMissing\?: boolean/);
  assert.match(renderer, /sourceMissing\?: boolean/);
  assert.match(renderer, /classList\.toggle\('source-missing', Boolean\(entry\.sourceMissing\)\)/);
  assert.match(renderer, /<span class="library-source-status" hidden>源文件缺失<\/span>/);
  assert.match(renderer, /sourceStatus\.hidden = !entry\.sourceMissing/);
  assert.match(renderer, /reveal\.disabled = Boolean\(entry\.sourceMissing\)/);
  assert.match(renderer, /entry\.sourceMissing \? '源文件缺失' : '在 Finder 中显示'/);
  assert.match(css, /\.library-card\.source-missing \.library-cover\s*{/);
  assert.match(css, /\.library-source-status\s*{/);
  assert.match(css, /\.library-card-reveal:disabled\s*{/);
  assert.match(readme, /缺失源文件提示/);
  assert.match(changelog, /saved CHM source file can no longer be found/);
  assert.match(changelog, /Capped library source availability checks at 16 concurrent file probes/);
});

test('missing library sources can be relinked without deleting the entry', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(main, /async function relinkLibraryBook\(id: string\): Promise<LibraryState \| null>/);
  assert.match(main, /title: '重新定位 CHM'/);
  assert.match(main, /buttonLabel: '选择'/);
  assert.match(main, /const selectedPath = result\.filePaths\[0\]/);
  assert.match(main, /relinkBookInLibrary\(current, id, selectedPath, process\.platform === 'darwin'\)/);
  assert.match(main, /title: '无法重新定位 CHM'/);
  assert.match(main, /handleTrustedIpc\('library:relink'/);
  assert.match(preload, /relinkLibraryBook: \(id\) => ipcRenderer\.invoke\('library:relink', id\)/);
  assert.match(renderer, /relinkLibraryBook: \(id: string\) => Promise<LibraryState \| null>/);
  assert.match(renderer, /className = 'library-card-relink'/);
  assert.match(renderer, /relink\.hidden = !entry\.sourceMissing/);
  assert.match(renderer, /重新定位 \$\{entry\.name\} 的源文件/);
  assert.match(renderer, /window\.chmReader\.relinkLibraryBook\(entry\.id\)/);
  assert.match(css, /\.library-card-relink\s*{/);
  assert.match(css, /\.library-card-relink svg\s*{/);
  assert.match(readme, /重新定位源文件/);
  assert.match(changelog, /Relink missing CHM source files/);
});

test('library cards confirm before removing a CHM from the library', () => {
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /async function confirmAndRemoveLibraryBook\(entry: LibraryBook\): Promise<void>/);
  assert.match(renderer, /`从书库移除“\$\{entry\.name\}”\？源文件不会被删除。`/);
  assert.match(renderer, /if \(!window\.confirm\(message\)\) return/);
  assert.match(renderer, /window\.chmReader\.removeLibraryBook\(entry\.id\)/);
  assert.match(renderer, /await confirmAndRemoveLibraryBook\(entry\)/);
});

test('library toolbar can filter books by name or path', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(html, /<label class="library-search" for="library-search">/);
  assert.match(html, /<input id="library-search" type="search" placeholder="搜索书名或路径" maxlength="200"/);
  assert.match(html, /id="library-empty-filtered"/);
  assert.match(html, /没有匹配的文档/);
  assert.match(html, /<button class="empty-link-button" id="clear-library-search" type="button">清空搜索<\/button>/);
  assert.match(renderer, /filterBooksByQuery/);
  assert.match(renderer, /sortBooksForDisplay/);
  assert.match(renderer, /let libraryQuery = ''/);
  assert.match(renderer, /clearLibrarySearch: query\('#clear-library-search'\)/);
  assert.match(renderer, /emptySearchGuide: query\('#empty-search-guide'\)/);
  assert.match(renderer, /filteredBooksInSelectedCollection/);
  assert.match(renderer, /elements\.libraryEmptyFiltered\.hidden = !hasQuery \|\| books\.length > 0/);
  assert.match(renderer, /elements\.librarySearch\.addEventListener\('input'/);
  assert.match(renderer, /elements\.clearLibrarySearch\.addEventListener\('click'/);
  assert.match(renderer, /elements\.librarySearch\.value = ''/);
  assert.match(renderer, /elements\.librarySearch\.focus\(\)/);
  assert.match(renderer, /elements\.emptySearchGuide\.addEventListener\('click', \(\) =>/);
  assert.match(renderer, /openExternalLink\(onboardingLinks\.search\)/);
  assert.match(css, /\.library-search\s*{/);
  assert.match(css, /\.library-empty-filtered\s*{/);
  assert.match(html, /id="empty-search-guide"/);
  assert.match(html, /搜索指南/);
  assert.match(readme, /搜索无结果时可一键清空关键词，并可直接打开中文搜索指南/);
  assert.match(changelog, /empty-search state link to the localized Chinese search guide/);
  assert.match(changelog, /clear-search action for empty library search results/);
});

test('library result count and empty-search updates are announced politely', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(html, /<output class="toolbar-meta" id="library-count" aria-live="polite"><\/output>/);
  assert.match(html, /<div class="library-empty library-empty-filtered" id="library-empty-filtered" role="status" aria-live="polite" hidden>/);
  assert.match(changelog, /library result count and empty-search status announcements/);
});

test('selected collection is announced to assistive tech', () => {
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(renderer, /const isSelected = selectedCollectionId === collection\.id/);
  assert.match(renderer, /item\.classList\.toggle\('active', isSelected\)/);
  assert.match(renderer, /select\.setAttribute\('aria-current', isSelected \? 'true' : 'false'\)/);
  assert.match(changelog, /selected library collection to assistive technologies/);
});

test('library layout preference persists between launches', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /const libraryLayoutStorageKey = 'chm-reader-library-layout'/);
  assert.match(renderer, /function loadLibraryLayoutPreference\(\): 'grid' \| 'list'/);
  assert.match(renderer, /window\.localStorage\.getItem\(libraryLayoutStorageKey\)/);
  assert.match(renderer, /saved === 'list' \|\| saved === 'grid'/);
  assert.match(renderer, /window\.localStorage\.setItem\(libraryLayoutStorageKey, layout\)/);
  assert.match(renderer, /setLibraryLayout\(loadLibraryLayoutPreference\(\)\)/);
  assert.match(readme, /平铺或列表展示偏好会在下次启动时保留/);
});

test('selected library collection preference persists between launches', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /const selectedCollectionStorageKey = 'chm-reader-selected-collection'/);
  assert.match(renderer, /function loadSelectedCollectionPreference\(collections: readonly LibraryCollection\[\]\): string \| null/);
  assert.match(renderer, /window\.localStorage\.getItem\(selectedCollectionStorageKey\)/);
  assert.match(renderer, /collections\.some\(\(collection\) => collection\.id === saved\)/);
  assert.match(renderer, /function saveSelectedCollectionPreference\(id: string \| null\): void/);
  assert.match(renderer, /window\.localStorage\.setItem\(selectedCollectionStorageKey, id\)/);
  assert.match(renderer, /window\.localStorage\.removeItem\(selectedCollectionStorageKey\)/);
  assert.match(renderer, /saveSelectedCollectionPreference\(id\)/);
  assert.match(renderer, /selectedCollectionId = loadSelectedCollectionPreference/);
  assert.match(readme, /上次选中的书库分组会在下次启动时保留/);
});

test('reader sidebar width preference persists between launches', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /const readerSidebarWidthStorageKey = 'chm-reader-sidebar-width'/);
  assert.match(renderer, /function clampReaderSidebarWidth\(width: number\): number/);
  assert.match(renderer, /function loadReaderSidebarWidthPreference\(\): number/);
  assert.match(renderer, /window\.localStorage\.getItem\(readerSidebarWidthStorageKey\)/);
  assert.match(renderer, /function setReaderSidebarWidth\(width: number, persist = false\): void/);
  assert.match(renderer, /elements\.readerLayout\.style\.setProperty\('--sidebar-width', `\$\{nextWidth\}px`\)/);
  assert.match(renderer, /window\.localStorage\.setItem\(readerSidebarWidthStorageKey, String\(nextWidth\)\)/);
  assert.match(renderer, /setReaderSidebarWidth\(startWidth \+ event\.clientX - startX, true\)/);
  assert.match(renderer, /setReaderSidebarWidth\(sidebar\.getBoundingClientRect\(\)\.width \+ delta, true\)/);
  assert.match(renderer, /setReaderSidebarWidth\(loadReaderSidebarWidthPreference\(\)\)/);
  assert.match(readme, /目录宽度偏好保留/);
  assert.match(changelog, /reader sidebar width between app launches/);
});

test('reader sidebar visibility preference persists between launches', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const gettingStarted = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.md'), 'utf-8');
  const featureTour = fs.readFileSync(path.join(projectRoot, 'docs', 'feature-tour.md'), 'utf-8');
  const architecture = fs.readFileSync(path.join(projectRoot, 'docs', 'architecture.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /const readerSidebarVisibleStorageKey = 'chm-reader-sidebar-visible'/);
  assert.match(renderer, /function loadReaderSidebarVisiblePreference\(\): boolean/);
  assert.match(renderer, /window\.localStorage\.getItem\(readerSidebarVisibleStorageKey\)/);
  assert.match(renderer, /return saved === null \? true : saved === 'true'/);
  assert.match(renderer, /function setReaderSidebarVisible\(isVisible: boolean, persist = false\): void/);
  assert.match(renderer, /elements\.readerLayout\.classList\.toggle\('sidebar-hidden', !isVisible\)/);
  assert.match(renderer, /window\.localStorage\.setItem\(readerSidebarVisibleStorageKey, String\(isVisible\)\)/);
  assert.match(renderer, /setReaderSidebarVisible\(elements\.readerLayout\.classList\.contains\('sidebar-hidden'\), true\)/);
  assert.match(renderer, /setReaderSidebarVisible\(loadReaderSidebarVisiblePreference\(\)\)/);
  assert.match(readme, /目录显示状态偏好保留/);
  assert.match(gettingStarted, /sidebar visibility/);
  assert.match(featureTour, /sidebar visibility/);
  assert.match(architecture, /sidebar visibility/);
  assert.match(changelog, /reader sidebar visibility between app launches/);
});

test('reader restores last-read topic per CHM', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const gettingStarted = fs.readFileSync(path.join(projectRoot, 'docs', 'getting-started.md'), 'utf-8');
  const featureTour = fs.readFileSync(path.join(projectRoot, 'docs', 'feature-tour.md'), 'utf-8');
  const privacy = fs.readFileSync(path.join(projectRoot, 'docs', 'privacy.md'), 'utf-8');
  const architecture = fs.readFileSync(path.join(projectRoot, 'docs', 'architecture.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /const readerLastTopicStorageKey = 'chm-reader-last-topic-by-book'/);
  assert.match(renderer, /function loadReaderLastTopicMap\(\): Record<string, string>/);
  assert.match(renderer, /window\.localStorage\.getItem\(readerLastTopicStorageKey\)/);
  assert.match(renderer, /function loadReaderLastTopicPreference\(book: OpenedBook, validTopics: readonly string\[\]\): string \| null/);
  assert.match(renderer, /const saved = loadReaderLastTopicMap\(\)\[book\.filePath\]/);
  assert.match(renderer, /return saved && validTopics\.includes\(saved\) \? saved : null/);
  assert.match(renderer, /function saveReaderLastTopicPreference\(book: OpenedBook, topicPath: string\): void/);
  assert.match(renderer, /nextTopics\[book\.filePath\] = topicPath/);
  assert.match(renderer, /window\.localStorage\.setItem\(readerLastTopicStorageKey, JSON\.stringify\(nextTopics\)\)/);
  assert.match(renderer, /if \(currentBook\) saveReaderLastTopicPreference\(currentBook, topicPath\)/);
  assert.match(renderer, /if \(topicPath\) saveReaderLastTopicPreference\(currentBook, topicPath\)/);
  assert.match(renderer, /const lastReadTopic = loadReaderLastTopicPreference\(book, readingOrder\)/);
  assert.match(renderer, /const initialTopic = restoreTopic \|\| lastReadTopic \|\| findFirstTopic\(book\.contents\)/);
  assert.match(readme, /上次阅读章节恢复/);
  assert.match(englishReadme, /last-read topic restore/);
  assert.match(gettingStarted, /last-read topic/);
  assert.match(featureTour, /last-read topic/);
  assert.match(privacy, /last-read topic/);
  assert.match(architecture, /last-read topic/);
  assert.match(changelog, /reader last-read topic per CHM/);
});

test('reader zoom preference persists between launches', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /const readerZoomStorageKey = 'chm-reader-zoom'/);
  assert.match(renderer, /function clampReaderZoom\(value: number\): number/);
  assert.match(renderer, /function loadReaderZoomPreference\(\): number/);
  assert.match(renderer, /window\.localStorage\.getItem\(readerZoomStorageKey\)/);
  assert.match(renderer, /function setZoom\(nextZoom: number, persist = false\): void/);
  assert.match(renderer, /zoom = clampReaderZoom\(nextZoom\)/);
  assert.match(renderer, /window\.localStorage\.setItem\(readerZoomStorageKey, String\(zoom\)\)/);
  assert.match(renderer, /window\.localStorage\.removeItem\(readerZoomStorageKey\)/);
  assert.match(renderer, /setZoom\(zoom - 0\.1, true\)/);
  assert.match(renderer, /setZoom\(zoom \+ 0\.1, true\)/);
  assert.match(renderer, /setZoom\(1, true\)/);
  assert.match(renderer, /setZoom\(loadReaderZoomPreference\(\)\)/);
  assert.match(readme, /正文缩放偏好保留/);
  assert.match(changelog, /reader zoom level between app launches/);
});

test('find shortcut focuses the active view search field', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(main, /label: 'Find'/);
  assert.match(main, /accelerator: 'CmdOrCtrl\+F'/);
  assert.match(main, /sendToMainWindow\('navigation:focus-search'\)/);
  assert.match(renderer, /if \(document\.body\.dataset\.view === 'library'\)/);
  assert.match(renderer, /elements\.librarySearch\.focus\(\)/);
  assert.match(renderer, /elements\.librarySearch\.select\(\)/);
  assert.match(renderer, /if \(document\.body\.dataset\.view !== 'reader' \|\| elements\.search\.disabled\) return/);
  assert.match(renderer, /elements\.search\.focus\(\)/);
  assert.match(renderer, /elements\.search\.select\(\)/);
});

test('help menu links users back to the GitHub project', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const shareKit = fs.readFileSync(path.join(projectRoot, 'docs', 'share-kit.md'), 'utf-8');
  const chineseShareKit = fs.readFileSync(path.join(projectRoot, 'docs', 'share-kit.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');
  const reportMenuStart = main.indexOf("label: 'Report or Request'");
  const reportMenuEnd = main.indexOf("    }, {\n      label: 'Report an Issue'", reportMenuStart);

  assert.match(main, /const projectLinks = {/);
  assert.match(main, /repository: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light'/);
  assert.match(main, /star: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light'/);
  assert.match(main, /issues: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues'/);
  assert.match(main, /discussions: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions'/);
  assert.match(main, /releaseFeedback: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/discussions\/new\?category=release-feedback'/);
  assert.match(main, /releases: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases'/);
  assert.match(main, /securityPolicy: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/security\/policy'/);
  assert.match(main, /securityPolicyZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/SECURITY\.zh-CN\.md'/);
  assert.match(main, /bugIssue: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\?template=bug_report\.yml'/);
  assert.match(main, /installIssue: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\?template=install_help\.yml'/);
  assert.match(main, /featureIssue: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\?template=feature_request\.yml'/);
  assert.match(main, /questionIssue: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\?template=question\.yml'/);
  assert.match(main, /documentationIssue: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\?template=documentation\.yml'/);
  assert.match(main, /performanceIssue: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\?template=performance\.yml'/);
  assert.match(main, /accessibilityIssue: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\?template=accessibility\.yml'/);
  assert.match(main, /support: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/SUPPORT\.md'/);
  assert.match(main, /supportZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/SUPPORT\.zh-CN\.md'/);
  assert.match(main, /gettingStarted: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/getting-started\.md'/);
  assert.match(main, /gettingStartedZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/getting-started\.zh-CN\.md'/);
  assert.match(main, /useCases: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/use-cases\.md'/);
  assert.match(main, /useCasesZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/use-cases\.zh-CN\.md'/);
  assert.match(main, /comparison: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/comparison\.md'/);
  assert.match(main, /comparisonZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/comparison\.zh-CN\.md'/);
  assert.match(main, /compatibilityIssue: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\?template=chm_compatibility\.yml'/);
  assert.match(main, /adoptionChecklist: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/adoption-checklist\.md'/);
  assert.match(main, /adoptionChecklistZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/adoption-checklist\.zh-CN\.md'/);
  assert.match(main, /goodFirstContributions: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/good-first-contributions\.md'/);
  assert.match(main, /goodFirstContributionsZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/good-first-contributions\.zh-CN\.md'/);
  assert.match(main, /projectStatus: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/project-status\.md'/);
  assert.match(main, /projectStatusZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/project-status\.zh-CN\.md'/);
  assert.match(main, /roadmap: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/roadmap\.md'/);
  assert.match(main, /roadmapZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/roadmap\.zh-CN\.md'/);
  assert.match(main, /troubleshooting: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/troubleshooting\.md'/);
  assert.match(main, /troubleshootingZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/troubleshooting\.zh-CN\.md'/);
  assert.match(main, /faq: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/faq\.md'/);
  assert.match(main, /faqZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/faq\.zh-CN\.md'/);
  assert.match(main, /search: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/search\.md'/);
  assert.match(main, /searchZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/search\.zh-CN\.md'/);
  assert.match(main, /shareKit: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/share-kit\.md'/);
  assert.match(main, /shareKitZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/share-kit\.zh-CN\.md'/);
  assert.match(main, /showcase: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/showcase\.md'/);
  assert.match(main, /showcaseZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/showcase\.zh-CN\.md'/);
  assert.match(main, /showcaseIssue: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/issues\/new\?template=showcase\.yml'/);
  assert.match(main, /installMacZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/install-macos\.zh-CN\.md'/);
  assert.match(main, /privacyZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/privacy\.zh-CN\.md'/);
  assert.match(main, /compatibilityZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/compatibility\.zh-CN\.md'/);
  assert.match(main, /accessibilityZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/accessibility\.zh-CN\.md'/);
  assert.match(main, /shortcutsZhCn: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/shortcuts\.zh-CN\.md'/);
  assert.match(main, /label: 'Help'/);
  assert.match(main, /label: 'GitHub Repository'/);
  assert.match(main, /label: 'Star on GitHub'/);
  assert.match(main, /label: 'Watch Releases',\n      click: \(\) => shell\.openExternal\(projectLinks\.releases\)/);
  assert.match(main, /label: 'GitHub Discussions'/);
  assert.match(main, /label: 'Release Feedback',\n      click: \(\) => shell\.openExternal\(projectLinks\.releaseFeedback\)/);
  assert.match(main, /label: 'Report or Request'/);
  assert.match(main, /label: 'Report or Request',\n      submenu: \[\{/);
  assert.ok(reportMenuStart >= 0);
  assert.ok(reportMenuEnd > reportMenuStart);
  const reportMenu = main.slice(reportMenuStart, reportMenuEnd);
  assert.match(main, /label: 'Report a Bug'/);
  assert.match(main, /label: 'Get Install Help'/);
  assert.match(main, /label: 'Request a Feature'/);
  assert.match(main, /label: 'Ask a Usage Question'/);
  assert.match(main, /label: 'Report Documentation'/);
  assert.match(main, /label: 'Share Release Feedback'/);
  assert.match(main, /label: 'Security Policy'/);
  assert.match(main, /label: 'Report Performance'/);
  assert.match(main, /label: 'Report Accessibility'/);
  assert.match(main, /function buildShareText\(\): string/);
  assert.match(main, /CHMReaderLight helps macOS users keep offline CHM manuals searchable and organized\./);
  assert.match(main, /CHMReaderLight 帮助 macOS 用户整理并搜索离线 CHM 手册。/);
  assert.match(main, /GitHub repository: \$\{projectLinks\.repository\}/);
  assert.match(main, /Star the project: \$\{projectLinks\.star\}/);
  assert.match(main, /Share a success story: \$\{projectLinks\.showcaseIssue\}/);
  assert.match(main, /Apple Silicon download: \$\{projectLinks\.downloadAppleSilicon\}/);
  assert.match(main, /Intel download: \$\{projectLinks\.downloadIntel\}/);
  assert.match(main, /Watch releases: \$\{projectLinks\.releases\}/);
  assert.match(main, /中文入门指南: \$\{projectLinks\.gettingStartedZhCn\}/);
  assert.match(main, /中文分享素材包: \$\{projectLinks\.shareKitZhCn\}/);
  assert.match(main, /Release feedback: \$\{projectLinks\.releaseFeedback\}/);
  assert.match(main, /If release details would make CHMReaderLight easier to trust, star, watch, or share, tell maintainers what is missing\./);
  assert.match(main, /如果 release 说明会影响你是否信任、star、watch 或分享 CHMReaderLight，请告诉维护者还缺什么信息。/);
  assert.match(main, /If it solves your offline CHM workflow, a GitHub star helps other users find it\./);
  assert.match(main, /If a real CHMReaderLight workflow is safe to quote, share it so future users can evaluate the app faster\./);
  assert.match(main, /如果它解决了你的离线 CHM 工作流，一个 GitHub star 可以帮助更多用户发现它。/);
  assert.match(main, /如果真实使用场景可以公开引用，分享成功案例可以帮助后续用户更快判断是否适合。/);
  assert.match(main, /async function copyShareText\(\): Promise<void>/);
  assert.match(main, /clipboard\.writeText\(buildShareText\(\)\)/);
  assert.match(main, /title: 'Share Text Copied'/);
  assert.match(main, /label: 'Copy Share Text'/);
  assert.match(main, /click: \(\) => copyShareText\(\)/);
  assert.match(main, /label: 'Getting Started'/);
  assert.match(main, /label: 'Support Guide'/);
  assert.match(main, /label: 'Use Cases'/);
  assert.match(main, /label: 'Comparison'/);
  assert.match(main, /label: 'Report CHM Compatibility'/);
  assert.match(reportMenu, /label: 'Report CHM Compatibility'/);
  assert.match(reportMenu, /shell\.openExternal\(projectLinks\.compatibilityIssue\)/);
  assert.match(reportMenu, /label: 'Share a Success Story'/);
  assert.match(reportMenu, /shell\.openExternal\(projectLinks\.showcaseIssue\)/);
  assert.match(reportMenu, /label: 'Share Release Feedback'/);
  assert.match(reportMenu, /shell\.openExternal\(projectLinks\.releaseFeedback\)/);
  assert.match(main, /label: 'Adoption Checklist'/);
  assert.match(main, /label: 'Good First Contributions'/);
  assert.match(main, /label: 'Project Status'/);
  assert.match(main, /label: 'Roadmap'/);
  assert.match(main, /installMac: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/install-macos\.md'/);
  assert.match(main, /privacy: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/privacy\.md'/);
  assert.match(main, /compatibility: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/compatibility\.md'/);
  assert.match(main, /accessibility: 'https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/docs\/accessibility\.md'/);
  assert.match(main, /label: 'macOS Install Guide'/);
  assert.match(main, /label: 'Privacy and Local Data'/);
  assert.match(main, /label: 'Compatibility Notes'/);
  assert.match(main, /label: 'Accessibility Guide'/);
  assert.match(main, /label: 'Troubleshooting Guide'/);
  assert.match(main, /label: 'FAQ'/);
  assert.match(main, /label: 'Search Guide'/);
  assert.match(main, /label: 'Share Kit'/);
  assert.match(main, /label: 'Showcase Guide'/);
  assert.match(main, /label: 'Share a Success Story'/);
  assert.match(main, /label: 'Chinese Documentation'/);
  assert.match(main, /label: '中文入门指南'/);
  assert.match(main, /label: '中文适用场景'/);
  assert.match(main, /label: '中文采用检查清单'/);
  assert.match(main, /label: '中文首次贡献指南'/);
  assert.match(main, /label: '中文项目状态'/);
  assert.match(main, /label: '中文路线图'/);
  assert.match(main, /label: '中文搜索指南'/);
  assert.match(main, /label: '中文分享素材包'/);
  assert.match(main, /label: '中文 Showcase 指南'/);
  assert.match(main, /label: '中文 macOS 安装指南'/);
  assert.match(main, /label: '中文隐私与本地数据'/);
  assert.match(main, /label: '中文兼容性说明'/);
  assert.match(main, /label: '中文无障碍指南'/);
  assert.match(main, /label: '中文快捷键指南'/);
  assert.match(main, /label: '中文故障排查'/);
  assert.match(main, /label: '中文 FAQ'/);
  assert.match(main, /label: '中文支持指南'/);
  assert.match(main, /label: '中文安全政策'/);
  assert.match(main, /label: 'Report an Issue'/);
  assert.match(main, /label: 'Download Releases'/);
  assert.match(main, /shell\.openExternal\(projectLinks\.repository\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.star\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.discussions\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.releaseFeedback\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.bugIssue\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.installIssue\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.featureIssue\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.questionIssue\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.documentationIssue\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.securityPolicy\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.performanceIssue\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.accessibilityIssue\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.support\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.gettingStarted\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.useCases\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.comparison\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.compatibilityIssue\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.adoptionChecklist\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.goodFirstContributions\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.projectStatus\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.roadmap\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.search\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.shareKit\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.showcase\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.showcaseIssue\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.installMac\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.privacy\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.compatibility\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.accessibility\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.troubleshooting\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.faq\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.issues\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.releases\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.supportZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.gettingStartedZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.useCasesZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.comparisonZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.adoptionChecklistZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.goodFirstContributionsZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.projectStatusZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.roadmapZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.searchZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.shareKitZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.showcaseZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.installMacZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.privacyZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.compatibilityZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.accessibilityZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.shortcutsZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.troubleshootingZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.faqZhCn\)/);
  assert.match(main, /shell\.openExternal\(projectLinks\.securityPolicyZhCn\)/);
  assert.match(shareKit, /Help > Copy Share Text/);
  assert.match(shareKit, /includes both English and Chinese copy, direct latest download links, a release watch link, release feedback routing, a GitHub star link, and a showcase issue link/);
  assert.match(chineseShareKit, /最新下载链接、release watch 链接、release feedback 入口、GitHub star 链接和 showcase issue 链接/);
  assert.match(changelog, /Help menu Chinese Documentation submenu for localized onboarding, support, and contribution links/);
  assert.match(changelog, /Help menu Chinese Documentation submenu now includes localized install, privacy, compatibility, accessibility, and shortcut links/);
  assert.match(changelog, /Help menu links to the showcase guides for permissioned user stories/);
  assert.match(changelog, /Help menu action for sharing permissioned success stories/);
  assert.match(changelog, /Help menu action for filing CHM compatibility reports/);
  assert.match(changelog, /Help menu actions for bug, install, feature, performance, and accessibility issue templates/);
  assert.match(changelog, /Help menu actions for usage question and documentation issue templates/);
  assert.match(changelog, /Help menu action for release feedback Discussions/);
  assert.match(changelog, /Help menu top-level release feedback route/);
  assert.match(changelog, /Help menu links to English and Chinese security policy guidance/);
  assert.match(changelog, /Grouped Help menu issue-template actions for faster support routing/);
  assert.match(changelog, /bilingual Help menu share text with Chinese onboarding and share kit links/);
  assert.match(changelog, /Help menu share text now includes release feedback routing/);
  assert.match(changelog, /Help menu share text now includes showcase story routing/);
  assert.match(changelog, /Help menu link to the macOS install guide/);
  assert.match(changelog, /Help menu link to the privacy and local data guide/);
  assert.match(changelog, /Help menu link to the compatibility notes/);
  assert.match(changelog, /Help menu link to the accessibility guide/);
  assert.match(changelog, /Help menu links to the use cases and comparison guides/);
  assert.match(changelog, /Help menu link to the adoption checklist/);
  assert.match(changelog, /Help menu link to the good first contributions guide/);
  assert.match(changelog, /Help menu link to the project status guide/);
  assert.match(changelog, /Help menu link to the roadmap/);
  assert.match(changelog, /Help menu link to the search guide/);
  assert.match(changelog, /Help menu link to the share kit/);
  assert.match(changelog, /Help menu link to the troubleshooting guide/);
  assert.match(changelog, /Help menu link to the FAQ/);
  assert.match(changelog, /Help menu link to the support guide/);
  assert.match(changelog, /Help menu link for starring the project on GitHub/);
  assert.match(changelog, /Help menu link to GitHub Discussions/);
  assert.match(changelog, /Help menu action to copy reusable project share text/);
  assert.match(changelog, /Help menu share text now includes direct latest download and watch links/);
});

test('macOS About panel presents project metadata', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.equal(packageJson.name, 'chm-reader-light');
  assert.equal(packageJson.version, '0.1.0');
  assert.match(main, /function configureAboutPanel\(\): void/);
  assert.match(main, /app\.setAboutPanelOptions\(\{/);
  assert.match(main, /applicationName: 'CHMReaderLight'/);
  assert.match(main, /applicationVersion: app\.getVersion\(\)/);
  assert.match(main, /version: `Electron \$\{process\.versions\.electron\}`/);
  assert.match(main, /website: projectLinks\.repository/);
  assert.match(main, /copyright: 'MIT License - liuqi\.9867'/);
  assert.match(main, /configureAboutPanel\(\)/);
  assert.match(changelog, /macOS About panel metadata/);
});

test('help menu can copy diagnostic details for bug reports', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const bugTemplate = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'bug_report.yml'), 'utf-8');
  const troubleshooting = fs.readFileSync(path.join(projectRoot, 'docs', 'troubleshooting.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(main, /function buildDiagnosticInfo\(\): string/);
  assert.match(main, /`CHMReaderLight: \$\{app\.getVersion\(\)\}`/);
  assert.match(main, /`Electron: \$\{process\.versions\.electron\}`/);
  assert.match(main, /`Node: \$\{process\.versions\.node\}`/);
  assert.match(main, /`Platform: \$\{process\.platform\}`/);
  assert.match(main, /`Architecture: \$\{process\.arch\}`/);
  assert.match(main, /`macOS: \$\{os\.release\(\)\}`/);
  assert.match(main, /async function copyDiagnosticInfo\(\): Promise<void>/);
  assert.match(main, /clipboard\.writeText\(buildDiagnosticInfo\(\)\)/);
  assert.match(main, /title: 'Diagnostic Info Copied'/);
  assert.match(main, /label: 'Copy Diagnostic Info'/);
  assert.match(main, /click: \(\) => copyDiagnosticInfo\(\)/);
  assert.match(readme, /Help > Copy Diagnostic Info/);
  assert.match(readme, /Help > FAQ/);
  assert.match(contributing, /Help > Copy Diagnostic Info/);
  assert.match(bugTemplate, /Help > Copy Diagnostic Info/);
  assert.match(troubleshooting, /Help > Copy Diagnostic Info/);
  assert.match(changelog, /copy diagnostic info/);
});

test('help menu can reveal the app data folder for troubleshooting', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const privacy = fs.readFileSync(path.join(projectRoot, 'docs', 'privacy.md'), 'utf-8');
  const troubleshooting = fs.readFileSync(path.join(projectRoot, 'docs', 'troubleshooting.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(main, /async function revealAppDataFolder\(\): Promise<void>/);
  assert.match(main, /await fs\.promises\.mkdir\(app\.getPath\('userData'\), \{ recursive: true \}\)/);
  assert.match(main, /shell\.openPath\(app\.getPath\('userData'\)\)/);
  assert.match(main, /title: 'Unable to Open App Data Folder'/);
  assert.match(main, /label: 'Reveal App Data Folder'/);
  assert.match(main, /click: \(\) => revealAppDataFolder\(\)/);
  assert.match(privacy, /Help > Reveal App Data Folder/);
  assert.match(troubleshooting, /Help > Reveal App Data Folder/);
  assert.match(changelog, /reveal the app data folder/);
});

test('help menu can clear extracted cache without removing library metadata', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const clearStart = main.indexOf('async function clearExtractedBookCache(');
  const clearEnd = main.indexOf('async function importBooks(', clearStart);
  const implementation = main.slice(clearStart, clearEnd);
  const privacy = fs.readFileSync(path.join(projectRoot, 'docs', 'privacy.md'), 'utf-8');
  const troubleshooting = fs.readFileSync(path.join(projectRoot, 'docs', 'troubleshooting.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(main, /async function clearExtractedBookCache\(\): Promise<void>/);
  assert.match(main, /title: 'Clear Extracted Cache\?'/);
  assert.match(main, /message: 'Remove cached extracted CHM contents\?'/);
  assert.match(main, /detail: 'Source CHM files and library entries will not be removed\.'/);
  assert.match(main, /if \(confirmation\.response !== 0\) return/);
  assert.ok(clearStart >= 0 && clearEnd > clearStart);
  assert.match(implementation, /await fs\.promises\.rm\(getExtractCacheDir\(\), \{ recursive: true, force: true \}\)/);
  assert.match(implementation, /if \(bookRoot && bookRootIsCached\) \{[\s\S]*?bookRoot = undefined/);
  assert.match(implementation, /bookSearchIndex = \[\]/);
  assert.match(implementation, /currentBookPath = null/);
  assert.match(implementation, /currentBookName = null/);
  assert.match(implementation, /currentView = 'library'/);
  assert.match(implementation, /sendToMainWindow\('library:show'\)/);
  assert.match(main, /title: 'Extracted Cache Cleared'/);
  assert.match(main, /label: 'Clear Extracted Cache'/);
  assert.match(main, /click: \(\) => clearExtractedBookCache\(\)/);
  assert.match(privacy, /Help > Clear Extracted Cache/);
  assert.match(troubleshooting, /Help > Clear Extracted Cache/);
  assert.match(changelog, /clear extracted CHM cache/);
});

test('macOS app integrates with the recent documents menu', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

  assert.match(main, /role: 'recentDocuments'/);
  assert.match(main, /role: 'clearRecentDocuments'/);
  assert.match(main, /app\.addRecentDocument\(chmPath\)/);
  assert.match(readme, /最近打开的 CHM/);
});

test('runtime reuses extracted CHM cache before invoking the extractor', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const cache = fs.readFileSync(path.join(projectRoot, 'src', 'book-cache.ts'), 'utf-8');

  assert.match(main, /'extracted-books'/);
  assert.match(main, /fs\.promises\.stat\(chmPath, \{ bigint: true \}\)/);
  assert.match(main, /createBookCacheKey\(chmPath, stats\)/);
  assert.match(main, /isSameBookCacheIdentity\(expectedIdentity, currentIdentity\)/);
  assert.match(main, /CHM source changed while it was being opened/);
  const extractionStart = main.indexOf('metadata = await extractBook(chmPath');
  const cacheParentCreation = main.lastIndexOf(
    'await fs.promises.mkdir(path.dirname(nextRoot), { recursive: true })',
    extractionStart,
  );
  const stagingCreation = main.lastIndexOf('const activeStagingRoot = await fs.promises.mkdtemp(', extractionStart);
  const publishStart = main.indexOf('await fs.promises.rename(activeStagingRoot, nextRoot)', extractionStart);
  const prePublishIdentityCheck = main.indexOf('await assertBookSourceUnchanged(chmPath, sourceIdentity)', extractionStart);
  const finalIdentityCheck = main.indexOf('await assertBookSourceUnchanged(chmPath, sourceIdentity)', publishStart);
  assert.ok(extractionStart >= 0 && prePublishIdentityCheck > extractionStart);
  assert.ok(cacheParentCreation >= 0 && cacheParentCreation < stagingCreation);
  assert.ok(stagingCreation < extractionStart, 'staging must share the cache target filesystem before extraction starts');
  assert.match(
    main.slice(stagingCreation, extractionStart),
    /path\.join\(path\.dirname\(nextRoot\), '\.chm-reader-cache-'\)/,
  );
  assert.ok(prePublishIdentityCheck < publishStart, 'source identity must be rechecked before publishing a new cache');
  assert.ok(finalIdentityCheck > publishStart, 'cached and newly extracted books must share a final identity check');
  assert.match(main, /let publishedCacheNeedsCleanup = false/);
  assert.match(main, /publishedCacheNeedsCleanup = true/);
  assert.match(main, /if \(publishedCacheNeedsCleanup\) \{\s+await removeBookCacheAfterFailure\(nextRoot\);\s+\}/);
  assert.match(main, /runBookStateTask\(\(\) => openLibraryBookTransaction\(id\)\)/);
  assert.match(main, /runBookStateTask\(\(\) => setBookTextEncodingTransaction\(encoding\)\)/);
  const encodingTransactionStart = main.indexOf('async function setBookTextEncodingTransaction(');
  const nextEncodingStart = main.indexOf('const nextEncoding = normalizeTextEncoding(encoding)', encodingTransactionStart);
  const encodingReadStart = main.indexOf('const metadata = await readExtractedBook(activeRoot', nextEncodingStart);
  const encodingCommitStart = main.indexOf('bookTextEncoding = nextEncoding', encodingReadStart);
  assert.ok(nextEncodingStart > encodingTransactionStart);
  assert.match(
    main.slice(nextEncodingStart, encodingReadStart),
    /if \(!bookRoot \|\| !currentBookPath \|\| !currentBookName\) \{[\s\S]+bookTextEncoding = nextEncoding/,
  );
  assert.match(main.slice(encodingReadStart, encodingCommitStart), /textEncoding: nextEncoding/);
  assert.ok(encodingCommitStart > encodingReadStart, 'active-book encoding must commit only after parsing succeeds');
  assert.match(main, /await runBookStateTask\(async \(\) => \{/);
  assert.match(cache, /mtimeNs/);
  assert.match(cache, /ctimeNs/);
  assert.match(cache, /stats\.ino/);
  assert.match(cache, /stats\.dev/);
  assert.match(main, /readExtractedBook\(nextRoot,/);
  assert.match(main, /extractBook\(chmPath, activeStagingRoot,/);
  assert.match(main, /previousRoot && !previousRootIsCached/);
  assert.match(main, /bookRoot && !bookRootIsCached/);
});

test('failed cache cleanup preserves the original book-open error', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const cleanupStart = main.indexOf('async function removeBookCacheAfterFailure(');
  const openStart = main.indexOf('async function openBookTransaction(');
  const openEnd = main.indexOf('async function openLibraryBookTransaction(', openStart);
  const implementation = main.slice(openStart, openEnd);

  assert.ok(cleanupStart >= 0 && cleanupStart < openStart);
  assert.match(main.slice(cleanupStart, openStart), /try \{[\s\S]*?await fs\.promises\.rm\([\s\S]*?catch \(cleanupError\)[\s\S]*?reportMainProcessError\('Unable to Clean Up Extracted Cache', cleanupError, false\)/);
  assert.match(implementation, /if \(stagingRoot\) \{[\s\S]*?await removeBookCacheAfterFailure\(stagingRoot\)/);
  assert.match(implementation, /if \(publishedCacheNeedsCleanup\) \{[\s\S]*?await removeBookCacheAfterFailure\(nextRoot\)/);
  assert.match(implementation, /throw error;/);
  assert.doesNotMatch(implementation, /if \(stagingRoot\) \{\s+await fs\.promises\.rm/);
});

test('runtime avoids sending to a destroyed window from async callbacks', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

  assert.match(main, /function getLiveMainWindow\(\): BrowserWindowType \| null/);
  assert.match(main, /mainWindow\.isDestroyed\(\)/);
  assert.match(main, /targetWindow\.webContents\.isDestroyed\(\)/);
  assert.match(main, /sendToMainWindow\('book:index-ready'/);
  assert.match(main, /browserWindow\.on\('closed'/);
  assert.match(main, /stopSearchIndexWorker\(\)/);
  assert.doesNotMatch(main, /mainWindow\?\.webContents\.send/);
});

test('background search indexing degrades safely when its worker cannot start', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const start = main.indexOf('function startSearchIndexBuild(');
  const end = main.indexOf('function normalizeTextEncoding(', start);
  const implementation = main.slice(start, end);

  assert.ok(start >= 0 && end > start);
  assert.match(
    implementation,
    /try \{[\s\S]+new Worker\([\s\S]+\} catch \(error\) \{[\s\S]+return;[\s\S]+\}/,
  );
});

test('a last-opened metadata failure does not turn a successful book open into a failure', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const start = main.indexOf('async function openLibraryBookTransaction(');
  const end = main.indexOf('const openLibraryBook =', start);
  const implementation = main.slice(start, end);
  const openStart = implementation.indexOf('await openBookTransaction(');
  const openFailureBoundary = implementation.indexOf('} catch (error) {', openStart);
  const metadataStart = implementation.indexOf('await updateLibrary(', openStart);
  const metadataFailureBoundary = implementation.indexOf('} catch (error) {', metadataStart);
  const successfulReturn = implementation.lastIndexOf('return openedBook;');

  assert.ok(start >= 0 && end > start);
  assert.ok(openStart >= 0);
  assert.ok(openFailureBoundary > openStart && openFailureBoundary < metadataStart);
  assert.ok(metadataFailureBoundary > metadataStart && metadataFailureBoundary < successfulReturn);
});

test('closing the reader window returns to the library before closing the app', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');

  assert.match(main, /let currentView: 'library' \| 'reader' = 'library'/);
  assert.match(main, /browserWindow\.on\('close', \(event: \{ preventDefault: \(\) => void \}\) =>/);
  assert.match(main, /if \(isQuitting \|\| currentView !== 'reader'\) return/);
  assert.match(main, /event\.preventDefault\(\)/);
  assert.match(main, /currentView = 'library'/);
  assert.match(main, /sendToMainWindow\('library:show'\)/);
  assert.match(main, /handleTrustedIpc\('view:set'/);
  assert.match(main, /app\.on\('before-quit'/);
  assert.match(renderer, /syncMainProcessView\(view\)/);
  assert.match(preload, /setView: \(view\) => ipcRenderer\.invoke\('view:set', view\)/);
});

test('macOS packaging vendors chmlib into the app bundle', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const packageScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'package-macos.sh'), 'utf-8');
  const buildScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'build-chmlib-macos.sh'), 'utf-8');
  const preflightScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-macos-package-env.sh'), 'utf-8');
  const iconScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'generate-macos-icon.sh'), 'utf-8');
  const iconRasterizer = fs.readFileSync(path.join(projectRoot, 'scripts', 'rasterize-svg.swift'), 'utf-8');
  const icnsBuilder = fs.readFileSync(path.join(projectRoot, 'scripts', 'build-icns.js'), 'utf-8');
  const signScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'sign-macos-app.js'), 'utf-8');
  const vendorScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'vendor-chmlib-macos.sh'), 'utf-8');

  assert.equal(packageJson.scripts['check:package:mac'], 'bash scripts/check-macos-package-env.sh');
  assert.equal(packageJson.scripts['check:package:mac:arm64'], 'bash scripts/check-macos-package-env.sh arm64');
  assert.equal(packageJson.scripts['check:package:mac:x64'], 'bash scripts/check-macos-package-env.sh x64');
  assert.ok(
    packageScript.indexOf('check-macos-package-env.sh') < packageScript.indexOf('npm test'),
    'target-architecture preflight should run before the expensive test suite',
  );
  assert.match(packageScript, /vendor-chmlib-macos[.]sh/);
  assert.match(packageScript, /--ignore=/);
  assert.match(packageScript, /THIRD_PARTY_NOTICES/);
  assert.match(preflightScript, /clang codesign curl ditto install_name_tool lipo otool patch shasum swift tar/);
  assert.match(iconScript, /rasterize-svg[.]swift/);
  assert.doesNotMatch(iconScript, /sips[^\n]+\$source_svg/);
  assert.match(iconRasterizer, /import AppKit/);
  assert.match(iconRasterizer, /NSImage\(contentsOf:/);
  assert.match(iconRasterizer, /CommandLine[.]arguments[.]count == 3 \|\| CommandLine[.]arguments[.]count == 5/);
  assert.match(iconRasterizer, /let parsedWidth = Double\(CommandLine[.]arguments\[3\]\)/);
  assert.match(iconRasterizer, /let parsedHeight = Double\(CommandLine[.]arguments\[4\]\)/);
  assert.match(iconRasterizer, /width: targetWidth/);
  assert.match(iconRasterizer, /height: targetHeight/);
  assert.match(iconScript, /build-icns[.]js/);
  assert.doesNotMatch(iconScript, /iconutil/);
  assert.match(icnsBuilder, /header[.]write\('icns'/);
  assert.match(icnsBuilder, /'ic10'/);
  assert.match(vendorScript, /check-chmlib-macos[.]sh/);
  assert.ok(
    packageScript.indexOf('vendor-chmlib-macos.sh') < packageScript.indexOf('sign-macos-app.js'),
    'the final app signature should include the vendored native files',
  );
  assert.match(signScript, /identity: '-'/);
  assert.match(signScript, /optionsForFile:/);
  assert.doesNotMatch(signScript, /^    hardenedRuntime: false,/m);
  assert.match(signScript, /'--verify', '--deep', '--strict'/);
  assert.match(buildScript, /-install_name,@loader_path\/\.\.\/lib\/libchm[.]0[.]dylib/);
  assert.match(vendorScript, /codesign --force --sign -/);
  assert.match(vendorScript, /Contents\/Resources\/native\/darwin-\$arch/);
});

test('macOS packaging disables unused Electron runtime entry points before signing', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const packageScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'package-macos.sh'), 'utf-8');
  const fuseScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'flip-electron-fuses.js'), 'utf-8');
  const fuseChecker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-electron-fuses.js'), 'utf-8');
  const asarIntegrityChecker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-electron-asar-integrity.js'), 'utf-8');
  const bundleVerifier = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-macos-release-bundle.sh'), 'utf-8');
  const adhocSignatureChecker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-macos-adhoc-signature.js'), 'utf-8');
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');
  const chineseReleaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.zh-CN.md'), 'utf-8');
  const securityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.md'), 'utf-8');
  const chineseSecurityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.equal(packageJson.devDependencies['@electron/fuses'], '2.1.3');
  assert.match(fuseScript, /FuseV1Options\.RunAsNode\]: false/);
  assert.match(fuseScript, /FuseV1Options\.EnableNodeOptionsEnvironmentVariable\]: false/);
  assert.match(fuseScript, /FuseV1Options\.EnableNodeCliInspectArguments\]: false/);
  assert.match(fuseScript, /strictlyRequireAllFuses: true/);
  assert.match(fuseScript, /FuseV1Options\.OnlyLoadAppFromAsar\]: true/);
  assert.match(fuseScript, /FuseV1Options\.EnableEmbeddedAsarIntegrityValidation\]: true/);
  assert.match(fuseScript, /FuseV1Options\.GrantFileProtocolExtraPrivileges\]: true/);
  assert.match(fuseChecker, /readElectronFuseWires/);
  assert.match(fuseChecker, /\['RunAsNode', 48\]/);
  assert.match(fuseChecker, /\['OnlyLoadAppFromAsar', 49\]/);
  assert.match(fuseChecker, /\['EnableEmbeddedAsarIntegrityValidation', 49\]/);
  assert.match(bundleVerifier, /check-electron-fuses[.]js/);
  assert.match(bundleVerifier, /check-electron-asar-integrity[.]js/);
  assert.match(bundleVerifier, /check-macos-adhoc-signature[.]js/);
  assert.match(bundleVerifier, /check-macos-release-root[.]js/);
  assert.match(adhocSignatureChecker, /unexpectedly enables hardened runtime for an ad-hoc signature/);
  assert.match(asarIntegrityChecker, /ElectronAsarIntegrity/);
  assert.match(asarIntegrityChecker, /getRawHeader/);
  assert.match(releaseDoc, /flips the production Electron fuses before the final signature/);
  assert.match(releaseDoc, /verifies the expected Electron fuse states/);
  assert.match(releaseDoc, /every Mach-O file/);
  assert.match(chineseReleaseDoc, /在最终签名前翻转生产 Electron fuses/);
  assert.match(chineseReleaseDoc, /核验预期的 Electron fuse 状态/);
  assert.match(chineseReleaseDoc, /每个 Mach-O 文件/);
  assert.match(securityModel, /`ELECTRON_RUN_AS_NODE`, `NODE_OPTIONS`, and command-line debugging entry points are disabled/);
  assert.match(securityModel, /OnlyLoadAppFromAsar/);
  assert.match(securityModel, /Embedded ASAR integrity validation is enabled/);
  assert.match(chineseSecurityModel, /禁用 `ELECTRON_RUN_AS_NODE`、`NODE_OPTIONS` 和命令行调试入口/);
  assert.match(chineseSecurityModel, /OnlyLoadAppFromAsar/);
  assert.match(chineseSecurityModel, /embedded ASAR integrity validation 已启用/);
  assert.match(changelog, /production Electron fuses/);
  assert.ok(
    packageScript.indexOf('flip-electron-fuses.js') < packageScript.indexOf('sign-macos-app.js'),
    'Electron fuses must be flipped before the final app signature',
  );
});

test('macOS packaging builds and verifies a pinned CVE-patched CHMLib', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const buildScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'build-chmlib-macos.sh'), 'utf-8');
  const verifyScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-chmlib-macos.sh'), 'utf-8');
  const packageScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'package-macos.sh'), 'utf-8');
  const preflightScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-macos-package-env.sh'), 'utf-8');
  const vendorScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'vendor-chmlib-macos.sh'), 'utf-8');
  const bundleVerifier = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-macos-release-bundle.sh'), 'utf-8');
  const signScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'sign-macos-app.js'), 'utf-8');
  const workflowChecker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-workflows.js'), 'utf-8');
  const releaseWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'release.yml'), 'utf-8');
  const securityPatch = fs.readFileSync(path.join(projectRoot, 'vendor', 'chmlib', 'CVE-2025-48172.patch'), 'utf-8');
  const extractionLimitsPatch = fs.readFileSync(path.join(projectRoot, 'vendor', 'chmlib', 'extraction-limits.patch'), 'utf-8');
  const thirdPartyNotice = fs.readFileSync(path.join(projectRoot, 'THIRD_PARTY_NOTICES.md'), 'utf-8');
  const securityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.md'), 'utf-8');
  const chineseSecurityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.zh-CN.md'), 'utf-8');
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');
  const chineseReleaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.zh-CN.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  const upstreamCommit = '2bef8d063ec7d88a8de6fd9f0513ea42ac0fa21f';
  const archiveSha256 = 'c6a6e0cc46d0597045e82972347f95744bb2da6c1db7afc6db303051b37b1ca7';
  const referenceFix = '08179946a745cf1605e4b9670942ec1a6e1f4c5d';

  assert.equal(packageJson.scripts['build:chmlib:mac:arm64'], 'bash scripts/build-chmlib-macos.sh arm64');
  assert.equal(packageJson.scripts['build:chmlib:mac:x64'], 'bash scripts/build-chmlib-macos.sh x64');
  assert.equal(packageJson.scripts['check:chmlib:mac'], 'bash scripts/check-chmlib-macos.sh');
  assert.match(buildScript, new RegExp(upstreamCommit));
  assert.match(buildScript, new RegExp(archiveSha256));
  assert.match(buildScript, /https:\/\/github[.]com\/jedwing\/CHMLib\/archive\/\$\{chmlib_commit\}[.]tar[.]gz/);
  assert.match(buildScript, /curl[^\n]+--proto '=https'[^\n]+--tlsv1[.]2/);
  assert.match(buildScript, /shasum -a 256 -c/);
  assert.match(buildScript, /patch_path=.+CVE-2025-48172[.]patch/);
  assert.match(buildScript, /limits_patch_path=.+extraction-limits[.]patch/);
  assert.match(buildScript, /patch --batch --forward --fuzz=0[^\n]+security_patch_path/);
  assert.match(buildScript, /patch --batch --forward --fuzz=0[^\n]+limits_patch_path/);
  assert.match(buildScript, /CHMLIB-PROVENANCE[.]txt/);
  assert.match(buildScript, /Extractor-SHA256:/);
  assert.match(buildScript, /Library-SHA256:/);
  assert.match(buildScript, /source\/CHMLib/);
  assert.match(buildScript, /CHMLib-\$chmlib_commit[.]tar[.]gz/);
  assert.match(buildScript, /COPYING[.]CHMLib/);
  assert.match(buildScript, /-mmacosx-version-min=12[.]0/);
  assert.match(securityPatch, /#include <limits[.]h>/);
  assert.match(securityPatch, /uncompressed_len > INT_MAX/);
  assert.match(securityPatch, /compressed_len > INT_MAX/);
  assert.match(securityPatch, /block_len == 0 \|\| dest->block_len > INT_MAX/);
  assert.match(securityPatch, new RegExp(referenceFix));
  assert.match(extractionLimitsPatch, /MAX_EXTRACTION_FILES 50000/);
  assert.match(extractionLimitsPatch, /MAX_EXTRACTION_TOTAL_BYTES[^\n]+1024[^\n]+1024[^\n]+1024/);
  assert.match(extractionLimitsPatch, /MAX_EXTRACTION_FILE_BYTES[^\n]+256[^\n]+1024[^\n]+1024/);
  assert.ok(
    extractionLimitsPatch.indexOf('ui->length > MAX_EXTRACTION_FILE_BYTES')
      < extractionLimitsPatch.indexOf('fopen(buffer, "wb")'),
    'the native extractor must reject oversized entries before opening an output file',
  );
  assert.match(extractionLimitsPatch, /fwrite[^\n]+!= \(size_t\)len/);
  assert.match(extractionLimitsPatch, /request_len = remain < sizeof\(buffer\) \? \(LONGINT64\)remain : \(LONGINT64\)sizeof\(buffer\)/);
  assert.match(extractionLimitsPatch, /len > request_len/);
  assert.match(extractionLimitsPatch, /incomplete file:[^\n]+[\s\S]+return CHM_ENUMERATOR_FAILURE/);
  assert.match(extractionLimitsPatch, /return 1;/);
  assert.match(verifyScript, new RegExp(upstreamCommit));
  assert.match(verifyScript, new RegExp(archiveSha256));
  assert.match(verifyScript, /CVE-2025-48172/);
  assert.match(verifyScript, /shasum -a 256/);
  assert.match(verifyScript, /bundled_patch=.+CVE-2025-48172[.]patch/);
  assert.match(verifyScript, /bundled_limits_patch=.+extraction-limits[.]patch/);
  assert.match(verifyScript, /cmp -s "\$patch_path" "\$bundled_patch"/);
  assert.match(verifyScript, /cmp -s "\$limits_patch_path" "\$bundled_limits_patch"/);
  assert.match(verifyScript, /lipo -archs/);
  assert.match(verifyScript, /@loader_path\/\.\.\/lib/);
  assert.match(verifyScript, /source_archive/);
  assert.match(verifyScript, /COPYING[.]CHMLib/);
  assert.match(verifyScript, /deployment_target="12[.]0"/);
  assert.match(verifyScript, /LC_BUILD_VERSION/);
  assert.match(verifyScript, /minos/);
  assert.doesNotMatch(preflightScript, /opt\/homebrew|usr\/local|brew install/);
  assert.doesNotMatch(vendorScript, /opt\/homebrew|usr\/local|brew install/);
  assert.match(packageScript, /build-chmlib-macos[.]sh/);
  assert.ok(
    packageScript.indexOf('build-chmlib-macos.sh') < packageScript.indexOf('vendor-chmlib-macos.sh'),
    'the pinned native build must finish before vendoring starts',
  );
  assert.match(vendorScript, /check-chmlib-macos[.]sh/);
  assert.match(vendorScript, /CHMLIB-PROVENANCE[.]txt/);
  assert.match(vendorScript, /source/);
  assert.match(bundleVerifier, /check-chmlib-macos[.]sh/);
  assert.ok(
    bundleVerifier.indexOf('codesign --verify --deep --strict') < bundleVerifier.indexOf('check-chmlib-macos.sh'),
    'the archive must pass app signature verification before native provenance verification',
  );
  assert.match(signScript, /ignore: \[new RegExp/);
  assert.match(signScript, /Resources.+native/);
  assert.doesNotMatch(releaseWorkflow, /brew install chmlib/);
  assert.ok(releaseWorkflow.includes('npm run package:release:mac:${{ matrix.arch }}'));
  assert.doesNotMatch(workflowChecker, /release CHMLib install step/);
  assert.match(workflowChecker, /pinned patched CHMLib build/);
  assert.match(thirdPartyNotice, /CHMLib/);
  assert.match(thirdPartyNotice, /LGPL-2[.]1-or-later/);
  assert.match(thirdPartyNotice, new RegExp(upstreamCommit));
  assert.match(thirdPartyNotice, /CVE-2025-48172/);
  assert.match(securityModel, /CVE-2025-48172/);
  assert.match(chineseSecurityModel, /CVE-2025-48172/);
  assert.match(releaseDoc, /CHMLIB-PROVENANCE[.]txt/);
  assert.match(chineseReleaseDoc, /CHMLIB-PROVENANCE[.]txt/);
  assert.match(changelog, /CVE-2025-48172/);
});

test('macOS package declares CHM document association', () => {
  const packageScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'package-macos.sh'), 'utf-8');
  const infoPlist = fs.readFileSync(path.join(projectRoot, 'resources', 'macos', 'Info.plist'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(packageScript, /--extend-info="\$root_dir\/resources\/macos\/Info\.plist"/);
  assert.match(infoPlist, /<key>CFBundleDocumentTypes<\/key>/);
  assert.match(infoPlist, /<string>CHM Document<\/string>/);
  assert.match(infoPlist, /<string>chm<\/string>/);
  assert.match(infoPlist, /<key>UTExportedTypeDeclarations<\/key>/);
  assert.match(infoPlist, /<string>com\.microsoft\.chm<\/string>/);
  assert.match(infoPlist, /<string>application\/vnd\.ms-htmlhelp<\/string>/);
  assert.match(main, /app\.on\('open-file'/);
  assert.match(main, /importAndOpen\(filePath\)/);
  assert.match(main, /findBookByFilePath\(library\.books, filePath, process\.platform === 'darwin'\)/);
  assert.match(main, /const hasSingleInstanceLock = app\.requestSingleInstanceLock\(\)/);
  assert.match(main, /function getLaunchChmPath\(argv: readonly string\[\]\): string \| undefined/);
  assert.match(main, /path\.extname\(resolved\)\.toLowerCase\(\) === '\.chm'/);
  assert.match(main, /pendingFile = pendingFile \|\| getLaunchChmPath\(process\.argv\)/);
  assert.match(main, /app\.on\('second-instance', \(_event: Electron\.Event, argv: string\[\]\) =>/);
  assert.match(main, /const launchedFile = getLaunchChmPath\(argv\)/);
  assert.match(main, /targetWindow\.restore\(\)/);
  assert.match(main, /targetWindow\.focus\(\)/);
  assert.match(readme, /从 Finder 或命令行传入 `.chm` 文件时，应用会自动加入书库并打开阅读。/);
  assert.match(changelog, /launch-time CHM file handling/);
});

test('public launch handoff keeps source, repository settings, and release authority separate', () => {
  const handoff = fs.readFileSync(path.join(projectRoot, 'docs', 'public-launch-handoff.md'), 'utf-8');
  const docsIndex = fs.readFileSync(path.join(projectRoot, 'docs', 'index.md'), 'utf-8');
  const gitignore = fs.readFileSync(path.join(projectRoot, '.gitignore'), 'utf-8');
  const changelog = fs.readFileSync(path.join(projectRoot, 'CHANGELOG.md'), 'utf-8');

  assert.match(handoff, /# Public Launch Handoff/);
  assert.match(handoff, /## 1\. Review and merge source changes to `main`/);
  assert.match(handoff, /## 2\. Apply repository About, topics, and Discussions settings/);
  assert.match(handoff, /## 3\. Build and publish the first dual-architecture Release/);
  assert.match(handoff, /## 4\. Promote only after live verification/);
  assert.match(handoff, /`npm test`/);
  assert.match(handoff, /`npm run check`/);
  assert.match(handoff, /`npm run doctor`/);
  assert.match(handoff, /`npm run check:remote-listing`/);
  assert.match(handoff, /`npm run check:remote-release`/);
  assert.match(handoff, /`npm run snapshot:growth`/);
  assert.match(handoff, /`macos-15-intel`/);
  assert.match(handoff, /Do not use `git add \.`/);
  assert.match(handoff, /`CHMReaderLight-mac-arm64\.zip`/);
  assert.match(handoff, /`Report`/);
  assert.match(handoff, /No commit, push, tag, Release, issue, or repository-setting mutation/);
  assert.match(docsIndex, /\[Public Launch Handoff\]\(\.\/public-launch-handoff\.md\)/);
  assert.match(gitignore, /^\/CHMReaderLight-mac-\*\.zip(?:\.sha256)?$/m);
  assert.match(gitignore, /^\/CHMReaderLight-mac-\*\.zip\.sha256$/m);
  assert.match(gitignore, /^\/Report$/m);
  assert.match(changelog, /public launch handoff for sequencing source review, repository settings, dual-architecture release publishing, and measured promotion/);
});

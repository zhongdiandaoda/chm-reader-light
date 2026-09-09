const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = process.cwd();
export { };

test('README stays concise and uses an actual app screenshot', () => {
  const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  const englishReadme = fs.readFileSync(path.join(projectRoot, 'README.en.md'), 'utf-8');
  const preview = fs.readFileSync(path.join(projectRoot, 'docs', 'assets', 'app-preview.png'));
  const markdownFiles = fs.readdirSync(path.join(projectRoot, 'docs'))
    .filter((fileName: string) => fileName.endsWith('.md'));

  assert.ok(readme.split('\n').length <= 130);
  assert.ok(englishReadme.split('\n').length <= 130);
  assert.ok(markdownFiles.length <= 15);
  assert.match(readme, /!\[CHMReaderLight 实际空书库界面\]\(\.\/docs\/assets\/app-preview\.png\)/);
  assert.match(englishReadme, /!\[Actual CHMReaderLight empty library\]\(\.\/docs\/assets\/app-preview\.png\)/);
  assert.equal(preview.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(preview.readUInt32BE(16), 1280);
  assert.equal(preview.readUInt32BE(20), 760);
  for (const relativePath of [
    'docs/install-macos.md',
    'docs/compatibility.md',
    'docs/privacy.md',
    'docs/security-model.md',
    'docs/troubleshooting.md',
    'docs/architecture.md',
    'docs/testing.md',
    'docs/release.md',
  ]) assert.ok(fs.existsSync(path.join(projectRoot, relativePath)), relativePath);
});

test('application branding uses one modern macOS logo across the titlebar and empty library', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const logo = fs.readFileSync(path.join(projectRoot, 'src', 'assets', 'app-logo.svg'), 'utf-8');

  assert.ok(html.includes('<img class="titlebar-logo" src="./assets/app-logo.svg" alt="">'));
  assert.ok(html.includes('<img class="empty-app-logo" src="./assets/app-logo.svg" alt="">'));
  assert.ok(logo.includes('<title>Open book logo</title>'));
  assert.ok(logo.includes('id="background"'));
  assert.ok(logo.includes('id="paper"'));
  assert.ok(logo.includes('<rect width="128" height="128" fill="url(#background)"/>'));
  assert.match(logo, /M24 27[.]5C37[.]2 27 49[.]8 30[.]2 61[.]8 36[.]5V88/);
  assert.match(logo, /stop-color="#FF6850"/);
  assert.match(logo, /stop-color="#FFFBEF"/);
  assert.doesNotMatch(logo, /<rect x="6" y="5"/);
  assert.doesNotMatch(logo, /M38 28H76L94 46/);
  assert.doesNotMatch(logo, /chm-lettering/);
  assert.doesNotMatch(logo, /rotate\(45/);
});

test('application chrome follows a modern macOS visual system', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

  assert.match(css, /--accent: #e66b00;/);
  assert.match(css, /--reader-paper: #fffdf9;/);
  assert.match(css, /--font-ui: -apple-system, BlinkMacSystemFont, "SF Pro Text"/);
  assert.match(css, /--font-display: "SF Pro Display", -apple-system/);
  assert.match(css, /[.]collection-item[.]active\s*{[^}]*background: var\(--accent-soft\);/s);
  assert.match(css, /[.]empty-app-logo\s*{[^}]*width: 92px;[^}]*drop-shadow/s);
  assert.match(css, /[.]library-content\s*{[^}]*background: var\(--surface\);/s);
  assert.doesNotMatch(css, /letter-spacing:\s*-/);
  assert.doesNotMatch(css, /radial-gradient/);
  assert.match(main, /backgroundColor: '#f5f5f7'/);
});

test('share kit gives maintainers reusable launch copy', () => {
  const shareKit = fs.readFileSync(path.join(projectRoot, 'docs', 'share-kit.md'), 'utf-8');
  const sharePostScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'prepare-share-post.js'), 'utf-8');

  assert.match(shareKit, /# Share Kit/);
  assert.match(shareKit, /## Social Post Template/);
  assert.match(shareKit, /CHMReaderLight-mac-arm64.zip/);
  assert.doesNotMatch(shareKit, /Intel|mac-x64/i);
  assert.match(shareKit, /Ask for a GitHub star only after explaining the offline CHM workflow value/);
  assert.match(sharePostScript, /function buildSharePostDraft/);
  assert.match(sharePostScript, /Do not post until npm run snapshot:visibility reports ready/);
});

test('macOS install guide sets clear release expectations', () => {
  const support = fs.readFileSync(path.join(projectRoot, 'SUPPORT.md'), 'utf-8');
  const installGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'install-macos.md'), 'utf-8');
  assert.match(support, /\[macOS Install Guide\]\(\.\/docs\/install-macos\.md\)/);
  assert.match(installGuide, /# macOS Install Guide/);
  assert.match(installGuide, /## Choose the Right Download/);
  assert.match(installGuide, /CHMReaderLight-mac-arm64\.zip/);
  assert.match(installGuide, /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-arm64\.zip/);
  assert.match(installGuide, /\[CHMReaderLight-mac-arm64\.zip\.sha256\]\(https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/releases\/latest\/download\/CHMReaderLight-mac-arm64\.zip\.sha256\)/);
  assert.match(installGuide, /## Verify the Download/);
  assert.match(installGuide, /shasum -a 256 -c CHMReaderLight-mac-arm64\.zip\.sha256/);
  assert.doesNotMatch(installGuide, /Intel|mac-x64/i);
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
});

test('signing and notarization guide explains macOS trust status', () => {
  const installGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'install-macos.md'), 'utf-8');
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');
  const signingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'signing-notarization.md'), 'utf-8');
  assert.match(installGuide, /\[Signing and Notarization\]\(\.\/signing-notarization\.md\)/);
  assert.match(releaseDoc, /\[Signing and Notarization\]\(\.\/signing-notarization\.md\)/);
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
});

test('quality gate keeps changelog entries unique', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const checker = fs.readFileSync(path.join(projectRoot, 'scripts', 'check-changelog.js'), 'utf-8');

  assert.equal(packageJson.scripts['check:changelog'], 'node scripts/check-changelog.js');
  assert.match(packageJson.scripts.check, /npm run check:changelog/);
  assert.match(checker, /Checks changelog sections for duplicate bullet entries/);
  assert.match(checker, /function findDuplicateBullets/);
  assert.match(checker, /Duplicate changelog entries found:/);
});

test('test script forwards Node test runner arguments', () => {
  const testScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'test.js'), 'utf-8');

  assert.match(testScript, /const testArgs = process\.argv\.slice\(2\)/);
  assert.match(testScript, /'--test', \.\.\.testArgs, \.\.\.sourceTests, \.\.\.compiledTests/);
});

test('package metadata helps users discover the project', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));

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
});

test('repository listing guide helps maintainers configure GitHub discovery', () => {
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');
  const listingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'repository-listing.md'), 'utf-8');
  const socialPreview = fs.readFileSync(path.join(projectRoot, 'docs', 'assets', 'social-preview.svg'), 'utf-8');
  const socialPreviewPng = fs.readFileSync(path.join(projectRoot, 'docs', 'assets', 'social-preview.png'));
  const discussionTemplateDir = path.join(projectRoot, '.github', 'DISCUSSION_TEMPLATE');
  const qAndAForm = fs.readFileSync(path.join(discussionTemplateDir, 'q-a.yml'), 'utf-8');
  const showAndTellForm = fs.readFileSync(path.join(discussionTemplateDir, 'show-and-tell.yml'), 'utf-8');
  const releaseFeedbackForm = fs.readFileSync(path.join(discussionTemplateDir, 'release-feedback.yml'), 'utf-8');
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
  assert.match(listingGuide, /stars, license, and platform badges/);
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
});

test('GitHub label definitions keep issue and release routing reproducible', () => {
  const listingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'repository-listing.md'), 'utf-8');
  const labelsConfig = fs.readFileSync(path.join(projectRoot, '.github', 'labels.yml'), 'utf-8');

  assert.match(listingGuide, /\.github\/labels\.yml/);

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

test('growth readiness guide keeps promotion blockers actionable', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const growthGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'growth-readiness.md'), 'utf-8');

  for (const scriptName of [
    'check:growth',
    'check:remote-listing',
    'apply:repository-listing',
    'check:remote-release',
    'snapshot:growth',
    'snapshot:visibility',
    'prepare:visibility-issue',
    'prepare:share-post',
    'publish:release',
  ]) assert.ok(packageJson.scripts[scriptName], scriptName);
  assert.match(growthGuide, /## Current Remote Blockers/);
  assert.match(growthGuide, /## Promotion Sequence/);
  assert.match(growthGuide, /npm run check:remote-listing/);
  assert.match(growthGuide, /npm run check:remote-release/);
  assert.match(growthGuide, /npm run snapshot:growth/);
  assert.match(growthGuide, /## Ready to Promote/);
});

test('citation metadata helps external references point to the project', () => {
  const citation = fs.readFileSync(path.join(projectRoot, 'CITATION.cff'), 'utf-8');

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
});

test('CODEOWNERS routes reviews for code docs automation and packaging', () => {
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
});

test('CI workflow cancels superseded branch runs', () => {
  const ciWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'ci.yml'), 'utf-8');

  assert.match(ciWorkflow, /^name: CI$/m);
  assert.match(ciWorkflow, /^  pull_request:$/m);
  assert.match(ciWorkflow, /^  push:$/m);
  assert.match(ciWorkflow, /^concurrency:$/m);
  assert.match(ciWorkflow, /^  group: ci-\$\{\{ github\.workflow \}\}-\$\{\{ github\.ref \}\}$/m);
  assert.match(ciWorkflow, /^  cancel-in-progress: true$/m);
  assert.match(ciWorkflow, /run: npm test/);
  assert.match(ciWorkflow, /run: npm run check/);
});

test('GitHub Actions jobs have explicit timeouts', () => {
  const ciWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'ci.yml'), 'utf-8');
  const codeqlWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'codeql.yml'), 'utf-8');
  const dependencyReviewWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'dependency-review.yml'), 'utf-8');
  const releaseWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'release.yml'), 'utf-8');

  assert.match(ciWorkflow, /^    timeout-minutes: 15$/m);
  assert.match(codeqlWorkflow, /^    timeout-minutes: 20$/m);
  assert.match(dependencyReviewWorkflow, /^    timeout-minutes: 10$/m);
  assert.match(releaseWorkflow, /^    timeout-minutes: 45$/m);
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
  const securityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.md'), 'utf-8');
  const scorecardWorkflow = fs.readFileSync(path.join(projectRoot, '.github', 'workflows', 'scorecard.yml'), 'utf-8');
  assert.match(scorecardWorkflow, /^name: OpenSSF Scorecard$/m);
  assert.match(scorecardWorkflow, /^  schedule:$/m);
  assert.match(scorecardWorkflow, /cron: '0 3 \* \* 2'/);
  assert.match(scorecardWorkflow, /^  pull_request:$/m);
  assert.match(scorecardWorkflow, /^  push:$/m);
  assert.match(scorecardWorkflow, /^permissions: read-all$/m);
  assert.match(
    scorecardWorkflow,
    /scorecard:\n    name: Scorecard(?:.|\n)*?permissions:\n      security-events: write\n      id-token: write\n      contents: read/,
  );
  assert.match(scorecardWorkflow, /uses: ossf\/scorecard-action@[a-f0-9]{40} # v2\.4\.2/);
  assert.match(scorecardWorkflow, /results_file: scorecard-results\.sarif/);
  assert.match(scorecardWorkflow, /publish_results: true/);
  assert.match(scorecardWorkflow, /github\/codeql-action\/upload-sarif@[a-f0-9]{40} # v4/);
  assert.match(scorecardWorkflow, /^    timeout-minutes: 20$/m);
  assert.match(securityModel, /\[OpenSSF Scorecard\]\(https:\/\/scorecard\.dev\/view\/github\.com\/zhongdiandaoda\/chm-reader-light\)/);
  assert.match(securityModel, /supply-chain posture/);
});

test('release template stays aligned with release workflow artifacts', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const releaseTemplate = fs.readFileSync(path.join(projectRoot, 'docs', 'release-template.md'), 'utf-8');
  const releaseGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');

  assert.equal(packageJson.scripts['check:release-template'], 'node scripts/check-release-template.js');
  assert.equal(packageJson.scripts['stage:release-artifacts'], 'node scripts/stage-release-artifacts.js');
  assert.equal(packageJson.scripts['publish:release'], 'node scripts/publish-release.js');
  for (const name of [
    'CHMReaderLight-mac-arm64.zip',
    'CHMReaderLight-mac-arm64.zip.sha256',
  ]) assert.match(releaseTemplate, new RegExp(name.replaceAll('.', '[.]')));
  assert.match(releaseTemplate, /gh attestation verify/);
  assert.match(releaseTemplate, /not Apple-notarized yet/);
  assert.match(releaseGuide, /npm run publish:release/);
});

test('compatibility notes set expectations for supported CHM files', () => {
  const troubleshooting = fs.readFileSync(path.join(projectRoot, 'docs', 'troubleshooting.md'), 'utf-8');
  const compatibility = fs.readFileSync(path.join(projectRoot, 'docs', 'compatibility.md'), 'utf-8');
  assert.match(troubleshooting, /\[Compatibility Notes\]\(\.\/compatibility\.md\)/);
  assert.match(compatibility, /## Expected to Work/);
  assert.match(compatibility, /## Known Limits/);
  assert.match(compatibility, /## Encoding Guidance/);
  assert.match(compatibility, /## Reporting Gaps/);
  assert.match(compatibility, /\.hhc table of contents/);
  assert.match(compatibility, /legacy encodings/);
  assert.match(compatibility, /CHM-authored scripts, inline event handlers, form submissions, plugin objects, network connections, popups, and nested frames are blocked/);
  assert.match(compatibility, /nonce-protected navigation bridge/);
  assert.match(compatibility, /Help > Copy Diagnostic Info/);
});

test('keyboard shortcuts remain wired to reader commands', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.ok(main.includes("accelerator: 'CmdOrCtrl+G'"));
  assert.ok(main.includes("sendToMainWindow('reader:shortcut', 'find-next')"));
  assert.ok(main.includes("sendToMainWindow('reader:shortcut', 'history-back')"));
  assert.ok(main.includes("sendToMainWindow('reader:shortcut', 'next-topic')"));
  assert.ok(main.includes("sendToMainWindow('reader:shortcut', 'toggle-sidebar')"));
  assert.ok(preload.includes("ipcRenderer.on('reader:shortcut', listener)"));
  assert.ok(renderer.includes('function runReaderShortcut(command: ReaderShortcutCommand): void'));
  assert.match(renderer, /case 'zoom-reset':/);
});

test('reader toolbar shows the current topic position', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(html, /<output class="toolbar-meta reader-progress" id="reader-progress" aria-live="polite" hidden><\/output>/);
  assert.match(renderer, /readerProgress: query\('#reader-progress'\)/);
  assert.match(renderer, /function updateReaderProgress\(currentIndex: number\): void/);
  assert.match(renderer, /elements\.readerProgress\.textContent = currentIndex >= 0\s*\?\s*`第 \$\{currentIndex \+ 1\} \/ \$\{readingOrder\.length\} 节`\s*:\s*''/);
  assert.match(renderer, /elements\.readerProgress\.hidden = currentIndex < 0 \|\| readingOrder\.length === 0/);
  assert.match(renderer, /updateReaderProgress\(currentIndex\)/);
  assert.match(css, /\.reader-progress\s*{/);
});

test('reader toolbar shows the current topic title', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(html, /<output class="toolbar-meta reader-topic-title" id="reader-topic-title" aria-live="polite" hidden><\/output>/);
  assert.match(renderer, /readerTopicTitle: query\('#reader-topic-title'\)/);
  assert.match(renderer, /function updateReaderTopicTitle\(\): void/);
  assert.match(renderer, /const topicTitle = getCurrentTopicTitle\(\)/);
  assert.match(renderer, /elements\.readerTopicTitle\.hidden = !topicTitle/);
  assert.match(renderer, /elements\.readerTopicTitle\.textContent = topicTitle \|\| ''/);
  assert.match(renderer, /elements\.readerTopicTitle\.title = topicTitle \|\| ''/);
  assert.match(renderer, /updateReaderTopicTitle\(\)/);
  assert.match(css, /\.reader-topic-title\s*{/);
});

test('reader window title includes current book and topic', () => {
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /function getCurrentTopicTitle\(\): string \| null/);
  assert.match(renderer, /return currentBook && currentTopicPath\s*\?\s*findTopicTitleByPath\(currentBook\.contents, currentTopicPath\) \|\| currentTopicPath\s*:\s*null/);
  assert.match(renderer, /function updateDocumentTitle\(\): void/);
  assert.match(renderer, /document\.title = currentBook\s*\?\s*`\$\{currentBook\.name\}\$\{topicTitle \? ` - \$\{topicTitle\}` : ''\} - CHMReaderLight`\s*:\s*'CHMReaderLight'/);
  assert.match(renderer, /updateDocumentTitle\(\)/);
  assert.match(renderer, /currentTopicPath = topicPath;\s+if \(currentBook\) saveReaderLastTopicPreference\(currentBook, topicPath\);\s+updateDocumentTitle\(\);/);
  assert.match(renderer, /currentTopicPath = topicPath \|\| currentTopicPath;\n  updateDocumentTitle\(\);/);
  assert.match(renderer, /elements\.bookTitle\.textContent = '正在打开\.\.\.';\n  document\.title = 'Opening - CHMReaderLight';/);
  assert.match(renderer, /function showView\(view: 'library' \| 'reader'\): void[\s\S]*if \(!isReader\) document\.title = 'CHMReaderLight'/);
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

  assert.ok(renderer.includes('void window.chmReader.setView(view).catch'));
  assert.ok(renderer.includes('void window.chmReader.openExternal(url).catch'));
  assert.ok(renderer.includes('openExternalLink(onboardingLinks.readme)'));
  assert.ok(renderer.includes('openExternalLink(event.data.href)'));
});

test('reader sidebar shows the available topic count', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(html, /<output class="sidebar-topic-count" id="sidebar-topic-count" aria-live="polite" hidden><\/output>/);
  assert.match(renderer, /sidebarTopicCount: query\('#sidebar-topic-count'\)/);
  assert.match(renderer, /function updateSidebarTopicCount\(\): void/);
  assert.match(renderer, /elements\.sidebarTopicCount\.hidden = readingOrder\.length === 0/);
  assert.match(renderer, /elements\.sidebarTopicCount\.textContent = readingOrder\.length > 0\s*\?\s*`共 \$\{readingOrder\.length\} 节`\s*:\s*''/);
  assert.match(renderer, /updateSidebarTopicCount\(\)/);
  assert.match(css, /\.sidebar-topic-count\s*{/);
});

test('reader toolbar omits the copy-current-topic action', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.doesNotMatch(html, /id="copy-topic-reference"/);
  assert.doesNotMatch(renderer, /copyTopicReference/);
  assert.doesNotMatch(renderer, /copyCurrentTopicReference/);
  assert.doesNotMatch(renderer, /已复制当前章节引用|复制当前章节引用失败/);
});

test('architecture overview helps contributors find the right code areas', () => {
  const contributing = fs.readFileSync(path.join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');
  const architecture = fs.readFileSync(path.join(projectRoot, 'docs', 'architecture.md'), 'utf-8');

  assert.ok(contributing.includes('[Architecture](./docs/architecture.md)'));
  assert.match(architecture, /## Runtime Flow/);
  assert.match(architecture, /## Code Map/);
  assert.ok(architecture.includes('src/main.ts'));
  assert.ok(architecture.includes('src/renderer.ts'));
});

test('release workflow generates GitHub release notes for tagged builds', () => {
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
});

test('Dependabot pull requests use release-note friendly metadata', () => {
  const dependabot = fs.readFileSync(path.join(projectRoot, '.github', 'dependabot.yml'), 'utf-8');

  assert.match(dependabot, /labels:\n\s+- dependencies/);
  assert.match(dependabot, /commit-message:\n\s+prefix: chore/);
  assert.match(dependabot, /labels:\n\s+- github-actions/);
});

test('privacy docs explain local data handling and reader boundaries', () => {
  const security = fs.readFileSync(path.join(projectRoot, 'SECURITY.md'), 'utf-8');
  const privacy = fs.readFileSync(path.join(projectRoot, 'docs', 'privacy.md'), 'utf-8');
  assert.match(security, /\[Privacy and Local Data\]\(\.\/docs\/privacy\.md\)/);
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

  assert.match(security, /CodeQL code scanning runs on pull requests, pushes to `main`, and a weekly schedule/);
  assert.match(security, /## Response Expectations/);
  assert.match(security, /Acknowledge new reports within 7 days/);
  assert.match(security, /Share a status update at least every 14 days/);
  assert.match(security, /Coordinate public disclosure after a fix is available/);
  assert.match(security, /Document confirmed fixes in `CHANGELOG.md` and the relevant GitHub Release notes/);
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

test('security model documents the CHM reader trust boundaries', () => {
  const security = fs.readFileSync(path.join(projectRoot, 'SECURITY.md'), 'utf-8');
  const privacy = fs.readFileSync(path.join(projectRoot, 'docs', 'privacy.md'), 'utf-8');
  const compatibility = fs.readFileSync(path.join(projectRoot, 'docs', 'compatibility.md'), 'utf-8');
  const securityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.md'), 'utf-8');
  assert.match(security, /\[Security Model\]\(\.\/docs\/security-model\.md\)/);
  assert.match(privacy, /\[Security Model\]\(\.\/security-model\.md\)/);
  assert.match(compatibility, /\[Security Model\]\(\.\/security-model\.md\)/);
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
}
);

test('content iframe blocks CHM-authored active content while allowing the navigation bridge', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const iframe = html.match(/<iframe\s+[^>]*id="content-frame"[^>]*>/s)?.[0] || '';
  const sandbox = iframe.match(/sandbox="([^"]+)"/)?.[1] || '';

  assert.match(sandbox, /\ballow-same-origin\b/);
  assert.match(sandbox, /\ballow-scripts\b/);
  assert.match(main, /default-src 'none'; base-uri 'none'; object-src 'none'; connect-src 'none'; form-action 'none'; frame-src 'none'; child-src 'none'; img-src chm: data:; style-src chm: 'unsafe-inline'; script-src 'nonce-\$\{scriptNonce\}'; script-src-attr 'none'; font-src chm: data:; media-src chm:/);
  assert.match(main, /default-src 'none'; base-uri 'none'; object-src 'none'; connect-src 'none'; form-action 'none'; frame-src 'none'; child-src 'none'; img-src chm: data:; style-src chm: 'unsafe-inline'; script-src 'none'; script-src-attr 'none'; font-src chm: data:; media-src chm:/);
  assert.doesNotMatch(main, /script-src[^;\n]*'unsafe-inline'/);
  assert.doesNotMatch(main, /script-src[^;\n]*chm:/);
});

test('untrusted HTML transforms enforce bounded page and search-index source budgets', () => {
  const chm = fs.readFileSync(path.join(projectRoot, 'src', 'chm.ts'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const worker = fs.readFileSync(path.join(projectRoot, 'src', 'search-index-worker.ts'), 'utf-8');
  const securityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.md'), 'utf-8');
  const compatibility = fs.readFileSync(path.join(projectRoot, 'docs', 'compatibility.md'), 'utf-8');
  const testingGuide = fs.readFileSync(path.join(projectRoot, 'docs', 'testing.md'), 'utf-8');

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
  assert.match(securityModel, /16 MiB per HTML or HHC file/);
  assert.match(securityModel, /128 MiB of HTML source per search index/);
  assert.match(securityModel, /50,000 table-of-contents items and 256 nesting levels/);
  assert.match(compatibility, /HTML or HHC file above 16 MiB/);
  assert.match(compatibility, /128 MiB source budget/);
  assert.match(testingGuide, /readMarkupFile|createSearchIndex/);
});

test('library metadata persistence has a bounded file size', () => {
  const store = fs.readFileSync(path.join(projectRoot, 'src', 'library-store.ts'), 'utf-8');
  const library = fs.readFileSync(path.join(projectRoot, 'src', 'library.ts'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const securityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.md'), 'utf-8');

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
});

test('reader opens external CHM links in the default browser', () => {
  const chm = fs.readFileSync(path.join(projectRoot, 'src', 'chm.ts'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(chm, /type: 'chm-reader:open-external'/);
  assert.match(chm, /event\.preventDefault\(\)/);
  assert.match(main, /handleTrustedIpc\('external:open'/);
  assert.match(main, /const externalUrl = normalizeExternalWebUrl\(url\)/);
  assert.match(main, /if \(externalUrl\) return shell\.openExternal\(externalUrl\)/);
  assert.match(preload, /openExternal: \(url\) => ipcRenderer\.invoke\('external:open', url\)/);
  assert.match(renderer, /if \(event\.data\?\.type === 'chm-reader:open-external'\)/);
  assert.match(renderer, /if \(event\.source !== elements\.contentFrame\.contentWindow\) return/);
  assert.match(renderer, /openExternalLink\(event\.data\.href\)/);
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
});

test('reader search scope preference persists between launches', () => {
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
});

test('reader search scope menu supports keyboard navigation', () => {
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

test('empty library state links to the compact core documentation', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  for (const label of ['项目说明', '安装说明', '本地数据', '故障排查']) assert.match(html, new RegExp(label));
  assert.ok(renderer.includes("readme: 'https://github.com/zhongdiandaoda/chm-reader-light#readme'"));
  assert.ok(renderer.includes("install: 'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/docs/install-macos.md'"));
  assert.ok(renderer.includes("privacy: 'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/docs/privacy.md'"));
  assert.ok(renderer.includes("troubleshooting: 'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/docs/troubleshooting.md'"));
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

  assert.match(renderer, /formatLibraryAddedDate/);
  assert.match(renderer, /<span class="library-added-date"><\/span>/);
  assert.match(renderer, /const addedDate = formatLibraryAddedDate\(entry\.addedAt\)/);
  assert.match(renderer, /addedDateElement\.textContent = addedDate \? `添加于 \$\{addedDate\}` : ''/);
  assert.match(renderer, /addedDateElement\.hidden = !addedDate/);
  assert.match(css, /\.library-added-date\s*{/);
  assert.match(css, /\.library-content\[data-layout="list"\] \.library-added-date\s*{/);
});

test('library cards show last-opened metadata after successful opens', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

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
});

test('library card open buttons expose metadata to assistive tech', () => {
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /const cardDescriptionIdPrefix = `library-book-\$\{entry\.id\.replace\(\//);
  assert.match(renderer, /const describedBy: string\[\] = \[\]/);
  assert.match(renderer, /locationElement\.id = `\$\{cardDescriptionIdPrefix\}-location`/);
  assert.match(renderer, /lastOpenedElement\.id = `\$\{cardDescriptionIdPrefix\}-last-opened`/);
  assert.match(renderer, /addedDateElement\.id = `\$\{cardDescriptionIdPrefix\}-added`/);
  assert.match(renderer, /sourceStatus\.id = `\$\{cardDescriptionIdPrefix\}-source-status`/);
  assert.match(renderer, /continueReading\.id = `\$\{cardDescriptionIdPrefix\}-continue-reading`/);
  assert.match(renderer, /open\.setAttribute\('aria-describedby', describedBy\.join\(' '\)\)/);
});

test('library ordering prioritizes recently opened books', () => {
  const librarySource = fs.readFileSync(path.join(projectRoot, 'src', 'library.ts'), 'utf-8');

  assert.match(librarySource, /const lastOpenedAtValue = \(book: LibraryBook\) =>/);
  assert.match(librarySource, /if \(leftLastOpenedAt !== rightLastOpenedAt\) return rightLastOpenedAt - leftLastOpenedAt/);
  assert.match(librarySource, /if \(leftAddedAt !== rightAddedAt\) return rightAddedAt - leftAddedAt/);
});

test('local data docs cover last-opened library metadata', () => {
  const privacy = fs.readFileSync(path.join(projectRoot, 'docs', 'privacy.md'), 'utf-8');
  const architecture = fs.readFileSync(path.join(projectRoot, 'docs', 'architecture.md'), 'utf-8');
  assert.match(privacy, /added time and last-opened time/);
  assert.match(architecture, /added and last-opened timestamps/);
});

test('library cards surface continue-reading state', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
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
});

test('library cards reveal source CHM files without a copy-path action', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

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
});

test('library cards warn when the saved CHM source file is missing', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

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
});

test('missing library sources can be relinked without deleting the entry', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'src', 'styles.css'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const preload = fs.readFileSync(path.join(projectRoot, 'src', 'preload.ts'), 'utf-8');
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

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
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(html, /id="library-search"[^>]+placeholder="搜索书名或路径"/);
  assert.match(html, /id="library-empty-filtered"/);
  assert.match(html, /id="clear-library-search"/);
  assert.match(html, /id="empty-search-guide"[^>]*>使用说明</);
  assert.match(renderer, /filterBooksByQuery/);
  assert.ok(renderer.includes("elements.librarySearch.addEventListener('input'"));
  assert.ok(renderer.includes('openExternalLink(onboardingLinks.readme)'));
});

test('library result count and empty-search updates are announced politely', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'src', 'index.html'), 'utf-8');

  assert.match(html, /<output class="toolbar-meta" id="library-count" aria-live="polite"><\/output>/);
  assert.match(html, /<div class="library-empty library-empty-filtered" id="library-empty-filtered" role="status" aria-live="polite" hidden>/);
});

test('selected collection is announced to assistive tech', () => {
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /const isSelected = selectedCollectionId === collection\.id/);
  assert.match(renderer, /item\.classList\.toggle\('active', isSelected\)/);
  assert.match(renderer, /select\.setAttribute\('aria-current', isSelected \? 'true' : 'false'\)/);
});

test('library layout preference persists between launches', () => {
  const renderer = fs.readFileSync(path.join(projectRoot, 'src', 'renderer.ts'), 'utf-8');

  assert.match(renderer, /const libraryLayoutStorageKey = 'chm-reader-library-layout'/);
  assert.match(renderer, /function loadLibraryLayoutPreference\(\): 'grid' \| 'list'/);
  assert.match(renderer, /window\.localStorage\.getItem\(libraryLayoutStorageKey\)/);
  assert.match(renderer, /saved === 'list' \|\| saved === 'grid'/);
  assert.match(renderer, /window\.localStorage\.setItem\(libraryLayoutStorageKey, layout\)/);
  assert.match(renderer, /setLibraryLayout\(loadLibraryLayoutPreference\(\)\)/);
});

test('selected library collection preference persists between launches', () => {
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
});

test('reader sidebar width preference persists between launches', () => {
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
});

test('reader sidebar visibility preference persists between launches', () => {
  const architecture = fs.readFileSync(path.join(projectRoot, 'docs', 'architecture.md'), 'utf-8');
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
  assert.match(architecture, /sidebar visibility/);
});

test('reader restores last-read topic per CHM', () => {
  const privacy = fs.readFileSync(path.join(projectRoot, 'docs', 'privacy.md'), 'utf-8');
  const architecture = fs.readFileSync(path.join(projectRoot, 'docs', 'architecture.md'), 'utf-8');
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
  assert.match(privacy, /last-read topic/);
  assert.match(architecture, /last-read topic/);
});

test('reader zoom preference persists between launches', () => {
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

test('help menu exposes a compact set of stable project links', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

  for (const label of [
    'GitHub Repository',
    'Star on GitHub',
    'Watch Releases',
    'GitHub Discussions',
    'Report or Request',
    'Support Guide',
    'Project README',
    'macOS Install Guide',
    'Privacy and Local Data',
    'Compatibility Notes',
    'Troubleshooting Guide',
    'Download Releases',
  ]) assert.match(main, new RegExp("label: '" + label + "'"));
  assert.doesNotMatch(main, /label: 'Feature Tour'|label: 'Roadmap'|label: 'Chinese Documentation'/);
  assert.ok(main.includes("star: 'https://github.com/zhongdiandaoda/chm-reader-light'"));
  assert.ok(main.includes('function buildShareText(): string'));
  assert.ok(main.includes('clipboard.writeText(buildShareText())'));
});

test('macOS About panel presents project metadata', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));

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
});

test('help menu can copy diagnostic details for bug reports', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const bugTemplate = fs.readFileSync(path.join(projectRoot, '.github', 'ISSUE_TEMPLATE', 'bug_report.yml'), 'utf-8');
  const troubleshooting = fs.readFileSync(path.join(projectRoot, 'docs', 'troubleshooting.md'), 'utf-8');

  assert.ok(main.includes('function buildDiagnosticInfo(): string'));
  assert.ok(main.includes('clipboard.writeText(buildDiagnosticInfo())'));
  assert.match(main, /label: 'Copy Diagnostic Info'/);
  assert.match(bugTemplate, /Help > Copy Diagnostic Info/);
  assert.match(troubleshooting, /Help > Copy Diagnostic Info/);
});

test('help menu can reveal the app data folder for troubleshooting', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const privacy = fs.readFileSync(path.join(projectRoot, 'docs', 'privacy.md'), 'utf-8');
  const troubleshooting = fs.readFileSync(path.join(projectRoot, 'docs', 'troubleshooting.md'), 'utf-8');

  assert.match(main, /async function revealAppDataFolder\(\): Promise<void>/);
  assert.match(main, /await fs\.promises\.mkdir\(app\.getPath\('userData'\), \{ recursive: true \}\)/);
  assert.match(main, /shell\.openPath\(app\.getPath\('userData'\)\)/);
  assert.match(main, /title: 'Unable to Open App Data Folder'/);
  assert.match(main, /label: 'Reveal App Data Folder'/);
  assert.match(main, /click: \(\) => revealAppDataFolder\(\)/);
  assert.match(privacy, /Help > Reveal App Data Folder/);
  assert.match(troubleshooting, /Help > Reveal App Data Folder/);
});

test('help menu can clear extracted cache without removing library metadata', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');
  const clearStart = main.indexOf('async function clearExtractedBookCache(');
  const clearEnd = main.indexOf('async function importBooks(', clearStart);
  const implementation = main.slice(clearStart, clearEnd);
  const privacy = fs.readFileSync(path.join(projectRoot, 'docs', 'privacy.md'), 'utf-8');
  const troubleshooting = fs.readFileSync(path.join(projectRoot, 'docs', 'troubleshooting.md'), 'utf-8');

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
});

test('macOS app integrates with the recent documents menu', () => {
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

  assert.match(main, /role: 'recentDocuments'/);
  assert.match(main, /role: 'clearRecentDocuments'/);
  assert.match(main, /app\.addRecentDocument\(chmPath\)/);
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

  assert.equal(packageJson.scripts['check:package:mac'], 'bash scripts/check-macos-package-env.sh arm64');
  assert.equal(packageJson.scripts['check:package:mac:arm64'], 'bash scripts/check-macos-package-env.sh arm64');
  assert.equal(packageJson.scripts['check:package:mac:x64'], undefined);
  assert.ok(
    packageScript.indexOf('check-macos-package-env.sh') < packageScript.indexOf('npm test'),
    'target-architecture preflight should run before the expensive test suite',
  );
  assert.match(packageScript, /vendor-chmlib-macos[.]sh/);
  assert.match(packageScript, /--ignore=/);
  assert.match(packageScript, /THIRD_PARTY_NOTICES/);
  assert.match(preflightScript, /clang codesign curl ditto install_name_tool lipo otool patch shasum swift tar/);
  assert.match(iconScript, /rasterize-svg[.]swift/);
  assert.match(iconScript, /1024 1024 100 185[.]4/);
  assert.doesNotMatch(iconScript, /sips[^\n]+\$source_svg/);
  assert.match(iconRasterizer, /import AppKit/);
  assert.match(iconRasterizer, /NSImage\(contentsOf:/);
  assert.match(iconRasterizer, /CommandLine[.]arguments[.]count == 3 \|\| CommandLine[.]arguments[.]count == 5 \|\| CommandLine[.]arguments[.]count == 7/);
  assert.match(iconRasterizer, /let parsedWidth = Double\(CommandLine[.]arguments\[3\]\)/);
  assert.match(iconRasterizer, /let parsedHeight = Double\(CommandLine[.]arguments\[4\]\)/);
  assert.match(iconRasterizer, /let parsedInset = Double\(CommandLine[.]arguments\[5\]\)/);
  assert.match(iconRasterizer, /let parsedCornerRadius = Double\(CommandLine[.]arguments\[6\]\)/);
  assert.match(iconRasterizer, /NSBezierPath\(roundedRect: artworkRect, xRadius: cornerRadius, yRadius: cornerRadius\)/);
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
  const securityModel = fs.readFileSync(path.join(projectRoot, 'docs', 'security-model.md'), 'utf-8');

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
  assert.match(securityModel, /`ELECTRON_RUN_AS_NODE`, `NODE_OPTIONS`, and command-line debugging entry points are disabled/);
  assert.match(securityModel, /OnlyLoadAppFromAsar/);
  assert.match(securityModel, /Embedded ASAR integrity validation is enabled/);
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
  const releaseDoc = fs.readFileSync(path.join(projectRoot, 'docs', 'release.md'), 'utf-8');

  const upstreamCommit = '2bef8d063ec7d88a8de6fd9f0513ea42ac0fa21f';
  const archiveSha256 = 'c6a6e0cc46d0597045e82972347f95744bb2da6c1db7afc6db303051b37b1ca7';
  const referenceFix = '08179946a745cf1605e4b9670942ec1a6e1f4c5d';

  assert.equal(packageJson.scripts['build:chmlib:mac:arm64'], 'bash scripts/build-chmlib-macos.sh arm64');
  assert.equal(packageJson.scripts['build:chmlib:mac:x64'], undefined);
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
  assert.ok(releaseWorkflow.includes('npm run package:release:mac:arm64'));
  assert.doesNotMatch(workflowChecker, /release CHMLib install step/);
  assert.match(workflowChecker, /pinned patched CHMLib build/);
  assert.match(thirdPartyNotice, /CHMLib/);
  assert.match(thirdPartyNotice, /LGPL-2[.]1-or-later/);
  assert.match(thirdPartyNotice, new RegExp(upstreamCommit));
  assert.match(thirdPartyNotice, /CVE-2025-48172/);
  assert.match(securityModel, /CVE-2025-48172/);
  assert.match(releaseDoc, /CHMLIB-PROVENANCE[.]txt/);
});

test('macOS package declares CHM document association', () => {
  const packageScript = fs.readFileSync(path.join(projectRoot, 'scripts', 'package-macos.sh'), 'utf-8');
  const infoPlist = fs.readFileSync(path.join(projectRoot, 'resources', 'macos', 'Info.plist'), 'utf-8');
  const main = fs.readFileSync(path.join(projectRoot, 'src', 'main.ts'), 'utf-8');

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
});

test('public launch handoff keeps source, repository settings, and release authority separate', () => {
  const handoff = fs.readFileSync(path.join(projectRoot, 'docs', 'public-launch-handoff.md'), 'utf-8');
  const gitignore = fs.readFileSync(path.join(projectRoot, '.gitignore'), 'utf-8');

  assert.match(handoff, /# Public Launch Handoff/);
  assert.match(handoff, /## 1\. Review and merge source changes to `main`/);
  assert.match(handoff, /## 2\. Apply repository About, topics, and Discussions settings/);
  assert.match(handoff, /## 3\. Build and publish the first Apple Silicon Release/);
  assert.match(handoff, /## 4\. Promote only after live verification/);
  assert.match(handoff, /`npm test`/);
  assert.match(handoff, /`npm run check`/);
  assert.match(handoff, /`npm run doctor`/);
  assert.match(handoff, /`npm run check:remote-listing`/);
  assert.match(handoff, /`npm run check:remote-release`/);
  assert.match(handoff, /`npm run snapshot:growth`/);
  assert.match(handoff, /`macos-15`/);
  assert.match(handoff, /Do not use `git add \.`/);
  assert.match(handoff, /`CHMReaderLight-mac-arm64\.zip`/);
  assert.match(handoff, /`Report`/);
  assert.match(handoff, /No commit, push, tag, Release, issue, or repository-setting mutation/);
  assert.match(gitignore, /^\/CHMReaderLight-mac-\*\.zip(?:\.sha256)?$/m);
  assert.match(gitignore, /^\/CHMReaderLight-mac-\*\.zip\.sha256$/m);
  assert.match(gitignore, /^\/Report$/m);
});

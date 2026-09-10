#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks GitHub Actions workflow trust settings for CI and release reliability.
const rootDir = path.resolve(__dirname, '..');

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf-8');
}

function requireIncludes(content, expectedText, description, errors) {
  if (!content.includes(expectedText)) {
    errors.push(`Missing ${description}: ${expectedText}`);
  }
}

function requirePattern(content, pattern, description, errors) {
  if (!pattern.test(content)) {
    errors.push(`Missing ${description}: ${pattern}`);
  }
}

function verifyWorkflowTrustSettings() {
  const ciWorkflow = readText(path.join('.github', 'workflows', 'ci.yml'));
  const codeqlWorkflow = readText(path.join('.github', 'workflows', 'codeql.yml'));
  const dependencyReviewWorkflow = readText(path.join('.github', 'workflows', 'dependency-review.yml'));
  const releaseWorkflow = readText(path.join('.github', 'workflows', 'release.yml'));
  const scorecardWorkflow = readText(path.join('.github', 'workflows', 'scorecard.yml'));
  const releaseConfig = readText(path.join('.github', 'release.yml'));
  const releasePublisher = readText(path.join('scripts', 'publish-release.js'));
  const releaseVerifier = readText(path.join('scripts', 'check-live-release.js'));
  const errors = [];
  const workflows = {
    'ci.yml': ciWorkflow,
    'codeql.yml': codeqlWorkflow,
    'dependency-review.yml': dependencyReviewWorkflow,
    'release.yml': releaseWorkflow,
    'scorecard.yml': scorecardWorkflow,
  };
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
    .filter((step) => step.includes('uses: actions/checkout@'));
  if (releaseCheckoutSteps.length !== 4) {
    errors.push('Release workflow must contain exactly four checkout steps.');
  }

  for (const [workflowName, workflow] of Object.entries(workflows)) {
    for (const match of workflow.matchAll(/^\s*uses:\s*([^\s#]+)(?:\s+#.*)?$/gm)) {
      if (!/@[a-f0-9]{40}$/.test(match[1])) {
        errors.push(`Unpinned action in ${workflowName}: ${match[1]}`);
      }
    }
  }
  for (const checkoutStep of releaseCheckoutSteps) {
    if (!checkoutStep.includes('persist-credentials: false')) {
      errors.push('Release checkout steps must not persist the GitHub token in git configuration.');
    }
  }

  requirePattern(ciWorkflow, /^permissions:\n  contents: read$/m, 'read-only CI permissions', errors);
  requireIncludes(ciWorkflow, 'cancel-in-progress: true', 'CI cancellation for superseded runs', errors);
  requirePattern(ciWorkflow, /actions\/setup-node@[a-f0-9]{40} # v4/, 'pinned CI setup-node action', errors);
  requireIncludes(ciWorkflow, "node-version: '22'", 'CI Node.js 22 setup', errors);
  requireIncludes(ciWorkflow, 'cache: npm', 'CI npm dependency cache', errors);
  requireIncludes(ciWorkflow, 'run: npm test', 'CI test step', errors);
  requireIncludes(ciWorkflow, 'run: npm run check:audit', 'CI audit step', errors);
  requireIncludes(ciWorkflow, 'run: npm run check', 'CI default quality gate', errors);
  requireIncludes(ciWorkflow, 'timeout-minutes: 15', 'CI job timeout', errors);

  requirePattern(codeqlWorkflow, /^permissions:\n  security-events: write\n  contents: read$/m, 'CodeQL least-privilege permissions', errors);
  requirePattern(codeqlWorkflow, /github\/codeql-action\/init@[a-f0-9]{40} # v4/, 'pinned CodeQL init action', errors);
  requireIncludes(codeqlWorkflow, 'languages: javascript-typescript', 'CodeQL JavaScript and TypeScript language setting', errors);
  requirePattern(codeqlWorkflow, /github\/codeql-action\/analyze@[a-f0-9]{40} # v4/, 'pinned CodeQL analyze action', errors);
  requireIncludes(codeqlWorkflow, 'timeout-minutes: 20', 'CodeQL job timeout', errors);

  requirePattern(dependencyReviewWorkflow, /^permissions:\n  contents: read\n  pull-requests: write$/m, 'Dependency Review permissions', errors);
  requirePattern(dependencyReviewWorkflow, /actions\/dependency-review-action@[a-f0-9]{40} # v4[.]/, 'pinned Dependency Review action', errors);
  requireIncludes(dependencyReviewWorkflow, 'fail-on-severity: moderate', 'Dependency Review severity gate', errors);
  requireIncludes(dependencyReviewWorkflow, 'comment-summary-in-pr: always', 'Dependency Review PR summary', errors);
  requireIncludes(dependencyReviewWorkflow, 'timeout-minutes: 10', 'Dependency Review job timeout', errors);

  requirePattern(scorecardWorkflow, /^permissions: read-all$/m, 'read-only default OpenSSF Scorecard permissions', errors);
  requirePattern(
    scorecardWorkflow,
    /scorecard:\n    name: Scorecard(?:.|\n)*?permissions:\n      security-events: write\n      id-token: write\n      contents: read/,
    'job-scoped OpenSSF Scorecard publishing permissions',
    errors,
  );
  requireIncludes(scorecardWorkflow, 'persist-credentials: false', 'Scorecard restricted checkout credentials', errors);
  requirePattern(scorecardWorkflow, /ossf\/scorecard-action@[a-f0-9]{40} # v2[.]4[.]2/, 'pinned OpenSSF Scorecard action', errors);
  requireIncludes(scorecardWorkflow, 'results_format: sarif', 'Scorecard SARIF output', errors);
  requireIncludes(scorecardWorkflow, 'publish_results: true', 'Scorecard published results', errors);
  requirePattern(scorecardWorkflow, /github\/codeql-action\/upload-sarif@[a-f0-9]{40} # v4/, 'pinned Scorecard SARIF upload', errors);
  requireIncludes(scorecardWorkflow, 'timeout-minutes: 20', 'Scorecard job timeout', errors);

  requirePattern(releaseWorkflow, /^permissions:\n  contents: read$/m, 'read-only default release permissions', errors);
  requirePattern(
    releaseWorkflow,
    /macos:\n    name: macOS arm64\n    needs: validate_release\n    runs-on: macos-15\n    timeout-minutes: 45\n    permissions:\n      contents: read/,
    'read-only release build permissions',
    errors,
  );
  requirePattern(
    releaseWorkflow,
    /verify_published:\n    name: Verify published GitHub Release\n    needs: \[validate_release, publish\]\n    runs-on: ubuntu-latest(?:.|\n)*?permissions:\n      contents: read/,
    'read-only post-publish verification job',
    errors,
  );
  if (publishJob.includes('npm run check:remote-release')) {
    errors.push('Release publication job must delegate remote verification to a read-only job.');
  }
  if (/npm run/.test(publishJob)) {
    errors.push('Privileged release publication job must invoke Node helpers directly without npm lifecycle hooks.');
  }
  for (const permission of ['attestations: write', 'artifact-metadata: write', 'id-token: write']) {
    if (macosJob.includes(permission)) {
      errors.push(`Release macOS build job must not receive ${permission}.`);
    }
  }
  if (attestJob.includes('artifact-metadata: write')) {
    errors.push('Release attestation job must not receive artifact-metadata: write unless it pushes an OCI subject to a registry.');
  }
  requirePattern(
    releaseWorkflow,
    /attest:\n    name: Attest release artifacts\n    needs: macos\n    runs-on: ubuntu-latest(?:.|\n)*?permissions:\n      contents: read\n      attestations: write\n      id-token: write/,
    'isolated release attestation permissions',
    errors,
  );
  if (/^\s*run:/m.test(attestJob) || attestJob.includes('actions/checkout') || attestJob.includes('actions/setup-node')) {
    errors.push('Privileged release attestation job must not execute repository code or install dependencies.');
  }
  requirePattern(
    releaseWorkflow,
    /prepare_publish:\n    name: Prepare GitHub Release publication\n    needs: \[validate_release, macos, attest\]\n    if: startsWith\(github\.ref, 'refs\/tags\/v'\) \|\| \(github\.event_name == 'workflow_dispatch' && inputs\.publish_release == true\)(?:.|\n)*?permissions:\n      contents: read/,
    'read-only release publication preparation job',
    errors,
  );
  requireIncludes(preparePublishJob, 'node scripts/check-release-artifacts.js dist/release', 'read-only release artifact preflight', errors);
  if (preparePublishJob.includes('cache: npm')) {
    errors.push('Release publication preparation job must not restore an unused npm cache.');
  }
  requireIncludes(
    preparePublishJob,
    'artifact_id: ${{ steps.publish_input.outputs.artifact-id }}',
    'exact prepared release artifact identifier output',
    errors,
  );
  requirePattern(
    preparePublishJob,
    /name: Upload minimal release publication input\n        id: publish_input(?:.|\n)*?name: release-publish-input\n          path: \|\n            package[.]json\n            docs\/release-template[.]md\n            scripts\/check-release-artifacts[.]js\n            scripts\/publish-release[.]js\n            dist\/release\/CHMReaderLight-mac-arm64[.]zip\n            dist\/release\/CHMReaderLight-mac-arm64[.]zip[.]sha256\n          if-no-files-found: error\n          retention-days: 1\n          compression-level: 0/,
    'allowlisted minimal release publication input artifact',
    errors,
  );
  requirePattern(
    releaseWorkflow,
    /publish:\n    name: Publish GitHub Release\n    needs: \[validate_release, prepare_publish\]\n    if: startsWith\(github\.ref, 'refs\/tags\/v'\) \|\| \(github\.event_name == 'workflow_dispatch' && inputs\.publish_release == true\)(?:.|\n)*?permissions:\n      contents: write/,
    'explicit tag or confirmed manual aggregate release publish job',
    errors,
  );
  if (publishJob.includes('actions/checkout')) {
    errors.push('Privileged release publication job must not checkout the repository.');
  }
  if (publishJob.includes('node scripts/check-release-artifacts')) {
    errors.push('Privileged release publication job must delegate artifact preflight to the read-only preparation job.');
  }
  if (publishJob.includes('cache: npm')) {
    errors.push('Privileged release publication job must not restore the npm cache.');
  }
  requirePattern(
    publishJob,
    /uses: actions\/setup-node@[a-f0-9]{40} # v4\n        with:\n          node-version: '22'/,
    'pinned Node.js runtime in the privileged release publication job',
    errors,
  );
  requirePattern(
    publishJob,
    /uses: actions\/download-artifact@[a-f0-9]{40} # v4\n        with:\n          artifact-ids: \$\{\{ needs\.prepare_publish\.outputs\.artifact_id \}\}\n          path: dist\/publish\n          merge-multiple: true/,
    'exact-ID-bound immutable release publication input download',
    errors,
  );
  requireIncludes(publishJob, 'working-directory: dist/publish', 'isolated release publisher working directory', errors);
  const publishStepCount = (publishJob.match(/^      - /gm) || []).length;
  if (publishStepCount !== 3) {
    errors.push('Privileged release publication job must contain exactly three steps.');
  }
  const publishRunStepCount = (publishJob.match(/^        run:/gm) || []).length;
  if (publishRunStepCount !== 1) {
    errors.push('Privileged release publication job must contain exactly one run step.');
  }
  if ((publishJob.match(/GITHUB_TOKEN:/g) || []).length !== 1) {
    errors.push('Privileged release publication job must explicitly inject GITHUB_TOKEN exactly once.');
  }
  requireIncludes(
    publishJob,
    'node scripts/publish-release.js --release-dir dist/release --tag "$RELEASE_TAG" --target-commitish "$GITHUB_SHA" --confirm',
    'sole privileged release publisher invocation',
    errors,
  );
  requirePattern(
    releaseWorkflow,
    /publish_release:\n        description: .+\n        required: true\n        type: boolean\n        default: false/,
    'safe opt-in manual release publishing input',
    errors,
  );
  requirePattern(
    releaseWorkflow,
    /release_tag:\n        description: .+vMAJOR\.MINOR\.PATCH.+\n        required: false\n        type: string/,
    'manual semantic release tag input',
    errors,
  );
  requirePattern(
    releaseWorkflow,
    /concurrency:\n  group: release-\$\{\{ inputs\.release_tag \|\| github\.ref_name \}\}\n  cancel-in-progress: false/,
    'non-canceling per-release concurrency guard',
    errors,
  );
  requirePattern(
    releaseWorkflow,
    /validate_release:\n    name: Validate release request(?:.|\n)*?outputs:\n      release_tag: \$\{\{ steps\.release_tag\.outputs\.tag \}\}(?:.|\n)*?macos:\n    name: macOS arm64\n    needs: validate_release/,
    'release request validation before macOS builds',
    errors,
  );
  requirePattern(releaseWorkflow, /actions\/setup-node@[a-f0-9]{40} # v4/, 'pinned release setup-node action', errors);
  requireIncludes(releaseWorkflow, "node-version: '22'", 'release Node.js 22 setup', errors);
  requireIncludes(releaseWorkflow, 'cache: npm', 'release npm dependency cache', errors);
  requireIncludes(releaseWorkflow, 'timeout-minutes: 45', 'release job timeout', errors);
  requireIncludes(
    releaseWorkflow,
    'npm run package:release:mac:arm64',
    'pinned patched CHMLib build through the release package command',
    errors,
  );
  if (releaseWorkflow.includes('brew install chmlib')) {
    errors.push('Release workflow must build the pinned patched CHMLib source instead of installing Homebrew CHMLib.');
  }
  requireIncludes(releaseWorkflow, 'npm run package:release:mac:arm64', 'Apple Silicon release artifact command', errors);
  requirePattern(releaseWorkflow, /actions\/attest@[a-f0-9]{40} # v4/, 'pinned release artifact attestation action', errors);
  requirePattern(
    releaseWorkflow,
    /attest:(?:.|\n)*?subject-path: \|\n\s+dist\/attest\/CHMReaderLight-mac-arm64[.]zip\n\s+dist\/attest\/CHMReaderLight-mac-arm64[.]zip[.]sha256/,
    'complete isolated release artifact attestation subjects',
    errors,
  );
  if (releaseWorkflow.includes('actions/attest-build-provenance')) {
    errors.push('Release workflow must use the current unified actions/attest action.');
  }
  requirePattern(releaseWorkflow, /actions\/download-artifact@[a-f0-9]{40} # v4/, 'pinned aggregate release artifact download action', errors);
  requireIncludes(releaseWorkflow, 'merge-multiple: true', 'aggregate release artifact merge', errors);
  requireIncludes(releaseWorkflow, 'node scripts/check-release-artifacts.js dist/release', 'complete release artifact verification', errors);
  requireIncludes(releaseWorkflow, 'name: Resolve and validate release tag', 'release tag validation step', errors);
  requireIncludes(releaseWorkflow, '^v[0-9]+\\.[0-9]+\\.[0-9]+$', 'strict semantic release tag validation', errors);
  requireIncludes(releaseWorkflow, `package_version=$(node -p "require('./package.json').version")`, 'package version lookup before release builds', errors);
  requireIncludes(releaseWorkflow, 'does not match package version', 'release tag and package version consistency check', errors);
  requireIncludes(releaseWorkflow, 'fetch-depth: 0', 'release tag history checkout', errors);
  requireIncludes(releaseWorkflow, 'git rev-list -n 1 "$release_tag"', 'existing release tag commit validation', errors);
  requireIncludes(releaseWorkflow, 'does not point to selected commit', 'mismatched release tag rejection', errors);
  requireIncludes(releaseWorkflow, 'RELEASE_TAG: ${{ needs.validate_release.outputs.release_tag }}', 'validated release tag environment variable', errors);
  requireIncludes(releaseWorkflow, 'GITHUB_TOKEN: ${{ github.token }}', 'authenticated GitHub Release publication', errors);
  requireIncludes(
    releaseWorkflow,
    'node scripts/publish-release.js --release-dir dist/release --tag "$RELEASE_TAG" --target-commitish "$GITHUB_SHA" --confirm',
    'draft-first exact-commit GitHub Release publication',
    errors,
  );
  requirePattern(
    releaseWorkflow,
    /publish:(?:.|\n)*?timeout-minutes: (?:1[1-9]|[2-9][0-9])/,
    'release publish timeout above the per-asset upload timeout',
    errors,
  );
  requireIncludes(verifyPublishedJob, 'name: Verify published GitHub Release', 'post-publish release verification step', errors);
  requireIncludes(
    verifyPublishedJob,
    'node scripts/check-live-release.js --tag "$RELEASE_TAG" --target-commitish "$GITHUB_SHA" --release-dir dist/release',
    'tag-specific post-publish release, commit, and asset digest verification',
    errors,
  );
  if (releaseWorkflow.includes('softprops/action-gh-release')) {
    errors.push('Release workflow must not bypass the draft-first publisher with softprops/action-gh-release.');
  }
  if ((releaseWorkflow.match(/node scripts\/publish-release[.]js/g) || []).length !== 1) {
    errors.push('Release workflow must invoke the aggregate draft-first publisher exactly once.');
  }
  if (releaseWorkflow.indexOf('node scripts/check-release-artifacts.js dist/release')
      >= releaseWorkflow.indexOf('node scripts/publish-release.js')) {
    errors.push('Release workflow must verify the complete artifact set before creating the draft Release.');
  }
  if (releaseWorkflow.indexOf('node scripts/publish-release.js')
      >= releaseWorkflow.indexOf('node scripts/check-live-release.js --tag "$RELEASE_TAG" --target-commitish "$GITHUB_SHA" --release-dir dist/release')) {
    errors.push('Release workflow must perform tag-specific verification after publishing.');
  }
  requireIncludes(
    releasePublisher,
    'resolveRemoteTagCommit(plan.repositorySlug, plan.tag, sendJson)',
    'existing remote tag commit provenance verification',
    errors,
  );
  requireIncludes(
    releasePublisher,
    'body: { ref: `refs/tags/${tag}`, sha: expectedCommit }',
    'missing remote tag creation at the exact build commit',
    errors,
  );
  requireIncludes(
    releasePublisher,
    'GitHub asset digest mismatch',
    'server-side upload digest verification before publishing',
    errors,
  );
  requireIncludes(
    releasePublisher,
    'verifyRemoteReleaseAssetSnapshots(remoteDraft, plan.assets, plan.assetSnapshots)',
    'complete server-side draft asset verification before publishing',
    errors,
  );
  requireIncludes(
    releaseVerifier,
    'snapshotExpectedLiveReleaseAssets(releaseDir)',
    'post-publish local asset snapshot verification',
    errors,
  );
  requireIncludes(
    releaseVerifier,
    'Release asset digest mismatch',
    'post-publish remote asset digest verification',
    errors,
  );
  requireIncludes(
    releasePublisher,
    'Existing tag ${plan.tag} resolves to ${remoteTagCommit}, not ${plan.targetCommitish}.',
    'mismatched remote tag rejection',
    errors,
  );
  requireIncludes(releaseWorkflow, 'CHMReaderLight-mac-arm64', 'Apple Silicon release artifact name', errors);
  if (/x64|macos-15-intel|matrix[.]arch/i.test(releaseWorkflow)) {
    errors.push('Release workflow must target Apple Silicon only.');
  }

  for (const title of [
    'New Features',
    'Bug Fixes',
    'CHM Compatibility',
    'Performance',
    'Accessibility',
    'Community',
    'Documentation',
    'Maintenance',
    'Other Changes',
  ]) {
    requireIncludes(releaseConfig, `title: ${title}`, `release notes ${title} category`, errors);
  }

  return errors;
}

function main() {
  const errors = verifyWorkflowTrustSettings();

  if (errors.length > 0) {
    console.error('Workflow trust check failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Workflow trust check passed.');
}

if (require.main === module) {
  main();
}

module.exports = {
  verifyWorkflowTrustSettings,
};

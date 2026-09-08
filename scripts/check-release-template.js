#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { buildReleaseBody, extractReleaseBodyTemplate } = require('./publish-release');

// Keeps the public GitHub Release body aligned with the workflow artifact contract.
const rootDir = path.resolve(__dirname, '..');
const repositorySlug = 'zhongdiandaoda/chm-reader-light';

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf-8');
}

function extractReleaseArtifactNames(releaseWorkflow) {
  const artifactNames = [];
  const artifactPattern = /^\s+artifact-name:\s*(\S+)$/gm;
  let match;

  while ((match = artifactPattern.exec(releaseWorkflow)) !== null) {
    artifactNames.push(match[1]);
  }

  return artifactNames.sort();
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

function verifyReleaseTemplate() {
  const packageJson = JSON.parse(readText('package.json'));
  const releaseWorkflow = readText('.github/workflows/release.yml');
  const releaseTemplate = readText('docs/release-template.md');
  const releaseGuide = readText('docs/release.md');
  const installGuide = readText('docs/install-macos.md');
  const growthGuide = readText('docs/growth-readiness.md');
  const readme = readText('README.md');
  const englishReadme = readText('README.en.md');
  const releaseArtifactChecker = readText('scripts/check-release-artifacts.js');
  const releaseArtifactStager = readText('scripts/stage-release-artifacts.js');
  const releaseBodyPreparer = readText('scripts/prepare-release-body.js');
  const releasePublisher = readText('scripts/publish-release.js');
  const errors = [];
  const artifactNames = extractReleaseArtifactNames(releaseWorkflow);
  let renderedReleaseBody = '';

  try {
    renderedReleaseBody = buildReleaseBody({
      releaseTemplate: extractReleaseBodyTemplate(releaseTemplate),
      tag: 'v0.0.0-test',
    });
  } catch (error) {
    errors.push(`Release template could not be rendered: ${error.message}`);
  }

  if (packageJson.scripts['publish:release'] !== 'node scripts/publish-release.js') {
    errors.push('package.json is missing publish:release script.');
  }
  if (packageJson.scripts['prepare:release-body'] !== 'node scripts/prepare-release-body.js') {
    errors.push('package.json is missing prepare:release-body script.');
  }
  if (packageJson.scripts['stage:release-artifacts'] !== 'node scripts/stage-release-artifacts.js') {
    errors.push('package.json is missing stage:release-artifacts script.');
  }

  if (artifactNames.length === 0) {
    errors.push('No release workflow artifact names found.');
  }

  for (const artifactName of artifactNames) {
    const zipName = `${artifactName}.zip`;
    const checksumName = `${zipName}.sha256`;
    const attestationCommand = `gh attestation verify ${zipName} --repo ${repositorySlug}`;
    const downloadBaseUrl = `https://github.com/${repositorySlug}/releases/download/v0.0.0-test`;

    requireIncludes(releaseTemplate, zipName, 'release template artifact', errors);
    requireIncludes(releaseTemplate, checksumName, 'release template checksum file', errors);
    requireIncludes(releaseTemplate, `shasum -a 256 -c ${checksumName}`, 'release template checksum command', errors);
    requireIncludes(releaseTemplate, attestationCommand, 'release template attestation command', errors);
    requireIncludes(
      renderedReleaseBody,
      `[${zipName}](${downloadBaseUrl}/${zipName})`,
      'rendered tag-specific artifact download link',
      errors,
    );
    requireIncludes(
      renderedReleaseBody,
      `[${checksumName}](${downloadBaseUrl}/${checksumName})`,
      'rendered tag-specific checksum download link',
      errors,
    );
    requireIncludes(readme, zipName, 'README artifact guidance', errors);
    requireIncludes(readme, checksumName, 'README checksum guidance', errors);
    requireIncludes(englishReadme, zipName, 'English README artifact guidance', errors);
    requireIncludes(englishReadme, checksumName, 'English README checksum guidance', errors);
    requireIncludes(
      installGuide,
      'https://github.com/' + repositorySlug + '/releases/latest/download/' + zipName,
      'install guide latest artifact download link',
      errors,
    );
    requireIncludes(
      installGuide,
      'https://github.com/' + repositorySlug + '/releases/latest/download/' + checksumName,
      'install guide latest checksum download link',
      errors,
    );
    requireIncludes(releaseArtifactChecker, `'${zipName}'`, 'check-release-artifacts expected artifact', errors);
  }

  requirePattern(
    releaseWorkflow,
    /actions\/attest@[a-f0-9]{40} # v4/,
    'pinned release workflow attestation action',
    errors,
  );
  requireIncludes(releaseWorkflow, '${{ matrix.artifact-name }}.zip.sha256', 'release workflow checksum files', errors);
  requireIncludes(
    releaseWorkflow,
    'node scripts/publish-release.js --release-dir dist/release --tag "$RELEASE_TAG" --target-commitish "$GITHUB_SHA" --confirm',
    'release workflow direct draft-first publish command',
    errors,
  );
  if ((releaseWorkflow.match(/node scripts\/publish-release[.]js/g) || []).length !== 1) {
    errors.push('Release workflow must invoke the direct draft-first publisher exactly once.');
  }
  requireIncludes(releasePublisher, 'extractReleaseBodyTemplate', 'release publisher curated body template wiring', errors);
  requireIncludes(releasePublisher, 'buildReleaseBody', 'release publisher curated body rendering', errors);
  requireIncludes(releasePublisher, 'generate_release_notes: true', 'release publisher generated notes request', errors);
  requireIncludes(releaseTemplate, 'not Apple-notarized yet', 'release template notarization caveat', errors);
  requireIncludes(renderedReleaseBody, '## Verify the Download', 'rendered checksum section', errors);
  requireIncludes(renderedReleaseBody, '## First Launch Note', 'rendered first-launch section', errors);
  requireIncludes(renderedReleaseBody, '## What to Try', 'rendered trial section', errors);
  if (/v<version>|\]\(\.\//.test(renderedReleaseBody)) {
    errors.push('Rendered release body still contains a version placeholder or relative documentation link.');
  }
  if (/List benchmark-backed|List keyboard, VoiceOver/.test(renderedReleaseBody)) {
    errors.push('Rendered release body still contains optional-section editing instructions.');
  }
  requireIncludes(readme, '尚未完成 Apple notarization', 'README notarization caveat', errors);
  requireIncludes(englishReadme, 'not Apple-notarized', 'English README notarization caveat', errors);
  requireIncludes(releaseTemplate, 'check:release-artifacts', 'release artifact verification command reference', errors);
  requireIncludes(releaseTemplate, 'npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>', 'release template artifact staging command', errors);
  requireIncludes(releaseGuide, 'npm run stage:release-artifacts -- --input-dir <actions-artifacts-dir>', 'release guide artifact staging command', errors);
  requireIncludes(releaseTemplate, 'npm run publish:release -- --release-dir <release-dir>', 'release template publish dry-run command', errors);
  requireIncludes(releaseGuide, 'npm run publish:release -- --release-dir <release-dir>', 'release guide publish dry-run command', errors);
  requireIncludes(
    growthGuide,
    'GITHUB_TOKEN=repo_contents_token npm run publish:release -- --release-dir <release-dir> --target-commitish <40-character-build-commit-sha> --confirm',
    'growth guide confirmed release publish command',
    errors,
  );
  requireIncludes(releaseArtifactStager, 'Stages downloaded GitHub Actions artifacts into the flat directory expected by release checks', 'stage-release-artifacts safety comment', errors);
  requireIncludes(releaseArtifactStager, 'verifyReleaseArtifacts', 'stage-release-artifacts verification wiring', errors);
  requireIncludes(releasePublisher, 'Publishes a GitHub Release only when explicitly confirmed', 'publish-release safety comment', errors);
  requireIncludes(releasePublisher, 'verifyReleaseArtifacts', 'publish-release artifact verification wiring', errors);
  requireIncludes(releaseBodyPreparer, 'extractReleaseBodyTemplate', 'prepare-release-body template extraction wiring', errors);
  requireIncludes(releaseBodyPreparer, 'buildReleaseBody', 'prepare-release-body rendering wiring', errors);
  requireIncludes(
    releaseTemplate,
    'Help > Copy Share Text',
    'release template share text CTA',
    errors,
  );
  requireIncludes(
    releaseTemplate,
    'share a ready-made summary with release, star, feedback, and showcase links',
    'release template share text value',
    errors,
  );
  requireIncludes(
    releaseTemplate,
    'https://github.com/zhongdiandaoda/chm-reader-light/discussions/new?category=release-feedback',
    'release feedback Discussion CTA',
    errors,
  );

  return errors;
}

function main() {
  const errors = verifyReleaseTemplate();

  if (errors.length > 0) {
    console.error('Release template check failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Release template check passed.');
}

if (require.main === module) {
  main();
}

module.exports = {
  extractReleaseArtifactNames,
  verifyReleaseTemplate,
};

#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const {
  parseRepositorySlug,
} = require('./check-live-repository-listing');

const {
  formatLocalIsoDate,
} = require('./snapshot-growth-metrics');

// Prepares copy-ready release or social sharing text from docs/share-kit.md.
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const shareKitPath = path.join(rootDir, 'docs', 'share-kit.md');

function parseArgs(argv) {
  const options = {
    audience: '<audience>',
    baselineFile: undefined,
    channel: '<channel name>',
    variant: 'social',
  };

  function readOptionValue(index, flagName) {
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`${flagName} requires a value.`);
    }
    return value;
  }

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--audience') {
      options.audience = readOptionValue(index, '--audience');
      index += 1;
    } else if (arg.startsWith('--audience=')) {
      options.audience = arg.slice('--audience='.length);
    } else if (arg === '--baseline-file') {
      options.baselineFile = readOptionValue(index, '--baseline-file');
      index += 1;
    } else if (arg.startsWith('--baseline-file=')) {
      options.baselineFile = arg.slice('--baseline-file='.length);
    } else if (arg === '--channel') {
      options.channel = readOptionValue(index, '--channel');
      index += 1;
    } else if (arg.startsWith('--channel=')) {
      options.channel = arg.slice('--channel='.length);
    } else if (arg === '--variant') {
      options.variant = readOptionValue(index, '--variant');
      index += 1;
    } else if (arg.startsWith('--variant=')) {
      options.variant = arg.slice('--variant='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.audience) {
    throw new Error('--audience requires a value.');
  }
  if (options.baselineFile !== undefined && !options.baselineFile) {
    throw new Error('--baseline-file requires a file path.');
  }
  if (!options.channel) {
    throw new Error('--channel requires a value.');
  }
  if (!['social', 'release'].includes(options.variant)) {
    throw new Error('--variant must be social or release.');
  }

  return options;
}

function extractSection(markdown, heading) {
  const headingIndex = markdown.indexOf(heading);
  if (headingIndex === -1) {
    throw new Error(`Could not find ${heading} in docs/share-kit.md.`);
  }

  const afterHeading = markdown.slice(headingIndex + heading.length);
  const nextHeadingIndex = afterHeading.search(/\n##\s+/);
  return (nextHeadingIndex === -1 ? afterHeading : afterHeading.slice(0, nextHeadingIndex)).trim();
}

function extractTextBlock(section, label) {
  const match = section.match(/```text\n([\s\S]*?)\n```/);
  if (!match) {
    throw new Error(`Could not find a text block for ${label} in docs/share-kit.md.`);
  }

  return match[1].trim();
}

function extractShareKitCopy(markdown) {
  return {
    shortDescription: extractSection(markdown, '## Short Description'),
    longDescription: extractSection(markdown, '## Longer Project Copy'),
    releaseAnnouncement: extractTextBlock(extractSection(markdown, '## Release Announcement Template'), 'Release Announcement Template'),
    socialPost: extractTextBlock(extractSection(markdown, '## Social Post Template'), 'Social Post Template'),
  };
}

function fillReleaseAnnouncement(template, version) {
  return template
    .replaceAll('<version>', version)
    .replace(
      '- <user-facing feature or fix>',
      '- Library-first CHM management for local manuals and SDK docs.',
    )
    .replace(
      '- <compatibility, search, library, security, or packaging improvement>',
      '- Searchable table of contents, body search, reader preferences, and local-only document handling.',
    )
    .replace(
      '- <known limitation or upgrade note, if relevant>',
      '- Current release builds are not Apple-notarized yet; see docs/signing-notarization.md before wider promotion.',
    );
}

function parseGrowthSnapshot(snapshotText) {
  function readField(name) {
    const prefix = `${name}: `;
    return snapshotText.split('\n').find((line) => line.startsWith(prefix))?.slice(prefix.length).trim();
  }

  return {
    date: readField('Date'),
    release: readField('Release'),
    trackerBaseline: readField('Tracker baseline'),
  };
}

function buildTrackerNote({ baseline, channel, variant, today }) {
  const date = baseline.date || formatLocalIsoDate(today);
  const metrics = baseline.trackerBaseline || '<stars> stars / <downloads> downloads / <watchers> watchers';
  return `${date}: prepared ${variant} share draft for ${channel} with baseline ${metrics}`;
}

function buildSharePostDraft({
  shareKit,
  packageJson,
  baselineText,
  options,
  today = new Date(),
}) {
  const repositorySlug = parseRepositorySlug(packageJson);
  if (!repositorySlug) {
    throw new Error('Could not parse a GitHub repository slug from package.json.');
  }

  const copy = extractShareKitCopy(shareKit);
  const baseline = baselineText ? parseGrowthSnapshot(baselineText) : {};
  const version = baseline.release && baseline.release !== 'no public release'
    ? baseline.release
    : `v${packageJson.version}`;
  const postText = options.variant === 'release'
    ? fillReleaseAnnouncement(copy.releaseAnnouncement, version)
    : copy.socialPost;

  return {
    repositorySlug,
    channel: options.channel,
    audience: options.audience,
    variant: options.variant,
    version,
    baseline,
    postText,
    trackerNote: buildTrackerNote({
      baseline,
      channel: options.channel,
      variant: options.variant,
      today,
    }),
  };
}

function formatSharePostDraft(plan) {
  return [
    'Share post draft',
    `Repository: ${plan.repositorySlug}`,
    `Channel: ${plan.channel}`,
    `Audience: ${plan.audience}`,
    `Variant: ${plan.variant}`,
    `Version: ${plan.version}`,
    `Baseline: ${plan.baseline.trackerBaseline || '<capture with npm run snapshot:growth>'}`,
    '',
    'Copyable post:',
    plan.postText,
    '',
    'Tracker note:',
    plan.trackerNote,
    '',
    'Safety reminders:',
    '- Do not post until npm run snapshot:visibility reports ready.',
    '- Ask for a GitHub star only after explaining the offline CHM workflow value.',
    '- Record follow-up metrics in the visibility-push issue.',
  ].join('\n');
}

async function main(argv = process.argv) {
  try {
    const options = parseArgs(argv);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const shareKit = fs.readFileSync(shareKitPath, 'utf-8');
    const baselineText = options.baselineFile
      ? fs.readFileSync(path.resolve(rootDir, options.baselineFile), 'utf-8')
      : undefined;
    const plan = buildSharePostDraft({
      shareKit,
      packageJson,
      baselineText,
      options,
    });

    console.log(formatSharePostDraft(plan));
  } catch (error) {
    console.error('Share post preparation failed:');
    console.error(`- ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildSharePostDraft,
  extractShareKitCopy,
  formatSharePostDraft,
  parseArgs,
};

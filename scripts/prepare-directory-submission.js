#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const {
  formatLocalIsoDate,
} = require('./snapshot-growth-metrics');

const {
  parseRepositorySlug,
} = require('./check-live-repository-listing');

// Builds copy-ready app-directory submission fields from docs/directory-submissions.md.
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const directoryGuidePath = path.join(rootDir, 'docs', 'directory-submissions.md');

function parseArgs(argv) {
  const options = {
    baselineFile: undefined,
    copy: 'long',
    directory: '<directory name>',
    priority: 'High',
    source: '<saved search or referral>',
    url: '<directory url>',
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
    if (arg === '--baseline-file') {
      options.baselineFile = readOptionValue(index, '--baseline-file');
      index += 1;
    } else if (arg.startsWith('--baseline-file=')) {
      options.baselineFile = arg.slice('--baseline-file='.length);
    } else if (arg === '--copy') {
      options.copy = readOptionValue(index, '--copy');
      index += 1;
    } else if (arg.startsWith('--copy=')) {
      options.copy = arg.slice('--copy='.length);
    } else if (arg === '--directory') {
      options.directory = readOptionValue(index, '--directory');
      index += 1;
    } else if (arg.startsWith('--directory=')) {
      options.directory = arg.slice('--directory='.length);
    } else if (arg === '--priority') {
      options.priority = readOptionValue(index, '--priority');
      index += 1;
    } else if (arg.startsWith('--priority=')) {
      options.priority = arg.slice('--priority='.length);
    } else if (arg === '--source') {
      options.source = readOptionValue(index, '--source');
      index += 1;
    } else if (arg.startsWith('--source=')) {
      options.source = arg.slice('--source='.length);
    } else if (arg === '--url') {
      options.url = readOptionValue(index, '--url');
      index += 1;
    } else if (arg.startsWith('--url=')) {
      options.url = arg.slice('--url='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.baselineFile !== undefined && !options.baselineFile) {
    throw new Error('--baseline-file requires a file path.');
  }
  if (!options.directory) {
    throw new Error('--directory requires a value.');
  }
  if (!['short', 'long'].includes(options.copy)) {
    throw new Error('--copy must be short or long.');
  }
  if (!['High', 'Medium', 'Low'].includes(options.priority)) {
    throw new Error('--priority must be High, Medium, or Low.');
  }
  if (!options.source) {
    throw new Error('--source requires a value.');
  }
  if (!options.url) {
    throw new Error('--url requires a value.');
  }

  return options;
}

function extractTextBlockAfter(markdown, label) {
  const labelIndex = markdown.indexOf(label);
  if (labelIndex === -1) {
    throw new Error(`Could not find ${label} in docs/directory-submissions.md.`);
  }

  const blockMatch = markdown.slice(labelIndex).match(/```text\n([\s\S]*?)\n```/);
  if (!blockMatch) {
    throw new Error(`Could not find a text block after ${label} in docs/directory-submissions.md.`);
  }

  return blockMatch[1].trim();
}

function parseListingPacket(packetText) {
  const packet = {};

  for (const line of packetText.split('\n')) {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) continue;

    packet[line.slice(0, separatorIndex).trim()] = line.slice(separatorIndex + 1).trim();
  }

  return packet;
}

function extractDirectorySubmissionCopy(markdown) {
  return {
    shortDescription: extractTextBlockAfter(markdown, 'Short description:'),
    longDescription: extractTextBlockAfter(markdown, 'Longer description:'),
    listingPacket: parseListingPacket(extractTextBlockAfter(markdown, '## Listing Packet')),
  };
}

function parseSnapshotField(snapshotText, fieldName) {
  const prefix = `${fieldName}: `;
  return snapshotText
    .split('\n')
    .find((line) => line.startsWith(prefix))
    ?.slice(prefix.length)
    .trim();
}

function parseGrowthSnapshot(snapshotText) {
  return {
    date: parseSnapshotField(snapshotText, 'Date'),
    downloads: parseSnapshotField(snapshotText, 'Downloads'),
    release: parseSnapshotField(snapshotText, 'Release'),
    repository: parseSnapshotField(snapshotText, 'Repository'),
    stars: parseSnapshotField(snapshotText, 'Stars'),
    trackerBaseline: parseSnapshotField(snapshotText, 'Tracker baseline'),
    watchers: parseSnapshotField(snapshotText, 'Watchers'),
  };
}

function buildTrackerRow({
  baseline,
  copy,
  directory,
  priority,
  source,
  url,
  today = new Date(),
}) {
  const submittedOn = baseline.date || formatLocalIsoDate(today);
  const releaseVersion = baseline.release || '<release version>';
  const baselineMetrics = baseline.trackerBaseline || '<stars> stars / <downloads> downloads / <watchers> watchers';
  const copyLabel = copy === 'short' ? 'Short copy from prepare:directory-submission' : 'Long copy from prepare:directory-submission';

  return `| ${[
    priority,
    source,
    directory,
    url,
    copyLabel,
    releaseVersion,
    submittedOn,
    baselineMetrics,
    'Recheck after 7 days',
    'Planned',
    'Recheck after approval',
    `${submittedOn}: prepared listing packet`,
  ].join(' | ')} |`;
}

function buildDirectorySubmissionPacket({
  directoryGuide,
  packageJson,
  baselineText,
  options,
  today,
}) {
  const repositorySlug = parseRepositorySlug(packageJson);
  if (!repositorySlug) {
    throw new Error('Could not parse a GitHub repository slug from package.json.');
  }

  const copy = extractDirectorySubmissionCopy(directoryGuide);
  const selectedDescription = options.copy === 'short' ? copy.shortDescription : copy.longDescription;
  const baseline = baselineText ? parseGrowthSnapshot(baselineText) : {};

  return {
    repositorySlug,
    directory: options.directory,
    url: options.url,
    priority: options.priority,
    source: options.source,
    copy: options.copy,
    selectedDescription,
    fields: copy.listingPacket,
    trackerRow: buildTrackerRow({
      baseline,
      copy: options.copy,
      directory: options.directory,
      priority: options.priority,
      source: options.source,
      url: options.url,
      today,
    }),
  };
}

function formatDirectorySubmissionPacket(plan) {
  return [
    'Directory submission packet',
    `Repository: ${plan.repositorySlug}`,
    `Directory: ${plan.directory}`,
    `Directory URL: ${plan.url}`,
    `Priority: ${plan.priority}`,
    `Source: ${plan.source}`,
    `Copy variant: ${plan.copy}`,
    '',
    'Submission fields:',
    ...Object.entries(plan.fields).map(([label, value]) => `- ${label}: ${value}`),
    '',
    'Description:',
    plan.selectedDescription,
    '',
    'Tracker row:',
    plan.trackerRow,
    '',
    'Safety reminders:',
    '- Do not submit private CHM screenshots, private document content, sensitive local paths, or unverified compatibility claims.',
    '- Ask for a GitHub star only after explaining the offline CHM workflow value and linking to a useful evaluation path.',
    '- Update docs/directory-submission-tracker.md after submitting or when the listing goes live.',
  ].join('\n');
}

async function main(argv = process.argv) {
  try {
    const options = parseArgs(argv);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const directoryGuide = fs.readFileSync(directoryGuidePath, 'utf-8');
    const baselineText = options.baselineFile
      ? fs.readFileSync(path.resolve(rootDir, options.baselineFile), 'utf-8')
      : undefined;
    const plan = buildDirectorySubmissionPacket({
      directoryGuide,
      packageJson,
      baselineText,
      options,
    });

    console.log(formatDirectorySubmissionPacket(plan));
  } catch (error) {
    console.error('Directory submission preparation failed:');
    console.error(`- ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildDirectorySubmissionPacket,
  extractDirectorySubmissionCopy,
  formatDirectorySubmissionPacket,
  parseArgs,
  parseGrowthSnapshot,
};

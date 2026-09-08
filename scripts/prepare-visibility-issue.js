#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const {
  buildVisibilityReadinessSnapshot,
  formatVisibilityReadinessSnapshot,
} = require('./snapshot-visibility-readiness');

const {
  parseRepositorySlug,
} = require('./check-live-repository-listing');

const {
  formatLocalIsoDate,
} = require('./snapshot-growth-metrics');

// Prepares a dry-run GitHub issue draft from the visibility readiness snapshot.
const rootDir = path.resolve(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const defaultFollowUpDays = 7;

function parseArgs(argv) {
  const options = {
    assets: undefined,
    audience: undefined,
    followUp: undefined,
    snapshotFile: undefined,
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
    } else if (arg === '--assets') {
      options.assets = readOptionValue(index, '--assets');
      index += 1;
    } else if (arg.startsWith('--assets=')) {
      options.assets = arg.slice('--assets='.length);
    } else if (arg === '--follow-up') {
      options.followUp = readOptionValue(index, '--follow-up');
      index += 1;
    } else if (arg.startsWith('--follow-up=')) {
      options.followUp = arg.slice('--follow-up='.length);
    } else if (arg === '--snapshot-file') {
      options.snapshotFile = readOptionValue(index, '--snapshot-file');
      index += 1;
    } else if (arg.startsWith('--snapshot-file=')) {
      options.snapshotFile = arg.slice('--snapshot-file='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.audience !== undefined && !options.audience) {
    throw new Error('--audience requires a value.');
  }
  if (options.assets !== undefined && !options.assets) {
    throw new Error('--assets requires a value.');
  }
  if (options.followUp !== undefined && !options.followUp) {
    throw new Error('--follow-up requires a value.');
  }
  if (options.snapshotFile !== undefined && !options.snapshotFile) {
    throw new Error('--snapshot-file requires a file path.');
  }

  return options;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function extractField(snapshotText, fieldName) {
  const prefix = `${fieldName}: `;
  return snapshotText
    .split('\n')
    .find((line) => line.startsWith(prefix))
    ?.slice(prefix.length)
    .trim();
}

function extractSection(snapshotText, sectionTitle) {
  const lines = snapshotText.split('\n');
  const startIndex = lines.findIndex((line) => line.trim() === sectionTitle);
  if (startIndex === -1) return '';

  const sectionLines = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === '') break;
    sectionLines.push(line);
  }

  return sectionLines.join('\n').trim();
}

function extractGrowthBaseline(snapshotText) {
  const headerLines = ['Date', 'Repository', 'Status']
    .map((fieldName) => {
      const value = extractField(snapshotText, fieldName);
      return value ? `${fieldName}: ${value}` : undefined;
    })
    .filter(Boolean);
  const growthLines = extractSection(snapshotText, 'Growth baseline:');

  return [...headerLines, growthLines].filter(Boolean).join('\n');
}

function getDefaultFollowUp(snapshotText, today = new Date()) {
  const snapshotDate = extractField(snapshotText, 'Date');
  const baseDate = snapshotDate ? new Date(`${snapshotDate}T00:00:00`) : today;
  const followUpDate = Number.isNaN(baseDate.getTime())
    ? addDays(today, defaultFollowUpDays)
    : addDays(baseDate, defaultFollowUpDays);

  return `Recheck on ${formatLocalIsoDate(followUpDate)} and update docs/directory-submission-tracker.md with stars, downloads, watchers, support issues, Discussions, and listing status.`;
}

function buildVisibilityIssueBody(plan) {
  return [
    '## Which visibility channel or audience is this for?',
    '',
    plan.audience,
    '',
    '## What live readiness checks passed?',
    '',
    '```text',
    plan.readiness,
    '```',
    '',
    '## What baseline metrics are recorded?',
    '',
    '```text',
    plan.baseline,
    '```',
    '',
    '## What copy, demo, or listing asset will be used?',
    '',
    plan.assets,
    '',
    '## What is the follow-up date and evidence plan?',
    '',
    plan.followUp,
  ].join('\n');
}

function buildVisibilityIssuePlan({
  repositorySlug,
  snapshotText,
  audience,
  assets,
  followUp,
  today,
}) {
  const trimmedSnapshot = snapshotText.trim();
  const resolvedAudience = audience || '<visibility channel or audience>';
  const resolvedAssets = assets || 'docs/share-kit.md short copy plus docs/assets/social-preview.png';
  const resolvedFollowUp = followUp || getDefaultFollowUp(trimmedSnapshot, today);
  const title = `[Visibility]: ${resolvedAudience}`;
  const baseline = extractGrowthBaseline(trimmedSnapshot);
  const issueBodyPlan = {
    audience: resolvedAudience,
    readiness: trimmedSnapshot,
    baseline,
    assets: resolvedAssets,
    followUp: resolvedFollowUp,
  };
  const issueBody = buildVisibilityIssueBody(issueBodyPlan);
  const query = new URLSearchParams({
    template: 'visibility_push.yml',
    title,
  });

  return {
    repositorySlug,
    issueUrl: `https://github.com/${repositorySlug}/issues/new?${query.toString()}`,
    title,
    audience: resolvedAudience,
    readiness: trimmedSnapshot,
    baseline,
    assets: resolvedAssets,
    followUp: resolvedFollowUp,
    issueBody,
  };
}

function formatVisibilityIssuePlan(plan) {
  return [
    'Visibility issue draft',
    `Repository: ${plan.repositorySlug}`,
    `Title: ${plan.title}`,
    '',
    'Issue URL:',
    plan.issueUrl,
    '',
    'Copyable issue body:',
    '````markdown',
    plan.issueBody,
    '````',
    '',
    'Note: GitHub issue forms may not prefill custom fields from URL parameters in every browser. Paste the copyable issue body into the matching fields.',
  ].join('\n');
}

async function readSnapshotText(repositorySlug, snapshotFile) {
  if (snapshotFile) {
    return fs.readFileSync(path.resolve(rootDir, snapshotFile), 'utf-8');
  }

  return formatVisibilityReadinessSnapshot(
    await buildVisibilityReadinessSnapshot(repositorySlug),
  );
}

async function main(argv = process.argv) {
  try {
    const options = parseArgs(argv);
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const repositorySlug = parseRepositorySlug(packageJson);

    if (!repositorySlug) {
      throw new Error('Could not parse a GitHub repository slug from package.json.');
    }

    const snapshotText = await readSnapshotText(repositorySlug, options.snapshotFile);
    const plan = buildVisibilityIssuePlan({
      repositorySlug,
      snapshotText,
      audience: options.audience,
      assets: options.assets,
      followUp: options.followUp,
    });

    console.log(formatVisibilityIssuePlan(plan));
  } catch (error) {
    console.error('Visibility issue preparation failed:');
    console.error(`- ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildVisibilityIssueBody,
  buildVisibilityIssuePlan,
  extractGrowthBaseline,
  formatVisibilityIssuePlan,
  parseArgs,
};

#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const {
  parseGrowthSnapshot,
} = require('./prepare-directory-submission');

const {
  formatLocalIsoDate,
} = require('./snapshot-growth-metrics');

// Compares saved growth snapshots and prints tracker-ready follow-up evidence.
const rootDir = path.resolve(__dirname, '..');

const VALID_STATUSES = ['Planned', 'Submitted', 'Live', 'Needs update', 'Rejected', 'Retired'];

function parseArgs(argv) {
  const options = {
    baselineFile: undefined,
    channel: '<channel or listing>',
    currentFile: undefined,
    note: '<follow-up evidence>',
    status: 'Submitted',
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
    } else if (arg === '--channel') {
      options.channel = readOptionValue(index, '--channel');
      index += 1;
    } else if (arg.startsWith('--channel=')) {
      options.channel = arg.slice('--channel='.length);
    } else if (arg === '--current-file') {
      options.currentFile = readOptionValue(index, '--current-file');
      index += 1;
    } else if (arg.startsWith('--current-file=')) {
      options.currentFile = arg.slice('--current-file='.length);
    } else if (arg === '--note') {
      options.note = readOptionValue(index, '--note');
      index += 1;
    } else if (arg.startsWith('--note=')) {
      options.note = arg.slice('--note='.length);
    } else if (arg === '--status') {
      options.status = readOptionValue(index, '--status');
      index += 1;
    } else if (arg.startsWith('--status=')) {
      options.status = arg.slice('--status='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.baselineFile) {
    throw new Error('--baseline-file is required.');
  }
  if (!options.currentFile) {
    throw new Error('--current-file is required.');
  }
  if (!options.channel) {
    throw new Error('--channel requires a value.');
  }
  if (!options.note) {
    throw new Error('--note requires a value.');
  }
  if (!VALID_STATUSES.includes(options.status)) {
    throw new Error('--status must be Planned, Submitted, Live, Needs update, Rejected, or Retired.');
  }

  return options;
}

function metricValue(snapshot, fieldName) {
  return snapshot[fieldName] || `<${fieldName}>`;
}

function formatMetrics(snapshot) {
  return `${metricValue(snapshot, 'stars')} stars / ${metricValue(snapshot, 'downloads')} downloads / ${metricValue(snapshot, 'watchers')} watchers`;
}

function parseNumericMetric(value) {
  if (!/^\d+$/.test(String(value || '').trim())) return undefined;
  return Number(value);
}

function formatDelta(baselineValue, currentValue) {
  const baseline = parseNumericMetric(baselineValue);
  const current = parseNumericMetric(currentValue);

  if (baseline === undefined || current === undefined) return 'n/a';
  const delta = current - baseline;
  return delta >= 0 ? `+${delta}` : String(delta);
}

function buildPromotionFollowUp({
  baselineText,
  currentText,
  options,
  today = new Date(),
}) {
  const baseline = parseGrowthSnapshot(baselineText);
  const current = parseGrowthSnapshot(currentText);
  const repository = current.repository || baseline.repository || '<repository>';

  if (baseline.repository && current.repository && baseline.repository !== current.repository) {
    throw new Error(`Snapshot repositories differ: ${baseline.repository} and ${current.repository}.`);
  }

  const currentDate = current.date || formatLocalIsoDate(today);
  const deltas = {
    stars: formatDelta(baseline.stars, current.stars),
    downloads: formatDelta(baseline.downloads, current.downloads),
    watchers: formatDelta(baseline.watchers, current.watchers),
  };
  const deltaSummary = `${deltas.stars} stars / ${deltas.downloads} downloads / ${deltas.watchers} watchers`;
  const baselineMetrics = baseline.trackerBaseline || formatMetrics(baseline);
  const currentMetrics = current.trackerBaseline || formatMetrics(current);
  const followUpCell = `${currentMetrics} (${deltaSummary})`;

  return {
    repository,
    channel: options.channel,
    status: options.status,
    baselineDate: baseline.date || '<baseline date>',
    currentDate,
    baselineMetrics,
    currentMetrics,
    deltas,
    deltaSummary,
    followUpCell,
    evidenceNote: `${currentDate}: ${options.channel} follow-up ${options.status}; ${followUpCell}; ${options.note}`,
  };
}

function formatPromotionFollowUp(plan) {
  return [
    'Promotion follow-up',
    `Repository: ${plan.repository}`,
    `Channel: ${plan.channel}`,
    `Status: ${plan.status}`,
    `Baseline date: ${plan.baselineDate}`,
    `Current date: ${plan.currentDate}`,
    `Baseline: ${plan.baselineMetrics}`,
    `Current: ${plan.currentMetrics}`,
    `Delta: ${plan.deltaSummary}`,
    '',
    'Follow-Up Stars/Downloads/Watchers cell:',
    plan.followUpCell,
    '',
    'Evidence cell:',
    plan.evidenceNote,
    '',
    'Next steps:',
    '- Update docs/directory-submission-tracker.md with the follow-up metrics, status, and evidence note.',
    '- Refresh the visibility-push issue if the channel exposed release, download, support, or trust blockers.',
    '- Keep sharing decisions tied to measured stars, downloads, watchers, and user feedback.',
  ].join('\n');
}

async function main(argv = process.argv) {
  try {
    const options = parseArgs(argv);
    const baselineText = fs.readFileSync(path.resolve(rootDir, options.baselineFile), 'utf-8');
    const currentText = fs.readFileSync(path.resolve(rootDir, options.currentFile), 'utf-8');
    const plan = buildPromotionFollowUp({
      baselineText,
      currentText,
      options,
    });

    console.log(formatPromotionFollowUp(plan));
  } catch (error) {
    console.error('Promotion follow-up preparation failed:');
    console.error(`- ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildPromotionFollowUp,
  formatPromotionFollowUp,
  parseArgs,
};

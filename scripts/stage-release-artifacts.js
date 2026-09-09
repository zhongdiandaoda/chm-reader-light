#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const {
  EXPECTED_RELEASE_ARTIFACTS,
  verifyReleaseArtifacts,
} = require('./check-release-artifacts');

// Stages downloaded GitHub Actions artifacts into the flat directory expected by release checks.
const rootDir = path.resolve(__dirname, '..');
const EXPECTED_RELEASE_FILES = EXPECTED_RELEASE_ARTIFACTS.flatMap((artifactName) => [
  artifactName,
  `${artifactName}.sha256`,
]);

function parseArgs(argv) {
  const options = {
    confirmed: false,
    inputDir: 'dist',
    outputDir: path.join('dist', 'release'),
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
    if (arg === '--confirm') {
      options.confirmed = true;
    } else if (arg === '--input-dir') {
      options.inputDir = readOptionValue(index, '--input-dir');
      index += 1;
    } else if (arg.startsWith('--input-dir=')) {
      options.inputDir = arg.slice('--input-dir='.length);
    } else if (arg === '--output-dir') {
      options.outputDir = readOptionValue(index, '--output-dir');
      index += 1;
    } else if (arg.startsWith('--output-dir=')) {
      options.outputDir = arg.slice('--output-dir='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.inputDir) {
    throw new Error('--input-dir requires a directory path.');
  }
  if (!options.outputDir) {
    throw new Error('--output-dir requires a directory path.');
  }

  return options;
}

function isSameOrInsidePath(candidatePath, parentPath) {
  const relativePath = path.relative(parentPath, candidatePath);
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}

function walkFiles(directory, ignoredDirectory) {
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) return [];

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (ignoredDirectory && isSameOrInsidePath(entryPath, ignoredDirectory)) {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath, ignoredDirectory));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

function buildReleaseArtifactStagePlan({ inputDir, outputDir }) {
  const resolvedInputDir = path.resolve(rootDir, inputDir);
  const resolvedOutputDir = path.resolve(rootDir, outputDir);
  const allFiles = walkFiles(resolvedInputDir, resolvedOutputDir);
  const blockers = [];
  const copyOperations = [];

  for (const expectedFile of EXPECTED_RELEASE_FILES) {
    const matches = allFiles.filter((filePath) => path.basename(filePath) === expectedFile);

    if (matches.length === 0) {
      blockers.push(`Missing downloaded release file: ${expectedFile}`);
      continue;
    }
    if (matches.length > 1) {
      blockers.push(`Multiple downloaded release files named ${expectedFile}: ${matches.join(', ')}`);
      continue;
    }

    copyOperations.push({
      from: matches[0],
      to: path.join(resolvedOutputDir, expectedFile),
    });
  }

  return {
    inputDir: resolvedInputDir,
    outputDir: resolvedOutputDir,
    blockers,
    copyOperations,
  };
}

function formatReleaseArtifactStagePlan(plan, confirmed) {
  const mode = confirmed ? 'stage files' : 'dry run';
  const lines = [
    'Release artifact staging plan',
    `Input directory: ${plan.inputDir}`,
    `Output directory: ${plan.outputDir}`,
    `Mode: ${mode}`,
    '',
  ];

  if (plan.blockers.length > 0) {
    lines.push('Artifact blockers:');
    for (const blocker of plan.blockers) {
      lines.push(`- ${blocker}`);
    }
  } else {
    lines.push('Copy operations:');
    for (const operation of plan.copyOperations) {
      lines.push(`- ${path.relative(rootDir, operation.from)} -> ${path.relative(rootDir, operation.to)}`);
    }
  }

  lines.push(
    '',
    'Next commands:',
    `- npm run check:release-artifacts -- ${path.relative(rootDir, plan.outputDir)}`,
    `- npm run publish:release -- --release-dir ${path.relative(rootDir, plan.outputDir)}`,
  );

  if (!confirmed) {
    lines.push('', 'Dry run only. Rerun with `--confirm` to copy release files into the staging directory.');
  }

  return lines.join('\n');
}

function applyReleaseArtifactStagePlan(plan) {
  if (plan.blockers.length > 0) {
    throw new Error('Release artifact staging blockers must be fixed before copying files.');
  }

  fs.mkdirSync(plan.outputDir, { recursive: true });

  for (const operation of plan.copyOperations) {
    fs.copyFileSync(operation.from, operation.to);
  }

  return verifyReleaseArtifacts(plan.outputDir);
}

async function main(argv = process.argv) {
  try {
    const options = parseArgs(argv);
    const plan = buildReleaseArtifactStagePlan({
      inputDir: options.inputDir,
      outputDir: options.outputDir,
    });

    console.log(formatReleaseArtifactStagePlan(plan, options.confirmed));

    if (!options.confirmed) return;

    const verificationErrors = applyReleaseArtifactStagePlan(plan);
    if (verificationErrors.length > 0) {
      console.error('Staged release artifact verification failed:');
      for (const error of verificationErrors) {
        console.error(`- ${error}`);
      }
      process.exitCode = 1;
      return;
    }

    console.log(`Staged release artifacts in ${plan.outputDir}.`);
  } catch (error) {
    console.error('Release artifact staging failed:');
    console.error(`- ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  EXPECTED_RELEASE_FILES,
  applyReleaseArtifactStagePlan,
  buildReleaseArtifactStagePlan,
  formatReleaseArtifactStagePlan,
  parseArgs,
};

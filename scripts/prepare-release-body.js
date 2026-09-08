#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const { buildReleaseBody, extractReleaseBodyTemplate } = require('./publish-release');

const rootDir = path.resolve(__dirname, '..');
const defaultOutput = 'dist/release/release-body.md';
const releaseTemplatePath = path.join(rootDir, 'docs', 'release-template.md');

function parseArgs(argv) {
  const options = {
    output: defaultOutput,
    tag: undefined,
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
    if (arg === '--tag') {
      options.tag = readOptionValue(index, '--tag');
      index += 1;
    } else if (arg.startsWith('--tag=')) {
      options.tag = arg.slice('--tag='.length);
    } else if (arg === '--output') {
      options.output = readOptionValue(index, '--output');
      index += 1;
    } else if (arg.startsWith('--output=')) {
      options.output = arg.slice('--output='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.tag) throw new Error('--tag requires a release tag.');
  if (!options.output) throw new Error('--output requires a file path.');

  return options;
}

function writeReleaseBody({ outputPath, releaseTemplateMarkdown, tag }) {
  const releaseTemplate = extractReleaseBodyTemplate(releaseTemplateMarkdown);
  const releaseBody = buildReleaseBody({ releaseTemplate, tag });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${releaseBody}\n`);
  return releaseBody;
}

function main(argv = process.argv) {
  try {
    const options = parseArgs(argv);
    const outputPath = path.resolve(rootDir, options.output);
    writeReleaseBody({
      outputPath,
      releaseTemplateMarkdown: fs.readFileSync(releaseTemplatePath, 'utf-8'),
      tag: options.tag,
    });
    console.log(`Release body prepared: ${outputPath}`);
  } catch (error) {
    console.error('Release body preparation failed:');
    console.error(`- ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  writeReleaseBody,
};

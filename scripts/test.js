const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const rootDir = path.resolve(__dirname, '..');
const tsc = path.join(rootDir, 'node_modules', '.bin', 'tsc');
const testBuildDir = path.join(rootDir, '.test-build');

fs.rmSync(testBuildDir, { recursive: true, force: true });
execFileSync(tsc, ['-p', 'tsconfig.test.json', '--pretty', 'true'], {
  cwd: rootDir,
  stdio: 'inherit',
});

const sourceTests = fs.readdirSync(path.join(rootDir, 'test'))
  .filter((file) => file.endsWith('.test.js'))
  .map((file) => path.join(rootDir, 'test', file));
const compiledTests = fs.readdirSync(path.join(testBuildDir, 'test'))
  .filter((file) => file.endsWith('.test.js'))
  .map((file) => path.join(testBuildDir, 'test', file));

const result = spawnSync(process.execPath, ['--test', ...sourceTests, ...compiledTests], {
  cwd: rootDir,
  stdio: 'inherit',
});
process.exitCode = result.status ?? 1;

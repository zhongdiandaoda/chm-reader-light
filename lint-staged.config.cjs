module.exports = {
  '*': () => 'git diff --cached --check',
  '*.{ts,tsx}': () => 'npm run typecheck',
  '*.sh': 'bash -n',
};

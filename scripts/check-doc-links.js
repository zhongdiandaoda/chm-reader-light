#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

// Checks local Markdown links, anchors, and repository-local links in GitHub templates so project docs do not drift.
const rootDir = path.resolve(__dirname, '..');
const ignoredDirectories = new Set(['.git', '.test-build', 'build', 'dist', 'node_modules']);
const repositoryBlobPrefix = 'https://github.com/zhongdiandaoda/chm-reader-light/blob/main/';
const githubTemplateDirectories = ['.github/ISSUE_TEMPLATE', '.github/DISCUSSION_TEMPLATE'];
const githubTemplateFiles = ['.github/PULL_REQUEST_TEMPLATE.md'];

function collectMarkdownFiles(directory = rootDir) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...collectMarkdownFiles(path.join(directory, entry.name)));
      }
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(path.join(directory, entry.name));
    }
  }

  return files;
}

function collectGitHubTemplateFiles() {
  const templateDirectories = githubTemplateDirectories.map((directory) => path.join(rootDir, directory));
  const files = githubTemplateFiles
    .map((filePath) => path.join(rootDir, filePath))
    .filter((filePath) => fs.existsSync(filePath));

  for (const directory of templateDirectories) {
    if (!fs.existsSync(directory)) continue;

    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && /\.(ya?ml|md)$/i.test(entry.name)) {
        files.push(path.join(directory, entry.name));
      }
    }
  }

  return files;
}

function stripHeadingMarkup(text) {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~]/g, '')
    .trim();
}

function slugifyHeading(heading) {
  return stripHeadingMarkup(heading)
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function collectAnchors(markdown) {
  const anchors = new Set();
  const usedSlugs = new Map();
  const headingPattern = /^(#{1,6})\s+(.+?)\s*#*\s*$/gm;
  let match;

  while ((match = headingPattern.exec(markdown)) !== null) {
    const baseSlug = slugifyHeading(match[2]);
    if (!baseSlug) continue;

    const count = usedSlugs.get(baseSlug) || 0;
    usedSlugs.set(baseSlug, count + 1);
    anchors.add(count === 0 ? baseSlug : `${baseSlug}-${count}`);
  }

  return anchors;
}

function splitTarget(target) {
  const hashIndex = target.indexOf('#');
  if (hashIndex === -1) return { fileTarget: target, anchor: '' };
  return {
    fileTarget: target.slice(0, hashIndex),
    anchor: decodeURIComponent(target.slice(hashIndex + 1)),
  };
}

function isExternalTarget(target) {
  return /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('mailto:');
}

function localPathFromRepositoryUrl(url) {
  if (!url.startsWith(repositoryBlobPrefix)) return null;
  const relativeTarget = url.slice(repositoryBlobPrefix.length);
  if (!relativeTarget) return null;

  const { fileTarget, anchor } = splitTarget(relativeTarget);
  const resolvedPath = path.resolve(rootDir, decodeURIComponent(fileTarget));
  if (!resolvedPath.startsWith(`${rootDir}${path.sep}`) && resolvedPath !== rootDir) {
    return null;
  }

  return { resolvedPath, anchor, target: url };
}

function validateMarkdownFile(filePath, anchorCache) {
  const markdown = fs.readFileSync(filePath, 'utf-8');
  const fileDirectory = path.dirname(filePath);
  const failures = [];
  const linkPattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match;

  while ((match = linkPattern.exec(markdown)) !== null) {
    const target = match[1].trim();
    if (!target || target.startsWith('<') || isExternalTarget(target)) continue;

    const { fileTarget, anchor } = splitTarget(target);
    const resolvedPath = fileTarget
      ? path.resolve(fileDirectory, decodeURIComponent(fileTarget))
      : filePath;

    if (!fs.existsSync(resolvedPath)) {
      failures.push(`${path.relative(rootDir, filePath)} links to missing file ${target}`);
      continue;
    }

    if (!anchor) continue;

    if (path.extname(resolvedPath).toLowerCase() !== '.md') {
      failures.push(`${path.relative(rootDir, filePath)} links to anchor in non-Markdown file ${target}`);
      continue;
    }

    let anchors = anchorCache.get(resolvedPath);
    if (!anchors) {
      anchors = collectAnchors(fs.readFileSync(resolvedPath, 'utf-8'));
      anchorCache.set(resolvedPath, anchors);
    }

    if (!anchors.has(anchor)) {
      failures.push(`${path.relative(rootDir, filePath)} links to missing anchor ${target}`);
    }
  }

  return failures;
}

function validateResolvedTarget(sourceFilePath, resolvedPath, anchor, target, anchorCache) {
  if (!fs.existsSync(resolvedPath)) {
    return `${path.relative(rootDir, sourceFilePath)} links to missing file ${target}`;
  }

  if (!anchor) return null;

  if (path.extname(resolvedPath).toLowerCase() !== '.md') {
    return `${path.relative(rootDir, sourceFilePath)} links to anchor in non-Markdown file ${target}`;
  }

  let anchors = anchorCache.get(resolvedPath);
  if (!anchors) {
    anchors = collectAnchors(fs.readFileSync(resolvedPath, 'utf-8'));
    anchorCache.set(resolvedPath, anchors);
  }

  if (!anchors.has(anchor)) {
    return `${path.relative(rootDir, sourceFilePath)} links to missing anchor ${target}`;
  }

  return null;
}

function validateGitHubTemplateFile(filePath, anchorCache) {
  const template = fs.readFileSync(filePath, 'utf-8');
  const failures = [];
  const urlPattern = /https:\/\/github\.com\/zhongdiandaoda\/chm-reader-light\/blob\/main\/[^\s"'<>),]+/g;
  let match;

  while ((match = urlPattern.exec(template)) !== null) {
    const localTarget = localPathFromRepositoryUrl(match[0]);
    if (!localTarget) continue;

    const failure = validateResolvedTarget(
      filePath,
      localTarget.resolvedPath,
      localTarget.anchor,
      localTarget.target,
      anchorCache,
    );
    if (failure) failures.push(failure);
  }

  return failures;
}

function main() {
  const anchorCache = new Map();
  const markdownFailures = collectMarkdownFiles().flatMap((filePath) => validateMarkdownFile(filePath, anchorCache));
  const templateFailures = collectGitHubTemplateFiles().flatMap((filePath) =>
    validateGitHubTemplateFile(filePath, anchorCache),
  );
  const failures = [...markdownFailures, ...templateFailures];

  if (failures.length > 0) {
    console.error('Documentation link check failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Documentation link check passed.');
}

main();

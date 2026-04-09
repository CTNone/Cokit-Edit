const fs = require('fs-extra');
const path = require('path');

function ensureDir(dirPath) {
  return fs.ensureDir(dirPath);
}

function getTimestampedFolder(prefix = 'run') {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${prefix}_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function normalizeWhitespace(value) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sanitizeFileSegment(value) {
  return String(value || '')
    .trim()
    .replace(/[<>:"/\\|?*]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function splitSteps(raw) {
  const input = normalizeWhitespace(raw)
    .replace(/(TC-\d+)(?=\d+\.\s)/gi, '$1 ')
    .replace(/(\"[^\"]+\")(?=\d+\.\s)/g, '$1 ');

  if (!input) return [];

  const numberedMatches = [...input.matchAll(/(?:^|\n|\s)(\d+\.\s.*?)(?=(?:\s\d+\.\s)|(?:\n\d+\.\s)|$)/gs)]
    .map((match) => normalizeWhitespace(match[1]).replace(/^\d+\.\s*/, ''))
    .filter(Boolean);

  if (numberedMatches.length > 0) {
    return numberedMatches;
  }

  return input
    .split('\n')
    .map((step) => normalizeWhitespace(step).replace(/^[-*]\s*/, ''))
    .filter(Boolean);
}

function toRelativeLink(fromPath, targetPath) {
  if (!targetPath) return '';
  const relative = path.relative(path.dirname(fromPath), targetPath);
  return relative.split(path.sep).join('/');
}

async function cleanOldRuns(runsDir, maxRuns = 10) {
  if (!await fs.pathExists(runsDir)) return;
  const folders = await fs.readdir(runsDir);
  if (folders.length > maxRuns) {
    // Reserved for future cleanup strategy.
  }
}

module.exports = {
  ensureDir,
  getTimestampedFolder,
  normalizeWhitespace,
  sanitizeFileSegment,
  splitSteps,
  toRelativeLink,
  cleanOldRuns,
};

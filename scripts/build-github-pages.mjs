import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const rootDir = process.cwd();
const apiDir = path.join(rootDir, 'app', 'api');
const outDir = path.join(rootDir, 'out');

function findRouteFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findRouteFiles(full));
    } else if (entry.isFile() && entry.name === 'route.ts') {
      results.push(full);
    }
  }
  return results;
}

const stashedPairs = [];

try {
  const routeFiles = findRouteFiles(apiDir);
  for (const routeFile of routeFiles) {
    const stashed = `${routeFile}.server-only`;
    fs.renameSync(routeFile, stashed);
    stashedPairs.push([routeFile, stashed]);
  }

  const nextBin = path.join(rootDir, 'node_modules', 'next', 'dist', 'bin', 'next');
  execFileSync(process.execPath, [nextBin, 'build'], {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      GITHUB_PAGES: 'true',
      NEXT_PUBLIC_GITHUB_PAGES: 'true',
      NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || '',
    },
  });

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
  console.log('Static GitHub Pages export generated in ./out');
} finally {
  for (const [original, stashed] of stashedPairs) {
    if (fs.existsSync(stashed)) {
      fs.renameSync(stashed, original);
    }
  }
}

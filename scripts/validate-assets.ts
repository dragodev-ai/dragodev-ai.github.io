/**
 * scripts/validate-assets.ts
 * Verifies that all content JSON manifests, Resume PDFs, 3D GLB character model,
 * and studio voiceover/audio assets exist and satisfy structural integrity checks.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

const results: CheckResult[] = [];

function checkJson(relPath: string, validator?: (data: unknown) => string | null) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) {
    results.push({ name: relPath, ok: false, detail: 'File missing' });
    return;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(full, 'utf-8'));
    const err = validator ? validator(parsed) : null;
    if (err) {
      results.push({ name: relPath, ok: false, detail: err });
    } else {
      results.push({ name: relPath, ok: true, detail: 'Valid JSON' });
    }
  } catch (e) {
    results.push({ name: relPath, ok: false, detail: `Invalid JSON: ${(e as Error).message}` });
  }
}

function checkBinaryFile(relPath: string, minBytes: number, magicAscii?: string) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) {
    results.push({ name: relPath, ok: false, detail: 'File missing' });
    return;
  }
  const stat = fs.statSync(full);
  if (stat.size < minBytes) {
    results.push({
      name: relPath,
      ok: false,
      detail: `File too small (${stat.size} bytes < ${minBytes} bytes)`,
    });
    return;
  }
  if (magicAscii) {
    const fd = fs.openSync(full, 'r');
    const buf = Buffer.alloc(magicAscii.length);
    fs.readSync(fd, buf, 0, magicAscii.length, 0);
    fs.closeSync(fd);
    if (buf.toString('ascii') !== magicAscii) {
      results.push({
        name: relPath,
        ok: false,
        detail: `Invalid magic header (expected "${magicAscii}", got "${buf.toString('ascii')}")`,
      });
      return;
    }
  }
  results.push({ name: relPath, ok: true, detail: `${(stat.size / 1024).toFixed(1)} KB verified` });
}

checkJson('content/profile.json', (d) => {
  const p = d as { name?: string; contact?: { email?: string } };
  if (p.name !== 'Dev Kumawat') return 'Unexpected profile name';
  if (p.contact?.email !== 'kumawatrishi096@gmail.com') return 'Unexpected contact email';
  return null;
});
checkJson('content/services.json', (d) => {
  const s = d as { primaryGroups?: unknown[] };
  return (s.primaryGroups?.length || 0) >= 4 ? null : 'Expected 4 primary service groups';
});
checkJson('content/projects.json', (d) => {
  const m = d as { projects?: Array<{ id: string }>; categories?: unknown[] };
  if (!m.projects || m.projects.length < 50) return 'Expected populated Drive projects manifest';
  const ids = new Set(m.projects.map((p) => p.id));
  if (ids.size !== m.projects.length) return 'Duplicate project IDs detected';
  return null;
});
checkJson('content/pricing.json');
checkJson('content/social-links.json');
checkJson('content/site-config.json');

checkBinaryFile('public/assets/Dev-Kumawat-Resume.pdf', 10_000, '%PDF');
checkBinaryFile('public/assets/Dev-Kumawat-Portfolio-Overview.pdf', 50_000, '%PDF');
checkBinaryFile('public/assets/dev-studio-portrait.jpg', 5_000);
checkBinaryFile('public/videos/DEV_KUMAWAT_SAAS_WEB.mp4', 5_000_000);
checkBinaryFile('public/videos/dev-kumawat-hero-poster.jpg', 10_000);
checkBinaryFile('public/audio/intro-full.mp3', 10_000);
checkBinaryFile('public/audio/intro-01.mp3', 2_000);
checkBinaryFile('public/audio/intro-02.mp3', 2_000);
checkBinaryFile('public/audio/intro-03.mp3', 2_000);
checkBinaryFile('public/audio/intro-04.mp3', 2_000);
checkBinaryFile('public/audio/intro-05.mp3', 2_000);
checkBinaryFile('public/audio/studio-ambience.mp3', 10_000);
checkBinaryFile('public/audio/studio-music.mp3', 10_000);
checkJson('public/audio/intro-timings.json');

console.log('\n=== DEV STUDIO ASSET VALIDATION ===');
for (const r of results) {
  console.log(`${r.ok ? '[PASS]' : '[FAIL]'} ${r.name.padEnd(48)} ${r.detail}`);
}

const failed = results.filter((r) => !r.ok);
if (failed.length > 0) {
  console.error(`\nAsset validation failed (${failed.length} issue(s)).`);
  process.exit(1);
}
console.log(`\nAll ${results.length} asset checks passed!`);


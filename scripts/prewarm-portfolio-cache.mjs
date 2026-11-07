import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ROOT = process.cwd();
const CACHE_ROOT = path.join(ROOT, '.cache');
const FASTSTART_DIR = path.join(CACHE_ROOT, 'drive-faststart');
const STREAM_DIR = path.join(CACHE_ROOT, 'drive-streams');
const THUMB_DIR = path.join(CACHE_ROOT, 'drive-thumbnails');
const BLOCK_SIZE = 2 * 1024 * 1024;

fs.mkdirSync(FASTSTART_DIR, { recursive: true });
fs.mkdirSync(STREAM_DIR, { recursive: true });
fs.mkdirSync(THUMB_DIR, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'projects.json'), 'utf8'));
const projects = manifest.projects || [];

async function cacheThumbnail(fileId, sz) {
  const key = `${fileId}_${sz}`;
  const binPath = path.join(THUMB_DIR, `${key}.bin`);
  const typePath = path.join(THUMB_DIR, `${key}.type`);
  if (fs.existsSync(binPath) && fs.statSync(binPath).size > 256) return true;

  try {
    const res = await fetch(
      `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=${sz}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DevStudioThumbPrewarm/2.0)' } }
    );
    const cType = res.headers.get('content-type') || '';
    if (res.ok && cType.startsWith('image/')) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 0) {
        fs.writeFileSync(binPath, buf);
        fs.writeFileSync(typePath, cType);
        return true;
      }
    }
  } catch {
    // Ignore individual network glitch
  }
  return false;
}

async function transcodeFeaturedToFaststart(project) {
  const outPath = path.join(FASTSTART_DIR, `${project.id}.mp4`);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 32768) {
    console.log(`[SKIP] Already cached faststart: ${project.title}`);
    return;
  }

  const rawPath = path.join(FASTSTART_DIR, `${project.id}.raw.mp4`);
  const tmpPath = path.join(FASTSTART_DIR, `${project.id}.tmp.mp4`);
  const srcUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(
    project.id
  )}&export=download&confirm=t`;

  console.log(`[FFMPEG] Optimizing ${project.title} (${Math.round((project.sizeBytes || 0) / 1048576)} MB raw -> 1080p faststart)...`);
  const t0 = Date.now();
  try {
    const totalBytes = project.sizeBytes || 0;
    if (totalBytes > 64 * 1024 * 1024) {
      // Parallel 32 MB range chunks for large >64 MB Drive masters
      const CHUNK = 32 * 1024 * 1024;
      const parts = [];
      for (let pos = 0; pos < totalBytes; pos += CHUNK) {
        const end = Math.min(totalBytes - 1, pos + CHUNK - 1);
        parts.push({ pos, end });
      }
      const buffers = await Promise.all(
        parts.map(async ({ pos, end }) => {
          const r = await fetch(srcUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0', Range: `bytes=${pos}-${end}` },
          });
          if (!r.ok && r.status !== 206) throw new Error(`Chunk HTTP ${r.status}`);
          return Buffer.from(await r.arrayBuffer());
        })
      );
      fs.writeFileSync(rawPath, Buffer.concat(buffers));
    } else {
      const dlRes = await fetch(srcUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0', Range: 'bytes=0-' },
      });
      if (!dlRes.ok && dlRes.status !== 206) throw new Error(`HTTP ${dlRes.status}`);
      fs.writeFileSync(rawPath, Buffer.from(await dlRes.arrayBuffer()));
    }

    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-hide_banner',
        '-loglevel',
        'error',
        '-i',
        rawPath,
        '-vf',
        "scale='min(1920,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
        '-c:v',
        'libx264',
        '-preset',
        'superfast',
        '-crf',
        '24',
        '-pix_fmt',
        'yuv420p',
        '-movflags',
        '+faststart',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        tmpPath,
      ],
      { timeout: 180_000 }
    );
    if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
    fs.renameSync(tmpPath, outPath);
    const mb = (fs.statSync(outPath).size / 1048576).toFixed(1);
    console.log(`[DONE] ${project.title} -> ${mb} MB faststart in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  } catch (err) {
    if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    console.warn(`[WARN] FFmpeg optimization skipped for ${project.title}: ${err.message}`);
  }
}

async function warmMarqueeHeadAndTail(project) {
  if (fs.existsSync(path.join(FASTSTART_DIR, `${project.id}.mp4`))) return;
  const blk0Key = `${project.id}_blk_0`.replace(/[^a-zA-Z0-9_-]/g, '_');
  const blk0Path = path.join(STREAM_DIR, `${blk0Key}.bin`);
  if (fs.existsSync(blk0Path) && fs.statSync(blk0Path).size > 4096) return;

  const totalHint = project.sizeBytes || 0;
  const end = totalHint > 0 ? Math.min(totalHint - 1, BLOCK_SIZE - 1) : BLOCK_SIZE - 1;
  const url = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(
    project.id
  )}&export=download&confirm=t`;

  try {
    const res = await fetch(url, {
      headers: { Range: `bytes=0-${end}`, 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok && res.status !== 206) return;
    const buf = Buffer.from(await res.arrayBuffer());
    const cr = res.headers.get('content-range') || '';
    const m = /\/(\d+)$/.exec(cr);
    const total = m ? Number(m[1]) : totalHint || buf.length;
    fs.writeFileSync(blk0Path, buf);
    fs.writeFileSync(`${blk0Path}.meta`, String(total));

    const hasMoov = buf.subarray(0, Math.min(buf.length, 262144)).includes(Buffer.from('moov'));
    if (!hasMoov && total > BLOCK_SIZE) {
      const tailStart = Math.max(0, total - BLOCK_SIZE);
      const tailKey = `${project.id}_tail_${tailStart}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      const tailPath = path.join(STREAM_DIR, `${tailKey}.bin`);
      const tRes = await fetch(url, {
        headers: { Range: `bytes=${tailStart}-${total - 1}`, 'User-Agent': 'Mozilla/5.0' },
      });
      if (tRes.ok || tRes.status === 206) {
        const tBuf = Buffer.from(await tRes.arrayBuffer());
        fs.writeFileSync(tailPath, tBuf);
        fs.writeFileSync(`${tailPath}.meta`, String(total));
      }
    }
    console.log(`[WARMED] Head+Tail chunks cached: ${project.title}`);
  } catch {
    // Ignore individual network timeout
  }
}

console.log('=== 1. Pre-caching Homepage & Featured Thumbnails ===');
const priorityProjects = projects.filter((p) => p.featured || p.inMarquee).concat(projects.slice(0, 18));
const uniquePriority = Array.from(new Map(priorityProjects.map((p) => [p.id, p])).values());

const CONCURRENCY = 6;
for (let i = 0; i < uniquePriority.length; i += CONCURRENCY) {
  const batch = uniquePriority.slice(i, i + CONCURRENCY);
  await Promise.all(
    batch.flatMap((p) => [
      cacheThumbnail(p.id, 'w480'),
      cacheThumbnail(p.id, 'w640'),
      cacheThumbnail(p.id, 'w800'),
    ])
  );
}
console.log(`Cached thumbnails for ${uniquePriority.length} priority portfolio items.`);

console.log('\n=== 2. Optimizing Featured Homepage Videos to Instant 1080p Faststart ===');
const featuredVideos = projects.filter((p) => p.mediaType === 'video' && p.featured);
for (const fv of featuredVideos) {
  await transcodeFeaturedToFaststart(fv);
}

console.log('\n=== 3. Warming Marquee Video Head+Tail moov Blocks ===');
const marqueeVideos = projects.filter((p) => p.mediaType === 'video' && p.inMarquee && !p.featured);
for (let i = 0; i < marqueeVideos.length; i += 3) {
  await Promise.all(marqueeVideos.slice(i, i + 3).map((mv) => warmMarqueeHeadAndTail(mv)));
}

console.log('\nPortfolio media cache optimization complete!');


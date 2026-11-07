/**
 * scripts/generate-elevenlabs-audio.mjs
 * Optional ElevenLabs voiceover generator.
 * When ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID are set in your environment,
 * running `node scripts/generate-elevenlabs-audio.mjs` replaces public/audio/intro-01..05.mp3
 * with ElevenLabs studio voiceovers while preserving introScript segments from content/profile.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const apiKey = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

if (!apiKey) {
  console.error(
    'Missing ELEVENLABS_API_KEY. Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in .env.local first, or use scripts/generate-studio-audio.py.'
  );
  process.exit(1);
}

const profile = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'profile.json'), 'utf-8'));
const outDir = path.join(ROOT, 'public', 'audio');
fs.mkdirSync(outDir, { recursive: true });

for (const seg of profile.introScript.segments) {
  console.log(`Generating ${seg.id} via ElevenLabs...`);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: seg.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.52,
        similarity_boost: 0.78,
        style: 0.18,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`ElevenLabs error (${res.status}): ${await res.text()}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(path.join(outDir, `${seg.id}.mp3`), buf);
  console.log(`Saved public/audio/${seg.id}.mp3 (${(buf.length / 1024).toFixed(1)} KB)`);
}

console.log('Done! Re-concatenate intro-full.mp3 with ffmpeg if desired (see AUDIO_SETUP.md).');

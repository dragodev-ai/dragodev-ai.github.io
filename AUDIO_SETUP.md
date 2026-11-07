# Studio Voiceover & Soundscape Setup Guide

**DEV STUDIO** includes a synchronized, browser-safe audio architecture (`lib/audio/studio-audio-context.tsx` + `components/audio/StudioAudioControls.tsx`) that coordinates:

1. **Spoken Studio Introduction** (`public/audio/intro-full.mp3` & `public/audio/intro-01..05.mp3`)
2. **Word & Segment Lip-Sync Timings** (`public/audio/intro-timings.json`)
3. **Subtle Editing Suite Room Ambience** (`public/audio/studio-ambience.mp3`)
4. **Atmospheric Studio Background Music with Automatic Speech Ducking** (`public/audio/studio-music.mp3`)
5. **Tactile Web Audio UI Hover/Click Micro-Ticks**

---

## 1. Browser Autoplay Policy & Visitor Control

Modern browsers block unmuted audio prior to an explicit user gesture. DEV STUDIO enforces this cleanly:
- On initial load, **zero audio plays automatically**.
- Visitors see the studio entry card offering two clear choices:
  - **`ENTER STUDIO / ENABLE SOUND`** — Unlocks Web Audio, begins Dev's spoken introduction with live captions, drives real-time FFT + word-envelope jaw lip-sync on the 3D character (`DevCharacterModel.tsx`), and ducks background music (`0.10` gain while speaking, `0.24` gain when idle).
  - **`ENTER MUTED`** — Dismisses the gate and enters the interactive 3D studio completely silent.
- Once inside, a persistent bottom-left audio dock provides **Mute/Unmute**, **Volume Slider**, **Replay Intro**, **Live Captions Toggle**, and **Full Text Transcript**.
- Opening any portfolio video in the **Cinema Video Player Modal** automatically pauses studio speech and ducks background audio so portfolio soundtracks never clash.

---

## 2. Editing the Spoken Introduction Script

All spoken lines and caption segments live in `content/profile.json` under `introScript`:

```json
{
  "introScript": {
    "fullText": "Hey, welcome to my creative studio. I'm Dev Kumawat...",
    "segments": [
      { "id": "intro-01", "text": "Hey, welcome to my creative studio. I'm Dev Kumawat." },
      { "id": "intro-02", "text": "Based here in Jaipur, I craft cinematic video edits..." }
    ]
  }
}
```

After editing `content/profile.json`, regenerate the audio files using **Option A (Free Local Neural Voice)**, **Option B (ElevenLabs API)**, or **Option C (Real Recorded Studio Microphone)**.

---

## 3. Option A: Regenerate Locally (Zero Cost — Indian-English Neural Voice)

`scripts/generate-studio-audio.py` uses `edge-tts` (`en-IN-PrabhatNeural`), `ffmpeg` broadcast mastering, and `scipy`/`numpy` ambient synthesis to generate `intro-01..05.mp3`, `intro-full.mp3`, word-accurate `intro-timings.json`, `studio-ambience.mp3`, and `studio-music.mp3`:

```bash
python scripts/generate-studio-audio.py
npm run validate:assets
```

---

## 4. Option B: Upgrade Voiceover via ElevenLabs API (Custom or Cloned Voice)

If you have an ElevenLabs account (or a custom voice clone of Dev's voice):

1. Set your credentials in `.env.local` (never commit keys to git):
   ```env
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ELEVENLABS_VOICE_ID=your_elevenlabs_voice_id
   ```
2. Run the ElevenLabs generator script:
   ```bash
   node --env-file=.env.local scripts/generate-elevenlabs-audio.mjs
   ```
3. Concatenate the 5 segment MP3s into `public/audio/intro-full.mp3` with `ffmpeg`:
   ```bash
   ffmpeg -y -i "concat:public/audio/intro-01.mp3|public/audio/intro-02.mp3|public/audio/intro-03.mp3|public/audio/intro-04.mp3|public/audio/intro-05.mp3" -acodec copy public/audio/intro-full.mp3
   ```
   *(Note: Even if `intro-timings.json` word timestamps differ after replacing `intro-full.mp3`, `studio-audio-context.tsx` automatically uses live Web Audio `AnalyserNode` FFT frequency energy to drive smooth 3D jaw lip-sync!)*

---

## 5. Option C: Using Your Own Recorded Microphone Voiceover

To use a real studio voice recording of Dev Kumawat:
1. Export your mastered recording as **MP3 (44.1 kHz / 48 kHz, 128–192 kbps)** to `public/audio/intro-full.mp3`.
2. Update `introScript.fullText` and segment durations in `public/audio/intro-timings.json` so on-screen captions match your spoken phrasing.
3. Run `npm run validate:assets` to verify file integrity.

---

## 6. Adjusting Default Volumes

Open `content/site-config.json` and tune the `studio` audio mix without touching React code:

```json
"studio": {
  "defaultVolume": 0.8,
  "ambienceVolume": 0.22,
  "musicVolumeDuringSpeech": 0.1,
  "musicVolumeIdle": 0.24
}
```

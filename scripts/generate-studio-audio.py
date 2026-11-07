"""
scripts/generate-studio-audio.py
Generates:
1. Separate Indian-English male voiceover segments (public/audio/intro-01..05.mp3)
2. Master concatenated studio introduction (public/audio/intro-full.mp3)
3. Exact word & segment timing manifest (public/audio/intro-timings.json) for captions + viseme lip-sync
4. Original copyright-free subtle studio music loop (public/audio/studio-music.mp3)
5. Subtle editing-suite room tone & atmosphere loop (public/audio/studio-ambience.mp3)
"""

import asyncio
import json
import os
import subprocess
import numpy as np
import soundfile as sf
import edge_tts

ROOT = r"D:\Dev website"
OUT_DIR = os.path.join(ROOT, "public", "audio")
os.makedirs(OUT_DIR, exist_ok=True)

FFMPEG = r"C:\Users\Rishiii\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe"
if not os.path.exists(FFMPEG):
    FFMPEG = "ffmpeg"

VOICE = "en-IN-PrabhatNeural"

SEGMENTS = [
    (
        "intro-01",
        "Hi, I'm Dev. I'm a video editor, graphic designer, AI generalist, social media manager, and prompt engineer.",
    ),
    (
        "intro-02",
        "I love transforming ideas into powerful visual experiences.",
    ),
    (
        "intro-03",
        "From cinematic video editing and motion graphics to creative branding, photography, and AI-powered content, I bring ideas to life through visual storytelling.",
    ),
    (
        "intro-04",
        "Take a look around my studio and explore some of my work.",
    ),
    (
        "intro-05",
        "And when you find something you like, let's create something extraordinary together.",
    ),
]


def word_to_viseme(word: str) -> str:
    w = word.lower().strip(".,!'\"-")
    if any(ch in w for ch in ("o", "u", "w")):
        return "round"
    if any(ch in w for ch in ("a", "aa", "ai")):
        return "open"
    if any(ch in w for ch in ("e", "i", "y")):
        return "wide"
    return "neutral"


async def synthesize_segments():
    segment_records = []
    all_words = []
    cumulative_offset_sec = 0.0
    pause_between_sec = 0.28

    concat_wavs = []

    for idx, (seg_id, text) in enumerate(SEGMENTS):
        raw_mp3 = os.path.join(OUT_DIR, f"{seg_id}_raw.mp3")
        final_mp3 = os.path.join(OUT_DIR, f"{seg_id}.mp3")
        seg_wav = os.path.join(OUT_DIR, f"{seg_id}.wav")

        communicate = edge_tts.Communicate(text=text, voice=VOICE, rate="+0%", pitch="-2Hz")
        seg_words = []

        with open(raw_mp3, "wb") as audio_f:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_f.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    start_s = chunk["offset"] / 10_000_000.0
                    dur_s = max(chunk["duration"] / 10_000_000.0, 0.08)
                    w_txt = chunk["text"]
                    seg_words.append({
                        "word": w_txt,
                        "start": round(start_s, 3),
                        "end": round(start_s + dur_s, 3),
                        "viseme": word_to_viseme(w_txt),
                    })

        # Master segment with warm studio voice EQ & gentle loudness normalization
        subprocess.run(
            [
                FFMPEG,
                "-y",
                "-i",
                raw_mp3,
                "-af",
                "highpass=f=85,equalizer=f=180:width_type=q:w=1.2:g=1.8,equalizer=f=3600:width_type=q:w=1.4:g=1.5,acompressor=threshold=-18dB:ratio=2.5:attack=12:release=140",
                "-ar",
                "44100",
                "-ac",
                "1",
                seg_wav,
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        os.remove(raw_mp3)

        data, sr = sf.read(seg_wav)
        seg_dur = len(data) / float(sr)

        subprocess.run(
            [FFMPEG, "-y", "-i", seg_wav, "-codec:a", "libmp3lame", "-qscale:a", "2", final_mp3],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        # Fallback word timing distribution if TTS engine didn't emit WordBoundary events
        if not seg_words:
            tokens = text.split()
            slot = max(seg_dur - 0.15, 0.3) / max(len(tokens), 1)
            for ti, tok in enumerate(tokens):
                ws = 0.05 + ti * slot
                seg_words.append({
                    "word": tok,
                    "start": round(ws, 3),
                    "end": round(ws + slot * 0.88, 3),
                    "viseme": word_to_viseme(tok),
                })

        for w in seg_words:
            all_words.append({
                "word": w["word"],
                "start": round(cumulative_offset_sec + w["start"], 3),
                "end": round(cumulative_offset_sec + w["end"], 3),
                "viseme": w["viseme"],
                "segmentId": seg_id,
            })

        segment_records.append({
            "id": seg_id,
            "file": f"/audio/{seg_id}.mp3",
            "text": text,
            "start": round(cumulative_offset_sec, 3),
            "end": round(cumulative_offset_sec + seg_dur, 3),
            "duration": round(seg_dur, 3),
            "gesture": ["welcome", "emphasis", "showcase", "sweep", "invite"][idx],
        })

        concat_wavs.append((data, sr))
        cumulative_offset_sec += seg_dur + (pause_between_sec if idx < len(SEGMENTS) - 1 else 0.0)
        os.remove(seg_wav)

    # Concatenate full voiceover master with natural studio pauses
    sr = concat_wavs[0][1]
    pause_samples = np.zeros(int(sr * pause_between_sec), dtype=np.float32)
    pieces = []
    for idx, (arr, _) in enumerate(concat_wavs):
        pieces.append(arr.astype(np.float32))
        if idx < len(concat_wavs) - 1:
            pieces.append(pause_samples)

    full_audio = np.concatenate(pieces)
    full_wav = os.path.join(OUT_DIR, "intro-full.wav")
    full_mp3 = os.path.join(OUT_DIR, "intro-full.mp3")
    sf.write(full_wav, full_audio, sr)
    subprocess.run(
        [FFMPEG, "-y", "-i", full_wav, "-codec:a", "libmp3lame", "-qscale:a", "2", full_mp3],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    os.remove(full_wav)

    timings_payload = {
        "voice": VOICE,
        "totalDuration": round(len(full_audio) / float(sr), 3),
        "fullAudioUrl": "/audio/intro-full.mp3",
        "segments": segment_records,
        "words": all_words,
    }
    with open(os.path.join(OUT_DIR, "intro-timings.json"), "w", encoding="utf-8") as f:
        json.dump(timings_payload, f, indent=2)

    print(f"Generated 5 speech segments + intro-full.mp3 ({timings_payload['totalDuration']}s, {len(all_words)} words).")


def synthesize_studio_soundscape():
    sr = 44100

    # 1. Subtle studio room tone & atmosphere (24s seamless crossfaded loop)
    dur_amb = 24.0
    n_amb = int(sr * dur_amb)
    t = np.linspace(0, dur_amb, n_amb, endpoint=False)
    rng = np.random.default_rng(42)

    # Filtered Brownian/pink acoustic room air + ultra-soft workstation fan harmonic
    white = rng.normal(0.0, 0.015, n_amb)
    # Simple one-pole lowpass for warm acoustic room tone
    room = np.zeros_like(white)
    alpha = 0.018
    for i in range(1, n_amb):
        room[i] = (1.0 - alpha) * room[i - 1] + alpha * white[i]

    hum = 0.0045 * np.sin(2 * np.pi * 55.0 * t) + 0.0022 * np.sin(2 * np.pi * 110.0 * t + 0.4)
    breath_mod = 0.85 + 0.15 * np.sin(2 * np.pi * (1.0 / dur_amb) * t)
    amb_L = (room + hum) * breath_mod
    amb_R = (np.roll(room, 600) + hum * 0.96) * breath_mod

    # Smooth loop endpoints
    fade = int(sr * 1.5)
    env = np.ones(n_amb)
    env[:fade] = np.linspace(0.2, 1.0, fade)
    env[-fade:] = np.linspace(1.0, 0.2, fade)
    amb_stereo = np.column_stack([amb_L * env, amb_R * env]).astype(np.float32)

    amb_wav = os.path.join(OUT_DIR, "studio-ambience.wav")
    amb_mp3 = os.path.join(OUT_DIR, "studio-ambience.mp3")
    sf.write(amb_wav, amb_stereo, sr)
    subprocess.run(
        [FFMPEG, "-y", "-i", amb_wav, "-codec:a", "libmp3lame", "-qscale:a", "3", amb_mp3],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    os.remove(amb_wav)

    # 2. Original Cinematic Ambient Studio Music (32s 4-chord warm pad progression: Dm9 -> Bbmaj7 -> Fmaj9 -> C6/9)
    dur_mus = 32.0
    n_mus = int(sr * dur_mus)
    tm = np.linspace(0, dur_mus, n_mus, endpoint=False)

    chords = [
        [73.42, 146.83, 220.00, 261.63, 329.63],  # Dm9
        [58.27, 116.54, 174.61, 220.00, 293.66],  # Bbmaj7
        [87.31, 174.61, 220.00, 261.63, 392.00],  # Fmaj9
        [65.41, 130.81, 196.00, 220.00, 293.66],  # C6/9
    ]

    mus_L = np.zeros(n_mus, dtype=np.float64)
    mus_R = np.zeros(n_mus, dtype=np.float64)
    chord_len = dur_mus / len(chords)

    for ci, freqs in enumerate(chords):
        c_start = ci * chord_len
        c_end = (ci + 1) * chord_len
        # Smooth raised-cosine pad envelope with overlap
        win = np.zeros(n_mus, dtype=np.float64)
        mask = (tm >= max(0.0, c_start - 1.2)) & (tm < min(dur_mus, c_end + 1.2))
        local_t = tm[mask] - c_start
        env_c = np.ones_like(local_t)
        attack = local_t < 1.8
        env_c[attack] = 0.5 * (1.0 - np.cos(np.pi * np.clip((local_t[attack] + 1.2) / 3.0, 0.0, 1.0)))
        release = local_t > (chord_len - 1.8)
        env_c[release] = 0.5 * (1.0 + np.cos(np.pi * np.clip((local_t[release] - (chord_len - 1.8)) / 3.0, 0.0, 1.0)))
        win[mask] = env_c

        for fi, f in enumerate(freqs):
            amp = 0.048 if fi == 0 else (0.032 / (1.0 + 0.22 * fi))
            detune = 1.0018 if fi >= 2 else 1.0
            shimmer = 1.0 + 0.12 * np.sin(2 * np.pi * (0.18 + 0.05 * fi) * tm)
            sig_l = amp * shimmer * (np.sin(2 * np.pi * f * tm) + 0.25 * np.sin(2 * np.pi * f * 2.0 * tm))
            sig_r = amp * shimmer * (np.sin(2 * np.pi * (f * detune) * tm + 0.35) + 0.25 * np.sin(2 * np.pi * f * 2.0 * tm + 0.7))
            mus_L += sig_l * win
            mus_R += sig_r * win

    # Seamless master fade at edges
    f_mus = int(sr * 1.5)
    m_env = np.ones(n_mus)
    m_env[:f_mus] = np.linspace(0.15, 1.0, f_mus)
    m_env[-f_mus:] = np.linspace(1.0, 0.15, f_mus)
    mus_stereo = np.column_stack([mus_L * m_env, mus_R * m_env]).astype(np.float32)

    mus_wav = os.path.join(OUT_DIR, "studio-music.wav")
    mus_mp3 = os.path.join(OUT_DIR, "studio-music.mp3")
    sf.write(mus_wav, mus_stereo, sr)
    subprocess.run(
        [
            FFMPEG,
            "-y",
            "-i",
            mus_wav,
            "-af",
            "lowpass=f=2400,aecho=0.8:0.85:180:0.22",
            "-codec:a",
            "libmp3lame",
            "-qscale:a",
            "2",
            mus_mp3,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    os.remove(mus_wav)
    print("Generated studio-ambience.mp3 (24s) and studio-music.mp3 (32s).")


if __name__ == "__main__":
    asyncio.run(synthesize_segments())
    synthesize_studio_soundscape()

'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { PortfolioProject } from '@/lib/content/types';
import { siteConfigContent, withBasePath } from '@/lib/content';

export interface IntroWordTiming {
  word: string;
  start: number;
  end: number;
  viseme: 'open' | 'wide' | 'round' | 'neutral';
  segmentId: string;
}

export interface IntroSegmentTiming {
  id: string;
  file: string;
  text: string;
  start: number;
  end: number;
  duration: number;
  gesture: 'welcome' | 'emphasis' | 'showcase' | 'sweep' | 'invite';
}

export interface IntroTimingsManifest {
  voice: string;
  totalDuration: number;
  fullAudioUrl: string;
  segments: IntroSegmentTiming[];
  words: IntroWordTiming[];
}

export interface LiveSpeechFrameState {
  isSpeaking: boolean;
  amplitude: number;
  viseme: 'open' | 'wide' | 'round' | 'neutral';
  gesture: 'idle' | 'welcome' | 'emphasis' | 'showcase' | 'sweep' | 'invite';
  progress: number;
}

interface StudioExperienceContextValue {
  hasEnteredStudio: boolean;
  soundEnabled: boolean;
  isMuted: boolean;
  volume: number;
  isSpeaking: boolean;
  captionsEnabled: boolean;
  activeCaption: string;
  activeSegmentIndex: number;
  speechFrameRef: React.MutableRefObject<LiveSpeechFrameState>;
  enterStudio: (withSound: boolean) => void;
  toggleMute: () => void;
  setVolume: (val: number) => void;
  setCaptionsEnabled: (enabled: boolean) => void;
  replayIntro: () => void;
  playUiTick: () => void;
  activeProject: PortfolioProject | null;
  openProject: (project: PortfolioProject) => void;
  closeProject: () => void;
  selectedEnquiryService: string;
  selectServiceForEnquiry: (serviceName: string) => void;
}

const StudioExperienceContext = createContext<StudioExperienceContextValue | null>(null);

export function StudioExperienceProvider({ children }: { children: React.ReactNode }) {
  const [hasEnteredStudio, setHasEnteredStudio] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolumeState] = useState<number>(siteConfigContent.studio.defaultVolume || 0.8);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [activeCaption, setActiveCaption] = useState('');
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);
  const [activeProject, setActiveProject] = useState<PortfolioProject | null>(null);
  const [selectedEnquiryService, setSelectedEnquiryService] = useState<string>(
    siteConfigContent.enquiryServiceOptions[0] || 'Video Editing & Post-Production'
  );

  const timingsRef = useRef<IntroTimingsManifest | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambienceAudioRef = useRef<HTMLAudioElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceConnectedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const mutedSpeechTimerRef = useRef<number | null>(null);

  const speechFrameRef = useRef<LiveSpeechFrameState>({
    isSpeaking: false,
    amplitude: 0,
    viseme: 'neutral',
    gesture: 'idle',
    progress: 0,
  });

  const syncGainLevels = useCallback(
    (vol: number, muted: boolean, speakingNow: boolean) => {
      const effective = muted ? 0 : Math.max(0, Math.min(1, vol));
      if (voiceAudioRef.current) {
        voiceAudioRef.current.volume = effective;
        voiceAudioRef.current.muted = muted;
      }
      if (ambienceAudioRef.current) {
        ambienceAudioRef.current.volume = effective * siteConfigContent.studio.ambienceVolume;
        ambienceAudioRef.current.muted = muted;
      }
      if (musicAudioRef.current) {
        const targetMusic = speakingNow
          ? siteConfigContent.studio.musicVolumeDuringSpeech
          : siteConfigContent.studio.musicVolumeIdle;
        musicAudioRef.current.volume = effective * targetMusic;
        musicAudioRef.current.muted = muted;
      }
    },
    []
  );

  const stopRafLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startSpeechSyncLoop = useCallback(() => {
    stopRafLoop();
    const freqBins = new Uint8Array(64);

    const tick = () => {
      const voice = voiceAudioRef.current;
      const timings = timingsRef.current;

      if (!voice || voice.paused || voice.ended) {
        speechFrameRef.current = {
          isSpeaking: false,
          amplitude: 0,
          viseme: 'neutral',
          gesture: 'idle',
          progress: 0,
        };
        return;
      }

      const t = voice.currentTime;
      let amp = 0;

      if (analyserRef.current && !voice.muted) {
        analyserRef.current.getByteFrequencyData(freqBins);
        // Focus on human speech fundamental + formant bins
        let sum = 0;
        const count = Math.min(28, freqBins.length);
        for (let i = 1; i < count; i++) {
          sum += freqBins[i];
        }
        amp = Math.min(1, (sum / Math.max(1, count - 1)) / 135);
      }

      let currentViseme: LiveSpeechFrameState['viseme'] = 'neutral';
      let currentGesture: LiveSpeechFrameState['gesture'] = 'welcome';

      if (timings) {
        const segIdx = timings.segments.findIndex((s) => t >= s.start && t <= s.end + 0.15);
        if (segIdx !== -1) {
          const seg = timings.segments[segIdx];
          currentGesture = seg.gesture;
          setActiveSegmentIndex((prev) => (prev === segIdx ? prev : segIdx));
          setActiveCaption((prev) => (prev === seg.text ? prev : seg.text));
        }

        const wordMatch = timings.words.find((w) => t >= w.start && t <= w.end);
        if (wordMatch) {
          currentViseme = wordMatch.viseme;
          // Ensure jaw still articulates smoothly if Web Audio analyser returns 0 (e.g., restricted context)
          if (amp < 0.18) {
            const wordPhase = (t - wordMatch.start) / Math.max(0.05, wordMatch.end - wordMatch.start);
            amp = Math.max(amp, 0.35 + 0.45 * Math.sin(wordPhase * Math.PI));
          }
        }
      } else {
        amp = Math.max(amp, 0.4 * Math.abs(Math.sin(t * 9.5)));
      }

      speechFrameRef.current = {
        isSpeaking: true,
        amplitude: amp,
        viseme: currentViseme,
        gesture: currentGesture,
        progress: timings?.totalDuration ? Math.min(1, t / timings.totalDuration) : 0,
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [stopRafLoop]);

  const ensureAudioElements = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (!voiceAudioRef.current) {
      const v = new Audio(withBasePath('/audio/intro-full.mp3'));
      v.preload = 'auto';
      v.crossOrigin = 'anonymous';
      v.addEventListener('play', () => {
        setIsSpeaking(true);
        syncGainLevels(volume, isMuted, true);
        startSpeechSyncLoop();
      });
      const onFinish = () => {
        setIsSpeaking(false);
        setActiveSegmentIndex(-1);
        speechFrameRef.current = {
          isSpeaking: false,
          amplitude: 0,
          viseme: 'neutral',
          gesture: 'idle',
          progress: 1,
        };
        syncGainLevels(volume, isMuted, false);
        stopRafLoop();
      };
      v.addEventListener('ended', onFinish);
      v.addEventListener('pause', () => {
        if (v.currentTime === 0 || v.ended) onFinish();
      });
      voiceAudioRef.current = v;
    }

    if (!ambienceAudioRef.current) {
      const amb = new Audio(withBasePath('/audio/studio-ambience.mp3'));
      amb.loop = true;
      amb.preload = 'auto';
      ambienceAudioRef.current = amb;
    }

    if (!musicAudioRef.current) {
      const mus = new Audio(withBasePath('/audio/studio-music.mp3'));
      mus.loop = true;
      mus.preload = 'auto';
      musicAudioRef.current = mus;
    }

    if (!audioCtxRef.current && voiceAudioRef.current) {
      const AudioContextCtor =
        window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextCtor) {
        try {
          const ctx = new AudioContextCtor();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.72;
          if (!sourceConnectedRef.current) {
            const src = ctx.createMediaElementSource(voiceAudioRef.current);
            src.connect(analyser);
            analyser.connect(ctx.destination);
            sourceConnectedRef.current = true;
          }
          audioCtxRef.current = ctx;
          analyserRef.current = analyser;
        } catch {
          // Graceful fallback to HTML5 Audio element directly
        }
      }
    }
  }, [isMuted, startSpeechSyncLoop, stopRafLoop, syncGainLevels, volume]);

  const enterStudio = useCallback(
    (withSound: boolean) => {
      setHasEnteredStudio(true);
      setSoundEnabled(withSound);
      setIsMuted(!withSound);

      if (mutedSpeechTimerRef.current) {
        window.clearInterval(mutedSpeechTimerRef.current);
        mutedSpeechTimerRef.current = null;
      }

      if (withSound) {
        ensureAudioElements();
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => undefined);
        }
        syncGainLevels(volume, false, true);
        ambienceAudioRef.current?.play().catch(() => undefined);
        musicAudioRef.current?.play().catch(() => undefined);
        if (voiceAudioRef.current) {
          voiceAudioRef.current.currentTime = 0;
          const firstSeg = timingsRef.current?.segments[0]?.text || "Hi, I'm Dev.";
          setActiveCaption(firstSeg);
          setActiveSegmentIndex(0);
          voiceAudioRef.current.play().catch(() => undefined);
        }
      } else {
        // Muted studio entry: still display timed visual welcome captions & subtle gesture sequence without playing audio!
        const segments = timingsRef.current?.segments;
        if (segments && segments.length > 0) {
          let idx = 0;
          setIsSpeaking(true);
          setActiveCaption(segments[0].text);
          setActiveSegmentIndex(0);
          speechFrameRef.current = {
            isSpeaking: true,
            amplitude: 0.35,
            viseme: 'open',
            gesture: segments[0].gesture,
            progress: 0,
          };
          mutedSpeechTimerRef.current = window.setInterval(() => {
            idx += 1;
            if (idx >= segments.length) {
              if (mutedSpeechTimerRef.current) window.clearInterval(mutedSpeechTimerRef.current);
              mutedSpeechTimerRef.current = null;
              setIsSpeaking(false);
              setActiveSegmentIndex(-1);
              speechFrameRef.current = {
                isSpeaking: false,
                amplitude: 0,
                viseme: 'neutral',
                gesture: 'idle',
                progress: 1,
              };
            } else {
              setActiveCaption(segments[idx].text);
              setActiveSegmentIndex(idx);
              speechFrameRef.current.gesture = segments[idx].gesture;
            }
          }, 3600);
        }
      }
    },
    [ensureAudioElements, syncGainLevels, volume]
  );

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setSoundEnabled(!nextMuted);

    if (!nextMuted) {
      ensureAudioElements();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => undefined);
      }
      ambienceAudioRef.current?.play().catch(() => undefined);
      musicAudioRef.current?.play().catch(() => undefined);
    }
    syncGainLevels(volume, nextMuted, isSpeaking);
  }, [ensureAudioElements, isMuted, isSpeaking, syncGainLevels, volume]);

  const setVolume = useCallback(
    (val: number) => {
      const clamped = Math.max(0, Math.min(1, val));
      setVolumeState(clamped);
      const nextMuted = clamped === 0;
      if (isMuted && clamped > 0) {
        setIsMuted(false);
        setSoundEnabled(true);
        ensureAudioElements();
        ambienceAudioRef.current?.play().catch(() => undefined);
        musicAudioRef.current?.play().catch(() => undefined);
      }
      syncGainLevels(clamped, nextMuted, isSpeaking);
    },
    [ensureAudioElements, isMuted, isSpeaking, syncGainLevels]
  );

  const replayIntro = useCallback(() => {
    if (mutedSpeechTimerRef.current) {
      window.clearInterval(mutedSpeechTimerRef.current);
      mutedSpeechTimerRef.current = null;
    }
    ensureAudioElements();
    setIsMuted(false);
    setSoundEnabled(true);
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => undefined);
    }
    syncGainLevels(volume > 0 ? volume : 0.8, false, true);
    ambienceAudioRef.current?.play().catch(() => undefined);
    musicAudioRef.current?.play().catch(() => undefined);
    if (voiceAudioRef.current) {
      voiceAudioRef.current.currentTime = 0;
      const firstSeg = timingsRef.current?.segments[0]?.text || "Hi, I'm Dev.";
      setActiveCaption(firstSeg);
      setActiveSegmentIndex(0);
      voiceAudioRef.current.play().catch(() => undefined);
    }
  }, [ensureAudioElements, syncGainLevels, volume]);

  const playUiTick = useCallback(() => {
    if (isMuted || !audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.025 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // Ignore UI SFX error
    }
  }, [isMuted, volume]);

  // Pause background studio ambience when Cinema Video Player modal opens so audio never clashes!
  const openProject = useCallback((project: PortfolioProject) => {
    setActiveProject(project);
    if (voiceAudioRef.current && !voiceAudioRef.current.paused) {
      voiceAudioRef.current.pause();
    }
    if (musicAudioRef.current && !musicAudioRef.current.paused) {
      musicAudioRef.current.pause();
    }
  }, []);

  const closeProject = useCallback(() => {
    setActiveProject(null);
    if (!isMuted && hasEnteredStudio && musicAudioRef.current) {
      musicAudioRef.current.play().catch(() => undefined);
    }
  }, [hasEnteredStudio, isMuted]);

  const selectServiceForEnquiry = useCallback((serviceName: string) => {
    setSelectedEnquiryService(serviceName);
    if (typeof document !== 'undefined') {
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRafLoop();
      if (mutedSpeechTimerRef.current) window.clearInterval(mutedSpeechTimerRef.current);
      voiceAudioRef.current?.pause();
      ambienceAudioRef.current?.pause();
      musicAudioRef.current?.pause();
    };
  }, [stopRafLoop]);

  const value = useMemo<StudioExperienceContextValue>(
    () => ({
      hasEnteredStudio,
      soundEnabled,
      isMuted,
      volume,
      isSpeaking,
      captionsEnabled,
      activeCaption,
      activeSegmentIndex,
      speechFrameRef,
      enterStudio,
      toggleMute,
      setVolume,
      setCaptionsEnabled,
      replayIntro,
      playUiTick,
      activeProject,
      openProject,
      closeProject,
      selectedEnquiryService,
      selectServiceForEnquiry,
    }),
    [
      hasEnteredStudio,
      soundEnabled,
      isMuted,
      volume,
      isSpeaking,
      captionsEnabled,
      activeCaption,
      activeSegmentIndex,
      enterStudio,
      toggleMute,
      setVolume,
      replayIntro,
      playUiTick,
      activeProject,
      openProject,
      closeProject,
      selectedEnquiryService,
      selectServiceForEnquiry,
    ]
  );

  return (
    <StudioExperienceContext.Provider value={value}>{children}</StudioExperienceContext.Provider>
  );
}

export function useStudioExperience(): StudioExperienceContextValue {
  const ctx = useContext(StudioExperienceContext);
  if (!ctx) {
    throw new Error('useStudioExperience must be used inside <StudioExperienceProvider>');
  }
  return ctx;
}


import { useState, useEffect, useRef } from "react";
import { analyzeSoundCannon, analyzeVoiceToSkull, analyzeLaserModulation, type DetectionResult } from "@/utils/frequencyAnalysis";
import { emCountermeasure } from "@/utils/audioEffects";

const FFT_SIZE = 2048;
const PERSISTENCE_COUNT = 5; // Number of consecutive detections needed
const COOLDOWN_PERIOD = 10000; // 10 seconds between detections

export function useAudioAnalyzer() {
  const [error, setError] = useState<string>();
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [timeData, setTimeData] = useState<Float32Array | null>(null);
  const [volume, setVolume] = useState(0);
  const [soundCannonResult, setSoundCannonResult] = useState<DetectionResult | null>(null);
  const [voiceToSkullResult, setVoiceToSkullResult] = useState<DetectionResult | null>(null);
  const [laserModulationResult, setLaserModulationResult] = useState<DetectionResult | null>(null);
  const [isCountermeasureActive, setIsCountermeasureActive] = useState(false);

  const audioContextRef = useRef<AudioContext>();
  const analyzerRef = useRef<AnalyserNode>();
  const sourceRef = useRef<MediaStreamAudioSourceNode>();
  const animationFrameRef = useRef<number>();

  // Detection persistence counters
  const v2kPersistenceRef = useRef(0);
  const soundCannonPersistenceRef = useRef(0);
  const laserPersistenceRef = useRef(0);

  // Last detection timestamps
  const lastV2KDetectionRef = useRef<number>(0);
  const lastSoundCannonDetectionRef = useRef<number>(0);
  const lastLaserDetectionRef = useRef<number>(0);

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    emCountermeasure.stop();
    sourceRef.current = undefined;
    analyzerRef.current = undefined;
    audioContextRef.current = undefined;
  };

  useEffect(() => {
    return cleanup;
  }, []);

  // Handle threat detection and countermeasures
  useEffect(() => {
    const now = Date.now();

    // V2K Detection
    if (voiceToSkullResult?.detected) {
      v2kPersistenceRef.current++;
      if (v2kPersistenceRef.current >= PERSISTENCE_COUNT && !isCountermeasureActive) {
        if (now - lastV2KDetectionRef.current > COOLDOWN_PERIOD) {
          setIsCountermeasureActive(true);
          lastV2KDetectionRef.current = now;
          emCountermeasure.initialize(voiceToSkullResult.frequency, 'v2k').then(() => {
            setTimeout(() => {
              emCountermeasure.stop();
              setIsCountermeasureActive(false);
            }, 5000);
          });
        }
      }
    } else {
      v2kPersistenceRef.current = 0;
    }

    // Sound Cannon Detection
    if (soundCannonResult?.detected) {
      soundCannonPersistenceRef.current++;
      if (soundCannonPersistenceRef.current >= PERSISTENCE_COUNT && !isCountermeasureActive) {
        if (now - lastSoundCannonDetectionRef.current > COOLDOWN_PERIOD) {
          setIsCountermeasureActive(true);
          lastSoundCannonDetectionRef.current = now;
          emCountermeasure.initialize(soundCannonResult.frequency, 'soundcannon').then(() => {
            setTimeout(() => {
              emCountermeasure.stop();
              setIsCountermeasureActive(false);
            }, 5000);
          });
        }
      }
    } else {
      soundCannonPersistenceRef.current = 0;
    }

    // Laser Modulation Detection
    if (laserModulationResult?.detected) {
      laserPersistenceRef.current++;
      if (laserPersistenceRef.current >= PERSISTENCE_COUNT && !isCountermeasureActive) {
        if (now - lastLaserDetectionRef.current > COOLDOWN_PERIOD) {
          setIsCountermeasureActive(true);
          lastLaserDetectionRef.current = now;
          emCountermeasure.initialize(laserModulationResult.frequency, 'v2k').then(() => {
            setTimeout(() => {
              emCountermeasure.stop();
              setIsCountermeasureActive(false);
            }, 5000);
          });
        }
      }
    } else {
      laserPersistenceRef.current = 0;
    }
  }, [voiceToSkullResult?.detected, soundCannonResult?.detected, laserModulationResult?.detected]);

  const startAnalyzing = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = new AudioContext();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

      analyzerRef.current.fftSize = FFT_SIZE;
      sourceRef.current.connect(analyzerRef.current);

      const analyze = () => {
        if (!analyzerRef.current) return;

        const frequencyArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
        const timeArray = new Float32Array(analyzerRef.current.frequencyBinCount);

        analyzerRef.current.getByteFrequencyData(frequencyArray);
        analyzerRef.current.getFloatTimeDomainData(timeArray);

        // Calculate RMS volume
        let sum = 0;
        for (let i = 0; i < timeArray.length; i++) {
          sum += timeArray[i] * timeArray[i];
        }
        const rms = Math.sqrt(sum / timeArray.length);

        // Analyze for specific frequency patterns
        const sampleRate = audioContextRef.current!.sampleRate;
        const soundCannon = analyzeSoundCannon(frequencyArray, sampleRate);
        const voiceToSkull = analyzeVoiceToSkull(frequencyArray, sampleRate);
        const laserModulation = analyzeLaserModulation(frequencyArray, sampleRate);

        setFrequencyData(frequencyArray);
        setTimeData(timeArray);
        setVolume(rms);
        setSoundCannonResult(soundCannon);
        setVoiceToSkullResult(voiceToSkull);
        setLaserModulationResult(laserModulation);

        animationFrameRef.current = requestAnimationFrame(analyze);
      };

      analyze();
      setError(undefined);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to access microphone");
      cleanup();
      return false;
    }
  };

  const stopAnalyzing = () => {
    cleanup();
    setFrequencyData(null);
    setTimeData(null);
    setVolume(0);
    setSoundCannonResult(null);
    setVoiceToSkullResult(null);
    setLaserModulationResult(null);
    setError(undefined);
  };

  return {
    frequencyData,
    timeData,
    volume,
    error,
    soundCannonResult,
    voiceToSkullResult,
    laserModulationResult,
    isCountermeasureActive,
    startAnalyzing,
    stopAnalyzing
  };
}
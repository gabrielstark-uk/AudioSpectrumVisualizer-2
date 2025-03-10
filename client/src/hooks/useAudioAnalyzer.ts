import { useState, useEffect, useRef } from "react";
import { analyzeSoundCannon, analyzeVoiceToSkull, analyzeLaserModulation, detectAgeSpectrumFrequencies, type DetectionResult } from "@/utils/frequencyAnalysis";
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
  const [rfChipResult, setRfChipResult] = useState<DetectionResult | null>(null); // Added RF chip detection state
  const [isCountermeasureActive, setIsCountermeasureActive] = useState(false);

  const audioContextRef = useRef<AudioContext>();
  const analyzerRef = useRef<AnalyserNode>();
  const sourceRef = useRef<MediaStreamAudioSourceNode>();
  const animationFrameRef = useRef<number>();

  // Persistence counters
  const soundCannonPersistenceRef = useRef(0);
  const v2kPersistenceRef = useRef(0);
  const laserPersistenceRef = useRef(0);
  const rfChipPersistenceRef = useRef(0); // Added RF chip persistence counter

  // Last detection times
  const lastSoundCannonDetectionRef = useRef<number>(0);
  const lastV2KDetectionRef = useRef<number>(0);
  const lastLaserDetectionRef = useRef<number>(0);
  const lastRfChipDetectionRef = useRef<number>(0); // Added RF chip last detection time

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

          // Get the age spectrum frequencies when initializing countermeasure
          const ageSpectrum = detectAgeSpectrumFrequencies(frequencyData!, audioContextRef.current!.sampleRate);

          emCountermeasure.initialize(
            voiceToSkullResult.frequency,
            'v2k',
            ageSpectrum.detected ? ageSpectrum.frequencies : undefined
          ).then(() => {
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

          // Get the age spectrum frequencies when initializing countermeasure
          const ageSpectrum = detectAgeSpectrumFrequencies(frequencyData!, audioContextRef.current!.sampleRate);

          emCountermeasure.initialize(
            soundCannonResult.frequency,
            'soundcannon',
            ageSpectrum.detected ? ageSpectrum.frequencies : undefined
          ).then(() => {
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

          // Get the age spectrum frequencies when initializing countermeasure
          const ageSpectrum = detectAgeSpectrumFrequencies(frequencyData!, audioContextRef.current!.sampleRate);

          emCountermeasure.initialize(
            laserModulationResult.frequency,
            'laser',
            ageSpectrum.detected ? ageSpectrum.frequencies : undefined
          ).then(() => {
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

    // RF Chip Detection (Placeholder)
    if (rfChipResult?.detected) {
      rfChipPersistenceRef.current++;
      if (rfChipPersistenceRef.current >= PERSISTENCE_COUNT && !isCountermeasureActive) {
        if (now - lastRfChipDetectionRef.current > COOLDOWN_PERIOD) {
          // Placeholder for RF chip reporting to law enforcement
          console.log("RF chip detected! Reporting to law enforcement...");
          lastRfChipDetectionRef.current = now;
        }
      }
    } else {
      rfChipPersistenceRef.current = 0;
    }
  }, [voiceToSkullResult?.detected, soundCannonResult?.detected, laserModulationResult?.detected, rfChipResult?.detected, frequencyData]);

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

        // ML-powered RF chip detection (async)
        detectRFChipSignal(frequencyArray, audioContextRef.current.sampleRate)
          .then(rfChip => {
            if (rfChip) {
              setRfChipResult(rfChip);
            }
          })
          .catch(err => console.error('RF detection error:', err));

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
    setRfChipResult(null); // Reset RF chip result
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
    rfChipResult, // Added RF chip result to return value
    isCountermeasureActive,
    startAnalyzing,
    stopAnalyzing
  };
}

// Placeholder function -  needs a proper implementation based on RF chip detection logic.
const detectRFChipSignal = async (frequencyData: Uint8Array, sampleRate: number): Promise<DetectionResult | null> => {
  // Replace this with actual RF chip detection algorithm using machine learning
  // This is a placeholder, returning a random result for demonstration purposes only.  This should be replaced with a real ML model.
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async operation
  return Math.random() < 0.05 ? { detected: true, frequency: Math.random() * 10000 } : null;
};
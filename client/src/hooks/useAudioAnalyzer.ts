import { useState, useEffect, useRef } from "react";
import { analyzeSoundCannon, analyzeVoiceToSkull, type DetectionResult } from "@/utils/frequencyAnalysis";
import { emCountermeasure } from "@/utils/audioEffects";

const FFT_SIZE = 2048;

export function useAudioAnalyzer() {
  const [error, setError] = useState<string>();
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [timeData, setTimeData] = useState<Float32Array | null>(null);
  const [volume, setVolume] = useState(0);
  const [soundCannonResult, setSoundCannonResult] = useState<DetectionResult | null>(null);
  const [voiceToSkullResult, setVoiceToSkullResult] = useState<DetectionResult | null>(null);
  const [isCountermeasureActive, setIsCountermeasureActive] = useState(false);

  const audioContextRef = useRef<AudioContext>();
  const analyzerRef = useRef<AnalyserNode>();
  const sourceRef = useRef<MediaStreamAudioSourceNode>();
  const animationFrameRef = useRef<number>();
  const lastV2KDetectionRef = useRef<number>(0);
  const lastSoundCannonDetectionRef = useRef<number>(0);

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

  // Handle V2K and Sound Cannon detection and countermeasure
  useEffect(() => {
    const now = Date.now();

    // Handle V2K Detection
    if (voiceToSkullResult?.detected && !isCountermeasureActive) {
      // Only trigger countermeasure once every 10 seconds
      if (now - lastV2KDetectionRef.current > 10000) {
        setIsCountermeasureActive(true);
        lastV2KDetectionRef.current = now;
        // Initialize the EM countermeasure with the detected frequency
        emCountermeasure.initialize(voiceToSkullResult.frequency, 'v2k').then(() => {
          // Keep the countermeasure active for 5 seconds
          setTimeout(() => {
            emCountermeasure.stop();
            setIsCountermeasureActive(false);
          }, 5000);
        });
      }
    }

    // Handle Sound Cannon Detection
    if (soundCannonResult?.detected && !isCountermeasureActive) {
      // Only trigger countermeasure once every 10 seconds
      if (now - lastSoundCannonDetectionRef.current > 10000) {
        setIsCountermeasureActive(true);
        lastSoundCannonDetectionRef.current = now;
        // Initialize the EM countermeasure with the detected frequency
        emCountermeasure.initialize(soundCannonResult.frequency, 'soundcannon').then(() => {
          // Keep the countermeasure active for 5 seconds
          setTimeout(() => {
            emCountermeasure.stop();
            setIsCountermeasureActive(false);
          }, 5000);
        });
      }
    }
  }, [voiceToSkullResult?.detected, soundCannonResult?.detected]);

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

        // Calculate volume
        let sum = 0;
        for (let i = 0; i < timeArray.length; i++) {
          sum += timeArray[i] * timeArray[i];
        }
        const rms = Math.sqrt(sum / timeArray.length);

        // Analyze for specific frequency patterns
        const sampleRate = audioContextRef.current!.sampleRate;
        const soundCannon = analyzeSoundCannon(frequencyArray, sampleRate);
        const voiceToSkull = analyzeVoiceToSkull(frequencyArray, sampleRate);

        setFrequencyData(frequencyArray);
        setTimeData(timeArray);
        setVolume(rms);
        setSoundCannonResult(soundCannon);
        setVoiceToSkullResult(voiceToSkull);

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
    setError(undefined);
  };

  return {
    frequencyData,
    timeData,
    volume,
    error,
    soundCannonResult,
    voiceToSkullResult,
    isCountermeasureActive,
    startAnalyzing,
    stopAnalyzing
  };
}
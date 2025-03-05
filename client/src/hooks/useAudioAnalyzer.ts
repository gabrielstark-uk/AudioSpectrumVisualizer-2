import { useState, useEffect, useRef } from "react";

const FFT_SIZE = 2048;

export function useAudioAnalyzer() {
  const [error, setError] = useState<string>();
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [timeData, setTimeData] = useState<Float32Array | null>(null);
  const [volume, setVolume] = useState(0);

  const audioContextRef = useRef<AudioContext>();
  const analyzerRef = useRef<AnalyserNode>();
  const sourceRef = useRef<MediaStreamAudioSourceNode>();
  const animationFrameRef = useRef<number>();

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
    sourceRef.current = undefined;
    analyzerRef.current = undefined;
    audioContextRef.current = undefined;
  };

  useEffect(() => {
    return cleanup;
  }, []);

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
        for (const amplitude of timeArray) {
          sum += amplitude * amplitude;
        }
        const rms = Math.sqrt(sum / timeArray.length);

        setFrequencyData(frequencyArray);
        setTimeData(timeArray);
        setVolume(rms);

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
    setError(undefined);
  };

  return {
    frequencyData,
    timeData,
    volume,
    error,
    startAnalyzing,
    stopAnalyzing
  };
}

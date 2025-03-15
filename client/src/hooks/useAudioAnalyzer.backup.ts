import { useState, useRef, useEffect } from "react";

export const useAudioAnalyzer = () => {
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [timeData, setTimeData] = useState<Float32Array | null>(null);
  const [volume, setVolume] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const analyzeAudio = () => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const analyzer = analyserRef.current;

    // Get frequency data
    const frequencyBufferLength = analyzer.frequencyBinCount;
    const frequencyDataArray = new Uint8Array(frequencyBufferLength);
    analyzer.getByteFrequencyData(frequencyDataArray);
    setFrequencyData(frequencyDataArray);

    // Get time domain data
    const timeBufferLength = analyzer.fftSize;
    const timeDataArray = new Float32Array(timeBufferLength);
    analyzer.getFloatTimeDomainData(timeDataArray);
    setTimeData(timeDataArray);

    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < timeDataArray.length; i++) {
      sum += timeDataArray[i] * timeDataArray[i];
    }
    const rms = Math.sqrt(sum / timeDataArray.length);
    setVolume(rms);

    // Schedule next frame
    rafIdRef.current = requestAnimationFrame(analyzeAudio);
  };

  const startAnalyzing = async (): Promise<boolean> => {
    try {
      // Reset error state
      setError(null);

      // Stop any existing audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }

      // Create new audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create analyzer node
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserRef.current = analyserNode;

      // Create source from microphone
      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode);
      sourceRef.current = sourceNode;

      // Start animation loop
      analyzeAudio();

      return true;
    } catch (err: any) {
      console.error("Error starting analyzer:", err);
      setError(err?.message || "Could not access microphone");
      return false;
    }
  };

  const stopAnalyzing = () => {
    // Cancel animation frame
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Disconnect and close audio nodes
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    // Reset analyzer
    analyserRef.current = null;
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      stopAnalyzing();
    };
  }, []);

  return {
    frequencyData,
    timeData,
    volume,
    startAnalyzing,
    stopAnalyzing,
    error
  };
};

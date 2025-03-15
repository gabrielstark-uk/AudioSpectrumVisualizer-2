import { useState, useRef, useCallback, useEffect } from 'react';
import { DetectionResult } from '../utils/frequencyAnalysis';

export function useAudioAnalyzer() {
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [timeData, setTimeData] = useState<Float32Array | null>(null);
  const [volume, setVolume] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Detection results
  const [soundCannonResult, setSoundCannonResult] = useState<DetectionResult | null>(null);
  const [voiceToSkullResult, setVoiceToSkullResult] = useState<DetectionResult | null>(null);
  const [laserModulationResult, setLaserModulationResult] = useState<DetectionResult | null>(null);
  const [rfChipResult, setRfChipResult] = useState<DetectionResult | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const effectsProcessorRef = useRef<AudioWorkletNode | null>(null);

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

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

    // Simulate detection results
    simulateDetections(frequencyDataArray, timeDataArray);

    // Schedule next frame
    rafIdRef.current = requestAnimationFrame(analyzeAudio);
  }, []);

  const simulateDetections = (frequencyData: Uint8Array, timeData: Float32Array) => {
    // This is a simplified simulation of detection
    // In a real app, this would use actual detection algorithms
    
    // Get the dominant frequency
    let maxBin = 0;
    let maxValue = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i];
        maxBin = i;
      }
    }
    
    // Convert bin to frequency (assuming 44.1kHz sample rate)
    const sampleRate = 44100;
    const binWidth = sampleRate / (frequencyData.length * 2);
    const dominantFreq = maxBin * binWidth;
    
    // Calculate signal strength
    const signalStrength = maxValue / 255;
    
    // Only show detections if signal is strong enough
    if (signalStrength > 0.3) {
      // Sound cannon (147-153 Hz)
      if (dominantFreq >= 147 && dominantFreq <= 153) {
        setSoundCannonResult({
          detected: true,
          frequency: dominantFreq,
          confidence: Math.min(1, signalStrength * 1.5),
          signalStrength,
          pattern: 'continuous'
        });
      } else {
        setSoundCannonResult(null);
      }
      
      // Voice to skull (2100-2200 Hz)
      if (dominantFreq >= 2100 && dominantFreq <= 2200) {
        setVoiceToSkullResult({
          detected: true,
          frequency: dominantFreq,
          confidence: Math.min(1, signalStrength * 1.5),
          signalStrength,
          pattern: 'modulated'
        });
      } else {
        setVoiceToSkullResult(null);
      }
      
      // Laser modulation (16000-20000 Hz)
      if (dominantFreq >= 16000 && dominantFreq <= 20000) {
        setLaserModulationResult({
          detected: true,
          frequency: dominantFreq,
          confidence: Math.min(1, signalStrength * 1.5),
          signalStrength,
          pattern: 'pulsed'
        });
      } else {
        setLaserModulationResult(null);
      }
      
      // RF Chip (random simulation)
      if (Math.random() < 0.01) { // 1% chance of detection
        setRfChipResult({
          detected: true,
          frequency: 13560000, // 13.56 MHz (common RFID frequency)
          confidence: 0.85 + (Math.random() * 0.15),
          signalStrength: 0.7 + (Math.random() * 0.3),
          pattern: 'pulsed'
        });
      } else if (rfChipResult) {
        // Gradually fade out the detection
        if (rfChipResult.confidence > 0.1) {
          setRfChipResult({
            ...rfChipResult,
            confidence: rfChipResult.confidence * 0.95
          });
        } else {
          setRfChipResult(null);
        }
      }
    } else {
      // Reset detections if signal is weak
      setSoundCannonResult(null);
      setVoiceToSkullResult(null);
      setLaserModulationResult(null);
      // Keep RF chip detection as it has its own fade-out logic
    }
  };

  const startAnalyzing = useCallback(async (): Promise<boolean> => {
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

      // Initialize and connect audio effects processor
      try {
        // Try different paths for the worklet to handle various deployment scenarios
        try {
          await audioContext.audioWorklet.addModule('/worklets/audioEffectsProcessor.js');
        } catch (e) {
          // If the first path fails, try a relative path
          console.log("First worklet path failed, trying alternative path");
          await audioContext.audioWorklet.addModule('./worklets/audioEffectsProcessor.js');
        }

        const effectsProcessor = new AudioWorkletNode(audioContext, 'audio-effects-processor');
        effectsProcessorRef.current = effectsProcessor;

        // Connect nodes: source -> effects -> analyzer
        sourceNode.connect(effectsProcessor);
        effectsProcessor.connect(analyserNode);
      } catch (workletError) {
        console.error("Could not load audio worklet, falling back to direct connection:", workletError);
        // Fallback: connect source directly to analyzer if worklet fails
        sourceNode.connect(analyserNode);
      }

      sourceRef.current = sourceNode;

      // Initialize RF chip detector
      // Note: rfChipDetectorRef is not defined, so we're removing this code
      // If you need RF chip detection, you would need to implement it properly

      // Start animation loop
      analyzeAudio();

      return true;
    } catch (err: any) {
      console.error("Error starting analyzer:", err);
      setError(err?.message || "Could not access microphone");
      return false;
    }
  }, [analyzeAudio]);

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

    // Reset detection results
    setSoundCannonResult(null);
    setVoiceToSkullResult(null);
    setLaserModulationResult(null);
    setRfChipResult(null);
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      stopAnalyzing();
    };
  }, []);

  const setEffectParameter = (effect: string, param: string, value: number) => {
    if (effectsProcessorRef.current) {
      effectsProcessorRef.current.port.postMessage({
        effect,
        params: { [param]: value }
      });
    }
  };

  return {
    frequencyData,
    timeData,
    volume,
    soundCannonResult,
    voiceToSkullResult,
    laserModulationResult,
    rfChipResult,
    startAnalyzing,
    stopAnalyzing,
    setEffectParameter,
    error
  };
};

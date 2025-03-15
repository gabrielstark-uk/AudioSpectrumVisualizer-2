import { useState, useRef, useEffect } from "react";
import { detectSoundCannon } from "@/utils/soundCannonDetector";
import { detectVoiceToSkull } from "@/utils/voiceToSkullDetector";
import { detectLaserModulation } from "@/utils/laserModulationDetector";
import { DetectionResult } from "@/utils/frequencyAnalysis";
import RFChipDetector from "@/utils/rfMlScanner";
import { deactivateRFChip } from "@/utils/rfChipDeactivator";
import aiThreatDetector from "@/utils/aiThreatDetector";
import { emCountermeasure } from "@/utils/audioEffects";



export const useAudioAnalyzer = () => {
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
  const rfChipDetectorRef = useRef(new RFChipDetector());

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

    // Run detection algorithms
    try {
      const sampleRate = audioContextRef.current?.sampleRate || 44100;

      const detectAndUpdate = async () => {
        const soundCannonDetection = detectSoundCannon(frequencyDataArray, timeDataArray);
        const voiceToSkullDetection = detectVoiceToSkull(frequencyDataArray, timeDataArray);
        const laserModulationDetection = detectLaserModulation(frequencyDataArray, timeDataArray);
        const rfChipDetection = await detectRFChipSignal(frequencyDataArray, sampleRate);

        // AI Threat Analysis
        const allDetections = [
          soundCannonDetection,
          voiceToSkullDetection,
          laserModulationDetection,
          rfChipDetection
        ].filter(d => d !== null) as DetectionResult[];

        for (const detection of allDetections) {
          if (detection.confidence > 0.7) {
            await aiThreatDetector.analyzeThreat(detection);
          }
        }

        setSoundCannonResult(soundCannonDetection);
        setVoiceToSkullResult(voiceToSkullDetection);
        setLaserModulationResult(laserModulationDetection);
        setRfChipResult(rfChipDetection);
      };

      detectAndUpdate();
    } catch (err) {
      console.error("Detection error:", err);
    }

    // Schedule next frame
    rafIdRef.current = requestAnimationFrame(analyzeAudio);
  };

  const detectRFChipSignal = async (frequencyData: Uint8Array, sampleRate: number): Promise<DetectionResult | null> => {
    if (!rfChipDetectorRef.current) return null;
    
    const detection = await rfChipDetectorRef.current.detect(frequencyData, sampleRate);
    
    if (!detection.detected) return null;
    
    return {
      detected: true,
      frequency: detection.frequency,
      confidence: detection.confidence,
      signalStrength: detection.signalStrength,
      pattern: detection.pattern
    };
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

      // Initialize RF chip detector
      await rfChipDetectorRef.current.initialize();

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
    error
  };
};

import { useState, useEffect, useRef } from 'react';
import FrequencySpectrum from './FrequencySpectrum';
import WaveformVisualizer from './WaveformVisualizer';
import VolumeIndicator from './VolumeIndicator';
import DetectionDisplay from './DetectionDisplay';
import './AudioAnalyzer.css';

function AudioAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frequencyData, setFrequencyData] = useState(null);
  const [timeData, setTimeData] = useState(null);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState(null);
  
  // Detection results
  const [soundCannonResult, setSoundCannonResult] = useState(null);
  const [voiceToSkullResult, setVoiceToSkullResult] = useState(null);
  const [laserModulationResult, setLaserModulationResult] = useState(null);
  const [rfChipResult, setRfChipResult] = useState(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const rafIdRef = useRef(null);

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

    // Simulate detection results
    simulateDetections(frequencyDataArray, timeDataArray);

    // Schedule next frame
    rafIdRef.current = requestAnimationFrame(analyzeAudio);
  };

  const simulateDetections = (frequencyData, timeData) => {
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
    const dominantFreq = maxBin * sampleRate / (frequencyData.length * 2);
    
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

  const startAnalyzing = async () => {
    try {
      // Reset error state
      setError(null);

      // Stop any existing audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }

      // Create new audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
    } catch (err) {
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

  const toggleAnalyzing = async () => {
    if (isAnalyzing) {
      stopAnalyzing();
      setIsAnalyzing(false);
    } else {
      const success = await startAnalyzing();
      if (success) {
        setIsAnalyzing(true);
      }
    }
  };

  return (
    <div className="audio-analyzer">
      <div className="controls">
        <button 
          className={`btn ${isAnalyzing ? 'btn-danger' : 'btn-primary'}`}
          onClick={toggleAnalyzing}
        >
          {isAnalyzing ? 'Stop' : 'Start'}
        </button>
        {error && (
          <p className="error-message">{error}</p>
        )}
      </div>

      <DetectionDisplay
        soundCannonResult={soundCannonResult}
        voiceToSkullResult={voiceToSkullResult}
        laserModulationResult={laserModulationResult}
        rfChipResult={rfChipResult}
        isActive={isAnalyzing}
      />

      <div className="grid grid-2">
        <div className="card">
          <h2 className="card-title">Frequency Spectrum</h2>
          <FrequencySpectrum data={frequencyData} isActive={isAnalyzing} />
        </div>

        <div className="card">
          <h2 className="card-title">Waveform</h2>
          <WaveformVisualizer data={timeData} isActive={isAnalyzing} />
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Volume Level</h2>
        <VolumeIndicator volume={volume} isActive={isAnalyzing} />
      </div>
    </div>
  );
}

export default AudioAnalyzer;
import { z } from "zod";
import { handleHarmfulFrequency } from "./frequencyShutdown";

export interface DetectionResult {
  detected: boolean;
  confidence: number;
  frequency: number;
  signalStrength: number;
  pattern: 'continuous' | 'pulsed' | 'modulated' | 'none';
}

// Advanced signal processing parameters
const FFT_OVERLAP = 0.75; // 75% overlap for better resolution
const DETECTION_THRESHOLD = 0.75; // Increased threshold for higher precision
const NOISE_FLOOR = -90; // dB

// Precise frequency ranges for detection (in Hz)
const SOUND_CANNON_RANGE = {
  min: 147,
  max: 153,  // Narrowed range for sound cannon frequencies
  subBands: [
    { min: 147, max: 149, weight: 0.8 },
    { min: 149, max: 151, weight: 1.0 }, // Primary frequency band
    { min: 151, max: 153, weight: 0.8 }
  ]
};

const VOICE_TO_SKULL_RANGE = {
  min: 2100,
  max: 2200, // Specific V2K range
  subBands: [
    { min: 2100, max: 2133, weight: 0.7 },
    { min: 2133, max: 2166, weight: 1.0 }, // Primary frequency band
    { min: 2166, max: 2200, weight: 0.7 }
  ]
};

const LASER_MODULATION_RANGE = {
  min: 16000,
  max: 20000,
  subBands: [
    { min: 16000, max: 17500, weight: 0.8 },
    { min: 17500, max: 18500, weight: 1.0 }, // Primary frequency band
    { min: 18500, max: 20000, weight: 0.8 }
  ]
};

// Pattern matching parameters
const PATTERN_CONFIDENCE_THRESHOLD = 0.85;
const MIN_AMPLITUDE_THRESHOLD = 0.4;
const PERSISTENCE_THRESHOLD = 5; // Number of consecutive detections needed

function calculateSignalStrength(magnitude: number, noiseFloor: number): number {
  return Math.max(0, (20 * Math.log10(magnitude) - noiseFloor) / -noiseFloor);
}

function detectSignalPattern(data: Uint8Array, startBin: number, endBin: number): 'continuous' | 'pulsed' | 'modulated' | 'none' {
  const samples = data.slice(startBin, endBin);
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;

  if (mean < MIN_AMPLITUDE_THRESHOLD * 255) return 'none';

  // Calculate zero crossings and peaks for pattern analysis
  let zeroCrossings = 0;
  let peaks = 0;
  let lastValue = samples[0];
  let lastDirection = 0;

  for (let i = 1; i < samples.length; i++) {
    // Zero crossing detection
    if ((samples[i] > mean && lastValue <= mean) || 
        (samples[i] < mean && lastValue >= mean)) {
      zeroCrossings++;
    }

    // Peak detection
    const direction = samples[i] - lastValue;
    if (direction * lastDirection < 0 && Math.abs(samples[i] - mean) > variance/4) {
      peaks++;
    }

    lastValue = samples[i];
    lastDirection = direction !== 0 ? direction : lastDirection;
  }

  // Pattern classification based on signal characteristics
  if (zeroCrossings < 3 && peaks < 2) return 'continuous';
  if (peaks >= 2 && peaks <= 5) return 'pulsed';
  if (zeroCrossings > 5) return 'modulated';
  return 'none';
}

function analyzeFrequencyBand(
  frequencyData: Uint8Array,
  sampleRate: number,
  range: typeof SOUND_CANNON_RANGE | typeof VOICE_TO_SKULL_RANGE | typeof LASER_MODULATION_RANGE
): DetectionResult {
  const binSize = sampleRate / (frequencyData.length * 2);
  let maxAmplitude = 0;
  let peakFrequency = 0;
  let weightedEnergy = 0;
  let totalWeight = 0;

  // Analyze each sub-band with weighted importance
  for (const band of range.subBands) {
    const bandStart = Math.floor(band.min / binSize);
    const bandEnd = Math.ceil(band.max / binSize);
    let bandMax = 0;
    let bandPeak = 0;

    for (let i = bandStart; i <= bandEnd; i++) {
      const amplitude = frequencyData[i];
      if (amplitude > bandMax) {
        bandMax = amplitude;
        bandPeak = i * binSize;
      }
      weightedEnergy += (amplitude * amplitude * band.weight);
    }

    totalWeight += band.weight;
    if (bandMax > maxAmplitude) {
      maxAmplitude = bandMax;
      peakFrequency = bandPeak;
    }
  }

  const normalizedEnergy = weightedEnergy / (totalWeight * 255 * 255);
  const signalStrength = calculateSignalStrength(maxAmplitude / 255, NOISE_FLOOR);
  const pattern = detectSignalPattern(
    frequencyData,
    Math.floor(range.min / binSize),
    Math.ceil(range.max / binSize)
  );

  // Combined confidence calculation using multiple factors
  const energyConfidence = Math.min(1, normalizedEnergy * 2);
  const patternConfidence = pattern === 'none' ? 0 : 
                           pattern === 'continuous' ? 0.8 :
                           pattern === 'pulsed' ? 1 : 0.9;

  const confidence = Math.min(1, (
    energyConfidence * 0.5 +
    signalStrength * 0.3 +
    patternConfidence * 0.2
  ));

  return {
    detected: confidence > PATTERN_CONFIDENCE_THRESHOLD,
    confidence,
    frequency: peakFrequency,
    signalStrength,
    pattern
  };
}

export function analyzeSoundCannon(frequencyData: Uint8Array, sampleRate: number): DetectionResult {
  const result = analyzeFrequencyBand(frequencyData, sampleRate, SOUND_CANNON_RANGE);
  if (result.detected) {
    handleHarmfulFrequency(result);
  }
  return result;
}

export function analyzeVoiceToSkull(frequencyData: Uint8Array, sampleRate: number): DetectionResult {
  const result = analyzeFrequencyBand(frequencyData, sampleRate, VOICE_TO_SKULL_RANGE);
  if (result.detected) {
    handleHarmfulFrequency(result);
  }
  return result;
}

export function analyzeLaserModulation(frequencyData: Uint8Array, sampleRate: number): DetectionResult {
  const result = analyzeFrequencyBand(frequencyData, sampleRate, LASER_MODULATION_RANGE);
  if (result.detected) {
    handleHarmfulFrequency(result);
  }
  return result;
}

// Detect age-specific harmful frequencies
export function detectAgeSpectrumFrequencies(frequencyData: Uint8Array, sampleRate: number): { 
  detected: boolean;
  ranges: ('youth' | 'adult' | 'elderly')[];
  frequencies: number[];
} {
  const binSize = sampleRate / (frequencyData.length * 2);
  const detectedRanges: ('youth' | 'adult' | 'elderly')[] = [];
  const detectedFrequencies: number[] = [];

  Object.entries(AGE_SPECTRUM_RANGES).forEach(([range, { min, max }]) => {
    const startBin = Math.floor(min / binSize);
    const endBin = Math.ceil(max / binSize);

    let maxAmplitude = 0;
    let peakFrequency = 0;

    for (let i = startBin; i <= endBin; i++) {
      if (frequencyData[i] > maxAmplitude) {
        maxAmplitude = frequencyData[i];
        peakFrequency = i * binSize;
      }
    }

    if (maxAmplitude / 255 > DETECTION_THRESHOLD) {
      detectedRanges.push(range as 'youth' | 'adult' | 'elderly');
      detectedFrequencies.push(peakFrequency);
    }
  });

  return {
    detected: detectedRanges.length > 0,
    ranges: detectedRanges,
    frequencies: detectedFrequencies
  };
}

const AGE_SPECTRUM_RANGES = {
  youth: { min: 17000, max: 20000 }, // Higher frequency range more audible to younger people
  adult: { min: 12000, max: 16000 }, // Mid-range frequencies
  elderly: { min: 8000, max: 11000 }  // Lower frequencies more concerning for elderly
};
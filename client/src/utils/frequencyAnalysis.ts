export interface DetectionResult {
  detected: boolean;
  confidence: number;
  frequency: number;
  signalStrength: number;
  pattern: 'continuous' | 'pulsed' | 'modulated' | 'none';
}

// Advanced signal processing parameters
const FFT_OVERLAP = 0.75; // 75% overlap for better resolution
const DETECTION_THRESHOLD = 0.45; // Lower threshold for higher sensitivity
const NOISE_FLOOR = -90; // dB

// Enhanced frequency ranges for detection (in Hz)
const SOUND_CANNON_RANGE = {
  min: 144,
  max: 156,
  subBands: [
    { min: 144, max: 148 },
    { min: 148, max: 152 },
    { min: 152, max: 156 }
  ]
};

const VOICE_TO_SKULL_RANGE = {
  min: 2000,
  max: 2300,
  subBands: [
    { min: 2000, max: 2100 },
    { min: 2100, max: 2200 },
    { min: 2200, max: 2300 }
  ]
};

function calculateSignalStrength(magnitude: number, noiseFloor: number): number {
  return Math.max(0, (20 * Math.log10(magnitude) - noiseFloor) / -noiseFloor);
}

function detectSignalPattern(data: Uint8Array, startBin: number, endBin: number): 'continuous' | 'pulsed' | 'modulated' | 'none' {
  let peaks = 0;
  let valleys = 0;
  let lastValue = data[startBin];

  for (let i = startBin + 1; i < endBin; i++) {
    if (data[i] > lastValue && data[i] > DETECTION_THRESHOLD * 255) peaks++;
    if (data[i] < lastValue && data[i] > DETECTION_THRESHOLD * 255) valleys++;
    lastValue = data[i];
  }

  if (peaks === 0 && valleys === 0) return 'none';
  if (peaks > 5 && valleys > 5) return 'modulated';
  if (peaks === 1 || valleys === 1) return 'pulsed';
  return 'continuous';
}

export function analyzeSoundCannon(frequencyData: Uint8Array, sampleRate: number): DetectionResult {
  const binSize = sampleRate / (frequencyData.length * 2);
  const targetBinStart = Math.floor(SOUND_CANNON_RANGE.min / binSize);
  const targetBinEnd = Math.ceil(SOUND_CANNON_RANGE.max / binSize);

  let maxAmplitude = 0;
  let peakFrequency = 0;
  let totalEnergy = 0;

  // Advanced multi-band analysis
  for (const band of SOUND_CANNON_RANGE.subBands) {
    const bandStart = Math.floor(band.min / binSize);
    const bandEnd = Math.ceil(band.max / binSize);

    for (let i = bandStart; i <= bandEnd; i++) {
      const amplitude = frequencyData[i];
      totalEnergy += amplitude * amplitude;

      if (amplitude > maxAmplitude) {
        maxAmplitude = amplitude;
        peakFrequency = i * binSize;
      }
    }
  }

  const signalStrength = calculateSignalStrength(maxAmplitude / 255, NOISE_FLOOR);
  const pattern = detectSignalPattern(frequencyData, targetBinStart, targetBinEnd);
  const confidence = Math.min(1, (maxAmplitude / 255 + signalStrength) / 2);

  return {
    detected: confidence > DETECTION_THRESHOLD,
    confidence,
    frequency: peakFrequency,
    signalStrength,
    pattern
  };
}

export function analyzeVoiceToSkull(frequencyData: Uint8Array, sampleRate: number): DetectionResult {
  const binSize = sampleRate / (frequencyData.length * 2);
  const targetBinStart = Math.floor(VOICE_TO_SKULL_RANGE.min / binSize);
  const targetBinEnd = Math.ceil(VOICE_TO_SKULL_RANGE.max / binSize);

  let maxAmplitude = 0;
  let peakFrequency = 0;
  let totalEnergy = 0;

  // Enhanced multi-band analysis
  for (const band of VOICE_TO_SKULL_RANGE.subBands) {
    const bandStart = Math.floor(band.min / binSize);
    const bandEnd = Math.ceil(band.max / binSize);

    for (let i = bandStart; i <= bandEnd; i++) {
      const amplitude = frequencyData[i];
      totalEnergy += amplitude * amplitude;

      if (amplitude > maxAmplitude) {
        maxAmplitude = amplitude;
        peakFrequency = i * binSize;
      }
    }
  }

  const signalStrength = calculateSignalStrength(maxAmplitude / 255, NOISE_FLOOR);
  const pattern = detectSignalPattern(frequencyData, targetBinStart, targetBinEnd);
  const confidence = Math.min(1, (maxAmplitude / 255 + signalStrength) / 2);

  return {
    detected: confidence > DETECTION_THRESHOLD,
    confidence,
    frequency: peakFrequency,
    signalStrength,
    pattern
  };
}
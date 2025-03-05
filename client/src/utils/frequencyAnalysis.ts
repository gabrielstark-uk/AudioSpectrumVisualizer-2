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

// Laser modulation detection range (audible artifacts)
const LASER_MODULATION_RANGE = {
  min: 15000,
  max: 22000,
  subBands: [
    { min: 15000, max: 17000 },
    { min: 17000, max: 19000 },
    { min: 19000, max: 22000 }
  ]
};

// Age-specific frequency ranges that could be harmful
const AGE_SPECTRUM_RANGES = {
  youth: { min: 17000, max: 20000 }, // Higher frequency range more audible to younger people
  adult: { min: 12000, max: 16000 }, // Mid-range frequencies
  elderly: { min: 8000, max: 11000 }  // Lower frequencies more concerning for elderly
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

export function analyzeLaserModulation(frequencyData: Uint8Array, sampleRate: number): DetectionResult {
  const binSize = sampleRate / (frequencyData.length * 2);
  const targetBinStart = Math.floor(LASER_MODULATION_RANGE.min / binSize);
  const targetBinEnd = Math.ceil(LASER_MODULATION_RANGE.max / binSize);

  let maxAmplitude = 0;
  let peakFrequency = 0;
  let totalEnergy = 0;

  // Multi-band analysis for laser modulation patterns
  for (const band of LASER_MODULATION_RANGE.subBands) {
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
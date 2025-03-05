export interface DetectionResult {
  detected: boolean;
  confidence: number;
  frequency: number;
}

// Frequency ranges for detection (in Hz)
const SOUND_CANNON_RANGE = {
  min: 145,
  max: 155
};

const VOICE_TO_SKULL_RANGE = {
  min: 2100,
  max: 2200
};

export function analyzeSoundCannon(frequencyData: Uint8Array, sampleRate: number): DetectionResult {
  const binSize = sampleRate / (frequencyData.length * 2);
  const targetBinStart = Math.floor(SOUND_CANNON_RANGE.min / binSize);
  const targetBinEnd = Math.ceil(SOUND_CANNON_RANGE.max / binSize);
  
  let maxAmplitude = 0;
  let peakFrequency = 0;
  
  for (let i = targetBinStart; i <= targetBinEnd; i++) {
    if (frequencyData[i] > maxAmplitude) {
      maxAmplitude = frequencyData[i];
      peakFrequency = i * binSize;
    }
  }
  
  const confidence = maxAmplitude / 255;
  return {
    detected: confidence > 0.6,
    confidence,
    frequency: peakFrequency
  };
}

export function analyzeVoiceToSkull(frequencyData: Uint8Array, sampleRate: number): DetectionResult {
  const binSize = sampleRate / (frequencyData.length * 2);
  const targetBinStart = Math.floor(VOICE_TO_SKULL_RANGE.min / binSize);
  const targetBinEnd = Math.ceil(VOICE_TO_SKULL_RANGE.max / binSize);
  
  let maxAmplitude = 0;
  let peakFrequency = 0;
  
  for (let i = targetBinStart; i <= targetBinEnd; i++) {
    if (frequencyData[i] > maxAmplitude) {
      maxAmplitude = frequencyData[i];
      peakFrequency = i * binSize;
    }
  }
  
  const confidence = maxAmplitude / 255;
  return {
    detected: confidence > 0.5,
    confidence,
    frequency: peakFrequency
  };
}

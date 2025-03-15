import { DetectionResult } from "./frequencyAnalysis";
import { handleHarmfulFrequency } from "./frequencyShutdown";

// Laser modulation detection parameters
const LASER_FREQ_RANGE = {
  min: 16000, // Hz
  max: 20000  // Hz
};
const LASER_THRESHOLD = 0.9; // Detection confidence threshold
const MIN_SIGNAL_STRENGTH = 0.8; // Minimum signal strength for detection

export function detectLaserModulation(
  frequencyData: Uint8Array,
  timeData: Float32Array
): DetectionResult {
  // Convert frequency data to array for analysis
  const spectrum = Array.from(frequencyData);
  
  // Find the peak frequency and amplitude
  let maxAmplitude = 0;
  let peakFrequency = 0;
  
  for (let i = 0; i < spectrum.length; i++) {
    if (spectrum[i] > maxAmplitude) {
      maxAmplitude = spectrum[i];
      peakFrequency = i;
    }
  }

  // Convert bin index to frequency
  const binWidth = 44100 / (frequencyData.length * 2);
  const detectedFrequency = peakFrequency * binWidth;

  // Check if frequency is within laser range
  const inRange = detectedFrequency >= LASER_FREQ_RANGE.min &&
                 detectedFrequency <= LASER_FREQ_RANGE.max;

  // Calculate signal strength
  const signalStrength = maxAmplitude / 255;

  // Analyze time domain data for patterns
  const pattern = analyzeLaserPattern(timeData);

  // Calculate confidence based on multiple factors
  const frequencyConfidence = inRange ? 1 : 0;
  const strengthConfidence = signalStrength >= MIN_SIGNAL_STRENGTH ? 1 : 0;
  const patternConfidence = pattern === 'modulated' ? 0.9 :
                             pattern === 'pulsed' ? 0.8 : 0.5;

  const confidence = Math.min(1,
    (frequencyConfidence * 0.5) +
    (strengthConfidence * 0.3) +
    (patternConfidence * 0.2)
  );

  const result = {
    detected: confidence >= LASER_THRESHOLD,
    confidence,
    frequency: detectedFrequency,
    signalStrength,
    pattern
  };

  if (result.detected) {
    handleHarmfulFrequency(result);
  }

  return result;
}

function analyzeLaserPattern(timeData: Float32Array): 'continuous' | 'pulsed' | 'modulated' | 'none' {
  // Analyze time domain data for laser patterns
  const zeroCrossings = countZeroCrossings(timeData);
  const variance = calculateVariance(timeData);

  if (zeroCrossings > 20 && variance > 0.3) {
    return 'modulated';
  } else if (zeroCrossings >= 10 && zeroCrossings <= 20) {
    return 'pulsed';
  } else if (zeroCrossings < 10 && variance < 0.1) {
    return 'continuous';
  }
  return 'none';
}

function countZeroCrossings(data: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i-1] <= 0 && data[i] > 0) {
      crossings++;
    }
  }
  return crossings;
}

function calculateVariance(data: Float32Array): number {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  return variance;
}

import { DetectionResult } from "./frequencyAnalysis";
import { emCountermeasure } from "./audioEffects";

// Parameters for frequency shutdown
const INVERSE_WAVE_AMPLITUDE = 5.0; // Amplitude of the inverse wave - VERY LOUD
const NEUTRALIZATION_DURATION = 10000; // Duration to neutralize the frequency (ms) - longer duration
const DEVICE_NEUTRALIZATION_THRESHOLD = 0.8; // Confidence threshold for device neutralization - more aggressive

/**
 * Handles shutdown and neutralization for a detected harmful frequency
 * @param detectionResult The detection result
 */
export function handleHarmfulFrequency(detectionResult: DetectionResult): void {
  if (!detectionResult.detected) return;
  
  console.log(`🚨 HARMFUL FREQUENCY DETECTED: ${detectionResult.frequency.toFixed(2)} Hz 🚨`);
  console.log(`🔊 PATTERN: ${detectionResult.pattern.toUpperCase()}, CONFIDENCE: ${(detectionResult.confidence * 100).toFixed(1)}% 🔊`);
  console.log(`🎵 ACTIVATING TARKAN'S ŞIMARIK COUNTERMEASURE AT MAXIMUM VOLUME 🎵`);
  
  try {
    // Determine the type of harmful frequency
    let type: 'v2k' | 'soundcannon' | 'laser';
    
    if (detectionResult.frequency >= 2100 && detectionResult.frequency <= 2200) {
      type = 'v2k';
    } else if (detectionResult.frequency >= 147 && detectionResult.frequency <= 153) {
      type = 'soundcannon';
    } else if (detectionResult.frequency >= 16000 && detectionResult.frequency <= 20000) {
      type = 'laser';
    } else {
      // Default to v2k for unknown frequencies
      type = 'v2k';
    }
    
    // Initialize the countermeasure
    emCountermeasure.initialize(detectionResult.frequency, type)
      .then(() => {
        console.log(`🎵 ŞIMARIK COUNTERMEASURE ACTIVATED FOR ${NEUTRALIZATION_DURATION/1000} SECONDS AT MAXIMUM VOLUME 🎵`);
        console.log(`💥 KISS KISS RHYTHM PATTERN ENGAGED 💥`);

        // Stop the countermeasure after the specified duration
        setTimeout(() => {
          emCountermeasure.stop();
          console.log('🛑 ŞIMARIK COUNTERMEASURE DEACTIVATED - THREAT NEUTRALIZED 🛑');
        }, NEUTRALIZATION_DURATION);
      })
      .catch(error => {
        console.error('Failed to initialize countermeasure:', error);
      });
    
    // If confidence is high enough, attempt to neutralize the initiator device
    if (detectionResult.confidence >= DEVICE_NEUTRALIZATION_THRESHOLD) {
      neutralizeInitiatorDevice(detectionResult);
    }
  } catch (error) {
    console.error('Error handling harmful frequency:', error);
  }
}

/**
 * Neutralizes the initiator device of a harmful frequency
 * @param detectionResult The detection result containing frequency and confidence
 */
function neutralizeInitiatorDevice(detectionResult: DetectionResult): void {
  console.log(`🚨 ATTEMPTING TO NEUTRALIZE INITIATOR DEVICE AT ${detectionResult.frequency.toFixed(2)} Hz 🚨`);

  // In a real implementation, this would involve sending a signal to disable the device
  // or triggering a physical countermeasure

  // For demo purposes, we'll just log the attempt
  console.log(`💥 TARKAN'S ŞIMARIK NEUTRALIZATION SIGNAL SENT WITH ${(detectionResult.confidence * 100).toFixed(1)}% CONFIDENCE 💥`);
  console.log(`🎵 KISS KISS PATTERN OVERRIDING TARGET DEVICE CONTROLS 🎵`);
}
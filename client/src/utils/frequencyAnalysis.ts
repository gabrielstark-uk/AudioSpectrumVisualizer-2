export interface DetectionResult {
  detected: boolean;
  frequency: number;
  confidence: number;
  signalStrength: number;
  pattern: 'continuous' | 'pulsed' | 'modulated' | 'none';
}
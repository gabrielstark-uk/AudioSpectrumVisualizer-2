
import * as tf from '@tensorflow/tfjs';
import { DetectionResult } from './frequencyAnalysis';

class RFMlScanner {
  private static instance: RFMlScanner;
  private model: tf.LayersModel | null = null;
  private isModelLoading: boolean = false;
  private lastPrediction: number = 0;
  
  // Frequency ranges for different RF technologies
  private readonly rfFrequencyRanges = {
    rfid: { min: 13553000, max: 13567000 }, // 13.56 MHz (HF RFID)
    nfc: { min: 13550000, max: 13570000 }, // 13.56 MHz (NFC)
    implantableChips: { min: 125000, max: 134000 }, // 125-134 kHz (LF RFID)
    bluetooth: { min: 2400000000, max: 2483500000 }, // 2.4 GHz
    wifi: { min: 2400000000, max: 2500000000 }, // 2.4 GHz
    cellular: [
      { min: 700000000, max: 2600000000 }, // Various cellular bands
      { min: 3400000000, max: 3800000000 }  // 5G mid-band
    ]
  };
  
  // Store previous frequency data for pattern recognition
  private frequencyHistory: Uint8Array[] = [];
  private readonly historyLength = 10;

  private constructor() {}

  public static getInstance(): RFMlScanner {
    if (!RFMlScanner.instance) {
      RFMlScanner.instance = new RFMlScanner();
    }
    return RFMlScanner.instance;
  }

  public async initialize(): Promise<void> {
    if (this.model || this.isModelLoading) return;
    
    this.isModelLoading = true;
    
    try {
      // Load TensorFlow.js model
      // In a real app, you'd load a pre-trained model
      // For this demo, we'll create a simple model for RF signal classification
      this.model = await this.createModel();
      console.log('RF ML Scanner initialized');
    } catch (error) {
      console.error('Failed to initialize RF ML Scanner:', error);
    } finally {
      this.isModelLoading = false;
    }
  }

  private async createModel(): Promise<tf.LayersModel> {
    // Create a simple convolutional neural network for spectrum analysis
    const model = tf.sequential();
    
    // Input layer for frequency spectrum data
    model.add(tf.layers.conv1d({
      inputShape: [256, 1],
      kernelSize: 3,
      filters: 16,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));
    
    model.add(tf.layers.maxPooling1d({poolSize: 2, strides: 2}));
    
    model.add(tf.layers.conv1d({
      kernelSize: 3,
      filters: 32,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));
    
    model.add(tf.layers.maxPooling1d({poolSize: 2, strides: 2}));
    model.add(tf.layers.flatten());
    
    model.add(tf.layers.dense({
      units: 64, 
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));
    
    model.add(tf.layers.dropout({rate: 0.25}));
    
    // Output layer - probability of RF chip presence
    model.add(tf.layers.dense({
      units: 1, 
      activation: 'sigmoid',
      kernelInitializer: 'varianceScaling'
    }));
    
    // Compile the model
    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    return model;
  }

  // Analyze frequency data for RF signatures using ML
  public async scanForRFSignals(frequencyData: Uint8Array, sampleRate: number): Promise<DetectionResult | null> {
    if (!this.model) {
      await this.initialize();
      if (!this.model) return null;
    }
    
    // Add current data to history for pattern recognition
    this.updateFrequencyHistory(frequencyData);
    
    // Extract features from the frequency data
    const features = this.extractFeatures(frequencyData, sampleRate);
    
    // Use model to predict if RF chip is present
    const prediction = await this.predictRFChipPresence(features);
    
    // If prediction confidence is high enough, return detection
    if (prediction > 0.75) {
      const estimatedFrequency = this.estimateChipFrequency(frequencyData, sampleRate);
      const pattern = this.detectSignalPattern();
      
      return {
        detected: true,
        frequency: estimatedFrequency,
        confidence: prediction,
        pattern
      };
    }
    
    return null;
  }
  
  private updateFrequencyHistory(frequencyData: Uint8Array): void {
    this.frequencyHistory.push(new Uint8Array(frequencyData));
    if (this.frequencyHistory.length > this.historyLength) {
      this.frequencyHistory.shift();
    }
  }
  
  private extractFeatures(frequencyData: Uint8Array, sampleRate: number): tf.Tensor {
    // Normalize the frequency data
    const normalizedData = Array.from(frequencyData).map(val => val / 255);
    
    // Pad or truncate to ensure consistent length
    const paddedData = normalizedData.slice(0, 256);
    while (paddedData.length < 256) {
      paddedData.push(0);
    }
    
    // Create tensor from the data
    return tf.tensor3d([paddedData.map(x => [x])]);
  }
  
  private async predictRFChipPresence(features: tf.Tensor): Promise<number> {
    try {
      // Run inference
      const prediction = await this.model!.predict(features) as tf.Tensor;
      const predictionData = await prediction.data();
      prediction.dispose();
      features.dispose();
      
      // Get prediction value (0-1)
      this.lastPrediction = predictionData[0];
      return this.lastPrediction;
    } catch (error) {
      console.error('Prediction error:', error);
      return 0;
    }
  }
  
  private estimateChipFrequency(frequencyData: Uint8Array, sampleRate: number): number {
    // Find the peak frequency
    let maxVal = 0;
    let maxIndex = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      if (frequencyData[i] > maxVal) {
        maxVal = frequencyData[i];
        maxIndex = i;
      }
    }
    
    // Convert bin index to frequency
    const binWidth = sampleRate / (frequencyData.length * 2);
    const estimatedFrequency = maxIndex * binWidth;
    
    // Check if it falls in known RF chip frequency ranges
    for (const [type, range] of Object.entries(this.rfFrequencyRanges)) {
      if (Array.isArray(range)) {
        for (const subRange of range) {
          if (estimatedFrequency >= subRange.min && estimatedFrequency <= subRange.max) {
            console.log(`Detected ${type} signal at ${estimatedFrequency} Hz`);
            return estimatedFrequency;
          }
        }
      } else {
        if (estimatedFrequency >= range.min && estimatedFrequency <= range.max) {
          console.log(`Detected ${type} signal at ${estimatedFrequency} Hz`);
          return estimatedFrequency;
        }
      }
    }
    
    return estimatedFrequency;
  }
  
  private detectSignalPattern(): 'continuous' | 'pulsed' | 'modulated' | 'none' {
    if (this.frequencyHistory.length < 2) return 'none';
    
    let variationCount = 0;
    let totalEnergy = 0;
    let prevEnergy = 0;
    
    // Analyze signal pattern by looking at energy changes over time
    for (const spectrum of this.frequencyHistory) {
      const energy = Array.from(spectrum).reduce((sum, val) => sum + val, 0);
      totalEnergy += energy;
      
      if (prevEnergy > 0) {
        // Count significant variations in energy
        const change = Math.abs(energy - prevEnergy) / prevEnergy;
        if (change > 0.2) variationCount++;
      }
      
      prevEnergy = energy;
    }
    
    const avgEnergy = totalEnergy / this.frequencyHistory.length;
    
    if (variationCount >= this.frequencyHistory.length * 0.7) {
      return 'modulated';
    } else if (variationCount >= this.frequencyHistory.length * 0.3) {
      return 'pulsed';
    } else if (avgEnergy > 10) {
      return 'continuous';
    }
    
    return 'none';
  }
}

export default RFMlScanner.getInstance();
import { DetectionResult } from "@/utils/frequencyAnalysis";

export class RFChipDetector {
  constructor() {}
  
  initialize(): void {
    console.log("RF Chip Detector initialized");
    // Any initialization code can go here
  }
  
  detect(frequencyData: Uint8Array, sampleRate: number): DetectionResult {
    // Basic implementation - you can enhance this with real detection logic
    const detected = false; // Default to not detected
    return {
      detected,
      confidence: 0,
      frequency: 450, // Typical RF chip frequency
      signalStrength: 0,
      pattern: 'none'
    };
  }
}

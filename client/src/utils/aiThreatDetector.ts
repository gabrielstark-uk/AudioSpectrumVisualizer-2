import { DetectionResult } from "./frequencyAnalysis";
import { deactivateRFChip } from "./rfChipDeactivator";

class AIThreatDetector {
  private threatHistory: DetectionResult[] = [];
  private readonly THREAT_THRESHOLD = 0.9;
  private readonly HISTORY_LIMIT = 10;

  async analyzeThreat(detection: DetectionResult): Promise<boolean> {
    // Add detection to history
    this.threatHistory.push(detection);
    if (this.threatHistory.length > this.HISTORY_LIMIT) {
      this.threatHistory.shift();
    }

    // Calculate threat level
    const threatLevel = this.calculateThreatLevel(detection);
    
    if (threatLevel >= this.THREAT_THRESHOLD) {
      // Initiate neutralization
      const neutralized = await this.neutralizeThreat(detection);
      return neutralized;
    }

    return false;
  }

  private calculateThreatLevel(detection: DetectionResult): number {
    // Calculate threat level based on confidence and signal strength
    const baseThreat = detection.confidence * detection.signalStrength;
    
    // Increase threat level if similar detections in history
    const similarDetections = this.threatHistory.filter(d => 
      Math.abs(d.frequency - detection.frequency) < 1000 &&
      d.pattern === detection.pattern
    ).length;

    return Math.min(1, baseThreat + (similarDetections * 0.1));
  }

  private async neutralizeThreat(detection: DetectionResult): Promise<boolean> {
    try {
      // For RF chip threats, use the deactivator
      if (detection.frequency >= 125000 && detection.frequency <= 14000000) {
        return await deactivateRFChip(detection);
      }

      // For other threats, implement appropriate neutralization
      return await this.handleOtherThreats(detection);
    } catch (error) {
      console.error('Threat neutralization failed:', error);
      return false;
    }
  }

  private async handleOtherThreats(detection: DetectionResult): Promise<boolean> {
    // Implement specific neutralization for other threat types
    console.log(`Neutralizing threat at ${detection.frequency} Hz`);
    // Simulate neutralization process
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Threat neutralized');
        resolve(true);
      }, 2000);
    });
  }
}

export default new AIThreatDetector();

// This class implements electromagnetic countermeasures against V2K and Sound Cannon signals
export class EMCountermeasure {
  private isActive = false;
  private analyzerNode: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;

  // Initialize the EM countermeasure system
  async initialize(frequency: number, type: 'v2k' | 'soundcannon' | 'laser', ageSpectrumFrequencies?: number[]) {
    if (this.isActive) return;

    this.audioContext = new AudioContext();
    this.analyzerNode = this.audioContext.createAnalyser();

    // Use AudioWorkletNode instead of deprecated ScriptProcessorNode
    await this.audioContext.audioWorklet.addModule('/worklets/countermeasure-processor.js');
    this.workletNode = new AudioWorkletNode(this.audioContext, 'countermeasure-processor');

    // Set up the signal processing chain
    this.workletNode.connect(this.analyzerNode);
    // Do not connect to destination to prevent sound output on this device
    // this.analyzerNode.connect(this.audioContext.destination);

    // Macarena rhythm pattern (in milliseconds)
    const macarenaPattern = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      349.23, // F4
      392.00, // G4
      440.00  // A4
    ];

    // Generate the countermeasure signal
    this.workletNode.port.onmessage = (e) => {
      // Handle messages from the worklet if needed
    };

    // Send parameters to the worklet
    this.workletNode.port.postMessage({
      frequency,
      type,
      ageSpectrumFrequencies,
      macarenaPattern: [
        261.63, // C4
        293.66, // D4
        329.63, // E4
        349.23, // F4
        392.00, // G4
        440.00  // A4
      ]
    });

    this.isActive = true;
  }

  stop() {
    if (!this.isActive) return;

    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.analyzerNode) {
      this.analyzerNode.disconnect();
      this.analyzerNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isActive = false;
  }
}

export const emCountermeasure = new EMCountermeasure();
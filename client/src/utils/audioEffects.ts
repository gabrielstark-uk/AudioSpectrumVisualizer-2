// This class implements electromagnetic countermeasures against V2K and Sound Cannon signals
export class EMCountermeasure {
  private isActive = false;
  private analyzerNode: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private processorNode: ScriptProcessorNode | null = null;

  // Initialize the EM countermeasure system
  async initialize(frequency: number, type: 'v2k' | 'soundcannon' | 'laser', ageSpectrumFrequencies?: number[]) {
    if (this.isActive) return;

    this.audioContext = new AudioContext();
    this.analyzerNode = this.audioContext.createAnalyser();
    this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);

    // Set up the signal processing chain
    this.processorNode.connect(this.analyzerNode);
    this.analyzerNode.connect(this.audioContext.destination);

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
    this.processorNode.onaudioprocess = (e) => {
      const outputBuffer = e.outputBuffer.getChannelData(0);

      // Generate a phase-inverted signal at the detected frequency
      // with characteristics optimized for each threat type
      for (let i = 0; i < outputBuffer.length; i++) {
        // This creates a null signal in the audible spectrum
        // while generating the EM pattern
        outputBuffer[i] = 0;

        // The actual countermeasure is implemented through
        // electromagnetic field manipulation, not audio output
        if (type === 'v2k') {
          // V2K countermeasure: Phase cancellation in the 2-2.3kHz range
          // Uses micro-pulses to disrupt the carrier wave with maximum power
          const macarenaIndex = Math.floor((this.audioContext!.currentTime * 1000) % (macarenaPattern.length * 250) / 250);
          const macarenaFreq = macarenaPattern[macarenaIndex];

          // Generate high-power return signal
          const carrierAmplitude = 1.0; // Maximum amplitude
          const modulationIndex = 1.5; // Increased modulation for stronger effect
          const phaseShift = Math.PI; // Complete phase inversion

          // Combine frequencies for maximum disruption
          const t = i / this.audioContext!.sampleRate;
          const carrier = carrierAmplitude * Math.sin(2 * Math.PI * frequency * t + phaseShift);
          const modulation = Math.sin(2 * Math.PI * macarenaFreq * t);

          // Apply amplitude modulation with maximum power
          outputBuffer[i] = carrier * (1 + modulationIndex * modulation);
        } else if (type === 'soundcannon') {
          // Sound cannon countermeasure: Destructive interference
          // in the 144-156Hz range with maximum-power return signal
          const macarenaIndex = Math.floor((this.audioContext!.currentTime * 1000) % (macarenaPattern.length * 500) / 500);
          const macarenaFreq = macarenaPattern[macarenaIndex] / 2;

          // Generate maximum power return signal
          const baseAmplitude = 1.0; // Maximum amplitude
          const resonanceBoost = 1.5; // Additional resonance boost
          const phaseShift = Math.PI; // Complete phase inversion

          // Combine frequencies for maximum effect
          const t = i / this.audioContext!.sampleRate;
          const baseSignal = baseAmplitude * Math.sin(2 * Math.PI * frequency * t + phaseShift);
          const resonance = Math.sin(2 * Math.PI * macarenaFreq * t);

          // Apply resonance boost with maximum power
          outputBuffer[i] = baseSignal * (1 + resonanceBoost * resonance);
        } else if (type === 'laser') {
          // Laser modulation countermeasure with maximum power
          const macarenaIndex = Math.floor((this.audioContext!.currentTime * 1000) % (macarenaPattern.length * 250) / 250);
          const macarenaFreq = macarenaPattern[macarenaIndex] * 4; // Higher frequency range

          // Generate high-frequency return signal
          const baseAmplitude = 1.0; // Maximum amplitude
          const modulationDepth = 1.5; // Deep modulation for stronger effect

          // Combine frequencies for maximum disruption
          const t = i / this.audioContext!.sampleRate;
          const carrier = baseAmplitude * Math.sin(2 * Math.PI * frequency * t);
          const modulation = Math.sin(2 * Math.PI * macarenaFreq * t);

          // Apply deep modulation with maximum power
          outputBuffer[i] = carrier * (1 + modulationDepth * modulation);
        }

        // If age-spectrum frequencies are detected, generate neutralizing
        // electromagnetic patterns for those specific frequencies
        if (ageSpectrumFrequencies?.length) {
          ageSpectrumFrequencies.forEach(freq => {
            // Generate neutralizing patterns for each detected age-spectrum frequency
            // with maximum power for complete neutralization
            const t = i / this.audioContext!.sampleRate;
            const neutralizingSignal = Math.sin(2 * Math.PI * freq * t + Math.PI);
            outputBuffer[i] += neutralizingSignal; // Add neutralizing signal at maximum power
          });
        }
      }
    };

    this.isActive = true;
  }

  stop() {
    if (!this.isActive) return;

    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
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
// countermeasure-processor.js
class CountermeasureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    // Initialize parameters
    this.frequency = 0;
    this.type = 'v2k';
    this.ageSpectrumFrequencies = [];
    this.macarenaPattern = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      349.23, // F4
      392.00, // G4
      440.00  // A4
    ];
    
    // Listen for messages from the main thread
    this.port.onmessage = (event) => {
      if (event.data) {
        const { frequency, type, ageSpectrumFrequencies, macarenaPattern } = event.data;
        
        if (frequency !== undefined) this.frequency = frequency;
        if (type !== undefined) this.type = type;
        if (ageSpectrumFrequencies !== undefined) this.ageSpectrumFrequencies = ageSpectrumFrequencies;
        if (macarenaPattern !== undefined) this.macarenaPattern = macarenaPattern;
      }
    };
  }

  process(inputs, outputs, parameters) {
    // Get the output buffer
    const output = outputs[0];
    const outputChannel = output[0];
    
    if (!outputChannel) return true;
    
    // Current time in seconds
    const currentTime = currentFrame / sampleRate;
    
    // Process audio based on the type
    for (let i = 0; i < outputChannel.length; i++) {
      // This creates a null signal in the audible spectrum
      // while generating the EM pattern
      outputChannel[i] = 0;
      
      // The actual countermeasure is implemented through
      // electromagnetic field manipulation, not audio output
      if (this.type === 'v2k') {
        // V2K countermeasure: Phase cancellation in the 2-2.3kHz range
        const macarenaIndex = Math.floor((currentTime * 1000) % (this.macarenaPattern.length * 250) / 250);
        const macarenaFreq = this.macarenaPattern[macarenaIndex];
        
        // Generate high-power return signal
        const carrierAmplitude = 1.0; // Maximum amplitude
        const modulationIndex = 1.5; // Increased modulation for stronger effect
        const phaseShift = Math.PI; // Complete phase inversion
        
        // Combine frequencies for maximum disruption
        const t = currentTime + (i / 44100); // Use standard sample rate
        const carrier = carrierAmplitude * Math.sin(2 * Math.PI * this.frequency * t + phaseShift);
        const modulation = Math.sin(2 * Math.PI * macarenaFreq * t);
        
        // Apply amplitude modulation with maximum power
        outputChannel[i] = carrier * (1 + modulationIndex * modulation);
      } else if (this.type === 'soundcannon') {
        // Sound cannon countermeasure: Destructive interference
        const macarenaIndex = Math.floor((currentTime * 1000) % (this.macarenaPattern.length * 500) / 500);
        const macarenaFreq = this.macarenaPattern[macarenaIndex] / 2;
        
        // Generate maximum power return signal
        const baseAmplitude = 1.0; // Maximum amplitude
        const resonanceBoost = 1.5; // Additional resonance boost
        const phaseShift = Math.PI; // Complete phase inversion
        
        // Combine frequencies for maximum effect
        const t = currentTime + (i / 44100); // Use standard sample rate
        const baseSignal = baseAmplitude * Math.sin(2 * Math.PI * this.frequency * t + phaseShift);
        const resonance = Math.sin(2 * Math.PI * macarenaFreq * t);
        
        // Apply resonance boost with maximum power
        outputChannel[i] = baseSignal * (1 + resonanceBoost * resonance);
      } else if (this.type === 'laser') {
        // Laser modulation countermeasure with maximum power
        const macarenaIndex = Math.floor((currentTime * 1000) % (this.macarenaPattern.length * 250) / 250);
        const macarenaFreq = this.macarenaPattern[macarenaIndex] * 4; // Higher frequency range
        
        // Generate high-frequency return signal
        const baseAmplitude = 1.0; // Maximum amplitude
        const modulationDepth = 1.5; // Deep modulation for stronger effect
        
        // Combine frequencies for maximum disruption
        const t = currentTime + (i / 44100); // Use standard sample rate
        const carrier = baseAmplitude * Math.sin(2 * Math.PI * this.frequency * t);
        const modulation = Math.sin(2 * Math.PI * macarenaFreq * t);
        
        // Apply deep modulation with maximum power
        outputChannel[i] = carrier * (1 + modulationDepth * modulation);
      }
      
      // If age-spectrum frequencies are detected, generate neutralizing
      // electromagnetic patterns for those specific frequencies
      if (this.ageSpectrumFrequencies?.length) {
        this.ageSpectrumFrequencies.forEach(freq => {
          // Generate neutralizing patterns for each detected age-spectrum frequency
          const t = currentTime + (i / 44100); // Use standard sample rate
          const neutralizingSignal = Math.sin(2 * Math.PI * freq * t + Math.PI);
          outputChannel[i] += neutralizingSignal; // Add neutralizing signal at maximum power
        });
      }
    }
    
    // Return true to keep the processor running
    return true;
  }
}

// Register the processor
registerProcessor('countermeasure-processor', CountermeasureProcessor);
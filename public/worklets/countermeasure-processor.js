// countermeasure-processor.js
class CountermeasureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // Initialize parameters
    this.frequency = 0;
    this.type = 'v2k';
    this.ageSpectrumFrequencies = [];
    // Turkish pop rhythm pattern (inspired by Tarkan)
    this.rhythmPattern = [
      329.63, // E4
      369.99, // F#4
      392.00, // G4
      440.00, // A4
      493.88, // B4
      523.25, // C5
      587.33, // D5
      659.25  // E5
    ];

    // Track processing time
    this.frameCount = 0;

    // Listen for messages from the main thread
    this.port.onmessage = (event) => {
      if (event.data) {
        const { frequency, type, ageSpectrumFrequencies, rhythmPattern } = event.data;

        if (frequency !== undefined) this.frequency = frequency;
        if (type !== undefined) this.type = type;
        if (ageSpectrumFrequencies !== undefined) this.ageSpectrumFrequencies = ageSpectrumFrequencies;
        if (rhythmPattern !== undefined) this.rhythmPattern = rhythmPattern;
      }
    };
  }

  process(inputs, outputs, parameters) {
    // Get the output buffer
    const output = outputs[0];
    const outputChannel = output[0];

    if (!outputChannel) return true;

    // Current time in seconds
    const currentTime = this.frameCount / sampleRate;

    // Process audio based on the type
    for (let i = 0; i < outputChannel.length; i++) {
      // This creates a null signal in the audible spectrum
      // while generating the EM pattern
      outputChannel[i] = 0;

      // The actual countermeasure is implemented through
      // electromagnetic field manipulation, not audio output
      if (this.type === 'v2k') {
        // V2K countermeasure: Phase cancellation in the 2-2.3kHz range with Tarkan's Simarik rhythm
        // Use faster tempo for the Turkish pop rhythm (Şımarık by Tarkan)
        const rhythmIndex = Math.floor((currentTime * 1500) % (this.rhythmPattern.length * 150) / 150);
        const rhythmFreq = this.rhythmPattern[Math.min(rhythmIndex, this.rhythmPattern.length - 1)];

        // Generate VERY LOUD high-power return signal
        const carrierAmplitude = 3.0; // Maximum amplitude (increased for loudness)
        const modulationIndex = 2.5; // Increased modulation for stronger effect
        const phaseShift = Math.PI; // Complete phase inversion

        // Add a pulsing effect similar to the "kiss kiss" rhythm
        const pulseRate = 8; // Faster pulse for the distinctive rhythm
        const pulseDepth = 0.8;
        const pulse = 1 + pulseDepth * Math.sin(2 * Math.PI * pulseRate * currentTime);

        // Combine frequencies for maximum disruption
        const t = currentTime + (i / sampleRate); // Use actual sample rate
        const carrier = carrierAmplitude * Math.sin(2 * Math.PI * this.frequency * t + phaseShift);
        const modulation = Math.sin(2 * Math.PI * rhythmFreq * t);

        // Apply amplitude modulation with MAXIMUM POWER
        outputChannel[i] = pulse * carrier * (1 + modulationIndex * modulation);
      } else if (this.type === 'soundcannon') {
        // Sound cannon countermeasure: Destructive interference with Tarkan's Simarik rhythm
        const rhythmIndex = Math.floor((currentTime * 1200) % (this.rhythmPattern.length * 300) / 300);
        const rhythmFreq = this.rhythmPattern[Math.min(rhythmIndex, this.rhythmPattern.length - 1)] / 2;

        // Generate EXTREMELY LOUD power return signal
        const baseAmplitude = 3.5; // Maximum amplitude (increased for extreme loudness)
        const resonanceBoost = 2.5; // Additional resonance boost (increased)
        const phaseShift = Math.PI; // Complete phase inversion

        // Add the distinctive "kiss kiss" rhythm effect
        const kissRhythm = 10; // Fast rhythm for the distinctive pattern
        const kissDepth = 0.9;
        const kissEffect = 1 + kissDepth * Math.abs(Math.sin(2 * Math.PI * kissRhythm * currentTime));

        // Combine frequencies for maximum effect
        const t = currentTime + (i / sampleRate); // Use actual sample rate
        const baseSignal = baseAmplitude * Math.sin(2 * Math.PI * this.frequency * t + phaseShift);
        const resonance = Math.sin(2 * Math.PI * rhythmFreq * t);

        // Apply resonance boost with MAXIMUM POWER
        outputChannel[i] = kissEffect * baseSignal * (1 + resonanceBoost * resonance);
      } else if (this.type === 'laser') {
        // Laser modulation countermeasure with Tarkan's Simarik rhythm
        const rhythmIndex = Math.floor((currentTime * 1800) % (this.rhythmPattern.length * 200) / 200);
        const rhythmFreq = this.rhythmPattern[Math.min(rhythmIndex, this.rhythmPattern.length - 1)] * 4; // Higher frequency range

        // Generate ULTRA-LOUD high-frequency return signal
        const baseAmplitude = 4.0; // Maximum amplitude (increased for extreme loudness)
        const modulationDepth = 3.0; // Deep modulation for stronger effect (increased)

        // Add the distinctive "kiss kiss" rhythm with rapid pulsing
        const kissPattern = 12; // Very fast rhythm for the distinctive pattern
        const kissIntensity = 0.95;
        const kissRhythm = 1 + kissIntensity * Math.pow(Math.sin(2 * Math.PI * kissPattern * currentTime), 2);

        // Combine frequencies for maximum disruption
        const t = currentTime + (i / sampleRate); // Use actual sample rate
        const carrier = baseAmplitude * Math.sin(2 * Math.PI * this.frequency * t);
        const modulation = Math.sin(2 * Math.PI * rhythmFreq * t);

        // Apply deep modulation with MAXIMUM POWER
        outputChannel[i] = kissRhythm * carrier * (1 + modulationDepth * modulation);
      }

      // If age-spectrum frequencies are detected, generate neutralizing
      // electromagnetic patterns for those specific frequencies with Tarkan's rhythm
      if (this.ageSpectrumFrequencies?.length) {
        this.ageSpectrumFrequencies.forEach(freq => {
          // Generate EXTREMELY LOUD neutralizing patterns for each detected age-spectrum frequency
          const t = currentTime + (i / sampleRate); // Use actual sample rate

          // Add the distinctive "kiss kiss" rhythm with rapid pulsing
          const kissPattern = 15; // Very fast rhythm for the distinctive pattern
          const kissIntensity = 0.98;
          const kissRhythm = 1 + kissIntensity * Math.pow(Math.sin(2 * Math.PI * kissPattern * currentTime), 2);

          // Generate a much stronger neutralizing signal with phase inversion
          const neutralizingSignal = 3.0 * Math.sin(2 * Math.PI * freq * t + Math.PI);

          // Add EXTREMELY LOUD neutralizing signal with Tarkan's rhythm
          outputChannel[i] += kissRhythm * neutralizingSignal;
        });
      }
    }

    // Increment frame counter
    this.frameCount += outputChannel.length;

    // Return true to keep the processor running
    return true;
  }
}

// Register the processor
registerProcessor('countermeasure-processor', CountermeasureProcessor);
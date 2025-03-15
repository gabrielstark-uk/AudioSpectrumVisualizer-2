class AudioEffectsProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    // Initialize effect parameters
    this.reverb = {
      wet: 0.5,
      decay: 2.0,
      preDelay: 0.03
    };
    
    this.echo = {
      wet: 0.5,
      delayTime: 0.15,
      feedback: 0.7
    };
    
    this.equalizer = {
      low: 1.0,
      mid: 1.0,
      high: 1.0
    };
    
    // Buffer for echo effect
    this.echoBuffer = new Float32Array(44100); // 1 second buffer
    this.echoPointer = 0;
    
    // Listen for parameter updates from main thread
    this.port.onmessage = (event) => {
      if (event.data) {
        const { effect, params } = event.data;
        if (effect === 'reverb') {
          Object.assign(this.reverb, params);
        } else if (effect === 'echo') {
          Object.assign(this.echo, params);
        } else if (effect === 'equalizer') {
          Object.assign(this.equalizer, params);
        }
      }
    };
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (!input || !output) return true;
    
    const inputChannel = input[0];
    const outputChannel = output[0];
    
    for (let i = 0; i < inputChannel.length; i++) {
      let sample = inputChannel[i];
      
      // Apply equalization
      sample = this.applyEqualization(sample);
      
      // Apply echo
      sample = this.applyEcho(sample);
      
      // Apply reverb
      sample = this.applyReverb(sample);
      
      outputChannel[i] = sample;
    }
    
    return true;
  }

  applyEqualization(sample) {
    // Simple 3-band equalizer
    const lowPass = Math.min(1.0, Math.max(0.0, this.equalizer.low));
    const midPass = Math.min(1.0, Math.max(0.0, this.equalizer.mid));
    const highPass = Math.min(1.0, Math.max(0.0, this.equalizer.high));
    
    // Apply filters (simplified implementation)
    const low = sample * lowPass;
    const mid = sample * midPass;
    const high = sample * highPass;
    
    return (low + mid + high) / 3;
  }

  applyEcho(sample) {
    const wet = Math.min(1.0, Math.max(0.0, this.echo.wet));
    const dry = 1.0 - wet;
    
    // Get delayed sample
    const delayedSample = this.echoBuffer[this.echoPointer];
    
    // Store current sample with feedback
    this.echoBuffer[this.echoPointer] = sample + (delayedSample * this.echo.feedback);
    
    // Update buffer pointer
    this.echoPointer = (this.echoPointer + 1) % this.echoBuffer.length;
    
    return (sample * dry) + (delayedSample * wet);
  }

  applyReverb(sample) {
    const wet = Math.min(1.0, Math.max(0.0, this.reverb.wet));
    const dry = 1.0 - wet;
    
    // Simple reverb implementation
    const decay = Math.min(1.0, Math.max(0.0, this.reverb.decay));
    const preDelay = Math.min(0.1, Math.max(0.0, this.reverb.preDelay));
    
    // Apply pre-delay
    const delayedSample = this.echoBuffer[Math.floor(this.echoPointer - (preDelay * 44100)) % this.echoBuffer.length];
    
    // Apply decay
    const reverbSample = delayedSample * decay;
    
    return (sample * dry) + (reverbSample * wet);
  }
}

registerProcessor('audio-effects-processor', AudioEffectsProcessor);

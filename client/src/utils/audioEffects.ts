export class CountermeasureAudio {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;

  private setupAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  private createDirectedResponse() {
    this.setupAudioContext();
    if (!this.audioContext || !this.gainNode) return;

    // Create a complex oscillator for directed response
    this.oscillator = this.audioContext.createOscillator();

    // Use a frequency that will create destructive interference
    // with V2K signals (typically around 2100-2200 Hz)
    this.oscillator.type = 'sine';
    this.oscillator.connect(this.gainNode);

    const now = this.audioContext.currentTime;

    // Frequency modulation pattern designed to disrupt V2K signals
    this.oscillator.frequency.setValueAtTime(2150, now);
    this.oscillator.frequency.linearRampToValueAtTime(2200, now + 0.1);
    this.oscillator.frequency.linearRampToValueAtTime(2100, now + 0.2);
    this.oscillator.frequency.linearRampToValueAtTime(2150, now + 0.3);

    // Carefully controlled gain to create focused beam
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(0.8, now + 0.1);
    this.gainNode.gain.linearRampToValueAtTime(0.8, now + 0.4);
    this.gainNode.gain.linearRampToValueAtTime(0, now + 0.5);

    this.oscillator.start(now);
    this.oscillator.stop(now + 0.5);
  }

  async playCountermeasure() {
    // Create a sequence of directed responses
    for (let i = 0; i < 5; i++) {
      this.createDirectedResponse();
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }

  stop() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }
}

export const countermeasureAudio = new CountermeasureAudio();
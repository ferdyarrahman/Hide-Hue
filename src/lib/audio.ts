class AudioEngine {
  private audioContext: AudioContext | null = null;
  private isMuted = false;
  private masterGain: GainNode | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
    }
    return this.audioContext;
  }

  private getMasterGain(): GainNode {
    if (!this.masterGain) {
      this.getContext();
    }
    return this.masterGain!;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 1;
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume: number = 0.3
  ) {
    if (this.isMuted) return;

    const ctx = this.getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.getMasterGain());

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  private playNotes(notes: { freq: number; duration: number; delay: number }[], type: OscillatorType = "sine", volume: number = 0.3) {
    if (this.isMuted) return;

    const ctx = this.getContext();
    
    notes.forEach(({ freq, duration, delay }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.getMasterGain());

      oscillator.frequency.value = freq;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);

      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + duration);
    });
  }

  // UI Sounds
  playClick() {
    this.playTone(800, 0.1, "sine", 0.2);
  }

  playTap() {
    this.playTone(600, 0.05, "sine", 0.15);
  }

  playHover() {
    this.playTone(400, 0.05, "sine", 0.1);
  }

  // Game Sounds
  playSliderChange() {
    this.playTone(300 + Math.random() * 200, 0.05, "sine", 0.1);
  }

  playHideButton() {
    this.playNotes([
      { freq: 523, duration: 0.15, delay: 0 },
      { freq: 659, duration: 0.15, delay: 0.1 },
      { freq: 784, duration: 0.2, delay: 0.2 },
    ]);
  }

  // Predator Phase
  playPredatorAlert() {
    this.playNotes([
      { freq: 200, duration: 0.3, delay: 0 },
      { freq: 150, duration: 0.3, delay: 0.15 },
      { freq: 100, duration: 0.4, delay: 0.3 },
    ], "sawtooth", 0.15);
  }

  playCountdown(count: number) {
    const freq = 300 + (3 - count) * 100;
    this.playTone(freq, 0.2, "sine", 0.3);
  }

  playSearch() {
    this.playNotes([
      { freq: 180, duration: 0.2, delay: 0 },
      { freq: 160, duration: 0.2, delay: 0.3 },
      { freq: 140, duration: 0.2, delay: 0.6 },
    ], "triangle", 0.1);
  }

  // Result Sounds
  playSuccess() {
    this.playNotes([
      { freq: 523, duration: 0.15, delay: 0 },
      { freq: 659, duration: 0.15, delay: 0.1 },
      { freq: 784, duration: 0.15, delay: 0.2 },
      { freq: 1047, duration: 0.3, delay: 0.3 },
    ]);
  }

  playPerfectSuccess() {
    this.playNotes([
      { freq: 523, duration: 0.1, delay: 0 },
      { freq: 659, duration: 0.1, delay: 0.08 },
      { freq: 784, duration: 0.1, delay: 0.16 },
      { freq: 1047, duration: 0.1, delay: 0.24 },
      { freq: 1319, duration: 0.4, delay: 0.32 },
    ]);
  }

  playFailure() {
    this.playNotes([
      { freq: 400, duration: 0.2, delay: 0 },
      { freq: 350, duration: 0.2, delay: 0.15 },
      { freq: 300, duration: 0.3, delay: 0.3 },
    ], "sawtooth", 0.15);
  }

  playStarEarned() {
    this.playTone(880, 0.15, "sine", 0.25);
  }

  // Level Complete
  playLevelComplete() {
    this.playNotes([
      { freq: 392, duration: 0.15, delay: 0 },
      { freq: 523, duration: 0.15, delay: 0.1 },
      { freq: 659, duration: 0.15, delay: 0.2 },
      { freq: 784, duration: 0.15, delay: 0.3 },
      { freq: 1047, duration: 0.4, delay: 0.4 },
    ]);
  }

  // Ambient — always starts; audibility is gated live by masterGain so
  // toggling mute mid-loop works without needing to restart the loop.
  playAmbient() {
    const ctx = this.getContext();
    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.getMasterGain());

    oscillator1.frequency.value = 100;
    oscillator2.frequency.value = 150;
    oscillator1.type = "sine";
    oscillator2.type = "sine";

    gainNode.gain.value = 0.02;

    oscillator1.start();
    oscillator2.start();

    return () => {
      oscillator1.stop();
      oscillator2.stop();
    };
  }
}

export const audio = new AudioEngine();

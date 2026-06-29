export class AlarmSound {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private isPlaying: boolean = false;
  private fadeInInterval: ReturnType<typeof setInterval> | null = null;
  private melodyTimeout: ReturnType<typeof setTimeout> | null = null;
  private melodyIndex: number = 0;
  private targetVolume: number = 0.7;

  private readonly chordNotes = [
    [261.63, 329.63, 392.00],
    [293.66, 349.23, 440.00],
    [329.63, 392.00, 493.88],
    [349.23, 440.00, 523.25],
  ];

  constructor() {}

  async start(fadeInSeconds: number = 30): Promise<void> {
    if (this.isPlaying) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.audioContext.destination);

    this.isPlaying = true;
    this.melodyIndex = 0;

    this.playMelody();
    this.startFadeIn(fadeInSeconds);
  }

  private startFadeIn(durationSeconds: number): void {
    if (!this.masterGain) return;

    const steps = 60;
    const stepTime = (durationSeconds * 1000) / steps;
    const stepGain = this.targetVolume / steps;
    let currentStep = 0;

    this.fadeInInterval = setInterval(() => {
      if (!this.masterGain || !this.isPlaying) {
        if (this.fadeInInterval) {
          clearInterval(this.fadeInInterval);
          this.fadeInInterval = null;
        }
        return;
      }

      currentStep++;
      const gainValue = Math.min(stepGain * currentStep, this.targetVolume);
      this.masterGain.gain.setValueAtTime(gainValue, this.audioContext!.currentTime);

      if (currentStep >= steps) {
        if (this.fadeInInterval) {
          clearInterval(this.fadeInInterval);
          this.fadeInInterval = null;
        }
      }
    }, stepTime);
  }

  private playMelody(): void {
    if (!this.audioContext || !this.masterGain || !this.isPlaying) return;

    const bpm = 60;
    const beatDuration = 60000 / bpm;

    const chord = this.chordNotes[this.melodyIndex % this.chordNotes.length];

    this.clearOscillators();

    chord.forEach((freq) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, this.audioContext!.currentTime);
      gain.gain.linearRampToValueAtTime(
        0.15 / chord.length,
        this.audioContext!.currentTime + 0.1
      );
      gain.gain.linearRampToValueAtTime(
        0.1 / chord.length,
        this.audioContext!.currentTime + beatDuration / 1000 - 0.1
      );
      gain.gain.linearRampToValueAtTime(
        0,
        this.audioContext!.currentTime + beatDuration / 1000
      );

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start();

      this.oscillators.push(osc);
      this.gainNodes.push(gain);
    });

    this.melodyIndex++;

    this.melodyTimeout = setTimeout(() => {
      this.playMelody();
    }, beatDuration);
  }

  private clearOscillators(): void {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.gainNodes.forEach((gain) => {
      try {
        gain.disconnect();
      } catch (e) {}
    });
    this.oscillators = [];
    this.gainNodes = [];
  }

  stop(): void {
    this.isPlaying = false;

    if (this.fadeInInterval) {
      clearInterval(this.fadeInInterval);
      this.fadeInInterval = null;
    }

    if (this.melodyTimeout) {
      clearTimeout(this.melodyTimeout);
      this.melodyTimeout = null;
    }

    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
    }

    setTimeout(() => {
      this.clearOscillators();

      if (this.masterGain) {
        try {
          this.masterGain.disconnect();
        } catch (e) {}
        this.masterGain = null;
      }

      if (this.audioContext) {
        try {
          this.audioContext.close();
        } catch (e) {}
        this.audioContext = null;
      }
    }, 600);
  }

  setVolume(vol: number): void {
    this.targetVolume = Math.max(0, Math.min(1, vol));

    if (this.masterGain && this.audioContext && this.isPlaying) {
      this.masterGain.gain.linearRampToValueAtTime(
        this.targetVolume,
        this.audioContext.currentTime + 0.3
      );
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

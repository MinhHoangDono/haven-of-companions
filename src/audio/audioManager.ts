interface AudioWindow extends Window {
  AudioContext: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private musicIntervalId: number | null = null;

  private pentatonicNotes = [220, 261.63, 293.66, 329.63, 392, 440, 523.25]; // A3, C4, D4, E4, G4, A4, C5

  public init() {
    if (this.ctx) return;
    if (typeof window !== 'undefined') {
      const win = window as AudioWindow;
      const AudioContextClass = win.AudioContext || win.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  public unlock() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!muted) {
      this.unlock();
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  private startAmbientMusic() {
    if (this.musicIntervalId || this.isMuted) return;

    // Play a gentle acoustic lo-fi chord arpeggio every 2.4s
    this.musicIntervalId = window.setInterval(() => {
      if (this.isMuted || !this.ctx) return;

      const baseNote = this.pentatonicNotes[Math.floor(Math.random() * this.pentatonicNotes.length)];
      this.playAcousticPluck(baseNote, 0.08);

      setTimeout(() => {
        if (!this.isMuted) {
          const secondNote = this.pentatonicNotes[Math.floor(Math.random() * this.pentatonicNotes.length)];
          this.playAcousticPluck(secondNote, 0.06);
        }
      }, 400);

      setTimeout(() => {
        if (!this.isMuted) {
          const thirdNote = this.pentatonicNotes[Math.floor(Math.random() * this.pentatonicNotes.length)];
          this.playAcousticPluck(thirdNote, 0.05);
        }
      }, 900);
    }, 2600);
  }

  private stopAmbientMusic() {
    if (this.musicIntervalId) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  /**
   * Warm acoustic guitar/lute pluck synthesis
   */
  private playAcousticPluck(freq: number, gainValue: number) {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Triangle wave gives warm woody acoustic timbre
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Warm low-pass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 1.2);

    // Pluck envelope: sharp attack, gentle decay
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainValue, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.5);
  }

  /**
   * Interactive Sound Effects
   */
  public playTap() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playAbility(type: 'nature_bloom' | 'aegis_shield' | 'firework_burst' | 'water_slash') {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    switch (type) {
      case 'nature_bloom':
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.9);
          }, idx * 75);
        });
        break;

      case 'aegis_shield':
        [220, 440, 880].forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 1.3);
        });
        break;

      case 'firework_burst':
        // Crackle pop
        [300, 150, 60].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.4);
          }, idx * 60);
        });
        break;

      case 'water_slash':
        [400, 600, 800].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.07, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.5);
          }, idx * 50);
        });
        break;
    }
  }

  public playToast() {
    if (!this.ctx || this.isMuted) return;
    // Sequential chime frequencies
    [880, 1318.51].forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.7);
      }, i * 90);
    });
  }
}

export const audioManager = new AudioManager();

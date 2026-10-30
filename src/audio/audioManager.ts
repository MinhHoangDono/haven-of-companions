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

  public playAbility(
    type:
      | 'nature_bloom'
      | 'aegis_shield'
      | 'firework_burst'
      | 'water_slash'
      | 'eagle_scout'
      | 'lute_hymn'
      | 'dawn_light'
      | 'swashbuckle_coin'
      | 'tidal_wave'
      | string
  ) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    switch (type) {
      // 1. Anh Thi
      case 'active_seed_of_life':
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

      case 'ult_forest_awakening':
        [130.81, 196.0, 261.63, 329.63, 392.0, 523.25].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.09, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 1.3);
          }, idx * 70);
        });
        break;

      // 2. Phương Quỳnh
      case 'active_resonating_arrow':
      case 'eagle_scout':
        [880, 1174.66, 1760, 2349.32].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.07, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.55);
          }, idx * 60);
        });
        break;

      case 'ult_hymn_of_wilds':
        [329.63, 392.0, 493.88, 587.33, 659.25, 783.99, 987.77].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 1.5);
          }, idx * 60);
        });
        break;

      // 3. Trâm Anh
      case 'active_void_brush':
      case 'lute_hymn':
        [329.63, 392.0, 493.88, 587.33, 659.25].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.85);
          }, idx * 60);
        });
        break;

      case 'ult_spatial_masterpiece':
        [220, 277.18, 329.63, 440, 554.37, 659.25].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 1.3);
          }, idx * 80);
        });
        break;

      // 4. Khải Vạn
      case 'active_firework_orb':
      case 'firework_burst':
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

      case 'ult_celestial_nocturne':
        [400, 300, 200, 150, 100, 60].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.65);
          }, idx * 90);
        });
        break;

      // 5. Thảo Uyên
      case 'active_guardian_light':
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

      case 'ult_dawn_resurgence':
      case 'dawn_light':
        [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5].forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 1.9);
        });
        break;

      // 6. Ngọc Hà
      case 'active_athletic_tempo':
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

      case 'ult_infinite_flurry':
        [90, 120, 150, 180, 240, 320].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.55);
          }, idx * 70);
        });
        break;

      // 7. Thanh Phương
      case 'active_resilient_torrent':
        [220, 330, 440, 550].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.65);
          }, idx * 60);
        });
        break;

      case 'ult_ocean_tsunami':
        [110, 164.81, 220, 293.66, 440].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 1.3);
          }, idx * 80);
        });
        break;

      // 8. Xuân Minh
      case 'active_fearless_charge':
      case 'swashbuckle_coin':
        [1318.51, 1567.98, 2093.0].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.45);
          }, idx * 45);
        });
        break;

      case 'ult_party_frenzy':
        [440, 554.37, 659.25, 880, 1108.73, 1318.51].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.09, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.5);
          }, idx * 45);
        });
        break;

      // 9. Lâm Anh Thư
      case 'active_serene_wave':
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.07, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.75);
          }, idx * 75);
        });
        break;

      case 'ult_passionate_geyser':
      case 'tidal_wave':
        [180, 260, 392, 587.33, 880].forEach((freq, idx) => {
          setTimeout(() => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.09, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 1.3);
          }, idx * 75);
        });
        break;
    }
  }

  public playCelebrationCheer() {
    if (!this.ctx || this.isMuted) return;
    // Rapid festive arpeggios + fireworks bursts
    [440, 554.37, 659.25, 880, 1108.73, 1318.51].forEach((freq, idx) => {
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
      }, idx * 60);
    });
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

  public playBuildPlaceSound() {
    if (!this.ctx || this.isMuted) return;
    [523.25, 783.99].forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.09, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      }, i * 75);
    });
  }

  public playDemolishSound() {
    if (!this.ctx || this.isMuted) return;
    [261.63, 164.81].forEach((freq, i) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      }, i * 90);
    });
  }

  /**
   * 3D Platformer Collectible Chime (Coins, Leaves, Shells)
   */
  public playPickup(type: string = 'gold_coin') {
    if (!this.ctx || this.isMuted) return;

    let freqs = [1046.5, 1318.5, 1567.98]; // C6, E6, G6 bright crystal
    if (type === 'dalat_tea') {
      freqs = [659.25, 880, 1174.66]; // E5, A5, D6 verdant chime
    } else if (type === 'sea_conch') {
      freqs = [587.33, 783.99, 1046.5]; // D5, G5, C6 ocean chime
    } else if (type === 'firework_ember') {
      freqs = [783.99, 1174.66, 1760.0]; // G5, D6, A6 fire sparkle
    }

    freqs.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      }, idx * 55);
    });
  }

  /**
   * High-Jump Wind Geyser Spring Launch
   */
  public playSpring() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.35);

    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.55);
  }

  /**
   * Fragile Pier Plank Creak & Rumble
   */
  public playWoodCreak() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.25);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.32);
  }
}

export const audioManager = new AudioManager();

import * as THREE from 'three';

const BOLT_LIFETIME = 0.12; // 120 ms visible bolt

/**
 * LightningEffect — procedural electric bolt with a 2-stage sky strobe
 * flash and Web Audio synthesised thunder rumble.
 *
 * The bolt is built from subdivided line segments with random jitter and
 * one branch fork, rendered as `THREE.LineSegments` (single draw call).
 *
 * Timing uses a Poisson-style random interval (8–18 s) during storm state.
 */
export class LightningEffect extends THREE.Group {
  private boltMesh: THREE.LineSegments | null = null;
  private boltMaterial: THREE.LineBasicMaterial;

  private flashTimer = 0;
  private strikeTimer = 0;
  private active = false;

  // Scene light references for flash spike
  private sunLight: THREE.DirectionalLight | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private baseSunIntensity = 1.35;
  private baseAmbientIntensity = 0.2;

  // Lazy-init audio context (saves memory when lightning isn't active)
  private audioCtx: AudioContext | null = null;

  constructor() {
    super();
    this.boltMaterial = new THREE.LineBasicMaterial({
      color: 0xeeeeff,
      transparent: true,
      opacity: 1,
      linewidth: 2,
    });
    this.resetStrikeInterval();
  }

  /** Attach scene lights so flash can spike their intensity. */
  public setLights(sun: THREE.DirectionalLight, ambient: THREE.AmbientLight): void {
    this.sunLight = sun;
    this.ambientLight = ambient;
  }

  /** Enable / disable periodic lightning strikes. */
  public setActive(active: boolean): void {
    this.active = active;
    if (!active) {
      this.removeBolt();
      this.flashTimer = 0;
      // Restore intensities immediately when deactivated
      if (this.sunLight) this.sunLight.intensity = this.baseSunIntensity;
      if (this.ambientLight) this.ambientLight.intensity = this.baseAmbientIntensity;
    }
  }

  /** Keep flash baseline in sync with the weather system's LERP. */
  public setBaseIntensities(sun: number, ambient: number): void {
    this.baseSunIntensity = sun;
    this.baseAmbientIntensity = ambient;
  }

  /** Call once per frame. */
  public update(dt: number): void {
    // ── Flash decay ──
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      const t = Math.max(0, this.flashTimer / BOLT_LIFETIME);

      // 2-stage strobe: initial spike then rapid decay
      const flashIntensity = t > 0.5 ? t * 2 : t;

      if (this.sunLight) {
        this.sunLight.intensity = this.baseSunIntensity + flashIntensity * 4.0;
      }
      if (this.ambientLight) {
        this.ambientLight.intensity = this.baseAmbientIntensity + flashIntensity * 2.0;
      }

      if (this.flashTimer <= 0) {
        this.removeBolt();
        if (this.sunLight) this.sunLight.intensity = this.baseSunIntensity;
        if (this.ambientLight) this.ambientLight.intensity = this.baseAmbientIntensity;
      }
    }

    if (!this.active) return;

    // ── Poisson timer for next strike (8–18 s) ──
    this.strikeTimer -= dt;
    if (this.strikeTimer <= 0) {
      this.triggerStrike();
      this.resetStrikeInterval();
    }
  }

  // ────────────────── private helpers ──────────────────

  private resetStrikeInterval(): void {
    this.strikeTimer = 8 + Math.random() * 10;
  }

  private triggerStrike(): void {
    this.removeBolt();

    // Random origin above the diorama
    const startX = (Math.random() - 0.5) * 20;
    const startZ = (Math.random() - 0.5) * 20;
    const points = this.generateBolt(
      new THREE.Vector3(startX, 18, startZ),
      new THREE.Vector3(
        startX + (Math.random() - 0.5) * 4,
        1,
        startZ + (Math.random() - 0.5) * 4,
      ),
    );

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    this.boltMesh = new THREE.LineSegments(geometry, this.boltMaterial);
    this.add(this.boltMesh);

    // Stage 1: Instant intensity spike
    this.flashTimer = BOLT_LIFETIME;

    // Stage 2: Thunder rumble delayed 1.2 s
    setTimeout(() => this.playThunder(), 1200);
  }

  /**
   * Subdivide a straight segment three times with random jitter to
   * produce a jagged bolt, then append a single branch fork.
   */
  private generateBolt(start: THREE.Vector3, end: THREE.Vector3): THREE.Vector3[] {
    const midpoints: THREE.Vector3[] = [start.clone(), end.clone()];

    // Three subdivision passes with decreasing jitter
    for (let iter = 0; iter < 3; iter++) {
      const next: THREE.Vector3[] = [midpoints[0]];
      for (let i = 1; i < midpoints.length; i++) {
        const mid = midpoints[i - 1].clone().lerp(midpoints[i], 0.5);
        const jitter = 2 / (iter + 1);
        mid.x += (Math.random() - 0.5) * jitter;
        mid.z += (Math.random() - 0.5) * jitter;
        mid.y += (Math.random() - 0.5) * jitter * 0.5;
        next.push(mid, midpoints[i]);
      }
      midpoints.length = 0;
      midpoints.push(...next);
    }

    // Convert to line-segment pairs
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < midpoints.length - 1; i++) {
      points.push(midpoints[i], midpoints[i + 1]);
    }

    // Single branch fork from a random interior node
    if (midpoints.length > 4) {
      const idx = 2 + Math.floor(Math.random() * (midpoints.length - 4));
      const bStart = midpoints[idx].clone();
      const bEnd = bStart.clone();
      bEnd.x += (Math.random() - 0.5) * 4;
      bEnd.y -= 2 + Math.random() * 3;
      bEnd.z += (Math.random() - 0.5) * 4;

      const bMid = bStart.clone().lerp(bEnd, 0.5);
      bMid.x += (Math.random() - 0.5) * 1.5;
      bMid.z += (Math.random() - 0.5) * 1.5;

      points.push(bStart, bMid, bMid, bEnd);
    }

    return points;
  }

  private removeBolt(): void {
    if (this.boltMesh) {
      this.boltMesh.geometry.dispose();
      this.remove(this.boltMesh);
      this.boltMesh = null;
    }
  }

  /** Synthesise a low-frequency thunder rumble via Web Audio. */
  private playThunder(): void {
    try {
      if (!this.audioCtx) {
        const win = window as unknown as {
          AudioContext?: typeof AudioContext;
          webkitAudioContext?: typeof AudioContext;
        };
        const Ctor = win.AudioContext || win.webkitAudioContext;
        if (!Ctor) return;
        this.audioCtx = new Ctor();
      }
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') return; // honour user gesture gate

      const now = ctx.currentTime;
      const duration = 1.8;
      const bufferSize = Math.ceil(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Shaped noise: fast attack, exponential decay → rumble envelope
      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        const envelope = Math.exp(-t * 2.5) * (1 - Math.exp(-t * 30));
        data[i] = (Math.random() * 2 - 1) * envelope;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180;
      filter.Q.value = 0.7;

      const gain = ctx.createGain();
      gain.gain.value = 0.35;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(now);
    } catch {
      // Audio API unavailable — silent fallback
    }
  }

  public dispose(): void {
    this.removeBolt();
    this.boltMaterial.dispose();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
    }
  }
}

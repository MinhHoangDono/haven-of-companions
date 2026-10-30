import * as THREE from 'three';
import { PrecipitationEngine } from './PrecipitationEngine';
import { LightningEffect } from './LightningEffect';
import { FoliageWindHook } from '../materials/FoliageWindHook';
import type { LightingManager } from '../LightingManager';

// ────────────────── Weather State & Presets ──────────────────

export type WeatherState = 'clear' | 'mist' | 'rain' | 'storm' | 'blossom';

export interface WeatherPreset {
  fogDensity: number;
  fogColor: number;
  sunColor: number;
  sunIntensity: number;
  ambientIntensity: number;
  windSpeed: number;
  windDirX: number;
  windDirZ: number;
  precipitationType: 'none' | 'rain' | 'petal';
  lightning: boolean;
  mistPlanes: boolean;
}

const PRESETS: Record<WeatherState, WeatherPreset> = {
  clear: {
    fogDensity: 0.012,
    fogColor: 0x82a6c8,
    sunColor: 0xfffaee,
    sunIntensity: 1.35,
    ambientIntensity: 0.2,
    windSpeed: 0.15,
    windDirX: 0.8,
    windDirZ: 0.6,
    precipitationType: 'none',
    lightning: false,
    mistPlanes: false,
  },
  mist: {
    fogDensity: 0.035,
    fogColor: 0x6366f1,
    sunColor: 0xccbbdd,
    sunIntensity: 0.7,
    ambientIntensity: 0.35,
    windSpeed: 0.08,
    windDirX: 0.3,
    windDirZ: 0.9,
    precipitationType: 'none',
    lightning: false,
    mistPlanes: true,
  },
  rain: {
    fogDensity: 0.028,
    fogColor: 0x2a3548,
    sunColor: 0x8899aa,
    sunIntensity: 0.55,
    ambientIntensity: 0.15,
    windSpeed: 0.6,
    windDirX: 0.7,
    windDirZ: 0.5,
    precipitationType: 'rain',
    lightning: false,
    mistPlanes: false,
  },
  storm: {
    fogDensity: 0.040,
    fogColor: 0x161c28,
    sunColor: 0x556677,
    sunIntensity: 0.3,
    ambientIntensity: 0.1,
    windSpeed: 1.0,
    windDirX: 0.9,
    windDirZ: 0.4,
    precipitationType: 'rain',
    lightning: true,
    mistPlanes: false,
  },
  blossom: {
    fogDensity: 0.014,
    fogColor: 0xf5e6d3,
    sunColor: 0xffcc88,
    sunIntensity: 1.2,
    ambientIntensity: 0.3,
    windSpeed: 0.35,
    windDirX: -0.6,
    windDirZ: 0.8,
    precipitationType: 'petal',
    lightning: false,
    mistPlanes: false,
  },
};

const TRANSITION_DURATION = 2.0; // seconds

// Pre-allocated temporaries for colour LERP (zero per-frame allocation)
const _targetFogColor = new THREE.Color();
const _targetSunColor = new THREE.Color();

/**
 * WeatherSystem — centralised atmospheric controller that orchestrates
 * precipitation (rain / sakura petals), Đà Lạt highland mist planes,
 * procedural lightning, and smooth 2-second LERP transitions between
 * five weather presets.
 *
 * Adds **≤ 3 draw calls** to the scene (1 × InstancedMesh precipitation,
 * 1 × lightning bolt LineSegments when active, up to 3 × mist planes
 * — mist planes are simple pass-through and very cheap).
 */
export class WeatherSystem extends THREE.Group {
  private precipitation: PrecipitationEngine;
  private lightning: LightningEffect;

  // Đà Lạt mist: 3 translucent horizontal cloud planes
  private mistPlanes: THREE.Mesh[] = [];
  private mistMaterials: THREE.MeshBasicMaterial[] = [];

  private targetState: WeatherState = 'clear';
  private transitionProgress = 1; // 1 = complete, 0 = just started

  // Whether the weather system is actively overriding scene lighting.
  // False when state is 'clear' and transition is complete.
  private isOverriding = false;

  // ── Interpolated current values ──
  private curFogDensity = 0.012;
  private curFogColor = new THREE.Color(0x82a6c8);
  private curSunColor = new THREE.Color(0xfffaee);
  private curSunIntensity = 1.35;
  private curAmbientIntensity = 0.2;
  private curWindSpeed = 0.15;
  private curWindDirX = 0.8;
  private curWindDirZ = 0.6;

  // ── Snapshot of values at transition start ──
  private srcFogDensity = 0.012;
  private srcFogColor = new THREE.Color(0x82a6c8);
  private srcSunColor = new THREE.Color(0xfffaee);
  private srcSunIntensity = 1.35;
  private srcAmbientIntensity = 0.2;
  private srcWindSpeed = 0.15;
  private srcWindDirX = 0.8;
  private srcWindDirZ = 0.6;

  // Scene references
  private scene: THREE.Scene;
  private sunLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private lightingManager: LightingManager;

  constructor(
    scene: THREE.Scene,
    lightingManager: LightingManager,
  ) {
    super();
    this.scene = scene;
    this.lightingManager = lightingManager;
    this.sunLight = lightingManager.getSunLight();
    this.ambientLight = lightingManager.getAmbientLight();

    // Precipitation engine (rain drops & sakura petals)
    this.precipitation = new PrecipitationEngine();
    this.add(this.precipitation);

    // Lightning effect (procedural bolt + flash + thunder)
    this.lightning = new LightningEffect();
    this.lightning.setLights(this.sunLight, this.ambientLight);
    this.add(this.lightning);

    // Đà Lạt highland rolling mist planes
    this.createMistPlanes();
  }

  // ────────────────── Mist plane creation ──────────────────

  private createMistPlanes(): void {
    const heights = [1.0, 2.0, 3.0];
    const sizes = [40, 50, 60];

    heights.forEach((y, i) => {
      // Generate a small canvas-based cloud alpha texture
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx2d = canvas.getContext('2d')!;
      const imageData = ctx2d.createImageData(128, 128);

      // Layered sine-based soft cloud noise
      for (let px = 0; px < 128 * 128; px++) {
        const ix = px % 128;
        const iy = Math.floor(px / 128);
        const nx = ix / 128;
        const ny = iy / 128;
        const noise =
          Math.sin(nx * 12.56 + i) * 0.3 +
          Math.sin(ny * 18.85 + i * 2) * 0.3 +
          Math.sin((nx + ny) * 25.13) * 0.2 +
          Math.sin((nx * 2 - ny * 3) * 6.28) * 0.2;
        const alpha = Math.max(0, Math.min(1, noise * 0.5 + 0.5)) * 0.55;
        const idx = px * 4;
        imageData.data[idx] = 255;
        imageData.data[idx + 1] = 255;
        imageData.data[idx + 2] = 255;
        imageData.data[idx + 3] = Math.floor(alpha * 255);
      }
      ctx2d.putImageData(imageData, 0, 0);

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;

      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        color: 0xc8b8e8, // rose-lavender tint
      });

      const geo = new THREE.PlaneGeometry(sizes[i], sizes[i]);
      const plane = new THREE.Mesh(geo, mat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = y;
      plane.visible = false;
      this.add(plane);
      this.mistPlanes.push(plane);
      this.mistMaterials.push(mat);
    });
  }

  // ────────────────── Public API ──────────────────

  /**
   * Transition to a new weather state with a smooth 2-second LERP.
   * If `state` is already the target, this is a no-op.
   */
  public setWeather(state: WeatherState): void {
    if (state === this.targetState) return;

    // When transitioning FROM clear, read the live scene values as the
    // source so we interpolate from whatever time-of-day is active.
    if (!this.isOverriding) {
      this.readSceneValues();
    }

    // Snapshot current interpolated values as transition source
    this.srcFogDensity = this.curFogDensity;
    this.srcFogColor.copy(this.curFogColor);
    this.srcSunColor.copy(this.curSunColor);
    this.srcSunIntensity = this.curSunIntensity;
    this.srcAmbientIntensity = this.curAmbientIntensity;
    this.srcWindSpeed = this.curWindSpeed;
    this.srcWindDirX = this.curWindDirX;
    this.srcWindDirZ = this.curWindDirZ;

    this.targetState = state;
    this.transitionProgress = 0;
    this.isOverriding = true;

    // Immediate mode switches
    const preset = PRESETS[state];
    this.precipitation.setMode(preset.precipitationType);
    this.lightning.setActive(preset.lightning);

    // Show mist planes for mist weather
    this.mistPlanes.forEach((p) => (p.visible = preset.mistPlanes));
  }

  /**
   * Advance interpolation and sub-systems. Call once per frame.
   * @param dt   delta time in seconds
   * @param time elapsed time in seconds (for UV scrolling / flutter)
   */
  public update(dt: number, time: number): void {
    const targetPreset = PRESETS[this.targetState];

    // ── Smooth transition ──
    if (this.transitionProgress < 1) {
      this.transitionProgress = Math.min(1, this.transitionProgress + dt / TRANSITION_DURATION);

      // Smooth-step easing: S(t) = 3t² − 2t³
      const t = this.transitionProgress;
      const s = t * t * (3 - 2 * t);

      // When transitioning TO clear, use the LightingManager's desired
      // time-of-day values as the target instead of the static 'clear' preset.
      let tgtFogDensity = targetPreset.fogDensity;
      let tgtSunIntensity = targetPreset.sunIntensity;
      let tgtAmbientIntensity = targetPreset.ambientIntensity;

      _targetFogColor.setHex(targetPreset.fogColor);
      _targetSunColor.setHex(targetPreset.sunColor);

      if (this.targetState === 'clear') {
        const tod = this.lightingManager.getTimeOfDayPreset();
        tgtFogDensity = tod.fogDensity;
        _targetFogColor.setHex(tod.fogColor);
        _targetSunColor.setHex(tod.sunColor);
        tgtSunIntensity = tod.sunIntensity;
        tgtAmbientIntensity = tod.ambientIntensity;
      }

      this.curFogDensity = THREE.MathUtils.lerp(this.srcFogDensity, tgtFogDensity, s);
      this.curFogColor.copy(this.srcFogColor).lerp(_targetFogColor, s);
      this.curSunColor.copy(this.srcSunColor).lerp(_targetSunColor, s);
      this.curSunIntensity = THREE.MathUtils.lerp(this.srcSunIntensity, tgtSunIntensity, s);
      this.curAmbientIntensity = THREE.MathUtils.lerp(this.srcAmbientIntensity, tgtAmbientIntensity, s);
      this.curWindSpeed = THREE.MathUtils.lerp(this.srcWindSpeed, targetPreset.windSpeed, s);
      this.curWindDirX = THREE.MathUtils.lerp(this.srcWindDirX, targetPreset.windDirX, s);
      this.curWindDirZ = THREE.MathUtils.lerp(this.srcWindDirZ, targetPreset.windDirZ, s);

      // Apply interpolated values to scene objects
      this.applyToScene();

      // When transition to clear completes, yield control back
      if (this.transitionProgress >= 1 && this.targetState === 'clear') {
        this.isOverriding = false;
        // Re-apply time-of-day so LightingManager owns the values cleanly
        this.lightingManager.reapplyTimeOfDay();
      }
    } else if (this.isOverriding) {
      // Stable non-clear state: keep overriding scene values each frame
      // (protects against LightingManager.setTimeOfDay calls)
      this.applyToScene();
    }

    // ── Lightning base intensities track weather LERP ──
    this.lightning.setBaseIntensities(this.curSunIntensity, this.curAmbientIntensity);

    // ── Update sub-systems ──
    this.precipitation.setWind(this.curWindDirX, this.curWindDirZ, this.curWindSpeed);
    this.precipitation.update(dt, time);
    this.lightning.update(dt);

    // ── Mist plane UV scrolling and opacity fade ──
    this.updateMistPlanes(dt);
  }

  public getCurrentState(): WeatherState {
    return this.targetState;
  }

  public dispose(): void {
    this.precipitation.dispose();
    this.lightning.dispose();
    this.mistPlanes.forEach((p) => {
      p.geometry.dispose();
      const mat = p.material as THREE.MeshBasicMaterial;
      mat.map?.dispose();
      mat.dispose();
    });
  }

  // ────────────────── Private helpers ──────────────────

  /** Read live scene fog / light values into current-interpolation state. */
  private readSceneValues(): void {
    const fog = this.scene.fog as THREE.FogExp2 | null;
    if (fog) {
      this.curFogDensity = fog.density;
      this.curFogColor.copy(fog.color);
    }
    this.curSunColor.copy(this.sunLight.color);
    this.curSunIntensity = this.sunLight.intensity;
    this.curAmbientIntensity = this.ambientLight.intensity;
  }

  /** Write interpolated values to scene fog, lights, and foliage wind. */
  private applyToScene(): void {
    const fog = this.scene.fog as THREE.FogExp2 | null;
    if (fog) {
      fog.density = this.curFogDensity;
      fog.color.copy(this.curFogColor);
    }
    if (this.scene.background instanceof THREE.Color) {
      (this.scene.background as THREE.Color).copy(this.curFogColor);
    }
    this.sunLight.color.copy(this.curSunColor);
    this.sunLight.intensity = this.curSunIntensity;
    this.ambientLight.intensity = this.curAmbientIntensity;

    // Drive foliage wind from weather
    FoliageWindHook.setWind(this.curWindDirX, this.curWindDirZ, this.curWindSpeed);
  }

  private updateMistPlanes(dt: number): void {
    const targetPreset = PRESETS[this.targetState];

    if (targetPreset.mistPlanes) {
      // Scroll UVs and fade-in opacity
      this.mistMaterials.forEach((mat, i) => {
        if (mat.map) {
          mat.map.offset.x += dt * 0.02 * (1 + i * 0.3);
          mat.map.offset.y += dt * 0.01 * (1 + i * 0.2);
        }
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.4 + i * 0.05, dt * 2);
      });
    } else {
      // Fade out and hide
      this.mistMaterials.forEach((mat, i) => {
        if (mat.opacity > 0.01) {
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, dt * 3);
          if (mat.opacity < 0.01) {
            mat.opacity = 0;
            this.mistPlanes[i].visible = false;
          }
        }
      });
    }
  }
}

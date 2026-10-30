import * as THREE from 'three';
import { TimeOfDay } from '../../components/ui/TopBar';

export interface TimeOfDayLightPreset {
  fogDensity: number;
  fogColor: number;
  sunColor: number;
  sunIntensity: number;
  ambientIntensity: number;
}

const TIME_OF_DAY_PRESETS: Record<TimeOfDay, TimeOfDayLightPreset> = {
  day:    { fogDensity: 0.016, fogColor: 0x82a6c8, sunColor: 0xfffaee, sunIntensity: 1.35, ambientIntensity: 0.2 },
  dawn:   { fogDensity: 0.024, fogColor: 0x5a4860, sunColor: 0xffaa77, sunIntensity: 1.05, ambientIntensity: 0.2 },
  sunset: { fogDensity: 0.022, fogColor: 0x46222c, sunColor: 0xff6022, sunIntensity: 1.3,  ambientIntensity: 0.2 },
  night:  { fogDensity: 0.028, fogColor: 0x0a101d, sunColor: 0x385588, sunIntensity: 0.35, ambientIntensity: 0.2 },
};

export class LightingManager {
  private scene: THREE.Scene;
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private ambientLight: THREE.AmbientLight;
  private currentTimeOfDay: TimeOfDay = 'day';

  // Point lights
  private campfireLight: THREE.PointLight;
  private streetLanterns: THREE.PointLight[] = [];
  private shrinePearlLight: THREE.PointLight;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Ambient & Hemisphere Light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xb1e1ff, 0x38281b, 0.65);
    this.hemiLight.position.set(0, 30, 0);
    scene.add(this.hemiLight);

    // 2. Directional Sun Light (Shadow Caster)
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.3);
    this.sunLight.position.set(12, 18, 10);
    this.sunLight.castShadow = true;

    // Crisp soft shadow configuration
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 50;
    this.sunLight.shadow.bias = -0.0006;
    this.sunLight.shadow.radius = 2.0;

    const d = 10;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;

    scene.add(this.sunLight);

    // 3. Point Lights
    // Campfire Hearth
    this.campfireLight = new THREE.PointLight(0xff7722, 2.2, 7.0, 1.5);
    this.campfireLight.position.set(-3.8, 2.3, -4.8);
    scene.add(this.campfireLight);

    // Street Lamps
    [{ x: 1.5, y: 2.4, z: -4.5 }, { x: 6.2, y: 2.4, z: -3.5 }, { x: 3.5, y: 2.4, z: 0.5 }].forEach((pt) => {
      const lamp = new THREE.PointLight(0xffb030, 1.4, 5.5, 1.5);
      lamp.position.set(pt.x, pt.y, pt.z);
      scene.add(lamp);
      this.streetLanterns.push(lamp);
    });

    // Tide Shrine Pearl
    this.shrinePearlLight = new THREE.PointLight(0x44ddff, 1.8, 5.0, 1.5);
    this.shrinePearlLight.position.set(6.0, 1.2, 3.5);
    scene.add(this.shrinePearlLight);

    // Initial Day Setting
    this.setTimeOfDay('day');
  }

  public setTimeOfDay(timeOfDay: TimeOfDay) {
    this.currentTimeOfDay = timeOfDay;
    switch (timeOfDay) {
      case 'day':
        this.scene.background = new THREE.Color(0x82a6c8);
        this.scene.fog = new THREE.FogExp2(0x82a6c8, 0.016);

        this.sunLight.color.setHex(0xfffaee);
        this.sunLight.intensity = 1.35;
        this.sunLight.position.set(12, 18, 10);

        this.hemiLight.color.setHex(0xb1e1ff);
        this.hemiLight.groundColor.setHex(0x38281b);
        this.hemiLight.intensity = 0.65;

        this.campfireLight.intensity = 1.0;
        this.streetLanterns.forEach((l) => (l.intensity = 0.4));
        break;

      case 'dawn':
        this.scene.background = new THREE.Color(0x5a4860);
        this.scene.fog = new THREE.FogExp2(0x5a4860, 0.024);

        this.sunLight.color.setHex(0xffaa77);
        this.sunLight.intensity = 1.05;
        this.sunLight.position.set(15, 8, 6);

        this.hemiLight.color.setHex(0xffaa88);
        this.hemiLight.groundColor.setHex(0x2a1c24);
        this.hemiLight.intensity = 0.5;

        this.campfireLight.intensity = 1.8;
        this.streetLanterns.forEach((l) => (l.intensity = 1.2));
        break;

      case 'sunset':
        // Dramatic low amber sun with long DOS2 shadows
        this.scene.background = new THREE.Color(0x46222c);
        this.scene.fog = new THREE.FogExp2(0x46222c, 0.022);

        this.sunLight.color.setHex(0xff6022);
        this.sunLight.intensity = 1.3;
        this.sunLight.position.set(-14, 6, 12);

        this.hemiLight.color.setHex(0xff7744);
        this.hemiLight.groundColor.setHex(0x241218);
        this.hemiLight.intensity = 0.45;

        this.campfireLight.intensity = 2.4;
        this.streetLanterns.forEach((l) => (l.intensity = 1.8));
        break;

      case 'night':
        // Deep indigo night with glowing warm lanterns
        this.scene.background = new THREE.Color(0x0a101d);
        this.scene.fog = new THREE.FogExp2(0x0a101d, 0.028);

        this.sunLight.color.setHex(0x385588);
        this.sunLight.intensity = 0.35;
        this.sunLight.position.set(-8, 14, -8);

        this.hemiLight.color.setHex(0x223555);
        this.hemiLight.groundColor.setHex(0x0e1422);
        this.hemiLight.intensity = 0.25;

        this.campfireLight.intensity = 3.2;
        this.streetLanterns.forEach((l) => (l.intensity = 2.2));
        break;
    }
  }

  public update(time: number) {
    // Campfire subtle flame flicker
    const flicker = Math.sin(time * 0.008) * 0.25 + Math.sin(time * 0.023) * 0.15;
    this.campfireLight.intensity = Math.max(0.2, this.campfireLight.intensity + flicker * 0.1);
  }

  // ── Weather System Integration ──

  /** Expose the directional sun light for weather overrides. */
  public getSunLight(): THREE.DirectionalLight {
    return this.sunLight;
  }

  /** Expose the ambient light for weather overrides. */
  public getAmbientLight(): THREE.AmbientLight {
    return this.ambientLight;
  }

  /**
   * Return the fog/light values the current time-of-day would produce,
   * without side-effects. Used by WeatherSystem to know what to LERP
   * toward when transitioning back to 'clear'.
   */
  public getTimeOfDayPreset(): TimeOfDayLightPreset {
    return TIME_OF_DAY_PRESETS[this.currentTimeOfDay];
  }

  /**
   * Re-apply the current time-of-day lighting. Called by WeatherSystem
   * after a transition to 'clear' completes so LightingManager owns
   * the scene values cleanly again.
   */
  public reapplyTimeOfDay(): void {
    this.setTimeOfDay(this.currentTimeOfDay);
  }
}

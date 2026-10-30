import * as THREE from 'three';
import {
  BatchedRenderer,
  ParticleSystem,
  RenderMode,
  ConstantValue,
  IntervalValue,
  ConstantColor,
  ColorRange,
  Gradient,
  Bezier,
  PiecewiseBezier,
  SphereEmitter,
  ConeEmitter,
  CircleEmitter,
  DonutEmitter,
  ColorOverLife,
  SizeOverLife,
  ApplyForce,
  Vector4,
  Vector3 as QVector3,
} from 'three.quarks';
import { AbilityEffectType } from '../../types/character';

// Shared texture loader — textures are cached by Three.js internally
const textureLoader = new THREE.TextureLoader();

function loadTex(name: string): THREE.Texture {
  const tex = textureLoader.load(`textures/particles/${name}`);
  tex.flipY = false;
  return tex;
}

/** Preloaded CC0 particle sprite atlas from Kenney Particle Pack */
const TEX = {
  circle: loadTex('circle_05.png'),
  magic: loadTex('magic_03.png'),
  slash: loadTex('slash_02.png'),
  spark: loadTex('spark_04.png'),
  smoke: loadTex('smoke_01.png'),
  flame: loadTex('flame_01.png'),
};

/** Convenience: billboard material with additive blending */
function additiveMat(texture: THREE.Texture, color = 0xffffff): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
    color,
  });
}

/** Convenience: standard billboard material with normal blending */
function alphaMat(texture: THREE.Texture, color = 0xffffff): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    blending: THREE.NormalBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
    color,
  });
}

/** Fade-out size curve: 1 → 0 over lifetime */
function fadeOutSize(): PiecewiseBezier {
  return new PiecewiseBezier([[new Bezier(1, 0.9, 0.4, 0), 0]]);
}

/** Bell-curve size: 0 → 1 → 0 */
function bellSize(): PiecewiseBezier {
  return new PiecewiseBezier([[new Bezier(0, 1.2, 1.2, 0), 0]]);
}


/** Gradient that fades alpha from 1 → 0 over lifetime */
function fadeAlphaGradient(r: number, g: number, b: number): Gradient {
  return new Gradient(
    [[new QVector3(r, g, b), 0], [new QVector3(r, g, b), 1]],
    [[1, 0], [0, 1]],
  );
}

/**
 * GPU-Batched Fantasy Spell VFX Engine
 *
 * Uses three.quarks BatchedRenderer to render all 9 hero signature
 * ability particle effects in a single batched draw call.
 */
export class SpellEffect3D {
  private scene: THREE.Scene;
  public readonly batchRenderer: BatchedRenderer;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.batchRenderer = new BatchedRenderer();
    scene.add(this.batchRenderer);
  }

  /** Register a particle system: add emitter to scene, register with batch renderer. */
  private addSystem(system: ParticleSystem, origin: THREE.Vector3): void {
    system.emitter.position.set(origin.x, origin.y, origin.z);
    this.scene.add(system.emitter);
    this.batchRenderer.addSystem(system);
  }

  /** Temporary dynamic point light that fades out over durationMs */
  private addTemporaryLight(color: number, intensity: number, distance: number, origin: THREE.Vector3, durationMs = 1800): void {
    const light = new THREE.PointLight(color, intensity, distance, 1.8);
    light.position.set(origin.x, origin.y + 0.8, origin.z);
    this.scene.add(light);
    const startTime = performance.now();
    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = elapsed / durationMs;
      if (progress >= 1.0) {
        clearInterval(interval);
        this.scene.remove(light);
        light.dispose();
      } else {
        light.intensity = intensity * Math.max(0, 1 - progress);
      }
    }, 50);
  }

  // ────────────────────────────── Public API ──────────────────────────────

  public castSpell(effectType: AbilityEffectType, origin: THREE.Vector3): void {
    switch (effectType) {
      // 1. Huỳnh Trần Anh Thi
      case 'active_seed_of_life':
      case 'nature_bloom':
        this.createActiveSeedOfLife(origin);
        break;
      case 'ult_forest_awakening':
        this.createUltForestAwakening(origin);
        break;

      // 2. Lê Nguyễn Phương Quỳnh
      case 'active_resonating_arrow':
      case 'eagle_scout':
        this.createActiveResonatingArrow(origin);
        break;
      case 'ult_hymn_of_wilds':
        this.createUltHymnOfWilds(origin);
        break;

      // 3. Trần Nguyễn Trâm Anh
      case 'active_void_brush':
      case 'lute_hymn':
        this.createActiveVoidBrush(origin);
        break;
      case 'ult_spatial_masterpiece':
        this.createUltSpatialMasterpiece(origin);
        break;

      // 4. Nguyễn Khải Vạn
      case 'active_firework_orb':
      case 'firework_burst':
        this.createActiveFireworkOrb(origin);
        break;
      case 'ult_celestial_nocturne':
        this.createUltCelestialNocturne(origin);
        break;

      // 5. Nguyễn Trần Thảo Uyên
      case 'active_guardian_light':
      case 'dawn_light':
        this.createActiveGuardianLight(origin);
        break;
      case 'ult_dawn_resurgence':
        this.createUltDawnResurgence(origin);
        break;

      // 6. Nguyễn Thị Ngọc Hà
      case 'active_athletic_tempo':
      case 'water_slash':
        this.createActiveAthleticTempo(origin);
        break;
      case 'ult_infinite_flurry':
        this.createUltInfiniteFlurry(origin);
        break;

      // 7. Phạm Trần Thanh Phương
      case 'active_resilient_torrent':
      case 'aegis_shield':
        this.createActiveResilientTorrent(origin);
        break;
      case 'ult_ocean_tsunami':
        this.createUltOceanTsunami(origin);
        break;

      // 8. Phạm Xuân Minh
      case 'active_fearless_charge':
      case 'swashbuckle_coin':
        this.createActiveFearlessCharge(origin);
        break;
      case 'ult_party_frenzy':
        this.createUltPartyFrenzy(origin);
        break;

      // 9. Lâm Anh Thư
      case 'active_serene_wave':
      case 'tidal_wave':
        this.createActiveSereneWave(origin);
        break;
      case 'ult_passionate_geyser':
        this.createUltPassionateGeyser(origin);
        break;

      default:
        this.createActiveSeedOfLife(origin);
    }
  }

  public update(dt: number): void {
    this.batchRenderer.update(dt);
  }


  // =========================================================================
  // 18 REDESIGNED ACTIVE & ULTIMATE ABILITY VFX ENGINES
  // =========================================================================

  // ─── 1. Huỳnh Trần Anh Thi (Wilderness Druid) ───

  /** Active: Hạt Giống Sinh Mệnh (Herbal seed burst + healing mist) */
  private createActiveSeedOfLife(origin: THREE.Vector3): void {
    const ring = new ParticleSystem({
      duration: 1.6,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 0.35, arc: Math.PI * 2, thickness: 0.1 }),
      startLife: new ConstantValue(1.4),
      startSpeed: new IntervalValue(1.6, 2.6),
      startSize: new IntervalValue(0.2, 0.4),
      startColor: new ConstantColor(new Vector4(0.25, 0.95, 0.4, 1.0)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(25), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.magic, 0x44ff77),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(fadeOutSize()),
        new ColorOverLife(fadeAlphaGradient(0.25, 0.95, 0.4)),
      ],
    });
    ring.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(ring, origin);

    const mist = new ParticleSystem({
      duration: 2.0,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 0.7, arc: Math.PI * 2, thickness: 0.5 }),
      startLife: new IntervalValue(1.2, 1.8),
      startSpeed: new IntervalValue(0.3, 0.8),
      startSize: new IntervalValue(0.4, 0.8),
      startColor: new ColorRange(new Vector4(0.3, 0.8, 0.4, 0.5), new Vector4(0.6, 0.9, 0.5, 0.3)),
      emissionOverTime: new ConstantValue(20),
      material: alphaMat(TEX.smoke, 0x55cc66),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(bellSize()),
        new ColorOverLife(fadeAlphaGradient(0.35, 0.85, 0.45)),
        new ApplyForce(new QVector3(0, 0.5, 0), new ConstantValue(1.0)),
      ],
    });
    this.addSystem(mist, origin);

    this.addTemporaryLight(0x2ecc71, 2.2, 5.5, origin, 1800);
  }

  /** Ultimate: Đại Ngàn Tỉnh Giấc (Giant roots + blooming meadow) */
  private createUltForestAwakening(origin: THREE.Vector3): void {
    const meadow = new ParticleSystem({
      duration: 2.8,
      looping: false,
      autoDestroy: true,
      shape: new DonutEmitter({ radius: 3.8, arc: Math.PI * 2, thickness: 1.2 }),
      startLife: new IntervalValue(1.6, 2.4),
      startSpeed: new IntervalValue(0.5, 1.2),
      startSize: new IntervalValue(0.3, 0.6),
      startColor: new ColorRange(new Vector4(0.2, 0.9, 0.3, 0.85), new Vector4(0.9, 0.8, 0.2, 0.8)),
      emissionOverTime: new ConstantValue(35),
      material: additiveMat(TEX.magic, 0x22c55e),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(bellSize()),
        new ColorOverLife(fadeAlphaGradient(0.25, 0.9, 0.3)),
      ],
    });
    meadow.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(meadow, origin);

    const pollen = new ParticleSystem({
      duration: 2.5,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 3.2, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(1.4, 2.2),
      startSpeed: new IntervalValue(0.6, 1.8),
      startSize: new IntervalValue(0.08, 0.2),
      startColor: new ColorRange(new Vector4(0.95, 0.85, 0.3, 0.9), new Vector4(0.4, 0.95, 0.5, 0.8)),
      emissionOverTime: new ConstantValue(40),
      material: additiveMat(TEX.spark, 0xfacc15),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new ApplyForce(new QVector3(0, 1.2, 0), new ConstantValue(1.5)),
        new ColorOverLife(fadeAlphaGradient(0.9, 0.8, 0.3)),
      ],
    });
    this.addSystem(pollen, origin);

    this.addTemporaryLight(0x22c55e, 3.8, 9.0, origin, 2800);
  }

  // ─── 2. Lê Nguyễn Phương Quỳnh (The Singing Ranger) ───

  /** Active: Mũi Tên Âm Vang (Supersonic musical arrow + silence shockwave) */
  private createActiveResonatingArrow(origin: THREE.Vector3): void {
    const arrow = new ParticleSystem({
      duration: 1.2,
      looping: false,
      autoDestroy: true,
      shape: new ConeEmitter({ radius: 0.1, arc: Math.PI * 2, angle: 0.08 }),
      startLife: new ConstantValue(0.8),
      startSpeed: new IntervalValue(7.5, 10.0),
      startSize: new IntervalValue(0.3, 0.5),
      startColor: new ConstantColor(new Vector4(0.4, 0.9, 1.0, 1.0)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(25), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.slash, 0x67e8f9),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(fadeOutSize()),
        new ColorOverLife(fadeAlphaGradient(0.4, 0.9, 1.0)),
      ],
    });
    this.addSystem(arrow, origin);

    const ripples = new ParticleSystem({
      duration: 1.4,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 0.2, arc: Math.PI * 2, thickness: 0.1 }),
      startLife: new ConstantValue(1.0),
      startSpeed: new IntervalValue(2.0, 3.5),
      startSize: new IntervalValue(0.2, 0.4),
      startColor: new ConstantColor(new Vector4(0.8, 0.95, 1.0, 0.8)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0.05, count: new ConstantValue(15), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.circle, 0x38bdf8),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(fadeOutSize())],
    });
    this.addSystem(ripples, origin);

    this.addTemporaryLight(0x38bdf8, 2.5, 6.0, origin, 1300);
  }

  /** Ultimate: Khúc Ca Đại Ngàn (Harmonic melody shockwaves + charm aura) */
  private createUltHymnOfWilds(origin: THREE.Vector3): void {
    const melody = new ParticleSystem({
      duration: 2.5,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 0.6, arc: Math.PI * 2, thickness: 0.2 }),
      startLife: new IntervalValue(1.6, 2.2),
      startSpeed: new IntervalValue(2.5, 4.0),
      startSize: new IntervalValue(0.35, 0.65),
      startColor: new ColorRange(new Vector4(0.98, 0.8, 0.2, 0.9), new Vector4(0.95, 0.6, 0.1, 0.7)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [
        { time: 0, count: new ConstantValue(25), cycle: 1, interval: 0.01, probability: 1 },
        { time: 0.4, count: new ConstantValue(30), cycle: 1, interval: 0.01, probability: 1 },
        { time: 0.8, count: new ConstantValue(35), cycle: 1, interval: 0.01, probability: 1 },
      ],
      material: additiveMat(TEX.magic, 0xfbbf24),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(fadeOutSize()),
        new ColorOverLife(fadeAlphaGradient(0.98, 0.75, 0.2)),
      ],
    });
    melody.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(melody, origin);

    const notes = new ParticleSystem({
      duration: 2.2,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 2.5, arc: Math.PI * 2, thickness: 0.8 }),
      startLife: new IntervalValue(1.2, 1.8),
      startSpeed: new IntervalValue(0.8, 1.6),
      startSize: new IntervalValue(0.1, 0.22),
      startColor: new ConstantColor(new Vector4(1.0, 0.9, 0.3, 0.9)),
      emissionOverTime: new ConstantValue(30),
      material: additiveMat(TEX.spark, 0xfef08a),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new ApplyForce(new QVector3(0, 1.4, 0), new ConstantValue(1.2)),
        new ColorOverLife(fadeAlphaGradient(1.0, 0.85, 0.2)),
      ],
    });
    this.addSystem(notes, origin);

    this.addTemporaryLight(0xf59e0b, 3.6, 10.0, origin, 2500);
  }

  // ─── 3. Trần Nguyễn Trâm Anh (The Illusionist Painter) ───

  /** Active: Vệt Cọ Hư Không (Swept cone of void purple & chromatic ink) */
  private createActiveVoidBrush(origin: THREE.Vector3): void {
    const brush = new ParticleSystem({
      duration: 1.4,
      looping: false,
      autoDestroy: true,
      shape: new ConeEmitter({ radius: 0.2, arc: Math.PI * 2, angle: 0.65 }),
      startLife: new IntervalValue(0.8, 1.3),
      startSpeed: new IntervalValue(3.5, 5.5),
      startSize: new IntervalValue(0.3, 0.65),
      startColor: new ColorRange(new Vector4(0.65, 0.2, 0.95, 0.9), new Vector4(0.85, 0.15, 0.8, 0.8)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(35), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.slash, 0xa855f7),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(fadeOutSize()),
        new ColorOverLife(fadeAlphaGradient(0.7, 0.2, 0.9)),
      ],
    });
    this.addSystem(brush, origin);

    const splatter = new ParticleSystem({
      duration: 1.2,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 1.2, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(0.6, 1.1),
      startSpeed: new IntervalValue(1.5, 3.2),
      startSize: new IntervalValue(0.08, 0.18),
      startColor: new ColorRange(new Vector4(0.9, 0.3, 0.9, 0.9), new Vector4(0.2, 0.8, 1.0, 0.8)),
      emissionOverTime: new ConstantValue(25),
      material: additiveMat(TEX.spark, 0xd946ef),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(bellSize())],
    });
    this.addSystem(splatter, origin);

    this.addTemporaryLight(0x9333ea, 2.6, 5.5, origin, 1400);
  }

  /** Ultimate: Kiệt Tác Không Gian (Whirlpool oil painting domain + stealth aura) */
  private createUltSpatialMasterpiece(origin: THREE.Vector3): void {
    const canvasRing = new ParticleSystem({
      duration: 3.0,
      looping: false,
      autoDestroy: true,
      shape: new DonutEmitter({ radius: 4.2, arc: Math.PI * 2, thickness: 1.4 }),
      startLife: new IntervalValue(1.8, 2.5),
      startSpeed: new IntervalValue(0.6, 1.5),
      startSize: new IntervalValue(0.4, 0.8),
      startColor: new ColorRange(new Vector4(0.5, 0.1, 0.9, 0.75), new Vector4(0.1, 0.8, 0.9, 0.75)),
      emissionOverTime: new ConstantValue(40),
      material: alphaMat(TEX.smoke, 0x8b5cf6),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(bellSize()),
        new ColorOverLife(fadeAlphaGradient(0.6, 0.2, 0.9)),
      ],
    });
    canvasRing.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(canvasRing, origin);

    const pigmentMotes = new ParticleSystem({
      duration: 2.8,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 3.6, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(1.2, 2.0),
      startSpeed: new IntervalValue(0.8, 2.2),
      startSize: new IntervalValue(0.1, 0.22),
      startColor: new ColorRange(new Vector4(0.9, 0.4, 0.9, 0.9), new Vector4(0.4, 0.9, 0.8, 0.85)),
      emissionOverTime: new ConstantValue(45),
      material: additiveMat(TEX.spark, 0xd946ef),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new ApplyForce(new QVector3(0, 0.8, 0), new ConstantValue(1.2))],
    });
    this.addSystem(pigmentMotes, origin);

    this.addTemporaryLight(0xa855f7, 3.8, 11.0, origin, 3000);
  }

  // ─── 4. Nguyễn Khải Vạn (The Pyromancy Sorcerer) ───

  /** Active: Quả Cầu Pháo Hoa (Compressed plasma fireball + spark explosion) */
  private createActiveFireworkOrb(origin: THREE.Vector3): void {
    const burst = new ParticleSystem({
      duration: 1.4,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 0.25, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(0.7, 1.2),
      startSpeed: new IntervalValue(3.5, 6.2),
      startSize: new IntervalValue(0.2, 0.4),
      startColor: new ColorRange(new Vector4(1.0, 0.3, 0.1, 1.0), new Vector4(1.0, 0.8, 0.2, 0.9)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(40), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.spark, 0xf97316),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(fadeOutSize()),
        new ColorOverLife(fadeAlphaGradient(1.0, 0.4, 0.1)),
      ],
    });
    this.addSystem(burst, origin);

    const smoke = new ParticleSystem({
      duration: 1.6,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 0.6, arc: Math.PI * 2, thickness: 0.3 }),
      startLife: new IntervalValue(1.0, 1.5),
      startSpeed: new IntervalValue(0.5, 1.2),
      startSize: new IntervalValue(0.3, 0.6),
      startColor: new ConstantColor(new Vector4(0.3, 0.3, 0.3, 0.5)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0.05, count: new ConstantValue(15), cycle: 1, interval: 0.01, probability: 1 }],
      material: alphaMat(TEX.smoke, 0x475569),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(bellSize())],
    });
    this.addSystem(smoke, origin);

    this.addTemporaryLight(0xf97316, 3.0, 6.5, origin, 1500);
  }

  /** Ultimate: Dạ Khúc Tinh Tú (Grand New Year fireworks meteor shower) */
  private createUltCelestialNocturne(origin: THREE.Vector3): void {
    const offsets: [number, number][] = [
      [0, 0],
      [-1.8, 1.2],
      [1.8, -1.2],
      [0, -2.2],
    ];

    offsets.forEach(([xOff, zOff], idx) => {
      setTimeout(() => {
        const burstOrigin = new THREE.Vector3(origin.x + xOff, origin.y + 0.8, origin.z + zOff);

        const fireworks = new ParticleSystem({
          duration: 1.8,
          looping: false,
          autoDestroy: true,
          shape: new SphereEmitter({ radius: 0.4, arc: Math.PI * 2, thickness: 1 }),
          startLife: new IntervalValue(1.0, 1.6),
          startSpeed: new IntervalValue(4.0, 7.5),
          startSize: new IntervalValue(0.2, 0.45),
          startColor: new ColorRange(
            new Vector4(1.0, 0.2 + idx * 0.2, 0.1, 1.0),
            new Vector4(0.3, 0.8, 1.0, 0.9)
          ),
          emissionOverTime: new ConstantValue(0),
          emissionBursts: [{ time: 0, count: new ConstantValue(45), cycle: 1, interval: 0.01, probability: 1 }],
          material: additiveMat(TEX.spark, 0xff5500),
          renderMode: RenderMode.BillBoard,
          worldSpace: true,
          behaviors: [
            new SizeOverLife(fadeOutSize()),
            new ApplyForce(new QVector3(0, -1.5, 0), new ConstantValue(1.5)),
          ],
        });
        this.addSystem(fireworks, burstOrigin);
      }, idx * 280);
    });

    this.addTemporaryLight(0xff4400, 4.5, 14.0, origin, 3200);
  }

  // ─── 5. Nguyễn Trần Thảo Uyên (Cleric of the Light) ───

  /** Active: Ánh Sáng Chở Che (Solar guardian dome + cleanse rays) */
  private createActiveGuardianLight(origin: THREE.Vector3): void {
    const dome = new ParticleSystem({
      duration: 1.8,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 1.2, arc: Math.PI * 2, thickness: 0.4 }),
      startLife: new IntervalValue(1.2, 1.7),
      startSpeed: new IntervalValue(0.2, 0.6),
      startSize: new IntervalValue(0.3, 0.55),
      startColor: new ConstantColor(new Vector4(1.0, 0.95, 0.5, 0.85)),
      emissionOverTime: new ConstantValue(30),
      material: additiveMat(TEX.magic, 0xfef08a),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(bellSize()),
        new ColorOverLife(fadeAlphaGradient(1.0, 0.95, 0.5)),
      ],
    });
    this.addSystem(dome, origin);

    const rays = new ParticleSystem({
      duration: 1.6,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 0.8, arc: Math.PI * 2, thickness: 0.5 }),
      startLife: new IntervalValue(0.8, 1.4),
      startSpeed: new IntervalValue(0.4, 1.0),
      startSize: new IntervalValue(0.08, 0.18),
      startColor: new ConstantColor(new Vector4(1.0, 1.0, 1.0, 0.95)),
      emissionOverTime: new ConstantValue(25),
      material: additiveMat(TEX.spark, 0xffffff),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new ApplyForce(new QVector3(0, 1.5, 0), new ConstantValue(1.0))],
    });
    this.addSystem(rays, origin);

    this.addTemporaryLight(0xfef08a, 2.6, 6.0, origin, 2000);
  }

  /** Ultimate: Hừng Đông Tỏa Sáng (Monumental dawn pillar + global blind) */
  private createUltDawnResurgence(origin: THREE.Vector3): void {
    const pillar = new ParticleSystem({
      duration: 3.2,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 1.5, arc: Math.PI * 2, thickness: 0.8 }),
      startLife: new IntervalValue(1.8, 2.6),
      startSpeed: new IntervalValue(5.0, 9.0),
      startSize: new IntervalValue(0.4, 0.9),
      startColor: new ColorRange(new Vector4(1.0, 1.0, 1.0, 1.0), new Vector4(1.0, 0.85, 0.2, 0.9)),
      emissionOverTime: new ConstantValue(60),
      material: additiveMat(TEX.spark, 0xffffff),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new ApplyForce(new QVector3(0, 3.5, 0), new ConstantValue(2.0)),
        new ColorOverLife(fadeAlphaGradient(1.0, 0.9, 0.4)),
      ],
    });
    pillar.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(pillar, origin);

    const shockwave = new ParticleSystem({
      duration: 2.2,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 1.0, arc: Math.PI * 2, thickness: 0.2 }),
      startLife: new ConstantValue(1.8),
      startSpeed: new IntervalValue(4.5, 6.5),
      startSize: new IntervalValue(0.5, 1.0),
      startColor: new ConstantColor(new Vector4(1.0, 0.95, 0.6, 0.9)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(40), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.circle, 0xfacc15),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(fadeOutSize())],
    });
    shockwave.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(shockwave, origin);

    this.addTemporaryLight(0xffffff, 5.0, 16.0, origin, 3200);
  }

  // ─── 6. Nguyễn Thị Ngọc Hà (The Athletic Monk) ───

  /** Active: Nhịp Độ Thể Thao (Triple kinetic dash trails + dust burst) */
  private createActiveAthleticTempo(origin: THREE.Vector3): void {
    const dash = new ParticleSystem({
      duration: 1.2,
      looping: false,
      autoDestroy: true,
      shape: new ConeEmitter({ radius: 0.15, arc: Math.PI * 2, angle: 0.2 }),
      startLife: new IntervalValue(0.6, 1.0),
      startSpeed: new IntervalValue(6.0, 8.5),
      startSize: new IntervalValue(0.3, 0.55),
      startColor: new ConstantColor(new Vector4(0.0, 0.85, 0.95, 0.95)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(30), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.slash, 0x06b6d4),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(fadeOutSize())],
    });
    this.addSystem(dash, origin);

    const dust = new ParticleSystem({
      duration: 1.0,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 0.4, arc: Math.PI * 2, thickness: 0.3 }),
      startLife: new IntervalValue(0.5, 0.9),
      startSpeed: new IntervalValue(0.8, 1.8),
      startSize: new IntervalValue(0.2, 0.45),
      startColor: new ConstantColor(new Vector4(0.4, 0.4, 0.4, 0.5)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0.05, count: new ConstantValue(15), cycle: 1, interval: 0.01, probability: 1 }],
      material: alphaMat(TEX.smoke, 0x64748b),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(bellSize())],
    });
    this.addSystem(dust, origin);

    this.addTemporaryLight(0x00cec9, 2.4, 5.0, origin, 1300);
  }

  /** Ultimate: Chân Ngôn Bất Tận (High-altitude seismic stomp + shockwave rings) */
  private createUltInfiniteFlurry(origin: THREE.Vector3): void {
    const seismic = new ParticleSystem({
      duration: 2.2,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 0.8, arc: Math.PI * 2, thickness: 0.2 }),
      startLife: new IntervalValue(1.2, 1.8),
      startSpeed: new IntervalValue(3.5, 5.8),
      startSize: new IntervalValue(0.4, 0.75),
      startColor: new ColorRange(new Vector4(0.0, 0.9, 0.85, 0.9), new Vector4(0.9, 0.8, 0.1, 0.8)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [
        { time: 0, count: new ConstantValue(30), cycle: 1, interval: 0.01, probability: 1 },
        { time: 0.35, count: new ConstantValue(35), cycle: 1, interval: 0.01, probability: 1 },
      ],
      material: additiveMat(TEX.circle, 0x06b6d4),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(fadeOutSize())],
    });
    seismic.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(seismic, origin);

    const burst = new ParticleSystem({
      duration: 1.8,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 1.2, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(0.8, 1.4),
      startSpeed: new IntervalValue(3.0, 6.0),
      startSize: new IntervalValue(0.1, 0.22),
      startColor: new ConstantColor(new Vector4(1.0, 0.9, 0.2, 0.9)),
      emissionOverTime: new ConstantValue(40),
      material: additiveMat(TEX.spark, 0xfacc15),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new ApplyForce(new QVector3(0, 1.8, 0), new ConstantValue(1.5))],
    });
    this.addSystem(burst, origin);

    this.addTemporaryLight(0x06b6d4, 3.8, 10.0, origin, 2200);
  }

  // ─── 7. Phạm Trần Thanh Phương (The Highland Water Guardian) ───

  /** Active: Dòng Suối Quật Cường (Helical spring water shield + knockback splash) */
  private createActiveResilientTorrent(origin: THREE.Vector3): void {
    const shield = new ParticleSystem({
      duration: 1.8,
      looping: false,
      autoDestroy: true,
      shape: new DonutEmitter({ radius: 1.2, arc: Math.PI * 2, thickness: 0.6 }),
      startLife: new IntervalValue(1.0, 1.5),
      startSpeed: new IntervalValue(1.2, 2.4),
      startSize: new IntervalValue(0.25, 0.5),
      startColor: new ColorRange(new Vector4(0.1, 0.5, 0.9, 0.85), new Vector4(0.3, 0.85, 1.0, 0.8)),
      emissionOverTime: new ConstantValue(35),
      material: additiveMat(TEX.slash, 0x0284c7),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(bellSize())],
    });
    shield.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(shield, origin);

    const splash = new ParticleSystem({
      duration: 1.4,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 0.6, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(0.6, 1.2),
      startSpeed: new IntervalValue(2.5, 4.8),
      startSize: new IntervalValue(0.1, 0.25),
      startColor: new ConstantColor(new Vector4(0.4, 0.9, 1.0, 0.8)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0.2, count: new ConstantValue(25), cycle: 1, interval: 0.01, probability: 1 }],
      material: alphaMat(TEX.circle, 0x38bdf8),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(fadeOutSize())],
    });
    this.addSystem(splash, origin);

    this.addTemporaryLight(0x0284c7, 2.4, 5.5, origin, 1800);
  }

  /** Ultimate: Khát Vọng Trùng Khơi (Oceanic whirlpool + colossal tidal wave) */
  private createUltOceanTsunami(origin: THREE.Vector3): void {
    const whirlpool = new ParticleSystem({
      duration: 3.0,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 1.5, arc: Math.PI * 2, thickness: 0.4 }),
      startLife: new IntervalValue(1.6, 2.4),
      startSpeed: new IntervalValue(3.0, 5.5),
      startSize: new IntervalValue(0.4, 0.85),
      startColor: new ColorRange(new Vector4(0.05, 0.3, 0.8, 0.9), new Vector4(0.1, 0.7, 0.9, 0.8)),
      emissionOverTime: new ConstantValue(50),
      material: additiveMat(TEX.circle, 0x0284c7),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(fadeOutSize())],
    });
    whirlpool.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(whirlpool, origin);

    const crest = new ParticleSystem({
      duration: 2.6,
      looping: false,
      autoDestroy: true,
      shape: new ConeEmitter({ radius: 1.0, arc: Math.PI * 2, angle: 0.35 }),
      startLife: new IntervalValue(1.2, 1.8),
      startSpeed: new IntervalValue(4.0, 7.0),
      startSize: new IntervalValue(0.3, 0.65),
      startColor: new ConstantColor(new Vector4(0.7, 0.95, 1.0, 0.85)),
      emissionOverTime: new ConstantValue(40),
      material: alphaMat(TEX.smoke, 0x0284c7),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(bellSize())],
    });
    crest.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(crest, origin);

    this.addTemporaryLight(0x0077b6, 4.2, 12.0, origin, 3000);
  }

  // ─── 8. Phạm Xuân Minh (The Fearless Manager) ───

  /** Active: Lệnh Xung Phong (Crimson spear thrust jet + target lock reticle) */
  private createActiveFearlessCharge(origin: THREE.Vector3): void {
    const thrust = new ParticleSystem({
      duration: 1.4,
      looping: false,
      autoDestroy: true,
      shape: new ConeEmitter({ radius: 0.15, arc: Math.PI * 2, angle: 0.15 }),
      startLife: new IntervalValue(0.6, 1.0),
      startSpeed: new IntervalValue(5.5, 8.0),
      startSize: new IntervalValue(0.25, 0.5),
      startColor: new ColorRange(new Vector4(1.0, 0.2, 0.2, 1.0), new Vector4(1.0, 0.7, 0.1, 0.9)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(30), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.flame, 0xef4444),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(fadeOutSize())],
    });
    this.addSystem(thrust, origin);

    const reticleOrigin = new THREE.Vector3(origin.x, origin.y + 1.6, origin.z);
    const reticle = new ParticleSystem({
      duration: 1.6,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 0.4, arc: Math.PI * 2, thickness: 0.1 }),
      startLife: new ConstantValue(1.2),
      startSpeed: new ConstantValue(0.1),
      startSize: new IntervalValue(0.15, 0.3),
      startColor: new ConstantColor(new Vector4(1.0, 0.1, 0.1, 1.0)),
      emissionOverTime: new ConstantValue(20),
      material: additiveMat(TEX.magic, 0xef4444),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(bellSize())],
    });
    this.addSystem(reticle, reticleOrigin);

    this.addTemporaryLight(0xef4444, 2.2, 5.0, origin, 1500);
  }

  /** Ultimate: Bữa Tiệc Cuồng Nộ (360-degree party frenzy lightning + speed trails) */
  private createUltPartyFrenzy(origin: THREE.Vector3): void {
    const frenzy = new ParticleSystem({
      duration: 2.5,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 0.5, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(0.8, 1.5),
      startSpeed: new IntervalValue(5.0, 9.0),
      startSize: new IntervalValue(0.2, 0.45),
      startColor: new ColorRange(new Vector4(1.0, 0.85, 0.1, 1.0), new Vector4(0.9, 0.15, 0.15, 0.9)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [
        { time: 0, count: new ConstantValue(40), cycle: 1, interval: 0.01, probability: 1 },
        { time: 0.3, count: new ConstantValue(35), cycle: 1, interval: 0.01, probability: 1 },
      ],
      material: additiveMat(TEX.spark, 0xfacc15),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(fadeOutSize())],
    });
    this.addSystem(frenzy, origin);

    const streaks = new ParticleSystem({
      duration: 2.2,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 1.2, arc: Math.PI * 2, thickness: 0.3 }),
      startLife: new IntervalValue(0.8, 1.4),
      startSpeed: new IntervalValue(3.0, 5.5),
      startSize: new IntervalValue(0.3, 0.6),
      startColor: new ConstantColor(new Vector4(1.0, 0.7, 0.1, 0.8)),
      emissionOverTime: new ConstantValue(30),
      material: additiveMat(TEX.slash, 0xf59e0b),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(bellSize())],
    });
    streaks.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(streaks, origin);

    this.addTemporaryLight(0xfacc15, 3.8, 11.0, origin, 2500);
  }

  // ─── 9. Lâm Anh Thư (The Quiet Tide) ───

  /** Active: Làn Sóng Tĩnh Lặng (Gentle luminescent bouncing water motes) */
  private createActiveSereneWave(origin: THREE.Vector3): void {
    const wave = new ParticleSystem({
      duration: 2.0,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 0.6, arc: Math.PI * 2, thickness: 0.8 }),
      startLife: new IntervalValue(1.0, 1.6),
      startSpeed: new IntervalValue(0.8, 1.8),
      startSize: new IntervalValue(0.2, 0.4),
      startColor: new ColorRange(new Vector4(0.2, 0.85, 0.8, 0.9), new Vector4(0.6, 0.95, 1.0, 0.8)),
      emissionOverTime: new ConstantValue(25),
      material: alphaMat(TEX.circle, 0x2dd4bf),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(bellSize()),
        new ApplyForce(new QVector3(0, 0.4, 0), new ConstantValue(0.8)),
      ],
    });
    this.addSystem(wave, origin);

    const ripples = new ParticleSystem({
      duration: 1.6,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 0.3, arc: Math.PI * 2, thickness: 0.1 }),
      startLife: new ConstantValue(1.2),
      startSpeed: new IntervalValue(1.2, 2.2),
      startSize: new IntervalValue(0.15, 0.3),
      startColor: new ConstantColor(new Vector4(0.3, 0.9, 0.85, 0.8)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(18), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.circle, 0x2dd4bf),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(fadeOutSize())],
    });
    ripples.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(ripples, origin);

    this.addTemporaryLight(0x0d9488, 2.0, 5.0, origin, 2000);
  }

  /** Ultimate: Nhiệt Huyết Đại Dương (Monumental passionate geyser eruption) */
  private createUltPassionateGeyser(origin: THREE.Vector3): void {
    const geyser = new ParticleSystem({
      duration: 3.2,
      looping: false,
      autoDestroy: true,
      shape: new ConeEmitter({ radius: 0.6, arc: Math.PI * 2, angle: 0.15 }),
      startLife: new IntervalValue(1.6, 2.4),
      startSpeed: new IntervalValue(6.0, 10.0),
      startSize: new IntervalValue(0.35, 0.75),
      startColor: new ColorRange(new Vector4(0.4, 0.95, 1.0, 0.9), new Vector4(0.8, 1.0, 1.0, 0.7)),
      emissionOverTime: new ConstantValue(55),
      material: alphaMat(TEX.smoke, 0x00f2fe),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(bellSize()),
        new ColorOverLife(fadeAlphaGradient(0.4, 0.95, 1.0)),
      ],
    });
    geyser.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(geyser, origin);

    const bubbles = new ParticleSystem({
      duration: 2.8,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 3.0, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(1.2, 2.0),
      startSpeed: new IntervalValue(1.5, 3.5),
      startSize: new IntervalValue(0.08, 0.2),
      startColor: new ConstantColor(new Vector4(0.5, 1.0, 0.95, 0.85)),
      emissionOverTime: new ConstantValue(35),
      material: alphaMat(TEX.circle, 0x00f2fe),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new ApplyForce(new QVector3(0, 1.2, 0), new ConstantValue(1.2)),
        new SizeOverLife(bellSize()),
      ],
    });
    this.addSystem(bubbles, origin);

    this.addTemporaryLight(0x00f2fe, 4.5, 13.0, origin, 3200);
  }
}

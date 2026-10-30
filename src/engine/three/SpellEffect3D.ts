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
  PointEmitter,
  SphereEmitter,
  ConeEmitter,
  CircleEmitter,
  HemisphereEmitter,
  DonutEmitter,
  ColorOverLife,
  SizeOverLife,
  SpeedOverLife,
  RotationOverLife,
  ApplyForce,
  Vector4,
  Vector3 as QVector3,
} from 'three.quarks';
import { CharacterSignatureAbility } from '../../types/character';

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

  // ────────────────────────────── Public API ──────────────────────────────

  public castSpell(effectType: CharacterSignatureAbility['effectType'], origin: THREE.Vector3): void {
    switch (effectType) {
      case 'nature_bloom':   this.createNatureBloom(origin); break;
      case 'eagle_scout':    this.createEagleScout(origin); break;
      case 'lute_hymn':      this.createLuteHymn(origin); break;
      case 'firework_burst': this.createFireworkBurst(origin); break;
      case 'dawn_light':     this.createDawnLight(origin); break;
      case 'water_slash':    this.createWaterSlash(origin); break;
      case 'aegis_shield':   this.createAegisShield(origin); break;
      case 'swashbuckle_coin': this.createSwashbuckleCoin(origin); break;
      case 'tidal_wave':     this.createTidalWave(origin); break;
      default:               this.createNatureBloom(origin);
    }
  }

  public update(dt: number): void {
    this.batchRenderer.update(dt);
  }

  // ─────────────── 1. Verdant Bloom (Huỳnh Trần Anh Thi) ───────────────
  // Expanding emerald magic ring + upward botanical motes

  private createNatureBloom(origin: THREE.Vector3): void {
    // Expanding ring of emerald light
    const ring = new ParticleSystem({
      duration: 1.6,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 0.3, arc: Math.PI * 2, thickness: 0.1 }),
      startLife: new ConstantValue(1.4),
      startSpeed: new IntervalValue(1.8, 2.8),
      startSize: new IntervalValue(0.25, 0.45),
      startColor: new ConstantColor(new Vector4(0.2, 1.0, 0.4, 1.0)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(28), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.circle, 0x33ff66),
      renderMode: RenderMode.BillBoard,
      renderOrder: 2,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(0.6, 1.2, 1.5, 1.8), 0]])),
        new ColorOverLife(fadeAlphaGradient(0.2, 1.0, 0.4)),
        new RotationOverLife(new IntervalValue(-Math.PI, Math.PI)),
      ],
    });
    this.addSystem(ring, origin);

    // Upward botanical golden-green motes
    const motes = new ParticleSystem({
      duration: 1.6,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 0.5, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(1.0, 1.6),
      startSpeed: new IntervalValue(0.6, 1.5),
      startSize: new IntervalValue(0.12, 0.28),
      startColor: new ColorRange(
        new Vector4(0.4, 1.0, 0.5, 1.0),
        new Vector4(0.8, 1.0, 0.2, 1.0),
      ),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(40), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.spark, 0x66ff88),
      renderMode: RenderMode.BillBoard,
      renderOrder: 3,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(fadeOutSize()),
        new ColorOverLife(fadeAlphaGradient(0.6, 1.0, 0.3)),
        new ApplyForce(new QVector3(0, 1, 0), new ConstantValue(2.5)),
        new RotationOverLife(new IntervalValue(-2, 2)),
      ],
    });
    this.addSystem(motes, origin);
  }

  // ──────────── 2. Eagle Eye (Lê Nguyễn Phương Quỳnh) ────────────
  // Wind tracer cone + golden sparks / drifting feathers

  private createEagleScout(origin: THREE.Vector3): void {
    // Aerodynamic wind tracer cone
    const cone = new ParticleSystem({
      duration: 1.4,
      looping: false,
      autoDestroy: true,
      shape: new ConeEmitter({ radius: 0.15, arc: Math.PI * 2, thickness: 0.3, angle: Math.PI / 5 }),
      startLife: new IntervalValue(0.6, 1.2),
      startSpeed: new IntervalValue(3.0, 5.0),
      startSize: new IntervalValue(0.15, 0.35),
      startColor: new ConstantColor(new Vector4(0.9, 0.95, 1.0, 0.7)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(35), cycle: 1, interval: 0.01, probability: 1 }],
      material: alphaMat(TEX.smoke, 0xeeffff),
      renderMode: RenderMode.BillBoard,
      renderOrder: 2,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(0.4, 1.0, 1.2, 0.3), 0]])),
        new ColorOverLife(fadeAlphaGradient(0.9, 0.95, 1.0)),
        new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.7, 0.3, 0), 0]])),
      ],
    });
    // Position the cone upward
    cone.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(cone, origin);

    // Golden sparks trailing upward
    const sparks = new ParticleSystem({
      duration: 1.4,
      looping: false,
      autoDestroy: true,
      shape: new PointEmitter(),
      startLife: new IntervalValue(0.8, 1.4),
      startSpeed: new IntervalValue(1.5, 3.5),
      startSize: new IntervalValue(0.1, 0.22),
      startColor: new ColorRange(
        new Vector4(1.0, 0.85, 0.2, 1.0),
        new Vector4(1.0, 0.65, 0.1, 1.0),
      ),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(24), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.spark, 0xffd700),
      renderMode: RenderMode.BillBoard,
      renderOrder: 3,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(fadeOutSize()),
        new ColorOverLife(fadeAlphaGradient(1.0, 0.8, 0.2)),
        new ApplyForce(new QVector3(0, 1, 0), new ConstantValue(3.0)),
        new RotationOverLife(new IntervalValue(-3, 3)),
      ],
    });
    this.addSystem(sparks, origin);
  }

  // ──────────── 3. Hymn of Antiquity (Trần Nguyễn Trâm Anh) ────────────
  // Harmonic acoustic rings + floating music runes

  private createLuteHymn(origin: THREE.Vector3): void {
    // Expanding harmonic rings (stacked at different heights)
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.2;
      const ringSystem = new ParticleSystem({
        duration: 1.6,
        looping: false,
        autoDestroy: true,
        shape: new CircleEmitter({ radius: 0.2 + i * 0.15, arc: Math.PI * 2, thickness: 0.05 }),
        startLife: new ConstantValue(1.2),
        startSpeed: new IntervalValue(1.5, 2.5),
        startSize: new IntervalValue(0.2, 0.35),
        startColor: new ConstantColor(new Vector4(1.0, 0.42, 0.5, 0.9)),
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [{ time: delay, count: new ConstantValue(16), cycle: 1, interval: 0.01, probability: 1 }],
        material: additiveMat(TEX.circle, 0xff6b81),
        renderMode: RenderMode.BillBoard,
        renderOrder: 2,
        worldSpace: true,
        behaviors: [
          new SizeOverLife(new PiecewiseBezier([[new Bezier(0.5, 1.0, 1.3, 1.6), 0]])),
          new ColorOverLife(fadeAlphaGradient(1.0, 0.42, 0.5)),
          new RotationOverLife(new ConstantValue(1.5)),
        ],
      });
      const offsetOrigin = origin.clone();
      offsetOrigin.y += 0.5 + i * 0.35;
      this.addSystem(ringSystem, offsetOrigin);
    }

    // Floating runic music symbols
    const runes = new ParticleSystem({
      duration: 1.6,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 0.6, arc: Math.PI * 2, thickness: 0.8 }),
      startLife: new IntervalValue(1.0, 1.5),
      startSpeed: new IntervalValue(0.3, 0.8),
      startSize: new IntervalValue(0.25, 0.45),
      startColor: new ColorRange(
        new Vector4(1.0, 0.6, 0.75, 1.0),
        new Vector4(0.9, 0.3, 0.5, 1.0),
      ),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(14), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.magic, 0xff88aa),
      renderMode: RenderMode.BillBoard,
      renderOrder: 3,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(bellSize()),
        new ColorOverLife(fadeAlphaGradient(1.0, 0.5, 0.65)),
        new ApplyForce(new QVector3(0, 0.8, 0), new ConstantValue(1.0)),
        new RotationOverLife(new IntervalValue(-1, 1)),
      ],
    });
    const runeOrigin = origin.clone();
    runeOrigin.y += 0.6;
    this.addSystem(runes, runeOrigin);
  }

  // ──────────── 4. Grand Pyrotechnic (Nguyễn Khải Vạn) ────────────
  // Fiery burst with gravity spark shards + scorch flash

  private createFireworkBurst(origin: THREE.Vector3): void {
    // Central flash
    const flash = new ParticleSystem({
      duration: 0.5,
      looping: false,
      autoDestroy: true,
      shape: new PointEmitter(),
      startLife: new ConstantValue(0.4),
      startSpeed: new ConstantValue(0),
      startSize: new ConstantValue(2.0),
      startColor: new ConstantColor(new Vector4(1.0, 0.9, 0.5, 1.0)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(1), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.circle, 0xffeedd),
      renderMode: RenderMode.BillBoard,
      renderOrder: 4,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(0.5, 1.5, 1.8, 0), 0]])),
        new ColorOverLife(fadeAlphaGradient(1.0, 0.9, 0.5)),
      ],
    });
    const flashOrigin = origin.clone();
    flashOrigin.y += 1.0;
    this.addSystem(flash, flashOrigin);

    // Multi-color ballistic spark shards with gravity
    const colors = [
      new Vector4(1.0, 0.2, 0.27, 1.0), // red
      new Vector4(1.0, 0.84, 0.0, 1.0),  // gold
      new Vector4(0.0, 0.9, 1.0, 1.0),   // cyan
      new Vector4(0.6, 0.2, 1.0, 1.0),   // purple
      new Vector4(0.0, 1.0, 0.53, 1.0),  // green
    ];

    for (let i = 0; i < colors.length; i++) {
      const sparks = new ParticleSystem({
        duration: 2.0,
        looping: false,
        autoDestroy: true,
        shape: new PointEmitter(),
        startLife: new IntervalValue(1.0, 1.8),
        startSpeed: new IntervalValue(3.0, 6.0),
        startSize: new IntervalValue(0.08, 0.18),
        startColor: new ConstantColor(colors[i]),
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [{ time: 0, count: new ConstantValue(12), cycle: 1, interval: 0.01, probability: 1 }],
        material: additiveMat(TEX.flame, 0xffffff),
        renderMode: RenderMode.StretchedBillBoard,
        speedFactor: 0.1,
        rendererEmitterSettings: { speedFactor: 0.1, lengthFactor: 4 },
        renderOrder: 3,
        worldSpace: true,
        behaviors: [
          new SizeOverLife(fadeOutSize()),
          new ColorOverLife(fadeAlphaGradient(colors[i].x, colors[i].y, colors[i].z)),
          new ApplyForce(new QVector3(0, -1, 0), new ConstantValue(4.5)),
        ],
      });
      const sparkOrigin = origin.clone();
      sparkOrigin.y += 1.0;
      this.addSystem(sparks, sparkOrigin);
    }
  }

  // ──────────── 5. Dawn Radiance (Nguyễn Trần Thảo Uyên) ────────────
  // Celestial vertical beam + solar prism flash

  private createDawnLight(origin: THREE.Vector3): void {
    // Vertical god-ray beam particles streaming upward
    const beam = new ParticleSystem({
      duration: 2.0,
      looping: false,
      autoDestroy: true,
      shape: new ConeEmitter({ radius: 0.35, arc: Math.PI * 2, thickness: 0.2, angle: Math.PI / 18 }),
      startLife: new IntervalValue(0.8, 1.6),
      startSpeed: new IntervalValue(2.5, 4.5),
      startSize: new IntervalValue(0.3, 0.65),
      startColor: new ConstantColor(new Vector4(1.0, 0.94, 0.66, 0.9)),
      emissionOverTime: new ConstantValue(60),
      material: additiveMat(TEX.circle, 0xfff0aa),
      renderMode: RenderMode.BillBoard,
      renderOrder: 2,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(0.3, 0.8, 1.0, 0.1), 0]])),
        new ColorOverLife(new Gradient(
          [[new QVector3(1.0, 0.96, 0.7), 0], [new QVector3(1.0, 0.84, 0.0), 1]],
          [[0.9, 0], [0, 1]],
        )),
      ],
    });
    // Aim the cone upward
    beam.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(beam, origin);

    // Solar flash at origin
    const solarFlash = new ParticleSystem({
      duration: 0.6,
      looping: false,
      autoDestroy: true,
      shape: new PointEmitter(),
      startLife: new ConstantValue(0.5),
      startSpeed: new ConstantValue(0),
      startSize: new ConstantValue(3.0),
      startColor: new ConstantColor(new Vector4(1.0, 1.0, 0.8, 1.0)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(1), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.circle, 0xffffcc),
      renderMode: RenderMode.BillBoard,
      renderOrder: 5,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(0.2, 1.8, 2.5, 0), 0]])),
        new ColorOverLife(fadeAlphaGradient(1.0, 1.0, 0.8)),
      ],
    });
    const flashOrigin = origin.clone();
    flashOrigin.y += 0.5;
    this.addSystem(solarFlash, flashOrigin);

    // Floating golden prism particles
    const prisms = new ParticleSystem({
      duration: 2.0,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 0.8, arc: Math.PI * 2, thickness: 0.6 }),
      startLife: new IntervalValue(1.0, 1.8),
      startSpeed: new IntervalValue(0.4, 1.2),
      startSize: new IntervalValue(0.1, 0.2),
      startColor: new ColorRange(
        new Vector4(1.0, 0.9, 0.3, 1.0),
        new Vector4(1.0, 0.7, 0.0, 1.0),
      ),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0.1, count: new ConstantValue(20), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.spark, 0xffd700),
      renderMode: RenderMode.BillBoard,
      renderOrder: 3,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(fadeOutSize()),
        new ColorOverLife(fadeAlphaGradient(1.0, 0.85, 0.2)),
        new ApplyForce(new QVector3(0, 1.5, 0), new ConstantValue(1.5)),
        new RotationOverLife(new IntervalValue(-2, 2)),
      ],
    });
    this.addSystem(prisms, origin);
  }

  // ──────────── 6. Flowing Water Katas (Nguyễn Thị Ngọc Hà) ────────────
  // Triple crescent slashes + water spray droplets

  private createWaterSlash(origin: THREE.Vector3): void {
    // Three staggered crescent slash arcs
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.15;
      const arcAngle = (i - 1) * (Math.PI / 6);
      const slash = new ParticleSystem({
        duration: 1.4,
        looping: false,
        autoDestroy: true,
        shape: new CircleEmitter({ radius: 0.5 + i * 0.2, arc: Math.PI * 1.2, thickness: 0.05 }),
        startLife: new ConstantValue(0.8),
        startSpeed: new IntervalValue(2.0, 3.5),
        startSize: new IntervalValue(0.25, 0.5),
        startColor: new ConstantColor(new Vector4(0.0, 0.82, 0.83, 0.9)),
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [{ time: delay, count: new ConstantValue(12), cycle: 1, interval: 0.01, probability: 1 }],
        material: additiveMat(TEX.slash, 0x00d2d3),
        renderMode: RenderMode.BillBoard,
        renderOrder: 2,
        worldSpace: true,
        behaviors: [
          new SizeOverLife(new PiecewiseBezier([[new Bezier(0.5, 1.2, 1.6, 0.2), 0]])),
          new ColorOverLife(fadeAlphaGradient(0.0, 0.82, 0.83)),
          new RotationOverLife(new ConstantValue(6.0 * (i % 2 === 0 ? 1 : -1))),
        ],
      });
      slash.emitter.rotation.set(Math.PI / 4 + arcAngle, 0, 0);
      const slashOrigin = origin.clone();
      slashOrigin.y += 0.8 + i * 0.15;
      this.addSystem(slash, slashOrigin);
    }

    // Water spray droplets
    const spray = new ParticleSystem({
      duration: 1.4,
      looping: false,
      autoDestroy: true,
      shape: new HemisphereEmitter({ radius: 0.4, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(0.6, 1.2),
      startSpeed: new IntervalValue(1.5, 3.0),
      startSize: new IntervalValue(0.06, 0.14),
      startColor: new ColorRange(
        new Vector4(0.3, 0.9, 1.0, 0.8),
        new Vector4(0.5, 1.0, 1.0, 0.6),
      ),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(30), cycle: 1, interval: 0.01, probability: 1 }],
      material: alphaMat(TEX.circle, 0x88eeff),
      renderMode: RenderMode.BillBoard,
      renderOrder: 1,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(fadeOutSize()),
        new ColorOverLife(fadeAlphaGradient(0.4, 0.95, 1.0)),
        new ApplyForce(new QVector3(0, -1, 0), new ConstantValue(3.0)),
      ],
    });
    const sprayOrigin = origin.clone();
    sprayOrigin.y += 0.9;
    this.addSystem(spray, sprayOrigin);
  }

  // ──────────── 7. Aegis of the Coast (Phạm Trần Thanh Phương) ────────────
  // Hexagonal dome shield + protective ward runes

  private createAegisShield(origin: THREE.Vector3): void {
    // Dome shield particles forming a hemisphere
    const dome = new ParticleSystem({
      duration: 2.2,
      looping: false,
      autoDestroy: true,
      shape: new HemisphereEmitter({ radius: 1.2, arc: Math.PI * 2, thickness: 0.05 }),
      startLife: new IntervalValue(1.5, 2.0),
      startSpeed: new ConstantValue(0.05),
      startSize: new IntervalValue(0.2, 0.4),
      startColor: new ConstantColor(new Vector4(0.27, 0.67, 1.0, 0.85)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(50), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.circle, 0x44aaff),
      renderMode: RenderMode.BillBoard,
      renderOrder: 2,
      worldSpace: false,
      behaviors: [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(0, 0.8, 1.0, 0.5), 0]])),
        new ColorOverLife(new Gradient(
          [[new QVector3(0.27, 0.67, 1.0), 0], [new QVector3(0.1, 0.4, 0.9), 1]],
          [[0.85, 0], [0.6, 0.5], [0, 1]],
        )),
        new RotationOverLife(new IntervalValue(-0.5, 0.5)),
      ],
    });
    this.addSystem(dome, origin);

    // Pulsing Fresnel rim shimmer
    const shimmer = new ParticleSystem({
      duration: 2.2,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 1.25, arc: Math.PI * 2, thickness: 0.02 }),
      startLife: new IntervalValue(0.4, 0.8),
      startSpeed: new ConstantValue(0.1),
      startSize: new IntervalValue(0.15, 0.3),
      startColor: new ConstantColor(new Vector4(1.0, 0.84, 0.0, 0.9)),
      emissionOverTime: new ConstantValue(25),
      material: additiveMat(TEX.spark, 0xffd700),
      renderMode: RenderMode.BillBoard,
      renderOrder: 3,
      worldSpace: false,
      behaviors: [
        new SizeOverLife(bellSize()),
        new ColorOverLife(fadeAlphaGradient(1.0, 0.84, 0.0)),
      ],
    });
    this.addSystem(shimmer, origin);

    // Protective ward rune seal at the base
    const runes = new ParticleSystem({
      duration: 2.2,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 1.1, arc: Math.PI * 2, thickness: 0.1 }),
      startLife: new IntervalValue(1.2, 2.0),
      startSpeed: new ConstantValue(0.02),
      startSize: new IntervalValue(0.35, 0.6),
      startColor: new ColorRange(
        new Vector4(0.3, 0.7, 1.0, 0.8),
        new Vector4(0.1, 0.5, 1.0, 0.6),
      ),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(8), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.magic, 0x55bbff),
      renderMode: RenderMode.HorizontalBillBoard,
      renderOrder: 1,
      worldSpace: false,
      behaviors: [
        new SizeOverLife(bellSize()),
        new ColorOverLife(fadeAlphaGradient(0.25, 0.6, 1.0)),
        new RotationOverLife(new ConstantValue(0.8)),
      ],
    });
    const runeOrigin = origin.clone();
    runeOrigin.y += 0.05;
    this.addSystem(runes, runeOrigin);
  }

  // ──────────── 8. Swashbuckler Flourish (Phạm Xuân Minh) ────────────
  // Golden coin flip arc + sparkling stardust shower

  private createSwashbuckleCoin(origin: THREE.Vector3): void {
    // Golden coin arc — particles launched upward with gravity pull-down
    const coins = new ParticleSystem({
      duration: 1.8,
      looping: false,
      autoDestroy: true,
      shape: new ConeEmitter({ radius: 0.2, arc: Math.PI * 2, thickness: 0.5, angle: Math.PI / 8 }),
      startLife: new IntervalValue(1.0, 1.6),
      startSpeed: new IntervalValue(2.5, 4.0),
      startSize: new IntervalValue(0.15, 0.3),
      startColor: new ConstantColor(new Vector4(1.0, 0.84, 0.0, 1.0)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(18), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.spark, 0xffd700),
      renderMode: RenderMode.BillBoard,
      renderOrder: 3,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(fadeOutSize()),
        new ColorOverLife(new Gradient(
          [[new QVector3(1.0, 0.9, 0.3), 0], [new QVector3(0.9, 0.6, 0.0), 1]],
          [[1, 0], [0.5, 0.7], [0, 1]],
        )),
        new ApplyForce(new QVector3(0, -1, 0), new ConstantValue(4.0)),
        new RotationOverLife(new IntervalValue(-8, 8)),
      ],
    });
    // Aim cone upward so coins flip upward
    coins.emitter.rotation.set(-Math.PI / 2, 0, 0);
    const coinOrigin = origin.clone();
    coinOrigin.y += 0.8;
    this.addSystem(coins, coinOrigin);

    // Stardust shower — fine golden sparkles raining down
    const stardust = new ParticleSystem({
      duration: 1.8,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 1.0, arc: Math.PI * 2, thickness: 0.3 }),
      startLife: new IntervalValue(0.8, 1.5),
      startSpeed: new IntervalValue(0.3, 1.0),
      startSize: new IntervalValue(0.06, 0.14),
      startColor: new ColorRange(
        new Vector4(1.0, 0.95, 0.6, 1.0),
        new Vector4(1.0, 0.8, 0.2, 0.8),
      ),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0.2, count: new ConstantValue(30), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.spark, 0xffeeaa),
      renderMode: RenderMode.BillBoard,
      renderOrder: 2,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(fadeOutSize()),
        new ColorOverLife(fadeAlphaGradient(1.0, 0.9, 0.5)),
        new ApplyForce(new QVector3(0, -1, 0), new ConstantValue(1.5)),
        new RotationOverLife(new IntervalValue(-3, 3)),
      ],
    });
    const dustOrigin = origin.clone();
    dustOrigin.y += 1.5;
    this.addSystem(stardust, dustOrigin);
  }

  // ──────────── 9. Tidal Embrace (Lâm Anh Thư) ────────────
  // Swirling water vortex + geyser mist bubbles

  private createTidalWave(origin: THREE.Vector3): void {
    // Swirling water vortex ring expanding outward
    const vortex = new ParticleSystem({
      duration: 1.8,
      looping: false,
      autoDestroy: true,
      shape: new DonutEmitter({ radius: 0.4, arc: Math.PI * 2, thickness: 0.3, donutRadius: 0.15 }),
      startLife: new IntervalValue(1.0, 1.6),
      startSpeed: new IntervalValue(1.5, 2.5),
      startSize: new IntervalValue(0.2, 0.4),
      startColor: new ConstantColor(new Vector4(0.0, 0.81, 0.79, 0.9)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(36), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.circle, 0x00cec9),
      renderMode: RenderMode.BillBoard,
      renderOrder: 2,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(0.4, 1.0, 1.4, 0.6), 0]])),
        new ColorOverLife(fadeAlphaGradient(0.0, 0.81, 0.79)),
        new RotationOverLife(new ConstantValue(3.0)),
      ],
    });
    this.addSystem(vortex, origin);

    // Upward geyser mist column
    const geyser = new ParticleSystem({
      duration: 1.8,
      looping: false,
      autoDestroy: true,
      shape: new ConeEmitter({ radius: 0.25, arc: Math.PI * 2, thickness: 0.6, angle: Math.PI / 12 }),
      startLife: new IntervalValue(0.6, 1.2),
      startSpeed: new IntervalValue(2.0, 4.0),
      startSize: new IntervalValue(0.15, 0.35),
      startColor: new ColorRange(
        new Vector4(0.5, 0.95, 1.0, 0.7),
        new Vector4(0.7, 1.0, 1.0, 0.5),
      ),
      emissionOverTime: new ConstantValue(40),
      material: alphaMat(TEX.smoke, 0xaaeeff),
      renderMode: RenderMode.BillBoard,
      renderOrder: 1,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(new PiecewiseBezier([[new Bezier(0.3, 1.0, 1.3, 0.1), 0]])),
        new ColorOverLife(fadeAlphaGradient(0.6, 0.97, 1.0)),
        new SpeedOverLife(new PiecewiseBezier([[new Bezier(1, 0.6, 0.2, 0), 0]])),
      ],
    });
    // Aim geyser upward
    geyser.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(geyser, origin);

    // Bubble particles floating up
    const bubbles = new ParticleSystem({
      duration: 1.8,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 0.6, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(0.8, 1.5),
      startSpeed: new IntervalValue(0.3, 0.8),
      startSize: new IntervalValue(0.06, 0.16),
      startColor: new ColorRange(
        new Vector4(0.6, 1.0, 1.0, 0.8),
        new Vector4(0.3, 0.9, 0.9, 0.5),
      ),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0.1, count: new ConstantValue(20), cycle: 1, interval: 0.01, probability: 1 }],
      material: alphaMat(TEX.circle, 0x88ffee),
      renderMode: RenderMode.BillBoard,
      renderOrder: 1,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(bellSize()),
        new ColorOverLife(fadeAlphaGradient(0.5, 1.0, 1.0)),
        new ApplyForce(new QVector3(0, 1.5, 0), new ConstantValue(2.0)),
      ],
    });
    this.addSystem(bubbles, origin);
  }
}

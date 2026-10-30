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

/** Procedural 4-point star geometry (inspired by HitFXFree: four_point_star.gdshader) */
function createFourPointStarGeo(outerR = 0.5, innerR = 0.12): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  const points = 4;
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

/**
 * GPU-Batched Fantasy Spell VFX Engine
 *
 * Uses three.quarks BatchedRenderer to render all 9 hero signature
 * ability particle effects in a single batched draw call.
 */
export interface ActiveVFXMesh {
  object: THREE.Object3D;
  duration: number;
  age: number;
  update: (dt: number, progress: number) => boolean | void;
}

export class SpellEffect3D {
  private scene: THREE.Scene;
  public readonly batchRenderer: BatchedRenderer;
  private activeMeshes: ActiveVFXMesh[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.batchRenderer = new BatchedRenderer();
    scene.add(this.batchRenderer);
  }

  /** Register a dynamic procedural 3D mesh effect with custom lifecycle and auto-disposal */
  public addMeshEffect(
    object: THREE.Object3D,
    duration: number,
    updateFn: (dt: number, progress: number) => boolean | void
  ): void {
    this.scene.add(object);
    this.activeMeshes.push({
      object,
      duration,
      age: 0,
      update: updateFn,
    });
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

    for (let i = this.activeMeshes.length - 1; i >= 0; i--) {
      const item = this.activeMeshes[i];
      item.age += dt;
      const progress = Math.min(1.0, item.age / item.duration);
      const isDone = item.update(dt, progress);
      if (isDone || progress >= 1.0) {
        this.scene.remove(item.object);
        item.object.traverse((child) => {
          if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
          if ((child as THREE.Mesh).material) {
            const mat = (child as THREE.Mesh).material;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat.dispose();
          }
        });
        this.activeMeshes.splice(i, 1);
      }
    }
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

  /**
   * Active: Mũi Tên Âm Vang (Resonating Arrow)
   *
   * Lore: "Bắn mũi tên cuộn xoáy giai điệu chói tai xuyên thấu đường thẳng, gây sát thương vật lý và khóa chiêu kẻ địch."
   *
   * VFX Asset Integration:
   * - ElementalMagicFXFree: Dynamic projectile architecture (projectile_core, projectile_streaks, projectile_tail, cast_flare).
   *   Elongated high-speed crystalline arrow shaft & head with 4 helical corkscrew harmonic streaks ("cuộn xoáy giai điệu").
   * - HitFXFree: four_point_star.gdshader gleaming arrowhead tip + impact_slash.gdshader sonic boom rings.
   * - HitFXFree (vfx_hit_01 & vfx_impact_01): Terminal supersonic impact detonation at target position with expanding
   *   silence shockwave sphere (impact_sphere), 14 radial acoustic streaks, and cross-cutting sonic slash discs.
   */
  private createActiveResonatingArrow(origin: THREE.Vector3): void {
    const flightDuration = 0.52; // Arrow travel time from bow to target
    const totalDuration = 1.6;  // Total lifecycle including post-impact silence field
    const range = 6.8;          // Travel distance in isometric space
    const dir = new THREE.Vector3(0.7071, 0.04, 0.7071).normalize(); // Isometric forward shot vector
    const startPos = origin.clone().add(new THREE.Vector3(0, 0.75, 0));
    const targetPos = startPos.clone().addScaledVector(dir, range);

    // 1. Bow Release Flash & Sonic Muzzle Star (ElementalMagicFXFree: cast_flare & HitFXFree: four_point_star)
    const castGroup = new THREE.Group();
    castGroup.position.copy(startPos);

    const muzzleStarGeo = createFourPointStarGeo(0.65, 0.14);
    const muzzleStarMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const muzzleStar = new THREE.Mesh(muzzleStarGeo, muzzleStarMat);
    muzzleStar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    castGroup.add(muzzleStar);

    const muzzleRingGeo = new THREE.RingGeometry(0.15, 0.45, 32);
    const muzzleRingMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const muzzleRing = new THREE.Mesh(muzzleRingGeo, muzzleRingMat);
    muzzleRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    castGroup.add(muzzleRing);

    this.addMeshEffect(castGroup, 0.45, (dt, progress) => {
      const fade = Math.max(0, 1 - progress);
      const starScale = (0.5 + progress * 2.2) * fade;
      muzzleStar.scale.set(starScale, starScale, starScale);
      muzzleStar.rotation.z += dt * 8.0;
      muzzleStarMat.opacity = fade * 0.95;

      const ringScale = 0.6 + progress * 3.0;
      muzzleRing.scale.set(ringScale, ringScale, 1);
      muzzleRingMat.opacity = fade * 0.85;
    });

    // 2. High-Speed Flying Projectile Core & Helical Streaks (ElementalMagicFXFree & HitFXFree)
    const arrowGroup = new THREE.Group();
    arrowGroup.position.copy(startPos);

    // Crystalline Arrowhead
    const arrowHeadGeo = new THREE.ConeGeometry(0.14, 0.7, 5);
    arrowHeadGeo.rotateX(Math.PI / 2);
    const arrowHeadMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
    });
    const arrowHead = new THREE.Mesh(arrowHeadGeo, arrowHeadMat);
    arrowHead.position.z = 0.35;
    arrowGroup.add(arrowHead);

    // Inner Luminous Arrow Core (Diamond white)
    const arrowCoreGeo = new THREE.ConeGeometry(0.07, 0.55, 4);
    arrowCoreGeo.rotateX(Math.PI / 2);
    const arrowCoreMat = new THREE.MeshBasicMaterial({
      color: 0xf0fdfa,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 1.0,
    });
    const arrowCore = new THREE.Mesh(arrowCoreGeo, arrowCoreMat);
    arrowCore.position.z = 0.36;
    arrowGroup.add(arrowCore);

    // Arrow Shaft
    const arrowShaftGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.3, 6);
    arrowShaftGeo.rotateX(Math.PI / 2);
    const arrowShaftMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85,
    });
    const arrowShaft = new THREE.Mesh(arrowShaftGeo, arrowShaftMat);
    arrowShaft.position.z = -0.45;
    arrowGroup.add(arrowShaft);

    // Four-Point Sonic Star Tip (HitFXFree: four_point_star.gdshader)
    const starTipGeo = createFourPointStarGeo(0.38, 0.09);
    const starTipMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starTip = new THREE.Mesh(starTipGeo, starTipMat);
    starTip.position.z = 0.72;
    arrowGroup.add(starTip);

    // 4 Helical Harmonic Streaks (ElementalMagicFXFree: projectile_streaks.gdshader - "cuộn xoáy giai điệu")
    const streakNodes: THREE.Mesh[] = [];
    const streakMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
    });
    for (let s = 0; s < 4; s++) {
      const sGeo = new THREE.ConeGeometry(0.035, 0.6, 4);
      sGeo.rotateX(Math.PI / 2);
      const sMesh = new THREE.Mesh(sGeo, streakMat);
      arrowGroup.add(sMesh);
      streakNodes.push(sMesh);
    }

    // Projectile Tail Wake (ElementalMagicFXFree: projectile_tail.gdshader)
    const tailWakeGeo = new THREE.ConeGeometry(0.18, 1.8, 6, 1, true);
    tailWakeGeo.rotateX(-Math.PI / 2);
    const tailWakeMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const tailWake = new THREE.Mesh(tailWakeGeo, tailWakeMat);
    tailWake.position.z = -1.2;
    arrowGroup.add(tailWake);

    // Orient arrow group towards target direction
    arrowGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);

    // 3. Acoustic Sonic Boom Discs shed along flight path (HitFXFree: impact_slash)
    const sonicDiscs: { mesh: THREE.Mesh; pos: THREE.Vector3; birthTime: number }[] = [];
    const discGeo = new THREE.RingGeometry(0.12, 0.45, 24);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    for (let d = 0; d < 4; d++) {
      const dm = new THREE.Mesh(discGeo, discMat);
      dm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      dm.visible = false;
      this.scene.add(dm);
      sonicDiscs.push({
        mesh: dm,
        pos: startPos.clone().addScaledVector(dir, range * (0.2 + d * 0.22)),
        birthTime: flightDuration * (0.18 + d * 0.22),
      });
    }

    let hasDetonated = false;

    this.addMeshEffect(arrowGroup, totalDuration, (dt, progress) => {
      const flightT = Math.min(1.0, (progress * totalDuration) / flightDuration);

      if (flightT < 1.0) {
        arrowGroup.position.lerpVectors(startPos, targetPos, flightT);

        starTip.rotation.z += dt * 14.0;
        const pulse = 1.0 + Math.sin(flightT * Math.PI * 8) * 0.25;
        starTip.scale.set(pulse, pulse, pulse);

        streakNodes.forEach((sm, idx) => {
          const orbitAngle = flightT * 26.0 + (idx * Math.PI) / 2;
          const radius = 0.18 + Math.sin(flightT * 12.0 + idx) * 0.06;
          sm.position.set(
            Math.cos(orbitAngle) * radius,
            Math.sin(orbitAngle) * radius,
            -0.2 - (idx % 2) * 0.3
          );
          sm.rotation.z = orbitAngle;
        });

        tailWake.scale.set(1.0 + Math.sin(flightT * 18.0) * 0.2, 1.0, 1.0);

        const currentElapsed = progress * totalDuration;
        sonicDiscs.forEach((d) => {
          if (currentElapsed >= d.birthTime) {
            d.mesh.visible = true;
            d.mesh.position.copy(d.pos);
            const discAge = (currentElapsed - d.birthTime) / 0.55;
            const dFade = Math.max(0, 1 - discAge);
            const dScale = 0.8 + discAge * 3.4;
            d.mesh.scale.set(dScale, dScale, 1);
            (d.mesh.material as THREE.MeshBasicMaterial).opacity = dFade * 0.75;
          }
        });
      } else {
        arrowGroup.visible = false;
        sonicDiscs.forEach((d) => {
          this.scene.remove(d.mesh);
          d.mesh.geometry.dispose();
        });

        if (!hasDetonated) {
          hasDetonated = true;
          this.triggerResonatingArrowImpact(targetPos);
        }
      }
    });

    // GPU-Batched Arrow Flight Particle Trail (three.quarks)
    const arrowTrail = new ParticleSystem({
      duration: flightDuration,
      looping: false,
      autoDestroy: true,
      shape: new ConeEmitter({ radius: 0.1, arc: Math.PI * 2, angle: 0.08 }),
      startLife: new ConstantValue(0.4),
      startSpeed: new IntervalValue(6.0, 8.5),
      startSize: new IntervalValue(0.2, 0.4),
      startColor: new ColorRange(new Vector4(0.2, 0.85, 0.95, 1.0), new Vector4(0.2, 0.8, 0.35, 0.9)),
      emissionOverTime: new ConstantValue(40),
      material: additiveMat(TEX.slash, 0x22d3ee),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(fadeOutSize())],
    });
    this.addSystem(arrowTrail, startPos);

    // Initial cast dynamic light
    this.addTemporaryLight(0x22d3ee, 3.2, 6.0, startPos, 700);
  }

  /** Terminal impact detonation for Mũi Tên Âm Vang (HitFXFree: impact_sphere, four_point_star, streaks & impact_slash) */
  private triggerResonatingArrowImpact(targetPos: THREE.Vector3): void {
    const impactGroup = new THREE.Group();
    impactGroup.position.copy(targetPos);

    // 1. HitFXFree Silence Shockwave Sphere (impact_sphere.gdshader - "khóa chiêu kẻ địch")
    const sphereGeo = new THREE.SphereGeometry(0.35, 20, 20);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    impactGroup.add(sphereMesh);

    // 2. Giant Four-Point Sonic Star Explosion (HitFXFree: four_point_star.gdshader)
    const starGeo = createFourPointStarGeo(0.9, 0.2);
    const starMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    starMesh.rotation.x = -Math.PI / 4;
    impactGroup.add(starMesh);

    // 3. 14 Radial Acoustic Needle Streaks (HitFXFree: streaks.gdshader)
    const acousticStreaks: THREE.Mesh[] = [];
    const streakMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    for (let i = 0; i < 14; i++) {
      const sGeo = new THREE.ConeGeometry(0.04, 2.4, 4);
      sGeo.rotateX(-Math.PI / 2);
      const sm = new THREE.Mesh(sGeo, streakMat);
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.6,
        (Math.random() - 0.5) * 2
      ).normalize();
      sm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      impactGroup.add(sm);
      acousticStreaks.push(sm);
    }

    // 4. Cross-Cutting Sonic Slices (HitFXFree: impact_slash.gdshader)
    const slashRingGeo = new THREE.RingGeometry(0.2, 0.6, 32);
    const slashRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const slashRing1 = new THREE.Mesh(slashRingGeo, slashRingMat);
    slashRing1.rotation.x = -Math.PI / 2;
    impactGroup.add(slashRing1);

    const slashRing2 = new THREE.Mesh(slashRingGeo, slashRingMat);
    slashRing2.rotation.x = -Math.PI / 3;
    slashRing2.rotation.y = Math.PI / 4;
    impactGroup.add(slashRing2);

    this.addMeshEffect(impactGroup, 1.1, (dt, progress) => {
      const fade = Math.max(0, 1 - progress);

      const sphereScale = 0.5 + progress * 6.0;
      sphereMesh.scale.setScalar(sphereScale);
      sphereMat.opacity = fade * 0.75;

      const starScale = (0.5 + progress * 2.8) * fade;
      starMesh.scale.setScalar(starScale);
      starMesh.rotation.z += dt * 6.0;
      starMat.opacity = fade * 0.95;

      acousticStreaks.forEach((str) => {
        str.scale.set(fade, fade, 0.6 + progress * 2.5);
      });

      const slashScale = 0.5 + progress * 4.8;
      slashRing1.scale.set(slashScale, slashScale, 1);
      slashRing2.scale.set(slashScale, slashScale, 1);
      slashRingMat.opacity = fade * 0.85;
    });

    // GPU-Batched Sonic Melody Notes & Sparks Burst
    const sonicBurst = new ParticleSystem({
      duration: 1.2,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 0.4, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(0.6, 1.1),
      startSpeed: new IntervalValue(3.0, 5.5),
      startSize: new IntervalValue(0.25, 0.45),
      startColor: new ColorRange(new Vector4(0.2, 0.9, 1.0, 0.95), new Vector4(0.98, 0.8, 0.2, 0.8)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(30), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.magic, 0x22d3ee),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(fadeOutSize())],
    });
    this.addSystem(sonicBurst, targetPos);

    this.addTemporaryLight(0x22d3ee, 4.5, 8.5, targetPos, 1100);
  }

  /**
   * Ultimate: Khúc Ca Đại Ngàn (Hymn of the Wilds)
   *
   * User requirements:
   * - Green status buff (StatusFXFree: aura_sphere & status_overlay)
   * - Green flame (FlameFXFree: fire_core & flame_cyclone in emerald/jade)
   * - Continuous expanding green magic circle with hit effect for 3s (HitFXFree: four_point_star, streaks, impact_slash)
   */
  private createUltHymnOfWilds(origin: THREE.Vector3): void {
    const totalDuration = 3.6;
    const hymnGroup = new THREE.Group();
    hymnGroup.position.copy(origin);

    // ─────────────────────────────────────────────────────────────
    // 1. Green Status Buff (StatusFXFree: aura_sphere & heal_particle)
    // ─────────────────────────────────────────────────────────────
    // Outer shimmering status dome
    const buffSphereGeo = new THREE.SphereGeometry(1.6, 24, 24);
    const buffSphereMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const buffSphere = new THREE.Mesh(buffSphereGeo, buffSphereMat);
    buffSphere.position.y = 1.2;
    hymnGroup.add(buffSphere);

    // Inner crystalline core
    const buffCoreGeo = new THREE.DodecahedronGeometry(1.05);
    const buffCoreMat = new THREE.MeshBasicMaterial({
      color: 0x84cc16,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const buffCore = new THREE.Mesh(buffCoreGeo, buffCoreMat);
    buffCore.position.y = 1.2;
    hymnGroup.add(buffCore);

    // 10 Floating status buff diamonds ascending in a spiral
    const buffDiamonds: { mesh: THREE.Mesh; angle: number; baseHeight: number; speed: number; rot: THREE.Vector3 }[] = [];
    const diamondMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x10b981,
      emissiveIntensity: 1.8,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.95,
    });
    for (let d = 0; d < 10; d++) {
      const dGeo = new THREE.OctahedronGeometry(0.1 + Math.random() * 0.04);
      const dm = new THREE.Mesh(dGeo, diamondMat);
      const angle = (d / 10) * Math.PI * 2;
      const baseHeight = 0.4 + (d / 10) * 1.8;
      dm.position.set(Math.cos(angle) * 1.1, baseHeight, Math.sin(angle) * 1.1);
      hymnGroup.add(dm);
      buffDiamonds.push({
        mesh: dm,
        angle,
        baseHeight,
        speed: 2.5 + Math.random() * 1.5,
        rot: new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6),
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Roaring Emerald Green Flame (FlameFXFree: fire_core & flame_cyclone)
    // ─────────────────────────────────────────────────────────────
    // Central green fire core
    const flameCoreGeo = new THREE.CylinderGeometry(0.22, 0.75, 4.4, 8);
    const flameCoreMat = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const flameCore = new THREE.Mesh(flameCoreGeo, flameCoreMat);
    flameCore.position.y = 2.2;
    hymnGroup.add(flameCore);

    // Outer swirling green flame cyclone
    const cycloneGeo = new THREE.CylinderGeometry(0.8, 1.4, 5.0, 12, 1, true);
    const cycloneMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const flameCyclone = new THREE.Mesh(cycloneGeo, cycloneMat);
    flameCyclone.position.y = 2.4;
    hymnGroup.add(flameCyclone);

    // ─────────────────────────────────────────────────────────────
    // 3. Continuous Expanding Green Magic Circles with Hit Effects for 3s
    // ─────────────────────────────────────────────────────────────
    interface MagicWave {
      startTime: number;
      duration: number;
      ringMesh: THREE.Mesh;
      ringMat: THREE.MeshBasicMaterial;
      innerRune: THREE.Mesh;
      innerRuneMat: THREE.MeshBasicMaterial;
      starHits: THREE.Mesh[];
      slashBlades: THREE.Mesh[];
    }

    const magicWaves: MagicWave[] = [];
    const waveCount = 5;
    const waveInterval = 0.6;

    for (let w = 0; w < waveCount; w++) {
      const startTime = w * waveInterval;
      const waveDuration = 1.2;

      const ringGeo = new THREE.RingGeometry(0.3, 0.65, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.04 + w * 0.005;
      ringMesh.visible = false;
      hymnGroup.add(ringMesh);

      const innerGeo = new THREE.RingGeometry(0.18, 0.45, 16);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0x84cc16,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const innerRune = new THREE.Mesh(innerGeo, innerMat);
      innerRune.rotation.x = -Math.PI / 2;
      innerRune.position.y = 0.05 + w * 0.005;
      innerRune.visible = false;
      hymnGroup.add(innerRune);

      const starHits: THREE.Mesh[] = [];
      const starGeo = createFourPointStarGeo(0.42, 0.1);
      const starMat = new THREE.MeshBasicMaterial({
        color: 0xfacc15,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      for (let s = 0; s < 8; s++) {
        const sm = new THREE.Mesh(starGeo, starMat);
        sm.rotation.x = -Math.PI / 2;
        sm.visible = false;
        hymnGroup.add(sm);
        starHits.push(sm);
      }

      const slashBlades: THREE.Mesh[] = [];
      const slashGeo = new THREE.RingGeometry(0.2, 0.6, 32);
      const slashMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const s1 = new THREE.Mesh(slashGeo, slashMat);
      s1.rotation.x = -Math.PI / 2;
      s1.position.y = 0.6;
      s1.visible = false;
      hymnGroup.add(s1);
      slashBlades.push(s1);

      const s2 = new THREE.Mesh(slashGeo, slashMat);
      s2.rotation.x = -Math.PI / 2.5;
      s2.position.y = 0.9;
      s2.visible = false;
      hymnGroup.add(s2);
      slashBlades.push(s2);

      magicWaves.push({
        startTime,
        duration: waveDuration,
        ringMesh,
        ringMat,
        innerRune,
        innerRuneMat: innerMat,
        starHits,
        slashBlades,
      });
    }

    this.addMeshEffect(hymnGroup, totalDuration, (dt, progress) => {
      const currentTime = progress * totalDuration;
      const overallFade = Math.max(0, 1 - progress);

      // 1. Animate Green Status Buff
      buffSphere.rotation.y += dt * 2.0;
      buffSphere.rotation.z += dt * 1.5;
      const sPulse = 1.0 + Math.sin(currentTime * 5.0) * 0.12;
      buffSphere.scale.set(sPulse, sPulse, sPulse);
      buffSphereMat.opacity = overallFade * 0.75;

      buffCore.rotation.y -= dt * 3.5;
      buffCore.scale.set(sPulse * 0.9, sPulse * 0.9, sPulse * 0.9);
      buffCoreMat.opacity = overallFade * 0.85;

      buffDiamonds.forEach((bd) => {
        bd.angle += dt * bd.speed;
        bd.mesh.position.x = Math.cos(bd.angle) * 1.15;
        bd.mesh.position.z = Math.sin(bd.angle) * 1.15;
        bd.mesh.position.y = 0.4 + ((bd.baseHeight + currentTime * 0.8) % 2.4);
        bd.mesh.rotation.x += bd.rot.x * dt;
        bd.mesh.rotation.y += bd.rot.y * dt;
        bd.mesh.scale.setScalar(overallFade);
      });

      // 2. Animate Green Flame Pillar & Cyclone
      flameCore.rotation.y += dt * 6.0;
      flameCyclone.rotation.y -= dt * 8.5;
      const fScale = (1.0 + Math.sin(currentTime * 8.0) * 0.15) * overallFade;
      flameCore.scale.set(fScale, 1.0, fScale);
      flameCyclone.scale.set(fScale, 1.0, fScale);
      flameCoreMat.opacity = overallFade * 0.9;
      cycloneMat.opacity = overallFade * 0.65;

      // 3. Animate 5 Cascading Expanding Magic Circles & Hit Effects
      magicWaves.forEach((w) => {
        if (currentTime >= w.startTime && currentTime <= w.startTime + w.duration) {
          const waveP = (currentTime - w.startTime) / w.duration;
          const wFade = Math.max(0, 1 - waveP);
          const currentRadius = 0.5 + waveP * 6.2;

          w.ringMesh.visible = true;
          w.ringMesh.scale.set(currentRadius, currentRadius, 1);
          w.ringMesh.rotation.z += dt * 1.8;
          w.ringMat.opacity = wFade * 0.9;

          w.innerRune.visible = true;
          w.innerRune.scale.set(currentRadius * 0.65, currentRadius * 0.65, 1);
          w.innerRune.rotation.z -= dt * 2.4;
          w.innerRuneMat.opacity = wFade * 0.85;

          w.starHits.forEach((sm, sIdx) => {
            sm.visible = true;
            const starAngle = (sIdx / 8) * Math.PI * 2 + waveP * Math.PI;
            sm.position.set(Math.cos(starAngle) * currentRadius, 0.08, Math.sin(starAngle) * currentRadius);
            sm.rotation.z += dt * 10.0;
            const starScale = (0.5 + Math.sin(waveP * Math.PI) * 0.8) * wFade;
            sm.scale.set(starScale, starScale, starScale);
          });

          w.slashBlades.forEach((sb, sIdx) => {
            sb.visible = true;
            const bScale = currentRadius * (0.8 + sIdx * 0.2);
            sb.scale.set(bScale, bScale, 1);
            (sb.material as THREE.MeshBasicMaterial).opacity = wFade * 0.8;
          });
        } else if (currentTime > w.startTime + w.duration) {
          w.ringMesh.visible = false;
          w.innerRune.visible = false;
          w.starHits.forEach((sm) => (sm.visible = false));
          w.slashBlades.forEach((sb) => (sb.visible = false));
        }
      });
    });

    // GPU-Batched Melodic Notes
    const melody = new ParticleSystem({
      duration: 3.0,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 1.2, arc: Math.PI * 2, thickness: 0.4 }),
      startLife: new IntervalValue(1.6, 2.4),
      startSpeed: new IntervalValue(3.0, 5.0),
      startSize: new IntervalValue(0.35, 0.65),
      startColor: new ColorRange(new Vector4(0.1, 0.85, 0.4, 0.9), new Vector4(0.5, 0.95, 0.2, 0.8)),
      emissionOverTime: new ConstantValue(40),
      material: additiveMat(TEX.magic, 0x10b981),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(fadeOutSize())],
    });
    melody.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(melody, origin);

    // Dynamic emerald light for 3.2s
    this.addTemporaryLight(0x10b981, 5.2, 14.0, origin, 3200);
  }

  // ─── 3. Trần Nguyễn Trâm Anh (The Illusionist Painter) ───

  /** Active: Vệt Cọ Hư Không (StatusFXFree Shatter Shards + Streaks Beams + Void Slash) */
  private createActiveVoidBrush(origin: THREE.Vector3): void {
    const group = new THREE.Group();
    group.position.copy(origin);

    // 1. 14 Prismatic Status Crystal Shards (StatusFXFree: vfx_status_shatter)
    const shardMeshes: { mesh: THREE.Mesh; vel: THREE.Vector3; rot: THREE.Vector3 }[] = [];
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0xd946ef,
      emissive: 0x9333ea,
      emissiveIntensity: 2.5,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.95,
    });
    for (let i = 0; i < 14; i++) {
      const geo = new THREE.OctahedronGeometry(0.09 + Math.random() * 0.06);
      const m = new THREE.Mesh(geo, shardMat);
      m.position.set(0, 0.5, 0);
      group.add(m);
      shardMeshes.push({
        mesh: m,
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 4.2,
          1.2 + Math.random() * 2.8,
          (Math.random() - 0.5) * 4.2
        ),
        rot: new THREE.Vector3(Math.random() * 8, Math.random() * 8, Math.random() * 8),
      });
    }

    // 2. 12 Radiating Piercing Streaks (StatusFXFree: streaks.gdshader)
    const streakMeshes: THREE.Mesh[] = [];
    const streakMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const geo = new THREE.ConeGeometry(0.035, 2.2 + Math.random() * 0.8, 4);
      geo.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(geo, streakMat);
      m.position.set(0, 0.4, 0);
      m.rotation.y = angle;
      m.rotation.x = (Math.random() - 0.5) * 0.35;
      group.add(m);
      streakMeshes.push(m);
    }

    // 3. Ground Void Ripple
    const rippleGeo = new THREE.RingGeometry(0.2, 0.5, 32);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const ripple = new THREE.Mesh(rippleGeo, rippleMat);
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.y = 0.04;
    group.add(ripple);

    this.addMeshEffect(group, 1.2, (dt, progress) => {
      const fade = Math.max(0, 1 - progress);
      shardMeshes.forEach((s) => {
        s.mesh.position.addScaledVector(s.vel, dt);
        s.vel.y -= 4.0 * dt;
        s.mesh.rotation.x += s.rot.x * dt;
        s.mesh.rotation.y += s.rot.y * dt;
        s.mesh.rotation.z += s.rot.z * dt;
        s.mesh.scale.setScalar(fade);
      });
      streakMeshes.forEach((str) => {
        str.scale.set(fade, fade, 0.5 + progress * 2.2);
      });
      const ripScale = 0.5 + progress * 4.5;
      ripple.scale.set(ripScale, ripScale, 1);
      rippleMat.opacity = fade * 0.9;
    });

    // 4. GPU-batched particles
    const brush = new ParticleSystem({
      duration: 1.4,
      looping: false,
      autoDestroy: true,
      shape: new ConeEmitter({ radius: 0.25, arc: Math.PI * 2, angle: 0.75 }),
      startLife: new IntervalValue(0.8, 1.3),
      startSpeed: new IntervalValue(4.5, 7.0),
      startSize: new IntervalValue(0.35, 0.75),
      startColor: new ColorRange(new Vector4(0.75, 0.1, 0.95, 0.95), new Vector4(0.2, 0.8, 1.0, 0.85)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(45), cycle: 1, interval: 0.01, probability: 1 }],
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
      shape: new SphereEmitter({ radius: 1.4, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(0.6, 1.2),
      startSpeed: new IntervalValue(2.0, 4.0),
      startSize: new IntervalValue(0.1, 0.22),
      startColor: new ColorRange(new Vector4(0.9, 0.2, 0.9, 0.95), new Vector4(0.2, 0.8, 1.0, 0.85)),
      emissionOverTime: new ConstantValue(35),
      material: additiveMat(TEX.spark, 0xd946ef),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(bellSize())],
    });
    this.addSystem(splatter, origin);

    this.addTemporaryLight(0xa855f7, 3.8, 8.0, origin, 1300);
  }

  /** Ultimate: Kiệt Tác Không Gian (StatusFXFree: Aura Sphere + 28 Shatter Shards + Polar Canvas Circle + Streaks) */
  private createUltSpatialMasterpiece(origin: THREE.Vector3): void {
    const domainGroup = new THREE.Group();
    domainGroup.position.copy(origin);

    // 1. 28 Colossal Shatter Crystal Shards (StatusFXFree: vfx_status_shatter)
    const shardMeshes: { mesh: THREE.Mesh; vel: THREE.Vector3; rot: THREE.Vector3; orbitAngle: number; orbitR: number }[] = [];
    const shardColors = [0x06b6d4, 0xf43f5e, 0xa855f7, 0x38bdf8];
    for (let i = 0; i < 28; i++) {
      const geo = i % 2 === 0
        ? new THREE.DodecahedronGeometry(0.14 + Math.random() * 0.1)
        : new THREE.OctahedronGeometry(0.16 + Math.random() * 0.12);
      const col = shardColors[i % shardColors.length];
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 2.2,
        roughness: 0.1,
        metalness: 0.85,
        transparent: true,
        opacity: 0.9,
      });
      const m = new THREE.Mesh(geo, mat);
      const angle = (i / 28) * Math.PI * 2;
      m.position.set(Math.cos(angle) * 0.8, 0.4, Math.sin(angle) * 0.8);
      domainGroup.add(m);
      shardMeshes.push({
        mesh: m,
        vel: new THREE.Vector3((Math.random() - 0.5) * 1.5, 3.8 + Math.random() * 2.2, (Math.random() - 0.5) * 1.5),
        rot: new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6),
        orbitAngle: angle,
        orbitR: 2.4 + Math.random() * 1.8,
      });
    }

    // 2. Swirling 3D Geodesic Aura Energy Sphere (StatusFXFree: aura_sphere.gdshader)
    const auraGeo = new THREE.IcosahedronGeometry(2.2, 2);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const auraSphere = new THREE.Mesh(auraGeo, auraMat);
    auraSphere.position.y = 1.4;
    domainGroup.add(auraSphere);

    const innerCoreGeo = new THREE.SphereGeometry(1.3, 16, 16);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    innerCore.position.y = 1.4;
    domainGroup.add(innerCore);

    // 3. Double Concentric Polar Canvas Ground Circles (ElementalMagicFXFree: area_ground.gdshader)
    const outerRingGeo = new THREE.RingGeometry(3.6, 4.4, 48);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.05;
    domainGroup.add(outerRing);

    const innerRingGeo = new THREE.RingGeometry(2.0, 2.5, 32);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.06;
    domainGroup.add(innerRing);

    // 4. 16 Vertical Reality Piercing Streaks (StatusFXFree: streaks.gdshader)
    const vStreaks: THREE.Mesh[] = [];
    const vStreakMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const sGeo = new THREE.CylinderGeometry(0.015, 0.06, 4.5, 4);
      const sm = new THREE.Mesh(sGeo, vStreakMat);
      sm.position.set(Math.cos(angle) * 3.2, 2.2, Math.sin(angle) * 3.2);
      domainGroup.add(sm);
      vStreaks.push(sm);
    }

    this.addMeshEffect(domainGroup, 3.5, (dt, progress) => {
      const fade = Math.max(0, 1 - progress);
      // Shards orbit and anti-gravity float
      shardMeshes.forEach((s) => {
        s.orbitAngle += dt * 0.9;
        const targetX = Math.cos(s.orbitAngle) * s.orbitR;
        const targetZ = Math.sin(s.orbitAngle) * s.orbitR;
        s.mesh.position.x = THREE.MathUtils.lerp(s.mesh.position.x, targetX, dt * 2.5);
        s.mesh.position.z = THREE.MathUtils.lerp(s.mesh.position.z, targetZ, dt * 2.5);
        s.mesh.position.y += s.vel.y * dt;
        s.vel.y = THREE.MathUtils.lerp(s.vel.y, Math.sin(s.orbitAngle * 3) * 0.8, dt * 1.5);
        s.mesh.rotation.x += s.rot.x * dt;
        s.mesh.rotation.y += s.rot.y * dt;
        s.mesh.scale.setScalar(fade * 1.1);
      });

      // Swirling aura breathing
      const pulse = 1.0 + Math.sin(progress * Math.PI * 6) * 0.18;
      const auraScale = (0.5 + progress * 1.2) * pulse;
      auraSphere.scale.setScalar(auraScale);
      auraSphere.rotation.y += dt * 1.8;
      auraSphere.rotation.z += dt * 1.2;
      auraMat.opacity = fade * 0.7;

      innerCore.scale.setScalar(auraScale * 0.75);
      innerCore.rotation.y -= dt * 2.2;
      innerCoreMat.opacity = fade * 0.35;

      // Concentric ground magic circles rotating in opposite directions
      outerRing.rotation.z += dt * 0.9;
      innerRing.rotation.z -= dt * 1.4;
      outerRingMat.opacity = fade * 0.85;
      innerRingMat.opacity = fade * 0.75;

      // Vertical streaks
      vStreaks.forEach((str, idx) => {
        str.position.y = 2.2 + Math.sin(progress * 10 + idx) * 0.4;
        str.scale.set(fade, fade, fade);
      });
    });

    // 5. GPU-batched particles
    const canvasRing = new ParticleSystem({
      duration: 3.2,
      looping: false,
      autoDestroy: true,
      shape: new DonutEmitter({ radius: 4.5, arc: Math.PI * 2, thickness: 1.6 }),
      startLife: new IntervalValue(1.8, 2.6),
      startSpeed: new IntervalValue(0.8, 1.8),
      startSize: new IntervalValue(0.5, 0.95),
      startColor: new ColorRange(new Vector4(0.55, 0.1, 0.95, 0.8), new Vector4(0.1, 0.85, 0.95, 0.8)),
      emissionOverTime: new ConstantValue(50),
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
      duration: 3.0,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 3.8, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(1.4, 2.2),
      startSpeed: new IntervalValue(1.0, 2.8),
      startSize: new IntervalValue(0.12, 0.26),
      startColor: new ColorRange(new Vector4(0.95, 0.3, 0.95, 0.95), new Vector4(0.2, 0.95, 0.9, 0.9)),
      emissionOverTime: new ConstantValue(60),
      material: additiveMat(TEX.spark, 0xd946ef),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new ApplyForce(new QVector3(0, 1.2, 0), new ConstantValue(1.5))],
    });
    this.addSystem(pigmentMotes, origin);

    this.addTemporaryLight(0x9333ea, 5.5, 14.0, origin, 3500);
  }

  // ─── 4. Nguyễn Khải Vạn (Fireworks Vanguard) ───

  /** Active: Quả Cầu Pháo Hoa (FlameFXFree: Fire Core + ElementalMagicFXFree: Projectile Streaks & Area Glow) */
  private createActiveFireworkOrb(origin: THREE.Vector3): void {
    const burstGroup = new THREE.Group();
    burstGroup.position.copy(origin);

    // 1. Blazing Plasma Fire Core & Turbulent Corona (FlameFXFree: fire_core.gdshader)
    const coreGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xfffbeb,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 0.6;
    burstGroup.add(coreMesh);

    const coronaGeo = new THREE.DodecahedronGeometry(0.52);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xff3700,
      wireframe: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    coronaMesh.position.y = 0.6;
    burstGroup.add(coronaMesh);

    // 2. 16 Piercing Fiery Streaks (ElementalMagicFXFree: projectile_streaks.gdshader)
    const fireStreaks: THREE.Mesh[] = [];
    const streakMat = new THREE.MeshBasicMaterial({
      color: 0xffd000,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    for (let i = 0; i < 16; i++) {
      const sGeo = new THREE.ConeGeometry(0.045, 2.6, 4);
      sGeo.rotateX(-Math.PI / 2);
      const sm = new THREE.Mesh(sGeo, streakMat);
      sm.position.set(0, 0.6, 0);
      const dir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();
      sm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      burstGroup.add(sm);
      fireStreaks.push(sm);
    }

    // 3. Ground Fire Shockwave Ring (ElementalMagicFXFree: area_glow.gdshader)
    const ringGeo = new THREE.RingGeometry(0.3, 0.65, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.04;
    burstGroup.add(ringMesh);

    this.addMeshEffect(burstGroup, 1.4, (dt, progress) => {
      const fade = Math.max(0, 1 - progress);
      // Explosive core expansion
      const coreScale = (0.4 + progress * 2.8) * fade;
      coreMesh.scale.setScalar(coreScale);
      coreMat.opacity = fade * 0.95;

      coronaMesh.scale.setScalar(coreScale * 1.35);
      coronaMesh.rotation.x += dt * 6.0;
      coronaMesh.rotation.y += dt * 8.0;
      coronaMat.opacity = fade * 0.85;

      // Fiery streaks shoot outward
      fireStreaks.forEach((str) => {
        str.scale.set(fade, fade, 0.6 + progress * 2.5);
      });

      // Ground shockwave
      const rScale = 0.5 + progress * 5.0;
      ringMesh.scale.set(rScale, rScale, 1);
      ringMat.opacity = fade * 0.9;
    });

    // 4. GPU-batched particles
    const burst = new ParticleSystem({
      duration: 1.4,
      looping: false,
      autoDestroy: true,
      shape: new SphereEmitter({ radius: 0.35, arc: Math.PI * 2, thickness: 1 }),
      startLife: new IntervalValue(0.8, 1.3),
      startSpeed: new IntervalValue(4.5, 7.5),
      startSize: new IntervalValue(0.25, 0.5),
      startColor: new ColorRange(new Vector4(1.0, 0.25, 0.05, 1.0), new Vector4(1.0, 0.9, 0.25, 0.95)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: new ConstantValue(55), cycle: 1, interval: 0.01, probability: 1 }],
      material: additiveMat(TEX.spark, 0xf97316),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [
        new SizeOverLife(fadeOutSize()),
        new ColorOverLife(fadeAlphaGradient(1.0, 0.4, 0.1)),
        new ApplyForce(new QVector3(0, -2.5, 0), new ConstantValue(2.0)),
      ],
    });
    this.addSystem(burst, origin);

    const smoke = new ParticleSystem({
      duration: 1.6,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 0.7, arc: Math.PI * 2, thickness: 0.4 }),
      startLife: new IntervalValue(1.0, 1.6),
      startSpeed: new IntervalValue(0.6, 1.5),
      startSize: new IntervalValue(0.35, 0.7),
      startColor: new ConstantColor(new Vector4(0.25, 0.25, 0.25, 0.6)),
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0.05, count: new ConstantValue(20), cycle: 1, interval: 0.01, probability: 1 }],
      material: alphaMat(TEX.smoke, 0x475569),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(bellSize())],
    });
    this.addSystem(smoke, origin);

    this.addTemporaryLight(0xff5500, 4.8, 9.0, origin, 1500);
  }

  /** Ultimate: Dạ Khúc Tinh Tú (ElementalMagicFXFree: Area Ground Summon Circle + FlameFXFree: Roaring Fire Core Pillar + 5 Meteors) */
  private createUltCelestialNocturne(origin: THREE.Vector3): void {
    const magicCircleGroup = new THREE.Group();
    magicCircleGroup.position.copy(origin);

    // 1. Grand Sunspire Elemental Magic Circle on Ground (ElementalMagicFXFree: area_ground.gdshader)
    const outerGearGeo = new THREE.RingGeometry(4.2, 4.8, 48);
    const outerGearMat = new THREE.MeshBasicMaterial({
      color: 0xffd000,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const outerGear = new THREE.Mesh(outerGearGeo, outerGearMat);
    outerGear.rotation.x = -Math.PI / 2;
    outerGear.position.y = 0.05;
    magicCircleGroup.add(outerGear);

    const middleRuneGeo = new THREE.RingGeometry(2.8, 3.3, 36);
    const middleRuneMat = new THREE.MeshBasicMaterial({
      color: 0xff4400,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const middleRune = new THREE.Mesh(middleRuneGeo, middleRuneMat);
    middleRune.rotation.x = -Math.PI / 2;
    middleRune.position.y = 0.06;
    magicCircleGroup.add(middleRune);

    const innerStarGeo = new THREE.RingGeometry(1.4, 1.8, 24);
    const innerStarMat = new THREE.MeshBasicMaterial({
      color: 0xff8800,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const innerStar = new THREE.Mesh(innerStarGeo, innerStarMat);
    innerStar.rotation.x = -Math.PI / 2;
    innerStar.position.y = 0.07;
    magicCircleGroup.add(innerStar);

    // 2. Roaring Central Flame Pillar Core (FlameFXFree: fire_core.gdshader & vfx_basic_fire_01.tscn)
    const flameCoreGeo = new THREE.CylinderGeometry(0.2, 0.6, 5.0, 8);
    const flameCoreMat = new THREE.MeshBasicMaterial({
      color: 0xfffaed,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const flameCore = new THREE.Mesh(flameCoreGeo, flameCoreMat);
    flameCore.position.y = 2.5;
    magicCircleGroup.add(flameCore);

    const flameCycloneGeo = new THREE.ConeGeometry(1.4, 5.4, 10);
    const flameCycloneMat = new THREE.MeshBasicMaterial({
      color: 0xff3700,
      transparent: true,
      opacity: 0.55,
      wireframe: true,
      blending: THREE.AdditiveBlending,
    });
    const flameCyclone = new THREE.Mesh(flameCycloneGeo, flameCycloneMat);
    flameCyclone.position.y = 2.7;
    magicCircleGroup.add(flameCyclone);

    this.addMeshEffect(magicCircleGroup, 3.8, (dt, progress) => {
      const fade = Math.max(0, 1 - progress);
      outerGear.rotation.z += dt * 0.8;
      middleRune.rotation.z -= dt * 1.2;
      innerStar.rotation.z += dt * 1.6;

      outerGearMat.opacity = fade * 0.9;
      middleRuneMat.opacity = fade * 0.85;
      innerStarMat.opacity = fade * 0.8;

      // Flame cyclone roar
      flameCore.rotation.y += dt * 5.0;
      flameCyclone.rotation.y -= dt * 7.0;
      const fScale = Math.sin(progress * Math.PI) * 1.1;
      flameCore.scale.set(fScale, 1.0, fScale);
      flameCyclone.scale.set(fScale, 1.0, fScale);
      flameCoreMat.opacity = fade * 0.85;
      flameCycloneMat.opacity = fade * 0.55;
    });

    // 3. 5 Cascading Orbital Celestial Meteor Projectiles (ElementalMagicFXFree: projectile_core & projectile_tail)
    const meteorCoordinates: [number, number, number][] = [
      [0, 0, 0],
      [-2.4, 1.6, 0xffd700],
      [2.4, -1.5, 0xff1493],
      [-1.6, -2.2, 0x00ffff],
      [1.8, 2.2, 0x00ff88],
    ];

    meteorCoordinates.forEach(([xOff, zOff, meteorHex], idx) => {
      setTimeout(() => {
        const impactOrigin = new THREE.Vector3(origin.x + xOff, origin.y, origin.z + zOff);

        // Meteor impact mesh blast
        const impactGroup = new THREE.Group();
        impactGroup.position.copy(impactOrigin);

        // Meteor streaks
        const mStreaks: THREE.Mesh[] = [];
        const mStreakMat = new THREE.MeshBasicMaterial({
          color: meteorHex || 0xffaa00,
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide,
        });
        for (let s = 0; s < 14; s++) {
          const sGeo = new THREE.ConeGeometry(0.04, 2.2, 4);
          sGeo.rotateX(-Math.PI / 2);
          const sm = new THREE.Mesh(sGeo, mStreakMat);
          sm.position.y = 0.5;
          const dir = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            Math.random() * 1.5,
            (Math.random() - 0.5) * 2
          ).normalize();
          sm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
          impactGroup.add(sm);
          mStreaks.push(sm);
        }

        const shockRingGeo = new THREE.RingGeometry(0.2, 0.5, 32);
        const shockRingMat = new THREE.MeshBasicMaterial({
          color: meteorHex || 0xff5500,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });
        const shockRing = new THREE.Mesh(shockRingGeo, shockRingMat);
        shockRing.rotation.x = -Math.PI / 2;
        shockRing.position.y = 0.05;
        impactGroup.add(shockRing);

        this.addMeshEffect(impactGroup, 1.4, (_dt, progress) => {
          const fade = Math.max(0, 1 - progress);
          mStreaks.forEach((str) => str.scale.set(fade, fade, 0.5 + progress * 2.5));
          const rScale = 0.5 + progress * 4.0;
          shockRing.scale.set(rScale, rScale, 1);
          shockRingMat.opacity = fade * 0.9;
        });

        // GPU-batched meteor sparks
        const fireworks = new ParticleSystem({
          duration: 1.8,
          looping: false,
          autoDestroy: true,
          shape: new SphereEmitter({ radius: 0.45, arc: Math.PI * 2, thickness: 1 }),
          startLife: new IntervalValue(1.0, 1.8),
          startSpeed: new IntervalValue(5.0, 9.0),
          startSize: new IntervalValue(0.25, 0.55),
          startColor: new ColorRange(
            new Vector4(1.0, 0.3 + idx * 0.15, 0.1, 1.0),
            new Vector4(0.2, 0.9, 1.0, 0.95)
          ),
          emissionOverTime: new ConstantValue(0),
          emissionBursts: [{ time: 0, count: new ConstantValue(60), cycle: 1, interval: 0.01, probability: 1 }],
          material: additiveMat(TEX.spark, meteorHex || 0xff5500),
          renderMode: RenderMode.BillBoard,
          worldSpace: true,
          behaviors: [
            new SizeOverLife(fadeOutSize()),
            new ApplyForce(new QVector3(0, -2.2, 0), new ConstantValue(2.0)),
          ],
        });
        this.addSystem(fireworks, impactOrigin);

        this.addTemporaryLight(meteorHex || 0xff4500, 3.5, 9.0, impactOrigin, 1200);
      }, idx * 280);
    });

    this.addTemporaryLight(0xff4400, 5.5, 16.0, origin, 3800);
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

  /**
   * Active: Dòng Suối Quật Cường (Resilient Torrent)
   *
   * Lore: "Triệu hồi dòng nước xiết núi đá bao bọc bản thân hoặc đồng minh, vô hiệu hóa đòn đánh tiếp theo và nổ tung đẩy lùi địch."
   *
   * VFX Asset Integration:
   * - Phase 1 (0.0s – 0.65s): Protective Enveloping Mountain Water Torrent Shield
   *   • DarkMagicFXFree: dark_lift.gdshader vertical helical water columns & void_aura.gdshader enclosing barrier.
   *   • DarkMagicFXFree & ElementalMagicFXFree: area_dark & area_ground swirling ground water vortex & dark_ring crest boundary.
   *   • 8 Orbiting Mountain Rock Monoliths ("núi đá") spinning within the torrent barrier.
   * - Phase 2 (0.65s – 1.8s): Explosive Knockback Detonation
   *   • HitFXFree: impact_sphere.gdshader massive expanding outward shockwave hemisphere.
   *   • HitFXFree: impact_slash.gdshader 360-degree cutting horizontal hydro blade ring.
   *   • HitFXFree: streaks.gdshader 18 high-velocity water jet spikes knocking back enemies.
   *   • Mountain stone shards violently hurled outward with parabolic gravity ejection.
   *   • GPU-batched turbulent splash and oceanic point light detonation.
   */
  private createActiveResilientTorrent(origin: THREE.Vector3): void {
    const totalDuration = 1.9;
    const detonateTime = 0.65; // Time when barrier switches from enveloping defense to knockback explosion
    const torrentGroup = new THREE.Group();
    torrentGroup.position.copy(origin);

    // ─────────────────────────────────────────────────────────────
    // Phase 1 Components (DarkMagicFXFree & ElementalMagicFXFree)
    // ─────────────────────────────────────────────────────────────

    // 1. Swirling Ground Water Vortex Disc (DarkMagicFXFree: area_dark & ElementalMagicFXFree: area_ground)
    const vortexGeo = new THREE.RingGeometry(0.25, 1.85, 32);
    const vortexMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const vortexDisc = new THREE.Mesh(vortexGeo, vortexMat);
    vortexDisc.rotation.x = -Math.PI / 2;
    vortexDisc.position.y = 0.04;
    torrentGroup.add(vortexDisc);

    // 2. Concentric Protective Boundary Ring (DarkMagicFXFree: dark_ring.gdshader)
    const boundaryRingGeo = new THREE.RingGeometry(1.65, 1.95, 32);
    const boundaryRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const boundaryRing = new THREE.Mesh(boundaryRingGeo, boundaryRingMat);
    boundaryRing.rotation.x = -Math.PI / 2;
    boundaryRing.position.y = 0.05;
    torrentGroup.add(boundaryRing);

    // 3. 6 Helical Vertical Water Columns (DarkMagicFXFree: dark_lift.gdshader)
    const liftColumns: THREE.Mesh[] = [];
    const liftMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    for (let c = 0; c < 6; c++) {
      const cGeo = new THREE.CylinderGeometry(0.08, 0.16, 2.3, 6);
      const cm = new THREE.Mesh(cGeo, liftMat);
      const angle = (c / 6) * Math.PI * 2;
      cm.position.set(Math.cos(angle) * 1.15, 1.15, Math.sin(angle) * 1.15);
      torrentGroup.add(cm);
      liftColumns.push(cm);
    }

    // 4. Enveloping Water Barrier Dome (DarkMagicFXFree: void_aura & ElementalMagicFXFree: area_glow)
    const domeGeo = new THREE.SphereGeometry(1.25, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.85);
    const domeMat = new THREE.MeshBasicMaterial({
      color: 0x0369a1,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const barrierDome = new THREE.Mesh(domeGeo, domeMat);
    barrierDome.position.y = 0.1;
    torrentGroup.add(barrierDome);

    // 5. 8 Mountain Rock Monolith Shards ("núi đá" aegis stones)
    const rockShards: { mesh: THREE.Mesh; angle: number; height: number; speed: number; vel: THREE.Vector3; rot: THREE.Vector3 }[] = [];
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      emissive: 0xdfa642,
      emissiveIntensity: 0.6,
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.95,
    });
    for (let r = 0; r < 8; r++) {
      const rGeo = new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.05);
      const rm = new THREE.Mesh(rGeo, rockMat);
      const rAngle = (r / 8) * Math.PI * 2;
      const rHeight = 0.5 + Math.random() * 1.1;
      rm.position.set(Math.cos(rAngle) * 1.25, rHeight, Math.sin(rAngle) * 1.25);
      torrentGroup.add(rm);
      rockShards.push({
        mesh: rm,
        angle: rAngle,
        height: rHeight,
        speed: 4.5 + Math.random() * 2.0,
        vel: new THREE.Vector3(
          Math.cos(rAngle) * (4.5 + Math.random() * 3.5),
          2.0 + Math.random() * 2.5,
          Math.sin(rAngle) * (4.5 + Math.random() * 3.5)
        ),
        rot: new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6),
      });
    }

    // ─────────────────────────────────────────────────────────────
    // Phase 2 Components (HitFXFree: Detonation & Knockback Burst)
    // ─────────────────────────────────────────────────────────────

    // 1. HitFXFree Impact Sphere (impact_sphere.gdshader)
    const impactSphereGeo = new THREE.SphereGeometry(0.5, 24, 24);
    const impactSphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const impactSphere = new THREE.Mesh(impactSphereGeo, impactSphereMat);
    impactSphere.position.y = 1.0;
    impactSphere.visible = false;
    torrentGroup.add(impactSphere);

    // 2. HitFXFree Impact Slashes (impact_slash.gdshader - 360 hydro blades)
    const slashBladeGeo = new THREE.RingGeometry(0.3, 0.85, 36);
    const slashBladeMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const slashBlade1 = new THREE.Mesh(slashBladeGeo, slashBladeMat);
    slashBlade1.rotation.x = -Math.PI / 2;
    slashBlade1.position.y = 1.0;
    slashBlade1.visible = false;
    torrentGroup.add(slashBlade1);

    const slashBlade2 = new THREE.Mesh(slashBladeGeo, slashBladeMat);
    slashBlade2.rotation.x = -Math.PI / 2;
    slashBlade2.position.y = 0.5;
    slashBlade2.visible = false;
    torrentGroup.add(slashBlade2);

    // 3. HitFXFree 18 High-Velocity Radial Water Spikes (streaks.gdshader)
    const waterSpikes: THREE.Mesh[] = [];
    const spikeMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    for (let i = 0; i < 18; i++) {
      const sGeo = new THREE.ConeGeometry(0.045, 3.2, 4);
      sGeo.rotateX(-Math.PI / 2);
      const sm = new THREE.Mesh(sGeo, spikeMat);
      sm.position.y = 0.9;
      const angle = (i / 18) * Math.PI * 2;
      const dir = new THREE.Vector3(
        Math.cos(angle),
        (Math.random() - 0.4) * 0.5,
        Math.sin(angle)
      ).normalize();
      sm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      sm.visible = false;
      torrentGroup.add(sm);
      waterSpikes.push(sm);
    }

    let burstTriggered = false;

    this.addMeshEffect(torrentGroup, totalDuration, (dt, progress) => {
      const currentTime = progress * totalDuration;

      if (currentTime < detonateTime) {
        // Phase 1: Enveloping Mountain Water Shield
        const p1 = currentTime / detonateTime;

        vortexDisc.rotation.z -= dt * 6.0;
        boundaryRing.rotation.z += dt * 3.5;
        const vScale = Math.min(1.0, p1 * 2.5);
        vortexDisc.scale.set(vScale, vScale, 1);
        boundaryRing.scale.set(vScale, vScale, 1);

        liftColumns.forEach((cm, idx) => {
          const colAngle = (idx / 6) * Math.PI * 2 + p1 * Math.PI * 3.0;
          cm.position.x = Math.cos(colAngle) * 1.15;
          cm.position.z = Math.sin(colAngle) * 1.15;
          cm.rotation.y += dt * 8.0;
        });

        barrierDome.rotation.y += dt * 3.0;
        const dScale = 1.0 + Math.sin(p1 * Math.PI * 4) * 0.08;
        barrierDome.scale.set(dScale, dScale, dScale);

        rockShards.forEach((rs) => {
          rs.angle += dt * rs.speed;
          rs.mesh.position.x = Math.cos(rs.angle) * 1.25;
          rs.mesh.position.z = Math.sin(rs.angle) * 1.25;
          rs.mesh.position.y = rs.height + Math.sin(rs.angle * 2.0) * 0.2;
          rs.mesh.rotation.x += rs.rot.x * dt;
          rs.mesh.rotation.y += rs.rot.y * dt;
        });
      } else {
        // Phase 2: Explosive Knockback Detonation (HitFXFree)
        const p2 = (currentTime - detonateTime) / (totalDuration - detonateTime);
        const fade = Math.max(0, 1 - p2);

        vortexMat.opacity = fade * 0.4;
        boundaryRingMat.opacity = fade * 0.3;
        liftMat.opacity = fade * 0.2;
        barrierDome.visible = false;

        if (!burstTriggered) {
          burstTriggered = true;
          impactSphere.visible = true;
          slashBlade1.visible = true;
          slashBlade2.visible = true;
          waterSpikes.forEach((sm) => (sm.visible = true));
          this.addTemporaryLight(0x38bdf8, 4.8, 9.5, origin, 1100);
        }

        const shockScale = (0.8 + p2 * 6.5);
        impactSphere.scale.setScalar(shockScale);
        impactSphereMat.opacity = fade * 0.85;

        const bladeScale = 0.8 + p2 * 5.2;
        slashBlade1.scale.set(bladeScale, bladeScale, 1);
        slashBlade2.scale.set(bladeScale * 0.9, bladeScale * 0.9, 1);
        slashBladeMat.opacity = fade * 0.9;

        waterSpikes.forEach((sm) => {
          sm.scale.set(fade, fade, 0.7 + p2 * 2.4);
        });

        rockShards.forEach((rs) => {
          rs.mesh.position.addScaledVector(rs.vel, dt);
          rs.vel.y -= 7.5 * dt;
          rs.mesh.rotation.x += rs.rot.x * dt * 2;
          rs.mesh.rotation.y += rs.rot.y * dt * 2;
          rs.mesh.scale.setScalar(fade * 1.1);
        });
      }
    });

    // Phase 1 GPU Swirling Shield Droplets (three.quarks)
    const swirlingDroplets = new ParticleSystem({
      duration: detonateTime + 0.1,
      looping: false,
      autoDestroy: true,
      shape: new DonutEmitter({ radius: 1.25, arc: Math.PI * 2, thickness: 0.4 }),
      startLife: new IntervalValue(0.4, 0.7),
      startSpeed: new IntervalValue(2.5, 4.0),
      startSize: new IntervalValue(0.2, 0.35),
      startColor: new ColorRange(new Vector4(0.2, 0.8, 1.0, 0.85), new Vector4(0.05, 0.45, 0.85, 0.8)),
      emissionOverTime: new ConstantValue(45),
      material: additiveMat(TEX.slash, 0x0284c7),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(bellSize())],
    });
    swirlingDroplets.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(swirlingDroplets, origin);

    // Phase 2 Delayed GPU Knockback Foam & Water Blast (HitFXFree style)
    setTimeout(() => {
      const knockbackSplash = new ParticleSystem({
        duration: 1.1,
        looping: false,
        autoDestroy: true,
        shape: new SphereEmitter({ radius: 0.5, arc: Math.PI * 2, thickness: 1 }),
        startLife: new IntervalValue(0.6, 1.1),
        startSpeed: new IntervalValue(5.0, 8.5),
        startSize: new IntervalValue(0.25, 0.55),
        startColor: new ColorRange(new Vector4(0.6, 0.95, 1.0, 0.9), new Vector4(0.02, 0.5, 0.9, 0.8)),
        emissionOverTime: new ConstantValue(0),
        emissionBursts: [{ time: 0, count: new ConstantValue(35), cycle: 1, interval: 0.01, probability: 1 }],
        material: alphaMat(TEX.circle, 0x38bdf8),
        renderMode: RenderMode.BillBoard,
        worldSpace: true,
        behaviors: [new SizeOverLife(fadeOutSize())],
      });
      this.addSystem(knockbackSplash, origin);
    }, detonateTime * 1000);

    // Initial defensive light
    this.addTemporaryLight(0x0284c7, 2.8, 6.0, origin, 800);
  }

  /**
   * Ultimate: Khát Vọng Trùng Khơi (Oceanic Tsunami)
   *
   * User requirements:
   * - Water slash and cycling around with thunder (HitFXFree: impact_slash & ElectricFXFree: zap.gdshader)
   * - Water expanding below the feet (DarkMagicFXFree: area_dark & ElementalMagicFXFree: area_ground)
   * - Status effect blue very big (StatusFXFree: aura_sphere.gdshader colossal celestial status dome)
   */
  private createUltOceanTsunami(origin: THREE.Vector3): void {
    const totalDuration = 3.8;
    const tsunamiGroup = new THREE.Group();
    tsunamiGroup.position.copy(origin);

    // ─────────────────────────────────────────────────────────────
    // 1. Status Effect Blue Very Big (StatusFXFree: aura_sphere.gdshader)
    // ─────────────────────────────────────────────────────────────
    // Monumental outer celestial status dome (Radius 4.8m)
    const giantDomeGeo = new THREE.SphereGeometry(4.8, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.88);
    const giantDomeMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const giantDome = new THREE.Mesh(giantDomeGeo, giantDomeMat);
    giantDome.position.y = 0.2;
    tsunamiGroup.add(giantDome);

    // Inner glowing ocean status sphere
    const innerSphereGeo = new THREE.SphereGeometry(2.4, 24, 18);
    const innerSphereMat = new THREE.MeshBasicMaterial({
      color: 0x0369a1,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat);
    innerSphere.position.y = 1.2;
    tsunamiGroup.add(innerSphere);

    // 14 Monumental floating blue aegis runes / status monoliths
    const statusMonoliths: { mesh: THREE.Mesh; angle: number; baseHeight: number; orbitR: number; speed: number; rot: THREE.Vector3 }[] = [];
    const monolithMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.6,
      roughness: 0.2,
      metalness: 0.7,
      transparent: true,
      opacity: 0.95,
    });
    for (let m = 0; m < 14; m++) {
      const mGeo = new THREE.OctahedronGeometry(0.18 + Math.random() * 0.06);
      const mm = new THREE.Mesh(mGeo, monolithMat);
      const mAngle = (m / 14) * Math.PI * 2;
      const orbitR = 2.6 + (m % 2) * 1.2;
      const baseHeight = 0.8 + Math.random() * 1.8;
      mm.position.set(Math.cos(mAngle) * orbitR, baseHeight, Math.sin(mAngle) * orbitR);
      tsunamiGroup.add(mm);
      statusMonoliths.push({
        mesh: mm,
        angle: mAngle,
        baseHeight,
        orbitR,
        speed: 2.0 + Math.random() * 1.6,
        rot: new THREE.Vector3(Math.random() * 5, Math.random() * 5, Math.random() * 5),
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Water Expanding Below the Feet (DarkMagicFXFree & ElementalMagicFXFree)
    // ─────────────────────────────────────────────────────────────
    // Inner swirling ground water whirlpool
    const innerWaterGeo = new THREE.RingGeometry(0.3, 2.5, 36);
    const innerWaterMat = new THREE.MeshBasicMaterial({
      color: 0x0369a1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const innerWaterRing = new THREE.Mesh(innerWaterGeo, innerWaterMat);
    innerWaterRing.rotation.x = -Math.PI / 2;
    innerWaterRing.position.y = 0.04;
    tsunamiGroup.add(innerWaterRing);

    // Middle tidal surge ring
    const midSurgeGeo = new THREE.RingGeometry(1.5, 4.8, 36);
    const midSurgeMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const midSurgeRing = new THREE.Mesh(midSurgeGeo, midSurgeMat);
    midSurgeRing.rotation.x = -Math.PI / 2;
    midSurgeRing.position.y = 0.05;
    tsunamiGroup.add(midSurgeRing);

    // Outer colossal expanding flood ring (expands up to 8.2m)
    const floodRingGeo = new THREE.RingGeometry(3.0, 7.8, 48);
    const floodRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const floodRing = new THREE.Mesh(floodRingGeo, floodRingMat);
    floodRing.rotation.x = -Math.PI / 2;
    floodRing.position.y = 0.06;
    tsunamiGroup.add(floodRing);

    // ─────────────────────────────────────────────────────────────
    // 3. Water Slashes Cycling Around with Thunder (HitFXFree + ElectricFXFree)
    // ─────────────────────────────────────────────────────────────
    // 4 large hydro-blades orbiting in 3D around Thanh Phương
    const waterSlashes: { mesh: THREE.Mesh; height: number; radius: number; speed: number; tilt: number }[] = [];
    const slashMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    for (let s = 0; s < 4; s++) {
      const sGeo = new THREE.RingGeometry(0.35, 1.5, 32, 1, 0, Math.PI * 0.85);
      const sm = new THREE.Mesh(sGeo, slashMat);
      const height = 0.8 + s * 0.45;
      const radius = 1.6 + (s % 2) * 0.5;
      sm.position.set(0, height, 0);
      tsunamiGroup.add(sm);
      waterSlashes.push({
        mesh: sm,
        height,
        radius,
        speed: 6.5 + s * 1.2,
        tilt: (s * Math.PI) / 4,
      });
    }

    // 6 Crackling Jagged Electric Thunder Lightning Arcs (ElectricFXFree: zap.gdshader)
    const thunderArcs: { line: THREE.Line; startNodeIdx: number }[] = [];
    const lightningMat = new THREE.LineBasicMaterial({
      color: 0xa5f3fc,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
    });
    for (let t = 0; t < 6; t++) {
      const dummyPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)];
      const tGeo = new THREE.BufferGeometry().setFromPoints(dummyPoints);
      const tLine = new THREE.Line(tGeo, lightningMat);
      tsunamiGroup.add(tLine);
      thunderArcs.push({ line: tLine, startNodeIdx: t % 4 });
    }

    this.addMeshEffect(tsunamiGroup, totalDuration, (dt, progress) => {
      const currentTime = progress * totalDuration;
      const overallFade = Math.max(0, 1 - progress);

      // 1. Animate Giant Blue Status Dome & Monoliths
      giantDome.rotation.y += dt * 1.5;
      const dPulse = 1.0 + Math.sin(currentTime * 4.0) * 0.08;
      giantDome.scale.set(dPulse, dPulse, dPulse);
      giantDomeMat.opacity = overallFade * 0.7;

      innerSphere.rotation.y -= dt * 2.2;
      innerSphereMat.opacity = overallFade * 0.8;

      statusMonoliths.forEach((sm) => {
        sm.angle += dt * sm.speed;
        sm.mesh.position.x = Math.cos(sm.angle) * sm.orbitR;
        sm.mesh.position.z = Math.sin(sm.angle) * sm.orbitR;
        sm.mesh.position.y = sm.baseHeight + Math.sin(sm.angle * 2.5) * 0.35;
        sm.mesh.rotation.x += sm.rot.x * dt;
        sm.mesh.rotation.y += sm.rot.y * dt;
        sm.mesh.scale.setScalar(overallFade * 1.1);
      });

      // 2. Animate Water Expanding Below the Feet
      innerWaterRing.rotation.z -= dt * 4.5;
      midSurgeRing.rotation.z += dt * 3.0;
      floodRing.rotation.z -= dt * 2.2;

      const expandScale = 0.6 + progress * 2.2;
      innerWaterRing.scale.set(expandScale, expandScale, 1);
      midSurgeRing.scale.set(expandScale * 1.15, expandScale * 1.15, 1);
      floodRing.scale.set(expandScale * 1.35, expandScale * 1.35, 1);

      innerWaterMat.opacity = overallFade * 0.9;
      midSurgeMat.opacity = overallFade * 0.85;
      floodRingMat.opacity = overallFade * 0.8;

      // 3. Animate Water Slashes Cycling Around with Thunder
      waterSlashes.forEach((ws, idx) => {
        const orbitAngle = currentTime * ws.speed + (idx * Math.PI) / 2;
        ws.mesh.position.x = Math.cos(orbitAngle) * ws.radius;
        ws.mesh.position.z = Math.sin(orbitAngle) * ws.radius;
        ws.mesh.position.y = ws.height + Math.sin(orbitAngle * 2.0) * 0.25;
        ws.mesh.rotation.x = -Math.PI / 2 + ws.tilt;
        ws.mesh.rotation.z = orbitAngle;
        ws.mesh.scale.setScalar(overallFade * 1.1);
      });

      // Crackling zigzag thunder arcs between cycling slashes and ground
      thunderArcs.forEach((ta) => {
        const sourceSlash = waterSlashes[ta.startNodeIdx];
        const sPos = sourceSlash.mesh.position;
        const endPos = new THREE.Vector3(
          sPos.x + (Math.random() - 0.5) * 2.2,
          Math.max(0.05, sPos.y - 1.2 + (Math.random() - 0.5) * 0.8),
          sPos.z + (Math.random() - 0.5) * 2.2
        );

        const arcPoints: THREE.Vector3[] = [sPos.clone()];
        const segments = 5;
        for (let seg = 1; seg < segments; seg++) {
          const tLerp = seg / segments;
          const mid = new THREE.Vector3().lerpVectors(sPos, endPos, tLerp);
          mid.x += (Math.random() - 0.5) * 0.35;
          mid.y += (Math.random() - 0.5) * 0.35;
          mid.z += (Math.random() - 0.5) * 0.35;
          arcPoints.push(mid);
        }
        arcPoints.push(endPos);

        ta.line.geometry.dispose();
        ta.line.geometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
        (ta.line.material as THREE.LineBasicMaterial).opacity = overallFade * (0.6 + Math.random() * 0.4);
      });
    });

    // GPU-Batched Oceanic Whirlpool & Crest Foam
    const whirlpool = new ParticleSystem({
      duration: 3.2,
      looping: false,
      autoDestroy: true,
      shape: new CircleEmitter({ radius: 2.2, arc: Math.PI * 2, thickness: 0.6 }),
      startLife: new IntervalValue(1.6, 2.5),
      startSpeed: new IntervalValue(4.0, 7.0),
      startSize: new IntervalValue(0.4, 0.9),
      startColor: new ColorRange(new Vector4(0.05, 0.4, 0.9, 0.95), new Vector4(0.2, 0.85, 1.0, 0.85)),
      emissionOverTime: new ConstantValue(60),
      material: additiveMat(TEX.circle, 0x0284c7),
      renderMode: RenderMode.BillBoard,
      worldSpace: true,
      behaviors: [new SizeOverLife(fadeOutSize())],
    });
    whirlpool.emitter.rotation.set(-Math.PI / 2, 0, 0);
    this.addSystem(whirlpool, origin);

    // Monumental Ocean Dynamic Point Light
    this.addTemporaryLight(0x0284c7, 6.0, 18.0, origin, 3500);
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

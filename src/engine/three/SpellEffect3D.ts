import * as THREE from 'three';
import { CharacterSignatureAbility } from '../../types/character';

interface ActiveSpell {
  group: THREE.Group;
  duration: number;
  age: number;
  update: (dt: number, progress: number) => boolean; // returns true when finished
}

export class SpellEffect3D {
  private scene: THREE.Scene;
  private activeSpells: ActiveSpell[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public castSpell(effectType: CharacterSignatureAbility['effectType'], origin: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.copy(origin);
    this.scene.add(group);

    switch (effectType) {
      case 'nature_bloom':
        this.createNatureBloom(group);
        break;
      case 'aegis_shield':
        this.createAegisShield(group);
        break;
      case 'firework_burst':
        this.createFireworkBurst(group);
        break;
      case 'water_slash':
        this.createWaterSlash(group);
        break;
      case 'eagle_scout':
        this.createEagleScout(group);
        break;
      case 'lute_hymn':
        this.createLuteHymn(group);
        break;
      case 'dawn_light':
        this.createDawnLight(group);
        break;
      case 'swashbuckle_coin':
        this.createSwashbuckleCoin(group);
        break;
      case 'tidal_wave':
        this.createTidalWave(group);
        break;
      default:
        this.createNatureBloom(group);
    }
  }

  // 1. Nature Bloom: Expanding emerald ring + floating golden botanical motes
  private createNatureBloom(group: THREE.Group) {
    const ringGeo = new THREE.RingGeometry(0.2, 0.45, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x33ff66,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    group.add(ring);

    // Floating leaf sparkle motes
    const particlesCount = 20;
    const pGeo = new THREE.DodecahedronGeometry(0.08);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0x66ff88,
      emissive: 0x22cc44,
      emissiveIntensity: 1.0,
      roughness: 0.3,
    });

    const particles: { mesh: THREE.Mesh; vx: number; vy: number; vz: number }[] = [];
    for (let i = 0; i < particlesCount; i++) {
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.set(
        (Math.random() - 0.5) * 0.8,
        0.2 + Math.random() * 0.4,
        (Math.random() - 0.5) * 0.8
      );
      group.add(p);
      particles.push({
        mesh: p,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 1.0 + Math.random() * 1.5,
        vz: (Math.random() - 0.5) * 1.2,
      });
    }

    this.activeSpells.push({
      group,
      duration: 1.8,
      age: 0,
      update: (dt, progress) => {
        // Expand ring
        ring.scale.setScalar(1 + progress * 4.5);
        ringMat.opacity = Math.max(0, 1 - progress);

        // Move particles
        particles.forEach((pt) => {
          pt.mesh.position.x += pt.vx * dt;
          pt.mesh.position.y += pt.vy * dt;
          pt.mesh.position.z += pt.vz * dt;
          pt.mesh.scale.setScalar(Math.max(0, 1 - progress));
        });

        return progress >= 1.0;
      },
    });
  }

  // 2. Aegis Shield: Giant radiant azure dome barrier shimmering around hero
  private createAegisShield(group: THREE.Group) {
    const domeGeo = new THREE.SphereGeometry(1.35, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x44aaff,
      emissive: 0x1177ee,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      roughness: 0.2,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.05;
    group.add(dome);

    // Golden boundary ring
    const rimGeo = new THREE.TorusGeometry(1.36, 0.04, 8, 32);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.05;
    group.add(rim);

    this.activeSpells.push({
      group,
      duration: 2.2,
      age: 0,
      update: (_dt, progress) => {
        // Shimmering pulse
        const shimmer = Math.sin(progress * Math.PI * 8) * 0.15;
        domeMat.opacity = Math.max(0, (1 - progress * 0.8) * 0.85 + shimmer);
        dome.scale.setScalar(1 + Math.sin(progress * Math.PI) * 0.12);
        return progress >= 1.0;
      },
    });
  }

  // 3. Grand Pyrotechnic: Rockets shoot up into the sky and burst into colorful fireworks!
  private createFireworkBurst(group: THREE.Group) {
    const sparkCount = 45;
    const colors = [0xff3344, 0xffd700, 0x00e5ff, 0x9933ff, 0x00ff88];

    const sparks: { mesh: THREE.Mesh; vx: number; vy: number; vz: number; color: number }[] = [];
    for (let i = 0; i < sparkCount; i++) {
      const c = colors[i % colors.length];
      const pGeo = new THREE.DodecahedronGeometry(0.09);
      const pMat = new THREE.MeshBasicMaterial({ color: c });
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.y = 1.0;
      group.add(p);

      const angle = (i / sparkCount) * Math.PI * 2;
      const speed = 2.5 + Math.random() * 2.5;
      sparks.push({
        mesh: p,
        vx: Math.cos(angle) * speed * (0.5 + Math.random() * 0.5),
        vy: 2.5 + Math.random() * 3.5,
        vz: Math.sin(angle) * speed * (0.5 + Math.random() * 0.5),
        color: c,
      });
    }

    this.activeSpells.push({
      group,
      duration: 2.0,
      age: 0,
      update: (dt, progress) => {
        sparks.forEach((sp) => {
          sp.mesh.position.x += sp.vx * dt;
          sp.mesh.position.y += sp.vy * dt;
          sp.mesh.position.z += sp.vz * dt;
          sp.vy -= 4.5 * dt; // gravity
          sp.mesh.scale.setScalar(Math.max(0, 1 - progress * 0.9));
        });
        return progress >= 1.0;
      },
    });
  }

  // 4. Flowing Water Katas: Swirling azure blade slashes
  private createWaterSlash(group: THREE.Group) {
    const slashGeo = new THREE.TorusGeometry(0.9, 0.08, 8, 24, Math.PI * 1.2);
    const slashMat = new THREE.MeshStandardMaterial({
      color: 0x00d2d3,
      emissive: 0x01a3a4,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.9,
    });
    const slash1 = new THREE.Mesh(slashGeo, slashMat);
    slash1.position.y = 0.8;
    slash1.rotation.x = Math.PI / 4;
    group.add(slash1);

    const slash2 = new THREE.Mesh(slashGeo, slashMat);
    slash2.position.y = 1.1;
    slash2.rotation.x = -Math.PI / 4;
    slash2.rotation.z = Math.PI;
    group.add(slash2);

    this.activeSpells.push({
      group,
      duration: 1.4,
      age: 0,
      update: (dt, progress) => {
        slash1.rotation.y += 6.0 * dt;
        slash2.rotation.y -= 6.0 * dt;
        slash1.scale.setScalar(1 + progress * 2.0);
        slash2.scale.setScalar(1 + progress * 2.0);
        slashMat.opacity = Math.max(0, 1 - progress);
        return progress >= 1.0;
      },
    });
  }

  // 5. Eagle Eye: Golden falcon beacon ascending to the sky
  private createEagleScout(group: THREE.Group) {
    const beaconGeo = new THREE.CylinderGeometry(0.04, 0.4, 4.0, 16);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.85,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 2.0;
    group.add(beacon);

    this.activeSpells.push({
      group,
      duration: 1.6,
      age: 0,
      update: (_dt, progress) => {
        beacon.position.y = 2.0 + progress * 3.5;
        beaconMat.opacity = Math.max(0, 1 - progress);
        return progress >= 1.0;
      },
    });
  }

  // 6. Hymn of Antiquity: Expanding musical harmonic wave
  private createLuteHymn(group: THREE.Group) {
    const waveGeo = new THREE.TorusGeometry(0.6, 0.05, 8, 32);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xff6b81,
      transparent: true,
      opacity: 0.9,
    });
    const wave = new THREE.Mesh(waveGeo, waveMat);
    wave.rotation.x = Math.PI / 2;
    wave.position.y = 0.8;
    group.add(wave);

    this.activeSpells.push({
      group,
      duration: 1.5,
      age: 0,
      update: (_dt, progress) => {
        wave.scale.setScalar(1 + progress * 4.0);
        wave.position.y = 0.8 + progress * 1.5;
        waveMat.opacity = Math.max(0, 1 - progress);
        return progress >= 1.0;
      },
    });
  }

  // 7. Dawn Radiance: Divine light pillar beaming down from the clouds
  private createDawnLight(group: THREE.Group) {
    const pillarGeo = new THREE.CylinderGeometry(0.7, 0.7, 8.0, 20);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0xfff0aa,
      emissive: 0xffd700,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.8,
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 4.0;
    group.add(pillar);

    this.activeSpells.push({
      group,
      duration: 2.0,
      age: 0,
      update: (_dt, progress) => {
        pillar.scale.x = 1 + Math.sin(progress * Math.PI) * 0.4;
        pillar.scale.z = pillar.scale.x;
        pillarMat.opacity = Math.max(0, Math.sin(progress * Math.PI) * 0.85);
        return progress >= 1.0;
      },
    });
  }

  // 8. Swashbuckler Coin: Shower of glittering gold doubloons
  private createSwashbuckleCoin(group: THREE.Group) {
    const coinCount = 18;
    const cGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 12);
    const cMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.2,
      emissive: 0xaa8800,
      emissiveIntensity: 0.5,
    });

    const coins: { mesh: THREE.Mesh; vx: number; vy: number; vz: number }[] = [];
    for (let i = 0; i < coinCount; i++) {
      const coin = new THREE.Mesh(cGeo, cMat);
      coin.position.y = 0.8;
      coin.rotation.x = Math.random() * Math.PI;
      group.add(coin);
      coins.push({
        mesh: coin,
        vx: (Math.random() - 0.5) * 2.2,
        vy: 2.0 + Math.random() * 2.2,
        vz: (Math.random() - 0.5) * 2.2,
      });
    }

    this.activeSpells.push({
      group,
      duration: 1.8,
      age: 0,
      update: (dt, progress) => {
        coins.forEach((c) => {
          c.mesh.position.x += c.vx * dt;
          c.mesh.position.y += c.vy * dt;
          c.mesh.position.z += c.vz * dt;
          c.vy -= 4.0 * dt;
          c.mesh.rotation.y += 8.0 * dt;
          c.mesh.scale.setScalar(Math.max(0, 1 - progress * 0.7));
        });
        return progress >= 1.0;
      },
    });
  }

  // 9. Tidal Embrace: Concentric seafoam water rings
  private createTidalWave(group: THREE.Group) {
    const waveGeo = new THREE.RingGeometry(0.3, 0.6, 32);
    const waveMat = new THREE.MeshStandardMaterial({
      color: 0x00cec9,
      emissive: 0x008b8b,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const wave = new THREE.Mesh(waveGeo, waveMat);
    wave.rotation.x = -Math.PI / 2;
    wave.position.y = 0.06;
    group.add(wave);

    this.activeSpells.push({
      group,
      duration: 1.8,
      age: 0,
      update: (_dt, progress) => {
        wave.scale.setScalar(1 + progress * 5.0);
        waveMat.opacity = Math.max(0, 1 - progress);
        return progress >= 1.0;
      },
    });
  }

  public update(dt: number) {
    for (let i = this.activeSpells.length - 1; i >= 0; i--) {
      const spell = this.activeSpells[i];
      spell.age += dt;
      const progress = Math.min(1.0, spell.age / spell.duration);
      const isDone = spell.update(dt, progress);

      if (isDone) {
        this.scene.remove(spell.group);
        this.activeSpells.splice(i, 1);
      }
    }
  }
}

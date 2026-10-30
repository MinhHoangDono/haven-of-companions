import * as THREE from 'three';
import { assetLoader } from '../GLTFAssetLoader';

/**
 * Procedural Equipment & Asset Generator
 * Builds high-fidelity 3D weapons, helmets, hats, shields, and capes for character customization.
 */
export class EquipmentGenerator {
  // Shared materials for procedural performance
  private static goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.85,
    roughness: 0.25,
  });


  private static darkLeatherMat = new THREE.MeshStandardMaterial({
    color: 0x2b1d14,
    roughness: 0.8,
    metalness: 0.1,
  });

  /**
   * Loads or procedurally creates an equipment 3D mesh
   */
  public static async createEquipmentMesh(assetId: string): Promise<THREE.Object3D> {
    if (assetId.startsWith('proc:')) {
      return this.buildProceduralMesh(assetId);
    }

    // Standard GLTF model from assets/models/characters/
    const { scene } = await assetLoader.loadModel(`assets/models/characters/${assetId}`, false);
    const clone = scene.clone(true);
    return clone;
  }

  /**
   * Router for procedural asset generators
   */
  private static buildProceduralMesh(procId: string): THREE.Object3D {
    switch (procId) {
      case 'proc:dragonflame_blade':
        return this.createDragonflameBlade();
      case 'proc:ocean_trident':
        return this.createOceanTrident();
      case 'proc:glacial_katana':
        return this.createGlacialKatana();
      case 'proc:abyssal_scythe':
        return this.createAbyssalScythe();
      case 'proc:celestial_staff':
        return this.createCelestialStaff();
      case 'proc:dawn_scepter':
        return this.createDawnScepter();
      case 'proc:wizard_hat':
        return this.createWizardHat(0x4c2882, 0xd4af37);
      case 'proc:knight_helm':
        return this.createKnightHelm(0xc5cdd5, 0xd92638);
      case 'proc:feather_cap':
        return this.createFeatherCap(0x2f6f3e, 0xef4444);
      case 'proc:tricorn_hat':
        return this.createTricornHat(0x1a1a24, 0xd4af37);
      case 'proc:golden_halo':
        return this.createGoldenHalo();
      case 'proc:highland_cloak':
        return this.createCape(0x1e6f42, 0xd4af37);
      case 'proc:royal_mantle':
        return this.createCape(0x991b1b, 0xfacc15);
      case 'proc:ocean_cape':
        return this.createCape(0x0e7490, 0x38bdf8);
      default:
        return new THREE.Group();
    }
  }

  /**
   * Dragonflame Greatsword: Golden hilt, fire-inlaid runic blade
   */
  private static createDragonflameBlade(): THREE.Group {
    const group = new THREE.Group();

    // Hilt / Pommel
    const pommelGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const pommel = new THREE.Mesh(pommelGeo, this.goldMat);
    pommel.position.y = -0.32;
    group.add(pommel);

    // Grip
    const gripGeo = new THREE.CylinderGeometry(0.032, 0.036, 0.28, 8);
    const grip = new THREE.Mesh(gripGeo, this.darkLeatherMat);
    grip.position.y = -0.16;
    group.add(grip);

    // Crossguard
    const guardGeo = new THREE.BoxGeometry(0.36, 0.06, 0.08);
    const guard = new THREE.Mesh(guardGeo, this.goldMat);
    guard.position.y = 0;
    group.add(guard);

    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.12, 0.95, 0.024);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff4400,
      emissiveIntensity: 0.6,
      metalness: 0.6,
      roughness: 0.3,
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.5;
    group.add(blade);

    // Blade Tip (Diamond)
    const tipGeo = new THREE.ConeGeometry(0.085, 0.22, 4);
    tipGeo.rotateY(Math.PI / 4);
    const tip = new THREE.Mesh(tipGeo, bladeMat);
    tip.position.y = 1.05;
    group.add(tip);

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  }

  /**
   * Ocean Trident: 3 curved prongs with turquoise pearl center
   */
  private static createOceanTrident(): THREE.Group {
    const group = new THREE.Group();

    // Long shaft
    const shaftGeo = new THREE.CylinderGeometry(0.028, 0.028, 1.4, 8);
    const shaft = new THREE.Mesh(shaftGeo, this.goldMat);
    shaft.position.y = 0.2;
    group.add(shaft);

    // Center Prong
    const centerGeo = new THREE.ConeGeometry(0.045, 0.45, 6);
    const cyanMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });
    const centerProng = new THREE.Mesh(centerGeo, cyanMat);
    centerProng.position.y = 1.1;
    group.add(centerProng);

    // Fork bar
    const forkBarGeo = new THREE.BoxGeometry(0.34, 0.05, 0.05);
    const forkBar = new THREE.Mesh(forkBarGeo, this.goldMat);
    forkBar.position.y = 0.9;
    group.add(forkBar);

    // Left & Right Prongs
    const sideGeo = new THREE.ConeGeometry(0.038, 0.36, 6);
    const leftProng = new THREE.Mesh(sideGeo, cyanMat);
    leftProng.position.set(-0.16, 1.05, 0);
    leftProng.rotation.z = 0.12;
    group.add(leftProng);

    const rightProng = new THREE.Mesh(sideGeo, cyanMat);
    rightProng.position.set(0.16, 1.05, 0);
    rightProng.rotation.z = -0.12;
    group.add(rightProng);

    group.scale.set(0.8, 0.8, 0.8);
    return group;
  }

  /**
   * Wizard Hat: Cone with brim & gold band
   */
  private static createWizardHat(colorHex: number, bandColorHex: number): THREE.Group {
    const group = new THREE.Group();

    const hatMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.7,
      metalness: 0.1,
    });

    // Brim
    const brimGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.04, 24);
    const brim = new THREE.Mesh(brimGeo, hatMat);
    brim.position.y = 0;
    group.add(brim);

    // Band
    const bandMat = new THREE.MeshStandardMaterial({
      color: bandColorHex,
      metalness: 0.8,
      roughness: 0.3,
    });
    const bandGeo = new THREE.CylinderGeometry(0.29, 0.31, 0.06, 24);
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.y = 0.05;
    group.add(band);

    // Cone
    const coneGeo = new THREE.ConeGeometry(0.28, 0.65, 18);
    const cone = new THREE.Mesh(coneGeo, hatMat);
    cone.position.set(0, 0.35, -0.04);
    cone.rotation.x = -0.12; // gentle wizard hat slant
    group.add(cone);

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  }

  /**
   * Knight Helm: Visor with plume
   */
  private static createKnightHelm(steelHex: number, plumeHex: number): THREE.Group {
    const group = new THREE.Group();

    const helmMat = new THREE.MeshStandardMaterial({
      color: steelHex,
      metalness: 0.9,
      roughness: 0.25,
    });

    // Main dome
    const domeGeo = new THREE.SphereGeometry(0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.75);
    const dome = new THREE.Mesh(domeGeo, helmMat);
    dome.position.y = 0.05;
    group.add(dome);

    // Visor front
    const visorGeo = new THREE.BoxGeometry(0.34, 0.16, 0.24);
    const visor = new THREE.Mesh(visorGeo, helmMat);
    visor.position.set(0, 0.02, 0.18);
    group.add(visor);

    // Slit
    const slitGeo = new THREE.BoxGeometry(0.24, 0.028, 0.02);
    const slitMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0f });
    const slit = new THREE.Mesh(slitGeo, slitMat);
    slit.position.set(0, 0.02, 0.302);
    group.add(slit);

    // Plume
    const plumeMat = new THREE.MeshStandardMaterial({
      color: plumeHex,
      roughness: 0.8,
    });
    const plumeGeo = new THREE.ConeGeometry(0.06, 0.35, 8);
    const plume = new THREE.Mesh(plumeGeo, plumeMat);
    plume.position.set(0, 0.42, -0.06);
    plume.rotation.x = -0.3;
    group.add(plume);

    group.scale.set(0.95, 0.95, 0.95);
    return group;
  }

  /**
   * Feathered Cap: Huntsman style cap with colored quill
   */
  private static createFeatherCap(feltColorHex: number, featherHex: number): THREE.Group {
    const group = new THREE.Group();

    const feltMat = new THREE.MeshStandardMaterial({
      color: feltColorHex,
      roughness: 0.85,
    });

    // Cap base
    const capGeo = new THREE.CylinderGeometry(0.32, 0.35, 0.18, 16);
    const cap = new THREE.Mesh(capGeo, feltMat);
    cap.position.y = 0.05;
    group.add(cap);

    // Turned up brim
    const brimGeo = new THREE.TorusGeometry(0.34, 0.05, 8, 16, Math.PI);
    const brim = new THREE.Mesh(brimGeo, feltMat);
    brim.rotation.x = Math.PI / 2;
    brim.position.set(0, 0.02, 0.1);
    group.add(brim);

    // Feather quill
    const featherGeo = new THREE.ConeGeometry(0.04, 0.4, 6);
    const featherMat = new THREE.MeshStandardMaterial({
      color: featherHex,
      roughness: 0.6,
    });
    const feather = new THREE.Mesh(featherGeo, featherMat);
    feather.position.set(-0.28, 0.22, 0.05);
    feather.rotation.z = -0.45;
    feather.rotation.x = -0.2;
    group.add(feather);

    return group;
  }

  /**
   * Tricorn Hat: 3-cornered pirate hat
   */
  private static createTricornHat(feltHex: number, goldHex: number): THREE.Group {
    const group = new THREE.Group();

    const feltMat = new THREE.MeshStandardMaterial({
      color: feltHex,
      roughness: 0.8,
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: goldHex,
      metalness: 0.85,
      roughness: 0.3,
    });

    // Crown
    const crownGeo = new THREE.CylinderGeometry(0.3, 0.32, 0.2, 16);
    const crown = new THREE.Mesh(crownGeo, feltMat);
    crown.position.y = 0.08;
    group.add(crown);

    // 3 Turned up folds
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const foldGeo = new THREE.BoxGeometry(0.32, 0.18, 0.04);
      const fold = new THREE.Mesh(foldGeo, feltMat);
      fold.position.set(Math.sin(angle) * 0.26, 0.16, Math.cos(angle) * 0.26);
      fold.rotation.y = angle + Math.PI / 2;
      group.add(fold);

      // Gold Trim
      const trimGeo = new THREE.BoxGeometry(0.34, 0.024, 0.044);
      const trim = new THREE.Mesh(trimGeo, trimMat);
      trim.position.set(Math.sin(angle) * 0.26, 0.25, Math.cos(angle) * 0.26);
      trim.rotation.y = angle + Math.PI / 2;
      group.add(trim);
    }

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  }

  /**
   * Golden Halo: Floating emissive ring
   */
  private static createGoldenHalo(): THREE.Group {
    const group = new THREE.Group();

    const haloGeo = new THREE.TorusGeometry(0.32, 0.04, 12, 32);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xffea00,
      emissive: 0xffcc00,
      emissiveIntensity: 0.8,
      metalness: 0.7,
      roughness: 0.2,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.35; // floats above head
    group.add(halo);

    return group;
  }

  /**
   * Flowing Back Cape / Mantle
   */
  private static createCape(colorHex: number, trimHex: number): THREE.Group {
    const group = new THREE.Group();

    // Curved cape mesh
    const capeGeo = new THREE.PlaneGeometry(0.55, 1.05, 4, 8);
    const capeMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.75,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    // Subtly curve the vertices backward for a natural drape
    const pos = capeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const drape = Math.sin((y + 0.5) * Math.PI) * 0.08;
      pos.setZ(i, -drape);
    }
    capeGeo.computeVertexNormals();

    const cape = new THREE.Mesh(capeGeo, capeMat);
    cape.position.set(0, -0.4, -0.12);
    group.add(cape);

    // Collar / clasp
    const claspGeo = new THREE.BoxGeometry(0.35, 0.05, 0.08);
    const claspMat = new THREE.MeshStandardMaterial({
      color: trimHex,
      metalness: 0.8,
      roughness: 0.3,
    });
    const clasp = new THREE.Mesh(claspGeo, claspMat);
    clasp.position.set(0, 0.12, -0.08);
    group.add(clasp);

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  }

  /**
   * Glacial Tide Katana: Curved blade with wave hamon and frosty cyan glow
   */
  private static createGlacialKatana(): THREE.Group {
    const group = new THREE.Group();

    // Tsuka (Handle)
    const handleGeo = new THREE.CylinderGeometry(0.024, 0.026, 0.28, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = -0.14;
    group.add(handle);

    // Kashira (Pommel)
    const pommelGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.03, 8);
    const pommel = new THREE.Mesh(pommelGeo, this.goldMat);
    pommel.position.y = -0.28;
    group.add(pommel);

    // Tsuba (Circular wave guard)
    const tsubaGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16);
    const tsuba = new THREE.Mesh(tsubaGeo, this.goldMat);
    tsuba.position.y = 0;
    group.add(tsuba);

    // Blade (Curved slender blade with icy cyan glow)
    const bladeGeo = new THREE.BoxGeometry(0.045, 0.85, 0.018);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.15,
    });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(0.015, 0.44, 0);
    blade.rotation.z = -0.04; // subtle authentic katana curve
    group.add(blade);

    // Tip
    const tipGeo = new THREE.ConeGeometry(0.032, 0.14, 4);
    const tip = new THREE.Mesh(tipGeo, bladeMat);
    tip.position.set(0.032, 0.91, 0);
    tip.rotation.z = -0.15;
    group.add(tip);

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  }

  /**
   * Abyssal Void Scythe: Curved dark crescent blade with neon violet core
   */
  private static createAbyssalScythe(): THREE.Group {
    const group = new THREE.Group();

    // Long staff shaft
    const shaftGeo = new THREE.CylinderGeometry(0.028, 0.03, 1.4, 8);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 0.2;
    group.add(shaft);

    // Collar fitting
    const collarGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.08, 8);
    const collar = new THREE.Mesh(collarGeo, this.goldMat);
    collar.position.y = 0.88;
    group.add(collar);

    // Crescent Scythe Blade
    const bladeGeo = new THREE.TorusGeometry(0.38, 0.038, 8, 24, Math.PI * 0.7);
    const scytheMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      emissive: 0xa855f7,
      emissiveIntensity: 0.7,
      metalness: 0.8,
      roughness: 0.25,
    });
    const blade = new THREE.Mesh(bladeGeo, scytheMat);
    blade.position.set(0.24, 0.85, 0);
    blade.rotation.z = Math.PI * 0.45;
    group.add(blade);

    // Blade Tip
    const tipGeo = new THREE.ConeGeometry(0.04, 0.18, 4);
    const tip = new THREE.Mesh(tipGeo, scytheMat);
    tip.position.set(0.48, 0.65, 0);
    tip.rotation.z = Math.PI * 0.85;
    group.add(tip);

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  }

  /**
   * Celestial Archmage Staff: Astrolabe brass rings with glowing starlight core
   */
  private static createCelestialStaff(): THREE.Group {
    const group = new THREE.Group();

    // Wood & Gold Staff Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.026, 0.03, 1.35, 8);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0x3d2010, roughness: 0.8 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 0.2;
    group.add(shaft);

    // Brass Mount
    const mountGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.1, 8);
    const mount = new THREE.Mesh(mountGeo, this.goldMat);
    mount.position.y = 0.88;
    group.add(mount);

    // Armillary Outer Ring
    const outerRingGeo = new THREE.TorusGeometry(0.18, 0.016, 8, 24);
    const outerRing = new THREE.Mesh(outerRingGeo, this.goldMat);
    outerRing.position.y = 1.05;
    group.add(outerRing);

    // Armillary Inner Ring (tilted)
    const innerRingGeo = new THREE.TorusGeometry(0.13, 0.014, 8, 24);
    const innerRing = new THREE.Mesh(innerRingGeo, this.goldMat);
    innerRing.position.y = 1.05;
    innerRing.rotation.x = Math.PI / 3;
    group.add(innerRing);

    // Central Starlight Crystal Core
    const crystalGeo = new THREE.OctahedronGeometry(0.075);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.y = 1.05;
    group.add(crystal);

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  }

  /**
   * Dawn Scepter: Sacred golden sunburst scepter
   */
  private static createDawnScepter(): THREE.Group {
    const group = new THREE.Group();

    // Scepter Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.028, 0.03, 0.95, 8);
    const shaft = new THREE.Mesh(shaftGeo, this.goldMat);
    shaft.position.y = 0.1;
    group.add(shaft);

    // Sunburst Head
    const sunGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16);
    const sun = new THREE.Mesh(sunGeo, this.goldMat);
    sun.position.y = 0.62;
    group.add(sun);

    // 8 Sun Rays
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const rayGeo = new THREE.ConeGeometry(0.025, 0.14, 4);
      const ray = new THREE.Mesh(rayGeo, this.goldMat);
      ray.position.set(Math.cos(angle) * 0.18, 0.62 + Math.sin(angle) * 0.18, 0);
      ray.rotation.z = angle - Math.PI / 2;
      group.add(ray);
    }

    // Central Pearl
    const pearlGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const pearlMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const pearl = new THREE.Mesh(pearlGeo, pearlMat);
    pearl.position.y = 0.62;
    group.add(pearl);

    group.scale.set(0.9, 0.9, 0.9);
    return group;
  }
}

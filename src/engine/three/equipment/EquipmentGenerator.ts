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

  private static crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.88,
    roughness: 0.08,
    metalness: 0.1,
    ior: 2.1,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.95,
  });

  private static obsidianMat = new THREE.MeshStandardMaterial({
    color: 0x111318,
    metalness: 0.85,
    roughness: 0.2,
  });

  private static ebonyMat = new THREE.MeshStandardMaterial({
    color: 0x1a1512,
    roughness: 0.35,
    metalness: 0.15,
  });
  private static rustedIronMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.75,
    metalness: 0.5,
  });

  private static silverMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.15,
  });

  private static jadeMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.4,
    roughness: 0.25,
    metalness: 0.2,
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
      // --- Mythic Weapons & Armors (Items 10-18) ---
      case 'proc:chronicles_sunspire':
        return this.createChroniclesOfSunspire();
      case 'proc:abyssal_anchor':
        return this.createAbyssalAnchor();
      case 'proc:highland_chakrams':
        return this.createHighlandChakrams();
      case 'proc:moonlit_lute':
        return this.createMoonlitLute();
      case 'proc:nine_destinies_prism':
        return this.createNineDestiniesPrism();
      case 'proc:horizon_plate':
        return this.createHorizonPlate();
      case 'proc:sunspire_halo':
        return this.createSunspireHalo();
      case 'proc:exhibition_cloak':
        return this.createExhibitionCloak();
      case 'proc:shared_hearth_aegis':
        return this.createSharedHearthAegis();
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

  // =========================================================================
  // MYTHIC & SPECIAL ARSENAL GENERATORS (Items 10 - 18)
  // =========================================================================

  /**
   * 10. Thiên Thư Giao Thừa (Chronicles of the Sunspire)
   * Floating grimoire with velvet obsidian covers, golden glyphs, and orbiting pages.
   */
  private static createChroniclesOfSunspire(): THREE.Group {
    const group = new THREE.Group();

    // Spine
    const spineGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.38, 16, 1, false, -Math.PI / 2, Math.PI);
    const spine = new THREE.Mesh(spineGeo, this.goldMat);
    spine.rotation.x = Math.PI / 2;
    group.add(spine);

    // Front & Back Covers (Obsidian velvet)
    const coverGeo = new THREE.BoxGeometry(0.26, 0.38, 0.018);
    const frontCover = new THREE.Mesh(coverGeo, this.obsidianMat);
    frontCover.position.set(0.12, 0, 0.035);
    group.add(frontCover);

    const backCover = new THREE.Mesh(coverGeo, this.obsidianMat);
    backCover.position.set(0.12, 0, -0.035);
    group.add(backCover);

    // Book Pages Block (Gold Gilded edges)
    const pagesGeo = new THREE.BoxGeometry(0.24, 0.36, 0.055);
    const pagesMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      roughness: 0.6,
      metalness: 0.3,
    });
    const pages = new THREE.Mesh(pagesGeo, pagesMat);
    pages.position.set(0.11, 0, 0);
    group.add(pages);

    // Glowing Central Sunspire Sigil
    const glyphGeo = new THREE.IcosahedronGeometry(0.045, 0);
    const glyphMat = new THREE.MeshStandardMaterial({
      color: 0xd946ef,
      emissive: 0xd946ef,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });
    const glyph = new THREE.Mesh(glyphGeo, glyphMat);
    glyph.position.set(0.12, 0, 0.05);
    group.add(glyph);

    // 4 Orbiting Floating Pages
    const orbitMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const orbitPageGeo = new THREE.PlaneGeometry(0.12, 0.16);

    const offsets: [number, number, number, number][] = [
      [0.24, 0.14, 0.16, 0.4],
      [-0.14, -0.12, 0.18, -0.3],
      [0.22, -0.16, -0.14, 0.6],
      [-0.16, 0.15, -0.16, -0.5],
    ];

    offsets.forEach(([x, y, z, rot]) => {
      const p = new THREE.Mesh(orbitPageGeo, orbitMat);
      p.position.set(x, y, z);
      p.rotation.y = rot;
      p.rotation.z = rot * 0.5;
      group.add(p);
    });

    // Dynamic Radial PointLight
    const light = new THREE.PointLight(0xf59e0b, 1.8, 3.2);
    light.position.set(0.12, 0, 0.06);
    group.add(light);

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  }

  /**
   * 11. Mỏ Neo Vực Sâu (Abyssal Reef Anchor)
   * Colossal rusted iron anchor with bioluminescent coral and cyan water glows.
   */
  private static createAbyssalAnchor(): THREE.Group {
    const group = new THREE.Group();

    // Central Heavy Shank
    const shankGeo = new THREE.CylinderGeometry(0.055, 0.075, 1.35, 12);
    const shank = new THREE.Mesh(shankGeo, this.rustedIronMat);
    shank.position.y = 0.2;
    group.add(shank);

    // Top Shackle Ring
    const ringGeo = new THREE.TorusGeometry(0.12, 0.032, 12, 28);
    const ring = new THREE.Mesh(ringGeo, this.rustedIronMat);
    ring.position.y = 0.95;
    group.add(ring);

    // Horizontal Stock (Crossbar)
    const stockGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.72, 8);
    const stock = new THREE.Mesh(stockGeo, this.rustedIronMat);
    stock.position.y = 0.75;
    stock.rotation.z = Math.PI / 2;
    group.add(stock);

    // Stock End Weighted Spheres
    const ballGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const leftBall = new THREE.Mesh(ballGeo, this.rustedIronMat);
    leftBall.position.set(-0.38, 0.75, 0);
    group.add(leftBall);

    const rightBall = new THREE.Mesh(ballGeo, this.rustedIronMat);
    rightBall.position.set(0.38, 0.75, 0);
    group.add(rightBall);

    // Crown & Curved Anchor Arms (Flukes)
    const armGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.48, 8);
    const leftArm = new THREE.Mesh(armGeo, this.rustedIronMat);
    leftArm.position.set(-0.24, -0.32, 0);
    leftArm.rotation.z = -0.65;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, this.rustedIronMat);
    rightArm.position.set(0.24, -0.32, 0);
    rightArm.rotation.z = 0.65;
    group.add(rightArm);

    // Triangular Fluke Palms
    const flukeGeo = new THREE.ConeGeometry(0.11, 0.28, 4);
    const leftFluke = new THREE.Mesh(flukeGeo, this.rustedIronMat);
    leftFluke.position.set(-0.38, -0.15, 0);
    leftFluke.rotation.z = -0.2;
    group.add(leftFluke);

    const rightFluke = new THREE.Mesh(flukeGeo, this.rustedIronMat);
    rightFluke.position.set(0.38, -0.15, 0);
    rightFluke.rotation.z = 0.2;
    group.add(rightFluke);

    // Bioluminescent Coral Clusters & Spikes
    const coralMat = new THREE.MeshPhysicalMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.95,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.65,
    });
    const spikeGeo = new THREE.ConeGeometry(0.038, 0.16, 5);

    [-0.15, 0.15, 0].forEach((xOff, idx) => {
      const spike = new THREE.Mesh(spikeGeo, coralMat);
      spike.position.set(xOff, -0.42 + idx * 0.08, 0.05);
      spike.rotation.x = 0.3;
      spike.rotation.z = xOff * 1.5;
      group.add(spike);
    });

    // Subsea Azure PointLight
    const light = new THREE.PointLight(0x22d3ee, 2.2, 4.0);
    light.position.set(0, -0.3, 0.1);
    group.add(light);

    group.scale.set(0.75, 0.75, 0.75);
    return group;
  }

  /**
   * 12. Song Nhẫn Sơn Thần (Twin Chakrams of the Highland Mist)
   * Thrown twin circular blades with polished silver edge and glowing jade core.
   */
  private static createHighlandChakrams(): THREE.Group {
    const group = new THREE.Group();

    // Outer Silver Blade Ring
    const ringGeo = new THREE.TorusGeometry(0.28, 0.032, 16, 48);
    const outerRing = new THREE.Mesh(ringGeo, this.silverMat);
    group.add(outerRing);

    // 4 Symmetrical Crescent Outward Spikes
    const spikeGeo = new THREE.ConeGeometry(0.035, 0.15, 4);
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const spike = new THREE.Mesh(spikeGeo, this.silverMat);
      spike.position.set(Math.cos(angle) * 0.35, Math.sin(angle) * 0.35, 0);
      spike.rotation.z = angle - Math.PI / 2;
      group.add(spike);
    }

    // Inner Leather-Wrapped Grip Bar
    const gripGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.44, 8);
    const grip = new THREE.Mesh(gripGeo, this.darkLeatherMat);
    group.add(grip);

    // Central Faceted Jade Gemstone
    const gemGeo = new THREE.IcosahedronGeometry(0.06, 0);
    const gem = new THREE.Mesh(gemGeo, this.jadeMat);
    group.add(gem);

    // Verdant Mist PointLight
    const light = new THREE.PointLight(0x10b981, 1.8, 3.2);
    group.add(light);

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  }

  /**
   * 13. Tỳ Bà Phản Nguyệt (Moonlit Lute of Echoes)
   * Polished ebony lute with mother-of-pearl soundboard and ethereal sonic ripple rings.
   */
  private static createMoonlitLute(): THREE.Group {
    const group = new THREE.Group();

    // Pear-Shaped Resonating Soundbox
    const bodyGeo = new THREE.SphereGeometry(0.24, 24, 16);
    const body = new THREE.Mesh(bodyGeo, this.ebonyMat);
    body.scale.set(0.85, 1.25, 0.45);
    body.position.y = -0.15;
    group.add(body);

    // Ivory Soundboard Face
    const soundboardGeo = new THREE.CircleGeometry(0.22, 24);
    const soundboard = new THREE.Mesh(soundboardGeo, this.silverMat);
    soundboard.scale.set(0.82, 1.22, 1);
    soundboard.position.set(0, -0.15, 0.11);
    group.add(soundboard);

    // Rosette Soundhole
    const soundholeGeo = new THREE.TorusGeometry(0.045, 0.01, 8, 24);
    const soundhole = new THREE.Mesh(soundholeGeo, this.goldMat);
    soundhole.position.set(0, -0.15, 0.12);
    group.add(soundhole);

    // Ebony Neck
    const neckGeo = new THREE.CylinderGeometry(0.028, 0.034, 0.65, 8);
    const neck = new THREE.Mesh(neckGeo, this.ebonyMat);
    neck.position.y = 0.42;
    group.add(neck);

    // Swept-Back Pegbox Headstock
    const headGeo = new THREE.BoxGeometry(0.06, 0.18, 0.05);
    const head = new THREE.Mesh(headGeo, this.ebonyMat);
    head.position.set(0, 0.78, -0.04);
    head.rotation.x = -0.35;
    group.add(head);

    // Sonic Ripple Rings (Ethereal Moonlight Waves)
    const sonicMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.008, 8, 36), sonicMat);
    ring1.position.set(0, -0.15, 0.14);
    group.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.006, 8, 36), sonicMat);
    ring2.position.set(0, -0.15, 0.18);
    group.add(ring2);

    // Moonlight Blue PointLight
    const light = new THREE.PointLight(0x93c5fd, 1.8, 3.5);
    light.position.set(0, -0.1, 0.2);
    group.add(light);

    group.scale.set(0.82, 0.82, 0.82);
    return group;
  }

  /**
   * 14. Lăng Kính Cửu Đỉnh (Prism of the Nine Destinies)
   * Floating prismatic omni-catalyst with 3 armillary rings and 9 orbiting elemental gems.
   */
  private static createNineDestiniesPrism(): THREE.Group {
    const group = new THREE.Group();

    // Central Prismatic Crystal Core
    const coreGeo = new THREE.IcosahedronGeometry(0.16, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0xa855f7,
      emissiveIntensity: 0.75,
      transmission: 0.92,
      roughness: 0.05,
      ior: 2.4,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.92,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // 3 Concentric Golden Armillary Rings
    const ringGeo = new THREE.TorusGeometry(0.28, 0.012, 12, 48);
    const ring1 = new THREE.Mesh(ringGeo, this.goldMat);
    group.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, this.goldMat);
    ring2.rotation.x = Math.PI / 3;
    group.add(ring2);

    const ring3 = new THREE.Mesh(ringGeo, this.goldMat);
    ring3.rotation.y = Math.PI / 3;
    group.add(ring3);

    // 9 Orbiting Elemental Gemstones (Representing 9 companions)
    const companionColors = [
      0xef4444, // Dragonfire (Red)
      0xf59e0b, // Amber Gold
      0x10b981, // Emerald Green
      0x06b6d4, // Cyan Torrent
      0x3b82f6, // Royal Blue
      0x8b5cf6, // Violet Void
      0xd946ef, // Starfire Magenta
      0xfacc15, // Dawn Radiance
      0xf8fafc, // Pure Starlight
    ];

    const gemGeo = new THREE.DodecahedronGeometry(0.026);
    companionColors.forEach((hex, i) => {
      const angle = (i * Math.PI * 2) / 9;
      const mat = new THREE.MeshStandardMaterial({
        color: hex,
        emissive: hex,
        emissiveIntensity: 0.9,
        roughness: 0.1,
      });
      const gem = new THREE.Mesh(gemGeo, mat);
      gem.position.set(Math.cos(angle) * 0.38, Math.sin(angle) * 0.38, (i % 2 === 0 ? 0.06 : -0.06));
      group.add(gem);
    });

    // Rainbow Radial PointLight
    const light = new THREE.PointLight(0xffffff, 2.5, 4.5);
    group.add(light);

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  }

  /**
   * 15. Chiến Giáp Hợp Bích (Carapace of the Twin Horizons)
   * Interlocking Da Lat ironwood cuirass and Nha Trang abalone plates with wave motifs.
   */
  private static createHorizonPlate(): THREE.Group {
    const group = new THREE.Group();

    // Curved Front Breastplate
    const plateGeo = new THREE.CylinderGeometry(0.25, 0.22, 0.34, 16, 1, false, 0, Math.PI);
    const abaloneMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.35,
      metalness: 0.7,
      roughness: 0.25,
    });
    const plate = new THREE.Mesh(plateGeo, abaloneMat);
    plate.rotation.y = -Math.PI / 2;
    group.add(plate);

    // Ironwood Collar & Trim
    const trimGeo = new THREE.TorusGeometry(0.24, 0.02, 8, 24, Math.PI);
    const trim = new THREE.Mesh(trimGeo, this.goldMat);
    trim.position.y = 0.16;
    trim.rotation.x = Math.PI / 2;
    group.add(trim);

    // Ocean Wave Center Emblem
    const crestGeo = new THREE.IcosahedronGeometry(0.065, 0);
    const crest = new THREE.Mesh(crestGeo, this.goldMat);
    crest.position.set(0, 0.04, 0.24);
    group.add(crest);

    // Bioluminescent Accent PointLight
    const light = new THREE.PointLight(0x38bdf8, 1.2, 2.5);
    light.position.set(0, 0.05, 0.25);
    group.add(light);

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  }

  /**
   * 16. Hào Quang Tân Niên (Halo of the Sunspire New Year)
   * Double floating crystalline halo with 8 sunburst rays and orbiting firework motes.
   */
  private static createSunspireHalo(): THREE.Group {
    const group = new THREE.Group();

    // Inner Radiant Ring
    const innerRingGeo = new THREE.TorusGeometry(0.26, 0.016, 16, 48);
    const innerRing = new THREE.Mesh(innerRingGeo, this.goldMat);
    innerRing.rotation.x = Math.PI / 2;
    group.add(innerRing);

    // Outer Floating Starlight Halo
    const outerRingGeo = new THREE.TorusGeometry(0.34, 0.012, 16, 48);
    const outerRing = new THREE.Mesh(outerRingGeo, this.goldMat);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = 0.04;
    group.add(outerRing);

    // 8 Crown Sunburst Ray Spikes
    const rayGeo = new THREE.ConeGeometry(0.024, 0.16, 4);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const ray = new THREE.Mesh(rayGeo, this.goldMat);
      ray.position.set(Math.cos(angle) * 0.34, 0.08, Math.sin(angle) * 0.34);
      ray.rotation.x = Math.sin(angle) * 0.4;
      ray.rotation.z = -Math.cos(angle) * 0.4;
      group.add(ray);
    }

    // 6 Hovering Firework Embers
    const emberGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const emberMat = new THREE.MeshStandardMaterial({
      color: 0xd946ef,
      emissive: 0xd946ef,
      emissiveIntensity: 1.4,
      roughness: 0.1,
    });
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const ember = new THREE.Mesh(emberGeo, emberMat);
      ember.position.set(Math.cos(angle) * 0.42, 0.06 + (i % 2 === 0 ? 0.04 : -0.04), Math.sin(angle) * 0.42);
      group.add(ember);
    }

    // Golden Dawn PointLight
    const light = new THREE.PointLight(0xfbbf24, 2.2, 3.2);
    light.position.y = 0.08;
    group.add(light);

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  }

  /**
   * 17. Phi Họa Tiên Y (Mantle of the Painted Eras)
   * Flowing ink-black silk cloak with glowing silver calligraphy trims and dual shoulder clasps.
   */
  private static createExhibitionCloak(): THREE.Group {
    const group = new THREE.Group();

    // Flowing Cape Body
    const capeGeo = new THREE.BoxGeometry(0.52, 0.92, 0.04);
    const mantleMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.85,
      metalness: 0.1,
    });
    const cape = new THREE.Mesh(capeGeo, mantleMat);
    cape.position.set(0, -0.42, 0.02);
    cape.rotation.x = 0.12;
    group.add(cape);

    // Silver Embroidered Hem
    const hemGeo = new THREE.BoxGeometry(0.54, 0.04, 0.05);
    const hem = new THREE.Mesh(hemGeo, this.silverMat);
    hem.position.set(0, -0.88, 0.08);
    group.add(hem);

    // Shoulder Brooch Clasps
    const broochGeo = new THREE.SphereGeometry(0.038, 12, 12);
    const broochMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x9333ea,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
    });
    const leftBrooch = new THREE.Mesh(broochGeo, broochMat);
    leftBrooch.position.set(-0.2, 0.02, 0.02);
    group.add(leftBrooch);

    const rightBrooch = new THREE.Mesh(broochGeo, broochMat);
    rightBrooch.position.set(0.2, 0.02, 0.02);
    group.add(rightBrooch);

    // Void Mist PointLight
    const light = new THREE.PointLight(0xa855f7, 1.4, 2.5);
    light.position.set(0, -0.2, 0.1);
    group.add(light);

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  }

  /**
   * 18. Bức Tường Kỷ Niệm (Aegis of the Shared Hearth)
   * Colossal kite shield split into molten crimson and glacial azure with hearth crest.
   */
  private static createSharedHearthAegis(): THREE.Group {
    const group = new THREE.Group();

    // Left Half: Molten Volcanic Crimson
    const leftGeo = new THREE.BoxGeometry(0.24, 0.96, 0.04);
    const fireMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      emissive: 0xef4444,
      emissiveIntensity: 0.75,
      metalness: 0.7,
      roughness: 0.3,
    });
    const leftShield = new THREE.Mesh(leftGeo, fireMat);
    leftShield.position.set(-0.12, 0, 0);
    group.add(leftShield);

    // Right Half: Glacial Frosted Azure
    const rightGeo = new THREE.BoxGeometry(0.24, 0.96, 0.04);
    const iceMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.7,
      metalness: 0.5,
      roughness: 0.2,
    });
    const rightShield = new THREE.Mesh(rightGeo, iceMat);
    rightShield.position.set(0.12, 0, 0);
    group.add(rightShield);

    // 3 Frosted Ice Spikes on Right Rim
    const spikeGeo = new THREE.ConeGeometry(0.045, 0.24, 5);
    [-0.25, 0, 0.25].forEach((yOff) => {
      const spike = new THREE.Mesh(spikeGeo, this.crystalMat);
      spike.position.set(0.28, yOff, 0);
      spike.rotation.z = -Math.PI / 2;
      group.add(spike);
    });

    // Central Hearth Cauldron Emblem (Gold)
    const crestGeo = new THREE.IcosahedronGeometry(0.09, 0);
    const crest = new THREE.Mesh(crestGeo, this.goldMat);
    crest.position.set(0, 0.05, 0.04);
    group.add(crest);

    // Back Arm Grip Handle
    const gripGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
    const grip = new THREE.Mesh(gripGeo, this.darkLeatherMat);
    grip.position.set(0, 0, -0.06);
    group.add(grip);

    // Clashing Thermal Shock PointLight
    const light = new THREE.PointLight(0xf97316, 2.2, 3.8);
    light.position.set(0, 0.05, 0.08);
    group.add(light);

    group.scale.set(0.85, 0.85, 0.85);
    return group;
  }
}

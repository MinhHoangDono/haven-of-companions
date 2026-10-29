import * as THREE from 'three';
import { PropPlacementManager } from './PropPlacementManager';

export interface InteractivePropRef {
  id: string;
  type: 'stew_pot' | 'sea_bell' | 'fireworks_mortar' | 'tea_pavilion';
  mesh: THREE.Object3D;
  position: THREE.Vector3;
}

export interface DioramaElements {
  interactiveProps: InteractivePropRef[];
  waterMesh: THREE.Mesh;
  boatGroup: THREE.Group;
  largeShipGroup: THREE.Group;
  lighthouseGroup: THREE.Group;
  lighthouseBeaconLight: THREE.PointLight;
}

export class DioramaBuilder {
  public static buildDiorama(scene: THREE.Scene): DioramaElements {
    const dioramaGroup = new THREE.Group();
    scene.add(dioramaGroup);

    const interactiveProps: InteractivePropRef[] = [];

    // --- PBR Materials Palette (DOS2 Tactical Fantasy) ---
    const matHighlandGrass = new THREE.MeshStandardMaterial({
      color: 0x3d6b38,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });

    const matHighlandTerrace = new THREE.MeshStandardMaterial({
      color: 0x4a7c42,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });

    const matRockCliff = new THREE.MeshStandardMaterial({
      color: 0x484643,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });

    const matPlazaCobble = new THREE.MeshStandardMaterial({
      color: 0x827d75,
      roughness: 0.75,
      metalness: 0.1,
      flatShading: true,
    });

    const matPlazaStone = new THREE.MeshStandardMaterial({
      color: 0x9e978c,
      roughness: 0.7,
      metalness: 0.1,
    });

    const matSand = new THREE.MeshStandardMaterial({
      color: 0xd2b57b,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true,
    });

    const matWoodTimber = new THREE.MeshStandardMaterial({
      color: 0x54361e,
      roughness: 0.7,
      metalness: 0.1,
    });

    const matDarkWood = new THREE.MeshStandardMaterial({
      color: 0x331f10,
      roughness: 0.75,
    });

    const matRoofSlate = new THREE.MeshStandardMaterial({
      color: 0x853636,
      roughness: 0.6,
      metalness: 0.1,
    });

    const matGoldMetal = new THREE.MeshStandardMaterial({
      color: 0xdfa642,
      roughness: 0.35,
      metalness: 0.8,
    });

    const matWater = new THREE.MeshStandardMaterial({
      color: 0x187399,
      roughness: 0.18,
      metalness: 0.15,
      transparent: true,
      opacity: 0.84,
      flatShading: true,
    });

    // ==========================================
    // 1. Base 50x50 Diorama Foundation Pedestal
    // ==========================================
    const baseGeo = new THREE.BoxGeometry(52, 4.5, 52);
    const baseMesh = new THREE.Mesh(baseGeo, matRockCliff);
    baseMesh.position.set(0, -2.4, 0);
    baseMesh.receiveShadow = true;
    dioramaGroup.add(baseMesh);

    // ==========================================
    // 2. Zone 1: Highland Mountain Range (Y = 2.4 to 3.8)
    // ==========================================
    // High Alpine Peak Escarpment (NW: X: -25 to -10, Z: -25 to -10)
    const highPeakGeo = new THREE.BoxGeometry(16.0, 3.6, 16.0);
    const highPeakMesh = new THREE.Mesh(highPeakGeo, matHighlandGrass);
    highPeakMesh.position.set(-16.5, 1.8, -16.5);
    highPeakMesh.castShadow = true;
    highPeakMesh.receiveShadow = true;
    dioramaGroup.add(highPeakMesh);

    // Campsite Plateau Step (Y = 2.8)
    const campsiteGeo = new THREE.BoxGeometry(14.0, 2.8, 14.0);
    const campsiteMesh = new THREE.Mesh(campsiteGeo, matHighlandGrass);
    campsiteMesh.position.set(-11.0, 1.4, -11.0);
    campsiteMesh.castShadow = true;
    campsiteMesh.receiveShadow = true;
    dioramaGroup.add(campsiteMesh);

    // Mid-tier Hillside Terrace Step (Y = 1.8) for gradual topographic shift
    const hillsideGeo = new THREE.BoxGeometry(10.0, 1.8, 10.0);
    const hillsideMesh = new THREE.Mesh(hillsideGeo, matHighlandTerrace);
    hillsideMesh.position.set(-5.5, 0.9, -5.5);
    hillsideMesh.castShadow = true;
    hillsideMesh.receiveShadow = true;
    dioramaGroup.add(hillsideMesh);

    // Stepped stone staircases connecting Highlands (Y=2.8) down to Hillside (Y=1.8) and Plaza (Y=1.0)
    for (let s = 0; s < 6; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 0.8), matPlazaStone);
      step.position.set(-1.0 + s * 0.5, 1.7 - s * 0.15, -3.5);
      step.castShadow = true;
      step.receiveShadow = true;
      dioramaGroup.add(step);
    }

    // Rocky cliff trims along the mountain ridges
    [-23, -19, -15, -11, -7, -3].forEach((x, i) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2 + (i % 2) * 0.4), matRockCliff);
      rock.position.set(x + 0.5, 2.8, -3.5);
      rock.castShadow = true;
      rock.receiveShadow = true;
      dioramaGroup.add(rock);
    });

    // ==========================================
    // 3. Zone 2: Sunspire Plaza & Town Districts (Y = 1.0)
    // ==========================================
    const plazaGeo = new THREE.BoxGeometry(28.0, 1.0, 28.0);
    const plazaMesh = new THREE.Mesh(plazaGeo, matPlazaCobble);
    plazaMesh.position.set(10.5, 0.5, -11.0);
    plazaMesh.castShadow = true;
    plazaMesh.receiveShadow = true;
    dioramaGroup.add(plazaMesh);

    // Grand Central Town Square Fountain (Rescaled to impressive 3.2m radius)
    const fountainGeo = new THREE.CylinderGeometry(3.2, 3.6, 0.6, 24);
    const fountainMesh = new THREE.Mesh(fountainGeo, matPlazaStone);
    fountainMesh.position.set(5.5, 1.2, -3.5);
    fountainMesh.castShadow = true;
    fountainMesh.receiveShadow = true;
    dioramaGroup.add(fountainMesh);

    const fountainCenterPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 1.2, 16), matPlazaStone);
    fountainCenterPillar.position.set(5.5, 1.7, -3.5);
    fountainCenterPillar.castShadow = true;
    dioramaGroup.add(fountainCenterPillar);

    const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.55, 24), matWater);
    fountainWater.position.set(5.5, 1.25, -3.5);
    dioramaGroup.add(fountainWater);

    // ==========================================
    // 4. Zone 3: Vast Ocean Bay & Sandy Shoreline (Y = 0.2 to -0.35)
    // ==========================================
    // Sandy Beach shoreline
    const sandGeo = new THREE.BoxGeometry(32.0, 0.45, 10.0);
    const sandMesh = new THREE.Mesh(sandGeo, matSand);
    sandMesh.position.set(-7.0, 0.2, 4.5);
    sandMesh.receiveShadow = true;
    dioramaGroup.add(sandMesh);

    // Gradual beach slope into the ocean shallows
    const slopeGeo = new THREE.BoxGeometry(32.0, 0.3, 5.0);
    const slopeMesh = new THREE.Mesh(slopeGeo, matSand);
    slopeMesh.position.set(-7.0, 0.05, 9.5);
    slopeMesh.rotation.x = 0.07;
    slopeMesh.receiveShadow = true;
    dioramaGroup.add(slopeMesh);

    // Boardwalk Pier Walkway extending far into deep water
    const pierGeo = new THREE.BoxGeometry(3.2, 0.25, 14.0);
    const pierMesh = new THREE.Mesh(pierGeo, matWoodTimber);
    pierMesh.position.set(-2.0, 0.25, 11.0);
    pierMesh.castShadow = true;
    pierMesh.receiveShadow = true;
    dioramaGroup.add(pierMesh);

    // Heavy Dock Pilings along the pier
    [-3.8, -0.2].forEach((px) => {
      [5.0, 7.5, 10.0, 12.5, 15.0, 17.5].forEach((pz) => {
        const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.5, 8), matDarkWood);
        pile.position.set(px, -0.3, pz);
        pile.castShadow = true;
        dioramaGroup.add(pile);
      });
    });

    // ==========================================
    // 5. Zone 4: Outer Lighthouse Promontory (Y = 1.25)
    // ==========================================
    const promontoryGeo = new THREE.BoxGeometry(18.0, 1.25, 18.0);
    const promontoryMesh = new THREE.Mesh(promontoryGeo, matRockCliff);
    promontoryMesh.position.set(16.0, 0.62, 14.0);
    promontoryMesh.castShadow = true;
    promontoryMesh.receiveShadow = true;
    dioramaGroup.add(promontoryMesh);

    // Stone Steps connecting Plaza to Lighthouse Promontory
    for (let s = 0; s < 4; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.18, 0.8), matPlazaStone);
      step.position.set(14.0, 1.05 + s * 0.05, 3.5 + s * 0.5);
      step.castShadow = true;
      dioramaGroup.add(step);
    }

    // ==========================================
    // 6. Interactive Village Props
    // ==========================================

    // 1. Campfire Hearth & Stew Cauldron (Interactive Stew Pot!)
    const campfire = this.buildCampfire(matRockCliff, matDarkWood, matGoldMetal);
    campfire.position.set(-13.5, 2.8, -15.5);
    campfire.userData = { interactiveId: 'stew_pot', interactiveType: 'stew_pot' };
    dioramaGroup.add(campfire);
    interactiveProps.push({
      id: 'stew_pot',
      type: 'stew_pot',
      mesh: campfire,
      position: campfire.position.clone(),
    });

    // Druid Standing Stone Altar
    const druidAltar = this.buildDruidAltar(matRockCliff, matGoldMetal);
    druidAltar.position.set(-11.5, 2.8, -13.0);
    dioramaGroup.add(druidAltar);

    // 2. Fireworks Mortar Battery (Interactive Launcher!)
    const mortar = this.buildFireworksMortar(matDarkWood, matGoldMetal);
    mortar.position.set(14.0, 1.0, -4.5);
    mortar.userData = { interactiveId: 'fireworks_mortar', interactiveType: 'fireworks_mortar' };
    dioramaGroup.add(mortar);
    interactiveProps.push({
      id: 'fireworks_mortar',
      type: 'fireworks_mortar',
      mesh: mortar,
      position: mortar.position.clone(),
    });

    // 3. Coastal Tatami Tea Pavilion (Interactive Tea House!)
    const pavilion = this.buildTatamiPavilion(matWoodTimber, matDarkWood, matHighlandGrass);
    pavilion.position.set(4.5, 0.25, 6.0);
    pavilion.userData = { interactiveId: 'tea_pavilion', interactiveType: 'tea_pavilion' };
    dioramaGroup.add(pavilion);
    interactiveProps.push({
      id: 'tea_pavilion',
      type: 'tea_pavilion',
      mesh: pavilion,
      position: pavilion.position.clone(),
    });

    // 4. Tide Shrine & Sea Bell (Interactive Bell!)
    const seaBell = this.buildTideShrine(matRoofSlate, matGoldMetal);
    seaBell.position.set(14.5, 1.25, 8.5);
    seaBell.userData = { interactiveId: 'sea_bell', interactiveType: 'sea_bell' };
    dioramaGroup.add(seaBell);
    interactiveProps.push({
      id: 'sea_bell',
      type: 'sea_bell',
      mesh: seaBell,
      position: seaBell.position.clone(),
    });

    // ==========================================
    // 7. Dynamic Vessels & Lighthouse Beacon
    // ==========================================
    const boatGroup = new THREE.Group();
    dioramaGroup.add(boatGroup);

    const largeShipGroup = new THREE.Group();
    dioramaGroup.add(largeShipGroup);

    const lighthouseGroup = new THREE.Group();
    dioramaGroup.add(lighthouseGroup);

    // High intensity rotating golden beacon light for the lighthouse
    const lighthouseBeaconLight = new THREE.PointLight(0xffd56b, 4.5, 35);
    lighthouseBeaconLight.position.set(16.5, 8.5, 14.5);
    lighthouseBeaconLight.castShadow = true;
    dioramaGroup.add(lighthouseBeaconLight);

    // Vast 50x28 3D Ocean Water Plane
    const waterGeo = new THREE.PlaneGeometry(50.0, 28.0, 64, 36);
    const waterMesh = new THREE.Mesh(waterGeo, matWater);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(0, -0.06, 11.0);
    waterMesh.receiveShadow = true;
    dioramaGroup.add(waterMesh);

    // ==========================================
    // 8. Asynchronously Instantiate Declarative Props
    // ==========================================
    PropPlacementManager.instantiateProps(dioramaGroup).then((customInteractive) => {
      interactiveProps.push(...customInteractive);
    });

    return {
      interactiveProps,
      waterMesh,
      boatGroup,
      largeShipGroup,
      lighthouseGroup,
      lighthouseBeaconLight,
    };
  }

  // --- Sub-Builders ---

  private static buildCampfire(
    rockMat: THREE.Material,
    woodMat: THREE.Material,
    goldMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();

    // Stone ring
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24), rockMat);
      rock.position.set(Math.cos(angle) * 0.7, 0.12, Math.sin(angle) * 0.7);
      group.add(rock);
    }

    // Logs
    for (let j = 0; j < 4; j++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.1, 6), woodMat);
      log.rotation.z = Math.PI / 4;
      log.rotation.y = (j / 4) * Math.PI;
      log.position.y = 0.22;
      group.add(log);
    }

    // Cauldron Pot
    const pot = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), goldMat);
    pot.position.y = 0.42;
    pot.castShadow = true;
    group.add(pot);

    // Glowing Stew Surface
    const soupMat = new THREE.MeshBasicMaterial({ color: 0x44dd66 });
    const soup = new THREE.Mesh(new THREE.CircleGeometry(0.38, 12), soupMat);
    soup.rotation.x = -Math.PI / 2;
    soup.position.y = 0.43;
    group.add(soup);

    // Fire Light
    const fireLight = new THREE.PointLight(0xff6611, 2.5, 8.0);
    fireLight.position.set(0, 0.5, 0);
    group.add(fireLight);

    return group;
  }

  private static buildDruidAltar(rockMat: THREE.Material, glowMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 1.4), rockMat);
    table.position.y = 0.25;
    table.castShadow = true;
    table.receiveShadow = true;
    group.add(table);

    const runicOrb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), glowMat);
    runicOrb.position.y = 0.85;
    group.add(runicOrb);

    return group;
  }

  private static buildFireworksMortar(woodMat: THREE.Material, brassMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.3, 1.1), woodMat);
    base.position.y = 0.15;
    group.add(base);

    [-0.25, 0.25].forEach((tx) => {
      [-0.25, 0.25].forEach((tz) => {
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 8), brassMat);
        tube.position.set(tx, 0.6, tz);
        tube.castShadow = true;
        group.add(tube);
      });
    });

    return group;
  }

  private static buildTatamiPavilion(
    woodMat: THREE.Material,
    darkWoodMat: THREE.Material,
    roofMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();

    const floor = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.25, 2.6), woodMat);
    floor.position.y = 0.12;
    group.add(floor);

    [-1.4, 1.4].forEach((px) => {
      [-1.1, 1.1].forEach((pz) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 6), darkWoodMat);
        post.position.set(px, 1.2, pz);
        group.add(post);
      });
    });

    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.0, 4), roofMat);
    roof.position.y = 2.7;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    return group;
  }

  private static buildTideShrine(roofMat: THREE.Material, goldMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();

    const toriiBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 1.0), roofMat);
    toriiBase.position.y = 0.12;
    group.add(toriiBase);

    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.55, 12), goldMat);
    bell.position.y = 1.2;
    bell.castShadow = true;
    group.add(bell);

    const arch = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.15, 0.15), goldMat);
    arch.position.y = 1.6;
    group.add(arch);

    return group;
  }
}

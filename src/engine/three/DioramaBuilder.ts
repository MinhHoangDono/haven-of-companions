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
      color: 0x853636, // Crimson medieval tile
      roughness: 0.6,
      metalness: 0.1,
    });

    const matGoldMetal = new THREE.MeshStandardMaterial({
      color: 0xdfa642,
      roughness: 0.35,
      metalness: 0.8,
    });

    const matWater = new THREE.MeshStandardMaterial({
      color: 0x1d7596,
      roughness: 0.2,
      metalness: 0.15,
      transparent: true,
      opacity: 0.82,
      flatShading: true,
    });

    // ==========================================
    // 1. Base 24x24 Diorama Pedestal Foundation
    // ==========================================
    const baseGeo = new THREE.BoxGeometry(25, 3.5, 25);
    const baseMesh = new THREE.Mesh(baseGeo, matRockCliff);
    baseMesh.position.set(0, -1.9, 0);
    baseMesh.receiveShadow = true;
    dioramaGroup.add(baseMesh);

    // ==========================================
    // 2. Zone 1: Highland Mountain Plateau (Y = 2.4)
    // ==========================================
    // High Alpine Plateau (X: -12 to -3, Z: -12 to -3)
    const highlandGeo = new THREE.BoxGeometry(9.5, 2.4, 9.5);
    const highlandMesh = new THREE.Mesh(highlandGeo, matHighlandGrass);
    highlandMesh.position.set(-7.5, 1.2, -7.5);
    highlandMesh.castShadow = true;
    highlandMesh.receiveShadow = true;
    dioramaGroup.add(highlandMesh);

    // Mid-tier Hillside Terrace Step (Y = 1.7) for smooth topographical shift
    const terraceGeo = new THREE.BoxGeometry(5.0, 1.7, 5.0);
    const terraceMesh = new THREE.Mesh(terraceGeo, matHighlandTerrace);
    terraceMesh.position.set(-2.5, 0.85, -5.5);
    terraceMesh.castShadow = true;
    terraceMesh.receiveShadow = true;
    dioramaGroup.add(terraceMesh);

    // Connecting stone steps from Highlands (Y=2.4) down to Terrace (Y=1.7) and Plaza (Y=0.95)
    for (let s = 0; s < 5; s++) {
      const stepGeo = new THREE.BoxGeometry(1.8, 0.18, 0.7);
      const step = new THREE.Mesh(stepGeo, matPlazaStone);
      step.position.set(-0.2 + s * 0.45, 1.5 - s * 0.14, -2.5);
      step.castShadow = true;
      step.receiveShadow = true;
      dioramaGroup.add(step);
    }

    // Rocky cliff trims along the mountain ridge
    [-11, -8, -5, -2].forEach((x, i) => {
      const rockGeo = new THREE.DodecahedronGeometry(0.8 + (i % 2) * 0.3);
      const rock = new THREE.Mesh(rockGeo, matRockCliff);
      rock.position.set(x + 0.5, 2.4, -2.5);
      rock.castShadow = true;
      rock.receiveShadow = true;
      dioramaGroup.add(rock);
    });

    // ==========================================
    // 3. Zone 2: Sunspire Plaza & Town Square (Y = 0.95)
    // ==========================================
    const plazaGeo = new THREE.BoxGeometry(13.5, 1.0, 13.5);
    const plazaMesh = new THREE.Mesh(plazaGeo, matPlazaCobble);
    plazaMesh.position.set(5.2, 0.5, -4.8);
    plazaMesh.castShadow = true;
    plazaMesh.receiveShadow = true;
    dioramaGroup.add(plazaMesh);

    // Plaza decorative central fountain disc
    const fountainGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.35, 16);
    const fountainMesh = new THREE.Mesh(fountainGeo, matPlazaStone);
    fountainMesh.position.set(4.0, 1.05, -1.5);
    fountainMesh.castShadow = true;
    fountainMesh.receiveShadow = true;
    dioramaGroup.add(fountainMesh);

    const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.38, 16), matWater);
    fountainWater.position.set(4.0, 1.08, -1.5);
    dioramaGroup.add(fountainWater);

    // ==========================================
    // 4. Zone 3: Coastal Bay & Sandy Beach (Y = 0.15)
    // ==========================================
    const sandGeo = new THREE.BoxGeometry(16, 0.45, 5.5);
    const sandMesh = new THREE.Mesh(sandGeo, matSand);
    sandMesh.position.set(-3.5, 0.15, 2.5);
    sandMesh.receiveShadow = true;
    dioramaGroup.add(sandMesh);

    // Beach shoreline gradual slope ramp into shallow water
    const slopeGeo = new THREE.BoxGeometry(16, 0.25, 2.5);
    const slopeMesh = new THREE.Mesh(slopeGeo, matSand);
    slopeMesh.position.set(-3.5, 0.05, 5.0);
    slopeMesh.rotation.x = 0.08;
    slopeMesh.receiveShadow = true;
    dioramaGroup.add(slopeMesh);

    // Boardwalk Pier Walkway extending over water
    const pierGeo = new THREE.BoxGeometry(2.4, 0.22, 6.0);
    const pierMesh = new THREE.Mesh(pierGeo, matWoodTimber);
    pierMesh.position.set(-1.0, 0.25, 6.0);
    pierMesh.castShadow = true;
    pierMesh.receiveShadow = true;
    dioramaGroup.add(pierMesh);

    // Wooden Dock Pilings
    [-2.1, 0.1].forEach((px) => {
      [4.0, 5.8, 7.6, 9.0].forEach((pz) => {
        const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 6), matDarkWood);
        pile.position.set(px, -0.2, pz);
        pile.castShadow = true;
        dioramaGroup.add(pile);
      });
    });

    // ==========================================
    // 5. Zone 4: Outer Lighthouse Promontory (Y = 0.85)
    // ==========================================
    const promontoryGeo = new THREE.BoxGeometry(8.5, 0.9, 8.5);
    const promontoryMesh = new THREE.Mesh(promontoryGeo, matRockCliff);
    promontoryMesh.position.set(8.2, 0.45, 6.5);
    promontoryMesh.castShadow = true;
    promontoryMesh.receiveShadow = true;
    dioramaGroup.add(promontoryMesh);

    // Stone Steps from Plaza (Y=0.95) down to Promontory (Y=0.85)
    for (let s = 0; s < 3; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.18, 0.7), matPlazaStone);
      step.position.set(6.5, 0.9 - s * 0.05, 1.5 + s * 0.4);
      step.castShadow = true;
      dioramaGroup.add(step);
    }

    // ==========================================
    // 6. Interactive Village Props
    // ==========================================

    // 1. Campfire Hearth & Stew Cauldron (Interactive Stew Pot!)
    const campfire = this.buildCampfire(matRockCliff, matDarkWood, matGoldMetal);
    campfire.position.set(-5.5, 2.4, -6.5);
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
    druidAltar.position.set(-3.5, 2.4, -4.5);
    dioramaGroup.add(druidAltar);

    // 2. Fireworks Mortar Battery (Interactive Launcher!)
    const mortar = this.buildFireworksMortar(matDarkWood, matGoldMetal);
    mortar.position.set(7.5, 0.95, -1.8);
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
    pavilion.position.set(-4.5, 0.15, 2.0);
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
    seaBell.position.set(6.8, 0.85, 3.8);
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
    const lighthouseBeaconLight = new THREE.PointLight(0xffd56b, 3.5, 24);
    lighthouseBeaconLight.position.set(8.5, 4.5, 7.5);
    lighthouseBeaconLight.castShadow = true;
    dioramaGroup.add(lighthouseBeaconLight);

    // Expanded 3D Water Plane for dynamic ocean waves (X: -12 to 12, Z: 0 to 12)
    const waterGeo = new THREE.PlaneGeometry(25.0, 14.0, 48, 28);
    const waterMesh = new THREE.Mesh(waterGeo, matWater);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(0, -0.06, 6.0);
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

  // --- Interactive Prop Sub-Builders ---

  private static buildCampfire(
    rockMat: THREE.Material,
    woodMat: THREE.Material,
    goldMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();

    // Stone ring
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18), rockMat);
      rock.position.set(Math.cos(angle) * 0.55, 0.1, Math.sin(angle) * 0.55);
      group.add(rock);
    }

    // Logs
    for (let j = 0; j < 4; j++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.85, 6), woodMat);
      log.rotation.z = Math.PI / 4;
      log.rotation.y = (j / 4) * Math.PI;
      log.position.y = 0.18;
      group.add(log);
    }

    // Cauldron Pot
    const pot = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), goldMat);
    pot.position.y = 0.35;
    pot.castShadow = true;
    group.add(pot);

    // Glowing Stew Surface
    const soupMat = new THREE.MeshBasicMaterial({ color: 0x44dd66 });
    const soup = new THREE.Mesh(new THREE.CircleGeometry(0.3, 12), soupMat);
    soup.rotation.x = -Math.PI / 2;
    soup.position.y = 0.36;
    group.add(soup);

    // Campfire Fire Light
    const fireLight = new THREE.PointLight(0xff6611, 2.0, 6.0);
    fireLight.position.set(0, 0.45, 0);
    group.add(fireLight);

    return group;
  }

  private static buildDruidAltar(rockMat: THREE.Material, glowMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.0), rockMat);
    table.position.y = 0.2;
    table.castShadow = true;
    table.receiveShadow = true;
    group.add(table);

    const runicOrb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), glowMat);
    runicOrb.position.y = 0.65;
    group.add(runicOrb);

    return group;
  }

  private static buildFireworksMortar(woodMat: THREE.Material, brassMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.25, 0.85), woodMat);
    base.position.y = 0.12;
    group.add(base);

    // Brass Mortar Launch Tubes
    [-0.2, 0.2].forEach((tx) => {
      [-0.2, 0.2].forEach((tz) => {
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.75, 8), brassMat);
        tube.position.set(tx, 0.5, tz);
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

    // Wooden deck floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 2.0), woodMat);
    floor.position.y = 0.1;
    group.add(floor);

    // 4 Corner Wooden Pillars
    [-1.0, 1.0].forEach((px) => {
      [-0.8, 0.8].forEach((pz) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 6), darkWoodMat);
        post.position.set(px, 1.0, pz);
        group.add(post);
      });
    });

    // Pagoda styled roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 0.8, 4), roofMat);
    roof.position.y = 2.2;
    roof.rotation.y = Math.PI / 4;
    group.add(roof);

    return group;
  }

  private static buildTideShrine(roofMat: THREE.Material, goldMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();

    const toriiBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.8), roofMat);
    toriiBase.position.y = 0.1;
    group.add(toriiBase);

    // Sacred Sea Bell
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.45, 12), goldMat);
    bell.position.y = 1.0;
    bell.castShadow = true;
    group.add(bell);

    // Frame
    const arch = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.12), goldMat);
    arch.position.y = 1.35;
    group.add(arch);

    return group;
  }
}

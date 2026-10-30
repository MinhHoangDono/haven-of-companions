import * as THREE from 'three';
import { PropPlacementManager } from './PropPlacementManager';
import { VoxelTerrainBuilder } from './VoxelTerrainBuilder';
import { CartoonFireMesh } from './effects/CartoonFireMesh';

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
  fireMesh: CartoonFireMesh;
}

export class DioramaBuilder {
  public static buildDiorama(scene: THREE.Scene): DioramaElements {
    const dioramaGroup = new THREE.Group();
    scene.add(dioramaGroup);

    const interactiveProps: InteractivePropRef[] = [];

    // --- Materials Palette for Props & Effects ---
    const matRockCliff = new THREE.MeshStandardMaterial({
      color: 0x4a4744,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });

    const matPlazaStone = new THREE.MeshStandardMaterial({
      color: 0x9e978c,
      roughness: 0.7,
      metalness: 0.1,
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
      color: 0x0a4f6d, // Deep aquatic ocean blue
      roughness: 0.14,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88,
      flatShading: true,
    });



    // ==========================================
    // 1. Build Smooth Minecraft Voxel Terrain (Instanced Blocks)
    // ==========================================
    // No rectangular base foundation! No artificial road boxes!
    // Terrain has smooth organic curves (hills, mountains, coastline, promontory)
    // Every block has its own authentic Minecraft tile & texture!
    VoxelTerrainBuilder.buildVoxelTerrain(dioramaGroup);

    // ==========================================
    // 2. Central Town Square Fountain (Rescaled to 3.2m radius)
    // ==========================================
    const fountainGeo = new THREE.CylinderGeometry(3.2, 3.6, 0.6, 24);
    const fountainMesh = new THREE.Mesh(fountainGeo, matPlazaStone);
    fountainMesh.position.set(5.5, 1.75, -2.5);
    fountainMesh.castShadow = true;
    fountainMesh.receiveShadow = true;
    dioramaGroup.add(fountainMesh);

    const fountainCenterPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 1.2, 16), matPlazaStone);
    fountainCenterPillar.position.set(5.5, 2.25, -2.5);
    fountainCenterPillar.castShadow = true;
    dioramaGroup.add(fountainCenterPillar);

    const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.55, 24), matWater);
    fountainWater.position.set(5.5, 1.8, -2.5);
    dioramaGroup.add(fountainWater);

    // ==========================================
    // 3. Interactive Village Props
    // ==========================================

    // 1. Campfire Hearth & Stew Cauldron (Interactive Stew Pot!)
    const campfire = this.buildCampfire(matRockCliff, matDarkWood, matGoldMetal);
    campfire.position.set(-15.5, 3.5, -14.5);
    campfire.userData = { interactiveId: 'stew_pot', interactiveType: 'stew_pot' };
    dioramaGroup.add(campfire);

    // Cel-shaded anime fire flame + ember sparks above the hearth logs
    const fireMesh = new CartoonFireMesh();
    fireMesh.position.y = 0.15;
    campfire.add(fireMesh);
    interactiveProps.push({
      id: 'stew_pot',
      type: 'stew_pot',
      mesh: campfire,
      position: campfire.position.clone(),
    });

    // 2. Fireworks Mortar Station (Interactive Fireworks!)
    const fireworks = this.buildFireworksMortar(matGoldMetal, matDarkWood);
    fireworks.position.set(13.0, 1.55, -2.5);
    fireworks.userData = { interactiveId: 'fireworks_mortar', interactiveType: 'fireworks_mortar' };
    dioramaGroup.add(fireworks);
    interactiveProps.push({
      id: 'fireworks_mortar',
      type: 'fireworks_mortar',
      mesh: fireworks,
      position: fireworks.position.clone(),
    });

    // 3. Coastal Tatami Tea Pavilion (Interactive Tea House!)
    const pavilion = this.buildTatamiPavilion(matWoodTimber, matDarkWood);
    pavilion.position.set(6.5, 0.75, 6.0);
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
    seaBell.position.set(19.5, 1.95, 9.5);
    seaBell.userData = { interactiveId: 'sea_bell', interactiveType: 'sea_bell' };
    dioramaGroup.add(seaBell);
    interactiveProps.push({
      id: 'sea_bell',
      type: 'sea_bell',
      mesh: seaBell,
      position: seaBell.position.clone(),
    });

    // ==========================================
    // 4. Dynamic Ocean Bay & Vessels
    // ==========================================
    const boatGroup = new THREE.Group();
    dioramaGroup.add(boatGroup);

    const largeShipGroup = new THREE.Group();
    dioramaGroup.add(largeShipGroup);

    const lighthouseGroup = new THREE.Group();
    dioramaGroup.add(lighthouseGroup);

    // High intensity rotating golden beacon light for the lighthouse
    const lighthouseBeaconLight = new THREE.PointLight(0xffd56b, 5.0, 45);
    lighthouseBeaconLight.position.set(24.0, 9.5, 20.0);
    lighthouseBeaconLight.castShadow = true;
    dioramaGroup.add(lighthouseBeaconLight);

    // Ocean Water Plane (Floats at Y = 0.05, covering water blocks)
    const waterGeo = new THREE.PlaneGeometry(72.0, 40.0, 72, 40);
    const waterMesh = new THREE.Mesh(waterGeo, matWater);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(0, 0.05, 16.0);
    waterMesh.receiveShadow = true;
    dioramaGroup.add(waterMesh);

    // ==========================================
    // 5. Asynchronously Instantiate Declarative Props
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
      fireMesh,
    };
  }

  // --- Sub-Builders ---

  private static buildCampfire(
    rockMat: THREE.Material,
    woodMat: THREE.Material,
    goldMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();

    // Ring of campfire rocks
    const numRocks = 8;
    for (let i = 0; i < numRocks; i++) {
      const angle = (i / numRocks) * Math.PI * 2;
      const rMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18), rockMat);
      rMesh.position.set(Math.cos(angle) * 0.5, 0.1, Math.sin(angle) * 0.5);
      rMesh.castShadow = true;
      group.add(rMesh);
    }

    // Crossed firewood logs
    for (let i = 0; i < 3; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6), woodMat);
      log.rotation.z = Math.PI / 2;
      log.rotation.y = (i / 3) * Math.PI;
      log.position.y = 0.12;
      log.castShadow = true;
      group.add(log);
    }

    // Simmering stew cauldron
    const cauldron = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.45, 12), rockMat);
    cauldron.position.y = 0.35;
    cauldron.castShadow = true;
    group.add(cauldron);

    // Glowing cauldron broth surface
    const broth = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 12), goldMat);
    broth.position.y = 0.56;
    group.add(broth);

    // Warm hearth pointlight
    const fireLight = new THREE.PointLight(0xff7722, 2.5, 6);
    fireLight.position.set(0, 0.5, 0);
    group.add(fireLight);

    return group;
  }

  private static buildFireworksMortar(
    metalMat: THREE.Material,
    woodMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.8), woodMat);
    base.position.y = 0.06;
    group.add(base);

    // Cluster of 3 mortar launch tubes
    const tubePositions = [
      [-0.18, -0.15],
      [0.18, -0.15],
      [0.0, 0.18],
    ];

    tubePositions.forEach(([tx, tz]) => {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.65, 8), metalMat);
      tube.position.set(tx, 0.38, tz);
      tube.rotation.x = 0.1;
      tube.castShadow = true;
      group.add(tube);
    });

    return group;
  }

  private static buildTatamiPavilion(
    woodMat: THREE.Material,
    darkWoodMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();

    const basePlatform = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 2.4), darkWoodMat);
    basePlatform.position.y = 0.1;
    basePlatform.receiveShadow = true;
    group.add(basePlatform);

    // Tatami woven matting
    const tatamiMat = new THREE.MeshStandardMaterial({ color: 0x98a356, roughness: 0.8 });
    const tatami = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.05, 2.1), tatamiMat);
    tatami.position.y = 0.22;
    group.add(tatami);

    // Low tea ceremony table
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.55), woodMat);
    table.position.set(0, 0.32, 0);
    table.castShadow = true;
    group.add(table);

    // 4 Corner Wooden Pillars
    const cornerOffsets = [
      [-1.0, -1.0],
      [1.0, -1.0],
      [-1.0, 1.0],
      [1.0, 1.0],
    ];
    cornerOffsets.forEach(([cx, cz]) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 6), darkWoodMat);
      pillar.position.set(cx, 0.9, cz);
      pillar.castShadow = true;
      group.add(pillar);
    });

    // Traditional Pagoda Tiered Roof
    const pagodaMat = new THREE.MeshStandardMaterial({
      color: 0x2b382d,
      roughness: 0.5,
      flatShading: true,
    });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 0.9, 4), pagodaMat);
    roof.position.y = 2.05;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    return group;
  }

  private static buildTideShrine(
    roofMat: THREE.Material,
    goldMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();

    // Torii-style wooden frame
    const postMat = new THREE.MeshStandardMaterial({ color: 0xa83232, roughness: 0.6 });
    [-0.55, 0.55].forEach((px) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8), postMat);
      post.position.set(px, 0.9, 0);
      post.castShadow = true;
      group.add(post);
    });

    // Hanging sacred golden sea bell
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.24, 0.45, 12), goldMat);
    bell.position.set(0, 1.25, 0);
    bell.castShadow = true;
    group.add(bell);

    const arch = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.16, 0.16), roofMat);
    arch.position.y = 1.8;
    arch.castShadow = true;
    group.add(arch);

    return group;
  }
}

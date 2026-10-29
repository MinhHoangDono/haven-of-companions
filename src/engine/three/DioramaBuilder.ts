import { InteractivePropType } from '../../types/threeEngine';
import * as THREE from 'three';
import { PropPlacementManager } from './PropPlacementManager';

export interface InteractivePropRef {
  id: string;
  type: InteractivePropType;
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

    // --- PBR Materials Palette (Rich Tactical RPG Fantasy) ---
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

    const matVillageLawn = new THREE.MeshStandardMaterial({
      color: 0x3c6e35, // Lush vibrant village grass
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });

    const matLighthouseGrass = new THREE.MeshStandardMaterial({
      color: 0x4a7c38, // Coastal sea-winds grass
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });

    const matDirtRoad = new THREE.MeshStandardMaterial({
      color: 0x755d43, // Rustic dirt country lane
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true,
    });

    const matRockCliff = new THREE.MeshStandardMaterial({
      color: 0x4a4744,
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
      color: 0xd6b77c,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: true,
    });

    const matDeepSeabed = new THREE.MeshStandardMaterial({
      color: 0x092636, // Deep dark oceanic trench floor
      roughness: 0.95,
      metalness: 0.05,
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
      color: 0x0a4f6d, // Deep aquatic ocean blue
      roughness: 0.14,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88,
      flatShading: true,
    });

    // ==========================================
    // 1. Base 70x70 Diorama Foundation Pedestal
    // ==========================================
    const baseGeo = new THREE.BoxGeometry(72, 6.0, 72);
    const baseMesh = new THREE.Mesh(baseGeo, matRockCliff);
    baseMesh.position.set(0, -3.2, 0);
    baseMesh.receiveShadow = true;
    dioramaGroup.add(baseMesh);

    // ==========================================
    // 2. Zone 1: Highland Mountain Range (NW: Y = 2.4 to 4.2)
    // ==========================================
    // High Alpine Mountain Peaks
    const highPeakGeo = new THREE.BoxGeometry(22.0, 4.0, 22.0);
    const highPeakMesh = new THREE.Mesh(highPeakGeo, matHighlandGrass);
    highPeakMesh.position.set(-22.0, 2.0, -22.0);
    highPeakMesh.castShadow = true;
    highPeakMesh.receiveShadow = true;
    dioramaGroup.add(highPeakMesh);

    // Campsite Plateau Step (Y = 3.0)
    const campsiteGeo = new THREE.BoxGeometry(18.0, 3.0, 18.0);
    const campsiteMesh = new THREE.Mesh(campsiteGeo, matHighlandGrass);
    campsiteMesh.position.set(-15.0, 1.5, -13.0);
    campsiteMesh.castShadow = true;
    campsiteMesh.receiveShadow = true;
    dioramaGroup.add(campsiteMesh);

    // Mid-tier Hillside Terrace Step (Y = 2.0)
    const hillsideGeo = new THREE.BoxGeometry(14.0, 2.0, 14.0);
    const hillsideMesh = new THREE.Mesh(hillsideGeo, matHighlandTerrace);
    hillsideMesh.position.set(-8.0, 1.0, -6.0);
    hillsideMesh.castShadow = true;
    hillsideMesh.receiveShadow = true;
    dioramaGroup.add(hillsideMesh);

    // Stepped stone staircases connecting Highlands down to Village
    for (let s = 0; s < 7; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 0.8), matPlazaStone);
      step.position.set(-2.0 + s * 0.5, 1.9 - s * 0.14, -3.5);
      step.castShadow = true;
      step.receiveShadow = true;
      dioramaGroup.add(step);
    }

    // Rocky cliff rims along mountain borders
    [-30, -26, -22, -18, -14, -10, -6].forEach((x, i) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4 + (i % 2) * 0.5), matRockCliff);
      rock.position.set(x + 0.5, 3.2, -4.0);
      rock.castShadow = true;
      rock.receiveShadow = true;
      dioramaGroup.add(rock);
    });

    // ==========================================
    // 3. Zone 2: Sunspire Village & Town Districts (Y = 1.0)
    // ==========================================
    // 3A. Base Village Ground: Lush Vibrant Green Lawn (Not monotone grey!)
    const villageLawnGeo = new THREE.BoxGeometry(45.0, 1.0, 41.0);
    const villageLawnMesh = new THREE.Mesh(villageLawnGeo, matVillageLawn);
    villageLawnMesh.position.set(13.0, 0.5, -15.5);
    villageLawnMesh.castShadow = true;
    villageLawnMesh.receiveShadow = true;
    dioramaGroup.add(villageLawnMesh);

    // 3B. Cobblestone Road Network (Main Village Avenue, East-West)
    const mainAvenueGeo = new THREE.BoxGeometry(42.0, 0.08, 4.4);
    const mainAvenueMesh = new THREE.Mesh(mainAvenueGeo, matPlazaCobble);
    mainAvenueMesh.position.set(12.5, 1.04, -2.5);
    mainAvenueMesh.receiveShadow = true;
    dioramaGroup.add(mainAvenueMesh);

    // 3C. North-South Market Lane (Cobblestone Street with Market Stalls)
    const marketLaneGeo = new THREE.BoxGeometry(4.4, 0.08, 28.0);
    const marketLaneMesh = new THREE.Mesh(marketLaneGeo, matPlazaCobble);
    marketLaneMesh.position.set(5.5, 1.04, -16.0);
    marketLaneMesh.receiveShadow = true;
    dioramaGroup.add(marketLaneMesh);

    // 3D. Cathedral Church Avenue
    const churchAvenueGeo = new THREE.BoxGeometry(3.6, 0.08, 16.0);
    const churchAvenueMesh = new THREE.Mesh(churchAvenueGeo, matPlazaStone);
    churchAvenueMesh.position.set(22.0, 1.04, -20.0);
    churchAvenueMesh.receiveShadow = true;
    dioramaGroup.add(churchAvenueMesh);

    // 3E. Rustic Dirt Paths branching off to Cottages
    const dirtLane1 = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.04, 2.6), matDirtRoad);
    dirtLane1.position.set(16.0, 1.03, -10.5);
    dirtLane1.receiveShadow = true;
    dioramaGroup.add(dirtLane1);

    const dirtLane2 = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.04, 2.6), matDirtRoad);
    dirtLane2.position.set(20.0, 1.03, -6.0);
    dirtLane2.receiveShadow = true;
    dioramaGroup.add(dirtLane2);

    // 3F. Cobblestone apron around the Central Town Fountain
    const fountainApron = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.4, 0.06, 32), matPlazaCobble);
    fountainApron.position.set(5.5, 1.04, -2.5);
    fountainApron.receiveShadow = true;
    dioramaGroup.add(fountainApron);

    // Grand Central Town Square Fountain (Rescaled to 3.2m radius)
    const fountainGeo = new THREE.CylinderGeometry(3.2, 3.6, 0.6, 24);
    const fountainMesh = new THREE.Mesh(fountainGeo, matPlazaStone);
    fountainMesh.position.set(5.5, 1.25, -2.5);
    fountainMesh.castShadow = true;
    fountainMesh.receiveShadow = true;
    dioramaGroup.add(fountainMesh);

    const fountainCenterPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 1.2, 16), matPlazaStone);
    fountainCenterPillar.position.set(5.5, 1.75, -2.5);
    fountainCenterPillar.castShadow = true;
    dioramaGroup.add(fountainCenterPillar);

    const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.55, 24), matWater);
    fountainWater.position.set(5.5, 1.3, -2.5);
    dioramaGroup.add(fountainWater);

    // Stone Road Curbs along the Main Avenue
    [-4.5, 4.5].forEach((offsetZ) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(42.0, 0.16, 0.25), matPlazaStone);
      curb.position.set(12.5, 1.08, -2.5 + offsetZ * 0.48);
      curb.castShadow = true;
      curb.receiveShadow = true;
      dioramaGroup.add(curb);
    });

    // ==========================================
    // 4. Zone 3: Vast Deep Ocean Bay & Shoreline (Y = -2.8 to 0.25)
    // ==========================================
    // 4A. Deep Ocean Trench Floor (Deep underwater seabed!)
    const deepSeabedGeo = new THREE.BoxGeometry(50.0, 2.0, 36.0);
    const deepSeabedMesh = new THREE.Mesh(deepSeabedGeo, matDeepSeabed);
    deepSeabedMesh.position.set(-13.0, -3.2, 18.0);
    deepSeabedMesh.receiveShadow = true;
    dioramaGroup.add(deepSeabedMesh);

    // 4B. Sandy Beach Shoreline (Gentle transition from village grass to coast)
    const sandGeo = new THREE.BoxGeometry(42.0, 0.45, 8.0);
    const sandMesh = new THREE.Mesh(sandGeo, matSand);
    sandMesh.position.set(-6.0, 0.22, 4.5);
    sandMesh.receiveShadow = true;
    dioramaGroup.add(sandMesh);

    // 4C. Stepped Shoreline Slope into Shallows and Deep Ocean Trench
    const slopeGeo = new THREE.BoxGeometry(42.0, 0.35, 6.0);
    const slopeMesh = new THREE.Mesh(slopeGeo, matSand);
    slopeMesh.position.set(-6.0, 0.05, 9.5);
    slopeMesh.rotation.x = 0.08;
    slopeMesh.receiveShadow = true;
    dioramaGroup.add(slopeMesh);

    // Underwater Continental Shelf Drop-off Step
    const dropoffGeo = new THREE.BoxGeometry(42.0, 1.2, 5.0);
    const dropoffMesh = new THREE.Mesh(dropoffGeo, matDeepSeabed);
    dropoffMesh.position.set(-6.0, -0.9, 13.5);
    dropoffMesh.receiveShadow = true;
    dioramaGroup.add(dropoffMesh);

    // 4D. Cozy Narrow Boardwalk Boat Pier (Width: 1.8m instead of 3.2m!)
    const pierGeo = new THREE.BoxGeometry(1.8, 0.22, 17.0);
    const pierMesh = new THREE.Mesh(pierGeo, matWoodTimber);
    pierMesh.position.set(-2.5, 0.25, 13.0);
    pierMesh.castShadow = true;
    pierMesh.receiveShadow = true;
    dioramaGroup.add(pierMesh);

    // Neatly spaced wooden boat dock pilings along the 1.8m pier
    [-3.3, -1.7].forEach((px) => {
      [5.5, 8.5, 11.5, 14.5, 17.5, 20.5].forEach((pz) => {
        const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.8, 8), matDarkWood);
        pile.position.set(px, -1.0, pz);
        pile.castShadow = true;
        dioramaGroup.add(pile);
      });
    });

    // ==========================================
    // 5. Zone 4: Outer Lighthouse Promontory (SE: Green clifftops, not grey only!)
    // ==========================================
    // 5A. Base Cliff Rock Block
    const promontoryGeo = new THREE.BoxGeometry(24.0, 2.6, 32.0);
    const promontoryMesh = new THREE.Mesh(promontoryGeo, matRockCliff);
    promontoryMesh.position.set(24.0, 0.0, 18.0);
    promontoryMesh.castShadow = true;
    promontoryMesh.receiveShadow = true;
    dioramaGroup.add(promontoryMesh);

    // 5B. Lush Coastal Grass Cap atop the Promontory (Adds vibrant green to cape!)
    const capeGrassGeo = new THREE.BoxGeometry(23.4, 0.35, 31.4);
    const capeGrassMesh = new THREE.Mesh(capeGrassGeo, matLighthouseGrass);
    capeGrassMesh.position.set(24.0, 1.35, 18.0);
    capeGrassMesh.castShadow = true;
    capeGrassMesh.receiveShadow = true;
    dioramaGroup.add(capeGrassMesh);

    // 5C. Sandy/Gravel Path winding across the Promontory toward the Lighthouse
    const capePathGeo = new THREE.BoxGeometry(2.8, 0.06, 22.0);
    const capePathMesh = new THREE.Mesh(capePathGeo, matSand);
    capePathMesh.position.set(22.5, 1.54, 18.0);
    capePathMesh.receiveShadow = true;
    dioramaGroup.add(capePathMesh);

    // Stone Steps connecting Plaza to Lighthouse Promontory
    for (let s = 0; s < 5; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 0.8), matPlazaStone);
      step.position.set(16.0, 1.05 + s * 0.06, 3.0 + s * 0.6);
      step.castShadow = true;
      dioramaGroup.add(step);
    }

    // ==========================================
    // 6. Interactive Village Props
    // ==========================================

    // 1. Campfire Hearth & Stew Cauldron (Interactive Stew Pot!)
    const campfire = this.buildCampfire(matRockCliff, matDarkWood, matGoldMetal);
    campfire.position.set(-15.5, 3.0, -14.5);
    campfire.userData = { interactiveId: 'stew_pot', interactiveType: 'stew_pot' };
    dioramaGroup.add(campfire);
    interactiveProps.push({
      id: 'stew_pot',
      type: 'stew_pot',
      mesh: campfire,
      position: campfire.position.clone(),
    });

    // 2. Fireworks Mortar Station (Interactive Fireworks!)
    const fireworks = this.buildFireworksMortar(matGoldMetal, matDarkWood);
    fireworks.position.set(14.0, 1.08, -2.5);
    fireworks.userData = { interactiveId: 'fireworks_mortar', interactiveType: 'fireworks_mortar' };
    dioramaGroup.add(fireworks);
    interactiveProps.push({
      id: 'fireworks_mortar',
      type: 'fireworks_mortar',
      mesh: fireworks,
      position: fireworks.position.clone(),
    });

    // 3. Coastal Tatami Tea Pavilion (Interactive Tea House!)
    const pavilion = this.buildTatamiPavilion(matWoodTimber, matDarkWood, matHighlandGrass);
    pavilion.position.set(6.5, 0.25, 6.0);
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
    seaBell.position.set(19.5, 1.55, 9.5);
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
    const lighthouseBeaconLight = new THREE.PointLight(0xffd56b, 5.0, 45);
    lighthouseBeaconLight.position.set(24.0, 9.5, 20.0);
    lighthouseBeaconLight.castShadow = true;
    dioramaGroup.add(lighthouseBeaconLight);

    // Vast 70x38 Deep Ocean Water Plane
    const waterGeo = new THREE.PlaneGeometry(72.0, 40.0, 72, 40);
    const waterMesh = new THREE.Mesh(waterGeo, matWater);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(0, 0.08, 16.0);
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
    darkWoodMat: THREE.Material,
    _roofMat: THREE.Material
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

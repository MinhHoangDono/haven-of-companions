import * as THREE from 'three';

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

    const matPlasterWall = new THREE.MeshStandardMaterial({
      color: 0xe6dec8,
      roughness: 0.8,
    });

    const matPineNeedles = new THREE.MeshStandardMaterial({
      color: 0x224926,
      roughness: 0.8,
      flatShading: true,
    });

    const matGoldMetal = new THREE.MeshStandardMaterial({
      color: 0xdfa642,
      roughness: 0.35,
      metalness: 0.8,
    });

    const matWater = new THREE.MeshStandardMaterial({
      color: 0x1c7e9e,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.88,
      flatShading: true,
    });

    // --- 1. Base Diorama Foundation & Island Pedestal ---
    const baseGeo = new THREE.BoxGeometry(17, 3, 17);
    const baseMesh = new THREE.Mesh(baseGeo, matRockCliff);
    baseMesh.position.set(0, -1.8, 0);
    baseMesh.receiveShadow = true;
    dioramaGroup.add(baseMesh);

    // --- 2. Tier 3: Highlands Plateau (North-West: X: -7 to 0, Z: -7 to 0, Y: 1.6) ---
    const highlandGeo = new THREE.BoxGeometry(8, 1.8, 8);
    const highlandMesh = new THREE.Mesh(highlandGeo, matHighlandGrass);
    highlandMesh.position.set(-3.5, 0.9, -3.5);
    highlandMesh.castShadow = true;
    highlandMesh.receiveShadow = true;
    dioramaGroup.add(highlandMesh);

    // Cliff rocky edge trims
    [-7, -3.5, 0].forEach((x, i) => {
      const rockGeo = new THREE.DodecahedronGeometry(0.7 + (i % 2) * 0.3);
      const rock = new THREE.Mesh(rockGeo, matRockCliff);
      rock.position.set(x + 0.5, 1.6, 0.5);
      rock.castShadow = true;
      rock.receiveShadow = true;
      dioramaGroup.add(rock);
    });

    // Highlands Pine Trees
    const pinePositions = [
      { x: -6.5, z: -6.5, s: 1.2 },
      { x: -5.5, z: -2.0, s: 0.9 },
      { x: -1.5, z: -6.0, s: 1.1 },
      { x: -6.0, z: -3.2, s: 0.8 },
    ];
    pinePositions.forEach((pt) => {
      const tree = this.buildPineTree(matDarkWood, matPineNeedles, pt.s);
      tree.position.set(pt.x, 1.8, pt.z);
      dioramaGroup.add(tree);
    });

    // Campsite Canvas Tent
    const tent = this.buildTent(matPlasterWall, matDarkWood);
    tent.position.set(-5.5, 1.8, -4.5);
    dioramaGroup.add(tent);

    // Campfire Hearth & Copper Cauldron (Interactive Stew Pot!)
    const campfire = this.buildCampfire(matRockCliff, matDarkWood, matGoldMetal);
    campfire.position.set(-3.8, 1.8, -4.8);
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
    druidAltar.position.set(-2.0, 1.8, -2.5);
    dioramaGroup.add(druidAltar);

    // Stone Steps connecting Highlands to Plaza
    for (let s = 0; s < 4; s++) {
      const stepGeo = new THREE.BoxGeometry(1.6, 0.22, 0.6);
      const step = new THREE.Mesh(stepGeo, matPlazaStone);
      step.position.set(0.2 + s * 0.45, 1.6 - s * 0.22, -1.5);
      step.castShadow = true;
      step.receiveShadow = true;
      dioramaGroup.add(step);
    }

    // --- 3. Tier 2: Sunspire Town Square (Center & East: X: 0 to 7.5, Z: -7 to 1, Y: 0.8) ---
    const plazaGeo = new THREE.BoxGeometry(9.5, 1.0, 9);
    const plazaMesh = new THREE.Mesh(plazaGeo, matPlazaCobble);
    plazaMesh.position.set(3.2, 0.4, -3.5);
    plazaMesh.castShadow = true;
    plazaMesh.receiveShadow = true;
    dioramaGroup.add(plazaMesh);

    // Medieval Timber Cottage (Tavern / Guildhall)
    const cottage = this.buildCottage(matPlasterWall, matWoodTimber, matRoofSlate, matRockCliff);
    cottage.position.set(4.5, 0.9, -5.5);
    dioramaGroup.add(cottage);

    // Festival Market Stall
    const stall = this.buildMarketStall(matWoodTimber, matRoofSlate);
    stall.position.set(2.0, 0.9, -2.5);
    dioramaGroup.add(stall);

    // Fireworks Mortar Battery (Interactive Fireworks Launcher!)
    const mortar = this.buildFireworksMortar(matDarkWood, matGoldMetal);
    mortar.position.set(5.5, 0.9, -2.0);
    mortar.userData = { interactiveId: 'fireworks_mortar', interactiveType: 'fireworks_mortar' };
    dioramaGroup.add(mortar);
    interactiveProps.push({
      id: 'fireworks_mortar',
      type: 'fireworks_mortar',
      mesh: mortar,
      position: mortar.position.clone(),
    });

    // Street Lantern Posts
    [{ x: 1.5, z: -4.5 }, { x: 6.2, z: -3.5 }, { x: 3.5, z: 0.5 }].forEach((pt) => {
      const lamp = this.buildStreetLamp(matDarkWood, matGoldMetal);
      lamp.position.set(pt.x, 0.9, pt.z);
      dioramaGroup.add(lamp);
    });

    // Clutter barrels & crates around cottage
    [{ x: 2.8, z: -5.8 }, { x: 3.2, z: -5.5 }, { x: 6.5, z: -6.0 }].forEach((pt, i) => {
      const barrelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.5, 8);
      const barrel = new THREE.Mesh(barrelGeo, matWoodTimber);
      barrel.position.set(pt.x, 1.15, pt.z);
      barrel.castShadow = true;
      dioramaGroup.add(barrel);

      const crateGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
      const crate = new THREE.Mesh(crateGeo, matWoodTimber);
      crate.position.set(pt.x + 0.3, 1.05 + (i % 2) * 0.1, pt.z + 0.2);
      crate.castShadow = true;
      dioramaGroup.add(crate);
    });

    // --- 4. Tier 1: Coastal Harbor, Sand & Ocean Bay (South: Z: 1 to 8, Y: 0.0 to -0.3) ---
    // Sandy Beach
    const sandGeo = new THREE.BoxGeometry(16, 0.4, 3.5);
    const sandMesh = new THREE.Mesh(sandGeo, matSand);
    sandMesh.position.set(0, 0.1, 2.5);
    sandMesh.receiveShadow = true;
    dioramaGroup.add(sandMesh);

    // Stone Harbor Armory & Gatehouse (Phuong's Vigil Post)
    const armory = this.buildHarborArmory(matRockCliff, matDarkWood, matGoldMetal);
    armory.position.set(3.5, 0.3, 2.5);
    dioramaGroup.add(armory);

    // Coastal Tatami Tea Pavilion (Interactive Tea House!)
    const pavilion = this.buildTatamiPavilion(matWoodTimber, matDarkWood, matHighlandGrass);
    pavilion.position.set(-4.5, 0.3, 2.5);
    pavilion.userData = { interactiveId: 'tea_pavilion', interactiveType: 'tea_pavilion' };
    dioramaGroup.add(pavilion);
    interactiveProps.push({
      id: 'tea_pavilion',
      type: 'tea_pavilion',
      mesh: pavilion,
      position: pavilion.position.clone(),
    });

    // Wooden Pier Boardwalk extending into water
    const pierGeo = new THREE.BoxGeometry(2.5, 0.25, 4.0);
    const pierMesh = new THREE.Mesh(pierGeo, matWoodTimber);
    pierMesh.position.set(0.5, 0.15, 5.0);
    pierMesh.castShadow = true;
    pierMesh.receiveShadow = true;
    dioramaGroup.add(pierMesh);

    // Dock Pilings
    [-0.6, 1.6].forEach((px) => {
      [3.5, 5.0, 6.8].forEach((pz) => {
        const pileGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.0, 6);
        const pile = new THREE.Mesh(pileGeo, matDarkWood);
        pile.position.set(px, -0.2, pz);
        pile.castShadow = true;
        dioramaGroup.add(pile);
      });
    });

    // Tide Shrine & Maritime Bell (Interactive Sea Bell!)
    const seaBell = this.buildTideShrine(matRoofSlate, matGoldMetal);
    seaBell.position.set(6.0, 0.3, 3.5);
    seaBell.userData = { interactiveId: 'sea_bell', interactiveType: 'sea_bell' };
    dioramaGroup.add(seaBell);
    interactiveProps.push({
      id: 'sea_bell',
      type: 'sea_bell',
      mesh: seaBell,
      position: seaBell.position.clone(),
    });

    // 1. Moored Wooden Fishing Skiff (Rowboat)
    const boatGroup = this.buildBoat(matDarkWood, matWoodTimber, matPlasterWall);
    boatGroup.position.set(2.8, -0.15, 5.5);
    dioramaGroup.add(boatGroup);

    // 2. Large Medieval Galleon / Caravel Ship (Bigger Boat!)
    const largeShipGroup = this.buildLargeGalleon(matDarkWood, matWoodTimber, matPlasterWall, matGoldMetal);
    largeShipGroup.position.set(-3.2, -0.15, 6.0);
    largeShipGroup.rotation.y = -0.15;
    dioramaGroup.add(largeShipGroup);

    // 3. Coastal Stone Lighthouse with Rotating Beacon Light
    const { group: lighthouseGroup, beaconLight: lighthouseBeaconLight } = this.buildLighthouse(
      matRockCliff,
      matRoofSlate,
      matGoldMetal
    );
    lighthouseGroup.position.set(7.2, 0.15, 4.8);
    dioramaGroup.add(lighthouseGroup);

    // 4. Subdivided 3D Water Plane for dynamic ocean waves
    const waterGeo = new THREE.PlaneGeometry(19.0, 8.5, 48, 24);
    const waterMesh = new THREE.Mesh(waterGeo, matWater);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(0, -0.06, 5.5);
    waterMesh.receiveShadow = true;
    dioramaGroup.add(waterMesh);

    return {
      interactiveProps,
      waterMesh,
      boatGroup,
      largeShipGroup,
      lighthouseGroup,
      lighthouseBeaconLight,
    };
  }

  // --- Sub-mesh Builders ---

  private static buildPineTree(trunkMat: THREE.Material, needlesMat: THREE.Material, scale: number = 1): THREE.Group {
    const group = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 1.0 * scale, 6);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.5 * scale;
    trunk.castShadow = true;
    group.add(trunk);

    // 3 tiers of needle cones
    for (let i = 0; i < 3; i++) {
      const coneGeo = new THREE.ConeGeometry((0.9 - i * 0.22) * scale, (0.85 - i * 0.1) * scale, 6);
      const cone = new THREE.Mesh(coneGeo, needlesMat);
      cone.position.y = (0.9 + i * 0.55) * scale;
      cone.castShadow = true;
      cone.receiveShadow = true;
      group.add(cone);
    }

    return group;
  }

  private static buildTent(canvasMat: THREE.Material, woodMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const tentGeo = new THREE.ConeGeometry(1.2, 1.4, 4);
    const tent = new THREE.Mesh(tentGeo, canvasMat);
    tent.rotation.y = Math.PI / 4;
    tent.position.y = 0.7;
    tent.scale.set(1.2, 1, 0.8);
    tent.castShadow = true;
    tent.receiveShadow = true;
    group.add(tent);

    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 4);
    const pole = new THREE.Mesh(poleGeo, woodMat);
    pole.position.set(0, 0.8, 0.7);
    pole.rotation.x = 0.2;
    group.add(pole);

    return group;
  }

  private static buildCampfire(stoneMat: THREE.Material, ironMat: THREE.Material, copperMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();

    // Stone ring
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const stoneGeo = new THREE.DodecahedronGeometry(0.12);
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(Math.cos(a) * 0.45, 0.08, Math.sin(a) * 0.45);
      stone.castShadow = true;
      group.add(stone);
    }

    // Iron tripod
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 4);
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(legGeo, ironMat);
      leg.position.set(Math.cos(angle) * 0.22, 0.4, Math.sin(angle) * 0.22);
      leg.rotation.z = -Math.cos(angle) * 0.25;
      leg.rotation.x = Math.sin(angle) * 0.25;
      leg.castShadow = true;
      group.add(leg);
    }

    // Copper Cauldron
    const cauldronGeo = new THREE.SphereGeometry(0.24, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.75);
    const cauldron = new THREE.Mesh(cauldronGeo, copperMat);
    cauldron.position.set(0, 0.35, 0);
    cauldron.castShadow = true;
    group.add(cauldron);

    return group;
  }

  private static buildDruidAltar(stoneMat: THREE.Material, runeMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const slabGeo = new THREE.BoxGeometry(1.2, 0.3, 0.8);
    const slab = new THREE.Mesh(slabGeo, stoneMat);
    slab.position.y = 0.45;
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);

    [-0.4, 0.4].forEach((px) => {
      const legGeo = new THREE.BoxGeometry(0.25, 0.45, 0.6);
      const leg = new THREE.Mesh(legGeo, stoneMat);
      leg.position.set(px, 0.22, 0);
      leg.castShadow = true;
      group.add(leg);
    });

    const runeGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 6);
    const rune = new THREE.Mesh(runeGeo, runeMat);
    rune.position.set(0, 0.62, 0);
    group.add(rune);

    return group;
  }

  private static buildCottage(
    wallMat: THREE.Material,
    timberMat: THREE.Material,
    roofMat: THREE.Material,
    stoneMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();

    // Main walls
    const houseGeo = new THREE.BoxGeometry(2.4, 1.6, 2.0);
    const house = new THREE.Mesh(houseGeo, wallMat);
    house.position.y = 0.8;
    house.castShadow = true;
    house.receiveShadow = true;
    group.add(house);

    // Sloped Slate Roof
    const roofGeo = new THREE.ConeGeometry(2.1, 1.1, 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 2.0;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.1, 1, 0.95);
    roof.castShadow = true;
    group.add(roof);

    // Stone Chimney
    const chimneyGeo = new THREE.BoxGeometry(0.4, 1.4, 0.4);
    const chimney = new THREE.Mesh(chimneyGeo, stoneMat);
    chimney.position.set(0.8, 1.8, -0.5);
    chimney.castShadow = true;
    group.add(chimney);

    // Wooden door
    const doorGeo = new THREE.BoxGeometry(0.5, 0.8, 0.08);
    const door = new THREE.Mesh(doorGeo, timberMat);
    door.position.set(0, 0.4, 1.02);
    group.add(door);

    return group;
  }

  private static buildMarketStall(woodMat: THREE.Material, awningMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const tableGeo = new THREE.BoxGeometry(1.6, 0.6, 0.9);
    const table = new THREE.Mesh(tableGeo, woodMat);
    table.position.y = 0.3;
    table.castShadow = true;
    group.add(table);

    // Awning posts
    [-0.7, 0.7].forEach((px) => {
      [-0.4, 0.4].forEach((pz) => {
        const postGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.4, 4);
        const post = new THREE.Mesh(postGeo, woodMat);
        post.position.set(px, 0.7, pz);
        group.add(post);
      });
    });

    // Striped Awning roof
    const roofGeo = new THREE.ConeGeometry(1.2, 0.45, 4);
    const roof = new THREE.Mesh(roofGeo, awningMat);
    roof.position.y = 1.45;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.3, 1, 0.9);
    roof.castShadow = true;
    group.add(roof);

    return group;
  }

  private static buildFireworksMortar(woodMat: THREE.Material, brassMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const baseGeo = new THREE.BoxGeometry(0.9, 0.25, 0.5);
    const base = new THREE.Mesh(baseGeo, woodMat);
    base.position.y = 0.12;
    base.castShadow = true;
    group.add(base);

    // 3 mortar brass barrels angled
    [-0.25, 0, 0.25].forEach((px) => {
      const barrelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
      const barrel = new THREE.Mesh(barrelGeo, brassMat);
      barrel.position.set(px, 0.4, 0);
      barrel.rotation.x = -0.25;
      barrel.castShadow = true;
      group.add(barrel);
    });

    return group;
  }

  private static buildStreetLamp(ironMat: THREE.Material, glassMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const postGeo = new THREE.CylinderGeometry(0.04, 0.06, 1.6, 6);
    const post = new THREE.Mesh(postGeo, ironMat);
    post.position.y = 0.8;
    post.castShadow = true;
    group.add(post);

    const lanternGeo = new THREE.DodecahedronGeometry(0.16);
    const lantern = new THREE.Mesh(lanternGeo, glassMat);
    lantern.position.set(0.18, 1.5, 0);
    group.add(lantern);

    return group;
  }

  private static buildHarborArmory(stoneMat: THREE.Material, doorMat: THREE.Material, shieldMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const towerGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    const tower = new THREE.Mesh(towerGeo, stoneMat);
    tower.position.y = 0.9;
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);

    // Battlements
    for (let i = 0; i < 4; i++) {
      const bGeo = new THREE.BoxGeometry(0.4, 0.25, 0.4);
      const b = new THREE.Mesh(bGeo, stoneMat);
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      b.position.set(Math.cos(angle) * 0.75, 1.9, Math.sin(angle) * 0.75);
      group.add(b);
    }

    // Heavy oak gate
    const doorGeo = new THREE.BoxGeometry(0.6, 0.9, 0.08);
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.45, 0.92);
    group.add(door);

    // Mounted Crest Shield on wall
    const shieldGeo = new THREE.BoxGeometry(0.35, 0.45, 0.05);
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(0, 1.25, 0.93);
    group.add(shield);

    return group;
  }

  private static buildTatamiPavilion(woodMat: THREE.Material, darkWoodMat: THREE.Material, matTatami: THREE.Material): THREE.Group {
    const group = new THREE.Group();

    // Cedar Deck
    const deckGeo = new THREE.BoxGeometry(2.0, 0.25, 2.0);
    const deck = new THREE.Mesh(deckGeo, woodMat);
    deck.position.y = 0.12;
    deck.castShadow = true;
    deck.receiveShadow = true;
    group.add(deck);

    // Tatami center
    const tatamiGeo = new THREE.BoxGeometry(1.6, 0.05, 1.6);
    const tatami = new THREE.Mesh(tatamiGeo, matTatami);
    tatami.position.y = 0.26;
    group.add(tatami);

    // Pagoda curved roof
    const roofGeo = new THREE.ConeGeometry(1.8, 0.6, 4);
    const roof = new THREE.Mesh(roofGeo, darkWoodMat);
    roof.position.y = 1.7;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.2, 1, 1.2);
    roof.castShadow = true;
    group.add(roof);

    // 4 Bamboo corner pillars
    [-0.8, 0.8].forEach((px) => {
      [-0.8, 0.8].forEach((pz) => {
        const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6);
        const pillar = new THREE.Mesh(pillarGeo, woodMat);
        pillar.position.set(px, 0.8, pz);
        group.add(pillar);
      });
    });

    return group;
  }

  private static buildTideShrine(roofMat: THREE.Material, pearlMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();

    // Red torii posts
    const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.6, 6);
    [-0.5, 0.5].forEach((px) => {
      const post = new THREE.Mesh(postGeo, roofMat);
      post.position.set(px, 0.8, 0);
      post.castShadow = true;
      group.add(post);
    });

    const lintelGeo = new THREE.BoxGeometry(1.4, 0.12, 0.18);
    const lintel = new THREE.Mesh(lintelGeo, roofMat);
    lintel.position.set(0, 1.55, 0);
    group.add(lintel);

    // Floating Pearl
    const pearlGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const pearl = new THREE.Mesh(pearlGeo, pearlMat);
    pearl.position.set(0, 0.85, 0);
    group.add(pearl);

    return group;
  }

  private static buildBoat(woodDark: THREE.Material, woodLight: THREE.Material, sailMat: THREE.Material): THREE.Group {
    const group = new THREE.Group();

    // Hull
    const hullGeo = new THREE.BoxGeometry(0.8, 0.4, 1.8);
    const hull = new THREE.Mesh(hullGeo, woodLight);
    hull.position.y = 0.2;
    hull.castShadow = true;
    group.add(hull);

    // Mast
    const mastGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6);
    const mast = new THREE.Mesh(mastGeo, woodDark);
    mast.position.set(0, 1.0, 0);
    group.add(mast);

    // Sail
    const sailGeo = new THREE.PlaneGeometry(0.6, 0.8);
    const sail = new THREE.Mesh(sailGeo, sailMat);
    sail.position.set(0, 1.1, 0.1);
    sail.rotation.y = 0.2;
    group.add(sail);

    return group;
  }

  private static buildLargeGalleon(
    woodDark: THREE.Material,
    woodPlank: THREE.Material,
    sailMat: THREE.Material,
    goldMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();

    // Hull
    const hullGeo = new THREE.BoxGeometry(1.8, 1.1, 4.2);
    const hull = new THREE.Mesh(hullGeo, woodDark);
    hull.position.y = 0.55;
    hull.castShadow = true;
    hull.receiveShadow = true;
    group.add(hull);

    // Tapered Bow wedge
    const bowGeo = new THREE.ConeGeometry(1.0, 1.8, 4);
    const bow = new THREE.Mesh(bowGeo, woodDark);
    bow.position.set(0, 0.55, 2.7);
    bow.rotation.x = -Math.PI / 2;
    bow.rotation.y = Math.PI / 4;
    bow.scale.set(1.1, 1.0, 0.7);
    bow.castShadow = true;
    group.add(bow);

    // Bowsprit spar
    const bowspritGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.8, 6);
    const bowsprit = new THREE.Mesh(bowspritGeo, woodDark);
    bowsprit.position.set(0, 0.9, 3.6);
    bowsprit.rotation.x = Math.PI / 4;
    group.add(bowsprit);

    // Raised Sterncastle
    const sternGeo = new THREE.BoxGeometry(1.9, 0.95, 1.6);
    const stern = new THREE.Mesh(sternGeo, woodPlank);
    stern.position.set(0, 1.35, -1.3);
    stern.castShadow = true;
    group.add(stern);

    // Stern cabin windows
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffea88 });
    const cabinWin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.08), winMat);
    cabinWin.position.set(0, 1.35, -2.12);
    group.add(cabinWin);

    // Deck Railings
    [-0.92, 0.92].forEach((rx) => {
      const railGeo = new THREE.BoxGeometry(0.06, 0.35, 3.6);
      const rail = new THREE.Mesh(railGeo, woodDark);
      rail.position.set(rx, 1.15, 0.2);
      group.add(rail);
    });

    // Main Mast (Center)
    const mainMast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.4, 8), woodDark);
    mainMast.position.set(0, 2.7, 0.2);
    mainMast.castShadow = true;
    group.add(mainMast);

    const mainYard = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.4, 6), woodDark);
    mainYard.rotation.z = Math.PI / 2;
    mainYard.position.set(0, 2.9, 0.2);
    group.add(mainYard);

    const mainSail = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.7), sailMat);
    mainSail.position.set(0, 2.9, 0.3);
    mainSail.rotation.y = 0.08;
    group.add(mainSail);

    const nest = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.3, 8), woodDark);
    nest.position.set(0, 4.1, 0.2);
    group.add(nest);

    // Fore Mast (Front)
    const foreMast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3.4, 8), woodDark);
    foreMast.position.set(0, 2.2, 1.8);
    foreMast.castShadow = true;
    group.add(foreMast);

    const foreSail = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.3), sailMat);
    foreSail.position.set(0, 2.3, 1.9);
    group.add(foreSail);

    // Figurehead on bow
    const figurehead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), goldMat);
    figurehead.position.set(0, 1.05, 3.4);
    group.add(figurehead);

    return group;
  }

  private static buildLighthouse(
    stoneMat: THREE.Material,
    slateMat: THREE.Material,
    goldMat: THREE.Material
  ): { group: THREE.Group; beaconLight: THREE.PointLight } {
    const group = new THREE.Group();

    // Rocky Pedestal Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.8, 10), stoneMat);
    base.position.y = 0.4;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Tapered Stone Tower Shaft
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.3, 3.8, 12), stoneMat);
    tower.position.y = 2.7;
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);

    // Red Masonry Stripes
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xa83232, roughness: 0.7 });
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.15, 0.5, 12), stripeMat);
    stripe.position.y = 2.8;
    group.add(stripe);

    // Observation Balcony
    const balcony = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 14), stoneMat);
    balcony.position.y = 4.7;
    group.add(balcony);

    const railing = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.03, 6, 20), new THREE.MeshBasicMaterial({ color: 0x222222 }));
    railing.rotation.x = Math.PI / 2;
    railing.position.y = 4.95;
    group.add(railing);

    // Glass Lantern Room
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xfff3a0,
      emissive: 0xffcc33,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.85,
    });
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.9, 8), lanternMat);
    lantern.position.y = 5.25;
    group.add(lantern);

    // Conical Slate Roof & Spire
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.85, 10), slateMat);
    roof.position.y = 6.1;
    roof.castShadow = true;
    group.add(roof);

    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), goldMat);
    spire.position.y = 6.8;
    group.add(spire);

    // Active Rotating Beacon Point Light
    const beaconLight = new THREE.PointLight(0xffea66, 3.5, 20, 1.4);
    beaconLight.position.set(0, 5.3, 0);
    group.add(beaconLight);

    return { group, beaconLight };
  }
}

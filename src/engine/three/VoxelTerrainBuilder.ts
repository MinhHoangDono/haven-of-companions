import * as THREE from 'three';

export type BlockType = 'GRASS' | 'DIRT' | 'STONE' | 'SAND' | 'WOOD_PLANK' | 'WATER';

export interface VoxelCell {
  x: number;
  z: number;
  topY: number;
  type: BlockType;
}

export class VoxelTerrainBuilder {
  // 70x70 World Bounds: X in [-35, 35], Z in [-35, 35]
  public static readonly MIN_COORD = -35;
  public static readonly MAX_COORD = 35;
  public static readonly BLOCK_SIZE = 1.0; // 1.0m Minecraft block cube

  private static voxelGrid: Map<string, VoxelCell> = new Map();

  private static getKey(x: number, z: number): string {
    return `${Math.round(x)},${Math.round(z)}`;
  }

  /**
   * Generates a 64x64 pixel-crisp Minecraft-style CanvasTexture
   */
  private static createCanvasTexture(drawFn: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawFn(ctx);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Creates the Minecraft Grass Block Top Texture (Lush RPG vibrant emerald green pixels)
   */
  private static createGrassTopTexture(): THREE.CanvasTexture {
    return this.createCanvasTexture((ctx) => {
      const palette = ['#3d9424', '#47a62b', '#4fb532', '#59c33a', '#36851f', '#60cd41', '#439d28'];
      const pixelSize = 4; // 16x16 pixel art grid inside 64x64 canvas
      for (let x = 0; x < 64; x += pixelSize) {
        for (let y = 0; y < 64; y += pixelSize) {
          const color = palette[Math.floor(Math.random() * palette.length)];
          ctx.fillStyle = color;
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    });
  }

  /**
   * Creates the classic Minecraft Grass Block Side Texture
   * Top 22% is green grass with natural jagged drip overhangs, bottom 78% is rich earthy dirt
   */
  private static createGrassSideTexture(): THREE.CanvasTexture {
    return this.createCanvasTexture((ctx) => {
      const dirtPalette = ['#754926', '#81512b', '#6b4122', '#8d5a31', '#5c371b', '#704523'];
      const grassPalette = ['#3d9424', '#47a62b', '#4fb532', '#59c33a', '#36851f'];
      const pixelSize = 4;

      // 1. Fill base dirt
      for (let x = 0; x < 64; x += pixelSize) {
        for (let y = 0; y < 64; y += pixelSize) {
          ctx.fillStyle = dirtPalette[Math.floor(Math.random() * dirtPalette.length)];
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }

      // 2. Overhang jagged grass fringe on top
      for (let x = 0; x < 64; x += pixelSize) {
        // Organic jagged grass hanging depth
        const overhangHeight = 16 + (Math.sin(x * 0.45) > 0 ? 8 : 0) + (x % 12 === 0 ? 4 : 0);
        for (let y = 0; y < overhangHeight; y += pixelSize) {
          ctx.fillStyle = grassPalette[Math.floor(Math.random() * grassPalette.length)];
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    });
  }

  /**
   * Creates the Minecraft Dirt Block Texture
   */
  private static createDirtTexture(): THREE.CanvasTexture {
    return this.createCanvasTexture((ctx) => {
      const palette = ['#754926', '#81512b', '#6b4122', '#8d5a31', '#5c371b', '#704523'];
      const pixelSize = 4;
      for (let x = 0; x < 64; x += pixelSize) {
        for (let y = 0; y < 64; y += pixelSize) {
          ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    });
  }

  /**
   * Creates the Minecraft Sand Block Texture (Warm sunny beach sand)
   */
  private static createSandTexture(): THREE.CanvasTexture {
    return this.createCanvasTexture((ctx) => {
      const palette = ['#d5bd78', '#dec681', '#caa86b', '#e6ce8a', '#c2a462', '#ebd292'];
      const pixelSize = 4;
      for (let x = 0; x < 64; x += pixelSize) {
        for (let y = 0; y < 64; y += pixelSize) {
          ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    });
  }

  /**
   * Creates the Minecraft Stone Block Texture (Natural chiseled mountain rock)
   */
  private static createStoneTexture(): THREE.CanvasTexture {
    return this.createCanvasTexture((ctx) => {
      const palette = ['#707070', '#7b7b7b', '#646464', '#565656', '#868686', '#6b6b6b'];
      const pixelSize = 4;
      for (let x = 0; x < 64; x += pixelSize) {
        for (let y = 0; y < 64; y += pixelSize) {
          ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    });
  }

  /**
   * Creates the Minecraft Wood Plank Block Texture (Warm oak planks for the dock)
   */
  private static createWoodPlankTexture(): THREE.CanvasTexture {
    return this.createCanvasTexture((ctx) => {
      const woodPalette = ['#91663a', '#9f7041', '#815830', '#ac7c48', '#885d34'];
      const pixelSize = 4;
      for (let x = 0; x < 64; x += pixelSize) {
        for (let y = 0; y < 64; y += pixelSize) {
          // Horizontal plank seam line every 16 pixels
          if (y % 16 === 0 || y % 16 === 12) {
            ctx.fillStyle = '#56381c';
          } else {
            ctx.fillStyle = woodPalette[Math.floor(Math.random() * woodPalette.length)];
          }
          ctx.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    });
  }

  /**
   * Continuous smooth organic elevation function H(x, z).
   * Replaces rigid rectangular boxes with smooth, natural landscape contours:
   * - High Mountain Peak (NW)
   * - Gentle Rolling Village Lawn (Center & NE)
   * - Natural Serpentine Coastline
   * - Curved Promontory Cape (SE)
   * - Deep Ocean Seabed (SW)
   */
  public static calculateOrganicHeight(x: number, z: number): { topY: number; type: BlockType } {
    // 1. Natural Serpentine Coastline Boundary Z_coast(x)
    // Curving smoothly across the map instead of a straight line
    const coastLineZ = 2.0 + 4.5 * Math.sin(x * 0.09) + 2.0 * Math.cos(x * 0.18 + 0.8) - 0.18 * x;

    // 2. Cozy Boardwalk Dock Path (at x around -2.5, extending into ocean)
    if (x >= -3.5 && x <= -1.5 && z >= 4 && z <= 22) {
      return { topY: 0, type: 'WOOD_PLANK' };
    }

    // 3. Zone 1: Highlands Mountain Range (NW: centered around x = -20, z = -20)
    const distHighland = Math.hypot(x - (-20), z - (-20));
    const distSummit = Math.hypot(x - (-26), z - (-24));

    if (distHighland < 22) {
      const normDist = distHighland / 22;
      const baseMountain = 3.8 * Math.pow(Math.max(0, 1 - normDist), 1.25);
      const summitBoost = distSummit < 12 ? 0.8 * Math.max(0, 1 - distSummit / 12) : 0;
      const rawHeight = 1.0 + baseMountain + summitBoost;
      const topY = Math.round(rawHeight);
      // High mountain summits turn to Stone Blocks
      const type: BlockType = topY >= 4 ? 'STONE' : 'GRASS';
      return { topY, type };
    }

    // 4. Zone 4: Outer Lighthouse Promontory (SE: natural curving sea cape around x = 22, z = 18)
    const distCape = Math.hypot(x - 22, z - 18);
    if (distCape < 15) {
      const normCape = distCape / 15;
      const capeHeight = 1.4 * Math.max(0, 1 - normCape);
      const topY = Math.round(capeHeight);
      // Wide sandy beach wrap around the promontory
      const type: BlockType = distCape > 9.5 ? 'SAND' : 'GRASS';
      return { topY, type };
    }

    // 5. Zone 3: Vast Ocean Bay & Expanded Sandy Beach
    // A. Dry inland beach dunes extending into the mainland (6m wide dry sand strip at Y = 1)
    if (z >= coastLineZ - 6.0 && z <= coastLineZ) {
      return { topY: 1, type: 'SAND' };
    }

    // B. Shoreline and ocean basin
    if (z > coastLineZ) {
      const distIntoWater = z - coastLineZ;
      if (distIntoWater < 5.0) {
        // Expansive walkable sandy beach shoreline (5m wide at Y = 0)
        return { topY: 0, type: 'SAND' };
      } else if (distIntoWater < 10.0) {
        // Wide shallow sandy seabed & sandbars (5m wide at Y = -1)
        return { topY: -1, type: 'SAND' };
      } else if (distIntoWater < 15.0) {
        // Deepening continental shelf
        return { topY: -2, type: 'STONE' };
      } else {
        // Deep ocean trench floor for large ships
        return { topY: -3, type: 'STONE' };
      }
    }
    // 6. Zone 2: Sunspire Village (Center & NE) - Pure lush green grass blocks!
    // Gentle rolling meadow with subtle natural undulations
    const rollingHills = 0.2 * Math.sin(x * 0.12) * Math.cos(z * 0.12);
    const topY = Math.round(1.0 + rollingHills);
    return { topY: Math.max(1, topY), type: 'GRASS' };
  }

  /**
   * Builds the entire 70x70 Minecraft Voxel Terrain using high-performance InstancedMeshes
   */
  public static buildVoxelTerrain(dioramaGroup: THREE.Group): void {
    this.voxelGrid.clear();

    // 1. Generate PBR Procedural Voxel Textures
    const texGrassTop = this.createGrassTopTexture();
    const texGrassSide = this.createGrassSideTexture();
    const texDirt = this.createDirtTexture();
    const texSand = this.createSandTexture();
    const texStone = this.createStoneTexture();
    const texWood = this.createWoodPlankTexture();

    // 2. Setup Multi-material for Minecraft Grass Block
    // Face order: +X, -X, +Y (Top), -Y (Bottom), +Z, -Z
    const matGrassSide = new THREE.MeshStandardMaterial({
      map: texGrassSide,
      roughness: 0.85,
      metalness: 0.05,
    });
    const matGrassTop = new THREE.MeshStandardMaterial({
      map: texGrassTop,
      roughness: 0.85,
      metalness: 0.05,
    });
    const matDirt = new THREE.MeshStandardMaterial({
      map: texDirt,
      roughness: 0.9,
      metalness: 0.05,
    });
    const grassBlockMaterials = [matGrassSide, matGrassSide, matGrassTop, matDirt, matGrassSide, matGrassSide];

    // Single materials for other uniform blocks
    const matSand = new THREE.MeshStandardMaterial({ map: texSand, roughness: 0.9, metalness: 0.0 });
    const matStone = new THREE.MeshStandardMaterial({ map: texStone, roughness: 0.8, metalness: 0.1 });
    const matWood = new THREE.MeshStandardMaterial({ map: texWood, roughness: 0.7, metalness: 0.1 });

    // Standard 1m x 1m x 1m cube geometry
    const cubeGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);

    // Lists of transformation matrices for instancing
    const grassTransforms: THREE.Matrix4[] = [];
    const dirtTransforms: THREE.Matrix4[] = [];
    const sandTransforms: THREE.Matrix4[] = [];
    const stoneTransforms: THREE.Matrix4[] = [];
    const woodTransforms: THREE.Matrix4[] = [];

    // Pre-calculate heights across the 70x70 grid
    const heightMap: number[][] = [];
    const typeMap: BlockType[][] = [];

    const minC = this.MIN_COORD;
    const maxC = this.MAX_COORD;
    const size = maxC - minC + 1; // 71

    for (let xi = 0; xi < size; xi++) {
      heightMap[xi] = [];
      typeMap[xi] = [];
      const worldX = minC + xi;
      for (let zi = 0; zi < size; zi++) {
        const worldZ = minC + zi;
        const cell = this.calculateOrganicHeight(worldX, worldZ);
        heightMap[xi][zi] = cell.topY;
        typeMap[xi][zi] = cell.type;
        this.voxelGrid.set(this.getKey(worldX, worldZ), {
          x: worldX,
          z: worldZ,
          topY: cell.topY,
          type: cell.type,
        });
      }
    }

    const mat = new THREE.Matrix4();

    // Build surface blocks and exposed vertical cliff columns
    for (let xi = 0; xi < size; xi++) {
      const worldX = minC + xi;
      for (let zi = 0; zi < size; zi++) {
        const worldZ = minC + zi;
        const topY = heightMap[xi][zi];
        const type = typeMap[xi][zi];

        // 1. Surface Block at (worldX, topY, worldZ)
        mat.setPosition(worldX, topY, worldZ);
        switch (type) {
          case 'GRASS':
            grassTransforms.push(mat.clone());
            break;
          case 'SAND':
            sandTransforms.push(mat.clone());
            break;
          case 'STONE':
            stoneTransforms.push(mat.clone());
            break;
          case 'WOOD_PLANK':
            woodTransforms.push(mat.clone());
            break;
        }

        // 2. Subsurface filler blocks down cliff sides so terrain is solid
        // Find minimum neighbor height to know how deep to fill
        let minNeighborY = topY;
        const neighbors = [
          [xi - 1, zi],
          [xi + 1, zi],
          [xi, zi - 1],
          [xi, zi + 1],
        ];
        neighbors.forEach(([nxi, nzi]) => {
          if (nxi >= 0 && nxi < size && nzi >= 0 && nzi < size) {
            minNeighborY = Math.min(minNeighborY, heightMap[nxi][nzi]);
          } else {
            // World edge
            minNeighborY = Math.min(minNeighborY, -3);
          }
        });

        // Fill down to minNeighborY with Dirt or Stone
        for (let fillY = topY - 1; fillY >= minNeighborY; fillY--) {
          mat.setPosition(worldX, fillY, worldZ);
          if (fillY <= -1 || type === 'STONE') {
            stoneTransforms.push(mat.clone());
          } else {
            dirtTransforms.push(mat.clone());
          }
        }
      }
    }

    // 3. Instantiate InstancedMeshes (1 draw call per block type!)
    if (grassTransforms.length > 0) {
      const grassMesh = new THREE.InstancedMesh(cubeGeo, grassBlockMaterials, grassTransforms.length);
      grassTransforms.forEach((m, i) => grassMesh.setMatrixAt(i, m));
      grassMesh.instanceMatrix.needsUpdate = true;
      grassMesh.castShadow = true;
      grassMesh.receiveShadow = true;
      dioramaGroup.add(grassMesh);
    }

    if (dirtTransforms.length > 0) {
      const dirtMesh = new THREE.InstancedMesh(cubeGeo, matDirt, dirtTransforms.length);
      dirtTransforms.forEach((m, i) => dirtMesh.setMatrixAt(i, m));
      dirtMesh.instanceMatrix.needsUpdate = true;
      dirtMesh.castShadow = true;
      dirtMesh.receiveShadow = true;
      dioramaGroup.add(dirtMesh);
    }

    if (sandTransforms.length > 0) {
      const sandMesh = new THREE.InstancedMesh(cubeGeo, matSand, sandTransforms.length);
      sandTransforms.forEach((m, i) => sandMesh.setMatrixAt(i, m));
      sandMesh.instanceMatrix.needsUpdate = true;
      sandMesh.receiveShadow = true;
      dioramaGroup.add(sandMesh);
    }

    if (stoneTransforms.length > 0) {
      const stoneMesh = new THREE.InstancedMesh(cubeGeo, matStone, stoneTransforms.length);
      stoneTransforms.forEach((m, i) => stoneMesh.setMatrixAt(i, m));
      stoneMesh.instanceMatrix.needsUpdate = true;
      stoneMesh.castShadow = true;
      stoneMesh.receiveShadow = true;
      dioramaGroup.add(stoneMesh);
    }

    if (woodTransforms.length > 0) {
      const woodMesh = new THREE.InstancedMesh(cubeGeo, matWood, woodTransforms.length);
      woodTransforms.forEach((m, i) => woodMesh.setMatrixAt(i, m));
      woodMesh.instanceMatrix.needsUpdate = true;
      woodMesh.castShadow = true;
      woodMesh.receiveShadow = true;
      dioramaGroup.add(woodMesh);
    }
  }

  /**
   * Returns elevation of top surface of block at (x, z)
   */
  public static getTopElevation(x: number, z: number): number {
    const key = this.getKey(x, z);
    const cell = this.voxelGrid.get(key);
    if (cell) {
      // Top face of a 1.0m block centered at topY is at topY + 0.5
      return cell.topY + 0.5;
    }
    const organic = this.calculateOrganicHeight(x, z);
    return organic.topY + 0.5;
  }

  /**
   * Returns block type at (x, z)
   */
  public static getBlockType(x: number, z: number): BlockType {
    const key = this.getKey(x, z);
    const cell = this.voxelGrid.get(key);
    if (cell) return cell.type;
    return this.calculateOrganicHeight(x, z).type;
  }
}

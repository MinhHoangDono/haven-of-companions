import * as THREE from 'three';
import { VoxelTerrainBuilder, BlockType } from './VoxelTerrainBuilder';
import { PropInstanceDef } from '../../data/propLayoutData';
import { CHARACTER_CONFIGS } from './CharacterMeshBuilder';

export interface ScatterRule {
  asset: string;
  pack: 'props' | 'environment';
  minDistance: number;
  targetCount: number;
  scaleRange: [number, number];
  allowedBlocks: BlockType[];
  elevationRange: [number, number];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export interface ExclusionZone {
  x: number;
  z: number;
  radius: number;
  label?: string;
}

export class ProceduralPropDistributor {
  /**
   * Deterministic Linear Congruential Generator (LCG)
   */
  private static seededRandom(seed: { value: number }): number {
    seed.value = (seed.value * 9301 + 49297) % 233280;
    return seed.value / 233280;
  }

  /**
   * Generates procedurally scattered vegetation, rocks, and environmental assets.
   * Completely excludes giant overlapping ground patches (patch-grass/foliage),
   * guaranteeing clean, unobstructed village town squares and house grounds.
   */
  public static generateWorldProps(baseSeed = 1337): PropInstanceDef[] {
    const seed = { value: baseSeed };
    const placedProps: PropInstanceDef[] = [];
    const occupied: { x: number; z: number; minR: number }[] = [];

    // =========================================================================
    // 1. Core Exclusion Zones: Houses, Buildings, POIs & Characters
    // Zero rocks, mountains, or trees may spawn within these clearance radii
    // =========================================================================
    const exclusionZones: ExclusionZone[] = [
      // Major Interactive Points of Interest & Open Plaza
      { x: 1.5, z: -1.0, radius: 7.0, label: 'Town Center Open Plaza (Protected Ground)' },
      { x: 5.5, z: -2.5, radius: 5.5, label: 'Central Town Fountain' },
      { x: -15.5, z: -14.5, radius: 5.0, label: 'Highland Campsite Stew Cauldron' },
      { x: 13.0, z: -2.5, radius: 4.0, label: 'Fireworks Mortar Battery' },
      { x: 6.5, z: 6.0, radius: 4.5, label: 'Tatami Tea Pavilion' },
      { x: 19.5, z: 9.5, radius: 4.0, label: 'Tide Shrine Sea Bell' },
      { x: 24.0, z: 20.0, radius: 6.5, label: 'Stone Lighthouse Tower' },
      { x: -2.5, z: 12.0, radius: 4.5, label: 'Harbor Boardwalk Dock' },

      // Village Buildings & Houses (Strict anti-overlap clearance: no rocks/mountains)
      { x: 1.5, z: -16.5, radius: 7.0, label: 'Tavern & Guildhall Courtyard' },
      { x: 15.5, z: -14.0, radius: 5.8, label: 'Village Cottage A1' },
      { x: 22.0, z: -11.0, radius: 5.8, label: 'Village Cottage B1' },
      { x: 14.0, z: -6.5, radius: 5.8, label: 'Village Cottage A2' },
      { x: 24.0, z: -5.0, radius: 5.8, label: 'Village Cottage B2' },
      { x: 11.0, z: -23.0, radius: 6.5, label: 'Blacksmith Forge' },
      { x: 25.0, z: -23.0, radius: 7.5, label: 'Cathedral & Churchyard' },
      { x: 30.0, z: -14.0, radius: 6.5, label: 'Hillside Windmill' },
      { x: 1.2, z: -8.5, radius: 4.5, label: 'Market Stall West' },
      { x: 9.5, z: -8.5, radius: 4.5, label: 'Market Stall East' },
      { x: 9.5, z: -13.5, radius: 4.5, label: 'Market Stall North' },
    ];

    // Add exclusion zones around all 9 companion starting positions
    Object.values(CHARACTER_CONFIGS).forEach((cfg) => {
      exclusionZones.push({ x: cfg.posX, z: cfg.posZ, radius: 2.4, label: `Companion ${cfg.model}` });
    });

    // Populate occupied registry with core buildings so procedural items never collide
    exclusionZones.forEach((zone) => {
      occupied.push({ x: zone.x, z: zone.z, minR: zone.radius });
    });

    // =========================================================================
    // 2. Biome Scattering Rules across the 70x70 World
    // Notice: Giant patch-grass/patch-grass-foliage ground slabs are REMOVED!
    // Only small 3D discrete props (trees, rocks, small grass blade tufts) are used.
    // =========================================================================
    const scatterRules: ScatterRule[] = [
      // -----------------------------------------------------------------------
      // A. HIGHLANDS MOUNTAINS & CRAGS (NW Quadrant: Widely spaced across X: -34..-8, Z: -34..-8)
      // -----------------------------------------------------------------------
      {
        asset: 'mountain_A_grass_trees.gltf',
        pack: 'props',
        minDistance: 11.0, // Wide spacing prevents crowding
        targetCount: 4,
        scaleRange: [2.6, 3.2],
        allowedBlocks: ['STONE', 'GRASS'],
        elevationRange: [3.5, 5.5],
        bounds: { minX: -34, maxX: -10, minZ: -34, maxZ: -10 },
      },
      {
        asset: 'mountain_B_grass_trees.gltf',
        pack: 'props',
        minDistance: 11.0,
        targetCount: 3,
        scaleRange: [2.5, 3.0],
        allowedBlocks: ['STONE', 'GRASS'],
        elevationRange: [3.5, 5.5],
        bounds: { minX: -34, maxX: -8, minZ: -34, maxZ: -10 },
      },

      // -----------------------------------------------------------------------
      // B. HIGHLANDS ALPINE PINE FOREST (Evenly spread: minDistance 6.2m)
      // -----------------------------------------------------------------------
      {
        asset: 'trees_A_large.gltf',
        pack: 'props',
        minDistance: 6.2,
        targetCount: 14,
        scaleRange: [3.8, 4.8],
        allowedBlocks: ['GRASS', 'STONE'],
        elevationRange: [2.5, 5.2],
        bounds: { minX: -34, maxX: -6, minZ: -34, maxZ: -5 },
      },
      {
        asset: 'trees_A_medium.gltf',
        pack: 'props',
        minDistance: 5.5,
        targetCount: 12,
        scaleRange: [3.4, 4.2],
        allowedBlocks: ['GRASS', 'STONE'],
        elevationRange: [2.0, 4.8],
        bounds: { minX: -32, maxX: -5, minZ: -32, maxZ: -5 },
      },

      // -----------------------------------------------------------------------
      // C. LIGHTHOUSE PROMONTORY (SE Cape: Open scenic coastal promontory)
      // -----------------------------------------------------------------------
      {
        asset: 'palm-detailed-bend.glb',
        pack: 'environment',
        minDistance: 6.8,
        targetCount: 7,
        scaleRange: [2.0, 2.5],
        allowedBlocks: ['GRASS', 'SAND'],
        elevationRange: [0.5, 2.0],
        bounds: { minX: 14, maxX: 34, minZ: 5, maxZ: 33 },
      },
      {
        asset: 'palm-straight.glb',
        pack: 'environment',
        minDistance: 6.5,
        targetCount: 6,
        scaleRange: [1.9, 2.3],
        allowedBlocks: ['GRASS', 'SAND'],
        elevationRange: [0.5, 2.0],
        bounds: { minX: 14, maxX: 34, minZ: 5, maxZ: 33 },
      },
      {
        asset: 'rocks-a.glb',
        pack: 'environment',
        minDistance: 6.0,
        targetCount: 7,
        scaleRange: [1.6, 2.2],
        allowedBlocks: ['GRASS', 'STONE', 'SAND'],
        elevationRange: [0.4, 2.2],
        bounds: { minX: 14, maxX: 34, minZ: 5, maxZ: 33 },
      },
      {
        asset: 'rocks-sand-a.glb',
        pack: 'environment',
        minDistance: 5.5,
        targetCount: 7,
        scaleRange: [1.6, 2.2],
        allowedBlocks: ['SAND', 'GRASS'],
        elevationRange: [0.2, 1.2],
        bounds: { minX: 15, maxX: 34, minZ: 6, maxZ: 33 },
      },
      {
        asset: 'grass.glb', // Small discrete 3D grass tuft (NOT a giant ground slab!)
        pack: 'environment',
        minDistance: 5.0,
        targetCount: 10,
        scaleRange: [1.0, 1.4],
        allowedBlocks: ['GRASS'],
        elevationRange: [0.8, 2.2],
        bounds: { minX: 14, maxX: 34, minZ: 5, maxZ: 33 },
      },

      // -----------------------------------------------------------------------
      // D. VILLAGE MEADOW & OUTSKIRTS (Strictly outside house & plaza exclusion zones)
      // -----------------------------------------------------------------------
      {
        asset: 'tree_single_A.gltf',
        pack: 'props',
        minDistance: 6.0,
        targetCount: 10,
        scaleRange: [3.4, 4.2],
        allowedBlocks: ['GRASS'],
        elevationRange: [1.0, 2.0],
        bounds: { minX: -3, maxX: 33, minZ: -32, maxZ: 1 },
      },
      {
        asset: 'grass-plant.glb', // Tiny discrete wild flower plant
        pack: 'environment',
        minDistance: 5.0,
        targetCount: 12,
        scaleRange: [1.0, 1.4],
        allowedBlocks: ['GRASS'],
        elevationRange: [1.0, 2.0],
        bounds: { minX: -3, maxX: 33, minZ: -30, maxZ: 2 },
      },
      {
        asset: 'rock_single_A.gltf',
        pack: 'props',
        minDistance: 5.5,
        targetCount: 8,
        scaleRange: [1.4, 1.8],
        allowedBlocks: ['GRASS'],
        elevationRange: [1.0, 2.0],
        bounds: { minX: -3, maxX: 33, minZ: -30, maxZ: 2 },
      },

      // -----------------------------------------------------------------------
      // E. COASTLINE BEACH PALMS & SHALLOWS (SW Shoreline)
      // -----------------------------------------------------------------------
      {
        asset: 'palm-bend.glb',
        pack: 'environment',
        minDistance: 6.5,
        targetCount: 6,
        scaleRange: [1.9, 2.3],
        allowedBlocks: ['SAND'],
        elevationRange: [0.2, 0.8],
        bounds: { minX: -26, maxX: 5, minZ: 3, maxZ: 12 },
      },
      {
        asset: 'rocks-sand-b.glb',
        pack: 'environment',
        minDistance: 5.5,
        targetCount: 6,
        scaleRange: [1.5, 2.0],
        allowedBlocks: ['SAND'],
        elevationRange: [0.1, 0.6],
        bounds: { minX: -26, maxX: 5, minZ: 4, maxZ: 14 },
      },
    ];

    // =========================================================================
    // 3. Execute Rejection-Sampled Poisson Scattering
    // =========================================================================
    scatterRules.forEach((rule) => {
      let placed = 0;
      let attempts = 0;
      const maxAttempts = 350;

      while (placed < rule.targetCount && attempts < maxAttempts) {
        attempts++;

        const rx = rule.bounds.minX + this.seededRandom(seed) * (rule.bounds.maxX - rule.bounds.minX);
        const rz = rule.bounds.minZ + this.seededRandom(seed) * (rule.bounds.maxZ - rule.bounds.minZ);

        // Clearance check: Exclusion zones (houses, buildings, POIs, characters, open plaza)
        const insideExclusion = exclusionZones.some(
          (zone) => Math.hypot(rx - zone.x, rz - zone.z) < zone.radius
        );
        if (insideExclusion) continue;

        // Clearance check: Poisson spacing against previously placed objects
        const tooClose = occupied.some(
          (pt) => Math.hypot(rx - pt.x, rz - pt.z) < Math.max(rule.minDistance, pt.minR)
        );
        if (tooClose) continue;

        // Terrain compatibility check
        const blockType = VoxelTerrainBuilder.getBlockType(rx, rz);
        const topY = VoxelTerrainBuilder.getTopElevation(rx, rz);

        if (!rule.allowedBlocks.includes(blockType)) continue;
        if (topY < rule.elevationRange[0] || topY > rule.elevationRange[1]) continue;

        // Surface stability check: reject sheer vertical cliffs to avoid overhang floating
        const neighborY1 = VoxelTerrainBuilder.getTopElevation(rx + 0.6, rz);
        const neighborY2 = VoxelTerrainBuilder.getTopElevation(rx, rz + 0.6);
        if (Math.abs(topY - neighborY1) > 0.75 || Math.abs(topY - neighborY2) > 0.75) continue;

        // Valid spawn point confirmed: compute rotation and scale
        const rotY = this.seededRandom(seed) * Math.PI * 2;
        const scaleVal = THREE.MathUtils.lerp(rule.scaleRange[0], rule.scaleRange[1], this.seededRandom(seed));

        placedProps.push({
          asset: rule.asset,
          pack: rule.pack,
          pos: [Math.round(rx * 10) / 10, topY, Math.round(rz * 10) / 10], // Surface snap
          rot: [0, Math.round(rotY * 100) / 100, 0],
          scale: Math.round(scaleVal * 100) / 100,
        });

        occupied.push({ x: rx, z: rz, minR: rule.minDistance });
        placed++;
      }
    });

    return placedProps;
  }
}

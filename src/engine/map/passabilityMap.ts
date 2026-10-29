import * as THREE from 'three';

export type TilePassability = 'walkable' | 'water' | 'pier' | 'cliff';

export interface PassabilityCell {
  x: number;
  z: number;
  elevation: number;
  type: TilePassability;
}

export class PassabilityGrid {
  private static instance: PassabilityGrid;
  private cells: Map<string, PassabilityCell> = new Map();

  // 50x50 Bounds: X in [-25, 25], Z in [-25, 25]
  public readonly minX = -25;
  public readonly maxX = 25;
  public readonly minZ = -25;
  public readonly maxZ = 25;

  private constructor() {
    this.buildGrid();
  }

  public static getInstance(): PassabilityGrid {
    if (!PassabilityGrid.instance) {
      PassabilityGrid.instance = new PassabilityGrid();
    }
    return PassabilityGrid.instance;
  }

  private getKey(x: number, z: number): string {
    return `${Math.round(x)},${Math.round(z)}`;
  }

  /**
   * Constructs the 50x50 elevation and walkability matrix across 4 diverse biomes:
   * 1. Highlands Mountain Range (NW): Y = 2.0 to 3.8 (Stepped alpine peaks, pine groves, campsite)
   * 2. Sunspire Town Square & Village Districts (NE & Center): Y = 1.0 (Plaza, guildhall, cathedral, market)
   * 3. Vast Ocean Bay (SW): Y = -0.3 to 0.25 (Deep ocean basin, sandy shoreline, boardwalk piers)
   * 4. Outer Lighthouse Promontory (SE): Y = 1.2 (Elevated sea cliff, reef boulders, beacon lighthouse)
   */
  private buildGrid(): void {
    for (let x = -25; x <= 25; x++) {
      for (let z = -25; z <= 25; z++) {
        let elevation = 1.0;
        let type: TilePassability = 'walkable';

        // 1. Zone 1: Highland Mountain Range (North-West)
        if (x <= -4 && z <= 0) {
          if (x <= -12 && z <= -8) {
            elevation = 3.6; // High alpine mountain peak
            type = 'walkable';
          } else if (x <= -8 && z <= -4) {
            elevation = 2.8; // Campsite plateau
            type = 'walkable';
          } else {
            // Hillside terrace slope transitioning down to Plaza
            elevation = 1.8;
            type = 'walkable';
          }
        }
        // 2. Zone 3: Vast Coastal Bay & Ocean (South-West)
        else if (x <= 6 && z >= 2) {
          // Deep ocean water basin
          if (x <= 3 && z >= 6) {
            // Check if on the boardwalk pier walkway
            if (x >= -4 && x <= 0 && z >= 4 && z <= 18) {
              elevation = 0.25;
              type = 'pier'; // Walkable wooden pier over water!
            } else {
              elevation = -0.35;
              type = 'water'; // Deep ocean water: BLOCKED!
            }
          }
          // Sandy beach transition into water
          else if (z >= 2 && z < 6) {
            elevation = 0.2;
            type = 'walkable';
          } else {
            elevation = 0.5;
            type = 'walkable';
          }
        }
        // 3. Zone 4: Outer Lighthouse Promontory (South-East)
        else if (x >= 7 && z >= 2) {
          if (x >= 21 || z >= 21) {
            // Outer reef shallows
            elevation = -0.15;
            type = 'water';
          } else {
            // Elevated stone sea cliff
            elevation = 1.25;
            type = 'walkable';
          }
        }
        // 4. Zone 2: Sunspire Town Square & Village Quarters (Center / North-East)
        else {
          elevation = 1.0;
          type = 'walkable';
        }

        this.cells.set(this.getKey(x, z), { x, z, elevation, type });
      }
    }
  }

  /**
   * Returns true if target coordinate is walkable land or a boardwalk pier
   */
  public isWalkable(x: number, z: number): boolean {
    const key = this.getKey(x, z);
    const cell = this.cells.get(key);
    if (!cell) return false;
    return cell.type === 'walkable' || cell.type === 'pier';
  }

  /**
   * Returns elevation at coordinate (x, z)
   */
  public getElevationAt(x: number, z: number): number {
    const key = this.getKey(x, z);
    const cell = this.cells.get(key);
    return cell ? cell.elevation : 1.0;
  }

  /**
   * Clamps target destination to valid walkable ground, strictly preventing walking into deep ocean water
   */
  public clampToWalkable(targetX: number, targetZ: number): THREE.Vector3 {
    const clampedX = THREE.MathUtils.clamp(targetX, this.minX + 1, this.maxX - 1);
    const clampedZ = THREE.MathUtils.clamp(targetZ, this.minZ + 1, this.maxZ - 1);

    if (this.isWalkable(clampedX, clampedZ)) {
      return new THREE.Vector3(clampedX, this.getElevationAt(clampedX, clampedZ), clampedZ);
    }

    // Spiral search for nearest valid walkable tile
    for (let radius = 1; radius <= 16; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (Math.abs(dx) === radius || Math.abs(dz) === radius) {
            const checkX = Math.round(clampedX + dx);
            const checkZ = Math.round(clampedZ + dz);
            if (this.isWalkable(checkX, checkZ)) {
              return new THREE.Vector3(checkX, this.getElevationAt(checkX, checkZ), checkZ);
            }
          }
        }
      }
    }

    return new THREE.Vector3(0, 1.0, 0); // Safe town center fallback
  }
}

export const passabilityGrid = PassabilityGrid.getInstance();

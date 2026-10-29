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

  // 70x70 Bounds: X in [-35, 35], Z in [-35, 35]
  public readonly minX = -35;
  public readonly maxX = 35;
  public readonly minZ = -35;
  public readonly maxZ = 35;

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
   * Constructs the 70x70 elevation and walkability matrix across 4 diverse biomes:
   * 1. Highlands Mountain Range (NW): Y = 2.4 to 4.2 (High alpine peaks, pine groves, campsite)
   * 2. Sunspire Town Square & Village Quarters (NE & Center): Y = 1.0 (Plaza, stone roads, tavern, market)
   * 3. Vast Deep Ocean Bay (SW): Y = -2.8 to 0.25 (Deep ocean basin, sandy shoreline, boardwalk pier)
   * 4. Outer Lighthouse Promontory (SE): Y = 1.3 (Elevated sea cape, lighthouse, coastal grass)
   */
  private buildGrid(): void {
    for (let x = -35; x <= 35; x++) {
      for (let z = -35; z <= 35; z++) {
        let elevation = 1.0;
        let type: TilePassability = 'walkable';
        // Strict boundary check: non-tile void outside diorama bounds is BLOCKED
        if (Math.abs(x) > 31 || Math.abs(z) > 31) {
          elevation = -5.0;
          type = 'cliff';
        }
        // 1. Zone 1: Highland Mountain Range (North-West: X <= -8, Z <= 2)
        else if (x <= -8 && z <= 2) {
          if (x <= -18 && z <= -12) {
            elevation = 4.2; // High alpine mountain peak
            type = 'walkable';
          } else if (x <= -12 && z <= -6) {
            elevation = 3.2; // Campsite plateau
            type = 'walkable';
          } else {
            elevation = 2.0; // Hillside terrace slope
            type = 'walkable';
          }
        }
        // 2. Zone 3: Vast Coastal Bay & Ocean (South-West: X <= 12, Z >= 5)
        else if (x <= 12 && z >= 5) {
          // Wooden boardwalk boat pier: strictly walkable pier over water
          if (x >= -3.8 && x <= -1.2 && z >= 4.5 && z <= 22) {
            elevation = 0.25;
            type = 'pier';
          } else if (z >= 7.5) {
            // Deep ocean water: strictly BLOCKED!
            elevation = -2.5;
            type = 'water';
          } else {
            // Sandy shoreline shallows
            elevation = 0.22;
            type = 'walkable';
          }
        }
        // 3. Zone 4: Outer Lighthouse Promontory (South-East: X >= 12, Z >= 4)
        else if (x >= 12 && z >= 4) {
          if (x >= 28 || z >= 28) {
            elevation = -1.0;
            type = 'water'; // Outer reef shallows: BLOCKED
          } else {
            elevation = 1.35;
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
    if (Math.abs(x) > 31 || Math.abs(z) > 31) return false;
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
    for (let radius = 1; radius <= 20; radius++) {
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

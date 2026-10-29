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

  // 24x24 Bounds: X in [-12, 12], Z in [-12, 12]
  public readonly minX = -12;
  public readonly maxX = 12;
  public readonly minZ = -12;
  public readonly maxZ = 12;

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
   * Constructs the 24x24 elevation and walkability matrix across 4 biomes:
   * 1. Highlands Mountain (NW): Y = 2.4 (High alpine plateau & campsite)
   * 2. Town Square Plaza (NE): Y = 1.0 (Cobblestone plaza & village cottages)
   * 3. Coastal Bay & Ocean (SW): Y = -0.3 to 0.2 (Ocean water & sandy shoreline)
   * 4. Lighthouse Reef (SE): Y = 0.8 (Rocky cliff promontory)
   */
  private buildGrid(): void {
    for (let x = -12; x <= 12; x++) {
      for (let z = -12; z <= 12; z++) {
        let elevation = 1.0;
        let type: TilePassability = 'walkable';

        // 1. Zone 1: Highland Mountain Plateau (North-West)
        if (x <= -2 && z <= -1) {
          if (x <= -4 && z <= -3) {
            elevation = 2.4; // High plateau
            type = 'walkable';
          } else {
            // Slope/terrace transition from Highland down to Plaza
            elevation = 1.7;
            type = 'walkable';
          }
        }
        // 2. Zone 3: Coastal Bay & Ocean (South-West)
        else if (x <= 4 && z >= 2) {
          // Deep ocean water basin
          if (x <= 1 && z >= 5) {
            // Check if on the boardwalk pier walkway
            if (x >= -2 && x <= 0 && z >= 4 && z <= 9) {
              elevation = 0.25;
              type = 'pier'; // Walkable boardwalk over water!
            } else {
              elevation = -0.3;
              type = 'water'; // Deep water: BLOCKED!
            }
          }
          // Sandy beach transition into shallow water
          else if (z >= 2 && z < 5) {
            elevation = 0.15;
            type = 'walkable';
          } else {
            elevation = 0.4;
            type = 'walkable';
          }
        }
        // 3. Zone 4: Outer Lighthouse Promontory (South-East)
        else if (x >= 4 && z >= 3) {
          if (x >= 10 || z >= 10) {
            // Outer reef shallows
            elevation = -0.1;
            type = 'water';
          } else {
            // Elevated stone cape
            elevation = 0.85;
            type = 'walkable';
          }
        }
        // 4. Zone 2: Sunspire Town Square & Plaza (Center / North-East)
        else {
          elevation = 0.95;
          type = 'walkable';
        }

        this.cells.set(this.getKey(x, z), { x, z, elevation, type });
      }
    }
  }

  /**
   * Returns true if target is walkable land or a wooden boardwalk pier
   */
  public isWalkable(x: number, z: number): boolean {
    const key = this.getKey(x, z);
    const cell = this.cells.get(key);
    if (!cell) return false;
    return cell.type === 'walkable' || cell.type === 'pier';
  }

  /**
   * Returns the elevation at coordinate (x, z)
   */
  public getElevationAt(x: number, z: number): number {
    const key = this.getKey(x, z);
    const cell = this.cells.get(key);
    return cell ? cell.elevation : 0.95;
  }

  /**
   * Clamps target destination to valid walkable ground, preventing drowning in water
   */
  public clampToWalkable(targetX: number, targetZ: number): THREE.Vector3 {
    const clampedX = THREE.MathUtils.clamp(targetX, this.minX + 1, this.maxX - 1);
    const clampedZ = THREE.MathUtils.clamp(targetZ, this.minZ + 1, this.maxZ - 1);

    if (this.isWalkable(clampedX, clampedZ)) {
      return new THREE.Vector3(clampedX, this.getElevationAt(clampedX, clampedZ), clampedZ);
    }

    // Spiral search for nearest walkable cell
    for (let radius = 1; radius <= 8; radius++) {
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

    return new THREE.Vector3(0, 0.95, 0); // Safe town center fallback
  }
}

export const passabilityGrid = PassabilityGrid.getInstance();

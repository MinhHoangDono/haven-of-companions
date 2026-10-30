import * as THREE from 'three';
import { VoxelTerrainBuilder } from '../three/VoxelTerrainBuilder';

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
   * Builds the 70x70 elevation and walkability matrix directly driven by VoxelTerrainBuilder blocks
   */
  private buildGrid(): void {
    for (let x = -35; x <= 35; x++) {
      for (let z = -35; z <= 35; z++) {
        const blockType = VoxelTerrainBuilder.getBlockType(x, z);
        const elevation = VoxelTerrainBuilder.getTopElevation(x, z);
        let type: TilePassability = 'walkable';

        if (blockType === 'WOOD_PLANK') {
          type = 'pier'; // Walkable wooden dock
        } else if (elevation <= 0) {
          type = 'water'; // Ocean shallows & deep water: BLOCKED
        } else {
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
    return cell ? cell.elevation : VoxelTerrainBuilder.getTopElevation(x, z);
  }

  /**
   * Marks or unmarks a custom bounding footprint as blocked/walkable
   */
  public markCustomObstacle(minX: number, maxX: number, minZ: number, maxZ: number, blocked: boolean): void {
    for (let x = Math.round(minX); x <= Math.round(maxX); x++) {
      for (let z = Math.round(minZ); z <= Math.round(maxZ); z++) {
        const key = this.getKey(x, z);
        const cell = this.cells.get(key);
        if (cell) {
          if (blocked) {
            cell.type = 'cliff';
          } else {
            const blockType = VoxelTerrainBuilder.getBlockType(x, z);
            const elevation = VoxelTerrainBuilder.getTopElevation(x, z);
            cell.type = elevation <= 0 ? 'water' : blockType === 'WOOD_PLANK' ? 'pier' : 'walkable';
          }
        }
      }
    }
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

    return new THREE.Vector3(0, 1.5, 0); // Safe town center fallback
  }
}

export const passabilityGrid = PassabilityGrid.getInstance();

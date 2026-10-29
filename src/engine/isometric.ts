import { CameraState, GridCoord, ScreenCoord, TileDimensions, BASE_TILE } from '../types/engine';

/**
 * Transforms isometric grid coordinates to screen coordinates.
 */
export function gridToScreen(
  grid: GridCoord,
  camera: Pick<CameraState, 'x' | 'y' | 'zoom'>,
  tile: TileDimensions = BASE_TILE
): ScreenCoord {
  const elev = grid.elevation ?? 0;
  // Isometric dimetric 2:1 transformation
  const worldX = (grid.x - grid.y) * (tile.width / 2);
  const worldY = (grid.x + grid.y) * (tile.height / 2) - elev * (tile.height / 2);

  return {
    x: worldX * camera.zoom + camera.x,
    y: worldY * camera.zoom + camera.y,
  };
}

/**
 * Transforms screen coordinates (e.g. from touch/click) back to grid coordinates (elevation = 0 ground plane).
 */
export function screenToGrid(
  screen: ScreenCoord,
  camera: Pick<CameraState, 'x' | 'y' | 'zoom'>,
  tile: TileDimensions = BASE_TILE
): GridCoord {
  // Undo camera translation and zoom
  const worldX = (screen.x - camera.x) / camera.zoom;
  const worldY = (screen.y - camera.y) / camera.zoom;

  const halfW = tile.width / 2;
  const halfH = tile.height / 2;

  // Solving:
  // worldX = (x - y) * halfW  =>  worldX / halfW = x - y
  // worldY = (x + y) * halfH  =>  worldY / halfH = x + y
  const termA = worldX / halfW;
  const termB = worldY / halfH;

  const gridX = (termA + termB) / 2;
  const gridY = (termB - termA) / 2;

  return {
    x: Math.floor(gridX),
    y: Math.floor(gridY),
    elevation: 0,
  };
}

/**
 * Calculates Y-sort key for back-to-front painter's algorithm.
 */
export function calculateDepthKey(x: number, y: number, elevation: number = 0, layer: number = 0): number {
  return (x + y) * 1000 + elevation * 10 + layer;
}

/**
 * Linear interpolation helper.
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Clamps a number between min and max.
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

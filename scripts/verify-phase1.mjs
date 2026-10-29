import { BASE_TILE } from '../src/types/engine.ts';

function gridToScreen(grid, camera, tile = BASE_TILE) {
  const elev = grid.elevation ?? 0;
  const worldX = (grid.x - grid.y) * (tile.width / 2);
  const worldY = (grid.x + grid.y) * (tile.height / 2) - elev * (tile.height / 2);

  return {
    x: worldX * camera.zoom + camera.x,
    y: worldY * camera.zoom + camera.y,
  };
}

function screenToGrid(screen, camera, tile = BASE_TILE) {
  const worldX = (screen.x - camera.x) / camera.zoom;
  const worldY = (screen.y - camera.y) / camera.zoom;

  const halfW = tile.width / 2;
  const halfH = tile.height / 2;

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

const camera = { x: 400, y: 300, zoom: 1.25 };
const testPoints = [
  { x: 0, y: 0 },
  { x: 10, y: 10 },
  { x: 15, y: 5 },
  { x: 31, y: 31 },
];

let allPassed = true;
for (const pt of testPoints) {
  const screen = gridToScreen(pt, camera);
  // screen center of the diamond tile
  const screenCenter = {
    x: screen.x + (BASE_TILE.width / 2) * camera.zoom * 0, // origin is top center vertex
    y: screen.y + (BASE_TILE.height / 2) * camera.zoom,
  };
  const roundtrip = screenToGrid(screenCenter, camera);
  const match = roundtrip.x === pt.x && roundtrip.y === pt.y;
  console.log(`Point (${pt.x}, ${pt.y}) -> Screen (${screen.x.toFixed(1)}, ${screen.y.toFixed(1)}) -> Unproject (${roundtrip.x}, ${roundtrip.y}) [${match ? 'PASS' : 'FAIL'}]`);
  if (!match) allPassed = false;
}

if (!allPassed) {
  console.error("Coordinate verification FAILED!");
  process.exit(1);
} else {
  console.log("All isometric coordinate transformations PASSED!");
}

import { villageMap } from '../src/data/villageMapData.ts';
import { calculateDepthKey } from '../src/engine/isometric.ts';

console.log(`Verifying Village Map: ${villageMap.width}x${villageMap.height} (${villageMap.tiles.length} tiles)`);

if (villageMap.tiles.length !== 1024) {
  console.error(`Expected 1024 tiles, found ${villageMap.tiles.length}`);
  process.exit(1);
}

const biomesCount = { highlands: 0, plaza: 0, coast: 0 };
for (const tile of villageMap.tiles) {
  biomesCount[tile.biome]++;
}
console.log(`Biomes breakdown: Highlands: ${biomesCount.highlands}, Plaza: ${biomesCount.plaza}, Coast: ${biomesCount.coast}`);

console.log(`Total props loaded: ${villageMap.props.length}`);
for (const prop of villageMap.props) {
  const depth = calculateDepthKey(prop.x, prop.y, prop.elevation);
  if (depth < 0) {
    console.error(`Invalid depth key for prop ${prop.id}`);
    process.exit(1);
  }
}

console.log(`Phase 2 Map & Biome validation PASSED!`);

import { VillageMap, TileData, PropData, TileType, BiomeType } from '../types/map';

const MAP_SIZE = 32;

function generateVillageMap(): VillageMap {
  const tiles: TileData[] = [];
  const props: PropData[] = [];

  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      let type: TileType = 'plaza_cobble';
      let biome: BiomeType = 'plaza';
      let elevation = 0;

      // Deterministic pseudo-random variation
      const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const variation = Math.floor(Math.abs(seed) % 4);

      // 1. Highland Region (North-West)
      if (x <= 14 && y <= 15) {
        biome = 'highlands';
        type = (x + y < 6) ? 'alpine_dirt' : 'highland_grass';
        // Elevated rolling hills
        if (x < 9 && y < 9) {
          elevation = (x < 5 && y < 5) ? 2 : 1;
        } else {
          elevation = 1;
        }
      }
      // 2. Coastal & Ocean Region (South)
      else if (y >= 18) {
        biome = 'coast';
        if (y === 18 || y === 19) {
          type = 'sand';
          elevation = 0;
        } else if (y >= 20 && y <= 24) {
          // Wooden piers extending out
          if (x >= 12 && x <= 20) {
            type = 'wood_pier';
            elevation = 0.5;
          } else {
            type = 'shallow_water';
            elevation = -0.2;
          }
        } else {
          type = 'deep_water';
          elevation = -0.4;
        }
      }
      // 3. Sunspire Plaza Region (Center / East)
      else {
        biome = 'plaza';
        type = (x >= 17 && x <= 25 && y >= 5 && y <= 13) ? 'plaza_stone' : 'plaza_cobble';
        elevation = 0.5;
      }

      tiles.push({ x, y, elevation, type, biome, variation });
    }
  }

  // --- Add Thematic Environmental Props ---

  // 1. Highland Haven Props (Da Lat Pine Hills & Campsite)
  props.push({
    id: 'prop-camp-tent',
    type: 'camp_tent',
    x: 5,
    y: 6,
    elevation: 1,
    biome: 'highlands',
  });

  props.push({
    id: 'prop-campfire-stew',
    type: 'campfire_stew',
    x: 6,
    y: 7,
    elevation: 1,
    biome: 'highlands',
  });

  props.push({
    id: 'prop-druid-altar',
    type: 'druid_altar',
    x: 8,
    y: 4,
    elevation: 1,
    biome: 'highlands',
  });

  props.push({
    id: 'prop-ranger-easel',
    type: 'ranger_easel',
    x: 10,
    y: 5,
    elevation: 1,
    biome: 'highlands',
  });

  // Pine trees scattered across the highlands
  const pineCoords = [
    { x: 1, y: 1 }, { x: 3, y: 2 }, { x: 7, y: 1 }, { x: 2, y: 7 },
    { x: 4, y: 9 }, { x: 11, y: 2 }, { x: 12, y: 8 }, { x: 1, y: 12 },
    { x: 7, y: 12 }, { x: 13, y: 13 }, { x: 2, y: 4 },
  ];
  pineCoords.forEach((pt, i) => {
    props.push({
      id: `prop-pine-${i}`,
      type: i % 3 === 0 ? 'pine_tree_large' : 'pine_tree_small',
      x: pt.x,
      y: pt.y,
      elevation: (pt.x < 5 && pt.y < 5) ? 2 : 1,
      biome: 'highlands',
    });
  });

  // 2. Sunspire Plaza Props (New Year & Festival Vibe)
  props.push({
    id: 'prop-sunspire-base',
    type: 'sunspire_base',
    x: 21,
    y: 8,
    elevation: 0.5,
    biome: 'plaza',
  });

  props.push({
    id: 'prop-fireworks-mortar',
    type: 'fireworks_mortar',
    x: 24,
    y: 7,
    elevation: 0.5,
    biome: 'plaza',
  });

  props.push({
    id: 'prop-market-stall-1',
    type: 'market_stall',
    x: 17,
    y: 9,
    elevation: 0.5,
    biome: 'plaza',
  });

  props.push({
    id: 'prop-market-stall-2',
    type: 'market_stall',
    x: 25,
    y: 11,
    elevation: 0.5,
    biome: 'plaza',
  });

  props.push({
    id: 'prop-antique-chest',
    type: 'antique_relic_chest',
    x: 19,
    y: 12,
    elevation: 0.5,
    biome: 'plaza',
  });

  // Lantern posts around plaza
  const lanternCoords = [
    { x: 16, y: 6 }, { x: 26, y: 6 }, { x: 16, y: 14 }, { x: 26, y: 14 }
  ];
  lanternCoords.forEach((pt, i) => {
    props.push({
      id: `prop-lantern-${i}`,
      type: 'festival_lantern',
      x: pt.x,
      y: pt.y,
      elevation: 0.5,
      biome: 'plaza',
    });
  });

  // 3. Coastal Harbor & Tide Haven Props (Nha Trang Bay Vibe)
  props.push({
    id: 'prop-tatami-pavilion',
    type: 'tatami_pavilion',
    x: 8,
    y: 19,
    elevation: 0,
    biome: 'coast',
  });

  props.push({
    id: 'prop-harbor-armory',
    type: 'harbor_armory',
    x: 18,
    y: 19,
    elevation: 0,
    biome: 'coast',
  });

  props.push({
    id: 'prop-moored-boat',
    type: 'moored_boat',
    x: 19,
    y: 24,
    elevation: -0.1,
    biome: 'coast',
  });

  props.push({
    id: 'prop-tide-shrine',
    type: 'tide_shrine',
    x: 25,
    y: 21,
    elevation: 0,
    biome: 'coast',
  });

  props.push({
    id: 'prop-sea-bell',
    type: 'sea_bell',
    x: 26,
    y: 20,
    elevation: 0,
    biome: 'coast',
  });

  // Dock pillars
  [13, 16, 19].forEach((x, i) => {
    props.push({
      id: `prop-dock-pillar-${i}`,
      type: 'wooden_dock_pillar',
      x,
      y: 23,
      elevation: 0.5,
      biome: 'coast',
    });
  });

  return {
    width: MAP_SIZE,
    height: MAP_SIZE,
    tiles,
    props,
  };
}

export const villageMap = generateVillageMap();

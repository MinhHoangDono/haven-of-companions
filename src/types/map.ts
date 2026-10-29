export type BiomeType = 'highlands' | 'plaza' | 'coast';

export type TileType =
  | 'highland_grass'
  | 'alpine_dirt'
  | 'plaza_cobble'
  | 'plaza_stone'
  | 'sand'
  | 'shallow_water'
  | 'deep_water'
  | 'wood_pier';

export interface TileData {
  x: number;
  y: number;
  elevation: number;
  type: TileType;
  biome: BiomeType;
  variation?: number;
}

export type PropType =
  // Highlands
  | 'pine_tree_large'
  | 'pine_tree_small'
  | 'camp_tent'
  | 'campfire_stew'
  | 'druid_altar'
  | 'ranger_easel'
  | 'wild_mushrooms'
  // Plaza
  | 'sunspire_base'
  | 'market_stall'
  | 'fireworks_mortar'
  | 'festival_lantern'
  | 'antique_relic_chest'
  // Coast
  | 'tatami_pavilion'
  | 'wooden_dock_pillar'
  | 'moored_boat'
  | 'harbor_armory'
  | 'tide_shrine'
  | 'sea_bell';

export interface PropData {
  id: string;
  type: PropType;
  x: number;
  y: number;
  elevation: number;
  scale?: number;
  rotation?: number;
  biome: BiomeType;
}

export interface VillageMap {
  width: number;
  height: number;
  tiles: TileData[];
  props: PropData[];
}

import { InteractiveTargetType } from '../types/threeEngine';
export type AssetPackCategory = 'props' | 'environment' | 'characters';

export interface PropInstanceDef {
  id?: string;
  asset: string; // Filename in /assets/models/props/ or /environment/
  pack: AssetPackCategory; // 'props' or 'environment'
  pos: [number, number, number]; // [x, y, z]
  rot?: [number, number, number]; // [rotX, rotY, rotZ] in radians
  scale?: number | [number, number, number];
  interactive?: {
    id: string;
    type: InteractiveTargetType;
  };
}

/**
 * Creates a cozy wooden boat pier row with smaller, neatly proportioned 1.0x scale segments
 */
function createPierRow(startX: number, startY: number, startZ: number, count: number): PropInstanceDef[] {
  const row: PropInstanceDef[] = [];
  for (let i = 0; i < count; i++) {
    row.push({
      asset: 'structure-platform-dock.glb',
      pack: 'environment',
      pos: [startX, startY, startZ + i * 2.8],
      rot: [0, 0, 0],
      scale: 1.0, // Smaller, cozy boat dock scale (was 1.5)
    });
  }
  return row;
}

/**
 * 70x70 Comprehensive World Layout
 * 1. Zone 1: Highlands Mountain Range (NW: X in [-35, -8], Z in [-35, 2])
 * 2. Zone 2: Sunspire Village & Town Districts (NE & Center: X in [-8, 35], Z in [-35, 4])
 * 3. Zone 3: Vast Deep Ocean Bay (SW: X in [-35, 12], Z in [4, 35])
 * 4. Zone 4: Outer Lighthouse Promontory (SE: X in [12, 35], Z in [4, 35])
 */
export const DIORAMA_PROPS: PropInstanceDef[] = [
  // ==========================================
  // ZONE 1: HIGHLANDS MOUNTAIN RANGE (NW)
  // ==========================================
  // Mountain Peaks & Alpine Slopes
  { asset: 'mountain_A_grass_trees.gltf', pack: 'props', pos: [-24.0, 3.8, -24.0], scale: 3.5 },
  { asset: 'mountain_B_grass_trees.gltf', pack: 'props', pos: [-18.0, 3.8, -28.0], rot: [0, 1.2, 0], scale: 3.2 },
  { asset: 'mountain_A_grass_trees.gltf', pack: 'props', pos: [-28.0, 3.8, -16.0], rot: [0, -0.8, 0], scale: 3.0 },

  // Dense Pine Forests
  { asset: 'trees_A_large.gltf', pack: 'props', pos: [-14.5, 3.0, -18.5], scale: 4.8 },
  { asset: 'trees_A_large.gltf', pack: 'props', pos: [-20.0, 3.0, -12.0], rot: [0, 0.7, 0], scale: 5.0 },
  { asset: 'trees_A_medium.gltf', pack: 'props', pos: [-10.5, 2.0, -14.0], scale: 4.2 },
  { asset: 'trees_A_medium.gltf', pack: 'props', pos: [-7.5, 2.0, -8.0], rot: [0, 1.5, 0], scale: 4.0 },
  { asset: 'tree_single_A.gltf', pack: 'props', pos: [-16.0, 3.0, -8.5], scale: 4.5 },
  { asset: 'tree_single_A.gltf', pack: 'props', pos: [-5.0, 2.0, -10.5], scale: 3.8 },

  // Campsite & Outdoors Feasting
  { asset: 'tent.gltf', pack: 'props', pos: [-18.5, 3.0, -14.0], rot: [0, 0.4, 0], scale: 2.2 },
  { asset: 'resource_lumber.gltf', pack: 'props', pos: [-13.0, 3.0, -12.0], scale: 2.0 },
  { asset: 'weaponrack.gltf', pack: 'props', pos: [-16.5, 3.0, -17.0], rot: [0, 1.57, 0], scale: 1.8 },
  { asset: 'crate_open.gltf', pack: 'props', pos: [-12.5, 3.0, -16.0], scale: 1.8 },
  { asset: 'barrel.gltf', pack: 'props', pos: [-14.0, 3.0, -16.8], scale: 1.8 },
  { asset: 'target.gltf', pack: 'props', pos: [-10.0, 2.0, -17.0], rot: [0, -0.4, 0], scale: 2.0 },

  // Highlands Small Rocks & Grass Patches
  { asset: 'rock_single_A.gltf', pack: 'props', pos: [-11.0, 3.0, -11.0], scale: 2.2 },
  { asset: 'rock_single_B.gltf', pack: 'props', pos: [-17.0, 3.0, -10.5], scale: 1.8 },
  { asset: 'patch-grass-foliage.glb', pack: 'environment', pos: [-14.0, 3.0, -13.0], scale: 2.5 },
  { asset: 'patch-grass.glb', pack: 'environment', pos: [-12.0, 2.0, -7.5], scale: 2.2 },

  // ==========================================
  // ZONE 2: SUNSPIRE VILLAGE & TOWN DISTRICTS (Center & NE)
  // ==========================================
  // Grand Tavern & Guildhall Courtyard (North Quarter)
  { asset: 'building_tavern_yellow.gltf', pack: 'props', pos: [1.5, 1.05, -16.5], rot: [0, 0.2, 0], scale: 4.8 },
  { asset: 'barrel.gltf', pack: 'props', pos: [5.2, 1.05, -14.2], scale: 1.8 },
  { asset: 'barrel.gltf', pack: 'props', pos: [5.6, 1.05, -13.5], scale: 1.6 },
  { asset: 'crate_open.gltf', pack: 'props', pos: [-1.8, 1.05, -13.5], scale: 1.8 },
  { asset: 'wheelbarrow.gltf', pack: 'props', pos: [4.0, 1.05, -17.5], rot: [0, 0.8, 0], scale: 2.0 },

  // Village Residential Cottages
  { asset: 'building_home_A_yellow.gltf', pack: 'props', pos: [15.5, 1.05, -14.0], rot: [0, -0.3, 0], scale: 4.2 },
  { asset: 'building_home_B_yellow.gltf', pack: 'props', pos: [22.0, 1.05, -11.0], rot: [0, -0.7, 0], scale: 4.0 },
  { asset: 'building_home_A_yellow.gltf', pack: 'props', pos: [14.0, 1.05, -6.5], rot: [0, 0.1, 0], scale: 4.0 },
  { asset: 'building_home_B_yellow.gltf', pack: 'props', pos: [24.0, 1.05, -5.0], rot: [0, -0.5, 0], scale: 3.8 },
  { asset: 'building_blacksmith_yellow.gltf', pack: 'props', pos: [11.0, 1.05, -23.0], rot: [0, 0.0, 0], scale: 4.5 },

  // Sacred Cathedral & Church Grounds (Far North-East)
  { asset: 'building_church_yellow.gltf', pack: 'props', pos: [25.0, 1.05, -23.0], rot: [0, -0.2, 0], scale: 5.2 },
  { asset: 'resource_stone.gltf', pack: 'props', pos: [20.5, 1.05, -23.5], scale: 2.2 },

  // Hillside Scenic Windmill (East Village Ridge)
  { asset: 'building_windmill_yellow.gltf', pack: 'props', pos: [30.0, 1.05, -14.0], rot: [0, -0.8, 0], scale: 4.8 },

  // Market Square Stalls & Bazaar Quarter (Along Market Lane)
  { asset: 'building_market_yellow.gltf', pack: 'props', pos: [1.2, 1.05, -8.5], rot: [0, 1.57, 0], scale: 2.8 },
  { asset: 'building_market_yellow.gltf', pack: 'props', pos: [9.5, 1.05, -8.5], rot: [0, -1.57, 0], scale: 2.8 },
  { asset: 'building_market_yellow.gltf', pack: 'props', pos: [9.5, 1.05, -13.5], rot: [0, -1.57, 0], scale: 2.8 },

  // Village Greenery, Grassy Lawns & Flowerbed Patches
  { asset: 'patch-grass.glb', pack: 'environment', pos: [18.0, 1.05, -13.0], scale: 3.0 },
  { asset: 'patch-grass-foliage.glb', pack: 'environment', pos: [13.0, 1.05, -10.0], scale: 2.5 },
  { asset: 'grass-patch.glb', pack: 'environment', pos: [21.0, 1.05, -8.0], scale: 2.8 },
  { asset: 'patch-grass-foliage.glb', pack: 'environment', pos: [23.5, 1.05, -17.0], scale: 2.6 },
  { asset: 'grass.glb', pack: 'environment', pos: [8.5, 1.05, -4.5], scale: 2.2 },
  { asset: 'grass-plant.glb', pack: 'environment', pos: [2.5, 1.05, -4.5], scale: 2.0 },
  { asset: 'patch-grass.glb', pack: 'environment', pos: [27.0, 1.05, -11.0], scale: 2.6 },

  // Village Small Roadside Rocks & Stone Borders
  { asset: 'rock_single_A.gltf', pack: 'props', pos: [8.5, 1.05, -3.2], scale: 1.5 },
  { asset: 'rock_single_B.gltf', pack: 'props', pos: [14.0, 1.05, -3.2], scale: 1.6 },
  { asset: 'rock_single_C.gltf', pack: 'props', pos: [20.0, 1.05, -3.2], scale: 1.4 },
  { asset: 'rock_single_D.gltf', pack: 'props', pos: [2.0, 1.05, -3.2], scale: 1.5 },
  { asset: 'rock_single_E.gltf', pack: 'props', pos: [4.0, 1.05, -11.0], scale: 1.4 },
  { asset: 'rocks-a.glb', pack: 'environment', pos: [17.5, 1.05, -15.5], scale: 1.6 },
  { asset: 'rocks-b.glb', pack: 'environment', pos: [12.0, 1.05, -8.0], scale: 1.5 },

  // Village Shade Trees & Gardens
  { asset: 'tree_single_A.gltf', pack: 'props', pos: [18.0, 1.05, -16.5], scale: 4.2 },
  { asset: 'tree_single_A.gltf', pack: 'props', pos: [11.5, 1.05, -15.0], scale: 4.0 },
  { asset: 'tree_single_A.gltf', pack: 'props', pos: [28.0, 1.05, -8.0], scale: 4.5 },
  { asset: 'trees_A_medium.gltf', pack: 'props', pos: [28.0, 1.05, -19.0], scale: 4.2 },

  // ==========================================
  // ZONE 3: VAST DEEP OCEAN BAY (SW)
  // ==========================================
  // Deep Ocean Ships & Fleet
  { asset: 'ship-pirate-large.glb', pack: 'environment', pos: [-16.0, 0.1, 18.0], rot: [0, 0.55, 0], scale: 1.5 },
  { asset: 'ship-medium.glb', pack: 'environment', pos: [-24.0, 0.1, 11.0], rot: [0, -0.4, 0], scale: 1.4 },
  { asset: 'ship-wreck.glb', pack: 'environment', pos: [-26.0, -0.8, 25.0], rot: [0.15, 0.7, -0.2], scale: 1.6 },
  { asset: 'boat-row-large.glb', pack: 'environment', pos: [-4.8, 0.1, 14.5], rot: [0, 1.57, 0], scale: 1.4 },
  { asset: 'boat-row-small.glb', pack: 'environment', pos: [-0.5, 0.1, 18.0], rot: [0, -1.2, 0], scale: 1.3 },

  // Coastal Defense & Harbor Props
  { asset: 'cannon-mobile.glb', pack: 'environment', pos: [-1.2, 0.25, 4.2], rot: [0, 3.14, 0], scale: 1.3 },
  { asset: 'cannon.glb', pack: 'environment', pos: [-4.0, 0.25, 4.2], rot: [0, 3.0, 0], scale: 1.3 },
  { asset: 'cannon-ball.glb', pack: 'environment', pos: [-2.2, 0.25, 4.0], scale: 1.2 },
  { asset: 'chest.glb', pack: 'environment', pos: [-3.2, 0.25, 6.2], rot: [0, 0.4, 0], scale: 1.2 },

  // Cozy Narrow Boardwalk Pier Platform Walkway (Scale: 1.0)
  ...createPierRow(-2.5, 0.25, 5.5, 6),

  // Coastal Beach Palms & Shallows Rocks
  { asset: 'palm-detailed-bend.glb', pack: 'environment', pos: [-10.5, 0.22, 4.5], rot: [0, 0.6, 0], scale: 2.2 },
  { asset: 'palm-straight.glb', pack: 'environment', pos: [-16.0, 0.22, 4.8], rot: [0, -0.3, 0], scale: 2.0 },
  { asset: 'palm-bend.glb', pack: 'environment', pos: [1.5, 0.22, 5.0], rot: [0, 1.2, 0], scale: 2.0 },
  { asset: 'rocks-sand-a.glb', pack: 'environment', pos: [-12.5, 0.1, 7.5], scale: 2.0 },
  { asset: 'rocks-sand-b.glb', pack: 'environment', pos: [-8.0, 0.05, 9.0], scale: 1.8 },
  { asset: 'rocks-sand-c.glb', pack: 'environment', pos: [-19.0, 0.05, 8.5], scale: 2.2 },

  // ==========================================
  // ZONE 4: OUTER LIGHTHOUSE PROMONTORY (SE: Green cape with rocks & grass!)
  // ==========================================
  // Massive Stone Lighthouse Beacon
  { asset: 'tower-complete-large.glb', pack: 'environment', pos: [24.0, 1.35, 20.0], scale: 2.5 },
  { asset: 'tower-watch.glb', pack: 'environment', pos: [18.0, 1.35, 24.0], scale: 2.0 },
  { asset: 'structure-fence.glb', pack: 'environment', pos: [20.0, 1.35, 14.0], rot: [0, 1.57, 0], scale: 1.4 },
  { asset: 'flag-high.glb', pack: 'environment', pos: [26.0, 1.35, 15.0], scale: 2.0 },

  // Lush Green Coastal Grass Variety on the Promontory
  { asset: 'patch-grass.glb', pack: 'environment', pos: [18.0, 1.35, 16.0], scale: 2.8 },
  { asset: 'patch-grass-foliage.glb', pack: 'environment', pos: [21.5, 1.35, 17.5], scale: 2.6 },
  { asset: 'grass-patch.glb', pack: 'environment', pos: [26.5, 1.35, 18.0], scale: 2.5 },
  { asset: 'patch-grass.glb', pack: 'environment', pos: [21.0, 1.35, 23.0], scale: 2.7 },
  { asset: 'grass-plant.glb', pack: 'environment', pos: [16.5, 1.35, 20.0], scale: 2.2 },
  { asset: 'grass.glb', pack: 'environment', pos: [27.0, 1.35, 23.0], scale: 2.0 },
  { asset: 'patch-sand-foliage.glb', pack: 'environment', pos: [24.0, 1.35, 25.5], scale: 2.2 },

  // Small Rocks & Coastal Boulders on the Promontory
  { asset: 'rocks-a.glb', pack: 'environment', pos: [16.0, 1.35, 15.0], scale: 1.8 },
  { asset: 'rocks-b.glb', pack: 'environment', pos: [27.0, 1.35, 14.5], scale: 1.7 },
  { asset: 'rocks-c.glb', pack: 'environment', pos: [19.0, 1.35, 26.0], scale: 2.0 },
  { asset: 'rock_single_A.gltf', pack: 'props', pos: [21.0, 1.35, 19.5], scale: 1.6 },
  { asset: 'rock_single_C.gltf', pack: 'props', pos: [26.0, 1.35, 21.5], scale: 1.5 },
  { asset: 'rocks-sand-a.glb', pack: 'environment', pos: [29.0, 0.2, 22.0], scale: 2.2 },
  { asset: 'rocks-sand-b.glb', pack: 'environment', pos: [30.0, 0.2, 16.0], scale: 2.0 },

  // Tropical Cape Palms
  { asset: 'palm-detailed-bend.glb', pack: 'environment', pos: [16.5, 1.35, 17.5], rot: [0, 0.4, 0], scale: 2.2 },
  { asset: 'palm-straight.glb', pack: 'environment', pos: [28.5, 1.35, 17.5], scale: 2.0 },
  { asset: 'palm-bend.glb', pack: 'environment', pos: [25.0, 1.35, 26.0], rot: [0, -0.6, 0], scale: 2.2 },
];

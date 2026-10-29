export type AssetPackCategory = 'props' | 'environment' | 'characters';

export interface PropInstanceDef {
  id?: string;
  asset: string;                        // Filename in /assets/models/props/ or /environment/
  pack: AssetPackCategory;              // 'props' or 'environment'
  pos: [number, number, number];        // [X, Y, Z] world position
  rot?: [number, number, number];       // [RotX, RotY, RotZ] in radians
  scale?: number | [number, number, number];
  interactive?: {
    id: string;
    type: 'stew_pot' | 'sea_bell' | 'fireworks_mortar' | 'tea_pavilion';
  };
}

/**
 * Helper to generate straight wooden boardwalk pier segments across the expanded bay
 */
export function createPierRow(
  startX: number,
  startZ: number,
  count: number,
  axis: 'x' | 'z',
  step: number = 2.4,
  elevation: number = 0.25
): PropInstanceDef[] {
  const row: PropInstanceDef[] = [];
  for (let i = 0; i < count; i++) {
    row.push({
      asset: 'structure-platform-dock.glb',
      pack: 'environment',
      pos: [
        axis === 'x' ? startX + i * step : startX,
        elevation,
        axis === 'z' ? startZ + i * step : startZ,
      ],
      rot: [0, axis === 'x' ? Math.PI / 2 : 0, 0],
      scale: 1.5,
    });
  }
  return row;
}

/**
 * Master declarative layout for the 50x50 diorama world.
 * Buildings and trees are scaled to authentic RPG proportions (~4-5x height of characters).
 */
export const DIORAMA_PROPS: PropInstanceDef[] = [
  // ==========================================
  // ZONE 1: HIGHLAND MOUNTAIN RANGE (NW: X: -25 to -4, Z: -25 to 0)
  // ==========================================
  // Towering Alpine Peaks & Mountain Escarpments
  { asset: 'mountain_A_grass_trees.gltf', pack: 'props', pos: [-20.5, 3.6, -20.5], scale: 3.5 },
  { asset: 'mountain_B_grass_trees.gltf', pack: 'props', pos: [-12.5, 3.2, -22.0], scale: 3.2 },
  { asset: 'mountain_A_grass_trees.gltf', pack: 'props', pos: [-22.0, 3.0, -12.5], scale: 3.0 },

  // Dense Pine Forests (Scale 5.0 - 5.8 gives 5m tall pine canopy!)
  { asset: 'trees_A_large.gltf', pack: 'props', pos: [-18.5, 2.8, -14.5], scale: 5.5 },
  { asset: 'trees_A_large.gltf', pack: 'props', pos: [-11.0, 2.8, -16.5], scale: 5.2 },
  { asset: 'trees_A_medium.gltf', pack: 'props', pos: [-7.5, 2.4, -18.5], scale: 4.8 },
  { asset: 'trees_A_medium.gltf', pack: 'props', pos: [-16.0, 2.8, -6.5], scale: 4.5 },
  { asset: 'tree_single_A.gltf', pack: 'props', pos: [-5.5, 1.8, -6.0], scale: 4.2 },
  { asset: 'tree_single_A.gltf', pack: 'props', pos: [-9.5, 2.4, -4.5], scale: 4.0 },

  // Campsite Tents & Lumber Works
  { asset: 'tent.gltf', pack: 'props', pos: [-16.5, 2.8, -17.5], rot: [0, Math.PI * 0.25, 0], scale: 2.6 },
  { asset: 'resource_lumber.gltf', pack: 'props', pos: [-13.5, 2.8, -17.8], rot: [0, -0.4, 0], scale: 2.2 },
  { asset: 'weaponrack.gltf', pack: 'props', pos: [-17.5, 2.8, -13.5], rot: [0, Math.PI * 0.5, 0], scale: 2.0 },
  { asset: 'crate_open.gltf', pack: 'props', pos: [-12.5, 2.8, -14.0], rot: [0, 0.3, 0], scale: 1.8 },
  { asset: 'barrel.gltf', pack: 'props', pos: [-13.8, 2.8, -14.2], scale: 1.8 },

  // Kenney Highland Watchtower Overlook
  { asset: 'tower-watch.glb', pack: 'environment', pos: [-21.5, 3.6, -7.5], rot: [0, Math.PI * 0.35, 0], scale: 2.0 },

  // ==========================================
  // ZONE 2: SUNSPIRE TOWN SQUARE & VILLAGE DISTRICTS (NE: X: -3 to 25, Z: -25 to 2)
  // ==========================================
  // 1. Guildhall & Tavern District
  { asset: 'building_tavern_yellow.gltf', pack: 'props', pos: [9.5, 1.0, -15.5], rot: [0, -Math.PI * 0.15, 0], scale: 4.8 },
  { asset: 'barrel.gltf', pack: 'props', pos: [7.2, 1.0, -13.8], scale: 1.8 },
  { asset: 'barrel.gltf', pack: 'props', pos: [7.6, 1.0, -14.2], scale: 1.8 },

  // 2. Cathedral of Hope & Sun Sanctuary
  { asset: 'building_church_yellow.gltf', pack: 'props', pos: [19.0, 1.0, -17.5], rot: [0, -Math.PI * 0.25, 0], scale: 5.2 },

  // 3. Residential Quarter (Cottages)
  { asset: 'building_home_A_yellow.gltf', pack: 'props', pos: [3.5, 1.0, -19.5], rot: [0, Math.PI * 0.1, 0], scale: 4.2 },
  { asset: 'building_home_B_yellow.gltf', pack: 'props', pos: [-1.5, 1.0, -17.5], rot: [0, Math.PI * 0.25, 0], scale: 4.0 },
  { asset: 'building_home_A_yellow.gltf', pack: 'props', pos: [14.5, 1.0, -21.0], rot: [0, -0.2, 0], scale: 4.0 },

  // 4. Market Street Quarter
  { asset: 'building_market_yellow.gltf', pack: 'props', pos: [8.5, 1.0, -7.5], rot: [0, Math.PI * 0.4, 0], scale: 2.8 },
  { asset: 'building_market_yellow.gltf', pack: 'props', pos: [2.5, 1.0, -7.5], rot: [0, Math.PI * 0.35, 0], scale: 2.8 },
  { asset: 'building_blacksmith_yellow.gltf', pack: 'props', pos: [16.5, 1.0, -9.5], rot: [0, -Math.PI * 0.45, 0], scale: 4.0 },
  { asset: 'chest.glb', pack: 'environment', pos: [6.8, 1.0, -8.5], rot: [0, 0.4, 0], scale: 1.5 },

  // 5. Hillside Windmill
  { asset: 'building_windmill_yellow.gltf', pack: 'props', pos: [21.5, 1.0, -7.5], rot: [0, -Math.PI * 0.5, 0], scale: 4.8 },

  // Plaza Trees
  { asset: 'trees_A_medium.gltf', pack: 'props', pos: [-1.5, 1.0, -7.5], scale: 4.5 },
  { asset: 'tree_single_A.gltf', pack: 'props', pos: [12.5, 1.0, -1.5], scale: 4.0 },

  // ==========================================
  // ZONE 3: VAST OCEAN BAY (SW: X: -25 to 6, Z: 2 to 25)
  // ==========================================
  // Flagship Pirate Galleon in Deep Water
  { asset: 'ship-pirate-large.glb', pack: 'environment', pos: [-12.5, -0.3, 16.5], rot: [0, Math.PI * 0.35, 0], scale: 2.2 },

  // Moored Merchant Coastal Trader
  { asset: 'ship-medium.glb', pack: 'environment', pos: [-18.5, -0.3, 11.5], rot: [0, Math.PI * 0.15, 0], scale: 1.8 },

  // Sunken Shipwreck on the Outer Reef
  { asset: 'ship-wreck.glb', pack: 'environment', pos: [-21.5, -0.3, 21.0], rot: [0.1, Math.PI * 0.45, -0.15], scale: 1.8 },

  // Moored Fishing Skiffs
  { asset: 'boat-row-large.glb', pack: 'environment', pos: [-2.5, -0.15, 11.5], rot: [0, -0.2, 0], scale: 1.4 },
  { asset: 'boat-row-small.glb', pack: 'environment', pos: [-5.0, -0.15, 15.0], rot: [0, 0.5, 0], scale: 1.3 },

  // Harbor Coastal Defense Battery
  { asset: 'cannon-mobile.glb', pack: 'environment', pos: [-3.5, 0.25, 6.5], rot: [0, Math.PI * 0.7, 0], scale: 1.6 },
  { asset: 'cannon.glb', pack: 'environment', pos: [-6.5, 0.25, 5.5], rot: [0, Math.PI * 0.65, 0], scale: 1.5 },
  { asset: 'cannon-ball.glb', pack: 'environment', pos: [-3.8, 0.25, 6.0], scale: 1.5 },

  // Tropical Shoreline Palms
  { asset: 'palm-detailed-bend.glb', pack: 'environment', pos: [-15.5, 0.2, 4.5], rot: [0, 1.2, 0], scale: 2.4 },
  { asset: 'palm-straight.glb', pack: 'environment', pos: [-9.5, 0.2, 3.5], scale: 2.0 },
  { asset: 'palm-bend.glb', pack: 'environment', pos: [-19.5, 0.2, 7.5], rot: [0, -0.8, 0], scale: 2.2 },
  { asset: 'palm-straight.glb', pack: 'environment', pos: [1.5, 0.2, 3.5], scale: 1.8 },

  // Long Boardwalk Pier Walkway Network
  ...createPierRow(-2.0, 5.0, 6, 'z', 2.4, 0.25),

  // ==========================================
  // ZONE 4: OUTER LIGHTHOUSE PROMONTORY (SE: X: 7 to 25, Z: 2 to 25)
  // ==========================================
  // Majestic Stone Coastal Beacon Lighthouse (Scale 2.4 gives 12m towering beacon!)
  { asset: 'tower-complete-large.glb', pack: 'environment', pos: [16.5, 1.25, 14.5], scale: 2.4 },
  { asset: 'flag-pirate.glb', pack: 'environment', pos: [16.5, 8.5, 14.5], scale: 2.0 },

  // Wave-Breaker Reef Boulders
  { asset: 'rocks-sand-a.glb', pack: 'environment', pos: [12.5, 0.0, 18.5], scale: 3.2 },
  { asset: 'rocks-sand-b.glb', pack: 'environment', pos: [20.5, 0.0, 12.0], scale: 2.8 },
  { asset: 'rocks-sand-c.glb', pack: 'environment', pos: [15.0, 0.0, 22.0], scale: 3.0 },
  { asset: 'rocks-a.glb', pack: 'environment', pos: [8.5, 0.0, 19.5], scale: 2.5 },

  // Promontory Tropical Palms
  { asset: 'palm-detailed-bend.glb', pack: 'environment', pos: [14.2, 1.25, 10.5], rot: [0, 0.4, 0], scale: 2.2 },
  { asset: 'palm-straight.glb', pack: 'environment', pos: [19.5, 1.25, 11.5], scale: 2.0 },
];

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
    type: 'stew_pot' | 'sea_bell' | 'fireworks_mortar' | 'tea_pavilion';
  };
}

/**
 * 70x70 World Core Architectural Anchors
 * Strictly situated on level, non-mountainous ground with verified clearance:
 * - Village buildings sit at flat lowlands (Y = 1.5), completely clear of mountains and boulders
 * - Highlands campsite sits at Y = 3.5
 * - Ocean fleet floats at Y = 0.1
 * - Lighthouse tower sits at Y = 1.5
 * (All scattered nature, trees, and rocks are handled dynamically by ProceduralPropDistributor)
 */
export const DIORAMA_PROPS: PropInstanceDef[] = [
  // ==========================================
  // ZONE 1: HIGHLANDS CAMPSITE (NW)
  // ==========================================
  { asset: 'tent.gltf', pack: 'props', pos: [-18.5, 3.5, -14.0], rot: [0, 0.4, 0], scale: 2.2 },
  { asset: 'resource_lumber.gltf', pack: 'props', pos: [-13.0, 3.5, -12.0], scale: 2.0 },
  { asset: 'weaponrack.gltf', pack: 'props', pos: [-16.5, 3.5, -17.0], rot: [0, 1.57, 0], scale: 1.8 },
  { asset: 'crate_open.gltf', pack: 'props', pos: [-12.5, 3.5, -16.0], scale: 1.8 },
  { asset: 'barrel.gltf', pack: 'props', pos: [-14.0, 3.5, -16.8], scale: 1.8 },
  { asset: 'target.gltf', pack: 'props', pos: [-10.0, 2.5, -17.0], rot: [0, -0.4, 0], scale: 2.0 },

  // ==========================================
  // ZONE 2: SUNSPIRE VILLAGE BUILDINGS (NE & Center)
  // (Flat ground Y = 1.5, zero rock overlap)
  // ==========================================
  // Grand Tavern & Guildhall Courtyard
  { asset: 'building_tavern_yellow.gltf', pack: 'props', pos: [1.5, 1.5, -16.5], rot: [0, 0.2, 0], scale: 4.8 },
  { asset: 'barrel.gltf', pack: 'props', pos: [5.2, 1.5, -14.2], scale: 1.8 },
  { asset: 'barrel.gltf', pack: 'props', pos: [5.6, 1.5, -13.5], scale: 1.6 },
  { asset: 'crate_open.gltf', pack: 'props', pos: [-1.8, 1.5, -13.5], scale: 1.8 },
  { asset: 'wheelbarrow.gltf', pack: 'props', pos: [4.0, 1.5, -17.5], rot: [0, 0.8, 0], scale: 2.0 },

  // Village Residential Cottages
  { asset: 'building_home_A_yellow.gltf', pack: 'props', pos: [15.5, 1.5, -14.0], rot: [0, -0.3, 0], scale: 4.2 },
  { asset: 'building_home_B_yellow.gltf', pack: 'props', pos: [22.0, 1.5, -11.0], rot: [0, -0.7, 0], scale: 4.0 },
  { asset: 'building_home_A_yellow.gltf', pack: 'props', pos: [14.0, 1.5, -6.5], rot: [0, 0.1, 0], scale: 4.0 },
  { asset: 'building_home_B_yellow.gltf', pack: 'props', pos: [24.0, 1.5, -5.0], rot: [0, -0.5, 0], scale: 3.8 },
  { asset: 'building_blacksmith_yellow.gltf', pack: 'props', pos: [11.0, 1.5, -23.0], rot: [0, 0.0, 0], scale: 4.5 },

  // Sacred Cathedral & Church Grounds
  { asset: 'building_church_yellow.gltf', pack: 'props', pos: [25.0, 1.5, -23.0], rot: [0, -0.2, 0], scale: 5.2 },
  { asset: 'resource_stone.gltf', pack: 'props', pos: [20.5, 1.5, -23.5], scale: 2.2 },

  // Hillside Scenic Windmill
  { asset: 'building_windmill_yellow.gltf', pack: 'props', pos: [30.0, 1.5, -14.0], rot: [0, -0.8, 0], scale: 4.8 },

  // Market Square Stalls & Bazaar Quarter
  { asset: 'building_market_yellow.gltf', pack: 'props', pos: [1.2, 1.5, -8.5], rot: [0, 1.57, 0], scale: 2.8 },
  { asset: 'building_market_yellow.gltf', pack: 'props', pos: [9.5, 1.5, -8.5], rot: [0, -1.57, 0], scale: 2.8 },
  { asset: 'building_market_yellow.gltf', pack: 'props', pos: [9.5, 1.5, -13.5], rot: [0, -1.57, 0], scale: 2.8 },

  // ==========================================
  // ZONE 3: VAST EXPANDED PIRATE BAY & BEACH (SW)
  // ==========================================
  // Deep Ocean Pirate Fleet
  { asset: 'ship-pirate-large.glb', pack: 'environment', pos: [-16.0, 0.1, 18.0], rot: [0, 0.55, 0], scale: 1.5 },
  { asset: 'ship-pirate-medium.glb', pack: 'environment', pos: [-10.0, 0.1, 24.0], rot: [0, -0.85, 0], scale: 1.4 },
  { asset: 'ship-medium.glb', pack: 'environment', pos: [-24.0, 0.1, 11.0], rot: [0, -0.4, 0], scale: 1.4 },
  { asset: 'ship-wreck.glb', pack: 'environment', pos: [-26.0, -0.8, 25.0], rot: [0.15, 0.7, -0.2], scale: 1.6 },
  { asset: 'boat-row-large.glb', pack: 'environment', pos: [-4.8, 0.1, 14.5], rot: [0, 1.57, 0], scale: 1.4 },
  { asset: 'boat-row-large.glb', pack: 'environment', pos: [-14.5, 0.4, 7.8], rot: [0, 0.25, 0], scale: 1.4 },

  // Pirate Flags & Lookouts
  { asset: 'flag-pirate-high.glb', pack: 'environment', pos: [-2.5, 0.5, 4.0], scale: 2.2 },
  { asset: 'flag-pirate.glb', pack: 'environment', pos: [-16.5, 1.5, 2.2], scale: 1.8 },
  { asset: 'flag-pirate.glb', pack: 'environment', pos: [-8.0, 1.5, 1.8], scale: 1.7 },
  { asset: 'tower-watch.glb', pack: 'environment', pos: [-19.5, 1.5, 2.5], scale: 2.2 },

  // Coastal Pirate Artillery & Beach Fortifications
  { asset: 'cannon-mobile.glb', pack: 'environment', pos: [-1.2, 0.5, 4.2], rot: [0, 3.14, 0], scale: 1.3 },
  { asset: 'cannon.glb', pack: 'environment', pos: [-4.0, 0.5, 4.2], rot: [0, 3.0, 0], scale: 1.3 },
  { asset: 'cannon-ball.glb', pack: 'environment', pos: [-2.2, 0.5, 4.0], scale: 1.2 },
  { asset: 'cannon.glb', pack: 'environment', pos: [-7.5, 1.5, 1.8], rot: [0, 3.2, 0], scale: 1.4 },
  { asset: 'cannon-ball.glb', pack: 'environment', pos: [-7.0, 1.5, 1.6], scale: 1.2 },
  { asset: 'cannon-mobile.glb', pack: 'environment', pos: [-13.5, 1.5, 1.8], rot: [0, 2.9, 0], scale: 1.4 },
  { asset: 'cannon-ball.glb', pack: 'environment', pos: [-14.2, 1.5, 1.6], scale: 1.2 },
  { asset: 'structure-fence.glb', pack: 'environment', pos: [-15.5, 1.5, 2.8], rot: [0, 1.2, 0], scale: 1.4 },
  { asset: 'structure-fence.glb', pack: 'environment', pos: [-9.0, 1.5, 2.6], rot: [0, -1.0, 0], scale: 1.4 },

  // Buried Treasure, Smuggler Rum & Booty
  { asset: 'chest.glb', pack: 'environment', pos: [-3.2, 0.5, 6.2], rot: [0, 0.4, 0], scale: 1.2 },
  { asset: 'chest.glb', pack: 'environment', pos: [-6.5, 1.5, 1.4], rot: [0, 0.5, 0], scale: 1.3 },
  { asset: 'tool-shovel.glb', pack: 'environment', pos: [-6.0, 1.5, 1.6], rot: [0.25, 0, 0.3], scale: 1.6 },
  { asset: 'chest.glb', pack: 'environment', pos: [-11.5, 0.5, 6.8], rot: [0, -0.6, 0], scale: 1.2 },
  { asset: 'crate-bottles.glb', pack: 'environment', pos: [-4.6, 0.5, 5.2], scale: 1.6 },
  { asset: 'crate-bottles.glb', pack: 'environment', pos: [-8.2, 0.5, 7.0], scale: 1.5 },
  { asset: 'bottle-large.glb', pack: 'environment', pos: [-3.8, 0.5, 5.4], scale: 1.4 },
  { asset: 'bottle-large.glb', pack: 'environment', pos: [-7.6, 0.5, 6.6], scale: 1.4 },
  { asset: 'platform-planks.glb', pack: 'environment', pos: [-5.2, 0.45, 6.0], rot: [0, 1.57, 0], scale: 1.3 },
  { asset: 'platform-planks.glb', pack: 'environment', pos: [-9.8, 0.45, 7.2], rot: [0, 0.8, 0], scale: 1.3 },

  // Beach Reef Rocks & Coastal Palms
  { asset: 'palm-detailed-bend.glb', pack: 'environment', pos: [-5.5, 1.5, 1.2], rot: [0, 0.8, 0], scale: 2.4 },
  { asset: 'palm-bend.glb', pack: 'environment', pos: [-10.8, 0.5, 5.8], rot: [0, 1.4, 0], scale: 2.3 },
  { asset: 'palm-straight.glb', pack: 'environment', pos: [-17.5, 1.5, 1.8], scale: 2.2 },
  { asset: 'rocks-sand-a.glb', pack: 'environment', pos: [-13.5, 0.2, 8.5], scale: 2.4 },
  { asset: 'rocks-sand-b.glb', pack: 'environment', pos: [-18.5, 0.1, 12.0], scale: 2.2 },
  { asset: 'rocks-sand-c.glb', pack: 'environment', pos: [-22.0, 0.1, 16.0], scale: 2.5 },
  { asset: 'rocks-sand-a.glb', pack: 'environment', pos: [-28.0, 0.1, 22.0], scale: 2.8 },

  // ==========================================
  // ZONE 4: OUTER LIGHTHOUSE PROMONTORY (SE)
  // ==========================================
  { asset: 'tower-complete-large.glb', pack: 'environment', pos: [24.0, 1.5, 20.0], scale: 2.5 },
  { asset: 'tower-watch.glb', pack: 'environment', pos: [18.0, 1.5, 24.0], scale: 2.0 },
  { asset: 'structure-fence.glb', pack: 'environment', pos: [20.0, 1.5, 14.0], rot: [0, 1.57, 0], scale: 1.4 },
  { asset: 'flag-high.glb', pack: 'environment', pos: [26.0, 1.5, 15.0], scale: 2.0 },
];

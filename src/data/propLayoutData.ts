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
 * Helper to generate straight wooden boardwalk pier segments in one line
 */
export function createPierRow(
  startX: number,
  startZ: number,
  count: number,
  axis: 'x' | 'z',
  step: number = 2.0,
  elevation: number = 0.2
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
    });
  }
  return row;
}

/**
 * Master declarative layout for the 24x24 diorama.
 * Copy and paste rows to instantly add or duplicate objects!
 */
export const DIORAMA_PROPS: PropInstanceDef[] = [
  // ==========================================
  // ZONE 1: HIGHLAND MOUNTAIN PLATEAU (NW)
  // ==========================================
  // KayKit Alpine Mountain Crags & High Pine Forest
  { asset: 'mountain_A_grass_trees.gltf', pack: 'props', pos: [-10.5, 2.4, -10.5], scale: 1.35 },
  { asset: 'mountain_B_grass_trees.gltf', pack: 'props', pos: [-5.5, 2.4, -11.0], scale: 1.2 },
  { asset: 'trees_A_large.gltf', pack: 'props', pos: [-8.5, 2.4, -6.5], scale: 1.2 },
  { asset: 'trees_A_medium.gltf', pack: 'props', pos: [-4.2, 2.4, -9.5], scale: 1.1 },
  { asset: 'tree_single_A.gltf', pack: 'props', pos: [-3.0, 2.4, -5.2], scale: 1.0 },

  // Campsite Tent & Clutter
  { asset: 'tent.gltf', pack: 'props', pos: [-7.5, 2.4, -8.0], rot: [0, Math.PI * 0.25, 0], scale: 1.2 },
  { asset: 'resource_lumber.gltf', pack: 'props', pos: [-6.2, 2.4, -8.8], rot: [0, -0.4, 0] },
  { asset: 'weaponrack.gltf', pack: 'props', pos: [-8.8, 2.4, -7.5], rot: [0, Math.PI * 0.5, 0] },
  { asset: 'barrel.gltf', pack: 'props', pos: [-6.5, 2.4, -7.2] },
  { asset: 'crate_open.gltf', pack: 'props', pos: [-6.0, 2.4, -6.8], rot: [0, 0.3, 0] },

  // Kenney Watchtower Overlook
  { asset: 'tower-watch.glb', pack: 'environment', pos: [-10.5, 2.4, -4.5], rot: [0, Math.PI * 0.35, 0], scale: 1.1 },

  // ==========================================
  // ZONE 2: SUNSPIRE TOWN SQUARE & PLAZA (NE)
  // ==========================================
  // KayKit Medieval Buildings
  { asset: 'building_tavern_yellow.gltf', pack: 'props', pos: [5.5, 1.0, -8.5], rot: [0, -Math.PI * 0.15, 0], scale: 1.25 },
  { asset: 'building_church_yellow.gltf', pack: 'props', pos: [9.2, 1.0, -6.5], rot: [0, -Math.PI * 0.25, 0], scale: 1.2 },
  { asset: 'building_home_A_yellow.gltf', pack: 'props', pos: [2.5, 1.0, -9.5], rot: [0, Math.PI * 0.1, 0], scale: 1.1 },
  { asset: 'building_home_B_yellow.gltf', pack: 'props', pos: [-0.8, 1.0, -9.2], rot: [0, Math.PI * 0.2, 0], scale: 1.05 },
  { asset: 'building_market_yellow.gltf', pack: 'props', pos: [4.2, 1.0, -3.8], rot: [0, Math.PI * 0.4, 0], scale: 1.15 },
  { asset: 'building_blacksmith_yellow.gltf', pack: 'props', pos: [8.5, 1.0, -1.8], rot: [0, -Math.PI * 0.45, 0], scale: 1.1 },
  { asset: 'building_windmill_yellow.gltf', pack: 'props', pos: [10.5, 1.0, -9.8], rot: [0, -Math.PI * 0.5, 0], scale: 1.15 },

  // Plaza Clutter & Chests
  { asset: 'chest.glb', pack: 'environment', pos: [3.2, 1.0, -4.5], rot: [0, 0.4, 0] },
  { asset: 'barrel.gltf', pack: 'props', pos: [5.0, 1.0, -4.2] },
  { asset: 'barrel.gltf', pack: 'props', pos: [4.8, 1.0, -4.6] },

  // ==========================================
  // ZONE 3: COASTAL BAY & HARBOR (SW)
  // ==========================================
  // Kenney Flagship Pirate Galleon in Deep Water
  { asset: 'ship-pirate-large.glb', pack: 'environment', pos: [-6.5, -0.15, 8.5], rot: [0, Math.PI * 0.35, 0], scale: 1.3 },
  // Coastal Trader vessel
  { asset: 'ship-medium.glb', pack: 'environment', pos: [-9.5, -0.15, 6.0], rot: [0, Math.PI * 0.2, 0], scale: 1.0 },
  // Moored Fishing Skiff at Pier
  { asset: 'boat-row-large.glb', pack: 'environment', pos: [-1.2, -0.15, 6.8], rot: [0, -0.2, 0] },

  // Coastal Defense Cannon Battery
  { asset: 'cannon-mobile.glb', pack: 'environment', pos: [-1.5, 0.2, 3.8], rot: [0, Math.PI * 0.7, 0] },
  { asset: 'cannon-ball.glb', pack: 'environment', pos: [-1.8, 0.2, 3.4] },

  // Tropical Shoreline Palms
  { asset: 'palm-detailed-bend.glb', pack: 'environment', pos: [-8.5, 0.15, 2.5], rot: [0, 1.2, 0], scale: 1.2 },
  { asset: 'palm-straight.glb', pack: 'environment', pos: [-4.2, 0.15, 1.8], scale: 1.0 },
  { asset: 'palm-bend.glb', pack: 'environment', pos: [-9.8, 0.15, 4.5], rot: [0, -0.8, 0], scale: 1.1 },

  // Boardwalk Pier Walkway (Connects beach to water)
  ...createPierRow(-1.0, 4.0, 4, 'z', 1.8, 0.2),

  // ==========================================
  // ZONE 4: LIGHTHOUSE PROMONTORY (SE)
  // ==========================================
  // Kenney Coastal Stone Beacon Lighthouse
  { asset: 'tower-complete-large.glb', pack: 'environment', pos: [8.5, 0.85, 7.5], scale: 1.35 },
  { asset: 'flag-pirate.glb', pack: 'environment', pos: [8.5, 4.85, 7.5] },

  // Wave-breaker Reef Boulders protecting harbor entrance
  { asset: 'rocks-sand-a.glb', pack: 'environment', pos: [6.5, 0.0, 9.5], scale: 1.5 },
  { asset: 'rocks-sand-b.glb', pack: 'environment', pos: [10.5, 0.0, 6.0], scale: 1.3 },
  { asset: 'rocks-sand-c.glb', pack: 'environment', pos: [8.0, 0.0, 10.8], scale: 1.4 },
  { asset: 'palm-straight.glb', pack: 'environment', pos: [7.2, 0.85, 6.2], scale: 0.9 },
];

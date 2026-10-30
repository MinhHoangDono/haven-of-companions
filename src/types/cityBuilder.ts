export type StructureCategory =
  | 'houses'
  | 'production'
  | 'fortifications'
  | 'decorations'
  | 'nature';

export type BuilderTool = 'place' | 'rotate' | 'demolish';

export interface StructureDefinition {
  id: string;
  name: string;
  description: string;
  category: StructureCategory;
  asset: string; // Filename e.g. 'building_home_A_yellow.gltf'
  pack: 'props' | 'environment';
  footprintWidth: number; // in meters (grid units)
  footprintDepth: number; // in meters (grid units)
  baseElevationOffset: number;
  scale: number;
  iconName: string; // Lucide icon identifier or visual category tag
  tags: string[];
}

export interface PlacedStructure {
  instanceId: string;
  structureId: string;
  gridX: number;
  gridZ: number;
  elevationY: number;
  rotationY: number; // 0, Math.PI/2, Math.PI, 1.5*Math.PI
  placedAt: number;
}

export interface CityLayoutSaveData {
  version: number;
  createdAt: number;
  updatedAt: number;
  mapDimensions: { width: number; depth: number };
  structures: PlacedStructure[];
}

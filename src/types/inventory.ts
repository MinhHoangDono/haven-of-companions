export type ItemCategory = 'weapon' | 'offhand' | 'headgear' | 'cape' | 'outfit' | 'consumable' | 'collectible';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type EquipSlot = 'mainWeapon' | 'offhand' | 'headgear' | 'cape' | 'outfit';

export type WieldType =
  | 'one_handed'   // 1H: Daggers, 1H Swords, Rapiers, Wands, Scepters
  | 'two_handed'   // 2H: Greatswords, Scythes, Archmage Staves, Longbows, Polearms
  | 'dual_wield'   // Dual: Paired daggers or twin blades
  | 'offhand_only'; // Offhand: Tower shields, round shields, spellbooks, quivers
export type WeaponArchetype =
  | 'greatsword'
  | 'katana'
  | 'scythe'
  | 'dual_daggers'
  | 'archmage_staff'
  | 'elemental_bow'
  | 'polearm'
  | 'rapier'
  | 'wand'
  | 'mace_scepter'
  | 'shield'
  | 'magic_tome'
  | 'colossal_hammer'
  | 'dual_chakram'
  | 'bardic_lute'
  | 'relic_prism'
  | 'tower_shield';

export type ArmorArchetype =
  | 'heavy_plate'
  | 'martial_gi'
  | 'archmage_robe'
  | 'scout_leathers'
  | 'swashbuckler_tunic'
  | 'tide_vestments'
  | 'civilian_linen'
  | 'adaptive_armor'
  | 'mythic_halo'
  | 'mythic_cloak';

export type ElementType =
  | 'dragon_fire'
  | 'glacial_frost'
  | 'chain_lightning'
  | 'abyssal_void'
  | 'verdant_nature'
  | 'sacred_light'
  | 'tidal_tempest'
  | 'celestial_starlight'
  | 'celestial_void'
  | 'tidal_glacial'
  | 'verdant_sacred'
  | 'void_light'
  | 'prismatic';

export interface WeaponVFXConfig {
  primaryColor?: number;
  emissiveColor?: number;
  emissiveIntensity?: number;
  particleType?: 'sparks' | 'flames' | 'frost_crystals' | 'void_smoke' | 'leaves' | 'water_ripples';
}

export interface GripTransformConfig {
  socket: 'handslot.r' | 'handslot.l' | 'chest' | 'head';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}
export interface ItemStats {
  attack?: number;
  defense?: number;
  magic?: number;
  speed?: number;
  healing?: number;
}

export type ConsumableEffect = 'speed_boost' | 'fireworks' | 'confetti' | 'healing_aura' | 'flower_bloom';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  icon: string; // emoji or icon tag
  description: string;
  lore: string;
  stats?: ItemStats;
  equippable: boolean;
  equipSlot?: EquipSlot;
  modelAsset?: string; // gltf model name or 'proc:wizard_hat', etc.
  weaponType?: WeaponArchetype;
  armorType?: ArmorArchetype;
  wieldType?: WieldType;
  element?: ElementType;
  vfx?: WeaponVFXConfig;
  usable: boolean;
  useEffect?: ConsumableEffect;
  effectDuration?: number; // duration in ms
  quantity: number;
}

export interface CharacterEquipment {
  mainWeapon?: string | null; // Item ID
  offhand?: string | null;    // Item ID
  headgear?: string | null;   // Item ID
  cape?: string | null;       // Item ID
  outfit?: string | null;     // Item ID
}
export type AllCompanionsEquipment = Record<string, CharacterEquipment>;

export interface ActiveBuff {
  id: string;
  type: ConsumableEffect;
  name: string;
  icon: string;
  expiresAt: number;
  speedMultiplier?: number;
}

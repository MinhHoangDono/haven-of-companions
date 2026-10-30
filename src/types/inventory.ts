export type ItemCategory = 'weapon' | 'offhand' | 'headgear' | 'cape' | 'outfit' | 'consumable' | 'collectible';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type EquipSlot = 'mainWeapon' | 'offhand' | 'headgear' | 'cape' | 'outfit';

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

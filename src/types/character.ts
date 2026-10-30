export type FactionType = 'highlands' | 'scholars' | 'vanguard';

export interface CharacterStat {
  label: string;
  value: number;
  max: number;
}

export type AbilityCategory = 'active' | 'ultimate';

export type AbilityEffectType =
  // Active Abilities (9)
  | 'active_seed_of_life'
  | 'active_resonating_arrow'
  | 'active_void_brush'
  | 'active_firework_orb'
  | 'active_guardian_light'
  | 'active_athletic_tempo'
  | 'active_resilient_torrent'
  | 'active_fearless_charge'
  | 'active_serene_wave'
  // Ultimate Abilities (9)
  | 'ult_forest_awakening'
  | 'ult_hymn_of_wilds'
  | 'ult_spatial_masterpiece'
  | 'ult_celestial_nocturne'
  | 'ult_dawn_resurgence'
  | 'ult_infinite_flurry'
  | 'ult_ocean_tsunami'
  | 'ult_party_frenzy'
  | 'ult_passionate_geyser'
  // Legacy backward-compatibility
  | 'nature_bloom'
  | 'aegis_shield'
  | 'firework_burst'
  | 'water_slash'
  | 'eagle_scout'
  | 'lute_hymn'
  | 'dawn_light'
  | 'swashbuckle_coin'
  | 'tidal_wave';

export interface CharacterAbility {
  id: string;
  name: string;
  category: AbilityCategory;
  cooldown: number; // in seconds
  icon: string;
  description: string;
  effectType: AbilityEffectType;
}

export interface CharacterSignatureAbility {
  name: string;
  description: string;
  effectType: AbilityEffectType;
}

export interface CharacterPassive {
  name: string;
  description: string;
  loreAnchor?: string;
  icon?: string;
}
export interface Character {
  id: string;
  name: string;
  nickname: string;
  classTitle: string;
  faction: FactionType;
  factionName: string;
  pronoun: string; // "she/her" etc.
  color: {
    primary: string;
    secondary: string;
    accent: string;
  };
  gridPos: {
    x: number;
    y: number;
    elevation: number;
    facing: 'SW' | 'SE';
  };
  bio: string;
  memoryLandmark?: string;
  memoryBond?: string;
  stats: CharacterStat[];
  dialogue: string[];
  activeAbility: CharacterAbility;
  ultimateAbility: CharacterAbility;
  signatureAbility: CharacterSignatureAbility;
  passives?: CharacterPassive[];
  hopProgress?: number; // 0 to 1 for interactive tap bounce
}

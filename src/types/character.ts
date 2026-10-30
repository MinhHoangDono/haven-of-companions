export type FactionType = 'highlands' | 'scholars' | 'vanguard';

export interface CharacterStat {
  label: string;
  value: number;
  max: number;
}

export interface CharacterSignatureAbility {
  name: string;
  description: string;
  effectType: 'nature_bloom' | 'aegis_shield' | 'firework_burst' | 'water_slash' | 'eagle_scout' | 'lute_hymn' | 'dawn_light' | 'swashbuckle_coin' | 'tidal_wave';
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
  stats: CharacterStat[];
  dialogue: string[];
  signatureAbility: CharacterSignatureAbility;
  passives?: CharacterPassive[];
  hopProgress?: number; // 0 to 1 for interactive tap bounce
}

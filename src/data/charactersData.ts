import { Character } from '../types/character';

export const pilotCharacters: Character[] = [
  {
    id: 'anh-thi-druid',
    name: 'Huỳnh Trần Anh Thi',
    nickname: 'Anh Thi',
    classTitle: 'The Wilderness Druid',
    faction: 'highlands',
    factionName: 'Highland Pathfinders',
    pronoun: 'she/her',
    color: {
      primary: '#32733b',
      secondary: '#4d8a57',
      accent: '#dfa642',
    },
    gridPos: {
      x: 6.2,
      y: 7.2,
      elevation: 1,
      facing: 'SE',
    },
    bio: 'Navigating the misty, pine-forested highlands of Da Lat and setting up camp for hearty outdoor feasts. Thi is deeply attuned to the heartbeat of the forest, crafting herbal infusions and simmering cauldrons of stew that rejuvenate weary travelers.',
    stats: [
      { label: 'Nature Lore', value: 96, max: 100 },
      { label: 'Hearth Stew Mastery', value: 99, max: 100 },
      { label: 'Highland Foraging', value: 94, max: 100 },
      { label: 'Botanical Magic', value: 92, max: 100 },
    ],
    dialogue: [
      'Welcome to our highland hearth! The stew is simmering with fresh mountain herbs.',
      'The cool mist of Da Lat always brings tranquility. Rest your boots by the fire.',
      'Look closely at the pine branches—the forest whispers memories of our grandest adventures.',
      'A warm bowl of broth and good company can cure any fatigue.',
    ],
    signatureAbility: {
      name: 'Verdant Bloom',
      description: 'Summons a circular bloom of wild mountain herbs and emerald light motes.',
      effectType: 'nature_bloom',
    },
  },
  {
    id: 'thanh-phuong-paladin',
    name: 'Phạm Trần Thanh Phương',
    nickname: 'Thanh Phương',
    classTitle: 'The Ronin / Paladin Guardian',
    faction: 'vanguard',
    factionName: 'Vanguard of the Eastern Seas',
    pronoun: 'she/her',
    color: {
      primary: '#264a78',
      secondary: '#3b6ea8',
      accent: '#dfa642',
    },
    gridPos: {
      x: 18.2,
      y: 19.2,
      elevation: 0,
      facing: 'SW',
    },
    bio: 'Celebrating milestones over traditional Japanese banquets and embarking on coastal expeditions across Nha Trang Bay. She stands as the party’s steadfast, honorable protector—unwavering in loyalty and always ready to raise her towering crest shield in defense of her friends.',
    stats: [
      { label: 'Aegis Defense', value: 99, max: 100 },
      { label: 'Honor & Loyalty', value: 100, max: 100 },
      { label: 'Coastal Vigilance', value: 95, max: 100 },
      { label: 'Banquet Protector', value: 98, max: 100 },
    ],
    dialogue: [
      'No storm nor foe shall breach this harbor. Stand proud, companions—I have your back.',
      'The ocean breeze carries the salt of Nha Trang Bay. It reminds me of our journeys.',
      'Once my watch is done, let us share a celebratory feast at the tatami pavilion!',
      'My shield was forged to protect those who matter most.',
    ],
    signatureAbility: {
      name: 'Aegis of the Coast',
      description: 'Raises her towering crest shield, projecting a shimmering barrier of radiant azure protection.',
      effectType: 'aegis_shield',
    },
  },
];

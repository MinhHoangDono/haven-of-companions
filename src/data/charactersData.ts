import { Character } from '../types/character';

export const allCharacters: Character[] = [
  // ==========================================
  // FACTION 1: HIGHLAND PATHFINDERS (Zone 1)
  // ==========================================
  {
    id: 'anh-thi-druid',
    name: 'Huỳnh Trần Anh Thi',
    nickname: 'Anh Thi',
    classTitle: 'The Wilderness Druid',
    faction: 'highlands',
    factionName: 'Highland Pathfinders',
    pronoun: 'she/her',
    color: {
      primary: '#2d6836',
      secondary: '#4d8a57',
      accent: '#dfa642',
    },
    gridPos: {
      x: 6.2,
      y: 7.2,
      elevation: 1,
      facing: 'SE',
    },
    bio: 'Navigating the misty, pine-forested highlands of Da Lat and setting up camp for outdoor feasts. Thi is deeply attuned to the heartbeat of the earth and forest, brewing fragrant herbal infusions and simmering cauldrons of hearty broth that restore all tired travelers.',
    stats: [
      { label: 'Nature Lore', value: 96, max: 100 },
      { label: 'Hearth Stew Mastery', value: 99, max: 100 },
      { label: 'Highland Foraging', value: 94, max: 100 },
      { label: 'Botanical Vitality', value: 92, max: 100 },
    ],
    dialogue: [
      'Welcome to our highland hearth! The stew is simmering with wild mountain herbs.',
      'The cool mist of Da Lat brings peace. Rest your boots by the campfire warmth.',
      'Listen closely—the pine branches whisper tales of our fondest adventures.',
      'A warm bowl of broth and laughter between friends can cure any weariness.',
    ],
    signatureAbility: {
      name: 'Verdant Bloom',
      description: 'Summons a circular bloom of wild mountain herbs and emerald light motes.',
      effectType: 'nature_bloom',
    },
  },
  {
    id: 'phuong-quynh-ranger',
    name: 'Lê Nguyễn Phương Quỳnh',
    nickname: 'Phương Quỳnh',
    classTitle: 'The Elven Ranger',
    faction: 'highlands',
    factionName: 'Highland Pathfinders',
    pronoun: 'she/her',
    color: {
      primary: '#385e38',
      secondary: '#6c8e68',
      accent: '#c0a062',
    },
    gridPos: {
      x: 8.5,
      y: 4.8,
      elevation: 1,
      facing: 'SE',
    },
    bio: 'Blending wild survival across Da Lat with a discerning eye for fine arts and cultural exhibitions. She is the scout who tracks the unseen path ahead, cataloging the realm’s ancient chronicles while keeping her sharp recurve bow ready to defend the party.',
    stats: [
      { label: 'Keen Sight & Tracking', value: 98, max: 100 },
      { label: 'Exhibition Curating', value: 95, max: 100 },
      { label: 'Wilderness Survival', value: 93, max: 100 },
      { label: 'Ancient Lore Knowledge', value: 91, max: 100 },
    ],
    dialogue: [
      'The clifftop offers the finest vantage point in the entire valley.',
      'Survival in the highlands requires patience, sharp eyes, and an appreciation for quiet beauty.',
      'I have scouted the route ahead—it is as breathtaking as an art gallery.',
      'My bow never strays from the mark when protecting our circle.',
    ],
    signatureAbility: {
      name: 'Eagle Eye',
      description: 'Dispatches her scouting hawk, revealing hidden paths with a golden guiding flash.',
      effectType: 'eagle_scout',
    },
  },

  // ==========================================
  // FACTION 2: SCHOLARS OF THE MYSTIC ARTS (Zone 2)
  // ==========================================
  {
    id: 'tram-anh-bard',
    name: 'Trần Nguyễn Trâm Anh',
    nickname: 'Trâm Anh',
    classTitle: 'The Lore Bard',
    faction: 'scholars',
    factionName: 'Scholars of the Mystic Arts',
    pronoun: 'she/her',
    color: {
      primary: '#7a284e',
      secondary: '#a34870',
      accent: '#ffd700',
    },
    gridPos: {
      x: 13.5,
      y: 9.5,
      elevation: 1,
      facing: 'SE',
    },
    bio: 'Constantly exploring cultural exhibitions and gathering ancient artifacts, Trâm Anh is the party’s keeper of history. Ringing in festive celebrations under bursting fireworks, she commands a flair for spellbinding, theatrical musical performances.',
    stats: [
      { label: 'Historical Lore', value: 99, max: 100 },
      { label: 'Stage Presence', value: 97, max: 100 },
      { label: 'Artifact Discovery', value: 93, max: 100 },
      { label: 'Melodic Inspiration', value: 95, max: 100 },
    ],
    dialogue: [
      'Every ancient stone in this village carries a melody waiting to be sung!',
      'Did you see the ancient runes etched into the town fountain? Pure poetic history.',
      'No celebration is complete without music, dramatic flair, and loyal companions.',
      'Let me tune my lute—tonight calls for a ballad of our grandest triumphs!',
    ],
    signatureAbility: {
      name: 'Hymn of Antiquity',
      description: 'Strums her golden lute, releasing shimmering musical notes that inspire all nearby friends.',
      effectType: 'lute_hymn',
    },
  },
  {
    id: 'khai-van-sorcerer',
    name: 'Nguyễn Khải Vạn',
    nickname: 'Khải Vạn',
    classTitle: 'The Pyromancy Sorcerer',
    faction: 'scholars',
    factionName: 'Scholars of the Mystic Arts',
    pronoun: 'he/him',
    color: {
      primary: '#c0392b',
      secondary: '#e67e22',
      accent: '#f39c12',
    },
    gridPos: {
      x: 16.2,
      y: 11.5,
      elevation: 1,
      facing: 'SW',
    },
    bio: 'Ringing in the New Year under bursting fireworks perfectly suits a fire-wielding mage who specializes in lighting up the night sky and providing explosive magical artillery. Khải Vạn pairs fiery enthusiasm with brilliant pyrotechnic craftsmanship.',
    stats: [
      { label: 'Pyromancy Precision', value: 98, max: 100 },
      { label: 'Fireworks Artistry', value: 100, max: 100 },
      { label: 'Explosive Arcana', value: 96, max: 100 },
      { label: 'Festive Energy', value: 94, max: 100 },
    ],
    dialogue: [
      'Careful around the mortar battery—I just upgraded the sparkling propellant!',
      'Why settle for a campfire when we can light up the entire night sky?',
      'New Year fireworks are not just entertainment—they are pure magical art.',
      'Stand back companions, this next spell is going to be spectacular!',
    ],
    signatureAbility: {
      name: 'Grand Pyrotechnic',
      description: 'Launches a shower of multicolored explosive sparks illuminating the town sky.',
      effectType: 'firework_burst',
    },
  },
  {
    id: 'thao-uyen-cleric',
    name: 'Nguyễn Trần Thảo Uyên',
    nickname: 'Thảo Uyên',
    classTitle: 'Cleric of the Light',
    faction: 'scholars',
    factionName: 'Scholars of the Mystic Arts',
    pronoun: 'she/her',
    color: {
      primary: '#d4af37',
      secondary: '#f7e7a9',
      accent: '#ffffff',
    },
    gridPos: {
      x: 11.5,
      y: 13.2,
      elevation: 1,
      facing: 'SW',
    },
    bio: 'The radiant guiding light of the party. Celebrating milestones under New Year fireworks, Thảo Uyên brings boundless hope, warm festive energy, and rejuvenating divine healing magic to the entire circle after a long quest.',
    stats: [
      { label: 'Radiant Healing', value: 99, max: 100 },
      { label: 'Festive Cheer', value: 98, max: 100 },
      { label: 'Guiding Light', value: 97, max: 100 },
      { label: 'Sanctuary Aura', value: 93, max: 100 },
    ],
    dialogue: [
      'May the dawn light wash away your weariness and fill your hearts with hope.',
      'The New Year festival always brings us closer together. I cherish every moment.',
      'Whenever the dark closes in, remember: our bond shines brighter than any torch.',
      'Rest here in the light of the pavilion—you are safe among friends.',
    ],
    signatureAbility: {
      name: 'Dawn Radiance',
      description: 'Channeling divine sunshine, she creates a warm pillar of light that blesses the town plaza.',
      effectType: 'dawn_light',
    },
  },

  // ==========================================
  // FACTION 3: VANGUARD OF THE EASTERN SEAS (Zone 3)
  // ==========================================
  {
    id: 'ngoc-ha-monk',
    name: 'Nguyễn Thị Ngọc Hà',
    nickname: 'Ngọc Hà',
    classTitle: 'Way of the Kensei Monk',
    faction: 'vanguard',
    factionName: 'Vanguard of the Eastern Seas',
    pronoun: 'she/her',
    color: {
      primary: '#16a085',
      secondary: '#1abc9c',
      accent: '#f1c40f',
    },
    gridPos: {
      x: 20.5,
      y: 16.5,
      elevation: 0,
      facing: 'SW',
    },
    bio: 'Celebrating milestones over traditional Japanese feasts and taking coastal journeys down to Nha Trang Bay. Ngọc Hà embodies a disciplined, serene martial artist with a deep, calming connection to the water, balancing martial mastery with the peaceful ceremony of tea.',
    stats: [
      { label: 'Kensei Kata Form', value: 99, max: 100 },
      { label: 'Tea Ceremony Zen', value: 98, max: 100 },
      { label: 'Tidal Discipline', value: 95, max: 100 },
      { label: 'Coastal Insight', value: 92, max: 100 },
    ],
    dialogue: [
      'The mind should be as calm and clear as still coastal water.',
      'Come join me at the tatami bench. I have brewed a fresh kettle of ceremonial matcha.',
      'Discipline is not rigidity; it is flowing with the waves like water carving stone.',
      'In our fellowship, each milestone celebrated makes our spirit stronger.',
    ],
    signatureAbility: {
      name: 'Flowing Water Katas',
      description: 'Executes fluid martial blade slashes accompanied by swirling azure water streams.',
      effectType: 'water_slash',
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
      primary: '#1c3d6e',
      secondary: '#2e5b9a',
      accent: '#dfa642',
    },
    gridPos: {
      x: 18.2,
      y: 19.2,
      elevation: 0,
      facing: 'SW',
    },
    bio: 'Sharing traditional Japanese banquets and coastal voyages along Nha Trang Bay. She acts as the party’s steadfast, honorable protector—unyielding in loyalty, ready to raise her towering crest shield against any tempest or foe.',
    stats: [
      { label: 'Aegis Defense', value: 99, max: 100 },
      { label: 'Honor & Loyalty', value: 100, max: 100 },
      { label: 'Coastal Vigilance', value: 96, max: 100 },
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
  {
    id: 'xuan-minh-rogue',
    name: 'Phạm Xuân Minh',
    nickname: 'Xuân Minh',
    classTitle: 'The Swashbuckler Rogue',
    faction: 'vanguard',
    factionName: 'Vanguard of the Eastern Seas',
    pronoun: 'he/him',
    color: {
      primary: '#2c3e50',
      secondary: '#34495e',
      accent: '#e74c3c',
    },
    gridPos: {
      x: 17.5,
      y: 22.5,
      elevation: 0,
      facing: 'SW',
    },
    bio: 'Always present for high-seas expeditions across Nha Trang Bay. Xuân Minh brings a charismatic, daring, and adventurous spirit required to navigate treacherous tides, negotiate dockside contraband, and duel with lightning-fast rapier flourishes.',
    stats: [
      { label: 'Swashbuckling Agility', value: 99, max: 100 },
      { label: 'Charismatic Wit', value: 97, max: 100 },
      { label: 'High-Seas Navigation', value: 94, max: 100 },
      { label: 'Gold Coin Sleight', value: 96, max: 100 },
    ],
    dialogue: [
      'The high seas belong to those brave enough to seize the helm!',
      'A true pirate never enters a tavern without flipping a shiny gold coin first.',
      'Nha Trang’s coastal winds are favorable today—who is ready for an expedition?',
      'With a keen blade and trustworthy friends, there is no treasure out of reach!',
    ],
    signatureAbility: {
      name: 'Swashbuckler Flourish',
      description: 'Flips a gleaming gold doubloon coin followed by lightning-fast dueling rapier flourishes.',
      effectType: 'swashbuckle_coin',
    },
  },
  {
    id: 'anh-thu-cleric',
    name: 'Lâm Anh Thư',
    nickname: 'Anh Thư',
    classTitle: 'The Ocean Cleric',
    faction: 'vanguard',
    factionName: 'Vanguard of the Eastern Seas',
    pronoun: 'she/her',
    color: {
      primary: '#0984e3',
      secondary: '#74b9ff',
      accent: '#00cec9',
    },
    gridPos: {
      x: 21.8,
      y: 20.2,
      elevation: 0,
      facing: 'SW',
    },
    bio: 'Drawing magic and tranquility from coastal waters. Lâm Anh Thư calls upon the tides of Nha Trang to protect the party during maritime travels, commanding seafoam blessings and soothing the storm with ringing tide bells.',
    stats: [
      { label: 'Tempest Domain Magic', value: 98, max: 100 },
      { label: 'Maritime Serenity', value: 99, max: 100 },
      { label: 'Tidal Protection', value: 96, max: 100 },
      { label: 'Sea Sanctuary Lore', value: 95, max: 100 },
    ],
    dialogue: [
      'The tides ebb and flow, but the bonds between companions remain eternal.',
      'I have blessed the shoreline—may the waters grant you safe harbor and deep rest.',
      'Listen to the sea bell tolling across the bay; it sings of peace and renewal.',
      'Whenever the tempest rises, I will call the tides to shield us.',
    ],
    signatureAbility: {
      name: 'Tidal Embrace',
      description: 'Rings her sacred sea bell, calling forth swirling seafoam water rings and coastal mist.',
      effectType: 'tidal_wave',
    },
  },
];

// Backward-compatible alias for existing imports
export const pilotCharacters = allCharacters;

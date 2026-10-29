---
title: "Phase 1: Asset Audit & Triad Mapping Matrix"
status: pending
priority: P1
effort: 2h
tags: [assets, 3d-models, gltf, kaykit, kenney, audit]
---

# Phase 1: Asset Audit & Triad Mapping Matrix

## 1. Overview

Before writing any 3D rendering code, we establish an authoritative asset mapping matrix for all 9 characters and every environmental feature using the verified three kits on disk:
1. **Characters & Weapons**: `KayKit_Adventurers_2.0_FREE` (Stylized humanoid adventurer classes with authentic armor, tunics, robes, and weapons).
2. **Village Buildings & Highland Nature**: `KayKit_Medieval_Hexagon_Pack_1.0_FREE` (Taverns, homes, church, market, pine trees, mountain peaks, campsite tents).
3. **Coastal Harbor, Ships, Lighthouse & Docks**: `kenney_pirate-kit` (Pirate galleon, rowboats, stone lighthouse tower, wooden dock piers, cannons, tropical palms, and reef boulders).

We also implement `scripts/ingest-game-assets.js` to automatically copy the required `.glb` and `.gltf` + `.bin` files into `public/assets/models/`.

---

## 2. Character Roster 1:1 Mapping (`KayKit_Adventurers_2.0_FREE`)

Source: `KayKit_Adventurers_2.0_FREE/Characters/gltf/` and `Assets/gltf/`

| ID | Friend Name | RPG Class Title | Selected KayKit Avatar | Outfit & Armor | Handheld Weapon & Socket Attachments |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `anh-thi-druid` | **Huỳnh Trần Anh Thi** | Wilderness Druid | `Mage.glb` | Forest Green / Earth Robes | `staff.gltf` with glowing emerald magic orb in right hand |
| `phuong-quynh-ranger` | **Lê Nguyễn Phương Quỳnh** | Elven Ranger | `Ranger.glb` | Hunter Olive Tunic & Cloak | `bow_withString.gltf` in left hand + `quiver.gltf` on back |
| `tram-anh-bard` | **Trần Nguyễn Trâm Anh** | Lore Bard | `Rogue.glb` | Velvet Ruby Entertainer Tunic | Carved golden lute in hands + `dagger.gltf` at hip |
| `khai-van-sorcerer` | **Nguyễn Khải Vạn** | Pyromancy Sorcerer | `Mage.glb` | Crimson Flame Robe | Pointed sorcerer hat + `spellbook_open.gltf` + floating fireball in palm |
| `thao-uyen-cleric` | **Nguyễn Trần Thảo Uyên** | Cleric of the Light | `Knight.glb` / `Mage.glb` | Radiant White & Gold Robe | Floating sun halo disc + `shield_badge_color.gltf` + golden scepter |
| `ngoc-ha-monk` | **Nguyễn Thị Ngọc Hà** | Way of the Kensei Monk | `Barbarian.glb` / `Rogue.glb` | Martial Arts Gi | Black obi belt + dual wooden practice bokken / katanas at hip |
| `thanh-phuong-paladin` | **Phạm Trần Thanh Phương** | Oath of the Vanguard Paladin | `Knight.glb` | Heavy Steel Plate Armor & Helmet | `sword_2handed_color.gltf` + `shield_square_color.gltf` + crescent kabuto crest |
| `xuan-minh-rogue` | **Phạm Xuân Minh** | Swashbuckler Rogue | `Rogue_Hooded.glb` | Hooded Shadow Assassin / Longcoat | `dagger.gltf` in offhand + silver dueling rapier in mainhand |
| `anh-thu-cleric` | **Lâm Anh Thư** | Tidecaller Cleric | `Mage.glb` | Ocean Azure & Seafoam Robes | Coral seashell headdress + sacred tidal bell trident |

---

## 3. Environment & Diorama Prop Mapping

### 3.1 Village & Highlands (`KayKit_Medieval_Hexagon_Pack_1.0_FREE`)
Source: `KayKit_Medieval_Hexagon_Pack_1.0_FREE/KayKit_Medieval_Hexagon_Pack_1.0_FREE/Assets/gltf/`

- **Tavern & Cottages**:
  - `building_tavern_yellow.gltf` (Town Square Guildhall & Tavern)
  - `building_home_A_yellow.gltf` & `building_home_B_yellow.gltf` (Residential village cottages)
  - `building_market_yellow.gltf` (Town Square market stall)
  - `building_blacksmith_yellow.gltf` (Artisan forge)
  - `building_church_yellow.gltf` (Sunspire sanctuary)
  - `building_windmill_yellow.gltf` (Highland windmill)
- **Highland Pine Forests & Mountains**:
  - `trees_A_large.gltf`, `trees_A_medium.gltf`, `tree_single_A.gltf` (Da Lat pine clusters)
  - `mountain_A_grass_trees.gltf`, `mountain_B_grass_trees.gltf` (Mountain crags & peaks)
  - `rock_single_A.gltf` through `rock_single_E.gltf` (Highland boulders)
- **Campsite Props**:
  - `tent.gltf` (Druid & Ranger camp canvas tent)
  - `resource_lumber.gltf`, `weaponrack.gltf`, `barrel.gltf`, `crate_open.gltf`

### 3.2 Harbor, Ships, Lighthouse & Docks (`kenney_pirate-kit`)
Source: `kenney_pirate-kit/Models/GLB format/`

- **Ships & Rowboats**:
  - `ship-pirate-large.glb` (Flagship galleon anchored in western coastal bay)
  - `boat-row-large.glb` & `boat-row-small.glb` (Moored fishing boats at dock)
  - `ship-medium.glb` (Coastal trader vessel)
- **Lighthouse & Watchtowers**:
  - `tower-complete-large.glb` (Coastal stone beacon lighthouse on outer reef promontory)
  - `tower-watch.glb` (Highland overlook watchtower)
- **Docks & Boardwalk Piers**:
  - `structure-platform-dock.glb`, `structure-platform-dock-small.glb`, `structure-fence.glb`
- **Harbor Clutter & Palms**:
  - `cannon-mobile.glb`, `cannon.glb`, `cannon-ball.glb`, `chest.glb`
  - `palm-detailed-bend.glb`, `palm-straight.glb`, `palm-bend.glb`
  - `rocks-sand-a.glb`, `rocks-sand-b.glb`, `rocks-sand-c.glb` (Wave-breaker reef rocks)

---

## 4. Ingestion Automation Script (`scripts/ingest-game-assets.js`)

```javascript
// scripts/ingest-game-assets.js
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const KAYKIT_CHAR_SRC = path.join(ROOT, 'KayKit_Adventurers_2.0_FREE/Characters/gltf');
const KAYKIT_WEAPON_SRC = path.join(ROOT, 'KayKit_Adventurers_2.0_FREE/Assets/gltf');
const KAYKIT_MED_SRC = path.join(ROOT, 'KayKit_Medieval_Hexagon_Pack_1.0_FREE/KayKit_Medieval_Hexagon_Pack_1.0_FREE/Assets/gltf');
const KENNEY_PIRATE_SRC = path.join(ROOT, 'kenney_pirate-kit/Models/GLB format');

const CHAR_DEST = path.join(ROOT, 'public/assets/models/characters');
const PROPS_DEST = path.join(ROOT, 'public/assets/models/props');
const ENV_DEST = path.join(ROOT, 'public/assets/models/environment');

[CHAR_DEST, PROPS_DEST, ENV_DEST].forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

function copyIfExists(srcDir, destDir, filename) {
  const src = path.join(srcDir, filename);
  const dest = path.join(destDir, filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ ${filename}`);
  } else {
    console.warn(`  ✗ Missing: ${src}`);
  }
}

console.log('1. Ingesting KayKit Adventurers Characters...');
['Knight.glb', 'Mage.glb', 'Ranger.glb', 'Rogue.glb', 'Rogue_Hooded.glb', 'Barbarian.glb'].forEach((f) => {
  copyIfExists(KAYKIT_CHAR_SRC, CHAR_DEST, f);
});

console.log('2. Ingesting KayKit Weapon Accessories...');
['staff', 'bow_withString', 'quiver', 'sword_2handed_color', 'shield_square_color', 'shield_badge_color', 'dagger', 'spellbook_open'].forEach((base) => {
  copyIfExists(KAYKIT_WEAPON_SRC, CHAR_DEST, `${base}.gltf`);
  copyIfExists(KAYKIT_WEAPON_SRC, CHAR_DEST, `${base}.bin`);
});

console.log('3. Ingesting KayKit Medieval Buildings & Nature...');
const medBuildings = [
  'building_tavern_yellow', 'building_home_A_yellow', 'building_home_B_yellow',
  'building_church_yellow', 'building_market_yellow', 'building_windmill_yellow'
];
medBuildings.forEach((b) => {
  copyIfExists(path.join(KAYKIT_MED_SRC, 'buildings/yellow'), PROPS_DEST, `${b}.gltf`);
  copyIfExists(path.join(KAYKIT_MED_SRC, 'buildings/yellow'), PROPS_DEST, `${b}.bin`);
});

const medNature = ['trees_A_large', 'trees_A_medium', 'tree_single_A', 'mountain_A_grass_trees', 'tent', 'barrel'];
medNature.forEach((n) => {
  copyIfExists(path.join(KAYKIT_MED_SRC, 'decoration/nature'), PROPS_DEST, `${n}.gltf`);
  copyIfExists(path.join(KAYKIT_MED_SRC, 'decoration/nature'), PROPS_DEST, `${n}.bin`);
  copyIfExists(path.join(KAYKIT_MED_SRC, 'decoration/props'), PROPS_DEST, `${n}.gltf`);
  copyIfExists(path.join(KAYKIT_MED_SRC, 'decoration/props'), PROPS_DEST, `${n}.bin`);
});

console.log('4. Ingesting Kenney Pirate Ships, Lighthouse & Docks...');
const pirateAssets = [
  'ship-pirate-large.glb', 'boat-row-large.glb', 'boat-row-small.glb',
  'tower-complete-large.glb', 'tower-watch.glb',
  'structure-platform-dock.glb', 'structure-platform-dock-small.glb',
  'cannon-mobile.glb', 'chest.glb',
  'palm-detailed-bend.glb', 'palm-straight.glb',
  'rocks-sand-a.glb', 'rocks-sand-b.glb', 'rocks-sand-c.glb'
];
pirateAssets.forEach((p) => copyIfExists(KENNEY_PIRATE_SRC, ENV_DEST, p));

console.log('Asset Ingestion Complete.');
```

---

## 5. Verification Gate

- Run `node scripts/ingest-game-assets.js`.
- Verify all 6 KayKit character GLBs and weapon accessories exist in `public/assets/models/characters/`.
- Verify KayKit tavern, homes, church, market, and pine tree GLTFs exist in `public/assets/models/props/`.
- Verify Kenney pirate galleon, rowboats, lighthouse, docks, and palms exist in `public/assets/models/environment/`.
- Total ingested asset footprint must be $< 2.8\text{ MB}$.

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const KAYKIT_CHAR_SRC = path.join(ROOT, 'KayKit_Adventurers_2.0_FREE/Characters/gltf');
const KAYKIT_WEAPON_SRC = path.join(ROOT, 'KayKit_Adventurers_2.0_FREE/Assets/gltf');
const KAYKIT_TEXTURES_SRC = path.join(ROOT, 'KayKit_Adventurers_2.0_FREE/Textures');
const KAYKIT_ANIM_SRC = path.join(ROOT, 'KayKit_Adventurers_2.0_FREE/Animations/gltf/Rig_Medium');
const KAYKIT_MED_SRC = path.join(ROOT, 'KayKit_Medieval_Hexagon_Pack_1.0_FREE/KayKit_Medieval_Hexagon_Pack_1.0_FREE/Assets/gltf');
const KENNEY_PIRATE_SRC = path.join(ROOT, 'kenney_pirate-kit/Models/GLB format');

const CHAR_DEST = path.join(ROOT, 'public/assets/models/characters');
const PROPS_DEST = path.join(ROOT, 'public/assets/models/props');
const ENV_DEST = path.join(ROOT, 'public/assets/models/environment');
const ENV_TEX_DEST = path.join(ENV_DEST, 'Textures');

[CHAR_DEST, PROPS_DEST, ENV_DEST, ENV_TEX_DEST].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function copyIfExists(srcDir, destDir, filename) {
  const src = path.join(srcDir, filename);
  const dest = path.join(destDir, filename);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ ${filename}`);
    return true;
  } else {
    console.warn(`  ✗ Missing: ${src}`);
    return false;
  }
}

console.log('1. Ingesting KayKit Adventurers Characters...');
['Knight.glb', 'Mage.glb', 'Ranger.glb', 'Rogue.glb', 'Rogue_Hooded.glb', 'Barbarian.glb'].forEach((f) => {
  copyIfExists(KAYKIT_CHAR_SRC, CHAR_DEST, f);
});

console.log('2. Ingesting KayKit Weapon Accessories...');
[
  'staff',
  'bow_withString',
  'quiver',
  'sword_2handed_color',
  'sword_1handed',
  'shield_square_color',
  'shield_badge_color',
  'shield_round_color',
  'dagger',
  'spellbook_open',
  'wand',
  'mug_full'
].forEach((base) => {
  copyIfExists(KAYKIT_WEAPON_SRC, CHAR_DEST, `${base}.gltf`);
  copyIfExists(KAYKIT_WEAPON_SRC, CHAR_DEST, `${base}.bin`);
});

console.log('3. Ingesting KayKit Character Textures...');
[
  'knight_texture.png',
  'mage_texture.png',
  'ranger_texture.png',
  'rogue_texture.png',
  'barbarian_texture.png'
].forEach((t) => {
  copyIfExists(KAYKIT_TEXTURES_SRC, CHAR_DEST, t);
});

console.log('4. Ingesting KayKit Rig_Medium Animations...');
[
  'Rig_Medium_General.glb',
  'Rig_Medium_MovementBasic.glb'
].forEach((a) => {
  copyIfExists(KAYKIT_ANIM_SRC, CHAR_DEST, a);
});

console.log('5. Ingesting KayKit Medieval Buildings & Nature...');
const medBuildings = [
  'building_tavern_yellow',
  'building_home_A_yellow',
  'building_home_B_yellow',
  'building_church_yellow',
  'building_market_yellow',
  'building_blacksmith_yellow',
  'building_windmill_yellow'
];
medBuildings.forEach((b) => {
  copyIfExists(path.join(KAYKIT_MED_SRC, 'buildings/yellow'), PROPS_DEST, `${b}.gltf`);
  copyIfExists(path.join(KAYKIT_MED_SRC, 'buildings/yellow'), PROPS_DEST, `${b}.bin`);
});

const medNature = [
  'trees_A_large',
  'trees_A_medium',
  'tree_single_A',
  'mountain_A_grass_trees',
  'mountain_B_grass_trees',
  'rock_single_A',
  'rock_single_B',
  'rock_single_C',
  'rock_single_D',
  'rock_single_E'
];
medNature.forEach((n) => {
  copyIfExists(path.join(KAYKIT_MED_SRC, 'decoration/nature'), PROPS_DEST, `${n}.gltf`);
  copyIfExists(path.join(KAYKIT_MED_SRC, 'decoration/nature'), PROPS_DEST, `${n}.bin`);
});

const medProps = ['tent', 'barrel', 'resource_lumber', 'resource_stone', 'weaponrack', 'wheelbarrow', 'target', 'crate_open'];
medProps.forEach((p) => {
  copyIfExists(path.join(KAYKIT_MED_SRC, 'decoration/props'), PROPS_DEST, `${p}.gltf`);
  copyIfExists(path.join(KAYKIT_MED_SRC, 'decoration/props'), PROPS_DEST, `${p}.bin`);
});

// KayKit Medieval texture
copyIfExists(
  path.join(ROOT, 'KayKit_Medieval_Hexagon_Pack_1.0_FREE/KayKit_Medieval_Hexagon_Pack_1.0_FREE/Textures'),
  PROPS_DEST,
  'hexagons_medieval.png'
);

console.log('6. Ingesting Kenney Pirate Ships, Lighthouse, Docks, Foliage & Textures...');
copyIfExists(
  path.join(KENNEY_PIRATE_SRC, 'Textures'),
  ENV_TEX_DEST,
  'colormap.png'
);

const pirateAssets = [
  'ship-pirate-large.glb',
  'ship-medium.glb',
  'ship-wreck.glb',
  'boat-row-large.glb',
  'boat-row-small.glb',
  'tower-complete-large.glb',
  'tower-watch.glb',
  'structure-platform-dock.glb',
  'structure-platform-dock-small.glb',
  'structure-fence.glb',
  'cannon-mobile.glb',
  'cannon.glb',
  'cannon-ball.glb',
  'chest.glb',
  'palm-detailed-bend.glb',
  'palm-straight.glb',
  'palm-bend.glb',
  'rocks-sand-a.glb',
  'rocks-sand-b.glb',
  'rocks-sand-c.glb',
  'rocks-a.glb',
  'rocks-b.glb',
  'rocks-c.glb',
  'flag-pirate.glb',
  'flag-high.glb',
  // Foliage & Ground patches
  'patch-grass.glb',
  'patch-grass-foliage.glb',
  'patch-sand.glb',
  'patch-sand-foliage.glb',
  'grass-patch.glb',
  'grass.glb',
  'grass-plant.glb'
];
pirateAssets.forEach((p) => copyIfExists(KENNEY_PIRATE_SRC, ENV_DEST, p));

console.log('Asset Ingestion Complete.');

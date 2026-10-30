---
title: "Phase 8: Elemental Arsenal - Weapons, Armors & Visual FX Customization"
status: todo
priority: P1
effort: 6h
tags: [equipment, weapons, armor, vfx, threejs, procedural-mesh, character-customization]
---

# Phase 8: Elemental Arsenal - Weapons, Armors & Visual FX Customization

## Overview

Expand the companion equipment system with a structured, high-fidelity catalog of **Elemental Weapons** and **Thematic Armors/Outfits**. Each piece of equipment is defined across five core design vectors:
1. **Weapon / Armor Type** (Greatsword, Katana, Scythe, Dual Daggers, Archmage Staff, Elemental Bow, Heavy Plate, Martial Gi, Mage Robe, Scout Leathers, etc.)
2. **Element & VFX Effect** (Chain Lightning, Dragon Fire, Glacial Frost, Abyssal Void, Verdant Bloom, Sacred Radiance, Tidal Tempest, Celestial Starlight)
3. **Base 3D Style & Mesh Strategy** (Enhanced glTF asset from KayKit/Kenney OR all-new procedural Three.js mesh generator)
4. **Color Palette & Lighting Shaders** (Neon emissive tones, dynamic point lights, particle spark emitters, and bloom aura)
5. **Item Details & Lore Anchor** (RPG stats +Công/+Thủ/+Phép/+Tốc, unique Vietnamese lore, friendship memories from Đà Lạt, Sunspire New Year, and Nha Trang Bay)

---

## Technical Specifications & Architecture

### 1. Data Schema Extension (`src/types/inventory.ts`)
```ts
export type WieldType =
  | 'one_handed'  // 1H: Daggers, 1H Swords, Rapiers, Wands, Scepters (permits offhand shield/tome)
  | 'two_handed'  // 2H: Greatswords, Scythes, Archmage Staves, Longbows, Heavy Polearms (occupies both hands)
  | 'dual_wield'  // Dual: Paired daggers or twin swords in hand.r and hand.l
  | 'offhand_only'; // Offhand: Tower shields, round shields, spellbooks, quivers

export type WeaponArchetype =
  | 'greatsword'      // 2H Heavy
  | 'katana'          // 1H / 2H Versatile
  | 'scythe'          // 2H Pole
  | 'dual_daggers'    // Dual Wield
  | 'archmage_staff'  // 2H Magic
  | 'elemental_bow'   // 2H Ranged
  | 'polearm'         // 2H Heavy Trident/Halberd
  | 'rapier'          // 1H Agile
  | 'wand'            // 1H Magic
  | 'mace_scepter'    // 1H Holy
  | 'shield';         // Offhand Defense
export type ArmorArchetype =
  | 'heavy_plate'
  | 'martial_gi'
  | 'archmage_robe'
  | 'scout_leathers'
  | 'swashbuckler_tunic'
  | 'tide_vestments'
  | 'civilian_linen';

export type ElementType =
  | 'dragon_fire'
  | 'glacial_frost'
  | 'chain_lightning'
  | 'abyssal_void'
  | 'verdant_nature'
  | 'sacred_light'
  | 'tidal_tempest'
  | 'celestial_starlight';

export interface WeaponVFXConfig {
  primaryColor: number;
  emissiveColor: number;
  emissiveIntensity: number;
  particleType?: 'sparks' | 'flames' | 'frost_crystals' | 'void_smoke' | 'leaves' | 'water_ripples';
  pointLight?: {
    color: number;
    intensity: number;
    distance: number;
  };
}

export interface GripTransformConfig {
  socket: 'handslot.r' | 'handslot.l' | 'chest' | 'spine';
  wieldType: WieldType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  offhandPose?: {
    socket: 'handslot.l';
    position: [number, number, number];
    rotation: [number, number, number];
  };
}
```

### 2. Handedness & Grip Stance Mechanics (1-Handed vs 2-Handed)

| Wield Type | Hand Grip Socket | Offhand Status | Hand Posing & Stance Transformation |
| :--- | :--- | :--- | :--- |
| **`one_handed` (1H)** | `handslot.r` (or `hand.r`) | **Allowed** (can equip Shield, Tome, or Mug) | Blade points forward/upward ($R_x \approx 0, R_z \approx 0$). Offhand arm remains free to raise a tower shield or hold a grimoire. |
| **`two_handed` (2H Greatsword / Scythe)** | `handslot.r` (Primary) + `handslot.l` (Guiding) | **Locked / Auto-Unequipped** (shield disabled) | Weapon angles diagonally across chest ($R_z \approx -0.15\text{ rad}$, $R_x \approx 0.1\text{ rad}$). Both hands align along the elongated 2-handed hilt, giving a grounded, powerful battle stance. |
| **`two_handed` (2H Archmage Staff / Trident)** | `handslot.r` (Upper Shaft) | **Channeling Stance** | Shaft stands upright vertically ($R_x = -\pi/2$), extending above character's head with core crystal glowing at peak. Offhand channels glowing magic particles. |
| **`two_handed` (2H Elemental Bow)** | `handslot.l` (Grip) + `handslot.r` (Nock & Draw) | **Quiver on Back** | Left arm extends forward holding bow riser vertically ($R_z = \pi/2$), right hand positioned near string nock. Quiver automatically attached to spine/chest. |
| **`dual_wield`** | `handslot.r` + `handslot.l` | **Dual Weapon** | Mirrored twin weapons equipped in both hands with forward/reverse dueling grips. |
| **`offhand_only` (Shields / Tomes)** | `handslot.l` (Forearm bracket) | **N/A** | Shields mount to outer forearm ($R_y = \pi/2$) angled forward to deflect incoming attacks. Spellbooks lie flat in open palm ($R_x = -\pi/2$). |

---

## Detailed Weapon Catalog (The 9 Elemental Archetypes)

### 1. Hỏa Long Phẫn Nộ (Dragonflame Greatsword)
- **1. Weapon Type**: Two-Handed Heavy Greatsword (`greatsword`)
- **2. Element / Effect**: **Dragon Fire** (Hỏa Long Đỏ Lửa) - Ignites blade upon strikes, cleaving through multiple foes with burning trails.
- **3. Base Style**: Procedural 3D Model (`proc:dragonflame_blade`) with faceted fuller, golden winged crossguard, dragon pommel, and runic core.
- **4. Color & Lighting**: Magma crimson (`#dc2626`) and molten gold (`#f59e0b`) with trailing dark smoke embers and 0.8 emissive fiery glow.
- **5. Item Details**:
  - *Belongs to*: **Phạm Trần Thanh Phương** (The Ronin / Paladin)
  - *Lore*: *"Rèn từ vảy rồng lửa cổ xưa trên đỉnh đèo Ngoạn Mục, tỏa ra hơi ấm vững chãi che chở đồng đội trong những đêm sương lạnh."*
  - *RPG Stats*: +65 Tấn Công, +20 Phòng Ngự, +15 Sức Bền.

### 2. Thủy Kính Diệp Băng (Glacial Tide Katana)
- **1. Weapon Type**: Curved Katana (`katana`)
- **2. Element / Effect**: **Glacial Frost & Tidal Flow** (Hàn Băng Thủy Lưu) - Creates chilled crescent air blades, freezing targets on precision hits.
- **3. Base Style**: Procedural 3D Katana (`proc:glacial_katana`) with wrapped tsuka handle, bronze tsuba guard, and wavy temper hamon line.
- **4. Color & Lighting**: Frosted azure (`#38bdf8`) with crystalline white edges, blue ice sheen, and cold steam vapors.
- **5. Item Details**:
  - *Belongs to*: **Nguyễn Thị Ngọc Hà** (Way of the Kensei Monk)
  - *Lore*: *"Thanh bảo đao tôi luyện qua ngàn đợt sóng biển Nha Trang, tĩnh lặng như mặt gương nhưng sắc bén khôn cùng."*
  - *RPG Stats*: +58 Tấn Công, +25 Tốc Độ, +18 Bạo Kích.

### 3. Hư Không Tàn Nguyệt (Abyssal Void Crescent Scythe)
- **1. Weapon Type**: Two-Handed Scythe (`scythe`)
- **2. Element / Effect**: **Abyssal Void** (Hư Không Huyền Bí) - Slices through spatial rifts, pulling wandering astral energies toward the wielder.
- **3. Base Style**: Procedural curved crescent blade (`proc:abyssal_scythe`) mounted on an ebony wood pole with floating runic rings.
- **4. Color & Lighting**: Deep velvet obsidian (`#1e1b4b`) and electric neon violet (`#a855f7`) with swirling gravity distortion sparks.
- **5. Item Details**:
  - *Belongs to*: **Trần Nguyễn Trâm Anh** (The Lore Bard / Antiquity Keeper)
  - *Lore*: *"Thu thập từ tàn tích viện bảo tàng cổ, lưỡi hái ngân vang những giai điệu cổ xưa xóa tan ảo ảnh ma thuật."*
  - *RPG Stats*: +52 Tấn Công, +45 Ma Lực, +15 Kháng Phép.

### 4. Lôi Ảnh Song Chủy (Chain Lightning Dual Daggers)
- **1. Weapon Type**: Paired Dual Daggers (`dual_daggers`)
- **2. Element / Effect**: **Chain Lightning** (Lôi Điện Liên Hoàn) - High-frequency electric arcs jump between targets on rapid stabs.
- **3. Base Style**: Enhanced `dagger.gltf` with custom lightning shaders, dual wield attachment (`handslot.r` and `handslot.l`).
- **4. Color & Lighting**: Electric cyan-blue (`#06b6d4`) with violet crackling arcs (`#8b5cf6`) and bright point light flash on hit.
- **5. Item Details**:
  - *Belongs to*: **Phạm Xuân Minh** (The Swashbuckler Rogue)
  - *Lore*: *"Cặp găm lướt nhanh tựa tia chớp rạch ngang biển đêm, luôn sẵn sàng cho những pha mạo hiểm táo bạo."*
  - *RPG Stats*: +48 Tấn Công, +35 Tốc Độ Di Chuyển, +25 Né Tránh.

### 5. Tinh Tú Diệu Quang (Celestial Starfire Archmage Staff)
- **1. Weapon Type**: Magic Staff (`archmage_staff`)
- **2. Element / Effect**: **Celestial Starlight & Fireworks** (Pháo Hoa Tinh Tú) - Launches arcing firework volleys that burst into colorful cascading embers.
- **3. Base Style**: Enhanced `staff.gltf` and `proc:archmage_staff` with a rotating astrolabe brass armillary sphere and floating core crystal.
- **4. Color & Lighting**: Radiant amber-gold (`#f59e0b`) with multi-colored firework sparks (ruby, emerald, sapphire) and warm radial bloom.
- **5. Item Details**:
  - *Belongs to*: **Nguyễn Khải Văn** (The Pyromancy Sorcerer)
  - *Lore*: *"Linh trượng thắp sáng bầu trời đêm giao thừa, biến mọi trận chiến thành màn pháo hoa rực rỡ sắc màu."*
  - *RPG Stats*: +70 Ma Lực, +30 Sát Thương Lửa, +10 Hồi Năng Lượng.

### 6. Mộc Linh Thần Cung (Verdant Gale Elemental Bow)
- **1. Weapon Type**: Recurve Longbow (`elemental_bow`)
- **2. Element / Effect**: **Verdant Bloom & Wind** (Mộc Sinh Phong Lôi) - Arrows sprout winding briars and blooming wildflowers where they land, entangling foes.
- **3. Base Style**: Enhanced `bow_withString.gltf` wrapped in leafy procedural vines and glowing green runic bow limbs.
- **4. Color & Lighting**: Forest emerald (`#10b981`) with soft golden pollen motes and luminous green glow.
- **5. Item Details**:
  - *Belongs to*: **Lê Nguyễn Phương Quỳnh** (The Elven Ranger)
  - *Lore*: *"Cây cung khắc từ gỗ thông ngàn năm Đà Lạt, từng mũi tên bắn ra mang theo hơi thở tinh khôi của rừng đại ngàn."*
  - *RPG Stats*: +55 Tấn Công Tầm Xa, +22 Tốc Độ, +30 Tầm Bắn.

### 7. Cổ Mộc Sinh Mệnh (Hearth Druid Branch)
- **1. Weapon Type**: Druidic Scepter / Wand (`wand`)
- **2. Element / Effect**: **Verdant Nature & Earth** (Địa Mộc Sinh Sôi) - Emits healing spores and soothing floral mist around the party campfire.
- **3. Base Style**: Procedural knobby hardwood branch (`proc:druid_branch`) crowned with fresh dew blossoms and a glowing amber stone.
- **4. Color & Lighting**: Warm earth jade (`#059669`) and soft golden sunset amber (`#fbbf24`) with floating green leaf particles.
- **5. Item Details**:
  - *Belongs to*: **Huỳnh Trần Anh Thi** (The Wilderness Druid)
  - *Lore*: *"Nhánh cây kết tinh từ tình yêu cây cỏ và khói lửa ấm áp của những bữa tiệc ngoài trời giữa rừng thông sương mù."*
  - *RPG Stats*: +42 Tấn Công, +50 Hồi Phục, +25 Kháng Độc.

### 8. Bình Minh Hy Vọng (Dawn’s Blessing Scepter)
- **1. Weapon Type**: Cleric Scepter & Relic (`mace_scepter`)
- **2. Element / Effect**: **Sacred Radiance** (Thánh Quang Bình Minh) - Casts warm beams of golden sunlight, cleansing status debuffs and providing damage shields.
- **3. Base Style**: Procedural golden sunburst mace (`proc:dawn_scepter`) with revolving filigree rings and an inner sun crystal.
- **4. Color & Lighting**: Warm dawn white-gold (`#fef08a`) with soft lens flare bloom and sparkling sunbeams.
- **5. Item Details**:
  - *Belongs to*: **Nguyễn Trần Thảo Uyên** (Cleric of the Light)
  - *Lore*: *"Quyền trượng đón lấy tia nắng đầu tiên của ngày đầu năm, mang lại niềm tin và sinh lực tràn trề cho cả đoàn phiêu lưu."*
  - *RPG Stats*: +60 Trị Liệu, +35 Ma Lực, +20 Giáp Hộ Mệnh.

### 9. Triều Tịch Hải Vương (Tidecaller Ocean Trident)
- **1. Weapon Type**: Three-Pronged Polearm (`polearm`)
- **2. Element / Effect**: **Tidal Tempest** (Hải Triều Phong Ba) - Calls down tidal water spouts and ocean seafoam barriers.
- **3. Base Style**: Procedural 3-pronged trident (`proc:ocean_trident`) with spiraling water crests and an aquamarine pearl at the nexus.
- **4. Color & Lighting**: Deep sea turquoise (`#0891b2`) and sparkling pearl white with swirling aquatic ripple particles.
- **5. Item Details**:
  - *Belongs to*: **Lâm Anh Thư** (The Ocean Cleric - Tempest Domain)
  - *Lore*: *"Cây đinh ba mang linh hồn của những chuyến tàu vươn khơi Nha Trang, điều khiển ngọn sóng che chở bình yên cho bạn bè."*
  - *RPG Stats*: +54 Tấn Công, +40 Ma Lực Thủy, +20 Phòng Thủ Biển.

---

## Detailed Armor & Outfit Catalog (Thematic Styles)

### 1. Giáp Trụ Thành Trì (Aegis Fortress Heavy Plate)
- **1. Armor Type**: Full Knight Plate Armor (`heavy_plate`)
- **2. Element / Effect**: **Sacred Granite Ward** - Reduces physical impact and forms an impenetrable energy shield when guarding allies.
- **3. Base Style**: Enhanced `Knight.glb` model with polished silver-steel curass, embossed golden lion crest, and reinforced shoulder pauldrons.
- **4. Color & Lighting**: Polished chrome steel (`#cbd5e1`) with radiant golden filigree (`#eab308`) and soft metallic specular reflections.
- **5. Item Details**:
  - *Belongs to*: **Phạm Trần Thanh Phương** (Paladin / Knight)
  - *Stats*: +60 Phòng Ngự Vật Lý, +25 Kháng Đòn, +300 Máu Tối Đa.

### 2. Thao Lược Võ Y (Way of the Flowing Waves Gi)
- **1. Armor Type**: Martial Arts Gi & Hakama (`martial_gi`)
- **2. Element / Effect**: **Water Evasion & Ki Flow** - Fluid fabric that disperses kinetic force and enhances counter-strike agility.
- **3. Base Style**: Procedural linen kimono doublet with dark hakama pleated trousers, black silk obi sash, and embroidered ocean carp motif.
- **4. Color & Lighting**: Deep ocean navy (`#1e3a8a`) and crisp wave-crest white (`#f8fafc`) with subtle fabric weave grain.
- **5. Item Details**:
  - *Belongs to*: **Nguyễn Thị Ngọc Hà** (Kensei Monk)
  - *Stats*: +40 Tốc Độ Di Chuyển, +35 Phòng Ngự, +20 Né Tránh.

### 3. Pháp Bào Tinh Hà (Sunspire Starfire Robes)
- **1. Armor Type**: Archmage Silk Robe (`archmage_robe`)
- **2. Element / Effect**: **Mana Infusion** - Continuously absorbs atmospheric mana, accelerating spell cooldowns and boosting elemental damage.
- **3. Base Style**: Enhanced `Mage.glb` with cascading embroidered hems, mystical celestial constellation patterns, and an enchanted high collar.
- **4. Color & Lighting**: Deep midnight velvet (`#172554`) with glittering astral gold dust and subtle star spark particles.
- **5. Item Details**:
  - *Belongs to*: **Nguyễn Khải Văn** & **Trần Nguyễn Trâm Anh** (Mage & Bard)
  - *Stats*: +50 Ma Lực Tối Đa, +25 Sát Thương Phép, +15 Hồi Năng Lượng.

### 4. Bào Y Rừng Thông (Highland Pathfinder Leathers)
- **1. Armor Type**: Scout Leather Tunic (`scout_leathers`)
- **2. Element / Effect**: **Woodland Camouflage** - Blends into trees, underbrush, and shadows; eliminates noise from movement.
- **3. Base Style**: Enhanced `Ranger.glb` with reinforced leather bracers, leaf-embossed belt buckles, and a warm woolen inner lining.
- **4. Color & Lighting**: Da Lat mossy forest green (`#166534`) and tanned oak leather (`#78350f`) with soft earth-tone matte finish.
- **5. Item Details**:
  - *Belongs to*: **Lê Nguyễn Phương Quỳnh** & **Huỳnh Trần Anh Thi** (Ranger & Druid)
  - *Stats*: +30 Phòng Ngự, +30 Tốc Độ, +20 Tàng Hình Sương Mù.

### 5. Y Phục Triều Tịch (Tide Priestess Silks)
- **1. Armor Type**: Ceremonial Cleric Silks (`tide_vestments`)
- **2. Element / Effect**: **Tidal Purification** - Protects against toxins and curses, emitting a calming ocean breeze aura.
- **3. Base Style**: Flowing aquamarine liturgical gown with mother-of-pearl brooch, white seashell trims, and floating gossamer sleeves.
- **4. Color & Lighting**: Shimmering aquamarine (`#06b6d4`) and iridescent pearl white with translucent wave reflections.
- **5. Item Details**:
  - *Belongs to*: **Lâm Anh Thư** & **Nguyễn Trần Thảo Uyên** (Clerics)
  - *Stats*: +45 Kháng Phép, +40 Hiệu Quả Hồi Phục, +200 Ma Lực.

### 6. Hải Tặc Phong Trần (Swashbuckler Sea-Corsair Tunic)
- **1. Armor Type**: Rogue Duelist Vest & Breeches (`swashbuckler_tunic`)
- **2. Element / Effect**: **Fortune's Favor** - Grants bonus gold finding and critical strike evasion during high-stakes skirmishes.
- **3. Base Style**: Enhanced `Rogue.glb` with open-collared crimson velvet doublet, wide brass belt with pouches, and leather riding boots.
- **4. Color & Lighting**: Crimson wine (`#991b1b`) and pirate charcoal (`#18181b`) with polished brass button glints.
- **5. Item Details**:
  - *Belongs to*: **Phạm Xuân Minh** (Swashbuckler Rogue)
  - *Stats*: +25 Tấn Công, +35 Tốc Độ, +50% Vàng Rơi Khi Nhặt Đồ.

### 7. Áo Trắng & Quần Vải Thường Dân (Civilian White Shirt & Slate Pants)
- **1. Armor Type**: Casual Village Attire (`civilian_linen`)
- **2. Element / Effect**: **Cozy Serenity** - Lightweight and peaceful; characters feel relaxed and unburdened by heavy plate armor.
- **3. Base Style**: Stylized `Rig_Medium_General.glb` with clean white rolled-sleeve linen shirt and charcoal slate trousers.
- **4. Color & Lighting**: Pure chalk white (`#f8fafc`) and charcoal slate (`#334155`).
- **5. Item Details**:
  - *Belongs to*: **Toàn Bộ 9 Tri Kỷ (All Companions)**
  - *Stats*: +10 Tốc Độ Di Chuyển Thong Dong, +5 Kháng Mệt Mỏi.

---

## Implementation Steps

1. **Step 1: Data Model Expansion**:
   - Update `src/types/inventory.ts` with the new weapon and armor archetypes, VFX configs, and grip transform dictionaries.
   - Expand `src/data/itemsData.ts` to include all 9 elemental weapons and 7 thematic armor outfits with full Vietnamese friendship lore and stats.
2. **Step 2: Procedural 3D Weapon & Armor Generator**:
   - Enhance `EquipmentGenerator.ts` to generate procedural 3D meshes for Greatsword, Katana, Scythe, Dual Daggers, Archmage Staff, and Elemental Bows with glowing materials and emissive shader layers.
3. **Step 3: Precise Weapon Grip & Stance Alignment (`CharacterMeshBuilder.ts`)**:
   - Create a `WEAPON_GRIP_CONFIGS` matrix mapping each weapon archetype to its precise anatomical bone (`handslot.r`, `handslot.l`, or `head`), ensuring vertical staff grip, forward-angled sword blades, aligned bow limbs, and wrist-mounted shields.
4. **Step 4: Outfit Swap & Armor Rendering Lifecycle**:
   - Refactor `setupAvatarBody` and `refreshEquipmentFn` so swapping outfits preserves attached weapons, helmets, and capes without mesh clipping or missing references.
5. **Step 5: Unified Party Armory & Carousel Navigation (`CharacterModal.tsx`)**:
   - Add a 9-companion avatar switcher strip inside the modal so players can equip weapons and armor across all friends in one shared interface.
6. **Step 6: Integrate 18 Companion Passives**:
   - Add `passiveSkills` to `Character` type and `charactersData.ts`, rendering them clearly in the `⚡ Kỹ Năng` tab.

---

## Todo Checklist

- [x] Define `WeaponArchetype`, `ArmorArchetype`, `ElementType`, and `GripTransformConfig` in `src/types/inventory.ts`
- [x] Add all 9 elemental weapons and 7 armor sets into `src/data/itemsData.ts`
- [x] Implement procedural 3D meshes for Katana, Scythe, and Archmage Staff in `EquipmentGenerator.ts`
- [x] Calibrate `WEAPON_GRIP_CONFIGS` in `CharacterMeshBuilder.ts` for staves, bows, greatswords, and shields
- [x] Fix headgear and cape attachment offsets so hats sit flush on character brows
- [x] Add 9-companion avatar switcher bar to `CharacterModal.tsx` for unified party equipment management
- [x] Add 18 unique passive skills into `src/types/character.ts` and `src/data/charactersData.ts`
- [x] Verify build with `npm run build` and test 360 rotation and equipment swapping

---

## Success Criteria

- [x] All 9 elemental weapons render with correct orientation and hand grip (staves point up, swords point forward, bows held vertically).
- [x] Outfits and hats switch smoothly in real-time on the 360° character preview without missing meshes.
- [x] Players can switch between any of the 9 companions inside the Character Modal from a unified armory.
- [x] The `⚡ Kỹ Năng` tab displays the 2 unique passives for each companion with rich lore and mechanical descriptions.

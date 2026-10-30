---
title: "Phase 1: Data Model & Schema Migration for Dual Abilities"
status: completed
priority: P1
effort: 1.5h
tags: [data-model, schema, typescript, character-abilities]
---

# Phase 1: Data Model & Schema Migration for Dual Abilities

## 1. Overview
Nâng cấp cấu trúc dữ liệu nhân vật để hỗ trợ đồng thời **Kỹ Năng Chủ Động (Active Ability)** và **Kỹ Năng Tối Thượng (Ultimate Ability)** thay cho cấu trúc 1 kỹ năng cũ, đảm bảo tương thích ngược và chứa đầy đủ dữ liệu thời gian hồi chiêu, mô tả chiến thuật và hiệu ứng tương ứng.

---

## 2. Technical Scope & Implementation Steps

### Step 1: Mở Rộng Schema Types (`src/types/character.ts`)
```ts
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
  | 'nature_bloom' | 'aegis_shield' | 'firework_burst' | 'water_slash' 
  | 'eagle_scout' | 'lute_hymn' | 'dawn_light' | 'swashbuckle_coin' | 'tidal_wave';

export interface CharacterAbility {
  id: string;
  name: string;
  category: AbilityCategory;
  cooldown: number; // in seconds
  icon: string;
  description: string;
  effectType: AbilityEffectType;
}

export interface Character {
  // ... existing fields
  activeAbility: CharacterAbility;
  ultimateAbility: CharacterAbility;
  signatureAbility?: CharacterSignatureAbility; // Legacy bridge
}
```

### Step 2: Cập Nhật Dữ Liệu 9 Nhân Vật (`src/data/charactersData.ts`)
Ánh xạ chính xác dữ liệu từ `Character Redesign.md`:
1. **Huỳnh Trần Anh Thi**:
   - `activeAbility`: Hạt Giống Sinh Mệnh (5s, `active_seed_of_life`, 🌿)
   - `ultimateAbility`: Đại Ngàn Tỉnh Giấc (24s, `ult_forest_awakening`, 🌲)
2. **Lê Nguyễn Phương Quỳnh**:
   - `activeAbility`: Mũi Tên Âm Vang (6s, `active_resonating_arrow`, 🏹)
   - `ultimateAbility`: Khúc Ca Đại Ngàn (22s, `ult_hymn_of_wilds`, 🎶)
3. **Trần Nguyễn Trâm Anh**:
   - `activeAbility`: Vệt Cọ Hư Không (5s, `active_void_brush`, 🖌️)
   - `ultimateAbility`: Kiệt Tác Không Gian (25s, `ult_spatial_masterpiece`, 🎨)
4. **Nguyễn Khải Văn**:
   - `activeAbility`: Quả Cầu Pháo Hoa (4s, `active_firework_orb`, 🎇)
   - `ultimateAbility`: Dạ Khúc Tinh Tú (26s, `ult_celestial_nocturne`, 🎆)
5. **Nguyễn Trần Thảo Uyên**:
   - `activeAbility`: Ánh Sáng Chở Che (7s, `active_guardian_light`, 🛡️)
   - `ultimateAbility`: Hừng Đông Tỏa Sáng (30s, `ult_dawn_resurgence`, ☀️)
6. **Nguyễn Thị Ngọc Hà**:
   - `activeAbility`: Nhịp Độ Thể Thao (4s, `active_athletic_tempo`, ⚡)
   - `ultimateAbility`: Chân Ngôn Bất Tận (20s, `ult_infinite_flurry`, 🥋)
7. **Phạm Trần Thanh Phương**:
   - `activeAbility`: Dòng Suối Quật Cường (6s, `active_resilient_torrent`, 💧)
   - `ultimateAbility`: Khát Vọng Trùng Khơi (28s, `ult_ocean_tsunami`, 🌊)
8. **Phạm Xuân Minh**:
   - `activeAbility`: Lệnh Xung Phong (5s, `active_fearless_charge`, 🎯)
   - `ultimateAbility`: Bữa Tiệc Cuồng Nộ (22s, `ult_party_frenzy`, 🔥)
9. **Lâm Anh Thư**:
   - `activeAbility`: Làn Sóng Tĩnh Lặng (5s, `active_serene_wave`, 🫧)
   - `ultimateAbility`: Nhiệt Huyết Đại Dương (25s, `ult_passionate_geyser`, ⛲)

---

## 3. Verification & Acceptance Criteria
- [ ] TypeScript build kiểm tra tính hợp lệ của schema: `npx tsc --noEmit`.
- [ ] Không có nhân vật nào bị thiếu trường `activeAbility` hoặc `ultimateAbility`.
- [ ] Dữ liệu lore và stats ăn khớp 100% với `Character Redesign.md`.

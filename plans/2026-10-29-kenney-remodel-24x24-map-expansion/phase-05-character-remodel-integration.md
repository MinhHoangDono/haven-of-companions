---
title: "Phase 5: KayKit Character Remodel & Weapon Socket Attachments"
status: pending
priority: P1
effort: 2.5h
tags: [threejs, characters, kaykit-adventurers, weapons, sockets]
---

# Phase 5: KayKit Character Remodel & Weapon Socket Attachments

## 1. Overview

This phase integrates **`KayKit_Adventurers_2.0_FREE`** (`Knight.glb`, `Mage.glb`, `Ranger.glb`, `Rogue.glb`, `Rogue_Hooded.glb`, `Barbarian.glb`) into **`src/engine/three/CharacterMeshBuilder.ts`**.

These models arrive with authentic fantasy RPG class costumes, armor plates, hoods, and tuned proportions. We equip each companion with their matching weapon accessories from `KayKit_Adventurers_2.0_FREE/Assets/gltf/` (staff, bow, quiver, 2-handed sword, shield, dagger, spellbook).

---

## 2. Character Model & Weapon Mapping Table

```typescript
export interface CharacterModelConfig {
  model: string;                      // KayKit character GLB in /assets/models/characters/
  scale: number;
  rotationY: number;
  mainWeapon?: string;                 // Weapon GLTF attached to right hand
  offhandWeapon?: string;              // Shield or weapon attached to left hand
  backAccessory?: string;              // Quiver or cape attached to spine/back
}

export const CHARACTER_ADVENTURER_MAP: Record<string, CharacterModelConfig> = {
  // 1. Huỳnh Trần Anh Thi (Wilderness Druid)
  'anh-thi-druid': {
    model: 'Mage.glb',
    scale: 1.15,
    rotationY: Math.PI * 0.3,
    mainWeapon: 'staff.gltf',
  },
  // 2. Lê Nguyễn Phương Quỳnh (Elven Ranger)
  'phuong-quynh-ranger': {
    model: 'Ranger.glb',
    scale: 1.15,
    rotationY: Math.PI * 0.45,
    mainWeapon: 'bow_withString.gltf',
    backAccessory: 'quiver.gltf',
  },
  // 3. Trần Nguyễn Trâm Anh (Lore Bard)
  'tram-anh-bard': {
    model: 'Rogue.glb',
    scale: 1.15,
    rotationY: -Math.PI * 0.65,
    mainWeapon: 'dagger.gltf',
  },
  // 4. Nguyễn Khải Vạn (Pyromancy Sorcerer)
  'khai-van-sorcerer': {
    model: 'Mage.glb',
    scale: 1.15,
    rotationY: -Math.PI * 0.5,
    mainWeapon: 'spellbook_open.gltf',
  },
  // 5. Nguyễn Trần Thảo Uyên (Cleric of the Light)
  'thao-uyen-cleric': {
    model: 'Mage.glb',
    scale: 1.15,
    rotationY: Math.PI * 0.25,
    offhandWeapon: 'shield_badge_color.gltf',
  },
  // 6. Nguyễn Thị Ngọc Hà (Way of the Kensei Monk)
  'ngoc-ha-monk': {
    model: 'Barbarian.glb',
    scale: 1.15,
    rotationY: -Math.PI * 0.75,
  },
  // 7. Phạm Trần Thanh Phương (Oath of the Vanguard Paladin)
  'thanh-phuong-paladin': {
    model: 'Knight.glb',
    scale: 1.2,
    rotationY: Math.PI * 0.15,
    mainWeapon: 'sword_2handed_color.gltf',
    offhandWeapon: 'shield_square_color.gltf',
  },
  // 8. Phạm Xuân Minh (Swashbuckler Rogue)
  'xuan-minh-rogue': {
    model: 'Rogue_Hooded.glb',
    scale: 1.15,
    rotationY: Math.PI * 0.5,
    mainWeapon: 'dagger.gltf',
  },
  // 9. Lâm Anh Thư (Tidecaller Cleric)
  'anh-thu-cleric': {
    model: 'Mage.glb',
    scale: 1.15,
    rotationY: -Math.PI * 0.3,
    mainWeapon: 'staff.gltf',
  },
};
```

---

## 3. Preserving Gameplay & UI Invariants

When instantiating the KayKit avatars, `CharacterMeshBuilder.buildCharacter` retains all core mechanics:
1. **Glowing Runic Pedestal**: Rendered synchronously at the base coordinates.
2. **In-World 3D Nameplate Billboard**: Rendered at $Y = 2.45$ showing friend name, class, and faction badge.
3. **Screen Projection Anchor**: `getHeadWorldPosition()` continues feeding `ThreeIsometricCanvas.tsx` for speech bubbles.
4. **Touch Raycast Collider**: Retains cylinder target to support mobile taps.
5. **Idle & Hop Animation Update**: Breathing bob and tap spring hop operate seamlessly on the parent `THREE.Group`.

---

## 4. Verification Gate

- Run `npm run dev`.
- Confirm all 9 friends display their distinct KayKit Adventurer models (Knight in full armor, Mage in robes, Ranger in tunic with bow/quiver, Rogue hooded, Barbarian monk).
- Tap each hero: confirm spring hop and speech bubbles trigger without positional drift.
- Verify 60 FPS performance maintained across the entire scene.

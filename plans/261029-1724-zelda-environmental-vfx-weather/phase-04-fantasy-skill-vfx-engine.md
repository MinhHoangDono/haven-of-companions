---
title: "Phase 4: Fantasy Skill VFX Engine (three.quarks & CC0 Textures)"
status: done
priority: P1
effort: 3.0h
---

# Phase 4: Fantasy Skill VFX Engine (`three.quarks` & CC0 Textures)

## Overview

Overhauls the 3D spell particle engine (`SpellEffect3D.ts`) from ad-hoc `THREE.Mesh` cloning into a production-grade **GPU Batched VFX Pipeline** using the open-source **[three.quarks](https://github.com/Alchemist0823/three.quarks)** engine (a direct Three.js port of Unity's Shuriken particle system) and free CC0 textures from the **[Kenney Particle Pack](https://kenney.nl/assets/particle-pack)**.

All 9 companion hero signature abilities are upgraded with custom particle bursts, ribbon trails, and expanding magic runes—rendered in a **single batched draw call**.

---

## Requirements

- [x] Install `three.quarks` via npm.
- [x] Download and bundle 6 key CC0 particle sprites from Kenney Particle Pack into `public/textures/particles/`:
  - `circle_05.png` (Glowing magic ring)
  - `magic_03.png` (Runic circle)
  - `slash_02.png` (Water blade crescent)
  - `spark_04.png` (Golden sparkle mote)
  - `smoke_01.png` (Soft anime smoke puff)
  - `flame_01.png` (Firework spark shard)
- [x] Initialize `BatchedRenderer` in `SpellEffect3D.ts` and add it to the diorama scene.
- [x] Implement signature ability visual specifications for all 9 heroes:
  1. **Huỳnh Trần Anh Thi**: *Verdant Bloom* (Expanding emerald ring, upward botanical motes).
  2. **Lê Nguyễn Phương Quỳnh**: *Eagle Eye* (Aerodynamic wind tracer cone, falling feathers).
  3. **Trần Nguyễn Trâm Anh**: *Hymn of Antiquity* (Expanding harmonic acoustic rings, floating music runes).
  4. **Nguyễn Khải Vạn**: *Grand Pyrotechnic* (Fiery burst with gravity sparks and scorch mark).
  5. **Nguyễn Trần Thảo Uyên**: *Dawn Radiance* (Volumetric celestial god-ray beam, solar flash).
  6. **Nguyễn Thị Ngọc Hà**: *Flowing Water Katas* (Triple water crescent slashes, spray droplets).
  7. **Phạm Trần Thanh Phương**: *Aegis of the Coast* (Hexagonal Fresnel dome shield, protective ward seal).
  8. **Phạm Xuân Minh**: *Swashbuckler Flourish* (Golden coin flip arc, sparkling stardust shower).
  9. **Lâm Anh Thư**: *Tidal Embrace* (Swirling water vortex, upward geyser mist bubbles).
- [x] Update `ThreeIsometricCanvas.tsx` to drive `batchRenderer.update(dt)`.

---

## Related Code Files

| File Path | Action | Description |
|---|---|---|
| `package.json` | **Modify** | Add `three.quarks` dependency. |
| `public/textures/particles/` | **Create** | Directory containing CC0 particle textures. |
| `src/engine/three/SpellEffect3D.ts` | **Modify** | Refactor to use `BatchedRenderer` and `ParticleSystem` presets for all 9 heroes. |
| `src/components/canvas/ThreeIsometricCanvas.tsx` | **Modify** | Forward delta time to `spellEffects.update(dt)`. |

---

## 9-Hero Signature VFX Specifications

```
+-----------------------------------------------------------------------------------------+
|                                9-HERO FANTASY VFX SPECS                                 |
+---+----------------------+--------------------+-----------------------------------------+
| # | Hero                 | Ability Name       | Visual Composition                      |
+---+----------------------+--------------------+-----------------------------------------+
| 1 | Huỳnh Trần Anh Thi   | Verdant Bloom      | Emerald ring + 40 golden-green motes    |
| 2 | Lê Nguyễn P. Quỳnh   | Eagle Eye          | Sonic wind cone + feather drift         |
| 3 | Trần Nguyễn Trâm Anh | Hymn of Antiquity  | Acoustic stave rings + orbiting runes   |
| 4 | Nguyễn Khải Vạn      | Grand Pyrotechnic  | Fire vortex + 60 ballistic spark shards |
| 5 | Nguyễn T. Thảo Uyên  | Dawn Radiance      | God-ray cylinder + solar prism flash    |
| 6 | Nguyễn Thị Ngọc Hà   | Flowing Water Katas| Triple crescent slashes + splash spray  |
| 7 | Phạm T. Thanh Phương | Aegis of the Coast | Hexagonal radiant dome + ground ward    |
| 8 | Phạm Xuân Minh       | Swashbuckler Fl.   | Doubloon flip + shower of gold sparkles |
| 9 | Lâm Anh Thư          | Tidal Embrace      | Marine whirlpool + bubble geyser        |
+---+----------------------+--------------------+-----------------------------------------+
```

---

## Implementation Steps

1. **Install and Setup Assets**:
   - Run `npm install three.quarks`.
   - Populate `public/textures/particles/` with CC0 textures.
2. **Refactor `src/engine/three/SpellEffect3D.ts`**:
   - Instantiate `BatchedRenderer` in constructor and mount to scene.
   - Refactor `castSpell()` into dedicated handler methods for each ability type.
   - Configure lifetime, speed, color ranges, and emitters using `three.quarks` API.
   - Automatically delete expired systems after duration.
3. **Connect to Canvas**:
   - In `ThreeIsometricCanvas.tsx`, ensure `spellEffects.update(dt)` calls `batchRenderer.update(dt)`.
   - Verify modal "Cast Ability" button triggers correct hero effects.

---

## Todo List

- [x] Install `three.quarks`
- [x] Place CC0 particle sprites in `public/textures/particles/`
- [x] Initialize `BatchedRenderer` in `SpellEffect3D.ts`
- [x] Implement *Verdant Bloom* & *Grand Pyrotechnic*
- [x] Implement *Flowing Water Katas* & *Aegis of the Coast*
- [x] Implement *Dawn Radiance*, *Eagle Eye*, *Hymn of Antiquity*
- [x] Implement *Swashbuckler Flourish* & *Tidal Embrace*
- [x] Verify single draw call batching in Spector.js / Chrome DevTools

---

## Success Criteria

- [x] All 9 companions cast visually distinct, high-impact fantasy effects.
- [x] Zero mesh cloning or unmanaged Three.js Object3Ds left in memory after cast.
- [x] Active spell casting produces zero frame drop on mobile devices.

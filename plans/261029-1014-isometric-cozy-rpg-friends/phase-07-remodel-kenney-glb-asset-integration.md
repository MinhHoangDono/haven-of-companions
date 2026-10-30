---
title: "Phase 7: Remodel & Kenney GLB Asset Integration"
status: completed
priority: P1
effort: 6h
tags: [3d-models, gltf, kenney-assets, threejs, optimization]
---

# Phase 7: Remodel & Kenney GLB Asset Integration

## Overview

Upgrade procedural 3D primitives (cones, cylinders, boxes) across the village diorama to high-quality, lightweight, modular low-poly 3D models using the imported Kenney asset kits:
1. **`kenney_blocky-characters_20`**: Modular humanoid character models with textures (`Models/GLB format/*.glb`).
2. **`kenney_pirate-kit`**: Medieval maritime ships, lighthouse watchtowers, docks, cannons, barrels, chests, and palms (`Models/GLB format/*.glb`).

---

## Asset Mapping Specification

### 1. Character Roster Model Mapping (`kenney_blocky-characters_20`)

| Friend & Archetype | Recommended Kenney Model | Texture / Skin | Handheld & Accessory Props Attached |
|---|---|---|---|
| **Huỳnh Trần Anh Thi** *(Wilderness Druid)* | `character-f.glb` / `character-g.glb` | Forest Green / Earth Tones | Gnarled wooden druid staff with glowing emerald orb |
| **Lê Nguyễn Phương Quỳnh** *(Elven Ranger)* | `character-c.glb` / `character-d.glb` | Ranger Hunter Camo | Recurve elven bow, back quiver, feathered scout headband |
| **Trần Nguyễn Trâm Anh** *(Lore Bard)* | `character-m.glb` / `character-n.glb` | Velvet Ruby Scholar | Golden lute, jaunty beret, ancient scroll cases |
| **Nguyễn Khải Vạn** *(Pyromancy Sorcerer)* | `character-a.glb` / `character-e.glb` | Crimson Flame Robe | Pointed sorcerer hat, floating fireball in hand |
| **Nguyễn Trần Thảo Uyên** *(Cleric of the Light)* | `character-l.glb` / `character-p.glb` | Radiant White & Gold | Floating sun halo, golden healing chalice / scepter |
| **Nguyễn Thị Ngọc Hà** *(Way of the Kensei Monk)* | `character-b.glb` / `character-k.glb` | Martial Arts Gi | Black obi sash, dual wooden practice bokken |
| **Phạm Trần Thanh Phương** *(Ronin / Paladin)* | `character-h.glb` / `character-r.glb` | Armored Knight / Navy | Golden crescent kabuto crest, towering cross shield, katana |
| **Phạm Xuân Minh** *(Swashbuckler Rogue)* | `character-i.glb` / `character-j.glb` | Pirate Captain Coat | Tricorn hat with plume, dueling rapier, gold coin |
| **Lâm Anh Thư** *(The Ocean Cleric)* | `character-o.glb` / `character-q.glb` | Ocean Azure & Seafoam | Coral crown, sacred tidal bell trident |

### 2. Environment & Coastal Asset Mapping (`kenney_pirate-kit`)

| Scene Element | Current Procedural Mesh | Proposed Kenney GLB Asset | Placement & Improvements |
|---|---|---|---|
| **Flagship Galleon** | Procedural Box/Cone Ship | `ship-pirate-large.glb` or `ship-large.glb` | Western bay at $(-3.2, -0.15, 6.0)$ with detailed deck, gunports, and masts |
| **Rowboat** | Small procedural boat | `boat-row-large.glb` / `boat-row-small.glb` | Harbor pier mooring at $(2.8, -0.15, 5.5)$ |
| **Lighthouse** | Procedural cylinder tower | `tower-complete-large.glb` + `tower-watch.glb` | Rocky eastern promontory $(7.2, 0.15, 4.8)$ with beacon light |
| **Boardwalk Piers** | Flat procedural box piers | `structure-platform-dock.glb` | Seamless wooden planks and pilings |
| **Harbor Clutter** | Procedural cylinders/boxes | `cannon.glb`, `chest.glb`, `barrel.glb`, `crate.glb` | Shoreline armory, dock warehouse, and tavern porch |
| **Coastal Flora** | Clifftop pine trees only | `palm-straight.glb`, `palm-bend.glb` | Sandy tropical shoreline bordering the ocean bay |
| **Tide Rocks** | Procedural cliff edges | `rocks-sand-a.glb`, `rocks-sand-b.glb`, `rocks-c.glb` | Natural wave breaker barriers near Lâm Anh Thư's tide platform |

---

## Technical Implementation Steps

1. **Asset Pipeline & Build Optimization**:
   - Copy only selected `.glb` files into `public/assets/models/` (do not import duplicate FBX/OBJ to keep bundle small).
   - Ensure Vite serves `.glb` files with proper `model/gltf-binary` MIME types.
2. **Three.js GLTFLoader Integration**:
   - Create `src/engine/three/GLTFAssetLoader.ts` with asynchronous caching and pre-loading:
     ```ts
     import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
     // Cache loaded scenes to prevent redundant network fetches
     ```
   - Enable shadow casting and receiving on loaded meshes (`mesh.castShadow = true; mesh.receiveShadow = true`).
3. **Character Remodel Refactor**:
   - Update `CharacterMeshBuilder.ts` to clone the loaded Kenney character model, scale uniformly ($\approx 1.25\times$), and attach class weapons to the right/left hand bones or sockets.
   - Retain the existing glowing runic pedestals and floating 3D billboard nameplates.
4. **Environment Remodel Refactor**:
   - Update `DioramaBuilder.ts` to instantiate Kenney GLB props for the pirate galleon, lighthouse, docks, and coastal clutter.
5. **Performance & Memory Validation**:
   - Keep total assets under 2.5MB gzipped to retain instant mobile load times.
   - Verify 60 FPS performance on mobile devices.

---

## Todo List

- [x] Copy selected character `.glb` models from `kenney_blocky-characters_20` to `public/assets/models/characters/`
- [x] Copy selected pirate & coastal `.glb` models from `kenney_pirate-kit` to `public/assets/models/environment/`
- [x] Implement `GLTFAssetLoader.ts` with caching and shadow enablement
- [x] Refactor `CharacterMeshBuilder.ts` to mount Kenney GLB models with weapons & nameplates
- [x] Refactor `DioramaBuilder.ts` to mount Kenney galleon, lighthouse, dock, and clutter GLBs
- [x] Verify animations (idle breathing, hop reaction, ship bobbing) with GLTF models
- [x] Run production build and verify mobile load speed and frame rate
- [x] Deploy upgraded model release to Netlify

---

## Success Criteria

- All 9 friends rendered with expressive Kenney low-poly character models and custom class gear.
- Coastal harbor features detailed Kenney 3D pirate galleon, lighthouse tower, docks, and interactive chests.
- Mobile load time remains $< 1.5$s on 4G networks with silky 60 FPS touch controls.

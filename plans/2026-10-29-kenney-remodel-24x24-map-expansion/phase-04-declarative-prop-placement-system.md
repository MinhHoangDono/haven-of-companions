---
title: "Phase 4: Declarative Fast-Placement Prop System"
status: pending
priority: P1
effort: 2h
tags: [threejs, props, layout, declarative-data, fast-placement, kaykit, kenney]
---

# Phase 4: Declarative Fast-Placement Prop System

## 1. Overview

With multiple asset packs now supplying buildings, nature, and ships, hardcoding Three.js constructor calls for each object would cause massive code bloat.

This phase provides a **declarative prop layout registry** in **`src/data/propLayoutData.ts`** paired with **`src/engine/three/PropPlacementManager.ts`**.

### The Copy-Paste Workflow
To place, duplicate, or adjust any building, tree, or ship, you simply copy a line in a configuration array:
```typescript
{ asset: 'building_home_A_yellow.gltf', pack: 'props', pos: [3.2, 1.0, -5.5], rot: [0, Math.PI * 0.2, 0] }
```
When saved, Vite hot-module replacement (HMR) re-renders the 3D scene in $< 100\text{ms}$.

---

## 2. Declarative Schema (`src/data/propLayoutData.ts`)

```typescript
export type AssetPackCategory = 'props' | 'environment' | 'characters';

export interface PropInstanceDef {
  id?: string;
  asset: string;                        // File name (e.g. 'building_tavern_yellow.gltf', 'ship-pirate-large.glb')
  pack: AssetPackCategory;             // 'props' (/assets/models/props/) or 'environment' (/assets/models/environment/)
  pos: [number, number, number];        // [X, Y, Z] world position
  rot?: [number, number, number];       // [RotX, RotY, RotZ] in radians
  scale?: number | [number, number, number];
  interactive?: {
    id: string;
    type: 'stew_pot' | 'sea_bell' | 'fireworks_mortar' | 'tea_pavilion';
  };
}

/**
 * Procedural helper to generate straight wooden boardwalk pier segments
 */
export function createPierRow(
  startX: number,
  startZ: number,
  count: number,
  axis: 'x' | 'z',
  step: number = 2.0,
  elevation: number = 0.2
): PropInstanceDef[] {
  const row: PropInstanceDef[] = [];
  for (let i = 0; i < count; i++) {
    row.push({
      asset: 'structure-platform-dock.glb',
      pack: 'environment',
      pos: [
        axis === 'x' ? startX + i * step : startX,
        elevation,
        axis === 'z' ? startZ + i * step : startZ,
      ],
      rot: [0, axis === 'x' ? Math.PI / 2 : 0, 0],
    });
  }
  return row;
}

/**
 * Master declarative layout for the 24x24 diorama
 */
export const DIORAMA_PROPS: PropInstanceDef[] = [
  // ==========================================
  // ZONE 1: HIGHLAND MOUNTAIN PLATEAU (NW)
  // ==========================================
  // KayKit Alpine Mountain Crags & High Pine Forest
  { asset: 'mountain_A_grass_trees.gltf', pack: 'props', pos: [-11.0, 2.4, -11.0], scale: 1.4 },
  { asset: 'trees_A_large.gltf', pack: 'props', pos: [-9.5, 2.4, -6.5], scale: 1.2 },
  { asset: 'trees_A_medium.gltf', pack: 'props', pos: [-5.0, 2.4, -10.5], scale: 1.1 },
  { asset: 'tree_single_A.gltf', pack: 'props', pos: [-3.5, 2.4, -5.2], scale: 1.0 },
  // Campsite Tent & Clutter
  { asset: 'tent.gltf', pack: 'props', pos: [-7.8, 2.4, -8.2], rot: [0, Math.PI * 0.25, 0], scale: 1.2 },
  { asset: 'barrel.gltf', pack: 'props', pos: [-6.8, 2.4, -7.5] },
  // Kenney Watchtower Overlook
  { asset: 'tower-watch.glb', pack: 'environment', pos: [-10.5, 2.4, -4.5], rot: [0, Math.PI * 0.35, 0], scale: 1.1 },

  // ==========================================
  // ZONE 2: SUNSPIRE TOWN SQUARE & PLAZA (NE)
  // ==========================================
  // KayKit Medieval Buildings
  { asset: 'building_tavern_yellow.gltf', pack: 'props', pos: [5.5, 1.0, -8.5], rot: [0, -Math.PI * 0.15, 0], scale: 1.25 },
  { asset: 'building_church_yellow.gltf', pack: 'props', pos: [9.0, 1.0, -6.5], rot: [0, -Math.PI * 0.25, 0], scale: 1.2 },
  { asset: 'building_home_A_yellow.gltf', pack: 'props', pos: [2.5, 1.0, -9.5], rot: [0, Math.PI * 0.1, 0], scale: 1.1 },
  { asset: 'building_market_yellow.gltf', pack: 'props', pos: [4.2, 1.0, -3.8], rot: [0, Math.PI * 0.4, 0], scale: 1.15 },
  { asset: 'building_windmill_yellow.gltf', pack: 'props', pos: [10.2, 1.0, -2.5], rot: [0, -Math.PI * 0.5, 0], scale: 1.2 },

  // ==========================================
  // ZONE 3: COASTAL BAY & HARBOR (SW)
  // ==========================================
  // Kenney Flagship Pirate Galleon in Deep Water
  { asset: 'ship-pirate-large.glb', pack: 'environment', pos: [-6.5, -0.15, 8.5], rot: [0, Math.PI * 0.35, 0], scale: 1.3 },
  // Kenney Moored Fishing Skiff
  { asset: 'boat-row-large.glb', pack: 'environment', pos: [-1.2, -0.15, 6.8], rot: [0, -0.2, 0] },
  // Coastal Defense Cannon Battery
  { asset: 'cannon-mobile.glb', pack: 'environment', pos: [-1.5, 0.2, 3.8], rot: [0, Math.PI * 0.7, 0] },
  // Tropical Palms along shoreline
  { asset: 'palm-detailed-bend.glb', pack: 'environment', pos: [-8.5, 0.2, 2.5], rot: [0, 1.2, 0], scale: 1.2 },
  { asset: 'palm-straight.glb', pack: 'environment', pos: [-4.2, 0.2, 1.8], scale: 1.0 },
  { asset: 'palm-bend.glb', pack: 'environment', pos: [-9.8, 0.2, 5.0], rot: [0, -0.8, 0], scale: 1.1 },
  // Boardwalk Pier Walkway
  ...createPierRow(-1.0, 4.0, 4, 'z', 1.8, 0.2),

  // ==========================================
  // ZONE 4: LIGHTHOUSE PROMONTORY (SE)
  // ==========================================
  // Kenney Coastal Stone Beacon Lighthouse
  { asset: 'tower-complete-large.glb', pack: 'environment', pos: [8.5, 0.8, 7.5], scale: 1.35 },
  // Wave-breaker reef boulders protecting harbor
  { asset: 'rocks-sand-a.glb', pack: 'environment', pos: [6.5, 0.0, 9.5], scale: 1.5 },
  { asset: 'rocks-sand-b.glb', pack: 'environment', pos: [10.5, 0.0, 6.0], scale: 1.3 },
  { asset: 'rocks-sand-c.glb', pack: 'environment', pos: [8.0, 0.0, 10.8], scale: 1.4 },
];
```

---

## 3. Placement Manager Engine (`src/engine/three/PropPlacementManager.ts`)

```typescript
import * as THREE from 'three';
import { assetLoader } from './GLTFAssetLoader';
import { DIORAMA_PROPS, PropInstanceDef } from '../../data/propLayoutData';
import { InteractivePropRef } from './DioramaBuilder';

export class PropPlacementManager {
  public static async instantiateProps(
    scene: THREE.Scene,
    parentGroup: THREE.Group
  ): Promise<InteractivePropRef[]> {
    const interactiveRefs: InteractivePropRef[] = [];

    for (const def of DIORAMA_PROPS) {
      const fullPath = `/assets/models/${def.pack}/${def.asset}`;
      const { scene: propScene } = await assetLoader.loadModel(fullPath, false);

      propScene.position.set(def.pos[0], def.pos[1], def.pos[2]);

      if (def.rot) {
        propScene.rotation.set(def.rot[0], def.rot[1], def.rot[2]);
      }

      if (def.scale) {
        if (typeof def.scale === 'number') {
          propScene.scale.set(def.scale, def.scale, def.scale);
        } else {
          propScene.scale.set(def.scale[0], def.scale[1], def.scale[2]);
        }
      }

      parentGroup.add(propScene);

      // Register interactive hit targets
      if (def.interactive) {
        propScene.userData = {
          interactiveId: def.interactive.id,
          interactiveType: def.interactive.type,
        };

        interactiveRefs.push({
          id: def.interactive.id,
          type: def.interactive.type,
          mesh: propScene,
          position: propScene.position.clone(),
        });
      }
    }

    return interactiveRefs;
  }
}
```

---

## 4. Verification Gate

- Run `npm run dev`.
- Confirm KayKit medieval tavern, cottages, church, and pine trees render in the highlands and plaza.
- Confirm Kenney galleon, lighthouse, docks, and palms render along the coast and bay.
- Test copying a new cottage line in `DIORAMA_PROPS` and verify it hot-reloads instantly.

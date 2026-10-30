---
title: "Phase 1: Dynamic MeshLibrary Asset Registry & CC0 Models"
status: completed
priority: P1
effort: 1.5h
branch: main
tags: [frontend, threejs, meshlibrary, cc0-models, asset-registry]
dependsOn: []
files:
  - src/types/cityBuilder.ts
  - src/engine/three/builder/DynamicMeshLibrary.ts
created: 2026-10-30
---

# Phase 1: Dynamic MeshLibrary Asset Registry & CC0 Models

## 1. Objective

Adapt the `MeshLibrary` concept from Kenney's Starter Kit into Three.js by building a centralized, high-performance asset registry (`DynamicMeshLibrary.ts`). This registry will catalogue all placeable CC0 3D models, pre-calculate their bounding footprints for grid collision, provide cached template geometries and materials, and link each item to a 2D thumbnail sprite for the UI catalog.

---

## 2. Model Catalog (CC0 Licensed Assets)

All models are dedicated to the public domain under **CC0 1.0 Universal** or **KayKit CC0 / Free License**:

| Category | Item ID | Asset Path | Pack | Footprint ($W \times D$) | Default Scale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Houses** | `cottage_small` | `props/building_home_A_yellow.gltf` | KayKit Medieval | $2 \times 2$ | $1.2$ |
| **Houses** | `cottage_large` | `props/building_home_B_yellow.gltf` | KayKit Medieval | $2 \times 2$ | $1.2$ |
| **Houses** | `inn_tavern` | `props/building_tavern_yellow.gltf` | KayKit Medieval | $3 \times 3$ | $1.3$ |
| **Production** | `windmill` | `props/building_windmill_yellow.gltf` | KayKit Medieval | $2 \times 2$ | $1.4$ |
| **Production** | `market_stall` | `props/building_market_yellow.gltf` | KayKit Medieval | $1 \times 1$ | $1.1$ |
| **Fortifications**| `watchtower` | `environment/tower-watch.glb` | Kenney Pirate | $1 \times 1$ | $1.4$ |
| **Fortifications**| `cannon_battery` | `environment/cannon-mobile.glb` | Kenney Pirate | $1 \times 1$ | $1.1$ |
| **Fortifications**| `stockade_fence` | `environment/structure-fence.glb` | Kenney Pirate | $1 \times 1$ | $1.0$ |
| **Decorations** | `campfire_hearth`| `props/tent.gltf` | KayKit Medieval | $1 \times 1$ | $1.0$ |
| **Decorations** | `treasure_chest` | `environment/chest.glb` | Kenney Pirate | $1 \times 1$ | $1.0$ |
| **Decorations** | `rum_crate` | `environment/crate-bottles.glb` | Kenney Pirate | $1 \times 1$ | $1.2$ |
| **Nature** | `highland_pine` | `props/trees_A_large.gltf` | KayKit Medieval | $1 \times 1$ | $1.2$ |
| **Nature** | `coastal_palm` | `environment/palm-detailed-bend.glb` | Kenney Pirate | $1 \times 1$ | $1.5$ |
| **Nature** | `sea_boulder` | `environment/rocks-sand-a.glb` | Kenney Pirate | $1 \times 1$ | $1.3$ |

---

## 3. Data Structures (`src/types/cityBuilder.ts`)

```typescript
export type StructureCategory = 'houses' | 'production' | 'fortifications' | 'decorations' | 'nature';

export interface StructureDefinition {
  id: string;
  name: string;
  description: string;
  category: StructureCategory;
  assetPath: string; // e.g. 'public/assets/models/props/building_home_A_yellow.gltf'
  footprintWidth: number; // grid units X
  footprintDepth: number; // grid units Z
  baseElevationOffset: number; // Y offset from surface
  scale: number;
  iconName: string; // Lucide or custom SVG key
  tags: string[];
}

export interface PlacedStructure {
  instanceId: string;
  structureId: string;
  gridX: number;
  gridZ: number;
  elevationY: number;
  rotationY: number; // 0, PI/2, PI, 1.5*PI
  placedAt: number;
}
```

---

## 4. Implementation Steps

1. **Create Type Definitions**:
   - Write `src/types/cityBuilder.ts` declaring `StructureDefinition`, `PlacedStructure`, and builder tool state.
2. **Build `DynamicMeshLibrary.ts`**:
   - Maintain static registry map of all 14 CC0 structures.
   - Implement asynchronous pre-loading and caching:
     ```typescript
     public static async loadTemplate(structureId: string): Promise<THREE.Group>
     ```
   - Clone template meshes via `SkeletonUtils.clone` or standard Three.js traversal with shared materials.
   - Attach dynamic bounding box helper for footprint visualization.
3. **Ghost Hologram Generator**:
   - Provide a `createGhostMesh(structureId: string)` helper returning a cloned mesh with semi-transparent shader (`MeshBasicMaterial` with wireframe/color tinting).

---

## 5. Acceptance Criteria

- `DynamicMeshLibrary.getDefinition(id)` returns valid metadata for all registered items.
- Template models load cleanly via `GLTFAssetLoader` without console errors.
- Cloned meshes accurately preserve UV textures and material bindings while supporting ghost transparency overrides.

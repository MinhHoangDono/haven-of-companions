---
title: "Phase 4: Save/Load System & LocalStorage Persistence"
status: completed
priority: P1
effort: 1.0h
branch: main
tags: [frontend, threejs, persistence, localstorage, json-export]
dependsOn: [1, 3]
files:
  - src/engine/three/builder/CitySaveManager.ts
  - src/components/canvas/ThreeIsometricCanvas.tsx
created: 2026-10-30
---

# Phase 4: Save/Load System & LocalStorage Persistence

## 1. Objective

Provide durable village layout persistence equivalent to Kenney's `action_save()` and `action_load()`:
1. **Auto-Saving**: Real-time debounced storage to browser `localStorage` (`haven_city_layout_v1`).
2. **Auto-Loading**: Instant reconstitution of all player-built structures upon game boot or canvas remount.
3. **JSON Export & Import**: Ability to download or upload town layout files to share or backup creations.
4. **Clean Village Reset**: Option to reset player-built structures back to the pristine default village diorama.

---

## 2. Serialization Schema

```typescript
export interface CityLayoutSaveData {
  version: number; // e.g. 1
  createdAt: number;
  updatedAt: number;
  mapDimensions: { width: number; depth: number }; // 70x70
  structures: Array<{
    instanceId: string;
    structureId: string;
    gridX: number;
    gridZ: number;
    elevationY: number;
    rotationY: number;
  }>;
}
```

---

## 3. Implementation Steps

1. **Build `CitySaveManager.ts`**:
   - Save logic:
     ```typescript
     public static saveToLocalStorage(structures: PlacedStructure[]): void {
       const payload: CityLayoutSaveData = {
         version: 1,
         createdAt: Date.now(),
         updatedAt: Date.now(),
         mapDimensions: { width: 70, depth: 70 },
         structures: structures.map(s => ({
           instanceId: s.instanceId,
           structureId: s.structureId,
           gridX: s.gridX,
           gridZ: s.gridZ,
           elevationY: s.elevationY,
           rotationY: s.rotationY,
         })),
       };
       localStorage.setItem('haven_city_layout_v1', JSON.stringify(payload));
     }
     ```
   - Load logic:
     ```typescript
     public static loadFromLocalStorage(): PlacedStructure[]
     ```
   - Validation & Error Handling:
     - Verify structure IDs exist in `DynamicMeshLibrary`.
     - Discard malformed entries without breaking scene loading.
2. **JSON Export & Import**:
   - `exportToJsonString()`: Produces formatted JSON string with download trigger.
   - `importFromJsonString(jsonStr: string)`: Parses, validates against schema, and replaces the active `userStructuresGroup`.
3. **Integration in `ThreeIsometricCanvas.tsx`**:
   - On canvas initialization, after building terrain and default diorama:
     ```typescript
     const savedStructures = CitySaveManager.loadFromLocalStorage();
     await builderController.reconstituteStructures(savedStructures);
     ```
   - Asynchronously populates the diorama without delaying initial frame rendering.

---

## 4. Acceptance Criteria

- Placing structures, refreshing the browser, and reloading the page preserves all placed buildings at their exact coordinates and rotations.
- Exporting JSON generates a valid `.json` text file.
- Importing valid JSON correctly spawns the structures and updates `passabilityMap.ts`.
- Corrupt or invalid `localStorage` content triggers a safe reset without crashing the WebGL context.

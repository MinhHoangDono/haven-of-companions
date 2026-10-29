---
title: "Phase 2: 3D In-World Memory Crystals & Raycast Interaction"
status: todo
priority: P1
effort: 1.5h
tags: [threejs, 3d, procedural, raycast, diorama]
---

# Phase 2: 3D In-World Memory Crystals & Raycast Interaction

## Overview

Build procedural 3D **Ancient Memory Crystals** placed strategically across the three diorama biomes (Highlands Campfire, Sunspire Plaza, and Coastal Boardwalk). Integrate them into the Three.js scene graph, add hovering animation physics, and register them with `TouchControls3D.ts` raycast tap detection.

## Requirements

- [ ] Construct procedural 3D Memory Crystal meshes using `THREE.OctahedronGeometry` with iridescent cyan/gold emissive materials (`THREE.MeshStandardMaterial`).
- [ ] Position three distinct memory monuments:
  - **Highlands Hearth**: $(-3.8, 1.8, -3.0)$ near campfire & pine clifftop.
  - **Sunspire Pavilion**: $(1.5, 0.9, -1.8)$ near plaza stage & market stall.
  - **Coastal Harbor**: $(4.5, 0.15, 4.2)$ on seaside pier overlooking ocean water.
- [ ] Add idle bobbing and rotation animation in `ThreeIsometricCanvas.tsx` render loop ($y = \text{baseY} + \sin(t \times 2) \times 0.08$).
- [ ] Add floating golden particle dust ring around each crystal.
- [ ] Update `TouchControls3D.ts` and `src/types/threeEngine.ts` to recognize `interactiveType: 'memory_crystal'` and return location ID.

## Implementation Steps

1. **Procedural Crystal Geometry in `DioramaBuilder.ts`**:
   - Create helper `buildMemoryCrystal(terraceId: string, pos: THREE.Vector3)`:
     - Outer crystal: `new THREE.OctahedronGeometry(0.35, 0)`.
     - Material: `MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x0891b2, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.9 })`.
     - Stone pedestal base with engraved runic ring.
     - Add invisible raycast cylinder hit target ($r = 0.6\text{m}, h = 1.8\text{m}$) with `userData: { interactiveId: terraceId, interactiveType: 'memory_crystal' }`.
2. **Animation Loop in `ThreeIsometricCanvas.tsx`**:
   - Collect memory crystal references into `memoryCrystalsRef.current`.
   - Update rotation and floating bob in RAF tick:
     ```typescript
     crystal.rotation.y = currentTime * 0.0015;
     crystal.position.y = baseY + Math.sin(currentTime * 0.002) * 0.06;
     ```
3. **Raycast Hit Wiring**:
   - Add `'memory_crystal'` to `InteractiveTargetType` in `src/types/threeEngine.ts`.
   - In `onTap` callback in `ThreeIsometricCanvas.tsx`:
     ```typescript
     if (hit.type === 'memory_crystal') {
       onOpenMemoryTerrace(hit.id as MemoryTerrace);
     }
     ```
   - Triggers camera pan to focus on the crystal before opening the memory modal.

## Todo

- [ ] Implement `buildMemoryCrystal` in `DioramaBuilder.ts`
- [ ] Anchor 3 crystals into Highlands, Plaza, and Coastal Pier
- [ ] Add ambient floating rotation and emissive pulse in render loop
- [ ] Wire `'memory_crystal'` raycast tap handling to React state in `App.tsx`
- [ ] Verify crystals respond cleanly to touch on mobile and mouse click on desktop

## Success Criteria

- Three glowing crystals visible in the 3D diorama at their designated terrace locations.
- Tapping a crystal triggers camera pan and emits the location ID to React state.
- Zero frame drops or shader compilation stutter.

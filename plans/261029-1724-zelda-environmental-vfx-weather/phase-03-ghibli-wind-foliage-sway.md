---
title: "Phase 3: Ghibli Wind & Foliage Vertex Sway"
status: todo
priority: P2
effort: 2.0h
---

# Phase 3: Ghibli Wind & Foliage Vertex Sway

## Overview

Brings natural ambient life to the static village diorama by injecting **elevation-weighted wind sway** into vegetation and cloth props. Using Three.js's native `onBeforeCompile` vertex shader hook, vertices at the root ($Y \le 0$) remain anchored to the terrain, while upper vertices (tree canopies, shrub leaves, market awnings, and hanging lanterns) sway organically with global wind vectors. This requires zero external libraries and zero new geometry allocations.

Based on open-source references: [James-Smyth/three-grass-demo](https://github.com/James-Smyth/three-grass-demo) and [simondevyoutube/Quick_Grass](https://github.com/simondevyoutube/Quick_Grass).

---

## Requirements

- [ ] Create `FoliageWindHook` utility class that attaches wind vertex displacement to any `MeshStandardMaterial` or `MeshLambertMaterial`.
- [ ] Root vertices anchored firmly at $Y = \text{rootY}$ using quadratic elevation weighting: $(\max(0, Y - \text{rootY}))^2$.
- [ ] Global wind vector $\vec{W}_{\text{dir}}$ and wind strength uniform controllable dynamically by the weather system.
- [ ] Attach wind displacement to:
  - Highland pine trees and shrubs (`matHighlandGrass` / foliage meshes).
  - Tea pavilion tatami roof and coastal vegetation.
  - Market stall fabric awnings and town banners (`matRoofSlate` / cloth).
- [ ] Animate hanging market lanterns with subtle pendulum harmonic swing.

---

## Related Code Files

| File Path | Action | Description |
|---|---|---|
| `src/engine/three/materials/FoliageWindHook.ts` | **Create** | Reusable `onBeforeCompile` injector for wind vertex displacement. |
| `src/engine/three/DioramaBuilder.ts` | **Modify** | Attach wind hook to environmental materials during diorama construction. |
| `src/engine/three/PropPlacementManager.ts` | **Modify** | Attach wind hook to GLTF vegetation and foliage models upon loading. |
| `src/components/canvas/ThreeIsometricCanvas.tsx` | **Modify** | Update `FoliageWindHook.update(currentTime)` in the render loop. |

---

## Shader Mechanics: Height-Weighted Vertex Sway

```glsl
// GLSL snippet injected before standard vertex transforms
#include <begin_vertex>
float heightFactor = max(0.0, position.y - uRootY);
float sway = sin(uWindTime * 2.2 + position.x * 0.7 + position.z * 0.7) * uWindStrength * (heightFactor * heightFactor);
transformed.x += uWindDir.x * sway;
transformed.z += uWindDir.y * sway;
```

---

## Implementation Steps

1. **Create `src/engine/three/materials/FoliageWindHook.ts`**:
   - Store global uniforms (`uWindTime`, `uWindDir`, `uWindStrength`).
   - Implement `attach(material: THREE.Material, rootY = 0.0, strength = 0.08)`.
   - Modify `#include <begin_vertex>` to displace `transformed.x` and `transformed.z`.
   - Expose `update(timeInSeconds: number)`.
2. **Apply to Diorama Materials**:
   - In `DioramaBuilder.ts`, call `FoliageWindHook.attach()` on `matHighlandGrass`, `matHighlandTerrace`, and awning materials.
   - In `PropPlacementManager.ts`, traverse loaded GLTF meshes and attach to leaf/branch materials.
3. **Connect to Render Loop**:
   - In `ThreeIsometricCanvas.tsx`, call `FoliageWindHook.update(currentTime * 0.001)`.
   - Add gentle harmonic rotation to hanging lanterns: $\theta_z = \sin(t \times 2.0) \cdot 0.05$.

---

## Todo List

- [ ] Create `src/engine/three/materials/FoliageWindHook.ts`
- [ ] Attach wind displacement to terrain grass and terrace materials
- [ ] Attach wind displacement to market stall awnings
- [ ] Attach wind displacement to imported GLTF trees
- [ ] Connect time updates in `ThreeIsometricCanvas.tsx`
- [ ] Verify roots remain firmly planted while canopies sway

---

## Success Criteria

- [ ] Pine trees and shrubs gently sway without detaching from ground soil.
- [ ] Market stall awnings ripple naturally in the breeze.
- [ ] Zero additional draw calls (reuses existing materials).
- [ ] Smooth 60 FPS performance maintained.

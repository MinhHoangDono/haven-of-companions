---
title: "Phase 2: Cel-Shaded Anime Fire & Hearth System"
status: done
priority: P1
effort: 2.0h
---

# Phase 2: Cel-Shaded Anime Fire & Hearth System

## Overview

Upgrades the village campfire and lanterns from static wood meshes with flickering point lights to **living 3D cel-shaded cartoon fire meshes** and **rising ember sparks**. The shader deforms a tapered 3D cylinder geometry using upward-scrolling 2D Simplex noise and applies sharp step thresholds to create distinct anime flame bands (white core $\rightarrow$ gold $\rightarrow$ vibrant orange $\rightarrow$ crimson edge discard).

Based on open-source references: [kekkorider/threejs-flame-shader](https://github.com/kekkorider/threejs-flame-shader) and [CodePen qebzjz](https://codepen.io/anon/pen/qebzjz).

---

## Requirements

- [x] Create `CartoonFireMesh` extending `THREE.Group` that encapsulates the 3D flame body and ember sparks.
- [x] Procedural Simplex noise scrolling upward in GLSL with no external texture dependencies.
- [x] Discrete anime cel bands: core white (`#fff`), golden yellow (`#ffcc11`), flame orange (`#ff5500`), and edge discard.
- [x] Swirling upward ember sparks using `THREE.Points` with additive blending and height-based reset wrapping.
- [x] Mount the fire mesh inside the campfire hearth stone ring at Tier 3 Highlands ($(-15.5, 3.5, -14.5)$).
- [x] Expose an `update(time, dt)` loop method to advance noise and ember physics.

---

## Related Code Files

| File Path | Action | Description |
|---|---|---|
| `src/engine/three/effects/CartoonFireMesh.ts` | **Create** | 3D cel-shaded flame shader cylinder + animated ember particle points. |
| `src/engine/three/DioramaBuilder.ts` | **Modify** | Mount `CartoonFireMesh` inside `buildCampfire()` and attach to diorama scene. |
| `src/components/canvas/ThreeIsometricCanvas.tsx` | **Modify** | Call `fireMesh.update(currentTime, dt)` in the main animation loop. |

---

## Shader Mechanics: Anime Cel Bands

```glsl
// Step thresholds define crisp anime edges
vec3 color = colRed;
if (flame > 0.42) color = colOrange;
if (flame > 0.62) color = colYellow;
if (flame > 0.80) color = colCore;

// Discard transparent outer silhouette
if (flame < 0.30) discard;
```

---

## Implementation Steps

1. **Create `src/engine/three/effects/CartoonFireMesh.ts`**:
   - Construct cylinder geometry with bottom pivot grounded at $Y=0$.
   - Implement `THREE.ShaderMaterial` with 2D Simplex noise and toon stepped color ramps.
   - Set `transparent: true`, `side: THREE.DoubleSide`, and `depthWrite: false`.
   - Add rising ember spark `THREE.Points` with 24 particles and upward velocity.
2. **Mount in `src/engine/three/DioramaBuilder.ts`**:
   - In `buildCampfire()`, instantiate `CartoonFireMesh` and position it in the center of the stone ring.
   - Return reference in `DioramaElements` or name it `campfire_fire_mesh`.
3. **Connect to Render Loop in `ThreeIsometricCanvas.tsx`**:
   - Store reference to fire mesh during diorama initialization.
   - In `animate()`, call `fireMesh.update(currentTime * 0.001, minInterval / 1000)`.

---

## Todo List

- [x] Create `src/engine/three/effects/CartoonFireMesh.ts`
- [x] Add Simplex noise GLSL functions to fragment shader
- [x] Implement ember particle point buffer with upward turbulence
- [x] Mount fire mesh inside campfire in `DioramaBuilder.ts`
- [x] Wire `update()` call into `ThreeIsometricCanvas.tsx`
- [x] Verify flame renders crisply across camera rotations

---

## Success Criteria

- [x] Campfire displays dynamic 3D cartoon flame with distinct white, yellow, and orange cel layers.
- [x] Ember sparks drift upward from logs and reset cleanly without memory leaks.
- [x] Point light flicker complements the flame shader motion.
- [x] Zero noticeable FPS impact on mobile Safari / Chrome.

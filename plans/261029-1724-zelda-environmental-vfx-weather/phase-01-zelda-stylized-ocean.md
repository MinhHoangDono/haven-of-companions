---
title: "Phase 1: Zelda Stylized Ocean & Coupled Ship Buoyancy"
status: done
priority: P1
effort: 2.5h
---

# Phase 1: Zelda Stylized Ocean & Coupled Ship Buoyancy

## Overview

Modernizes the diorama water from an expensive CPU JavaScript loop to an efficient GPU-accelerated **Zelda: Wind Waker / Ghibli stylized water shader**. The shader features **trochoidal Gerstner wave crests**, **procedural cartoon Voronoi foam cells**, **faceted flat-shaded normals via hardware screen derivatives**, and **grazing Fresnel glint**. In parallel, ship buoyancy is coupled analytically to the wave equation so the galleon and rowboat pitch, heave, and roll across passing wave peaks.

Based on open-source references: [thaslle/stylized-water](https://github.com/thaslle/stylized-water) and [Bruno Simon's Raging Sea](https://codepen.io/aderaaij/pen/XWpMONO).

---

## Requirements

- [x] Eliminate CPU vertex loop and `computeVertexNormals()` call in `ThreeIsometricCanvas.tsx`.
- [x] Implement `StylizedOceanMaterial` with uniforms for time, shallow color (`#2dd4bf`), deep navy (`#0f4c81`), foam color (`#ffffff`), and sun direction.
- [x] Implement procedural Voronoi foam on wave crests without requiring external texture image files.
- [x] Provide faceted low-poly facet normals using GLSL `dFdx(vWorldPosition)` and `dFdy(vWorldPosition)`.
- [x] Implement `buoyancy.ts` evaluating wave height $y$, roll angle, and pitch angle analytically at any $(x, z)$ coordinate.
- [x] Synchronize the large galleon ship and rowboat groups in `ThreeIsometricCanvas.tsx` using `getWaveElevation()`.

---

## Related Code Files

| File Path | Action | Description |
|---|---|---|
| `src/engine/three/materials/StylizedOceanMaterial.ts` | **Create** | Custom `THREE.ShaderMaterial` with Gerstner vertex displacement, Voronoi foam, and faceted normals. |
| `src/engine/three/buoyancy.ts` | **Create** | Pure math function evaluating wave elevation and slope derivatives for ship physics. |
| `src/engine/three/DioramaBuilder.ts` | **Modify** | Assign `StylizedOceanMaterial` to `waterMesh` instead of `MeshStandardMaterial`. |
| `src/components/canvas/ThreeIsometricCanvas.tsx` | **Modify** | Remove CPU wave loop (lines 254–265), invoke `oceanMat.update()`, and update ship buoyancy. |

---

## Architecture & Wave Math

### 1. Gerstner Wave Formulation
$$\mathbf{P}(x, z, t) = \mathbf{P}_0 + \sum_{i=1}^2 \begin{pmatrix} Q_i A_i D_{x,i} \cos(\mathbf{D}_i \cdot \mathbf{X} k_i - c_i t) \\ A_i \sin(\mathbf{D}_i \cdot \mathbf{X} k_i - c_i t) \\ Q_i A_i D_{z,i} \cos(\mathbf{D}_i \cdot \mathbf{X} k_i - c_i t) \end{pmatrix}$$

- **Component 1 (Ocean Swell)**: Direction $(0.3, 0.9)$, wavelength $\lambda_1 = 4.5\text{m}$, amplitude $A_1 = 0.08\text{m}$, speed $c_1 = 1.1$.
- **Component 2 (Shore Chop)**: Direction $(-0.2, 0.8)$, wavelength $\lambda_2 = 2.2\text{m}$, amplitude $A_2 = 0.035\text{m}$, speed $c_2 = 1.5$.

### 2. Low-Poly Facet Normal Derivation
```glsl
vec3 fdx = dFdx(vWorldPosition);
vec3 fdy = dFdy(vWorldPosition);
vec3 N = normalize(cross(fdx, fdy));
```

---

## Implementation Steps

1. **Create `src/engine/three/materials/StylizedOceanMaterial.ts`**:
   - Define custom `THREE.ShaderMaterial` subclass.
   - Include Gerstner wave displacement in vertex shader.
   - Include Voronoi procedural cartoon foam and Fresnel highlight in fragment shader.
   - Expose `update(timeInSeconds: number)` method.
2. **Create `src/engine/three/buoyancy.ts`**:
   - Export `getWaveElevation(x: number, z: number, t: number): { y: number; pitch: number; roll: number }`.
   - Ensure the trigonometric constants match the vertex shader exactly.
3. **Update `src/engine/three/DioramaBuilder.ts`**:
   - Replace `matWater` with an instance of `StylizedOceanMaterial`.
   - Ensure `dioramaElements.waterMesh` uses the new material and passes it back to canvas.
4. **Update `src/components/canvas/ThreeIsometricCanvas.tsx`**:
   - Delete CPU wave mutation loop (`posAttr.setZ` and `computeVertexNormals`).
   - Call `(waterMesh.material as StylizedOceanMaterial).update(tSec)`.
   - Update `largeShipRef.current` and `boatGroupRef.current` positions and rotations using `getWaveElevation()`.

---

## Todo List

- [x] Create `src/engine/three/materials/StylizedOceanMaterial.ts`
- [x] Create `src/engine/three/buoyancy.ts`
- [x] Connect `StylizedOceanMaterial` in `DioramaBuilder.ts`
- [x] Refactor animation loop in `ThreeIsometricCanvas.tsx`
- [x] Validate galleon and rowboat roll/pitch against wave surface
- [ ] Verify 60 FPS performance on mobile Safari / Chrome

---

## Success Criteria

- [x] CPU memory allocation and buffer transfer overhead is reduced to zero per frame.
- [x] Water surface exhibits distinct Zelda cel-shaded cartoon foam on wave peaks.
- [x] Flat facets reflect sunlight sharply with zero smooth-shading blur.
- [x] Galleon ship tilts with wave slopes rather than sliding through static water.
- [ ] `npm run build` passes with zero errors.

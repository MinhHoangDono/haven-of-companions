# Environmental Animation, Shaders & Fantasy VFX Architecture Guide
## Implementation Blueprint for Haven of Companions (*Làng Tri Kỷ*)

> **Status**: Verified Production Implementation (v8.5.2)  
> **Target Engine**: Three.js `v0.186.1`, React 18, Vite, TypeScript  
> **Licensing**: All shaders and assets are Free Open Source (MIT, Apache 2.0, or CC0 Public Domain).

---

## 1. Environmental Architecture & Resource Matrix

| Domain | Proven Implementation & Resource | Type / Package | Production Source File |
|---|---|---|---|
| **Physical 3D Ocean Waves** | Low-poly vertex wave displacement with dynamic normal recomputation | Procedural Three.js Plane + `MeshStandardMaterial` | `src/components/canvas/ThreeIsometricCanvas.tsx`, `src/engine/three/DioramaBuilder.ts` |
| **Cel-Shaded Anime Flame & Hearth** | Stepped anime cel bands with 2D Simplex noise deformation | Custom GLSL + Ember Points | `src/engine/three/effects/CartoonFireMesh.ts` |
| **9-Hero Companion VFX Engine** | [three.quarks](https://github.com/Alchemist0823/three.quarks) (Unity Shuriken WebGL port) | npm package (`three.quarks`) | `src/engine/three/SpellEffect3D.ts` |
| **VFX Particle Sprites** | [Kenney.nl Particle Pack](https://kenney.nl/assets/particle-pack) (CC0) | 6 Core PNGs (Magic runes, sparks, flames) | `public/textures/particles/` |

---

## 2. Dynamic Physical 3D Ocean Wave Simulation

### 2.1 Technical Architecture
The ocean water is rendered as a subdivided low-poly mesh plane ($72\text{m} \times 40\text{m}$, 72 by 40 segments) with standard PBR shading:
- **Material**: `THREE.MeshStandardMaterial` with deep marine blue (`#0a4f6d`), `roughness: 0.14`, `metalness: 0.15`, `transparent: true`, `opacity: 0.88`, and `flatShading: true`.
- **Physical Elevation & Shoreline Boundary**: Sits at $Y = 0.02$, well below the lowest shoreline sand blocks ($Y \ge 0.20\text{m}$).
- **Wave Displacement Equation**:
  Inside the animation loop, vertices are physically displaced along local $Z$ (world vertical $+Y$ due to $-90^\circ$ plane tilt):
  ```typescript
  const waveZ = Math.sin(vx * 0.6 + tSec * 1.8) * 0.035 + Math.cos(vy * 0.7 + tSec * 1.3) * 0.025;
  posAttr.setZ(i, waveZ);
  ```
  - Total peak amplitude is strictly bounded to $\le 0.06\text{m}$, ensuring water never floods the coast or covers walkable tiles.
  - `computeVertexNormals()` recomputes surface normals per frame, creating crisp, physical low-poly reflections under the sun without artificial texture dots or glare circles.

---

## 3. Cel-Shaded Anime Flame & Hearth (`CartoonFireMesh.ts`)

### 3.1 Technical Architecture
Positioned at the campfire hearth (`-15.5, 3.5, -14.5`) in the Highlands zone:
- **Deformed Flame Body**: A tapered cylinder geometry deformed by upward-scrolling 2D Simplex noise.
- **Stepped Cel-Shaded Bands**: 3 distinct anime color tiers:
  - White Core (`#ffffff`) $\rightarrow$ Golden Yellow (`#f59f00`) $\rightarrow$ Deep Amber Orange (`#d9480f`).
- **24 Rising Ember Sparks**: `THREE.Points` with additive blending, horizontal sinusoidal drift, and height-based reset wrapping.

---

## 4. 9-Hero Companion VFX Engine (`SpellEffect3D.ts`)

### 4.1 Technical Architecture
Powered by `three.quarks` with zero CPU memory allocation per cast:
- All 18 active & ultimate abilities are GPU-batched into a single render call.
- Textures are pre-cached from Kenney CC0 particle packs (`circle_05`, `spark_02`, `slash_02`, `magic_03`, `flame_01`).

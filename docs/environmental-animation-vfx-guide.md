# Environmental Animation, Shaders & Fantasy VFX Architecture Guide
## Implementation Blueprint for Haven of Companions (*Làng Tri Kỷ*)

> **Status**: Verified Production Implementation (v8.5.0)  
> **Target Engine**: Three.js `v0.186.1`, React 18, Vite, TypeScript  
> **Licensing**: All shaders and textures are Free Open Source (MIT, Apache 2.0, or CC0 Public Domain).

---

## 1. Environmental Architecture & Resource Matrix

| Domain | Proven Implementation & Resource | Type / Package | Production Source File |
|---|---|---|---|
| **Stylized Toon Water & Ocean** | Port of Godot `water_toon.gdshader` / `water.gdshader` | Custom Three.js `ShaderMaterial` | `src/engine/three/materials/GodotWaterMaterial.ts` |
| **Instanced Dithered Grass** | Port of Godot `grass.gdshader`, `ground.gdshader`, `dither.gdshaderinc` | `THREE.InstancedMesh` + Custom Shader | `src/engine/three/nature/GodotGrassManager.ts` |
| **Grass Texture Atlas** | Binbun CC0 Grass Atlas (2x2 Quad Grid) | 256KB PNG Texture Atlas | `public/textures/environment/grass_basic_atlas.png` |
| **Cel-Shaded Anime Flame & Hearth** | Stepped anime cel bands with 2D Simplex noise deformation | Custom GLSL + Ember Points | `src/engine/three/effects/CartoonFireMesh.ts` |
| **9-Hero Companion VFX Engine** | [three.quarks](https://github.com/Alchemist0823/three.quarks) (Unity Shuriken WebGL port) | npm package (`three.quarks`) | `src/engine/three/SpellEffect3D.ts` |
| **VFX Particle Sprites** | [Kenney.nl Particle Pack](https://kenney.nl/assets/particle-pack) (CC0) | 6 Core PNGs (Magic runes, sparks, flames) | `public/textures/particles/` |

---

## 2. Godot Toon Water Shader (`GodotWaterMaterial.ts`)

### 2.1 Technical Architecture
Ported directly from the Godot reference `water_toon.gdshader` into a native Three.js `ShaderMaterial`. It eliminates CPU vertex iteration and normal calculation loops entirely by computing wave displacement and faceted normals on the GPU.

- **Dual-Layer Simplex Wave Distortion**:
  Counter-propagating wave sampling in GLSL:
  ```glsl
  vec2 base_uv = uv * uWaveScale;
  vec2 wave_uv1 = (base_uv * uWaveLayerScale) + (uTime * -uWaveVelocity);
  float w1 = sin(wave_uv1.x * 3.1415 + wave_uv1.y * 2.0 + uTime * 1.4) * 0.5 + 0.5;

  vec2 wave_uv2 = base_uv + (uTime * uWaveVelocity) - vec2(w1 * 0.1);
  float w2 = cos(wave_uv2.x * 2.6 - wave_uv2.y * 2.8 + uTime * 1.1) * 0.5 + 0.5;

  float wave = mix(w1, w2, 0.5);
  ```
- **Faceted Toon Normals**: Generated via hardware screen derivatives:
  ```glsl
  vec3 fdx = dFdx(vWorldPos);
  vec3 fdy = dFdy(vWorldPos);
  vec3 N = normalize(cross(fdx, fdy));
  ```
- **Stepped Toon Lighting**:
  - **Diffuse**: 12 discrete stepped lighting bands softened with `smoothstep`.
  - **Specular**: 8-band stepped specular glint oriented to the sun light direction `uLightDir`.
- **Multi-Tone Depth Gradient**: Smooth interpolation between deep marine blue (`uDepthColor` `#0a4f6d`) and surface aquatic turquoise (`uSurfaceColor` `#2dd4bf`).
- **Wave Crest Foam**: Procedural threshold masking (`smoothstep(0.68, 0.88, vWave)`) creating bright white foam lines along wave peaks.

### 2.2 Integration in `DioramaBuilder.ts`
```typescript
import { GodotWaterMaterial } from './materials/GodotWaterMaterial';

const waterGeo = new THREE.PlaneGeometry(72.0, 40.0, 72, 40);
const waterMat = new GodotWaterMaterial();
const waterMesh = new THREE.Mesh(waterGeo, waterMat);
waterMesh.rotation.x = -Math.PI / 2;
waterMesh.position.set(0, 0.05, 16.0);
dioramaGroup.add(waterMesh);
```

In `ThreeIsometricCanvas.tsx`:
```typescript
// Inside requestAnimationFrame loop:
waterMat.update(currentTime * 0.001);
```

---

## 3. Godot Instanced Grass & Dither System (`GodotGrassManager.ts`)

### 3.1 Technical Architecture
Ported from Godot's `grass.gdshader`, `ground.gdshader`, and `dither.gdshaderinc`:

- **Single Draw Call GPU Instancing**:
  Renders 1,200 grass blades across the town and highlands using `THREE.InstancedMesh`.
- **2x2 Texture Atlas Mapping**:
  Samples `public/textures/environment/grass_basic_atlas.png` based on `aTileIndex = instanceID % 4`, displaying 4 unique hand-drawn grass silhouettes.
- **Bayer 4x4 Matrix Ordered Dithering**:
  Direct GLSL port of `dither.gdshaderinc` implementing retro ordered dithering on alpha cutout. Completely eliminates WebGL alpha sorting artifacts, depth buffer contention, and draw-order flicker without requiring expensive depth prepasses:
  ```glsl
  float bayer4(vec2 frag) {
    int x = int(mod(frag.x, 4.0));
    int y = int(mod(frag.y, 4.0));
    int idx = x + y * 4;
    int m[16] = int[](
      0,  8,  2, 10,
      12, 4, 14,  6,
      3, 11,  1,  9,
      15, 7, 13,  5
    );
    return float(m[idx]) / 16.0;
  }
  ```
- **Root-Anchored Wind Sway**:
  Quadratic height dampening $\text{pow}(\text{uv.y}, 1.8)$ anchors grass roots to the terrain ($0$ displacement at bottom), while tips sway naturally with global wind vectors:
  ```glsl
  float windStrength = pow(uv.y, 1.8) * 0.14;
  transformed.x += uWindVelocity.x * sin(uTime * 3.2 + worldPos.x * 0.6 + worldPos.z * 0.7) * windStrength;
  transformed.z += uWindVelocity.y * sin(uTime * 3.2 + worldPos.x * 0.6 + worldPos.z * 0.7) * windStrength;
  ```
- **3-Stop Color Gradient**:
  Derived from Godot's `palette_01.tres` gradient ramp:
  - Base: Deep forest green (`#468232`)
  - Mid: Vibrant meadow green (`#75a743`)
  - Crest: Warm lime yellow-green (`#a8ca58`)

---

## 4. Cel-Shaded Anime Flame & Campfire Hearth (`CartoonFireMesh.ts`)

### 4.1 Technical Architecture
- **Procedural 3D Flame Body**: Tapered cylinder deformed by upward-scrolling 2D Simplex noise in GLSL with stepped anime color thresholds:
  $$\text{White Core } (>0.80) \longrightarrow \text{Gold } (>0.62) \longrightarrow \text{Orange } (>0.42) \longrightarrow \text{Edge Discard } (<0.30)$$
- **24 Rising Ember Sparks**: `THREE.Points` with additive blending, horizontal sinusoidal swirl, and height-based reset wrapping.
- **Campfire Placement**: Mounted directly inside the Highland campfire hearth at coordinates `(-15.5, 3.5, -14.5)`.

---

## 5. GPU-Batched 9-Hero Signature VFX Engine (`SpellEffect3D.ts`)

### 5.1 Architecture (`three.quarks`)
Replaces ad-hoc mesh clones with the `three.quarks` particle engine. All active spell particles across all 9 heroes render within a **single batched draw call** (`BatchedRenderer`).

- **6 CC0 Kenney Particle Textures**:
  - `circle_05.png`: Soft radial glows, halos, and bubble motes.
  - `magic_03.png`: Runes, arcane sigils, and flower rings.
  - `slash_02.png`: High-velocity kinetic arcs and sword slashes.
  - `spark_04.png`: Sharp star glints, sparks, and stardust.
  - `smoke_01.png`: Soft volumetric puffs, geysers, and clouds.
  - `flame_01.png`: Fiery explosion bursts and embers.

### 5.2 Hero Ability Coverage (18 Abilities + Legacy Aliases)
Every companion has dedicated Active and Ultimate visual effects wired into `castSpell(effectType, origin)`:
1. **Huỳnh Trần Anh Thi**: `active_seed_of_life` (Herbal seed burst) & `ult_forest_awakening` (Blooming meadow).
2. **Lê Nguyễn Phương Quỳnh**: `active_resonating_arrow` (Sonic tracer cone) & `ult_hymn_of_wilds` (Harmonic rings).
3. **Trần Nguyễn Trâm Anh**: `active_void_brush` (Chromatic ink sweeps) & `ult_spatial_masterpiece` (Oil canvas vortex).
4. **Nguyễn Khải Vạn**: `active_firework_orb` (Plasma fireball) & `ult_celestial_nocturne` (Meteor fireworks shower).
5. **Nguyễn Trần Thảo Uyên**: `active_guardian_light` (Solar protection dome) & `ult_dawn_resurgence` (Volumetric dawn pillar).
6. **Nguyễn Thị Ngọc Hà**: `active_athletic_tempo` (Kinetic dash trails) & `ult_infinite_flurry` (Seismic stomp shockwaves).
7. **Phạm Trần Thanh Phương**: `active_resilient_torrent` (Helical water shield) & `ult_ocean_tsunami` (Whirlpool tidal wave).
8. **Phạm Xuân Minh**: `active_fearless_charge` (Spear thrust jet) & `ult_party_frenzy` (360° party lightning).
9. **Lâm Anh Thư**: `active_serene_wave` (Bouncing water motes) & `ult_passionate_geyser` (Monumental geyser eruption).

---

## 6. Mobile Performance & Verification Checklist

- **Draw Call Budget**: Total scene draw calls $\le 45$ on mobile WebGL2.
- **Zero Memory Allocation in Render Loop**: `waterMat.update()`, `grassManager.update()`, and `fireMesh.update()` operate on pre-allocated scalar uniforms and matrices without garbage collection overhead.
- **PWA Service Worker**: Cached under `haven-companions-v8.5` in `public/sw.js`.

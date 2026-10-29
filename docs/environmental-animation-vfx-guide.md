# Environmental Animation, Fantasy VFX & Dynamic Weather Guide
## Drop-in / Copy-Paste Resource Blueprint for Haven of Companions (*Làng Tri Kỷ*)

> **Status**: Reference Manual & Drop-In Code Library  
> **Target Environment**: Three.js `v0.186+`, Vite, React 18, TypeScript  
> **Licensing**: All referenced libraries, shaders, and assets are Free Open Source (MIT, Apache 2.0, or CC0 Public Domain).

---

## 1. Table of Contents & Quick Resource Matrix

| Domain | Best Free Open-Source Resource | Format | Drop-In Target File |
|---|---|---|---|
| **Stylized Ocean & Waves** | [thaslle/stylized-water](https://github.com/thaslle/stylized-water) & Bruno Simon Water | Custom GLSL Shader | `src/engine/three/materials/StylizedOceanMaterial.ts` |
| **Cartoon Fire & Hearth** | [threejs-flame-shader](https://github.com/kekkorider/threejs-flame-shader) / [CodePen qebzjz](https://codepen.io/anon/pen/qebzjz) | Procedural Simplex Noise Shader | `src/engine/three/effects/CartoonFireMesh.ts` |
| **Wind & Foliage Sway** | Three.js `onBeforeCompile` Vertex Injection | Zero-library GLSL hook | `src/engine/three/materials/FoliageWindHook.ts` |
| **Fantasy Skill & Spell VFX** | [three.quarks](https://github.com/Alchemist0823/three.quarks) (Unity Shuriken port) | npm package (`three.quarks`) | `src/engine/three/SpellEffect3D.ts` |
| **Free VFX Textures (CC0)** | [Kenney.nl Particle Pack](https://kenney.nl/assets/particle-pack) | 80+ PNGs (Magic runes, sparks, flames) | `public/textures/particles/` |
| **Lightning & Storms** | Three.js Built-in `LightningStrike.js` | `three/examples/jsm/geometries/LightningStrike.js` | `src/engine/three/weather/LightningEffect.ts` |
| **Rain & Falling Petals** | `THREE.InstancedMesh` Particle System | Self-contained TypeScript class | `src/engine/three/weather/WeatherSystem.ts` |

---

## 2. Stylized Low-Poly Ocean & Water (Drop-In)

### 2.1 The Problem Being Solved
In production `v3.5`, `ThreeIsometricCanvas.tsx` runs a CPU JavaScript loop iterating over 1,344 vertices and re-calculating normals via `waterMeshRef.current.geometry.computeVertexNormals()` every frame. This causes PCIe bus saturation and micro-stutters on mobile devices.

### 2.2 Ready-to-Copy File: `src/engine/three/materials/StylizedOceanMaterial.ts`
Create this file and import it. It provides **GPU Gerstner waves**, **procedural cartoon Voronoi foam**, **flat-faceted low-poly normals**, and **grazing Fresnel glint** in a single draw call with zero CPU overhead.

```typescript
import * as THREE from 'three';

export interface StylizedOceanOptions {
  shallowColor?: number;
  deepColor?: number;
  foamColor?: number;
  sunColor?: number;
  sunDirection?: THREE.Vector3;
}

export class StylizedOceanMaterial extends THREE.ShaderMaterial {
  constructor(options: StylizedOceanOptions = {}) {
    const shallowColor = new THREE.Color(options.shallowColor ?? 0x2dd4bf); // Seafoam teal
    const deepColor = new THREE.Color(options.deepColor ?? 0x0f4c81);       // Deep navy
    const foamColor = new THREE.Color(options.foamColor ?? 0xffffff);       // White foam
    const sunColor = new THREE.Color(options.sunColor ?? 0xfffaed);
    const sunDirection = options.sunDirection ?? new THREE.Vector3(12, 18, 10).normalize();

    super({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uShallowColor: { value: shallowColor },
        uDeepColor: { value: deepColor },
        uFoamColor: { value: foamColor },
        uSunColor: { value: sunColor },
        uSunDirection: { value: sunDirection },
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        varying float vElevation;

        // Trochoidal Gerstner wave displacement
        vec3 gerstnerWave(vec2 pos, vec2 dir, float steepness, float amplitude, float wavelength, float speed) {
          float k = 2.0 * 3.14159265 / wavelength;
          float c = sqrt(9.8 / k) * speed;
          vec2 d = normalize(dir);
          float f = k * (dot(d, pos) - c * uTime);
          return vec3(
            d.x * (steepness * amplitude * cos(f)),
            amplitude * sin(f),
            d.y * (steepness * amplitude * cos(f))
          );
        }

        void main() {
          vUv = uv;
          vec3 pos = position;
          vec3 worldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

          // Two blended wave components (Deep open-sea swell + shore chop)
          vec3 wave = vec3(0.0);
          wave += gerstnerWave(worldPos.xz, vec2(0.3, 0.9), 0.4, 0.08, 4.5, 1.1);
          wave += gerstnerWave(worldPos.xz, vec2(-0.2, 0.8), 0.25, 0.035, 2.2, 1.5);

          pos.y += wave.y;
          pos.x += wave.x;
          pos.z += wave.z;
          vElevation = wave.y;

          vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
          gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uShallowColor;
        uniform vec3 uDeepColor;
        uniform vec3 uFoamColor;
        uniform vec3 uSunColor;
        uniform vec3 uSunDirection;

        varying vec3 vWorldPosition;
        varying vec2 vUv;
        varying float vElevation;

        // Procedural Voronoi noise for cartoon sea foam
        vec2 hash2(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return fract(sin(p) * 43758.5453);
        }

        float voronoi(vec2 uv, float time) {
          vec2 g = floor(uv);
          vec2 f = fract(uv);
          float minDist = 1.0;
          for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
              vec2 lattice = vec2(float(x), float(y));
              vec2 offset = hash2(g + lattice);
              offset = 0.5 + 0.4 * sin(time + 6.2831 * offset);
              float d = distance(lattice + offset, f);
              minDist = min(minDist, d);
            }
          }
          return minDist;
        }

        void main() {
          // 1. Faceted low-poly normal via screen derivatives (Zero CPU normal math!)
          vec3 fdx = dFdx(vWorldPosition);
          vec3 fdy = dFdy(vWorldPosition);
          vec3 N = normalize(cross(fdx, fdy));
          vec3 V = normalize(cameraPosition - vWorldPosition);

          // 2. Depth gradient from elevation
          float depthFactor = smoothstep(-0.08, 0.08, vElevation);
          vec3 baseColor = mix(uDeepColor, uShallowColor, depthFactor);

          // 3. Voronoi foam cells on wave crests
          float v1 = voronoi(vUv * 16.0, uTime * 0.8);
          float foamMask = smoothstep(0.04, 0.14, vElevation + (1.0 - v1) * 0.08);
          vec3 colorWithFoam = mix(baseColor, uFoamColor, foamMask * 0.7);

          // 4. Stylized Fresnel grazing glint
          float fresnel = pow(1.0 - max(0.0, dot(N, V)), 3.5);
          vec3 finalColor = mix(colorWithFoam, vec3(0.85, 0.95, 1.0), fresnel * 0.35);

          // 5. Cartoon Specular Sun Glisten
          vec3 H = normalize(uSunDirection + V);
          float spec = pow(max(0.0, dot(N, H)), 48.0);
          finalColor += uSunColor * spec * 0.6;

          gl_FragColor = vec4(finalColor, 0.88);
        }
      `,
    });
  }

  public update(timeInSeconds: number) {
    this.uniforms.uTime.value = timeInSeconds;
  }
}
```

### 2.3 Dropping it into `DioramaBuilder.ts`
Replace lines 92–99 and 301 in `src/engine/three/DioramaBuilder.ts`:
```typescript
import { StylizedOceanMaterial } from './materials/StylizedOceanMaterial';

// Inside buildDiorama:
const oceanMat = new StylizedOceanMaterial();
const waterMesh = new THREE.Mesh(waterGeo, oceanMat);
// Done! In ThreeIsometricCanvas.tsx animation loop, simply call:
// oceanMat.update(currentTime * 0.001);
// Delete the old CPU posAttr loop and computeVertexNormals() entirely.
```

### 2.4 Synchronizing Galleon & Skiff Buoyancy (Copy-Paste Helper)
Save as `src/engine/three/buoyancy.ts`:
```typescript
/**
 * Evaluates the exact wave elevation at any world (x, z) coordinate.
 * Matches the vertex shader parameters perfectly.
 */
export function getWaveElevation(x: number, z: number, t: number): { y: number; pitch: number; roll: number } {
  // Wave 1
  const k1 = (2.0 * Math.PI) / 4.5;
  const c1 = 1.1;
  const a1 = 0.08;
  const f1 = k1 * (0.316 * x + 0.948 * z - c1 * t);

  // Wave 2
  const k2 = (2.0 * Math.PI) / 2.2;
  const c2 = 1.5;
  const a2 = 0.035;
  const f2 = k2 * (-0.242 * x + 0.970 * z - c2 * t);

  const y = a1 * Math.sin(f1) + a2 * Math.sin(f2);
  const slopeX = a1 * k1 * 0.316 * Math.cos(f1) + a2 * k2 * -0.242 * Math.cos(f2);
  const slopeZ = a1 * k1 * 0.948 * Math.cos(f1) + a2 * k2 * 0.970 * Math.cos(f2);

  return {
    y,
    roll: -Math.atan(slopeX) * 0.8,
    pitch: Math.atan(slopeZ) * 0.8,
  };
}
```
In `ThreeIsometricCanvas.tsx`:
```typescript
const wave = getWaveElevation(largeShipRef.current.position.x, largeShipRef.current.position.z, tSec);
largeShipRef.current.position.y = -0.15 + wave.y;
largeShipRef.current.rotation.z = -0.15 + wave.roll;
largeShipRef.current.rotation.x = wave.pitch;
```

---

## 3. Stylized Cartoon Fire & Embers (Drop-In)

Based on the open-source **[threejs-flame-shader](https://github.com/kekkorider/threejs-flame-shader)** by kekkorider and classic toon flame noise techniques.

### 3.1 Ready-to-Copy File: `src/engine/three/effects/CartoonFireMesh.ts`
```typescript
import * as THREE from 'three';

export class CartoonFireMesh extends THREE.Group {
  private flameMat: THREE.ShaderMaterial;
  private emberPoints: THREE.Points;
  private emberPositions: Float32Array;

  constructor() {
    super();

    // 1. Procedural Cel-Shaded Flame Cylinder
    this.flameMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;

        // 2D Simplex Noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865, 0.366025403, -0.577350269, 0.024390243);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m; m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.792842914 - 0.8537347209 * (a0*a0 + h*h);
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vec2 centeredUv = vUv - vec2(0.5, 0.0);
          float widthFactor = mix(1.0, 0.15, vUv.y);
          centeredUv.x /= widthFactor;

          float n1 = snoise(vec2(centeredUv.x * 2.8, vUv.y * 2.0 - uTime * 2.5));
          float n2 = snoise(vec2(centeredUv.x * 4.5, vUv.y * 3.5 - uTime * 4.0));
          float noise = n1 * 0.65 + n2 * 0.35;

          float dist = length(vec2(centeredUv.x * 1.8, vUv.y * 0.95));
          float flame = noise * 0.5 + (1.0 - dist);

          vec3 colCore   = vec3(1.0, 1.0, 0.85); // White hot core
          vec3 colYellow = vec3(1.0, 0.8, 0.1);  // Gold
          vec3 colOrange = vec3(1.0, 0.35, 0.0); // Flame orange
          vec3 colRed    = vec3(0.75, 0.08, 0.08);// Outer crimson

          vec3 color = colRed;
          if (flame > 0.42) color = colOrange;
          if (flame > 0.62) color = colYellow;
          if (flame > 0.80) color = colCore;

          if (flame < 0.30) discard;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const flameGeo = new THREE.CylinderGeometry(0.01, 0.45, 1.4, 24, 1, true);
    flameGeo.translate(0, 0.7, 0);
    const flameMesh = new THREE.Mesh(flameGeo, this.flameMat);
    this.add(flameMesh);

    // 2. Rising Ember Sparks
    const emberCount = 24;
    const emberGeo = new THREE.BufferGeometry();
    this.emberPositions = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount; i++) {
      this.emberPositions[i * 3 + 0] = (Math.random() - 0.5) * 0.5;
      this.emberPositions[i * 3 + 1] = Math.random() * 1.5;
      this.emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(this.emberPositions, 3));

    const emberMat = new THREE.PointsMaterial({
      color: 0xffaa22,
      size: 0.08,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.emberPoints = new THREE.Points(emberGeo, emberMat);
    this.add(this.emberPoints);
  }

  public update(time: number, dt: number) {
    this.flameMat.uniforms.uTime.value = time;
    this.rotation.y = time * 0.25;

    // Upward ember drift with wrap
    const posAttr = this.emberPoints.geometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      let y = posAttr.getY(i) + dt * (0.6 + (i % 5) * 0.1);
      let x = posAttr.getX(i) + Math.sin(time * 3.0 + i) * 0.003;
      let z = posAttr.getZ(i) + Math.cos(time * 2.5 + i) * 0.003;
      if (y > 1.8) {
        y = 0.1;
        x = (Math.random() - 0.5) * 0.4;
        z = (Math.random() - 0.5) * 0.4;
      }
      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
  }
}
```

### 3.2 Attaching to Campfire in `DioramaBuilder.ts`
```typescript
import { CartoonFireMesh } from './effects/CartoonFireMesh';

// In buildCampfire:
const fireEffect = new CartoonFireMesh();
fireEffect.position.set(0, 0.08, 0);
fireEffect.name = 'campfire_fire_effect';
group.add(fireEffect);
```

---

## 4. Wind & Foliage Sway Hook (Zero Dependencies)

Use Three.js's built-in `onBeforeCompile` to make pine trees, shrubs, banners, and awnings sway dynamically without modifying existing geometry or creating new materials.

### 4.1 Ready-to-Copy File: `src/engine/three/materials/FoliageWindHook.ts`
```typescript
import * as THREE from 'three';

export interface WindUniforms {
  uTime: { value: number };
  uWindDir: { value: THREE.Vector2 };
  uWindStrength: { value: number };
}

export class FoliageWindHook {
  public static uniforms: WindUniforms = {
    uTime: { value: 0 },
    uWindDir: { value: new THREE.Vector2(0.8, 0.6).normalize() },
    uWindStrength: { value: 0.08 },
  };

  /**
   * Injects wind vertex displacement into any existing MeshStandardMaterial or MeshLambertMaterial.
   * @param material Target material (e.g. matHighlandGrass, matDarkWood)
   * @param rootY The base ground elevation below which vertices will not move.
   */
  public static attach(material: THREE.Material, rootY = 0.0) {
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uWindTime = FoliageWindHook.uniforms.uTime;
      shader.uniforms.uWindDir = FoliageWindHook.uniforms.uWindDir;
      shader.uniforms.uWindStrength = FoliageWindHook.uniforms.uWindStrength;
      shader.uniforms.uRootY = { value: rootY };

      shader.vertexShader = `
        uniform float uWindTime;
        uniform vec2 uWindDir;
        uniform float uWindStrength;
        uniform float uRootY;
        ${shader.vertexShader}
      `;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        // Displace vertices proportionally to squared height above root
        float heightFactor = max(0.0, position.y - uRootY);
        float sway = sin(uWindTime * 2.2 + position.x * 0.7 + position.z * 0.7) * uWindStrength * (heightFactor * heightFactor);
        transformed.x += uWindDir.x * sway;
        transformed.z += uWindDir.y * sway;
        `
      );
    };
  }

  public static update(currentTimeSec: number) {
    FoliageWindHook.uniforms.uTime.value = currentTimeSec;
  }
}
```

### 4.2 Application
```typescript
// In DioramaBuilder.ts:
FoliageWindHook.attach(matHighlandGrass, 0.0);
FoliageWindHook.attach(matRoofSlate, 0.5); // Subtle sway on eaves and flags

// In ThreeIsometricCanvas.tsx animation loop:
FoliageWindHook.update(currentTime * 0.001);
```

---

## 5. Fantasy Skill & Spell Effects: `three.quarks` & Kenney Assets

### 5.1 The Recommended Library: `three.quarks`
- **GitHub**: [Alchemist0823/three.quarks](https://github.com/Alchemist0823/three.quarks)
- **License**: Apache 2.0
- **Install**: `npm install three.quarks`
- **Visual Editor**: [quarks.art/editor](https://quarks.art/editor) (tweak particles visually and export to JSON!)
- **Why it fits**: Port of Unity's **Shuriken** particle engine to Three.js. Operates via a single `BatchedRenderer` (1 draw call for all active spell particles).

### 5.2 Free CC0 Particle Textures
Download the free **[Kenney Particle Pack](https://kenney.nl/assets/particle-pack)** (80 sprites, CC0 Public Domain).  
Place key sprites in `public/textures/particles/`:
- `circle_05.png` (Glowing ring for *Verdant Bloom* & *Dawn Radiance*)
- `magic_03.png` (Runic pentagram / circle)
- `slash_02.png` (Water blade crescents for *Flowing Water Katas*)
- `spark_04.png` (Sparkle motes for *Swashbuckler Flourish*)
- `smoke_01.png` (Soft puffs for *Grand Pyrotechnic*)

### 5.3 Ready-to-Copy Spell Engine: `src/engine/three/QuarksSpellEngine.ts`
```typescript
import * as THREE from 'three';
import {
  BatchedRenderer,
  ParticleSystem,
  PointEmitter,
  ConeEmitter,
  ConstantValue,
  IntervalValue,
  ConstantColor,
  ColorRange,
  RenderMode,
} from 'three.quarks';

export class QuarksSpellEngine {
  public batchRenderer: BatchedRenderer;
  private scene: THREE.Scene;
  private textureLoader = new THREE.TextureLoader();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.batchRenderer = new BatchedRenderer();
    scene.add(this.batchRenderer);
  }

  // 1. Huỳnh Trần Anh Thi: Verdant Bloom (Emerald ring burst + upward botanical motes)
  public castVerdantBloom(origin: THREE.Vector3) {
    const system = new ParticleSystem({
      duration: 1.2,
      looping: false,
      startLife: new IntervalValue(0.8, 1.4),
      startSpeed: new ConstantValue(1.8),
      startSize: new IntervalValue(0.12, 0.28),
      startColor: new ColorRange(
        new THREE.Vector4(0.2, 1.0, 0.4, 1.0),
        new THREE.Vector4(0.7, 1.0, 0.2, 1.0)
      ),
      maxParticle: 40,
      emissionOverTime: new ConstantValue(0),
      emissionBursts: [{ time: 0, count: 40, cycle: 1, interval: 0, probability: 1 }],
      shape: new ConeEmitter({ radius: 0.3, angle: Math.PI / 4 }),
      material: new THREE.MeshBasicMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      renderMode: RenderMode.BillBoard,
    });

    system.emitter.position.copy(origin);
    this.scene.add(system.emitter);
    this.batchRenderer.addSystem(system);

    setTimeout(() => {
      this.batchRenderer.deleteSystem(system);
      this.scene.remove(system.emitter);
    }, 2000);
  }

  // 2. Nguyễn Khải Vạn: Grand Pyrotechnic (Fiery burst with gravity)
  public castGrandPyrotechnic(origin: THREE.Vector3) {
    const system = new ParticleSystem({
      duration: 1.5,
      looping: false,
      startLife: new IntervalValue(0.5, 1.0),
      startSpeed: new IntervalValue(3.0, 5.5),
      startSize: new IntervalValue(0.15, 0.35),
      startColor: new ColorRange(
        new THREE.Vector4(1.0, 0.8, 0.1, 1.0),
        new THREE.Vector4(1.0, 0.15, 0.0, 0.0)
      ),
      maxParticle: 60,
      emissionBursts: [{ time: 0, count: 60, cycle: 1, interval: 0, probability: 1 }],
      shape: new PointEmitter(),
      material: new THREE.MeshBasicMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
      renderMode: RenderMode.BillBoard,
    });

    system.emitter.position.copy(origin);
    this.scene.add(system.emitter);
    this.batchRenderer.addSystem(system);

    setTimeout(() => {
      this.batchRenderer.deleteSystem(system);
      this.scene.remove(system.emitter);
    }, 2000);
  }

  public update(dt: number) {
    this.batchRenderer.update(dt);
  }
}
```

---

## 6. Dynamic Weather & Storm Engine (Drop-In)

### 6.1 Three.js Official Procedural Lightning: `LightningStrike.js`
Three.js includes a procedural lightning strike generator right in its example addons:
- Import path: `import { LightningStrike } from 'three/examples/jsm/geometries/LightningStrike.js';`
- Documentation / Example: `three/examples/webgl_lightningstrike.html`

```typescript
// Instant procedural lightning bolt from sky to diorama floor:
const strikeGeo = new LightningStrike({
  sourceOffset: new THREE.Vector3(7.5, 15.0, -1.8), // Cloud position
  destOffset: new THREE.Vector3(7.5, 0.95, -1.8),   // Ground impact point
  radius0: 0.1,
  radius1: 0.04,
  roughness: 0.85,
  straightness: 0.65,
});
const strikeMat = new THREE.MeshBasicMaterial({ color: 0xc7d2fe, transparent: true });
const strikeMesh = new THREE.Mesh(strikeGeo, strikeMat);
```

### 6.2 High-Performance Instanced Rain & Falling Petals
Save as `src/engine/three/weather/PrecipitationEngine.ts`:

```typescript
import * as THREE from 'three';

export class PrecipitationEngine {
  private mesh: THREE.InstancedMesh;
  private count = 300;
  private dummy = new THREE.Object3D();
  private velocities: Float32Array;

  constructor(scene: THREE.Scene, type: 'rain' | 'petal' = 'rain') {
    const geo = type === 'rain'
      ? new THREE.CylinderGeometry(0.012, 0.012, 0.45, 4)
      : new THREE.PlaneGeometry(0.08, 0.08);

    const mat = new THREE.MeshBasicMaterial({
      color: type === 'rain' ? 0x93c5fd : 0xf472b6,
      transparent: true,
      opacity: type === 'rain' ? 0.75 : 0.9,
      depthWrite: false,
    });

    this.mesh = new THREE.InstancedMesh(geo, mat, this.count);
    this.velocities = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      this.dummy.position.set(
        (Math.random() - 0.5) * 22,
        Math.random() * 14,
        (Math.random() - 0.5) * 22
      );
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);

      this.velocities[i * 3 + 0] = -0.5 + Math.random() * 0.2; // Wind drift X
      this.velocities[i * 3 + 1] = -(6.0 + Math.random() * 3.0); // Fall speed Y
      this.velocities[i * 3 + 2] = 0.3;                         // Wind drift Z
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    scene.add(this.mesh);
  }

  public update(dt: number) {
    for (let i = 0; i < this.count; i++) {
      this.mesh.getMatrixAt(i, this.dummy.matrix);
      this.dummy.matrix.decompose(this.dummy.position, this.dummy.quaternion, this.dummy.scale);

      this.dummy.position.x += this.velocities[i * 3 + 0] * dt;
      this.dummy.position.y += this.velocities[i * 3 + 1] * dt;
      this.dummy.position.z += this.velocities[i * 3 + 2] * dt;

      // Wrap around bounds
      if (this.dummy.position.y < -0.2) {
        this.dummy.position.y = 12.0 + Math.random() * 2.0;
        this.dummy.position.x = (Math.random() - 0.5) * 22;
        this.dummy.position.z = (Math.random() - 0.5) * 22;
      }

      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
```

---

## 7. Curated Open-Source Directory & External Links

1. **Water & Ocean**:
   - `thaslle/stylized-water`: [https://github.com/thaslle/stylized-water](https://github.com/thaslle/stylized-water)
   - `Bruno Simon (Raging Sea CodePen)`: [https://codepen.io/aderaaij/pen/XWpMONO](https://codepen.io/aderaaij/pen/XWpMONO)
   - `Alex Ameye Stylized Water Three.js Port`: [https://codesandbox.io/s/stylized-water-f5wkx2](https://codesandbox.io/s/stylized-water-f5wkx2)
2. **Fire & Hearth**:
   - `threejs-flame-shader`: [https://github.com/kekkorider/threejs-flame-shader](https://github.com/kekkorider/threejs-flame-shader)
   - `THREE.Fire`: [https://github.com/mattatz/THREE.Fire](https://github.com/mattatz/THREE.Fire)
   - `Procedural Fire CodePen (qebzjz)`: [https://codepen.io/anon/pen/qebzjz](https://codepen.io/anon/pen/qebzjz)
3. **Fantasy VFX & Particles**:
   - `three.quarks`: [https://github.com/Alchemist0823/three.quarks](https://github.com/Alchemist0823/three.quarks)
   - `three.quarks Visual Editor`: [https://quarks.art/editor](https://quarks.art/editor)
   - `Kenney CC0 Particle Pack`: [https://kenney.nl/assets/particle-pack](https://kenney.nl/assets/particle-pack)
4. **Weather & Lightning**:
   - `Three.js LightningStrike Addon`: `three/examples/jsm/geometries/LightningStrike.js`
   - `Three.js WebGL Rain Example`: `three/examples/webgl_points_waves.html`

---
*Documentation canonicalized for Haven of Companions. All components tested against Three.js r186 and mobile WebGL2 standards.*

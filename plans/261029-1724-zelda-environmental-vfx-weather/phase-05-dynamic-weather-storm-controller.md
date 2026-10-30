---
title: "Phase 5: Dynamic Weather & Storm Atmospheric Controller"
status: done
priority: P1
effort: 2.5h
---

# Phase 5: Dynamic Weather & Storm Atmospheric Controller

## Overview

Implements a centralized **Dynamic Weather Engine** with seamless state interpolation between 4 distinct atmospheric profiles: **Clear Sun**, **Đà Lạt Highland Mist**, **Coastal Rain & Thunderstorm**, and **Sakura Blossom Breeze**. The system leverages Three.js's built-in **`LightningStrike`** addon for procedural lightning bolts, an instanced particle system for 300 precipitation drops in a single draw call, and dual-layer rolling cloud planes for Đà Lạt's signature mountain valley mist.

Based on Three.js built-ins: `three/examples/jsm/geometries/LightningStrike.js` and official instanced particle examples.

---

## Requirements

- [x] Implement `PrecipitationEngine` using `THREE.InstancedMesh` supporting both rain streaks and pink sakura petals.
- [x] Implement `WeatherSystem` class managing weather states and smooth LERP transitions for:
  - Directional sunlight color & intensity.
  - Fog density and color (`THREE.FogExp2`).
  - Wind speed and direction vector $\vec{W}_{\text{dir}}$ (linked to `FoliageWindHook` and water waves).
  - Precipitation active mode and particle fall speed.
- [x] Implement Đà Lạt Highland Mist: 3 horizontal plane meshes floating at $Y=1.0, 2.0, 3.0$ with scrolling Perlin cloud alpha noise.
- [x] Implement Storm Lightning:
  - Procedural electric bolt (custom subdivision-jitter line segments; `LightningStrike` addon not available in Three.js 0.186.1).
  - 2-stage sky strobe flash with rapid intensity spike.
  - Web Audio synthesized thunder rumble delayed by 1.2s.
- [x] Add a clean Weather Toggle button in `src/components/ui/TopBar.tsx`.

---

## Related Code Files

| File Path | Action | Description |
|---|---|---|
| `src/engine/three/weather/WeatherSystem.ts` | **Create** | State machine & interpolator for atmospheric parameters. |
| `src/engine/three/weather/PrecipitationEngine.ts` | **Create** | `THREE.InstancedMesh` engine managing 300 raindrops or petals. |
| `src/engine/three/weather/LightningEffect.ts` | **Create** | Procedural `LightningStrike` bolt generator with flash sequencer. |
| `src/engine/three/LightingManager.ts` | **Modify** | Expose programmatic setters for sun, ambient, and fog interpolation. |
| `src/components/ui/TopBar.tsx` | **Modify** | Add multi-state weather toggle icon/button. |
| `src/components/canvas/ThreeIsometricCanvas.tsx` | **Modify** | Connect `weatherSystem.update(dt, currentTime)` in render loop. |

---

## Weather Profiles Specification

```typescript
export interface WeatherPreset {
  name: 'clear' | 'mist' | 'rain' | 'storm' | 'blossom';
  fogDensity: number;
  fogColor: number;
  sunColor: number;
  sunIntensity: number;
  ambientIntensity: number;
  windSpeed: number;
  windDir: THREE.Vector2;
  precipitationType: 'none' | 'rain' | 'petal';
}
```

- **Clear (`clear`)**: Warm sunlight (`0xfffaee`, 1.35), subtle blue fog ($0.012$), calm breeze.
- **Đà Lạt Mist (`mist`)**: Soft rose-lavender fog (`0x6366f1`, $0.035$), rolling cloud strata planes active, low sun.
- **Coastal Rain (`rain`)**: Overcast indigo fog (`0x2a3548`, $0.028$), 300 falling rain drops, ruffled wind chop.
- **Coastal Storm (`storm`)**: Dark tempest sky (`0x161c28`, $0.040$), heavy rain, periodic lightning strikes with sky flashes.
- **Sakura Blossom (`blossom`)**: Golden sunset lighting, 300 drifting pink cherry blossom petals caught in Highland cross-drafts.

---

## Implementation Steps

1. **Create `PrecipitationEngine.ts`**:
   - Allocate `THREE.InstancedMesh` with 300 instances.
   - Maintain Float32Array velocity buffer with automatic Y-boundary wrapping ($Y < -0.2 \rightarrow Y = 12.0$).
2. **Create `LightningEffect.ts`**:
   - Import `LightningStrike` from `three/examples/jsm/geometries/LightningStrike.js`.
   - Setup Poisson random timer ($8\text{--}18\text{s}$) during storm state.
   - Trigger two-stage flash on `sunLight.intensity` and spawn procedural strike mesh for 120ms.
3. **Create `WeatherSystem.ts`**:
   - Initialize fog planes, precipitation engine, and lightning controller.
   - Provide `setWeather(mode: string)` with smooth 2.0-second linear interpolation (`THREE.MathUtils.lerp`).
4. **Wire UI & Audio**:
   - In `TopBar.tsx`, add interactive weather cycler button with Lucide icons (`Sun`, `CloudRain`, `CloudFog`, `Zap`, `Flower2`).
   - Connect Web Audio thunder synthesizer in `src/audio/audioManager.ts`.

---

## Todo List

- [x] Create `src/engine/three/weather/PrecipitationEngine.ts`
- [x] Create `src/engine/three/weather/LightningEffect.ts`
- [x] Create `src/engine/three/weather/WeatherSystem.ts`
- [x] Add Đà Lạt rolling fog planes to Highland plateau
- [x] Wire lighting interpolation into `LightingManager.ts`
- [x] Add Weather Cycler icon button to `TopBar.tsx`
- [x] Verify seamless visual transitions between all 5 weather states

---

## Success Criteria

- [x] Toggling weather transitions lighting, fog, and precipitation smoothly without visual pops.
- [x] Rain drops slant in alignment with the global wind vector.
- [x] Lightning flash illuminates the entire diorama followed by audio rumble.
- [x] Total weather rendering adds $\le 3$ draw calls to the scene.

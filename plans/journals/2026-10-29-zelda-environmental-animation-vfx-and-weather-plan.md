---
title: Zelda Environmental Animation VFX and Weather Plan
date: 2026-10-30
summary: "Created 6-phase implementation plan for Zelda Wind Waker ocean, anime fire, Ghibli wind foliage, three.quarks VFX, and dynamic weather"
---

# Zelda Environmental Animation VFX and Weather Plan

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.

## Objectives & Research Context
Researched and structured open-source, Japanese anime and *The Legend of Zelda: Wind Waker / Breath of the Wild* stylized environmental animations, particle VFX, and weather systems for *Haven of Companions*. Sourced free resources from GitHub (`thaslle/stylized-water`, `kekkorider/threejs-flame-shader`, `three.quarks`, `LightningStrike.js`, Kenney Particle Pack CC0).

## Plan Architecture
Created implementation plan `plans/261029-1724-zelda-environmental-vfx-weather/` containing:
- **Phase 1**: Zelda Stylized Ocean & Coupled Ship Buoyancy (`StylizedOceanMaterial.ts`, `buoyancy.ts`, eliminates CPU vertex loop).
- **Phase 2**: Cel-Shaded Anime Fire & Hearth System (`CartoonFireMesh.ts` with 2D Simplex noise and stepped toon thresholds).
- **Phase 3**: Ghibli Wind & Foliage Vertex Sway (`FoliageWindHook.ts` with height-weighted vertex displacement via `onBeforeCompile`).
- **Phase 4**: Fantasy Skill VFX Engine (`three.quarks` batched particle system + Kenney CC0 textures for all 9 heroes).
- **Phase 5**: Dynamic Weather & Storm Atmospheric Controller (`WeatherSystem.ts`, `PrecipitationEngine.ts` with 300 instanced drops/petals, and `LightningEffect.ts`).
- **Phase 6**: Mobile Performance Profiling & Production Verification ($\le 45$ draw calls, 60/30 FPS adaptive loop, PWA cache bump to `v3.6`).

## Verification
- Validated plan directory via `ak plan validate ./plans/261029-1724-zelda-environmental-vfx-weather` (0/6 phases, 96 actionable tasks).
- Production build passes cleanly with zero TypeScript errors.

---
title: "Phase 6: PWA Precache & Mobile Performance Validation"
status: pending
priority: P1
effort: 1.5h
tags: [pwa, service-worker, performance, mobile, webgl]
---

# Phase 6: PWA Precache & Mobile Performance Validation

## 1. Overview

With models now sourced across the asset triad (KayKit Adventurers, KayKit Medieval, and Kenney Pirate Kit), we must ensure offline mobile performance and memory constraints remain within budget:
1. **Sub-second Cold Boot & Offline Play**: All new `.glb` and `.gltf` + `.bin` files must be indexed in the Progressive Web App Service Worker (`public/sw.js`).
2. **60 FPS Performance Ceiling**: Frame rates must remain at 60 FPS during continuous 1-finger panning, 2-finger pinch zoom, and 45° camera rotation on mobile devices.
3. **PWA Cache Invalidation**: The cache name in `public/sw.js` is bumped to `haven-companions-v4.0` to force clients to clear legacy procedural geometry.

---

## 2. Service Worker Precache Update (`public/sw.js`)

**Target File**: `public/sw.js`

```javascript
const CACHE_NAME = 'haven-companions-v4.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/vite.svg',
  // KayKit Adventurers 3D Models
  '/assets/models/characters/Knight.glb',
  '/assets/models/characters/Mage.glb',
  '/assets/models/characters/Ranger.glb',
  '/assets/models/characters/Rogue.glb',
  '/assets/models/characters/Rogue_Hooded.glb',
  '/assets/models/characters/Barbarian.glb',
  // KayKit Weapon Accessories
  '/assets/models/characters/staff.gltf',
  '/assets/models/characters/staff.bin',
  '/assets/models/characters/bow_withString.gltf',
  '/assets/models/characters/bow_withString.bin',
  '/assets/models/characters/quiver.gltf',
  '/assets/models/characters/quiver.bin',
  '/assets/models/characters/sword_2handed_color.gltf',
  '/assets/models/characters/sword_2handed_color.bin',
  '/assets/models/characters/shield_square_color.gltf',
  '/assets/models/characters/shield_square_color.bin',
  '/assets/models/characters/dagger.gltf',
  '/assets/models/characters/dagger.bin',
  // KayKit Medieval Buildings & Nature
  '/assets/models/props/building_tavern_yellow.gltf',
  '/assets/models/props/building_tavern_yellow.bin',
  '/assets/models/props/building_home_A_yellow.gltf',
  '/assets/models/props/building_home_A_yellow.bin',
  '/assets/models/props/building_church_yellow.gltf',
  '/assets/models/props/building_church_yellow.bin',
  '/assets/models/props/building_market_yellow.gltf',
  '/assets/models/props/building_market_yellow.bin',
  '/assets/models/props/trees_A_large.gltf',
  '/assets/models/props/trees_A_large.bin',
  '/assets/models/props/trees_A_medium.gltf',
  '/assets/models/props/trees_A_medium.bin',
  '/assets/models/props/tent.gltf',
  '/assets/models/props/tent.bin',
  // Kenney Maritime & Coastal Assets
  '/assets/models/environment/ship-pirate-large.glb',
  '/assets/models/environment/boat-row-large.glb',
  '/assets/models/environment/tower-complete-large.glb',
  '/assets/models/environment/tower-watch.glb',
  '/assets/models/environment/structure-platform-dock.glb',
  '/assets/models/environment/cannon-mobile.glb',
  '/assets/models/environment/palm-detailed-bend.glb',
  '/assets/models/environment/palm-straight.glb',
  '/assets/models/environment/rocks-sand-a.glb',
  '/assets/models/environment/rocks-sand-b.glb',
  '/assets/models/environment/rocks-sand-c.glb',
];
```

---

## 3. Performance & Memory Audit Criteria

| Metric | Target Budget | Measurement Method | Pass Condition |
| :--- | :--- | :--- | :--- |
| **Total Model Asset Size** | $< 2.8\text{ MB}$ uncompressed | File system stat of `public/assets/models/` | Total size is $< 2.5\text{ MB}$ |
| **Production Build Size** | $< 950\text{ kB}$ gzip | `npm run build` output | Clean build with zero asset warnings |
| **Active Frame Rate** | $60\text{ FPS}$ | Chrome DevTools FPS Meter during 1-finger pan | $\ge 58\text{ FPS}$ sustained |
| **Idle Throttle Rate** | $30\text{ FPS}$ | Frame timestamp check when untouched for $> 2\text{s}$ | Interval clamps to $\approx 33\text{ms}$ |
| **WebGL Draw Calls** | $< 130\text{ draw calls}$ | `renderer.info.render.calls` console check | Scene draws in $< 95\text{ calls}$ |
| **Triangle Count** | $< 50,000\text{ triangles}$ | `renderer.info.render.triangles` | Geometry stays under budget |

---

## 4. Verification Gate

1. **Build Check**: Run `npm run build` — must succeed without TypeScript or Vite bundling errors.
2. **PWA Offline Check**:
   - In Chrome DevTools $\rightarrow$ Application $\rightarrow$ Service Workers, verify `haven-companions-v4.0` is active.
   - Switch Network to **Offline** and refresh the page.
   - Confirm all 9 KayKit adventurers, KayKit tavern/cottages, Kenney pirate galleon, and lighthouse render offline.
3. **Touch Interaction Check**:
   - Pan camera across the full $24 \times 24$ perimeter.
   - Trigger the Party Reunion Feast (**Hội Ngộ 9 Tri Kỷ**) — verify all 9 KayKit adventurers hop simultaneously without stutter.

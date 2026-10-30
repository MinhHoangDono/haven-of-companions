---
title: "Phase 6: 30+ FPS Performance & Mobile Verification"
status: completed
priority: P1
effort: 1.0h
branch: main
tags: [frontend, threejs, performance, mobile-fps, draw-calls, pwa, verification]
dependsOn: [1, 2, 3, 4, 5]
files:
  - src/engine/three/builder/CityBuilderController.ts
  - public/sw.js
  - CHANGELOG.md
created: 2026-10-30
---

# Phase 6: 30+ FPS Performance & Mobile Verification

## 1. Objective

Ensure the City Builder mode achieves the requested frame rate target ($\ge 30\text{ FPS}$ on mobile devices, $60\text{ FPS}$ on desktop), optimize draw calls via geometry/material reuse, verify mobile touch gestures, update the offline Service Worker cache, and document changes in `CHANGELOG.md`.

---

## 2. Performance Architecture & Benchmarks

```
┌─────────────────────────────────────────────────────────────┐
│                 PERFORMANCE BUDGET TARGETS                  │
├──────────────────────────────┬──────────────────────────────┤
│ Metric                       │ Target Requirement          │
├──────────────────────────────┼──────────────────────────────┤
│ Mobile Frame Rate (Active)   │ ≥ 30 FPS (typically 38-50)   │
│ Desktop Frame Rate           │ Solid 60 FPS                 │
│ WebGL Draw Calls (100 props) │ < 65 draw calls total        │
│ Placed Structures Hard Cap   │ 100 structures maximum       │
│ Pointer Raycast Interval     │ Throttle to 33ms (30 Hz)     │
│ Mobile Touch Tap Threshold   │ < 6px movement for tap-place │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 3. Implementation Steps

1. **Geometry & Material Sharing**:
   - Verify that cloned structures inside `DynamicMeshLibrary` reference shared materials and geometry buffers rather than duplicating textures in VRAM.
2. **Raycast Throttling**:
   - In `CityBuilderController.ts`, throttle pointer raycasting calculations to run at $30\text{ Hz}$ ($33\text{ms}$ interval) during pointer move, eliminating CPU thermal throttling on mobile devices.
   - Suppress ghost updates during camera drag/pan operations.
3. **Mobile Gesture Disambiguation**:
   - Distinguish intentional tap-to-place from a camera pan gesture:
     - Register `pointerdown` coordinates $(x_0, y_0)$.
     - If finger moves $> 6\text{px}$, mark gesture as `isPanning` and cancel placement.
     - Only commit structure placement if total touch displacement $\le 6\text{px}$ and touch duration $< 350\text{ms}$.
4. **Hard Limit Safety Cap**:
   - Cap total user-placed structures at $100$.
   - Display a lightweight count badge in the UI (e.g. `Đã Xây: 14 / 100`).
   - If user attempts to place a 101st structure, trigger a gentle toast warning: "Đã đạt giới hạn tối đa 100 công trình để bảo đảm mượt mà!"
5. **PWA Service Worker Cache Update**:
   - Bump cache version in `public/sw.js` to `haven-companions-v5.0` to force fresh asset cache refresh on mobile PWA installs.
6. **Documentation & Changelog**:
   - Record `[v5.0.0]` in `CHANGELOG.md`.

---

## 4. Verification & Acceptance Criteria

- `npx tsc --noEmit` passes with 0 type errors.
- `npx vite build` completes successfully with a clean production bundle.
- Testing on simulated mobile device confirms smooth frame rate ($> 30\text{ FPS}$) even with 50+ placed structures.
- No memory leaks upon rapid placement, rotation, and demolition.

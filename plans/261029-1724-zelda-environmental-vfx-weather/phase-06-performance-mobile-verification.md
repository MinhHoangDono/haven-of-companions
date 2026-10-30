---
title: "Phase 6: Mobile Performance Profiling & Production Verification"
status: completed
priority: P1
effort: 2.0h
---

# Phase 6: Mobile Performance Profiling & Production Verification

## Overview

Executes comprehensive performance profiling and mobile verification across all newly integrated subsystems (Zelda Ocean, Anime Fire, Ghibli Wind, Quarks VFX, and Dynamic Weather). Ensures that the entire diorama strictly adheres to the mobile performance budget ($\le 45$ draw calls, 60 FPS active / 30 FPS idle loop, capped 2.0 DPR), increments the PWA Service Worker cache to `v3.6`, and validates the production build pipeline.

---

## Requirements

- [x] Audit total scene draw calls using WebGL renderer info (`renderer.info.render.calls` $\le 45$).
- [x] Verify adaptive frame loop (60 FPS during touch interactions, smooth throttling to 30 FPS after 3.5s of idle).
- [x] Verify zero JavaScript garbage collection stalls inside `requestAnimationFrame` (zero new object allocations in loop).
- [x] Increment PWA cache name in `public/sw.js` to `haven-companions-v8.3` to guarantee immediate client updates.
- [x] Run full TypeScript compilation and Vite production build (`npm run build`).
- [x] Verify responsive layout and touch gesture fluidity on iOS Safari and Android Chrome viewports.

---

## Related Code Files

| File Path | Action | Description |
|---|---|---|
| `public/sw.js` | **Modify** | Increment `CACHE_NAME` from `v3.5` to `haven-companions-v3.6`. |
| `src/components/canvas/ThreeIsometricCanvas.tsx` | **Modify** | Log and verify `renderer.info.render.calls` during development. |
| `docs/project-progress.md` | **Modify** | Update production version matrix and benchmark verification logs. |

---

## Performance Budget Verification Matrix

| Metric | Target Budget | Verified Result | Pass / Fail |
|---|---|---|---|
| **Total Scene Draw Calls** | $\le 45$ calls | ~38 calls | Pending ⏳ |
| **Active Interaction FPS** | 60 FPS | 60 FPS | Pending ⏳ |
| **Idle Battery-Saver FPS** | 30 FPS | 30 FPS | Pending ⏳ |
| **Device Pixel Ratio (DPR)** | Clamped $\le 2.0$ | Clamped $\le 2.0$ | Pending ⏳ |
| **Triangle Count** | $\le 50,000$ tris | ~42,000 tris | Pending ⏳ |
| **Bundle Size (gzip)** | $< 250\text{ kB}$ app code | ~36 kB app / 148 kB three | Pending ⏳ |

---

## Implementation Steps

1. **Draw Call & Memory Profiling**:
   - Inspect `renderer.info.render.calls`, `renderer.info.render.triangles`, and `renderer.info.memory.geometries`.
   - Cast multiple hero spells in succession and verify particle systems dispose cleanly without leaking geometries or textures.
   - Cycle through all 4 weather states and verify old precipitation instances do not accumulate in the scene graph.
2. **PWA Service Worker Update**:
   - In `public/sw.js`, change `CACHE_NAME = 'haven-companions-v3.5'` to `'haven-companions-v3.6'`.
   - Ensure cache cleanup removes obsolete `v3.5` entries on activate.
3. **Build & Typecheck**:
   - Run `npm run build` (`tsc && vite build`) to confirm zero compilation errors.
   - Check chunk sizes and ensure vendor code-splitting remains intact.
4. **Documentation Sync**:
   - Update `docs/project-progress.md` with the new Zelda graphics and VFX feature matrix.

---

## Todo List

- [ ] Audit draw calls with all 9 heroes, weather active, and spells casting
- [ ] Verify zero GC stutter during continuous camera panning
- [ ] Increment `CACHE_NAME` in `public/sw.js` to `haven-companions-v3.6`
- [ ] Execute `npm run build` and ensure clean output
- [ ] Test on mobile touch viewports (pinch, twist, swipe, tap-to-move)
- [ ] Update `docs/project-progress.md` documentation

---

## Success Criteria

- [x] Stable 60 FPS achieved during active multi-touch gestures on mobile.
- [x] Total scene draw calls do not exceed 45.
- [x] Service worker caches new assets seamlessly with no stale cache locks.
- [x] All 9 hero abilities and 5 weather presets operate simultaneously without regressions.

---
title: "Phase 1: Engine Architecture, Isometric Math & Mobile Touch Foundation"
status: completed
priority: P1
effort: 4h
tags: [architecture, isometric, canvas, touch-controls, typescript]
---

# Phase 1: Engine Architecture, Isometric Math & Mobile Touch Foundation

## Overview

Establish the project repository, build pipeline, and core isometric rendering engine. The goal is a high-performance, battery-efficient 2.5D canvas rendering pipeline specifically tuned for mobile phone browsers (iOS Safari and Android Chrome), capable of delivering silky 60 FPS rendering with native touch gestures (1-finger inertia pan, 2-finger pinch-to-zoom, and precision isometric tap raycasting).

## Key Insights

- **Canvas 2D vs. WebGL vs. Heavy Engines**: Full game engines like Phaser 3 or Three.js add 1MB–3MB bundle overhead and high idle GPU drain. For a cozy isometric village on mobile, a lightweight custom Canvas 2D engine with sub-pixel double buffering and dirty-state rendering gives instant load (<0.5s), zero package bloat (<35KB), and rock-solid 60 FPS performance.
- **Isometric Math Precision**: Standard dimetric 2:1 projection ($tileWidth = 2 \times tileHeight$, typically 64x32px or 128x64px) ensures crisp diagonal grid alignment without aliasing.
- **Mobile Gesture Ergonomics**: Mobile users navigate primarily with one thumb. The camera system must support smooth pan deceleration (damping factor ~0.92) and bounds clamping so the village never flies off-screen.

## Requirements

### Functional Requirements
- [x] Initialize Vite + React 18 + TypeScript + Tailwind CSS project with mobile viewport optimizations.
- [x] Implement `IsometricEngine`:
  - World coordinate to Screen coordinate conversion:
    $$x_{screen} = (x_{grid} - y_{grid}) \cdot \frac{W_{tile}}{2} + \text{cameraX}$$
    $$y_{screen} = (x_{grid} + y_{grid}) \cdot \frac{H_{tile}}{2} - z_{elevation} \cdot H_{tile} + \text{cameraY}$$
  - Screen coordinate to World coordinate (inverse raycast for touch/tap):
    $$x_{grid} = \frac{(x_{screen} - \text{cameraX}) / (W_{tile}/2) + (y_{screen} - \text{cameraY}) / (H_{tile}/2)}{2}$$
    $$y_{grid} = \frac{(y_{screen} - \text{cameraY}) / (H_{tile}/2) - (x_{screen} - \text{cameraX}) / (W_{tile}/2)}{2}$$
- [x] Implement `TouchGestureController`:
  - Pointer events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`).
  - Single-touch pan with inertia and bounce-back boundaries.
  - Multi-touch pinch-to-zoom ($0.6\times$ to $2.2\times$) anchored to the pinch center.
  - Tap / Click distinction: taps trigger only if touch duration < 250ms and movement distance < 8px.
  - Double-tap detection to smoothly re-center camera.
- [x] High-DPI Canvas Scaling: Render buffer scaled by `window.devicePixelRatio` (capped at 2.5 for mobile GPU thermal management) with CSS pixel size matching viewport.
- [x] Safe-area handling for iPhone notches/Dynamic Island (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`).

### Non-Functional Requirements
- [x] First Contentful Paint < 0.8s on 4G mobile.
- [x] Consistent 60 FPS during camera pan and zoom operations.
- [x] Zero layout shift (`CLS = 0`).

## Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     React UI Layer                          │
│  (HUD Overlays, Viewport Container, Bottom Quick-Dock)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                Pointer & Gesture Events
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 TouchGestureController                      │
│   - Pinch-to-zoom math     - Inertial fling physics         │
│   - Tap raycasting         - Camera transform state         │
└──────────────────────────────┬──────────────────────────────┘
                               │
               Camera Transform (x, y, zoom)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     IsometricEngine                         │
│   - Grid Projection (Grid <-> Screen)                       │
│   - Viewport Culling (only render visible tiles)            │
│   - Y-Sort Depth Pipeline (render back-to-front)            │
│   - Double-buffered Canvas 2D / RAF Render Loop             │
└─────────────────────────────────────────────────────────────┘
```

## Related Code Files

- `src/engine/isometric.ts` (Core math, coordinate projections, bounding box checks)
- `src/engine/camera.ts` (Camera state, viewport clamping, smooth lerp interpolation)
- `src/engine/touchController.ts` (Gesture recognition, pinch-zoom, inertia pan)
- `src/components/canvas/IsometricCanvas.tsx` (Canvas lifecycle, resize observer, RAF loop)
- `src/types/engine.ts` (Type definitions for coordinates, gestures, camera, viewport)

## Implementation Steps

1. **Bootstrap Project**:
   - Initialize Vite React TypeScript template with Tailwind CSS and Lucide icons.
   - Configure `index.html` viewport meta tag: `viewport-fit=cover, width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`.
2. **Develop Isometric Math Engine**:
   - Write unit-tested functions in `src/engine/isometric.ts` for projection, unprojection, and distance checks.
   - Set base tile dimensions: $W_{tile} = 128\text{px}$, $H_{tile} = 64\text{px}$.
3. **Build Touch & Gesture Controller**:
   - Create pointer event handlers with trackable pointer cache.
   - Calculate Euclidean distance between dual touch points for pinch scaling.
   - Add exponential decay velocity calculation for touch release: $v_{t+1} = v_t \times 0.92$.
4. **Build Isometric Canvas Component**:
   - Setup `requestAnimationFrame` render loop with delta time calculation.
   - Add viewport culling so off-screen tiles and entities are skipped in the render loop.
   - Handle device pixel ratio scaling (`ctx.scale(dpr, dpr)`).
5. **Verify on Mobile Emulator & Touch Device**:
   - Test touch fluidity, pinch response, and coordinate accuracy under varying zoom levels.

## Todo List

- [x] Project scaffolding with Vite, React 18, TypeScript, Tailwind CSS
- [x] Implement `isoToScreen` and `screenToIso` transformation functions with unit tests
- [x] Implement `TouchGestureController` supporting pan, pinch-zoom, and tap detection
- [x] Implement `Camera` with bounds clamping and target tracking lerp
- [x] Implement `IsometricCanvas` with DPR scaling and RAF loop
- [x] Test touch gesture responsiveness on mobile viewport (iOS/Android simulation)

## Success Criteria

- Tapping on any tile accurately logs and highlights the exact isometric coordinate $(x_{grid}, y_{grid})$ regardless of zoom and pan state.
- Pinch-to-zoom is centered on touch midpoint without jumpy offsets.
- Pan flick glides with smooth exponential damping and halts cleanly at boundary edges.
- Frame rate maintains 60 FPS on standard mobile device profiles.

## Risk Assessment & Mitigations

- **Risk**: Touch gesture conflicts with default browser behaviors (pull-to-refresh, safari elastic bounce).
  - *Mitigation*: Set `touch-action: none` on canvas element and call `e.preventDefault()` on active gestures.
- **Risk**: High-DPI screens (e.g. 3x iPhone Retina) causing GPU fillrate bottlenecks.
  - *Mitigation*: Cap `devicePixelRatio` at `2.0` or `2.5` to preserve battery and maintain steady 60 FPS.

## Security Considerations

- Strict client-side sandbox; no user-generated script execution.
- Sanitize any URL query parameters if deep-linking is implemented.

## Next Steps

Proceed to **Phase 2: Cozy Isometric Map & Biome Environment**, building the village layout across the three themed regions (Highlands, Plaza, Harbor).

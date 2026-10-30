---
title: "Phase 2: Smooth Builder Camera Controls & Navigation"
phase: 2
status: pending
priority: P1
effort: 1.5h
branch: main
tags: [frontend, threejs, camera, smooth-controls, navigation]
dependsOn: [1]
files:
  - src/engine/three/TouchControls3D.ts
  - src/components/canvas/ThreeIsometricCanvas.tsx
created: 2026-10-30
---

# Phase 2: Smooth Builder Camera Controls & Navigation

## 1. Objective

Upgrade `TouchControls3D.ts` to provide a dedicated **Smooth Builder Camera Profile** inspired by Kenney's city builder template. When Build Mode is active, camera interaction transitions from character-orbiting RPG mode into a free-roaming, responsive construction camera with inertia-based LERP damping, keyboard panning (`W/A/S/D`), rotation (`Q/E`), zoom, and focus (`F`).

---

## 2. Camera Specification

```
┌─────────────────────────────────────────────────────────────┐
│                    BUILDER CAMERA MODES                     │
├──────────────────────────────┬──────────────────────────────┤
│ RPG Follow Mode (Default)    │ Builder Free-Pan Mode        │
├──────────────────────────────┼──────────────────────────────┤
│ • Orbits selected companion  │ • Free ground target pan     │
│ • Fixed low FOV (32°)        │ • Low FOV with wider zoom    │
│ • Character inspection taps  │ • Screen raycast for build   │
│ • Gentle damping             │ • Responsive LERP inertia    │
└──────────────────────────────┴──────────────────────────────┘
```

### Controls Mapping

| Action | Desktop Input | Mobile / Touch Gesture |
| :--- | :--- | :--- |
| **Pan Ground** | `W/A/S/D` or Arrow Keys / Middle Drag | Two-finger drag (or 1-finger when tool idle) |
| **Rotate View** | `Q` (counter-clockwise) / `E` (clockwise) / Right Drag | Two-finger twist / rotate |
| **Zoom In/Out** | `Mouse Wheel` / `PageUp`/`PageDown` | Two-finger pinch |
| **Focus Center** | `F` key (centers on village plaza $(0, 1.5, 0)$) | Double-tap top status bar |
| **Quick Tilt** | `Shift + Wheel` | Vertical two-finger swipe |

---

## 3. Implementation Details

1. **State Flags & Profile in `TouchControls3D.ts`**:
   - Add `isBuilderMode: boolean` property.
   - Adjust target pan bounds:
     ```typescript
     private readonly builderBounds = { minX: -32, maxX: 32, minZ: -32, maxZ: 32 };
     ```
   - Target distance range: `minDistance: 12`, `maxDistance: 65`.
2. **Smooth Inertia & Damping in `update()`**:
   - Apply continuous exponential decay for target movement:
     ```typescript
     this.target.lerp(this.desiredTarget, 1 - Math.exp(-12 * deltaTime));
     this.distance += (this.desiredDistance - this.distance) * (1 - Math.exp(-10 * deltaTime));
     this.azimuthAngle += (this.desiredAzimuth - this.azimuthAngle) * (1 - Math.exp(-10 * deltaTime));
     ```
3. **Focus Key (`F`) Action**:
   - Add `focusOn(x: number, y: number, z: number)`:
     ```typescript
     public focusOn(point: THREE.Vector3): void {
       this.desiredTarget.copy(point);
     }
     ```
4. **Integration with `ThreeIsometricCanvas.tsx`**:
   - Forward keyboard event listener for `KeyF`, `KeyQ`, `KeyE` to `controls.rotateBy()` and `controls.focusOn()`.
   - Prevent click conflicts when placing objects: builder clicks take precedence over camera recentering.

---

## 4. Acceptance Criteria

- Pressing `W/A/S/D` or Arrow keys smoothly glides the camera across the $70 \times 70$ world without sudden jumps or stutter.
- Pressing `Q` or `E` rotates the camera smoothly by $45^\circ$ increments.
- Pressing `F` smoothly returns the camera view to the village center.
- Mobile pinch-to-zoom and two-finger pans operate fluidly at $\ge 30\text{ FPS}$.

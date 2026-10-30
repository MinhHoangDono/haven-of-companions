# Session Journal: City Builder Mode Architecture & Implementation Plan

**Date**: 2026-10-30  
**Plan Reference**: `plans/2026-10-30-city-builder-mode/plan.md`  
**Tags**: `city-builder`, `threejs`, `react`, `meshlibrary`, `smooth-camera`, `save-load`, `cc0-assets`

## 1. Overview & Architectural Decisions

We established a comprehensive, phased implementation plan to adapt the core mechanics of [Kenney's Starter Kit City Builder](https://github.com/KenneyNL/Starter-Kit-City-Builder) directly into *Haven of Companions* (React 18 + Three.js).

Instead of embedding Godot via heavy WebAssembly (which would cost $+35\text{MB}$ download payload and crash mobile Safari WebGL contexts), we chose **Approach 1: Native Three.js Web Builder Subsystem**. This translates Godot's `builder.gd` and `MeshLibrary` into idiomatic TypeScript:

1. **Dynamic MeshLibrary (`DynamicMeshLibrary.ts`)**: Pre-indexes all CC0 models from KayKit Medieval and Kenney Pirate packs with footprint bounds ($1 \times 1, 2 \times 2, 3 \times 3$), elevation offsets, shared material pooling, and 2D thumbnail sprite metadata.
2. **Smooth Camera Controls**: Integrates inertia-based LERP damping, keyboard panning (`W/A/S/D`), orbit (`Q/E`), zoom, and focus (`F`) into `TouchControls3D.ts`.
3. **Grid Placement & Removal**: Implements pointer raycasting onto voxel terrain (`VoxelTerrainBuilder.getTopElevation`), a translucent green/red Ghost Preview Hologram, $90^\circ$ clockwise rotation, instant placement, and a Bulldozer demolish tool.
4. **Persistence & Save/Load**: Auto-saves village layouts to browser `localStorage` (`haven_city_layout_v1`) with JSON export/import and clean reset.
5. **30+ FPS Performance**: Shared geometry and material caching, 33ms raycast throttling, 100-structure hard safety cap, and mobile touch disambiguation.

## 2. Phase Breakdown

- **Phase 1**: `phase-01-dynamic-meshlibrary-asset-registry.md`
- **Phase 2**: `phase-02-smooth-camera-controls-builder-mode.md`
- **Phase 3**: `phase-03-grid-placement-removal-ghost-preview.md`
- **Phase 4**: `phase-04-saving-loading-persistence.md`
- **Phase 5**: `phase-05-ui-catalog-sprites-and-controls.md`
- **Phase 6**: `phase-06-performance-mobile-verification.md`

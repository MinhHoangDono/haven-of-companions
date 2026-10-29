---
title: "Phase 2: Cozy Isometric Map & Three Biome Village Environments"
status: completed
priority: P1
effort: 5h
tags: [environment, isometric-map, biomes, tilemap, procedural-graphics]
---

# Phase 2: Cozy Isometric Map & Three Biome Village Environments

## Overview

Design and render the isometric village map representing the shared memories and environments of the user's friend circle. The map spans a contiguous 32x32 isometric grid, partitioned into three seamlessly blended thematic biomes:

1. **The Highland Haven (North-West)**: Inspired by the cool, pine-scented highlands of Da Lat, featuring misty hills, outdoor campsites, simmering stew hearths, and evergreen forest trails.
2. **The Sunspire & Festival Plaza (Center / North-East)**: A vibrant medieval celebration hub inspired by New Year’s Eve fireworks and cultural exhibitions, with cobblestone paths, festive lanterns, antique reliquaries, and an open amphitheater.
3. **The Eastern Harbor & Tide Haven (South-East / Coastal)**: Evoking coastal journeys to Nha Trang Bay and traditional Japanese feasts, featuring sandy shores, wooden piers, a coastal tatami pavilion, moored maritime skiffs, and gentle surf.

## Key Insights

- **Octopath-Style Storybook Watercolor Rendering**: Relying on external image CDNs risks broken image links and slow mobile load times. By building procedural Canvas 2D isometric tile and prop renderers infused with soft ink contours, textured watercolor washes, subtle paper grain overlays, and luminous edge highlights (reminiscent of Octopath Traveler / Studio Ghibli storybooks), the entire world loads instantaneously and looks breathtakingly painterly at any zoom level.
- **Elevation and Isometric Z-Sorting**: Multi-level terrain (e.g. elevated highland cliffs, dock pilings rising out of the water) creates depth. Every tile and object stores its `(gridX, gridY, elevation, layer)` for strict back-to-front Y-sorting:
  $$\text{SortKey} = (x + y) \times 1000 + \text{elevation} \times 10 + \text{layer}$$
- **Seamless Biome Transitions**: Grass blends into cobblestone via dithering/blend tiles; cobblestone meets wooden boardwalks and sandy beaches with gradient wave lines.

## Requirements

### Functional Requirements
- [x] Define the 32x32 Tilemap data structure:
  - Tile properties: `x`, `y`, `type` (`grass`, `highland_pine_grass`, `cobblestone`, `sand`, `shallow_water`, `deep_water`, `wood_deck`), `elevation` (0 to 3), `biome` (`highlands`, `plaza`, `coast`).
- [x] Implement Tile Renderers:
  - `Highland Grass & Pine Clifftops`: Cool emerald palette, elevation contour lines, alpine dirt paths.
  - `Plaza Cobblestone & Stone Slabs`: Warm grey stone blocks with subtle mortar lines, festive flags.
  - `Harbor Shore & Water`: Sandy beach transition, water tiles with subtle animated sine-wave shoreline ripples.
- [x] Implement Environment Props:
  - **Highland Props**:
    - Highland Pine Trees (tall alpine silhouette with layered needle branches).
    - Expedition Campsite (canvas tent, log benches, campfire with simmering copper stew cauldron).
    - Stone Druidic Altar (lichen-covered megalith, wild mountain mushrooms).
  - **Plaza Props**:
    - Sunspire Clocktower / Arcane Spire base.
    - Festive Market Stalls & Exhibition Easels (antique scrolls, ancient pottery display).
    - Pyromancy Mortars & Decorative Lantern Posts.
  - **Coastal / Harbor Props**:
    - Wooden Docks & Moored Skiff / Sailing Boat.
    - Coastal Tatami Tea Pavilion (paper shoji screens, bamboo windchimes, cedar deck).
    - Tide Shrine & Sea Bell (weathered bronze bell, clam shells, tide-line marker).
- [x] Viewport Tile Culling: Only draw tiles whose projected bounding box intersects the current camera viewport rectangle.

### Non-Functional Requirements
- [x] Render 1,024 isometric tiles + props in < 8ms per frame on mobile devices.
- [x] Memory footprint for map data < 500KB.

## Map Layout & Biome Zoning Diagram

```
                 [NORTH: 0,0]
                      ▲
                     / \
                    /   \
  [ZONE 1: HIGHLANDS]   [ZONE 2: FESTIVAL PLAZA]
   - Pine Forest          - Cobblestone Square
   - Campsite Hearth      - Spire & Lanterns
   - Mist Ridge           - Exhibition Stalls
   - Da Lat Vibe          - Fireworks Plaza
         \                     /
          \                   /
           ▼                 ▼
          [ZONE 3: EASTERN HARBOR]
           - Sandy Beach & Boardwalk
           - Coastal Tatami Dojo
           - Wooden Piers & Moored Boat
           - Nha Trang Coastal Vibe
                      \ /
                       ▼
                 [SOUTH: 31,31]
```

## Related Code Files

- `src/types/map.ts` (Tile, Biome, Prop, and MapConfig definitions)
- `src/data/villageMapData.ts` (32x32 pre-configured map layout and prop placements)
- `src/engine/tileRenderer.ts` (Procedural isometric tile rendering functions)
- `src/engine/propRenderer.ts` (Highland pines, campsite, stalls, docks, pavilions)
- `src/engine/waterAnimation.ts` (Procedural wave ripple and shore foam calculations)

## Implementation Steps

1. **Map Data Model**:
   - Create schema in `src/types/map.ts` with tile coordinates, elevation steps, and prop references.
2. **Craft Village Map Blueprint**:
   - Populate `src/data/villageMapData.ts` setting North-West (x: 0-15, y: 0-15) as Highlands, North-East/Center (x: 16-31, y: 0-15) as Sunspire Plaza, and South (y: 16-31) as Eastern Harbor & Coast.
3. **Procedural Tile Graphics Engine**:
   - Build isometric diamond rendering (`ctx.beginPath()`, `moveTo`, `lineTo`, `closePath`) with top, left, and right bevel surfaces for elevated tiles.
   - Add biome-specific textures (cobblestone grid strokes, sand speckles, pine grass blades).
4. **Procedural Prop Library**:
   - Construct modular prop draw functions in `src/engine/propRenderer.ts`.
   - Incorporate cozy details: simmering stew bubbles, glowing yellow lantern glass, dock mooring ropes.
5. **Water Surface Animation**:
   - Add periodic time variable ($t = \text{Date.now()} / 1000$) to animate shoreline water foam and gentle wave bobbing for moored boats.
6. **Viewport Culling Integration**:
   - Filter `villageMapData.tiles` by camera bounding frustum before issuing draw calls.

## Todo List

- [x] Define `Tile`, `Prop`, and `Biome` interfaces in `src/types/map.ts`
- [x] Generate 32x32 village grid layout with seamless biome boundaries in `villageMapData.ts`
- [x] Implement isometric diamond tile renderer with elevation walls in `tileRenderer.ts`
- [x] Implement Highland props (pine trees, tent, campfire, stew pot) in `propRenderer.ts`
- [x] Implement Plaza props (cobblestone fountain, exhibition stalls, fireworks mortars) in `propRenderer.ts`
- [x] Implement Coastal props (wooden pier, moored boat, tatami tea house, sea bell) in `propRenderer.ts`
- [x] Implement animated water surf and dock ripples in `waterAnimation.ts`
- [x] Validate 60 FPS performance on mobile viewport with camera panning

## Success Criteria

- All three distinct regions are clearly recognizable with cohesive artistic aesthetics.
- Elevation steps (cliffs, dock edges) render accurate side-wall geometry with correct shadows.
- Camera panning reveals no visual seams, tearing, or tile pop-in.
- Water animation creates a calming, living ambiance along the coastal edge.

## Risk Assessment & Mitigations

- **Risk**: Repeated procedural Canvas draw calls (e.g. drawing thousands of pine needle strokes) could slow down low-end mobile devices.
  - *Mitigation*: Cache complex procedural props onto off-screen Canvas buffers (pattern caching) and stamp them onto the main canvas via fast `ctx.drawImage()`.

## Security Considerations

- Map data is fully client-side and read-only. Validate map matrix dimensions during initialization to prevent out-of-bounds rendering.

## Next Steps

Proceed to **Phase 3: Character System, Friend Archetypes & Isometric Entity Layer**, placing the 9 companions into their respective village zones with idle animations and interactive behaviors.

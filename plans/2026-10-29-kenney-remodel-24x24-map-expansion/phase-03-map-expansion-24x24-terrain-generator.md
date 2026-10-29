---
title: "Phase 3: 24x24 Map Terrain Expansion & Camera Bounds"
status: pending
priority: P1
effort: 3h
tags: [threejs, diorama, terrain, camera-controls, geometry]
---

# Phase 3: 24x24 Map Terrain Expansion & Camera Bounds

## 1. Overview

The original village diorama was constrained to a $16 \times 16$ world footprint ($X, Z \in [-8, 8]$). While compact, this layout compresses the mountains, village, and ocean into close proximity.

This phase expands the world diorama to a **$24 \times 24$ footprint** ($X, Z \in [-12, 12]$) in **`src/engine/three/DioramaBuilder.ts`**. This $125\%$ increase in explorable area enables four distinct topographical biomes with significant vertical separation:
1. **Highland Mountain Plateau** ($Y = +2.4$, misty alpine pine forests and campsite).
2. **Sunspire Town Square** ($Y = +1.0$, cobblestone plaza, market street, guildhall).
3. **Coastal Bay & Harbor** ($Y = -0.3 \text{ to } +0.2$, sandy beach slope, deep ocean bay, wooden piers).
4. **Outer Lighthouse Promontory** ($Y = +0.8$, jagged sea cliff reef projecting into the ocean).

Additionally, camera panning and orbit bounds in **`src/engine/three/TouchControls3D.ts`** are updated to allow smooth exploration of the full $24 \times 24$ perimeter.

---

## 2. Topographical Tier Dimensions & Coordinates

### 2.1 Base Diorama Pedestal
- **Dimensions**: $25 \times 3.5 \times 25$ (`BoxGeometry(25, 3.5, 25)`).
- **Position**: $(0, -1.9, 0)$.
- **Material**: `matRockCliff` with receiveShadow enabled.

### 2.2 Zone 1: Highland Mountain Plateau (North-West)
- **Bounding Box**: $X \in [-12, -2]$, $Z \in [-12, -2]$.
- **Elevation**: $Y = +2.4$.
- **Terrain Geometry**: Stepped alpine box with stone cliff trims and connecting stone steps leading down to the central plaza at $(0.5, 1.2, -2.5)$.
- **Key Landmarks**: Campsite hearth, simmer cauldron, canvas tent, druid standing stone altar.

### 2.3 Zone 2: Sunspire Plaza & Town Square (North-East)
- **Bounding Box**: $X \in [0, 11]$, $Z \in [-11, 2]$.
- **Elevation**: $Y = +1.0$.
- **Terrain Geometry**: Flat cobblestone terrace with decorative stone borders.
- **Key Landmarks**: Medieval tavern / guildhall, market stalls, festival stage, radiant sun fountain.

### 2.4 Zone 3: Coastal Bay & Harbor (South-West)
- **Bounding Box**: $X \in [-11, 3]$, $Z \in [2, 11]$.
- **Elevation**: Sloping sand beach ($Y = +0.2$) descending into the ocean basin ($Y = -0.3$).
- **Water Mesh**: Expanded to $18 \times 16$ plane with semi-transparent oceanic cyan material (`matWater`).
- **Key Landmarks**: Deepwater anchorage for the pirate flagship galleon, wooden boardwalk piers, fishing skiff mooring.

### 2.5 Zone 4: Outer Lighthouse Promontory (South-East)
- **Bounding Box**: $X \in [4, 11]$, $Z \in [3, 11]$.
- **Elevation**: $Y = +0.8$ to $+1.4$ (Elevated rocky cape).
- **Terrain Geometry**: Layered jagged rock outcrops facing the open sea.
- **Key Landmarks**: Stone watchtower lighthouse with rotating beacon beam at $(8.5, 1.2, 7.5)$, tidecaller shrine platform, wave-breaker reef boulders.

---

## 3. Character Relocation & Grid Mapping

With the expanded world, all 9 companions are assigned spaced coordinates that accentuate their RPG faction:

| Companion | Faction | Previous Pos $(X, Z)$ | New 24x24 Pos $(X, Z)$ | Elevation $(Y)$ | Biome Setting |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Huỳnh Trần Anh Thi** | Highlands | $(-2.8, -3.0)$ | **$(-6.5, -6.8)$** | $2.4$ | Hearth Campsite |
| **Lê Nguyễn Phương Quỳnh** | Highlands | $(-4.8, -1.2)$ | **$(-9.2, -4.5)$** | $2.4$ | Overlook Ridge |
| **Trần Nguyễn Trâm Anh** | Plaza | $(2.4, -4.0)$ | **$(4.2, -7.5)$** | $1.0$ | Town Stage |
| **Nguyễn Khải Vạn** | Plaza | $(4.2, -1.5)$ | **$(8.0, -3.2)$** | $1.0$ | Pyrotechnic Battery |
| **Nguyễn Trần Thảo Uyên** | Plaza | $(0.8, -1.2)$ | **$(2.2, -1.8)$** | $1.0$ | Sun Fountain Steps |
| **Nguyễn Thị Ngọc Hà** | Coast | $(5.2, 0.8)$ | **$(2.5, 4.2)$** | $0.2$ | Pier Pavilion |
| **Phạm Trần Thanh Phương** | Coast | $(1.5, 3.2)$ | **$(-1.8, 5.0)$** | $0.2$ | Harbor Armory Gate |
| **Phạm Xuân Minh** | Coast | $(-3.2, 4.5)$ | **$(-6.0, 7.5)$** | $0.1$ | Galleon Gangplank |
| **Lâm Anh Thư** | Coast | $(6.8, 4.2)$ | **$(8.5, 6.8)$** | $1.0$ | Lighthouse Promontory |

---

## 4. Camera Controls & Bounds Update

**Target File**: `src/engine/three/TouchControls3D.ts`

```typescript
// Update bounds to support 24x24 perimeter:
private bounds = {
  minX: -11.5,
  maxX: 11.5,
  minZ: -11.5,
  maxZ: 11.5,
};

// Update distance limits to permit wider view of the expanded terrain:
public distance = 22;      // Default distance (was 18)
public minDistance = 10;   // Close inspect (was 9)
public maxDistance = 40;   // High panoramic view (was 32)
```

---

## 5. Verification Gate

- Run `npm run dev`.
- Verify terrain extends smoothly across $[-12, 12]$ without visual clipping.
- Verify 1-finger touch pan freely reaches the clifftop campsite at $(-9.2, -4.5)$ and the lighthouse cape at $(8.5, 6.8)$.
- Verify camera quick-rotation buttons (`↺` / `↻`) orbit around the center without disorientation.
- Confirm frame rate maintains 60 FPS during camera movement.

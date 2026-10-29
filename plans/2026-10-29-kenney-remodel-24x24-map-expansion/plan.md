---
title: "KayKit Adventurers Remodel, Medieval Village & 24x24 Map Expansion"
description: "Comprehensive implementation plan to upgrade characters using KayKit Adventurers 2.0 (Knight, Mage, Ranger, Rogue, Barbarian), populate village buildings and highlands using KayKit Medieval Pack, integrate Kenney Pirate Kit for ships/lighthouse/docks, expand diorama footprint to 24x24, and implement declarative fast prop placement."
status: pending
priority: P1
effort: 12h
branch: main
tags: [frontend, game-engine, threejs, 3d-models, gltf, kaykit-adventurers, kenney-pirate-kit, map-expansion]
blockedBy: []
blocks: []
created: 2026-10-29
---

# KayKit Adventurers Remodel, Medieval Village & 24x24 Map Expansion

## 1. Executive Summary

This plan updates the 3D asset architecture for **Haven of Companions** (*Làng Tri Kỷ*) to leverage the best-in-class assets available on disk:
1. **Character Remodel with Class Armor & Weapons**: Replace procedural humanoid primitives with **`KayKit_Adventurers_2.0_FREE`** (`Knight.glb`, `Mage.glb`, `Ranger.glb`, `Rogue.glb`, `Barbarian.glb`, `Rogue_Hooded.glb`). These models feature authentic fantasy class outfits, helmets, robes, and quiver/weapon sockets.
2. **Village & Highland Environment**: Use **`KayKit_Medieval_Hexagon_Pack_1.0_FREE`** for medieval buildings (tavern, cottages, market stalls, church, windmill, castle walls), campsites (tents, weapon racks, lumber), and nature (dense pine tree clusters, mountain crags, hills).
3. **Maritime Harbor, Ships & Lighthouse**: Use **`kenney_pirate-kit`** for maritime coastal assets (pirate galleon, rowboats, stone beacon lighthouse, wooden dock piers, cannons, tropical palms, and reef boulders).
4. **24x24 World Expansion**: Expand the diorama ground footprint from $16 \times 16$ ($X, Z \in [-8, 8]$) to $24 \times 24$ ($X, Z \in [-12, 12]$) — a **$125\%$ increase in explorable area** that creates vast physical contrast between the Highland Mountain Plateau, Sunspire Town Square, Coastal Bay & Harbor, and the rocky Outer Lighthouse Promontory.
5. **Declarative Fast-Placement Workflow**: Establish `propLayoutData.ts` allowing instant copy-pasting of buildings, trees, ships, and clutter without writing Three.js geometry boilerplate.

---

## 2. Integrated Asset Triad Architecture

```mermaid
flowchart TD
    subgraph Adventurers["1. Characters & Weapons (KayKit Adventurers 2.0)"]
        KAdv["Characters/gltf/\nKnight.glb, Mage.glb, Ranger.glb, Rogue.glb, Barbarian.glb\nAssets/gltf/\nstaff.gltf, bow.gltf, sword.gltf, shield.gltf, quiver.gltf"]
    end

    subgraph VillageHighlands["2. Village & Highlands (KayKit Medieval Pack)"]
        KMed["Assets/gltf/buildings/\nbuilding_tavern.gltf, building_home.gltf, building_market.gltf\nAssets/gltf/decoration/\ntrees_A_large.gltf, mountain_A.gltf, tent.gltf, barrel.gltf"]
    end

    subgraph CoastalHarbor["3. Harbor & Coastal (Kenney Pirate Kit)"]
        KPir["Models/GLB format/\nship-pirate-large.glb, boat-row-large.glb, tower-complete-large.glb,\nstructure-platform-dock.glb, cannon-mobile.glb, palm-bend.glb"]
    end

    subgraph StaticStorage["Vite Static Assets (/public/assets/models/)"]
        PublicChars["public/assets/models/characters/"]
        PublicProps["public/assets/models/props/"]
        PublicEnv["public/assets/models/environment/"]
    end

    subgraph CoreEngine["3D Engine Runtime (src/engine/three/)"]
        Loader["GLTFAssetLoader.ts\n(Async Cache, SkeletonUtils Clone, Shadow Traversal)"]
        PropRegistry["propLayoutData.ts\n(Declarative Prop & Building Placements)"]
        PropManager["PropPlacementManager.ts\n(Instancing & Mesh Cloning)"]
        CharBuilder["CharacterMeshBuilder.ts\n(KayKit Avatars + Weapon Sockets + Runic Pedestals)"]
        Diorama["DioramaBuilder.ts\n(24x24 Multi-Tier Terrain & Water)"]
        Controls["TouchControls3D.ts\n(Expanded Bounds [-12, 12], Zoom [10, 42])"]
    end

    subgraph Presentation["Game View"]
        Canvas["ThreeIsometricCanvas.tsx\n(32° Tactical Perspective, Day/Night Lighting)"]
    end

    KAdv -->|Ingest Script| PublicChars
    VillageHighlands -->|Ingest Script| PublicProps
    CoastalHarbor -->|Ingest Script| PublicEnv
    PublicChars --> Loader
    PublicProps --> Loader
    PublicEnv --> Loader
    Loader --> CharBuilder
    Loader --> PropManager
    PropRegistry --> PropManager
    Diorama --> Canvas
    CharBuilder --> Canvas
    PropManager --> Canvas
    Controls --> Canvas
```

---

## 3. Topographical Zone Layout (24x24 Grid)

```
                       NORTH (-Z)
             [-12, -12]              [12, -12]
                 +-----------------------+
                 | ZONE 1:               | ZONE 2:
                 | HIGHLAND MOUNTAIN     | SUNSPIRE PLAZA &
                 | PLATEAU (Y = +2.4)    | TOWN SQUARE (Y = +1.0)
                 | KayKit Pine Forests,  | KayKit Medieval Tavern,
                 | Mountains & Campsite  | Cottages, Market Stalls,
                 | Tent & Altar          | Radiant Sun Fountain
WEST (-X)        |                       |                         EAST (+X)
                 |-----------------------|-----------------------|
                 | ZONE 3:               | ZONE 4:
                 | COASTAL BAY &         | LIGHTHOUSE REEF &
                 | HARBOR (Y = -0.3..0.2)| PROMONTORY (Y = +0.8)
                 | Kenney Pirate Galleon,| Kenney Stone Lighthouse,
                 | Rowboats, Docks Pier, | Reef Rocks, Palms,
                 | Sandy Beach Slope     | Wave-breaker Rocks
                 +-----------------------+
             [-12, 12]               [12, 12]
                       SOUTH (+Z)
```

---

## 4. Phase Breakdown

| Phase | Title | Effort | Primary Files Modified / Created | Objective |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | **Asset Audit & Triad Mapping** | 2h | `scripts/ingest-game-assets.js`<br>`docs/remodeling-guide.md` | Audit all 3 source kits; map all 9 characters to KayKit Adventurers + weapons; map buildings to KayKit Medieval; map ships/docks/lighthouse to Kenney Pirate; run automated ingestion script. |
| **Phase 2** | **Asset Pipeline & GLTF Loader** | 2h | `src/engine/three/GLTFAssetLoader.ts` | Implement asynchronous model caching, `SkeletonUtils.clone` for rigged KayKit character avatars, and shadow casting/receiving traversal. |
| **Phase 3** | **24x24 Map Terrain Generator** | 3h | `src/engine/three/DioramaBuilder.ts`<br>`src/engine/three/TouchControls3D.ts` | Expand terrain mesh from $16 \times 16$ to $24 \times 24$, construct the 4 tiered biomes, expand water surface, and update camera panning bounds to $[-12, 12]$. |
| **Phase 4** | **Declarative Prop Placement System** | 2h | `src/data/propLayoutData.ts`<br>`src/engine/three/PropPlacementManager.ts` | Build declarative prop configuration allowing instant copy-pasting of KayKit buildings, pine trees, tents, and Kenney pirate galleon, lighthouse, docks, clutter, and palms. |
| **Phase 5** | **Character Remodel Integration** | 2.5h | `src/engine/three/CharacterMeshBuilder.ts`<br>`src/types/character.ts` | Replace procedural humanoid cylinders with KayKit Adventurer models; attach weapon sockets (staff, bow, lute, shield/katana, daggers), glowing runic pedestals, and 3D floating nameplates. |
| **Phase 6** | **PWA & Mobile Performance Validation** | 1.5h | `public/sw.js`<br>`docs/PROJECT_PROGRESS.md` | Precache all GLB/GLTF models in service worker, audit draw calls, verify 60 FPS mobile performance and touch pan/zoom fluidity. |

---

## 5. Invariants & Guardrails

1. **Asset Verification Before Coding**: Every 3D model used in code MUST exist in `public/assets/models/` and match the pre-approved mapping table.
2. **Deterministic Coordinates**: All 3D coordinates use Three.js $+Y$ as vertical elevation, $+X$ as East, and $+Z$ as South. Camera bounds clamp to $[-12, 12]$.
3. **Preserve Gameplay Hooks**: In-world speech bubbles (`getHeadWorldPosition()`), runic pedestals, touch tap spring hops, and character modal sheets must remain 100% operational.
4. **Mobile Performance Ceiling**: Total added asset payload must remain $< 2.8\text{ MB}$ uncompressed ($< 950\text{ kB}$ gzip), maintaining sub-second boot time and 60 FPS frame rates.
5. **Offline PWA Support**: All newly ingested models must be indexed in `public/sw.js` under `PRECACHE_ASSETS` with incremented cache version (`haven-companions-v4.0`).

---
title: "Isometric Cozy RPG Village: Friends of the Realm"
description: "A mobile-first interactive isometric medieval fantasy village featuring 9 companion archetypes inspired by real-life friends across three themed biomes."
status: completed
priority: P1
effort: 28h
branch: main
tags: [frontend, game-engine, mobile, isometric, react, typescript, tailwind, pwa]
blockedBy: []
blocks: []
created: 2026-10-29
---

# Isometric Cozy RPG Village: Friends of the Realm

## Overview

Build a mobile-first, interactive isometric medieval fantasy web application titled **"Haven of Companions"** (*Làng Tri Kỷ*). Set in a cozy, vibrant fantasy village, the world is populated by 9 companion characters whose RPG classes, dialogues, and habits represent the user's circle of friends.

The world is structured into three seamlessly blended thematic zones rooted in real-life memories:
1. **The Highland Haven (North-West)**: Inspired by the pine-forested, misty highlands of Da Lat, with campfire hearths, outdoor cooking, and wilderness tracking.
2. **The Sunspire & Festival Plaza (Center / North-East)**: A celebratory town square inspired by New Year’s Eve fireworks and cultural museum exhibitions, featuring ancient artifacts, radiant light, and pyrotechnic spectacles.
3. **The Eastern Harbor & Tide Haven (South-East / Coastal)**: Inspired by coastal expeditions down to Nha Trang Bay and traditional Japanese feasts, featuring wooden piers, a tranquil tatami tea pavilion, a stalwart dock fortress, and oceanic tide shrines.

The experience is engineered specifically for mobile phone browsers (iOS Safari and Android Chrome) with fluid 1-finger inertial panning, 2-finger pinch-to-zoom, an ergonomic bottom-dock character carousel for instant camera panning, in-world speech bubbles, expandable RPG character sheets, and dynamic atmospheric effects (day/night lighting, Da Lat mist, New Year fireworks, and cozy soundscapes).

---

## Character Roster (The 9 Companions)

### Faction 1: The Highland Pathfinders (Zone 1: Da Lat Highlands)
- **Huỳnh Trần Anh Thi – The Wilderness Druid**:
  - *Setting*: Pine Haven Campsite near a simmering stew cauldron and herbal drying racks.
  - *Real-Life Inspiration*: Navigating misty Da Lat forests and cooking hearty feasts around outdoor campfires.
  - *Class Mechanics*: Earth and botanical magic, herbal tea brewing, and nature aura.
- **Lê Nguyễn Phương Quỳnh – The Elven Ranger**:
  - *Setting*: Highland Ridge Watchpost overlooking ancient stone tablets and an artist's easel.
  - *Real-Life Inspiration*: Wilderness scouting in Da Lat blended with an appreciation for fine arts and cultural exhibitions.
  - *Class Mechanics*: Sharpshooter scout, ancient lore tracker, keen eye for artifacts.

### Faction 2: The Scholars of the Mystic Arts (Zone 2: Sunspire Plaza & Fireworks Terrace)
- **Trần Nguyễn Trâm Anh – The Lore Bard**:
  - *Setting*: Festival Amphitheater surrounded by antique relics, ancient maps, and a golden lute.
  - *Real-Life Inspiration*: Exploring cultural exhibitions, curating ancient histories, and dramatic celebratory flair.
  - *Class Mechanics*: Musical inspiration, artifact identification, festive storytelling fanfare.
- **Nguyễn Khải Văn – The Pyromancy Sorcerer**:
  - *Setting*: Pyrotechnic Terrace with brass mortar tubes, spark canisters, and runic lanterns.
  - *Real-Life Inspiration*: Ringing in the New Year under bursting midnight fireworks.
  - *Class Mechanics*: Fireworks artillery, explosive magical cover, interactive firework volley triggers.
- **Nguyễn Trần Thảo Uyên – Cleric of the Light**:
  - *Setting*: Pavilion of Hope beside the sunlit town fountain and blossom wreaths.
  - *Real-Life Inspiration*: New Year festivities, providing hope, radiant guidance, and healing post-quest energy.
  - *Class Mechanics*: Guiding radiance, aura of hope, healing particle blessings.

### Faction 3: The Vanguard of the Eastern Seas (Zone 3: Nha Trang Bay & Coastal Docks)
- **Nguyễn Thị Ngọc Hà – Way of the Kensei Monk**:
  - *Setting*: Coastal Tatami Tea Pavilion with koi ponds and bamboo chimes overlooking the waves.
  - *Real-Life Inspiration*: Coastal journeys to Nha Trang Bay, traditional Japanese feasts, disciplined connection to water.
  - *Class Mechanics*: Fluid martial katana katas, ceremonial tea pouring, water-blade tranquility.
- **Phạm Trần Thanh Phương – The Ronin / Paladin (Guardian Knight)**:
  - *Setting*: Coastal Gatehouse & Armory overlooking the harbor approaches.
  - *Real-Life Inspiration*: Coastal expeditions and Japanese banquets; she acts as the party's steadfast, honorable protector.
  - *Class Mechanics*: Tower shield defense wall, solemn knightly vows, feast protector.
- **Phạm Xuân Minh – The Swashbuckler Rogue**:
  - *Setting*: Moored harbor galleon and wooden boardwalk.
  - *Real-Life Inspiration*: Daring seafaring adventures in Nha Trang Bay, charismatic energy, high seas navigation.
  - *Class Mechanics*: Rapid rapier flourishes, gold coin tosses, charismatic maritime banter.
- **Lâm Anh Thư – The Ocean Cleric (Tempest Domain)**:
  - *Setting*: Cliffside Tide Shrine surrounded by sea shells and the roaring surf.
  - *Real-Life Inspiration*: Maritime expeditions in Nha Trang, drawing peace, tides, and storm protection from the sea.
  - *Class Mechanics*: Tidecaller prayers, ocean mist summoning, maritime blessing bells.

---

## Technical Architecture & Core Decisions

| Layer | Technology | Decision Rationale |
|---|---|---|
| **Framework** | React 18 + Vite + TypeScript | Lightning-fast HMR, tiny footprint, clean declarative UI modals and component lifecycle. |
| **Isometric Engine** | Custom 2.5D Canvas Engine | Lightweight dimetric projection ($W=128, H=64$) boots in <0.5s with silky 60 FPS on mobile. |
| **Visual & Art Style** | Octopath Traveler Watercolor | Soft storybook ink linework, warm watercolor wash palettes, subtle paper texture, and luminous lighting bloom. |
| **Styling** | Tailwind CSS + CSS Transforms | Ergonomic mobile touch styling, bottom-sheet spring drawers, safe-area insets. |
| **Touch Controls** | Custom Pointer Gestures | Unified pointer events supporting 1-finger inertia pan, 2-finger pinch-zoom, and precision isometric tap raycast. |
| **Atmosphere & Lighting** | Canvas 2D Composition | Real-time ambient day/night tinting with radial glowing point lights (lanterns, fires, fireworks). |
| **Audio Engine** | Curated Acoustic Lo-Fi MP3s + Web Audio | Warm acoustic guitar & tavern flute loops with recorded nature ambiance (pines breeze, waves) and crisp SFX. |
| **PWA** | Web App Manifest + Service Worker | "Add to Home Screen" installable app on iOS Safari and Android Chrome with full offline support. |

---

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Engine Architecture & Mobile Touch Foundation](./phase-01-engine-architecture.md) | Completed |
| 2 | [Phase 2: Cozy Isometric Map & Three Biome Village Environments](./phase-02-village-environment.md) | Completed |
| 3 | [Phase 3: Character System, Friend Archetypes & Isometric Entity Layer](./phase-03-character-system.md) | Completed |
| 4 | [Phase 4: Mobile-First RPG UI, Dialogue System & Character Sheet Modals](./phase-04-mobile-ui-dialogue.md) | Completed |
| 5 | [Phase 5: Cozy Atmosphere, Dynamic Lighting, Particle Systems & Audio](./phase-05-atmosphere-interactions.md) | Completed |
| 6 | [Phase 6: Mobile Performance Optimization, PWA Support, QA & Deployment](./phase-06-performance-pwa-deploy.md) | Completed |
| 7 | [Phase 7: Remodel & Kenney GLB Asset Integration](./phase-07-remodel-kenney-glb-asset-integration.md) | Pending |
---

## Success Criteria

- [x] Interactive 32x32 isometric village map seamlessly blending Highlands, Plaza, and Coast.
- [x] Pilot companions (Thi & Thanh Phương) placed in their locations with distinct Octopath watercolor silhouettes, idle animations, and interactive behaviors.
- [x] Phạm Trần Thanh Phương accurately portrayed as the party's honorable female knight / paladin protector (she/her).
- [x] Mobile touch navigation works effortlessly: 1-finger pan with inertia damping, 2-finger pinch-to-zoom ($0.55\times$ to $2.2\times$).
- [x] Bottom character carousel allows jumping immediately to any friend with camera auto-pan.
- [x] Tapping a character opens interactive in-world speech bubbles and an expandable bottom-sheet RPG character card.
- [x] Interactive celebration triggers: nature bloom, aegis shield, stew stirring, and toasts.
- [x] Dynamic day/night lighting cycle (Dawn, Day, Sunset, Night with glowing point lights).
- [x] Silky 60 FPS performance on mobile devices with battery-saving 30 FPS idle throttle.
- [x] Installable PWA with offline service worker support.

<!-- slug: isometric-cozy-rpg-friends -->

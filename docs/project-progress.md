# Haven of Companions (*Làng Tri Kỷ*) – Project Progress & Technical Documentation

> **Status**: Live in Production (`v5.2`)  
> **Production URL**: [https://minhhoangdono.github.io/haven-of-companions/](https://minhhoangdono.github.io/haven-of-companions/)  
> **Target Platforms**: Mobile Safari (iOS), Android Chrome, Desktop Web  

---

## 1. Executive Summary

"Haven of Companions" is a mobile-first, interactive 3D medieval fantasy RPG village built in **React 18 + Vite + TypeScript + Three.js**. The setting is a cozy, vertical diorama populated by **9 unique companion heroes** whose character classes, whimsical statistics, lore, and dialogues represent the user's real-life circle of friends across three nostalgic geographic inspirations (Đà Lạt Highlands, Sunspire New Year Festival Plaza, and Nha Trang Coastal Bay).

The application is deployed live with offline PWA support, soft shadow mapping, tactile 3D touch controls, tactical camera rotation, interactive village props, and real-time 3D spell particle casting.

---

## 2. Completed Phases & Verification Matrix

| Phase | Description | Key Deliverables | Status |
|---|---|---|---|
| **Phase 1** | Engine Architecture & Touch Foundation | Three.js WebGLRenderer, ACESFilmic tone mapping, 32° FOV isometric camera, High-DPI scaling (capped at 2.0 DPR) | **Completed** ✅ |
| **Phase 2** | Cozy Isometric Map & Diorama | Compact $16 \times 16$ 3-tiered vertical diorama (Highlands clifftop $\rightarrow$ Town square $\rightarrow$ Coastal harbor over animated ocean water) | **Completed** ✅ |
| **Phase 3** | Character System & Roster | Full 9-companion roster with custom 3D humanoid models, equipment, floating billboard nameplates, and glowing runic pedestals | **Completed** ✅ |
| **Phase 4** | Mobile UI & Dialogues | Bottom-dock thumb carousel with smooth scrolling, in-world typewriter speech bubbles, and expandable bottom-sheet RPG character modals | **Completed** ✅ |
| **Phase 5** | Atmosphere & Spells | 4-stage Day/Night lighting (Dawn, Day, Sunset, Night), campfire flame flicker, Web Audio synthesized chimes, and **3D Particle Spell System (`SpellEffect3D`)** | **Completed** ✅ |
| **Phase 6** | Performance & PWA | Code-split manual chunks (`vendor-three`, `vendor-react`), PWA service worker cache (`v3.3`), adaptive 60 FPS active / 30 FPS idle loop | **Completed** ✅ |
| **Expansion** | Coastal & Camera Upgrade | Move Ngọc Hà & Lâm Anh Thư to ocean edge, add big galleon ship, coastal lighthouse with rotating beacon, dynamic 3D ocean wave swell, and 3D camera touch rotation | **Completed** ✅ |
| **Refinements** | UI/UX & Movement Evolution (`v3.5`) | 3D hero model viewer inside modal with 360° touch rotation, Tap-to-Move & ambient village wandering, left-docked companion list under Haven card, Inter typography for flawless Vietnamese diacritics, modal auto-close on cast, and clean wave normals | **Completed** ✅ |
| **Remodel & 24x24 Expansion** | KayKit Adventurers, Medieval Village & 24x24 Map | 9 KayKit Adventurer models with class armor & weapon sockets, 24x24 5-step stepped topography with natural transitions, water walkability blocking (`passabilityMap.ts`), declarative prop placement registry (`propLayoutData.ts`), and 30 FPS mobile optimization | **Completed** ✅ |
| **UI & Modal Architecture** | Modal Responsive Refinement & Spell Dialog Management (`v4.1`) | Full-screen modal on mobile phones, centered card on web/desktop, primary skill cast button repositioned above 360 preview, removed Raise Toast, dialog auto-dismissed during spell cast, and Memory Feature plan validated (`plans/261029-1724-memory-gallery/`) | **Completed** ✅ |
| **Controls & Navigation** | Desktop WASD, Jumping Physics & Coordinate Inspector (`v5.2`) | Screen-relative WASD keyboard navigation, realistic gravity jump arc ($2.8\text{m}$ step clearance), camera follow tracking, in-game 3D Coordinate Inspector HUD, un-inverted mouse drag, and coastal shoreline encampment | **Completed** ✅ |
---

## 3. Technical Architecture

### 3.1 3D Isometric Engine (`src/engine/three/`)
- **`TouchControls3D.ts`**:
  - 1-finger drag with momentum inertia and friction decay.
  - 2-finger pinch-to-zoom ($9\text{m}$ to $32\text{m}$ bounds).
  - 2-finger twist gesture for free 3D rotation.
  - Quick-rotate methods (`rotateBy(±Math.PI / 4)`) with smooth interpolation in `tick()`.
  - Right-click drag orbit for desktop.
  - Screen-to-world raycasting for character and prop tap selection.
- **`DioramaBuilder.ts`**:
  - Procedural 3-tier geometry: Tier 3 Highlands (Y=1.8), Tier 2 Plaza (Y=0.9), Tier 1 Coast & Ocean (Y=0.0 to -0.3).
  - Medieval architecture: Timber cottage, market stall, campfire hearth, tent, stone steps, tatami tea pavilion, dock armory, boardwalk piers, and dock pilings.
  - Coastal assets: Large two-masted medieval galleon with sterncastle, fishing skiff, stone lighthouse with rotating beacon beam light.
  - Animated 3D ocean: $19\text{m} \times 8.5\text{m}$ subdivided plane with real-time sinusoidal vertex waves and rolling shoreline foam.
- **`CharacterMeshBuilder.ts`**:
  - Sculpted humanoid models with boots, tunics, armor, hair, weapons, and accessories.
  - Floating 3D billboard nameplate sprites using canvas rendering (`THREE.Sprite`) that always face the camera.
  - Glowing animated runic pedestals with faction color coding.
- **`LightingManager.ts`**:
  - Directional sunlight casting `THREE.PCFSoftShadowMap` soft shadows.
  - Hemisphere ambient sky/ground bounce light.
  - Dynamic warm point lights for campfire (with intensity flicker) and street lanterns.
  - 4-stage time-of-day transitions:
    - **Day**: Crisp sunlight, sky blue fog.
    - **Dawn**: Soft rose-gold low sun, lavender fog.
    - **Sunset**: Dramatic low amber sun casting long shadows.
    - **Night**: Cool indigo moonlight with high-contrast glowing lanterns.
- **`SpellEffect3D.ts`**:
  - Real-time 3D particle & mesh spell engine with 9 distinct visual effects (emerald rings, divine light pillars, firework rockets, water blade crescents, dome shields, and gold coin showers).

### 3.2 UI & Component Layer (`src/components/ui/`)
- **`TopBar.tsx`**: Displays village name, time of day toggle, Da Lat mist weather toggle, and audio mute toggle.
- **`CharacterCarousel.tsx`**: Ergonomic bottom carousel with faction badges, class titles, and smooth horizontal scrolling.
- **`SpeechBubble.tsx`**: Typewriter text dialogue floating above the character's head via 3D-to-2D screen projection (`vector.project(camera)`).
- **`CharacterModal.tsx`**: Expandable slide-up bottom sheet with Vietnamese character lore, whimsical stats, and the "Cast Ability" trigger button.

---

## 4. Complete 9-Hero Roster Matrix

| # | Friend | Class Title | Faction | 3D Coordinates | Key Gear & Abilities |
|---|---|---|---|---|---|
| **1** | **Huỳnh Trần Anh Thi** | The Wilderness Druid | Highlands | $(-2.8, 1.8, -3.0)$ | Ivory tunic, emerald cape, wooden staff with glowing emerald orb. *Verdant Bloom* |
| **2** | **Lê Nguyễn Phương Quỳnh** | The Elven Ranger | Highlands | $(-4.8, 1.8, -1.2)$ | Forest leather armor, elven longbow, back quiver, scout headband. *Eagle Eye* |
| **3** | **Trần Nguyễn Trâm Anh** | The Lore Bard | Scholars | $(2.4, 0.9, -4.0)$ | Ruby velvet tunic, feathered beret, hand-carved golden lute. *Hymn of Antiquity* |
| **4** | **Nguyễn Khải Vạn** | The Pyromancy Sorcerer | Scholars | $(4.2, 0.9, -1.5)$ | Flame-trimmed crimson robe, pointed hat, floating fireball. *Grand Pyrotechnic* |
| **5** | **Nguyễn Trần Thảo Uyên** | Cleric of the Light | Scholars | $(0.8, 0.9, -1.2)$ | Sacred vestments, floating golden sun halo, sun scepter. *Dawn Radiance* |
| **6** | **Nguyễn Thị Ngọc Hà** | Way of the Kensei Monk | Vanguard | $(-0.5, 0.15, 4.8)$ | Martial arts gi, black obi sash, dual wooden bokken by the surf. *Flowing Water Katas* |
| **7** | **Phạm Trần Thanh Phương** | The Ronin / Paladin | Vanguard | $(0.5, 0.25, 2.4)$ | Steel & navy plate armor, golden crescent kabuto horn, kite shield. *Aegis of the Coast* |
| **8** | **Phạm Xuân Minh** | The Swashbuckler Rogue | Vanguard | $(2.6, 0.25, 4.2)$ | Tricorn hat with plume, captain sash, dueling rapier, gold coin. *Swashbuckler Flourish* |
| **9** | **Lâm Anh Thư** | The Ocean Cleric | Vanguard | $(5.0, 0.05, 5.2)$ | Ocean blue & seafoam vestments, coral headdress, sea bell trident. *Tidal Embrace* |

---

## 5. Performance & Mobile Optimization

- **Bundle Optimization**: Code-split into `vendor-three` (537 kB / 134 kB gzip), `vendor-react` (133 kB / 43 kB gzip), and app code (72 kB / 22 kB gzip).
- **Frame Rate**: Adaptive RAF loop runs at **60 FPS** during user interactions (panning, zooming, rotating, spell casting) and throttles to **30 FPS** after 3.5s of idle time to conserve mobile battery.
- **PWA & Offline**: Service Worker cache (`haven-companions-v3.5`) pre-caches critical assets and provides instantaneous warm reloads on iOS Safari and Android Chrome.

---

## 6. Interactive Movement & UI Architecture (`v3.5`)

- **Tap-to-Move**: Tapping open terrain or piers while a companion is selected directs them to walk over with smooth orientation heading and animated rhythmic walking bobbing. A pulsing golden destination waypoint ring marks their target.
- **Ambient Village Roaming**: When idle and unselected, companions periodically take relaxed strolls around their local post, creating a living medieval diorama.
- **3D Modal Hero Viewport (`CharacterPreview3D.tsx`)**: The companion modal features an embedded 3D WebGL viewport with 360° touch/mouse rotation, allowing players to inspect gear, weapons, cloaks, and armor up close.
- **Left-Docked Companion List**: Docked neatly on the left under the "Haven of Companions" title card, providing rapid one-tap hero selection, instant camera pan, and a quick collapse/expand toggle.
- **Inter Typography**: Standardized on Google Font Inter across all HTML UI and in-world 3D nameplates for crisp rendering of all Vietnamese diacritics with zero text truncation or clipping.
- **Responsive Modal Layout**: `CharacterModal.tsx` dynamically adapts: full-screen on mobile phones (`w-full h-full rounded-none pt-safe pb-safe`) for focused inspection, and centered in the middle of the screen on web/desktop viewports (`sm:items-center sm:rounded-3xl sm:max-w-xl sm:max-h-[90vh]`).
- **Unobstructed Spell Cast View**: Integrated an `isCasting` state in `App.tsx` that instantly closes both the character sheet and the in-world floating dialogue box (`SpeechBubble`) whenever an ability is triggered, allowing full visibility of the real-time 3D particle explosion.
- **Memory & Photo Gallery Plan**: Validated 4-phase architecture in `plans/261029-1724-memory-gallery/` covering location-anchored 3D Memory Crystals, zero-auth Google Drive CDN image linking, touch photo lightbox, and nostalgic audio cues.

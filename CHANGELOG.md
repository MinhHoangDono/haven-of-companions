# Changelog

All notable changes to the **Haven of Companions (*Làng Tri Kỷ*)** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v3.5.0] - 2026-10-29

### Added
- **3D Character Preview Viewport (`CharacterPreview3D.tsx`)**: Embedded interactive 3D WebGL viewport inside the companion sheet modal with soft lighting, glowing faction runic pedestal, and 360° touch/mouse rotation with momentum physics.
- **Tap-to-Move Waypoint Navigation**: Tapping open terrain, boardwalks, or docks while a companion is selected directs them to walk to the destination with dynamic heading orientation, walking bobbing, and a pulsing golden destination waypoint ring.
- **Ambient Village Life & Roaming**: Idle companions periodically take relaxed strolls around their local post, creating a living medieval diorama.
- **Left-Docked Companion List (`CharacterCarousel.tsx`)**: Re-anchored companion selection list to the upper-left flank directly beneath the "Haven of Companions" card, featuring a one-tap collapse/expand toggle, active ping indicator, and quick "Xem" sheet buttons.
- **Google Font Inter**: Replaced serif fonts with Inter across all HTML typography and in-world 3D canvas billboard nameplates, providing flawless rendering of all Vietnamese diacritics without clipping or fallback distortion.
- **Auto-Close Modal on Ability Cast**: Triggering a companion's signature ability automatically closes the modal sheet so the player can unobstructed view the 3D spell particle explosion.

### Changed
- **Ocean Wave Normal Computation**: Removed flat rectangular foam strips and implemented continuous vertex normal recalculation (`computeVertexNormals()`) on a smooth faceted low-poly cyan-blue ocean material, eliminating harsh white lines.
- **Box Containment & Ellipsis**: Applied `min-w-0`, `truncate`, and flex wrapping on hero names, pronouns, and titles inside `CharacterModal.tsx` and `SpeechBubble.tsx` to strictly prevent container overflow.

### Removed
- **Redundant Camera Rotate Buttons**: Removed floating `Xoay góc nhìn 45°` buttons (`↺` / `↻`) from `App.tsx` in favor of natural 2-finger twist gestures, right-mouse drag orbit, and touch navigation.
- **Hội Ngộ Feature**: Removed the bottom-right reunion button, modal trigger, and toast handlers.

---

## [v3.3.0] - 2026-10-29

### Added
- **Coastal Expansion & Maritime Life**:
  - Re-positioned Nguyễn Thị Ngọc Hà (Kensei Monk) and Lâm Anh Thư (Ocean Cleric) to the breaking surf and seaside boardwalk.
  - Procedural two-masted medieval galleon with sterncastle, rigging, and gentle oceanic roll.
  - Stone coastal lighthouse with high-intensity rotating beacon light cast over the waves.
  - Subdivided 3D water mesh with real-time sinusoidal wave swell.

---

## [v3.2.0] - 2026-10-29

### Added
- **3D Particle Spell System (`SpellEffect3D.ts`)**:
  - Real-time 3D particle bursts for all 9 companions: *Verdant Bloom*, *Eagle Eye*, *Hymn of Antiquity*, *Grand Pyrotechnic*, *Dawn Radiance*, *Flowing Water Katas*, *Aegis of the Coast*, *Swashbuckler Flourish*, and *Tidal Embrace*.
- **Interactive Village Props**: Clickable campfire cauldron, festive tea pavilion, coastal sea bell, and fireworks mortar with synthesized Web Audio chimes and particle reactions.
- **Tactical 3D Camera Rotation**: Smooth camera azimuth orbiting with touch and mouse support.

---

## [v3.1.0] - 2026-10-29

### Added
- Full 9-companion roster with individualized 3D humanoid character models in `CharacterMeshBuilder.ts`.
- In-world billboard nameplate sprites with faction badges and runic pedestals.
- Synthesized Web Audio ability sound effects in `audioManager.ts`.

---

## [v3.0.0] - 2026-10-29

### Added
- **Three.js 3D Isometric Engine Migration**:
  - Replaced 2D canvas with full 3D diorama (`ThreeIsometricCanvas.tsx`).
  - 3-tiered vertical diorama (Highlands clifftop $\rightarrow$ Town square plaza $\rightarrow$ Coastal harbor).
  - PBR materials, soft directional sunlight (`PCFSoftShadowMap`), warm point lights, and dynamic 4-stage day/night atmospheric transitions.
  - Mobile touch controls (`TouchControls3D.ts`): 1-finger inertia pan, 2-finger pinch zoom, raycasting.

---

## [v1.0.0] - 2026-10-29

### Added
- Initial project scaffold with React 18, Vite, TypeScript, and Tailwind CSS.
- PWA manifest and offline service worker caching.
- Base companion database with Vietnamese lore, real-life memory anchors, and RPG stats.

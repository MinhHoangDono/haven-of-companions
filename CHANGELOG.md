# Changelog

All notable changes to the **Haven of Companions (*Làng Tri Kỷ*)** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v4.1.0] - 2026-10-30

### Added
- **Responsive Character Modal (`CharacterModal.tsx`)**: Re-architected modal layout to display as a full-screen view on mobile devices (`w-full h-full rounded-none pt-safe pb-safe`) and as an elegant centered modal on desktop/web screens (`sm:items-center sm:rounded-3xl sm:max-w-xl sm:max-h-[90vh]`).
- **Dialog Auto-Dismissal During Ability Cast (`App.tsx`)**: Introduced `isCasting` state that automatically dismisses both the character sheet and the in-world floating `SpeechBubble` dialogue box during spell activation, ensuring 3D particle explosions remain completely unobstructed.
- **Strategic Skill Button Placement**: Moved the primary signature ability button (*"Thi triển [Kỹ năng]"*) to the top of the character sheet, directly above the 360° interactive hero model viewport for instant accessibility.
- **Memory Feature Implementation Plan (`plans/261029-1724-memory-gallery/`)**: Formulated and validated a comprehensive 4-phase plan for location-anchored 3D Memory Crystals, Google Drive direct CDN image resolution, touch-first photo gallery modal, and nostalgic audio chimes.

### Removed
- **"Raise a Toast" Button**: Cleaned out the obsolete toast action button and associated event handlers from `CharacterModal.tsx` and `App.tsx`.

---

## [v4.0.0] - 2026-10-30

### Added
- **KayKit Adventurers 3D Character Remodel (`CharacterMeshBuilder.ts`, `CharacterPreview3D.tsx`)**: Upgraded all 9 companions to stylized low-poly 3D models from `KayKit_Adventurers_2.0_FREE` (`Knight.glb`, `Mage.glb`, `Ranger.glb`, `Rogue.glb`, `Rogue_Hooded.glb`, `Barbarian.glb`) with class-specific armor, tunics, robes, and hand-socket weapon attachments (`staff.gltf`, `bow_withString.gltf`, `quiver.gltf`, `sword_2handed_color.gltf`, `shield_square_color.gltf`, `dagger.gltf`).
- **24x24 Diorama Expansion & 5-Step Stepped Topography (`DioramaBuilder.ts`)**: Expanded world bounds from $16 \times 16$ to $24 \times 24$ ($X, Z \in [-12, 12]$) featuring 5 vertical elevation tiers connected by sloped ramps, stone stairs, and rock ledges across 4 biomes (Highlands Mountain, Sunspire Plaza, Coastal Bay, and Outer Lighthouse Promontory).
- **Water Navigation Blocking & Passability Grid (`passabilityMap.ts`)**: Implemented discrete 2D passability grid preventing companions from moving or falling into deep ocean water while permitting movement along dry land, ramps, and wooden boardwalk dock piers.
- **Declarative Fast-Placement Prop System (`propLayoutData.ts`, `PropPlacementManager.ts`)**: Introduced data-driven prop layout registry allowing instant 1-line copy-pasting of KayKit medieval buildings (tavern, homes, church, market, windmill), campsite, pine trees, and Kenney pirate galleon, lighthouse, docks, and cannons.
- **GLTF Asset Loader Pipeline (`GLTFAssetLoader.ts`)**: Singleton asset loader with in-memory promise caching, shadow casting/receiving traversal, and `SkeletonUtils.clone` for safe skinned mesh instantiation.

### Changed
- **30 FPS Battery & Thermal Optimization**: Relaxed frame rate throttle to 30 FPS (~33.3ms interval), reducing CPU/GPU overhead by ~50% on mobile while accommodating richer geometry and prop density.
- **Camera Orbit & Bounds (`TouchControls3D.ts`)**: Expanded clamping bounds to $[-11.5, 11.5]$ and camera zoom distance range to $[10, 42]$.
- **Service Worker Cache**: Incremented cache version to `haven-companions-v4.0`.

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

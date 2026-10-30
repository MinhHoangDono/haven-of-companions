# Haven of Companions (*Làng Tri Kỷ*)

An interactive, mobile-first 3D isometric medieval fantasy RPG web diorama celebrating friendship. Built with **React 18, Vite, TypeScript, and Three.js**, the world features 9 distinct character classes representing close friends across three interconnected realms inspired by real-life memories: the misty pine highlands of Đà Lạt, the celebratory New Year fireworks plaza, and the sunlit coastal waters of Nha Trang Bay.

🌐 **Live Production Deployment**: [https://minhhoangdono.github.io/haven-of-companions/](https://minhhoangdono.github.io/haven-of-companions/)  
📦 **GitHub Repository**: [https://github.com/MinhHoangDono/haven-of-companions](https://github.com/MinhHoangDono/haven-of-companions)
---

## Key Highlights

- **Compact 3-Tiered 3D Diorama**: Highlands Clifftop (Tier 3) $\rightarrow$ Town Square Plaza (Tier 2) $\rightarrow$ Coastal Harbor & Docks (Tier 1) over animated ocean water.
- **9 Unique Friend Heroes**: Handcrafted 3D humanoid avatars with distinctive weapons, floating billboard nameplates, and glowing runic pedestals.
- **Tactical 3D Camera Controls**:
  - 1-finger inertial pan & 2-finger pinch zoom ($9\text{m}$ to $32\text{m}$).
  - Free 2-finger twist rotation on mobile + Right-click drag on PC.
  - Tactical Quick-Rotate buttons (`↺` / `↻`) for instant $45^\circ$ snap rotation to inspect characters behind buildings and cliffs.
- **RPG Dual Ability System & 18 GPU-Batched VFX**: Each companion commands 1 Active Ability (tactical short cooldown) and 1 Ultimate Ability (cinematic tide-turner) powered by `three.quarks` `BatchedRenderer` (single draw call) with procedural Web Audio synthesis.
- **Interactive Village Props**: Bubbling campfire cauldron, coastal tide bell, festival fireworks mortar battery, and tatami tea pavilion.
- **Party Reunion Feast (Hội Ngộ 9 Tri Kỷ)**: Single-tap party celebration trigger gathering all 9 friends with multi-harmonic audio chimes and simultaneous wave celebration hops.
- **City Builder & Voxel Construction Mode**: In-game medieval construction sandbox with 22 CC0 structures across 5 categories, real-time green/red ghost preview, 90° rotation, bulldozer tool, dynamic passability synchronization, and `localStorage` layout persistence.
- **3D Platformer & Collectibles**: 12 scattered 3D collectibles across 3 biomes (Gold Coins, Wild Tea Leaves, Conch Shells, Fireworks Embers) with magnetic proximity pickup, coin counter HUD in `TopBar`, fragile falling pier plank, and high-jump thermal wind vent.
- **Physical 3D Ocean Waves & Cel-Shaded Hearth**: Real dynamic low-poly physical ocean wave simulation with vertex normal computation ($Y = 0.02$, capped swell preventing shoreline flooding) and cel-shaded anime flame hearth (`CartoonFireMesh.ts`).
- **Atmospheric Day/Night & Weather**: 4-stage lighting (Dawn, Day, Sunset, Night) with PCF soft shadow mapping, campfire flame flicker, and Đà Lạt mountain mist.
- **Mobile Performance & PWA**: 60 FPS active / 30 FPS idle battery-saving loop, manual vendor chunk splitting, and offline Service Worker support (`v8.5`).
---

## Quick Start

### Prerequisites
- Node.js $\ge 18$
- npm $\ge 9$

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd <repo-folder>

# Install dependencies
npm install

# Start local development server (accessible over Wi-Fi for mobile testing)
npm run dev
```

### Building for Production
```bash
# Run TypeScript typecheck and Vite production build
npm run build

# Preview production build locally
npm run preview
```

### Deployment Pipeline
The application is continuously deployed to **GitHub Pages** via GitHub Actions:
```bash
# 1. Verify build
npm run build

# 2. Push to master (GitHub Actions automatically builds and deploys in ~30s)
git push origin master
```
*Note for AI Agents & Developers*: When shipping production changes, always bump `CACHE_NAME` in `public/sw.js` and ensure `base: './'` is maintained in `vite.config.ts`.
---

## Documentation Navigation

For technical handover, system architecture, and future development guides, refer to [`docs/`](./docs/):

- [`docs/index.md`](./docs/index.md) – Central documentation index and navigation map.
- [`docs/handover-guide.md`](./docs/handover-guide.md) – Developer runbook, local environment setup, deployment pipeline, and operational gotchas.
- [`docs/system-architecture.md`](./docs/system-architecture.md) – Coordinate system, 3D scene graph, camera math, touch gesture engine, and state management.
- [`docs/character-registry.md`](./docs/character-registry.md) – Specification of the 9 friends: real-life inspirations, factions, stats, lore, and 3D diorama anchors.
- [`docs/remodeling-guide.md`](./docs/remodeling-guide.md) – Step-by-step roadmap for upgrading character and environment models using the included Kenney and KayKit GLB asset packs.
- [`docs/project-progress.md`](./docs/project-progress.md) – Comprehensive milestone audit and acceptance criteria verification.

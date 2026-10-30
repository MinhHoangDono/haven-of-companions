# Developer Handover Runbook

This guide contains everything an incoming software engineer or AI agent needs to set up, maintain, test, and ship updates to **Haven of Companions**.

---

## 1. Local Environment Setup

### Prerequisites
- **Node.js**: $\ge 18.0.0$ (LTS recommended)
- **NPM**: $\ge 9.0.0$
- Modern WebGL2-compatible browser (iOS Safari, Android Chrome, Chrome/Firefox/Edge on Desktop)

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd <repository-directory>

# Install npm dependencies
npm install

# Start Vite development server with network exposure
npm run dev
```

The Vite dev server will print both the local URL (`http://localhost:3000`) and the Network URL (`http://<your-lan-ip>:3000`). To test real mobile touch behavior, connect your smartphone to the same local Wi-Fi network and navigate to the Network URL.

---

## 2. Key NPM Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts Vite HMR dev server bound to `0.0.0.0:3000`. |
| `npm run build` | Runs strict TypeScript verification (`tsc`) followed by the Vite production bundle build. |
| `npm run preview` | Spins up a local static server serving the production `dist/` directory. |

---

## 3. Production Deployment Pipeline

The application is deployed on **GitHub Pages** via **GitHub Actions** with zero backend infrastructure requirements (100% static client-side SPA with WebGL).

### Live Production Deployment
- **Production URL**: [https://minhhoangdono.github.io/haven-of-companions/](https://minhhoangdono.github.io/haven-of-companions/)
- **Repository**: [https://github.com/MinhHoangDono/haven-of-companions](https://github.com/MinhHoangDono/haven-of-companions)
- **CI/CD Workflow**: `.github/workflows/deploy.yml`

### Step-by-Step Deployment Runbook for AI Agents & Engineers
```bash
# Step 1: Verify TypeScript & build production bundle cleanly
npm run build

# Step 2: Bump Service Worker cache version in public/sw.js (e.g. from v6.4 to v6.5)
# (Mandatory to bust stale iOS/Android PWA caches)

# Step 3: Commit and push to master branch
git add .
git commit -m "feat(release): description of your update"
git push origin master

# Step 4: Monitor the automated GitHub Actions deployment (takes ~25-35s)
gh run list --repo MinhHoangDono/haven-of-companions --limit 3
gh run watch <run-id> --exit-status

# Step 5: Verify production site returns HTTP 200 OK
curl -I https://minhhoangdono.github.io/haven-of-companions/
```

### Critical Deployment Invariants for Multi-Agent Collaboration
1. **Vite Base Path (`vite.config.ts`)**:
   `vite.config.ts` **must always retain `base: './'`** (or `/haven-of-companions/`). If set to root `'/'`, all JS/CSS chunks and 3D GLTF models will fail with 404 errors on GitHub Pages subfolder hosting.
2. **GLTF Asset Path Resolution (`src/engine/three/GLTFLoader.ts`)**:
   When loading 3D assets or props via `GLTFLoader`, paths must be resolved via the centralized `resolveAssetUrl(url)` helper to prevent absolute root `/models/...` breakages in subdirectories.
3. **PWA Cache Invalidation (`public/sw.js`)**:
   Whenever UI, models, or physics code changes, **increment `CACHE_NAME`** in `public/sw.js` (`haven-companions-v6.x`). This commands client browsers to purge stale cached chunks on subsequent page loads.
4. **Vercel / Netlify Alternative**:
   The repository is also directly deployable to Vercel or Netlify as a standard Vite static project (`Build command: npm run build`, `Output directory: dist`).

## 4. Source Code Architecture & File Map

```
src/
├── App.tsx                               # Root orchestrator: HUD, top bar, modals, spell & build triggers
├── main.tsx                              # React DOM mount point & Service Worker registration
├── types/
│   ├── character.ts                      # Character interface, factions, stats, signature abilities
│   ├── engine.ts                         # Coordinate types and screen dimensions
│   ├── threeEngine.ts                    # 3D hit detection types and raycasting interfaces
│   ├── cityBuilder.ts                    # Building categories, structure definitions, serialized layout
│   └── platformer.ts                     # 3D collectibles, falling planks, and jump vent interfaces
├── data/
│   ├── charactersData.ts                 # Full 9-companion roster lore, bios, stats, and abilities
│   └── propLayoutData.ts                 # Declarative placements for village buildings, galleon, and props
├── audio/
│   └── audioManager.ts                   # Web Audio synthesizer: chimes, toasts, spells & builder SFX
├── engine/
│   ├── map/
│   │   └── passabilityMap.ts             # 2D discrete cell grid ($70 \times 70$) walkability & elevation
│   └── three/
│       ├── TouchControls3D.ts            # Touch controller: inertia pan, pinch zoom, rotation, raycast, follow
│       ├── DioramaBuilder.ts             # 3-tier terrain, buildings, lighthouse, galleon, waves
│       ├── VoxelTerrainBuilder.ts        # Stepped voxel terrain generator with coastal sand & coves
│       ├── CharacterMeshBuilder.ts       # 9 humanoid hero avatars, 3D nameplates, runic pedestals
│       ├── LightingManager.ts            # Directional sun, soft shadow mapping, day/night cycle
│       ├── SpellEffect3D.ts              # Real-time 3D particle spell animations
│       ├── CollectibleMeshBuilder.ts     # 12 scattered 3D collectibles with magnetic proximity pickup
│       ├── DynamicPlatformManager.ts     # Fragile falling pier planks and high-jump thermal wind vents
│       └── builder/
│           ├── CityBuilderController.ts  # In-game voxel construction, ghost hologram, rotation, bulldozer
│           ├── CitySaveManager.ts        # LocalStorage persistence, JSON export/import for user villages
│           └── DynamicMeshLibrary.ts     # 22 CC0 structures across 5 categories with footprint metadata
└── components/
    ├── canvas/
    │   └── ThreeIsometricCanvas.tsx      # React wrapper mounting Three.js WebGLRenderer & RAF loop
    └── ui/
        ├── TopBar.tsx                    # Time-of-day, weather, audio mute, build toggle, coin counter
        ├── CharacterCarousel.tsx         # Bottom thumb-zone carousel for instant character jumping
        ├── SpeechBubble.tsx              # In-world dialogue bubble projected from 3D head positions
        ├── CharacterModal.tsx            # Slide-up bottom sheet with full RPG stats and "Cast" trigger
        ├── InspectorBar.tsx              # In-engine 3D Coordinate & Object Inspector tool
        └── builder/
            ├── BuilderToolbar.tsx        # Bottom catalog drawer with categories & structure cards
            ├── StructureCard.tsx         # Item card with sprite preview, cost, and footprint
            └── SaveLoadModal.tsx         # Village layout JSON import/export and reset modal
```

---

## 5. Major Subsystems & Packages

### 5.1 City Building & Sandbox Construction Package (`src/engine/three/builder/`)
- **Controller (`CityBuilderController.ts`)**: Manages the construction lifecycle. Handles pointer hover raycasting over `VoxelTerrainBuilder`, projects real-time green/red ghost preview holograms, rotates structures 90° clockwise, executes placement, and dismantles structures via the Bulldozer tool.
- **Dynamic Mesh Library (`DynamicMeshLibrary.ts`)**: Registers 22 medieval and nature structures categorized into Houses, Production, Fortifications, Decorations, and Nature. Encapsulates footprint bounding boxes ($1\times 1$, $2\times 2$, $3\times 3$), elevation offsets, and shared material pooling.
- **Dynamic Passability Sync**: When structures are placed or demolished, `CityBuilderController` calls `passabilityGrid.setWalkable(cellX, cellZ, isWalkable)` to ensure companions dynamically navigate around player structures without clipping.
- **Persistence (`CitySaveManager.ts`)**: Automatically saves the village layout to `localStorage` under key `haven_city_layout_v1`. Supports downloading/uploading JSON files for sharing creations.

### 5.2 3D Platformer & Collectibles Package (`src/engine/three/`)
- **Collectibles (`CollectibleMeshBuilder.ts`)**: Spawns and manages 12 animated 3D collectibles across the 3 biomes (Gold Coins, Wild Tea Leaves, Conch Shells, Fireworks Embers). Features continuous rotation, vertical sine bobbing, magnetic proximity pickup ($<1.35\text{m}$), and a $25\text{s}$ respawn timer.
- **Dynamic Platforms (`DynamicPlatformManager.ts`)**:
  - **Falling Pier Plank**: Sinks into the water $0.85\text{s}$ after a hero steps on it; respawns and floats back after $4.0\text{s}$.
  - **Thermal Geyser / Wind Vent**: Ascending particle vortex that launches the stepping hero upward with `launchJump(10.8)` to scale steep mountain clifftops.

---

## 6. Critical Scars & Operational Gotchas

### 5.1 Mobile Web Audio Auto-play Policy
- **Problem**: Modern mobile browsers (iOS WebKit and Android Blink) block audio playback until the user initiates a genuine touch interaction.
- **Solution**: The `audioManager.ts` instance initializes in a suspended state and unlocks automatically on the first user pointer tap (`audioManager.unlock()`). Never attempt to play background audio during initial page load.

### 5.2 Device Pixel Ratio (DPR) Clamping
- **Problem**: Flagship phones (iPhone Pro, Samsung Galaxy S) have DPR values of $3.0\times$ or $4.0\times$. Rendering a complex 3D scene at $4.0\times$ DPR causes thermal throttling and battery drain.
- **Solution**: In `ThreeIsometricCanvas.tsx`, renderer pixel ratio is strictly capped:
  ```typescript
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
  ```
  This retains razor-sharp visuals while keeping GPU fill rates lightweight.

### 5.3 Safe Area Insets on Mobile
- **Problem**: Modern phones with bottom home bars and top camera notches cut off HUD controls.
- **Solution**: `index.html` sets `viewport-fit=cover`, and all fixed HUD containers (`TopBar`, `CharacterCarousel`, `CharacterModal`) utilize Tailwind's `pb-safe` and `pt-safe` CSS padding utilities.

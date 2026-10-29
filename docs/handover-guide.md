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

The application is deployed on **Netlify** with zero backend infrastructure requirements (100% static client-side SPA with WebGL).

### Deploying to Production
```bash
# Step 1: Ensure clean build
npm run build

# Step 2: Deploy to Netlify production
npx netlify deploy --prod --dir=dist
```

### Operational Deployment Invariant: Service Worker Cache
When shipping a new release, **always bump `CACHE_NAME` in `public/sw.js`**:
```typescript
// public/sw.js
const CACHE_NAME = 'haven-companions-v3.4'; // increment on release
```
*Why?* Mobile Safari and Android Chrome aggressively cache PWA assets. Incrementing `CACHE_NAME` triggers the service worker `activate` event, which purges stale cached bundles and ensures users receive the latest changes immediately.

---

## 4. Source Code Architecture & File Map

```
src/
├── App.tsx                               # Root orchestrator: HUD, top bar, modals, spell triggers
├── main.tsx                              # React DOM mount point & Service Worker registration
├── types/
│   ├── character.ts                      # Character interface, factions, stats, signature abilities
│   ├── engine.ts                         # Coordinate types and screen dimensions
│   └── threeEngine.ts                    # 3D hit detection types and raycasting interfaces
├── data/
│   └── charactersData.ts                 # Full 9-companion roster lore, bios, stats, and abilities
├── audio/
│   └── audioManager.ts                   # Web Audio synthesizer: chimes, toasts, and 9 spell SFX
├── engine/
│   └── three/
│       ├── TouchControls3D.ts            # Touch controller: inertia pan, pinch zoom, rotation, raycast
│       ├── DioramaBuilder.ts             # 3-tier terrain, buildings, lighthouse, galleon, waves
│       ├── CharacterMeshBuilder.ts       # 9 humanoid hero avatars, 3D nameplates, runic pedestals
│       ├── LightingManager.ts            # Directional sun, soft shadow mapping, day/night cycle
│       └── SpellEffect3D.ts              # Real-time 3D particle spell animations
└── components/
    ├── canvas/
    │   └── ThreeIsometricCanvas.tsx      # React wrapper mounting Three.js WebGLRenderer & RAF loop
    └── ui/
        ├── TopBar.tsx                    # Time-of-day, weather, and audio mute controls
        ├── CharacterCarousel.tsx         # Bottom thumb-zone carousel for instant character jumping
        ├── SpeechBubble.tsx              # In-world dialogue bubble projected from 3D head positions
        └── CharacterModal.tsx            # Slide-up bottom sheet with full RPG stats and "Cast" trigger
```

---

## 5. Critical Scars & Operational Gotchas

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

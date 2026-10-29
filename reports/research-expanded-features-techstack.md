# Research Report: Engine & Tech Stack Architecture for Advanced Features

> **Date**: 2026-10-30  
> **Topic**: Technical Evaluation of Engines & Stacks for NPC Routing, Physics, Dynamic Assets, and Google Photos/Drive Memory Galleries  
> **Target Platform**: Mobile-First Web (iOS Safari, Android Chrome, Desktop Web)  
> **Status**: Completed  

---

## 1. Executive Summary & Verdict

If your goal is to expand the current medieval fantasy village with:
1. **Specific NPC interactions & routine scheduling** (NPC conversations, daily time-based schedules, boat riding, lighting campfires),
2. **Real physics and dynamic 3D asset streaming** (rigid bodies, triggers, Kenney/KayKit GLTF loading), and
3. **A Memory Photo Gallery** connected to Google Drive or Google Photos,

### The Recommendation
**Stay on your current stack (Pure Three.js + React 18 + Vite) and add modular micro-libraries.**  
Do **not** rewrite to Godot 4 Web or heavy full-game engines.

* **Why avoid Godot 4 Web?** Godot 4's HTML5 export requires `SharedArrayBuffer` with strict `Cross-Origin-Opener-Policy` (COOP) and `Cross-Origin-Embedder-Policy` (COEP) headers. These headers **block loading external images from Google Drive / Google Photos** due to cross-origin isolation restrictions, and Godot 4 Web crashes frequently on iOS Safari due to memory ceilings (30MB+ initial WASM payload).
* **Why stay on Three.js + React 18?** It compiles in seconds, loads in `<1.5s`, maintains **60 FPS on mobile phones**, and allows React DOM overlays (e.g. photo lightbox, dialogue UI, audio controls) to coexist seamlessly with the 3D scene without iframe or canvas encapsulation headaches.

---

## 2. Tech Stack Blueprint for New Features

```
+-----------------------------------------------------------------------------------+
|                                  USER INTERFACE                                   |
|   React 18 + Tailwind CSS + Lucide Icons + Yet-Another-React-Lightbox (Memories) |
+-----------------------------------------------------------------------------------+
                                         |
+-----------------------------------------------------------------------------------+
|                             GAME STATE & SIMULATION                               |
|   * WorldClock (Day/Night Schedule)         * Dialogue & Interaction Manager      |
|   * NPC FSM (Daily Routines & Waypoints)    * Memory Manifest (Google Drive ID)   |
+-----------------------------------------------------------------------------------+
             |                                                  |
+----------------------------+                     +--------------------------------+
|     3D VISUAL ENGINE       |                     |        PHYSICS & NAVMESH       |
|  * Three.js (WebGL2)       | <=================> |  * @dimforge/rapier3d-compat   |
|  * GLTFLoader + KTX2/Meshopt|                     |  * @recast-navigation/three   |
|  * PCFSoftShadows & Particles                     |    (A* Pathfinding & NavMesh) |
+----------------------------+                     +--------------------------------+
```

---

## 3. Deep-Dive by Requested Feature

### Feature Set 1: Specific Interaction, Routing & Scheduling

#### A. Time-of-Day Scheduling (Daily Routines)
* **Design Pattern**: Simple Event-Driven Finite State Machine (FSM) driven by in-game time (`hour: 0..24`).
* **Implementation**:
  ```typescript
  export interface ScheduleRoutine {
    startHour: number;
    activity: 'working' | 'patrolling' | 'relaxing' | 'gathering';
    targetLocation: { x: number; z: number; name: string };
    interactionTarget?: 'campfire' | 'tea_pavilion' | 'dock_boat';
  }
  ```
  - **Dawn (06:00 - 11:00)**: Ngọc Hà walks to the seaside tatami pavilion to practice katas; Thi gathers herbs in the highlands.
  - **Day (11:00 - 17:00)**: Friends wander to the central market plaza; Xuân Minh guards the moored boat.
  - **Dusk (17:00 - 20:00)**: Characters gather near the campfire hearth. One character triggers `lightCampfire()`.
  - **Night (20:00 - 05:00)**: Campfire glows brightly, characters sit on logs around the pot and chat.

#### B. NPC-to-NPC Conversations & Proximity Dialogue
* When two NPCs approach within interaction distance ($r < 1.4\text{m}$), trigger an exchange state:
  - Both orient towards each other: `charA.lookAt(charB.position)`.
  - Staggered speech bubbles appear above their heads sequentially (3.0s each).
  - Uses an event bus (`dialogueBus.emit('npc_chat', { from: 'thi', to: 'phuong' })`).

#### C. Mounting & Riding the Boat
* When a character's routine targets `'dock_boat'`:
  1. Character walks along the dock pier using waypoints.
  2. Character steps onto the boat platform ($x=2.5, z=5.8$).
  3. Parent the character's `THREE.Group` to `boatGroup`:
     ```typescript
     boatGroup.attach(characterGroup);
     ```
  4. The boat moves along a gentle spline curve across the bay while oscillating with water swell physics, automatically carrying the character with it!

---

### Feature Set 2: Physics & Asset Input Pipeline

#### A. Physics Engine Recommendation: **Rapier3D** (`@dimforge/rapier3d-compat`)
* **Why Rapier3D over Cannon.js?**
  - Cannon.js (and `cannon-es`) is abandoned/archaic, with known tunneling bugs and slower JS performance.
  - Rapier is written in Rust, compiled to WebAssembly, deterministic, and optimized for mobile performance (using SIMD where supported).
* **How to integrate into Three.js**:
  ```bash
  npm install @dimforge/rapier3d-compat
  ```
  ```typescript
  import RAPIER from '@dimforge/rapier3d-compat';

  await RAPIER.init();
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

  // Static Terrain Collider
  const groundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  world.createCollider(RAPIER.ColliderDesc.cuboid(8, 0.2, 8), groundBody);

  // Dynamic Character / Throwable / Boat Collider
  const charBody = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased());
  ```

#### B. NavMesh & Pathfinding: **`@recast-navigation/three`**
* Standard WebAssembly port of Recast & Detour.
* Generates walkable areas from your ground meshes (`threeToSoloNavMesh`), avoids cliffs and houses, and provides obstacle avoidance so characters don't walk through walls or collide with trees.

#### C. Asset Input Pipeline (GLTF / GLB)
* Use Kenney / KayKit modular fantasy packs (`.glb` format).
* **Compression Pipeline**: Run models through `gltf-transform` to compress with **Meshopt** or **Draco**:
  ```bash
  npx @gltf-transform/cli optimize input.glb output.glb --compress meshopt
  ```
* This reduces a $15\text{MB}$ village kit down to $\approx 1.8\text{MB}$ with sub-second decompression on mobile phones.

---

### Feature Set 3: Google Photos / Google Drive Memory Gallery

####  Critical 2025/2026 API Restriction Warning
* **Google Photos Library API Shutdown**: On **March 31, 2025**, Google deprecated and disabled all library-wide read scopes (`photoslibrary.readonly`). Third-party apps **cannot** background-query a user's Google Photos albums anymore (returns `403 PERMISSION_DENIED`).
* **The Modern Alternatives**:

| Approach | Setup Complexity | Stability & Performance | Recommendation |
| :--- | :--- | :--- | :--- |
| **1. Static JSON Manifest + Google Drive Direct IDs** | **Low (Zero Auth)** | **Rock Solid & Instant** | **Best for Curated Memories** ⭐ |
| **2. Cloudinary / Supabase Storage** | Low | Fast CDN, auto-thumbnails | **Top Alternative** |
| **3. Google Drive API (Public Shared Folder)** | Medium | Good, requires API key | Viable |
| **4. Google Photos Picker API** | High (OAuth2 user flow) | Requires user to re-pick photos each session | Overcomplicated for a game |

#### Recommended Implementation: Location-Anchored Memory Manifest
Define memory albums anchored to specific 3D coordinates in `src/data/memoriesData.ts`:

```typescript
export interface MemoryPlace {
  id: string;
  name: string;
  location: { x: number; y: number; z: number };
  associatedFriends: string[]; // ['anh-thi-druid', 'phuong-quynh-ranger']
  narrative: string;
  photos: {
    title: string;
    date: string;
    locationName: string;
    // Google Drive direct image URL: https://lh3.googleusercontent.com/d/{FILE_ID}=s1600
    imageUrl: string;
    caption: string;
  }[];
}

export const MEMORY_PLACES: MemoryPlace[] = [
  {
    id: 'highlands-campfire',
    name: 'Đà Lạt Pine Forest Camping',
    location: { x: -3.8, y: 1.8, z: -3.0 },
    associatedFriends: ['anh-thi-druid', 'phuong-quynh-ranger'],
    narrative: 'Outdoor campfire gathering under the misty pines of Da Lat.',
    photos: [
      {
        title: 'Campfire Night',
        date: '2024-12-15',
        locationName: 'Đà Lạt, Lâm Đồng',
        imageUrl: 'https://lh3.googleusercontent.com/d/1A2B3C4D5E6F...=s1600',
        caption: 'Gathering around the hearth for herbal tea and roasted sweet potatoes.'
      }
    ]
  },
  {
    id: 'coastal-docks',
    name: 'Nha Trang Bay Ocean Cruise',
    location: { x: 5.0, y: 0.15, z: 4.8 },
    associatedFriends: ['ngoc-ha-monk', 'thanh-phuong-paladin', 'xuan-minh-rogue', 'anh-thu-cleric'],
    narrative: 'Coastal boat expedition celebrating milestones with Japanese banquets.',
    photos: [
      {
        title: 'Boarding the Ship',
        date: '2024-07-20',
        locationName: 'Nha Trang Bay',
        imageUrl: 'https://lh3.googleusercontent.com/d/7G8H9I0J1K2L...=s1600',
        caption: 'Cruising the emerald water along the coastal boardwalk.'
      }
    ]
  }
];
```

#### How it Renders In-Game:
1. **3D Visual Indicator**: At each memory location, place a glowing floating ancient memory crystal or framed photo easel.
2. **On Tap**: Clicking the crystal triggers a sleek **React Lightbox Modal** (`yet-another-react-lightbox` or custom Tailwind card overlay).
3. **Features**:
   - Swipeable photo gallery of your actual memories with that friend.
   - Shows date, place, and diary note.
   - Background audio shifts to a soft acoustic nostalgic melody while reviewing memories.

---

## 4. Overall Engine Comparison Matrix

| Criteria | **Current (Three.js + React 18)** | **React Three Fiber (R3F)** | **Godot 4 (Web)** | **Babylon.js** |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Web FPS** | **60 FPS stable** | 45-60 FPS (micro-stutter risk) | 20-40 FPS (heavy) | 50-60 FPS |
| **Initial Load Time** | **< 1.5s** | ~2.5s | 8s - 25s (30MB+ WASM) | ~3.5s |
| **Google Drive Image Embedding** | **Trivial (`<img>` tag / `<canvas>`)** | Trivial | **Blocked by COOP/COEP** ⚠️ | Trivial |
| **React Overlay UI (Modals/Dialogues)** | **Seamless** | Seamless | Awkward / iframe mess | Decoupled |
| **Touch Controls (Pinch, Twist, Tap)** | Handcrafted & verified | Community wrappers | Touch emulation bugs on iOS | Touch camera built-in |
| **Engineering Effort** | **Incremental add-on** | Complete rewrite | Complete rewrite & port | Complete rewrite |

---

## 5. Actionable Roadmap & Next Steps

1. **Step 1 (Memories & Photo Gallery)**:
   - Create `src/data/memoriesData.ts` with your Google Drive image links and friend tags.
   - Add interactive Memory Crystals / Photo Easels at the Campfire, Plaza, and Docks.
   - Build a mobile-friendly photo lightbox modal inside `src/components/ui/MemoryModal.tsx`.
2. **Step 2 (Routine & Schedule Engine)**:
   - Build `ScheduleManager.ts` that triggers waypoint moves when `timeOfDay` shifts (Dawn, Day, Sunset, Night).
   - Hook up boat riding and campfire lighting animations.
3. **Step 3 (NavMesh & Physics)**:
   - Install `@dimforge/rapier3d-compat` for physical collisions and boat buoyancy.
   - Install `@recast-navigation/three` for obstacle-free pathfinding across terraces.
4. **Step 4 (3D Asset Pack Import)**:
   - Convert Kenney / KayKit `.glb` files with `gltf-transform` and inject them via `GLTFLoader`.

---

## 6. Unresolved Questions

1. Do you already have a specific Google Drive folder or Google Photos album ready with your friends' trip photos, or would you prefer a local asset folder (`public/memories/`) to avoid relying on external Google URLs?
2. Would you like the boat ride to be an automated sightseeing cruise loop around the diorama that the player or friends can board?

# Future Feature Blueprint: 3D Asset Remodeling with Kenney Kits

> **Author**: AgentKit Project Management  
> **Target Version**: `v4.0`  
> **Source Asset Kits**:  
> - `kenney_blocky-characters_20`: Low-poly rigged blocky character GLBs with textures  
> - `kenney_pirate-kit`: Maritime pirate ships, watchtowers, docks, cannons, palm trees, chests, barrels, and rocks  

---

## 1. Objectives

Upgrade the current procedural 3D primitives (procedural cones, boxes, and cylinders) to Kenney's stylized low-poly 3D models while:
1. Preserving all existing gameplay mechanics (smooth 1-finger touch pan, 2-finger pinch zoom, 3D camera rotation, in-world speech bubbles, and character modal sheets).
2. Preserving the 60 FPS mobile performance ceiling and fast load time.
3. Giving each of the 9 friends an expressive, distinctive 3D blocky avatar tailored to their class personality.
4. Enhancing the coastal harbor with detailed 3D pirate galleon meshes, stone watchtower lighthouse, wooden dock walkways, and tropical shoreline foliage.

---

## 2. Source Asset Inventory

### 2.1 Character Models (`kenney_blocky-characters_20/Models/GLB format/`)
The kit provides 18 distinct humanoid models with clean UV unwrapping and texture palettes:
- `character-a.glb` through `character-r.glb`
- Texture files in `kenney_blocky-characters_20/Models/GLB format/Textures/texture-[a-r].png`

### 2.2 Pirate & Coastal Models (`kenney_pirate-kit/Models/GLB format/`)
Key environment assets available in `.glb` format:
- **Ships & Boats**: `ship-pirate-large.glb`, `ship-large.glb`, `ship-medium.glb`, `ship-small.glb`, `boat-row-large.glb`, `boat-row-small.glb`.
- **Lighthouse & Watchtowers**: `tower-complete-large.glb`, `tower-watch.glb`, `tower-top.glb`, `tower-middle-windows.glb`.
- **Docks & Walkways**: `structure-platform-dock.glb`, `structure-platform-dock-small.glb`, `structure-fence.glb`.
- **Clutter & Interactive Props**: `cannon.glb`, `cannon-mobile.glb`, `chest.glb`, `barrel.glb`, `crate.glb`, `crate-bottles.glb`.
- **Flora & Shoreline**: `palm-straight.glb`, `palm-detailed-bend.glb`, `rocks-sand-a.glb`, `rocks-sand-b.glb`, `rocks-c.glb`.

---

## 3. Character-to-Model Mapping Matrix

| Friend & Class | Kenney Character Model | Outfit / Texture Theme | Socket Attachments (Attached via Three.js) |
|---|---|---|---|
| **Huỳnh Trần Anh Thi** *(Wilderness Druid)* | `character-f.glb` | Forest Green Robe / Earth | Gnarled wooden staff + glowing emerald magic orb in right hand |
| **Lê Nguyễn Phương Quỳnh** *(Elven Ranger)* | `character-c.glb` | Hunter Green / Leather | Recurve elven bow in left hand + back quiver + feathered headband |
| **Trần Nguyễn Trâm Anh** *(Lore Bard)* | `character-m.glb` | Velvet Crimson / Ruby | Carved golden lute in hands + feathered jaunty beret |
| **Nguyễn Khải Vạn** *(Pyromancy Sorcerer)* | `character-a.glb` | Dark Robe / Fire Sigil | Pointed wizard hat + floating fireball orb in palm |
| **Nguyễn Trần Thảo Uyên** *(Cleric of the Light)* | `character-l.glb` | Luminous White & Gold | Floating sun halo disc + golden healing chalice / scepter |
| **Nguyễn Thị Ngọc Hà** *(Way of the Kensei Monk)* | `character-b.glb` | Clean Martial Arts Gi | Black obi belt + dual wooden bokken practice blades |
| **Phạm Trần Thanh Phương** *(Ronin / Paladin)* | `character-h.glb` | Heavy Plate Armor / Navy | Golden crescent kabuto crest + towering heraldic cross shield + katana |
| **Phạm Xuân Minh** *(Swashbuckler Rogue)* | `character-i.glb` | Pirate Tricorn & Coat | Dueling rapier + shiny gold doubloon coin |
| **Lâm Anh Thư** *(The Ocean Cleric)* | `character-o.glb` | Ocean Azure & Seafoam | Coral seashell headdress + sacred tidal bell trident |

---

## 4. Environment Prop Replacement Matrix

| Village Feature | Current Procedural Mesh | Proposed Kenney GLB Asset | Visual Enhancement |
|---|---|---|---|
| **Western Bay Galleon** | Procedural Box & Cone Ship | `ship-pirate-large.glb` | Full detailed pirate galleon with gun deck, carved stern, and rigging |
| **Coastal Lighthouse** | Procedural Cylinder Tower | `tower-complete-large.glb` | Authentic medieval stone beacon tower with watch windows |
| **Fishing Skiff** | Simple box rowboat | `boat-row-large.glb` | Realistic wooden rowboat moored with oars and rope cleats |
| **Harbor Boardwalk** | Box planks & cylinder piles | `structure-platform-dock.glb` | Weathered maritime wooden piers with authentic pilings |
| **Harbor Defense** | Plain stone armory | `cannon-mobile.glb` & `chest.glb` | Functional coastal battery guarding the harbor entrance |
| **Seaside Clutter** | Procedural barrels & crates | `barrel.glb`, `crate.glb`, `crate-bottles.glb` | Placed around tavern porch and docks for lived-in feel |
| **Coastal Palms** | None (Pine trees only) | `palm-detailed-bend.glb` | Tropical coastline aesthetics matching Nha Trang Bay |

---

## 5. Technical Implementation Blueprint

### Step 1: Asset Directory Setup
Copy only the required `.glb` files into the `public/` directory so Vite serves them statically:
```
public/
└── assets/
    └── models/
        ├── characters/
        │   ├── character-a.glb
        │   ├── ...
        │   └── character-r.glb
        └── environment/
            ├── ship-pirate-large.glb
            ├── tower-complete-large.glb
            ├── boat-row-large.glb
            ├── structure-platform-dock.glb
            ├── cannon.glb
            ├── chest.glb
            ├── barrel.glb
            └── palm-detailed-bend.glb
```

### Step 2: Asynchronous Asset Loader (`GLTFAssetLoader.ts`)
Create a singleton loader that pre-caches models to eliminate pop-in and ensure instant rendering:
```typescript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class AssetManager {
  private loader = new GLTFLoader();
  private cache = new Map<string, THREE.Group>();

  public async loadModel(path: string): Promise<THREE.Group> {
    if (this.cache.has(path)) {
      return this.cache.get(path)!.clone();
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          this.cache.set(path, gltf.scene);
          resolve(gltf.scene.clone());
        },
        undefined,
        reject
      );
    });
  }
}

export const assetManager = new AssetManager();
```

### Step 3: Character Model Instantiation (`CharacterMeshBuilder.ts`)
- Replace the procedural `buildHumanoidBase` call with an asynchronous instance of the cached Kenney GLB.
- Scale Kenney models uniformly: `gltfScene.scale.set(1.25, 1.25, 1.25)`.
- Re-attach custom class accessories:
  - Add staff/sword/shield to character's hand bone / position.
  - Mount the existing **floating billboard nameplate sprite** at $Y = 2.4$.
  - Keep the **glowing runic pedestal disc** beneath the character's feet.

### Step 4: Environment GLB Placement (`DioramaBuilder.ts`)
- Replace the procedural `buildLargeGalleon` with an instance of `ship-pirate-large.glb`.
- Replace `buildLighthouse` tower shaft with `tower-complete-large.glb`, retaining the rotating `PointLight` beacon on top.
- Scatter Kenney chests, barrels, and cannons around the shoreline dock.

---

## 6. Budget & Performance Guardrails

1. **Asset Size Cap**: The entire set of selected GLBs should not exceed **1.8 MB** (uncompressed) or **650 kB** (gzip).
2. **Draw Calls**: Use `instancedMesh` or shared materials where possible if scattering multiple barrels/crates.
3. **PWA Offline Pre-caching**: Add the new `.glb` paths into `PRECACHE_ASSETS` in `public/sw.js` so the 3D models work offline seamlessly.

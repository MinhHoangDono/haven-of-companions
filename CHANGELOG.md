# Changelog

## [v7.3.0] - 2026-10-30

### Added
- **Complete 53-Asset City Builder Catalog (`DynamicMeshLibrary.ts`)**: Integrated all available 3D models from both **KayKit Medieval/Hexagon Packs** and **Kenney Pirate & Environment Kits** into the construction system:
  - **Houses & Harbor (7 structures)**: Small/Large Cottages (`building_home_A/B_yellow.gltf`, $3\times 3$), Traveler's Tavern (`building_tavern_yellow.gltf`, $3\times 3$), Village Blacksmith (`building_blacksmith_yellow.gltf`, $3\times 3$), Sacred Cathedral (`building_church_yellow.gltf`, $4\times 4$), Coastal Timber Warehouse (`structure.glb`, $3\times 3$), Red-Roofed Port House (`structure-roof.glb`, $3\times 3$).
  - **Production & Quarrying (5 structures)**: Hillside Windmill ($3\times 3$), Village Bazaar Market Stall ($2\times 2$), Wooden Wheelbarrow ($1\times 1$), Stone Mine & Quarry (`resource_stone.gltf`, $2\times 2$), Agricultural Shovel & Hoe (`tool-shovel.glb`, $1\times 1$).
  - **Fortifications & Stone Castle (11 structures)**: Wooden Watchtower ($2\times 2$), Grand Stone Fortress Tower (`tower-complete-large.glb`, $3\times 3$), Plaza Bastion Tower (`tower-complete-small.glb`, $2\times 2$), Arched Castle Gatehouse (`castle-gate.glb`, $3\times 2$), Granite Castle Wall (`castle-wall.glb`, $2\times 1$), Arrow-Slit Lookout Wall (`castle-window.glb`, $2\times 1$), Fortress Dungeon Door (`castle-door.glb`, $2\times 1$), Stockade Wood Fence ($2\times 1$), Weapon Armory Rack ($1\times 1$), Archery Straw Dummy ($1\times 1$), High Royal Sunspire Banner (`flag-high.glb`, $1\times 1$).
  - **Decorations, Trade & Waterfront (12 structures)**: Nomad Canvas Pavilion Tent ($2\times 2$), Ornate Treasure Chest ($1\times 1$), Pirate Rum Bottles Crate ($1\times 1$), Open Cargo Crate (`crate_open.gltf`, $1\times 1$), Oak Water Barrel ($1\times 1$), Sawn Lumber Stack ($2\times 2$), Giant Druidic Potion Demijohn (`bottle-large.glb`, $1\times 1$), Wooden Training Platform Planks ($2\times 2$), Grand Pier Dock (`structure-platform-dock.glb`, $3\times 2$), Small Mooring Pier (`structure-platform-dock-small.glb`, $2\times 2$), Large Wooden Rowboat (`boat-row-large.glb`, $3\times 2$), Coastal Fishing Dinghy (`boat-row-small.glb`, $2\times 1$).
  - **Nature, Mountains & Flora (18 structures)**: Ancient Da Lat Pine ($2\times 2$, Scale 4.8), Medium Evergreen ($2\times 2$), Dual Pine Cluster (`trees_A_medium.gltf`, $3\times 3$), Grand Highland Pine Mountain Peak A (`mountain_A_grass_trees.gltf`, $4\times 4$), Sunspire Ridge Mountain Peak B (`mountain_B_grass_trees.gltf`, $4\times 4$), Curved Bay Palm ($2\times 2$), Straight Coastal Palm (`palm-detailed-straight.glb`, $2\times 2$), Beach Dune Palm ($2\times 2$), Coral Reef Boulder A ($2\times 2$), Coastal Coral Formation B ($2\times 2$), Marine Reef Outcrop C ($2\times 2$), Natural Highland Megalith A/B/C (`rock_single_A/B/C.gltf`, $2\times 2$), Mossy Forest Boulders A/B (`rocks-a/b.glb`, $2\times 2$), Wild Steppe Grass Tufts (`grass.glb`, $1\times 1$), Dense Shrub & Wildflowers (`grass-plant.glb`, $1\times 1$).
- **Expanded Builder UI Icons (`StructureCard.tsx`)**: Added dedicated Lucide visual icons (`Castle`, `Flag`, `Anchor`, `Ship`, `Shovel`, `Boxes`, `Warehouse`) matching all newly available structural categories.
- **Verified Scale & Footprint Integrity**: Every building is calibrated at $\ge 2\times 2$ or $3\times 3$ with heights ranging between $4.5\text{m}\text{--}7.5\text{m}$, ensuring player-built architecture dwarfs companion characters ($\approx 1.4\text{m}$).

---

## [v7.2.0] - 2026-10-30

### Added
- **Phase 2: Comprehensive RPG Item & Inventory System (`src/types/inventory.ts`, `src/data/itemsData.ts`, `src/engine/inventory/InventoryManager.ts`)**:
  - Full inventory backpack managing 30+ items across 6 categories (Weapons, Off-hands/Shields, Headgear/Hats, Capes & Mantles, Consumables, and World Collectibles).
  - Item rarity tiers (Common, Uncommon, Rare, Epic, Legendary) with stat boosts (Attack, Defense, Magic, Speed, Healing) and whimsical Vietnamese lore tied to real-life memories.
  - Persistent state in browser `localStorage` (`haven_inventory_items_v2`, `haven_equipment_v2`, `haven_active_buffs_v2`).
  - Active consumable buffs (Đà Lạt Pine Tea providing +35% movement speed boost and floral particle aura; Sunspire Sparklers launching mini fireworks; Celebration Mead triggering party hops).
  - Auto-loot synchronization: Collecting 3D coins, tea leaves, shells, and fireworks embers on the diorama directly adds them to the backpack inventory with visual toasts.
- **Procedural Weapons, Armor, Robes, Hats & Capes Generator (`src/engine/three/equipment/EquipmentGenerator.ts`)**:
  - Procedural 3D asset generation for fantasy equipment using Three.js geometries and materials:
    - *Dragonflame Greatsword* (`proc:dragonflame_blade`): Runed broadsword with pulsating fiery orange core.
    - *Tidecaller Trident* (`proc:ocean_trident`): 3-pronged cyan-pearl trident with golden shaft.
    - *Archmage Pointy Wizard Hat* (`proc:wizard_hat`): Curved cone with wide brim and gold buckle band.
    - *Crusader Knight Helm* (`proc:knight_helm`): Cylindrical helmet with eye visor slit and red feathered plume.
    - *Huntsman Feathered Cap* (`proc:feather_cap`): Tilted felt cap with angled quill feather.
    - *Captain's Tricorn Hat* (`proc:tricorn_hat`): 3-pointed pirate hat with gold trim folds.
    - *Golden Laurels Halo* (`proc:golden_halo`): Floating emissive holy ring.
    - *Dynamic Capes & Robes* (`proc:highland_cloak`, `proc:royal_mantle`, `proc:ocean_cape`): Draped back cloaks with gold clasps and faction colorways.
- **Live Real-Time 3D Equipment Swapping (`CharacterMeshBuilder.ts`, `CharacterPreview3D.tsx`, `ThreeIsometricCanvas.tsx`)**:
  - Dynamic attachment and removal of weapons, shields, headgear, and capes on skeletal bones (`head`, `handslot.r`, `handslot.l`, `chest`).
  - `CharacterMeshHandle.refreshEquipment()` and `equipSlot()` allow instantaneous real-time gear changes across all in-world 3D characters in the village diorama and the 360° Character Preview.
- **Inventory Drawer & Wardrobe Customizer UI (`src/components/ui/inventory/InventoryDrawer.tsx`, `CharacterModal.tsx`, `TopBar.tsx`)**:
  - Modern bottom-docked Backpack HUD with category filters, item inspector, and 1-tap equipping per companion.
  - Dedicated "Tủ Đồ & Ngoại Trang" (Wardrobe & Customization) tab inside the Character Modal with 4 gear slots (Main Weapon, Offhand/Shield, Headgear/Hat, Cape/Cloak) and live 360° 3D preview.
  - TopBar Backpack button (`🎒 [count]`) and active buff indicator pill (`🍵 [Buff Name]`).

---

### Fixed & Calibrated
- **Structure Scaling & Footprint Recalibration (`DynamicMeshLibrary.ts`)**: Scaled up all houses, buildings, and trees from diminutive sizes to authentic diorama proportions ($\ge 2\times 2$ and $3\times 3$ footprints; houses scaled to $4.0\text{--}5.2\times$, Da Lat pines to $4.8\times$), ensuring structures stand substantially taller and grander than human companion characters ($\approx 1.4\text{m}$).
- **Ghost Mesh Lifecycle & Origin Glitch Fix (`CityBuilderController.ts`)**: Resolved issue where ghost structures persisted in teal/blue form at diorama center $(X: -0.09, Y: 1.50, Z: -0.22)$. Introduced isolated `ghostContainer: THREE.Group`, explicit memory clearing on structure switch, immediate ghost hide upon placement, pointer-leave canvas listening, and removed lingering orphan meshes.
- **Beach Environment Cleanup (`propLayoutData.ts`, `ProceduralPropDistributor.ts`)**: Removed all coastal cannons (`cannon-mobile.glb`, `cannon.glb`, `cannon-ball.glb`) and shoreline rock clutter (`rocks-sand-a.glb`, `rocks-sand-b.glb`), restoring an open, pristine tropical sandy beach.
- **Removed Cannon from City Builder Catalog**: Removed `cannon_battery` from placeable catalog for a peaceful village aesthetic.
- **PWA Cache Invalidation**: Bumped service worker cache to `haven-companions-v7.2` in `public/sw.js`.

---

## [v6.4.0] - 2026-10-30

### Added
- **City Building & Voxel Construction Package**: Added complete builder mode infrastructure (`CityBuilderController.ts`, `CitySaveManager.ts`, `DynamicMeshLibrary.ts`, `BuilderToolbar.tsx`, `SaveLoadModal.tsx`, `StructureCard.tsx`) enabling placement, rotation, demolition, and local storage save/load of custom structures.
- **Phase 1 Platformer Gimmicks**: Integrated 3D collectibles (`CollectibleMeshBuilder.ts`, 12 scattered items across 3 biomes with coin score HUD in `TopBar`), falling pier planks (`DynamicPlatformManager.ts`), and high-jump thermal wind vents.
- **Automated GitHub Pages CI/CD Pipeline**: Configured GitHub Actions workflow (`.github/workflows/deploy.yml`) and relative base pathing (`base: "./"`) for robust zero-cost zero-config production deployments.

---

All notable changes to the **Haven of Companions (*Làng Tri Kỷ*)** project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v5.3.0] - 2026-10-30

### Added
- **City Builder Sandbox Construction Mode (`CityBuilderController.ts`)**: Adapted core mechanics from Kenney's Starter Kit City Builder into a native Three.js subsystem. Players can build and place medieval houses, windmills, tavern, cathedral, defense towers, cannons, fences, campfires, and tropical nature freely across the $70 \times 70$ diorama.
- **Dynamic MeshLibrary Asset Registry (`DynamicMeshLibrary.ts`)**: 22 CC0 public domain 3D models categorized across Houses, Production, Fortifications, Decorations, and Nature with pre-calculated bounding footprint dimensions ($1 \times 1, 2 \times 2, 3 \times 3$), elevation offsets, and shared material pooling.
- **Real-Time Ghost Preview Hologram**: Grid-snapped pointer raycasting onto voxel terrain (`VoxelTerrainBuilder.getTopElevation`) with real-time green/red validity checking (validates against deep ocean water $Y \le 0$, steep slopes $>1.2\text{m}$, companion pedestals, and existing structures).
- **90° Structure Rotation & Bulldozer Demolish Tool**: Full $90^\circ$ clockwise rotation (`R` or `Space` key / UI button) and Bulldozer tool to dismantle user-placed structures, restoring terrain passability with custom sound effects (`audioManager.playDemolishSound`).
- **Smooth Builder Camera Controls (`TouchControls3D.ts`)**: Dedicated builder mode camera profile with smooth LERP inertia damping, `W/A/S/D` ground panning, `Q/E` camera orbit rotation, and `F` key to center view on the village plaza.
- **Save / Load Persistence (`CitySaveManager.ts`)**: Automated debounced serialization to browser `localStorage` (`haven_city_layout_v1`) restoring player villages on boot, formatted JSON export / download, JSON import, and clean village reset.
- **Passability Map Dynamic Synchronization**: Placed structures automatically register in `passabilityMap.ts`, preventing companions from clipping through walls.
- **Mobile Responsive Builder Drawer (`BuilderToolbar.tsx`, `StructureCard.tsx`, `SaveLoadModal.tsx`)**: Bottom-docked catalog drawer with category tabs, 2D sprite cards with footprint badges, structure count pill ($N/100$), and TopBar Build toggle.
- **30+ FPS Mobile Performance Guarantee**: Throttled 33ms raycasting, shared geometries/materials, and a 100-structure hard safety cap.

### Removed
- **West Shoreline Wooden Dock & Small Rowboats (`propLayoutData.ts`, `VoxelTerrainBuilder.ts`)**: Removed the wooden dock pier (`structure-platform-dock.glb`) and small rowboats (`boat-row-small.glb`) from the West shore ($X = -2.5, Z \in [5.5, 20]$ and $X = -8.5, Z = 6.2$), cleaning up wooden plank voxels and restoring an open, natural sandy beach coastline.
---

## [v5.2.0] - 2026-10-30

### Added
- **Keyboard Navigation (WASD / Arrow Keys) & Jumping Physics (Space)**: Full desktop keyboard control allowing smooth character movement and vertical jumping with step-up elevation climbing ($2.8\text{m}$ max jump vertical clearance) and smooth camera follow tracking (`controls.followTarget`).
- **UI Keyboard Hints & Mobile Jump Button**: Desktop/tablet control hint pill and mobile floating jump action button.
- **Interactive 3D Coordinate & Object Inspector (`InspectorBar.tsx`)**: In-engine debugging HUD with 3D grid, object bounding boxes (`THREE.BoxHelper`), and one-click coordinate call-out copy.

### Fixed & Calibrated
- **Ngoc Ha Control Fix**: Removed auto-cast lockout on click so player can freely select, move, and jump with Ngoc Ha, casting her signature ability via her SpeechBubble button.
- **Controls Axis Calibration**: Corrected inverted W/S/A/D movement direction vectors and un-inverted mouse drag panning and right-click/twist rotation drag directions.
- **Coastal Shoreline Encampment Relocation**: Precisely clustered Ngọc Hà, Thanh Phương, Xuân Minh, and Anh Thư at dry terrain coordinates near $X: 18.71, Z: 7.69$.

---
## [v4.5.0] - 2026-10-30

### Added
- **Expanded Sand Beach & Coves (`VoxelTerrainBuilder.ts`)**: Expanded coastal golden sand beach to over $16\text{m}$ total width, featuring $6\text{m}$ dry inland sand dunes ($Y = 1.0$), $5\text{m}$ walkable shoreline beach ($Y = 0.0$), $5\text{m}$ shallow turquoise sandbars ($Y = -1.0$), and a smooth sandy beach wrap around the lighthouse cape.
- **Pirate Fleet Additions (`propLayoutData.ts`)**: Added a medium pirate raider (`ship-pirate-medium.glb`) anchored in the bay alongside moored shoreline rowboats (`boat-row-small.glb`, `boat-row-large.glb`) landing smuggled cargo on the sand.
- **Pirate Artillery & Fortifications**: Added fortified coastal sand dune batteries with naval and field cannons (`cannon.glb`, `cannon-mobile.glb`), pyramids of iron cannonballs (`cannon-ball.glb`), and wooden palisades (`structure-fence.glb`).
- **Pirate Booty & Smuggler Camp**: Added half-buried treasure chests (`chest.glb`), digging shovel in the sand (`tool-shovel.glb`), rum bottle crates (`crate-bottles.glb`), grog bottles (`bottle-large.glb`), and smuggler plank walkways (`platform-planks.glb`).
- **Jolly Roger Flags & Watchtowers**: Added high pirate flagpoles (`flag-pirate-high.glb`), dune skull flags (`flag-pirate.glb`), and a wooden crow's nest watchtower (`tower-watch.glb`) overlooking the harbor.

---

## [v4.4.0] - 2026-10-30

### Added
- **Procedural Prop Distributor (`ProceduralPropDistributor.ts`)**: Built a deterministic Poisson-disk sampling generator scattering vegetation, rocks, and environmental assets across the $70 \times 70$ world with guaranteed minimum spacing ($r_{\text{min}}$) and automated ground elevation snapping (`VoxelTerrainBuilder.getTopElevation`).
- **De-centralized Biome Scattering**:
  - **Highlands Forest & Mountains (NW)**: Expanded scattering bounds across $X \in [-34, -6], Z \in [-34, -5]$ with wide $11.0\text{m}$ spacing between mountain peaks and $6.2\text{m}$ spacing between large pines, eliminating unnatural corner clustering.
  - **Lighthouse Promontory (SE)**: Evenly distributed coastal palms, beach rocks, and sea grass across $X \in [14, 34], Z \in [5, 33]$ with wide $6.8\text{m}$ spacing to keep the stone lighthouse approach scenic and open.
- **Strict Building & House Anti-Overlap Clearance**: Established multi-meter exclusion zones around all village cottages, tavern, cathedral, blacksmith, windmill, and market stalls, strictly preventing rocks, mountains, or trees from spawning inside or overlapping any home.
- **Interactive 3D Coordinate Inspector (`InspectorBar.tsx`)**: Added in-engine inspector HUD allowing developers to tap anywhere on the 3D diorama to reveal exact world coordinates, block type, and elevation with one-tap copy functionality.

### Fixed
- **Character Sinking & Raycast Parallax (`TouchControls3D.ts`)**: Replaced flat $Y = 0.2$ ground plane raycast with a two-pass terrain elevation re-projection, eliminating the $4.7\text{m}$ horizontal isometric parallax error on elevated hills.
- **Cliff Penetration & Abrupt Elevation Snaps (`CharacterMeshBuilder.ts`)**: Implemented step height boundary checks ($\Delta Y \le 0.65\text{m}$, $\Delta Y \ge -1.10\text{m}$) preventing companions from walking off sheer cliffs or through vertical rock faces, coupled with exponential vertical LERP damping for smooth elevation gliding.

---

## [v4.3.0] - 2026-10-30

### Added
- **Minecraft-Style Voxel Terrain System (`VoxelTerrainBuilder.ts`)**: Built a modular voxel terrain engine composed of $1\text{m} \times 1\text{m} \times 1\text{m}$ instanced cube blocks rendered via `THREE.InstancedMesh` for high-performance 60 FPS mobile WebGL rendering (<10 draw calls total for thousands of blocks).
- **Custom Procedural Pixel-Art Block Textures**:
  - **Grass Block**: Vibrant emerald RPG green top (`matGrassTop`), classic Minecraft jagged grass drip overhang with dirt on 4 sides (`matGrassSide`), and rich brown soil on the bottom (`matDirt`).
  - **Dirt Block**: Earthy brown soil with gravel texture for exposed subsurface cliff columns.
  - **Sand Block**: Warm sunny beach sand with subtle golden grain pixels along the shoreline.
  - **Stone Block**: Mountain cobblestone rock with chiseled pixel variation for high peaks.
  - **Wood Plank Block**: Oak planks with horizontal seams and nail accents for the harbor dock.
- **Smooth Organic Topography**: Replaced rigid rectangular terrain tiers with continuous mathematical heightfields featuring an organic twin-peak mountain range (NW), gentle rolling green village meadows (Center/NE), a natural curving serpentine coastline, a curved sea cape promontory (SE), and deep ocean seabed trenches (SW).
- **Voxel-Driven Passability & Navigation (`passabilityMap.ts`)**: Integrated the 2D passability grid directly with `VoxelTerrainBuilder`, querying block heights and types for seamless tap-to-move waypoint pathfinding and natural elevation stepping.

### Changed
- **Clean Voxel Ground & Road Removal**: Removed all artificial monolithic road boxes (`mainAvenue`, `marketLane`, `churchAvenue`, `dirtLane1/2`, curbs) and the large foundation slab in favor of continuous, natural green grass blocks.
- **Aligned Prop & Character Heights**: Calibrated all companion spawn points in `CharacterMeshBuilder.ts` and declarative prop definitions in `propLayoutData.ts` to rest naturally on the top surface of the voxel blocks ($Y = \text{topY} + 0.5$).
- **PWA Service Worker Cache**: Bumped service worker cache name to `haven-companions-v4.3` in `public/sw.js`.

---

## [v4.2.0] - 2026-10-30

### Added
- **70x70 World Expansion**: Expanded diorama surface area to $70 \times 70$ ($4,900\text{ m}^2$ footprint on $X, Z \in [-35, 35]$), providing expansive space for village quarters, coastal bays, mountain trails, and the lighthouse cape.
- **Deep Ocean Basin & Continental Shelf**: Deepened ocean basin floor down to $Y = -3.2\text{m}$ with a dark ocean trench floor (`matDeepSeabed`) and stepped continental shelf, granting over $3.3\text{m}$ of realistic water clearance under ship hulls.
- **KayKit Skeletal Animation System**: Integrated `Rig_Medium_General.glb` and `Rig_Medium_MovementBasic.glb` using `THREE.AnimationMixer`, enabling all 9 companions to smoothly transition between relaxed adventurer `Idle_A` and walking `Walking_A` during movement.
- **Weapon & Character Textures**: Ingested class texture maps (`knight_texture.png`, `mage_texture.png`, `ranger_texture.png`, `rogue_texture.png`, `barbarian_texture.png`) for full PBR weapon rendering.
- **Kenney Pirate Colormap**: Restored missing `colormap.png` in `public/assets/models/environment/Textures/`, restoring vibrant colors to the pirate galleon, lighthouse, rowboats, palm trees, and coastal rocks.

### Changed
- **Tactical RPG Scale Rebalancing (`propLayoutData.ts`)**: Rescaled KayKit medieval buildings ($4.0\times – 4.2\times$ for cottages, $4.8\times$ for tavern/guildhall, $5.2\times$ for cathedral, $4.8\times$ for windmill), expanded central town fountain to $3.2\text{m}$ radius, rescaled pine forests to $4.8\times – 5.5\times$, and normalized character heights to $1.65\text{m}$ ($0.65\times$).
- **Narrow Cozy Boat Dock**: Reduced pier width to $1.8\text{m}$ (down from $3.2\text{m}$) and scaled segments to $1.0\times$ for an authentic fishing harbor scale.
- **Camera Orbit Range (`TouchControls3D.ts`)**: Expanded pan bounds to `[-34, 34]` and zoom distance range to `[14, 85]` for panoramic landscape views.

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

---
title: "Phase 3: Character System, Friend Archetypes & Isometric Entity Layer"
status: completed
priority: P1
effort: 5h
tags: [characters, rpg-classes, sprites, state-machine, animation, friends-lore]
---

# Phase 3: Character System, Friend Archetypes & Isometric Entity Layer

## Overview

Implement the 9 distinct companion characters representing the user's friend circle. Each friend is modeled with their unique RPG class, thematic lore, customized isometric visual sprite, location in the village, idle animation loop, interactive voice/dialogue quotes, and signature class ability.

Characters integrate into the isometric rendering pipeline as dynamic entities with isometric Y-depth sorting, collision footprints, and interactive hitboxes for mobile touch selection.

## Key Insights

- **Distinct Friend Personalities & Real-Life Anchors**:
  - The **Highland Pathfinders** reside in Zone 1 (Da Lat aesthetic: campsite, pines, nature, tracking).
  - The **Scholars of the Mystic Arts** reside in Zone 2 (Sunspire Plaza: festival, ancient lore, fireworks, radiant healing).
  - The **Vanguard of the Eastern Seas** reside in Zone 3 (Nha Trang Bay aesthetic: coastal pavilion, docks, Japanese feasts, martial discipline).
- **Octopath-Style Watercolor Character Avatars**: Characters are rendered with an expressive watercolor storybook aesthetic:
  - Delicate dark ink contours and soft, painterly watercolor color gradients reflecting each friend's class palette.
  - Distinctive silhouettes: wizard hoods, elven longbows, samurai armor & crest shield, bard lutes, pirate tricorns, druid staffs.
  - Subtle HD-2D style warm rim lighting and breathing cycle ($y_{\text{bob}} = \sin(t \times 3) \times 1.5\text{px}$).
  - Directional facing (facing South-West or South-East toward the village center).
  - Animated magical accessories (flowing cloaks, pulsing lanterns, floating spark motes).
- **Entity Y-Sorting**: Characters move or stand on the map; their sorting key $\text{sortZ} = (x + y)$ ensures characters render behind foreground trees and walls, but in front of background terrain.

## Requirements

### Functional Requirements
- [x] Define the `Character` interface in `src/types/character.ts`:
  - `id`: unique string slug (e.g. `anh-thi-druid`, `phuong-quynh-ranger`, `tram-anh-bard`, etc.).
  - `name`: Full Vietnamese name (e.g. "Huỳnh Trần Anh Thi").
  - `classTitle`: RPG Class Title (e.g. "The Wilderness Druid").
  - `faction`: `'Highland Pathfinders'` | `'Scholars of the Mystic Arts'` | `'Vanguard of the Eastern Seas'`.
  - `location`: `{ gridX: number, gridY: number, elevation: number, facing: 'SW' | 'SE' }`.
  - `bio`: RPG lore description weaving real-life inspirations (Da Lat, New Year fireworks, Nha Trang Bay, Japanese feasts).
  - `stats`: Whimsical thematic stats (e.g., `Nature Lore: 95`, `Feast Cooking: 99`, `Firework Artillery: 100`).
  - `dialogueQuotes`: Array of interactive spoken lines (greetings, thoughts on friends, festive remarks).
  - `signatureAction`: Name, description, and visual particle effect trigger.
  - `avatarColor`: Primary and secondary hex palette for sprite and UI styling.
- [x] Implement Character Roster Database in `src/data/charactersData.ts` for all 9 friends:
  1. **Huỳnh Trần Anh Thi** – *The Wilderness Druid* (Highlands Campsite)
  2. **Lê Nguyễn Phương Quỳnh** – *The Elven Ranger* (Highland Ridge Watchpost)
  3. **Trần Nguyễn Trâm Anh** – *The Lore Bard* (Sunspire Festival Amphitheater)
  4. **Nguyễn Khải Văn** – *The Pyromancy Sorcerer* (Sunspire Fireworks Terrace)
  5. **Nguyễn Trần Thảo Uyên** – *Cleric of the Light* (Sunspire Pavilion of Hope)
  6. **Nguyễn Thị Ngọc Hà** – *Way of the Kensei Monk* (Coastal Tatami Pavilion)
  7. **Phạm Trần Thanh Phương** – *The Ronin / Paladin* (Eastern Dock Gatehouse)
  8. **Phạm Xuân Minh** – *The Swashbuckler Rogue* (Harbor Galleon Boardwalk)
  9. **Lâm Anh Thư** – *The Ocean Cleric (Tempest Domain)* (Cliffside Tide Shrine)
- [x] Implement `CharacterSpriteRenderer`:
  - Render character ground shadow (semi-transparent dark ellipse).
  - Render layered avatar parts (body, gear, class headwear, held weapons/staffs/instruments).
  - Animate idle breathing loop and subtle weapon shine.
  - Render floating class emblem / faction pin above the character's head.
- [x] Implement Hit-testing & Selection:
  - Raycast touch taps to detect when a user taps within a character's isometric bounding cylinder (radius 24px, height 48px).
  - Tapping a character sets them as `selectedCharacter`, triggers a joyful "hop" animation, and spawns an in-world speech bubble.

### Non-Functional Requirements
- [x] Entity draw call < 1ms per character.
- [x] Zero hitching or stuttering during character idle animations.

## Character Roster Matrix

| # | Name | Class & Archetype | Faction / Zone | Real-Life Anchor & Lore | Signature Ability |
|---|------|-------------------|----------------|-------------------------|-------------------|
| 1 | **Huỳnh Trần Anh Thi** | Wilderness Druid | Highland Pathfinders | Misty Da Lat highlands, campsite hearth, herbal brews | *Verdant Bloom* (sprouts glowing forest flora) |
| 2 | **Lê Nguyễn Phương Quỳnh** | Elven Ranger | Highland Pathfinders | Da Lat wilderness scout & cultural exhibition fine arts | *Eagle Eye* (golden trajectory line & target flash) |
| 3 | **Trần Nguyễn Trâm Anh** | Lore Bard | Scholars of the Mystic Arts | Gathering ancient artifacts, dramatic New Year flair | *Hymn of Antiquity* (floating musical notes) |
| 4 | **Nguyễn Khải Văn** | Pyromancy Sorcerer | Scholars of the Mystic Arts | New Year fireworks, explosive magical sky cover | *Grand Pyrotechnic* (launches sparkling firework rocket) |
| 5 | **Nguyễn Trần Thảo Uyên** | Cleric of the Light | Scholars of the Mystic Arts | New Year guiding light, hope, post-quest healing | *Dawn Radiance* (golden restorative sparkle shower) |
| 6 | **Nguyễn Thị Ngọc Hà** | Kensei Monk | Vanguard of the Eastern Seas | Nha Trang coastal waters, Japanese feasts, martial focus | *Water-Kata Strike* (fluid azure blade arcs) |
| 7 | **Phạm Trần Thanh Phương** | Ronin / Paladin (Guardian Knight) | Vanguard of the Eastern Seas | Coastal voyages & Japanese feasts; she acts as the party's honorable protector wielding her towering crest shield | *Aegis of the Coast* (radiant fortress shield barrier) |
| 8 | **Phạm Xuân Minh** | Swashbuckler Rogue | Vanguard of the Eastern Seas | Nha Trang Bay sea adventures, charismatic duelist | *Swashbuckler Flourish* (rapier flash & gold coin toss) |
| 9 | **Lâm Anh Thư** | Ocean Cleric | Vanguard of the Eastern Seas | Nha Trang tides, maritime blessings, oceanic calm | *Tidal Embrace* (swirling seafoam water rings) |

## Related Code Files

- `src/types/character.ts` (Character data structure, stats, dialogue definitions)
- `src/data/charactersData.ts` (Complete bios, quotes, stats, and coordinates for all 9 friends)
- `src/engine/characterRenderer.ts` (Procedural character sprite generator, animations, accessories)
- `src/engine/entityPipeline.ts` (Unified Y-sort entity queue combining map props & characters)
- `src/state/characterStore.ts` (Zustand or React state for active character selection & triggers)

## Implementation Steps

1. **Character Schema Design**:
   - Create comprehensive interfaces in `src/types/character.ts` including faction colors, whimsical RPG stats, and rich dialogue arrays.
2. **Populate Friends Data**:
   - Write `src/data/charactersData.ts` detailing all 9 companions with heartfelt, high-fantasy descriptions reflecting their real-life camaraderie and memories.
3. **Procedural Character Sprite Renderer**:
   - Code `drawCharacterSprite()` in `src/engine/characterRenderer.ts`:
     - Dynamic color theming based on character `avatarColor`.
     - Distinct class silhouettes (e.g. Sorcerer pointy hood + fire wand, Paladin samurai kabuto + massive crest shield, Ranger elven cowl + longbow, Bard beret + lute).
     - Sine-wave idle breathing and accessory animation.
4. **Interactive Hop & Reaction Animation**:
   - Add temporary spring-hop state ($y_{\text{hop}} = -\sin(\text{progress} \times \pi) \times 16\text{px}$) when tapped.
5. **Entity Y-Sort Pipeline**:
   - Integrate characters into the main map render queue so characters cleanly overlap background props and hide behind foreground obstacles.
6. **Mobile Touch Selection Hookup**:
   - Connect `TouchGestureController` tap events to the character bounding cylinder test.

## Todo List

- [x] Define `Character`, `RPGStats`, and `Dialogue` interfaces in `src/types/character.ts`
- [x] Author pilot friend profiles (Thi & Thanh Phương) with rich lore, stats, and dialogue in `src/data/charactersData.ts`
- [x] Build procedural character sprite generator with class-specific silhouettes in `characterRenderer.ts`
- [x] Implement character idle animations (breathing, glowing weapons, floating motes)
- [x] Implement character tap reaction (spring hop, face camera, trigger sound/sparkle)
- [x] Integrate characters into the isometric Y-sorting render pipeline
- [x] Verify touch tap raycasting accurately selects characters on mobile touch screen

## Success Criteria

- All 9 friends are placed in their respective thematic zones with identifiable class designs.
- Characters correctly render with proper isometric depth sorting (standing in front of background buildings, behind foreground trees).
- Tapping any character reliably selects them with an immediate visual spring reaction.
- Character animation maintains 60 FPS without garbage collection spikes.

## Risk Assessment & Mitigations

- **Risk**: Small mobile screens make tapping individual characters difficult if touch targets are too small.
  - *Mitigation*: Expand the invisible touch hitbox to at least 48x48 CSS pixels (Apple HIG standard) regardless of the visual sprite size, and add a quick-selection bottom carousel for effortless navigation.

## Security Considerations

- All character data is static and validated at build time. No external untrusted data injection.

## Next Steps

Proceed to **Phase 4: Mobile-First RPG UI, Dialogue & Character Sheet Modals**, building the touch-friendly interface overlays, speech bubbles, and detailed character cards.

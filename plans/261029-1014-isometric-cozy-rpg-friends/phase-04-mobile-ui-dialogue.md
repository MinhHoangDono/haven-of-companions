---
title: "Phase 4: Mobile-First RPG UI, Dialogue System & Character Sheet Modals"
status: completed
priority: P1
effort: 4.5h
tags: [ui, mobile-ux, bottom-sheet, dialogue, modal, tailwind]
---

# Phase 4: Mobile-First RPG UI, Dialogue System & Character Sheet Modals

## Overview

Build the mobile-first touch UI and narrative interaction layer. Mobile users interact with the cozy village through an ergonomic thumb-zone interface: an in-world speech bubble system, a horizontal quick-navigation character dock at the bottom of the screen, and an expandable bottom-sheet RPG Character Card showcasing stats, bios, real-life memory lore, and interactive quotes.

## Key Insights

- **The Thumb Zone Principle**: On smartphones, 75% of user interactions occur in the bottom third of the screen. Placing primary navigation (character jump dock, interaction buttons, sheet triggers) at the bottom ensures comfortable one-handed operation.
- **In-World vs. Overlay UI**:
  - In-world speech bubbles float directly above character sprites in canvas world space, creating an immersive RPG feel.
  - In-depth details (stats, long lore, memory easter eggs) belong in a sleek, swipeable bottom sheet that does not obscure the entire village map.
- **Haptic & Visual Feedback**: Mobile browsers supporting `navigator.vibrate` give subtle physical taps (10ms) on character selection and button presses, reinforcing physical interaction.

## Requirements

### Functional Requirements
- [x] Implement Top Status Bar:
  - Village name header: *"Haven of Companions"* (*Làng Tri Kỷ*).
  - Time-of-Day pill (Dawn, Day, Sunset, Night).
  - Ambient Weather pill (Clear, Highland Mist, Golden Hour, Fireworks Night).
  - Audio toggle button (Mute / Unmute with animated soundwave indicator).
- [x] Implement Bottom Character Quick-Dock (Thumb Zone):
  - Horizontally scrollable carousel containing all 9 companion avatars.
  - Grouped and color-coded by Faction:
    - 🌲 *Highland Pathfinders* (Emerald green badge: Thi, Quỳnh)
    - 🔮 *Scholars of the Mystic Arts* (Amethyst purple badge: Trâm Anh, Khải Văn, Thảo Uyên)
    - 🌊 *Vanguard of the Eastern Seas* (Ocean azure badge: Ngọc Hà, Thanh Phương, Xuân Minh, Anh Thư)
  - Tapping an avatar smoothly pans and centers the isometric camera onto that character's exact coordinates.
  - Active character highlighted with a glowing golden border.
- [x] Implement In-World Speech Bubble:
  - Projected onto the screen above the selected character:
    $$x_{\text{bubble}} = x_{\text{screen}}, \quad y_{\text{bubble}} = y_{\text{screen}} - 65\text{px}$$
  - Retro parchment aesthetic with typewriter text animation.
  - Tapping advances to the next spoken dialogue quote.
- [x] Implement Expandable RPG Character Sheet Modal (Bottom Drawer):
  - Fluid slide-up animation from the bottom of the screen.
  - Header: Character portrait, full name, class title, and faction crest.
  - Whimsical RPG Stat Bars (e.g. Foraging & Stew Cooking: 98, Firework Artistry: 100, High-Seas Daring: 96).
  - "The Chronicler's Lore" tab: Heartfelt background story detailing the real-world adventures (Da Lat camping, New Year fireworks, Nha Trang feasts).
  - Action buttons:
    - **"Cast Signature Ability"**: Triggers visual particle spectacle on the map.
    - **"Share a Toast" / "Celebrate"**: Triggers an interactive friendship cheer.
    - **"Close" / Swipe Down**: Smoothly dismisses modal back to map view.
- [x] Implement Mobile Touch Ergonomics:
  - All interactive buttons sized $\ge 48\times 48\text{px}$.
  - Support `pb-safe` (`env(safe-area-inset-bottom)`) for iPhone home bars.
  - Haptic feedback via `navigator.vibrate(10)` on supported devices.

### Non-Functional Requirements
- [x] Modal opening/closing runs at 60 FPS using GPU-accelerated CSS transforms (`transform: translateY`).
- [x] Accessible color contrast meeting WCAG AA standards against parchment backgrounds.

## Mobile Screen Layout Diagram

```
┌───────────────────────────────────────────────┐
│ [≡ Haven of Companions]   [🌙 Night] [🔊 Mute] │ Top Status Bar (Safe Area)
├───────────────────────────────────────────────┤
│                                               │
│                                               │
│            [💬 "The campfire is ready!"]       │ In-World Speech Bubble
│                  (Character)                  │
│                                               │
│                                               │
│                                               │
├───────────────────────────────────────────────┤
│  [🌲 Thi] [🌲 Quỳnh] [🔮 Văn] [🌊 Hà] [···]   │ Bottom Character Carousel
├───────────────────────────────────────────────┤
│         [ ⚔️ PARTY REUNION FEAST ⚔️ ]         │ One-Handed Action Dock
└───────────────────────────────────────────────┘
```

## Related Code Files

- `src/components/ui/TopBar.tsx` (Title, time/weather selector, audio toggle)
- `src/components/ui/CharacterCarousel.tsx` (Bottom thumb-dock with 9 companion avatars)
- `src/components/ui/SpeechBubble.tsx` (In-world floating dialogue bubble with typewriter effect)
- `src/components/ui/CharacterModal.tsx` (Bottom-sheet drawer with stats, lore, and action buttons)
- `src/components/ui/PartyReunionButton.tsx` (Interactive global celebration trigger)
- `src/utils/haptics.ts` (Mobile vibration helper with graceful fallback)

## Implementation Steps

1. **Top Bar Component**:
   - Build responsive header with Tailwind CSS, integrating time/weather badges and mute controls.
2. **Bottom Character Carousel**:
   - Implement horizontal scroll container with snap-scrolling (`snap-x snap-mandatory`).
   - Wire avatar click events to `camera.panTo(character.gridX, character.gridY, duration: 600)`.
3. **In-World Speech Bubble**:
   - Calculate screen projection in sync with the canvas render loop.
   - Render bubble with tailored tail pointing down to the character's head.
   - Include typewriter effect with sound tick.
4. **Bottom-Sheet Character Modal**:
   - Implement touch swipe-down gesture to dismiss.
   - Display animated stat progress bars with glowing colors.
   - Render "Chronicle of Adventures" section featuring real-life friend connections.
5. **Party Reunion Button**:
   - Place prominent golden celebratory button in bottom dock.
6. **Mobile Ergonomics Sweep**:
   - Verify touch targets and safe area insets on mobile viewport.

## Todo List

- [x] Build `TopBar` component with time, weather, and sound toggles
- [x] Build `CharacterCarousel` with faction filters and camera auto-pan
- [x] Build `SpeechBubble` component with screen tracking and typewriter text
- [x] Build `CharacterModal` bottom sheet with stats, lore, and action triggers
- [x] Build `PartyReunionButton` with festive visual styling
- [x] Implement mobile haptics in `src/utils/haptics.ts`
- [x] Test thumb reachability and gesture ergonomics on mobile simulator

## Success Criteria

- Tapping any character in the carousel immediately pans the camera and opens their dialogue.
- Character sheet modal opens smoothly without hitching the canvas render loop.
- One-handed navigation on a mobile phone allows accessing all 9 friends and interactions effortlessly.
- Bottom safe area padding prevents interference with iOS home swipe indicator.

## Risk Assessment & Mitigations

- **Risk**: Camera panning during dialogue opening might cause speech bubble jitter.
  - *Mitigation*: Interpolate speech bubble screen position directly from the camera's current interpolated frame coordinate, ensuring 100% lock-step synchronization.

## Security Considerations

- Modal content is purely internal React state. No dynamic HTML evaluation.

## Next Steps

Proceed to **Phase 5: Cozy Atmosphere, Dynamic Lighting, Particle Systems & Audio**, adding day/night ambiance, Da Lat highland fog, New Year fireworks, and cozy soundscapes.

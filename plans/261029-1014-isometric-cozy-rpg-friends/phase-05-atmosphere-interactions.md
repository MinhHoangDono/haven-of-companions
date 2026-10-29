---
title: "Phase 5: Cozy Atmosphere, Dynamic Lighting, Particle Systems & Audio"
status: completed
priority: P1
effort: 5h
tags: [atmosphere, lighting, particles, fireworks, audio, web-audio, interactions]
---

# Phase 5: Cozy Atmosphere, Dynamic Lighting, Particle Systems & Audio

## Overview

Infuse the isometric village with life, cozy emotional warmth, and spectacle. This phase adds dynamic ambient lighting (Dawn, Golden Hour, Twilight, and Night), localized particle systems (Da Lat highland mist, campfire embers, New Year fireworks, and ocean spray), an interactive celebration system, and a gentle acoustic lofi fantasy soundscape.

## Key Insights

- **Canvas 2D Color Blending for Day/Night**: Rather than redrawing every tile with different textures, the engine applies an atmospheric overlay using Canvas 2D composition (`ctx.globalCompositeOperation = 'multiply'` or `'source-over'` with tinted translucent colors):
  - *Day*: Clear sunlight with subtle warmth (`rgba(255, 245, 220, 0.08)`).
  - *Golden Hour*: Amber sunset warmth (`rgba(255, 160, 50, 0.22)`).
  - *Night*: Deep indigo blue (`rgba(15, 20, 50, 0.58)`).
  - *Lanterns & Fires*: Point lights drawn with radial gradients (`ctx.globalCompositeOperation = 'screen'`), creating glowing warm halos around street lanterns and campfires at night.
- **Lightweight Particle Engine**: A unified particle array with pooled object recycling ensures zero GC pauses. Particles support gravity, wind drift, fade out, and color transitions.
- **Mobile Audio Autoplay Compliance**: Modern mobile browsers block audio playback until the first user interaction. Audio initializes silently on the first tap, respecting the user's sound preferences.

## Requirements

### Functional Requirements
- [x] Implement `LightingEngine`:
  - Support 4 ambient states: `Day`, `GoldenHour`, `Night`, `MistyDawn`.
  - Point Light sources:
    - Campsite Hearth & Cauldron (warm orange glow, subtle flicker: radius $80\text{px} \pm 5\text{px}$).
    - Sunspire Lantern Posts (golden amber glow, radius $60\text{px}$).
    - Coastal Tatami Tea Lanterns (soft paper lantern glow, radius $50\text{px}$).
    - Tide Shrine Pearl (soft bioluminescent teal glow, radius $45\text{px}$).
- [x] Implement `ParticleSystem`:
  - **Highland Mist (Zone 1)**: Translucent white/cyan cloud sprites drifting slowly eastward across the pine hills ($v_x = 0.3\text{px/frame}$, alpha $0.15$).
  - **Campfire Embers (Zone 1)**: Small glowing orange spark motes floating upward with chaotic sine wobble.
  - **New Year Fireworks (Zone 2)**:
    - Rocket trail shooting upward into the night sky.
    - Radial explosive burst into 40–80 glittering spark particles (gold, ruby red, emerald, sapphire) with gravity decay and sparkle twinkle.
  - **Coastal Ocean Surf & Mist (Zone 3)**: Gentle white sea foam particles lapping against wooden dock pilings.
  - **Ambient Blossom / Leaf Drift**: Floating golden leaves drifting across the village breeze.
- [x] Implement Micro-Interactions & Easter Eggs:
  - **"Grand Fireworks Show"**: Tapping Khải Văn or the fireworks terrace launches a multi-shot fireworks volley illuminating the entire night canvas!
  - **"Highland Stew Tasting"**: Tapping Thi’s campfire cauldron stirs the pot, releases steam clouds, and spawns heart/leaf icons.
  - **"Martial Water Slash"**: Tapping Ngọc Hà triggers an elegant sweeping blue crescent arc with water splash sound.
  - **"Party Reunion Feast" Button**:
    - All 9 friends pathfind/gather at the central plaza banquet table.
    - Confetti, fireworks, and a unified celebratory toast dialogue popup celebrating the friend group!
- [x] Implement `AudioManager`:
  - Web Audio API / Howler integration with smooth volume fading.
  - Background Music: Curated warm acoustic guitar, lute, and lofi medieval fantasy MP3 loops with soft atmospheric warmth and high-fidelity nature ambiance (recorded Da Lat pine wind, gentle plaza tavern hum, and rhythmic Nha Trang coastal surf).
  - Biome-Specific Ambient Layers:
    - Highlands: Soft wind breeze & mountain songbirds.
    - Plaza: Gentle festival acoustic strumming & distant crowd laughter.
    - Coast: Rhythmic ocean waves & distant harbor bells.
  - Sound Effects:
    - `sfx_firework`: Crisp launch whistle followed by resonant boom.
    - `sfx_campfire`: Warm crackle sound.
    - `sfx_bell`: Resonant tide shrine chime.
    - `sfx_sword`: Swift martial woosh.
    - `sfx_cheer`: Festive group clinking glasses / cheer.
  - Persistent user mute toggle saved in `localStorage`.

### Non-Functional Requirements
- [x] Particle pool capped at 250 active particles to ensure stable 60 FPS on mobile chips.
- [x] Audio assets compressed via WebM/Opus and MP3 under 1.5MB total size.

## Lighting & Particle Pipeline Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Render Base Map (Terrain, Water, Elevation Walls)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. Render Y-Sorted Entities (Buildings, Props, Characters)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. Ambient Lighting Pass (Day/Sunset/Night Tint Overlay)    │
│    - Blend Mode: 'multiply' with ambient sky color          │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 4. Point Light Radial Gradients (Lanterns, Fires, Spells)   │
│    - Blend Mode: 'screen' (cuts through darkness)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 5. Particle Effects Pass (Mist, Embers, Fireworks, Foam)    │
│    - Blend Mode: 'source-over' and 'lighter'                │
└─────────────────────────────────────────────────────────────┘
```

## Related Code Files

- `src/engine/lighting.ts` (Ambient overlay, point lights, radial gradient masks)
- `src/engine/particles.ts` (Particle emitter, object pool, physics update, render pass)
- `src/audio/audioManager.ts` (Web Audio API context, procedural synthesizers, volume master)
- `src/audio/soundBank.ts` (Sound effect triggers and synth presets)
- `src/components/effects/FireworksShow.ts` (Automated firework sequence orchestrator)
- `src/components/effects/PartyReunion.ts` (Global gathering sequence for all 9 characters)

## Implementation Steps

1. **Ambient Lighting Shader / Canvas Pass**:
   - Write `renderLightingPass(ctx, timeOfDay, pointLights)` in `src/engine/lighting.ts`.
   - Add pulsating flicker to campfire and lanterns.
2. **Particle Engine Implementation**:
   - Create pre-allocated pool of 300 `Particle` objects.
   - Code update loop handling position, velocity, drag, gravity, life, and color alpha.
   - Add fireworks burst generator with vibrant color variations.
3. **Sound System Setup**:
   - Build `src/audio/audioManager.ts` with mobile touch unlock listener.
   - Implement lightweight Web Audio synthesizer for ambient wind, wave noise, bell tones, and firework pops (allowing zero-asset audio fallback!).
4. **Interactive Celebration Modes**:
   - Implement the "Grand Fireworks" trigger for Khải Văn and Thảo Uyên.
   - Wire the "Party Reunion" button to assemble the companions around the central banquet table with festive fireworks.
5. **Weather & Atmosphere Controls**:
   - Connect top bar weather toggle to switch ambient lighting and trigger Highland Mist or Starlight Fireworks modes.

## Todo List

- [x] Implement `LightingEngine` with 4 time-of-day modes and flickering point lights
- [x] Build high-performance `ParticleSystem` with object pooling in `particles.ts`
- [x] Implement Da Lat Highland mist and campfire ember emitters
- [x] Implement multi-colored explosive New Year fireworks generator
- [x] Implement coastal water surf and dock splash particles
- [x] Build `AudioManager` with mobile touch unlock and ambient audio loops
- [x] Implement synthesized sound effects for fireworks, bell, campfire, and sword
- [x] Wire the "Party Reunion" celebratory event gathering all 9 friends
- [x] Test performance on mobile with active fireworks and lighting overlays

## Success Criteria

- Switching to "Night" transforms the village into an atmospheric wonderland with glowing lanterns and crackling campfires.
- Triggering fireworks creates an explosive visual and auditory spectacle with no frame drops.
- Da Lat mist conveys the authentic cool highland ambiance of Zone 1.
- Audio starts seamlessly upon user interaction and mutes/unmutes reliably.

## Risk Assessment & Mitigations

- **Risk**: Excessive canvas compositing operations (`multiply`, `screen`) can cause fillrate slowdowns on high-resolution mobile screens.
  - *Mitigation*: Draw the lighting overlay on a downscaled off-screen canvas ($0.5\times$ resolution) and stretch it over the main canvas with linear interpolation, creating softer, more natural light diffusion while boosting performance by 400%.

## Security Considerations

- Audio context handles local synthesis and trusted static audio assets only.

## Next Steps

Proceed to **Phase 6: Performance Optimization, PWA Offline Support, QA & Deployment**, ensuring flawless operation across diverse mobile devices.

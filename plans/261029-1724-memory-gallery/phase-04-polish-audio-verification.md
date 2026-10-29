---
title: "Phase 4: Atmospheric Audio, PWA Caching & Production Verification"
status: todo
priority: P1
effort: 1.0h
tags: [audio, pwa, performance, deploy, verification]
---

# Phase 4: Atmospheric Audio, PWA Caching & Production Verification

## Overview

Add atmospheric audio chimes when opening memories, configure PWA service worker caching for instant photo loading, verify 60 FPS mobile rendering, and perform production deployment to Netlify.

## Requirements

- [ ] Synthesize a warm, nostalgic music box / acoustic memory chime in `audioManager.ts` (`playMemoryChime()`).
- [ ] Configure Service Worker (`public/sw.js`) to cache memory image assets and fallback placeholders.
- [ ] Verify zero WebGL memory leaks when opening and closing the memory modal multiple times.
- [ ] Ensure full mobile responsiveness on iOS Safari and Android Chrome viewports.
- [ ] Run production `npm run build` with zero TypeScript or Vite errors.
- [ ] Deploy to Netlify and verify HTTP 200 OK status on live URL.

## Implementation Steps

1. **Synthesized Nostalgic Audio in `src/audio/audioManager.ts`**:
   - Create `playMemoryChime()`:
     - Uses Web Audio API oscillator pentatonic arpeggio (E5 $\rightarrow$ G#5 $\rightarrow$ B5 $\rightarrow$ E6).
     - Sine wave with gentle exponential decay and lowpass filter for an ethereal, nostalgic music-box timbre.
     - Respects global mute state (`isMuted`).
2. **PWA Service Worker Update (`public/sw.js`)**:
   - Bump cache version to `haven-companions-v3.6`.
   - Add image caching rule with cache-first strategy for Google Drive CDN thumbnails and memory placeholders.
3. **Performance & Memory Leak Audit**:
   - Verify Three.js texture disposal when memory modal unmounts.
   - Confirm adaptive RAF loop correctly pauses idle rendering while memory modal is full-screen.
4. **End-to-End Smoke Verification**:
   - Verify tapping Highlands Crystal opens Đà Lạt memories.
   - Verify tapping Sunspire Crystal opens New Year / Cultural memories.
   - Verify tapping Coastal Crystal opens Nha Trang Bay cruise memories.
   - Verify tapping "Xem Kỷ Niệm" on character modal opens that companion's memories.
5. **Production Build & Live Deployment**:
   - Execute `npm run build`.
   - Deploy using `npx netlify deploy --prod --dir=dist`.
   - Verify live site via `curl -I https://boisterous-raindrop-4dc674.netlify.app`.

## Todo

- [ ] Add `playMemoryChime` in `src/audio/audioManager.ts`
- [ ] Bump Service Worker cache version in `public/sw.js`
- [ ] Audit WebGL and DOM memory lifecycle on modal dismiss
- [ ] Verify mobile touch navigation across all 3 regional albums
- [ ] Run production build and deploy to Netlify
- [ ] Update `docs/project-progress.md` and `CHANGELOG.md`

## Success Criteria

- Nostalgic chime plays cleanly on memory modal open.
- Photos load instantaneously on repeat visits via service worker cache.
- Full production build succeeds with zero errors.
- Live URL verified with HTTP 200 OK.

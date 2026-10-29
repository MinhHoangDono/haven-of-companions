---
title: "Phase 3: Interactive Mobile Memory Gallery & Lightbox Modal"
status: todo
priority: P1
effort: 2.0h
tags: [ui, react, touch-gestures, mobile, modal, tailwind]
---

# Phase 3: Interactive Mobile Memory Gallery & Lightbox Modal

## Overview

Build the touch-first **Memory Gallery Modal (`MemoryModal.tsx`)** that opens when tapping an in-world Memory Crystal or when selecting "Xem Kỷ Niệm" from a companion's sheet. The modal features responsive adaptation (full screen on phones, centered on desktop), swipe gesture navigation, full-resolution image lightbox, thumbnail carousel, and companion tagging.

## Requirements

- [ ] Build `src/components/ui/MemoryModal.tsx` following responsive modal conventions:
  - Mobile phone: Full screen (`h-full w-full rounded-none pt-safe pb-safe`).
  - Desktop / tablet: Centered modal card (`sm:items-center sm:justify-center p-4`, `sm:max-w-2xl sm:rounded-3xl sm:max-h-[90vh]`).
- [ ] 1-finger horizontal touch swipe gesture for moving between photos on mobile phones.
- [ ] Thumbnail navigation strip below the active photo for instant jumps.
- [ ] Display rich memory metadata:
  - Terrace location badge (e.g. "Cao Nguyên Đà Lạt", "Quảng Trường Sunspire", "Vịnh Biển Nha Trang").
  - Date stamp and trip location.
  - Nostalgic trip diary entry / caption quote.
  - Tagged companion chips (showing avatar, name, and class).
- [ ] Full-screen image lightbox overlay on double-tap or expand button.
- [ ] Integrate "Xem Kỷ Niệm" button in `CharacterModal.tsx` to jump directly into memories tagged with that friend.

## Implementation Steps

1. **Modal Layout & Responsive Architecture**:
   - Fixed backdrop with blur (`bg-black/80 backdrop-blur-md`).
   - Sticky header: Album title, terrace badge, close button (`X`).
   - Center viewport: High-resolution photo display with smooth fade/slide transition, aspect-ratio constraint, and image loading spinner/skeleton.
   - Bottom panel: Captions, date, tagged friends chips, and thumbnail strip.
2. **Touch Swipe Gesture Handling**:
   - Track `touchStartX`, `touchEndX` on image viewport.
   - Threshold $\Delta x > 40\text{px}$ triggers previous/next slide with haptic vibration feedback (`navigator.vibrate(12)`).
   - Desktop arrow keys (`ArrowLeft`, `ArrowRight`, `Escape`) support.
3. **Companion Filter & Cross-Linking**:
   - `activeFriendFilter: string | null` state.
   - When opened from `CharacterModal`: filter album to photos containing that companion.
   - Tapping any tagged companion chip filters the photo collection to mutual adventures.
4. **Wire into `App.tsx`**:
   - State: `activeMemoryLocation: MemoryLocation | null`.
   - Renders `<MemoryModal location={activeMemoryLocation} onClose={() => setActiveMemoryLocation(null)} />`.

## Todo

- [ ] Create `src/components/ui/MemoryModal.tsx` with responsive mobile/desktop layout
- [ ] Implement touch swipe navigation and keyboard arrow handlers
- [ ] Build thumbnail rail with active indicator glow
- [ ] Add companion chips with avatar and faction colors
- [ ] Add "Xem Kỷ Niệm" trigger in `CharacterModal.tsx`
- [ ] Connect `App.tsx` crystal tap callback to open `MemoryModal`

## Success Criteria

- Modal displays in full screen on phone viewports and centered on desktop screens.
- Smooth swipe navigation between photos with zero horizontal page scroll interference.
- Photos load via Google Drive high-resolution links with graceful loading indicators.
- Tapping a companion's memory button opens their specific memories immediately.

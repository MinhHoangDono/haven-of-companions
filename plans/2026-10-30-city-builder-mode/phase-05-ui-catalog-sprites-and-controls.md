---
title: "Phase 5: UI Building Catalog, Sprites & Toolbar Drawer"
phase: 5
status: pending
priority: P1
effort: 1.5h
branch: main
tags: [frontend, react, ui-components, sprites, catalog-drawer, mobile-responsive]
dependsOn: [1, 3, 4]
files:
  - src/components/ui/builder/BuilderToolbar.tsx
  - src/components/ui/builder/StructureCard.tsx
  - src/components/ui/builder/SaveLoadModal.tsx
  - src/components/ui/TopBar.tsx
  - src/App.tsx
created: 2026-10-30
---

# Phase 5: UI Building Catalog, Sprites & Toolbar Drawer

## 1. Objective

Create an elegant, mobile-responsive React UI overlay for the City Builder mode:
1. **TopBar Build Toggle**: An accessible "Xây Dựng (Build)" action button in `TopBar.tsx`.
2. **Bottom-Docked Catalog Drawer**: Category tabs, responsive structure cards with 2D SVG/Sprite icons, footprint badges, and names in Vietnamese.
3. **Builder Quick-Action Bar**: Rotate button ($90^\circ$), Bulldozer/Demolish toggle, and Save/Load manager modal.

---

## 2. UI Layout Mockup

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Haven of Companions]  [Day/Night] [Weather] [Mute]  [🔨 XÂY DỰNG]     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                        3D ISOMETRIC DIORAMA                            │
│                 (Ghost Hologram Following Pointer)                     │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│  [🔄 Xoay 90° (R)]  [🚜 Phá Hủy (Del)]  [💾 Lưu / Xuất]  [❌ Thoát]    │
├────────────────────────────────────────────────────────────────────────┤
│ [Tất Cả] [Nhà Cửa] [Công Trình] [Phòng Thủ] [Trang Trí] [Thiên Nhiên]   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │  🏠 2x2  │ │  🏰 3x3  │ │  💨 2x2  │ │  🗼 1x1  │ │  💣 1x1  │  ...   │
│ │ Nhà Gỗ A │ │ Quán Trọ │ │ Cối Xay  │ │ Tháp Canh│ │ Đại Bác  │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Hierarchy

1. **`TopBar.tsx`**:
   - Add `isBuildMode: boolean` and `onToggleBuildMode: () => void`.
   - Render a distinctive golden button with `Hammer` icon from `lucide-react`.
2. **`BuilderToolbar.tsx`**:
   - Slide-up bottom sheet with Tailwind blur backdrop: `bg-ink-950/90 backdrop-blur-md`.
   - Category filtering:
     - `all`: All structures.
     - `houses`: Cottages, Tavern.
     - `production`: Windmill, Market Stalls.
     - `fortifications`: Watchtowers, Cannons, Stockades.
     - `decorations`: Campfires, Treasure Chests, Rum Crates.
     - `nature`: Pines, Palms, Rocks.
3. **`StructureCard.tsx`**:
   - High-contrast visual card with:
     - Thematic 2D Sprite / Lucide icon with gradient background.
     - Name in Vietnamese (e.g. "Nhà Mái Vàng", "Tháp Canh Hải Tặc").
     - Footprint chip (e.g. `2x2`, `1x1`).
     - Selected glow ring (`border-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.4)]`).
4. **`SaveLoadModal.tsx`**:
   - Modal dialog providing:
     - One-click "Sao Chép Mã Bản Đồ (Copy Map JSON)".
     - "Dán Mã Bản Đồ (Paste / Import JSON)".
     - "Khôi Phục Ban Đầu (Reset Town)" with confirmation warning.
5. **`App.tsx` Integration**:
   - Manages state: `isBuildMode`, `activeTool ('place' | 'rotate' | 'demolish')`, `selectedStructureId`.
   - Seamlessly binds hotkeys:
     - `B`: Toggle Build Mode.
     - `R` / `Space`: Rotate selected structure.
     - `Escape` / `Del`: Switch to Demolish tool or exit build mode.

---

## 4. Acceptance Criteria

- Clicking the "Xây Dựng" button slides up the Builder Drawer smoothly.
- Selecting any structure card updates the active ghost hologram in the 3D diorama immediately.
- Tapping "Xoay 90°" rotates the ghost mesh by $90^\circ$ with clear visual feedback.
- Switching to "Phá Hủy" changes the cursor and enters Demolish mode.
- All cards fit comfortably on mobile displays ($\ge 44\text{px}$ touch targets).

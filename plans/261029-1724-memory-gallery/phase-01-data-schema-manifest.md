---
title: "Phase 1: Memory Data Schema & Extensible Manifest"
status: todo
priority: P1
effort: 1.5h
tags: [data, typescript, google-drive, types]
---

# Phase 1: Memory Data Schema & Extensible Manifest

## Overview

Establish the data foundation for location-anchored memories, supporting Google Drive direct file IDs, local fallbacks, friend tags, chronological dates, and regional grouping.

## Requirements

- [ ] Define comprehensive TypeScript interfaces in `src/types/memory.ts`.
- [ ] Create `src/data/memoriesData.ts` with structured seed memories for all 3 regions (Highlands, Sunspire Plaza, Coastal Docks).
- [ ] Implement Google Drive high-resolution direct link resolver (`https://lh3.googleusercontent.com/d/{FILE_ID}=s1600`) with automatic SVG/placeholder fallback when offline.
- [ ] Provide query utilities: `getMemoriesByTerrace(terraceId)`, `getMemoriesByFriendId(friendId)`, `getMemoryById(id)`.

## Implementation Steps

1. **Create `src/types/memory.ts`**:
   - `export type MemoryTerrace = 'highlands' | 'plaza' | 'coastal';`
   - `export interface PhotoRecord`:
     - `id: string;`
     - `title: string;`
     - `date: string;` (e.g. "Tháng 12, 2024")
     - `locationName: string;` (e.g. "Rừng thông Đà Lạt, Lâm Đồng")
     - `googleDriveId?: string;`
     - `imageUrl: string;`
     - `caption: string;`
     - `taggedFriendIds: string[];`
   - `export interface MemoryLocation`:
     - `id: string;`
     - `terrace: MemoryTerrace;`
     - `name: string;`
     - `vietnameseName: string;`
     - `coordinates: { x: number; y: number; z: number };`
     - `icon: string;`
     - `narrative: string;`
     - `photos: PhotoRecord[];`
2. **Create `src/data/memoriesData.ts`**:
   - Seed 3 distinct memory locations corresponding to the real-life adventures from the character lore:
     - **Highlands (`highlands-hearth`)**: Campfire feast and pine hiking in Da Lat with Thi and Phương Quỳnh.
     - **Plaza (`sunspire-pavilion`)**: Art exhibitions, artifact discovery, and New Year fireworks with Trâm Anh, Khải Vạn, and Thảo Uyên.
     - **Coast (`coastal-harbor`)**: Japanese banquet, seaside boardwalk, and Nha Trang Bay cruise with Ngọc Hà, Thanh Phương, Xuân Minh, and Anh Thư.
3. **Image Resolver & Fallback Generator**:
   - Helper function `resolvePhotoUrl(photo: PhotoRecord): string` prioritizing `googleDriveId` when online, otherwise falling back to styled SVG memory placeholders with photographic motifs.
4. **Export Lookup Helpers**:
   - `findMemoriesForTerrace(terrace: MemoryTerrace): MemoryLocation[]`
   - `findMemoriesForFriend(friendId: string): { location: MemoryLocation; photo: PhotoRecord }[]`

## Todo

- [ ] Create `src/types/memory.ts` with strong typing
- [ ] Create `src/data/memoriesData.ts` populated with initial curated photo entries for all 9 friends
- [ ] Implement Google Drive CDN URL resolver with offline SVG fallback
- [ ] Export query helpers for terrace and companion lookups
- [ ] Verify TypeScript compiles with `npm run build`

## Success Criteria

- Clean TypeScript compilation without `any` types.
- Querying by friend ID returns all memories tagged with that friend.
- Image URLs resolve properly to Google Drive's high-speed CDN endpoint.

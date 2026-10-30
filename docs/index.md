# Documentation Index – Haven of Companions (*Làng Tri Kỷ*)

Welcome to the technical and operational documentation for **Haven of Companions** (*Làng Tri Kỷ*). This directory serves as the canonical knowledge base for engineering handovers, multi-agent collaboration, architectural invariants, domain rules, and production deployment pipelines.

> **Live Production URL**: [https://minhhoangdono.github.io/haven-of-companions/](https://minhhoangdono.github.io/haven-of-companions/)  
> **Source Repository**: [https://github.com/MinhHoangDono/haven-of-companions](https://github.com/MinhHoangDono/haven-of-companions)  
> **Automated CI/CD**: GitHub Actions workflow (`.github/workflows/deploy.yml`) on `master` push.

---
## Navigation Map

| Document | Primary Audience | Scope & Purpose |
|---|---|---|
| [**System Architecture**](./system-architecture.md) | Software Engineers & 3D Developers | Coordinate frames, 3D scene hierarchy, touch gesture state machine, camera projection, and lighting engine. |
| [**Handover Runbook**](./handover-guide.md) | Maintainers & Onboarding Developers | Local development environment setup, build pipelines, deployment commands, caching policies, and common gotchas. |
| [**Character & Lore Registry**](./character-registry.md) | Game Designers & Content Writers | Domain specifications for all 9 friends: real-life inspirations, factions, stat distributions, dialogues, and ability hooks. |
| [**Asset Remodeling Blueprint**](./remodeling-guide.md) | 3D Artists & Frontend Developers | Step-by-step implementation guide for loading and attaching the 3D Kenney and KayKit low-poly GLBs (`kenney_blocky-characters_20`, `kenney_pirate-kit`). |
| [**Project Progress & Verification**](./PROJECT_PROGRESS.md) | Project Managers & Stakeholders | Detailed audit of delivered phases, verified acceptance criteria, and mobile benchmark results. |
| [**Environmental & VFX Animation Guide**](./environmental-animation-vfx-guide.md) | 3D Developers & Technical Artists | Drop-in copy-paste shaders, open-source resources, and formulas for ocean water, cartoon fire, wind foliage, 9-hero fantasy spell VFX, and dynamic weather. |

---

## Core Invariants

1. **Automated GitHub Pages CI/CD & Relative Base Path**: Production builds deploy automatically via GitHub Actions upon pushing to `master`. `vite.config.ts` **must retain `base: './'`** to ensure all JS/CSS chunks and 3D models resolve correctly under the GitHub Pages subfolder (`/haven-of-companions/`).
2. **Mobile-First Touch Fluidity**: Every gesture must operate without stuttering or jank. 1-finger drag owns camera ground panning; 2-finger pinch owns camera distance zoom; 2-finger twist and UI buttons own camera azimuth rotation.
3. **Deterministic Coordinates**: All 3D coordinates use the Three.js coordinate system where $+Y$ is vertical elevation, $+X$ is East, and $+Z$ is South. World bounds are clamped to $[-35, 35]$ on both $X$ and $Z$ over the $70 \times 70$ voxel diorama.
4. **PWA Cache Invalidation**: Whenever new assets or code are committed for production release, the `CACHE_NAME` constant in `public/sw.js` **must be incremented** to prevent stale asset caching on iOS Safari and Android Chrome.
5. **Zero Heavy Runtime CDNs**: All fonts, styles, shaders, and models are self-contained in the project bundle to ensure sub-second cold boot on mobile networks.
6. **City Builder Footprint Invariant**: User-placed structures must never overlap deep ocean water ($Y \le 0$) or companion pedestals, and must dynamically update `passabilityMap.ts` to prevent companion clipping.
7. **Platformer & Collectibles Cycle**: Dynamic platforms (falling pier plank, wind thermal geyser) must reset deterministically without permanent destruction of the terrain, and 3D collectibles must respawn cleanly on a $25\text{s}$ cooldown.

---
title: "Phase 4: Procedural Web Audio SFX & 60 FPS Mobile Verification"
status: completed
priority: P1
effort: 1.0h
tags: [audio, web-audio, performance, optimization, verification]
---

# Phase 4: Procedural Web Audio SFX & 60 FPS Mobile Verification

## 1. Overview
Hoàn thiện trải nghiệm nghe - nhìn bằng cách bổ sung âm thanh phát sóng (SFX) tổng hợp bằng Web Audio API cho 18 kỹ năng trong `src/audio/audioManager.ts`, đồng thời đo kiểm hiệu năng rendering trên thiết bị di động (đảm bảo $\ge 60\text{ FPS}$ và $<5\text{ draw calls}$) và xác thực build bằng `npm run build`.

---

## 2. Technical Scope & Implementation Steps

### Step 1: Mở Rộng Procedural SFX (`src/audio/audioManager.ts`)
Bổ sung case trong `playAbility(type: AbilityEffectType)`:
1. **Âm thanh Tự nhiên & Thảo mộc** (`active_seed_of_life`, `ult_forest_awakening`):
   - Tiếng nảy hạt thông gỗ (Woodblock click) kết hợp tiếng xào xạc lá cây (Pink noise sweep).
2. **Âm thanh Cung & Giai điệu** (`active_resonating_arrow`, `ult_hymn_of_wilds`):
   - Tiếng rít xé gió tần số cao và chuỗi hợp âm thánh ca ngũ cung vang vọng.
3. **Âm thanh Mực & Hư không** (`active_void_brush`, `ult_spatial_masterpiece`):
   - Tiếng vẩy mực vút qua (Soft low-pass filtered whoosh) và tiếng ngân vang huyền ảo.
4. **Âm thanh Lửa & Pháo hoa** (`active_firework_orb`, `ult_celestial_nocturne`):
   - Tiếng rít phóng hỏa tiễn và các tiếng nổ pháo hoa trầm vang nhiều tầng.
5. **Âm thanh Thánh quang** (`active_guardian_light`, `ult_dawn_resurgence`):
   - Chuông pha lê ngân vang (Sine 1760Hz) và tiếng luồng sáng bình minh bùng nổ.
6. **Âm thanh Thể thao & Đột kích** (`active_athletic_tempo`, `ult_infinite_flurry`):
   - Tiếng vút gió đòn đánh liên hoàn và tiếng nện đất trầm sâu (Bass drop 60Hz).
7. **Âm thanh Thủy triều & Sóng nước** (`active_resilient_torrent`, `ult_ocean_tsunami`, `active_serene_wave`, `ult_passionate_geyser`):
   - Tiếng nước róc rách, tiếng bong bóng vỡ và tiếng sóng thần/mạch nước gầm thét.
8. **Âm thanh Quản lý & Tiệc cuồng nộ** (`active_fearless_charge`, `ult_party_frenzy`):
   - Tiếng kèn lệnh xung phong và tiếng chém sấm sét dồn dập.

### Step 2: Tối Ưu Hóa & Quản Lý Vòng Đời Hạt (Lifecycle Cleanup)
- Kiểm tra việc giải phóng bộ nhớ của `three.quarks` ParticleSystem khi hết thời lượng:
  - Tự động gọi `this.batchRenderer.deleteSystem(system)` và `this.scene.remove(system.emitter)`.
- Tự động tắt và xóa các `PointLight` tạm thời khỏi Three.js scene khi kỹ năng kết thúc.
- Giới hạn số lượng hạt hiển thị đồng thời $\le 150$ hạt toàn canvas.

### Step 3: Kiểm Tra Build & Đo Kiểm Cuối
```bash
# Type check and build bundle
npm run build
```

---

## 3. Verification & Acceptance Criteria
- [ ] Không có memory leak: Sau khi thi triển kỹ năng, số lượng đối tượng Three.js trong Scene quay về trạng thái cân bằng ban đầu.
- [ ] SFX phát mượt mà khi người dùng bật âm thanh (Unmute).
- [ ] Build thành công 100% không cảnh báo lỗi: `npm run build` hoàn thành trong $< 15\text{s}$.

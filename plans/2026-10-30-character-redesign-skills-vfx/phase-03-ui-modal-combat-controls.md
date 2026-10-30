---
title: "Phase 3: Dual Ability UI & Canvas Combat Integration"
status: completed
priority: P1
effort: 1.5h
tags: [react, ui, character-modal, canvas-integration, controls]
---

# Phase 3: Dual Ability UI & Canvas Combat Integration

## 1. Overview
Nâng cấp giao diện người dùng trong `CharacterModal.tsx` và cầu nối điều khiển trong `App.tsx` / `ThreeIsometricCanvas.tsx`. Thay thế ô kỹ năng đơn lẻ cũ bằng hệ thống 2 thẻ kỹ năng trực quan (Kỹ năng Chủ động & Kỹ năng Tối thượng) với phong cách mỹ thuật giả tưởng cổ điển, thời gian hồi chiêu riêng biệt và các nút thi triển độc lập.

---

## 2. Technical Scope & Implementation Steps

### Step 1: Nâng Cấp Tab Kỹ Năng Trong `CharacterModal.tsx`
Tái thiết kế giao diện bên trong tab `⚡ Kỹ Năng`:
1. **Thẻ Kỹ Năng Chủ Động (Active Skill Card)**:
   - Header: Huy hiệu "⚔️ Kỹ Năng Chủ Động", tên kỹ năng, icon đại diện.
   - Badge hồi chiêu: Pill nền tối viền vàng nhạt (ví dụ: `Hồi chiêu: 5s`).
   - Mô tả chiến thuật: Hộp nền giấy da tối với đường nét thanh lịch.
   - Nút kích hoạt: `Thi Triển Kỹ Năng Ngay` (Tone màu vàng đồng).
2. **Thẻ Kỹ Năng Tối Thượng (Ultimate Skill Card)**:
   - Header: Huy hiệu hào quang "🌟 Tuyệt Kỹ Tối Thượng (Ultimate)", tên kỹ năng, icon tối thượng.
   - Badge nộ/hồi chiêu: Pill viền gradient tím/vàng nổi bật (ví dụ: `Hồi chiêu: 25s`).
   - Khung viền phát sáng nhẹ: Hiệu ứng gradient `from-amber-500/20 via-purple-500/20 to-amber-500/20`.
   - Nút kích hoạt: `Khai Mở Tuyệt Kỹ Tối Thượng` (Nút lớn rực rỡ với hiệu ứng lấp lánh).
3. **Phần Nội Tại (Passives)**:
   - Giữ nguyên hiển thị 2 kỹ năng nội tại tri kỷ ở phía dưới để bổ trợ phong cách chiến đấu.

```tsx
{/* Dual Ability Grid */}
<div className="grid grid-cols-1 gap-4">
  {/* 1. Active Ability Card */}
  <AbilityCard
    title="Kỹ Năng Chủ Động"
    ability={currentCharacter.activeAbility}
    onCast={() => onCastAbility(currentCharacter.activeAbility.effectType)}
    theme="active"
  />

  {/* 2. Ultimate Ability Card */}
  <AbilityCard
    title="Tuyệt Kỹ Tối Thượng"
    ability={currentCharacter.ultimateAbility}
    onCast={() => onCastAbility(currentCharacter.ultimateAbility.effectType)}
    theme="ultimate"
  />
</div>
```

### Step 2: Cập Nhật Handler Trong `App.tsx` & `ThreeIsometricCanvas.tsx`
- Đảm bảo hàm `castSpell` nhận bất kỳ `AbilityEffectType` nào trong số 18 hiệu ứng mới.
- Đồng bộ hóa chuyển động nhảy ăn mừng (`hopProgress`) hoặc tư thế niệm chú của nhân vật khi thi triển.
- Nếu người chơi đang mở modal, thi triển kỹ năng sẽ đồng thời kích hoạt hiệu ứng 3D trực tiếp dưới chân nhân vật ngoài bản đồ thế giới và trong khung 3D preview.

---

## 3. Verification & Acceptance Criteria
- [ ] Tab Kỹ Năng trong `CharacterModal.tsx` hiển thị đầy đủ cả 2 kỹ năng với dữ liệu chính xác cho cả 9 nhân vật.
- [ ] Bấm vào nút thi triển Active phát sinh hiệu ứng tương ứng tại vị trí nhân vật.
- [ ] Bấm vào nút thi triển Ultimate kích hoạt hiệu ứng tối thượng hoành tráng toàn màn hình.
- [ ] Không có xung đột state hay giật lag khi chuyển đổi qua lại giữa 9 nhân vật.

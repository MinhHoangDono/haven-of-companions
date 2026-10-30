---
title: "Phase 2: GPU-Batched 3D VFX Engine for 18 Active & Ultimate Abilities"
status: completed
priority: P1
effort: 3.0h
tags: [threejs, vfx, particles, three-quarks, shaders]
---

# Phase 2: GPU-Batched 3D VFX Engine for 18 Active & Ultimate Abilities

## 1. Overview
Xây dựng và nâng cấp hệ thống hiệu ứng hình ảnh 3D trong `src/engine/three/SpellEffect3D.ts`. Tận dụng `three.quarks` BatchedRenderer và Three.js procedural geometry để tạo ra 18 hiệu ứng thị giác chất lượng cao (9 Kỹ năng Chủ động và 9 Kỹ năng Tối thượng), kết hợp Dynamic PointLights và âm thanh đặc trưng.

---

## 2. Technical Architecture & Particle Atlas

Tận dụng bộ texture atlas CC0 có sẵn (`textures/particles/`):
- `circle_05.png`: Vầng hào quang mờ, bong bóng, vòng sóng năng lượng.
- `spark_04.png`: Tia lửa pháo hoa, bụi vàng, điện quang.
- `smoke_01.png`: Khói lửa, sương mù thảo mộc Đà Lạt, hơi nước.
- `slash_02.png`: Vệt cọ vẽ ma thuật, vết chém sóng nước, luồng gió.
- `magic_03.png`: Cung tròn bùa chú, ký hiệu ma thuật tinh tú.
- `flame_01.png`: Ngọn lửa giao thừa, luồng nhiệt chấn.

---

## 3. Chi Tiết Thực Thi 18 Hiệu Ứng

### Nhóm 1: Anh Thi (Wilderness Druid)
1. **`active_seed_of_life`**:
   - Projectile hạt thông ném từ tay nhân vật đến điểm đích.
   - Khi tiếp đất: Vỡ tung thành đám mây sương mù màu lục bích (`smoke_01.png`) và 20 lá cây xoay tròn (`DonutEmitter`), tạo hiệu ứng hồi máu theo thời gian.
2. **`ult_forest_awakening`**:
   - Trồi lên 6 rễ cây cổ thụ khổng lồ 3D (`CylinderGeometry` uốn cong) trói chân mục tiêu.
   - Thảm hoa bừng nở trên mặt đất (`RingGeometry` xanh ngọc) mở rộng bán kính 6.0m cùng vầng hào quang rừng thông.

### Nhóm 2: Phương Quỳnh (Singing Ranger)
3. **`active_resonating_arrow`**:
   - Mũi tên ánh sáng xé gió bay thẳng với vệt xoắn ốc âm thanh (`slash_02.png`) bao quanh thân tên.
   - Sóng chấn động hình nón tỏa ra tại điểm chạm gây hiệu ứng im lặng.
4. **`ult_hymn_of_wilds`**:
   - Sóng âm thanh đồng tâm nhiều tầng (`TorusGeometry` phát sáng vàng kim) mở rộng liên tục từ vị trí Quỳnh.
   - Các hạt nốt nhạc và bụi vàng lơ lửng bay bổng xung quanh trong bán kính 7.5m, biểu thị trạng thái mê hoặc và buff toàn đội.

### Nhóm 3: Trâm Anh (Illusionist Painter)
5. **`active_void_brush`**:
   - Vung vệt cọ khổng lồ hình vòng cung (Cone 60 độ) quét ngang phía trước bằng vệt mực màu tím Hư Không kết hợp các vệt sơn ngũ sắc rực rỡ (`slash_02.png` + `spark_04.png`).
6. **`ult_spatial_masterpiece`**:
   - Mặt đất biến thành một khung tranh sơn dầu ma thuật khổng lồ hình tròn với texture xoáy màu nước lấp lánh.
   - Các hạt màu loang dần từ tâm ra ngoài, tạo vùng lãnh địa nghệ thuật ảo ảnh.

### Nhóm 4: Khải Văn (Pyromancy Sorcerer)
7. **`active_firework_orb`**:
   - Quả cầu plasma lửa cam đỏ rực cháy bay về phía trước.
   - Phát nổ thành pháo hoa tung tóe với 45 hạt tia lửa rực rỡ ngũ sắc (`spark_04.png`) và làn khói xám nhẹ.
8. **`ult_celestial_nocturne`**:
   - Mưa sao băng pháo hoa giao thừa: 8 quả pháo hoa khổng lồ từ trên bầu trời lao xuống liên tiếp tại các vị trí ngẫu nhiên quanh tâm.
   - Mỗi vụ nổ tạo cột lửa bốc cao, ánh sáng động cực mạnh (`PointLight(0xff5500, 3.5, 6)`) và rung nhẹ góc nhìn.

### Nhóm 5: Thảo Uyên (Cleric of the Light)
9. **`active_guardian_light`**:
   - Lớp vòm khiên thái dương hình bán cầu (`SphereGeometry` vàng trắng) bao phủ đồng minh.
   - Các tia nắng chiếu thẳng từ trên đỉnh vòm xuống, xóa sạch hiệu ứng bất lợi.
10. **`ult_dawn_resurgence`**:
    - Cột sáng bình minh khổng lồ đường kính 4m chiếu thẳng từ trời xuống trung tâm chiến trường.
    - Sóng ánh sáng lan tỏa toàn bản đồ kèm hiệu ứng lens flare chói lòa, biểu thị sự phục sinh và hồi máu toàn đội.

### Nhóm 6: Ngọc Hà (Athletic Monk)
11. **`active_athletic_tempo`**:
    - 3 vệt lướt tốc biến liên hoàn với dải màu lam ngọc (`slash_02.png`), để lại ảo ảnh chuyển động và làn bụi gió dạt sang hai bên.
12. **`ult_infinite_flurry`**:
    - Hà bật nhảy vút lên không trung và giáng cú nện đất sấm sét.
    - 4 vòng sóng xung kích địa chấn nổ liên tiếp lan ra ngoài cùng các tia lửa thể thao năng lượng cao.

### Nhóm 7: Thanh Phương (Highland Water Guardian)
13. **`active_resilient_torrent`**:
    - Khiên nước cuộn xoáy 3 chiều dạng hình cầu bảo bọc cơ thể.
    - Khi kết thúc: Nước nổ tung văng ra các giọt nước bắn tung tóe đẩy lùi mọi vật thể lân cận.
14. **`ult_ocean_tsunami`**:
    - Đâm vũ khí xuống đất: Mặt đất biến thành xoáy nước biển sâu cuốn hút kẻ thù về tâm.
    - Sau 1.5 giây: Ngọn sóng thần khổng lồ trào dâng cuốn phăng mọi chướng ngại.

### Nhóm 8: Xuân Minh (Fearless Manager)
15. **`active_fearless_charge`**:
    - Lao thẳng về phía trước để lại vệt cờ lệnh rực lửa.
    - Đặt một biểu tượng hồng tâm đỏ rực lơ lửng xoay tròn trên đầu mục tiêu chỉ định.
16. **`ult_party_frenzy`**:
    - Vệt chém liên hoàn hình zíc-zắc chớp nhoáng nối liền các mục tiêu trong khu vực.
    - Toàn bộ đồng minh nhận được vệt luồng gió vàng sau lưng tượng trưng cho 100% tốc chạy.

### Nhóm 9: Lâm Anh Thư (Quiet Tide)
17. **`active_serene_wave`**:
    - Bong bóng nước ngọc bích êm đềm bay nảy vòng cung (bouncing) từ đồng minh này sang đồng minh khác.
    - Mỗi lần chạm phát ra vòng gợn sóng nước êm dịu hồi phục sinh lực.
18. **`ult_passionate_geyser`**:
    - Mặt đất rạn nứt phun trào một mạch nước nóng khổng lồ phun thẳng lên trời cao.
    - Bụi nước và bong bóng nước mưa xuống ban phát lớp khiên bảo hộ bọt khí cho toàn bộ đồng đội.

---

## 4. Verification & Acceptance Criteria
- [ ] Mọi hiệu ứng giải phóng bộ nhớ sạch sẽ sau khi hoàn tất thời lượng (không rò rỉ Three.js objects trong Scene).
- [ ] Tất cả hạt sử dụng `batchRenderer` gom nhóm thành 1 draw call chung.
- [ ] 18 hàm hiệu ứng được route chính xác trong `SpellEffect3D.castSpell(effectType, origin)`.

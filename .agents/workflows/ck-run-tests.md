---
description: Run manual test cases from an Excel or Markdown file — convert, review, execute with video evidence, then report results
---

## Context

```
Test input: <operation>${input}</operation>
```

> ⚠️ Đọc SKILL đầy đủ tại `.agents/skills/manual-tester/SKILL.md` trước khi bắt đầu bất kỳ phase nào.

---

## Cách dùng

```
/ck-run-tests <path/to/test-file> [app-url] [tc-ids]
```

**Ví dụ:**
```
/ck-run-tests "test-cases.xlsx" http://localhost:3000
/ck-run-tests "test-plan.md" http://localhost:3000
/ck-run-tests "test-plan.md" http://localhost:3000 "TC-001, TC-003"
```

---

## ─── PHASE 1: CHUẨN BỊ INPUT ──────────────────────────────────

1. Xác định loại file từ input:
   - **Nếu là `.xlsx`:** Chạy script chuyển đổi để tạo file `.md`:
     ```powershell
     python ".agents/skills/manual-tester/scripts/xlsx_to_md.py" "<file.xlsx>"
     ```
   - **Nếu là `.md`:** Sử dụng luôn file test plan này làm input.

2. Kiểm tra nếu có danh sách `tc-ids` được truyền vào (ví dụ: `TC-001, TC-005`).

3. Hiển thị nội dung test plan cho tester — liệt kê toàn bộ TC ID tìm thấy trong file.

---

## ─── PHASE 2: REVIEW & CHỌN TC (⛔ DỪNG BẮT BUỘC) ──────────

**DỪNG LẠI và hỏi tester** — KHÔNG được tiến hành Phase 3 khi chưa có xác nhận!

```
📋 Test plan: <path/to/file.md>
📊 Tổng số TC trong file: <N>

❓ Bạn muốn chạy test như thế nào?
   [1] Chạy TOÀN BỘ TC trong file
   [2] Chỉ chạy các TC cụ thể: (Ví dụ: TC-001, TC-003)
   [3] Hủy
```

**Lưu ý:**
- Nếu tester chọn [1] hoặc [2] → ghi lại danh sách TC ID sẽ thực thi.
- Nếu input ban đầu là `.xlsx` → đảm bảo tester đã xem kỹ file `.md` đã convert.
- Nếu tester chọn [3] → dừng hoàn toàn, không thực thi bất kỳ test nào.

---

## ─── PHASE 3: THỰC THI (THEO FILE .MD) ─────────────────────

Sau khi tester xác nhận, thực thi **chính xác** theo nội dung trong file `.md`:

### Bước 3.1 — Đọc & chuẩn bị

1. Đọc lại toàn bộ file `.md` (tester có thể đã sửa).
2. Xác nhận URL ứng dụng cần test — nếu chưa có thì hỏi tester.
3. Lấy danh sách test case theo thứ tự trong file, chỉ lọc những TC ID đã chọn ở Phase 2.
4. Nếu URL không tồn tại hoặc app chưa chạy → báo lỗi và dừng hoàn toàn.

### Bước 3.2 — Thực thi từng test case (dùng browser_subagent)

Với **mỗi test case** trong danh sách đã chọn:

**Tên recording:** `tc-{mã tc}-{slug-tên-test}` (ví dụ: `tc-001-dang-ky-tai-khoan`)

**PHẢI** bật chức năng quay video (recording) cho toàn bộ quá trình thực hiện — **KHÔNG** dùng ảnh chụp đơn lẻ.

**Nội dung task cho browser_subagent:**
```
Thực thi test case: {Mã TC} — {Tên test}

URL ứng dụng: {URL}

Dùng lệnh sau để thực thi và quay video:
python .agents/skills/browser-automation/scripts/recorder.py --url "{URL}" --steps "{TRÍCH_XUẤT_CÁC_BƯỚC_THÀNH_CÚ_PHÁP_CLIP_Hợp_lệ}" --output "tc-{id}.webm"

Điều kiện trước khi test:
{Điều kiện — lấy nguyên từ file .md}

Các bước thực hiện (thực hiện chính xác từng bước):
{Các bước — lấy nguyên từ file .md}

Kết quả mong đợi:
{Kết quả — lấy nguyên từ file .md}

Sau khi thực hiện xong:
1. Kết thúc và lưu video playback tại tests/recordings/tc-{id}.webm.
2. **SO SÁNH:** Đối chiếu "Kết quả thực tế" với "Kết quả mong đợi".
3. Trả về: ĐẠT hoặc KHÔNG ĐẠT.
4. Nếu KHÔNG ĐẠT: Mô tả chính xác bước nào gặp lỗi và sự khác biệt so với mong đợi.
5. **CẤM VƯỢT QUYỀN:** Tuyệt đối không tự ý thực hiện các bước không có trong kịch bản (ví dụ: tự đăng ký khi login fail) để "giả vờ" vượt qua testcase.
```

### Bước 3.3 — Cập nhật kết quả vào file .md (ngay sau mỗi test)

Sau khi chạy xong mỗi test case, **cập nhật ngay lập tức** (không gộp):

**1. Trong phần chi tiết test case:**
```
**Kết quả thực tế:** Đạt / Không đạt — [mô tả ngắn]
**Bằng chứng video:** Xem recording tại tests/recordings/tc-{id}-{slug}.webp
```

**2. Trong bảng Kết Quả cuối file:**
```
| TC-001 | Đăng ký tài khoản | ✅ Đạt | Video: tests/recordings/tc-001.webp | - |
```

**Ký hiệu kết quả:**

| Ký hiệu | Nghĩa |
|---------|-------|
| ✅ Đạt | Test pass — đúng như mong đợi |
| ❌ Không đạt | Test fail — sai kết quả |
| ⚠️ Bị chặn | Có lỗi trước đó cản không chạy được |
| ⏭️ Bỏ qua | Không chạy (ghi rõ lý do) |

---

## ─── PHASE 4: BÁO CÁO KẾT QUẢ ──────────────────────────────

Sau khi chạy hết tất cả test case, tạo file báo cáo tại `tests/reports/report-{YYYYMMDD-HHmm}.md`.

**Yêu cầu báo cáo:**
- Ngôn ngữ đơn giản, dễ hiểu cho tất cả mọi người (không dùng từ quá kỹ thuật).
- Có bảng tổng hợp rõ ràng: Bao nhiêu đạt, bao nhiêu lỗi.
- Với các lỗi: Ghi rõ "Bước bị lỗi", "Thực tế thấy gì" và "Lẽ ra phải thế nào".
- Luôn đính kèm video minh chứng trực tiếp dưới mỗi lỗi.
- Đưa ra danh sách các vấn đề cần sửa đổi ngay lập tức.

**Mẫu báo cáo:**
```markdown
# Báo Cáo Kiểm Thử

**Ngày:** {ngày giờ}
**File test plan:** {tên file .md}
**Ứng dụng:** {URL}

---

## Tóm Tắt

| Tổng | Đạt | Không đạt | Bị chặn | Bỏ qua |
|------|-----|-----------|---------|--------|
| {N}  | {P} | {F}       | {B}     | {S}    |

**Tỷ lệ đạt:** {P}/{N} = {%}%

---

## Các Test Đạt ✅

| Mã TC | Tên Test | Bằng Chứng |
|-------|----------|------------|
| TC-001 | Tên test | Video: tests/recordings/tc-001.webp |

---

## Các Test Không Đạt ❌

### TC-{ID}: {Tên test}

- **Bước bị lỗi:** Bước {N}
- **Kết quả thực tế:** {mô tả điều gì xảy ra}
- **Kết quả mong đợi:** {copy từ file .md}
- **Bằng chứng:** Video tại tests/recordings/tc-{id}.webp

---

## Vấn Đề Phát Hiện

| # | Mô tả lỗi | Mức độ | Test case liên quan |
|---|-----------|--------|---------------------|
| 1 | {mô tả} | Cao/Trung bình/Thấp | TC-{ID} |

---

## Đề Xuất

1. {đề xuất cụ thể 1}
2. {đề xuất cụ thể 2}
```

---

## Lưu Ý Quan Trọng

- **PHẢI** dừng ở Phase 2 và chờ tester xác nhận trước khi chạy
- **PHẢI** ghi lại toàn bộ quá trình test bằng **Video Recording** cho mỗi test case — KHÔNG dùng ảnh chụp đơn lẻ
- **NGHIÊM CẤM VƯỢT QUYỀN:** Chỉ thực hiện chính xác những gì ghi trong file. Không tự ý sửa lỗi hệ thống hoặc thêm bước ngoài kịch bản.
- **SO SÁNH KẾT QUẢ:** Kết quả thực tế phải được đối chiếu với Kết quả mong đợi để đưa ra kết luận ĐẠT/KHÔNG ĐẠT.
- **PHẢI** cập nhật file `.md` ngay sau mỗi test — không gộp
- Nếu app chưa chạy hoặc URL không tồn tại → báo lỗi và dừng

---

## Suggested Next Steps

| Command | Description |
|---------|-------------|
| `/ck-debug` | Debug lỗi phát hiện trong test |
| `/ck-fix` | Fix bug phát hiện |
| `/ck-git` | Commit test results |

---
> **⚡ SYSTEM FALLBACK ROUTER:**
> Môi trường AI hiện tại của bạn có thể không hỗ trợ trigger slash command trực tiếp.
> Nếu bạn cần gọi các lệnh như `/ck-debug, /ck-git, /ck-fix, /ck-run-tests`, bạn BẮT BUỘC phải đọc nội dung của các file tương ứng tại `./.agents/workflows/tên-lệnh.md` và tự động thực thi quy trình hướng dẫn trong đó để hoàn thành công việc.

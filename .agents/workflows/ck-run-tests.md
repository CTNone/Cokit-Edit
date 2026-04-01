---
description: Run manual test cases from an Excel file — convert to Markdown, pause for review, execute each test with evidence, then report results
---

# Manual Test Runner

**Skill:** `manual-tester`

> Đọc `SKILL.md` đầy đủ tại `.agents/skills/manual-tester/SKILL.md` trước khi thực hiện.

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

## Workflow (đọc SKILL.md để thực hiện)

### ─── PHASE 1: CHUẨN BỊ INPUT ──────────────────────

1. Xác định loại file từ input:
   - **Nếu là `.xlsx`:** Chạy script chuyển đổi để tạo file `.md`:
     ```powershell
     python ".agents/skills/manual-tester/scripts/xlsx_to_md.py" "<file.xlsx>"
     ```
   - **Nếu là `.md`:** Sử dụng luôn file test plan này làm input.
2. Kiểm tra nếu có danh sách `tc-ids` được truyền vào (ví dụ: `TC-001, TC-005`).
3. Hiển thị nội dung test plan cho tester.

### ─── PHASE 2: REVIEW & CHỌN TC (PAUSE) ───────────

**⛔ DỪNG BẮT BUỘC**

Xác nhận với tester:

```
📋 Test plan: <path/to/file.md>
📊 Tổng số TC trong file: <N>

❓ Bạn muốn chạy test như thế nào?
   [1] Chạy TOÀN BỘ TC trong file
   [2] Chỉ chạy các TC cụ thể: (Ví dụ: TC-001, TC-003)
   [3] Chỉnh sửa file .md trước khi chạy
   [4] Hủy
```

**Lưu ý:**
- Nếu tester chọn [1] hoặc [2], Agent phải ghi lại danh sách TC ID cần thực thi.
- Nếu input ban đầu là `.xlsx`, Agent phải đảm bảo tester đã xem kỹ file `.md` vừa convert trước khi chạy.

### ─── PHASE 3: THỰC THI (THEO FILE .MD) ────────────

Sau khi tester xác nhận, thực thi **chính xác** theo nội dung trong file `.md` đã review:

1. Đọc lại file `.md` để lấy nội dung cuối cùng (tester có thể đã sửa đổi).
2. Trích xuất: Các bước thực hiện, Kết quả mong đợi, Điều kiện trước khi test.
3. Với mỗi test case (chỉ lọc những TC ID đã chọn):
   a. Dùng `browser_subagent` thực thi **đúng từng bước** trong file `.md`.
   b. **PHẢI** bật chức năng quay video (recording) cho toàn bộ quá trình thực hiện TC đó. KHÔNG dùng ảnh chụp màn hình đơn lẻ.
   c. Lưu video với định dạng ghi lại toàn bộ thao tác từ đầu đến cuối của TC.
   d. Cập nhật kết quả ("Kết quả thực tế" và "Bằng chứng video") trực tiếp vào file `.md` ngay lập tức.

### ─── PHASE 4: BÁO CÁO ĐƠN GIẢN ──────────────────

Sau khi kết thúc, tạo báo cáo tại `tests/reports/report-{YYYYMMDD-HHmm}.md`.

**Yêu cầu báo cáo:**
- Ngôn ngữ đơn giản, dễ hiểu cho tất cả mọi người (không dùng từ quá kỹ thuật).
- Có bảng tổng hợp rõ ràng: Bao nhiêu đạt, bao nhiêu lỗi.
- Với các lỗi: Ghi rõ "Bước bị lỗi", "Thực tế thấy gì" và "Lẽ ra phải thế nào".
- Luôn đính kèm ảnh/video minh chứng trực tiếp dưới mỗi lỗi.
- Đưa ra danh sách các vấn đề cần sửa đổi ngay lập tức.

---

## Lưu Ý Quan Trọng

- **PHẢI** dừng ở Phase 2 và chờ tester xác nhận trước khi chạy
- **PHẢI** ghi lại toàn bộ quá trình test bằng **Video Playback** (recording) cho mỗi test case. KHÔNG dùng ảnh chụp đơn lẻ.
- **KHÔNG** bỏ qua test case mà không có lý do
- **PHẢI** cập nhật file `.md` kết quả trong real-time sau mỗi test
- Nếu app chưa chạy hoặc URL không tồn tại → báo lỗi và dừng

---

## Suggested Next Steps

| Command | Description |
|---------|-------------|
| `/ck-debug` | Debug lỗi phát hiện trong test |
| `/ck-fix` | Fix bug phát hiện |
| `/ck-git` | Commit test results |

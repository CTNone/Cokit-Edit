---
name: manual-tester
description: 'Convert Excel test case file (.xlsx) to Markdown test plan, pause for tester review, execute tests step-by-step with screenshot/video evidence, then produce a final report.'
---

# Manual Tester Skill

Quy trình kiểm thử thủ công: **Excel → Markdown → Review → Thực thi → Báo cáo**

```
[1] Kiểm tra file input (.xlsx hoặc .md)
[2] DỪNG — tester review và chọn danh sách TC cần thực thi (tất cả hoặc một phần)
[3] Đọc danh sách đã chọn từ .md → thực thi lần lượt → so sánh Kết quả thực tế với Kết quả mong đợi
[4] Cập nhật kết quả vào .md ngay lập tức → tạo báo cáo với minh chứng video
```

---

## GIAI ĐOẠN 1 — Chuẩn bị Test Plan

### Bước 1.1 — Xử lý file input

- **Trường hợp file .xlsx:** Chạy script để tạo file `.md`.
  ```powershell
  python ".agents/skills/manual-tester/scripts/xlsx_to_md.py" "<path>.xlsx"
  ```
- **Trường hợp file .md:** Sử dụng luôn file này.

Agent tự động nhận diện danh sách TC ID có trong file.

---

## GIAI ĐOẠN 2 — Review & Lọc Test Case (BẮT BUỘC)

Sau khi có file `.md`, Agent phải hỏi ý kiến tester để xác định tập hợp TC cần chạy:

```
📋 File test: <tên file .md>
📊 Đã tìm thấy <N> test case.

Lựa chọn của bạn:
- [1] Chạy toàn bộ <N> TC
- [2] Chỉ chạy các TC sau: (Nêu danh sách ID cách nhau bằng dấu phẩy)
- [3] Tôi cần sửa file .md trước
```

Nếu tester chọn chạy 1 phần (ví dụ: `TC-001, TC-003`) -> Agent chỉ được thực hiện những TC này trong Phase 3.

---

## GIAI ĐOẠN 3 — Thực thi test theo file .md

**Nguyên tắc quan trọng:**
- Đọc file `.md` → lấy danh sách test case theo thứ tự trong file
- **NGHIÊM CẤM VƯỢT QUYỀN:** Chỉ thực hiện chính xác những gì ghi trong file. 
  * Ví dụ: Nếu bước 1 là "Đăng nhập" và bị lỗi do tài khoản chưa đăng ký, Agent PHẢI báo lỗi và dừng tại đó. KHÔNG được tự ý "vượt qua" bằng cách tự đi đăng ký tài khoản rồi quay lại đăng nhập.
- **SO SÁNH KẾT QUẢ:** Kết quả thực tế phải được so sánh trực tiếp với "Kết quả mong đợi" để đưa ra kết luận ĐẠT/KHÔNG ĐẠT.
- Ghi lại bằng chứng **sau mỗi test** (không gộp)
- Cập nhật kết quả vào bảng ngay sau khi chạy xong từng test

### Bước 3.1 — Đọc và chuẩn bị

Trước khi bắt đầu:
1. Đọc toàn bộ file `.md`
2. Xác nhận URL ứng dụng cần test (hỏi tester nếu chưa có)
3. Lấy danh sách test case theo thứ tự xuất hiện trong file

### Bước 3.2 — Thực thi từng test case

Với **mỗi test case**, dùng `browser_subagent` với thông tin lấy trực tiếp từ file `.md`:

**Tên recording:** `tc-{mã tc}-{slug-tên-test}` (ví dụ: `tc-001-dang-ky-tai-khoan`)

**Nội dung task cho browser_subagent:**
```
Thực thi test case: {Mã TC} — {Tên test}

URL ứng dụng: {URL}
BẮT BUỘC: Quay video toàn bộ quá trình thực hiện TC này.

Điều kiện trước khi test:
{Điều kiện — lấy nguyên từ file .md}

Các bước thực hiện (thực hiện chính xác từng bước):
{Các bước — lấy nguyên từ file .md}

Kết quả mong đợi:
{Kết quả — lấy nguyên từ file .md}

Sau khi thực hiện xong:
1. Kết thúc và lưu video playback (recording).
2. So sánh hiện tượng quan sát được với "Kết quả mong đợi".
3. Trả về: ĐẠT hoặc KHÔNG ĐẠT.
4. Nếu KHÔNG ĐẠT: Mô tả chính xác bước nào gặp lỗi và sự khác biệt so với kết quả mong đợi.
5. **CẤM:** Không được tự ý sửa lỗi hệ thống hoặc thực hiện các bước không có trong test case để "cố bám trụ" cho xong test.
```

### Bước 3.3 — Cập nhật kết quả video sau mỗi test

Sau khi chạy xong mỗi test case, cập nhật kết quả vào file `.md`:

**1. Trong phần chi tiết test case:**
```
**Kết quả thực tế:** Đạt / Không đạt — [mô tả ngắn]

**Bằng chứng video:** [Xem video recording](./tests/recordings/tc-001-dang-ky.webp)
```

**2. Trong bảng Kết Quả cuối file:**
```
| TC-001 | Đăng ký tài khoản | ✅ Đạt | [Video](./tests/recordings/tc-001.webp) | - |
```

**Ký hiệu kết quả:**
| Ký hiệu | Nghĩa |
|---------|-------|
| ✅ Đạt | Test pass — đúng như mong đợi |
| ❌ Không đạt | Test fail — sai kết quả |
| ⚠️ Bị chặn | Có lỗi trước đó cản không chạy được |
| ⏭️ Bỏ qua | Không chạy (ghi rõ lý do) |

---

## GIAI ĐOẠN 4 — Tạo báo cáo kết quả

Sau khi chạy hết tất cả test case, tạo file báo cáo.

**Đường dẫn:** `tests/reports/report-{YYYYMMDD-HHmm}.md`

### Mẫu báo cáo

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
| TC-001 | Đăng ký tài khoản | ![xem](./recordings/tc-001.webp) |

---

## Các Test Không Đạt ❌

### TC-{ID}: {Tên test}

- **Bước bị lỗi:** Bước {N}
- **Kết quả thực tế:** {mô tả điều gì xảy ra}
- **Kết quả mong đợi:** {copy từ file .md}
- **Bằng chứng:** ![xem](./recordings/tc-xxx.webp)

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

## Chuẩn chất lượng

- Không bỏ qua test case mà không ghi rõ lý do
- Luôn có bằng chứng (tối thiểu screenshot) cho mỗi test
- Cập nhật kết quả ngay sau khi chạy xong từng test — không gộp
- Mô tả lỗi phải cụ thể: bước nào, điều gì xảy ra, sai ở đâu

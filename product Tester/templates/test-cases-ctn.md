# Kế Hoạch Kiểm Thử

**Nguồn file:** test-cases-ctn.xlsx
**Ngày tạo/cập nhật:** 17:06:13 10/4/2026
**Tổng số test case:** 3
**Ứng dụng đích:** https://ctnone.github.io/web-profile/

---

## Hướng Dẫn Review

Trước khi chạy test, tester vui lòng kiểm tra:

- [ ] Số lượng test case đúng với file Excel gốc
- [ ] Nội dung từng bước rõ ràng, đủ thông tin
- [ ] Kết quả mong đợi cụ thể và có thể đo lường được
- [ ] Thứ tự thực hiện hợp lý

Sau khi kiểm tra xong, xác nhận để bắt đầu chạy test.

---

### TC-01 — Hiển thị nút

- **Mô tả:** Check if the website can be opened
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [GOTO] "website"

**Kết quả mong đợi:**
- Dowload button can be see at the top of menu

**Kết quả thực tế:** Nội dung thực tế khớp với kết quả mong đợi (Tìm thấy: "dowload"). URL hiện tại: `https://ctnone.github.io/web-profile/`.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260410_170536/cases/tc-01/tc-01.png)
- [Video](../runs/run_20260410_170536/cases/tc-01/tc-01.webm)

---

### TC-02 — Check icon button

- **Mô tả:** Check if the dowload button can be changes
- **Trạng thái:** ❌ Không đạt

**Các bước thực hiện:**
1. [GOTO] "website"
2. [HOVER] "dowload button"

**Kết quả mong đợi:**
- the button changes the color and effect (shadow)

**Kết quả thực tế:** Chưa có rule assert phù hợp để chứng minh expected result. URL hiện tại: `https://ctnone.github.io/web-profile/`. Nội dung hiển thị: Chu Thân Nhất.
Giới thiệu
Học tập
Kỹ năng
Dự án
Giải thưởng
Ngoại khóa
CV
Hello, I'm
Chu Thân Nhất
Fresher AI Engineer

Xin chào, tôi là Nhất, FRESHER AI ENGINEER từ Đại học Công Nghệ. Tôi luôn sẵn sàng tham gia các dự án với các nhiệm vụ: data cleaning; annotation; fine-tuning mô hình; triển khai prototype; RAG chatbot; sửa lỗi và tối ưu mô hình.

Download CV
Học tập & Công tác
2022 - 2026
Kỹ sư Trí tuệ Nhân tạo
Đại học Công Nghệ

GPA: 2.9/4.0. Tập trung vào Computer Vision, NLP và Web.

2019 -...

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260410_170536/cases/tc-02/tc-02.png)
- [Video](../runs/run_20260410_170536/cases/tc-02/tc-02.webm)

**Ghi chú kết quả:** Cần bổ sung assertion rule cho expected result này.

---

### TC-3 — Check icon button

- **Mô tả:** Check if the dowload button can be changes and dowload
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [HOVER] "dowload button"
2. [CLICK] "button dowload"

**Kết quả mong đợi:**
- a website can be open

**Kết quả thực tế:** Nội dung thực tế khớp với kết quả mong đợi (Tìm thấy: "website"). URL hiện tại: `https://ctnone.github.io/web-profile/`.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260410_170536/cases/tc-3/tc-3.png)
- [Video](../runs/run_20260410_170536/cases/tc-3/tc-3.webm)

---

---

## Bảng Kết Quả

*(Điền kết quả sau khi chạy từng test)*

| Mã TC | Tên Test | Kết Quả | Bằng Chứng | Ghi Chú |
|-------|----------|---------|------------|---------|
| TC-01 | Hiển thị nút | ✅ Đạt | [Ảnh](../runs/run_20260410_170536/cases/tc-01/tc-01.png) / [Video](../runs/run_20260410_170536/cases/tc-01/tc-01.webm) | - |
| TC-02 | Check icon button | ❌ Không đạt | [Ảnh](../runs/run_20260410_170536/cases/tc-02/tc-02.png) / [Video](../runs/run_20260410_170536/cases/tc-02/tc-02.webm) | Cần bổ sung assertion rule cho expected result này. |
| TC-3 | Check icon button | ✅ Đạt | [Ảnh](../runs/run_20260410_170536/cases/tc-3/tc-3.png) / [Video](../runs/run_20260410_170536/cases/tc-3/tc-3.webm) | - |

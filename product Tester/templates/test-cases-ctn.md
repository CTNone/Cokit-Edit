# Kế Hoạch Kiểm Thử

**Nguồn file:** test-cases-ctn.xlsx
**Ngày tạo/cập nhật:** 17:08:24 9/4/2026
**Tổng số test case:** 10
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

### TC-01 — Open Website

- **Mô tả:** Check if the website can be opened
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Enter URL: https://ctnone.github.io/web-profile/
2. Press Enter

**Kết quả mong đợi:**
- The website loads and shows the Home page

**Kết quả thực tế:** Trang được tải thành công tại `https://ctnone.github.io/web-profile/` và giao diện hiển thị đầy đủ.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260409_170749/cases/tc-01/tc-01.png)
- [Video](../runs/run_20260409_170749/cases/tc-01/tc-01.webm)

---

### TC-02 — Avatar Image

- **Mô tả:** Check if the profile picture is visible
- **Trạng thái:** ❌ Không đạt

**Các bước thực hiện:**
1. Look at the Profile/Hero section

**Kết quả mong đợi:**
- The avatar image is displayed clearly (not broken)

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
- [Ảnh chụp](../runs/run_20260409_170749/cases/tc-02/tc-02.png)
- [Video](../runs/run_20260409_170749/cases/tc-02/tc-02.webm)

**Ghi chú kết quả:** Cần bổ sung assertion rule cho expected result này.

---

### TC-03 — Menu Click

- **Mô tả:** Check if the Menu buttons work
- **Trạng thái:** ❌ Không đạt

**Các bước thực hiện:**
1. Click on "About" or "Dự án" in the menu

**Kết quả mong đợi:**
- The page scrolls down to the selected section

**Kết quả thực tế:** Trang chưa được cuộn xuống. Vị trí hiện tại: 0px.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260409_170749/cases/tc-03/tc-03.png)
- [Video](../runs/run_20260409_170749/cases/tc-03/tc-03.webm)

---

### TC-04 — Title Text

- **Mô tả:** Check the main heading (Name/Job)
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Read the main text on the Home page

**Kết quả mong đợi:**
- Your name (e.g., "CTN") and job title are correct

**Kết quả thực tế:** Quan sát được đúng nội dung mong đợi trên trang. URL hiện tại: `https://ctnone.github.io/web-profile/`.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260409_170749/cases/tc-04/tc-04.png)
- [Video](../runs/run_20260409_170749/cases/tc-04/tc-04.webm)

---

### TC-05 — GitHub Link

- **Mô tả:** Check the GitHub icon/link
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Click on the GitHub icon

**Kết quả mong đợi:**
- A new tab opens your GitHub profile page

**Kết quả thực tế:** Nội dung thực tế khớp với kết quả mong đợi (Tìm thấy: "github"). URL hiện tại: `https://ctnone.github.io/web-profile/`.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260409_170749/cases/tc-05/tc-05.png)
- [Video](../runs/run_20260409_170749/cases/tc-05/tc-05.webm)

---

### TC-06 — LinkedIn Link

- **Mô tả:** Check the LinkedIn icon/link
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Click on the LinkedIn icon

**Kết quả mong đợi:**
- A new tab opens your LinkedIn profile page

**Kết quả thực tế:** Nội dung thực tế khớp với kết quả mong đợi (Tìm thấy: "linkedin"). URL hiện tại: `https://ctnone.github.io/web-profile/`.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260409_170749/cases/tc-06/tc-06.png)
- [Video](../runs/run_20260409_170749/cases/tc-06/tc-06.webm)

---

### TC-07 — Facebook Link

- **Mô tả:** Check the Facebook icon/link
- **Trạng thái:** ❌ Không đạt

**Các bước thực hiện:**
1. Click on the Facebook icon

**Kết quả mong đợi:**
- A new tab opens your Facebook profile page

**Kết quả thực tế:** Bước 1 gặp lỗi [Selector fail]: Không tìm thấy element để click: Facebook

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260409_170749/cases/tc-07/tc-07.png)
- [Video](../runs/run_20260409_170749/cases/tc-07/tc-07.webm)

**Ghi chú kết quả:** Selector fail

---

### TC-08 — Scroll Down

- **Mô tả:** Check if the user can scroll
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Use the mouse wheel to scroll down

**Kết quả mong đợi:**
- The page moves smoothly to the bottom

**Kết quả thực tế:** Đã thực hiện cuộn trang thành công. Vị trí hiện tại: 4038.39990234375px.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260409_170749/cases/tc-08/tc-08.png)
- [Video](../runs/run_20260409_170749/cases/tc-08/tc-08.webm)

---

### TC-09 — Contact Email

- **Mô tả:** Check if the email link works
- **Trạng thái:** ❌ Không đạt

**Các bước thực hiện:**
1. Find and click on the email address/icon

**Kết quả mong đợi:**
- The mail app (Outlook/Gmail) opens to compose a new mail

**Kết quả thực tế:** Bước 1 gặp lỗi [Selector fail]: Không tìm thấy element để click: Find and email address/

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260409_170749/cases/tc-09/tc-09.png)
- [Video](../runs/run_20260409_170749/cases/tc-09/tc-09.webm)

**Ghi chú kết quả:** Selector fail

---

### TC-10 — Mobile View

- **Mô tả:** Check the website on a phone
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Open the link on a smartphone browser

**Kết quả mong đợi:**
- The text and images fit the screen (no horizontal scrolling)

**Kết quả thực tế:** Giao diện đã được kiểm tra trên mobile viewport. Bằng chứng video cho thấy độ fit.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260409_170749/cases/tc-10/tc-10.png)
- [Video](../runs/run_20260409_170749/cases/tc-10/tc-10.webm)

---

---

## Bảng Kết Quả

*(Điền kết quả sau khi chạy từng test)*

| Mã TC | Tên Test | Kết Quả | Bằng Chứng | Ghi Chú |
|-------|----------|---------|------------|---------|
| TC-01 | Open Website | ✅ Đạt | [Ảnh](../runs/run_20260409_170749/cases/tc-01/tc-01.png) / [Video](../runs/run_20260409_170749/cases/tc-01/tc-01.webm) | - |
| TC-02 | Avatar Image | ❌ Không đạt | [Ảnh](../runs/run_20260409_170749/cases/tc-02/tc-02.png) / [Video](../runs/run_20260409_170749/cases/tc-02/tc-02.webm) | Cần bổ sung assertion rule cho expected result này. |
| TC-03 | Menu Click | ❌ Không đạt | [Ảnh](../runs/run_20260409_170749/cases/tc-03/tc-03.png) / [Video](../runs/run_20260409_170749/cases/tc-03/tc-03.webm) | - |
| TC-04 | Title Text | ✅ Đạt | [Ảnh](../runs/run_20260409_170749/cases/tc-04/tc-04.png) / [Video](../runs/run_20260409_170749/cases/tc-04/tc-04.webm) | - |
| TC-05 | GitHub Link | ✅ Đạt | [Ảnh](../runs/run_20260409_170749/cases/tc-05/tc-05.png) / [Video](../runs/run_20260409_170749/cases/tc-05/tc-05.webm) | - |
| TC-06 | LinkedIn Link | ✅ Đạt | [Ảnh](../runs/run_20260409_170749/cases/tc-06/tc-06.png) / [Video](../runs/run_20260409_170749/cases/tc-06/tc-06.webm) | - |
| TC-07 | Facebook Link | ❌ Không đạt | [Ảnh](../runs/run_20260409_170749/cases/tc-07/tc-07.png) / [Video](../runs/run_20260409_170749/cases/tc-07/tc-07.webm) | Selector fail |
| TC-08 | Scroll Down | ✅ Đạt | [Ảnh](../runs/run_20260409_170749/cases/tc-08/tc-08.png) / [Video](../runs/run_20260409_170749/cases/tc-08/tc-08.webm) | - |
| TC-09 | Contact Email | ❌ Không đạt | [Ảnh](../runs/run_20260409_170749/cases/tc-09/tc-09.png) / [Video](../runs/run_20260409_170749/cases/tc-09/tc-09.webm) | Selector fail |
| TC-10 | Mobile View | ✅ Đạt | [Ảnh](../runs/run_20260409_170749/cases/tc-10/tc-10.png) / [Video](../runs/run_20260409_170749/cases/tc-10/tc-10.webm) | - |

# Kế Hoạch Kiểm Thử

**Nguồn file:** test-cases.xlsx
**Ngày tạo/cập nhật:** 13:47:07 9/4/2026
**Tổng số test case:** 5
**Ứng dụng đích:** http://localhost:3000

---

## Hướng Dẫn Review

Trước khi chạy test, tester vui lòng kiểm tra:

- [ ] Số lượng test case đúng với file Excel gốc
- [ ] Nội dung từng bước rõ ràng, đủ thông tin
- [ ] Kết quả mong đợi cụ thể và có thể đo lường được
- [ ] Thứ tự thực hiện hợp lý

Sau khi kiểm tra xong, xác nhận để bắt đầu chạy test.

---

### TC-01 — Check Link

- **Mô tả:** Verify that the website link is accessible
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Open browser
2. Navigate to http://localhost:3000

**Kết quả mong đợi:**
- The website interface is fully loaded and displayed correctly

**Kết quả thực tế:** Trang được tải thành công tại `http://localhost:3000/login.html` và giao diện hiển thị đầy đủ.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260409_134655/cases/tc-01/tc-01.png)
- [Video](../runs/run_20260409_134655/cases/tc-01/tc-01.webm)

---

### TC-02 — User Login

- **Mô tả:** Verify that a user can login with valid credentials
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Go to Login page
2. Enter username: "ctn"
3. Enter password: "12345678"
4. Click Login button

**Kết quả mong đợi:**
- User is successfully redirected to the dashboard

**Kết quả thực tế:** Người dùng được chuyển tới dashboard tại `http://localhost:3000/index.html`.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260409_134655/cases/tc-02/tc-02.png)
- [Video](../runs/run_20260409_134655/cases/tc-02/tc-02.webm)

---

### TC-03 — User Registration

- **Mô tả:** Verify that a user can register a new account
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Click Register button
2. Enter username: "tester111"
3. Enter email: "tester111@gmail.com"
4. Enter password: "123456789"
5. Click Submit

**Kết quả mong đợi:**
- Registration is successful and user is redirected to the Login page

**Kết quả thực tế:** Đăng ký thành công và chuyển về trang đăng nhập tại `http://localhost:3000/login.html`.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260409_134655/cases/tc-03/tc-03.png)
- [Video](../runs/run_20260409_134655/cases/tc-03/tc-03.webm)

---

### TC-04 — User Logout

- **Mô tả:** Verify that a user can logout from the system
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Login with credentials from TC-03
2. Click Logout button

**Kết quả mong đợi:**
- User is logged out and redirected back to the landing page

**Kết quả thực tế:** Logout thành công và ứng dụng chuyển về `http://localhost:3000/login.html`.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260409_134655/cases/tc-04/tc-04.png)
- [Video](../runs/run_20260409_134655/cases/tc-04/tc-04.webm)

---

### TC-05 — Forgot Password

- **Mô tả:** Verify the "Forgot Password" functionality
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Click "Forgot Password"
2. Enter email used in TC-03
3. Click "Send Reset Link"

**Kết quả mong đợi:**
- System displays: "Reset link sent to email (check console)"

**Kết quả thực tế:** Quan sát được đúng nội dung mong đợi trên trang. URL hiện tại: `http://localhost:3000/forgot-password.html`.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260409_134655/cases/tc-05/tc-05.png)
- [Video](../runs/run_20260409_134655/cases/tc-05/tc-05.webm)

---

---

## Bảng Kết Quả

*(Điền kết quả sau khi chạy từng test)*

| Mã TC | Tên Test | Kết Quả | Bằng Chứng | Ghi Chú |
|-------|----------|---------|------------|---------|
| TC-01 | Check Link | ✅ Đạt | [Ảnh](../runs/run_20260409_134655/cases/tc-01/tc-01.png) / [Video](../runs/run_20260409_134655/cases/tc-01/tc-01.webm) | - |
| TC-02 | User Login | ✅ Đạt | [Ảnh](../runs/run_20260409_134655/cases/tc-02/tc-02.png) / [Video](../runs/run_20260409_134655/cases/tc-02/tc-02.webm) | - |
| TC-03 | User Registration | ✅ Đạt | [Ảnh](../runs/run_20260409_134655/cases/tc-03/tc-03.png) / [Video](../runs/run_20260409_134655/cases/tc-03/tc-03.webm) | - |
| TC-04 | User Logout | ✅ Đạt | [Ảnh](../runs/run_20260409_134655/cases/tc-04/tc-04.png) / [Video](../runs/run_20260409_134655/cases/tc-04/tc-04.webm) | - |
| TC-05 | Forgot Password | ✅ Đạt | [Ảnh](../runs/run_20260409_134655/cases/tc-05/tc-05.png) / [Video](../runs/run_20260409_134655/cases/tc-05/tc-05.webm) | - |

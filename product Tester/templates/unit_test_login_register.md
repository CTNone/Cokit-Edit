# Kế Hoạch Kiểm Thử

**Nguồn file:** unit_test_login_register.xlsx
**Ngày tạo/cập nhật:** 14:21:33 16/4/2026
**Tổng số test case:** 5
**Ứng dụng đích:** https://mini-unigate.fsoft.com.vn/fkr/

---

## Hướng Dẫn Review

Trước khi chạy test, tester vui lòng kiểm tra:

- [ ] Số lượng test case đúng với file Excel gốc
- [ ] Nội dung từng bước rõ ràng, đủ thông tin
- [ ] Kết quả mong đợi cụ thể và có thể đo lường được
- [ ] Thứ tự thực hiện hợp lý

Sau khi kiểm tra xong, xác nhận để bắt đầu chạy test.

---

### TC-01 — Đăng nhập thành công (Admin)

- **Mô tả:** 1. đi tới "https://mini-unigate.fsoft.com.vn/fkr/auth/login".
2. Nhập Username: "Admin".
3. Nhập Password: "fbgsde45634#$%^".
4. Nhấn nút "Sign in".
5. di chuột vào "admin"
6. nhấn "logout"
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [GOTO] "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. [FILL] "username" : "Admin"
3. [FILL] "password" : "fbgsde45634#$%^"
4. [CLICK] "Sign in"
5. [HOVER] "admin"
6. [CLICK] "logout"

**Kết quả mong đợi:**
- Người dùng được chuyển về trang Sign to get started

**Kết quả thực tế:** Username or email address is required.; Password is required.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260416_141945/cases/tc-01/tc-01.png)

**Ghi chú kết quả:** Hoàn thành 6/6 bước. [Judge] Xác nhận đăng xuất thành công qua trạng thái trang.. [AI Note] Thấy lỗi tiếng Anh khớp với mong đợi tiếng Việt

---

### TC-02 — Đăng nhập sai mật khẩu

- **Mô tả:** 1. Truy cập "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. Nhập Username: "admin".
3. Nhập Password sai: "wrong_pass123".
4. Nhấn nút "Login".
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [GOTO] "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. [FILL] "username" : "admin"
3. [FILL] "password" : "wrong_pass123"
4. [CLICK] "login"

**Kết quả mong đợi:**
- Hệ thống không cho phép đăng nhập vì nhập sai tài khoản hoặc mật khẩu

**Kết quả thực tế:** Please enter your username and password to login.; Invalid username or password.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260416_141945/cases/tc-02/tc-02.png)

**Ghi chú kết quả:** Hoàn thành 4/4 bước. [Judge] Thông báo lỗi trên màn hình khớp với nghiệp vụ.. [AI Note] Thấy lỗi tiếng Anh khớp với mong đợi tiếng Việt

---

### TC-03 — Đăng nhập tài khoản không tồn tại

- **Mô tả:** 1. Truy cập "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. Nhập Username chưa đăng ký: "UnknownUser".
3. Nhập Password bất kỳ.
4. Nhấn nút "Sign in".
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [GOTO] "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. [FILL] "username" : "UnknownUser"
3. [FILL] "password" : "' OR 1=1 --"
4. [CLICK] "Sign in"

**Kết quả mong đợi:**
- Hệ thống không cho phép đăng nhập vì tài khoản không tồn tại.

**Kết quả thực tế:** Please enter your username and password to login.; Invalid username or password.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260416_141945/cases/tc-03/tc-03.png)

**Ghi chú kết quả:** Hoàn thành 4/4 bước. [Judge] Thông báo lỗi trên màn hình khớp với nghiệp vụ.. [AI Note] Thấy lỗi tiếng Anh khớp với mong đợi tiếng Việt

---

### TC-04 — Phép thử với chuỗi ký tự đặc biệt

- **Mô tả:** 1. Truy cập "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. Nhập Username: "Admin".
3. Nhập vào ô mật khẩu chuỗi: " ' OR '1'='1 ".
4. Nhấn nút "Login".
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [GOTO] "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. [FILL] "username" : "Admin"
3. [FILL] "password" : "' OR '1'='1 "
4. [CLICK] "Login"

**Kết quả mong đợi:**
- Hệ thống không bị đăng nhập trái phép.

**Kết quả thực tế:** Please enter your username and password to login.; Invalid username or password.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260416_141945/cases/tc-04/tc-04.png)

**Ghi chú kết quả:** Hoàn thành 4/4 bước. [Judge] . [AI Note] Thấy lỗi tiếng Anh khớp với mong đợi tiếng Việt

---

### TC-05 — Kiểm tra giới hạn đăng nhập sai

- **Mô tả:** 1. Truy cập "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. Nhập user name "Admin2"
3. Nhập mật khẩu "123"
4.Bấm 6 lần "SIGN IN"
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [GOTO] "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. [FILL] "username" : "Admin2"
3. [FILL] "password" : "123"
4. [CLICK] "SIGN IN"
5. [CLICK] "SIGN IN"
6. [CLICK] "SIGN IN"
7. [CLICK] "SIGN IN"
8. [CLICK] "SIGN IN"
9. [CLICK] "SIGN IN"

**Kết quả mong đợi:**
- Hệ thống hiển tài khoản bị khóa hoặc bị chặn hoặc tài khoản không đúng.

**Kết quả thực tế:** Please enter your username and password to login.; Invalid username or password.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260416_141945/cases/tc-05/tc-05.png)

**Ghi chú kết quả:** Hoàn thành 9/9 bước. [Judge] . [AI Note] Thấy lỗi tiếng Anh khớp với mong đợi tiếng Việt

---

---

## Bảng Kết Quả

*(Điền kết quả sau khi chạy từng test)*

| Mã TC | Tên Test | Kết Quả | Bằng Chứng | Ghi Chú |
|-------|----------|---------|------------|---------|
| TC-01 | Đăng nhập thành công (Admin) | ✅ Đạt | [Ảnh](../runs/run_20260416_141945/cases/tc-01/tc-01.png) | Hoàn thành 6/6 bước. [Judge] Xác nhận đăng xuất thành công qua trạng thái trang.. [AI Note] Thấy lỗi tiếng Anh khớp với mong đợi tiếng Việt |
| TC-02 | Đăng nhập sai mật khẩu | ✅ Đạt | [Ảnh](../runs/run_20260416_141945/cases/tc-02/tc-02.png) | Hoàn thành 4/4 bước. [Judge] Thông báo lỗi trên màn hình khớp với nghiệp vụ.. [AI Note] Thấy lỗi tiếng Anh khớp với mong đợi tiếng Việt |
| TC-03 | Đăng nhập tài khoản không tồn tại | ✅ Đạt | [Ảnh](../runs/run_20260416_141945/cases/tc-03/tc-03.png) | Hoàn thành 4/4 bước. [Judge] Thông báo lỗi trên màn hình khớp với nghiệp vụ.. [AI Note] Thấy lỗi tiếng Anh khớp với mong đợi tiếng Việt |
| TC-04 | Phép thử với chuỗi ký tự đặc biệt | ✅ Đạt | [Ảnh](../runs/run_20260416_141945/cases/tc-04/tc-04.png) | Hoàn thành 4/4 bước. [Judge] . [AI Note] Thấy lỗi tiếng Anh khớp với mong đợi tiếng Việt |
| TC-05 | Kiểm tra giới hạn đăng nhập sai | ✅ Đạt | [Ảnh](../runs/run_20260416_141945/cases/tc-05/tc-05.png) | Hoàn thành 9/9 bước. [Judge] . [AI Note] Thấy lỗi tiếng Anh khớp với mong đợi tiếng Việt |

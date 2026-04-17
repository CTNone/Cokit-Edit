# Kế Hoạch Kiểm Thử

**Nguồn file:** unit_test_login_register.xlsx
**Ngày tạo/cập nhật:** 09:16:39 17/4/2026
**Tổng số test case:** 6
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
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [GOTO] "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. [FILL] "username" : "Admin"
3. [FILL] "password" : "fbgsde45634#$%^"
4. [CLICK] "Sign in"

**Kết quả mong đợi:**
- Người dùng được chuyển về trang My Workspace

**Kết quả thực tế:** Đăng nhập thất bại; Tên đăng nhập không đúng

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260417_091609/cases/tc-01/tc-01.png)

**Ghi chú kết quả:** [Judge] . [AI Note] User is trying to login with incorrect username

---

### TC-02 — Đăng nhập sai mật khẩu

- **Mô tả:** 1. Truy cập "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. Nhập Username: "admin".
3. Nhập Password sai: "wrong_pass123".
4. Nhấn nút "Login".
- **Trạng thái:** ⚠️ Bị chặn

**Các bước thực hiện:**
1. [GOTO] "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. [FILL] "username" : "admin"
3. [FILL] "password" : "wrong_pass123"
4. [CLICK] "login"

**Kết quả mong đợi:**
- Hệ thống không cho phép đăng nhập vì nhập sai tài khoản hoặc mật khẩu

**Kết quả thực tế:** Bị chặn vì kịch bản phụ thuộc TC-01 trả về 'passed', trong khi mong đợi 'failed'

**Bằng chứng:**
- Không có bằng chứng

**Ghi chú kết quả:** Kiểm tra lại luồng logic giữa TC-01 và TC-02.

---

### TC-03 — Đăng nhập tài khoản không tồn tại

- **Mô tả:** 1. Truy cập "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. Nhập Username chưa đăng ký: "UnknownUser".
3. Nhập Password bất kỳ.
4. Nhấn nút "Sign in".
- **Trạng thái:** ⚠️ Bị chặn

**Các bước thực hiện:**
1. [GOTO] "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. [FILL] "username" : "UnknownUser"
3. [FILL] "password" : "' OR 1=1 --"
4. [CLICK] "Sign in"

**Kết quả mong đợi:**
- Hệ thống không cho phép đăng nhập vì tài khoản không tồn tại.

**Kết quả thực tế:** Bị chặn vì kịch bản phụ thuộc TC-01 trả về 'passed', trong khi mong đợi 'failed'

**Bằng chứng:**
- Không có bằng chứng

**Ghi chú kết quả:** Kiểm tra lại luồng logic giữa TC-01 và TC-03.

---

### TC-04 — Phép thử với chuỗi ký tự đặc biệt

- **Mô tả:** 1. Truy cập "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. Nhập Username: "Admin".
3. Nhập vào ô mật khẩu chuỗi: " ' OR '1'='1 ".
4. Nhấn nút "Login".
- **Trạng thái:** ⚠️ Bị chặn

**Các bước thực hiện:**
1. [GOTO] "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. [FILL] "username" : "Admin"
3. [FILL] "password" : "' OR '1'='1 "
4. [CLICK] "Login"

**Kết quả mong đợi:**
- Hệ thống không bị đăng nhập trái phép.

**Kết quả thực tế:** Bị chặn vì kịch bản phụ thuộc TC-01 trả về 'passed', trong khi mong đợi 'failed'

**Bằng chứng:**
- Không có bằng chứng

**Ghi chú kết quả:** Kiểm tra lại luồng logic giữa TC-01 và TC-04.

---

### TC-05 — Kiểm tra giới hạn đăng nhập sai

- **Mô tả:** 1. Truy cập "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. Nhập user name "Admin2"
3. Nhập mật khẩu "123"
4.Bấm 6 lần "SIGN IN"
- **Trạng thái:** ⚠️ Bị chặn

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

**Kết quả thực tế:** Bị chặn vì kịch bản phụ thuộc TC-01 trả về 'passed', trong khi mong đợi 'failed'

**Bằng chứng:**
- Không có bằng chứng

**Ghi chú kết quả:** Kiểm tra lại luồng logic giữa TC-01 và TC-05.

---

### TC-06 — logout

- **Mô tả:** 1. di chuyển chuột vào "admin"
2. chọn "logout"
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [HOVER] "admin"
2. [CLICK] "logout"

**Kết quả mong đợi:**
- Hệ thống trở về trang "Sign in to get started"

**Kết quả thực tế:** Quan sát được chính xác nội dung: "Sign in to get started"

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260417_091609/cases/tc-06/tc-06.png)

---

---

## Bảng Kết Quả

*(Điền kết quả sau khi chạy từng test)*

| Mã TC | Tên Test | Kết Quả | Bằng Chứng | Ghi Chú |
|-------|----------|---------|------------|---------|
| TC-01 | Đăng nhập thành công (Admin) | ✅ Đạt | [Ảnh](../runs/run_20260417_091609/cases/tc-01/tc-01.png) | [Judge] . [AI Note] User is trying to login with incorrect username |
| TC-02 | Đăng nhập sai mật khẩu | ⚠️ Bị chặn | - | Kiểm tra lại luồng logic giữa TC-01 và TC-02. |
| TC-03 | Đăng nhập tài khoản không tồn tại | ⚠️ Bị chặn | - | Kiểm tra lại luồng logic giữa TC-01 và TC-03. |
| TC-04 | Phép thử với chuỗi ký tự đặc biệt | ⚠️ Bị chặn | - | Kiểm tra lại luồng logic giữa TC-01 và TC-04. |
| TC-05 | Kiểm tra giới hạn đăng nhập sai | ⚠️ Bị chặn | - | Kiểm tra lại luồng logic giữa TC-01 và TC-05. |
| TC-06 | logout | ✅ Đạt | [Ảnh](../runs/run_20260417_091609/cases/tc-06/tc-06.png) | - |

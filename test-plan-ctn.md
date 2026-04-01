# Kế Hoạch Kiểm Thử

**Nguồn file:** test tesrer ctn.xlsx
**Ngày tạo:** 31/03/2026 16:10
**Tổng số test case:** 5

---

## Hướng Dẫn Review

Trước khi chạy test, tester vui lòng kiểm tra:

- [ ] Số lượng test case đúng với file Excel gốc
- [ ] Nội dung từng bước rõ ràng, đủ thông tin
- [ ] Kết quả mong đợi cụ thể và có thể đo lường

Sau khi kiểm tra xong, xác nhận để bắt đầu chạy test.

---

### 1 — Kiểm tra link truy cập web server

- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. mở google
2. Truy cập http://localhost:3000

**Ghi chú:**
- Nếu có lỗi -> kết thúc

**Kết quả thực tế:** ✅ Đạt — Trang được tải thành công và hiển thị trang Login.

**Bằng chứng video:** tests/recordings/tc-1.webm

---

### 2 — Kiểm tra đăng nhập

- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Click nút đăng nhập
2. đăng nhập tên tài khoản tester02
3. và mật khẩu: 12345678

**Ghi chú:**
- Tài khoản chưa tồn tại -> Tiến hành thực hiện TC 3 trước

**Kết quả thực tế:** ✅ Đạt — Đăng nhập thành công với tài khoản tester02.

**Bằng chứng video:** tests/recordings/tc-2.webm

---

### 3 — Kiểm tra đăng ký

- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Click nút đăng ký
2. đăng ký với tài khoản tester02
3. email: tester02@gmail.com
4. mật khẩu: 12345678

**Ghi chú:**
- Tài khoản đã tồn tại -> ghi lỗi và Kết thúc

**Kết quả thực tế:** ✅ Đạt — Hệ thống hiển thị User already exists đúng như ghi chú TC.

**Bằng chứng video:** tests/recordings/tc-3.webm

---

### 4 — Kiểm tra đăng xuất

- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. đăng nhập bằng tài khoản và mật khẩu ở TC 2
2. click logout

**Ghi chú:**
- Có lỗi -> Ghi lỗi và Kết thúc

**Kết quả thực tế:** ✅ Đạt — Logout thành công và quay lại trang Login.

**Bằng chứng video:** tests/recordings/tc-4.webm

---

### 5 — Kiểm tra quên mật khẩu

- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Click Forgot Password
2. Nhập email: tester02@gmail.com

**Ghi chú:**
- Có lỗi -> Ghi lỗi và Kết thúc

**Kết quả thực tế:** ✅ Đạt — Gửi link reset mật khẩu thành công.

**Bằng chứng video:** tests/recordings/tc-5.webm

---

## Bảng Kết Quả

*(Ẩn kết quả sau khi chạy từ test)*

| Mã TC | Tên Test | Kết Quả | Bằng Chứng | Ghi Chú |
|---|---|---|---|---|
| 1 | Truy cập Link | ✅ Đạt | [Video](tests/recordings/tc-1.webm) | OK |
| 2 | Đăng nhập | ✅ Đạt | [Video](tests/recordings/tc-2.webm) | tester02 OK |
| 3 | Đăng ký | ✅ Đạt | [Video](tests/recordings/tc-3.webm) | User already exists |
| 4 | Đăng xuất | ✅ Đạt | [Video](tests/recordings/tc-4.webm) | Logout thành công |
| 5 | Quên mật khẩu | ✅ Đạt | [Video](tests/recordings/tc-5.webm) | Link reset đã gửi |

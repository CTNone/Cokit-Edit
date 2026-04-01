# Kế Hoạch Kiểm Thử

**Nguồn file:** test tesrer ctn.xlsx
**Ngày tạo:** 31/03/2026 16:10
**Tổng số test case:** 5

---

## Hướng Dẫn Review

Trước khi chạy test, tester vui lòng kiểm tra:

- [ ] Số lượng test case đúng với file Excel gốc
- [ ] Nội dung từng bước rõ ràng, đủ thông tin
- [ ] Kết quả mong đợi cụ thể và có thể đo lường được
- [ ] Thứ tự thực hiện hợp lý

Sau khi kiểm tra xong, xác nhận để bắt đầu chạy test.

---

### 1 — Kiểm tra link truy cập web server

- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. mở google
2. Truy cập http://localhost:3000

**Ghi chú:**
- Nếu có lỗi ->kết thúc

**Kết quả thực tế:** Truy cập localhost:3000 thành công sau khi khởi động lại server.

**Bằng chứng video:** [Xem video](./tests/recordings/ctn-tc1.webp)

---

### 2 — Kiểm tra đăng nhập

- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Click nút đăng nhập
2. Đăng nhập tên tài khoản tester02
3. và mật khẩu: 12345678

**Ghi chú:**
- Tài khoản chưa tồn tại -> Tiến hành thực hiện TC 3 trước

**Kết quả thực tế:** Đăng nhập thành công với tài khoản tester02.

**Bằng chứng video:** [Xem video](./tests/recordings/ctn-tc2.webp)

---

### 3 — Kiểm tra đăng ký

- **Trạng thái:** ❌ Không đạt (Theo yêu cầu: User tồn tại -> ghi lỗi)

**Các bước thực hiện:**
1. Click nút đăng ký
2. Đăng ký với tài khoản tester02
3. email. tester02@gmail.com
4. mật khẩu: 12345678

**Ghi chú:**
- Tài khoản đã tồn tại -> ghi lỗi và Kết thúc

**Kết quả thực tế:** Hệ thống hiển thị "User already exists" đúng như ghi chú của TC.

**Bằng chứng video:** [Xem video](./tests/recordings/ctn-tc3.webp)

---

### 4 — Kiểm tra đăng xuất

- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Đăng nhập bằng tài khoản và mật khẩu ở TC 2
2. click logout

**Ghi chú:**
- Có lỗi -> Ghi lỗi và Kết thúc

**Kết quả thực tế:** Logout thành công và quay lại trang Login.

**Bằng chứng video:** [Xem video](./tests/recordings/ctn-tc4.webp)

---

### 5 — Kiểm tra quên mật khẩu

- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Click Forgot Password
2. Nhập email: email từ TC 3

**Ghi chú:**
- Có lỗi -> Ghi lỗi và Kết thúc

**Kết quả thực tế:** Gửi link reset mật khẩu thành công.

**Bằng chứng video:** [Xem video](./tests/recordings/ctn-tc5.webp)

---

---

## Bảng Kết Quả

*(Điền kết quả sau khi chạy từng test)*

| Mã TC | Tên Test | Kết Quả | Bằng Chứng | Ghi Chú |
|-------|----------|---------|------------|---------|
| 1 | Truy cập Link | ✅ Đạt | [Video](./tests/recordings/ctn-tc1.webp) | OK |
| 2 | Đăng nhập | ✅ Đạt | [Video](./tests/recordings/ctn-tc2.webp) | tester02 OK |
| 3 | Đăng ký | ❌ Lỗi | [Video](./tests/recordings/ctn-tc3.webp) | Trùng User |
| 4 | Đăng xuất | ✅ Đạt | [Video](./tests/recordings/ctn-tc4.webp) | OK |
| 5 | Quên mật khẩu | ✅ Đạt | [Video](./tests/recordings/ctn-tc5.webp) | OK |

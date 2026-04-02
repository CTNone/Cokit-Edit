# Kế Hoạch Kiểm Thử

**Nguồn file:** test tesrer ctn.xlsx
**Ngày tạo:** 02/04/2026 15:46
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

### 1 — Mở màn hình

- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. mở google
2. Truy cập http://localhost:3000

**Ghi chú:**
- Nếu có lỗi ->kết thúc testcase

**Kết quả mong đợi:**
- Truy cập thành công vào trang chủ ứng dụng tại localhost:3000.

**Kết quả thực tế:** Trang chủ ứng dụng tải thành công (màn hình login.html hiển thị đúng các trường Username/Password). Đã đối chiếu: Khớp với mong đợi.

**Bằng chứng:** [Xem video recording](./tests/recordings/tc-1.webp)

---

### 2 — Đăng nhập thất bại - Tài khoản không tồn tại

- **Trạng thái:** ❌ Không đạt

**Các bước thực hiện:**
1. Click nút đăng nhập
2. Đăng nhập tên tài khoản:unknown và mật khẩu:12345678

**Ghi chú:**
- Tài khoản chưa tồn tại -> ghi lỗi và kết thúc testcase

**Kết quả mong đợi:**
- Hiển thị giao diện dashboard

**Kết quả thực tế:** Hệ thống hiển thị thông báo lỗi "Invalid credentials". Dashboard không xuất hiện. Đã đối chiếu: KHÔNG khớp với mong đợi (Dashboard). Tuân thủ rule: Không tự ý xử lý data test.

**Bằng chứng:** [Xem video recording](./tests/recordings/tc-2.webp)

---

### 3 — Đăng ký tài khoản mới

- **Trạng thái:** ❌ Không đạt

**Các bước thực hiện:**
1. Click nút đăng ký
2. Đăng ký với tài khoản tester02
3. email. tester02@gmail.com
4. mật khẩu: 12345678

**Ghi chú:**
- Tài khoản đã tồn tại -> ghi lỗi và kết thúc testcase

**Kết quả mong đợi:**
- Đăng ký thành công tài khoản tester02.

**Kết quả thực tế:** Hệ thống hiển thị thông báo "User already exists". Đã đối chiếu: KHÔNG khớp với mong đợi. Tuân thủ rule: Không tự ý xử lý database.

**Bằng chứng:** [Xem video recording](./tests/recordings/tc-3.webp)

---

### 4 — Đăng nhập và Đăng xuất

- **Trạng thái:** ❌ Không đạt

**Các bước thực hiện:**
1. Đăng nhập bằng tài khoản và mật khẩu ở TC 2
2. click logout

**Ghi chú:**
- Có lỗi -> ghi lỗi và kết thúc testcase

**Kết quả mong đợi:**
- Đăng xuất thành công về lại trang login.

**Kết quả thực tế:** Đăng nhập thất bại tại bước 1 với tài khoản "unknown". Hệ thống báo "Invalid credentials". Không thể thực hiện Logout. Tuân thủ rule: Không tự ý đổi account.

**Bằng chứng:** [Xem video recording](./tests/recordings/tc-4.webp)

---

### 5 — Quên mật khẩu

- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Click Forgot Password
2. Nhập email: email từ TC 3

**Ghi chú:**
- Có lỗi -> Ghi lỗi và kết thúc testcase

**Kết quả mong đợi:**
- Thông báo reset link đã được gửi.

**Kết quả thực tế:** Hệ thống hiển thị thông báo "Reset link sent to email (check console)". Đã đối chiếu: Đúng như mong đợi.

**Bằng chứng:** [Xem video recording](./tests/recordings/tc-5.webp)

---

---

## Bảng Kết Quả

*(Điền kết quả sau khi chạy từng test)*

| Mã TC | Tên Test | Kết Quả | Bằng Chứng | Ghi Chú |
|-------|----------|---------|------------|---------|
| 1 | Mở màn hình | ✅ Đạt | [Video](./tests/recordings/tc-1.webp) | Trang chủ tải thành công |
| 2 | Đăng nhập thất bại | ❌ Không đạt | [Video](./tests/recordings/tc-2.webp) | Lỗi: Không thấy Dashboard |
| 3 | Đăng ký tài khoản | ❌ Không đạt | [Video](./tests/recordings/tc-3.webp) | Lỗi: User already exists |
| 4 | Đăng nhập và Đăng xuất | ❌ Không đạt | [Video](./tests/recordings/tc-4.webp) | Login failed (unknown) - Strict |
| 5 | Quên mật khẩu | ✅ Đạt | [Video](./tests/recordings/tc-5.webp) | Link reset đã được gửi |

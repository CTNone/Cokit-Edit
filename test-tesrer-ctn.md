# Kế Hoạch Kiểm Thử

**Nguồn file:** test tesrer ctn.xlsx
**Ngày tạo:** 02/04/2026 16:43
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
- Màn hình mở lên giao diện website hoàn chỉnh

**Kết quả thực tế:** Website hiển thị giao diện đăng nhập (Login) hoàn chỉnh với đầy đủ Username/Password. Khớp hoàn toàn với mong đợi.

**Bằng chứng:** [Xem video recording](./tests/recordings/tc-1.webp)

---

### 2 — Đăng nhập thất bại - Tài khoản không tồn tại

- **Trạng thái:** ❌ Không đạt

**Các bước thực hiện:**
1. Click nút đăng nhập
2. Đăng nhập tên tài khoản:unknow1 và mật khẩu:12345678

**Kết quả mong đợi:**
- Hiển hiện giao diện dashboard

**Kết quả thực tế:** Hệ thống hiển thị thông báo "Invalid credentials" ngay tại màn hình Login. Không thể truy cập Dashboard. Đã đối chiếu: Không khớp với mong đợi.

**Bằng chứng:** [Xem video recording](./tests/recordings/tc-2.webp)

---

### 3 — Đăng ký tài khoản mới

- **Trạng thái:** ❌ Không đạt

**Các bước thực hiện:**
1. Click nút đăng ký
2. Đăng ký với tài khoản tester00
3. email: tester00@gmail.com
4. mật khẩu: 12345678

**Ghi chú:**
- Tài khoản đã tồn tại -> ghi lỗi và kết thúc testcase

**Kết quả mong đợi:**
- Đăng ký thành công và chuyển sang giao diện đăng nhập

**Kết quả thực tế:** Hệ thống hiển thị thông báo "User already exists". Tài khoản tester00 đã tồn tại. Đã đối chiếu: Không khớp với mong đợi.

**Bằng chứng:** [Xem video recording](./tests/recordings/tc-3.webp)

---

### 4 — Đăng xuất

- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Đăng nhập bằng tài khoản và mật khẩu ở TC 3
2. click logout

**Kết quả mong đợi:**
- Trở về giao diện ban đầu

**Kết quả thực tế:** Đăng nhập thành công với tài khoản tester00. Sau khi click Logout, hệ thống đã chuyển hướng quay lại trang Login một cách chính xác. Khớp với mong đợi.

**Bằng chứng:** [Xem video recording](./tests/recordings/tc-4.webp)

---

### 5 — Quên mật khẩu

- **Trạng thái:** ❌ Không đạt

**Các bước thực hiện:**
1. Click Forgot Password
2. Nhập email: email từ TC 3

**Kết quả mong đợi:**
- Trả về "Reset link sent to email (check console)"

**Kết quả thực tế:** Hệ thống hiển thị thông báo "Email not found". Reset mật khẩu thất bại. Đã đối chiếu: Không khớp với mong đợi.

**Bằng chứng:** [Xem video recording](./tests/recordings/tc-5.webp)

---

---

## Bảng Kết Quả

*(Điền kết quả sau khi chạy từng test)*

| Mã TC | Tên Test | Kết Quả | Bằng Chứng | Ghi Chú |
|-------|----------|---------|------------|---------|
| 1 | Mở màn hình | ✅ Đạt | [Video](./tests/recordings/tc-1.webp) | Trang chủ tải thành công |
| 2 | Đăng nhập thất bại | ❌ Không đạt | [Video](./tests/recordings/tc-2.webp) | Lỗi: Invalid credentials |
| 3 | Đăng ký tài khoản | ❌ Không đạt | [Video](./tests/recordings/tc-3.webp) | Lỗi: User already exists |
| 4 | Đăng xuất | ✅ Đạt | [Video](./tests/recordings/tc-4.webp) | Logout thành công (tester00) |
| 5 | Quên mật khẩu | ❌ Không đạt | [Video](./tests/recordings/tc-5.webp) | Lỗi: Email not found |

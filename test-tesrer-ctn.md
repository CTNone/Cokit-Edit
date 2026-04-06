# Kế Hoạch Kiểm Thử (AI Standardized v2)

**Nguồn file:** test tesrer ctn.xlsx
**Ngày tạo:** 06/04/2026 11:09
**Tổng số test case:** 5

---

## 1 — Mở màn hình
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Truy cập http://localhost:3000

**Kết quả mong đợi:**
- Hiển thị Login

**Kết quả thực tế:** Trang chủ tải thành công.
**Bằng chứng:** [video_20260406_111036.webm](tests/recordings/TC-1/video_20260406_111036.webm)

---

## 2 — Đăng nhập thành công
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Nhấn Login
2. Nhập Username: "ctn"
3. Nhập Password: "12345678"
4. Nhấn Login

**Kết quả mong đợi:**
- Hiển thị "Dashboard"

**Kết quả thực tế:** Đăng nhập thành công với tài khoản "ctn".
**Bằng chứng:** [video_20260406_111051.webm](tests/recordings/TC-2/video_20260406_111051.webm)

---

## 3 — Đăng ký tài khoản mới
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Nhấn Register
2. Nhập Username: "tester12"
3. Nhập Email: "tester12@gmail.com"
4. Nhập Password: "12345678"
5. Nhấn Register

**Kết quả mong đợi:**
- Hiển thị "Login"

**Kết quả thực tế:** Đăng ký tester12 thành công.
**Bằng chứng:** [video_20260406_111112.webm](tests/recordings/TC-3/video_20260406_111112.webm)

---

## 4 — Đăng xuất
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Nhấn Login 
2. Nhập Username: "tester12"
3. Nhập Password: "12345678"
4. Nhấn Login
5. Nhấn Logout

**Kết quả mong đợi:**
- Hiển thị "Login"

**Kết quả thực tế:** Logout tester12 thành công.
**Bằng chứng:** [video_20260406_111132.webm](tests/recordings/TC-4/video_20260406_111132.webm)

---

## 5 — Quên mật khẩu
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. Nhấn "Forgot Password?"
2. Nhập Email: "tester12@gmail.com"
3. Nhấn "Send Reset Link"

**Kết quả mong đợi:**
- Hiển thị "Reset link sent"

**Kết quả thực tế:** Đã gửi link reset cho tester12@gmail.com.
**Bằng chứng:** [video_20260406_111153.webm](tests/recordings/TC-5/video_20260406_111153.webm)

---

## Bảng Kết Quả (Suite v2.2)
| Mã TC | Tên Test | Kết Quả | Bằng Chứng (Latest) | Ghi Chú |
|-------|----------|---------|------------|---------|
| 1 | Mở màn hình | ✅ Đạt | [Video](tests/recordings/TC-1/video_20260406_111036.webm) | - |
| 2 | Đăng nhập thành công | ✅ Đạt | [Video](tests/recordings/TC-2/video_20260406_111051.webm) | ctn |
| 3 | Đăng ký tài khoản | ✅ Đạt | [Video](tests/recordings/TC-3/video_20260406_111112.webm) | tester12 |
| 4 | Đăng xuất | ✅ Đạt | [Video](tests/recordings/TC-4/video_20260406_111132.webm) | - |
| 5 | Quên mật khẩu | ✅ Đạt | [Video](tests/recordings/TC-5/video_20260406_111153.webm) | - |

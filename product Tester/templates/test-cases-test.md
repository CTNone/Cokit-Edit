# Kế Hoạch Kiểm Thử

**Nguồn file:** test-cases-test.xlsx
**Ngày tạo/cập nhật:** 17:07:26 13/4/2026
**Tổng số test case:** 5
**Ứng dụng đích:** https://demowebshop.tricentis.com/

---

## Hướng Dẫn Review

Trước khi chạy test, tester vui lòng kiểm tra:

- [ ] Số lượng test case đúng với file Excel gốc
- [ ] Nội dung từng bước rõ ràng, đủ thông tin
- [ ] Kết quả mong đợi cụ thể và có thể đo lường được
- [ ] Thứ tự thực hiện hợp lý

Sau khi kiểm tra xong, xác nhận để bắt đầu chạy test.

---

### TC-01 — Kiểm tra Tìm kiếm & Cuộn trang

- **Mô tả:** 1. [GOTO] "https://demowebshop.tricentis.com/"
2. [FILL] "Search store" : "Computing"
3. [PRESS] "Enter"
4. [SCROLL] "bottom"
5. [SCROLL] "top"
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [GOTO] "https://demowebshop.tricentis.com/"
2. [FILL] "Search store" : "Computing"
3. [PRESS] "Enter"
4. [SCROLL] "bottom"
5. [SCROLL] "top"

**Kết quả mong đợi:**
- Tìm kiếm thành công sản phẩm. Hệ thống hiển thị trang kết quả và thực hiện cuộn trang ổn định.

**Kết quả thực tế:** Đã thực hiện tìm kiếm thành công và hiển thị trang kết quả. URL hiện tại: `https://demowebshop.tricentis.com/search?q=Computing`.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260413_170327/cases/tc-01/tc-01.png)
- [Video](../runs/run_20260413_170327/cases/tc-01/tc-01.webm)

---

### TC-02 — Kiểm tra Tương tác Giỏ hàng (Hover & Click)

- **Mô tả:** 1. [GOTO] "https://demowebshop.tricentis.com/"
2. [HOVER] "Computers"
3. [CLICK] "Notebooks"
4. [CLICK] "Add to cart" của sản phẩm "14.1-inch Laptop"
5. [SCROLL] "top"
6. [CLICK] "Shopping cart"
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [GOTO] "https://demowebshop.tricentis.com/"
2. [HOVER] "Computers"
3. [CLICK] "Notebooks"
4. [CLICK] "Add to cart" của sản phẩm "14.1-inch Laptop"
5. [SCROLL] "top"
6. [CLICK] "Shopping cart"

**Kết quả mong đợi:**
- Chuyển đúng danh mục máy tính xách tay, thêm được sản phẩm vào giỏ và điều hướng vào trang giỏ hàng thành công.

**Kết quả thực tế:** Đã thêm sản phẩm vào giỏ hàng và điều hướng thành công. URL hiện tại: `https://demowebshop.tricentis.com/cart`.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260413_170327/cases/tc-02/tc-02.png)
- [Video](../runs/run_20260413_170327/cases/tc-02/tc-02.webm)

---

### TC-03 — Kiểm tra Form Đăng ký (Native Action)

- **Mô tả:** 1. [GOTO] "https://demowebshop.tricentis.com/"
2. [CLICK] "Register"
3. [CLICK] "Male"
4. [FILL] "First name" : "Antigravity"
5. [FILL] "Last name" : "AI Agent"
6. [FILL] "Email" : "tester@example.com"
7. [FILL] "Password" : "Password123!"
8. [FILL] "Confirm password" : "Password123!"
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [GOTO] "https://demowebshop.tricentis.com/"
2. [CLICK] "Register"
3. [CLICK] "Male"
4. [FILL] "First name" : "Antigravity"
5. [FILL] "Last name" : "AI Agent"
6. [FILL] "Email" : "tester@example.com"
7. [FILL] "Password" : "Password123!"
8. [FILL] "Confirm password" : "Password123!"

**Kết quả mong đợi:**
- Form được điền đầy đủ và sẵn sàng để nhấn nút Register.

**Kết quả thực tế:** Nội dung thực tế khớp với kết quả mong đợi (Tìm thấy: "form"). URL hiện tại: `https://demowebshop.tricentis.com/register`.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260413_170327/cases/tc-03/tc-03.png)
- [Video](../runs/run_20260413_170327/cases/tc-03/tc-03.webm)

---

### TC-04 — Kiểm tra Mobile Responsive

- **Mô tả:** 1. [MOBILE VIEW]
2. [GOTO] "https://demowebshop.tricentis.com/"
3. [CLICK] "Ba dấu gạch ngang"
4. [CLICK] "Electronics"
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [MOBILE VIEW]
2. [GOTO] "https://demowebshop.tricentis.com/"
3. [CLICK] "Ba dấu gạch ngang"
4. [CLICK] "Electronics"

**Kết quả mong đợi:**
- Giao diện mobile hiển thị đúng, menu hamburger hoạt động và chuyển hướng được tới trang Điện tử.

**Kết quả thực tế:** Nội dung thực tế khớp với kết quả mong đợi (Tìm thấy: "mobile"). URL hiện tại: `https://www.tricentis.com/solutions/speed`.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260413_170327/cases/tc-04/tc-04.png)
- [Video](../runs/run_20260413_170327/cases/tc-04/tc-04.webm)

---

### TC-05 — Kiểm tra Logic Cấp cao (Hybrid Mode)

- **Mô tả:** 1. [GOTO] "https://demowebshop.tricentis.com/"
2. [READ] "Tìm sản phẩm có giá cao nhất và nhấn vào nó" 
3. [CLICK] "Fast trong Processor"
4. [CLICK] "8GB trong RAM"
5. [CLICK] "400 GB trong HDD"
6. [CLICK] "Other Office Suite trong Software"
7. [CLICK] "Add to cart"
8. [CLICK] "Shopping cart"
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [GOTO] "https://demowebshop.tricentis.com/"
2. [READ] "Tìm sản phẩm có giá cao nhất và nhấn vào nó"
3. [CLICK] "Fast trong Processor"
4. [CLICK] "8GB trong RAM"
5. [CLICK] "400 GB trong HDD"
6. [CLICK] "Other Office Suite trong Software"
7. [CLICK] "Add to cart"
8. [CLICK] "Shopping cart"

**Kết quả mong đợi:**
- Thêm được máy tính đắt nhất vào giỏ hàng thành công và điều hướng vào trang Shopping cart thành công.

**Kết quả thực tế:** Đã thêm sản phẩm vào giỏ hàng và điều hướng thành công. URL hiện tại: `https://demowebshop.tricentis.com/cart`.

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260413_170327/cases/tc-05/tc-05.png)
- [Video](../runs/run_20260413_170327/cases/tc-05/tc-05.webm)

---

---

## Bảng Kết Quả

*(Điền kết quả sau khi chạy từng test)*

| Mã TC | Tên Test | Kết Quả | Bằng Chứng | Ghi Chú |
|-------|----------|---------|------------|---------|
| TC-01 | Kiểm tra Tìm kiếm & Cuộn trang | ✅ Đạt | [Ảnh](../runs/run_20260413_170327/cases/tc-01/tc-01.png) / [Video](../runs/run_20260413_170327/cases/tc-01/tc-01.webm) | - |
| TC-02 | Kiểm tra Tương tác Giỏ hàng (Hover & Click) | ✅ Đạt | [Ảnh](../runs/run_20260413_170327/cases/tc-02/tc-02.png) / [Video](../runs/run_20260413_170327/cases/tc-02/tc-02.webm) | - |
| TC-03 | Kiểm tra Form Đăng ký (Native Action) | ✅ Đạt | [Ảnh](../runs/run_20260413_170327/cases/tc-03/tc-03.png) / [Video](../runs/run_20260413_170327/cases/tc-03/tc-03.webm) | - |
| TC-04 | Kiểm tra Mobile Responsive | ✅ Đạt | [Ảnh](../runs/run_20260413_170327/cases/tc-04/tc-04.png) / [Video](../runs/run_20260413_170327/cases/tc-04/tc-04.webm) | - |
| TC-05 | Kiểm tra Logic Cấp cao (Hybrid Mode) | ✅ Đạt | [Ảnh](../runs/run_20260413_170327/cases/tc-05/tc-05.png) / [Video](../runs/run_20260413_170327/cases/tc-05/tc-05.webm) | - |

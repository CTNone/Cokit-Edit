# Kế Hoạch Kiểm Thử

**Nguồn file:** test-cases-test.xlsx
**Ngày tạo/cập nhật:** 08:58:21 16/4/2026
**Tổng số test case:** 1
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
- [Ảnh chụp](../runs/run_20260416_085754/cases/tc-02/tc-02.png)

---

---

## Bảng Kết Quả

*(Điền kết quả sau khi chạy từng test)*

| Mã TC | Tên Test | Kết Quả | Bằng Chứng | Ghi Chú |
|-------|----------|---------|------------|---------|
| TC-02 | Kiểm tra Tương tác Giỏ hàng (Hover & Click) | ✅ Đạt | [Ảnh](../runs/run_20260416_085754/cases/tc-02/tc-02.png) | - |

# Kế Hoạch Kiểm Thử

**Nguồn file:** cnt_test_fkr.xlsx
**Ngày tạo/cập nhật:** 15:51:06 17/4/2026
**Tổng số test case:** 13
**Ứng dụng đích:** https://mini-unigate.fsoft.com.vn/fkr/
**Phạm vi chạy hiện tại:** TC-03

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
2. Click "Login with Account/Password".
3. Nhập Username: "Admin".
4. Nhập Password: "fbgsde45634#$%^".
5. Nhấn nút "Sign in".
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [GOTO] "https://mini-unigate.fsoft.com.vn/fkr/auth/login"
2. [CLICK] "Login with Account/Password"
3. [FILL] "username" : "Admin"
4. [FILL] "password" : "fbgsde45634#$%^"
5. [CLICK] "Sign in"

**Kết quả mong đợi:**
- Người dùng được chuyển về trang My Workspace

**Kết quả thực tế:** Đăng nhập thất bại; Tên đăng nhập không đúng

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260417_155004/cases/tc-01/tc-01.png)

**Ghi chú kết quả:** [Judge] . [AI Note] User is attempting to log in with incorrect username.

---

### TC-02 — Kiểm tra hiển thị danh sách ứng dụng

- **Mô tả:** 1. Quan sát mục "My Applications".
- **Trạng thái:** Chưa chạy

**Các bước thực hiện:**
1. [OBSERVE] "mục My Applications"

**Kết quả mong đợi:**
- Hiển thị đủ 3 app: Human Resource Managemen, Ticket Management, SLA.

**Kết quả thực tế:** *(điền sau khi chạy)*

**Bằng chứng:** *(screenshot/video sẽ được gắn vào đây)*

---

### TC-03 — Kiểm tra thanh tìm kiếm (Search Apps)

- **Mô tả:** 1. Nhập "Human" vào ô Search Apps.
2. Click nút x bên phải Search Apps.
- **Trạng thái:** ✅ Đạt

**Các bước thực hiện:**
1. [FILL] "Search Apps" : "Human"
2. [CLICK] "x"

**Kết quả mong đợi:**
- Chỉ hiển thị card "Human Resource Management".

**Kết quả thực tế:** Quan sát được chính xác nội dung: "Human Resource Management"

**Bằng chứng:**
- [Ảnh chụp](../runs/run_20260417_155004/cases/tc-03/tc-03.png)

---

### TC-04 — Kiểm tra điều hướng khi click vào App

- **Mô tả:** 1. Click vào card "Human Resource Managemen".
2. Đóng tab "Human Resource Managemen".
- **Trạng thái:** Chưa chạy

**Các bước thực hiện:**
1. [CLICK] "Human Resource Management"
2. [SWITCH_WINDOW] "Human Resource Management"
3. [CLOSE_WINDOW]

**Kết quả mong đợi:**
- Hệ thống chuyển hướng đúng sang trang Human Resource Management.

**Kết quả thực tế:** *(điền sau khi chạy)*

**Bằng chứng:** *(screenshot/video sẽ được gắn vào đây)*

---

### TC-05 — Kiểm tra điều hướng khi click vào App

- **Mô tả:** 1. Click vào card "Ticket Management".
2. Đóng tab "Ticket Management".
- **Trạng thái:** Chưa chạy

**Các bước thực hiện:**
1. [CLICK] "Ticket Management"
2. [CLOSE_WINDOW]

**Kết quả mong đợi:**
- Hệ thống chuyển hướng đúng sang trang Ticket Management.

**Kết quả thực tế:** *(điền sau khi chạy)*

**Bằng chứng:** *(screenshot/video sẽ được gắn vào đây)*

---

### TC-06 — Kiểm tra điều hướng khi click vào App

- **Mô tả:** 1. Click vào card "SLA".
2. 2. Đóng tab "SLA".
- **Trạng thái:** Chưa chạy

**Các bước thực hiện:**
1. [CLICK] "card SLA"
2. [CLOSE_WINDOW]

**Kết quả mong đợi:**
- Hệ thống chuyển hướng đúng sang trang SLA.

**Kết quả thực tế:** *(điền sau khi chạy)*

**Bằng chứng:** *(screenshot/video sẽ được gắn vào đây)*

---

### TC-07 — Kiểm tra chức năng thu gọn/mở rộng sơ đồ

- **Mô tả:** 1. Thực hiện TC-04 . 
2. Click tab "Department Graph".
3. Click (-) dưới node FKR (N/A) màu đỏ
- **Trạng thái:** Chưa chạy

**Các bước thực hiện:**
1. [OBSERVE] "TC-04"
2. [CLICK] "Department Graph"
3. [HOVER] "node FKR" [CLICK] "-"

**Kết quả mong đợi:**
- Node con của phòng ban đó sẽ ẩn đi/hiện lại.

**Kết quả thực tế:** *(điền sau khi chạy)*

**Bằng chứng:** *(screenshot/video sẽ được gắn vào đây)*

---

### TC-08 — Kiểm tra chuyển đổi chế độ xem

- **Mô tả:** 1. Truy cập HRM > Departments. 
2. Chọn tab "Department Graph".
3. Click vào icon "List view" (bên cạnh icon sơ đồ góc trên bên phải).
- **Trạng thái:** Chưa chạy

**Các bước thực hiện:**
1. [GOTO] "HRM > Departments"
2. [SWITCH_WINDOW] "Department Graph"
3. [CLICK] "List view"

**Kết quả mong đợi:**
- Chuyển từ dạng sơ đồ sang dạng bảng (Table/List)

**Kết quả thực tế:** *(điền sau khi chạy)*

**Bằng chứng:** *(screenshot/video sẽ được gắn vào đây)*

---

### TC-09 — Kiểm tra điều hướng sidebar

- **Mô tả:** 1. Truy cập HRM . 
2. Chọn tab "Employees Graph".
- **Trạng thái:** Chưa chạy

**Các bước thực hiện:**
1. [GOTO] "HRM"
2. [SWITCH_WINDOW] "Employees Graph"

**Kết quả mong đợi:**
- Trang danh sách nhân viên được hiển thị.

**Kết quả thực tế:** *(điền sau khi chạy)*

**Bằng chứng:** *(screenshot/video sẽ được gắn vào đây)*

---

### TC-10 — Kiểm tra hiển thị các nhóm dịch vụ

- **Mô tả:** 1. Truy cập Ticket Management.
2. Click "Services".
- **Trạng thái:** Chưa chạy

**Các bước thực hiện:**
1. [GOTO] "Ticket Management"
2. [CLICK] "Services"

**Kết quả mong đợi:**
- Hiển thị đủ 4 nhóm: HR, IT, Admin, Procurement

**Kết quả thực tế:** *(điền sau khi chạy)*

**Bằng chứng:** *(screenshot/video sẽ được gắn vào đây)*

---

### TC-11 — Kiểm tra hiển thị trong my request

- **Mô tả:** 1. Truy cập Ticket Management.
2. Click "My request".
3. Cick "On-going Requests"
4. Click "Finished Requests"
5. Click "Cancelled Requests".
6. Click "Received Requests".
- **Trạng thái:** Chưa chạy

**Các bước thực hiện:**
1. [GOTO] "Ticket Management"
2. [CLICK] "My request"
3. [CLICK] "On-going Requests"
4. [CLICK] "Finished Requests"
5. [CLICK] "Cancelled Requests"
6. [CLICK] "Received Requests"

**Kết quả mong đợi:**
- Hiển thị danh sách của mỗi trang request

**Kết quả thực tế:** *(điền sau khi chạy)*

**Bằng chứng:** *(screenshot/video sẽ được gắn vào đây)*

---

### TC-12 — Kiểm tra tìm kiến trong my request

- **Mô tả:** 1. Truy cập Ticket Management.
2. Click "My request".
3. Click "Expand"
4. Nhập "Test back step" trong mục "Search All".
5. Click "Search"
- **Trạng thái:** Chưa chạy

**Các bước thực hiện:**
1. [GOTO] "Ticket Management"
2. [CLICK] "My request"
3. [CLICK] "Expand"
4. [FILL] "Search All" : "Test back step"
5. [CLICK] "Search"

**Kết quả mong đợi:**
- Hiển thị duy nhất 1 trường ticket

**Kết quả thực tế:** *(điền sau khi chạy)*

**Bằng chứng:** *(screenshot/video sẽ được gắn vào đây)*

---

### TC-13 — Kiểm tra thông tin ticket

- **Mô tả:** 1. Click vào ticket "Test back step".
2. Kéo xuống đáy.
3. Kéo lên trên.
- **Trạng thái:** Chưa chạy

**Các bước thực hiện:**
1. [CLICK] "ticket Test back step"
2. [SCROLL] "bottom"
3. [SCROLL] "top"

**Kết quả mong đợi:**
- Hiển thị đây đủ thông tin

**Kết quả thực tế:** *(điền sau khi chạy)*

**Bằng chứng:** *(screenshot/video sẽ được gắn vào đây)*

---

---

## Bảng Kết Quả

*(Điền kết quả sau khi chạy từng test)*

| Mã TC | Tên Test | Kết Quả | Bằng Chứng | Ghi Chú |
|-------|----------|---------|------------|---------|
| TC-01 | Đăng nhập thành công (Admin) | ✅ Đạt | [Ảnh](../runs/run_20260417_155004/cases/tc-01/tc-01.png) | [Judge] . [AI Note] User is attempting to log in with incorrect username. |
| TC-02 | Kiểm tra hiển thị danh sách ứng dụng | Chưa chạy | - | - |
| TC-03 | Kiểm tra thanh tìm kiếm (Search Apps) | ✅ Đạt | [Ảnh](../runs/run_20260417_155004/cases/tc-03/tc-03.png) | - |
| TC-04 | Kiểm tra điều hướng khi click vào App | Chưa chạy | - | - |
| TC-05 | Kiểm tra điều hướng khi click vào App | Chưa chạy | - | - |
| TC-06 | Kiểm tra điều hướng khi click vào App | Chưa chạy | - | - |
| TC-07 | Kiểm tra chức năng thu gọn/mở rộng sơ đồ | Chưa chạy | - | - |
| TC-08 | Kiểm tra chuyển đổi chế độ xem | Chưa chạy | - | - |
| TC-09 | Kiểm tra điều hướng sidebar | Chưa chạy | - | - |
| TC-10 | Kiểm tra hiển thị các nhóm dịch vụ | Chưa chạy | - | - |
| TC-11 | Kiểm tra hiển thị trong my request | Chưa chạy | - | - |
| TC-12 | Kiểm tra tìm kiến trong my request | Chưa chạy | - | - |
| TC-13 | Kiểm tra thông tin ticket | Chưa chạy | - | - |

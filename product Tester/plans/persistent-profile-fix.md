# Implementation Plan: Persistent Chrome Profile & Error Evidence

Sử dụng Profile Google Chrome cá nhân đã đăng nhập để tăng Trust Score, vượt qua các hệ thống kiểm tra Bot (CAPTCHA/Turnstile) và quản lý lỗi tự động.

## 1. Mục tiêu
- **Độ tin cậy:** Sử dụng `launchPersistentContext` để kế thừa Cookie/Session/History từ trình duyệt thật.
- **Fail-fast:** Không dùng can thiệp thủ công (HITL) ở giai đoạn này. Nếu lỗi, dừng lại ngay.
- **Bằng chứng:** Chụp ảnh, quay video và log lỗi chi tiết tại bước thất bại.

## 2. Thay đổi cấu hình (`src/config.js` & `.env`)
Thêm các biến môi trường để tùy chỉnh linh hoạt:
- `USE_PERSISTENT_PROFILE`: `true/false` (Mặc định `false`).
- `USER_DATA_DIR`: Đường dẫn đến thư mục chứa Profile Chrome (Ví dụ: `C:\Users\...\AppData\Local\Google\Chrome\User Data`).
- `PROFILE_NAME`: Tên profile cụ thể (Ví dụ: `Default` hoặc `Profile 1`).
- `CHROME_PATH`: Đường dẫn đến executable của Google Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`).

## 3. Chỉnh sửa logic khởi chạy (`src/runner.js`)

### 3.1. Tái cấu trúc `init()`
Playwright xử lý Persistent Context khác với Context thông thường:
- **Thường:** `launch()` -> `newContext()`
- **Persistent:** `launchPersistentContext(dir, options)` -> trả về `context` ngay lập tức.

### 3.2. Logic xử lý lỗi
Trong vòng lặp `runScenario()`:
- Nếu một bước thất bại sau số lần retry:
    1. Chụp ảnh màn hình (`page.screenshot`).
    2. Lưu log lỗi chi tiết (Step ID, Content, Error Kind).
    3. Đóng context và đánh dấu Kết quả là `failed`.

## 4. Các bước thực hiện

### Giai đoạn 1: Cập nhật Cấu hình
1. Thêm định nghĩa các biến trình duyệt vào `src/config.js`.
2. Cập nhật `.env` mẫu với hướng dẫn lấy đường dẫn User Data Dir.

### Giai đoạn 2: Nâng cấp PlaywrightRunner
1. Sửa hàm `init()` để kiểm tra cờ `USE_PERSISTENT_PROFILE`.
2. Sửa hàm `runScenario()` để quản lý vòng đời Context tương ứng (Persistent Context không cần `this.browser.newContext()`).
3. Đảm bảo Video recording vẫn hoạt động chính xác trong Persistent Context.

### Giai đoạn 3: Kiểm chứng
1. Chạy thử nghiệm trên `mini-unigate.fsoft.com.vn` với profile đã đăng nhập sẵn.
2. Kiểm tra xem hệ thống có tự động bỏ qua màn hình login/captcha không.
3. Thử nghiệm một bước lỗi cố ý để kiểm tra bằng chứng (screenshot/video).

## 5. Lưu ý quan trọng
- **Đóng Chrome:** Người dùng phải đóng mọi cửa sổ Chrome đang chạy nếu sử dụng chung thư mục User Data Dir. Nếu không, Playwright sẽ báo lỗi "Target closed" hoặc "Lock file exists".
- **Bảo mật:** Tool sẽ truy cập được vào toàn bộ dữ liệu (mật khẩu, cookie) của Profile đó. Cần bảo quản file `.env` cẩn thận.

## 6. Tiêu chí hoàn thành (Definition of Done)
- [ ] Tool có thể mở trang web bằng Profile Chrome cá nhân.
- [ ] Không cần đăng nhập lại nếu Profile đã có session.
- [ ] Khi gặp lỗi, scenario dừng lại và lưu đầy đủ Screenshot/Video vào thư mục `runs/`.
- [ ] File kết quả JSON có ghi nhận `failureStep`.

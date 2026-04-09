# Hướng Dẫn Mang Dự Án Sang Máy Khác

Tài liệu này dành cho tình huống **bàn giao tool sang máy mới** hoặc **gửi cho đồng đội mới tiếp nhận**.

Mục tiêu: mang nguyên thư mục `product Tester/` sang máy khác và chạy lại với ít chỉnh sửa nhất.

---

## 1. Máy đích cần có gì?

- Node.js 16 trở lên
- npm
- quyền chạy `npm install`
- quyền cài browser runtime cho Playwright
- kết nối được tới ứng dụng cần test

---

## 2. Cách chuyển nhanh nhất

1. Copy nguyên thư mục `product Tester/` sang máy mới.
2. Mở terminal tại thư mục này.
3. Chạy một trong hai cách:

### Windows

```bat
setup.bat
```

### Linux/macOS

```bash
bash setup.sh
```

Nếu không dùng script setup, chạy tay:

```bash
npm install
npx playwright install
```

---

## 3. Cấu hình cần kiểm tra sau khi copy

Mở file `.env`:

```env
TARGET_URL=http://localhost:3000
E2E_LLM_PROVIDER=ollama
E2E_LLM_BASE_URL=http://localhost:11434/v1
E2E_LLM_MODEL=gemma3:4b
```

Trong trạng thái hiện tại của dự án:

- `TARGET_URL` là cấu hình quan trọng nhất
- nhóm biến `E2E_LLM_*` đang được giữ lại để tương thích cấu hình cũ
- luồng sử dụng chính hiện tại tập trung vào **Excel + Markdown + Playwright**

---

## 4. Cách xác nhận bàn giao thành công

Trên máy mới, chạy thử:

```bash
node src/index.js convert ./templates/test-cases.xlsx
```

Nếu mọi thứ ổn, bạn sẽ thấy:

- file `templates/test-cases.md` được sinh hoặc cập nhật
- CLI hỏi review và hỏi có tiếp tục chạy không

Sau đó có thể chạy test thật:

```bash
node src/index.js run ./templates/test-cases.xlsx --target-url http://localhost:3000
```

---

## 5. Khi bàn giao thì nên copy những gì?

### Bắt buộc

- `src/` — mã nguồn chính
- `templates/` — file Excel mẫu và Markdown plan
- `.env` — cấu hình mặc định
- `README.md` — tài liệu onboarding
- `quickstart.md` — hướng dẫn chạy nhanh
- `PORTABILITY.md` — tài liệu bàn giao máy khác
- `product-tester-spec.md` — mô tả chức năng
- `product-tester-plan.md` — mô tả kiến trúc và trạng thái triển khai

### Nên copy thêm nếu muốn giữ lịch sử chạy

- `runs/` — ảnh, video, report, summary của các lần chạy cũ

---

## 6. Lỗi thường gặp khi sang máy mới

### Thiếu browser của Playwright

Khắc phục:

```bash
npx playwright install
```

### Sai URL app test

Khắc phục bằng một trong ba cách:

- sửa `.env`
- truyền `--target-url`
- nhập URL mới khi CLI hỏi

### App test chưa chạy

Khắc phục:

- mở ứng dụng mục tiêu trước
- thử truy cập URL bằng trình duyệt thường trước khi chạy CLI

---

## 7. Các lệnh nên dùng trên máy mới

### Chạy toàn bộ flow

```bash
node src/index.js convert ./templates/test-cases.xlsx
```

### Chạy lại các case lỗi

```bash
node src/index.js run ./templates/test-cases.xlsx --retry --target-url http://localhost:3000
```

### Chạy có giao diện trình duyệt

```bash
node src/index.js run ./templates/test-cases.xlsx --headed --target-url http://localhost:3000
```

---

## 8. Sau khi bàn giao, người mới nên đọc gì?

1. `README.md`
2. `quickstart.md`
3. `PORTABILITY.md`

Ba file này là đủ để người mới cài, chạy và hiểu đầu ra cơ bản trước khi cần đọc sâu hơn.


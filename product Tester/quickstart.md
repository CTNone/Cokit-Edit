# Hướng Dẫn Chạy Nhanh: product Tester

Tài liệu này dành cho người muốn **cài nhanh và chạy được ngay** mà chưa cần đọc sâu toàn bộ dự án.

---

## 1. Cài đặt nhanh

Mở terminal tại thư mục `product Tester` và chạy:

```bash
npm install
npx playwright install
```

---

## 2. Kiểm tra cấu hình mặc định

Mở file `.env` và kiểm tra:

```env
TARGET_URL=http://localhost:3000
```

Nếu ứng dụng cần test chạy ở URL khác, bạn có thể:

- sửa trực tiếp trong `.env`, hoặc
- nhập URL khác khi CLI hỏi trong lúc chạy

---

## 3. Chạy luồng đầy đủ từ Excel

```bash
node src/index.js convert ./templates/test-cases.xlsx
```

CLI sẽ:

1. Đọc file Excel.
2. Sinh `templates/test-cases.md`.
3. Yêu cầu bạn review file Markdown.
4. Hỏi có tiếp tục chạy không.
5. Hỏi muốn chạy toàn bộ hay chỉ chạy một số test case.
6. Hỏi URL ứng dụng cần test.
7. Chạy Playwright.
8. Cập nhật lại file Markdown sau từng test case.
9. Sinh report tổng sau khi chạy xong.

---

## 4. Các lệnh chạy nhanh thường dùng

### Chạy lại từ bộ case đã có

```bash
node src/index.js run ./templates/test-cases.xlsx --target-url http://localhost:3000
```

### Chỉ chạy một số test case

```bash
node src/index.js run ./templates/test-cases.xlsx --select TC-01,TC-03 --target-url http://localhost:3000
```

### Chạy lại các case fail hoặc blocked

```bash
node src/index.js run ./templates/test-cases.xlsx --retry --target-url http://localhost:3000
```

### Chạy có mở trình duyệt để quan sát trực tiếp

```bash
node src/index.js run ./templates/test-cases.xlsx --headed --target-url http://localhost:3000
```

---

## 5. Kết quả nằm ở đâu?

Sau mỗi lần chạy, kết quả nằm trong:

```text
runs/run_<timestamp>/
```

Trong đó:

- `cases/<tc-id>/result.json` — kết quả riêng của từng test case
- `cases/<tc-id>/<tc-id>.png` — ảnh chụp màn hình
- `cases/<tc-id>/<tc-id>.webm` — video quay lại quá trình chạy
- `summary.json` — tóm tắt toàn bộ run
- `report.md` — báo cáo Markdown cuối cùng

Ngoài ra:

- `templates/test-cases.md` sẽ được cập nhật lại theo kết quả mới nhất
- `runs/latest-run.json` được dùng để hỗ trợ `--retry`

---

## 6. Nếu bạn chỉ có 2 phút để kiểm tra tool

Làm đúng 4 bước này:

1. Đảm bảo app test đang chạy.
2. Chạy:
   ```bash
   node src/index.js convert ./templates/test-cases.xlsx
   ```
3. Chọn chạy toàn bộ.
4. Mở `templates/test-cases.md` và `runs/run_<timestamp>/report.md` để xem kết quả.

---

## 7. Lưu ý quan trọng cho người mới

- Nếu test đăng ký fail với thông báo `User already exists`, thường là do dữ liệu thật của app đã tồn tại sẵn.
- Điều đó không nhất thiết là lỗi của CLI.
- Trước khi nghi ngờ tool hỏng, hãy kiểm tra:
  - app có đang chạy không
  - URL có đúng không
  - dữ liệu test có bị trùng không

---

## 8. Muốn đọc kỹ hơn?

- Xem `README.md` để đọc tài liệu onboarding đầy đủ
- Xem `PORTABILITY.md` nếu muốn chuyển tool sang máy khác
- Xem `product-tester-spec.md` nếu muốn hiểu yêu cầu hệ thống
- Xem `product-tester-plan.md` nếu muốn hiểu kiến trúc và trạng thái hiện tại

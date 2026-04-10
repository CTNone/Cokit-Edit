# product Tester

`product Tester` là CLI hỗ trợ quy trình:

**Excel test case → Markdown review → chạy test bằng Playwright → lưu ảnh/video/report**

Tài liệu này dành cho **người mới tiếp nhận dự án**. Mục tiêu là bạn có thể:

- cài được tool
- chạy demo được ngay
- hiểu đầu ra nằm ở đâu
- biết đọc tài liệu nào khi cần đi sâu hơn

---

## 1. Dự án này dùng để làm gì?

Tool này phục vụ tester hoặc người bàn giao dự án để chạy test theo luồng bán tự động:

1. Chuẩn bị file Excel chứa test case.
2. Chuyển Excel sang Markdown để kiểm tra lại trước khi chạy.
3. Chọn chạy toàn bộ, chạy một phần, hoặc chạy lại các case lỗi.
4. Dùng Playwright để mở trình duyệt và thực hiện các bước test.
5. Lưu kết quả từng test case kèm ảnh, video và báo cáo tổng.

---

## 2. Bản đồ tài liệu sau khi sắp xếp lại

Chỉ cần quan tâm 5 file chính sau:

| File | Dùng khi nào | Mức ưu tiên |
|------|--------------|-------------|
| `README.md` | Onboarding tổng quát | Đọc đầu tiên |
| `quickstart.md` | Muốn chạy nhanh trong vài phút | Đọc thứ hai |
| `PORTABILITY.md` | Muốn mang tool sang máy khác / bàn giao | Khi cần |
| `product-tester-spec.md` | Muốn hiểu yêu cầu chức năng | Tham khảo |
| `product-tester-plan.md` | Muốn hiểu kiến trúc và trạng thái triển khai | Tham khảo kỹ thuật |

Các tài liệu cũ, trùng lặp hoặc lỗi thời đã được gộp ý chính vào các file trên để giảm nhiễu cho người mới.

---

## 3. Người mới nên bắt đầu như thế nào?

Làm đúng 5 bước sau là đủ để tiếp nhận dự án ở mức sử dụng cơ bản:

1. Mở terminal tại thư mục `product Tester`.
2. Chạy `npm install` và `npx playwright install`.
3. Kiểm tra file `.env`, đặc biệt là `TARGET_URL`.
4. Chạy `node src/index.js convert ./templates/test-cases.xlsx`.
5. Mở `templates/test-cases.md` và `runs/run_<timestamp>/report.md` để xem kết quả.

---

## 4. Yêu cầu môi trường

- Node.js 16 trở lên
- npm
- Playwright browser runtime
- ứng dụng cần test phải đang chạy và truy cập được qua URL

Thiết lập mặc định hiện tại của dự án:

- File Excel mẫu: `templates/test-cases.xlsx`
- File Markdown được sinh/cập nhật: `templates/test-cases.md`
- URL app test mặc định: `http://localhost:3000`

---

## 5. Cài đặt lần đầu

Mở terminal tại thư mục `product Tester` và chạy:

```bash
npm install
npx playwright install
```

Kiểm tra file `.env`:

```env
TARGET_URL=http://localhost:3000
STEP_DELAY=1000  # Pause between steps (ms) for better video visibility
```

> `TARGET_URL` là giá trị mặc định. Trong lúc chạy CLI, bạn vẫn có thể nhập URL khác nếu cần.
> `STEP_DELAY` mặc định là 1000 (1 giây). Nếu muốn test chạy nhanh hơn, hãy giảm xuống 0.

---

## 6. Chạy demo nhanh nhất

### Bước 1 — đảm bảo app mục tiêu đang chạy

Ví dụ:

```text
http://localhost:3000
```

### Bước 2 — chạy luồng đầy đủ từ Excel

```bash
node src/index.js convert ./templates/test-cases.xlsx
```

CLI sẽ làm tuần tự:

1. Đọc file Excel.
2. Sinh file `templates/test-cases.md`.
3. Dừng để bạn review Markdown.
4. Hỏi có tiếp tục chạy hay không.
5. Hỏi chạy toàn bộ / chạy theo ID / dừng để sửa file.
6. Hỏi URL ứng dụng cần test.
7. Chạy Playwright.
8. Cập nhật lại file Markdown sau từng test case.
9. Sinh `summary.json` và `report.md` cho lần chạy đó.

### Bước 3 — chọn chế độ chạy

Trong terminal, bạn sẽ thấy:

- `1` — chạy toàn bộ test case
- `2` — chỉ chạy một số test case theo ID
- `3` — dừng lại để sửa file Markdown trước khi chạy

### Bước 4 — mở kết quả

Kết quả mỗi lần chạy nằm trong:

```text
runs/run_<timestamp>/
```

Ví dụ:

```text
runs/run_20260409_094045/
```

---

## 7. Các lệnh quan trọng nhất

### 7.1 Chạy đầy đủ từ Excel

```bash
node src/index.js convert ./templates/test-cases.xlsx
```

### 7.2 Chạy lại nhanh từ bộ case đã có

```bash
node src/index.js run ./templates/test-cases.xlsx --target-url http://localhost:3000
```

### 7.3 Chỉ chạy một số test case

```bash
node src/index.js run ./templates/test-cases.xlsx --select TC-01,TC-03 --target-url http://localhost:3000
```

### 7.4 Chạy lại các case lỗi hoặc blocked từ lần trước

```bash
node src/index.js run ./templates/test-cases.xlsx --retry --target-url http://localhost:3000
```

### 7.5 Mở trình duyệt có giao diện khi chạy

```bash
node src/index.js run ./templates/test-cases.xlsx --headed --target-url http://localhost:3000
```

---

## 8. Cấu trúc thư mục quan trọng

```text
product Tester/
├── .env
├── README.md
├── quickstart.md
├── PORTABILITY.md
├── product-tester-spec.md
├── product-tester-plan.md
├── templates/
│   ├── test-cases.xlsx
│   └── test-cases.md
├── runs/
│   ├── latest-run.json
│   ├── reports/
│   └── run_<timestamp>/
│       ├── cases/
│       │   └── <tc-id>/
│       │       ├── result.json
│       │       ├── <tc-id>.png
│       │       └── <tc-id>.webm
│       ├── summary.json
│       └── report.md
└── src/
    ├── index.js
    ├── parser.js
    ├── generator.js
    ├── runner.js
    ├── results.js
    └── ...
```

---

## 9. Đọc kết quả như thế nào?

### 9.1 `templates/test-cases.md`

Đây là file review test plan.

Sau khi chạy test, file này được cập nhật thêm:

- trạng thái từng test case
- kết quả thực tế
- link ảnh chụp
- link video
- bảng tổng hợp cuối file

### 9.2 `runs/run_<timestamp>/report.md`

Đây là báo cáo tổng cuối run:

- số lượng pass / fail / blocked / skipped
- chi tiết từng case
- link ảnh và video cho từng case

### 9.3 `runs/run_<timestamp>/summary.json`

Đây là file dữ liệu để script khác có thể đọc tự động.

Ngoài ra:

- `runs/latest-run.json` được dùng cho tính năng `--retry`

---

## 10. Các tình huống thường gặp

### Trường hợp 1 — test fail vì dữ liệu thật của app

Ví dụ case đăng ký có thể fail với thông báo `User already exists`.

Điều này **không tự động đồng nghĩa** với việc CLI bị lỗi. Nó có thể phản ánh đúng trạng thái dữ liệu thật của hệ thống đang test.

### Trường hợp 2 — app chưa chạy

Nếu app ở `http://localhost:3000` chưa bật, CLI sẽ không test được.

### Trường hợp 3 — muốn sửa test plan trước khi chạy

Khi CLI hỏi lựa chọn, chọn:

```text
3
```

Sau đó mở `templates/test-cases.md` để chỉnh tay rồi chạy lại.

### Trường hợp 4 — Tự động xử lý SSL trên localhost

Nếu bạn nhập `https://localhost` nhưng server chỉ hỗ trợ `http`, tool sẽ tự động fallback sang `http` và tiếp tục chạy thay vì báo lỗi protocol.

### Trường hợp 5 — Muốn quay video chậm hơn

Chế độ mặc định dừng **1 giây** sau mỗi bước để video quay lại rõ ràng. Bạn có thể chỉnh `STEP_DELAY` trong `.env` để thay đổi độ trễ này.

---

## 11. Gợi ý demo cho người khác xem

Thứ tự mở màn hình nên là:

1. `templates/test-cases.xlsx`
2. `templates/test-cases.md`
3. terminal đang chạy lệnh `node src/index.js convert ./templates/test-cases.xlsx`
4. `runs/run_<timestamp>/report.md`
5. một video bất kỳ trong `runs/run_<timestamp>/cases/<tc-id>/`

Người xem sẽ hiểu được trọn luồng:

**Excel → Markdown → Execute → Evidence → Report**

---

## 12. Nếu muốn đọc mã nguồn thì bắt đầu ở đâu?

- `src/index.js` — entry point CLI
- `src/parser.js` — đọc Excel và chuẩn hóa test case
- `src/generator.js` — sinh/cập nhật Markdown
- `src/runner.js` — chạy Playwright và so sánh expected vs actual
- `src/results.js` — lưu kết quả và sinh báo cáo

---

## 13. Đọc gì tiếp theo?

- Muốn chạy nhanh ngay: mở `quickstart.md`
- Muốn mang sang máy khác: mở `PORTABILITY.md`
- Muốn hiểu yêu cầu chức năng: mở `product-tester-spec.md`
- Muốn hiểu kiến trúc hiện tại: mở `product-tester-plan.md`

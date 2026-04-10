# Đặc Tả Chức Năng: product Tester

## 1. Tổng quan

`product Tester` là CLI hỗ trợ kiểm thử bán tự động theo quy trình:

**Excel test case → Markdown review → chạy Playwright → lưu evidence → sinh report**

Mục tiêu của tool là giúp tester hoặc người nhận bàn giao có thể chạy test trên website bất kỳ mà không cần chỉnh mã nguồn quá nhiều.

---

## 2. Yêu cầu chức năng

### 2.1 Chuyển đổi nguồn test

- **Đầu vào:** file Excel `.xlsx` chứa test case
- **Cách xử lý:** parser phải hỗ trợ:
  - nhận diện cột theo tên header
  - fallback theo vị trí cột nếu schema thực tế không chuẩn hoàn toàn
- **Đầu ra:** file Markdown `.md` để tester review trước khi chạy

### 2.2 Xác nhận của tester

- Hệ thống phải dừng sau bước convert để tester review file Markdown
- Tester xác nhận có tiếp tục chạy hay không trong terminal
- Sau xác nhận, CLI phải hỗ trợ:
  - chạy toàn bộ
  - chạy theo danh sách ID
  - chạy lại các case fail hoặc blocked

### 2.3 Thực thi test

- Engine thực thi dùng Playwright
- Cho phép chạy trên URL ứng dụng được nhập lúc chạy hoặc lấy từ `.env`
- Hỗ trợ mode mở trình duyệt thật (`--headed`) để quan sát trực tiếp
- Hỗ trợ `STEP_DELAY` để làm chậm quá trình thực thi nhằm mục đích demo/quay video
- Tự động fallback SSL (`https` -> `http`) khi gặp lỗi protocol trên `localhost`

### 2.4 So sánh kết quả

- Mỗi test case phải có bước so sánh **Expected vs Actual**
- Không được đánh dấu pass chỉ vì script không bị crash
- Kết quả phải phản ánh đúng trạng thái thực tế của ứng dụng đang test

### 2.5 Bằng chứng và lưu trữ kết quả

- Mỗi test case phải lưu:
  - `result.json`
  - ảnh chụp màn hình
  - video chạy test
- Mỗi lần chạy phải có thư mục riêng theo timestamp
- Sau mỗi test case, file Markdown plan phải được cập nhật lại ngay
- Cuối run phải sinh:
  - `summary.json`
  - `report.md`

### 2.6 Retry

- Hệ thống phải ghi `latest-run.json`
- Cho phép chạy lại các case fail hoặc blocked từ lần chạy trước

---

## 3. Yêu cầu phi chức năng

- **CLI-first:** toàn bộ thao tác chính diễn ra trong terminal
- **Dễ bàn giao:** chỉ cần copy thư mục dự án và cài dependency là có thể dùng
- **Dễ mở rộng:** có thể đổi URL và dùng với website khác
- **Dễ bảo trì:** tách rõ parser, generator, runner, results, retry

---

## 4. Hành trình sử dụng chuẩn

1. Tester chuẩn bị `templates/test-cases.xlsx`
2. Chạy:
   ```bash
   node src/index.js convert ./templates/test-cases.xlsx
   ```
3. Hệ thống sinh `templates/test-cases.md`
4. Tester review file Markdown
5. Hệ thống hỏi chạy toàn bộ hay chọn theo ID
6. Hệ thống hỏi URL ứng dụng cần test
7. Playwright chạy từng test case
8. Sau mỗi case, Markdown plan được cập nhật
9. Hệ thống lưu kết quả vào `runs/run_<timestamp>/`
10. Tester mở `report.md` để xem báo cáo tổng

---

## 5. Cấu trúc đầu ra mong muốn

```text
runs/
├── latest-run.json
├── reports/
└── run_<timestamp>/
    ├── cases/
    │   └── <tc-id>/
    │       ├── result.json
    │       ├── <tc-id>.png
    │       └── <tc-id>.webm
    ├── summary.json
    └── report.md
```

---

## 6. Trạng thái hiện tại

Implementation hiện tại đã hỗ trợ:

- convert Excel sang Markdown
- review rồi mới chạy
- chọn all / select / retry
- so sánh expected vs actual theo rule hiện có
- lưu evidence và sinh report
- cập nhật lại file Markdown theo kết quả run mới nhất
- hỗ trợ các bước tự nhiên: Scroll, Mobile View, Read/Look at
- tự động bóc tách selector thông minh từ ngôn ngữ tự nhiên

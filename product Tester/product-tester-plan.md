---
title: "product Tester technical overview"
description: "Tóm tắt kiến trúc, trạng thái triển khai và định hướng bảo trì cho product Tester"
status: active
priority: P1
created: 2026-04-08
updated: 2026-04-09
---

# Tổng quan kỹ thuật

Tài liệu này dùng cho người cần hiểu **kiến trúc hiện tại** của `product Tester`, không phải tài liệu sử dụng hằng ngày.

Nếu bạn chỉ muốn chạy tool, đọc `README.md` và `quickstart.md` là đủ.

---

## 1. Kiến trúc hiện tại

### Stack chính

- **Node.js CLI**
- **XLSX** để đọc Excel
- **Playwright** để chạy test trên trình duyệt
- **Markdown generator** để sinh/cập nhật test plan và report

### Các module quan trọng

| Module | Vai trò |
|--------|---------|
| `src/index.js` | điều phối CLI, convert/run, review flow |
| `src/parser.js` | đọc Excel, nhận diện schema linh hoạt, chuẩn hóa test case |
| `src/generator.js` | sinh và cập nhật Markdown plan |
| `src/runner.js` | thực thi Playwright và đánh giá expected vs actual |
| `src/results.js` | lưu evidence, cập nhật plan, sinh summary/report |
| `src/retry.js` | hỗ trợ chạy lại case fail hoặc blocked |
| `src/config.js` | đọc cấu hình từ `.env` |

---

## 2. Trạng thái triển khai

### Đã hoàn thành

- [x] Convert Excel sang Markdown
- [x] Review file Markdown trước khi chạy
- [x] Chạy all / select / retry
- [x] Hỗ trợ schema linh hoạt cho Excel thực tế
- [x] Có bước expected-vs-actual assertion
- [x] Lưu screenshot + video + result.json cho từng case
- [x] Cập nhật lại `templates/test-cases.md` sau mỗi lần chạy
- [x] Sinh `summary.json`, `report.md`, `latest-run.json`
- [x] Có script setup cho bàn giao sang máy khác
- [x] Hỗ trợ bước tự nhiên (Scroll, Mobile View, Observation)
- [x] Tự động fallback SSL cho localhost
- [x] Tùy chỉnh độ trễ thực thi `STEP_DELAY`

### Đã kiểm chứng gần nhất

Run xác minh gần nhất cho bộ case mẫu đạt:

- **4 passed / 1 failed**

Case fail còn lại là `TC-03`, nguyên nhân do dữ liệu thực tế của app trả `User already exists`, không phải do thiếu tính năng của CLI.

---

## 3. Cấu trúc dữ liệu và đầu ra

### Đầu vào chuẩn

File Excel nên có tối thiểu các cột tương đương:

- ID
- Scenario / Test name
- Description
- Steps
- Expected Result

Parser hiện tại cho phép:

- match theo tên header
- fallback theo vị trí cột nếu file thực tế không đúng mẫu tuyệt đối

### Đầu ra chuẩn

```text
templates/test-cases.md
runs/latest-run.json
runs/run_<timestamp>/cases/<tc-id>/result.json
runs/run_<timestamp>/cases/<tc-id>/<tc-id>.png
runs/run_<timestamp>/cases/<tc-id>/<tc-id>.webm
runs/run_<timestamp>/summary.json
runs/run_<timestamp>/report.md
```

---

## 4. Luồng chạy nội bộ

1. CLI nhận file Excel
2. Parser chuẩn hóa danh sách test case
3. Generator sinh Markdown plan
4. Tester review và chọn mode chạy
5. Runner chạy từng case bằng Playwright
6. ResultsManager cập nhật kết quả ngay sau từng case
7. Cuối run, hệ thống sinh summary/report và cập nhật `latest-run.json`

---

## 5. Điểm cần chú ý khi bảo trì

### 5.1 Rule assertion hiện tại là rule-based

`runner.js` đang dùng tập rule suy diễn từ nội dung expected result.

Điều này phù hợp cho demo và nhiều case phổ biến, nhưng khi mở rộng cho nhiều sản phẩm khác nhau có thể cần:

- tăng số rule (đã bổ sung Scroll, Mobile, Keyword fallback)
- thêm selector chuyên biệt (đã nâng cấp logic bóc tách ngôn ngữ tự nhiên)
- hoặc tách assertion engine riêng

### 5.2 Test case phụ thuộc dữ liệu thật của app

Ví dụ case đăng ký có thể fail nếu username đã tồn tại.

Muốn chạy ổn định hơn trong CI/demo lặp lại, nên có chiến lược:

- reset dữ liệu test
- hoặc sinh dữ liệu động

### 5.3 Tài liệu người dùng đã được gom lại

Các tài liệu cũ kiểu research / task breakdown / plan thử nghiệm rời rạc đã được rút gọn khỏi bộ onboarding chính để giảm nhiễu cho người mới.

---

## 6. Hướng mở rộng nếu làm tiếp

1. Bổ sung thêm rule cho bước nhập liệu/điều hướng tiếng Việt phức tạp hơn
2. Tăng độ ổn định selector resolver
3. Hỗ trợ nhiều template Excel hơn
4. Cải thiện report để có phần tổng hợp lỗi theo nhóm vấn đề
5. Bổ sung smoke test tự động cho chính CLI này

---

## 7. Tài liệu kỹ thuật liên quan

- `product-tester-spec.md` — mô tả chức năng
- `README.md` — onboarding tổng quát
- `quickstart.md` — chạy nhanh
- `PORTABILITY.md` — bàn giao máy khác

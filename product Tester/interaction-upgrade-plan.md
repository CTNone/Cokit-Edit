---
title: "product Tester interaction upgrade plan"
description: "Kế hoạch nâng cấp khả năng tương tác của product Tester theo 3 phase A/B/C"
status: pending
priority: P1
effort: 12h
tags: [product-tester, playwright, interaction, roadmap]
created: 2026-04-09
---

# Kế hoạch nâng cấp khả năng tương tác của `product Tester`

Tài liệu này mô tả roadmap nâng cấp chất lượng tương tác với website cho `product Tester` theo 3 phase:

- **Phase A** — Củng cố deterministic engine
- **Phase B** — Mở rộng phạm vi website hỗ trợ
- **Phase C** — Hybrid intelligence với LLM fallback

Mục tiêu là tăng độ ổn định, độ bao phủ và khả năng mở rộng của tool mà vẫn giữ nguyên nguyên tắc:

- **KISS**
- **YAGNI**
- **DRY**

---

## Phase Checklist

- [x] Phase A: Củng cố deterministic interaction engine (4h)
- [ ] Phase B: Mở rộng hỗ trợ cho website phức tạp hơn (4h)
- [ ] Phase C: Thêm hybrid intelligence / LLM fallback (4h)

---

## Phase A — Củng cố deterministic interaction engine

### Mục tiêu

Tăng độ ổn định cho luồng hiện tại mà **không đưa AI/LLM vào**.

Đây là phase nên làm đầu tiên vì chi phí thấp hơn, rủi ro thấp hơn, nhưng cải thiện chất lượng thực tế rõ nhất.

### Hiện trạng cần xử lý

- `runner.js` đang ôm quá nhiều trách nhiệm
- selector resolution còn tương đối mỏng
- wait strategy vẫn thiên về `waitForLoadState` + timeout ngắn
- chưa có auto-scroll chuyên biệt trước khi tương tác
- việc debug step fail còn phụ thuộc nhiều vào log text đơn giản

### Phạm vi công việc

1. Tách `runner.js` thành các lớp/utility nhỏ hơn:
   - `step-parser`
   - `selector-resolver`
   - `action-executor`
   - `assertion-engine`
2. Bổ sung selector fallback nhiều tầng hơn:
   - role
   - text
   - label
   - placeholder
   - aria-label
   - id/testid nếu có
3. Thêm `auto-scroll` trước khi click/fill
4. Thêm wait strategy thông minh hơn:
   - chờ visible
   - chờ enabled
   - chờ attached
   - chờ URL/text thay đổi khi cần
5. Chuẩn hóa log lỗi theo loại:
   - selector fail
   - action fail
   - assertion fail
   - timeout fail

### Lợi ích

- tăng pass rate cho các website form-based phổ biến
- giảm flaky test
- dễ debug hơn
- tạo nền tốt trước khi mở rộng thêm công nghệ khác

### Rủi ro

- refactor lớn vào `runner.js` có thể làm phát sinh bug nếu không có test nội bộ
- dễ over-engineer nếu tách lớp quá sớm mà không chốt interface rõ ràng

### Success Criteria

- pass rate tăng rõ ở các flow login/register/logout/forgot-password
- số lỗi “không tìm thấy element” giảm
- step fail có log đủ rõ để đọc report mà không cần mở code

### Trạng thái triển khai

Đã triển khai trong codebase hiện tại:

- tách `runner.js` thành các lớp nhỏ hơn: `step-parser`, `selector-resolver`, `action-executor`, `assertion-engine`
- thêm phân loại lỗi tương tác qua `interaction-errors.js`
- thêm selector fallback nhiều tầng + chuẩn bị element trước khi tương tác
- thêm auto-scroll / visible / enabled wait cơ bản trong selector resolver
- thêm timeout cấu hình được qua `INTERACTION_TIMEOUT`, `ASSERTION_TIMEOUT`, `STEP_RETRY_LIMIT`
- verify thực tế bằng CLI trên bộ test mẫu

Kết quả verify gần nhất:

- **3 passed / 1 failed / 1 blocked**
- `TC-03` fail vì dữ liệu thực tế của hệ thống
- `TC-04` blocked đúng theo phụ thuộc vào `TC-03`, thay vì fail mơ hồ như trước

---

## Phase B — Mở rộng hỗ trợ cho website phức tạp hơn

### Mục tiêu

Mở rộng phạm vi website mà tool có thể xử lý được, thay vì chỉ phù hợp nhất với form-based web đơn giản.

### Hiện trạng cần xử lý

Tool hiện mạnh ở flow cơ bản nhưng còn yếu khi gặp:

- modal/drawer/dropdown phức tạp
- table/grid/action menu
- SPA rendering động
- upload file
- drag & drop
- iframe
- shadow DOM

### Phạm vi công việc

1. Bổ sung support cho component interaction nâng cao:
   - modal
   - dropdown
   - menu nhiều tầng
   - table row action
2. Thêm abstraction cho thao tác file:
   - upload file
   - chọn file input
3. Thêm support cơ bản cho:
   - iframe traversal
   - shadow DOM traversal
4. Thêm rule nhận diện step tiếng Việt/Anh linh hoạt hơn
5. Tăng mức độ assert được cho expected result nghiệp vụ trung bình:
   - table có dòng mới
   - toast/snackbar
   - badge/status thay đổi

### Lợi ích

- phạm vi website hỗ trợ rộng hơn đáng kể
- giảm nhu cầu custom tay cho từng sản phẩm
- tăng giá trị thật của tool khi bàn giao cho nhiều team khác nhau

### Rủi ro

- complexity tăng nhanh nếu gom quá nhiều rule đặc thù vào một chỗ
- support iframe/shadow DOM nửa vời còn nguy hiểm hơn chưa support

### Success Criteria

- test được thêm ít nhất 2–3 nhóm UI phức tạp hơn ngoài form thường
- có guideline rõ: web nào support tốt, web nào support hạn chế
- engine không bị phình logic vô tổ chức sau khi thêm capability mới

---

## Phase C — Hybrid intelligence với LLM fallback

### Mục tiêu

Đưa LLM vào đúng chỗ: **fallback**, không thay toàn bộ deterministic engine.

### Quan điểm thiết kế

Không nên nhảy thẳng sang “LLM điều khiển mọi thứ”.

Hướng đúng là:

1. rule-based chạy trước
2. nếu không parse được step / không tìm được selector / không assert được
3. mới gọi LLM fallback

### Phạm vi công việc

1. Tạo mode chạy rõ ràng:
   - `rule`
   - `hybrid`
2. Thêm lớp riêng:
   - `llm-client`
   - `step-interpreter`
   - `llm-assertion-helper`
3. Xác định rõ use case cho LLM:
   - diễn giải step tự do
   - gợi ý selector fallback
   - giải thích actual vs expected khi rule hiện tại không đủ
4. Log đầy đủ reasoning/output của LLM vào artefact của run
5. Có cơ chế timeout/fallback khi LLM lỗi hoặc unavailable

### Lợi ích

- tăng độ linh hoạt cho step tự nhiên hơn
- mở đường để support nhiều loại website hơn mà không cần hard-code quá nhiều
- giảm áp lực viết vô hạn rule thủ công

### Rủi ro

- nondeterministic
- tốn thời gian chạy và chi phí tài nguyên
- khó debug nếu không lưu reasoning/output
- dễ khiến tester ảo tưởng rằng tool đã “test được mọi website” dù thực tế không phải vậy

### Success Criteria

- hybrid mode xử lý được thêm các step mà rule mode hiện tại bó tay
- khi LLM fail, tool vẫn degrade gracefully về rule mode
- report/log cho phép audit được quyết định do LLM đề xuất

---

## So sánh 3 phase

| Phase | Giá trị ngắn hạn | Độ khó | Rủi ro | Ưu tiên |
|------|-------------------|--------|--------|---------|
| A | Cao nhất | Trung bình | Thấp | Làm trước |
| B | Cao | Trung bình đến cao | Trung bình | Làm sau A |
| C | Rất cao nếu làm đúng | Cao | Cao | Chỉ làm sau A/B |

---

## Khuyến nghị cuối cùng

### Nên làm theo thứ tự

1. **Phase A trước**
2. **Phase B sau**
3. **Phase C cuối cùng**

### Không nên làm

- không nên nhảy thẳng sang LLM khi engine deterministic còn chưa vững
- không nên quảng bá tool là “test được mọi website” trước khi hoàn thành ít nhất A + một phần B

---

## Next Steps

Sau khi chốt roadmap này, có thể đi tiếp theo một trong hai hướng:

1. Tạo breakdown task chi tiết cho từng phase
2. Chọn ngay **Phase A** để lập implementation plan sâu hơn

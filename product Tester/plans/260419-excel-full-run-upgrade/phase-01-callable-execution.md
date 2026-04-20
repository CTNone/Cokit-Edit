# Phase 1: Sub-scenario & Callable Execution

## Overview
- **Date:** 2026-04-19
- **Priority:** Viễn cảnh quan trọng nhất (P1)
- **Status:** Pending

## Context & Key Insights
Test Case đang yêu cầu gọi một TC khác (VD: `1. Thực hiện TC-04`). Tính năng Dependencies cũ chỉ cho phép chạy trước toàn bộ để pass/fail, không thể đệ quy chạy step ở bên trong step hiện tại một cách liền mạch.

## Requirements
- `LLM-Compiler`: Hiểu được cú pháp `Thực hiện TC-xx` và chuyển về `[CALL] "TC-xx"`.
- `ActionExecutor` và `Runner`: Xử lý được action `[CALL]`, tìm kiếm TC trong catalog và đẩy mảng steps của TC đó vào hàm chay đệ quy mà vẫn giữ nguyên state web đang duyệt.

## Related code files
- `src/llm-compiler.js`
- `src/action-executor.js`
- `src/runner.js`

## Implementation Steps
1. Mở `src/llm-compiler.js`, cập nhật `systemPrompt` thêm DSL: `[CALL] "ID_hoặc_Tên_TC" (e.g. Thực hiện TC-04 -> [CALL] "TC-04")`.
2. Trong `src/action-executor.js` import tham chiếu đến `catalog` (hoặc pass via options).
3. Thêm logic trong `action-executor.js` cho type `call`:
    - Tìm TC trong catalog.
    - Duyệt mảng `steps` của TC đó và đệ quy gọi `this.execute()` cho từng step con.
4. Xử lý UI Logger (cho console) để in ra thụt dòng nhằm báo hiệu đang chạy Step con.

## Success Criteria
- Khi chạy TC-07 sinh ra được lệnh DSL `[CALL] "TC-04"`.
- Browser thực hiện tuần tự các step trong TC-04 rồi mới chuyển qua step tiếp theo của TC-07.

## Risk Assessment
- *Vòng lặp vô hạn (Infinite Loop)*: Nếu TC-A gọi TC-B, mà TC-B lại gọi TC-A. Cần có biến đếm `callDepth` giới hạn đệ quy tối đa (vd: 3).

## Next steps
- Di chuyển sang Phase 2 để giải quyết window context.

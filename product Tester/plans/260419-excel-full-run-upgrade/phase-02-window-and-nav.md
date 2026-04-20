# Phase 2: Window vs Tab Context & Smart Navigation

## Overview
- **Date:** 2026-04-19
- **Priority:** P1
- **Status:** Pending

## Context & Key Insights
Trang Unigate dùng cấu trúc Tab nội bộ UI, không kích hoạt cửa sổ trình duyệt mới. Nếu LLM gặp chữ "Tab" và đổi thành `[SWITCH_WINDOW]`, hệ thống sẽ lỗi. Bên cạnh đó, việc điều hướng Breadcrumbs `Nav > HRM > Departments` cần được tự động phân tách.

## Requirements
- LLM tránh lạm dụng `[SWITCH_WINDOW]`. Chỉ dùng cho cửa sổ thực (window/popup mới).
- LLM tách `Truy cập A > B > C` thành nhiều lệnh `[CLICK]` đơn lẻ (tốt nhất).
- Hoặc System Action tự động Split ra click chain.

## Related code files
- `src/llm-compiler.js`

## Implementation Steps
1. Sửa `systemPrompt` trong `src/llm-compiler.js`:
    - Bổ sung quy tắc: `Tuyệt đối KHÔNG dùng [SWITCH_WINDOW] cho các UI Tab, Header Tab trong nội bộ trang (ví dụ: "chuyển sang tab HRM", "Tab Department Graph" trên web SPA). Chỉ dùng [SWITCH_WINDOW] khi mô tả mở tab TRÌNH DUYỆT MỚI. Sử dụng [CLICK] cho trường hợp UI tab.`
2. Bổ sung quy tắc phân tách Menu Breadcrumb cho LLM:
    - `Khi điều hướng menu nhiều cấp (Ví dụ: "Truy cập HRM > Departments"), phải tách thành nhiều hành động CLICK tương ứng: 1. [CLICK] "HRM" \n 2. [CLICK] "Departments"`.
    - `Sử dụng [HOVER] nếu menu cấp 1 yêu cầu chỉ chuột để mở sub-menu.`
3. Chạy lệnh `node src/index.js convert` lại với file Excel để xác minh kết quả Prompt.

## Success Criteria
- Các bước trong file markdown báo `[CLICK] "Department Graph"` thay vì `[SWITCH_WINDOW]`.
- Lệnh "Truy cập HRM > Departments" được tách thành 2 lines: `[CLICK] "HRM"` và `[CLICK] "Departments"`.

## Security Considerations
- Việc tăng complex cho Prompt có thể dễ làm LLM Hallucinate. Cần Temperature = 0 và system prompt rất cứng.

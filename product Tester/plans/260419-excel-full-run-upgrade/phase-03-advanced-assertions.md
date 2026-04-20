# Phase 3: Explicit Assertions & Advanced Interaction

## Overview
- **Date:** 2026-04-19
- **Priority:** P2
- **Status:** Pending

## Context & Key Insights
Assertions hiện tại trông chờ 100% vào AI Screenshot Reader lúc kết thúc scenario. Nếu muốn test count ("Có 3 app", "Duy nhất 1 ticket") hoặc visibility thì cần Deterministic Actions. Tương tác với sơ đồ Graph SVG/Canvas cũng đang là hidden risk.

## Requirements
- DSL Assertions mạnh mẽ: `[ASSERT_VISIBLE]`, `[ASSERT_COUNT]`, `[ASSERT_TEXT]`.
- Nâng cấp `AssertionEngine` để xử lý các Action-based assert này ngay trong runtime chứ không chỉ ở cuối.
- Graph Selection: Nếu locator không ăn thua, bổ sung cơ chế Visual Locator.

## Related code files
- `src/llm-compiler.js`
- `src/action-executor.js`
- `src/actions/interaction.js`
- `src/selector-resolver.js`

## Implementation Steps
1. Bổ sung Explicit Assertions vào DSL ở Compiler: `[ASSERT_VISIBLE] "tên element"`, `[ASSERT_COUNT] "tên element" : "số_lượng"`.
2. Tạo module `AssertionAction` bên trong thư mục `src/actions/`.
3. Cho phép `action-executor` hiểu các lệnh Assert này. Chúng hoạt động kiểu wait/expect thay vì ném lỗi (hoặc ném lỗi nếu quá thời gian timeout).
4. **Graph interact**: Bổ sung action `[CLICK_OFFSET] "target" : "x:y" (hoặc dưới/trên)` hoặc dùng Visual DOM (Playwright test locator) `getByRole('graphics-symbol')` nếu dev dùng SVG. Tạm thời, nếu click fail, LLM-Healing sẽ báo "Not found".

## Success Criteria
- Hệ thống có thể verify "3 kết quả" hoặc "1 kết quả duy nhất" chính xác mà không tốn Token của AI, hoàn toàn do Playwright DOM check.

## Next steps
- Review tiến độ toàn dự án và validate qua lệnh `/ck-test`.

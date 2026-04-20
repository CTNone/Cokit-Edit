---
title: "Nâng cấp Product Tester để chạy toàn bộ cnt_test_fkr.xlsx"
description: "Implementation roadmap for adding callable execution, smart window handling, navigation, and robust assertions."
status: pending
priority: P1
effort: 18h
tags: [automation, playwright, dsl, llm]
created: 2026-04-19
---

# Kế hoạch nâng cấp Product Tester

Bản dự thảo này bao gồm chi tiết các tính năng cần phát triển dựa trên kết quả Brainstorming. Mục tiêu là cho phép hệ thống tự động nhận dạng, biên dịch và thực thi 100% các Test Case trong file `cnt_test_fkr.xlsx`.

## Thông tin Context
- Ứng dụng mục tiêu: Mini Unigate (HRM, Ticket Management, SLA)
- Công nghệ hiện tại: Playwright (Runner) + Node.js CLI + LLM (Compiler, Healing)
- Rào cản hiển tại: Không thể chạy test lồng nhau, nhận sai ngữ cảnh "Tab", không hỗ trợ menu con, thiếu assertions cụ thể.

## Phase Checklist

- [ ] Phase 1: Callable Execution & DSL Sub-scenario (6h) — *no dependencies*
- [ ] Phase 2: Tab vs Window & Smart Navigation (4h) — *depends on Phase 1*
- [ ] Phase 3: Explicit Assertions & Canvas Interact (8h) — *depends on Phase 2*

*Xem chi tiết kế hoạch các phase ở các file `phase-xx`.*

---
title: "Autonomous Web Exploration & Test Generation"
description: "Implement an AI-powered exploration engine to discover user flows and generate test cases automatically, inspired by quorvex_ai."
status: pending
priority: P1
effort: 6h
tags: [exploration, ai-agent, test-generation, playwright]
created: 2026-04-20
---

# Autonomous Web Exploration & Test Generation

This plan outlines the implementation of a new `explore` command for `product Tester`. This command will enable the tool to autonomously navigate a web application, map its structure, discover user journeys (flows), and generate test artifacts without requiring manual test case input.

## Background

Currently, `product Tester` follows a "Scripted" approach: Excel -> Markdown -> Playwright. 
`quorvex_ai` demonstrates an "Autonomous" approach where an AI agent explores a site, maps its structure (`app_explorer.py`), and synthesizes specs/tests. This plan brings that capability to `product Tester`.

## Solution Architecture

1.  **`ExplorationAgent` (Core logic):** A new class that manages the exploration lifecycle.
    - **Site Mapper:** Extracts internal links to build a site map.
    - **Queue Manager:** Tracks visited and unvisited URLs.
    - **Interaction Loop:** For each page, performs 3-5 interactions (click buttons, fill forms) to discover "hidden" states.
    - **Flow Recorder:** Captures sequences of actions that lead to significant state changes (e.g., login, form submission).

2.  **`explore` CLI Command:** Entry point in `src/index.js`.
    - Arguments: `<url>`
    - Options: `--max-pages`, `--depth`, `--output`.

3.  **Synthesis Engine:** Converts recorded flows into the existing `product Tester` test case format (DSL-based Markdown or Excel).

## Phase Checklist

- [ ] Phase 1: Exploration Engine (3h)
- [ ] Phase 2: CLI & Integration (1h)
- [ ] Phase 3: Test Case Synthesis (2h)

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breadth-first exploration can be slow | Limit depth and total pages visited by default. |
| AI hallucinating interactions | Use `selector-resolver.js` and validation snapshots. |
| Infinite loops in navigation | Use a Set to track visited URLs and interaction hashes. |
| Form submission on production | Add a `--safety` flag or warning for destructive actions. |

## Unresolved Questions
- Should we support authentication during exploration? (Propose: reuse `quorvex_ai`'s login-first pattern).
- Default output format: Markdown (easier) or Excel (user requested)?

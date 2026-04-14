---
title: "LLM-Compiled DSL Architecture Refactor"
description: "Refactor architecture to compile natural language test steps into structured DSL keyword commands via LLM before execution, eliminating massive regex parsers."
status: pending
priority: P1
effort: 8h
tags: [architecture, refactor, llm, dsl, parser]
created: 2026-04-10
---

# LLM-Compiled DSL Architecture Master Plan

## 1. Problem Statement & Goals
Currently, the automation framework attempts to parse freeform natural language (English & Vietnamese) mostly via regular expressions in `step-parser.js`. This approach does not scale across 8 broad functional categories, causing high maintenance overhead and brittle test plans. The goal is to refactor the system by shifting the natural language parsing to an LLM "Compiler" phase *before* the markdown test plan is generated. The execution engine will then only need to parse a simplified, strict Domain Specific Language (DSL).

## 2. Architecture Spec: Compile -> Review -> Run
- **Compile Phase (`llm-compiler.js`)**: Hook into the process right after Excel (`xlsx`) parsing. Intercept raw steps and run them through the `LlmClient` with a strict system prompt instructing it to translate sentences into standard DSL.
- **Review Phase (`generator.js`)**: Output the translated DSL strings into the markdown test plan file. Testers review the `.md` file to ensure the LLM compiled the intent accurately, and can manually tweak the DSL if needed.
- **Run Phase (`step-parser.js` & `action-executor.js`)**: The `step-parser` logic drops all generic heuristics and only matches deterministic `[ACTION] "Target" : "Value"` structures. The `action-executor` utilizes the Strategy Pattern to decouple actions into cleanly separated modules.

## 3. Target DSL Definition (Standard Actions)
The LLM Prompt should enforce the following structured output templates:

**Navigation:** 
- `[GOTO] "url_or_phrase"`
- `[NAV] "back" | "next" | "refresh"`

**Content View:** 
- `[SCROLL] "bottom" | "top"`
- `[SCROLL_TO] "element_name"`

**Forms & Inputs:** 
- `[FILL] "field_name" : "value"`
- `[SELECT] "dropdown_name" : "option"`
- `[CHECK] "checkbox_name"`
- `[UPLOAD] "file_path" -> "input_name"`

**Auth & Context Reference:** 
- `[AUTH] login using "TC-xx"`
- `[AUTH] enter_email using "TC-xx"`

**Interaction:** 
- `[CLICK] "target"`
- `[HOVER] "target"`

**Assertion / System Feedback (Optional expansion later):** 
- `[ASSERT_TEXT] "expected_text"`
- `[ASSERT_VISIBLE] "element_name"`

## 4. Implementation Phases

### Phase Checklist

- [ ] Phase 1: LLM Compiler Integration (2h) — no dependencies
  - Create `src/llm-compiler.js` utilizing `LlmClient`.
  - Design robust System Prompt for DSL translation, focusing heavily on matching the 8 core categories.
  - Modify `src/index.js` (inside `preparePlan`) to run the translation step for each Scenario's steps before handing off to `MarkdownGenerator`.

- [ ] Phase 2: DSL Parsing Simplified (1.5h) — depends on Phase 1
  - Strip out all fuzzy NLP regex logic from `src/step-parser.js`.
  - Implement strict regex parsing to extract the main `[ACTION]` tag, target, and optional values.
  - Add robust fallback/error handling for improperly formatted DSL items so testers get immediate syntax warnings.

- [ ] Phase 3: Modular Action Executors (3h) — depends on Phase 2
  - Create `src/actions/` directory structure.
  - Break down the massive switch/case in `ActionExecutor` into separated strategy classes: `NavigationAction`, `FormAction`, `AuthAction`, `InteractionAction`.
  - Pass the current `Page` and `SelectorResolver` context consistently into these modules.
  
- [ ] Phase 4: Smart Selector Improvements (1.5h) — depends on Phase 3
  - Ensure `selector-resolver.js` can flexibly handle the simplified targets returned by the LLM. 
  - Enhance `resolveDropdown` and `resolveClickable` to handle custom UI libraries better (e.g., standardizing `<ul><li>` role menuitem targeting for dropdowns).

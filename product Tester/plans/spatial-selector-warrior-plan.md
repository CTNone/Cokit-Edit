# Implementation Plan: Spatial & Symbolic Selector Warrior

## 1. Problem Statement
Complex UIs like Organizational Charts (Department Graphs) lack traditional text labels for interactive elements (e.g., expand/collapse buttons). Users naturally describe these using spatial relations ("below FKR") and symbolic descriptions ("the minus sign"). The current system struggles with these non-textual, relative targets.

## 2. Objectives
- Enable **Spatial Awareness**: Support `below`, `above`, `left of`, `right of` keywords.
- Implement **Symbolic Mapping**: Recognition of `(+)`, `(-)`, `(x)`, `(>)` as functional UI icons.
- Upgrade **Visual Perception**: Extract computed styles (colors) and icon metadata for AI recovery.
- Improve **Relational Accuracy**: Target elements relative to a labeled "anchor" (e.g., "the red button under node X").

## 3. Technical Approach

### Phase 1: Spatial Parsing & Playwright Integration
- Update `SelectorResolver.resolveClickable` to parse patterns like `"{target} {relation} {anchor}"`.
- Map Vietnamese spatial keywords to Playwright's layout selectors:
    - `"dưới"`, `"phía dưới"` -> `:below()`
    - `"trên"`, `"phía trên"` -> `:above()`
    - `"trái"`, `"bên trái"` -> `:left-of()`
    - `"phải"`, `"bên phải"` -> `:right-of()`
    - `"gần"`, `"cạnh"` -> `:near()`

### Phase 2: Symbolic & Color Glossary
- Define a dictionary for common symbols:
    - `(-)`: `['.anticon-minus', '[aria-label*="collapse"]', '[title*="collapse"]', 'text="-"']`
    - `(+)`: `['.anticon-plus', '[aria-label*="expand"]', '[title*="expand"]', 'text="+"']`
- Implement a color extraction utility using `getComputedStyle` in `selfHeal` to identify elements by color names (red, blue, green).

### Phase 3: Augmented AI Context
- Enhance the element snapshot sent to LLM during recovery:
    - Add `computedColor` (e.g., `red`, `blue`).
    - Add `iconHint` (e.g., `minus`, `plus`, `user`).
    - Add `spatialInfo` (relative coordinates to the anchor node).

## 4. Implementation Steps

### `src/selector-resolver.js`
1.  **Symbol Mapping**: Add a static `SYMBOL_MAP`.
2.  **Spatial Logic**: 
    - Split input target if spatial keywords are detected.
    - Resolve the `anchor` element first.
    - Use `anchor.locator(targetSelector).locator(':below(...)')` logic.
3.  **Visual Scraper**: Update `collectElements` (internal AI helper) to include colors and icon types.
4.  **AI Prompt**: Update the system prompt to instruct the LLM on using `color` and `spatialInfo` for matching.

## 5. Validation Plan
- **Test Case 1**: `Click "(-)" dưới node "FKR"`
- **Test Case 2**: `Click "(-)" màu đỏ dưới "FKR"`
- **Test Case 3**: `Click "Department Graph" bên phải "Departments"`
- **Expectation**: The system correctly identifies the intended element even without direct text labels.

## 6. Risks & Mitigations
- **Ambiguity**: Multiple "minus" signs near the same anchor. 
    - *Mitigation*: Use `.first()` or refine by color/index.
- **Performance**: Computing styles for many elements is slow.
    - *Mitigation*: Only calculate metadata for the top 30-50 candidate elements identified by basic proximity.
    - *Filter*: Focus on `button`, `a`, `svg`, `role="button"`.

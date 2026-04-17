# Implementation Plan: Smart Container Lookup (Smart Card Lookup)

## 1. Problem Statement
Many modern UIs use "Cards" (containers with images, titles, and descriptions) where the entire container is clickable.
Standard text-based lookups often target specifically the `<span>` or `<a>` inside the card. If the user writes "click card HRM", the system should target the wrapper, not just the text.

## 2. Objectives
- Implement a "Parent Bubble" strategy to find clickable containers.
- Support prefixes like "card", "item", "ô", "khối" in natural language.
- Improve self-healing by instructing LLM to look for containers when relevant.

## 3. Technical Approach

### Phase 1: SelectorResolver Enhancement
Update `resolveClickable` in `src/selector-resolver.js`:
- **Keyword Detection**: Identify if the target starts with container-related keywords.
- **Ancestor Traversal**: Find the text node first, then use `.locator('xpath=ancestor::*[self::div or self::li or self::article or self::section][1]')` to find the immediate container.
- **Class Filtering**: Combine with common "card-like" classes (`.card`, `.item-box`, `.product-inner`).

### Phase 2: LLM Prompt Tuning
Update the `systemPrompt` in `src/selector-resolver.js`:
- Add a rule: "If the target is described as a 'card' or 'item', look for the wrapper container that groups the relevant information."

## 4. Implementation Steps

### `src/selector-resolver.js`
1.  Add `containerKeywords` regex.
2.  In `resolveClickable`, if a keyword matches:
    - Search for the inner text.
    - If found, attempt to bubble up to the nearest `div/li/article` that is "clickable-looking" (e.g. has hover effects or card classes).
3.  Update `selfHeal` system prompt to be "Container Aware".

## 5. Validation Plan
- **Test Case**: Search for "card Human Resource Management".
- **Expected**: The system should click the `div` wrapper of the card, not just the text inside it.
- **Fail-safe**: If no container is found, it must still fallback to clicking the text to avoid blocking.

## 6. Risks
- **Greediness**: It might click an outer container that is too large (e.g., the whole page).
- **Mitigation**: Limit the bubble-up distance (max 3 levels) and check for a size limit on the container.

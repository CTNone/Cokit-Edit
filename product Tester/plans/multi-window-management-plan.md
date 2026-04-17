# Implementation Plan: Multi-Window Management

## 1. Problem Statement
Many applications open key features in new tabs or popups (e.g., clicking on an App card in Unigate opens the HRM app in a new window). The current system only tracks a single page, causing it to lose the context of the new window.

## 2. Objectives
- Automatically track and switch to new windows as they open.
- Maintain window state between dependent test cases.
- Gracefully clean up (close) child windows when they are no longer needed.
- Provide manual control over window switching via natural language.

## 3. Technical Approach

### Phase 1: Auto-Capture & Page Tracking
Update `PlaywrightRunner` in `src/runner.js`:
-   **Page Registry**: Maintain a `this.pages` array synchronized with `browserContext.pages()`.
-   **Event Listener**: Attach `context.on('page', ...)` in `init()`.
-   **Auto-Focus**: When a new page is detected during an action, automatically update `this.activePage`.

### Phase 2: Smart Lifecycle Management
Update the cleanup logic in `runScenario`:
-   **Dependency Awareness**: If a scenario has "children" (dependent cases) in the queue, keep all its opened windows alive.
-   **Auto-Cleanup**: If a scenario is the end of a chain, close all windows except the "Root" page (the main dashboard).
-   **Page History**: Track which scenario opened which page.

### Phase 3: Explicit Navigation Actions
Update `src/step-parser.js` and `src/action-executor.js`:
-   **New Actions**:
    -   `[SWITCH_WINDOW] "Title/Url"`: Force focus on a specific window.
    -   `[CLOSE_WINDOW]`: Close the current tab and return to the previous one.
-   **Implementation**: Use `page.bringToFront()` and `page.title()` to manage focus.

## 4. Implementation Steps

### `src/runner.js`
1.  Initialize `this.pages = []` in constructor.
2.  Set up `persistentContext.on('page')` to push to `this.pages` and log the new window.
3.  Modify `runScenario` to use `this.pages[this.pages.length - 1]` as the default target if a new one was opened.
4.  Refine cleanup logic to handle multiple pages.

### `src/action-executor.js`
1.  Add `switchWindow(target)` and `closeWindow()` methods.

## 5. Validation Plan
- **Scenario**: Click "HRM App" (opens new tab), then "Click Department Graph" on the new tab.
- **Verification**: Ensure the second click happens on the correct HRM window.
- **Cleanup**: Verify the HRM tab closes only after all dependent cases are done.

## 6. Risks
- **Race conditions**: Tab might not be fully loaded when Auto-Focus triggers.
- **Mitigation**: Add a small `waitForLoadState` when auto-switching to a new page.

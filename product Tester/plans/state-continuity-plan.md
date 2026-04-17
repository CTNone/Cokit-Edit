# Implementation Plan: State Continuity for Test Dependencies

## 1. Problem Statement
Scenarios that depend on a prerequisite (e.g., TC-06 depends on TC-01) currently fail or become unstable because `PlaywrightRunner.runScenario` always forces a navigation to the `targetUrl` at the start of every script. This resets the UI state, potentially closing menus or redirecting the user, making subsequent steps like "hover 'admin'" fail.

## 2. Proposed Solution (Approach A)
Implement **State Continuity**: If a scenario has a prerequisite that just passed in the same run, the runner will skip the initial `page.goto(targetUrl)` and continue execution from the current page state.

## 3. Implementation Details

### Phase 1: Runner Logic Update (`src/runner.js`)
- **Modify `runScenario` signature**: Update `runScenario(scenario)` to accept a second parameter `isPrerequisiteRun = false`.
- **Track Continuity**: 
    - Inside `runScenario`, if `prereqStatus === 'passed'`, call the recursive `runScenario` or continue with a flag.
    - Actually, a better way is to pass a `skipInitialNav` flag to the main execution block.
- **Conditional Navigation**:
    ```javascript
    // src/runner.js
    if (!skipInitialNav) {
      await page.goto(this.options.targetUrl, { ... });
    } else {
      logger.info(`    [Continuity] Skipping initial navigation to preserve state from prerequisite.`);
    }
    ```

### Phase 2: Action Executor Sensitivity (`src/action-executor.js`)
- No changes needed to the executor itself, but ensure `ActionExecutor` context (like `targetUrl`) remains valid.

### Phase 3: Step Parser Refinement (Optional)
- If the first step of the dependent scenario is an explicit `[GOTO]`, it should still execute even if `skipInitialNav` is true.

## 4. Proposed Changes

### `src/runner.js`
1.  Add `isContinuation` logic to `runScenario`.
2.  Update the recursive call for prerequisites to signal that the browser is already "ready" for the next scenario.

### `src/logger.js` (Optional)
- Add a specific color or prefix for `[Continuity]` logs to make it clear to the user why navigation was skipped.

## 5. Validation Plan
- **Test Case**: Run TC-06 which depends on TC-01.
- **Success Criteria**:
    - TC-01 runs and logs in.
    - TC-06 starts **without** the page reloading to the login/home screen.
    - TC-06 successfully finds "admin" (which was revealed/persisted by TC-01).
    - Summary shows 2 Passed.

## 6. Risks & Mitigations
- **Risk**: Dependent scenario expects to be on a specific page that ISN'T where the prerequisite ended.
- **Mitigation**: Advise users to add an explicit `[GOTO]` step if they need a specific starting point within a dependency chain.
- **Risk**: Session timeout between scenarios.
- **Mitigation**: `STEP_DELAY` and overall execution speed should prevent this for most local runs.

## 7. Next Steps
1.  Apply changes to `src/runner.js`.
2.  Verify with TC-06.

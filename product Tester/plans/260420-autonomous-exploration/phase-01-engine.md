# Phase 1: Exploration Engine

## Goal
Implement the core `ExplorationAgent` in `src/exploration-agent.js` that can autonomously crawl and interact with a web app.

## Tasks
- [ ] Create `src/exploration-agent.js`.
- [ ] Implement `SiteMapper`: link extraction using Playwright `page.evaluate`.
- [ ] Implement `UnvisitedQueue` management with deduplication.
- [ ] Implement `InteractionLoop`: 
    - Identify interactive elements (buttons, inputs, links).
    - Perform actions and observe changes (URL changes, DOM updates).
    - Capture snapshots and browser logs (inspired by `quorvex_ai`).
- [ ] Implement `FlowRecorder`: Aggregate interactions into logical sequences.

## Success Criteria
- Agent can navigate through at least 3 levels of a site.
- Agent identifies at least 2 unique user flows (e.g., "Main -> Login -> Forgot Password").

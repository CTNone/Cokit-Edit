# Phase 2: CLI & Integration

## Goal
Expose the exploration capability through the CLI.

## Tasks
- [ ] Update `src/index.js` to add the `explore` command.
- [ ] Add options: `--max-pages`, `--depth`, `--output`, `--headed`.
- [ ] Connect `explore` command to `ExplorationAgent`.
- [ ] Implement progress logging using `src/logger.js`.

## Success Criteria
- Running `product-tester explore https://example.com` starts the exploration.
- Real-time logs show the URLs being visited and actions taken.

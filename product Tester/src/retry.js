const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const logger = require('./logger');

class RetryManager {
  async getFailedCaseIds() {
    const latestPath = path.join(config.RESULTS_DIR, 'latest-run.json');
    if (!await fs.pathExists(latestPath)) {
      logger.warn('No previous run found for retry.');
      return [];
    }

    const latestRun = await fs.readJson(latestPath);
    return latestRun.results
      .filter(r => r.status !== 'passed')
      .map(r => r.id);
  }

  filterTestCases(testCases, failedIds) {
    if (failedIds.length === 0) return [];
    return testCases.filter(tc => failedIds.includes(tc.ID));
  }
}

module.exports = new RetryManager();

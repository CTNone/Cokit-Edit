const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const logger = require('./logger');
const resultsManager = require('./results');
const { normalizeWhitespace, sanitizeFileSegment, normalizeUrl } = require('./utils');
const StepParser = require('./step-parser');
const ActionExecutor = require('./action-executor');
const AssertionEngine = require('./assertion-engine');
const { getErrorLabel } = require('./interaction-errors');

class PlaywrightRunner {
  constructor(options = {}) {
    this.options = {
      headed: options.headed || false,
      mode: options.mode || 'compile',
      targetUrl: normalizeUrl(options.targetUrl || config.TARGET_URL),
      ...options,
    };
    this.options.targetUrl = normalizeUrl(this.options.targetUrl);
    this.browser = null;
    this.catalog = new Map();
    this.referenceData = new Map();
    this.stepParser = new StepParser();
  }

  async init(runFolder, testCases = []) {
    logger.info(`Initializing browser (Headed: ${this.options.headed})...`);
    this.browser = await chromium.launch({ headless: !this.options.headed });
    this.catalog = new Map(testCases.map((testCase) => [String(testCase.id || testCase.ID).toUpperCase(), testCase]));
    this.referenceData = new Map(testCases.map((testCase) => [String(testCase.id || testCase.ID).toUpperCase(), this.extractScenarioData(testCase)]));
    this.runFolder = runFolder;
  }

  extractScenarioData(testCase) {
    const raw = normalizeWhitespace(testCase.stepsRaw || testCase.Steps || '');
    const extract = (field) => raw.match(new RegExp(`${field}\\s*:?\\s*"([^"]+)"`, 'i'))?.[1] || '';
    return {
      username: extract('username'),
      email: extract('email'),
      password: extract('password'),
    };
  }

  async runScenario(scenario) {
    const scenarioId = scenario.id || scenario.ID;
    const scenarioTitle = scenario.title || scenario.Scenario;
    logger.step(`Executing Scenario: ${scenarioId} — ${scenarioTitle}`);

    const caseFolder = resultsManager.getCaseFolder(scenario);
    await fs.ensureDir(caseFolder);

    const context = await this.browser.newContext({
      recordVideo: { dir: caseFolder, size: { width: 1280, height: 720 } },
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();
    const video = page.video();
    const actionExecutor = new ActionExecutor(page, {
      targetUrl: this.options.targetUrl,
      referenceData: this.referenceData,
      timeout: config.INTERACTION_TIMEOUT,
    });
    const assertionEngine = new AssertionEngine(page, {
      targetUrl: this.options.targetUrl,
      timeout: config.ASSERTION_TIMEOUT,
    });

    let failureStep = null;
    let payload = {
      status: 'failed',
      expected: scenario.expected || scenario['Expected Result'] || '',
      actual: 'Chưa có kết quả thực tế.',
      note: '-',
      evidence: {},
      failureStep: null,
    };

    try {
      await page.goto(this.options.targetUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});

      const steps = scenario.steps || [];
      for (let index = 0; index < steps.length; index += 1) {
        failureStep = index + 1;
        logger.dim(`    Action: ${normalizeWhitespace(steps[index])}`);
        await this.executeStepWithRetry(actionExecutor, steps[index], failureStep);
      }

      const evaluation = await assertionEngine.evaluate(scenario);
      payload = {
        ...payload,
        status: evaluation.passed ? 'passed' : 'failed',
        actual: evaluation.actual,
        note: evaluation.note,
      };
    } catch (error) {
      logger.error(`Scenario ${scenarioId} failed: ${error.message}`);
      payload = {
        ...payload,
        status: error.blocked ? 'blocked' : 'failed',
        actual: `Bước ${failureStep || '?'} gặp lỗi [${getErrorLabel(error.kind)}]: ${error.message}`,
        note: error.note || getErrorLabel(error.kind),
        failureStep,
      };
    }

    const screenshotPath = path.join(caseFolder, `${sanitizeFileSegment(scenarioId)}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    payload.evidence.screenshotPath = screenshotPath;

    await context.close();

    if (video) {
      const rawVideoPath = await video.path().catch(() => null);
      if (rawVideoPath) {
        const finalVideoPath = path.join(caseFolder, `${sanitizeFileSegment(scenarioId)}.webm`);
        if (rawVideoPath !== finalVideoPath) {
          await fs.move(rawVideoPath, finalVideoPath, { overwrite: true }).catch(() => {});
        }
        payload.evidence.videoPath = finalVideoPath;
      }
    }

    await resultsManager.addResult(scenario, payload);
    if (payload.status === 'passed') {
      logger.success(`Scenario ${scenarioId} completed.`);
    } else {
      logger.warn(`Scenario ${scenarioId} finished with status ${payload.status}.`);
    }
  }

  async executeStepWithRetry(actionExecutor, stepText, stepNumber, maxRetries = config.STEP_RETRY_LIMIT) {
    let attempt = 0;
    const action = this.stepParser.parse(stepText);

    while (attempt < maxRetries) {
      try {
        await actionExecutor.execute(action);
        await actionExecutor.page.waitForTimeout(config.STEP_DELAY);
        return;
      } catch (error) {
        attempt += 1;
        const nonRetryable = error.blocked || error.kind === 'action_fail';
        if (attempt >= maxRetries || nonRetryable) {
          error.stepNumber = stepNumber;
          throw error;
        }
        logger.warn(`    Step failed, retrying (${attempt}/${maxRetries}): ${stepText}`);
        logger.dim(`      Type: ${getErrorLabel(error.kind)}`);
        logger.dim(`      Reason: ${error.message.split('\n')[0]}`);
        await actionExecutor.page.waitForTimeout(1000 * attempt);
      }
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = PlaywrightRunner;

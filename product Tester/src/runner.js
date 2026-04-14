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
const LlmClient = require('./llm-client');
const StepInterpreter = require('./step-interpreter');
const LlmAssertionHelper = require('./llm-assertion-helper');

class PlaywrightRunner {
  constructor(options = {}) {
    this.options = {
      headed: options.headed || false,
      mode: options.mode || config.EXECUTION_MODE,
      targetUrl: normalizeUrl(options.targetUrl || config.TARGET_URL),
      ...options,
    };
    this.options.targetUrl = normalizeUrl(this.options.targetUrl);
    this.browser = null;
    this.catalog = new Map();
    this.referenceData = new Map();
    this.stepParser = new StepParser();
    this.llmClient = null;
    this.stepInterpreter = null;
    this.llmAssertionHelper = null;
  }

  async init(runFolder, testCases = []) {
    logger.info(`Initializing browser (Headed: ${this.options.headed})...`);
    this.browser = await chromium.launch({ headless: !this.options.headed });
    this.catalog = new Map(testCases.map((testCase) => [String(testCase.id || testCase.ID).toUpperCase(), testCase]));
    this.referenceData = new Map(testCases.map((testCase) => [String(testCase.id || testCase.ID).toUpperCase(), this.extractScenarioData(testCase)]));
    this.runFolder = runFolder;

    if (this.options.mode === 'hybrid') {
      this.llmClient = new LlmClient();
      this.stepInterpreter = new StepInterpreter(this.llmClient);
      this.llmAssertionHelper = new LlmAssertionHelper(this.llmClient);
      logger.info('Hybrid mode enabled: LLM fallback will be used when deterministic rules are insufficient.');
    }
  }

  async writeLlmArtifact(caseFolder, name, data) {
    const llmFolder = path.join(caseFolder, 'llm');
    await fs.ensureDir(llmFolder);
    const filePath = path.join(llmFolder, `${sanitizeFileSegment(name)}.json`);
    await fs.writeJson(filePath, data, { spaces: 2 });
    return filePath;
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
      recordVideo: { dir: caseFolder, size: { width: config.VIEWPORT_WIDTH, height: config.VIEWPORT_HEIGHT } },
      viewport: { width: config.VIEWPORT_WIDTH, height: config.VIEWPORT_HEIGHT },
    });

    if (this.options.headed) {
      await context.addInitScript(() => {
        if (window !== window.parent) return; // Chỉ hiện ở frame chính
        window.addEventListener('DOMContentLoaded', () => {
          const box = document.createElement('playwright-mouse-pointer');
          const style = document.createElement('style');
          style.innerHTML = `
            playwright-mouse-pointer {
              position: fixed; top: 0; left: 0; width: 14px; height: 14px;
              background: rgba(255, 69, 0, 0.6); border: 2px solid white;
              border-radius: 50%; pointer-events: none; z-index: 2147483647;
              transition: transform 0.08s ease-out, background 0.1s;
              box-shadow: 0 0 8px rgba(0,0,0,0.4); display: block;
            }
            playwright-mouse-pointer.clicked {
              background: rgba(0, 255, 0, 0.9); transform: scale(1.5);
            }
          `;
          document.head.appendChild(style);
          document.body.appendChild(box);
          document.addEventListener('mousemove', e => {
            box.style.left = e.clientX + 'px';
            box.style.top = e.clientY + 'px';
          }, true);
          document.addEventListener('mousedown', () => box.classList.add('clicked'), true);
          document.addEventListener('mouseup', () => box.classList.remove('clicked'), true);
        });
      });
    }

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
      llmAssertionHelper: this.llmAssertionHelper,
      onArtifact: async (name, data) => this.writeLlmArtifact(caseFolder, name, data),
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
        await this.executeStepWithRetry(actionExecutor, steps[index], failureStep, caseFolder);
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

    const llmFolder = path.join(caseFolder, 'llm');
    if (await fs.pathExists(llmFolder).catch(() => false)) {
      payload.evidence.llmFolderPath = llmFolder;
    }

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

  async executeStepWithRetry(actionExecutor, stepText, stepNumber, caseFolder, maxRetries = config.STEP_RETRY_LIMIT) {
    let attempt = 0;
    let action = this.stepParser.parse(stepText);

    if (action.type === 'unsupported' && this.stepInterpreter) {
      try {
        const llmResult = await this.stepInterpreter.interpretStep(stepText, {
          targetUrl: this.options.targetUrl,
          currentUrl: actionExecutor.page.url(),
        });
        await this.writeLlmArtifact(caseFolder, `step-${stepNumber}-parse-fallback`, llmResult).catch(() => {});
        if (llmResult?.parsed?.action?.type && llmResult.parsed.action.type !== 'unsupported') {
          action = { ...llmResult.parsed.action, raw: stepText };
        }
      } catch (error) {
        await this.writeLlmArtifact(caseFolder, `step-${stepNumber}-parse-fallback-error`, { message: error.message }).catch(() => {});
      }
    }

    while (attempt < maxRetries) {
      try {
        await actionExecutor.execute(action);
        await actionExecutor.page.waitForTimeout(config.STEP_DELAY);
        return;
      } catch (error) {
        attempt += 1;
        if (this.stepInterpreter && (error.kind === 'selector_fail' || error.kind === 'action_fail')) {
          try {
            const llmResult = await this.stepInterpreter.interpretStep(stepText, {
              targetUrl: this.options.targetUrl,
              currentUrl: actionExecutor.page.url(),
              errorMessage: error.message,
            });
            await this.writeLlmArtifact(caseFolder, `step-${stepNumber}-recovery-${attempt}`, llmResult).catch(() => {});
            if (llmResult?.parsed?.action?.type && llmResult.parsed.action.type !== 'unsupported') {
              action = { ...llmResult.parsed.action, raw: stepText };
            }
          } catch (llmError) {
            await this.writeLlmArtifact(caseFolder, `step-${stepNumber}-recovery-${attempt}-error`, { message: llmError.message }).catch(() => {});
          }
        }

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

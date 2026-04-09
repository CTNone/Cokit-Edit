const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const logger = require('./logger');
const resultsManager = require('./results');
const { normalizeWhitespace, sanitizeFileSegment } = require('./utils');

class PlaywrightRunner {
  constructor(options = {}) {
    this.options = {
      headed: options.headed || false,
      mode: options.mode || 'compile',
      targetUrl: options.targetUrl || config.TARGET_URL,
      ...options,
    };
    this.browser = null;
    this.catalog = new Map();
    this.referenceData = new Map();
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
        await this.executeStepWithRetry(page, steps[index], scenario, failureStep);
      }

      const evaluation = await this.evaluateExpected(page, scenario);
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
        actual: `Bước ${failureStep || '?'} gặp lỗi: ${error.message}`,
        note: error.note || '-',
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

  async executeStepWithRetry(page, stepText, scenario, stepNumber, maxRetries = 2) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        await this.performAction(page, stepText, scenario);
        return;
      } catch (error) {
        attempt += 1;
        if (attempt >= maxRetries) {
          error.stepNumber = stepNumber;
          throw error;
        }
        logger.warn(`    Step failed, retrying (${attempt}/${maxRetries}): ${stepText}`);
        logger.dim(`      Reason: ${error.message.split('\n')[0]}`);
        await page.waitForTimeout(1000 * attempt);
      }
    }
  }

  async performAction(page, step, scenario) {
    const text = normalizeWhitespace(step);
    const lower = text.toLowerCase();
    logger.dim(`    Action: ${text}`);

    if (/^open browser$/i.test(text)) {
      return;
    }

    if (/navigate to|go to/i.test(lower)) {
      if (/login page/i.test(lower)) {
        return this.gotoKnownPage(page, 'login.html');
      }
      if (/register/i.test(lower)) {
        return this.gotoKnownPage(page, 'register.html');
      }
      const urlMatch = text.match(/(https?:\/\/[^\s]+|\/[^\s]+)/i);
      if (urlMatch) {
        const rawUrl = urlMatch[1];
        const url = rawUrl.startsWith('http') ? rawUrl : new URL(rawUrl, this.options.targetUrl).toString();
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle').catch(() => {});
        return;
      }
    }

    const referenceLoginMatch = text.match(/login with credentials from\s+(TC-\d+)/i);
    if (referenceLoginMatch) {
      const refId = referenceLoginMatch[1].toUpperCase();
      const credentials = this.referenceData.get(refId);
      if (!credentials?.username || !credentials?.password) {
        const error = new Error(`Không tìm thấy thông tin đăng nhập tham chiếu từ ${refId}`);
        error.blocked = true;
        throw error;
      }
      await this.gotoKnownPage(page, 'login.html');
      await this.fillField(page, 'username', credentials.username);
      await this.fillField(page, 'password', credentials.password);
      await this.clickTarget(page, 'login');
      return;
    }

    const referenceEmailMatch = text.match(/enter\s+email\s+used\s+in\s+(TC-\d+)/i);
    if (referenceEmailMatch) {
      const refId = referenceEmailMatch[1].toUpperCase();
      const credentials = this.referenceData.get(refId);
      if (!credentials?.email) {
        const error = new Error(`Không tìm thấy email tham chiếu từ ${refId}`);
        error.blocked = true;
        throw error;
      }
      await this.fillField(page, 'email', credentials.email);
      return;
    }

    const inputMatch = text.match(/enter\s+([^:]+):?\s*"([^"]+)"/i);
    if (inputMatch) {
      const fieldName = normalizeWhitespace(inputMatch[1]);
      const value = inputMatch[2];
      await this.fillField(page, fieldName, value);
      return;
    }

    if (/click/i.test(lower)) {
      const quoted = text.match(/"([^"]+)"/);
      const target = quoted?.[1] || text.replace(/click/i, '').replace(/button|link|icon|menu/ig, '').trim();
      await this.clickTarget(page, target);
      return;
    }

    if (/press enter/i.test(lower)) {
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle').catch(() => {});
      return;
    }

    logger.warn(`    Unrecognized step format: ${text}`);
  }

  async gotoKnownPage(page, pageName) {
    const url = new URL(pageName, this.options.targetUrl.endsWith('/') ? this.options.targetUrl : `${this.options.targetUrl}/`).toString();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
  }

  async fillField(page, fieldName, value) {
    const normalizedField = fieldName.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const candidates = [
      `input[name*="${normalizedField}" i]`,
      `input[placeholder*="${normalizedField}" i]`,
      `input[aria-label*="${normalizedField}" i]`,
      `textarea[name*="${normalizedField}" i]`,
    ];

    for (const selector of candidates) {
      const locator = page.locator(selector).first();
      if (await locator.count()) {
        await locator.fill(value);
        return;
      }
    }

    const byLabel = page.getByLabel(new RegExp(normalizedField, 'i')).first();
    if (await byLabel.count()) {
      await byLabel.fill(value);
      return;
    }

    throw new Error(`Không tìm thấy field phù hợp cho "${fieldName}"`);
  }

  async clickTarget(page, target) {
    const cleaned = normalizeWhitespace(target).replace(/^(on\s+)/i, '');
    const escaped = cleaned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (/submit/i.test(cleaned)) {
      const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.count()) {
        await submitButton.click();
        await page.waitForTimeout(300);
        await page.waitForLoadState('networkidle').catch(() => {});
        return;
      }
    }

    const locators = [
      page.getByRole('button', { name: new RegExp(escaped, 'i') }).first(),
      page.getByRole('link', { name: new RegExp(escaped, 'i') }).first(),
      page.getByText(new RegExp(escaped, 'i')).first(),
      page.locator(`#${cleaned.replace(/\s+/g, '')}, #${cleaned.replace(/\s+/g, '')}Btn`).first(),
    ];

    for (const locator of locators) {
      if (await locator.count()) {
        await locator.click();
        await page.waitForTimeout(300);
        await page.waitForLoadState('networkidle').catch(() => {});
        return;
      }
    }

    throw new Error(`Không tìm thấy element để click: ${target}`);
  }

  async evaluateExpected(page, scenario) {
    const expected = normalizeWhitespace(scenario.expected || scenario['Expected Result'] || '');
    const expectedLower = expected.toLowerCase();

    const pass = (actual, note = '-') => ({ passed: true, actual, note });
    const fail = (actual, note = '-') => ({ passed: false, actual, note });

    if (/redirected?.*dashboard/i.test(expectedLower)) {
      await page.waitForURL(/index\.html/i, { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(300);
    }

    if (/registration.*redirected?.*login/i.test(expectedLower) || /successful.*login page/i.test(expectedLower)) {
      await page.waitForURL(/login\.html/i, { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(300);
    }

    if (/logged out/i.test(expectedLower) || /landing page/i.test(expectedLower)) {
      await page.waitForURL(/login\.html/i, { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(300);
    }

    if (/reset link sent to email/i.test(expectedLower)) {
      await page.getByText(/reset link sent to email/i).waitFor({ timeout: 3000 }).catch(() => {});
    }

    const bodyText = normalizeWhitespace(await page.locator('body').innerText().catch(() => ''));
    const url = page.url();
    const bodyLower = bodyText.toLowerCase();

    const quotedValues = [...expected.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    if (quotedValues.length > 0) {
      const missing = quotedValues.find((value) => !bodyLower.includes(value.toLowerCase()) && !url.toLowerCase().includes(value.toLowerCase()));
      if (!missing) {
        return pass(`Quan sát được đúng nội dung mong đợi trên trang. URL hiện tại: \`${url}\`.`);
      }
      return fail(`Không thấy nội dung mong đợi \`${missing}\`. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText}`);
    }

    if (/redirected?.*dashboard/i.test(expectedLower)) {
      if (/index\.html/i.test(url) || bodyLower.includes('dashboard')) {
        return pass(`Người dùng được chuyển tới dashboard tại \`${url}\`.`);
      }
      return fail(`Không chuyển tới dashboard. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText}`);
    }

    if (/registration.*redirected?.*login/i.test(expectedLower) || /successful.*login page/i.test(expectedLower)) {
      if (/login\.html/i.test(url)) {
        return pass(`Đăng ký thành công và chuyển về trang đăng nhập tại \`${url}\`.`);
      }
      return fail(`Không chuyển sang trang đăng nhập. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText}`);
    }

    if (/logged out/i.test(expectedLower) || /landing page/i.test(expectedLower)) {
      if (/login\.html/i.test(url) || (!/index\.html/i.test(url) && url.startsWith(this.options.targetUrl))) {
        return pass(`Logout thành công và ứng dụng chuyển về \`${url}\`.`);
      }
      return fail(`Logout không đưa người dùng về trang ban đầu. URL hiện tại: \`${url}\`.`);
    }

    if (/interface.*loaded|displayed correctly/i.test(expectedLower)) {
      if (bodyText.length > 20) {
        return pass(`Trang được tải thành công tại \`${url}\` và giao diện hiển thị đầy đủ.`);
      }
      return fail(`Trang tải chưa đầy đủ. URL hiện tại: \`${url}\`.`);
    }

    if (expected && bodyLower.includes(expectedLower)) {
      return pass(`Nội dung thực tế khớp với kết quả mong đợi. URL hiện tại: \`${url}\`.`);
    }

    return fail(`Chưa có rule assert phù hợp để chứng minh expected result. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText}`, 'Cần bổ sung assertion rule cho expected result này.');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = PlaywrightRunner;

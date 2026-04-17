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
    this.persistentContext = null;
    this.catalog = new Map();
    this.referenceData = new Map();
    this.completedScenarios = new Map(); // Lưu kết quả của các kịch bản đã chạy: id -> status
    this.stepParser = new StepParser();
    this.llmClient = null;
    this.stepInterpreter = null;
    this.llmAssertionHelper = null;
    this.activePage = null; // Quản lý page đang hoạt động để duy trì dòng chảy (Continuity)
    this.executionQueue = []; // Danh sách kịch bản còn lại trong lượt run này
  }

  // Chuẩn hóa ID: "TC1-Passed" -> "TC-01"
  normalizeId(rawId) {
    if (!rawId) return '';
    // Xóa tất cả các hậu tố trạng thái tiềm năng để lấy ID gốc
    let id = String(rawId).toUpperCase()
      .replace(/-?(PASSED|FAILED|BLOCKED|SKIPPED)$/i, '')
      .trim();
    const match = id.match(/^TC\W*(\d+)$/);
    if (match) {
      const num = match[1];
      return `TC-${num.padStart(2, '0')}`;
    }
    return id;
  }

  _parseDependencies(raw) {
    if (!raw) return [];
    return String(raw).split(',').map(part => {
      const trimmed = part.trim();
      const statusMatch = trimmed.match(/-?(PASSED|FAILED|BLOCKED|SKIPPED)$/i);
      const expectedStatus = statusMatch ? statusMatch[1].toLowerCase() : 'passed';
      const rawId = statusMatch ? trimmed.substring(0, statusMatch.index) : trimmed;
      return {
        id: this.normalizeId(rawId),
        expectedStatus,
        raw: trimmed
      };
    });
  }

  setExecutionQueue(cases) {
    this.executionQueue = [...cases];
  }

  async init(runFolder, testCases = []) {
    logger.info(`Initializing browser (Headed: ${this.options.headed})...`);

    // Luôn dùng Portable Persistent Profile trong project folder
    const userDataDir = config.USER_DATA_DIR;
    await fs.ensureDir(userDataDir);
    logger.info(`Using Local Profile at: ${userDataDir}`);
    
    // Xóa cache cũ để tránh lỗi profile bị lock hoặc corrupted
    const cacheDir = path.join(userDataDir, 'Default', 'Cache');
    await fs.remove(cacheDir).catch(() => {});
    
    this.persistentContext = await chromium.launchPersistentContext(userDataDir, {
      headless: !this.options.headed,
      executablePath: await this.findChromePath(config.CHROME_PATH),
      viewport: { width: config.VIEWPORT_WIDTH, height: config.VIEWPORT_HEIGHT },
      ignoreDefaultArgs: ['--enable-automation'],
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ],
    });

    this.persistentContext.on('page', async (page) => {
      const scenarioId = this.currentScenarioId || 'System';
      logger.info(`    [Window] Một cửa sổ mới phát hiện (từ ${scenarioId}).`);
      this.activePage = page;
      
      // Chờ page load sơ bộ để lấy Title/URL
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      const title = await page.title().catch(() => 'Untitled');
      logger.success(`    [Window] Đã tự động chuyển quyền điều khiển sang: "${title}"`);
    });

    // Capture initial blank page if it exists
    const initialPages = this.persistentContext.pages();
    if (initialPages.length > 0) {
      this.activePage = initialPages[0];
      logger.dim('    [Init] Đã gán activePage vào Tab đầu tiên có sẵn.');
    }

    this.catalog = new Map(testCases.map((testCase) => [this.normalizeId(testCase.id || testCase.ID), testCase]));
    this.referenceData = new Map(testCases.map((testCase) => [this.normalizeId(testCase.id || testCase.ID), this.extractScenarioData(testCase)]));
    
    logger.dim(`    [Debug] Catalog IDs: ${Array.from(this.catalog.keys()).join(', ')}`);
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

  async runScenario(scenario, keepOpen = false) {
    const scenarioId = this.normalizeId(scenario.id || scenario.ID);
    this.currentScenarioId = scenarioId;
    
    // Cập nhật hàng chờ: loại bỏ scenario hiện tại khỏi queue nếu nó đang ở đầu
    if (this.executionQueue.length > 0 && this.normalizeId(this.executionQueue[0].id || this.executionQueue[0].ID) === scenarioId) {
      this.executionQueue.shift();
    }
    
    // Nếu đã chạy rồi thì không chạy lại (Cache)
    if (this.completedScenarios.has(scenarioId)) {
      return this.completedScenarios.get(scenarioId);
    }

    // 1. KIỂM TRA ĐIỀU KIỆN TIÊN QUYẾT (PREREQUISITE)
    const prereqRaw = scenario.prerequisite || scenario.Prerequisite;
    const dependencies = this._parseDependencies(prereqRaw);
    let allPrereqsMatched = true;

    for (const dep of dependencies) {
      const prereqId = dep.id;
      logger.info(`    [Dependency] Scenario ${scenarioId} phụ thuộc vào ${prereqId} (${dep.expectedStatus.toUpperCase()}). Đang kiểm tra...`);
      
      const prereqScenario = this.catalog.get(prereqId);
      if (prereqScenario) {
        const actualStatus = await this.runScenario(prereqScenario, true); // Giữ page mở nếu là prerequisite
        if (actualStatus !== dep.expectedStatus) {
          logger.error(`    [Dependency] ${prereqId} có kết quả ${actualStatus}, không khớp với mong đợi: ${dep.expectedStatus}. Chặn ${scenarioId}.`);
          const blockPayload = {
            status: 'blocked',
            actual: `Bị chặn vì kịch bản phụ thuộc ${prereqId} trả về '${actualStatus}', trong khi mong đợi '${dep.expectedStatus}'`,
            note: `Kiểm tra lại luồng logic giữa ${prereqId} và ${scenarioId}.`,
            evidence: {}
          };
          await resultsManager.addResult(scenario, blockPayload);
          this.completedScenarios.set(scenarioId, 'blocked');
          return 'blocked';
        }
        logger.success(`    [Dependency] ${prereqId} đã khớp trạng thái '${dep.expectedStatus.toUpperCase()}'.`);
      } else {
        logger.warn(`    [Dependency] Không tìm thấy kịch bản ${prereqId} trong danh sách.`);
      }
    }

    const scenarioTitle = scenario.title || scenario.Scenario;
    logger.step(`Executing Scenario: ${scenarioId} — ${scenarioTitle}`);
    
    // Nếu có ít nhất 1 dependency đã chạy thành công (passed) và đang giữ page, ta có thể dùng continuity
    const hasSuccessfulPrereq = dependencies.some(dep => this.completedScenarios.get(dep.id) === 'passed');
    const isContinuation = hasSuccessfulPrereq && !!this.activePage;

    const caseFolder = resultsManager.getCaseFolder(scenario);
    await fs.ensureDir(caseFolder);

    let context = this.persistentContext;
    let page;
    let isNewPage = true;

    if (this.activePage) {
      page = this.activePage;
      isNewPage = false;
      logger.info(`    [Continuity] Sử dụng lại cửa sổ trình duyệt đang mở.`);
    } else {
      page = await context.newPage();
      this.activePage = page;
    }
    const video = page.video();

    if (isNewPage && this.options.headed) {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
      });

      await page.addInitScript(() => {
        if (window !== window.parent) return;
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

    const actionExecutor = new ActionExecutor(page, {
      targetUrl: this.options.targetUrl,
      referenceData: this.referenceData,
      timeout: config.INTERACTION_TIMEOUT,
      llm: this.llmClient, // Kích hoạt khả năng tự sửa lỗi bằng LLM
    });
    const assertionEngine = new AssertionEngine(page, {
      targetUrl: this.options.targetUrl,
      timeout: config.ASSERTION_TIMEOUT,
      llmAssertionHelper: this.llmAssertionHelper,
      onArtifact: async (name, data) => this.writeLlmArtifact(caseFolder, name, data),
    });

    const initialPage = this.activePage; // Ghi nhớ trang gốc trước khi chạy scenario
    let failureStep = null;
    let wasHealed = false; // Cờ theo dõi rủi ro
    let payload = {
      status: 'failed',
      expected: scenario.expected || scenario['Expected Result'] || '',
      actual: 'Chưa có kết quả thực tế.',
      note: '-',
      evidence: {},
      failureStep: null,
    };

    try {
      if (!isContinuation) {
        await page.goto(this.options.targetUrl, { waitUntil: 'domcontentloaded' }).catch(() => {});
      } else {
        logger.dim(`    [Continuity] Đã ở sẵn trạng thái session, bỏ qua goto: ${this.options.targetUrl}`);
      }

      const steps = scenario.steps || [];
      let allStepsExecuted = true;
      
      for (let index = 0; index < steps.length; index += 1) {
        failureStep = index + 1;
        const stepText = steps[index];
        logger.dim(`    Action: ${normalizeWhitespace(stepText)}`);
        
        try {
          // Luôn đảm bảo ActionExecutor dùng page mới nhất (đề phòng có tab mở ra ở bước trước)
          actionExecutor.page = this.activePage;
          
          const stepResult = await this.executeStepWithRetry(actionExecutor, stepText, failureStep, caseFolder);
          if (stepResult && stepResult.healed) wasHealed = true;
          
          const stepScreenshotPath = path.join(caseFolder, `step-${failureStep}.png`);
          await page.screenshot({ path: stepScreenshotPath }).catch(() => {});
          
          if (!payload.evidence.stepScreenshots) payload.evidence.stepScreenshots = [];
          payload.evidence.stepScreenshots.push({
            step: failureStep,
            action: normalizeWhitespace(stepText),
            path: stepScreenshotPath
          });
        } catch (stepError) {
          allStepsExecuted = false;
          // Ném tiếp lỗi ra ngoài try-catch lớn để xử lý payload failure
          throw stepError;
        }
      }

      // --- ĐÁNH GIÁ DỰA TRÊN THỰC THI (PHÂN LOẠI RỦI RO) ---
      if (allStepsExecuted) {
        // Chờ trang ổn định trước khi đánh giá
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(500);

        const evaluation = await assertionEngine.evaluate(scenario).catch(() => ({ passed: true, actual: 'Đã hoàn thành.' }));
        
        // --- CHẾ ĐỘ THẨM PHÁN TỐI CAO ---
        // Nếu có sự can thiệp của AI, kết quả Passed/Failed phải tuân theo AI hoàn toàn
        let finalStatus = wasHealed ? (evaluation.passed ? 'passed' : 'failed') : 'passed';
        
        payload = {
          ...payload,
          status: finalStatus,
          actual: evaluation.actual || 'Tất cả các hành động đã thành công.',
          note: evaluation.note || `Hoàn thành thực thi. ${wasHealed ? '[AI Evaluated]' : '[Rule-based]'}`
        };
      }
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

    // KIỂM TRA XEM CÓ AI CẦN PAGE NÀY NỮA KHÔNG (Dependency Matrix)
    const isNeededByFuture = this.executionQueue.some(next => {
      const nextPrereqRaw = next.prerequisite || next.Prerequisite;
      if (!nextPrereqRaw) return false;
      const nextDeps = this._parseDependencies(nextPrereqRaw);
      return nextDeps.some(dep => dep.id === scenarioId);
    });

    if (!keepOpen && !isNeededByFuture) {
      if (!this.persistentContext) {
        await context.close();
      } else {
        // [Sovereign Page Protocol] Duy nhất activePage là "Chủ quyền"
        // Nếu Scenario thất bại, ta ưu tiên quay lại trang gốc (initialPage) để bảo toàn flow
        const survivor = payload.status === 'passed' ? this.activePage : (initialPage || this.activePage);
        const allPages = context.pages();
        
        if (allPages.length > 1 && survivor) {
          logger.info(`    [Cleanup] ${payload.status === 'passed' ? 'Kết thúc thành công' : 'Thất bại - Đang khôi phục tab gốc'}. Đang đóng các cửa sổ không thuộc chủ quyền...`);
          for (const p of allPages) {
            if (p !== survivor && !p.isClosed()) {
              await p.close().catch(() => {});
            }
          }
          this.activePage = survivor;
          await survivor.bringToFront().catch(() => {});
        } else if (allPages.length === 1 && this.executionQueue.length === 0) {
          logger.info(`    [Cleanup] Đóng trang cuối cùng vì hết hàng chờ.`);
          await page.close().catch(() => {});
          this.activePage = null;
        }
      }
    }

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
    this.completedScenarios.set(scenarioId, payload.status);

    if (payload.status === 'passed') {
      logger.success(`Scenario ${scenarioId} completed.`);
    } else {
      logger.warn(`Scenario ${scenarioId} finished with status ${payload.status}.`);
    }
    console.log(''); // Thêm dòng trống để dễ quan sát giữa các testcase
    return payload.status;
  }

  async executeStepWithRetry(actionExecutor, stepText, stepNumber, caseFolder, maxRetries = config.STEP_RETRY_LIMIT) {
    let attempt = 0;
    let wasHealed = false;
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

    try {
      // 1. Thử chạy bằng Rule cứng (Deterministic)
      await actionExecutor.execute(action);
      await actionExecutor.page.waitForTimeout(config.STEP_DELAY);
      return { healed: false };
    } catch (error) {
      // 2. Nếu hỏng, thử gọi AI cứu đúng 1 lần duy nhất
      if (this.stepInterpreter && (error.kind === 'selector_fail' || error.kind === 'action_fail')) {
        logger.warn(`    [Step Failed] Đang tìm phương án thay thế bằng AI cho: "${stepText}"...`);
        try {
          const llmResult = await this.stepInterpreter.interpretStep(stepText, {
            targetUrl: this.options.targetUrl,
            currentUrl: actionExecutor.page.url(),
            errorMessage: error.message,
          });

          await this.writeLlmArtifact(caseFolder, `step-${stepNumber}-ai-recovery`, llmResult).catch(() => {});
          
          const aiAction = llmResult?.parsed?.action;
          const isInteraction = ['click', 'hover', 'double_click'].includes(aiAction?.type);
          const isInputSelector = /input|textarea|email|username|password/i.test(aiAction?.selector || '');

          if (aiAction?.type && aiAction.type !== 'unsupported' && aiAction.selector !== 'null') {
            const lowerStep = stepText.toLowerCase();
            const lowerSelector = String(aiAction.selector).toLowerCase();
            const lowerReason = String(llmResult?.parsed?.reasoning || '').toLowerCase();

            // KIỂM TRA TÍNH HỢP LÝ: Nếu muốn Nhập liệu (FILL) mà AI lại gợi ý phần tử không phải input (như icon quả địa cầu)
            if (aiAction.type === 'fill' && !isInputSelector) {
               logger.error(`    [AI Sanity Check Fail] AI gợi ý nhập liệu vào phần tử không có tính chất input ("${aiAction.selector}"). Từ chối cứu hộ.`);
            }
            // KIỂM TRA TÍNH HỢP LÝ: Nếu muốn Click/Hover mà AI lại bảo click vào ô Input -> Từ chối ngay
            else if (isInteraction && isInputSelector) {
               logger.error(`    [AI Sanity Check Fail] AI gợi ý tương tác vào ô nhập liệu ("${aiAction.selector}") thay vì nút bấm. Từ chối cứu hộ.`);
            } 
            // KIỂM TRA TỪ KHÓA QUAN TRỌNG: Nếu step chứa 'admin' hoặc 'logout' mà AI gợi ý selector không liên quan
            else if ((lowerStep.includes('admin') && !lowerSelector.includes('admin') && !lowerReason.includes('admin')) ||
                     (lowerStep.includes('logout') && !lowerSelector.includes('logout') && !lowerReason.includes('logout'))) {
               logger.error(`    [AI Sanity Check Fail] AI gợi ý phần tử không liên quan cho từ khóa quan trọng ("${stepText}"). Từ chối cứu hộ.`);
            }
            else {
               const finalAiAction = { ...aiAction, raw: stepText };
               await actionExecutor.execute(finalAiAction);
               await actionExecutor.page.waitForTimeout(config.STEP_DELAY);
               return { healed: true };
            }
          } else {
            logger.error(`    [AI Recovery Failed] AI không tìm thấy phần tử nào đủ độ tin cậy để thay thế.`);
          }
        } catch (llmError) {
          logger.error(`    [AI Recovery Failed] Lỗi trong quá trình AI xử lý: ${llmError.message}`);
        }
      }

      // 3. Nếu tới đây có nghĩa là hỏng hoàn toàn -> Dừng ngay lập tức
      error.stepNumber = stepNumber;
      logger.error(`    [Final Failure] Dừng kịch bản tại bước ${stepNumber}: ${error.message}`);
      throw error;
    }
  }

  async findChromePath(customPath) {
    if (customPath && await fs.pathExists(customPath)) return customPath;
    
    const commonPaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe'),
    ];

    for (const p of commonPaths) {
      if (await fs.pathExists(p)) return p;
    }
    return undefined; // Để Playwright tự quyết định nếu không thấy Chrome thật
  }

  async cleanup() {
    if (this.persistentContext) {
      await this.persistentContext.close().catch(() => {});
      
      // Dọn rác sau khi đóng để lần sau khởi động nhẹ hơn
      const cacheDir = path.join(config.USER_DATA_DIR, 'Default', 'Cache');
      const mediaCacheDir = path.join(config.USER_DATA_DIR, 'Default', 'Media Cache');
      await Promise.all([
        fs.remove(cacheDir).catch(() => {}),
        fs.remove(mediaCacheDir).catch(() => {})
      ]);
    }
    if (this.browser) {
      await this.browser.close().catch(() => {}); 
    }
  }
}

module.exports = PlaywrightRunner;

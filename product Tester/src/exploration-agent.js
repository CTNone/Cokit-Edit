const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const logger = require('./logger');
const { normalizeUrl } = require('./utils');
const LlmClient = require('./llm-client');

class ExplorationAgent {
  constructor(options = {}) {
    this.options = {
      maxInteractions: options.maxInteractions || 20,
      maxDepth: options.maxDepth || 3,
      targetUrl: normalizeUrl(options.targetUrl || config.TARGET_URL),
      headed: options.headed || false,
      ...options,
    };
    this.visitedUrls = new Set();
    this.unvisitedQueue = [];
    this.foundFlows = [];
    this.discoveredIssues = [];
    this.llmClient = new LlmClient();
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async init() {
    logger.info(`Initializing Exploration Agent (Headed: ${this.options.headed})...`);
    
    const userDataDir = config.USER_DATA_DIR;
    await fs.ensureDir(userDataDir);

    this.context = await chromium.launchPersistentContext(userDataDir, {
      headless: !this.options.headed,
      executablePath: config.CHROME_PATH,
      viewport: { width: config.VIEWPORT_WIDTH, height: config.VIEWPORT_HEIGHT },
      ignoreDefaultArgs: ['--enable-automation'],
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ],
    });

    this.context.on('page', async (newPage) => {
      logger.info(`    [Tab] New window detected: ${await newPage.title().catch(() => 'Untitled')}`);
      this.page = newPage;
      const url = newPage.url();
      if (url && url !== 'about:blank') {
        const origin = new URL(this.options.targetUrl).origin;
        if (url.startsWith(origin)) {
          this.unvisitedQueue.push({ url, depth: 1 });
        }
      }
    });

    this.page = this.context.pages().length > 0 ? this.context.pages()[0] : await this.context.newPage();
    
    // Add to queue the entry URL
    this.unvisitedQueue.push({ url: this.options.targetUrl, depth: 0 });
  }

  async explore() {
    let interactionCount = 0;

    while (this.unvisitedQueue.length > 0 && interactionCount < this.options.maxInteractions) {
      const { url, depth } = this.unvisitedQueue.shift();

      if (this.visitedUrls.has(url) || depth > this.options.maxDepth) continue;

      logger.step(`[Explore] Visiting: ${url} (Depth: ${depth})`);
      try {
        // Ensure we are using the correct page if multiple tabs exist
        const pages = this.context.pages();
        if (pages.length > 1) {
          this.page = pages[pages.length - 1];
        }

        await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
        this.visitedUrls.add(url);
        interactionCount++;

        // Auto-login if detected (check current actual URL after potential redirect)
        await this.handleLoginIfRequired();

        // 1. Map Site - Extract links
        const links = await this.extractLinks();
        this.enqueueLinks(links, depth + 1);

        // 2. Discover Flows - Interact with page elements
        await this.discoverPageFlows(url);

      } catch (error) {
        logger.error(`Failed to visit ${url}: ${error.message}`);
      }
    }

    logger.success('Exploration completed!');
    return {
      visitedUrls: Array.from(this.visitedUrls),
      flows: this.foundFlows,
      issues: this.discoveredIssues,
    };
  }

  async handleLoginIfRequired() {
    const currentUrl = this.page.url();
    const loginPattern = new RegExp(config.LOGIN_PAGE_PATTERN || 'login|auth', 'i');
    
    // Check by URL first
    let isLoginPage = loginPattern.test(currentUrl);

    // If URL doesn't match, check by presence of fields
    if (!isLoginPage) {
      const hasUserField = await this.page.$('input[name*="user" i], input[type="email"], input[id*="user" i]');
      const hasPassField = await this.page.$('input[type="password"]');
      if (hasUserField && hasPassField) {
        isLoginPage = true;
        logger.info('    [Auth] Detected login fields in DOM even though URL does not match pattern.');
      }
    }

    if (!isLoginPage) return;

    logger.info(`    [Auth] Detect login page: ${currentUrl}. Attempting auto-login...`);

    const username = process.env.TEST_USERNAME || process.env.USERNAME;
    const password = process.env.TEST_PASSWORD || process.env.PASSWORD;

    if (!username || !password) {
      logger.warn('    [Auth] Login detected but TEST_USERNAME/TEST_PASSWORD not found in .env. Skipping login.');
      return;
    }

    try {
      // Find username/email field
      const userSelectors = ['input[name*="user" i]', 'input[name*="email" i]', 'input[type="email"]', 'input[id*="user" i]'];
      const passSelectors = ['input[name*="pass" i]', 'input[type="password"]', 'input[id*="pass" i]'];
      const submitSelectors = ['button[type="submit"]', 'input[type="submit"]', 'button:has-text("Login")', 'button:has-text("Sign in")', 'button:has-text("Đăng nhập")'];
      const actionSelectors = [
        'text="Login with Account/Password"',
        'text="Account/Password"',
        'button:has-text("Account")', 
        'span:has-text("Account")', 
        'div:has-text("Account")',
        'button:has-text("Login")',
        'a:has-text("Login")'
      ];

      const findFields = async () => {
        let u = null, p = null;
        for (const s of userSelectors) { u = await this.page.$(s); if (u) break; }
        for (const s of passSelectors) { p = await this.page.$(s); if (p) break; }
        return { u, p };
      };

      let fields = await findFields();

      // If fields not found, try to click a login/account button first (Bait button)
      if (!fields.u || !fields.p) {
        logger.info('    [Auth] Login fields not visible. Searching for login/account buttons to reveal form...');
        for (const s of actionSelectors) {
          const btn = await this.page.$(s);
          if (btn) {
            logger.info(`    [Auth] Clicking ${s} to reveal form...`);
            await btn.click();
            await this.page.waitForTimeout(3000); // Increase wait for Unigate
            fields = await findFields();
            if (fields.u) break;
          }
        }
      }

      if (!fields.u) {
        logger.warn('    [Auth] Could not find username field after attempt.');
        return;
      }

      await fields.u.fill(username);
      if (fields.p) await fields.p.fill(password);

      for (const s of submitSelectors) {
        const btn = await this.page.$(s);
        if (btn) {
          logger.info(`    [Auth] Submitting login (${s})...`);
          await Promise.all([
            btn.click(),
            this.page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {})
          ]);
          logger.success('    [Auth] Login action performed.');
          return;
        }
      }
    } catch (error) {
      logger.error(`    [Auth] Auto-login failed: ${error.message}`);
    }
  }

  async extractLinks() {
    const baseUrl = new URL(this.options.targetUrl).origin;
    return await this.page.evaluate((origin) => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map(a => ({
          text: a.textContent.trim().slice(0, 50),
          href: a.href
        }))
        .filter(a => a.href && a.href.startsWith(origin) && !a.href.includes('#'));
    }, baseUrl);
  }

  enqueueLinks(links, nextDepth) {
    for (const link of links) {
      const normalized = link.href.split('?')[0].split('#')[0].replace(/\/$/, '');
      if (!this.visitedUrls.has(normalized)) {
        this.unvisitedQueue.push({ url: normalized, depth: nextDepth });
      }
    }
  }

  async discoverPageFlows(url) {
    logger.dim(`    Analysing page structure: ${url}`);
    
    // Get interesting elements for LLM analysis
    const elements = await this.page.evaluate(() => {
      const selectors = ['button', 'input[type="submit"]', 'a.button', '.btn', 'input[type="text"]'];
      return selectors.flatMap(s => Array.from(document.querySelectorAll(s)))
        .map(el => ({
          tag: el.tagName,
          text: el.textContent.trim() || el.value || el.placeholder || '',
          role: el.getAttribute('role') || '',
          id: el.id,
          className: el.className
        }))
        .filter(el => el.text.length > 0)
        .slice(0, 10);
    });

    if (elements.length === 0) return;

    // Use LLM to identify the page type and potential "Happy Path" flow
    try {
      const prompt = `You are an E2E Test Explorer. Analyze these elements on the page "${url}" and identify if this page represents a key user journey step (like login, signup, checkout, search).
      
      Elements: ${JSON.stringify(elements)}
      
      Return JSON format:
      {
        "pageType": "string",
        "description": "string",
        "recommendedActions": [{ "element": "string", "action": "click|fill", "value": "string" }]
      }`;

      logger.dim('    [AI] Analyzing page flow (Local LLM)...');
      const response = await this.llmClient.chat([{ role: 'user', content: prompt }]).catch(e => {
        logger.warn(`    [AI Failure] LLM unreachable: ${e.message}. Skipping AI analysis for this page.`);
        return null;
      });

      if (response) {
        const analysis = JSON.parse(response.text.match(/\{[\s\S]*\}/)?.[0] || '{}');

        if (analysis.pageType) {
          logger.info(`    [Page Match] Detected as: ${analysis.pageType} - ${analysis.description}`);
          this.foundFlows.push({
            url,
            pageType: analysis.pageType,
            description: analysis.description,
            actions: analysis.recommendedActions
          });
        }
      }
    } catch (error) {
      logger.warn(`    Analysis logic failed for ${url}: ${error.message}`);
    }
  }

  async cleanup() {
    if (this.context) await this.context.close();
  }
}

module.exports = ExplorationAgent;

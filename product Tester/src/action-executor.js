const SelectorResolver = require('./selector-resolver');
const { createInteractionError } = require('./interaction-errors');
const { normalizeUrl } = require('./utils');

class ActionExecutor {
  constructor(page, options = {}) {
    this.page = page;
    this.targetUrl = options.targetUrl;
    this.referenceData = options.referenceData || new Map();
    this.timeout = options.timeout || 5000;
    this.selectorResolver = new SelectorResolver(page, { timeout: this.timeout });
  }

  async execute(action) {
    switch (action.type) {
      case 'noop':
        return;
      case 'goto-page':
        return this.gotoKnownPage(action.pageName);
      case 'goto-url':
        return this.gotoUrl(action.target);
      case 'reference-login':
        return this.loginWithReference(action.refId);
      case 'reference-email':
        return this.fillReferenceEmail(action.refId);
      case 'fill':
        return this.fillField(action.fieldName, action.value);
      case 'click':
        return this.clickTarget(action.target);
      case 'press-enter':
        await this.page.keyboard.press('Enter');
        await this.page.waitForLoadState('networkidle').catch(() => {});
        return;
      case 'scroll-down':
        await this.page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
        await this.page.waitForTimeout(1000);
        return;
      case 'set-viewport-mobile':
        await this.page.setViewportSize({ width: 375, height: 667 });
        await this.page.waitForTimeout(500);
        return;
      default:
        throw createInteractionError('action_fail', `Chưa hỗ trợ cú pháp bước: ${action.raw}`);
    }
  }

  async _safeGoto(url, options = {}) {
    try {
      await this.page.goto(url, { waitUntil: 'domcontentloaded', ...options });
      await this.page.waitForTimeout(1000);
    } catch (error) {
      if (error.message.includes('ERR_SSL_PROTOCOL_ERROR') && url.includes('localhost')) {
        const fallbackUrl = url.replace('https:', 'http:');
        console.warn(`SSL Error on localhost, retrying with HTTP: ${fallbackUrl}`);
        await this.page.goto(fallbackUrl, { waitUntil: 'domcontentloaded', ...options });
        await this.page.waitForTimeout(1000);
        return;
      }
      throw error;
    }
  }

  async gotoKnownPage(pageName) {
    try {
      const baseUrl = this.targetUrl.endsWith('/') ? this.targetUrl : `${this.targetUrl}/`;
      const url = new URL(pageName, baseUrl).toString();
      await this._safeGoto(url);
      await this.page.waitForLoadState('networkidle').catch(() => {});
    } catch (error) {
      if (error.code === 'ERR_INVALID_URL') {
        throw createInteractionError('action_fail', `URL không hợp lệ: ${pageName} (Base: ${this.targetUrl})`);
      }
      throw error;
    }
  }

  async gotoUrl(target) {
    try {
      const url = target.startsWith('http') ? target : (target.includes('.') || target.startsWith('localhost') ? normalizeUrl(target) : new URL(target, this.targetUrl).toString());
      await this._safeGoto(url);
      await this.page.waitForLoadState('networkidle').catch(() => {});
    } catch (error) {
      if (error.code === 'ERR_INVALID_URL' || error.message.includes('Invalid URL')) {
        throw createInteractionError('action_fail', `URL không hợp lệ: ${target}`);
      }
      throw error;
    }
  }

  async loginWithReference(refId) {
    const credentials = this.referenceData.get(refId);
    if (!credentials?.username || !credentials?.password) {
      throw createInteractionError('blocked', `Không tìm thấy thông tin đăng nhập tham chiếu từ ${refId}`, { blocked: true });
    }

    await this.gotoKnownPage('login.html');
    await this.fillField('username', credentials.username);
    await this.fillField('password', credentials.password);
    await this.clickTarget('login');

    const loginSucceeded = await this.waitForLoginSuccess();
    if (!loginSucceeded) {
      throw createInteractionError(
        'blocked',
        `Không thể đăng nhập bằng thông tin tham chiếu từ ${refId}`,
        { blocked: true, note: `Login tham chiếu từ ${refId} không thành công` },
      );
    }
  }

  async fillReferenceEmail(refId) {
    const credentials = this.referenceData.get(refId);
    if (!credentials?.email) {
      throw createInteractionError('blocked', `Không tìm thấy email tham chiếu từ ${refId}`, { blocked: true });
    }

    await this.fillField('email', credentials.email);
  }

  async fillField(fieldName, value) {
    const locator = await this.selectorResolver.resolveInput(fieldName);
    await locator.fill(value);
  }

  async clickTarget(target) {
    const locator = await this.selectorResolver.resolveClickable(target);
    await locator.click();
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async waitForLoginSuccess() {
    await this.page.waitForTimeout(300);
    await this.page.waitForLoadState('networkidle').catch(() => {});

    if (/index\.html/i.test(this.page.url())) {
      return true;
    }

    const dashboardVisible = await this.page.getByText(/dashboard/i).isVisible().catch(() => false);
    return dashboardVisible;
  }
}

module.exports = ActionExecutor;

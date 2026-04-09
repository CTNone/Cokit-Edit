const SelectorResolver = require('./selector-resolver');
const { createInteractionError } = require('./interaction-errors');

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
      default:
        throw createInteractionError('action_fail', `Chưa hỗ trợ cú pháp bước: ${action.raw}`);
    }
  }

  async gotoKnownPage(pageName) {
    const url = new URL(pageName, this.targetUrl.endsWith('/') ? this.targetUrl : `${this.targetUrl}/`).toString();
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async gotoUrl(target) {
    const url = target.startsWith('http') ? target : new URL(target, this.targetUrl).toString();
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle').catch(() => {});
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
    await this.page.waitForTimeout(300);
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

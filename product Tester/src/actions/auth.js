const config = require('../config');
const { createInteractionError } = require('../interaction-errors');

class AuthAction {
  constructor(page, resolver, options) {
    this.page = page;
    this.resolver = resolver;
    this.referenceData = options.referenceData;
    this.targetUrl = options.targetUrl;
  }

  async execute(action) {
    if (action.type === 'reference-login') {
      return this.loginWithReference(action.refId);
    }
    if (action.type === 'reference-email') {
      return this.fillReferenceEmail(action.refId);
    }
  }

  async loginWithReference(refId) {
    const credentials = this.referenceData.get(refId);
    if (!credentials?.username || !credentials?.password) {
      throw createInteractionError('blocked', `Không tìm thấy thông tin đăng nhập tham chiếu từ ${refId}`, { blocked: true });
    }

    const baseUrl = this.targetUrl.endsWith('/') ? this.targetUrl : `${this.targetUrl}/`;
    await this.page.goto(new URL(config.LOGIN_PAGE_PATH, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
    
    await (await this.resolver.resolveInput('username')).fill(credentials.username);
    await (await this.resolver.resolveInput('password')).fill(credentials.password);
    
    // Attempt clicking login 
    await (await this.resolver.resolveClickable('login')).click();
    await this.page.waitForTimeout(1000);
  }

  async fillReferenceEmail(refId) {
    const credentials = this.referenceData.get(refId);
    if (!credentials?.email) {
      throw createInteractionError('blocked', `Không tìm thấy email tham chiếu từ ${refId}`, { blocked: true });
    }
    const locator = await this.resolver.resolveInput('email');
    await locator.fill(credentials.email);
  }
}

module.exports = AuthAction;

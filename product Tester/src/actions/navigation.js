const { normalizeUrl } = require('../utils');
const { createInteractionError } = require('../interaction-errors');

class NavigationAction {
  constructor(page, resolver, options) {
    this.page = page;
    this.resolver = resolver;
    this.targetUrl = options.targetUrl;
  }

  async execute(action) {
    if (action.type === 'goto-url') {
      await this.gotoUrl(action.target);
    } else if (action.type === 'nav') {
      if (action.direction === 'back') await this.page.goBack();
      else if (action.direction === 'next' || action.direction === 'forward') await this.page.goForward();
      else if (action.direction === 'refresh') await this.page.reload();
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }
  }

  async gotoUrl(target) {
    try {
      let url;
      const lowerTarget = target.toLowerCase();
      if (['website', 'trang chủ', 'trang web', 'trang đích', 'home'].includes(lowerTarget) || !lowerTarget) {
        url = this.targetUrl;
      } else {
        url = target.startsWith('http') ? target : (target.includes('.') || target.startsWith('localhost') ? normalizeUrl(target) : new URL(target, this.targetUrl).toString());
      }
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
      await this.page.waitForTimeout(1000);
      await this.page.waitForLoadState('networkidle').catch(() => {});
    } catch (error) {
      if (error.code === 'ERR_INVALID_URL' || error.message.includes('Invalid URL')) {
        throw createInteractionError('action_fail', `URL không hợp lệ: ${target}`);
      }
      throw error;
    }
  }
}

module.exports = NavigationAction;

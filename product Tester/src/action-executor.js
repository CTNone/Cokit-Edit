const SelectorResolver = require('./selector-resolver');
const { createInteractionError } = require('./interaction-errors');
const config = require('./config');
const { NavigationAction, FormAction, InteractionAction, AuthAction } = require('./actions');

class ActionExecutor {
  constructor(page, options = {}) {
    this.page = page;
    this.targetUrl = options.targetUrl;
    this.referenceData = options.referenceData || new Map();
    this.timeout = options.timeout || 5000;
    this.selectorResolver = new SelectorResolver(page, { 
      timeout: this.timeout,
      llm: options.llm // Truyền LLM vào để tự sửa lỗi
    });

    // Initialize Action Modules
    this.navigationAction = new NavigationAction(page, this.selectorResolver, { targetUrl: this.targetUrl });
    this.formAction = new FormAction(page, this.selectorResolver);
    this.interactionAction = new InteractionAction(page, this.selectorResolver);
    this.authAction = new AuthAction(page, this.selectorResolver, { referenceData: this.referenceData, targetUrl: this.targetUrl });
    this.onPageUpdate = options.onPageUpdate || (() => {});
  }

  async execute(action) {
    if (action.type === 'noop') return;
    if (action.type === 'unsupported') {
      throw createInteractionError('action_fail', action.message || `Chưa hỗ trợ cú pháp bước: ${action.raw}`);
    }

    try {
      if (['goto-url', 'goto-page', 'nav'].includes(action.type)) {
        await this.navigationAction.execute(action);
      } else if (['fill', 'select-option', 'check', 'upload-file'].includes(action.type)) {
        await this.formAction.execute(action);
      } else if (['click', 'hover', 'press', 'scroll', 'scroll-to', 'mobile-view', 'observe'].includes(action.type)) {
        await this.interactionAction.execute(action);
      } else if (['reference-login', 'reference-email'].includes(action.type)) {
        await this.authAction.execute(action);
      } else if (action.type === 'switch-window') {
        const pages = this.page.context().pages();
        const target = (action.target || '').toLowerCase();
        for (const p of pages) {
          const title = (await p.title().catch(() => '')).toLowerCase();
          const url = (await p.url() || '').toLowerCase();
          // Fuzzy match: tiêu đề chứa target HOẶC target chứa tiêu đề (giúp xử lý HRM vs Human Resource Management)
          if (title.includes(target) || target.includes(title) || url.includes(target)) {
            await p.bringToFront();
            this._updatePage(p);
            return;
          }
        }
        throw createInteractionError('action_fail', `Không tìm thấy cửa sổ nào khớp với: "${action.target}"`);
      } else if (action.type === 'close-window') {
        const context = this.page.context();
        await this.page.close();
        const remaining = context.pages();
        if (remaining.length > 0) {
          this._updatePage(remaining[remaining.length - 1]);
        }
      } else {
        throw createInteractionError('action_fail', `Hành động không xác định: ${action.type}`);
      }
    } catch (error) {
      if (!error.kind) {
         throw createInteractionError('action_fail', error.message);
      }
      throw error;
    }
  }

  _updatePage(newPage) {
    this.page = newPage;
    this.selectorResolver.page = newPage;
    this.navigationAction.page = newPage;
    this.formAction.page = newPage;
    this.interactionAction.page = newPage;
    this.authAction.page = newPage;
    this.onPageUpdate(newPage);
    this.page.bringToFront().catch(() => {});
  }
}

module.exports = ActionExecutor;

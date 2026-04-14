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
    this.selectorResolver = new SelectorResolver(page, { timeout: this.timeout });

    // Initialize Action Modules
    this.navigationAction = new NavigationAction(page, this.selectorResolver, { targetUrl: this.targetUrl });
    this.formAction = new FormAction(page, this.selectorResolver);
    this.interactionAction = new InteractionAction(page, this.selectorResolver);
    this.authAction = new AuthAction(page, this.selectorResolver, { referenceData: this.referenceData, targetUrl: this.targetUrl });
  }

  async execute(action) {
    if (action.type === 'noop') return;
    if (action.type === 'unsupported') {
      throw createInteractionError('action_fail', action.message || `Chưa hỗ trợ cú pháp bước: ${action.raw}`);
    }

    try {
      if (['goto-url', 'nav'].includes(action.type)) {
        await this.navigationAction.execute(action);
      } else if (['fill', 'select-option', 'check', 'upload-file'].includes(action.type)) {
        await this.formAction.execute(action);
      } else if (['click', 'hover', 'press', 'scroll', 'scroll-to', 'mobile-view', 'observe'].includes(action.type)) {
        await this.interactionAction.execute(action);
      } else if (['reference-login', 'reference-email'].includes(action.type)) {
        await this.authAction.execute(action);
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
}

module.exports = ActionExecutor;

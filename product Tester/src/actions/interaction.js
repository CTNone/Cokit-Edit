const config = require('../config');

class InteractionAction {
  constructor(page, resolver) {
    this.page = page;
    this.resolver = resolver;
  }

  async execute(action) {
    switch (action.type) {
      case 'click': return this.clickTarget(action.target);
      case 'hover': return this.hoverTarget(action.target);
      case 'press': return this.pressKey(action.key);
      case 'scroll': return this.scroll(action.direction);
      case 'scroll-to': return this.scrollTo(action.target);
      case 'mobile-view': return this.setMobileView();
      case 'observe': return this.observe(action.target);
    }
  }

  async observe(target) {
    const logger = require('../logger');
    logger.info(`    [Observer] Đang quan sát màn hình với mục tiêu: "${target}"...`);
    
    const uiContext = await this.page.evaluate(() => {
      const getVisibleText = (root) => {
        let text = "";
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) => {
            const style = window.getComputedStyle(node.parentElement);
            return (style.display !== 'none' && style.visibility !== 'hidden' && node.textContent.trim()) 
              ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        });
        while(walker.nextNode()) text += walker.currentNode.textContent.trim() + " | ";
        return text;
      };

      const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, .title, .name, .item, [role="button"], [role="link"]'))
        .filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        })
        .map(el => `${el.tagName}: ${el.innerText.trim()}`)
        .join('\n');

      return `Visible Text: ${getVisibleText(document.body)}\nStructural Elements:\n${elements}`;
    });

    try {
      const LlmClient = require('../llm-client');
      const client = new LlmClient();
      const prompt = `You are a UI Observer.
Your task is to verify if the user's goal is met based on the current UI state.

User Goal: "${target}"
UI Snapshot:
${uiContext}

RULES:
1. Response must be in JSON format: {"met": true/false, "reason": "concise explanation in Vietnamese"}
2. Be strict. If the goal is "See 3 apps" and only 2 are clearly present, "met" should be false.
3. If the goal is met, "met" should be true.`;

      const response = await client.chat([
        { role: 'system', content: "Return ONLY JSON." },
        { role: 'user', content: prompt }
      ]);
      
      const result = JSON.parse(response.text.match(/\{.*\}/s)[0]);
      
      if (result.met) {
        logger.success(`    [Observer] Xác nhận: ${result.reason}`);
      } else {
        throw createInteractionError('selector_fail', `Quan sát thất bại: ${result.reason}`);
      }
    } catch (error) {
       if (error.kind) throw error;
       logger.warn(`    [Observer Warning] Lỗi kỹ thuật khi quan sát: ${error.message}. Tiếp tục thực thi...`);
    }
    await this.page.waitForTimeout(1000);
  }

  async setMobileView() {
    const { MOBILE_VIEWPORT_WIDTH, MOBILE_VIEWPORT_HEIGHT } = config;
    await this.page.setViewportSize({ width: MOBILE_VIEWPORT_WIDTH, height: MOBILE_VIEWPORT_HEIGHT });
    await this.page.waitForTimeout(1000);
  }

  async clickTarget(target) {
    const locator = await this.resolver.resolveClickable(target);
    try {
      await locator.click({ timeout: 5000 });
    } catch (e) {
      await locator.click({ force: true, timeout: 5000 });
    }
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async hoverTarget(target) {
    const locator = await this.resolver.resolveClickable(target);
    await locator.hover();
    await this.page.waitForTimeout(800);
  }

  async pressKey(key) {
    await this.page.keyboard.press(key);
    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async scroll(direction) {
    if (direction === 'bottom') {
      await this.page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    } else {
      await this.page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    await this.page.waitForTimeout(1000);
  }

  async scrollTo(target) {
    const locator = await this.resolver.resolveSection(target);
    await locator.scrollIntoViewIfNeeded().catch(() => {});
    await this.page.waitForTimeout(800);
  }
}

module.exports = InteractionAction;

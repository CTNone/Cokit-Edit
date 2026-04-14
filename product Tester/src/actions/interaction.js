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
    if (config.EXECUTION_MODE === 'hybrid' && target) {
      try {
        const productInfo = await this.page.evaluate(() => {
          const items = Array.from(document.querySelectorAll('.product-item, .item-box, .product-grid .item-box'));
          if (!items.length) return '';
          return items.map(item => {
            const name = item.querySelector('.product-title, h2, .details a')?.innerText?.trim() || '';
            const price = item.querySelector('.actual-price, .price, .product-price')?.innerText?.trim() || '';
            return name && (price || 'Details') ? `${name} : ${price || 'See Details'}` : '';
          }).filter(Boolean).join('\\n');
        });

        if (productInfo) {
          const LlmClient = require('../llm-client');
          const client = new LlmClient();
          const response = await client.chat([
            { role: 'system', content: "You are an AI UI Agent. Based on the product list, find the ONE product that best matches the user's objective (e.g., 'most expensive', 'cheapest', 'specific name'). Return ONLY the EXACT name of that product. No explanation. Return 'NONE' if no product matches." },
            { role: 'user', content: `Product List:\n${productInfo}\n\nTask: ${target}` }
          ]);
          
          let productName = response.text.trim();
          productName = productName.replace(/^["']|["']$/g, '').trim();

          if (productName && productName !== 'NONE') {
            const logger = require('../logger');
            logger.info(`    [AI Decision] Chọn sản phẩm: "${productName}" để thực hiện task: "${target}"`);
            
            // Try to click "Add to cart" or just the product if it's the target
            const locator = await this.resolver.resolveClickable(`"Add to cart" của sản phẩm "${productName}"`).catch(async () => {
                return await this.resolver.resolveClickable(productName);
            });

            try {
               await locator.click({ timeout: 5000 });
               await this.page.waitForLoadState('load').catch(() => {});
               await this.page.waitForTimeout(1000);
            } catch (e) {
               await locator.click({ force: true, timeout: 5000 });
               await this.page.waitForLoadState('load').catch(() => {});
               await this.page.waitForTimeout(1000);
            }
          } else {
             const logger = require('../logger');
             logger.warn(`    [AI Decision] Không tìm thấy sản phẩm nào phù hợp với yêu cầu: "${target}"`);
          }
        } else {
           const logger = require('../logger');
           logger.warn(`    [AI Decision Failed] Không tìm thấy thẻ HTML sản phẩm nào trên trang. Có thể trang bị lỗi hoặc cấu trúc DOM đã thay đổi.`);
        }
      } catch (error) {
        const logger = require('../logger');
        logger.warn(`    [AI Decision Failed] Lỗi trong quá trình phân tích/thực thi: ${error.message}`);
      }
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
    await this.page.waitForTimeout(500);
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

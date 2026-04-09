const { createInteractionError } = require('./interaction-errors');

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class SelectorResolver {
  constructor(page, options = {}) {
    this.page = page;
    this.timeout = options.timeout || 5000;
  }

  async prepare(locator, options = {}) {
    const timeout = options.timeout || this.timeout;
    const ensureEnabled = options.ensureEnabled !== false;
    const description = options.description || 'unknown element';

    await locator.waitFor({ state: 'attached', timeout }).catch(() => {
      throw createInteractionError('selector_fail', `Element chưa xuất hiện trong DOM: ${description}`);
    });

    await locator.scrollIntoViewIfNeeded().catch(() => {});

    await locator.waitFor({ state: 'visible', timeout }).catch(() => {
      throw createInteractionError('selector_fail', `Element không hiển thị để tương tác: ${description}`);
    });

    if (ensureEnabled) {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const disabled = await locator.isDisabled().catch(() => false);
        if (!disabled) {
          return locator;
        }
        await this.page.waitForTimeout(150);
      }

      throw createInteractionError('timeout_fail', `Element vẫn bị disable sau khi chờ: ${description}`);
    }

    return locator;
  }

  async resolveFirst(candidates, options = {}) {
    for (const candidate of candidates) {
      if (!candidate) continue;

      const locator = candidate.first();
      const count = await locator.count().catch(() => 0);
      if (!count) continue;

      const visible = await locator.isVisible().catch(() => false);
      if (!visible) {
        await locator.scrollIntoViewIfNeeded().catch(() => {});
      }

      const nowVisible = await locator.isVisible().catch(() => false);
      if (nowVisible) {
        return this.prepare(locator, options);
      }
    }

    throw createInteractionError(
      'selector_fail',
      options.errorMessage || `Không tìm thấy phần tử phù hợp: ${options.description || 'unknown target'}`,
    );
  }

  async resolveInput(fieldName) {
    const normalizedField = String(fieldName || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const compact = normalizedField.replace(/\s+/g, '');
    const safeRegex = new RegExp(escapeRegex(normalizedField), 'i');

    return this.resolveFirst([
      this.page.getByLabel(safeRegex),
      this.page.locator(`input[name*="${normalizedField}" i], textarea[name*="${normalizedField}" i]`),
      this.page.locator(`input[placeholder*="${normalizedField}" i], textarea[placeholder*="${normalizedField}" i]`),
      this.page.locator(`input[aria-label*="${normalizedField}" i], textarea[aria-label*="${normalizedField}" i]`),
      this.page.locator(`input[id*="${compact}" i], textarea[id*="${compact}" i]`),
      this.page.locator(`label:has-text("${fieldName}") + input, label:has-text("${fieldName}") + textarea`),
    ], {
      description: `field "${fieldName}"`,
      errorMessage: `Không tìm thấy field phù hợp cho "${fieldName}"`,
    });
  }

  async resolveClickable(target) {
    const cleaned = String(target || '').trim();
    const compact = cleaned.replace(/\s+/g, '');
    const safeRegex = new RegExp(escapeRegex(cleaned), 'i');

    const candidates = [];
    if (/submit/i.test(cleaned)) {
      candidates.push(this.page.locator('button[type="submit"], input[type="submit"]'));
    }

    candidates.push(
      this.page.getByRole('button', { name: safeRegex }),
      this.page.getByRole('link', { name: safeRegex }),
      this.page.getByText(safeRegex),
      this.page.locator(`#${compact}, #${compact}Btn, [id*="${compact}" i], [data-testid*="${compact}" i], [aria-label*="${cleaned}" i]`),
      this.page.locator('button, a, [role="button"]').filter({ hasText: safeRegex }),
    );

    return this.resolveFirst(candidates, {
      description: `click target "${target}"`,
      errorMessage: `Không tìm thấy element để click: ${target}`,
    });
  }
}

module.exports = SelectorResolver;

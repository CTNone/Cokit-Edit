const { createInteractionError } = require('./interaction-errors');

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class SelectorResolver {
  constructor(page, options = {}) {
    this.page = page;
    this.timeout = options.timeout || 5000;
    this.llm = options.llm; // LLM Provider để tự sửa lỗi
    this.frame = null;
    this.shadowHost = null;
  }

  getRoot() {
    return this.frame || this.page;
  }

  getScope() {
    return this.shadowHost || this.getRoot();
  }

  setFrame(frame) {
    this.frame = frame || null;
    this.shadowHost = null;
  }

  resetFrame() {
    this.frame = null;
    this.shadowHost = null;
  }

  setShadowHost(locator) {
    this.shadowHost = locator || null;
  }

  resetShadowHost() {
    this.shadowHost = null;
  }

  locator(selector) {
    return this.getScope().locator(selector);
  }

  getByRole(role, options) {
    return this.getScope().getByRole(role, options);
  }

  getByText(text, options) {
    return this.getScope().getByText(text, options);
  }

  getByLabel(text, options) {
    return this.getScope().getByLabel(text, options);
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

  async discoverInteractiveElements() {
    return await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"], [role="menuitem"], [onclick]'));
      return elements
        .filter(el => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        })
        .slice(0, 100) // Giới hạn 100 phần tử để không làm quá tải Llama
        .map((el, index) => {
          // Tạo một CSS selector đơn giản nhất có thể cho mỗi phần tử
          let simpleSelector = el.tagName.toLowerCase();
          if (el.id) simpleSelector += `#${el.id}`;
          else if (el.name) simpleSelector += `[name="${el.name}"]`;
          
          return {
            index,
            tag: el.tagName.toLowerCase(),
            text: (el.innerText || el.value || '').trim().substring(0, 50),
            placeholder: el.placeholder || '',
            id: el.id || '',
            name: el.name || '',
            ariaLabel: el.getAttribute('aria-label') || '',
            role: el.getAttribute('role') || '',
            selector: simpleSelector
          };
        });
    });
  }

  async selfHeal(options) {
    if (!this.llm) return null;
    
    console.log(`    [Self-Healing] Đang tìm phần tử thay thế cho: "${options.description}" bằng LLM...`);
    const elements = await this.discoverInteractiveElements();
    
    const prompt = `
BẠN LÀ CHUYÊN GIA AUTOMATION TEST.
Nhiệm vụ: Tìm phần tử phù hợp nhất cho hành động: "${options.description}"

DANH SÁCH PHẦN TỬ:
${elements.map(el => `[Index ${el.index}] Tag: ${el.tag}, Text: "${el.text}", Selector: "${el.selector}"`).join('\n')}

QUY TẮC CHỌN (BẮT BUỘC):
1. CHỈ ĐƯỢC CHỌN TỪ DANH SÁCH TRÊN. KHÔNG ĐƯỢC TỰ CHẾ SELECTOR.
2. Trả về chính xác số Index và Selector của phần tử đó.
3. Ưu tiên nút bấm chính (Login/Sign in), tránh các nút phụ (Remember me).

TRẢ VỀ JSON:
{
  "found": true,
  "index": number,
  "reason": "Giải thích ngắn gọn lý do chọn",
  "selector": "Phải là selector nguyên bản từ danh sách trên"
}
    `;

    try {
      const chatResponse = await this.llm.chat([
        { role: 'user', content: prompt }
      ]);
      
      const rawText = chatResponse.text;
      const start = rawText.indexOf('{');
      const end = rawText.lastIndexOf('}');
      
      if (start === -1 || end === -1) {
        throw new Error('Không tìm thấy JSON trong phản hồi của LLM');
      }
      
      let jsonString = rawText.slice(start, end + 1);
      // Sửa lỗi escape character thường gặp ở Llama 3.1 8B
      jsonString = jsonString
        .replace(/\\(?!"|\\|\/|b|f|n|r|t|u)/g, '\\\\') 
        .replace(/[\u0000-\u001F]+/g, ' ');

      const result = JSON.parse(jsonString);

      if (result.found && result.selector) {
        console.log(`    [Self-Healing] LLM gợi ý dùng: "${result.selector}" (Lý do: ${result.reason})`);
        // Thử locator mới từ LLM
        const healedLocator = this.page.locator(result.selector).first();
        if (await healedLocator.isVisible()) {
          return this.prepare(healedLocator, options);
        }
      }
    } catch (err) {
      console.log(`    [Self-Healing] Thất bại: ${err.message}`);
    }

    return null;
  }

  async resolveFirst(candidates, options = {}) {
    // 1. Thử các cách tìm kiếm thông thường (Deterministic)
    for (const candidate of candidates) {
      if (!candidate) continue;

      const count = await candidate.count().catch(() => 0);
      for (let i = 0; i < count; i++) {
        const locator = candidate.nth(i);
        const visible = await locator.isVisible().catch(() => false);
        
        if (!visible) {
          await locator.scrollIntoViewIfNeeded().catch(() => {}).catch(() => {});
        }

        const nowVisible = await locator.isVisible().catch(() => false);
        if (nowVisible) {
          return this.prepare(locator, options);
        }
      }
    }

    // 2. Nếu thất bại, thử Self-healing bằng LLM (Semantic)
    const healed = await this.selfHeal(options);
    if (healed) return healed;

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
      this.getByLabel(safeRegex),
      this.locator(`input[name*="${normalizedField}" i], textarea[name*="${normalizedField}" i], select[name*="${normalizedField}" i]`),
      this.locator(`input[placeholder*="${normalizedField}" i], textarea[placeholder*="${normalizedField}" i]`),
      this.locator(`input[value*="${normalizedField}" i]`),
      this.locator(`input[aria-label*="${normalizedField}" i], textarea[aria-label*="${normalizedField}" i], select[aria-label*="${normalizedField}" i]`),
      this.locator(`input[id*="${compact}" i], textarea[id*="${compact}" i], select[id*="${compact}" i]`),
      this.locator(`label:has-text("${fieldName}") + input, label:has-text("${fieldName}") + textarea, label:has-text("${fieldName}") + select`),
    ], {
      description: `field "${fieldName}"`,
      errorMessage: `Không tìm thấy field phù hợp cho "${fieldName}"`,
    });
  }

  async resolveDropdown(fieldName) {
    const normalizedField = String(fieldName || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const compact = normalizedField.replace(/\s+/g, '');
    const safeRegex = new RegExp(escapeRegex(normalizedField), 'i');

    return this.resolveFirst([
      this.getByLabel(safeRegex),
      this.getByRole('combobox', { name: safeRegex }),
      this.getByRole('listbox', { name: safeRegex }),
      this.locator(`select[name*="${normalizedField}" i], [role="combobox"][name*="${normalizedField}" i]`),
      this.locator(`select[id*="${compact}" i], [role="combobox"][id*="${compact}" i]`),
      this.locator(`label:has-text("${fieldName}") + select, label:has-text("${fieldName}") ~ [role="combobox"]`),
      this.getByText(safeRegex),
    ], {
      description: `dropdown "${fieldName}"`,
      errorMessage: `Không tìm thấy dropdown phù hợp cho "${fieldName}"`,
    });
  }

  async resolveFileInput(fieldName = 'file') {
    const normalizedField = String(fieldName || 'file').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const compact = normalizedField.replace(/\s+/g, '');
    const safeRegex = new RegExp(escapeRegex(normalizedField), 'i');

    return this.resolveFirst([
      this.getByLabel(safeRegex),
      this.locator('input[type="file"]'),
      this.locator(`input[type="file"][name*="${normalizedField}" i], input[type="file"][id*="${compact}" i]`),
      this.locator(`[data-testid*="${compact}" i] input[type="file"]`),
    ], {
      description: `file input "${fieldName}"`,
      errorMessage: `Không tìm thấy file input phù hợp cho "${fieldName}"`,
      ensureEnabled: true,
    });
  }

  async resolveIframe(target) {
    const cleaned = String(target || '').trim();
    const compact = cleaned.replace(/\s+/g, '');
    const safeRegex = new RegExp(escapeRegex(cleaned), 'i');

    return this.resolveFirst([
      this.page.locator(`iframe[name*="${cleaned}" i], iframe[id*="${compact}" i], iframe[src*="${cleaned}" i], iframe[title*="${cleaned}" i]`),
      this.page.locator('iframe').filter({ hasText: safeRegex }),
    ], {
      description: `iframe "${target}"`,
      errorMessage: `Không tìm thấy iframe phù hợp cho "${target}"`,
    });
  }

  async resolveShadowHost(target) {
    const cleaned = String(target || '').trim();
    const compact = cleaned.replace(/\s+/g, '');
    const safeRegex = new RegExp(escapeRegex(cleaned), 'i');

    return this.resolveFirst([
      this.getByRole('group', { name: safeRegex }),
      this.locator(`[id*="${compact}" i], [data-testid*="${compact}" i], [aria-label*="${cleaned}" i]`),
      this.getByText(safeRegex),
      this.locator(cleaned),
    ], {
      description: `shadow host "${target}"`,
      errorMessage: `Không tìm thấy shadow host phù hợp cho "${target}"`,
    });
  }

  async resolveClickable(target) {
    const cleaned = String(target || '').trim();
    
    // Check if we have a smart container lookup via natural language or quotes
    let actionTarget = cleaned;
    let containerText = null;

    if (/(?:của sản phẩm|trong(?: vùng| khối| phần| danh sách)?)\s+/i.test(cleaned)) {
      const parts = cleaned.split(/(?:của sản phẩm|trong(?: vùng| khối| phần| danh sách)?)\s+/i);
      if (parts.length >= 2) {
        actionTarget = parts[0].replace(/["']/g, '').trim();
        containerText = parts[1].replace(/["']/g, '').trim();
      }
    } else {
      const quoteMatches = [...cleaned.matchAll(/"([^"]+)"/g)].map(m => m[1]);
      if (quoteMatches.length >= 2) {
        actionTarget = quoteMatches[0];
        containerText = quoteMatches[1];
      }
    }

    if (containerText) {
      // Find all potential containers
      const containerLocators = [
        this.page.locator('section, div.product-item, div.item-box, fieldset, dl, article, li, tr, ul, ol').filter({ hasText: new RegExp(escapeRegex(containerText), 'i') }),
        this.getByText(new RegExp(escapeRegex(containerText), 'i')).locator('xpath=ancestor::div[contains(@class, "product-item") or contains(@class, "item-box") or contains(@class, "attributes")] | ancestor::fieldset | ancestor::dl'),
        this.getByText(new RegExp(escapeRegex(containerText), 'i')).locator('xpath=..'),
      ];

      for (const containerLocator of containerLocators) {
        const count = await containerLocator.count().catch(() => 0);
        for (let i = 0; i < count; i++) {
          const container = containerLocator.nth(i);
          const containerName = await container.evaluate(el => el.tagName + (el.className ? '.' + el.className : '')).catch(() => 'unknown');
          
          const subResolver = new SelectorResolver(container, { timeout: 1500 });
          try {
            const result = await subResolver.resolveClickable(actionTarget);
            if (result) {
               console.log(`    [Debug] Tìm thấy "${actionTarget}" trong container "${containerText}" (${containerName})`);
               return result;
            }
          } catch (err) {
            // Target not in this container instance, try next instance
            continue;
          }
        }
      }
      console.log(`    [Debug] Không tìm thấy "${actionTarget}" trong bất kỳ container nào của "${containerText}". Chuyển sang tìm kiếm toàn cục...`);
      
      // If we reach here, deep search failed, fallback to global unquoted search
      actionTarget = actionTarget.replace(/["']/g, '').trim();
    }

    const compact = actionTarget.replace(/\s+/g, '');
    // Fuzzy regex: allow optional spaces between characters and look for partial match
    const fuzzyPattern = actionTarget.split('').map(c => escapeRegex(c)).join('\\s*');
    const safeRegex = new RegExp(fuzzyPattern, 'i');
    const candidates = [];
    if (/submit/i.test(actionTarget)) {
      candidates.push(this.page.locator('button[type="submit"], input[type="submit"]'));
    }

    if (/menu|ba dấu gạch ngang|biểu tượng/i.test(actionTarget)) {
      candidates.push(
        this.locator('.menu-before, .ico-menu, .header-menu-button, .menu-toggle, text=Categories, text=CATEGORIES, [aria-label*="menu" i]'),
        this.page.locator('.header-menu-button, .hamburger-menu')
      );
    }

    let searchRegex = safeRegex;
    if (/dow?n?load/i.test(actionTarget)) {
      searchRegex = /dow?n?load/i;
    }

    candidates.push(
      this.getByRole('button', { name: searchRegex }),
      this.getByRole('link', { name: searchRegex }),
      this.getByLabel(searchRegex),
      this.getByText(searchRegex),
      this.locator(`input[value*="${actionTarget}" i], input[type="button"][value*="${actionTarget}" i], input[type="submit"][value*="${actionTarget}" i]`),
      this.locator(`#${compact}, #${compact}Btn, [id*="${compact}" i], [data-testid*="${compact}" i], [aria-label*="${actionTarget}" i]`),
      this.locator('button, a, input[type="button"], input[type="submit"], [role="button"], [role="menuitem"]').filter({ hasText: searchRegex }),
    );

    return this.resolveFirst(candidates, {
      description: `click target "${target}"`,
      errorMessage: `Không tìm thấy element để click: ${target}`,
    });
  }

  async resolveOption(option) {
    const cleaned = String(option || '').trim();
    const compact = cleaned.replace(/\s+/g, '');
    const safeRegex = new RegExp(escapeRegex(cleaned), 'i');

    return this.resolveFirst([
      this.getByRole('option', { name: safeRegex }),
      this.getByRole('menuitem', { name: safeRegex }),
      this.getByText(safeRegex),
      this.locator(`[data-value*="${cleaned}" i], [value*="${cleaned}" i], [id*="${compact}" i]`),
    ], {
      description: `option "${option}"`,
      errorMessage: `Không tìm thấy option phù hợp cho "${option}"`,
    });
  }

  async resolveTableRow(rowText) {
    const cleaned = String(rowText || '').trim();
    const safeRegex = new RegExp(escapeRegex(cleaned), 'i');

    return this.resolveFirst([
      this.locator('tr').filter({ hasText: safeRegex }),
      this.locator('[role="row"]').filter({ hasText: safeRegex }),
      this.locator('tbody tr').filter({ hasText: safeRegex }),
      this.locator('[data-testid*="row" i], .table-row, .grid-row').filter({ hasText: safeRegex }),
    ], {
      description: `table row "${rowText}"`,
      errorMessage: `Không tìm thấy row chứa nội dung "${rowText}"`,
      ensureEnabled: false,
    });
  }

  async resolveSection(sectionName) {
    const cleaned = String(sectionName || '').trim();
    const normalized = cleaned.toLowerCase();
    const compact = normalized.replace(/[^a-z0-9]+/g, '');
    const safeRegex = new RegExp(escapeRegex(cleaned), 'i');

    const aliases = [];
    if (/giới thiệu|about/.test(normalized)) aliases.push('about', 'gioi-thieu');
    if (/dự án|du an|project/.test(normalized)) aliases.push('projects', 'featured-projects');
    if (/liên hệ|lien he|contact|mạng xã hội|social/.test(normalized)) aliases.push('contact', 'social', 'social-links');
    if (/kỹ năng|ky nang|skill/.test(normalized)) aliases.push('skills');
    if (/học tập|education|study/.test(normalized)) aliases.push('education');

    const aliasSelectors = aliases.flatMap((alias) => ([
      `#${alias}`,
      `[id*="${alias}" i]`,
      `[data-testid*="${alias}" i]`,
      `[aria-label*="${alias}" i]`,
      `a[href="#${alias}"]`,
    ]));

    return this.resolveFirst([
      ...aliasSelectors.map((selector) => this.locator(selector)),
      this.locator(`#${compact}, [id*="${compact}" i], [data-testid*="${compact}" i], [aria-label*="${cleaned}" i]`),
      this.getByRole('heading', { name: safeRegex }),
      this.getByText(safeRegex),
      this.locator('section, nav, div').filter({ hasText: safeRegex }),
    ], {
      description: `section "${sectionName}"`,
      errorMessage: `Không tìm thấy section phù hợp cho "${sectionName}"`,
      ensureEnabled: false,
    });
  }
}

module.exports = SelectorResolver;

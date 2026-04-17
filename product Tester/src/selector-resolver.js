const { createInteractionError } = require('./interaction-errors');

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class SelectorResolver {
  constructor(page, options = {}) {
    this.page = page;
    this.timeout = options.timeout || 5000;
    this.llm = options.llm;
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

  getByPlaceholder(text, options) {
    return this.getScope().getByPlaceholder(text, options);
  }

  getByAltText(text, options) {
    return this.getScope().getByAltText(text, options);
  }

  getByTitle(text, options) {
    return this.getScope().getByTitle(text, options);
  }

  getByTestId(text, options) {
    return this.getScope().getByTestId(text, options);
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

  async discoverInteractiveElements(anchorText = null) {
    return await this.page.evaluate((anchor) => {
      const allElements = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"], [role="menuitem"], [onclick], svg, span'));
      const elements = allElements.filter(el => {
        const tag = el.tagName.toLowerCase();
        if (tag === 'span') {
          const t = el.innerText ? el.innerText.trim() : '';
          return (t === '-' || t === '+') && el.children.length === 0;
        }
        return true;
      });
      
      let anchorRect = null;
      if (anchor) {
        const anchorEl = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.includes(anchor));
        if (anchorEl) anchorRect = anchorEl.getBoundingClientRect();
      }

      const getIconHint = (el) => {
        const html = el.outerHTML.toLowerCase();
        if (html.includes('minus') || html.includes('-')) return 'minus';
        if (html.includes('plus') || html.includes('+')) return 'plus';
        if (html.includes('user')) return 'user';
        if (html.includes('close') || html.includes('x')) return 'close';
        if (html.includes('right') || html.includes('>') || html.includes('chevron')) return 'right';
        return '';
      };

      const rgbToHex = (rgb) => {
        if (!rgb || rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return '';
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) return rgb;
        const hex = (x) => ("0" + parseInt(x).toString(16)).slice(-2);
        return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
      };

      const getColorName = (color) => {
        const hex = rgbToHex(color).toLowerCase();
        if (hex.includes('#ff0000') || hex.includes('#ff4d4f')) return 'red';
        if (hex.includes('#008000') || hex.includes('#52c41a')) return 'green';
        if (hex.includes('#0000ff') || hex.includes('#1890ff')) return 'blue';
        if (hex.includes('#ffff00')) return 'yellow';
        return hex;
      };

      return elements
        .filter(el => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        })
        .slice(0, 50)
        .map((el, index) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          let simpleSelector = el.tagName.toLowerCase();
          if (el.id) simpleSelector += `#${el.id}`;
          else if (el.name) simpleSelector += `[name="${el.name}"]`;
          
          let spatialInfo = '';
          if (anchorRect) {
            const dx = Math.round(rect.x - anchorRect.x);
            const dy = Math.round(rect.y - anchorRect.y);
            if (Math.abs(dy) > Math.abs(dx)) {
                spatialInfo = dy > 0 ? `below (dist: ${dy}px)` : `above (dist: ${-dy}px)`;
            } else {
                spatialInfo = dx > 0 ? `right-of (dist: ${dx}px)` : `left-of (dist: ${-dx}px)`;
            }
          }

          return {
            index,
            tag: el.tagName.toLowerCase(),
            text: (el.innerText || el.value || '').trim().substring(0, 50),
            placeholder: el.placeholder || '',
            id: el.id || '',
            className: el.className || '',
            color: getColorName(style.color),
            bgColor: getColorName(style.backgroundColor),
            iconHint: getIconHint(el),
            spatialInfo,
            pos: { x: Math.round(rect.x), y: Math.round(rect.y) },
            selector: simpleSelector
          };
        });
    }, anchorText);
  }

  async selfHeal(options) {
    if (!this.llm) return null;
    console.log(`    [Self-Healing] Đang tìm phần tử thay thế cho: "${options.description}" bằng LLM...`);
    const elements = await this.discoverInteractiveElements(options.anchorText);
    const systemPrompt = `BẠN LÀ CHUYÊN GIA AUTOMATION TEST. Nhiệm vụ: Tìm selector thay thế. QUY TẮC: 1. Khớp nội dung/ngữ nghĩa. 2. CHÚ Ý COLOR, ICON & SPATIAL INFO (VỊ TRÍ TƯƠNG ĐỐI). 3. SMART CONTAINER (div, li). 4. Trả về format JSON chứa "selector" mới nhất.`;
    const prompt = `DANH SÁCH PHẦN TỬ (SNAPSHOT):\n${elements.map(el => `[Idx ${el.index}] Tag: ${el.tag}, Text: "${el.text}", Color: "${el.color}", Icon: "${el.iconHint}", Spatial: "${el.spatialInfo}", Pos: (${el.pos.x},${el.pos.y}), Selector: "${el.selector}"`).join('\n')}\n\nHÃY CHỌN SELECTOR THAY THẾ CHO: "${options.description}"\nGhi chú: nếu có relation (vd: below FKR), tham khảo cột Spatial. Nếu có mô tả màu sắc (vd: red), tham khảo cột Color. Nếu là icon, xem Icon.`;

    try {
      const response = await this.llm.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]);
      const rawText = response.text;
      const selectorMatch = rawText.match(/"selector"\s*:\s*"(.+?)"/);
      if (selectorMatch && selectorMatch[1] !== 'null') {
        const healedLocator = this.page.locator(selectorMatch[1]).first();
        if (await healedLocator.isVisible().catch(() => false)) {
          return this.prepare(healedLocator, options);
        }
      }
    } catch (err) {
      console.log(`    [Self-Healing] Thất bại: ${err.message}`);
    }
    return null;
  }

  async resolveFirst(candidates, options = {}) {
    for (const candidate of candidates) {
      if (!candidate) continue;
      const count = await candidate.count().catch(() => 0);
      for (let i = 0; i < count; i++) {
        const locator = candidate.nth(i);
        
        if (options.colorFilter) {
          const isColorMatch = await locator.evaluate((el, color) => {
            const style = window.getComputedStyle(el);
            const c = (style.color + style.backgroundColor).toLowerCase();
            return c.includes(color) || (color === 'red' && (c.includes('255, 77, 79') || c.includes('#ff') || c.includes('red')));
          }, options.colorFilter).catch(() => false);
          if (!isColorMatch) continue;
        }

        if (await locator.isVisible().catch(() => false)) return this.prepare(locator, options);
        await locator.scrollIntoViewIfNeeded().catch(() => {});
        if (await locator.isVisible().catch(() => false)) return this.prepare(locator, options);
      }
    }
    const healed = await this.selfHeal(options);
    if (healed) return healed;
    throw createInteractionError('selector_fail', options.errorMessage || `Không tìm thấy phần tử phù hợp: ${options.description}`);
  }

  async resolveInput(fieldName) {
    const normalizedField = String(fieldName || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const compact = normalizedField.replace(/\s+/g, '');
    const safeRegex = new RegExp(escapeRegex(normalizedField), 'i');
    const inputTags = 'input, textarea, select, [contenteditable="true"]';
    const wrap = (loc) => loc.locator(`xpath=(. | .//input | .//textarea | .//select | .//*[@contenteditable="true"])[self::input or self::textarea or self::select or @contenteditable="true"]`).first();
    const candidates = [
       this.getByPlaceholder(safeRegex),
       this.getByRole('textbox', { name: safeRegex }),
       wrap(this.getByLabel(safeRegex)),
       this.locator(`input[name*="${normalizedField}" i], textarea[name*="${normalizedField}" i]`),
       this.locator(`input[id*="${compact}" i], textarea[id*="${compact}" i]`)
    ];
    if (normalizedField.includes('password')) candidates.unshift(this.locator('input[type="password"]'));
    return this.resolveFirst([...candidates, this.locator(`label:has-text("${fieldName}") + ${inputTags}`)], { description: `field "${fieldName}"` });
  }

  async resolveClickable(target) {
    let cleaned = String(target || '').trim();
    let relation = null, anchorText = null, colorFilter = null;
    const colorMatch = cleaned.match(/màu\s+(đỏ|xanh|vàng|trắng|đen)/i);
    if (colorMatch) {
      colorFilter = colorMatch[1].toLowerCase().replace('đỏ', 'red').replace('xanh', 'blue');
      cleaned = cleaned.replace(colorMatch[0], '').trim();
    }
    const spatialKeywords = [
      { key: /dưới|phía dưới/i, type: 'below' },
      { key: /trên|phía trên/i, type: 'above' },
      { key: /trái|bên trái/i, type: 'left-of' },
      { key: /phải|bên phải/i, type: 'right-of' },
      { key: /gần|cạnh/i, type: 'near' }
    ];
    for (const k of spatialKeywords) {
      const match = cleaned.match(new RegExp(`(.+)\\s+${k.key.source}\\s+(.+)$`, 'i'));
      if (match) {
        target = match[1].trim(); anchorText = match[2].trim(); relation = k.type;
        break;
      }
    }
    const SYMBOL_MAP = {
      '(-)': ['.anticon-minus', '[aria-label*="collapse"]', '[title*="collapse"]', 'text="-"'],
      '(+)': ['.anticon-plus', '[aria-label*="expand"]', '[title*="expand"]', 'text="+"'],
      '(x)': ['.anticon-close', 'text="x"'],
      '(>)': ['.anticon-right']
    };
    const getSymbolSelectors = (t) => {
      for (const [sym, sel] of Object.entries(SYMBOL_MAP)) {
        if (t.includes(sym) || (t.length === 1 && sym.includes(t))) return sel;
      }
      return [];
    };
    const containerRegex = /^(?:card|item|khối|vùng|ô|nút|app)\s+(.+)$/i;
    const containerMatch = cleaned.match(containerRegex);
    let isContainerLookup = !!containerMatch;
    let actionTarget = containerMatch ? containerMatch[1] : (relation ? target : cleaned);

    let candidates = [];
    const symbolSelectors = getSymbolSelectors(actionTarget);
    if (symbolSelectors.length > 0) candidates = symbolSelectors.map(s => this.locator(s));
    else {
      const safeRegex = new RegExp(escapeRegex(actionTarget), 'i');
      candidates = [
        this.getByText(actionTarget, { exact: true }),
        this.getByRole('button', { name: actionTarget, exact: true }),
        this.getByRole('button', { name: safeRegex }),
        this.getByText(safeRegex),
        this.locator('button, a, [role="button"]').filter({ hasText: safeRegex })
      ];
    }

    if (relation && anchorText) {
      const safeAnchor = anchorText.replace(/"/g, '\\"');
      const layoutSuffix = `:${relation}(:text("${safeAnchor}"))`;
      if (symbolSelectors.length > 0) {
        candidates = symbolSelectors.map(s => this.locator(`${s}${layoutSuffix}`));
      } else {
        const safeTarget = escapeRegex(actionTarget);
        candidates = [
          this.locator(`text="${actionTarget}"${layoutSuffix}`),
          this.locator(`button:has-text("${safeTarget}")${layoutSuffix}`),
          this.locator(`a:has-text("${safeTarget}")${layoutSuffix}`),
          this.locator(`[role="button"]:has-text("${safeTarget}")${layoutSuffix}`)
        ];
      }
    }

    if (isContainerLookup) {
      const containerCandidates = candidates.map(c => c.locator('xpath=ancestor::*[self::div or self::li or self::section or self::button or self::a][1]'));
      candidates = [...containerCandidates, ...candidates];
    }
    
    return this.resolveFirst(candidates, { 
      description: `click target "${cleaned}"`, 
      colorFilter, 
      anchorText, 
      relation 
    });
  }

  async resolveOption(option) { return this.resolveFirst([this.getByText(new RegExp(escapeRegex(option), 'i'))], { description: `option "${option}"` }); }
  async resolveTableRow(rowText) { return this.resolveFirst([this.locator('tr').filter({ hasText: new RegExp(escapeRegex(rowText), 'i') })], { description: `row "${rowText}"` }); }
  async resolveDropdown(name) { return this.resolveFirst([this.getByLabel(new RegExp(escapeRegex(name), 'i')), this.getByRole('combobox', { name: new RegExp(escapeRegex(name), 'i') })], { description: `dropdown "${name}"` }); }
}

module.exports = SelectorResolver;

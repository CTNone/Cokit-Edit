const { normalizeWhitespace } = require('./utils');
const config = require('./config');

class AssertionEngine {
  constructor(page, options = {}) {
    this.page = page;
    this.targetUrl = options.targetUrl;
    this.timeout = options.timeout || 3000;
    this.llmAssertionHelper = options.llmAssertionHelper || null;
    this.onArtifact = options.onArtifact || null;
  }

  async warmUp(expectedLower) {
    if (/redirected?.*dashboard/i.test(expectedLower)) {
      const dashboardRegex = new RegExp(config.DASHBOARD_PAGE_PATTERN, 'i');
      await this.page.waitForURL(dashboardRegex, { timeout: this.timeout }).catch(() => {});
      await this.page.waitForTimeout(300);
    }

    if (/registration.*redirected?.*login/i.test(expectedLower) || /successful.*login page/i.test(expectedLower)) {
      const loginRegex = new RegExp(config.LOGIN_PAGE_PATTERN, 'i');
      await this.page.waitForURL(loginRegex, { timeout: this.timeout }).catch(() => {});
      await this.page.waitForTimeout(300);
    }

    if (/logged out/i.test(expectedLower) || /landing page/i.test(expectedLower)) {
      const loginRegex = new RegExp(config.LOGIN_PAGE_PATTERN, 'i');
      await this.page.waitForURL(loginRegex, { timeout: this.timeout }).catch(() => {});
      await this.page.waitForTimeout(300);
    }

    if (/reset link sent to email/i.test(expectedLower)) {
      await this.page.getByText(/reset link sent to email/i).waitFor({ timeout: this.timeout }).catch(() => {});
    }
  }

  async evaluate(scenario) {
    const expected = normalizeWhitespace(scenario.expected || scenario['Expected Result'] || '');
    const expectedLower = expected.toLowerCase();

    await this.warmUp(expectedLower);

    const bodyText = normalizeWhitespace(await this.page.locator('body').innerText().catch(() => ''));
    const url = this.page.url();
    const bodyLower = bodyText.toLowerCase();

    const pass = (actual, note = '-') => ({ passed: true, actual, note });
    const fail = (actual, note = '-') => ({ passed: false, actual, note });

    const findVisibleText = async (regex) => this.page.getByText(regex).first().isVisible().catch(() => false);

    // --- 1. DETERMINISTIC PASS RULES (Optimization) ---
    // If these match exactly, we return PASS immediately to save time.
    
    // Quoted strings check
    const quotedValues = [...expected.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    if (quotedValues.length > 0) {
      const missing = quotedValues.find((value) => !bodyLower.includes(value.toLowerCase()) && !url.toLowerCase().includes(value.toLowerCase()));
      if (!missing) return pass(`Quan sát được chính xác nội dung: "${quotedValues.join(', ')}"`);
    }

    // Keyword speed check
    if (expected && bodyLower.includes(expectedLower)) {
      return pass(`Nội dung thực tế khớp chính xác với mong đợi.`);
    }

    // Dashboard redirect speed check
    if (/redirected?.*dashboard/i.test(expectedLower) && (new RegExp(config.DASHBOARD_PAGE_PATTERN, 'i').test(url))) {
      return pass(`Đã chuyển hướng đến Dashboard.`);
    }

    // --- 2. SEMANTIC FALLBACK (THE HYBRID JUDGE) ---
    if (this.llmAssertionHelper) {
      try {
        const llmResult = await this.llmAssertionHelper.evaluate({
          scenario: scenario.title || scenario.Scenario || scenario.id || scenario.ID,
          expected,
          url,
          bodyText,
        });
        
        const facts = llmResult?.parsed?.facts;
        if (facts) {
          // THẨM PHÁN (THE JUDGE) - Thực hiện logic so khớp dựa trên sự thật
          const rawMsgs = facts.rawMessages || [];
          const allMessagesText = rawMsgs.join(' ').toLowerCase();
          const pType = (facts.pageType || '').toLowerCase();
          const uStatus = (facts.userStatus || '').toLowerCase();
          
          let isMatch = false;
          let reason = '';

          // Quy tắc 1: Kiểm tra lỗi đăng nhập
          if (/(không cho phép|thất bại|sai|lỗi)/i.test(expectedLower)) {
            if (/(invalid|error|fail|incorrect|sai|không|chưa)/i.test(allMessagesText) || pType.includes('error')) {
              isMatch = true;
              reason = 'Thông báo lỗi trên màn hình khớp với nghiệp vụ.';
            }
          }
          
          // Quy tắc 2: Kiểm tra đăng nhập thành công
          if (/(thành công|dashboard|vào trang)/i.test(expectedLower)) {
            if (uStatus === 'logged_in' || /(dashboard|welcome|admin|home)/i.test(pType) || url.includes('dashboard')) {
              isMatch = true;
              reason = 'Xác nhận đăng nhập thành công qua trạng thái trang.';
            }
          }

          // Quy tắc 3: Kiểm tra Đăng xuất / Get Started
          if (/(đăng xuất|get started|thoát)/i.test(expectedLower)) {
            if (uStatus === 'anonymous' || /(login|home|get-started)/i.test(pType) || allMessagesText.includes('sign in')) {
              isMatch = true;
              reason = 'Xác nhận đăng xuất thành công qua trạng thái trang.';
            }
          }

          // Kết quả Actual chỉ chứa văn bản nguyên bản (tránh dịch)
          const actualEvidence = rawMsgs.length > 0 
            ? rawMsgs.join('; ') 
            : `Trang: ${facts.pageType}`;

          return {
            passed: isMatch,
            actual: actualEvidence,
            note: `[Judge] ${reason}. [AI Note] ${facts.evaluationNote || ''}`,
            facts: facts
          };
        }
      } catch (error) {
        console.error(`    [Judge Error] Semantic evaluation failed: ${error.message}`);
      }
    }

    return fail(`Không tìm thấy bằng chứng phù hợp cho mong đợi: "${expected}"`, 'Thẩm phán code không xác nhận được kết quả này.');
  }
}

module.exports = AssertionEngine;

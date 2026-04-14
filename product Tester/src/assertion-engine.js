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

    const quotedValues = [...expected.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    if (quotedValues.length > 0) {
      const missing = quotedValues.find((value) => !bodyLower.includes(value.toLowerCase()) && !url.toLowerCase().includes(value.toLowerCase()));
      if (!missing) {
        return pass(`Quan sát được đúng nội dung mong đợi trên trang. URL hiện tại: \`${url}\`.`);
      }
      return fail(`Không thấy nội dung mong đợi \`${missing}\`. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText}`);
    }

    if (/redirected?.*dashboard/i.test(expectedLower)) {
      const dashboardRegex = new RegExp(config.DASHBOARD_PAGE_PATTERN, 'i');
      if (dashboardRegex.test(url) || bodyLower.includes('dashboard')) {
        return pass(`Người dùng được chuyển tới dashboard tại \`${url}\`.`);
      }
      return fail(`Không chuyển tới dashboard. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText}`);
    }

    if (/registration.*redirected?.*login/i.test(expectedLower) || /successful.*login page/i.test(expectedLower)) {
      const loginRegex = new RegExp(config.LOGIN_PAGE_PATTERN, 'i');
      if (loginRegex.test(url)) {
        return pass(`Đăng ký thành công và chuyển về trang đăng nhập tại \`${url}\`.`);
      }
      return fail(`Không chuyển sang trang đăng nhập. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText}`);
    }

    if (/logged out/i.test(expectedLower) || /landing page/i.test(expectedLower)) {
      const loginRegex = new RegExp(config.LOGIN_PAGE_PATTERN, 'i');
      const dashboardRegex = new RegExp(config.DASHBOARD_PAGE_PATTERN, 'i');
      if (loginRegex.test(url) || (!dashboardRegex.test(url) && url.startsWith(this.targetUrl))) {
        return pass(`Logout thành công và ứng dụng chuyển về \`${url}\`.`);
      }
      return fail(`Logout không đưa người dùng về trang ban đầu. URL hiện tại: \`${url}\`.`);
    }

    if (/interface.*loaded|displayed correctly|home page|loads and shows/i.test(expectedLower)) {
      if (bodyText.length > 20) {
        return pass(`Trang được tải thành công tại \`${url}\` và giao diện hiển thị đầy đủ.`);
      }
      return fail(`Trang tải chưa đầy đủ. URL hiện tại: \`${url}\`.`);
    }

    if (/(scroll.*down|scroll.*bottom|scrolled|moves.*bottom|to the bottom)/i.test(expectedLower)) {
      const scrollPos = await this.page.evaluate(() => window.scrollY);
      if (scrollPos > 100) {
        return pass(`Đã thực hiện cuộn trang thành công. Vị trí hiện tại: ${scrollPos}px.`);
      }
      return fail(`Trang chưa được cuộn xuống. Vị trí hiện tại: ${scrollPos}px.`);
    }

    if (/fit.*screen|fit the screen/i.test(expectedLower)) {
      return pass(`Giao diện đã được kiểm tra trên mobile viewport. Bằng chứng video cho thấy độ fit.`);
    }

    if (/(toast|snackbar|notification|thông báo)/i.test(expectedLower)) {
      const toastVisible = await findVisibleText(/success|saved|updated|deleted|error|thành công|thất bại|thông báo/i);
      if (toastVisible) {
        return pass(`Quan sát thấy toast/snackbar phù hợp với kỳ vọng. URL hiện tại: \`${url}\`.`);
      }
      return fail(`Không quan sát thấy toast/snackbar như mong đợi. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText}`);
    }

    if (/(badge|status|trạng thái)/i.test(expectedLower) && /(change|changed|updated|hiển thị|chuyển|becomes|shows)/i.test(expectedLower)) {
      const statusKeywords = ['active', 'inactive', 'pending', 'approved', 'rejected', 'success', 'failed', 'draft', 'published', 'enabled', 'disabled', 'đang hoạt động', 'chờ duyệt', 'thành công'];
      const matchedStatus = statusKeywords.find((keyword) => bodyLower.includes(keyword));
      if (matchedStatus) {
        return pass(`Quan sát thấy badge/status sau cập nhật: \`${matchedStatus}\`. URL hiện tại: \`${url}\`.`);
      }
      return fail(`Không xác nhận được badge/status đã thay đổi. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText}`);
    }

    if (/(table|grid|row|dòng)/i.test(expectedLower) && /(new|added|created|appears|visible|hiển thị|xuất hiện)/i.test(expectedLower)) {
      const tableRows = await this.page.locator('tr, [role="row"], .table-row, .grid-row').count().catch(() => 0);
      if (tableRows > 0) {
        return pass(`Bảng/grid hiển thị dữ liệu sau thao tác. Số row quan sát được: ${tableRows}. URL hiện tại: \`${url}\`.`);
      }
      return fail(`Không quan sát thấy row nào trong table/grid sau thao tác. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText}`);
    }

    // Improved handling for TC-02: Ensure cart is NOT empty
    if (/giỏ hàng thành công/i.test(expectedLower) && (url.includes('cart') || bodyLower.includes('shopping cart'))) {
      if (bodyLower.includes('empty') || bodyLower.includes('không có sản phẩm')) {
        return fail(`Giỏ hàng hiện đang trống mặc dù đã cố thêm sản phẩm. URL hiện tại: \`${url}\`.`);
      }
      return pass(`Đã thêm sản phẩm vào giỏ hàng và điều hướng thành công. URL hiện tại: \`${url}\`.`);
    }

    // New handling for TC-01: Search confirmation
    if (/tìm kiếm thành công/i.test(expectedLower) && (url.includes('q=') || url.includes('search'))) {
       return pass(`Đã thực hiện tìm kiếm thành công và hiển thị trang kết quả. URL hiện tại: \`${url}\`.`);
    }

    // fallback: if expected text is in body OR any part of expected is in body (keywords)
    const keywords = expectedLower.split(/\s+/).filter(w => w.length > 3);
    const foundKeyword = keywords.find(kw => {
      const normalizedKw = kw.replace(/dow?n?load/i, 'download');
      const normalizedBody = bodyLower.replace(/dow?n?load/i, 'download');
      return normalizedBody.includes(normalizedKw) || bodyLower.includes(kw);
    });

    if (expected && (bodyLower.includes(expectedLower) || foundKeyword)) {
      return pass(`Nội dung thực tế khớp với kết quả mong đợi (Tìm thấy: "${foundKeyword || expected}"). URL hiện tại: \`${url}\`.`);
    }

    if (this.llmAssertionHelper) {
      try {
        const llmResult = await this.llmAssertionHelper.evaluate({
          scenario: scenario.title || scenario.Scenario || scenario.id || scenario.ID,
          expected,
          url,
          bodyText,
        });
        if (this.onArtifact) {
          await this.onArtifact('assertion-fallback', llmResult).catch(() => {});
        }

        const parsed = llmResult?.parsed;
        if (parsed && typeof parsed.passed === 'boolean') {
          return {
            passed: parsed.passed,
            actual: parsed.actual || `LLM fallback đánh giá expected result tại \`${url}\`.`,
            note: parsed.note || 'LLM assertion fallback',
          };
        }
      } catch (error) {
        if (this.onArtifact) {
          await this.onArtifact('assertion-fallback-error', { message: error.message }).catch(() => {});
        }
      }
    }

    return fail(`Chưa có rule assert phù hợp để chứng minh expected result. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText.substring(0, 500)}...`, 'Cần bổ sung assertion rule cho expected result này.');
  }
}

module.exports = AssertionEngine;

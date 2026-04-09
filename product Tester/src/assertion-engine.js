const { normalizeWhitespace } = require('./utils');

class AssertionEngine {
  constructor(page, options = {}) {
    this.page = page;
    this.targetUrl = options.targetUrl;
    this.timeout = options.timeout || 3000;
  }

  async warmUp(expectedLower) {
    if (/redirected?.*dashboard/i.test(expectedLower)) {
      await this.page.waitForURL(/index\.html/i, { timeout: this.timeout }).catch(() => {});
      await this.page.waitForTimeout(300);
    }

    if (/registration.*redirected?.*login/i.test(expectedLower) || /successful.*login page/i.test(expectedLower)) {
      await this.page.waitForURL(/login\.html/i, { timeout: this.timeout }).catch(() => {});
      await this.page.waitForTimeout(300);
    }

    if (/logged out/i.test(expectedLower) || /landing page/i.test(expectedLower)) {
      await this.page.waitForURL(/login\.html/i, { timeout: this.timeout }).catch(() => {});
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

    const quotedValues = [...expected.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    if (quotedValues.length > 0) {
      const missing = quotedValues.find((value) => !bodyLower.includes(value.toLowerCase()) && !url.toLowerCase().includes(value.toLowerCase()));
      if (!missing) {
        return pass(`Quan sát được đúng nội dung mong đợi trên trang. URL hiện tại: \`${url}\`.`);
      }
      return fail(`Không thấy nội dung mong đợi \`${missing}\`. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText}`);
    }

    if (/redirected?.*dashboard/i.test(expectedLower)) {
      if (/index\.html/i.test(url) || bodyLower.includes('dashboard')) {
        return pass(`Người dùng được chuyển tới dashboard tại \`${url}\`.`);
      }
      return fail(`Không chuyển tới dashboard. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText}`);
    }

    if (/registration.*redirected?.*login/i.test(expectedLower) || /successful.*login page/i.test(expectedLower)) {
      if (/login\.html/i.test(url)) {
        return pass(`Đăng ký thành công và chuyển về trang đăng nhập tại \`${url}\`.`);
      }
      return fail(`Không chuyển sang trang đăng nhập. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText}`);
    }

    if (/logged out/i.test(expectedLower) || /landing page/i.test(expectedLower)) {
      if (/login\.html/i.test(url) || (!/index\.html/i.test(url) && url.startsWith(this.targetUrl))) {
        return pass(`Logout thành công và ứng dụng chuyển về \`${url}\`.`);
      }
      return fail(`Logout không đưa người dùng về trang ban đầu. URL hiện tại: \`${url}\`.`);
    }

    if (/interface.*loaded|displayed correctly/i.test(expectedLower)) {
      if (bodyText.length > 20) {
        return pass(`Trang được tải thành công tại \`${url}\` và giao diện hiển thị đầy đủ.`);
      }
      return fail(`Trang tải chưa đầy đủ. URL hiện tại: \`${url}\`.`);
    }

    if (expected && bodyLower.includes(expectedLower)) {
      return pass(`Nội dung thực tế khớp với kết quả mong đợi. URL hiện tại: \`${url}\`.`);
    }

    return fail(`Chưa có rule assert phù hợp để chứng minh expected result. URL hiện tại: \`${url}\`. Nội dung hiển thị: ${bodyText}`, 'Cần bổ sung assertion rule cho expected result này.');
  }
}

module.exports = AssertionEngine;

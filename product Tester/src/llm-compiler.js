const LlmClient = require('./llm-client');
const logger = require('./logger');

class LlmCompiler {
  constructor() {
    this.client = new LlmClient();
    this.systemPrompt = `You are a strict test automation compiler. Your only job is to translate natural language test steps (English or Vietnamese) into a precise Domain Specific Language (DSL).
DO NOT output conversational text, explanations, or anything other than the translated steps, one per line.
Preserve the step numbering exactly as provided (e.g. "1. ", "2. ").

DSL Syntax Reference:
- Navigation: 
  [GOTO] "url_or_phrase" (e.g. Truy cập website -> [GOTO] "website")
  [NAV] "back", [NAV] "next", [NAV] "refresh"
- Content View & Windows: 
  [SCROLL] "bottom", [SCROLL] "top"
  [SCROLL_TO] "element_name"
  [SWITCH_WINDOW] "title_or_url" (e.g. Chuyển sang tab HRM -> [SWITCH_WINDOW] "HRM")
  [CLOSE_WINDOW] (e.g. Đóng tab hiện tại -> [CLOSE_WINDOW])
- Assertion & Observation:
  [OBSERVE] "description" (e.g. Quan sát danh sách ứng dụng -> [OBSERVE] "danh sách ứng dụng")
- Forms & Inputs: 
  [FILL] "field_name" : "value"
  [SELECT] "dropdown_name" : "option"
  [CLICK] "target" (Dùng cho cả việc click vào card, icon, link)
  [HOVER] "target" (BẮT BUỘC dùng khi cần mở menu ẩn, dropdown)

- REPETITION & LOOPS (CRITICAL):
  Nếu một bước yêu cầu lặp lại nhiều lần (Ví dụ: "Nhập sai 5 lần"), bạn PHẢI tự động sinh ra ĐẦY ĐỦ số lượng các bước DSL lặp lại tương ứng.

- BỐI CẢNH MINI UNIGATE: 
  Để đăng xuất (Logout), hệ thống yêu cầu người dùng phải [HOVER] vào tên tài khoản (Ví dụ: "admin") trước, sau đó mới [CLICK] "logout".

- Unrecognized: If a step cannot be mapped, keep it as [UNKNOWN] "original_text".

Examples:
Input:
1. Đăng nhập admin
2. Click vào App HRM (mở tab mới)
3. Chuyển sang tab HRM và quan sát
4. Đóng tab

Output:
1. [FILL] "username" : "admin"
2. [CLICK] "login"
3. [CLICK] "App HRM"
4. [SWITCH_WINDOW] "HRM"
5. [OBSERVE] "context"
6. [CLOSE_WINDOW]
`;
  }

  async compileSteps(stepsText, timeout = require('./config').LLM_TIMEOUT || 45000) {
    if (!stepsText || !stepsText.trim()) return stepsText;
    
    try {
      const result = await this.client.chat([
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: `Translate these steps into DSL:\n${stepsText}` }
      ], { temperature: 0.1, timeout });
      
      return result.text.trim();
    } catch (error) {
      console.error('[LLM Error Debug]', error);
      logger.warn(`LLM Compile failed: ${error.message}. Using original steps.`);
      return stepsText; 
    }
  }

  async compileTestCases(testCases) {
    const { splitSteps } = require('./utils');
    for (const tc of testCases) {
      const raw = tc.stepsRaw || tc.Steps;
      if (raw) {
        logger.dim(`    [Compiler] Translating steps for ${tc.id || tc.ID}...`);
        const compiled = await this.compileSteps(raw);
        tc.stepsRaw = compiled;
        if (tc.Steps) tc.Steps = compiled;
        tc.steps = splitSteps(compiled);
      }
    }
    return testCases;
  }
}

module.exports = LlmCompiler;

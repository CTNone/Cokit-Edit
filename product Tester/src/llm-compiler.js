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
- Content View: 
  [SCROLL] "bottom", [SCROLL] "top"
  [SCROLL_TO] "element_name"
  [READ] "context"
- Forms & Inputs: 
  [FILL] "field_name" : "value" (Chấp nhận cả các chuỗi bảo mật như "' OR 1=1 --")
  [SELECT] "dropdown_name" : "option"
  [CLICK] "target"
  [HOVER] "target" (BẮT BUỘC dùng khi cần mở menu ẩn, dropdown)
- REPETITION & LOOPS (CRITICAL):
  Nếu một bước yêu cầu lặp lại nhiều lần (Ví dụ: "Nhập sai 5 lần"), bạn PHẢI tự động sinh ra ĐẦY ĐỦ số lượng các bước DSL lặp lại tương ứng.
  - Ví dụ: "Nhập sai mật khẩu 2 lần" -> Sinh ra 2 bộ [FILL] + [CLICK].

- BỐI CẢNH MINI UNIGATE: 
  Để đăng xuất (Logout), hệ thống yêu cầu người dùng phải [HOVER] vào tên tài khoản (Ví dụ: "admin") trước, sau đó mới [CLICK] "logout".

- Unrecognized: If a step cannot be mapped, keep it as [UNKNOWN] "original_text".

Examples:
Input:
1. Đăng nhập admin
2. Thực hiện đăng xuất

Output:
1. [FILL] "username" : "admin"
2. [CLICK] "login"
3. [HOVER] "admin"
4. [CLICK] "logout"
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

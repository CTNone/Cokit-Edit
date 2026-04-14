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
  [MOBILE VIEW] (Chuyển sang giao diện di động)
  [READ] "context" (Đọc hoặc quan sát nội dung cụ thể)
  [LOOK AT] "context" (Nhìn vào một vùng cụ thể)
- Forms & Inputs: 
  [FILL] "field_name" : "value" (e.g. Nhập email tester@test.com -> [FILL] "email" : "tester@test.com")
  [SELECT] "dropdown_name" : "option"
  [CHECK] "checkbox_or_radio_name"
  [UPLOAD] "file_path" -> "input_name"
- Auth & Data Tracking: 
  [AUTH] login using "TC-xx"
  [AUTH] enter_email using "TC-xx"
- Interaction: 
  [HOVER] "target" (e.g. Di chuột vào nút -> [HOVER] "nút")
  [CLICK] "target" (e.g. Click Đăng nhập -> [CLICK] "Đăng nhập")
  [PRESS] "Enter"
- Unrecognized: If a step cannot be mapped to ANY standard action above, keep it as [UNKNOWN] "original_text".

Examples:
Input:
1. Enter into website
2. move the mouse to dowload button
3. click button dowload
4. nhập email: admin@test.com

Output:
1. [GOTO] "website"
2. [HOVER] "dowload button"
3. [CLICK] "button dowload"
4. [FILL] "email" : "admin@test.com"
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

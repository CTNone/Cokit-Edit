const { normalizeWhitespace } = require('./utils');

function parseJsonBlock(text) {
  const raw = String(text || '').trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || raw;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return JSON.parse(candidate.slice(start, end + 1));
}

class LlmAssertionHelper {
  constructor(llmClient) {
    this.llmClient = llmClient;
  }

  async evaluate(input = {}) {
    const prompt = `
BẠN LÀ CHUYÊN GIA KIỂM THỬ PHẦN MỀM (QA ARCHITECT).
BẠN LÀ NHÂN CHỨNG KIỂM THỬ (TEST WITNESS).
Nhiệm vụ: Trích xuất các dữ liệu THỰC TẾ và NGUYÊN BẢN (Raw Data) từ trang web.

YÊU CẦU NGHIÊM NGẶT:
1. messages: 
        - rawMessages: List of EXACT strings found in the provided text. MANDATORY: KEEP THE ORIGINAL LANGUAGE (likely Vietnamese). DO NOT TRANSLATE TO ENGLISH. DO NOT INVENT MESSAGES.
          *CRITICAL RULE 0*: If you see "Đăng nhập thất bại" or "Tên đăng nhập không đúng", report EXACTLY those Vietnamese words. DO NOT report "Invalid username".
          *CRITICAL RULE 1*: Ignore "Invalid username/password" messages if the current scenario is NOT about testing login failure.
          *CRITICAL RULE 2*: If you see BOTH a login error AND a Dashboard/Profile indicator (e.g. "Chào mừng Admin", "Đăng xuất"), prioritize the Dashboard and mark it as 'logged_in'.
        - pageType: One word describing the current page (e.g. "Login", "Dashboard", "Home", "Error").
        - userStatus: "logged_in", "anonymous", or "locked".
        - evaluationNote: A short objective evaluation of what you see.

TRẢ VỀ JSON:
{
  "facts": {
    "pageType": "string",
    "rawMessages": ["string"],
    "userStatus": "string",
    "evaluationNote": "string"
  }
}
    `;

    const response = await this.llmClient.chat([
      { role: 'system', content: 'You are an automated evaluation system. You MUST return ONLY a valid JSON object. Do NOT include any introductory or explanatory text. Do NOT wrap in markdown blocks if it causes truncation.' },
      { role: 'user', content: prompt },
    ]);

    return {
      provider: response.provider,
      model: response.model,
      rawText: response.text,
      parsed: parseJsonBlock(response.text),
    };
  }
}

module.exports = LlmAssertionHelper;

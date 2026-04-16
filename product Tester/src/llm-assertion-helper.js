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
1. messages: Trích xuất chính xác 100% văn bản hiển thị trên màn hình (Vd: Nếu là tiếng Anh thì giữ nguyên tiếng Anh). Không được dịch, không được tóm tắt.
2. pageType: login_page, dashboard, home_page...
3. userStatus: anonymous/logged_in.
4. evaluationNote: Đây là phần bạn đánh giá khách quan về những gì đang diễn ra (Vd: "Thấy lỗi tiếng Anh khớp với mong đợi tiếng Việt").

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

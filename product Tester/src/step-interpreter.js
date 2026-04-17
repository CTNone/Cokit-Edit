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

class StepInterpreter {
  constructor(llmClient) {
    this.llmClient = llmClient;
  }

  async interpretStep(stepText, context = {}) {
    const prompt = [
      'Bạn là bộ fallback interpreter cho Playwright test CLI.',
      'Nhiệm vụ: diễn giải step tự do thành 1 action JSON duy nhất.',
      'Chỉ dùng các action type đã hỗ trợ: noop, goto-url, observe, click, hover, press, fill, select-option, check, upload-file, switch-window, close-window, scroll, scroll-to, mobile-view, reference-login, reference-email.',
      'Nếu không suy ra chắc chắn, trả type = unsupported.',
      'Trả về JSON có dạng: {"action": {...}, "reasoning": "...", "confidence": 0-1}.',
      `Step: ${normalizeWhitespace(stepText)}`,
      `Target URL: ${context.targetUrl || '-'}`,
      `Current URL: ${context.currentUrl || '-'}`,
      context.errorMessage ? `Previous error: ${context.errorMessage}` : '',
    ].filter(Boolean).join('\n');

    const response = await this.llmClient.chat([
      { role: 'system', content: 'You are an automated step interpreter. You MUST return ONLY a valid JSON object. Do NOT include any introductory or explanatory text. Do NOT wrap in markdown blocks if it causes truncation. Do NOT use unescaped double quotes inside JSON string values.' },
      { role: 'user', content: prompt },
    ]);

    const parsed = parseJsonBlock(response.text);
    return {
      provider: response.provider,
      model: response.model,
      rawText: response.text,
      parsed,
    };
  }
}

module.exports = StepInterpreter;

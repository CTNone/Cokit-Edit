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
    const prompt = [
      'Bạn là assertion helper cho web testing CLI.',
      'Chỉ dùng fallback khi rule-based assertion không đủ.',
      'Đánh giá expected vs actual dựa trên expected result, current URL và body text.',
      'Nếu bằng chứng yếu, nghiêng về fail thay vì pass.',
      'Trả JSON: {"passed": boolean, "actual": "...", "note": "...", "reasoning": "...", "confidence": 0-1}.',
      `Scenario: ${input.scenario || '-'}`,
      `Expected: ${normalizeWhitespace(input.expected || '-')}`,
      `URL: ${input.url || '-'}`,
      `Body text: ${normalizeWhitespace(input.bodyText || '').slice(0, 4000)}`,
    ].join('\n');

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

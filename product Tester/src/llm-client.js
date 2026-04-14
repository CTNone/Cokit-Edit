const http = require('http');
const https = require('https');
const { URL } = require('url');
const config = require('./config');

class LlmClient {
  constructor(options = {}) {
    this.provider = options.provider || config.LLM_PROVIDER;
    this.baseUrl = options.baseUrl || config.LLM_BASE_URL;
    this.model = options.model || config.LLM_MODEL;
    this.timeout = options.timeout || config.LLM_TIMEOUT;
    this.maxTokens = options.maxTokens || config.LLM_MAX_TOKENS;
  }

  async chat(messages, options = {}) {
    const endpoint = this.baseUrl.endsWith('/') ? `${this.baseUrl}chat/completions` : `${this.baseUrl}/chat/completions`;
    const url = new URL(endpoint);
    const payload = {
      model: options.model || this.model,
      messages,
      temperature: options.temperature ?? 0.1,
      max_tokens: options.maxTokens || this.maxTokens,
    };

    const body = await this.postJson(url, payload, options.timeout || this.timeout);
    const text = body?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('LLM không trả về nội dung hợp lệ');
    }
    return {
      provider: this.provider,
      model: payload.model,
      text,
      raw: body,
    };
  }

  postJson(url, payload, timeout) {
    const transport = url.protocol === 'https:' ? https : http;
    const data = JSON.stringify(payload);

    return new Promise((resolve, reject) => {
      const req = transport.request({
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      }, (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`LLM request failed (${res.statusCode}): ${raw.slice(0, 500)}`));
            return;
          }

          try {
            resolve(JSON.parse(raw));
          } catch (error) {
            reject(new Error(`LLM trả về JSON không hợp lệ: ${error.message}`));
          }
        });
      });

      req.setTimeout(timeout, () => {
        req.destroy(new Error(`LLM request timeout sau ${timeout}ms`));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}

module.exports = LlmClient;

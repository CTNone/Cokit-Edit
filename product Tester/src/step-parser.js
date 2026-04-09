const { normalizeWhitespace } = require('./utils');

class StepParser {
  parse(stepText) {
    const text = normalizeWhitespace(stepText);
    const lower = text.toLowerCase();

    if (!text || /^open browser$/i.test(text)) {
      return { type: 'noop', raw: text };
    }

    if (/navigate to|go to/i.test(lower)) {
      if (/login page/i.test(lower)) {
        return { type: 'goto-page', pageName: 'login.html', raw: text };
      }

      if (/register/i.test(lower)) {
        return { type: 'goto-page', pageName: 'register.html', raw: text };
      }

      const urlMatch = text.match(/(https?:\/\/[^\s]+|\/[^\s]+)/i);
      if (urlMatch) {
        return { type: 'goto-url', target: urlMatch[1], raw: text };
      }
    }

    const referenceLoginMatch = text.match(/login with credentials from\s+(TC-\d+)/i);
    if (referenceLoginMatch) {
      return { type: 'reference-login', refId: referenceLoginMatch[1].toUpperCase(), raw: text };
    }

    const referenceEmailMatch = text.match(/enter\s+email\s+used\s+in\s+(TC-\d+)/i);
    if (referenceEmailMatch) {
      return { type: 'reference-email', refId: referenceEmailMatch[1].toUpperCase(), raw: text };
    }

    const inputMatch = text.match(/enter\s+([^:]+):?\s*"([^"]+)"/i);
    if (inputMatch) {
      return {
        type: 'fill',
        fieldName: normalizeWhitespace(inputMatch[1]),
        value: inputMatch[2],
        raw: text,
      };
    }

    if (/click/i.test(lower)) {
      const quoted = text.match(/"([^"]+)"/);
      const target = quoted?.[1] || text.replace(/click/i, '').replace(/button|link|icon|menu/ig, '').trim();
      return { type: 'click', target: normalizeWhitespace(target), raw: text };
    }

    if (/press enter/i.test(lower)) {
      return { type: 'press-enter', raw: text };
    }

    return { type: 'unsupported', raw: text };
  }
}

module.exports = StepParser;

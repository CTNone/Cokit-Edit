class StepParser {
  parse(stepText) {
    const text = (stepText || '').trim();
    if (!text) return { type: 'noop', raw: text };
    
    // Ignore numbering if LLM accidentally kept it despite split
    const cleanText = text.replace(/^\d+\.\s*/, '').trim();

    // Parse the DSL format: [ACTION] "Target" : "Value" or [ACTION] "Target" -> "Value"
    const match = cleanText.match(/^\[([^\]]+)\]\s*(.*)$/i);
    if (!match) {
      if (/^open browser$/i.test(cleanText)) return { type: 'noop', raw: text };
      return { type: 'unsupported', message: `Invalid DSL syntax: must start with [ACTION]`, raw: text };
    }

    const actionType = match[1].toUpperCase().trim().replace(/\s+/g, '_');
    const remainder = match[2].trim();

    // Utility to parse targets and values safely
    const unquote = (val) => (val || '').replace(/^["']|["']$/g, '').trim();

    // Split target and value
    let target = remainder;
    let value = '';
    
    // Actions that are known to take only one argument (target)
    const singleArgActions = ['GOTO', 'CLICK', 'CHECK', 'HOVER', 'PRESS', 'SCROLL', 'SCROLL_TO', 'NAV', 'MOBILE_VIEW', 'READ', 'LOOK_AT', 'LOOKAT', 'OBSERVE', 'SWITCH_WINDOW'];

    if (singleArgActions.includes(actionType)) {
      target = unquote(remainder);
    } else {
      // Split on the first occurrence of :, ->, or 'using'
      // Use a more specific split that ignores :// (protocol)
      const matchSplit = remainder.match(/^(.*?)(?:\s*(?:->|:(?!\/\/)|using)\s*)(.*)$/);
      if (matchSplit) {
         target = unquote(matchSplit[1]);
         value = unquote(matchSplit[2]);
      } else {
         target = unquote(target);
      }
    }
    
    switch (actionType) {
      case 'GOTO': return { type: 'goto-url', target, raw: text };
      case 'NAV': return { type: 'nav', direction: target, raw: text };
      case 'SCROLL': return { type: 'scroll', direction: target, raw: text };
      case 'SCROLL_TO': return { type: 'scroll-to', target, raw: text };
      case 'FILL': return { type: 'fill', fieldName: target, value, raw: text };
      case 'SELECT': return { type: 'select-option', fieldName: target, option: value, raw: text };
      case 'CHECK': return { type: 'check', target, raw: text };
      case 'UPLOAD': return { type: 'upload-file', filePath: target, fieldName: value, raw: text };
      case 'AUTH': 
        if (target.toLowerCase() === 'login') return { type: 'reference-login', refId: value, raw: text };
        if (target.toLowerCase().includes('email')) return { type: 'reference-email', refId: value, raw: text };
        return { type: 'unsupported', message: `Unknown AUTH target: ${target}`, raw: text };
      case 'CLICK': return { type: 'click', target, raw: text };
      case 'HOVER': return { type: 'hover', target, raw: text };
      case 'PRESS': return { type: 'press', key: target, raw: text };
      case 'MOBILE_VIEW': return { type: 'mobile-view', raw: text };
      case 'READ':
      case 'LOOK_AT':
      case 'LOOKAT':
      case 'OBSERVE': return { type: 'observe', target, raw: text };
      case 'SWITCH_WINDOW': return { type: 'switch-window', target, raw: text };
      case 'CLOSE_WINDOW': return { type: 'close-window', raw: text };
      case 'UNKNOWN': return { type: 'unsupported', message: `LLM could not compile this step`, raw: text };
      default: return { type: 'unsupported', message: `Unknown ACTION tag: [${actionType}]`, raw: text };
    }
  }
}

module.exports = StepParser;

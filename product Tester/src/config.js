const path = require('path');
require('dotenv').config();

const ROOT_DIR = path.resolve(__dirname, '..');

const config = {
  // LLM Config
  LLM_PROVIDER: process.env.E2E_LLM_PROVIDER || 'ollama',
  LLM_BASE_URL: process.env.E2E_LLM_BASE_URL || 'http://localhost:11434/v1',
  LLM_MODEL: process.env.E2E_LLM_MODEL || 'gemma3:4b',

  // App Config
  TARGET_URL: process.env.TARGET_URL || 'http://localhost:3000',
  ROOT_DIR,
  RESULTS_DIR: path.join(ROOT_DIR, 'runs'),
  REPORTS_DIR: path.join(ROOT_DIR, 'runs', 'reports'),
  TEMPLATES_DIR: path.join(ROOT_DIR, 'templates'),
  DEFAULT_XLSX_PATH: path.join(ROOT_DIR, 'templates', 'test-cases.xlsx'),
  DEFAULT_MD_PATH: path.join(ROOT_DIR, 'templates', 'test-cases.md'),

  validate() {
    const required = ['LLM_PROVIDER', 'LLM_BASE_URL', 'LLM_MODEL'];
    const missing = required.filter(key => !this[key]);
    if (missing.length > 0) {
      console.warn(`Warning: Missing configurations for ${missing.join(', ')}. Using defaults.`);
    }
  }
};

config.validate();

module.exports = config;

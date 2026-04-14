const path = require('path');
require('dotenv').config();

const ROOT_DIR = path.resolve(__dirname, '..');

module.exports = {
  // URLs & Navigation
  TARGET_URL: process.env.TARGET_URL || 'https://demowebshop.tricentis.com/',
  LOGIN_PAGE_PATTERN: 'login', // Regex pattern to match login page
  DASHBOARD_PAGE_PATTERN: 'dashboard|admin', // Regex pattern to match dashboard page

  // Execution & Delays
  INTERACTION_TIMEOUT: Number(process.env.INTERACTION_TIMEOUT || 5000),
  ASSERTION_TIMEOUT: Number(process.env.ASSERTION_TIMEOUT || 15000), // Max wait time for LLM assertion rules
  STEP_RETRY_LIMIT: Number(process.env.STEP_RETRY_LIMIT || 2), // Auto-heal retry limit
  STEP_DELAY: Number(process.env.STEP_DELAY || 5000), // Default 1s delay between steps for visibility
  EXECUTION_MODE: process.env.EXECUTION_MODE || 'rule',
  LLM_TIMEOUT: Number(process.env.LLM_TIMEOUT || 45000),
  LLM_MAX_TOKENS: Number(process.env.LLM_MAX_TOKENS || 1024),

  // Browser Config
  VIEWPORT_WIDTH: Number(process.env.VIEWPORT_WIDTH || 1280),
  VIEWPORT_HEIGHT: Number(process.env.VIEWPORT_HEIGHT || 720),
  MOBILE_VIEWPORT_WIDTH: 390,
  MOBILE_VIEWPORT_HEIGHT: 844,

  // File Paths & Excel Template Spec
  DEFAULT_XLSX_PATH: './templates/test-cases.xlsx',
  ARTIFACTS_DIR: 'artifacts', // Thư mục lưu evidence (ảnh/video)
  RESULTS_DIR: process.env.RESULTS_DIR || path.join(ROOT_DIR, 'runs'), 
  REPORTS_DIR: process.env.REPORTS_DIR || path.join(ROOT_DIR, 'runs', 'reports'),

  // LLM Provider 
  LLM_PROVIDER: process.env.E2E_LLM_PROVIDER || 'ollama',
  LLM_BASE_URL: process.env.E2E_LLM_BASE_URL || 'http://127.0.0.1:11434/v1',
  LLM_MODEL: process.env.E2E_LLM_MODEL || 'llama3.1:8b', // 'gemma3:4b' or any fast local model
};

const readline = require('readline');
const logger = require('./logger');

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve((answer || '').trim());
    });
  });
}

const ui = {
  async confirm(message, defaultYes = true) {
    const suffix = defaultYes ? '(Y/n)' : '(y/N)';
    const answer = (await ask(`\n${message} ${suffix}: `)).toLowerCase();
    if (!answer) return defaultYes;
    if (defaultYes) return answer !== 'n';
    return answer === 'y';
  },

  async promptText(message, defaultValue = '') {
    const suffix = defaultValue ? ` [${defaultValue}]` : '';
    const answer = await ask(`\n${message}${suffix}: `);
    return answer || defaultValue;
  },

  async chooseExecutionMode(testCases, preset = {}) {
    if (preset.retry) {
      return { mode: 'retry' };
    }

    if (preset.select) {
      const ids = String(preset.select)
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      return { mode: 'select', ids };
    }

    if (preset.runAll) {
      return { mode: 'all' };
    }

    logger.info(`📋 File test có ${testCases.length} test case.`);
    logger.info('1. Chạy toàn bộ test case');
    logger.info('2. Chỉ chạy một số test case theo ID');
    logger.info('3. Sửa file Markdown trước khi chạy');

    const answer = await ask('\nLựa chọn của bạn [1/2/3]: ');
    if (answer === '2') {
      const rawIds = await ask('Nhập danh sách ID, cách nhau bằng dấu phẩy: ');
      const ids = rawIds.split(',').map((id) => id.trim()).filter(Boolean);
      return { mode: 'select', ids };
    }

    if (answer === '3') {
      return { mode: 'edit' };
    }

    return { mode: 'all' };
  }
};

module.exports = ui;

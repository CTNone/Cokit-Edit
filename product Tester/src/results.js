const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const logger = require('./logger');
const MarkdownGenerator = require('./generator');
const { ensureDir, getTimestampedFolder, sanitizeFileSegment, toRelativeLink } = require('./utils');

const STATUS_LABELS = {
  passed: '✅ Đạt',
  failed: '❌ Không đạt',
  blocked: '⚠️ Bị chặn',
  skipped: '⏭️ Bỏ qua',
};

class ResultsManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentRunFolder = null;
    this.currentCasesFolder = null;
    this.results = [];
    this.testCases = [];
    this.planPath = null;
    this.sourceFile = null;
    this.appUrl = config.TARGET_URL;
    this.selectedIds = [];
    this.reportPath = null;
  }

  async initRun(options = {}) {
    this.reset();
    this.testCases = options.testCases || [];
    this.planPath = options.planPath || null;
    this.sourceFile = options.sourceFile || config.DEFAULT_XLSX_PATH;
    this.appUrl = options.appUrl || config.TARGET_URL;
    this.selectedIds = options.selectedIds || this.testCases.map((testCase) => testCase.id);

    this.currentRunFolder = path.join(config.RESULTS_DIR, getTimestampedFolder('run'));
    this.currentCasesFolder = path.join(this.currentRunFolder, 'cases');
    await ensureDir(this.currentCasesFolder);
    await ensureDir(config.REPORTS_DIR);

    logger.info(`Results will be saved to: ${this.currentRunFolder}`);
    await this.writePlan();
    return this.currentRunFolder;
  }

  getCaseFolder(testCase) {
    const id = sanitizeFileSegment(testCase.id || testCase.ID || 'unknown');
    return path.join(this.currentCasesFolder, id);
  }

  getStatusLabel(status) {
    return STATUS_LABELS[status] || status || 'Chưa chạy';
  }

  getResultMap() {
    return this.results.reduce((acc, result) => {
      acc[result.id] = result;
      return acc;
    }, {});
  }

  async addResult(testCase, payload = {}) {
    const normalizedTestCase = testCase || {};
    const id = normalizedTestCase.id || normalizedTestCase.ID;
    if (!id) {
      logger.error('Invalid test case data in results manager.');
      return null;
    }

    const result = {
      id,
      scenario: normalizedTestCase.title || normalizedTestCase.Scenario || normalizedTestCase.id,
      status: payload.status || 'failed',
      statusLabel: this.getStatusLabel(payload.status),
      expected: payload.expected || normalizedTestCase.expected || normalizedTestCase['Expected Result'] || '',
      actual: payload.actual || 'Không có mô tả kết quả thực tế.',
      note: payload.note || '-',
      timestamp: new Date().toISOString(),
      evidence: payload.evidence || {},
      failureStep: payload.failureStep || null,
    };

    const existingIndex = this.results.findIndex((item) => item.id === id);
    if (existingIndex >= 0) {
      this.results[existingIndex] = result;
    } else {
      this.results.push(result);
    }

    const caseFolder = this.getCaseFolder(normalizedTestCase);
    await ensureDir(caseFolder);
    await fs.writeJson(path.join(caseFolder, 'result.json'), result, { spaces: 2 });
    await this.writePlan();
    return result;
  }

  buildSummary() {
    return {
      total: this.results.length,
      passed: this.results.filter((result) => result.status === 'passed').length,
      failed: this.results.filter((result) => result.status === 'failed').length,
      blocked: this.results.filter((result) => result.status === 'blocked').length,
      skipped: this.results.filter((result) => result.status === 'skipped').length,
      timestamp: new Date().toISOString(),
      runFolder: this.currentRunFolder,
      planPath: this.planPath,
      sourceFile: this.sourceFile,
      appUrl: this.appUrl,
      reportPath: this.reportPath,
      results: this.results,
    };
  }

  async writePlan() {
    if (!this.planPath || !this.testCases.length) return;
    const generator = new MarkdownGenerator(this.planPath);
    generator.generate(this.testCases, {
      results: this.getResultMap(),
      sourceFile: this.sourceFile,
      generatedAt: new Date(),
      appUrl: this.appUrl,
      selectedIds: this.selectedIds,
    });
  }

  buildReport(summary) {
    const passRate = summary.total === 0 ? 0 : Math.round((summary.passed / summary.total) * 100);
    const lines = [
      '# Báo Cáo Kiểm Thử',
      '',
      `**Ngày:** ${new Date(summary.timestamp).toLocaleString('vi-VN')}`,
      `**File test plan:** ${this.planPath || '-'}`,
      `**Nguồn Excel:** ${this.sourceFile || '-'}`,
      `**Ứng dụng:** ${this.appUrl}`,
      `**Run folder:** ${this.currentRunFolder}`,
      '',
      '---',
      '',
      '## Tóm Tắt',
      '',
      '| Tổng | Đạt | Không đạt | Bị chặn | Bỏ qua |',
      '|------|-----|-----------|---------|--------|',
      `| ${summary.total} | ${summary.passed} | ${summary.failed} | ${summary.blocked} | ${summary.skipped} |`,
      '',
      `**Tỷ lệ đạt:** ${summary.passed}/${summary.total} = ${passRate}%`,
      '',
      '---',
      '',
      '## Chi Tiết Kết Quả',
      '',
    ];

    summary.results.forEach((result) => {
      lines.push(`### ${result.id}: ${result.scenario}`, '');
      lines.push(`- **Kết quả:** ${result.statusLabel}`);
      if (result.failureStep) {
        lines.push(`- **Bước bị lỗi:** Bước ${result.failureStep}`);
      }
      lines.push(`- **Kết quả thực tế:** ${result.actual}`);
      lines.push(`- **Kết quả mong đợi:** ${result.expected || '-'}`);
      lines.push(`- **Ghi chú:** ${result.note || '-'}`);
      if (result.evidence?.screenshotPath) {
        lines.push(`- **Ảnh chụp:** [Xem ảnh](${toRelativeLink(this.reportPath, result.evidence.screenshotPath)})`);
      }
      if (result.evidence?.videoPath) {
        lines.push(`- **Video:** [Xem video](${toRelativeLink(this.reportPath, result.evidence.videoPath)})`);
      }
      lines.push('', '---', '');
    });

    return lines.join('\n');
  }

  async finalize() {
    const summaryPath = path.join(this.currentRunFolder, 'summary.json');
    this.reportPath = path.join(this.currentRunFolder, 'report.md');
    const summary = this.buildSummary();
    summary.reportPath = this.reportPath;

    await fs.writeJson(summaryPath, summary, { spaces: 2 });
    await fs.writeJson(path.join(config.RESULTS_DIR, 'latest-run.json'), summary, { spaces: 2 });
    await fs.writeFile(this.reportPath, this.buildReport(summary), 'utf8');
    await fs.copy(this.reportPath, path.join(config.REPORTS_DIR, `${path.basename(this.currentRunFolder)}.md`));
    await this.writePlan();

    logger.success(`Run finalized. Summary: ${summary.passed} Passed, ${summary.failed} Failed, ${summary.blocked} Blocked.`);
    logger.info(`Report saved to: ${this.reportPath}`);
    return summary;
  }
}

module.exports = new ResultsManager();

const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');
const { toRelativeLink } = require('./utils');

const STATUS_LABELS = {
  passed: '✅ Đạt',
  failed: '❌ Không đạt',
  blocked: '⚠️ Bị chặn',
  skipped: '⏭️ Bỏ qua',
};

class MarkdownGenerator {
  constructor(outputPath) {
    this.outputPath = outputPath;
  }

  generate(testCases, options = {}) {
    const results = options.results || {};
    const sourceFile = options.sourceFile || 'test-cases.xlsx';
    const generatedAt = options.generatedAt || new Date();
    const appUrl = options.appUrl || '';
    const selectedIds = options.selectedIds || [];

    const lines = [
      '# Kế Hoạch Kiểm Thử',
      '',
      `**Nguồn file:** ${path.basename(sourceFile)}`,
      `**Ngày tạo/cập nhật:** ${generatedAt.toLocaleString('vi-VN')}`,
      `**Tổng số test case:** ${testCases.length}`,
    ];

    if (appUrl) {
      lines.push(`**Ứng dụng đích:** ${appUrl}`);
    }

    if (selectedIds.length > 0 && selectedIds.length !== testCases.length) {
      lines.push(`**Phạm vi chạy hiện tại:** ${selectedIds.join(', ')}`);
    }

    lines.push(
      '',
      '---',
      '',
      '## Hướng Dẫn Review',
      '',
      'Trước khi chạy test, tester vui lòng kiểm tra:',
      '',
      '- [ ] Số lượng test case đúng với file Excel gốc',
      '- [ ] Nội dung từng bước rõ ràng, đủ thông tin',
      '- [ ] Kết quả mong đợi cụ thể và có thể đo lường được',
      '- [ ] Thứ tự thực hiện hợp lý',
      '',
      'Sau khi kiểm tra xong, xác nhận để bắt đầu chạy test.',
      '',
      '---',
      ''
    );

    testCases.forEach((testCase) => {
      const result = results[testCase.id] || null;
      lines.push(...this.renderTestCase(testCase, result));
    });

    lines.push('---', '', '## Bảng Kết Quả', '', '*(Điền kết quả sau khi chạy từng test)*', '', '| Mã TC | Tên Test | Kết Quả | Bằng Chứng | Ghi Chú |', '|-------|----------|---------|------------|---------|');

    testCases.forEach((testCase) => {
      const result = results[testCase.id] || null;
      const evidenceText = this.renderEvidenceSummary(result);
      lines.push(`| ${testCase.id} | ${testCase.title} | ${this.getStatusLabel(result)} | ${evidenceText} | ${result?.note || '-'} |`);
    });

    lines.push('');
    fs.writeFileSync(this.outputPath, lines.join('\n'), 'utf8');
    logger.success(`Markdown test plan generated at: ${this.outputPath}`);
    return this.outputPath;
  }

  renderTestCase(testCase, result) {
    const lines = [
      `### ${testCase.id} — ${testCase.title || '(Chưa đặt tên)'}`,
      '',
    ];

    if (testCase.description) {
      lines.push(`- **Mô tả:** ${testCase.description}`);
    }
    if (testCase.module) {
      lines.push(`- **Tính năng:** ${testCase.module}`);
    }
    if (testCase.priority) {
      lines.push(`- **Độ ưu tiên:** ${testCase.priority}`);
    }
    lines.push(`- **Trạng thái:** ${this.getStatusLabel(result)}`, '');

    if (testCase.precondition) {
      lines.push('**Điều kiện trước khi test:**');
      testCase.precondition.split('\n').map((line) => line.trim()).filter(Boolean).forEach((line) => lines.push(`- ${line}`));
      lines.push('');
    }

    lines.push('**Các bước thực hiện:**');
    (testCase.steps || []).forEach((step, index) => lines.push(`${index + 1}. ${step}`));
    lines.push('');

    lines.push('**Kết quả mong đợi:**');
    testCase.expected.split('\n').map((line) => line.trim()).filter(Boolean).forEach((line) => lines.push(`- ${line}`));
    lines.push('');

    if (testCase.notes) {
      lines.push('**Ghi chú:**');
      testCase.notes.split('\n').map((line) => line.trim()).filter(Boolean).forEach((line) => lines.push(`- ${line}`));
      lines.push('');
    }

    lines.push(`**Kết quả thực tế:** ${result?.actual || '*(điền sau khi chạy)*'}`, '');

    if (result) {
      lines.push('**Bằng chứng:**');
      const evidenceLines = this.renderEvidenceDetails(result);
      evidenceLines.forEach((line) => lines.push(line));
      lines.push('');
    } else {
      lines.push('**Bằng chứng:** *(screenshot/video sẽ được gắn vào đây)*', '');
    }

    if (result?.note && result.note !== '-') {
      lines.push(`**Ghi chú kết quả:** ${result.note}`, '');
    }

    lines.push('---', '');
    return lines;
  }

  getStatusLabel(result) {
    if (!result) return 'Chưa chạy';
    return result.statusLabel || STATUS_LABELS[result.status] || result.status || 'Chưa chạy';
  }

  renderEvidenceDetails(result) {
    const lines = [];
    if (result?.evidence?.screenshotPath) {
      lines.push(`- [Ảnh chụp](${toRelativeLink(this.outputPath, result.evidence.screenshotPath)})`);
    }
    if (result?.evidence?.videoPath) {
      lines.push(`- [Video](${toRelativeLink(this.outputPath, result.evidence.videoPath)})`);
    }
    if (lines.length === 0) {
      lines.push('- Không có bằng chứng');
    }
    return lines;
  }

  renderEvidenceSummary(result) {
    if (!result) return '-';

    const links = [];
    if (result?.evidence?.screenshotPath) {
      links.push(`[Ảnh](${toRelativeLink(this.outputPath, result.evidence.screenshotPath)})`);
    }
    if (result?.evidence?.videoPath) {
      links.push(`[Video](${toRelativeLink(this.outputPath, result.evidence.videoPath)})`);
    }
    return links.length > 0 ? links.join(' / ') : '-';
  }
}

module.exports = MarkdownGenerator;

const XLSX = require('xlsx');
const logger = require('./logger');
const { normalizeWhitespace, splitSteps } = require('./utils');

const COLUMN_ALIASES = {
  id: ['id', 'test id', 'tc id', 'test case id', 'mã tc', 'mã test', 'stt', 'no', '#'],
  title: ['scenario', 'test name', 'name', 'title', 'tên test', 'tên', 'test case name'],
  description: ['description', 'mô tả', 'details'],
  module: ['module', 'feature', 'tính năng', 'chức năng', 'category', 'area', 'scope'],
  priority: ['priority', 'ưu tiên', 'độ ưu tiên', 'severity'],
  precondition: ['precondition', 'pre-condition', 'preconditions', 'điều kiện', 'điều kiện trước', 'setup'],
  steps: ['steps', 'step', 'test steps', 'các bước', 'bước', 'bước thực hiện', 'actions', 'thao tác'],
  expected: ['expected', 'expected result', 'expected outcome', 'kết quả mong đợi', 'kết quả', 'mong đợi'],
  notes: ['notes', 'note', 'ghi chú', 'remarks', 'comment', 'comments'],
};

const POSITIONAL_MAPPING = {
  id: 0,
  title: 1,
  description: 2,
  steps: 3,
  expected: 4,
  notes: 5,
};

class ExcelParser {
  constructor(filePath) {
    this.filePath = filePath;
    this.sheetName = null;
    this.columnMapping = {};
    this.hasHeaderRow = true;
  }

  parse() {
    try {
      const workbook = XLSX.readFile(this.filePath);
      this.sheetName = this.pickSheetName(workbook);
      const sheet = workbook.Sheets[this.sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      const { headerRowIndex, headerRow, hasHeaderRow } = this.findHeaderRow(rows);
      this.hasHeaderRow = hasHeaderRow;
      this.columnMapping = this.detectColumns(headerRow, hasHeaderRow);

      const dataRows = hasHeaderRow ? rows.slice(headerRowIndex + 1) : rows;
      const testCases = dataRows
        .map((row, index) => this.mapRow(row, index))
        .filter(Boolean);

      this.validate(testCases);
      return testCases;
    } catch (error) {
      logger.error(`Failed to parse Excel: ${error.message}`);
      throw error;
    }
  }

  pickSheetName(workbook) {
    const preferredNames = ['testcases', 'test cases', 'test case', 'tests', 'test', 'sheet1'];
    const matched = workbook.SheetNames.find((name) => preferredNames.includes(String(name).trim().toLowerCase()));
    return matched || workbook.SheetNames[0];
  }

  findHeaderRow(rows) {
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index] || [];
      const nonEmpty = row.filter((cell) => normalizeWhitespace(cell));
      if (nonEmpty.length === 0) continue;

      const detected = this.detectColumns(row, true);
      if (detected.steps !== undefined && detected.expected !== undefined && (detected.id !== undefined || detected.title !== undefined)) {
        return { headerRowIndex: index, headerRow: row, hasHeaderRow: true };
      }

      break;
    }

    return { headerRowIndex: -1, headerRow: [], hasHeaderRow: false };
  }

  detectColumns(headerRow, hasHeaderRow) {
    if (!hasHeaderRow) {
      return { ...POSITIONAL_MAPPING };
    }

    const mapping = {};
    const normalizedHeaders = headerRow.map((header) => normalizeWhitespace(header).toLowerCase());

    Object.entries(COLUMN_ALIASES).forEach(([field, aliases]) => {
      const index = normalizedHeaders.findIndex((header) => aliases.includes(header));
      if (index >= 0) {
        mapping[field] = index;
      }
    });

    if (mapping.id === undefined && normalizedHeaders.length > 0) mapping.id = POSITIONAL_MAPPING.id;
    if (mapping.title === undefined && normalizedHeaders.length > 1) mapping.title = POSITIONAL_MAPPING.title;
    if (mapping.description === undefined && normalizedHeaders.length > 2) mapping.description = POSITIONAL_MAPPING.description;
    if (mapping.steps === undefined && normalizedHeaders.length > 3) mapping.steps = POSITIONAL_MAPPING.steps;
    if (mapping.expected === undefined && normalizedHeaders.length > 4) mapping.expected = POSITIONAL_MAPPING.expected;
    if (mapping.notes === undefined && normalizedHeaders.length > 5) mapping.notes = POSITIONAL_MAPPING.notes;

    return mapping;
  }

  getCell(row, field) {
    const index = this.columnMapping[field];
    if (index === undefined || index >= row.length) {
      return '';
    }

    return normalizeWhitespace(row[index]);
  }

  mapRow(row, index) {
    const cells = Array.isArray(row) ? row : [];
    const hasContent = cells.some((cell) => normalizeWhitespace(cell));
    if (!hasContent) {
      return null;
    }

    const id = this.getCell(cells, 'id') || `TC-${String(index + 1).padStart(2, '0')}`;
    const title = this.getCell(cells, 'title') || '(Chưa đặt tên)';
    const description = this.getCell(cells, 'description') || this.getCell(cells, 'module');
    const moduleName = this.getCell(cells, 'module');
    const priority = this.getCell(cells, 'priority');
    const precondition = this.getCell(cells, 'precondition');
    const stepsRaw = this.getCell(cells, 'steps');
    const expected = this.getCell(cells, 'expected');
    const notes = this.getCell(cells, 'notes');

    if (!stepsRaw && !expected && !title) {
      return null;
    }

    const steps = splitSteps(stepsRaw);

    return {
      id,
      title,
      description,
      module: moduleName,
      priority,
      precondition,
      steps,
      stepsRaw,
      expected,
      notes,
      sourceRow: index + 1,

      // Legacy compatibility for older code paths.
      ID: id,
      Scenario: title,
      Description: description,
      Steps: stepsRaw,
      'Expected Result': expected,
    };
  }

  validate(testCases) {
    if (!testCases || testCases.length === 0) {
      throw new Error('Excel file is empty or contains no recognizable test cases');
    }

    testCases.forEach((testCase) => {
      if (!testCase.id) {
        throw new Error('Missing test case ID');
      }
      if (!testCase.stepsRaw) {
        throw new Error(`Missing steps for test case ${testCase.id}`);
      }
      if (!testCase.expected) {
        throw new Error(`Missing expected result for test case ${testCase.id}`);
      }
    });
  }
}

module.exports = ExcelParser;

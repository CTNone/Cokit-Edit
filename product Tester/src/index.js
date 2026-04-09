#!/usr/bin/env node
const { program } = require('commander');
const path = require('path');
require('dotenv').config();

const config = require('./config');
const ExcelParser = require('./parser');
const MarkdownGenerator = require('./generator');
const ui = require('./ui');
const logger = require('./logger');
const PlaywrightRunner = require('./runner');

const resultsManager = require('./results');
const retryManager = require('./retry');

function normalizeArgs() {
  const args = process.argv.slice(2);
  if (args.length === 1 && /\.xlsx$/i.test(args[0])) {
    process.argv.splice(2, 0, 'convert');
    return;
  }

  if (args.length > 0 && args[0].startsWith('--')) {
    process.argv.splice(2, 0, 'run');
  }
}

function resolveOutputPath(inputPath, explicitOutputPath) {
  if (explicitOutputPath) {
    return path.resolve(explicitOutputPath);
  }
  const parsed = path.parse(path.resolve(inputPath));
  return path.join(parsed.dir, `${parsed.name}.md`);
}

function parseTestCases(inputPath) {
  const parser = new ExcelParser(inputPath);
  return parser.parse();
}

async function preparePlan(inputPath, outputPath, options = {}) {
  logger.info(`Converting ${inputPath} to Markdown...`);
  const testCases = parseTestCases(inputPath);
  const generator = new MarkdownGenerator(outputPath);
  generator.generate(testCases, {
    sourceFile: inputPath,
    generatedAt: new Date(),
    appUrl: options.targetUrl || config.TARGET_URL,
  });
  logger.success(`Conversion completed successfully: ${outputPath}`);
  return testCases;
}

function selectCases(testCases, executionChoice) {
  if (executionChoice.mode === 'select') {
    const requested = new Set((executionChoice.ids || []).map((id) => id.toUpperCase()));
    return testCases.filter((testCase) => requested.has(String(testCase.id).toUpperCase()) || requested.has(String(testCase.title).toUpperCase()));
  }

  return testCases;
}

async function runExecution(options, testCases = null) {
  const runner = new PlaywrightRunner(options);

  try {
    if (!testCases) {
      testCases = parseTestCases(options.inputPath || config.DEFAULT_XLSX_PATH);
    }

    let casesToRun = testCases;

    if (options.retry) {
      const failedIds = await retryManager.getFailedCaseIds();
      casesToRun = retryManager.filterTestCases(testCases, failedIds);
      if (casesToRun.length === 0) {
        logger.info('No failed cases to retry.');
        return;
      }
      logger.info(`Retrying ${casesToRun.length} failed cases.`);
    }

    if (options.select) {
      const ids = options.select.split(',').map(id => id.trim());
      casesToRun = testCases.filter(tc => ids.includes(tc.id) || ids.includes(tc.ID.toString()) || ids.includes(tc.title) || ids.includes(tc.Scenario));
    }

    const runFolder = await resultsManager.initRun({
      planPath: options.planPath,
      sourceFile: options.inputPath || config.DEFAULT_XLSX_PATH,
      testCases,
      appUrl: options.targetUrl || config.TARGET_URL,
      selectedIds: casesToRun.map((testCase) => testCase.id),
    });

    await runner.init(runFolder, testCases);
    for (const testCase of casesToRun) {
      await runner.runScenario(testCase);
    }

    const summary = await resultsManager.finalize();
    return summary;
  } catch (error) {
    logger.error(`Execution failed: ${error.message}`);
    throw error;
  } finally {
    await runner.cleanup();
  }
}

normalizeArgs();

program
  .version('1.0.0')
  .description('product Tester - Automation Testing CLI Tool');

program
  .command('convert [xlsxPath]')
  .description('Convert Excel test cases to Markdown, review, then execute')
  .option('--output <mdPath>', 'Output Markdown path')
  .option('--target-url <url>', 'Target application URL', config.TARGET_URL)
  .option('--select <ids>', 'Run specific test case IDs (comma-separated)')
  .option('--retry', 'Rerun only failed/blocked cases from previous run')
  .option('--headed', 'Run browser in headed mode', false)
  .action(async (xlsxPath, options) => {
    const inputPath = path.resolve(xlsxPath || config.DEFAULT_XLSX_PATH);
    const outputPath = resolveOutputPath(inputPath, options.output);

    try {
      const testCases = await preparePlan(inputPath, outputPath, { targetUrl: options.targetUrl });

      const proceed = await ui.confirm(`Please review "${outputPath}". Do you want to continue to execution?`);
      if (!proceed) {
        logger.warn('Execution cancelled by tester.');
        return;
      }

      const executionChoice = await ui.chooseExecutionMode(testCases, {
        select: options.select,
        retry: options.retry,
        runAll: false,
      });

      if (executionChoice.mode === 'edit') {
        logger.warn('Tester chose to edit the Markdown file before execution.');
        return;
      }

      const targetUrl = await ui.promptText('URL ứng dụng cần test', options.targetUrl || config.TARGET_URL);
      const selectedCases = selectCases(testCases, executionChoice);
      if (selectedCases.length === 0) {
        logger.warn('No test cases selected to run.');
        return;
      }

      await runExecution({
        headed: options.headed,
        inputPath,
        planPath: outputPath,
        targetUrl,
        select: executionChoice.mode === 'select' ? executionChoice.ids.join(',') : undefined,
        retry: executionChoice.mode === 'retry',
      }, testCases);
    } catch (error) {
      logger.error(`Conversion failed: ${error.message}`);
    }
  });

program
  .command('run [xlsxPath]')
  .description('Run automation test cases')
  .option('--headed', 'Run browser in headed mode', false)
  .option('--mode <type>', 'Execution mode (compile, etc.)', 'compile')
  .option('--force', 'Force re-run even if already completed', false)
  .option('--select <ids>', 'Run specific test case IDs (comma-separated)')
  .option('--retry', 'Rerun only failed test cases from previous run')
  .option('--plan <mdPath>', 'Existing Markdown plan path')
  .option('--target-url <url>', 'Target application URL', config.TARGET_URL)
  .action(async (xlsxPath, options) => {
    logger.info('Starting automation execution via CLI...');
    const inputPath = path.resolve(xlsxPath || config.DEFAULT_XLSX_PATH);
    const planPath = path.resolve(options.plan || resolveOutputPath(inputPath));

    let testCases = parseTestCases(inputPath);
    if (!await ui.confirm(`Use test plan at "${planPath}" and continue?`)) {
      logger.warn('Execution cancelled by tester.');
      return;
    }

    const executionChoice = await ui.chooseExecutionMode(testCases, {
      select: options.select,
      retry: options.retry,
    });

    if (executionChoice.mode === 'edit') {
      logger.warn('Tester chose to edit the Markdown file before execution.');
      return;
    }

    testCases = selectCases(testCases, executionChoice);
    if (testCases.length === 0) {
      logger.warn('No test cases selected to run.');
      return;
    }

    await runExecution({
      ...options,
      inputPath,
      planPath,
      targetUrl: options.targetUrl,
      select: executionChoice.mode === 'select' ? executionChoice.ids.join(',') : undefined,
      retry: executionChoice.mode === 'retry',
    }, parseTestCases(inputPath));
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

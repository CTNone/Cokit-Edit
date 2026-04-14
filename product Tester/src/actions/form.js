const path = require('path');
const { createInteractionError } = require('../interaction-errors');

class FormAction {
  constructor(page, resolver) {
    this.page = page;
    this.resolver = resolver;
  }

  async execute(action) {
    switch (action.type) {
      case 'fill':
        return this.fillField(action.fieldName, action.value);
      case 'select-option':
        return this.selectOption(action.fieldName, action.option);
      case 'check':
        return this.checkField(action.target);
      case 'upload-file':
        return this.uploadFile(action.filePath, action.fieldName);
    }
  }

  async fillField(fieldName, value) {
    const locator = await this.resolver.resolveInput(fieldName);
    await locator.fill(value);
  }

  async selectOption(fieldName, option) {
    const locator = await this.resolver.resolveDropdown(fieldName);

    const tagName = await locator.evaluate((node) => node.tagName.toLowerCase()).catch(() => '');
    if (tagName === 'select') {
      await locator.selectOption({ label: option }).catch(async () => {
        await locator.selectOption({ value: option }).catch(async () => {
          await locator.selectOption({ index: Number(option) }).catch(() => {
            throw createInteractionError('action_fail', `Không thể chọn option "${option}" trong dropdown "${fieldName}"`);
          });
        });
      });
      return;
    }

    await locator.click();
    const optionLocator = await this.resolver.resolveOption(option);
    await optionLocator.click();
    await this.page.waitForTimeout(500);
  }

  async checkField(target) {
    const locator = await this.resolver.resolveInput(target);
    const type = await locator.getAttribute('type').catch(() => '');
    if (type === 'checkbox' || type === 'radio') {
       await locator.check();
    } else {
       await locator.click(); 
    }
  }

  async uploadFile(filePath, fieldName = 'file') {
    const locator = await this.resolver.resolveFileInput(fieldName);
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    await locator.setInputFiles(absolutePath).catch(() => {
      throw createInteractionError('action_fail', `Không thể upload file: ${absolutePath}`);
    });
    await this.page.waitForTimeout(500);
  }
}

module.exports = FormAction;

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs-extra');

const data = [
  ['ID', 'Scenario', 'Description', 'Steps', 'Expected Result'],
  ['TC-SCROLL', 'Verify Scrolling', 'Check if scroll bottom and top works', '1. [GOTO] "https://demowebshop.tricentis.com/"\n2. [SCROLL] "bottom"\n3. [SCROLL] "top"', 'Page scrolls to bottom then back to top.'],
  ['TC-FILL', 'Verify Form Filling', 'Check if fill and click works', '1. [GOTO] "https://demowebshop.tricentis.com/"\n2. [FILL] "Search store" : "Laptop"\n3. [PRESS] "Enter"', 'Search results page is loaded with Laptop results.'],
  ['TC-SELECT', 'Verify Dropdown Selection', 'Check if select-option works', '1. [GOTO] "https://demowebshop.tricentis.com/books"\n2. [SELECT] "Sort by" : "Price: Low to High"', 'Books are sorted by price low to high.'],
  ['TC-HOVER', 'Verify Hover Interaction', 'Check if hover works', '1. [GOTO] "https://demowebshop.tricentis.com/"\n2. [HOVER] "Computers"\n3. [CLICK] "Desktops"', 'Category Desktops page is loaded.'],
  ['TC-AUTH', 'Verify Login Step', 'Check if legacy auth steps work', '1. [GOTO] "https://demowebshop.tricentis.com/login"\n2. [FILL] "Email" : "tester@example.com"\n3. [FILL] "Password" : "password123"\n4. [CLICK] "Log in"', 'Login attempt is recorded (expected to fail if data is invalid, but steps should execute).']
];

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'TestCases');

const templatesDir = path.join(__dirname, 'templates');
fs.ensureDirSync(templatesDir);
const filePath = path.join(templatesDir, 'feature-test.xlsx');

XLSX.writeFile(wb, filePath);
console.log('Feature Test Excel created at:', filePath);

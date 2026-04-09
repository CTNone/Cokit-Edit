const XLSX = require('xlsx');
const path = require('path');

const data = [
  ['ID', 'Scenario', 'Description', 'Steps', 'Expected Result'],
  ['TC-01', 'Search Google', 'Verify google search works', '1. Go to google.com\n2. Type "Cokit"\n3. Press Enter', 'Results are shown'],
  ['TC-02', 'About Page', 'Verify footer exists', '1. Go to google.com\n2. Scroll to footer', 'Footer is visible']
];

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'TestCases');

const filePath = path.join(__dirname, 'templates', 'test-cases.xlsx');
XLSX.writeFile(wb, filePath);
console.log('Sample Excel template created at:', filePath);

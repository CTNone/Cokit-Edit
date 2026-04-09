const XLSX = require('xlsx');
const path = require('path');
const file = path.join(__dirname, 'templates', 'test-cases.xlsx');
const wb = XLSX.readFile(file);
const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
console.log(JSON.stringify(data, null, 2));

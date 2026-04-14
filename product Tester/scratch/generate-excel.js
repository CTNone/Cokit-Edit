const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const data = [
  {
    "ID": "TC-NAV-01",
    "Scenario": "Kiểm tra Trang chủ & Logo",
    "Steps": "1. Truy cập https://demo.nopcommerce.com/register\n2. Click vào logo \"nopCommerce\"",
    "Expected Result": "Chuyển về trang chủ thành công"
  },
  {
    "ID": "TC-NAV-02",
    "Scenario": "Menu điều hướng (Top Menu)",
    "Steps": "1. Truy cập https://demo.nopcommerce.com/\n2. Click vào menu \"Computers\"",
    "Expected Result": "Hiển thị trang danh mục Computers"
  },
  {
    "ID": "TC-NAV-03",
    "Scenario": "Header / Footer links",
    "Steps": "1. Truy cập https://demo.nopcommerce.com/\n2. Cuộn tới cuối trang\n3. Click vào link \"Contact us\"",
    "Expected Result": "Chuyển tới trang liên hệ"
  },
  {
    "ID": "TC-NAV-04",
    "Scenario": "Breadcrumb",
    "Steps": "1. Truy cập https://demo.nopcommerce.com/build-your-own-computer\n2. Click vào \"Desktops\" trong dải Breadcrumb",
    "Expected Result": "Quay lại danh mục Desktops"
  },
  {
    "ID": "TC-NAV-05",
    "Scenario": "Tìm kiếm nội dung",
    "Steps": "1. Truy cập https://demo.nopcommerce.com/\n2. Nhập \"phone\" vào ô tìm kiếm\n3. Nhấn enter",
    "Expected Result": "Hiển thị kết quả tìm kiếm cho phone"
  }
];

const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "TestCases");

const dir = path.join(__dirname, 'templates');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
XLSX.writeFile(wb, path.join(dir, 'nopcommerce.xlsx'));
console.log('Created templates/nopcommerce.xlsx');

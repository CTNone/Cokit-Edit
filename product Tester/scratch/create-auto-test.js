const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs-extra');

async function generate() {
  const data = [
    ['ID', 'Scenario', 'Description', 'Steps', 'Expected Result'],
    [
      'TC-01', 
      'Navigation & Search', 
      'Check menu, logo, and search', 
      '1. Truy cập https://ecommerce-playground.lambdatest.io/\n2. Nhấp "Poco" logo\n3. Click "Shop by Category"\n4. Click "Components"\n5. Nhập Search: "iMac"\n6. Nhấn phím Enter', 
      'Kết quả tìm thấy sản phẩm iMac'
    ],
    [
      'TC-02', 
      'Content & Scroll', 
      'Check gallery, tabs, and scroll', 
      '1. Truy cập https://ecommerce-playground.lambdatest.io/index.php?route=product/product&product_id=28\n2. Click "Description" tab\n3. Click "Specification" tab\n4. Cuộn xuống phần "Related Products"\n5. Nhìn vào ảnh sản phẩm chính', 
      'Tab Switch hoạt động, section Related Products hiển thị'
    ],
    [
      'TC-03', 
      'Forms & Dropdown', 
      'Check register form elements', 
      '1. Truy cập https://ecommerce-playground.lambdatest.io/index.php?route=account/register\n2. Nhập First Name: "Antigravity"\n3. Nhập Last Name: "Tester"\n4. Click "Privacy Policy" checkbox\n5. Select "United Kingdom" from "Country"', 
      'Các trường form được nhập đúng'
    ],
    [
      'TC-04', 
      'Mobile View', 
      'Check mobile responsive', 
      '1. Truy cập https://ecommerce-playground.lambdatest.io/\n2. Chế độ di động\n3. Click "Menu"', 
      'Menu hamburger mở ra trên bản mobile'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'TestCases');

  const templatesDir = path.join(__dirname, '..', 'templates');
  await fs.ensureDir(templatesDir);
  const filePath = path.join(templatesDir, 'auto-test.xlsx');
  XLSX.writeFile(wb, filePath);
  console.log('Automated test Excel created at:', filePath);
}

generate();

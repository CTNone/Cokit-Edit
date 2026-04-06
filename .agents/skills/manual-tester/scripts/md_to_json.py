import sys
import os
import re
import json
import argparse

def parse_markdown_to_steps(md_path, tc_id):
    print(f"Reading file: {md_path} for TC: {tc_id}")
    if not os.path.exists(md_path): return None
    with open(md_path, "r", encoding="utf-8") as f: content = f.read()
    
    # Improved section splitting (Hỗ trợ ## và ###)
    tc_sections = re.split(r'\n(?=##+\s+)', content)
    target_section = None
    for section in tc_sections:
        # Match "## ID" or "### ID" or "## ID — Name"
        header_match = re.search(r'^#+\s*([\w\-]+)', section.strip())
        if header_match and str(header_match.group(1)).lower() == str(tc_id).lower():
            target_section = section
            break
    if not target_section: return None
    
    # Improved step detection (Hỗ trợ mọi định dạng list)
    steps_match = re.search(r'\*\*Các bước thực hiện:\*\*(.*?)(?=\n\*\*|\n---|\Z)', target_section, re.DOTALL | re.IGNORECASE)
    if not steps_match: steps_match = re.search(r'\*\*Steps:\*\*(.*?)(?=\n\*\*|\n---|\Z)', target_section, re.DOTALL | re.IGNORECASE)
    if not steps_match: return None
    
    step_lines = re.findall(r'^\s*[-\d+\-\*]\.?\s*(.*)', steps_match.group(1).strip(), re.MULTILINE)
    steps_json = []
    
    for line in step_lines:
        line = line.strip()
        if not line: continue
        lower_line = line.lower()
        
        # Action Goto
        if any(kw in lower_line for kw in ["truy cập", "mở", "vào trang", "vào http", "goto", "mở url"]):
            url_match = re.search(r'(https?://[^\s]+)', line)
            if url_match:
                steps_json.append({"cmd": "goto", "target": url_match.group(1), "value": ""})
                continue

        # Action Fill
        if any(kw in lower_line for kw in ["nhập", "điền", "ô", "username", "password", "email", "tài khoản", "mật khẩu"]):
            kv_split = re.split(r'[:：]', line, 1)
            if len(kv_split) > 1:
                target = re.sub(r'(nhập|điền|ô|vào|đối với)\s*', '', kv_split[0], flags=re.IGNORECASE).strip().strip('"')
                value = kv_split[1].strip().strip('"')
                steps_json.append({"cmd": "fill", "target": target, "value": value})
                continue

        # Action Click
        if any(kw in lower_line for kw in ["click", "nhấp", "bấm", "nhấn", "chọn"]):
            target = re.sub(r'(nhấn|click|bấm|nhấp|chọn|tap)\s*(nút|link|button|vào|ô|vùng)?\s*', '', line, flags=re.IGNORECASE).strip().strip('"')
            steps_json.append({"cmd": "click", "target": target, "value": ""})
            continue

        # Action Press
        if any(kw in lower_line for kw in ["enter", "phím", "tab", "key"]):
            steps_json.append({"cmd": "press", "target": "Enter", "value": ""})
            continue

    # Assertion extraction (Improved keywords)
    expected_match = re.search(r'\*\*Kết quả mong đợi:\*\*(.*?)(?=\n\*\*|\n---|\Z)', target_section, re.DOTALL | re.IGNORECASE)
    if expected_match:
        expected_raw = expected_match.group(1).strip()
        expected_lines = re.findall(r'^\s*[-\d+\-\*]\.?\s*(.*)', expected_raw, re.MULTILINE)
        for e_line in expected_lines:
            assertion_val = re.sub(r'^(Màn hình|Hiển thị|Chuyển hướng|thành công|về|đến|kết quả|chữ|dòng chữ|thông báo)\s*', '', e_line, flags=re.IGNORECASE).strip().strip('"')
            if assertion_val and len(assertion_val) > 2:
                steps_json.append({"cmd": "assert_text", "target": "body", "value": assertion_val})
                
    return steps_json

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("md_file")
    parser.add_argument("tc_id")
    parser.add_argument("--output", help="Path to output JSON file")
    args = parser.parse_args()
    steps = parse_markdown_to_steps(args.md_file, args.tc_id)
    if steps:
        output_data = json.dumps(steps, indent=4, ensure_ascii=False)
        if args.output:
            os.makedirs(os.path.dirname(args.output), exist_ok=True)
            with open(args.output, "w", encoding="utf-8") as f: f.write(output_data)
            print(f"Success: {len(steps)} steps written to {args.output}")
        else: print(output_data)
    else: sys.exit(1)

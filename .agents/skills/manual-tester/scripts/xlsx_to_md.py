#!/usr/bin/env python3
"""
xlsx_to_md.py — Chuyển file Excel test case sang file Markdown test plan
Giữ nguyên 100% ngôn ngữ và nội dung gốc từ Excel (tiếng Việt, tiếng Anh, v.v.)

Cách dùng:
    python xlsx_to_md.py <input.xlsx> [output.md]

Cột Excel được nhận diện tự động (tiếng Việt & tiếng Anh):
    Mã TC | Tên test | Tính năng | Độ ưu tiên | Điều kiện | Các bước | Kết quả mong đợi | Ghi chú
    TC ID | Test Name | Module     | Priority   | Precon    | Steps    | Expected Result  | Notes
"""

import sys
import os
import re
from pathlib import Path
from datetime import datetime

try:
    import openpyxl
except ImportError:
    print("LỖI: Thiếu thư viện openpyxl. Chạy: pip install openpyxl")
    sys.exit(1)

# Fix encoding for Windows Terminal
if sys.stdout.encoding.lower() != 'utf-8':
    try:
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    except:
        pass


# ─── Nhận diện cột tự động ────────────────────────────────────────────────────

COLUMN_ALIASES = {
    "id": [
        "id", "test id", "tc id", "test case id", "mã tc", "mã test", "mã",
        "stt", "số", "no", "#", "case id", "case no",
    ],
    "name": [
        "name", "test name", "title", "tiêu đề", "tên", "tên test",
        "test case name", "case", "tên test case",
    ],
    "module": [
        "module", "feature", "tính năng", "chức năng", "category",
        "area", "scope", "nhóm", "phân loại", "Description", "mô tả",
    ],
    "priority": [
        "priority", "mức độ", "ưu tiên", "độ ưu tiên", "mức ưu tiên",
        "p", "prio", "severity", "mức độ ưu tiên",
    ],
    "precondition": [
        "precondition", "pre-condition", "preconditions",
        "điều kiện", "điều kiện tiên quyết", "tiền đề", "setup",
        "điều kiện trước",
    ],
    "steps": [
        "steps", "step", "test steps", "các bước", "bước", "bước thực hiện",
        "actions", "action", "thao tác", "nội dung kiểm thử",
    ],
    "expected": [
        "expected", "expected result", "kết quả mong đợi", "kết quả mong muốn", "kết quả",
        "expected outcome", "result", "kết quả kỳ vọng", "mong đợi",
    ],
    "notes": [
        "notes", "note", "ghi chú", "chú thích", "remark", "remarks",
        "comment", "comments", "lưu ý",
    ],
}


def detect_columns(header_row: list) -> dict:
    """Nhận diện tên cột → chỉ số (index). Giữ nguyên không dịch."""
    mapping = {}
    headers_lower = [str(h).strip().lower() if h else "" for h in header_row]

    for field, aliases in COLUMN_ALIASES.items():
        for idx, h in enumerate(headers_lower):
            if h in aliases:
                mapping[field] = idx
                break

    return mapping


# ─── Đọc Excel ────────────────────────────────────────────────────────────────

def load_excel(xlsx_path: str):
    wb = openpyxl.load_workbook(xlsx_path, data_only=True)

    # Ưu tiên sheet tên quen thuộc
    preferred = ["test cases", "test case", "tests", "test", "sheet1", "trang tính1"]
    sheet = None
    for name in wb.sheetnames:
        if name.strip().lower() in preferred:
            sheet = wb[name]
            break
    if sheet is None:
        sheet = wb.active

    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return [], []

    return list(rows[0]), rows[1:]


# ─── Lấy giá trị ô — GIỮ NGUYÊN NỘI DUNG GỐC ────────────────────────────────

def get_cell(row, idx) -> str:
    """Lấy nội dung ô và giữ nguyên 100% — không dịch, không sửa."""
    if idx is None or idx >= len(row):
        return ""
    val = row[idx]
    if val is None:
        return ""
    # Chỉ chuẩn hóa xuống dòng để hiển thị đúng trong Markdown
    return str(val).strip().replace("\r\n", "\n").replace("\r", "\n")


def priority_label(p: str) -> str:
    """Hiển thị độ ưu tiên — giữ nguyên text gốc từ Excel."""
    p_upper = p.strip().upper()
    badges = {
        "HIGH": "🔴 Cao",
        "MEDIUM": "🟡 Trung bình",
        "LOW": "🟢 Thấp",
        "CRITICAL": "⛔ Nghiêm trọng",
        "CAO": "🔴 Cao",
        "TRUNG BÌNH": "🟡 Trung bình",
        "THẤP": "🟢 Thấp",
        "NGHIÊM TRỌNG": "⛔ Nghiêm trọng",
    }
    return badges.get(p_upper, p)  # Nếu không khớp → giữ nguyên text gốc


# ─── Tách các bước thực hiện ──────────────────────────────────────────────────

def format_steps(raw: str) -> list:
    """
    Tách chuỗi bước thành danh sách có đánh số.
    Giữ nguyên nội dung từng bước — không dịch.
    """
    if not raw:
        return []

    lines = [line.strip() for line in raw.split("\n") if line.strip()]
    result = []

    for i, line in enumerate(lines, 1):
        # Bỏ số thứ tự cũ nếu đã có (1. / 1) / Bước 1:)
        cleaned = re.sub(r"^(bước\s*)?\d+[\.\)\:]\s*", "", line, flags=re.IGNORECASE).strip()
        if cleaned:
            result.append(f"{i}. {cleaned}")

    return result


# ─── Tạo nội dung Markdown ────────────────────────────────────────────────────

def build_test_plan(header: list, data: list, source_file: str) -> str:
    col = detect_columns(header)
    now = datetime.now().strftime("%d/%m/%Y %H:%M")
    source_name = Path(source_file).name

    valid_rows = [r for r in data if any(c for c in r if c)]
    total = len(valid_rows)

    # ── Đầu trang ──
    lines = [
        f"# Kế Hoạch Kiểm Thử",
        f"",
        f"**Nguồn file:** {source_name}",
        f"**Ngày tạo:** {now}",
        f"**Tổng số test case:** {total}",
        f"",
        f"---",
        f"",
        f"## Hướng Dẫn Review",
        f"",
        f"Trước khi chạy test, tester vui lòng kiểm tra:",
        f"",
        f"- [ ] Số lượng test case đúng với file Excel gốc",
        f"- [ ] Nội dung từng bước rõ ràng, đủ thông tin",
        f"- [ ] Kết quả mong đợi cụ thể và có thể đo lường được",
        f"- [ ] Thứ tự thực hiện hợp lý",
        f"",
        f"Sau khi kiểm tra xong, xác nhận để bắt đầu chạy test.",
        f"",
        f"---",
        f"",
    ]

    # ── Danh sách test case ──
    if "module" in col:
        # Nhóm theo tính năng/module
        groups: dict = {}
        for row in valid_rows:
            mod = get_cell(row, col.get("module")) or "Chung"
            groups.setdefault(mod, []).append(row)

        for module_name, rows in groups.items():
            lines.append(f"## {module_name}")
            lines.append("")
            for row in rows:
                lines += _render_test_case(row, col)
    else:
        for row in valid_rows:
            lines += _render_test_case(row, col)

    # ── Bảng kết quả (trống, tester điền sau) ──
    lines += [
        "---",
        "",
        "## Bảng Kết Quả",
        "",
        "*(Điền kết quả sau khi chạy từng test)*",
        "",
        "| Mã TC | Tên Test | Kết Quả | Bằng Chứng | Ghi Chú |",
        "|-------|----------|---------|------------|---------|",
    ]

    for row in valid_rows:
        tc_id = get_cell(row, col.get("id")) or "-"
        name  = get_cell(row, col.get("name")) or "-"
        # Nếu tên có xuống dòng (multi-line) thì lấy dòng đầu
        name = name.split("\n")[0]
        lines.append(f"| {tc_id} | {name} | Chưa chạy | - | - |")

    lines.append("")
    return "\n".join(lines)


def _render_test_case(row, col: dict) -> list:
    """Render 1 test case thành Markdown — GIỮ NGUYÊN nội dung gốc."""
    tc_id    = get_cell(row, col.get("id"))
    name     = get_cell(row, col.get("name")) or "(Chưa đặt tên)"
    prio     = get_cell(row, col.get("priority"))
    pre      = get_cell(row, col.get("precondition"))
    steps_raw= get_cell(row, col.get("steps"))
    expected = get_cell(row, col.get("expected"))
    notes    = get_cell(row, col.get("notes"))

    # Tiêu đề test case
    heading = f"### {tc_id + ' — ' if tc_id else ''}{name}"

    lines = [heading, ""]

    # Thông tin cơ bản
    if prio:
        lines.append(f"- **Độ ưu tiên:** {priority_label(prio)}")
    lines.append(f"- **Trạng thái:** Chưa chạy")
    lines.append("")

    # Điều kiện tiên quyết
    if pre:
        lines.append("**Điều kiện trước khi test:**")
        for ln in pre.split("\n"):
            ln = ln.strip()
            if ln:
                lines.append(f"- {ln}")
        lines.append("")

    # Các bước thực hiện
    steps = format_steps(steps_raw)
    if steps:
        lines.append("**Các bước thực hiện:**")
        for s in steps:
            lines.append(s)
        lines.append("")

    # Kết quả mong đợi
    if expected:
        lines.append("**Kết quả mong đợi:**")
        for ln in expected.split("\n"):
            ln = ln.strip()
            if ln:
                lines.append(f"- {ln}")
        lines.append("")

    # Ghi chú
    if notes:
        lines.append("**Ghi chú:**")
        for ln in notes.split("\n"):
            ln = ln.strip()
            if ln:
                lines.append(f"- {ln}")
        lines.append("")

    # Chỗ ghi bằng chứng (để trống)
    lines += [
        "**Kết quả thực tế:** *(điền sau khi chạy)*",
        "",
        "**Bằng chứng:** *(screenshot/video sẽ được gắn vào đây)*",
        "",
        "---",
        "",
    ]

    return lines


# ─── Chạy chính ───────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Cách dùng: python xlsx_to_md.py <input.xlsx> [output.md]")
        sys.exit(1)

    xlsx_path = sys.argv[1]
    if not os.path.exists(xlsx_path):
        print(f"LỖI: Không tìm thấy file: {xlsx_path}")
        sys.exit(1)

    # Đặt tên file output
    if len(sys.argv) >= 3:
        md_path = sys.argv[2]
    else:
        stem = Path(xlsx_path).stem
        stem_clean = re.sub(r"\s+", "-", stem).lower()
        # Đảm bảo lưu cùng folder với xlsx_path
        xlsx_dir = os.path.dirname(os.path.abspath(xlsx_path))
        md_path = os.path.join(xlsx_dir, f"{stem_clean}.md")

    print(f"Đang đọc: {xlsx_path}")
    header, data = load_excel(xlsx_path)

    if not header and not data:
        print("LỖI: File Excel trống hoặc không đọc được.")
        sys.exit(1)

    valid_rows = [r for r in data if any(c for c in r if c)]
    print(f"Tìm thấy: {len(valid_rows)} test case")

    # Phát hiện cột
    col = detect_columns(header)
    detected = ", ".join(f"{k}→cột {v+1}" for k, v in col.items())
    print(f"Cột nhận diện được: {detected}")

    md_content = build_test_plan(header, data, xlsx_path)

    with open(md_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(md_content)

    print(f"")
    print(f"Đã lưu: {md_path}")
    print(f"")
    print(f"Vui lòng mở file và kiểm tra trước khi chạy test.")


if __name__ == "__main__":
    main()

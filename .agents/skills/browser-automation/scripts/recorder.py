import sys
import argparse
import time
import os
import json
from datetime import datetime
from playwright.sync_api import sync_playwright

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    except:
        pass

def run_recorder(url, steps, tc_id):
    success = True
    error_msg = ""
    failed_at_step = None
    
    # TIMESTAMP & DIRECTORY LOGIC
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    tc_folder = os.path.join("tests", "recordings", tc_id if tc_id else "general")
    os.makedirs(tc_folder, exist_ok=True)
    
    video_filename = f"video_{timestamp}.webm"
    error_filename = f"error_{timestamp}.png"
    result_filename = f"result_{timestamp}.json"
    
    with sync_playwright() as p:
        # VISIBLE MODE: headless=False
        browser = p.chromium.launch(headless=False, slow_mo=500) 
        context = browser.new_context(record_video_dir=tc_folder)
        page = context.new_page()
        
        try:
            print(f"--- [TC: {tc_id}] LAUNCHING VISIBLE BROWSER ---")
            page.goto(url, wait_until="networkidle")
            
            for i, step in enumerate(steps):
                if not step: continue
                
                cmd = step.get("cmd", "").strip().lower()
                target = step.get("target", "").strip()
                value = step.get("value", "").strip()
                
                print(f"[{i+1}/{len(steps)}] Action: {cmd} | Selector: {target} | Data: {value}")
                
                try:
                    locator = None
                    strategies = []
                    
                    if target.startswith(('#', '.', '[', ':')) or target in ["body", "html", "div", "h1", "h2", "h3", "span", "input", "button", "a"]:
                        strategies = [page.locator(target)]
                    else:
                        if cmd == "click":
                            strategies = [
                                page.locator(f"button:has-text('{target}')"),
                                page.locator(f"a:has-text('{target}')"),
                                page.locator(f"input[type='submit'][value*='{target}']"),
                                page.locator(f"role=button[name='{target}']"),
                                page.locator(f"text='{target}'")
                            ]
                        elif cmd == "fill":
                            strategies = [
                                page.locator(f"input[placeholder*='{target}']"),
                                page.locator(f"input[name*='{target}']"),
                                page.locator(f"input[id*='{target}']"),
                                page.locator(f"label:has-text('{target}') + input"),
                                page.locator(f"text='{target}'")
                            ]
                        else:
                            strategies = [page.locator(f"text='{target}'")]
                    
                    for s in strategies:
                        try:
                            if s.count() > 0:
                                locator = s.first
                                break
                        except: continue
                    if not locator: locator = page.locator(f"text='{target}'")
                    
                    if cmd == "click":
                        locator.wait_for(state="visible", timeout=10000)
                        locator.click()
                        time.sleep(1)
                    elif cmd == "fill":
                        locator.wait_for(state="visible", timeout=10000)
                        locator.fill(value)
                    elif cmd == "wait":
                        time.sleep(float(target or value or 1))
                    elif cmd == "press":
                        page.keyboard.press(target or value or "Enter")
                        time.sleep(1)
                    elif cmd == "screenshot":
                        page.screenshot(path=os.path.join(tc_folder, f"sc_{timestamp}_{target or 'manual'}.png"))
                    elif cmd == "assert_text":
                        text_found = False
                        for _ in range(20):
                            content = page.text_content("body")
                            if value.lower() in content.lower():
                                text_found = True
                                break
                            if "login" in page.url.lower() and "login" in value.lower():
                                text_found = True
                                break
                            time.sleep(0.5)
                        if not text_found:
                            raise Exception(f"Validation Error: '{value}' not found.")
                    elif cmd == "assert_visible":
                        locator.wait_for(timeout=10000)
                        if not locator.is_visible():
                            raise Exception(f"Validation Error: Element not visible")
                    elif cmd == "goto":
                        page.goto(target or value, wait_until="networkidle")
                        
                except Exception as e:
                    page.screenshot(path=os.path.join(tc_folder, error_filename))
                    print(f"!!! STEP {i+1} FAILED: {e}")
                    success = False
                    error_msg = str(e)
                    failed_at_step = i + 1
                    break
                
                time.sleep(0.5)
                
            if success:
                print("--- ALL STEPS COMPLETED ---")
                time.sleep(2)
            
        except Exception as e:
            print(f"System Failure: {e}")
            success = False
            error_msg = str(e)
        finally:
            video_orig_path = page.video.path() if page.video else None
            context.close()
            browser.close()
            if video_orig_path and os.path.exists(video_orig_path):
                output_path = os.path.join(tc_folder, video_filename)
                os.rename(video_orig_path, output_path)
                print(f"Evidence Saved: {output_path}")

    # RESULT EXPORT
    with open(os.path.join(tc_folder, result_filename), "w", encoding="utf-8") as f:
        json.dump({
            "tc_id": tc_id,
            "timestamp": timestamp,
            "success": success, 
            "error": error_msg, 
            "failed_at_step": failed_at_step,
            "files": {
                "video": video_filename,
                "error_image": error_filename if not success else None
            }
        }, f, indent=4)
    
    print(f"--- Conclusion: {'PASS' if success else 'FAIL'} ---")
    if not success: sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--json", help="Path to JSON file")
    parser.add_argument("--tc-id", help="TC ID for folder naming", default="gen")
    parser.add_argument("--output", help="Ignored in v2, kept for compatibility")
    args = parser.parse_args()
    if args.json:
        with open(args.json, "r", encoding="utf-8") as f: steps_data = json.load(f)
        run_recorder(args.url, steps_data, args.tc_id)
    else:
        sys.exit(1)

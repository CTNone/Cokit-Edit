import sys
import argparse
import time
import os
from playwright.sync_api import sync_playwright

def run_recorder(url, steps_str, output_name):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(record_video_dir="tests/recordings/")
        page = context.new_page()
        
        try:
            print(f"Opening: {url}")
            page.goto(url)
            
            # steps format: "cmd: target | cmd: target, value"
            steps = [s.strip() for s in steps_str.split("|")] if steps_str else []
            
            for step in steps:
                if not step: continue
                cmd_raw = step.split(":", 1)
                cmd = cmd_raw[0].strip().lower()
                args_raw = cmd_raw[1].strip() if len(cmd_raw) > 1 else ""
                
                print(f"Step: {cmd} with {args_raw}")
                
                if cmd == "click":
                    page.wait_for_selector(args_raw, timeout=10000)
                    page.click(args_raw)
                elif cmd == "fill":
                    parts = args_raw.split(",", 1)
                    selector = parts[0].strip()
                    value = parts[1].strip() if len(parts) > 1 else ""
                    page.wait_for_selector(selector, timeout=10000)
                    page.fill(selector, value)
                elif cmd == "wait":
                    time.sleep(float(args_raw))
                elif cmd == "press":
                    page.keyboard.press(args_raw)
                elif cmd == "screenshot":
                    page.screenshot(path=f"tests/recordings/{args_raw or 'screenshot'}.png")
                
                # Small delay between steps for visual recording
                time.sleep(0.5)
                
            # Keep open for a moment at the end
            time.sleep(1)
            
        except Exception as e:
            print(f"Error: {e}")
        finally:
            video_path = page.video.path()
            context.close()
            browser.close()
            
            # Get video path and rename it
            if output_name:
                output_path = os.path.join("tests", "recordings", output_name)
                if os.path.exists(video_path):
                    if os.path.exists(output_path):
                        os.remove(output_path)
                    os.rename(video_path, output_path)
                    print(f"Recording saved: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True)
    parser.add_argument("--steps", default="")
    parser.add_argument("--output", default="recording.webm")
    args = parser.parse_args()
    
    run_recorder(args.url, args.steps, args.output)

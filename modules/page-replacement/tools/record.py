# -*- coding: utf-8 -*-
"""用 Playwright 录制整段动画，输出 WebM。"""
import os, sys, time, glob, shutil
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", r"E:\projects\douyin-scraper\ms-playwright")
from playwright.sync_api import sync_playwright

OUT = r"E:\projects\os-page-replacement\video"
os.makedirs(OUT, exist_ok=True)
for f in glob.glob(os.path.join(OUT, "*.webm")):
    os.remove(f)

URL = "file:///E:/projects/os-page-replacement/index.html?record=1"

with sync_playwright() as p:
    b = p.chromium.launch(args=["--hide-scrollbars", "--force-color-profile=srgb"])
    ctx = b.new_context(
        viewport={"width": 1600, "height": 900},
        record_video_dir=OUT,
        record_video_size={"width": 1600, "height": 900},
        device_scale_factor=1,
    )
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(URL, wait_until="load")
    t0 = time.time()
    pg.wait_for_function("window.__DONE === true", timeout=900000)
    print("done in %.1fs" % (time.time() - t0))
    pg.wait_for_timeout(1500)
    ctx.close()
    b.close()

print("errors:", errs)
files = glob.glob(os.path.join(OUT, "*.webm"))
print(files)

# -*- coding: utf-8 -*-
"""按 beat 截屏，用于检查动画画面。"""
import os, sys, time
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", r"E:\projects\douyin-scraper\ms-playwright")
from playwright.sync_api import sync_playwright

BASE = "file:///E:/projects/os-page-replacement/index.html"
OUT = r"E:\projects\os-page-replacement\tools\shots"
os.makedirs(OUT, exist_ok=True)

beats = [int(x) for x in sys.argv[1:]] or [0, 2, 5, 12, 14, 25, 34, 41, 49]

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1600, "height": 900}, device_scale_factor=1)
    for n in beats:
        pg.goto(f"{BASE}?beat={n}", wait_until="load")
        pg.wait_for_timeout(2600)
        path = os.path.join(OUT, f"beat{n:02d}.png")
        pg.screenshot(path=path)
        print("ok", path)
    b.close()

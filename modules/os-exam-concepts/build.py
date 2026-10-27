# -*- coding: utf-8 -*-
"""把 src 下的模板、样式、内容、交互合并成单个自包含 HTML。"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

shell = (SRC / "shell.html").read_text(encoding="utf-8")
css = (SRC / "style.css").read_text(encoding="utf-8")
content = "\n".join(p.read_text(encoding="utf-8") for p in sorted(SRC.glob("content*.js")))
app = (SRC / "app.js").read_text(encoding="utf-8")

html = (
    shell.replace("@@CSS@@", css)
    .replace("@@CONTENT@@", content)
    .replace("@@APP@@", app)
)
out = ROOT / "index.html"
out.write_text(html, encoding="utf-8")
print(f"built {out}  ({len(html):,} chars)")

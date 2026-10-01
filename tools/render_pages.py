# Renders pages of the main transcript PDF to PNG so they can be read visually.
# The transcript uses the "AAA GoldenLotus" font, so text extraction is garbled.
# Usage: python render_pages.py 296 330   (inclusive page range, 1-based)
#        python render_pages.py 2 40 "<file name in المصادر>"   (another transcript, e.g. الطهارة والحيض)
import os
import sys

import pymupdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_NAME = sys.argv[3] if len(sys.argv) > 3 else "10-كتاب النكاح إلى كتاب العتق.pdf"
SRC = os.path.join(ROOT, "المصادر", SRC_NAME)
OUT = os.path.join(ROOT, "tools", "pages")

start, end = int(sys.argv[1]), int(sys.argv[2])
os.makedirs(OUT, exist_ok=True)
doc = pymupdf.open(SRC)
for i in range(start - 1, min(end, len(doc))):
    doc[i].get_pixmap(dpi=100).save(os.path.join(OUT, f"p{i + 1:03d}.png"))
print(f"rendered {start}-{end} -> {OUT}")

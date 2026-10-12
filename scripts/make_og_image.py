"""Regenerate og-image-square.png and og-image-large.png (same layout as sidenote / pdf-tools).

Requires Pillow and a Japanese-capable TrueType font (Meiryo on Windows).
Run: python scripts/make_og_image.py"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

FONT_PATH = r"C:\Windows\Fonts\meiryo.ttc"
FONT_BOLD_PATH = r"C:\Windows\Fonts\meiryob.ttc"
OUT_DIR = Path(__file__).resolve().parent.parent

TITLE = "RelaGrid"
DESC_LINES = ["グリッドに置いて、", "矢印でつなぐ。"]
SUB_LINE = "関係図をブラウザだけで。Xに投稿しやすい縦画像も"
SQUARE_LINES = ["関係図", "エディタ"]
URL = "minnanosaiban.github.io/relagrid"

BG = "#fafafa"
TEXT = "#0a0a0a"
MUTED = "#4d4d4d"
BORDER = "#e5e5e5"
BODY_BG = "#f2f2f2"
LINE = "#eceef1"
LINE_STRONG = "#d7dade"
STAMP = "#b93226"


def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD_PATH if bold else FONT_PATH, size, index=0)


def bar(d, x, y, w, h, color=LINE, radius=None):
    d.rounded_rectangle([x, y, x + w, y + h], radius=radius if radius is not None else h / 2, fill=color)


def browser_frame(img):
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = 664, 146, 1144, 486
    d.rounded_rectangle([x0, y0, x1, y1], radius=18, fill="#ffffff", outline=BORDER, width=1)
    d.rounded_rectangle([x0, y0, x1, y0 + 46], radius=18, fill="#f3f3f3")
    d.rectangle([x0, y0 + 28, x1, y0 + 46], fill="#f3f3f3")
    d.line([x0, y0 + 46, x1, y0 + 46], fill=BORDER, width=1)
    for i, c in enumerate(("#ff5f57", "#ffbd2e", "#28c840")):
        cx = x0 + 24 + i * 20
        d.ellipse([cx - 6, y0 + 17, cx + 6, y0 + 29], fill=c)
    d.rounded_rectangle([x0 + 92, y0 + 12, x1 - 24, y0 + 34], radius=11, fill="#ffffff", outline=BORDER, width=1)
    d.text((x0 + 106, y0 + 16), URL, font=font(13), fill="#71717a")
    d.rectangle([x0 + 1, y0 + 47, x1 - 1, y1 - 1], fill=BODY_BG)
    return d, (x0, y0, x1, y1)


NODE_COLORS = ("#2563eb", "#475569", "#ea580c")


def arrow(d, p, q, color="#475569", r=26):
    import math
    ang = math.atan2(q[1] - p[1], q[0] - p[0])
    a = (p[0] + math.cos(ang) * r, p[1] + math.sin(ang) * r)
    b = (q[0] - math.cos(ang) * (r + 4), q[1] - math.sin(ang) * (r + 4))
    d.line([a, b], fill=color, width=3)
    for s in (2.6, -2.6):
        d.line([b, (b[0] - math.cos(ang + s * 0.2) * 14, b[1] - math.sin(ang + s * 0.2) * 14)], fill=color, width=3)


def node(d, c, color, label_w):
    r = 26
    d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill="#ffffff", outline=color, width=4)
    d.ellipse([c[0] - 8, c[1] - 8, c[0] + 8, c[1] + 8], fill=color)
    bar(d, c[0] - label_w / 2, c[1] + r + 10, label_w, 10, LINE_STRONG)


def draw_mock(img):
    d, (x0, y0, x1, y1) = browser_frame(img)
    # グリッドの目盛り（薄い点）
    for gx in range(x0 + 40, x1 - 20, 40):
        for gy in range(y0 + 70, y1 - 20, 40):
            d.ellipse([gx - 1, gy - 1, gx + 1, gy + 1], fill="#d7dade")
    a, b, c, e = (x0 + 100, y0 + 150), (x0 + 240, y0 + 110), (x0 + 380, y0 + 150), (x0 + 240, y0 + 250)
    # 点線の囲み（グループ）
    d.rounded_rectangle([x0 + 40, y0 + 205, x0 + 440, y0 + 295], radius=14, outline="#2563eb", width=2)
    arrow(d, a, b); arrow(d, b, c); arrow(d, a, e, "#ea580c"); arrow(d, e, c, "#ea580c")
    node(d, a, NODE_COLORS[0], 56); node(d, b, NODE_COLORS[1], 48)
    node(d, c, NODE_COLORS[2], 56); node(d, e, NODE_COLORS[0], 44)


def make_large():
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)

    title_font = font(46, bold=True)
    tb = d.textbbox((0, 0), TITLE, font=title_font)
    desc_font, sub_font = font(26), font(16)
    line_h = 42
    total = (tb[3] - tb[1]) + 28 + line_h * len(DESC_LINES) + 26
    top = (h - total) / 2
    d.text((72, top - tb[1]), TITLE, font=title_font, fill=TEXT)
    ty = top + (tb[3] - tb[1]) + 28
    for t in DESC_LINES:
        d.text((72, ty), t, font=desc_font, fill=MUTED)
        ty += line_h
    d.text((72, ty + 8), SUB_LINE, font=sub_font, fill="#71717a")

    draw_mock(img)
    img.save(OUT_DIR / "og-image-large.png")


def make_square():
    size = 630
    pad_x = 34
    line1, line2 = SQUARE_LINES
    scratch = ImageDraw.Draw(Image.new("RGB", (10, 10)))
    avail_w = size - 2 * pad_x
    font_size = 260
    while font_size > 10:
        f = font(font_size)
        b1 = scratch.textbbox((0, 0), line1, font=f)
        b2 = scratch.textbbox((0, 0), line2, font=f)
        if max(b1[2] - b1[0], b2[2] - b2[0]) <= avail_w:
            break
        font_size -= 2
    h1, h2 = b1[3] - b1[1], b2[3] - b2[1]
    gap = round(font_size * 0.35)
    top = (size - (h1 + h2 + gap)) / 2

    img = Image.new("RGB", (size, size), "#000000")
    d = ImageDraw.Draw(img)
    d.text(((size - (b1[2] - b1[0])) / 2 - b1[0], top - b1[1]), line1, font=f, fill="#ffffff")
    d.text(((size - (b2[2] - b2[0])) / 2 - b2[0], top + h1 + gap - b2[1]), line2, font=f, fill="#ffffff")
    img.save(OUT_DIR / "og-image-square.png")


if __name__ == "__main__":
    make_square()
    make_large()
    print("wrote", OUT_DIR / "og-image-square.png")
    print("wrote", OUT_DIR / "og-image-large.png")

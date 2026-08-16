from pathlib import Path
import hashlib

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "logos"
OUT.mkdir(parents=True, exist_ok=True)

SIZE = 256
PALETTES = [
    ((20, 32, 56), (38, 90, 160), (235, 242, 255)),
    ((34, 22, 50), (118, 72, 180), (247, 240, 255)),
    ((20, 44, 38), (59, 153, 125), (232, 252, 247)),
    ((55, 24, 26), (201, 77, 86), (255, 240, 242)),
    ((53, 40, 15), (214, 168, 58), (255, 249, 230)),
    ((17, 34, 53), (72, 174, 218), (236, 250, 255)),
]

FALLBACKS = {
    "socalmagic": ("SOCAL", "MAGIC"),
    "tweedy-cards-and-gaming": ("TWEEDY", "CARDS"),
    "shadow-realm-collectibles": ("SHADOW", "REALM"),
    "alakazam-comics": ("ALAKAZAM", "COMICS"),
    "grails-gone-wild": ("GRAILS", "WILD"),
    "lost-planet": ("LOST", "PLANET"),
    "the-game-chest-del-amo-fashion-center": ("GAME", "CHEST"),
    "card-arena": ("CARD", "ARENA"),
    "the-game-chest-promenade-on-the-peninsula": ("GAME", "CHEST"),
    "b-y-o-games-llc": ("B.Y.O", "GAMES"),
    "lvlup-gaming-tcg": ("LVLUP", "TCG"),
    "the-crimson-guild-south-el-monte": ("CRIMSON", "GUILD"),
    "aki-collectibles": ("AKI", "COLLECT"),
    "the-game-chest-irvine": ("GAME", "CHEST"),
    "alamo-drafthouse-cinema-downtown-los-angeles": ("ALAMO", "DRAFT"),
    "the-game-cellar": ("GAME", "CELLAR"),
    "the-bullpen-2-0": ("BULLPEN", "2.0"),
    "it-s-gametime": ("GAME", "TIME"),
    "a-and-n-collectibles": ("A&N", "COLLECT"),
    "paper-heros-hb": ("PAPER", "HERO"),
}


def load_font(size: int):
    for name in ("arialbd.ttf", "Arial Bold.ttf", "arial.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()


def palette_for(key: str):
    digest = hashlib.sha256(key.encode("utf-8")).digest()[0]
    return PALETTES[digest % len(PALETTES)]


def fit_font(draw: ImageDraw.ImageDraw, lines, max_width, start_size):
    size = start_size
    while size >= 24:
        font = load_font(size)
        widths = [draw.textbbox((0, 0), line, font=font)[2] for line in lines]
        if max(widths) <= max_width:
            return font
        size -= 2
    return load_font(24)


def make_icon(key: str, line1: str, line2: str):
    bg, accent, text = palette_for(key)
    img = Image.new("RGBA", (SIZE, SIZE), bg + (255,))
    draw = ImageDraw.Draw(img)

    # Full-bleed badge look: subtle diagonal wash plus a crisp border.
    draw.rounded_rectangle((8, 8, SIZE - 9, SIZE - 9), radius=40, outline=(accent[0], accent[1], accent[2], 140), width=2)
    draw.polygon([(0, 0), (SIZE * 0.75, 0), (SIZE * 0.2, SIZE)], fill=(accent[0], accent[1], accent[2], 24))
    draw.polygon([(SIZE, SIZE), (SIZE * 0.25, SIZE), (SIZE * 0.8, 0)], fill=(255, 255, 255, 10))

    lines = [line1, line2]
    font = fit_font(draw, lines, SIZE - 40, 52)
    small = load_font(15)

    y = 84
    for idx, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        width = bbox[2] - bbox[0]
        draw.text(((SIZE - width) / 2, y + idx * 54), line, font=font, fill=text + (255,))

    draw.line((42, 68, SIZE - 42, 68), fill=(accent[0], accent[1], accent[2], 120), width=2)
    draw.text((26, 26), "PLACE", font=small, fill=(text[0], text[1], text[2], 140))
    img.save(OUT / f"{key}-icon.png")


for store_id, (line1, line2) in FALLBACKS.items():
    make_icon(store_id, line1, line2)

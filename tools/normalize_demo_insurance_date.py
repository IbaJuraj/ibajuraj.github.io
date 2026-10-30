"""Correct one provably inconsistent DEMO date, leave all card/insurance content fictional.
Run against exact accepted public WebP bytes only. No personal source media.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
from hashlib import sha256
import json
from datetime import date, timedelta

path = Path("assets/screenshots/strazca-terminov-2.webp")
expected = "58a5df44dffde09b6b6b35e5d7aa747ef4b8fb3c78cd9b6121c2bd592eeb44f3"
assert sha256(path.read_bytes()).hexdigest() == expected, "Screenshot changed; no uncontrolled edit"
assert date(2026,10,22) + timedelta(days=214) == date(2027,5,24)
image = Image.open(path).convert("RGB")
assert image.size == (820, 1773), image.size
draw = ImageDraw.Draw(image)
draw.rectangle((318,600,488,640), fill=(254,254,254))
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
draw.text((329,602), "24.5.2027.", font=font, fill=(137,137,137))
image.save(path, "WEBP", quality=85, method=6)
manifest_file = Path("assets/screenshots/manifest.json")
manifest=json.loads(manifest_file.read_text(encoding="utf-8"))
entry=manifest["apps"]["strazca-terminov"]
assert entry["screenshots"][1] == str(path)
assert entry["sha256"][1] == expected
entry["sha256"][1] = sha256(path.read_bytes()).hexdigest()
manifest_file.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Demo-only date normalized; new SHA256",entry["sha256"][1])

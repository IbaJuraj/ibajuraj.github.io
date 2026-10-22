#!/usr/bin/env python3
"""One-time, fail-closed import for OWN exact public Apple App Store apps.
No images are imported or claimed if any of the four lookups lacks valid screenshots.
This runs only on an isolated feature branch; NEVER on main and does not publish.
"""
import io
import json
import re
from pathlib import Path
from urllib.parse import urlparse
import requests
from PIL import Image

APPS = {
    "strazca-terminov": 6779741336,
    "lexdrive": 6794546464,
    "jurajcalc": 6777232702,
    "penazenka-kariet": 6779166726,
}
DIRECTORY = Path("assets/screenshots")
DIRECTORY.mkdir(parents=True, exist_ok=True)
session = requests.Session()
session.headers.update({"User-Agent": "IbaJurajApps-WebsiteAssets/1.0"})
all_entries = {}
pending = []
images = {}

for slug, app_id in APPS.items():
    response = session.get("https://itunes.apple.com/lookup",
        params={"id": app_id, "country": "sk", "entity": "software"}, timeout=24)
    response.raise_for_status()
    records = response.json().get("results", [])
    matches = [x for x in records
        if x.get("trackId") == app_id
        and x.get("artistName", "").strip().casefold() == "juraj spevar"]
    if len(matches) != 1:
        pending.append(f"{slug}: app ID/developer could not be verified")
        continue
    item = matches[0]
    urls = item.get("screenshotUrls") or []
    if not urls:
        pending.append(f"{slug}: Apple's lookup did not provide iPhone screenshots")
        continue
    files = []
    for index, url in enumerate(urls[:2], 1):
        host = (urlparse(url).hostname or "").lower()
        if not url.startswith("https://") or not (host == "mzstatic.com" or host.endswith(".mzstatic.com")):
            pending.append(f"{slug}: untrusted screenshot origin")
            files = []
            break
        raw = session.get(url, timeout=25)
        raw.raise_for_status()
        if len(raw.content) > 14_000_000:
            pending.append(f"{slug}: oversized media")
            files = []
            break
        image = Image.open(io.BytesIO(raw.content))
        image.load()
        if image.width < 280 or image.height <= image.width * 1.35:
            pending.append(f"{slug}: unexpected screenshot geometry")
            files = []
            break
        image.thumbnail((520, 1140), Image.Resampling.LANCZOS)
        target = DIRECTORY / f"{slug}-{index}.webp"
        buffer = io.BytesIO()
        image.convert("RGB").save(buffer, format="WEBP", quality=76, method=6)
        images[str(target)] = buffer.getvalue()
        files.append(str(target).replace("\\", "/"))
    if files:
        all_entries[slug] = {"appStoreId": app_id, "screenshots": files}

if pending or len(all_entries) != 4:
    print("IMPORT PENDING. No screenshots or manifest were committed.")
    for issue in pending:
        print("PENDING:", issue)
    raise SystemExit(2)

for path, blob in images.items():
    Path(path).write_bytes(blob)
manifest = {
    "schemaVersion": 1,
    "publisher": "Juraj Spevar",
    "source": "Apple iTunes Lookup API (country=sk); verified app ID and artistName; Apple mzstatic CDN",
    "apps": all_entries,
}
(DIRECTORY / "manifest.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)
print("Verified imported screenshots:", {k: len(v["screenshots"]) for k, v in all_entries.items()})

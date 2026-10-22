#!/usr/bin/env python3
"""Generate small verified Apple-owned screenshot URL manifest. No binary downloads."""
import json
import urllib.parse
from pathlib import Path
import requests

APPS = {
    "strazca-terminov": 6779741336,
    "lexdrive": 6794546464,
    "jurajcalc": 6777232702,
    "penazenka-kariet": 6779166726,
}
session=requests.Session()
session.headers.update({"User-Agent":"IbaJurajApps-OfficialStoreGallery/1.0"})
apps={}
issues=[]
for slug,app_id in APPS.items():
    response=session.get("https://itunes.apple.com/lookup", params={"id":app_id,"country":"sk","entity":"software"}, timeout=14)
    response.raise_for_status()
    matches=[v for v in response.json().get("results",[])
        if v.get("trackId")==app_id and v.get("artistName","").strip().casefold()=="juraj spevar"]
    if len(matches)!=1:
        issues.append(f"{slug}: App Store ID/developer mismatch")
        continue
    urls=matches[0].get("screenshotUrls") or []
    verified=[]
    for url in urls[:2]:
        parsed=urllib.parse.urlparse(url)
        hostname=(parsed.hostname or "").lower()
        if parsed.scheme!="https" or not (hostname=="mzstatic.com" or hostname.endswith(".mzstatic.com")):
            issues.append(f"{slug}: screenshot host mismatch")
            verified=[]
            break
        verified.append(url)
    if len(verified)!=2:
        issues.append(f"{slug}: missing original iPhone screenshots")
    else:
        apps[slug]={"appStoreId":app_id,"screenshots":verified}
if issues or len(apps)!=4:
    print("VERIFIED APPLE GALLERY PENDING; did not create an incomplete manifest.")
    for issue in issues: print("PENDING:", issue)
    raise SystemExit(2)
folder=Path("assets/screenshots");folder.mkdir(parents=True,exist_ok=True)
file=folder/"manifest.json"
file.write_text(json.dumps({
    "schemaVersion":1,
    "publisher":"Juraj Spevar",
    "source":"Apple iTunes Lookup API country=sk; verified trackId, artistName and mzstatic.com image host",
    "apps":apps
},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("PASS: official App Store ID/developer, 2 native screenshots each, 4 apps.")

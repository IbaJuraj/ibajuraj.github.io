#!/usr/bin/env python3
"""Read published App Store metadata; never access App Store Connect or user data."""
import hashlib, json, re, sys, time
from pathlib import Path
from datetime import datetime
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "assets/appstore"
LIMIT = 10 * 1024 * 1024

def read(url, limit=LIMIT, host=None):
    req = Request(url, headers={"User-Agent":"IbaJurajAppsWebsite/1.0", "Accept":"*/*"})
    with urlopen(req, timeout=25) as response:
        if host and not host(urlsplit(response.geturl())):
            raise ValueError("Unexpected redirect")
        blob = response.read(limit+1)
        if len(blob)>limit:
            raise ValueError("Response too large")
        return blob

def apple_image(p):
    return p.scheme == "https" and p.hostname and p.hostname.endswith(".mzstatic.com") and not p.username and not p.password

def text_field(value, limit):
    return value[:limit] if isinstance(value,str) else ""

def entry_from(row, previous, image_paths):
    version=text_field(row.get("version"),80).strip()
    date=text_field(row.get("currentVersionReleaseDate"),64)
    if not version or not re.fullmatch(r"[0-9A-Za-z.+_-]+",version) or not re.match(r"^\d{4}-\d{2}-\d{2}T",date):
        raise ValueError("Invalid release")
    release_date=datetime.fromisoformat(date.replace("Z","+00:00"))
    if previous.get("date") and release_date < datetime.fromisoformat(previous["date"].replace("Z","+00:00")):
        raise ValueError("Stale release response")
    notes=text_field(row.get("releaseNotes"),30000)
    history={x["version"]:x for x in previous.get("history",[]) if isinstance(x,dict) and "version" in x}
    # Preserve prior releases and notes if Apple omits them.
    if not notes and version in history:
        notes=history[version].get("notes","")
    history[version]={"version":version,"date":date,"notes":notes}
    return {"version":version,"date":date,"notes":notes,
            "description":text_field(row.get("description"),30000) or previous.get("description",""),
            "minOS":text_field(row.get("minimumOsVersion"),40),
            "images":image_paths,
            "history":sorted(history.values(),key=lambda x:x.get("date",""),reverse=True)}

def screenshots(row,slug,lang,previous):
    urls=row.get("screenshotUrls")
    if not isinstance(urls,list) or not urls:
        return previous.get("images",[])
    result=[]
    for i,url in enumerate(urls[:8]):
        if not isinstance(url,str) or not apple_image(urlsplit(url)) or re.search(r"/320x480",url):
            continue
        digest=hashlib.sha256(url.encode()).hexdigest()[:12]
        directory=BASE/"media"/slug
        prefix=f"{lang}-{i}-{digest}"
        found=next((p for p in directory.glob(prefix+".*") if p.suffix in (".jpg",".png",".webp")),None)
        if found:
            result.append(found.relative_to(ROOT).as_posix());continue
        try:
            blob=read(url,host=apple_image)
            suffix=".jpg" if blob.startswith(b"\xff\xd8\xff") else ".png" if blob.startswith(b"\x89PNG\r\n\x1a\n") else ".webp" if blob[:4]==b"RIFF" and blob[8:12]==b"WEBP" else ""
            if not suffix or len(blob)<12000:raise ValueError("Invalid screenshot")
            directory.mkdir(parents=True,exist_ok=True)
            path=directory/(prefix+suffix);path.write_bytes(blob)
            result.append(path.relative_to(ROOT).as_posix())
        except Exception as exc:
            print("Screenshot unavailable",slug,lang,i,type(exc).__name__,file=sys.stderr)
    return result or previous.get("images",[])

def main():
    cfg=json.loads((BASE/"config.json").read_text())
    output=BASE/"catalog.json"
    cache=json.loads(output.read_text())
    assert cache["schemaVersion"]==1
    ids={a["id"]:a for a in cfg["apps"]}
    seen=0
    for lang,country in cfg["storefronts"].items():
        try:
            url="https://itunes.apple.com/lookup?"+urlencode({"id":",".join(map(str,ids)),"country":country,"entity":"software"})
            data=json.loads(read(url,host=lambda p:p.scheme=="https" and p.hostname=="itunes.apple.com"))
            for row in data.get("results",[]):
                app=ids.get(row.get("trackId"))
                if not app:continue
                slug=app["slug"]
                entry=cache["apps"].setdefault(slug,{"id":app["id"],"name":app["name"],"locales":{}})
                if entry["id"]!=app["id"]:raise ValueError("App ID mismatch")
                previous=entry["locales"].get(lang,{})
                try:
                    candidate=entry_from(row,previous,previous.get("images",[]))
                    candidate["images"]=screenshots(row,slug,lang,previous)
                    entry["locales"][lang]=candidate
                    seen+=1
                except Exception as exc:
                    print("App entry unavailable; retaining cache:",slug,lang,type(exc).__name__,file=sys.stderr)
        except Exception as exc:
            print("Storefront unavailable; retaining cache:",country,type(exc).__name__,file=sys.stderr)
        time.sleep(3)
    if not seen:
        print("No live metadata returned; retaining all existing data",file=sys.stderr)
        return
    tmp=output.with_suffix(".tmp")
    tmp.write_text(json.dumps(cache,ensure_ascii=False,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    tmp.replace(output)
    print(f"Verified app/storefront results: {seen}")

if __name__=="__main__":
    main()

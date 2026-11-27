#!/usr/bin/env python3
import json, unittest
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
from sync_appstore import entry_from, apple_image
ROOT=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
    def __init__(self):super().__init__();self.refs=[]
    def handle_starttag(self,tag,attrs):
        self.refs.extend(v for k,v in attrs if k in ("src","href") and v)
class Tests(unittest.TestCase):
    def test_links(self):
        for path in ROOT.rglob("*.html"):
            p=Links();p.feed(path.read_text(encoding="utf-8"))
            for value in p.refs:
                u=urlsplit(value)
                if u.scheme or u.netloc or not u.path:continue
                target=(ROOT/u.path.lstrip("/")) if u.path.startswith("/") else (path.parent/u.path)
                if target.is_dir():target=target/"index.html"
                self.assertTrue(target.exists(),(path,value))
    def test_catalog(self):
        cfg=json.loads((ROOT/"assets/appstore/config.json").read_text())
        self.assertEqual({a["id"] for a in cfg["apps"]},{6779741336,6794546464,6777232702,6779166726})
        self.assertEqual(set(cfg["storefronts"]),{"sk","cs","en","de","pl","hu"})
        home=(ROOT/"index.html").read_text()
        self.assertNotIn('data-gallery=',home)
        for app in cfg["apps"]:
            slug=app["slug"]
            self.assertIn("/apps/"+slug+"/",home)
            self.assertTrue((ROOT/"apps"/slug/"index.html").is_file())
        cache=json.loads((ROOT/"assets/appstore/catalog.json").read_text())
        for slug,app in cache["apps"].items():
            self.assertEqual(app["id"],next(a["id"] for a in cfg["apps"] if a["slug"]==slug))
            for data in app["locales"].values():
                for path in data["images"]:
                    self.assertTrue((ROOT/path).is_file(),path)
    def test_history(self):
        first=entry_from({"version":"1.0","currentVersionReleaseDate":"2026-01-01T00:00:00Z","releaseNotes":"First"},{},[])
        second=entry_from({"version":"1.1","currentVersionReleaseDate":"2026-02-01T00:00:00Z","releaseNotes":"Second"},first,[])
        self.assertEqual([x["version"] for x in second["history"]],["1.1","1.0"])
        again=entry_from({"version":"1.1","currentVersionReleaseDate":"2026-02-01T00:00:00Z"},second,[])
        self.assertEqual(again["notes"],"Second")
        self.assertEqual(len(again["history"]),2)
        with self.assertRaises(ValueError):
            entry_from({"version":"1.0","currentVersionReleaseDate":"2026-01-01T00:00:00Z"},again,[])
    def test_privacy_web_disclosure(self):
        self.assertIn("Verejné informácie o aplikáciách", (ROOT/"privacy.html").read_text())
        for lang in ("cs","en","de","pl","hu"):
            data=json.loads((ROOT/f"locales/privacy-{lang}.json").read_text())
            self.assertEqual(len(data["cards"]["web"]["paragraphs"]),3)
            self.assertIn("Apple",data["cards"]["web"]["paragraphs"][2])
    def test_media_host(self):
        self.assertTrue(apple_image(urlsplit("https://is1-ssl.mzstatic.com/a.jpg")))
        self.assertFalse(apple_image(urlsplit("https://mzstatic.com.evil.example/a.jpg")))
        self.assertFalse(apple_image(urlsplit("http://is1-ssl.mzstatic.com/a.jpg")))
    def test_locales(self):
        for lang in ("cs","en","de","pl","hu"):
            data=json.loads((ROOT/f"locales/{lang}.json").read_text())
            for key in ("Najnovšie aktualizácie","História aktualizácií","Centrum podpory","Ukážky aplikácie"):
                self.assertTrue(data["strings"].get(key),(lang,key))
if __name__=="__main__":unittest.main()

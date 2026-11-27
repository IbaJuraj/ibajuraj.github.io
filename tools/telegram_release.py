#!/usr/bin/env python3
"""Publish a verified Slovak App Store release, with a durable pre-send reservation."""
import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from urllib.request import Request, build_opener, HTTPRedirectHandler

ROOT = Path(__file__).resolve().parents[1]
STATE = ROOT / ".github/telegram-release-state.json"
CATALOG = ROOT / "assets/appstore/catalog.json"
# Explicit pilot allowlist. Other apps are never selected.
APPS = {"strazca-terminov": (6779741336, "Strážca Termínov")}
BASELINE = {"version": "1.61.0", "date": "2026-10-08T15:10:35Z"}

def timestamp(value):
    dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        raise ValueError("Missing timezone")
    return dt

def version_key(value):
    if not re.fullmatch(r"\d+(?:\.\d+){1,3}", value):
        raise ValueError("Invalid release version")
    parts = tuple(map(int, value.split(".")))
    return parts + (0,) * (4 - len(parts))

def candidate(catalog, state, slug):
    app_id, name = APPS[slug]
    if state["schemaVersion"] != 1 or catalog["schemaVersion"] != 1:
        raise ValueError("Unsupported schema")
    record = state["apps"][slug]
    if record["pending"] is not None:
        raise ValueError("Unresolved delivery reservation; inspect channel before retry")
    last = record["last"]
    if version_key(last["version"]) < version_key(BASELINE["version"]) or timestamp(last["date"]) < timestamp(BASELINE["date"]):
        raise ValueError("Invalid release baseline")
    app = catalog["apps"].get(slug, {})
    if app.get("id") != app_id:
        raise ValueError("Missing or mismatched App Store ID")
    release = app.get("locales", {}).get("sk")
    if not release:
        raise ValueError("Slovak storefront unavailable")
    version, date = release["version"], release["date"]
    if version_key(version) <= version_key(last["version"]) or timestamp(date) <= timestamp(last["date"]):
        return None
    notes = release.get("notes")
    if not isinstance(notes, str) or not notes.strip():
        raise ValueError("Missing release notes; no notification sent")
    text = f"{name} {version}\n\n{notes}"
    if len(text.encode("utf-16-le")) // 2 > 4096:
        raise ValueError("Release notes exceed Telegram message limit")
    return {"version": version, "date": date}, text

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def credentials(chat_var):
    token, chat = os.environ.get("TELEGRAM_RELEASE_BOT_TOKEN", ""), os.environ.get(chat_var, "")
    if not re.fullmatch(r"\d+:[A-Za-z0-9_-]+", token) or not re.fullmatch(r"(?:-?\d+|@[A-Za-z0-9_]+)", chat):
        raise ValueError("Telegram credentials missing or invalid")
    return token, chat

def api(token, method, payload):
    req = Request("https://api.telegram.org/bot" + token + "/" + method,
                  data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
                  headers={"Content-Type": "application/json"}, method="POST")
    try:
        with build_opener(NoRedirect()).open(req, timeout=25) as response:
            result = json.loads(response.read(262145))
        if result.get("ok") is not True or not isinstance(result.get("result"), dict):
            raise ValueError("Invalid Telegram response")
        return result["result"]
    except Exception:
        # Exceptions can contain a URL with the bot token. Never log them.
        raise RuntimeError("Telegram request failed or delivery is uncertain") from None

def send(token, chat, text):
    result = api(token, "sendMessage", {"chat_id": chat, "text": text,
                 "link_preview_options": {"is_disabled": True}})
    if not isinstance(result.get("message_id"), int):
        raise RuntimeError("Telegram delivery confirmation missing")
    return result["message_id"]

def git(*args):
    subprocess.run(["git", *args], cwd=ROOT, check=True)

def persist(state, message):
    tmp = STATE.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(STATE)
    git("add", str(STATE.relative_to(ROOT)))
    git("commit", "-m", message)
    # No force and no retry. A racing update must stop before sending.
    git("push", "origin", "HEAD:main")

def deliver(state, slug, release, text, persist_fn, send_fn):
    record = state["apps"][slug]
    record["pending"] = release.copy()
    persist_fn(state, "Reserve Telegram release notification")
    send_fn(text)
    record["last"] = release.copy()
    record["pending"] = None
    persist_fn(state, "Confirm Telegram release notification")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["preview", "publish", "private-test"], default="preview")
    args = parser.parse_args()
    if args.mode == "private-test":
        token, chat = credentials("TELEGRAM_TEST_CHAT_ID")
        if not re.fullmatch(r"-?\d+", chat):
            raise ValueError("Test destination must be a numeric private chat ID")
        info = api(token, "getChat", {"chat_id": chat})
        if info.get("type") != "private" and not (info.get("type") == "channel" and not info.get("username") and not info.get("active_usernames")):
            raise ValueError("Test destination must be a private chat or non-public channel")
        send(token, chat, "Strážca Termínov TEST\n\n• Skúšobná správa – nejde o vydanie aplikácie.")
        print("Private test delivered")
        return
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    state = json.loads(STATE.read_text(encoding="utf-8"))
    for slug in APPS:
        selected = candidate(catalog, state, slug)
        if selected is None:
            print(f"{slug}: no newer release")
            continue
        release, text = selected
        if args.mode == "preview":
            # Do not echo external release notes to CI logs (workflow-command injection).
            print(f"{slug}: preview only; version {release['version']}; {len(text)} characters")
            continue
        if os.environ.get("ENABLE_TELEGRAM_RELEASES") != "true":
            raise ValueError("Public publishing is disabled")
        token, chat = credentials("TELEGRAM_RELEASE_CHAT_ID")
        info = api(token, "getChat", {"chat_id": chat})
        if info.get("type") != "channel":
            raise ValueError("Production destination must be a channel")
        deliver(state, slug, release, text, persist, lambda message: send(token, chat, message))
        print(f"{slug}: delivery confirmed")

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        # Do not print arbitrary exception contents or remote data.
        print(f"Telegram release step stopped ({type(exc).__name__}); inspect state and configuration", file=sys.stderr)
        sys.exit(1)

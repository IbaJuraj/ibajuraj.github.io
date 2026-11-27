import copy
import unittest
from telegram_release import candidate, deliver, BASELINE

SLUG = "strazca-terminov"
NEW = {"version": "1.62.0", "date": "2026-11-28T12:00:00Z", "notes": "• Tachometer\n• Kniha jázd"}
def state():
    return {"schemaVersion": 1, "apps": {SLUG: {"last": BASELINE.copy(), "pending": None}}}
def catalog(release=NEW):
    return {"schemaVersion": 1, "apps": {SLUG: {"id": 6779741336, "locales": {"sk": release.copy()}},
            "lexdrive": {"id": 6794546464, "locales": {"sk": NEW.copy()}}}}

class Tests(unittest.TestCase):
    def test_format(self):
        release, text = candidate(catalog(), state(), SLUG)
        self.assertEqual(text, "Strážca Termínov 1.62.0\n\n• Tachometer\n• Kniha jázd")
        self.assertEqual(release["version"], "1.62.0")
    def test_baseline_and_rollback(self):
        self.assertIsNone(candidate(catalog(dict(BASELINE, notes="old")), state(), SLUG))
        self.assertIsNone(candidate(catalog(dict(NEW, version="1.60.0")), state(), SLUG))
        self.assertIsNone(candidate(catalog(dict(NEW, date=BASELINE["date"])), state(), SLUG))
    def test_missing_notes_and_limit(self):
        for notes in ("", " ", "x" * 4097):
            with self.assertRaises(ValueError):
                candidate(catalog(dict(NEW, notes=notes)), state(), SLUG)
    def test_no_locale_fallback(self):
        data = catalog()
        data["apps"][SLUG]["locales"] = {"cs": NEW}
        with self.assertRaises(ValueError):
            candidate(data, state(), SLUG)
    def test_id(self):
        data = catalog()
        data["apps"][SLUG]["id"] = 0
        with self.assertRaises(ValueError):
            candidate(data, state(), SLUG)
    def test_delivery_and_duplicate(self):
        st, events = state(), []
        release, message = candidate(catalog(), st, SLUG)
        deliver(st, SLUG, release, message, lambda s, m: events.append(copy.deepcopy(s)), lambda t: events.append(t))
        self.assertEqual(events[0]["apps"][SLUG]["pending"], release)
        self.assertEqual(events[1], message)
        self.assertIsNone(events[2]["apps"][SLUG]["pending"])
        self.assertEqual(events[2]["apps"][SLUG]["last"], release)
        self.assertIsNone(candidate(catalog(), st, SLUG))
    def test_failed_reservation_prevents_send(self):
        st, events = state(), []
        release, message = candidate(catalog(), st, SLUG)
        def fail(*args): raise RuntimeError()
        with self.assertRaises(RuntimeError):
            deliver(st, SLUG, release, message, fail, events.append)
        self.assertEqual(events, [])
    def test_ambiguous_send_blocks_retry(self):
        st, durable = state(), []
        release, message = candidate(catalog(), st, SLUG)
        def fail(text): raise RuntimeError()
        with self.assertRaises(RuntimeError):
            deliver(st, SLUG, release, message, lambda s, m: durable.append(copy.deepcopy(s)), fail)
        with self.assertRaises(ValueError):
            candidate(catalog(), durable[-1], SLUG)
    def test_failed_confirmation_blocks_retry(self):
        st, durable = state(), []
        release, message = candidate(catalog(), st, SLUG)
        def persist(s, m):
            if durable: raise RuntimeError()
            durable.append(copy.deepcopy(s))
        with self.assertRaises(RuntimeError):
            deliver(st, SLUG, release, message, persist, lambda t: 42)
        with self.assertRaises(ValueError):
            candidate(catalog(), durable[-1], SLUG)

if __name__ == "__main__":
    unittest.main()

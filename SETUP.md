# Nastavenie a kontrola stránky

Pred každým vydaním webu skontrolujte, že:

1. endpoint Formspree v `index.html` je stále aktívny,
2. pozývací odkaz Telegramu je platný,
3. odkazy na aplikácie smerujú na ich aktuálne stránky v App Store,
4. `standard.json` v autoritatívnom repozitári obsahuje aktuálnu aktívnu verziu Standardu, web nemá ručne nastavenú záložnú verziu a pri chybe používa neutrálny stav,
5. web netvrdí, že všetky aplikácie používajú najnovší Standard, pokiaľ to nie je overené,
6. stránka sa overila aspoň pri šírkach 320, 375, 768, 1024 a 1440 px,
7. funguje klávesnicová navigácia, mobilné menu, kontakt a základné focus stavy.

## Publikovanie

Produkčný GitHub Pages web používa vetvu `main` a koreň repozitára. Zmeny sa pripravujú na samostatnej vetve a do `main` sa dostávajú cez pull request po kontrole.

## Automatická verzia Standardu

Hlavný web používa jediný autoritatívny zdroj `https://raw.githubusercontent.com/IbaJuraj/ibajuraj-application-standard/main/standard.json` (`status: active`, stabilné semver). Verzia sa aktualizuje pri ďalšom načítaní webu, bez osobitnej zmeny webového repozitára.

Markdown README nepodporuje vlastný JavaScript, preto namiesto neaktuálneho čísla používa odkazy na živé metadata. Pri výpadku GitHubu zobrazuje hlavná stránka `—` a odkaz na normatívny dokument z `main`. Pracovné RC sa nesmú vydávať za stable.

Pri zmene webu skontrolovať Telegram kanál `https://t.me/IbaJurajApps`, podporu `https://t.me/+mEtAJXPMUF9mZjI0`, všetkých šesť lokalizácií a originálne App Store ID pri galériách. Nevydávať interné buildy ani TradeBook.

## Screenshot provenance

Manifest `assets/screenshots/manifest.json` vznikol zo skutočného Apple Lookup API pre 4 presné ID a kontrolu `artistName=Juraj Spevar`. Dva iPhone náhľady pre každú aplikáciu používajú originálne URL Apple CDN, nie obrazový generátor. Načítavajú sa len pri otvorení stránky, optimalizovane a s `referrerpolicy=no-referrer`. Pri ďalšej aktualizácii na nové App Store screenshoty treba obnoviť manifest a overiť publikovanú verziu. Jednorazový importný workflow sa po úspechu odstráni; generátor `tools/import_verified_appstore_shots.py` sa ponechá na ručné použitie.

# IbaJuraj Apps

Oficiálna prezentačná a podporná stránka aplikácií IbaJuraj Apps.

## Aplikácie

- Strážca Termínov – dostupný v App Store
- Lex Drive – dostupný v App Store
- Kalkulačka 2v1 – dostupná v App Store
- Peňaženka Kariet – dostupná v App Store

## Obsah repozitára

- `index.html` – hlavná responzívna stránka,
- `style.css` – spoločný desktop, tablet a mobilný dizajn,
- `script.js` – navigácia, podpora kontaktného formulára a dynamické metadata Standardu,
- `privacy.html` – zásady ochrany súkromia,
- `invite.html` – vstupná stránka pozvánok,
- `404.html` – vlastná chybová stránka,
- `assets/` – ikony aplikácií a webu,
- `standard/` – neautoritatívny redirect na samostatný repozitár Standardu.

## IbaJuraj Application Standard

Autoritatívnym zdrojom je samostatný repozitár:
https://github.com/IbaJuraj/ibajuraj-application-standard

Hlavná stránka automaticky načítava iba **aktívnu stabilnú verziu** z [autoritatívneho `standard.json`](https://raw.githubusercontent.com/IbaJuraj/ibajuraj-application-standard/main/standard.json). Číslo verzie ani odkaz na konkrétny tag sa vo webe ručne neudržiavajú. Pri úspešnom načítaní zobrazuje stránka aktuálnu verziu a odkaz na normatívny dokument daného vydania.

Pri nedostupnom GitHube sa zobrazí `—` a odkaz na [dokumentáciu z autoritatívnej vetvy `main`](https://github.com/IbaJuraj/ibajuraj-application-standard/blob/main/IBAJURAJ_APPLICATION_STANDARD.md) namiesto falošne aktuálnej záložnej verzie. GitHub Markdown README nespúšťa JavaScript, preto namiesto ručného čísla odkazuje priamo na dynamické metadáta.

Jednotlivé aplikácie Standard adoptujú vlastným release procesom a nemusia všetky používať rovnakú verziu. Pracovné vydania RC sa nezobrazujú ako stable.

## Odkazy z aplikácií na podporu

Kontaktný formulár podporuje parametre `app`, `type` a nepovinný `subject`.

Príklad:
`https://ibajuraj.github.io/?app=lexdrive&type=technical&subject=Problém%20s%20vyhľadávaním#support`

Stabilné identifikátory aplikácií sú `strazca-terminov`, `lexdrive`, `jurajcalc`, `penazenka-kariet` a `general`. Podporované typy sú `question`, `technical`, `content`, `suggestion`, `privacy` a `other`.

## Publikovanie

Zmeny webu sa pripravujú na samostatnej vetve, skontrolujú sa a následne sa mergujú do `main` cez pull request. GitHub Pages publikuje obsah z koreňa vetvy `main`.

## Podpora

Kontaktný formulár používa Formspree. Telegram komunita je doplnkový komunikačný kanál; citlivé údaje sa nemajú posielať cez verejné komunikačné kanály.

## Minimalistický verejný web

Novinky (Telegram kanál) a podpora (diskusná skupina) sú oddelené. Zverejňujú sa iba štyri App Store aplikácie. Galérie používajú manifest originálnych obrázkov z oficiálneho Apple CDN (`assets/screenshots/manifest.json`), viazaný na štyri presné App Store ID a vývojára. Nepoužívajú náhradné vizuály. Bez manifestu sa nevykresľujú žiadne náhradné screenshoty.

Obrázky galérií sú momentálne poskytované obrazovým serverom Apple; web ich načítava len pri viditeľných náhľadoch, používa `referrerpolicy=no-referrer` a túto skutočnosť uvádza v zásadách súkromia. Pri neskoršom vlastnom bezpečnom lokálnom spracovaní je možné zdroje preniesť do repozitára bez zmeny identity aplikácií.

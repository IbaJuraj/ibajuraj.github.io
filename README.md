# IbaJuraj Apps

Oficiálna prezentačná a podporná stránka aplikácií IbaJuraj Apps.

## Aplikácie

- Strážca Termínov – dostupný v App Store
- Lex Drive – dostupný v App Store
- Kalkulačka 2v1 – dostupná v App Store
- Peňaženka Kariet – vo vývoji

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

Hlavná stránka načítava aktuálnu aktívnu verziu z `standard.json` v autoritatívnom repozitári. HTML obsahuje iba fallback pre prípad nedostupnosti GitHub metadata endpointu.

Aktuálne finálne vydanie pri tejto aktualizácii webu je **1.6.0** (`standard-v1.6.0`). Jednotlivé aplikácie Standard adoptujú vlastným release procesom a nemusia všetky používať rovnakú verziu.

## Odkazy z aplikácií na podporu

Kontaktný formulár podporuje parametre `app`, `type` a nepovinný `subject`.

Príklad:
`https://ibajuraj.github.io/?app=lexdrive&type=technical&subject=Problém%20s%20vyhľadávaním#support`

Stabilné identifikátory aplikácií sú `strazca-terminov`, `lexdrive`, `jurajcalc`, `penazenka-kariet` a `general`. Podporované typy sú `question`, `technical`, `content`, `suggestion`, `privacy` a `other`.

## Publikovanie

Zmeny webu sa pripravujú na samostatnej vetve, skontrolujú sa a následne sa mergujú do `main` cez pull request. GitHub Pages publikuje obsah z koreňa vetvy `main`.

## Podpora

Kontaktný formulár používa Formspree. Telegram komunita je doplnkový komunikačný kanál; citlivé údaje sa nemajú posielať cez verejné komunikačné kanály.

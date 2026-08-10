# IbaJuraj Apps

Oficiálna prezentačná a podporná stránka aplikácií IbaJuraj Apps.

## Aplikácie

- Strážca Termínov – dostupný v App Store
- Lex Drive – dostupný v App Store
- Kalkulačka 2v1 – dostupná v App Store
- Peňaženka Kariet – vo vývoji

## Obsah repozitára

- `index.html` – hlavná responzívna stránka,
- `style.css` – desktop, tablet a mobilný dizajn,
- `script.js` – mobilná navigácia, predvyplnenie a odoslanie kontaktného formulára, tlačidlo späť hore a dynamická verzia IbaJuraj Application Standardu,
- `privacy.html` – zásady ochrany súkromia vrátane Peňaženky Kariet,
- `invite.html` – vstupná stránka pozvánok,
- `404.html` – vlastná chybová stránka,
- `assets/` – ikony aplikácií a webu.

## IbaJuraj Application Standard

Autoritatívnym zdrojom je samostatný repozitár:

https://github.com/IbaJuraj/ibajuraj-application-standard

Hlavná stránka načítava aktuálnu verziu štandardu z `standard.json` v autoritatívnom repozitári. Pri publikovaní novej verzie štandardu preto nie je potrebné ručne meniť číslo verzie na webe.

Aktuálna stabilná verzia pri tomto vydaní webu je **1.3.0**.

## Odkazy z aplikácií na podporu

Kontaktný formulár podporuje parametre `app`, `type` a nepovinný `subject`. Príklad:

`https://ibajuraj.github.io/?app=lexdrive&type=technical&subject=Problém%20s%20vyhľadávaním#support`

Podporované stabilné identifikátory aplikácií sú `strazca-terminov`, `lexdrive`, `jurajcalc`, `penazenka-kariet` a `general`. Podporované typy sú `question`, `technical`, `content`, `suggestion`, `privacy` a `other`.

## Podpora

Kontaktný formulár používa Formspree. Telegram komunita je doplnkový komunikačný kanál; citlivé údaje sa nemajú posielať cez verejné komunikačné kanály.

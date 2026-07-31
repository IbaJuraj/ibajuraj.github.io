# Správa IbaJuraj Application Standard

## Zdroj pravdy

Autoritatívna verzia je verzia publikovaná v spoločnom GitHub repozitári IbaJuraj. Kópie vložené do aplikácií slúžia na audit konkrétneho buildu a musia uvádzať verziu štandardu.

## Verzionovanie

Používa sa sémantické verzionovanie:

- PATCH – oprava formulácie bez zmeny významu,
- MINOR – nové spätne kompatibilné pravidlo alebo odporúčanie,
- MAJOR – zmena, ktorá vyžaduje migráciu aplikácií alebo mení záväzné správanie.

## Proces zmeny

1. návrh,
2. posúdenie dopadu na všetky aplikácie,
3. rozhodnutie MUST / SHOULD / MAY,
4. schválenie,
5. aktualizácia štandardu a changelogu,
6. audit a postupná adopcia aplikáciami.

## Automatizácia

Audit môže automaticky vytvoriť návrh, upozornenie alebo report. Nemôže bez schválenia zaviesť nové MUST pravidlo, zrušiť výnimku ani zmeniť produktovú architektúru.

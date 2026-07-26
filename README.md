# IbaJuraj Apps

Oficiálna prezentačná a podporná stránka aplikácií IbaJuraj Apps.

Stránka obsahuje:

- Strážca Termínov – dostupný v App Store,
- Lex Drive – pripravovaný právny projekt,
- Kalkulačku 2v1 – dostupnú v App Store,
- informácie o spôsobe vývoja a ochrane súkromia,
- kontaktný formulár a doplnkovú podporu cez Telegram.

Peňaženka Kariet je v tejto verzii webu zámerne skrytá.

## Publikovanie

Web je publikovaný prostredníctvom GitHub Pages:

https://ibajuraj.github.io/

## Nastavenie kontaktu pred publikovaním

V súbore `index.html` je potrebné nahradiť dve zástupné hodnoty:

1. `REPLACE_WITH_FORMSPREE_ID` – ID formulára vytvoreného v službe Formspree.
2. `REPLACE_WITH_TELEGRAM_GROUP` – verejný názov alebo odkaz Telegram skupiny.

Príklad:

```html
action="https://formspree.io/f/abcde123"
```

```html
href="https://t.me/ibajuraj_apps"
```

Bez nahradenia týchto hodnôt formulár ani Telegram odkaz nebudú pripravené na verejné používanie.

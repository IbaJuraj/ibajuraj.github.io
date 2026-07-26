# Dokončenie kontaktnej sekcie

Aktualizovaný web je pripravený na vloženie do repozitára, ale pred publikovaním treba doplniť dva skutočné odkazy.

## 1. Formspree

1. Vytvorte formulár v službe Formspree.
2. Skopírujte jeho ID alebo celý endpoint.
3. V `index.html` vyhľadajte:

   `REPLACE_WITH_FORMSPREE_ID`

4. Nahraďte ho skutočným ID.

Príklad:

`https://formspree.io/f/abcde123`

## 2. Telegram

1. Vytvorte Telegram skupinu.
2. Nastavte jej verejný názov alebo získajte pozývací odkaz.
3. V `index.html` vyhľadajte:

   `https://t.me/REPLACE_WITH_TELEGRAM_GROUP`

4. Nahraďte celý odkaz skutočným odkazom skupiny.

## 3. Súbory na GitHub

V koreňovom priečinku repozitára nahraďte:

- `index.html`
- `style.css`
- `README.md`

Súbor `SETUP.md` je iba pomocný a nemusí byť zverejnený.

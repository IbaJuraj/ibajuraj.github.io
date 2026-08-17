# Nastavenie a kontrola stránky

Pred každým vydaním webu skontrolujte, že:

1. endpoint Formspree v `index.html` je stále aktívny,
2. pozývací odkaz Telegramu je platný,
3. odkazy na aplikácie smerujú na ich aktuálne stránky v App Store,
4. `standard.json` v autoritatívnom repozitári obsahuje aktuálnu aktívnu verziu Standardu,
5. web netvrdí, že všetky aplikácie používajú najnovší Standard, pokiaľ to nie je overené,
6. stránka sa overila aspoň pri šírkach 320, 375, 768, 1024 a 1440 px,
7. funguje klávesnicová navigácia, mobilné menu, kontakt a základné focus stavy.

## Publikovanie

Produkčný GitHub Pages web používa vetvu `main` a koreň repozitára. Zmeny sa pripravujú na samostatnej vetve a do `main` sa dostávajú cez pull request po kontrole.

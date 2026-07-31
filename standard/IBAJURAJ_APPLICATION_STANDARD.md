# IbaJuraj Application Standard

**Verzia:** 1.0.0  
**Stav:** autoritatívny spoločný štandard  
**Platnosť od:** 31. júla 2026  
**Vlastník:** IbaJuraj

## 1. Účel

Tento štandard určuje spoločné produktové, UX, technické, obsahové, bezpečnostné a release pravidlá pre aplikácie IbaJuraj. Nevynucuje identický vzhľad ani rovnakú informačnú architektúru. Zabezpečuje, aby aplikácie pôsobili ako jedna rodina, boli dôveryhodné, prístupné, udržateľné a mali jednotnú podporu.

## 2. Hierarchia pravidiel

1. **IbaJuraj Application Standard** – spoločné pravidlá pre všetky aplikácie.
2. **Product Standard** – pravidlá konkrétnej aplikácie alebo domény.
3. **Architecture Decision Record (ADR)** – zdôvodnená technická výnimka alebo rozhodnutie.
4. **Build Scope** – konkrétny rozsah jedného buildu; nesmie meniť vyššie pravidlá bez schváleného návrhu.

Pri konflikte platí vyššia úroveň. Produktový štandard môže spoločné pravidlo rozšíriť, nie potichu obísť.

## 3. Záväznosť

- **MUST** – povinné; porušenie blokuje release alebo vyžaduje schválenú výnimku.
- **SHOULD** – odporúčané; odchýlka musí mať uvedený dôvod.
- **MAY** – voliteľné.

## 4. Spoločná identita

- MUST používať značku **IbaJuraj** ako spoločnú autorskú a produktovú identitu.
- MUST načítavať marketingovú verziu a build z autoritatívnych build nastavení alebo `Bundle`; nesmú byť ručne duplikované v používateľskom kóde.
- MUST používať jednotné verejné odkazy definované v `SUPPORT_AND_LINKS.md`.
- SHOULD zobrazovať názov aplikácie, verziu, build, web, ochranu súkromia a podporu v časti O aplikácii.

## 5. Produktové princípy

- MUST existovať jeden zdroj pravdy pre každý druh údajov.
- MUST byť jasné vlastníctvo údajov a životný cyklus objektu.
- MUST oddeliť identitu údajov od ich prezentácie.
- MUST zabrániť vzniku paralelnej architektúry pre rovnakú funkciu.
- SHOULD dodržiavať **Action over Information** – používateľ má dostať ďalší zmysluplný krok, nie iba pasívny údaj.
- SHOULD dodržiavať **3-sekundové pravidlo** – hlavný stav a najdôležitejšia akcia majú byť pochopiteľné približne do troch sekúnd.
- MUST predchádzať slepým koncom; prázdny alebo chybový stav má ponúknuť riešenie.
- SHOULD uprednostniť kontextovú akciu pred zbytočným presúvaním používateľa medzi obrazovkami.

## 6. Dizajn a UX

### 6.1 Spoločné roly, nie identické obrazovky

Aplikácie môžu mať rozdielny počet tabov, navigáciu, dashboard a doménové komponenty. Spoločné majú byť významy a kvalita základných prvkov:

- typografické roly,
- rozostupy a dotykové plochy,
- primárne a sekundárne akcie,
- informačné, varovné a kritické stavy,
- prázdne, chybové, načítavacie a offline stavy,
- Nastavenia, Pomoc a O aplikácii.

### 6.2 Povinné pravidlá

- MUST podporovať Dynamic Type bez straty obsahu alebo funkcie.
- MUST mať minimálnu dotykovú plochu 44 × 44 bodov pre interaktívne prvky.
- MUST nepoužívať farbu ako jediný nositeľ významu.
- MUST používať konkrétne názvy akcií; neurčité „Pokračovať“ alebo „OK“ iba tam, kde je výsledok jednoznačný.
- MUST pri deštruktívnej akcii pomenovať objekt a následok.
- SHOULD používať systémové komponenty Apple, ak produktová potreba nevyžaduje vlastné riešenie.
- SHOULD obmedziť veľké monolitické view súbory a deliť ich podľa zodpovedností.

## 7. Obsah a texty

- MUST používať zrozumiteľný jazyk a vysvetliť odborné pojmy.
- MUST pri chybe uviesť, čo sa stalo a čo môže používateľ urobiť.
- MUST lokalizovať všetky používateľské texty; právne citácie môžu mať osobitný režim.
- MUST kontrolovať prirodzenosť prekladu, nielen doslovnú správnosť.
- MUST formátovať čísla, meny, dátumy a jednotky podľa lokality.
- SHOULD uprednostniť krátke, konkrétne nadpisy pred marketingovými formuláciami.

## 8. Stavový model obrazoviek

Každá dátová obrazovka musí podľa potreby riešiť:

1. načítavanie,
2. obsah,
3. prázdny stav,
4. chybu,
5. neúplné alebo obmedzené údaje,
6. offline stav,
7. čakajúcu synchronizáciu.

Prázdna obrazovka bez vysvetlenia nie je platný stav.

## 9. Formuláre

- MUST jasne označiť povinné údaje a dôvod, prečo sú potrebné.
- MUST zobrazovať validáciu pri konkrétnom poli.
- MUST chrániť rozpracované údaje pred neúmyselnou stratou.
- MUST používať vhodnú klávesnicu, výber dátumu a formát vstupu.
- MUST po uložení jednoznačne potvrdiť výsledok.
- SHOULD meniť polia podľa typu objektu namiesto jedného univerzálneho formulára s nerelevantnými položkami.

## 10. Dáta, migrácie a kompatibilita

- MUST mať verziu dátovej schémy.
- MUST testovať aktualizáciu z verejne dostupnej App Store verzie, nie iba čistú inštaláciu.
- MUST mať migračný plán pre zmenu modelu.
- MUST zakázať tiché odstránenie nerozpoznaných alebo starších údajov.
- SHOULD poskytnúť obnovu alebo bezpečný fallback pri zlyhaní migrácie.
- MUST pri importe validovať typ, veľkosť, schému a dôveryhodnosť súboru.

## 11. Synchronizácia a zdieľanie

Ak aplikácia synchronizuje alebo zdieľa údaje, musí rozlišovať:

- lokálny stav,
- čakajúce zmeny,
- synchronizované,
- konflikt,
- chybu,
- offline stav.

Používateľ má dostať zrozumiteľný stav, napríklad počet čakajúcich zmien alebo čas poslednej synchronizácie. Konflikty sa nesmú riešiť tichou stratou údajov.

## 12. Súkromie a bezpečnosť

- MUST zdokumentovať, aké údaje nová funkcia spracúva, prečo, kde sa ukladajú a ako sa vymažú.
- MUST aktualizovať Privacy Manifest a zásady ochrany súkromia, ak sa zmení spracovanie údajov.
- MUST neukladať tajné kľúče, tokeny ani osobné údaje do repozitára alebo logov.
- MUST používať Keychain pre citlivé prihlasovacie údaje a tokeny.
- MUST validovať a podľa potreby kryptograficky overovať vzdialené balíky.
- MUST zobrazovať používateľovi diagnostické údaje pred ich odoslaním.
- MUST zakázať zdieľanie citlivých údajov cez verejnú Telegram skupinu.

## 13. Prístupnosť

Release kontrola musí overiť:

- VoiceOver názvy, hodnoty a poradie,
- Dynamic Type,
- kontrast,
- Reduce Motion,
- minimálne dotykové plochy,
- význam nezávislý iba od farby,
- ovládanie bez presných gest, ak existuje dostupnejšia alternatíva.

## 14. Vyhľadávanie

Ak aplikácia obsahuje vyhľadávanie:

- MUST tolerovať diakritiku a bežné varianty zápisu, ak to doména umožňuje.
- SHOULD podporovať dôvodné aliasy, skratky a synonymá.
- MUST mať užitočný prázdny výsledok s ďalším krokom.
- SHOULD vysvetliť, prečo výsledok zodpovedá dotazu.
- MUST testovať výkon nad realistickým objemom údajov.

## 15. Spoločné komponenty

Komponent sa môže zaradiť do IbaJuraj Foundation, keď:

1. používa sa najmenej v dvoch aplikáciách,
2. má rovnaký účel,
3. neobsahuje doménovú logiku,
4. je stabilný aspoň počas dvoch buildov,
5. zdieľanie zníži duplicitu bez obmedzenia produktu.

Kandidáti: identita aplikácie, odkazy podpory, dizajnové tokeny, settings riadky, stavové bannery, prázdne a chybové stavy, version footer.

## 16. Testovanie a definícia hotovej funkcie

Funkcia je hotová až keď má:

- správny používateľský tok,
- prázdny, chybový a načítavací stav,
- lokalizáciu,
- prístupnosť,
- automatické testy primerané riziku,
- migračný test, ak mení dáta,
- privacy kontrolu,
- aktualizovanú dokumentáciu a changelog.

Historické build testy nemajú byť trvalo naviazané na konkrétne číslo buildu, ak v skutočnosti testujú funkciu.

## 17. Release

Pred vydaním musí byť overené:

- zhoda verzie a buildu vo všetkých metadátach,
- čistý build a testy,
- migrácia z verejnej verzie,
- odkazy podpory a súkromia,
- lokalizácie a App Store texty,
- prístupnosť,
- Privacy Manifest,
- šifrovanie a exportné nastavenia,
- odstránenie `.DS_Store`, `__MACOSX`, tajomstiev a nepotrebných archívov z distribučného ZIP-u.

## 18. Živý štandard a návrhy zmien

Štandard sa môže priebežne rozširovať, ale nie nekontrolovane.

1. Audit nájde opakovaný vzor alebo nedostatok.
2. Vytvorí sa návrh v `Proposals/`.
3. Návrh uvedie dôvod, dotknuté aplikácie, migráciu a záväznosť.
4. Po schválení sa aktualizuje štandard, changelog a podľa možnosti automatická kontrola.

Automatický nástroj nesmie bez schválenia meniť povinné pravidlá.

## 19. Výnimky

Každá výnimka musí uviesť:

- pravidlo,
- dotknutú aplikáciu,
- dôvod,
- rozsah,
- podmienky bezpečného použitia,
- dátum revízie alebo podmienku ukončenia.

Výnimka sa eviduje v produktovom súbore `APP_STANDARD_ADOPTION.md` alebo ADR.

## 20. Produktové doplnky

- **Strážca Termínov:** Administrative Detail Framework, Agenda ako autoritatívny systém, Progressive Completion, Action over Information, No Dead Ends.
- **Lex Drive:** Trust before Intelligence, Situation before Law, Answer before Citation, overiteľnosť právneho zdroja, účinnosť právneho stavu a auditovateľnosť.

Tieto doplnky zostávajú produktovo špecifické a nesmú byť mechanicky prenášané medzi aplikáciami.

# Pokyny pro adresář `zaklady/`

Adresář obsahuje výukové úkoly o bezpečnosti (phishing, podvodné e-shopy, hesla,
bezpečné placení…). Každý úkol je samostatná složka se statickými stránkami
(`index.html`, `script.js`, `styles.css`) a obvykle s průvodcem `tour.js`.

## Průvodci (tour.js)

- Staví na **driver.js** z CDN (jsdelivr, verze připnutá na `@1`) a sdílejí vzhled
  ze souboru `zaklady/tour.css` (styly `zk-*`, bublina v rohu `zk-corner`,
  rámeček s vlajkou `zk-flag`, panel úkolu `zk-mission`).
- Vypínají se parametrem `?tour=0`.
- Ztmavení pozadí drž jemné (`overlayOpacity: 0.2`), ať stránka nepůsobí zamčeně.
- Úkol na více stránkách buď detekuje stránku podle DOM, nebo si drží stav
  v `sessionStorage`.
- **Průvodce studentovi vždy VYKÁ (3. os. mn. č., „Klikněte“, „Vyplňte“),
  nikdy netyká.** Platí i pro texty na stránkách úkolu.
- Texty drž **krátké a věcné**. Žádné dramatizování ani scénáře typu „pomoz X“;
  neutrální, formální oslovení.
- Varovné signály prezentuj jako „čeho si všimnout / co by mělo vzbudit
  pozornost“, ne jako jistý důkaz podvodu. Jeden signál ještě nic nedokazuje.
- **FLAG se ukazuje v závěrečném okně průvodce** (rámeček `zk-flag` + tlačítko
  Kopírovat), ne na stránce úkolu. Výjimka: úkoly, kde student hodnotu sám najde
  (např. rok v databázi ČOI) a zadá ji do platformy – tam ji průvodce
  neprozrazuje.

## Obsah a bezpečnost

- Scénáře a značky na funkčních stránkách jsou **fiktivní**. Skutečné firmy se
  objevují jen jako ukázka v podvodných e-mailech, ne jako funkční web, který bych
  stavěla pod jejich jménem (nenapodobovat reálné firmy). Výjimka na přání autorky:
  aplikace banky v `outlook/DPD/phone.js` má logo a název Smart Banky; nic nesbírá
  a slouží jen jako simulace uvnitř úkolu.
- Obrázky: fiktivní / volné (CC0) / ilustrační. Obličeje ber z
  `thispersondoesnotexist.com`; nikdy ne fotky skutečných lidí.
- Úkoly necílí na identifikaci ani vyhledání konkrétní reálné osoby.
- Texty jsou česky; relativní data převádět na absolutní.

## Technické

- Vstupní pole v úkolech dělej jako `type="search"` (+ `autocomplete="off"` a
  `data-*ignore` atributy), aby je nenabízeli správci hesel ani automatické
  vyplňování prohlížeče.
- Stránky jsou statické. Změny ověřuj spuštěním úkolu v prohlížeči
  (lokální http server + headless Edge).


## Poznámky k jednotlivým úkolům

- **outlook/** – cvičná schránka. Už NENÍ o označování e-mailů (ta funkce byla
  odstraněna); slouží jako vstup do úkolu o bazarovém podvodu, cílem je seznámit
  se s rizikem, ne vybírat bezpečnou cestu. Rámec: prodáváte kolo a přišlo
  několik odpovědí. Průvodce vede jen po podvodné cestě: **Stanislav** + návazný
  e-mail od **„DPD"** (= jeden podvod) tvrdí, že zaplatil „přes dopravce", a odkaz
  na „vyzvednutí" vede na `DPD/` = podvodná stránka chtějící kartu a kód z SMS.
  Student vyplní cvičnou kartu (během průvodce jiná neprojde) a v simulovaném
  telefonu (`DPD/phone.js`, podle Smart Banky od Monety) sám reaguje na žádost o potvrzení
  platby 5000 Kč místo slíbeného připsání. Zamítnutí nestačí, útočník má údaje dál:
  `FLAG(NaKartuNelzePoslatPenize)` je v závěrečném okně až po zablokování karty
  s důvodem „údaje získal někdo cizí" (jde i po potvrzení platby, jen se závěrem
  o ztracených penězích). **Jaromír** (dobírka) a
  **Lenka** (osobní odběr) jsou legitimní zprávy pro srovnání, bez odkazů.
  Odkaz na DPD se otevírá v nové záložce. Schránka má panel v rohu a popisky po
  otevření zprávy. Složka `bleskuryr/` už v úkolu není použitá (nic na ni nevede).
- **titaskin.com/** – podvodný e-shop; úkol na placení se chystá jako druhý
  průvodce přes parametr `?ukol=…`.
- **facebook/** – vstup do úkolu „Podvodný e-shop“ (kroky 1–2 ve vlastním
  `tour.js`, reklama vede na `../titaskin.com/index.html?ukol=podvod`, kde
  pokračují kroky 3–6). Písma jsou lokální v `fonts/`: Segoe UI ve variantě
  East European (West European nemá ě, ř, ů, ť, ď, ň) a výřez Material Symbols
  jen s použitými ikonami – novou ikonu je nutné přidat i do souboru s písmem.
- **telefon/** – simulátor telefonu, dva samostatné úkoly na jedné stránce,
  přepínané parametrem `?ukol=`: výchozí / `1` = smishing (podvodná SMS „GOV",
  přes falešnou bankovní identitu až na podvodnou přihlašovací stránku Monety),
  `2` = dvoufaktor (Aneta se snaží vylákat ověřovací kód,
  `FLAG(DvoufazoveOvereniNeniVse)`). V úkolu 1 průvodce FLAG **neprozrazuje** –
  student si má dohledat skutečnou doménu Monety (`moneta.cz`) a tu zadat do
  platformy jako FLAG (platforma musí očekávat tuto hodnotu; formát řeš v zadání,
  v průvodci se zadává jen doména ve tvaru `nazev.cz`). Na přihlašovací stránce
  průvodce nabízí volbu (přihlásit se × nepřihlásit a nahlásit); přihlášení je
  riziková volba bez FLAGu. Úkoly jsou nezávislé (řešitelné i s odstupem);
  úkol 1 nezpřístupňuje zprávy úkolu 2 – ty se ukážou jen při přímém vstupu
  `index.html?ukol=2` (tento odkaz patří do zadání druhého úkolu).

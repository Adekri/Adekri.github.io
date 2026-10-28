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
  stavěla pod jejich jménem (nenapodobovat reálné firmy).
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
  odstraněna); slouží jako vstup do úkolu o bezpečném placení (bazarový podvod).
  Z e-mailů vedou dvě cesty (odkazy se otevírají v nové záložce): `bleskuryr/`
  = bezpečná (jen číslo účtu, tady je `FLAG(NaKartuNelzePoslatPenize)`) a `DPD/`
  = podvodná (chce kartu; jen upozornění, FLAG tu NENÍ). Schránka je volné
  prohlížení s panelem v rohu a popisky po otevření zprávy.
- **titaskin.com/** – podvodný e-shop; úkol na placení se chystá jako druhý
  průvodce přes parametr `?ukol=…`.

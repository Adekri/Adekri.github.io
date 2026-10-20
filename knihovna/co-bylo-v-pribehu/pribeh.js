/*
 * ================================================================
 *  PŘÍBĚHY PRO HRU „Co bylo v příběhu?“
 * ================================================================
 *
 *  Tady se hra upravuje pro jinou povídku — nic jiného měnit není potřeba.
 *  Když je v seznamu víc příběhů, hra nabídne na začátku výběr.
 *
 *  Každý příběh má:
 *    nazev   – název (zobrazí se a přečte)
 *    ikona   – jeden velký obrázek (emoji)
 *    text    – text povídky pro předčítání (odstavce oddělte prázdným řádkem)
 *    otazky  – otázky v pořadí, jak půjdou za sebou
 *
 *  Typy otázek:
 *
 *    Bylo to v příběhu? (odpověď ANO / NE)
 *      { typ: 'byl', obrazek: '🦉', otazka: 'Byla v příběhu sova?', odpoved: true }
 *      volitelně: vysvetleni: 'Text, který zazní při špatné odpovědi.'
 *
 *    Výběr ze 2–4 obrázků (správný označte spravne: true)
 *      { typ: 'vyber', otazka: 'Co myška ztratila?', moznosti: [
 *          { obrazek: '📕', popisek: 'knížku', spravne: true },
 *          { obrazek: '🧀', popisek: 'sýr' } ] }
 *
 *    Seřazení obrázků (zapište je VE SPRÁVNÉM pořadí, hra je sama zamíchá)
 *      { typ: 'poradi', otazka: 'Seřaďte, co se stalo.', obrazky: [
 *          { obrazek: '😢', popisek: 'Knížka zmizela' }, … ] }
 *
 *  Obrázky se zadávají jako emoji (zkopírujte např. z https://openmoji.org).
 *  Hra je ukáže v kreslené podobě OpenMoji. Obrázky, které už hra používá,
 *  jsou uložené ve složce knihovna/obrazky/; nové se načtou z internetu.
 */

const PRIBEHY = [
    {
        nazev: 'Myška Šuška a ztracená knížka',
        ikona: '🐭',
        text: `Myška Šuška bydlela ve staré knihovně, v malé díře pod regálem s pohádkami. Každý večer, když paní knihovnice zhasla světla, vylezla Šuška ven a četla si. Nejraději měla knížku s červenými deskami. Byla v ní princezna a hodný drak.

Jednoho večera ale knížka na svém místě nebyla! Šuška ji hledala pod stolem, za květináčem i v koši na papíry. Nikde nic.

Tu přiletěla sova Hůhů, která bydlela na okně. „Proč jsi tak smutná, Šuško?“ zeptala se. „Ztratila se mi moje knížka s drakem,“ vzlykla myška.

Sova se rozhlédla svýma velkýma očima. „Vidím ji! Leží na stole u kočky.“ Myška se lekla. Kočka Micka spala stočená do klubíčka a hlavu měla položenou přímo na červené knížce.

Šuška se potichoučku připlížila, ale Micka otevřela jedno oko. „Neboj se,“ zamňoukala. „Já jen chtěla vědět, jak ta pohádka skončí. Ale neumím číst.“

A tak si od toho večera sedávají v knihovně spolu: myška čte nahlas, kočka poslouchá a sova svítí očima místo lampičky. A drak v knížce? Ten se vždycky nakonec s princeznou skamarádí.`,
        otazky: [
            { typ: 'byl', obrazek: '🐭', otazka: 'Byla v příběhu myška?', odpoved: true },
            { typ: 'byl', obrazek: '🐶', otazka: 'Byl v příběhu pejsek?', odpoved: false, vysvetleni: 'Pejsek v příběhu nebyl.' },
            { typ: 'byl', obrazek: '🦉', otazka: 'Byla v příběhu sova?', odpoved: true, vysvetleni: 'Sova tam byla! Jmenovala se Hůhů.' },
            { typ: 'byl', obrazek: '🐸', otazka: 'Byla v příběhu žába?', odpoved: false, vysvetleni: 'Žába v příběhu nebyla.' },
            { typ: 'vyber', otazka: 'Co myška ztratila?', moznosti: [
                { obrazek: '🧀', popisek: 'sýr' },
                { obrazek: '📕', popisek: 'knížku', spravne: true },
                { obrazek: '🔑', popisek: 'klíč' }
            ] },
            { typ: 'vyber', otazka: 'Jakou barvu měla knížka?', moznosti: [
                { obrazek: '🔵', popisek: 'modrou' },
                { obrazek: '🟢', popisek: 'zelenou' },
                { obrazek: '🔴', popisek: 'červenou', spravne: true }
            ] },
            { typ: 'vyber', otazka: 'Kdo myšce pomohl knížku najít?', moznosti: [
                { obrazek: '🦉', popisek: 'sova', spravne: true },
                { obrazek: '🐦', popisek: 'vrabec' },
                { obrazek: '🦔', popisek: 'ježek' }
            ] },
            { typ: 'vyber', otazka: 'Kdo spal na knížce?', moznosti: [
                { obrazek: '🐻', popisek: 'medvídek' },
                { obrazek: '🐱', popisek: 'kočka', spravne: true },
                { obrazek: '🐉', popisek: 'drak' }
            ] },
            { typ: 'poradi', otazka: 'Seřaďte obrázky, jak šly v příběhu za sebou.', obrazky: [
                { obrazek: '😢', popisek: 'Knížka zmizela' },
                { obrazek: '🦉', popisek: 'Sova ji našla' },
                { obrazek: '📖', popisek: 'Čtou si spolu' }
            ] }
        ]
    }
];

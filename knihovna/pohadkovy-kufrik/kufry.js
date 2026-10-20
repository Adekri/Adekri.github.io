/*
 * ================================================================
 *  KUFRY POHÁDKOVÝCH POSTAV
 * ================================================================
 *
 *  Každý kufr patří jedné postavě. Věci se vytahují postupně
 *  v pořadí, jak jsou zapsané — od nejtěžší nápovědy po nejlehčí.
 *
 *    majitel – jméno postavy (objeví se na visačce)
 *    obr     – obrázek postavy (emoji); když chybí, ukáže se jen jméno
 *    veci    – [obrázek, popisek] pro každou věc (3–5 věcí)
 *    veta    – krátká věta, která se ukáže po odhalení
 */

const KUFRY = [
    {
        majitel: 'Popelka', obr: '👸',
        veci: [['🧹', 'koště'], ['🫘', 'hrách k přebírání'], ['👗', 'plesové šaty'], ['👠', 'střevíček'], ['🌰', 'tři oříšky']],
        veta: 'Z kouzelných oříšků dostala Popelka šaty na ples.'
    },
    {
        majitel: 'Červená Karkulka', obr: '👧',
        veci: [['💐', 'kytička pro babičku'], ['🍰', 'bábovka'], ['🧺', 'košíček']],
        veta: 'Karkulka nesla nemocné babičce košíček s bábovkou.'
    },
    {
        majitel: 'Sněhurka', obr: '👸',
        veci: [['🎀', 'stužka'], ['🪮', 'hřeben'], ['⛏️', 'krumpáček od trpaslíků'], ['🍎', 'jablko']],
        veta: 'Zlá královna Sněhurce donesla stužku, hřeben i otrávené jablko.'
    },
    {
        majitel: 'Kocour v botách', obr: '🐈',
        veci: [['🎒', 'pytel'], ['🐇', 'zajíc pro krále'], ['🎩', 'klobouk'], ['👢', 'boty']],
        veta: 'Chytrý kocour nosil králi zajíce, které chytil do pytle.'
    },
    {
        majitel: 'Pinocchio', obr: '🤥',
        veci: [['📕', 'slabikář'], ['🪙', 'zlaťáky'], ['🔨', 'kladívko tatínka Geppetta'], ['🪵', 'poleno']],
        veta: 'Tatínek Geppetto vyřezal Pinocchia z polena. A když lhal, rostl mu nos!'
    },
    {
        majitel: 'Jeníček a Mařenka', obr: '👫',
        veci: [['🪨', 'bílé kamínky'], ['🍞', 'chleba na drobečky'], ['🍬', 'bonbon'], ['🍪', 'perníček']],
        veta: 'Jeníček a Mařenka našli v lese perníkovou chaloupku.'
    },
    {
        majitel: 'Vodník', obr: '🧜‍♂️',
        veci: [['🎀', 'barevné pentle'], ['🐸', 'žabka'], ['🐟', 'rybka'], ['🫖', 'hrníček s dušičkou']],
        veta: 'Vodník schovával pod hrníčky dušičky.'
    },
    {
        majitel: 'Medvídek Pú', obr: '🐻',
        veci: [['☂️', 'deštník'], ['🎈', 'balónek'], ['🐝', 'včelka'], ['🍯', 'hrnec medu']],
        veta: 'Medvídek Pú letěl na balónku pro med k včelám.'
    },
    {
        majitel: 'Krteček',
        veci: [['🍭', 'lízátko'], ['🚗', 'autíčko'], ['☂️', 'deštník'], ['👖', 'kalhotky s kapsami']],
        veta: 'Krteček si kalhotky s kapsami ušil s pomocí kamarádů.'
    },
    {
        majitel: 'Tři prasátka', obr: '🐷',
        veci: [['🌾', 'sláma'], ['🪵', 'dřevo'], ['🧱', 'cihly']],
        veta: 'Jen domeček z cihel vlk nesfoukl.'
    },
    {
        majitel: 'Princezna na hrášku', obr: '👸',
        veci: [['👑', 'korunka'], ['🛏️', 'postel s peřinami'], ['🫛', 'hrášek']],
        veta: 'Pravá princezna ucítila hrášek i přes dvacet peřin.'
    },
    {
        majitel: 'Šípková Růženka', obr: '👸',
        veci: [['👑', 'korunka'], ['🌹', 'růže'], ['🧵', 'vřeteno a nit']],
        veta: 'Růženka se píchla o vřeteno a celý zámek usnul na sto let.'
    }
];
